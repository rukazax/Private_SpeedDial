'use strict';

/* ============================================================
   translations.js — строки интерфейса.

   v6.9.0: пул языков расширен до 12:
   en, ru, uk, de, es, fr, it, pt, zh, ja, ko, tr.
   Язык по умолчанию — язык браузера; если он не поддерживается
   или не определён — английский (см. resolveUILanguage в common.js).
   ============================================================ */

const translations = {
en: {
    searchBookmarks: 'Search bookmarks and notes...', searchWeb: 'Search web...',
    addTile: 'Add bookmark', theme: 'Theme', sync: 'Sync',
    settings: 'Settings', pinHeader: 'Collapse header', bgGallery: 'Background gallery',
    lock: 'Lock', profile: 'Profile', 
    notes: 'Notes', collapseSidebar: 'Collapse', expandSidebar: 'Expand',
    addNote: 'Add note', all: 'All',edit: 'Edit', moveToFolder: 'Move', delete: 'Delete',
    editFolder: 'Edit', setFolderPassword: 'Password', deleteFolder: 'Delete',
    editNoteFolder: 'Edit', deleteNoteFolder: 'Delete',
    editNote: 'Edit', deleteNote: 'Delete',
    addTileModal: 'Add bookmark', editTileModal: 'Edit bookmark',
    titleOptional: 'Title:', url: 'URL:', folder: 'Folder:', iconUrl: 'Icon:',
    bgType: 'Background:', color: 'Color', image: 'Image',
    bgColor: 'Background color:', bgImageUrl: 'Image URL:',
    textColor: 'Text color:', opacity: 'Opacity', iconOpacity: 'Icon opacity',
    showTitle: 'Show title',save: 'Save', cancel: 'Cancel', noFolder: 'None',
    history: 'History', close: 'Close',
    createFolder: 'Create folder', editFolderModal: 'Edit folder',
    folderName: 'Name:', folderColor: 'Color:', folderPassword: 'Password:',
    folderParent: 'Parent folder:', createNoteFolder: 'Note folder',
    editNoteFolderModal: 'Edit note folder',
    addNoteModal: 'Add note', editNoteModal: 'Edit note',
    noteTitle: 'Title:', noteContent: 'Content:',
     loading: 'Loading...',
     
    deleteConfirm: 'Delete?', deleteNoteConfirm: 'Delete note?',
    deleteFolderConfirm: 'Delete folder?', deleteNoteFolderConfirm: 'Delete note folder?',
    wrongPassword: 'Wrong password',
    syncError: 'Error: ',
    
    
    importFvdConfirmRepeat: 'FVD Speed Dial may have been imported already. Continue?',
    importFvdTooLarge: 'File is too large. Max 20 MB.',
    toastSyncing: '🔄 Syncing...',
    
    toastDataUpdated: '🔄 Data updated',
    plaintextWarning: '⚠️ Encryption key is empty — data goes to cloud as plaintext',
    /* v6.9.0: newtab */
    ok: 'OK', autoColorShort: 'Auto', tileOpacity: 'Bookmark opacity:',
    opacityLabel: 'Opacity:',
    protocolHint: 'Protocol is optional — it will be added automatically',
    ctxEdit: '✏️ Edit', ctxResetNesting: '↩️ Reset nesting',
    ctxShowEmpty: '👁 Show/hide empty', ctxMove: '📁 Move',
    ctxSortManual: '📋 Sort: manual', ctxPassword: '🔒 Password',
    ctxSortAsc: '🔤 By name A→Z', ctxSortDesc: '🔤 By name Z→A',
    ctxDelete: '🗑️ Delete', 
    tileTitlePh: 'Bookmark title',
    /* v6.9.0: popup */
    
    
    
    
    
    
    
    
    /* v6.9.0: context menu */
    
    /* v6.9.0: options */
    settingsTitle: 'Private SpeedDial Settings',
    secSync: 'Synchronization settings', chooseService: 'Choose a service:',
    loginLabel: 'Login:', encKeyLabel: 'Sync encryption key:',
    encKeyHint: 'Use the same key on all devices. If you change it, data must be uploaded again.',
    syncModeLabel: 'Sync mode:',
    mergeBtn: '🔀 Merge (multi-device)', toServerBtn: '📤 To server',
    fromServerBtn: '📥 From server',
    mergeExplain: '"Merge" is recommended for syncing between multiple computers. Data from all devices will be merged, including proper deletion of items.',
    syncNowBtn: '⚡ Sync now', testConnBtn: '🔌 Test connection',
    applyBtn: '✔ Apply', doneBtn: 'Done', 
    intervalMin: 'Interval (min):', autoSync: 'Automatic synchronization',
    syncSummaryTitle: 'Sync items summary',
    elementWord: 'Item', colServer: 'Server', colBrowser: 'Browser',
    secActions: 'Actions',
     
    exportFileBtn: '📤 Export to file', importFileBtn: '📥 Import from file',
    importHtmlBtn: '📥 Import from HTML', exportHtmlBtn: '📄 Export to HTML',
    importCsvBtn: '📥 Import from CSV', importFvdBtn: '📥 Import from FVD Speed Dial',
    exportLogsBtn: '📋 Export logs', exportDetailedLogsBtn: '🔬 Export detailed logs',
     
    
    
     
    
    
    secDesign: 'Design', themeLabel: 'Theme:',
    themeSystem: 'System', themeLight: 'Light', themeDark: 'Dark',
    accentColorLabel: 'Accent color:', tileBgLabel: 'Bookmark background:',
    tileTextLabel: 'Bookmark text:', fontLabel: 'Font:', fontSizeLabel: 'Font size:',
    sizeSmall: 'Small', sizeNormal: 'Normal', sizeLarge: 'Large', sizeXLarge: 'Extra large',
    uiOpacityLabel: 'Interface opacity:', 
     modalOpacityLabel: 'Modal opacity:',
    secLanguage: 'Interface language', chooseLanguage: 'Choose a language:',
    autoOption: 'Auto',
    secProfiles: 'Profiles', newProfileLabel: 'New profile:',
    phProfileName: 'Profile name', btnAdd: '+ Add', activeWord: 'Active',
     
     
    
    secBgGallery: 'Background gallery', btnAddBackground: '+ Add background',
    bgRotate: 'Automatic background rotation',
    bgSizeWarning: '⚠️ 4 MB per file limit. If exceeded, backgrounds will not be synced.',
    modeLabel: 'Mode:', randomOption: 'Random', sortSequential: 'Sequential',
     
    colName: 'Name', 
    secImportExport: 'Import/export bookmarks',
    secSort: 'Sorting and folders', sortTilesLabel: 'Bookmark sorting:',
    sortNoteFoldersLabel: 'Note folder sorting:', sortTileFoldersLabel: 'Bookmark folder sorting:',
    sortNotesLabel: 'Note sorting:',
    manualDnd: 'Manual (drag-and-drop)', manualOption: 'Manual',
     
    sortByDate: 'By modification date', sortByDomain: 'By domain',
    sortNewest: 'Newest first', sortOldest: 'Oldest first',
    tileFoldersFirst: 'Bookmarks from folders first', noteFoldersFirst: 'Notes from folders first',
    showEmptyFolders: 'Show empty folders', maxDepth: 'Max depth:',
     
     
      
      
    foldersWord: 'Folders', noteFoldersWord: 'Note folders', tilesWord: 'Bookmarks',
    tombstonesWord: 'Tombstones (deletions)',
      
    
    
    
      
     
    supportProject: '❤️ Support the project', 
    cloudPlaintextNote: 'Data is synced to the cloud as plain JSON. For end-to-end encryption, fill in the "Sync encryption key" field below.',
    encKeyNotSet: 'Encryption key is not set.',
    mailruHint: 'Mail.ru may require an app password for external applications.',
    boxHint: 'in Box and enter its ID. Box does not create the file automatically.',
    createEmptyFile: 'Create an empty file',
    yandexRights: '. Required scope: cloud_api:disk.app_folder or read+write.',
    getItAt: 'Get it at',
    faviconSourceLabel: 'Favicon source:', faviconLocal: 'Local (from the site, private)',
    faviconGoogle: 'Google (external service)',
},
ru: {
    searchBookmarks: 'Поиск по закладкам и заметкам...', searchWeb: 'Поиск в интернете...',
    addTile: 'Добавить закладку', theme: 'Тема', sync: 'Синхронизация',
    settings: 'Настройки', pinHeader: 'Свернуть шапку', bgGallery: 'Галерея фонов',
    lock: 'Блокировка', profile: 'Профиль', 
    notes: 'Заметки', collapseSidebar: 'Свернуть', expandSidebar: 'Развернуть',
    addNote: 'Добавить заметку', all: 'Все',edit: 'Редактировать', moveToFolder: 'Переместить', delete: 'Удалить',
    editFolder: 'Редактировать', setFolderPassword: 'Пароль', deleteFolder: 'Удалить',
    editNoteFolder: 'Редактировать', deleteNoteFolder: 'Удалить',
    editNote: 'Редактировать', deleteNote: 'Удалить',
    addTileModal: 'Добавить закладку', editTileModal: 'Редактировать закладку',
    titleOptional: 'Название:', url: 'URL:', folder: 'Папка:', iconUrl: 'Иконка:',
    bgType: 'Фон:', color: 'Цвет', image: 'Изображение',
    bgColor: 'Цвет фона:', bgImageUrl: 'URL изображения:',
    textColor: 'Цвет текста:', opacity: 'Прозрачность', iconOpacity: 'Прозрачность логотипа',
    showTitle: 'Показывать название',save: 'Сохранить', cancel: 'Отмена', noFolder: 'Нет',
    history: 'История', close: 'Закрыть',
    createFolder: 'Создать папку', editFolderModal: 'Редактировать папку',
    folderName: 'Название:', folderColor: 'Цвет:', folderPassword: 'Пароль:',
    folderParent: 'Родительская папка:', createNoteFolder: 'Папка заметок',
    editNoteFolderModal: 'Редактировать папку заметок',
    addNoteModal: 'Добавить заметку', editNoteModal: 'Редактировать заметку',
    noteTitle: 'Заголовок:', noteContent: 'Содержание:',
     loading: 'Загрузка...',
     
    deleteConfirm: 'Удалить?', deleteNoteConfirm: 'Удалить заметку?',
    deleteFolderConfirm: 'Удалить папку?', deleteNoteFolderConfirm: 'Удалить папку заметок?',
    wrongPassword: 'Неверный пароль',
    syncError: 'Ошибка: ',
    
    
    importFvdConfirmRepeat: 'FVD Speed Dial, возможно, уже был импортирован. Продолжить?',
    importFvdTooLarge: 'Файл слишком большой. Максимум 20 МБ.',
    toastSyncing: '🔄 Синхронизация...',
    
    toastDataUpdated: '🔄 Данные обновлены',
    plaintextWarning: '⚠️ Ключ шифрования пуст — данные уходят в облако открытым текстом',
    ok: 'ОК', autoColorShort: 'Авто', tileOpacity: 'Прозрачность закладки:',
    opacityLabel: 'Прозрачность:',
    protocolHint: 'Протокол можно не указывать — он будет добавлен автоматически',
    ctxEdit: '✏️ Редактировать', ctxResetNesting: '↩️ Сбросить вложенность',
    ctxShowEmpty: '👁 Показать/скрыть пустые', ctxMove: '📁 Переместить',
    ctxSortManual: '📋 Сортировка: вручную', ctxPassword: '🔒 Пароль',
    ctxSortAsc: '🔤 По названию А→Я', ctxSortDesc: '🔤 По названию Я→А',
    ctxDelete: '🗑️ Удалить', 
    tileTitlePh: 'Название закладки',
    
    
    
    
    
    
    
    
    
    settingsTitle: 'Настройки Private SpeedDial',
    secSync: 'Настройки синхронизации', chooseService: 'Выберите сервис:',
    loginLabel: 'Логин:', encKeyLabel: 'Ключ шифрования синхронизации:',
    encKeyHint: 'Используйте тот же ключ на всех устройствах. При смене ключа данные нужно будет загрузить заново.',
    syncModeLabel: 'Режим синхронизации:',
    mergeBtn: '🔀 Объединить (мульти-девайс)', toServerBtn: '📤 На сервер',
    fromServerBtn: '📥 С сервера',
    mergeExplain: '«Объединить» — рекомендовано для синхронизации между несколькими компьютерами. Данные со всех устройств будут объединены, включая корректное удаление элементов.',
    syncNowBtn: '⚡ Синхронизировать сейчас', testConnBtn: '🔌 Тест соединения',
    applyBtn: '✔ Применить', doneBtn: 'Готово', 
    intervalMin: 'Интервал (мин):', autoSync: 'Автоматическая синхронизация',
    syncSummaryTitle: 'Сводка по элементам синхронизации',
    elementWord: 'Элемент', colServer: 'Сервер', colBrowser: 'Браузер',
    secActions: 'Действия',
     
    exportFileBtn: '📤 Экспорт в файл', importFileBtn: '📥 Импорт из файла',
    importHtmlBtn: '📥 Импорт из HTML', exportHtmlBtn: '📄 Экспорт в HTML',
    importCsvBtn: '📥 Импорт из CSV', importFvdBtn: '📥 Импорт из FVD Speed Dial',
    exportLogsBtn: '📋 Экспорт логов', exportDetailedLogsBtn: '🔬 Выгрузить подробные логи',
     
    
    
     
    
    
    secDesign: 'Дизайн', themeLabel: 'Тема:',
    themeSystem: 'Системный', themeLight: 'Светлая', themeDark: 'Тёмная',
    accentColorLabel: 'Акцентный цвет:', tileBgLabel: 'Фон закладок:',
    tileTextLabel: 'Текст закладок:', fontLabel: 'Шрифт:', fontSizeLabel: 'Размер шрифта:',
    sizeSmall: 'Мелкий', sizeNormal: 'Нормальный', sizeLarge: 'Крупный', sizeXLarge: 'Очень крупный',
    uiOpacityLabel: 'Прозрачность интерфейса:', 
     modalOpacityLabel: 'Прозрачность модальных окон:',
    secLanguage: 'Язык интерфейса', chooseLanguage: 'Выберите язык:',
    autoOption: 'Авто',
    secProfiles: 'Профили', newProfileLabel: 'Новый профиль:',
    phProfileName: 'Название профиля', btnAdd: '+ Добавить', activeWord: 'Активен',
     
     
    
    secBgGallery: 'Галерея фонов', btnAddBackground: '+ Добавить фон',
    bgRotate: 'Автоматическая смена фонов',
    bgSizeWarning: '⚠️ Лимит 4 МБ на файл. При превышении фоны не будут синхронизироваться.',
    modeLabel: 'Режим:', randomOption: 'Случайно', sortSequential: 'По порядку',
     
    colName: 'Имя', 
    secImportExport: 'Импорт/экспорт закладок',
    secSort: 'Сортировка и папки', sortTilesLabel: 'Сортировка закладок:',
    sortNoteFoldersLabel: 'Сортировка папок заметок:', sortTileFoldersLabel: 'Сортировка папок закладок:',
    sortNotesLabel: 'Сортировка заметок:',
    manualDnd: 'Вручную (drag-and-drop)', manualOption: 'Вручную',
     
    sortByDate: 'По дате изменения', sortByDomain: 'По домену',
    sortNewest: 'Сначала новые', sortOldest: 'Сначала старые',
    tileFoldersFirst: 'Закладки из папок — в начало', noteFoldersFirst: 'Заметки из папок — в начало',
    showEmptyFolders: 'Показывать пустые папки', maxDepth: 'Макс. глубина:',
     
     
      
      
    foldersWord: 'Папки', noteFoldersWord: 'Папки заметок', tilesWord: 'Закладки',
    tombstonesWord: 'Tombstones (удаления)',
      
    
    
    
      
     
    supportProject: '❤️ Поддержать проект', 
    cloudPlaintextNote: 'Данные синхронизируются с облаком в открытом виде (JSON). Для сквозного шифрования заполните поле «Ключ шифрования синхронизации» ниже.',
    encKeyNotSet: 'Ключ шифрования не задан.',
    mailruHint: 'Mail.ru может требовать пароль приложения для внешних программ.',
    boxHint: 'в Box и укажите его ID. Box не создаёт файл автоматически.',
    createEmptyFile: 'Создайте пустой файл',
    yandexRights: '. Права: cloud_api:disk.app_folder или read+write.',
    getItAt: 'Получите на',
    faviconSourceLabel: 'Источник фавиконок:', faviconLocal: 'Локально (с сайта, приватно)',
    faviconGoogle: 'Google (внешний сервис)',
},
de: {
    searchBookmarks: 'Lesezeichen und Notizen durchsuchen...', searchWeb: 'Im Web suchen...',
    addTile: 'Lesezeichen hinzufügen', theme: 'Design', sync: 'Synchronisierung',
    settings: 'Einstellungen', pinHeader: 'Kopfzeile einklappen', bgGallery: 'Hintergrundgalerie',
    lock: 'Sperren', profile: 'Profil', 
    notes: 'Notizen', collapseSidebar: 'Einklappen', expandSidebar: 'Ausklappen',
    addNote: 'Notiz hinzufügen', all: 'Alle',edit: 'Bearbeiten', moveToFolder: 'Verschieben', delete: 'Löschen',
    editFolder: 'Bearbeiten', setFolderPassword: 'Passwort', deleteFolder: 'Löschen',
    editNoteFolder: 'Bearbeiten', deleteNoteFolder: 'Löschen',
    editNote: 'Bearbeiten', deleteNote: 'Löschen',
    addTileModal: 'Lesezeichen hinzufügen', editTileModal: 'Lesezeichen bearbeiten',
    titleOptional: 'Titel:', url: 'URL:', folder: 'Ordner:', iconUrl: 'Symbol:',
    bgType: 'Hintergrund:', color: 'Farbe', image: 'Bild',
    bgColor: 'Hintergrundfarbe:', bgImageUrl: 'Bild-URL:',
    textColor: 'Textfarbe:', opacity: 'Deckkraft', iconOpacity: 'Symbol-Deckkraft',
    showTitle: 'Titel anzeigen',save: 'Speichern', cancel: 'Abbrechen', noFolder: 'Keiner',
    history: 'Verlauf', close: 'Schließen',
    createFolder: 'Ordner erstellen', editFolderModal: 'Ordner bearbeiten',
    folderName: 'Name:', folderColor: 'Farbe:', folderPassword: 'Passwort:',
    folderParent: 'Übergeordneter Ordner:', createNoteFolder: 'Notizordner',
    editNoteFolderModal: 'Notizordner bearbeiten',
    addNoteModal: 'Notiz hinzufügen', editNoteModal: 'Notiz bearbeiten',
    noteTitle: 'Titel:', noteContent: 'Inhalt:',
     loading: 'Wird geladen...',
     
    deleteConfirm: 'Löschen?', deleteNoteConfirm: 'Notiz löschen?',
    deleteFolderConfirm: 'Ordner löschen?', deleteNoteFolderConfirm: 'Notizordner löschen?',
    wrongPassword: 'Falsches Passwort',
    syncError: 'Fehler: ',
    
    
    importFvdConfirmRepeat: 'FVD Speed Dial wurde möglicherweise bereits importiert. Fortfahren?',
    importFvdTooLarge: 'Datei zu groß. Maximal 20 MB.',
    toastSyncing: '🔄 Synchronisierung...',
    
    toastDataUpdated: '🔄 Daten aktualisiert',
    plaintextWarning: '⚠️ Kein Verschlüsselungsschlüssel — Daten werden unverschlüsselt in die Cloud übertragen',
    ok: 'OK', autoColorShort: 'Auto', tileOpacity: 'Lesezeichen-Deckkraft:',
    opacityLabel: 'Deckkraft:',
    protocolHint: 'Das Protokoll ist optional — es wird automatisch ergänzt',
    ctxEdit: '✏️ Bearbeiten', ctxResetNesting: '↩️ Verschachtelung zurücksetzen',
    ctxShowEmpty: '👁 Leere ein-/ausblenden', ctxMove: '📁 Verschieben',
    ctxSortManual: '📋 Sortierung: manuell', ctxPassword: '🔒 Passwort',
    ctxSortAsc: '🔤 Nach Name A→Z', ctxSortDesc: '🔤 Nach Name Z→A',
    ctxDelete: '🗑️ Löschen', 
    tileTitlePh: 'Lesezeichentitel',
    
    
    
    
    
    
    
    
    
    settingsTitle: 'Private SpeedDial Einstellungen',
    secSync: 'Synchronisierungseinstellungen', chooseService: 'Dienst auswählen:',
    loginLabel: 'Benutzername:', encKeyLabel: 'Verschlüsselungsschlüssel für Sync:',
    encKeyHint: 'Verwenden Sie auf allen Geräten denselben Schlüssel. Nach einer Änderung müssen die Daten erneut hochgeladen werden.',
    syncModeLabel: 'Sync-Modus:',
    mergeBtn: '🔀 Zusammenführen (Multi-Gerät)', toServerBtn: '📤 Zum Server',
    fromServerBtn: '📥 Vom Server',
    mergeExplain: '„Zusammenführen“ wird für die Synchronisierung zwischen mehreren Computern empfohlen. Die Daten aller Geräte werden zusammengeführt, einschließlich korrekter Löschungen.',
    syncNowBtn: '⚡ Jetzt synchronisieren', testConnBtn: '🔌 Verbindung testen',
    applyBtn: '✔ Anwenden', doneBtn: 'Fertig', 
    intervalMin: 'Intervall (Min.):', autoSync: 'Automatische Synchronisierung',
    syncSummaryTitle: 'Zusammenfassung der Sync-Elemente',
    elementWord: 'Element', colServer: 'Server', colBrowser: 'Browser',
    secActions: 'Aktionen',
     
    exportFileBtn: '📤 In Datei exportieren', importFileBtn: '📥 Aus Datei importieren',
    importHtmlBtn: '📥 Aus HTML importieren', exportHtmlBtn: '📄 Nach HTML exportieren',
    importCsvBtn: '📥 Aus CSV importieren', importFvdBtn: '📥 Aus FVD Speed Dial importieren',
    exportLogsBtn: '📋 Logs exportieren', exportDetailedLogsBtn: '🔬 Detaillierte Logs exportieren',
     
    
    
     
    
    
    secDesign: 'Design', themeLabel: 'Design:',
    themeSystem: 'System', themeLight: 'Hell', themeDark: 'Dunkel',
    accentColorLabel: 'Akzentfarbe:', tileBgLabel: 'Lesezeichen-Hintergrund:',
    tileTextLabel: 'Lesezeichen-Text:', fontLabel: 'Schriftart:', fontSizeLabel: 'Schriftgröße:',
    sizeSmall: 'Klein', sizeNormal: 'Normal', sizeLarge: 'Groß', sizeXLarge: 'Sehr groß',
    uiOpacityLabel: 'Deckkraft der Oberfläche:', 
     modalOpacityLabel: 'Deckkraft der Dialoge:',
    secLanguage: 'Sprache der Oberfläche', chooseLanguage: 'Sprache wählen:',
    autoOption: 'Automatisch',
    secProfiles: 'Profile', newProfileLabel: 'Neues Profil:',
    phProfileName: 'Profilname', btnAdd: '+ Hinzufügen', activeWord: 'Aktiv',
     
     
    
    secBgGallery: 'Hintergrundgalerie', btnAddBackground: '+ Hintergrund hinzufügen',
    bgRotate: 'Automatischer Hintergrundwechsel',
    bgSizeWarning: '⚠️ Limit: 4 MB pro Datei. Bei Überschreitung werden Hintergründe nicht synchronisiert.',
    modeLabel: 'Modus:', randomOption: 'Zufällig', sortSequential: 'Der Reihe nach',
     
    colName: 'Name', 
    secImportExport: 'Lesezeichen importieren/exportieren',
    secSort: 'Sortierung und Ordner', sortTilesLabel: 'Lesezeichensortierung:',
    sortNoteFoldersLabel: 'Sortierung der Notizordner:', sortTileFoldersLabel: 'Sortierung der Lesezeichenordner:',
    sortNotesLabel: 'Notizsortierung:',
    manualDnd: 'Manuell (Drag & Drop)', manualOption: 'Manuell',
     
    sortByDate: 'Nach Änderungsdatum', sortByDomain: 'Nach Domain',
    sortNewest: 'Neueste zuerst', sortOldest: 'Älteste zuerst',
    tileFoldersFirst: 'Lesezeichen aus Ordnern zuerst', noteFoldersFirst: 'Notizen aus Ordnern zuerst',
    showEmptyFolders: 'Leere Ordner anzeigen', maxDepth: 'Max. Tiefe:',
     
     
      
      
    foldersWord: 'Ordner', noteFoldersWord: 'Notizordner', tilesWord: 'Lesezeichen',
    tombstonesWord: 'Tombstones (Löschungen)',
      
    
    
    
      
     
    supportProject: '❤️ Projekt unterstützen', 
    cloudPlaintextNote: 'Daten werden unverschlüsselt (JSON) mit der Cloud synchronisiert. Für Ende-zu-Ende-Verschlüsselung füllen Sie unten das Feld „Verschlüsselungsschlüssel für Sync“ aus.',
    encKeyNotSet: 'Kein Verschlüsselungsschlüssel gesetzt.',
    mailruHint: 'Mail.ru verlangt möglicherweise ein App-Passwort für externe Programme.',
    boxHint: 'in Box erstellen und dessen ID angeben. Box legt die Datei nicht automatisch an.',
    createEmptyFile: 'Leere Datei erstellen',
    yandexRights: '. Berechtigungen: cloud_api:disk.app_folder oder read+write.',
    getItAt: 'Holen Sie es auf',
    faviconSourceLabel: 'Favicon-Quelle:', faviconLocal: 'Lokal (von der Website, privat)',
    faviconGoogle: 'Google (externer Dienst)',
},
es: {
    searchBookmarks: 'Buscar en marcadores y notas...', searchWeb: 'Buscar en la web...',
    addTile: 'Añadir marcador', theme: 'Tema', sync: 'Sincronización',
    settings: 'Configuración', pinHeader: 'Contraer cabecera', bgGallery: 'Galería de fondos',
    lock: 'Bloquear', profile: 'Perfil', 
    notes: 'Notas', collapseSidebar: 'Contraer', expandSidebar: 'Expandir',
    addNote: 'Añadir nota', all: 'Todos',edit: 'Editar', moveToFolder: 'Mover', delete: 'Eliminar',
    editFolder: 'Editar', setFolderPassword: 'Contraseña', deleteFolder: 'Eliminar',
    editNoteFolder: 'Editar', deleteNoteFolder: 'Eliminar',
    editNote: 'Editar', deleteNote: 'Eliminar',
    addTileModal: 'Añadir marcador', editTileModal: 'Editar marcador',
    titleOptional: 'Título:', url: 'URL:', folder: 'Carpeta:', iconUrl: 'Icono:',
    bgType: 'Fondo:', color: 'Color', image: 'Imagen',
    bgColor: 'Color de fondo:', bgImageUrl: 'URL de imagen:',
    textColor: 'Color del texto:', opacity: 'Opacidad', iconOpacity: 'Opacidad del icono',
    showTitle: 'Mostrar título',save: 'Guardar', cancel: 'Cancelar', noFolder: 'Ninguna',
    history: 'Historial', close: 'Cerrar',
    createFolder: 'Crear carpeta', editFolderModal: 'Editar carpeta',
    folderName: 'Nombre:', folderColor: 'Color:', folderPassword: 'Contraseña:',
    folderParent: 'Carpeta principal:', createNoteFolder: 'Carpeta de notas',
    editNoteFolderModal: 'Editar carpeta de notas',
    addNoteModal: 'Añadir nota', editNoteModal: 'Editar nota',
    noteTitle: 'Título:', noteContent: 'Contenido:',
     loading: 'Cargando...',
     
    deleteConfirm: '¿Eliminar?', deleteNoteConfirm: '¿Eliminar nota?',
    deleteFolderConfirm: '¿Eliminar carpeta?', deleteNoteFolderConfirm: '¿Eliminar carpeta de notas?',
    wrongPassword: 'Contraseña incorrecta',
    syncError: 'Error: ',
    
    
    importFvdConfirmRepeat: 'Es posible que FVD Speed Dial ya se haya importado. ¿Continuar?',
    importFvdTooLarge: 'El archivo es demasiado grande. Máximo 20 MB.',
    toastSyncing: '🔄 Sincronizando...',
    
    toastDataUpdated: '🔄 Datos actualizados',
    plaintextWarning: '⚠️ La clave de cifrado está vacía — los datos se envían a la nube sin cifrar',
    ok: 'Aceptar', autoColorShort: 'Auto', tileOpacity: 'Opacidad del marcador:',
    opacityLabel: 'Opacidad:',
    protocolHint: 'El protocolo es opcional — se añadirá automáticamente',
    ctxEdit: '✏️ Editar', ctxResetNesting: '↩️ Restablecer anidación',
    ctxShowEmpty: '👁 Mostrar/ocultar vacías', ctxMove: '📁 Mover',
    ctxSortManual: '📋 Ordenación: manual', ctxPassword: '🔒 Contraseña',
    ctxSortAsc: '🔤 Por nombre A→Z', ctxSortDesc: '🔤 Por nombre Z→A',
    ctxDelete: '🗑️ Eliminar', 
    tileTitlePh: 'Título del marcador',
    
    
    
    
    
    
    
    
    
    settingsTitle: 'Configuración de Private SpeedDial',
    secSync: 'Configuración de sincronización', chooseService: 'Elija un servicio:',
    loginLabel: 'Usuario:', encKeyLabel: 'Clave de cifrado de sincronización:',
    encKeyHint: 'Use la misma clave en todos los dispositivos. Si la cambia, los datos deberán subirse de nuevo.',
    syncModeLabel: 'Modo de sincronización:',
    mergeBtn: '🔀 Combinar (multi-dispositivo)', toServerBtn: '📤 Al servidor',
    fromServerBtn: '📥 Desde el servidor',
    mergeExplain: '«Combinar» es lo recomendado para sincronizar entre varios equipos. Los datos de todos los dispositivos se combinarán, incluida la eliminación correcta de elementos.',
    syncNowBtn: '⚡ Sincronizar ahora', testConnBtn: '🔌 Probar conexión',
    applyBtn: '✔ Aplicar', doneBtn: 'Hecho', 
    intervalMin: 'Intervalo (min):', autoSync: 'Sincronización automática',
    syncSummaryTitle: 'Resumen de elementos de sincronización',
    elementWord: 'Elemento', colServer: 'Servidor', colBrowser: 'Navegador',
    secActions: 'Acciones',
     
    exportFileBtn: '📤 Exportar a archivo', importFileBtn: '📥 Importar de archivo',
    importHtmlBtn: '📥 Importar de HTML', exportHtmlBtn: '📄 Exportar a HTML',
    importCsvBtn: '📥 Importar de CSV', importFvdBtn: '📥 Importar de FVD Speed Dial',
    exportLogsBtn: '📋 Exportar registros', exportDetailedLogsBtn: '🔬 Exportar registros detallados',
     
    
    
     
    
    
    secDesign: 'Diseño', themeLabel: 'Tema:',
    themeSystem: 'Sistema', themeLight: 'Claro', themeDark: 'Oscuro',
    accentColorLabel: 'Color de acento:', tileBgLabel: 'Fondo de marcadores:',
    tileTextLabel: 'Texto de marcadores:', fontLabel: 'Fuente:', fontSizeLabel: 'Tamaño de fuente:',
    sizeSmall: 'Pequeño', sizeNormal: 'Normal', sizeLarge: 'Grande', sizeXLarge: 'Muy grande',
    uiOpacityLabel: 'Opacidad de la interfaz:', 
     modalOpacityLabel: 'Opacidad de las ventanas modales:',
    secLanguage: 'Idioma de la interfaz', chooseLanguage: 'Elija un idioma:',
    autoOption: 'Automático',
    secProfiles: 'Perfiles', newProfileLabel: 'Nuevo perfil:',
    phProfileName: 'Nombre del perfil', btnAdd: '+ Añadir', activeWord: 'Activo',
     
     
    
    secBgGallery: 'Galería de fondos', btnAddBackground: '+ Añadir fondo',
    bgRotate: 'Rotación automática de fondos',
    bgSizeWarning: '⚠️ Límite de 4 MB por archivo. Si se supera, los fondos no se sincronizarán.',
    modeLabel: 'Modo:', randomOption: 'Aleatorio', sortSequential: 'Secuencial',
     
    colName: 'Nombre', 
    secImportExport: 'Importar/exportar marcadores',
    secSort: 'Ordenación y carpetas', sortTilesLabel: 'Ordenación de marcadores:',
    sortNoteFoldersLabel: 'Ordenación de carpetas de notas:', sortTileFoldersLabel: 'Ordenación de carpetas de marcadores:',
    sortNotesLabel: 'Ordenación de notas:',
    manualDnd: 'Manual (arrastrar y soltar)', manualOption: 'Manual',
     
    sortByDate: 'Por fecha de modificación', sortByDomain: 'Por dominio',
    sortNewest: 'Primero los nuevos', sortOldest: 'Primero los antiguos',
    tileFoldersFirst: 'Marcadores de carpetas primero', noteFoldersFirst: 'Notas de carpetas primero',
    showEmptyFolders: 'Mostrar carpetas vacías', maxDepth: 'Profundidad máx.:',
     
     
      
      
    foldersWord: 'Carpetas', noteFoldersWord: 'Carpetas de notas', tilesWord: 'Marcadores',
    tombstonesWord: 'Tombstones (eliminaciones)',
      
    
    
    
      
     
    supportProject: '❤️ Apoyar el proyecto', 
    cloudPlaintextNote: 'Los datos se sincronizan con la nube en texto plano (JSON). Para cifrado de extremo a extremo, rellene el campo «Clave de cifrado de sincronización» más abajo.',
    encKeyNotSet: 'La clave de cifrado no está establecida.',
    mailruHint: 'Mail.ru puede requerir una contraseña de aplicación para programas externos.',
    boxHint: 'en Box e indique su ID. Box no crea el archivo automáticamente.',
    createEmptyFile: 'Cree un archivo vacío',
    yandexRights: '. Permisos: cloud_api:disk.app_folder o read+write.',
    getItAt: 'Consígalo en',
    faviconSourceLabel: 'Fuente de favicons:', faviconLocal: 'Local (del sitio, privado)',
    faviconGoogle: 'Google (servicio externo)',
},
fr: {
    searchBookmarks: 'Rechercher dans les favoris et notes...', searchWeb: 'Rechercher sur le web...',
    addTile: 'Ajouter un signet', theme: 'Thème', sync: 'Synchronisation',
    settings: 'Paramètres', pinHeader: 'Réduire l’en-tête', bgGallery: 'Galerie de fonds',
    lock: 'Verrouiller', profile: 'Profil', 
    notes: 'Notes', collapseSidebar: 'Réduire', expandSidebar: 'Développer',
    addNote: 'Ajouter une note', all: 'Tous',edit: 'Modifier', moveToFolder: 'Déplacer', delete: 'Supprimer',
    editFolder: 'Modifier', setFolderPassword: 'Mot de passe', deleteFolder: 'Supprimer',
    editNoteFolder: 'Modifier', deleteNoteFolder: 'Supprimer',
    editNote: 'Modifier', deleteNote: 'Supprimer',
    addTileModal: 'Ajouter un signet', editTileModal: 'Modifier le signet',
    titleOptional: 'Titre :', url: 'URL :', folder: 'Dossier :', iconUrl: 'Icône :',
    bgType: 'Arrière-plan :', color: 'Couleur', image: 'Image',
    bgColor: 'Couleur de fond :', bgImageUrl: 'URL de l’image :',
    textColor: 'Couleur du texte :', opacity: 'Opacité', iconOpacity: 'Opacité de l’icône',
    showTitle: 'Afficher le titre',save: 'Enregistrer', cancel: 'Annuler', noFolder: 'Aucun',
    history: 'Historique', close: 'Fermer',
    createFolder: 'Créer un dossier', editFolderModal: 'Modifier le dossier',
    folderName: 'Nom :', folderColor: 'Couleur :', folderPassword: 'Mot de passe :',
    folderParent: 'Dossier parent :', createNoteFolder: 'Dossier de notes',
    editNoteFolderModal: 'Modifier le dossier de notes',
    addNoteModal: 'Ajouter une note', editNoteModal: 'Modifier la note',
    noteTitle: 'Titre :', noteContent: 'Contenu :',
     loading: 'Chargement...',
     
    deleteConfirm: 'Supprimer ?', deleteNoteConfirm: 'Supprimer la note ?',
    deleteFolderConfirm: 'Supprimer le dossier ?', deleteNoteFolderConfirm: 'Supprimer le dossier de notes ?',
    wrongPassword: 'Mot de passe incorrect',
    syncError: 'Erreur : ',
    
    
    importFvdConfirmRepeat: 'FVD Speed Dial a peut-être déjà été importé. Continuer ?',
    importFvdTooLarge: 'Fichier trop volumineux. Maximum 20 Mo.',
    toastSyncing: '🔄 Synchronisation...',
    
    toastDataUpdated: '🔄 Données mises à jour',
    plaintextWarning: '⚠️ Clé de chiffrement vide — les données partent vers le cloud en clair',
    ok: 'OK', autoColorShort: 'Auto', tileOpacity: 'Opacité du signet :',
    opacityLabel: 'Opacité :',
    protocolHint: 'Le protocole est facultatif — il sera ajouté automatiquement',
    ctxEdit: '✏️ Modifier', ctxResetNesting: '↩️ Réinitialiser l’imbrication',
    ctxShowEmpty: '👁 Afficher/masquer les vides', ctxMove: '📁 Déplacer',
    ctxSortManual: '📋 Tri : manuel', ctxPassword: '🔒 Mot de passe',
    ctxSortAsc: '🔤 Par nom A→Z', ctxSortDesc: '🔤 Par nom Z→A',
    ctxDelete: '🗑️ Supprimer', 
    tileTitlePh: 'Titre du favori',
    
    
    
    
    
    
    
    
    
    settingsTitle: 'Paramètres de Private SpeedDial',
    secSync: 'Paramètres de synchronisation', chooseService: 'Choisissez un service :',
    loginLabel: 'Identifiant :', encKeyLabel: 'Clé de chiffrement de synchronisation :',
    encKeyHint: 'Utilisez la même clé sur tous les appareils. En cas de changement, les données devront être renvoyées.',
    syncModeLabel: 'Mode de synchronisation :',
    mergeBtn: '🔀 Fusionner (multi-appareils)', toServerBtn: '📤 Vers le serveur',
    fromServerBtn: '📥 Depuis le serveur',
    mergeExplain: '« Fusionner » est recommandé pour synchroniser plusieurs ordinateurs. Les données de tous les appareils seront fusionnées, y compris la suppression correcte des éléments.',
    syncNowBtn: '⚡ Synchroniser maintenant', testConnBtn: '🔌 Tester la connexion',
    applyBtn: '✔ Appliquer', doneBtn: 'Terminé', 
    intervalMin: 'Intervalle (min) :', autoSync: 'Synchronisation automatique',
    syncSummaryTitle: 'Résumé des éléments synchronisés',
    elementWord: 'Élément', colServer: 'Serveur', colBrowser: 'Navigateur',
    secActions: 'Actions',
     
    exportFileBtn: '📤 Exporter vers un fichier', importFileBtn: '📥 Importer depuis un fichier',
    importHtmlBtn: '📥 Importer depuis HTML', exportHtmlBtn: '📄 Exporter en HTML',
    importCsvBtn: '📥 Importer depuis CSV', importFvdBtn: '📥 Importer depuis FVD Speed Dial',
    exportLogsBtn: '📋 Exporter les journaux', exportDetailedLogsBtn: '🔬 Exporter les journaux détaillés',
     
    
    
     
    
    
    secDesign: 'Apparence', themeLabel: 'Thème :',
    themeSystem: 'Système', themeLight: 'Clair', themeDark: 'Sombre',
    accentColorLabel: 'Couleur d’accent :', tileBgLabel: 'Fond des signets :',
    tileTextLabel: 'Texte des signets :', fontLabel: 'Police :', fontSizeLabel: 'Taille de police :',
    sizeSmall: 'Petit', sizeNormal: 'Normal', sizeLarge: 'Grand', sizeXLarge: 'Très grand',
    uiOpacityLabel: 'Opacité de l’interface :', 
     modalOpacityLabel: 'Opacité des fenêtres modales :',
    secLanguage: 'Langue de l’interface', chooseLanguage: 'Choisissez une langue :',
    autoOption: 'Automatique',
    secProfiles: 'Profils', newProfileLabel: 'Nouveau profil :',
    phProfileName: 'Nom du profil', btnAdd: '+ Ajouter', activeWord: 'Actif',
     
     
    
    secBgGallery: 'Galerie de fonds', btnAddBackground: '+ Ajouter un fond',
    bgRotate: 'Rotation automatique des fonds',
    bgSizeWarning: '⚠️ Limite de 4 Mo par fichier. Au-delà, les fonds ne seront pas synchronisés.',
    modeLabel: 'Mode :', randomOption: 'Aléatoire', sortSequential: 'Séquentiel',
     
    colName: 'Nom', 
    secImportExport: 'Import/export des favoris',
    secSort: 'Tri et dossiers', sortTilesLabel: 'Tri des signets :',
    sortNoteFoldersLabel: 'Tri des dossiers de notes :', sortTileFoldersLabel: 'Tri des dossiers de signets :',
    sortNotesLabel: 'Tri des notes :',
    manualDnd: 'Manuel (glisser-déposer)', manualOption: 'Manuel',
     
    sortByDate: 'Par date de modification', sortByDomain: 'Par domaine',
    sortNewest: 'Les plus récents d’abord', sortOldest: 'Les plus anciens d’abord',
    tileFoldersFirst: 'Signets des dossiers en premier', noteFoldersFirst: 'Notes des dossiers en premier',
    showEmptyFolders: 'Afficher les dossiers vides', maxDepth: 'Profondeur max :',
     
     
      
      
    foldersWord: 'Dossiers', noteFoldersWord: 'Dossiers de notes', tilesWord: 'Signets',
    tombstonesWord: 'Tombstones (suppressions)',
      
    
    
    
      
     
    supportProject: '❤️ Soutenir le projet', 
    cloudPlaintextNote: 'Les données sont synchronisées avec le cloud en clair (JSON). Pour un chiffrement de bout en bout, renseignez le champ « Clé de chiffrement de synchronisation » ci-dessous.',
    encKeyNotSet: 'La clé de chiffrement n’est pas définie.',
    mailruHint: 'Mail.ru peut exiger un mot de passe d’application pour les programmes externes.',
    boxHint: 'dans Box et indiquez son ID. Box ne crée pas le fichier automatiquement.',
    createEmptyFile: 'Créez un fichier vide',
    yandexRights: '. Droits : cloud_api:disk.app_folder ou read+write.',
    getItAt: 'Obtenez-le sur',
    faviconSourceLabel: 'Source des favicons :', faviconLocal: 'Local (depuis le site, privé)',
    faviconGoogle: 'Google (service externe)',
},
it: {
    searchBookmarks: 'Cerca nei segnalibri e nelle note...', searchWeb: 'Cerca sul web...',
    addTile: 'Aggiungi segnalibro', theme: 'Tema', sync: 'Sincronizzazione',
    settings: 'Impostazioni', pinHeader: 'Comprimi intestazione', bgGallery: 'Galleria sfondi',
    lock: 'Blocca', profile: 'Profilo', 
    notes: 'Note', collapseSidebar: 'Comprimi', expandSidebar: 'Espandi',
    addNote: 'Aggiungi nota', all: 'Tutti',edit: 'Modifica', moveToFolder: 'Sposta', delete: 'Elimina',
    editFolder: 'Modifica', setFolderPassword: 'Password', deleteFolder: 'Elimina',
    editNoteFolder: 'Modifica', deleteNoteFolder: 'Elimina',
    editNote: 'Modifica', deleteNote: 'Elimina',
    addTileModal: 'Aggiungi segnalibro', editTileModal: 'Modifica segnalibro',
    titleOptional: 'Titolo:', url: 'URL:', folder: 'Cartella:', iconUrl: 'Icona:',
    bgType: 'Sfondo:', color: 'Colore', image: 'Immagine',
    bgColor: 'Colore di sfondo:', bgImageUrl: 'URL immagine:',
    textColor: 'Colore del testo:', opacity: 'Opacità', iconOpacity: 'Opacità icona',
    showTitle: 'Mostra titolo',save: 'Salva', cancel: 'Annulla', noFolder: 'Nessuna',
    history: 'Cronologia', close: 'Chiudi',
    createFolder: 'Crea cartella', editFolderModal: 'Modifica cartella',
    folderName: 'Nome:', folderColor: 'Colore:', folderPassword: 'Password:',
    folderParent: 'Cartella principale:', createNoteFolder: 'Cartella delle note',
    editNoteFolderModal: 'Modifica cartella delle note',
    addNoteModal: 'Aggiungi nota', editNoteModal: 'Modifica nota',
    noteTitle: 'Titolo:', noteContent: 'Contenuto:',
     loading: 'Caricamento...',
     
    deleteConfirm: 'Eliminare?', deleteNoteConfirm: 'Eliminare la nota?',
    deleteFolderConfirm: 'Eliminare la cartella?', deleteNoteFolderConfirm: 'Eliminare la cartella delle note?',
    wrongPassword: 'Password errata',
    syncError: 'Errore: ',
    
    
    importFvdConfirmRepeat: 'FVD Speed Dial potrebbe essere già stato importato. Continuare?',
    importFvdTooLarge: 'File troppo grande. Massimo 20 MB.',
    toastSyncing: '🔄 Sincronizzazione...',
    
    toastDataUpdated: '🔄 Dati aggiornati',
    plaintextWarning: '⚠️ Chiave di crittografia vuota — i dati vanno al cloud in chiaro',
    ok: 'OK', autoColorShort: 'Auto', tileOpacity: 'Opacità segnalibro:',
    opacityLabel: 'Opacità:',
    protocolHint: 'Il protocollo è facoltativo — verrà aggiunto automaticamente',
    ctxEdit: '✏️ Modifica', ctxResetNesting: '↩️ Reimposta nidificazione',
    ctxShowEmpty: '👁 Mostra/nascondi vuote', ctxMove: '📁 Sposta',
    ctxSortManual: '📋 Ordinamento: manuale', ctxPassword: '🔒 Password',
    ctxSortAsc: '🔤 Per nome A→Z', ctxSortDesc: '🔤 Per nome Z→A',
    ctxDelete: '🗑️ Elimina', 
    tileTitlePh: 'Titolo del segnalibro',
    
    
    
    
    
    
    
    
    
    settingsTitle: 'Impostazioni di Private SpeedDial',
    secSync: 'Impostazioni di sincronizzazione', chooseService: 'Scegli un servizio:',
    loginLabel: 'Nome utente:', encKeyLabel: 'Chiave di crittografia della sincronizzazione:',
    encKeyHint: 'Usa la stessa chiave su tutti i dispositivi. Se la cambi, i dati dovranno essere caricati di nuovo.',
    syncModeLabel: 'Modalità di sincronizzazione:',
    mergeBtn: '🔀 Unisci (multi-dispositivo)', toServerBtn: '📤 Al server',
    fromServerBtn: '📥 Dal server',
    mergeExplain: '«Unisci» è consigliato per sincronizzare più computer. I dati di tutti i dispositivi verranno uniti, inclusa la corretta eliminazione degli elementi.',
    syncNowBtn: '⚡ Sincronizza ora', testConnBtn: '🔌 Testa connessione',
    applyBtn: '✔ Applica', doneBtn: 'Fatto', 
    intervalMin: 'Intervallo (min):', autoSync: 'Sincronizzazione automatica',
    syncSummaryTitle: 'Riepilogo degli elementi di sincronizzazione',
    elementWord: 'Elemento', colServer: 'Server', colBrowser: 'Browser',
    secActions: 'Azioni',
     
    exportFileBtn: '📤 Esporta in file', importFileBtn: '📥 Importa da file',
    importHtmlBtn: '📥 Importa da HTML', exportHtmlBtn: '📄 Esporta in HTML',
    importCsvBtn: '📥 Importa da CSV', importFvdBtn: '📥 Importa da FVD Speed Dial',
    exportLogsBtn: '📋 Esporta log', exportDetailedLogsBtn: '🔬 Esporta log dettagliati',
     
    
    
     
    
    
    secDesign: 'Aspetto', themeLabel: 'Tema:',
    themeSystem: 'Sistema', themeLight: 'Chiaro', themeDark: 'Scuro',
    accentColorLabel: 'Colore accento:', tileBgLabel: 'Sfondo segnalibri:',
    tileTextLabel: 'Testo segnalibri:', fontLabel: 'Carattere:', fontSizeLabel: 'Dimensione carattere:',
    sizeSmall: 'Piccolo', sizeNormal: 'Normale', sizeLarge: 'Grande', sizeXLarge: 'Molto grande',
    uiOpacityLabel: 'Opacità interfaccia:', 
     modalOpacityLabel: 'Opacità finestre modali:',
    secLanguage: 'Lingua dell’interfaccia', chooseLanguage: 'Scegli una lingua:',
    autoOption: 'Automatico',
    secProfiles: 'Profili', newProfileLabel: 'Nuovo profilo:',
    phProfileName: 'Nome del profilo', btnAdd: '+ Aggiungi', activeWord: 'Attivo',
     
     
    
    secBgGallery: 'Galleria sfondi', btnAddBackground: '+ Aggiungi sfondo',
    bgRotate: 'Rotazione automatica degli sfondi',
    bgSizeWarning: '⚠️ Limite di 4 MB per file. Oltre il limite gli sfondi non saranno sincronizzati.',
    modeLabel: 'Modalità:', randomOption: 'Casuale', sortSequential: 'Sequenziale',
     
    colName: 'Nome', 
    secImportExport: 'Importa/esporta segnalibri',
    secSort: 'Ordinamento e cartelle', sortTilesLabel: 'Ordinamento segnalibri:',
    sortNoteFoldersLabel: 'Ordinamento cartelle delle note:', sortTileFoldersLabel: 'Ordinamento cartelle dei segnalibri:',
    sortNotesLabel: 'Ordinamento note:',
    manualDnd: 'Manuale (drag-and-drop)', manualOption: 'Manuale',
     
    sortByDate: 'Per data di modifica', sortByDomain: 'Per dominio',
    sortNewest: 'Prima i più recenti', sortOldest: 'Prima i più vecchi',
    tileFoldersFirst: 'Segnalibri dalle cartelle in cima', noteFoldersFirst: 'Note dalle cartelle in cima',
    showEmptyFolders: 'Mostra cartelle vuote', maxDepth: 'Profondità max:',
     
     
      
      
    foldersWord: 'Cartelle', noteFoldersWord: 'Cartelle delle note', tilesWord: 'Segnalibri',
    tombstonesWord: 'Tombstone (eliminazioni)',
      
    
    
    
      
     
    supportProject: '❤️ Sostieni il progetto', 
    cloudPlaintextNote: 'I dati vengono sincronizzati con il cloud in chiaro (JSON). Per la crittografia end-to-end compila il campo «Chiave di crittografia della sincronizzazione» qui sotto.',
    encKeyNotSet: 'Chiave di crittografia non impostata.',
    mailruHint: 'Mail.ru può richiedere una password per app per i programmi esterni.',
    boxHint: 'in Box e indicane l’ID. Box non crea il file automaticamente.',
    createEmptyFile: 'Crea un file vuoto',
    yandexRights: '. Permessi: cloud_api:disk.app_folder o read+write.',
    getItAt: 'Ottienilo su',
    faviconSourceLabel: 'Fonte delle favicon:', faviconLocal: 'Locale (dal sito, privata)',
    faviconGoogle: 'Google (servizio esterno)',
},
pt: {
    searchBookmarks: 'Pesquisar favoritos e notas...', searchWeb: 'Pesquisar na web...',
    addTile: 'Adicionar marcador', theme: 'Tema', sync: 'Sincronização',
    settings: 'Configurações', pinHeader: 'Recolher cabeçalho', bgGallery: 'Galeria de fundos',
    lock: 'Bloquear', profile: 'Perfil', 
    notes: 'Notas', collapseSidebar: 'Recolher', expandSidebar: 'Expandir',
    addNote: 'Adicionar nota', all: 'Todos',edit: 'Editar', moveToFolder: 'Mover', delete: 'Excluir',
    editFolder: 'Editar', setFolderPassword: 'Senha', deleteFolder: 'Excluir',
    editNoteFolder: 'Editar', deleteNoteFolder: 'Excluir',
    editNote: 'Editar', deleteNote: 'Excluir',
    addTileModal: 'Adicionar marcador', editTileModal: 'Editar marcador',
    titleOptional: 'Título:', url: 'URL:', folder: 'Pasta:', iconUrl: 'Ícone:',
    bgType: 'Fundo:', color: 'Cor', image: 'Imagem',
    bgColor: 'Cor de fundo:', bgImageUrl: 'URL da imagem:',
    textColor: 'Cor do texto:', opacity: 'Opacidade', iconOpacity: 'Opacidade do ícone',
    showTitle: 'Mostrar título',save: 'Salvar', cancel: 'Cancelar', noFolder: 'Nenhuma',
    history: 'Histórico', close: 'Fechar',
    createFolder: 'Criar pasta', editFolderModal: 'Editar pasta',
    folderName: 'Nome:', folderColor: 'Cor:', folderPassword: 'Senha:',
    folderParent: 'Pasta principal:', createNoteFolder: 'Pasta de notas',
    editNoteFolderModal: 'Editar pasta de notas',
    addNoteModal: 'Adicionar nota', editNoteModal: 'Editar nota',
    noteTitle: 'Título:', noteContent: 'Conteúdo:',
     loading: 'Carregando...',
     
    deleteConfirm: 'Excluir?', deleteNoteConfirm: 'Excluir nota?',
    deleteFolderConfirm: 'Excluir pasta?', deleteNoteFolderConfirm: 'Excluir pasta de notas?',
    wrongPassword: 'Senha incorreta',
    syncError: 'Erro: ',
    
    
    importFvdConfirmRepeat: 'O FVD Speed Dial pode já ter sido importado. Continuar?',
    importFvdTooLarge: 'Arquivo muito grande. Máximo de 20 MB.',
    toastSyncing: '🔄 Sincronizando...',
    
    toastDataUpdated: '🔄 Dados atualizados',
    plaintextWarning: '⚠️ Chave de criptografia vazia — os dados vão para a nuvem sem criptografia',
    ok: 'OK', autoColorShort: 'Auto', tileOpacity: 'Opacidade do marcador:',
    opacityLabel: 'Opacidade:',
    protocolHint: 'O protocolo é opcional — será adicionado automaticamente',
    ctxEdit: '✏️ Editar', ctxResetNesting: '↩️ Redefinir aninhamento',
    ctxShowEmpty: '👁 Mostrar/ocultar vazias', ctxMove: '📁 Mover',
    ctxSortManual: '📋 Ordenação: manual', ctxPassword: '🔒 Senha',
    ctxSortAsc: '🔤 Por nome A→Z', ctxSortDesc: '🔤 Por nome Z→A',
    ctxDelete: '🗑️ Excluir', 
    tileTitlePh: 'Título do favorito',
    
    
    
    
    
    
    
    
    
    settingsTitle: 'Configurações do Private SpeedDial',
    secSync: 'Configurações de sincronização', chooseService: 'Escolha um serviço:',
    loginLabel: 'Usuário:', encKeyLabel: 'Chave de criptografia da sincronização:',
    encKeyHint: 'Use a mesma chave em todos os dispositivos. Se alterá-la, os dados precisarão ser enviados novamente.',
    syncModeLabel: 'Modo de sincronização:',
    mergeBtn: '🔀 Mesclar (multidispositivo)', toServerBtn: '📤 Para o servidor',
    fromServerBtn: '📥 Do servidor',
    mergeExplain: '«Mesclar» é o recomendado para sincronizar entre vários computadores. Os dados de todos os dispositivos serão mesclados, incluindo a exclusão correta de itens.',
    syncNowBtn: '⚡ Sincronizar agora', testConnBtn: '🔌 Testar conexão',
    applyBtn: '✔ Aplicar', doneBtn: 'Concluído', 
    intervalMin: 'Intervalo (min):', autoSync: 'Sincronização automática',
    syncSummaryTitle: 'Resumo dos itens de sincronização',
    elementWord: 'Item', colServer: 'Servidor', colBrowser: 'Navegador',
    secActions: 'Ações',
     
    exportFileBtn: '📤 Exportar para arquivo', importFileBtn: '📥 Importar de arquivo',
    importHtmlBtn: '📥 Importar de HTML', exportHtmlBtn: '📄 Exportar para HTML',
    importCsvBtn: '📥 Importar de CSV', importFvdBtn: '📥 Importar do FVD Speed Dial',
    exportLogsBtn: '📋 Exportar registros', exportDetailedLogsBtn: '🔬 Exportar registros detalhados',
     
    
    
     
    
    
    secDesign: 'Aparência', themeLabel: 'Tema:',
    themeSystem: 'Sistema', themeLight: 'Claro', themeDark: 'Escuro',
    accentColorLabel: 'Cor de destaque:', tileBgLabel: 'Fundo dos marcadores:',
    tileTextLabel: 'Texto dos marcadores:', fontLabel: 'Fonte:', fontSizeLabel: 'Tamanho da fonte:',
    sizeSmall: 'Pequeno', sizeNormal: 'Normal', sizeLarge: 'Grande', sizeXLarge: 'Muito grande',
    uiOpacityLabel: 'Opacidade da interface:', 
     modalOpacityLabel: 'Opacidade das janelas modais:',
    secLanguage: 'Idioma da interface', chooseLanguage: 'Escolha um idioma:',
    autoOption: 'Automático',
    secProfiles: 'Perfis', newProfileLabel: 'Novo perfil:',
    phProfileName: 'Nome do perfil', btnAdd: '+ Adicionar', activeWord: 'Ativo',
     
     
    
    secBgGallery: 'Galeria de fundos', btnAddBackground: '+ Adicionar fundo',
    bgRotate: 'Rotação automática de fundos',
    bgSizeWarning: '⚠️ Limite de 4 MB por arquivo. Acima disso, os fundos não serão sincronizados.',
    modeLabel: 'Modo:', randomOption: 'Aleatório', sortSequential: 'Sequencial',
     
    colName: 'Nome', 
    secImportExport: 'Importar/exportar favoritos',
    secSort: 'Ordenação e pastas', sortTilesLabel: 'Ordenação dos marcadores:',
    sortNoteFoldersLabel: 'Ordenação das pastas de notas:', sortTileFoldersLabel: 'Ordenação das pastas de marcadores:',
    sortNotesLabel: 'Ordenação das notas:',
    manualDnd: 'Manual (arrastar e soltar)', manualOption: 'Manual',
     
    sortByDate: 'Por data de modificação', sortByDomain: 'Por domínio',
    sortNewest: 'Mais recentes primeiro', sortOldest: 'Mais antigos primeiro',
    tileFoldersFirst: 'Marcadores de pastas primeiro', noteFoldersFirst: 'Notas de pastas primeiro',
    showEmptyFolders: 'Mostrar pastas vazias', maxDepth: 'Profundidade máx.:',
     
     
      
      
    foldersWord: 'Pastas', noteFoldersWord: 'Pastas de notas', tilesWord: 'Marcadores',
    tombstonesWord: 'Tombstones (exclusões)',
      
    
    
    
      
     
    supportProject: '❤️ Apoiar o projeto', 
    cloudPlaintextNote: 'Os dados são sincronizados com a nuvem em texto simples (JSON). Para criptografia de ponta a ponta, preencha o campo «Chave de criptografia da sincronização» abaixo.',
    encKeyNotSet: 'A chave de criptografia não está definida.',
    mailruHint: 'O Mail.ru pode exigir uma senha de aplicativo para programas externos.',
    boxHint: 'no Box e informe o ID dele. O Box não cria o arquivo automaticamente.',
    createEmptyFile: 'Crie um arquivo vazio',
    yandexRights: '. Permissões: cloud_api:disk.app_folder ou read+write.',
    getItAt: 'Obtenha em',
    faviconSourceLabel: 'Fonte dos favicons:', faviconLocal: 'Local (do site, privada)',
    faviconGoogle: 'Google (serviço externo)',
},
zh: {
    searchBookmarks: '搜索书签和笔记...', searchWeb: '网页搜索...',
    addTile: '添加书签', theme: '主题', sync: '同步',
    settings: '设置', pinHeader: '收起页眉', bgGallery: '背景图库',
    lock: '锁定', profile: '配置文件', 
    notes: '笔记', collapseSidebar: '收起', expandSidebar: '展开',
    addNote: '添加笔记', all: '全部',edit: '编辑', moveToFolder: '移动', delete: '删除',
    editFolder: '编辑', setFolderPassword: '密码', deleteFolder: '删除',
    editNoteFolder: '编辑', deleteNoteFolder: '删除',
    editNote: '编辑', deleteNote: '删除',
    addTileModal: '添加书签', editTileModal: '编辑书签',
    titleOptional: '标题：', url: 'URL：', folder: '文件夹：', iconUrl: '图标：',
    bgType: '背景：', color: '颜色', image: '图片',
    bgColor: '背景颜色：', bgImageUrl: '图片 URL：',
    textColor: '文字颜色：', opacity: '不透明度', iconOpacity: '图标不透明度',
    showTitle: '显示标题',save: '保存', cancel: '取消', noFolder: '无',
    history: '历史记录', close: '关闭',
    createFolder: '创建文件夹', editFolderModal: '编辑文件夹',
    folderName: '名称：', folderColor: '颜色：', folderPassword: '密码：',
    folderParent: '父文件夹：', createNoteFolder: '笔记文件夹',
    editNoteFolderModal: '编辑笔记文件夹',
    addNoteModal: '添加笔记', editNoteModal: '编辑笔记',
    noteTitle: '标题：', noteContent: '内容：',
     loading: '加载中...',
     
    deleteConfirm: '删除？', deleteNoteConfirm: '删除笔记？',
    deleteFolderConfirm: '删除文件夹？', deleteNoteFolderConfirm: '删除笔记文件夹？',
    wrongPassword: '密码错误',
    syncError: '错误：',
    
    
    importFvdConfirmRepeat: 'FVD Speed Dial 可能已被导入。是否继续？',
    importFvdTooLarge: '文件过大。最大 20 MB。',
    toastSyncing: '🔄 正在同步...',
    
    toastDataUpdated: '🔄 数据已更新',
    plaintextWarning: '⚠️ 加密密钥为空——数据将以明文形式上传到云端',
    ok: '确定', autoColorShort: '自动', tileOpacity: '书签不透明度：',
    opacityLabel: '不透明度：',
    protocolHint: '协议可选——将自动添加',
    ctxEdit: '✏️ 编辑', ctxResetNesting: '↩️ 重置嵌套',
    ctxShowEmpty: '👁 显示/隐藏空文件夹', ctxMove: '📁 移动',
    ctxSortManual: '📋 排序：手动', ctxPassword: '🔒 密码',
    ctxSortAsc: '🔤 按名称 A→Z', ctxSortDesc: '🔤 按名称 Z→A',
    ctxDelete: '🗑️ 删除', 
    tileTitlePh: '书签标题',
    
    
    
    
    
    
    
    
    
    settingsTitle: 'Private SpeedDial 设置',
    secSync: '同步设置', chooseService: '选择服务：',
    loginLabel: '用户名：', encKeyLabel: '同步加密密钥：',
    encKeyHint: '请在所有设备上使用相同的密钥。更改密钥后需重新上传数据。',
    syncModeLabel: '同步模式：',
    mergeBtn: '🔀 合并（多设备）', toServerBtn: '📤 上传到服务器',
    fromServerBtn: '📥 从服务器下载',
    mergeExplain: '「合并」推荐用于多台电脑之间的同步。来自所有设备的数据将被合并，包括正确删除项目。',
    syncNowBtn: '⚡ 立即同步', testConnBtn: '🔌 测试连接',
    applyBtn: '✔ 应用', doneBtn: '完成', 
    intervalMin: '间隔（分钟）：', autoSync: '自动同步',
    syncSummaryTitle: '同步项目摘要',
    elementWord: '项目', colServer: '服务器', colBrowser: '浏览器',
    secActions: '操作',
     
    exportFileBtn: '📤 导出到文件', importFileBtn: '📥 从文件导入',
    importHtmlBtn: '📥 从 HTML 导入', exportHtmlBtn: '📄 导出为 HTML',
    importCsvBtn: '📥 从 CSV 导入', importFvdBtn: '📥 从 FVD Speed Dial 导入',
    exportLogsBtn: '📋 导出日志', exportDetailedLogsBtn: '🔬 导出详细日志',
     
    
    
     
    
    
    secDesign: '外观', themeLabel: '主题：',
    themeSystem: '系统', themeLight: '浅色', themeDark: '深色',
    accentColorLabel: '强调色：', tileBgLabel: '书签背景：',
    tileTextLabel: '书签文字：', fontLabel: '字体：', fontSizeLabel: '字号：',
    sizeSmall: '小', sizeNormal: '正常', sizeLarge: '大', sizeXLarge: '特大',
    uiOpacityLabel: '界面不透明度：', 
     modalOpacityLabel: '弹窗不透明度：',
    secLanguage: '界面语言', chooseLanguage: '选择语言：',
    autoOption: '自动',
    secProfiles: '配置文件', newProfileLabel: '新配置文件：',
    phProfileName: '配置文件名称', btnAdd: '+ 添加', activeWord: '使用中',
     
     
    
    secBgGallery: '背景图库', btnAddBackground: '+ 添加背景',
    bgRotate: '自动更换背景',
    bgSizeWarning: '⚠️ 每个文件限 4 MB。超出后背景将不会同步。',
    modeLabel: '模式：', randomOption: '随机', sortSequential: '顺序',
     
    colName: '名称', 
    secImportExport: '导入/导出书签',
    secSort: '排序和文件夹', sortTilesLabel: '书签排序：',
    sortNoteFoldersLabel: '笔记文件夹排序：', sortTileFoldersLabel: '书签文件夹排序：',
    sortNotesLabel: '笔记排序：',
    manualDnd: '手动（拖放）', manualOption: '手动',
     
    sortByDate: '按修改日期', sortByDomain: '按域名',
    sortNewest: '最新优先', sortOldest: '最早优先',
    tileFoldersFirst: '文件夹中的书签优先', noteFoldersFirst: '文件夹中的笔记优先',
    showEmptyFolders: '显示空文件夹', maxDepth: '最大深度：',
     
     
      
      
    foldersWord: '文件夹', noteFoldersWord: '笔记文件夹', tilesWord: '书签',
    tombstonesWord: '删除标记（tombstones）',
      
    
    
    
      
     
    supportProject: '❤️ 支持项目', 
    cloudPlaintextNote: '数据以明文（JSON）形式同步到云端。如需端到端加密，请填写下方的「同步加密密钥」字段。',
    encKeyNotSet: '未设置加密密钥。',
    mailruHint: 'Mail.ru 可能要求为外部程序使用应用密码。',
    boxHint: '在 Box 中创建并填写其 ID。Box 不会自动创建文件。',
    createEmptyFile: '创建一个空文件',
    yandexRights: '。权限：cloud_api:disk.app_folder 或 read+write。',
    getItAt: '获取地址',
    faviconSourceLabel: '网站图标来源：', faviconLocal: '本地（来自网站，私密）',
    faviconGoogle: 'Google（外部服务）',
},
ja: {
    searchBookmarks: 'ブックマークとメモを検索...', searchWeb: 'ウェブを検索...',
    addTile: 'ブックマークを追加', theme: 'テーマ', sync: '同期',
    settings: '設定', pinHeader: 'ヘッダーを折りたたむ', bgGallery: '背景ギャラリー',
    lock: 'ロック', profile: 'プロファイル', 
    notes: 'メモ', collapseSidebar: '折りたたむ', expandSidebar: '展開',
    addNote: 'メモを追加', all: 'すべて',edit: '編集', moveToFolder: '移動', delete: '削除',
    editFolder: '編集', setFolderPassword: 'パスワード', deleteFolder: '削除',
    editNoteFolder: '編集', deleteNoteFolder: '削除',
    editNote: '編集', deleteNote: '削除',
    addTileModal: 'ブックマークを追加', editTileModal: 'ブックマークを編集',
    titleOptional: 'タイトル:', url: 'URL:', folder: 'フォルダー:', iconUrl: 'アイコン:',
    bgType: '背景:', color: '色', image: '画像',
    bgColor: '背景色:', bgImageUrl: '画像 URL:',
    textColor: '文字色:', opacity: '不透明度', iconOpacity: 'アイコンの不透明度',
    showTitle: 'タイトルを表示',save: '保存', cancel: 'キャンセル', noFolder: 'なし',
    history: '履歴', close: '閉じる',
    createFolder: 'フォルダーを作成', editFolderModal: 'フォルダーを編集',
    folderName: '名前:', folderColor: '色:', folderPassword: 'パスワード:',
    folderParent: '親フォルダー:', createNoteFolder: 'メモフォルダー',
    editNoteFolderModal: 'メモフォルダーを編集',
    addNoteModal: 'メモを追加', editNoteModal: 'メモを編集',
    noteTitle: 'タイトル:', noteContent: '内容:',
     loading: '読み込み中...',
     
    deleteConfirm: '削除しますか?', deleteNoteConfirm: 'メモを削除しますか?',
    deleteFolderConfirm: 'フォルダーを削除しますか?', deleteNoteFolderConfirm: 'メモフォルダーを削除しますか?',
    wrongPassword: 'パスワードが違います',
    syncError: 'エラー: ',
    
    
    importFvdConfirmRepeat: 'FVD Speed Dial はすでにインポート済みかもしれません。続行しますか?',
    importFvdTooLarge: 'ファイルが大きすぎます。最大 20 MB です。',
    toastSyncing: '🔄 同期中...',
    
    toastDataUpdated: '🔄 データを更新しました',
    plaintextWarning: '⚠️ 暗号化キーが空です — データは平文でクラウドに送信されます',
    ok: 'OK', autoColorShort: '自動', tileOpacity: 'ブックマークの不透明度:',
    opacityLabel: '不透明度:',
    protocolHint: 'プロトコルは省略可能です — 自動で追加されます',
    ctxEdit: '✏️ 編集', ctxResetNesting: '↩️ ネストをリセット',
    ctxShowEmpty: '👁 空の表示/非表示', ctxMove: '📁 移動',
    ctxSortManual: '📋 並べ替え: 手動', ctxPassword: '🔒 パスワード',
    ctxSortAsc: '🔤 名前順 A→Z', ctxSortDesc: '🔤 名前順 Z→A',
    ctxDelete: '🗑️ 削除', 
    tileTitlePh: 'ブックマークのタイトル',
    
    
    
    
    
    
    
    
    
    settingsTitle: 'Private SpeedDial 設定',
    secSync: '同期設定', chooseService: 'サービスを選択:',
    loginLabel: 'ユーザー名:', encKeyLabel: '同期の暗号化キー:',
    encKeyHint: 'すべてのデバイスで同じキーを使用してください。キーを変更した場合はデータを再アップロードする必要があります。',
    syncModeLabel: '同期モード:',
    mergeBtn: '🔀 統合（マルチデバイス）', toServerBtn: '📤 サーバーへ',
    fromServerBtn: '📥 サーバーから',
    mergeExplain: '「統合」は複数のコンピューター間での同期に推奨されます。すべてのデバイスのデータが、項目の正しい削除を含めて統合されます。',
    syncNowBtn: '⚡ 今すぐ同期', testConnBtn: '🔌 接続テスト',
    applyBtn: '✔ 適用', doneBtn: '完了', 
    intervalMin: '間隔（分）:', autoSync: '自動同期',
    syncSummaryTitle: '同期項目の概要',
    elementWord: '項目', colServer: 'サーバー', colBrowser: 'ブラウザー',
    secActions: '操作',
     
    exportFileBtn: '📤 ファイルへエクスポート', importFileBtn: '📥 ファイルからインポート',
    importHtmlBtn: '📥 HTML からインポート', exportHtmlBtn: '📄 HTML へエクスポート',
    importCsvBtn: '📥 CSV からインポート', importFvdBtn: '📥 FVD Speed Dial からインポート',
    exportLogsBtn: '📋 ログをエクスポート', exportDetailedLogsBtn: '🔬 詳細ログをエクスポート',
     
    
    
     
    
    
    secDesign: 'デザイン', themeLabel: 'テーマ:',
    themeSystem: 'システム', themeLight: 'ライト', themeDark: 'ダーク',
    accentColorLabel: 'アクセントカラー:', tileBgLabel: 'ブックマークの背景:',
    tileTextLabel: 'ブックマークの文字:', fontLabel: 'フォント:', fontSizeLabel: 'フォントサイズ:',
    sizeSmall: '小', sizeNormal: '標準', sizeLarge: '大', sizeXLarge: '特大',
    uiOpacityLabel: 'インターフェースの不透明度:', 
     modalOpacityLabel: 'モーダルウィンドウの不透明度:',
    secLanguage: 'インターフェース言語', chooseLanguage: '言語を選択:',
    autoOption: '自動',
    secProfiles: 'プロファイル', newProfileLabel: '新しいプロファイル:',
    phProfileName: 'プロファイル名', btnAdd: '+ 追加', activeWord: '有効',
     
     
    
    secBgGallery: '背景ギャラリー', btnAddBackground: '+ 背景を追加',
    bgRotate: '背景の自動切り替え',
    bgSizeWarning: '⚠️ ファイルあたり 4 MB の制限があります。超過した背景は同期されません。',
    modeLabel: 'モード:', randomOption: 'ランダム', sortSequential: '順番に',
     
    colName: '名前', 
    secImportExport: 'ブックマークのインポート/エクスポート',
    secSort: '並べ替えとフォルダー', sortTilesLabel: 'ブックマークの並べ替え:',
    sortNoteFoldersLabel: 'メモフォルダーの並べ替え:', sortTileFoldersLabel: 'ブックマークフォルダーの並べ替え:',
    sortNotesLabel: 'メモの並べ替え:',
    manualDnd: '手動（ドラッグ＆ドロップ）', manualOption: '手動',
     
    sortByDate: '更新日順', sortByDomain: 'ドメイン順',
    sortNewest: '新しい順', sortOldest: '古い順',
    tileFoldersFirst: 'フォルダー内のブックマークを先頭に', noteFoldersFirst: 'フォルダー内のメモを先頭に',
    showEmptyFolders: '空のフォルダーを表示', maxDepth: '最大深度:',
     
     
      
      
    foldersWord: 'フォルダー', noteFoldersWord: 'メモフォルダー', tilesWord: 'ブックマーク',
    tombstonesWord: 'Tombstones（削除）',
      
    
    
    
      
     
    supportProject: '❤️ プロジェクトを支援', 
    cloudPlaintextNote: 'データは平文（JSON）でクラウドと同期されます。エンドツーエンド暗号化を行うには、下の「同期の暗号化キー」欄を入力してください。',
    encKeyNotSet: '暗号化キーが設定されていません。',
    mailruHint: 'Mail.ru では外部プログラム用にアプリパスワードが必要な場合があります。',
    boxHint: 'を Box に作成し、その ID を指定してください。Box はファイルを自動作成しません。',
    createEmptyFile: '空のファイルを作成',
    yandexRights: '。権限: cloud_api:disk.app_folder または read+write。',
    getItAt: '入手先',
    faviconSourceLabel: 'ファビコンの取得元:', faviconLocal: 'ローカル（サイトから、プライベート）',
    faviconGoogle: 'Google（外部サービス）',
},
ko: {
    searchBookmarks: '북마크 및 메모 검색...', searchWeb: '웹 검색...',
    addTile: '북마크 추가', theme: '테마', sync: '동기화',
    settings: '설정', pinHeader: '헤더 접기', bgGallery: '배경 갤러리',
    lock: '잠금', profile: '프로필', 
    notes: '메모', collapseSidebar: '접기', expandSidebar: '펼치기',
    addNote: '메모 추가', all: '전체',edit: '편집', moveToFolder: '이동', delete: '삭제',
    editFolder: '편집', setFolderPassword: '비밀번호', deleteFolder: '삭제',
    editNoteFolder: '편집', deleteNoteFolder: '삭제',
    editNote: '편집', deleteNote: '삭제',
    addTileModal: '북마크 추가', editTileModal: '북마크 편집',
    titleOptional: '제목:', url: 'URL:', folder: '폴더:', iconUrl: '아이콘:',
    bgType: '배경:', color: '색상', image: '이미지',
    bgColor: '배경색:', bgImageUrl: '이미지 URL:',
    textColor: '텍스트 색상:', opacity: '불투명도', iconOpacity: '아이콘 불투명도',
    showTitle: '제목 표시',save: '저장', cancel: '취소', noFolder: '없음',
    history: '기록', close: '닫기',
    createFolder: '폴더 만들기', editFolderModal: '폴더 편집',
    folderName: '이름:', folderColor: '색상:', folderPassword: '비밀번호:',
    folderParent: '상위 폴더:', createNoteFolder: '메모 폴더',
    editNoteFolderModal: '메모 폴더 편집',
    addNoteModal: '메모 추가', editNoteModal: '메모 편집',
    noteTitle: '제목:', noteContent: '내용:',
     loading: '로드 중...',
     
    deleteConfirm: '삭제하시겠습니까?', deleteNoteConfirm: '메모를 삭제하시겠습니까?',
    deleteFolderConfirm: '폴더를 삭제하시겠습니까?', deleteNoteFolderConfirm: '메모 폴더를 삭제하시겠습니까?',
    wrongPassword: '잘못된 비밀번호',
    syncError: '오류: ',
    
    
    importFvdConfirmRepeat: 'FVD Speed Dial이 이미 가져와졌을 수 있습니다. 계속하시겠습니까?',
    importFvdTooLarge: '파일이 너무 큽니다. 최대 20MB.',
    toastSyncing: '🔄 동기화 중...',
    
    toastDataUpdated: '🔄 데이터가 업데이트됨',
    plaintextWarning: '⚠️ 암호화 키가 비어 있음 — 데이터가 평문으로 클라우드에 전송됩니다',
    ok: '확인', autoColorShort: '자동', tileOpacity: '북마크 불투명도:',
    opacityLabel: '불투명도:',
    protocolHint: '프로토콜은 선택 사항 — 자동으로 추가됩니다',
    ctxEdit: '✏️ 편집', ctxResetNesting: '↩️ 중첩 초기화',
    ctxShowEmpty: '👁 빈 항목 표시/숨기기', ctxMove: '📁 이동',
    ctxSortManual: '📋 정렬: 수동', ctxPassword: '🔒 비밀번호',
    ctxSortAsc: '🔤 이름순 A→Z', ctxSortDesc: '🔤 이름순 Z→A',
    ctxDelete: '🗑️ 삭제', 
    tileTitlePh: '북마크 제목',
    
    
    
    
    
    
    
    
    
    settingsTitle: 'Private SpeedDial 설정',
    secSync: '동기화 설정', chooseService: '서비스 선택:',
    loginLabel: '사용자 이름:', encKeyLabel: '동기화 암호화 키:',
    encKeyHint: '모든 기기에서 동일한 키를 사용하세요. 키를 변경하면 데이터를 다시 업로드해야 합니다.',
    syncModeLabel: '동기화 모드:',
    mergeBtn: '🔀 병합 (다중 기기)', toServerBtn: '📤 서버로',
    fromServerBtn: '📥 서버에서',
    mergeExplain: '「병합」은 여러 컴퓨터 간 동기화에 권장됩니다. 모든 기기의 데이터가 항목의 올바른 삭제를 포함하여 병합됩니다.',
    syncNowBtn: '⚡ 지금 동기화', testConnBtn: '🔌 연결 테스트',
    applyBtn: '✔ 적용', doneBtn: '완료', 
    intervalMin: '간격(분):', autoSync: '자동 동기화',
    syncSummaryTitle: '동기화 항목 요약',
    elementWord: '항목', colServer: '서버', colBrowser: '브라우저',
    secActions: '작업',
     
    exportFileBtn: '📤 파일로 내보내기', importFileBtn: '📥 파일에서 가져오기',
    importHtmlBtn: '📥 HTML에서 가져오기', exportHtmlBtn: '📄 HTML로 내보내기',
    importCsvBtn: '📥 CSV에서 가져오기', importFvdBtn: '📥 FVD Speed Dial에서 가져오기',
    exportLogsBtn: '📋 로그 내보내기', exportDetailedLogsBtn: '🔬 상세 로그 내보내기',
     
    
    
     
    
    
    secDesign: '디자인', themeLabel: '테마:',
    themeSystem: '시스템', themeLight: '밝게', themeDark: '어둡게',
    accentColorLabel: '강조 색상:', tileBgLabel: '북마크 배경:',
    tileTextLabel: '북마크 텍스트:', fontLabel: '글꼴:', fontSizeLabel: '글꼴 크기:',
    sizeSmall: '작게', sizeNormal: '보통', sizeLarge: '크게', sizeXLarge: '매우 크게',
    uiOpacityLabel: '인터페이스 불투명도:', 
     modalOpacityLabel: '모달 창 불투명도:',
    secLanguage: '인터페이스 언어', chooseLanguage: '언어 선택:',
    autoOption: '자동',
    secProfiles: '프로필', newProfileLabel: '새 프로필:',
    phProfileName: '프로필 이름', btnAdd: '+ 추가', activeWord: '사용 중',
     
     
    
    secBgGallery: '배경 갤러리', btnAddBackground: '+ 배경 추가',
    bgRotate: '배경 자동 전환',
    bgSizeWarning: '⚠️ 파일당 4MB 제한. 초과 시 배경이 동기화되지 않습니다.',
    modeLabel: '모드:', randomOption: '무작위', sortSequential: '순서대로',
     
    colName: '이름', 
    secImportExport: '북마크 가져오기/내보내기',
    secSort: '정렬 및 폴더', sortTilesLabel: '북마크 정렬:',
    sortNoteFoldersLabel: '메모 폴더 정렬:', sortTileFoldersLabel: '북마크 폴더 정렬:',
    sortNotesLabel: '메모 정렬:',
    manualDnd: '수동 (드래그 앤 드롭)', manualOption: '수동',
     
    sortByDate: '수정 날짜순', sortByDomain: '도메인순',
    sortNewest: '최신순', sortOldest: '오래된 순',
    tileFoldersFirst: '폴더의 북마크 먼저', noteFoldersFirst: '폴더의 메모 먼저',
    showEmptyFolders: '빈 폴더 표시', maxDepth: '최대 깊이:',
     
     
      
      
    foldersWord: '폴더', noteFoldersWord: '메모 폴더', tilesWord: '북마크',
    tombstonesWord: 'Tombstones(삭제)',
      
    
    
    
      
     
    supportProject: '❤️ 프로젝트 후원', 
    cloudPlaintextNote: '데이터는 평문(JSON)으로 클라우드와 동기화됩니다. 종단간 암호화를 사용하려면 아래 「동기화 암호화 키」 필드를 입력하세요.',
    encKeyNotSet: '암호화 키가 설정되지 않았습니다.',
    mailruHint: 'Mail.ru는 외부 프로그램에 앱 비밀번호를 요구할 수 있습니다.',
    boxHint: '를 Box에 만들고 해당 ID를 입력하세요. Box는 파일을 자동으로 만들지 않습니다.',
    createEmptyFile: '빈 파일 만들기',
    yandexRights: '. 권한: cloud_api:disk.app_folder 또는 read+write.',
    getItAt: '다운로드:',
    faviconSourceLabel: '파비콘 소스:', faviconLocal: '로컬 (사이트에서, 비공개)',
    faviconGoogle: 'Google (외부 서비스)',
},
tr: {
    searchBookmarks: 'Yer imlerinde ve notlarda ara...', searchWeb: 'Web’de ara...',
    addTile: 'Yer işareti ekle', theme: 'Tema', sync: 'Senkronizasyon',
    settings: 'Ayarlar', pinHeader: 'Başlığı daralt', bgGallery: 'Arka plan galerisi',
    lock: 'Kilitle', profile: 'Profil', 
    notes: 'Notlar', collapseSidebar: 'Daralt', expandSidebar: 'Genişlet',
    addNote: 'Not ekle', all: 'Tümü',edit: 'Düzenle', moveToFolder: 'Taşı', delete: 'Sil',
    editFolder: 'Düzenle', setFolderPassword: 'Parola', deleteFolder: 'Sil',
    editNoteFolder: 'Düzenle', deleteNoteFolder: 'Sil',
    editNote: 'Düzenle', deleteNote: 'Sil',
    addTileModal: 'Yer işareti ekle', editTileModal: 'Yer işaretini düzenle',
    titleOptional: 'Başlık:', url: 'URL:', folder: 'Klasör:', iconUrl: 'Simge:',
    bgType: 'Arka plan:', color: 'Renk', image: 'Resim',
    bgColor: 'Arka plan rengi:', bgImageUrl: 'Resim URL’si:',
    textColor: 'Metin rengi:', opacity: 'Opaklık', iconOpacity: 'Simge opaklığı',
    showTitle: 'Başlığı göster',save: 'Kaydet', cancel: 'İptal', noFolder: 'Yok',
    history: 'Geçmiş', close: 'Kapat',
    createFolder: 'Klasör oluştur', editFolderModal: 'Klasörü düzenle',
    folderName: 'Ad:', folderColor: 'Renk:', folderPassword: 'Parola:',
    folderParent: 'Üst klasör:', createNoteFolder: 'Not klasörü',
    editNoteFolderModal: 'Not klasörünü düzenle',
    addNoteModal: 'Not ekle', editNoteModal: 'Notu düzenle',
    noteTitle: 'Başlık:', noteContent: 'İçerik:',
     loading: 'Yükleniyor...',
     
    deleteConfirm: 'Silinsin mi?', deleteNoteConfirm: 'Not silinsin mi?',
    deleteFolderConfirm: 'Klasör silinsin mi?', deleteNoteFolderConfirm: 'Not klasörü silinsin mi?',
    wrongPassword: 'Yanlış parola',
    syncError: 'Hata: ',
    
    
    importFvdConfirmRepeat: 'FVD Speed Dial zaten içe aktarılmış olabilir. Devam edilsin mi?',
    importFvdTooLarge: 'Dosya çok büyük. En fazla 20 MB.',
    toastSyncing: '🔄 Senkronize ediliyor...',
    
    toastDataUpdated: '🔄 Veriler güncellendi',
    plaintextWarning: '⚠️ Şifreleme anahtarı boş — veriler buluta düz metin olarak gidiyor',
    ok: 'Tamam', autoColorShort: 'Otomatik', tileOpacity: 'Yer işareti opaklığı:',
    opacityLabel: 'Opaklık:',
    protocolHint: 'Protokol isteğe bağlı — otomatik olarak eklenir',
    ctxEdit: '✏️ Düzenle', ctxResetNesting: '↩️ İç içe geçmeyi sıfırla',
    ctxShowEmpty: '👁 Boşları göster/gizle', ctxMove: '📁 Taşı',
    ctxSortManual: '📋 Sıralama: manuel', ctxPassword: '🔒 Parola',
    ctxSortAsc: '🔤 Ada göre A→Z', ctxSortDesc: '🔤 Ada göre Z→A',
    ctxDelete: '🗑️ Sil', 
    tileTitlePh: 'Yer imi başlığı',
    
    
    
    
    
    
    
    
    
    settingsTitle: 'Private SpeedDial Ayarları',
    secSync: 'Senkronizasyon ayarları', chooseService: 'Bir hizmet seçin:',
    loginLabel: 'Kullanıcı adı:', encKeyLabel: 'Senkronizasyon şifreleme anahtarı:',
    encKeyHint: 'Tüm cihazlarda aynı anahtarı kullanın. Anahtarı değiştirirseniz veriler yeniden yüklenmelidir.',
    syncModeLabel: 'Senkronizasyon modu:',
    mergeBtn: '🔀 Birleştir (çoklu cihaz)', toServerBtn: '📤 Sunucuya',
    fromServerBtn: '📥 Sunucudan',
    mergeExplain: '«Birleştir», birden fazla bilgisayar arasında senkronizasyon için önerilir. Tüm cihazlardaki veriler, öğelerin doğru şekilde silinmesi dahil, birleştirilir.',
    syncNowBtn: '⚡ Şimdi senkronize et', testConnBtn: '🔌 Bağlantıyı test et',
    applyBtn: '✔ Uygula', doneBtn: 'Tamam', 
    intervalMin: 'Aralık (dk):', autoSync: 'Otomatik senkronizasyon',
    syncSummaryTitle: 'Senkronizasyon öğeleri özeti',
    elementWord: 'Öğe', colServer: 'Sunucu', colBrowser: 'Tarayıcı',
    secActions: 'Eylemler',
     
    exportFileBtn: '📤 Dosyaya aktar', importFileBtn: '📥 Dosyadan içe aktar',
    importHtmlBtn: '📥 HTML’den içe aktar', exportHtmlBtn: '📄 HTML’ye aktar',
    importCsvBtn: '📥 CSV’den içe aktar', importFvdBtn: '📥 FVD Speed Dial’dan içe aktar',
    exportLogsBtn: '📋 Günlükleri dışa aktar', exportDetailedLogsBtn: '🔬 Ayrıntılı günlükleri dışa aktar',
     
    
    
     
    
    
    secDesign: 'Tasarım', themeLabel: 'Tema:',
    themeSystem: 'Sistem', themeLight: 'Açık', themeDark: 'Koyu',
    accentColorLabel: 'Vurgu rengi:', tileBgLabel: 'Yer işareti arka planı:',
    tileTextLabel: 'Yer işareti metni:', fontLabel: 'Yazı tipi:', fontSizeLabel: 'Yazı boyutu:',
    sizeSmall: 'Küçük', sizeNormal: 'Normal', sizeLarge: 'Büyük', sizeXLarge: 'Çok büyük',
    uiOpacityLabel: 'Arayüz opaklığı:', 
     modalOpacityLabel: 'Kalıcı pencere opaklığı:',
    secLanguage: 'Arayüz dili', chooseLanguage: 'Bir dil seçin:',
    autoOption: 'Otomatik',
    secProfiles: 'Profiller', newProfileLabel: 'Yeni profil:',
    phProfileName: 'Profil adı', btnAdd: '+ Ekle', activeWord: 'Etkin',
     
     
    
    secBgGallery: 'Arka plan galerisi', btnAddBackground: '+ Arka plan ekle',
    bgRotate: 'Otomatik arka plan değişimi',
    bgSizeWarning: '⚠️ Dosya başına 4 MB sınırı. Aşılırsa arka planlar senkronize edilmez.',
    modeLabel: 'Mod:', randomOption: 'Rastgele', sortSequential: 'Sıralı',
     
    colName: 'Ad', 
    secImportExport: 'Yer imlerini içe/dışa aktar',
    secSort: 'Sıralama ve klasörler', sortTilesLabel: 'Yer işareti sıralaması:',
    sortNoteFoldersLabel: 'Not klasörü sıralaması:', sortTileFoldersLabel: 'Yer işareti klasörü sıralaması:',
    sortNotesLabel: 'Not sıralaması:',
    manualDnd: 'Manuel (sürükle-bırak)', manualOption: 'Manuel',
     
    sortByDate: 'Değişiklik tarihine göre', sortByDomain: 'Alana göre',
    sortNewest: 'Önce en yeni', sortOldest: 'Önce en eski',
    tileFoldersFirst: 'Klasörlerdeki yer işaretleri önce', noteFoldersFirst: 'Klasörlerdeki notlar önce',
    showEmptyFolders: 'Boş klasörleri göster', maxDepth: 'Maks. derinlik:',
     
     
      
      
    foldersWord: 'Klasörler', noteFoldersWord: 'Not klasörleri', tilesWord: 'Yer işaretleri',
    tombstonesWord: 'Tombstones (silme işlemleri)',
      
    
    
    
      
     
    supportProject: '❤️ Projeyi destekle', 
    cloudPlaintextNote: 'Veriler buluta düz metin (JSON) olarak senkronize edilir. Uçtan uca şifreleme için aşağıdaki «Senkronizasyon şifreleme anahtarı» alanını doldurun.',
    encKeyNotSet: 'Şifreleme anahtarı ayarlanmadı.',
    mailruHint: 'Mail.ru, harici programlar için uygulama parolası isteyebilir.',
    boxHint: 'Box’ta oluşturun ve ID’sini girin. Box dosyayı otomatik oluşturmaz.',
    createEmptyFile: 'Boş bir dosya oluşturun',
    yandexRights: '. İzinler: cloud_api:disk.app_folder veya read+write.',
    getItAt: 'Şuradan edinin:',
    faviconSourceLabel: 'Favicon kaynağı:', faviconLocal: 'Yerel (siteden, özel)',
    faviconGoogle: 'Google (harici hizmet)',
},
hi: {
    searchBookmarks: 'बुकमार्क और नोट्स खोजें...', searchWeb: 'वेब पर खोजें...',
    addTile: 'बुकमार्क जोड़ें', theme: 'थीम', sync: 'सिंक',
    settings: 'सेटिंग्स', pinHeader: 'हेडर समेटें', bgGallery: 'पृष्ठभूमि गैलरी',
    lock: 'लॉक', profile: 'प्रोफ़ाइल', 
    notes: 'नोट्स', collapseSidebar: 'समेटें', expandSidebar: 'फैलाएँ',
    addNote: 'नोट जोड़ें', all: 'सभी',edit: 'संपादित करें', moveToFolder: 'स्थानांतरित करें', delete: 'हटाएँ',
    editFolder: 'संपादित करें', setFolderPassword: 'पासवर्ड', deleteFolder: 'हटाएँ',
    editNoteFolder: 'संपादित करें', deleteNoteFolder: 'हटाएँ',
    editNote: 'संपादित करें', deleteNote: 'हटाएँ',
    addTileModal: 'बुकमार्क जोड़ें', editTileModal: 'बुकमार्क संपादित करें',
    titleOptional: 'शीर्षक:', url: 'URL:', folder: 'फ़ोल्डर:', iconUrl: 'आइकन:',
    bgType: 'पृष्ठभूमि:', color: 'रंग', image: 'छवि',
    bgColor: 'पृष्ठभूमि का रंग:', bgImageUrl: 'छवि URL:',
    textColor: 'टेक्स्ट का रंग:', opacity: 'अपारदर्शिता', iconOpacity: 'आइकन अपारदर्शिता',
    showTitle: 'शीर्षक दिखाएँ',save: 'सहेजें', cancel: 'रद्द करें', noFolder: 'कोई नहीं',
    history: 'इतिहास', close: 'बंद करें',
    createFolder: 'फ़ोल्डर बनाएँ', editFolderModal: 'फ़ोल्डर संपादित करें',
    folderName: 'नाम:', folderColor: 'रंग:', folderPassword: 'पासवर्ड:',
    folderParent: 'मूल फ़ोल्डर:', createNoteFolder: 'नोट फ़ोल्डर',
    editNoteFolderModal: 'नोट फ़ोल्डर संपादित करें',
    addNoteModal: 'नोट जोड़ें', editNoteModal: 'नोट संपादित करें',
    noteTitle: 'शीर्षक:', noteContent: 'सामग्री:',
     loading: 'लोड हो रहा है...',
     
    deleteConfirm: 'हटाएँ?', deleteNoteConfirm: 'नोट हटाएँ?',
    deleteFolderConfirm: 'फ़ोल्डर हटाएँ?', deleteNoteFolderConfirm: 'नोट फ़ोल्डर हटाएँ?',
    wrongPassword: 'गलत पासवर्ड',
    syncError: 'त्रुटि: ',
    
    
    importFvdConfirmRepeat: 'FVD Speed Dial शायद पहले ही आयात हो चुका है। जारी रखें?',
    importFvdTooLarge: 'फ़ाइल बहुत बड़ी है। अधिकतम 20 MB।',
    toastSyncing: '🔄 सिंक हो रहा है...',
    
    toastDataUpdated: '🔄 डेटा अपडेट हुआ',
    plaintextWarning: '⚠️ एन्क्रिप्शन कुंजी खाली है — डेटा क्लाउड पर सादे टेक्स्ट में जाता है',
    ok: 'ठीक', autoColorShort: 'स्वतः', tileOpacity: 'बुकमार्क अपारदर्शिता:',
    opacityLabel: 'अपारदर्शिता:',
    protocolHint: 'प्रोटोकॉल वैकल्पिक है — स्वचालित रूप से जोड़ा जाएगा',
    ctxEdit: '✏️ संपादित करें', ctxResetNesting: '↩️ नेस्टिंग रीसेट करें',
    ctxShowEmpty: '👁 खाली दिखाएँ/छिपाएँ', ctxMove: '📁 स्थानांतरित करें',
    ctxSortManual: '📋 क्रम: मैनुअल', ctxPassword: '🔒 पासवर्ड',
    ctxSortAsc: '🔤 नाम A→Z', ctxSortDesc: '🔤 नाम Z→A',
    ctxDelete: '🗑️ हटाएँ', 
    tileTitlePh: 'बुकमार्क शीर्षक',
    
    
    
    
    
    
    
    
    
    settingsTitle: 'Private SpeedDial सेटिंग्स',
    secSync: 'सिंक सेटिंग्स', chooseService: 'सेवा चुनें:',
    loginLabel: 'उपयोगकर्ता नाम:', encKeyLabel: 'सिंक एन्क्रिप्शन कुंजी:',
    encKeyHint: 'सभी डिवाइस पर एक ही कुंजी उपयोग करें। कुंजी बदलने पर डेटा फिर से अपलोड करना होगा।',
    syncModeLabel: 'सिंक मोड:',
    mergeBtn: '🔀 मर्ज (मल्टी-डिवाइस)', toServerBtn: '📤 सर्वर पर',
    fromServerBtn: '📥 सर्वर से',
    mergeExplain: '「मर्ज」 कई कंप्यूटरों के बीच सिंक के लिए अनुशंसित है। सभी डिवाइस का डेटा मर्ज होगा, आइटम का सही विलोपन सहित।',
    syncNowBtn: '⚡ अभी सिंक करें', testConnBtn: '🔌 कनेक्शन जाँचें',
    applyBtn: '✔ लागू करें', doneBtn: 'हो गया', 
    intervalMin: 'अंतराल (मिनट):', autoSync: 'स्वचालित सिंक',
    syncSummaryTitle: 'सिंक आइटम सारांश',
    elementWord: 'आइटम', colServer: 'सर्वर', colBrowser: 'ब्राउज़र',
    secActions: 'क्रियाएँ',
     
    exportFileBtn: '📤 फ़ाइल में निर्यात', importFileBtn: '📥 फ़ाइल से आयात',
    importHtmlBtn: '📥 HTML से आयात', exportHtmlBtn: '📄 HTML में निर्यात',
    importCsvBtn: '📥 CSV से आयात', importFvdBtn: '📥 FVD Speed Dial से आयात',
    exportLogsBtn: '📋 लॉग निर्यात', exportDetailedLogsBtn: '🔬 विस्तृत लॉग निर्यात',
     
    
    
     
    
    
    secDesign: 'डिज़ाइन', themeLabel: 'थीम:',
    themeSystem: 'सिस्टम', themeLight: 'हल्की', themeDark: 'गहरी',
    accentColorLabel: 'एक्सेंट रंग:', tileBgLabel: 'बुकमार्क पृष्ठभूमि:',
    tileTextLabel: 'बुकमार्क टेक्स्ट:', fontLabel: 'फ़ॉन्ट:', fontSizeLabel: 'फ़ॉन्ट आकार:',
    sizeSmall: 'छोटा', sizeNormal: 'सामान्य', sizeLarge: 'बड़ा', sizeXLarge: 'बहुत बड़ा',
    uiOpacityLabel: 'इंटरफ़ेस अपारदर्शिता:', 
     modalOpacityLabel: 'मोडल विंडो अपारदर्शिता:',
    secLanguage: 'इंटरफ़ेस भाषा', chooseLanguage: 'भाषा चुनें:',
    autoOption: 'स्वचालित',
    secProfiles: 'प्रोफ़ाइल', newProfileLabel: 'नई प्रोफ़ाइल:',
    phProfileName: 'प्रोफ़ाइल नाम', btnAdd: '+ जोड़ें', activeWord: 'सक्रिय',
     
     
    
    secBgGallery: 'पृष्ठभूमि गैलरी', btnAddBackground: '+ पृष्ठभूमि जोड़ें',
    bgRotate: 'पृष्ठभूमि स्वतः बदलाव',
    bgSizeWarning: '⚠️ प्रति फ़ाइल 4 MB की सीमा। अधिक होने पर पृष्ठभूमियाँ सिंक नहीं होंगी।',
    modeLabel: 'मोड:', randomOption: 'यादृच्छिक', sortSequential: 'क्रम से',
     
    colName: 'नाम', 
    secImportExport: 'बुकमार्क आयात/निर्यात',
    secSort: 'क्रम और फ़ोल्डर', sortTilesLabel: 'बुकमार्क क्रम:',
    sortNoteFoldersLabel: 'नोट फ़ोल्डर क्रम:', sortTileFoldersLabel: 'बुकमार्क फ़ोल्डर क्रम:',
    sortNotesLabel: 'नोट क्रम:',
    manualDnd: 'मैनुअल (ड्रैग-एंड-ड्रॉप)', manualOption: 'मैनुअल',
     
    sortByDate: 'संशोधन तिथि से', sortByDomain: 'डोमेन से',
    sortNewest: 'नए पहले', sortOldest: 'पुराने पहले',
    tileFoldersFirst: 'फ़ोल्डर के बुकमार्क पहले', noteFoldersFirst: 'फ़ोल्डर के नोट्स पहले',
    showEmptyFolders: 'खाली फ़ोल्डर दिखाएँ', maxDepth: 'अधिकतम गहराई:',
     
     
      
      
    foldersWord: 'फ़ोल्डर', noteFoldersWord: 'नोट फ़ोल्डर', tilesWord: 'बुकमार्क',
    tombstonesWord: 'Tombstones (विलोपन)',
      
    
    
    
      
     
    supportProject: '❤️ प्रोजेक्ट को समर्थन दें', 
    cloudPlaintextNote: 'डेटा क्लाउड के साथ सादे टेक्स्ट (JSON) में सिंक होता है। एंड-टू-एंड एन्क्रिप्शन के लिए नीचे 「सिंक एन्क्रिप्शन कुंजी」 फ़ील्ड भरें।',
    encKeyNotSet: 'एन्क्रिप्शन कुंजी सेट नहीं है।',
    mailruHint: 'Mail.ru बाहरी प्रोग्रामों के लिए ऐप पासवर्ड माँग सकता है।',
    boxHint: 'Box में बनाएँ और उसकी ID दर्ज करें। Box फ़ाइल स्वतः नहीं बनाता।',
    createEmptyFile: 'एक खाली फ़ाइल बनाएँ',
    yandexRights: '। अनुमतियाँ: cloud_api:disk.app_folder या read+write।',
    getItAt: 'यहाँ प्राप्त करें',
    faviconSourceLabel: 'फ़ेविकॉन स्रोत:', faviconLocal: 'स्थानीय (साइट से, निजी)',
    faviconGoogle: 'Google (बाहरी सेवा)',
},
ar: {
    searchBookmarks: '...ابحث في الإشارات والملاحظات', searchWeb: '...ابحث في الويب',
    addTile: 'إضافة إشارة مرجعية', theme: 'السمة', sync: 'المزامنة',
    settings: 'الإعدادات', pinHeader: 'طيّ الشريط العلوي', bgGallery: 'معرض الخلفيات',
    lock: 'قفل', profile: 'الملف الشخصي', 
    notes: 'الملاحظات', collapseSidebar: 'طيّ', expandSidebar: 'توسيع',
    addNote: 'إضافة ملاحظة', all: 'الكل',edit: 'تحرير', moveToFolder: 'نقل', delete: 'حذف',
    editFolder: 'تحرير', setFolderPassword: 'كلمة المرور', deleteFolder: 'حذف',
    editNoteFolder: 'تحرير', deleteNoteFolder: 'حذف',
    editNote: 'تحرير', deleteNote: 'حذف',
    addTileModal: 'إضافة إشارة مرجعية', editTileModal: 'تحرير الإشارة المرجعية',
    titleOptional: ':العنوان', url: ':URL', folder: ':المجلد', iconUrl: ':الأيقونة',
    bgType: ':الخلفية', color: 'لون', image: 'صورة',
    bgColor: ':لون الخلفية', bgImageUrl: ':رابط الصورة',
    textColor: ':لون النص', opacity: 'التعتيم', iconOpacity: 'تعتيم الأيقونة',
    showTitle: 'إظهار العنوان',save: 'حفظ', cancel: 'إلغاء', noFolder: 'بدون',
    history: 'السجل', close: 'إغلاق',
    createFolder: 'إنشاء مجلد', editFolderModal: 'تحرير المجلد',
    folderName: ':الاسم', folderColor: ':اللون', folderPassword: ':كلمة المرور',
    folderParent: ':المجلد الأصل', createNoteFolder: 'مجلد الملاحظات',
    editNoteFolderModal: 'تحرير مجلد الملاحظات',
    addNoteModal: 'إضافة ملاحظة', editNoteModal: 'تحرير الملاحظة',
    noteTitle: ':العنوان', noteContent: ':المحتوى',
     loading: '...جارٍ التحميل',
     
    deleteConfirm: 'حذف؟', deleteNoteConfirm: 'حذف الملاحظة؟',
    deleteFolderConfirm: 'حذف المجلد؟', deleteNoteFolderConfirm: 'حذف مجلد الملاحظات؟',
    wrongPassword: 'كلمة مرور خاطئة',
    syncError: ':خطأ ',
    
    
    importFvdConfirmRepeat: 'ربما تم استيراد FVD Speed Dial من قبل. هل تريد المتابعة؟',
    importFvdTooLarge: 'الملف كبير جداً. الحد الأقصى 20 ميغابايت.',
    toastSyncing: '...🔄 جارٍ المزامنة',
    
    toastDataUpdated: '🔄 تم تحديث البيانات',
    plaintextWarning: '⚠️ مفتاح التشفير فارغ — تُرسل البيانات إلى السحابة كنص صريح',
    ok: 'حسناً', autoColorShort: 'تلقائي', tileOpacity: ':تعتيم الإشارة المرجعية',
    opacityLabel: ':التعتيم',
    protocolHint: 'البروتوكول اختياري — سيُضاف تلقائياً',
    ctxEdit: '✏️ تحرير', ctxResetNesting: '↩️ إعادة تعيين التداخل',
    ctxShowEmpty: '👁 إظهار/إخفاء الفارغة', ctxMove: '📁 نقل',
    ctxSortManual: '📋 الفرز: يدوي', ctxPassword: '🔒 كلمة المرور',
    ctxSortAsc: '🔤 حسب الاسم A→Z', ctxSortDesc: '🔤 حسب الاسم Z→A',
    ctxDelete: '🗑️ حذف', 
    tileTitlePh: 'عنوان الإشارة',
    
    
    
    
    
    
    
    
    
    settingsTitle: 'إعدادات Private SpeedDial',
    secSync: 'إعدادات المزامنة', chooseService: ':اختر خدمة',
    loginLabel: ':اسم المستخدم', encKeyLabel: ':مفتاح تشفير المزامنة',
    encKeyHint: 'استخدم المفتاح نفسه على جميع الأجهزة. عند تغييره يجب إعادة رفع البيانات.',
    syncModeLabel: ':وضع المزامنة',
    mergeBtn: '🔀 دمج (متعدد الأجهزة)', toServerBtn: '📤 إلى الخادم',
    fromServerBtn: '📥 من الخادم',
    mergeExplain: '«الدمج» موصى به للمزامنة بين عدة أجهزة كمبيوتر. ستُدمج بيانات جميع الأجهزة، بما في ذلك الحذف الصحيح للعناصر.',
    syncNowBtn: '⚡ مزامنة الآن', testConnBtn: '🔌 اختبار الاتصال',
    applyBtn: '✔ تطبيق', doneBtn: 'تم', 
    intervalMin: ':(الفاصل (دقائق', autoSync: 'مزامنة تلقائية',
    syncSummaryTitle: 'ملخص عناصر المزامنة',
    elementWord: 'العنصر', colServer: 'الخادم', colBrowser: 'المتصفح',
    secActions: 'إجراءات',
     
    exportFileBtn: '📤 تصدير إلى ملف', importFileBtn: '📥 استيراد من ملف',
    importHtmlBtn: '📥 استيراد من HTML', exportHtmlBtn: '📄 تصدير إلى HTML',
    importCsvBtn: '📥 استيراد من CSV', importFvdBtn: '📥 استيراد من FVD Speed Dial',
    exportLogsBtn: '📋 تصدير السجلات', exportDetailedLogsBtn: '🔬 تصدير السجلات المفصلة',
     
    
    
     
    
    
    secDesign: 'التصميم', themeLabel: ':السمة',
    themeSystem: 'النظام', themeLight: 'فاتحة', themeDark: 'داكنة',
    accentColorLabel: ':اللون المميز', tileBgLabel: ':خلفية الإشارات المرجعية',
    tileTextLabel: ':نص الإشارات المرجعية', fontLabel: ':الخط', fontSizeLabel: ':حجم الخط',
    sizeSmall: 'صغير', sizeNormal: 'عادي', sizeLarge: 'كبير', sizeXLarge: 'كبير جداً',
    uiOpacityLabel: ':تعتيم الواجهة', 
     modalOpacityLabel: ':تعتيم النوافذ المنبثقة',
    secLanguage: 'لغة الواجهة', chooseLanguage: ':اختر اللغة',
    autoOption: 'تلقائي',
    secProfiles: 'الملفات الشخصية', newProfileLabel: ':ملف شخصي جديد',
    phProfileName: 'اسم الملف الشخصي', btnAdd: '+ إضافة', activeWord: 'نشط',
     
     
    
    secBgGallery: 'معرض الخلفيات', btnAddBackground: '+ إضافة خلفية',
    bgRotate: 'التبديل التلقائي للخلفيات',
    bgSizeWarning: '⚠️ الحد 4 ميغابايت لكل ملف. عند التجاوز لن تُزامَن الخلفيات.',
    modeLabel: ':الوضع', randomOption: 'عشوائي', sortSequential: 'بالتتابع',
     
    colName: 'الاسم', 
    secImportExport: 'استيراد/تصدير الإشارات',
    secSort: 'الفرز والمجلدات', sortTilesLabel: ':فرز الإشارات المرجعية',
    sortNoteFoldersLabel: ':فرز مجلدات الملاحظات', sortTileFoldersLabel: ':فرز مجلدات الإشارات المرجعية',
    sortNotesLabel: ':فرز الملاحظات',
    manualDnd: 'يدوي (سحب وإفلات)', manualOption: 'يدوي',
     
    sortByDate: 'حسب تاريخ التعديل', sortByDomain: 'حسب النطاق',
    sortNewest: 'الأحدث أولاً', sortOldest: 'الأقدم أولاً',
    tileFoldersFirst: 'إشارات المجلدات المرجعية أولاً', noteFoldersFirst: 'ملاحظات المجلدات أولاً',
    showEmptyFolders: 'إظهار المجلدات الفارغة', maxDepth: ':أقصى عمق',
     
     
      
      
    foldersWord: 'المجلدات', noteFoldersWord: 'مجلدات الملاحظات', tilesWord: 'الإشارات المرجعية',
    tombstonesWord: 'Tombstones (عمليات الحذف)',
      
    
    
    
      
     
    supportProject: '❤️ ادعم المشروع', 
    cloudPlaintextNote: 'تُزامَن البيانات مع السحابة كنص صريح (JSON). للتشفير الطرفي املأ حقل «مفتاح تشفير المزامنة» أدناه.',
    encKeyNotSet: 'لم يُعيَّن مفتاح التشفير.',
    mailruHint: 'قد يتطلب Mail.ru كلمة مرور تطبيق للبرامج الخارجية.',
    boxHint: 'في Box وأدخل معرّفه. Box لا ينشئ الملف تلقائياً.',
    createEmptyFile: 'أنشئ ملفاً فارغاً',
    yandexRights: '. الصلاحيات: cloud_api:disk.app_folder أو read+write.',
    getItAt: 'احصل عليه من',
    faviconSourceLabel: ':مصدر الأيقونات', faviconLocal: 'محلي (من الموقع، خاص)',
    faviconGoogle: 'Google (خدمة خارجية)',
}
};

