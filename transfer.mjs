// Unseen transfer texts: short notices, messages, receipts, menus and signs set in venues the course never teaches, and
// written only from the words and patterns of their source lessons. The learner reads one once, the text is hidden, the
// questions are answered from memory with no feedback until the last one, then the evidence lines are picked with the
// lines in view. One delayed re-ask follows on the text's page, never on the same day. Further tries (phase `retry`)
// start from a fresh read and can complete the text, but only the first reading counts as evidence. Results are kept
// per tested word and pattern, apart from lesson scores. A text opens on its own `requires` (loop.mjs itemState, learning
// loop Phase 3); its `sources` are the language contract that transferProblems checks. Shared by the app, the seed, the
// validator and the tests; nothing here touches the DOM, and every function that needs the time takes `now`, so tests
// inject the clock.
import {validQuestion,assessChoice} from './assessment.mjs?b=8b9c4fd';
import {indexWords,validateOccurrences,occurrenceReadingProblems,insideRuby,plainWritten,sameDay} from './vocabulary.mjs?b=8b9c4fd';
import {hasUnit,unitItems,wordIds,patternPoints} from './exercises.mjs?b=8b9c4fd';
import {DAY,ENTRY_DAYS} from './schedule.mjs?b=8b9c4fd';

export const TRANSFER_VERSION=1;
export const GENRES=['notice','message','receipt','menu','sign'];
export const GENRE_LABELS={notice:'Notice',message:'Message',receipt:'Receipt',menu:'Menu',sign:'Sign'};
// The first reading answers the immediate set; the one delayed re-ask answers the delayed set; a further try (retry)
// answers the immediate set again after a fresh read. Content is authored and checked for the two asked sets (ASKED).
export const PHASES=['initial','delayed','retry'];
export const ASKED=['initial','delayed'];
export const SET_OF={initial:'immediate',delayed:'delayed',retry:'immediate'};
export const MODES=['closed','supported'];
// Recall items are answered with the text hidden. Line items come after them, with the text's lines as the choices.
export const RECALL_KINDS=['gist','detail','idea'];
export const KIND_LABELS={gist:'Gist',detail:'Detail',idea:'True, false or cannot conclude',line:'Evidence line'};
// The idea scale for unseen texts. Its order never changes, so it reads as a scale, not a puzzle.
export const TRUTH_CHOICES=['True','False','Cannot conclude'];
export const ATTEMPTS_MAX=10,REREADS_MAX=20;
// Characters that need no source: punctuation, spaces and numerals. Everything else in a line is a declared token.
export const NOTATION=/[\s　。、，．・…！？!?「」『』（）()：:／/〜～\-−0-9０-９%％]/;
// Function words a line may use between word references. Each must also be attested in a source lesson's teaching
// records (tiles, choices, banks, point patterns, examples, dialogue); a vocabulary word is never a function word.
export const FUNCTION_WORDS=['は','が','を','に','で','の','も','か','ね','よ','から','です','でした','ですね','ですか','ではありません','ます','ません','ました','ましょう','ませんか','はい','いいえ'];
// A clock time as the units write it ({四時|よじ}, {六時|ろくじ}{半|はん} keeps 半 as its own word).
const CLOCK=/^\{[一二三四五六七八九十]+時\|[ぁ-ゖ]+\}$/;
const JA=/[ぁ-ゖァ-ヺー㐀-鿿々〆]/;
const JA_RUN=/(?:\{[^|{}]+\|[^{}]+\}|[ぁ-ゖァ-ヺー㐀-鿿々〆])(?:\{[^|{}]+\|[^{}]+\}|[ぁ-ゖァ-ヺー㐀-鿿々〆0-9０-９、・〜])*/g;
const ID=/^t\d{2}$/,PATTERN_ID=/^[a-z0-9]+(-[a-z0-9]+)*$/;
const plainObject=v=>!!v&&typeof v==='object'&&!Array.isArray(v);
const text=v=>typeof v==='string'&&v.trim().length>0;
const time=v=>Number.isFinite(v)&&v>=0;

export const textsOf=content=>Array.isArray(content?.transfer?.texts)?content.transfer.texts:[];
export const findText=(content,id)=>textsOf(content).find(t=>t.id===id)||null;
export const transferSource=id=>`transfer:${id}`;
export const inTransferText=path=>/^lines\/\d+$/.test(String(path));
const lineIndex=path=>Number(String(path).split('/')[1]);

// ── Questions ─────────────────────────────────────────────────────────────────────────────────────────────
// A set holds recall items first (gist, detail, idea), then line items. A line item names an idea unit and offers some
// of the text's lines; the right line is one of that unit's evidence lines.
export const recallItems=(t,phase)=>(t?.questions?.[SET_OF[phase]]||[]).filter(q=>q?.kind!=='line');
export const lineItems=(t,phase)=>(t?.questions?.[SET_OF[phase]]||[]).filter(q=>q?.kind==='line');
// A line item as an assessable question: its choices are the lines themselves.
export function lineQuestion(t,q){return {...q,choices:(q.lines||[]).map(i=>t.lines?.[i]),correct:q.correct,feedback:q.feedback};}
const evidenceLines=(t,unitIds)=>[...new Set((t.ideaUnits||[]).filter(u=>unitIds.includes(u.id)).flatMap(u=>(u.evidence||[]).map(s=>lineIndex(s.path))))].sort((a,b)=>a-b);
export const questionLines=(t,q)=>q.kind==='line'?evidenceLines(t,[q.unit]):evidenceLines(t,q.units||[]);

