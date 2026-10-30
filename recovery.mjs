// Recovery prompts: where an item in a recovery episode (schedule.mjs) is asked instead of the venue it kept failing in.
// Each source maps to a changed context that tests the same target, chosen from content the learner has already met:
//  · word card      → the word in a sentence from a lesson or reading the learner has opened (or its dictionary example
//                      when the card never shows it): what does the marked word mean here? Kana-only words need no kanji.
//  · kanji reading  → the word in another authored check sentence it was never asked in, or in a sentence from a text the
//                      learner has opened: how is it read here?
//  · reading phrase → the phrase in a new sentence authored for recovery (passage harvest `recovery`): which phrase fits?
//  · passage recall → the passage's harvested phrases that carry its idea units (their sentences hold an idea unit's
//                      evidence), each in one of those new sentences, as one round.
//  · lesson review  → for each grammar pattern its missed items carry (the last closed-book review, or open pattern misses
//                      from this lesson), one drill from another started unit that tests the pattern (#0013's catalog),
//                      as one round. A lesson whose misses carry no pattern has no evidence to route on.
// A prompt is never one this episode has used, and never the failing cue itself. Nothing here touches the DOM or the
// clock; answers and the single schedule credit at completion go through applyRecovery.
import {splitKey,recoveryKey,recoveryRevision,recoveryDue,answerRecovery,recoveryEvent,readRecovery,PROMPT_ID} from './schedule.mjs';
import {reviewTarget,scheduleReview,passageKey,phraseKey,seededOrder,attemptsFor,sentenceSpans,isConverted} from './recall.mjs';
import {plainWritten,plainReading,indexWords,inReadingText,resolvePath,sentenceRange,senseFor,isKanjiWord,hasKanji,sentencesFor,readingChoices,recoverTransfer,insideRuby,RUBY_PATTERN,sourceLines,familiarLine} from './vocabulary.mjs';
import {reviewPrompts,applyRating} from './flashcards.mjs';
import {hasUnit,unitItems,lastReviewAnswer} from './exercises.mjs';
import {patternIndex,recordFor,exposures} from './patterns.mjs';

// The rounds of a passage or a lesson hold at most this many prompts.
export const ROUND_MAX=3;
// Why an item in recovery has no prompt it can use. The Today overview and the item's own page say so.
export const BLOCKED=['no-content','no-evidence','not-started','exhausted'];
export const BLOCKED_TEXT={
 'no-content':'No other sentence or drill tests it yet.',
 'no-evidence':'Its missed questions carry no grammar pattern, so there is no matching drill in another unit.',
 'not-started':'Its other drills and sentences are in lessons or readings you have not opened yet.',
 'exhausted':'Every changed prompt for it has been used in this recovery.'
};
const plainObject=v=>!!v&&typeof v==='object'&&!Array.isArray(v);
const bare=s=>plainWritten(String(s??'')).normalize('NFKC').replace(/[\s　。、，．,.!！?？・「」『』（）()…:：;；〜～]/g,'');
const gloss=s=>String(s??'').toLowerCase().replace(/\(.*?\)/g,'').replace(/^(to|a|an|the)\s+/,'').trim();
const lessonOf=(content,id)=>(content?.lessons||[]).find(l=>l.id===id)||null;
const passageOf=(content,id)=>(content?.passages||[]).find(p=>p.id===id)||null;
const read=(state,id)=>attemptsFor(state?.recall,id).length>0||!!state?.reviews?.[passageKey(id)];
// A phrase's new sentences, from the passage harvest: [{id, ja, en}].
export const harvestSentences=h=>Array.isArray(h?.recovery)?h.recovery:[];
const harvestOf=(content,id)=>{for(const p of content?.passages||[]){const h=p.recall?.harvest?.find(x=>x.id===id);if(h)return {passage:p,harvest:h};}return null;};

