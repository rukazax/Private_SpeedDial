'use strict';

const api = chrome;

/* ============================================================
   SettingsPage — управление настройками.

   v6.6.6:
   - applySettings проставляет settingsUpdatedAt = Date.now()
     перед сохранением в storage.sync. Это активирует LWW
     при следующем merge — серверные настройки не будут
     перебивать пользовательские.
   - Остальное — как в v6.6.0.
   ============================================================ */

const SECRET_KEYS = new Set([
    'password', 'passwd', 'token', 'secret', 'apikey', 'api_key',
    'encryptionkey', 'webdavpassword', 'mailrupassword',
    'dropboxaccesstoken', 'boxaccesstoken', 'onedriveaccesstoken',
    'pcloudaccesstoken', 'yandextoken', 'masterpassword'
]);

const SECRET_SUBSTRINGS = ['password', 'passwd', 'token', 'secret', 'apikey', 'api_key', 'encryptionkey'];

const FVD_MAX_FILE_SIZE = 20 * 1024 * 1024;

class SettingsPage {
    constructor() {
        this.settings = {};
        this.backgrounds = [];
        this.panelBackgrounds = [];
        this.currencyPairs = ['USD/RUB', 'EUR/RUB'];
        this.profiles = {};
        this.activeProfile = 'default';
        this.headerOrder = [];
        this.headerVisibility = {};
        this.searchEngines = [];
        this._syncSummaryThrottle = 0;
        this._statusTimer = null;
        this._bgEditContext = null;
    }

    async init() {
        try {
            await logInit('info');
            logInfo('options.init', 'Инициализация страницы настроек');

            attachButtonFeedback(document);
            this._showVersion();

            await this.loadSettings();
            this.applyLanguage();
            this.setupEvents();
            this.setupPasswordToggles();
            this.toggleSyncSettings();
            this.applyTheme();
            this.applyDesignSettings();
            this.renderSearchEngines();
            this.renderHeaderItems();
            this.renderBackgrounds();
            this.renderPanelBackgrounds();
            this.renderCurrencyPairs();
            await this.loadProfiles();
            this.loadDNDSettings();
            await this.checkNotificationPermission();
            await this.updateSyncSummary(true);
            this._updatePlaintextWarning();

            logInfo('options.init', 'Инициализация завершена');
        } catch (e) {
            logError('options.init', e.message, { stack: e.stack });
            console.error('Settings init:', e);
        }
    }

    _showVersion() {
        try {
            const v = api.runtime.getManifest?.()?.version || '';
            const el = document.getElementById('appVersion');
            if (el && v) el.textContent = 'v' + v;
        } catch (e) {}
    }

    /* v6.9.0: применение языка интерфейса */
    applyLanguage() {
        this.currentLanguage = resolveUILanguage(this.settings && this.settings.forcedLanguage);
        applyI18n(this.currentLanguage);
        document.title = translateKey(this.currentLanguage, 'settingsTitle');
        /* v6.9.2: динамические списки тоже перерисовываем на новом языке */
        try {
            this.renderSearchEngines();
            this.renderHeaderItems();
            this.renderBackgrounds();
            this.renderPanelBackgrounds();
            this.renderCurrencyPairs();
            this.renderProfiles();
        } catch (_) { /* списки могут быть ещё не инициализированы */ }
    }

    t(key) {
        return translateKey(this.currentLanguage, key);
    }

    /* v6.9.2: форматированный перевод с плейсхолдерами */
    tf(key, vars) {
        return tf(this.currentLanguage, key, vars);
    }

    _updatePlaintextWarning() {
        const el = document.getElementById('plaintextWarning');
        const keyEl = document.getElementById('encryptionKey');
        if (!el || !keyEl) return;
        const isEmpty = !keyEl.value || !keyEl.value.trim();
        el.style.display = isEmpty ? 'block' : 'none';
    }

    /* ==================== Загрузка настроек ==================== */

    async loadSettings() {
        try {
            const s = await api.storage.sync.get(DEFAULT_SETTINGS);
            this.settings = s;
            // Normalize folderBarPosition to supported values
            if (s.folderBarPosition === 'left' || s.folderBarPosition === 'right') {
                this.settings.folderBarPosition = 'top';
            }
            this.backgrounds = Array.isArray(s.backgrounds) ? s.backgrounds : [];
            this.panelBackgrounds = Array.isArray(s.panelBackgrounds) ? s.panelBackgrounds : [];
            this.currencyPairs = Array.isArray(s.currencyPairs) ? s.currencyPairs : ['USD/RUB', 'EUR/RUB'];
            this.headerOrder = Array.isArray(s.headerOrder) ? s.headerOrder : DEFAULT_SETTINGS.headerOrder.slice();
            this.headerVisibility = s.headerVisibility || {};
            this.searchEngines = Array.isArray(s.searchEngines) ? s.searchEngines : DEFAULT_SETTINGS.searchEngines.slice();
        } catch (e) {
            logWarn('options.loadSettings', 'Fallback на defaults', { error: e.message });
            this.settings = { ...DEFAULT_SETTINGS };
            this.backgrounds = [];
            this.panelBackgrounds = [];
            this.currencyPairs = ['USD/RUB', 'EUR/RUB'];
            this.headerOrder = DEFAULT_SETTINGS.headerOrder.slice();
            this.headerVisibility = {};
            this.searchEngines = DEFAULT_SETTINGS.searchEngines.slice();
        }

        const simpleFields = [
            'syncService', 'syncService2', 'forcedLanguage',
            'accentColor', 'tileBgDefault', 'tileTextDefault',
            'fontFamily', 'fontSize', 'faviconSource',
            'webdavUrl', 'webdavUsername', 'webdavPassword',
            'nextcloudUrl', 'nextcloudUsername', 'nextcloudPassword',
            'dropboxAccessToken', 'dropboxFolder',
            'boxAccessToken', 'boxFileId',
            'onedriveAccessToken', 'onedriveFolder',
            'pcloudAccessToken', 'pcloudFolder',
            'yandexToken', 'yandexFolder',
            'mailruEmail', 'mailruPassword', 'mailruFolder',
            'encryptionKey',
            'tileSortMode', 'noteSortMode',
            'folderSortMode', 'noteFolderSortMode',
            'folderBarPosition'
        ];
        for (const key of simpleFields) {
            const el = document.getElementById(key);
            if (el && this.settings[key] !== undefined) el.value = this.settings[key] || '';
        }

        const themeEl = document.getElementById('theme');
        if (themeEl) themeEl.value = this.settings.theme || 'auto';

        this.setValue('tileSize', this.settings.tileSize ?? 150);
        this.setValue('tileSizeQuick', this.settings.tileSize ?? 150);
        this.setValue('tileGap', this.settings.tileGap ?? '');
        this.setValue('themeOpacity', this.settings.themeOpacity ?? 100);
        this.setValue('headerOpacity', this.settings.headerOpacity ?? 55);
        this.setValue('sidebarOpacity', this.settings.sidebarOpacity ?? 55);
        this.setValue('modalOpacity', this.settings.modalOpacity ?? 75);
        this.setValue('syncInterval', this.settings.syncInterval || 60);
        this.setValue('autoLockTimeout', this.settings.autoLockTimeout || 0);
        this.setValue('bgRotateInterval', this.settings.bgRotateInterval || 30);
        this.setValue('tileSizeSliderPosition', this.settings.tileSizeSliderPosition || 'left');
        this.setValue('bgRotateMode', this.settings.bgRotateMode || 'sequential');
        this.setValue('folderMaxDepth', this.settings.folderMaxDepth || 5);
        this.setValue('folderDefaultColor', this.settings.folderDefaultColor || '#667eea');
        this.setValue('noteFolderDefaultColor', this.settings.noteFolderDefaultColor || '#667eea');

        this.setChecked('autoSync', this.settings.autoSync !== false);
        this.setChecked('showTileSizeSlider', this.settings.showTileSizeSlider !== false);
        this.setChecked('currencyWidget', !!this.settings.currencyWidget);
        this.setChecked('hideCurrencyIcon', this.settings.hideCurrencyIcon === true);
        this.setChecked('bgRotateEnabled', !!this.settings.bgRotateEnabled);
        this.setChecked('dndEnabled', !!(this.settings.doNotDisturb && this.settings.doNotDisturb.enabled));
        this.setChecked('notificationsEnabled', !!this.settings.notificationsEnabled);
        this.setChecked('tileSortFoldersFirst', this.settings.tileSortFoldersFirst === true);
        this.setChecked('noteSortFoldersFirst', this.settings.noteSortFoldersFirst === true);
        this.setChecked('folderShowEmpty', this.settings.folderShowEmpty !== false);

        if (this.settings.doNotDisturb) {
            this.setValue('dndStart', this.settings.doNotDisturb.start || '22:00');
            this.setValue('dndEnd', this.settings.doNotDisturb.end || '08:00');
        }

        this.setActiveMode(this.settings.syncMode || 'merge');
        this.updateSliderDisplays();
        this._updatePlaintextWarning();
    }

    setValue(id, value) { const el = document.getElementById(id); if (el) el.value = value; }
    setChecked(id, checked) { const el = document.getElementById(id); if (el) el.checked = !!checked; }

    updateSliderDisplays() {
        const pairs = [
            ['tileSize', ''], ['tileSizeQuick', ''], ['themeOpacity', '%'],
            ['headerOpacity', '%'], ['sidebarOpacity', '%'], ['modalOpacity', '%']
        ];
        for (const [id, suffix] of pairs) {
            const el = document.getElementById(id);
            const span = document.getElementById(id + 'Value');
            if (el && span) span.textContent = el.value + suffix;
        }
    }

    setActiveMode(mode) {
        document.querySelectorAll('.sync-mode-btn').forEach(b => {
            b.classList.toggle('active', b.dataset.mode === mode);
        });
        const i = document.getElementById('syncMode');
        if (i) i.value = mode;
    }

    applyTheme() {
        let t = this.settings?.theme || 'auto';
        if (t === 'auto') {
            if (!window.matchMedia) t = 'dark';
            else {
                const d = window.matchMedia('(prefers-color-scheme: dark)').matches;
                const l = window.matchMedia('(prefers-color-scheme: light)').matches;
                t = d || !l ? 'dark' : 'light';
            }
        }
        document.body.dataset.theme = t;
    }

    applyDesignSettings() {
        const root = document.documentElement.style;
        root.setProperty('--accent', this.settings.accentColor || '#667eea');

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
    }

    _flashButton(btn, result = null) { flashButtonFeedback(btn, result); }
    _setButtonLoading(btn, loading) { setButtonLoading(btn, loading); }

