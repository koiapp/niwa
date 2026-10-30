// One review scheduler for every scheduled source: lesson reviews, passage recall, harvested phrases, word cards and
// kanji readings in new sentences. Each source keeps its own record, identity and evidence; this module only owns the
// memory model inside those records, the normalized outcome of an answer and the outcome ledger behind the rolling
// 30-day report. Pure and dependency-free: every function takes `now`, so tests inject the clock.
//
// ── Model (scheduler version 1) ──────────────────────────────────────────────────────────────────────────────────────
// The memory model is FSRS-5 with its published default parameters, pinned below, as described in
// https://github.com/open-spaced-repetition/awesome-fsrs/wiki/The-Algorithm (consulted 2026-10-21):
//  R(t,S) = (1 + FACTOR·t/S)^DECAY with DECAY = −0.5 and FACTOR = 19/81, so R(S,S) = 0.90.
//  D0(G) = w4 − e^(w5·(G−1)) + 1; D' = D + ΔD·(10−D)/9 with ΔD = −w6·(G−3); D'' = w7·D0(4) + (1−w7)·D'.
//  S after success: S·(e^w8·(11−D)·S^−w9·(e^(w10·(1−R))−1) + 1).
//  S after a lapse: min(S, w11·D^−w12·((S+1)^w13 − 1)·e^(w14·(1−R))).
// The weights are not fitted to Niwa learners; nobody's review history has been used to train them.
// Custom approximations, chosen to keep the app's established rules (each is a product choice, not part of FSRS):
//  · Entry. A new item starts at a stability of ENTRY_DAYS (1 day) whatever its first grade, because the first review
//    the next day is the existing policy; FSRS's initial stabilities (w0–w3) are not used.
//  · Hard and assisted answers hold: the item returns after its current interval with its stability unchanged (FSRS
//    would grow it a little). Hard still raises difficulty. Only a delayed, unassisted Good grows stability.
//  · A lapse returns the item after the source's own relearning delay (1 day; 10 minutes for word cards) instead of
//    after the post-lapse stability. Stability itself drops by the FSRS forgetting formula.
//  · No same-day (short-term) stability formula: answers before the due time never grow stability.
//  · Intervals after a success are whole days between MIN_DAYS and MAX_DAYS.
//  · Lapse history works through difficulty: each lapse is an Again, which raises D, and a higher D means smaller
//    growth after a success and lower stability after the next lapse. Records from before this version seed D as if
//    each recorded lapse had been an Again.
// The 0.90 target is a design goal. These rules cannot show that learners actually recall 90% of due items; that needs
// longitudinal evidence from real reviews.
export const SCHEDULER_VERSION=1;
export const MODEL='FSRS-5';
export const WEIGHTS=Object.freeze([0.40255,1.18385,3.173,15.69105,7.1949,0.5345,1.4604,0.0046,1.54575,0.1192,1.01925,1.9395,0.11,0.29605,2.2698,0.2315,2.9898,0.51655,0.6621]);
export const DECAY=-0.5,FACTOR=19/81;
export const TARGET=0.9;
export const MINUTE=60000,DAY=86400000;
export const ENTRY_DAYS=1,MIN_DAYS=1,MAX_DAYS=180;
export const S_MIN=0.01,S_MAX=36500,D_MIN=1,D_MAX=10;
// Lapses since recovery reset once a success schedules an interval of at least this many days.
export const RECOVERY_DAYS=7;
export const GRADES=['again','hard','good'];
const GRADE={again:1,hard:2,good:3};
const w=WEIGHTS;
const plainObject=v=>!!v&&typeof v==='object'&&!Array.isArray(v);
const finite=Number.isFinite;
const clamp=(x,a,b)=>Math.min(b,Math.max(a,x));
const round=(x,n)=>{const k=10**n;return Math.round(x*k)/k;};