/* v6.9.0: дополнительные ключи (динамические статусы popup, заголовки модалок)
   и уточнённые значения ru под существующую разметку. */
const translationsExtra = {
en: {
    
    
      
     popupWait: '⏳ Please wait {n} s',
     popupProfileActivated: '✅ Profile "{name}" activated',
    
    enterPasswordTitle: 'Enter password', noteContentMd: 'Content (Markdown):',
    phExampleUrl: 'example.com or https://example.com',
    autoColorTitle: 'Automatically pick colors from the icon',
    createNoteFolderTitle: 'Create note folder',
    folderTileColor: 'Bookmark folder color:', folderNoteColor: 'Note folder color:',
    sortByNameAscP: 'By name (A→Z)', sortByNameDescP: 'By name (Z→A)',
    footerAuthor: 'Developed by Konstantin Eryomin', supportLink: 'Support the project',
    privacyPolicy: 'Privacy Policy'},
ru: {
    
    
      
     popupWait: '⏳ Подождите {n} с',
     popupProfileActivated: '✅ Профиль «{name}» активирован',
    
    enterPasswordTitle: 'Введите пароль', noteContentMd: 'Содержание (Markdown):',
    phExampleUrl: 'example.com или https://example.com',
    autoColorTitle: 'Автоматически подобрать цвета по иконке',
    createNoteFolderTitle: 'Создать папку заметок',
    folderTileColor: 'Цвет папки закладок:', folderNoteColor: 'Цвет папки заметок:',
    sortByNameAscP: 'По названию (А→Я)', sortByNameDescP: 'По названию (Я→А)',
    footerAuthor: 'Приложение разработано Константином Ерёминым', supportLink: 'Поддержать проект', privacyPolicy: 'Политика конфиденциальности',
    
    /* уточнения под существующую разметку */
    maxDepth: 'Макс. вложенность:',
    
    
    
    
    
    
    
    syncSummaryTitle: 'Сводка синхронизируемых элементов',
    activeWord: 'Активный',
    protocolHint: 'Протокол можно не указывать — подставится автоматически',
    autoOption: 'Автоматически',
    mailruHint: 'Для Mail.ru может потребоваться пароль для внешних приложений.',
    cloudPlaintextNote: 'Данные синхронизируются с облаком в открытом виде (JSON). Для сквозного шифрования заполните поле «Ключ шифрования синхронизации» ниже.',
    encKeyHint: 'Используйте тот же ключ на всех устройствах. При смене — данные придётся загрузить заново.'
},
de: {
    
    
      
     popupWait: '⏳ Bitte {n} s warten',
     popupProfileActivated: '✅ Profil „{name}“ aktiviert',
    
    enterPasswordTitle: 'Passwort eingeben', noteContentMd: 'Inhalt (Markdown):',
    phExampleUrl: 'example.com oder https://example.com',
    autoColorTitle: 'Farben automatisch aus dem Symbol wählen',
    createNoteFolderTitle: 'Notizordner erstellen',
    folderTileColor: 'Farbe des Lesezeichenordners:', folderNoteColor: 'Farbe des Notizordners:',
    sortByNameAscP: 'Nach Name (A→Z)', sortByNameDescP: 'Nach Name (Z→A)',
    footerAuthor: 'Entwickelt von Konstantin Eryomin', supportLink: 'Projekt unterstützen',
    privacyPolicy: 'Datenschutzerklärung'},
es: {
    
    
      
     popupWait: '⏳ Espere {n} s',
     popupProfileActivated: '✅ Perfil «{name}» activado',
    
    enterPasswordTitle: 'Introduzca la contraseña', noteContentMd: 'Contenido (Markdown):',
    phExampleUrl: 'example.com o https://example.com',
    autoColorTitle: 'Elegir colores automáticamente del icono',
    createNoteFolderTitle: 'Crear carpeta de notas',
    folderTileColor: 'Color de carpeta de marcadores:', folderNoteColor: 'Color de carpeta de notas:',
    sortByNameAscP: 'Por nombre (A→Z)', sortByNameDescP: 'Por nombre (Z→A)',
    footerAuthor: 'Desarrollado por Konstantin Eryomin', supportLink: 'Apoyar el proyecto',
    privacyPolicy: 'Política de privacidad'},
fr: {
    
    
      
     popupWait: '⏳ Patientez {n} s',
     popupProfileActivated: '✅ Profil « {name} » activé',
    
    enterPasswordTitle: 'Saisir le mot de passe', noteContentMd: 'Contenu (Markdown) :',
    phExampleUrl: 'example.com ou https://example.com',
    autoColorTitle: 'Choisir automatiquement les couleurs depuis l’icône',
    createNoteFolderTitle: 'Créer un dossier de notes',
    folderTileColor: 'Couleur du dossier de signets :', folderNoteColor: 'Couleur du dossier de notes :',
    sortByNameAscP: 'Par nom (A→Z)', sortByNameDescP: 'Par nom (Z→A)',
    footerAuthor: 'Développé par Konstantin Eryomin', supportLink: 'Soutenir le projet',
    privacyPolicy: 'Politique de confidentialité'},
it: {
    
    
      
     popupWait: '⏳ Attendi {n} s',
     popupProfileActivated: '✅ Profilo «{name}» attivato',
    
    enterPasswordTitle: 'Inserisci la password', noteContentMd: 'Contenuto (Markdown):',
    phExampleUrl: 'example.com o https://example.com',
    autoColorTitle: 'Scegli automaticamente i colori dall’icona',
    createNoteFolderTitle: 'Crea cartella delle note',
    folderTileColor: 'Colore cartella dei segnalibri:', folderNoteColor: 'Colore cartella delle note:',
    sortByNameAscP: 'Per nome (A→Z)', sortByNameDescP: 'Per nome (Z→A)',
    footerAuthor: 'Sviluppato da Konstantin Eryomin', supportLink: 'Sostieni il progetto',
    privacyPolicy: 'Informativa sulla privacy'},
pt: {
    
    
      
     popupWait: '⏳ Aguarde {n} s',
     popupProfileActivated: '✅ Perfil «{name}» ativado',
    
    enterPasswordTitle: 'Digite a senha', noteContentMd: 'Conteúdo (Markdown):',
    phExampleUrl: 'example.com ou https://example.com',
    autoColorTitle: 'Escolher cores automaticamente pelo ícone',
    createNoteFolderTitle: 'Criar pasta de notas',
    folderTileColor: 'Cor da pasta de marcadores:', folderNoteColor: 'Cor da pasta de notas:',
    sortByNameAscP: 'Por nome (A→Z)', sortByNameDescP: 'Por nome (Z→A)',
    footerAuthor: 'Desenvolvido por Konstantin Eryomin', supportLink: 'Apoiar o projeto',
    privacyPolicy: 'Política de privacidade'},
zh: {
    
    
      
     popupWait: '⏳ 请等待 {n} 秒',
     popupProfileActivated: '✅ 配置文件「{name}」已激活',
    
    enterPasswordTitle: '输入密码', noteContentMd: '内容（Markdown）：',
    phExampleUrl: 'example.com 或 https://example.com',
    autoColorTitle: '根据图标自动选择颜色',
    createNoteFolderTitle: '创建笔记文件夹',
    folderTileColor: '书签文件夹颜色：', folderNoteColor: '笔记文件夹颜色：',
    sortByNameAscP: '按名称（A→Z）', sortByNameDescP: '按名称（Z→A）',
    footerAuthor: '由 Konstantin Eryomin 开发', supportLink: '支持项目',
    privacyPolicy: '隐私政策'},
ja: {
    
    
      
     popupWait: '⏳ {n} 秒お待ちください',
     popupProfileActivated: '✅ プロファイル「{name}」を有効化しました',
    
    enterPasswordTitle: 'パスワードを入力', noteContentMd: '内容（Markdown）:',
    phExampleUrl: 'example.com または https://example.com',
    autoColorTitle: 'アイコンから色を自動選択',
    createNoteFolderTitle: 'メモフォルダーを作成',
    folderTileColor: 'ブックマークフォルダーの色:', folderNoteColor: 'メモフォルダーの色:',
    sortByNameAscP: '名前順（A→Z）', sortByNameDescP: '名前順（Z→A）',
    footerAuthor: '開発: Konstantin Eryomin', supportLink: 'プロジェクトを支援',
    privacyPolicy: 'プライバシーポリシー'},
ko: {
    
    
      
     popupWait: '⏳ {n}초 기다려 주세요',
     popupProfileActivated: '✅ 프로필 「{name}」 활성화됨',
    
    enterPasswordTitle: '비밀번호 입력', noteContentMd: '내용(Markdown):',
    phExampleUrl: 'example.com 또는 https://example.com',
    autoColorTitle: '아이콘에서 자동으로 색상 선택',
    createNoteFolderTitle: '메모 폴더 만들기',
    folderTileColor: '북마크 폴더 색상:', folderNoteColor: '메모 폴더 색상:',
    sortByNameAscP: '이름순 (A→Z)', sortByNameDescP: '이름순 (Z→A)',
    footerAuthor: '개발: Konstantin Eryomin', supportLink: '프로젝트 후원',
    privacyPolicy: '개인정보 처리방침'},
tr: {
    
    
      
     popupWait: '⏳ {n} sn bekleyin',
     popupProfileActivated: '✅ «{name}» profili etkinleştirildi',
    
    enterPasswordTitle: 'Parolayı girin', noteContentMd: 'İçerik (Markdown):',
    phExampleUrl: 'example.com veya https://example.com',
    autoColorTitle: 'Renkleri simgeden otomatik seç',
    createNoteFolderTitle: 'Not klasörü oluştur',
    folderTileColor: 'Yer işareti klasörü rengi:', folderNoteColor: 'Not klasörü rengi:',
    sortByNameAscP: 'Ada göre (A→Z)', sortByNameDescP: 'Ada göre (Z→A)',
    footerAuthor: 'Geliştiren: Konstantin Eryomin', supportLink: 'Projeyi destekle',
    privacyPolicy: 'Gizlilik politikası'},
hi: {
    
    
    
    
    
    
    popupWait: 'प्रतीक्षा करें... {n}',
    
    popupProfileActivated: 'प्रोफ़ाइल सक्रिय: {name}',
    
    enterPasswordTitle: 'पासवर्ड दर्ज करें',
    noteContentMd: 'सामग्री (Markdown):',
    phExampleUrl: 'https://example.com',
    autoColorTitle: 'स्वतः रंग',
    createNoteFolderTitle: 'नोट फ़ोल्डर बनाएँ',
    folderTileColor: 'बुकमार्क रंग:',
    folderNoteColor: 'नोट रंग:',
    sortByNameAscP: 'नाम से (A→Z)',
    sortByNameDescP: 'नाम से (Z→A)',
    footerAuthor: 'Private SpeedDial © 2026',
    supportLink: 'प्रोजेक्ट को समर्थन दें',
    privacyPolicy: 'गोपनीयता नीति'},
ar: {
    
    
    
    
    
    
    popupWait: '...انتظر {n}',
    
    popupProfileActivated: 'الملف النشط: {name}',
    
    enterPasswordTitle: 'أدخل كلمة المرور',
    noteContentMd: ':(المحتوى (Markdown',
    phExampleUrl: 'https://example.com',
    autoColorTitle: 'اللون التلقائي',
    createNoteFolderTitle: 'إنشاء مجلد ملاحظات',
    folderTileColor: ':لون الإشارة المرجعية',
    folderNoteColor: ':لون الملاحظة',
    sortByNameAscP: 'حسب الاسم (A→Z)',
    sortByNameDescP: 'حسب الاسم (Z→A)',
    footerAuthor: 'Private SpeedDial © 2026',
    supportLink: 'ادعم المشروع',
    privacyPolicy: 'سياسة الخصوصية'}
};