    async _withButtonFeedback(e, fn) {
        const btn = e?.currentTarget || e?.target?.closest('button');
        if (btn) { flashButtonFeedback(btn); setButtonLoading(btn, true); }
        try {
            const r = await fn();
            if (btn) flashButtonFeedback(btn, r === false ? 'error' : 'success');
        } catch (err) {
            logError('options._withButtonFeedback', err.message);
            if (btn) flashButtonFeedback(btn, 'error');
            this.showStatus(this.t('errPrefix') + err.message, 'error');
        } finally {
            if (btn) setButtonLoading(btn, false);
        }
    }

    /* ==================== Поисковые движки ==================== */

    renderSearchEngines() {
        const tbody = document.getElementById('searchEnginesBody');
        if (!tbody) return;
        tbody.innerHTML = '';

        this.searchEngines.forEach((engine, idx) => {
            const tr = document.createElement('tr');

            const fields = [
                ['engine-name', 'text', engine.name || '', ''],
                ['engine-url', 'url', engine.url || '', ''],
                ['engine-button-text', 'text', engine.buttonText || '', '60px'],
                ['engine-button-color', 'color', engine.buttonColor || '#667eea', ''],
                ['engine-button-text-color', 'color', engine.buttonTextColor || '#ffffff', '']
            ];

            for (const [cls, type, val, maxW] of fields) {
                const td = document.createElement('td');
                const input = document.createElement('input');
                input.type = type;
                input.className = cls;
                input.value = val;
                if (maxW) input.style.maxWidth = maxW;
                td.appendChild(input);
                tr.appendChild(td);
            }

            const tdActions = document.createElement('td');
            const actions = document.createElement('div');
            actions.className = 'row-actions';

            const saveBtn = document.createElement('button');
            saveBtn.type = 'button';
            saveBtn.className = 'row-btn';
            saveBtn.title = this.t('stApply');
            saveBtn.textContent = '💾';
            saveBtn.onclick = () => this.updateSearchEngine(idx, tr, saveBtn);
            actions.appendChild(saveBtn);

            const delBtn = document.createElement('button');
            delBtn.type = 'button';
            delBtn.className = 'row-btn danger';
            delBtn.title = this.t('delete');
            delBtn.textContent = '✕';
            delBtn.onclick = () => this.deleteSearchEngine(idx, delBtn);
            actions.appendChild(delBtn);

            tdActions.appendChild(actions);
            tr.appendChild(tdActions);
            tbody.appendChild(tr);
        });
    }

    async updateSearchEngine(idx, tr, btn) {
        const engine = {
            name: tr.querySelector('.engine-name').value.trim(),
            url: tr.querySelector('.engine-url').value.trim(),
            buttonText: tr.querySelector('.engine-button-text').value.trim(),
            buttonColor: tr.querySelector('.engine-button-color').value,
            buttonTextColor: tr.querySelector('.engine-button-text-color').value
        };
        if (!engine.name || !engine.url) {
            flashButtonFeedback(btn, 'error');
            this.showStatus(this.t('fillNameUrl'), 'error');
            return;
        }
        this.searchEngines[idx] = engine;
        await this.persistSearchEngines();
        flashButtonFeedback(btn, 'success');
        this.showStatus(this.t('engineUpdated'), 'success');
    }

    async deleteSearchEngine(idx, btn) {
        if (!await DialogService.confirm(this.t('confirmDelEngine'))) return;
        this.searchEngines.splice(idx, 1);
        await this.persistSearchEngines();
        if (btn) flashButtonFeedback(btn, 'success');
        this.renderSearchEngines();
    }

    async persistSearchEngines() {
        try {
            await api.storage.sync.set({
                searchEngines: this.searchEngines,
                settingsUpdatedAt: Date.now()
            });
            this.settings.searchEngines = this.searchEngines;
        } catch (e) {
            logError('options.persistSearchEngines', e.message);
        }
    }

    async addSearchEngine(e) {
        const btn = e?.currentTarget;
        this.searchEngines.push({
            name: 'New',
            url: 'https://example.com/search?q=',
            buttonText: 'N',
            buttonColor: '#667eea',
            buttonTextColor: '#ffffff'
        });
        await this.persistSearchEngines();
        if (btn) flashButtonFeedback(btn, 'success');
        this.renderSearchEngines();
    }

    /* ==================== Верхняя панель ==================== */

    renderHeaderItems() {
        const tbody = document.getElementById('headerItemsBody');
        if (!tbody) return;
        tbody.innerHTML = '';

        const actionMap = {
            addTile:   { title: this.t('addTile') },
            theme:     { title: this.t('theme') },
            sync:      { title: this.t('sync') },
            settings:  { title: this.t('settings') },
            pinHeader: { title: this.t('pinHeader') },
            bgGallery: { title: this.t('bgGallery') },
            lock:      { title: this.t('lock') },
            profile:   { title: this.t('profile') },
            currency:  { title: this.t('currency') }
        };

        if (!this.headerOrder.includes('settings')) {
            this.headerOrder.unshift('settings');
        }

        this.headerOrder.forEach((id, idx) => {
            const item = actionMap[id];
            if (!item) return;
            const visible = this.headerVisibility[id] !== false;

            const tr = document.createElement('tr');

            const tdIcon = document.createElement('td');
            const iconWrap = document.createElement('div');
            iconWrap.className = 'header-icon-cell';
            iconWrap.appendChild(createHeaderIconSvg(id));
            tdIcon.appendChild(iconWrap);
            tr.appendChild(tdIcon);

            const tdTitle = document.createElement('td');
            tdTitle.textContent = item.title;
            if (!visible) {
                const small = document.createElement('small');
                small.style.opacity = '.5';
                small.textContent = this.t('hiddenSuffix');
                tdTitle.appendChild(small);
            }
            tr.appendChild(tdTitle);

            const tdActions = document.createElement('td');
            const actions = document.createElement('div');
            actions.className = 'row-actions';

            if (idx > 0) {
                const upBtn = document.createElement('button');
                upBtn.type = 'button';
                upBtn.className = 'row-btn';
                upBtn.title = this.t('stUp');
                upBtn.textContent = '⬆️';
                upBtn.onclick = () => this.onHeaderItemAction('up', idx, upBtn);
                actions.appendChild(upBtn);
            }

            if (idx < this.headerOrder.length - 1) {
                const downBtn = document.createElement('button');
                downBtn.type = 'button';
                downBtn.className = 'row-btn';
                downBtn.title = this.t('stDown');
                downBtn.textContent = '⬇️';
                downBtn.onclick = () => this.onHeaderItemAction('down', idx, downBtn);
                actions.appendChild(downBtn);
            }

            if (id !== 'settings') {
                const hideBtn = document.createElement('button');
                hideBtn.type = 'button';
                hideBtn.className = 'row-btn danger';
                hideBtn.title = this.t('stHide');
                hideBtn.textContent = '✕';
                hideBtn.onclick = () => this.onHeaderItemAction('hide', idx, hideBtn);
                actions.appendChild(hideBtn);
            }

            tdActions.appendChild(actions);
            tr.appendChild(tdActions);
            tbody.appendChild(tr);
        });

        const select = document.getElementById('availableHeaderItems');
        if (select) {
            select.innerHTML = '';
            const visibleIds = new Set(this.headerOrder.filter(id => this.headerVisibility[id] !== false));
            Object.keys(actionMap).forEach(id => {
                if (id !== 'settings' && !visibleIds.has(id)) {
                    const opt = document.createElement('option');
                    opt.value = id;
                    opt.textContent = actionMap[id].title;
                    select.appendChild(opt);
                }
            });
            if (!select.options.length) {
                const opt = document.createElement('option');
                opt.value = '';
                opt.textContent = this.t('noneAvailable');
                opt.disabled = true;
                select.appendChild(opt);
            }
        }
    }

    async onHeaderItemAction(action, idx, btn) {
        try {
            switch (action) {
                case 'up':
                    if (idx > 0) {
                        [this.headerOrder[idx - 1], this.headerOrder[idx]] =
                            [this.headerOrder[idx], this.headerOrder[idx - 1]];
                    }
                    break;
                case 'down':
                    if (idx < this.headerOrder.length - 1) {
                        [this.headerOrder[idx + 1], this.headerOrder[idx]] =
                            [this.headerOrder[idx], this.headerOrder[idx + 1]];
                    }
                    break;
                case 'hide':
                    this.headerVisibility[this.headerOrder[idx]] = false;
                    this.headerOrder.splice(idx, 1);
                    break;
            }
            await this.persistHeader();
            if (btn) flashButtonFeedback(btn, 'success');
            this.renderHeaderItems();
        } catch (e) {
            if (btn) flashButtonFeedback(btn, 'error');
            logError('options.onHeaderItemAction', e.message, { action, idx });
        }
    }

    async addHeaderItem(e) {
        const btn = e?.currentTarget;
        const select = document.getElementById('availableHeaderItems');
        if (!select) return;
        const id = select.value;
        if (!id) {
            if (btn) flashButtonFeedback(btn, 'error');
            return;
        }
        this.headerVisibility[id] = true;
        this.headerOrder.push(id);
        await this.persistHeader();
        if (btn) flashButtonFeedback(btn, 'success');
        this.renderHeaderItems();
    }

    async persistHeader() {
        try {
            await api.storage.sync.set({
                headerOrder: this.headerOrder,
                headerVisibility: this.headerVisibility,
                settingsUpdatedAt: Date.now()
            });
            this.settings.headerOrder = this.headerOrder;
            this.settings.headerVisibility = this.headerVisibility;
        } catch (e) {
            logError('options.persistHeader', e.message);
        }
    }

    /* ==================== Галерея фонов ==================== */

    renderBackgrounds() { this.renderBgList('bgGallery', this.backgrounds, 'background', 'activeBackgroundId'); }
    renderPanelBackgrounds() { this.renderBgList('panelBackgrounds', this.panelBackgrounds, 'panelBackground', 'activePanelBackgroundId'); }

