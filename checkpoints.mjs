// Cumulative checkpoints on the Learn path: at authored anchors (five-lesson fallback), one closed-book quiz drawn from every lesson
// since the last checkpoint and a smaller share of earlier ones. Its items are authored recipes (tools/units/<id>.mjs
// `checkpoint`, shipped as lessons.json `checkpoints`): a taught frame with another taught word, set in a venue the frame
// was not taught in, in the unit drill formats. Every missed target routes to the words-table row or point that teaches
// it and re-enters the existing scheduling (patterns.mjs re-tests, the lesson's own review). Nothing here touches the DOM;
// every function takes `now`, so tests inject the clock. The path is read as authored; progression.mjs stays the only
// source of the next lesson, and the app composes it with checkpoint access. Optional reviews never gate it.
import {seededOrder,scheduleReview,isConverted} from './recall.mjs?b=8b9c4fd';
import {FOCUS_KEY,unitItems,unitKeys,hasUnit,wordEntries,itemChecks,markupProblems,gradeChoice,gradeTrueFalse,gradeOrder,gradeStar,gradeMatch,gradeGap,answerSentences,starSentence} from './exercises.mjs?b=8b9c4fd';
import {recordMiss,patternIndex} from './patterns.mjs?b=8b9c4fd';

export const CHECKPOINT_VERSION=1;
// Without authored anchors, a checkpoint follows every CADENCE lessons. Each run asks max(RECENT_MIN, new lessons) recent items, at least
// one per new lesson, then ceil(recent ÷ EARLIER_SHARE) items from lessons earlier checkpoints covered. These are product
// defaults to evaluate with learners, not research thresholds; the cadence does not guarantee any elapsed time.
export const CADENCE=5,RECENT_MIN=9,EARLIER_SHARE=3;
// Unit drill formats a checkpoint uses. Sorting stays in the units.
export const ITEM_FORMATS=['choice','blank','order','star','match','truefalse','cloze'];
export const INSTRUCTIONS={choice:'Choose the best answer.',blank:'Choose what fills the gap.',order:'Put the tiles in order.',star:'Choose the tile that goes in ★.',match:'Match each pair.',truefalse:'Mark the statement ○ (true) or × (false).',cloze:'Complete the conversation with words from the box.'};
// A checkpoint statement is about Japanese in use, not about the unit's conversation.
export const TF_STEM='{正|ただ}しければ ○、ちがえば ×。';
// Where an item is set (`venue`) and where its frame was taught (`taught`). They must differ.
export const VENUES={cafe:'café',restaurant:'restaurant',noodles:'noodle shop',stall:'food stall',konbini:'convenience store',bakery:'bakery',clothes:'clothing shop',market:'market stall',supermarket:'supermarket',station:'station',office:'office',class:'class',community:'community centre',library:'library',party:'party',home:'home',hotel:'hotel',street:'street',phone:'message'};
// Per-target results in a finished run: right from memory, right after reopening the lesson mid-run, or not yet.
export const RESULTS=['retrieved','supported','missed'];
export const RESULT_LABELS={retrieved:'Retrieved',supported:'Answered after reopening the lesson',missed:'Not yet retrieved'};
const ID=/^[A-Za-z0-9][A-Za-z0-9-]{0,59}$/;
const SLUG=/^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const SEED=/^[A-Za-z0-9|:.-]{1,80}$/;
const RUBY=/\{([^|{}]+)\|([^{}]+)\}/g;
// Numbers (f03), alone or with 時 or 円, need no vocabulary entry.
const NUMERAL=/^[一二三四五六七八九十百千]+[時円]?$/;
const plainObject=v=>!!v&&typeof v==='object'&&!Array.isArray(v);
const text=v=>typeof v==='string'&&v.trim().length>0;
const time=v=>Number.isFinite(v)&&v>=0;
const count=v=>Number.isInteger(v)&&v>=0;
const uniq=a=>[...new Set(a)];
function hash(s){let h=2166136261;for(const c of String(s)){h^=c.charCodeAt(0);h=Math.imul(h,16777619)>>>0;}return h.toString(36);}

// ── Boundaries ──────────────────────────────────────────────────────────────────────────────────────────
// Authored anchors partition the core; fallback checkpoints follow n×CADENCE, leaving a short trailing block uncovered.
export function boundaries(path){
 const core=path?.core||[],out=[];
 if(Array.isArray(path?.checkpoints)){let start=0;for(const after of path.checkpoints){const end=core.indexOf(after)+1;if(end<=start)continue;out.push({n:out.length+1,after,core:core.slice(start,end)});start=end;}return out;}
 for(let n=1;n*CADENCE<=core.length;n++)out.push({n,after:core[n*CADENCE-1],core:core.slice((n-1)*CADENCE,n*CADENCE)});
 return out;
}
// The checkpoint whose block holds a lesson: 0 for the trailing block, null for a lesson not on the path. Every placed
// lesson is in `core` (path version 2), so every lesson counts.
export function blockOf(path,id){if(!(path?.core||[]).includes(id))return null;return boundaries(path).find(b=>b.core.includes(id))?.n||0;}
// Every placed lesson in authored order: the path's core.
export function pathOrder(path){return [...(path?.core||[])];}
const rankOf=path=>{const m=new Map(pathOrder(path).map((id,i)=>[id,i]));return id=>m.get(id)??1e9;};
// What must be finished to open checkpoint n: every lesson through its boundary.
export function requiredLessons(path,n){const core=path?.core||[],b=boundaries(path).find(b=>b.n===n);return b?core.slice(0,core.indexOf(b.after)+1):[];}

