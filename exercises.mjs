// Textbook units: a lesson's words, one pattern at a time with a short explanation, and tap-only drills right after
// each (unit files live in tools/units/<lessonId>.mjs). Pure functions shared by app.js, tools/seed-lessons.mjs,
// tools/validate.mjs and the tests; nothing here touches the DOM. Every answer is a tap or a drag: choose, fill a gap,
// build a sentence from tiles, find the ★ tile, match pairs, ○ / ×, sort cards into groups, or complete a conversation
// from a word bank. There is no typing and no audio.
import {insideRuby,plainReading,plainWritten,sourceLines} from './vocabulary.mjs';
import {seededOrder} from './recall.mjs';
import {kanjiWordIndex,resolveText} from './kanji-words.mjs';
import {isRetiredLessonReason} from './lesson-retirements.mjs';

export const FORMATS=['choice','blank','order','star','match','truefalse','sort','cloze'];
// Formats counted once per pair, card or gap. Every other format counts once per item.
export const MULTI=['match','sort','cloze'];
export const GAP='（　）';
// The Japanese line above each drill's English instruction; a practice set may override it with `stem`.
export const STEMS={
 match:'ことばと いみを あわせましょう。',
 choice:'ただしい ものを えらびましょう。',
 blank:'（　）に なにを いれますか。',
 order:'ならべて {文|ぶん}を つくりましょう。',
 star:'★に {入|はい}る ものは どれですか。',
 truefalse:'{会話|かいわ}と おなじなら ○、ちがうなら ×。',
 sort:'グループに わけましょう。',
 cloze:'ことばを えらんで {会話|かいわ}を つくりましょう。'
};
// Lessons check understanding; Practice supplies repetition. No minimum quota to fill.
export const TOTAL_RANGE=[1,50];
export const REVIEW_SIZE=6;
export const REVIEW_MISSES=1;
// Keys inside state.answers[lessonId]. Item results use the item ID (or `<id>.<n>` per pair, card or gap); legacy
// lessons stored the chosen index under q0 and q1, which still read as right or wrong.
export const ROUND_KEY='review-round';
export const REVIEW_PREFIX='review:';
export const LAST_PREFIX='last-review:';
export const STATUSES=['right','wrong','fixed'];
export const minutesFor=count=>Math.max(1,Math.round(3+count/3));

const RUBY=/\{([^|{}]+)\|([^{}]+)\}/g;
const KANJI=/[㐀-鿿々〆]/g;
const CLOZE=/（([0-9０-９]+)）/g;
const ID=/^[A-Za-z0-9][A-Za-z0-9-]{0,59}$/;
const LEGACY=/^q\d+$/;
const text=v=>typeof v==='string'&&v.trim().length>0;
const plainObject=v=>!!v&&typeof v==='object'&&!Array.isArray(v);
const range=n=>[...Array(Math.max(0,n|0)).keys()];
const toNumber=s=>Number(String(s).replace(/[０-９]/g,c=>String.fromCharCode(c.charCodeAt(0)-0xFEE0)));
const same=(a,b)=>a.length===b.length&&a.every((v,i)=>v===b[i]);

// ── Words ─────────────────────────────────────────────────────────────────────────────────────────────────
// A unit lists words as vocabulary IDs or {id, frame, recognize}. frame is the particle frame the word is used in;
// recognize marks a word to understand rather than use.
export function wordEntries(words){
 return (Array.isArray(words)?words:[]).map(w=>typeof w==='string'?{id:w}:plainObject(w)&&typeof w.id==='string'?{id:w.id,...(text(w.frame)?{frame:w.frame}:{}),...(w.recognize===true?{recognize:true}:{})}:null).filter(Boolean);
}
export const wordIds=words=>wordEntries(words).map(w=>w.id);

// ── Sections and items ────────────────────────────────────────────────────────────────────────────────────
export const hasUnit=lesson=>Array.isArray(lesson?.sections)&&lesson.sections.length>0;
export const practiceSets=unit=>(Array.isArray(unit?.sections)?unit.sections:[]).filter(s=>s?.kind==='practice');
export const isFinal=s=>s?.kind==='practice'&&s.final===true;
export const setLetter=i=>i<26?String.fromCharCode(65+i):`${String.fromCharCode(64+Math.floor(i/26))}${String.fromCharCode(65+i%26)}`;
// Practice A, B, C … in order; the final set is the まとめ review.
export function setLabels(unit){let n=0;return new Map(practiceSets(unit).map(s=>[s.id,isFinal(s)?'まとめ':setLetter(n++)]));}
// Every practice item in order, with its effective format, its set, the set's instruction and its grammar pattern.
// A point's patternId says the point teaches that pattern; a drill tests it only when its set or the item itself names
// it (the item's own ID wins), so a drill that practises something else under the same point is never counted.
export function unitItems(unit){
 const labels=setLabels(unit),out=[];
 for(const s of practiceSets(unit))for(const it of Array.isArray(s.items)?s.items:[]){const patternId=text(it?.patternId)?it.patternId:text(s.patternId)?s.patternId:null;out.push({...it,format:it.format||s.format,set:s.id,label:labels.get(s.id),instruction:s.instruction,...(!isFinal(s)&&text(s.stem)?{stem:s.stem}:{}),...(patternId?{patternId}:{})});}
 return out;
}
// Kanji words drills (docs/data-contract.md "Kanji words drill"): a practice set with `kanjiWords` introduces those
// vocabulary words in kanji, by meaning and then reading. drillWords: the words of the set an item belongs to (its `set`
// from unitItems), or none. unitKanjiWords: every word the unit's drills introduce, in order.
export const KANJI_ASKS=['meaning','reading','find'];
export const kanjiDrills=unit=>practiceSets(unit).filter(s=>s.kanjiWords!==undefined);
export function drillWords(unit,setId){const s=kanjiDrills(unit).find(x=>x.id===setId);return Array.isArray(s?.kanjiWords)?s.kanjiWords.filter(text):[];}
export const unitKanjiWords=unit=>[...new Set(kanjiDrills(unit).flatMap(s=>Array.isArray(s.kanjiWords)?s.kanjiWords.filter(text):[]))];
// The points that teach a pattern: [{id, title, pattern, explain}].
export const patternPoints=(unit,patternId)=>(Array.isArray(unit?.sections)?unit.sections:[]).filter(s=>s?.kind==='point'&&s.patternId===patternId);
// A lesson without a unit yet: its own question and its transfer question as one practice set.
export function fallbackItems(lesson,transfer){
 return [lesson,transfer].filter(q=>q&&text(q.question)&&Array.isArray(q.choices)).map((q,i)=>({id:`q${i}`,format:'choice',prompt:q.question,choices:q.choices,correct:q.correct,feedback:q.feedback,set:'fallback',label:'A',instruction:'Choose the best answer.'}));
}
export const lessonItems=(lesson,transfer)=>hasUnit(lesson)?unitItems(lesson):fallbackItems(lesson,transfer);
export const stemFor=item=>item?.stem||STEMS[item?.format]||'';

// Numbered cloze gaps in reading order: {line, n, at, length}.
export function clozeGaps(item){
 const out=[];
 (Array.isArray(item?.lines)?item.lines:[]).forEach((l,line)=>{for(const m of String(l?.ja??'').matchAll(CLOZE))out.push({line,n:toNumber(m[1]),at:m.index,length:m[0].length});});
 return out;
}
// One cloze line as text runs and gaps (gap = its index in reading order across the whole item).
export function clozeParts(item,line){
 const value=String(item?.lines?.[line]?.ja??''),before=clozeGaps(item).filter(g=>g.line<line).length,parts=[];let at=0,k=before;
 for(const m of value.matchAll(CLOZE)){if(m.index>at)parts.push({text:value.slice(at,m.index)});parts.push({gap:k++,n:toNumber(m[1])});at=m.index+m[0].length;}
 if(at<value.length)parts.push({text:value.slice(at)});
 return parts;
}
// Counted units: one per item, or one per match pair, sort card and cloze gap.
export function unitKeys(item){
 if(item?.format==='match')return (item.pairs||[]).map((_,k)=>`${item.id}.${k}`);
 if(item?.format==='sort')return (item.cards||[]).map((_,k)=>`${item.id}.${k}`);
 if(item?.format==='cloze')return clozeGaps(item).map((_,k)=>`${item.id}.${k}`);
 return [item.id];
}
export const countUnits=items=>(items||[]).reduce((n,it)=>n+unitKeys(it).length,0);
export const unitCount=unit=>countUnits(unitItems(unit));
// The gap of a blank item, and the marked part of a choice item's Japanese line.
export function splitGap(ja){const i=String(ja).indexOf(GAP);return i<0?null:[ja.slice(0,i),ja.slice(i+GAP.length)];}
export function splitMark(ja,mark){
 if(!text(ja)||!text(mark))return null;
 const i=ja.indexOf(mark);
 return i<0||ja.indexOf(mark,i+1)>=0?null:[ja.slice(0,i),mark,ja.slice(i+mark.length)];
}

