(async()=>{
    const checks=[];
    const check=(name,value)=>{checks.push({name,pass:!!value});if(!value)throw new Error('FAIL '+name);};
    const fixture={webdavUrl:'http://10.0.2.2:18765',webdavUsername:'android-fixture',webdavPassword:'fixture',syncService:'webdav',encryptionKey:'fixture-cloud-key',autoSync:false};
    await chrome.storage.sync.set(fixture);
    memoryCache.settings=null;
    const saved=await loadDataFromIDB();
    check('data survives process restart',saved.tiles.length===3&&saved.notes.length===1&&saved.folders.length===2);
    const result=await syncData('merge',{manual:true});
    check('encrypted WebDAV upload',result.success);
    const raw=await WebDAVProvider.get(fixture.webdavUrl,fixture.webdavUsername,fixture.webdavPassword);
    check('cloud contains encrypted envelope',!!raw.salt&&!!raw.iv&&!!raw.data&&!raw.tiles);
    const decoded=await decryptData(raw,fixture.encryptionKey);
    check('cloud decrypted matches local data',decoded.tiles.length===3&&decoded.notes.length===1);
    const connection=await testConnection('webdav',{...DEFAULT_SETTINGS,...fixture});
    check('connection test encrypted roundtrip',connection.success&&connection.decryptionOk===true);
    // Exercise the same download/apply path after deleting one local fixture.
    await saveDataToIDB({...saved,tiles:saved.tiles.filter(t=>t.url!=='https://example.org/android-test')});
    const downloadResult=await syncData('download',{manual:true});
    check('restore encrypted cloud data',downloadResult.success&&(await loadDataFromIDB()).tiles.length===3);
    const now=Date.now();
    const localPayload={tiles:[{id:'deleted-fixture',updatedAt:now-1000}],folders:[],notes:[],noteFolders:[],tombstones:{'deleted-fixture':now},settings:{settingsUpdatedAt:2}};
    const remotePayload={...localPayload,tombstones:{},settings:{settingsUpdatedAt:1}};
    const merged=_mergePayloads(localPayload,remotePayload);
    check('tombstone prevents resurrection',!merged.tiles.some(t=>t.id==='deleted-fixture'));
    await chrome.storage.sync.set({webdavUrl:'',webdavUsername:'',webdavPassword:'',encryptionKey:'',autoSync:true});
    memoryCache.settings=null;
    return {checks,providerScope:'Local mock WebDAV, no real cloud credentials'};
})()
