const groups = {
  health: [
    ['medication|medicine|meds|refill|prescription', 'medication access'],
    ['doctor|physician|clinic|hospital|nurse|care team|appointment', 'care connection'],
    ['pain|hurt|sick|ill|symptom|diagnos|health', 'health concern'],
    ['insurance|medicaid|medicare|coverage', 'health coverage']
  ],
  faith: [
    ['faith|god|jesus|pray|prayer|church|pastor|spiritual|soul', 'faith or spiritual support'],
    ['hope|purpose|meaning|why is this happening|lost', 'meaning or hope']
  ],
  access: [
    ['money|afford|cost|bill|rent|utility|electric|food', 'financial pressure'],
    ['transport|ride|bus|car|uber', 'transportation'],
    ['housing|homeless|evict|shelter', 'housing'],
    ['job|work|employment|income', 'employment'],
    ['form|apply|application|portal|paperwork|waitlist', 'system navigation'],
    ['call|phone|number|who do i contact|who to call', 'contact/navigation']
  ],
  emotional: [
    ['overwhelm|overwhelmed|stressed|stress|anxious|anxiety|scared|afraid', 'stress or fear'],
    ['grief|grieving|died|death|loss|lonely|alone', 'grief or isolation'],
    ['tired|exhausted|burned out|burnout|can\'t keep up', 'exhaustion']
  ]
};

const urgent = [
  ['kill myself|suicide|end my life|want to die|hurt myself', 'self-harm risk', 'Call or text 988 now in the U.S. If there is immediate danger, call 911 or go to the nearest emergency department.'],
  ['chest pain|can\'t breathe|cannot breathe|difficulty breathing|not breathing|stroke|seizure|unconscious|passed out', 'possible medical emergency', 'Call 911 or your local emergency number now. Do not wait for this app to route the request.'],
  ['overdose|poisoned|poisoning', 'possible poisoning/overdose', 'Call 911 for severe symptoms. In the U.S., Poison Control is 1-800-222-1222.']
];

function normalize(s) { return s.toLowerCase().replace(/[’]/g, "'"); }
function matchAny(t, expr) { return new RegExp(`\\b(?:${expr})\\b`, 'i').test(t); }
function findSignals(text, entries) {
  const t = normalize(text);
  const out = [];
  for (const [expr, label] of entries) if (matchAny(t, expr)) out.push(label);
  return [...new Set(out)];
}
function sentence(list) {
  if (!list.length) return '';
  if (list.length === 1) return list[0];
  if (list.length === 2) return `${list[0]} and ${list[1]}`;
  return `${list.slice(0,-1).join(', ')}, and ${list.at(-1)}`;
}

