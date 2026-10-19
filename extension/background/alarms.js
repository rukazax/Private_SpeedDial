'use strict';

/* ============================================================
   alarms.js — sync по расписанию, курс валют, автосмена фонов,
   автоблокировка по бездействию в БРАУЗЕРЕ.

   v6.6.0:
   - _checkAutoLock: если последняя активность обновлена менее
     чем ACTIVITY_THROTTLE_MS назад, не блокируем — защита от
     race между троттлингом markBrowserActivity и минутным алармом.
   - markBrowserActivity: троттлинг снижен до 3 сек.
   ============================================================ */

let _alarmsDebounceTimer = null;
let _alarmsPendingResolvers = [];

const AUTOLOCK_CHECK_PERIOD_MIN = 1;
const ACTIVITY_THROTTLE_MS = 3000;
let _lastActivityWriteAt = 0;

async function setupAlarms() {
    return new Promise(resolve => {
        _alarmsPendingResolvers.push(resolve);
        if (_alarmsDebounceTimer) clearTimeout(_alarmsDebounceTimer);

        _alarmsDebounceTimer = setTimeout(async () => {
            _alarmsDebounceTimer = null;

            let done = false;
            try {
                await _doSetupAlarms();
                done = true;
            } catch (e) {
                logError('alarms.setupAlarms', e.message);
            } finally {
                const resolvers = _alarmsPendingResolvers.slice();
                _alarmsPendingResolvers = [];
                resolvers.forEach(r => { try { r(done); } catch (e) {} });
            }
        }, 2000);
    });
}

async function _doSetupAlarms() {
    const settings = await getCachedSettings();

    await api.alarms.clear('syncAlarm');
    if (settings.autoSync && settings.syncInterval >= 5) {
        const period = Math.max(5, parseInt(settings.syncInterval) || 60);
        api.alarms.create('syncAlarm', { periodInMinutes: period });
        logInfo('alarms._doSetupAlarms', `syncAlarm каждые ${period} мин`);
    } else {
        logInfo('alarms._doSetupAlarms', 'Автосинхронизация отключена');
    }

    await api.alarms.clear('currencyRefresh');
    api.alarms.create('currencyRefresh', { periodInMinutes: 12 * 60 });
    logInfo('alarms._doSetupAlarms', 'currencyRefresh каждые 12 часов');

    await api.alarms.clear('autoLock');

    await setupBackgroundRotation();
    await setupAutoLock();
}

async function setupBackgroundRotation() {
    await api.alarms.clear('bgRotate');
    const settings = await getCachedSettings();

    const list = settings.backgrounds || [];
    if (settings.bgRotateEnabled && list.length > 1) {
        const interval = Math.max(5, parseInt(settings.bgRotateInterval) || 30);
        api.alarms.create('bgRotate', { periodInMinutes: interval });
        logInfo('alarms.setupBackgroundRotation', `bgRotate каждые ${interval} мин`);
    }
}

async function rotateBackground() {
    try {
        const settings = await getCachedSettings();
        const list = settings.backgrounds || [];
        if (list.length < 2) return;

        let nextIndex;
        if (settings.bgRotateMode === 'random') {
            nextIndex = Math.floor(Math.random() * list.length);
        } else {
            const curIdx = list.findIndex(b => b.id === settings.activeBackgroundId);
            nextIndex = (curIdx + 1) % list.length;
        }

        const next = list[nextIndex];
        await api.storage.sync.set({ activeBackgroundId: next.id, settingsUpdatedAt: Date.now() });
        logInfo('alarms.rotateBackground', `Фон: ${next.name || next.id}`);
    } catch (e) {
        logError('alarms.rotateBackground', e.message);
    }
}

async function markBrowserActivity() {
    const now = Date.now();
    if (now - _lastActivityWriteAt < ACTIVITY_THROTTLE_MS) return;
    _lastActivityWriteAt = now;
    try {
        await api.storage.local.set({ lastBrowserActivityAt: now });
    } catch (e) {
        logDebug('alarms.markBrowserActivity', e.message);
    }
}

async function _markSessionLocked() {
    try {
        if (api.storage.session) {
            await api.storage.session.set({ locked: true });
        }
    } catch (e) {
        logDebug('alarms._markSessionLocked', e.message);
    }
}

