const DB_NAME='whole-story-v3'; const DB_VERSION=2;
export const STORES=['profiles','stories','signals','timeline_events','resources','referrals','settings','admin_config','live_cases','case_messages','message_drafts'];
let dbPromise;
export function openWholeStoryDb() {
  if (!globalThis.indexedDB) return Promise.reject(new Error('indexeddb_unavailable'));
  if (dbPromise) return dbPromise;
  dbPromise=new Promise((resolve,reject)=>{
    const req=indexedDB.open(DB_NAME,DB_VERSION);
    req.onupgradeneeded=()=>{ const db=req.result; for(const name of STORES) if(!db.objectStoreNames.contains(name)) db.createObjectStore(name,{keyPath:'id'}); };
    req.onsuccess=()=>resolve(req.result); req.onerror=()=>reject(req.error);
  });
  return dbPromise;
}
async function withStore(store,mode,fn){const db=await openWholeStoryDb();return new Promise((resolve,reject)=>{const tx=db.transaction(store,mode);const os=tx.objectStore(store);let req;try{req=fn(os)}catch(e){reject(e);return}req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);});}
export const putRecord=(store,value)=>withStore(store,'readwrite',os=>os.put(value));
export const getRecord=(store,id)=>withStore(store,'readonly',os=>os.get(id));
export const listRecords=(store)=>withStore(store,'readonly',os=>os.getAll());
export const deleteRecord=(store,id)=>withStore(store,'readwrite',os=>os.delete(id));
