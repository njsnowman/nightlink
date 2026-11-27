/* Per-operation map view preferences. Kept separate from operation and RF records. */
(function(root){
 'use strict';
 const KEY='nightlink.operations-map-view.v1',MAX_VIEWS=100;
 function valid(value){return !!value&&typeof value==='object'&&!Array.isArray(value)&&Number.isFinite(value.lat)&&value.lat>=-85&&value.lat<=85&&Number.isFinite(value.lon)&&value.lon>=-180&&value.lon<=180&&Number.isFinite(value.zoom)&&value.zoom>=0&&value.zoom<=19;}
 function read(storage,id){if(typeof id!=='string'||!id)return null;try{const state=JSON.parse(storage.getItem(KEY)||'null'),view=state?.version===1&&state.views&&typeof state.views==='object'?state.views[id]:null;return valid(view)?{lat:view.lat,lon:view.lon,zoom:view.zoom}:null;}catch{return null;}}
 function save(storage,id,view){if(typeof id!=='string'||!id||!valid(view))return false;try{const state=JSON.parse(storage.getItem(KEY)||'null'),views=state?.version===1&&state.views&&typeof state.views==='object'?{...state.views}:{};delete views[id];views[id]={lat:view.lat,lon:view.lon,zoom:view.zoom};while(Object.keys(views).length>MAX_VIEWS)delete views[Object.keys(views)[0]];storage.setItem(KEY,JSON.stringify({version:1,views}));return true;}catch{return false;}}
 function capture(map){const center=map.getCenter();return {lat:center.lat,lon:center.lng,zoom:map.getZoom()};}
 function restore(map,storage,id){const view=read(storage,id);if(!view)return false;map.setView([view.lat,view.lon],view.zoom,{animate:false});return true;}
 function bind(map,storage,id){if(typeof id!=='string'||!id)return ()=>{};const persist=()=>save(storage,id,capture(map));map.on('moveend',persist);return ()=>map.off('moveend',persist);}
 root.NightlinkOperationsMapView={KEY,valid,read,save,capture,restore,bind};
 if(typeof module!=='undefined')module.exports=root.NightlinkOperationsMapView;
})(globalThis);
