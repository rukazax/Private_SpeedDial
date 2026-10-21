'use strict';
/* Chrome compatibility for trusted Android assets, not for external websites. */
(() => {
    const event = () => {
        const listeners = [];
        return { addListener: fn => listeners.push(fn), removeListener: fn => { const i=listeners.indexOf(fn); if(i>=0)listeners.splice(i,1); }, emit: (...args) => listeners.slice().map(fn=>fn(...args)), listeners };
    };
    const changed = event(), messages = event(), installed = event(), startup = event();
    const result = (value, cb) => { if(cb) queueMicrotask(()=>cb(value)); return Promise.resolve(value); };
    const area = name => ({
        get(keys, cb) {
            const all = JSON.parse(AndroidHost.storage(name)), out = {};
            if(keys == null) return result(all,cb);
            if(typeof keys === 'string') keys = [keys];
            if(Array.isArray(keys)) keys.forEach(k=> {if(k in all)out[k]=all[k];});
            else Object.keys(keys).forEach(k=>out[k]=k in all?all[k]:keys[k]);
            return result(out,cb);
        },
        set(values, cb) {
            const all=JSON.parse(AndroidHost.storage(name)), delta={};
            Object.keys(values).forEach(k=>{if(JSON.stringify(all[k])!==JSON.stringify(values[k])){delta[k]={oldValue:all[k],newValue:values[k]};all[k]=values[k];}});
            if(Object.keys(delta).length)AndroidHost.store(name,JSON.stringify(all),JSON.stringify(delta));
            return result(undefined,cb);
        },
        remove(keys,cb) {
            const all=JSON.parse(AndroidHost.storage(name)),delta={};
            (Array.isArray(keys)?keys:[keys]).forEach(k=>{if(k in all){delta[k]={oldValue:all[k]};delete all[k];}});
            if(Object.keys(delta).length)AndroidHost.store(name,JSON.stringify(all),JSON.stringify(delta));
            return result(undefined,cb);
        },
        clear(cb) { const all=JSON.parse(AndroidHost.storage(name)); return this.remove(Object.keys(all),cb); }
    });
    window.__storageChanged=(delta,name)=>changed.emit(delta,name);
    const calls=new Map(); let sequence=0;
    window.__nativeReply=(id,value)=>{const p=calls.get(id);if(p){clearTimeout(p.timer);calls.delete(id);p.resolve(value);}};
    window.__notify=message=>messages.emit(message,{},()=>{});
    window.__receiveMessage=(id,message)=>{
        let sent=false;
        const respond=value=>{if(!sent){sent=true;AndroidHost.reply(id,JSON.stringify(value===undefined?null:value));}};
        for(const fn of messages.listeners) {
            try { const r=fn(message,{tab:{id:1,windowId:1}},respond); if(r instanceof Promise)r.then(respond,e=>respond({success:false,error:e.message})); }
            catch(e){respond({success:false,error:e.message});}
        }
    };
    const tab=()=>({id:1,windowId:1,url:AndroidHost.currentUrl()});
    const tabs={
        create(o,cb){AndroidHost.openUrl(o.url);return result(tab(),cb);},
        update(id,o,cb){if(o?.url)AndroidHost.openUrl(o.url);return result(tab(),cb);},
        query(o,cb){return result([tab()],cb);}, get(id,cb){return result(tab(),cb);},
        reload(){AndroidHost.reloadUI();return Promise.resolve();},
        sendMessage(id,message,cb){AndroidHost.notifyUI(JSON.stringify(message));return result(undefined,cb);},
        onCreated:event(),onUpdated:event(),onActivated:event()
    };
    const alarms=new Map(),alarmEvent=event();
    window.chrome={
        storage:{local:area('local'),sync:area('sync'),session:area('session'),onChanged:changed},
        runtime:{
            getURL:path=>new URL(path,location.origin+'/').href,
            getManifest:()=>({name:'Private SpeedDial',version:'6.10.3',manifest_version:3}),
            onMessage:messages,onInstalled:installed,onStartup:startup,
            sendMessage(message,cb){
                const id=String(++sequence);
                const p=new Promise((resolve,reject)=>{calls.set(id,{resolve,timer:setTimeout(()=>{calls.delete(id);reject(new Error('Android background response timeout'));},180000)});AndroidHost.message(id,JSON.stringify(message));});
                if(cb)p.then(cb);return p;
            }
        },
        tabs,
        windows:{WINDOW_ID_NONE:-1,onFocusChanged:event(),create(o,cb){AndroidHost.openUrl(o.url);return result({id:1},cb);},remove(){AndroidHost.home();return Promise.resolve();}},
        permissions:{getAll(cb){return result({permissions:['storage'],origins:[]},cb);}},
        alarms:{
            onAlarm:alarmEvent,
            create(name,o){this.clear(name);const delay=Math.max(1,o.periodInMinutes?o.periodInMinutes*60000:o.when?o.when-Date.now():(o.delayInMinutes||1)*60000);const run=()=>{alarmEvent.emit({name,scheduledTime:Date.now()});if(!o.periodInMinutes)alarms.delete(name);};const timer=o.periodInMinutes?setInterval(run,delay):setTimeout(run,delay);alarms.set(name,{name,...o,timer});return Promise.resolve();},
            clear(name,cb){const a=alarms.get(name);if(a){clearInterval(a.timer);clearTimeout(a.timer);alarms.delete(name);}return result(!!a,cb);},
            getAll(cb){return result([...alarms.values()].map(({timer,...a})=>a),cb);}
        }
    };
    // Privileged browser history/bookmarks are intentionally absent on Android.
    window.__startBackground=async()=>{
        const first=!(await chrome.storage.local.get('androidInstalled')).androidInstalled;
        await chrome.storage.sync.set({forcedLanguage:(await chrome.storage.sync.get('forcedLanguage')).forcedLanguage||'ru'});
        if(first){await Promise.all(installed.emit({reason:'install'}));await chrome.storage.local.set({androidInstalled:true});}
        else await Promise.all(startup.emit());
        AndroidHost.backgroundReady();
    };

    // Native HTTP preserves extension cross-origin access without weakening WebView TLS/CORS.
    const originalFetch=window.fetch.bind(window), http=new Map();
    const toB64=bytes=>{let s='';for(let i=0;i<bytes.length;i+=8192)s+=String.fromCharCode(...bytes.subarray(i,i+8192));return btoa(s);};
    window.__httpReply=(id,r)=>{
        const p=http.get(id);if(!p)return;http.delete(id);p.cleanup();
        if(r.error){p.reject(new TypeError(r.error));return;}
        const bytes=Uint8Array.from(atob(r.body),c=>c.charCodeAt(0));
        try {const response=new Response([101,204,205,304].includes(r.status)?null:bytes,{status:r.status,headers:r.headers});Object.defineProperty(response,'url',{value:r.url});p.resolve(response);}
        catch(e){p.reject(e);}
    };
    window.fetch=async(input,options={})=>{
        const url=new URL(typeof input==='string'?input:input.url,location.href);
        if(!/^https?:$/.test(url.protocol)||url.origin===location.origin)return originalFetch(input,options);
        const request=new Request(input,options);
        if(request.signal.aborted)throw new DOMException('Aborted','AbortError');
        const body=['GET','HEAD'].includes(request.method)?null:toB64(new Uint8Array(await request.arrayBuffer()));
        const id='http-'+(++sequence);
        return new Promise((resolve,reject)=>{
            const abort=()=>{if(http.has(id)){http.delete(id);AndroidHost.cancelHttp(id);reject(new DOMException('Aborted','AbortError'));}};
            http.set(id,{resolve,reject,cleanup:()=>request.signal.removeEventListener('abort',abort)});
            request.signal.addEventListener('abort',abort,{once:true});
            AndroidHost.http(id,JSON.stringify({url:url.href,method:request.method,headers:Object.fromEntries(request.headers),redirect:request.redirect,body}));
        });
    };
    window.open=url=>{AndroidHost.openUrl(new URL(url,location.href).href);return null;};
    window.close=()=>AndroidHost.home();
    // Capture programmatic blob exports before the original code revokes their URL.
    const blobs=new Map(),create=URL.createObjectURL.bind(URL),revoke=URL.revokeObjectURL.bind(URL);
    URL.createObjectURL=blob=>{const url=create(blob);blobs.set(url,blob);return url;};
    URL.revokeObjectURL=url=>{blobs.delete(url);revoke(url);};
    const click=HTMLAnchorElement.prototype.click;
    HTMLAnchorElement.prototype.click=function(){
        const blob=blobs.get(this.href);
        if(this.download&&blob){const name=this.download;blob.arrayBuffer().then(b=>AndroidHost.download(name,blob.type,toB64(new Uint8Array(b))));return;}
        return click.call(this);
    };
    document.addEventListener('click',e=>{
        const a=e.target.closest('a[href]');if(a&&!a.download){const u=new URL(a.href,location.href);if(u.origin!==location.origin){e.preventDefault();AndroidHost.openUrl(u.href);}}
    },true);
})();
