/* Passive last-link observations only; empty buckets are unknown, never zero SNR. */
(function(root){
 const windows={hour:3600000,day:86400000,week:604800000};
 function median(values){if(!values.length)return null;const sorted=[...values].sort((a,b)=>a-b),i=Math.floor(sorted.length/2);return sorted.length%2?sorted[i]:(sorted[i-1]+sorted[i])/2;}
 function summarize(rows,{now=Date.now(),window='hour',bucketCount=24}={}){
  const duration=windows[window]||windows.hour,count=Math.max(2,Math.min(60,Math.floor(bucketCount)||24)),start=now-duration;
  const samples=(Array.isArray(rows)?rows:[]).filter(r=>r?.type==='packet'&&r.data?.valid===true&&Number.isFinite(r.at)&&r.at>=start&&r.at<=now&&Number.isFinite(r.data.snr));
  const buckets=Array.from({length:count},(_,i)=>({start:start+i*duration/count,end:start+(i+1)*duration/count,count:0,median:null,min:null,max:null}));
  const values=Array.from({length:count},()=>[]);
  for(const r of samples)values[Math.min(count-1,Math.floor((r.at-start)/duration*count))].push(r.data.snr);
  buckets.forEach((b,i)=>{const v=values[i];b.count=v.length;if(v.length){b.median=median(v);b.min=Math.min(...v);b.max=Math.max(...v);}});
  const all=samples.map(r=>r.data.snr),recent=samples.filter(r=>r.at>=now-duration/2).map(r=>r.data.snr),prior=samples.filter(r=>r.at<now-duration/2).map(r=>r.data.snr);
  return {start,end:now,duration,buckets,count:samples.length,median:median(all),min:all.length?Math.min(...all):null,max:all.length?Math.max(...all):null,last:samples.length?Math.max(...samples.map(r=>r.at)):null,delta:recent.length>=5&&prior.length>=5?median(recent)-median(prior):null,priorCount:prior.length,recentCount:recent.length};
 }
 root.NightlinkRFTrends={summarize,windows};if(typeof module!=='undefined')module.exports=root.NightlinkRFTrends;
})(globalThis);
