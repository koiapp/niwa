// Today: one capped, interleaved run across every due review source, and the review-debt gate for new lessons.
// Each source keeps its own scheduler, evidence and assessment rules. This module only reads their due queues, orders a
// snapshot, tracks the run and records it as its own evidence line. Nothing here touches the DOM; every function takes
// `now`, so tests inject the clock.
import {dueReviews,reviewTarget,isConverted} from './recall.mjs?b=2bde53d';
import {reviewQueue,reviewPrompts,RATINGS} from './flashcards.mjs?b=2bde53d';
import {readingProgress,readingPriority,transferPriority,isKanjiWord,hasKanji,inReadingText,sentencesFor,pickSentence} from './vocabulary.mjs?b=2bde53d';
import {hasUnit,unitItems,reviewItems,reviewShown,reviewFocus} from './exercises.mjs?b=2bde53d';
import {patternIndex,pickRetest,isDue,retestRevision,itemPatternIn} from './patterns.mjs?b=2bde53d';
import {recallAt,review,validMemory,inRecovery,episodeOf,recoveryRevision,migrateRecovery,PROMPT_ID,RECOVERY_SUCCESSES,RECOVERY_GAP} from './schedule.mjs?b=2bde53d';
import {recoveryUnits,recoveryQuestion,recoveryTarget} from './recovery.mjs?b=2bde53d';
import {dueTransfers,transferRevision,findText} from './transfer.mjs?b=2bde53d';

export const DAILY_VERSION=1;
// One unit is one canonical review task. A passage's whole delayed recall set is one unit, and so is a lesson review
// (about six closed-book exercise items), so units vary in length. A pattern re-test is one drill from another lesson.
// An unseen text's one delayed re-ask (transfer.mjs) is one unit: its whole delayed set, recall items then evidence lines.
export const TYPES=['lesson','word','reading','passage','phrase','pattern','transfer'];
export const TYPE_LABELS={lesson:'Lesson review',word:'Word card',reading:'Kanji reading',passage:'Passage recall',phrase:'Reading phrase',pattern:'Pattern re-test',transfer:'Unseen text, delayed'};
export const ANSWER_MAX=200;
// Lesson reviews pass or fail. Older saves may hold typed-answer outcomes from before; they stay readable in history.
const LEGACY_LESSON=['correct','particle','contrast','unmatched','disputed','gave-up'];
// Removed unit types: conversation replies, never offered, and kanji parts and kanji meaning questions, retired in kanji
// Phase 3c (2026-10-23). A save or backup that mentions them drops those parts.
const LEGACY_TYPES=['reply','component','meaning'];
export const RUN_DEFAULT=20,RUN_MIN=1,RUN_MAX=50;
// Product policy, separate from the learner's run size: new lessons wait while this many review units are due.
export const DEBT_LIMIT=20;
export const HISTORY_MAX=100;
export const RESULTS=['correct','missed','assisted','disputed','skipped'];
export const SKIP_REASONS=['resolved','removed'];
const STATUSES=['pending','done','skipped'];
// A word card in recovery is asked as a scored choice in a sentence (recovery.mjs), so it has correct and incorrect too.
const OUTCOMES={lesson:['passed','failed',...LEGACY_LESSON],word:[...RATINGS.map(r=>r.id),'correct','incorrect'],reading:['correct','incorrect','gave-up'],passage:['closed','supported'],phrase:['correct','incorrect'],pattern:['correct','incorrect'],transfer:['closed','supported']};
const RUN_ID=/^t-[a-z0-9-]{1,40}$/;
const SLUG=/^[a-z0-9-]+$/;
const PROMPT=/^[a-z0-9-]+\|[a-z,]+>[a-z,]+$/;
const READING_SOURCE=/^(lesson|passage):[a-z0-9-]+$/;
const ITEM_ID=/^[A-Za-z0-9][A-Za-z0-9-]{0,59}$/;
const plainObject=v=>!!v&&typeof v==='object'&&!Array.isArray(v);
const time=v=>Number.isFinite(v)&&v>=0;
const count=v=>Number.isInteger(v)&&v>=0;
const plural=(n,w)=>`${n} ${w}${n===1?'':'s'}`;
export const validRunLimit=n=>Number.isInteger(n)&&n>=RUN_MIN&&n<=RUN_MAX;
export const emptyDaily=()=>({version:DAILY_VERSION,limit:RUN_DEFAULT,started:{},active:null,history:[]});
const base=d=>d?.version===DAILY_VERSION?d:emptyDaily();
export const unitKey=(type,ref)=>`${type}:${ref}`;
export const newRunId=(now=Date.now(),rand=Math.random)=>`t-${now.toString(36)}-${Math.floor(rand()*36**4).toString(36).padStart(4,'0')}`;

