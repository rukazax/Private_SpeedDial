'use strict';

/* ============================================================
   background.js — точка входа MV3 Service Worker.

   v6.6.6:
   - _seedBundledBackground проставляет settingsUpdatedAt
     при программной установке bundled-фона. Это гарантирует,
     что при первом sync LWW выберет локальные настройки
     (фон уже установлен), а не пустые серверные.
   - Остальное — как в v6.6.0.
   ============================================================ */

const api = chrome;
/* exported FILE — используется провайдерами в background/providers/ */
const FILE = 'private-speeddial.json';
const speedDialUrl = api.runtime.getURL('newtab.html');

let activeProfile = 'default';

const memoryCache = { settings: null };

importScripts(
    'project.js',
    'project-welcome.js',
    'defaults.js',
    'translations.js',
    'common.js',
    'idb.js',
    'logger.js',
    'currency.js',
    'favicon-cache.js',

    'background/tabs.js',
    'background/alarms.js',
    'background/profiles.js',

    'background/providers/webdav.js',
    'background/providers/dropbox.js',
    'background/providers/box.js',
    'background/providers/onedrive.js',
    'background/providers/pcloud.js',
    'background/providers/yandex.js',
    'background/providers/mailru.js',

    'background/sync.js',

    'parser-worker.js'
);

async function getSettings() {
    return api.storage.sync.get(DEFAULT_SETTINGS);
}

async function getCachedSettings() {
    if (memoryCache.settings) return memoryCache.settings;
    memoryCache.settings = await getSettings();
    return memoryCache.settings;
}

async function saveSettings(settings) {
    await api.storage.sync.set(settings);
    memoryCache.settings = settings;
}

/* ============================================================
   Bundled-фон + LWW-таймстемп
   ============================================================ */

async function _seedBundledBackground() {
    try {
        const settings = await getCachedSettings();

        if (Array.isArray(settings.backgrounds) && settings.backgrounds.length > 0) {
            logInfo('background._seedBundled', 'Уже есть фоны — пропуск');
            return;
        }
        if (settings.activeBackgroundId) {
            logInfo('background._seedBundled', 'Активный фон уже задан — пропуск');
            return;
        }

        const url = api.runtime.getURL(BUNDLED_BACKGROUND_PATH);
        const resp = await fetch(url);
        if (!resp.ok) {
            logWarn('background._seedBundled', `Не удалось загрузить ${BUNDLED_BACKGROUND_PATH} (${resp.status})`);
            return;
        }

        const blob = await resp.blob();
        const dataUrl = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });

        await saveBackgroundBlob(BUNDLED_BACKGROUND_REF, dataUrl);

        const bgEntry = {
            id: BUNDLED_BACKGROUND_ID,
            name: BUNDLED_BACKGROUND_NAME,
            type: 'image-file',
            value: '',
            ref: BUNDLED_BACKGROUND_REF,
            opacity: 100,
            brightness: 100,
            position: 'cover'
        };

        settings.backgrounds = [bgEntry];
        settings.activeBackgroundId = BUNDLED_BACKGROUND_ID;
        /* v6.7.0: settingsUpdatedAt НЕ трогаем — иначе дефолтные настройки
           нового устройства перебьют серверные при первом sync. */
        await saveSettings(settings);

        logInfo('background._seedBundled',
            `Bundled-фон установлен (${(blob.size / 1024).toFixed(0)} КБ), LWW-таймстемп не изменён`);
    } catch (e) {
        logWarn('background._seedBundled', e.message);
    }
}

/* ---------- Инвалидация кеша ---------- */

/* v6.9.4: автосинхронизация при любом изменении данных/настроек.
   Дебаунс 30с — подряд идущие правки (формы, drag-n-drop) сливаются
   в одну синхронизацию; частоту ограничивает и SYNC_RATE_LIMIT. */
