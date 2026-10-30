// Passage recall: read, hide the text, answer from memory, reveal the evidence, then recall again after a delay.
// Shared, dependency-free logic used by the app, the seed, the validator and the tests. Nothing here touches the DOM.
import {validQuestion,assessChoice} from './assessment.mjs';
import {insideRuby,plainWritten} from './vocabulary.mjs';
import {review,enterMemory,seedMemory,validMemory,cleanMemory,eventOf,MAX_DAYS,inRecovery,recoveryKey} from './schedule.mjs';

export const STATE_VERSION=3;
export const RECALL_VERSION=1;
// The fixed rhythm before scheduler version 1 (schedule.mjs). A record saved then is read through it once: its count
// names the interval its due time was set with. New intervals come from the scheduler.
export const INTERVALS=[1,3,7,14,30];
export const DAY=86400000;
export const ATTEMPTS_MAX=40;
export const KINDS=['gist','idea','detail','sequence','inference'];
export const KIND_LABELS={gist:'Gist',idea:'Idea check',detail:'Detail',sequence:'Sequence',inference:'Inference'};
// The idea-unit scale from docs/content-standard.md. Its order never changes, so it reads as a scale, not a puzzle.
export const IDEA_CHOICES=['The passage says this.','The passage says the opposite.','The passage does not say.'];
export const SETS=['immediate','delayed'];
export const MODES=['closed','supported'];
// docs/content-standard.md: a passage counts as retained when every critical idea unit is correct at the 7-day check
// and at least about 70% of the delayed items are.
export const RETAINED_INTERVAL=7;
export const RETAINED_SHARE=0.7;

const own=(o,k)=>!!o&&typeof o==='object'&&Object.prototype.hasOwnProperty.call(o,k);
const text=v=>typeof v==='string'&&v.trim().length>0;
const plainObject=v=>!!v&&typeof v==='object'&&!Array.isArray(v);

// Review keys. Lessons keep their bare ID, as in state version 1; passages and harvested phrases are prefixed.
export const passageKey=id=>`passage:${id}`;
export const phraseKey=id=>`phrase:${id}`;
// Review keys from removed features: listening dictation (listen:), typed conversation replies (reply:) and roleplays
// (talk:). Saved state and backups that still hold them load without them.
export const LEGACY_REVIEW=/^(listen|reply|talk):/;

export function harvestPool(content){return (content?.passages||[]).flatMap(p=>(p.recall?.harvest||[]).map(h=>({...h,passage:p.id})));}

export function reviewTarget(key,content){
 key=String(key);
 if(key.startsWith('passage:')){const p=content?.passages?.find(x=>x.id===key.slice(8));return p?{kind:'passage',id:p.id,passage:p}:null;}
 if(key.startsWith('phrase:')){const id=key.slice(7);for(const p of content?.passages||[]){const h=p.recall?.harvest?.find(x=>x.id===id);if(h)return {kind:'phrase',id,passage:p,phrase:h};}return null;}
 if(LEGACY_REVIEW.test(key))return null;
 const l=content?.lessons?.find(x=>x.id===key);return l?{kind:'lesson',id:l.id,lesson:l}:null;
}

// A review record: {count, due, lastPractice?, lapses?, memory}. count is successes since the last lapse (at most 4, as
// before), lapses the lifetime total and memory the scheduler state (schedule.mjs). A record without memory comes from
// before scheduler version 1 and is seeded when it is read (seedReview).
const REVIEW_KEYS=new Set(['count','due','lastPractice','lapses','memory']);
export const COUNT_MAX=INTERVALS.length-1;
export function validReview(r){
 return plainObject(r)&&Object.keys(r).every(k=>REVIEW_KEYS.has(k))&&Number.isInteger(r.count)&&r.count>=0&&Number.isFinite(r.due)&&
  (r.lastPractice===undefined||Number.isFinite(r.lastPractice))&&(r.lapses===undefined||(Number.isInteger(r.lapses)&&r.lapses>=0))&&(r.memory===undefined||validMemory(r.memory));
}
export const isDue=(r,now=Date.now())=>!!r&&r.due<=now;
// Memory for a record saved before scheduler version 1. Its due time was set count steps along 1, 3, 7, 14, 30 days, and
// that interval seeds stability. A lapse reset count, so a record below the 7-day step that has lapses lapsed at least
// once since it last recovered. Due time, count, lapses and lastPractice (absent stays absent) are kept exactly.
export const seedReview=r=>seedMemory({ivl:INTERVALS[Math.min(r.count,COUNT_MAX)],lapses:r.lapses||0,recent:(r.lapses||0)>0&&r.count<2?1:0});

// Adds an item to the review queue at the 1-day interval. An item already queued keeps its schedule.
export function enterReview(reviews,key,now=Date.now()){
 if(reviews?.[key])return {reviews,record:reviews[key],entered:false};
 const record={count:0,due:now+DAY,lastPractice:now,memory:enterMemory()};
 return {reviews:{...reviews,[key]:record},record,entered:true};
}