// ── Saved state ─────────────────────────────────────────────────────────────────────────────────────────
// state.checkpoints = {version, seed, runs: {[n]: run}}. `seed` is drawn once per learner; every selection is a pure
// function of it, the boundary and the lessons a run covers. A run is
// {n, after, attempt, seed, revision, started, lessons, earlier, items, answers, opened, done}: `lessons` the new lessons
// it covers and `earlier` the lessons earlier checkpoints covered (both finished when it started), `items` the selected
// item IDs in answer order, `revision` a hash of those items as shipped, `answers` first responses per counted key
// ({v, ok, at, s?}: value, right, when, and s when the source lesson had been reopened during the run), `opened` when a
// covered lesson was reopened during the run, `done` when it was finished (it never reopens).
export const emptyCheckpoints=()=>({version:CHECKPOINT_VERSION,seed:null,runs:{}});
const base=s=>s?.version===CHECKPOINT_VERSION&&plainObject(s.runs)?s:emptyCheckpoints();
export const runOf=(store,n)=>base(store).runs[n]||null;
const doneRuns=store=>Object.values(base(store).runs).filter(r=>time(r.done)).sort((a,b)=>a.n-b.n);
// Lessons a finished checkpoint covered as new; they are the earlier pool from then on.
export const coveredLessons=store=>uniq(doneRuns(store).flatMap(r=>r.lessons));

// ── Items ───────────────────────────────────────────────────────────────────────────────────────────────
export const checkpointItems=content=>Array.isArray(content?.checkpoints?.items)?content.checkpoints.items:[];
export const findItem=(content,id)=>checkpointItems(content).find(it=>it.id===id)||null;
// One target per counted key: matching and word-bank dialogues carry one per pair or gap.
export function itemTargets(it){const keys=unitKeys(it),list=Array.isArray(it?.targets)?it.targets:[it?.target];return keys.map((key,k)=>({key,lesson:it.lesson,...(list[k]||{})}));}
export const targetKey=t=>`${t.lesson}:${t.word?`word:${t.word}`:`point:${t.point}`}`;
// The drill-ready item for the app: its instruction, and the checkpoint's ○/× line.
export const runItem=it=>({...it,instruction:it.instruction||INSTRUCTIONS[it.format],...(it.format==='truefalse'?{stem:TF_STEM}:{})});
// A hash of the items as shipped, so an unfinished run can tell when its questions changed.
export const itemsRevision=(content,ids)=>hash(JSON.stringify(ids.map(id=>findItem(content,id))));
export const runStale=(content,run)=>!!run&&!time(run.done)&&(run.items.some(id=>!findItem(content,id))||itemsRevision(content,run.items)!==run.revision);

// ── Pools and selection ─────────────────────────────────────────────────────────────────────────────────
// For checkpoint n: `recent`, finished lessons placed up to its boundary that no finished checkpoint covered (a lesson
// finished after its own checkpoint joins the next one), and `earlier`, every lesson finished checkpoints covered.
// Sensei mode (`openAll`) reads as a learner who followed the path: every lesson up to the boundary finished and every
// earlier checkpoint done, so `recent` is the checkpoint's own block and `earlier` the blocks before it.
const senseiDone=(path,n,completed,openAll)=>openAll?uniq([...completed,...requiredLessons(path,n)]):completed;
export function poolFor(path,n,{completed=[],checkpoints,openAll=false}={}){
 const all=senseiDone(path,n,completed,openAll),done=new Set(all),covered=new Set([...coveredLessons(checkpoints),...(openAll?requiredLessons(path,n-1):[])]),rank=rankOf(path),sort=a=>a.sort((x,y)=>rank(x)-rank(y));
 const recent=sort(uniq(all).filter(id=>{const b=blockOf(path,id);return b!==null&&b>=1&&b<=n&&!covered.has(id);}));
 return {recent,earlier:sort([...covered].filter(id=>done.has(id)))};
}
const patternOf=(content,t)=>{if(t.word)return `word:${t.word}`;const l=content?.lessons?.find(x=>x.id===t.lesson);const p=(l?.sections||[]).find(s=>s.kind==='point'&&s.id===t.point);return p?.patternId||`point:${t.point}`;};
// Seeded, canonical selection without replacement: no target twice in a run, at least one item per recent lesson, then
// round robin across lessons; earlier items round robin across earlier checkpoints' blocks, items not asked in a finished
// checkpoint first, then patterns not yet in this run. `used` are item IDs finished checkpoints asked. An item is
// eligible only once its lesson and every lesson it `uses` are finished. Returns {items (answer order), recent, earlier,
// short: {recent, earlier, lessons}}: a shortfall never repeats, borrows from later material or drops a lesson silently.
// The size of a run from its pool: max(RECENT_MIN, new lessons) recent items, and a third as many earlier ones once an
// earlier checkpoint has covered some lessons.
export function checkpointSize(pool){const recent=pool?.recent?.length?Math.max(RECENT_MIN,pool.recent.length):0,earlier=pool?.earlier?.length&&recent?Math.ceil(recent/EARLIER_SHARE):0;return {recent,earlier,total:recent+earlier};}
export function selectItems(content,path,{n,recent=[],earlier=[],completed=[],seed='',used=[]}){
 const done=new Set(completed),old=new Set(used),all=checkpointItems(content),rank=rankOf(path);
 const ok=it=>done.has(it.lesson)&&(it.uses||[]).every(l=>done.has(l));
 const of=lesson=>{const list=all.filter(it=>it.lesson===lesson&&ok(it));return seededOrder(list.length,`${seed}|${n}|${lesson}`).map(i=>list[i]);};
 const taken=new Set(),themes=new Set(),picked=[];
 const free=it=>!itemTargets(it).some(t=>taken.has(targetKey(t)));
 const take=it=>{for(const t of itemTargets(it)){taken.add(targetKey(t));themes.add(patternOf(content,t));}picked.push(it);};
 // Recent: one per lesson in a seeded lesson order, then further rounds.
 const size=checkpointSize({recent,earlier}),R=size.recent,lessonsOrder=seededOrder(recent.length,`${seed}|${n}|lessons`).map(i=>recent[i]);
 const queues=new Map(lessonsOrder.map(l=>[l,of(l)])),hit=new Set();
 for(let more=true;more&&picked.length<R;){
  more=false;
  for(const l of lessonsOrder){if(picked.length>=R)break;const q=queues.get(l);while(q.length){const it=q.shift();if(free(it)){take(it);hit.add(l);more=true;break;}}if(q.length)more=true;}
 }
 const recentPicked=picked.length;
 // Earlier: blocks of earlier checkpoints in a seeded order, round robin.
 const E=size.earlier,blocks=new Map();
 for(const l of [...earlier].sort((a,b)=>rank(a)-rank(b))){const b=blockOf(path,l);if(!blocks.has(b))blocks.set(b,[]);blocks.get(b).push(...of(l));}
 for(const [b,list] of blocks){const s=seededOrder(list.length,`${seed}|${n}|earlier|${b}`).map(i=>list[i]);blocks.set(b,[...s.filter(it=>!old.has(it.id)),...s.filter(it=>old.has(it.id))]);}
 const blockOrder=seededOrder(blocks.size,`${seed}|${n}|blocks`).map(i=>[...blocks.keys()][i]);
 for(let more=true;more&&picked.length<recentPicked+E;){
  more=false;
  for(const b of blockOrder){
   if(picked.length>=recentPicked+E)break;
   const q=blocks.get(b).filter(free);blocks.set(b,q);if(!q.length)continue;
   const it=q.find(x=>!old.has(x.id)&&itemTargets(x).every(t=>!themes.has(patternOf(content,t))))||q.find(x=>!old.has(x.id))||q[0];
   take(it);blocks.set(b,q.filter(x=>x!==it));more=true;
  }
 }
 const order=seededOrder(picked.length,`${seed}|${n}|order`).map(i=>picked[i].id);
 return {items:order,recent:picked.slice(0,recentPicked).map(it=>it.id),earlier:picked.slice(recentPicked).map(it=>it.id),short:{recent:Math.max(0,R-recentPicked),earlier:Math.max(0,E-(picked.length-recentPicked)),lessons:recent.filter(l=>!hit.has(l))}};
}

