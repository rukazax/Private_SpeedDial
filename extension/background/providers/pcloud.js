'use strict';

/* ============================================================
   pcloud.js — API v1: getfilelink + uploadfile + createfolder.
   v6.6.0:
   - Автосоздание папки перед upload (pCloud не создаёт её сам).
   - Кеш подтверждённой папки в storage.local.
   ============================================================ */

const PCLOUD_CACHE_KEY = 'pcloudFolderCache';

const PCloudProvider = {
    async _ensureFolder(settings) {
        const folder = (settings.pcloudFolder || '').replace(/\/$/, '');
        if (!folder) return;

        try {
            const stored = await api.storage.local.get(PCLOUD_CACHE_KEY);
            const cache = stored[PCLOUD_CACHE_KEY] || {};
            if (cache.folder === folder && cache.exists) {
                logDebug('pcloud._ensureFolder', 'Папка уже подтверждена (кеш)');
                return;
            }
        } catch (e) {}

        const url = `https://api.pcloud.com/createfolder?` +
            `path=${encodeURIComponent(folder)}&` +
            `access_token=${encodeURIComponent(settings.pcloudAccessToken)}`;

        try {
            const r = await fetchWithTimeout(url, {}, 10000, 2);
            const data = await r.json().catch(() => ({}));
            // result 0 — успех, 2004 — уже существует
            if (data.result === 0 || data.result === 2004 || data.result === undefined) {
                await api.storage.local.set({
                    [PCLOUD_CACHE_KEY]: { folder, exists: true }
                });
                logInfo('pcloud._ensureFolder', `Папка подтверждена (result ${data.result})`);
            } else {
                logWarn('pcloud._ensureFolder', `Неожиданный result: ${data.result} ${data.error || ''}`);
            }
        } catch (e) {
            logWarn('pcloud._ensureFolder', e.message);
        }
    },

    async resetCache() {
        try { await api.storage.local.remove(PCLOUD_CACHE_KEY); } catch (e) {}
    },

    async get(settings) {
        const path = `${(settings.pcloudFolder || '').replace(/\/$/, '')}/${FILE}`;

        logDebug('pcloud.get', 'Запрос', { path });

        const linkR = await fetchWithTimeout(
            `https://api.pcloud.com/getfilelink?` +
            `path=${encodeURIComponent(path)}&` +
            `access_token=${encodeURIComponent(settings.pcloudAccessToken)}`,
            {}, 15000, 3);

        if (!linkR.ok) throw new Error(classifyHttpError({ status: linkR.status }));

        const linkData = await linkR.json();
        if (linkData.result === 2004 || linkData.result === 2002) {
            logInfo('pcloud.get', 'Файл не найден');
            return null;
        }
        if (linkData.result !== 0 && linkData.result !== undefined) {
            throw new Error(tbg('pcErr', { err: linkData.error || (tbg('codePrefix') + linkData.result) }));
        }

        if (!linkData.hosts || !linkData.hosts.length || !linkData.path) {
            throw new Error(tbg('pcBadLink'));
        }

        const fileR = await fetchWithTimeout(
            `https://${linkData.hosts[0]}${linkData.path}`,
            {}, 20000, 3);

        if (!fileR.ok) throw new Error(classifyHttpError({ status: fileR.status }));
        return fileR.json();
    },

    async put(data, settings) {
        const path = (settings.pcloudFolder || '').replace(/\/$/, '');
        const body = JSON.stringify(data);

        logDebug('pcloud.put', 'Отправка', { path, bytes: body.length });

        await this._ensureFolder(settings);

        const form = new FormData();
        form.append('file', new Blob([body], { type: 'application/json' }), FILE);

        const r = await fetchWithTimeout(
            `https://api.pcloud.com/uploadfile?` +
            `path=${encodeURIComponent(path)}&` +
            `filename=${encodeURIComponent(FILE)}&` +
            `access_token=${encodeURIComponent(settings.pcloudAccessToken)}&` +
            `mode=overwrite`,
            { method: 'POST', body: form }, 25000, 3);

        if (!r.ok) throw new Error(classifyHttpError({ status: r.status }));

        const json = await r.json();
        if (json.result !== 0 && json.result !== undefined) {
            // 2005 = directory does not exist — пробуем ещё раз после сброса кеша
            if (json.result === 2005) {
                logWarn('pcloud.put', 'Папка отсутствует, сброс кеша и повтор');
                await this.resetCache();
                await this._ensureFolder(settings);

                const retryR = await fetchWithTimeout(
                    `https://api.pcloud.com/uploadfile?` +
                    `path=${encodeURIComponent(path)}&` +
                    `filename=${encodeURIComponent(FILE)}&` +
                    `access_token=${encodeURIComponent(settings.pcloudAccessToken)}&` +
                    `mode=overwrite`,
                    { method: 'POST', body: form }, 25000, 3);

                if (retryR.ok) {
                    const retryJson = await retryR.json();
                    if (retryJson.result === 0 || retryJson.result === undefined) {
                        logInfo('pcloud.put', `Загружено после повтора: ${body.length} байт`);
                        return true;
                    }
                }
            }
            throw new Error(tbg('pcErr', { err: json.error || (tbg('codePrefix') + json.result) }));
        }

        logInfo('pcloud.put', `Загружено ${body.length} байт`);
        return true;
    }
};

self.PCloudProvider = PCloudProvider;