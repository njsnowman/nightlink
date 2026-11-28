const test=require('node:test'),assert=require('node:assert/strict'),N=require('./net-checkin.js');
const s={channel:'net',slot:2,start:1000,roster:[{id:'a',key:'a',name:'Alpha'},{id:'b',key:'b',name:'Bravo'},{id:'c',key:'c',name:'Charlie'}],manual:{}};
const msgs=[{kind:'channel',slot:2,sender:'Alpha',timestamp:900},{kind:'channel',slot:2,sender:'alpha',timestamp:1100},{kind:'channel',slot:1,sender:'Bravo',timestamp:1200},{kind:'channel',slot:2,sender:'Zulu',timestamp:1300},{kind:'channel',slot:2,sender:'X',own:true,timestamp:1400},{kind:'channel',target:{slot:2},sender:'Unknown handle',timestamp:1500}];
test('checks in roster members who post on the net channel after the start',()=>{const keyOf=m=>m.sender==='Unknown handle'?'c':null;const r=N.tally(s,msgs,keyOf);
 assert.deepEqual([...r.checked],[['a',1100],['c',1500]]);assert.deepEqual([...r.others],[['Zulu',1300]]);});
test('manual marks and undo win',()=>{const r=N.tally({...s,manual:{b:1250,a:0}},msgs,()=>null);assert.deepEqual([...r.checked].sort(),[['b',1250]]);});
test('messages after the end are ignored',()=>{const r=N.tally({...s,end:1050},msgs,()=>null);assert.equal(r.checked.size,0);});
test('summary and CSV',()=>{const r=N.tally(s,msgs,()=>null),text=N.summary(s,r,1600);assert.match(text,/1 of 3 checked in · 2 others heard · 10 min/);assert.match(text,/\[x\] \d\d:\d\d  Alpha/);assert.match(text,/\[ \]       {2}Bravo/);
 const c=N.csv(s,r);assert.equal(c.split('\r\n')[0],'"name","status","time"');assert.match(c,/"Bravo","not heard",""/);assert.match(c,/"Zulu","other","1970-01-01T00:21:40.000Z"/);});
