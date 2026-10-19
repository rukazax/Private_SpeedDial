'use strict';

/* ============================================================
   idb.js — IndexedDB: плитки, папки, заметки, фоны.

   v6.6.0:
   - Обработка VersionError: если существующая БД имеет версию
     БОЛЬШЕ ожидаемой (откат расширения, конфликт обновления),
     открываем без указания версии вместо падения.
   - Само-восстановление при отсутствии store: закрываем БД и
     переоткрываем с версией +1.
   - onblocked не валит операцию, а лишь логирует.
   ============================================================ */

const IDB_NAME = 'speeddial';
const IDB_VERSION = 3;
const STORES = ['data', 'backgrounds'];

let _dbPromise = null;

function _ensureStores(db) {
    return STORES.every(name => db.objectStoreNames.contains(name));
}

function _openDBInternal(version) {
    return new Promise((resolve, reject) => {
        let req;
        try {
            req = version !== undefined
                ? indexedDB.open(IDB_NAME, version)
                : indexedDB.open(IDB_NAME);
        } catch (e) {
            return reject(e);
        }

        req.onupgradeneeded = (event) => {
            const db = event.target.result;
            const oldVersion = event.oldVersion;

            for (const name of STORES) {
                if (!db.objectStoreNames.contains(name)) {
                    db.createObjectStore(name);
                }
            }

            if (oldVersion < 3 && db.objectStoreNames.contains('data')) {
                try {
                    const tx = event.target.transaction;
                    const store = tx.objectStore('data');
                    const cursorReq = store.openCursor();
                    cursorReq.onsuccess = (e) => {
                        const cursor = e.target.result;
                        if (!cursor) return;
                        const data = cursor.value;
                        if (data && Array.isArray(data.tiles)) {
                            data.tiles = data.tiles.map(migrateTile);
                        }
                        if (!data.tombstones) data.tombstones = {};
                        cursor.update(data);
                        cursor.continue();
                    };
                } catch (e) { /* silent */ }
            }
        };

        req.onsuccess = () => {
            const db = req.result;

            if (!_ensureStores(db) && version !== undefined) {
                const nextVersion = db.version + 1;
                db.close();
                _openDBInternal(nextVersion).then(resolve, reject);
                return;
            }
            resolve(db);
        };

        req.onerror = () => {
            const err = req.error;
            if (err && err.name === 'VersionError' && version !== undefined) {
                if (typeof logWarn === 'function') {
                    logWarn('idb._openDBInternal',
                        `VersionError: запрошена версия ${version}, открываю без указания версии`);
                }
                _openDBInternal(undefined).then(resolve, reject);
            } else {
                reject(err);
            }
        };

        req.onblocked = () => {
            if (typeof logWarn === 'function') {
                logWarn('idb._openDBInternal', 'Открытие БД заблокировано другой вкладкой');
            }
        };
    });
}

function openDB() {
    if (_dbPromise) return _dbPromise;
    _dbPromise = _openDBInternal(IDB_VERSION).catch(err => {
        _dbPromise = null;
        throw err;
    });
    return _dbPromise;
}

function migrateTile(tile) {
    if (!tile) return tile;
    if (tile.iconOpacity === undefined) tile.iconOpacity = 100;
    if (tile.updatedAt === undefined) tile.updatedAt = tile.createdAt || Date.now();
    if (tile.createdAt === undefined) tile.createdAt = tile.updatedAt;
    if (tile.bgImage === undefined) tile.bgImage = '';
    if (tile.showTitle === undefined) tile.showTitle = true;
    if (tile.autoColor === undefined) tile.autoColor = false;
    if (!Array.isArray(tile.tags)) tile.tags = [];
    return tile;
}

function _migrateFolderEntity(folder) {
    if (!folder) return folder;
    if (typeof folder.createdAt !== 'number') {
        folder.createdAt = folder.updatedAt || Date.now();
    }
    if (typeof folder.updatedAt !== 'number') {
        folder.updatedAt = folder.createdAt;
    }
    if (typeof folder.opacity !== 'number') folder.opacity = 100;
    return folder;
}

