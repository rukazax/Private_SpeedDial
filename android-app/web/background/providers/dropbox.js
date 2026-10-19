'use strict';

/* ============================================================
   dropbox.js — Content API (upload/download).
   v6.5.0: без изменений логики.
   ============================================================ */

const DropboxProvider = {
    async get(settings) {
        const path = `${(settings.dropboxFolder || '').replace(/\/$/, '')}/${FILE}`;
        logDebug('dropbox.get', 'Запрос', { path });

        const r = await fetchWithTimeout('https://content.dropboxapi.com/2/files/download', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${settings.dropboxAccessToken}`,
                'Dropbox-API-Arg': JSON.stringify({ path })
            }
        }, 20000, 3);

        if (r.status === 409) {
            logInfo('dropbox.get', 'Файл не найден (409)');
            return null;
        }
        if (r.status === 401) throw new Error(tbg('dbBadToken'));
        if (r.status === 429) throw new Error(tbg('dbRateLimit'));
        if (!r.ok) throw new Error(classifyHttpError({ status: r.status }));
        return r.json();
    },

    async put(data, settings) {
        const path = `${(settings.dropboxFolder || '').replace(/\/$/, '')}/${FILE}`;
        const body = JSON.stringify(data);

        logDebug('dropbox.put', 'Отправка', { path, bytes: body.length });

        const r = await fetchWithTimeout('https://content.dropboxapi.com/2/files/upload', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${settings.dropboxAccessToken}`,
                'Content-Type': 'application/octet-stream',
                'Dropbox-API-Arg': JSON.stringify({
                    path,
                    mode: 'overwrite',
                    autorename: false,
                    mute: true,
                    strict_conflict: false
                })
            },
            body
        }, 20000, 3);

        if (r.status === 401) throw new Error(tbg('dbBadToken'));
        if (r.status === 429) throw new Error(tbg('dbRateLimit'));
        if (!r.ok) throw new Error(classifyHttpError({ status: r.status }));

        logInfo('dropbox.put', `Загружено ${body.length} байт`);
        return true;
    }
};

self.DropboxProvider = DropboxProvider;