Object.keys(translationsExtra).forEach(lang => {
    if (translations[lang]) Object.assign(translations[lang], translationsExtra[lang]);
});

/* Строки уведомлений, статусов и ошибок (v6.9.2) */
const translationsToast = {
en: {
    badProfileName: 'Profile name must be 1–50 characters',
    badUrl: 'Invalid URL',
    bookmarkN: 'Bookmark {n}',
    boxBadToken: 'Box: authorization expired. Reconnect in settings.',
    boxConflict: 'Box: version conflict, retrying…',
    boxNoFileId: 'Box: file ID not found, will re-upload',
    cntBookmarks: '{n} bookmarks',
    cntFolders: '{n} folders',
    cntNoteFolders: '{n} note folders',
    cntNotes: '{n} notes',
    cntTiles: '{n} bookmarks',
    codePrefix: 'code ',
    confirmDelProfile: 'Delete profile "{name}"? All its data will be lost.',
    conflictOnlyLocal: 'Local only: {list}',
    conflictOnlyServer: 'Server only: {list}',
    conflictResolving: 'Resolving conflict: {choice}…',
    dbBadToken: 'Dropbox: authorization expired. Reconnect in settings.',
    dbRateLimit: 'Dropbox: rate limit exceeded, try again later',
    droppedNotes: 'notes skipped: {n}',
    droppedTiles: 'bookmarks skipped: {n}',
    dupNotes: 'duplicate notes: {n}',
    dupUrlMsg: 'A bookmark with this URL already exists: {title}',
    errAuth401: 'Authorization failed (401). Check login/password or token.',
    errConflict409: 'Version conflict (409). Sync again.',
    errCryptoFormat: 'Invalid encrypted data format',
    errForbidden403: 'Access denied (403). Check permissions.',
    errNetOffline: 'No network connection',
    errNoSpace507: 'Not enough space on the server (507)',
    errNotFound404: 'Resource not found (404)',
    errServer5xx: 'Server error ({code}). Try again later.',
    errTooMany429: 'Too many requests (429). Try again later.',
    
    fvdFolderN: 'Folder {n}',
    fvdImportDone: 'Import complete: {parts}',
    fvdNoteFolderN: 'Note folder {n}',
    importedCount: 'Imported: {n}',
    
    mailruBadCreds: 'Mail.ru: invalid credentials',
    mailruNoCreds: 'Mail.ru: enter email and app password',
    mailruNoSpace: 'Mail.ru: not enough disk space',
    noActiveConflict: 'No active conflict',
    noLinksFound: 'No links found in the file',
    noValidUrls: 'No valid URLs found',
    noteN: 'Note {n}',
    odBadToken: 'OneDrive: authorization expired. Reconnect in settings.',
    odBadTokenExp: 'OneDrive: token expired, re-authenticating…',
    odRateLimit: 'OneDrive: rate limit exceeded, try again later',
    odTooBig: 'OneDrive: file too large ({size} MB)',
    payloadTooBig: 'Payload too large even without backgrounds ({size} MB). Reduce the number of items or disable encryption.',
    pcBadLink: 'pCloud: failed to get download link',
    pcErr: 'pCloud: error {err}',
    profileAdded: 'Profile "{name}" added',
    profileNotFound: 'Profile not found',
    profileRenamed: 'Profile renamed to "{name}"',
    secShort: 's',
    serverEmptyUploaded: 'Server empty — local data uploaded',
    settingsIncomplete: 'Sync settings are incomplete',
    showMoreN: 'Show {n} more',
    srvBadKeys: 'Server data contains unknown fields: {keys}',
    srvDecryptFail: 'Decryption failed: {msg}',
    srvEncNoKeyFull: 'Server data is encrypted, but no encryption key is set. Enter the key in settings.',
    srvEncNoKeyShort: 'Data is encrypted, no key',
    srvUnknownFormatType: 'Unknown server data format: {type}',
    syncInProgress: 'Sync already in progress',
    syncSettingsEmpty: 'Sync settings are empty',
    unknownProvider: 'Unknown sync provider: ',
    unknownStrategy: 'Unknown conflict strategy: ',
    uploadFailPrefix: 'Upload failed: ',
    uploadGuard: 'Upload blocked: local data is empty and server data would be overwritten',
    urlRequired: 'URL is required',
    yaBadResponseDl: 'Yandex.Disk: invalid response when downloading',
    yaBadResponseUl: 'Yandex.Disk: invalid response when uploading',
    yaBadToken: 'Yandex.Disk: authorization failed. Check the token.',
    yaBadTokenNew: 'Yandex.Disk: token expired. Get a new token.',
    yaFolderErr: 'Yandex.Disk: folder error: {msg}',
    yaFolderFail: 'Yandex.Disk: failed to create folder (HTTP {code})',
    yaForbidden: 'Yandex.Disk: access denied',
    yaNoSpace: 'Yandex.Disk: not enough disk space',
    yaNoToken: 'Yandex.Disk: token is not set'
},
ru: {
    badProfileName: 'Имя профиля должно содержать от 1 до 50 символов',
    badUrl: 'Некорректный URL',
    bookmarkN: 'Закладка {n}',
    boxBadToken: 'Box: авторизация истекла. Переподключите в настройках.',
    boxConflict: 'Box: конфликт версий, повторная попытка…',
    boxNoFileId: 'Box: ID файла не найден, будет выполнена повторная загрузка',
    cntBookmarks: '{n} закладок',
    cntFolders: '{n} папок',
    cntNoteFolders: '{n} папок заметок',
    cntNotes: '{n} заметок',
    cntTiles: '{n} закладок',
    codePrefix: 'код ',
    confirmDelProfile: 'Удалить профиль «{name}»? Все его данные будут потеряны.',
    conflictOnlyLocal: 'Только локально: {list}',
    conflictOnlyServer: 'Только на сервере: {list}',
    conflictResolving: 'Разрешение конфликта: {choice}…',
    dbBadToken: 'Dropbox: авторизация истекла. Переподключите в настройках.',
    dbRateLimit: 'Dropbox: превышен лимит запросов, повторите позже',
    droppedNotes: 'пропущено заметок: {n}',
    droppedTiles: 'пропущено закладок: {n}',
    dupNotes: 'дубликатов заметок: {n}',
    dupUrlMsg: 'Закладка с таким URL уже существует: {title}',
    errAuth401: 'Ошибка авторизации (401). Проверьте логин/пароль или токен.',
    errConflict409: 'Конфликт версий (409). Повторите синхронизацию.',
    errCryptoFormat: 'Неверный формат зашифрованных данных',
    errForbidden403: 'Доступ запрещён (403). Проверьте права доступа.',
    errNetOffline: 'Нет подключения к сети',
    errNoSpace507: 'Недостаточно места на сервере (507)',
    errNotFound404: 'Ресурс не найден (404)',
    errServer5xx: 'Ошибка сервера ({code}). Повторите позже.',
    errTooMany429: 'Слишком много запросов (429). Повторите позже.',
    
    fvdFolderN: 'Папка {n}',
    fvdImportDone: 'Импорт завершён: {parts}',
    fvdNoteFolderN: 'Папка заметок {n}',
    importedCount: 'Импортировано: {n}',
    
    mailruBadCreds: 'Mail.ru: неверные учётные данные',
    mailruNoCreds: 'Mail.ru: укажите email и пароль приложения',
    mailruNoSpace: 'Mail.ru: недостаточно места на диске',
    noActiveConflict: 'Нет активного конфликта',
    noLinksFound: 'Ссылки в файле не найдены',
    noValidUrls: 'Корректные URL не найдены',
    noteN: 'Заметка {n}',
    odBadToken: 'OneDrive: авторизация истекла. Переподключите в настройках.',
    odBadTokenExp: 'OneDrive: токен истёк, повторная аутентификация…',
    odRateLimit: 'OneDrive: превышен лимит запросов, повторите позже',
    odTooBig: 'OneDrive: файл слишком большой ({size} МБ)',
    payloadTooBig: 'Данные слишком большие даже без фонов ({size} МБ). Сократите количество элементов или выключите шифрование.',
    pcBadLink: 'pCloud: не удалось получить ссылку для скачивания',
    pcErr: 'pCloud: ошибка {err}',
    profileAdded: 'Профиль «{name}» добавлен',
    profileNotFound: 'Профиль не найден',
    profileRenamed: 'Профиль переименован в «{name}»',
    secShort: 'с',
    serverEmptyUploaded: 'Сервер пуст — выполнена выгрузка локальных данных',
    settingsIncomplete: 'Настройки синхронизации не заполнены',
    showMoreN: 'Показать ещё {n}',
    srvBadKeys: 'Данные сервера содержат неизвестные поля: {keys}',
    srvDecryptFail: 'Не удалось расшифровать: {msg}',
    srvEncNoKeyFull: 'Данные на сервере зашифрованы, но ключ шифрования не задан. Укажите ключ в настройках.',
    srvEncNoKeyShort: 'Данные зашифрованы, нет ключа',
    srvUnknownFormatType: 'Неизвестный формат данных сервера: {type}',
    syncInProgress: 'Синхронизация уже выполняется',
    syncSettingsEmpty: 'Настройки синхронизации пусты',
    unknownProvider: 'Неизвестный провайдер синхронизации: ',
    unknownStrategy: 'Неизвестная стратегия разрешения конфликта: ',
    uploadFailPrefix: 'Ошибка выгрузки: ',
    uploadGuard: 'Выгрузка заблокирована: локальные данные пусты, данные на сервере были бы перезаписаны',
    urlRequired: 'Укажите URL',
    yaBadResponseDl: 'Яндекс.Диск: некорректный ответ при скачивании',
    yaBadResponseUl: 'Яндекс.Диск: некорректный ответ при загрузке',
    yaBadToken: 'Яндекс.Диск: ошибка авторизации. Проверьте токен.',
    yaBadTokenNew: 'Яндекс.Диск: токен истёк. Получите новый токен.',
    yaFolderErr: 'Яндекс.Диск: ошибка папки: {msg}',
    yaFolderFail: 'Яндекс.Диск: не удалось создать папку (HTTP {code})',
    yaForbidden: 'Яндекс.Диск: доступ запрещён',
    yaNoSpace: 'Яндекс.Диск: недостаточно места на диске',
    yaNoToken: 'Яндекс.Диск: токен не задан'
},
de: {
    badProfileName: 'Profilname muss 1–50 Zeichen lang sein',
    badUrl: 'Ungültige URL',
    bookmarkN: 'Lesezeichen {n}',
    boxBadToken: 'Box: Autorisierung abgelaufen. In den Einstellungen neu verbinden.',
    boxConflict: 'Box: Versionskonflikt, erneuter Versuch…',
    boxNoFileId: 'Box: Datei-ID nicht gefunden, wird erneut hochgeladen',
    cntBookmarks: '{n} Lesezeichen',
    cntFolders: '{n} Ordner',
    cntNoteFolders: '{n} Notizordner',
    cntNotes: '{n} Notizen',
    cntTiles: '{n} Lesezeichen',
    codePrefix: 'Code ',
    confirmDelProfile: 'Profil „{name}“ löschen? Alle Daten gehen verloren.',
    conflictOnlyLocal: 'Nur lokal: {list}',
    conflictOnlyServer: 'Nur auf dem Server: {list}',
    conflictResolving: 'Konflikt wird aufgelöst: {choice}…',
    dbBadToken: 'Dropbox: Autorisierung abgelaufen. In den Einstellungen neu verbinden.',
    dbRateLimit: 'Dropbox: Anfragelimit überschritten, später erneut versuchen',
    droppedNotes: 'Notizen übersprungen: {n}',
    droppedTiles: 'Lesezeichen übersprungen: {n}',
    dupNotes: 'doppelte Notizen: {n}',
    dupUrlMsg: 'Ein Lesezeichen mit dieser URL existiert bereits: {title}',
    errAuth401: 'Autorisierung fehlgeschlagen (401). Login/Passwort oder Token prüfen.',
    errConflict409: 'Versionskonflikt (409). Erneut synchronisieren.',
    errCryptoFormat: 'Ungültiges Format der verschlüsselten Daten',
    errForbidden403: 'Zugriff verweigert (403). Berechtigungen prüfen.',
    errNetOffline: 'Keine Netzwerkverbindung',
    errNoSpace507: 'Nicht genügend Speicherplatz auf dem Server (507)',
    errNotFound404: 'Ressource nicht gefunden (404)',
    errServer5xx: 'Serverfehler ({code}). Später erneut versuchen.',
    errTooMany429: 'Zu viele Anfragen (429). Später erneut versuchen.',
    
    fvdFolderN: 'Ordner {n}',
    fvdImportDone: 'Import abgeschlossen: {parts}',
    fvdNoteFolderN: 'Notizordner {n}',
    importedCount: 'Importiert: {n}',
    
    mailruBadCreds: 'Mail.ru: ungültige Zugangsdaten',
    mailruNoCreds: 'Mail.ru: E-Mail und App-Passwort eingeben',
    mailruNoSpace: 'Mail.ru: nicht genügend Speicherplatz',
    noActiveConflict: 'Kein aktiver Konflikt',
    noLinksFound: 'Keine Links in der Datei gefunden',
    noValidUrls: 'Keine gültigen URLs gefunden',
    noteN: 'Notiz {n}',
    odBadToken: 'OneDrive: Autorisierung abgelaufen. In den Einstellungen neu verbinden.',
    odBadTokenExp: 'OneDrive: Token abgelaufen, erneute Authentifizierung…',
    odRateLimit: 'OneDrive: Anfragelimit überschritten, später erneut versuchen',
    odTooBig: 'OneDrive: Datei zu groß ({size} MB)',
    payloadTooBig: 'Datenmenge zu groß, selbst ohne Hintergründe ({size} MB). Reduzieren Sie die Anzahl der Elemente oder deaktivieren Sie die Verschlüsselung.',
    pcBadLink: 'pCloud: Download-Link konnte nicht abgerufen werden',
    pcErr: 'pCloud: Fehler {err}',
    profileAdded: 'Profil „{name}“ hinzugefügt',
    profileNotFound: 'Profil nicht gefunden',
    profileRenamed: 'Profil umbenannt in „{name}“',
    secShort: 's',
    serverEmptyUploaded: 'Server leer — lokale Daten hochgeladen',
    settingsIncomplete: 'Synchronisierungseinstellungen unvollständig',
    showMoreN: '{n} weitere anzeigen',
    srvBadKeys: 'Serverdaten enthalten unbekannte Felder: {keys}',
    srvDecryptFail: 'Entschlüsselung fehlgeschlagen: {msg}',
    srvEncNoKeyFull: 'Serverdaten sind verschlüsselt, aber kein Schlüssel gesetzt. Schlüssel in den Einstellungen eingeben.',
    srvEncNoKeyShort: 'Daten verschlüsselt, kein Schlüssel',
    srvUnknownFormatType: 'Unbekanntes Serverdatenformat: {type}',
    syncInProgress: 'Synchronisierung läuft bereits',
    syncSettingsEmpty: 'Synchronisierungseinstellungen sind leer',
    unknownProvider: 'Unbekannter Sync-Anbieter: ',
    unknownStrategy: 'Unbekannte Konfliktstrategie: ',
    uploadFailPrefix: 'Upload fehlgeschlagen: ',
    uploadGuard: 'Upload blockiert: lokale Daten sind leer, Serverdaten würden überschrieben',
    urlRequired: 'URL ist erforderlich',
    yaBadResponseDl: 'Yandex.Disk: ungültige Antwort beim Herunterladen',
    yaBadResponseUl: 'Yandex.Disk: ungültige Antwort beim Hochladen',
    yaBadToken: 'Yandex.Disk: Autorisierung fehlgeschlagen. Token prüfen.',
    yaBadTokenNew: 'Yandex.Disk: Token abgelaufen. Neuen Token erstellen.',
    yaFolderErr: 'Yandex.Disk: Ordnerfehler: {msg}',
    yaFolderFail: 'Yandex.Disk: Ordner konnte nicht erstellt werden (HTTP {code})',
    yaForbidden: 'Yandex.Disk: Zugriff verweigert',
    yaNoSpace: 'Yandex.Disk: nicht genügend Speicherplatz',
    yaNoToken: 'Yandex.Disk: Token nicht gesetzt'
},
es: {
    badProfileName: 'El nombre del perfil debe tener entre 1 y 50 caracteres',
    badUrl: 'URL no válida',
    bookmarkN: 'Marcador {n}',
    boxBadToken: 'Box: autorización caducada. Vuelva a conectar en ajustes.',
    boxConflict: 'Box: conflicto de versiones, reintentando…',
    boxNoFileId: 'Box: ID de archivo no encontrado, se volverá a subir',
    cntBookmarks: '{n} marcadores',
    cntFolders: '{n} carpetas',
    cntNoteFolders: '{n} carpetas de notas',
    cntNotes: '{n} notas',
    cntTiles: '{n} marcadores',
    codePrefix: 'código ',
    confirmDelProfile: '¿Eliminar el perfil «{name}»? Se perderán todos sus datos.',
    conflictOnlyLocal: 'Solo local: {list}',
    conflictOnlyServer: 'Solo en el servidor: {list}',
    conflictResolving: 'Resolviendo conflicto: {choice}…',
    dbBadToken: 'Dropbox: autorización caducada. Vuelva a conectar en ajustes.',
    dbRateLimit: 'Dropbox: límite de solicitudes superado, inténtelo más tarde',
    droppedNotes: 'notas omitidas: {n}',
    droppedTiles: 'marcadores omitidos: {n}',
    dupNotes: 'notas duplicadas: {n}',
    dupUrlMsg: 'Ya existe un marcador con esta URL: {title}',
    errAuth401: 'Error de autorización (401). Compruebe usuario/contraseña o token.',
    errConflict409: 'Conflicto de versiones (409). Sincronice de nuevo.',
    errCryptoFormat: 'Formato de datos cifrados no válido',
    errForbidden403: 'Acceso denegado (403). Compruebe los permisos.',
    errNetOffline: 'Sin conexión de red',
    errNoSpace507: 'Espacio insuficiente en el servidor (507)',
    errNotFound404: 'Recurso no encontrado (404)',
    errServer5xx: 'Error del servidor ({code}). Inténtelo más tarde.',
    errTooMany429: 'Demasiadas solicitudes (429). Inténtelo más tarde.',
    
    fvdFolderN: 'Carpeta {n}',
    fvdImportDone: 'Importación completada: {parts}',
    fvdNoteFolderN: 'Carpeta de notas {n}',
    importedCount: 'Importados: {n}',
    
    mailruBadCreds: 'Mail.ru: credenciales no válidas',
    mailruNoCreds: 'Mail.ru: introduzca el email y la contraseña de aplicación',
    mailruNoSpace: 'Mail.ru: espacio en disco insuficiente',
    noActiveConflict: 'No hay conflicto activo',
    noLinksFound: 'No se encontraron enlaces en el archivo',
    noValidUrls: 'No se encontraron URL válidas',
    noteN: 'Nota {n}',
    odBadToken: 'OneDrive: autorización caducada. Vuelva a conectar en ajustes.',
    odBadTokenExp: 'OneDrive: token caducado, reautenticando…',
    odRateLimit: 'OneDrive: límite de solicitudes superado, inténtelo más tarde',
    odTooBig: 'OneDrive: archivo demasiado grande ({size} MB)',
    payloadTooBig: 'Datos demasiado grandes incluso sin fondos ({size} MB). Reduzca el número de elementos o desactive el cifrado.',
    pcBadLink: 'pCloud: no se pudo obtener el enlace de descarga',
    pcErr: 'pCloud: error {err}',
    profileAdded: 'Perfil «{name}» añadido',
    profileNotFound: 'Perfil no encontrado',
    profileRenamed: 'Perfil renombrado a «{name}»',
    secShort: 's',
    serverEmptyUploaded: 'Servidor vacío — datos locales subidos',
    settingsIncomplete: 'Ajustes de sincronización incompletos',
    showMoreN: 'Mostrar {n} más',
    srvBadKeys: 'Los datos del servidor contienen campos desconocidos: {keys}',
    srvDecryptFail: 'Error al descifrar: {msg}',
    srvEncNoKeyFull: 'Los datos del servidor están cifrados, pero no hay clave. Introdúzcala en ajustes.',
    srvEncNoKeyShort: 'Datos cifrados, sin clave',
    srvUnknownFormatType: 'Formato de datos del servidor desconocido: {type}',
    syncInProgress: 'Sincronización ya en curso',
    syncSettingsEmpty: 'Los ajustes de sincronización están vacíos',
    unknownProvider: 'Proveedor de sincronización desconocido: ',
    unknownStrategy: 'Estrategia de conflicto desconocida: ',
    uploadFailPrefix: 'Error al subir: ',
    uploadGuard: 'Subida bloqueada: los datos locales están vacíos y se sobrescribirían los del servidor',
    urlRequired: 'Se requiere URL',
    yaBadResponseDl: 'Yandex.Disk: respuesta no válida al descargar',
    yaBadResponseUl: 'Yandex.Disk: respuesta no válida al subir',
    yaBadToken: 'Yandex.Disk: error de autorización. Compruebe el token.',
    yaBadTokenNew: 'Yandex.Disk: token caducado. Obtenga uno nuevo.',
    yaFolderErr: 'Yandex.Disk: error de carpeta: {msg}',
    yaFolderFail: 'Yandex.Disk: no se pudo crear la carpeta (HTTP {code})',
    yaForbidden: 'Yandex.Disk: acceso denegado',
    yaNoSpace: 'Yandex.Disk: espacio en disco insuficiente',
    yaNoToken: 'Yandex.Disk: token no configurado'
},
fr: {
    badProfileName: 'Le nom du profil doit contenir 1 à 50 caractères',
    badUrl: 'URL invalide',
    bookmarkN: 'Favori {n}',
    boxBadToken: 'Box : autorisation expirée. Reconnectez-vous dans les paramètres.',
    boxConflict: 'Box : conflit de versions, nouvelle tentative…',
    boxNoFileId: 'Box : ID de fichier introuvable, nouvel envoi prévu',
    cntBookmarks: '{n} favoris',
    cntFolders: '{n} dossiers',
    cntNoteFolders: '{n} dossiers de notes',
    cntNotes: '{n} notes',
    cntTiles: '{n} signets',
    codePrefix: 'code ',
    confirmDelProfile: 'Supprimer le profil « {name} » ? Toutes ses données seront perdues.',
    conflictOnlyLocal: 'Local uniquement : {list}',
    conflictOnlyServer: 'Serveur uniquement : {list}',
    conflictResolving: 'Résolution du conflit : {choice}…',
    dbBadToken: 'Dropbox : autorisation expirée. Reconnectez-vous dans les paramètres.',
    dbRateLimit: 'Dropbox : limite de requêtes dépassée, réessayez plus tard',
    droppedNotes: 'notes ignorées : {n}',
    droppedTiles: 'signets ignorés : {n}',
    dupNotes: 'notes en double : {n}',
    dupUrlMsg: 'Un signet avec cette URL existe déjà : {title}',
    errAuth401: 'Échec d’autorisation (401). Vérifiez identifiant/mot de passe ou jeton.',
    errConflict409: 'Conflit de versions (409). Resynchronisez.',
    errCryptoFormat: 'Format de données chiffrées invalide',
    errForbidden403: 'Accès refusé (403). Vérifiez les autorisations.',
    errNetOffline: 'Pas de connexion réseau',
    errNoSpace507: 'Espace insuffisant sur le serveur (507)',
    errNotFound404: 'Ressource introuvable (404)',
    errServer5xx: 'Erreur serveur ({code}). Réessayez plus tard.',
    errTooMany429: 'Trop de requêtes (429). Réessayez plus tard.',
    
    fvdFolderN: 'Dossier {n}',
    fvdImportDone: 'Importation terminée : {parts}',
    fvdNoteFolderN: 'Dossier de notes {n}',
    importedCount: 'Importés : {n}',
    
    mailruBadCreds: 'Mail.ru : identifiants invalides',
    mailruNoCreds: 'Mail.ru : saisissez l’email et le mot de passe d’application',
    mailruNoSpace: 'Mail.ru : espace disque insuffisant',
    noActiveConflict: 'Aucun conflit actif',
    noLinksFound: 'Aucun lien trouvé dans le fichier',
    noValidUrls: 'Aucune URL valide trouvée',
    noteN: 'Note {n}',
    odBadToken: 'OneDrive : autorisation expirée. Reconnectez-vous dans les paramètres.',
    odBadTokenExp: 'OneDrive : jeton expiré, réauthentification…',
    odRateLimit: 'OneDrive : limite de requêtes dépassée, réessayez plus tard',
    odTooBig: 'OneDrive : fichier trop volumineux ({size} Mo)',
    payloadTooBig: 'Données trop volumineuses même sans arrière-plans ({size} Mo). Réduisez le nombre d’éléments ou désactivez le chiffrement.',
    pcBadLink: 'pCloud : impossible d’obtenir le lien de téléchargement',
    pcErr: 'pCloud : erreur {err}',
    profileAdded: 'Profil « {name} » ajouté',
    profileNotFound: 'Profil introuvable',
    profileRenamed: 'Profil renommé en « {name} »',
    secShort: 's',
    serverEmptyUploaded: 'Serveur vide — données locales envoyées',
    settingsIncomplete: 'Paramètres de synchronisation incomplets',
    showMoreN: 'Afficher {n} de plus',
    srvBadKeys: 'Les données du serveur contiennent des champs inconnus : {keys}',
    srvDecryptFail: 'Échec du déchiffrement : {msg}',
    srvEncNoKeyFull: 'Les données du serveur sont chiffrées, mais aucune clé n’est définie. Saisissez-la dans les paramètres.',
    srvEncNoKeyShort: 'Données chiffrées, pas de clé',
    srvUnknownFormatType: 'Format de données du serveur inconnu : {type}',
    syncInProgress: 'Synchronisation déjà en cours',
    syncSettingsEmpty: 'Les paramètres de synchronisation sont vides',
    unknownProvider: 'Fournisseur de synchronisation inconnu : ',
    unknownStrategy: 'Stratégie de conflit inconnue : ',
    uploadFailPrefix: 'Échec de l’envoi : ',
    uploadGuard: 'Envoi bloqué : les données locales sont vides, les données du serveur seraient écrasées',
    urlRequired: 'URL requise',
    yaBadResponseDl: 'Yandex.Disk : réponse invalide au téléchargement',
    yaBadResponseUl: 'Yandex.Disk : réponse invalide à l’envoi',
    yaBadToken: 'Yandex.Disk : échec d’autorisation. Vérifiez le jeton.',
    yaBadTokenNew: 'Yandex.Disk : jeton expiré. Obtenez un nouveau jeton.',
    yaFolderErr: 'Yandex.Disk : erreur de dossier : {msg}',
    yaFolderFail: 'Yandex.Disk : impossible de créer le dossier (HTTP {code})',
    yaForbidden: 'Yandex.Disk : accès refusé',
    yaNoSpace: 'Yandex.Disk : espace disque insuffisant',
    yaNoToken: 'Yandex.Disk : jeton non défini'
},
it: {
    badProfileName: 'Il nome del profilo deve contenere da 1 a 50 caratteri',
    badUrl: 'URL non valido',
    bookmarkN: 'Segnalibro {n}',
    boxBadToken: 'Box: autorizzazione scaduta. Riconnettersi nelle impostazioni.',
    boxConflict: 'Box: conflitto di versioni, nuovo tentativo…',
    boxNoFileId: 'Box: ID file non trovato, verrà ricaricato',
    cntBookmarks: '{n} segnalibri',
    cntFolders: '{n} cartelle',
    cntNoteFolders: '{n} cartelle di note',
    cntNotes: '{n} note',
    cntTiles: '{n} segnalibri',
    codePrefix: 'codice ',
    confirmDelProfile: 'Eliminare il profilo «{name}»? Tutti i suoi dati andranno persi.',
    conflictOnlyLocal: 'Solo locale: {list}',
    conflictOnlyServer: 'Solo sul server: {list}',
    conflictResolving: 'Risoluzione del conflitto: {choice}…',
    dbBadToken: 'Dropbox: autorizzazione scaduta. Riconnettersi nelle impostazioni.',
    dbRateLimit: 'Dropbox: limite di richieste superato, riprovare più tardi',
    droppedNotes: 'note saltate: {n}',
    droppedTiles: 'segnalibri saltati: {n}',
    dupNotes: 'note duplicate: {n}',
    dupUrlMsg: 'Esiste già un segnalibro con questo URL: {title}',
    errAuth401: 'Autorizzazione fallita (401). Controllare login/password o token.',
    errConflict409: 'Conflitto di versioni (409). Sincronizzare di nuovo.',
    errCryptoFormat: 'Formato dei dati crittografati non valido',
    errForbidden403: 'Accesso negato (403). Controllare i permessi.',
    errNetOffline: 'Nessuna connessione di rete',
    errNoSpace507: 'Spazio insufficiente sul server (507)',
    errNotFound404: 'Risorsa non trovata (404)',
    errServer5xx: 'Errore del server ({code}). Riprovare più tardi.',
    errTooMany429: 'Troppe richieste (429). Riprovare più tardi.',
    
    fvdFolderN: 'Cartella {n}',
    fvdImportDone: 'Importazione completata: {parts}',
    fvdNoteFolderN: 'Cartella di note {n}',
    importedCount: 'Importati: {n}',
    
    mailruBadCreds: 'Mail.ru: credenziali non valide',
    mailruNoCreds: 'Mail.ru: inserire email e password dell’app',
    mailruNoSpace: 'Mail.ru: spazio su disco insufficiente',
    noActiveConflict: 'Nessun conflitto attivo',
    noLinksFound: 'Nessun link trovato nel file',
    noValidUrls: 'Nessun URL valido trovato',
    noteN: 'Nota {n}',
    odBadToken: 'OneDrive: autorizzazione scaduta. Riconnettersi nelle impostazioni.',
    odBadTokenExp: 'OneDrive: token scaduto, riautenticazione…',
    odRateLimit: 'OneDrive: limite di richieste superato, riprovare più tardi',
    odTooBig: 'OneDrive: file troppo grande ({size} MB)',
    payloadTooBig: 'Dati troppo grandi anche senza sfondi ({size} MB). Ridurre il numero di elementi o disattivare la crittografia.',
    pcBadLink: 'pCloud: impossibile ottenere il link di download',
    pcErr: 'pCloud: errore {err}',
    profileAdded: 'Profilo «{name}» aggiunto',
    profileNotFound: 'Profilo non trovato',
    profileRenamed: 'Profilo rinominato in «{name}»',
    secShort: 's',
    serverEmptyUploaded: 'Server vuoto — dati locali caricati',
    settingsIncomplete: 'Impostazioni di sincronizzazione incomplete',
    showMoreN: 'Mostra altri {n}',
    srvBadKeys: 'I dati del server contengono campi sconosciuti: {keys}',
    srvDecryptFail: 'Decrittografia fallita: {msg}',
    srvEncNoKeyFull: 'I dati del server sono crittografati, ma nessuna chiave è impostata. Inserirla nelle impostazioni.',
    srvEncNoKeyShort: 'Dati crittografati, nessuna chiave',
    srvUnknownFormatType: 'Formato dati del server sconosciuto: {type}',
    syncInProgress: 'Sincronizzazione già in corso',
    syncSettingsEmpty: 'Le impostazioni di sincronizzazione sono vuote',
    unknownProvider: 'Provider di sincronizzazione sconosciuto: ',
    unknownStrategy: 'Strategia di conflitto sconosciuta: ',
    uploadFailPrefix: 'Caricamento fallito: ',
    uploadGuard: 'Caricamento bloccato: i dati locali sono vuoti, quelli del server verrebbero sovrascritti',
    urlRequired: 'URL obbligatorio',
    yaBadResponseDl: 'Yandex.Disk: risposta non valida durante il download',
    yaBadResponseUl: 'Yandex.Disk: risposta non valida durante il caricamento',
    yaBadToken: 'Yandex.Disk: autorizzazione fallita. Controllare il token.',
    yaBadTokenNew: 'Yandex.Disk: token scaduto. Ottenerne uno nuovo.',
    yaFolderErr: 'Yandex.Disk: errore cartella: {msg}',
    yaFolderFail: 'Yandex.Disk: impossibile creare la cartella (HTTP {code})',
    yaForbidden: 'Yandex.Disk: accesso negato',
    yaNoSpace: 'Yandex.Disk: spazio su disco insufficiente',
    yaNoToken: 'Yandex.Disk: token non impostato'
},
pt: {
    badProfileName: 'O nome do perfil deve ter de 1 a 50 caracteres',
    badUrl: 'URL inválido',
    bookmarkN: 'Favorito {n}',
    boxBadToken: 'Box: autorização expirada. Reconecte nas configurações.',
    boxConflict: 'Box: conflito de versões, tentando novamente…',
    boxNoFileId: 'Box: ID do arquivo não encontrado, será reenviado',
    cntBookmarks: '{n} favoritos',
    cntFolders: '{n} pastas',
    cntNoteFolders: '{n} pastas de notas',
    cntNotes: '{n} notas',
    cntTiles: '{n} marcadores',
    codePrefix: 'código ',
    confirmDelProfile: 'Excluir o perfil "{name}"? Todos os seus dados serão perdidos.',
    conflictOnlyLocal: 'Apenas local: {list}',
    conflictOnlyServer: 'Apenas no servidor: {list}',
    conflictResolving: 'Resolvendo conflito: {choice}…',
    dbBadToken: 'Dropbox: autorização expirada. Reconecte nas configurações.',
    dbRateLimit: 'Dropbox: limite de requisições excedido, tente mais tarde',
    droppedNotes: 'notas ignoradas: {n}',
    droppedTiles: 'marcadores ignorados: {n}',
    dupNotes: 'notas duplicadas: {n}',
    dupUrlMsg: 'Já existe um marcador com este URL: {title}',
    errAuth401: 'Falha na autorização (401). Verifique login/senha ou token.',
    errConflict409: 'Conflito de versões (409). Sincronize novamente.',
    errCryptoFormat: 'Formato de dados criptografados inválido',
    errForbidden403: 'Acesso negado (403). Verifique as permissões.',
    errNetOffline: 'Sem conexão de rede',
    errNoSpace507: 'Espaço insuficiente no servidor (507)',
    errNotFound404: 'Recurso não encontrado (404)',
    errServer5xx: 'Erro do servidor ({code}). Tente mais tarde.',
    errTooMany429: 'Muitas requisições (429). Tente mais tarde.',
    
    fvdFolderN: 'Pasta {n}',
    fvdImportDone: 'Importação concluída: {parts}',
    fvdNoteFolderN: 'Pasta de notas {n}',
    importedCount: 'Importados: {n}',
    
    mailruBadCreds: 'Mail.ru: credenciais inválidas',
    mailruNoCreds: 'Mail.ru: insira o email e a senha de aplicativo',
    mailruNoSpace: 'Mail.ru: espaço em disco insuficiente',
    noActiveConflict: 'Nenhum conflito ativo',
    noLinksFound: 'Nenhum link encontrado no arquivo',
    noValidUrls: 'Nenhum URL válido encontrado',
    noteN: 'Nota {n}',
    odBadToken: 'OneDrive: autorização expirada. Reconecte nas configurações.',
    odBadTokenExp: 'OneDrive: token expirado, reautenticando…',
    odRateLimit: 'OneDrive: limite de requisições excedido, tente mais tarde',
    odTooBig: 'OneDrive: arquivo muito grande ({size} MB)',
    payloadTooBig: 'Dados muito grandes mesmo sem fundos ({size} MB). Reduza o número de itens ou desative a criptografia.',
    pcBadLink: 'pCloud: falha ao obter o link de download',
    pcErr: 'pCloud: erro {err}',
    profileAdded: 'Perfil "{name}" adicionado',
    profileNotFound: 'Perfil não encontrado',
    profileRenamed: 'Perfil renomeado para "{name}"',
    secShort: 's',
    serverEmptyUploaded: 'Servidor vazio — dados locais enviados',
    settingsIncomplete: 'Configurações de sincronização incompletas',
    showMoreN: 'Mostrar mais {n}',
    srvBadKeys: 'Os dados do servidor contêm campos desconhecidos: {keys}',
    srvDecryptFail: 'Falha ao descriptografar: {msg}',
    srvEncNoKeyFull: 'Os dados do servidor estão criptografados, mas nenhuma chave está definida. Insira-a nas configurações.',
    srvEncNoKeyShort: 'Dados criptografados, sem chave',
    srvUnknownFormatType: 'Formato de dados do servidor desconhecido: {type}',
    syncInProgress: 'Sincronização já em andamento',
    syncSettingsEmpty: 'As configurações de sincronização estão vazias',
    unknownProvider: 'Provedor de sincronização desconhecido: ',
    unknownStrategy: 'Estratégia de conflito desconhecida: ',
    uploadFailPrefix: 'Falha no envio: ',
    uploadGuard: 'Envio bloqueado: os dados locais estão vazios e os do servidor seriam sobrescritos',
    urlRequired: 'URL é obrigatório',
    yaBadResponseDl: 'Yandex.Disk: resposta inválida ao baixar',
    yaBadResponseUl: 'Yandex.Disk: resposta inválida ao enviar',
    yaBadToken: 'Yandex.Disk: falha na autorização. Verifique o token.',
    yaBadTokenNew: 'Yandex.Disk: token expirado. Obtenha um novo token.',
    yaFolderErr: 'Yandex.Disk: erro de pasta: {msg}',
    yaFolderFail: 'Yandex.Disk: falha ao criar pasta (HTTP {code})',
    yaForbidden: 'Yandex.Disk: acesso negado',
    yaNoSpace: 'Yandex.Disk: espaço em disco insuficiente',
    yaNoToken: 'Yandex.Disk: token não definido'
},
zh: {
    badProfileName: '个人资料名称必须为 1–50 个字符',
    badUrl: '无效的 URL',
    bookmarkN: '书签 {n}',
    boxBadToken: 'Box：授权已过期。请在设置中重新连接。',
    boxConflict: 'Box：版本冲突，正在重试…',
    boxNoFileId: 'Box：未找到文件 ID，将重新上传',
    cntBookmarks: '{n} 个书签',
    cntFolders: '{n} 个文件夹',
    cntNoteFolders: '{n} 个笔记文件夹',
    cntNotes: '{n} 条笔记',
    cntTiles: '{n} 个书签',
    codePrefix: '代码 ',
    confirmDelProfile: '删除个人资料“{name}”？其所有数据将丢失。',
    conflictOnlyLocal: '仅本地：{list}',
    conflictOnlyServer: '仅服务器：{list}',
    conflictResolving: '正在解决冲突：{choice}…',
    dbBadToken: 'Dropbox：授权已过期。请在设置中重新连接。',
    dbRateLimit: 'Dropbox：超出请求限制，请稍后重试',
    droppedNotes: '已跳过笔记：{n}',
    droppedTiles: '已跳过书签：{n}',
    dupNotes: '重复笔记：{n}',
    dupUrlMsg: '已存在使用此 URL 的书签：{title}',
    errAuth401: '授权失败 (401)。请检查登录名/密码或令牌。',
    errConflict409: '版本冲突 (409)。请重新同步。',
    errCryptoFormat: '加密数据格式无效',
    errForbidden403: '访问被拒绝 (403)。请检查权限。',
    errNetOffline: '无网络连接',
    errNoSpace507: '服务器空间不足 (507)',
    errNotFound404: '资源未找到 (404)',
    errServer5xx: '服务器错误 ({code})。请稍后重试。',
    errTooMany429: '请求过多 (429)。请稍后重试。',
    
    fvdFolderN: '文件夹 {n}',
    fvdImportDone: '导入完成：{parts}',
    fvdNoteFolderN: '笔记文件夹 {n}',
    importedCount: '已导入：{n}',
    
    mailruBadCreds: 'Mail.ru：凭据无效',
    mailruNoCreds: 'Mail.ru：请输入邮箱和应用密码',
    mailruNoSpace: 'Mail.ru：磁盘空间不足',
    noActiveConflict: '没有活动冲突',
    noLinksFound: '文件中未找到链接',
    noValidUrls: '未找到有效的 URL',
    noteN: '笔记 {n}',
    odBadToken: 'OneDrive：授权已过期。请在设置中重新连接。',
    odBadTokenExp: 'OneDrive：令牌已过期，正在重新验证…',
    odRateLimit: 'OneDrive：超出请求限制，请稍后重试',
    odTooBig: 'OneDrive：文件过大 ({size} MB)',
    payloadTooBig: '即使不含背景，数据也过大 ({size} MB)。请减少项目数量或关闭加密。',
    pcBadLink: 'pCloud：无法获取下载链接',
    pcErr: 'pCloud：错误 {err}',
    profileAdded: '已添加个人资料“{name}”',
    profileNotFound: '未找到个人资料',
    profileRenamed: '个人资料已重命名为“{name}”',
    secShort: '秒',
    serverEmptyUploaded: '服务器为空——已上传本地数据',
    settingsIncomplete: '同步设置不完整',
    showMoreN: '再显示 {n} 个',
    srvBadKeys: '服务器数据包含未知字段：{keys}',
    srvDecryptFail: '解密失败：{msg}',
    srvEncNoKeyFull: '服务器数据已加密，但未设置加密密钥。请在设置中输入密钥。',
    srvEncNoKeyShort: '数据已加密，没有密钥',
    srvUnknownFormatType: '未知的服务器数据格式：{type}',
    syncInProgress: '同步已在进行中',
    syncSettingsEmpty: '同步设置为空',
    unknownProvider: '未知的同步提供商：',
    unknownStrategy: '未知的冲突策略：',
    uploadFailPrefix: '上传失败：',
    uploadGuard: '上传已阻止：本地数据为空，服务器数据将被覆盖',
    urlRequired: '需要 URL',
    yaBadResponseDl: 'Yandex.Disk：下载时响应无效',
    yaBadResponseUl: 'Yandex.Disk：上传时响应无效',
    yaBadToken: 'Yandex.Disk：授权失败。请检查令牌。',
    yaBadTokenNew: 'Yandex.Disk：令牌已过期。请获取新令牌。',
    yaFolderErr: 'Yandex.Disk：文件夹错误：{msg}',
    yaFolderFail: 'Yandex.Disk：无法创建文件夹 (HTTP {code})',
    yaForbidden: 'Yandex.Disk：访问被拒绝',
    yaNoSpace: 'Yandex.Disk：磁盘空间不足',
    yaNoToken: 'Yandex.Disk：未设置令牌'
},
ja: {
    badProfileName: 'プロフィール名は1〜50文字にしてください',
    badUrl: '無効なURLです',
    bookmarkN: 'ブックマーク {n}',
    boxBadToken: 'Box: 認証の有効期限が切れました。設定で再接続してください。',
    boxConflict: 'Box: バージョン競合、再試行中…',
    boxNoFileId: 'Box: ファイルIDが見つかりません。再アップロードします',
    cntBookmarks: '{n} 件のブックマーク',
    cntFolders: '{n} 個のフォルダー',
    cntNoteFolders: '{n} 個のノートフォルダー',
    cntNotes: '{n} 件のノート',
    cntTiles: '{n} 個のブックマーク',
    codePrefix: 'コード ',
    confirmDelProfile: 'プロフィール「{name}」を削除しますか？すべてのデータが失われます。',
    conflictOnlyLocal: 'ローカルのみ: {list}',
    conflictOnlyServer: 'サーバーのみ: {list}',
    conflictResolving: '競合を解決中: {choice}…',
    dbBadToken: 'Dropbox: 認証の有効期限が切れました。設定で再接続してください。',
    dbRateLimit: 'Dropbox: リクエスト制限を超えました。後でもう一度お試しください',
    droppedNotes: 'スキップされたノート: {n}',
    droppedTiles: 'スキップされたブックマーク: {n}',
    dupNotes: '重複ノート: {n}',
    dupUrlMsg: 'このURLのブックマークは既に存在します: {title}',
    errAuth401: '認証に失敗しました (401)。ログイン/パスワードまたはトークンを確認してください。',
    errConflict409: 'バージョン競合 (409)。再度同期してください。',
    errCryptoFormat: '暗号化データの形式が無効です',
    errForbidden403: 'アクセスが拒否されました (403)。権限を確認してください。',
    errNetOffline: 'ネットワーク接続がありません',
    errNoSpace507: 'サーバーの空き容量が不足しています (507)',
    errNotFound404: 'リソースが見つかりません (404)',
    errServer5xx: 'サーバーエラー ({code})。後でもう一度お試しください。',
    errTooMany429: 'リクエストが多すぎます (429)。後でもう一度お試しください。',
    
    fvdFolderN: 'フォルダー {n}',
    fvdImportDone: 'インポート完了: {parts}',
    fvdNoteFolderN: 'ノートフォルダー {n}',
    importedCount: 'インポート済み: {n}',
    
    mailruBadCreds: 'Mail.ru: 認証情報が無効です',
    mailruNoCreds: 'Mail.ru: メールアドレスとアプリパスワードを入力してください',
    mailruNoSpace: 'Mail.ru: ディスク容量が不足しています',
    noActiveConflict: 'アクティブな競合はありません',
    noLinksFound: 'ファイル内にリンクが見つかりません',
    noValidUrls: '有効なURLが見つかりません',
    noteN: 'ノート {n}',
    odBadToken: 'OneDrive: 認証の有効期限が切れました。設定で再接続してください。',
    odBadTokenExp: 'OneDrive: トークンの有効期限が切れました。再認証中…',
    odRateLimit: 'OneDrive: リクエスト制限を超えました。後でもう一度お試しください',
    odTooBig: 'OneDrive: ファイルが大きすぎます ({size} MB)',
    payloadTooBig: '背景を除いてもデータが大きすぎます ({size} MB)。項目数を減らすか暗号化を無効にしてください。',
    pcBadLink: 'pCloud: ダウンロードリンクを取得できませんでした',
    pcErr: 'pCloud: エラー {err}',
    profileAdded: 'プロフィール「{name}」を追加しました',
    profileNotFound: 'プロフィールが見つかりません',
    profileRenamed: 'プロフィール名を「{name}」に変更しました',
    secShort: '秒',
    serverEmptyUploaded: 'サーバーが空のためローカルデータをアップロードしました',
    settingsIncomplete: '同期設定が不完全です',
    showMoreN: 'さらに {n} 件を表示',
    srvBadKeys: 'サーバーデータに不明なフィールドがあります: {keys}',
    srvDecryptFail: '復号に失敗しました: {msg}',
    srvEncNoKeyFull: 'サーバーのデータは暗号化されていますが、キーが設定されていません。設定でキーを入力してください。',
    srvEncNoKeyShort: 'データは暗号化されていますがキーがありません',
    srvUnknownFormatType: '不明なサーバーデータ形式: {type}',
    syncInProgress: '同期は既に実行中です',
    syncSettingsEmpty: '同期設定が空です',
    unknownProvider: '不明な同期プロバイダー: ',
    unknownStrategy: '不明な競合解決戦略: ',
    uploadFailPrefix: 'アップロード失敗: ',
    uploadGuard: 'アップロードをブロックしました: ローカルデータが空で、サーバーデータが上書きされるところでした',
    urlRequired: 'URLが必要です',
    yaBadResponseDl: 'Yandex.Disk: ダウンロード時の応答が無効です',
    yaBadResponseUl: 'Yandex.Disk: アップロード時の応答が無効です',
    yaBadToken: 'Yandex.Disk: 認証に失敗しました。トークンを確認してください。',
    yaBadTokenNew: 'Yandex.Disk: トークンの有効期限が切れました。新しいトークンを取得してください。',
    yaFolderErr: 'Yandex.Disk: フォルダーエラー: {msg}',
    yaFolderFail: 'Yandex.Disk: フォルダーを作成できませんでした (HTTP {code})',
    yaForbidden: 'Yandex.Disk: アクセスが拒否されました',
    yaNoSpace: 'Yandex.Disk: ディスク容量が不足しています',
    yaNoToken: 'Yandex.Disk: トークンが設定されていません'
},
ko: {
    badProfileName: '프로필 이름은 1~50자여야 합니다',
    badUrl: '잘못된 URL입니다',
    bookmarkN: '북마크 {n}',
    boxBadToken: 'Box: 인증이 만료되었습니다. 설정에서 다시 연결하세요.',
    boxConflict: 'Box: 버전 충돌, 다시 시도 중…',
    boxNoFileId: 'Box: 파일 ID를 찾을 수 없음, 다시 업로드합니다',
    cntBookmarks: '북마크 {n}개',
    cntFolders: '폴더 {n}개',
    cntNoteFolders: '노트 폴더 {n}개',
    cntNotes: '노트 {n}개',
    cntTiles: '북마크 {n}개',
    codePrefix: '코드 ',
    confirmDelProfile: '프로필 "{name}"을(를) 삭제하시겠습니까? 모든 데이터가 삭제됩니다.',
    conflictOnlyLocal: '로컬만: {list}',
    conflictOnlyServer: '서버만: {list}',
    conflictResolving: '충돌 해결 중: {choice}…',
    dbBadToken: 'Dropbox: 인증이 만료되었습니다. 설정에서 다시 연결하세요.',
    dbRateLimit: 'Dropbox: 요청 한도 초과, 나중에 다시 시도하세요',
    droppedNotes: '건너뛴 노트: {n}',
    droppedTiles: '건너뛴 북마크: {n}',
    dupNotes: '중복 노트: {n}',
    dupUrlMsg: '이 URL의 북마크가 이미 존재합니다: {title}',
    errAuth401: '인증 실패 (401). 로그인/비밀번호 또는 토큰을 확인하세요.',
    errConflict409: '버전 충돌 (409). 다시 동기화하세요.',
    errCryptoFormat: '암호화된 데이터 형식이 올바르지 않습니다',
    errForbidden403: '액세스 거부됨 (403). 권한을 확인하세요.',
    errNetOffline: '네트워크 연결 없음',
    errNoSpace507: '서버에 공간이 부족합니다 (507)',
    errNotFound404: '리소스를 찾을 수 없음 (404)',
    errServer5xx: '서버 오류 ({code}). 나중에 다시 시도하세요.',
    errTooMany429: '요청이 너무 많습니다 (429). 나중에 다시 시도하세요.',
    
    fvdFolderN: '폴더 {n}',
    fvdImportDone: '가져오기 완료: {parts}',
    fvdNoteFolderN: '노트 폴더 {n}',
    importedCount: '가져옴: {n}',
    
    mailruBadCreds: 'Mail.ru: 잘못된 자격 증명',
    mailruNoCreds: 'Mail.ru: 이메일과 앱 비밀번호를 입력하세요',
    mailruNoSpace: 'Mail.ru: 디스크 공간 부족',
    noActiveConflict: '활성 충돌 없음',
    noLinksFound: '파일에서 링크를 찾을 수 없습니다',
    noValidUrls: '유효한 URL을 찾을 수 없습니다',
    noteN: '노트 {n}',
    odBadToken: 'OneDrive: 인증이 만료되었습니다. 설정에서 다시 연결하세요.',
    odBadTokenExp: 'OneDrive: 토큰 만료, 재인증 중…',
    odRateLimit: 'OneDrive: 요청 한도 초과, 나중에 다시 시도하세요',
    odTooBig: 'OneDrive: 파일이 너무 큼 ({size} MB)',
    payloadTooBig: '배경을 제외해도 데이터가 너무 큽니다 ({size} MB). 항목 수를 줄이거나 암호화를 끄세요.',
    pcBadLink: 'pCloud: 다운로드 링크를 가져오지 못했습니다',
    pcErr: 'pCloud: 오류 {err}',
    profileAdded: '프로필 "{name}" 추가됨',
    profileNotFound: '프로필을 찾을 수 없습니다',
    profileRenamed: '프로필 이름이 "{name}"(으)로 변경됨',
    secShort: '초',
    serverEmptyUploaded: '서버가 비어 있음 — 로컬 데이터 업로드됨',
    settingsIncomplete: '동기화 설정이 불완전합니다',
    showMoreN: '{n}개 더 보기',
    srvBadKeys: '서버 데이터에 알 수 없는 필드가 있습니다: {keys}',
    srvDecryptFail: '복호화 실패: {msg}',
    srvEncNoKeyFull: '서버 데이터가 암호화되어 있지만 키가 설정되지 않았습니다. 설정에서 키를 입력하세요.',
    srvEncNoKeyShort: '데이터가 암호화됨, 키 없음',
    srvUnknownFormatType: '알 수 없는 서버 데이터 형식: {type}',
    syncInProgress: '동기화가 이미 진행 중입니다',
    syncSettingsEmpty: '동기화 설정이 비어 있습니다',
    unknownProvider: '알 수 없는 동기화 제공자: ',
    unknownStrategy: '알 수 없는 충돌 해결 전략: ',
    uploadFailPrefix: '업로드 실패: ',
    uploadGuard: '업로드 차단됨: 로컬 데이터가 비어 있어 서버 데이터가 덮어쓰여질 뻔했습니다',
    urlRequired: 'URL이 필요합니다',
    yaBadResponseDl: 'Yandex.Disk: 다운로드 응답이 올바르지 않습니다',
    yaBadResponseUl: 'Yandex.Disk: 업로드 응답이 올바르지 않습니다',
    yaBadToken: 'Yandex.Disk: 인증 실패. 토큰을 확인하세요.',
    yaBadTokenNew: 'Yandex.Disk: 토큰이 만료되었습니다. 새 토큰을 받으세요.',
    yaFolderErr: 'Yandex.Disk: 폴더 오류: {msg}',
    yaFolderFail: 'Yandex.Disk: 폴더를 생성하지 못했습니다 (HTTP {code})',
    yaForbidden: 'Yandex.Disk: 액세스 거부됨',
    yaNoSpace: 'Yandex.Disk: 디스크 공간 부족',
    yaNoToken: 'Yandex.Disk: 토큰이 설정되지 않았습니다'
},
tr: {
    badProfileName: 'Profil adı 1–50 karakter olmalıdır',
    badUrl: 'Geçersiz URL',
    bookmarkN: 'Yer imi {n}',
    boxBadToken: 'Box: yetkilendirme süresi doldu. Ayarlardan yeniden bağlanın.',
    boxConflict: 'Box: sürüm çakışması, yeniden deneniyor…',
    boxNoFileId: 'Box: dosya kimliği bulunamadı, yeniden yüklenecek',
    cntBookmarks: '{n} yer imi',
    cntFolders: '{n} klasör',
    cntNoteFolders: '{n} not klasörü',
    cntNotes: '{n} not',
    cntTiles: '{n} yer işareti',
    codePrefix: 'kod ',
    confirmDelProfile: '"{name}" profili silinsin mi? Tüm verileri kaybolacak.',
    conflictOnlyLocal: 'Yalnızca yerel: {list}',
    conflictOnlyServer: 'Yalnızca sunucuda: {list}',
    conflictResolving: 'Çakışma çözülüyor: {choice}…',
    dbBadToken: 'Dropbox: yetkilendirme süresi doldu. Ayarlardan yeniden bağlanın.',
    dbRateLimit: 'Dropbox: istek sınırı aşıldı, daha sonra tekrar deneyin',
    droppedNotes: 'atlanan notlar: {n}',
    droppedTiles: 'atlanan yer işaretleri: {n}',
    dupNotes: 'yinelenen notlar: {n}',
    dupUrlMsg: 'Bu URL ile bir yer işareti zaten var: {title}',
    errAuth401: 'Yetkilendirme başarısız (401). Kullanıcı adı/şifre veya tokeni kontrol edin.',
    errConflict409: 'Sürüm çakışması (409). Tekrar eşitleyin.',
    errCryptoFormat: 'Geçersiz şifrelenmiş veri biçimi',
    errForbidden403: 'Erişim reddedildi (403). İzinleri kontrol edin.',
    errNetOffline: 'Ağ bağlantısı yok',
    errNoSpace507: 'Sunucuda yetersiz alan (507)',
    errNotFound404: 'Kaynak bulunamadı (404)',
    errServer5xx: 'Sunucu hatası ({code}). Daha sonra tekrar deneyin.',
    errTooMany429: 'Çok fazla istek (429). Daha sonra tekrar deneyin.',
    
    fvdFolderN: 'Klasör {n}',
    fvdImportDone: 'İçe aktarma tamamlandı: {parts}',
    fvdNoteFolderN: 'Not klasörü {n}',
    importedCount: 'İçe aktarıldı: {n}',
    
    mailruBadCreds: 'Mail.ru: geçersiz kimlik bilgileri',
    mailruNoCreds: 'Mail.ru: e-posta ve uygulama şifresini girin',
    mailruNoSpace: 'Mail.ru: yetersiz disk alanı',
    noActiveConflict: 'Aktif çakışma yok',
    noLinksFound: 'Dosyada bağlantı bulunamadı',
    noValidUrls: 'Geçerli URL bulunamadı',
    noteN: 'Not {n}',
    odBadToken: 'OneDrive: yetkilendirme süresi doldu. Ayarlardan yeniden bağlanın.',
    odBadTokenExp: 'OneDrive: token süresi doldu, yeniden kimlik doğrulanıyor…',
    odRateLimit: 'OneDrive: istek sınırı aşıldı, daha sonra tekrar deneyin',
    odTooBig: 'OneDrive: dosya çok büyük ({size} MB)',
    payloadTooBig: 'Arka planlar olmadan bile veri çok büyük ({size} MB). Öğe sayısını azaltın veya şifrelemeyi kapatın.',
    pcBadLink: 'pCloud: indirme bağlantısı alınamadı',
    pcErr: 'pCloud: hata {err}',
    profileAdded: '"{name}" profili eklendi',
    profileNotFound: 'Profil bulunamadı',
    profileRenamed: 'Profil "{name}" olarak yeniden adlandırıldı',
    secShort: 'sn',
    serverEmptyUploaded: 'Sunucu boş — yerel veriler yüklendi',
    settingsIncomplete: 'Eşitleme ayarları eksik',
    showMoreN: '{n} tane daha göster',
    srvBadKeys: 'Sunucu verileri bilinmeyen alanlar içeriyor: {keys}',
    srvDecryptFail: 'Şifre çözme başarısız: {msg}',
    srvEncNoKeyFull: 'Sunucu verileri şifreli ancak anahtar ayarlanmamış. Ayarlardan anahtarı girin.',
    srvEncNoKeyShort: 'Veriler şifreli, anahtar yok',
    srvUnknownFormatType: 'Bilinmeyen sunucu veri biçimi: {type}',
    syncInProgress: 'Eşitleme zaten devam ediyor',
    syncSettingsEmpty: 'Eşitleme ayarları boş',
    unknownProvider: 'Bilinmeyen eşitleme sağlayıcısı: ',
    unknownStrategy: 'Bilinmeyen çakışma stratejisi: ',
    uploadFailPrefix: 'Yükleme başarısız: ',
    uploadGuard: 'Yükleme engellendi: yerel veriler boş, sunucu verileri ezilecekti',
    urlRequired: 'URL gerekli',
    yaBadResponseDl: 'Yandex.Disk: indirirken geçersiz yanıt',
    yaBadResponseUl: 'Yandex.Disk: yüklerken geçersiz yanıt',
    yaBadToken: 'Yandex.Disk: yetkilendirme başarısız. Tokeni kontrol edin.',
    yaBadTokenNew: 'Yandex.Disk: token süresi doldu. Yeni token alın.',
    yaFolderErr: 'Yandex.Disk: klasör hatası: {msg}',
    yaFolderFail: 'Yandex.Disk: klasör oluşturulamadı (HTTP {code})',
    yaForbidden: 'Yandex.Disk: erişim reddedildi',
    yaNoSpace: 'Yandex.Disk: yetersiz disk alanı',
    yaNoToken: 'Yandex.Disk: token ayarlanmadı'
},
hi: {
    badProfileName: 'प्रोफ़ाइल नाम 1–50 अक्षरों का होना चाहिए',
    badUrl: 'अमान्य URL',
    bookmarkN: 'बुकमार्क {n}',
    boxBadToken: 'Box: प्राधिकरण समाप्त हो गया। सेटिंग्स में फिर से कनेक्ट करें।',
    boxConflict: 'Box: संस्करण संघर्ष, पुनः प्रयास…',
    boxNoFileId: 'Box: फ़ाइल ID नहीं मिली, फिर से अपलोड किया जाएगा',
    cntBookmarks: '{n} बुकमार्क',
    cntFolders: '{n} फ़ोल्डर',
    cntNoteFolders: '{n} नोट फ़ोल्डर',
    cntNotes: '{n} नोट्स',
    cntTiles: '{n} बुकमार्क',
    codePrefix: 'कोड ',
    confirmDelProfile: 'प्रोफ़ाइल "{name}" हटाएँ? इसका सारा डेटा खो जाएगा।',
    conflictOnlyLocal: 'केवल स्थानीय: {list}',
    conflictOnlyServer: 'केवल सर्वर पर: {list}',
    conflictResolving: 'संघर्ष समाधान: {choice}…',
    dbBadToken: 'Dropbox: प्राधिकरण समाप्त हो गया। सेटिंग्स में फिर से कनेक्ट करें।',
    dbRateLimit: 'Dropbox: अनुरोध सीमा पार, बाद में पुनः प्रयास करें',
    droppedNotes: 'छोड़े गए नोट्स: {n}',
    droppedTiles: 'छोड़े गए बुकमार्क: {n}',
    dupNotes: 'डुप्लिकेट नोट्स: {n}',
    dupUrlMsg: 'इस URL वाला बुकमार्क पहले से मौजूद है: {title}',
    errAuth401: 'प्राधिकरण विफल (401)। लॉगिन/पासवर्ड या टोकन जांचें।',
    errConflict409: 'संस्करण संघर्ष (409)। फिर से सिंक करें।',
    errCryptoFormat: 'अमान्य एन्क्रिप्टेड डेटा प्रारूप',
    errForbidden403: 'पहुँच अस्वीकृत (403)। अनुमतियाँ जांचें।',
    errNetOffline: 'कोई नेटवर्क कनेक्शन नहीं',
    errNoSpace507: 'सर्वर पर अपर्याप्त स्थान (507)',
    errNotFound404: 'संसाधन नहीं मिला (404)',
    errServer5xx: 'सर्वर त्रुटि ({code})। बाद में पुनः प्रयास करें।',
    errTooMany429: 'बहुत अधिक अनुरोध (429)। बाद में पुनः प्रयास करें।',
    
    fvdFolderN: 'फ़ोल्डर {n}',
    fvdImportDone: 'आयात पूर्ण: {parts}',
    fvdNoteFolderN: 'नोट फ़ोल्डर {n}',
    importedCount: 'आयातित: {n}',
    
    mailruBadCreds: 'Mail.ru: अमान्य क्रेडेंशियल',
    mailruNoCreds: 'Mail.ru: ईमेल और ऐप पासवर्ड दर्ज करें',
    mailruNoSpace: 'Mail.ru: अपर्याप्त डिस्क स्थान',
    noActiveConflict: 'कोई सक्रिय संघर्ष नहीं',
    noLinksFound: 'फ़ाइल में कोई लिंक नहीं मिला',
    noValidUrls: 'कोई मान्य URL नहीं मिला',
    noteN: 'नोट {n}',
    odBadToken: 'OneDrive: प्राधिकरण समाप्त हो गया। सेटिंग्स में फिर से कनेक्ट करें।',
    odBadTokenExp: 'OneDrive: टोकन समाप्त, पुनः प्रमाणीकरण…',
    odRateLimit: 'OneDrive: अनुरोध सीमा पार, बाद में पुनः प्रयास करें',
    odTooBig: 'OneDrive: फ़ाइल बहुत बड़ी ({size} MB)',
    payloadTooBig: 'बैकग्राउंड के बिना भी डेटा बहुत बड़ा ({size} MB)। आइटम कम करें या एन्क्रिप्शन बंद करें।',
    pcBadLink: 'pCloud: डाउनलोड लिंक प्राप्त करने में विफल',
    pcErr: 'pCloud: त्रुटि {err}',
    profileAdded: 'प्रोफ़ाइल "{name}" जोड़ी गई',
    profileNotFound: 'प्रोफ़ाइल नहीं मिली',
    profileRenamed: 'प्रोफ़ाइल का नाम "{name}" हुआ',
    secShort: 'से',
    serverEmptyUploaded: 'सर्वर खाली — स्थानीय डेटा अपलोड किया गया',
    settingsIncomplete: 'सिंक सेटिंग्स अधूरी हैं',
    showMoreN: '{n} और दिखाएँ',
    srvBadKeys: 'सर्वर डेटा में अज्ञात फ़ील्ड हैं: {keys}',
    srvDecryptFail: 'डिक्रिप्शन विफल: {msg}',
    srvEncNoKeyFull: 'सर्वर डेटा एन्क्रिप्टेड है, लेकिन कोई कुंजी सेट नहीं है। सेटिंग्स में कुंजी दर्ज करें।',
    srvEncNoKeyShort: 'डेटा एन्क्रिप्टेड है, कोई कुंजी नहीं',
    srvUnknownFormatType: 'अज्ञात सर्वर डेटा प्रारूप: {type}',
    syncInProgress: 'सिंक पहले से चल रहा है',
    syncSettingsEmpty: 'सिंक सेटिंग्स खाली हैं',
    unknownProvider: 'अज्ञात सिंक प्रदाता: ',
    unknownStrategy: 'अज्ञात संघर्ष रणनीति: ',
    uploadFailPrefix: 'अपलोड विफल: ',
    uploadGuard: 'अपलोड अवरुद्ध: स्थानीय डेटा खाली है, सर्वर डेटा अधिलेखित हो जाता',
    urlRequired: 'URL आवश्यक है',
    yaBadResponseDl: 'Yandex.Disk: डाउनलोड करते समय अमान्य प्रतिक्रिया',
    yaBadResponseUl: 'Yandex.Disk: अपलोड करते समय अमान्य प्रतिक्रिया',
    yaBadToken: 'Yandex.Disk: प्राधिकरण विफल। टोकन जांचें।',
    yaBadTokenNew: 'Yandex.Disk: टोकन समाप्त। नया टोकन प्राप्त करें।',
    yaFolderErr: 'Yandex.Disk: फ़ोल्डर त्रुटि: {msg}',
    yaFolderFail: 'Yandex.Disk: फ़ोल्डर बनाने में विफल (HTTP {code})',
    yaForbidden: 'Yandex.Disk: पहुँच अस्वीकृत',
    yaNoSpace: 'Yandex.Disk: अपर्याप्त डिस्क स्थान',
    yaNoToken: 'Yandex.Disk: टोकन सेट नहीं है'
},
ar: {
    badProfileName: 'يجب أن يكون اسم الملف الشخصي من 1 إلى 50 حرفًا',
    badUrl: 'عنوان URL غير صالح',
    bookmarkN: 'إشارة مرجعية {n}',
    boxBadToken: 'Box: انتهت صلاحية التفويض. أعد الاتصال من الإعدادات.',
    boxConflict: 'Box: تعارض في الإصدارات، جارٍ إعادة المحاولة…',
    boxNoFileId: 'Box: لم يتم العثور على معرّف الملف، ستتم إعادة الرفع',
    cntBookmarks: '{n} إشارات مرجعية',
    cntFolders: '{n} مجلدات',
    cntNoteFolders: '{n} مجلدات ملاحظات',
    cntNotes: '{n} ملاحظات',
    cntTiles: '{n} إشارات مرجعية',
    codePrefix: 'الرمز ',
    confirmDelProfile: 'حذف الملف الشخصي "{name}"؟ ستفقد جميع بياناته.',
    conflictOnlyLocal: 'محلي فقط: {list}',
    conflictOnlyServer: 'على الخادم فقط: {list}',
    conflictResolving: 'جارٍ حل التعارض: {choice}…',
    dbBadToken: 'Dropbox: انتهت صلاحية التفويض. أعد الاتصال من الإعدادات.',
    dbRateLimit: 'Dropbox: تم تجاوز حد الطلبات، حاول لاحقًا',
    droppedNotes: 'ملاحظات تم تخطيها: {n}',
    droppedTiles: 'إشارات مرجعية تم تخطيها: {n}',
    dupNotes: 'ملاحظات مكررة: {n}',
    dupUrlMsg: 'توجد إشارة مرجعية بهذا العنوان بالفعل: {title}',
    errAuth401: 'فشل التفويض (401). تحقق من اسم المستخدم/كلمة المرور أو الرمز.',
    errConflict409: 'تعارض في الإصدارات (409). زامن مرة أخرى.',
    errCryptoFormat: 'تنسيق بيانات مشفرة غير صالح',
    errForbidden403: 'تم رفض الوصول (403). تحقق من الأذونات.',
    errNetOffline: 'لا يوجد اتصال بالشبكة',
    errNoSpace507: 'مساحة غير كافية على الخادم (507)',
    errNotFound404: 'المورد غير موجود (404)',
    errServer5xx: 'خطأ في الخادم ({code}). حاول لاحقًا.',
    errTooMany429: 'طلبات كثيرة جدًا (429). حاول لاحقًا.',
    
    fvdFolderN: 'مجلد {n}',
    fvdImportDone: 'اكتمل الاستيراد: {parts}',
    fvdNoteFolderN: 'مجلد ملاحظات {n}',
    importedCount: 'تم الاستيراد: {n}',
    
    mailruBadCreds: 'Mail.ru: بيانات اعتماد غير صالحة',
    mailruNoCreds: 'Mail.ru: أدخل البريد الإلكتروني وكلمة مرور التطبيق',
    mailruNoSpace: 'Mail.ru: مساحة القرص غير كافية',
    noActiveConflict: 'لا يوجد تعارض نشط',
    noLinksFound: 'لم يتم العثور على روابط في الملف',
    noValidUrls: 'لم يتم العثور على عناوين URL صالحة',
    noteN: 'ملاحظة {n}',
    odBadToken: 'OneDrive: انتهت صلاحية التفويض. أعد الاتصال من الإعدادات.',
    odBadTokenExp: 'OneDrive: انتهت صلاحية الرمز، جارٍ إعادة المصادقة…',
    odRateLimit: 'OneDrive: تم تجاوز حد الطلبات، حاول لاحقًا',
    odTooBig: 'OneDrive: الملف كبير جدًا ({size} ميغابايت)',
    payloadTooBig: 'البيانات كبيرة جدًا حتى بدون الخلفيات ({size} ميغابايت). قلّل عدد العناصر أو عطّل التشفير.',
    pcBadLink: 'pCloud: فشل الحصول على رابط التنزيل',
    pcErr: 'pCloud: خطأ {err}',
    profileAdded: 'تمت إضافة الملف الشخصي "{name}"',
    profileNotFound: 'الملف الشخصي غير موجود',
    profileRenamed: 'تمت إعادة تسمية الملف الشخصي إلى "{name}"',
    secShort: 'ث',
    serverEmptyUploaded: 'الخادم فارغ — تم رفع البيانات المحلية',
    settingsIncomplete: 'إعدادات المزامنة غير مكتملة',
    showMoreN: 'عرض {n} إضافية',
    srvBadKeys: 'بيانات الخادم تحتوي على حقول غير معروفة: {keys}',
    srvDecryptFail: 'فشل فك التشفير: {msg}',
    srvEncNoKeyFull: 'بيانات الخادم مشفرة، ولكن لم يتم تعيين مفتاح. أدخل المفتاح في الإعدادات.',
    srvEncNoKeyShort: 'البيانات مشفرة، لا يوجد مفتاح',
    srvUnknownFormatType: 'تنسيق بيانات خادم غير معروف: {type}',
    syncInProgress: 'المزامنة قيد التنفيذ بالفعل',
    syncSettingsEmpty: 'إعدادات المزامنة فارغة',
    unknownProvider: 'موفر مزامنة غير معروف: ',
    unknownStrategy: 'استراتيجية تعارض غير معروفة: ',
    uploadFailPrefix: 'فشل الرفع: ',
    uploadGuard: 'تم حظر الرفع: البيانات المحلية فارغة وكانت بيانات الخادم ستُستبدل',
    urlRequired: 'عنوان URL مطلوب',
    yaBadResponseDl: 'Yandex.Disk: استجابة غير صالحة عند التنزيل',
    yaBadResponseUl: 'Yandex.Disk: استجابة غير صالحة عند الرفع',
    yaBadToken: 'Yandex.Disk: فشل التفويض. تحقق من الرمز.',
    yaBadTokenNew: 'Yandex.Disk: انتهت صلاحية الرمز. احصل على رمز جديد.',
    yaFolderErr: 'Yandex.Disk: خطأ في المجلد: {msg}',
    yaFolderFail: 'Yandex.Disk: فشل إنشاء المجلد (HTTP {code})',
    yaForbidden: 'Yandex.Disk: تم رفض الوصول',
    yaNoSpace: 'Yandex.Disk: مساحة القرص غير كافية',
    yaNoToken: 'Yandex.Disk: لم يتم تعيين الرمز'
}
};

