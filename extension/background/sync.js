'use strict';

/* ============================================================
   sync.js — центральная логика синхронизации.

   v6.6.6:
   - _mergePayloads: Last-Write-Wins по settingsUpdatedAt.
     Раньше server всегда перебивал local при merge — из-за
     этого слетали пользовательские настройки (например,
     showTileSizeSlider) после автосинка.
     Теперь:
       • serverTs >= localTs → сервер побеждает
         (в т.ч. при 0 == 0 на первом sync — тянем с сервера);
       • localTs > serverTs → локальные побеждают.
   - _applySyncPayload: применяет settingsUpdatedAt с сервера,
     чтобы LWW работал и на устройствах, только что скачавших
     настройки.
   - Остальное — как в v6.6.0.
   ============================================================ */

const SYNC_RATE_LIMIT_MS = 30000;
const SYNC_HISTORY_MAX = 50;
const SYNC_LOCK_TTL_MS = 5 * 60 * 1000;
const SYNC_LOCK_NAME = 'speeddial-sync';
const SYNC_PAYLOAD_VERSION = 3;

const SYNC_STATE_KEY = 'syncState';
const PENDING_CONFLICT_KEY = 'pendingSyncConflict';

const ENCRYPTION_OVERHEAD_FACTOR = 1.4;

/* ---------- Storage-lock ---------- */

async function isStorageLocked() {
    try {
        const data = await api.storage.local.get(['syncInProgress', 'syncStartedAt']);
        if (!data.syncInProgress) return false;
        const age = Date.now() - (data.syncStartedAt || 0);
        if (age > SYNC_LOCK_TTL_MS) {
            await api.storage.local.remove(['syncInProgress', 'syncStartedAt']);
            return false;
        }
        return true;
    } catch (e) {
        return false;
    }
}

async function lockStorage() {
    try {
        await api.storage.local.set({ syncInProgress: true, syncStartedAt: Date.now() });
    } catch (e) {}
}

async function unlockStorage() {
    try {
        await api.storage.local.remove(['syncInProgress', 'syncStartedAt']);
    } catch (e) {}
}

/* ---------- Rate-limit ---------- */

async function getLastSyncTime() {
    try {
        const data = await api.storage.local.get('lastSyncTime');
        return data.lastSyncTime || 0;
    } catch (e) {
        return 0;
    }
}

async function setLastSyncTime(ts) {
    try {
        await api.storage.local.set({ lastSyncTime: ts });
    } catch (e) {}
}

/* ---------- Состояние ---------- */

async function getSyncState() {
    try {
        const d = await api.storage.local.get([SYNC_STATE_KEY, PENDING_CONFLICT_KEY]);
        const s = d[SYNC_STATE_KEY] || {};
        const pending = d[PENDING_CONFLICT_KEY];
        return {
            initialSyncDone: !!s.initialSyncDone,
            pendingSummary: pending?.summary || null
        };
    } catch (e) {
        return { initialSyncDone: false, pendingSummary: null };
    }
}

async function setSyncState(state) {
    try {
        await api.storage.local.set({ [SYNC_STATE_KEY]: state });
    } catch (e) {}
}

async function getPendingConflict() {
    try {
        const d = await api.storage.local.get(PENDING_CONFLICT_KEY);
        return d[PENDING_CONFLICT_KEY] || null;
    } catch (e) {
        return null;
    }
}

/* ---------- Диагностика формата ---------- */

function _looksLikeEncryptedEnvelope(payload) {
    return !!(
        payload &&
        typeof payload === 'object' &&
        !Array.isArray(payload) &&
        typeof payload.salt === 'string' && payload.salt.length > 0 &&
        typeof payload.iv === 'string' && payload.iv.length > 0 &&
        typeof payload.data === 'string' && payload.data.length > 0
    );
}

function _looksLikePlaintextPayload(payload) {
    return !!(
        payload &&
        typeof payload === 'object' &&
        !Array.isArray(payload) &&
        (
            Array.isArray(payload.tiles) ||
            Array.isArray(payload.folders) ||
            Array.isArray(payload.notes) ||
            Array.isArray(payload.noteFolders) ||
            typeof payload.version === 'number'
        )
    );
}

/* ---------- Нормализация таймстемпов сущностей ---------- */

function _normalizeEntityTimestamps(payload) {
    if (!payload || typeof payload !== 'object') return payload;
    const now = Date.now();
    const lists = ['tiles', 'folders', 'notes', 'noteFolders'];
    for (const key of lists) {
        const arr = payload[key];
        if (!Array.isArray(arr)) continue;
        for (const it of arr) {
            if (!it || !it.id) continue;
            if (typeof it.createdAt !== 'number') {
                it.createdAt = (typeof it.updatedAt === 'number' ? it.updatedAt : now);
            }
            if (typeof it.updatedAt !== 'number') {
                it.updatedAt = it.createdAt;
            }
        }
    }
    return payload;
}