// ── Grading ───────────────────────────────────────────────────────────────────────────────────────────────
const index=(i,n,what)=>{if(!Number.isInteger(i)||i<0||i>=n)throw new RangeError(`Choose one of the listed ${what}.`);};
// choice and blank: the chosen index against the key, with that choice's feedback.
export function gradeChoice(item,choice){index(choice,item?.choices?.length||0,'answers');return {correct:choice===item.correct,feedback:item.feedback?.[choice]||''};}
export function gradeTrueFalse(item,value){if(typeof value!=='boolean')throw new TypeError('Answer true or false.');return {correct:value===item.answer,feedback:item.explain||''};}
// order: tiles 0…n-1 in order, then any extra (distractor) tiles. A sentence is right when it uses every real tile,
// no extra tile, and reads as the authored order or an accepted alternative.
export const orderTiles=item=>[...(item?.tiles||[]),...(item?.extra||[])];
export const tileSentence=(item,order)=>order.map(i=>orderTiles(item)[i]).join('');
export const givenCount=item=>Number.isInteger(item?.given)&&item.given>0?item.given:0;
export const acceptedOrders=item=>[range(item.tiles.length),...(Array.isArray(item.accept)?item.accept:[])];
export const answerSentences=item=>[...new Set(acceptedOrders(item).map(o=>tileSentence(item,o)))];
export function gradeOrder(item,order){
 const all=orderTiles(item).length,n=item.tiles.length;
 if(!Array.isArray(order)||!order.length||new Set(order).size!==order.length||order.some(i=>!Number.isInteger(i)||i<0||i>=all))throw new RangeError('Use each tile at most once.');
 const sentence=tileSentence(item,order),extra=order.some(i=>i>=n);
 return {correct:!extra&&order.length===n&&answerSentences(item).includes(sentence),sentence,answer:tileSentence(item,range(n)),extra,feedback:item.explain||''};
}
// star: the tile that belongs in the ★ slot. Identical tiles would be ambiguous, so the validator rejects them.
export const starSentence=item=>`${item.before||''}${item.tiles.join('')}${item.after||''}`;
export function gradeStar(item,tile){index(tile,item?.tiles?.length||0,'tiles');return {correct:item.tiles[tile]===item.tiles[item.star],feedback:item.explain||'',sentence:starSentence(item)};}
export function gradeMatch(item,left,right){const n=item?.pairs?.length||0;index(left,n,'items');index(right,n,'items');return left===right||item.pairs[left][1]===item.pairs[right][1];}
export function gradeSort(item,card,group){index(card,item?.cards?.length||0,'cards');index(group,item?.groups?.length||0,'groups');return item.cards[card][1]===group;}
export function gradeGap(item,gap,choice){index(gap,item?.answers?.length||0,'gaps');index(choice,item?.bank?.length||0,'words');return item.bank[choice]===item.bank[item.answers[gap]];}

// ── Deterministic shuffles ────────────────────────────────────────────────────────────────────────────────
// Seeded by item ID (plus an optional seed), so a reload shows the same order. Never already in answer order.
function* permutations(n){
 const a=range(n),c=Array(n).fill(0);yield a.slice();let i=0;
 while(i<n){if(c[i]<i){const j=i%2?c[i]:0;[a[j],a[i]]=[a[i],a[j]];yield a.slice();c[i]++;i=0;}else{c[i]=0;i++;}}
}
function pick(n,seed,ok){
 for(let k=0;k<24;k++){const o=seededOrder(n,`${seed}|${k}`);if(ok(o))return o;}
 if(n<=8)for(const o of permutations(n))if(ok(o))return o;
 return seededOrder(n,seed);
}
// Tile bank for an order item: tiles still to place plus any extras. Read left to right, the real tiles never
// spell an accepted answer.
export function tileBank(item,seed=''){
 const n=item.tiles.length,g=givenCount(item),pool=[...range(n).slice(g),...range(item.extra?.length||0).map(i=>n+i)],answers=new Set(answerSentences(item));
 return pick(pool.length,`${item.id}|bank|${seed}`,o=>!answers.has(tileSentence(item,[...range(g),...o.map(i=>pool[i]).filter(i=>i<n)]))).map(i=>pool[i]);
}
// Answer choices in a seeded order, so the key is not always in the same place. Feedback stays with each choice.
export const choiceOrder=(item,seed='')=>seededOrder(item.choices.length,`${item.id}|choices|${seed}`);
export const starOrder=(item,seed='')=>pick(item.tiles.length,`${item.id}|star|${seed}`,o=>!same(o,range(o.length)));
// Right-hand column of a match: no meaning sits beside its own word.
export const pairOrder=(item,seed='')=>pick(item.pairs.length,`${item.id}|pairs|${seed}`,o=>o.every((v,i)=>v!==i));
// Sort cards: never listed group by group.
export const cardOrder=(item,seed='')=>pick(item.cards.length,`${item.id}|cards|${seed}`,o=>!same(o,range(o.length))&&o.some((c,i)=>i>0&&item.cards[c][1]<item.cards[o[i-1]][1]));
// Cloze bank: never listed in gap order.
export const bankOrder=(item,seed='')=>pick(item.bank.length,`${item.id}|bank|${seed}`,o=>!same(o,range(o.length))&&!same(o.slice(0,item.answers.length).map(i=>item.bank[i]),item.answers.map(a=>item.bank[a])));

// ── Results, completion and score ─────────────────────────────────────────────────────────────────────────
// A counted unit is right (first answer correct), wrong (first answer wrong, not yet correct) or fixed (correct after a
// miss). The first result is kept: a later miss never turns right into wrong.
export function statusOf(record,key,item){
 const v=record?.[key];
 if(STATUSES.includes(v))return v;
 if(Number.isInteger(v)&&key===item?.id&&LEGACY.test(key))return v===item.correct?'right':'wrong';
 return null;
}
export const isSolved=s=>s==='right'||s==='fixed';
export function recordStatus(record,key,item,correct){
 const base=plainObject(record)?record:{},prev=statusOf(base,key,item);
 const next=isSolved(prev)?prev:prev===null?(correct?'right':'wrong'):(correct?'fixed':'wrong');
 if(base[key]===next)return {record:base,status:next,changed:false};
 return {record:{...base,[key]:next},status:next,changed:true};
}
// A reason check still waiting for its answer (see Reason checks) keeps the unit from completing.
export function progress(items,record){
 let total=0,solved=0,right=0,missed=0,answered=0,pending=0;
 for(const it of items||[])for(const key of unitKeys(it)){const s=statusOf(record,key,it);total++;if(s)answered++;if(isSolved(s))solved++;if(s==='right')right++;if(s==='wrong'||s==='fixed')missed++;if(reasonState(record,key)==='pending')pending++;}
 return {total,solved,right,missed,answered,pending,complete:total>0&&solved===total&&pending===0};
}
export const lessonComplete=(items,record)=>progress(items,record).complete;
// Clears item results (and their reason checks) so the drills can be done again, as a new reason attempt. Review
// progress and the review round stay.
export function resetItems(record,items){
 const out={...(plainObject(record)?record:{})};
 for(const it of items||[])for(const key of unitKeys(it)){delete out[key];delete out[WHY_PREFIX+key];}
 for(const k of Object.keys(out))if(LEGACY.test(k))delete out[k];
 out[REASON_ATTEMPT]=reasonAttempt(record)+1;
 return out;
}

