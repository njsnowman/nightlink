/* Retained fixtures specify SI assumptions; the UI now takes feet. */
module.exports=(page,name)=>{const node=page.locator('#ops-editor [name="'+name+'"]'),fill=node.fill.bind(node);node.fill=async(value,options)=>{const factor=Number(await node.getAttribute('data-length-factor'));return fill(factor&&value!==''?String(Number(value)*factor/.3048):value,options);};return node;};
