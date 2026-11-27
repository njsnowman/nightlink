const test=require('node:test'),assert=require('node:assert/strict'),T=require('./terminal-theme.js');
test('custom colours keep 4.5:1 contrast or are rejected',()=>{
 assert.ok(T.check('--t-white','#ffffff').ok);assert.equal(T.check('--t-white','#ffffff').ratio,21);
 assert.equal(T.check('--t-white','#333333').ok,false,'dark text on black rejected');
 assert.ok(T.check('--t-blue','#0000aa').ok,'VGA blue bar keeps white text readable');
 assert.equal(T.check('--t-blue','#aaaaff').ok,false,'light bar behind white text rejected');
 assert.equal(T.check('--t-nope','#ffffff').ok,false);assert.equal(T.check('--t-white','red').ok,false);
 const store=new Map([[T.KEY,JSON.stringify({'--t-white':'#333333','--t-yellow':'#FFAA00','--t-blue':'#000080'})]]),s={getItem:k=>store.get(k)??null};
 assert.deepEqual(T.read(s),{'--t-yellow':'#ffaa00','--t-blue':'#000080'});
 assert.deepEqual(T.read({getItem:()=>'not json'}),{});
});
