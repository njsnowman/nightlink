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
 function svg(doc,list,columns,rows,label,idPrefix,cw=8,ch=16){
  const el=(name,attrs)=>{const n=doc.createElementNS(NS,name);for(const [k,v] of Object.entries(attrs))n.setAttribute(k,String(v));return n;};
  const out=el('svg',{viewBox:`0 0 ${columns*cw} ${rows*ch}`,width:columns*cw,height:rows*ch,'shape-rendering':'crispEdges',class:'term-logo-svg'});
  if(label){out.setAttribute('role','img');out.setAttribute('aria-label',label);}else out.setAttribute('aria-hidden','true');
  const defs=el('defs',{}),made=new Set();out.append(defs);
  const pattern=(kind,color)=>{const id=idPrefix+kind+color.slice(1);if(made.has(id))return id;made.add(id);const p=el('pattern',{id,width:cw,height:ch,patternUnits:'userSpaceOnUse'}),g=el('g',{fill:color});for(let y=0;y<ch;y++)for(let x=0;x<cw;x++)if(dot[kind](x,y))g.append(el('rect',{x,y,width:1,height:1}));p.append(g);defs.append(p);return id;};
  for(const c of list)out.append(el('rect',{x:c.col*cw,y:c.row*ch,width:cw,height:ch,fill:c.kind==='F'?c.color:`url(#${pattern(c.kind,c.color)})`}));
  return out;
 }
 // Chrome logo (BBS pass): 12-pixel letterforms with 3-pixel strokes, each pixel a half cell (8x8), a forward
 // italic lean, a chrome ramp with a sharp horizon through the middle and a dithered dark-grey drop shadow. Same SVG builder; colors stay in the VGA 16-color set.
 const H=12;
 function glyphN(){const g=[];for(let r=0;r<H;r++){const row=[...'...........'];for(const c of [0,1,2,8,9,10])row[c]='#';const d=2+Math.round(r*4.6/(H-1));for(let c=d;c<Math.min(d+3,8);c++)row[c]='#';g.push(row.join(''));}return g;}
 function glyphK(){const g=[];for(let r=0;r<H;r++){const row=[...'...........'];for(const c of [0,1,2])row[c]='#';const x=3+Math.round(Math.abs(r-5.5)*1.1);for(let c=x;c<Math.min(x+3,11);c++)row[c]='#';g.push(row.join(''));}return g;}
 const CHROME_FONT={N:glyphN(),I:Array(H).fill('###'),
  G:['.#########.','###########','###......##','###........','###........','###........','###...#####','###...#####','###.....###','###.....###','###########','.#########.'],
  H:[...Array(5).fill('###.....###'),...Array(2).fill('###########'),...Array(5).fill('###.....###')],
  T:[...Array(2).fill('###########'),...Array(10).fill('....###....')],
  L:[...Array(10).fill('###........'),...Array(2).fill('##########.')],K:glyphK()};
 // Per pixel row: [kind,color]. Sky half white to dark cyan, then a sharp horizon to bright cyan and a blue ground half.
 const CHROME=[['F','#ffffff'],['F','#ffffff'],['F','#55ffff'],['F','#55ffff'],['F','#00aaaa'],['F','#00aaaa'],['F','#55ffff'],['F','#5555ff'],['F','#5555ff'],['F','#5555ff'],['F','#0000aa'],['F','#0000aa']];
 function chrome(word='NIGHTLINK'){
  const rows=Array.from({length:H},()=>'');
  for(const ch of word){const g=CHROME_FONT[ch];if(!g)continue;for(let r=0;r<H;r++)rows[r]+=g[r]+'...';}
  const lean=r=>Math.floor((H-1-r)/6),width=rows[0].length+lean(0)+3,map=new Map(),key=(r,c)=>r+','+c,on=new Set();
  for(let r=0;r<H;r++)for(let c=0;c<rows[r].length;c++)if(rows[r][c]==='#')on.add(key(r,c+lean(r)));
  for(const k of on){const [r,c]=k.split(',').map(Number);
   if(!on.has(key(r+1,c+1)))map.set(key(r+1,c+1),['M','#555555']);}
  for(const k of on){const [r]=k.split(',').map(Number);map.set(k,CHROME[r]);}
  return {columns:width,rows:H+1,list:[...map].map(([k,[kind,color]])=>{const [row,col]=k.split(',').map(Number);return {row,col,kind,color};})};
 }
 // Owner-supplied logo (0.8.28-rc.6): terminal-logo-art.js holds 240 x 39 VGA pixels generated by
 // art/ansi/make-logo-art.py. Runs of one color on a row become one rect; index 0 is transparent.
 const VGA=['#000000','#0000aa','#00aa00','#00aaaa','#aa0000','#aa00aa','#aa5500','#aaaaaa','#555555','#5555ff','#55ff55','#55ffff','#ff5555','#ff55ff','#ffff55','#ffffff'];
 function runs(art){const out=[];art.rows.forEach((row,y)=>{let x=0;while(x<row.length){const v=row[x];let e=x+1;while(e<row.length&&row[e]===v)e++;if(v!=='0')out.push({x,y,w:e-x,color:VGA[parseInt(v,16)]});x=e;}});return out;}
 function pixelArt(doc,art,label,px=4){
  const el=(name,attrs)=>{const n=doc.createElementNS(NS,name);for(const [k,v] of Object.entries(attrs))n.setAttribute(k,String(v));return n;};
  const out=el('svg',{viewBox:`0 0 ${art.width*px} ${art.height*px}`,width:art.width*px,height:art.height*px,'shape-rendering':'crispEdges',class:'term-logo-svg term-logo-art'});
  out.setAttribute('role','img');out.setAttribute('aria-label',label);
  for(const r of runs(art))out.append(el('rect',{x:r.x*px,y:r.y*px,width:r.w*px,height:px,fill:r.color}));
  return out;
 }
 let serial=0;
 function logo(doc=root.document,label='Nightlink'){if(root.NightlinkEventBrand)return root.NightlinkEventBrand.logo(doc);const art=root.NightlinkLogoArt;if(art&&Array.isArray(art.rows))return pixelArt(doc,art,label);const c=chrome();return svg(doc,c.list,c.columns,c.rows,label,'tl'+(++serial)+'-',8,8);}
 function strip(doc=root.document,count=150){return svg(doc,band(count),count,1,'','tb'+(++serial)+'-');}
 // Startup lock (terminal interface): the logo sits above the unlock card. Presentation only.
 if(root.document&&!(typeof module==='object'&&module.exports))root.document.addEventListener('DOMContentLoaded',()=>{
  const d=root.document,card=d.querySelector('.security-lock-card');
  if(!card||d.documentElement.dataset.interface!=='terminal'||d.querySelector('.term-lock-logo'))return;
  const wrap=d.createElement('div');wrap.className='term-lock-logo';wrap.append(logo(d,'Nightlink'));card.before(wrap);
 });
 const api={FONT,RAMP,cells,CHROME_FONT,CHROME,chrome,VGA,runs,pixelArt,band,logo,strip};
 if(typeof module==='object'&&module.exports)module.exports=api;else root.NightlinkTerminalLogo=api;
})(typeof window==='object'?window:globalThis);
