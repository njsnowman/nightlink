/* Legacy stage fixtures explicitly leave the new project home before navigating. */
module.exports=(page,root)=>async n=>{if(await root.locator('#project-workflow').isHidden()){const plan=root.locator('[data-command-phase="plan"]');if(await plan.count())await plan.click();}await root.locator('#project-workflow').getByRole('button',{name:new RegExp('^'+n+' · ')}).click();};
