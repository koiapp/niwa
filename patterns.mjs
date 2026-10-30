// Grammar patterns across lessons: one miss record per pattern, a delayed re-test drawn from another lesson's drill, and
// the one-screen note reached from a mistake. A pattern ID sits on a unit point (and carries to its drills) or on a
// single item; the catalog in lessons.json (`patterns`) adds a title and one contrast. Nothing here touches the DOM;
// every function takes `now`, so tests inject the clock.
import {DAY,CONVERTED,isConverted} from './recall.mjs?b=8b9c4fd';
import {isRetiredLessonItem} from './lesson-retirements.mjs?b=8b9c4fd';
import {hasUnit,unitItems,unitKeys,statusOf,reviewShown,reviewAnswer,lastReviewAnswer,patternPoints,markupProblems} from './exercises.mjs?b=8b9c4fd';

export const PATTERNS_VERSION=1;
// A re-test is queued once first-try misses of one pattern come from this many different lessons, and is due this long
// after the miss that triggered it. Both are product defaults to evaluate with learners, not established effects.
export const TRIGGER_LESSONS=2;
export const RETEST_DELAY=DAY;
// The same prompt is shown at most this many times, counting the lesson drill, closed-book reviews and re-tests.
export const PROMPT_MAX=2;
export const MISSES_MAX=20,RETESTS_MAX=20;
// checkpoint: a miss in a cumulative checkpoint (checkpoints.mjs); its item is a checkpoint item, not a unit drill.
export const SOURCES=['drill','review','retest','checkpoint'];
// The evidence states from docs/content-standard.md, lowest first. Independently demonstrated needs an unfamiliar task
// with a rubric, which tap drills never are, so no pattern reaches it here.
export const STAGES=[
 {id:'none',label:'Not met yet'},
 {id:'seen',label:'Seen'},
 {id:'practised',label:'Practised'},
 {id:'retrieved',label:'Retrieved'},
 {id:'retained',label:'Retained'},
 {id:'transferred',label:'Transferred'},
 {id:'independent',label:'Independently demonstrated'}
];
const ID=/^[A-Za-z0-9][A-Za-z0-9-]{0,59}$/;
const PATTERN_ID=/^[a-z0-9]+(-[a-z0-9]+)*$/;
const plainObject=v=>!!v&&typeof v==='object'&&!Array.isArray(v);
const text=v=>typeof v==='string'&&v.trim().length>0;
const time=v=>Number.isFinite(v)&&v>=0;
const count=v=>Number.isInteger(v)&&v>=0;
export const emptyPatterns=()=>({version:PATTERNS_VERSION,records:{}});
const base=s=>s?.version===PATTERNS_VERSION&&plainObject(s.records)?s:emptyPatterns();
const emptyRecord=()=>({misses:[],total:0,due:null,retests:[],transferred:null,seen:null});
export const recordFor=(store,id)=>base(store).records[id]||null;
const put=(store,id,rec)=>{const s=base(store);return {...s,records:{...s.records,[id]:rec}};};

