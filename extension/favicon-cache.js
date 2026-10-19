'use strict';

/* ============================================================
   favicon-cache.js — кеш favicon с LRU по timestamp.
   v6.5.0: cleanup при закрытии SW не блокируется.
   ============================================================ */

const FAVICON_CACHE = 'favicon-v2';
const FAVICON_OLD_CACHE = 'favicon-cache-v1';
const FAVICON_MAX = 2000;

let _faviconInitDone = false;
let _cleanupRunning = false;

async function faviconCacheInit() {
    if (_faviconInitDone) return;
    _faviconInitDone = true;
    try {
        await caches.delete(FAVICON_OLD_CACHE);
    } catch (e) {}
}

async function getCachedFavicon(url, source) {
    await faviconCacheInit();

    const host = safeHostname(url);
    if (!host) return '';

    /* Локальный источник — пробуем /favicon.ico на самом сайте.
       Никаких внешних сервисов: домены закладок никуда не утекают.
       Возвращает '' при недоступности — вызывающий код покажет букву. */
    if (source === 'local') {
        const localUrl = getLocalFaviconUrl(url);
        if (!localUrl) return '';
        const cacheKey = `favicon-local::${host}`;
        const metaKey = `favicon-meta::${host}`;
        try {
            const cache = await caches.open(FAVICON_CACHE);
            const hit = await cache.match(cacheKey);
            if (hit) {
                await cache.put(metaKey, new Response(String(Date.now()), { headers: { 'Content-Type': 'text/plain' } }));
                return localUrl;
            }
            const resp = await fetchWithTimeout(localUrl, { mode: 'no-cors', cache: 'force-cache' }, 5000, 1);
            if (resp && (resp.ok || resp.type === 'opaque')) {
                await cache.put(cacheKey, resp.clone());
                await cache.put(metaKey, new Response(String(Date.now()), { headers: { 'Content-Type': 'text/plain' } }));
                scheduleFaviconCleanup();
                return localUrl;
            }
            return '';
        } catch (e) {
            return '';
        }
    }

    const faviconUrl = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=64`;
    const cacheKey = `favicon::${host}`;
    const metaKey = `favicon-meta::${host}`;

    try {
        const cache = await caches.open(FAVICON_CACHE);
        const hit = await cache.match(cacheKey);
        if (hit) {
            const metaResp = new Response(String(Date.now()), {
                headers: { 'Content-Type': 'text/plain' }
            });
            await cache.put(metaKey, metaResp);
            return faviconUrl;
        }

        /* Таймаут обязателен: без сети fetch может висеть бесконечно
           и блокировать сохранение плитки */
        const resp = await fetchWithTimeout(faviconUrl, { mode: 'no-cors', cache: 'force-cache' }, 5000, 1);
        if (resp && (resp.ok || resp.type === 'opaque')) {
            await cache.put(cacheKey, resp.clone());
            const metaResp = new Response(String(Date.now()), {
                headers: { 'Content-Type': 'text/plain' }
            });
            await cache.put(metaKey, metaResp);
            scheduleFaviconCleanup();
        }
        return faviconUrl;
    } catch (e) {
        return faviconUrl;
    }
}

async function scheduleFaviconCleanup() {
    if (_cleanupRunning) return;
    _cleanupRunning = true;
    try {
        const cache = await caches.open(FAVICON_CACHE);
        const keys = await cache.keys();
        if (keys.length <= FAVICON_MAX * 2) return;

        const metas = [];
        for (const k of keys) {
            if (!k.url.includes('favicon-meta::')) continue;
            try {
                const resp = await cache.match(k);
                const ts = parseInt(await resp.text(), 10) || 0;
                metas.push({ key: k.url, ts });
            } catch (e) {}
        }

        if (metas.length <= FAVICON_MAX) return;
        metas.sort((a, b) => a.ts - b.ts);

        const removeCount = metas.length - FAVICON_MAX;
        for (let i = 0; i < removeCount; i++) {
            const metaUrl = metas[i].key;
            await cache.delete(metaUrl);
            const hostPart = metaUrl.split('favicon-meta::')[1];
            if (hostPart) await cache.delete(`favicon::${hostPart}`);
        }
    } catch (e) {
    } finally {
        _cleanupRunning = false;
    }
}

async function clearFaviconCache() {
    try {
        await caches.delete(FAVICON_CACHE);
    } catch (e) {}
}

if (typeof self !== 'undefined') {
    self.getCachedFavicon = getCachedFavicon;
    self.clearFaviconCache = clearFaviconCache;
    self.faviconCacheInit = faviconCacheInit;
    self.scheduleFaviconCleanup = scheduleFaviconCleanup;
}
if (typeof window !== 'undefined') {
    window.getCachedFavicon = getCachedFavicon;
    window.clearFaviconCache = clearFaviconCache;
}