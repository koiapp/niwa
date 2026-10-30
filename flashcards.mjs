// Personal flashcard decks: deck membership, contextual collection (deferred during questions, hold-and-drag),
// ordered card faces, self-rating, deck-independent word review scheduling and saved-state/backup reading.
// Pure functions only: used by app.js in the browser, tools/validate.mjs and tests/flashcards.test.mjs.
// Cards store vocabulary IDs, never dictionary text, so word records and deck formats stay the single source.
import {DICTIONARY_FIELDS,fieldLabel,entryFields,plainWritten,recordDiscovery,wordSources,resolvePath,sentenceRange,inReadingText} from './vocabulary.mjs';
import {review,seedMemory,validMemory,cleanMemory,eventOf,inRecovery,recoveryKey} from './schedule.mjs';

export const FACE_FIELDS=DICTIONARY_FIELDS.map(f=>f.id);
export const DECK_PRESETS=[
 {id:'kana-definition',label:'Kana → definition',front:['reading'],back:['definition']},
 {id:'kana-written-definition',label:'Kana → written form + definition',front:['reading'],back:['written','definition']}
];
export const DEFAULT_FACES={front:DECK_PRESETS[0].front,back:DECK_PRESETS[0].back};
export const RATINGS=[
 {id:'again',label:'Again',hint:'Did not recall'},
 {id:'hard',label:'Hard',hint:'Recalled with effort'},
 {id:'good',label:'Good',hint:'Recalled readily'}
];
export const NAME_MAX=60,MAX_DECKS=100,MAX_CARDS=1000;
const RATING_IDS=new Set(RATINGS.map(r=>r.id));
const FIELD_SET=new Set(FACE_FIELDS);
const DECK_ID=/^deck-[a-z0-9-]{1,40}$/;
const KANJI=/[㐀-鿿々]/;
const own=(o,k)=>!!o&&typeof o==='object'&&Object.prototype.hasOwnProperty.call(o,k);
const time=v=>Number.isFinite(v)&&v>=0;

export const hasKanji=word=>KANJI.test(plainWritten(word?.word));
export const newDeckId=(now=Date.now(),rand=Math.random)=>`deck-${now.toString(36)}-${Math.floor(rand()*36**4).toString(36).padStart(4,'0')}`;
export function deckName(value){return String(value??'').replace(/\s+/g,' ').trim();}
export const findDeck=(state,id)=>(state?.decks||[]).find(d=>d.id===id)||null;
export const decksWith=(state,wordId)=>(state?.decks||[]).filter(d=>d.cards.some(c=>c.word===wordId));
export const presetFor=deck=>DECK_PRESETS.find(p=>same(p.front,deck?.front)&&same(p.back,deck?.back))||null;
const same=(a,b)=>Array.isArray(a)&&Array.isArray(b)&&a.length===b.length&&a.every((x,i)=>x===b[i]);

// Returns a message for an unusable name, or '' when the name can be used.
export function nameProblem(state,name,exceptId=null){
 const n=deckName(name);
 if(!n)return 'Give the deck a name.';
 if(n.length>NAME_MAX)return `Keep deck names to ${NAME_MAX} characters or fewer.`;
 if((state?.decks||[]).some(d=>d.id!==exceptId&&d.name.toLocaleLowerCase()===n.toLocaleLowerCase()))return `You already have a deck called “${n}”.`;
 return '';
}

// Each face needs at least one field, and a field sits on one face only, so the prompt never shows the answer.
export function facesProblem(front,back){
 for(const [side,list] of [['front',front],['back',back]]){
  if(!Array.isArray(list)||!list.length)return `The ${side} needs at least one field.`;
  if(list.some(f=>!FIELD_SET.has(f))||new Set(list).size!==list.length)return `The ${side} has an unknown or repeated field.`;
 }
 if(front.some(f=>back.includes(f)))return 'A field can appear on the front or the back, not both.';
 return '';
}

export function createDeck(state,name,{now=Date.now(),id=newDeckId(now),faces=DEFAULT_FACES}={}){
 const problem=nameProblem(state,name)||((state?.decks||[]).length>=MAX_DECKS?`You can keep up to ${MAX_DECKS} decks.`:'')||facesProblem(faces.front,faces.back);
 if(problem)return {state,deck:null,error:problem};
 const deck={id,name:deckName(name),front:faces.front.slice(),back:faces.back.slice(),cards:[],created:now};
 return {state:{...state,decks:[...(state?.decks||[]),deck]},deck,error:''};
}

const updateDeck=(state,id,fn)=>({...state,decks:(state.decks||[]).map(d=>d.id===id?fn(d):d)});

