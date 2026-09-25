import assert from 'node:assert/strict';
import {createServer} from './server.js';
import {createV4Runtime} from './server/v4/api.js';
import {issueMagicLink} from './server/v4/auth.js';

const dataDir=process.env.WHOLE_STORY_DATA_DIR||'/data';
const runtime=createV4Runtime({dataDir});
const iso=new Date().toISOString();
const orgId='live-acceptance-org';
const managerId='live-acceptance-manager';
let caseId=null;
await runtime.partnerStore.upsertOrganization({id:orgId,name:'Whole Story Live Acceptance',resourceIds:['live-resource'],status:'active',createdAt:iso,updatedAt:iso});
const manager=await runtime.partnerStore.upsertUser({id:managerId,partnerOrgId:orgId,email:'acceptance@example.test',displayName:'Acceptance Manager',role:'partner_manager',status:'active',createdAt:iso,updatedAt:iso});
const server=createServer({v4Runtime:runtime});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const base=`http://127.0.0.1:${server.address().port}`;
async function j(path,{method='GET',body,headers={}}={}){const res=await fetch(base+path,{method,headers:{accept:'application/json',...(body!==undefined?{'content-type':'application/json'}:{}),...headers},body:body===undefined?undefined:JSON.stringify(body)});let data={};try{data=await res.json()}catch{}return{res,data}}
try{
 const preview=(await j('/api/v4/cases/preview',{method:'POST',body:{story:{id:'live-acceptance-story',text:'I need food support and transportation help.'},signals:[{domain:'food',status:'active'}],priority:{priorityDomain:'food'},profile:{displayName:'Acceptance Person',preferredContactMethod:'phone'},consent:{shareScope:'summary'},resourceId:'live-resource',partnerOrgId:orgId}})).data;
 const created=await j('/api/v4/cases',{method:'POST',body:{sharePackage:preview.sharePackage,shareScope:preview.shareScope,personDisplayName:preview.personDisplayName,preferredContactMethod:preview.preferredContactMethod,storyId:'live-acceptance-story',resourceId:'live-resource',partnerOrgId:orgId,createdBy:{type:'person',id:null,displayName:'Acceptance Person'}}});
 assert.equal(created.res.status,201); caseId=created.data.case.id; const personHeaders={authorization:`Bearer ${created.data.accessSecret}`};
 const invite=await issueMagicLink({user:manager,sessionStore:runtime.sessionStore,now:new Date()});
 const login=await j('/api/v4/partner/session/redeem',{method:'POST',body:{token:invite.token}}); assert.equal(login.res.status,200); const partnerHeaders={authorization:`Bearer ${login.data.sessionToken}`};
 const replay=await j('/api/v4/partner/session/redeem',{method:'POST',body:{token:invite.token}}); assert.equal(replay.res.status,400);
 const inbox=await j('/api/v4/partner/cases',{headers:partnerHeaders}); assert.ok(inbox.data.cases.some(c=>c.id===caseId));
 const accepted=await j(`/api/v4/partner/cases/${caseId}/accept`,{method:'POST',headers:partnerHeaders,body:{version:created.data.case.version}}); assert.equal(accepted.data.case.status,'accepted');
 const assigned=await j(`/api/v4/partner/cases/${caseId}/assign`,{method:'POST',headers:partnerHeaders,body:{version:accepted.data.case.version,partnerUserId:managerId}}); assert.equal(assigned.res.status,200);
 const next=await j(`/api/v4/partner/cases/${caseId}/next-action`,{method:'POST',headers:partnerHeaders,body:{version:assigned.data.case.version,nextAction:'Call person',dueAt:new Date(Date.now()+3600000).toISOString(),responsibleParty:'partner'}}); assert.equal(next.res.status,200);
 assert.equal((await j(`/api/v4/cases/${caseId}/messages`,{method:'POST',headers:personHeaders,body:{body:'Phone works best after 3 PM.'}})).res.status,201);
 assert.equal((await j(`/api/v4/partner/cases/${caseId}/request-information`,{method:'POST',headers:partnerHeaders,body:{fields:['preferred callback window']}})).res.status,201);
 assert.equal((await j(`/api/v4/cases/${caseId}/share`,{method:'POST',headers:personHeaders,body:{fields:{'preferred callback window':'after 3 PM'}}})).res.status,201);
 const scheduled=await j(`/api/v4/partner/cases/${caseId}/schedule`,{method:'POST',headers:partnerHeaders,body:{version:next.data.case.version,scheduledAt:new Date(Date.now()+86400000).toISOString()}}); assert.equal(scheduled.data.case.status,'scheduled');
 const closed=await j(`/api/v4/partner/cases/${caseId}/close`,{method:'POST',headers:partnerHeaders,body:{version:scheduled.data.case.version,outcome:'service_completed',note:'Live deployment acceptance'}}); assert.equal(closed.data.case.closedOutcome,'service_completed');
 const confirmed=await j(`/api/v4/cases/${caseId}/confirm-outcome`,{method:'POST',headers:personHeaders,body:{version:closed.data.case.version,confirmed:true,note:'Live acceptance confirmed'}}); assert.equal(confirmed.data.case.personConfirmedOutcome,true);
 const events=await j(`/api/v4/partner/cases/${caseId}/events`,{headers:partnerHeaders}); const types=events.data.events.map(e=>e.type);
 for(const required of ['case_created','case_sent','case_delivered','case_accepted','case_assigned','next_action_set','message_posted','information_requested','information_shared','schedule_set','case_closed','person_outcome_confirmed'])assert.ok(types.includes(required),`missing ${required}`);
 console.log(`LIVE_E2E_OK events=${events.data.events.length}`);
} finally {
 await new Promise(r=>server.close(r));
 if(caseId){await runtime.caseStore._store.update(rows=>rows.filter(x=>x.id!==caseId));await runtime.messageStore._store.update(rows=>rows.filter(x=>x.caseId!==caseId));await runtime.eventStore._store.update(rows=>rows.filter(x=>x.caseId!==caseId));}
 await runtime.partnerStore._store.update(d=>({...d,organizations:d.organizations.filter(x=>x.id!==orgId),users:d.users.filter(x=>x.id!==managerId)}));
 await runtime.sessionStore._store.update(d=>({...d,magicLinks:d.magicLinks.filter(x=>x.userId!==managerId),sessions:d.sessions.filter(x=>x.userId!==managerId)}));
}