// One answer on a queued item, scheduled by schedule.mjs. correct is the source's own pass rule; assisted marks a passage
// answered with the text open, which still counts as not recalled, as before. A correct answer on a due item grows
// stability and sets the next interval; a wrong one returns the item after 1 day; a correct answer before the due time
// keeps the schedule, so same-day repeats never advance it. `event` is the normalized outcome for the ledger.
export function scheduleReview(reviews,key,{correct,assisted=false,now=Date.now()}){
 const prev=reviews?.[key];
 if(!prev){const r=enterReview(reviews,key,now);return {...r,days:1,advanced:false};}
 const grade=correct?'good':'again',res=review(prev.memory||seedReview(prev),{grade,now,due:prev.due,assisted,relearn:1}),event=eventOf(res,{grade,assisted});
 if(res.effect==='unchanged')return {reviews,record:prev,days:null,advanced:false,early:true,event};
 const grew=res.effect==='advanced'||res.effect==='maintained',lapses=(prev.lapses||0)+(res.lapsed?1:0),count=res.lapsed?0:grew?Math.min(prev.count+1,COUNT_MAX):prev.count;
 const record={count,due:res.due,lastPractice:now,...(lapses?{lapses}:{}),memory:res.memory};
 return {reviews:{...reviews,[key]:record},record,days:Math.round(res.memory.ivl),advanced:grew,...(res.lapsed?{lapsed:true}:{}),event};
}
// The interval, in days, that a due item is being checked at.
export const intervalOf=r=>r?(r.memory?Math.max(1,Math.round(r.memory.ivl)):INTERVALS[Math.min(r.count,COUNT_MAX)]):null;
// A delayed check's interval as stored on an attempt: whole days within the scheduler's bounds.
export const validInterval=n=>Number.isInteger(n)&&n>=1&&n<=MAX_DAYS;

// `recovery` (schedule.mjs): an item in a recovery episode is out of its normal queue, and so out of every venue that
// reads this list.
export function dueReviews(reviews,content,now=Date.now(),recovery=null){
 const out={lessons:[],passages:[],phrases:[]},bucket={lesson:'lessons',passage:'passages',phrase:'phrases'};
 for(const [key,r] of Object.entries(reviews||{})){
  if(!isDue(r,now))continue;
  const t=reviewTarget(key,content);if(t&&!inRecovery(recovery,recoveryKey(t.kind,t.id)))out[bucket[t.kind]].push({...t,key,review:r});
 }
 for(const list of Object.values(out))list.sort((a,b)=>a.review.due-b.review.due);
 return {...out,total:out.lessons.length+out.passages.length+out.phrases.length};
}

// Attempt records: {at, set, mode, items: [{q, choice, correct}], interval?, supportFrom?, corrections?}. `interval` is
// the review interval, in days, that a delayed attempt checked. `items` are first responses and never change.
// `mode` is `supported` once the text was opened at any point, and never returns to `closed`. `supportFrom` counts the
// first responses given before the text was opened (absent on older supported records, which read as 0).
// `corrections` ([{q, choice, correct}]) are second tries on missed items, made with the text open after a first
// response; they never change the first response or the score.
export function emptyRecall(){return {version:RECALL_VERSION,passages:{}};}
export function attemptsFor(store,id){return store?.passages?.[id]?.attempts||[];}
const baseStore=store=>store?.version===RECALL_VERSION?store:emptyRecall();
// Replaces one passage's entry; an entry with no attempts and no draft is removed.
function putEntry(store,id,entry){
 const base=baseStore(store),passages={...base.passages};
 if(entry.attempts.length||entry.draft)passages[id]={attempts:entry.attempts,...(entry.draft?{draft:entry.draft}:{})};else delete passages[id];
 return {...base,passages};
}
const entryFor=(store,id)=>({attempts:attemptsFor(store,id),draft:draftFor(store,id)});
function gradeItem(bank,{q,choice}){const question=bank.find(x=>x.id===q);if(!question)throw new RangeError(`Unknown question ${q}.`);return {q,choice,correct:assessChoice(question,choice).correct};}
export function recordRecallAttempt(store,passage,{set,mode,answers,interval,supportFrom,corrections=[]},now=Date.now()){
 const bank=passage?.recall?.[set];
 if(!SETS.includes(set)||!MODES.includes(mode)||!Array.isArray(bank))throw new TypeError('Unknown recall set or mode.');
 const items=answers.map(a=>gradeItem(bank,a));
 if(supportFrom!==undefined&&(mode!=='supported'||!Number.isInteger(supportFrom)||supportFrom<0||supportFrom>items.length))throw new RangeError('Support can only start within a supported attempt.');
 const fixes=corrections.map(c=>{const first=items.find(i=>i.q===c.q);if(!first||first.correct||c.choice===first.choice)throw new RangeError(`A correction needs a missed first response to ${c.q}.`);return gradeItem(bank,c);});
 if(new Set(fixes.map(c=>c.q)).size!==fixes.length)throw new RangeError('One correction per question.');
 const attempt={at:now,set,mode,items,...(Number.isInteger(interval)?{interval}:{}),...(mode==='supported'?{supportFrom:supportFrom??0}:{}),...(fixes.length?{corrections:fixes}:{})};
 const entry=entryFor(store,passage.id);
 return {store:putEntry(store,passage.id,{...entry,attempts:[...entry.attempts,attempt].slice(-ATTEMPTS_MAX)}),attempt};
}
// First responses given before the text was opened. An attempt is from memory when all of them were.
export const unaidedCount=a=>a.mode==='closed'?a.items.length:Math.min(a.supportFrom??0,a.items.length);
export const fromMemory=a=>unaidedCount(a)===a.items.length;
// Book completion (learning loop, data-contract.md "Completion"): an immediate-set attempt from memory (closed, with no
// look back during the questions) with every first response correct completes its passage. A delayed-set attempt never
// does. Any number of immediate attempts may be made, each after a fresh read; the store keeps the last ATTEMPTS_MAX of
// them, and the completion itself is kept in state.loop.books (completeBook), so trimming never loses it.
export const completesPassage=a=>!!a&&a.set==='immediate'&&Array.isArray(a.items)&&a.items.length>0&&a.items.every(i=>i?.correct===true)&&fromMemory(a);