// ── Due units ─────────────────────────────────────────────────────────────────────────────────────────────
// Adapters over the canonical queues: {key, type, ref, revision, due, item?}. `revision` changes whenever the source
// records anything for that item, so a snapshot can tell when an item was answered elsewhere. Only familiar, scheduled
// items due now count: unseen words, early practice and in-session retries never do.
// Revision strings keep the form they had before scheduler version 1, so a run saved then resumes as it was. Every answer
// the scheduler applies moves a due time or a count, so each one still changes the revision; an answer it refuses (early
// or a repeat) changes nothing and needs no new revision.
const reviewRevision=r=>`${r.count}:${r.due}`;
const readingRevision=e=>`${e?.met??0}:${e?.log?.at(-1)?.at??0}:${e?.transfer?.at??0}`;
// The revision a unit's source holds now, or null when the source no longer has it.
export function liveRevision(unit,state){
 const t=unit?.type,ref=unit?.ref;
 // A recovery unit follows its episode (schedule.mjs). Any other unit of an item now in recovery has left its venue.
 if(unit?.item?.recovery)return recoveryRevision(state?.recovery,unit.key);
 if(inRecovery(state?.recovery,unit?.key))return null;
 if(t==='lesson'||t==='passage'||t==='phrase'){const r=state?.reviews?.[t==='lesson'?ref:`${t}:${ref}`];return r?reviewRevision(r):null;}
 if(t==='word'){const r=state?.wordReviews?.items?.[ref];return r?String(r.count):null;}
 if(t==='reading')return readingRevision(state?.readingEvidence?.words?.[ref]);
 if(t==='pattern'){const r=state?.patterns?.records?.[ref];return r?retestRevision(r):null;}
 if(t==='transfer')return transferRevision(state?.transfer,ref);
 return null;
}
// A snapshot unit answered elsewhere since the run started (a lesson review done on its page, a card rated in a deck
// session, another tab). Its answer must not be applied a second time: the caller revalidates instead.
export const unitStale=(unit,state)=>!!unit&&liveRevision(unit,state)!==unit.revision;
function textOccurrence(content,id,sources){
 const found=[];
 for(const [kind,list] of [['lesson',content?.lessons],['passage',content?.passages]])for(const c of list||[]){
  const i=(c.occurrences||[]).findIndex(o=>o.word===id&&inReadingText(o.path)&&hasKanji(o.surface));
  if(i>=0)found.push({source:`${kind}:${c.id}`,occurrence:i});
 }
 // A text the word has not yet been read correctly in after a delay counts towards fading, so it comes first.
 return found.find(x=>!sources.includes(x.source))||found[0]||null;
}
// One unit per kanji word, whichever text it appears in. Words in the new-sentence rhythm (#0009) follow that schedule
// only; other words come back in a sentence from a text once their last check was wrong or not yet repeated on a later day.
function readingUnits(content,store,words,{now,kanjiChecks,lines}){
 const out=[];
 for(const [id,entry] of Object.entries(store?.words||{})){
  const w=words.get(id);if(!isKanjiWord(w))continue;
  const p=readingProgress(w,entry,now),revision=readingRevision(entry),key=unitKey('reading',id);
  const sentences=kanjiChecks?sentencesFor(kanjiChecks,id,lines):[];
  if(sentences.length&&(entry.transfer||p.faded)){
   if(transferPriority(w,entry,now)===null)continue;
   const pick=pickSentence(sentences,entry.transfer?.seen||[]);
   out.push({key,type:'reading',ref:id,revision,due:entry.transfer?.due??p.lastSeen??0,item:{sentence:pick.sentence.id}});
   continue;
  }
  const priority=readingPriority(w,entry,now);
  // Priority 1 is a word seen once and never checked: it is introduced by the text's own reading check, not by Today.
  if(priority===null||priority===1)continue;
  const at=textOccurrence(content,id,p.sources);
  if(at)out.push({key,type:'reading',ref:id,revision,due:p.lastCheck??p.lastSeen??0,item:at});
 }
 return out;
}
// One unit per pattern whose re-test is due (#0013): a drill from another started lesson, chosen when the run is
// planned. Items that today's due lesson reviews will show are left out, so one exercise never appears twice. A due
// pattern with no eligible drill waits; patterns.mjs explains why on the progress view.
// The drills today's due lesson reviews will show, as lesson:item keys.
function reviewDrills(state,content,dueLessons){
 const out=new Set();
 for(const x of dueLessons){const l=content?.lessons?.find(y=>y.id===x.id);if(!hasUnit(l))continue;for(const it of reviewItems(unitItems(l),{shown:reviewShown(state?.answers?.[l.id]),focus:reviewFocus(state?.answers?.[l.id]),seed:l.id}))out.add(`${l.id}:${it.id}`);}
 return out;
}
function patternUnits(state,content,exclude,now){
 const records=state?.patterns?.records||{},ids=Object.keys(records).filter(id=>isDue(records[id],now));
 if(!ids.length)return [];
 const index=patternIndex(content),out=[];
 for(const id of ids){const pick=pickRetest(content,state,id,{started:l=>lessonStarted(state,l),exclude,index});if(pick)out.push({key:unitKey('pattern',id),type:'pattern',ref:id,revision:retestRevision(records[id]),due:records[id].due,item:pick});}
 return out;
}
// Every due unit, complete and uncapped, deduplicated by scheduling identity. An item in a recovery episode
// (schedule.mjs) leaves its own queue and comes back, under the same key, as a recovery unit (recovery.mjs) once its wait
// is over and a changed prompt exists; one without a usable prompt is listed by recoveryUnits as blocked, not here.
export function dueUnits(state,content,{now=Date.now(),kanjiChecks=null,lines=[]}={}){
 const rec=state?.recovery,out=new Map(),add=u=>{if(!out.has(u.key)&&(u.item?.recovery||!inRecovery(rec,u.key)))out.set(u.key,u);};
 const words=new Map((content?.vocabulary||[]).map(w=>[w.id,w])),due=dueReviews(state?.reviews,content,now,rec);
 for(const x of due.lessons)add({key:unitKey('lesson',x.id),type:'lesson',ref:x.id,revision:reviewRevision(x.review),due:x.review.due});
 for(const x of due.passages)add({key:unitKey('passage',x.id),type:'passage',ref:x.id,revision:reviewRevision(x.review),due:x.review.due});
 for(const x of due.phrases)add({key:unitKey('phrase',x.id),type:'phrase',ref:x.id,revision:reviewRevision(x.review),due:x.review.due});
 const items=state?.wordReviews?.items||{};
 for(const p of reviewQueue(state,'all',now).due)if(words.has(p.word))add({key:unitKey('word',p.key),type:'word',ref:p.key,revision:String(items[p.key]?.count??0),due:p.due});
 for(const u of readingUnits(content,state?.readingEvidence,words,{now,kanjiChecks,lines}))add(u);
 const drills=reviewDrills(state,content,due.lessons),recovery=recoveryUnits(state,content,{now,kanjiChecks,lines,started:id=>lessonStarted(state,id),exclude:drills});
 for(const u of recovery.units){add(u);for(const p of u.item.recovery)if(p.startsWith('d:'))drills.add(p.slice(2));}
 for(const u of patternUnits(state,content,drills,now))add(u);
 for(const x of dueTransfers(state?.transfer,content,now))add({key:unitKey('transfer',x.id),type:'transfer',ref:x.id,revision:x.revision,due:x.due});
 return [...out.values()];
}
export const countByType=units=>Object.fromEntries(TYPES.map(t=>[t,units.filter(u=>u.type===t).length]).filter(([,n])=>n));

