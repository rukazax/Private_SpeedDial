'use strict';

/* ============================================================
   pro-tools.js — доработки v6.12.0
   - фон-снимок сайта: поштучно, по папке, для выделенных
   - поиск по адресу, имени папки и типу ресурса
   - мультивыбор плиток и групповые действия
   - «Уборка»: дубли по нормализованному URL, битые заголовки,
     пустые папки, повреждённые имена
   - полный бэкап и восстановление JSON
   - санитайзер данных при старте

   Теги удалены полностью: поля tags в интерфейсе нет,
   плитки сохраняются с пустым массивом ради совместимости схемы.
   ============================================================ */

(function () {
    const PRO = { version: '6.12.2' };
    window.PSPro = PRO;

    const app = () => window._speedDial;
    let _lastScan = null;

    /* ---------------- утилиты ---------------- */

    const TYPE_RULES = [
        ['код', /github|gitlab|bitbucket|sourceforge|code\.google|npmjs|pypi|codepen/],
        ['видео', /youtube|youtu\.be|vimeo|rutube|twitch/],
        ['статья', /habr|geektimes|mysku|vc\.ru|dzen|pikabu|livejournal|blogspot|medium|reddit/],
        ['форум', /forum|board|club|community|vrtp|drive2|forumhouse|stackexchange|stackoverflow/],
        ['магазин', /aliexpress|alibaba|ebay|amazon|ozon|avito|market\.yandex|wildberries|goods|shop|store|kupit/],
        ['справка', /wikipedia|wikihow|\.wiki|garant|consultant/],
        ['карта', /rosreestr|etomesto|maps|2gis|openstreetmap/],
        ['документ', /\.pdf($|\?)/i]
    ];

    PRO.classify = function (url) {
        const u = String(url || '').toLowerCase();
        for (const [name, re] of TYPE_RULES) {
            if (re.test(u)) return name;
        }
        return 'сайт';
    };

    /* Нормализация URL для поиска дублей:
       схема, www, завершающий слэш, трекинг-параметры и якорь не учитываются */
    PRO.normUrl = function (raw) {
        if (!raw) return '';
        const s = String(raw).trim();
        try {
            const u = new URL(s);
            const host = u.hostname.toLowerCase().replace(/^www\./, '');
            const path = ('/' + u.pathname.replace(/^\/+|\/+$/g, '')).replace(/\/$/, '') || '/';
            const drop = /^(utm_[a-z]+|fbclid|gclid|yclid|_openstat|mc_eid|ref)$/i;
            const params = [...u.searchParams.entries()]
                .filter(([k]) => !drop.test(k))
                .map(([k, v]) => `${k}=${v}`)
                .sort()
                .join('&');
            return host + path + (params ? '?' + params : '');
        } catch (e) {
            return s.toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/$/, '');
        }
    };

    PRO.hostOf = function (url) {
        try { return new URL(url).hostname.replace(/^www\./, ''); } catch (e) { return ''; }
    };

    const esc = s => String(s == null ? '' : s)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

    const folderName = (a, id) => {
        const f = (a.folders || []).find(x => x.id === id);
        return f ? f.name : '';
    };

    function whenReady(cb, tries) {
        tries = tries || 0;
        const a = app();
        if (a && a._initialized && Array.isArray(a.folders) && Array.isArray(a.tiles)) return cb(a);
        if (tries > 100) return;
        setTimeout(() => whenReady(cb, tries + 1), 300);
    }
    PRO.whenReady = whenReady;

    /* ---------------- снимок сайта как фон ---------------- */

    /* mShots: без ключа и регистрации. Первый запрос может отдать заглушку,
       повторный — готовый кадр. Адрес страницы уходит внешнему сервису,
       поэтому включение всегда осознанное. */
    PRO.screenshotUrl = function (url, w, h, bust) {
        const width = w || 600;
        const height = h || 400;
        let out = 'https://s0.wp.com/mshots/v1/' + encodeURIComponent(url) + `?w=${width}&h=${height}`;
        if (bust) out += '&v=' + Date.now();
        return out;
    };

    PRO.parseShot = function (bgImage) {
        if (!bgImage || !String(bgImage).includes('mshots')) return null;
        const m = String(bgImage).match(/[?&]w=(\d+)/);
        const n = String(bgImage).match(/[?&]h=(\d+)/);
        return { width: m ? +m[1] : 600, height: n ? +n[1] : 400 };
    };

    function shotSize() {
        const w = parseInt(localStorage.getItem('sd_shot_w') || '0', 10) || 600;
        return { w, h: Math.round(w * 2 / 3) };
    }
    PRO.setShotSize = function (w) {
        localStorage.setItem('sd_shot_w', String(w));
    };
    PRO.getShotSize = shotSize;

    PRO.makeShotFor = async function (a, ids, w, h, bust) {
        const set = new Set(ids);
        const size = (w && h) ? { w, h } : shotSize();
        let n = 0;
        (a.tiles || []).forEach(t => {
            if (!set.has(t.id)) return;
            if (!/^https?:\/\//i.test(t.url || '')) return;
            t.bgImage = PRO.screenshotUrl(t.url, size.w, size.h, bust);
            if (!t.bgColor) t.bgColor = a.settings?.tileBgDefault || '#4CAF50';
            t.updatedAt = Date.now();
            n++;
        });
        await a.saveData();
        a.renderTiles();
        return n;
    };

    PRO.clearShots = async function (a, ids) {
        const set = ids && ids.length ? new Set(ids) : null;
        let n = 0;
        (a.tiles || []).forEach(t => {
            if (set && !set.has(t.id)) return;
            if (t.bgImage && String(t.bgImage).includes('mshots')) {
                t.bgImage = '';
                t.updatedAt = Date.now();
                n++;
            }
        });
        await a.saveData();
        a.renderTiles();
        return n;
    };

    /* Один клик по плитке: фоном — снимок её сайта.
       Повторный вызов обновляет кадр (cache-bust). */
    PRO.setScreenshotFor = async function (tileId) {
        const a = app();
        const tile = (a.tiles || []).find(t => t.id === tileId);
        if (!tile) return;
        if (!/^https?:\/\//i.test(tile.url || '')) {
            DialogService.alert('У плитки нет адреса http/https — снимать нечего');
            return;
        }
        const existing = PRO.parseShot(tile.bgImage);
        const size = existing || shotSize();
        await PRO.makeShotFor(a, [tile.id], size.width, size.height, !!existing);
        const msg = existing
            ? 'Снимок обновлён. Сервис может отдать прежний кадр несколько секунд — повторите, если нужно.'
            : 'Фоном поставлен снимок сайта. Первый кадр сервис готовит несколько секунд.';
        logInfo('pro-tools.shot', `${tile.title}: ${tile.bgImage}`);
        DialogService.alert(msg);
    };

    PRO.mountShotHandlers = function () {
        document.addEventListener('click', (e) => {
            const id = e.target && e.target.id;
            if (id !== 'tileBgShotBtn' && id !== 'tileBgShotBigBtn' && id !== 'tileBgShotRefreshBtn') return;
            e.preventDefault();
            const urlInput = document.getElementById('tileUrl');
            const raw = (urlInput && urlInput.value || '').trim();
            if (!/^https?:\/\//i.test(raw)) {
                DialogService.alert('Сначала укажите адрес сайта (http/https)');
                return;
            }
            let w = 600, h = 400, bust = false;
            if (id === 'tileBgShotBigBtn') { w = 1200; h = 800; }
            if (id === 'tileBgShotRefreshBtn') {
                const field = document.getElementById('tileBgImageUrl');
                const cur = PRO.parseShot(field && field.value);
                if (cur) { w = cur.width; h = cur.height; }
                bust = true;
            }
            const field = document.getElementById('tileBgImageUrl');
            if (field) field.value = PRO.screenshotUrl(raw, w, h, bust);
            const sel = document.getElementById('tileBgType');
            if (sel) sel.value = 'image';
            const a = app();
            if (a && a.toggleTileBgType) a.toggleTileBgType('image');
        });
    };

    /* ---------------- поиск ---------------- */

    PRO.matchQuery = function (tile, rawQuery, a) {
        const q = String(rawQuery || '').trim();
        if (!q) return true;
        const tokens = q.split(/\s+/).filter(Boolean);
        const fname = folderName(a, tile.folderId).toLowerCase();
        const title = String(tile.title || '').toLowerCase();
        const url = String(tile.url || '').toLowerCase();

        return tokens.every(raw => {
            const tok = raw.toLowerCase();
            const m = tok.match(/^(папка|folder|тип|type|сайт|site):(.+)$/);
            if (m) {
                const [, kind, value] = m;
                if (kind === 'папка' || kind === 'folder') return fname.includes(value);
                if (kind === 'тип' || kind === 'type') {
                    return PRO.classify(tile.url).toLowerCase().includes(value);
                }
                return url.includes(value);
            }
            return title.includes(tok) || url.includes(tok) || fname.includes(tok);
        });
    };

    /* ---------------- мультивыбор ---------------- */

    const bulk = { on: false, sel: new Set() };
    PRO.bulk = bulk;
    PRO.isSelecting = () => bulk.on;

    PRO.toggleTile = function (id) {
        if (bulk.sel.has(id)) bulk.sel.delete(id); else bulk.sel.add(id);
        PRO.repaintSelection();
    };

    PRO.repaintSelection = function () {
        document.querySelectorAll('#speedDialGrid .tile[data-tile-id]').forEach(el => {
            const on = bulk.sel.has(el.dataset.tileId);
            el.classList.toggle('bulk-selected', on);
            let chk = el.querySelector('.bulk-check');
            if (bulk.on && !chk) {
                chk = document.createElement('div');
                chk.className = 'bulk-check';
                el.appendChild(chk);
            }
            if (chk) chk.textContent = on ? '✓' : '';
        });
        updateBulkToolbar();
    };

    function updateBulkToolbar() {
        let bar = document.getElementById('bulkToolbar');
        if (!bulk.on) { if (bar) bar.remove(); return; }
        if (!bar) {
            bar = document.createElement('div');
            bar.id = 'bulkToolbar';
            bar.className = 'bulk-toolbar';
            const holder = document.getElementById('contentArea') || document.body;
            holder.appendChild(bar);
        }
        bar.innerHTML = '';
        const count = document.createElement('span');
        count.className = 'bulk-count';
        count.textContent = `Выбрано: ${bulk.sel.size}`;
        bar.appendChild(count);

        const mk = (label, fn, primary) => {
            const b = document.createElement('button');
            b.type = 'button';
            b.className = primary ? 'action-button primary' : 'action-button';
            b.textContent = label;
            b.onclick = fn;
            bar.appendChild(b);
        };
        if (bulk.sel.size === 0) {
            mk('Выбрать всё на экране', () => {
                document.querySelectorAll('#speedDialGrid .tile[data-tile-id]').forEach(el => bulk.sel.add(el.dataset.tileId));
                PRO.repaintSelection();
            });
        }
        mk('Снимок фоном', () => PRO.bulkShot());
        mk('Переместить', () => PRO.bulkMove());
        mk('Цвет', () => PRO.bulkColor());
        mk('Удалить', () => PRO.bulkDelete(), true);
        mk('Выйти', () => PRO.setBulkMode(false));
    }

    PRO.setBulkMode = function (on) {
        bulk.on = !!on;
        if (!on) bulk.sel.clear();
        const a = app();
        a.tilesLimit = on ? 100000 : (a.tilesLimit === 100000 ? 50 : a.tilesLimit);
        PRO.repaintSelection();
        if (a.renderTiles) a.renderTiles();
    };

    PRO.bulkShot = async function () {
        const a = app();
        const ids = [...bulk.sel];
        if (!ids.length) return;
        const size = shotSize();
        const n = await PRO.makeShotFor(a, ids, size.w, size.h, false);
        DialogService.alert(`Фон-снимок поставлен ${n} плиткам (${size.w}×${size.h}).`);
    };

    PRO.bulkMove = async function () {
        const a = app();
        if (!bulk.sel.size) return;
        const opts = (a.folders || []).map(f => `${f.id} — ${f.name}`).join('\n');
        const raw = await DialogService.prompt(
            `Куда переместить ${bulk.sel.size} плиток?\nID папки (или пусто — без папки):\n${opts}`, '');
        if (raw === null) return;
        const id = String(raw).trim().split(/\s/)[0] || '';
        if (id && !(a.folders || []).some(f => f.id === id)) {
            await DialogService.alert('Папка с таким ID не найдена');
            return;
        }
        a.tiles.forEach(t => { if (bulk.sel.has(t.id)) { t.folderId = id; t.updatedAt = Date.now(); } });
        await a.saveData();
        a.renderTiles();
        if (a.renderFoldersBar) a.renderFoldersBar();
    };

    PRO.bulkColor = async function () {
        const a = app();
        if (!bulk.sel.size) return;
        const raw = await DialogService.prompt('Цвет фона (hex, например #2F5D8A):', '#2F5D8A');
        if (!raw) return;
        const hex = String(raw).trim();
        if (!/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(hex)) {
            await DialogService.alert('Нужен цвет вида #RRGGBB');
            return;
        }
        a.tiles.forEach(t => {
            if (!bulk.sel.has(t.id)) return;
            t.bgColor = hex;
            t.autoColor = false;
            t.updatedAt = Date.now();
        });
        await a.saveData();
        a.renderTiles();
    };

    PRO.bulkDelete = async function () {
        const a = app();
        if (!bulk.sel.size) return;
        if (!await DialogService.confirm(`Удалить ${bulk.sel.size} плиток?`)) return;
        const ids = new Set(bulk.sel);
        a.tiles.forEach(t => { if (ids.has(t.id) && a._addTombstone) a._addTombstone(t.id); });
        a.tiles = a.tiles.filter(t => !ids.has(t.id));
        bulk.sel.clear();
        await a.saveData();
        a.renderTiles();
        PRO.repaintSelection();
    };

    /* ---------------- уборка ---------------- */

    const PLACEHOLDER = /^(Упс, Нет заголовка|503 Service.*|Сервер не найден|Antibot Challenge.*|403 Forbidden|404 Not Found|Not Found|Error)$/i;

    PRO.scan = function (a) {
        const byNorm = new Map();
        (a.tiles || []).forEach(t => {
            const key = PRO.normUrl(t.url);
            if (!key) return;
            if (!byNorm.has(key)) byNorm.set(key, []);
            byNorm.get(key).push(t);
        });

        const dups = [];
        byNorm.forEach((list, key) => {
            if (list.length < 2) return;
            const score = t => (t.folderId ? 1 : 0)
                + (/^https:/i.test(t.url || '') ? 1 : 0)
                + (PLACEHOLDER.test(String(t.title || '').trim()) ? -3 : 0);
            const sorted = list.slice().sort((x, y) => {
                const d = score(y) - score(x);
                if (d) return d;
                return (y.updatedAt || 0) - (x.updatedAt || 0);
            });
            dups.push({ key, keep: sorted[0], drop: sorted.slice(1) });
        });

        const broken = (a.tiles || []).filter(t => !t.title || PLACEHOLDER.test(String(t.title).trim()));
        const corrupt = (a.folders || []).filter(f => String(f.name || '').includes('\uFFFD'));
        const empty = (a.folders || []).filter(f => !a._folderHasAnyContent(f.id));
        const orphan = (a.tiles || []).filter(t => t.folderId && !(a.folders || []).some(f => f.id === t.folderId));

        _lastScan = { dups, broken, corrupt, empty, orphan };
        return _lastScan;
    };

    PRO.applyCleanup = async function (a, what) {
        const s = _lastScan || PRO.scan(a);
        let removed = 0, fixed = 0, folders = 0;
        const now = Date.now();

        if (what.dups) {
            s.dups.forEach(g => g.drop.forEach(t => {
                if (a._addTombstone) a._addTombstone(t.id);
                removed++;
            }));
            const ids = new Set(s.dups.flatMap(g => g.drop.map(t => t.id)));
            a.tiles = a.tiles.filter(t => !ids.has(t.id));
        }
        if (what.broken) {
            a.tiles.forEach(t => {
                const isBroken = !t.title || PLACEHOLDER.test(String(t.title).trim());
                if (!isBroken) return;
                t.title = PRO.hostOf(t.url) || t.title || 'сайт';
                t.updatedAt = now;
                fixed++;
            });
        }
        if (what.corrupt) {
            a.folders.forEach(f => {
                if (!String(f.name || '').includes('\uFFFD')) return;
                f.name = String(f.name).replace(/\uFFFD+/g, '').trim() || 'Без названия';
                f.updatedAt = now;
                folders++;
            });
        }
        if (what.empty) {
            const keep = new Set(a.folders.filter(f => a._folderHasAnyContent(f.id)).map(f => f.id));
            const dropIds = a.folders.filter(f => !keep.has(f.id)).map(f => f.id);
            a.folders.forEach(f => { if (dropIds.includes(f.id) && a._addTombstone) a._addTombstone(f.id); });
            a.folders = a.folders.filter(f => keep.has(f.id));
            folders += dropIds.length;
        }
        if (what.orphan) {
            a.tiles.forEach(t => { if (t.folderId && !a.folders.some(f => f.id === t.folderId)) { t.folderId = ''; } });
        }

        await a.saveData();
        a.renderTiles();
        if (a.renderFoldersBar) a.renderFoldersBar();
        _lastScan = null;
        return { removed, fixed, folders };
    };

    /* ---------------- бэкап ---------------- */

    PRO.exportJson = async function (a) {
        const data = {
            schema: 'private-speeddial/backup',
            version: PRO.version,
            exportedAt: new Date().toISOString(),
            settings: a.settings || {},
            tiles: a.tiles || [],
            folders: a.folders || [],
            notes: a.notes || [],
            noteFolders: a.noteFolders || [],
            tombstones: a.tombstones || {}
        };
        const blob = new Blob([JSON.stringify(data, null, 1)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const el = document.createElement('a');
        el.href = url;
        el.download = `speeddial-backup-${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(el);
        el.click();
        el.remove();
        setTimeout(() => URL.revokeObjectURL(url), 4000);
        return data;
    };

    PRO.importJson = function (a, file, mode) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = async () => {
                try {
                    const data = JSON.parse(String(reader.result));
                    if (!data || !Array.isArray(data.tiles)) throw new Error('В файле нет массива плиток');
                    /* теги больше не используются */
                    const stripTags = list => (list || []).map(t => { t.tags = []; return t; });
                    if (mode === 'replace') {
                        a.tiles = stripTags(data.tiles);
                        a.folders = data.folders || [];
                        a.notes = data.notes || [];
                        a.noteFolders = data.noteFolders || [];
                        a.tombstones = data.tombstones || {};
                    } else {
                        const known = new Set(a.tiles.map(t => t.id));
                        const byUrl = new Map(a.tiles.map(t => [PRO.normUrl(t.url), t]));
                        stripTags(data.tiles).forEach(t => {
                            if (known.has(t.id)) return;
                            if (byUrl.get(PRO.normUrl(t.url))) return; /* такой адрес уже есть */
                            a.tiles.push(t);
                        });
                        const fKnown = new Set(a.folders.map(f => f.id));
                        (data.folders || []).forEach(f => { if (!fKnown.has(f.id)) a.folders.push(f); });
                    }
                    await a.saveData();
                    a.renderTiles();
                    if (a.renderFoldersBar) a.renderFoldersBar();
                    resolve({ tiles: a.tiles.length, folders: a.folders.length });
                } catch (e) { reject(e); }
            };
            reader.onerror = () => reject(new Error('Не удалось прочитать файл'));
            reader.readAsText(file);
        });
    };

    /* ---------------- санитайзер ---------------- */

    PRO.sanitize = function (a) {
        const fixes = [];
        const now = Date.now();

        (a.folders || []).forEach(f => {
            if (String(f.name || '').includes('\uFFFD')) {
                const fixed = String(f.name).replace(/\uFFFD+/g, '').trim() || 'Без названия';
                fixes.push(`Папка «${f.name}» → «${fixed}»`);
                f.name = fixed;
                f.updatedAt = now;
            }
        });

        const seen = new Set();
        const before = (a.folders || []).length;
        a.folders = (a.folders || []).filter(f => {
            if (seen.has(f.id)) return false;
            seen.add(f.id);
            return true;
        });
        if (a.folders.length !== before) fixes.push(`Удалены папки-дубли по id: ${before - a.folders.length}`);

        const ids = new Set(a.folders.map(f => f.id));
        a.folders.forEach(f => {
            if (f.parentId && !ids.has(f.parentId)) {
                fixes.push(`Папка «${f.name}»: родитель потерян, поднята на верхний уровень`);
                f.parentId = '';
                f.updatedAt = now;
            }
        });

        let orphan = 0;
        (a.tiles || []).forEach(t => {
            if (t.folderId && !ids.has(t.folderId)) { t.folderId = ''; orphan++; }
        });
        if (orphan) fixes.push(`Плиток без папки: ${orphan}`);

        /* теги удалены из функционала — чистим остатки в данных */
        let tagCleared = 0;
        (a.tiles || []).forEach(t => {
            if (Array.isArray(t.tags) && t.tags.length) { t.tags = []; tagCleared++; }
            else if (!Array.isArray(t.tags)) t.tags = [];
        });
        if (tagCleared) fixes.push(`Очищены теги у плиток: ${tagCleared}`);

        a.folders.forEach(f => {
            let cur = f, guard = 0;
            while (cur && cur.parentId && guard++ < 100) {
                if (cur.parentId === f.id) {
                    fixes.push(`Цикл в дереве: «${f.name}» поднята на верхний уровень`);
                    f.parentId = '';
                    break;
                }
                cur = a.folders.find(x => x.id === cur.parentId);
            }
        });

        return fixes;
    };

    /* ---------------- панель ---------------- */

    function panel() {
        let ov = document.getElementById('proPanelOverlay');
        if (ov) return ov;

        ov = document.createElement('div');
        ov.id = 'proPanelOverlay';
        ov.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:9999;display:none;align-items:center;justify-content:center;padding:20px;';
        const card = document.createElement('div');
        card.style.cssText = 'background:var(--modal,#fff);color:var(--text,#172030);border:1px solid var(--border,rgba(0,0,0,.12));border-radius:20px;max-width:720px;width:100%;max-height:86vh;overflow:auto;padding:20px 22px;box-shadow:0 24px 60px rgba(0,0,0,.5);';
        ov.appendChild(card);
        ov.addEventListener('click', e => { if (e.target === ov) ov.style.display = 'none'; });

        const close = document.createElement('button');
        close.type = 'button';
        close.className = 'action-button';
        close.textContent = 'Закрыть';
        close.style.cssText = 'float:right';
        close.onclick = () => { ov.style.display = 'none'; };
        card.appendChild(close);

        const title = document.createElement('h2');
        title.textContent = 'Инструменты SpeedDial';
        title.style.cssText = 'margin:0 0 4px;font-size:18px;';
        card.appendChild(title);

        const sub = document.createElement('p');
        sub.style.cssText = 'margin:0 0 14px;font-size:12px;opacity:.65;';
        sub.textContent = `v${PRO.version} · снимки сайтов, уборка, бэкап, мультивыбор`;
        card.appendChild(sub);

        const body = document.createElement('div');
        body.className = 'pro-modal-body';
        card.appendChild(body);
        document.body.appendChild(ov);
        return ov;
    }

    function section(host, name, hint) {
        const h = document.createElement('h3');
        h.textContent = name;
        h.style.cssText = 'margin:16px 0 4px;font-size:14px;';
        host.appendChild(h);
        if (hint) {
            const p = document.createElement('div');
            p.style.cssText = 'font-size:12px;opacity:.7;margin-bottom:6px;';
            p.textContent = hint;
            host.appendChild(p);
        }
    }

    function row(host) {
        const r = document.createElement('div');
        r.className = 'pro-row';
        host.appendChild(r);
        return r;
    }

    function btn(host, label, fn, primary) {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = primary ? 'action-button primary' : 'action-button';
        b.textContent = label;
        b.onclick = fn;
        host.appendChild(b);
        return b;
    }

    PRO.openPanel = function () {
        const a = app();
        const ov = panel();
        const body = ov.querySelector('.pro-modal-body');
        body.innerHTML = '';

        const result = document.createElement('div');
        result.className = 'pro-list';

        /* --- снимки сайтов --- */
        section(body, 'Фон — снимок сайта', 'Превью страницы подставляется как фон плитки. Снимок отдаёт внешний сервис mShots, поэтому адрес страницы уходит на s0.wp.com. Поштучно — правый клик по плитке или кнопки в диалоге.');
        const sizeRow = row(body);
        const cur = shotSize();
        const mkSize = (w, label) => {
            const b = document.createElement('button');
            b.type = 'button';
            b.className = 'action-button' + (cur.w === w ? ' primary' : '');
            b.textContent = label;
            b.onclick = () => { PRO.setShotSize(w); ov.style.display = 'none'; PRO.openPanel(); };
            sizeRow.appendChild(b);
        };
        mkSize(480, '480×320');
        mkSize(600, '600×400');
        mkSize(1200, '1200×800');

        const shotRow = row(body);
        btn(shotRow, 'Снимок выделенным', async () => {
            const ids = [...bulk.sel];
            if (!ids.length) { result.innerHTML = '<div class="pro-list-item">Сначала включите режим выделения и отметьте плитки</div>'; body.appendChild(result); return; }
            const s = shotSize();
            const n = await PRO.makeShotFor(a, ids, s.w, s.h, false);
            result.innerHTML = `<div class="pro-list-item">Снимок поставлен: ${n} (${s.w}×${s.h})</div>`;
            body.appendChild(result);
        });
        btn(shotRow, 'Снимок плиткам папки', async () => {
            const folder = a.currentFolder;
            const ids = (a.tiles || []).filter(t => folder === 'all' || t.folderId === folder).map(t => t.id);
            if (!ids.length) return;
            const s = shotSize();
            if (!await DialogService.confirm(`Поставить фон-снимок ${ids.length} плиткам? Каждый адрес уйдёт на s0.wp.com.`)) return;
            const n = await PRO.makeShotFor(a, ids, s.w, s.h, false);
            result.innerHTML = `<div class="pro-list-item">Снимок поставлен: ${n} (${s.w}×${s.h})</div>`;
            body.appendChild(result);
        }, true);
        btn(shotRow, 'Обновить снимки', async () => {
            const ids = (a.tiles || []).filter(t => PRO.parseShot(t.bgImage)).map(t => t.id);
            if (!ids.length) return;
            const n = await PRO.makeShotFor(a, ids, 0, 0, true);
            result.innerHTML = `<div class="pro-list-item">Обновлено: ${n}</div>`;
            body.appendChild(result);
        });
        btn(shotRow, 'Снять фоны-снимки', async () => {
            const n = await PRO.clearShots(a);
            result.innerHTML = `<div class="pro-list-item">Снято: ${n}</div>`;
            body.appendChild(result);
        });

        /* --- массовые операции --- */
        section(body, 'Массовые операции', 'Выделите плитки на экране и примените действие ко всем сразу.');
        const bRow = row(body);
        btn(bRow, bulk.on ? 'Выйти из режима выделения' : 'Включить режим выделения', () => {
            ov.style.display = 'none';
            PRO.setBulkMode(!bulk.on);
        }, true);
        btn(bRow, 'Отметить плитки текущей папки', () => {
            const ids = new Set();
            const folder = a.currentFolder;
            (a.tiles || []).forEach(t => {
                if (folder === 'all' || t.folderId === folder) ids.add(t.id);
            });
            bulk.sel.clear();
            ids.forEach(id => bulk.sel.add(id));
            PRO.setBulkMode(true);
            PRO.repaintSelection();
            ov.style.display = 'none';
        });

        /* --- уборка --- */
        section(body, 'Уборка', 'Дубли определяются по нормализованному адресу: без www, слэша и меток UTM.');
        const scanRow = row(body);
        const scanResult = document.createElement('div');
        scanResult.className = 'pro-list';
        body.appendChild(scanResult);

        btn(scanRow, 'Проверить', () => {
            const s = PRO.scan(a);
            const totalDups = s.dups.reduce((n, g) => n + g.drop.length, 0);
            scanResult.innerHTML = '';
            const add = (html) => {
                const d = document.createElement('div');
                d.className = 'pro-list-item';
                d.innerHTML = html;
                scanResult.appendChild(d);
            };
            add(`<span class="pro-badge">дубли</span><span class="pro-dup-title">групп: ${s.dups.length}, лишних плиток: ${totalDups}</span>`);
            s.dups.slice(0, 12).forEach(g => add(
                `<span class="pro-badge">${g.drop.length + 1}</span><span class="pro-dup-title">${esc(g.keep.title || g.key)}</span><span style="opacity:.6">${esc(g.key)}</span>`));
            add(`<span class="pro-badge">заголовки</span><span class="pro-dup-title">мусорных: ${s.broken.length}</span>`);
            add(`<span class="pro-badge">папки</span><span class="pro-dup-title">пустых: ${s.empty.length}, повреждённых имён: ${s.corrupt.length}</span>`);
            if (s.orphan.length) add(`<span class="pro-badge">сироты</span><span class="pro-dup-title">${s.orphan.length}</span>`);

            const actions = row(body);
            btn(actions, `Удалить дубли (${totalDups})`, async () => {
                const r = await PRO.applyCleanup(a, { dups: true });
                scanResult.innerHTML = `<div class="pro-list-item">Удалено плиток: ${r.removed}</div>`;
                actions.remove();
            }, true);
            btn(actions, `Починить заголовки (${s.broken.length})`, async () => {
                const r = await PRO.applyCleanup(a, { broken: true });
                scanResult.innerHTML = `<div class="pro-list-item">Исправлено: ${r.fixed}</div>`;
                actions.remove();
            });
            btn(actions, `Удалить пустые папки (${s.empty.length})`, async () => {
                const r = await PRO.applyCleanup(a, { empty: true });
                scanResult.innerHTML = `<div class="pro-list-item">Удалено папок: ${r.folders}</div>`;
                actions.remove();
            });
            btn(actions, 'Всё сразу', async () => {
                const r = await PRO.applyCleanup(a, { dups: true, broken: true, empty: true, corrupt: true, orphan: true });
                scanResult.innerHTML = `<div class="pro-list-item">Плиток удалено: ${r.removed} · заголовков: ${r.fixed} · папок: ${r.folders}</div>`;
                actions.remove();
            });
        }, true);

        /* --- бэкап --- */
        section(body, 'Резервная копия', 'Полный снимок: плитки, папки, заметки, настройки. Восстановление — замена или слияние по адресам.');
        const bkRow = row(body);
        btn(bkRow, 'Скачать JSON', async () => {
            const data = await PRO.exportJson(a);
            result.innerHTML = `<div class="pro-list-item">Сохранено плиток: ${data.tiles.length}, папок: ${data.folders.length}</div>`;
            body.appendChild(result);
        }, true);
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'application/json,.json';
        fileInput.style.display = 'none';
        fileInput.onchange = async () => {
            const f = fileInput.files[0];
            if (!f) return;
            const mode = await DialogService.choice('Как восстановить?', [
                { label: 'Отмена', value: null, variant: 'secondary' },
                { label: 'Слить', value: 'merge', variant: 'primary' },
                { label: 'Заменить всё', value: 'replace', variant: 'secondary' }
            ]);
            if (!mode) return;
            try {
                const r = await PRO.importJson(a, f, mode);
                result.innerHTML = `<div class="pro-list-item">Восстановлено: плиток ${r.tiles}, папок ${r.folders}</div>`;
            } catch (e) {
                result.innerHTML = `<div class="pro-list-item">Ошибка: ${esc(e.message)}</div>`;
            }
            body.appendChild(result);
        };
        body.appendChild(fileInput);
        btn(bkRow, 'Восстановить из JSON', () => fileInput.click());

        /* --- целостность --- */
        section(body, 'Целостность данных', 'Проверка имён, родителей, сирот и циклов в дереве папок.');
        const sRow = row(body);
        btn(sRow, 'Проверить и починить', async () => {
            const fixes = PRO.sanitize(a);
            if (!fixes.length) {
                result.innerHTML = '<div class="pro-list-item">Проблем не найдено</div>';
                body.appendChild(result);
                return;
            }
            await a.saveData();
            a.renderTiles();
            if (a.renderFoldersBar) a.renderFoldersBar();
            result.innerHTML = fixes.map(f => `<div class="pro-list-item">✓ ${esc(f)}</div>`).join('');
            body.appendChild(result);
        });

        /* --- приватность --- */
        section(body, 'Приватность иконок', 'По умолчанию источник — /favicon.ico самого сайта: домены закладок не уходят во внешние сервисы. Существующие плитки можно перевести разом.');
        const pRow = row(body);
        btn(pRow, 'Иконки с самих сайтов', async () => {
            let n = 0;
            (a.tiles || []).forEach(t => {
                const host = PRO.hostOf(t.url);
                if (!host) return;
                const local = `https://${host}/favicon.ico`;
                if (t.icon !== local) { t.icon = local; t.updatedAt = Date.now(); n++; }
            });
            try { if (typeof clearFaviconCache === 'function') await clearFaviconCache(); } catch (e) {}
            await a.saveData();
            a.renderTiles();
            result.innerHTML = `<div class="pro-list-item">Переведено на локальные иконки: ${n}</div>`;
            body.appendChild(result);
        });
        btn(pRow, 'Иконки Google (быстрее)', async () => {
            let n = 0;
            (a.tiles || []).forEach(t => {
                const host = PRO.hostOf(t.url);
                if (!host) return;
                const g = 'https://www.google.com/s2/favicons?domain=' + encodeURIComponent(host) + '&sz=64';
                if (t.icon !== g) { t.icon = g; t.updatedAt = Date.now(); n++; }
            });
            try { if (typeof clearFaviconCache === 'function') await clearFaviconCache(); } catch (e) {}
            await a.saveData();
            a.renderTiles();
            result.innerHTML = `<div class="pro-list-item">Переведено на Google-иконки: ${n}</div>`;
            body.appendChild(result);
        });

        ov.style.display = 'flex';
    };

    /* ---------------- кнопка ---------------- */

    PRO.init = function () {
        if (document.getElementById('proToolsFab')) return;
        const fab = document.createElement('button');
        fab.type = 'button';
        fab.id = 'proToolsFab';
        fab.title = 'Инструменты SpeedDial: снимки сайтов, уборка, бэкап';
        fab.textContent = '🧰';
        fab.style.cssText = 'position:fixed;right:14px;bottom:14px;z-index:9000;width:42px;height:42px;'
            + 'border-radius:50%;border:0;cursor:pointer;font-size:19px;line-height:1;'
            + 'background:var(--accent,#26856f);color:#fff;box-shadow:0 6px 20px rgba(0,0,0,.3);';
        fab.onclick = () => PRO.openPanel();
        document.body.appendChild(fab);

        PRO.mountShotHandlers();

        whenReady(a => {
            const fixes = PRO.sanitize(a);
            if (fixes.length) {
                a.saveData().then(() => {
                    if (a.renderTiles) a.renderTiles();
                    if (a.renderFoldersBar) a.renderFoldersBar();
                });
                console.info('[pro-tools] санитайзер:', fixes);
            }
            PRO.repaintSelection();
        });
    };

    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => { try { PRO.init(); } catch (e) { console.error('[pro-tools] init', e); } }, 900);
    });
})();