// ── Opening and completion ────────────────────────────────────────────────────────────────────────────────
// A text opens on its own `requires`, like any book (loop.mjs itemState); nothing waits on a delayed recall (learning
// loop rule 8). The delayed-recall gate that stood here (transferAccess, passageReached) went in loop Phase 3.
// A text is completed by a closed attempt, the first reading or a later try, whose recall items and evidence-line picks
// are all right. The delayed check never completes it.
export const completesText=a=>!!a&&a.phase!=='delayed'&&a.mode==='closed'&&Array.isArray(a.items)&&a.items.length>0&&a.items.every(i=>i?.correct===true)&&(a.lines||[]).every(i=>i?.correct===true);

// ── Store ─────────────────────────────────────────────────────────────────────────────────────────────────
// state.transfer = {version, texts: {id: entry}}. entry = {read?, attempts, draft?, delayed?, rereads?}.
//  read: when the text was first shown, its one unseen exposure. Showing it again before the questions start (a reload
//        mid-read) keeps that time; once the questions start, the text stays hidden.
//  attempts: [{phase, started, at, mode, items, lines, supportFrom?, qualified?}]. items are first responses to the recall
//        items, each with the words and patterns it tests (copied when recorded); lines are the evidence-line picks, made
//        with the lines in view. qualified (delayed only): closed book, at least a day and a later calendar day after the
//        learner last saw the text. phase is initial (one), delayed (at most one) or retry (any number, each after a
//        fresh read, which is kept in rereads). At most ATTEMPTS_MAX are kept: the oldest retries go first, never the
//        initial or delayed attempt.
//  draft: the attempt in progress {phase, started, mode, answers, lines, supportFrom?}, saved at every step.
//  delayed: {due, done?}: the one delayed re-ask, set when the first attempt is finished and consumed when the delayed
//        attempt is, whatever its score. It is never set again.
//  rereads: times the text was read again after the first attempt. Those are revisits, never unseen readings.
export const emptyTransfer=()=>({version:TRANSFER_VERSION,texts:{}});
const baseStore=s=>s?.version===TRANSFER_VERSION&&plainObject(s.texts)?s:emptyTransfer();
export const entryOf=(store,id)=>baseStore(store).texts[id]||null;
// Entries are written in one key order, so saved state, backups and a strict read of them compare equal.
const canon=e=>({...(e.read!==undefined?{read:e.read}:{}),attempts:e.attempts||[],...(e.draft?{draft:e.draft}:{}),...(e.delayed?{delayed:e.delayed}:{}),...(e.rereads?.length?{rereads:e.rereads}:{})});
const putEntry=(store,id,entry)=>{const s=baseStore(store);return {...s,texts:{...s.texts,[id]:canon(entry)}};};
const blank=()=>({attempts:[]});
export const draftOf=(store,id)=>entryOf(store,id)?.draft||null;
export const firstAttempt=(store,id)=>(entryOf(store,id)?.attempts||[]).find(a=>a.phase==='initial')||null;
export const delayedAttempt=(store,id)=>(entryOf(store,id)?.attempts||[]).find(a=>a.phase==='delayed')||null;
// The last time the learner saw the text: the first reading, the reveal after an attempt, or a later reread.
export function lastSeen(entry){const list=[entry?.read,...(entry?.attempts||[]).map(a=>a.at),...(entry?.rereads||[])].filter(time);return list.length?Math.max(...list):null;}
const nextMidnight=t=>{const d=new Date(t);d.setHours(24,0,0,0);return d.getTime();};
// The delayed re-ask: at least ENTRY_DAYS (the scheduler's first interval, 1 day) after the first attempt and on a later
// local calendar date, so a day that is 25 hours long cannot bring it back on the same date.
export const delayedDue=at=>Math.max(at+ENTRY_DAYS*DAY,nextMidnight(at));
export const delayOk=(previous,at)=>time(previous)&&time(at)&&at-previous>=DAY&&!sameDay(previous,at);