export function renameDeck(state,id,name){
 if(!findDeck(state,id))return {state,error:'This deck no longer exists.'};
 const problem=nameProblem(state,name,id);
 if(problem)return {state,error:problem};
 return {state:updateDeck(state,id,d=>({...d,name:deckName(name)})),error:''};
}

// Deleting removes only the deck. The removed record carries its position so undo restores it exactly.
export function deleteDeck(state,id){
 const index=(state?.decks||[]).findIndex(d=>d.id===id);
 if(index<0)return {state,removed:null};
 return {state:{...state,decks:state.decks.filter(d=>d.id!==id)},removed:{deck:state.decks[index],index}};
}
export function restoreDeck(state,removed){
 if(!removed?.deck||findDeck(state,removed.deck.id))return state;
 const decks=(state.decks||[]).slice();
 decks.splice(Math.min(Math.max(removed.index,0),decks.length),0,removed.deck);
 return {...state,decks};
}

// A word appears once per deck. Adding a word the learner has not met yet also records its discovery.
// Collected in context, a card keeps where it came from: `source` (passage:<id>, lesson:<id> or practice:<id>, a unit
// practice set's Words table or conversation) and the `occurrence` index in that text. Adding again changes nothing, so
// the first source is kept. A lesson that became an optional practice has its card sources rewritten to practice:<id>
// (recall.mjs convertLessons).
export const SOURCE_PATTERN=/^(passage|lesson|practice):[a-z0-9-]+$/;
const validSource=s=>typeof s==='string'&&s.length<=80&&SOURCE_PATTERN.test(s);
// With a list of known practice IDs, a practice:<id> source must name one of them; without it, the form is enough.
const knownPractice=(s,practices)=>!practices||!s.startsWith('practice:')||practices.has(s.slice(9));
const validOccurrence=o=>Number.isInteger(o)&&o>=0;
export function addToDeck(state,deckId,wordId,{now=Date.now(),source,occurrence}={}){
 const deck=findDeck(state,deckId);
 if(!deck)return {state,added:false,already:false,discovered:false,error:'This deck no longer exists.'};
 if(deck.cards.some(c=>c.word===wordId))return {state,added:false,already:true,discovered:false,error:''};
 if(deck.cards.length>=MAX_CARDS)return {state,added:false,already:false,discovered:false,error:`A deck can hold up to ${MAX_CARDS} words.`};
 const from=validSource(source)?{source,...(validOccurrence(occurrence)?{occurrence}:{})}:{};
 const found=recordDiscovery(state,wordId,from.source||`deck:${deckId}`,now);
 return {state:updateDeck(found.state,deckId,d=>({...d,cards:[...d.cards,{word:wordId,at:now,...from}]})),added:true,already:false,discovered:found.added,error:''};
}

// Collection queued during an unaided question: nothing changes until the learner sees the feedback.
// One entry per deck and word; queueing again keeps the first entry. `card` names the question that holds it.
export function queueCollection(queue,item){
 if(!item?.deck||!item?.word||(queue||[]).some(q=>q.deck===item.deck&&q.word===item.word))return queue||[];
 return [...(queue||[]),{deck:item.deck,word:item.word,card:item.card??'',...(validSource(item.source)?{source:item.source}:{}),...(validOccurrence(item.occurrence)?{occurrence:item.occurrence}:{})}];
}
export function dequeueCollection(queue,deckId,wordId){return (queue||[]).filter(q=>!(q.deck===deckId&&q.word===wordId));}
export const isQueued=(queue,deckId,wordId)=>(queue||[]).some(q=>q.deck===deckId&&q.word===wordId);
// Applies the queued entries for one question (or all, when card is undefined) through addToDeck.
// A deck deleted in the meantime is reported and skipped; the other entries still apply.
export function commitCollections(state,queue,{card,now=Date.now()}={}){
 const due=(queue||[]).filter(q=>card===undefined||q.card===card),results=[];
 let next=state;
 for(const q of due){const r=addToDeck(next,q.deck,q.word,{now,source:q.source,occurrence:q.occurrence});next=r.state;results.push({...q,added:r.added,already:r.already,discovered:r.discovered,error:r.error});}
 return {state:next,queue:(queue||[]).filter(q=>!due.includes(q)),results};
}

