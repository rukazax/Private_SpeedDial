import fs from 'node:fs';
import {Client} from './client.mjs';
const phase=process.argv[2]||'home';const checks=[];
const assert=(name,value)=>{checks.push({name,pass:!!value});if(!value)throw new Error(name);console.log('PASS',name);};
async function loadPage(path){
 const targets=await(await fetch('http://127.0.0.1:9223/json')).json();
 const current=targets.find(t=>!t.url.includes('android-background'));
 if(!current.url.includes(path)){
  const c=await Client.open(current.url);await c.evaluate('AndroidHost.openUrl(chrome.runtime.getURL('+JSON.stringify(path)+'));true');c.close();
 }
 const c=await Client.open(path);await new Promise(r=>setTimeout(r,200));return c;
}
if(phase==='home'){
 const ui=await loadPage('newtab.html');
 try{
  const r=await ui.evaluate(fs.readFileSync('verification/home-v3.js','utf8'));checks.push(...r.checks);
  let cover;
  for(const width of [320,360,412,600,800,960]){
   await ui.call('Emulation.setDeviceMetricsOverride',{width,height:850,deviceScaleFactor:1,mobile:true});await new Promise(r=>setTimeout(r,120));
   const m=await ui.evaluate(`(()=>{const g=document.getElementById('speedDialGrid'),t=g.querySelector('.tile');return {columns:getComputedStyle(g).gridTemplateColumns.split(' ').length,width:t.getBoundingClientRect().width,overflow:document.documentElement.scrollWidth>innerWidth+1};})()`);
   if(width===412)cover=m.width;
   assert('grid '+width+'px',!m.overflow&&(width<=412?m.columns===2:m.columns===Math.max(2,Math.floor((width-20+0.1)/(cover+12)))&&Math.abs(m.width-cover)<1));
  }
  await ui.call('Emulation.clearDeviceMetricsOverride');
 }finally{await ui.call('Emulation.clearDeviceMetricsOverride');ui.close();}
}
if(phase==='settings'||phase==='extra'){
 const ui=await loadPage('options.html');
 try{const r=await ui.evaluate(fs.readFileSync('verification/'+(phase==='extra'?'extra':'settings')+'-v3.js','utf8'));checks.push(...r.checks);}finally{ui.close();}
}

if(phase==='extended-home'){
 const ui=await loadPage('newtab.html');try{checks.push(...(await ui.evaluate(fs.readFileSync('verification/extended-home-v3.js','utf8'))).checks);}finally{ui.close();}
}
fs.writeFileSync('verification/'+(process.env.SPEEDDIAL_TEST_TAG||'v3')+'-'+phase+'-results.json',JSON.stringify({phase,checks},null,2));
console.log('Completed',phase,checks.length,'checks');