// ── Catalog ───────────────────────────────────────────────────────────────────────────────────────────────
// Every pattern with its teaching points (lessons whose point carries the ID) and every tagged drill item, in course
// order. Built from the content each time; there is no second inventory.
export function patternIndex(content){
 const out=new Map();
 for(const p of Array.isArray(content?.patterns)?content.patterns:[])if(plainObject(p)&&text(p.id))out.set(p.id,{...p,teaching:[],items:[]});
 for(const l of content?.lessons||[]){
  if(!hasUnit(l))continue;
  for(const [id,entry] of out){for(const point of patternPoints(l,id))entry.teaching.push({lesson:l.id,point});}
  for(const it of unitItems(l))if(it.patternId&&out.has(it.patternId))out.get(it.patternId).items.push({lesson:l.id,item:it});
 }
 // A lesson that became an optional practice (recall.mjs CONVERTED) took its points with it: a point in a unit practice
 // (lessons.json `practices`) still teaches its pattern, as {practice, point}, after every lesson's. Practice drills stay
 // out of `items`: misses and re-tests are recorded against lessons only.
 for(const p of Array.isArray(content?.practices?.items)?content.practices.items:[]){
  if((p?.kind??'unit')!=='unit'||!hasUnit(p))continue;
  for(const [id,entry] of out)for(const point of patternPoints(p,id))entry.teaching.push({practice:p.id,point});
 }
 return out;
}
export const findPattern=(content,id)=>patternIndex(content).get(id)||null;
// The item's pattern ID inside its lesson (unitItems resolves points, sets and items).
export function itemPatternIn(lesson,itemId){return hasUnit(lesson)?unitItems(lesson).find(it=>it.id===itemId)?.patternId||null:null;}
// Catalog checks for tools/validate.mjs. problems fail validation; warnings are softer targets.
export function catalogProblems(content){
 const p=[],w=[],list=content?.patterns;
 if(list===undefined)return {problems:p,warnings:w};
 if(!Array.isArray(list)){p.push('patterns must be an array');return {problems:p,warnings:w};}
 const seen=new Set();
 list.forEach((x,i)=>{
  const at=`Pattern ${x?.id||i+1}`;
  if(!plainObject(x)){p.push(`${at}: not an object`);return;}
  for(const k of Object.keys(x))if(!['id','title','contrast'].includes(k))w.push(`${at}: unexpected field ${k}`);
  if(!PATTERN_ID.test(x.id||''))p.push(`${at}: id must be a lowercase ID such as request-wo`);
  else if(seen.has(x.id))p.push(`${at}: listed twice`);
  seen.add(x.id);
  if(!text(x.title))p.push(`${at}: needs a title`);
  const c=x.contrast;
  if(!plainObject(c)||!text(c.ja)||!text(c.en)||!text(c.why))p.push(`${at}: contrast needs ja, en and why`);
  else{for(const k of Object.keys(c))if(!['ja','en','why'].includes(k))w.push(`${at}: unexpected contrast field ${k}`);if(c.why.trim().split(/\s+/).length>40)w.push(`${at}: the contrast's why is long; keep it under 40 words`);}
  p.push(...markupProblems(x,at));
 });
 for(const [id,e] of patternIndex(content)){
  if(!e.teaching.length)p.push(`Pattern ${id}: no unit point teaches it (give one point patternId: '${id}')`);
  const lessons=new Set(e.items.map(x=>x.lesson));
  if(lessons.size<2)w.push(`Pattern ${id}: drills in ${lessons.size} lesson${lessons.size===1?'':'s'}; a re-test in another lesson needs at least 2`);
 }
 const cov=patternCoverage(content);
 for(const [id,x] of cov.patterns)if(x.lessons.length>=2&&x.arcs.length===1)w.push(`Pattern ${id}: drilled only in ${x.arcs[0]} (${x.lessons.join(', ')}); tag a drill in another topic so a re-test can change venue`);
 for(const u of cov.units){
  if(!u.patterns.length)w.push(`Lesson ${u.lesson}: no drill carries a patternId, so its misses are never re-tested elsewhere`);
  else if(!u.shared.length)w.push(`Lesson ${u.lesson}: none of its patterns (${u.patterns.join(', ')}) is drilled in another topic`);
 }
 return {problems:p,warnings:w};
}
// Cross-topic coverage: for each catalog pattern, the lessons and topics (lesson nodes) whose drills test it; for each
// unit, the patterns its drills test and those also drilled in another topic. A re-test changes venue only through a
// pattern shared across topics, so every unit should have at least one.
export function patternCoverage(content,index=null){
 const node=new Map((content?.lessons||[]).map(l=>[l.id,l.node])),patterns=new Map(),units=[];
 for(const [id,e] of index||patternIndex(content)){
  const lessons=[...new Set(e.items.map(x=>x.lesson))];
  patterns.set(id,{lessons,arcs:[...new Set(lessons.map(l=>node.get(l)))]});
 }
 for(const l of content?.lessons||[]){
  if(!hasUnit(l))continue;
  const ids=[...new Set(unitItems(l).map(it=>it.patternId).filter(id=>patterns.has(id)))];
  units.push({lesson:l.id,arc:l.node,patterns:ids,shared:ids.filter(id=>patterns.get(id).arcs.some(a=>a!==l.node))});
 }
 return {patterns,units};
}

