import fs from 'node:fs';
const targets=await(await fetch('http://127.0.0.1:9223/json')).json();
const target=targets.find(x=>x.url.includes('newtab.html'));
const ws=new WebSocket(target.webSocketDebuggerUrl);
await new Promise(r=>ws.onopen=r);
let serial=0;const pending=new Map();
ws.onmessage=e=>{const m=JSON.parse(e.data);if(pending.has(m.id)){pending.get(m.id)(m);pending.delete(m.id);}};
const call=(method,params={})=>{const id=++serial,p=new Promise(r=>pending.set(id,r));ws.send(JSON.stringify({id,method,params}));return p;};
const evaluate=async expression=>{
 const r=await call('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true,userGesture:true});
 if(r.error||r.result.exceptionDetails)throw new Error(JSON.stringify(r));
 return r.result.result.value;
};
const checks=[];
const check=(name,value)=>{checks.push({name,pass:!!value});if(!value)throw new Error(name);};
try{
 check('desktop header, web search and currency removed',await evaluate(`getComputedStyle(document.getElementById('mainHeader')).display==='none'&&!document.getElementById('webSearchInput')&&!document.getElementById('currencyWidget')`));
 check('notes and search are inside hidden drawer',await evaluate(`document.getElementById('androidDrawer').hidden&&document.getElementById('androidDrawer').contains(document.getElementById('notesSidebar'))&&document.getElementById('androidDrawer').contains(document.getElementById('searchInput'))`));
 check('no add-bookmark button outside menu',await evaluate(`!document.querySelector('#speedDialGrid .add-tile')`));
 await evaluate(`document.getElementById('androidMenuButton').click()`);
 check('menu opens and Android Back closes it',await evaluate(`!document.getElementById('androidDrawer').hidden&&androidBack()&&document.getElementById('androidDrawer').hidden`));
 await evaluate(`document.getElementById('androidMenuButton').click();document.getElementById('androidAddTile').click()`);
 check('add-bookmark menu command opens form',await evaluate(`document.getElementById('tileModal').classList.contains('active')&&document.getElementById('androidDrawer').hidden`));
 await evaluate(`_speedDial.hideModal('tileModal');document.getElementById('androidMenuButton').click();document.getElementById('androidNotes').open=true;document.getElementById('addNote').click()`);
 check('notes create form works from menu',await evaluate(`document.getElementById('noteModal').classList.contains('active')`));
 await evaluate(`(async()=>{document.getElementById('noteTitle').value='Android2 fixture';document.getElementById('noteContent').value='Проверка нового меню';await _speedDial.saveNoteFromForm({preventDefault(){},target:document.getElementById('noteForm')});return true;})()`);
 check('created note renders inside menu',await evaluate(`document.getElementById('notesList').textContent.includes('Android2 fixture')`));
 await evaluate(`document.getElementById('searchInput').value='YouTube';document.getElementById('searchInput').dispatchEvent(new Event('input',{bubbles:true}))`);
 await new Promise(r=>setTimeout(r,450));
 check('bookmark search filters grid',await evaluate(`document.querySelectorAll('#speedDialGrid .tile').length===1&&document.getElementById('speedDialGrid').textContent.includes('YouTube')`));
 await evaluate(`document.getElementById('clearSearch').click();androidCloseDrawer()`);
 for(const width of [320,360,412,600,960]){
  await call('Emulation.setDeviceMetricsOverride',{width,height:800,deviceScaleFactor:1,mobile:true});
  await new Promise(r=>setTimeout(r,120));
  const m=await evaluate(`(()=>{const g=document.getElementById('speedDialGrid'),tiles=[...g.querySelectorAll('.tile')],r=g.getBoundingClientRect();return {viewport:innerWidth,columns:getComputedStyle(g).gridTemplateColumns.split(' ').length,width:r.width,primary:AndroidHost.primaryScreenWidth(),overflow:document.documentElement.scrollWidth>innerWidth+1,equal:Math.abs(tiles[0].getBoundingClientRect().width-tiles[1].getBoundingClientRect().width)<1};})()`);
  console.log('Viewport',width,m);
  check('two adaptive columns at '+width+'px',m.columns===2&&m.equal&&!m.overflow&&m.width<=Math.min(width,m.primary)+1);
 }
 await call('Emulation.clearDeviceMetricsOverride');
 const output={version:'6.9.9-android.2',checks};fs.writeFileSync('verification/layout-v2-results.json',JSON.stringify(output,null,2));console.log(JSON.stringify(output,null,2));
}finally{await call('Emulation.clearDeviceMetricsOverride');ws.close();}
