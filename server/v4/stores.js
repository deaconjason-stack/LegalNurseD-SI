import {createAtomicJsonStore} from './atomic-json-store.js';
const clone=v=>v==null?v:structuredClone(v);
const secretNames=new Set(['token','secret','sessionToken','magicLinkToken']);
function rejectPlain(obj){for(const k of Object.keys(obj||{}))if(secretNames.has(k))throw new Error('plaintext_secret_field');}
function arrayStore(filePath,store){return store||createAtomicJsonStore({filePath,initialValue:[],validate:v=>({ok:Array.isArray(v),errors:['array_required']})});}
export function createCaseStore({filePath,store}){const s=arrayStore(filePath,store);return{
  async createCase(rec){return s.update(rows=>{if(rows.some(x=>x.id===rec.id))throw Object.assign(new Error('case_exists'),{code:'CASE_EXISTS'}); rows.push(clone(rec));return rows;}).then(rows=>clone(rows.find(x=>x.id===rec.id)))},
  async getCase(id){return clone((await s.read()).find(x=>x.id===id)||null)},
  async updateCase(id,expectedVersion,updater){let out;await s.update(rows=>{const i=rows.findIndex(x=>x.id===id);if(i<0)throw Object.assign(new Error('case_not_found'),{code:'CASE_NOT_FOUND'});const current=clone(rows[i]);if(current.version!==expectedVersion)throw Object.assign(new Error('version_conflict'),{code:'VERSION_CONFLICT',current});let next=updater(clone(current));if(!next||typeof next!=='object')throw new Error('invalid_case_update'); next={...next,version:current.version+1}; rows[i]=clone(next);out=clone(next);return rows});return out},
  async listCasesByPartnerOrg(org,filters={}){let rows=(await s.read()).filter(x=>x.partnerOrgId===org);if(filters.status)rows=rows.filter(x=>x.status===filters.status);return clone(rows)}, _store:s};}
export function createPartnerStore({filePath,store}){const s=store||createAtomicJsonStore({filePath,initialValue:{organizations:[],users:[],availability:[]},validate:v=>({ok:v&&Array.isArray(v.organizations)&&Array.isArray(v.users)&&Array.isArray(v.availability),errors:['partner_store_invalid']})});return{
  async upsertOrganization(rec){let out;await s.update(d=>{const i=d.organizations.findIndex(x=>x.id===rec.id);out={...d.organizations[i],...clone(rec)};if(i<0)d.organizations.push(out);else d.organizations[i]=out;return d});return clone(out)},
  async getOrganization(id){return clone((await s.read()).organizations.find(x=>x.id===id)||null)},
  async upsertUser(rec){let out;await s.update(d=>{const i=d.users.findIndex(x=>x.id===rec.id);out={...d.users[i],...clone(rec)};if(i<0)d.users.push(out);else d.users[i]=out;return d});return clone(out)},
  async getUser(id){return clone((await s.read()).users.find(x=>x.id===id)||null)},
  async findUserByEmail(email){const q=String(email).toLowerCase();return clone((await s.read()).users.find(x=>String(x.email).toLowerCase()===q)||null)},
  async listUsersByOrganization(org){return clone((await s.read()).users.filter(x=>x.partnerOrgId===org))},
  async upsertAvailability(rec){let out;await s.update(d=>{const i=d.availability.findIndex(x=>x.resourceId===rec.resourceId&&x.partnerOrgId===rec.partnerOrgId);out=clone(rec);if(i<0)d.availability.push(out);else d.availability[i]=out;return d});return clone(out)},
  async listAvailability(org){return clone((await s.read()).availability.filter(x=>x.partnerOrgId===org))}, _store:s};}
export function createSessionStore({filePath,store}){const s=store||createAtomicJsonStore({filePath,initialValue:{magicLinks:[],sessions:[]},validate:v=>({ok:v&&Array.isArray(v.magicLinks)&&Array.isArray(v.sessions),errors:['session_store_invalid']})});return{
  async createMagicLink(rec){rejectPlain(rec);await s.update(d=>{d.magicLinks.push(clone(rec));return d});return clone(rec)},
  async redeemMagicLink(tokenHash,now){let found;await s.update(d=>{const x=d.magicLinks.find(r=>r.tokenHash===tokenHash&&!r.redeemedAt&&!r.revokedAt&&new Date(r.expiresAt)>new Date(now));if(!x)throw new Error('INVALID_OR_EXPIRED_TOKEN');x.redeemedAt=new Date(now).toISOString();found=clone(x);return d});return found},
  async createSession(rec){rejectPlain(rec);await s.update(d=>{d.sessions.push(clone(rec));return d});return clone(rec)},
  async getSession(sessionHash,now){const x=(await s.read()).sessions.find(r=>r.sessionHash===sessionHash&&!r.revokedAt&&new Date(r.expiresAt)>new Date(now)&&new Date(r.idleExpiresAt||r.expiresAt)>new Date(now));return clone(x||null)},
  async touchSession(sessionHash,now,idleMs=2*3600_000){let out;await s.update(d=>{const x=d.sessions.find(r=>r.sessionHash===sessionHash);if(x&&!x.revokedAt){x.lastSeenAt=new Date(now).toISOString();x.idleExpiresAt=new Date(new Date(now).getTime()+idleMs).toISOString();out=clone(x)}return d});return out},
  async revokeSession(sessionHash){await s.update(d=>{const x=d.sessions.find(r=>r.sessionHash===sessionHash);if(x)x.revokedAt=new Date().toISOString();return d})},
  async _debugMagicLinks(){return clone((await s.read()).magicLinks)}, _store:s};}
export function createMessageStore({filePath,store}){const s=arrayStore(filePath,store);return{async appendMessage(m){await s.update(a=>{a.push(clone(m));return a});return clone(m)},async listMessages(caseId,afterCursor){let a=(await s.read()).filter(x=>x.caseId===caseId);if(afterCursor)a=a.filter(x=>String(x.createdAt)>String(afterCursor));return clone(a)},_store:s}}
export function createEventStore({filePath,store}){const s=arrayStore(filePath,store);return{async appendEvent(e){await s.update(a=>{a.push(clone(e));return a});return clone(e)},async listEvents(caseId,afterCursor){let a=(await s.read()).filter(x=>x.caseId===caseId);if(afterCursor)a=a.filter(x=>String(x.at)>String(afterCursor));return clone(a)},async listOperationalEvents(){return clone((await s.read()).filter(x=>x.caseId==null))},_store:s}}
export const CaseStore=createCaseStore,PartnerStore=createPartnerStore,SessionStore=createSessionStore,MessageStore=createMessageStore,EventStore=createEventStore;