/* ---------- Diff ---------- */

function _computeSyncDiff(localPayload, serverPayload) {
    const local = localPayload || {};
    const server = serverPayload || {};

    const tombstones = mergeTombstones(local.tombstones, server.tombstones);

    const _ids = (arr) => new Set((arr || []).map(x => x && x.id).filter(Boolean));

    const compute = (type) => {
        const lid = _ids(local[type]);
        const sid = _ids(server[type]);

        const onlyLocal = [...lid].filter(id => !sid.has(id) && !tombstones[id]);
        const onlyServer = [...sid].filter(id => !lid.has(id) && !tombstones[id]);

        return { onlyLocal, onlyServer };
    };

    const tiles = compute('tiles');
    const folders = compute('folders');
    const notes = compute('notes');
    const noteFolders = compute('noteFolders');

    const summary = {
        onlyLocal: {
            tiles: tiles.onlyLocal.length,
            folders: folders.onlyLocal.length,
            notes: notes.onlyLocal.length,
            noteFolders: noteFolders.onlyLocal.length,
            total: tiles.onlyLocal.length + folders.onlyLocal.length +
                   notes.onlyLocal.length + noteFolders.onlyLocal.length
        },
        onlyServer: {
            tiles: tiles.onlyServer.length,
            folders: folders.onlyServer.length,
            notes: notes.onlyServer.length,
            noteFolders: noteFolders.onlyServer.length,
            total: tiles.onlyServer.length + folders.onlyServer.length +
                   notes.onlyServer.length + noteFolders.onlyServer.length
        }
    };

    return {
        hasConflicts: summary.onlyLocal.total > 0 || summary.onlyServer.total > 0,
        summary
    };
}

/* ---------- Публичная точка входа ---------- */

async function syncData(syncType = 'merge', opts = {}) {
    if (!opts.manual) {
        const now = Date.now();
        const last = await getLastSyncTime();
        const elapsed = now - last;
        if (elapsed < SYNC_RATE_LIMIT_MS && elapsed > 0) {
            const retryIn = Math.ceil((SYNC_RATE_LIMIT_MS - elapsed) / 1000);
            return { success: false, error: tbg('popupWait', { n: retryIn + ' ' + tbg('secShort') }), retryIn };
        }
    }

    if (typeof navigator !== 'undefined' && navigator.locks && navigator.locks.request) {
        return await navigator.locks.request(SYNC_LOCK_NAME, { mode: 'exclusive' }, async () => {
            return await _runSync(syncType);
        });
    }

    if (await isStorageLocked()) {
        logWarn('sync.syncData', 'Синхронизация уже выполняется');
        return { success: false, error: tbg('syncInProgress') };
    }
    await lockStorage();
    try {
        return await _runSync(syncType);
    } finally {
        await unlockStorage();
    }
}

/* ---------- Расшифровка ---------- */

async function _decodeServerPayload(serverPayloadRaw, encryptionKey) {
    if (!serverPayloadRaw) return null;

    if (Array.isArray(serverPayloadRaw) || typeof serverPayloadRaw !== 'object') {
        throw new Error(tbg('srvUnknownFormatType', { type: typeof serverPayloadRaw }));
    }

    if (!encryptionKey) {
        if (_looksLikeEncryptedEnvelope(serverPayloadRaw)) {
            throw new Error(tbg('srvEncNoKeyFull'));
        }
        return serverPayloadRaw;
    }

    if (_looksLikeEncryptedEnvelope(serverPayloadRaw)) {
        try {
            const decrypted = await decryptData(serverPayloadRaw, encryptionKey);
            logDebug('sync._decodeServerPayload', 'Данные расшифрованы');
            return decrypted;
        } catch (e) {
            throw new Error(tbg('srvDecryptFail', { msg: e.message }));
        }
    }

    if (_looksLikePlaintextPayload(serverPayloadRaw)) {
        logWarn('sync._decodeServerPayload',
            'На сервере незашифрованный payload. Используется как plaintext. ' +
            'Следующий успешный sync перезапишет его зашифрованным.');
        return serverPayloadRaw;
    }

    const topKeys = Object.keys(serverPayloadRaw).slice(0, 10).join(', ');
    throw new Error(tbg('srvBadKeys', { keys: topKeys }));
}

/* ---------- Сборка payload ---------- */

