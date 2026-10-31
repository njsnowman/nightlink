/* Snapshot-only bulk removal; each contact still uses verified single-key removal. */
(function(root){
 function plan(contacts,favorites,owner){const seen=new Set(),remove=[],keep=[];for(const c of contacts||[]){if(!/^[a-f0-9]{64}$/.test(c?.key||'')||c.key===owner||seen.has(c.key))continue;seen.add(c.key);(favorites.has(c.key)?keep:remove).push({key:c.key,name:c.name||c.key});}return{remove,keep};}
 async function run({keys,guard,protectedKey,present,remove,progress=()=>{}}){
  const result={removed:0,skipped:0,total:keys.length,state:'complete',error:null};
  try{for(const key of keys){guard();if(protectedKey(key)||!present(key)){result.skipped++;progress({...result});continue;}
   await remove(key,{guard:()=>{guard();if(protectedKey(key)||!present(key)){const e=Error('Contact became protected or unavailable.');e.code='BULK_CONTACT_SKIP';throw e;}}}).then(()=>{result.removed++;},e=>{if(e.code==='BULK_CONTACT_SKIP')result.skipped++;else throw e;});progress({...result});
  }}catch(e){result.state=e.code==='BULK_CONTACT_STOP'?'stopped':'failed';result.error=e.message;}
  return result;
 }
 root.NightlinkBulkContactRemoval={plan,run};if(typeof module!=='undefined')module.exports=root.NightlinkBulkContactRemoval;
})(globalThis);