// ── Status ──────────────────────────────────────────────────────────────────────────────────────────────
// Every checkpoint with its state: done; locked (missing: what is still to finish); waiting (an earlier checkpoint comes
// first); open; started; or stale (an unfinished run whose questions changed with a content update). Sensei mode
// (`openAll`) makes locked and waiting open (missing still lists what is unfinished); done, started and stale stay.
export function checkpointStatus(path,content,{completed=[],checkpoints,openAll=false}={}){
 const done=new Set(completed);
 let before=true;
 return boundaries(path).map(b=>{
  const run=runOf(checkpoints,b.n);
  if(run&&time(run.done))return {...b,status:'done',missing:[],run};
  const missing=requiredLessons(path,b.n).filter(id=>!done.has(id));
  const gate=openAll?null:missing.length?'locked':!before?'waiting':null;
  const status=gate||(run?(runStale(content,run)?'stale':'started'):'open');
  before=false;
  return {...b,status,missing,run};
 });
}
// The earliest checkpoint not yet finished, or null when every one is.
export const nextCheckpoint=(path,content,opts)=>checkpointStatus(path,content,opts).find(c=>c.status!=='done')||null;
// The checkpoint that comes before any new lesson: the earliest unfinished one, once it opens. A lesson in progress still
// resumes first; completed and started lessons stay open. Finishing it, whatever the score, releases the course's next
// lesson, which still waits behind the review-debt gate.
export function dueCheckpoint(path,content,opts){const c=nextCheckpoint(path,content,opts);return c&&['open','started','stale'].includes(c.status)?c:null;}

