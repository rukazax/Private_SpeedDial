import fs from 'node:fs';import {Client} from './client.mjs';
const ui=await Client.open('newtab.html');try{
 await ui.evaluate(`window.__folders=_speedDial.folders;_speedDial.folders=Array.from({length:18},(_,i)=>({id:'screen-'+i,name:'Папка '+(i+1)}));_speedDial.renderFoldersBar();window.scrollTo(0,0);true`);
 const box=await ui.evaluate(`(()=>{const r=document.getElementById('foldersBar').getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height};})()`);
 const x=box.x+box.w-20,y=box.y+box.h/2;
 await ui.call('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});for(let i=1;i<=10;i++)await ui.call('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x-i*20,y}]});await ui.call('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await new Promise(r=>setTimeout(r,300));
 const right=await ui.evaluate(`document.getElementById('foldersBar').scrollLeft`);
 await ui.call('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:box.x+20,y}]});for(let i=1;i<=10;i++)await ui.call('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:box.x+20+i*20,y}]});await ui.call('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await new Promise(r=>setTimeout(r,300));
 const left=await ui.evaluate(`document.getElementById('foldersBar').scrollLeft`);if(!(right>0&&left<right))throw Error('Horizontal finger swipe failed');fs.writeFileSync('verification/v3-touch-results.json',JSON.stringify({right,left,pass:true},null,2));
 if(process.argv[2]!=='touch-only'){
 const shot=await ui.call('Page.captureScreenshot',{format:'png'});fs.writeFileSync('verification/v3-home.png',Buffer.from(shot.result.data,'base64'));
 await ui.call('Emulation.setDeviceMetricsOverride',{width:960,height:850,deviceScaleFactor:1,mobile:true});await new Promise(r=>setTimeout(r,150));const wide=await ui.call('Page.captureScreenshot',{format:'png'});fs.writeFileSync('verification/v3-wide.png',Buffer.from(wide.result.data,'base64'));await ui.call('Emulation.clearDeviceMetricsOverride');
 }
 await ui.evaluate(`_speedDial.folders=__folders;_speedDial.renderFoldersBar();true`);
 const tile=await ui.evaluate(`(()=>{const r=document.querySelector('[data-tile-id]').getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};})()`);await ui.call('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[tile]});await new Promise(r=>setTimeout(r,650));await ui.call('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});const menu=await ui.evaluate(`getComputedStyle(document.getElementById('contextMenu')).display!=='none'`);if(!menu)throw Error('Long press menu failed');await ui.evaluate(`androidBack();true`);fs.writeFileSync('verification/v3-longpress-results.json',JSON.stringify({pass:menu},null,2));
}finally{ui.close();}