async function setupAutoLock() {
    await api.alarms.clear('autoLock');
    await api.alarms.clear('autoLockCheck');

    const settings = await getCachedSettings();
    const timeout = parseInt(settings.autoLockTimeout) || 0;

    if (timeout <= 0) {
        logDebug('alarms.setupAutoLock', 'Автоблокировка отключена');
        return;
    }

    const lockData = await api.storage.local.get(['masterPasswordHash', 'masterPasswordRecord']);
    const hasPassword = !!(lockData.masterPasswordRecord || lockData.masterPasswordHash);
    if (!hasPassword) {
        logInfo('alarms.setupAutoLock', 'Пароль не задан — блокировка не применяется');
        return;
    }

    const stored = await api.storage.local.get('lastBrowserActivityAt');
    if (!stored.lastBrowserActivityAt) {
        await api.storage.local.set({ lastBrowserActivityAt: Date.now() });
    }

    api.alarms.create('autoLockCheck', { periodInMinutes: AUTOLOCK_CHECK_PERIOD_MIN });
    logInfo('alarms.setupAutoLock', `Проверка каждую минуту, timeout ${timeout} мин`);
}

async function _checkAutoLock() {
    const settings = await getCachedSettings();
    const timeout = parseInt(settings.autoLockTimeout) || 0;
    if (timeout <= 0) return;

    const lockData = await api.storage.local.get(['masterPasswordHash', 'masterPasswordRecord']);
    const hasPassword = !!(lockData.masterPasswordRecord || lockData.masterPasswordHash);
    if (!hasPassword) return;

    const stored = await api.storage.local.get('lastBrowserActivityAt');
    const last = stored.lastBrowserActivityAt || 0;
    const age = Date.now() - last;

    // v6.6.0: защита от race. Если активность обновлялась
    // меньше ACTIVITY_THROTTLE_MS*2 назад — считаем её свежей.
    if (Date.now() - _lastActivityWriteAt < ACTIVITY_THROTTLE_MS * 2) return;

    if (age >= timeout * 60 * 1000) {
        await api.storage.local.set({ lastBrowserActivityAt: Date.now() });
        await _markSessionLocked();
        notifyTabs('lockNow');
        logInfo('alarms._checkAutoLock', `Бездействие в браузере ${Math.round(age / 1000)} с → блокировка`);
    }
}

async function extendAutoLock() {
    await markBrowserActivity();
    return { success: true };
}

async function refreshCurrencyIfNeeded(force = false) {
    try {
        const settings = await getCachedSettings();
        if (!settings.currencyWidget && !force) {
            logDebug('alarms.refreshCurrency', 'Виджет курса выключен, пропуск');
            return;
        }

        const pairs = settings.currencyPairs || ['USD/RUB', 'EUR/RUB'];
        const snapshot = await getCurrencySnapshot(pairs, force);

        if (snapshot.offline) {
            logWarn('alarms.refreshCurrency', 'Курсы недоступны (offline)');
        } else {
            logInfo('alarms.refreshCurrency', `Обновлено пар: ${Object.keys(snapshot.rates).length}`);
        }

        notifyTabs('currencyUpdated', { snapshot });
    } catch (e) {
        logError('alarms.refreshCurrency', e.message);
    }
}

api.alarms.onAlarm.addListener(async (alarm) => {
    logDebug('alarms.onAlarm', `Сработал: ${alarm.name}`);

    try {
        if (alarm.name === 'syncAlarm') {
            const settings = await getCachedSettings();
            if (settings.autoSync && validateSettings(settings)) {
                await syncData('merge');
            }
        } else if (alarm.name === 'currencyRefresh') {
            await refreshCurrencyIfNeeded(true);
        } else if (alarm.name === 'bgRotate') {
            await rotateBackground();
        } else if (alarm.name === 'autoLockCheck') {
            await _checkAutoLock();
        } else if (alarm.name.startsWith('reminder_')) {
            await api.alarms.clear(alarm.name);
        }
    } catch (e) {
        logError('alarms.onAlarm', e.message, { alarm: alarm.name });
    }
});

self.setupAlarms = setupAlarms;
self.setupBackgroundRotation = setupBackgroundRotation;
self.setupAutoLock = setupAutoLock;
self.extendAutoLock = extendAutoLock;
self.rotateBackground = rotateBackground;
self.refreshCurrencyIfNeeded = refreshCurrencyIfNeeded;
self.markBrowserActivity = markBrowserActivity;