(function(){
  const KEY='tm_proposals_v1';
  const STATUSES=['Draft','Sent','Approved','Declined','Expired'];
  const PHASES=[
    {id:1,name:'Initiation & Feasibility',price:300000,priceLabel:'From KES 300k / wk',gate:'Weekly T&M Retainer'},
    {id:2,name:'Requirements Analysis',price:350000,priceLabel:'From KES 350k / wk',gate:'Scope Freeze Sign-Off'},
    {id:3,name:'Architecture & Design',price:800000,priceLabel:'From KES 800k Fixed',gate:'Prerequisite: Phase 2 Scope Freeze'},
    {id:4,name:'Implementation & Cutover',price:1500000,priceLabel:'From KES 1.5M Fixed',gate:'Milestone Tranches: 40% / 30% / 30%'}
  ];
  const now=()=>new Date().toISOString();
  function read(){try{return JSON.parse(localStorage.getItem(KEY)||'[]')}catch(e){return[]}}
  function write(v){localStorage.setItem(KEY,JSON.stringify(v));return v}
  function list(){return read()}
  function get(id){return list().find(x=>x.id===id)||null}
  function save(p){p.updated=now();const a=list(),i=a.findIndex(x=>x.id===p.id);if(i<0)a.push(p);else a[i]=p;write(a);return p}
  function fromProject(project,lead){
    const ids=(project&&project.selectedPhases||[]).map(Number).filter(Boolean);
    const items=ids.map(id=>PHASES.find(p=>p.id===id)).filter(Boolean).map(p=>({phaseId:p.id,name:p.name,price:p.price,gate:p.gate,scope:p.priceLabel}));
    const subtotal=items.reduce((s,x)=>s+x.price,0);
    return save({id:'PROP-'+Date.now().toString().slice(-7),number:'TM-PROP-'+new Date().getFullYear()+'-'+Date.now().toString().slice(-5),status:'Draft',created:now(),updated:now(),leadId:lead?.id||'',projectId:project?.id||'',client:lead?.org||project?.name||'Client',contact:lead?.contact||'',email:lead?.email||'',goal:lead?.goal||project?.qualification?.goal||'',items,subtotal,addOns:[],discount:0,total:subtotal,validDays:14,assumptions:['Scope is based on the selected phases and discovery information.','Any material change in scope is handled through change control.','Dates are confirmed after proposal approval and scheduling.'],paymentTerms:'As stated in the selected phase gate / milestone structure.',notes:'',approval:{approved:false,name:'',at:''},history:[{at:now(),type:'created',text:'Proposal created from project / lead'}]})
  }
  function recalc(p){p.subtotal=(p.items||[]).reduce((s,x)=>s+Number(x.price||0),0);p.total=Math.max(0,p.subtotal+Number(p.addOnsTotal||0)-Number(p.discount||0));return p}
  function transition(id,status){if(!STATUSES.includes(status))throw Error('Unknown proposal status');const p=get(id);if(!p)return null;p.status=status;p.history=p.history||[];p.history.push({at:now(),type:'status',text:'Proposal status changed to '+status});return save(p)}
  function approve(id,name){const p=get(id);if(!p)return null;p.status='Approved';p.approval={approved:true,name:name||'Client approver',at:now()};p.history=p.history||[];p.history.push({at:now(),type:'approved',text:'Proposal approved by '+(name||'Client approver')});return save(p)}
  function activate(id){const p=get(id);if(!p||p.status!=='Approved')return null;p.history=p.history||[];p.history.push({at:now(),type:'activated',text:'Approved proposal converted to active project'});save(p);const project=TM.get();project.status='Active project';project.stage='explore';project.nextAction='Schedule project kickoff';project.selectedPhases=(p.items||[]).map(x=>x.phaseId);project.proposalId=p.id;project.proposalNumber=p.number;project.history=project.history||[];project.history.push({at:now(),type:'proposal-activated',proposalId:p.id});TM.save(project);if(window.TMENGAGEMENT){const e=TMENGAGEMENT.activateFromProposal(p,project);project.engagementId=e.id;TM.save(project)}return project}
  window.TMPROPOSAL={KEY,STATUSES,PHASES,list,get,save,fromProject,recalc,transition,approve,activate};
})();
