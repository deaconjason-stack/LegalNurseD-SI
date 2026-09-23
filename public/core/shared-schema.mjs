const uuid = () => globalThis.crypto?.randomUUID?.() ?? `ws_${Date.now()}_${Math.random().toString(36).slice(2)}`;

export const DOMAINS = Object.freeze([
  'health_care','emotional_load','access_logistics','family_social','faith_meaning','safety',
  'housing','food','transportation','financial_pressure','employment_education','support_network'
]);
export const SIGNAL_STATUS = Object.freeze(['active','corrected','dismissed']);
export const SIGNAL_SOURCE = Object.freeze(['detected','guided','user_added']);
export const CONFIDENCE = Object.freeze(['low','medium','high']);

export function createSignal({id=uuid(),domain,label,source='detected',confidence='medium',status='active',evidence='',createdAt=new Date().toISOString()}) {
  if (!DOMAINS.includes(domain)) throw new TypeError(`Unknown signal domain: ${domain}`);
  if (!SIGNAL_SOURCE.includes(source)) throw new TypeError(`Unknown signal source: ${source}`);
  if (!CONFIDENCE.includes(confidence)) throw new TypeError(`Unknown confidence: ${confidence}`);
  if (!SIGNAL_STATUS.includes(status)) throw new TypeError(`Unknown signal status: ${status}`);
  if (!String(label || '').trim()) throw new TypeError('Signal label is required');
  return {id,domain,label:String(label).trim(),source,confidence,status,evidence:String(evidence || '').trim(),createdAt};
}

export function validateSignal(signal) {
  if (!signal || typeof signal !== 'object') return false;
  return Boolean(signal.id && DOMAINS.includes(signal.domain) && String(signal.label || '').trim() &&
    SIGNAL_SOURCE.includes(signal.source) && CONFIDENCE.includes(signal.confidence) &&
    SIGNAL_STATUS.includes(signal.status) && signal.createdAt);
}

export function activeSignals(signals=[]) { return signals.filter(s => s?.status === 'active' || s?.status === 'corrected'); }
