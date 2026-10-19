(async()=>{
 const checks=[],check=(name,value)=>{checks.push({name,pass:!!value});if(!value)throw new Error(name);};
 const p=window._settingsPage;check('settings controller initialised',!!p&&typeof document.getElementById('addProfileBtn').onclick==='function');
 check('Android expandable settings sections',document.querySelectorAll('details.android-settings-section').length>=6&&!document.querySelector('.form-section'));
 check('removed settings and app-download link absent',!['masterPassword','autoLockTimeout','dndEnabled','headerItemsTable','headerOpacity','sidebarOpacity','sidebarWidth'].some(id=>document.getElementById(id))&&!document.querySelector('a[href*="apps.econa.su"]'));
 const backup=await chrome.storage.sync.get(null),dataBackup=await loadDataFromIDB(),profilesBackup=await chrome.storage.local.get(['profiles','activeProfile']);
 try {
 document.getElementById('theme').value='light';document.getElementById('accentColor').value='#123456';document.getElementById('forcedLanguage').value='en';
 check('settings apply succeeds',await p.applySettings());check('light theme and accent',document.body.dataset.theme==='light'&&getComputedStyle(document.documentElement).getPropertyValue('--accent').trim()==='#123456');
 p.settings.forcedLanguage='en';p.applyLanguage();check('language selection',document.documentElement.lang==='en');
 document.getElementById('theme').value='dark';document.getElementById('forcedLanguage').value='ru';await p.applySettings();p.applyLanguage();
 check('dark theme selection',document.body.dataset.theme==='dark');
 for(const provider of ['webdav','nextcloud','dropbox','box','onedrive','pcloud','yandex','mailru']){
  document.getElementById('syncService').value=provider;p.toggleSyncSettings();
  check('provider settings '+provider,Array.from(document.querySelectorAll('.sync-settings')).some(e=>getComputedStyle(e).display!=='none'));
 }
 document.getElementById('profileName').value='V3 profile';await p.addProfile({currentTarget:document.getElementById('addProfileBtn')});check('profile create',!!p.profiles['V3 profile']);
 await p.activateProfile('V3 profile',document.getElementById('addProfileBtn'));
 const profileData=await loadDataFromIDB();profileData.notes.push({id:'profile-only',title:'Profile fixture',content:'test',createdAt:Date.now(),updatedAt:Date.now()});await saveDataToIDB(profileData);
 await p.activateProfile('default',document.getElementById('addProfileBtn'));check('profile isolation',!(await loadDataFromIDB()).notes.some(n=>n.id==='profile-only'));
 await p.activateProfile('V3 profile',document.getElementById('addProfileBtn'));check('profile data restored',(await loadDataFromIDB()).notes.some(n=>n.id==='profile-only'));
 await p.activateProfile('default',document.getElementById('addProfileBtn'));
 const renamed=p.renameProfile('V3 profile',document.getElementById('addProfileBtn'));await new Promise(r=>setTimeout(r,20));document.getElementById('dialogInput').value='V3 renamed';document.getElementById('dialogOk').click();await renamed;check('profile rename',!!p.profiles['V3 renamed']&&!p.profiles['V3 profile']);
 const deleted=p.deleteProfile('V3 renamed',document.getElementById('addProfileBtn'));await new Promise(r=>setTimeout(r,20));document.getElementById('dialogOk').click();await deleted;check('profile delete',!p.profiles['V3 renamed']);
 const converted=p._convertFVDData({groups:[{id:1,title:'A',parent_id:2},{id:2,title:'B',parent_id:1}],dials:[{id:3,title:'FVD',url:'https://example.test/fvd',group_id:1}],notes:[{id:4,title:'Note',content:'text'}]});
 check('FVD conversion and cyclic-folder repair',converted.success&&converted.tiles.length===1&&converted.folders.some(f=>!f.parentId));
 check('invalid FVD rejected',!p._convertFVDData({}).success);
 p.openBgEditor('background',-1);document.getElementById('bgEditName').value='V3 background';document.getElementById('bgEditType').value='color';document.getElementById('bgEditValue').value='#102030';
 const save=document.querySelector('#bgEditModal button.primary')||Array.from(document.querySelectorAll('.modal.active button')).find(b=>b.textContent.includes('Сохран'));
 await p.saveBgEdit(save);check('background colour create',p.backgrounds.some(b=>b.name==='V3 background'));
 const idx=p.backgrounds.findIndex(b=>b.name==='V3 background');await p.onBgAction('background','activate',idx,document.getElementById('addProfileBtn'));check('background selection',p.settings.activeBackgroundId===p.backgrounds[idx].id);
 } finally {
 await saveDataToIDB(dataBackup);await chrome.storage.local.set(profilesBackup);await chrome.storage.sync.set(backup);
 }
 return {checks};
})()
