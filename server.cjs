const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
// Serve explicit packaged web assets only, never native modules or profile data.
const assets=new Set(require('./package.json').build.files.filter(file=>typeof file==='string'&&/\.(?:html|js|css|svg|ico|wav|png)$/.test(file)&&!file.includes('..')&&!file.includes('*')));
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.ico':'image/x-icon','.wav':'audio/wav','.png':'image/png'};
function createServer(){return http.createServer((req,res)=>{let name;try{name=new URL(req.url,'http://localhost').pathname;}catch{res.writeHead(400).end();return;}const file=name==='/'?'index.html':name.slice(1);if(!assets.has(file)){res.writeHead(404).end();return;}fs.readFile(path.join(__dirname,file),(error,bytes)=>{if(error){res.writeHead(404).end();return;}res.setHeader('Cache-Control','no-store');res.setHeader('Content-Type',types[path.extname(file)]);res.end(bytes);});});}
if(require.main===module)createServer().listen(4173,'127.0.0.1',()=>console.log('Nightlink development preview: http://127.0.0.1:4173'));
module.exports={createServer};
