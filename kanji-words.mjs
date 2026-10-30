// Kanji words: which vocabulary word each {written|reading} token in a text belongs to, each word's stage for this learner
// (not met, met, known), its progress points, and how they are stored. Pure functions: nothing here touches the DOM,
// localStorage or app state. Spec: docs/data-contract.md "Kanji words"; design: docs/curriculum.md "Kanji growth".
//
// A kanji word is a vocabulary entry whose `word` contains {written|reading} markup. Progress belongs to the word, not to
// the character: state.kanjiWords = {version, words:{[wordId]:{met, points, pointDay, known, missed}}}, days being local
// calendar days (YYYY-MM-DD). A word with no entry has not been met. `points` counts the word's passed trials on the Kanji
// page (recordTrial), at most one a local day; at KNOWN_POINTS (three passes, so three different days) the word is known
// for good (mastered without a track; see isMastered: only mastered words show kanji in text, and only with Show all
// kanji on, 2026-10-29). Lesson drills and the reading check (recordAnswer) add no points: a right answer
// marks the word met, and a wrong one puts a known word's reading back (missed) until its next right answer or pass.
// Kanji cards (below): the daily round of cards drawn from the met words, and how it is saved.
//
// A profile with a kanji track (kanji-characters.mjs; docs/data-contract.md "Kanji sets", 2026-10-29) has no card round:
// its Kanji page is the sets. Its reward is the display rule's `known` (a Set of the characters known on the track): with
// Show all kanji on, a met word shows in plain kanji once every kanji in it is known there. Character mastery is undefined
// for now, so that Set is empty and the rule is wired but inert. A track profile draws no word cards, so it never sets a
// word's `known`. Without `known` (no track), a word is mastered when it is known.
import {RUBY_PATTERN} from './vocabulary.mjs?b=8b9c4fd';
export const KANJI_WORDS_VERSION=1;
export const KNOWN_POINTS=3;
export const POINTS_PER_DAY=1;
const SLUG=/^[a-z][a-z0-9-]*$/;
const DAY=/^(\d{4})-(\d{2})-(\d{2})$/;
const ENTRY_KEYS=['met','points','pointDay','known','missed'];
const plainObject=v=>!!v&&typeof v==='object'&&!Array.isArray(v);
const own=(o,k)=>plainObject(o)&&Object.prototype.hasOwnProperty.call(o,k);
const tokensOf=s=>[...String(s??'').matchAll(RUBY_PATTERN)];
const keyOf=m=>`${m[1]}|${m[2]}`;
const pad=(n,w=2)=>String(n).padStart(w,'0');
// The distinct kanji of a written form, in order. 々 repeats the kanji before it, so it adds none of its own.
const HAN=/\p{Script=Han}/u;
export const kanjiOf=s=>[...new Set([...String(s)].filter(ch=>ch!=='々'&&HAN.test(ch)))];