async function _buildSyncPayload(settings) {
    const localSD = (await loadDataFromIDB()) || {};

    reconcilePasswords(localSD);

    const syncedSettings = {};
    for (const key of Object.keys(settings || {})) {
        if (SYNC_EXCLUDED_KEYS.has(key)) continue;
        syncedSettings[key] = settings[key];
    }

    const backgroundBlobs = {};
    for (const bg of syncedSettings.backgrounds || []) {
        if (bg.type === 'image-file' && bg.ref) {
            try {
                const rec = await loadBackgroundBlob(bg.ref);
                if (rec?.dataUrl) {
                    const compressed = await compressBackgroundDataUrl(rec.dataUrl);
                    if (compressed) backgroundBlobs[bg.ref] = compressed;
                }
            } catch (e) {
                logWarn('sync._buildSyncPayload', `Blob ${bg.ref} не прочитан`, { error: e.message });
            }
        }
    }

    const panelBackgroundBlobs = {};
    for (const bg of syncedSettings.panelBackgrounds || []) {
        if (bg.type === 'image-file' && bg.ref) {
            try {
                const rec = await loadBackgroundBlob(bg.ref);
                if (rec?.dataUrl) {
                    const compressed = await compressBackgroundDataUrl(rec.dataUrl);
                    if (compressed) panelBackgroundBlobs[bg.ref] = compressed;
                }
            } catch (e) {}
        }
    }

    return _normalizeEntityTimestamps({
        version: SYNC_PAYLOAD_VERSION,
        settings: syncedSettings,
        tiles: localSD.tiles || [],
        folders: localSD.folders || [],
        notes: localSD.notes || [],
        noteFolders: localSD.noteFolders || [],
        folderPasswords: localSD.folderPasswords || {},
        tombstones: localSD.tombstones || {},
        backgroundBlobs,
        panelBackgroundBlobs,
        headerHidden: localSD.headerHidden || false,
        sidebarCollapsed: localSD.sidebarCollapsed || false,
        lastModified: Date.now()
    });
}

function _normalizeServerPayload(payload) {
    if (!payload || typeof payload !== 'object') return null;

    if (payload.version && payload.version >= 3) {
        reconcilePasswords(payload);
        if (!payload.tombstones) payload.tombstones = {};
        return _normalizeEntityTimestamps(payload);
    }

    const normalized = _normalizeEntityTimestamps({
        version: SYNC_PAYLOAD_VERSION,
        settings: payload.settings || {},
        tiles: payload.tiles || [],
        folders: payload.folders || [],
        notes: payload.notes || [],
        noteFolders: payload.noteFolders || [],
        folderPasswords: payload.folderPasswords || {},
        tombstones: {},
        backgroundBlobs: payload.backgroundBlobs || {},
        panelBackgroundBlobs: payload.panelBackgroundBlobs || {},
        headerHidden: typeof payload.headerHidden === 'boolean' ? payload.headerHidden : false,
        sidebarCollapsed: typeof payload.sidebarCollapsed === 'boolean' ? payload.sidebarCollapsed : false,
        lastModified: payload.lastModified || 0
    });

    reconcilePasswords(normalized);
    return normalized;
}

/* ---------- Merge массивов ---------- */

function _mergeArrays(localArr, serverArr, tombstones) {
    const map = new Map();

    const add = (item) => {
        if (!item || !item.id) return;
        const existing = map.get(item.id);
        if (!existing) { map.set(item.id, item); return; }
        const aT = item.updatedAt || item.createdAt || 0;
        const bT = existing.updatedAt || existing.createdAt || 0;
        if (aT >= bT) map.set(item.id, item);
    };

    (serverArr || []).forEach(add);
    (localArr || []).forEach(add);

    const items = Array.from(map.values());
    return filterDeleted(items, tombstones);
}

/* ============================================================
   v6.6.6: LWW для настроек.
   ============================================================ */

function _mergePayloads(local, server) {
    const tombstones = mergeTombstones(local.tombstones, server.tombstones);

    /* ---------- Last-Write-Wins по settingsUpdatedAt ---------- */
    const localSettings = local.settings || {};
    const serverSettings = server.settings || {};

    const localTs = Number(localSettings.settingsUpdatedAt) || 0;
    const serverTs = Number(serverSettings.settingsUpdatedAt) || 0;

    let mergedSettings;
    if (serverTs >= localTs) {
        /* Сервер новее (или равен — тянем с сервера, например, на первом sync) */
        mergedSettings = { ...localSettings, ...serverSettings };
        logDebug('sync._mergePayloads',
            `Settings LWW: server (${serverTs} >= ${localTs})`);
    } else {
        /* Локальные новее — сохраняем их */
        mergedSettings = { ...serverSettings, ...localSettings };
        logDebug('sync._mergePayloads',
            `Settings LWW: local (${localTs} > ${serverTs})`);
    }

    const backgroundBlobs = {
        ...(local.backgroundBlobs || {}),
        ...(server.backgroundBlobs || {})
    };
    const panelBackgroundBlobs = {
        ...(local.panelBackgroundBlobs || {}),
        ...(server.panelBackgroundBlobs || {})
    };

    const mergedPasswords = {};
    const allKeys = new Set([
        ...Object.keys(local.folderPasswords || {}),
        ...Object.keys(server.folderPasswords || {})
    ]);
    allKeys.forEach(k => {
        const lv = local.folderPasswords?.[k];
        const sv = server.folderPasswords?.[k];
        const lvOk = typeof lv === 'string' && lv.length > 0;
        const svOk = typeof sv === 'string' && sv.length > 0;

        if (lvOk) mergedPasswords[k] = lv;
        else if (svOk) mergedPasswords[k] = sv;
    });

    const merged = {
        version: SYNC_PAYLOAD_VERSION,
        settings: mergedSettings,
        tiles: _mergeArrays(local.tiles, server.tiles, tombstones),
        folders: _mergeArrays(local.folders, server.folders, tombstones),
        notes: _mergeArrays(local.notes, server.notes, tombstones),
        noteFolders: _mergeArrays(local.noteFolders, server.noteFolders, tombstones),
        folderPasswords: mergedPasswords,
        tombstones,
        backgroundBlobs,
        panelBackgroundBlobs,
        headerHidden: typeof local.headerHidden === 'boolean' ? local.headerHidden : (server.headerHidden || false),
        sidebarCollapsed: typeof local.sidebarCollapsed === 'boolean' ? local.sidebarCollapsed : (server.sidebarCollapsed || false),
        lastModified: Date.now()
    };

    reconcilePasswords(merged);
    return _normalizeEntityTimestamps(merged);
}

