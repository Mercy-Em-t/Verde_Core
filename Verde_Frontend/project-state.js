(function(){
  const KEY="tm_project", CART="tm_cart";
  const phases={
    1:{name:"Initiation & Feasibility",customer:"Explore",next:"Complete your project brief"},
    2:{name:"Requirements Analysis",customer:"Define",next:"Confirm what the system needs to do"},
    3:{name:"Architecture & Design",customer:"Design",next:"Review and approve the solution blueprint"},
    4:{name:"Implementation & Cutover",customer:"Build",next:"Prepare for testing and controlled launch"}
  };
  const stages=[
    {id:"explore",label:"Explore",internal:"Initiation & Feasibility",promise:"Understand the opportunity and agree where to start."},
    {id:"define",label:"Define",internal:"Requirements Analysis",promise:"Agree what the solution needs to do and what is in scope."},
    {id:"design",label:"Design",internal:"Architecture & Design",promise:"Turn the agreed needs into a practical blueprint."},
    {id:"build",label:"Build",internal:"Implementation & Cutover",promise:"Turn the approved design into a working system."},
    {id:"launch",label:"Launch",internal:"Production Cutover",promise:"Prepare people, data and the system for controlled use."},
    {id:"improve",label:"Improve",internal:"Post-Implementation Governance",promise:"Review, support and improve the system as needs change."}
  ];
  function read(key,fallback){try{return JSON.parse(localStorage.getItem(key)||"null")??fallback}catch(e){return fallback}}
  function write(key,val){localStorage.setItem(key,JSON.stringify(val))}
  function cart(){return read(CART,[])}
  async function get(){
    if(window.TMAPI && TMAPI.enabled() && TMAPI.hasSession()) { try { const res = await TMAPI.projects(); if(res.projects && res.projects.length>0) return res.projects[0]; } catch(e){} } const p=read(KEY,null); if(p)return p;
    const now=new Date().toISOString();
    return {id:"TM-"+Date.now().toString().slice(-6),created:now,updated:now,name:"Your project",stage:"explore",selectedPhases:cart(),qualifierComplete:false,nextAction:"Tell us what you're trying to achieve",status:"Exploring",engagementId:"",proposalId:"",proposalNumber:"",qualification:{},history:[],decisions:[],checklist:{},notes:[]};
  }
  async function save(p){p.updated=new Date().toISOString();write(KEY,p); if(window.TMAPI && TMAPI.enabled() && TMAPI.hasSession()){ try{ await TMAPI.updateProject(p.id, p); }catch(e){} } return p}
  function record(p,type,data){p.history=p.history||[];p.history.push(Object.assign({at:new Date().toISOString(),type},data||{}));}
  async function setStage(stage,next,status){
    const p=await get(), old=p.stage; p.stage=stage||p.stage; if(next)p.nextAction=next; if(status)p.status=status;
    if(old!==p.stage)record(p,"stage-changed",{from:old,to:p.stage}); return await save(p)
  }
  async function addPhase(id){
    const p=await get(), list=cart(); if(!list.includes(Number(id))) {list.push(Number(id));write(CART,list)}
    p.selectedPhases=list; const meta=phases[id];
    if(meta){p.stage=meta.customer.toLowerCase();p.nextAction=meta.next;p.status="Phase selected";record(p,"phase-selected",{phase:Number(id)})}
    return await save(p)
  }
  async function removePhase(id){const list=cart().filter(x=>Number(x)!==Number(id));write(CART,list);const p=await get();p.selectedPhases=list;record(p,"phase-removed",{phase:Number(id)});return await save(p)}
  async function qualify(data){
    const p=await get();p.name=data.org||"Your project";p.qualifierComplete=true;p.qualification=data;p.selectedPhases=cart();
    let stage="explore",next="Start with a discovery conversation",status="Qualified"; const s=(data.stage||"").toLowerCase();
    if(s.includes("building")){stage="build";next="Review the work already underway";status="Qualified — existing build"}
    else if(s.includes("existing")){stage="explore";next="Assess the existing system and agree an improvement path";status="Qualified — existing system"}
    else if(s.includes("plan")||s.includes("design")){stage="design";next="Review the existing plan and confirm design readiness";status="Qualified — design stage"}
    else if(s.includes("need")||s.includes("know what")){stage="define";next="Define exactly what the system needs to do";status="Qualified — definition"}
    p.stage=stage;p.nextAction=next;record(p,"qualified");return await save(p)
  }
  async function updateChecklist(key,value){const p=await get();p.checklist=p.checklist||{};p.checklist[key]=!!value;record(p,"checklist-updated",{key,value:!!value});return await save(p)}
  async function addDecision(text){const p=await get();p.decisions=p.decisions||[];p.decisions.push({text,at:new Date().toISOString()});return await save(p)}
  async function sync(){const p=await get(),c=cart();if(JSON.stringify(p.selectedPhases)!==JSON.stringify(c)){p.selectedPhases=c;await save(p)}return p}
  window.TM={KEY,CART,phases,stages,read,write,cart,get,save,setStage,addPhase,removePhase,qualify,updateChecklist,addDecision,sync};
})();