// The first exposure. Recorded once; later calls change nothing.
export function startReading(store,t,now){
 const e=entryOf(store,t.id);
 if(e?.read!==undefined)return {store,first:false};
 if(e?.attempts?.length||e?.draft)return {store,first:false};
 return {store:putEntry(store,t.id,{...(e||blank()),read:now}),first:true};
}
// A reread after the first attempt: a revisit, never an unseen reading.
export function recordReread(store,t,now){
 const e=entryOf(store,t.id);if(!firstAttempt(store,t.id))return {store,changed:false};
 return {store:putEntry(store,t.id,{...e,rereads:[...(e.rereads||[]),now].slice(-REREADS_MAX)}),changed:true};
}
// Which phase the text's page opens on now: the attempt in progress, initial before any attempt, delayed once its re-ask
// is due, otherwise null (the results; a retry starts only when the learner asks for one).
export function phaseNow(store,id,now){
 const e=entryOf(store,id);if(e?.draft)return e.draft.phase;
 if(!firstAttempt(store,id))return 'initial';
 if(e?.delayed&&e.delayed.done===undefined&&e.delayed.due<=now)return 'delayed';
 return null;
}
// Starts or resumes the attempt in progress. The initial attempt needs the first reading first; the delayed one needs its
// re-ask to be due; a retry needs the first attempt, at any time, with no limit and no wait (its fresh read is recorded
// with recordReread before it). An attempt in progress always resumes as it was.
export function startAttempt(store,t,{phase,mode='closed'},now){
 const e=entryOf(store,t.id);
 if(e?.draft)return {store,draft:e.draft,resumed:true};
 const can=phase==='retry'?!!firstAttempt(store,t.id):phaseNow(store,t.id,now)===phase;
 if(!PHASES.includes(phase)||!MODES.includes(mode)||!can||(phase==='initial'&&e?.read===undefined))return {store,draft:null,resumed:false};
 const draft={phase,started:now,mode,answers:[],lines:[],...(mode==='supported'?{supportFrom:0}:{})};
 return {store:putEntry(store,t.id,{...(e||blank()),draft}),draft,resumed:false};
}
const putDraft=(store,t,draft)=>putEntry(store,t.id,{...entryOf(store,t.id),draft});
// A first response to a recall item. Recorded once: a second tap, a reload or a repeated submission changes nothing.
export function answerRecall(store,t,{q,choice}){
 const d=draftOf(store,t.id);if(!d)return {store,added:false};
 const question=recallItems(t,d.phase).find(x=>x.id===q);if(!question||d.answers.some(a=>a.q===q))return {store,added:false};
 const item={q,choice,correct:assessChoice(question,choice).correct};
 return {store:putDraft(store,t,{...d,answers:[...d.answers,item]}),item,added:true};
}
// An evidence-line pick. Only after every recall item has its answer, so seeing the lines cannot help a recall answer.
export function answerLine(store,t,{q,choice}){
 const d=draftOf(store,t.id);if(!d||d.answers.length<recallItems(t,d.phase).length)return {store,added:false};
 const question=lineItems(t,d.phase).find(x=>x.id===q);if(!question||d.lines.some(a=>a.q===q))return {store,added:false};
 const item={q,choice,correct:assessChoice(lineQuestion(t,question),choice).correct};
 return {store:putDraft(store,t,{...d,lines:[...d.lines,item]}),item,added:true};
}
// Opening the text during the recall items marks the attempt supported for good. Answers already given stay unaided.
export function openSupport(store,t){
 const d=draftOf(store,t.id);if(!d||d.mode==='supported')return {store,changed:false};
 return {store:putDraft(store,t,{...d,mode:'supported',supportFrom:d.answers.length}),changed:true};
}
export const draftStage=(t,d)=>!d?null:d.answers.length<recallItems(t,d.phase).length?'recall':d.lines.length<lineItems(t,d.phase).length?'lines':'done';
const targetsOf=q=>({words:[...(q.targets?.words||[])],patterns:[...(q.targets?.patterns||[])]});
// The attempt log with one more attempt, at most ATTEMPTS_MAX long: the oldest retries are dropped first, so the initial
// and delayed attempts are always kept.
function keepAttempts(list){
 const out=[...list];
 while(out.length>ATTEMPTS_MAX){const i=out.findIndex(a=>a.phase==='retry');if(i<0)break;out.splice(i,1);}
 return out.slice(-ATTEMPTS_MAX);
}
// Moves a complete draft into the attempt log. Finishing twice records once. The initial attempt sets the one delayed
// re-ask; the delayed attempt consumes it, whether or not its answers were right; a retry leaves it as it is.
export function finishAttempt(store,t,now){
 const e=entryOf(store,t.id),d=e?.draft;
 if(!d||draftStage(t,d)!=='done')return {store,attempt:null};
 if(e.attempts.some(a=>a.started===d.started&&a.phase===d.phase))return {store:putEntry(store,t.id,{...e,draft:undefined}),attempt:null};
 const bank=recallItems(t,d.phase);
 const items=d.answers.map(a=>({...a,...targetsOf(bank.find(q=>q.id===a.q))}));
 const qualified=d.phase==='delayed'?d.mode==='closed'&&delayOk(lastSeen({...e,attempts:e.attempts}),now):undefined;
 const attempt={phase:d.phase,started:d.started,at:now,mode:d.mode,items,lines:d.lines.map(x=>({...x})),...(d.mode==='supported'?{supportFrom:d.supportFrom??0}:{}),...(qualified!==undefined?{qualified}:{})};
 const {draft,...rest}=e;
 const delayed=d.phase==='initial'?(e.delayed||{due:delayedDue(now)}):d.phase==='delayed'?{...e.delayed,done:now}:e.delayed;
 return {store:putEntry(store,t.id,{...rest,attempts:keepAttempts([...e.attempts,attempt]),delayed}),attempt};
}
export const unaidedCount=a=>a.mode==='closed'?a.items.length:Math.min(a.supportFrom??0,a.items.length);
// What an attempt shows: recall from memory, recall overall, evidence lines (always seen with the lines in view) and the
// critical idea units missed.
export function attemptScore(t,a){
 const bank=recallItems(t,a.phase),unaided=a.items.slice(0,unaidedCount(a)),units=new Map((t.ideaUnits||[]).map(u=>[u.id,u]));
 const criticalMissed=[...new Set(a.items.filter(i=>!i.correct).flatMap(i=>bank.find(q=>q.id===i.q)?.units||[]).filter(id=>units.get(id)?.critical))];
 const n=list=>({correct:list.filter(i=>i.correct).length,total:list.length});
 return {recall:n(a.items),unaided:n(unaided),lines:n(a.lines||[]),criticalMissed,allCorrect:a.items.every(i=>i.correct),fromMemory:unaidedCount(a)===a.items.length};
}
// Where a text stands, for its book card and page.
export function transferStatus(t,store,now){
 const e=entryOf(store,t.id),first=firstAttempt(store,t.id),later=delayedAttempt(store,t.id);
 if(e?.draft)return {stage:'answering',phase:e.draft.phase};
 if(!first)return {stage:e?.read!==undefined?'reading':'new'};
 if(later)return {stage:'done',first,later};
 if(e.delayed&&e.delayed.due<=now)return {stage:'due',first,due:e.delayed.due};
 return {stage:'waiting',first,due:e.delayed?.due??null};
}
export const STATUS_LABELS={new:'Not read yet',reading:'Reading',answering:'Questions in progress',waiting:'Read once · delayed check waiting',due:'Delayed check due',done:'Delayed check done'};

