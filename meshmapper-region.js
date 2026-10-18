/* Only region codes are accepted; callers cannot supply a host or URL. */
(function(root){
const storageKey='nightlink.meshmapper-region';
function normalize(value){if(typeof value!=='string'||!/^\s*[a-z]{3}\s*$/i.test(value))throw Error('Enter a three-letter region code, such as CVG or IND.');return value.trim().toUpperCase();}
function base(value='CVG'){return 'https://'+normalize(value).toLowerCase()+'.meshmapper.net/';}
function get(){try{return normalize(root.localStorage.getItem(storageKey)||'CVG');}catch{return 'CVG';}}
function save(value){const code=normalize(value);root.localStorage.setItem(storageKey,code);root.dispatchEvent(new CustomEvent('nightlink-meshmapper-region',{detail:code}));return code;}
root.NightlinkMeshMapperRegion={normalize,base,get,save,storageKey};if(typeof module!=='undefined')module.exports=root.NightlinkMeshMapperRegion;
})(globalThis);
