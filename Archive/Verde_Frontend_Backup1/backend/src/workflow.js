export const LEAD_TRANSITIONS={
  New:['Review','Contacted','Lost'], Review:['Contacted','Discovery booked','Lost'], Contacted:['Discovery booked','Qualified','Lost'],
  'Discovery booked':['Qualified','Lost'], Qualified:['Proposal','Lost'], Proposal:['Won','Lost'], Won:[], Lost:[]
};
export const ENGAGEMENT_TRANSITIONS={
  'Pending kickoff':['Kickoff scheduled','On hold'], 'Kickoff scheduled':['In delivery','On hold'],
  'In delivery':['Awaiting client approval','Phase gated','On hold','Completed'],
  'Awaiting client approval':['Phase gated','In delivery','On hold'], 'Phase gated':['In delivery','Completed','On hold'],
  Completed:[], 'On hold':['Pending kickoff','Kickoff scheduled','In delivery']
};
export function validTransition(map,from,to){return from===to || (map[from]||[]).includes(to)}
export function positiveAmount(value){const n=Number(value);return Number.isFinite(n)&&n>0}