// ── Runs ────────────────────────────────────────────────────────────────────────────────────────────────
// A learner's seed: drawn once (rand is injected), then kept.
export const ensureSeed=(store,rand=Math.random)=>{const s=base(store);return s.seed?s:{...s,seed:`s${Math.floor(rand()*36**6).toString(36)}`};};
const usedItems=store=>uniq(doneRuns(store).flatMap(r=>r.items));
// Starts checkpoint n, or resumes its unfinished run. A stale run starts again only with restart: true, as a new attempt
// whose answers so far are dropped. The selection freezes here: later reloads and completions leave it. Sensei mode
// (`openAll`) starts any checkpoint not done, on the pool poolFor gives it.
export function startCheckpoint(store,content,path,{n,completed=[],progression,now,restart=false,rand=Math.random,openAll=false}){
 let s=ensureSeed(store,rand);const prev=s.runs[n],status=checkpointStatus(path,content,{completed,progression,checkpoints:s,openAll}).find(c=>c.n===n);
 if(!status||['locked','waiting','done'].includes(status.status))return {store:s,run:prev||null,started:false};
 if(prev&&!(restart&&runStale(content,prev)))return {store:s,run:prev,started:false};
 const pool=poolFor(path,n,{completed,checkpoints:s,openAll}),attempt=(prev?.attempt||0)+1,seed=`${s.seed}|${n}|${attempt}`;
 const pick=selectItems(content,path,{n,...pool,completed:senseiDone(path,n,completed,openAll),seed,used:usedItems(s)});
 const run={n,after:status.after,attempt,seed,revision:itemsRevision(content,pick.items),started:now,lessons:pool.recent,earlier:pool.earlier,items:pick.items,answers:{},opened:{},done:null};
 s={...s,runs:{...s.runs,[n]:run}};
 return {store:s,run,started:true,short:pick.short};
}
// Grades one counted key of an item from its stored value. Throws on a value that cannot be an answer.
export function gradeKey(it,key,v){
 const k=key===it.id?0:Number(key.slice(it.id.length+1));
 if(it.format==='choice'||it.format==='blank')return gradeChoice(it,v).correct;
 if(it.format==='star')return gradeStar(it,v).correct;
 if(it.format==='truefalse')return gradeTrueFalse(it,v).correct;
 if(it.format==='order')return gradeOrder(it,v).correct;
 if(it.format==='match'){if(!Number.isInteger(k))throw new RangeError('Unknown pair.');return gradeMatch(it,k,v);}
 if(it.format==='cloze'){if(!Number.isInteger(k))throw new RangeError('Unknown gap.');return gradeGap(it,k,v);}
 throw new RangeError(`Unknown format ${it.format}.`);
}
// The value that answers a counted key correctly (tools/validate.mjs and the tests).
export function rightValue(it,key){
 const k=key===it.id?0:Number(key.slice(it.id.length+1));
 return {choice:it.correct,blank:it.correct,star:it.star,truefalse:it.answer,order:(it.tiles||[]).map((_,i)=>i),match:k,cloze:it.answers?.[k]}[it.format];
}
const keysOf=(content,run)=>run.items.flatMap(id=>{const it=findItem(content,id);return it?unitKeys(it):[];});
const itemOfKey=(content,run,key)=>run.items.map(id=>findItem(content,id)).find(it=>it&&unitKeys(it).includes(key))||null;
// A first response per counted key. A repeated or late submission (another tap, a reload, a finished or stale run)
// changes nothing. An answer after the source lesson was reopened during the run is kept as supported.
export function answerCheckpoint(store,content,{n,key,value},now){
 const s=base(store),run=s.runs[n];
 if(!run||time(run.done)||runStale(content,run)||run.answers[key]||!time(now))return {store:s,changed:false};
 const it=itemOfKey(content,run,key);if(!it)return {store:s,changed:false};
 let ok;try{ok=gradeKey(it,key,value);}catch{return {store:s,changed:false};}
 const supported=time(run.opened?.[it.lesson])&&run.opened[it.lesson]<=now;
 const answer={v:Array.isArray(value)?value.slice():value,ok,at:now,...(supported?{s:1}:{})};
 return {store:{...s,runs:{...s.runs,[n]:{...run,answers:{...run.answers,[key]:answer}}}},changed:true,correct:ok};
}
// Reopening a covered lesson during an unfinished run is recorded once; it never counts as retrieval.
export function noteOpened(store,content,lessonId,now){
 const s=base(store),run=Object.values(s.runs).find(r=>!time(r.done));
 if(!run||runStale(content,run)||!time(now)||run.opened?.[lessonId]||!run.items.some(id=>findItem(content,id)?.lesson===lessonId))return {store:s,changed:false};
 return {store:{...s,runs:{...s.runs,[run.n]:{...run,opened:{...run.opened,[lessonId]:now}}}},changed:true};
}
// Per-target evidence of a run: only the sampled targets, never anything it did not ask.
export function runOutcome(content,run){
 const rows=[];
 for(const id of run?.items||[]){const it=findItem(content,id);if(!it)continue;for(const t of itemTargets(it)){const a=run.answers[t.key];rows.push({...t,item:id,answered:!!a,result:!a?null:!a.ok?'missed':a.s?'supported':'retrieved',at:a?.at??null});}}
 const by=r=>rows.filter(x=>x.result===r);
 return {rows,total:rows.length,answered:rows.filter(r=>r.answered).length,complete:rows.length>0&&rows.every(r=>r.answered),retrieved:by('retrieved'),supported:by('supported'),missed:by('missed')};
}
// Finishing records `done` once; a repeated finish, an incomplete or a stale run changes nothing. The caller routes
// `misses` (routeMisses) in the same commit, so they are applied exactly once.
export function finishCheckpoint(store,content,{n},now){
 const s=base(store),run=s.runs[n];
 if(!run||time(run.done)||runStale(content,run)||!time(now))return {store:s,finished:false,misses:[]};
 const out=runOutcome(content,run);if(!out.complete)return {store:s,finished:false,misses:[]};
 const next={...run,done:now};
 return {store:{...s,runs:{...s.runs,[n]:next}},finished:true,run:next,misses:out.missed};
}

