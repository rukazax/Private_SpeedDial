/* Local, isolated Chromium profile. Never uses the user's browser or credentials. */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..'),repo='https://github.com/rukazax/Private_SpeedDial';
test('unpacked extension: startup, settings, share, update dialog, skip and weekly cache',async()=>{
 const profile=fs.mkdtempSync(path.join(os.tmpdir(),'speeddial-browser-'));
 const context=await chromium.launchPersistentContext(profile,{headless:true,executablePath:process.env.CHROMIUM||'/snap/bin/chromium',args:['--no-sandbox','--disable-extensions-except='+root+'/extension','--load-extension='+root+'/extension']});
 try{
 const worker=context.serviceWorkers()[0]||await context.waitForEvent('serviceworker');const origin=worker.url().replace(/\/background\.js$/, '');
 await worker.evaluate(async()=>{await chrome.storage.sync.set({forcedLanguage:'ru',autoSync:false});await chrome.storage.local.set({projectUpdateState:{lastAttemptAt:Date.now()}})});
 const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(origin+'/newtab.html');await page.waitForFunction(()=>window._speedDial?.tiles?.length>=2);
 assert.equal(await page.evaluate(()=>_speedDial.tiles[0].url),repo);
 if(process.env.UPDATE_SCREENSHOTS)await page.screenshot({path:root+'/docs/images/browser.png'});
 await page.goto(origin+'/options.html');await page.waitForSelector('#projectShare');
 assert.equal(await page.locator('#projectSettings a').first().getAttribute('href'),repo);
 assert.equal(await page.locator('#projectShare').textContent(),'Поделиться приложением');
 assert.equal(await page.locator('a[href*="econa.su"]').count(),0);
 assert.equal(await page.locator('a[data-i18n="mobileApp"]').getAttribute('href'),repo+'/releases/latest');
 // Click the actual mobile-download link and intercept its navigation in this isolated test.
 await context.route(repo+'/releases/latest',route=>route.fulfill({status:200,contentType:'text/html',body:'<h1>GitHub release downloads test fixture</h1>'}));
 const downloadPagePromise=context.waitForEvent('page');await page.locator('a[data-i18n="mobileApp"]').click();const downloadPage=await downloadPagePromise;await downloadPage.waitForURL(repo+'/releases/latest');await downloadPage.waitForLoadState();assert.equal(await downloadPage.locator('h1').textContent(),'GitHub release downloads test fixture');await downloadPage.close();
 await page.evaluate(()=>{Object.defineProperty(navigator,'share',{value:undefined,configurable:true});navigator.clipboard.writeText=async s=>{window.__shared=s}});
 await page.locator('#projectShare').click();await page.waitForFunction(()=>window.__shared==='https://github.com/rukazax/Private_SpeedDial');
 assert.equal(await page.locator('#projectShare').textContent(),'Ссылка скопирована');
 await worker.evaluate(async()=>{
  const P=SpeedDialProject,tag='v6.11.0';globalThis.__updateRequests=0;globalThis.__realFetch=fetch;
  globalThis.fetch=async(url,init)=>{if(url!==P.api)return __realFetch(url,init);__updateRequests++;return new Response(JSON.stringify({tag_name:tag,html_url:P.repository+'/releases/tag/'+tag,draft:false,prerelease:false,assets:[P.androidAsset,P.extensionAsset].map(name=>({name,state:'uploaded',size:100,browser_download_url:P.repository+'/releases/download/'+tag+'/'+name}))}))};
  await chrome.storage.local.remove('projectUpdateState');await chrome.storage.session.remove('projectUpdatePrompt');
 });
 await page.goto(origin+'/newtab.html');await page.getByRole('button',{name:'Пропустить релиз',exact:true}).waitFor();
 assert.match(await page.locator('.dialog-backdrop h3').textContent(),/v6\.11\.0/);
 if(process.env.UPDATE_SCREENSHOTS)await page.screenshot({path:root+'/docs/images/update.png'});
 await page.getByRole('button',{name:'Пропустить релиз',exact:true}).click();
 await page.waitForFunction(async()=> (await chrome.storage.local.get('projectUpdateState')).projectUpdateState.skippedTag==='v6.11.0');
 await page.reload();await page.waitForTimeout(1300);assert.equal(await page.locator('.dialog-backdrop').count(),0);
 assert.equal(await worker.evaluate(()=>__updateRequests),1);
 // Next stable release prompts after the interval; its Update button opens the exact ZIP.
 await worker.evaluate(async()=>{let s=(await chrome.storage.local.get('projectUpdateState')).projectUpdateState;s.lastAttemptAt-=SpeedDialProject.week;s.release.tag='v6.12.0';await chrome.storage.local.set({projectUpdateState:s});globalThis.fetch=async()=>{__updateRequests++;const tag='v6.12.0',P=SpeedDialProject;return new Response(JSON.stringify({tag_name:tag,html_url:P.repository+'/releases/tag/'+tag,assets:[P.extensionAsset].map(name=>({name,state:'uploaded',size:100,browser_download_url:P.repository+'/releases/download/'+tag+'/'+name}))}))}});
 await page.reload();await page.getByRole('button',{name:'Обновиться',exact:true}).waitFor();
 await page.evaluate(()=>{chrome.tabs.create=async o=>{window.__openedUpdate=o.url}});
 await page.getByRole('button',{name:'Обновиться',exact:true}).click();await page.waitForFunction(()=>!!window.__openedUpdate);
 assert.equal(await page.evaluate(()=>__openedUpdate),repo+'/releases/download/v6.12.0/Private-SpeedDial-Extension.zip');
 assert.equal(await worker.evaluate(()=>__updateRequests),2);
 assert.deepEqual(errors,[]);
 }finally{await context.close();fs.rmSync(profile,{recursive:true,force:true})}
});