// The local calendar day of `now` (a Date or a timestamp) as YYYY-MM-DD, or null for an invalid time.
export function localDay(now=Date.now()){const d=new Date(now);return Number.isNaN(d.getTime())?null:`${pad(d.getFullYear(),4)}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;}
// A real calendar day in that format (2026-02-30 is not one).
function isDay(v){
 const m=typeof v==='string'&&DAY.exec(v);if(!m)return false;
 const d=new Date(2000,0,1,12);d.setFullYear(+m[1],+m[2]-1,+m[3]);
 return d.getFullYear()===+m[1]&&d.getMonth()===+m[2]-1&&d.getDate()===+m[3];
}

// ── Proper nouns ──────────────────────────────────────────────────────────────────────────────────────────
// People's names and places stay in kana whatever the learner knows, even when every kanji in them belongs to a known word
// (青木 has the kanji of blue and Thursday). The written forms in the shipped content; the validator's kanjiTokens report
// warns about a name it finds in the content (a speaker, a chat label, a name before さん or 先生) that is missing here.
export const PROPER_NOUNS=Object.freeze({
 names:Object.freeze(['上田','上野','中山','中島','中村','井上','伊藤','佐藤','加藤','原','原田','小川','小林','小野','山口','山本','山田','木村','松本','林','森','田中','石井','石田','藤井','西村','西田','野口','鈴木','青木','高橋']),
 places:Object.freeze(['京都','仙台','余市','北海道','名古屋','大阪','奈良','広島','札幌','東京','横浜','神戸','福岡','金沢','鎌倉'])
});

// ── Index ─────────────────────────────────────────────────────────────────────────────────────────────────
// words: each kanji word with its match patterns, the markup of `word` and of each forms[].form, longest first.
// tokens: each token (水|みず) → the words that contain it, in vocabulary order. byFirst: each pattern filed under its first
// token, with the plain text before that token (lead) and its token count, so resolving a text only tries patterns that
// can start at one of its tokens. Identical patterns of different words ({出口|でぐち} is deguchi and exit) share an entry.
// cache: resolved strings. Build the index once per content load; the cache lives on it.
// For tokens of no word (Display, below): chars maps each kanji to the words with a token that contains it (水 → water,
// wednesday), proper holds the written forms that always stay in kana (PROPER_NOUNS unless given), and composites caches
// each such written form's kanji resolved to their words (compositeWords).
export function kanjiWordIndex(vocabulary,{proper=[...PROPER_NOUNS.names,...PROPER_NOUNS.places]}={}){
 const list=vocabulary instanceof Map?[...vocabulary.values()]:Array.isArray(vocabulary)?vocabulary:[];
 const words=new Map(),tokens=new Map(),owners=new Map();
 for(const w of list){
  if(!SLUG.test(w?.id??'')||typeof w.word!=='string'||!tokensOf(w.word).length||words.has(w.id))continue;
  const patterns=[...new Set([w.word,...(Array.isArray(w.forms)?w.forms:[]).map(f=>f?.form)])].filter(p=>typeof p==='string'&&tokensOf(p).length).sort((a,b)=>b.length-a.length);
  words.set(w.id,Object.freeze({id:w.id,patterns:Object.freeze(patterns)}));
  for(const p of patterns){
   if(!owners.has(p))owners.set(p,[]);owners.get(p).push(w.id);
   for(const m of tokensOf(p)){const k=keyOf(m);if(!tokens.has(k))tokens.set(k,[]);if(!tokens.get(k).includes(w.id))tokens.get(k).push(w.id);}
  }
 }
 const byFirst=new Map();
 for(const [text,ids] of owners){const ts=tokensOf(text),k=keyOf(ts[0]);if(!byFirst.has(k))byFirst.set(k,[]);byFirst.get(k).push({text,lead:ts[0].index,count:ts.length,words:Object.freeze(ids)});}
 for(const ids of tokens.values())Object.freeze(ids);
 const chars=new Map();
 for(const [k,ids] of tokens)for(const ch of kanjiOf(k.slice(0,k.indexOf('|')))){if(!chars.has(ch))chars.set(ch,[]);const ws=chars.get(ch);for(const id of ids)if(!ws.includes(id))ws.push(id);}
 for(const ids of chars.values())Object.freeze(ids);
 return {words,tokens,byFirst,cache:new Map(),chars,proper:new Set(proper),composites:new Map()};
}

// ── Resolving text ────────────────────────────────────────────────────────────────────────────────────────
// Splits a markup string into plain runs {text} and tokens {text, written, reading, token, word, candidates}, in order.
// A token takes the word of the longest pattern matching the text around it. Matching is on the markup, so お{水|みず} and
// {水|みず} both match, and {食|た}べ{物|もの} is food, not eat. Equal-length matches of different words leave it ambiguous.
// A token outside every match takes its only word. An ambiguous token has word null and lists its words as candidates;
// a token of no word (a name, a place, a time such as {六時|ろくじ}) has neither. Results are frozen and cached per string.
export function resolveText(text,index){
 const s=String(text??''),hit=index.cache.get(s);if(hit)return hit;
 const ts=tokensOf(s),best=ts.map(()=>null);
 ts.forEach((m,i)=>{
  for(const p of index.byFirst.get(keyOf(m))||[]){
   const start=m.index-p.lead;
   if(start<0||!s.startsWith(p.text,start))continue;
   // A literal match lines up with the text's tokens, so it covers tokens i to i+count-1.
   for(let j=i;j<i+p.count;j++){const b=best[j];if(!b||p.text.length>b.length)best[j]={length:p.text.length,words:[...p.words]};else if(p.text.length===b.length)for(const id of p.words)if(!b.words.includes(id))b.words.push(id);}
  }
 });
 const parts=[];let at=0;
 ts.forEach((m,i)=>{
  if(m.index>at)parts.push(Object.freeze({text:s.slice(at,m.index)}));
  const ids=best[i]?.words||index.tokens.get(keyOf(m))||[];
  parts.push(Object.freeze({text:m[0],written:m[1],reading:m[2],token:keyOf(m),word:ids.length===1?ids[0]:null,candidates:Object.freeze(ids.length>1?[...ids]:[])}));
  at=m.index+m[0].length;
 });
 if(at<s.length)parts.push(Object.freeze({text:s.slice(at)}));
 const out=Object.freeze(parts);index.cache.set(s,out);return out;
}

// ── Learner state ─────────────────────────────────────────────────────────────────────────────────────────
export const emptyKanjiWords=()=>({version:KANJI_WORDS_VERSION,words:{}});
const storeOf=kw=>plainObject(kw)&&kw.version===KANJI_WORDS_VERSION&&plainObject(kw.words)?kw:emptyKanjiWords();
const entryOf=(kw,id)=>own(kw?.words,id)?kw.words[id]:null;
const fresh=day=>({met:day,points:0,pointDay:null,known:null,missed:false});
const same=(a,b)=>!!a&&ENTRY_KEYS.every(k=>a[k]===b[k]);
// Records that the word was met today. A word already met keeps its day, and the same store comes back.
export function markMet(kw,id,now=Date.now()){
 const base=storeOf(kw),day=localDay(now);
 if(!SLUG.test(String(id))||!day||entryOf(base,id))return base;
 return {version:KANJI_WORDS_VERSION,words:{...base.words,[id]:fresh(day)}};
}
const commitEntry=(base,id,next)=>same(entryOf(base,id),next)?base:{version:KANJI_WORDS_VERSION,words:{...base.words,[id]:next}};
// One answer about the word in a lesson or practice drill or the reading check (correct === true is right). It marks the
// word met and changes no points: a right answer clears missed, and a wrong one sets missed on a known word, so its reading
// shows again until the next right answer or passed trial. Returns the same store when nothing changes.
export function recordAnswer(kw,id,correct,now=Date.now()){
 const base=storeOf(kw),day=localDay(now);
 if(!SLUG.test(String(id))||!day)return base;
 const e=entryOf(base,id)||fresh(day);
 return commitEntry(base,id,{...e,missed:correct===true?false:!!e.known});
}
export function wordStage(kw,id){const e=entryOf(kw,id);return e?.known?'known':e?.met?'met':'unmet';}
// One closed trial on the Kanji page (kanji-cards.mjs; docs/data-contract.md "Kanji cards"): passed === true when the trial
// passed (by the default policy, all three questions right). A pass adds a point, at most one a local day (pointDay keeps
// the day of the last pass), sets known once the points reach knownAt (the policy's; KNOWN_POINTS, the default policy's
// knownAt, when not given), and clears missed. A pass on a known word is a review: it records its day (and its
// point) and never changes known. A failed trial marks the word met if it is not, sets missed on a known word and takes
// nothing away: the card is closed for the day, and that is the cost. An entry stored before the trial with points at or
// above knownAt and no known day stays as it is (wordStage reads known) until its next pass makes it known. Returns the
// same store when nothing changes.
export function recordTrial(kw,id,passed,now=Date.now(),{knownAt=KNOWN_POINTS}={}){
 const base=storeOf(kw),day=localDay(now);
 if(!SLUG.test(String(id))||!day)return base;
 const e=entryOf(base,id)||fresh(day);
 if(passed!==true)return commitEntry(base,id,{...e,missed:!!e.known});
 const gain=e.pointDay!==day,points=e.points+(gain?1:0);
 return commitEntry(base,id,{...e,points,pointDay:gain?day:e.pointDay,known:e.known||(points>=knownAt?day:null),missed:false});
}

// ── Display ───────────────────────────────────────────────────────────────────────────────────────────────
// Show all kanji (2026-10-29; docs/data-contract.md "Stages on screen"): running text is kana. With the switch off
// (showAll false, the default) every staged token is kana. With it on, a token shows in kanji only when its word is
// mastered (isMastered): plain kanji with its reading on tap, or kanji-reading (ordinary ruby) for a mastered word with
// a miss recorded (missed). Every other token stays kana. The stages (met, known) are still recorded and still drive the
// Kanji page, the dictionary filters and word cards; only running text stopped drawing the met stage.
// A shared token outside every match shows its most advanced candidate: a mastered word without a miss beats one with a miss.
// A token of no word (公園, 六時) is a composite: each of its kanji takes the most advanced display among the words that
// contain it (index.chars), and the token shows the least advanced of those. So it is in kanji once every kanji is in a
// mastered word, and kana while any is in none (or in no word at all: 六 of 六時). Proper nouns stay in kana.
const RANK={kana:0,'kanji-reading':1,kanji:2};
// Mastered: the ONE definition text display reads, PROVISIONAL (2026-10-29): it will be revised with the Kanji section.
// Without a character track (known null/undefined) a word is mastered when its stage is known. With a track (known, a
// Set of the characters known on it, even empty) a word is mastered when it is met or known AND its token's written form
// has kanji, every one of them in known (a token with no written form given is not mastered).
export function isMastered(kw,id,{written=null,known=null}={}){
 const st=wordStage(kw,id);
 if(!(known&&typeof known.has==='function'))return st==='known';
 if(st==='unmet')return false;
 const chars=kanjiOf(written??'');return chars.length>0&&chars.every(ch=>known.has(ch));
}
function displayOf(kw,id,opts){return isMastered(kw,id,opts)?(entryOf(kw,id)?.missed?'kanji-reading':'kanji'):'kana';}
function mostAdvanced(kw,ids,opts){let out='kana';for(const id of ids){const d=displayOf(kw,id,opts);if(RANK[d]>RANK[out])out=d;}return out;}
// metStyle (kanji-policy.mjs MET_STYLES; the policy's metStyle) no longer changes running text (2026-10-29): the met stage
// is not drawn there any more. metDisplay is kept for compatibility only and is unused by text display; stagedText and
// tokenDisplay still accept metStyle and ignore it.
export const metDisplay=(display,metStyle='kanji-above')=>display==='kana-kanji'&&metStyle==='furigana'?'kanji-reading':display;
// known (a Set of known track characters, or null/undefined with no track) only feeds isMastered.
export function stagedText(text,index,kw,{showAll=false,metStyle='kanji-above',known=null}={}){
 return resolveText(text,index).map(p=>p.token?{...p,display:tokenDisplay(kw,p.word?[p.word]:p.candidates,{showAll,written:p.written,index,metStyle,known})}:p);
}
// The display of one token from the words it may belong to (its word, or its candidates), as stagedText gives it. A token
// of no word (no IDs) is staged as a composite when its written form and the index are given, and is kana without them.
// The app keeps the IDs and the written form on each rendered token, so it can restage text in place when stages change.
export function tokenDisplay(kw,ids,{showAll=false,written=null,index=null,metStyle='kanji-above',known=null}={}){
 if(!showAll)return 'kana';
 const list=[...(ids??[])],opts={written,known};
 if(list.length||written===null||!index)return mostAdvanced(kw,list,opts);
 const parts=compositeWords(written,index);if(!parts?.length)return 'kana';
 let out='kanji';
 for(const p of parts){const d=mostAdvanced(kw,p,opts);if(RANK[d]<RANK[out])out=d;if(out==='kana')break;}
 return out;
}
// The words of each kanji in the written form of a token of no word: one list per distinct kanji, in order, and an empty
// list for a kanji no word contains (六 → []). null for a proper noun, which stays in kana. Cached on the index.
export function compositeWords(written,index){
 const w=String(written??''),cache=index?.composites;if(cache?.has(w))return cache.get(w);
 const out=index?.proper?.has(w)?null:Object.freeze(kanjiOf(w).map(ch=>index?.chars?.get(ch)??Object.freeze([])));
 cache?.set(w,out);return out;
}

// ── Saved state and backups ───────────────────────────────────────────────────────────────────────────────
// Strict reads (restore) reject the whole file; lenient reads (local state) drop what they cannot use. Missing state is
// empty. wordIds: the kanji word IDs (an array, a Set, or index.words); without it any slug ID is accepted.
function readEntry(e){
 if(!plainObject(e)||Object.keys(e).length!==ENTRY_KEYS.length||!ENTRY_KEYS.every(k=>own(e,k)))return null;
 const {met,points,pointDay,known,missed}=e;
 if(!isDay(met)||!Number.isInteger(points)||points<0||(pointDay!==null&&!isDay(pointDay))||(known!==null&&!isDay(known))||typeof missed!=='boolean')return null;
 // Points and a known day only come with a point gained on some day; only a known word can be missed.
 if(((points>0||known!==null)&&pointDay===null)||(missed&&known===null))return null;
 return {met,points,pointDay,known,missed};
}
export function readKanjiWords(value,{strict=false,wordIds}={}){
 const fail=msg=>{if(strict)throw Error(msg);},out=emptyKanjiWords(),raw=value?.kanjiWords;
 const ids=idSet(wordIds);
 if(raw===undefined||raw===null)return {kanjiWords:out};
 if(!plainObject(raw)||raw.version!==KANJI_WORDS_VERSION||!plainObject(raw.words)||Object.keys(raw).some(k=>k!=='version'&&k!=='words')){fail('This backup contains invalid kanji word records.');return {kanjiWords:out};}
 for(const [id,e] of Object.entries(raw.words)){
  const entry=SLUG.test(id)&&(!ids||ids.has(id))?readEntry(e):null;
  if(!entry){fail(`This backup contains an invalid kanji word record for ${id}.`);continue;}
  out.words[id]=entry;
 }
 return {kanjiWords:out};
}
function idSet(wordIds){return wordIds==null?null:typeof wordIds.has==='function'?wordIds:new Set(wordIds);}

/// ── Kanji cards ───────────────────────────────────────────────────────────────────────────────────────────
// The daily round on the Kanji page (docs/data-contract.md "Kanji cards"; learning-loop.md decision 18). The page's rules
// and each card's trial (three questions) are in kanji-cards.mjs, which calls this with size ROUND_SIZE, nine cards.
// cardRound(kw, index, vocabulary, {now, size, usable, rank, reviewKnown}) gives the local day's cards, one met kanji word each, as
// {day, cards: [{word}]}. Words not yet known come first: fewest passed trials (points), then the oldest last pass (a word
// with none first), then an order seeded by the day. Known words follow as review, the least recently passed first, then
// the day's order. Two met words with the same written form (出口 is deguchi and exit) give one card, and a word whose
// trial cannot be built (usable(id) false, e.g. too few other met words for its options) is left out. The same store,
// vocabulary and day always give the same round; the app stores it when the day's first round starts, so a reload
// resumes it. The policy's order and reviewKnown (kanji-policy.mjs) come in as rank and reviewKnown:
//  - rank: a Map id → position (courseRank, for order 'course'). Words not yet known still come before known ones; within
//    each, the words with a position come first, in position order, then the rest in the order above. null: the order
//    above alone.
//  - reviewKnown false leaves known words out of the round; the words still being learned keep the same order.
export const CARD_ROUND=10;
const KANA=/^[ぁ-ゖァ-ヺー]+$/;
// The whole kana reading of a word's markup: お{水|みず} → おみず, {食|た}べる → たべる, パン{屋|や} → パンや.
export const wordReading=word=>String(word??'').replace(RUBY_PATTERN,'$2');
const recordsOf=vocabulary=>vocabulary instanceof Map?vocabulary:new Map((Array.isArray(vocabulary)?vocabulary:[]).filter(w=>w&&typeof w.id==='string').map(w=>[w.id,w]));
// What a trial's option says for `ask`: the word's meaning (its vocabulary gloss), or its whole reading in kana (hiragana
// and katakana, so パン{屋|や} is パンや), or null when it has none.
export function cardText(id,ask,vocabulary){
 const w=recordsOf(vocabulary).get(id);if(!w)return null;
 if(ask==='meaning')return typeof w.meaning==='string'&&w.meaning.trim()?w.meaning:null;
 const r=ask==='reading'&&typeof w.word==='string'?wordReading(w.word):'';return KANA.test(r)?r:null;
}
// A seeded generator (FNV-1a of the text into mulberry32), so a day always draws the same numbers, and a seeded shuffle.
export function seeded(text){
 let h=2166136261;for(const c of String(text)){h^=c.codePointAt(0);h=Math.imul(h,16777619);}
 let a=h>>>0;return ()=>{a=(a+0x6D2B79F5)|0;let t=Math.imul(a^(a>>>15),1|a);t=(t+Math.imul(t^(t>>>7),61|t))^t;return ((t^(t>>>14))>>>0)/4294967296;};
}
export function shuffled(list,rand){const a=[...list];for(let i=a.length-1;i>0;i--){const j=Math.floor(rand()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
export function cardRound(kw,index,vocabulary,{now=Date.now(),size=CARD_ROUND,usable=()=>true,rank=null,reviewKnown=true}={}){
 const day=localDay(now),store=storeOf(kw),records=recordsOf(vocabulary);
 if(!day)return {day:null,cards:[]};
 const met=Object.keys(store.words).filter(id=>index?.words?.has(id)&&records.has(id)).sort();
 const seed=new Map(shuffled(met,seeded(`kanji-cards|${day}`)).map((id,k)=>[id,k])),last=id=>String(store.words[id].pointDay??'');
 const pos=id=>rank instanceof Map&&Number.isFinite(rank.get(id))?rank.get(id):Infinity;
 const order=[...met].sort((a,b)=>{
  const x=store.words[a],y=store.words[b],kx=x.known?1:0,ky=y.known?1:0,pa=pos(a),pb=pos(b);
  return kx-ky||(pa===pb?0:pa<pb?-1:1)||(kx?0:x.points-y.points)||last(a).localeCompare(last(b))||seed.get(a)-seed.get(b);
 });
 const cards=[],written=new Set();
 for(const id of order){
  if(cards.length>=size)break;
  if(!reviewKnown&&store.words[id].known)continue;
  const form=records.get(id).word;if(written.has(form)||!usable(id))continue;
  cards.push({word:id});written.add(form);
 }
 return {day,cards};
}

// The round as saved, state.kanjiCards = {version, day, cards, answers, finished}: the local day it was drawn for, its
// cards ({word}, as cardRound gives them), each card's answers so far (answers, by card position: one true or false per
// question answered, in order) and whether the round was finished that day. A trial has TRIAL_QUESTIONS questions; a card
// closes at its first false (failed) or after TRIAL_QUESTIONS trues (passed), and a card with fewer trues is a trial under
// way, resumed where it stopped. A replay clears the answers and keeps finished, so the day stays done. A new day draws a
// new round. Version 1 (one question a card, before 2026-10-23's three-question trial) reads as no round, so a new one is
// drawn.
// The card-closing rules are the policy's (kanji-policy.mjs rulesOf: {questions, closeOnMiss, passAt}), DEFAULT_RULES when
// not given: a card closes at its first false when closeOnMiss is true, and in any case once `questions` answers are in;
// it passes when it is closed with at least passAt trues. By DEFAULT_RULES (three questions, closeOnMiss, passAt three)
// that is the rule above: the first false fails it, three trues pass it.
export const KANJI_CARDS_VERSION=2;
export const TRIAL_QUESTIONS=3;
export const DEFAULT_RULES=Object.freeze({questions:TRIAL_QUESTIONS,closeOnMiss:true,passAt:TRIAL_QUESTIONS});
const ROUND_KEYS=['version','day','cards','answers','finished'];
export const emptyKanjiCards=()=>({version:KANJI_CARDS_VERSION,day:null,cards:[],answers:{},finished:false});
export const startRound=round=>({version:KANJI_CARDS_VERSION,day:round?.day??null,cards:(Array.isArray(round?.cards)?round.cards:[]).map(c=>({word:c.word})),answers:{},finished:false});
// Card i's answers so far, and whether it is closed (failed or passed) and passed.
export const cardAnswers=(kc,i)=>own(kc?.answers,String(i))&&Array.isArray(kc.answers[i])?kc.answers[i]:[];
export const cardClosed=(kc,i,rules=DEFAULT_RULES)=>{const a=cardAnswers(kc,i);return (rules.closeOnMiss&&a.includes(false))||a.length>=rules.questions;};
export const cardPassed=(kc,i,rules=DEFAULT_RULES)=>cardClosed(kc,i,rules)&&cardAnswers(kc,i).filter(x=>x===true).length>=rules.passAt;
// The next question of card i answered right (true) or wrong (false). A closed card, an unknown card or an answer that is
// not true or false changes nothing.
export function answerCard(kc,i,right,rules=DEFAULT_RULES){
 const card=kc?.cards?.[i];
 if(!card||typeof right!=='boolean'||cardClosed(kc,i,rules))return kc;
 return {...kc,answers:{...kc.answers,[i]:[...cardAnswers(kc,i),right]}};
}
// {total, answered, right, complete}: answered counts closed cards, right the passed ones; complete once every card is
// closed.
export function roundResult(kc,rules=DEFAULT_RULES){
 const cards=Array.isArray(kc?.cards)?kc.cards:[];let answered=0,right=0;
 cards.forEach((c,i)=>{if(!cardClosed(kc,i,rules))return;answered++;if(cardPassed(kc,i,rules))right++;});
 return {total:cards.length,answered,right,complete:cards.length>0&&answered===cards.length};
}
export const finishRound=(kc,rules=DEFAULT_RULES)=>roundResult(kc,rules).complete&&kc.finished!==true?{...kc,finished:true}:kc;
export const replayRound=kc=>plainObject(kc?.answers)&&Object.keys(kc.answers).length?{...kc,answers:{}}:kc;
// Today's round is done once it was finished on the local day of `now`.
export const roundDone=(kc,now=Date.now())=>kc?.finished===true&&!!kc.day&&kc.day===localDay(now);
// Strict reads (restore) reject the whole file; lenient reads (local state) drop a round they cannot use, so a new one is
// drawn. A save or backup without kanjiCards, or with a version 1 round, reads as empty, and so does a round holding a
// {char} card (the first course build's daily character trial, retired with the kanji sets on 2026-10-29), strict and
// lenient alike, so that build's backups still restore. wordIds as for readKanjiWords. rules (DEFAULT_RULES when not
// given): a card's answers are at most rules.questions long, and only a closeOnMiss policy faults an answer after a false.
const retiredRound=raw=>plainObject(raw)&&Array.isArray(raw.cards)&&raw.cards.some(c=>own(c,'char'));
function readCard(c,ids){
 if(!plainObject(c)||Object.keys(c).length!==1||!own(c,'word'))return null;
 return typeof c.word==='string'&&SLUG.test(c.word)&&(!ids||ids.has(c.word))?{word:c.word}:null;
}
const readAnswers=(v,rules)=>Array.isArray(v)&&v.length>=1&&v.length<=rules.questions&&v.every(x=>typeof x==='boolean')&&!(rules.closeOnMiss&&v.slice(0,-1).includes(false))?[...v]:null;
export function readKanjiCards(value,{strict=false,wordIds,rules=DEFAULT_RULES}={}){
 const raw=value?.kanjiCards,ids=idSet(wordIds),empty={kanjiCards:emptyKanjiCards()};
 if(raw===undefined||raw===null||(plainObject(raw)&&raw.version===1)||retiredRound(raw))return empty;
 const bad=()=>{if(strict)throw Error('This backup contains an invalid Kanji cards round.');return empty;};
 if(!plainObject(raw)||raw.version!==KANJI_CARDS_VERSION||Object.keys(raw).length!==ROUND_KEYS.length||!ROUND_KEYS.every(k=>own(raw,k)))return bad();
 if((raw.day!==null&&!isDay(raw.day))||!Array.isArray(raw.cards)||raw.cards.length>CARD_ROUND*5||!plainObject(raw.answers)||typeof raw.finished!=='boolean')return bad();
 const cards=raw.cards.map(c=>readCard(c,ids));if(cards.some(c=>!c))return bad();
 if(raw.day===null&&(cards.length||Object.keys(raw.answers).length||raw.finished))return bad();
 const answers={};
 for(const [k,v] of Object.entries(raw.answers)){
  const a=readAnswers(v,rules);
  if(!/^(0|[1-9]\d*)$/.test(k)||Number(k)>=cards.length||!a)return bad();
  answers[k]=a;
 }
 return {kanjiCards:{version:KANJI_CARDS_VERSION,day:raw.day,cards,answers,finished:raw.finished}};
}