// ── Gap routing ─────────────────────────────────────────────────────────────────────────────────────────
// The unit items that teach a target: for a word, the lesson's items showing it; for a point, the drills tagged with its
// pattern, or the drills that follow it in the unit.
export function focusItems(content,t){
 const l=content?.lessons?.find(x=>x.id===t.lesson);if(!hasUnit(l))return [];
 const items=unitItems(l);
 if(t.word){const w=(content?.vocabulary||[]).find(x=>x.id===t.word);if(!w)return [];const forms=[w.word,...(w.forms||[]).map(f=>f.form)].filter(text);return items.filter(it=>{const j=JSON.stringify(it);return forms.some(f=>j.includes(f));}).map(it=>it.id);}
 const i=l.sections.findIndex(s=>s.kind==='point'&&s.id===t.point);if(i<0)return [];
 const p=l.sections[i];if(p.patternId){const tagged=items.filter(it=>it.patternId===p.patternId).map(it=>it.id);if(tagged.length)return tagged;}
 const end=l.sections.findIndex((s,j)=>j>i&&(s.kind==='point'||s.kind==='dialogue'||s.final===true)),sets=new Set(l.sections.slice(i+1,end<0?undefined:end).filter(s=>s.kind==='practice').map(s=>s.id));
 return items.filter(it=>sets.has(it.set)).map(it=>it.id);
}
// Where each miss goes: a point whose pattern another started lesson drills goes to that pattern's re-test (patterns.mjs,
// scheduled from this first miss); everything else to its lesson's own review, with the items that teach it first.
export function missRoutes(content,misses,{started=()=>false}={}){
 const index=patternIndex(content),lessons=new Map(),patterns=[];
 for(const m of misses){
  const pattern=m.point?patternOf(content,m):null,entry=pattern&&index.get(pattern);
  if(entry&&entry.items.some(x=>x.lesson!==m.lesson&&started(x.lesson))){if(!patterns.some(p=>p.pattern===pattern&&p.item===m.item))patterns.push({kind:'pattern',pattern,lesson:m.lesson,item:m.item});continue;}
  const r=lessons.get(m.lesson)||{kind:'lesson',lesson:m.lesson,focus:[]};r.focus=uniq([...r.focus,...focusItems(content,m)]);lessons.set(m.lesson,r);
 }
 return [...patterns,...lessons.values()];
}
// Applies routes to the learner's records: a pattern miss (source `checkpoint`, due a day later), or a lapse of the
// lesson's review (due a day later, unless it is already relearning) with its focus items saved for that review. Nothing
// is cleared, no completion changes, and unrelated records are untouched. `events` are the ledger entries for lesson
// reviews, identified by checkpoint, attempt and lesson, so a repeat adds nothing.
export function routeMisses(records,content,run,routes,now){
 let {patterns,reviews,answers}=records;const events=[];
 for(const r of routes){
  if(r.kind==='pattern'){patterns=recordMiss(patterns,r.pattern,{lesson:r.lesson,item:r.item,source:'checkpoint'},now).store;continue;}
  const res=scheduleReview(reviews,r.lesson,{correct:false,now});reviews=res.reviews;
  if(res.event)events.push({type:'lesson',ref:r.lesson,venue:'checkpoint',id:`checkpoint:${run.n}-${run.attempt}:${r.lesson}`,...res.event});
  if(r.focus.length){const a=plainObject(answers?.[r.lesson])?answers[r.lesson]:{},had=String(a[FOCUS_KEY]||'').split(',').filter(x=>ID.test(x));answers={...answers,[r.lesson]:{...a,[FOCUS_KEY]:uniq([...had,...r.focus]).join(',')}};}
 }
 return {patterns,reviews,answers,events};
}