// ── Today ─────────────────────────────────────────────────────────────────────────────────────────────────
// The one delayed re-ask is a Today unit while it is due and not yet done. Its revision moves only when it is answered,
// so a run started earlier sees an answer given on the text's page as stale.
export function transferRevision(store,id){const e=entryOf(store,id);return e?.delayed&&e.delayed.done===undefined?`${e.delayed.due}:${e.attempts.filter(a=>a.phase!=='retry').length}`:null;}
export function dueTransfers(store,content,now){
 const out=[];
 for(const [id,e] of Object.entries(baseStore(store).texts)){
  if(!findText(content,id)||!e?.delayed||e.delayed.done!==undefined||e.delayed.due>now)continue;
  out.push({id,due:e.delayed.due,revision:transferRevision(store,id)});
 }
 return out.sort((a,b)=>a.due-b.due);
}

// ── Evidence ──────────────────────────────────────────────────────────────────────────────────────────────
// Per tested word and pattern: first-reading answers given from memory (a new context), delayed answers that qualified
// (unaided recall of a now-familiar text), and practice (answers after the text was opened, or a delayed check that did
// not qualify). Only the words and patterns a question tests count; the other words in a text count as exposure only.
// Retries are ignored: only the first reading of a text is transfer evidence.
// Comprehension is not reading evidence: a word here earns nothing towards its kanji reading.
const bucket=()=>({correct:0,total:0});
const fresh=()=>({initial:bucket(),delayed:bucket(),practice:bucket(),texts:0});
export function transferEvidence(content,store){
 const words={},patterns={};
 for(const t of textsOf(content)){
  const e=entryOf(store,t.id);if(!e?.attempts?.length)continue;
  for(const id of new Set((t.occurrences||[]).map(o=>o.word)))(words[id]||=fresh()).texts++;
  for(const id of new Set((t.patterns||[]).map(p=>p.pattern)))(patterns[id]||=fresh()).texts++;
  for(const a of e.attempts){
   if(a.phase==='retry')continue;
   const cut=unaidedCount(a);
   a.items.forEach((it,i)=>{
    const kind=i>=cut?'practice':a.phase==='initial'?'initial':a.qualified?'delayed':'practice';
    for(const [map,ids] of [[words,it.words||[]],[patterns,it.patterns||[]]])for(const id of ids){const b=(map[id]||=fresh())[kind];b.total++;if(it.correct)b.correct++;}
   });
  }
 }
 return {words,patterns};
}
// One line for a progress view, or '' without evidence.
export function evidenceLine(x){
 if(!x||!(x.initial.total||x.delayed.total||x.practice.total))return '';
 return [x.initial.total?`${x.initial.correct} of ${x.initial.total} right on a first reading`:'',x.delayed.total?`${x.delayed.correct} of ${x.delayed.total} right a day or more later`:'',x.practice.total?`${x.practice.correct} of ${x.practice.total} with the text open or without a delay`:''].filter(Boolean).join(' · ');
}
// Across every text: first readings and delayed checks from memory, for the evidence summary.
export function transferSummary(content,store){
 let read=0,first={correct:0,total:0},later={correct:0,total:0},open=0;
 for(const t of textsOf(content)){
  const f=firstAttempt(store,t.id),d=delayedAttempt(store,t.id);if(!f)continue;read++;
  const s=attemptScore(t,f);first.correct+=s.unaided.correct;first.total+=s.unaided.total;
  if(d&&d.qualified){const x=attemptScore(t,d);later.correct+=x.recall.correct;later.total+=x.recall.total;}
  if(!d)open++;
 }
 return {texts:textsOf(content).length,read,first,later,waiting:open};
}

