const fs = require('fs');
let code = fs.readFileSync('project-state.js', 'utf8');

// Replace synchronous reads with async if API is enabled
code = code.replace('function get(){', 'async function get(){');
code = code.replace('const p=read(KEY,null); if(p)return p;', 'if(window.TMAPI && TMAPI.enabled() && TMAPI.hasSession()) { try { const res = await TMAPI.projects(); if(res.projects && res.projects.length>0) return res.projects[0]; } catch(e){} } const p=read(KEY,null); if(p)return p;');

code = code.replace('function save(p){', 'async function save(p){');
code = code.replace('p.updated=new Date().toISOString();write(KEY,p);return p}', 'p.updated=new Date().toISOString();write(KEY,p); if(window.TMAPI && TMAPI.enabled() && TMAPI.hasSession()){ try{ await TMAPI.updateProject(p.id, p); }catch(e){} } return p}');

code = code.replace('function setStage(stage,next,status){', 'async function setStage(stage,next,status){');
code = code.replace('const p=get()', 'const p=await get()');
code = code.replace('return save(p)', 'return await save(p)');

code = code.replace('function addPhase(id){', 'async function addPhase(id){');
code = code.replace('const p=get()', 'const p=await get()');
code = code.replace('return save(p)', 'return await save(p)');

code = code.replace('function removePhase(id){', 'async function removePhase(id){');
code = code.replace('const p=get()', 'const p=await get()');
code = code.replace('return save(p)', 'return await save(p)');

code = code.replace('function qualify(data){', 'async function qualify(data){');
code = code.replace('const p=get()', 'const p=await get()');
code = code.replace('return save(p)', 'return await save(p)');

code = code.replace('function updateChecklist(key,value){', 'async function updateChecklist(key,value){');
code = code.replace('const p=get()', 'const p=await get()');
code = code.replace('return save(p)', 'return await save(p)');

code = code.replace('function addDecision(text){', 'async function addDecision(text){');
code = code.replace('const p=get()', 'const p=await get()');
code = code.replace('return save(p)', 'return await save(p)');

code = code.replace('function sync(){', 'async function sync(){');
code = code.replace('const p=get()', 'const p=await get()');
code = code.replace('if(JSON.stringify(p.selectedPhases)!==JSON.stringify(c)){p.selectedPhases=c;save(p)}', 'if(JSON.stringify(p.selectedPhases)!==JSON.stringify(c)){p.selectedPhases=c;await save(p)}');

fs.writeFileSync('project-state.js', code);
console.log('project-state.js async patch done');

