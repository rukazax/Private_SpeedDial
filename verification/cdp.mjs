import fs from 'node:fs';
const targets=await (await fetch('http://127.0.0.1:9223/json')).json();
const needle=process.argv[2]||'newtab.html';
const target=targets.find(t=>t.url.includes(needle));
if(!target)throw new Error('No target '+needle+'; targets: '+targets.map(t=>t.url).join(','));
const ws=new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve,reject)=>{ws.onopen=resolve;ws.onerror=reject;});
let next=0;const pending=new Map();
ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.id&&pending.has(m.id)){pending.get(m.id)(m);pending.delete(m.id);}};
async function call(method,params){const id=++next;const p=new Promise(resolve=>pending.set(id,resolve));ws.send(JSON.stringify({id,method,params}));return p;}
let expression=process.argv[3] || 'JSON.stringify({title:document.title,ready:document.readyState,errors:window._speedDial?.tiles.length})';
if(expression.startsWith('@'))expression=fs.readFileSync(expression.slice(1),'utf8');
const output=await call('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true,userGesture:true});
console.log(JSON.stringify(output,null,2));
if(process.argv[4]){const shot=await call('Page.captureScreenshot',{format:'png'});fs.writeFileSync(process.argv[4],Buffer.from(shot.result.data,'base64'));}
ws.close();
if(output.error||output.result?.exceptionDetails)process.exitCode=1;