Object.keys(translationsToast).forEach(lang => {
    if (translations[lang]) Object.assign(translations[lang], translationsToast[lang]);
});

/* ---------- v6.9.3: авто-контрастный текст ---------- */
const translationsV693 = {
    en: {
        autoContrastText: 'Auto contrast text',
    },
    ru: {
        autoContrastText: 'Авто контрастный текст',
    },
    de: {
        autoContrastText: 'Automatisch kontrastierender Text',
    },
    es: {
        autoContrastText: 'Texto con contraste automático',
    },
    fr: {
        autoContrastText: 'Texte à contraste automatique',
    },
    it: {
        autoContrastText: 'Testo a contrasto automatico',
    },
    pt: {
        autoContrastText: 'Texto com contraste automático',
    },
    zh: {
        autoContrastText: '自动对比文字',
    },
    ja: {
        autoContrastText: '自動コントラストテキスト',
    },
    ko: {
        autoContrastText: '자동 대비 텍스트',
    },
    tr: {
        autoContrastText: 'Otomatik kontrast metin',
    },
    hi: {
        autoContrastText: 'स्वतः कंट्रास्ट टेक्स्ट',
    },
    ar: {
        autoContrastText: 'نص بتباين تلقائي',
    }
};

Object.keys(translationsV693).forEach(lang => {
    if (translations[lang]) Object.assign(translations[lang], translationsV693[lang]);
});

