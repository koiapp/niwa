// The learning loop's runtime rules (docs/learning-loop.md, data-contract.md "Runtime rules"): the state of each practice
// set and book, where each item lives, the guard on their routes, a lesson's parts, and what opened between two progress
// snapshots, whole or by lesson part. No DOM, no clock and no imports: the same content and progress snapshot always give the same answer.
//
// content: {practices?, passages?, transfer?, items?, lessons?}
//  practices: lessons.json `practices` ({version, items}): every item is a practice set, read with its id, title, home,
//             requires, revealed? and optional?.
//  passages, transfer: lessons.json `passages` and `transfer` ({version, texts}): the books, each a passage or an unseen
//             text, read with its id, home, requires and optional? (since loop Phase 3 a book opens on its own requires).
//  items: any other loop items, [{id, kind: 'practice'|'book', title?, home?, requires?, revealed?, text?}].
//   requires: reference strings, every one of which must be met (lesson:<id>, lesson:<id>/<part>, practice:<id>,
//             book:<id>). An item without a requires list never opens until it is started.
//   revealed: 'start' to reveal the item from the start, before any prerequisite is started. Any other value is ignored.
//   text: a book's route, 'passage' or 'unseen'.
//  lessons: [{id, node, words?, sections?}], for a lesson's home place and its parts (a part reference reads the unit).
// progress: {completed, answers, started?(lessonId), loop: {practices: {id: {done}}, books: {id: {done}}}, recall,
//  transfer, stoneState?(nodeId)}. answers and loop are keyed by item ID, as state version 3 keeps them.
// Kanji cards is not a loop item: it is the Kanji page (kanji-cards.mjs), which opens on the learner's met kanji words.

// The practice sets' old routes, which now replace themselves with the set's own route (or Practice while it is locked).
export const LEGACY_ROUTES={'core-check':'restaurant-review',plus:'everyday-dishes'};

const KINDS=['lesson','practice','book'];
const list=v=>Array.isArray(v)?v:[];
const filled=x=>!!x&&typeof x==='object'&&Object.keys(x).length>0;
// The practice sets in content, in file order (lessons.json `practices`).
export const practicesOf=content=>list(content?.practices?.items).filter(p=>p&&typeof p==='object');
// The books in content, as {text, item}: the passages, then the unseen texts, each in content order.
export const booksOf=content=>[...list(content?.passages).filter(b=>b&&typeof b==='object').map(item=>({text:'passage',item})),
 ...list(content?.transfer?.texts).filter(b=>b&&typeof b==='object').map(item=>({text:'unseen',item}))];
