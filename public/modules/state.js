export const state={currentView:'home',viewParams:{},activeStory:null,analysis:null,route:null,profile:null,resources:[],matches:[],referrals:[],settings:{locale:'en',largeText:false,highContrast:false,reducedMotion:false},navigatorMode:false,legacyCleanupAvailable:false};
const listeners=new Set();
export function subscribe(fn){listeners.add(fn);return()=>listeners.delete(fn)}
export function patchState(patch){Object.assign(state,patch);listeners.forEach(fn=>fn(state));return state}