let _syncOnChangeTimer = null;
function scheduleSyncOnChange() {
    if (_syncOnChangeTimer) clearTimeout(_syncOnChangeTimer);
    _syncOnChangeTimer = setTimeout(async () => {
        _syncOnChangeTimer = null;
        try {
            const settings = await getCachedSettings();
            if (!settings.autoSync || !validateSettings(settings)) return;
            logInfo('background.syncOnChange', 'Запуск автосинхронизации по изменению');
            const r = await syncData('merge');
            /* попали в rate-limit — переносим на указанное время */
            if (r && !r.success && r.retryIn) {
                setTimeout(() => scheduleSyncOnChange(), (r.retryIn + 2) * 1000);
            }
        } catch (e) {
            logDebug('background.syncOnChange', e.message);
        }
    }, 30000);
}

api.storage.onChanged.addListener((changes, area) => {
    if (area === 'sync') {
        memoryCache.settings = null;
        logDebug('background.onChanged', 'Кеш настроек сброшен', { keys: Object.keys(changes) });

        /* v6.9.4: изменение настроек → автосинхронизация (кроме применённых синком) */
        if (!self._syncAppliedAt || Date.now() - self._syncAppliedAt > 15000) {
            scheduleSyncOnChange();
        }

        /* v6.9.2: язык сообщений фонового контекста */
        if (changes.forcedLanguage) {
            self._uiLang = resolveUILanguage(changes.forcedLanguage.newValue || 'auto');
        }
        /* v6.9.3: синхронный флаг для tabs.onRemoved (гонка с закрытием окна) */
        if (changes.syncInterval || changes.autoSync) setupAlarms().catch(() => {});
        if (changes.autoLockTimeout) setupAutoLock().catch(() => {});
        if (changes.bgRotateEnabled || changes.bgRotateInterval || changes.backgrounds) setupBackgroundRotation().catch(() => {});
        if (changes.currencyPairs || changes.currencyWidget) refreshCurrencyIfNeeded(true).catch(() => {});
        if (changes.mailruEmail || changes.mailruFolder) {
            if (typeof MailruProvider !== 'undefined' && MailruProvider.resetCache) {
                MailruProvider.resetCache().catch(() => {});
            }
        }
    } else if (area === 'local') {
        if (changes.profiles || changes.activeProfile) {
            api.storage.local.get('activeProfile').then(d => {
                activeProfile = d.activeProfile || 'default';
            });
        }
    }
});

/* ---------- Install / Startup ---------- */

api.runtime.onInstalled.addListener(async (details) => {
    try {
        await logInit('info');
        logInfo('background.onInstalled', `reason=${details.reason}`);

        if (details.reason === 'install') {
            const existing = await loadDataFromIDB();
            if (!existing) {
                const now = Date.now();
                await saveDataToIDB({
                    tiles: [
                        {
                            id: 'tile_econa_default',
                            title: 'Private SpeedDial',
                            url: 'https://github.com/rukazax/Private_SpeedDial',
                            icon: getFaviconUrl('https://github.com/rukazax/Private_SpeedDial'),
                            bgColor: '#667eea',
                            textColor: '#ffffff',
                            folderId: '',
                            tags: [],
                            opacity: 100,
                            iconOpacity: 100,
                            showTitle: true,
                            bgImage: '',
                            reminder: null,
                            autoColor: false,
                            createdAt: now,
                            updatedAt: now
                        },
                        {
                            id: 'tile_youtube_default',
                            title: 'YouTube',
                            url: 'https://www.youtube.com/@rukazax',
                            icon: getFaviconUrl('https://www.youtube.com/@rukazax'),
                            bgColor: '#FF0000',
                            textColor: '#ffffff',
                            folderId: '',
                            tags: [],
                            opacity: 100,
                            iconOpacity: 100,
                            showTitle: true,
                            bgImage: '',
                            reminder: null,
                            autoColor: false,
                            createdAt: now,
                            updatedAt: now
                        }
                    ],
                    folders: [],
                    notes: [],
                    noteFolders: [],
                    folderPasswords: {},
                    tombstones: {},
                    headerHidden: false,
                    sidebarCollapsed: false
                });
                logInfo('background.onInstalled', 'Созданы 2 преднастроенных диала (Private SpeedDial, YouTube)');
            }
            await _seedBundledBackground();
            api.tabs.create({ url: speedDialUrl });
        }

        const profileData = await api.storage.local.get(['profiles', 'activeProfile']);
        if (!profileData.profiles) {
            await api.storage.local.set({ profiles: { default: { speedDialData: null } } });
        }
        activeProfile = profileData.activeProfile || 'default';

        await setupContextMenus();
        await setupAlarms();
        await setupAutoLock();
        await refreshCurrencyIfNeeded(true);

        logInfo('background.onInstalled', 'Инициализация завершена');
    } catch (e) {
        logError('background.onInstalled', e.message, { stack: e.stack });
    }
});

