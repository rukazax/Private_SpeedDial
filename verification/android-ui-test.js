(async()=>{
    const sd=window._speedDial,checks=[];
    const check=(name,value)=>{checks.push({name,pass:!!value});if(!value)throw new Error('FAIL '+name);};
    const test=sd.tiles.find(t=>t.url==='https://example.org/android-test');
    sd.showContextMenu(innerWidth-10,innerHeight-10,test.id);
    await new Promise(r=>setTimeout(r,50));
    const menu=document.getElementById('contextMenu');
    check('touch menu stays inside viewport',menu.getBoundingClientRect().bottom<=innerHeight&&menu.getBoundingClientRect().right<=innerWidth);
    const before=sd.tiles.findIndex(t=>t.id===test.id);
    menu.querySelector('.android-reorder[data-direction="-1"]').click();
    await new Promise(r=>setTimeout(r,200));
    check('mobile manual reordering',sd.tiles.findIndex(t=>t.id===test.id)===before-1);
    await chrome.storage.local.set({masterPasswordRecord:await createMasterPasswordRecord('fixture-ui-pass')});
    await sd.lockNow();
    check('master lock screen appears',!!document.getElementById('lockScreen'));
    document.getElementById('masterPass').value='wrong';document.getElementById('unlockBtn').click();
    await new Promise(r=>setTimeout(r,250));
    check('wrong password keeps screen locked',!!document.getElementById('lockScreen'));
    document.getElementById('masterPass').value='fixture-ui-pass';document.getElementById('unlockBtn').click();
    await new Promise(r=>setTimeout(r,400));
    check('correct password unlocks screen',!document.getElementById('lockScreen'));
    return {checks};
})()
