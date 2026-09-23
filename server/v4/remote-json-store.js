const clone=value=>value==null?value:structuredClone(value);

function validateValue(validate,value){
  const check=validate(value);
  if(check===false||check?.ok===false){
    const error=new Error('store_validation_failed');
    error.code='STORE_VALIDATION_FAILED';
    error.details=check?.errors;
    throw error;
  }
}

export function createRemoteJsonStore({baseUrl,apiKey,storageSecret,documentKey,initialValue,validate=()=>({ok:true}),fetchImpl=fetch}){
  if(!baseUrl||!apiKey||!storageSecret||!documentKey)throw new Error('remote_store_config_required');
  const root=String(baseUrl).replace(/\/+$/,'');
  let chain=Promise.resolve();
  async function rpc(name,body){
    let response;
    try{
      response=await fetchImpl(`${root}/rest/v1/rpc/${name}`,{
        method:'POST',
        headers:{
          apikey:apiKey,
          authorization:`Bearer ${apiKey}`,
          'content-type':'application/json',
          'x-whole-story-storage-secret':storageSecret
        },
        body:JSON.stringify(body)
      });
    }catch(cause){
      const error=new Error('remote_store_unreachable');
      error.code='REMOTE_STORE_ERROR';
      error.cause=cause;
      throw error;
    }
    const text=await response.text();
    let payload=null;
    if(text){try{payload=JSON.parse(text)}catch{payload=text}}
    if(!response.ok){
      const error=new Error('remote_store_error');
      error.code='REMOTE_STORE_ERROR';
      error.status=response.status;
      error.details=payload;
      throw error;
    }
    return payload;
  }
  async function readRemote(){
    const value=await rpc('whole_story_v4_get_document',{p_key:documentKey});
    const resolved=value==null?clone(initialValue):value;
    validateValue(validate,resolved);
    return clone(resolved);
  }
  async function persist(value){
    validateValue(validate,value);
    const saved=await rpc('whole_story_v4_put_document',{p_key:documentKey,p_value:value});
    return clone(saved==null?value:saved);
  }
  return{
    async read(){return readRemote()},
    async update(mutator){
      const run=chain.then(async()=>{
        const current=await readRemote();
        const next=await mutator(clone(current));
        return persist(next);
      });
      chain=run.catch(()=>{});
      return run;
    },
    async _replaceForTest(value){return persist(value)}
  };
}