/* ---------- Применение payload ---------- */

async function _applySyncPayload(payload) {
    if (!payload) return;

    reconcilePasswords(payload);

    if (payload.backgroundBlobs && typeof payload.backgroundBlobs === 'object') {
        for (const [ref, dataUrl] of Object.entries(payload.backgroundBlobs)) {
            if (typeof dataUrl === 'string' && dataUrl.startsWith('data:')) {
                try { await saveBackgroundBlob(ref, dataUrl); } catch (e) {}
            }
        }
    }
    if (payload.panelBackgroundBlobs && typeof payload.panelBackgroundBlobs === 'object') {
        for (const [ref, dataUrl] of Object.entries(payload.panelBackgroundBlobs)) {
            if (typeof dataUrl === 'string' && dataUrl.startsWith('data:')) {
                try { await saveBackgroundBlob(ref, dataUrl); } catch (e) {}
            }
        }
    }

    await saveDataToIDB({
        tiles: payload.tiles || [],
        folders: payload.folders || [],
        notes: payload.notes || [],
        noteFolders: payload.noteFolders || [],
        folderPasswords: payload.folderPasswords || {},
        tombstones: payload.tombstones || {},
        headerHidden: payload.headerHidden || false,
        sidebarCollapsed: payload.sidebarCollapsed || false
    });

    if (payload.settings && typeof payload.settings === 'object') {
        const toSet = {};
        for (const [key, val] of Object.entries(payload.settings)) {
            if (SYNC_EXCLUDED_KEYS.has(key)) continue;
            toSet[key] = val;
        }
        /* v6.6.6: settingsUpdatedAt проходит через этот цикл
           (не исключён), поэтому LWW-таймстемп тоже применяется. */
        if (Object.keys(toSet).length) {
            try { await api.storage.sync.set(toSet); } catch (e) {}
        }
    }

    /* v6.9.4: отметка для onChanged — применённые синком настройки
       не должны запускать автосинхронизацию по изменению */
    self._syncAppliedAt = Date.now();
}

function _estimatePayloadSize(payload) {
    try {
        return JSON.stringify(payload).length;
    } catch (e) {
        return 0;
    }
}

/* ---------- Основной пайплайн ---------- */