    renderBgList(containerId, list, kind, activeKey) {
        const container = document.getElementById(containerId);
        if (!container) return;
        container.innerHTML = '';

        const activeId = this.settings[activeKey];

        if (!list.length) {
            const hint = document.createElement('span');
            hint.textContent = this.t('noBackgroundsAdd');
            hint.style.opacity = '.5';
            hint.style.fontSize = '13px';
            container.appendChild(hint);
            return;
        }

        list.forEach((bg, idx) => {
            const el = document.createElement('div');
            el.className = 'bg-item' + (bg.id === activeId ? ' active' : '');
            el.title = bg.name || '';

            if (bg.type === 'color' || bg.type === 'gradient') {
                el.style.background = bg.value;
            } else if (bg.type === 'image-file' && bg.ref) {
                el.style.background = 'linear-gradient(135deg, #333, #555)';
                loadBackgroundBlob(bg.ref).then(rec => {
                    if (rec?.dataUrl) {
                        el.style.backgroundImage = `url("${rec.dataUrl}")`;
                        el.style.backgroundSize = 'cover';
                        el.style.backgroundPosition = 'center';
                    }
                }).catch(() => {});
            } else if (bg.value) {
                el.style.backgroundImage = `url("${bg.value}")`;
                el.style.backgroundSize = 'cover';
                el.style.backgroundPosition = 'center';
            }

            const actions = document.createElement('div');
            actions.className = 'bg-actions';

            const activateBtn = document.createElement('button');
            activateBtn.type = 'button';
            activateBtn.title = this.t('stActivate');
            activateBtn.textContent = '✔';
            activateBtn.onclick = (e) => { e.stopPropagation(); this.onBgAction(kind, 'activate', idx, activateBtn); };
            actions.appendChild(activateBtn);

            const editBtn = document.createElement('button');
            editBtn.type = 'button';
            editBtn.title = this.t('dlgEditVerb');
            editBtn.textContent = '✏️';
            editBtn.onclick = (e) => { e.stopPropagation(); this.onBgAction(kind, 'edit', idx, editBtn); };
            actions.appendChild(editBtn);

            const delBtn = document.createElement('button');
            delBtn.type = 'button';
            delBtn.title = this.t('delete');
            delBtn.textContent = '🗑';
            delBtn.onclick = (e) => { e.stopPropagation(); this.onBgAction(kind, 'delete', idx, delBtn); };
            actions.appendChild(delBtn);

            el.appendChild(actions);
            el.onclick = () => this.onBgAction(kind, 'activate', idx);
            container.appendChild(el);
        });
    }

    async onBgAction(kind, action, idx, btn) {
        const list = kind === 'background' ? this.backgrounds : this.panelBackgrounds;
        const activeKey = kind === 'background' ? 'activeBackgroundId' : 'activePanelBackgroundId';
        const storageKey = kind === 'background' ? 'backgrounds' : 'panelBackgrounds';
        const bg = list[idx];
        if (!bg) return;

        switch (action) {
            case 'activate':
                this.settings[activeKey] = bg.id;
                await api.storage.sync.set({ [activeKey]: bg.id, settingsUpdatedAt: Date.now() });
                if (btn) flashButtonFeedback(btn, 'success');
                this.renderBackgrounds();
                this.renderPanelBackgrounds();
                break;
            case 'edit':
                if (btn) flashButtonFeedback(btn);
                this.openBgEditor(kind, idx);
                break;
            case 'delete':
                if (!await DialogService.confirm(this.t('confirmDelBg'))) return;
                if (bg.ref) {
                    try { await deleteBackgroundBlob(bg.ref); } catch (e) {}
                }
                list.splice(idx, 1);
                if (this.settings[activeKey] === bg.id) {
                    this.settings[activeKey] = list[0]?.id || '';
                    await api.storage.sync.set({ [activeKey]: this.settings[activeKey], settingsUpdatedAt: Date.now() });
                }
                await api.storage.sync.set({ [storageKey]: list, settingsUpdatedAt: Date.now() });
                this.renderBackgrounds();
                this.renderPanelBackgrounds();
                break;
        }
    }

    openBgEditor(kind, idx) {
        const existing = document.getElementById('bgEditModal');
        if (existing) existing.remove();

        this._bgEditContext = { kind, idx };

        const list = kind === 'background' ? this.backgrounds : this.panelBackgrounds;
        const bg = idx >= 0 ? list[idx] : null;

        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.id = 'bgEditModal';

        const content = document.createElement('div');
        content.className = 'modal-content';

        const h = document.createElement('h3');
        h.textContent = this.t(bg ? 'bgEditTitle' : 'bgAddTitle');
        content.appendChild(h);

        content.appendChild(this._formGroupWith(this.t('bgNameLbl'),
            (() => {
                const inp = document.createElement('input');
                inp.type = 'text';
                inp.id = 'bgEditName';
                inp.placeholder = this.t('bgNamePh');
                inp.value = bg?.name || '';
                return inp;
            })()));

        const typeSelect = document.createElement('select');
        typeSelect.id = 'bgEditType';
        [
            ['image-url', this.t('bgTypeUrl')],
            ['image-file', this.t('bgTypeFile')],
            ['color', this.t('bgTypeColor')],
            ['gradient', this.t('bgTypeGradient')]
        ].forEach(([v, t]) => {
            const opt = document.createElement('option');
            opt.value = v;
            opt.textContent = t;
            typeSelect.appendChild(opt);
        });
        typeSelect.value = bg?.type || 'image-url';
        content.appendChild(this._formGroupWith(this.t('bgTypeLbl'), typeSelect));

        const valWrap = document.createElement('div');
        valWrap.style.display = 'flex';
        valWrap.style.gap = '8px';
        valWrap.style.alignItems = 'stretch';

        const valInput = document.createElement('input');
        valInput.type = 'text';
        valInput.id = 'bgEditValue';
        valInput.placeholder = this.t('bgValuePh');
        valInput.value = bg && bg.type !== 'image-file' ? (bg.value || '') : '';
        valInput.style.flex = '1';
        valWrap.appendChild(valInput);

        const fileBtn = document.createElement('button');
        fileBtn.type = 'button';
        fileBtn.className = 'action-button';
        fileBtn.textContent = this.t('bgFileBtn');
        fileBtn.id = 'bgEditFileBtn';
        fileBtn.style.flexShrink = '0';
        fileBtn.onclick = () => {
            const fi = document.getElementById('bgEditFileInput');
            if (fi) fi.click();
        };
        valWrap.appendChild(fileBtn);

        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.id = 'bgEditFileInput';
        fileInput.accept = 'image/*';
        fileInput.style.display = 'none';
        fileInput.onchange = (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (ev) => {
                valInput.value = ev.target.result;
                valInput.dataset.fileName = file.name;
            };
            reader.readAsDataURL(file);
        };
        valWrap.appendChild(fileInput);

        content.appendChild(this._formGroupWith(this.t('bgValueLbl'), valWrap));

        const updateTypeFields = () => {
            const t = typeSelect.value;
            if (t === 'color') { valInput.placeholder = '#1a1a1a'; fileBtn.style.display = 'none'; }
            else if (t === 'gradient') { valInput.placeholder = 'linear-gradient(135deg, #667eea, #764ba2)'; fileBtn.style.display = 'none'; }
            else if (t === 'image-url') { valInput.placeholder = 'https://example.com/bg.jpg'; fileBtn.style.display = 'none'; }
            else if (t === 'image-file') { valInput.placeholder = this.t((bg && bg.type === 'image-file' && bg.ref) ? 'bgFileLoaded' : 'bgFileHint'); fileBtn.style.display = 'inline-block'; }
        };
        typeSelect.onchange = updateTypeFields;
        updateTypeFields();

        const opacityRow = document.createElement('div');
        opacityRow.style.display = 'flex';
        opacityRow.style.alignItems = 'center';
        opacityRow.style.gap = '10px';
        const opacityInput = document.createElement('input');
        opacityInput.type = 'range';
        opacityInput.id = 'bgEditOpacity';
        opacityInput.min = 0;
        opacityInput.max = 100;
        opacityInput.value = bg?.opacity ?? 100;
        opacityInput.style.flex = '1';
        const opacitySpan = document.createElement('span');
        opacitySpan.textContent = (bg?.opacity ?? 100) + '%';
        opacitySpan.style.minWidth = '45px';
        opacityInput.oninput = (e) => { opacitySpan.textContent = e.target.value + '%'; };
        opacityRow.appendChild(opacityInput);
        opacityRow.appendChild(opacitySpan);
        content.appendChild(this._formGroupWith(this.t('opacityLabel'), opacityRow));

        const brightRow = document.createElement('div');
        brightRow.style.display = 'flex';
        brightRow.style.alignItems = 'center';
        brightRow.style.gap = '10px';
        const brightInput = document.createElement('input');
        brightInput.type = 'range';
        brightInput.id = 'bgEditBrightness';
        brightInput.min = 50;
        brightInput.max = 150;
        brightInput.value = bg?.brightness ?? 100;
        brightInput.style.flex = '1';
        const brightSpan = document.createElement('span');
        brightSpan.textContent = (bg?.brightness ?? 100) + '%';
        brightSpan.style.minWidth = '45px';
        brightInput.oninput = (e) => { brightSpan.textContent = e.target.value + '%'; };
        brightRow.appendChild(brightInput);
        brightRow.appendChild(brightSpan);
        content.appendChild(this._formGroupWith(this.t('bgBrightnessLbl'), brightRow));

        const posSelect = document.createElement('select');
        posSelect.id = 'bgEditPosition';
        [
            ['cover', this.t('bgPosCover')],
            ['contain', this.t('bgPosContain')],
            ['repeat', this.t('bgPosRepeat')],
            ['center', this.t('bgPosCenter')]
        ].forEach(([v, t]) => {
            const opt = document.createElement('option');
            opt.value = v;
            opt.textContent = t;
            posSelect.appendChild(opt);
        });
        posSelect.value = bg?.position || 'cover';
        content.appendChild(this._formGroupWith(this.t('bgPosLbl'), posSelect));

        const actions = document.createElement('div');
        actions.className = 'form-actions';

        const cancelBtn = document.createElement('button');
        cancelBtn.type = 'button';
        cancelBtn.textContent = this.t('cancel');
        cancelBtn.onclick = () => { flashButtonFeedback(cancelBtn); modal.remove(); };
        actions.appendChild(cancelBtn);

        const saveBtn = document.createElement('button');
        saveBtn.type = 'button';
        saveBtn.style.background = 'var(--accent)';
        saveBtn.style.color = '#fff';
        saveBtn.textContent = this.t('save');
        saveBtn.onclick = () => this.saveBgEdit(saveBtn);
        actions.appendChild(saveBtn);

        content.appendChild(actions);
        modal.appendChild(content);

        modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
        document.body.appendChild(modal);
    }

    _formGroupWith(labelText, el) {
        const group = document.createElement('div');
        group.className = 'form-group';
        const label = document.createElement('label');
        label.textContent = labelText;
        group.appendChild(label);
        group.appendChild(el);
        return group;
    }