// ── Prompt sources ───────────────────────────────────────────────────────────────────────────────────────────────────
// The sentence around each reading-text reference to a word in an opened lesson or reading, with the reference's place in
// it: [{id, text, at, len, occurrence, source}], course order, one per distinct sentence.
function textSentences(state,content,wordId,{started,kanjiOnly=false}){
 const out=[],seen=new Set();
 for(const [kind,list,open] of [['l',content?.lessons,id=>started(id)],['p',content?.passages,id=>read(state,id)]])for(const c of list||[]){
  if(!open(c.id))continue;
  (c.occurrences||[]).forEach((o,i)=>{
   if(o.word!==wordId||!inReadingText(o.path)||(kanjiOnly&&!hasKanji(o.surface)))return;
   const value=resolvePath(c,o.path);if(typeof value!=='string'||value.slice(o.start,o.end)!==o.surface)return;
   const [a,b]=sentenceRange(value,o.start,o.end),text=value.slice(a,b),k=bare(text);
   if(seen.has(k))return;seen.add(k);
   out.push({id:`t:${kind}:${c.id}:${i}`,text,at:o.start-a,len:o.end-o.start,occurrence:o,source:`${kind==='l'?'lesson':'passage'}:${c.id}`});
  });
 }
 return out;
}
// The deck sources of a word's cards: their sentences come last, since the learner saw them beside the failing card.
const cardSources=(state,wordId)=>new Set((state?.decks||[]).flatMap(d=>d.cards).filter(c=>c.word===wordId&&c.source).map(c=>c.source));
function wordCandidates(state,content,ref,{started}){
 const [wordId,faces='']=String(ref).split('|'),w=indexWords(content?.vocabulary).get(wordId);if(!w)return {list:[],locked:false};
 const shown=new Set(faces.split(/[,>]/)),near=cardSources(state,wordId);
 const list=textSentences(state,content,wordId,{started}).sort((a,b)=>(near.has(a.source)?1:0)-(near.has(b.source)?1:0));
 const ex=typeof w.example==='string'?w.example.indexOf(w.word):-1;
 // The dictionary example counts only when the card never shows it.
 if(ex>=0&&!shown.has('example'))list.push({id:`x:${wordId}`,text:w.example,at:ex,len:w.word.length,occurrence:null,source:'dictionary'});
 const all=textSentences(state,content,wordId,{started:()=>true});
 return {list,locked:!list.length&&all.length>0};
}
function readingCandidates(state,content,ref,{started,kanjiChecks,lines}){
 const asked=new Set(state?.readingEvidence?.words?.[ref]?.transfer?.seen||[]);
 const checks=sentencesFor(kanjiChecks,ref,lines).filter(s=>!asked.has(s.id)).map(s=>({id:`k:${s.id}`,text:s.text,at:s.text.indexOf(s.target),len:s.target.length,en:s.en,source:'check'}));
 const list=[...checks,...textSentences(state,content,ref,{started,kanjiOnly:true})];
 return {list,locked:!list.length&&textSentences(state,content,ref,{started:()=>true,kanjiOnly:true}).length>0};
}
const phrasePrompts=h=>harvestSentences(h).map(s=>({id:`h:${s.id}`,sentence:s}));
// Spans overlap on the same path.
const overlaps=(a,b)=>a.path===b.path&&a.start<b.end&&b.start<a.end;
// The harvested phrases whose passage sentence holds an idea unit's evidence, critical units first: [{harvest, critical}].
export function linkedPhrases(passage){
 const units=passage?.recall?.ideaUnits||[];
 return (passage?.recall?.harvest||[]).map((h,i)=>{const hit=units.filter(u=>(u.evidence||[]).some(e=>overlaps(e,h.context)));return hit.length?{harvest:h,critical:hit.some(u=>u.critical),units:hit.map(u=>u.id),i}:null;})
  .filter(Boolean).sort((a,b)=>(b.critical?1:0)-(a.critical?1:0)||a.i-b.i);
}
// The grammar patterns a lesson's misses carry: items wrong in its last closed-book review, then open pattern misses
// recorded in this lesson (drills, reviews, checkpoints). Most recent evidence first, at most ROUND_MAX.
export function missedPatterns(state,content,lessonId){
 const l=lessonOf(content,lessonId);if(!hasUnit(l))return [];
 const a=state?.answers?.[lessonId],out=[];
 for(const it of unitItems(l))if(it.patternId&&lastReviewAnswer(a,it)===false&&!out.includes(it.patternId))out.push(it.patternId);
 const open=Object.entries(state?.patterns?.records||{}).map(([id,r])=>({id,at:Math.max(-1,...(r.misses||[]).filter(m=>m.lesson===lessonId).map(m=>m.at))})).filter(x=>x.at>=0).sort((x,y)=>y.at-x.at);
 for(const x of open)if(!out.includes(x.id))out.push(x.id);
 const known=new Set((content?.patterns||[]).map(p=>p.id));
 return out.filter(id=>known.has(id)).slice(0,ROUND_MAX);
}

