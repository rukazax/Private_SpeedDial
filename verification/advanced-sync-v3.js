(async()=>{
 const syncBackup=await api.storage.sync.get(null),localBackup=await api.storage.local.get(null),dataBackup=await loadDataFromIDB(),checks=[],check=(n,v)=>{checks.push({name:n,pass:!!v});if(!v)throw Error(n);};
 const base='http://10.0.2.2:18766',s={syncService:'webdav',syncService2:'',webdavUrl:base+'/sync/advanced',webdavUsername:'android-fixture',webdavPassword:'fixture',autoSync:false,encryptionKey:''};
 try{
 await api.storage.sync.set(s);
 const original={tiles:[],folders:[],notes:[],noteFolders:[],tombstones:{}};const entity=(id)=>({id,title:id,url:'https://example.test/'+id,updatedAt:Date.now(),createdAt:Date.now()});
 for(const strategy of ['local','server','merge']){
  await saveDataToIDB({...original,tiles:[entity('local-'+strategy)]});const local=await _buildSyncPayload(await getCachedSettings());const server={...local,tiles:[entity('server-'+strategy)]};await WebDAVProvider.put(server,s.webdavUrl,s.webdavUsername,s.webdavPassword);await setSyncState({initialSyncDone:false});
  const pending=await syncData('merge',{manual:true});check('initial conflict '+strategy,pending.needsResolve);
  const r=await resolveSyncConflict(strategy),d=await loadDataFromIDB();check('conflict strategy '+strategy,r.success&&d.tiles.length===(strategy==='merge'?2:1)&&d.tiles.some(t=>t.id===(strategy==='server'?'server-':'local-')+strategy));
 }
 const now=Date.now();const merged=_mergePayloads({...original,tiles:[{...entity('deleted'),updatedAt:now-1000}]},{...original,tombstones:{deleted:now}});check('tombstones prevent resurrection',!merged.tiles.some(t=>t.id==='deleted'));
 check('payload measures UTF-8 bytes',_estimatePayloadSize({text:'Ж'})===new TextEncoder().encode(JSON.stringify({text:'Ж'})).length);
 let limit=false;try{await OneDriveProvider.put({text:'Ж'.repeat(2200000)},{onedriveAccessToken:'fixture'});}catch(e){limit=true;}check('OneDrive Unicode upload limit',limit);
 await api.storage.sync.set({bgRotateEnabled:true,bgRotateMode:'sequential',backgrounds:[{id:'first',type:'color',value:'#000000'},{id:'second',type:'gradient',value:'linear-gradient(red,blue)'}],activeBackgroundId:'first'});await rotateBackground();check('background sequential rotation',(await api.storage.sync.get('activeBackgroundId')).activeBackgroundId==='second');
 await api.storage.sync.set({autoSync:true,syncInterval:5});await setupAlarms();check('foreground sync/rotation alarms configured',(await api.alarms.getAll()).some(a=>a.name==='syncAlarm'));
 await api.storage.local.set({lastSyncTime:0});await setSyncState({initialSyncDone:true});await Promise.all(api.alarms.onAlarm.emit({name:'syncAlarm'}));check('sync alarm handler completes',(await getLastSyncTime())>0);
 await api.storage.local.set({lastSyncTime:0});self._syncAppliedAt=0;await saveDataToIDB({...original,tiles:[entity('automatic-change')]});scheduleSyncOnChange();await new Promise(r=>setTimeout(r,32500));
 const remote=await WebDAVProvider.get(s.webdavUrl,s.webdavUsername,s.webdavPassword);check('actual 30-second change autosync',remote.tiles.some(t=>t.id==='automatic-change'));
 return {checks};
 }finally{await saveDataToIDB(dataBackup);await api.storage.sync.clear();await api.storage.sync.set(syncBackup);await api.storage.local.clear();await api.storage.local.set(localBackup);await setupAlarms();}
})()
