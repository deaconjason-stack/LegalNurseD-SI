// Browser fallback mirrors the server analyzer enough to keep the app usable offline.
const lex = {
  health:['medication','medicine','meds','refill','prescription','doctor','physician','clinic','hospital','nurse','pain','sick','symptom','diagnos','insurance','medicaid','medicare'],
  faith:['faith','god','jesus','pray','prayer','church','pastor','spiritual','hope','purpose','meaning'],
  access:['money','afford','cost','bill','rent','utility','electric','food','transport','ride','bus','housing','homeless','job','work','income','form','apply','application','portal','paperwork','waitlist','call','phone'],
  emotional:['overwhelm','stressed','stress','anxious','anxiety','scared','afraid','grief','died','death','loss','lonely','alone','tired','exhausted','burnout']
};
const urgent = [
  ['kill myself','Call or text 988 now in the U.S. If there is immediate danger, call 911 or go to the nearest emergency department.'],
  ['suicide','Call or text 988 now in the U.S. If there is immediate danger, call 911 or go to the nearest emergency department.'],
  ["can't breathe",'Call 911 or your local emergency number now. Do not wait for this app to route the request.'],
  ['chest pain','Call 911 or your local emergency number now. Do not wait for this app to route the request.'],
  ['overdose','Call 911 for severe symptoms. In the U.S., Poison Control is 1-800-222-1222.']
];
function hits(text, words){const t=text.toLowerCase();return words.filter(w=>t.includes(w)).slice(0,4)}
export function analyzeOffline(story){
 const s={}; for(const [k,v] of Object.entries(lex)) s[k]=hits(story,v);
 const u=urgent.find(([w])=>story.toLowerCase().includes(w));
 const p=Object.fromEntries(Object.entries(s).map(([k,v])=>[k,v.length>0]));
 const lenses={
  health:p.health?'I hear a health or care need that deserves a real care or navigation response.':'I don’t hear a clear medical or care need in what you shared.',
  faith:p.faith?'I hear faith, meaning, or hope in this too. Spiritual support can sit alongside practical action without replacing professional care or your own discernment.':'You didn’t frame this as a spiritual issue, so I won’t force a faith interpretation onto your story.',
  access:p.access?'I hear a practical or system barrier creating friction. The next step should reduce that friction.':'I don’t hear a clear money, transportation, housing, benefits, or system-navigation barrier yet.',
  emotional:p.emotional?'I also hear emotional weight in the story. That burden matters too.':'I won’t guess at emotions you did not name.'
 };
 let route={title:'Start with a warm human connection',owner:'Community navigator or trusted support person',why:'Your story does not fit one narrow lane.',actions:['Choose one trusted person or organization to receive the whole story.','Use the handoff summary instead of starting over.','Ask for one named next action and one person responsible for it.']};
 if(p.health&&p.access) route={title:'Start with care navigation',owner:'Care navigator, social worker, nurse line, or clinic access team',why:'A health need and an access barrier are tangled together.',actions:['Contact the care team or health plan navigation line.','Say both the health need and the barrier in the first message.','Ask who owns the next step and when to follow up.']};
 else if(p.health) route={title:'Start with the care team',owner:'Clinic, nurse line, pharmacist, or appropriate healthcare professional',why:'The clearest signal is a health or care need.',actions:['Contact the care team with the concise summary.','Ask what can be done today and what requires an appointment.','Use emergency services if symptoms become severe or urgent.']};
 else if(p.access) route={title:'Start with an access navigator',owner:'Benefits, community resource, social-service, or case-navigation contact',why:'The main obstacle appears practical or system-related.',actions:['Name the blocker in one sentence.','Ask for the exact program, person, or document needed next.','Write down the contact name, date, and promised next action.']};
 else if(p.faith) route={title:'Start with a trusted spiritual or community person',owner:'Pastoral contact, chaplain, faith leader, or trusted community support',why:'Your words center faith, meaning, or hope.',actions:['Share what you are carrying without pressure to sound resolved.','Ask for presence and practical support, not certainty.','Connect any medical, safety, or practical need to the appropriate professional too.']};
 if(u) route={title:'Get immediate help first',owner:'Emergency or crisis support',why:'Your words may signal an urgent safety need.',actions:[u[1],'Stay with another person if you can safely do so.','This tool should not delay urgent professional help.']};
 return {version:'2.0.0-offline',createdAt:new Date().toISOString(),urgent:!!u,urgentMessage:u?.[1]||null,lenses,signals:s,route,summary:`Original story: “${story.replace(/\s+/g,' ').slice(0,700)}${story.length>700?'…':''}”`,note:'Whole Story supports listening and navigation. It does not diagnose, prescribe, replace emergency services, or speak for God.'};
}
