/* Writes the chrome NIGHTLINK logo from terminal-logo.js as ANSI art: two logo pixels per character cell using
   CP437 half blocks (▀ ▄ █), classic 16-color SGR, dithered shadow as ▒. Outputs CP437 (.ans), UTF-8 (.utf8.ans) and
   plain text (.txt). Usage: node art/ansi/make-chrome.cjs */
const fs=require('node:fs'),path=require('node:path'),logo=require('../../terminal-logo.js');
// Classic ANSI.SYS codes: bright foregrounds use bold (1;3x); backgrounds are limited to 40-47, so a bright lower
// half-pixel is drawn with the nearest normal background (no iCE colors).
const SGR={'#ffffff':'1;37','#55ffff':'1;36','#00aaaa':'36','#5555ff':'1;34','#0000aa':'34','#555555':'1;30'};
const BG={'#ffffff':47,'#55ffff':46,'#00aaaa':46,'#5555ff':44,'#0000aa':44,'#555555':40};
const c=logo.chrome(),px=Array.from({length:c.rows+(c.rows%2)},()=>Array(c.columns).fill(null));
for(const p of c.list)px[p.row][p.col]=p;
let ans='',txt='';
for(let r=0;r<px.length;r+=2){
 for(let x=0;x<c.columns;x++){
  const top=px[r][x],bot=px[r+1]?.[x],solid=p=>p&&p.kind==='F';
  let ch=' ',seq='\x1b[0m';
  if(solid(top)&&solid(bot)){if(top.color===bot.color){ch='█';seq=`\x1b[0;${SGR[top.color]}m`;}else{ch='▀';seq=`\x1b[0;${SGR[top.color]};${BG[bot.color]}m`;}}
  else if(solid(top)){ch='▀';seq=`\x1b[0;${SGR[top.color]}m`;}
  else if(solid(bot)){ch='▄';seq=`\x1b[0;${SGR[bot.color]}m`;}
  else if(top||bot){ch='▒';seq='\x1b[0;1;30m';}
  ans+=seq+ch;txt+=ch;
 }
 ans+='\x1b[0m\r\n';txt+='\n';
}
const out=path.join(__dirname,'nightlink-chrome');
const cp437={'█':0xdb,'▀':0xdf,'▄':0xdc,'▒':0xb1};
fs.writeFileSync(out+'.utf8.ans',ans);
fs.writeFileSync(out+'.ans',Buffer.from([...ans].map(ch=>cp437[ch]??ch.charCodeAt(0))));
fs.writeFileSync(out+'.txt',txt.replace(/ +$/gm,''));
console.log(txt);