// A reference as {kind, id} for a whole lesson, practice or book, or {kind: 'lesson', id, part} for a lesson part
// (lesson:<id>/<part>); anything else (a typo) is null, which is never met and never started, so a malformed reference
// keeps an item closed rather than opening it.
export function parseRef(ref){
 const m=/^([a-z]+):([a-z0-9-]+)(?:\/([a-z0-9-]+))?$/.exec(String(ref??''));
 if(!m||!KINDS.includes(m[1])||(m[3]!==undefined&&m[1]!=='lesson'))return null;
 return m[3]===undefined?{kind:m[1],id:m[2]}:{kind:m[1],id:m[2],part:m[3]};
}
// A lesson part is met when every counted key in it is solved (right or fixed) in answers[<lesson>]. The まとめ also
// holds the drill items a wrong reason check sent back to it (return:<item>), which must be solved too. A part that
// does not exist, or has no counted items, is never met. `content.lessons` supplies the lesson's unit.
const SOLVED=['right','fixed'];
function partMet(r,progress,content){
 const lesson=list(content?.lessons).find(l=>l?.id===r.id),part=lesson?lessonParts(lesson).get(r.part):null;
 if(!part||!part.keys.length)return false;
 const rec=progress.answers?.[r.id],solved=k=>SOLVED.includes(rec?.[k]);
 if(!part.keys.every(solved))return false;
 if(r.part!=='matome')return true;
 const own=new Set(part.keys);
 return Object.keys(rec||{}).filter(k=>k.startsWith('why:')&&rec[k]==='wrong'&&!own.has(k.slice(4))).every(k=>solved(`return:${k.slice(4)}`));
}
// Met: a lesson is finished, a lesson part is solved (partMet, which needs `content`), a practice is done, a book is
// completed.
export function refMet(ref,progress={},content=null){
 const r=parseRef(ref);if(!r)return false;
 if(r.kind==='lesson')return r.part===undefined?!!progress.completed?.includes(r.id):partMet(r,progress,content);
 return !!progress.loop?.[r.kind==='practice'?'practices':'books']?.[r.id]?.done;
}
// Started: a lesson has been opened or answered (a lesson part counts as started when its lesson is), a practice has
// any result, a book has a recall attempt or draft (a passage) or a record (an unseen text). Whatever is met is started.
export function refStarted(ref,progress={},content=null){
 const r=parseRef(ref);if(!r)return false;
 if(refMet(ref,progress,content))return true;
 if(r.kind==='lesson')return !!progress.completed?.includes(r.id)||!!progress.started?.(r.id)||filled(progress.answers?.[r.id]);
 if(r.kind==='practice')return filled(progress.answers?.[r.id]);
 const p=progress.recall?.passages?.[r.id];
 return !!(p&&(p.attempts?.length||p.draft))||!!progress.transfer?.texts?.[r.id];
}
// Every loop item as {type, item, text?}: the practice sets first, then the books (passages, then unseen texts), then
// the other items. type is 'practice' or 'book'; text is a book's route, 'passage' or 'unseen'.
const loopItems=content=>[...practicesOf(content).map(item=>({type:'practice',item})),...booksOf(content).map(({text,item})=>({type:'book',item,text})),
 ...list(content?.items).filter(x=>x&&typeof x==='object').map(item=>({type:item.kind,item,text:item.text}))];
const itemOf=(content,id)=>loopItems(content).find(x=>x.item.id===id)||null;

// hidden | revealed | open | started | finished, for a practice set and a book alike (rules 1 and 3). Started and finished
// never fall below open, whatever later happens to the item's prerequisites. An item is open once every reference in its
// `requires` is met, and a locked item is revealed once every one has been started, or from the start when it has
// `revealed: 'start'`; the flag only lifts hidden to revealed, never opens anything. An item without a requires list
// (malformed content) stays hidden until it is started.
export function itemState(id,content,progress={}){
 const found=itemOf(content,id);if(!found)return 'hidden';
 const {type,item}=found,ref=`${type}:${id}`;
 if(refMet(ref,progress))return 'finished';
 if(refStarted(ref,progress))return 'started';
 const needs=Array.isArray(item.requires)?item.requires:null;
 if(needs&&needs.every(x=>refMet(x,progress,content)))return 'open';
 return item.revealed==='start'||needs?.length&&needs.every(x=>refStarted(x,progress,content))?'revealed':'hidden';
}
export const isOpen=state=>state==='open'||state==='started'||state==='finished';

// What opened between two progress snapshots of the same content: every practice and book that was hidden or revealed
// before and is open, started or finished after, as [{id, kind}] (kind 'practice' or 'book'), practices first, each in
// content order. Lessons, stones and checkpoints open through the Learn path (progression.mjs, learn.mjs), which the app
// compares itself; this names the loop items, for a finish screen (data-contract.md "Runtime rules").
export function opened(before,after,content){
 return loopItems(content).filter(({item})=>!isOpen(itemState(item.id,content,before))&&isOpen(itemState(item.id,content,after))).map(({type,item})=>({id:item.id,kind:type}));
}
// What a lesson's parts opened between two snapshots (rule 10): for each part of `lessonId` that went from not met to met,
// the practices and books that opened (opened, above) and name that part (lesson:<id>/<part>) in their requires, as
// [{part, items: [{id, kind}]}] in the parts' order. Parts that opened nothing are left out. The app names them in one
// line at the end of the part, as text with no links.
export function partsOpened(before,after,content,lessonId){
 const lesson=list(content?.lessons).find(l=>l?.id===lessonId);if(!lesson)return [];
 const now=opened(before,after,content),out=[];
 for(const part of lessonParts(lesson).keys()){
  const ref=`lesson:${lessonId}/${part}`;
  if(refMet(ref,before,content)||!refMet(ref,after,content))continue;
  const items=now.filter(({id})=>list(itemOf(content,id)?.item?.requires).includes(ref));
  if(items.length)out.push({part,items});
 }
 return out;
}