// ── Model functions ──────────────────────────────────────────────────────────────────────────────────────────────────
export const retrievability=(days,s)=>s>0?(1+FACTOR*Math.max(0,days)/s)**DECAY:0;
// Days until recall falls to `target`. At the 0.90 target this equals the stability.
export const daysToTarget=(s,target=TARGET)=>s/FACTOR*(target**(1/DECAY)-1);
export const boundDays=days=>clamp(Math.round(finite(days)?days:MIN_DAYS),MIN_DAYS,MAX_DAYS);
export const initialDifficulty=grade=>clamp(w[4]-Math.exp(w[5]*(GRADE[grade]-1))+1,D_MIN,D_MAX);
export function nextDifficulty(d,grade){
 const delta=-w[6]*(GRADE[grade]-3),damped=d+delta*(10-d)/9,easy=w[4]-Math.exp(w[5]*3)+1;
 return clamp(w[7]*easy+(1-w[7])*damped,D_MIN,D_MAX);
}
export const successStability=(s,d,r)=>clamp(s*(Math.exp(w[8])*(11-d)*s**-w[9]*(Math.exp(w[10]*(1-r))-1)+1),S_MIN,S_MAX);
export const lapseStability=(s,d,r)=>clamp(Math.min(s,w[11]*d**-w[12]*((s+1)**w[13]-1)*Math.exp(w[14]*(1-r))),S_MIN,S_MAX);

// ── Memory ───────────────────────────────────────────────────────────────────────────────────────────────────────────
// memory = {v, s, d, ivl, recent}: scheduler version, stability and difficulty, the scheduled interval in days that led
// to the record's due time, and lapses since the item last recovered. Lifetime lapses stay in each source's own
// `lapses` field. The review the interval started from is due − ivl days, so no timestamp is ever invented.
const MEMORY_KEYS=['d','ivl','recent','s','v'];
// s and d are rounded to 4 decimals so saved state reads back identically; ivl is kept exact (whole days, or a source's
// relearning delay such as 10 minutes) so due − ivl names the interval start to the millisecond.
const pack=(s,d,ivl,recent)=>({v:SCHEDULER_VERSION,s:round(clamp(s,S_MIN,S_MAX),4),d:round(clamp(d,D_MIN,D_MAX),4),ivl:clamp(ivl,0.0001,MAX_DAYS),recent});
export function validMemory(m){
 return plainObject(m)&&Object.keys(m).sort().join()===MEMORY_KEYS.join()&&m.v===SCHEDULER_VERSION&&finite(m.s)&&m.s>=S_MIN&&m.s<=S_MAX&&finite(m.d)&&m.d>=D_MIN&&m.d<=D_MAX&&finite(m.ivl)&&m.ivl>0&&m.ivl<=MAX_DAYS&&Number.isInteger(m.recent)&&m.recent>=0;
}
export const cleanMemory=m=>({v:m.v,s:m.s,d:m.d,ivl:m.ivl,recent:m.recent});
// A new item: stability ENTRY_DAYS, difficulty from its first grade, next check after `ivl` days.
export const enterMemory=(grade='good',ivl=ENTRY_DAYS)=>pack(ENTRY_DAYS,initialDifficulty(grade),ivl,0);
// Difficulty for a record from before scheduler version 1: D0(Good), then one Again per recorded lapse.
export function seedDifficulty(lapses=0){let d=initialDifficulty('good');for(let i=0;i<Math.min(lapses|0,50);i++)d=nextDifficulty(d,'again');return d;}
// Memory for a record from before scheduler version 1. `ivl` is the interval its due time was set with, which becomes
// the stability (R = 0.90 at the due time), never less than ENTRY_DAYS. `recent` is a lower bound the source derives.
export const seedMemory=({ivl,lapses=0,recent=0})=>pack(Math.max(ivl,ENTRY_DAYS),seedDifficulty(lapses),ivl,recent);
// When the current interval started, or null without a due time.
export const anchorOf=(m,due)=>finite(due)&&m?due-m.ivl*DAY:null;
// Estimated recall now, for reports and forecasts. Not a measurement.
export function recallAt(m,due,now){if(!validMemory(m)||!finite(due)||!finite(now))return null;return retrievability((now-anchorOf(m,due))/DAY,m.s);}

