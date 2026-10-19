import fs from 'node:fs';import {Client} from './client.mjs';
const c=await Client.open('android-background');try{const r=await c.evaluate(fs.readFileSync('verification/sync-v3.js','utf8'));fs.writeFileSync('verification/'+(process.env.SPEEDDIAL_TEST_TAG||'v3')+'-sync-results.json',JSON.stringify(r,null,2));console.log(r);}finally{c.close();}