// Hold-and-drag to the deck tray, as a pure state machine so cancellation rules are testable.
// idle → pending (pointer down) → dragging (held still for HOLD_MS) → dropped (released over a deck) | cancelled.
// Moving more than DRAG_SLOP before the hold completes cancels, so the page scrolls as usual. Pointer cancellation,
// lost capture, Escape, navigation or release away from a deck cancel too. Only `dropped` may change membership.
export const HOLD_MS=450,DRAG_SLOP=10;
export const DRAG_IDLE={phase:'idle'};
export function dragStep(drag,event){
 const d=drag||DRAG_IDLE,e=event||{};
 if(e.type==='down')return d.phase==='pending'||d.phase==='dragging'?d:{phase:'pending',pointer:e.pointer,x:e.x,y:e.y,item:e.item};
 if(d.phase!=='pending'&&d.phase!=='dragging')return d;
 if(e.pointer!==undefined&&e.pointer!==d.pointer)return d;
 switch(e.type){
  case 'move':
   if(d.phase==='pending')return Math.hypot(e.x-d.x,e.y-d.y)>DRAG_SLOP?{phase:'cancelled',reason:'scroll',item:d.item}:d;
   return {...d,over:e.over??null,cx:e.x,cy:e.y};
  case 'hold':return d.phase==='pending'?{...d,phase:'dragging',over:null}:d;
  case 'up':
   if(d.phase==='pending')return {phase:'idle'};
   return e.over?{phase:'dropped',deck:e.over,item:d.item}:{phase:'cancelled',reason:'outside',item:d.item};
  case 'cancel':return {phase:'cancelled',reason:e.reason||'cancel',item:d.item};
  default:return d;
 }
}
export function removeFromDeck(state,deckId,wordId){
 const deck=findDeck(state,deckId);
 if(!deck?.cards.some(c=>c.word===wordId))return {state,removed:false};
 return {state:updateDeck(state,deckId,d=>({...d,cards:d.cards.filter(c=>c.word!==wordId)})),removed:true};
}

// Changing the format rewrites only the deck's face lists; membership and ratings are untouched.
export function setDeckFaces(state,deckId,front,back){
 if(!findDeck(state,deckId))return {state,error:'This deck no longer exists.'};
 const problem=facesProblem(front,back);
 if(problem)return {state,error:problem};
 return {state:updateDeck(state,deckId,d=>({...d,front:front.slice(),back:back.slice()})),error:''};
}

// Editing helpers for the face configuration. Each returns {front,back} or {error} and never empties a face.
export function placeField(faces,id,side){
 if(!FIELD_SET.has(id)||!['front','back','off'].includes(side))return {front:faces.front.slice(),back:faces.back.slice()};
 const front=faces.front.filter(f=>f!==id),back=faces.back.filter(f=>f!==id);
 if(side==='front')front.push(id);else if(side==='back')back.push(id);
 if(!front.length)return {error:'The front needs at least one field.'};
 if(!back.length)return {error:'The back needs at least one field.'};
 return {front,back};
}
export function moveFaceField(faces,id,delta){
 const out={front:faces.front.slice(),back:faces.back.slice()};
 for(const side of ['front','back']){
  const list=out[side],i=list.indexOf(id),j=i+delta;
  if(i>=0&&j>=0&&j<list.length)list.splice(j,0,...list.splice(i,1));
 }
 return out;
}
export const fieldSide=(faces,id)=>faces.front.includes(id)?'front':faces.back.includes(id)?'back':'off';

// Resolves one face for a word, in the deck's order. Written form falls back to kana for words without kanji,
// and a face whose fields are all empty for this word falls back to the kana reading so no card face is blank.
export function faceContent(word,fields){
 const parts=[];
 for(const id of fields){
  if(id==='written'&&!hasKanji(word)){parts.push({id,label:`${fieldLabel(id)} · kana only`,value:word.reading,fallback:true});continue;}
  const [field]=entryFields(word,[id]);
  if(field)parts.push(field);
 }
 if(!parts.length)parts.push({id:'reading',label:`${fieldLabel('reading')} · shown because this word has no ${fields.map(fieldLabel).join(', ').toLowerCase()}`,value:word.reading,fallback:true});
 return parts;
}
export function cardFaces(word,deck){return {front:faceContent(word,deck.front),back:faceContent(word,deck.back)};}

export function rateCard(state,deckId,wordId,rating,now=Date.now()){
 if(!RATING_IDS.has(rating)||!findDeck(state,deckId)?.cards.some(c=>c.word===wordId))return state;
 return updateDeck(state,deckId,d=>({...d,cards:d.cards.map(c=>c.word===wordId?{...c,rating,rated:now}:c)}));
}

