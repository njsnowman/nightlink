/* Text art for MeshCore messages: plain Unicode items and pure byte helpers. */
(function(root){
'use strict';
const LIMIT=133,encoder=new TextEncoder();
const GROUPS=[
  {name:'Signals',items:['▁▃▅▇ copy','▇▅▃▁ weak','[▁▃▅▇█] full bars','((·)) on air','~ /\\/\\/\\ ~','<<< QRV >>>']},
  {name:'Greetings / 73',items:['[≡≡≡ 73 ≡≡≡]','·· 73 de mesh ··','╔═ GM mesh ═╗','~ GN all, 73 ~','o/ hello mesh','*** QSL tnx ***']},
  {name:'Reactions',items:['<(°o°)>','♪~ ᕕ(ᐛ)ᕗ','(•_•)b','\\(^o^)/','( ˘▽˘)っ♨','¯\\_(ツ)_/¯']},
  {name:'Dividers',items:['░▒▓█▓▒░','─────────────','═══ ◆ ═══','·─·─·─·─·─·','▚▚▚▚▚▚▚▚','┤ mesh ├']}
];
const byteLength=text=>encoder.encode(String(text)).length;
const fits=(text,limit=LIMIT)=>byteLength(text)<=limit;
const list=()=>GROUPS.flatMap(g=>g.items.map(text=>({group:g.name,text,bytes:byteLength(text)})));
const hasControl=text=>/[\u0000-\u001f\u007f-\u009f]/.test(text);
const api={LIMIT,GROUPS,byteLength,fits,list,hasControl};
if(typeof module!=='undefined')module.exports=api;else root.NightlinkTextArt=api;
})(typeof window!=='undefined'?window:globalThis);