async function _runSync(syncType) {
    api.alarms.create('syncKeepAlive', { periodInMinutes: 1 });

    const startTime = Date.now();
    logInfo('sync.syncData', `Старт: ${syncType}`);

    try {
        const settings = await getCachedSettings();
        if (!validateSettings(settings)) {
            throw new Error(tbg('syncSettingsEmpty'));
        }

        if (!settings.encryptionKey) {
            logWarn('sync.syncData', 'encryptionKey пуст — данные уходят в облако как plaintext');
        }

        /* v6.9.4: список серверов — основной + второй (параллельная синхронизация) */
        const services = [settings.syncService];
        if (settings.syncService2
            && settings.syncService2 !== settings.syncService
            && validateSettingsFor(settings, settings.syncService2)) {
            services.push(settings.syncService2);
        }

        /* Загрузка с серверов — параллельно; выживаем при отказе одного */
        let serverPayload = null;
        if (services.length === 1) {
            const raw = await download(settings, services[0]);
            serverPayload = _normalizeServerPayload(
                await _decodeServerPayload(raw, settings.encryptionKey));
        } else {
            const results = await Promise.allSettled(services.map(async (svc) => {
                const raw = await download(settings, svc);
                return _normalizeServerPayload(await _decodeServerPayload(raw, settings.encryptionKey));
            }));
            const okPayloads = [];
            const failedDl = [];
            results.forEach((r, i) => {
                if (r.status === 'fulfilled') okPayloads.push(r.value);
                else failedDl.push(services[i]);
            });
            if (!okPayloads.length && results.length) {
                throw (results[0].reason || new Error(tbg('settingsIncomplete')));
            }
            if (failedDl.length) {
                logWarn('sync.syncData', `Второй сервер недоступен при download: ${failedDl.join(', ')}`);
            }
            const present = okPayloads.filter(Boolean);
            /* снимки двух серверов сливаем: при равенстве — основной */
            serverPayload = present.length
                ? present.reduce((a, b) => _mergePayloads(a, b))
                : null;
        }
        const localPayload = await _buildSyncPayload(settings);

        const syncState = await getSyncState();
        if (!syncState.initialSyncDone && syncType === 'merge') {
            const serverHasData = !!(serverPayload && (
                serverPayload.tiles?.length || serverPayload.folders?.length ||
                serverPayload.notes?.length || serverPayload.noteFolders?.length
            ));
            const diff = serverHasData
                ? _computeSyncDiff(localPayload, serverPayload)
                : { hasConflicts: false, summary: null };

            if (diff.hasConflicts) {
                await api.storage.local.set({
                    [PENDING_CONFLICT_KEY]: {
                        localPayload,
                        serverPayload,
                        summary: diff.summary,
                        createdAt: Date.now()
                    }
                });

                await setLastSyncTime(Date.now());

                logWarn('sync.syncData', 'Первая синхронизация: требуется решение пользователя',
                    diff.summary);

                return {
                    success: false,
                    needsResolve: true,
                    conflicts: diff.summary
                };
            }

            syncState.initialSyncDone = true;
            await setSyncState({ initialSyncDone: true });
            logInfo('sync.syncData', 'Первая синхронизация: конфликтов нет');
        }

        let finalPayload;

        if (syncType === 'upload') {
            finalPayload = localPayload;
            if (serverPayload?.tombstones) {
                finalPayload.tombstones = mergeTombstones(localPayload.tombstones, serverPayload.tombstones);
            }
            logDebug('sync.syncData', 'Режим: upload');
        } else if (syncType === 'download') {
            if (!serverPayload) {
                logWarn('sync.syncData', 'Сервер пуст → fallback на upload');
                await pushSyncHistory({
                    time: new Date().toISOString(),
                    status: 'warn',
                    mode: syncType,
                    error: tbg('serverEmptyUploaded'),
                    durationMs: 0
                });
                finalPayload = localPayload;
            } else {
                finalPayload = serverPayload;
                finalPayload.headerHidden = localPayload.headerHidden;
                finalPayload.sidebarCollapsed = localPayload.sidebarCollapsed;
                logDebug('sync.syncData', 'Режим: download');
            }
        } else {
            finalPayload = serverPayload
                ? _mergePayloads(localPayload, serverPayload)
                : localPayload;
            logDebug('sync.syncData', 'Режим: merge');
        }

        let plaintextSize = _estimatePayloadSize(finalPayload);
        let effectiveSize = settings.encryptionKey
            ? Math.ceil(plaintextSize * ENCRYPTION_OVERHEAD_FACTOR)
            : plaintextSize;

        if (effectiveSize > SYNC_PAYLOAD_MAX_BYTES) {
            logWarn('sync.syncData',
                `Payload ${(effectiveSize / 1024 / 1024).toFixed(2)} МБ` +
                (settings.encryptionKey ? ' (с учётом шифрования)' : '') +
                ` > лимита, урезаем фоны`);

            finalPayload.backgroundBlobs = {};
            finalPayload.panelBackgroundBlobs = {};
            plaintextSize = _estimatePayloadSize(finalPayload);
            effectiveSize = settings.encryptionKey
                ? Math.ceil(plaintextSize * ENCRYPTION_OVERHEAD_FACTOR)
                : plaintextSize;

            if (effectiveSize > SYNC_PAYLOAD_MAX_BYTES) {
                throw new Error(tbg('payloadTooBig', {
                    size: (effectiveSize / 1024 / 1024).toFixed(2)
                }));
            }
        }

        const isEmptyLocal = !(finalPayload.tiles?.length) &&
                            !(finalPayload.folders?.length) &&
                            !(finalPayload.notes?.length);
        const hasServerData = !!(serverPayload && (
            serverPayload.tiles?.length ||
            serverPayload.folders?.length ||
            serverPayload.notes?.length
        ));

        if (isEmptyLocal && hasServerData && syncType === 'upload') {
            throw new Error(
tbg('uploadGuard')
            );
        }

        await _applySyncPayload(finalPayload);

        let toUpload = finalPayload;
        let uploadedSize = plaintextSize;

        if (settings.encryptionKey) {
            toUpload = await encryptData(finalPayload, settings.encryptionKey);
            uploadedSize = _estimatePayloadSize(toUpload);
            logDebug('sync.syncData', `Данные зашифрованы (${(uploadedSize / 1024).toFixed(1)} КБ)`);
        }

        /* v6.9.4: выгрузка на все серверы параллельно;
           отказ второго сервера — предупреждение, отказ всех — ошибка */
        let partialFail = null;
        if (services.length === 1) {
            await upload(toUpload, settings, services[0]);
        } else {
            const ups = await Promise.allSettled(services.map(svc => upload(toUpload, settings, svc)));
            const failedUp = services.filter((_, i) => ups[i].status === 'rejected');
            if (failedUp.length === services.length) {
                throw (ups[0].reason || new Error('upload failed'));
            }
            if (failedUp.length) {
                partialFail = failedUp.join(', ');
                logWarn('sync.syncData', `Выгрузка не удалась на: ${partialFail}`);
            }
        }

        const finishedAt = Date.now();
        await setLastSyncTime(finishedAt);
        await pushSyncHistory({
            time: new Date(finishedAt).toISOString(),
            status: partialFail ? 'warn' : 'success',
            mode: syncType,
            durationMs: finishedAt - startTime,
            tilesCount: finalPayload.tiles?.length || 0,
            foldersCount: finalPayload.folders?.length || 0,
            notesCount: finalPayload.notes?.length || 0,
            tombstonesCount: Object.keys(finalPayload.tombstones || {}).length,
            payloadBytes: uploadedSize,
            encrypted: !!settings.encryptionKey,
            servers: services.length,
            error: partialFail ? (tbg('syncPartialFail') + partialFail) : undefined
        });

        notifyTabs('dataChanged');

        logInfo('sync.syncData',
            `Успех за ${finishedAt - startTime} мс, ` +
            `${(uploadedSize / 1024).toFixed(1)} КБ` +
            (settings.encryptionKey ? ' (encrypted)' : '') +
            (services.length > 1 ? `, серверов: ${services.length}` : '') +
            (partialFail ? `, частичный отказ: ${partialFail}` : ''));

        return { success: true, data: finalPayload, mode: syncType, servers: services.length, partialFail };
    } catch (e) {
        const finishedAt = Date.now();
        await pushSyncHistory({
            time: new Date(finishedAt).toISOString(),
            status: 'error',
            mode: syncType,
            error: e.message,
            durationMs: finishedAt - startTime
        });

        logError('sync.syncData', e.message, { mode: syncType });
        return { success: false, error: e.message };
    } finally {
        api.alarms.clear('syncKeepAlive');
    }
}

