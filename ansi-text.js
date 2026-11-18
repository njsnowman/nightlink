/* Renders ANSI SGR and mIRC formatting codes in message text as styled spans. Wire text is unchanged. Content is written with textContent only. */
(function(root){
 const MAX_INPUT=4096,MAX_SEGMENTS=256,CODE=/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f\x9b]/;
 // mIRC colors 0-15 mapped to ANSI 16-color indexes.
 const MIRC=[15,0,4,2,9,1,5,3,11,10,6,14,12,13,8,7];
 const RGB=[[0,0,0],[205,0,0],[0,205,0],[205,205,0],[0,0,238],[205,0,205],[0,205,205],[229,229,229],[127,127,127],[255,0,0],[0,255,0],[255,255,0],[92,92,255],[255,0,255],[0,255,255],[255,255,255]];
 const KEYS=['fg','bg','bold','italic','underline','inverse'];
 function nearest(r,g,b){let best=0,score=Infinity;RGB.forEach(([x,y,z],i)=>{const d=(r-x)**2+(g-y)**2+(b-z)**2;if(d<score){score=d;best=i;}});return best;}
 function color256(n){if(!Number.isInteger(n)||n<0||n>255)return null;if(n<16)return n;if(n>=232){const v=8+(n-232)*10;return nearest(v,v,v);}n-=16;const level=v=>v?55+v*40:0;return nearest(level(Math.floor(n/36)),level(Math.floor(n/6)%6),level(n%6));}
 const plain=()=>({fg:null,bg:null,bold:false,italic:false,underline:false,inverse:false});
 function hasCodes(text){return typeof text==='string'&&CODE.test(text);}
 function sgr(state,params){
  const list=params===''?[0]:params.split(/[;:]/).map(v=>v===''?0:Number(v));
  for(let i=0;i<list.length;i++){const p=list[i];
   if(p===0)Object.assign(state,plain());else if(p===1)state.bold=true;else if(p===3)state.italic=true;else if(p===4)state.underline=true;else if(p===7)state.inverse=true;
   else if(p===22)state.bold=false;else if(p===23)state.italic=false;else if(p===24)state.underline=false;else if(p===27)state.inverse=false;
   else if(p>=30&&p<=37)state.fg=p-30;else if(p===39)state.fg=null;else if(p>=40&&p<=47)state.bg=p-40;else if(p===49)state.bg=null;
   else if(p>=90&&p<=97)state.fg=p-82;else if(p>=100&&p<=107)state.bg=p-92;
   else if(p===38||p===48){if(list[i+1]===5){const c=color256(list[i+2]);if(c!==null)state[p===38?'fg':'bg']=c;i+=2;}else if(list[i+1]===2)i+=4;else i=list.length;}
  }
 }
 function strip(text){
  text=typeof text==='string'?text:String(text??'');
  return text.replace(/(?:\x1b\[|\x9b)[0-?]*[ -\/]*[@-~]?/g,'').replace(/\x1b[\]P_^][^\x07\x1b]*(?:\x07|\x1b\\)?/g,'').replace(/\x1b[ -~]?/g,'').replace(/\x03(?:\d{1,2}(?:,\d{1,2})?)?/g,'').replace(/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f-\x9f]/g,'');
 }
 function parse(text){
  text=typeof text==='string'?text:String(text??'');
  const tail=text.length>MAX_INPUT?text.slice(MAX_INPUT):'';if(tail)text=text.slice(0,MAX_INPUT);
  const segments=[],state=plain();let buffer='';
  const flush=()=>{if(!buffer)return;const last=segments.at(-1);if(last&&(segments.length>=MAX_SEGMENTS||KEYS.every(k=>last[k]===state[k])))last.text+=buffer;else segments.push({text:buffer,...state});buffer='';};
  for(let i=0;i<text.length;i++){const ch=text[i],code=ch.charCodeAt(0);
   if(ch==='\x1b'||ch==='\x9b'){
    if(ch==='\x9b'||text[i+1]==='['){let j=i+(ch==='\x9b'?1:2),params='';while(j<text.length&&/[0-?]/.test(text[j]))params+=text[j++];while(j<text.length&&/[ -\/]/.test(text[j]))j++;
     if(j<text.length&&/[@-~]/.test(text[j])){if(text[j]==='m'&&/^[0-9;:]*$/.test(params)){flush();sgr(state,params);}i=j;}else i=j-1;continue;}
    if(/[\]P_^]/.test(text[i+1]||'')){let j=i+2;while(j<text.length&&text[j]!=='\x07'&&!(text[j]==='\x1b'&&text[j+1]==='\\'))j++;i=text[j]==='\x1b'?j+1:j;continue;}
    if(i+1<text.length&&/[ -~]/.test(text[i+1]))i++;continue;
   }
   if(ch==='\x03'){flush();const m=/^(\d{1,2})(?:,(\d{1,2}))?/.exec(text.slice(i+1,i+6));if(!m){state.fg=null;state.bg=null;continue;}const fg=Number(m[1]);state.fg=fg<16?MIRC[fg]:null;if(m[2]!==undefined){const bg=Number(m[2]);state.bg=bg<16?MIRC[bg]:null;}i+=m[0].length;continue;}
   if(ch==='\x02'){flush();state.bold=!state.bold;continue;}
   if(ch==='\x1d'){flush();state.italic=!state.italic;continue;}
   if(ch==='\x1f'){flush();state.underline=!state.underline;continue;}
   if(ch==='\x16'){flush();state.inverse=!state.inverse;continue;}
   if(ch==='\x0f'){flush();Object.assign(state,plain());continue;}
   if((code<32&&ch!=='\n'&&ch!=='\t'&&ch!=='\r')||(code>=0x7f&&code<=0x9f))continue;
   buffer+=ch;
  }
  flush();
  if(tail){const rest=strip(tail);if(rest){const last=segments.at(-1);if(last)last.text+=rest;else segments.push({text:rest,...plain()});}}
  return segments;
 }
 function classes(s){
  const list=['ansi-segment'],fg=s.inverse?(s.bg??'surface'):s.fg,bg=s.inverse?(s.fg??'copy'):s.bg;
  if(fg!==null)list.push('ansi-fg-'+fg);if(bg!==null)list.push('ansi-bg-'+bg);if(s.bold)list.push('ansi-bold');if(s.italic)list.push('ansi-italic');if(s.underline)list.push('ansi-underline');
  return list;
 }
 function render(element,text){
  const doc=element.ownerDocument,fragment=doc.createDocumentFragment();
  for(const s of parse(text)){const c=classes(s);if(c.length===1){fragment.append(doc.createTextNode(s.text));continue;}const span=doc.createElement('span');span.className=c.join(' ');span.textContent=s.text;fragment.append(span);}
  element.replaceChildren(fragment);element.classList.add('ansi-text');return element;
 }
 // Message bodies are paragraphs inside the main chat log and the DM threads. Plain messages are left untouched.
 const SELECTOR='.chat-log p,.dm-thread p';
 function decorate(scope){if(!scope?.querySelectorAll)return;for(const p of scope.querySelectorAll(SELECTOR)){if(p.closest('.reaction-wire-details'))continue;const raw=p.textContent;if(hasCodes(raw))render(p,raw);}}
 function observe(doc){if(!doc?.documentElement||typeof MutationObserver==='undefined')return;let queued=false;const run=()=>{queued=false;decorate(doc);};new MutationObserver(()=>{if(queued)return;queued=true;queueMicrotask(run);}).observe(doc.documentElement,{childList:true,subtree:true,characterData:true});run();}
 root.NightlinkAnsiText={parse,hasCodes,strip,classes,render,decorate,observe};
 if(typeof module!=='undefined')module.exports=root.NightlinkAnsiText;
 if(typeof document!=='undefined'&&typeof window!=='undefined'){if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>observe(document),{once:true});else observe(document);}
})(globalThis);
