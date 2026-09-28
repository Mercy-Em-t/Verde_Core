(function(){
 const KEY='tm_engagements_v1';
 const STATUSES=['Pending kickoff','Kickoff scheduled','In delivery','Awaiting client approval','Phase gated','Completed','On hold'];
 const PHASES={1:'Initiation & Feasibility',2:'Requirements Analysis',3:'Architecture & Design',4:'Implementation & Cutover'};
 const now=()=>new Date().toISOString();
 const read=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'[]')}catch(e){return[]}};
 const write=a=>(localStorage.setItem(KEY,JSON.stringify(a)),a);
 function get(id){return read().find(x=>x.id===id)||null}
 function current(){const p=TM.get(); return read().find(x=>x.projectId===p.id)||null}
 function save(x){x.updated=now();const a=read(),i=a.findIndex(y=>y.id===x.id);if(i<0)a.push(x);else a[i]=x;write(a);return x}
 function activateFromProposal(proposal,project){
   let e=current(); if(e)return e;
   const ids=(proposal.items||[]).map(x=>Number(x.phaseId));
   const phases=ids.map(id=>({phaseId:id,name:PHASES[id],status:'Not started',deliverables:[],approvals:[],tasks:[]}));
   e={id:'ENG-'+Date.now().toString().slice(-7),proposalId:proposal.id,proposalNumber:proposal.number,projectId:project.id,client:proposal.client,status:'Pending kickoff',currentPhaseId:ids[0]||null,phases,kickoff:{scheduled:false,date:'',notes:''},owner:'',nextAction:'Schedule project kickoff',created:now(),updated:now(),activity:[{at:now(),type:'activated',text:'Engagement activated from approved proposal'}]};
   return save(e);
 }
 function transition(id,status){const e=get(id);if(!e||!STATUSES.includes(status))return e;if(window.TMWORKFLOW)TMWORKFLOW.transition(TMWORKFLOW.engagement,e.status,status,'engagement');e.status=status;e.activity=e.activity||[];e.activity.push({at:now(),type:'status',text:'Engagement status changed to '+status});return save(e)}
 function scheduleKickoff(id,date,notes){const e=get(id);if(!e)return null;e.kickoff={scheduled:true,date,notes};e.status='Kickoff scheduled';e.nextAction='Complete kickoff and confirm Phase 1 delivery plan';e.activity.push({at:now(),type:'kickoff',text:'Kickoff scheduled for '+date});return save(e)}
 function updatePhase(id,phaseId,status,deliverable){const e=get(id);if(!e)return null;const p=e.phases.find(x=>x.phaseId===Number(phaseId));if(!p)return e;p.status=status||p.status;if(deliverable)p.deliverables.push({id:'D-'+Date.now().toString().slice(-6),text:deliverable,status:'Pending client review',created:now()});e.currentPhaseId=Number(phaseId);e.nextAction=status==='Awaiting client approval'?'Client to review and approve current phase':'Continue current phase delivery';e.activity.push({at:now(),type:'phase-update',text:PHASES[phaseId]+' → '+p.status});return save(e)}
 function addTask(id,phaseId,text,due){const e=get(id);if(!e)return null;const p=e.phases.find(x=>x.phaseId===Number(phaseId));if(!p)return e;p.tasks.push({id:'T-'+Date.now().toString().slice(-6),text,due:due||'',done:false});e.activity.push({at:now(),type:'task',text:'Task added: '+text});return save(e)}
 function completeTask(id,phaseId,taskId){const e=get(id);if(!e)return null;const p=e.phases.find(x=>x.phaseId===Number(phaseId));const t=p&&p.tasks.find(x=>x.id===taskId);if(t){t.done=true;t.completedAt=now();e.activity.push({at:now(),type:'task-completed',text:'Task completed: '+t.text})}return save(e)}
 function approvePhase(id,phaseId,name){const e=get(id);if(!e)return null;const p=e.phases.find(x=>x.phaseId===Number(phaseId));if(!p)return e;p.approvals.push({name:name||'Client approver',at:now()});p.status='Approved';e.status='Phase gated';const idx=e.phases.findIndex(x=>x.phaseId===Number(phaseId));const next=e.phases[idx+1];if(next){e.currentPhaseId=next.phaseId;e.nextAction='Begin '+next.name}else{e.status='Completed';e.nextAction='Close engagement and hand over improvement plan'}e.activity.push({at:now(),type:'phase-approved',text:p.name+' approved by '+(name||'Client approver')});return save(e)}
 window.TMENGAGEMENT={KEY,STATUSES,PHASES,read,get,current,save,activateFromProposal,transition,scheduleKickoff,updatePhase,addTask,completeTask,approvePhase};
})();