// ── Saved state and backups ───────────────────────────────────────────────────────────────────────────────
// Strict reads (restore) reject the whole file with a message; lenient reads (local state) drop what they cannot use.
function cleanPicks(list,bank,assess){
 if(!Array.isArray(list)||list.length>bank.length)return null;
 const seen=new Set(),out=[];
 for(const x of list){
  const q=bank.find(b=>b.id===x?.q);
  if(!q||seen.has(q.id)||!Number.isInteger(x.choice))return null;
  let g;try{g=assess(q,x.choice);}catch{return null;}
  if(x.correct!==g.correct)return null;
  seen.add(q.id);out.push({q:q.id,choice:x.choice,correct:x.correct});
 }
 return out;
}
const knownTargets=(ids,known)=>Array.isArray(ids)&&ids.length<=20&&ids.every(id=>typeof id==='string'&&known.has(id))&&new Set(ids).size===ids.length;
function cleanAttempt(a,t,known){
 if(!plainObject(a)||!PHASES.includes(a.phase)||!MODES.includes(a.mode)||!time(a.started)||!time(a.at)||a.at<a.started)return null;
 if((a.mode==='closed')!==(a.supportFrom===undefined))return null;
 if((a.phase==='delayed')!==(typeof a.qualified==='boolean')||(a.qualified&&a.mode!=='closed'))return null;
 const bank=recallItems(t,a.phase),items=cleanPicks(a.items,bank,assessChoice),lines=cleanPicks(a.lines??[],lineItems(t,a.phase),(q,c)=>assessChoice(lineQuestion(t,q),c));
 if(!items||items.length!==bank.length||!lines)return null;
 if(a.supportFrom!==undefined&&(!Number.isInteger(a.supportFrom)||a.supportFrom<0||a.supportFrom>items.length))return null;
 for(const [i,x] of a.items.entries())if(!knownTargets(x.words??[],known.words)||!knownTargets(x.patterns??[],known.patterns))return null;else{items[i].words=[...(x.words||[])];items[i].patterns=[...(x.patterns||[])];}
 return {phase:a.phase,started:a.started,at:a.at,mode:a.mode,items,lines,...(a.supportFrom!==undefined?{supportFrom:a.supportFrom}:{}),...(a.phase==='delayed'?{qualified:a.qualified}:{})};
}
function cleanDraft(d,t){
 if(!plainObject(d)||!PHASES.includes(d.phase)||!MODES.includes(d.mode)||!time(d.started))return null;
 if((d.mode==='closed')!==(d.supportFrom===undefined))return null;
 const answers=cleanPicks(d.answers,recallItems(t,d.phase),assessChoice),lines=cleanPicks(d.lines??[],lineItems(t,d.phase),(q,c)=>assessChoice(lineQuestion(t,q),c));
 if(!answers||!lines||(lines.length&&answers.length<recallItems(t,d.phase).length))return null;
 if(d.supportFrom!==undefined&&(!Number.isInteger(d.supportFrom)||d.supportFrom<0||d.supportFrom>answers.length))return null;
 return {phase:d.phase,started:d.started,mode:d.mode,answers,lines,...(d.supportFrom!==undefined?{supportFrom:d.supportFrom}:{})};
}
const ENTRY_KEYS=new Set(['read','attempts','draft','delayed','rereads']);
export function readTransferState(value,content,{strict=false}={}){
 const fail=msg=>{if(strict)throw Error(msg);},out=emptyTransfer(),raw=value?.transfer;
 if(raw===undefined||raw===null)return {transfer:out};
 if(!plainObject(raw)||raw.version!==TRANSFER_VERSION||!plainObject(raw.texts)){fail('This backup contains invalid unseen-text records.');return {transfer:out};}
 const known={words:new Set((content?.vocabulary||[]).map(w=>w.id)),patterns:new Set((content?.patterns||[]).map(p=>p.id))};
 for(const [id,e] of Object.entries(raw.texts)){
  const t=findText(content,id),bad=()=>fail(`This backup contains an invalid record for the unseen text ${id}.`);
  if(!t||!plainObject(e)||Object.keys(e).some(k=>!ENTRY_KEYS.has(k))||!Array.isArray(e.attempts)||e.attempts.length>ATTEMPTS_MAX||(e.read!==undefined&&!time(e.read))||(e.rereads!==undefined&&(!Array.isArray(e.rereads)||e.rereads.length>REREADS_MAX||!e.rereads.every(time)))){bad();continue;}
  const attempts=[];for(const a of e.attempts){const c=cleanAttempt(a,t,known);if(c)attempts.push(c);else bad();}
  let draft;if(e.draft!==undefined&&e.draft!==null){draft=cleanDraft(e.draft,t);if(!draft){bad();draft=undefined;}}
  let delayed;
  if(e.delayed!==undefined){
   const x=e.delayed,ok=plainObject(x)&&Object.keys(x).every(k=>k==='due'||k==='done')&&time(x.due)&&(x.done===undefined||time(x.done));
   if(ok)delayed=x.done===undefined?{due:x.due}:{due:x.due,done:x.done};else bad();
  }
  const initial=attempts.filter(a=>a.phase==='initial'),later=attempts.filter(a=>a.phase==='delayed'),retries=attempts.filter(a=>a.phase==='retry');
  // One first reading, at most one delayed check and only after it, retries only after it, a re-ask only once the first
  // attempt exists, and a consumed re-ask only with its attempt: anything else cannot come from the app. A retry draft
  // needs the first attempt, as an initial draft needs none.
  if(initial.length>1||later.length>1||((later.length||retries.length)&&!initial.length)||(!!delayed!==!!initial.length)||(delayed&&(delayed.done!==undefined)!==!!later.length)||(draft&&((draft.phase==='initial')===!!initial.length||(draft.phase==='delayed'&&(!delayed||delayed.done!==undefined))))){bad();if(strict)continue;}
  out.texts[id]={...(e.read!==undefined?{read:e.read}:{}),attempts,...(draft?{draft}:{}),...(delayed?{delayed}:{}),...(e.rereads?.length?{rereads:[...e.rereads]}:{})};
 }
 return {transfer:out};
}