// Practice order: last rated Again first, then never practised, then Hard, then Good; oldest first within each group.
export function practiceQueue(deck){
 const rank={again:0,undefined:1,hard:2,good:3};
 return (deck?.cards||[]).map((c,i)=>({c,i})).sort((a,b)=>rank[a.c.rating]-rank[b.c.rating]||(a.c.rated??a.c.at)-(b.c.rated??b.c.at)||a.i-b.i).map(x=>x.c.word);
}

// Reads decks from saved state or a backup. strict: throw on anything invalid (backup restore).
// Otherwise drop invalid decks, cards and fields (browser storage). Words must exist in the vocabulary. `practices`: the
// practice IDs in the content, so a card source practice:<id> must name a known practice.
export function readDeckState(value,words,{strict=false,practices=null}={}){
 const ids=new Set((words||[]).map(w=>w.id)),known=practices?new Set(practices):null;
 const fail=msg=>{if(strict)throw Error(msg);};
 const raw=value?.decks,decks=[];
 if(raw===undefined||raw===null)return {decks};
 if(!Array.isArray(raw)||raw.length>MAX_DECKS){fail('This backup contains invalid flashcard decks.');return {decks};}
 for(const d of raw){
  const name=deckName(d?.name);
  if(!d||typeof d!=='object'||Array.isArray(d)||!DECK_ID.test(d.id||'')||decks.some(x=>x.id===d.id)||typeof d.name!=='string'||nameProblem({decks},name)||!time(d.created)||!Array.isArray(d.cards)||d.cards.length>MAX_CARDS){fail('This backup contains an invalid flashcard deck.');continue;}
  let front=d.front,back=d.back;
  if(facesProblem(front,back)){fail(`This backup contains an invalid card format for the deck “${name}”.`);({front,back}=DEFAULT_FACES);}
  const cards=[];
  for(const c of d.cards){
   const valid=c&&typeof c==='object'&&!Array.isArray(c)&&ids.has(c.word)&&time(c.at)&&!cards.some(x=>x.word===c.word)&&(c.rating===undefined||(RATING_IDS.has(c.rating)&&time(c.rated)))&&(c.source===undefined||(validSource(c.source)&&knownPractice(c.source,known)))&&(c.occurrence===undefined||(c.source!==undefined&&validOccurrence(c.occurrence)));
   if(!valid){fail(`This backup contains an invalid card in the deck “${name}”.`);continue;}
   cards.push({word:c.word,at:c.at,...(c.source?{source:c.source}:{}),...(c.occurrence!==undefined?{occurrence:c.occurrence}:{}),...(c.rating?{rating:c.rating,rated:c.rated}:{})});
  }
  decks.push({id:d.id,name,front:front.slice(),back:back.slice(),cards,created:d.created});
 }
 return {decks};
}

// ── Word review scheduling ──────────────────────────────────────────────────────────────────────────────
// Review records live in state.wordReviews, apart from decks and from lesson `reviews`, completion and unlocks.
// A record is keyed by word ID and the canonical (sorted) front and back field sets, so reordering fields keeps
// the key, moving or changing a tested field makes a new one, and the same prompt in several decks is one record.
// Deck membership ratings (card.rating) never earn a stage. Every function takes `now`, so tests inject the clock.
// Intervals come from the shared scheduler (schedule.mjs), kept in each record's `memory`. `stage` counts successes since
// the last Again (at most 5); STAGE_DAYS is the fixed rhythm records saved before scheduler version 1 were set with.
export const MINUTE=60_000,HOUR=60*MINUTE,DAY=24*HOUR;
export const STAGE_DAYS=[1,3,7,14,30];
export const RELEARN_MS=10*MINUTE;
export const SESSION_DEFAULT=5,SESSION_MIN=1,SESSION_MAX=50,MAX_RETRIES=2,MAX_REVIEWS=20000;
export const SUPPORTS=[{id:'hint',label:'Hint'}];
// practice: an in-session repeat after Again, which never changes the schedule.
export const OUTCOMES=['first','advanced','maintained','held','supported','early','reset','stale','practice'];
const SUPPORT_IDS=new Set(SUPPORTS.map(s=>s.id)),OUTCOME_IDS=new Set(OUTCOMES);
const SESSION_ID=/^s-[a-z0-9-]{1,40}$/;
const plainObject=v=>!!v&&typeof v==='object'&&!Array.isArray(v);
const count=v=>Number.isInteger(v)&&v>=0;
const canon=list=>[...new Set(list)].sort();
export const validLimit=n=>Number.isInteger(n)&&n>=SESSION_MIN&&n<=SESSION_MAX;
export const emptyReviewState=()=>({version:1,limit:SESSION_DEFAULT,items:{},session:null});
export const promptKey=(wordId,front,back)=>`${wordId}|${canon(front).join(',')}>${canon(back).join(',')}`;
export const intervalFor=stage=>stage>0?STAGE_DAYS[Math.min(stage,STAGE_DAYS.length)-1]*DAY:RELEARN_MS;
export const newSessionId=(now=Date.now(),rand=Math.random)=>`s-${now.toString(36)}-${Math.floor(rand()*36**4).toString(36).padStart(4,'0')}`;

