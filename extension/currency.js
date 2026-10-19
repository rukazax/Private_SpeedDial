'use strict';

/* ============================================================
   currency.js — курсы валют + история для 24h-изменений.

   v6.6.1:
   - formatRateWithSymbol: пробел между числом и постфиксным
     символом валюты (₽, ₴, ₸, ₺, zł, Kč, kr, …).
     Префиксные ($, £, ¥, ₹, ₩, …) — без пробела.
   - In-memory cache для rate history (TTL 30s).
   - Защита от одинаковых base=target.
   ============================================================ */

const CBR_URL = 'https://www.cbr-xml-daily.ru/daily_json.js';
const OPEN_ER_URL = 'https://open.er-api.com/v6/latest/USD';
const HOST_URL = 'https://api.exchange-rate.host/latest?base=USD';

const CACHE_KEY = 'currencyCache';
const CACHE_TTL_MS = 12 * 60 * 60 * 1000;
const CACHE_TTL_WEEKEND_MS = 36 * 60 * 60 * 1000;
const OFFLINE_MS = 13 * 60 * 60 * 1000;

const RATE_HISTORY_KEY = 'currencyRateHistory';
const RATE_HISTORY_MAX = 60;
const RATE_HISTORY_MIN_GAP_MS = 30 * 60 * 1000;
const RATE_HISTORY_MEM_TTL_MS = 30 * 1000;

const CURRENCY_SYMBOLS = {
    RUB: '₽', USD: '$', EUR: '€', GBP: '£', JPY: '¥', CNY: '¥',
    KZT: '₸', UAH: '₴', BYN: 'Br', TRY: '₺', PLN: 'zł', CHF: 'Fr',
    CAD: 'C$', AUD: 'A$', NZD: 'NZ$', INR: '₹', BRL: 'R$', KRW: '₩',
    HKD: 'HK$', SGD: 'S$', CZK: 'Kč', SEK: 'kr', NOK: 'kr', DKK: 'kr',
    ILS: '₪', ZAR: 'R', MXN: 'Mex$', ARS: 'AR$', AED: 'د.إ',
    THB: '฿', IDR: 'Rp', MYR: 'RM', PHP: '₱', VND: '₫',
    RON: 'lei', HUF: 'Ft', BGN: 'лв', HRK: 'kn', ISK: 'kr',
    UZS: "so'm", AZN: '₼', GEL: '₾', AMD: '֏', KGS: 'с',
    TJS: 'ЅМ', MDL: 'L', RSD: 'дин.'
};

/* v6.6.1: постфиксные валюты — символ идёт ПОСЛЕ числа
   и отделяется пробелом (84,17 ₽, 3,45 zł, 1 200 Kč). */
const POSTFIX_CURRENCIES = new Set([
    'RUB', 'UAH', 'KZT', 'BYN', 'TRY', 'PLN', 'CZK', 'SEK', 'NOK', 'DKK',
    'RON', 'HUF', 'BGN', 'HRK', 'ISK', 'UZS', 'GEL', 'AMD', 'KGS', 'TJS',
    'MDL', 'RSD', 'ZAR', 'THB', 'IDR', 'MYR', 'PHP', 'VND', 'ARS'
]);

/* ---------- In-memory cache для rate history ---------- */

let _rateHistoryCache = null;
let _rateHistoryCacheAt = 0;

function _isWeekend() {
    const d = new Date().getDay();
    return d === 0 || d === 6;
}

function _getTtl() {
    return _isWeekend() ? CACHE_TTL_WEEKEND_MS : CACHE_TTL_MS;
}

/* ---------- Расчёт курсов ---------- */

async function fetchCurrencyRates(pairs) {
    const result = { rates: {}, updatedAt: null, offline: true };
    if (!Array.isArray(pairs) || pairs.length === 0) return result;

    const validPairs = pairs.filter(p => {
        const [base, target] = p.split('/');
        return base && target && base !== target;
    });

    if (!validPairs.length) return result;

    const needRub = validPairs.some(p => p.endsWith('/RUB'));
    const needHost = validPairs.some(p => !p.endsWith('/RUB'));

    const [cbrRes, hostRes] = await Promise.allSettled([
        needRub ? fetchCbr() : Promise.resolve(null),
        needHost ? fetchHostRates() : Promise.resolve(null)
    ]);

    const cbrData = cbrRes.status === 'fulfilled' ? cbrRes.value : null;
    const hostData = hostRes.status === 'fulfilled' ? hostRes.value : null;

    for (const pair of validPairs) {
        const [base, target] = pair.split('/');
        let rate = null;

        if (target === 'RUB' && cbrData) {
            rate = cbrRate(cbrData, base);
        } else if (hostData && hostData.rates) {
            rate = crossRate(hostData.rates, base, target);
        }

        if (rate != null && isFinite(rate) && rate > 0) {
            result.rates[pair] = rate;
        }
    }

    if (Object.keys(result.rates).length > 0) {
        result.updatedAt = Date.now();
        result.offline = false;
    }
    return result;
}

function crossRate(rates, base, target) {
    if (base === target) return null;
    if (base === 'USD') return rates[target] ?? null;
    if (target === 'USD') {
        const r = rates[base];
        return (r && r > 0) ? 1 / r : null;
    }
    const rb = rates[base];
    const rt = rates[target];
    if (rb && rt && rb > 0) return rt / rb;
    return null;
}

function cbrRate(cbr, base) {
    if (base === 'RUB') return 1;
    const v = cbr?.Valute?.[base];
    if (!v) return null;
    return v.Value / (v.Nominal || 1);
}

