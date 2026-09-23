import {analyzeStoryV3} from '../core/shared-analyzer.mjs';
export async function analyze(story,options={}){
  try{const r=await fetch('./api/analyze',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({story,options})});if(!r.ok)throw new Error('analyze_failed');return await r.json()}catch{return analyzeStoryV3(story,options)}
}
export function applySignalEdit(signals,{id,status,label}){return (signals||[]).map(s=>s.id===id?{...s,...(status?{status}:{}),...(label?{label}:{}),source:status==='corrected'?'user_added':s.source}:s)}