// The attempt in progress: {set, started, mode, answers, corrections, supportFrom?, interval?}. It is saved at every
// step, so a reload or a visit elsewhere resumes it with its first responses and support marking unchanged. Only
// finishing it ends it: there is no way to discard a supported attempt and start again closed. Drafts saved with the
// retired prequestion guess (guess) load without it.
export function draftFor(store,id){return store?.passages?.[id]?.draft||null;}
export function startAttempt(store,passage,{set,mode='closed',interval},now=Date.now()){
 const existing=draftFor(store,passage.id);if(existing)return {store,draft:existing,resumed:true};
 if(!SETS.includes(set)||!MODES.includes(mode)||!Array.isArray(passage?.recall?.[set]))throw new TypeError('Unknown recall set or mode.');
 const draft={set,started:now,mode,answers:[],corrections:[],...(mode==='supported'?{supportFrom:0}:{}),...(set==='delayed'&&validInterval(interval)?{interval}:{})};
 return {store:putEntry(store,passage.id,{...entryFor(store,passage.id),draft}),draft,resumed:false};
}
const putDraft=(store,passage,draft)=>putEntry(store,passage.id,{...entryFor(store,passage.id),draft});
// Records a first response once. A second answer to the same question changes nothing.
export function answerDraft(store,passage,{q,choice}){
 const d=draftFor(store,passage.id);if(!d)return {store,added:false};
 const prior=d.answers.find(a=>a.q===q);if(prior)return {store,item:prior,added:false};
 const item=gradeItem(passage.recall[d.set],{q,choice});
 return {store:putDraft(store,passage,{...d,answers:[...d.answers,item]}),item,added:true};
}
// Opening the text marks the attempt supported for good. Responses already given stay counted as from memory.
export function openSupport(store,passage){
 const d=draftFor(store,passage.id);if(!d||d.mode==='supported')return {store,changed:false};
 return {store:putDraft(store,passage,{...d,mode:'supported',supportFrom:d.answers.length}),changed:true};
}
// One second try per missed question, with the text open. The first response is kept as it was.
export function correctDraft(store,passage,{q,choice}){
 const d=draftFor(store,passage.id),first=d?.answers.find(a=>a.q===q);
 if(!d||d.mode!=='supported'||!first||first.correct||first.choice===choice||d.corrections.some(c=>c.q===q))return {store,added:false};
 const correction=gradeItem(passage.recall[d.set],{q,choice});
 return {store:putDraft(store,passage,{...d,corrections:[...d.corrections,correction]}),correction,added:true};
}
// Moves a complete draft into the attempt log.
export function finishAttempt(store,passage,now=Date.now()){
 const d=draftFor(store,passage.id);
 if(!d||d.answers.length!==passage.recall[d.set].length)throw new RangeError('Answer every question before finishing.');
 const r=recordRecallAttempt(store,passage,{set:d.set,mode:d.mode,answers:d.answers,interval:d.interval,supportFrom:d.supportFrom,corrections:d.corrections},now);
 return {store:putEntry(r.store,passage.id,{attempts:attemptsFor(r.store,passage.id),draft:null}),attempt:r.attempt};
}

export function attemptSummary(passage,attempt){
 const bank=passage.recall[attempt.set],units=new Map(passage.recall.ideaUnits.map(u=>[u.id,u]));
 const correct=attempt.items.filter(i=>i.correct).length,total=attempt.items.length,unaided=attempt.items.slice(0,unaidedCount(attempt));
 const criticalMissed=[...new Set(attempt.items.filter(i=>!i.correct).flatMap(i=>bank.find(q=>q.id===i.q)?.units||[]).filter(id=>units.get(id)?.critical))];
 return {correct,total,allCorrect:correct===total,share:total?correct/total:0,criticalMissed,
  unaided:{correct:unaided.filter(i=>i.correct).length,total:unaided.length},corrected:(attempt.corrections||[]).filter(c=>c.correct).length};
}
// Meets the retention rule at the interval it was taken: no critical idea unit missed and at least 70% correct.
export const meetsRetention=s=>s.criticalMissed.length===0&&s.share>=RETAINED_SHARE;