/* ---------- Разрешение конфликта первой синхронизации ---------- */

async function resolveSyncConflict(strategy) {
    if (!['local', 'server', 'merge'].includes(strategy)) {
        return { success: false, error: tbg('unknownStrategy') + strategy };
    }

    const stored = await api.storage.local.get(PENDING_CONFLICT_KEY);
    const pending = stored[PENDING_CONFLICT_KEY];
    if (!pending) {
        return { success: false, error: tbg('noActiveConflict') };
    }

    const { localPayload, serverPayload } = pending;
    const settings = await getCachedSettings();
    const now = Date.now();

    let finalPayload;

    if (strategy === 'local') {
        finalPayload = { ...localPayload };
        const tombstones = { ...(localPayload.tombstones || {}) };

        const markDeleted = (localArr, serverArr) => {
            const lid = new Set((localArr || []).map(x => x && x.id).filter(Boolean));
            for (const s of (serverArr || [])) {
                if (s && s.id && !lid.has(s.id)) tombstones[s.id] = now;
            }
        };
        markDeleted(localPayload.tiles, serverPayload?.tiles);
        markDeleted(localPayload.folders, serverPayload?.folders);
        markDeleted(localPayload.notes, serverPayload?.notes);
        markDeleted(localPayload.noteFolders, serverPayload?.noteFolders);

        finalPayload.tombstones = tombstones;
        logInfo('sync.resolveSyncConflict', 'Стратегия: local');
    } else if (strategy === 'server') {
        finalPayload = { ...(serverPayload || {}) };
        const tombstones = { ...((serverPayload && serverPayload.tombstones) || {}) };

        const markDeleted = (serverArr, localArr) => {
            const sid = new Set((serverArr || []).map(x => x && x.id).filter(Boolean));
            for (const l of (localArr || [])) {
                if (l && l.id && !sid.has(l.id)) tombstones[l.id] = now;
            }
        };
        markDeleted(serverPayload?.tiles, localPayload.tiles);
        markDeleted(serverPayload?.folders, localPayload.folders);
        markDeleted(serverPayload?.notes, localPayload.notes);
        markDeleted(serverPayload?.noteFolders, localPayload.noteFolders);

        finalPayload.tombstones = tombstones;

        if (!Array.isArray(finalPayload.tiles)) finalPayload.tiles = [];
        if (!Array.isArray(finalPayload.folders)) finalPayload.folders = [];
        if (!Array.isArray(finalPayload.notes)) finalPayload.notes = [];
        if (!Array.isArray(finalPayload.noteFolders)) finalPayload.noteFolders = [];
        if (!finalPayload.settings) finalPayload.settings = localPayload.settings || {};
        if (!finalPayload.folderPasswords) finalPayload.folderPasswords = {};
        if (!finalPayload.backgroundBlobs) finalPayload.backgroundBlobs = {};
        if (!finalPayload.panelBackgroundBlobs) finalPayload.panelBackgroundBlobs = {};
        finalPayload.version = SYNC_PAYLOAD_VERSION;
        finalPayload.lastModified = now;

        logInfo('sync.resolveSyncConflict', 'Стратегия: server');
    } else {
        finalPayload = serverPayload ? _mergePayloads(localPayload, serverPayload) : localPayload;
        logInfo('sync.resolveSyncConflict', 'Стратегия: merge');
    }

    await _applySyncPayload(finalPayload);

    let toUpload = finalPayload;
    let uploadedSize = _estimatePayloadSize(finalPayload);
    if (settings.encryptionKey) {
        toUpload = await encryptData(finalPayload, settings.encryptionKey);
        uploadedSize = _estimatePayloadSize(toUpload);
    }

    try {
        /* v6.9.4: при параллельной синхронизации выгружаем на оба сервера */
        const services2 = [settings.syncService];
        if (settings.syncService2
            && settings.syncService2 !== settings.syncService
            && validateSettingsFor(settings, settings.syncService2)) {
            services2.push(settings.syncService2);
        }
        await Promise.all(services2.map(svc => upload(toUpload, settings, svc)));
    } catch (e) {
        logError('sync.resolveSyncConflict', 'Ошибка upload: ' + e.message);
        return { success: false, error: tbg('uploadFailPrefix') + e.message };
    }

    await setSyncState({ initialSyncDone: true });
    await api.storage.local.remove(PENDING_CONFLICT_KEY);

    const finishedAt = Date.now();
    await setLastSyncTime(finishedAt);
    await pushSyncHistory({
        time: new Date(finishedAt).toISOString(),
        status: 'success',
        mode: 'merge',
        resolvedBy: strategy,
        durationMs: 0,
        tilesCount: finalPayload.tiles?.length || 0,
        foldersCount: finalPayload.folders?.length || 0,
        notesCount: finalPayload.notes?.length || 0,
        tombstonesCount: Object.keys(finalPayload.tombstones || {}).length,
        payloadBytes: uploadedSize,
        encrypted: !!settings.encryptionKey
    });

    notifyTabs('dataChanged');

    return { success: true, data: finalPayload, mode: 'merge', resolvedBy: strategy };
}