// Memory for a record saved before scheduler version 1: the interval of its stage (10 minutes at stage 0) seeds it. Again
// reset the stage, so a record below the 7-day stage that has lapses lapsed at least once since it last recovered.
const RELEARN_DAYS=RELEARN_MS/DAY;
export const seedWordMemory=r=>seedMemory({ivl:intervalFor(r.stage)/DAY,lapses:r.lapses||0,recent:(r.lapses||0)>0&&r.stage<3?1:0});
// One rating applied to a record (null when the prompt is unseen), scheduled by schedule.mjs. Again lapses the prompt to
// a 10-minute relearn, even before its due time, unless it is already relearning. Otherwise an attempt before the due
// time, or an in-session repeat (retry), is practice and leaves the schedule alone. When due: unaided Good grows the
// prompt's stability and earns the next stage; Hard, or Good with support, keeps the current interval.
export function nextReview(record,rating,{now,supported=false,retry=false}){
 const prev=record||null,stage=prev?.stage??0;
 const res=review(prev?prev.memory||seedWordMemory(prev):null,{grade:rating,now,due:prev?.due,assisted:supported,retry:!!prev&&retry,relearn:RELEARN_DAYS});
 const grew=res.effect==='advanced'||res.effect==='maintained'||(res.effect==='first'&&rating==='good'&&!supported);
 const next=res.lapsed?0:grew?Math.min(stage+1,STAGE_DAYS.length):stage;
 const outcome=res.reason==='retry'?'practice':res.effect==='unchanged'?'early':res.lapsed||(res.effect==='first'&&rating==='again')?'reset':grew?(res.effect==='maintained'?'maintained':stage===0?'first':'advanced'):supported&&rating==='good'?'supported':'held';
 return {stage:next,due:res.due,outcome,memory:res.memory,lapsed:res.lapsed,event:eventOf(res,{grade:rating,assisted:supported,self:true})};
}
export function applyRating(record,{word,front,back},rating,{now,supported=false,retry=false}){
 const r=nextReview(record,rating,{now,supported,retry}),prev=record||{lapses:0,supported:0,extra:0,count:0};
 return {record:{word,front:canon(front),back:canon(back),stage:r.stage,due:r.due,last:now,rating,count:prev.count+1,lapses:prev.lapses+(r.lapsed?1:0),supported:prev.supported+(supported?1:0),extra:prev.extra+(r.outcome==='early'||r.outcome==='practice'?1:0),memory:r.memory},outcome:r.outcome,event:r.event};
}

// Every prompt the learner's decks define: one per word and canonical format, first deck and card order wins.
// scope is a deck ID or 'all'.
export function reviewPrompts(state,scope='all'){
 const out=[],seen=new Set();
 for(const d of state?.decks||[]){
  if(scope!=='all'&&d.id!==scope)continue;
  for(const c of d.cards){const key=promptKey(c.word,d.front,d.back);if(seen.has(key))continue;seen.add(key);out.push({key,word:c.word,front:canon(d.front),back:canon(d.back),deck:d.id});}
 }
 return out;
}
// Splits prompts into due (record due now or earlier), unseen (no record) and later, each in a deterministic order.
// A prompt in a recovery episode (state.recovery, schedule.mjs) is in none of them: it is listed under `recovering` and
// asked in changed contexts in Today until it recovers, so no deck session shows its card meanwhile.
export function reviewQueue(state,scope,now){
 const items=state?.wordReviews?.items||{},due=[],unseen=[],later=[],recovering=[];
 reviewPrompts(state,scope).forEach((p,i)=>{const r=items[p.key];(inRecovery(state?.recovery,recoveryKey('word',p.key))?recovering:r?(r.due<=now?due:later):unseen).push({...p,order:i,due:r?.due});});
 const byDue=(a,b)=>a.due-b.due||a.order-b.order;
 return {due:due.sort(byDue),unseen,later:later.sort(byDue),recovering,nextDue:later.length?Math.min(...later.map(p=>p.due)):null};
}