// ── Recording ─────────────────────────────────────────────────────────────────────────────────────────────
// A first-try miss of a tagged item: in a lesson's drills, in a closed-book lesson review, or in a re-test. The same
// item from the same source counts once while the record is open, so repeated taps and reloads add nothing. Once the
// open misses span TRIGGER_LESSONS lessons a re-test falls due RETEST_DELAY later; further misses never postpone it.
// reason: the answer was right but its reason check was not (a soft miss). It counts and schedules like any miss, and
// adds one to the record's wrong-reason tally (`reasons`, kept only once there is one) when the miss is new.
// A checkpoint miss (source checkpoint) queues the re-test at once: it is already a delayed, cross-venue retrieval.
export const missedLessons=rec=>[...new Set((rec?.misses||[]).map(m=>m.lesson))];
export function recordMiss(store,id,{lesson,item,source,reason=false},now){
 const s=base(store),rec=s.records[id]||emptyRecord();
 if(!PATTERN_ID.test(id||'')||!ID.test(lesson||'')||!ID.test(item||'')||!SOURCES.includes(source)||!time(now))return {store:s,changed:false,triggered:false};
 if(rec.misses.some(m=>m.lesson===lesson&&m.item===item&&m.source===source))return {store:s,changed:false,triggered:false};
 const misses=[...rec.misses,{lesson,item,source,at:now}].slice(-MISSES_MAX);
 const triggered=rec.due===null&&(source==='checkpoint'||new Set(misses.map(m=>m.lesson)).size>=TRIGGER_LESSONS);
 const next={...rec,misses,total:rec.total+1,due:triggered?now+RETEST_DELAY:rec.due,...(reason?{reasons:(rec.reasons||0)+1}:{})};
 return {store:put(s,id,next),changed:true,triggered};
}
// A re-test answer. Correct clears the open misses (the history stays: total, re-tests, transferred). A miss keeps the
// record open and due again a day later, with no immediate retry; the missed item is never offered again this round.
export function recordRetest(store,id,{lesson,item,correct},now){
 const s=base(store),rec=s.records[id];
 if(!rec||rec.due===null||!time(now))return {store:s,changed:false,cleared:false};
 const retests=[...rec.retests,{lesson,item,at:now,correct:!!correct}].slice(-RETESTS_MAX);
 if(correct)return {store:put(s,id,{...rec,misses:[],due:null,retests,transferred:now}),changed:true,cleared:true};
 const misses=[...rec.misses,{lesson,item,source:'retest',at:now}].slice(-MISSES_MAX);
 return {store:put(s,id,{...rec,misses,total:rec.total+1,due:now+RETEST_DELAY,retests}),changed:true,cleared:false};
}
// Opening the note is Seen evidence. It is never scored.
export function markSeen(store,id,now){const s=base(store),rec=s.records[id]||emptyRecord();return put(s,id,{...rec,seen:now});}

