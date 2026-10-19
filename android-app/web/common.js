'use strict';

/* exported b64Unicode, encryptData, decryptData, createMasterPasswordRecord, verifyMasterPassword — используются из background/sync.js, options.js и popup.js */

/* ============================================================
   common.js — общие утилиты, шифрование, иконки, нормализация URL,
   извлечение доминирующего цвета, reconciliation паролей, tombstones.

   v6.6.0:
   - compressBackgroundDataUrl корректно работает и в SW, и в DOM,
     и в окружениях без OffscreenCanvas (не падает на document).
   - Добавлен helper _pickContrastColor.
   - _pruneTombstones защищён от отсутствия констант.
   ============================================================ */

async function fetchWithTimeout(url, options = {}, timeout = 10000, retries = 3) {
    let lastError;
    for (let i = 0; i < retries; i++) {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeout);
        try {
            const response = await fetch(url, { ...options, signal: controller.signal });
            clearTimeout(timer);
            return response;
        } catch (error) {
            clearTimeout(timer);
            lastError = error;
            if (i < retries - 1) await new Promise(r => setTimeout(r, 1000 * (i + 1)));
        }
    }
    throw lastError;
}

function classifyHttpError(error) {
    const status = error?.status;
    if (!status) return tbg('errNetOffline') + (error?.message || 'unknown');
    if (status === 401) return tbg('errAuth401');
    if (status === 403) return tbg('errForbidden403');
    if (status === 404) return tbg('errNotFound404');
    if (status === 409) return tbg('errConflict409');
    if (status === 429) return tbg('errTooMany429');
    if (status === 507) return tbg('errNoSpace507');
    if (status >= 500) return tbg('errServer5xx') + status;
    return 'HTTP ' + status;
}

function promisify(fn, thisArg, ...args) {
    return new Promise((resolve, reject) => {
        fn.call(thisArg || null, ...args, (result) => {
            const err = (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.lastError);
            if (err) reject(new Error(err.message));
            else resolve(result);
        });
    });
}

function bytesToBase64(bytes) {
    const chunkSize = 8192;
    let binary = '';
    for (let i = 0; i < bytes.length; i += chunkSize) {
        const chunk = bytes.subarray(i, i + chunkSize);
        binary += String.fromCharCode.apply(null, chunk);
    }
    return btoa(binary);
}