// What a prompt's front reveals. A front fallback that shows a back value, or a front that shows every back value,
// gives the answer away, so such attempts earn no interval advancement.
const shownValue=f=>Array.isArray(f.value)?f.value.map(x=>plainWritten(x.form)).join('、'):plainWritten(f.value).trim();
export function answerExposure(word,front,back){
 const f=faceContent(word,front),b=faceContent(word,back),shown=new Set(f.map(shownValue));
 const leaked=b.filter(x=>shown.has(shownValue(x))).map(x=>x.id);
 const fromFallback=f.some(x=>x.fallback&&b.some(y=>shownValue(y)===shownValue(x)));
 return {exposed:fromFallback||leaked.length===b.length,fields:leaked};
}

// A hint is the start of the first answer field: the first character of a Japanese field, or the initials of
// an English one. Using it before the reveal is recorded and the attempt cannot advance the interval.
export function hintFor(word,back){
 const [first]=faceContent(word,back);if(!first)return '';
 const value=shownValue(first),chars=[...value];
 if(JA_HINT.has(first.id))return chars[0]+'・'.repeat(Math.min(chars.length-1,8));
 return value.split(/\s+/).filter(Boolean).slice(0,6).map(w=>`${[...w][0]}…`).join(' ');
}
const JA_HINT=new Set(['reading','written','example','forms']);

// A session snapshots up to `limit` unique prompts: overdue first, then unseen. With early: true and nothing due
// or unseen, it takes the soonest later prompts as extra practice. Each item records the record count it started
// from (base), so a repeated or stale submission applies nothing.
export function buildSession(state,wordsById,{scope='all',now,limit,early=false,id=newSessionId(now)}){
 const store=state?.wordReviews||emptyReviewState(),n=validLimit(limit)?limit:store.limit;
 const q=reviewQueue(state,scope,now),valid=p=>wordsById.has(p.word);
 let picks=[...q.due,...q.unseen].filter(valid).slice(0,n),isEarly=false;
 if(!picks.length&&early){picks=q.later.filter(valid).slice(0,n);isEarly=picks.length>0;}
 if(!picks.length)return null;
 return {id,scope,created:now,limit:n,early:isEarly,items:picks.map(p=>({key:p.key,word:p.word,front:p.front,back:p.back,base:store.items[p.key]?.count??0,exposed:answerExposure(wordsById.get(p.word),p.front,p.back).exposed,revealed:false,support:[]}))};
}
export const startSession=(store,session)=>({...(store||emptyReviewState()),session});
export const endSession=store=>({...store,session:null});
// Prompts that entered recovery (schedule.mjs) while a session holds them leave it unrated, repeats included, so the
// card is not shown again until the word recovers. Rated items stay as they were; a session left empty ends.
export function dropRecovering(store,isRecovering){
 const s=store?.session;if(!s)return store;
 const items=s.items.filter(it=>it.outcome!==undefined||!isRecovering(it.key));
 if(items.length===s.items.length)return store;
 return {...store,session:items.length?{...s,items}:null};
}
export const currentIndex=session=>(session?.items||[]).findIndex(i=>i.outcome===undefined);
const updateItem=(store,index,fn)=>({...store,session:{...store.session,items:store.session.items.map((it,i)=>i===index?fn(it):it)}});
// Reveal and support apply only to the current, unrated item; support only before the reveal.
export function revealItem(store,sessionId,index){
 const s=store?.session;if(!s||s.id!==sessionId||currentIndex(s)!==index||s.items[index].revealed)return store;
 return updateItem(store,index,it=>({...it,revealed:true}));
}
export function useSupport(store,sessionId,index,kind){
 const s=store?.session;if(!s||s.id!==sessionId||currentIndex(s)!==index||!SUPPORT_IDS.has(kind))return store;
 const it=s.items[index];if(it.revealed||it.support.includes(kind))return store;
 return updateItem(store,index,x=>({...x,support:[...x.support,kind]}));
}
export const itemSupported=it=>!!it&&(it.support.length>0||it.exposed);
// Records a rating once. The item must be the current one and revealed; its base must match the record count,
// otherwise another tab or an older session already rated this prompt and the item is closed as stale.
// Again queues the prompt once more in this session (up to MAX_RETRIES); those repeats are practice before the due time.
export function submitRating(store,{session:sessionId,index,rating},now){
 const s=store?.session,none=reason=>({store,applied:false,reason});
 if(!RATING_IDS.has(rating))return none('rating');
 if(!s||s.id!==sessionId)return none('session');
 const it=s.items[index];
 if(!it||it.outcome!==undefined)return none('done');
 if(currentIndex(s)!==index)return none('order');
 if(!it.revealed)return none('hidden');
 const record=store.items[it.key];
 if((record?.count??0)!==it.base)return {store:updateItem(store,index,x=>({...x,rating,outcome:'stale'})),applied:false,reason:'stale',outcome:'stale'};
 const r=applyRating(record,it,rating,{now,supported:itemSupported(it),retry:!!it.retry});
 let next={...store,items:{...store.items,[it.key]:r.record}};
 next=updateItem(next,index,x=>({...x,rating,outcome:r.outcome}));
 const retries=s.items.filter(x=>x.key===it.key&&x.retry).length;
 if(rating==='again'&&retries<MAX_RETRIES)next={...next,session:{...next.session,items:[...next.session.items,{key:it.key,word:it.word,front:it.front,back:it.back,base:r.record.count,exposed:it.exposed,revealed:false,support:[],retry:true}]}};
 return {store:next,applied:true,outcome:r.outcome,record:r.record,event:r.event};
}
// What each rating would do for the current item, for honest guidance on the buttons. It runs the same scheduler as
// submitRating, so the label always matches the due time a rating sets.
export function ratingPreview(store,it,now){
 const record=store?.items?.[it.key];
 return Object.fromEntries(RATINGS.map(r=>[r.id,nextReview(record,r.id,{now,supported:itemSupported(it),retry:!!it.retry})]));
}
export function setSessionLimit(store,n){
 if(!validLimit(n))return {store,error:`Choose between ${SESSION_MIN} and ${SESSION_MAX} prompts.`};
 return {store:{...(store||emptyReviewState()),limit:n},error:''};
}
export function reviewStatus(store,key,now){
 const r=store?.items?.[key];
 if(!r)return {state:'new'};
 return {state:r.due<=now?'due':'scheduled',due:r.due,stage:r.stage,rating:r.rating};
}
export function formatWait(ms){
 if(ms<=0)return 'now';
 const n=(v,unit)=>`in ${v} ${unit}${v===1?'':'s'}`;
 const minutes=Math.max(1,Math.ceil(ms/MINUTE)),hours=Math.round(ms/HOUR);
 if(minutes<60)return n(minutes,'minute');
 if(hours<24)return n(Math.max(1,hours),'hour');
 return n(Math.round(ms/DAY),'day');
}