api.runtime.onStartup.addListener(async () => {
    try {
        await logInit('info');
        logInfo('background.onStartup', 'Старт браузера');

        const profileData = await api.storage.local.get('activeProfile');
        activeProfile = profileData.activeProfile || 'default';

        await setupAlarms();
        await setupAutoLock();
        await refreshCurrencyIfNeeded(false);
    } catch (e) {
        logError('background.onStartup', e.message);
    }
});

/* ---------- Горячие клавиши ---------- */

api.commands.onCommand.addListener(async (command) => {
    logInfo('background.command', command);
    try {
        if (command === 'open-speed-dial') {
            api.tabs.create({ url: speedDialUrl });
        } else if (command === 'sync-now') {
            await syncData('merge', { manual: true });
        } else if (command === 'search-tiles') {
            api.tabs.query({}, tabs => {
                const sdTab = tabs.find(t => t.url?.startsWith(speedDialUrl));
                if (sdTab) {
                    api.tabs.update(sdTab.id, { active: true });
                    api.tabs.sendMessage(sdTab.id, { action: 'focusSearch' }).catch(() => {});
                } else {
                    api.tabs.create({ url: speedDialUrl + '?focusSearch=1' });
                }
            });
        }
    } catch (e) {
        logError('background.onCommand', e.message, { command });
    }
});

/* ---------- Обработка сообщений ---------- */

