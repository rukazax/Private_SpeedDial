'use strict';

/* ============================================================
   mailru.js — WebDAV с Basic-auth + кеш MKCOL.

   v6.6.0:
   - Удалён заголовок Content-Length: forbidden header в fetch,
     молча выкидывается браузером. Функционально ничего не менялось,
     но код стал чище.
   - Инвалидация кеша MKCOL при ошибке PUT.
   ============================================================ */

const MAILRU_CACHE_KEY = 'mailruFolderCache';

const MailruProvider = {
    _baseUrl(settings) {
        const folder = (settings.mailruFolder || '').replace(/^\/|\/$/g, '');
        return folder
            ? `https://webdav.cloud.mail.ru/${folder}`
            : 'https://webdav.cloud.mail.ru';
    },

    _authHeader(settings) {
        const email = String(settings.mailruEmail || '').trim();
        return 'Basic ' + b64Unicode(`${email}:${settings.mailruPassword}`);
    },

    async ensureFolder(settings) {
        const email = String(settings.mailruEmail || '').trim();
        const folder = (settings.mailruFolder || '').replace(/^\/|\/$/g, '');
        if (!email || !folder) return;

        try {
            const stored = await api.storage.local.get(MAILRU_CACHE_KEY);
            const cache = stored[MAILRU_CACHE_KEY] || {};
            if (cache.email === email && cache.folder === folder && cache.exists) {
                logDebug('mailru.ensureFolder', 'Папка уже подтверждена (кеш)');
                return;
            }
        } catch (e) {}

        try {
            const r = await fetchWithTimeout(
                this._baseUrl(settings),
                {
                    method: 'MKCOL',
                    headers: { 'Authorization': this._authHeader(settings) }
                }, 10000, 1);

            if (r.ok || r.status === 405 || r.status === 409) {
                await api.storage.local.set({
                    [MAILRU_CACHE_KEY]: { email, folder, exists: true }
                });
                logInfo('mailru.ensureFolder', `Папка подтверждена (status ${r.status})`);
            } else {
                logWarn('mailru.ensureFolder', `Неожиданный статус ${r.status}`);
            }
        } catch (e) {
            logWarn('mailru.ensureFolder', e.message);
        }
    },

    async resetCache() {
        try {
            await api.storage.local.remove(MAILRU_CACHE_KEY);
            logInfo('mailru.resetCache', 'Кеш папки сброшен');
        } catch (e) {}
    },

    async get(settings) {
        const email = String(settings.mailruEmail || '').trim();
        if (!email || !settings.mailruPassword) {
            throw new Error(tbg('mailruNoCreds'));
        }

        const fullUrl = `${this._baseUrl(settings)}/${FILE}`;
        logDebug('mailru.get', 'Запрос', { url: fullUrl });

        const r = await fetchWithTimeout(fullUrl, {
            method: 'GET',
            headers: {
                'Authorization': this._authHeader(settings),
                'Accept': 'application/json'
            }
        }, 15000, 3);

        if (r.status === 404) {
            logInfo('mailru.get', 'Файл не найден (404)');
            return null;
        }
        if (r.status === 401) {
            throw new Error(tbg('mailruBadCreds'));
        }
        if (!r.ok) throw new Error(classifyHttpError({ status: r.status }));
        return r.json();
    },

    async put(data, settings) {
        const email = String(settings.mailruEmail || '').trim();
        if (!email || !settings.mailruPassword) {
            throw new Error(tbg('mailruNoCreds'));
        }

        const baseUrl = this._baseUrl(settings);
        const fullUrl = `${baseUrl}/${FILE}`;
        const body = JSON.stringify(data);
        const auth = this._authHeader(settings);

        await this.ensureFolder(settings);

        logDebug('mailru.put', 'Отправка', { url: fullUrl, bytes: body.length });

        const r = await fetchWithTimeout(fullUrl, {
            method: 'PUT',
            headers: {
                'Authorization': auth,
                'Content-Type': 'application/json'
            },
            body
        }, 25000, 3);

        if (r.status === 401) {
            throw new Error(tbg('mailruBadCreds'));
        }
        if (r.status === 404 || r.status === 409) {
            logWarn('mailru.put', `Статус ${r.status} — сброс кеша MKCOL и повтор`);
            await this.resetCache();
            await this.ensureFolder(settings);

            const retryR = await fetchWithTimeout(fullUrl, {
                method: 'PUT',
                headers: {
                    'Authorization': auth,
                    'Content-Type': 'application/json'
                },
                body
            }, 25000, 3);

            if (retryR.ok) {
                logInfo('mailru.put', `Загружено после сброса кеша: ${body.length} байт`);
                return true;
            }
            throw new Error(classifyHttpError({ status: retryR.status }));
        }
        if (r.status === 507) throw new Error(tbg('mailruNoSpace'));
        if (!r.ok) throw new Error(classifyHttpError({ status: r.status }));

        logInfo('mailru.put', `Загружено ${body.length} байт`);
        return true;
    }
};

self.MailruProvider = MailruProvider;