// ── Resolution ───────────────────────────────────────────────────────────────────────────────────────────────────────
// The prompts for one item now: {prompts: [id…], reason}. An empty list carries why (BLOCKED). seen: prompts this episode
// used. exclude: drill keys (lesson:item) other units in the same run already show.
export function recoveryPrompts(key,state,content,{kanjiChecks=null,lines=[],started=()=>false,exclude=new Set()}={}){
 const k=splitKey(key),ep=state?.recovery?.items?.[key]?.episode,seen=new Set(ep?.seen||[]);
 const none=reason=>({prompts:[],reason});
 if(!k)return none('no-content');
 const pickOne=({list,locked})=>{const fresh=list.filter(x=>!seen.has(x.id));return fresh.length?{prompts:[fresh[0].id],reason:null}:none(list.length?'exhausted':locked?'not-started':'no-content');};
 if(k.type==='word')return pickOne(wordCandidates(state,content,k.ref,{started}));
 if(k.type==='reading')return pickOne(readingCandidates(state,content,k.ref,{started,kanjiChecks,lines}));
 if(k.type==='phrase'){const h=harvestOf(content,k.ref)?.harvest;return pickOne({list:h?phrasePrompts(h):[],locked:false});}
 if(k.type==='passage'){
  const links=linkedPhrases(passageOf(content,k.ref));if(!links.length)return none('no-content');
  const prompts=links.map(x=>phrasePrompts(x.harvest).find(p=>!seen.has(p.id))).filter(Boolean).slice(0,ROUND_MAX).map(p=>p.id);
  return prompts.length?{prompts,reason:null}:none(links.some(x=>phrasePrompts(x.harvest).length)?'exhausted':'no-content');
 }
 // Lesson: every missed pattern needs its own drill from another started unit, so the round covers all of them.
 const patterns=missedPatterns(state,content,k.ref);if(!patterns.length)return none('no-evidence');
 const index=patternIndex(content),order=new Map((content?.lessons||[]).map((l,i)=>[l.id,i])),taken=new Set(exclude),prompts=[];
 for(const id of patterns){
  const all=(index.get(id)?.items||[]).filter(x=>x.lesson!==k.ref);
  const open=all.filter(x=>started(x.lesson)),fresh=open.filter(x=>!seen.has(`d:${x.lesson}:${x.item.id}`)&&!taken.has(`${x.lesson}:${x.item.id}`));
  if(!fresh.length)return none(open.length?'exhausted':all.length?'not-started':'no-content');
  const rec=recordFor(state?.patterns,id),pick=fresh.map((x,i)=>({x,rank:[exposures(state,x.lesson,x.item,rec),order.get(x.lesson)??0,i]})).sort((a,b)=>a.rank[0]-b.rank[0]||a.rank[1]-b.rank[1]||a.rank[2]-b.rank[2])[0].x;
  taken.add(`${pick.lesson}:${pick.item.id}`);prompts.push(`d:${pick.lesson}:${pick.item.id}`);
 }
 return {prompts,reason:null};
}