api.runtime.onMessage.addListener((request, sender, sendResponse) => {
    const handlers = {
        projectClaimMobileWelcome: () => ProjectWelcome.claim(),
        syncNow: (req) => syncData(req?.syncType || 'merge', { manual: true }),
        testSyncConnection: (req) => testConnection(req.service, req.settings),

        getServerSummary: () => getServerSummary(),
        resolveSyncConflict: (req) => resolveSyncConflict(req.strategy),
        getSyncState: () => getSyncState(),

        getPendingConflict: async () => {
            const stored = await api.storage.local.get('pendingSyncConflict');
            return { success: true, pending: stored.pendingSyncConflict || null };
        },

        openSpeedDial: () => {
            api.tabs.create({ url: speedDialUrl });
            return { success: true };
        },
        getSpeedDialUrl: () => ({ url: speedDialUrl }),
        openOptionsAsPopup: () => openOptionsAsPopup(),
        closeOptions: () => closeSenderWindow(sender),
        refreshSpeedDial: () => {
            notifyTabs('dataChanged');
            return { success: true };
        },
        /* v6.9.4: данные изменены пользователем (закладка/папка/заметка) —
           автосинхронизация с дебаунсом */
        userDataChanged: () => {
            scheduleSyncOnChange();
            return { success: true };
        },
        reloadSpeedDialTabs: () => reloadAllSpeedDialTabs(),

        getHistory: (req) => getHistoryImpl(req.query),

        importBrowserBookmarks: () => importBrowserBookmarksImpl(),
        exportToBrowserBookmarks: (req) => exportToBrowserBookmarksImpl(req.tiles, req.folders),

        getProfiles: () => getProfiles(),
        switchProfile: (req) => switchProfile(req.profileName),
        getActiveProfile: () => ({ success: true, profile: activeProfile }),

        setDoNotDisturb: async (req) => {
            const settings = await getCachedSettings();
            settings.doNotDisturb = {
                enabled: !!req.enabled,
                start: req.start || '22:00',
                end: req.end || '08:00'
            };
            settings.settingsUpdatedAt = Date.now();
            await saveSettings(settings);
            return { success: true };
        },

        exportToHTML: () => exportToHTMLImpl(),
        importFromHTML: (req) => importFromHTMLImpl(req.html),
        importFromCSV: (req) => importFromCSVImpl(req.csv),

        lockNow: async () => {
            const data = await api.storage.local.get(['masterPasswordHash', 'masterPasswordRecord']);
            const hasPassword = !!(data.masterPasswordRecord || data.masterPasswordHash);
            if (!hasPassword) return { success: false, skipped: true, reason: 'no_password' };

            try {
                if (api.storage.session) {
                    await api.storage.session.set({ locked: true });
                }
            } catch (e) {
                logDebug('background.lockNow', 'session.set failed: ' + e.message);
            }

            notifyTabs('lockNow');
            return { success: true };
        },
        setAutoLock: () => setupAutoLock().then(() => ({ success: true })),

        activity: async () => {
            if (typeof markBrowserActivity === 'function') {
                await markBrowserActivity();
            }
            return { success: true };
        },

        unlocked: () => {
            notifyTabs('unlocked');
            return { success: true };
        },

        getFaviconSource: async () => {
            const settings = await getCachedSettings();
            return { success: true, source: settings.faviconSource };
        },
        setFaviconSource: async (req) => {
            const settings = await getCachedSettings();
            settings.faviconSource = req.source;
            settings.settingsUpdatedAt = Date.now();
            await saveSettings(settings);
            return { success: true };
        },

        getLocalEncryptionStatus: async () => {
            const settings = await getCachedSettings();
            return { success: true, enabled: !!settings.localEncryption?.enabled };
        },
        setLocalEncryption: async (req) => {
            const settings = await getCachedSettings();
            settings.localEncryption = { enabled: !!req.enabled, key: req.key || '' };
            settings.settingsUpdatedAt = Date.now();
            await saveSettings(settings);
            return { success: true };
        },

        getSyncLog: () => getSyncLogImpl(),
        getSyncHistory: () => getSyncHistoryImpl(),
        exportLogs: () => exportLogsImpl(),
        exportDetailedLogs: () => exportDetailedLogsImpl(),

        addTileFromContext: (req) => addTileFromContextImpl(req.url, req.title)
    };

    const handler = handlers[request.action];
    if (!handler) {
        sendResponse({ success: false, error: 'Unknown action: ' + request.action });
        return true;
    }

    Promise.resolve(handler(request))
        .then(sendResponse)
        .catch(e => {
            logError('background.onMessage', e.message, { action: request.action });
            sendResponse({ success: false, error: e.message });
        });

    return true;
});

/* ---------- Вспомогательные функции ---------- */

async function openOptionsAsPopup() {
    try {
        const win = await api.windows.create({
            url: api.runtime.getURL('options.html'),
            type: 'popup',
            width: 1080,
            height: 800
        });
        return { success: true, windowId: win.id };
    } catch (e) {
        logWarn('background.openOptionsAsPopup', 'Popup заблокирован, открываю вкладку', { error: e.message });
        try {
            const tab = await api.tabs.create({
                url: api.runtime.getURL('options.html'),
                active: true
            });
            return { success: true, tabId: tab.id };
        } catch (err) {
            logError('background.openOptionsAsPopup', err.message);
            return { success: false, error: err.message };
        }
    }
}

function closeSenderWindow(sender) {
    try {
        if (sender?.tab?.windowId) {
            api.windows.remove(sender.tab.windowId).catch(() => {});
        }
    } catch (e) {}
    return { success: true };
}

