import fs from 'node:fs';import {execFileSync} from 'node:child_process';
execFileSync('adb',['shell','am','start','-n','su.econa.speeddial/.MainActivity']);import {Client} from './client.mjs';
const delay=ms=>new Promise(r=>setTimeout(r,ms)),checks=[];
const check=(name,value)=>{checks.push({name,pass:!!value});if(!value)throw Error(name);console.log('PASS',name)};
let bg=await Client.open('android-background'),ui=await Client.open('newtab.html');
const backup=await bg.evaluate("chrome.storage.local.get('projectUpdateState')"),session=await bg.evaluate("chrome.storage.session.get('projectUpdatePrompt')");
try{
 await bg.evaluate(`window.__projectRealFetch=fetch;window.__projectRequests=0;window.fetch=async(url,options)=>{if(url!==SpeedDialProject.api)return __projectRealFetch(url,options);__projectRequests++;const tag='v6.11.0',P=SpeedDialProject;return new Response(JSON.stringify({tag_name:tag,html_url:P.repository+'/releases/tag/'+tag,draft:false,prerelease:false,assets:[P.androidAsset,P.extensionAsset].map(name=>({name,state:'uploaded',size:100,browser_download_url:P.repository+'/releases/download/'+tag+'/'+name}))}));};(async()=>{await chrome.storage.local.remove('projectUpdateState');await chrome.storage.session.remove('projectUpdatePrompt');return true})()`);
 await ui.call('Page.reload');await delay(1800);
 check('Android launch shows translated update offer',await ui.evaluate(`!!document.querySelector('.dialog-backdrop')&&document.querySelector('.dialog-backdrop h3').textContent===tui('projectUpdateAvailable',{version:'v6.11.0'})`));
 check('update has localized skip and update buttons',await ui.evaluate(`[...document.querySelectorAll('.dialog-backdrop button')].map(e=>e.textContent).join('|')===[tui('projectSkip'),tui('projectUpdate')].join('|')`));
 await ui.evaluate(`document.querySelector('.dialog-backdrop button').click();true`);await delay(120);
 check('skip release persisted on device',await bg.evaluate(`(async()=> (await chrome.storage.local.get('projectUpdateState')).projectUpdateState.skippedTag==='v6.11.0')()`));
 await ui.call('Page.reload');await delay(1400);
 check('skipped release does not prompt again on next opening',await ui.evaluate(`!document.querySelector('.dialog-backdrop')`));
 check('multiple Android openings use weekly cache',await bg.evaluate('__projectRequests===1'));
 await bg.evaluate(`(async()=>{await chrome.storage.session.remove('projectUpdatePrompt');let state=(await chrome.storage.local.get('projectUpdateState')).projectUpdateState;delete state.skippedTag;await chrome.storage.local.set({projectUpdateState:state});return true})()`);
 await ui.call('Page.reload');await delay(1500);
 const cached=await ui.evaluate(`chrome.runtime.sendMessage({action:'projectCheckUpdates',platform:'android'})`);
 check('cached update selects exact APK for Android',cached.update.download==='https://github.com/rukazax/Private_SpeedDial/releases/download/v6.11.0/Private-SpeedDial-Android.apk');
 await ui.evaluate(`document.querySelector('.dialog-backdrop').click();AndroidHost.openUrl(chrome.runtime.getURL('options.html'));true`);ui.close();ui=await Client.open('options.html');await delay(1100);
 check('project settings use Android expandable section',await ui.evaluate(`document.getElementById('projectSettings').tagName==='DETAILS'&&document.querySelector('#projectSettings>summary').textContent===tui('projectHeading')`));
 check('Android share button and GitHub downloads exist',await ui.evaluate(`!!document.getElementById('projectShare')&&[...document.querySelectorAll('#projectSettings a')].map(a=>a.href).join('|')==='https://github.com/rukazax/Private_SpeedDial|https://github.com/rukazax/Private_SpeedDial/releases/latest'`));
 check('no project links to old domain remain in settings',await ui.evaluate(`document.querySelectorAll('a[href*="econa.su"]').length===0`));
 const langs=await ui.evaluate('Object.keys(translations)');for(const lang of langs){await ui.evaluate(`_settingsPage.settings.forcedLanguage=${JSON.stringify(lang)};_settingsPage.applyLanguage();true`);check('new project strings translate '+lang,await ui.evaluate(`[...document.querySelectorAll('#projectSettings [data-i18n]')].every(e=>e.textContent===translations[${JSON.stringify(lang)}][e.dataset.i18n])`));}
 await ui.evaluate(`_settingsPage.applyLanguage();AndroidHost.home();true`);ui.close();ui=await Client.open('newtab.html');
 fs.writeFileSync('verification/v6-project-results.json',JSON.stringify({checks},null,2));
}finally{
 await bg.evaluate(`fetch=__projectRealFetch;(async()=>{await chrome.storage.local.remove('projectUpdateState');await chrome.storage.local.set(${JSON.stringify(backup)});await chrome.storage.session.remove('projectUpdatePrompt');await chrome.storage.session.set(${JSON.stringify(session)});return true})()`);
 ui.close();bg.close();
}
