const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm'), fs=require('node:fs');
const clone=x=>structuredClone(x);
const repo='https://github.com/rukazax/Private_SpeedDial';
function metadata(tag='v6.11.0') {
 return {tag_name:tag,html_url:repo+'/releases/tag/'+tag,draft:false,prerelease:false,assets:['Private-SpeedDial-Android.apk','Private-SpeedDial-Extension.zip'].map(name=>({name,state:'uploaded',size:123,browser_download_url:repo+'/releases/download/'+tag+'/'+name}))};
}
function setup(options={}) {
 const local=options.local||{},session=options.session||{};let calls=0,now=2e12;
 const area=data=>({async get(k){return {[k]:clone(data[k])}},async set(value){Object.assign(data,clone(value));}});
 const ctx={chrome:{storage:{local:area(local),session:area(session)}},navigator:{onLine:true},AbortController,setTimeout,clearTimeout,Date:class extends Date{static now(){return now;}},fetch:async(...args)=>{calls++;return options.fetch?options.fetch(...args):{ok:true,text:async()=>JSON.stringify(metadata())}}};
 vm.createContext(ctx);for(const path of ['shared/project.js','shared/project-updates.js'])vm.runInContext(fs.readFileSync(path,'utf8'),ctx);
 return {u:ctx.ProjectUpdates,ctx,local,session,get calls(){return calls},advance:n=>now+=n};
}
test('semantic version ordering and rejection of prerelease / malformed versions',()=>{
 const {u}=setup();for(const [a,b,want] of [['6.10.0','6.9.9',true],['v7.0.0','6.99.99',true],['6.10.0','6.10.0',false],['6.9.9','6.10.0',false],['v6.11.0-beta','6.10.0',false],['06.11.0','6.10.0',false],['6.11','6.10.0',false],['9007199254740992.0.0','6.10.0',false]])assert.equal(u.newer(a,b),want,a);
});
test('one request for simultaneous pages and weekly boundary',async()=>{
 const t=setup();const result=await Promise.all(Array.from({length:20},()=>t.u.check('android')));assert.equal(t.calls,1);assert.equal(result[0].update.tag,'v6.11.0');assert.match(result[0].update.download,/\.apk$/);
 t.advance(604800000-1);await t.u.check('extension');assert.equal(t.calls,1);t.advance(1);const b=await t.u.check('extension');assert.equal(t.calls,2);assert.match(b.update.download,/\.zip$/);
});
test('throttle persists after process restart, including failures and backwards clock',async()=>{
 const local={};const t=setup({local,fetch:async()=>{assert.equal(local.projectUpdateState.lastAttemptAt,2e12);throw Error('offline')}});
 assert.equal((await t.u.check('android')).error,true);assert.equal(t.calls,1);
 const restarted=setup({local});await restarted.u.check('android');assert.equal(restarted.calls,0);restarted.advance(-3600000);await restarted.u.check('android');assert.equal(restarted.calls,0);
});
test('404, rate limit, malformed JSON and metadata all respect interval',async()=>{
 for(const response of [{ok:false,status:404},{ok:false,status:429},{ok:true,text:async()=>'{bad'},{ok:true,text:async()=>JSON.stringify({...metadata(),prerelease:true})},{ok:true,text:async()=>'a'.repeat(1048577)}]){
  const t=setup({fetch:async()=>response});assert.equal((await t.u.check('android')).update,null);assert.equal((await t.u.check('android')).error,true);assert.equal(t.calls,1);
 }
});
test('offline skips HTTP without consuming the next online attempt',async()=>{
 const t=setup();t.ctx.navigator.onLine=false;await t.u.check('android');assert.equal(t.calls,0);assert.equal(t.local.projectUpdateState,undefined);t.ctx.navigator.onLine=true;await t.u.check('android');assert.equal(t.calls,1);
});
test('stable releases must have exact trusted repository, tag and platform assets',async()=>{
 for(const mutate of [d=>d.html_url='https://evil.test/',d=>d.draft=true,d=>d.tag_name='v8.0.0<script>',d=>d.assets[0].browser_download_url='https://evil.test/a.apk',d=>d.assets[0].state='new',d=>d.assets=[]]){
  let d=metadata();mutate(d);const t=setup({fetch:async()=>({ok:true,text:async()=>JSON.stringify(d)})});assert.equal((await t.u.check('android')).update,null);
 }
});
test('same or older installed version never prompts',async()=>{
 for(const tag of ['v6.10.0','v6.9.9']){const t=setup({fetch:async()=>({ok:true,text:async()=>JSON.stringify(metadata(tag))})});assert.equal((await t.u.check('android')).update,null);}
});
test('prompt is claimed once per session even with concurrent pages',async()=>{
 const t=setup();await t.u.check('android');const results=await Promise.all(Array.from({length:20},()=>t.u.claim('v6.11.0','android')));assert.equal(results.filter(r=>r.claimed).length,1);
 const restart=setup({local:t.local});assert.equal((await restart.u.claim('v6.11.0','android')).claimed,true);assert.equal((await restart.u.claim('v99.0.0','android')).claimed,false);
});
test('skip persists exact release but permits the following release',async()=>{
 const t=setup();await t.u.check('android');await t.u.skip('v6.11.0');assert.equal((await t.u.check('android')).update,null);const restart=setup({local:t.local});assert.equal((await restart.u.check('android')).update,null);restart.advance(604800000);restart.ctx.fetch=async()=>({ok:true,text:async()=>JSON.stringify(metadata('v6.12.0'))});assert.equal((await restart.u.check('android')).update.tag,'v6.12.0');
});
test('tampered persisted download metadata cannot open arbitrary URLs',async()=>{
 const t=setup();await t.u.check('android');t.local.projectUpdateState.release.assets['Private-SpeedDial-Android.apk']='https://evil.test/x';assert.equal((await t.u.check('android')).update,null);
});
test('cached valid release survives a failed subsequent weekly request',async()=>{
 const t=setup();await t.u.check('android');t.advance(604800000);t.ctx.fetch=async()=>{throw Error('network')};const result=await t.u.check('android');assert.equal(result.update.tag,'v6.11.0');assert.equal(result.error,true);
});
test('request has no credentials and uses only the public latest-release API',async()=>{
 const t=setup({fetch:async(url,init)=>{assert.equal(url,'https://api.github.com/repos/rukazax/Private_SpeedDial/releases/latest');assert.equal(init.credentials,'omit');assert.equal(init.redirect,'error');assert.equal(init.headers.Authorization,undefined);return {ok:true,text:async()=>JSON.stringify(metadata())}}});await t.u.check('android');
});
test('skipping cached release during a slow weekly request is preserved',async()=>{
 const t=setup();await t.u.check('android');t.advance(604800000);let done;const gate=new Promise(r=>done=r);t.ctx.fetch=async()=>{await gate;return {ok:true,text:async()=>JSON.stringify(metadata())}};
 const checking=t.u.check('android');await new Promise(r=>setTimeout(r,5));await t.u.skip('v6.11.0');done();assert.equal((await checking).update,null);assert.equal(t.local.projectUpdateState.skippedTag,'v6.11.0');
});
test('HTTP timeout aborts and remains throttled',async()=>{
 const t=setup({fetch:async(url,{signal})=>new Promise((resolve,reject)=>signal.addEventListener('abort',()=>reject(Error('timeout'))))});
 t.ctx.setTimeout=(fn,ms)=>setTimeout(fn,Math.min(ms,5));assert.equal((await t.u.check('android')).error,true);await t.u.check('android');assert.equal(t.calls,1);
});
test('failed durable state write prevents any update HTTP request',async()=>{
 const t=setup();t.ctx.chrome.storage.local.set=async()=>{throw Error('disk full')};await assert.rejects(t.u.check('android'),/disk full/);assert.equal(t.calls,0);
});
