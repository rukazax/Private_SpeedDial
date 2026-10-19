'use strict';

const api = chrome;

/* ============================================================
   popup.js — маленькое окно действий.

   v6.6.0:
   - Кнопка «Синхронизировать» обрабатывает needsResolve:
     если первая синхронизация с конфликтом, открывает options.html,
     где доступен полный диалог выбора стратегии.
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
    attachButtonFeedback(document);

    const statusElement = document.getElementById('status');

    /* v6.9.0: язык интерфейса (язык браузера, фолбэк en) */
    let _lang = 'en';
    const t = (key) => translateKey(_lang, key);
    api.storage.sync.get(['forcedLanguage'], (stored) => {
        _lang = resolveUILanguage(stored && stored.forcedLanguage);
        applyI18n(_lang);
    });

    function showStatus(msg, type, timeout = 3000) {
        statusElement.className = 'status ' + type;
        statusElement.textContent = msg;
        statusElement.style.display = 'block';
        if (timeout) setTimeout(() => { statusElement.style.display = 'none'; }, timeout);
    }

    api.runtime.sendMessage({ action: 'getProfiles' }, (response) => {
        if (response && response.success) {
            const select = document.getElementById('profileSelect');
            select.innerHTML = '';
            const opt0 = document.createElement('option');
            opt0.value = '';
            opt0.textContent = t('popupProfile');
            select.appendChild(opt0);
            response.profiles.forEach(profile => {
                const option = document.createElement('option');
                option.value = profile;
                option.textContent = profile;
                if (profile === response.active) option.selected = true;
                select.appendChild(option);
            });
        }
    });

    document.getElementById('openSpeedDial').addEventListener('click', (e) => {
        flashButtonFeedback(e.currentTarget, 'success');
        api.tabs.create({ url: api.runtime.getURL('newtab.html') });
        setTimeout(() => window.close(), 200);
    });

    document.getElementById('syncButton').addEventListener('click', async (e) => {
        const btn = e.currentTarget;
        flashButtonFeedback(btn);
        setButtonLoading(btn, true);
        showStatus(t('popupSyncing'), 'info', 0);

        try {
            const r = await api.runtime.sendMessage({ action: 'syncNow', syncType: 'merge' });

            /* v6.6.0: конфликт первой синхронизации */
            if (r && r.needsResolve) {
                flashButtonFeedback(btn, 'success');

                const c = r.conflicts || {};
                const onlyLocal = c.onlyLocal || {};
                const onlyServer = c.onlyServer || {};

                const parts = [];
                if (onlyLocal.total) parts.push(`${t('popupConflictLocal')}: ${onlyLocal.total}`);
                if (onlyServer.total) parts.push(`${t('popupConflictServer')}: ${onlyServer.total}`);

                showStatus(
                    t('popupConflict').replace('{parts}', parts.join(', ') || t('popupConflictDiff')),
                    'info', 2500
                );

                setTimeout(async () => {
                    try {
                        await api.runtime.sendMessage({ action: 'openOptionsAsPopup' });
                    } catch (err) {
                        api.tabs.create({ url: api.runtime.getURL('options.html') });
                    }
                    setTimeout(() => window.close(), 300);
                }, 1200);
                return;
            }

            if (r && r.success) {
                flashButtonFeedback(btn, 'success');
                showStatus(t('popupMerged'), 'success');
            } else if (r && r.retryIn) {
                flashButtonFeedback(btn, 'error');
                showStatus(t('popupWait').replace('{n}', r.retryIn), 'info');
            } else {
                flashButtonFeedback(btn, 'error');
                throw new Error(r?.error || t('popupErrorFallback'));
            }
        } catch (err) {
            flashButtonFeedback(btn, 'error');
            showStatus('❌ ' + err.message, 'error');
        } finally {
            setButtonLoading(btn, false);
        }
    });

    document.getElementById('lockButton').addEventListener('click', async (e) => {
        const btn = e.currentTarget;
        flashButtonFeedback(btn);

        try {
            const r = await api.runtime.sendMessage({ action: 'lockNow' });
            if (r && r.skipped) {
                flashButtonFeedback(btn, 'success');
                showStatus('ℹ️ ' + t('noPassword'), 'info', 3000);
            } else if (r && r.success) {
                flashButtonFeedback(btn, 'success');
                showStatus(t('popupLocked'), 'success');
                setTimeout(() => window.close(), 500);
            } else {
                flashButtonFeedback(btn, 'error');
                showStatus('❌ ' + (r?.error || t('popupErrorFallback')), 'error');
            }
        } catch (err) {
            flashButtonFeedback(btn, 'error');
            showStatus('❌ ' + err.message, 'error');
        }
    });

    document.getElementById('profileSelect').addEventListener('change', async (e) => {
        const profile = e.target.value;
        if (!profile) return;
        try {
            const r = await api.runtime.sendMessage({ action: 'switchProfile', profileName: profile });
            if (r && r.success) showStatus(t('popupProfileActivated').replace('{name}', profile), 'success');
            else throw new Error(r?.error || t('popupErrorFallback'));
        } catch (err) {
            showStatus('❌ ' + err.message, 'error');
        }
    });

    document.getElementById('settingsButton').addEventListener('click', (e) => {
        flashButtonFeedback(e.currentTarget, 'success');
        api.runtime.sendMessage({ action: 'openOptionsAsPopup' }).catch(() => {});
        setTimeout(() => window.close(), 200);
    });
});