// ── Scheduler state across sources ───────────────────────────────────────────────────────────────────────────────────
// Every scheduled item with its memory, for recall estimates and workload forecasts: {key, type, ref, due, memory,
// lapses, recent, recall, last, recovering}. lapses is the lifetime total and recent the lapses since the item last
// recovered (an interval of at least RECOVERY_DAYS); routing on them belongs to the caller. recall is the model's estimate
// at `now`, not a measurement. last is the record's own last attempt, when it keeps one; recovering marks an item in a
// recovery episode. Pattern re-tests are not scheduled by the model and are left out; so are reviews of removed content.
export function scheduledItems(state,content,{now=Date.now()}={}){
 const out=[],words=new Map((content?.vocabulary||[]).map(w=>[w.id,w]));
 for(const [key,r] of Object.entries(state?.reviews||{})){
  const t=reviewTarget(key,content);if(!t||!r?.memory)continue;
  out.push({key:unitKey(t.kind,t.id),type:t.kind,ref:t.id,due:r.due,memory:r.memory,lapses:r.lapses||0,recent:r.memory.recent,recall:recallAt(r.memory,r.due,now),...(time(r.lastPractice)?{last:r.lastPractice}:{})});
 }
 const prompts=new Set(reviewPrompts(state,'all').map(p=>p.key));
 for(const [key,r] of Object.entries(state?.wordReviews?.items||{}))if(r?.memory&&prompts.has(key)&&words.has(r.word))out.push({key:unitKey('word',key),type:'word',ref:key,due:r.due,memory:r.memory,lapses:r.lapses||0,recent:r.memory.recent,recall:recallAt(r.memory,r.due,now),...(time(r.last)?{last:r.last}:{})});
 for(const [id,e] of Object.entries(state?.readingEvidence?.words||{})){const t=e?.transfer;if(t?.memory&&isKanjiWord(words.get(id)))out.push({key:unitKey('reading',id),type:'reading',ref:id,due:t.due,memory:t.memory,lapses:t.lapses||0,recent:t.memory.recent,recall:recallAt(t.memory,t.due,now),...(time(t.at)?{last:t.at}:{})});}
 return out.map(x=>({...x,recovering:inRecovery(state?.recovery,x.key)}));
}
// Seeds recovery tracking once (schedule.mjs migrateRecovery) from every scheduled item's known lapses and last attempt.
export const migrateLeeches=(state,content,now)=>migrateRecovery(state?.recovery,scheduledItems(state,content,{now}).map(x=>({key:x.key,lapses:x.lapses,last:x.last})),now);
// ── Seven-day workload forecast ──────────────────────────────────────────────────────────────────────────────────────
// Days are the device's local calendar days: day 0 runs from `now` to the next local midnight, each later day from one
// local midnight to the next (23 or 25 hours across a clock change). localDays gives the days+1 midnights from today's.
export const FORECAST_DAYS=7;
export function localDays(now,days=FORECAST_DAYS){const d=new Date(now);return Array.from({length:days+1},(_,k)=>new Date(d.getFullYear(),d.getMonth(),d.getDate()+k).getTime());}
// Today units per local day. scheduled: what the sources already hold, on the first day each unit falls due. It is read
// from dueUnits at each day's end, so it counts exactly what Today would (same keys, a lesson review as one unit,
// recovery in place of the failing venue, blocked recovery left out) and overdue work stays on day 0 until answered.
// simulated: further returns inside the window if every unit were answered correctly on the day it falls due, through
// the shared scheduler (review()) and, for an item in recovery, the recovery rule (a check a day later until the episode
// completes and credits the item's own schedule). Pattern re-tests and unseen texts do not return after a success.
// unmodelled: units without a scheduler memory whose return cannot be simulated (kanji words re-checked in texts).
// Records are only read: nothing is rescheduled, and the same input gives the same forecast.
export function workloadForecast(state,content,{now=Date.now(),days=FORECAST_DAYS,kanjiChecks=null,lines=[]}={}){
 const starts=localDays(now,days),end=starts[days],ctx={kanjiChecks,lines};
 const dayOf=t=>{if(!(t<end))return -1;let k=0;while(k+1<days&&starts[k+1]<=t)k++;return k;};
 const current=dueUnits(state,content,{now,...ctx}),first=new Map(current.map(u=>[u.key,{u,day:0}]));
 for(let k=0;k<days;k++)for(const u of dueUnits(state,content,{now:Math.max(now,starts[k+1]-1),...ctx}))if(!first.has(u.key))first.set(u.key,{u,day:k});
 const memory=new Map(scheduledItems(state,content,{now}).map(x=>[x.key,x]));
 const out=Array.from({length:days},(_,k)=>({start:starts[k],end:starts[k+1],scheduled:0,simulated:0,byType:{}}));
 const add=(k,type,kind)=>{out[k][kind]++;(out[k].byType[type]||={scheduled:0,simulated:0})[kind]++;};
 // Successful on-time reviews of a model-scheduled item from `at`, each counted on the day it would fall due.
 const chain=(x,at)=>{let mem=x.memory,due=x.due,t=at;for(let i=0;i<4*days;i++){const r=review(mem,{grade:'good',now:t,due:Math.min(due,t)}),k=dayOf(r.due);if(k<0||r.due<=t)return;add(k,x.type,'simulated');mem=r.memory;due=t=r.due;}};
 let unmodelled=0;
 for(const {u,day} of first.values()){
  add(day,u.type,'scheduled');
  const at=Math.max(now,starts[day],Number.isFinite(u.due)?u.due:0),x=memory.get(u.key);
  if(u.item?.recovery){
   let streak=episodeOf(state?.recovery,u.key)?.streak??0,t=at;
   for(;;){if(++streak>=RECOVERY_SUCCESSES){if(x)chain(x,t);break;}t+=RECOVERY_GAP;const k=dayOf(t);if(k<0)break;add(k,u.type,'simulated');}
  }else if(x&&validMemory(x.memory))chain(x,at);
  else if(u.type==='reading')unmodelled++;
 }
 for(const d of out)d.total=d.scheduled+d.simulated;
 return {now,days:out,start:starts[0],end,dueNow:current.length,overdue:current.filter(u=>Number.isFinite(u.due)&&u.due<starts[0]).length,unmodelled};
}
// One run a day of `limit` units over a forecast: what each day's run takes and what carries to the next day. Only an
// estimate on top of the forecast; the learner can run more or less often, and the cap stays theirs.
export function runOutlook(fc,limit=RUN_DEFAULT){
 const n=validRunLimit(limit)?limit:RUN_DEFAULT;let carry=0;
 const days=(fc?.days||[]).map(d=>{const load=carry+d.total,done=Math.min(load,n);carry=load-done;return {start:d.start,load,done,carry};});
 return {limit:n,runsNow:Math.ceil((fc?.dueNow||0)/n),days};
}
// The ledger entry (schedule.mjs logOutcome) for a Today unit's applied answer. Its id names the run and position, so a
// repeated submission of the same unit never adds a second entry. Pattern re-tests and unseen texts are not scheduled by
// the model, so they are not in the ledger.
// A recovery unit's answer logs under the item's own type and ref with venue recovery.
export function unitEvent(runId,index,unit,event,now){
 if(!unit||unit.type==='pattern'||unit.type==='transfer'||!event)return null;
 return {at:now,type:unit.type,ref:unit.ref,venue:unit.item?.recovery?'recovery':'today',...event,id:`today:${runId}:${index}`};
}