// ── Outcomes ─────────────────────────────────────────────────────────────────────────────────────────────────────────
// Every source's answer reduced to {grade, assisted, self}. The thresholds stay the sources' own: a lesson review passes
// with at most one miss (exercises.mjs), a passage only when every first response was correct from memory (recall.mjs).
// kanji: a card's trial on the Kanji page (kanji-cards.mjs trialEvent): evidence only, never scheduled, never a Today unit.
export const TYPES=['lesson','passage','phrase','word','reading','kanji'];
// Kanji parts and kanji meaning answers (types component and meaning), retired in kanji Phase 3c (2026-10-23).
export const RETIRED_TYPES=['component','meaning'];
export function normalizeOutcome(type,raw={}){
 switch(type){
  case 'lesson':return {grade:raw.passed?'good':'again',assisted:false,self:false};
  case 'passage':return {grade:raw.mode==='closed'&&raw.allCorrect?'good':'again',assisted:raw.mode==='supported',self:false};
  case 'phrase':case 'reading':case 'kanji':return {grade:raw.correct?'good':'again',assisted:false,self:false};
  case 'word':if(!GRADES.includes(raw.rating))throw new RangeError('Unknown rating.');return {grade:raw.rating,assisted:!!raw.supported,self:true};
  default:throw new RangeError(`Unknown review type ${type}.`);
 }
}
// effect: what the answer did to the schedule. reason: why it could not grow stability.
export const EFFECTS=['first','advanced','maintained','held','lapsed','unchanged','recorded'];
export const REASONS=['first','early','retry','relearning','assisted','hard','not-delayed','stale'];

// One answer applied to a memory. prev: the memory (null for a new item); due: the record's due time.
// Options: grade, now, assisted, retry (an in-session repeat), delayed (false when a source's own delay rule is not met,
// as for kanji readings), relearn (days until a lapsed item returns). Returns
// {memory, due, effect, eligible, reason, lapsed}. Nothing here reads the clock, and the same input gives the same output.
export function review(prev,{grade,now,due,assisted=false,retry=false,delayed=true,relearn=1}){
 if(!finite(now))throw new TypeError('review() needs the current time.');
 if(!GRADES.includes(grade))throw new RangeError('Unknown grade.');
 if(!finite(relearn)||relearn<=0)throw new RangeError('The relearning delay must be positive.');
 const keep=reason=>({memory:prev,due,effect:'unchanged',eligible:false,reason,lapsed:false});
 if(!prev){
  // First answer: the entry interval after Good, the relearning delay otherwise. Never a lapse, never eligible.
  const ivl=grade==='good'&&!assisted?ENTRY_DAYS:relearn,memory=enterMemory(grade,ivl);
  return {memory,due:now+ivl*DAY,effect:'first',eligible:false,reason:'first',lapsed:false};
 }
 if(!validMemory(prev)||!finite(due))throw new TypeError('review() needs a valid memory and due time.');
 const isDue=due<=now,r=retrievability((now-anchorOf(prev,due))/DAY,prev.s);
 if(retry)return keep('retry');
 if(grade==='again'){
  // Forgetting counts even before the due time, except while the item is already relearning (its interval is the
  // relearning delay): a repeated or duplicate Again there changes nothing.
  if(!isDue&&prev.ivl<=relearn)return keep('relearning');
  const memory=pack(lapseStability(prev.s,prev.d,r),nextDifficulty(prev.d,'again'),relearn,prev.recent+1);
  return {memory,due:now+relearn*DAY,effect:'lapsed',eligible:isDue,reason:isDue?null:'early',lapsed:true};
 }
 if(!isDue)return keep('early');
 const hold=(reason,d=prev.d)=>({memory:pack(prev.s,d,prev.ivl,prev.recent),due:now+prev.ivl*DAY,effect:'held',eligible:reason==='hard',reason,lapsed:false});
 if(assisted)return hold('assisted');
 if(grade==='hard')return hold('hard',nextDifficulty(prev.d,'hard'));
 if(!delayed)return hold('not-delayed');
 const s=successStability(prev.s,prev.d,r),ivl=boundDays(daysToTarget(s));
 const memory=pack(s,nextDifficulty(prev.d,'good'),ivl,ivl>=RECOVERY_DAYS?0:prev.recent);
 return {memory,due:now+ivl*DAY,effect:ivl>prev.ivl?'advanced':'maintained',eligible:true,reason:null,lapsed:false};
}
// The fields a ledger entry takes from a scheduled answer.
export const eventOf=(res,{grade,assisted=false,self=false})=>({grade,assisted:!!assisted,self:!!self,eligible:res.eligible,effect:res.effect,...(res.reason?{reason:res.reason}:{})});

