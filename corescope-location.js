/* Radio-reported coordinates may be configured or stale; do not claim a live GPS fix. */
window.NightlinkCoreScopeLocation={
 viewport(){const radio=typeof live==='undefined'?null:live.identity;const valid=radio?.located===true&&Number.isFinite(radio.lat)&&Number.isFinite(radio.lon)&&Math.abs(radio.lat)<=85&&Math.abs(radio.lon)<=180&&(radio.lat!==0||radio.lon!==0);return valid?{lat:radio.lat,lon:radio.lon,zoom:11,source:'Radio-reported location'}:{lat:39.44,lon:-85.35,zoom:9,source:'Regional fallback · radio location unavailable'};},
 url(){const p=this.viewport();return 'https://map.okimesh.org/#/live?lat='+p.lat.toFixed(6)+'&lon='+p.lon.toFixed(6)+'&zoom='+p.zoom;},
 signature(){const p=this.viewport();return (typeof live==='undefined'?'':live.identity?.key||'')+':'+p.lat+':'+p.lon+':'+p.zoom;}
};