// ── Questions ────────────────────────────────────────────────────────────────────────────────────────────────────────
// Meanings from other words of the same part of speech the learner has met (in their dictionary, or failing that any),
// never one that matches the answer.
function meaningChoices(state,content,w,answer,seed){
 const pool=(content?.vocabulary||[]).filter(x=>x.id!==w.id&&x.meaning&&gloss(x.meaning)!==gloss(answer)&&!gloss(x.meaning).includes(gloss(answer))&&!gloss(answer).includes(gloss(x.meaning)));
 const met=x=>Object.prototype.hasOwnProperty.call(state?.discovered||{},x.id);
 const ranked=[...pool.filter(x=>x.pos===w.pos&&met(x)),...pool.filter(x=>x.pos===w.pos&&!met(x)),...pool.filter(x=>x.pos!==w.pos&&met(x))];
 const picked=[],used=new Set([gloss(answer)]);
 for(const i of seededOrder(ranked.length,`${seed}|pool`)){const x=ranked[i];if(picked.length>=2)break;if(used.has(gloss(x.meaning)))continue;used.add(gloss(x.meaning));picked.push(x);}
 // Keep same-part-of-speech meanings first whatever the shuffle drew.
 picked.sort((a,b)=>(a.pos===w.pos?0:1)-(b.pos===w.pos?0:1));
 return picked;
}
// The question behind one prompt ID, or null when the content no longer holds it. seed varies choice order by attempt.
export function recoveryQuestion(key,id,state,content,{kanjiChecks=null,seed=''}={}){
 const k=splitKey(key);if(!k||!PROMPT_ID.test(String(id)))return null;
 const [tag,...rest]=String(id).split(':');
 if(k.type==='lesson'){
  if(tag!=='d')return null;const [lesson,item]=rest,l=lessonOf(content,lesson),it=hasUnit(l)?unitItems(l).find(x=>x.id===item):null;
  return it&&it.patternId&&lesson!==k.ref?{kind:'drill',id,lesson,item,pattern:it.patternId}:null;
 }
 let s=null;
 if(tag==='t'){
  const [kind,cid,n]=rest,c=kind==='l'?lessonOf(content,cid):kind==='p'?passageOf(content,cid):null,o=c?.occurrences?.[Number(n)];
  const wordId=k.type==='word'?k.ref.split('|')[0]:k.ref;
  if(!o||o.word!==wordId||!inReadingText(o.path))return null;
  const value=resolvePath(c,o.path);if(typeof value!=='string'||value.slice(o.start,o.end)!==o.surface)return null;
  const [a,b]=sentenceRange(value,o.start,o.end);s={text:value.slice(a,b),at:o.start-a,len:o.end-o.start,occurrence:o};
 }else if(tag==='x'&&k.type==='word'){
  const w=indexWords(content?.vocabulary).get(rest[0]),at=w?.example?.indexOf(w.word)??-1;
  if(!w||rest[0]!==k.ref.split('|')[0]||at<0)return null;s={text:w.example,at,len:w.word.length,occurrence:null};
 }else if(tag==='k'&&k.type==='reading'){
  const c=(kanjiChecks?.sentences||[]).find(x=>x.id===rest[0]&&x.word===k.ref);if(!c)return null;
  s={text:c.text,at:c.text.indexOf(c.target),len:c.target.length,en:c.en,occurrence:null};
 }else if(tag==='h'&&(k.type==='phrase'||k.type==='passage')){
  const hid=rest[0].replace(/-r\d+$/,''),found=harvestOf(content,hid),sentence=found&&harvestSentences(found.harvest).find(x=>x.id===rest[0]);
  if(!sentence||(k.type==='phrase'?hid!==k.ref:found.passage.id!==k.ref))return null;
  const h=found.harvest,pool=found.passage.recall.harvest.filter(x=>x.id!==h.id&&plainWritten(x.phrase)!==plainWritten(h.phrase));
  const others=[...pool,...(content?.passages||[]).filter(p=>p.id!==found.passage.id).flatMap(p=>p.recall?.harvest||[])].filter(x=>plainWritten(x.phrase)!==plainWritten(h.phrase)).slice(0,2);
  const options=[h,...others],order=seededOrder(options.length,`${id}|${seed}`).map(i=>options[i]),at=sentence.ja.indexOf(h.phrase);
  return {kind:'phrase',id,harvest:h.id,passage:found.passage.id,text:sentence.ja,at,len:h.phrase.length,en:sentence.en,meaning:h.meaning,
   question:`Which phrase completes the sentence? It means “${h.meaning}”.`,choices:order.map(x=>x.phrase),correct:order.findIndex(x=>x.id===h.id),
   feedback:order.map(x=>x.id===h.id?`Correct. ${h.phrase} means “${h.meaning}” here.`:`${x.phrase} means “${x.meaning}”. This sentence needs the phrase that means “${h.meaning}”.`)};
 }
 if(!s||s.at<0)return null;
 const surface=s.text.slice(s.at,s.at+s.len);
 if(k.type==='reading'){
  if(!hasKanji(surface))return null;
  const {answer,choices}=readingChoices(surface,content,{seed:`${key}|${id}|${seed}`});
  return {kind:'reading',id,word:k.ref,text:s.text,at:s.at,len:s.len,surface,en:s.en||'',answer,choices,correct:choices.indexOf(answer)};
 }
 if(k.type!=='word')return null;
 const w=indexWords(content?.vocabulary).get(k.ref.split('|')[0]);if(!w)return null;
 const answer=senseFor(w,s.occurrence)?.gloss||w.meaning,others=meaningChoices(state,content,w,answer,`${key}|${id}`);
 if(others.length<2)return null;
 const options=[{text:answer,word:w},...others.map(x=>({text:x.meaning,word:x}))],order=seededOrder(options.length,`${id}|${seed}`).map(i=>options[i]);
 return {kind:'meaning',id,word:w.id,text:s.text,at:s.at,len:s.len,surface,question:'What does the marked word mean in this sentence?',choices:order.map(x=>x.text),correct:order.findIndex(x=>x.word.id===w.id),
  feedback:order.map(x=>x.word.id===w.id?`Correct. Here ${plainWritten(surface)} means “${answer}”.`:`“${x.text}” is ${plainWritten(x.word.word)}. Here ${plainWritten(surface)} means “${answer}”.`)};
}

