const fs=require('node:fs'),path=require('node:path');
const rate=44100,duration=6.1,n=Math.ceil(rate*duration),signal=new Float64Array(n);let seed=1717;
const rand=()=>{seed=(1664525*seed+1013904223)>>>0;return seed/2147483648-1;};
function add(start,length,fn,volume=1){const count=Math.floor(length*rate),offset=Math.floor(start*rate);for(let i=0;i<count&&offset+i<n;i++){const t=i/rate,fade=Math.min(1,t/.008,(length-t)/.015);signal[offset+i]+=fn(t,i)*Math.max(0,fade)*volume;}}
const sine=(f,t)=>Math.sin(2*Math.PI*f*t);
add(0,.32,t=>(sine(350,t)+sine(440,t))*.5,.18);
const digits=[[697,1336],[770,1209],[852,1477],[697,1209],[941,1336],[770,1477]];
digits.forEach(([a,b],i)=>add(.4+i*.115,.075,t=>(sine(a,t)+sine(b,t))*.5,.22));
add(1.16,.3,t=>(sine(440,t)+sine(480,t))*.5,.13);
add(1.55,.4,t=>sine(2100,t)*(Math.floor(t/.075)%2?-.9:1),.16);
let phase=0,filtered=0;
add(1.95,1.48,(t,i)=>{const bit=Math.floor(t*38),f=[1200,1800,2200,1500,2400,1700,2100][bit%7];phase+=2*Math.PI*f/rate;filtered=.52*filtered+.48*rand();const pulse=.72+.28*sine(73,t);return (.68*Math.sin(phase+.55*sine(210,t))+.3*filtered)*pulse;},.2);
// The chatter becomes a continuous rising energy tone before the shot.
phase=0;filtered=0;
add(3.05,1.34,(t)=>{const u=t/1.34,f=1150+4600*u*u;phase+=2*Math.PI*f/rate;filtered=.75*filtered+.25*rand();return (Math.sin(phase+.8*Math.sin(phase*.503))*.58+filtered*.32)*(.15+.85*u)*Math.sin(Math.PI*u*.82);},.24);
const shotStart=4.25,shotLength=.92;phase=0;filtered=0;
const shot=new Float64Array(Math.ceil(shotLength*rate));
for(let i=0;i<shot.length;i++){const t=i/rate,f=155+4200*Math.exp(-t*11);phase+=2*Math.PI*f/rate;filtered=.6*filtered+.4*rand();const attack=Math.min(1,t/.002);shot[i]=(Math.sin(phase+1.7*Math.sin(phase*.497))*.72+filtered*.24)*Math.exp(-t*5.9)*attack;}
add(shotStart,shotLength,(_t,i)=>shot[i],.43);
for(const [delay,vol] of [[.09,.19],[.19,.12],[.32,.07],[.49,.04],[.71,.02]])add(shotStart+delay,shotLength,(_t,i)=>shot[i],vol);
let peak=0,sum=0;for(const s of signal){peak=Math.max(peak,Math.abs(s));sum+=s*s;}
const gain=Math.min(1,.72/peak),buffer=Buffer.alloc(44+n*2);buffer.write('RIFF',0);buffer.writeUInt32LE(36+n*2,4);buffer.write('WAVEfmt ',8);buffer.writeUInt32LE(16,16);buffer.writeUInt16LE(1,20);buffer.writeUInt16LE(1,22);buffer.writeUInt32LE(rate,24);buffer.writeUInt32LE(rate*2,28);buffer.writeUInt16LE(2,32);buffer.writeUInt16LE(16,34);buffer.write('data',36);buffer.writeUInt32LE(n*2,40);
for(let i=0;i<n;i++)buffer.writeInt16LE(Math.round(Math.max(-1,Math.min(1,signal[i]*gain))*32767),44+i*2);
const out=path.resolve(__dirname,'../../startup-modem-laser.wav');fs.writeFileSync(out,buffer);console.log(JSON.stringify({file:out,duration,peak:peak*gain,rms:Math.sqrt(sum/n)*gain,originalSynthesis:true}));