// Evidence states for a passage. They describe what the attempts show; none is a mastery claim.
export const STAGE_LABELS={new:'Not read yet',supported:'Read with the text open',practised:'Answered from memory',retrieved:'Recalled after a delay',retained:'Retained'};
export function passageStage(passage,store){
 const attempts=attemptsFor(store,passage.id);
 if(!attempts.length)return 'new';
 const last=attempts.filter(a=>a.set==='delayed').at(-1);
 if(last&&fromMemory(last)){const s=attemptSummary(passage,last);if(meetsRetention(s))return (last.interval||0)>=RETAINED_INTERVAL?'retained':'retrieved';}
 return attempts.some(fromMemory)?'practised':'supported';
}

// Saved state, on load and on restore alike: version 1 had lesson-only reviews and no recall store; version 2 kept the
// two practice sets as flags and numeric answers. Each step runs in turn (1 → 2 → 3), then the converted lessons are
// normalised (convertLessons), which also covers version 3 saves made before the conversion. Returns null for a version
// this build cannot read. `now` stamps the practice finishes the flags and the converted lessons stood for.
export function migrateState(saved,now=Date.now()){
 if(!plainObject(saved))return null;
 let s=saved;
 if(s.version===1)s={...s,version:2,recall:emptyRecall()};
 if(s.version===2)s=toVersion3(s,now);
 return s.version===STATE_VERSION?convertLessons(s,now):null;
}
// The six lessons that became optional practices in loop 2b (docs/learning-loop.md decision 14), old lesson ID → practice
// ID. Their unit item IDs (r05-A1, …) are unchanged in the practices, so answers move as they are.
export const CONVERTED=Object.freeze({r05:'without-onions',s03:'sizes-colors',d01:'dating-interests',d02:'dating-ask',d03:'dating-confirm',d04:'dating-feelings'});
export const isConverted=id=>typeof id==='string'&&Object.hasOwn(CONVERTED,id);
// A `lesson:<id>` source naming a converted lesson, as `practice:<id>`; any other value unchanged.
export function convertedSource(src){const m=/^lesson:([a-z0-9-]+)$/.exec(typeof src==='string'?src:'');return m&&isConverted(m[1])?`practice:${CONVERTED[m[1]]}`:src;}
// A load-time normalisation of saved state version 3 (data-contract.md "State"), run on load and on restore, and
// idempotent: once nothing names a converted lesson, it returns the state unchanged. For each converted lesson:
//  - a `completed` entry becomes the practice's finish, loop.practices[<practice>] = {done: now}, unless one exists;
//  - answers[<lesson>] moves to answers[<practice>] when that is missing or empty (otherwise it is dropped);
//  - reviews[<lesson>] moves to reviews['practice:<practice>'] unless that exists (kept, never scheduled);
//  - `lesson:<lesson>` sources in discovered, deck cards and readingEvidence become `practice:<practice>`;
//  - progression.active or left naming it is cleared.
// History keyed by lesson stays as it is and its readers accept the converted IDs: checkpoint runs, pattern events,
// recovery records and Today records (daily). Kanji part exposure is keyed by kanji and needs nothing.
function convertLessons(s,now){
 const names=src=>convertedSource(src)!==src;
 const completed=Array.isArray(s.completed)?s.completed:[],answers=plainObject(s.answers)?s.answers:null,reviews=plainObject(s.reviews)?s.reviews:null;
 const hit=completed.some(isConverted)||Object.keys(answers||{}).some(isConverted)||Object.keys(reviews||{}).some(isConverted)
  ||Object.values(plainObject(s.discovered)?s.discovered:{}).some(r=>names(r?.source))
  ||(Array.isArray(s.decks)?s.decks:[]).some(d=>Array.isArray(d?.cards)&&d.cards.some(c=>names(c?.source)))
  ||Object.values(plainObject(s.readingEvidence?.words)?s.readingEvidence.words:{}).some(w=>Array.isArray(w?.log)&&w.log.some(e=>names(e?.source)))
  ||isConverted(s.progression?.active)||isConverted(s.progression?.left?.lesson);
 if(!hit)return s;
 const out={...s};
 if(completed.some(isConverted)){
  const loop=plainObject(s.loop)?s.loop:emptyLoop(),practices={...(plainObject(loop.practices)?loop.practices:{})};
  for(const id of completed)if(isConverted(id)&&!practices[CONVERTED[id]])practices[CONVERTED[id]]={done:now};
  out.completed=completed.filter(id=>!isConverted(id));out.loop={...loop,practices};
 }
 if(answers&&Object.keys(answers).some(isConverted)){
  const next={...answers};
  for(const [id,rec] of Object.entries(answers)){if(!isConverted(id))continue;const to=CONVERTED[id];if(!(plainObject(next[to])&&Object.keys(next[to]).length))next[to]=rec;delete next[id];}
  out.answers=next;
 }
 if(reviews&&Object.keys(reviews).some(isConverted)){
  const next={...reviews};
  for(const [id,r] of Object.entries(reviews)){if(!isConverted(id))continue;const to=`practice:${CONVERTED[id]}`;if(!next[to])next[to]=r;delete next[id];}
  out.reviews=next;
 }
 if(plainObject(s.discovered))out.discovered=Object.fromEntries(Object.entries(s.discovered).map(([w,r])=>[w,names(r?.source)?{...r,source:convertedSource(r.source)}:r]));
 if(Array.isArray(s.decks))out.decks=s.decks.map(d=>Array.isArray(d?.cards)&&d.cards.some(c=>names(c?.source))?{...d,cards:d.cards.map(c=>names(c?.source)?{...c,source:convertedSource(c.source)}:c)}:d);
 if(plainObject(s.readingEvidence?.words))out.readingEvidence={...s.readingEvidence,words:Object.fromEntries(Object.entries(s.readingEvidence.words).map(([w,r])=>[w,Array.isArray(r?.log)&&r.log.some(e=>names(e?.source))?{...r,log:r.log.map(e=>names(e?.source)?{...e,source:convertedSource(e.source)}:e)}:r]))};
 if(plainObject(s.progression)&&(isConverted(s.progression.active)||isConverted(s.progression.left?.lesson)))out.progression={...s.progression,...(isConverted(s.progression.active)?{active:null}:{}),...(isConverted(s.progression.left?.lesson)?{left:null}:{})};
 return out;
}
// Version 3 adds the learning loop's record (data-contract.md "State"): `loop` {version, practices, books}, each entry
// {done}, the time of the first finish or completion. coreCheck and plusDone become the restaurant review's and Everyday
// dishes' finishes; they and their answer records (`core`, `plus1`, numeric choices the unit-shaped sets no longer read)
// go. Books are completed from history: a passage by a kept immediate attempt from memory with every first response
// right, an unseen text by a closed initial attempt with every recall item and evidence-line pick right, each stamped
// with that attempt's time.
export const LOOP_VERSION=1;
export const emptyLoop=()=>({version:LOOP_VERSION,practices:{},books:{}});
// A book's first completion: loop.books[<id>] = {done: now}, written once. Completing it again changes nothing (first is
// false and the loop record is returned as it was).
export function completeBook(loop,id,now){
 const base=plainObject(loop)?loop:emptyLoop(),books=plainObject(base.books)?base.books:{};
 if(books[id]?.done)return {loop:base,first:false};
 return {loop:{...base,books:{...books,[id]:{done:now}}},first:true};
}
const OLD_PRACTICES={coreCheck:'restaurant-review',plusDone:'everyday-dishes'};
const stamped=t=>Number.isFinite(t)&&t>0;
function toVersion3(saved,now){
 const {coreCheck,plusDone,...rest}=saved,practices={};
 for(const [flag,id] of Object.entries(OLD_PRACTICES))if(saved[flag]===true)practices[id]={done:now};
 const answers=plainObject(saved.answers)?Object.fromEntries(Object.entries(saved.answers).filter(([k])=>k!=='core'&&k!=='plus1')):saved.answers;
 return {...rest,version:3,answers,loop:{version:LOOP_VERSION,practices,books:booksFromHistory(saved)}};
}
const allRight=list=>Array.isArray(list)&&list.every(i=>i?.correct===true);
function booksFromHistory(saved){
 const books={},passages=plainObject(saved.recall?.passages)?saved.recall.passages:{},texts=plainObject(saved.transfer?.texts)?saved.transfer.texts:{};
 for(const [id,entry] of Object.entries(passages)){
  const clean=(Array.isArray(entry?.attempts)?entry.attempts:[]).filter(a=>plainObject(a)&&stamped(a.at)&&completesPassage(a));
  if(clean.length)books[id]={done:Math.min(...clean.map(a=>a.at))};
 }
 for(const [id,entry] of Object.entries(texts)){
  const a=(Array.isArray(entry?.attempts)?entry.attempts:[]).find(x=>x?.phase==='initial');
  if(plainObject(a)&&a.mode==='closed'&&stamped(a.at)&&Array.isArray(a.items)&&a.items.length&&allRight(a.items)&&allRight(a.lines??[]))books[id]={done:a.at};
 }
 return books;
}
// Reads `loop` from saved state or a backup against the content's practices (lessons.json `practices`) and books
// (passages and unseen texts). Strict (restore) rejects a loop of another version, extra fields, unknown practice or book
// IDs and a done that is not a positive number; lenient (browser storage) drops what it cannot use. A missing loop reads
// as empty.
export function readLoopState(v,content,{strict=false}={}){
 const fail=msg=>{if(strict)throw new Error(msg);},loop=emptyLoop(),raw=v?.loop;
 if(raw===undefined)return {loop};
 if(!plainObject(raw)||raw.version!==LOOP_VERSION){fail('This backup contains learning-loop progress from another version.');return {loop};}
 if(Object.keys(raw).some(k=>!['version','practices','books'].includes(k)))fail('This backup contains unknown learning-loop fields.');
 const known={practices:new Set((content?.practices?.items||[]).map(p=>p?.id)),books:new Set([...(content?.passages||[]).map(p=>p.id),...(content?.transfer?.texts||[]).map(t=>t.id)])};
 for(const field of ['practices','books']){
  const entries=raw[field];if(entries===undefined)continue;
  if(!plainObject(entries)){fail('This backup contains malformed learning-loop progress.');continue;}
  for(const [id,entry] of Object.entries(entries)){
   if(!known[field].has(id)||!plainObject(entry)||Object.keys(entry).length!==1||!stamped(entry.done)){fail(`This backup contains learning-loop progress for an unknown or malformed ${field==='practices'?'practice':'book'} (${id}).`);continue;}
   loop[field][id]={done:entry.done};
  }
 }
 return {loop};
}

