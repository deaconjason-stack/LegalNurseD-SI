import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
const port=43000+Math.floor(Math.random()*1000);const child=spawn(process.execPath,['server.js'],{env:{...process.env,PORT:String(port)},stdio:['ignore','pipe','pipe']});const base=`http://127.0.0.1:${port}`;
async function wait(){for(let i=0;i<40;i++){try{const r=await fetch(`${base}/api/health`);if(r.ok)return}catch{}await new Promise(r=>setTimeout(r,100))}throw new Error('server did not start')}
async function json(path,options){const r=await fetch(`${base}${path}`,options);let body;try{body=await r.json()}catch{body=null}return{r,body}}
try{await wait();let x=await json('/api/health');assert.equal(x.body.version,'4.0.0');x=await json('/api/analyze',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({story:'I missed my appointment because I had no ride.'})});assert.equal(x.r.status,200);assert.equal(x.body.version,'3.0.0');assert.ok(x.body.signals.some(s=>s.domain==='transportation'));assert.equal('stored'in x.body,false);
x=await json('/api/resources');assert.equal(x.r.status,200);assert.ok(Array.isArray(x.body.resources));
const resource={id:'test-resource-1',name:'Test Navigation Resource',description:'Test only',serviceDomains:['transportation'],serviceArea:['all'],delivery:['phone'],languages:['en'],active:true,isDemo:true,verification:{status:'unverified',verifiedAt:null,verifiedBy:null,notes:'test'}};
x=await json('/api/resources',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(resource)});assert.equal(x.r.status,201);assert.equal(x.body.resource.active,true);
x=await json('/api/resources/test-resource-1',{method:'DELETE'});assert.equal(x.r.status,200);assert.equal(x.body.resource.active,false);
x=await json('/api/resources?includeArchived=1');assert.ok(x.body.resources.some(r=>r.id==='test-resource-1'&&r.active===false));
let raw=await fetch(`${base}/api/analyze`,{method:'POST',headers:{'content-type':'application/json'},body:'{bad'});assert.equal(raw.status,400);let bad=await raw.json();assert.equal(bad.error,'invalid_json');assert.equal(JSON.stringify(bad).includes('I missed'),false);
raw=await fetch(`${base}/api/analyze`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({story:'x'.repeat(70000)})});assert.equal(raw.status,413);
raw=await fetch(`${base}/`);assert.ok((raw.headers.get('content-security-policy')||'').includes("default-src 'self'"));assert.equal(raw.headers.get('x-content-type-options'),'nosniff');
x=await json('/api/referral-preview',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({story:{rawStory:'secret'},signals:[{id:'s',domain:'transportation',label:'needs ride',source:'detected',confidence:'high',status:'active',createdAt:'2026-09-22T00:00:00Z'}],priority:{priorityDomain:'transportation'},profile:{displayName:'Jay'},consent:{shareScope:'selected_fields',selectedFields:['signals','priority']}})});assert.equal(x.r.status,200);assert.equal('rawStory' in x.body.sharePackage,false);
console.log('api tests passed')}finally{child.kill('SIGTERM')}