/* ---------- Расшифрованная сводка ---------- */

async function getServerSummary() {
    try {
        const settings = await getCachedSettings();
        if (!validateSettings(settings)) {
            return { success: false, error: tbg('syncSettingsEmpty') };
        }

        const raw = await download(settings);
        if (!raw) {
            return {
                success: true,
                data: {
                    tiles: [], folders: [], notes: [], noteFolders: [],
                    tombstones: {}, encrypted: false, empty: true
                }
            };
        }

        let payload = raw;
        let encrypted = false;

        if (_looksLikeEncryptedEnvelope(raw)) {
            encrypted = true;
            if (!settings.encryptionKey) {
                return {
                    success: false,
                    error: tbg('srvEncNoKeyShort')
                };
            }
            payload = await decryptData(raw, settings.encryptionKey);
        }

        const normalized = _normalizeServerPayload(payload);

        return {
            success: true,
            data: {
                tiles: normalized?.tiles || [],
                folders: normalized?.folders || [],
                notes: normalized?.notes || [],
                noteFolders: normalized?.noteFolders || [],
                tombstones: normalized?.tombstones || {},
                encrypted,
                empty: false
            }
        };
    } catch (e) {
        logWarn('sync.getServerSummary', e.message);
        return { success: false, error: e.message };
    }
}

/* ---------- Валидация / диспетчеры / история ---------- */

const _SERVICE_CHECKS = {
    webdav:    (s) => !!(s.webdavUrl && s.webdavUsername),
    nextcloud: (s) => !!(s.nextcloudUrl && s.nextcloudUsername),
    dropbox:   (s) => !!s.dropboxAccessToken,
    box:       (s) => !!(s.boxAccessToken && s.boxFileId),
    onedrive:  (s) => !!s.onedriveAccessToken,
    pcloud:    (s) => !!s.pcloudAccessToken,
    yandex:    (s) => !!s.yandexToken,
    mailru:    (s) => !!(s.mailruEmail && s.mailruPassword)
};

