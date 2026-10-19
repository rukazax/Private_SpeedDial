(async()=>{
 const checks=[],check=(name,value)=>{checks.push({name,pass:!!value});if(!value)throw new Error(name);};
 const syncBackup=await api.storage.sync.get(null),localBackup=await api.storage.local.get(null),dataBackup=await loadDataFromIDB();
 const realFetch=window.fetch,base='http://10.0.2.2:18766';
 const s={syncService:'webdav',syncService2:'',webdavUrl:base+'/sync/main',webdavUsername:'android-fixture',webdavPassword:'fixture',encryptionKey:'',autoSync:false};
 const data={tiles:[{id:'v3-sync',title:'Синхронизация',url:'https://example.test/sync',createdAt:Date.now(),updatedAt:Date.now(),order:0}],folders:[],notes:[],noteFolders:[],tombstones:{}};
 try{
 await realFetch(base+'/control/reset');await api.storage.sync.set(s);await saveDataToIDB(data);await setSyncState({initialSyncDone:true});
 let r=await syncData('upload',{manual:true});check('WebDAV upload',r.success);
 await saveDataToIDB({...data,tiles:[]});r=await syncData('download',{manual:true});check('WebDAV download restores bookmarks',r.success&&(await loadDataFromIDB()).tiles.some(t=>t.id==='v3-sync'));
 r=await syncData('merge',{manual:true});check('WebDAV merge',r.success);
 check('server summary',(await getServerSummary()).data.tiles.some(t=>t.id==='v3-sync'));
 check('WebDAV PROPFIND ping',await WebDAVProvider.ping(s.webdavUrl,s.webdavUsername,s.webdavPassword));
 await api.storage.sync.set({encryptionKey:'fixture-key'});r=await syncData('upload',{manual:true});check('encrypted upload',r.success);
 const encrypted=await WebDAVProvider.get(s.webdavUrl,s.webdavUsername,s.webdavPassword);check('server payload is AES envelope',_looksLikeEncryptedEnvelope(encrypted));
 check('correct key connection',(await testConnection('webdav',{...s,encryptionKey:'fixture-key'})).success);
 const before=(await(await realFetch(base+'/control/stats')).json()).requests.filter(x=>x.method==='PUT').length;
 check('wrong key connection rejected',!(await testConnection('webdav',{...s,encryptionKey:'wrong-key'})).success);
 check('missing key connection rejected',!(await testConnection('webdav',s)).success);
 const after=(await(await realFetch(base+'/control/stats')).json()).requests.filter(x=>x.method==='PUT').length;check('wrong/missing key do not overwrite server',before===after);
 await api.storage.sync.set({encryptionKey:'wrong-key'});r=await syncData('download',{manual:true});check('wrong key sync rejected without data loss',!r.success&&(await loadDataFromIDB()).tiles.some(t=>t.id==='v3-sync'));
 await api.storage.sync.set({encryptionKey:'fixture-key'});r=await syncData('download',{manual:true});check('encrypted download',r.success);
 for(const code of [401,429]){const result=await testConnection('webdav',{...s,webdavUrl:base+'/status/'+code});check('HTTP '+code+' reported',!result.success);}
 check('invalid JSON rejected',!(await testConnection('webdav',{...s,webdavUrl:base+'/invalid-json'})).success);
 await api.storage.sync.set({...s,encryptionKey:'',syncService2:'nextcloud',nextcloudUrl:base+'/sync/second',nextcloudUsername:s.webdavUsername,nextcloudPassword:s.webdavPassword});r=await syncData('upload',{manual:true});check('two-server upload',r.success);
 const stats=await(await realFetch(base+'/control/stats')).json();check('second server received file',!!stats.files['/sync/second/private-speeddial.json']);
 await api.storage.sync.set({nextcloudUrl:base+'/status/401'});r=await syncData('merge',{manual:true});check('one failed server preserves working sync',r.success);
 const redir=await realFetch(base+'/redirect-auth',{headers:{Authorization:'Bearer fixture-secret'}});check('redirect strips cross-port credentials',(await redir.json()).authorization===null);
 const abort=new AbortController();setTimeout(()=>abort.abort(),30);let stopped=false;try{await realFetch(base+'/slow',{signal:abort.signal});}catch(e){stopped=e.name==='AbortError';}check('native request cancellation',stopped);
 let current='';window.fetch=(url,opts)=>{const u=new URL(typeof url==='string'?url:url.url);return realFetch(base+'/provider/'+current+'/'+u.hostname+u.pathname+u.search,opts);};
 const ps={...s,webdavUrl:'https://fixture.local',nextcloudUrl:'https://fixture.local',nextcloudUsername:'android-fixture',nextcloudPassword:'fixture',dropboxAccessToken:'fixture',boxAccessToken:'fixture',boxFileId:'fixture',onedriveAccessToken:'fixture',pcloudAccessToken:'fixture',pcloudFolder:'/fixture',yandexToken:'fixture',yandexFolder:'fixture',mailruEmail:'fixture@test.local',mailruPassword:'fixture',mailruFolder:'fixture'};
 for(current of ['webdav','nextcloud','dropbox','box','onedrive','pcloud','yandex','mailru']){
  check(current+' adapter missing-file result',(await download(ps,current))===null);
  await upload(data,ps,current);const got=await download(ps,current);check(current+' native HTTP round-trip',JSON.stringify(got)===JSON.stringify(data));
 }
 window.fetch=realFetch;
 const large='Ж'.repeat(1400000);await idbPut('backgrounds','v3-large',{text:large});check('SQLite large Unicode record',(await idbGet('backgrounds','v3-large')).text===large);await idbDelete('backgrounds','v3-large');check('SQLite delete tombstone',(await idbGet('backgrounds','v3-large'))===null);
 return {checks};
 }finally{window.fetch=realFetch;await saveDataToIDB(dataBackup);await api.storage.sync.clear();await api.storage.sync.set(syncBackup);await api.storage.local.clear();await api.storage.local.set(localBackup);}
})()
