// usage: node cdp.mjs <url> <waitExpr> <resultExpr> [screenshot.png] [width] [height] [timeoutMs]
import {spawn} from 'node:child_process';import fs from 'node:fs';import os from 'node:os';import path from 'node:path';
const [url,waitExpr,resultExpr,shot,W='1500',H='1700',TO='60000']=process.argv.slice(2);
const port=9333+Math.floor(Math.random()*200);const udd=fs.mkdtempSync(path.join(os.tmpdir(),'cdp-'));
const ch=spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',['--headless=new','--disable-gpu','--hide-scrollbars','--no-first-run',`--remote-debugging-port=${port}`,`--user-data-dir=${udd}`,`--window-size=${W},${H}`,'--force-device-scale-factor=1','about:blank'],{stdio:'ignore'});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
let targets;for(let i=0;i<50;i++){try{targets=await (await fetch(`http://127.0.0.1:${port}/json`)).json();if(targets.length)break}catch{}await sleep(200)}
const ws=new WebSocket(targets.find(t=>t.type==='page').webSocketDebuggerUrl);await new Promise(r=>ws.onopen=r);
let id=0;const pend=new Map();const logs=[];ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.id&&pend.has(m.id)){pend.get(m.id)(m);pend.delete(m.id)}else if(m.method==='Runtime.consoleAPICalled')logs.push(m.params.args.map(a=>a.value??a.description).join(' '));else if(m.method==='Runtime.exceptionThrown')logs.push('EXC '+(m.params.exceptionDetails.exception?.description||m.params.exceptionDetails.text))};
const send=(method,params={})=>new Promise(r=>{const i=++id;pend.set(i,r);ws.send(JSON.stringify({id:i,method,params}))});
const evalJs=async expr=>{const r=await send('Runtime.evaluate',{expression:expr,returnByValue:true,awaitPromise:true});return r.result?.result?.value};
await send('Runtime.enable');await send('Page.enable');await send('Page.navigate',{url});
if(process.env.PDF_FILE){for(let i=0;i<100;i++){await sleep(200);try{if(await evalJs('!!window.S'))break}catch{}}const b=fs.readFileSync(process.env.PDF_FILE).toString('base64');await evalJs(`window.__PDF='${b}';window.__PDFNAME=${JSON.stringify(path.basename(process.env.PDF_FILE))};1`);}
const t0=Date.now();let ok=false;while(Date.now()-t0<+TO){await sleep(300);try{if(await evalJs(waitExpr)){ok=true;break}}catch{}}
console.log(ok?`READY after ${Date.now()-t0}ms`:`TIMEOUT after ${TO}ms`);
await sleep(400);const res=await evalJs(resultExpr);console.log(typeof res==='string'?res:JSON.stringify(res,null,1));
if(shot){const s=await send('Page.captureScreenshot',{format:'png'});fs.writeFileSync(shot,Buffer.from(s.result.data,'base64'));console.log('shot',shot)}
console.log('--- console:');logs.forEach(l=>console.log(l.slice(0,300)));
ws.close();ch.kill();try{fs.rmSync(udd,{recursive:true,force:true,maxRetries:3})}catch{}process.exit(0);
