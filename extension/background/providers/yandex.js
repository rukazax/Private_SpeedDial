'use strict';

/* ============================================================
   yandex.js — REST API v1. ensureFolder с GET-подтверждением.

   v6.6.0:
   - Удалён Content-Length на PUT к signed URL (forbidden header).
   - Улучшено сообщение об ошибке OAuth.
   ============================================================ */

/* v6.9.2: маркер ошибок Яндекс.Диска вместо проверки префикса сообщения */
function _yaError(key, vars) {
    const e = new Error(tbg(key, vars));
    e._yaDisk = true;
    return e;
}

const YandexProvider = {
    _path(settings) {
        const folder = (settings.yandexFolder || '').replace(/^\/|\/$/g, '');
        return folder ? `disk:/${folder}/${FILE}` : `disk:/${FILE}`;
    },

    _folderPath(settings) {
        const folder = (settings.yandexFolder || '').replace(/^\/|\/$/g, '');
        return folder ? `disk:/${folder}` : null;
    },

    _token(settings) {
        return String(settings.yandexToken || '').trim();
    },

    _headers(settings) {
        return {
            'Authorization': `OAuth ${this._token(settings)}`,
            'Accept': 'application/json'
        };
    },

    async ensureFolder(settings) {
        const folderPath = this._folderPath(settings);
        if (!folderPath) return true;

        try {
            const r = await fetchWithTimeout(
                `https://cloud-api.yandex.net/v1/disk/resources?` +
                `path=${encodeURIComponent(folderPath)}`,
                { method: 'PUT', headers: this._headers(settings) },
                10000, 2);

            if (r.ok) return true;
            if (r.status === 409) return true;
            if (r.status === 401) {
                throw _yaError('yaBadToken');
            }
            if (r.status === 403) {
                throw _yaError('yaForbidden');
            }

            logWarn('yandex.ensureFolder', `Неожиданный статус ${r.status}, проверка GET`);
            const check = await fetchWithTimeout(
                `https://cloud-api.yandex.net/v1/disk/resources?` +
                `path=${encodeURIComponent(folderPath)}&fields=name,type`,
                { method: 'GET', headers: this._headers(settings) },
                8000, 1);

            if (check.ok) return true;
            throw _yaError('yaFolderFail', { code: r.status });
        } catch (e) {
            if (e._yaDisk) throw e;
            logWarn('yandex.ensureFolder', e.message);
            throw _yaError('yaFolderErr', { msg: e.message });
        }
    },

    async get(settings) {
        if (!this._token(settings)) {
            throw _yaError('yaNoToken');
        }

        const path = this._path(settings);
        logDebug('yandex.get', 'Запрос', { path });

        const linkR = await fetchWithTimeout(
            `https://cloud-api.yandex.net/v1/disk/resources/download?` +
            `path=${encodeURIComponent(path)}`,
            { method: 'GET', headers: this._headers(settings) },
            15000, 3);

        if (linkR.status === 404) {
            logInfo('yandex.get', 'Файл не найден (404)');
            return null;
        }
        if (linkR.status === 401) throw _yaError('yaBadTokenNew');
        if (linkR.status === 403) throw _yaError('yaForbidden');
        if (!linkR.ok) throw new Error(classifyHttpError({ status: linkR.status }));

        const linkData = await linkR.json();
        if (!linkData.href) throw _yaError('yaBadResponseDl');

        const fileR = await fetchWithTimeout(linkData.href, {
            method: 'GET',
            redirect: 'follow'
        }, 25000, 3);

        if (!fileR.ok) throw new Error(classifyHttpError({ status: fileR.status }));
        return fileR.json();
    },

    async put(data, settings) {
        if (!this._token(settings)) {
            throw _yaError('yaNoToken');
        }

        const path = this._path(settings);
        const body = JSON.stringify(data);

        logDebug('yandex.put', 'Отправка', { path, bytes: body.length });

        await this.ensureFolder(settings);

        const linkR = await fetchWithTimeout(
            `https://cloud-api.yandex.net/v1/disk/resources/upload?` +
            `path=${encodeURIComponent(path)}&overwrite=true`,
            { method: 'GET', headers: this._headers(settings) },
            15000, 3);

        if (linkR.status === 401) throw _yaError('yaBadTokenNew');
        if (linkR.status === 403) throw _yaError('yaForbidden');
        if (linkR.status === 507) throw _yaError('yaNoSpace');
        if (!linkR.ok) throw new Error(classifyHttpError({ status: linkR.status }));

        const linkData = await linkR.json();
        if (!linkData.href) throw _yaError('yaBadResponseUl');

        const upR = await fetchWithTimeout(linkData.href, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body
        }, 30000, 3);

        if (!upR.ok) throw new Error(classifyHttpError({ status: upR.status }));

        logInfo('yandex.put', `Загружено ${body.length} байт`);
        return true;
    }
};

self.YandexProvider = YandexProvider;