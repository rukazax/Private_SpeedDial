const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
for(const base of ['extension','android-app/web'])test(base+': sync payload excludes local provider configuration and credentials',async()=>{
 const c={Date,loadDataFromIDB:async()=>({tiles:[],folders:[],notes:[],noteFolders:[]}),reconcilePasswords:()=>{},_normalizeEntityTimestamps:x=>x};c.self=c;vm.createContext(c);
 vm.runInContext(fs.readFileSync(base+'/defaults.js','utf8'),c);vm.runInContext(fs.readFileSync(base+'/background/sync.js','utf8'),c);
 const settings={syncService:'webdav',syncService2:'dropbox',webdavUrl:'https://private.example.test/',webdavUsername:'fixture-user',webdavPassword:'fixture-secret',dropboxAccessToken:'fixture-token',encryptionKey:'fixture-key',theme:'dark',backgrounds:[]};
 c.settings=settings;const result=await vm.runInContext('_buildSyncPayload(settings)',c);
 for(const key of ['syncService','syncService2','webdavUrl','webdavUsername','webdavPassword','dropboxAccessToken','encryptionKey'])assert.equal(result.settings[key],undefined,key);
 assert.equal(result.settings.theme,'dark');assert.equal(JSON.stringify(result).includes('fixture-secret'),false);assert.equal(JSON.stringify(result).includes('fixture-token'),false);
});