// ── Saved state and backups ─────────────────────────────────────────────────────────────────────────────
// Lessons inserted before a boundary shift its block. A run still fits when its former boundary is on the path and the
// placed lessons it recorded (new and earlier) are exactly the first n×CADENCE of the path up to that boundary, so every
// other lesson among them was inserted since. Those were never part of the run: they join the next unfinished checkpoint.
function shifted(path,n,r){
 const core=path?.core||[];if(!core.includes(r?.after)||!Array.isArray(r?.lessons)||!Array.isArray(r?.earlier))return false;
 const had=new Set([...r.lessons,...r.earlier]),placed=core.filter(id=>had.has(id));
 return placed.length===n*CADENCE&&placed[placed.length-1]===r.after;
}
// Strict reads (restore) reject the whole file; lenient reads (local state) drop what they cannot use. A run's answers
// must match its items' keys; an unfinished run whose items changed is kept and reads as stale, so the learner is told
// and starts it again, instead of its questions silently changing. A finished run stays as history.
export function readCheckpointState(value,content,path,{strict=false}={}){
 const fail=msg=>{if(strict)throw Error(msg);},out=emptyCheckpoints(),raw=value?.checkpoints;
 if(raw===undefined||raw===null)return {checkpoints:out};
 if(!plainObject(raw)||raw.version!==CHECKPOINT_VERSION||!plainObject(raw.runs)){fail('This backup contains invalid checkpoint records.');return {checkpoints:out};}
 if(raw.seed!==undefined&&raw.seed!==null){if(typeof raw.seed==='string'&&SEED.test(raw.seed))out.seed=raw.seed;else fail('This backup contains an invalid checkpoint seed.');}
 // A run is history: a lesson that became an optional practice (recall.mjs CONVERTED) stays in the lessons it covered
 // and the reopenings it recorded, as it was. Its items left with the lesson, as for any removed item.
 const known=id=>!!content?.lessons?.some(l=>l.id===id)||isConverted(id),bounds=new Map(boundaries(path).map(b=>[String(b.n),b]));
 for(const [key,r] of Object.entries(raw.runs)){
  const bad=()=>fail(`This backup contains an invalid record for checkpoint ${key}.`);
  // A curriculum edit may reorder the same five lessons. Keep the frozen run and its answers when it still covers
  // the whole block, moving only its boundary label, and the same for a block that lessons inserted before it shifted.
  // A different block or missing lesson is not a compatible reorder.
  const boundary=bounds.get(key),reordered=boundary&&boundary.core.includes(r?.after)&&boundary.core.every(id=>Array.isArray(r?.lessons)&&Array.isArray(r?.earlier)&&(r.lessons.includes(id)||r.earlier.includes(id)));
  const fields=['n','after','attempt','seed','revision','started','lessons','earlier','items','answers','opened','done'];
  if(!plainObject(r)||Object.keys(r).some(k=>!fields.includes(k))||String(r.n)!==key||!boundary||(r.after!==boundary.after&&!reordered&&!shifted(path,Number(key),r))||!Number.isInteger(r.attempt)||r.attempt<1||typeof r.seed!=='string'||!SEED.test(r.seed)||typeof r.revision!=='string'||!time(r.started)||!(r.done===null||time(r.done))||(time(r.done)&&r.done<r.started)
   ||![r.lessons,r.earlier,r.items].every(a=>Array.isArray(a)&&a.every(x=>typeof x==='string'&&ID.test(x))&&new Set(a).size===a.length)||!r.items.length||![...r.lessons,...r.earlier].every(known)||!plainObject(r.answers)||!plainObject(r.opened)||Object.entries(r.opened).some(([l,t])=>!known(l)||!time(t))){bad();continue;}
  const run={n:r.n,after:boundary.after,attempt:r.attempt,seed:r.seed,revision:r.revision,started:r.started,lessons:r.lessons.slice(),earlier:r.earlier.slice(),items:r.items.slice(),answers:{},opened:{...r.opened},done:r.done};
  const stale=r.done===null&&runStale(content,run),keys=new Set(keysOf(content,run));let broken=false;
  for(const [k,a] of Object.entries(r.answers)){
   const shape=plainObject(a)&&Object.keys(a).every(x=>['v','ok','at','s'].includes(x))&&typeof a.ok==='boolean'&&time(a.at)&&(a.s===undefined||a.s===1)&&(typeof a.v==='boolean'||Number.isInteger(a.v)||(Array.isArray(a.v)&&a.v.every(Number.isInteger)));
   if(!shape){broken=true;continue;}
   // Against the items as shipped: the stored result must be the grade of the stored value. A finished run keeps answers
   // to items content has since removed; a stale run keeps its answers unread until it starts again.
   if(!stale){const it=itemOfKey(content,run,k);if(it){let ok=null;try{ok=gradeKey(it,k,a.v);}catch{}if(ok!==a.ok){broken=true;continue;}}else if(!time(r.done)){broken=true;continue;}}
   run.answers[k]={v:Array.isArray(a.v)?a.v.slice():a.v,ok:a.ok,at:a.at,...(a.s?{s:1}:{})};
  }
  if(broken){fail(`This backup contains an answer that does not match checkpoint ${key}.`);if(strict)continue;}
  // A finished run has an answer for every key it asked (unknown items aside); an unfinished one may be partway.
  if(time(run.done)&&!stale&&[...keys].some(k=>!run.answers[k])){bad();continue;}
  out.runs[key]=run;
 }
 return {checkpoints:out};
}

// ── Content checks ──────────────────────────────────────────────────────────────────────────────────────
// Recipe fields beside the drill fields: lesson (the unit the item belongs to), target or targets (a words-table word or
// a point of that lesson; one per pair or gap for matching and dialogues), frame (the point it recomposes, in its pool),
// example (that point's example it was recomposed from), slot (the taught word in the frame's slot, not that example's;
// frame, example and slot are required when a target is a point, since a words-table row has no example to differ from),
// venue and taught (where it is set, where the frame was taught; they differ), uses (other finished lessons it needs,
// never later ones), words (every vocabulary ID it shows, distractors included), names (people's names it shows) and an
// optional instruction.
const RECIPE=['lesson','target','targets','frame','example','slot','venue','taught','uses','words','names','instruction'];
const strip=it=>Object.fromEntries(Object.entries(it).filter(([k])=>!RECIPE.includes(k)));
// Every Japanese string an item shows, and the full sentences it builds.
function jaStrings(it){
 const out=[];const add=v=>{if(typeof v==='string')out.push(v);else if(Array.isArray(v))v.forEach(add);};
 for(const k of ['prompt','ja','choices','tiles','extra','before','after','bank','card','statement'])add(it[k]);
 for(const p of it.pairs||[])add(p);for(const l of it.lines||[])add(l?.ja);
 return out;
}
// Lines shorter than this (はい、あります。) are too generic to count as a copied exercise.
const COPY_MIN=8;
const norm=s=>String(s).replace(/[\s。、？！?!.,…・「」（）()]/g,'');
function sentencesOf(it,format){
 if(format==='blank')return it.choices?.[it.correct]!==undefined?[String(it.ja).replace('（　）',it.choices[it.correct])]:[];
 if(format==='order')return answerSentences(it);
 if(format==='star')return [starSentence(it)];
 if(format==='cloze'){let g=0;return [(it.lines||[]).map(l=>String(l.ja).replace(/（([0-9０-９]+)）/g,()=>it.bank?.[it.answers?.[g++]]??'')).join('')];}
 // A choice item's answer may be a taught line retrieved in a new situation; the line it shows may not be one.
 if(format==='choice')return it.ja?[it.ja]:[];
 if(format==='truefalse')return [];
 return (it.pairs||[]).map(p=>p.join('|'));
}
// Japanese lines the units already show, normalized, so a checkpoint item never copies one.
function unitLines(content){
 const out=new Set();
 for(const l of content?.lessons||[]){
  if(!hasUnit(l))continue;
  for(const s of l.sections){if(s.kind==='point')for(const e of s.examples||[])out.add(norm(e.ja));if(s.kind==='practice')for(const it of [...(s.items||[]),...(s.example?[s.example]:[])])for(const x of sentencesOf(it,it.format||s.format))out.add(norm(x));}
  for(const d of l.dialogue||[])out.add(norm(d.ja));
 }
 out.delete('');return out;
}
const formsOf=w=>[w?.word,...(w?.forms||[]).map(f=>f.form)].filter(text);
// The lessons whose words an item may show: its own, its prerequisites on the path, and what it `uses`.
function poolLessons(path,it){const seen=new Set(),walk=id=>{if(seen.has(id))return;seen.add(id);for(const p of path?.requires?.[id]||[])walk(p);};walk(it.lesson);for(const u of it.uses||[])walk(u);return seen;}

