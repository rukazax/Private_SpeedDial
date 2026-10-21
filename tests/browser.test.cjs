/* Isolated Chromium profile; never uses the owner's browser or credentials. */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..'),repo='https://github.com/rukazax/Private_SpeedDial',store='https://chromewebstore.google.com/detail/private-speeddial/eakakaeklcgnlanmpbndhjdljppehdof';
test('browser: one-time mobile invitation, concurrent tabs, persistence, no GitHub update requests',async()=>{
 const profile=fs.mkdtempSync(path.join(os.tmpdir(),'speeddial-browser-'));
 const launch=()=>chromium.launchPersistentContext(profile,{headless:true,executablePath:process.env.CHROMIUM||'/snap/bin/chromium',args:['--no-sandbox','--disable-extensions-except='+root+'/extension','--load-extension='+root+'/extension']});
 let context=await launch();const errors=[];let apiRequests=0;
 const observe=ctx=>{ctx.on('request',r=>{if(r.url().startsWith('https://api.github.com/repos/rukazax/Private_SpeedDial/releases'))apiRequests++});ctx.on('page',p=>p.on('pageerror',e=>errors.push(e.message)))};
 observe(context);
 try{
 let worker=context.serviceWorkers()[0]||await context.waitForEvent('serviceworker');const origin=worker.url().replace(/\/background\.js$/, '');
 await worker.evaluate(async()=>{
  await chrome.storage.sync.set({forcedLanguage:'ru',autoSync:false});
  // A former installation's update state must not trigger network or an update dialog.
  await chrome.storage.local.set({projectUpdateState:{lastAttemptAt:0,release:{tag:'v99.0.0'}}});
  globalThis.__apiFetches=0;const realFetch=fetch;globalThis.fetch=(url,...rest)=>{if(String(url).includes('api.github.com')){__apiFetches++;throw Error('Unexpected GitHub check')}return realFetch(url,...rest)};
 });
 assert.equal(await worker.evaluate(()=>typeof ProjectUpdates),'undefined');
 const page=await context.newPage();await page.goto(origin+'/newtab.html');await page.waitForFunction(()=>window._speedDial?.tiles?.length>=2);
 assert.equal(await page.evaluate(()=>_speedDial.tiles[0].url),repo);
 const download=page.getByRole('button',{name:'Скачать мобильное приложение',exact:true});await download.waitFor();
 assert.match(await page.locator('.dialog-backdrop h3').textContent(),/доступен и для Android/);
 if(process.env.UPDATE_SCREENSHOTS)await page.screenshot({path:root+'/docs/images/browser-welcome.png'});
 // Capture chrome.tabs.create at the UI boundary; Chromium does not route
 // the first request of a tab created by an extension service API reliably.
 await page.evaluate(()=>{chrome.tabs.create=async options=>{window.__downloadUrl=options.url}});
 await download.click();await page.waitForFunction(()=>!!window.__downloadUrl);
 assert.equal(await page.evaluate(()=>__downloadUrl),repo+'/releases/latest');
 await page.reload();await page.waitForTimeout(1900);assert.equal(await page.locator('.dialog-backdrop').count(),0);
 await page.goto(origin+'/options.html');await page.waitForSelector('#projectShare');
 assert.equal(await page.locator('#projectSettings a').first().getAttribute('href'),repo);
 assert.match(await page.locator('#projectSettings .project-description').textContent(),/обновляется вручную/);
 assert.equal(await page.locator('a[href*="econa.su"]').count(),0);
 assert.equal(await page.locator('#projectInstallExtension').getAttribute('href'),store);
 await page.evaluate(()=>document.getElementById('projectInstallExtension').addEventListener('click',e=>{e.preventDefault();window.__storeClick={url:e.currentTarget.href,target:e.currentTarget.target}},{once:true}));
 await page.locator('#projectInstallExtension').click();assert.deepEqual(await page.evaluate(()=>__storeClick),{url:store,target:'_blank'});
 assert.equal(await page.locator('a[data-i18n="mobileApp"]').getAttribute('href'),repo+'/releases/latest');
 await page.evaluate(()=>{Object.defineProperty(navigator,'share',{value:undefined,configurable:true});navigator.clipboard.writeText=async s=>{window.__shared=s}});
 await page.locator('#projectShare').click();await page.waitForFunction(()=>window.__shared==='https://github.com/rukazax/Private_SpeedDial');
 // Concurrent claims from real extension pages: exactly one winner, durable across worker/browser restarts.
 await worker.evaluate(()=>chrome.storage.local.remove('projectMobileWelcomeShown'));
 const second=await context.newPage();await second.goto(origin+'/popup.html');
 const claims=await Promise.all([page,second].map(p=>p.evaluate(()=>chrome.runtime.sendMessage({action:'projectClaimMobileWelcome'}))));
 assert.equal(claims.filter(c=>c.claimed).length,1);await second.close();
 await worker.evaluate(()=>chrome.storage.local.remove('projectMobileWelcomeShown'));
 await page.reload();await page.getByRole('button',{name:'Закрыть',exact:true}).waitFor();await page.getByRole('button',{name:'Закрыть',exact:true}).click();
 await page.reload();await page.waitForTimeout(1900);assert.equal(await page.locator('.dialog-backdrop').count(),0);
 // Escape is also a completed one-time invitation, not a postponed update prompt.
 await worker.evaluate(()=>chrome.storage.local.remove('projectMobileWelcomeShown'));
 await page.reload();await page.getByRole('button',{name:'Закрыть',exact:true}).waitFor();await page.keyboard.press('Escape');
 await page.reload();await page.waitForTimeout(1900);assert.equal(await page.locator('.dialog-backdrop').count(),0);
 assert.equal(await worker.evaluate(()=>__apiFetches),0);
 await context.close();context=await launch();observe(context);
 worker=context.serviceWorkers()[0]||await context.waitForEvent('serviceworker');
 const reopened=await context.newPage();await reopened.goto(origin+'/newtab.html');await reopened.waitForTimeout(2000);
 assert.equal(await reopened.locator('.dialog-backdrop').count(),0);
 assert.equal(await worker.evaluate(async()=>(await chrome.storage.local.get('projectMobileWelcomeShown')).projectMobileWelcomeShown),true);
 assert.equal(apiRequests,0);assert.deepEqual(errors,[]);
 }finally{await context.close();fs.rmSync(profile,{recursive:true,force:true})}
});