/* Экспорт для страниц (window) и service worker (self) */

/* ===== v6.9.4 — второй сервер синхронизации + автосинхронизация при изменениях ===== */
const translationsV694 = {
    en: {
        secondServerLabel: 'Second server (parallel sync):',
        secondServerOff: '— off —',
        secondServerHint: 'Data is synced to two servers at once. Enter the second service credentials in its section above by switching the primary service. The encryption key is shared.',
        syncPartialFail: 'Upload failed for: ',
        autoSyncOnChangeNote: 'Syncs automatically on every change of bookmarks, folders, notes and settings.'
    },
    ru: {
        secondServerLabel: 'Второй сервер (параллельная синхронизация):',
        secondServerOff: '— выключено —',
        secondServerHint: 'Данные синхронизируются сразу с двумя серверами. Логин и пароль второго сервиса заполните в его секции выше, переключив основной сервис. Ключ шифрования общий.',
        syncPartialFail: 'Не удалось выгрузить на: ',
        autoSyncOnChangeNote: 'Синхронизация запускается автоматически при любом изменении закладок, папок, заметок и настроек.'
    },
    de: {
        secondServerLabel: 'Zweiter Server (parallele Synchronisierung):',
        secondServerOff: '— deaktiviert —',
        secondServerHint: 'Daten werden gleichzeitig mit zwei Servern synchronisiert. Zugangsdaten des zweiten Dienstes oben in dessen Abschnitt eintragen (Primärdienst wechseln). Der Schlüssel ist gemeinsam.',
        syncPartialFail: 'Upload fehlgeschlagen für: ',
        autoSyncOnChangeNote: 'Synchronisiert automatisch bei jeder Änderung von Lesezeichen, Ordnern, Notizen und Einstellungen.'
    },
    es: {
        secondServerLabel: 'Segundo servidor (sincronización paralela):',
        secondServerOff: '— desactivado —',
        secondServerHint: 'Los datos se sincronizan con dos servidores a la vez. Introduce las credenciales del segundo servicio en su sección cambiando el servicio principal. La clave es común.',
        syncPartialFail: 'Error al subir a: ',
        autoSyncOnChangeNote: 'Se sincroniza automáticamente con cada cambio de marcadores, carpetas, notas y ajustes.'
    },
    fr: {
        secondServerLabel: 'Second serveur (synchronisation parallèle) :',
        secondServerOff: '— désactivé —',
        secondServerHint: 'Les données sont synchronisées avec deux serveurs à la fois. Renseignez les identifiants du second service dans sa section en changeant le service principal. Clé commune.',
        syncPartialFail: 'Échec de l’envoi vers : ',
        autoSyncOnChangeNote: 'Synchronisation automatique à chaque modification des favoris, dossiers, notes et paramètres.'
    },
    it: {
        secondServerLabel: 'Secondo server (sincronizzazione parallela):',
        secondServerOff: '— disattivato —',
        secondServerHint: 'I dati vengono sincronizzati con due server contemporaneamente. Inserisci le credenziali del secondo servizio nella sua sezione cambiando il servizio principale. Chiave comune.',
        syncPartialFail: 'Caricamento non riuscito su: ',
        autoSyncOnChangeNote: 'Sincronizza automaticamente a ogni modifica di segnalibri, cartelle, note e impostazioni.'
    },
    pt: {
        secondServerLabel: 'Segundo servidor (sincronização paralela):',
        secondServerOff: '— desativado —',
        secondServerHint: 'Os dados são sincronizados com dois servidores ao mesmo tempo. Preencha as credenciais do segundo serviço na sua seção mudando o serviço principal. Chave comum.',
        syncPartialFail: 'Falha ao enviar para: ',
        autoSyncOnChangeNote: 'Sincroniza automaticamente a cada alteração de favoritos, pastas, notas e configurações.'
    },
    zh: {
        secondServerLabel: '第二服务器（并行同步）：',
        secondServerOff: '— 已关闭 —',
        secondServerHint: '数据将同时同步到两台服务器。请切换主服务后在对应分区填写第二服务的凭据。加密密钥共用。',
        syncPartialFail: '上传失败：',
        autoSyncOnChangeNote: '书签、文件夹、笔记和设置发生任何更改时都会自动同步。'
    },
    ja: {
        secondServerLabel: '2台目のサーバー（並列同期）:',
        secondServerOff: '— オフ —',
        secondServerHint: 'データは2台のサーバーに同時同期されます。2番目のサービスの認証情報は、メインサービスを切り替えて該当セクションに入力してください。暗号化キーは共通です。',
        syncPartialFail: 'アップロードに失敗: ',
        autoSyncOnChangeNote: 'ブックマーク・フォルダー・メモ・設定の変更時にも自動で同期されます。'
    },
    ko: {
        secondServerLabel: '두 번째 서버(병렬 동기화):',
        secondServerOff: '— 끔 —',
        secondServerHint: '데이터가 두 서버에 동시에 동기화됩니다. 기본 서비스를 전환하여 해당 섹션에 두 번째 서비스의 자격 증명을 입력하세요. 암호화 키는 공통입니다.',
        syncPartialFail: '업로드 실패: ',
        autoSyncOnChangeNote: '북마크, 폴더, 메모, 설정이 변경될 때마다 자동으로 동기화됩니다.'
    },
    tr: {
        secondServerLabel: 'İkinci sunucu (paralel eşitleme):',
        secondServerOff: '— kapalı —',
        secondServerHint: 'Veriler aynı anda iki sunucuyla eşitlenir. İkinci hizmetin bilgilerini, ana hizmeti değiştirerek kendi bölümüne girin. Şifreleme anahtarı ortaktır.',
        syncPartialFail: 'Yükleme başarısız: ',
        autoSyncOnChangeNote: 'Yer işaretleri, klasörler, notlar ve ayarlar her değiştiğinde otomatik olarak da eşitlenir.'
    },
    hi: {
        secondServerLabel: 'दूसरा सर्वर (समानांतर सिंक):',
        secondServerOff: '— बंद —',
        secondServerHint: 'डेटा एक साथ दो सर्वरों से सिंक होता है। मुख्य सेवा बदलकर दूसरी सेवा के क्रेडेंशियल उसके सेक्शन में भरें। एन्क्रिप्शन कुंजी साझा है।',
        syncPartialFail: 'अपलोड विफल: ',
        autoSyncOnChangeNote: 'बुकमार्क, फ़ोल्डर, नोट्स और सेटिंग्स में हर बदलाव पर भी अपने आप सिंक होता है।'
    },
    ar: {
        secondServerLabel: ':الخادم الثاني (مزامنة متوازية)',
        secondServerOff: '— معطل —',
        secondServerHint: 'تتم مزامنة البيانات مع خادمين في آن واحد. أدخل بيانات اعتماد الخدمة الثانية في قسمها بتبديل الخدمة الرئيسية. مفتاح التشفير مشترك.',
        syncPartialFail: ':فشل الرفع إلى ',
        autoSyncOnChangeNote: 'تتم المزامنة تلقائيًا أيضًا عند كل تغيير في الإشارات المرجعية والمجلدات والملاحظات والإعدادات.'
    }
};
Object.keys(translationsV694).forEach(lang => { if (translations[lang]) Object.assign(translations[lang], translationsV694[lang]); });