async function reloadAllSpeedDialTabs() {
    try {
        const tabs = await promisify(api.tabs.query, null, {});
        let reloaded = 0;
        for (const t of tabs) {
            if (t.url && t.url.startsWith(speedDialUrl)) {
                api.tabs.reload(t.id).catch(() => {});
                reloaded++;
            }
        }
        logInfo('background.reloadAllSpeedDialTabs', `Перезагружено ${reloaded} вкладок`);
        return { success: true, reloaded };
    } catch (e) {
        return { success: false, error: e.message };
    }
}

async function getHistoryImpl(query) {
    if (!api.history?.search) {
        return { success: false, error: 'History API unavailable' };
    }
    try {
        const items = await promisify(api.history.search, api.history, {
            text: query || '',
            maxResults: 30,
            startTime: Date.now() - 30 * 24 * 60 * 60 * 1000
        });
        return {
            success: true,
            history: (items || []).map(i => ({ url: i.url, title: i.title || i.url }))
        };
    } catch (e) {
        return { success: false, error: e.message };
    }
}

async function importBrowserBookmarksImpl() {
    if (!api.bookmarks?.getTree) {
        return { success: false, error: 'Bookmarks API unavailable' };
    }

    try {
        const tree = await promisify(api.bookmarks.getTree, api.bookmarks);
        const bookmarks = [];
        const folders = [];
        const now = Date.now();

        function extract(nodes, parentFolderId) {
            for (const node of nodes) {
                if (node.url) {
                    bookmarks.push({
                        id: `bm_${node.id}`,
                        title: node.title || node.url,
                        url: node.url,
                        icon: getFaviconUrl(node.url),
                        bgColor: '#4CAF50',
                        textColor: '#fff',
                        folderId: parentFolderId || '',
                        tags: [],
                        opacity: 100,
                        iconOpacity: 100,
                        showTitle: true,
                        bgImage: '',
                        reminder: null,
                        autoColor: false,
                        createdAt: now,
                        updatedAt: now
                    });
                } else if (node.children) {
                    /* Корень дерева не имеет title — просто спускаемся,
                       иначе импорт всегда возвращает пустой список */
                    const isRoot = !node.title;
                    const isContainer = ['Bookmarks bar', 'Закладки', 'Other bookmarks',
                        'Другие закладки', 'Mobile bookmarks', 'Мобильные закладки'].includes(node.title);

                    if (isRoot || isContainer) {
                        extract(node.children, parentFolderId);
                    } else {
                        const folderId = `bmf_${node.id}`;
                        folders.push({
                            id: folderId,
                            name: node.title,
                            color: '#666',
                            textColor: '#ffffff',
                            opacity: 100,
                            password: '',
                            parentId: parentFolderId || '',
                            createdAt: now,
                            updatedAt: now
                        });
                        extract(node.children, folderId);
                    }
                }
            }
        }

        extract(tree, '');
        return { success: true, bookmarks, folders };
    } catch (e) {
        return { success: false, error: e.message };
    }
}

async function exportToBrowserBookmarksImpl(tiles, folders) {
    if (!api.bookmarks?.create) {
        return { success: false, error: 'Bookmarks API unavailable' };
    }

    try {
        /* Повторный экспорт не должен плодить дубли:
           удаляем прежнюю корневую папку Private SpeedDial */
        const existing = await promisify(api.bookmarks.search, api.bookmarks, { title: 'Private SpeedDial' });
        for (const node of (existing || [])) {
            if (!node.url) {
                await promisify(api.bookmarks.removeTree, api.bookmarks, node.id).catch(() => {});
            }
        }

        const main = await promisify(api.bookmarks.create, api.bookmarks, { title: 'Private SpeedDial' });
        const folderMap = {};

        const childrenMap = {};
        for (const f of folders || []) {
            const pid = f.parentId || '';
            if (!childrenMap[pid]) childrenMap[pid] = [];
            childrenMap[pid].push(f);
        }

        const createFolder = async (f, parentId) => {
            const created = await promisify(api.bookmarks.create, api.bookmarks, {
                parentId,
                title: f.name || 'Folder'
            });
            folderMap[f.id] = created.id;
            for (const child of (childrenMap[f.id] || [])) {
                await createFolder(child, created.id);
            }
        };

        for (const f of (childrenMap[''] || [])) {
            await createFolder(f, main.id);
        }

        for (const t of tiles || []) {
            await promisify(api.bookmarks.create, api.bookmarks, {
                parentId: t.folderId && folderMap[t.folderId] ? folderMap[t.folderId] : main.id,
                title: t.title || t.url,
                url: t.url
            });
        }

        return { success: true, count: (tiles || []).length };
    } catch (e) {
        return { success: false, error: e.message };
    }
}

