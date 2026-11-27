const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
test('stylesheets do not use :has() (#207)',()=>{
 const bad=fs.readdirSync(__dirname).filter(f=>f.endsWith('.css')&&fs.readFileSync(path.join(__dirname,f),'utf8').includes(':has('));
 assert.deepEqual(bad,[]);
});
test('every generated state class is used and defined',()=>{
 const src=fs.readFileSync(path.join(__dirname,'has-state-rules.js'),'utf8');const g={};new Function('window',src)(g);
 const css=fs.readdirSync(__dirname).filter(f=>f.endsWith('.css')).map(f=>fs.readFileSync(path.join(__dirname,f),'utf8')).join('\n');
 for(const [cls] of g.NightlinkHasRules)assert.ok(css.includes('.'+cls),cls);
 for(const cls of new Set(css.match(/nlh-\d+/g)))assert.ok(g.NightlinkHasRules.some(r=>r[0]===cls),cls);
});
test('pages load the state script before stylesheets apply to app markup',()=>{
 for(const f of ['index.html','dm.html','security-lock.html']){const h=fs.readFileSync(path.join(__dirname,f),'utf8');assert.ok(h.indexOf('has-state-rules.js')>0&&h.indexOf('has-state-rules.js')<h.indexOf('has-state.js')&&h.indexOf('has-state.js')<h.indexOf('<body'),f);}
});
