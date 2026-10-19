'use strict';

/* ============================================================
   logger.js — кольцевой буфер логов (1000 записей).
   v6.5.6:
   - Guard _logInitialized: logInit() выполняется один раз в контексте.
     Ранее при повторном вызове (bootstrap + onInstalled + onStartup)
     сохранённый буфер КОНКАТЕНИРОВАЛСЯ, приводя к дублям в логах.
   - При переполнении квоты storage.local буфер режется вдвое.
   ============================================================ */

const LOG_KEY = 'debugLog';
const LOG_MAX = 1000;
const LOG_LEVELS = { debug: 10, info: 20, warn: 30, error: 40 };

let _logBuffer = [];
let _logFlushTimer = null;
let _minLevel = 'info';
let _logInitialized = false;

async function logInit(minLevel = 'info') {
    _minLevel = minLevel;
    if (_logInitialized) return;
    _logInitialized = true;
    try {
        const stored = await chrome.storage.local.get(LOG_KEY);
        if (Array.isArray(stored[LOG_KEY]) && stored[LOG_KEY].length) {
            // Заменяем буфер, а НЕ конкатенируем — иначе дубли
            _logBuffer = stored[LOG_KEY].slice(-LOG_MAX);
        }
    } catch (e) { /* silent */ }
}

function log(level, fn, msg, data) {
    if (LOG_LEVELS[level] < LOG_LEVELS[_minLevel]) return;

    const entry = {
        ts: new Date().toISOString(),
        level,
        fn: fn || '?',
        msg: String(msg || ''),
        data: data !== undefined ? safeSerialize(data) : undefined
    };

    if (typeof console !== 'undefined' && console[level]) {
        console[level](`[${entry.ts}][${level}][${fn}]`, msg, data ?? '');
    }

    _logBuffer.push(entry);
    if (_logBuffer.length > LOG_MAX) _logBuffer = _logBuffer.slice(-LOG_MAX);
    scheduleFlush();
}

function safeSerialize(obj) {
    try {
        const s = JSON.stringify(obj);
        if (s && s.length > 2000) return s.slice(0, 2000) + '…';
        return JSON.parse(s);
    } catch (e) {
        return String(obj);
    }
}

function scheduleFlush() {
    if (_logFlushTimer) return;
    _logFlushTimer = setTimeout(async () => {
        _logFlushTimer = null;
        try {
            await chrome.storage.local.set({ [LOG_KEY]: _logBuffer });
        } catch (e) {
            if (_logBuffer.length > 100) {
                _logBuffer = _logBuffer.slice(-Math.floor(_logBuffer.length / 2));
                try { await chrome.storage.local.set({ [LOG_KEY]: _logBuffer }); } catch (e2) {}
            }
        }
    }, 500);
}

const logDebug = (fn, msg, data) => log('debug', fn, msg, data);
const logInfo = (fn, msg, data) => log('info', fn, msg, data);
const logWarn = (fn, msg, data) => log('warn', fn, msg, data);
const logError = (fn, msg, data) => log('error', fn, msg, data);

async function logDump() {
    return _logBuffer.slice();
}

function getRecentErrors(limit = 20) {
    const errors = [];
    for (let i = _logBuffer.length - 1; i >= 0 && errors.length < limit; i--) {
        if (_logBuffer[i].level === 'error') errors.push(_logBuffer[i]);
    }
    return errors;
}

if (typeof self !== 'undefined' && self.addEventListener) {
    self.addEventListener('error', (e) => {
        log('error', 'global.onerror', e.message || 'unknown', {
            filename: e.filename, lineno: e.lineno, colno: e.colno
        });
    });
    self.addEventListener('unhandledrejection', (e) => {
        log('error', 'global.unhandledrejection', String(e.reason));
    });
}

if (typeof self !== 'undefined') {
    self.logInit = logInit;
    self.logDebug = logDebug;
    self.logInfo = logInfo;
    self.logWarn = logWarn;
    self.logError = logError;
    self.logDump = logDump;
    self.getRecentErrors = getRecentErrors;
}