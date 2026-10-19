import fs from 'node:fs';import {Client} from './client.mjs';
const wait=ms=>new Promise(r=>setTimeout(r,ms));let ui=await Client.open('newtab.html');
async function shot(name){const r=await ui.call('Page.captureScreenshot',{format:'png'});fs.writeFileSync('docs/images/'+name+'.png',Buffer.from(r.result.data,'base64'));}
try{
 await ui.evaluate(`document.querySelector('.dialog-backdrop')?.click();androidCloseDrawer();_speedDial.settings.forcedLanguage='ru';applyI18n('ru');window.__screenNotes=_speedDial.notes;window.__screenFolders=_speedDial.folders;_speedDial.notes=[{id:'screen-note1',title:'Идеи для проекта',content:'Закладки и заметки на всех устройствах',folderId:''},{id:'screen-note2',title:'План на неделю',content:'Проверить синхронизацию и сохранить резервную копию',folderId:''}];_speedDial.folders=[{id:'screen-work',name:'Работа'},{id:'screen-personal',name:'Личное'},{id:'screen-read',name:'Прочитать'},{id:'screen-links',name:'Полезное'}];_speedDial.renderAll();true`);
 await wait(250);await shot('android-home');await ui.evaluate(`document.getElementById('androidMenuButton').click();document.getElementById('androidNotes').open=true;true`);await wait(150);await shot('android-menu');
 await ui.evaluate(`androidCloseDrawer();_speedDial.notes=__screenNotes;_speedDial.folders=__screenFolders;_speedDial.renderAll();AndroidHost.openUrl(chrome.runtime.getURL('options.html'));true`);ui.close();ui=await Client.open('options.html');await wait(1000);
 await ui.evaluate(`_settingsPage.settings.forcedLanguage='ru';_settingsPage.applyLanguage();document.querySelectorAll('details').forEach(e=>e.open=false);document.getElementById('projectSettings').open=true;document.getElementById('projectSettings').scrollIntoView({block:'center'});true`);await wait(120);await shot('android-settings');
 await ui.evaluate('AndroidHost.home();true');
}finally{ui.close()}
