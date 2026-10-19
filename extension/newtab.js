'use strict';

const api = chrome;

/* ============================================================
   SpeedDial — главная страница.

   v6.6.6:
   - _touchSettings(): единая точка обновления settingsUpdatedAt
     при явных изменениях настроек. Это защищает от ситуации,
     когда настройка «слетает» после автосинка.
   - Остальное — как в v6.6.5.
   ============================================================ */

class SpeedDial {
    constructor() {
        this.tiles = [];
        this.folders = [];
        this.notes = [];
        this.noteFolders = [];
        this.folderPasswords = {};
        this.tombstones = {};
        this.unlockedFolders = new Set();

        this.currentFolder = 'all';
        this.currentNoteFolder = 'all';
        this.settings = {};
        this.currentTheme = 'dark';
        this.currentLanguage = 'ru';
        this.translations = window.translations || {};

        this.dragState = { type: null, id: null, el: null, startX: 0, startY: 0, active: false, lastOver: null };

        this.tilesLimit = 50;
        this.notesLimit = 50;
        this.scrollObserver = null;
        this._searchTimer = null;
        this._historyTimer = null;
        this.currencyTimer = null;
        this.pendingFolderUnlock = null;
        this._toastTimer = null;
        this._storageListenerBound = false;
        this._eventsBound = false;
        this._activityBound = false;
        this._passTogglesBound = false;
        this._lastActivitySent = 0;
        this._collator = null;

        this._uiStateTimer = null;
        this._uiStateSaved = false;
        this._lastUiState = '';

        this._selfInitiatedUntil = 0;

        this._autoColorTimer = null;
        this._autoColorPreviewToken = 0;

        this._initialized = false;
        this._lockCleanup = null;

        this._pickContrastColor = (typeof self !== 'undefined' && self._pickContrastColor)
            ? self._pickContrastColor
            : (typeof window !== 'undefined' && window._pickContrastColor)
                ? window._pickContrastColor
                : this._fallbackContrastColor.bind(this);
    }

    /* ============================================================
       v6.6.6: пометить настройки как только что изменённые.
       Вызывается ТОЛЬКО при явном действии пользователя.
       ============================================================ */

    _touchSettings() {
        const ts = Date.now();
        this.settings.settingsUpdatedAt = ts;
        try {
            api.storage.sync.set({ settingsUpdatedAt: ts }).catch(() => {});
        } catch (e) {
            /* ignore */
        }
    }

    async init() {
        if (this._initialized) return;
        this._initialized = true;
        try {
            await logInit('info');
            logInfo('newtab.init', 'Старт');

            const lockData = await api.storage.local.get(['masterPasswordHash', 'masterPasswordRecord']);
            const hasPassword = !!(lockData.masterPasswordRecord || lockData.masterPasswordHash);

            const sessionLocked = await this._isSessionLocked();

            if (hasPassword && sessionLocked) {
                logInfo('newtab.init', 'Сессия заблокирована — показываем lock screen');
                this.showLockScreen();
                return;
            }

            await this.initializeApp();
        } catch (e) {
            logError('newtab.init', e.message, { stack: e.stack });
            this._initialized = false;
        }
    }

    async _isSessionLocked() {
        try {
            if (api.storage.session) {
                const d = await api.storage.session.get('locked');
                if (d.locked === true) return true;
                if (d.locked === false) return false;
                return true;
            }
        } catch (e) {
            logDebug('newtab._isSessionLocked', e.message);
        }
        return false;
    }

    async _setSessionLocked(locked) {
        try {
            if (api.storage.session) {
                await api.storage.session.set({ locked: !!locked });
            }
        } catch (e) {
            logDebug('newtab._setSessionLocked', e.message);
        }
    }

    _broadcastUnlocked() {
        try {
            api.runtime.sendMessage({ action: 'unlocked' }).catch(() => {});
        } catch (e) {}
    }

    async initializeApp() {
        try {
            attachButtonFeedback(document);

            await this.loadSettings();
            this.bindStorageListener();
            this.setLanguage();
            this.applyTheme();
            this.applyDesignSettings();
            await this.loadData();
            this.setupEvents();
            this.setupPasswordToggles();
            this.setupActivityTracker();
            await this.renderAll();
            this.applyTranslations();
            this.applySidebarState();
            this.applyHeaderState();
            this.applyBackgrounds();
            this.setupCurrencyWidget();
            this.setupAutoLock();
            this.setupScrollObserver();
            this._handleUrlParams();
            logInfo('newtab.initializeApp', 'Готово');
        } catch (e) {
            logError('newtab.initializeApp', e.message, { stack: e.stack });
        }
    }

    /* v6.7.0: параметры из контекстного меню и горячей клавиши */
    _handleUrlParams() {
        try {
            const p = new URLSearchParams(location.search);
            const addUrl = p.get('addTile');
            if (addUrl) {
                this.showAddTileModal(addUrl, p.get('title') || '');
            } else if (p.get('focusSearch')) {
                document.getElementById('searchInput')?.focus();
            } else {
                return;
            }
            history.replaceState(null, '', location.pathname);
        } catch (e) {
            logWarn('newtab._handleUrlParams', e.message);
        }
    }