function base64ToBytes(b64) {
    const binary = atob(b64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
}

function b64Unicode(str) {
    return bytesToBase64(new TextEncoder().encode(str));
}

const _HTML_ESCAPE_MAP = {
    '&': '&amp;', '<': '&lt;', '>': '&gt;',
    '"': '&quot;', "'": '&#39;'
};
const _HTML_ESCAPE_RE = /[&<>"']/g;

function escapeHtml(s) {
    if (s == null) return '';
    return String(s).replace(_HTML_ESCAPE_RE, ch => _HTML_ESCAPE_MAP[ch]);
}

function safeHostname(url) {
    try { return new URL(url).hostname; }
    catch (e) { return ''; }
}

function getFaviconUrl(url) {
    const host = safeHostname(url);
    if (!host) return '';
    return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=64`;
}

/* Локальный источник favicon — прямая загрузка /favicon.ico
   с сайта. Не передаёт домены закладок третьим сторонам. */
function getLocalFaviconUrl(url) {
    try {
        const u = new URL(url);
        if (u.protocol !== 'http:' && u.protocol !== 'https:') return '';
        return u.origin + '/favicon.ico';
    } catch (e) {
        return '';
    }
}

/* Выбор источника favicon по настройке. 'local' не фолбэкает на
   Google — при недоступности иконки показывается буква домена. */
function resolveFaviconUrl(url, source) {
    if (source === 'local') return getLocalFaviconUrl(url);
    return getFaviconUrl(url);
}

function normalizeUrl(raw) {
    if (!raw || typeof raw !== 'string') return '';
    const s = raw.trim();
    if (!s) return '';

    if (/^[a-z][a-z0-9+.\-]*:\/\//i.test(s)) return s;

    if (/^(mailto|tel|sms|sms\+|callto|chrome|edge|opera|vivaldi|about|file|data|blob|view-source|chrome-extension|moz-extension|ws|wss):/i.test(s)) {
        return s;
    }

    if (s.startsWith('//')) return 'https:' + s;

    if (/^(localhost|127\.0\.0\.1|0\.0\.0\.0|\[::1\])(:\d+)?([\/?#]|$)/i.test(s)) {
        return 'http://' + s;
    }

    if (/^(10\.\d{1,3}\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3})(:\d+)?([\/?#]|$)/.test(s)) {
        return 'http://' + s;
    }

    const firstSeg = s.split(/[\/?#:]/)[0];
    if (/^[a-z0-9\-]+$/i.test(firstSeg)) return 'http://' + s;

    return 'https://' + s;
}

function reconcilePasswords(data) {
    if (!data || typeof data !== 'object') return data;

    const map = (data.folderPasswords && typeof data.folderPasswords === 'object')
        ? { ...data.folderPasswords }
        : {};

    const folders = Array.isArray(data.folders) ? data.folders : [];
    const noteFolders = Array.isArray(data.noteFolders) ? data.noteFolders : [];

    const validKeys = new Set();

    const process = (items, prefix) => {
        for (const item of items) {
            if (!item || !item.id) continue;
            const key = `${prefix}_${item.id}`;
            validKeys.add(key);

            const fromMap = typeof map[key] === 'string' ? map[key] : '';
            const fromObj = typeof item.password === 'string' ? item.password : '';
            const resolved = fromMap || fromObj;

            if (resolved) {
                map[key] = resolved;
                item.password = resolved;
            } else {
                delete map[key];
                item.password = '';
            }
        }
    };

    process(folders, 'tile');
    process(noteFolders, 'note');

    for (const key of Object.keys(map)) {
        if (!validKeys.has(key)) delete map[key];
    }

    data.folderPasswords = map;
    return data;
}

function addTombstone(data, id) {
    if (!id) return;
    if (!data.tombstones || typeof data.tombstones !== 'object') {
        data.tombstones = {};
    }
    data.tombstones[id] = Date.now();
    _pruneTombstones(data.tombstones);
}

function mergeTombstones(local, server) {
    const merged = {};
    const allKeys = new Set([
        ...Object.keys(local || {}),
        ...Object.keys(server || {})
    ]);
    for (const k of allKeys) {
        const lv = local?.[k] || 0;
        const sv = server?.[k] || 0;
        merged[k] = Math.max(lv, sv);
    }
    _pruneTombstones(merged);
    return merged;
}

function _pruneTombstones(tombstones) {
    const now = Date.now();
    const ttl = (typeof TOMBSTONE_TTL_MS !== 'undefined') ? TOMBSTONE_TTL_MS : 90 * 24 * 60 * 60 * 1000;
    const max = (typeof TOMBSTONE_MAX !== 'undefined') ? TOMBSTONE_MAX : 1000;
    const cutoff = now - ttl;

    const entries = Object.entries(tombstones).filter(([, ts]) => ts >= cutoff);
    entries.sort((a, b) => b[1] - a[1]);

    const kept = entries.slice(0, max);

    for (const k of Object.keys(tombstones)) delete tombstones[k];
    for (const [k, ts] of kept) tombstones[k] = ts;
}

function filterDeleted(items, tombstones) {
    if (!items || !items.length) return items || [];
    if (!tombstones || !Object.keys(tombstones).length) return items;

    return items.filter(item => {
        const delTs = tombstones[item.id];
        if (!delTs) return true;
        const itemTs = item.updatedAt || item.createdAt || 0;
        return itemTs > delTs;
    });
}

/* ============================================================
   Сжатие фонов. Работает и в SW, и в DOM, и без OffscreenCanvas.
   ============================================================ */

function _createCanvas(w, h) {
    if (typeof OffscreenCanvas !== 'undefined') {
        try {
            return new OffscreenCanvas(w, h);
        } catch (e) { /* fallthrough */ }
    }
    if (typeof document !== 'undefined' && document.createElement) {
        const c = document.createElement('canvas');
        c.width = w;
        c.height = h;
        return c;
    }
    return null;
}

async function compressBackgroundDataUrl(dataUrl) {
    if (!dataUrl || typeof dataUrl !== 'string' || !dataUrl.startsWith('data:')) return dataUrl;

    const maxBytes = (typeof SYNC_BG_MAX_BYTES !== 'undefined') ? SYNC_BG_MAX_BYTES : 600 * 1024;
    const quality = (typeof SYNC_BG_JPEG_QUALITY !== 'undefined') ? SYNC_BG_JPEG_QUALITY : 0.8;

    if (dataUrl.startsWith('data:image/jpeg') && dataUrl.length < maxBytes * 1.4) {
        return dataUrl;
    }

    try {
        if (typeof createImageBitmap !== 'function') return dataUrl;

        const resp = await fetch(dataUrl);
        const blob = await resp.blob();
        const bitmap = await createImageBitmap(blob);

        const maxDim = 1920;
        let w = bitmap.width, h = bitmap.height;
        if (w > maxDim || h > maxDim) {
            const k = maxDim / Math.max(w, h);
            w = Math.round(w * k);
            h = Math.round(h * k);
        }

        const canvas = _createCanvas(w, h);
        if (!canvas) {
            if (typeof bitmap.close === 'function') bitmap.close();
            return dataUrl;
        }

        const ctx = canvas.getContext('2d');
        if (!ctx) {
            if (typeof bitmap.close === 'function') bitmap.close();
            return dataUrl;
        }
        ctx.drawImage(bitmap, 0, 0, w, h);
        if (typeof bitmap.close === 'function') bitmap.close();

        let outBlob;
        if (typeof canvas.convertToBlob === 'function') {
            outBlob = await canvas.convertToBlob({ type: 'image/jpeg', quality });
        } else if (typeof canvas.toBlob === 'function') {
            outBlob = await new Promise(res => canvas.toBlob(res, 'image/jpeg', quality));
        } else {
            return dataUrl;
        }

        if (!outBlob) return dataUrl;
        if (outBlob.size > maxBytes) {
            const scale = Math.sqrt(maxBytes / outBlob.size);
            const r = await _recompress(canvas, scale);
            return r || dataUrl;
        }

        return await _blobToDataUrl(outBlob);
    } catch (e) {
        return dataUrl;
    }
}

async function _recompress(canvas, scale) {
    try {
        const w = Math.max(1, Math.round(canvas.width * scale));
        const h = Math.max(1, Math.round(canvas.height * scale));

        const c2 = _createCanvas(w, h);
        if (!c2) return null;

        const ctx = c2.getContext('2d');
        if (!ctx) return null;
        ctx.drawImage(canvas, 0, 0, w, h);

        let blob;
        if (typeof c2.convertToBlob === 'function') {
            blob = await c2.convertToBlob({ type: 'image/jpeg', quality: 0.7 });
        } else if (typeof c2.toBlob === 'function') {
            blob = await new Promise(r => c2.toBlob(r, 'image/jpeg', 0.7));
        } else {
            return null;
        }
        if (!blob) return null;
        return await _blobToDataUrl(blob);
    } catch (e) {
        return null;
    }
}

function _blobToDataUrl(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

/* ============================================================
   Извлечение доминирующего цвета
   ============================================================ */

function _loadImageSafe(src) {
    if (src.startsWith('data:')) {
        return _loadImageElement(src, false);
    }

    return new Promise(async (resolve) => {
        const img1 = await _loadImageElement(src, true);
        if (img1) return resolve(img1);

        try {
            /* Таймаут обязателен: без сети fetch виснет бесконечно
               и блокирует сохранение плитки (авто-цвет) */
            const resp = await fetchWithTimeout(src, {}, 5000, 1);
            if (!resp.ok) return resolve(null);
            const blob = await resp.blob();
            const blobUrl = URL.createObjectURL(blob);
            const img2 = await _loadImageElement(blobUrl, false);
            URL.revokeObjectURL(blobUrl);
            resolve(img2);
        } catch (e) {
            resolve(null);
        }
    });
}

function _loadImageElement(src, crossOrigin) {
    return new Promise((resolve) => {
        let resolved = false;
        const done = (img) => { if (!resolved) { resolved = true; resolve(img); } };

        const img = new Image();
        if (crossOrigin) img.crossOrigin = 'anonymous';

        const timer = setTimeout(() => {
            img.onload = null;
            img.onerror = null;
            done(null);
        }, 5000);

        img.onload = () => { clearTimeout(timer); done(img); };
        img.onerror = () => { clearTimeout(timer); done(null); };
        img.src = src;
    });
}

async function extractDominantColor(imageUrl, fallback = '#4CAF50') {
    if (!imageUrl || typeof imageUrl !== 'string') return fallback;
    if (typeof document === 'undefined') return fallback;

    const img = await _loadImageSafe(imageUrl);
    if (!img) return fallback;

    try {
        const size = 32;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) return fallback;

        ctx.drawImage(img, 0, 0, size, size);
        const data = ctx.getImageData(0, 0, size, size).data;

        let r = 0, g = 0, b = 0, count = 0;

        for (let i = 0; i < data.length; i += 4) {
            const a = data[i + 3];
            if (a < 128) continue;
            const pr = data[i], pg = data[i + 1], pb = data[i + 2];
            const brightness = (pr + pg + pb) / 3;
            if (brightness > 240 || brightness < 15) continue;
            r += pr; g += pg; b += pb; count++;
        }

        if (count === 0) {
            for (let i = 0; i < data.length; i += 4) {
                if (data[i + 3] < 128) continue;
                r += data[i]; g += data[i + 1]; b += data[i + 2]; count++;
            }
        }

        if (count === 0) return fallback;

        r = Math.round(r / count);
        g = Math.round(g / count);
        b = Math.round(b / count);

        return '#' + [r, g, b]
            .map(v => v.toString(16).padStart(2, '0'))
            .join('');
    } catch (e) {
        return fallback;
    }
}

/* ============================================================
   Подбор контрастного цвета (WCAG relative luminance)
   ============================================================ */

function _pickContrastColor(hex) {
    if (!hex || typeof hex !== 'string') return '#e0e0e0';
    if (hex === '#000' || hex === '#000000') return '#ffffff';
    if (hex === '#fff' || hex === '#ffffff') return '#000000';
    if (hex.includes('gradient')) return '#ffffff';

    const m = hex.replace('#', '').match(/^([0-9a-f]{3}|[0-9a-f]{6})$/i);
    if (!m) return '#e0e0e0';

    let r, g, b;
    if (m[1].length === 3) {
        r = parseInt(m[1][0] + m[1][0], 16);
        g = parseInt(m[1][1] + m[1][1], 16);
        b = parseInt(m[1][2] + m[1][2], 16);
    } else {
        r = parseInt(m[1].slice(0, 2), 16);
        g = parseInt(m[1].slice(2, 4), 16);
        b = parseInt(m[1].slice(4, 6), 16);
    }

    const toLin = (c) => {
        c /= 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    };
    const lum = 0.2126 * toLin(r) + 0.7152 * toLin(g) + 0.0722 * toLin(b);
    return lum > 0.5 ? '#000000' : '#ffffff';
}

/* ============================================================
   Шифрование AES-GCM + PBKDF2
   ============================================================ */

/* Новые записи используют 310k итераций (OWASP-рекомендация для
   PBKDF2-HMAC-SHA256). Старые записи без поля iterations читаются с 100k. */
const PBKDF2_ITERATIONS = 100000;      // legacy-записи
const PBKDF2_ITERATIONS_V2 = 310000;   // новые записи
const SALT_LEN = 16;
const IV_LEN = 12;

/* Constant-time сравнение hex-строк */
function timingSafeEqualHex(a, b) {
    const sa = String(a || '');
    const sb = String(b || '');
    let diff = sa.length ^ sb.length;
    const n = Math.max(sa.length, sb.length);
    for (let i = 0; i < n; i++) {
        diff |= (sa.charCodeAt(i % sa.length || 0) || 0) ^ (sb.charCodeAt(i % sb.length || 0) || 0);
    }
    return diff === 0;
}

async function deriveKey(password, salt, iterations) {
    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
        'raw', enc.encode(password), 'PBKDF2', false, ['deriveKey']
    );
    return crypto.subtle.deriveKey(
        { name: 'PBKDF2', salt, iterations: iterations || PBKDF2_ITERATIONS, hash: 'SHA-256' },
        keyMaterial, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']
    );
}

async function encryptData(data, password) {
    const salt = crypto.getRandomValues(new Uint8Array(SALT_LEN));
    const iv = crypto.getRandomValues(new Uint8Array(IV_LEN));
    const key = await deriveKey(password, salt);
    const plaintext = new TextEncoder().encode(JSON.stringify(data));
    const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, plaintext);
    return {
        v: 3,
        salt: bytesToBase64(salt),
        iv: bytesToBase64(iv),
        data: bytesToBase64(new Uint8Array(ciphertext))
    };
}

async function decryptData(payload, password) {
    if (!payload || !payload.salt || !payload.iv || !payload.data) {
        throw new Error(tbg('errCryptoFormat'));
    }
    const salt = base64ToBytes(payload.salt);
    const iv = base64ToBytes(payload.iv);
    const ciphertext = base64ToBytes(payload.data);
    const key = await deriveKey(password, salt);
    const plaintext = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext);
    return JSON.parse(new TextDecoder().decode(plaintext));
}

/* ---------- Мастер-пароль ---------- */

/* Constant-time сравнение, количество итераций берётся из записи */

/* ============================================================
   Пароли папок — только хэши.

   В folderPasswords и в поле password сущности лежит строка вида
   "pbkdf2$<iterations>$<saltB64>$<hashHex>".
   Легаси-plaintext значения мигрируются через
   migrateFolderPasswordHashes() при загрузке данных.
   ============================================================ */

const FOLDER_PWD_PREFIX = 'pbkdf2$';

async function hashFolderPassword(password) {
    const salt = crypto.getRandomValues(new Uint8Array(SALT_LEN));
    const keyMaterial = await crypto.subtle.importKey(
        'raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']
    );
    const bits = await crypto.subtle.deriveBits(
        { name: 'PBKDF2', salt, iterations: PBKDF2_ITERATIONS_V2, hash: 'SHA-256' },
        keyMaterial, 256
    );
    const hashHex = Array.from(new Uint8Array(bits)).map(b => b.toString(16).padStart(2, '0')).join('');
    return `${FOLDER_PWD_PREFIX}${PBKDF2_ITERATIONS_V2}$${bytesToBase64(salt)}$${hashHex}`;
}

/* Проверка введённого пароля против сохранённой записи.
   Легаси-plaintext значения сравниваются напрямую (и мигрируются
   через migrateFolderPasswordHashes при загрузке данных). */
async function verifyFolderPassword(password, stored) {
    if (!stored) return false;
    if (!String(stored).startsWith(FOLDER_PWD_PREFIX)) {
        return timingSafeEqualHex(String(password), String(stored));
    }
    const parts = String(stored).split('$');
    if (parts.length !== 4) return false;
    const iterations = parseInt(parts[1], 10) || PBKDF2_ITERATIONS;
    let salt;
    try { salt = base64ToBytes(parts[2]); } catch (e) { return false; }
    const keyMaterial = await crypto.subtle.importKey(
        'raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']
    );
    const bits = await crypto.subtle.deriveBits(
        { name: 'PBKDF2', salt, iterations, hash: 'SHA-256' },
        keyMaterial, 256
    );
    const hashHex = Array.from(new Uint8Array(bits)).map(b => b.toString(16).padStart(2, '0')).join('');
    return timingSafeEqualHex(hashHex, parts[3]);
}

/* Миграция: plaintext-пароли папок → pbkdf2-хэши.
   Мутирует data (folderPasswords + password на сущностях).
   Возвращает true, если что-то изменилось. */
async function migrateFolderPasswordHashes(data) {
    if (!data || typeof data !== 'object') return false;
    const map = (data.folderPasswords && typeof data.folderPasswords === 'object') ? data.folderPasswords : {};
    let changed = false;

    for (const key of Object.keys(map)) {
        const v = map[key];
        if (typeof v === 'string' && v && !v.startsWith(FOLDER_PWD_PREFIX)) {
            map[key] = await hashFolderPassword(v);
            changed = true;
        }
    }
    data.folderPasswords = map;

    const lists = [
        ['folders', 'tile'],
        ['noteFolders', 'note']
    ];
    for (const [listKey, prefix] of lists) {
        const arr = data[listKey];
        if (!Array.isArray(arr)) continue;
        for (const item of arr) {
            if (!item || !item.id) continue;
            const mapped = map[`${prefix}_${item.id}`];
            if (typeof item.password === 'string' && item.password && !item.password.startsWith(FOLDER_PWD_PREFIX)) {
                if (mapped && mapped.startsWith(FOLDER_PWD_PREFIX)) {
                    item.password = mapped;
                } else {
                    item.password = await hashFolderPassword(item.password);
                    map[`${prefix}_${item.id}`] = item.password;
                }
                changed = true;
            } else if (mapped) {
                item.password = mapped;
            }
        }
    }
    return changed;
}

/* ---------- SVG-иконки ---------- */

/* ---------- Обратная связь ---------- */

const _BTN_FEEDBACK_SELECTOR = [
    'button', '.icon-button', '.row-btn', '.action-button',
    '.folder-tab', '.note-folder-tab', '.note-item', '.bg-actions button',
    '.context-menu-item', '.toggle-pass', '.load-more',
    '.add-folder-button', '.add-note-folder-button',
    '.note-delete', '.bg-item',
    '.data-table .row-btn', '.sync-mode-btn',
    '.sync-actions-row .action-button', '.form-actions button'
].join(',');

let _btnFeedbackAttached = false;

function attachButtonFeedback(root = document) {
    if (_btnFeedbackAttached) return;
    _btnFeedbackAttached = true;
    const target = root || document;

    target.addEventListener('pointerdown', (e) => {
        const btn = e.target.closest(_BTN_FEEDBACK_SELECTOR);
        if (!btn || btn.disabled) return;
        btn.classList.add('btn-pressing');
        setTimeout(() => btn.classList.remove('btn-pressing'), 120);
    }, true);

    target.addEventListener('click', (e) => {
        const btn = e.target.closest(_BTN_FEEDBACK_SELECTOR);
        if (!btn || btn.disabled) return;
        _applyPressedAnimation(btn);
    }, true);
}

function _applyPressedAnimation(btn) {
    btn.classList.remove('pressed', 'btn-feedback-pressed');
    void btn.offsetWidth;
    btn.classList.add('pressed');
    setTimeout(() => btn.classList.remove('pressed'), 320);
}

function flashButtonFeedback(btn, result = null) {
    if (!btn) return;
    btn.classList.remove('pressed', 'flash-success', 'flash-error', 'shake', 'btn-pressing');
    void btn.offsetWidth;
    if (result === 'success') btn.classList.add('flash-success');
    else if (result === 'error') btn.classList.add('flash-error', 'shake');
    else btn.classList.add('pressed');
    setTimeout(() => {
        btn.classList.remove('pressed', 'flash-success', 'flash-error', 'shake', 'btn-pressing');
    }, 900);
}

function setButtonLoading(btn, loading) {
    if (!btn) return;
    btn.classList.toggle('loading', !!loading);
    btn.disabled = !!loading;
}

/* v6.9.0: мультиязычность.
   Язык по умолчанию — язык браузера; если он не поддерживается
   или не определён — английский. */
function resolveUILanguage(forced) {
    const dict = (typeof translations !== 'undefined') ? translations : null;
    if (forced && forced !== 'auto' && dict && dict[forced]) return forced;
    const nav = (typeof navigator !== 'undefined' && navigator.language)
        ? String(navigator.language).split('-')[0].toLowerCase() : '';
    return (dict && dict[nav]) ? nav : 'en';
}

function translateKey(lang, key) {
    const dict = (typeof translations !== 'undefined') ? translations : null;
    return (dict && dict[lang] && dict[lang][key])
        || (dict && dict.en && dict.en[key])
        || key;
}

/* v6.9.2: форматированный перевод с плейсхолдерами {name} */
function tf(lang, key, vars) {
    const s = translateKey(lang, key);
    if (!vars) return s;
    return s.replace(/\{(\w+)\}/g, (m, k) => (vars[k] != null ? String(vars[k]) : m));
}

/* v6.9.2: перевод для service worker/фонового контекста.
   Язык: self._uiLang (выставляется background.js из настроек) → navigator → en. */
function tbg(key, vars) {
    let lang = (typeof self !== 'undefined' && self._uiLang) || '';
    if (!lang) {
        const nav = (typeof navigator !== 'undefined' && navigator.language)
            ? String(navigator.language).split('-')[0].toLowerCase() : '';
        const dict = (typeof translations !== 'undefined') ? translations : null;
        lang = (dict && dict[nav]) ? nav : 'en';
    }
    return tf(lang, key, vars);
}

/* v6.9.2: перевод для страниц по document.documentElement.lang (его ставит applyI18n) */
function tui(key, vars) {
    const lang = (typeof document !== 'undefined' && document.documentElement && document.documentElement.lang) || 'en';
    return tf(lang, key, vars);
}

function applyI18n(lang, root) {
    if (typeof document === 'undefined') return;
    const scope = root || document;
    scope.querySelectorAll('[data-i18n]').forEach(el => {
        el.textContent = translateKey(lang, el.getAttribute('data-i18n'));
    });
    scope.querySelectorAll('[data-i18n-ph]').forEach(el => {
        el.placeholder = translateKey(lang, el.getAttribute('data-i18n-ph'));
    });
    scope.querySelectorAll('[data-i18n-title]').forEach(el => {
        el.title = translateKey(lang, el.getAttribute('data-i18n-title'));
    });
    scope.querySelectorAll('[data-i18n-aria]').forEach(el => el.setAttribute('aria-label', translateKey(lang, el.getAttribute('data-i18n-aria'))));
    if (typeof AndroidHost !== 'undefined' && AndroidHost.setUiTranslations) {
        const messages={}; for (const key of ['ok','cancel','fileSaved','fileSaveError','filePending','noLinkApp']) messages[key]=translateKey(lang,key);
        AndroidHost.setUiTranslations(JSON.stringify(messages));
    }
    if (document.documentElement) {
        document.documentElement.lang = lang;
        document.documentElement.dir = (lang === 'ar') ? 'rtl' : 'ltr';
    }
}

if (typeof self !== 'undefined') {
    self.resolveUILanguage = resolveUILanguage;
    self.tf = tf;
    self.tbg = tbg;
    self.tui = tui;
    self.translateKey = translateKey;
    self.applyI18n = applyI18n;
    self.promisify = promisify;
    self.normalizeUrl = normalizeUrl;
    self.extractDominantColor = extractDominantColor;
    self.bytesToBase64 = bytesToBase64;
    self.base64ToBytes = base64ToBytes;
    self.getLocalFaviconUrl = getLocalFaviconUrl;
    self.resolveFaviconUrl = resolveFaviconUrl;
    self.hashFolderPassword = hashFolderPassword;
    self.verifyFolderPassword = verifyFolderPassword;
    self.migrateFolderPasswordHashes = migrateFolderPasswordHashes;
    self.timingSafeEqualHex = timingSafeEqualHex;
    self.PBKDF2_ITERATIONS_V2 = PBKDF2_ITERATIONS_V2;
    
    self.attachButtonFeedback = attachButtonFeedback;
    self.flashButtonFeedback = flashButtonFeedback;
    self.setButtonLoading = setButtonLoading;
    self.reconcilePasswords = reconcilePasswords;
    self.addTombstone = addTombstone;
    self.mergeTombstones = mergeTombstones;
    self.filterDeleted = filterDeleted;
    self.compressBackgroundDataUrl = compressBackgroundDataUrl;
    self.escapeHtml = escapeHtml;
    self.getFaviconUrl = getFaviconUrl;
    self.safeHostname = safeHostname;
    self.fetchWithTimeout = fetchWithTimeout;
    self.classifyHttpError = classifyHttpError;
    self._pickContrastColor = _pickContrastColor;
}
if (typeof window !== 'undefined') {
    window.resolveUILanguage = resolveUILanguage;
    window.tf = tf;
    window.tbg = tbg;
    window.tui = tui;
    window.translateKey = translateKey;
    window.applyI18n = applyI18n;
    window.promisify = promisify;
    window.normalizeUrl = normalizeUrl;
    window.extractDominantColor = extractDominantColor;
    
    window.attachButtonFeedback = attachButtonFeedback;
    window.flashButtonFeedback = flashButtonFeedback;
    window.setButtonLoading = setButtonLoading;
    window.reconcilePasswords = reconcilePasswords;
    window.addTombstone = addTombstone;
    window.mergeTombstones = mergeTombstones;
    window.filterDeleted = filterDeleted;
    window.compressBackgroundDataUrl = compressBackgroundDataUrl;
    window.escapeHtml = escapeHtml;
    window._pickContrastColor = _pickContrastColor;
    window.getFaviconUrl = getFaviconUrl;
    window.getLocalFaviconUrl = getLocalFaviconUrl;
    window.resolveFaviconUrl = resolveFaviconUrl;
    window.hashFolderPassword = hashFolderPassword;
    window.verifyFolderPassword = verifyFolderPassword;
    window.migrateFolderPasswordHashes = migrateFolderPasswordHashes;
    window.timingSafeEqualHex = timingSafeEqualHex;
}
// Zero opacity is a valid setting.
function percentValue(value, fallback = 100) {
 const n = Number(value);
 return value == null || !Number.isFinite(n) ? fallback : Math.max(0, Math.min(100, n));
}
