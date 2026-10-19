'use strict';

/* ============================================================
   webdav.js — база для Synology, Nextcloud.

   v6.6.0:
   - Удалён Content-Length (forbidden header в fetch).
   - Компактнее обработка ошибок.
   ============================================================ */

const WebDAVProvider = {
    async get(url, user, pass, path = '') {
        const cleanUrl = url.replace(/\/$/, '');
        const cleanPath = path ? `/${path.replace(/^\/|\/$/g, '')}` : '';
        const fullUrl = `${cleanUrl}${cleanPath}/${FILE}`;

        logDebug('webdav.get', 'Запрос', { url: fullUrl });

        const r = await fetchWithTimeout(fullUrl, {
            method: 'GET',
            headers: {
                'Authorization': 'Basic ' + b64Unicode(`${user}:${pass || ''}`),
                'Accept': 'application/json'
            }
        }, 15000, 3);

        if (r.status === 404) {
            logInfo('webdav.get', 'Файл не найден (404)');
            return null;
        }
        if (!r.ok) {
            const err = new Error(classifyHttpError({ status: r.status }));
            err.status = r.status;
            throw err;
        }
        return r.json();
    },

    async put(data, url, user, pass, path = '') {
        const cleanUrl = url.replace(/\/$/, '');
        const cleanPath = path ? `/${path.replace(/^\/|\/$/g, '')}` : '';
        const fullUrl = `${cleanUrl}${cleanPath}/${FILE}`;
        const body = JSON.stringify(data);

        logDebug('webdav.put', 'Отправка', { url: fullUrl, bytes: body.length });

        const r = await fetchWithTimeout(fullUrl, {
            method: 'PUT',
            headers: {
                'Authorization': 'Basic ' + b64Unicode(`${user}:${pass || ''}`),
                'Content-Type': 'application/json'
            },
            body
        }, 20000, 3);

        if (!r.ok) {
            const err = new Error(classifyHttpError({ status: r.status }));
            err.status = r.status;
            throw err;
        }

        logInfo('webdav.put', `Загружено ${body.length} байт`);
        return true;
    },

    async ping(url, user, pass) {
        const cleanUrl = url.replace(/\/$/, '');
        try {
            const r = await fetchWithTimeout(cleanUrl, {
                method: 'PROPFIND',
                headers: {
                    'Authorization': 'Basic ' + b64Unicode(`${user}:${pass || ''}`),
                    'Depth': '0'
                }
            }, 8000, 1);
            return r.status === 207 || r.status === 200;
        } catch (e) {
            logWarn('webdav.ping', e.message);
            return false;
        }
    }
};

self.WebDAVProvider = WebDAVProvider;