// v6.9.9: 99 previously missing keys x13 (sync conflict dialog, backgrounds, profiles, logs, statuses)
const translationsV699 = {
  en: {
    addFolderHint: 'Add a new folder',
    badJson: 'Invalid JSON file',
    bgBrightnessLbl: 'Brightness',
    bgDefaultName: 'Background',
    bgFileBtn: 'Choose file',
    bgFileSaveErr: 'Failed to save background file',
    bgFillValue: 'Enter value',
    bgIdSaveErr: 'Failed to save background',
    bgNameLbl: 'Name',
    bgNamePh: 'Background name',
    bgPosCenter: 'Center',
    bgPosContain: 'Fit',
    bgPosCover: 'Cover',
    bgPosLbl: 'Position',
    bgPosRepeat: 'Repeat',
    bgSaved: 'Background saved',
    bgTypeColor: 'Color',
    bgTypeFile: 'File',
    bgTypeGradient: 'Gradient',
    bgTypeLbl: 'Type',
    bgTypeUrl: 'URL',
    bgValueLbl: 'Value',
    bgValuePh: '#ffffff, url(...) or gradient',
    btnMerge: 'Merge',
    btnMyLocal: 'My local',
    btnServerSide: 'From server',
    confirmDelBg: 'Delete this background?',
    
    
    confirmResetNesting: 'Reset folder nesting?',
    conflictChoose: '\n\nWhat to do?',
    conflictErr: 'Conflict resolution error',
    conflictIntro: 'Local data and server data differ.\n\n',
    conflictOptLocal: '\n• "My local" — upload local data to the server',
    conflictOptMerge: '\n• "Merge" — combine both versions',
    conflictOptServer: '\n• "From server" — download server data, replacing local',
    connOk: 'Connection successful',
    connTesting: 'Testing connection...',
    
    
    dlgDuplicate: 'Duplicate',
    dlgEditVerb: 'Edit',
    encStatusOn: 'Encryption enabled',
    
    errGeneric: 'An error occurred',
    errPrefix: 'Error: ',
    exportDone: 'Export completed',
    exportHtmlDone: 'HTML export completed',
    fileNoData: 'No data in file',
    
    folderMoved: 'Folder moved',
    fvdImportErr: 'FVD import error',
    fvdNoData: 'No FVD SpeedDial data found',
    fvdParseErr: 'Failed to parse FVD file',
    fvdReading: 'Reading file...',
    
    importCancelled: 'Import cancelled',
    importDone: 'Import completed',
    keepCurrentPwd: 'Keep current password',
    lblDownloaded: 'Downloaded',
    lblLocal: 'Uploaded to server',
    lblMerged: 'Merged',
    lblServer: 'Downloaded from server',
    lblUploaded: 'Uploaded',
    logsCollectErr: 'Failed to collect logs',
    logsCollecting: 'Collecting logs...',
    logsExportErr: 'Failed to export logs',
    logsExported: 'Logs exported',
    logsSaved: 'Logs saved',
    modeSaved: 'Mode saved',
    
    
    
    nestingReset: 'Folder nesting reset',
    noBackgroundsAdd: 'No backgrounds. Add one.',
    noBackgroundsHint: 'Add a background to see it here',
    
    
    noteFolderMoved: 'Note folder moved',
    
    profileDelActiveErr: 'Cannot delete the active profile',
    profileExists: 'A profile with this name already exists',
    profileNameReq: 'Enter a profile name',
    profileRenamePrompt: 'Rename profile:',
    profileSwitchErr: 'Failed to switch profile',
    settingsApplied: 'Settings applied',
    sortFoldersManual: 'Available in manual sort mode',
    sortNoteFoldersManual: 'Available in manual sort mode',
    stActivate: 'Activate',
    
    
    
    
    stMerged: 'Data merged',
    stRename: 'Rename',
    stSyncErrTitle: 'Sync error',
    
    
    syncCancelled: 'Sync cancelled'
  },
  ru: {
    addFolderHint: 'Добавить новую папку',
    badJson: 'Некорректный JSON-файл',
    bgBrightnessLbl: 'Яркость',
    bgDefaultName: 'Фон',
    bgFileBtn: 'Выбрать файл',
    bgFileSaveErr: 'Не удалось сохранить файл фона',
    bgFillValue: 'Введите значение',
    bgIdSaveErr: 'Не удалось сохранить фон',
    bgNameLbl: 'Название',
    bgNamePh: 'Название фона',
    bgPosCenter: 'По центру',
    bgPosContain: 'Вместить',
    bgPosCover: 'Заполнить',
    bgPosLbl: 'Положение',
    bgPosRepeat: 'Повторять',
    bgSaved: 'Фон сохранён',
    bgTypeColor: 'Цвет',
    bgTypeFile: 'Файл',
    bgTypeGradient: 'Градиент',
    bgTypeLbl: 'Тип',
    bgTypeUrl: 'URL',
    bgValueLbl: 'Значение',
    bgValuePh: '#ffffff, url(...) или градиент',
    btnMerge: 'Объединить',
    btnMyLocal: 'Мои локальные',
    btnServerSide: 'С сервера',
    confirmDelBg: 'Удалить этот фон?',
    
    
    confirmResetNesting: 'Сбросить вложенность папок?',
    conflictChoose: '\n\nЧто сделать?',
    conflictErr: 'Ошибка разрешения конфликта',
    conflictIntro: 'Обнаружены расхождения между локальными данными и сервером.\n\n',
    conflictOptLocal: '\n• «Мои локальные» — загрузить локальные данные на сервер',
    conflictOptMerge: '\n• «Объединить» — слить обе версии',
    conflictOptServer: '\n• «С сервера» — скачать данные с сервера, заменив локальные',
    connOk: 'Соединение успешно',
    connTesting: 'Проверка соединения...',
    
    
    dlgDuplicate: 'Дубликат',
    dlgEditVerb: 'Изменить',
    encStatusOn: 'Шифрование включено',
    
    errGeneric: 'Произошла ошибка',
    errPrefix: 'Ошибка: ',
    exportDone: 'Экспорт завершён',
    exportHtmlDone: 'HTML-экспорт завершён',
    fileNoData: 'В файле нет данных',
    
    folderMoved: 'Папка перемещена',
    fvdImportErr: 'Ошибка импорта FVD',
    fvdNoData: 'Данные FVD SpeedDial не найдены',
    fvdParseErr: 'Не удалось разобрать файл FVD',
    fvdReading: 'Чтение файла...',
    
    importCancelled: 'Импорт отменён',
    importDone: 'Импорт завершён',
    keepCurrentPwd: 'Оставить текущий пароль',
    lblDownloaded: 'Загружено',
    lblLocal: 'Загружено на сервер',
    lblMerged: 'Объединено',
    lblServer: 'Скачано с сервера',
    lblUploaded: 'Выгружено',
    logsCollectErr: 'Не удалось собрать логи',
    logsCollecting: 'Сбор логов...',
    logsExportErr: 'Не удалось экспортировать логи',
    logsExported: 'Логи экспортированы',
    logsSaved: 'Логи сохранены',
    modeSaved: 'Режим сохранён',
    
    
    
    nestingReset: 'Вложенность папок сброшена',
    noBackgroundsAdd: 'Нет фонов. Добавьте фон.',
    noBackgroundsHint: 'Добавьте фон, чтобы увидеть его здесь',
    
    
    noteFolderMoved: 'Папка заметок перемещена',
    
    profileDelActiveErr: 'Нельзя удалить активный профиль',
    profileExists: 'Профиль с таким именем уже существует',
    profileNameReq: 'Введите имя профиля',
    profileRenamePrompt: 'Переименовать профиль:',
    profileSwitchErr: 'Не удалось переключить профиль',
    settingsApplied: 'Настройки применены',
    sortFoldersManual: 'Доступно в режиме ручной сортировки',
    sortNoteFoldersManual: 'Доступно в режиме ручной сортировки',
    stActivate: 'Активировать',
    
    
    
    
    stMerged: 'Данные объединены',
    stRename: 'Переименовать',
    stSyncErrTitle: 'Ошибка синхронизации',
    
    
    syncCancelled: 'Синхронизация отменена'
  },
  de: {
    addFolderHint: 'Neuen Ordner hinzufügen',
    badJson: 'Ungültige JSON-Datei',
    bgBrightnessLbl: 'Helligkeit',
    bgDefaultName: 'Hintergrund',
    bgFileBtn: 'Datei wählen',
    bgFileSaveErr: 'Hintergrunddatei konnte nicht gespeichert werden',
    bgFillValue: 'Wert eingeben',
    bgIdSaveErr: 'Hintergrund konnte nicht gespeichert werden',
    bgNameLbl: 'Name',
    bgNamePh: 'Hintergrundname',
    bgPosCenter: 'Zentriert',
    bgPosContain: 'Einpassen',
    bgPosCover: 'Füllen',
    bgPosLbl: 'Position',
    bgPosRepeat: 'Wiederholen',
    bgSaved: 'Hintergrund gespeichert',
    bgTypeColor: 'Farbe',
    bgTypeFile: 'Datei',
    bgTypeGradient: 'Verlauf',
    bgTypeLbl: 'Typ',
    bgTypeUrl: 'URL',
    bgValueLbl: 'Wert',
    bgValuePh: '#ffffff, url(...) oder Verlauf',
    btnMerge: 'Zusammenführen',
    btnMyLocal: 'Meine lokalen',
    btnServerSide: 'Vom Server',
    confirmDelBg: 'Diesen Hintergrund löschen?',
    
    
    confirmResetNesting: 'Ordnerverschachtelung zurücksetzen?',
    conflictChoose: '\n\nWas tun?',
    conflictErr: 'Fehler beim Auflösen des Konflikts',
    conflictIntro: 'Lokale Daten und Serverdaten weichen ab.\n\n',
    conflictOptLocal: '\n• „Meine lokalen" — lokale Daten auf den Server hochladen',
    conflictOptMerge: '\n• „Zusammenführen" — beide Versionen kombinieren',
    conflictOptServer: '\n• „Vom Server" — Serverdaten laden, lokale ersetzen',
    connOk: 'Verbindung erfolgreich',
    connTesting: 'Verbindung wird getestet...',
    
    
    dlgDuplicate: 'Duplikat',
    dlgEditVerb: 'Bearbeiten',
    encStatusOn: 'Verschlüsselung aktiviert',
    
    errGeneric: 'Ein Fehler ist aufgetreten',
    errPrefix: 'Fehler: ',
    exportDone: 'Export abgeschlossen',
    exportHtmlDone: 'HTML-Export abgeschlossen',
    fileNoData: 'Keine Daten in der Datei',
    
    folderMoved: 'Ordner verschoben',
    fvdImportErr: 'FVD-Importfehler',
    fvdNoData: 'Keine FVD-SpeedDial-Daten gefunden',
    fvdParseErr: 'FVD-Datei konnte nicht gelesen werden',
    fvdReading: 'Datei wird gelesen...',
    
    importCancelled: 'Import abgebrochen',
    importDone: 'Import abgeschlossen',
    keepCurrentPwd: 'Aktuelles Passwort behalten',
    lblDownloaded: 'Heruntergeladen',
    lblLocal: 'Zum Server hochgeladen',
    lblMerged: 'Zusammengeführt',
    lblServer: 'Vom Server geladen',
    lblUploaded: 'Hochgeladen',
    logsCollectErr: 'Logs konnten nicht gesammelt werden',
    logsCollecting: 'Logs werden gesammelt...',
    logsExportErr: 'Logs konnten nicht exportiert werden',
    logsExported: 'Logs exportiert',
    logsSaved: 'Logs gespeichert',
    modeSaved: 'Modus gespeichert',
    
    
    
    nestingReset: 'Ordnerverschachtelung zurückgesetzt',
    noBackgroundsAdd: 'Keine Hintergründe. Fügen Sie einen hinzu.',
    noBackgroundsHint: 'Fügen Sie einen Hintergrund hinzu, um ihn hier zu sehen',
    
    
    noteFolderMoved: 'Notizordner verschoben',
    
    profileDelActiveErr: 'Aktives Profil kann nicht gelöscht werden',
    profileExists: 'Ein Profil mit diesem Namen existiert bereits',
    profileNameReq: 'Profilname eingeben',
    profileRenamePrompt: 'Profil umbenennen:',
    profileSwitchErr: 'Profilwechsel fehlgeschlagen',
    settingsApplied: 'Einstellungen übernommen',
    sortFoldersManual: 'Im manuellen Sortiermodus verfügbar',
    sortNoteFoldersManual: 'Im manuellen Sortiermodus verfügbar',
    stActivate: 'Aktivieren',
    
    
    
    
    stMerged: 'Daten zusammengeführt',
    stRename: 'Umbenennen',
    stSyncErrTitle: 'Synchronisierungsfehler',
    
    
    syncCancelled: 'Synchronisierung abgebrochen'
  },
  es: {
    addFolderHint: 'Añadir nueva carpeta',
    badJson: 'Archivo JSON no válido',
    bgBrightnessLbl: 'Brillo',
    bgDefaultName: 'Fondo',
    bgFileBtn: 'Elegir archivo',
    bgFileSaveErr: 'No se pudo guardar el archivo de fondo',
    bgFillValue: 'Introduce un valor',
    bgIdSaveErr: 'No se pudo guardar el fondo',
    bgNameLbl: 'Nombre',
    bgNamePh: 'Nombre del fondo',
    bgPosCenter: 'Centrar',
    bgPosContain: 'Ajustar',
    bgPosCover: 'Cubrir',
    bgPosLbl: 'Posición',
    bgPosRepeat: 'Repetir',
    bgSaved: 'Fondo guardado',
    bgTypeColor: 'Color',
    bgTypeFile: 'Archivo',
    bgTypeGradient: 'Degradado',
    bgTypeLbl: 'Tipo',
    bgTypeUrl: 'URL',
    bgValueLbl: 'Valor',
    bgValuePh: '#ffffff, url(...) o degradado',
    btnMerge: 'Combinar',
    btnMyLocal: 'Mis locales',
    btnServerSide: 'Del servidor',
    confirmDelBg: '¿Eliminar este fondo?',
    
    
    confirmResetNesting: '¿Restablecer el anidado de carpetas?',
    conflictChoose: '\n\n¿Qué hacer?',
    conflictErr: 'Error al resolver el conflicto',
    conflictIntro: 'Los datos locales y del servidor difieren.\n\n',
    conflictOptLocal: '\n• "Mis locales" — subir los datos locales al servidor',
    conflictOptMerge: '\n• "Combinar" — unir ambas versiones',
    conflictOptServer: '\n• "Del servidor" — descargar datos del servidor, reemplazando los locales',
    connOk: 'Conexión correcta',
    connTesting: 'Probando conexión...',
    
    
    dlgDuplicate: 'Duplicado',
    dlgEditVerb: 'Editar',
    encStatusOn: 'Cifrado activado',
    
    errGeneric: 'Se produjo un error',
    errPrefix: 'Error: ',
    exportDone: 'Exportación completada',
    exportHtmlDone: 'Exportación HTML completada',
    fileNoData: 'No hay datos en el archivo',
    
    folderMoved: 'Carpeta movida',
    fvdImportErr: 'Error de importación FVD',
    fvdNoData: 'No se encontraron datos de FVD SpeedDial',
    fvdParseErr: 'No se pudo analizar el archivo FVD',
    fvdReading: 'Leyendo archivo...',
    
    importCancelled: 'Importación cancelada',
    importDone: 'Importación completada',
    keepCurrentPwd: 'Mantener la contraseña actual',
    lblDownloaded: 'Descargado',
    lblLocal: 'Subido al servidor',
    lblMerged: 'Combinado',
    lblServer: 'Descargado del servidor',
    lblUploaded: 'Subido',
    logsCollectErr: 'No se pudieron recopilar los registros',
    logsCollecting: 'Recopilando registros...',
    logsExportErr: 'No se pudieron exportar los registros',
    logsExported: 'Registros exportados',
    logsSaved: 'Registros guardados',
    modeSaved: 'Modo guardado',
    
    
    
    nestingReset: 'Anidado de carpetas restablecido',
    noBackgroundsAdd: 'Sin fondos. Añade uno.',
    noBackgroundsHint: 'Añade un fondo para verlo aquí',
    
    
    noteFolderMoved: 'Carpeta de notas movida',
    
    profileDelActiveErr: 'No se puede eliminar el perfil activo',
    profileExists: 'Ya existe un perfil con ese nombre',
    profileNameReq: 'Introduce el nombre del perfil',
    profileRenamePrompt: 'Renombrar perfil:',
    profileSwitchErr: 'No se pudo cambiar de perfil',
    settingsApplied: 'Ajustes aplicados',
    sortFoldersManual: 'Disponible en ordenación manual',
    sortNoteFoldersManual: 'Disponible en ordenación manual',
    stActivate: 'Activar',
    
    
    
    
    stMerged: 'Datos combinados',
    stRename: 'Renombrar',
    stSyncErrTitle: 'Error de sincronización',
    
    
    syncCancelled: 'Sincronización cancelada'
  },
  fr: {
    addFolderHint: 'Ajouter un nouveau dossier',
    badJson: 'Fichier JSON invalide',
    bgBrightnessLbl: 'Luminosité',
    bgDefaultName: 'Arrière-plan',
    bgFileBtn: 'Choisir un fichier',
    bgFileSaveErr: "Échec de l'enregistrement du fichier d'arrière-plan",
    bgFillValue: 'Saisir une valeur',
    bgIdSaveErr: "Échec de l'enregistrement de l'arrière-plan",
    bgNameLbl: 'Nom',
    bgNamePh: "Nom de l'arrière-plan",
    bgPosCenter: 'Centrer',
    bgPosContain: 'Ajuster',
    bgPosCover: 'Couvrir',
    bgPosLbl: 'Position',
    bgPosRepeat: 'Répéter',
    bgSaved: 'Arrière-plan enregistré',
    bgTypeColor: 'Couleur',
    bgTypeFile: 'Fichier',
    bgTypeGradient: 'Dégradé',
    bgTypeLbl: 'Type',
    bgTypeUrl: 'URL',
    bgValueLbl: 'Valeur',
    bgValuePh: '#ffffff, url(...) ou dégradé',
    btnMerge: 'Fusionner',
    btnMyLocal: 'Mes locales',
    btnServerSide: 'Du serveur',
    confirmDelBg: 'Supprimer cet arrière-plan ?',
    
    
    confirmResetNesting: "Réinitialiser l'imbrication des dossiers ?",
    conflictChoose: '\n\nQue faire ?',
    conflictErr: 'Erreur de résolution du conflit',
    conflictIntro: 'Les données locales et celles du serveur diffèrent.\n\n',
    conflictOptLocal: '\n• « Mes locales » — envoyer les données locales au serveur',
    conflictOptMerge: '\n• « Fusionner » — combiner les deux versions',
    conflictOptServer: '\n• « Du serveur » — télécharger les données du serveur en remplaçant les locales',
    connOk: 'Connexion réussie',
    connTesting: 'Test de connexion...',
    
    
    dlgDuplicate: 'Doublon',
    dlgEditVerb: 'Modifier',
    encStatusOn: 'Chiffrement activé',
    
    errGeneric: "Une erreur s'est produite",
    errPrefix: 'Erreur : ',
    exportDone: 'Export terminé',
    exportHtmlDone: 'Export HTML terminé',
    fileNoData: 'Aucune donnée dans le fichier',
    
    folderMoved: 'Dossier déplacé',
    fvdImportErr: "Erreur d'import FVD",
    fvdNoData: 'Aucune donnée FVD SpeedDial trouvée',
    fvdParseErr: 'Échec de la lecture du fichier FVD',
    fvdReading: 'Lecture du fichier...',
    
    importCancelled: 'Import annulé',
    importDone: 'Import terminé',
    keepCurrentPwd: 'Conserver le mot de passe actuel',
    lblDownloaded: 'Téléchargé',
    lblLocal: 'Envoyé au serveur',
    lblMerged: 'Fusionné',
    lblServer: 'Téléchargé du serveur',
    lblUploaded: 'Envoyé',
    logsCollectErr: 'Échec de la collecte des journaux',
    logsCollecting: 'Collecte des journaux...',
    logsExportErr: "Échec de l'export des journaux",
    logsExported: 'Journaux exportés',
    logsSaved: 'Journaux enregistrés',
    modeSaved: 'Mode enregistré',
    
    
    
    nestingReset: 'Imbrication des dossiers réinitialisée',
    noBackgroundsAdd: 'Aucun arrière-plan. Ajoutez-en un.',
    noBackgroundsHint: 'Ajoutez un arrière-plan pour le voir ici',
    
    
    noteFolderMoved: 'Dossier de notes déplacé',
    
    profileDelActiveErr: 'Impossible de supprimer le profil actif',
    profileExists: 'Un profil avec ce nom existe déjà',
    profileNameReq: 'Entrez un nom de profil',
    profileRenamePrompt: 'Renommer le profil :',
    profileSwitchErr: 'Échec du changement de profil',
    settingsApplied: 'Paramètres appliqués',
    sortFoldersManual: 'Disponible en tri manuel',
    sortNoteFoldersManual: 'Disponible en tri manuel',
    stActivate: 'Activer',
    
    
    
    
    stMerged: 'Données fusionnées',
    stRename: 'Renommer',
    stSyncErrTitle: 'Erreur de synchronisation',
    
    
    syncCancelled: 'Synchronisation annulée'
  },
  it: {
    addFolderHint: 'Aggiungi nuova cartella',
    badJson: 'File JSON non valido',
    bgBrightnessLbl: 'Luminosità',
    bgDefaultName: 'Sfondo',
    bgFileBtn: 'Scegli file',
    bgFileSaveErr: 'Impossibile salvare il file di sfondo',
    bgFillValue: 'Inserisci un valore',
    bgIdSaveErr: 'Impossibile salvare lo sfondo',
    bgNameLbl: 'Nome',
    bgNamePh: 'Nome dello sfondo',
    bgPosCenter: 'Centra',
    bgPosContain: 'Adatta',
    bgPosCover: 'Copri',
    bgPosLbl: 'Posizione',
    bgPosRepeat: 'Ripeti',
    bgSaved: 'Sfondo salvato',
    bgTypeColor: 'Colore',
    bgTypeFile: 'File',
    bgTypeGradient: 'Sfumatura',
    bgTypeLbl: 'Tipo',
    bgTypeUrl: 'URL',
    bgValueLbl: 'Valore',
    bgValuePh: '#ffffff, url(...) o sfumatura',
    btnMerge: 'Unisci',
    btnMyLocal: 'I miei locali',
    btnServerSide: 'Dal server',
    confirmDelBg: 'Eliminare questo sfondo?',
    
    
    confirmResetNesting: "Reimpostare l'annidamento delle cartelle?",
    conflictChoose: '\n\nCosa fare?',
    conflictErr: 'Errore nella risoluzione del conflitto',
    conflictIntro: 'I dati locali e quelli del server differiscono.\n\n',
    conflictOptLocal: '\n• "I miei locali" — carica i dati locali sul server',
    conflictOptMerge: '\n• "Unisci" — combina entrambe le versioni',
    conflictOptServer: '\n• "Dal server" — scarica i dati dal server sostituendo quelli locali',
    connOk: 'Connessione riuscita',
    connTesting: 'Test della connessione...',
    
    
    dlgDuplicate: 'Duplicato',
    dlgEditVerb: 'Modifica',
    encStatusOn: 'Crittografia attivata',
    
    errGeneric: 'Si è verificato un errore',
    errPrefix: 'Errore: ',
    exportDone: 'Esportazione completata',
    exportHtmlDone: 'Esportazione HTML completata',
    fileNoData: 'Nessun dato nel file',
    
    folderMoved: 'Cartella spostata',
    fvdImportErr: 'Errore di importazione FVD',
    fvdNoData: 'Nessun dato FVD SpeedDial trovato',
    fvdParseErr: 'Impossibile analizzare il file FVD',
    fvdReading: 'Lettura del file...',
    
    importCancelled: 'Importazione annullata',
    importDone: 'Importazione completata',
    keepCurrentPwd: 'Mantieni la password attuale',
    lblDownloaded: 'Scaricato',
    lblLocal: 'Caricato sul server',
    lblMerged: 'Unito',
    lblServer: 'Scaricato dal server',
    lblUploaded: 'Caricato',
    logsCollectErr: 'Impossibile raccogliere i log',
    logsCollecting: 'Raccolta dei log...',
    logsExportErr: 'Impossibile esportare i log',
    logsExported: 'Log esportati',
    logsSaved: 'Log salvati',
    modeSaved: 'Modalità salvata',
    
    
    
    nestingReset: 'Annidamento cartelle reimpostato',
    noBackgroundsAdd: 'Nessuno sfondo. Aggiungine uno.',
    noBackgroundsHint: 'Aggiungi uno sfondo per vederlo qui',
    
    
    noteFolderMoved: 'Cartella note spostata',
    
    profileDelActiveErr: 'Impossibile eliminare il profilo attivo',
    profileExists: 'Esiste già un profilo con questo nome',
    profileNameReq: 'Inserisci il nome del profilo',
    profileRenamePrompt: 'Rinomina profilo:',
    profileSwitchErr: 'Cambio profilo non riuscito',
    settingsApplied: 'Impostazioni applicate',
    sortFoldersManual: 'Disponibile in ordinamento manuale',
    sortNoteFoldersManual: 'Disponibile in ordinamento manuale',
    stActivate: 'Attiva',
    
    
    
    
    stMerged: 'Dati uniti',
    stRename: 'Rinomina',
    stSyncErrTitle: 'Errore di sincronizzazione',
    
    
    syncCancelled: 'Sincronizzazione annullata'
  },
  pt: {
    addFolderHint: 'Adicionar nova pasta',
    badJson: 'Ficheiro JSON inválido',
    bgBrightnessLbl: 'Brilho',
    bgDefaultName: 'Fundo',
    bgFileBtn: 'Escolher ficheiro',
    bgFileSaveErr: 'Falha ao guardar o ficheiro de fundo',
    bgFillValue: 'Introduza um valor',
    bgIdSaveErr: 'Falha ao guardar o fundo',
    bgNameLbl: 'Nome',
    bgNamePh: 'Nome do fundo',
    bgPosCenter: 'Centrar',
    bgPosContain: 'Ajustar',
    bgPosCover: 'Cobrir',
    bgPosLbl: 'Posição',
    bgPosRepeat: 'Repetir',
    bgSaved: 'Fundo guardado',
    bgTypeColor: 'Cor',
    bgTypeFile: 'Ficheiro',
    bgTypeGradient: 'Gradiente',
    bgTypeLbl: 'Tipo',
    bgTypeUrl: 'URL',
    bgValueLbl: 'Valor',
    bgValuePh: '#ffffff, url(...) ou gradiente',
    btnMerge: 'Mesclar',
    btnMyLocal: 'Meus locais',
    btnServerSide: 'Do servidor',
    confirmDelBg: 'Eliminar este fundo?',
    
    
    confirmResetNesting: 'Repor o aninhamento de pastas?',
    conflictChoose: '\n\nO que fazer?',
    conflictErr: 'Erro ao resolver o conflito',
    conflictIntro: 'Os dados locais e do servidor divergem.\n\n',
    conflictOptLocal: '\n• "Meus locais" — enviar os dados locais ao servidor',
    conflictOptMerge: '\n• "Mesclar" — combinar ambas as versões',
    conflictOptServer: '\n• "Do servidor" — baixar os dados do servidor, substituindo os locais',
    connOk: 'Ligação bem-sucedida',
    connTesting: 'A testar ligação...',
    
    
    dlgDuplicate: 'Duplicado',
    dlgEditVerb: 'Editar',
    encStatusOn: 'Encriptação ativada',
    
    errGeneric: 'Ocorreu um erro',
    errPrefix: 'Erro: ',
    exportDone: 'Exportação concluída',
    exportHtmlDone: 'Exportação HTML concluída',
    fileNoData: 'Sem dados no ficheiro',
    
    folderMoved: 'Pasta movida',
    fvdImportErr: 'Erro de importação FVD',
    fvdNoData: 'Nenhum dado do FVD SpeedDial encontrado',
    fvdParseErr: 'Falha ao analisar o ficheiro FVD',
    fvdReading: 'A ler o ficheiro...',
    
    importCancelled: 'Importação cancelada',
    importDone: 'Importação concluída',
    keepCurrentPwd: 'Manter a palavra-passe atual',
    lblDownloaded: 'Baixado',
    lblLocal: 'Enviado ao servidor',
    lblMerged: 'Mesclado',
    lblServer: 'Baixado do servidor',
    lblUploaded: 'Enviado',
    logsCollectErr: 'Falha ao recolher registos',
    logsCollecting: 'A recolher registos...',
    logsExportErr: 'Falha ao exportar registos',
    logsExported: 'Registos exportados',
    logsSaved: 'Registos guardados',
    modeSaved: 'Modo guardado',
    
    
    
    nestingReset: 'Aninhamento de pastas reposto',
    noBackgroundsAdd: 'Sem fundos. Adicione um.',
    noBackgroundsHint: 'Adicione um fundo para o ver aqui',
    
    
    noteFolderMoved: 'Pasta de notas movida',
    
    profileDelActiveErr: 'Não é possível eliminar o perfil ativo',
    profileExists: 'Já existe um perfil com este nome',
    profileNameReq: 'Introduza o nome do perfil',
    profileRenamePrompt: 'Renomear perfil:',
    profileSwitchErr: 'Falha ao mudar de perfil',
    settingsApplied: 'Definições aplicadas',
    sortFoldersManual: 'Disponível na ordenação manual',
    sortNoteFoldersManual: 'Disponível na ordenação manual',
    stActivate: 'Ativar',
    
    
    
    
    stMerged: 'Dados combinados',
    stRename: 'Renomear',
    stSyncErrTitle: 'Erro de sincronização',
    
    
    syncCancelled: 'Sincronização cancelada'
  },
  zh: {
    addFolderHint: '添加新文件夹',
    badJson: '无效的 JSON 文件',
    bgBrightnessLbl: '亮度',
    bgDefaultName: '背景',
    bgFileBtn: '选择文件',
    bgFileSaveErr: '无法保存背景文件',
    bgFillValue: '请输入值',
    bgIdSaveErr: '无法保存背景',
    bgNameLbl: '名称',
    bgNamePh: '背景名称',
    bgPosCenter: '居中',
    bgPosContain: '适应',
    bgPosCover: '覆盖',
    bgPosLbl: '位置',
    bgPosRepeat: '平铺',
    bgSaved: '背景已保存',
    bgTypeColor: '颜色',
    bgTypeFile: '文件',
    bgTypeGradient: '渐变',
    bgTypeLbl: '类型',
    bgTypeUrl: 'URL',
    bgValueLbl: '值',
    bgValuePh: '#ffffff、url(...) 或渐变',
    btnMerge: '合并',
    btnMyLocal: '我的本地',
    btnServerSide: '从服务器',
    confirmDelBg: '删除此背景？',
    
    
    confirmResetNesting: '重置文件夹嵌套？',
    conflictChoose: '\n\n如何处理？',
    conflictErr: '解决冲突时出错',
    conflictIntro: '本地数据与服务器数据不一致。\n\n',
    conflictOptLocal: '\n• "我的本地" — 将本地数据上传到服务器',
    conflictOptMerge: '\n• "合并" — 合并两个版本',
    conflictOptServer: '\n• "从服务器" — 从服务器下载数据，替换本地数据',
    connOk: '连接成功',
    connTesting: '正在测试连接...',
    
    
    dlgDuplicate: '重复',
    dlgEditVerb: '编辑',
    encStatusOn: '加密已启用',
    
    errGeneric: '发生错误',
    errPrefix: '错误：',
    exportDone: '导出完成',
    exportHtmlDone: 'HTML 导出完成',
    fileNoData: '文件中没有数据',
    
    folderMoved: '文件夹已移动',
    fvdImportErr: 'FVD 导入错误',
    fvdNoData: '未找到 FVD SpeedDial 数据',
    fvdParseErr: '无法解析 FVD 文件',
    fvdReading: '正在读取文件...',
    
    importCancelled: '导入已取消',
    importDone: '导入完成',
    keepCurrentPwd: '保留当前密码',
    lblDownloaded: '已下载',
    lblLocal: '已上传到服务器',
    lblMerged: '已合并',
    lblServer: '已从服务器下载',
    lblUploaded: '已上传',
    logsCollectErr: '无法收集日志',
    logsCollecting: '正在收集日志...',
    logsExportErr: '无法导出日志',
    logsExported: '日志已导出',
    logsSaved: '日志已保存',
    modeSaved: '模式已保存',
    
    
    
    nestingReset: '文件夹嵌套已重置',
    noBackgroundsAdd: '没有背景。请添加一个。',
    noBackgroundsHint: '添加背景后将在此显示',
    
    
    noteFolderMoved: '笔记文件夹已移动',
    
    profileDelActiveErr: '无法删除当前配置文件',
    profileExists: '同名配置文件已存在',
    profileNameReq: '请输入配置文件名称',
    profileRenamePrompt: '重命名配置文件：',
    profileSwitchErr: '切换配置文件失败',
    settingsApplied: '设置已应用',
    sortFoldersManual: '在手动排序模式下可用',
    sortNoteFoldersManual: '在手动排序模式下可用',
    stActivate: '启用',
    
    
    
    
    stMerged: '数据已合并',
    stRename: '重命名',
    stSyncErrTitle: '同步错误',
    
    
    syncCancelled: '同步已取消'
  },
  ja: {
    addFolderHint: '新しいフォルダーを追加',
    badJson: '無効なJSONファイル',
    bgBrightnessLbl: '明るさ',
    bgDefaultName: '背景',
    bgFileBtn: 'ファイルを選択',
    bgFileSaveErr: '背景ファイルを保存できません',
    bgFillValue: '値を入力',
    bgIdSaveErr: '背景を保存できません',
    bgNameLbl: '名前',
    bgNamePh: '背景の名前',
    bgPosCenter: '中央',
    bgPosContain: 'フィット',
    bgPosCover: 'カバー',
    bgPosLbl: '位置',
    bgPosRepeat: '繰り返し',
    bgSaved: '背景を保存しました',
    bgTypeColor: '色',
    bgTypeFile: 'ファイル',
    bgTypeGradient: 'グラデーション',
    bgTypeLbl: 'タイプ',
    bgTypeUrl: 'URL',
    bgValueLbl: '値',
    bgValuePh: '#ffffff、url(...) またはグラデーション',
    btnMerge: 'マージ',
    btnMyLocal: 'ローカル優先',
    btnServerSide: 'サーバー優先',
    confirmDelBg: 'この背景を削除しますか?',
    
    
    confirmResetNesting: 'フォルダーの入れ子をリセットしますか?',
    conflictChoose: '\n\nどうしますか?',
    conflictErr: '競合の解決エラー',
    conflictIntro: 'ローカルデータとサーバーデータが一致しません。\n\n',
    conflictOptLocal: '\n•「ローカル優先」— ローカルデータをサーバーへアップロード',
    conflictOptMerge: '\n•「マージ」— 両方のバージョンを統合',
    conflictOptServer: '\n•「サーバー優先」— サーバーのデータをダウンロードしローカルを置換',
    connOk: '接続に成功しました',
    connTesting: '接続をテスト中...',
    
    
    dlgDuplicate: '重複',
    dlgEditVerb: '編集',
    encStatusOn: '暗号化が有効',
    
    errGeneric: 'エラーが発生しました',
    errPrefix: 'エラー: ',
    exportDone: 'エクスポート完了',
    exportHtmlDone: 'HTMLエクスポート完了',
    fileNoData: 'ファイルにデータがありません',
    
    folderMoved: 'フォルダーを移動しました',
    fvdImportErr: 'FVDインポートエラー',
    fvdNoData: 'FVD SpeedDialデータが見つかりません',
    fvdParseErr: 'FVDファイルを解析できません',
    fvdReading: 'ファイルを読み込み中...',
    
    importCancelled: 'インポートをキャンセルしました',
    importDone: 'インポート完了',
    keepCurrentPwd: '現在のパスワードを保持',
    lblDownloaded: 'ダウンロード済み',
    lblLocal: 'サーバーへアップロード済み',
    lblMerged: 'マージ済み',
    lblServer: 'サーバーからダウンロード済み',
    lblUploaded: 'アップロード済み',
    logsCollectErr: 'ログを収集できません',
    logsCollecting: 'ログを収集中...',
    logsExportErr: 'ログをエクスポートできません',
    logsExported: 'ログをエクスポートしました',
    logsSaved: 'ログを保存しました',
    modeSaved: 'モードを保存しました',
    
    
    
    nestingReset: 'フォルダーの入れ子をリセットしました',
    noBackgroundsAdd: '背景がありません。追加してください。',
    noBackgroundsHint: '背景を追加するとここに表示されます',
    
    
    noteFolderMoved: 'ノートフォルダーを移動しました',
    
    profileDelActiveErr: 'アクティブなプロファイルは削除できません',
    profileExists: 'この名前のプロファイルは既に存在します',
    profileNameReq: 'プロファイル名を入力してください',
    profileRenamePrompt: 'プロファイル名の変更:',
    profileSwitchErr: 'プロファイルの切り替えに失敗しました',
    settingsApplied: '設定を適用しました',
    sortFoldersManual: '手動並べ替えモードで利用可能',
    sortNoteFoldersManual: '手動並べ替えモードで利用可能',
    stActivate: '有効化',
    
    
    
    
    stMerged: 'データをマージしました',
    stRename: '名前の変更',
    stSyncErrTitle: '同期エラー',
    
    
    syncCancelled: '同期をキャンセルしました'
  },
  ko: {
    addFolderHint: '새 폴더 추가',
    badJson: '잘못된 JSON 파일',
    bgBrightnessLbl: '밝기',
    bgDefaultName: '배경',
    bgFileBtn: '파일 선택',
    bgFileSaveErr: '배경 파일을 저장하지 못했습니다',
    bgFillValue: '값 입력',
    bgIdSaveErr: '배경을 저장하지 못했습니다',
    bgNameLbl: '이름',
    bgNamePh: '배경 이름',
    bgPosCenter: '가운데',
    bgPosContain: '맞춤',
    bgPosCover: '채우기',
    bgPosLbl: '위치',
    bgPosRepeat: '반복',
    bgSaved: '배경 저장됨',
    bgTypeColor: '색상',
    bgTypeFile: '파일',
    bgTypeGradient: '그라데이션',
    bgTypeLbl: '유형',
    bgTypeUrl: 'URL',
    bgValueLbl: '값',
    bgValuePh: '#ffffff, url(...) 또는 그라데이션',
    btnMerge: '병합',
    btnMyLocal: '내 로컬',
    btnServerSide: '서버에서',
    confirmDelBg: '이 배경을 삭제하시겠습니까?',
    
    
    confirmResetNesting: '폴더 중첩을 초기화하시겠습니까?',
    conflictChoose: '\n\n어떻게 할까요?',
    conflictErr: '충돌 해결 오류',
    conflictIntro: '로컬 데이터와 서버 데이터가 다릅니다.\n\n',
    conflictOptLocal: '\n• "내 로컬" — 로컬 데이터를 서버로 업로드',
    conflictOptMerge: '\n• "병합" — 두 버전 병합',
    conflictOptServer: '\n• "서버에서" — 서버 데이터를 다운로드하여 로컬 대체',
    connOk: '연결 성공',
    connTesting: '연결 테스트 중...',
    
    
    dlgDuplicate: '중복',
    dlgEditVerb: '편집',
    encStatusOn: '암호화 사용',
    
    errGeneric: '오류가 발생했습니다',
    errPrefix: '오류: ',
    exportDone: '내보내기 완료',
    exportHtmlDone: 'HTML 내보내기 완료',
    fileNoData: '파일에 데이터가 없습니다',
    
    folderMoved: '폴더 이동됨',
    fvdImportErr: 'FVD 가져오기 오류',
    fvdNoData: 'FVD SpeedDial 데이터를 찾을 수 없습니다',
    fvdParseErr: 'FVD 파일을 분석할 수 없습니다',
    fvdReading: '파일 읽는 중...',
    
    importCancelled: '가져오기 취소됨',
    importDone: '가져오기 완료',
    keepCurrentPwd: '현재 비밀번호 유지',
    lblDownloaded: '다운로드됨',
    lblLocal: '서버로 업로드됨',
    lblMerged: '병합됨',
    lblServer: '서버에서 다운로드됨',
    lblUploaded: '업로드됨',
    logsCollectErr: '로그를 수집하지 못했습니다',
    logsCollecting: '로그 수집 중...',
    logsExportErr: '로그를 내보내지 못했습니다',
    logsExported: '로그 내보내기 완료',
    logsSaved: '로그 저장됨',
    modeSaved: '모드 저장됨',
    
    
    
    nestingReset: '폴더 중첩 초기화됨',
    noBackgroundsAdd: '배경이 없습니다. 추가하세요.',
    noBackgroundsHint: '배경을 추가하면 여기에 표시됩니다',
    
    
    noteFolderMoved: '노트 폴더 이동됨',
    
    profileDelActiveErr: '활성 프로필은 삭제할 수 없습니다',
    profileExists: '같은 이름의 프로필이 이미 있습니다',
    profileNameReq: '프로필 이름 입력',
    profileRenamePrompt: '프로필 이름 변경:',
    profileSwitchErr: '프로필 전환 실패',
    settingsApplied: '설정이 적용되었습니다',
    sortFoldersManual: '수동 정렬 모드에서 사용 가능',
    sortNoteFoldersManual: '수동 정렬 모드에서 사용 가능',
    stActivate: '활성화',
    
    
    
    
    stMerged: '데이터 병합됨',
    stRename: '이름 변경',
    stSyncErrTitle: '동기화 오류',
    
    
    syncCancelled: '동기화 취소됨'
  },
  tr: {
    addFolderHint: 'Yeni klasör ekle',
    badJson: 'Geçersiz JSON dosyası',
    bgBrightnessLbl: 'Parlaklık',
    bgDefaultName: 'Arka plan',
    bgFileBtn: 'Dosya seç',
    bgFileSaveErr: 'Arka plan dosyası kaydedilemedi',
    bgFillValue: 'Değer girin',
    bgIdSaveErr: 'Arka plan kaydedilemedi',
    bgNameLbl: 'Ad',
    bgNamePh: 'Arka plan adı',
    bgPosCenter: 'Ortala',
    bgPosContain: 'Sığdır',
    bgPosCover: 'Kapla',
    bgPosLbl: 'Konum',
    bgPosRepeat: 'Yinele',
    bgSaved: 'Arka plan kaydedildi',
    bgTypeColor: 'Renk',
    bgTypeFile: 'Dosya',
    bgTypeGradient: 'Degrade',
    bgTypeLbl: 'Tür',
    bgTypeUrl: 'URL',
    bgValueLbl: 'Değer',
    bgValuePh: '#ffffff, url(...) veya degrade',
    btnMerge: 'Birleştir',
    btnMyLocal: 'Yerel verilerim',
    btnServerSide: 'Sunucudan',
    confirmDelBg: 'Bu arka plan silinsin mi?',
    
    
    confirmResetNesting: 'Klasör iç içe geçmesi sıfırlansın mı?',
    conflictChoose: '\n\nNe yapılsın?',
    conflictErr: 'Çakışma çözümleme hatası',
    conflictIntro: 'Yerel verilerle sunucu verileri uyuşmuyor.\n\n',
    conflictOptLocal: '\n• "Yerel verilerim" — yerel verileri sunucuya yükle',
    conflictOptMerge: '\n• "Birleştir" — iki sürümü birleştir',
    conflictOptServer: '\n• "Sunucudan" — sunucu verilerini indir, yerel verileri değiştir',
    connOk: 'Bağlantı başarılı',
    connTesting: 'Bağlantı test ediliyor...',
    
    
    dlgDuplicate: 'Kopya',
    dlgEditVerb: 'Düzenle',
    encStatusOn: 'Şifreleme etkin',
    
    errGeneric: 'Bir hata oluştu',
    errPrefix: 'Hata: ',
    exportDone: 'Dışa aktarma tamamlandı',
    exportHtmlDone: 'HTML dışa aktarma tamamlandı',
    fileNoData: 'Dosyada veri yok',
    
    folderMoved: 'Klasör taşındı',
    fvdImportErr: 'FVD içe aktarma hatası',
    fvdNoData: 'FVD SpeedDial verisi bulunamadı',
    fvdParseErr: 'FVD dosyası ayrıştırılamadı',
    fvdReading: 'Dosya okunuyor...',
    
    importCancelled: 'İçe aktarma iptal edildi',
    importDone: 'İçe aktarma tamamlandı',
    keepCurrentPwd: 'Mevcut parolayı koru',
    lblDownloaded: 'İndirildi',
    lblLocal: 'Sunucuya yüklendi',
    lblMerged: 'Birleştirildi',
    lblServer: 'Sunucudan indirildi',
    lblUploaded: 'Yüklendi',
    logsCollectErr: 'Günlükler toplanamadı',
    logsCollecting: 'Günlükler toplanıyor...',
    logsExportErr: 'Günlükler dışa aktarılamadı',
    logsExported: 'Günlükler dışa aktarıldı',
    logsSaved: 'Günlükler kaydedildi',
    modeSaved: 'Mod kaydedildi',
    
    
    
    nestingReset: 'Klasör iç içe geçmesi sıfırlandı',
    noBackgroundsAdd: 'Arka plan yok. Bir tane ekleyin.',
    noBackgroundsHint: 'Burada görmek için bir arka plan ekleyin',
    
    
    noteFolderMoved: 'Not klasörü taşındı',
    
    profileDelActiveErr: 'Etkin profil silinemez',
    profileExists: 'Bu ada sahip bir profil zaten var',
    profileNameReq: 'Profil adı girin',
    profileRenamePrompt: 'Profili yeniden adlandır:',
    profileSwitchErr: 'Profil değiştirilemedi',
    settingsApplied: 'Ayarlar uygulandı',
    sortFoldersManual: 'Manuel sıralama modunda kullanılabilir',
    sortNoteFoldersManual: 'Manuel sıralama modunda kullanılabilir',
    stActivate: 'Etkinleştir',
    
    
    
    
    stMerged: 'Veriler birleştirildi',
    stRename: 'Yeniden adlandır',
    stSyncErrTitle: 'Eşitleme hatası',
    
    
    syncCancelled: 'Eşitleme iptal edildi'
  },
  hi: {
    addFolderHint: 'नया फ़ोल्डर जोड़ें',
    badJson: 'अमान्य JSON फ़ाइल',
    bgBrightnessLbl: 'चमक',
    bgDefaultName: 'पृष्ठभूमि',
    bgFileBtn: 'फ़ाइल चुनें',
    bgFileSaveErr: 'पृष्ठभूमि फ़ाइल सहेजी नहीं जा सकी',
    bgFillValue: 'मान दर्ज करें',
    bgIdSaveErr: 'पृष्ठभूमि सहेजी नहीं जा सकी',
    bgNameLbl: 'नाम',
    bgNamePh: 'पृष्ठभूमि का नाम',
    bgPosCenter: 'केंद्र',
    bgPosContain: 'समायोजित',
    bgPosCover: 'कवर',
    bgPosLbl: 'स्थिति',
    bgPosRepeat: 'दोहराएँ',
    bgSaved: 'पृष्ठभूमि सहेजी गई',
    bgTypeColor: 'रंग',
    bgTypeFile: 'फ़ाइल',
    bgTypeGradient: 'ग्रेडिएंट',
    bgTypeLbl: 'प्रकार',
    bgTypeUrl: 'URL',
    bgValueLbl: 'मान',
    bgValuePh: '#ffffff, url(...) या ग्रेडिएंट',
    btnMerge: 'मर्ज',
    btnMyLocal: 'मेरा लोकल',
    btnServerSide: 'सर्वर से',
    confirmDelBg: 'यह पृष्ठभूमि हटाएँ?',
    
    
    confirmResetNesting: 'फ़ोल्डर नेस्टिंग रीसेट करें?',
    conflictChoose: '\n\nक्या करें?',
    conflictErr: 'कॉन्फ्लिक्ट सुलझाने में त्रुटि',
    conflictIntro: 'लोकल डेटा और सर्वर डेटा में अंतर है।\n\n',
    conflictOptLocal: '\n• "मेरा लोकल" — लोकल डेटा सर्वर पर अपलोड करें',
    conflictOptMerge: '\n• "मर्ज" — दोनों संस्करणों को मिलाएँ',
    conflictOptServer: '\n• "सर्वर से" — सर्वर डेटा डाउनलोड करें, लोकल को बदलें',
    connOk: 'कनेक्शन सफल',
    connTesting: 'कनेक्शन जाँचा जा रहा है...',
    
    
    dlgDuplicate: 'डुप्लिकेट',
    dlgEditVerb: 'संपादित करें',
    encStatusOn: 'एन्क्रिप्शन चालू',
    
    errGeneric: 'एक त्रुटि हुई',
    errPrefix: 'त्रुटि: ',
    exportDone: 'निर्यात पूर्ण',
    exportHtmlDone: 'HTML निर्यात पूर्ण',
    fileNoData: 'फ़ाइल में कोई डेटा नहीं',
    
    folderMoved: 'फ़ोल्डर स्थानांतरित',
    fvdImportErr: 'FVD आयात त्रुटि',
    fvdNoData: 'कोई FVD SpeedDial डेटा नहीं मिला',
    fvdParseErr: 'FVD फ़ाइल पार्स नहीं हो सकी',
    fvdReading: 'फ़ाइल पढ़ी जा रही है...',
    
    importCancelled: 'आयात रद्द',
    importDone: 'आयात पूर्ण',
    keepCurrentPwd: 'वर्तमान पासवर्ड रखें',
    lblDownloaded: 'डाउनलोड हुआ',
    lblLocal: 'सर्वर पर अपलोड हुआ',
    lblMerged: 'मर्ज हुआ',
    lblServer: 'सर्वर से डाउनलोड हुआ',
    lblUploaded: 'अपलोड हुआ',
    logsCollectErr: 'लॉग एकत्रित नहीं हो सके',
    logsCollecting: 'लॉग एकत्रित हो रहे हैं...',
    logsExportErr: 'लॉग निर्यात नहीं हो सके',
    logsExported: 'लॉग निर्यात किए गए',
    logsSaved: 'लॉग सहेजे गए',
    modeSaved: 'मोड सहेजा गया',
    
    
    
    nestingReset: 'फ़ोल्डर नेस्टिंग रीसेट हुई',
    noBackgroundsAdd: 'कोई पृष्ठभूमि नहीं। एक जोड़ें।',
    noBackgroundsHint: 'यहाँ देखने के लिए पृष्ठभूमि जोड़ें',
    
    
    noteFolderMoved: 'नोट फ़ोल्डर स्थानांतरित',
    
    profileDelActiveErr: 'सक्रिय प्रोफ़ाइल हटाई नहीं जा सकती',
    profileExists: 'इस नाम की प्रोफ़ाइल पहले से मौजूद है',
    profileNameReq: 'प्रोफ़ाइल नाम दर्ज करें',
    profileRenamePrompt: 'प्रोफ़ाइल का नाम बदलें:',
    profileSwitchErr: 'प्रोफ़ाइल बदली नहीं जा सकी',
    settingsApplied: 'सेटिंग्स लागू की गईं',
    sortFoldersManual: 'मैनुअल क्रम मोड में उपलब्ध',
    sortNoteFoldersManual: 'मैनुअल क्रम मोड में उपलब्ध',
    stActivate: 'सक्रिय करें',
    
    
    
    
    stMerged: 'डेटा मर्ज हुआ',
    stRename: 'नाम बदलें',
    stSyncErrTitle: 'सिंक त्रुटि',
    
    
    syncCancelled: 'सिंक रद्द किया गया'
  },
  ar: {
    addFolderHint: 'إضافة مجلد جديد',
    badJson: 'ملف JSON غير صالح',
    bgBrightnessLbl: 'السطوع',
    bgDefaultName: 'خلفية',
    bgFileBtn: 'اختيار ملف',
    bgFileSaveErr: 'تعذر حفظ ملف الخلفية',
    bgFillValue: 'أدخل قيمة',
    bgIdSaveErr: 'تعذر حفظ الخلفية',
    bgNameLbl: 'الاسم',
    bgNamePh: 'اسم الخلفية',
    bgPosCenter: 'توسيط',
    bgPosContain: 'احتواء',
    bgPosCover: 'تغطية',
    bgPosLbl: 'الموضع',
    bgPosRepeat: 'تكرار',
    bgSaved: 'تم حفظ الخلفية',
    bgTypeColor: 'لون',
    bgTypeFile: 'ملف',
    bgTypeGradient: 'تدرج',
    bgTypeLbl: 'النوع',
    bgTypeUrl: 'URL',
    bgValueLbl: 'القيمة',
    bgValuePh: '#ffffff أو url(...) أو تدرج',
    btnMerge: 'دمج',
    btnMyLocal: 'المحلية',
    btnServerSide: 'من الخادم',
    confirmDelBg: 'حذف هذه الخلفية؟',
    
    
    confirmResetNesting: 'إعادة تعيين تداخل المجلدات؟',
    conflictChoose: '\n\nماذا تفعل؟',
    conflictErr: 'خطأ في حل التعارض',
    conflictIntro: 'توجد اختلافات بين البيانات المحلية وبيانات الخادم.\n\n',
    conflictOptLocal: '\n• «المحلية» — رفع البيانات المحلية إلى الخادم',
    conflictOptMerge: '\n• «دمج» — دمج النسختين',
    conflictOptServer: '\n• «من الخادم» — تنزيل بيانات الخادم واستبدال المحلية',
    connOk: 'تم الاتصال بنجاح',
    connTesting: 'جارٍ اختبار الاتصال...',
    
    
    dlgDuplicate: 'مكرر',
    dlgEditVerb: 'تحرير',
    encStatusOn: 'التشفير مفعّل',
    
    errGeneric: 'حدث خطأ',
    errPrefix: 'خطأ: ',
    exportDone: 'اكتمل التصدير',
    exportHtmlDone: 'اكتمل تصدير HTML',
    fileNoData: 'لا توجد بيانات في الملف',
    
    folderMoved: 'تم نقل المجلد',
    fvdImportErr: 'خطأ في استيراد FVD',
    fvdNoData: 'لم يتم العثور على بيانات FVD SpeedDial',
    fvdParseErr: 'تعذر تحليل ملف FVD',
    fvdReading: 'جارٍ قراءة الملف...',
    
    importCancelled: 'تم إلغاء الاستيراد',
    importDone: 'اكتمل الاستيراد',
    keepCurrentPwd: 'الاحتفاظ بكلمة المرور الحالية',
    lblDownloaded: 'تم التنزيل',
    lblLocal: 'تم الرفع إلى الخادم',
    lblMerged: 'تم الدمج',
    lblServer: 'تم التنزيل من الخادم',
    lblUploaded: 'تم الرفع',
    logsCollectErr: 'تعذر جمع السجلات',
    logsCollecting: 'جارٍ جمع السجلات...',
    logsExportErr: 'تعذر تصدير السجلات',
    logsExported: 'تم تصدير السجلات',
    logsSaved: 'تم حفظ السجلات',
    modeSaved: 'تم حفظ الوضع',
    
    
    
    nestingReset: 'تمت إعادة تعيين تداخل المجلدات',
    noBackgroundsAdd: 'لا توجد خلفيات. أضف واحدة.',
    noBackgroundsHint: 'أضف خلفية لعرضها هنا',
    
    
    noteFolderMoved: 'تم نقل مجلد الملاحظات',
    
    profileDelActiveErr: 'لا يمكن حذف الملف الشخصي النشط',
    profileExists: 'يوجد ملف شخصي بهذا الاسم بالفعل',
    profileNameReq: 'أدخل اسم الملف الشخصي',
    profileRenamePrompt: 'إعادة تسمية الملف الشخصي:',
    profileSwitchErr: 'تعذر تبديل الملف الشخصي',
    settingsApplied: 'تم تطبيق الإعدادات',
    sortFoldersManual: 'متاح في وضع الفرز اليدوي',
    sortNoteFoldersManual: 'متاح في وضع الفرز اليدوي',
    stActivate: 'تفعيل',
    
    
    
    
    stMerged: 'تم دمج البيانات',
    stRename: 'إعادة تسمية',
    stSyncErrTitle: 'خطأ في المزامنة',
    
    
    syncCancelled: 'تم إلغاء المزامنة'
  }
};
Object.keys(translationsV699).forEach(lang => {
  if (translations[lang]) Object.assign(translations[lang], translationsV699[lang]);
});