// ── Re-test selection ─────────────────────────────────────────────────────────────────────────────────────
// How often a prompt has been shown: the lesson drill (any recorded result), a closed-book review (shown or answered)
// and earlier re-tests.
export function exposures(state,lessonId,it,rec){
 const a=state?.answers?.[lessonId];let n=0;
 if(unitKeys(it).some(k=>statusOf(a,k,it)!==null))n++;
 if(reviewShown(a).includes(it.id)||reviewAnswer(a,it)!==null||lastReviewAnswer(a,it)!==null)n++;
 return n+(rec?.retests||[]).filter(r=>r.lesson===lessonId&&r.item===it.id).length;
}
// The re-test item for a due pattern, or null. Candidates are tagged items from lessons the learner has started, never
// the lesson of the latest miss, never an item missed in this round, never one about to appear in today's lesson
// reviews (`exclude`: lesson:item keys), and never a prompt already shown PROMPT_MAX times. Lessons the pattern was
// not missed in come first, then fresh prompts, then another topic, then course order.
export function pickRetest(content,state,id,{started=()=>false,exclude=new Set(),index=null}={}){
 const entry=(index||patternIndex(content)).get(id),rec=recordFor(state?.patterns,id);
 if(!entry||!rec)return null;
 const missed=new Set(missedLessons(rec)),latest=rec.misses.at(-1)?.lesson,failed=new Set(rec.misses.map(m=>`${m.lesson}:${m.item}`));
 const node=new Map((content?.lessons||[]).map((l,i)=>[l.id,{node:l.node,order:i}]));
 const missedNodes=new Set([...missed].map(l=>node.get(l)?.node));
 const ranked=[];
 entry.items.forEach(({lesson,item},k)=>{
  const key=`${lesson}:${item.id}`;
  if(lesson===latest||failed.has(key)||exclude.has(key)||!started(lesson))return;
  const shown=exposures(state,lesson,item,rec);if(shown>=PROMPT_MAX)return;
  ranked.push({lesson,item:item.id,rank:[missed.has(lesson)?1:0,shown,missedNodes.has(node.get(lesson)?.node)?1:0,node.get(lesson)?.order??0,k]});
 });
 ranked.sort((a,b)=>{for(let i=0;i<a.rank.length;i++)if(a.rank[i]!==b.rank[i])return a.rank[i]-b.rank[i];return 0;});
 return ranked[0]?{lesson:ranked[0].lesson,item:ranked[0].item}:null;
}
export const isDue=(rec,now)=>!!rec&&rec.due!==null&&rec.due<=now;
// Open records, due or waiting: [{id, rec, due}] in due order.
export function openRecords(store){return Object.entries(base(store).records).filter(([,r])=>r.misses.length).map(([id,rec])=>({id,rec,due:rec.due})).sort((a,b)=>(a.due??Infinity)-(b.due??Infinity)||(a.id<b.id?-1:1));}
// The Today scheduling identity: it changes only when the re-test is queued, answered or rescheduled, so a new miss
// elsewhere during a run does not skip a snapshot re-test.
export const retestRevision=rec=>`${rec?.due??'-'}:${rec?.retests?.length??0}`;

// ── Evidence for the progress view ────────────────────────────────────────────────────────────────────────
// The highest state the evidence supports, with what is still open. Seen: the note was opened or a teaching lesson
// started. Practised: a tagged drill was answered. Retrieved: one was right at the first try. Retained: one was right
// in a closed-book review. Transferred: a re-test in another lesson was right, or a question that tests the pattern in an
// unseen text (transfer.mjs) was answered right from memory, on the first reading or at a qualifying delayed check.
// `unseen` is that text evidence ({initial, delayed, practice, texts} or null). It never clears open misses: only a
// re-test does.
export function patternEvidence(content,state,id,{started=()=>false,index=null,now=Date.now(),unseen=null}={}){
 const entry=(index||patternIndex(content)).get(id),rec=recordFor(state?.patterns,id);
 if(!entry)return null;
 let practised=false,retrieved=false,retained=false;
 for(const {lesson,item} of entry.items){
  const a=state?.answers?.[lesson],s=unitKeys(item).map(k=>statusOf(a,k,item));
  if(s.some(x=>x!==null))practised=true;
  if(s.some(x=>x==='right'))retrieved=true;
  if(lastReviewAnswer(a,item)===true||reviewAnswer(a,item)===true)retained=true;
 }
 const seen=!!rec?.seen||entry.teaching.some(t=>started(t.lesson));
 const inText=!!unseen&&(unseen.initial?.correct>0||unseen.delayed?.correct>0);
 const stage=rec?.transferred||inText?'transferred':retained?'retained':retrieved?'retrieved':practised?'practised':seen?'seen':'none';
 const open=!!rec&&rec.misses.length>0;
 return {stage,label:STAGES.find(x=>x.id===stage).label,open,missedIn:open?missedLessons(rec):[],due:open?rec.due:null,dueNow:isDue(rec,now),total:rec?.total||0,retests:rec?.retests||[],transferred:rec?.transferred||null,unseen:unseen||null};
}

