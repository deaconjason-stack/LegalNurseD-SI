import {validateResource} from '../shared-resources.mjs';
import {buildSharePackage} from '../shared-referrals.mjs';
import {listServerResources,upsertServerResource,archiveServerResource,getServerConfig,setServerConfig} from './resource-store.js';
import {applySecurityHeaders} from './security.js';
export async function readJson(req,{maxBytes=64*1024}={}){return await new Promise((resolve,reject)=>{let size=0,tooLarge=false,chunks=[];req.on('data',chunk=>{size+=chunk.length;if(size>maxBytes){tooLarge=true;chunks=[];return}if(!tooLarge)chunks.push(chunk)});req.on('end',()=>{if(tooLarge){const e=new Error('request_too_large');e.code='PAYLOAD_TOO_LARGE';reject(e);return}try{resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')||'{}'))}catch{const e=new Error('invalid_json');e.code='INVALID_JSON';reject(e)}});req.on('error',reject)})}
export function sendJson(res,status,body){applySecurityHeaders(res);res.statusCode=status;res.setHeader('content-type','application/json; charset=utf-8');res.setHeader('cache-control','no-store');res.end(JSON.stringify(body))}
export async function handlePrototypeApi(req,res){const url=new URL(req.url,`http://${req.headers.host||'localhost'}`);
 if(url.pathname==='/api/resources'&&req.method==='GET'){sendJson(res,200,{resources:await listServerResources({includeArchived:url.searchParams.get('includeArchived')==='1'})});return true}
 if(url.pathname==='/api/resources'&&req.method==='POST'){const body=await readJson(req);const check=validateResource(body);if(!check.ok){sendJson(res,400,{error:'invalid_resource',details:check.errors});return true}sendJson(res,201,{resource:await upsertServerResource(body)});return true}
 const match=url.pathname.match(/^\/api\/resources\/([^/]+)$/);if(match&&req.method==='PUT'){const body=await readJson(req);const resource={...body,id:decodeURIComponent(match[1])};const check=validateResource(resource);if(!check.ok){sendJson(res,400,{error:'invalid_resource',details:check.errors});return true}sendJson(res,200,{resource:await upsertServerResource(resource)});return true}
 if(match&&req.method==='DELETE'){const resource=await archiveServerResource(decodeURIComponent(match[1]));if(!resource){sendJson(res,404,{error:'resource_not_found'});return true}sendJson(res,200,{resource});return true}
 if(url.pathname==='/api/config'&&req.method==='GET'){sendJson(res,200,{config:getServerConfig()});return true}
 if(url.pathname==='/api/config'&&req.method==='PUT'){sendJson(res,200,{config:setServerConfig(await readJson(req))});return true}
 if(url.pathname==='/api/referral-preview'&&req.method==='POST'){const body=await readJson(req);sendJson(res,200,{sharePackage:buildSharePackage(body)});return true}
 return false
}
