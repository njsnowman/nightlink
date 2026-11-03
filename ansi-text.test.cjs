const {test}=require('node:test'),assert=require('node:assert/strict'),ansi=require('./ansi-text.js');
const text=list=>list.map(s=>s.text).join('');

test('plain text has no codes and stays one plain segment',()=>{
 assert.equal(ansi.hasCodes('hello @[Peer] https://example.com'),false);
 assert.deepEqual(ansi.parse('hello'),[{text:'hello',fg:null,bg:null,bold:false,italic:false,underline:false,inverse:false}]);
 assert.equal(ansi.hasCodes('line\nnext\ttab'),false);
});

test('ANSI SGR colors, attributes and reset',()=>{
 const s=ansi.parse('\x1b[1;31mred\x1b[0m plain \x1b[4;92;44mx\x1b[24;39;49my\x1b[3m\x1b[7mz\x1b[23;27mw');
 assert.equal(text(s),'red plain xyzw');
 assert.deepEqual([s[0].fg,s[0].bold],[1,true]);
 assert.deepEqual([s[1].text,s[1].fg,s[1].bold],[' plain ',null,false]);
 assert.deepEqual([s[2].fg,s[2].bg,s[2].underline],[10,4,true]);
 assert.deepEqual([s[3].text,s[3].fg,s[3].bg,s[3].underline,s[3].bold],['y',null,null,false,false]);
 assert.deepEqual([s[4].italic,s[4].inverse],[true,true]);
 assert.deepEqual([s[5].italic,s[5].inverse],[false,false]);
 assert.equal(ansi.parse('\x1b[1mA\x1b[22mB')[1].bold,false);
 assert.equal(ansi.parse('\x1b[103mA')[0].bg,11);
 assert.equal(ansi.parse('\x1b[1mA\x1b[mB')[1].bold,false);
});

test('256-color codes map to the nearest of 16',()=>{
 assert.equal(ansi.parse('\x1b[38;5;9mA')[0].fg,9);
 assert.equal(ansi.parse('\x1b[38;5;196mA')[0].fg,9);
 assert.equal(ansi.parse('\x1b[48;5;21mA')[0].bg,4);
 assert.equal(ansi.parse('\x1b[38;5;231mA')[0].fg,15);
 assert.equal(ansi.parse('\x1b[38;5;232mA')[0].fg,0);
 assert.equal(ansi.parse('\x1b[38;5;999mA')[0].fg,null);
 assert.equal(ansi.parse('\x1b[38;2;1;2;3;1mA')[0].bold,true);
});

test('mIRC colors, toggles and reset',()=>{
 const s=ansi.parse('\x0304red\x03 \x0312,08blue\x0f \x02b\x02 \x1di\x1d\x1fu\x1f\x16r');
 assert.equal(text(s),'red blue b iur');
 assert.equal(s[0].fg,9);
 assert.deepEqual([s[2].fg,s[2].bg],[12,11]);
 assert.equal(s.find(x=>x.text==='b').bold,true);
 assert.equal(s.find(x=>x.text==='i').italic,true);
 assert.equal(s.find(x=>x.text==='u').underline,true);
 assert.equal(s.find(x=>x.text==='r').inverse,true);
 assert.equal(text(ansi.parse('\x03123')),'3');
 assert.equal(ansi.parse('\x034,x')[0].text,',x');
 assert.equal(ansi.parse('\x0399A')[0].fg,null);
});

test('malformed and non-SGR sequences are removed without losing text',()=>{
 assert.equal(text(ansi.parse('a\x1b[2Jb\x1b[1;2Hc\x1b]0;title\x07d\x1bce\x1b[')),'abcde');
 assert.equal(text(ansi.parse('a\x1b[31')),'a');
 assert.equal(text(ansi.parse('x\x00\x07\x08\x7f\x85y')),'xy');
 assert.equal(ansi.parse('\x9b31mA')[0].fg,1);
 assert.equal(text(ansi.parse('a\x1b[?25lb')),'ab');
 assert.equal(text(ansi.parse('\x1b')),'');
 assert.deepEqual(ansi.parse(''),[]);
});

test('markup stays literal text',()=>{
 const raw='\x1b[31m<img src=x onerror=alert(1)><script>alert(2)</script>';
 const s=ansi.parse(raw);
 assert.equal(text(s),'<img src=x onerror=alert(1)><script>alert(2)</script>');
 assert.ok(ansi.classes(s[0]).every(c=>/^ansi-[a-z0-9-]+$/.test(c)));
});

test('strip removes codes',()=>{
 assert.equal(ansi.strip('\x1b[1;31mred\x1b[0m \x0304,01x\x0f\x02y\x1b]0;t\x07z'),'red xyz');
 assert.equal(ansi.strip('plain'),'plain');
});

test('long input is capped and segment count is bounded',()=>{
 const long='\x1b[31m'+'a'.repeat(20000)+'\x1b[32mb';
 const s=ansi.parse(long);assert.equal(text(s),'a'.repeat(20000)+'b');
 const many=Array.from({length:2000},(_,i)=>'\x03'+(i%16)+'x').join('');
 const m=ansi.parse(many);assert.ok(m.length<=256);assert.equal(text(m),'x'.repeat(m.reduce((n,x)=>n+x.text.length,0)));
 const start=Date.now();ansi.parse('\x1b['.repeat(50000));assert.ok(Date.now()-start<1000);
});

test('inverse swaps to class names only',()=>{
 assert.deepEqual(ansi.classes({fg:1,bg:null,bold:false,italic:false,underline:false,inverse:true}),['ansi-segment','ansi-fg-surface','ansi-bg-1']);
 assert.deepEqual(ansi.classes({fg:null,bg:null,bold:true,italic:false,underline:false,inverse:false}),['ansi-segment','ansi-bold']);
});