function cleanItems(list,bank,{max=bank.length}={}){
 if(!Array.isArray(list)||list.length>max)return null;
 const seen=new Set(),items=[];
 for(const i of list){
  const q=bank.find(x=>x.id===i?.q);
  if(!q||seen.has(q.id)||!Number.isInteger(i.choice)||i.choice<0||i.choice>=q.choices.length||i.correct!==(i.choice===q.correct))return null;
  seen.add(q.id);items.push({q:q.id,choice:i.choice,correct:i.correct});
 }
 return items;
}
// Support fields shared by attempts and drafts: supportFrom only on supported records, within the first responses;
// corrections only with support, one per missed first response, each a different choice.
function cleanSupport(a,items,bank){
 if(a.mode==='closed'&&a.supportFrom!==undefined)return null;
 if(a.supportFrom!==undefined&&(!Number.isInteger(a.supportFrom)||a.supportFrom<0||a.supportFrom>items.length))return null;
 const fixes=a.corrections===undefined?[]:cleanItems(a.corrections,bank,{max:items.length});
 if(!fixes||(fixes.length&&a.mode!=='supported'))return null;
 for(const c of fixes){const first=items.find(i=>i.q===c.q);if(!first||first.correct||first.choice===c.choice)return null;}
 return {fixes,...(a.supportFrom!==undefined?{supportFrom:a.supportFrom}:{})};
}
function cleanAttempt(a,passage){
 if(!plainObject(a)||!Number.isFinite(a.at)||!SETS.includes(a.set)||!MODES.includes(a.mode)||!Array.isArray(a.items)||!a.items.length)return null;
 if(a.interval!==undefined&&!validInterval(a.interval))return null;
 const bank=passage.recall?.[a.set]||[],items=cleanItems(a.items,bank),support=items&&cleanSupport(a,items,bank);
 if(!support)return null;
 return {at:a.at,set:a.set,mode:a.mode,items,...(a.interval!==undefined?{interval:a.interval}:{}),...(support.supportFrom!==undefined?{supportFrom:support.supportFrom}:{}),...(support.fixes.length?{corrections:support.fixes}:{})};
}
function cleanDraft(d,passage){
 if(!plainObject(d)||!SETS.includes(d.set)||!MODES.includes(d.mode)||!Number.isFinite(d.started))return null;
 if(d.interval!==undefined&&(d.set!=='delayed'||!validInterval(d.interval)))return null;
 if(d.mode==='supported'&&d.supportFrom===undefined)return null;
 const bank=passage.recall?.[d.set]||[],answers=cleanItems(d.answers,bank),support=answers&&cleanSupport(d,answers,bank);
 if(!support)return null;
 return {set:d.set,started:d.started,mode:d.mode,answers,corrections:support.fixes,...(support.supportFrom!==undefined?{supportFrom:support.supportFrom}:{}),...(d.interval!==undefined?{interval:d.interval}:{})};
}
// A `practice:<id>` review key for a practice in the content: the review record of a lesson that became an optional
// practice (convertLessons). It is kept and restored, and nothing schedules it: reviewTarget does not name it.
const practiceReview=(key,content)=>{const m=/^practice:([a-z0-9-]+)$/.exec(String(key));return !!m&&(content?.practices?.items||[]).some(p=>p?.id===m[1]);};
// Reads `reviews` and `recall` from saved state or a backup. Lenient reads drop what they cannot use; strict reads
// (restore) reject the whole file with a message, so the current state stays untouched. A review without scheduler
// memory is seeded (seedReview), so reading the result again returns it unchanged. Memory that is present but malformed
// fails a strict read and is reseeded from the record's count and lapses in a lenient one.
export function readRecallState(v,content,{strict=false}={}){
 const fail=msg=>{if(strict)throw new Error(msg);};
 const reviews={},recall=emptyRecall();
 if(v?.reviews!==undefined){
  if(!plainObject(v.reviews))fail('This backup contains invalid review data.');
  else for(const [key,r] of Object.entries(v.reviews)){
   if(LEGACY_REVIEW.test(key))continue;
   const {memory,...rest}=plainObject(r)?r:{};
   if(!(reviewTarget(key,content)||practiceReview(key,content))||!plainObject(r)||!validReview(rest)){fail('This backup contains invalid review data.');continue;}
   if(memory!==undefined&&!validMemory(memory))fail('This backup contains invalid review scheduling data.');
   reviews[key]={count:r.count,due:r.due,...(r.lastPractice!==undefined?{lastPractice:r.lastPractice}:{}),...(r.lapses!==undefined?{lapses:r.lapses}:{}),memory:validMemory(memory)?cleanMemory(memory):seedReview(r)};
  }
 }
 if(v?.recall!==undefined){
  const raw=v.recall;
  if(!plainObject(raw)||raw.version!==RECALL_VERSION||!plainObject(raw.passages))fail('This backup contains invalid passage recall data.');
  else for(const [id,entry] of Object.entries(raw.passages)){
   const p=content?.passages?.find(x=>x.id===id);
   if(!p||!plainObject(entry)||!Array.isArray(entry.attempts)||entry.attempts.length>ATTEMPTS_MAX){fail('This backup contains invalid passage recall data.');continue;}
   const attempts=[];
   for(const a of entry.attempts){const c=cleanAttempt(a,p);if(c)attempts.push(c);else fail('This backup contains an invalid passage recall attempt.');}
   let draft=null;
   if(entry.draft!==undefined&&entry.draft!==null){draft=cleanDraft(entry.draft,p);if(!draft)fail('This backup contains an invalid passage recall in progress.');}
   if(attempts.length||draft)recall.passages[id]={attempts,...(draft?{draft}:{})};
  }
 }
 return {reviews,recall};
}