    showLockScreen() {
        const existing = document.getElementById('lockScreen');
        if (existing) {
            const exInput = document.getElementById('masterPass');
            if (exInput) {
                try { exInput.focus({ preventScroll: true }); } catch (e) {}
            }
            return;
        }

        const lock = document.createElement('div');
        lock.id = 'lockScreen';
        lock.style.cssText =
            'position:fixed;inset:0;background:var(--bg);display:flex;' +
            'align-items:center;justify-content:center;flex-direction:column;' +
            'gap:10px;padding:20px;z-index:9999;';

        const h = document.createElement('h2');
        h.textContent = this.t('stEnterMasterPwd');
        h.style.color = 'var(--text)';
        lock.appendChild(h);

        const wrap = document.createElement('div');
        wrap.style.cssText = 'position:relative;display:flex;width:280px';

        const inp = document.createElement('input');
        inp.type = 'password';
        inp.id = 'masterPass';
        inp.inputMode = 'text';
        inp.autocomplete = 'current-password';
        inp.spellcheck = false;
        inp.setAttribute('aria-label', this.t('mpAriaLabel'));
        inp.style.cssText =
            'flex:1;padding:8px;border-radius:5px;border:1px solid var(--border);' +
            'background:var(--tile);color:var(--text);padding-right:36px;font-size:14px';
        wrap.appendChild(inp);

        const eye = document.createElement('button');
        eye.type = 'button';
        eye.tabIndex = -1;
        eye.textContent = '👁';
        eye.style.cssText =
            'position:absolute;right:4px;top:50%;transform:translateY(-50%);' +
            'background:none;border:none;cursor:pointer;color:var(--text);font-size:16px';
        eye.onclick = (e) => {
            e.preventDefault();
            inp.type = inp.type === 'password' ? 'text' : 'password';
            this._focusLockInput();
        };
        wrap.appendChild(eye);
        lock.appendChild(wrap);

        const btn = document.createElement('button');
        btn.id = 'unlockBtn';
        btn.type = 'button';
        btn.tabIndex = -1;
        btn.textContent = this.t('stUnlock');
        btn.style.cssText =
            'padding:8px 20px;border:none;border-radius:6px;cursor:pointer;' +
            'background:var(--accent);color:#fff;font-size:14px';
        lock.appendChild(btn);

        document.body.appendChild(lock);

        const focusInput = () => {
            try {
                const el = document.getElementById('masterPass');
                if (!el) return false;
                if (document.visibilityState === 'hidden') return false;

                el.focus({ preventScroll: true });

                if (document.activeElement !== el) {
                    try { el.click(); } catch (e) {}
                    el.focus({ preventScroll: true });
                }

                const ok = document.activeElement === el;
                if (ok) {
                    const len = el.value.length;
                    try { el.setSelectionRange(len, len); } catch (e) {}
                }
                return ok;
            } catch (e) {
                return false;
            }
        };

        const timeouts = [0, 30, 80, 150, 300, 500, 700].map(ms =>
            setTimeout(focusInput, ms)
        );
        requestAnimationFrame(() => {
            focusInput();
            requestAnimationFrame(focusInput);
        });

        const pollStart = Date.now();
        const pollInterval = setInterval(() => {
            const el = document.getElementById('masterPass');
            if (!el) { clearInterval(pollInterval); return; }
            if (document.activeElement === el) {
                clearInterval(pollInterval);
                return;
            }
            focusInput();
            if (Date.now() - pollStart > 5000) clearInterval(pollInterval);
        }, 250);

        const onVisibility = () => {
            if (document.visibilityState === 'visible') focusInput();
        };
        const onWindowFocus = () => focusInput();

        document.addEventListener('visibilitychange', onVisibility);
        window.addEventListener('focus', onWindowFocus);

        const onLockClick = (e) => {
            if (e.target === lock || e.target === h || e.target === wrap) {
                e.preventDefault();
                focusInput();
            }
        };
        lock.addEventListener('click', onLockClick);

        const onDocKeydown = (e) => {
            const el = document.getElementById('masterPass');
            if (!el) return;
            if (document.activeElement === el) return;

            if (e.ctrlKey || e.metaKey || e.altKey) return;

            const k = e.key;
            if (k === 'Tab' || k === 'Escape' ||
                k === 'ArrowLeft' || k === 'ArrowRight' ||
                k === 'ArrowUp' || k === 'ArrowDown' ||
                k === 'Home' || k === 'End' ||
                k === 'PageUp' || k === 'PageDown' ||
                /^F\d{1,2}$/.test(k)) {
                return;
            }

            if (k === 'Enter') {
                e.preventDefault();
                focusInput();
                unlock();
                return;
            }

            if (k.length === 1) {
                e.preventDefault();
                focusInput();
                const el2 = document.getElementById('masterPass');
                if (el2) {
                    el2.value += k;
                    const len = el2.value.length;
                    try { el2.setSelectionRange(len, len); } catch (err) {}
                }
                return;
            }

            if (k === 'Backspace' || k === 'Delete') {
                e.preventDefault();
                focusInput();
                const el2 = document.getElementById('masterPass');
                if (el2) {
                    el2.value = el2.value.slice(0, -1);
                    const len = el2.value.length;
                    try { el2.setSelectionRange(len, len); } catch (err) {}
                }
            }
        };
        document.addEventListener('keydown', onDocKeydown, true);

        const onDocPaste = (e) => {
            const el = document.getElementById('masterPass');
            if (!el) return;
            if (document.activeElement === el) return;
            try {
                const text = (e.clipboardData || window.clipboardData).getData('text') || '';
                e.preventDefault();
                focusInput();
                el.value += text;
                const len = el.value.length;
                try { el.setSelectionRange(len, len); } catch (e2) {}
            } catch (err) {}
        };
        document.addEventListener('paste', onDocPaste, true);

        this._lockCleanup = () => {
            timeouts.forEach(t => clearTimeout(t));
            clearInterval(pollInterval);
            document.removeEventListener('visibilitychange', onVisibility);
            window.removeEventListener('focus', onWindowFocus);
            lock.removeEventListener('click', onLockClick);
            document.removeEventListener('keydown', onDocKeydown, true);
            document.removeEventListener('paste', onDocPaste, true);
        };

        const unlock = async () => {
            const el = document.getElementById('masterPass');
            if (!el) return;
            const pass = el.value;
            const data = await api.storage.local.get(['masterPasswordHash', 'masterPasswordRecord']);

            const cleanup = () => {
                if (typeof this._lockCleanup === 'function') {
                    try { this._lockCleanup(); } catch (e) {}
                    this._lockCleanup = null;
                }
            };

            if (!data.masterPasswordRecord && !data.masterPasswordHash) {
                cleanup();
                await this._setSessionLocked(false);
                lock.remove();
                this._broadcastUnlocked();
                await this.initializeApp();
                return;
            }

            if (data.masterPasswordRecord) {
                const ok = await verifyMasterPassword(pass, data.masterPasswordRecord);
                if (ok) {
                    cleanup();
                    await this._setSessionLocked(false);
                    lock.remove();
                    this._broadcastUnlocked();
                    await this.initializeApp();
                } else {
                    this.toast(this.t('wrongPassword'));
                    el.value = '';
                    focusInput();
                }
                return;
            }

            const legacyHash = await hashMasterPassword(pass);
            if (legacyHash === data.masterPasswordHash) {
                cleanup();
                const record = await createMasterPasswordRecord(pass);
                await api.storage.local.set({ masterPasswordRecord: record });
                await api.storage.local.remove('masterPasswordHash');
                await this._setSessionLocked(false);
                lock.remove();
                this._broadcastUnlocked();
                await this.initializeApp();
            } else {
                this.toast(this.t('wrongPassword'));
                el.value = '';
                focusInput();
            }
        };

        btn.onclick = unlock;
        inp.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') { e.preventDefault(); unlock(); }
        });
    }

    _focusLockInput() {
        const el = document.getElementById('masterPass');
        if (!el) return;
        try {
            el.focus({ preventScroll: true });
            if (document.activeElement !== el) {
                try { el.click(); } catch (e) {}
                el.focus({ preventScroll: true });
            }
            const len = el.value.length;
            try { el.setSelectionRange(len, len); } catch (e) {}
        } catch (e) {}
    }

    async loadSettings() {
        try {
            this.settings = await api.storage.sync.get(DEFAULT_SETTINGS);
        } catch (e) {
            logWarn('newtab.loadSettings', 'Fallback на defaults');
            this.settings = { ...DEFAULT_SETTINGS };
        }
    }

    bindStorageListener() {
        if (this._storageListenerBound) return;
        this._storageListenerBound = true;

        api.storage.onChanged.addListener((changes, area) => {
            if (area !== 'sync') return;
            let needFullRender = false;
            let needBgRefresh = false;
            let needLanguageRefresh = false;
            let needSidebarRefresh = false;

            for (const key of Object.keys(changes)) {
                this.settings[key] = changes[key].newValue;

                if (key === 'forcedLanguage') {
                    needLanguageRefresh = true;
                }
                if (key === 'showNotes' || key === 'sidebarCollapsed') {
                    needSidebarRefresh = true;
                }
                if (key === 'sidebarWidth') {
                    this._applySidebarWidth();
                }

                if (['theme', 'accentColor', 'tileSize', 'tileGap', 'fontSize', 'fontFamily',
                     'tileBgDefault', 'tileTextDefault', 'headerOpacity',
                     'sidebarOpacity', 'modalOpacity', 'themeOpacity',
                     'headerOrder', 'headerVisibility', 'searchEngines',
                     'showNotes', 'showFolders', 'currencyWidget',
                     'hideCurrencyIcon', 'currencyPairs',
                     'showTileSizeSlider', 'tileSizeSliderPosition',
                     'tileSortMode', 'tileSortFoldersFirst',
                     'noteSortMode', 'noteSortFoldersFirst',
                     'folderSortMode', 'noteFolderSortMode',
                     'folderShowEmpty', 'folderMaxDepth',
                     'folderBarPosition'].includes(key)) {
                    needFullRender = true;
                }
                if (['backgrounds', 'activeBackgroundId', 'panelBackgrounds', 'activePanelBackgroundId'].includes(key)) {
                    needBgRefresh = true;
                }
            }

            if (needLanguageRefresh) this.setLanguage();
            if (needBgRefresh) this.applyBackgrounds();
            if (needSidebarRefresh) this.applySidebarState();

            if (needFullRender || needLanguageRefresh) {
                this.applyTheme();
                this.applyDesignSettings();
                this.renderAll();
                this.applyTranslations();
                this.applySidebarState();
                this.applyHeaderState();
                this.applyFolderBarPosition();
                this.setupCurrencyWidget();
            }
        });

        api.storage.onChanged.addListener((changes, area) => {
            if (area !== 'local' || !changes.uiState) return;
            const s = changes.uiState.newValue;
            if (!s) return;

            let needFoldersRender = false;
            let needNotesRender = false;

            if (typeof s.currentFolder === 'string' && s.currentFolder !== this.currentFolder) {
                if (s.currentFolder === 'all' || this.folders.some(f => f.id === s.currentFolder)) {
                    this.currentFolder = s.currentFolder;
                    needFoldersRender = true;
                }
            }
            if (typeof s.currentNoteFolder === 'string' && s.currentNoteFolder !== this.currentNoteFolder) {
                if (s.currentNoteFolder === 'all' || this.noteFolders.some(f => f.id === s.currentNoteFolder)) {
                    this.currentNoteFolder = s.currentNoteFolder;
                    needNotesRender = true;
                }
            }
            if (typeof s.headerHidden === 'boolean' && s.headerHidden !== this.settings.headerHidden) {
                this.settings.headerHidden = s.headerHidden;
                this.applyHeaderState();
            }
            if (typeof s.sidebarCollapsed === 'boolean' && s.sidebarCollapsed !== this.settings.sidebarCollapsed) {
                this.settings.sidebarCollapsed = s.sidebarCollapsed;
                this.applySidebarState();
            }

            if (needFoldersRender) this.renderFoldersBar();
            if (needFoldersRender || needNotesRender) this.renderTiles();
            if (needNotesRender) this.renderNotesFoldersBar();
            if (needNotesRender) this.renderNotes();
        });
    }

    _getSearchQuery() {
        const inp = document.getElementById('searchInput');
        return (inp?.value || '').trim();
    }

    async saveUiState() {
        if (this._uiStateSaved) return;

        const uiState = {
            currentFolder: this.currentFolder || 'all',
            currentNoteFolder: this.currentNoteFolder || 'all',
            headerHidden: this.settings.headerHidden || false,
            sidebarCollapsed: this.settings.sidebarCollapsed || false,
            searchQuery: this._getSearchQuery(),
            currentTilesLimit: this.tilesLimit || 50,
            savedAt: Date.now()
        };

        const fingerprint =
            `${uiState.currentFolder}|${uiState.currentNoteFolder}|` +
            `${uiState.headerHidden}|${uiState.sidebarCollapsed}|` +
            `${uiState.searchQuery}|${uiState.currentTilesLimit}`;
        if (fingerprint === this._lastUiState) return;
        this._lastUiState = fingerprint;

        try {
            await api.storage.local.set({ uiState });
        } catch (e) {
            logWarn('newtab.saveUiState', e.message);
        }
    }

    scheduleSaveUiState() {
        clearTimeout(this._uiStateTimer);
        this._uiStateTimer = setTimeout(() => {
            this._uiStateTimer = null;
            this.saveUiState();
        }, 300);
    }

    async loadUiState() {
        try {
            const stored = await api.storage.local.get('uiState');
            const s = stored.uiState;
            if (!s) {
                /* v6.9.6: после установки панель заметок свёрнута по умолчанию */
                this.settings.sidebarCollapsed = true;
                return null;
            }

            if (typeof s.currentFolder === 'string') {
                if (s.currentFolder === 'all' || this.folders.some(f => f.id === s.currentFolder)) {
                    this.currentFolder = s.currentFolder;
                }
            }
            if (typeof s.currentNoteFolder === 'string') {
                if (s.currentNoteFolder === 'all' || this.noteFolders.some(f => f.id === s.currentNoteFolder)) {
                    this.currentNoteFolder = s.currentNoteFolder;
                }
            }
            if (typeof s.headerHidden === 'boolean') this.settings.headerHidden = s.headerHidden;
            if (typeof s.sidebarCollapsed === 'boolean') this.settings.sidebarCollapsed = s.sidebarCollapsed;

            if (typeof s.searchQuery === 'string' && s.searchQuery) {
                const inp = document.getElementById('searchInput');
                if (inp) {
                    inp.value = s.searchQuery;
                    const cb = document.getElementById('clearSearch');
                    if (cb) cb.style.display = 'block';
                }
            }
            if (typeof s.currentTilesLimit === 'number' && s.currentTilesLimit > 50) {
                this.tilesLimit = s.currentTilesLimit;
            }

            this._lastUiState =
                `${this.currentFolder}|${this.currentNoteFolder}|` +
                `${this.settings.headerHidden || false}|${this.settings.sidebarCollapsed || false}|` +
                `${s.searchQuery || ''}|${this.tilesLimit || 50}`;

            return s;
        } catch (e) {
            return null;
        }
    }

    setLanguage() {
        /* v6.9.0: общий резолвер — язык браузера, фолбэк en */
        const newLang = resolveUILanguage(this.settings.forcedLanguage);
        if (newLang !== this.currentLanguage) {
            this._collator = null;
        }
        this.currentLanguage = newLang;
    }

    t(key) {
        return this.translations[this.currentLanguage]?.[key]
            || this.translations.en?.[key]
            || key;
    }

    /* v6.9.2: форматированный перевод с плейсхолдерами */
    tf(key, vars) {
        return tf(this.currentLanguage, key, vars);
    }

    applyTheme() {
        let theme = this.settings?.theme || 'auto';
        if (theme === 'auto') {
            if (!window.matchMedia) theme = 'dark';
            else {
                const d = window.matchMedia('(prefers-color-scheme: dark)').matches;
                const l = window.matchMedia('(prefers-color-scheme: light)').matches;
                theme = d || !l ? 'dark' : 'light';
            }
        }
        document.body.dataset.theme = theme;
        document.documentElement.dataset.theme = theme;
        this.currentTheme = theme;
    }

    applyDesignSettings() {
        const root = document.documentElement.style;
        root.setProperty('--accent', this.settings.accentColor || '#667eea');
        root.setProperty('--header-opacity', (this.settings.headerOpacity ?? 55) / 100);
        root.setProperty('--sidebar-opacity', (this.settings.sidebarOpacity ?? 55) / 100);
        root.setProperty('--modal-opacity', (this.settings.modalOpacity ?? 75) / 100);

        const fontMap = {
            system: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            arial: "Arial, sans-serif",
            verdana: "Verdana, sans-serif",
            tahoma: "Tahoma, sans-serif",
            georgia: "Georgia, serif",
            courier: "'Courier New', monospace",
            times: "'Times New Roman', serif",
            segoe: "'Segoe UI', sans-serif",
            roboto: "Roboto, sans-serif"
        };
        root.setProperty('--font-family', fontMap[this.settings.fontFamily] || fontMap.system);

        const sizeMap = { small: '12px', normal: '14px', large: '16px', xlarge: '18px' };
        root.setProperty('--font-size', sizeMap[this.settings.fontSize] || '14px');

        const tileSize = this.settings.tileSize || 150;
        root.setProperty('--tile-width', tileSize + 'px');
        root.setProperty('--tile-height', (tileSize * 0.7) + 'px');
        /* v6.8.6: расстояние между диалами — из настройки tileGap,
           иначе авто (пропорционально размеру, минимум 1px) */
        root.setProperty('--tile-gap', this._effectiveTileGap(tileSize) + 'px');

        this._applySidebarWidth();
        this.updateSearchEngineButtons();
    }

    /* v6.8.5: зазор между диалами — пропорционально размеру (14px при 150px),
       но не меньше 1px */
    _tileGap(tileSize) {
        return Math.max(1, Math.round(tileSize * 14 / 150));
    }

    /* v6.8.6: явная настройка расстояния (px) имеет приоритет над авто-расчётом */
    _effectiveTileGap(tileSize) {
        const g = parseInt(this.settings.tileGap);
        if (Number.isFinite(g) && g >= 1 && g <= 200) return g;
        return this._tileGap(tileSize);
    }

    updateSearchEngineButtons() {
        const container = document.querySelector('.web-search-container');
        if (!container) return;
        container.querySelectorAll('.search-engine-btn').forEach(b => b.remove());

        (this.settings.searchEngines || []).forEach(engine => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'search-engine-btn';
            btn.textContent = engine.buttonText || engine.name.charAt(0);
            btn.style.background = engine.buttonColor || '#667eea';
            btn.style.color = engine.buttonTextColor || '#ffffff';
            btn.title = engine.name;
            btn.onclick = () => this.searchWeb(engine.name);
            container.appendChild(btn);
        });
    }

    _getCollator() {
        if (!this._collator) {
            try {
                this._collator = new Intl.Collator(this.currentLanguage || 'ru', {
                    numeric: true, sensitivity: 'base'
                });
            } catch (e) {
                this._collator = { compare: (a, b) => String(a).localeCompare(String(b)) };
            }
        }
        return this._collator;
    }

    _applySorting(items, mode, foldersFirst = false) {
        const arr = items.slice();

        if (foldersFirst) {
            arr.sort((a, b) => {
                const aF = a.isFolder || !!a.folderId;
                const bF = b.isFolder || !!b.folderId;
                return (bF ? 1 : 0) - (aF ? 1 : 0);
            });
        }

        if (!mode || mode === 'manual') return arr;

        const collator = this._getCollator();
        const cmp = {
            'title-asc':    (a, b) => collator.compare(a.title || '', b.title || ''),
            'title-desc':   (a, b) => collator.compare(b.title || '', a.title || ''),
            'created-desc': (a, b) => (b.createdAt || 0) - (a.createdAt || 0),
            'created-asc':  (a, b) => (a.createdAt || 0) - (b.createdAt || 0),
            'updated-desc': (a, b) => (b.updatedAt || 0) - (a.updatedAt || 0),
            'name-asc':     (a, b) => collator.compare(a.name || '', b.name || ''),
            'name-desc':    (a, b) => collator.compare(b.name || '', a.name || ''),
            'domain-asc':   (a, b) => collator.compare(safeHostname(a.url), safeHostname(b.url))
        }[mode];

        if (!cmp) return arr;

        if (foldersFirst) {
            const folderItems = arr.filter(i => i.isFolder || i.folderId);
            const otherItems = arr.filter(i => !(i.isFolder || i.folderId));
            folderItems.sort(cmp);
            otherItems.sort(cmp);
            return folderItems.concat(otherItems);
        }

        arr.sort(cmp);
        return arr;
    }

    /* v6.8.0: положение панели папок — top / bottom / left / right */
    applyFolderBarPosition() {
        const contentArea = document.getElementById('contentArea');
        const mainContent = document.getElementById('mainContent');
        if (!contentArea) return;
        const pos = this.settings.folderBarPosition || 'top';
        const positions = ['top', 'bottom', 'left'];
        for (const p of positions) {
            contentArea.classList.toggle(`folder-bar-${p}`, pos === p);
            if (mainContent) mainContent.classList.toggle(`folder-bar-${p}`, pos === p);
        }
        this.updateFolderScrollButtons();
    }

    /* ---------- v6.8.0: стрелки прокрутки панели папок ---------- */

    _folderBarVertical() {
        const pos = this.settings.folderBarPosition || 'top';
        return pos === 'left';
    }

    updateFolderScrollButtons() {
        const bar = document.getElementById('foldersBar');
        const prev = document.getElementById('foldersScrollPrev');
        const next = document.getElementById('foldersScrollNext');
        if (!bar || !prev || !next) return;
        const vertical = this._folderBarVertical();
        const canScroll = vertical
            ? bar.scrollHeight > bar.clientHeight + 1
            : bar.scrollWidth > bar.clientWidth + 1;
        const show = canScroll ? '' : 'none';
        prev.style.display = show;
        next.style.display = show;
        this._updateFolderScrollBtnState();
    }

    _updateFolderScrollBtnState() {
        const bar = document.getElementById('foldersBar');
        const prev = document.getElementById('foldersScrollPrev');
        const next = document.getElementById('foldersScrollNext');
        if (!bar || !prev || !next) return;
        const vertical = this._folderBarVertical();
        if (prev.style.display === 'none') return;
        if (vertical) {
            prev.disabled = bar.scrollTop <= 1;
            next.disabled = bar.scrollTop + bar.clientHeight >= bar.scrollHeight - 1;
        } else {
            prev.disabled = bar.scrollLeft <= 1;
            next.disabled = bar.scrollLeft + bar.clientWidth >= bar.scrollWidth - 1;
        }
    }

    _bindFolderScrollButtons() {
        const bar = document.getElementById('foldersBar');
        const prev = document.getElementById('foldersScrollPrev');
        const next = document.getElementById('foldersScrollNext');
        if (!bar || !prev || !next) return;
        const step = () => Math.max(200, Math.round((this._folderBarVertical() ? bar.clientHeight : bar.clientWidth) * 0.8));
        prev.addEventListener('click', () => {
            if (this._folderBarVertical()) bar.scrollBy({ top: -step(), behavior: 'smooth' });
            else bar.scrollBy({ left: -step(), behavior: 'smooth' });
        });
        next.addEventListener('click', () => {
            if (this._folderBarVertical()) bar.scrollBy({ top: step(), behavior: 'smooth' });
            else bar.scrollBy({ left: step(), behavior: 'smooth' });
        });
        bar.addEventListener('scroll', () => this._updateFolderScrollBtnState(), { passive: true });
        window.addEventListener('resize', () => this.updateFolderScrollButtons());
    }

    applySidebarState() {
        const sb = document.getElementById('notesSidebar');
        const eb = document.getElementById('expandSidebar');
        if (!sb || !eb) return;

        const showNotes = this.settings.showNotes !== false;
        const collapsed = !!this.settings.sidebarCollapsed;
        const shouldHide = !showNotes || collapsed;

        sb.classList.toggle('collapsed', shouldHide);
        sb.style.display = shouldHide ? 'none' : '';
        eb.style.display = shouldHide ? 'flex' : 'none';
    }

    async applyBackgrounds() {
        const layer = document.getElementById('bgLayer');
        if (!layer) return;

        const activeId = this.settings.activeBackgroundId;
        const bg = (this.settings.backgrounds || []).find(b => b.id === activeId);

        layer.style.background = '';
        layer.style.backgroundImage = '';
        layer.style.backgroundSize = '';
        layer.style.backgroundPosition = '';
        layer.style.backgroundRepeat = '';
        layer.style.backgroundColor = '';
        layer.style.filter = '';

        if (!bg) return;

        let value = bg.value;
        if (bg.type === 'image-file' && bg.ref) {
            try {
                const blobRec = await loadBackgroundBlob(bg.ref);
                if (blobRec?.dataUrl) value = blobRec.dataUrl;
            } catch (e) {
                logWarn('newtab.applyBackgrounds', 'Не удалось загрузить blob', { ref: bg.ref });
            }
        }

        if (!value && bg.type !== 'color' && bg.type !== 'gradient') {
            return;
        }

        this._applyBackgroundStyle(layer, bg, value);
    }

    _applyBackgroundStyle(el, bg, value) {
        if (bg.type === 'color') {
            el.style.background = value;
        } else if (bg.type === 'gradient') {
            el.style.background = value;
        } else {
            const position = bg.position === 'contain' ? 'contain'
                : bg.position === 'repeat' ? 'auto'
                : bg.position === 'center' ? 'center'
                : 'cover';
            el.style.backgroundImage = `url("${value}")`;
            el.style.backgroundSize = position === 'auto' ? 'auto' : position;
            el.style.backgroundRepeat = bg.position === 'repeat' ? 'repeat' : 'no-repeat';
            el.style.backgroundPosition = 'center';
        }

        const brightness = (bg.brightness ?? 100) / 100;
        if (brightness !== 1) el.style.filter = `brightness(${brightness})`;
    }

    async loadData() {
        try {
            const data = await loadDataFromIDB();
            if (data) {
                this.tiles = Array.isArray(data.tiles) ? data.tiles : [];
                this.folders = Array.isArray(data.folders) ? data.folders : [];
                this.notes = Array.isArray(data.notes) ? data.notes : [];
                this.noteFolders = Array.isArray(data.noteFolders) ? data.noteFolders : [];
                this.folderPasswords = data.folderPasswords || {};
                this.tombstones = data.tombstones || {};
                if (typeof data.headerHidden === 'boolean') this.settings.headerHidden = data.headerHidden;
                if (typeof data.sidebarCollapsed === 'boolean') this.settings.sidebarCollapsed = data.sidebarCollapsed;

                const now = Date.now();
                this.folders.forEach(f => {
                    if (typeof f.createdAt !== 'number') f.createdAt = f.updatedAt || now;
                    if (typeof f.updatedAt !== 'number') f.updatedAt = f.createdAt;
                });
                this.noteFolders.forEach(f => {
                    if (typeof f.createdAt !== 'number') f.createdAt = f.updatedAt || now;
                    if (typeof f.updatedAt !== 'number') f.updatedAt = f.createdAt;
                });
            } else {
                this.tiles = this.getDefaultTiles();
                this.folders = this.getDefaultFolders();
                this.noteFolders = this.getDefaultNoteFolders();
                this.tombstones = {};
                await this.saveData();
            }

            // Replace only the old, unchanged built-in project link; preserve user bookmarks.
            let projectTileMigrated = false;
            for (const tile of this.tiles) {
                if (tile.id === 'tile_econa_default' && tile.title === 'Econa' &&
                    /^https?:\/\/(?:www\.)?econa\.su\/?$/i.test(tile.url)) {
                    tile.title = 'Private SpeedDial';
                    tile.url = 'https://github.com/rukazax/Private_SpeedDial';
                    tile.icon = getFaviconUrl(tile.url);
                    tile.updatedAt = Date.now();
                    projectTileMigrated = true;
                }
            }
            if (projectTileMigrated) await this.saveData();

            this._reconcilePasswordsLocal();
            await this.loadUiState();
        } catch (e) {
            logError('newtab.loadData', e.message);
            this.tiles = this.getDefaultTiles();
            this.folders = this.getDefaultFolders();
            this.noteFolders = this.getDefaultNoteFolders();
            this.tombstones = {};
        }
    }

    getDefaultTiles() {
        const now = Date.now();
        return [
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
        ];
    }

    getDefaultFolders() { return []; }
    getDefaultNoteFolders() { return []; }

    _reconcilePasswordsLocal() {
        const data = {
            folders: this.folders,
            noteFolders: this.noteFolders,
            folderPasswords: this.folderPasswords
        };
        reconcilePasswords(data);
        this.folderPasswords = data.folderPasswords;
    }

    async saveData() {
        try {
            await saveDataToIDB({
                tiles: this.tiles,
                folders: this.folders,
                notes: this.notes,
                noteFolders: this.noteFolders,
                folderPasswords: this.folderPasswords,
                tombstones: this.tombstones || {},
                headerHidden: this.settings.headerHidden || false,
                sidebarCollapsed: this.settings.sidebarCollapsed || false
            });
            /* v6.9.4: автосинхронизация при любом изменении данных */
            try { api.runtime.sendMessage({ action: 'userDataChanged' }).catch(() => {}); } catch (e) {}
        } catch (e) {
            logError('newtab.saveData', e.message);
        }
    }

    _addTombstone(id) {
        if (!id) return;
        if (!this.tombstones) this.tombstones = {};
        addTombstone(this, id);
    }

    _fallbackContrastColor(hex) {
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

    async renderAll() {
        if (!this._folderScrollBound) {
            this._folderScrollBound = true;
            this._bindFolderScrollButtons();
        }
        this.renderFoldersBar();
        this.renderNotesFoldersBar();
        this.renderTiles();
        this.renderNotes();
        this.renderHeaderActions();
        this.applySidebarState();
        this.toggleFolders();
        this.applyFolderBarPosition();
    }

    renderHeaderActions() {
        const container = document.getElementById('headerActions');
        if (!container) return;
        container.innerHTML = '';

        if (this.settings.currencyWidget) {
            const widget = document.createElement('div');
            widget.id = 'currencyWidget';
            widget.className = 'widget currency-widget';
            /* v6.8.3: вместо статичного 💱 — спиннер только на время синхронизации */
            widget.appendChild(this._makeCurrencySpinner());
            container.appendChild(widget);
        }

        if (this.settings.showTileSizeSlider) {
            const wrap = document.createElement('div');
            wrap.className = 'tile-size-control';
            wrap.id = 'tileSizeControl';

            const label = document.createElement('span');
            label.textContent = this.t('sizeWord');
            wrap.appendChild(label);

            const slider = document.createElement('input');
            slider.type = 'range';
            slider.id = 'tileSizeSlider';
            slider.min = 100;
            slider.max = 200;
            /* v6.8.3: шаг 1 — плавное масштабирование диалов */
            slider.step = 1;
            slider.value = this.settings.tileSize || 150;
            slider.oninput = (e) => {
                const val = parseInt(e.target.value);
                this.settings.tileSize = val;
                document.documentElement.style.setProperty('--tile-width', val + 'px');
                document.documentElement.style.setProperty('--tile-height', (val * 0.7) + 'px');
                /* v6.8.6: зазор с учётом явной настройки расстояния,
                   авто — пропорционально размеру, минимум 1px */
                document.documentElement.style.setProperty('--tile-gap', this._effectiveTileGap(val) + 'px');
            };
            slider.onchange = () => {
                /* v6.6.6: явное изменение — обновляем timestamp */
                this._touchSettings();
                api.storage.sync.set({ tileSize: this.settings.tileSize });
            };
            wrap.appendChild(slider);

            container.appendChild(wrap);
        }

        const actionMap = {
            addTile:   { title: this.t('addTile'), action: () => this.showAddTileModal() },
            theme:     { title: this.t('theme'), action: () => this.toggleTheme() },
            sync:      { title: this.t('sync'), action: () => this.syncWithServer() },
            settings:  { title: this.t('settings'), action: () => api.runtime.sendMessage({ action: 'openOptionsAsPopup' }) },
            pinHeader: { title: this.t('pinHeader'), action: () => this.toggleHeaderPin() },
            bgGallery: { title: this.t('bgGallery'), action: () => this.openBackgroundGallery() },
            lock:      { title: this.t('lock'), action: () => this.lockNow() },
            profile:   { title: this.t('profile'), action: () => api.runtime.sendMessage({ action: 'openOptionsAsPopup' }) },
            currency:  { title: this.t('currency'), action: () => this.toggleCurrencyWidget() }
        };

        const order = Array.isArray(this.settings.headerOrder)
            ? this.settings.headerOrder
            : Object.keys(actionMap);

        const hideCurrencyIcon = this.settings.hideCurrencyIcon === true && this.settings.currencyWidget;

        order.forEach(id => {
            const item = actionMap[id];
            if (!item) return;
            if (id !== 'settings' && this.settings.headerVisibility?.[id] === false) return;
            if (id === 'currency' && hideCurrencyIcon) return;

            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'icon-button';
            btn.id = id + 'Button';
            btn.title = item.title;
            btn.appendChild(createHeaderIconSvg(id));
            btn.onclick = item.action;
            container.appendChild(btn);
        });
    }

    renderFoldersBar() {
        const bar = document.getElementById('foldersBar');
        if (!bar) return;
        bar.innerHTML = '';

        const allBtn = document.createElement('button');
        allBtn.type = 'button';
        allBtn.className = 'folder-tab' + (this.currentFolder === 'all' ? ' active' : '');
        allBtn.textContent = this.t('all');
        allBtn.dataset.folderId = 'all';
        if (this.currentFolder === 'all') allBtn.dataset.active = '1';
        allBtn.onclick = () => this.switchFolder('all');
        bar.appendChild(allBtn);

        const maxDepth = Math.max(1, parseInt(this.settings.folderMaxDepth) || 5);
        const showEmpty = this.settings.folderShowEmpty !== false;

        const buildTree = (parentId = '', level = 0) => {
            let children = this.folders.filter(f => (f.parentId || '') === parentId);

            const sortMode = this.settings.folderSortMode || 'manual';
            if (sortMode !== 'manual') {
                const collator = this._getCollator();
                children = children.slice().sort((a, b) => {
                    const cmp = collator.compare(a.name || '', b.name || '');
                    return sortMode === 'name-desc' ? -cmp : cmp;
                });
            }

            children.forEach(f => {
                if (!showEmpty && !this._folderHasAnyContent(f.id)) return;

                const isActive = this.currentFolder === f.id;
                const b = document.createElement('button');
                b.type = 'button';
                b.className = 'folder-tab' + (isActive ? ' active' : '');
                b.textContent = (f.password ? '🔒 ' : '') + f.name;
                b.dataset.folderId = f.id;
                if (isActive) b.dataset.active = '1';

                b.style.color = f.autoText ? this._pickContrastColor(f.color || '#667eea') : (f.textColor || '#ffffff');
                b.style.background = f.color;
                b.style.opacity = (f.opacity || 100) / 100;

                const _pos = this.settings.folderBarPosition || 'top';
                if (_pos === 'left' || _pos === 'right') {
                    b.style.width = '100%';
                    b.style.textAlign = 'left';
                    b.style.marginLeft = `${level * 12}px`;
                } else {
                    b.style.marginLeft = `${level * 10}px`;
                }
                b.onclick = () => {
                    if (f.password && !this.checkFolderPassword(f.id, 'tile')) return;
                    this.switchFolder(f.id);
                };
                b.oncontextmenu = (e) => {
                    e.preventDefault();
                    this.showFolderContextMenu(e.clientX, e.clientY, f.id);
                };
                this._setupFolderDragMouse(b, f.id);
                bar.appendChild(b);

                if (level + 1 < maxDepth) buildTree(f.id, level + 1);
            });
        };
        buildTree();

        const addBtn = document.createElement('button');
        addBtn.type = 'button';
        addBtn.className = 'add-folder-button';
        addBtn.textContent = '+';
        addBtn.title = this.t('addFolderHint');
        addBtn.onclick = () => this.showAddFolderModal();
        addBtn.oncontextmenu = (e) => {
            e.preventDefault();
            this.showFolderBarContextMenu(e.clientX, e.clientY);
        };
        bar.appendChild(addBtn);

        /* v6.8.0: показать/скрыть стрелки прокрутки после наполнения */
        this.updateFolderScrollButtons();
    }

    _folderHasAnyContent(folderId) {
        const visited = new Set();
        const stack = [folderId];
        while (stack.length) {
            const id = stack.pop();
            if (visited.has(id)) continue;
            visited.add(id);
            if (this.tiles.some(t => t.folderId === id)) return true;
            for (const child of this.folders) {
                if (child.parentId === id && !visited.has(child.id)) stack.push(child.id);
            }
        }
        return false;
    }

    renderNotesFoldersBar() {
        const bar = document.getElementById('notesFoldersBar');
        if (!bar) return;
        bar.innerHTML = '';

        const allBtn = document.createElement('button');
        allBtn.type = 'button';
        allBtn.className = 'note-folder-tab' + (this.currentNoteFolder === 'all' ? ' active' : '');
        allBtn.textContent = this.t('all');
        if (this.currentNoteFolder === 'all') allBtn.dataset.active = '1';
        allBtn.onclick = () => this.switchNoteFolder('all');
        bar.appendChild(allBtn);

        const folders = this.noteFolders.slice();
        const sortMode = this.settings.noteFolderSortMode || 'manual';
        if (sortMode !== 'manual') {
            const collator = this._getCollator();
            folders.sort((a, b) => {
                const cmp = collator.compare(a.name || '', b.name || '');
                return sortMode === 'name-desc' ? -cmp : cmp;
            });
        }

        folders.forEach(f => {
            const isActive = this.currentNoteFolder === f.id;
            const b = document.createElement('button');
            b.type = 'button';
            b.className = 'note-folder-tab' + (isActive ? ' active' : '');
            b.textContent = f.password ? `🔒 ${f.name}` : f.name;
            b.dataset.noteFolderId = f.id;
            if (isActive) b.dataset.active = '1';

            b.style.color = f.autoText ? this._pickContrastColor(f.color || '#667eea') : (f.textColor || '#ffffff');
            b.style.background = f.color;
            b.style.opacity = (f.opacity || 100) / 100;

            b.onclick = () => {
                if (f.password && !this.checkFolderPassword(f.id, 'note')) return;
                this.switchNoteFolder(f.id);
            };
            b.oncontextmenu = (e) => {
                e.preventDefault();
                this.showNoteFolderContextMenu(e.clientX, e.clientY, f.id);
            };
            this._setupNoteFolderDragMouse(b, f.id);
            bar.appendChild(b);
        });

        const addBtn = document.createElement('button');
        addBtn.type = 'button';
        addBtn.className = 'add-note-folder-button';
        addBtn.textContent = '+';
        addBtn.title = this.t('addFolderHint');
        addBtn.onclick = () => this.showAddNoteFolderModal();
        addBtn.oncontextmenu = (e) => {
            e.preventDefault();
            this.showNoteFolderBarContextMenu(e.clientX, e.clientY);
        };
        bar.appendChild(addBtn);
    }

    switchFolder(id) {
        /* v6.9.7: анимация «рассыпание» — старые закладки разлетаются,
           новые слетаются на своё место */
        const grid = document.getElementById('speedDialGrid');
        const oldTiles = grid ? [...grid.querySelectorAll('.tile')] : [];
        const reduceMotion = typeof matchMedia !== 'undefined'
            && matchMedia('(prefers-reduced-motion: reduce)').matches;
        const doSwitch = () => {
            this.currentFolder = id;
            this.tilesLimit = 50;
            this.renderFoldersBar();
            this.renderTiles();
            this._scatterIn('speedDialGrid');
            this.scheduleSaveUiState();
        };
        if (!oldTiles.length || reduceMotion || id === this.currentFolder) {
            doSwitch();
            return;
        }
        oldTiles.forEach((t) => {
            const a = Math.random() * Math.PI * 2;
            const d = 60 + Math.random() * 130;
            t.style.transition = 'transform .3s ease-in, opacity .3s ease-in';
            t.style.transform =
                `translate(${(Math.cos(a) * d).toFixed(0)}px, ` +
                `${(Math.sin(a) * d + 50).toFixed(0)}px) ` +
                `rotate(${(Math.random() * 40 - 20).toFixed(0)}deg) scale(.7)`;
            t.style.opacity = '0';
            t.style.pointerEvents = 'none';
        });
        setTimeout(doSwitch, 280);
    }

    /* v6.9.7: новые закладки «слетаются» из разброса */
    _scatterIn(gridId) {
        const grid = document.getElementById(gridId);
        if (!grid) return;
        const reduceMotion = typeof matchMedia !== 'undefined'
            && matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (reduceMotion) return;
        [...grid.querySelectorAll('.tile')].forEach((t, i) => {
            t.style.setProperty('--sx', (Math.random() * 160 - 80).toFixed(0) + 'px');
            t.style.setProperty('--sy', (Math.random() * 120 - 40).toFixed(0) + 'px');
            t.style.setProperty('--sr', (Math.random() * 30 - 15).toFixed(0) + 'deg');
            t.style.animationDelay = Math.min(i * 12, 240) + 'ms';
            t.classList.add('tile-gather');
        });
        /* снятие по таймеру, а не по animationend: на фоновых вкладках Chromium
           анимации замораживаются и событие может не прийти */
        const maxMs = 340 + Math.min(grid.querySelectorAll('.tile').length * 12, 240) + 350;
        setTimeout(() => {
            grid.querySelectorAll('.tile-gather').forEach((t) => {
                t.classList.remove('tile-gather');
                t.style.animationDelay = '';
            });
        }, maxMs);
    }

    switchNoteFolder(id) {
        this.currentNoteFolder = id;
        this.renderNotesFoldersBar();
        this.renderNotes();
        this._replaySwitchAnim('notesList');
        this.scheduleSaveUiState();
    }

    /* v6.9.3: визуальный эффект при переключении папок — перезапуск CSS-анимации */
    _replaySwitchAnim(elId) {
        const el = document.getElementById(elId);
        if (!el) return;
        el.classList.remove('folder-switch-anim');
        void el.offsetWidth;
        el.classList.add('folder-switch-anim');
    }

    renderTiles() {
        const grid = document.getElementById('speedDialGrid');
        if (!grid) return;
        grid.innerHTML = '';

        let tiles = [...this.tiles];

        tiles = tiles.filter(t => {
            if (t.folderId) {
                const f = this.folders.find(x => x.id === t.folderId);
                if (f?.password) return this.unlockedFolders.has(`tile_${f.id}`);
            }
            return true;
        });

        if (this.currentFolder !== 'all' && this.settings.showFolders) {
            const childIds = this.getChildFolderIds(this.currentFolder);
            tiles = tiles.filter(t => t.folderId === this.currentFolder || childIds.includes(t.folderId));
        }

        const si = document.getElementById('searchInput');
        const q = (si?.value || '').trim();
        if (q) {
            const query = q.toLowerCase();
            tiles = tiles.filter(t =>
                (t.title || '').toLowerCase().includes(query)
                || (t.url || '').toLowerCase().includes(query)

            );
            this.tilesLimit = 500;
        }

        tiles = this._applySorting(tiles, this.settings.tileSortMode, this.settings.tileSortFoldersFirst);

        const fragment = document.createDocumentFragment();
        const visible = tiles.slice(0, this.tilesLimit || 50);
        visible.forEach(t => fragment.appendChild(this.createTileElement(t)));

        if (tiles.length > visible.length) {
            const more = document.createElement('div');
            more.className = 'tile add-tile';
            more.textContent = this.tf('showMoreN', { n: tiles.length - visible.length });
            more.onclick = () => {
                this.tilesLimit += 50;
                this.renderTiles();
            };
            fragment.appendChild(more);
        }

        const add = document.createElement('div');
        add.className = 'tile add-tile';
        const iconDiv = document.createElement('div');
        iconDiv.className = 'tile-icon';
        iconDiv.textContent = '+';
        add.appendChild(iconDiv);
        const titleDiv = document.createElement('div');
        titleDiv.className = 'tile-title';
        titleDiv.textContent = this.t('addTile');
        add.appendChild(titleDiv);
        add.onclick = () => this.showAddTileModal();
        fragment.appendChild(add);

        grid.appendChild(fragment);
    }

    createTileElement(tile) {
        const el = document.createElement('div');
        el.className = 'tile';
        el.dataset.tileId = tile.id;
        el.tabIndex = 0;

        const bgColor = tile.bgColor || this.settings.tileBgDefault || '#4CAF50';
        /* v6.9.3: авто-контрастный текст — цвет текста от фона */
        const textColor = tile.autoText
            ? this._pickContrastColor(bgColor)
            : (tile.textColor || this.settings.tileTextDefault || '#fff');
        el.style.opacity = (tile.opacity || 100) / 100;

        if (tile.bgImage) {
            el.style.backgroundImage = `url("${tile.bgImage}")`;
            el.style.backgroundSize = 'cover';
            el.style.backgroundPosition = 'center';
        } else {
            el.style.background = bgColor;
        }

        let hostname = '';
        try { hostname = new URL(tile.url).hostname; }
        catch (e) { hostname = tile.title || tile.url || ''; }

        const iconWrap = document.createElement('div');
        iconWrap.className = 'tile-icon';
        const iconOpacity = (tile.iconOpacity ?? 100) / 100;

        if (tile.icon) {
            const img = document.createElement('img');
            img.alt = '';
            img.src = tile.icon;
            img.style.opacity = iconOpacity;
            /* v6.8.0: при недоступной иконке (например, локальный
               источник favicon не отдал /favicon.ico) — буква домена */
            img.onerror = () => {
                img.remove();
                if (iconWrap.querySelector('span')) return;
                const ch = document.createElement('span');
                ch.textContent = (tile.title || safeHostname(tile.url) || '?').charAt(0).toUpperCase();
                ch.style.opacity = iconOpacity;
                iconWrap.appendChild(ch);
            };
            iconWrap.appendChild(img);
        } else {
            const ch = document.createElement('span');
            ch.textContent = (tile.title || '?').charAt(0).toUpperCase();
            ch.style.opacity = iconOpacity;
            iconWrap.appendChild(ch);
        }
        el.appendChild(iconWrap);

        if (tile.showTitle !== false) {
            const titleEl = document.createElement('div');
            titleEl.className = 'tile-title';
            titleEl.style.color = textColor;
            titleEl.textContent = tile.title || hostname;
            el.appendChild(titleEl);

            const urlEl = document.createElement('div');
            urlEl.className = 'tile-url';
            urlEl.style.color = textColor;
            urlEl.textContent = hostname;
            el.appendChild(urlEl);
        }

        el.onclick = (e) => {
            /* v6.8.0: открываем только http(s) — data:/blob:/file:/javascript:
               через плитки не проходят */
            if (!/^https?:\/\//i.test(tile.url || '')) return;
            if (e.ctrlKey || e.metaKey) window.open(tile.url, '_blank');
            else window.location.href = tile.url;
        };
        el.onauxclick = (e) => {
            if (e.button === 1) { e.preventDefault(); window.open(tile.url, '_blank'); }
        };
        el.oncontextmenu = (e) => {
            e.preventDefault();
            this.showContextMenu(e.clientX, e.clientY, tile.id);
        };
        el.onkeydown = (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                if (e.ctrlKey || e.metaKey) window.open(tile.url, '_blank');
                else window.location.href = tile.url;
            }
        };

        el.title = `${tile.title || hostname}\n${hostname}`;

        this._setupTileDragMouse(el, tile.id);
        return el;
    }

    renderNotes() {
        const list = document.getElementById('notesList');
        if (!list) return;
        list.innerHTML = '';

        let notes = [...this.notes];

        notes = notes.filter(n => {
            if (n.folderId) {
                const f = this.noteFolders.find(x => x.id === n.folderId);
                if (f?.password && !this.unlockedFolders.has(`note_${f.id}`)) return false;
            }
            return true;
        });

        if (this.currentNoteFolder !== 'all') {
            notes = notes.filter(n => n.folderId === this.currentNoteFolder);
        }

        const si = document.getElementById('searchInput');
        const q = (si?.value || '').trim();
        if (q) {
            const query = q.toLowerCase();
            notes = notes.filter(n =>
                (n.title || '').toLowerCase().includes(query)
                || (n.content || '').toLowerCase().includes(query)
            );
            this.notesLimit = 500;
        }

        notes = this._applySorting(notes, this.settings.noteSortMode, this.settings.noteSortFoldersFirst);

        const fragment = document.createDocumentFragment();
        const visible = notes.slice(0, this.notesLimit || 50);

        visible.forEach(n => {
            const el = document.createElement('div');
            el.className = 'note-item';
            el.dataset.noteId = n.id;
            el.style.background = n.color || '#ffeb3b';

            /* v6.9.3: авто-контрастный текст имеет приоритет над сохранённым цветом */
            const textColor = n.autoText
                ? this._pickContrastColor(n.color || '#ffeb3b')
                : (n.textColor || this._pickContrastColor(n.color || '#ffeb3b'));
            el.style.color = textColor;
            el.style.opacity = (n.opacity || 100) / 100;

            const del = document.createElement('button');
            del.type = 'button';
            del.className = 'note-delete';
            del.textContent = '✕';
            del.onclick = (e) => { e.stopPropagation(); this.deleteNote(n.id); };
            el.appendChild(del);

            const title = document.createElement('div');
            title.className = 'note-title';
            title.textContent = n.title || '';
            el.appendChild(title);

            const content = document.createElement('div');
            content.className = 'note-content';
            content.textContent = n.content || '';
            el.appendChild(content);

            /* v6.9.4: одиночный клик по заметке открывает редактор */
            el.onclick = () => {
                if (this._suppressNoteClick) { this._suppressNoteClick = false; return; }
                this.showEditNoteModal(n.id);
            };
            el.oncontextmenu = (e) => {
                e.preventDefault();
                this.showNoteContextMenu(e.clientX, e.clientY, n.id);
            };

            this._setupNoteDragMouse(el, n.id);
            fragment.appendChild(el);
        });

        if (notes.length > visible.length) {
            const more = document.createElement('div');
            more.className = 'note-item more-notes';
            more.textContent = this.tf('showMoreN', { n: notes.length - visible.length });
            more.onclick = () => {
                this.notesLimit += 50;
                this.renderNotes();
            };
            fragment.appendChild(more);
        }

        list.appendChild(fragment);
    }

    _setupTileDragMouse(el, tileId) {
        el.addEventListener('mousedown', (e) => {
            if (e.button !== 0) return;
            this.dragState = { type: 'tile', id: tileId, el, startX: e.clientX, startY: e.clientY, active: false, lastOver: null };
        });
    }

    _setupFolderDragMouse(el, folderId) {
        el.addEventListener('mousedown', (e) => {
            if (e.button !== 0) return;
            this.dragState = { type: 'folder', id: folderId, el, startX: e.clientX, startY: e.clientY, active: false, lastOver: null };
        });
    }

    _setupNoteFolderDragMouse(el, folderId) {
        el.addEventListener('mousedown', (e) => {
            if (e.button !== 0) return;
            this.dragState = { type: 'noteFolder', id: folderId, el, startX: e.clientX, startY: e.clientY, active: false, lastOver: null };
        });
    }

    _setupNoteDragMouse(el, noteId) {
        el.addEventListener('mousedown', (e) => {
            if (e.button !== 0) return;
            this.dragState = { type: 'note', id: noteId, el, startX: e.clientX, startY: e.clientY, active: false, lastOver: null };
        });
    }

    _onMouseMove(e) {
        const d = this.dragState;
        if (!d.type || !d.el) return;

        const dx = e.clientX - d.startX;
        const dy = e.clientY - d.startY;
        if (!d.active && Math.abs(dx) < 5 && Math.abs(dy) < 5) return;

        if (!d.active) {
            d.active = true;
            d.el.classList.add('dragging');
        }

        const target = document.elementFromPoint(e.clientX, e.clientY);
        const overEl = target?.closest('.tile, .folder-tab, .note-item, .note-folder-tab');

        if (d.lastOver && d.lastOver !== overEl) {
            d.lastOver.classList.remove('drag-over');
        }
        if (overEl && overEl !== d.el) {
            overEl.classList.add('drag-over');
            d.lastOver = overEl;
        } else {
            d.lastOver = null;
        }
    }

    async _onMouseUp(e) {
        const d = this.dragState;
        if (!d.type) return;

        const wasActive = d.active;
        const draggedId = d.id;
        const type = d.type;
        const el = d.el;

        if (d.lastOver) d.lastOver.classList.remove('drag-over');
        if (el) el.classList.remove('dragging');
        this.dragState = { type: null, id: null, el: null, startX: 0, startY: 0, active: false, lastOver: null };

        if (!wasActive) return;

        const target = document.elementFromPoint(e.clientX, e.clientY);
        if (!target) return;

        if (type === 'tile') {
            const targetEl = target.closest('.tile');
            const targetId = targetEl?.dataset.tileId;
            if (targetId && targetId !== draggedId) await this._swapTiles(draggedId, targetId);
        } else if (type === 'folder') {
            if (this.settings.folderSortMode && this.settings.folderSortMode !== 'manual') {
                this.settings.folderSortMode = 'manual';
                this._touchSettings();
                await api.storage.sync.set({ folderSortMode: 'manual' });
                this.toast(this.t('sortFoldersManual'));
            }
            const targetEl = target.closest('.folder-tab');
            const targetId = targetEl?.dataset.folderId;
            if (targetId && targetId !== draggedId && targetId !== 'all') {
                await this._swapFolders(draggedId, targetId);
            }
        } else if (type === 'noteFolder') {
            if (this.settings.noteFolderSortMode && this.settings.noteFolderSortMode !== 'manual') {
                this.settings.noteFolderSortMode = 'manual';
                this._touchSettings();
                await api.storage.sync.set({ noteFolderSortMode: 'manual' });
                this.toast(this.t('sortNoteFoldersManual'));
            }
            const targetEl = target.closest('.note-folder-tab');
            const targetId = targetEl?.dataset.noteFolderId;
            if (targetId && targetId !== draggedId) {
                await this._swapNoteFolders(draggedId, targetId);
            }
        } else if (type === 'note') {
            const targetEl = target.closest('.note-item');
            const targetId = targetEl?.dataset.noteId;
            if (targetId && targetId !== draggedId) await this._swapNotes(draggedId, targetId);
            /* v6.9.4: не открывать редактор по клику, завершающему перетаскивание */
            this._suppressNoteClick = true;
        }
    }

    async _swapTiles(id1, id2) {
        const i1 = this.tiles.findIndex(t => t.id === id1);
        const i2 = this.tiles.findIndex(t => t.id === id2);
        if (i1 === -1 || i2 === -1) return;
        const [m] = this.tiles.splice(i1, 1);
        this.tiles.splice(i2, 0, m);

        const now = Date.now();
        if (this.tiles[i2]) this.tiles[i2].updatedAt = now;
        if (this.tiles[i1]) this.tiles[i1].updatedAt = now;

        await this.saveData();
        this.renderTiles();
    }

    async _swapNotes(id1, id2) {
        const i1 = this.notes.findIndex(n => n.id === id1);
        const i2 = this.notes.findIndex(n => n.id === id2);
        if (i1 === -1 || i2 === -1) return;
        const [m] = this.notes.splice(i1, 1);
        this.notes.splice(i2, 0, m);

        const now = Date.now();
        if (this.notes[i2]) this.notes[i2].updatedAt = now;
        if (this.notes[i1]) this.notes[i1].updatedAt = now;

        await this.saveData();
        this.renderNotes();
    }

    async _swapFolders(id1, id2) {
        const i1 = this.folders.findIndex(f => f.id === id1);
        const i2 = this.folders.findIndex(f => f.id === id2);
        if (i1 === -1 || i2 === -1) return;
        const [m] = this.folders.splice(i1, 1);
        this.folders.splice(i2, 0, m);

        const now = Date.now();
        if (this.folders[i2]) this.folders[i2].updatedAt = now;
        if (this.folders[i1]) this.folders[i1].updatedAt = now;

        await this.saveData();
        this.renderFoldersBar();
        this.renderTiles();
        this.toast(this.t('folderMoved'));
    }

    async _swapNoteFolders(id1, id2) {
        const i1 = this.noteFolders.findIndex(f => f.id === id1);
        const i2 = this.noteFolders.findIndex(f => f.id === id2);
        if (i1 === -1 || i2 === -1) return;
        const [m] = this.noteFolders.splice(i1, 1);
        this.noteFolders.splice(i2, 0, m);

        const now = Date.now();
        if (this.noteFolders[i2]) this.noteFolders[i2].updatedAt = now;
        if (this.noteFolders[i1]) this.noteFolders[i1].updatedAt = now;

        await this.saveData();
        this.renderNotesFoldersBar();
        this.renderNotes();
        this.toast(this.t('noteFolderMoved'));
    }

    hideAllContextMenus() {
        this.hideContextMenu();
        this.hideFolderContextMenu();
        this.hideNoteContextMenu();
        this.hideNoteFolderContextMenu();
        this.hideFolderBarContextMenu();
        this.hideNoteFolderBarContextMenu();
    }

    showContextMenu(x, y, id) {
        this.hideAllContextMenus();
        this.contextMenuTarget = id;
        const m = document.getElementById('contextMenu');
        if (!m) return;
        m.style.display = 'block';
        m.style.left = `${Math.min(x, window.innerWidth - 160)}px`;
        m.style.top = `${Math.min(y, window.innerHeight - 100)}px`;
    }

    hideContextMenu() {
        const m = document.getElementById('contextMenu');
        if (m) m.style.display = 'none';
        this.contextMenuTarget = null;
    }

    showFolderContextMenu(x, y, id) {
        this.hideAllContextMenus();
        this.folderContextMenuTarget = id;
        const m = document.getElementById('folderContextMenu');
        if (!m) return;
        m.style.display = 'block';
        m.style.left = `${Math.min(x, window.innerWidth - 160)}px`;
        m.style.top = `${Math.min(y, window.innerHeight - 160)}px`;
    }

    hideFolderContextMenu() {
        const m = document.getElementById('folderContextMenu');
        if (m) m.style.display = 'none';
        this.folderContextMenuTarget = null;
    }

    showNoteContextMenu(x, y, id) {
        this.hideAllContextMenus();
        this.noteContextMenuTarget = id;
        const m = document.getElementById('noteContextMenu');
        if (!m) return;
        m.style.display = 'block';
        m.style.left = `${Math.min(x, window.innerWidth - 160)}px`;
        m.style.top = `${Math.min(y, window.innerHeight - 120)}px`;
    }

    hideNoteContextMenu() {
        const m = document.getElementById('noteContextMenu');
        if (m) m.style.display = 'none';
        this.noteContextMenuTarget = null;
    }

    showNoteFolderContextMenu(x, y, id) {
        this.hideAllContextMenus();
        this.noteFolderContextMenuTarget = id;
        const m = document.getElementById('noteFolderContextMenu');
        if (!m) return;
        m.style.display = 'block';
        m.style.left = `${Math.min(x, window.innerWidth - 160)}px`;
        m.style.top = `${Math.min(y, window.innerHeight - 100)}px`;
    }

    hideNoteFolderContextMenu() {
        const m = document.getElementById('noteFolderContextMenu');
        if (m) m.style.display = 'none';
        this.noteFolderContextMenuTarget = null;
    }

    showFolderBarContextMenu(x, y) {
        this.hideAllContextMenus();
        const m = document.getElementById('folderBarContextMenu');
        if (!m) return;
        m.style.display = 'block';
        m.style.left = `${Math.min(x, window.innerWidth - 220)}px`;
        m.style.top = `${Math.min(y, window.innerHeight - 200)}px`;
    }

    hideFolderBarContextMenu() {
        const m = document.getElementById('folderBarContextMenu');
        if (m) m.style.display = 'none';
    }

    showNoteFolderBarContextMenu(x, y) {
        this.hideAllContextMenus();
        const m = document.getElementById('noteFolderBarContextMenu');
        if (!m) return;
        m.style.display = 'block';
        m.style.left = `${Math.min(x, window.innerWidth - 220)}px`;
        m.style.top = `${Math.min(y, window.innerHeight - 140)}px`;
    }

    hideNoteFolderBarContextMenu() {
        const m = document.getElementById('noteFolderBarContextMenu');
        if (m) m.style.display = 'none';
    }

    async handleContextAction(e) {
        const a = e.target.dataset.action;
        if (!a || !this.contextMenuTarget) return;
        const id = this.contextMenuTarget;
        this.hideContextMenu();
        if (a === 'edit') this.showEditTileModal(id);
        else if (a === 'moveToFolder') this.moveToFolder(id);
        else if (a === 'delete') this.deleteTile(id);
    }

    async handleFolderContextAction(e) {
        const a = e.target.dataset.action;
        if (!a || !this.folderContextMenuTarget) return;
        const id = this.folderContextMenuTarget;
        this.hideFolderContextMenu();
        if (a === 'editFolder') this.showEditFolderModal(id);
        else if (a === 'setFolderPassword') this.setFolderPassword(id);
        else if (a === 'deleteFolder') this.deleteFolder(id);
    }

    async handleNoteContextAction(e) {
        const a = e.target.dataset.action;
        if (!a || !this.noteContextMenuTarget) return;
        const id = this.noteContextMenuTarget;
        this.hideNoteContextMenu();
        if (a === 'editNote') this.showEditNoteModal(id);
        else if (a === 'moveNoteToFolder') this.moveNoteToFolder(id);
        else if (a === 'deleteNote') this.deleteNote(id);
    }

    async handleNoteFolderContextAction(e) {
        const a = e.target.dataset.action;
        if (!a || !this.noteFolderContextMenuTarget) return;
        const id = this.noteFolderContextMenuTarget;
        this.hideNoteFolderContextMenu();
        if (a === 'editNoteFolder') this.showEditNoteFolderModal(id);
        else if (a === 'deleteNoteFolder') this.deleteNoteFolder(id);
    }

    async handleFolderBarAction(e) {
        const a = e.target.dataset.action;
        if (!a) return;
        this.hideFolderBarContextMenu();

        switch (a) {
            case 'sortFolderManual':
                this.settings.folderSortMode = 'manual';
                this._touchSettings();
                await api.storage.sync.set({ folderSortMode: 'manual' });
                this.renderFoldersBar();
                break;
            case 'sortFolderNameAsc':
                this.settings.folderSortMode = 'name-asc';
                this._touchSettings();
                await api.storage.sync.set({ folderSortMode: 'name-asc' });
                this.renderFoldersBar();
                break;
            case 'sortFolderNameDesc':
                this.settings.folderSortMode = 'name-desc';
                this._touchSettings();
                await api.storage.sync.set({ folderSortMode: 'name-desc' });
                this.renderFoldersBar();
                break;
            case 'sortFolderToggleEmpty':
                this.settings.folderShowEmpty = !this.settings.folderShowEmpty;
                this._touchSettings();
                await api.storage.sync.set({ folderShowEmpty: this.settings.folderShowEmpty });
                this.renderFoldersBar();
                this.toast(this.t(this.settings.folderShowEmpty ? 'emptyFoldersShown' : 'emptyFoldersHidden'));
                break;
            case 'sortFolderReset':
                if (!await DialogService.confirm(this.t('confirmResetNesting'))) return;
                const now = Date.now();
                this.folders.forEach(f => {
                    f.parentId = '';
                    f.updatedAt = now;
                });
                await this.saveData();
                this.renderFoldersBar();
                this.renderTiles();
                this.toast(this.t('nestingReset'));
                break;
        }
    }

    async handleNoteFolderBarAction(e) {
        const a = e.target.dataset.action;
        if (!a) return;
        this.hideNoteFolderBarContextMenu();

        switch (a) {
            case 'sortNoteFolderManual':
                this.settings.noteFolderSortMode = 'manual';
                this._touchSettings();
                await api.storage.sync.set({ noteFolderSortMode: 'manual' });
                this.renderNotesFoldersBar();
                break;
            case 'sortNoteFolderNameAsc':
                this.settings.noteFolderSortMode = 'name-asc';
                this._touchSettings();
                await api.storage.sync.set({ noteFolderSortMode: 'name-asc' });
                this.renderNotesFoldersBar();
                break;
            case 'sortNoteFolderNameDesc':
                this.settings.noteFolderSortMode = 'name-desc';
                this._touchSettings();
                await api.storage.sync.set({ noteFolderSortMode: 'name-desc' });
                this.renderNotesFoldersBar();
                break;
        }
    }

    async _applyAutoColorPreview() {
        const autoColorCb = document.getElementById('tileAutoColor');
        if (!autoColorCb || !autoColorCb.checked) return;

        const url = document.getElementById('tileUrl')?.value?.trim();
        const manualIcon = document.getElementById('tileIcon')?.value?.trim();

        const token = ++this._autoColorPreviewToken;

        let iconUrl = manualIcon;
        if (!iconUrl && url) {
            const normalized = normalizeUrl(url);
            if (normalized) {
                try {
                    /* v6.8.0: уважаем настройку источника favicon */
                    iconUrl = await getCachedFavicon(normalized, this.settings.faviconSource);
                    if (!iconUrl) iconUrl = resolveFaviconUrl(normalized, this.settings.faviconSource);
                } catch (e) {
                    iconUrl = resolveFaviconUrl(normalized, this.settings.faviconSource);
                }
            }
        }

        if (!iconUrl) return;

        const fallback = this.settings.tileBgDefault || '#4CAF50';
        const dominant = await extractDominantColor(iconUrl, fallback);

        if (token !== this._autoColorPreviewToken) return;
        if (!autoColorCb.checked) return;

        const bgEl = document.getElementById('tileBgColor');
        const textEl = document.getElementById('tileTextColor');
        if (bgEl) bgEl.value = dominant;
        if (textEl) textEl.value = this._pickContrastColor(dominant);
    }

    _setColorInputsDisabled(disabled) {
        const bgEl = document.getElementById('tileBgColor');
        const textEl = document.getElementById('tileTextColor');
        if (bgEl) bgEl.disabled = disabled;
        if (textEl) textEl.disabled = disabled;
    }

    /* v6.9.3: «Авто контрастный текст» — живой пересчёт цвета текста от цвета
       фона и блокировка ручного выбора, пока галочка включена */
    _bindAutoText(cbId, bgId, textId) {
        const cb = document.getElementById(cbId);
        const bg = document.getElementById(bgId);
        const text = document.getElementById(textId);
        if (!cb || !text) return;
        const apply = () => { if (cb.checked && bg) text.value = this._pickContrastColor(bg.value); };
        cb.addEventListener('change', () => {
            /* у плитки поле текста также блокируется галочкой «Авто» цвета */
            const alsoAuto = textId === 'tileTextColor'
                && document.getElementById('tileAutoColor')?.checked;
            text.disabled = cb.checked || !!alsoAuto;
            apply();
        });
        if (bg) bg.addEventListener('input', apply);
    }

    /* v6.9.3: динамическое изменение ширины панели заметок захватом за край */
    _setupSidebarResize() {
        if (this._sidebarResizeBound) return;
        const handle = document.getElementById('sidebarResizer');
        const sb = document.getElementById('notesSidebar');
        if (!handle || !sb) return;
        this._sidebarResizeBound = true;

        handle.addEventListener('pointerdown', (e) => {
            if (e.button !== 0) return;
            if (window.innerWidth <= 768) return; /* мобильная вёрстка — панель на всю ширину */
            e.preventDefault();
            const rect = sb.getBoundingClientRect();
            const isRtl = document.documentElement.dir === 'rtl';
            /* в RTL панель справа — неподвижен правый край, в LTR — левый */
            const anchor = isRtl ? rect.right : rect.left;
            handle.classList.add('active');
            document.body.classList.add('sidebar-resizing');

            const onMove = (ev) => {
                const w = Math.round(Math.abs(ev.clientX - anchor));
                const clamped = Math.min(600, Math.max(200, w));
                document.documentElement.style.setProperty('--sidebar-width', clamped + 'px');
                this._sidebarWidthDraft = clamped;
            };
            const onUp = () => {
                document.removeEventListener('pointermove', onMove);
                document.removeEventListener('pointerup', onUp);
                handle.classList.remove('active');
                document.body.classList.remove('sidebar-resizing');
                const w = this._sidebarWidthDraft;
                this._sidebarWidthDraft = null;
                if (w) {
                    this.settings.sidebarWidth = w;
                    this._touchSettings();
                    try { api.storage.sync.set({ sidebarWidth: w }); } catch (err) {}
                }
            };
            document.addEventListener('pointermove', onMove);
            document.addEventListener('pointerup', onUp);
        });
    }

    /* v6.9.3: применение сохранённой ширины панели (на мобильной вёрстке
       width:100% в media-запросе перекрывает переменную) */
    _applySidebarWidth() {
        const w = parseInt(this.settings.sidebarWidth);
        if (Number.isFinite(w) && w >= 200 && w <= 600) {
            document.documentElement.style.setProperty('--sidebar-width', w + 'px');
        }
    }

    setupEvents() {
        if (this._eventsBound) return;
        this._eventsBound = true;

        const bind = (id, ev, fn) => {
            const el = document.getElementById(id);
            if (el) el.addEventListener(ev, fn);
        };

        bind('addTileButton', 'click', (e) => { flashButtonFeedback(e.currentTarget); this.showAddTileModal(); });
        bind('syncButton', 'click', (e) => this.syncWithServer(e.currentTarget));
        bind('settingsButton', 'click', (e) => {
            flashButtonFeedback(e.currentTarget, 'success');
            api.runtime.sendMessage({ action: 'openOptionsAsPopup' });
        });
        bind('themeButton', 'click', (e) => { flashButtonFeedback(e.currentTarget); this.toggleTheme(); });
        bind('addNote', 'click', (e) => { flashButtonFeedback(e.currentTarget); this.showAddNoteModal(this.currentNoteFolder); });
        bind('pinHeaderButton', 'click', (e) => { flashButtonFeedback(e.currentTarget); this.toggleHeaderPin(); });
        bind('showHeaderButton', 'click', (e) => { flashButtonFeedback(e.currentTarget); this.showHeader(); });
        bind('collapseSidebar', 'click', (e) => { flashButtonFeedback(e.currentTarget); this.collapseSidebar(); });
        /* v6.9.7: нажатие на ЛЮБУЮ область кнопки «Заметки» — три канала
           (pointerdown/pointerup/click) с дедупом 300мс, т.к. при вертикальной
           плашке часть кликов в Chromium не доходила до click. */
        let lastExpandTs = 0;
        const onExpandSidebar = (e) => {
            const n = Date.now();
            if (n - lastExpandTs < 300) return;
            lastExpandTs = n;
            flashButtonFeedback(e.currentTarget);
            this.expandSidebar();
        };
        bind('expandSidebar', 'pointerdown', onExpandSidebar);
        bind('expandSidebar', 'pointerup', onExpandSidebar);
        bind('expandSidebar', 'click', onExpandSidebar);

        bind('searchInput', 'input', (e) => this.onSearchInput(e.target.value));
        bind('clearSearch', 'click', (e) => {
            flashButtonFeedback(e.currentTarget);
            const i = document.getElementById('searchInput');
            if (i) i.value = '';
            this.tilesLimit = 50;
            this.notesLimit = 50;
            this.renderTiles();
            this.renderNotes();
            this.scheduleSaveUiState();
        });
        bind('webSearchInput', 'keydown', (e) => { if (e.key === 'Enter') this.searchWebWithQuickCommand(); });

        bind('tileForm', 'submit', (e) => this.saveTileFromForm(e));
        bind('folderForm', 'submit', (e) => this.saveFolderFromForm(e));
        bind('noteFolderForm', 'submit', (e) => this.saveNoteFolderFromForm(e));
        bind('noteForm', 'submit', (e) => this.saveNoteFromForm(e));

        bind('cancelButton', 'click', (e) => { flashButtonFeedback(e.currentTarget); this.hideModal('tileModal'); });
        bind('cancelFolderButton', 'click', (e) => { flashButtonFeedback(e.currentTarget); this.hideModal('folderModal'); });
        bind('cancelNoteFolderButton', 'click', (e) => { flashButtonFeedback(e.currentTarget); this.hideModal('noteFolderModal'); });
        bind('cancelNoteButton', 'click', (e) => { flashButtonFeedback(e.currentTarget); this.hideModal('noteModal'); });

        bind('confirmPassword', 'click', () => this.confirmFolderPassword());
        bind('cancelPassword', 'click', (e) => { flashButtonFeedback(e.currentTarget); this.hideModal('passwordModal'); });
        bind('passwordInput', 'keydown', (e) => {
            if (e.key === 'Enter') { e.preventDefault(); this.confirmFolderPassword(); }
        });

        bind('historySearchInput', 'input', (e) => this.searchHistory(e.target.value));
        bind('closeHistory', 'click', (e) => { flashButtonFeedback(e.currentTarget); this.hideModal('historyModal'); });

        bind('tileBgType', 'change', (e) => this.toggleTileBgType(e.target.value));
        bind('tileOpacity', 'input', (e) => {
            const s = document.getElementById('tileOpacityValue');
            if (s) s.textContent = e.target.value + '%';
        });
        bind('tileIconOpacity', 'input', (e) => {
            const s = document.getElementById('tileIconOpacityValue');
            if (s) s.textContent = e.target.value + '%';
        });

        bind('tileAutoColor', 'change', async (e) => {
            const enabled = e.target.checked;
            this._setColorInputsDisabled(enabled);
            /* v6.9.3: «Авто контрастный текст» тоже держит поле текста заблокированным */
            const txtEl = document.getElementById('tileTextColor');
            if (txtEl && !enabled && document.getElementById('tileAutoText')?.checked) txtEl.disabled = true;
            if (enabled) {
                await this._applyAutoColorPreview();
            }
        });

        bind('tileUrl', 'input', () => {
            clearTimeout(this._autoColorTimer);
            this._autoColorTimer = setTimeout(() => this._applyAutoColorPreview(), 400);
        });
        bind('tileIcon', 'input', () => {
            clearTimeout(this._autoColorTimer);
            this._autoColorTimer = setTimeout(() => this._applyAutoColorPreview(), 400);
        });

        /* v6.9.3: авто-контрастный текст на четырёх формах */
        this._bindAutoText('tileAutoText', 'tileBgColor', 'tileTextColor');
        this._bindAutoText('folderAutoText', 'folderColor', 'folderTextColor');
        this._bindAutoText('noteFolderAutoText', 'noteFolderColor', 'noteFolderTextColor');
        this._bindAutoText('noteAutoText', 'noteColor', 'noteTextColor');

        /* v6.9.3: изменение ширины панели заметок захватом за край */
        this._setupSidebarResize();

        const ctx = document.getElementById('contextMenu');
        if (ctx) ctx.addEventListener('click', (e) => this.handleContextAction(e));
        const fctx = document.getElementById('folderContextMenu');
        if (fctx) fctx.addEventListener('click', (e) => this.handleFolderContextAction(e));
        const nctx = document.getElementById('noteContextMenu');
        if (nctx) nctx.addEventListener('click', (e) => this.handleNoteContextAction(e));
        const nfctx = document.getElementById('noteFolderContextMenu');
        if (nfctx) nfctx.addEventListener('click', (e) => this.handleNoteFolderContextAction(e));
        const fbctx = document.getElementById('folderBarContextMenu');
        if (fbctx) fbctx.addEventListener('click', (e) => this.handleFolderBarAction(e));
        const nfbctx = document.getElementById('noteFolderBarContextMenu');
        if (nfbctx) nfbctx.addEventListener('click', (e) => this.handleNoteFolderBarAction(e));

        document.addEventListener('click', (e) => {
            if (!e.target.closest('.context-menu')) {
                this.hideAllContextMenus();
            }
        });

        document.addEventListener('mousemove', (e) => this._onMouseMove(e));
        document.addEventListener('mouseup', (e) => this._onMouseUp(e));
        window.addEventListener('blur', () => {
            const d = this.dragState;
            if (d.el) d.el.classList.remove('dragging');
            if (d.lastOver) d.lastOver.classList.remove('drag-over');
            this.dragState = { type: null, id: null, el: null, startX: 0, startY: 0, active: false, lastOver: null };
        });

        const saveOnce = () => {
            if (this._uiStateSaved) return;
            this._uiStateSaved = true;
            clearTimeout(this._uiStateTimer);
            this.saveUiState();
        };
        window.addEventListener('pagehide', saveOnce);
        window.addEventListener('beforeunload', saveOnce);

        api.runtime.onMessage.addListener((msg, _sender, _sendResponse) => {
            if (!msg) return false;

            if (msg.action === 'focusSearch') {
                const si = document.getElementById('searchInput');
                if (si) si.focus();

            } else if (msg.action === 'openAddTileModal') {
                this.showAddTileModal(msg.url, msg.title);

            } else if (msg.action === 'profileChanged') {
                this.loadData().then(() => this.renderAll());

            } else if (msg.action === 'dataChanged') {
                if (Date.now() < this._selfInitiatedUntil) {
                    this._selfInitiatedUntil = 0;
                    return false;
                }
                this.loadData().then(() => {
                    this.renderAll();
                    this.toast(this.t('toastDataUpdated'));
                });

            } else if (msg.action === 'lockNow') {
                this.showLockScreen();

            } else if (msg.action === 'unlocked') {
                const lock = document.getElementById('lockScreen');
                if (lock) {
                    if (typeof this._lockCleanup === 'function') {
                        try { this._lockCleanup(); } catch (e) {}
                        this._lockCleanup = null;
                    }
                    lock.remove();
                    if (!this._eventsBound) {
                        this.initializeApp();
                    }
                }

            } else if (msg.action === 'currencyUpdated') {
                if (this.settings.currencyWidget) {
                    this.updateCurrencyDisplay();
                    if (msg.manual === true) {
                        this.toast(this.t('toastCurrencyUpdated'));
                    }
                }

            }
            return false;
        });

        if (window.matchMedia) {
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
                if (this.settings?.theme === 'auto') {
                    this.applyTheme();
                    this.renderHeaderActions();
                }
            });
        }

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                document.querySelectorAll('.modal.active').forEach(m => m.classList.remove('active'));
                this.hideAllContextMenus();
            }
        });
    }

    onSearchInput(value) {
        const b = document.getElementById('clearSearch');
        if (b) b.style.display = value ? 'block' : 'none';
        clearTimeout(this._searchTimer);
        this._searchTimer = setTimeout(() => {
            this.tilesLimit = 50;
            this.notesLimit = 50;
            this.renderTiles();
            this.renderNotes();
            this.scheduleSaveUiState();
        }, 200);
    }

    setupPasswordToggles() {
        if (this._passTogglesBound) return;
        this._passTogglesBound = true;

        document.querySelectorAll('.toggle-pass').forEach(btn => {
            btn.addEventListener('click', () => {
                const target = document.getElementById(btn.dataset.target);
                if (!target) return;
                const isPass = target.type === 'password';
                target.type = isPass ? 'text' : 'password';
                btn.textContent = isPass ? '🙈' : '👁';
            });
        });
    }

    setupActivityTracker() {
        if (this._activityBound) return;
        this._activityBound = true;

        const sendActivity = () => {
            const now = Date.now();
            if (now - this._lastActivitySent < 10 * 1000) return;
            this._lastActivitySent = now;
            api.runtime.sendMessage({ action: 'activity' }).catch(() => {});
        };

        sendActivity();

        document.addEventListener('mousemove', sendActivity, { passive: true });
        document.addEventListener('keydown', sendActivity, { passive: true });
        document.addEventListener('click', sendActivity, { passive: true });
        document.addEventListener('scroll', sendActivity, { passive: true });
    }

    setupScrollObserver() {
        const sentinel = document.getElementById('scrollSentinel');
        const root = document.querySelector('.content-area');
        if (!sentinel || !root) return;

        if (this.scrollObserver) {
            try { this.scrollObserver.disconnect(); } catch (e) {}
            this.scrollObserver = null;
        }

        try {
            this.scrollObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const oldLimit = this.tilesLimit;
                        this.tilesLimit += 50;
                        if (this.tilesLimit !== oldLimit) this.renderTiles();
                    }
                });
            }, { root, rootMargin: '100px' });

            this.scrollObserver.observe(sentinel);
        } catch (e) {
            logWarn('newtab.setupScrollObserver', e.message);
        }
    }

    /* ============================================================
       v6.6.6: toggleTheme теперь помечает настройки как изменённые.
       ============================================================ */

    toggleTheme() {
        this.settings.theme = this.currentTheme === 'dark' ? 'light' : 'dark';
        this._touchSettings();
        this.applyTheme();
        this.renderHeaderActions();
        api.storage.sync.set({ theme: this.settings.theme });
    }

    toggleHeaderPin() {
        this.settings.headerHidden = !this.settings.headerHidden;
        this.applyHeaderState();
        this.saveData();
        this.scheduleSaveUiState();
    }

    showHeader() {
        this.settings.headerHidden = false;
        this.applyHeaderState();
        this.saveData();
        this.scheduleSaveUiState();
    }

    applyHeaderState() {
        const h = document.getElementById('mainHeader');
        const b = document.getElementById('showHeaderButton');
        if (!h || !b) return;
        if (this.settings.headerHidden) {
            h.classList.add('hidden');
            b.style.display = 'flex';
        } else {
            h.classList.remove('hidden');
            b.style.display = 'none';
        }
        /* v6.9.4: шапка поверх прокрутки — актуализируем отступ */
        document.body.classList.toggle('header-hidden', !!this.settings.headerHidden);
        this._updateHeaderHeight();
    }

    /* v6.9.4: шапка абсолютная — держим --header-h равной её реальной
       высоте, чтобы контент начинался ниже шапки */
    _updateHeaderHeight() {
        const h = document.getElementById('mainHeader');
        const v = (h && !h.classList.contains('hidden')) ? h.offsetHeight : 0;
        document.documentElement.style.setProperty('--header-h', v + 'px');
        if (!this._headerResizeBound && h && typeof ResizeObserver !== 'undefined') {
            this._headerResizeBound = true;
            new ResizeObserver(() => this._updateHeaderHeight()).observe(h);
        }
    }

    collapseSidebar() {
        this.settings.sidebarCollapsed = true;
        this.applySidebarState();
        this.saveData();
        this.scheduleSaveUiState();
    }

    /* ============================================================
       v6.6.6: expandSidebar помечает настройки при изменении showNotes.
       ============================================================ */

    expandSidebar() {
        /* v6.9.8: кнопка «Заметки» вращается при нажатии — даём анимации
           доиграть, затем раскрываем панель (кнопка скрывается) */
        const eb = document.getElementById('expandSidebar');
        if (eb && eb.style.display !== 'none') {
            eb.classList.add('spinning');
            setTimeout(() => {
                eb.classList.remove('spinning');
                this._doExpandSidebar();
            }, 340);
            return;
        }
        this._doExpandSidebar();
    }

    _doExpandSidebar() {
        this.settings.sidebarCollapsed = false;
        if (this.settings.showNotes === false) {
            this.settings.showNotes = true;
            this._touchSettings();
            try { api.storage.sync.set({ showNotes: true }); } catch (e) {}
        }
        this.applySidebarState();
        this.saveData();
        this.scheduleSaveUiState();
    }

    toggleFolders() {
        /* v6.8.4: скрываем всю строку папок вместе со стрелками прокрутки */
        const w = document.getElementById('foldersBarWrap');
        if (w) w.style.display = this.settings.showFolders ? 'flex' : 'none';
        if (!this.settings.showFolders) {
            this.currentFolder = 'all';
            this.renderTiles();
        }
    }

    showModal(id) {
        const m = document.getElementById(id);
        if (m) m.classList.add('active');
    }

    hideModal(id) {
        const m = document.getElementById(id);
        if (m) m.classList.remove('active');
    }

    showAddTileModal(url = '', title = '') {
        const mTitle = document.getElementById('modalTitle');
        if (mTitle) mTitle.textContent = this.t('addTileModal');

        document.getElementById('tileForm').reset();
        document.getElementById('tileId').value = '';
        document.getElementById('tileBgType').value = 'color';
        document.getElementById('tileBgColor').value = this.settings.tileBgDefault || '#4CAF50';
        document.getElementById('tileTextColor').value = this.settings.tileTextDefault || '#ffffff';
        document.getElementById('tileBgImageUrl').value = '';
        document.getElementById('tileOpacity').value = 100;
        document.getElementById('tileIconOpacity').value = 100;
        document.getElementById('tileOpacityValue').textContent = '100%';
        document.getElementById('tileIconOpacityValue').textContent = '100%';
        document.getElementById('tileShowTitle').checked = true;

        const autoColorCb = document.getElementById('tileAutoColor');
        if (autoColorCb) autoColorCb.checked = true;
        this._setColorInputsDisabled(true);
        const autoTextCbAdd = document.getElementById('tileAutoText');
        if (autoTextCbAdd) autoTextCbAdd.checked = false;

        this.toggleTileBgType('color');
        this.populateFolderSelect();

        const urlInput = document.getElementById('tileUrl');
        const titleInput = document.getElementById('tileTitle');
        if (urlInput) urlInput.value = url;
        if (titleInput) titleInput.value = title;

        this.showModal('tileModal');
        if (urlInput) urlInput.focus();

        if (url) this._applyAutoColorPreview();
    }

    showEditTileModal(id) {
        const t = this.tiles.find(x => x.id === id);
        if (!t) return;

        document.getElementById('modalTitle').textContent = this.t('editTileModal');
        document.getElementById('tileId').value = t.id;
        document.getElementById('tileTitle').value = t.title || '';
        document.getElementById('tileUrl').value = t.url;
        document.getElementById('tileIcon').value = t.icon || '';
        document.getElementById('tileBgColor').value = t.bgColor || '#4CAF50';
        document.getElementById('tileTextColor').value = t.textColor || '#ffffff';
        document.getElementById('tileBgImageUrl').value = t.bgImage || '';
        document.getElementById('tileOpacity').value = t.opacity || 100;
        document.getElementById('tileIconOpacity').value = t.iconOpacity ?? 100;
        document.getElementById('tileOpacityValue').textContent = (t.opacity || 100) + '%';
        document.getElementById('tileIconOpacityValue').textContent = (t.iconOpacity ?? 100) + '%';
        document.getElementById('tileShowTitle').checked = t.showTitle !== false;

        const autoColorCb = document.getElementById('tileAutoColor');
        const isAuto = t.autoColor === true;
        if (autoColorCb) autoColorCb.checked = isAuto;
        this._setColorInputsDisabled(isAuto);
        /* v6.9.3: авто-контрастный текст (для фона-изображения) */
        const autoTextCbEdit = document.getElementById('tileAutoText');
        if (autoTextCbEdit) autoTextCbEdit.checked = t.autoText === true;
        const tileTextElEdit = document.getElementById('tileTextColor');
        if (tileTextElEdit) tileTextElEdit.disabled = isAuto || t.autoText === true;

        const bt = document.getElementById('tileBgType');
        bt.value = t.bgImage ? 'image' : 'color';
        this.toggleTileBgType(bt.value);
        this.populateFolderSelect(t.folderId);
        this.showModal('tileModal');

        if (isAuto) this._applyAutoColorPreview();
    }

    toggleTileBgType(type) {
        const c = document.getElementById('tileBgColorGroup');
        const i = document.getElementById('tileBgImageGroup');
        if (c) c.style.display = type === 'color' ? 'block' : 'none';
        if (i) i.style.display = type === 'image' ? 'block' : 'none';
    }

    populateFolderSelect(sel = null) {
        const s = document.getElementById('tileFolder');
        if (!s) return;
        s.innerHTML = '';

        const noOpt = document.createElement('option');
        noOpt.value = '';
        noOpt.textContent = this.t('noFolder');
        s.appendChild(noOpt);

        const buildOpts = (parentId = '', level = 0) => {
            this.folders
                .filter(f => (f.parentId || '') === parentId)
                .forEach(f => {
                    const o = document.createElement('option');
                    o.value = f.id;
                    o.textContent = '—'.repeat(level) + ' ' + f.name;
                    if (sel !== null && f.id === sel) o.selected = true;
                    s.appendChild(o);
                    buildOpts(f.id, level + 1);
                });
        };
        buildOpts();

        if (sel === null && this.currentFolder !== 'all') s.value = this.currentFolder;
    }

    async saveTileFromForm(e) {
        e.preventDefault();
        const submitBtn = e.target.querySelector('button[type="submit"]');
        if (submitBtn) flashButtonFeedback(submitBtn);

        const url = normalizeUrl(document.getElementById('tileUrl').value);
        if (!url) {
            if (submitBtn) flashButtonFeedback(submitBtn, 'error');
            return;
        }

        const id = document.getElementById('tileId').value || `tile_${Date.now()}`;
        const existing = this.tiles.find(t => t.id === id);

        const duplicate = this.tiles.find(t => t.id !== id && t.url === url);
        if (duplicate) {
            const choice = await DialogService.choice(
                this.tf('dupUrlMsg', { title: duplicate.title || duplicate.url }),
                [
                    { label: this.t('cancel'), value: 'cancel', variant: 'secondary' },
                    { label: this.t('dlgDuplicate'), value: 'add', variant: 'secondary' },
                    { label: this.t('dlgEditVerb'), value: 'edit', variant: 'primary' }
                ]
            );

            if (choice === null || choice === 'cancel') {
                if (submitBtn) flashButtonFeedback(submitBtn, 'error');
                return;
            }

            if (choice === 'edit') {
                this.hideModal('tileModal');
                setTimeout(() => this.showEditTileModal(duplicate.id), 50);
                return;
            }
        }

        let hostname = '';
        try { hostname = new URL(url).hostname; } catch (err) { hostname = ''; }

        const title = document.getElementById('tileTitle').value.trim() || hostname;
        const bgType = document.getElementById('tileBgType').value;
        const opacity = parseInt(document.getElementById('tileOpacity').value) || 100;
        const iconOpacity = parseInt(document.getElementById('tileIconOpacity').value) || 100;
        const showTitle = document.getElementById('tileShowTitle').checked;
        const autoColor = document.getElementById('tileAutoColor')?.checked ?? false;
        const autoText = document.getElementById('tileAutoText')?.checked ?? false;

        const manualIcon = document.getElementById('tileIcon').value;
        /* v6.8.0: уважаем настройку источника favicon */
        let iconUrl = manualIcon || await getCachedFavicon(url, this.settings.faviconSource);
        if (!iconUrl) iconUrl = resolveFaviconUrl(url, this.settings.faviconSource);

        let bgColor = document.getElementById('tileBgColor').value;
        let textColor = document.getElementById('tileTextColor').value;

        if (autoColor) {
            const fallback = this.settings.tileBgDefault || '#4CAF50';
            try {
                /* Авто-цвет не должен блокировать сохранение:
                   жёсткий лимит 6с (офлайн-цепочка img→fetch может идти долго) */
                bgColor = await Promise.race([
                    extractDominantColor(iconUrl, fallback),
                    new Promise(res => setTimeout(() => res(fallback), 6000))
                ]);
                textColor = this._pickContrastColor(bgColor);
            } catch (err) {}
        }

        /* v6.9.3: авто-контрастный текст — приоритет над ручным/авто цветом;
           для фона-изображения базой служит цвет фона плитки */
        if (autoText) {
            const base = bgType === 'image'
                ? (existing?.bgColor || this.settings.tileBgDefault || '#4CAF50')
                : bgColor;
            textColor = this._pickContrastColor(base);
        }

        const now = Date.now();
        const tile = {
            id, title, url,
            icon: iconUrl,
            bgColor: bgType === 'color' ? bgColor : (existing?.bgColor || '#4CAF50'),
            bgImage: bgType === 'image' ? document.getElementById('tileBgImageUrl').value : '',
            textColor,
            folderId: document.getElementById('tileFolder').value,
            tags: [], opacity, iconOpacity, showTitle,
            autoColor,
            autoText,
            reminder: existing?.reminder || null,
            createdAt: existing?.createdAt || now,
            updatedAt: now
        };

        if (existing) Object.assign(existing, tile);
        else this.tiles.push(tile);

        await this.saveData();
        if (submitBtn) flashButtonFeedback(submitBtn, 'success');
        this.hideModal('tileModal');
        this.renderTiles();
    }

    async deleteTile(id) {
        if (!await DialogService.confirm(this.t('deleteConfirm'))) return;
        this._addTombstone(id);
        this.tiles = this.tiles.filter(t => t.id !== id);
        await this.saveData();
        this.renderTiles();
    }

    async moveToFolder(id) {
        const list = this.folders.map((f, i) => `${i + 1}. ${f.name}`).join('\n');
        const input = await DialogService.prompt(
            `${this.t('moveToFolder')}:\n0. ${this.t('noFolder')}\n${list}`, '0');
        if (input === null) return;
        const i = parseInt(input);
        if (isNaN(i)) return;

        const t = this.tiles.find(x => x.id === id);
        if (!t) return;
        t.folderId = i === 0 ? '' : (i > 0 && i <= this.folders.length ? this.folders[i - 1].id : '');
        t.updatedAt = Date.now();
        await this.saveData();
        this.renderTiles();
    }

    showAddFolderModal() {
        document.getElementById('folderModalTitle').textContent = this.t('createFolder');
        document.getElementById('folderForm').reset();
        document.getElementById('folderId').value = '';
        document.getElementById('folderColor').value = this.settings.folderDefaultColor || '#667eea';
        document.getElementById('folderTextColor').value = this.settings.folderDefaultTextColor || '#ffffff';
        document.getElementById('folderOpacity').value = 100;
        document.getElementById('folderPassword').value = '';
        const fAutoTextAdd = document.getElementById('folderAutoText');
        if (fAutoTextAdd) fAutoTextAdd.checked = false;
        const fTextAddEl = document.getElementById('folderTextColor');
        if (fTextAddEl) fTextAddEl.disabled = false;
        this.populateFolderParentSelect();
        this.showModal('folderModal');
    }

    showEditFolderModal(id) {
        const f = this.folders.find(x => x.id === id);
        if (!f) return;
        document.getElementById('folderModalTitle').textContent = this.t('editFolderModal');
        document.getElementById('folderId').value = f.id;
        document.getElementById('folderName').value = f.name;
        document.getElementById('folderColor').value = f.color;
        document.getElementById('folderTextColor').value = f.textColor || '#ffffff';
        document.getElementById('folderOpacity').value = f.opacity || 100;
        const fAutoTextEdit = document.getElementById('folderAutoText');
        if (fAutoTextEdit) fAutoTextEdit.checked = f.autoText === true;
        const fTextEl = document.getElementById('folderTextColor');
        if (fTextEl) fTextEl.disabled = f.autoText === true;
        /* v6.8.0: пароль не показываем (в поле лежит хэш);
           пустое значение = оставить текущий */
        const _pwdEl = document.getElementById('folderPassword');
        _pwdEl.value = '';
        _pwdEl.placeholder = f.password ? this.t('keepCurrentPwd') : '';
        this.populateFolderParentSelect(f.parentId || '', f.id);
        this.showModal('folderModal');
    }

    populateFolderParentSelect(sel = '', excludeId = '') {
        const s = document.getElementById('folderParent');
        if (!s) return;
        s.innerHTML = '';

        const noOpt = document.createElement('option');
        noOpt.value = '';
        noOpt.textContent = this.t('noFolder');
        s.appendChild(noOpt);

        if (!Array.isArray(this.folders) || this.folders.length === 0) return;

        this.folders.forEach(f => {
            if (f.id === excludeId) return;
            const o = document.createElement('option');
            o.value = f.id;
            o.textContent = f.name;
            if (f.id === sel) o.selected = true;
            s.appendChild(o);
        });
    }

    async saveFolderFromForm(e) {
        e.preventDefault();
        const submitBtn = e.target.querySelector('button[type="submit"]');
        if (submitBtn) flashButtonFeedback(submitBtn);

        const pwd = document.getElementById('folderPassword').value;
        const parentId = document.getElementById('folderParent')?.value || '';
        const existingId = document.getElementById('folderId').value;
        const now = Date.now();

        const existing = existingId ? this.folders.find(x => x.id === existingId) : null;

        /* v6.8.0: храним только pbkdf2-хэш. Пустое поле при редактировании
           означает «не менять пароль»; пустое при создании — «без пароля». */
        let pwdRecord = existing ? (existing.password || '') : '';
        if (pwd) pwdRecord = await hashFolderPassword(pwd);

        const f = {
            id: existingId || `f_${now}`,
            name: document.getElementById('folderName').value,
            color: document.getElementById('folderColor').value,
            textColor: (document.getElementById('folderAutoText')?.checked)
                ? this._pickContrastColor(document.getElementById('folderColor').value)
                : document.getElementById('folderTextColor').value,
            autoText: document.getElementById('folderAutoText')?.checked ?? false,
            opacity: parseInt(document.getElementById('folderOpacity').value) || 100,
            password: pwdRecord,
            parentId,
            createdAt: existing?.createdAt || now,
            updatedAt: now
        };
        const idx = this.folders.findIndex(x => x.id === f.id);
        if (idx !== -1) this.folders[idx] = f;
        else this.folders.push(f);

        if (pwdRecord) this.folderPasswords[`tile_${f.id}`] = pwdRecord;
        else delete this.folderPasswords[`tile_${f.id}`];

        await this.saveData();
        if (submitBtn) flashButtonFeedback(submitBtn, 'success');
        this.hideModal('folderModal');
        this.renderFoldersBar();
        this.renderTiles();
    }

    async setFolderPassword(id) {
        const f = this.folders.find(x => x.id === id);
        if (!f) return;
        /* v6.8.0: сохраняем только хэш; подсказка в prompt не показывает
           текущий секрет */
        const p = await DialogService.prompt(this.t('setFolderPassword') + ':', '');
        if (p === null) return;
        const rec = p ? await hashFolderPassword(p) : '';
        f.password = rec;
        f.updatedAt = Date.now();
        if (rec) this.folderPasswords[`tile_${id}`] = rec;
        else delete this.folderPasswords[`tile_${id}`];
        await this.saveData();
        this.renderFoldersBar();
    }

    async deleteFolder(id) {
        if (!await DialogService.confirm(this.t('deleteFolderConfirm'))) return;
        this._addTombstone(id);
        this.folders = this.folders.filter(f => f.id !== id);
        const now = Date.now();
        this.tiles.forEach(t => { if (t.folderId === id) { t.folderId = ''; t.updatedAt = now; } });
        delete this.folderPasswords[`tile_${id}`];
        this.unlockedFolders.delete(`tile_${id}`);
        if (this.currentFolder === id) this.currentFolder = 'all';
        await this.saveData();
        this.renderFoldersBar();
        this.renderTiles();
        this.scheduleSaveUiState();
    }

    checkFolderPassword(folderId, type) {
        const pwd = this.folderPasswords[`${type}_${folderId}`];
        if (!pwd) return true;
        if (this.unlockedFolders.has(`${type}_${folderId}`)) return true;
        this.pendingFolderUnlock = { folderId, type };
        const input = document.getElementById('passwordInput');
        if (input) input.value = '';
        this.showModal('passwordModal');
        setTimeout(() => input?.focus(), 100);
        return false;
    }

    async confirmFolderPassword() {
        const input = document.getElementById('passwordInput');
        if (!input || !this.pendingFolderUnlock) return;
        const { folderId, type } = this.pendingFolderUnlock;
        const saved = this.folderPasswords[`${type}_${folderId}`];

        /* v6.8.0: сверяем хэш, не plaintext */
        if (await verifyFolderPassword(input.value, saved)) {
            this.hideModal('passwordModal');
            this.unlockedFolders.add(`${type}_${folderId}`);
            this.pendingFolderUnlock = null;
            if (type === 'tile') this.switchFolder(folderId);
            else this.switchNoteFolder(folderId);
        } else {
            this.toast(this.t('wrongPassword'));
            input.value = '';
            input.focus();
        }
    }

    getChildFolderIds(parentId) {
        const result = [parentId];
        this.folders.filter(f => f.parentId === parentId).forEach(f => {
            result.push(...this.getChildFolderIds(f.id));
        });
        return result;
    }

    showAddNoteModal(selectedFolder = '') {
        document.getElementById('noteModalTitle').textContent = this.t('addNoteModal');
        document.getElementById('noteForm').reset();
        document.getElementById('noteId').value = '';
        document.getElementById('noteTextColor').value = '#000000';
        document.getElementById('noteColor').value = '#ffeb3b';
        document.getElementById('noteOpacity').value = 100;
        const nAutoTextAdd = document.getElementById('noteAutoText');
        if (nAutoTextAdd) nAutoTextAdd.checked = false;
        const nTextAddEl = document.getElementById('noteTextColor');
        if (nTextAddEl) nTextAddEl.disabled = false;
        this.populateNoteFolderSelect(selectedFolder);
        this.showModal('noteModal');
    }

    showEditNoteModal(id) {
        const n = this.notes.find(x => x.id === id);
        if (!n) return;
        document.getElementById('noteModalTitle').textContent = this.t('editNoteModal');
        document.getElementById('noteId').value = n.id;
        document.getElementById('noteTitle').value = n.title;
        document.getElementById('noteContent').value = n.content;
        document.getElementById('noteTextColor').value = n.textColor || '#000000';
        document.getElementById('noteColor').value = n.color || '#ffeb3b';
        document.getElementById('noteOpacity').value = n.opacity || 100;
        const nAutoTextEdit = document.getElementById('noteAutoText');
        if (nAutoTextEdit) nAutoTextEdit.checked = n.autoText === true;
        const nTextEditEl = document.getElementById('noteTextColor');
        if (nTextEditEl) nTextEditEl.disabled = n.autoText === true;
        this.populateNoteFolderSelect(n.folderId || '');
        this.showModal('noteModal');
    }

    populateNoteFolderSelect(sel = '') {
        const s = document.getElementById('noteFolder');
        if (!s) return;
        s.innerHTML = '';

        const noOpt = document.createElement('option');
        noOpt.value = '';
        noOpt.textContent = this.t('noFolder');
        s.appendChild(noOpt);

        this.noteFolders.forEach(f => {
            const o = document.createElement('option');
            o.value = f.id;
            o.textContent = f.name;
            if (f.id === sel) o.selected = true;
            s.appendChild(o);
        });
    }

    async saveNoteFromForm(e) {
        e.preventDefault();
        const submitBtn = e.target.querySelector('button[type="submit"]');
        if (submitBtn) flashButtonFeedback(submitBtn);

        const now = Date.now();
        const existingId = document.getElementById('noteId').value;
        const existing = existingId ? this.notes.find(x => x.id === existingId) : null;

        const n = {
            id: existingId || `n_${now}`,
            title: document.getElementById('noteTitle').value,
            content: document.getElementById('noteContent').value,
            textColor: (document.getElementById('noteAutoText')?.checked)
                ? this._pickContrastColor(document.getElementById('noteColor').value)
                : document.getElementById('noteTextColor').value,
            autoText: document.getElementById('noteAutoText')?.checked ?? false,
            color: document.getElementById('noteColor').value,
            opacity: parseInt(document.getElementById('noteOpacity').value) || 100,
            folderId: document.getElementById('noteFolder').value,
            createdAt: existing?.createdAt || now,
            updatedAt: now
        };
        const idx = this.notes.findIndex(x => x.id === n.id);
        if (idx !== -1) this.notes[idx] = { ...this.notes[idx], ...n };
        else this.notes.push(n);

        await this.saveData();
        if (submitBtn) flashButtonFeedback(submitBtn, 'success');
        this.hideModal('noteModal');
        this.renderNotes();
    }

    async deleteNote(id) {
        if (!await DialogService.confirm(this.t('deleteNoteConfirm'))) return;
        this._addTombstone(id);
        this.notes = this.notes.filter(n => n.id !== id);
        await this.saveData();
        this.renderNotes();
    }

    async moveNoteToFolder(id) {
        const list = this.noteFolders.map((f, i) => `${i + 1}. ${f.name}`).join('\n');
        const input = await DialogService.prompt(
            `${this.t('moveToFolder')}:\n0. ${this.t('noFolder')}\n${list}`, '0');
        if (input === null) return;
        const i = parseInt(input);
        if (isNaN(i)) return;

        const n = this.notes.find(x => x.id === id);
        if (!n) return;
        n.folderId = i === 0 ? '' : (i > 0 && i <= this.noteFolders.length ? this.noteFolders[i - 1].id : '');
        n.updatedAt = Date.now();
        await this.saveData();
        this.renderNotes();
    }

    showAddNoteFolderModal() {
        document.getElementById('noteFolderModalTitle').textContent = this.t('createNoteFolder');
        document.getElementById('noteFolderForm').reset();
        document.getElementById('noteFolderId').value = '';
        document.getElementById('noteFolderColor').value = this.settings.noteFolderDefaultColor || '#667eea';
        document.getElementById('noteFolderTextColor').value = this.settings.noteFolderDefaultTextColor || '#ffffff';
        document.getElementById('noteFolderOpacity').value = 100;
        document.getElementById('noteFolderPassword').value = '';
        const nfAutoTextAdd = document.getElementById('noteFolderAutoText');
        if (nfAutoTextAdd) nfAutoTextAdd.checked = false;
        const nfTextAddEl = document.getElementById('noteFolderTextColor');
        if (nfTextAddEl) nfTextAddEl.disabled = false;
        this.showModal('noteFolderModal');
    }

    showEditNoteFolderModal(id) {
        const f = this.noteFolders.find(x => x.id === id);
        if (!f) return;
        document.getElementById('noteFolderModalTitle').textContent = this.t('editNoteFolderModal');
        document.getElementById('noteFolderId').value = f.id;
        document.getElementById('noteFolderName').value = f.name;
        document.getElementById('noteFolderColor').value = f.color;
        document.getElementById('noteFolderTextColor').value = f.textColor || '#ffffff';
        document.getElementById('noteFolderOpacity').value = f.opacity || 100;
        const nfAutoTextEdit = document.getElementById('noteFolderAutoText');
        if (nfAutoTextEdit) nfAutoTextEdit.checked = f.autoText === true;
        const nfTextEditEl = document.getElementById('noteFolderTextColor');
        if (nfTextEditEl) nfTextEditEl.disabled = f.autoText === true;
        /* v6.8.0: пароль не показываем; пустое = оставить текущий */
        const _npwdEl = document.getElementById('noteFolderPassword');
        _npwdEl.value = '';
        _npwdEl.placeholder = f.password ? this.t('keepCurrentPwd') : '';
        this.showModal('noteFolderModal');
    }

    async saveNoteFolderFromForm(e) {
        e.preventDefault();
        const submitBtn = e.target.querySelector('button[type="submit"]');
        if (submitBtn) flashButtonFeedback(submitBtn);

        const pwd = document.getElementById('noteFolderPassword').value;
        const now = Date.now();
        const existingId = document.getElementById('noteFolderId').value;
        const existing = existingId ? this.noteFolders.find(x => x.id === existingId) : null;

        /* v6.8.0: только хэш; пустое поле при редактировании = не менять */
        let pwdRecord = existing ? (existing.password || '') : '';
        if (pwd) pwdRecord = await hashFolderPassword(pwd);

        const f = {
            id: existingId || `nf_${now}`,
            name: document.getElementById('noteFolderName').value,
            color: document.getElementById('noteFolderColor').value,
            textColor: (document.getElementById('noteFolderAutoText')?.checked)
                ? this._pickContrastColor(document.getElementById('noteFolderColor').value)
                : document.getElementById('noteFolderTextColor').value,
            autoText: document.getElementById('noteFolderAutoText')?.checked ?? false,
            opacity: parseInt(document.getElementById('noteFolderOpacity').value) || 100,
            password: pwdRecord,
            parentId: '',
            createdAt: existing?.createdAt || now,
            updatedAt: now
        };
        const idx = this.noteFolders.findIndex(x => x.id === f.id);
        if (idx !== -1) this.noteFolders[idx] = f;
        else this.noteFolders.push(f);

        if (pwdRecord) this.folderPasswords[`note_${f.id}`] = pwdRecord;
        else delete this.folderPasswords[`note_${f.id}`];

        await this.saveData();
        if (submitBtn) flashButtonFeedback(submitBtn, 'success');
        this.hideModal('noteFolderModal');
        this.renderNotesFoldersBar();
        this.renderNotes();
    }

    async deleteNoteFolder(id) {
        if (!await DialogService.confirm(this.t('deleteNoteFolderConfirm'))) return;
        this._addTombstone(id);
        this.noteFolders = this.noteFolders.filter(f => f.id !== id);
        const now = Date.now();
        this.notes.forEach(n => { if (n.folderId === id) { n.folderId = ''; n.updatedAt = now; } });
        delete this.folderPasswords[`note_${id}`];
        this.unlockedFolders.delete(`note_${id}`);
        if (this.currentNoteFolder === id) this.currentNoteFolder = 'all';
        await this.saveData();
        this.renderNotesFoldersBar();
        this.renderNotes();
        this.scheduleSaveUiState();
    }

    searchWebWithQuickCommand() {
        const input = document.getElementById('webSearchInput');
        if (!input) return;
        const raw = input.value.trim();
        if (!raw) return;

        const commands = {
            '!g': 'google', '!y': 'яндекс', '!yt': 'youtube',
            '!gh': 'github', '!w': 'wikipedia'
        };
        const first = raw.split(/\s+/)[0].toLowerCase();

        if (commands[first]) {
            const query = raw.slice(first.length).trim();
            const engines = this.settings.searchEngines || [];
            const engineName = commands[first];
            const found = engines.find(e => e.name.toLowerCase() === engineName.toLowerCase());
            const engine = found || engines[0];
            if (engine) window.location.href = engine.url + encodeURIComponent(query || first);
            return;
        }

        const engines = this.settings.searchEngines || [];
        if (engines[0]) window.location.href = engines[0].url + encodeURIComponent(raw);
    }

    searchWeb(engineName) {
        const i = document.getElementById('webSearchInput');
        if (!i?.value) return;
        const q = encodeURIComponent(i.value.trim());
        const engines = this.settings.searchEngines || [];
        const found = engines.find(e => e.name.toLowerCase() === engineName.toLowerCase()) || engines[0];
        if (found) window.location.href = found.url + q;
    }

    async loadHistory(q) {
        const list = document.getElementById('historyList');
        if (!list) return;
        list.textContent = this.t('loading');

        try {
            const r = await api.runtime.sendMessage({ action: 'getHistory', query: q });
            list.innerHTML = '';

            if (r?.success && r.history?.length) {
                r.history.forEach(h => {
                    const d = document.createElement('div');
                    d.className = 'history-item';
                    const strong = document.createElement('strong');
                    strong.textContent = h.title;
                    d.appendChild(strong);
                    d.appendChild(document.createElement('br'));
                    const small = document.createElement('small');
                    small.textContent = h.url;
                    d.appendChild(small);
                    d.onclick = () => {
                        document.getElementById('tileUrl').value = h.url;
                        const t = document.getElementById('tileTitle');
                        if (t && !t.value) t.value = h.title;
                        this.hideModal('historyModal');
                        this._applyAutoColorPreview();
                    };
                    list.appendChild(d);
                });
            } else {
                list.textContent = this.t('historyNotFound');
            }
        } catch (e) {
            list.textContent = this.t('historyError');
        }
    }

    searchHistory(q) {
        clearTimeout(this._historyTimer);
        this._historyTimer = setTimeout(() => this.loadHistory(q), 200);
    }

    /* ============================================================
       v6.6.6: toggleCurrencyWidget помечает настройки как изменённые.
       ============================================================ */

    toggleCurrencyWidget() {
        this.settings.currencyWidget = !this.settings.currencyWidget;
        this._touchSettings();
        api.storage.sync.set({ currencyWidget: this.settings.currencyWidget });
        this.renderHeaderActions();
        this.setupCurrencyWidget();
    }

    async setupCurrencyWidget() {
        if (this.currencyTimer) {
            clearInterval(this.currencyTimer);
            this.currencyTimer = null;
        }
        if (!this.settings.currencyWidget) {
            const w = document.getElementById('currencyWidget');
            if (w) w.remove();
            return;
        }
        await this.updateCurrencyDisplay();
        this.currencyTimer = setInterval(() => this.updateCurrencyDisplay(), 12 * 60 * 60 * 1000);
    }

    /* v6.8.3: значок синхронизации курсов — виден и вращается только во время загрузки */
    _makeCurrencySpinner() {
        const spin = document.createElement('span');
        spin.className = 'currency-sync-icon';
        spin.textContent = '🔄';
        spin.title = this.t('sync');
        return spin;
    }

    async updateCurrencyDisplay() {
        const widget = document.getElementById('currencyWidget');
        if (!widget) return;
        widget.replaceChildren(this._makeCurrencySpinner());

        try {
            const pairs = this.settings.currencyPairs || ['USD/RUB', 'EUR/RUB'];
            const snapshot = await getCurrencySnapshot(pairs, false);

            if (snapshot.offline) {
                widget.textContent = this.t('currencyOffline');
                return;
            }

            const history = (typeof loadRateHistory === 'function')
                ? await loadRateHistory()
                : [];
            const now = Date.now();
            const MIN_AGE = 20 * 60 * 60 * 1000;
            const MAX_AGE = 36 * 60 * 60 * 1000;
            const TARGET = 24 * 60 * 60 * 1000;

            /* v6.8.3: статичный символ перед курсами убран — только сами курсы */
            widget.replaceChildren();

            pairs.forEach(pair => {
                const parts = pair.split('/');
                const target = parts[1] || '';

                const rate = snapshot.rates?.[pair];

                let past = null;
                let bestDist = Infinity;
                for (const h of history) {
                    const age = now - h.ts;
                    if (age < MIN_AGE || age > MAX_AGE) continue;
                    if (!h.rates || h.rates[pair] == null) continue;
                    const dist = Math.abs(age - TARGET);
                    if (dist < bestDist) { bestDist = dist; past = h.rates[pair]; }
                }
                const delta = (past != null && rate != null) ? rate - past : null;

                const block = document.createElement('span');
                block.className = 'currency-pair';

                const label = document.createElement('span');
                label.className = 'currency-label';
                label.textContent = `${pair}: `;
                block.appendChild(label);

                const value = document.createElement('span');
                value.className = 'currency-value';
                value.textContent = formatRateWithSymbol(rate, target);
                block.appendChild(value);

                if (delta != null && Math.abs(delta) > 1e-6) {
                    const cls = delta > 0 ? 'rate-up' : 'rate-down';
                    value.classList.add(cls);

                    const changeSpan = document.createElement('span');
                    changeSpan.className = 'currency-delta ' + cls;
                    changeSpan.textContent = ` (${formatDelta(delta)})`;
                    block.appendChild(changeSpan);
                }

                widget.appendChild(block);
            });
        } catch (e) {
            logError('newtab.updateCurrencyDisplay', e.message);
            widget.textContent = '—';
        }
    }

    async setupAutoLock() {
        const timeout = parseInt(this.settings.autoLockTimeout) || 0;
        if (timeout > 0) {
            try {
                await api.runtime.sendMessage({ action: 'setAutoLock', timeout });
            } catch (e) {}
        }
    }

    async lockNow() {
        const data = await api.storage.local.get(['masterPasswordHash', 'masterPasswordRecord']);
        const hasPassword = !!(data.masterPasswordRecord || data.masterPasswordHash);
        if (!hasPassword) {
            this.toast(this.t('noPassword'));
            return;
        }
        await this._setSessionLocked(true);
        this.showLockScreen();
    }

    async syncWithServer(btn = null) {
        btn = btn || document.getElementById('syncButton');
        if (btn) { flashButtonFeedback(btn); setButtonLoading(btn, true); }

        this._selfInitiatedUntil = Date.now() + 10000;
        this.showLoading();

        if (!this.settings.encryptionKey) {
            this.toast(this.t('plaintextWarning'));
        } else {
            this.toast(this.t('toastSyncing'));
        }

        try {
            const r = await api.runtime.sendMessage({ action: 'syncNow', syncType: 'merge' });

            if (r && r.needsResolve) {
                if (btn) flashButtonFeedback(btn, 'success');
                this.hideLoading();
                await this._handleFirstSyncConflict(btn, r.conflicts);
                return;
            }

            if (r?.success) {
                const savedHeaderHidden = this.settings.headerHidden;
                const savedSidebarCollapsed = this.settings.sidebarCollapsed;
                await this.loadData();
                this.settings.headerHidden = savedHeaderHidden;
                this.settings.sidebarCollapsed = savedSidebarCollapsed;
                this.unlockedFolders.clear();
                await this.renderAll();
                this.applySidebarState();
                this.applyHeaderState();
                await this.saveData();

                if (btn) flashButtonFeedback(btn, 'success');

                const d = r.data || {};
                const counts = [
                    d.tiles?.length ? this.tf('cntTiles', { n: d.tiles.length }) : '',
                    d.folders?.length ? this.tf('cntFolders', { n: d.folders.length }) : '',
                    d.notes?.length ? this.tf('cntNotes', { n: d.notes.length }) : ''
                ].filter(Boolean).join(' · ');

                this.toast(`✅ ${this.t('stMerged')}${counts ? ': ' + counts : ''}`);
            } else if (r?.retryIn) {
                if (btn) flashButtonFeedback(btn, 'error');
                this.toast('⏳ ' + this.tf('popupWait', { n: r.retryIn + ' ' + this.t('secShort') }));
                this._selfInitiatedUntil = 0;
            } else {
                if (btn) flashButtonFeedback(btn, 'error');
                this._selfInitiatedUntil = 0;
                throw new Error(r?.error || this.t('stSyncErrTitle'));
            }
        } catch (e) {
            logError('newtab.syncWithServer', e.message);
            if (btn) flashButtonFeedback(btn, 'error');
            this.toast('❌ ' + this.t('syncError') + e.message);
            this._selfInitiatedUntil = 0;
        } finally {
            this.hideLoading();
            if (btn) setButtonLoading(btn, false);
        }
    }

    async _handleFirstSyncConflict(btn, conflicts) {
        const c = conflicts || {};
        const onlyLocal = c.onlyLocal || {};
        const onlyServer = c.onlyServer || {};

        const formatBreakdown = (o) => {
            const parts = [];
            if (o.tiles) parts.push(this.tf('cntBookmarks', { n: o.tiles }));
            if (o.folders) parts.push(this.tf('cntFolders', { n: o.folders }));
            if (o.notes) parts.push(this.tf('cntNotes', { n: o.notes }));
            if (o.noteFolders) parts.push(this.tf('cntNoteFolders', { n: o.noteFolders }));
            return parts.length ? parts.join(', ') : '—';
        };

        const msg =
            this.t('conflictIntro') +
            this.tf('conflictOnlyLocal', { list: formatBreakdown(onlyLocal) }) +
            this.tf('conflictOnlyServer', { list: formatBreakdown(onlyServer) }) +
            this.t('conflictChoose') +
            this.t('conflictOptLocal') +
            this.t('conflictOptServer') +
            this.t('conflictOptMerge');

        const choice = await DialogService.choice(msg, [
            { label: this.t('cancel'), value: null, variant: 'secondary' },
            { label: this.t('btnMyLocal'), value: 'local', variant: 'secondary' },
            { label: this.t('btnServerSide'), value: 'server', variant: 'secondary' },
            { label: this.t('btnMerge'), value: 'merge', variant: 'primary' }
        ]);

        if (!choice) {
            this.toast(this.t('syncCancelled'));
            return;
        }

        this.showLoading();
        if (btn) setButtonLoading(btn, true);

        try {
            const r = await api.runtime.sendMessage({
                action: 'resolveSyncConflict',
                strategy: choice
            });

            if (r?.success) {
                await this.loadData();
                this.unlockedFolders.clear();
                await this.renderAll();
                await this.saveData();

                if (btn) flashButtonFeedback(btn, 'success');

                const labelMap = {
                    local: this.t('lblLocal'),
                    server: this.t('lblServer'),
                    merge: this.t('lblMerged')
                };
                const d = r.data || {};
                const counts = [
                    d.tiles?.length ? this.tf('cntTiles', { n: d.tiles.length }) : '',
                    d.folders?.length ? this.tf('cntFolders', { n: d.folders.length }) : '',
                    d.notes?.length ? this.tf('cntNotes', { n: d.notes.length }) : ''
                ].filter(Boolean).join(' · ');

                this.toast(`✅ ${labelMap[choice]}${counts ? ': ' + counts : ''}`);
            } else {
                if (btn) flashButtonFeedback(btn, 'error');
                this.toast('❌ ' + (r?.error || this.t('errGeneric')));
            }
        } catch (e) {
            if (btn) flashButtonFeedback(btn, 'error');
            this.toast('❌ ' + e.message);
        } finally {
            this.hideLoading();
            if (btn) setButtonLoading(btn, false);
        }
    }

    isDndActive() {
        const dnd = this.settings.doNotDisturb;
        if (!dnd?.enabled) return false;
        const now = new Date();
        const cur = now.getHours() * 60 + now.getMinutes();
        const [sh, sm] = (dnd.start || '22:00').split(':').map(Number);
        const [eh, em] = (dnd.end || '08:00').split(':').map(Number);
        const start = sh * 60 + sm;
        const end = eh * 60 + em;
        if (start < end) return cur >= start && cur < end;
        return cur >= start || cur < end;
    }

    /* ============================================================
       v6.6.6: openBackgroundGallery помечает настройки при смене фона.
       ============================================================ */

    openBackgroundGallery() {
        const modal = document.createElement('div');
        modal.className = 'modal active';

        const content = document.createElement('div');
        content.className = 'modal-content';

        const h = document.createElement('h3');
        h.textContent = this.t('bgGallery');
        content.appendChild(h);

        const gallery = document.createElement('div');
        gallery.className = 'bg-gallery';

        const list = this.settings.backgrounds || [];
        const activeId = this.settings.activeBackgroundId;

        if (!list.length) {
            const p = document.createElement('p');
            p.textContent = this.t('noBackgroundsHint');
            p.style.opacity = '.6';
            gallery.appendChild(p);
        } else {
            list.forEach(bg => {
                const el = document.createElement('div');
                el.className = 'bg-item' + (bg.id === activeId ? ' active' : '');
                el.title = bg.name || '';

                if (bg.type === 'color' || bg.type === 'gradient') {
                    el.style.background = bg.value || '#333';
                } else if (bg.type === 'image-file' && bg.ref) {
                    el.style.background = 'linear-gradient(135deg, #333, #555)';
                    loadBackgroundBlob(bg.ref).then(rec => {
                        if (rec?.dataUrl) {
                            el.style.backgroundImage = `url("${rec.dataUrl}")`;
                            el.style.backgroundSize = 'cover';
                            el.style.backgroundPosition = 'center';
                            el.style.backgroundRepeat = 'no-repeat';
                        }
                    }).catch(() => {});
                } else if (bg.value) {
                    el.style.backgroundImage = `url("${bg.value}")`;
                    el.style.backgroundSize = 'cover';
                    el.style.backgroundPosition = 'center';
                    el.style.backgroundRepeat = 'no-repeat';
                } else {
                    el.style.background = 'linear-gradient(135deg, #333, #555)';
                }

                el.onclick = async () => {
                    this.settings.activeBackgroundId = bg.id;
                    this._touchSettings();
                    try {
                        await api.storage.sync.set({ activeBackgroundId: bg.id });
                    } catch (e) {
                        logWarn('newtab.openBackgroundGallery', this.t('bgIdSaveErr'), e.message);
                        await this.applyBackgrounds();
                    }
                    modal.remove();
                };

                gallery.appendChild(el);
            });
        }

        content.appendChild(gallery);

        const actions = document.createElement('div');
        actions.className = 'form-actions';

        const closeBtn = document.createElement('button');
        closeBtn.type = 'button';
        closeBtn.textContent = this.t('close');
        closeBtn.onclick = () => {
            flashButtonFeedback(closeBtn);
            modal.remove();
        };
        actions.appendChild(closeBtn);

        content.appendChild(actions);
        modal.appendChild(content);

        modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
        document.body.appendChild(modal);
    }

    showLoading() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) overlay.style.display = 'flex';
    }

    hideLoading() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) overlay.style.display = 'none';
    }

    toast(msg) {
        const el = document.getElementById('toast');
        if (!el) return;
        el.textContent = msg;
        el.style.display = 'block';
        clearTimeout(this._toastTimer);
        this._toastTimer = setTimeout(() => { el.style.display = 'none'; }, 3000);
    }

    applyTranslations() {
        /* v6.9.0: статическая разметка через data-i18n атрибуты */
        applyI18n(this.currentLanguage);

        const placeholders = {
            searchInput: 'searchBookmarks',
            webSearchInput: 'searchWeb'
        };
        Object.entries(placeholders).forEach(([id, key]) => {
            const el = document.getElementById(id);
            if (el) el.placeholder = this.t(key);
        });

        const titles = {
            addTileButton: 'addTile', themeButton: 'theme', syncButton: 'sync',
            settingsButton: 'settings', pinHeaderButton: 'pinHeader',
            showHeaderButton: 'pinHeader', collapseSidebar: 'collapseSidebar',
            expandSidebar: 'expandSidebar', addNote: 'addNote'
        };
        Object.entries(titles).forEach(([id, key]) => {
            const el = document.getElementById(id);
            if (el) el.title = this.t(key);
        });

        const nh = document.querySelector('.notes-header h3');
        if (nh) nh.textContent = this.t('notes');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    try {
        const sd = new SpeedDial();
        window._speedDial = sd;
        sd.init();
    } catch (e) {
        console.error('Failed to start SpeedDial:', e);
        if (window.logError) logError('newtab.bootstrap', e.message, { stack: e.stack });
    }
});