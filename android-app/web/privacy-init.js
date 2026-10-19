chrome.storage.sync.get('forcedLanguage').then(s=>{const lang=resolveUILanguage(s.forcedLanguage);applyI18n(lang);document.title=translateKey(lang,'privacyPolicy');});
