/* Terminal custom colours (Settings > Custom colours). Overrides four VGA tokens with the operator's choice, stored
   per profile. A colour is accepted only if text keeps at least 4.5:1 contrast: text tokens against black,
   and white title text against the bar colour. Applied with CSSOM setProperty, so CSP is unchanged. */
(function(root){
 'use strict';
 const KEY='nightlink.term-custom';
 const TOKENS=[['--t-white','Body text','#ffffff','text'],['--t-bright-cyan','Accent and frames','#55ffff','text'],['--t-yellow','Highlights and own nick','#ffff55','text'],['--t-blue','Title and status bars','#0000aa','bar']];
 const hex=v=>/^#[0-9a-f]{6}$/i.test(String(v||''))?String(v).toLowerCase():null;
 function lum(h){return [1,3,5].map(i=>parseInt(h.slice(i,i+2),16)/255).map(v=>v<=.03928?v/12.92:((v+.055)/1.055)**2.4).reduce((t,v,i)=>t+v*[.2126,.7152,.0722][i],0);}
 function ratio(a,b){const x=lum(a),y=lum(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);}
 // Contrast that matters for each token: text tokens on black; bar token behind white text.
 const check=(token,value)=>{const t=TOKENS.find(x=>x[0]===token),v=hex(value);if(!t||!v)return {ok:false,ratio:0};const r=t[3]==='bar'?ratio('#ffffff',v):ratio(v,'#000000');return {ok:r>=4.5,ratio:Math.round(r*100)/100};};
 function read(storage){try{const o=JSON.parse(storage?.getItem(KEY)||'{}');const out={};for(const [t] of TOKENS)if(hex(o[t])&&check(t,o[t]).ok)out[t]=hex(o[t]);return out;}catch{return {};}}
 const core={KEY,TOKENS,ratio,check,read};
 if(typeof module==='object'&&module.exports){module.exports=core;return;}
 const doc=root.document;
 function apply(custom=read(root.localStorage)){const s=doc.documentElement.style;for(const [t] of TOKENS){if(custom[t])s.setProperty(t,custom[t]);else s.removeProperty(t);}}
 function save(custom){try{root.localStorage.setItem(KEY,JSON.stringify(custom));}catch{}apply(custom);}
 apply();root.addEventListener('storage',e=>{if(e.key===KEY)apply();});
 function mount(after){const grid=after?.closest('.settings-grid')||doc.querySelector('.settings-grid');if(!grid||grid.querySelector('#term-custom-setting'))return;
  const box=doc.createElement('fieldset');box.id='term-custom-setting';box.className='accent-setting interface-setting term-custom';const legend=doc.createElement('legend');legend.textContent='Custom colours';box.append(legend);
  const custom=read(root.localStorage);
  for(const [token,label,def] of TOKENS){const row=doc.createElement('label');row.className='term-custom-row';const input=doc.createElement('input');input.type='color';input.value=custom[token]||def;input.dataset.token=token;input.setAttribute('aria-label',label);
   const note=doc.createElement('small');note.className='term-custom-ratio';const show=v=>{const c=check(token,v);note.textContent=c.ratio.toFixed(2)+':1'+(c.ok?'':' · too low, not applied');note.dataset.ok=c.ok?'yes':'no';return c.ok;};show(input.value);
   input.oninput=()=>{const next=read(root.localStorage);if(show(input.value)){if(input.value.toLowerCase()===def)delete next[token];else next[token]=input.value.toLowerCase();save(next);}};
   row.append(input,' '+label,note);box.append(row);}
  const reset=doc.createElement('button');reset.type='button';reset.id='term-custom-reset';reset.textContent='Reset to VGA colours';reset.onclick=()=>{save({});box.querySelectorAll('input[type=color]').forEach(i=>{const d=TOKENS.find(t=>t[0]===i.dataset.token)[2];i.value=d;i.dispatchEvent(new Event('input'));});};
  const hint=doc.createElement('small');hint.textContent='Changes four terminal colours. A colour is applied only if text keeps at least 4.5:1 contrast. Daylight and High contrast palettes still apply on top.';
  box.append(reset,hint);if(after)after.after(box);else grid.append(box);}
 root.NightlinkTerminalTheme={...core,apply,save,mount};
})(typeof window==='object'?window:globalThis);