// ── Forecast inputs ──────────────────────────────────────────────────────────────────────────────────────────────────
// Scheduled items ({due}) per day from `now`: index 0 holds everything due by the end of the first 24 hours, overdue
// items included. Days beyond `days` are left out.
export function forecast(items,{now,days=30}={}){
 if(!finite(now))throw new TypeError('forecast() needs the current time.');
 const out=Array(Math.max(0,days|0)).fill(0);
 for(const x of items||[]){if(!finite(x?.due))continue;const k=Math.max(0,Math.floor((x.due-now)/DAY));if(k<out.length)out[k]++;}
 return out;
}

// ── Outcome ledger ───────────────────────────────────────────────────────────────────────────────────────────────────
// state.outcomes = {version, since, dropped, events}. One entry per applied answer from any scheduled source, or from a
// kanji reading checked in a text or a card's trial on the Kanji page (effect `recorded`: evidence only, no schedule). Entries older than LEDGER_DAYS are
// pruned, so a rolling 30-day window never loses an answer to a per-source log cap. `since` is when this ledger began:
// answers before it are unknown, not absent. LEDGER_MAX guards storage; whatever it drops is counted in `dropped`, with
// the newest dropped time in `droppedAt`, so a report can say so.
export const LEDGER_VERSION=1,LEDGER_DAYS=31,LEDGER_MAX=20000,REPORT_DAYS=30;
// checkpoint: a lesson review lapsed by a miss in a cumulative checkpoint (checkpoints.mjs). recovery: an answer to a
// changed-context recovery prompt (below), logged under the recovering item's own type and ref.
export const VENUES=['today','lesson','passage','phrases','cards','kanji','text','checkpoint','recovery'];
const EVENT_KEYS=new Set(['id','at','type','ref','venue','grade','assisted','self','eligible','effect','reason']);
const REF=/^[A-Za-z0-9][A-Za-z0-9|,>:-]{0,159}$/;
export const emptyLedger=(since=null)=>({version:LEDGER_VERSION,since,dropped:0,events:[]});
const ledgerBase=l=>l?.version===LEDGER_VERSION&&Array.isArray(l.events)?l:emptyLedger();
// Starts the ledger's coverage the first time this build runs. Idempotent.
export const ensureLedger=(ledger,now)=>{const l=ledgerBase(ledger);return l.since===null&&finite(now)?{...l,since:now}:l;};
export const eventId=e=>`${e.type}:${e.ref}@${e.at}`;
export function validEvent(e){
 return plainObject(e)&&Object.keys(e).every(k=>EVENT_KEYS.has(k))&&typeof e.id==='string'&&e.id.length>0&&e.id.length<=200&&finite(e.at)&&e.at>=0&&TYPES.includes(e.type)&&typeof e.ref==='string'&&REF.test(e.ref)&&VENUES.includes(e.venue)&&GRADES.includes(e.grade)&&
  typeof e.assisted==='boolean'&&typeof e.self==='boolean'&&typeof e.eligible==='boolean'&&EFFECTS.includes(e.effect)&&(e.reason===undefined||REASONS.includes(e.reason))&&!(e.eligible&&e.effect==='unchanged');
}
const cleanEvent=e=>({id:e.id,at:e.at,type:e.type,ref:e.ref,venue:e.venue,grade:e.grade,assisted:e.assisted,self:e.self,eligible:e.eligible,effect:e.effect,...(e.reason?{reason:e.reason}:{})});
function prune(l,now){
 const cut=now-LEDGER_DAYS*DAY;let events=l.events.filter(e=>e.at>=cut),dropped=l.dropped,droppedAt=l.droppedAt;
 if(events.length>LEDGER_MAX){const sorted=[...events].sort((a,b)=>a.at-b.at),gone=sorted.slice(0,events.length-LEDGER_MAX),ids=new Set(gone.map(e=>e.id));events=events.filter(e=>!ids.has(e.id));dropped+=gone.length;droppedAt=Math.max(droppedAt??0,...gone.map(e=>e.at));}
 return {...l,events,dropped,...(droppedAt!==undefined?{droppedAt}:{})};
}
// Appends one answer. An entry whose id is already present changes nothing, so a repeated submission never counts twice.
export function logOutcome(ledger,event,now){
 const l=ensureLedger(ledger,now),e={...event,id:event?.id??eventId(event||{})};
 if(!finite(now)||!validEvent(e)||l.events.some(x=>x.id===e.id))return {ledger:l,added:false};
 return {ledger:prune({...l,events:[...l.events,cleanEvent(e)]},now),added:true};
}
// The rolling window ending at `now` (both ends included; entries after `now` are ignored). Self-rated word cards, scored
// answers, assisted answers and recovery answers are counted apart; `rate` is recalled/eligible over eligible answers only
// (null without any), so a duplicate submission, an in-session retry or an early answer never enters a denominator.
// coverage.complete is false when the ledger began after the window opened or dropped entries inside it: the report then
// covers less than the full window and says so. Nothing is inferred from per-source counters.
// sources: one row per review type with its own unit and basis. A lesson review is one batch of about six closed-book
// items that passes with at most one miss, so its rate is batches passed, never per-question accuracy. Word cards are
// self-rated. Lesson lapses routed from a checkpoint miss are not lesson reviews: they count as `routed`, outside the rate.
export const SOURCE_UNITS={lesson:'batch',passage:'set',phrase:'answer',reading:'answer',word:'rating',kanji:'answer'};
export function outcomeReport(ledger,now,{days=REPORT_DAYS}={}){
 const l=ledgerBase(ledger),from=now-days*DAY,events=l.events.filter(e=>e.at>=from&&e.at<=now);
 const tally=list=>{const eligible=list.filter(e=>e.eligible),recalled=eligible.filter(e=>e.grade!=='again').length;return {answers:list.length,eligible:eligible.length,recalled,lapses:list.filter(e=>e.effect==='lapsed').length,rate:eligible.length?recalled/eligible.length:null};};
 const byType=Object.fromEntries(TYPES.map(t=>[t,events.filter(e=>e.type===t)]).filter(([,x])=>x.length).map(([t,x])=>[t,tally(x)]));
 const why=Object.fromEntries(REASONS.map(r=>[r,events.filter(e=>e.reason===r).length]).filter(([,n])=>n));
 const droppedIn=l.dropped>0&&(l.droppedAt??Infinity)>=from;
 const normal=events.filter(e=>e.venue!=='recovery'),recovery=events.filter(e=>e.venue==='recovery');
 const sources=TYPES.map(type=>{
  const all=normal.filter(e=>e.type===type),routed=type==='lesson'?all.filter(e=>e.venue==='checkpoint').length:0,own=all.filter(e=>!(type==='lesson'&&e.venue==='checkpoint'));
  const counted=own.filter(e=>!e.assisted),t=tally(counted);
  return {type,unit:SOURCE_UNITS[type],basis:type==='word'?'self-rated':'assessed',answers:own.length,eligible:t.eligible,recalled:t.recalled,rate:t.rate,
   supported:own.filter(e=>e.assisted).length,practice:counted.length-t.eligible,routed,recovery:tally(recovery.filter(e=>e.type===type))};
 });
 return {from,to:now,days,coverage:{since:l.since,complete:l.since!==null&&l.since<=from&&!droppedIn,dropped:droppedIn?l.dropped:0},
  total:events.length,scored:tally(normal.filter(e=>!e.self&&!e.assisted)),self:tally(normal.filter(e=>e.self&&!e.assisted)),assisted:tally(normal.filter(e=>e.assisted)),recovery:tally(recovery),sources,byType,reasons:why};
}
// Reads `outcomes` from saved state or a backup. Strict reads (restore) reject the whole file; lenient reads drop what
// they cannot use. A save from before the ledger has none: its coverage starts when this build first runs. Entries of a
// retired type (RETIRED_TYPES) are dropped in both reads, so an older backup still restores.
export function readLedger(value,{strict=false}={}){
 const fail=msg=>{if(strict)throw Error(msg);},raw=value?.outcomes,out=emptyLedger();
 if(raw===undefined||raw===null)return {outcomes:out};
 if(!plainObject(raw)||raw.version!==LEDGER_VERSION||!Array.isArray(raw.events)||raw.events.length>LEDGER_MAX){fail('This backup contains an invalid review outcome history.');return {outcomes:out};}
 if(raw.since!==null&&!(finite(raw.since)&&raw.since>=0))fail('This backup contains an invalid review outcome history.');else out.since=raw.since;
 if(raw.dropped!==undefined){if(Number.isInteger(raw.dropped)&&raw.dropped>=0)out.dropped=raw.dropped;else fail('This backup contains an invalid review outcome history.');}
 if(raw.droppedAt!==undefined){if(finite(raw.droppedAt)&&raw.droppedAt>=0&&out.dropped>0)out.droppedAt=raw.droppedAt;else fail('This backup contains an invalid review outcome history.');}
 const ids=new Set();
 for(const e of raw.events){if(plainObject(e)&&RETIRED_TYPES.includes(e.type))continue;if(!validEvent(e)||ids.has(e.id)){fail('This backup contains an invalid review outcome.');continue;}ids.add(e.id);out.events.push(cleanEvent(e));}
 return {outcomes:out};
}