// Reads word review state from saved state or a backup. strict: throw on anything invalid (backup restore).
// Missing state, limit or counters take their defaults, so older backups restore unchanged. A record without scheduler
// memory is seeded from its stage and lapses (seedWordMemory); malformed memory fails a strict read and is reseeded in a
// lenient one. Due time, stage, counters and identity stay exactly as saved.
function readRecord(key,r,ids,fail){
 if(!plainObject(r)||!ids.has(r.word)||!Array.isArray(r.front)||!Array.isArray(r.back)||facesProblem(r.front,r.back)||promptKey(r.word,r.front,r.back)!==key)return null;
 if(!Number.isInteger(r.stage)||r.stage<0||r.stage>STAGE_DAYS.length||!time(r.due)||!time(r.last)||!RATING_IDS.has(r.rating)||!Number.isInteger(r.count)||r.count<1)return null;
 for(const k of ['lapses','supported','extra'])if(r[k]!==undefined&&!count(r[k]))return null;
 if(r.memory!==undefined&&!validMemory(r.memory))fail('This backup contains invalid word review scheduling data.');
 const rec={word:r.word,front:canon(r.front),back:canon(r.back),stage:r.stage,due:r.due,last:r.last,rating:r.rating,count:r.count,lapses:r.lapses??0,supported:r.supported??0,extra:r.extra??0};
 return {...rec,memory:validMemory(r.memory)?cleanMemory(r.memory):seedWordMemory(rec)};
}
function readSession(s,ids){
 if(!plainObject(s)||!SESSION_ID.test(s.id||'')||!(s.scope==='all'||DECK_ID.test(s.scope||''))||!time(s.created)||!validLimit(s.limit)||typeof s.early!=='boolean'||!Array.isArray(s.items)||!s.items.length||s.items.length>s.limit*(1+MAX_RETRIES))return null;
 const items=[];
 for(const it of s.items){
  if(!plainObject(it)||!ids.has(it.word)||!Array.isArray(it.front)||!Array.isArray(it.back)||facesProblem(it.front,it.back)||promptKey(it.word,it.front,it.back)!==it.key)return null;
  if(!count(it.base)||typeof it.exposed!=='boolean'||typeof it.revealed!=='boolean'||!Array.isArray(it.support)||it.support.some(x=>!SUPPORT_IDS.has(x))||new Set(it.support).size!==it.support.length)return null;
  if((it.rating===undefined)!==(it.outcome===undefined)||(it.rating!==undefined&&(!RATING_IDS.has(it.rating)||!OUTCOME_IDS.has(it.outcome)||!it.revealed))||(it.retry!==undefined&&it.retry!==true))return null;
  items.push({key:it.key,word:it.word,front:canon(it.front),back:canon(it.back),base:it.base,exposed:it.exposed,revealed:it.revealed,support:it.support.slice(),...(it.rating?{rating:it.rating,outcome:it.outcome}:{}),...(it.retry?{retry:true}:{})});
 }
 if(new Set(items.filter(x=>!x.retry).map(x=>x.key)).size!==items.filter(x=>!x.retry).length)return null;
 return {id:s.id,scope:s.scope,created:s.created,limit:s.limit,early:s.early,items};
}
export function readReviewState(value,words,{strict=false}={}){
 const ids=new Set((words||[]).map(w=>w.id)),out=emptyReviewState();
 const fail=msg=>{if(strict)throw Error(msg);};
 const raw=value?.wordReviews;
 if(raw===undefined||raw===null)return {wordReviews:out};
 if(!plainObject(raw)||raw.version!==1){fail('This backup contains invalid word review data.');return {wordReviews:out};}
 if(raw.limit!==undefined){if(validLimit(raw.limit))out.limit=raw.limit;else fail('This backup contains an invalid review session limit.');}
 const items=raw.items??{};
 if(!plainObject(items)||Object.keys(items).length>MAX_REVIEWS)fail('This backup contains invalid word review records.');
 else for(const [key,r] of Object.entries(items)){const rec=readRecord(key,r,ids,fail);if(rec)out.items[key]=rec;else fail('This backup contains an invalid word review record.');}
 if(raw.session!==undefined&&raw.session!==null){const s=readSession(raw.session,ids);if(s)out.session=s;else fail('This backup contains an invalid review session.');}
 return {wordReviews:out};
}

