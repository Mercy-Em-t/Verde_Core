(function(){
 const KEY='tm_closeouts_v1'; const now=()=>new Date().toISOString();
 const read=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'[]')}catch(e){return[]}};
 const write=a=>(localStorage.setItem(KEY,JSON.stringify(a)),a);
 function current(){const p=TM.get(); return read().find(x=>x.projectId===p.id)||null}
 function ensure(){const p=TM.get(), e=TMENGAGEMENT.current(); let c=current(); if(c)return c; c={id:'CO-'+Date.now().toString().slice(-7),projectId:p.id,engagementId:e?.id||'',status:'Open',acceptance:{requested:false,accepted:false,by:'',date:'',notes:''},outstanding:[],outcomes:[],lessons:[],handover:{completed:false,items:[]},improvement:{actions:[],owner:'',reviewDate:''},archive:{ready:false,archived:false,date:''},created:now(),updated:now(),activity:[{at:now(),type:'created',text:'Closeout workspace created'}]}; return save(c)}
 function save(c){c.updated=now();const a=read(),i=a.findIndex(x=>x.id===c.id);if(i<0)a.push(c);else a[i]=c;write(a);return c}
 function add(c,type,data){c.activity.push({at:now(),type,text:data.text||type});return save(c)}
 function requestAcceptance(){const c=ensure();c.acceptance.requested=true;c.status='Awaiting final acceptance';return add(c,'acceptance-requested',{text:'Final acceptance requested'})}
 function accept(by,notes){const c=ensure();c.acceptance={requested:true,accepted:true,by:by||'Client approver',date:now(),notes:notes||''};c.status='Accepted';return add(c,'accepted',{text:'Final acceptance recorded by '+(by||'Client approver')})}
 function addOutstanding(text,owner,due){const c=ensure();c.outstanding.push({id:'O-'+Date.now().toString().slice(-6),text,owner:owner||'',due:due||'',done:false});return add(c,'outstanding-added',{text:'Outstanding item added: '+text})}
 function completeOutstanding(id){const c=ensure(),x=c.outstanding.find(x=>x.id===id);if(x){x.done=true;x.completedAt=now();}return add(c,'outstanding-completed',{text:'Outstanding item completed: '+(x?.text||id)})}
 function addOutcome(text,measure,target,result){const c=ensure();c.outcomes.push({id:'R-'+Date.now().toString().slice(-6),text,measure:measure||'',target:target||'',result:result||''});return add(c,'outcome-added',{text:'Outcome recorded: '+text})}
 function addLesson(text,action){const c=ensure();c.lessons.push({id:'L-'+Date.now().toString().slice(-6),text,action:action||''});return add(c,'lesson-added',{text:'Lesson recorded: '+text})}
 function handover(items){const c=ensure();c.handover={completed:true,items:(items||[]).filter(Boolean),date:now()};return add(c,'handover-complete',{text:'Client handover completed'})}
 function addImprovement(text,owner,due){const c=ensure();c.improvement.actions.push({id:'I-'+Date.now().toString().slice(-6),text,owner:owner||'',due:due||'',status:'Planned'});return add(c,'improvement-added',{text:'Improvement action added: '+text})}
 function archive(){const c=ensure();const finance=window.TMFIN&&TMFIN.summary?TMFIN.summary(c.projectId):null;const check=window.TMWORKFLOW?TMWORKFLOW.closeoutReady(c,finance):{ready:!!(c.acceptance&&c.acceptance.accepted&&c.handover&&c.handover.completed&&!(c.outstanding||[]).some(x=>!x.done)),checks:{}};if(!check.ready){c.lastArchiveCheck=check;save(c);throw new Error('Closeout is not ready: '+JSON.stringify(check.checks));}c.archive={ready:true,archived:true,date:now()};c.status='Closed';return add(c,'archived',{text:'Project closeout archived and engagement closed'})}
 window.TMCLOSEOUT={KEY,read,current,ensure,save,requestAcceptance,accept,addOutstanding,completeOutstanding,addOutcome,addLesson,handover,addImprovement,archive};
})();