// ── Recovery (leeches) ───────────────────────────────────────────────────────────────────────────────────────────────
// An item that keeps failing in one venue is taken out of it. Its third eligible lapse since it entered the schedule or
// last recovered opens a recovery episode: normal delivery stops, and the item is asked through changed prompts (another
// sentence, another unit's drill, a phrase in a new sentence; recovery.mjs resolves them) until it has two unassisted
// successes, each at least RECOVERY_GAP after the preceding qualifying attempt and each on a prompt this episode has not
// used. A miss resets the streak and starts a new wait; retries, assisted or early answers and repeated prompts change
// nothing. Completion closes the episode, restarts the lapse count and hands the item back to its source schedule, which
// the caller credits once with the completing answer. Lifetime lapse totals stay in each source's own record.
// state.recovery = {version, since, items: {key: {lapses, done, episode?}}}, key `${type}:${ref}` as in Today. lapses:
// eligible lapses since entry or the previous recovery; done: completed episodes. episode = {since, venue, origin, route,
// last, streak, misses, seen}: when and where it began (venue is null for a migrated record, whose failing venue is not
// known), lapse or migrated, the destination kind, the preceding qualifying attempt (the next is due RECOVERY_GAP after
// it), successes in a row, misses, and the prompt IDs this episode has used. `since` is when tracking began.
export const RECOVERY_VERSION=1,LEECH_LAPSES=3,RECOVERY_SUCCESSES=2,RECOVERY_GAP=DAY,RECOVERY_SEEN_MAX=60;
export const ROUTES=Object.freeze({word:'sentence',reading:'sentence',phrase:'sentence',passage:'phrase',lesson:'drill'});
export const ORIGINS=['lapse','migrated'];
export const PROMPT_ID=/^[a-z]:[A-Za-z0-9:_-]{1,120}$/;
const KEY=/^(lesson|passage|phrase|word|reading):(.{1,200})$/;
const count=v=>Number.isInteger(v)&&v>=0;
export const recoveryKey=(type,ref)=>`${type}:${ref}`;
export const splitKey=key=>{const m=KEY.exec(String(key));return m?{type:m[1],ref:m[2]}:null;};
export const emptyRecovery=(since=null)=>({version:RECOVERY_VERSION,since,items:{}});
const recoveryBase=s=>s?.version===RECOVERY_VERSION&&plainObject(s.items)?s:emptyRecovery();
export const episodeOf=(store,key)=>recoveryBase(store).items[key]?.episode||null;
export const inRecovery=(store,key)=>!!episodeOf(store,key);
export const recoveryDue=ep=>ep?ep.last+RECOVERY_GAP:null;
// The Today scheduling identity of a recovering item: every applied recovery answer moves it.
export const recoveryRevision=(store,key)=>{const e=episodeOf(store,key);return e?`r${e.streak}:${e.last}:${e.seen.length}`:null;};
const putEntry=(s,key,entry)=>({...s,items:{...s.items,[key]:entry}});
const openEpisode=(type,{venue=null,origin='lapse',last,since=last})=>({since,venue,origin,route:ROUTES[type],last,streak:0,misses:0,seen:[]});

