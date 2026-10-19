'use strict';

/* ============================================================
   onedrive.js — Microsoft Graph. Simple upload (до 4 МБ).
   v6.5.0: явное предупреждение о лимите размера.
   ============================================================ */

const OneDriveProvider = {
    _path(settings) {
        const folder = (settings.onedriveFolder || '').replace(/^\/|\/$/g, '');
        return folder ? `${folder}/${FILE}` : FILE;
    },

    async get(settings) {
        const path = this._path(settings);

        logDebug('onedrive.get', 'Запрос', { path });

        const r = await fetchWithTimeout(
            `https://graph.microsoft.com/v1.0/me/drive/root:/${encodeURI(path)}:/content`,
            {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${settings.onedriveAccessToken}` },
                redirect: 'follow'
            }, 20000, 3);

        if (r.status === 404) {
            logInfo('onedrive.get', 'Файл не найден');
            return null;
        }
        if (r.status === 401) throw new Error(tbg('odBadTokenExp'));
        if (r.status === 429) throw new Error(tbg('odRateLimit'));
        if (!r.ok) throw new Error(classifyHttpError({ status: r.status }));
        return r.json();
    },

    async put(data, settings) {
        const path = this._path(settings);
        const body = JSON.stringify(data);

        logDebug('onedrive.put', 'Отправка', { path, bytes: body.length });

        if (body.length > 4 * 1024 * 1024) {
            throw new Error(tbg('odTooBig', { size: (body.length / 1024 / 1024).toFixed(2) }));
        }

        const r = await fetchWithTimeout(
            `https://graph.microsoft.com/v1.0/me/drive/root:/${encodeURI(path)}:/content`,
            {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${settings.onedriveAccessToken}`,
                    'Content-Type': 'application/json'
                },
                body
            }, 25000, 3);

        if (r.status === 401) throw new Error(tbg('odBadToken'));
        if (r.status === 429) throw new Error(tbg('odRateLimit'));
        if (!r.ok) throw new Error(classifyHttpError({ status: r.status }));

        logInfo('onedrive.put', `Загружено ${body.length} байт`);
        return true;
    }
};

self.OneDriveProvider = OneDriveProvider;