(function(){
 const KEY='tm_governance_v1'; const now=()=>new Date().toISOString();
 const read=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'[]')}catch(e){return[]}}; const write=a=>(localStorage.setItem(KEY,JSON.stringify(a)),a);
 function current(){const p=TM.get();let a=read();let g=a.find(x=>x.projectId===p.id);if(!g){g={id:'GOV-'+Date.now().toString().slice(-7),projectId:p.id,engagementId:p.engagementId||'',documents:[],decisions:[],changeRequests:[],meetings:[],approvals:[],activity:[],created:now(),updated:now()};save(g)}return g}
 function save(g){g.updated=now();let a=read(),i=a.findIndex(x=>x.id===g.id);if(i<0)a.push(g);else a[i]=g;write(a);return g}
 function act(g,type,text,meta={}){g.activity.push({at:now(),type,text,...meta})}
 function addDocument(type,name,description,status='Shared'){let g=current();g.documents.push({id:'DOC-'+Date.now().toString().slice(-6),type,name,description,status,created:now()});act(g,'document',`Document ${status.toLowerCase()}: ${name}`);return save(g)}
 function addDecision(title,owner,due,status='Open',notes=''){let g=current();g.decisions.push({id:'DEC-'+Date.now().toString().slice(-6),title,owner,due,status,notes,created:now()});act(g,'decision','Decision logged: '+title);return save(g)}
 function updateDecision(id,status){let g=current(),d=g.decisions.find(x=>x.id===id);if(d){d.status=status;d.updated=now();act(g,'decision-update',`Decision ${id} → ${status}`)}return save(g)}
 function addChange(title,reason,impact,requestedBy){let g=current();g.changeRequests.push({id:'CR-'+Date.now().toString().slice(-6),title,reason,impact,requestedBy,status:'Submitted',created:now()});act(g,'change-request','Change request submitted: '+title);return save(g)}
 function updateChange(id,status,decisionNote=''){let g=current(),c=g.changeRequests.find(x=>x.id===id);if(c){c.status=status;c.decisionNote=decisionNote;c.updated=now();act(g,'change-update',`Change ${id} → ${status}`)}return save(g)}
 function addMeeting(title,date,attendees,notes,nextActions){let g=current();g.meetings.push({id:'MTG-'+Date.now().toString().slice(-6),title,date,attendees,notes,nextActions,created:now()});act(g,'meeting','Meeting recorded: '+title);return save(g)}
 function approve(type,reference,approver,comment=''){let g=current();g.approvals.push({id:'APR-'+Date.now().toString().slice(-6),type,reference,approver,comment,at:now()});act(g,'approval',`${type} approved: ${reference}`);return save(g)}
 window.TMGOV={current,addDocument,addDecision,updateDecision,addChange,updateChange,addMeeting,approve};
})();
