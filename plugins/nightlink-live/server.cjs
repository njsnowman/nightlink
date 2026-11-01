const readline=require('node:readline');
const store=require('./store.cjs');
const PROTOCOL='2025-06-18';
const tools=[
 {name:'nightlink_status',description:'Read the latest local Nightlink connection and RF propagation monitor status. Returns stale status explicitly. No radio activity is initiated.',inputSchema:{type:'object',properties:{},additionalProperties:false}},
 {name:'nightlink_events',description:'Read bounded sanitized Nightlink lifecycle and RF alert events after a cursor. No message, contact, location, or radio identity details are returned.',inputSchema:{type:'object',properties:{since:{type:'integer',minimum:0,description:'Return events with cursor greater than this value.'},limit:{type:'integer',minimum:1,maximum:100,description:'Maximum number of events (default 50).'}},additionalProperties:false}}
];
function response(id,result){return {jsonrpc:'2.0',id,result};}
async function handle(message){
 if(message.method==='notifications/initialized')return null;
 if(message.method==='ping')return response(message.id,{});
 if(message.method==='initialize')return response(message.id,{protocolVersion:PROTOCOL,capabilities:{tools:{}},serverInfo:{name:'nightlink-live',version:'0.1.0'}});
 if(message.method==='tools/list')return response(message.id,{tools});
 if(message.method==='tools/call'){
  const args=message.params?.arguments||{};let value;
  if(message.params?.name==='nightlink_status')value=await store.getStatus();
  else if(message.params?.name==='nightlink_events')value=await store.getEvents({since:args.since??0,limit:args.limit??50});
  else return {jsonrpc:'2.0',id:message.id,error:{code:-32602,message:'Unknown tool.'}};
  return response(message.id,{content:[{type:'text',text:JSON.stringify(value)}],structuredContent:value,isError:false});
 }
 if(message.id!==undefined)return {jsonrpc:'2.0',id:message.id,error:{code:-32601,message:'Method not found.'}};
 return null;
}
const rl=readline.createInterface({input:process.stdin,crlfDelay:Infinity});
rl.on('line',line=>{let request;try{request=JSON.parse(line);}catch{process.stderr.write('Ignored malformed JSON-RPC input.\n');return;}
 handle(request).then(result=>{if(result)process.stdout.write(JSON.stringify(result)+'\n');}).catch(error=>{process.stderr.write(`MCP request failed: ${error.message}\n`);if(request.id!==undefined)process.stdout.write(JSON.stringify({jsonrpc:'2.0',id:request.id,error:{code:-32603,message:'Request failed.'}})+'\n');});
});
