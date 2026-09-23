import en from '../locales/en.js';
const dictionaries={en};let locale='en';
export function setLocale(next='en'){locale=String(next||'en');return locale}export function getLocale(){return locale}
export function t(key,vars={}){const dict=dictionaries[locale]||dictionaries.en;let value=dict[key]??dictionaries.en[key]??key;for(const [k,v] of Object.entries(vars))value=value.replaceAll(`{${k}}`,String(v));return value}
export function registerLocale(code,dictionary){dictionaries[code]={...dictionary}}