export function analyzeStory(story, preferences={}) {
  const t = normalize(story);
  const emergency = urgent.find(([expr]) => matchAny(t, expr));
  const signals = Object.fromEntries(Object.entries(groups).map(([k,v]) => [k, findSignals(story, v)]));
  const present = Object.fromEntries(Object.entries(signals).map(([k,v]) => [k, v.length > 0]));

  const lenses = {
    health: present.health
      ? `I hear ${sentence(signals.health)}. That deserves a real care or navigation response, not just another form.`
      : `I don't hear a clear medical or care need in what you shared. That may be exactly right — not every hard moment is a health problem.`,
    faith: present.faith
      ? `I hear ${sentence(signals.faith)} in this too. Spiritual support can sit alongside practical action without replacing medical care, safety steps, or your own discernment.`
      : `You didn't frame this as a spiritual issue. I won't force a faith interpretation onto your story.`,
    access: present.access
      ? `I hear ${sentence(signals.access)} creating friction. The next step should reduce that friction instead of sending you to another generic portal.`
      : `I don't hear a clear money, transportation, housing, benefits, or system-navigation barrier yet.`,
    emotional: present.emotional
      ? `I also hear ${sentence(signals.emotional)}. That matters because the burden of navigating a system can be part of the problem itself.`
      : `I don't want to guess at how you feel. Your words matter more than an app filling in emotions for you.`
  };

  let route = {
    title: 'Start with a warm human connection',
    owner: 'Community navigator or trusted support person',
    why: 'Your story does not fit one narrow lane, so the best first move is a person who can listen and help decide what comes next.',
    actions: [
      'Choose one person or organization you trust to receive the whole story.',
      'Use the share summary below instead of retelling everything from the beginning.',
      'Ask for one named next action and one named person responsible for it.'
    ]
  };

  if (present.health && present.access) route = {
    title: 'Start with care navigation', owner: 'Care navigator, social worker, nurse line, or clinic access team',
    why: 'A health need and an access barrier are tangled together. Solving only one side may leave the real problem in place.',
    actions: ['Contact the care team or health plan navigation line.', 'Say both the health need and the barrier in the first message.', 'Ask who owns the next step and when you should follow up if nothing changes.']
  };
  else if (present.health) route = {
    title: 'Start with the care team', owner: 'Clinic, nurse line, pharmacist, or appropriate healthcare professional',
    why: 'The clearest signal is a health or care need.',
    actions: ['Contact the care team with the concise summary below.', 'Ask what can be done today and what requires an appointment.', 'If symptoms become severe or urgent, use emergency services rather than waiting for a routine reply.']
  };
  else if (present.access) route = {
    title: 'Start with an access navigator', owner: 'Benefits, community resource, social-service, or case-navigation contact',
    why: 'The main obstacle appears to be getting through a system, paying for something, transportation, housing, or another practical barrier.',
    actions: ['Name the blocker in one sentence.', 'Ask for the exact program, person, or document needed next.', 'Write down the contact name, date, and promised next action.']
  };
  else if (present.faith) route = {
    title: 'Start with a trusted spiritual or community person', owner: 'Pastoral contact, chaplain, faith leader, or trusted community support',
    why: 'Your words center meaning, faith, or hope. A person who can sit with that may be the right first connection.',
    actions: ['Share what you are carrying without pressure to make it sound resolved.', 'Ask for presence and practical support, not certainty.', 'If a medical, mental-health, safety, or financial need is also present, connect that need to the appropriate professional too.']
  };

  if (emergency) {
    route = {
      title: 'Get immediate help first', owner: 'Emergency or crisis support', why: emergency[1],
      actions: [emergency[2], 'Stay with another person if you can safely do so.', 'This tool should not delay urgent professional help.']
    };
  }

  const summaryBits = [];
  if (signals.health.length) summaryBits.push(`Health/care: ${sentence(signals.health)}.`);
  if (signals.faith.length) summaryBits.push(`Faith/meaning: ${sentence(signals.faith)}.`);
  if (signals.access.length) summaryBits.push(`Access/practical: ${sentence(signals.access)}.`);
  if (signals.emotional.length) summaryBits.push(`Emotional load: ${sentence(signals.emotional)}.`);
  const cleanStory = story.replace(/\s+/g, ' ').trim();

  return {
    version: '2.0.0', createdAt: new Date().toISOString(), urgent: Boolean(emergency),
    urgentLabel: emergency?.[1] || null, urgentMessage: emergency?.[2] || null,
    lenses, signals, route,
    summary: summaryBits.length ? `${summaryBits.join(' ')} Original story: “${cleanStory.slice(0, 700)}${cleanStory.length > 700 ? '…' : ''}”` : `Original story: “${cleanStory.slice(0, 700)}${cleanStory.length > 700 ? '…' : ''}”`,
    note: 'Whole Story supports listening and navigation. It does not diagnose, prescribe, replace emergency services, or speak for God.'
  };
}

import { createSignal } from './shared-schema.mjs';

