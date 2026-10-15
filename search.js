/* Saved-history search has no transport or storage side effects. */
(function(root){
 function dayBoundary(value,end=false){if(!value)return null;if(!/^\d{4}-\d{2}-\d{2}$/.test(value))return NaN;const [y,m,d]=value.split('-').map(Number),date=new Date(y,m-1,d);if(date.getFullYear()!==y||date.getMonth()!==m-1||date.getDate()!==d)return NaN;if(end)date.setDate(date.getDate()+1);return date.getTime()/1000;}
 function mentioned(text,name){if(!name)return false;return [...text.matchAll(/@\[([^\]]+)\]|@([\p{L}\p{N}_-]+)/gu)].some(m=>(m[1]||m[2]).toLocaleLowerCase()===name.toLocaleLowerCase());}
 function search(messages,filters={},resolveContact=()=>null){
  const query=(filters.query||'').trim().toLocaleLowerCase(),from=dayBoundary(filters.from),until=dayBoundary(filters.to,true);
  if(Number.isNaN(from)||Number.isNaN(until)||(from!=null&&until!=null&&from>=until))return{error:'Choose a valid date range. The start date must be on or before the end date.',messages:[]};
  return{error:'',messages:messages.filter(m=>{
   if(typeof m.text!=='string'||!m.target)return false;
   if(query&&!m.text.toLocaleLowerCase().includes(query))return false;
   if(filters.channel&&m.conversation!==filters.channel)return false;
   if(filters.contact&&!(m.target.kind==='direct'&&m.target.key===filters.contact)&&resolveContact(m)!==filters.contact)return false;
   if(from!=null&&(!Number.isFinite(m.timestamp)||m.timestamp<from))return false;
   if(until!=null&&(!Number.isFinite(m.timestamp)||m.timestamp>=until))return false;
   if(filters.mentions&&!mentioned(m.text,filters.selfName))return false;
   return true;
  }).sort((a,b)=>(b.timestamp||0)-(a.timestamp||0))};
 }
 const api={search,dayBoundary,mentioned};if(typeof module!=='undefined')module.exports=api;else root.NightlinkSearch=api;
})(globalThis);
