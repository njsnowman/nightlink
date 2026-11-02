/* Cell-rendered, dithered NIGHTLINK logo and band for the terminal interface.
   Port of the approved mockup generator: 5x7 letters, each pixel two 8x16 character cells, a vertical
   palette ramp, a dark-grey dither shadow and 25/50/75% cell dither patterns. SVG is built with
   createElementNS only (CSP style-src 'self'; no markup strings, no inline styles). */
(function(root){
 'use strict';
 const FONT={N:['10001','11001','10101','10011','10001','10001','10001'],I:['111','010','010','010','010','010','111'],G:['01110','10001','10000','10111','10001','10001','01110'],H:['10001','10001','10001','11111','10001','10001','10001'],T:['11111','00100','00100','00100','00100','00100','00100'],L:['10000','10000','10000','10000','10000','10000','11111'],K:['10001','10010','10100','11000','10100','10010','10001']};
 const RAMP=[['F','#ffffff'],['F','#55ffff'],['D','#55ffff'],['F','#5555ff'],['D','#5555ff'],['M','#5555ff'],['M','#0000aa']];
 const NS='http://www.w3.org/2000/svg';
 // Returns cells {row,col,kind,color}; kind F=full, D=75%, M=50%, L=25% dither.
 function cells(word='NIGHTLINK'){
  const grid=Array.from({length:7},()=>[]);
  for(const ch of word){const glyph=FONT[ch];if(!glyph)continue;for(let r=0;r<7;r++)grid[r].push(...[...glyph[r]].map(Number),0);}
  const width=grid[0].length,map=new Map();
  for(let r=0;r<7;r++)for(let c=0;c<width;c++)if(grid[r][c])for(const k of [0,1])if(!map.has((r+1)+','+(2*c+2+k)))map.set((r+1)+','+(2*c+2+k),['L','#555555']);
  for(let r=0;r<7;r++)for(let c=0;c<width;c++)if(grid[r][c])for(const k of [0,1])map.set(r+','+(2*c+k),RAMP[r]);
  return {columns:2*width+2,rows:8,list:[...map].map(([key,[kind,color]])=>{const [row,col]=key.split(',').map(Number);return {row,col,kind,color};})};
 }
 // Deterministic band (seeded LCG) so the page renders identically every time.
 function band(count=150,seed=3){let s=seed>>>0;const next=()=>(s=(Math.imul(s,1664525)+1013904223)>>>0)/4294967296;const kinds='LMDF',colors=['#0000aa','#5555ff','#00aaaa','#555555','#55ffff'];return Array.from({length:count},(_,i)=>({row:0,col:i,kind:kinds[Math.floor(next()*4)],color:colors[Math.floor(next()*5)]}));}
 const dot={L:(x,y)=>x%2===0&&y%2===0,M:(x,y)=>(x+y)%2===0,D:(x,y)=>!(x%2===1&&y%2===1)};
 function svg(doc,list,columns,rows,label,idPrefix){
  const el=(name,attrs)=>{const n=doc.createElementNS(NS,name);for(const [k,v] of Object.entries(attrs))n.setAttribute(k,String(v));return n;};
  const out=el('svg',{viewBox:`0 0 ${columns*8} ${rows*16}`,width:columns*8,height:rows*16,'shape-rendering':'crispEdges',class:'term-logo-svg'});
  if(label){out.setAttribute('role','img');out.setAttribute('aria-label',label);}else out.setAttribute('aria-hidden','true');
  const defs=el('defs',{}),made=new Set();out.append(defs);
  const pattern=(kind,color)=>{const id=idPrefix+kind+color.slice(1);if(made.has(id))return id;made.add(id);const p=el('pattern',{id,width:8,height:16,patternUnits:'userSpaceOnUse'}),g=el('g',{fill:color});for(let y=0;y<16;y++)for(let x=0;x<8;x++)if(dot[kind](x,y))g.append(el('rect',{x,y,width:1,height:1}));p.append(g);defs.append(p);return id;};
  for(const c of list)out.append(el('rect',{x:c.col*8,y:c.row*16,width:8,height:16,fill:c.kind==='F'?c.color:`url(#${pattern(c.kind,c.color)})`}));
  return out;
 }
 let serial=0;
 function logo(doc=root.document,label='Nightlink'){const c=cells();return svg(doc,c.list,c.columns,c.rows,label,'tl'+(++serial)+'-');}
 function strip(doc=root.document,count=150){return svg(doc,band(count),count,1,'','tb'+(++serial)+'-');}
 const api={FONT,RAMP,cells,band,logo,strip};
 if(typeof module==='object'&&module.exports)module.exports=api;else root.NightlinkTerminalLogo=api;
})(typeof window==='object'?window:globalThis);
