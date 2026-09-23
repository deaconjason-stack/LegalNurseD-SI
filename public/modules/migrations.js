const makeId = () => globalThis.crypto?.randomUUID?.() ?? `story_${Date.now()}_${Math.random().toString(36).slice(2)}`;
export async function migrateV2History({legacyJson,writeStory}) {
  if (!legacyJson) return {migrated:0,skipped:0,canRemoveLegacy:false};
  let items;
  try { items=JSON.parse(legacyJson); } catch { return {migrated:0,skipped:1,canRemoveLegacy:false}; }
  if (!Array.isArray(items)) return {migrated:0,skipped:1,canRemoveLegacy:false};
  let migrated=0, skipped=0;
  for (const item of items) {
    if (!item?.story) { skipped++; continue; }
    const record={
      id:item.id || makeId(), profileId:null, title:item.result?.route?.title || 'Imported story', rawStory:item.story,
      createdAt:item.savedAt || new Date().toISOString(), updatedAt:item.savedAt || new Date().toISOString(),
      signals:[], priority:item.result?.route || null, referrals:[], timeline:[], consent:{saveLocally:true,shareScope:'none',selectedFields:[],grantedAt:null,updatedAt:null},
      legacySource:'wholeStoryHistory', legacyResult:item.result || null
    };
    try { await writeStory(record); migrated++; } catch { return {migrated,skipped,canRemoveLegacy:false}; }
  }
  return {migrated,skipped,canRemoveLegacy:migrated>0 && migrated+skipped===items.length};
}

export async function offerV2Migration({saveStory}) {
  if (typeof localStorage==='undefined') return {legacyCleanupAvailable:false,migrated:0};
  const legacyJson=localStorage.getItem('wholeStoryHistory');
  if (!legacyJson) return {legacyCleanupAvailable:false,migrated:0};
  const out=await migrateV2History({legacyJson,writeStory:saveStory});
  return {...out,legacyCleanupAvailable:out.canRemoveLegacy};
}
export function removeLegacyHistory() { if (typeof localStorage!=='undefined') localStorage.removeItem('wholeStoryHistory'); }

export function classifyLegacyReferral(referral){const terminal=new Set(['completed','declined']);return{...referral,legacyLocalReferral:true,conversionEligible:!terminal.has(referral?.status),conversionRequiresFreshConsent:!terminal.has(referral?.status)}}
export async function migrateV3Referrals({referrals=[]}={}){return referrals.map(classifyLegacyReferral)}
export function prepareLegacyReferralConversion(referral,{story,resource,consent}={}){const classified=classifyLegacyReferral(referral);if(!classified.conversionEligible)return{eligible:false,legacyLocalReferral:true,transmitted:false,requiresFreshConsent:true};return{eligible:true,legacyLocalReferral:true,transmitted:false,requiresFreshConsent:true,previewInput:{story,signals:story?.signals||[],priority:story?.priority||null,profile:null,consent:{...consent,grantedAt:null},resourceId:resource?.id||referral.resourceId,partnerOrgId:resource?.partnerOrgId||null},sourceReferralId:referral.id}}