// Problems fail tools/validate.mjs; warnings are softer. `seeds` are the selection seeds the coverage check runs with.
export function checkpointProblems(content,path,{seeds=['a','b','c']}={}){
 const p=[],w=[],items=checkpointItems(content),raw=content?.checkpoints;
 if(raw===undefined)return {problems:['lessons.json needs checkpoints (tools/units/<id>.mjs `checkpoint`)'],warnings:w};
 if(!plainObject(raw)||raw.version!==CHECKPOINT_VERSION||!Array.isArray(raw.items))return {problems:[`checkpoints must be {version: ${CHECKPOINT_VERSION}, items}`],warnings:w};
 const lessons=new Map((content.lessons||[]).map(l=>[l.id,l])),vocab=new Map((content.vocabulary||[]).map(x=>[x.id,x])),lines=unitLines(content);
 const unitIds=new Set([...lessons.values()].filter(hasUnit).flatMap(l=>unitItems(l).map(it=>it.id))),seen=new Set(),frameVenue=new Map();
 const tableOf=id=>new Set(wordEntries(lessons.get(id)?.words).map(x=>x.id));
 const pointOf=(lid,pid)=>(lessons.get(lid)?.sections||[]).find(s=>s.kind==='point'&&s.id===pid)||null;
 for(const it of items){
  const at=`Checkpoint item ${it?.id||'?'}`;
  if(!plainObject(it)){p.push(`${at}: not an object`);continue;}
  if(!ID.test(it.id||'')||/-\d+$/.test(it.id))p.push(`${at}: needs an ID of letters, digits and hyphens, not ending in -<number>`);
  if(seen.has(it.id)||unitIds.has(it.id))p.push(`${at}: ID is used twice`);seen.add(it.id);
  const l=lessons.get(it.lesson);
  if(!hasUnit(l)){p.push(`${at}: unknown lesson ${it.lesson}`);continue;}
  if(!String(it.id).startsWith(`${it.lesson}-`))p.push(`${at}: IDs start with the lesson ID (${it.lesson}-…)`);
  const block=blockOf(path,it.lesson);
  if(block===null){p.push(`${at}: lesson ${it.lesson} is not on the Learn path`);continue;}
  if(block===0)w.push(`${at}: ${it.lesson} comes after the last checkpoint, so this item is never asked`);
  if(!ITEM_FORMATS.includes(it.format)){p.push(`${at}: format must be one of ${ITEM_FORMATS.join(', ')}`);continue;}
  const before=p.length;itemChecks(strip(it),it.format,at,p,w);p.push(...markupProblems(strip(it),at));
  if(it.instruction!==undefined&&!text(it.instruction))p.push(`${at}: instruction must be text`);
  if(p.length>before)continue;
  // Answer keys dispatch, and shuffles start out of answer order (exercises.mjs graders).
  if(['choice','blank'].includes(it.format))it.choices.forEach((_,j)=>{if(gradeChoice(it,j).correct!==(j===it.correct))p.push(`${at}: choice ${j+1} grades wrongly`);});
  if(it.format==='order'&&!gradeOrder(it,it.tiles.map((_,j)=>j)).correct)p.push(`${at}: the authored order must grade as correct`);
  if(it.format==='star'&&!gradeStar(it,it.star).correct)p.push(`${at}: the ★ tile must grade as correct`);
  // Targets: a words-table word or a point of this lesson, one per counted key.
  const keys=unitKeys(it),multi=['match','cloze'].includes(it.format),list=multi?it.targets:[it.target];
  if(multi&&it.target!==undefined)p.push(`${at}: ${it.format} items take targets, one per ${it.format==='match'?'pair':'gap'}`);
  if(!multi&&it.targets!==undefined)p.push(`${at}: one target per ${it.format} item`);
  if(!Array.isArray(list)||list.length!==keys.length)p.push(`${at}: needs ${keys.length} target${keys.length===1?'':'s'}`);
  else list.forEach((t,k)=>{const where=multi?`${at} target ${k+1}`:at;if(!plainObject(t)||Object.keys(t).length!==1||!(text(t.word)||text(t.point)))p.push(`${where}: a target is {word} or {point}`);else if(t.word&&!tableOf(it.lesson).has(t.word))p.push(`${where}: ${t.word} is not in ${it.lesson}'s words table`);else if(t.point&&!pointOf(it.lesson,t.point))p.push(`${where}: ${t.point} is not a point of ${it.lesson}`);else if(!focusItems(content,{lesson:it.lesson,...t}).length)p.push(`${where}: no drill in ${it.lesson} teaches it, so a miss has nowhere to go`);});
  // Venue and frame.
  for(const k of ['venue','taught'])if(!Object.hasOwn(VENUES,it[k]||''))p.push(`${at}: ${k} must be one of ${Object.keys(VENUES).join(', ')}`);
  if(it.venue&&it.venue===it.taught)p.push(`${at}: set in ${it.venue}, where its frame was taught; choose another venue`);
  const pool=poolLessons(path,it),uses=Array.isArray(it.uses)?it.uses:it.uses===undefined?[]:null;
  if(!uses||uses.some(u=>typeof u!=='string'))p.push(`${at}: uses must list lesson IDs`);
  else for(const u of uses){const b=blockOf(path,u);if(u===it.lesson||!lessons.has(u))p.push(`${at}: uses names ${u}`);else if(b===null||b===0||b>block)p.push(`${at}: uses ${u}, which comes after this item's checkpoint`);}
  if((Array.isArray(list)?list:[]).some(t=>t?.point)||it.frame!==undefined){
   const fl=[...pool].find(id=>pointOf(id,it.frame)),fp=fl&&pointOf(fl,it.frame);
   if(!fp)p.push(`${at}: frame must be a point in its lessons (${[...pool].join(', ')})`);
   else{
    const ex=fp.examples?.[it.example];
    if(!ex)p.push(`${at}: example must index one of ${it.frame}'s examples`);
    const sw=vocab.get(it.slot);
    if(!sw)p.push(`${at}: slot must be a vocabulary ID`);
    else{
     const all=[...jaStrings(it),...sentencesOf(it,it.format)].join('\n');
     if(!formsOf(sw).some(f=>all.includes(f)))p.push(`${at}: its slot word ${it.slot} does not appear in it`);
     if(ex&&formsOf(sw).some(f=>String(ex.ja).includes(f)))p.push(`${at}: its slot word ${it.slot} is the one in ${it.frame} example ${it.example+1}; use another taught word`);
    }
    if(frameVenue.has(it.frame)&&frameVenue.get(it.frame)!==it.taught)p.push(`${at}: ${it.frame} was taught in ${frameVenue.get(it.frame)} in another recipe, not ${it.taught}`);else frameVenue.set(it.frame,it.taught);
   }
  }
  // Taught pool: every word declared, every declared word taught in the pool and shown, and no kanji or katakana word
  // outside them (people's names and numerals aside).
  const words=Array.isArray(it.words)?it.words:null,names=Array.isArray(it.names)?it.names:[];
  if(!words||!words.length||words.some(x=>typeof x!=='string'))p.push(`${at}: words must list every vocabulary ID it shows`);
  else{
   const taught=new Set([...pool].flatMap(id=>[...tableOf(id)])),shown=jaStrings(it).join('\n'),all=[shown,...sentencesOf(it,it.format)].join('\n');let rest=shown;
   for(const x of words){const v=vocab.get(x);if(!v){p.push(`${at}: unknown word ${x}`);continue;}if(!taught.has(x))p.push(`${at}: ${x} is not in the words tables of ${[...pool].join(', ')}`);const fs=formsOf(v);if(!fs.some(f=>all.includes(f)))p.push(`${at}: lists ${x} but does not show it`);for(const f of fs.sort((a,b)=>b.length-a.length))rest=rest.split(f).join(' ');}
   for(const nm of names){if(!text(nm)||![...lessons.values()].some(x=>JSON.stringify(x.sections||[]).includes(nm)))p.push(`${at}: name ${nm} is not met in any unit`);rest=rest.split(nm).join(' ');}
   // A form split by a gap or a tile ({食|た}べ（　）) still shows only that word's kanji.
   const groups=new Set(words.flatMap(x=>formsOf(vocab.get(x)).flatMap(f=>[...f.matchAll(RUBY)].map(m=>m[0]))));
   const kanji=[...rest.matchAll(RUBY)].filter(m=>!groups.has(m[0])).map(m=>m[1]).filter(k=>!NUMERAL.test(k)),kata=(rest.replace(RUBY,' ').match(/[ァ-ヺ][ァ-ヺー]+/g)||[]);
   if(kanji.length||kata.length)p.push(`${at}: shows ${uniq([...kanji,...kata]).join(', ')}, which is not a declared taught word`);
  }
  // Recomposed, never copied: no full sentence it builds is a unit line.
  for(const x of sentencesOf(it,it.format))if(norm(x).length>=COPY_MIN&&lines.has(norm(x)))p.push(`${at}: copies a unit line (${x})`);
 }
 // Coverage: every checkpoint, for a learner who finishes the lessons in path order, has enough items for its default
 // size from its own lessons, at least one per lesson, and enough earlier items, with every seed.
 if(!p.length)for(const sc of coverageScenarios(path)){
  for(const seed of seeds){
   let store=emptyCheckpoints();
   for(const b of boundaries(path)){
    const completed=sc.completedAt(b.n),pool=poolFor(path,b.n,{completed,checkpoints:store});
    const pick=selectItems(content,path,{n:b.n,...pool,completed,seed,used:usedItems(store)});
    if(pick.short.recent||pick.short.earlier||pick.short.lessons.length)p.push(`Checkpoint ${b.n} ${sc.label} (seed ${seed}): ${pick.short.lessons.length?`no item for ${pick.short.lessons.join(', ')}`:''}${pick.short.recent?` ${pick.short.recent} recent item(s) short`:''}${pick.short.earlier?` ${pick.short.earlier} earlier item(s) short`:''}`.trim());
    store={...store,runs:{...store.runs,[b.n]:{n:b.n,lessons:pool.recent,items:pick.items,done:1}}};
   }
  }
  if(p.length)break;
 }
 return {problems:uniq(p),warnings:w};
}
// The learner the coverage check follows: every lesson finished in path order, and each checkpoint as it opens. Path
// version 2 has no electives, so this is the only scenario.
export function coverageScenarios(path){
 return [{label:'in path order',completedAt:n=>requiredLessons(path,n)}];
}