async function exportToHTMLImpl() {
    try {
        const data = (await loadDataFromIDB()) || {};

        const childrenMap = {};
        for (const f of (data.folders || [])) {
            const pid = f.parentId || '';
            if (!childrenMap[pid]) childrenMap[pid] = [];
            childrenMap[pid].push(f);
        }

        const tilesByFolder = {};
        for (const t of (data.tiles || [])) {
            const fid = t.folderId || '';
            if (!tilesByFolder[fid]) tilesByFolder[fid] = [];
            tilesByFolder[fid].push(t);
        }

        let html = '<!DOCTYPE NETSCAPE-Bookmark-file-1>\n';
        html += '<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">\n';
        html += '<TITLE>Bookmarks</TITLE>\n';
        html += '<H1>Private SpeedDial</H1>\n';
        html += '<DL><p>\n';

        const renderFolder = (folder, indent) => {
            const pad = '    '.repeat(indent);
            html += `${pad}<DT><H3>${escapeHtml(folder.name)}</H3>\n`;
            html += `${pad}<DL><p>\n`;
            for (const t of (tilesByFolder[folder.id] || [])) {
                html += `${pad}    <DT><A HREF="${escapeHtml(t.url)}">${escapeHtml(t.title || t.url)}</A>\n`;
            }
            for (const child of (childrenMap[folder.id] || [])) {
                renderFolder(child, indent + 1);
            }
            html += `${pad}</DL><p>\n`;
        };

        for (const folder of (childrenMap[''] || [])) {
            renderFolder(folder, 1);
        }

        for (const t of (tilesByFolder[''] || [])) {
            html += `    <DT><A HREF="${escapeHtml(t.url)}">${escapeHtml(t.title || t.url)}</A>\n`;
        }

        html += '</DL><p>\n';
        return { success: true, html };
    } catch (e) {
        return { success: false, error: e.message };
    }
}

async function importFromHTMLImpl(html) {
    const tiles = await runWorker('parseHTML', html);
    if (!tiles.length) return { success: false, error: tbg('noLinksFound') };

    const current = (await loadDataFromIDB()) || {
        tiles: [], folders: [], notes: [], noteFolders: [], folderPasswords: {}, tombstones: {}
    };
    current.tiles = (current.tiles || []).concat(tiles);
    await saveDataToIDB(current);
    notifyTabs('dataChanged');
    scheduleSyncOnChange(); /* v6.9.4: автосинк после импорта */
    return { success: true, imported: tiles.length };
}

async function importFromCSVImpl(csv) {
    const tiles = await runWorker('parseCSV', csv);
    if (!tiles.length) return { success: false, error: tbg('noValidUrls') };

    const current = (await loadDataFromIDB()) || {
        tiles: [], folders: [], notes: [], noteFolders: [], folderPasswords: {}, tombstones: {}
    };
    current.tiles = (current.tiles || []).concat(tiles);
    await saveDataToIDB(current);
    notifyTabs('dataChanged');
    scheduleSyncOnChange(); /* v6.9.4: автосинк после импорта */
    return { success: true, imported: tiles.length };
}

async function runWorker(type, payload) {
    /* v6.7.0: в MV3 service worker конструктор Worker недоступен —
       парсим напрямую (parser-worker.js подключён через importScripts). */
    try {
        if (type === 'parseHTML') return self.parseHTML(payload || '');
        if (type === 'parseCSV') return self.parseCSV(payload || '');
    } catch (e) {
        logError('background.runWorker', e.message);
    }
    return [];
}