// One lapse from a source. Only an eligible lapse (due, not an in-session repeat) counts. While an episode is open the
// item is out of its venue, so a lapse there changes nothing here. The LEECH_LAPSES-th count opens an episode at `now`.
export function noteLapse(store,key,{venue=null,eligible=false}={},now){
 const s=recoveryBase(store),k=splitKey(key);
 if(!k||!eligible||!finite(now))return {store:s,entered:false};
 const e=s.items[key]||{lapses:0,done:0};
 if(e.episode)return {store:s,entered:false};
 const lapses=e.lapses+1,entered=lapses>=LEECH_LAPSES;
 return {store:putEntry(s,key,{...e,lapses,...(entered?{episode:openEpisode(k.type,{venue:VENUES.includes(venue)?venue:null,last:now})}:{})}),entered};
}
// The lapses a ledger gained between two versions (entries whose id `prev` lacks), counted in order. Every source logs
// its applied answers there, so this one hook sees them all. Answers in recovery itself never count as lapses.
export function trackLapses(store,prev,next){
 const before=new Set(ledgerBase(prev).events.map(e=>e.id)),entered=[];let s=recoveryBase(store);
 for(const e of ledgerBase(next).events){
  if(before.has(e.id)||e.effect!=='lapsed'||e.venue==='recovery')continue;
  const key=recoveryKey(e.type,e.ref),r=noteLapse(s,key,{venue:e.venue,eligible:e.eligible},e.at);s=r.store;if(r.entered)entered.push(key);
 }
 return {store:s,entered};
}
// One recovery answer: a prompt, or a round of prompts answered together (`correct` only when every one was right).
// Returns {store, effect, reason, completed}. effect: advanced (a success that is not yet the last), reset (a miss),
// completed (the last success: the episode closes and the lapse count restarts) or unchanged, with its reason: none (no
// episode), prompt (malformed), retry, assisted, early (before the wait is over) or seen (a prompt already used).
export function answerRecovery(store,key,{prompts,correct,now,assisted=false,retry=false}={}){
 const s=recoveryBase(store),e=s.items[key],ep=e?.episode,list=[].concat(prompts??[]);
 const keep=reason=>({store:s,effect:'unchanged',reason,completed:false});
 if(!ep||!finite(now))return keep('none');
 if(!list.length||list.some(p=>!PROMPT_ID.test(String(p)))||new Set(list).size!==list.length)return keep('prompt');
 if(retry)return keep('retry');
 if(assisted)return keep('assisted');
 if(now<recoveryDue(ep))return keep('early');
 if(list.some(p=>ep.seen.includes(p)))return keep('seen');
 const seen=[...ep.seen,...list].slice(-RECOVERY_SEEN_MAX);
 if(!correct)return {store:putEntry(s,key,{...e,episode:{...ep,last:now,streak:0,misses:ep.misses+1,seen}}),effect:'reset',reason:null,completed:false};
 const streak=ep.streak+1;
 if(streak>=RECOVERY_SUCCESSES)return {store:putEntry(s,key,{lapses:0,done:e.done+1}),effect:'completed',reason:null,completed:true};
 return {store:putEntry(s,key,{...e,episode:{...ep,last:now,streak,seen}}),effect:'advanced',reason:null,completed:false};
}
// Ledger fields for a recovery answer that did not complete its episode: evidence about the item, no schedule change.
// The completing answer logs the source's own scheduled result instead, so one answer is credited once.
const REASON_OF={early:'early',retry:'retry',assisted:'assisted',seen:'retry',none:'stale',prompt:'stale'};
export const recoveryEvent=(res,correct)=>res.effect==='unchanged'
 ?{grade:correct?'good':'again',assisted:res.reason==='assisted',self:false,eligible:false,effect:'unchanged',reason:REASON_OF[res.reason]||'stale'}
 :{grade:correct?'good':'again',assisted:false,self:false,eligible:true,effect:'recorded'};