// ── Closed-book reviews ───────────────────────────────────────────────────────────────────────────────────
// About six practice items (never the worked 例) spread across drills and formats. No item returns until every item
// in the lesson has been in a review: the IDs already shown are kept under review-shown (comma-separated, so backups
// keep plain values), each review draws from the unused pool, and only an exhausted pool starts over. Do not pad
// lessons to supply this pool: repeated retrieval belongs in Practice.
export const SHOWN_KEY='review-shown';
// Items a checkpoint miss routed here (checkpoints.mjs): the next review shows them first, then draws as usual. Plain
// comma-separated IDs, cleared when that review finishes.
export const FOCUS_KEY='review-focus';
export const reviewFocus=record=>typeof record?.[FOCUS_KEY]==='string'?[...new Set(record[FOCUS_KEY].split(',').filter(x=>ID.test(x)))]:[];
export const reviewRound=record=>{const n=record?.[ROUND_KEY];return Number.isInteger(n)&&n>=0?n:0;};
export const reviewShown=record=>typeof record?.[SHOWN_KEY]==='string'?[...new Set(record[SHOWN_KEY].split(',').filter(x=>ID.test(x)))]:[];
// Evenly interleaves drills: each drill's items in a seeded order, keyed by their relative position in that drill.
function spread(items,seed){
 const groups=new Map();
 items.forEach(it=>{const g=it.set||it.format;if(!groups.has(g))groups.set(g,[]);groups.get(g).push(it);});
 const keyed=[],order=[...groups.keys()];
 for(const [g,list] of groups)seededOrder(list.length,`${seed}|${g}`).forEach((j,pos)=>keyed.push({it:list[j],key:(pos+.5)/list.length,f:FORMATS.indexOf(list[j].format),g:order.indexOf(g)}));
 return keyed.sort((a,b)=>a.key-b.key||a.f-b.f||a.g-b.g).map(x=>x.it);
}
export function reviewItems(items,{shown=[],seed='',size=REVIEW_SIZE,focus=[]}={}){
 const want=new Set(focus),first=(items||[]).filter(it=>want.has(it.id)).slice(0,size);
 if(first.length)return [...spread(first,`${seed}|focus`),...reviewItems((items||[]).filter(it=>!first.includes(it)),{shown,seed,size:size-first.length})];
 if(size<=0)return [];
 const all=items||[];
 if(all.length<=size)return spread(all,seed);
 const used=new Set(shown),pool=all.filter(it=>!used.has(it.id));
 if(pool.length>=size)return spread(pool,seed).slice(0,size);
 // The pool runs out: its last items, then a fresh start among the rest.
 return [...spread(pool,seed),...spread(all.filter(it=>used.has(it.id)),`${seed}|again`).slice(0,size-pool.length)];
}
// The IDs shown after this review: added to the list, or, when the selection had to reuse items, a new list holding
// only those reused ones (the start of the next cycle). IDs no longer in the lesson drop out.
export function nextShown(shown,selection,items){
 const known=items?new Set(items.map(it=>it.id)):null,old=new Set(shown),ids=selection.map(it=>it.id),reused=ids.filter(id=>old.has(id));
 return (reused.length?reused:[...shown,...ids]).filter((id,i,a)=>a.indexOf(id)===i&&(!known||known.has(id)));
}
// In-progress answers are booleans under review:<itemId>: true when the whole item was right at the first try.
export const reviewKey=item=>`${REVIEW_PREFIX}${item.id}`;
export function reviewAnswer(record,item){const v=record?.[reviewKey(item)];return typeof v==='boolean'?v:null;}
export function recordReviewAnswer(record,item,correct){
 const base=plainObject(record)?record:{};
 if(reviewAnswer(base,item)!==null)return {record:base,changed:false};
 return {record:{...base,[reviewKey(item)]:!!correct},changed:true};
}
export function reviewOutcome(selection,record,read=reviewAnswer){
 const answers=selection.map(it=>read(record,it)),answered=answers.filter(a=>a!==null).length,correct=answers.filter(a=>a===true).length;
 const done=selection.length>0&&answered===selection.length;
 return {total:selection.length,answered,correct,missed:answered-correct,done,passed:done&&answered-correct<=REVIEW_MISSES};
}
// The scheduler grade of a finished review (schedule.mjs normalizeOutcome): a pass is Good, anything else Again. The pass
// rule above (at most REVIEW_MISSES misses) is the only threshold; the scheduler never re-scores a review.
export const reviewGrade=out=>out?.done?out.passed?'good':'again':null;
// Finishing moves this review's answers to last-review:<id> (replacing the previous review's), records the shown
// items and counts the review. Its reason checks are already folded into the answers, so they go.
export function finishReview(record,selection=[],items=null){
 const base=plainObject(record)?record:{},out={};
 for(const [k,v] of Object.entries(base))if(!k.startsWith(REVIEW_PREFIX)&&!k.startsWith(LAST_PREFIX)&&!k.startsWith(WHY_PREFIX+REVIEW_PREFIX)&&k!==ROUND_KEY&&k!==SHOWN_KEY&&k!==FOCUS_KEY)out[k]=v;
 for(const [k,v] of Object.entries(base))if(k.startsWith(REVIEW_PREFIX))out[`${LAST_PREFIX}${k.slice(REVIEW_PREFIX.length)}`]=v;
 out[ROUND_KEY]=reviewRound(base)+1;
 const shown=nextShown(reviewShown(base),selection,items);
 if(shown.length)out[SHOWN_KEY]=shown.join(',');
 return out;
}
// The items of the last finished review, as shown, with their results.
export function lastReview(items,record){
 const list=(items||[]).filter(it=>lastReviewAnswer(record,it)!==null);
 return {items:list,...reviewOutcome(list,record,lastReviewAnswer)};
}
export function lastReviewAnswer(record,item){const v=record?.[`${LAST_PREFIX}${item.id}`];return typeof v==='boolean'?v:null;}

// ── Retired pretest ───────────────────────────────────────────────────────────────────────────────────────
// Units used to open on three guesses, with a fast-track through the まとめ for three right ones and the guessed items
// repeated at its end. That is retired: a unit now opens on its Focus text, and every item is met after its teaching.
// Saved keys from then are no results; readReasons drops them with the reason checks of their occurrences, so local
// state and backups load without them and a unit finished then stays finished:
//  pretest-v · pretest-items · pretest-phase · pretest-fast · pretest:<id> · pretest-ok:<id> · again:<id> · fast:<id>
// No item ID may take one of these keys.
const RETIRED_KEYS=['pretest-v','pretest-items','pretest-phase','pretest-fast'],RETIRED_PREFIXES=['pretest:','pretest-ok:','again:','fast:'];
export const isRetiredKey=k=>RETIRED_KEYS.includes(k)||RETIRED_PREFIXES.some(p=>String(k).startsWith(p));
const retired=k=>isRetiredKey(k)||(k.startsWith(WHY_PREFIX)&&isRetiredKey(k.slice(WHY_PREFIX.length)));

