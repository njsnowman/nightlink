const test=require('node:test'),assert=require('node:assert/strict'),F=require('./feedback.js'),R=require('./first-run.js');
test('feedback builds a GitHub new-issue URL with labels, fields and environment, within 2048 characters',()=>{
 const u=new URL(F.issueUrl('bug',{title:'Chat stops',what:'It froze',steps:'1. open',expected:'scrolls'},{version:'0.8.28-rc.62',platform:'Win32',interface:'terminal'}));
 assert.equal(u.origin+u.pathname,'https://github.com/njsnowman/nightlink/issues/new');assert.equal(u.searchParams.get('labels'),'bug');assert.equal(u.searchParams.get('title'),'Chat stops');
 const b=u.searchParams.get('body');for(const s of ['### What happened\nIt froze','### Steps to reproduce\n1. open','**Version:** 0.8.28-rc.62','**Interface:** terminal'])assert.ok(b.includes(s),s);
 const f=new URL(F.issueUrl('feature',{title:'',what:'x'.repeat(5000),why:'y'.repeat(5000)},{}));assert.equal(f.searchParams.get('labels'),'enhancement');
 assert.ok(F.issueUrl('feature',{what:'é'.repeat(5000),why:'"&<>'.repeat(900)},{}).length<=F.MAX);assert.match(f.searchParams.get('body'),/shortened/);
});
test('first-run guide is for new installs only and has four steps with help links',()=>{
 const st=o=>({getItem:k=>o[k]??null});assert.equal(R.isNew(st({})),true);assert.equal(R.isNew(st({'meshline.profile':'{}'})),false);assert.equal(R.isNew(st({[R.KEY]:'done'})),false);
 assert.equal(R.STEPS.length,4);assert.ok(R.STEPS.every(s=>s.help.length));assert.ok(R.STEPS.some(s=>s.connect));
 const topics=require('fs').readFileSync(require('path').join(__dirname,'user-guide.js'),'utf8');for(const s of R.STEPS)for(const [,t] of s.help)assert.ok(topics.includes("title:'"+t+"'"),t);
});