// Records from before recovery tracking. Each scheduled item's known lifetime lapses become its count, and an item with
// LEECH_LAPSES or more opens a migrated episode, waiting RECOVERY_GAP from the record's own last attempt when it keeps
// one, otherwise from the migration time. Nothing else is inferred: no venue, no misses, no successes. Runs once: a
// store whose `since` is set comes back unchanged. items: [{key, lapses, last?}].
export function migrateRecovery(store,items,now){
 const s=recoveryBase(store);if(s.since!==null||!finite(now))return s;
 let out={...s,since:now};
 for(const x of items||[]){
  const k=splitKey(x?.key);if(!k||out.items[x.key]||!Number.isInteger(x.lapses)||x.lapses<=0)continue;
  const last=finite(x.last)&&x.last>=0&&x.last<=now?x.last:now;
  out=putEntry(out,x.key,{lapses:x.lapses,done:0,...(x.lapses>=LEECH_LAPSES?{episode:openEpisode(k.type,{origin:'migrated',last,since:now})}:{})});
 }
 return out;
}
// Reads `recovery` from saved state or a backup. Strict reads (restore) reject the whole file; lenient reads drop what
// they cannot use. known(key) says whether the item still exists. A save from before recovery has none, and
// migrateRecovery then seeds it once.
const ENTRY_KEYS=new Set(['lapses','done','episode']),EPISODE_KEYS=['last','misses','origin','route','seen','since','streak','venue'];
function readEpisode(ep,type){
 if(!plainObject(ep)||Object.keys(ep).sort().join()!==EPISODE_KEYS.join())return null;
 if(!(finite(ep.since)&&ep.since>=0&&finite(ep.last)&&ep.last>=0)||!(ep.venue===null||VENUES.includes(ep.venue))||!ORIGINS.includes(ep.origin)||ep.route!==ROUTES[type])return null;
 if(!count(ep.streak)||ep.streak>=RECOVERY_SUCCESSES||!count(ep.misses))return null;
 if(!Array.isArray(ep.seen)||ep.seen.length>RECOVERY_SEEN_MAX||!ep.seen.every(p=>typeof p==='string'&&PROMPT_ID.test(p))||new Set(ep.seen).size!==ep.seen.length||(ep.streak>0&&!ep.seen.length))return null;
 return {since:ep.since,venue:ep.venue,origin:ep.origin,route:ep.route,last:ep.last,streak:ep.streak,misses:ep.misses,seen:ep.seen.slice()};
}
export function readRecovery(value,{strict=false,known=()=>true}={}){
 const fail=msg=>{if(strict)throw Error(msg);},raw=value?.recovery,out=emptyRecovery();
 if(raw===undefined||raw===null)return {recovery:out};
 if(!plainObject(raw)||raw.version!==RECOVERY_VERSION||!plainObject(raw.items)){fail('This backup contains invalid recovery records.');return {recovery:out};}
 if(raw.since===null||(finite(raw.since)&&raw.since>=0))out.since=raw.since;else fail('This backup contains invalid recovery records.');
 for(const [key,e] of Object.entries(raw.items)){
  const k=splitKey(key),bad=()=>fail('This backup contains an invalid recovery record.');
  if(!k||!known(key)||!plainObject(e)||Object.keys(e).some(x=>!ENTRY_KEYS.has(x))||!count(e.lapses)||!count(e.done)){bad();continue;}
  const episode=e.episode===undefined?null:readEpisode(e.episode,k.type);
  // A record without an episode always counts fewer than LEECH_LAPSES: that many would have opened one.
  if((e.episode!==undefined&&!episode)||(!episode&&e.lapses>=LEECH_LAPSES)){bad();continue;}
  out.items[key]={lapses:e.lapses,done:e.done,...(episode?{episode}:{})};
 }
 return {recovery:out};
}