// ── Reason checks ─────────────────────────────────────────────────────────────────────────────────────────
// After a right first answer on a sampled choice or blank item (about one in REASON_SHARE, seeded per occurrence and
// attempt so a reload asks the same), the learner picks why it is right from three existing lines: the item's own
// correct-choice feedback and the correct-choice feedback of two other items in the same drill. Nothing is authored for
// it. Only pattern-tagged items (grammar and particle choices) take part. A drill or item marked reasons:false takes no part: its pool was audited and another line would also justify an
// answer there. A wrong reason is a soft miss. The answer stays right, but the item returns at the end of the まとめ
// (return:<id>, once, never from an occurrence that is itself a return), and the caller records the miss where a
// first-try miss would go. Plain values in state.answers[lessonId], beside the item results:
//  reason-v 1 · reason-attempt n (raised when the drills are reset, so a new attempt draws new samples)
//  why:<answer key> pending | right | wrong. The answer key is the occurrence's own ID (an item or return:), or
//  review:<id> in a lesson review, dropped when the review finishes.
export const REASON_FORMATS=['choice','blank'];
export const REASON_SHARE=4;
export const REASON_VERSION=1;
export const REASON_KEY='reason-v',REASON_ATTEMPT='reason-attempt',WHY_PREFIX='why:',RETURN_PREFIX='return:';
export const REASON_STATES=['pending','right','wrong'];
const OCCURRENCE=/^(?:review:)?(?:return:)?([A-Za-z0-9][A-Za-z0-9-]{0,59})$/;
// Lines compared as read: without reading markup, a leading “Correct.”, spacing or case.
export const reasonText=s=>String(s??'').replace(RUBY,'$1').replace(/^(correct|right|yes)[.!]?\s*/i,'').replace(/\s+/g,' ').trim().toLowerCase();
export const reasonLine=it=>String(it?.feedback?.[it?.correct]??'');
// Only a grammar choice asks: the item names a pattern, itself or through its set (unitItems resolves it). A vocabulary,
// meaning or comprehension item has none, so it never asks and never lends its line (2026-10-29).
const reasonReady=it=>REASON_FORMATS.includes(it?.format)&&text(it.patternId)&&it.reasons!==false&&Array.isArray(it.choices)&&Number.isInteger(it.correct)&&it.correct>=0&&it.correct<it.choices.length&&Array.isArray(it.feedback)&&it.feedback.length===it.choices.length&&text(reasonText(reasonLine(it)));
// The items of one drill that take part, or none when the drill is marked out.
export function reasonPool(unit,setId){
 const set=practiceSets(unit).find(s=>s.id===setId);if(!set||set.reasons===false)return [];
 return unitItems(unit).filter(it=>it.set===setId&&reasonReady(it));
}
// The authored item behind an occurrence (return:), or the item itself.
const sourceOf=(unit,occ)=>{const id=occ?.source||occ?.id;return unitItems(unit).find(it=>it.id===id)||null;};
// The lines an item's own can be confused with: other items of its drill, one per distinct line, never its own.
export function reasonDistractors(unit,item){
 const src=sourceOf(unit,item),pool=src?reasonPool(unit,src.set):[];
 if(!pool.some(it=>it.id===src.id))return [];
 const seen=new Set([reasonText(reasonLine(src))]),out=[];
 for(const it of pool){const t=reasonText(reasonLine(it));if(it.id===src.id||seen.has(t))continue;seen.add(t);out.push(it);}
 return out;
}
export const reasonEligible=(unit,item)=>reasonDistractors(unit,item).length>=2;
function hash(seed){let h=2166136261;for(const c of String(seed)){h^=c.charCodeAt(0);h=Math.imul(h,16777619)>>>0;}h=Math.imul(h^(h>>>15),2246822507)>>>0;return (h^(h>>>13))>>>0;}
// The seed of one occurrence: the lesson, the mode (learn or review), the attempt or review round, and the
// occurrence ID.
export const reasonSeed=(lessonId,mode,round,occurrenceId)=>`${lessonId}|${mode}|${round}|${occurrenceId}`;
export const reasonSampled=seed=>hash(`${seed}|why`)%REASON_SHARE===0;
// The three lines for one occurrence in a seeded order: {options, answer, source}, or null when its item takes no part.
export function reasonChoices(unit,item,seed){
 const src=sourceOf(unit,item),others=reasonDistractors(unit,item);if(!src||others.length<2)return null;
 const lines=[reasonLine(src),...seededOrder(others.length,`${seed}|why-pool`).slice(0,2).map(i=>reasonLine(others[i]))],order=seededOrder(3,`${seed}|why-order`);
 return {options:order.map(i=>lines[i]),answer:order.indexOf(0),source:src.id};
}
// What a right first answer asks, or null: sampled, then eligible.
export const reasonCheck=(unit,item,seed)=>reasonSampled(seed)?reasonChoices(unit,item,seed):null;
export const reasonAttempt=record=>{const n=record?.[REASON_ATTEMPT];return Number.isInteger(n)&&n>=0?n:0;};
export function reasonState(record,key){const v=record?.[WHY_PREFIX+key];return record?.[REASON_KEY]===REASON_VERSION&&REASON_STATES.includes(v)?v:null;}
// Asked once: the check waits as pending (saved before it is shown), then takes its first answer. Later taps change nothing.
export function pendReason(record,key){
 const base=plainObject(record)?record:{};
 if(reasonState(base,key)!==null)return {record:base,changed:false};
 return {record:{...base,[REASON_KEY]:REASON_VERSION,[WHY_PREFIX+key]:'pending'},changed:true};
}
export function resolveReason(record,key,right){
 const base=plainObject(record)?record:{};
 if(reasonState(base,key)!=='pending')return {record:base,changed:false};
 return {record:{...base,[WHY_PREFIX+key]:right?'right':'wrong'},changed:true};
}
// The まとめ returns: drill items (never the まとめ's own) whose reason was wrong in this attempt, as their own
// occurrences at the end of the まとめ, in unit order.
export function returnItems(unit,record){
 const final=practiceSets(unit).find(isFinal);if(!final)return [];
 const skip=new Set((final.items||[]).map(it=>it?.id));
 return unitItems(unit).filter(it=>it.set!==final.id&&!skip.has(it.id)&&reasonState(record,it.id)==='wrong').map(it=>({...it,id:RETURN_PREFIX+it.id,source:it.id,returned:true,from:it.label,set:final.id,label:'まとめ'}));
}
// Saved reason checks against the unit as it is now. Lenient (local state): drops what cannot be used, returning
// {record, changed}. strict (restore): throws on the first problem. A check is usable when its version is current, its
// value is a state and its occurrence names an item that still takes part. A well-formed check on an existing item that
// no longer takes part is dropped, never refused. Keys of the retired pretest are dropped in
// both modes: they are never a reason to refuse a backup.
export function readReasons(record,unit,{strict=false}={}){
 const raw=plainObject(record)?record:{},base=Object.fromEntries(Object.entries(raw).filter(([k])=>!retired(k))),out={...base},bad=msg=>{if(strict)throw Error(msg);};
 const keys=Object.keys(base).filter(k=>k.startsWith(WHY_PREFIX));
 if(base[REASON_ATTEMPT]!==undefined&&reasonAttempt(base)!==base[REASON_ATTEMPT]){bad('This backup contains an invalid reason-check attempt.');delete out[REASON_ATTEMPT];}
 if(base[REASON_KEY]!==undefined&&base[REASON_KEY]!==REASON_VERSION){bad('This backup contains reason checks from an unknown version.');delete out[REASON_KEY];for(const k of keys)delete out[k];}
 else for(const k of keys){
  const m=OCCURRENCE.exec(k.slice(WHY_PREFIX.length)),it=m&&unitItems(unit).find(x=>x.id===m[1]);
  if(m&&isRetiredLessonReason(unit?.id,m[1])&&base[REASON_KEY]===REASON_VERSION&&REASON_STATES.includes(base[k])){delete out[k];continue;}
  if(base[REASON_KEY]!==REASON_VERSION||!REASON_STATES.includes(base[k])||!it){bad(`This backup contains an invalid reason check (${k}).`);delete out[k];}
  // A well-formed check on an item that exists but no longer asks (untagged, or its drill lost its pool, 2026-10-29) is
  // dropped in both reads: a rule change never refuses a backup.
  else if(!reasonEligible(unit,it))delete out[k];
 }
 const changed=Object.keys(out).length!==Object.keys(raw).length;
 return {record:changed?out:raw,changed};
}