    async saveBgEdit(btn) {
        const ctx = this._bgEditContext;
        if (!ctx) return;

        const name = document.getElementById('bgEditName').value.trim();
        const type = document.getElementById('bgEditType').value;
        const value = document.getElementById('bgEditValue').value.trim();
        const opacity = parseInt(document.getElementById('bgEditOpacity').value) || 100;
        const brightness = parseInt(document.getElementById('bgEditBrightness').value) || 100;
        const position = document.getElementById('bgEditPosition').value;

        const list = ctx.kind === 'background' ? this.backgrounds : this.panelBackgrounds;
        const storageKey = ctx.kind === 'background' ? 'backgrounds' : 'panelBackgrounds';

        /* v6.7.0: у загруженного файла можно менять название/яркость/положение, не загружая его заново */
        const prev = ctx.idx >= 0 ? list[ctx.idx] : null;
        const keepFile = !value && type === 'image-file' && prev && prev.type === 'image-file' && prev.ref;

        if (!value && !keepFile) {
            if (btn) flashButtonFeedback(btn, 'error');
            this.showStatus(this.t('bgFillValue'), 'error');
            return;
        }

        let ref = keepFile ? prev.ref : '';
        let storedValue = keepFile ? '' : value;

        if (type === 'image-file' && value.startsWith('data:')) {
            ref = 'bg_' + Date.now() + '_' + Math.random().toString(36).slice(2);
            try {
                await saveBackgroundBlob(ref, value);
                storedValue = '';
            } catch (e) {
                if (btn) flashButtonFeedback(btn, 'error');
                logError('options.saveBgEdit', 'Не удалось сохранить blob', { error: e.message });
                this.showStatus(this.t('bgFileSaveErr'), 'error');
                return;
            }
        }

        const bg = {
            id: ctx.idx >= 0 ? list[ctx.idx].id : 'bg_' + Date.now(),
            name: name || this.t('bgDefaultName'),
            type, value: storedValue, ref, opacity, brightness, position
        };

        if (ctx.idx >= 0) {
            const old = list[ctx.idx];
            if (old?.ref && old.ref !== ref) {
                try { await deleteBackgroundBlob(old.ref); } catch (e) {}
            }
            list[ctx.idx] = bg;
        } else {
            list.push(bg);
        }

        await api.storage.sync.set({ [storageKey]: list, settingsUpdatedAt: Date.now() });
        if (btn) flashButtonFeedback(btn, 'success');
        this.renderBackgrounds();
        this.renderPanelBackgrounds();

        const modal = document.getElementById('bgEditModal');
        if (modal) modal.remove();
        this.showStatus(this.t('bgSaved'), 'success');
    }

    /* ==================== Пары валют ==================== */

    renderCurrencyPairs() {
        const tbody = document.getElementById('currencyPairsBody');
        if (!tbody) return;
        tbody.innerHTML = '';

        this.currencyPairs.forEach((pair, idx) => {
            const tr = document.createElement('tr');
            const tdPair = document.createElement('td');
            tdPair.textContent = pair;
            tr.appendChild(tdPair);

            const tdActions = document.createElement('td');
            const actions = document.createElement('div');
            actions.className = 'row-actions';

            const editBtn = document.createElement('button');
            editBtn.type = 'button';
            editBtn.className = 'row-btn';
            editBtn.title = this.t('edit');
            editBtn.textContent = '✏️';
            editBtn.onclick = () => this.editCurrencyPair(idx, editBtn);
            actions.appendChild(editBtn);

            const delBtn = document.createElement('button');
            delBtn.type = 'button';
            delBtn.className = 'row-btn danger';
            delBtn.title = this.t('delete');
            delBtn.textContent = '✕';
            delBtn.onclick = () => this.deleteCurrencyPair(idx, delBtn);
            actions.appendChild(delBtn);

            tdActions.appendChild(actions);
            tr.appendChild(tdActions);
            tbody.appendChild(tr);
        });
    }

    _isValidCurrencyPair(value) {
        if (!/^[A-Z]{3}\/[A-Z]{3}$/.test(value)) return false;
        const [base, target] = value.split('/');
        return base !== target;
    }

    async editCurrencyPair(idx, btn) {
        const cur = this.currencyPairs[idx];
        const next = await DialogService.prompt(this.t('currencyEditPrompt'), cur);
        if (!next) { if (btn) flashButtonFeedback(btn, 'error'); return; }
        const cleaned = next.trim().toUpperCase();
        if (!this._isValidCurrencyPair(cleaned)) {
            if (btn) flashButtonFeedback(btn, 'error');
            this.showStatus(this.t('currencyFmtErr'), 'error');
            return;
        }
        this.currencyPairs[idx] = cleaned;
        await api.storage.sync.set({ currencyPairs: this.currencyPairs, settingsUpdatedAt: Date.now() });
        if (btn) flashButtonFeedback(btn, 'success');
        this.renderCurrencyPairs();
    }

    async deleteCurrencyPair(idx, btn) {
        if (!await DialogService.confirm(this.t('confirmDelPair'))) return;
        this.currencyPairs.splice(idx, 1);
        await api.storage.sync.set({ currencyPairs: this.currencyPairs, settingsUpdatedAt: Date.now() });
        if (btn) flashButtonFeedback(btn, 'success');
        this.renderCurrencyPairs();
    }

    async addCurrencyPair(e) {
        const btn = e?.currentTarget;
        const input = document.getElementById('newCurrencyPair');
        const value = (input?.value || '').trim().toUpperCase();
        if (!this._isValidCurrencyPair(value)) {
            if (btn) flashButtonFeedback(btn, 'error');
            this.showStatus(this.t('currencyFmtErr'), 'error');
            return;
        }
        if (!this.currencyPairs.includes(value)) {
            this.currencyPairs.push(value);
            await api.storage.sync.set({ currencyPairs: this.currencyPairs, settingsUpdatedAt: Date.now() });
            if (btn) flashButtonFeedback(btn, 'success');
            this.renderCurrencyPairs();
        } else {
            if (btn) flashButtonFeedback(btn, 'error');
        }
        if (input) input.value = '';
    }

    /* ==================== Профили ==================== */

    async loadProfiles() {
        try {
            const data = await api.storage.local.get(['profiles', 'activeProfile']);
            this.profiles = data.profiles || { default: { speedDialData: null } };
            this.activeProfile = data.activeProfile || 'default';
            this.renderProfiles();
        } catch (e) {
            logError('options.loadProfiles', e.message);
        }
    }

    renderProfiles() {
        const tbody = document.getElementById('profilesBody');
        if (!tbody) return;
        tbody.innerHTML = '';

        Object.keys(this.profiles).forEach(name => {
            const isActive = name === this.activeProfile;
            const tr = document.createElement('tr');

            const tdName = document.createElement('td');
            tdName.textContent = name;
            tr.appendChild(tdName);

            const tdActive = document.createElement('td');
            tdActive.textContent = isActive ? '✔' : '';
            tr.appendChild(tdActive);

            const tdActions = document.createElement('td');
            const actions = document.createElement('div');
            actions.className = 'row-actions';

            const activateBtn = document.createElement('button');
            activateBtn.type = 'button';
            activateBtn.className = 'row-btn';
            activateBtn.textContent = this.t('stActivate');
            activateBtn.style.minWidth = '110px';
            activateBtn.disabled = isActive;
            activateBtn.onclick = () => this.activateProfile(name, activateBtn);
            actions.appendChild(activateBtn);

            const renameBtn = document.createElement('button');
            renameBtn.type = 'button';
            renameBtn.className = 'row-btn';
            renameBtn.title = this.t('stRename');
            renameBtn.textContent = '✏️';
            renameBtn.onclick = () => this.renameProfile(name, renameBtn);
            actions.appendChild(renameBtn);

            if (name !== 'default') {
                const delBtn = document.createElement('button');
                delBtn.type = 'button';
                delBtn.className = 'row-btn danger';
                delBtn.title = this.t('delete');
                delBtn.textContent = '✕';
                delBtn.onclick = () => this.deleteProfile(name, delBtn);
                actions.appendChild(delBtn);
            }

            tdActions.appendChild(actions);
            tr.appendChild(tdActions);
            tbody.appendChild(tr);
        });
    }

    async activateProfile(name, btn) {
        this._setButtonLoading(btn, true);
        try {
            const r = await api.runtime.sendMessage({ action: 'switchProfile', profileName: name });
            if (r?.success) {
                this.activeProfile = name;
                this._flashButton(btn, 'success');
                this.renderProfiles();
                this.showStatus(this.tf('popupProfileActivated', { name }), 'success');
                await this.updateSyncSummary(true);
            } else {
                this._flashButton(btn, 'error');
                this.showStatus(r?.error || this.t('profileSwitchErr'), 'error');
            }
        } catch (e) {
            logError('options.activateProfile', e.message);
            this._flashButton(btn, 'error');
            this.showStatus(this.t('errPrefix') + e.message, 'error');
        } finally {
            this._setButtonLoading(btn, false);
        }
    }

    async renameProfile(oldName, btn) {
        const next = await DialogService.prompt(this.t('profileRenamePrompt'), oldName);
        if (!next || next === oldName || this.profiles[next]) {
            if (btn) flashButtonFeedback(btn, 'error');
            return;
        }
        this.profiles[next] = this.profiles[oldName];
        delete this.profiles[oldName];
        if (this.activeProfile === oldName) this.activeProfile = next;

        await api.storage.local.set({
            profiles: this.profiles,
            activeProfile: this.activeProfile
        });
        if (btn) flashButtonFeedback(btn, 'success');
        this.renderProfiles();
        this.showStatus(this.tf('profileRenamed', { name: next }), 'success');
    }

    async deleteProfile(name, btn) {
        if (name === 'default') return;
        if (name === this.activeProfile) {
            if (btn) flashButtonFeedback(btn, 'error');
            this.showStatus(this.t('profileDelActiveErr'), 'error');
            return;
        }
        if (!await DialogService.confirm(this.tf('confirmDelProfile', { name }))) return;

        delete this.profiles[name];
        await api.storage.local.set({ profiles: this.profiles });
        if (btn) flashButtonFeedback(btn, 'success');
        this.renderProfiles();
    }

    async addProfile(e) {
        const btn = e?.currentTarget;
        const input = document.getElementById('profileName');
        const name = (input?.value || '').trim();
        if (!name) { if (btn) flashButtonFeedback(btn, 'error'); this.showStatus(this.t('profileNameReq'), 'error'); return; }
        if (this.profiles[name]) { if (btn) flashButtonFeedback(btn, 'error'); this.showStatus(this.t('profileExists'), 'error'); return; }

        const currentData = await loadDataFromIDB();
        this.profiles[name] = { speedDialData: currentData || null };
        await api.storage.local.set({ profiles: this.profiles });

        if (input) input.value = '';
        if (btn) flashButtonFeedback(btn, 'success');
        this.renderProfiles();
        this.showStatus(this.tf('profileAdded', { name }), 'success');
    }