// Sentence spans of an authored string, split after 。. Authoring helper for evidence and harvest contexts.
export function sentenceSpans(value){
 const out=[];let start=0;
 for(let i=0;i<value.length;i++)if(value[i]==='。'){out.push({start,end:i+1});start=i+1;}
 if(start<value.length&&value.slice(start).trim())out.push({start,end:value.length});
 return out;
}
// Evidence spans of a question: the spans of every idea unit it cites, in text order, without duplicates.
export function evidenceFor(passage,question){
 const units=passage.recall.ideaUnits,seen=new Set();
 return (question.units||[]).flatMap(id=>units.find(u=>u.id===id)?.evidence||[])
  .filter(s=>{const k=`${s.path}|${s.start}`;return !seen.has(k)&&seen.add(k);})
  .sort((a,b)=>a.path.localeCompare(b.path,undefined,{numeric:true})||a.start-b.start);
}
// Splits one text into runs at mark boundaries. Each run lists the marks that cover all of it.
export function markRuns(value,marks){
 const cuts=[...new Set([0,value.length,...marks.flatMap(m=>[m.start,m.end])])].filter(x=>x>=0&&x<=value.length).sort((a,b)=>a-b);
 const runs=[];
 for(let i=1;i<cuts.length;i++)runs.push({start:cuts[i-1],end:cuts[i],marks:marks.filter(m=>m.start<=cuts[i-1]&&m.end>=cuts[i])});
 return runs;
}

