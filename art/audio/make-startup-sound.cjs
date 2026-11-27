const fs=require('node:fs'),path=require('node:path');
const rate=44100,duration=2.4,n=Math.ceil(rate*duration),signal=new Float64Array(n);let seed=1717;
const rand=()=>{seed=(1664525*seed+1013904223)>>>0;return seed/2147483648-1;};
function add(start,length,fn,volume=1){const count=Math.floor(length*rate),offset=Math.floor(start*rate);for(let i=0;i<count&&offset+i<n;i++){const t=i/rate,fade=Math.min(1,t/.008,(length-t)/.015);signal[offset+i]+=fn(t,i)*Math.max(0,fade)*volume;}}
const sine=(f,t)=>Math.sin(2*Math.PI*f*t);
add(0,.2,t=>(sine(350,t)+sine(440,t))*.5,.18);
const digits=[[697,1336],[770,1209],[852,1477],[697,1209],[941,1336],[770,1477]];
digits.forEach(([a,b],i)=>add(.24+i*.08,.055,t=>(sine(a,t)+sine(b,t))*.5,.22));
add(.74,.16,t=>(sine(440,t)+sine(480,t))*.5,.13);
add(.94,.22,t=>sine(2100,t)*(Math.floor(t/.075)%2?-.9:1),.16);
let phase=0,filtered=0;
add(1.18,.8,(t,i)=>{const bit=Math.floor(t*38),f=[1200,1800,2200,1500,2400,1700,2100][bit%7];phase+=2*Math.PI*f/rate;filtered=.52*filtered+.48*rand();const pulse=.72+.28*sine(73,t);return (.68*Math.sin(phase+.55*sine(210,t))+.3*filtered)*pulse;},.2);
// Owner request 2026-11-27: modem dial-up only, shortened to about 2.4 s. The handshake runs a little longer and fades out; no rising tone or laser shot.
phase=0;filtered=0;
add(1.98,.36,(t,i)=>{const bit=Math.floor(t*44),f=[1650,1850,1650,2250][bit%4];phase+=2*Math.PI*f/rate;filtered=.6*filtered+.4*rand();return (.7*Math.sin(phase)+.25*filtered)*(1-t/.36);},.16);
let peak=0,sum=0;for(const s of signal){peak=Math.max(peak,Math.abs(s));sum+=s*s;}
const gain=.72/peak,buffer=Buffer.alloc(44+n*2);buffer.write('RIFF',0);buffer.writeUInt32LE(36+n*2,4);buffer.write('WAVEfmt ',8);buffer.writeUInt32LE(16,16);buffer.writeUInt16LE(1,20);buffer.writeUInt16LE(1,22);buffer.writeUInt32LE(rate,24);buffer.writeUInt32LE(rate*2,28);buffer.writeUInt16LE(2,32);buffer.writeUInt16LE(16,34);buffer.write('data',36);buffer.writeUInt32LE(n*2,40);
for(let i=0;i<n;i++)buffer.writeInt16LE(Math.round(Math.max(-1,Math.min(1,signal[i]*gain))*32767),44+i*2);
const out=path.resolve(__dirname,'../../startup-modem.wav');fs.writeFileSync(out,buffer);console.log(JSON.stringify({file:out,duration,peak:peak*gain,rms:Math.sqrt(sum/n)*gain,originalSynthesis:true}));
