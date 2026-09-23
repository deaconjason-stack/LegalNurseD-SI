import assert from 'node:assert/strict';
import {createV4Runtime} from '../server/v4/api.js';

const documents=new Map();
const calls=[];
const fetchImpl=async(url,options={})=>{
  calls.push(url);
  const body=JSON.parse(options.body||'{}');
  if(url.endsWith('/rpc/whole_story_v4_get_document')){
    return new Response(JSON.stringify(documents.get(body.p_key)??null),{status:200});
  }
  if(url.endsWith('/rpc/whole_story_v4_put_document')){
    documents.set(body.p_key,body.p_value);
    return new Response(JSON.stringify(body.p_value),{status:200});
  }
  return new Response('{}',{status:404});
};
const runtime=createV4Runtime({remoteStoreConfig:{baseUrl:'https://example.supabase.co',apiKey:'anon',storageSecret:'secret',fetchImpl}});
await runtime.partnerStore.upsertOrganization({id:'org_1',name:'Pilot Org',status:'active'});
assert.equal((await runtime.partnerStore.getOrganization('org_1')).name,'Pilot Org');
assert.ok(calls.some(url=>url.includes('whole_story_v4_get_document')));
assert.ok(calls.some(url=>url.includes('whole_story_v4_put_document')));
assert.ok(documents.has('partners'));
console.log('v4 remote runtime tests passed');
