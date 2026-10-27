/* Completion cues are session-only: history and retries must not replay them. */
(function(root){
 function create({enabled=()=>true,quiet=()=>false,play=()=>{}}={}){
  const completed=new Set();
  return {notify(message){
   if(!message?.own||!message.id)return false;
   const success=message.target?.kind==='direct'?!!message.ack:message.target?.kind==='channel'&&message.phase==='broadcast';
   if(!success||completed.has(message.id))return false;
   completed.add(message.id);if(completed.size>1000)completed.delete(completed.values().next().value);
   if(!enabled(message)||quiet())return false;
   try{Promise.resolve(play()).catch(()=>{});}catch{}
   return true;
  }};
 }
 root.NightlinkSendFeedback={create};
 if(typeof module!=='undefined')module.exports={create};
})(globalThis);
