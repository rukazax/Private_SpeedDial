'use strict';

/* ============================================================
   defaults.js — единый источник DEFAULT_SETTINGS.

   v6.6.6:
   - Добавлено settingsUpdatedAt — timestamp последнего
     явного изменения настроек пользователем. Используется
     в sync для Last-Write-Wins: при merge побеждает сторона
     с большим значением, чтобы настройки не «слетали» при
     следующем автосинке.
   - Остальное — как в v6.5.0.
   ============================================================ */

const DEFAULT_SETTINGS = {
    // --- Метаданные настроек (LWW) ---
    settingsUpdatedAt: 0,

    // --- Синхронизация ---
    syncService: 'webdav',
    /* v6.9.4: второй сервер для параллельной синхронизации ('' — выключено) */
    syncService2: '',
    syncMode: 'merge',
    syncInterval: 60,
    autoSync: true,
    encryptionKey: '',
    webdavUrl: '', webdavUsername: '', webdavPassword: '',
    nextcloudUrl: '', nextcloudUsername: '', nextcloudPassword: '',
    dropboxAccessToken: '', dropboxFolder: '/Private-SpeedDial',
    boxAccessToken: '', boxFileId: '',
    onedriveAccessToken: '', onedriveFolder: '/Private-SpeedDial',
    pcloudAccessToken: '', pcloudFolder: '/Private-SpeedDial',
    yandexToken: '', yandexFolder: 'Private-SpeedDial',
    mailruEmail: '', mailruPassword: '', mailruFolder: 'Private-SpeedDial',

    // --- Интерфейс ---
    theme: 'auto',
    forcedLanguage: 'auto',
    accentColor: '#35c2b5',
    tileBgDefault: '#4caf50',
    tileTextDefault: '#ffffff',
    fontFamily: 'system',
    fontSize: 'normal',
    
    /* v6.8.6: расстояние между диалами (px); null — авто (пропорционально, мин. 1px) */
    
    themeOpacity: 100,

    modalOpacity: 75,
    faviconSource: 'google',

    /* v6.9.3: ширина панели заметок (px, 200–600) */

    // --- Верхняя панель ---

     /* v6.9.6: ползунок размера скрыт по умолчанию */

    // --- Поисковые движки ---

    // --- Виджеты ---

    // --- Фоны ---
    backgrounds: [],
    activeBackgroundId: '',

    bgRotateEnabled: false,
    bgRotateInterval: 30,
    bgRotateMode: 'sequential',

    // --- Сортировка ---
    tileSortMode: 'manual',
    tileSortFoldersFirst: false,
    noteSortMode: 'manual',
    noteSortFoldersFirst: false,
    folderSortMode: 'manual',
    noteFolderSortMode: 'manual',

    // --- Папки ---
    folderShowEmpty: true,
    folderMaxDepth: 5,
    
    folderDefaultColor: '#2f6f9f',
    folderDefaultTextColor: '#ffffff',
    noteFolderDefaultColor: '#2f6f9f',
    noteFolderDefaultTextColor: '#ffffff',

    // --- Безопасность ---

    // --- Не беспокоить ---
    };

/* ---------- Поля, которые НЕ синхронизируются ---------- */

const SYNC_EXCLUDED_KEYS = new Set([
    'syncService', 'syncService2', 'syncMode', 'syncInterval', 'autoSync', 'encryptionKey',
    'webdavUrl', 'webdavUsername', 'webdavPassword',
    'nextcloudUrl', 'nextcloudUsername', 'nextcloudPassword',
    'dropboxAccessToken', 'dropboxFolder',
    'boxAccessToken', 'boxFileId',
    'onedriveAccessToken', 'onedriveFolder',
    'pcloudAccessToken', 'pcloudFolder',
    'yandexToken', 'yandexFolder',
    'mailruEmail', 'mailruPassword', 'mailruFolder',
    'notificationsEnabled', 'autoLockTimeout', 'localEncryption'
]);

/* ---------- Bundled-фон ---------- */

const BUNDLED_BACKGROUND_PATH = 'backgrounds/default-bg.jpg';
const BUNDLED_BACKGROUND_NAME = 'Природа';
const BUNDLED_BACKGROUND_REF = 'bg_bundled_default';
const BUNDLED_BACKGROUND_ID = 'bg_bundled_default_id';

/* ---------- Tombstones ---------- */

const TOMBSTONE_MAX = 1000;
const TOMBSTONE_TTL_MS = 90 * 24 * 60 * 60 * 1000;

/* ---------- Лимиты payload ---------- */

const SYNC_PAYLOAD_MAX_BYTES = 4 * 1024 * 1024;
const SYNC_BG_MAX_BYTES = 600 * 1024;
const SYNC_BG_JPEG_QUALITY = 0.8;

if (typeof self !== 'undefined') {
    self.DEFAULT_SETTINGS = DEFAULT_SETTINGS;
    self.SYNC_EXCLUDED_KEYS = SYNC_EXCLUDED_KEYS;
    self.BUNDLED_BACKGROUND_PATH = BUNDLED_BACKGROUND_PATH;
    self.BUNDLED_BACKGROUND_NAME = BUNDLED_BACKGROUND_NAME;
    self.BUNDLED_BACKGROUND_REF = BUNDLED_BACKGROUND_REF;
    self.BUNDLED_BACKGROUND_ID = BUNDLED_BACKGROUND_ID;
    self.TOMBSTONE_MAX = TOMBSTONE_MAX;
    self.TOMBSTONE_TTL_MS = TOMBSTONE_TTL_MS;
    self.SYNC_PAYLOAD_MAX_BYTES = SYNC_PAYLOAD_MAX_BYTES;
    self.SYNC_BG_MAX_BYTES = SYNC_BG_MAX_BYTES;
    self.SYNC_BG_JPEG_QUALITY = SYNC_BG_JPEG_QUALITY;
}
if (typeof window !== 'undefined') {
    window.DEFAULT_SETTINGS = DEFAULT_SETTINGS;
    window.SYNC_EXCLUDED_KEYS = SYNC_EXCLUDED_KEYS;
    window.BUNDLED_BACKGROUND_PATH = BUNDLED_BACKGROUND_PATH;
    window.TOMBSTONE_MAX = TOMBSTONE_MAX;
    window.TOMBSTONE_TTL_MS = TOMBSTONE_TTL_MS;
}