// Where an item lives: a practice in Practice, a book in Library → Reading, a lesson on its stone's topic page (Learn
// while that stone is not open). Null for an unknown ID.
export function homePlace(id,content,progress={}){
 const found=itemOf(content,id);
 if(found)return found.type==='practice'?'#practice':'#library/reading';
 const lesson=content?.lessons?.find(l=>l.id===id);
 if(!lesson)return null;
 return progress.stoneState?.(lesson.node)==='open'?`#node/${lesson.node}`:'#field';
}

// The route key to render for `route` (a hash without '#'): the route itself when its practice set or book is open,
// started or finished, else the item's home place. The old core-check and plus keys become the set's route, or Practice
// while the set is locked. Every other route, and an unknown ID (the app's not-found page), passes through unchanged.
const ROUTE_KINDS={practice:'practice',passage:'book',unseen:'book'};
export function loopRoute(route,content,progress={}){
 const [kind,id]=String(route).split('/');
 if(Object.hasOwn(LEGACY_ROUTES,kind)){const set=LEGACY_ROUTES[kind];return isOpen(itemState(set,content,progress))?`practice/${set}`:'practice';}
 const want=Object.hasOwn(ROUTE_KINDS,kind)?ROUTE_KINDS[kind]:null,found=want&&id?itemOf(content,id):null;
 if(!found||found.type!==want||(want==='book'&&found.text!==kind))return route;
 return isOpen(itemState(id,content,progress))?route:homePlace(id,content,progress).slice(1);
}

// ── Lesson parts ─────────────────────────────────────────────────────────────────────────────────────────────
// The parts of a lesson's unit (data-contract.md "References"), in sections order, as a Map name → {from, to, keys}:
// `words` (the practice sets before the first point), each point's ID (the point and the sets up to the next point, the
// dialogue or the まとめ), `conversation` (the dialogue and the sets up to the まとめ) and `matome` (the final set). from
// and to are the part's section range (to excluded; a part with no section has from === to) and keys its counted keys,
// as exercises.mjs unitKeys gives them: the item ID, or <id>.<n> for each match pair, sort card and cloze gap. `words`
// is always listed, even when empty.
const CLOZE_GAP=/（[0-9０-９]+）/g;
function countedKeys(item){
 const n=item?.format==='match'?list(item.pairs).length:item?.format==='sort'?list(item.cards).length
  :item?.format==='cloze'?list(item.lines).reduce((k,l)=>k+(String(l?.ja??'').match(CLOZE_GAP)||[]).length,0):null;
 return n===null?[item?.id]:Array.from({length:n},(_,k)=>`${item.id}.${k}`);
}
export function lessonParts(unit){
 const parts=new Map(),part=(name,at)=>{if(!parts.has(name))parts.set(name,{from:at,to:at,keys:[]});return parts.get(name);};
 let current=part('words',0);
 list(unit?.sections).forEach((s,i)=>{
  if(s?.kind==='point'&&typeof s.id==='string'){current=part(s.id,i);current.to=i+1;return;}
  if(s?.kind==='dialogue'){current=part('conversation',i);current.to=i+1;return;}
  if(s?.kind!=='practice')return;
  const p=s.final===true?part('matome',i):current;
  for(const it of list(s.items))p.keys.push(...countedKeys({...it,format:it?.format||s.format}));
  p.to=i+1;
 });
 return parts;
}