async function getSyncLogImpl() {
    const logs = await logDump();
    return { success: true, log: logs };
}

async function getSyncHistoryImpl() {
    const stored = await api.storage.local.get('syncHistory');
    return { success: true, history: stored.syncHistory || [] };
}

async function exportLogsImpl() {
    const logs = await logDump();
    const stored = await api.storage.local.get('syncHistory');
    return {
        success: true,
        version: api.runtime.getManifest().version,
        userAgent: navigator.userAgent,
        exportedAt: new Date().toISOString(),
        logs,
        history: stored.syncHistory || []
    };
}

async function exportDetailedLogsImpl() {
    try {
        const report = await buildDetailedLogsReport();
        logInfo('background.exportDetailedLogs', 'Отчёт собран');
        return { success: true, ...report };
    } catch (e) {
        logError('background.exportDetailedLogs', e.message);
        return { success: false, error: e.message };
    }
}

async function buildDetailedLogsReport() {
    const manifest = api.runtime.getManifest();

    const metadata = {
        extensionName: manifest.name,
        extensionVersion: manifest.version,
        userAgent: navigator.userAgent,
        language: navigator.language,
        languages: navigator.languages || [],
        timeZone: (() => {
            try { return Intl.DateTimeFormat().resolvedOptions().timeZone; }
            catch (e) { return 'unknown'; }
        })(),
        platform: navigator.platform || 'unknown',
        hardwareConcurrency: navigator.hardwareConcurrency || null,
        deviceMemory: navigator.deviceMemory || null,
        generatedAt: new Date().toISOString(),
        generatedAtLocal: new Date().toString()
    };

    const settings = await getCachedSettings();
    const logs = await logDump();
    const recentErrors = (typeof getRecentErrors === 'function') ? getRecentErrors(20) : [];

    const historyStored = await api.storage.local.get('syncHistory');
    const syncHistory = historyStored.syncHistory || [];

    const storageState = await getStorageState().catch(e => ({ error: e.message }));
    const idbState = await getIDBState().catch(e => ({ error: e.message }));

    const alarms = await new Promise(resolve => {
        try { api.alarms.getAll(list => resolve(list || [])); }
        catch (e) { resolve([]); }
    });

    const permissions = await new Promise(resolve => {
        try { api.permissions.getAll(data => resolve(data || {})); }
        catch (e) { resolve({}); }
    });

    let faviconCacheSize = 0;
    try {
        const cache = await caches.open('favicon-v2');
        const keys = await cache.keys();
        faviconCacheSize = keys.length;
    } catch (e) {}

    const providers = {
        current: settings.syncService,
        lastSyncTime: (await api.storage.local.get('lastSyncTime')).lastSyncTime || null,
        lastSyncStatus: syncHistory[0]?.status || null,
        lastSyncError: syncHistory[0]?.error || null,
        lastSyncDuration: syncHistory[0]?.durationMs || null
    };

    const profilesData = await api.storage.local.get(['profiles', 'activeProfile']);
    const profilesInfo = {
        active: profilesData.activeProfile || 'default',
        count: Object.keys(profilesData.profiles || {}).length,
        names: Object.keys(profilesData.profiles || {})
    };

    const data = (await loadDataFromIDB()) || {};
    const counters = {
        tiles: (data.tiles || []).length,
        folders: (data.folders || []).length,
        notes: (data.notes || []).length,
        noteFolders: (data.noteFolders || []).length,
        folderPasswords: Object.keys(data.folderPasswords || {}).length,
        tombstones: Object.keys(data.tombstones || {}).length
    };

    return {
        metadata, settings, counters, storageState, idbState,
        logs, recentErrors, syncHistory, providers, profilesInfo,
        faviconCacheSize,
        alarms: alarms.map(a => ({
            name: a.name,
            scheduledTime: a.scheduledTime ? new Date(a.scheduledTime).toISOString() : null,
            periodInMinutes: a.periodInMinutes || null
        })),
        permissions: {
            permissions: permissions.permissions || [],
            origins: permissions.origins || []
        }
    };
}