// Deterministic shuffles, so a repeated delayed check changes form without randomness in tests.
export function seededOrder(n,seed){
 let h=2166136261;for(const c of String(seed)){h^=c.charCodeAt(0);h=Math.imul(h,16777619)>>>0;}
 const order=[...Array(n).keys()];
 for(let i=n-1;i>0;i--){h=Math.imul(h^(h>>>15),2246822507)>>>0;h=(h^(h>>>13))>>>0;const j=h%(i+1);[order[i],order[j]]=[order[j],order[i]];}
 return order;
}
// Display order of a question's choices. Idea checks keep the fixed scale.
export const choiceOrder=(q,seed)=>q.kind==='idea'?q.choices.map((_,i)=>i):seededOrder(q.choices.length,`${q.id}|${seed}`);
// Delayed checks sample critical idea units first; after a lapse the order rotates, so the set returns in a changed form.
export function delayedOrder(passage,lapses=0){
 const critical=new Set(passage.recall.ideaUnits.filter(u=>u.critical).map(u=>u.id));
 const bank=passage.recall.delayed,first=bank.filter(q=>q.units.some(u=>critical.has(u))),rest=bank.filter(q=>!first.includes(q));
 const shift=lapses%Math.max(first.length,1);
 return [...first.slice(shift),...first.slice(0,shift),...rest];
}

// Harvested phrase review: the passage sentence with the phrase blanked, its meaning as the cue, and three phrases to
// choose from (same passage first). Feedback restores the sentence.
export function phraseQuestion(content,id,seed=''){
 const pool=harvestPool(content),h=pool.find(x=>x.id===id);if(!h)return null;
 const others=[...pool.filter(x=>x.passage===h.passage&&x.id!==h.id),...pool.filter(x=>x.passage!==h.passage)].filter(x=>plainWritten(x.phrase)!==plainWritten(h.phrase)).slice(0,2);
 const options=[h,...others],order=seededOrder(options.length,`${id}|${seed}`).map(i=>options[i]);
 const ctx=h.context.surface,at=ctx.indexOf(h.phrase);
 return {id:h.id,passage:h.passage,meaning:h.meaning,sentence:ctx,before:ctx.slice(0,at),after:ctx.slice(at+h.phrase.length),
  question:`Which phrase completes the sentence? It means “${h.meaning}”.`,choices:order.map(x=>x.phrase),correct:order.findIndex(x=>x.id===h.id),
  feedback:order.map(x=>x.id===h.id?`Correct. ${h.phrase} means “${h.meaning}” here.`:`${x.phrase} means “${x.meaning}”. This sentence needs the phrase that means “${h.meaning}”.`)};
}