/* ---------- Источники ---------- */

async function fetchCbr() {
    const r = await fetchWithTimeout(CBR_URL, {}, 10000, 3);
    return r.json();
}

async function fetchHostRates() {
    try {
        const r = await fetchWithTimeout(OPEN_ER_URL, {}, 10000, 2);
        if (r.ok) {
            const j = await r.json();
            if (j && j.rates) return { rates: j.rates };
        }
    } catch (e) {}

    try {
        const r = await fetchWithTimeout(HOST_URL, {}, 10000, 1);
        if (r.ok) {
            const j = await r.json();
            if (j && j.rates) return { rates: j.rates };
        }
    } catch (e) {}

    return null;
}

/* ---------- Кеш ---------- */

async function loadCurrencyCache() {
    try {
        const stored = await chrome.storage.local.get(CACHE_KEY);
        return stored[CACHE_KEY] || null;
    } catch (e) { return null; }
}

async function saveCurrencyCache(data) {
    try {
        await chrome.storage.local.set({ [CACHE_KEY]: data });
    } catch (e) {}
}

async function loadRateHistory() {
    const now = Date.now();
    if (_rateHistoryCache && (now - _rateHistoryCacheAt) < RATE_HISTORY_MEM_TTL_MS) {
        return _rateHistoryCache;
    }
    try {
        const stored = await chrome.storage.local.get(RATE_HISTORY_KEY);
        _rateHistoryCache = Array.isArray(stored[RATE_HISTORY_KEY]) ? stored[RATE_HISTORY_KEY] : [];
        _rateHistoryCacheAt = now;
        return _rateHistoryCache;
    } catch (e) {
        _rateHistoryCache = [];
        _rateHistoryCacheAt = now;
        return _rateHistoryCache;
    }
}

async function saveRateHistory(history) {
    try {
        const trimmed = history.slice(-RATE_HISTORY_MAX);
        await chrome.storage.local.set({ [RATE_HISTORY_KEY]: trimmed });
        _rateHistoryCache = trimmed;
        _rateHistoryCacheAt = Date.now();
    } catch (e) {}
}

async function appendRateHistory(rates) {
    if (!rates || !Object.keys(rates).length) return;
    try {
        const history = await loadRateHistory();
        const last = history[history.length - 1];
        const now = Date.now();
        if (last && (now - last.ts) < RATE_HISTORY_MIN_GAP_MS) return;
        const next = history.slice();
        next.push({ ts: now, rates: { ...rates } });
        await saveRateHistory(next);
    } catch (e) {}
}

/* ---------- Публичная точка входа ---------- */

async function getCurrencySnapshot(pairs, forceRefresh = false) {
    const cache = await loadCurrencyCache();
    const now = Date.now();
    const ttl = _getTtl();
    const isFresh = cache && cache.updatedAt && (now - cache.updatedAt) < ttl;

    if (!forceRefresh && isFresh) {
        return { rates: cache.rates, updatedAt: cache.updatedAt, offline: false };
    }

    try {
        const fresh = await fetchCurrencyRates(pairs);
        if (fresh.updatedAt) {
            await saveCurrencyCache({ rates: fresh.rates, updatedAt: fresh.updatedAt });
            await appendRateHistory(fresh.rates);
            return fresh;
        }
    } catch (e) {}

    if (cache && cache.updatedAt) {
        const age = now - cache.updatedAt;
        return {
            rates: cache.rates,
            updatedAt: cache.updatedAt,
            offline: age > OFFLINE_MS
        };
    }

    return { rates: {}, updatedAt: null, offline: true };
}

/* ---------- Форматирование ---------- */

/**
 * v6.6.1: пробел перед постфиксным символом валюты.
 * "84,17" + "₽"  →  "84,17 ₽"
 * "100"   + "$"  →  "100$"   (не постфиксная — не в списке)
 * "3,45"  + "zł" →  "3,45 zł"
 */
function formatRateWithSymbol(rate, targetCurrency) {
    if (rate == null || !isFinite(rate) || rate <= 0) return '—';

    const num = rate >= 1 ? rate.toFixed(2) : rate.toFixed(4);
    const withComma = num.replace('.', ',');

    const code = String(targetCurrency || '').toUpperCase();
    const symbol = CURRENCY_SYMBOLS[code] || '';
    if (!symbol) return withComma;

    const sep = POSTFIX_CURRENCIES.has(code) ? ' ' : '';
    return withComma + sep + symbol;
}

function formatDelta(delta) {
    if (delta == null || !isFinite(delta)) return '—';
    const sign = delta >= 0 ? '+' : '-';
    return sign + Math.abs(delta).toFixed(2);
}

if (typeof self !== 'undefined') {
    self.fetchCurrencyRates = fetchCurrencyRates;
    self.getCurrencySnapshot = getCurrencySnapshot;
    self.loadRateHistory = loadRateHistory;
    self.appendRateHistory = appendRateHistory;
    self.formatRateWithSymbol = formatRateWithSymbol;
    self.formatDelta = formatDelta;
}
if (typeof window !== 'undefined') {
    window.fetchCurrencyRates = fetchCurrencyRates;
    window.getCurrencySnapshot = getCurrencySnapshot;
    window.loadRateHistory = loadRateHistory;
    window.appendRateHistory = appendRateHistory;
    window.formatRateWithSymbol = formatRateWithSymbol;
    window.formatDelta = formatDelta;
}