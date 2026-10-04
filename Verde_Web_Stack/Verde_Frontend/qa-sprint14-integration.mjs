import fs from 'node:fs';
import vm from 'node:vm';

const root = process.cwd() + '/';
const store=new Map();
const window={};
const localStorage={getItem:k=>store.has(k)?store.get(k):null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k)};
const context=vm.createContext({window,localStorage,console,Date,JSON,Math});
const load=f=>vm.runInContext(fs.readFileSync(root+f,'utf8'),context,{filename:f});
load('workflow-guards.js'); context.TMWORKFLOW=window.TMWORKFLOW; load('project-state.js'); context.TM=window.TM; load('crm.js'); context.TMCRM=window.TMCRM; load('engagement.js'); context.TMENGAGEMENT=window.TMENGAGEMENT; load('governance.js'); context.TMGOV=window.TMGOV; load('finance.js'); context.TMFIN=window.TMFIN; load('closeout.js');
const TM=window.TM, CRM=window.TMCRM, ENG=window.TMENGAGEMENT, GOV=window.TMGOV, FIN=window.TMFIN, CO=window.TMCLOSEOUT;
const checks=[];
function ok(name,condition){if(!condition)throw new Error(name);checks.push(name)}

// 1–4 acquisition and qualification
const p=TM.qualify({org:'Demo Health Systems',industry:'Healthcare',stage:'plan/design',budget:'50k+',timeline:'1-3 months',docs:'Some',goal:'Modernise the operating model'});
ok('qualification enters design stage',p.stage==='design');
const lead=CRM.create({id:'LEAD-QA-001',org:p.name,industry:'Healthcare',stage:p.qualification.stage,goal:p.qualification.goal,selectedPhases:[1,2,3,4],score:80,route:'Priority discovery'});
ok('lead created',lead.id==='LEAD-QA-001');
CRM.transition(lead.id,'Review'); CRM.transition(lead.id,'Contacted'); CRM.transition(lead.id,'Discovery booked'); CRM.transition(lead.id,'Qualified'); CRM.transition(lead.id,'Proposal'); CRM.transition(lead.id,'Won');
ok('lead lifecycle reaches Won',CRM.get(lead.id).status==='Won');

// 5–6 proposal / approval simulation
const proposal={id:'PROP-QA-001',number:'TM-QA-001',projectId:p.id,client:p.name,contact:'Project Sponsor',email:'sponsor@example.test',goal:p.qualification.goal,status:'Approved',items:[1,2,3,4].map((phaseId,i)=>({phaseId,name:'Phase '+phaseId,price:(i+1)*1000})),total:10000};
ok('approved proposal prepared',proposal.status==='Approved'&&proposal.items.length===4);

// 7–9 engagement / governance
const eng=ENG.activateFromProposal(proposal,p); ENG.scheduleKickoff(eng.id,'2026-10-01','Kickoff'); ENG.transition(eng.id,'In delivery');
ok('engagement activated and in delivery',ENG.get(eng.id).status==='In delivery');
GOV.addDecision('Approve solution blueprint','Sponsor','2026-10-10','Open','QA decision');
GOV.addDocument('deliverable','Blueprint','Approved blueprint','Shared');
GOV.addMeeting('Kickoff','2026-10-01',['Sponsor'],'Kickoff complete','Confirm Phase 1');
ok('governance records exist',GOV.current().decisions.length===1&&GOV.current().documents.length===1&&GOV.current().meetings.length===1);

// 10 financial control
FIN.activateFromProposal(proposal);
const inv=FIN.invoice({projectId:p.id,proposalId:proposal.id,client:p.name,description:'Phase 1',amount:1000,dueDate:'2026-10-15'});
FIN.issue(inv.id); FIN.payment({invoiceId:inv.id,projectId:p.id,amount:1000,reference:'QA-PAY-001'});
ok('invoice is paid',FIN.summary(p.id).paid===1000&&FIN.summary(p.id).outstanding===0);

// 11–13 closeout / improve
const c=CO.ensure(); CO.accept('Sponsor','Accepted for QA'); CO.handover(['Blueprint','Operating guide']);
ok('closeout cannot archive with outstanding work',(()=>{CO.addOutstanding('QA item','Owner','2026-10-20');try{CO.archive();return false}catch{return true}})());
CO.completeOutstanding(CO.current().outstanding[0].id); CO.addOutcome('Delivery objective','Target','Actual'); CO.addLesson('Keep governance visible','Retain decision register'); CO.addImprovement('30-day review','Consultant','2026-11-01');
CO.archive();
ok('closeout archived',CO.current().status==='Closed'&&CO.current().archive.archived===true);

// failure-path checks
ok('invalid engagement transition rejected',(()=>{try{ENG.transition(eng.id,'Pending kickoff');return false}catch{return true}})());
ok('overpayment rejected',(()=>{const i=FIN.invoice({projectId:p.id,amount:500});try{FIN.payment({invoiceId:i.id,amount:600});return false}catch{return true}})());
console.log(JSON.stringify({ok:true,checksPassed:checks.length,checks},null,2));