// Content checks for one passage's recall data, used by tools/validate.mjs and the tests.
function spanProblems(passage,span,at){
 const out=[];
 if(!plainObject(span)||!/^paragraphs\/\d+$/.test(span.path||''))return [`${at}: span needs a paragraphs/N path`];
 const value=passage.paragraphs?.[Number(span.path.split('/')[1])];
 if(typeof value!=='string')return [`${at}: unknown text path ${span.path}`];
 if(!Number.isInteger(span.start)||!Number.isInteger(span.end)||span.start<0||span.end<=span.start||span.end>value.length)return [`${at}: invalid range ${span.start}–${span.end}`];
 if(value.slice(span.start,span.end)!==span.surface)out.push(`${at}: surface does not match the text at ${span.path}`);
 if(insideRuby(value,span.start)||insideRuby(value,span.end))out.push(`${at}: span splits reading markup`);
 for(const o of passage.occurrences||[])if(o.path===span.path&&((o.start<span.start&&span.start<o.end)||(o.start<span.end&&span.end<o.end)))out.push(`${at}: span splits the word reference ${o.surface}`);
 return out;
}
export function recallProblems(passage){
 const r=passage?.recall,label=`Passage ${passage?.id}`,out=[];
 if(!plainObject(r))return [`${label}: missing recall data`];
 // The purpose is the reading's Focus: what to follow and remember, in one or two sentences. The prequestion it
 // replaced is retired.
 if(!text(r.purpose))out.push(`${label}: recall needs a purpose line, its Focus`);
 else if(r.purpose.split(/(?<=[.!?])\s+/).length>2)out.push(`${label}: keep the purpose to one or two sentences`);
 if(r.prequestion!==undefined)out.push(`${label}: the prequestion is retired; the purpose line is the reading's Focus`);
 const units=Array.isArray(r.ideaUnits)?r.ideaUnits:[],unitIds=new Set();
 if(units.length<4)out.push(`${label}: at least four idea units are required`);
 for(const u of units){
  const at=`${label} idea unit ${u?.id}`;
  if(!new RegExp(`^${passage.id}-u\\d+$`).test(u?.id||''))out.push(`${at}: ID must be ${passage.id}-u<n>`);
  if(unitIds.has(u?.id))out.push(`${at}: duplicate ID`);unitIds.add(u?.id);
  if(!text(u?.text))out.push(`${at}: needs a proposition`);
  if(typeof u?.critical!=='boolean')out.push(`${at}: critical must be true or false`);
  if(!Array.isArray(u?.evidence)||!u.evidence.length)out.push(`${at}: needs at least one evidence span`);
  else u.evidence.forEach((s,i)=>out.push(...spanProblems(passage,s,`${at} evidence ${i}`)));
 }
 const critical=units.filter(u=>u.critical).map(u=>u.id);
 if(critical.length<2)out.push(`${label}: mark at least two idea units as critical`);
 const ids=new Set();
 for(const set of SETS){
  const bank=r[set];
  if(!Array.isArray(bank)||bank.length<4){out.push(`${label}: the ${set} set needs at least four questions`);continue;}
  for(const q of bank){
   const at=`${label} ${set} ${q?.id}`;
   if(!text(q?.id)||ids.has(q.id))out.push(`${at}: question IDs must be present and unique`);ids.add(q?.id);
   if(!validQuestion(q))out.push(`${at}: needs distinct choices, a valid answer key and feedback for every choice`);
   if(!KINDS.includes(q?.kind))out.push(`${at}: unknown kind ${q?.kind}`);
   if(!Array.isArray(q?.units)||!q.units.length||!q.units.every(id=>unitIds.has(id)))out.push(`${at}: must cite at least one known idea unit as evidence`);
   if(q?.kind==='idea'&&JSON.stringify(q.choices)!==JSON.stringify(IDEA_CHOICES))out.push(`${at}: idea checks use the said / opposite / not said scale`);
  }
  const count=k=>bank.filter(q=>k.includes(q?.kind)).length;
  if(count(['gist'])<1||count(['idea'])<2||count(['detail','sequence'])<1||count(['inference'])<1)out.push(`${label}: the ${set} set needs a gist item, two idea checks, a detail or sequence item and an inference item`);
 }
 if(Array.isArray(r.immediate)&&Array.isArray(r.delayed)){
  const asked=new Set(r.immediate.map(q=>plainWritten(q?.question||'').trim()));
  for(const q of r.delayed)if(asked.has(plainWritten(q?.question||'').trim()))out.push(`${label}: delayed question ${q.id} repeats an immediate prompt`);
  const sampled=new Set(r.delayed.flatMap(q=>q?.units||[]));
  for(const id of critical)if(!sampled.has(id))out.push(`${label}: the delayed set never samples critical idea unit ${id}`);
 }
 const harvest=Array.isArray(r.harvest)?r.harvest:[];
 if(harvest.length<2||harvest.length>3)out.push(`${label}: harvest two or three phrases`);
 const phrases=new Set();
 for(const h of harvest){
  const at=`${label} harvest ${h?.id}`;
  if(!new RegExp(`^${passage.id}-h\\d+$`).test(h?.id||''))out.push(`${at}: ID must be ${passage.id}-h<n>`);
  if(!text(h?.phrase)||!text(h?.meaning)){out.push(`${at}: needs a phrase and its meaning`);continue;}
  if(phrases.has(plainWritten(h.phrase)))out.push(`${at}: duplicate phrase`);phrases.add(plainWritten(h.phrase));
  const problems=spanProblems(passage,h.context,`${at} context`);out.push(...problems);
  if(!problems.length){const i=h.context.surface.indexOf(h.phrase);if(i<0||insideRuby(h.context.surface,i)||insideRuby(h.context.surface,i+h.phrase.length))out.push(`${at}: the phrase must appear whole in its passage sentence`);}
 }
 return out;
}
