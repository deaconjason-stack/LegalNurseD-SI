import { activeSignals } from './shared-schema.mjs';
const routeCopy = {
  safety:{title:'Get immediate help first',owner:'Emergency or crisis support',why:'An urgent safety concern takes priority over routine navigation.',actions:['Use the urgent guidance shown above now.','Stay with another person if you can safely do so.','Do not wait for this app if immediate professional help is needed.']},
  food:{title:'Secure food for today first',owner:'Food access or community navigation service',why:'An immediate basic need should be stabilized before lower-priority navigation.',actions:['Use a same-day food resource if available.','Ask whether pickup, delivery, or emergency food is available.','Then return to the other needs in your story.']},
  housing:{title:'Protect safe housing first',owner:'Housing or emergency shelter navigator',why:'Immediate housing instability can make every other need harder to address.',actions:['Contact a housing/shelter navigator.','State whether you need help tonight or face a deadline.','Ask for one named next action and follow-up time.']},
  health_care:{title:'Connect with the care team',owner:'Clinic, nurse line, pharmacist, or care navigator',why:'A time-sensitive care need is the clearest next step.',actions:['Contact the appropriate care team.','State the need and any barrier together.','Ask what can happen today and when to follow up.']},
  transportation:{title:'Remove the transportation blocker',owner:'Transportation or care-access navigator',why:'Transportation is blocking progress on another important need.',actions:['Ask the destination or care team about transportation support.','Confirm pickup/service area details before relying on it.','Keep an alternative contact if the first option fails.']},
  financial_pressure:{title:'Start with financial navigation',owner:'Benefits, utility, or community resource navigator',why:'Financial pressure is blocking progress and deserves a concrete navigation step.',actions:['Name the bill or deadline first.','Ask which program or person handles it.','Record the contact name and next follow-up date.']},
  access_logistics:{title:'Start with an access navigator',owner:'Benefits, resource, or case-navigation contact',why:'The clearest obstacle is getting through a system.',actions:['Name the blocker in one sentence.','Ask for the exact person, program, or document needed next.','Record the promised next action.']},
  emotional_load:{title:'Add a trusted human support connection',owner:'Trusted support person or qualified professional',why:'The emotional load is significant enough to deserve support alongside practical steps.',actions:['Choose a trusted person or qualified support option.','Share what is hardest right now.','If safety concerns emerge, use urgent professional help.']},
  faith_meaning:{title:'Connect with trusted spiritual support',owner:'Pastoral contact, chaplain, or trusted faith/community support',why:'Your words center faith, meaning, or hope.',actions:['Share what you are carrying without pressure for certainty.','Ask for presence and practical support.','Use appropriate professional care too when health or safety needs are present.']},
  support_network:{title:'Start with a warm human connection',owner:'Community navigator or trusted support person',why:'A supportive person can help coordinate the next step.',actions:['Choose one trusted person or navigator.','Share only what you want them to know.','Ask for one named next action.']}
};
const basicRisk = s => (s.domain==='food' && /today|no food|hungry/i.test(s.label||'')) || (s.domain==='housing' && /tonight|homeless|unsheltered|evict/i.test(s.label||''));
export function routeStory({signals=[],urgent=false,urgentLabel=null,urgentMessage=null,userPriority=null}={}) {
  const active = activeSignals(signals);
  if (urgent) return {...routeCopy.safety, priorityDomain:'safety',why:urgentLabel || routeCopy.safety.why,actions:[urgentMessage || routeCopy.safety.actions[0],...routeCopy.safety.actions.slice(1)],userOverrideAllowed:false};
  const immediate = active.find(basicRisk); if (immediate) return {...(routeCopy[immediate.domain]||routeCopy.support_network),priorityDomain:immediate.domain,userOverrideAllowed:true};
  const hasHealth = active.some(s=>s.domain==='health_care');
  const blocker = active.find(s=>['transportation','access_logistics'].includes(s.domain));
  if (hasHealth && blocker) return {...routeCopy[blocker.domain],priorityDomain:blocker.domain,userOverrideAllowed:true};
  if (userPriority && active.some(s=>s.domain===userPriority)) return {...(routeCopy[userPriority]||routeCopy.support_network),priorityDomain:userPriority,userOverrideAllowed:true};
  const order=['housing','food','health_care','transportation','financial_pressure','access_logistics','emotional_load','family_social','employment_education','faith_meaning','support_network'];
  const choice = order.find(d=>active.some(s=>s.domain===d)) || 'support_network';
  const copy = routeCopy[choice] || {...routeCopy.support_network,why:`Your ${choice.replaceAll('_',' ')} need is the clearest next step.`};
  return {...copy,priorityDomain:choice,userOverrideAllowed:true};
}