const v3DomainRules = [
  ['health_care','medication access','medication|medicine|meds|refill|prescription|pharmacy','high'],
  ['health_care','care connection','doctor|physician|clinic|hospital|nurse|care team|appointment','medium'],
  ['health_care','health concern','pain|hurt|sick|ill|symptom|diagnos|health','medium'],
  ['emotional_load','stress or fear','overwhelm|overwhelmed|stressed|stress|anxious|anxiety|scared|afraid','medium'],
  ['emotional_load','grief or isolation','grief|grieving|died|death|loss|lonely|alone','medium'],
  ['access_logistics','system navigation barrier','form|apply|application|portal|paperwork|waitlist|who do i call|different numbers','medium'],
  ['family_social','family or caregiving load','mother|father|parent|child|daughter|son|caregiver|family','low'],
  ['faith_meaning','faith or spiritual support','faith|god|jesus|pray|prayer|church|pastor|spiritual|soul','medium'],
  ['faith_meaning','meaning or hope','hope|purpose|meaning|lost hope','medium'],
  ['housing','housing instability','rent|evict|eviction|homeless|housing|shelter|unsheltered','high'],
  ['food','food access','food|hungry|groceries|meal|nothing to eat|no food','high'],
  ['transportation','transportation barrier','transport|ride|bus|car|uber|lyft|no ride','high'],
  ['financial_pressure','financial pressure','money|afford|cost|bill|rent|utility|electric|behind on|debt','high'],
  ['employment_education','work or education barrier','job|work|employment|income|school|class|training|college','medium'],
  ['support_network','needs human support','support|someone to help|nobody to help|no one to help|trusted person','medium']
];

function extractEvidence(story, expr) {
  const pieces = String(story).split(/(?<=[.!?])\s+/);
  const rx = new RegExp(`\\b(?:${expr})\\b`, 'i');
  const hit = pieces.find(x => rx.test(normalize(x))) || story;
  return String(hit).replace(/\s+/g,' ').trim().slice(0,180);
}

function lensFromSignals(signals, domains, emptyText) {
  const labels = signals.filter(s => domains.includes(s.domain) && s.status !== 'dismissed').map(s => s.label);
  return labels.length ? `I hear ${sentence([...new Set(labels)])}. You can correct or dismiss anything I misunderstood.` : emptyText;
}

export function analyzeStoryV3(story, options={}) {
  const cleanStory = String(story || '').replace(/\s+/g,' ').trim();
  const text = normalize(cleanStory);
  const emergency = urgent.find(([expr]) => matchAny(text, expr));
  const existing = Array.isArray(options.existingSignals) ? options.existingSignals : [];
  const suppressedDomains = new Set(existing.filter(s => s?.status === 'dismissed').map(s => s.domain));
  const keptExisting = existing.filter(s => s?.status === 'active' || s?.status === 'corrected').map(s => {
    try { return createSignal({...s, source:s.source || 'user_added', id:s.id}); } catch { return null; }
  }).filter(Boolean);
  const detected = [];
  for (const [domain,label,expr,confidence] of v3DomainRules) {
    if (suppressedDomains.has(domain)) continue;
    if (matchAny(text, expr)) detected.push(createSignal({domain,label,confidence,evidence:extractEvidence(cleanStory, expr)}));
  }
  if (emergency && !suppressedDomains.has('safety')) detected.push(createSignal({domain:'safety',label:emergency[1],confidence:'high',evidence:extractEvidence(cleanStory, emergency[0])}));
  const seen = new Set();
  const signals = [...keptExisting,...detected].filter(s => {
    const key = `${s.domain}|${s.label.toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key); return true;
  });
  const summaryParts = signals.filter(s => s.status !== 'dismissed').map(s => `${s.domain.replaceAll('_',' ')}: ${s.label}`);
  const lenses = {
    health: lensFromSignals(signals,['health_care'],'I do not hear a clear health or care need yet.'),
    faith: lensFromSignals(signals,['faith_meaning'],'I will not force a spiritual interpretation onto your story.'),
    access: lensFromSignals(signals,['access_logistics','housing','food','transportation','financial_pressure','employment_education'],'I do not hear a clear practical access barrier yet.'),
    emotional: lensFromSignals(signals,['emotional_load','family_social','support_network'],'I will not guess how you feel; your words stay in charge.')
  };
  return {
    version:'3.0.0', createdAt:new Date().toISOString(), urgent:Boolean(emergency), urgentLabel:emergency?.[1] || null,
    urgentMessage:emergency?.[2] || null, signals, lenses,
    summary: summaryParts.length ? `${summaryParts.join('; ')}. Original story: “${cleanStory.slice(0,700)}${cleanStory.length>700?'…':''}”` : `Original story: “${cleanStory.slice(0,700)}${cleanStory.length>700?'…':''}”`,
    note:'Whole Story supports listening and navigation. It does not diagnose, prescribe, replace emergency services, or speak for God.'
  };
}
