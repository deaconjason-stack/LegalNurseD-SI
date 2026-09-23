import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
const seedPath=fileURLToPath(new URL('../public/data/resources.demo.json',import.meta.url));let resources=null;let config={freshnessDays:30};
async function ensure(){if(!resources){resources=JSON.parse(await readFile(seedPath,'utf8'))}return resources}
export async function listServerResources({includeArchived=false}={}){const all=await ensure();return all.filter(r=>includeArchived||r.active!==false).map(r=>structuredClone(r))}
export async function getServerResource(id){return (await ensure()).find(r=>r.id===id)||null}
export async function upsertServerResource(resource){const all=await ensure();const i=all.findIndex(r=>r.id===resource.id);const next=structuredClone(resource);if(i>=0)all[i]=next;else all.push(next);return structuredClone(next)}
export async function archiveServerResource(id){const all=await ensure();const r=all.find(x=>x.id===id);if(!r)return null;r.active=false;return structuredClone(r)}
export function getServerConfig(){return structuredClone(config)}
export function setServerConfig(next){config={...config,...next};return getServerConfig()}