// ── Today units ──────────────────────────────────────────────────────────────────────────────────────────────────────
// Whether the item a recovery key names still exists for this learner: content for lessons, passages and phrases, a deck
// prompt for a word card, a scheduled kanji reading for a word.
export function recoveryTarget(key,state,content){
 const k=splitKey(key);if(!k)return false;
 if(k.type==='lesson'||k.type==='passage'||k.type==='phrase')return !!reviewTarget(k.type==='lesson'?k.ref:`${k.type}:${k.ref}`,content);
 if(k.type==='word')return reviewPrompts(state,'all').some(p=>p.key===k.ref)&&indexWords(content?.vocabulary).has(k.ref.split('|')[0]);
 return isKanjiWord(indexWords(content?.vocabulary).get(k.ref))&&!!state?.readingEvidence?.words?.[k.ref]?.transfer;
}
// Every open episode, sorted into Today units (due now, with prompts), waiting (prompts, wait not over) and blocked (no
// usable prompt: listed with its reason, never counted as review debt, never asked through the failing cue). Units carry
// the item's own scheduling key, so Today deduplicates them with every other source.
export function recoveryUnits(state,content,{now=Date.now(),kanjiChecks=null,lines=[],started=()=>false,exclude=new Set()}={}){
 const units=[],waiting=[],blocked=[],taken=new Set(exclude);
 for(const [key,e] of Object.entries(state?.recovery?.items||{})){
  const ep=e?.episode;if(!ep||!recoveryTarget(key,state,content))continue;
  const k=splitKey(key),due=recoveryDue(ep),base={key,type:k.type,ref:k.ref,due,streak:ep.streak,episode:ep};
  const r=recoveryPrompts(key,state,content,{kanjiChecks,lines,started,exclude:taken});
  const usable=r.prompts.filter(p=>recoveryQuestion(key,p,state,content,{kanjiChecks}));
  if(!usable.length||usable.length!==r.prompts.length){blocked.push({...base,reason:r.reason||'no-content'});continue;}
  if(due>now){waiting.push(base);continue;}
  for(const p of usable)if(p.startsWith('d:'))taken.add(p.slice(2));
  units.push({key,type:k.type,ref:k.ref,revision:recoveryRevision(state.recovery,key),due,item:{recovery:usable}});
 }
 const byDue=(a,b)=>a.due-b.due||(a.key<b.key?-1:1);
 return {units:units.sort(byDue),waiting:waiting.sort(byDue),blocked:blocked.sort(byDue)};
}
// The source credit when an episode completes: one correct, due answer on the item's own schedule.
export function creditRecovery(state,key,now){
 const k=splitKey(key);if(!k)return {patch:{},event:null};
 if(k.type==='lesson'||k.type==='passage'||k.type==='phrase'){
  const rk=k.type==='lesson'?k.ref:k.type==='passage'?passageKey(k.ref):phraseKey(k.ref);if(!state?.reviews?.[rk])return {patch:{},event:null};
  const res=scheduleReview(state.reviews,rk,{correct:true,now});return {patch:{reviews:res.reviews},event:res.event||null};
 }
 if(k.type==='word'){
  const rec=state?.wordReviews?.items?.[k.ref];if(!rec)return {patch:{},event:null};
  const r=applyRating(rec,rec,'good',{now});
  return {patch:{wordReviews:{...state.wordReviews,items:{...state.wordReviews.items,[k.ref]:r.record}}},event:{...r.event,self:false}};
 }
 const r=recoverTransfer(state?.readingEvidence,k.ref,now);return {patch:r.record?{readingEvidence:r.store}:{},event:r.event};
}
// One recovery answer (a prompt, or a whole round with `correct` true only when every prompt was right): the recovery
// record and, when it completes the episode, the single credit to the item's own schedule. The prompts' own content
// (another unit's drill, another phrase) is never credited. Returns {patch, res, event}: the state fields to commit, the
// recovery result and the ledger fields to log under the item's type and ref with venue `recovery`.
export function applyRecovery(state,key,{prompts,correct,now}){
 const res=answerRecovery(state?.recovery,key,{prompts,correct,now});
 if(!res.completed)return {patch:{recovery:res.store},res,event:recoveryEvent(res,correct)};
 const c=creditRecovery(state,key,now);
 return {patch:{...c.patch,recovery:res.store},res,event:c.event||recoveryEvent(res,correct)};
}
// Reads `recovery` with the content: records for removed items are dropped (or fail a strict restore). A lesson record of
// a lesson that became an optional practice (recall.mjs CONVERTED) is kept as it was: nothing schedules it any more, and
// an old backup still restores.
export function readRecoveryState(value,content,{strict=false}={}){
 const words=indexWords(content?.vocabulary);
 const known=key=>{const k=splitKey(key);if(!k)return false;if(k.type==='lesson'&&isConverted(k.ref))return true;if(k.type==='word')return /^[a-z0-9-]+\|[a-z,]+>[a-z,]+$/.test(k.ref)&&words.has(k.ref.split('|')[0]);if(k.type==='reading')return isKanjiWord(words.get(k.ref));return !!reviewTarget(k.type==='lesson'?k.ref:`${k.type}:${k.ref}`,content);};
 return readRecovery(value,{strict,known});
}