// ── Practice parts ───────────────────────────────────────────────────────────────────────────────────────────
// A practice written in parts (data-contract.md "Practice parts") ships its flat `words` and `sections`, as every
// practice does, and `parts: [{id, title, focus, words: [vocabulary IDs], sections: [section IDs]}]` naming each part's
// share of them, in order. practiceParts resolves that metadata against the flat lists: [{id, title, focus, words (the
// flat list's entries), sections (the section objects), from, to (the part's range in the flat sections, to excluded),
// keys (its counted keys, as exercises.mjs unitKeys gives them)}], or [] for a practice without parts. It never throws:
// a part naming a missing section or word gets what resolves, and partProblems reports the rest.
export const PART_ID=/^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const PARTS_MIN=2,PARTS_MAX=8;
const wordId=w=>typeof w==='string'?w:w&&typeof w==='object'?w.id:undefined;
const textOf=v=>typeof v==='string'&&v.trim().length>0;
export function practiceParts(practice){
 if(!Array.isArray(practice?.parts)||!practice.parts.length)return [];
 const sections=list(practice.sections),words=list(practice.words),at=new Map(),entry=new Map();
 sections.forEach((s,i)=>{if(typeof s?.id==='string'&&!at.has(s.id))at.set(s.id,i);});
 words.forEach(w=>{const id=wordId(w);if(typeof id==='string'&&!entry.has(id))entry.set(id,w);});
 let end=0;
 return practice.parts.map(p=>{
  const idx=list(p?.sections).map(id=>at.get(id)).filter(i=>i!==undefined),keys=[];
  for(const i of idx){const s=sections[i];if(s?.kind==='practice')for(const it of list(s.items))keys.push(...countedKeys({...it,format:it?.format||s.format}));}
  const from=idx.length?Math.min(...idx):end,to=idx.length?Math.max(...idx)+1:end;end=to;
  return {id:p?.id,title:p?.title,focus:p?.focus,words:list(p?.words).filter(id=>entry.has(id)).map(id=>entry.get(id)),sections:idx.map(i=>sections[i]),from,to,keys};
 });
}
// The problems of a shipped practice's `parts` (readable strings, [] when fine or when it has no parts): 2–8 parts,
// each {id (a lowercase slug, unique), title, focus, words, sections}; the parts' section IDs, joined in order, are
// exactly the flat sections' IDs, and their word IDs the flat words'; no word or section in two parts; every part has
// a counted item; no dialogue (field or section); a final set only in the last part.
export function partProblems(practice){
 if(practice?.parts===undefined)return [];
 const label=`Practice ${practice?.id??'draft'}`,out=[];
 if(!Array.isArray(practice.parts))return [`${label}: parts must be a list`];
 const parts=practice.parts,sections=list(practice.sections),words=list(practice.words);
 if(parts.length<PARTS_MIN||parts.length>PARTS_MAX)out.push(`${label}: has ${parts.length} part${parts.length===1?'':'s'}; a practice in parts has ${PARTS_MIN} to ${PARTS_MAX}`);
 if(practice.dialogue!==undefined)out.push(`${label}: a practice in parts has no dialogue`);
 sections.forEach((s,i)=>{if(typeof s?.id!=='string'||!s.id)out.push(`${label}: section ${i+1} has no ID, so no part can name it`);});
 const byId=new Map(sections.filter(s=>typeof s?.id==='string').map(s=>[s.id,s])),flatWords=new Set(words.map(wordId));
 const slugs=new Set(),sectionPart=new Map(),wordPart=new Map(),resolved=practiceParts(practice);
 parts.forEach((p,k)=>{
  const at=`${label} part ${k+1}${typeof p?.id==='string'?` (${p.id})`:''}`;
  if(!p||typeof p!=='object'||Array.isArray(p)){out.push(`${at}: must be {id, title, focus, words, sections}`);return;}
  for(const key of Object.keys(p))if(!['id','title','focus','words','sections'].includes(key))out.push(`${at}: unexpected field ${key}`);
  if(typeof p.id!=='string'||!PART_ID.test(p.id))out.push(`${at}: id must be a lowercase slug such as countries or jobs-and-places`);
  else if(slugs.has(p.id))out.push(`${at}: duplicate part id`);else slugs.add(p.id);
  if(!textOf(p.title))out.push(`${at}: needs a title`);
  if(!textOf(p.focus))out.push(`${at}: needs its focus text`);
  if(!Array.isArray(p.words))out.push(`${at}: words must be a list of vocabulary IDs`);
  else for(const id of p.words){
   if(typeof id!=='string'){out.push(`${at}: words must be vocabulary IDs`);continue;}
   if(!flatWords.has(id))out.push(`${at}: word ${id} is not in the practice's words`);
   if(wordPart.has(id))out.push(`${at}: word ${id} is already in part ${wordPart.get(id)}`);else wordPart.set(id,k+1);
  }
  if(!Array.isArray(p.sections)||!p.sections.length){out.push(`${at}: sections must be a non-empty list of section IDs`);return;}
  for(const id of p.sections){
   const s=byId.get(id);
   if(!s){out.push(`${at}: section ${id} is not in the practice's sections`);continue;}
   if(sectionPart.has(id))out.push(`${at}: section ${id} is already in part ${sectionPart.get(id)}`);else sectionPart.set(id,k+1);
   if(s.kind==='dialogue')out.push(`${at}: section ${id} is a dialogue; a practice in parts has none`);
   if(s.kind==='practice'&&s.final===true&&k!==parts.length-1)out.push(`${at}: section ${id} is final; only the last part can hold the final set`);
  }
  if(!resolved[k]?.keys.length)out.push(`${at}: has no counted item`);
 });
 const join=(get,flat)=>JSON.stringify(parts.flatMap(p=>Array.isArray(get(p))?get(p):[]))===JSON.stringify(flat);
 if(!join(p=>p?.sections,sections.map(s=>s?.id)))out.push(`${label}: the parts' sections, in order, must be exactly the practice's sections`);
 if(!join(p=>p?.words,words.map(wordId)))out.push(`${label}: the parts' words, in order, must be exactly the practice's words`);
 return out;
}
// Where a learner stands in a practice written in parts (data-contract.md "Practice parts", the app): per part {id,
// title, solved, total, open, done}, in order. A part is done when every counted key is solved (right or fixed in
// `record`, state.answers[<practice>], as partMet reads a lesson part). Part 1 is always open; part k opens when part
// k−1 is done, and stays open once any of its own keys has a result (a started item never falls below open, so doing
// part 1 again does not lock a part already under way). A finished practice (`finished`) has every part open. [] for
// a practice without parts.
export function partStates(practice,record,finished=false){
 const rec=record&&typeof record==='object'?record:{};let before=true;
 return practiceParts(practice).map((p,k)=>{
  const total=p.keys.length,solved=p.keys.filter(key=>SOLVED.includes(rec[key])).length,done=total>0&&solved===total;
  const open=finished||k===0||before||p.keys.some(key=>rec[key]!==undefined);before=done;
  return {id:p.id,title:p.title,solved,total,open,done};
 });
}
// The part the learner is on, 1-based: the first part not done, or the last when every part is done. 0 without parts.
export function currentPart(states){const k=list(states).findIndex(s=>!s.done);return k<0?list(states).length:k+1;}
// The guard on a part route, after loopRoute: practice/<id>/<part> stays when the practice has that part and it is
// open, else it becomes practice/<id> (a practice without parts, an unknown part, or one not open yet). Any other
// route, and an unknown practice (the app's not-found page), passes through unchanged.
export function partRoute(route,content,progress={}){
 const [kind,id,part,...rest]=String(route).split('/');
 if(kind!=='practice'||!id||part===undefined)return route;
 const p=practicesOf(content).find(x=>x.id===id);if(!p)return route;
 const s=!rest.length&&partStates(p,progress.answers?.[id],refMet(`practice:${id}`,progress)).find(x=>x.id===part);
 return s&&s.open?route:`practice/${id}`;
}