async function getStorageState() {
    const result = {
        sync: { keys: [], bytes: 0, quotaBytes: 102400 },
        local: { keys: [], bytes: 0, quotaBytes: 10485760 }
    };

    try {
        const syncData = await api.storage.sync.get(null);
        result.sync.keys = Object.keys(syncData);
        result.sync.bytes = JSON.stringify(syncData).length;
    } catch (e) {}

    try {
        const localData = await api.storage.local.get(null);
        delete localData.debugLog;
        result.local.keys = Object.keys(localData);
        result.local.bytes = JSON.stringify(localData).length;
    } catch (e) {}

    return result;
}

async function getIDBState() {
    const result = { stores: {}, totalBytes: 0 };
    try {
        const dataStore = await idbGet('data', 'main');
        if (dataStore) {
            const bytes = JSON.stringify(dataStore).length;
            result.stores.data = { bytes, keys: ['main'] };
            result.totalBytes += bytes;
        }

        const bgStore = await idbGetAll('backgrounds');
        if (bgStore && Object.keys(bgStore).length) {
            const bytes = JSON.stringify(bgStore).length;
            result.stores.backgrounds = { bytes, keys: Object.keys(bgStore) };
            result.totalBytes += bytes;
        }
    } catch (e) {
        logWarn('background.getIDBState', e.message);
        throw e;
    }
    return result;
}

async function addTileFromContextImpl(url, title) {
    if (!url) return { success: false, error: tbg('urlRequired') };

    const normalizedUrl = normalizeUrl(url);
    if (!normalizedUrl) return { success: false, error: tbg('badUrl') };

    const current = (await loadDataFromIDB()) || {
        tiles: [], folders: [], notes: [], noteFolders: [], folderPasswords: {}, tombstones: {}
    };
    current.tiles = current.tiles || [];

    const favicon = await getCachedFavicon(normalizedUrl).catch(() => getFaviconUrl(normalizedUrl));
    const now = Date.now();

    current.tiles.push({
        id: `tile_${now}`,
        title: title || normalizedUrl,
        url: normalizedUrl,
        icon: favicon,
        bgColor: '#4CAF50',
        textColor: '#fff',
        folderId: '',
        tags: [],
        opacity: 100,
        iconOpacity: 100,
        showTitle: true,
        bgImage: '',
        reminder: null,
        autoColor: false,
        createdAt: now,
        updatedAt: now
    });

    await saveDataToIDB(current);
    notifyTabs('dataChanged');
    scheduleSyncOnChange(); /* v6.9.4: автосинк после добавления из контекстного меню */
    return { success: true };
}

/* ---------- Bootstrap ---------- */

(async () => {
    try {
        await logInit('info');

        const data = await api.storage.local.get('activeProfile');
        activeProfile = data.activeProfile || 'default';

        /* v6.9.2: язык сообщений фонового контекста из настроек */
        try {
            const langData = await api.storage.sync.get('forcedLanguage');
            self._uiLang = resolveUILanguage(langData.forcedLanguage || 'auto');
        } catch (_) { /* fallback на navigator внутри tbg */ }


        const lockData = await api.storage.local.get(['syncInProgress', 'syncStartedAt']);
        if (lockData.syncInProgress) {
            const age = Date.now() - (lockData.syncStartedAt || 0);
            if (age > 5 * 60 * 1000) {
                await api.storage.local.remove(['syncInProgress', 'syncStartedAt']);
                logWarn('background.bootstrap', `Сброшен залипший syncInProgress (возраст ${Math.round(age / 1000)} с)`);
            }
        }

        logInfo('background.bootstrap', `Service worker загружен (профиль: ${activeProfile})`);
    } catch (e) {
        console.error('background.bootstrap failed:', e);
    }
})();