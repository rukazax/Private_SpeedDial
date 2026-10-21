'use strict';
/* Shared, complete translations for project distribution and updates. */
(() => {
    const catalog = {
  "en": {
    "projectHeading": "About and updates",
    "projectRepository": "Project on GitHub",
    "projectDownloads": "Download applications",
    "projectShare": "Share application",
    "projectCopied": "Link copied",
    "projectWeekly": "Updates are checked automatically on launch, at most once every 7 days.",
    "projectUpdateAvailable": "Private SpeedDial {version} is available. Download the update?",
    "projectSkip": "Skip release",
    "projectUpdate": "Update",
    "projectInstallExtension": "Install browser extension"
  },
  "ru": {
    "projectHeading": "О приложении и обновления",
    "projectRepository": "Проект на GitHub",
    "projectDownloads": "Скачать приложения",
    "projectShare": "Поделиться приложением",
    "projectCopied": "Ссылка скопирована",
    "projectWeekly": "Обновления проверяются автоматически при открытии, не чаще раза в 7 дней.",
    "projectUpdateAvailable": "Доступна версия Private SpeedDial {version}. Скачать обновление?",
    "projectSkip": "Пропустить релиз",
    "projectUpdate": "Обновиться",
    "projectInstallExtension": "Установить расширение для браузера"
  },
  "de": {
    "projectHeading": "Über die App und Updates",
    "projectRepository": "Projekt auf GitHub",
    "projectDownloads": "Apps herunterladen",
    "projectShare": "App teilen",
    "projectCopied": "Link kopiert",
    "projectWeekly": "Updates werden beim Öffnen automatisch geprüft, höchstens einmal alle 7 Tage.",
    "projectUpdateAvailable": "Private SpeedDial {version} ist verfügbar. Update herunterladen?",
    "projectSkip": "Version überspringen",
    "projectUpdate": "Aktualisieren",
    "projectInstallExtension": "Browser-Erweiterung installieren"
  },
  "es": {
    "projectHeading": "Acerca de la aplicación y actualizaciones",
    "projectRepository": "Proyecto en GitHub",
    "projectDownloads": "Descargar aplicaciones",
    "projectShare": "Compartir aplicación",
    "projectCopied": "Enlace copiado",
    "projectWeekly": "Las actualizaciones se comprueban al abrir, como máximo una vez cada 7 días.",
    "projectUpdateAvailable": "Private SpeedDial {version} está disponible. ¿Descargar la actualización?",
    "projectSkip": "Omitir versión",
    "projectUpdate": "Actualizar",
    "projectInstallExtension": "Instalar extensión del navegador"
  },
  "fr": {
    "projectHeading": "À propos et mises à jour",
    "projectRepository": "Projet sur GitHub",
    "projectDownloads": "Télécharger les applications",
    "projectShare": "Partager l’application",
    "projectCopied": "Lien copié",
    "projectWeekly": "Les mises à jour sont recherchées à l’ouverture, au maximum une fois tous les 7 jours.",
    "projectUpdateAvailable": "Private SpeedDial {version} est disponible. Télécharger la mise à jour ?",
    "projectSkip": "Ignorer cette version",
    "projectUpdate": "Mettre à jour",
    "projectInstallExtension": "Installer l’extension de navigateur"
  },
  "it": {
    "projectHeading": "Informazioni e aggiornamenti",
    "projectRepository": "Progetto su GitHub",
    "projectDownloads": "Scarica le applicazioni",
    "projectShare": "Condividi applicazione",
    "projectCopied": "Link copiato",
    "projectWeekly": "Gli aggiornamenti vengono cercati all’apertura, al massimo una volta ogni 7 giorni.",
    "projectUpdateAvailable": "È disponibile Private SpeedDial {version}. Scaricare l’aggiornamento?",
    "projectSkip": "Salta versione",
    "projectUpdate": "Aggiorna",
    "projectInstallExtension": "Installa l’estensione del browser"
  },
  "pt": {
    "projectHeading": "Sobre e atualizações",
    "projectRepository": "Projeto no GitHub",
    "projectDownloads": "Baixar aplicativos",
    "projectShare": "Compartilhar aplicativo",
    "projectCopied": "Link copiado",
    "projectWeekly": "As atualizações são verificadas ao abrir, no máximo uma vez a cada 7 dias.",
    "projectUpdateAvailable": "Private SpeedDial {version} está disponível. Baixar a atualização?",
    "projectSkip": "Ignorar versão",
    "projectUpdate": "Atualizar",
    "projectInstallExtension": "Instalar extensão do navegador"
  },
  "zh": {
    "projectHeading": "关于与更新",
    "projectRepository": "GitHub 项目",
    "projectDownloads": "下载应用",
    "projectShare": "分享应用",
    "projectCopied": "链接已复制",
    "projectWeekly": "打开应用时自动检查更新，每 7 天最多一次。",
    "projectUpdateAvailable": "Private SpeedDial {version} 已发布。是否下载更新？",
    "projectSkip": "跳过此版本",
    "projectUpdate": "更新",
    "projectInstallExtension": "安装浏览器扩展"
  },
  "ja": {
    "projectHeading": "アプリ情報と更新",
    "projectRepository": "GitHub プロジェクト",
    "projectDownloads": "アプリをダウンロード",
    "projectShare": "アプリを共有",
    "projectCopied": "リンクをコピーしました",
    "projectWeekly": "起動時に更新を自動確認します。確認は7日間に1回までです。",
    "projectUpdateAvailable": "Private SpeedDial {version} が利用可能です。更新をダウンロードしますか？",
    "projectSkip": "このバージョンをスキップ",
    "projectUpdate": "更新",
    "projectInstallExtension": "ブラウザー拡張機能をインストール"
  },
  "ko": {
    "projectHeading": "앱 정보 및 업데이트",
    "projectRepository": "GitHub 프로젝트",
    "projectDownloads": "앱 다운로드",
    "projectShare": "앱 공유",
    "projectCopied": "링크가 복사되었습니다",
    "projectWeekly": "앱을 열 때 업데이트를 자동으로 확인하며, 7일에 한 번까지만 확인합니다.",
    "projectUpdateAvailable": "Private SpeedDial {version} 버전이 있습니다. 업데이트를 다운로드할까요?",
    "projectSkip": "이 버전 건너뛰기",
    "projectUpdate": "업데이트",
    "projectInstallExtension": "브라우저 확장 프로그램 설치"
  },
  "tr": {
    "projectHeading": "Hakkında ve güncellemeler",
    "projectRepository": "GitHub projesi",
    "projectDownloads": "Uygulamaları indir",
    "projectShare": "Uygulamayı paylaş",
    "projectCopied": "Bağlantı kopyalandı",
    "projectWeekly": "Güncellemeler açılışta otomatik kontrol edilir; en fazla 7 günde bir.",
    "projectUpdateAvailable": "Private SpeedDial {version} kullanılabilir. Güncelleme indirilsin mi?",
    "projectSkip": "Sürümü atla",
    "projectUpdate": "Güncelle",
    "projectInstallExtension": "Tarayıcı uzantısını yükle"
  },
  "hi": {
    "projectHeading": "परिचय और अपडेट",
    "projectRepository": "GitHub पर प्रोजेक्ट",
    "projectDownloads": "ऐप डाउनलोड करें",
    "projectShare": "ऐप साझा करें",
    "projectCopied": "लिंक कॉपी किया गया",
    "projectWeekly": "ऐप खोलने पर अपडेट अपने आप जाँचे जाते हैं, अधिकतम हर 7 दिन में एक बार।",
    "projectUpdateAvailable": "Private SpeedDial {version} उपलब्ध है। अपडेट डाउनलोड करें?",
    "projectSkip": "यह रिलीज़ छोड़ें",
    "projectUpdate": "अपडेट करें",
    "projectInstallExtension": "ब्राउज़र एक्सटेंशन इंस्टॉल करें"
  },
  "ar": {
    "projectHeading": "حول التطبيق والتحديثات",
    "projectRepository": "المشروع على GitHub",
    "projectDownloads": "تنزيل التطبيقات",
    "projectShare": "مشاركة التطبيق",
    "projectCopied": "تم نسخ الرابط",
    "projectWeekly": "يتم البحث عن التحديثات تلقائيًا عند الفتح، مرة واحدة كل 7 أيام كحد أقصى.",
    "projectUpdateAvailable": "يتوفر Private SpeedDial {version}. هل تريد تنزيل التحديث؟",
    "projectSkip": "تخطي الإصدار",
    "projectUpdate": "تحديث",
    "projectInstallExtension": "تثبيت إضافة المتصفح"
  }
};
    for (const [language, values] of Object.entries(catalog)) Object.assign(translations[language], values);
})();
