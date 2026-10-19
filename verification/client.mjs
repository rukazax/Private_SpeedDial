export class Client {
 static async open(needle){
  let target;
  for(let i=0;i<60;i++){
   const list=await(await fetch('http://127.0.0.1:9223/json')).json();target=list.find(x=>x.url.includes(needle));
   if(target)break;await new Promise(r=>setTimeout(r,100));
  }
  if(!target)throw new Error('Target missing '+needle);
  const c=new Client();c.socket=new WebSocket(target.webSocketDebuggerUrl);c.next=0;c.pending=new Map();
  await new Promise((r,j)=>{c.socket.onopen=r;c.socket.onerror=j;});
  c.socket.onmessage=e=>{const m=JSON.parse(e.data);if(c.pending.has(m.id)){c.pending.get(m.id)(m);c.pending.delete(m.id);}};
  return c;
 }
 async call(method,params={}){const id=++this.next,p=new Promise(r=>this.pending.set(id,r));this.socket.send(JSON.stringify({id,method,params}));return p;}
 async evaluate(expression){
  const r=await this.call('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true,userGesture:true});
  if(r.error||r.result.exceptionDetails)throw new Error(JSON.stringify(r.result?.exceptionDetails||r.error));
  return r.result.result.value;
 }
 close(){this.socket.close();}
}