// ── Ordering, cap and carry-over ─────────────────────────────────────────────────────────────────────────
const byDue=(a,b)=>a.due-b.due||(a.key<b.key?-1:a.key>b.key?1:0);
// Each source oldest first. At every step take the oldest head from a source other than the previous one; only when no
// other source has items left may two of the same type follow each other. Oldest within the alternation, not globally.
export function interleave(units){
 const queues=TYPES.map(t=>units.filter(u=>u.type===t).sort(byDue)),out=[];let prev=null;
 for(let left=units.length;left>0;left--){
  const heads=queues.filter(q=>q.length),other=heads.filter(q=>q[0].type!==prev);
  const pick=(other.length?other:heads).sort((a,b)=>byDue(a[0],b[0]))[0],u=pick.shift();
  out.push(u);prev=u.type;
 }
 return out;
}
// The snapshot is the first `limit` units of the full interleaved order; everything else is carry-over.
export function planRun(units,limit=RUN_DEFAULT){
 const n=validRunLimit(limit)?limit:RUN_DEFAULT,order=interleave(units);
 return {selected:order.slice(0,n),carry:order.slice(n),total:order.length,limit:n};
}

// ── Review debt and the new-lesson gate ──────────────────────────────────────────────────────────────────
export function reviewDebt(units){
 const due=Array.isArray(units)?units.length:units|0;
 return {due,limit:DEBT_LIMIT,open:due<DEBT_LIMIT,needed:Math.max(0,due-DEBT_LIMIT+1)};
}
export const gateMessage=debt=>debt.open?'':`${plural(debt.due,'review')} ${debt.due===1?'is':'are'} due. Complete ${debt.needed} to unlock a new lesson.`;
// A lesson is started once it was opened while allowed, finished, or answered. Started lessons and reviews never wait.
export function lessonStarted(state,id){
 const a=state?.answers?.[id];
 return !!state?.completed?.includes(id)||time(state?.daily?.started?.[id])||(plainObject(a)&&Object.keys(a).length>0);
}
export function lessonAccess(state,id,debt){
 const started=lessonStarted(state,id);
 return {allowed:started||debt.open,started,reason:started?'':gateMessage(debt)};
}
export function markStarted(daily,id,now){
 const d=base(daily);if(time(d.started[id]))return d;
 return {...d,started:{...d.started,[id]:now}};
}
export function setRunLimit(daily,n){
 if(!validRunLimit(n))return {daily,error:`Choose between ${RUN_MIN} and ${RUN_MAX} units.`};
 return {daily:{...base(daily),limit:n},error:''};
}