/* v6.9.4: валидация конкретного сервиса (для второго сервера) */
function validateSettingsFor(s, service) {
    return _SERVICE_CHECKS[service] ? !!_SERVICE_CHECKS[service](s) : false;
}

function validateSettings(s) {
    return validateSettingsFor(s, s.syncService);
}

async function download(s, service) {
    switch (service || s.syncService) {
        case 'webdav':    return WebDAVProvider.get(s.webdavUrl, s.webdavUsername, s.webdavPassword);
        case 'nextcloud': return WebDAVProvider.get(s.nextcloudUrl, s.nextcloudUsername, s.nextcloudPassword);
        case 'dropbox':   return DropboxProvider.get(s);
        case 'box':       return BoxProvider.get(s);
        case 'onedrive':  return OneDriveProvider.get(s);
        case 'pcloud':    return PCloudProvider.get(s);
        case 'yandex':    return YandexProvider.get(s);
        case 'mailru':    return MailruProvider.get(s);
        default: throw new Error(tbg('unknownProvider') + (service || s.syncService));
    }
}

async function upload(data, s, service) {
    switch (service || s.syncService) {
        case 'webdav':    return WebDAVProvider.put(data, s.webdavUrl, s.webdavUsername, s.webdavPassword);
        case 'nextcloud': return WebDAVProvider.put(data, s.nextcloudUrl, s.nextcloudUsername, s.nextcloudPassword);
        case 'dropbox':   return DropboxProvider.put(data, s);
        case 'box':       return BoxProvider.put(data, s);
        case 'onedrive':  return OneDriveProvider.put(data, s);
        case 'pcloud':    return PCloudProvider.put(data, s);
        case 'yandex':    return YandexProvider.put(data, s);
        case 'mailru':    return MailruProvider.put(data, s);
        default: throw new Error(tbg('unknownProvider') + (service || s.syncService));
    }
}

async function testConnection(service, settings) {
    /* v6.9.4: проверяем именно запрошенный сервис (для второго сервера) */
    const svc = service || (settings && settings.syncService);
    if (!settings || !validateSettingsFor(settings, svc)) {
        return { success: false, error: tbg('settingsIncomplete') };
    }

    try {
        logInfo('sync.testConnection', `Проверка сервиса: ${svc}`);
        const data = await download(settings, svc);

        let encryptionStatus = 'disabled';
        let decryptionOk = null;

        if (settings.encryptionKey && data) {
            if (_looksLikeEncryptedEnvelope(data)) {
                encryptionStatus = 'encrypted';
                try {
                    await decryptData(data, settings.encryptionKey);
                    decryptionOk = true;
                    logInfo('sync.testConnection', 'Расшифровка серверного файла прошла успешно');
                } catch (e) {
                    decryptionOk = false;
                    logWarn('sync.testConnection', 'Расшифровка серверного файла не удалась: ' + e.message);
                }
            } else if (_looksLikePlaintextPayload(data)) {
                encryptionStatus = 'plaintext-mismatch';
            } else {
                encryptionStatus = 'unknown-format';
            }
        } else if (data && _looksLikePlaintextPayload(data)) {
            encryptionStatus = 'plaintext-no-key';
        }

        if (data && Object.keys(data).length > 0) {
            await upload(data, settings, svc);
            logInfo('sync.testConnection',
                `Round-trip OK (encryption: ${encryptionStatus}, decryptionOk: ${decryptionOk})`);
        }

        return {
            success: true,
            hasFile: !!data,
            data,
            encryptionStatus,
            decryptionOk
        };
    } catch (e) {
        logError('sync.testConnection', e.message);
        return { success: false, error: e.message };
    }
}

async function pushSyncHistory(entry) {
    try {
        const stored = await api.storage.local.get('syncHistory');
        const history = Array.isArray(stored.syncHistory) ? stored.syncHistory : [];
        history.unshift(entry);
        await api.storage.local.set({
            syncHistory: history.slice(0, SYNC_HISTORY_MAX)
        });
    } catch (e) {
        logWarn('sync.pushSyncHistory', e.message);
    }
}

self.syncData = syncData;
self.resolveSyncConflict = resolveSyncConflict;
self.getServerSummary = getServerSummary;
self.getSyncState = getSyncState;
self.setSyncState = setSyncState;
self.getPendingConflict = getPendingConflict;
self.testConnection = testConnection;
self.validateSettings = validateSettings;
self.validateSettingsFor = validateSettingsFor;
self._buildSyncPayload = _buildSyncPayload;
self._applySyncPayload = _applySyncPayload;
self._mergePayloads = _mergePayloads;
self._decodeServerPayload = _decodeServerPayload;
self._computeSyncDiff = _computeSyncDiff;
self._normalizeEntityTimestamps = _normalizeEntityTimestamps;
self._looksLikeEncryptedEnvelope = _looksLikeEncryptedEnvelope;
self._looksLikePlaintextPayload = _looksLikePlaintextPayload;