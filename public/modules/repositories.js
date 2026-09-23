import {putRecord,getRecord,listRecords,deleteRecord} from './db.js';
const save=(store)=>(value)=>putRecord(store,value).then(()=>value);
export const saveStory=save('stories'); export const getStory=id=>getRecord('stories',id); export const listStories=()=>listRecords('stories'); export const deleteStory=id=>deleteRecord('stories',id);
export const saveProfile=save('profiles'); export const getProfile=id=>getRecord('profiles',id);
export const saveReferral=save('referrals'); export const listReferrals=()=>listRecords('referrals');
export const saveResource=save('resources'); export const listResources=()=>listRecords('resources');
export const saveSetting=save('settings'); export const getSetting=id=>getRecord('settings',id);
export const saveTimelineEvent=save('timeline_events'); export const listTimelineEvents=()=>listRecords('timeline_events');
export const saveAdminConfig=save('admin_config'); export const getAdminConfig=id=>getRecord('admin_config',id);
export async function getLatestStory(){const items=await listStories();return items.sort((a,b)=>String(b.updatedAt||'').localeCompare(String(a.updatedAt||'')))[0]||null;}

export async function getNavigatorSnapshot(){
  const [stories,referrals,resources,events]=await Promise.all([listStories(),listReferrals(),listResources(),listTimelineEvents()]);
  const open=referrals.filter(r=>!['completed','declined'].includes(r.status));
  const byStatus=Object.fromEntries([...new Set(referrals.map(r=>r.status))].map(s=>[s,referrals.filter(r=>r.status===s).length]));
  const now=Date.now();
  const verifiedDomains=new Set(resources.filter(r=>r.active!==false&&r.verification?.status==='verified').flatMap(r=>r.serviceDomains||[]));const needsWithoutVerifiedMatch=stories.flatMap(s=>s.signals||[]).filter(sig=>sig.status!=='dismissed'&&!verifiedDomains.has(sig.domain)).length;return {storyCount:stories.length,openNextSteps:open.length,followUpsDue:open.filter(r=>r.followUpAt&&new Date(r.followUpAt).getTime()<=now).length,recentUpdates:events.sort((a,b)=>String(b.createdAt).localeCompare(String(a.createdAt))).slice(0,10),referralsByStatus:byStatus,resourcesNeedingVerification:resources.filter(r=>r.verification?.status!=='verified').length,needsWithoutVerifiedMatch,stories,referrals,resources};
}

export const saveLiveCaseMirror=save('live_cases'); export const getLiveCaseMirror=id=>getRecord('live_cases',id); export const listLiveCaseMirrors=()=>listRecords('live_cases');
export const saveCaseMessage=save('case_messages'); export const listCaseMessages=async(caseId)=>(await listRecords('case_messages')).filter(m=>m.caseId===caseId).sort((a,b)=>String(a.createdAt||'').localeCompare(String(b.createdAt||'')));
export async function saveCaseMessages(caseId,messages=[]){for(const m of messages)await saveCaseMessage({...m,id:m.id,caseId});return messages}
export const saveMessageDraft=save('message_drafts'); export const getMessageDraft=id=>getRecord('message_drafts',id); export const deleteMessageDraft=id=>deleteRecord('message_drafts',id);
