const {test}=require('node:test'),assert=require('node:assert/strict'),{isChatMap}=require('./corescope-chat-desktop.cjs');
test('map-only adapter is restricted to the explicitly marked OKI live route',()=>{
 assert.ok(isChatMap('https://map.okimesh.org/#/live?lat=39&nightlinkChatMap=1'));
 for(const url of ['https://map.okimesh.org/#/live','https://map.okimesh.org/#/map?nightlinkChatMap=1','https://map.okimesh.org.evil.test/#/live?nightlinkChatMap=1','http://map.okimesh.org/#/live?nightlinkChatMap=1','https://map.okimesh.org/other#/live?nightlinkChatMap=1','invalid'])assert.equal(isChatMap(url),false,url);
});