    /* ==================== DND / Notifications ==================== */

    loadDNDSettings() {
        const dnd = this.settings.doNotDisturb || {};
        this.setChecked('dndEnabled', !!dnd.enabled);
        this.setValue('dndStart', dnd.start || '22:00');
        this.setValue('dndEnd', dnd.end || '08:00');
    }

    async checkNotificationPermission() {
        try {
            const has = await api.permissions.contains({ permissions: ['notifications'] });
            const cb = document.getElementById('notificationsEnabled');
            if (cb) cb.checked = has;
        } catch (e) {}
    }

    async requestNotificationPermission() {
        try {
            const granted = await api.permissions.request({ permissions: ['notifications'] });
            const cb = document.getElementById('notificationsEnabled');
            if (cb) cb.checked = granted;
            this.showStatus(this.t(granted ? 'notifEnabled' : 'notifDenied'), granted ? 'success' : 'info');
        } catch (e) {
            this.showStatus(this.t('errPrefix') + e.message, 'error');
        }
    }

    /* ==================== Синхронизация ==================== */

    toggleSyncSettings() {
        const select = document.getElementById('syncService');
        if (!select) return;
        const s = select.value;
        document.querySelectorAll('.sync-settings').forEach(el => el.style.display = 'none');

        const map = {
            webdav: 'webdavSettings',
            nextcloud: 'nextcloudSettings',
            dropbox: 'dropboxSettings',
            box: 'boxSettings',
            onedrive: 'onedriveSettings',
            pcloud: 'pcloudSettings',
            yandex: 'yandexSettings',
            mailru: 'mailruSettings'
        };
        const el = document.getElementById(map[s]);
        if (el) el.style.display = 'block';
    }

    async updateSyncSummary(force = false) {
        const now = Date.now();
        if (!force && now - this._syncSummaryThrottle < 30000) return;
        this._syncSummaryThrottle = now;

        try {
            const localData = await loadDataFromIDB();
            const browserData = localData || {};

            const setCount = (id, count) => {
                const el = document.getElementById(id);
                if (el) el.textContent = count || 0;
            };

            setCount('browserTilesCount', browserData.tiles?.length || 0);
            setCount('browserFoldersCount', browserData.folders?.length || 0);
            setCount('browserNotesCount', browserData.notes?.length || 0);
            setCount('browserNoteFoldersCount', browserData.noteFolders?.length || 0);
            setCount('browserTombstonesCount', Object.keys(browserData.tombstones || {}).length);

            const s = this.collect();
            let serverData = {};

            if (s.syncService && this.validateSettings(s)) {
                try {
                    serverData = await this.getServerData(s);
                } catch (e) {
                    logWarn('options.updateSyncSummary', 'Сервер недоступен', { error: e.message });
                }
            }

            setCount('serverTilesCount', serverData.tiles?.length || 0);
            setCount('serverFoldersCount', serverData.folders?.length || 0);
            setCount('serverNotesCount', serverData.notes?.length || 0);
            setCount('serverNoteFoldersCount', serverData.noteFolders?.length || 0);
            setCount('serverTombstonesCount', Object.keys(serverData.tombstones || {}).length);

            const encEl = document.getElementById('serverEncryptionStatus');
            if (encEl) {
                if (serverData.empty) {
                    encEl.textContent = '—';
                    encEl.style.color = '';
                } else if (serverData.encrypted) {
                    encEl.textContent = this.t('encStatusOn');
                    encEl.style.color = '#4CAF50';
                } else {
                    encEl.textContent = '⚠️ plaintext';
                    encEl.style.color = '#f5576c';
                }
            }
        } catch (e) {
            logError('options.updateSyncSummary', e.message);
        }
    }

    validateSettings(settings) {
        const checks = {
            webdav:    () => settings.webdavUrl && settings.webdavUsername,
            nextcloud: () => settings.nextcloudUrl && settings.nextcloudUsername,
            dropbox:   () => settings.dropboxAccessToken,
            box:       () => settings.boxAccessToken && settings.boxFileId,
            onedrive:  () => settings.onedriveAccessToken,
            pcloud:    () => settings.pcloudAccessToken,
            yandex:    () => settings.yandexToken,
            mailru:    () => settings.mailruEmail && settings.mailruPassword
        };
        return checks[settings.syncService] ? checks[settings.syncService]() : false;
    }

    async getServerData(_settings) {
        try {
            const r = await api.runtime.sendMessage({ action: 'getServerSummary' });
            if (r?.success) return r.data || {};
            logWarn('options.getServerData', r?.error || 'unknown');
            return {};
        } catch (e) {
            logWarn('options.getServerData', e.message);
            return {};
        }
    }

    /* ==================== Сбор настроек ==================== */

    collect() {
        const s = {};

        const keys = [
            'syncService', 'syncService2', 'forcedLanguage', 'theme',
            'accentColor', 'tileBgDefault', 'tileTextDefault',
            'fontFamily', 'fontSize', 'faviconSource',
            'webdavUrl', 'webdavUsername', 'webdavPassword',
            'nextcloudUrl', 'nextcloudUsername', 'nextcloudPassword',
            'dropboxAccessToken', 'dropboxFolder',
            'boxAccessToken', 'boxFileId',
            'onedriveAccessToken', 'onedriveFolder',
            'pcloudAccessToken', 'pcloudFolder',
            'yandexToken', 'yandexFolder',
            'mailruEmail', 'mailruPassword', 'mailruFolder',
            'encryptionKey', 'tileSizeSliderPosition',
            'bgRotateMode', 'tileSortMode', 'noteSortMode',
            'folderSortMode', 'noteFolderSortMode', 'folderBarPosition',
            'folderDefaultColor', 'noteFolderDefaultColor'
        ];
        for (const k of keys) {
            const el = document.getElementById(k);
            if (el) s[k] = el.value;
        }

        s.tileSize = parseInt(document.getElementById('tileSize')?.value) || 150;
        /* v6.8.6: расстояние между диалами; пусто/невалидно — авто (null) */
        const tileGapVal = parseInt(document.getElementById('tileGap')?.value);
        s.tileGap = (Number.isFinite(tileGapVal) && tileGapVal >= 1 && tileGapVal <= 200) ? tileGapVal : null;
        s.themeOpacity = parseInt(document.getElementById('themeOpacity')?.value) || 100;
        s.headerOpacity = parseInt(document.getElementById('headerOpacity')?.value) || 55;
        s.sidebarOpacity = parseInt(document.getElementById('sidebarOpacity')?.value) || 55;
        s.modalOpacity = parseInt(document.getElementById('modalOpacity')?.value) || 75;
        s.syncInterval = parseInt(document.getElementById('syncInterval')?.value) || 60;
        s.autoLockTimeout = parseInt(document.getElementById('autoLockTimeout')?.value) || 0;
        s.bgRotateInterval = parseInt(document.getElementById('bgRotateInterval')?.value) || 30;
        s.folderMaxDepth = parseInt(document.getElementById('folderMaxDepth')?.value) || 5;

        s.autoSync = document.getElementById('autoSync')?.checked ?? true;
        s.showTileSizeSlider = document.getElementById('showTileSizeSlider')?.checked ?? true;
        s.currencyWidget = document.getElementById('currencyWidget')?.checked ?? false;
        s.hideCurrencyIcon = document.getElementById('hideCurrencyIcon')?.checked ?? false;
        s.bgRotateEnabled = document.getElementById('bgRotateEnabled')?.checked ?? false;
        s.tileSortFoldersFirst = document.getElementById('tileSortFoldersFirst')?.checked ?? false;
        s.noteSortFoldersFirst = document.getElementById('noteSortFoldersFirst')?.checked ?? false;
        s.folderShowEmpty = document.getElementById('folderShowEmpty')?.checked ?? true;
        s.notificationsEnabled = document.getElementById('notificationsEnabled')?.checked ?? false;

        s.syncMode = document.getElementById('syncMode')?.value || 'merge';

        s.doNotDisturb = {
            enabled: document.getElementById('dndEnabled')?.checked ?? false,
            start: document.getElementById('dndStart')?.value || '22:00',
            end: document.getElementById('dndEnd')?.value || '08:00'
        };

        s.searchEngines = this.searchEngines.slice();
        s.headerOrder = this.headerOrder.slice();
        s.headerVisibility = { ...this.headerVisibility };
        s.backgrounds = this.backgrounds.slice();
        s.panelBackgrounds = this.panelBackgrounds.slice();
        s.activeBackgroundId = this.settings.activeBackgroundId || '';
        s.activePanelBackgroundId = this.settings.activePanelBackgroundId || '';
        s.currencyPairs = this.currencyPairs.slice();

        return s;
    }

    /* ============================================================
       v6.6.6: проставляем settingsUpdatedAt перед сохранением.
       Это активирует Last-Write-Wins при следующем sync.
       ============================================================ */

    async applySettings() {
        try {
            const s = this.collect();

            /* v6.7.0: LWW-таймстемп только если синхронизируемые настройки реально изменились */
            const changed = Object.keys(s).some(k =>
                !SYNC_EXCLUDED_KEYS.has(k) &&
                JSON.stringify(s[k]) !== JSON.stringify(this.settings[k]));
            if (changed) s.settingsUpdatedAt = Date.now();

            const masterPassInput = document.getElementById('masterPassword');
            if (masterPassInput && masterPassInput.value) {
                const record = await createMasterPasswordRecord(masterPassInput.value);
                await api.storage.local.set({ masterPasswordRecord: record });
                await api.storage.local.remove('masterPasswordHash');
                masterPassInput.value = '';
            }

            await api.storage.sync.set(s);
            this.settings = { ...this.settings, ...s };

            this.applyTheme();
            this.applyDesignSettings();
            this._updatePlaintextWarning();
            this.showStatus(this.t('settingsApplied'), 'success');
            logInfo('options.applySettings', 'Настройки сохранены (LWW-таймстемп обновлён)');
            return true;
        } catch (e) {
            logError('options.applySettings', e.message);
            this.showStatus(this.t('errPrefix') + e.message, 'error');
            return false;
        }
    }

    /* ==================== События ==================== */

