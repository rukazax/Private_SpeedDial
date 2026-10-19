'use strict';

/* ============================================================
   tabs.js — перехват новых вкладок, уведомление SpeedDial-вкладок,
   контекстное меню, отметки активности для автоблокировки.

   v6.5.5:
   - Слушатели активности в браузере:
     windows.onFocusChanged, tabs.onActivated, tabs.onUpdated.
     Каждое событие вызывает markBrowserActivity() — сбрасывает
     таймер автоблокировки (см. alarms.js).

   v6.5.0:
   - chrome-search:// и edge:// в isNewTabUrl.
   ============================================================ */

function notifyTabs(action, payload = {}) {
    try {
        api.tabs.query({}, tabs => {
            (tabs || []).forEach(t => {
                if (t.url && t.url.startsWith(speedDialUrl)) {
                    api.tabs.sendMessage(t.id, { action, ...payload }).catch(() => {});
                }
            });
        });
    } catch (e) {
        logWarn('tabs.notifyTabs', e.message, { action });
    }
}

function isNewTabUrl(url) {
    if (!url) return false;
    if (url.startsWith('chrome-extension://')) return false;
    if (url.startsWith('moz-extension://')) return false;
    if (url.startsWith(speedDialUrl)) return false;
    if (url.startsWith('chrome://') && !url.includes('newtab')) return false;
    if (url.startsWith('edge://') && !url.includes('newtab')) return false;

    const exact = [
        'chrome://newtab/',
        'chrome-search://local-ntp/local-ntp.html',
        'edge://newtab/',
        'opera://startpage/',
        'about:newtab',
        'about:home'
    ];
    return exact.includes(url);
}

function redirectToSpeedDial(tabId) {
    api.tabs.get(tabId, (tab) => {
        if (api.runtime.lastError || !tab) return;
        if (isNewTabUrl(tab.url)) {
            api.tabs.update(tabId, { url: speedDialUrl }).catch(() => {});
        }
    });
}

api.tabs.onCreated.addListener(tab => {
    if (tab.pendingUrl && tab.pendingUrl.startsWith(speedDialUrl)) return;
    if (isNewTabUrl(tab.pendingUrl) || isNewTabUrl(tab.url)) {
        setTimeout(() => redirectToSpeedDial(tab.id), 100);
    }
});

api.tabs.onUpdated.addListener((tabId, info) => {
    if (info.url && isNewTabUrl(info.url)) {
        setTimeout(() => redirectToSpeedDial(tabId), 100);
    }
    // v6.5.5: активность в браузере
    if (info.status === 'complete' || info.url) {
        if (typeof markBrowserActivity === 'function') markBrowserActivity();
    }
});

/* (v6.9.8: функционал keepBrowserOpen / «Don't Close Window With Last Tab» удалён) */

/* ---------- v6.5.5: активность в браузере для автоблокировки ---------- */

if (api.tabs && api.tabs.onActivated) {
    api.tabs.onActivated.addListener(() => {
        if (typeof markBrowserActivity === 'function') markBrowserActivity();
    });
}

if (api.windows && api.windows.onFocusChanged) {
    api.windows.onFocusChanged.addListener((windowId) => {
        // WINDOW_ID_NONE означает, что фокус ушёл из браузера.
        // Пока фокус вернётся — считаем бездействием.
        if (windowId !== api.windows.WINDOW_ID_NONE) {
            if (typeof markBrowserActivity === 'function') markBrowserActivity();
        }
    });
}

/* ---------- Контекстное меню ---------- */

async function setupContextMenus() {
    try {
        await new Promise(resolve => api.contextMenus.removeAll(resolve));

        /* v6.9.0: заголовок меню — на языке интерфейса */
        let lang = 'en';
        try {
            const stored = await new Promise(r => api.storage.sync.get(['forcedLanguage'], r));
            lang = resolveUILanguage(stored && stored.forcedLanguage);
        } catch (e) { /* fallback en */ }

        api.contextMenus.create({
            id: 'add-to-speeddial',
            title: translateKey(lang, 'ctxAddToSpeeddial'),
            contexts: ['page', 'link', 'selection', 'action']
        });

        logInfo('tabs.setupContextMenus', 'Контекстное меню создано');
    } catch (e) {
        logError('tabs.setupContextMenus', e.message);
    }
}

api.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId !== 'add-to-speeddial') return;

    const url = info.linkUrl || info.pageUrl || info.selectionText || tab?.url || '';
    const title = info.linkText || info.selectionText || tab?.title || url;
    if (!url) return;

    logInfo('tabs.contextMenu.onClicked', `URL: ${url}`);

    api.tabs.query({ url: speedDialUrl + '*' }, (tabs) => {
        if (tabs.length > 0) {
            api.tabs.update(tabs[0].id, { active: true });
            api.tabs.sendMessage(tabs[0].id, {
                action: 'openAddTileModal', url, title
            }).catch(() => {});
        } else {
            const openUrl = `${speedDialUrl}?addTile=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`;
            api.tabs.create({ url: openUrl });
        }
    });
});

self.notifyTabs = notifyTabs;
self.setupContextMenus = setupContextMenus;
self.isNewTabUrl = isNewTabUrl;