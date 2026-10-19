'use strict';
async function setupAlarms() {
    await api.alarms.clear('syncAlarm');
    const s=await getCachedSettings();
    if(s.autoSync&&validateSettings(s))api.alarms.create('syncAlarm',{periodInMinutes:Math.max(5,parseInt(s.syncInterval)||60)});
    await setupBackgroundRotation();
}
async function setupBackgroundRotation() {
    await api.alarms.clear('bgRotate');
    const s=await getCachedSettings();
    if(s.bgRotateEnabled&&(s.backgrounds||[]).length>1)api.alarms.create('bgRotate',{periodInMinutes:Math.max(5,parseInt(s.bgRotateInterval)||30)});
}
async function rotateBackground() {
    const s=await getCachedSettings(),list=s.backgrounds||[];if(list.length<2)return;
    const i=s.bgRotateMode==='random'?Math.floor(Math.random()*list.length):(list.findIndex(b=>b.id===s.activeBackgroundId)+1)%list.length;
    await api.storage.sync.set({activeBackgroundId:list[i].id,settingsUpdatedAt:Date.now()});
}
api.alarms.onAlarm.addListener(async a=>{
    try { if(a.name==='syncAlarm'){const s=await getCachedSettings();if(s.autoSync&&validateSettings(s))await syncData('merge');}else if(a.name==='bgRotate')await rotateBackground(); }
    catch(e){logError('android.alarms',e.message);}
});
