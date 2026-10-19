'use strict';

/* ============================================================
   box.js — требует существующий файл (boxFileId).
   GET /files/{id}/content, PUT через upload.box.com (multipart).
   v6.5.0: улучшенные сообщения об ошибках.
   ============================================================ */

const BoxProvider = {
    async get(settings) {
        if (!settings.boxFileId) {
            throw new Error(tbg('boxNoFileId'));
        }

        logDebug('box.get', 'Запрос', { fileId: settings.boxFileId });

        const r = await fetchWithTimeout(
            `https://api.box.com/2.0/files/${encodeURIComponent(settings.boxFileId)}/content`,
            {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${settings.boxAccessToken}` }
            }, 20000, 3);

        if (r.status === 404) {
            logInfo('box.get', 'Файл не найден');
            return null;
        }
        if (r.status === 401) throw new Error(tbg('boxBadToken'));
        if (!r.ok) throw new Error(classifyHttpError({ status: r.status }));
        return r.json();
    },

    async put(data, settings) {
        if (!settings.boxFileId) {
            throw new Error(tbg('boxNoFileId'));
        }

        const body = JSON.stringify(data);
        const form = new FormData();
        form.append('file', new Blob([body], { type: 'application/json' }), FILE);

        logDebug('box.put', 'Отправка', { fileId: settings.boxFileId, bytes: body.length });

        const r = await fetchWithTimeout(
            `https://upload.box.com/api/2.0/files/${encodeURIComponent(settings.boxFileId)}/content`,
            {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${settings.boxAccessToken}` },
                body: form
            }, 25000, 3);

        if (r.status === 401) throw new Error(tbg('boxBadToken'));
        if (r.status === 409) throw new Error(tbg('boxConflict'));
        if (!r.ok) throw new Error(classifyHttpError({ status: r.status }));

        logInfo('box.put', `Загружено ${body.length} байт`);
        return true;
    }
};

self.BoxProvider = BoxProvider;