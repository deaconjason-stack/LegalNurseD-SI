const terminal=new Set(['closed','cancelled']);
export function mergeConfirmedCase(local={},server={},{confirmedAt=new Date().toISOString()}={}){if(local?.version>server?.version)return {...local};const preserve={accessSecret:local.accessSecret,lastSeenMessageAt:local.lastSeenMessageAt,messageDraft:local.messageDraft};return{...local,...server,...Object.fromEntries(Object.entries(preserve).filter(([,v])=>v!==undefined)),lastConfirmedAt:confirmedAt}}
export function caseFreshnessLabel(caseMirror,online=true){if(online)return caseMirror?.lastConfirmedAt?`Confirmed ${format(caseMirror.lastConfirmedAt)}`:'Not yet confirmed';return caseMirror?.lastConfirmedAt?`Last confirmed ${format(caseMirror.lastConfirmedAt)}`:'Offline — not yet confirmed'}
export function unreadMessageCount(messages=[],lastSeenMessageAt=null){if(!lastSeenMessageAt)return messages.length;return messages.filter(m=>String(m.createdAt)>String(lastSeenMessageAt)).length}
export function buildLocalSecretWarning(cases=[]){return cases.some(c=>!terminal.has(c.status)&&c.accessSecret)?'Whole Story V4 cannot recover these live-case access secrets if you remove them from this device.':''}
export const isTerminalLiveCase=c=>terminal.has(c?.status);
function format(v){try{return new Date(v).toLocaleString()}catch{return String(v||'')}}
