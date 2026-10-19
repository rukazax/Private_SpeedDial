'use strict';
// Durable Android database shared by both WebViews. Import existing IndexedDB lazily.
(() => {
    const legacyGet=idbGet,legacyAll=idbGetAll;
    idbGet=async(store,key)=>{
        const saved=JSON.parse(AndroidHost.databaseGet(store,String(key)));
        if(saved.found)return saved.value;
        const value=await legacyGet(store,key);
        if(value!==undefined&&value!==null)AndroidHost.databaseImport(store,String(key),JSON.stringify(value));
        return value;
    };
    idbPut=async(store,key,value)=>{AndroidHost.databasePut(store,String(key),JSON.stringify(value));return true;};
    idbDelete=async(store,key)=>{AndroidHost.databasePut(store,String(key),'null');return true;};
    idbGetAll=async store=>{
        const saved=JSON.parse(AndroidHost.databaseAll(store)),old=await legacyAll(store);
        for(const [key,value] of Object.entries(old||{}))if(!(key in saved)){saved[key]=value;AndroidHost.databaseImport(store,key,JSON.stringify(value));}
        return Object.fromEntries(Object.entries(saved).filter(([,value])=>value!==null));
    };
    Object.assign(self,{idbGet,idbPut,idbDelete,idbGetAll});
})();