if (typeof window !== 'undefined') {
    window.translations = translations;
}
if (typeof self !== 'undefined') {
    self.translations = translations;
}

// Android navigation, accessibility, privacy and native messages.
const translationsAndroid = {
  "en": {
    "openMenu": "Open menu",
    "appMenu": "App menu",
    "closeMenu": "Close menu",
    "localSearchLabel": "Search bookmarks and notes",
    "switchTheme": "Change theme",
    "appearanceMenu": "Background and appearance",
    "back": "‹ Back",
    "noteAddShort": "+ Note",
    "saveAndCloseNote": "Save note and close",
    "moveEarlier": "↑ Move earlier",
    "moveLater": "↓ Move later",
    "androidScheduleInfo": "Scheduled sync works while the app is open. Transfer browser bookmarks using HTML/JSON.",
    "browserExtension": "Browser extension",
    "fileSaved": "File saved",
    "fileSaveError": "Could not save the file",
    "filePending": "Finish saving the previous file",
    "noLinkApp": "No app available to open this link",
    "cloudDecryptFail": "Could not decrypt the server file: ",
    "backToBookmarks": "Back to bookmarks",
    "privacyStorage": "Bookmarks, notes and backgrounds are stored in the app’s private Android database. There is no advertising analytics.",
    "privacySync": "Cloud sync uses the services you select. With an encryption key, AES-GCM and PBKDF2 protect uploads; without it, data is sent as JSON.",
    "privacyPasswords": "Folder passwords use PBKDF2 hashes and restrict access through the interface. The local database is not encrypted as a whole.",
    "privacyIcons": "Site icons load from the source selected in settings: the website itself or Google. Links open in an external browser."
  },
  "ru": {
    "openMenu": "Открыть меню",
    "appMenu": "Меню приложения",
    "closeMenu": "Закрыть меню",
    "localSearchLabel": "Поиск по закладкам и заметкам",
    "switchTheme": "Сменить тему",
    "appearanceMenu": "Фон и оформление",
    "back": "‹ Назад",
    "noteAddShort": "+ Заметка",
    "saveAndCloseNote": "Сохранить заметку и закрыть",
    "moveEarlier": "↑ Переместить выше",
    "moveLater": "↓ Переместить ниже",
    "androidScheduleInfo": "Синхронизация по расписанию работает, пока приложение открыто. Закладки браузера переносите через HTML/JSON.",
    "browserExtension": "Расширение для браузера",
    "fileSaved": "Файл сохранён",
    "fileSaveError": "Не удалось сохранить файл",
    "filePending": "Завершите сохранение предыдущего файла",
    "noLinkApp": "Не найдено приложение для открытия ссылки",
    "cloudDecryptFail": "Не удалось расшифровать серверный файл: ",
    "backToBookmarks": "Назад к закладкам",
    "privacyStorage": "Закладки, заметки и фоны хранятся в приватной базе Android. У приложения нет рекламной аналитики.",
    "privacySync": "Облачная синхронизация использует выбранные вами сервисы. С ключом шифрования применяются AES-GCM и PBKDF2; без ключа данные отправляются в JSON.",
    "privacyPasswords": "Пароли папок хранятся как PBKDF2-хэши и ограничивают доступ через интерфейс. Локальная база целиком не зашифрована.",
    "privacyIcons": "Иконки загружаются из выбранного источника: с сайта или через Google. Ссылки открываются во внешнем браузере."
  },
  "de": {
    "openMenu": "Menü öffnen",
    "appMenu": "App-Menü",
    "closeMenu": "Menü schließen",
    "localSearchLabel": "Lesezeichen und Notizen durchsuchen",
    "switchTheme": "Design wechseln",
    "appearanceMenu": "Hintergrund und Darstellung",
    "back": "‹ Zurück",
    "noteAddShort": "+ Notiz",
    "saveAndCloseNote": "Notiz speichern und schließen",
    "moveEarlier": "↑ Nach oben verschieben",
    "moveLater": "↓ Nach unten verschieben",
    "androidScheduleInfo": "Die geplante Synchronisierung läuft bei geöffneter App. Browser-Lesezeichen über HTML/JSON übertragen.",
    "browserExtension": "Browser-Erweiterung",
    "fileSaved": "Datei gespeichert",
    "fileSaveError": "Datei konnte nicht gespeichert werden",
    "filePending": "Speichern der vorherigen Datei abschließen",
    "noLinkApp": "Keine App zum Öffnen dieses Links verfügbar",
    "cloudDecryptFail": "Serverdatei konnte nicht entschlüsselt werden: ",
    "backToBookmarks": "Zurück zu den Lesezeichen",
    "privacyStorage": "Lesezeichen, Notizen und Hintergründe liegen in der privaten Android-Datenbank der App. Es gibt keine Werbeanalyse.",
    "privacySync": "Die Cloud-Synchronisierung verwendet die gewählten Dienste. Mit einem Schlüssel schützen AES-GCM und PBKDF2 die Übertragung; ohne Schlüssel werden Daten als JSON gesendet.",
    "privacyPasswords": "Ordnerpasswörter werden als PBKDF2-Hashes gespeichert und schützen den Zugriff über die Oberfläche. Die lokale Datenbank ist nicht vollständig verschlüsselt.",
    "privacyIcons": "Website-Symbole stammen je nach Einstellung von der Website oder Google. Links werden im externen Browser geöffnet."
  },
  "es": {
    "openMenu": "Abrir menú",
    "appMenu": "Menú de la aplicación",
    "closeMenu": "Cerrar menú",
    "localSearchLabel": "Buscar marcadores y notas",
    "switchTheme": "Cambiar tema",
    "appearanceMenu": "Fondo y apariencia",
    "back": "‹ Atrás",
    "noteAddShort": "+ Nota",
    "saveAndCloseNote": "Guardar nota y cerrar",
    "moveEarlier": "↑ Mover arriba",
    "moveLater": "↓ Mover abajo",
    "androidScheduleInfo": "La sincronización programada funciona con la aplicación abierta. Transfiera marcadores mediante HTML/JSON.",
    "browserExtension": "Extensión del navegador",
    "fileSaved": "Archivo guardado",
    "fileSaveError": "No se pudo guardar el archivo",
    "filePending": "Termine de guardar el archivo anterior",
    "noLinkApp": "No hay ninguna aplicación para abrir este enlace",
    "cloudDecryptFail": "No se pudo descifrar el archivo del servidor: ",
    "backToBookmarks": "Volver a los marcadores",
    "privacyStorage": "Los marcadores, notas y fondos se guardan en la base privada de Android. No hay analítica publicitaria.",
    "privacySync": "La sincronización usa los servicios elegidos. Con clave se usan AES-GCM y PBKDF2; sin clave los datos se envían como JSON.",
    "privacyPasswords": "Las contraseñas de carpetas se guardan como hashes PBKDF2 y restringen el acceso desde la interfaz. La base local no está cifrada en su totalidad.",
    "privacyIcons": "Los iconos se descargan del sitio o de Google según los ajustes. Los enlaces se abren en un navegador externo."
  },
  "fr": {
    "openMenu": "Ouvrir le menu",
    "appMenu": "Menu de l’application",
    "closeMenu": "Fermer le menu",
    "localSearchLabel": "Rechercher des favoris et des notes",
    "switchTheme": "Changer de thème",
    "appearanceMenu": "Fond et apparence",
    "back": "‹ Retour",
    "noteAddShort": "+ Note",
    "saveAndCloseNote": "Enregistrer la note et fermer",
    "moveEarlier": "↑ Déplacer vers le haut",
    "moveLater": "↓ Déplacer vers le bas",
    "androidScheduleInfo": "La synchronisation planifiée fonctionne lorsque l’application est ouverte. Transférez les favoris via HTML/JSON.",
    "browserExtension": "Extension de navigateur",
    "fileSaved": "Fichier enregistré",
    "fileSaveError": "Impossible d’enregistrer le fichier",
    "filePending": "Terminez l’enregistrement du fichier précédent",
    "noLinkApp": "Aucune application ne peut ouvrir ce lien",
    "cloudDecryptFail": "Impossible de déchiffrer le fichier du serveur : ",
    "backToBookmarks": "Retour aux favoris",
    "privacyStorage": "Les favoris, notes et fonds sont stockés dans la base Android privée de l’application. Aucune analyse publicitaire.",
    "privacySync": "La synchronisation utilise les services choisis. Avec une clé, AES-GCM et PBKDF2 protègent les envois ; sans clé, les données sont envoyées en JSON.",
    "privacyPasswords": "Les mots de passe des dossiers sont stockés sous forme de hachages PBKDF2 et limitent l’accès via l’interface. La base locale n’est pas entièrement chiffrée.",
    "privacyIcons": "Les icônes proviennent du site ou de Google selon les réglages. Les liens s’ouvrent dans un navigateur externe."
  },
  "it": {
    "openMenu": "Apri menu",
    "appMenu": "Menu dell’app",
    "closeMenu": "Chiudi menu",
    "localSearchLabel": "Cerca segnalibri e note",
    "switchTheme": "Cambia tema",
    "appearanceMenu": "Sfondo e aspetto",
    "back": "‹ Indietro",
    "noteAddShort": "+ Nota",
    "saveAndCloseNote": "Salva la nota e chiudi",
    "moveEarlier": "↑ Sposta su",
    "moveLater": "↓ Sposta giù",
    "androidScheduleInfo": "La sincronizzazione pianificata funziona con l’app aperta. Trasferisci i segnalibri tramite HTML/JSON.",
    "browserExtension": "Estensione per browser",
    "fileSaved": "File salvato",
    "fileSaveError": "Impossibile salvare il file",
    "filePending": "Completa il salvataggio del file precedente",
    "noLinkApp": "Nessuna app disponibile per aprire questo link",
    "cloudDecryptFail": "Impossibile decifrare il file del server: ",
    "backToBookmarks": "Torna ai segnalibri",
    "privacyStorage": "Segnalibri, note e sfondi sono salvati nel database Android privato dell’app. Non sono presenti analisi pubblicitarie.",
    "privacySync": "La sincronizzazione usa i servizi scelti. Con una chiave si usano AES-GCM e PBKDF2; senza chiave i dati vengono inviati come JSON.",
    "privacyPasswords": "Le password delle cartelle sono salvate come hash PBKDF2 e limitano l’accesso dall’interfaccia. Il database locale non è interamente cifrato.",
    "privacyIcons": "Le icone provengono dal sito o da Google secondo le impostazioni. I link si aprono nel browser esterno."
  },
  "pt": {
    "openMenu": "Abrir menu",
    "appMenu": "Menu do aplicativo",
    "closeMenu": "Fechar menu",
    "localSearchLabel": "Pesquisar favoritos e notas",
    "switchTheme": "Alterar tema",
    "appearanceMenu": "Fundo e aparência",
    "back": "‹ Voltar",
    "noteAddShort": "+ Nota",
    "saveAndCloseNote": "Salvar nota e fechar",
    "moveEarlier": "↑ Mover para cima",
    "moveLater": "↓ Mover para baixo",
    "androidScheduleInfo": "A sincronização agendada funciona com o aplicativo aberto. Transfira favoritos usando HTML/JSON.",
    "browserExtension": "Extensão do navegador",
    "fileSaved": "Arquivo salvo",
    "fileSaveError": "Não foi possível salvar o arquivo",
    "filePending": "Conclua o salvamento do arquivo anterior",
    "noLinkApp": "Nenhum aplicativo disponível para abrir este link",
    "cloudDecryptFail": "Não foi possível descriptografar o arquivo do servidor: ",
    "backToBookmarks": "Voltar aos favoritos",
    "privacyStorage": "Favoritos, notas e fundos ficam no banco privado do Android. Não há análise publicitária.",
    "privacySync": "A sincronização usa os serviços escolhidos. Com chave, AES-GCM e PBKDF2 protegem o envio; sem chave, os dados são enviados em JSON.",
    "privacyPasswords": "Senhas de pastas são hashes PBKDF2 e restringem o acesso pela interface. O banco local não é totalmente criptografado.",
    "privacyIcons": "Os ícones vêm do site ou do Google conforme os ajustes. Links abrem em um navegador externo."
  },
  "zh": {
    "openMenu": "打开菜单",
    "appMenu": "应用菜单",
    "closeMenu": "关闭菜单",
    "localSearchLabel": "搜索书签和笔记",
    "switchTheme": "切换主题",
    "appearanceMenu": "背景与外观",
    "back": "‹ 返回",
    "noteAddShort": "+ 笔记",
    "saveAndCloseNote": "保存笔记并关闭",
    "moveEarlier": "↑ 上移",
    "moveLater": "↓ 下移",
    "androidScheduleInfo": "定时同步仅在应用打开时运行。请通过 HTML/JSON 传输浏览器书签。",
    "browserExtension": "浏览器扩展程序",
    "fileSaved": "文件已保存",
    "fileSaveError": "无法保存文件",
    "filePending": "请先完成上一个文件的保存",
    "noLinkApp": "没有可打开此链接的应用",
    "cloudDecryptFail": "无法解密服务器文件：",
    "backToBookmarks": "返回书签",
    "privacyStorage": "书签、笔记和背景保存在应用的 Android 私有数据库中，不使用广告分析。",
    "privacySync": "云同步使用您选择的服务。设置密钥后使用 AES-GCM 和 PBKDF2；未设置密钥时以 JSON 发送数据。",
    "privacyPasswords": "文件夹密码以 PBKDF2 哈希保存，用于限制界面访问。本地数据库未整体加密。",
    "privacyIcons": "网站图标按设置从网站或 Google 加载，链接在外部浏览器中打开。"
  },
  "ja": {
    "openMenu": "メニューを開く",
    "appMenu": "アプリメニュー",
    "closeMenu": "メニューを閉じる",
    "localSearchLabel": "ブックマークとメモを検索",
    "switchTheme": "テーマを切り替え",
    "appearanceMenu": "背景と外観",
    "back": "‹ 戻る",
    "noteAddShort": "+ メモ",
    "saveAndCloseNote": "メモを保存して閉じる",
    "moveEarlier": "↑ 上に移動",
    "moveLater": "↓ 下に移動",
    "androidScheduleInfo": "定期同期はアプリを開いている間に実行されます。ブラウザーのブックマークは HTML/JSON で移行してください。",
    "browserExtension": "ブラウザー拡張機能",
    "fileSaved": "ファイルを保存しました",
    "fileSaveError": "ファイルを保存できませんでした",
    "filePending": "前のファイルの保存を完了してください",
    "noLinkApp": "このリンクを開けるアプリがありません",
    "cloudDecryptFail": "サーバーファイルを復号できませんでした：",
    "backToBookmarks": "ブックマークに戻る",
    "privacyStorage": "ブックマーク、メモ、背景はアプリ専用の Android データベースに保存されます。広告分析はありません。",
    "privacySync": "クラウド同期は選択したサービスを使用します。鍵がある場合は AES-GCM と PBKDF2 を使用し、鍵がない場合は JSON で送信します。",
    "privacyPasswords": "フォルダーパスワードは PBKDF2 ハッシュで保存され、画面からのアクセスを制限します。ローカルデータベース全体は暗号化されていません。",
    "privacyIcons": "アイコンは設定に従いサイトまたは Google から取得します。リンクは外部ブラウザーで開きます。"
  },
  "ko": {
    "openMenu": "메뉴 열기",
    "appMenu": "앱 메뉴",
    "closeMenu": "메뉴 닫기",
    "localSearchLabel": "북마크 및 메모 검색",
    "switchTheme": "테마 변경",
    "appearanceMenu": "배경 및 모양",
    "back": "‹ 뒤로",
    "noteAddShort": "+ 메모",
    "saveAndCloseNote": "메모 저장 후 닫기",
    "moveEarlier": "↑ 위로 이동",
    "moveLater": "↓ 아래로 이동",
    "androidScheduleInfo": "예약 동기화는 앱이 열려 있는 동안 실행됩니다. 브라우저 북마크는 HTML/JSON으로 옮기세요.",
    "browserExtension": "브라우저 확장 프로그램",
    "fileSaved": "파일이 저장되었습니다",
    "fileSaveError": "파일을 저장할 수 없습니다",
    "filePending": "이전 파일 저장을 완료하세요",
    "noLinkApp": "이 링크를 열 수 있는 앱이 없습니다",
    "cloudDecryptFail": "서버 파일을 복호화할 수 없습니다: ",
    "backToBookmarks": "북마크로 돌아가기",
    "privacyStorage": "북마크, 메모, 배경은 앱의 Android 전용 데이터베이스에 저장되며 광고 분석은 사용하지 않습니다.",
    "privacySync": "클라우드 동기화는 선택한 서비스를 사용합니다. 키가 있으면 AES-GCM과 PBKDF2를 사용하고, 없으면 JSON으로 전송합니다.",
    "privacyPasswords": "폴더 비밀번호는 PBKDF2 해시로 저장되며 화면에서의 접근을 제한합니다. 로컬 데이터베이스 전체가 암호화되지는 않습니다.",
    "privacyIcons": "아이콘은 설정에 따라 사이트 또는 Google에서 가져오며 링크는 외부 브라우저에서 열립니다."
  },
  "tr": {
    "openMenu": "Menüyü aç",
    "appMenu": "Uygulama menüsü",
    "closeMenu": "Menüyü kapat",
    "localSearchLabel": "Yer imlerinde ve notlarda ara",
    "switchTheme": "Temayı değiştir",
    "appearanceMenu": "Arka plan ve görünüm",
    "back": "‹ Geri",
    "noteAddShort": "+ Not",
    "saveAndCloseNote": "Notu kaydet ve kapat",
    "moveEarlier": "↑ Yukarı taşı",
    "moveLater": "↓ Aşağı taşı",
    "androidScheduleInfo": "Zamanlanmış eşitleme uygulama açıkken çalışır. Tarayıcı yer imlerini HTML/JSON ile aktarın.",
    "browserExtension": "Tarayıcı uzantısı",
    "fileSaved": "Dosya kaydedildi",
    "fileSaveError": "Dosya kaydedilemedi",
    "filePending": "Önceki dosyayı kaydetmeyi tamamlayın",
    "noLinkApp": "Bu bağlantıyı açacak uygulama yok",
    "cloudDecryptFail": "Sunucu dosyasının şifresi çözülemedi: ",
    "backToBookmarks": "Yer imlerine dön",
    "privacyStorage": "Yer imleri, notlar ve arka planlar uygulamanın özel Android veritabanında saklanır. Reklam analizi yoktur.",
    "privacySync": "Bulut eşitlemesi seçilen hizmetleri kullanır. Anahtar varsa AES-GCM ve PBKDF2 kullanılır; yoksa veriler JSON olarak gönderilir.",
    "privacyPasswords": "Klasör parolaları PBKDF2 karmaları olarak saklanır ve arayüz erişimini sınırlar. Yerel veritabanının tamamı şifreli değildir.",
    "privacyIcons": "Simgeler ayarlara göre siteden veya Google’dan alınır. Bağlantılar harici tarayıcıda açılır."
  },
  "hi": {
    "openMenu": "मेन्यू खोलें",
    "appMenu": "ऐप मेन्यू",
    "closeMenu": "मेन्यू बंद करें",
    "localSearchLabel": "बुकमार्क और नोट खोजें",
    "switchTheme": "थीम बदलें",
    "appearanceMenu": "पृष्ठभूमि और रूप",
    "back": "‹ वापस",
    "noteAddShort": "+ नोट",
    "saveAndCloseNote": "नोट सहेजें और बंद करें",
    "moveEarlier": "↑ ऊपर ले जाएँ",
    "moveLater": "↓ नीचे ले जाएँ",
    "androidScheduleInfo": "निर्धारित सिंक ऐप खुला रहने पर चलता है। ब्राउज़र बुकमार्क HTML/JSON से स्थानांतरित करें।",
    "browserExtension": "ब्राउज़र एक्सटेंशन",
    "fileSaved": "फ़ाइल सहेजी गई",
    "fileSaveError": "फ़ाइल सहेजी नहीं जा सकी",
    "filePending": "पिछली फ़ाइल सहेजना पूरा करें",
    "noLinkApp": "इस लिंक को खोलने वाला ऐप उपलब्ध नहीं है",
    "cloudDecryptFail": "सर्वर फ़ाइल डिक्रिप्ट नहीं की जा सकी: ",
    "backToBookmarks": "बुकमार्क पर वापस जाएँ",
    "privacyStorage": "बुकमार्क, नोट और पृष्ठभूमियाँ ऐप के निजी Android डेटाबेस में रहती हैं। विज्ञापन विश्लेषण नहीं होता।",
    "privacySync": "क्लाउड सिंक चुनी गई सेवाओं का उपयोग करता है। कुंजी होने पर AES-GCM और PBKDF2 लागू होते हैं; बिना कुंजी डेटा JSON में भेजा जाता है।",
    "privacyPasswords": "फ़ोल्डर पासवर्ड PBKDF2 हैश के रूप में रहते हैं और इंटरफ़ेस से पहुँच सीमित करते हैं। स्थानीय डेटाबेस पूरी तरह एन्क्रिप्ट नहीं है।",
    "privacyIcons": "सेटिंग के अनुसार आइकन वेबसाइट या Google से आते हैं। लिंक बाहरी ब्राउज़र में खुलते हैं।"
  },
  "ar": {
    "openMenu": "فتح القائمة",
    "appMenu": "قائمة التطبيق",
    "closeMenu": "إغلاق القائمة",
    "localSearchLabel": "البحث في الإشارات المرجعية والملاحظات",
    "switchTheme": "تغيير المظهر",
    "appearanceMenu": "الخلفية والمظهر",
    "back": "رجوع ›",
    "noteAddShort": "+ ملاحظة",
    "saveAndCloseNote": "حفظ الملاحظة وإغلاقها",
    "moveEarlier": "↑ نقل لأعلى",
    "moveLater": "↓ نقل لأسفل",
    "androidScheduleInfo": "تعمل المزامنة المجدولة أثناء فتح التطبيق. انقل إشارات المتصفح عبر HTML/JSON.",
    "browserExtension": "إضافة المتصفح",
    "fileSaved": "تم حفظ الملف",
    "fileSaveError": "تعذر حفظ الملف",
    "filePending": "أكمل حفظ الملف السابق",
    "noLinkApp": "لا يوجد تطبيق لفتح هذا الرابط",
    "cloudDecryptFail": "تعذر فك تشفير ملف الخادم: ",
    "backToBookmarks": "العودة إلى الإشارات المرجعية",
    "privacyStorage": "تُخزّن الإشارات المرجعية والملاحظات والخلفيات في قاعدة Android الخاصة بالتطبيق. لا توجد تحليلات إعلانية.",
    "privacySync": "تستخدم المزامنة الخدمات التي تختارها. مع مفتاح التشفير تُستخدم AES-GCM وPBKDF2؛ وبدونه تُرسل البيانات بصيغة JSON.",
    "privacyPasswords": "تُحفظ كلمات مرور المجلدات كتجزئات PBKDF2 وتقيّد الوصول عبر الواجهة. قاعدة البيانات المحلية ليست مشفّرة بالكامل.",
    "privacyIcons": "تُحمّل الأيقونات من الموقع أو Google حسب الإعدادات. تُفتح الروابط في متصفح خارجي."
  }
};
for (const [lang, values] of Object.entries(translationsAndroid)) Object.assign(translations[lang], values);