// ── Unit checks ───────────────────────────────────────────────────────────────────────────────────────────
// problems are hard failures for tools/validate.mjs; warnings are the spec's softer targets (counts per point,
// lengths). Both are readable sentences naming the lesson, section and item.
// kanjiWords, intro and sentences make a set a kanji words drill; kanjiWord and ask on a choice item say which of those
// words it asks about and how (kanjiWordProblems below).
const SECTION_KEYS={point:['kind','id','title','pattern','patternId','explain','examples','note'],dialogue:['kind'],practice:['kind','id','format','instruction','stem','example','items','final','patternId','reasons','kanjiWords','intro','sentences']};
const ITEM_KEYS={
 choice:['prompt','ja','mark','card','choices','correct','feedback','reasons','kanjiWord','ask'],
 blank:['ja','en','choices','correct','feedback','reasons'],
 order:['en','tiles','given','extra','accept','explain'],
 star:['before','after','tiles','star','en','explain'],
 match:['pairs','explain'],
 truefalse:['statement','answer','explain'],
 sort:['groups','cards','explain'],
 cloze:['lines','bank','answers','en','explain']
};
const words=s=>String(s).trim().split(/\s+/).filter(Boolean).length;
const sentences=s=>String(s).trim().split(/(?<=[.!?。])\s+/).filter(Boolean).length;
const wellFormed=s=>!/[{}]/.test(String(s).replace(RUBY,''));
// Bare kanji and broken {kanji|reading} markup anywhere in a value.
export function markupProblems(value,at){
 const out=[];
 const walk=(v,path)=>{
  if(typeof v==='string'){const raw=v.replace(RUBY,''),bare=raw.match(KANJI);if(bare)out.push(`${path}: kanji without a reading (${[...new Set(bare)].join('')})`);if(!wellFormed(v))out.push(`${path}: malformed {kanji|reading} markup`);}
  else if(Array.isArray(v))v.forEach((x,i)=>walk(x,`${path}/${i}`));
  else if(plainObject(v))for(const [k,x] of Object.entries(v))walk(x,`${path}/${k}`);
 };
 walk(value,at);return out;
}
// Choices, tiles and bank words get no fixed display: the app shows each {kanji|reading} token in the learner's stage
// (kana, kanji with its reading, or kanji alone), so entries that differ only inside the markup look the same at some stage.
const squash=s=>String(s).replace(/[\s　]+/g,'');
export function lookAlikeProblems(list,at,what){
 const out=[],items=[...new Set(list.filter(text))];
 for(const [form,label] of [[plainWritten,'once their kanji are known'],[plainReading,'in kana']]){
  const seen=new Map(),hit=new Set();
  for(const x of items){const k=squash(form(x));if(seen.has(k))hit.add(k);else seen.set(k,x);}
  for(const k of hit)out.push(`${at}: ${what} look the same ${label} (${k})`);
 }
 return out;
}
function choicesProblems(it,at,p,w){
 const c=it.choices;
 if(!Array.isArray(c)||c.length<2||c.length>4||!c.every(text))p.push(`${at}: needs 2–4 choices`);
 else if(new Set(c.map(x=>x.trim())).size!==c.length)p.push(`${at}: choices must all differ`);
 else p.push(...lookAlikeProblems(c,at,'choices'));
 if(!Number.isInteger(it.correct)||it.correct<0||it.correct>=(Array.isArray(c)?c.length:0))p.push(`${at}: correct must be the index of one choice`);
 if(!Array.isArray(it.feedback)||!Array.isArray(c)||it.feedback.length!==c.length||!it.feedback.every(text))p.push(`${at}: needs one feedback sentence per choice`);
 else{
  if(Number.isInteger(it.correct)&&it.correct<c.length&&!text(String(it.feedback[it.correct]).replace(/^(correct|right|yes)[.!]?\s*/i,'')))p.push(`${at}: the correct choice's feedback must say why it is right`);
  it.feedback.forEach((f,i)=>{if(words(f)>20)w.push(`${at}: feedback ${i+1} is ${words(f)} words; keep it to 20`);});
 }
}
function explainCheck(it,at,p,w,required){
 if(it.explain===undefined){if(required)p.push(`${at}: needs explain`);return;}
 if(!text(it.explain))p.push(`${at}: explain must be text`);
 else if(sentences(it.explain)>2)w.push(`${at}: explain is ${sentences(it.explain)} sentences; keep it to one or two`);
}
// Field rules for one item (or a set's 例 when example is true; an item of a final set may carry its own stem). Returns nothing; pushes into p (problems) and w (warnings).
export function itemChecks(it,format,at,p,w,{example=false,final=false}={}){
 if(!plainObject(it)){p.push(`${at}: not an object`);return;}
 if(!FORMATS.includes(format)){p.push(`${at}: unknown format ${format}`);return;}
 const allowed=new Set(['id','format',...(example?[]:['patternId']),...(final?['stem']:[]),...ITEM_KEYS[format]]);
 for(const k of Object.keys(it))if(!allowed.has(k))w.push(`${at}: unexpected field ${k} for ${format}`);
 if(it.id!==undefined||!example){if(!ID.test(it.id||'')||LEGACY.test(it.id)||it.id===ROUND_KEY||it.id===SHOWN_KEY||it.id===FOCUS_KEY||it.id===REASON_KEY||it.id===REASON_ATTEMPT||isRetiredKey(it.id))p.push(`${at}: needs an ID of letters, digits and hyphens (not q0, q1 …)`);}
 if(final&&it.stem!==undefined&&!text(it.stem))p.push(`${at}: stem must be text`);
 if(it.reasons!==undefined&&(it.reasons!==false||example))p.push(`${at}: reasons can only be false, on a drill item`);
 if(format==='choice'){
  if(!text(it.prompt))p.push(`${at}: needs a prompt`);
  if(it.ja!==undefined&&!text(it.ja))p.push(`${at}: ja must be text`);
  if(it.mark!==undefined){if(!text(it.ja))p.push(`${at}: mark needs a ja line`);else if(!splitMark(it.ja,it.mark))p.push(`${at}: mark must appear exactly once in ja`);else{const i=it.ja.indexOf(it.mark);if(insideRuby(it.ja,i)||insideRuby(it.ja,i+it.mark.length))p.push(`${at}: mark splits {kanji|reading} markup`);}}
  if(it.card!==undefined&&(!Array.isArray(it.card)||it.card.length<2||it.card.length>8||!it.card.every(text)))p.push(`${at}: card needs 2–8 lines`);
  choicesProblems(it,at,p,w);
 }else if(format==='blank'){
  if(!text(it.ja)||it.ja.split(GAP).length!==2)p.push(`${at}: ja needs exactly one ${GAP} gap`);
  if(it.en!==undefined&&!text(it.en))p.push(`${at}: en must be text`);
  choicesProblems(it,at,p,w);
 }else if(format==='order'){
  if(!text(it.en))p.push(`${at}: needs en, the sentence to build`);
  const t=it.tiles;
  if(!Array.isArray(t)||t.length<2||t.length>7||!t.every(text)){p.push(`${at}: needs 2–7 tiles`);return explainCheck(it,at,p,w,true);}
  t.forEach((x,i)=>{if(!wellFormed(x))p.push(`${at}: tile ${i+1} splits {kanji|reading} markup`);});
  const g=it.given;
  if(g!==undefined&&(!Number.isInteger(g)||g<0||t.length-g<2))p.push(`${at}: given must leave at least two tiles to place`);
  if(it.extra!==undefined){if(!Array.isArray(it.extra)||it.extra.length<1||it.extra.length>2||!it.extra.every(text))p.push(`${at}: extra needs 1–2 tiles`);else if(it.extra.some(x=>t.includes(x)))p.push(`${at}: an extra tile repeats a real tile`);}
  p.push(...lookAlikeProblems([...t,...(Array.isArray(it.extra)?it.extra:[])],at,'tiles'));
  if(it.accept!==undefined){
   const ok=Array.isArray(it.accept)&&it.accept.every(o=>Array.isArray(o)&&o.length===t.length&&same([...o].sort((a,b)=>a-b),range(t.length)));
   if(!ok)p.push(`${at}: accept must list orders that use every tile index once`);
   else{const gc=givenCount(it);if(it.accept.some(o=>same(o,range(t.length))))p.push(`${at}: accept repeats the authored order`);if(gc&&it.accept.some(o=>!same(o.slice(0,gc),range(gc))))p.push(`${at}: an accepted order moves a given tile`);}
  }
  if(Array.isArray(t)&&t.length<=7){
   const answers=new Set(answerSentences({...it,accept:Array.isArray(it.accept)?it.accept.filter(o=>Array.isArray(o)&&o.length===t.length):[]}));
   const g0=givenCount(it),rest=range(t.length).slice(g0);let wrong=false;
   for(const o of permutations(rest.length)){if(!answers.has(tileSentence(it,[...range(g0),...o.map(i=>rest[i])]))){wrong=true;break;}}
   if(!wrong)p.push(`${at}: every arrangement of the tiles is accepted, so there is nothing to build`);
  }
  explainCheck(it,at,p,w,true);
 }else if(format==='star'){
  const t=it.tiles;
  if(!Array.isArray(t)||t.length!==4||!t.every(text))p.push(`${at}: star needs exactly 4 tiles`);
  else{if(new Set(t).size!==4)p.push(`${at}: star tiles must all differ`);else p.push(...lookAlikeProblems(t,at,'tiles'));t.forEach((x,i)=>{if(!wellFormed(x))p.push(`${at}: tile ${i+1} splits {kanji|reading} markup`);});}
  if(!Number.isInteger(it.star)||it.star<0||it.star>3)p.push(`${at}: star must be the slot 0–3 that holds ★`);
  for(const k of ['before','after'])if(it[k]!==undefined&&typeof it[k]!=='string')p.push(`${at}: ${k} must be text`);
  if(it.en!==undefined&&!text(it.en))p.push(`${at}: en must be text`);
  explainCheck(it,at,p,w,true);
 }else if(format==='match'){
  const pr=it.pairs;
  if(!Array.isArray(pr)||pr.length<3||pr.length>8||!pr.every(x=>Array.isArray(x)&&x.length===2&&x.every(text)))p.push(`${at}: needs 3–8 [left, right] pairs`);
  else{if(new Set(pr.map(x=>x[0])).size!==pr.length)p.push(`${at}: left items must all differ`);if(new Set(pr.map(x=>x[1])).size!==pr.length)p.push(`${at}: right items must all differ`);}
  explainCheck(it,at,p,w,false);
 }else if(format==='truefalse'){
  if(!text(it.statement))p.push(`${at}: needs a statement`);
  if(typeof it.answer!=='boolean')p.push(`${at}: answer must be true or false`);
  explainCheck(it,at,p,w,true);
 }else if(format==='sort'){
  const g=it.groups,c=it.cards;
  if(!Array.isArray(g)||g.length<2||g.length>3||!g.every(text)||new Set(g).size!==g.length)p.push(`${at}: needs 2–3 distinct groups`);
  if(!Array.isArray(c)||c.length<4||c.length>10||!c.every(x=>Array.isArray(x)&&x.length===2&&text(x[0])&&Number.isInteger(x[1])&&x[1]>=0&&x[1]<(Array.isArray(g)?g.length:0)))p.push(`${at}: needs 4–10 [text, group index] cards`);
  else{if(new Set(c.map(x=>x[0])).size!==c.length)p.push(`${at}: card texts must all differ`);if(Array.isArray(g)&&g.some((_,i)=>!c.some(x=>x[1]===i)))w.push(`${at}: every group should get at least one card`);}
  explainCheck(it,at,p,w,false);
 }else if(format==='cloze'){
  const l=it.lines;
  if(!Array.isArray(l)||!l.length||!l.every(x=>plainObject(x)&&text(x.ja)&&(x.speaker===undefined||text(x.speaker))))p.push(`${at}: needs lines of {speaker?, ja}`);
  const gaps=clozeGaps(it);
  if(!gaps.length)p.push(`${at}: needs numbered gaps （1）, （2） …`);
  else if(!same(gaps.map(x=>x.n),range(gaps.length).map(i=>i+1)))p.push(`${at}: gaps must be numbered （1）, （2） … in reading order`);
  const b=it.bank;
  if(!Array.isArray(b)||b.length<2||!b.every(text)||new Set(b).size!==b.length)p.push(`${at}: needs a bank of distinct words`);
  else p.push(...lookAlikeProblems(b,at,'bank words'));
  if(!Array.isArray(it.answers)||it.answers.length!==gaps.length)p.push(`${at}: answers must give one bank index per gap (${gaps.length})`);
  else if(it.answers.some(a=>!Number.isInteger(a)||a<0||a>=(Array.isArray(b)?b.length:0)))p.push(`${at}: answers must be bank indexes`);
  else if(Array.isArray(b)){const extras=b.length-new Set(it.answers).size;if(extras<1||extras>2)w.push(`${at}: the bank should hold 1–2 words that fit no gap (it has ${extras})`);}
  if(it.en!==undefined&&!text(it.en))p.push(`${at}: en must be text`);
  explainCheck(it,at,p,w,true);
 }
}
const toIds=v=>v instanceof Map?new Set(v.keys()):v instanceof Set?v:Array.isArray(v)?new Set(v.map(x=>typeof x==='string'?x:x?.id)):null;
// Pattern IDs on points, sets and items: lowercase slugs, and, when the catalog is given, catalog entries.
const PATTERN_ID=/^[a-z0-9]+(-[a-z0-9]+)*$/;
function patternProblems(sections,label,known){
 const out=[],at=(v,where)=>{if(v===undefined)return;if(typeof v!=='string'||!PATTERN_ID.test(v))out.push(`${where}: patternId must be a lowercase ID such as request-wo`);else if(known&&!known.has(v))out.push(`${where}: unknown pattern ID ${v}; add it to the pattern catalog first`);};
 (Array.isArray(sections)?sections:[]).forEach((s,i)=>{
  const where=`${label} section ${i+1}${s?.id?` (${s.id})`:''}`;
  if(!plainObject(s))return;
  at(s.patternId,where);
  if(s.kind==='practice'){(Array.isArray(s.items)?s.items:[]).forEach((it,j)=>at(it?.patternId,`${where} item ${it?.id||j+1}`));if(s.example?.patternId!==undefined)out.push(`${where} example: a solved 例 is not tested, so it takes no patternId`);}
 });
 return out;
}
// Kanji words drills and the items that ask about their words (docs/data-contract.md "Kanji words drill"). index: the
// kanjiWordIndex of the vocabulary; without it the rules that need the words' markup (that an ID is a kanji word, that an
// intro line and a marked part hold the word, a find item's answer, a trial sentence's answer) are skipped and the shape
// rules still apply.
// Trial sentences (docs/data-contract.md "Kanji cards"): a drill's `sentences` give each of its words one authored
// sentence for the Kanji page's trial, {word, ja, answer, en, slot}, in the order of kanjiWords. ja holds one BLANK, answer
// is the word's markup that fills it, en the whole sentence in English, slot what the blank accepts (TRIAL_SLOTS).
// trialSentences: 'required' (the default, and what the validator uses for every lesson and practice) makes a drill
// without them a problem; 'optional' makes it a warning, for a draft whose sentences are still being written. familiar:
// bare lines the sentence must not repeat (the validator passes the kanjiChecks sentences, through sourceLines).
const KANA=/^[ぁ-ゖゝ-ゟァ-ヺー-ヿ]+$/;
export const BLANK='＿';
export const TRIAL_SLOTS=['drink','food','thing','place','time','number','person','language','activity','state','expression'];
const SENTENCE_KEYS=['word','ja','answer','en','slot'];
const owns=(t,id)=>!!t.token&&(t.word===id||(t.candidates||[]).includes(id));
// The tokens of a marked part, resolved in the context of its whole line (the longest match there wins).
function markTokens(ja,mark,index,at=ja.indexOf(mark)){
 const end=at+mark.length,out=[];let pos=0;
 for(const t of resolveText(ja,index)){const a=pos;pos+=t.text.length;if(t.token&&a>=at&&pos<=end)out.push(t);}
 return out;
}
// A unit's strings apart from its trial sentences, each whole and bare (sourceLines with its sentence ends taken out):
// what a trial sentence must not copy. sentenceRepeat: the line a filled sentence equals or sits inside, or null.
const flat=s=>String(s).replace(/[。！？!?\n]/g,'');
const bareLine=s=>sourceLines({lessons:[flat(s)]})[0]||'';
function unitLines(sections){
 const out=[],walk=x=>{if(typeof x==='string')out.push(flat(x));else if(Array.isArray(x))x.forEach(walk);else if(plainObject(x))for(const [k,y] of Object.entries(x))if(k!=='sentences')walk(y);};
 walk(sections);return sourceLines({lessons:out});
}
const sentenceRepeat=(filled,lines)=>{const n=bareLine(filled);return n?(lines||[]).find(s=>s===n||s.includes(n))||null:null;};
function sentenceProblems(s,at,list,p,w,{index,lines,familiar}){
 const x=s.sentences;
 if(!Array.isArray(x)||x.length!==list.length||!x.every((y,k)=>plainObject(y)&&y.word===list[k])){p.push(`${at}: sentences needs one {word, ja, answer, en, slot} trial sentence per kanji word, in the order of kanjiWords`);return;}
 x.forEach((y,k)=>{
  const sat=`${at} sentence ${k+1} (${y.word})`;
  for(const key of Object.keys(y))if(!SENTENCE_KEYS.includes(key))w.push(`${sat}: unexpected field ${key}`);
  const ja=text(y.ja)&&y.ja.split(BLANK).length===2,answer=text(y.answer);
  if(!ja)p.push(`${sat}: ja needs exactly one ${BLANK} blank`);
  if(!answer)p.push(`${sat}: needs answer, the markup that fills the blank`);
  if(!text(y.en))p.push(`${sat}: needs en, the whole sentence in English`);
  if(!TRIAL_SLOTS.includes(y.slot))p.push(`${sat}: slot must be one of ${TRIAL_SLOTS.join(', ')}`);
  if(!ja||!answer)return;
  const filled=y.ja.replace(BLANK,y.answer),gap=y.ja.indexOf(BLANK);
  if(index){
   const own=resolveText(y.answer,index).filter(t=>t.token);
   if(!own.length||!own.every(t=>owns(t,y.word)))p.push(`${sat}: answer must be ${y.word} in kanji`);
   else{const ts=markTokens(filled,y.answer,index,gap);if(!ts.length||!ts.every(t=>owns(t,y.word)))p.push(`${sat}: the filled sentence must still read ${y.word} at the blank`);}
   const rest=resolveText(y.ja,index);
   if(rest.some(t=>owns(t,y.word)))p.push(`${sat}: ja holds ${y.word} outside the blank, which gives the answer away`);
   const others=list.filter(id=>id!==y.word&&rest.some(t=>owns(t,id)));
   if(others.length)w.push(`${sat}: ja holds ${others.join(', ')}, another kanji word of this drill`);
  }
  // A copy of a line of the unit (the whole sentence equals or sits inside one), or any overlap with a kanjiChecks
  // sentence, which must stay unseen: the trial shows the filled sentence once it is answered (contained either way).
  const line=sentenceRepeat(filled,lines);if(line)p.push(`${sat}: copies a line of the unit (${line})`);
  const n=bareLine(filled),check=(familiar||[]).find(c=>c===n||c.includes(n)||n.includes(c));
  if(check)p.push(`${sat}: repeats a kanjiChecks sentence (${check})`);
 });
}
export function kanjiWordProblems(unit,{label='Unit draft',index=null,trialSentences='required',familiar=null,kanjiWordsMax=3}={}){
 const p=[],w=[],sections=Array.isArray(unit?.sections)?unit.sections:[],table=new Set(wordIds(unit?.words)),all=new Set(unitKanjiWords(unit));
 const firstPoint=sections.findIndex(s=>s?.kind==='point'),drills=kanjiDrills(unit);
 if(drills.length>1)p.push(`${label}: only one kanji words drill per unit (${drills.map(s=>s.id).join(', ')})`);
 sections.forEach((s,i)=>{
  if(!plainObject(s)||s.kind!=='practice')return;
  const at=`${label} section ${i+1}${s.id?` (${s.id})`:''}`,final=s.final===true,items=Array.isArray(s.items)?s.items:[];
  if(s.kanjiWords===undefined){for(const k of ['intro','sentences'])if(s[k]!==undefined)p.push(`${at}: ${k} belongs to a kanji words drill, which names its kanjiWords`);}
  else{
   const ids=s.kanjiWords,list=Array.isArray(ids)?ids:[],intro=s.intro;
   if(!Array.isArray(ids)||ids.length<1||ids.length>kanjiWordsMax||!ids.every(text)||new Set(ids).size!==ids.length)p.push(`${at}: kanjiWords needs 1–${kanjiWordsMax} different vocabulary IDs`);
   else for(const id of ids){if(!table.has(id))p.push(`${at}: kanjiWords ${id} is not in the unit's word table`);else if(index&&!index.words.has(id))p.push(`${at}: kanjiWords ${id} is not a kanji word (its vocabulary word has no {kanji|reading} markup)`);}
   if(final||s.format!=='choice')p.push(`${at}: a kanji words drill is a choice set before the まとめ`);
   // Kanji can follow the first useful pattern and its initial practice. Reading is still taught
   // by the Words table and the drill's intro before its checks; ordering is audited separately.
   if(!Array.isArray(intro)||intro.length!==list.length||!intro.every((x,k)=>plainObject(x)&&x.word===list[k]&&text(x.ja)&&text(x.en)))p.push(`${at}: intro needs one {word, ja, en} line per kanji word, in the order of kanjiWords`);
   else intro.forEach((x,k)=>{
    for(const key of Object.keys(x))if(!['word','ja','en'].includes(key))w.push(`${at} intro ${k+1}: unexpected field ${key}`);
    if(index&&!resolveText(x.ja,index).some(t=>owns(t,x.word)))p.push(`${at} intro ${k+1}: the line must hold ${x.word} in kanji`);
   });
   if(s.sentences!==undefined)sentenceProblems(s,at,list,p,w,{index,lines:unitLines(sections),familiar});
   else if(trialSentences==='required')p.push(`${at}: sentences needs one {word, ja, answer, en, slot} trial sentence per kanji word, in the order of kanjiWords`);
   else w.push(`${at}: no trial sentences yet; the Kanji page's trial uses each word's intro line`);
   for(const [it,iat] of [...(s.example!==undefined?[[s.example,`${at} example`]]:[]),...items.map((it,j)=>[it,`${at} item ${it?.id||j+1}`])])if(!plainObject(it)||!text(it.kanjiWord)||!['meaning','reading'].includes(it.ask))p.push(`${iat}: every item in a kanji words drill names its kanjiWord and asks its meaning or reading`);
   for(const id of list)for(const ask of ['meaning','reading'])if(!items.some(it=>it?.kanjiWord===id&&it.ask===ask))p.push(`${at}: ${id} needs an ask:'${ask}' item`);
  }
  // Every item (or 例) that asks about a kanji word, in the drill or the まとめ.
  for(const [it,iat] of [[s.example,`${at} example`],...items.map((it,j)=>[it,`${at} item ${it?.id||j+1}`])]){
   if(!plainObject(it)||(it.kanjiWord===undefined&&it.ask===undefined))continue;
   if((it.format||s.format)!=='choice'||!text(it.kanjiWord)||!KANJI_ASKS.includes(it.ask)){p.push(`${iat}: kanjiWord and ask (${KANJI_ASKS.join(', ')}) go together, on a choice item`);continue;}
   if(!all.has(it.kanjiWord))p.push(`${iat}: kanjiWord ${it.kanjiWord} is not one of the unit's kanjiWords`);
   if(s.kanjiWords===undefined&&!final)p.push(`${iat}: an item about a kanji word belongs in the kanji words drill or the まとめ`);
   if(it.ask==='find'){
    if(!final)p.push(`${iat}: a find item belongs in the まとめ`);
    if(it.card===undefined)p.push(`${iat}: a find item needs a card`);
    // The right choice is the word's markup, as in the vocabulary (its word or a form), and may run on in kana or
    // katakana ({辛|から}いラーメン): every token in it is the word's.
    const right=Array.isArray(it.choices)&&Number.isInteger(it.correct)?it.choices[it.correct]:undefined,entry=index?.words.get(it.kanjiWord);
    if(entry&&!(typeof right==='string'&&entry.patterns.some(x=>right.includes(x))&&resolveText(right,index).filter(t=>t.token).every(t=>owns(t,it.kanjiWord))))p.push(`${iat}: the right choice must be ${it.kanjiWord} written as in the vocabulary (${entry.patterns.join(' or ')})`);
    continue;
   }
   if(!text(it.ja)||!text(it.mark)||!splitMark(it.ja,it.mark)){p.push(`${iat}: a ${it.ask} item marks the word once in its ja line`);continue;}
   if(index){const ts=markTokens(it.ja,it.mark,index);if(!ts.length||!ts.every(t=>owns(t,it.kanjiWord)))p.push(`${iat}: the marked part must be ${it.kanjiWord} in kanji`);}
   if(it.ask==='reading'&&Array.isArray(it.choices)){
    if(!it.choices.every(c=>typeof c==='string'&&KANA.test(c)))p.push(`${iat}: reading choices must be kana only`);
    if(Number.isInteger(it.correct)&&it.choices[it.correct]!==plainReading(it.mark))p.push(`${iat}: the right reading must be the plain reading of the marked part (${plainReading(it.mark)})`);
   }
  }
 });
 return {problems:p,warnings:w};
}
// The kanji word index checkUnit uses: the one given, else one built from vocabulary records (not from bare IDs).
function indexFor(kanjiWords,vocabulary){
 if(kanjiWords)return kanjiWords;
 const list=vocabulary instanceof Map?[...vocabulary.values()]:Array.isArray(vocabulary)?vocabulary:[];
 return list.some(v=>plainObject(v)&&typeof v.word==='string')?kanjiWordIndex(list):null;
}
// Checks one unit. vocabulary: IDs (Set, Map or array of records) the words must exist in; dialogue: whether the
// lesson has conversation lines; patterns: the pattern catalog's IDs. practice: the unit is a Practice set (lessons.json
// `practices`; lessonId is then its practice ID), which drops the lesson-only maximum of 50 counted items and the
// 6–12 Words-table target. Both lessons and practices need at least one counted item; neither needs solved examples.
// kanjiWords: the kanjiWordIndex (kanji-words.mjs) of the vocabulary, for kanji words drills; when it is not given it is
// built from vocabulary records, and with bare IDs the rules that need the words' markup are skipped. Lessons and
// practices take the same drill. trialSentences ('required' or 'optional') and familiar: the drill's trial sentences,
// as kanjiWordProblems takes them. kanjiWordsMax: the most kanji words one drill may name (default 3); the validator
// passes the content rules' kanjiWordsPerLesson.max. Returns {problems, warnings, count}.
export function checkUnit(unit,{lessonId='',vocabulary=null,dialogue=true,patterns=null,kanjiWords=null,practice:isPractice=false,trialSentences='required',familiar=null,kanjiWordsMax=3}={}){
 const label=`${isPractice?'Practice':'Unit'} ${lessonId||'draft'}`,p=[],w=[];
 if(!plainObject(unit))return {problems:[`${label}: must be an object with words and sections`],warnings:[],count:0};
 for(const k of Object.keys(unit))if(!['focus','words','sections'].includes(k))w.push(`${label}: unexpected field ${k}`);
 // Focus: what the unit covers and what to practise, read before the words. One or two sentences; tools/validate.mjs
 // requires it on every shipped unit.
 if(unit.focus!==undefined){if(!text(unit.focus))p.push(`${label}: focus must be text`);else{p.push(...markupProblems(unit.focus,`${label} focus`));if(sentences(unit.focus)>2||words(unit.focus)>45)w.push(`${label}: focus is ${words(unit.focus)} words in ${sentences(unit.focus)} sentences; keep it to one or two sentences`);}}
 const known=toIds(vocabulary);
 if(!Array.isArray(unit.words))p.push(`${label}: words must be an array`);
 else{
  const seen=new Set();
  unit.words.forEach((x,i)=>{
   const id=typeof x==='string'?x:plainObject(x)?x.id:undefined,at=`${label} word ${i+1}`;
   if(typeof id!=='string'||!id){p.push(`${at}: needs a vocabulary ID`);return;}
   if(plainObject(x)){for(const k of Object.keys(x))if(!['id','frame','recognize'].includes(k))w.push(`${at}: unexpected field ${k}`);if(x.frame!==undefined&&!text(x.frame))p.push(`${at}: frame must be text`);if(x.recognize!==undefined&&x.recognize!==true)p.push(`${at}: recognize must be true when present`);}
   if(seen.has(id))p.push(`${at}: ${id} is listed twice`);seen.add(id);
   if(known&&!known.has(id))p.push(`${at}: unknown vocabulary ID ${id}`);
  });
  if(!isPractice&&(unit.words.length<6||unit.words.length>12))w.push(`${label}: lists ${unit.words.length} words; aim for 6–12`);
 }
 const sections=Array.isArray(unit.sections)?unit.sections:null;
 if(!sections||!sections.length){p.push(`${label}: sections must be a non-empty array`);return {problems:p,warnings:w,count:0};}
 const sectionIds=new Set(),itemIds=new Set(),practice=sections.filter(s=>s?.kind==='practice');let points=0,dialogues=0;
 sections.forEach((s,i)=>{
  const at=`${label} section ${i+1}${s?.id?` (${s.id})`:''}`;
  if(!plainObject(s)||!SECTION_KEYS[s.kind]){p.push(`${at}: kind must be point, practice or dialogue`);return;}
  for(const k of Object.keys(s))if(!SECTION_KEYS[s.kind].includes(k))w.push(`${at}: unexpected field ${k}`);
  if(s.kind==='dialogue'){dialogues++;return;}
  if(!ID.test(s.id||''))p.push(`${at}: needs an ID of letters, digits and hyphens`);
  else if(sectionIds.has(s.id))p.push(`${at}: duplicate section ID`);
  sectionIds.add(s.id);
  if(s.kind==='point'){
   points++;
   for(const k of ['title','pattern','explain'])if(!text(s[k]))p.push(`${at}: needs ${k}`);
   if(text(s.explain)){if(sentences(s.explain)>3)w.push(`${at}: explain has ${sentences(s.explain)} sentences; keep it to 3`);if(words(s.explain)>=60)w.push(`${at}: explain has ${words(s.explain)} words; keep it under 60`);}
   if(!Array.isArray(s.examples)||!s.examples.length||!s.examples.every(e=>plainObject(e)&&text(e.ja)&&text(e.en)))p.push(`${at}: needs examples of {ja, en}`);
   else if(s.examples.length<2||s.examples.length>4)w.push(`${at}: has ${s.examples.length} examples; aim for 2–4`);
   if(s.note!==undefined&&!text(s.note))p.push(`${at}: note must be text`);
   return;
  }
  const final=s.final===true;
  if(s.final!==undefined&&s.final!==true)p.push(`${at}: final must be true when present`);
  if(final&&practice.at(-1)!==s)p.push(`${at}: only the last practice set can be final`);
  if(!final&&!FORMATS.includes(s.format))p.push(`${at}: format must be one of ${FORMATS.join(', ')}`);
  if(final&&s.format!==undefined&&!FORMATS.includes(s.format))p.push(`${at}: unknown format ${s.format}`);
  if(!text(s.instruction))p.push(`${at}: needs a one-line instruction`);
  if(s.stem!==undefined&&!text(s.stem))p.push(`${at}: stem must be text`);
  if(s.reasons!==undefined&&s.reasons!==false)p.push(`${at}: reasons can only be false`);
  if(!Array.isArray(s.items)||!s.items.length){p.push(`${at}: needs items`);return;}
  if(s.example!==undefined){
   const f=s.example?.format||s.format;
   itemChecks(s.example,f,`${at} example`,p,w,{example:true});
   if(s.example?.id!==undefined){if(itemIds.has(s.example.id))p.push(`${at} example: duplicate ID ${s.example.id}`);itemIds.add(s.example.id);}
  }
  s.items.forEach((it,j)=>{
   const iat=`${at} item ${it?.id||j+1}`;
   if(final&&!FORMATS.includes(it?.format))p.push(`${iat}: in the final set every item states its format`);
   if(!final&&it?.format!==undefined&&it.format!==s.format)p.push(`${iat}: format ${it.format} differs from its set (${s.format}); one format per drill`);
   itemChecks(it,it?.format||s.format,iat,p,w,{final});
   if(it?.id!==undefined){if(itemIds.has(it.id))p.push(`${iat}: duplicate item ID`);itemIds.add(it.id);}
  });
 });
 if(dialogues>1)p.push(`${label}: the conversation can appear only once`);
 if(dialogue&&!dialogues)p.push(`${label}: add a { kind:'dialogue' } section where the conversation belongs`);
 if(!dialogue&&dialogues)p.push(`${label}: this lesson has no conversation to show`);
 const count=unitCount(unit),[lo,hi]=TOTAL_RANGE;
 if(isPractice){if(count<1)p.push(`${label}: a practice needs at least one counted item`);}
 else if(count<lo||count>hi)p.push(`${label}: ${count} counted items; a lesson needs ${lo}–${hi}`);
 // Softer targets from the lesson skeleton: 2–3 points, drills after each point and a まとめ review. A practice is not a
 // lesson, so it skips them; one may still have points and a まとめ of its own.
 if(!isPractice){
  if(points<2||points>3)w.push(`${label}: has ${points} points; aim for 2–3`);
  sections.forEach((s,i)=>{
   if(s?.kind!=='point')return;
   const next=sections.findIndex((x,j)=>j>i&&(x?.kind==='point'||x?.kind==='dialogue'||isFinal(x))),sets=sections.slice(i+1,next<0?sections.length:next).filter(x=>x?.kind==='practice');
   const n=countUnits(unitItems({sections:sets}));
   if(!sets.length||n>14)w.push(`${label} ${s.id}: ${sets.length} drills with ${n} items follow it; aim for up to 14 distinct meaning, building and application checks`);
  });
  const last=practice.at(-1);
  if(!isFinal(last))w.push(`${label}: end with a まとめ review set (final:true)`);
  else{const n=countUnits(unitItems({sections:[last]}));if(n<4||n>10)w.push(`${label}: the まとめ review has ${n} items; aim for 4–10 distinct checks`);}
 }
 // Reason checks: a drill that takes part offers three different lines, so each of its items has two others to show.
 // A drill with fewer than three different lines on its pattern-tagged items asks none (reasonEligible), so it needs
 // no reasons:false (2026-10-29: untagged vocabulary and meaning items no longer count towards the three).
 for(const s of practice){
  const pool=reasonPool(unit,s.id),lines=new Set(pool.map(it=>reasonText(reasonLine(it))));if(lines.size<3)continue;
  for(const it of pool)if(!reasonEligible(unit,it))p.push(`${label} ${s.id} item ${it.id}: no two other lines to offer as reasons`);
 }
 // Kanji words drills (kanjiWordProblems): their words, intro, items and まとめ find items.
 const kw=kanjiWordProblems(unit,{label,index:indexFor(kanjiWords,vocabulary),trialSentences,familiar,kanjiWordsMax});p.push(...kw.problems);w.push(...kw.warnings);
 p.push(...markupProblems(unit.sections,`${label} sections`));
 p.push(...patternProblems(sections,label,toIds(patterns)));
 for(const x of unit.words||[])if(plainObject(x)&&x.frame)p.push(...markupProblems(x.frame,`${label} word ${x.id} frame`));
 return {problems:p,warnings:w,count};
}
export const unitProblems=(unit,opts)=>checkUnit(unit,opts).problems;
