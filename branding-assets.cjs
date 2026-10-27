'use strict';
// Rebuild the Windows ICO directly from the checked-in vector.
const fs=require('node:fs/promises');
const path=require('node:path');
async function main(){
  const playwright=require(process.env.NIGHTLINK_PLAYWRIGHT||'playwright');
  const browser=await playwright.chromium.launch({headless:true,...(process.env.NIGHTLINK_BROWSER?{executablePath:process.env.NIGHTLINK_BROWSER}:{})});
  try{
    const page=await browser.newPage({deviceScaleFactor:1});
    const svg=await fs.readFile(path.join(__dirname,'icon.svg'),'utf8');
    const sizes=[16,20,24,32,40,48,64,128,256],images=[];
    for(const size of sizes){
      await page.setViewportSize({width:size,height:size});
      await page.setContent('<style>html,body{margin:0;background:transparent}svg{display:block;width:100vw;height:100vh}</style>'+svg);
      images.push(await page.screenshot({type:'png',omitBackground:true}));
    }
    const header=Buffer.alloc(6+sizes.length*16);header.writeUInt16LE(1,2);header.writeUInt16LE(sizes.length,4);
    let offset=header.length;
    sizes.forEach((size,i)=>{const at=6+i*16;header[at]=size===256?0:size;header[at+1]=size===256?0:size;header.writeUInt16LE(1,at+4);header.writeUInt16LE(32,at+6);header.writeUInt32LE(images[i].length,at+8);header.writeUInt32LE(offset,at+12);offset+=images[i].length;});
    const destination=path.join(__dirname,'icon.ico'),temp=destination+'.next';
    await fs.writeFile(temp,Buffer.concat([header,...images]));await fs.rename(temp,destination);
    console.log('Signal Bridge ICO generated: '+sizes.join(', ')+' px');
  }finally{await browser.close();}
}
main().catch(error=>{console.error(error);process.exitCode=1;});