// ── The run ──────────────────────────────────────────────────────────────────────────────────────────────
// Active run: {id, started, limit, cursor, units, carry}. Units keep their snapshot order; each is pending, done or
// skipped. `cursor` is the unit on screen: a done unit stays there while its feedback shows, until advance().
// `step` holds a unit's in-progress state (card reveal and hint, passage answers), saved so a reload resumes it exactly.
const snap=u=>({key:u.key,type:u.type,ref:u.ref,revision:u.revision,due:u.due,...(u.item?{item:{...u.item}}:{}),status:'pending'});
export function startRun(daily,units,{now,limit,id=newRunId(now)}){
 const d=base(daily);
 if(d.active)return {daily:d,run:d.active,resumed:true};
 const plan=planRun(units,validRunLimit(limit)?limit:d.limit);
 if(!plan.selected.length)return {daily:d,run:null,resumed:false};
 const run={id,started:now,limit:plan.limit,cursor:0,units:plan.selected.map(snap),carry:countByType(plan.carry)};
 return {daily:{...d,active:run},run,resumed:false};
}
export const currentUnit=daily=>daily?.active?.units?.[daily.active.cursor]||null;
const current=(d,runId,index)=>!!d.active&&d.active.id===runId&&d.active.cursor===index;
const putUnit=(d,index,fn)=>({...d,active:{...d.active,units:d.active.units.map((u,i)=>i===index?fn(u):u)}});
export function updateStep(daily,runId,index,patch){
 const d=base(daily);if(!current(d,runId,index)||d.active.units[index].status!=='pending')return d;
 return putUnit(d,index,u=>({...u,step:{...(u.step||{}),...patch}}));
}
// Records a unit's outcome once. A repeated or late submission (another index, a finished run, a reload) applies nothing,
// so the caller commits source evidence only when `applied` is true.
export function recordOutcome(daily,runId,index,{result,outcome,score,given},now){
 const d=base(daily);
 if(!current(d,runId,index)||d.active.units[index].status!=='pending'||!['correct','missed','assisted'].includes(result))return {daily:d,applied:false};
 const u=d.active.units[index];
 if(!OUTCOMES[u.type].includes(outcome))return {daily:d,applied:false};
 return {daily:putUnit(d,index,x=>({...x,status:'done',result,outcome,at:now,...(score?{score:{correct:score.correct,total:score.total}}:{}),...(typeof given==='string'&&given?{given:given.slice(0,ANSWER_MAX)}:{})})),applied:true};
}
export function countResults(units){
 const out={};
 for(const u of units){
  const c=out[u.type]||={total:0,correct:0,missed:0,assisted:0,disputed:0,skipped:0,unfinished:0};
  c.total++;c[u.status==='pending'?'unfinished':u.result]++;
 }
 return out;
}
const historyUnit=u=>({key:u.key,type:u.type,...(u.recovery===true||u.item?.recovery?{recovery:true}:{}),status:u.status,...(u.result?{result:u.result}:{}),...(u.outcome?{outcome:u.outcome}:{}),...(u.score?{score:{...u.score}}:{}),...(u.reason?{reason:u.reason}:{})});
function close(d,end){
 const r=d.active,units=r.units.map(historyUnit);
 const record={id:r.id,started:r.started,...end,limit:r.limit,units,counts:countResults(units),carry:{...r.carry}};
 return {daily:{...d,active:null,history:[...d.history,record].slice(-HISTORY_MAX)},record};
}
// Moves past a finished unit. The run finishes, with finishedAt, only once every unit is done or skipped.
export function advance(daily,runId,now){
 const d=base(daily),r=d.active;
 if(!r||r.id!==runId||r.units[r.cursor].status==='pending')return {daily:d,finished:null};
 // The unit left behind keeps its result; its in-progress step is no longer needed.
 const units=r.units.map((u,i)=>{if(i!==r.cursor||!u.step)return u;const {step,...rest}=u;return rest;});
 const next=units.findIndex((u,i)=>i>r.cursor&&u.status==='pending');
 if(next>=0)return {daily:{...d,active:{...r,units,cursor:next}},finished:null};
 const {daily:out,record}=close({...d,active:{...r,units}},{finished:now});return {daily:out,finished:record};
}
// Ending early records an abandoned run. Its unfinished units are untouched in their sources, so they stay due.
export function abandonRun(daily,runId,now){
 const d=base(daily);if(!d.active||d.active.id!==runId)return {daily:d,record:null};
 return close(d,{abandoned:now});
}
// Does the source still hold this unit? Deleted content or a word no longer in any deck reads as removed.
export function sourceExists(unit,state,content,{kanjiChecks=null}={}){
 if(unit.item?.recovery)return recoveryTarget(unit.key,state,content)&&unit.item.recovery.every(p=>!!recoveryQuestion(unit.key,p,state,content,{kanjiChecks}));
 if(unit.type==='lesson')return !!content?.lessons?.some(l=>l.id===unit.ref);
 if(['passage','phrase'].includes(unit.type))return !!reviewTarget(unit.key,content);
 if(unit.type==='pattern')return !!content?.patterns?.some(p=>p.id===unit.ref)&&itemPatternIn(content?.lessons?.find(l=>l.id===unit.item?.lesson),unit.item?.item)===unit.ref;
 if(unit.type==='transfer')return !!findText(content,unit.ref);
 if(unit.type==='word')return reviewPrompts(state,'all').some(p=>p.key===unit.ref)&&!!content?.vocabulary?.some(w=>w.id===unit.ref.split('|')[0]);
 if(!isKanjiWord(content?.vocabulary?.find(w=>w.id===unit.ref)))return false;
 const it=unit.item||{};
 if(it.sentence)return !!kanjiChecks?.sentences?.some(s=>s.id===it.sentence&&s.word===unit.ref);
 const [kind,id]=String(it.source).split(':'),c=(kind==='lesson'?content?.lessons:content?.passages)?.find(x=>x.id===id);
 return c?.occurrences?.[it.occurrence]?.word===unit.ref;
}
// On resume: a pending unit whose source changed since the snapshot (answered elsewhere, no longer due) or disappeared is
// skipped with its reason. Nothing is awarded and nothing replaces it; new due items wait in the live backlog.
export function revalidate(daily,live,{now,exists=()=>true}){
 let d=base(daily);const r=d.active;if(!r)return {daily:d,skipped:[],finished:null};
 const map=new Map(live.map(u=>[u.key,u])),skipped=[];
 const units=r.units.map(u=>{
  if(u.status!=='pending')return u;
  const l=map.get(u.key);if(l&&l.revision===u.revision)return u;
  const reason=exists(u)?'resolved':'removed';skipped.push({key:u.key,type:u.type,reason});
  const {step,...rest}=u;return {...rest,status:'skipped',result:'skipped',reason,at:now};
 });
 if(!skipped.length)return {daily:d,skipped,finished:null};
 d={...d,active:{...r,units}};
 if(units[r.cursor].status!=='skipped')return {daily:d,skipped,finished:null};
 const next=units.findIndex((u,i)=>i>r.cursor&&u.status==='pending');
 if(next>=0)return {daily:{...d,active:{...d.active,cursor:next}},skipped,finished:null};
 const out=close(d,{finished:now});return {daily:out.daily,skipped,finished:out.record};
}

