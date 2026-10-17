/* Explicit, provider-authorized raster packs. No bulk tile requests. */
(function(root){
 function validate(pack){if(pack?.format!=='nightlink-map-pack'||pack.version!==1||typeof pack.name!=='string'||!pack.name.trim()||typeof pack.attribution!=='string'||!pack.attribution.trim()||!Array.isArray(pack.tiles)||!pack.tiles.length||pack.tiles.length>12000)throw new Error('Invalid map pack: name, attribution and 1–12000 tiles required.');
  let bytes=0;const seen=new Set();for(const t of pack.tiles){if(!Number.isInteger(t.z)||t.z<0||t.z>19||!Number.isInteger(t.x)||!Number.isInteger(t.y)||t.x<0||t.y<0||t.x>=2**t.z||t.y>=2**t.z)throw new Error('Invalid tile coordinates.');const key=t.z+'/'+t.x+'/'+t.y;if(seen.has(key))throw new Error('Duplicate map tile.');seen.add(key);if(typeof t.image!=='string'||!/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(t.image))throw new Error('Only embedded PNG, JPEG or WebP raster tiles are accepted.');bytes+=t.image.length;if(t.image.length>1500000||bytes>100*1024*1024)throw new Error('Map pack exceeds the 100 MB limit.');}
  return {format:pack.format,version:1,name:pack.name.slice(0,100),attribution:pack.attribution.slice(0,500),importedAt:Date.now(),tiles:pack.tiles.map(t=>({z:t.z,x:t.x,y:t.y,image:t.image}))};
 }
 root.NightlinkMapPack={validate};if(typeof module!=='undefined')module.exports=root.NightlinkMapPack;
})(globalThis);