// ── Content checks (tools/validate.mjs) ──────────────────────────────────────────────────────────────────────────────
// New sentences for harvested phrases: at least two per phrase, each holding the phrase once and whole, ending a sentence,
// every kanji with its reading, no line the learner already reads, and every {kanji|reading} token one the course already
// uses, so a recovery prompt never teaches unknown material. Every passage needs a phrase linked to an idea unit.
// Warnings: words that no lesson sentence, reading or example can carry, which would block a word card's recovery.
export const SENTENCES_MIN=2,LINE_MAX=48;
const KANJI=/[㐀-鿿々]/;
export function recoveryProblems(content,{extra=[]}={}){
 const problems=[],warnings=[],ids=new Set();
 const strip=c=>({...c,recall:c.recall?{...c.recall,harvest:(c.recall.harvest||[]).map(({recovery,...h})=>h)}:c.recall});
 const base={...content,passages:(content?.passages||[]).map(strip)},lines=sourceLines(base,extra);
 const corpus=JSON.stringify([base.lessons,base.passages,content?.vocabulary]),tokens=new Set([...corpus.matchAll(RUBY_PATTERN)].map(m=>m[0]));
 for(const p of content?.passages||[]){
  if(!linkedPhrases(p).length)problems.push(`Passage ${p.id}: no harvested phrase sits in an idea unit's evidence, so its recall has no recovery route`);
  for(const h of p.recall?.harvest||[]){
   const list=harvestSentences(h),at=`Passage ${p.id} harvest ${h.id}`;
   if(h.recovery!==undefined&&!Array.isArray(h.recovery)){problems.push(`${at}: recovery must be a list of sentences`);continue;}
   if(list.length<SENTENCES_MIN)problems.push(`${at}: needs at least ${SENTENCES_MIN} new sentences for recovery (has ${list.length})`);
   const texts=new Set();
   list.forEach((s,i)=>{
    const sat=`${at} recovery ${s?.id||i+1}`;
    if(!plainObject(s)||Object.keys(s).some(x=>!['id','ja','en'].includes(x))){problems.push(`${sat}: needs id, ja and en only`);return;}
    if(s.id!==`${h.id}-r${i+1}`)problems.push(`${sat}: ID must be ${h.id}-r${i+1}`);
    if(ids.has(s.id))problems.push(`${sat}: duplicate ID`);ids.add(s.id);
    if(typeof s.ja!=='string'||!s.ja.trim()||typeof s.en!=='string'||!s.en.trim()){problems.push(`${sat}: needs ja and en`);return;}
    const first=s.ja.indexOf(h.phrase);
    if(first<0||s.ja.indexOf(h.phrase,first+1)>=0)problems.push(`${sat}: must hold ${plainWritten(h.phrase)} exactly once`);
    else if(insideRuby(s.ja,first)||insideRuby(s.ja,first+h.phrase.length))problems.push(`${sat}: the phrase splits reading markup`);
    if(!/[。？！]」?$/.test(s.ja))problems.push(`${sat}: must end a sentence`);
    if((s.ja.match(/\{/g)||[]).length!==(s.ja.match(/\}/g)||[]).length||KANJI.test(s.ja.replace(RUBY_PATTERN,'')))problems.push(`${sat}: every kanji needs a {kanji|reading} token`);
    for(const m of s.ja.matchAll(RUBY_PATTERN))if(!tokens.has(m[0]))problems.push(`${sat}: ${m[0]} appears nowhere else in the course, so it would be new material`);
    const k=bare(s.ja);if(texts.has(k))problems.push(`${sat}: repeats another recovery sentence`);texts.add(k);
    if(sentenceSpans(s.ja.replace(/」$/,'')).length>3||plainWritten(s.ja).length>LINE_MAX)problems.push(`${sat}: keep it short: at most three sentences and ${LINE_MAX} characters`);
    const line=familiarLine({text:s.ja,target:h.phrase},lines);if(line)problems.push(`${sat}: repeats a line the learner already reads (${line})`);
   });
  }
 }
 const sentences=new Map();
 for(const c of [...(content?.lessons||[]),...(content?.passages||[])])for(const o of c.occurrences||[])if(inReadingText(o.path))sentences.set(o.word,(sentences.get(o.word)||0)+1);
 const bare_=(content?.vocabulary||[]).filter(w=>!sentences.has(w.id)&&!(typeof w.example==='string'&&w.example.includes(w.word)));
 if(bare_.length)warnings.push(`Recovery: ${bare_.length} word${bare_.length===1?'':'s'} appear in no lesson or reading sentence and have no example holding the word, so a card for them has no changed context (${bare_.slice(0,8).map(w=>w.id).join(', ')}${bare_.length>8?', …':''})`);
 return {problems,warnings};
}
export {recoveryKey};
