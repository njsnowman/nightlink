const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');

test('#echo retains conversation controls at compact widths',()=>{
  const css=fs.readFileSync('echo-workspace.css','utf8');
  assert.doesNotMatch(css,/\.echo-grid\s+\.conversation-tools\s*\{\s*display\s*:\s*none\s*\}/);
  assert.match(css,/@media\(max-width:850px\)[^{]*\{[^}]*#echo-workspace\s+\.echo-grid\s+\.conversation-tools\s*\{display:flex\}/);
});

test('#echo layout and CoreScope action controls remain defined',()=>{
  const js=fs.readFileSync('echo-workspace.js','utf8');
  for(const action of ['chat','map','split'])assert.ok(js.includes('data-echo-layout=\\"'+action+'\\"'));
  for(const id of ['echo-center','echo-local','echo-reload','echo-expand'])assert.ok(js.includes(id));
});
