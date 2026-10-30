// Retention page (#retention): what the outcome ledger measured, what the memory model predicts, and what recovery holds.
// Three things are kept apart and labeled as such: observed rates (schedule.mjs outcomeReport, answers actually given),
// model estimates (recall falling below the target, the seven-day workload in session.mjs) and recovery status
// (recovery.mjs). Pure: nothing here touches the DOM or the clock, and nothing writes to the records it reads.
import {TARGET,outcomeReport,recallAt,validMemory,episodeOf,LEECH_LAPSES} from './schedule.mjs?b=6ad91f7';
import {scheduledItems,workloadForecast,lessonStarted,localDays,FORECAST_DAYS} from './session.mjs?b=6ad91f7';
import {recoveryUnits} from './recovery.mjs?b=6ad91f7';

// Model-scheduled items whose estimated recall is below the target now, or falls below it before the end of the last
// forecast day. Items in recovery are left out: they are listed under recovery instead, never counted twice. These are
// estimates from the scheduler's default weights, not measurements.
export function recallRisk(items,{now,days=FORECAST_DAYS,target=TARGET}={}){
 const end=localDays(now,days)[days],out={total:0,belowNow:0,belowSoon:0,byType:{}};
 for(const x of items||[]){
  if(x.recovering||!validMemory(x.memory))continue;
  out.total++;
  const r0=recallAt(x.memory,x.due,now),r1=recallAt(x.memory,x.due,end-1);
  if(r0===null||r1===null||r1>=target)continue;
  const t=out.byType[x.type]||={belowNow:0,belowSoon:0},k=r0<target?'belowNow':'belowSoon';
  out[k]++;t[k]++;
 }
 out.below=out.belowNow+out.belowSoon;
 return out;
}

// Every open recovery episode as one row, by status: due (a changed-context check is in Today now), waiting (its next
// check is on a later day) or blocked (no usable prompt; its reason is recovery.mjs BLOCKED). Rows carry why the item is
// there (where it kept failing, lifetime lapses from its own record) and the next step.
export const NEXT_STEPS={
 due:'Answer it in Today, in a new context.',
 waiting:'Nothing to do until the next check.',
 'no-content':'It waits for new practice material. It is not counted as due meanwhile.',
 'no-evidence':'It waits for a drill that tests the same point. It is not counted as due meanwhile.',
 'not-started':'Open more lessons or readings: its other sentences and drills are there.',
 exhausted:'Every new context has been used. It waits for more material and is not counted as due meanwhile.'
};
export function recoveryRows(state,content,{now,kanjiChecks=null,lines=[]}={}){
 const r=recoveryUnits(state,content,{now,kanjiChecks,lines,started:id=>lessonStarted(state,id)}),lapses=new Map(scheduledItems(state,content,{now}).map(x=>[x.key,x.lapses]));
 const row=(x,status,reason=null)=>{const ep=episodeOf(state?.recovery,x.key);return {key:x.key,type:x.type,ref:x.ref,status,reason,due:x.due,streak:ep?.streak??0,venue:ep?.venue??null,origin:ep?.origin??null,misses:ep?.misses??0,lapses:lapses.get(x.key)??null,next:NEXT_STEPS[reason||status]};};
 const rows=[...r.units.map(x=>row(x,'due')),...r.waiting.map(x=>row(x,'waiting')),...r.blocked.map(x=>row(x,'blocked',x.reason))];
 const seen=new Set();
 return rows.filter(x=>!seen.has(x.key)&&seen.add(x.key));
}

// The page in one read: the observed 30-day report, recall estimates, recovery rows and the seven-day forecast.
export function retentionView(state,content,{now,kanjiChecks=null,lines=[],days=FORECAST_DAYS}={}){
 const items=scheduledItems(state,content,{now});
 return {now,report:outcomeReport(state?.outcomes,now),risk:recallRisk(items,{now,days}),recovery:recoveryRows(state,content,{now,kanjiChecks,lines}),
  forecast:workloadForecast(state,content,{now,days,kanjiChecks,lines}),leechLapses:LEECH_LAPSES};
}
