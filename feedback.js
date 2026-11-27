/* Report a bug / Request a feature: builds a pre-filled GitHub issue and opens it in the browser. Owner choice
   (2026-11-27): GitHub issues, no webhook or secret in the app. Nothing is sent until the user submits on GitHub.
   Only the fields shown in the form plus version, platform and interface are included. */
(function(root){
 'use strict';
 const REPO='https://github.com/njsnowman/nightlink/issues/new',MAX=2048;
 const clean=v=>String(v??'').replace(/\r\n?/g,'\n').trim();
 // Returns a URL of at most MAX characters; long text is shortened with a note so the browser link stays valid.
 function issueUrl(kind,fields,env={}){
  const bug=kind==='bug',title=clean(fields.title)||(bug?'Bug: ':'Feature: ');
  const meta=['**Version:** '+(clean(env.version)||'unknown'),'**Platform:** '+(clean(env.platform)||'unknown'),'**Interface:** '+(clean(env.interface)||'unknown')];
  const parts=bug?[['What happened',fields.what],['Steps to reproduce',fields.steps],['What you expected',fields.expected]]:[['What you would like',fields.what],['Why it would help',fields.why]];
  const build=limit=>{const body=parts.map(([h,v])=>{let t=clean(v)||'_Not provided_';if(t.length>limit)t=t.slice(0,limit)+'… (shortened; add the rest on GitHub)';return '### '+h+'\n'+t;}).concat(['### Details',meta.join('\n'),bug?'_Radio name, keys and messages are not included. Attach a support report from Settings > Help if asked._':'']).join('\n\n');
   const q=new URLSearchParams({title,body,labels:bug?'bug':'enhancement'});return REPO+'?'+q.toString();};
  for(let limit=1200;limit>=20;limit=Math.floor(limit*0.7)){const u=build(limit);if(u.length<=MAX)return u;}
  return REPO+'?'+new URLSearchParams({title:title.slice(0,80),labels:bug?'bug':'enhancement'}).toString();
 }
 const core={REPO,MAX,issueUrl};
 if(typeof module==='object'&&module.exports){module.exports=core;return;}
 const doc=root.document;let dialog=null;
 const env=async()=>{let version='';try{version=(await root.meshlineUpdates?.info?.())?.version||'';}catch{}
  return {version:version||doc.querySelector('meta[name=nightlink-version]')?.content||'',platform:(root.navigator?.userAgentData?.platform||root.navigator?.platform||''),interface:root.NightlinkInterface?.current?.()||''};};
 async function openUrl(url){try{if(root.nightlinkLinks){const ok=await root.nightlinkLinks.open(url);if(ok!==false)return true;}}catch{}try{root.open(url,'_blank','noopener');return true;}catch{return false;}}
 function field(form,id,label,area,hint){const l=doc.createElement('label');l.className='feedback-field';l.htmlFor=id;l.textContent=label;const i=doc.createElement(area?'textarea':'input');i.id=id;if(area)i.rows=2;else i.type='text';i.maxLength=area?1500:120;if(hint)i.placeholder=hint;form.append(l,i);return i;}
 function open(kind='bug'){
  if(doc.querySelector('dialog[open]:not(#feedback-dialog)'))doc.querySelector('dialog[open]').close();
  dialog?.remove();dialog=doc.createElement('dialog');dialog.id='feedback-dialog';dialog.className='feedback-dialog';
  const bug=kind==='bug';const h=doc.createElement('h2');h.textContent=bug?'Report a bug':'Request a feature';
  const intro=doc.createElement('p');intro.className='feedback-intro';intro.textContent='This opens a pre-filled GitHub issue in your browser. Review it there and press Submit; nothing is sent from Nightlink. A free GitHub account is needed.';
  const form=doc.createElement('form');form.method='dialog';
  const title=field(form,'feedback-title','Short title',false,bug?'e.g. Chat stops scrolling after reconnect':'e.g. Show battery history');
  const f=bug?{what:field(form,'feedback-what','What happened',true),steps:field(form,'feedback-steps','Steps to reproduce',true,'1. … 2. …'),expected:field(form,'feedback-expected','What you expected',true)}:{what:field(form,'feedback-what','What you would like',true),why:field(form,'feedback-why','Why it would help',true)};
  const note=doc.createElement('small');note.className='feedback-note';note.textContent='Version, operating system and interface are added. Radio name, keys and messages are not.';
  const status=doc.createElement('p');status.className='feedback-status';status.setAttribute('role','status');
  const row=doc.createElement('div');row.className='feedback-actions';const cancel=doc.createElement('button');cancel.type='button';cancel.textContent='Cancel';cancel.onclick=()=>dialog.close();
  const go=doc.createElement('button');go.type='submit';go.className='primary';go.id='feedback-open';go.textContent='Open on GitHub ↗';row.append(cancel,go);
  form.append(note,status,row);dialog.append(h,intro,form);doc.body.append(dialog);
  form.onsubmit=async e=>{e.preventDefault();if(!title.value.trim()&&!f.what.value.trim()){status.textContent='Add a title or a description first.';title.focus();return;}
   const url=issueUrl(kind,{title:title.value,...Object.fromEntries(Object.entries(f).map(([k,v])=>[k,v.value]))},await env());dialog.dataset.url=url;
   status.textContent=(await openUrl(url))?'Opened in your browser. Finish and submit it there.':'Could not open the browser. Copy this link: '+url;};
  dialog.showModal();title.focus();return dialog;}
 root.NightlinkFeedback={...core,open};
})(typeof window==='object'?window:globalThis);
