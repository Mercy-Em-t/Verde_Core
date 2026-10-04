(function(){
  const lead={
    New:['Review','Contacted','Lost'], Review:['Contacted','Discovery booked','Lost'], Contacted:['Discovery booked','Qualified','Lost'],
    'Discovery booked':['Qualified','Lost'], Qualified:['Proposal','Lost'], Proposal:['Won','Lost'], Won:[], Lost:[]
  };
  const engagement={
    'Pending kickoff':['Kickoff scheduled','On hold'], 'Kickoff scheduled':['In delivery','On hold'],
    'In delivery':['Awaiting client approval','Phase gated','On hold','Completed'],
    'Awaiting client approval':['Phase gated','In delivery','On hold'], 'Phase gated':['In delivery','Completed','On hold'],
    Completed:[], 'On hold':['Pending kickoff','Kickoff scheduled','In delivery']
  };
  function can(map,from,to){return from===to || !!(map[from]||[]).includes(to)}
  function transition(map,from,to,label){if(!can(map,from,to)) throw new Error('Invalid '+label+' transition: '+from+' → '+to);return to}
  function closeoutReady(c,financeSummary){
    const accepted=!!(c.acceptance&&c.acceptance.accepted);
    const open=(c.outstanding||[]).filter(x=>!x.done).length;
    const handover=!!(c.handover&&c.handover.completed);
    const commercial=financeSummary?Number(financeSummary.outstanding||0)===0 && Number(financeSummary.overdue||0)===0:true;
    return {ready:accepted&&open===0&&handover&&commercial,checks:{accepted,openOutstanding:open,handover,commercialClear:commercial}};
  }
  function paymentAllowed(invoice,amount){
    const n=Number(amount); if(!Number.isFinite(n)||n<=0) return {ok:false,reason:'Payment amount must be greater than zero'};
    const remaining=Math.max(0,Number(invoice.amount||0)-Number(invoice.paid||0));
    if(n>remaining) return {ok:false,reason:'Payment exceeds invoice balance',remaining};
    return {ok:true,remaining};
  }
  window.TMWORKFLOW={lead,engagement,can,transition,closeoutReady,paymentAllowed};
})();