    setupEvents() {
        /* v6.9.0: живое переключение языка без перезагрузки страницы */
        const langSelect = document.getElementById('forcedLanguage');
        if (langSelect) {
            langSelect.addEventListener('change', () => {
                this.settings.forcedLanguage = langSelect.value;
                this.applyLanguage();
            });
        }

        /* v6.9.1: язык, изменённый в другой вкладке/окне, подхватывается автоматически */
        api.storage.onChanged.addListener((changes, area) => {
            if (area !== 'sync' || !changes.forcedLanguage) return;
            const v = changes.forcedLanguage.newValue || 'auto';
            this.settings.forcedLanguage = v;
            if (langSelect && langSelect.value !== v) langSelect.value = v;
            this.applyLanguage();
        });

        document.getElementById('applySettings').onclick = (e) => {
            const btn = e.currentTarget;
            flashButtonFeedback(btn);
            this.applySettings().then(ok => flashButtonFeedback(btn, ok ? 'success' : 'error'));
        };

        document.getElementById('settingsForm').onsubmit = async (e) => {
            e.preventDefault();
            const submitBtn = document.getElementById('saveAndClose');
            if (submitBtn) flashButtonFeedback(submitBtn);
            const ok = await this.applySettings();
            if (!ok) { if (submitBtn) flashButtonFeedback(submitBtn, 'error'); return; }
            if (submitBtn) flashButtonFeedback(submitBtn, 'success');
            try { await api.runtime.sendMessage({ action: 'reloadSpeedDialTabs' }); } catch (err) {}
            setTimeout(() => window.close(), 300);
        };

        document.querySelectorAll('.sync-mode-btn').forEach(b => {
            b.addEventListener('click', async (e) => {
                e.preventDefault();
                e.stopPropagation();
                const mode = b.dataset.mode;
                if (!mode) return;
                this._flashButton(b, 'success');
                this.setActiveMode(mode);
                await api.storage.sync.set({ syncMode: mode, settingsUpdatedAt: Date.now() });
                this.settings.syncMode = mode;
                this.showStatus(this.t('modeSaved'), 'info');
            });
        });

        const syncNowBtn = document.getElementById('syncNowBtn');
        if (syncNowBtn) {
            syncNowBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                e.stopPropagation();
                await this._runSyncWithConflictHandling(syncNowBtn);
            });
        }

        const applySyncBtn = document.getElementById('applySyncBtn');
        if (applySyncBtn) {
            applySyncBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                e.stopPropagation();
                this._flashButton(applySyncBtn);
                this._setButtonLoading(applySyncBtn, true);
                try {
                    const ok = await this.applySettings();
                    this._flashButton(applySyncBtn, ok ? 'success' : 'error');
                } catch (err) {
                    this._flashButton(applySyncBtn, 'error');
                } finally {
                    this._setButtonLoading(applySyncBtn, false);
                }
            });
        }

        const testBtn = document.getElementById('testConnection');
        if (testBtn) {
            testBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                e.stopPropagation();
                this._flashButton(testBtn);
                this._setButtonLoading(testBtn, true);
                this.showStatus(this.t('connTesting'), 'info');
                try {
                    const collected = this.collect();
                    const svc1 = collected.syncService;
                    /* v6.9.4: при выбранном втором сервере проверяем оба */
                    const svc2 = (collected.syncService2 && collected.syncService2 !== svc1)
                        ? collected.syncService2 : '';
                    const jobs = [api.runtime.sendMessage({ action: 'testSyncConnection', service: svc1, settings: collected })];
                    if (svc2) jobs.push(api.runtime.sendMessage({ action: 'testSyncConnection', service: svc2, settings: collected }));
                    const rs = await Promise.all(jobs);
                    const bad = rs.filter(r => !r?.success);
                    this._flashButton(testBtn, bad.length ? 'error' : 'success');
                    if (!bad.length) {
                        this.showStatus(this.t('connOk') + (svc2 ? ' (2)' : ''), 'success');
                    } else {
                        this.showStatus('❌ ' + (bad[0]?.error || this.t('errGeneric')), 'error');
                    }
                } catch (err) {
                    this._flashButton(testBtn, 'error');
                    this.showStatus(this.t('errPrefix') + err.message, 'error');
                } finally {
                    this._setButtonLoading(testBtn, false);
                }
            });
        }

        document.getElementById('syncService').onchange = () => {
            this.toggleSyncSettings();
            this.updateSyncSummary(true);
        };

        const importExportMap = {
            importBookmarksBtn: () => this.importBookmarks(),
            exportBookmarksBtn: () => this.exportBookmarks(),
            importBrowserBtn: () => this.importFromBrowser(),
            exportBrowserBtn: () => this.exportToBrowser(),
            exportHTMLBtn: () => this.exportToHTML(),
            importHTMLBtn: () => this.importFromHTML(),
            importCSVBtn: () => this.importFromCSV(),
            importFvdBtn: () => this.importFromFVD(),
            exportLogsBtn: () => this.exportLogs(),
            exportDetailedLogsBtn: () => this.exportDetailedLogs()
        };
        Object.entries(importExportMap).forEach(([id, fn]) => {
            const el = document.getElementById(id);
            if (el) el.onclick = (e) => this._withButtonFeedback(e, fn);
        });

        document.getElementById('addSearchEngine').onclick = (e) => this.addSearchEngine(e);
        document.getElementById('addHeaderItem').onclick = (e) => this.addHeaderItem(e);

        const addBgBtn = document.getElementById('addBackgroundBtn');
        if (addBgBtn) {
            addBgBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                flashButtonFeedback(addBgBtn);
                this.openBgEditor('background', -1);
            });
        }

        const addPanelBgBtn = document.getElementById('addPanelBackgroundBtn');
        if (addPanelBgBtn) {
            addPanelBgBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                flashButtonFeedback(addPanelBgBtn);
                this.openBgEditor('panelBackground', -1);
            });
        }

        document.getElementById('addCurrencyPairBtn').onclick = (e) => this.addCurrencyPair(e);
        document.getElementById('addProfileBtn').onclick = (e) => this.addProfile(e);

        document.getElementById('setMasterPass').onclick = async (e) => {
            const btn = e.currentTarget;
            flashButtonFeedback(btn);

            const input = document.getElementById('masterPassword');
            const pass = input?.value;

            if (!pass) {
                await api.storage.local.remove(['masterPasswordRecord', 'masterPasswordHash']);
                flashButtonFeedback(btn, 'success');
                this.showStatus(this.t('mpRemoved'), 'success');
                return;
            }

            try {
                const record = await createMasterPasswordRecord(pass);
                await api.storage.local.set({ masterPasswordRecord: record });
                await api.storage.local.remove('masterPasswordHash');
                if (input) input.value = '';
                flashButtonFeedback(btn, 'success');
                this.showStatus(this.t('mpSet'), 'success');
            } catch (err) {
                flashButtonFeedback(btn, 'error');
                this.showStatus(this.t('errPrefix') + err.message, 'error');
            }
        };

        ['tileSize', 'tileSizeQuick', 'themeOpacity', 'headerOpacity', 'sidebarOpacity', 'modalOpacity'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.oninput = () => this.updateSliderDisplays();
        });

        /* v6.8.3: ползунок в блоке «Сортировка и папки» зеркалит основной.
           v6.8.4: размер применяется сразу, без «Применить»/«Готово»
           (запись с небольшим debounce, чтобы не спамить storage.sync). */
        const tsMain = document.getElementById('tileSize');
        const tsQuick = document.getElementById('tileSizeQuick');
        const applyTileSizeNow = (val) => {
            const v = parseInt(val) || 150;
            this.settings.tileSize = v;
            clearTimeout(this._tileSizeSaveTimer);
            this._tileSizeSaveTimer = setTimeout(() => {
                Promise.resolve(
                    api.storage.sync.set({ tileSize: v, settingsUpdatedAt: Date.now() })
                ).catch(e => logError('options.tileSize autosave', e.message));
            }, 300);
        };
        if (tsMain && tsQuick) {
            tsMain.addEventListener('input', () => { tsQuick.value = tsMain.value; this.updateSliderDisplays(); applyTileSizeNow(tsMain.value); });
            tsQuick.addEventListener('input', () => { tsMain.value = tsQuick.value; this.updateSliderDisplays(); applyTileSizeNow(tsQuick.value); });
        }

        /* v6.8.6: расстояние между диалами применяется сразу */
        const gapInput = document.getElementById('tileGap');
        if (gapInput) {
            gapInput.addEventListener('input', () => {
                clearTimeout(this._tileGapSaveTimer);
                this._tileGapSaveTimer = setTimeout(() => {
                    const g = parseInt(gapInput.value);
                    const v = (Number.isFinite(g) && g >= 1 && g <= 200) ? g : null;
                    this.settings.tileGap = v;
                    Promise.resolve(
                        api.storage.sync.set({ tileGap: v, settingsUpdatedAt: Date.now() })
                    ).catch(e => logError('options.tileGap autosave', e.message));
                }, 300);
            });
        }

        document.getElementById('accentColor').oninput = (e) => {
            document.documentElement.style.setProperty('--accent', e.target.value);
        };
        document.getElementById('fontFamily').onchange = (e) => {
            this.settings.fontFamily = e.target.value;
            this.applyDesignSettings();
        };
        document.getElementById('fontSize').onchange = (e) => {
            this.settings.fontSize = e.target.value;
            this.applyDesignSettings();
        };

        const encKeyEl = document.getElementById('encryptionKey');
        if (encKeyEl) encKeyEl.oninput = () => this._updatePlaintextWarning();

        const notifCb = document.getElementById('notificationsEnabled');
        if (notifCb) {
            notifCb.onchange = async (e) => {
                if (e.target.checked) {
                    await this.requestNotificationPermission();
                } else {
                    try {
                        await api.permissions.remove({ permissions: ['notifications'] });
                        this.showStatus(this.t('notifDisabled'), 'info');
                    } catch (err) {}
                }
            };
        }

        if (window.matchMedia) {
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
                if (this.settings?.theme === 'auto') this.applyTheme();
            });
        }
    }

    async _runSyncWithConflictHandling(syncNowBtn) {
        this._flashButton(syncNowBtn);
        this._setButtonLoading(syncNowBtn, true);
        this.showStatus('🔄 ' + this.t('toastSyncing'), 'info');

        const mode = document.getElementById('syncMode')?.value || 'merge';
        let syncType = 'merge';
        if (mode === 'upload') syncType = 'upload';
        else if (mode === 'download') syncType = 'download';

        try {
            await this.applySettings();
            const r = await api.runtime.sendMessage({ action: 'syncNow', syncType });

            if (r && r.needsResolve) {
                this._flashButton(syncNowBtn, 'success');
                await this._handleSyncConflict(syncNowBtn, r.conflicts);
                return;
            }

            this._flashButton(syncNowBtn, r?.success ? 'success' : 'error');

            if (r?.success) {
                const d = r.data || {};
                const parts = [
                    d.tiles?.length ? this.tf('cntTiles', { n: d.tiles.length }) : '',
                    d.folders?.length ? this.tf('cntFolders', { n: d.folders.length }) : '',
                    d.notes?.length ? this.tf('cntNotes', { n: d.notes.length }) : ''
                ].filter(Boolean).join(' · ');
                const modeLabel = syncType === 'merge' ? this.t('lblMerged') :
                                  syncType === 'upload' ? this.t('lblUploaded') : this.t('lblDownloaded');
                this.showStatus(`✅ ${modeLabel}${parts ? ': ' + parts : ''}`, 'success');
            } else if (r?.retryIn) {
                this.showStatus('⏳ ' + this.tf('popupWait', { n: r.retryIn + ' ' + this.t('secShort') }), 'info');
            } else {
                this.showStatus('❌ ' + (r?.error || this.t('errGeneric')), 'error');
            }

            await this.updateSyncSummary(true);
        } catch (err) {
            this._flashButton(syncNowBtn, 'error');
            this.showStatus(this.t('errPrefix') + err.message, 'error');
        } finally {
            this._setButtonLoading(syncNowBtn, false);
        }
    }

    async _handleSyncConflict(syncNowBtn, conflicts) {
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
            this.showStatus(this.t('syncCancelled'), 'info');
            await this.updateSyncSummary(true);
            return;
        }

        this.showStatus(this.tf('conflictResolving', { choice }), 'info');

        try {
            const r = await api.runtime.sendMessage({
                action: 'resolveSyncConflict',
                strategy: choice
            });

            if (r?.success) {
                const d = r.data || {};
                const parts = [
                    d.tiles?.length ? this.tf('cntTiles', { n: d.tiles.length }) : '',
                    d.folders?.length ? this.tf('cntFolders', { n: d.folders.length }) : '',
                    d.notes?.length ? this.tf('cntNotes', { n: d.notes.length }) : ''
                ].filter(Boolean).join(' · ');
                const labelMap = {
                    local: this.t('lblLocal'),
                    server: this.t('lblServer'),
                    merge: this.t('lblMerged')
                };
                this.showStatus(`✅ ${labelMap[choice] || choice}${parts ? ': ' + parts : ''}`, 'success');
                if (syncNowBtn) this._flashButton(syncNowBtn, 'success');
            } else {
                this.showStatus('❌ ' + (r?.error || this.t('conflictErr')), 'error');
                if (syncNowBtn) this._flashButton(syncNowBtn, 'error');
            }

            await this.updateSyncSummary(true);
        } catch (err) {
            this.showStatus(this.t('errPrefix') + err.message, 'error');
            if (syncNowBtn) this._flashButton(syncNowBtn, 'error');
        }
    }

    setupPasswordToggles() {
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

    /* ==================== Импорт / экспорт ==================== */

    async importBookmarks() {
        return new Promise((resolve) => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json';
            input.onchange = async (e) => {
                const f = e.target.files[0];
                if (!f) return resolve(false);
                try {
                    const text = await f.text();
                    const d = JSON.parse(text);
                    if (!d.tiles && !d.folders && !d.notes) {
                        this.showStatus(this.t('fileNoData'), 'error');
                        return resolve(false);
                    }
                    await saveDataToIDB({
                        tiles: d.tiles || [],
                        folders: d.folders || [],
                        notes: d.notes || [],
                        noteFolders: d.noteFolders || [],
                        folderPasswords: d.folderPasswords || {},
                        tombstones: d.tombstones || {},
                        headerHidden: !!d.headerHidden,
                        sidebarCollapsed: !!d.sidebarCollapsed
                    });
                    this.showStatus(this.t('importDone'), 'success');
                    await this.updateSyncSummary(true);
                    resolve(true);
                } catch (err) {
                    this.showStatus(this.t('errPrefix') + err.message, 'error');
                    resolve(false);
                }
            };
            input.click();
        });
    }

    async exportBookmarks() {
        const data = (await loadDataFromIDB()) || {};
        data.exportedAt = new Date().toISOString();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'private-speeddial-bookmarks.json';
        a.click();
        URL.revokeObjectURL(a.href);
        this.showStatus(this.t('exportDone'), 'success');
        return true;
    }

    async importFromBrowser() {
        try {
            const r = await api.runtime.sendMessage({ action: 'importBrowserBookmarks' });
            if (!r?.success) {
                this.showStatus(r?.error || this.t('noBookmarksFound'), 'error');
                return false;
            }

            const c = (await loadDataFromIDB()) || {
                tiles: [], folders: [], notes: [], noteFolders: [], folderPasswords: {}, tombstones: {}
            };
            c.tiles = c.tiles || [];
            c.folders = c.folders || [];

            const existingFolderIds = new Set((c.folders || []).map(f => f.id));
            for (const folder of (r.folders || [])) {
                if (!existingFolderIds.has(folder.id)) c.folders.push(folder);
            }
            /* Дедупликация по URL: повторный импорт не создаёт дубли плиток */
            const existingUrls = new Set(c.tiles.map(t => t.url));
            let imported = 0;
            for (const b of (r.bookmarks || [])) {
                if (existingUrls.has(b.url)) continue;
                existingUrls.add(b.url);
                c.tiles.push(b);
                imported++;
            }

            await saveDataToIDB(c);
            this.showStatus(this.tf('importedTilesFolders', { t: imported, f: r.folders?.length || 0 }), 'success');
            await this.updateSyncSummary(true);
            return true;
        } catch (e) {
            this.showStatus(this.t('errPrefix') + e.message, 'error');
            return false;
        }
    }

    async exportToBrowser() {
        try {
            const c = (await loadDataFromIDB()) || {};
            const r = await api.runtime.sendMessage({
                action: 'exportToBrowserBookmarks',
                tiles: c.tiles || [],
                folders: c.folders || []
            });
            if (r?.success) {
                this.showStatus(this.tf('exportedCount', { n: r.count || 0 }), 'success');
                return true;
            }
            this.showStatus(r?.error || this.t('errGeneric'), 'error');
            return false;
        } catch (e) {
            this.showStatus(this.t('errPrefix') + e.message, 'error');
            return false;
        }
    }

    async exportToHTML() {
        try {
            const r = await api.runtime.sendMessage({ action: 'exportToHTML' });
            if (!r?.success) {
                this.showStatus(r?.error || this.t('errGeneric'), 'error');
                return false;
            }
            const blob = new Blob([r.html], { type: 'text/html' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = 'private-speeddial.html';
            a.click();
            URL.revokeObjectURL(a.href);
            this.showStatus(this.t('exportHtmlDone'), 'success');
            return true;
        } catch (e) {
            this.showStatus(this.t('errPrefix') + e.message, 'error');
            return false;
        }
    }

    async importFromHTML() {
        return new Promise((resolve) => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.html,.htm';
            input.onchange = async (e) => {
                const f = e.target.files[0];
                if (!f) return resolve(false);
                const text = await f.text();
                try {
                    const r = await api.runtime.sendMessage({ action: 'importFromHTML', html: text });
                    if (r?.success) {
                        this.showStatus(this.tf('importedCount', { n: r.imported }), 'success');
                        resolve(true);
                    } else {
                        this.showStatus(r?.error || this.t('noLinksFound'), 'error');
                        resolve(false);
                    }
                    await this.updateSyncSummary(true);
                } catch (err) {
                    this.showStatus(this.t('errPrefix') + err.message, 'error');
                    resolve(false);
                }
            };
            input.click();
        });
    }

    async importFromCSV() {
        return new Promise((resolve) => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.csv';
            input.onchange = async (e) => {
                const f = e.target.files[0];
                if (!f) return resolve(false);
                const text = await f.text();
                try {
                    const r = await api.runtime.sendMessage({ action: 'importFromCSV', csv: text });
                    if (r?.success) {
                        this.showStatus(this.tf('importedCount', { n: r.imported }), 'success');
                        resolve(true);
                    } else {
                        this.showStatus(r?.error || this.t('noValidUrls'), 'error');
                        resolve(false);
                    }
                    await this.updateSyncSummary(true);
                } catch (err) {
                    this.showStatus(this.t('errPrefix') + err.message, 'error');
                    resolve(false);
                }
            };
            input.click();
        });
    }

    /* ==================== Импорт FVD Speed Dial ==================== */

    async importFromFVD() {
        return new Promise((resolve) => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json,.fvd,application/json';
            input.onchange = async (e) => {
                const f = e.target.files[0];
                if (!f) return resolve(false);

                if (f.size > FVD_MAX_FILE_SIZE) {
                    this.showStatus('❌ ' + this.t('importFvdTooLarge'), 'error');
                    return resolve(false);
                }

                this.showStatus(this.t('fvdReading'), 'info');

                try {
                    const text = await f.text();
                    const fvd = JSON.parse(text);
                    const parsed = this._convertFVDData(fvd);

                    if (!parsed.success) {
                        this.showStatus('❌ ' + (parsed.error || this.t('fvdParseErr')), 'error');
                        return resolve(false);
                    }

                    const current = (await loadDataFromIDB()) || {
                        tiles: [], folders: [], notes: [], noteFolders: [], folderPasswords: {}, tombstones: {}
                    };
                    current.folders = current.folders || [];
                    current.noteFolders = current.noteFolders || [];
                    current.tiles = current.tiles || [];
                    current.notes = current.notes || [];
                    current.tombstones = current.tombstones || {};

                    const alreadyImported = current.tiles.some(t => t.id && t.id.startsWith('fvd_t_'));
                    if (alreadyImported) {
                        const ok = await DialogService.confirm(this.t('importFvdConfirmRepeat'));
                        if (!ok) { this.showStatus(this.t('importCancelled'), 'info'); return resolve(false); }
                    }

                    const stamp = Date.now();

                    const folderMap = {};
                    for (const fvdFolder of parsed.folders) {
                        const newId = `fvd_f_${fvdFolder.id}_${stamp}`;
                        folderMap[fvdFolder.id] = newId;
                        current.folders.push({
                            id: newId,
                            name: fvdFolder.name,
                            color: fvdFolder.color || '#667eea',
                            textColor: '#ffffff',
                            opacity: 100,
                            password: '',
                            parentId: ''
                        });
                    }
                    for (const fvdFolder of parsed.folders) {
                        if (!fvdFolder.parentId) continue;
                        const ourId = folderMap[fvdFolder.id];
                        const ourParentId = folderMap[fvdFolder.parentId];
                        if (ourId && ourParentId) {
                            const target = current.folders.find(x => x.id === ourId);
                            if (target) target.parentId = ourParentId;
                        }
                    }

                    const noteFolderMap = {};
                    for (const nf of parsed.noteFolders || []) {
                        const newId = `fvd_nf_${nf.id}_${stamp}`;
                        noteFolderMap[nf.id] = newId;
                        current.noteFolders.push({
                            id: newId,
                            name: nf.name,
                            color: nf.color || '#667eea',
                            textColor: '#ffffff',
                            opacity: 100,
                            password: '',
                            parentId: ''
                        });
                    }

                    let tilesImported = 0;
                    for (const t of parsed.tiles) {
                        const { _fvdId, _fvdFolderId, ...tileData } = t;
                        current.tiles.push({
                            ...tileData,
                            id: `fvd_t_${_fvdId}_${stamp}_${tilesImported}`,
                            folderId: _fvdFolderId ? (folderMap[_fvdFolderId] || '') : ''
                        });
                        tilesImported++;
                    }

                    const existingNoteKeys = new Set(
                        current.notes.map(n => `${n.title}\u0000${n.content}`)
                    );
                    let notesImported = 0;
                    let notesSkipped = 0;
                    for (const n of parsed.notes || []) {
                        const { _fvdId, _fvdNoteFolderId, ...noteData } = n;
                        const key = `${noteData.title}\u0000${noteData.content}`;
                        if (existingNoteKeys.has(key)) {
                            notesSkipped++;
                            continue;
                        }
                        existingNoteKeys.add(key);
                        current.notes.push({
                            ...noteData,
                            id: `fvd_n_${_fvdId}_${stamp}_${notesImported}`,
                            folderId: _fvdNoteFolderId ? (noteFolderMap[_fvdNoteFolderId] || '') : ''
                        });
                        notesImported++;
                    }

                    await saveDataToIDB(current);
                    await this.updateSyncSummary(true);

                    const parts = [
                        this.tf('cntTiles', { n: tilesImported }),
                        this.tf('cntFolders', { n: parsed.folders.length })
                    ];
                    if (notesImported > 0) parts.push(this.tf('cntNotes', { n: notesImported }));
                    if ((parsed.noteFolders || []).length > 0) parts.push(this.tf('cntNoteFolders', { n: parsed.noteFolders.length }));
                    if (parsed.tilesDropped > 0) parts.push(this.tf('droppedTiles', { n: parsed.tilesDropped }));
                    if (parsed.notesDropped > 0) parts.push(this.tf('droppedNotes', { n: parsed.notesDropped }));
                    if (notesSkipped > 0) parts.push(this.tf('dupNotes', { n: notesSkipped }));

                    this.showStatus(this.tf('fvdImportDone', { parts: parts.join(' · ') }), 'success');
                    logInfo('options.importFromFVD', `tiles=${tilesImported}, folders=${parsed.folders.length}, notes=${notesImported}, skipped=${notesSkipped}`);

                    resolve(true);
                } catch (err) {
                    logError('options.importFromFVD', err.message);
                    this.showStatus(this.t('fvdImportErr') + err.message, 'error');
                    resolve(false);
                }
            };
            input.click();
        });
    }

    _convertFVDData(fvd) {
        if (!fvd || typeof fvd !== 'object') {
            return { success: false, error: this.t('badJson') };
        }

        const rawDials = fvd.dials || fvd.speed_dials || fvd.bookmarks || fvd.tiles || [];
        const rawGroups = fvd.groups || fvd.folders || [];
        const rawNotes = fvd.notes || [];
        const rawNoteGroups = fvd.note_groups || fvd.noteFolders || fvd.notes_groups || [];

        if (!rawDials.length && !rawGroups.length && !rawNotes.length) {
            return { success: false, error: this.t('fvdNoData') };
        }

        const folders = rawGroups.map((g, idx) => {
            const rawParent = g.parent_id ?? g.parentId ?? g.parent ?? null;
            const parentIdStr = (rawParent !== null && rawParent !== undefined && rawParent !== '')
                ? String(rawParent)
                : '';
            return {
                id: String(g.id ?? g.group_id ?? g.uuid ?? `g_${idx}`),
                name: String(g.title || g.name || g.label || this.tf('fvdFolderN', { n: idx + 1 })),
                parentId: parentIdStr,
                color: g.color || g.background || g.background_color || '#667eea'
            };
        }).filter(f => f.id);

        const folderIds = new Set(folders.map(f => f.id));
        for (const f of folders) {
            if (f.parentId && !folderIds.has(f.parentId)) f.parentId = '';
        }
        this._breakCycles(folders, 'id', 'parentId');

        let tilesDropped = 0;
        const tiles = [];
        rawDials.forEach((d, idx) => {
            const rawUrl = String(d.url || d.href || d.link || '');
            const url = (typeof normalizeUrl === 'function') ? normalizeUrl(rawUrl) : rawUrl;
            if (!url) {
                tilesDropped++;
                return;
            }
            const rawFolder = d.group_id ?? d.groupId ?? d.group ?? d.folder_id ?? d.folderId ?? null;
            const title = String(d.title || d.name || d.label || url || this.tf('bookmarkN', { n: idx + 1 }));
            tiles.push({
                _fvdId: String(d.id ?? d.dial_id ?? `t_${idx}`),
                _fvdFolderId: (rawFolder !== null && rawFolder !== undefined && rawFolder !== '')
                    ? String(rawFolder)
                    : '',
                title,
                url,
                icon: String(d.thumbnail || d.icon || d.favicon || ''),
                bgColor: d.background_color || d.bg_color || '#4CAF50',
                textColor: d.text_color || '#ffffff',
                tags: [],
                opacity: 100,
                iconOpacity: 100,
                showTitle: true,
                bgImage: '',
                reminder: null,
                autoColor: false,
                createdAt: Number(d.created_at || d.createdAt) || Date.now(),
                updatedAt: Number(d.updated_at || d.updatedAt) || Date.now()
            });
        });

        let notesDropped = 0;
        const notes = [];
        rawNotes.forEach((n, idx) => {
            const title = String(n.title || n.name || '');
            const content = String(n.content || n.text || n.body || '');
            if (!title && !content) {
                notesDropped++;
                return;
            }
            const rawFolder = n.group_id ?? n.groupId ?? n.folder_id ?? n.folderId ?? null;
            notes.push({
                _fvdId: String(n.id ?? `n_${idx}`),
                _fvdNoteFolderId: (rawFolder !== null && rawFolder !== undefined && rawFolder !== '')
                    ? String(rawFolder)
                    : '',
                title: title || this.tf('noteN', { n: idx + 1 }),
                content,
                textColor: n.text_color || '#000000',
                color: n.background_color || n.color || '#ffeb3b',
                opacity: 100,
                createdAt: Number(n.created_at || n.createdAt) || Date.now(),
                updatedAt: Number(n.updated_at || n.updatedAt) || Date.now()
            });
        });

        const noteFolders = rawNoteGroups.map((g, idx) => ({
            id: String(g.id ?? `nf_${idx}`),
            name: String(g.title || g.name || g.label || this.tf('fvdNoteFolderN', { n: idx + 1 })),
            color: g.color || g.background || '#667eea'
        }));

        return { success: true, folders, tiles, notes, noteFolders, tilesDropped, notesDropped };
    }

    _breakCycles(items, idKey, parentKey) {
        const map = new Map();
        items.forEach(it => map.set(it[idKey], it));
        const visited = new Set();

        const dfs = (id, stack) => {
            if (stack.has(id)) {
                const it = map.get(id);
                if (it) it[parentKey] = '';
                return;
            }
            if (visited.has(id)) return;
            visited.add(id);
            stack.add(id);
            const it = map.get(id);
            if (it && it[parentKey] && map.has(it[parentKey])) {
                dfs(it[parentKey], stack);
            }
            stack.delete(id);
        };

        items.forEach(it => dfs(it[idKey], new Set()));
    }

    async exportLogs() {
        try {
            const r = await api.runtime.sendMessage({ action: 'exportLogs' });
            if (!r?.success) {
                this.showStatus(r?.error || this.t('errGeneric'), 'error');
                return false;
            }
            const blob = new Blob([JSON.stringify(r, null, 2)], { type: 'application/json' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = `speeddial-logs-${new Date().toISOString().slice(0, 10)}.json`;
            a.click();
            URL.revokeObjectURL(a.href);
            this.showStatus(this.t('logsExported'), 'success');
            return true;
        } catch (e) {
            this.showStatus(this.t('logsExportErr') + e.message, 'error');
            return false;
        }
    }

    async exportDetailedLogs() {
        try {
            this.showStatus(this.t('logsCollecting'), 'info');

            const r = await api.runtime.sendMessage({ action: 'exportDetailedLogs' });
            if (!r?.success) {
                this.showStatus(r?.error || this.t('logsCollectErr'), 'error');
                return false;
            }

            const masked = this._maskSecrets(r);
            const blob = new Blob([JSON.stringify(masked, null, 2)], { type: 'application/json' });
            const a = document.createElement('a');
            const stamp = new Date().toISOString().slice(0, 16).replace(':', '-');
            a.href = URL.createObjectURL(blob);
            a.download = `speeddial-detailed-logs-${stamp}.json`;
            a.click();
            URL.revokeObjectURL(a.href);

            this.showStatus(this.t('logsSaved'), 'success');
            logInfo('options.exportDetailedLogs', 'Файл подробных логов сохранён');
            return true;
        } catch (e) {
            logError('options.exportDetailedLogs', e.message);
            this.showStatus(this.t('logsExportErr') + e.message, 'error');
            return false;
        }
    }

    _maskSecrets(obj) {
        if (obj == null) return obj;
        if (Array.isArray(obj)) return obj.map(v => this._maskSecrets(v));
        if (typeof obj !== 'object') return obj;

        const result = {};
        for (const key of Object.keys(obj)) {
            const lower = key.toLowerCase();
            const isSecret = SECRET_KEYS.has(lower) ||
                SECRET_SUBSTRINGS.some(s => lower.indexOf(s) !== -1);

            const value = obj[key];
            if (isSecret) {
                result[key] = (typeof value === 'string' && value.length > 0) ? '***' : value;
            } else {
                result[key] = this._maskSecrets(value);
            }
        }
        return result;
    }

    /* ==================== Утилиты ==================== */

    showStatus(msg, type) {
        const el = document.getElementById('status');
        if (!el) return;
        el.textContent = msg;
        el.className = 'status ' + type;
        el.style.display = 'block';

        clearTimeout(this._statusTimer);
        const isTransient = (type === 'info');
        this._statusTimer = setTimeout(() => { el.style.display = 'none'; }, isTransient ? 3000 : 5000);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const page = new SettingsPage();
    page.init();
    window._settingsPage = page;
});