// ── Content checks ────────────────────────────────────────────────────────────────────────────────────────
// What a source lesson teaches, from its unit and explicit records: the words in its Words table and its word references,
// every Japanese string it shows (for inflected forms), and its attested pieces (tiles, choices, banks, point patterns,
// examples and dialogue, split at spaces, slots and punctuation) for function words.
const trimNotation=s=>{let a=0,b=s.length;while(a<b&&NOTATION.test(s[a]))a++;while(b>a&&NOTATION.test(s[b-1]))b--;return s.slice(a,b);};
const pieces=s=>String(s).replace(/［[^］]*］|（[^）]*）/g,' ').split(/[\s　／—。、！？!?「」…]+/).map(trimNotation).filter(Boolean);
function walkStrings(v,out){if(typeof v==='string')out.push(v);else if(Array.isArray(v))v.forEach(x=>walkStrings(x,out));else if(plainObject(v))for(const [k,x] of Object.entries(v))if(!['occurrences','kanji','id','patternId','format','kind'].includes(k))walkStrings(x,out);return out;}
export function taughtRecords(lesson){
 const words=new Set([...wordIds(lesson?.words),...(lesson?.occurrences||[]).map(o=>o.word)]);
 const strings=walkStrings([lesson?.sections,lesson?.dialogue,lesson?.focus],[]).filter(s=>JA.test(s));
 const attested=new Set(strings.flatMap(pieces));
 return {words,text:strings.join('\n'),attested};
}
function sourceRecords(t,content){
 const out={words:new Set(),text:'',attested:new Set(),patterns:new Set()};
 for(const s of t?.sources||[]){
  const l=content?.lessons?.find(x=>x.id===s?.lesson);if(!hasUnit(l))continue;
  const r=taughtRecords(l);r.words.forEach(w=>out.words.add(w));r.attested.forEach(x=>out.attested.add(x));out.text+=`\n${r.text}`;
  for(const p of content?.patterns||[])if(patternPoints(l,p.id).length||unitItems(l).some(it=>it.patternId===p.id))out.patterns.add(p.id);
 }
 return out;
}
// A token boundary map for one line: token edges and notation characters.
function boundaries(t,i){
 const line=t.lines[i],path=`lines/${i}`,set=new Set([0,line.length]);
 for(const tok of [...(t.occurrences||[]),...(t.grammar||[])])if(tok.path===path){set.add(tok.start);set.add(tok.end);}
 for(let k=0;k<line.length;k++)if(NOTATION.test(line[k])){set.add(k);set.add(k+1);}
 return set;
}
// Japanese outside the lines (questions, choices, feedback, notes) must quote a line on token boundaries, so it is covered
// by the same sources.
function quoteProblems(t,value,at){
 const out=[];
 for(const m of String(value).matchAll(JA_RUN)){
  const run=m[0].replace(/[、・〜]+$/,'');let found=false;
  t.lines.forEach((line,i)=>{if(found)return;const b=boundaries(t,i);for(let k=line.indexOf(run);k>=0;k=line.indexOf(run,k+1))if(b.has(k)&&b.has(k+run.length)){found=true;break;}});
  if(!found)out.push(`${at}: Japanese “${run}” must quote a line of the text on word boundaries`);
 }
 return out;
}
function spanProblems(t,span,at){
 if(!plainObject(span)||!inTransferText(span.path))return [`${at}: span needs a lines/N path`];
 const line=t.lines?.[lineIndex(span.path)];
 if(typeof line!=='string')return [`${at}: unknown line ${span.path}`];
 if(!Number.isInteger(span.start)||!Number.isInteger(span.end)||span.start<0||span.end<=span.start||span.end>line.length)return [`${at}: invalid range ${span.start}–${span.end}`];
 const out=[];
 if(line.slice(span.start,span.end)!==span.surface)out.push(`${at}: surface does not match ${span.path}`);
 if(insideRuby(line,span.start)||insideRuby(line,span.end))out.push(`${at}: span splits reading markup`);
 return out;
}
export function transferTextProblems(t,content){
 const label=`Unseen text ${t?.id}`,out=[];
 if(!plainObject(t))return [`${label}: not an object`];
 if(!ID.test(t.id||''))out.push(`${label}: ID must be t followed by two digits`);
 for(const k of ['title','venue','context','focus','translation','level','editorialStatus'])if(!text(t[k]))out.push(`${label}: needs ${k}`);
 if(!GENRES.includes(t.genre))out.push(`${label}: genre must be one of ${GENRES.join(', ')}`);
 if(!Number.isInteger(t.minutes)||t.minutes<1)out.push(`${label}: minutes must be a whole number`);
 if(!Array.isArray(t.lines)||t.lines.length<3||!t.lines.every(text))return [...out,`${label}: needs at least three lines of text`];
 // Sources: each a lesson with a unit, and the passages that come before the text (its `requires` chain must hold them
 // all, which tools/loop-check.mjs checks; they no longer wait on a delayed recall). A lesson's own passages are those of
 // its topic (passage.node). A topic without passages (Basic sentences) maps to a passage whose paragraphs reuse a word
 // from the lesson's Words table, so reading it retrieved that language in a taught setting.
 const index=indexWords(content?.vocabulary);
 if(!Array.isArray(t.sources)||!t.sources.length)out.push(`${label}: declare its source lessons`);
 const seenLessons=new Set();
 for(const s of t.sources||[]){
  const l=content?.lessons?.find(x=>x.id===s?.lesson),at=`${label} source ${s?.lesson}`;
  if(!hasUnit(l)){out.push(`${at}: not a lesson with a unit`);continue;}
  if(seenLessons.has(l.id))out.push(`${at}: listed twice`);seenLessons.add(l.id);
  if(!Array.isArray(s.passages)||!s.passages.length){out.push(`${at}: invalid prerequisite mapping: name the passage that must be recalled first`);continue;}
  const topical=(content?.passages||[]).some(p=>p.node===l.node),table=new Set(wordIds(l.words));
  for(const pid of s.passages){
   const p=content?.passages?.find(x=>x.id===pid);
   if(!p?.recall){out.push(`${at}: invalid prerequisite mapping: no passage ${pid} with recall`);continue;}
   if(topical?p.node!==l.node:!(p.occurrences||[]).some(o=>o.path.startsWith('paragraphs/')&&table.has(o.word)))out.push(`${at}: invalid prerequisite mapping: passage ${pid} is not a ${l.node} passage${topical?'':' and reuses no word from its Words table'}`);
  }
 }
 const src=sourceRecords(t,content);
 // Words: a valid reference to a word one of the source lessons teaches, in a form those lessons show.
 out.push(...validateOccurrences(t,index,{label}),...occurrenceReadingProblems(t,index,{label}));
 (t.occurrences||[]).forEach((o,i)=>{
  if(!inTransferText(o.path))out.push(`${label} occurrence ${i}: word references belong in the lines`);
  if(!src.words.has(o.word))out.push(`${label} occurrence ${i}: ${o.word} (${plainWritten(o.surface)}) is a word outside the declared source lessons`);
  else if(o.surface!==index.get(o.word)?.word&&!src.text.includes(o.surface))out.push(`${label} occurrence ${i}: the form ${plainWritten(o.surface)} is not shown in the declared source lessons`);
 });
 // Function words: from the closed list or a clock time, attested in a source lesson, and never a vocabulary word.
 const vocabForms=new Set((content?.vocabulary||[]).map(w=>w.word));
 if(!Array.isArray(t.grammar))out.push(`${label}: needs its function-word tokens (grammar)`);
 (t.grammar||[]).forEach((g,i)=>{
  const at=`${label} function word ${i}`;
  if(!plainObject(g)||!inTransferText(g.path)){out.push(`${at}: needs a lines/N path`);return;}
  const line=t.lines[lineIndex(g.path)];
  if(typeof line!=='string'||!Number.isInteger(g.start)||!Number.isInteger(g.end)||g.start<0||g.end<=g.start||g.end>line.length||line.slice(g.start,g.end)!==g.surface){out.push(`${at}: range does not match its line`);return;}
  if(vocabForms.has(g.surface))out.push(`${at}: ${plainWritten(g.surface)} is a vocabulary word; reference it as a word`);
  else if(!FUNCTION_WORDS.includes(g.surface)&&!CLOCK.test(g.surface))out.push(`${at}: ${plainWritten(g.surface)} is not a function word or a clock time`);
  else if(!src.attested.has(g.surface))out.push(`${at}: ${plainWritten(g.surface)} is not taught in the declared source lessons`);
 });
 // Coverage: every character of every line is notation or inside exactly one token.
 t.lines.forEach((line,i)=>{
  const path=`lines/${i}`,cover=Array(line.length).fill(0);
  for(const tok of [...(t.occurrences||[]),...(t.grammar||[])])if(tok?.path===path&&Number.isInteger(tok.start)&&Number.isInteger(tok.end))for(let k=Math.max(0,tok.start);k<Math.min(line.length,tok.end);k++)cover[k]++;
  if(cover.some(n=>n>1))out.push(`${label} ${path}: tokens overlap`);
  let k=0;
  while(k<line.length){
   if(cover[k]||NOTATION.test(line[k])){k++;continue;}
   let e=k;while(e<line.length&&!cover[e]&&!NOTATION.test(line[e]))e++;
   out.push(`${label} ${path}: uncovered Japanese span “${line.slice(k,e)}” at ${k}`);k=e;
  }
 });
 // Patterns: sentence-level references to catalog patterns that a source lesson teaches or drills.
 const catalog=new Set((content?.patterns||[]).map(p=>p.id));
 if(!Array.isArray(t.patterns))out.push(`${label}: needs its pattern references`);
 for(const p of t.patterns||[]){
  const at=`${label} pattern ${p?.pattern}`;
  if(!Number.isInteger(p?.line)||p.line<0||p.line>=t.lines.length)out.push(`${at}: unknown line ${p?.line}`);
  if(!PATTERN_ID.test(p?.pattern||'')||!catalog.has(p.pattern))out.push(`${at}: unknown pattern`);
  else if(!src.patterns.has(p.pattern))out.push(`${at}: a pattern outside the declared source lessons`);
 }
 // Idea units with evidence spans.
 const units=Array.isArray(t.ideaUnits)?t.ideaUnits:[],unitIds=new Set();
 if(units.length<4)out.push(`${label}: at least four idea units are required`);
 for(const u of units){
  const at=`${label} idea unit ${u?.id}`;
  if(!new RegExp(`^${t.id}-u\\d+$`).test(u?.id||'')||unitIds.has(u?.id))out.push(`${at}: IDs must be ${t.id}-u<n> and unique`);unitIds.add(u?.id);
  if(!text(u?.text))out.push(`${at}: needs a proposition`);else out.push(...quoteProblems(t,u.text,at));
  if(typeof u?.critical!=='boolean')out.push(`${at}: critical must be true or false`);
  if(!Array.isArray(u?.evidence)||!u.evidence.length)out.push(`${at}: needs at least one evidence span`);
  else u.evidence.forEach((s,i)=>out.push(...spanProblems(t,s,`${at} evidence ${i}`)));
 }
 if(units.filter(u=>u?.critical).length<2)out.push(`${label}: mark at least two idea units as critical`);
 // Question sets: recall items (a gist, two or more idea checks, a detail), then at least one evidence-line item.
 const ids=new Set(),occurring=(lines,word)=>(t.occurrences||[]).some(o=>o.word===word&&lines.includes(lineIndex(o.path))),declared=(lines,pattern)=>(t.patterns||[]).some(p=>p.pattern===pattern&&lines.includes(p.line));
 for(const phase of ASKED){
  const set=SET_OF[phase],bank=t.questions?.[set];
  if(!Array.isArray(bank)){out.push(`${label}: needs a ${set} question set`);continue;}
  const firstLine=bank.findIndex(q=>q?.kind==='line');
  if(firstLine>=0&&bank.slice(firstLine).some(q=>q?.kind!=='line'))out.push(`${label} ${set}: evidence-line items come after every recall item`);
  const kinds=bank.map(q=>q?.kind),n=k=>kinds.filter(x=>x===k).length;
  if(n('gist')<1||n('idea')<2||n('detail')<1||n('line')<1)out.push(`${label} ${set}: needs a gist item, two idea checks, a detail item and an evidence-line item`);
  for(const q of bank){
   const at=`${label} ${set} ${q?.id}`;
   if(!new RegExp(`^${t.id}-${set[0]}\\d+$`).test(q?.id||'')||ids.has(q.id))out.push(`${at}: IDs must be ${t.id}-${set[0]}<n> and unique`);ids.add(q?.id);
   if(q?.kind==='line'){
    if(!unitIds.has(q.unit)){out.push(`${at}: must name a known idea unit`);continue;}
    const valid=Array.isArray(q.lines)&&q.lines.length>=2&&q.lines.every(i=>Number.isInteger(i)&&i>=0&&i<t.lines.length)&&new Set(q.lines).size===q.lines.length;
    if(!valid||!validQuestion(lineQuestion(t,q))){out.push(`${at}: needs two or more distinct lines, a valid answer key and feedback for every line`);continue;}
    const ev=questionLines(t,q);
    if(!ev.includes(q.lines[q.correct]))out.push(`${at}: broken evidence span: the right line is not evidence for ${q.unit}`);
    if(q.lines.some((i,j)=>j!==q.correct&&ev.includes(i)))out.push(`${at}: a wrong choice is also evidence for ${q.unit}`);
    if(q.targets!==undefined)out.push(`${at}: evidence-line items are not mapped to words or patterns`);
    for(const s of [q.question,...q.feedback])out.push(...quoteProblems(t,s,at));
    continue;
   }
   if(!RECALL_KINDS.includes(q?.kind)){out.push(`${at}: unknown kind ${q?.kind}`);continue;}
   if(!validQuestion(q))out.push(`${at}: needs distinct choices, a valid answer key and feedback for every choice`);
   if(q.kind==='idea'&&JSON.stringify(q.choices)!==JSON.stringify(TRUTH_CHOICES))out.push(`${at}: idea checks use the true / false / cannot conclude scale`);
   if(!Array.isArray(q.units)||!q.units.length||!q.units.every(id=>unitIds.has(id))){out.push(`${at}: must cite at least one known idea unit`);continue;}
   const lines=questionLines(t,q),tw=q.targets?.words,tp=q.targets?.patterns;
   if(!plainObject(q.targets)||!Array.isArray(tw)||!Array.isArray(tp))out.push(`${at}: needs targets {words, patterns}`);
   else{
    if(q.kind!=='gist'&&!tw.length&&!tp.length)out.push(`${at}: name the words or patterns this item tests`);
    for(const w of tw)if(!occurring(lines,w))out.push(`${at}: unsupported question target ${w}: not a word in its evidence lines`);
    for(const p of tp)if(!declared(lines,p))out.push(`${at}: unsupported question target ${p}: not a pattern on its evidence lines`);
   }
   for(const s of [q.question,...(q.choices||[]),...(q.feedback||[])])out.push(...quoteProblems(t,s,at));
  }
 }
 const im=recallItems(t,'initial'),de=recallItems(t,'delayed');
 const asked=new Set(im.map(q=>plainWritten(q?.question||'').trim()));
 for(const q of de)if(asked.has(plainWritten(q?.question||'').trim()))out.push(`${label}: delayed question ${q.id} repeats an immediate prompt`);
 const sampled=new Set(de.flatMap(q=>q?.units||[]));
 for(const u of units)if(u?.critical&&!sampled.has(u.id))out.push(`${label}: the delayed set never samples critical idea unit ${u.id}`);
 for(const k of ['title','venue','context','focus','translation'])if(text(t[k]))out.push(...quoteProblems(t,t[k],`${label} ${k}`));
 return out;
}
export function transferProblems(content){
 const list=content?.transfer;
 if(list===undefined)return [];
 if(!plainObject(list)||list.version!==1||!Array.isArray(list.texts))return ['transfer must be {version: 1, texts: [...]}'];
 const out=[],ids=new Set();
 for(const t of list.texts){if(ids.has(t?.id))out.push(`Unseen text ${t?.id}: duplicate ID`);ids.add(t?.id);out.push(...transferTextProblems(t,content));}
 const genres=new Set(list.texts.map(t=>t?.genre));
 for(const g of GENRES)if(list.texts.length>=GENRES.length&&!genres.has(g))out.push(`Unseen texts: no ${GENRE_LABELS[g].toLowerCase()} among them`);
 return out;
}
