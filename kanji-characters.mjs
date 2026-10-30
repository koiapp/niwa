// The kanji sets: a profile's book kanji, ten a lesson, on the Kanji page. The course profile's lessons.json carries them as
// kanji.characters (にほんごチャレンジ N4・N5 かんじ: 310 kanji in 31 lessons of ten); the personal profile has none, so its
// track is empty and nothing here runs for it. Pure: no DOM, no clock (days come in through `now`), and it imports only
// kanji-words.mjs. Spec: docs/data-contract.md "Kanji sets" (2026-10-29).
//
// Content: kanji.characters = {version: 1, lessons: [{id, part, number, title, en, kanji: [character]}]}, a character being
// {char, number, meanings, on, kun, story, words, special?, sentences, lookAlikes}; each word and special reading carries
// `markup`, the word as app markup with one {written|reading} token per kanji wherever the reading splits ({山|やま}{田|だ}
// さん), so the app can colour the target kanji's own reading red, and may carry `alsoRead`, the written form's other right
// readings (the set practice never offers them as wrong). characterProblems lists every fault (the validator fails
// on each); readKanjiCharacters gives the frozen track, strict (throws on the first problem) or lenient (the app: drops a
// bad character or lesson, keeps the listed order when the numbering is broken).
//
// A book lesson is a set. The learner reads its kanji one at a time (the board shows the read ones, the next one, and
// paper for the rest), then practises the set (kanji-practice.mjs: five questions a kanji); the first finished practice
// marks the set done and opens the next. Mastery is undefined for now (owner, 2026-10-29): nothing records points or
// known, knownChars is always empty, and the plain-kanji reward in kanji-words.mjs stays wired through it, inert.
//
// State: state.kanjiChars = {version: 2, chars: {[char]: {met}}, sets: {[lessonId]: {done}}, run: null | {set, seed,
// answers}}: met the day a character's reading pages were finished, done the day a set's practice was first finished, run
// the set practice under way (its questions rebuilt from the seed, so a reload resumes at answers.length). A version 1
// store (the first course build's daily trials: {met, points, pointDay, known}) migrates by keeping each met day.
import {localDay,wordReading,kanjiOf} from './kanji-words.mjs';
export {kanjiOf};
// The content block's version (kanji.characters) and the learner state's (state.kanjiChars).
export const KANJI_CHARS_VERSION=1;
export const KANJI_STATE_VERSION=2;
const TRACK_KEYS=['version','lessons'];
const LESSON_KEYS=['id','part','number','title','en','kanji'];
const CHAR_KEYS=['char','number','meanings','on','kun','story','words','special','sentences','lookAlikes'];
const READING_KEYS=['kana','romaji','variants'];
const WORD_KEYS=['written','reading','markup','romaji','en','alsoRead','core'];
const SPECIAL_KEYS=['written','reading','markup','romaji','en','alsoRead'];
const SENTENCE_KEYS=['ja','mark','en','distractors'];
const V1_ENTRY_KEYS=['met','points','pointDay','known'];
const STATE_KEYS=['version','chars','sets','run'];
const RUN_KEYS=['set','seed','answers'];
const SLUG=/^[a-z][a-z0-9-]*$/;
const DAY=/^(\d{4})-(\d{2})-(\d{2})$/;
const HAN=/^\p{Script=Han}$/u;
const HAN_ANY=/\p{Script=Han}/u;
const KATAKANA=/^[ァ-ヺー]+$/;
const KUN=/^[ぁ-ゖ]+(?:-[ぁ-ゖ]+)?$/;
const KANA=/^[ぁ-ゖァ-ヺー]+$/;
const DIGITS=/^[0-9０-９]+$/;
const DIGIT_ANY=/[0-9０-９]/;
const HAN_RUN=/^\p{Script=Han}+$/u;
const VARIANT=/^(?:-[ぁ-ゖァ-ヺー]+|[ぁ-ゖァ-ヺー]+-)$/;
const ROMAJI=/^(?=.*[a-z])[a-z'-]+$/;
const TOKEN=/\{([^|{}]+)\|([^{}]+)\}/g;
const plainObject=v=>!!v&&typeof v==='object'&&!Array.isArray(v);
const own=(o,k)=>plainObject(o)&&Object.prototype.hasOwnProperty.call(o,k);
const text=v=>typeof v==='string'&&v.trim().length>0;
const oneHan=v=>typeof v==='string'&&[...v].length===1&&HAN.test(v);
const isDay=v=>{
 const m=typeof v==='string'&&DAY.exec(v);if(!m)return false;
 const d=new Date(2000,0,1,12);d.setFullYear(+m[1],+m[2]-1,+m[3]);
 return d.getFullYear()===+m[1]&&d.getMonth()===+m[2]-1&&d.getDate()===+m[3];
};
// A deep copy of JSON data, frozen all the way down.
const frozen=v=>Array.isArray(v)?Object.freeze(v.map(frozen)):plainObject(v)?Object.freeze(Object.fromEntries(Object.entries(v).map(([k,x])=>[k,frozen(x)]))):v;

// ── Markup ─────────────────────────────────────────────────────────────────────────────────────────────────
// A sentence's markup read one way: each {written|reading} token as its written form (plainWritten: ふじ{山|さん} → ふじ山)
// or as its reading (plainReading: → ふじさん, kanji-words.mjs wordReading). kanjiOf: the distinct Han characters, 々 left out.
export const plainWritten=markup=>String(markup??'').replace(TOKEN,'$1');
export const plainReading=markup=>wordReading(markup);
const tokensIn=markup=>[...String(markup??'').matchAll(TOKEN)];
// A markup string as its pieces in order, [{text, reading}]: a token is its written form with its reading, plain text
// between tokens has reading null. wordTokens('{山|やま}{田|だ}さん') → [{山, やま}, {田, だ}, {さん, null}].
export function wordTokens(markup){
 const s=String(markup??''),out=[];let at=0;
 for(const t of s.matchAll(TOKEN)){if(t.index>at)out.push({text:s.slice(at,t.index),reading:null});out.push({text:t[1],reading:t[2]});at=t.index+t[0].length;}
 if(at<s.length)out.push({text:s.slice(at),reading:null});
 return out;
}

// ── The content block ──────────────────────────────────────────────────────────────────────────────────────
const keysProblems=(o,keys,name)=>Object.keys(o).filter(k=>!keys.includes(k)).map(k=>`${name}: ${k} is not a field`);
function readingProblems(list,kind,name){
 if(!Array.isArray(list))return [`${name}: ${kind} must be a list`];
 const out=[],shape=kind==='on'?KATAKANA:KUN,script=kind==='on'?'katakana':'hiragana (one - before the okurigana)';
 list.forEach((r,k)=>{
  const at=`${name}: ${kind} ${k+1}`;
  if(!plainObject(r)){out.push(`${at} must be an object`);return;}
  out.push(...keysProblems(r,READING_KEYS,at));
  if(typeof r.kana!=='string'||!shape.test(r.kana))out.push(`${at}: kana must be ${script}`);
  if(typeof r.romaji!=='string'||!ROMAJI.test(r.romaji))out.push(`${at}: romaji must be lower-case letters, - and ' only`);
  if(!own(r,'variants'))return;
  if(!Array.isArray(r.variants)){out.push(`${at}: variants must be a list`);return;}
  r.variants.forEach((v,j)=>{
   const vat=`${at} variant ${j+1}`;
   if(!plainObject(v)){out.push(`${vat} must be an object`);return;}
   out.push(...keysProblems(v,['kana','romaji'],vat));
   if(typeof v.kana!=='string'||!VARIANT.test(v.kana))out.push(`${vat}: kana must be kana with a leading or trailing -`);
   if(own(v,'romaji')&&(typeof v.romaji!=='string'||!ROMAJI.test(v.romaji)))out.push(`${vat}: romaji must be lower-case letters, - and ' only`);
  });
 });
 return out;
}
// A word's or special reading's markup (required): it reads back as written and reading exactly;
// every kanji and every digit is inside a token, and only kana outside; a token's written form is one run of kanji (one
// kanji, or a run whose reading does not split: {今日|きょう}) or one run of digits, never kana; its reading is kana; and
// one token's written form holds the character. Splitting one kanji a token wherever the reading splits is the author's
// rule (the checker's report), not tested here.
function markupProblems(w,ch,at){
 const m=w.markup;
 if(!text(m))return [`${at}: markup must be a non-empty string`];
 const out=[],outside=m.replace(TOKEN,'');
 if(/[{}|]/.test(outside))return [`${at}: malformed markup ${m}`];
 if(typeof w.written==='string'&&plainWritten(m)!==w.written)out.push(`${at}: markup ${m} does not read back as ${w.written}`);
 if(typeof w.reading==='string'&&plainReading(m)!==w.reading)out.push(`${at}: markup ${m} does not read back as ${w.reading}`);
 if(HAN_ANY.test(outside)||DIGIT_ANY.test(outside))out.push(`${at}: every kanji and digit of ${m} must be inside a {written|reading} token`);
 for(const t of tokensIn(m)){
  if(!HAN_RUN.test(t[1])&&!DIGITS.test(t[1]))out.push(`${at}: the token ${t[0]} must hold one run of kanji or one run of digits, never kana`);
  if(!KANA.test(t[2]))out.push(`${at}: the reading of ${t[0]} must be kana`);
 }
 if(!tokensIn(m).some(t=>t[1].includes(ch)))out.push(`${at}: markup ${m} must hold a token written with ${ch}`);
 return out;
}
// A word's or special reading's optional alsoRead: the other right readings of its written form (私 わたし: ['わたくし']),
// which the set practice never offers as a wrong one. One or more distinct kana strings, none the entry's reading.
function alsoReadProblems(w,at){
 const a=w.alsoRead;
 if(!Array.isArray(a)||!a.length)return [`${at}: alsoRead must list one or more readings`];
 const out=[];
 if(!a.every(v=>typeof v==='string'&&KANA.test(v)))out.push(`${at}: alsoRead must be kana only`);
 if(new Set(a).size!==a.length)out.push(`${at}: alsoRead must be distinct`);
 if(typeof w.reading==='string'&&a.includes(w.reading))out.push(`${at}: alsoRead repeats the reading ${w.reading}`);
 return out;
}
function wordProblems(list,ch,name,{special=false}={}){
 const kind=special?'special':'words';
 if(!Array.isArray(list))return [`${name}: ${kind} must be a list`];
 if(!special&&!list.length)return [`${name}: words must list at least one word`];
 const out=[];let plain=false;
 list.forEach((w,k)=>{
  const at=`${name}: ${special?'special reading':'word'} ${k+1}`;
  if(!plainObject(w)){out.push(`${at} must be an object`);return;}
  out.push(...keysProblems(w,special?SPECIAL_KEYS:WORD_KEYS,at));
  if(!text(w.written))out.push(`${at}: written must be a non-empty string`);
  else if(!special&&!w.written.includes(ch))out.push(`${at}: ${w.written} does not contain ${ch}`);
  if(typeof w.reading!=='string'||!KANA.test(w.reading))out.push(`${at}: reading must be kana only`);
  if(typeof w.romaji!=='string'||!ROMAJI.test(w.romaji))out.push(`${at}: romaji must be lower-case letters, - and ' only`);
  if(!text(w.en))out.push(`${at}: en must be a non-empty string`);
  out.push(...markupProblems(w,ch,at));
  if(own(w,'alsoRead'))out.push(...alsoReadProblems(w,at));
  if(special)return;
  if(typeof w.core!=='boolean')out.push(`${at}: core must be true or false`);
  else if(w.core&&plain)out.push(`${at}: core words come first`);
  else if(!w.core)plain=true;
 });
 return out;
}
// A sentence's problems. position: Map char → its place in the track (1, 2 …); last: the place of its lesson's last kanji.
function sentenceProblems(x,k,ch,name,position,last){
 const at=`${name}: sentence ${k+1}`;
 if(!plainObject(x))return [`${at} must be an object`];
 const out=keysProblems(x,SENTENCE_KEYS,at);
 if(!text(x.en))out.push(`${at}: en must be a non-empty string`);
 if(!text(x.ja)){out.push(`${at}: ja must be a non-empty string`);return out;}
 const outside=x.ja.replace(TOKEN,'');
 if(HAN_ANY.test(outside))out.push(`${at}: every kanji must be inside a {written|reading} token`);
 if(/[{}|]/.test(outside))out.push(`${at}: malformed markup`);
 for(const t of tokensIn(x.ja))if(!KANA.test(t[2]))out.push(`${at}: the reading of ${t[0]} must be kana`);
 for(const c of kanjiOf(plainWritten(x.ja))){
  if(!position.has(c))out.push(`${at}: ${c} is not a track kanji, so it is written in kana`);
  else if(position.get(c)>last)out.push(`${at}: ${c} comes later in the track than this lesson, so it is written in kana`);
 }
 let answer=null;
 if(!text(x.mark))out.push(`${at}: mark must be a non-empty string`);
 else if(x.ja.split(x.mark).length!==2)out.push(`${at}: mark must occur in ja exactly once`);
 else if(!tokensIn(x.mark).length)out.push(`${at}: mark must hold a {written|reading} token`);
 else if(!tokensIn(x.mark).some(t=>t[1].includes(ch)))out.push(`${at}: mark must hold a token written with ${ch}`);
 else if(!KANA.test(plainReading(x.mark)))out.push(`${at}: the mark’s reading must be kana only`);
 else answer=plainReading(x.mark);
 const d=x.distractors;
 if(!Array.isArray(d)||d.length<3)out.push(`${at}: distractors must list at least 3 readings`);
 else{
  if(!d.every(v=>typeof v==='string'&&KANA.test(v)))out.push(`${at}: distractors must be kana only`);
  if(new Set(d).size!==d.length)out.push(`${at}: distractors must be distinct`);
  if(answer!==null&&d.includes(answer))out.push(`${at}: a distractor is the answer ${answer}`);
 }
 return out;
}
// A character's own problems (not its number, which the track checks).
function characterOwnProblems(c,name,position,last){
 const out=keysProblems(c,CHAR_KEYS,name),ch=c.char;
 if(!Array.isArray(c.meanings)||!c.meanings.length||!c.meanings.every(text))out.push(`${name}: meanings must list non-empty strings`);
 out.push(...readingProblems(c.on,'on',name),...readingProblems(c.kun,'kun',name));
 if(Array.isArray(c.on)&&Array.isArray(c.kun)&&!c.on.length&&!c.kun.length)out.push(`${name}: on and kun cannot both be empty`);
 if(!text(c.story))out.push(`${name}: story must be a non-empty string`);
 out.push(...wordProblems(c.words,ch,name));
 if(own(c,'special'))out.push(...wordProblems(c.special,ch,name,{special:true}));
 if(!Array.isArray(c.sentences)||c.sentences.length<2)out.push(`${name}: sentences must list at least 2 sentences`);
 else c.sentences.forEach((x,k)=>out.push(...sentenceProblems(x,k,ch,name,position,last)));
 const la=c.lookAlikes;
 if(!Array.isArray(la)||la.length<3)out.push(`${name}: lookAlikes must list at least 3 kanji`);
 else if(!la.every(oneHan)||new Set(la).size!==la.length||la.includes(ch))out.push(`${name}: lookAlikes must be distinct single kanji other than ${ch}`);
 return out;
}
// The block resolved: {problems, lessons: [{lesson (raw), kanji: [{raw, position}]}] (what a lenient read keeps), last
// (Map lesson id → the place of its last kanji)}. Each problem is {text, drop}: drop is false for the numbering (lesson
// and kanji numbers), which a lenient read forgives by keeping the listed order.
function resolveCharacters(raw){
 const problems=[],add=(text,drop=true)=>problems.push({text,drop}),kept=[];
 if(raw===undefined||raw===null)return {problems,kept,usable:true};
 if(!plainObject(raw)){add('it must be an object');return {problems,kept,usable:false};}
 for(const k of Object.keys(raw))if(!TRACK_KEYS.includes(k))add(`${k} is not a field`,false);
 if(raw.version!==KANJI_CHARS_VERSION)add(`version must be ${KANJI_CHARS_VERSION}`);
 if(!Array.isArray(raw.lessons)){add('lessons must be a list');return {problems,kept,usable:false};}
 const usable=raw.version===KANJI_CHARS_VERSION;
 // Places: every listed character object gets the next place, so a lesson's last place and each char's place are known
 // before any sentence is read.
 const lessons=raw.lessons.map(l=>({l,list:Array.isArray(l?.kanji)?l.kanji:[]}));
 let place=0;const position=new Map();
 for(const x of lessons){x.places=x.list.map(c=>{place++;if(oneHan(c?.char)&&!position.has(c.char))position.set(c.char,place);return place;});x.last=x.places.at(-1)??place;}
 const ids=new Set(),seen=new Set(),next={};let part=1;
 for(const [li,{l,list,places,last}] of lessons.entries()){
  if(!plainObject(l)){add(`lesson ${li+1} must be an object`);continue;}
  const name=SLUG.test(String(l.id))?String(l.id):`lesson ${li+1}`;let bad=false;
  const fault=t=>{add(t);bad=true;};
  for(const k of Object.keys(l))if(!LESSON_KEYS.includes(k))fault(`${name}: ${k} is not a lesson field`);
  if(!SLUG.test(String(l.id??''))||typeof l.id!=='string')fault(`lesson ${li+1} must have a slug id`);
  else if(ids.has(l.id))fault(`${name} is listed twice`);
  if(l.part!==1&&l.part!==2)fault(`${name}: part must be 1 or 2`);
  else{
   if(l.part<part)add(`${name}: lessons must be listed in part order`,false);
   part=Math.max(part,l.part);next[l.part]??=1;
   if(l.number!==next[l.part])add(`${name}: number must be ${next[l.part]} (lessons are numbered from 1 within their part)`,false);
   next[l.part]=(Number.isInteger(l.number)?l.number:next[l.part])+1;
  }
  if(!text(l.title))fault(`${name}: title must be a non-empty string`);
  if(!text(l.en))fault(`${name}: en must be a non-empty string`);
  if(!Array.isArray(l.kanji)||!l.kanji.length)fault(`${name}: kanji must list at least one character`);
  if(typeof l.id==='string')ids.add(l.id);
  const chars=[];
  list.forEach((c,k)=>{
   const at=places[k];
   if(!plainObject(c)){add(`${name}: kanji ${k+1} must be an object`);return;}
   if(!oneHan(c.char)){add(`${name}: kanji ${k+1} must be one kanji`);return;}
   const cname=`${name} ${c.char}`;
   if(seen.has(c.char)){add(`${cname} is listed twice`);return;}
   seen.add(c.char);
   if(c.number!==at)add(`${cname}: number must be ${at} (the track’s numbers run 1, 2, 3 … in order)`,false);
   const faults=characterOwnProblems(c,cname,position,last);
   for(const p of faults)add(p);
   if(!faults.length)chars.push({raw:c,position:at});
  });
  if(!bad)kept.push({lesson:l,kanji:chars,last});
 }
 return {problems,kept,usable};
}
// Every problem of a raw kanji.characters, for the validator: empty for an absent (undefined or null) block or a valid one.
export const characterProblems=raw=>resolveCharacters(raw).problems.map(p=>p.text);
const EMPTY_TRACK=Object.freeze({version:KANJI_CHARS_VERSION,lessons:Object.freeze([]),chars:new Map(),order:Object.freeze([]),count:0});
// The content's track (content.kanji.characters): frozen {version, lessons, chars, order, count}. lessons: the lessons, each
// with its kanji as their entries; chars: Map char → entry, the character's fields plus {lesson (its lesson's id), part,
// lessonNumber, last (the number of its lesson's last kanji)}; order: the entries in track order (the book's numbers, or
// the listed order when a lenient read keeps broken numbering); count: how many. An absent block is the empty track (count
// 0). Strict throws on the first problem; lenient drops a bad character or lesson, and the whole track when the block is not
// a version 1 object with a list of lessons.
export function readKanjiCharacters(content,{strict=false}={}){
 const {problems,kept,usable}=resolveCharacters(content?.kanji?.characters);
 if(strict&&problems.length)throw Error(`This content has an invalid kanji character track: ${problems[0].text}.`);
 if(!usable||!kept.length)return EMPTY_TRACK;
 const chars=new Map(),order=[],lessons=[];
 for(const {lesson:l,kanji,last} of kept){
  const entries=kanji.map(({raw})=>{const e=frozen({...raw,lesson:l.id,part:l.part,lessonNumber:l.number,last});chars.set(e.char,e);order.push(e);return e;});
  lessons.push(Object.freeze({...frozen({...l,kanji:[]}),kanji:Object.freeze(entries)}));
 }
 if(!order.length)return EMPTY_TRACK;
 return Object.freeze({version:KANJI_CHARS_VERSION,lessons:Object.freeze(lessons),chars,order:Object.freeze(order),count:order.length});
}
export const hasTrack=track=>Number.isInteger(track?.count)&&track.count>0;


// ── Learner state ─────────────────────────────────────────────────────────────────────────────────────────
// state.kanjiChars, version 2: {version, chars: {[char]: {met}}, sets: {[lessonId]: {done}}, run: null | {set, seed,
// answers: [true|false …]}}. A store in that shape is used as it is; anything else is read leniently first (a version 1
// store migrates, a broken one is empty), so every function below takes whatever the caller holds.
export const emptyKanjiChars=()=>({version:KANJI_STATE_VERSION,chars:{},sets:{},run:null});
const canonical=kc=>plainObject(kc)&&kc.version===KANJI_STATE_VERSION&&plainObject(kc.chars)&&plainObject(kc.sets)&&(kc.run===null||plainObject(kc.run));
const storeOf=kc=>canonical(kc)?kc:readKanjiChars({kanjiChars:kc}).kanjiChars;
const entryOf=(kc,ch)=>own(kc?.chars,ch)&&plainObject(kc.chars[ch])?kc.chars[ch]:null;
const idSet=v=>v==null?null:typeof v.has==='function'?v:new Set(v);
// unmet (no entry) or met (its reading pages finished). 'known' stays in the union for when mastery is defined; nothing
// gives it now.
export function charStage(kc,ch){return entryOf(kc,ch)?.met?'met':'unmet';}
// Records that the character's reading pages were finished today. A character already met keeps its day: the same store.
export function markCharMet(kc,ch,now){
 const base=storeOf(kc),day=localDay(now);
 if(!oneHan(ch)||!day||entryOf(base,ch))return base;
 return {...base,chars:{...base.chars,[ch]:{met:day}}};
}
// The characters known on the track: none while mastery is undefined. kanji-words.mjs isMastered still takes this Set, so
// the plain-kanji reward needs no re-plumbing once mastery is defined.
export const knownChars=()=>new Set();
export const metChars=kc=>new Set(Object.entries(storeOf(kc).chars).filter(([,e])=>plainObject(e)&&e.met).map(([ch])=>ch));
const exactKeys=(o,keys)=>plainObject(o)&&Object.keys(o).length===keys.length&&keys.every(k=>own(o,k));
// A version 2 entry: exactly {met: a real day}.
const readEntry=e=>exactKeys(e,['met'])&&isDay(e.met)?{met:e.met}:null;
// A version 1 entry ({met, points, pointDay, known}, by its own rules then), as the version 2 entry of its met day.
function readV1Entry(e){
 if(!exactKeys(e,V1_ENTRY_KEYS))return null;
 const {met,points,pointDay,known}=e;
 if(!isDay(met)||!Number.isInteger(points)||points<0||(pointDay!==null&&!isDay(pointDay))||(known!==null&&!isDay(known)))return null;
 if((points>0||known!==null)&&pointDay===null)return null;
 return {met};
}
const readSet=e=>exactKeys(e,['done'])&&isDay(e.done)?{done:e.done}:null;
function readRun(r,ids){
 if(!exactKeys(r,RUN_KEYS)||typeof r.set!=='string'||!SLUG.test(r.set)||(ids&&!ids.has(r.set)))return null;
 if(!text(r.seed)||!Array.isArray(r.answers)||!r.answers.every(a=>typeof a==='boolean'))return null;
 return {set:r.set,seed:r.seed,answers:[...r.answers]};
}
// state.kanjiChars from a save (lenient, local load) or a backup (strict, restore): {kanjiChars}. Missing is empty. chars
// (a Set or Map of the track's characters) and sets (the track's lesson ids: an array, Set or Map), when given, make a
// record of another character or set a fault. A version 1 store migrates, strict and lenient alike, keeping each entry's
// met day (sets {}, run null), so a backup from the first course build restores. Strict throws on another version, extra
// keys, a malformed entry, set or run, or an unknown character or set; lenient drops what it cannot use (a bad run is
// null, and a store that is not an object of a known version is empty).
export function readKanjiChars(value,{strict=false,chars=null,sets=null}={}){
 const msg='This backup contains invalid kanji character records.',fail=()=>{if(strict)throw Error(msg);},out=emptyKanjiChars(),raw=value?.kanjiChars;
 if(raw===undefined||raw===null)return {kanjiChars:out};
 const v1=plainObject(raw)&&raw.version===1,keys=v1?['version','chars']:STATE_KEYS;
 if(!plainObject(raw)||(raw.version!==1&&raw.version!==KANJI_STATE_VERSION)||!plainObject(raw.chars)||Object.keys(raw).some(k=>!keys.includes(k))){fail();return {kanjiChars:out};}
 const known=idSet(chars),setIds=idSet(sets);
 for(const [ch,e] of Object.entries(raw.chars)){
  const entry=oneHan(ch)&&(!known||known.has(ch))?(v1?readV1Entry:readEntry)(e):null;
  if(!entry){fail();continue;}
  out.chars[ch]=entry;
 }
 if(v1)return {kanjiChars:out};
 if(raw.sets!==undefined){
  if(!plainObject(raw.sets))fail();
  else for(const [id,e] of Object.entries(raw.sets)){
   const entry=SLUG.test(id)&&(!setIds||setIds.has(id))?readSet(e):null;
   if(!entry){fail();continue;}
   out.sets[id]=entry;
  }
 }
 if(raw.run!==undefined&&raw.run!==null){const run=readRun(raw.run,setIds);if(!run)fail();out.run=run;}
 return {kanjiChars:out};
}

// ── Sets ──────────────────────────────────────────────────────────────────────────────────────────────────
// A set is one book lesson of the track (its id, its kanji in book order). Everything below takes the frozen track and
// the store. The questions of a set's practice are built from a list of character entries (kanji-practice.mjs), not from
// a set id, so a later cumulative practice is another list under another run.set tag (not built).
const setAt=(track,id)=>(track?.lessons??[]).findIndex(l=>l.id===id);
const isDone=(kc,id)=>!!(own(kc?.sets,id)&&kc.sets[id]?.done);
// locked, reading, ready or done: done once its practice was finished; else locked while the set before it in track order
// is not done (the first set never is); else ready when every one of its kanji is met (the practice may start); else
// reading. null for an unknown id. Sensei mode (opts.openAll) locks no set: it is reading, ready or done by the store.
export function setStatus(track,kc,id,opts={}){
 const at=setAt(track,id);if(at<0)return null;
 const base=storeOf(kc),l=track.lessons[at];
 if(isDone(base,id))return 'done';
 if(!opts?.openAll&&at>0&&!isDone(base,track.lessons[at-1].id))return 'locked';
 return l.kanji.every(e=>charStage(base,e.char)==='met')?'ready':'reading';
}
// The sets in track order: [{id, part, number, title, en, status, read (its met kanji), total (its kanji)}].
export function setList(track,kc,opts={}){
 const base=storeOf(kc);
 return (track?.lessons??[]).map(l=>({id:l.id,part:l.part,number:l.number,title:l.title,en:l.en,status:setStatus(track,base,l.id,opts),read:l.kanji.filter(e=>charStage(base,e.char)==='met').length,total:l.kanji.length}));
}
// The first set not done (the one the learner is on), or null when every set is done.
export function currentSet(track,kc){
 const base=storeOf(kc);
 return (track?.lessons??[]).find(l=>!isDone(base,l.id))?.id??null;
}
// The set's board, [{char, state}] in its order: a met character is read; the first unmet one is next; every later unmet
// one is hidden (plain paper). Sensei mode (opts.openAll) makes every later unmet one later instead: plain paper too, but
// it opens its reading pages, so the kanji can be read in any order. Empty for an unknown id.
export function boardCells(track,kc,id,opts={}){
 const at=setAt(track,id);if(at<0)return [];
 const base=storeOf(kc);let next=false;
 return track.lessons[at].kanji.map(e=>{
  if(charStage(base,e.char)==='met')return {char:e.char,state:'read'};
  if(!next){next=true;return {char:e.char,state:'next'};}
  return {char:e.char,state:opts?.openAll?'later':'hidden'};
 });
}
// Starts the set's practice: run {set: id, seed, answers: []}, replacing any run. The same store for a bad id or seed.
export function startRun(kc,id,seed){
 const base=storeOf(kc);
 if(typeof id!=='string'||!SLUG.test(id)||!text(String(seed??'')))return base;
 return {...base,run:{set:id,seed:String(seed),answers:[]}};
}
// One answer of the run (correct === true for a right one), appended; the same store when there is no run.
export function answerRun(kc,correct){
 const base=storeOf(kc);if(!base.run)return base;
 return {...base,run:{...base.run,answers:[...base.run.answers,correct===true]}};
}
// Finishes the run: its set is done today unless it was done before (the first finish keeps its day), and the run is
// cleared. The same store when there is no run or `now` is not a time. Wrong answers count too: there is no pass mark.
export function finishRun(kc,now){
 const base=storeOf(kc),day=localDay(now);if(!base.run||!day)return base;
 const id=base.run.set;
 return {...base,sets:isDone(base,id)?base.sets:{...base.sets,[id]:{done:day}},run:null};
}
// The run under way, or null.
export const runOf=kc=>storeOf(kc).run??null;
// The sets that were locked in `before` and are not in `after` (for the finish screen's unlock reveal and its notice):
// with sets done in order, the one after the set just finished. In Sensei mode (opts.openAll) nothing is locked, so none.
export function setsOpened(track,before,after,opts={}){
 return (track?.lessons??[]).filter(l=>setStatus(track,before,l.id,opts)==='locked'&&setStatus(track,after,l.id,opts)!=='locked').map(l=>l.id);
}