// Where a reviewed word was met, for the answer face: the source recorded on its card (the deck under review first,
// then any deck), then the dictionary's first source, then the first text that references it (wordSources). A source is
// a passage, a lesson or a practice set (practice:<id>, whose conversation gives the line).
// The line is the sentence around a body occurrence: a recorded occurrence in a question or choice gives way to the
// word's first occurrence in that text's body, so the line never quotes an assessment item. Read-only: no state changes.
export function wordContext(state,content,wordId,{deck}={}){
 const open=src=>{const [kind,id]=String(src||'').split(':'),list=kind==='passage'?content?.passages:kind==='lesson'?content?.lessons:kind==='practice'?content?.practices?.items:null,c=Array.isArray(list)?list.find(x=>x?.id===id):null;return c?{kind,id,container:c}:null;};
 const cards=[findDeck(state,deck),...(state?.decks||[])].filter(Boolean).map(d=>d.cards.find(c=>c.word===wordId&&c.source)).filter(Boolean);
 const found=state?.discovered?.[wordId]?.source;
 const candidates=[...cards.map(c=>({source:c.source,occurrence:c.occurrence,recorded:true})),...(found?[{source:found,recorded:true}]:[]),...(wordSources(content).get(wordId)||[]).map(s=>({source:`${s.kind}:${s.id}`,recorded:false}))];
 let fallback=null;
 for(const cand of candidates){
  const t=open(cand.source);if(!t)continue;
  const occ=t.container.occurrences||[],body=i=>occ[i]?.word===wordId&&inReadingText(occ[i].path);
  const index=Number.isInteger(cand.occurrence)&&body(cand.occurrence)?cand.occurrence:occ.findIndex((_,i)=>body(i));
  const out={source:`${t.kind}:${t.id}`,kind:t.kind,id:t.id,title:t.container.title,recorded:cand.recorded,occurrence:index<0?null:index,line:null};
  if(index<0){fallback??=out;continue;}
  const o=occ[index],value=resolvePath(t.container,o.path);
  if(typeof value!=='string'||value.slice(o.start,o.end)!==o.surface){fallback??=out;continue;}
  const [a,b]=sentenceRange(value,o.start,o.end);
  return {...out,line:{before:value.slice(a,o.start),surface:o.surface,after:value.slice(o.end,b)}};
 }
 return fallback;
}

// Every deck word belongs in the dictionary. Restores and older saved state are reconciled on load.
export function syncDeckDiscovery(state,now=Date.now()){
 let next=state;
 for(const d of state?.decks||[])for(const c of d.cards)if(!own(next.discovered,c.word))next=recordDiscovery(next,c.word,`deck:${d.id}`,Math.min(c.at,now)).state;
 return next;
}
