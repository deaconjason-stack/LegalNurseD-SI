import {mkdir,readFile,rename,writeFile} from 'node:fs/promises';
import {dirname} from 'node:path';
let counter=0;
const clone=v=>structuredClone(v);
export function createAtomicJsonStore({filePath,initialValue,validate=()=>({ok:true})}){
  let chain=Promise.resolve(); let cache; let loaded=false;
  async function load(){
    if(loaded)return clone(cache);
    try{const text=await readFile(filePath,'utf8'); cache=JSON.parse(text);}
    catch(e){
      if(e.code==='ENOENT'){cache=clone(initialValue); loaded=true; return clone(cache);}
      const err=new Error('store_corrupt'); err.code='STORE_CORRUPT'; err.cause=e; throw err;
    }
    loaded=true; return clone(cache);
  }
  async function persist(value){
    const check=validate(value); if(check===false||check?.ok===false){const e=new Error('store_validation_failed');e.code='STORE_VALIDATION_FAILED';e.details=check?.errors;throw e;}
    await mkdir(dirname(filePath),{recursive:true}); const tmp=`${filePath}.tmp-${process.pid}-${++counter}`; await writeFile(tmp,JSON.stringify(value,null,2)); await rename(tmp,filePath); cache=clone(value); loaded=true; return clone(cache);
  }
  return {
    async read(){return load()},
    async update(mutator){const run=chain.then(async()=>{const current=await load(); const next=await mutator(clone(current)); return persist(next);}); chain=run.catch(()=>{}); return run;},
    async _replaceForTest(value){return persist(value)}
  };
}