// ── Saved state and backups ──────────────────────────────────────────────────────────────────────────────
// Reads `daily` from saved state or a backup. Strict reads (restore) reject the whole file with a message; lenient reads
// (local state) drop what they cannot use. An active unit whose source has gone keeps its place and is skipped on resume.
const RECOVERABLE=['lesson','passage','phrase','word','reading'],ROUND_MAX=3;
const recoveryItem=item=>plainObject(item)&&Object.keys(item).join()==='recovery'&&Array.isArray(item.recovery)&&item.recovery.length>=1&&item.recovery.length<=ROUND_MAX&&item.recovery.every(p=>typeof p==='string'&&PROMPT_ID.test(p))&&new Set(item.recovery).size===item.recovery.length;
function validItem(type,item){
 if(RECOVERABLE.includes(type)&&plainObject(item)&&'recovery' in item)return recoveryItem(item);
 if(type==='pattern')return plainObject(item)&&Object.keys(item).sort().join(',')==='item,lesson'&&SLUG.test(item.lesson||'')&&ITEM_ID.test(item.item||'');
 if(type!=='reading')return item===undefined;
 if(!plainObject(item))return false;
 const keys=Object.keys(item).sort().join(',');
 if(keys==='sentence')return SLUG.test(item.sentence||'');
 return keys==='occurrence,source'&&READING_SOURCE.test(item.source||'')&&count(item.occurrence);
}
function validRef(type,ref){
 if(typeof ref!=='string'||!ref||ref.length>200)return false;
 return type==='word'?PROMPT.test(ref):SLUG.test(ref);
}
// A lesson unit, or a pattern re-test drawn from a lesson, that names a lesson which became an optional practice (recall.mjs
// CONVERTED) is accepted as it was; on resume it reads as removed, as any unit whose source left the course.
function refKnown(u,content){
 if(u.type==='lesson')return !!content?.lessons?.some(l=>l.id===u.ref)||isConverted(u.ref);
 if(['passage','phrase'].includes(u.type))return !!reviewTarget(u.key,content);
 if(u.type==='pattern')return !!content?.patterns?.some(p=>p.id===u.ref)&&(!!content?.lessons?.some(l=>l.id===u.item?.lesson)||isConverted(u.item?.lesson));
 if(u.type==='transfer')return !!findText(content,u.ref);
 return !!content?.vocabulary?.some(w=>w.id===(u.type==='word'?u.ref.split('|')[0]:u.ref));
}
function validStep(u,step,content){
 if(step===undefined)return true;
 if(!plainObject(step))return false;
 const keys=Object.keys(step);
 // A recovery unit keeps its answers in order, one per prompt: a drill's whole-item result, or a choice index.
 if(u.item?.recovery){
  if(!keys.every(k=>k==='answers'))return false;
  const list=step.answers??[];
  return Array.isArray(list)&&list.length<=u.item.recovery.length&&list.every((a,i)=>plainObject(a)&&Object.keys(a).length===2&&a.p===u.item.recovery[i]&&(u.type==='lesson'?typeof a.ok==='boolean':Number.isInteger(a.choice)&&a.choice>=0&&a.choice<8));
 }
 // A lesson review keeps its answers with the lesson (state.answers), so it needs no step. Saves from the typed-answer
 // version may hold {assisted}; that reads back and is ignored.
 if(u.type==='lesson')return keys.every(k=>k==='assisted')&&(step.assisted===undefined||typeof step.assisted==='boolean');
 if(u.type==='word')return keys.every(k=>k==='revealed'||k==='hint')&&keys.every(k=>typeof step[k]==='boolean');
 // An unseen text keeps its answers in its own draft (transfer.mjs), so a step only marks that the unit was started.
 if(u.type==='transfer')return keys.every(k=>k==='started')&&(step.started===undefined||step.started===true);
 if(u.type!=='passage')return !keys.length;
 if(!keys.every(k=>k==='mode'||k==='answers')||(step.mode!==undefined&&!['closed','supported'].includes(step.mode)))return false;
 if(step.answers===undefined)return true;
 const bank=content?.passages?.find(p=>p.id===u.ref)?.recall?.delayed||[],seen=new Set();
 return Array.isArray(step.answers)&&step.answers.length<=bank.length&&step.answers.every(a=>{const q=bank.find(x=>x.id===a?.q);if(!plainObject(a)||Object.keys(a).length!==2||!q||seen.has(q.id)||!Number.isInteger(a.choice)||a.choice<0||a.choice>=q.choices.length)return false;seen.add(q.id);return true;});
}
// Fields shared by active and history units: identity, status and the recorded result.
function validResult(u,{history=false}={}){
 if(!plainObject(u)||!TYPES.includes(u.type)||typeof u.key!=='string'||!STATUSES.includes(u.status))return false;
 const ref=history?u.key.slice(u.type.length+1):u.ref;
 if(!validRef(u.type,ref)||u.key!==unitKey(u.type,ref))return false;
 if(u.status==='pending')return u.result===undefined&&u.outcome===undefined&&u.score===undefined&&u.reason===undefined&&u.given===undefined;
 if(u.status==='skipped')return u.result==='skipped'&&SKIP_REASONS.includes(u.reason)&&u.outcome===undefined&&u.score===undefined&&(history||time(u.at));
 if(!['correct','missed','assisted','disputed'].includes(u.result)||!OUTCOMES[u.type].includes(u.outcome)||u.reason!==undefined)return false;
 if((u.result==='disputed')!==(u.outcome==='disputed'))return false;
 const validScore=s=>plainObject(s)&&count(s.correct)&&Number.isInteger(s.total)&&s.total>=1&&s.correct<=s.total;
 if(u.type==='passage'||u.type==='transfer'){if(!validScore(u.score))return false;}
 else if(u.type==='lesson'){if(['passed','failed'].includes(u.outcome)?!validScore(u.score):u.score!==undefined)return false;}
 else if(u.score!==undefined)return false;
 return history||(time(u.at)&&(u.given===undefined||(typeof u.given==='string'&&u.given.length<=ANSWER_MAX)));
}
const ACTIVE_KEYS=new Set(['key','type','ref','revision','due','item','status','result','outcome','score','given','reason','at','step']);
function readActiveUnit(u,content,strict){
 if(!plainObject(u)||Object.keys(u).some(k=>!ACTIVE_KEYS.has(k))||typeof u.ref!=='string'||!validResult(u)||typeof u.revision!=='string'||u.revision.length>80||!time(u.due)||!validItem(u.type,u.item))return null;
 const known=refKnown(u,content);
 if(strict&&!known)return null;
 // A step only makes sense for the unit on screen; one that no longer fits its content is dropped.
 const step=u.step!==undefined&&known&&validStep(u,u.step,content)?JSON.parse(JSON.stringify(u.step)):undefined;
 if(strict&&u.step!==undefined&&step===undefined)return null;
 const {step:_,...rest}=u;return {...JSON.parse(JSON.stringify(rest)),...(step?{step}:{})};
}
const COUNT_FIELDS=['total','correct','missed','assisted','disputed','skipped','unfinished'];
const sameCounts=(a,b)=>plainObject(b)&&Object.keys(a).sort().join()===Object.keys(b).sort().join()&&Object.entries(a).every(([t,c])=>plainObject(b[t])&&Object.keys(b[t]).length===COUNT_FIELDS.length&&COUNT_FIELDS.every(f=>b[t][f]===c[f]));
const validCarry=c=>plainObject(c)&&Object.entries(c).every(([t,n])=>TYPES.includes(t)&&Number.isInteger(n)&&n>0);
function readRun(r,content,strict){
 if(!plainObject(r)||!RUN_ID.test(r.id||'')||!time(r.started)||!validRunLimit(r.limit)||!Array.isArray(r.units)||!r.units.length||r.units.length>r.limit||!Number.isInteger(r.cursor)||r.cursor<0||r.cursor>=r.units.length||!validCarry(r.carry))return null;
 const units=[];
 for(const x of r.units){const u=readActiveUnit(x,content,strict);if(!u)return null;units.push(u);}
 if(new Set(units.map(u=>u.key)).size!==units.length)return null;
 // Units before the cursor are finished; none after it is done yet; only the unit on screen carries a step.
 if(units.some((u,i)=>(i<r.cursor&&u.status==='pending')||(i>r.cursor&&u.status==='done')||(i!==r.cursor&&u.step)))return null;
 return {id:r.id,started:r.started,limit:r.limit,cursor:r.cursor,units,carry:{...r.carry}};
}
const HISTORY_KEYS=new Set(['key','type','recovery','status','result','outcome','score','reason']);
const legacyUnit=u=>plainObject(u)&&LEGACY_TYPES.includes(u.type);
// A finished run that held units of a removed type keeps its other units; their counts and carry-over go with them.
function withoutLegacy(r){
 if(!plainObject(r)||!Array.isArray(r.units)||!r.units.some(legacyUnit))return r;
 const strip=o=>plainObject(o)?Object.fromEntries(Object.entries(o).filter(([t])=>!LEGACY_TYPES.includes(t))):o;
 return {...r,units:r.units.filter(u=>!legacyUnit(u)),counts:strip(r.counts),carry:strip(r.carry)};
}
function readRecord(raw){
 const r=withoutLegacy(raw);
 if(!plainObject(r)||!RUN_ID.test(r.id||'')||!time(r.started)||!validRunLimit(r.limit)||!Array.isArray(r.units)||!r.units.length||r.units.length>r.limit||!validCarry(r.carry))return null;
 const end=r.finished!==undefined?'finished':'abandoned';
 if((r.finished!==undefined)===(r.abandoned!==undefined)||!time(r[end])||r[end]<r.started)return null;
 const units=[];
 for(const u of r.units){if(!plainObject(u)||Object.keys(u).some(k=>!HISTORY_KEYS.has(k))||(u.recovery!==undefined&&(u.recovery!==true||!RECOVERABLE.includes(u.type)))||!validResult(u,{history:true}))return null;units.push(historyUnit(u));}
 if(new Set(units.map(u=>u.key)).size!==units.length||(end==='finished'&&units.some(u=>u.status==='pending')))return null;
 const counts=countResults(units);
 if(!sameCounts(counts,r.counts))return null;
 return {id:r.id,started:r.started,[end]:r[end],limit:r.limit,units,counts,carry:{...r.carry}};
}
export function readDailyState(value,content,{strict=false}={}){
 const fail=msg=>{if(strict)throw Error(msg);},out=emptyDaily(),raw=value?.daily;
 if(raw===undefined||raw===null)return {daily:out};
 if(!plainObject(raw)||raw.version!==DAILY_VERSION){fail('This backup contains invalid Today session data.');return {daily:out};}
 if(raw.limit!==undefined){if(validRunLimit(raw.limit))out.limit=raw.limit;else fail('This backup contains an invalid Today run size.');}
 if(raw.started!==undefined){
  if(!plainObject(raw.started))fail('This backup contains invalid lesson start records.');
  // A start in a lesson that became an optional practice (recall.mjs CONVERTED) is history and is kept as it was.
  else for(const [id,at] of Object.entries(raw.started)){if((content?.lessons?.some(l=>l.id===id)||isConverted(id))&&time(at))out.started[id]=at;else fail('This backup contains an invalid lesson start record.');}
 }
 // A run in progress that includes a removed unit type is dropped; its units are still due in their sources.
 if(raw.active!==undefined&&raw.active!==null&&!(Array.isArray(raw.active.units)&&raw.active.units.some(legacyUnit))){const r=readRun(raw.active,content,strict);if(r)out.active=r;else fail('This backup contains an invalid Today run.');}
 if(raw.history!==undefined){
  if(!Array.isArray(raw.history)||raw.history.length>HISTORY_MAX)fail('This backup contains an invalid Today session history.');
  else for(const r of raw.history){if(Array.isArray(r?.units)&&r.units.length&&r.units.every(legacyUnit))continue;const rec=readRecord(r);if(rec)out.history.push(rec);else fail('This backup contains an invalid Today session record.');}
  if(new Set(out.history.map(r=>r.id)).size!==out.history.length){fail('This backup repeats a Today session record.');out.history=[...new Map(out.history.map(r=>[r.id,r])).values()];}
 }
 if(out.active&&out.history.some(r=>r.id===out.active.id)){fail('This backup lists the active Today run as finished.');out.active=null;}
 return {daily:out};
}