/* После чтения мигрируем plaintext-пароли папок в хэши.
   Результат сразу пересохраняется — миграция происходит один раз. */
async function _migrateFolderPasswordsIfNeeded(data) {
    if (typeof migrateFolderPasswordHashes !== 'function') return;
    try {
        const changed = await migrateFolderPasswordHashes(data);
        if (changed) await idbPut('data', 'main', data);
    } catch (e) {
        if (typeof logWarn === 'function') logWarn('idb.migratePwd', e.message);
    }
}

async function idbGet(storeName, key) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, 'readonly');
        const req = tx.objectStore(storeName).get(key);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
}

async function idbPut(storeName, key, value) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, 'readwrite');
        const req = tx.objectStore(storeName).put(value, key);
        req.onsuccess = () => resolve(true);
        req.onerror = () => reject(req.error);
    });
}

async function idbDelete(storeName, key) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, 'readwrite');
        const req = tx.objectStore(storeName).delete(key);
        req.onsuccess = () => resolve(true);
        req.onerror = () => reject(req.error);
    });
}

async function idbGetAll(storeName) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, 'readonly');
        const store = tx.objectStore(storeName);
        const result = {};
        const req = store.openCursor();
        req.onsuccess = (e) => {
            const cursor = e.target.result;
            if (cursor) {
                result[cursor.key] = cursor.value;
                cursor.continue();
            } else {
                resolve(result);
            }
        };
        req.onerror = () => reject(req.error);
    });
}

async function loadDataFromIDB() {
    const data = await idbGet('data', 'main');
    if (data) {
        if (Array.isArray(data.tiles)) data.tiles = data.tiles.map(migrateTile);
        if (Array.isArray(data.folders)) data.folders = data.folders.map(_migrateFolderEntity);
        if (Array.isArray(data.noteFolders)) data.noteFolders = data.noteFolders.map(_migrateFolderEntity);
        if (!data.tombstones) data.tombstones = {};
        await _migrateFolderPasswordsIfNeeded(data);
        return data;
    }

    try {
        const legacy = await chrome.storage.local.get('speedDialData');
        if (legacy.speedDialData && Object.keys(legacy.speedDialData).length > 0) {
            const migrated = legacy.speedDialData;
            if (Array.isArray(migrated.tiles)) migrated.tiles = migrated.tiles.map(migrateTile);
            if (Array.isArray(migrated.folders)) migrated.folders = migrated.folders.map(_migrateFolderEntity);
            if (Array.isArray(migrated.noteFolders)) migrated.noteFolders = migrated.noteFolders.map(_migrateFolderEntity);
            if (!migrated.tombstones) migrated.tombstones = {};
            await _migrateFolderPasswordsIfNeeded(migrated);
            await idbPut('data', 'main', migrated);
            return migrated;
        }
    } catch (e) {}

    return null;
}

async function saveDataToIDB(data) {
    data.lastModified = Date.now();
    if (!data.tombstones) data.tombstones = {};
    await idbPut('data', 'main', data);
    return true;
}

async function saveBackgroundBlob(id, dataUrl) {
    await idbPut('backgrounds', id, { id, dataUrl, savedAt: Date.now() });
}

async function loadBackgroundBlob(id) {
    return idbGet('backgrounds', id);
}

async function deleteBackgroundBlob(id) {
    return idbDelete('backgrounds', id);
}

if (typeof self !== 'undefined') {
    self.openDB = openDB;
    self.idbGet = idbGet;
    self.idbPut = idbPut;
    self.idbDelete = idbDelete;
    self.idbGetAll = idbGetAll;
    self.migrateTile = migrateTile;
    self.loadDataFromIDB = loadDataFromIDB;
    self.saveDataToIDB = saveDataToIDB;
    self.saveBackgroundBlob = saveBackgroundBlob;
    self.loadBackgroundBlob = loadBackgroundBlob;
    self.deleteBackgroundBlob = deleteBackgroundBlob;
}