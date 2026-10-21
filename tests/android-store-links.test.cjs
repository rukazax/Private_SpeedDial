/* Runs bundled APK pages on the PC. Native/storage/model calls use isolated fixtures;
   this does not claim Android-device or native Intent verification. No ADB is used. */
const {test}=require('node:test'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
const fs=require('node:fs'),path=require('node:path'),{execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'..'),store='https://chromewebstore.google.com/detail/private-speeddial/eakakaeklcgnlanmpbndhjdljppehdof';
const needed=['newtab.html','options.html','defaults.js','translations.js','project-i18n.js','common.js','project.js','project-ui.js','android-bridge.js','android-layout.js','android-mobile.css','newtab.css','options.css','project.css'];
const files=JSON.parse(execFileSync('python3',['-c',`import zipfile,json,sys\nwith zipfile.ZipFile(sys.argv[1]) as z: print(json.dumps({n:z.read('assets/www/'+n).decode() for n in json.loads(sys.argv[2])}))`,path.join(root,'dist/Private-SpeedDial-Android.apk'),JSON.stringify(needed)],{encoding:'utf8',maxBuffer:16*1024*1024}));
const host=`window.__openedUrls=[];window.AndroidHost={openUrl:url=>__openedUrls.push(url),storage:()=> '{}',store:()=>{},currentUrl:()=>location.origin+'/newtab.html',primaryScreenWidth:()=>360,setUiTranslations:()=>{},message:(id,json)=>queueMicrotask(()=>__nativeReply(id,{success:true,update:null})),notifyUI:()=>{},home:()=>{},reloadUI:()=>{}};`;
const models=`if(location.pathname.endsWith('/newtab.html')){window.SpeedDial=class{switchFolder(){}applyDesignSettings(){}};window._speedDial=new SpeedDial()}else{window.SettingsPage=class{}};`;
const scripts=['fixture-host.js','android-bridge.js','defaults.js','translations.js','project-i18n.js','common.js','project.js','fixture-models.js','android-layout.js','project-ui.js','fixture-ready.js'];
test('APK menu and all settings installation links open the exact Chrome Web Store listing',async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM||'/snap/bin/chromium',args:['--no-sandbox']});
 try{
  const context=await browser.newContext({viewport:{width:412,height:850}});
  await context.route('**/*',async route=>{
   const url=new URL(route.request().url());
   if(url.hostname!=='appassets.androidplatform.net')return route.abort();
   const name=url.pathname.slice(1);let body=files[name],contentType=name.endsWith('.css')?'text/css':name.endsWith('.js')?'text/javascript':'text/html';
   if(name==='fixture-host.js')body=host;
   if(name==='fixture-models.js')body=models;
   if(name==='fixture-ready.js')body="applyI18n('ru');";
   if(name.endsWith('.html')&&body){body=body.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'').replace('</body>',scripts.map(s=>'<script src="'+s+'"></script>').join('')+'</body>')}
   return body===undefined?route.fulfill({status:404,body:''}):route.fulfill({status:200,contentType,body});
  });
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('https://appassets.androidplatform.net/newtab.html');
  assert.equal(await page.evaluate(()=>chrome.runtime.getManifest().version),'6.10.3');
  await page.locator('#androidMenuButton').click();
  assert.equal(await page.locator('#androidBrowserExtension').textContent(),'Установить расширение для браузера');
  await page.locator('#androidBrowserExtension').click();assert.equal(await page.evaluate(()=>__openedUrls.at(-1)),store);
  const languages=await page.evaluate(()=>Object.keys(translations));
  for(const language of languages){await page.evaluate(l=>applyI18n(l),language);assert.equal(await page.locator('#androidBrowserExtension').textContent(),await page.evaluate(()=>tui('projectInstallExtension')))}
  await page.goto('https://appassets.androidplatform.net/options.html');await page.waitForSelector('#projectInstallExtension',{state:'attached'});
  const install=page.locator('#projectInstallExtension');
  const selectors=['.support-header .browser-extension-link','footer .browser-extension-link','#projectInstallExtension'];
  for(const selector of selectors){
   if(selector==='#projectInstallExtension')await page.locator('#projectSettings>summary').click();
   assert.equal(await page.locator(selector).getAttribute('href'),store);await page.locator(selector).click();assert.equal(await page.evaluate(()=>__openedUrls.at(-1)),store);
  }
  assert.deepEqual(errors,[]);
  const result={apkVersion:'6.10.3',menuAndSettingsLinksPassed:4,languages:languages.length,target:store,nativeHost:'mocked; PC Chromium; no device or ADB'};
  fs.writeFileSync(path.join(root,'dist/android-store-link-check.json'),JSON.stringify(result,null,2)+'\n');
 }finally{await browser.close()}
});