// ── Saved state and backups ───────────────────────────────────────────────────────────────────────────────
// Strict reads (restore) reject the whole file with a message; lenient reads (local state) drop what they cannot use.
// An event in a lesson that became an optional practice (recall.mjs CONVERTED) is history: it is kept as it was, with
// its lesson ID, so an old backup still restores. Its item is checked against the practice (a drill item) or not at all
// (a checkpoint item, which left with the lesson).
function readEvent(e,content,source){
 if(!plainObject(e)||!ID.test(e.lesson||'')||!ID.test(e.item||'')||!time(e.at))return null;
 const legacy=isConverted(e.lesson),l=legacy?(content?.practices?.items||[]).find(p=>p?.id===CONVERTED[e.lesson]):content?.lessons?.find(x=>x.id===e.lesson);
 if(legacy){if(source&&e.source!=='checkpoint'&&hasUnit(l)&&!unitItems(l).some(it=>it.id===e.item))return null;}
 else if(!l||!hasUnit(l))return null;
 else if(source&&e.source==='checkpoint'?!(content?.checkpoints?.items||[]).some(it=>it.id===e.item&&it.lesson===e.lesson):!unitItems(l).some(it=>it.id===e.item)&&!isRetiredLessonItem(e.lesson,e.item))return null;
 if(source){if(Object.keys(e).length!==4||!SOURCES.includes(e.source))return null;return {lesson:e.lesson,item:e.item,source:e.source,at:e.at};}
 if(Object.keys(e).length!==4||typeof e.correct!=='boolean')return null;
 return {lesson:e.lesson,item:e.item,at:e.at,correct:e.correct};
}
export function readPatternState(value,content,{strict=false}={}){
 const fail=msg=>{if(strict)throw Error(msg);},out=emptyPatterns(),raw=value?.patterns;
 if(raw===undefined||raw===null)return {patterns:out};
 if(!plainObject(raw)||raw.version!==PATTERNS_VERSION||!plainObject(raw.records)){fail('This backup contains invalid grammar pattern records.');return {patterns:out};}
 const known=new Set((content?.patterns||[]).map(p=>p.id));
 for(const [id,r] of Object.entries(raw.records)){
  const bad=()=>fail(`This backup contains an invalid record for the pattern ${id}.`);
  if(!known.has(id)||!plainObject(r)||!Array.isArray(r.misses)||r.misses.length>MISSES_MAX||!Array.isArray(r.retests)||r.retests.length>RETESTS_MAX||!count(r.total)||!(r.due===null||time(r.due))||!(r.transferred===null||time(r.transferred))||!(r.seen===null||time(r.seen))||!(r.reasons===undefined||(count(r.reasons)&&r.reasons>0&&r.reasons<=r.total))||Object.keys(r).some(k=>!['misses','total','due','retests','transferred','seen','reasons'].includes(k))){bad();continue;}
  const misses=r.misses.map(e=>readEvent(e,content,true)),retests=r.retests.map(e=>readEvent(e,content,false));
  if(misses.some(m=>!m)||retests.some(m=>!m)){bad();if(strict)continue;}
  const rec={misses:misses.filter(Boolean),total:r.total,due:r.due,retests:retests.filter(Boolean),transferred:r.transferred,seen:r.seen,...(r.reasons!==undefined?{reasons:r.reasons}:{})};
  // A due date without open misses, or fewer misses counted than are open, cannot come from the app.
  if((rec.due!==null&&!rec.misses.length)||rec.total<rec.misses.length){bad();if(rec.due!==null&&!rec.misses.length)rec.due=null;rec.total=Math.max(rec.total,rec.misses.length);}
  out.records[id]=rec;
 }
 return {patterns:out};
}