const translationsProviderLabels = {
  "en": {
    "accessTokenLabel": "Access token:",
    "fileIdLabel": "File ID:",
    "oauthTokenLabel": "OAuth token:",
    "emailLabel": "Email:",
    "yandexProvider": "Yandex Disk",
    "mailruProvider": "Mail.ru Cloud"
  },
  "ru": {
    "accessTokenLabel": "Токен доступа:",
    "fileIdLabel": "ID файла:",
    "oauthTokenLabel": "Токен OAuth:",
    "emailLabel": "Электронная почта:",
    "yandexProvider": "Яндекс.Диск",
    "mailruProvider": "Облако Mail.ru"
  },
  "de": {
    "accessTokenLabel": "Zugriffstoken:",
    "fileIdLabel": "Datei-ID:",
    "oauthTokenLabel": "OAuth-Token:",
    "emailLabel": "E-Mail:",
    "yandexProvider": "Yandex Disk",
    "mailruProvider": "Mail.ru-Cloud"
  },
  "es": {
    "accessTokenLabel": "Token de acceso:",
    "fileIdLabel": "ID de archivo:",
    "oauthTokenLabel": "Token OAuth:",
    "emailLabel": "Correo electrónico:",
    "yandexProvider": "Yandex Disk",
    "mailruProvider": "Nube Mail.ru"
  },
  "fr": {
    "accessTokenLabel": "Jeton d’accès :",
    "fileIdLabel": "Identifiant du fichier :",
    "oauthTokenLabel": "Jeton OAuth :",
    "emailLabel": "Adresse e-mail :",
    "yandexProvider": "Yandex Disk",
    "mailruProvider": "Cloud Mail.ru"
  },
  "it": {
    "accessTokenLabel": "Token di accesso:",
    "fileIdLabel": "ID file:",
    "oauthTokenLabel": "Token OAuth:",
    "emailLabel": "Email:",
    "yandexProvider": "Yandex Disk",
    "mailruProvider": "Cloud Mail.ru"
  },
  "pt": {
    "accessTokenLabel": "Token de acesso:",
    "fileIdLabel": "ID do arquivo:",
    "oauthTokenLabel": "Token OAuth:",
    "emailLabel": "E-mail:",
    "yandexProvider": "Yandex Disk",
    "mailruProvider": "Nuvem Mail.ru"
  },
  "zh": {
    "accessTokenLabel": "访问令牌：",
    "fileIdLabel": "文件 ID：",
    "oauthTokenLabel": "OAuth 令牌：",
    "emailLabel": "电子邮件：",
    "yandexProvider": "Yandex Disk",
    "mailruProvider": "Mail.ru 云盘"
  },
  "ja": {
    "accessTokenLabel": "アクセストークン：",
    "fileIdLabel": "ファイル ID：",
    "oauthTokenLabel": "OAuth トークン：",
    "emailLabel": "メール：",
    "yandexProvider": "Yandex Disk",
    "mailruProvider": "Mail.ru クラウド"
  },
  "ko": {
    "accessTokenLabel": "액세스 토큰:",
    "fileIdLabel": "파일 ID:",
    "oauthTokenLabel": "OAuth 토큰:",
    "emailLabel": "이메일:",
    "yandexProvider": "Yandex Disk",
    "mailruProvider": "Mail.ru 클라우드"
  },
  "tr": {
    "accessTokenLabel": "Erişim belirteci:",
    "fileIdLabel": "Dosya kimliği:",
    "oauthTokenLabel": "OAuth belirteci:",
    "emailLabel": "E-posta:",
    "yandexProvider": "Yandex Disk",
    "mailruProvider": "Mail.ru Bulut"
  },
  "hi": {
    "accessTokenLabel": "एक्सेस टोकन:",
    "fileIdLabel": "फ़ाइल ID:",
    "oauthTokenLabel": "OAuth टोकन:",
    "emailLabel": "ईमेल:",
    "yandexProvider": "Yandex Disk",
    "mailruProvider": "Mail.ru क्लाउड"
  },
  "ar": {
    "accessTokenLabel": "رمز الوصول:",
    "fileIdLabel": "معرّف الملف:",
    "oauthTokenLabel": "رمز OAuth:",
    "emailLabel": "البريد الإلكتروني:",
    "yandexProvider": "Yandex Disk",
    "mailruProvider": "سحابة Mail.ru"
  }
};
for (const [lang, values] of Object.entries(translationsProviderLabels)) Object.assign(translations[lang], values);

for (const [lang, value] of Object.entries({"en": "Could not save the note", "ru": "Не удалось сохранить заметку", "de": "Notiz konnte nicht gespeichert werden", "es": "No se pudo guardar la nota", "fr": "Impossible d’enregistrer la note", "it": "Impossibile salvare la nota", "pt": "Não foi possível salvar a nota", "zh": "无法保存笔记", "ja": "メモを保存できませんでした", "ko": "메모를 저장할 수 없습니다", "tr": "Not kaydedilemedi", "hi": "नोट सहेजा नहीं जा सका", "ar": "تعذر حفظ الملاحظة"})) translations[lang].noteSaveError = value;
