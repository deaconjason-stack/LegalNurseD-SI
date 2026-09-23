import assert from 'node:assert/strict';
import {createRemoteJsonStore} from '../server/v4/remote-json-store.js';

const calls=[];
const documents=new Map();
const fetchImpl=async(url,options={})=>{
  calls.push({url,options});
  const body=JSON.parse(options.body||'{}');
  if(url.endsWith('/rpc/whole_story_v4_get_document')){
    const value=documents.has(body.p_key)?documents.get(body.p_key):null;
    return new Response(JSON.stringify(value),{status:200,headers:{'content-type':'application/json'}});
  }
  if(url.endsWith('/rpc/whole_story_v4_put_document')){
    documents.set(body.p_key,body.p_value);
    return new Response(JSON.stringify(body.p_value),{status:200,headers:{'content-type':'application/json'}});
  }
  return new Response(JSON.stringify({message:'not found'}),{status:404,headers:{'content-type':'application/json'}});
};

const store=createRemoteJsonStore({
  baseUrl:'https://example.supabase.co',
  apiKey:'publishable-key',
  storageSecret:'internal-secret',
  documentKey:'cases',
  initialValue:[],
  validate:v=>({ok:Array.isArray(v),errors:['array_required']}),
  fetchImpl
});
assert.deepEqual(await store.read(),[]);
const updated=await store.update(rows=>{rows.push({id:'c1'});return rows});
assert.deepEqual(updated,[{id:'c1'}]);
assert.deepEqual(await store.read(),[{id:'c1'}]);
assert.equal(calls[0].options.headers.apikey,'publishable-key');
assert.equal(calls[0].options.headers['x-whole-story-storage-secret'],'internal-secret');
assert.equal(calls[1].options.method,'POST');
await assert.rejects(store.update(()=>({bad:true})),e=>e.code==='STORE_VALIDATION_FAILED');

const broken=createRemoteJsonStore({baseUrl:'https://example.supabase.co',apiKey:'k',storageSecret:'s',documentKey:'bad',initialValue:{},fetchImpl:async()=>new Response('{"message":"denied"}',{status:403,headers:{'content-type':'application/json'}})});
await assert.rejects(broken.read(),e=>e.code==='REMOTE_STORE_ERROR'&&e.status===403);
console.log('v4 remote store tests passed');
