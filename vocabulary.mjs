// Shared vocabulary records, explicit contextual occurrences, discovery state, dictionary preferences and reading evidence.
// Pure functions only: used by app.js in the browser, tools/validate.mjs and tests/vocabulary.test.mjs.
import {review,enterMemory,seedMemory,validMemory,cleanMemory,eventOf} from './schedule.mjs?b=6ad91f7';
export const RUBY_PATTERN=/\{([^|{}]+)\|([^{}]+)\}/g;
export const PACKS=['core','plus1','reading'];
export const DICTIONARY_FIELDS=[
 {id:'reading',label:'Kana reading'},
 {id:'gloss',label:'Short English gloss'},
 {id:'definition',label:'Definition'},
 {id:'written',label:'Written form'},
 {id:'example',label:'Example sentence'},
 {id:'forms',label:'Forms'}
];
export const DEFAULT_FIELDS=['reading','gloss','definition'];
const FIELD_IDS=new Set(DICTIONARY_FIELDS.map(f=>f.id));
const OCCURRENCE_KEYS=new Set(['path','start','end','surface','word','sense','form']);
const SLUG=/^[a-z][a-z0-9-]*$/;
const KANA=/^[ぁ-ゖァ-ヺー]+$/;
const own=(o,k)=>!!o&&typeof o==='object'&&Object.prototype.hasOwnProperty.call(o,k);
const text=v=>typeof v==='string'&&v.trim().length>0;

export const plainWritten=s=>String(s??'').replace(RUBY_PATTERN,'$1');
export const plainReading=s=>String(s??'').replace(RUBY_PATTERN,'$2');
export const toHiragana=s=>String(s??'').replace(/[ァ-ヶ]/g,c=>String.fromCharCode(c.charCodeAt(0)-0x60));
const fold=s=>toHiragana(String(s??'').normalize('NFKC').toLowerCase()).trim();
const wellFormed=s=>!/[{}|]/.test(String(s).replace(RUBY_PATTERN,''));

export function indexWords(words){return new Map((words||[]).map(w=>[w.id,w]));}
export function fieldLabel(id){return DICTIONARY_FIELDS.find(f=>f.id===id)?.label||id;}

// [start,end) spans of every {written|reading} token, so references never split ruby markup.
export function rubySpans(value){return [...String(value).matchAll(RUBY_PATTERN)].map(m=>[m.index,m.index+m[0].length]);}
export function insideRuby(value,offset){return rubySpans(value).some(([a,b])=>offset>a&&offset<b);}

// Paths are slash-separated keys relative to a lesson or passage, e.g. "paragraphs/0" or "dialogue/2/ja".
// The first segment may name an exercise bank supplied in `extras` ("transfer" for lessons, "checks" for passages).
export function resolvePath(container,path,extras={}){
 if(typeof path!=='string'||!path)return undefined;
 const [head,...rest]=path.split('/');
 let value=own(extras,head)?extras[head]:own(container,head)?container[head]:undefined;
 for(const key of rest){
  if(Array.isArray(value))value=/^\d+$/.test(key)?value[Number(key)]:undefined;
  else value=own(value,key)?value[key]:undefined;
 }
 return value;
}

export function validateVocabulary(words){
 const problems=[];
 if(!Array.isArray(words))return ['Vocabulary must be an array.'];
 const ids=new Set();
 for(const [i,w] of words.entries()){
  const at=`Vocabulary ${w?.id||`#${i}`}`;
  if(!w||typeof w!=='object'){problems.push(`${at}: not an object`);continue;}
  if(!SLUG.test(w.id||''))problems.push(`${at}: ID must be a lowercase slug`);
  if(ids.has(w.id))problems.push(`${at}: duplicate ID`);ids.add(w.id);
  for(const k of ['word','reading','meaning','definition','example','provenance'])if(!text(w[k]))problems.push(`${at}: missing ${k}`);
  if(!PACKS.includes(w.pack))problems.push(`${at}: unknown pack ${w.pack}`);
  if(text(w.word)&&!wellFormed(w.word))problems.push(`${at}: malformed reading markup in word`);
  if(text(w.reading)&&!KANA.test(w.reading))problems.push(`${at}: reading must be kana only`);
  if(text(w.word)&&text(w.reading)&&plainReading(w.word)!==w.reading)problems.push(`${at}: reading ${w.reading} does not match the markup reading ${plainReading(w.word)}`);
  for(const [kind,list,valueKey] of [['sense',w.senses,'gloss'],['form',w.forms,'form']]){
   if(list===undefined)continue;
   if(!Array.isArray(list)||!list.length){problems.push(`${at}: ${kind}s must be a non-empty array when present`);continue;}
   const seen=new Set();
   for(const item of list){
    if(!SLUG.test(item?.id||''))problems.push(`${at}: ${kind} ID must be a lowercase slug`);
    if(seen.has(item?.id))problems.push(`${at}: duplicate ${kind} ${item?.id}`);seen.add(item?.id);
    if(!text(item?.[valueKey]))problems.push(`${at}: ${kind} ${item?.id} needs ${valueKey}`);
    if(kind==='form'&&(!text(item?.label)||!wellFormed(item?.form||'')))problems.push(`${at}: form ${item?.id} needs a label and well-formed markup`);
   }
  }
  // Niwa has no audio, so records carry no audio field.
  if(own(w,'audio'))problems.push(`${at}: vocabulary records have no audio field`);
 }
 return problems;
}

export function validateOccurrences(container,index,{label=container?.id||'content',extras={}}={}){
 const list=container?.occurrences;
 if(list===undefined)return [];
 if(!Array.isArray(list))return [`${label}: occurrences must be an array`];
 const problems=[],byPath=new Map();
 list.forEach((o,i)=>{
  const at=`${label} occurrence ${i}`;
  if(!o||typeof o!=='object'||Array.isArray(o)){problems.push(`${at}: not an object`);return;}
  for(const key of Object.keys(o))if(!OCCURRENCE_KEYS.has(key))problems.push(`${at}: unexpected field ${key}`);
  const value=resolvePath(container,o.path,extras);
  if(typeof value!=='string'){problems.push(`${at}: unknown text path ${o.path}`);return;}
  if(!Number.isInteger(o.start)||!Number.isInteger(o.end)||o.start<0||o.end<=o.start||o.end>value.length){problems.push(`${at}: invalid range ${o.start}–${o.end} in ${o.path}`);return;}
  if(value.slice(o.start,o.end)!==o.surface)problems.push(`${at}: surface ${o.surface} does not match ${value.slice(o.start,o.end)} at ${o.path}`);
  if(insideRuby(value,o.start)||insideRuby(value,o.end))problems.push(`${at}: range splits reading markup at ${o.path}`);
  const word=index.get(o.word);
  if(!word)problems.push(`${at}: unknown word ID ${o.word}`);
  else{
   if(o.sense!==undefined&&!word.senses?.some(s=>s.id===o.sense))problems.push(`${at}: ${o.word} has no sense ${o.sense}`);
   if(o.sense===undefined&&word.senses?.length>1)problems.push(`${at}: ${o.word} has several senses; name the contextual sense`);
   if(o.form!==undefined&&!word.forms?.some(f=>f.id===o.form))problems.push(`${at}: ${o.word} has no form ${o.form}`);
  }
  if(!byPath.has(o.path))byPath.set(o.path,[]);
  byPath.get(o.path).push({start:o.start,end:o.end,i});
 });
 for(const [path,items] of byPath){
  items.sort((a,b)=>a.start-b.start);
  for(let k=1;k<items.length;k++)if(items[k].start<items[k-1].end)problems.push(`${label}: occurrences ${items[k-1].i} and ${items[k].i} overlap in ${path}`);
 }
 return problems;
}

export const occurrencesAt=(container,path)=>(container?.occurrences||[]).map((o,i)=>({...o,index:i})).filter(o=>o.path===path);

// Splits text into plain parts and referenced parts. Invalid or overlapping references are left as plain text.
export function segmentText(value,occurrences=[]){
 const parts=[];let at=0;
 for(const o of [...occurrences].sort((a,b)=>a.start-b.start)){
  if(o.start<at||o.end>value.length||value.slice(o.start,o.end)!==o.surface||insideRuby(value,o.start)||insideRuby(value,o.end))continue;
  if(o.start>at)parts.push({text:value.slice(at,o.start)});
  parts.push({text:o.surface,occurrence:o});at=o.end;
 }
 if(at<value.length)parts.push({text:value.slice(at)});
 return parts;
}

// Words referenced by one exercise, i.e. its `<prefix>question` and `<prefix>choices/N` texts: one occurrence per word,
// question first, then choices in order. A lesson's own question uses prefix '', its transfer check 'transfer/',
// and passage check i 'checks/i/'. Collection offers these beside the question, never inside answer buttons.
export function exerciseOccurrences(container,prefix=''){
 const order=p=>p===`${prefix}question`?-1:p.startsWith(`${prefix}choices/`)&&/^\d+$/.test(p.slice(prefix.length+8))?Number(p.slice(prefix.length+8)):null;
 const seen=new Set();
 return (container?.occurrences||[]).map((o,i)=>({...o,index:i,rank:order(o.path)})).filter(o=>o.rank!==null)
  .sort((a,b)=>a.rank-b.rank||a.start-b.start).filter(o=>!seen.has(o.word)&&seen.add(o.word)).map(({rank,...o})=>o);
}

export function senseFor(word,occurrence){return word?.senses?.find(s=>s.id===occurrence?.sense)||null;}
export function formFor(word,occurrence){return word?.forms?.find(f=>f.id===occurrence?.form)||null;}

// Which passages, lessons and practice sets reference each word, in that order and in content order. A lesson's or a
// unit practice's Words table (unit words, as IDs or {id, frame, recognize}) counts as a place the word appears, and so
// do a practice's conversation references (lessons.json `practices`, kind 'unit'; source practice:<id>).
export function wordSources(content){
 const map=new Map(),listed=c=>(Array.isArray(c.words)?c.words:[]).map(w=>typeof w==='string'?w:w?.id).filter(x=>typeof x==='string');
 const add=(kind,c)=>{for(const id of [...(c.occurrences||[]).map(o=>o.word),...listed(c)]){const list=map.get(id)||[];if(!list.some(s=>s.kind===kind&&s.id===c.id))list.push({kind,id:c.id,title:c.title});map.set(id,list);}};
 (content?.passages||[]).forEach(p=>add('passage',p));(content?.lessons||[]).forEach(l=>add('lesson',l));
 (Array.isArray(content?.practices?.items)?content.practices.items:[]).filter(p=>p&&(p.kind??'unit')==='unit').forEach(p=>add('practice',p));
 return map;
}

// Discovery is idempotent: the first opening is kept; later openings change nothing.
export function recordDiscovery(state,id,source,now=Date.now()){
 if(own(state?.discovered,id))return {state,added:false};
 return {state:{...state,discovered:{...(state?.discovered||{}),[id]:{at:now,...(typeof source==='string'&&source?{source}:{})}}},added:true};
}

export function normalizeFields(list){
 const out=Array.isArray(list)?[...new Set(list.filter(f=>FIELD_IDS.has(f)))]:[];
 return out.length?out:DEFAULT_FIELDS.slice();
}
export function moveField(fields,id,delta){
 const list=normalizeFields(fields),i=list.indexOf(id),j=i+delta;
 if(i<0||j<0||j>=list.length)return list;
 list.splice(j,0,...list.splice(i,1));return list;
}
export function setFieldShown(fields,id,shown){
 const list=normalizeFields(fields);
 if(!FIELD_IDS.has(id))return list;
 if(shown)return list.includes(id)?list:[...list,id];
 const next=list.filter(f=>f!==id);return next.length?next:list;
}
// Shown fields in their order, followed by the hidden ones in catalogue order.
export function fieldCatalogue(fields){
 const shown=normalizeFields(fields);
 return [...shown.map(id=>({id,label:fieldLabel(id),shown:true})),...DICTIONARY_FIELDS.filter(f=>!shown.includes(f.id)).map(f=>({...f,shown:false}))];
}
export function entryFields(word,fields){
 const value={reading:word.reading,gloss:word.meaning,definition:word.definition,written:word.word,example:word.example,forms:word.forms||[]};
 return normalizeFields(fields).map(id=>({id,label:fieldLabel(id),value:value[id]})).filter(f=>Array.isArray(f.value)?f.value.length:text(f.value));
}

export function wordMatches(word,query){
 const q=fold(query);if(!q)return true;
 const hay=[plainWritten(word.word),word.reading,word.meaning,plainWritten(word.definition),...(word.senses||[]).map(s=>s.gloss),...(word.forms||[]).flatMap(f=>[plainWritten(f.form),plainReading(f.form),f.label])];
 return hay.some(h=>fold(h).includes(q));
}
export function discoveredWords(words,discovered,query=''){
 return (words||[]).filter(w=>own(discovered,w.id)&&wordMatches(w,query)).sort((a,b)=>toHiragana(a.reading).localeCompare(toHiragana(b.reading),'ja'));
}

// Reads discovery and dictionary preferences from saved state or a backup.
// strict: throw on anything invalid (backup restore). Otherwise drop invalid parts (browser storage).
export function readDictionaryState(value,words,{strict=false}={}){
 const ids=new Set((words||[]).map(w=>w.id));
 const fail=msg=>{if(strict)throw Error(msg);};
 const discovered={},raw=value?.discovered;
 if(raw!==undefined&&raw!==null){
  if(typeof raw!=='object'||Array.isArray(raw))fail('This backup contains an invalid word dictionary.');
  else for(const [id,r] of Object.entries(raw)){
   if(!ids.has(id)||!r||typeof r!=='object'||Array.isArray(r)||!Number.isFinite(r.at)||r.at<0||(r.source!==undefined&&typeof r.source!=='string')){fail('This backup contains an invalid discovered word.');continue;}
   discovered[id]={at:r.at,...(typeof r.source==='string'&&r.source?{source:r.source.slice(0,80)}:{})};
  }
 }
 let fields=DEFAULT_FIELDS.slice();const prefs=value?.dictionary;
 if(prefs!==undefined&&prefs!==null){
  const list=prefs?.fields;
  if(!Array.isArray(list)||!list.length||list.some(f=>!FIELD_IDS.has(f))||new Set(list).size!==list.length)fail('This backup contains invalid dictionary settings.');
  else fields=list.slice();
 }
 return {discovered,dictionary:{fields}};
}

// Per-word reading evidence: when a kanji word's reading was first shown, every reading check and every tap-to-reveal.
// A reading fades only after correct, delayed reading in two different texts; a wrong answer brings it back.
export const READING_EVIDENCE_VERSION=1;
export const READING_LOG_MAX=60;
export const READING_DELAY_HOURS=12;
export const READING_MAINTENANCE_DAYS=14;
export const READING_CHECK_MAX=6;
export const READING_STAGES=[
 {id:'unseen',label:'Not read in a text yet'},
 {id:'seen',label:'Seen'},
 {id:'practiced',label:'Practised'},
 {id:'retrieved',label:'Retrieved'},
 {id:'retained',label:'Retained'}
];
const DAY_MS=86400000;
const KANJI=/[㐀-鿿々〆]/;
// context:<sentenceId> is an authored check sentence from curriculum.json kanjiChecks, never part of a lesson or passage.
// transfer:<textId> is an unseen text (transfer.mjs): its words can be revealed while reading it, and the reveal is kept.
// practice:<id> is a unit-shaped practice set (lessons.json `practices`), such as a lesson that became an optional
// practice, whose sources were rewritten from lesson:<id> (recall.mjs convertLessons).
const READING_SOURCE=/^(passage|lesson|practice|context|transfer):[a-z0-9-]+$/;
// With a list of known practice IDs, a practice:<id> source must name one of them; without it, the form is enough.
const knownPractice=(source,practices)=>!practices||!source.startsWith('practice:')||new Set(practices).has(source.slice(9));
const time=v=>Number.isFinite(v)&&v>=0;
export const hasKanji=s=>KANJI.test(plainWritten(s));
export const isKanjiWord=w=>!!w&&typeof w.word==='string'&&hasKanji(w.word);
export const stageLabel=id=>READING_STAGES.find(s=>s.id===id)?.label||id;
const dayKey=t=>{const d=new Date(t);return d.getFullYear()*10000+(d.getMonth()+1)*100+d.getDate();};
export const sameDay=(a,b)=>dayKey(a)===dayKey(b);
// Delayed means a later calendar day and at least 12 hours after the previous sighting, so same-day repeats never count.
export function isDelayed(previous,at){return time(previous)&&time(at)&&at-previous>=READING_DELAY_HOURS*3600000&&dayKey(at)>dayKey(previous);}
export function emptyReadingEvidence(){return {version:READING_EVIDENCE_VERSION,words:{}};}

// First sightings are idempotent, like discovery. Returns the same store when nothing changes.
export function recordReadingMeetings(store,ids,now=Date.now()){
 const words={...(store?.words||{})};let added=0;
 for(const id of ids||[]){if(time(words[id]?.met))continue;words[id]={...words[id],met:now,log:words[id]?.log||[]};added++;}
 return added?{store:{version:READING_EVIDENCE_VERSION,words},added}:{store,added:0};
}
// kind "check" needs correct; kind "reveal" is a tap-to-show and never a failure.
export function recordReadingEvent(store,id,{kind='check',source='',occurrence,correct}={},now=Date.now()){
 if(!['check','reveal'].includes(kind)||!READING_SOURCE.test(source)||!SLUG.test(id||''))return store;
 const entry=store?.words?.[id]||{log:[]};
 const event={at:now,kind,source,...(Number.isInteger(occurrence)&&occurrence>=0?{occurrence}:{}),...(kind==='check'?{correct:correct===true}:{})};
 return {version:READING_EVIDENCE_VERSION,words:{...(store?.words||{}),[id]:{...entry,met:time(entry.met)?entry.met:now,log:[...(entry.log||[]),event].slice(-READING_LOG_MAX)}}};
}

// What the evidence honestly supports. Stages: unseen → seen → practiced → retrieved (one delayed context) → retained (two).
export function readingProgress(word,entry,now=Date.now()){
 const kanji=isKanjiWord(word),log=(entry?.log||[]).filter(e=>e.at<=now).sort((a,b)=>a.at-b.at),checks=log.filter(e=>e.kind==='check');
 let previous=time(entry?.met)&&entry.met<=now?entry.met:null,delayed=[],lastWrong=null;
 for(const e of log){
  if(e.kind==='check'){if(!e.correct){delayed=[];lastWrong=e.at;}else if(isDelayed(previous,e.at))delayed.push(e);}
  previous=previous===null?e.at:Math.max(previous,e.at);
 }
 const sources=[...new Set(delayed.map(e=>e.source))],faded=kanji&&sources.length>=2;
 const stage=faded?'retained':delayed.length?'retrieved':checks.length?'practiced':previous!==null?'seen':'unseen';
 return {kanji,faded,stage,met:time(entry?.met)?entry.met:null,checks:checks.length,correct:checks.filter(e=>e.correct).length,delayed:delayed.length,sources,reveals:log.filter(e=>e.kind==='reveal').length,lastCheck:checks.at(-1)?.at??null,lastWrong,lastSeen:previous};
}
export function readingState(word,entry,now=Date.now()){return readingProgress(word,entry,now).faded?'faded':'shown';}

// Lower is more urgent; null means not due. A check is offered only when it could count as a delayed retrieval.
export function readingPriority(word,entry,now=Date.now(),source=''){
 if(!isKanjiWord(word)||!time(entry?.met))return null;
 const p=readingProgress(word,entry,now);
 if(!isDelayed(p.lastSeen,now))return null;
 if(p.faded)return p.lastCheck===null||now-p.lastCheck>=READING_MAINTENANCE_DAYS*DAY_MS?4:null;
 if(p.lastWrong!==null&&p.lastWrong===p.lastCheck)return 0;
 if(!p.checks)return 1;
 return p.sources.includes(source)?3:2;
}
// Up to `max` due kanji words from a text, one occurrence each (the first one written with kanji), in text order.
// met(id): whether the learner has met the word in a kanji words drill (the app passes kanji-words.mjs wordStage). A word
// not met is never asked, so nothing is tested before it is taught, and it takes no place among the `max`.
export function readingCheckItems(container,index,store,now=Date.now(),{source='',max=READING_CHECK_MAX,body=()=>true,met=()=>true}={}){
 const seen=new Set(),items=[];
 (container?.occurrences||[]).forEach((o,i)=>{
  if(seen.has(o.word)||!body(o.path)||!hasKanji(o.surface)||!isKanjiWord(index.get(o.word))||!met(o.word))return;
  seen.add(o.word);
  const priority=readingPriority(index.get(o.word),store?.words?.[o.word],now,source);
  if(priority!==null)items.push({word:o.word,occurrence:{...o,index:i},priority,order:i});
 });
 return items.sort((a,b)=>a.priority-b.priority||a.order-b.order).slice(0,max).sort((a,b)=>a.order-b.order);
}
// Kanji words met in a text: every referenced kanji word whose surface is written with kanji.
export function kanjiWordsIn(container,index,body=()=>true){return [...new Set((container?.occurrences||[]).filter(o=>body(o.path)&&hasKanji(o.surface)&&isKanjiWord(index.get(o.word))).map(o=>o.word))];}
// The reading text of a lesson or passage (not its questions). Opening it records first meetings, so these words can fade.
export const inReadingText=path=>/^(paragraphs|dialogue|contrast)\//.test(String(path));
export function fadeableWords(content){const index=indexWords(content?.vocabulary);return [...new Set([...(content?.lessons||[]),...(content?.passages||[])].flatMap(c=>kanjiWordsIn(c,index,inReadingText)))];}

// Kanji in new sentences (transfer checks). A word whose reading has faded is read again, chosen from plausible readings, in an authored
// sentence from curriculum.json kanjiChecks that the learner has never answered, mixed with look-alike words they have
// met. Because the log is capped, each word keeps a durable record beside it:
// transfer = {step, due, at, ok, seen, fresh, passed, lapses, memory}. seen lists answered sentence IDs, least recently
// answered first; fresh counts delayed answers in a sentence answered for the first time, and passed the correct ones
// among them. The schedule (due, memory) comes from schedule.mjs; step counts successes since the last miss (at most 4)
// and lapses every miss. The log stays the evidence: the schedule never decides a stage.
// TRANSFER_DAYS is the fixed rhythm records saved before scheduler version 1 were set with.
export const TRANSFER_DAYS=[1,3,7,14,30];
export const TRANSFER_MAX=4;
export const LOOKALIKE_MAX=2;
export const TRANSFER_SESSION_MAX=8;
export const SEEN_MAX=20;
export const contextSource=id=>`context:${id}`;
const bare=s=>plainWritten(s).normalize('NFKC').replace(/[\s　。、，．,.!！?？・「」『』（）()…:：;；〜～]/g,'');
// Normalised plain lines of everything the learner can read: lessons, passages, dictionary entries and any extra banks.
export function sourceLines(content,extra=[]){
 const out=new Set();
 const walk=v=>{if(typeof v==='string'){for(const part of v.split(/[。！？!?\n]/)){const b=bare(part);if(b)out.add(b);}}else if(Array.isArray(v))v.forEach(walk);else if(v&&typeof v==='object')for(const [k,x] of Object.entries(v))if(k!=='occurrences')walk(x);};
 walk(content?.lessons);walk(content?.passages);walk(content?.vocabulary);walk(extra);
 return [...out];
}
// The line a check sentence repeats or sits inside, or a familiar line around the same word that it contains, or null.
// A line hardly longer than the word itself (お願いします on its own) does not count, so a word that is a whole line
// can still be checked in a new sentence.
export function familiarLine(sentence,lines){
 const n=bare(sentence?.text),t=bare(sentence?.target),min=Math.max(6,t.length+3);
 return n?(lines||[]).find(s=>s===n||s.includes(n)||(s.length>=min&&s.includes(t)&&n.includes(s)))||null:null;
}
// Pairs are stored once; the index lists each pair from both sides, with the compared kanji in that side's order.
export function lookAlikeIndex(pairs){
 const map=new Map(),add=(a,b,kanji,p)=>{if(!map.has(a))map.set(a,[]);map.get(a).push({id:p.id,word:b,kanji,contrast:p.contrast});};
 for(const p of pairs||[]){const [a,b]=p?.words||[],[ka,kb]=p?.kanji||[];if(!a||!b||a===b)continue;add(a,b,[ka,kb],p);add(b,a,[kb,ka],p);}
 return map;
}
// coverage (default true): every word whose reading can fade needs a sentence. A profile whose content rules set
// kanjiCheckSentences.required false (docs/data-contract.md "Content rules") passes false; the sentences present are
// still checked.
export function validateKanjiChecks(checks,content,{lines=sourceLines(content),coverage=true}={}){
 if(!checks||typeof checks!=='object'||!Array.isArray(checks.sentences)||!Array.isArray(checks.lookAlikes))return ['kanjiChecks needs sentences and lookAlikes arrays.'];
 const problems=[],index=indexWords(content?.vocabulary),ids=new Set(),texts=new Map();
 for(const [i,s] of checks.sentences.entries()){
  const at=`kanjiChecks sentence ${s?.id||`#${i}`}`;
  if(!s||typeof s!=='object'||Array.isArray(s)){problems.push(`${at}: not an object`);continue;}
  if(!SLUG.test(s.id||''))problems.push(`${at}: ID must be a lowercase slug`);
  if(ids.has(s.id))problems.push(`${at}: duplicate ID`);ids.add(s.id);
  const w=index.get(s.word);
  if(!isKanjiWord(w)){problems.push(`${at}: ${s.word} is not a kanji word in the vocabulary`);continue;}
  for(const k of ['text','target','en'])if(!text(s[k]))problems.push(`${at}: missing ${k}`);
  if(!text(s.text)||!text(s.target))continue;
  if(!wellFormed(s.text))problems.push(`${at}: malformed reading markup`);
  if(KANJI.test(s.text.replace(RUBY_PATTERN,'')))problems.push(`${at}: kanji without a kana reading`);
  if(!/[。？！]$/.test(s.text))problems.push(`${at}: must end with 。, ？ or ！`);
  const first=s.text.indexOf(s.target);
  if(first<0||s.text.indexOf(s.target,first+1)>=0)problems.push(`${at}: the target must appear exactly once in the text`);
  else if(insideRuby(s.text,first)||insideRuby(s.text,first+s.target.length))problems.push(`${at}: the target splits reading markup`);
  if(!hasKanji(s.target))problems.push(`${at}: the target must be written with kanji`);
  if(!KANA.test(plainReading(s.target)))problems.push(`${at}: the reading of the target must be kana only`);
  const tokens=wordTokens(w);
  for(const m of s.target.matchAll(RUBY_PATTERN))if(!tokens.some(([k,r])=>k===m[1]&&r===m[2]))problems.push(`${at}: {${m[1]}|${m[2]}} matches no reading in the ${s.word} record or its forms`);
  // The rest of the sentence keeps its readings, so it must not spell out the word being checked a second time.
  if(first>=0){const own=new Set(writtenTokens(w)),rest=s.text.slice(0,first)+s.text.slice(first+s.target.length);for(const m of rest.matchAll(RUBY_PATTERN))if(own.has(m[1]))problems.push(`${at}: {${m[1]}|${m[2]}} outside the target gives its reading away`);}
  const plain=bare(s.text);if(texts.has(plain))problems.push(`${at}: repeats sentence ${texts.get(plain)}`);else texts.set(plain,s.id);
  const line=familiarLine(s,lines);if(line)problems.push(`${at}: repeats a line the learner already reads (${line})`);
 }
 const pairKeys=new Set();
 for(const [i,p] of checks.lookAlikes.entries()){
  const at=`kanjiChecks look-alike ${p?.id||`#${i}`}`;
  if(!p||typeof p!=='object'||!SLUG.test(p.id||'')){problems.push(`${at}: needs a lowercase slug ID`);continue;}
  if(!Array.isArray(p.words)||p.words.length!==2||!Array.isArray(p.kanji)||p.kanji.length!==2){problems.push(`${at}: needs two words and the two kanji compared`);continue;}
  const [a,b]=p.words,key=[a,b].sort().join('|');
  if(a===b)problems.push(`${at}: a word cannot be its own look-alike`);
  if(pairKeys.has(key))problems.push(`${at}: duplicate pair ${a} / ${b}`);pairKeys.add(key);
  p.words.forEach((id,j)=>{
   const w=index.get(id),k=p.kanji[j];
   if(!isKanjiWord(w)){problems.push(`${at}: ${id} is not a kanji word in the vocabulary`);return;}
   if(typeof k!=='string'||[...k].length!==1||!KANJI.test(k))problems.push(`${at}: compared kanji ${k} must be one character`);
   else if(!plainWritten(w.word).includes(k))problems.push(`${at}: ${k} does not appear in ${plainWritten(w.word)}`);
   if(!checks.sentences.some(s=>s?.word===id))problems.push(`${at}: ${id} has no check sentence`);
  });
  if(!text(p.contrast)||/\n/.test(p.contrast)||p.contrast.length>160||!wellFormed(p.contrast))problems.push(`${at}: needs a one-line contrast of at most 160 characters`);
 }
 // The index must read the same from both sides: every pair listed under a word is listed back under its partner.
 const pairs=lookAlikeIndex(checks.lookAlikes);
 for(const [a,list] of pairs)for(const x of list)if(!(pairs.get(x.word)||[]).some(y=>y.id===x.id&&y.word===a&&y.kanji[0]===x.kanji[1]&&y.kanji[1]===x.kanji[0]))problems.push(`kanjiChecks look-alike ${x.id}: not symmetric`);
 if(coverage)for(const id of fadeableWords(content))if(!checks.sentences.some(s=>s?.word===id))problems.push(`kanjiChecks: ${id} can fade but has no new sentence to check it in`);
 return problems;
}
// Check sentences for a word, leaving out any that repeat a line from the content (defence in depth: validate.mjs
// already rejects them), so a check never shows the sentence the word was learned from.
export function sentencesFor(checks,id,lines=[]){return (checks?.sentences||[]).filter(s=>s?.word===id&&!familiarLine(s,lines));}
// The first sentence never answered, in authored order; when all have been answered, the one answered longest ago.
export function pickSentence(list,seen=[]){
 if(!list?.length)return null;
 const unseen=list.find(s=>!seen.includes(s.id));if(unseen)return {sentence:unseen,fresh:true};
 return {sentence:[...list].sort((a,b)=>seen.indexOf(a.id)-seen.indexOf(b.id))[0],fresh:false};
}
// Lower is more urgent; null means not due. Faded words enter the schedule; after that the record decides,
// so a word whose reading came back after a miss returns on the review rhythm. Every check is a delayed one.
export function transferPriority(word,entry,now=Date.now()){
 if(!isKanjiWord(word)||!time(entry?.met))return null;
 const p=readingProgress(word,entry,now),t=entry.transfer;
 if(!isDelayed(p.lastSeen,now))return null;
 if(!t)return p.faded?2:null;
 if(t.due>now)return null;
 return t.ok===false?0:1;
}
// Up to `max` due words, each followed by up to `lookAlikes` look-alikes the learner has met, within `limit` items.
// Look-alikes are the authored pairs (kanjiChecks.lookAlikes), shared out one per word at a time, least recently seen
// first, and never repeat a word already in the session.
// `skip(id)` leaves a word out, as target and as look-alike: a word in recovery (schedule.mjs) is not asked here.
export function transferSession(checks,content,store,now=Date.now(),{max=TRANSFER_MAX,lookAlikes=LOOKALIKE_MAX,limit=TRANSFER_SESSION_MAX,lines=sourceLines(content),skip=()=>false}={}){
 const index=indexWords(content?.vocabulary),entries=store?.words||{};
 const order=new Map((content?.vocabulary||[]).map((w,i)=>[w.id,i])),usable=id=>skip(id)?[]:sentencesFor(checks,id,lines);
 const targets=[...new Set((checks?.sentences||[]).map(s=>s.word))]
  .map(id=>({id,priority:transferPriority(index.get(id),entries[id],now),due:entries[id]?.transfer?.due??0}))
  .filter(x=>x.priority!==null&&usable(x.id).length)
  .sort((a,b)=>a.priority-b.priority||a.due-b.due||(order.get(a.id)??0)-(order.get(b.id)??0)).slice(0,Math.max(0,max));
 const pairs=lookAlikeIndex(checks?.lookAlikes);
 const inSession=new Set(targets.map(t=>t.id)),lastSeen=id=>readingProgress(index.get(id),entries[id],now).lastSeen??0;
 const mates=targets.map(t=>(pairs.get(t.id)||[]).filter(x=>isKanjiWord(index.get(x.word))&&time(entries[x.word]?.met)&&usable(x.word).length).sort((a,b)=>lastSeen(a.word)-lastSeen(b.word)));
 const chosen=targets.map(()=>[]);let room=Math.max(0,limit-targets.length);
 for(let round=0;round<lookAlikes;round++)mates.forEach((list,i)=>{if(room<=0||chosen[i].length!==round)return;const x=list.find(m=>!inSession.has(m.word));if(x){chosen[i].push(x);inSession.add(x.word);room--;}});
 const item=(id,role,pair)=>{const pick=pickSentence(usable(id),entries[id]?.transfer?.seen||[]);return {word:id,role,sentence:pick.sentence,fresh:pick.fresh,pair:pair||null};};
 return targets.flatMap((t,i)=>[item(t.id,'target',chosen[i][0]||(pairs.get(t.id)||[])[0]),...chosen[i].map(x=>item(x.word,'look-alike',{id:x.id,word:t.id,kanji:[x.kanji[1],x.kanji[0]],contrast:x.contrast}))]);
}

// Lapses and memory for a transfer record saved before scheduler version 1. Lapses are the misses in new sentences that
// the reading log still holds (the log is capped, so a long history may count fewer); the last answer being wrong counts
// as one at least. The interval of the record's step seeds stability.
const contextMisses=entry=>(entry?.log||[]).filter(e=>e.kind==='check'&&e.correct===false&&String(e.source).startsWith('context:')).length;
export function seedTransfer(t,entry){
 const lapses=Number.isInteger(t.lapses)?t.lapses:Math.max(contextMisses(entry),t.ok===false?1:0),step=Math.min(Math.max(0,t.step|0),TRANSFER_DAYS.length-1);
 return {lapses,memory:seedMemory({ivl:TRANSFER_DAYS[step],lapses,recent:t.ok===false||(lapses>0&&step<2)?1:0})};
}
// Records one chosen reading in a check sentence: a log event (source context:<id>) and the word's transfer record.
// A miss clears the delayed evidence, so the reading shows again, and lapses the schedule (next check in 1 day). A
// correct answer on a due check after a delay (isDelayed: a later day and at least 12 hours) grows stability through the
// shared scheduler; on a due check without that delay it holds the interval; early answers change nothing. Freshness
// (a sentence never answered before) decides only the new-sentence evidence, as before. `event` is the ledger outcome.
export function recordTransferCheck(store,id,{sentence,correct}={},now=Date.now()){
 const entry=store?.words?.[id];
 if(!entry||!SLUG.test(id||'')||!SLUG.test(sentence||''))return {store,counted:false,change:'none',record:entry?.transfer||null};
 const delayed=isDelayed(readingProgress(null,entry,now).lastSeen,now),t=entry.transfer,seen=t?.seen||[];
 const counted=delayed&&!seen.includes(sentence),step=Math.min(Math.max(0,t?.step|0),TRANSFER_DAYS.length-1),grade=correct?'good':'again';
 let res,lapses;
 if(!t){
  // The first check of a faded reading starts the schedule: next check in 1 day either way; a miss is the first lapse.
  res={memory:correct?enterMemory('good'):{...enterMemory('again'),recent:1},due:now+DAY_MS,effect:'first',eligible:false,reason:'first',lapsed:!correct};lapses=correct?0:1;
 }else{
  const seed=seedTransfer(t,entry);
  res=review(t.memory||seed.memory,{grade,now,due:t.due,delayed,relearn:1});lapses=seed.lapses+(res.lapsed?1:0);
 }
 const grew=res.effect==='advanced'||res.effect==='maintained';
 const change=!t?(correct?'start':'reset'):res.lapsed?'reset':res.effect==='unchanged'?'none':res.effect==='advanced'?'advance':'hold';
 const next=res.lapsed||!t?0:grew?Math.min(step+1,TRANSFER_DAYS.length-1):step;
 const record={step:next,due:res.due,at:now,ok:!!correct,seen:[...seen.filter(s=>s!==sentence),sentence].slice(-SEEN_MAX),fresh:(t?.fresh|0)+(counted?1:0),passed:(t?.passed|0)+(counted&&correct?1:0),lapses,memory:res.memory};
 const logged=recordReadingEvent(store,id,{kind:'check',source:contextSource(sentence),correct:!!correct},now);
 return {store:{...logged,words:{...logged.words,[id]:{...logged.words[id],transfer:record}}},counted,change,record,event:eventOf(res,{grade})};
}
// The one schedule credit a completed recovery episode (schedule.mjs) gives a word whose new-sentence readings kept
// lapsing: a correct, delayed check on its schedule, with no log entry and no new-sentence evidence, because the prompt was
// a recovery prompt and recovery keeps its own record. Returns {store, record, event}; a word without a schedule is
// returned unchanged.
export function recoverTransfer(store,id,now=Date.now()){
 const entry=store?.words?.[id],t=entry?.transfer;
 if(!t)return {store,record:null,event:null};
 const seed=seedTransfer(t,entry),step=Math.min(Math.max(0,t.step|0),TRANSFER_DAYS.length-1);
 const res=review(t.memory||seed.memory,{grade:'good',now,due:t.due,relearn:1}),grew=res.effect==='advanced'||res.effect==='maintained';
 if(res.effect==='unchanged')return {store,record:t,event:eventOf(res,{grade:'good'})};
 const record={...t,step:grew?Math.min(step+1,TRANSFER_DAYS.length-1):step,due:res.due,at:now,ok:true,lapses:seed.lapses,memory:res.memory};
 return {store:{...store,words:{...store.words,[id]:{...entry,transfer:record}}},record,event:eventOf(res,{grade:'good'})};
}
// The ledger outcome of a reading checked in a text (lesson or passage). Those checks keep their evidence rules
// (readingPriority) and set no interval, so the effect is `recorded`; the answer is eligible evidence only when it came
// after a delay. Read the entry before recording the check.
export function readingCheckEvent(entry,correct,now=Date.now()){
 const eligible=isDelayed(readingProgress(null,entry,now).lastSeen,now);
 return {grade:correct?'good':'again',assisted:false,self:false,eligible,effect:'recorded',...(eligible?{}:{reason:'not-delayed'})};
}
// Across all words: delayed readings in sentences seen for the first time, and how many were right (the roadmap's 80% measure).
export function transferSummary(store){
 let words=0,attempts=0,passed=0,nextDue=null;
 for(const e of Object.values(store?.words||{})){const t=e?.transfer;if(!t)continue;words++;attempts+=t.fresh|0;passed+=t.passed|0;if(nextDue===null||t.due<nextDue)nextDue=t.due;}
 return {words,attempts,passed,rate:attempts?passed/attempts:null,nextDue};
}
const validTransfer=t=>!!t&&typeof t==='object'&&!Array.isArray(t)&&Number.isInteger(t.step)&&t.step>=0&&t.step<TRANSFER_DAYS.length&&time(t.due)&&time(t.at)&&typeof t.ok==='boolean'&&Array.isArray(t.seen)&&t.seen.length<=SEEN_MAX&&t.seen.every(s=>typeof s==='string'&&SLUG.test(s))&&new Set(t.seen).size===t.seen.length&&Number.isInteger(t.fresh)&&t.fresh>=0&&Number.isInteger(t.passed)&&t.passed>=0&&t.passed<=t.fresh&&
 (t.lapses===undefined||(Number.isInteger(t.lapses)&&t.lapses>=0));

// The sentence around a reference, never cutting a {written|reading} token.
export function sentenceRange(value,start,end){
 const spans=rubySpans(value),inside=i=>spans.some(([a,b])=>i>a&&i<b),stop=c=>/[。！？!?\n]/.test(c);
 let a=start,b=end;
 while(a>0&&!(stop(value[a-1])&&!inside(a-1)))a--;
 while(b<value.length&&!(stop(value[b])&&!inside(b)))b++;
 if(b<value.length)b++;
 while(b<value.length&&/[」』）)]/.test(value[b]))b++;
 while(a<start&&/[\s」』）)]/.test(value[a]))a++;
 return [a,b];
}

// Reading choices: the contextual reading plus plausible misreadings of the kanji part only (okurigana stays).
// Distractors, in order of preference: another reading of the same written token in the vocabulary (何: なに/なん),
// another common reading of one character from content.kanjiReadings (注文 → ちゅうぶん), then voicing,
// vowel length or small っ slips (さかな → ざかな, ちゅうもん → ちゅもん).
const VOICED={か:'が',き:'ぎ',く:'ぐ',け:'げ',こ:'ご',さ:'ざ',し:'じ',す:'ず',せ:'ぜ',そ:'ぞ',た:'だ',て:'で',と:'ど',は:'ば',ひ:'び',ふ:'ぶ',へ:'べ',ほ:'ぼ'};
const PLAIN=Object.fromEntries(Object.entries(VOICED).map(([a,b])=>[b,a]));
const O_ROW=/[おこごそぞとどのほぼぽもよろ]/,DOUBLE=/[かきくけこさしすせそたちつてとぱぴぷぺぽ]/;
function wordTokens(word){return [word?.word,...(word?.forms||[]).map(f=>f.form)].flatMap(s=>[...String(s??'').matchAll(RUBY_PATTERN)].map(m=>[m[1],m[2]]));}
// The written halves of a word's {written|reading} tokens, e.g. 待 for 待つ; a check hides these readings anywhere in its sentence.
export function writtenTokens(word){return [...new Set(wordTokens(word).map(([k])=>k))];}
function slips(r,compound){
 const out=new Set(),add=v=>{if(v&&v!==r)out.add(v);};
 for(let i=0;i<r.length;i++){const swap=VOICED[r[i]]||PLAIN[r[i]];if(swap)add(r.slice(0,i)+swap+r.slice(i+1));}
 for(let i=0;i<r.length;i++){
  if(/[ゅょ]/.test(r[i])||(compound&&O_ROW.test(r[i]))){if(r[i+1]==='う')add(r.slice(0,i+1)+r.slice(i+2));else if(/[ゅょ]/.test(r[i]))add(r.slice(0,i+1)+'う'+r.slice(i+1));}
  if(r[i]==='っ')add(r.slice(0,i)+r.slice(i+1));
  else if(compound&&i>0&&DOUBLE.test(r[i])&&!/[っんうい]/.test(r[i-1]))add(r.slice(0,i)+'っ'+r.slice(i));
 }
 return [...out];
}
// kanjiReadings follows dictionary convention: on'yomi in katakana, kun'yomi in hiragana.
const isOn=r=>/^[ァ-ヺー]+$/.test(r);
// Splits a compound's reading across its characters using the readings table, allowing sound changes at joins.
function splitReading(written,reading,table){
 const chars=[...written];
 const forms=r=>{r=toHiragana(r);const out=[r];if(VOICED[r[0]])out.push(VOICED[r[0]]+r.slice(1));if(/[くちつき]$/.test(r))out.push(r.slice(0,-1)+'っ');return out;};
 const walk=(i,at)=>{
  if(i===chars.length)return at===reading.length?[]:null;
  for(const base of table[chars[i]]||[])for(const r of forms(base))if(reading.startsWith(r,at)){const rest=walk(i+1,at+r.length);if(rest)return [{char:chars[i],used:r,base},...rest];}
  return null;
 };
 return walk(0,0);
}
// Preferred: readings of the same type (kun'yomi before okurigana; on'yomi, or the type already used, inside compounds).
function tokenAlternatives(written,reading,table,okurigana){
 const chars=[...written],preferred=[],fallback=[];
 if(chars.length===1){for(const raw of table[written]||[]){const r=toHiragana(raw);if(r!==reading)(okurigana&&isOn(raw)?fallback:preferred).push(r);}}
 else{
  const split=splitReading(written,reading,table);
  if(split)split.forEach((part,i)=>{for(const raw of table[part.char]||[]){if(raw===part.base)continue;const alt=split.map((p,j)=>j===i?toHiragana(raw):p.used).join('');(isOn(raw)||!isOn(part.base)?preferred:fallback).push(alt);}});
 }
 return {preferred,fallback};
}
function seeded(seed){let h=1779033703^seed.length;for(const c of seed){h=Math.imul(h^c.charCodeAt(0),3432918353);h=h<<13|h>>>19;}return ()=>{h=Math.imul(h^h>>>16,2246822507);h=Math.imul(h^h>>>13,3266489909);return ((h^=h>>>16)>>>0)/4294967296;};}
export function readingChoices(surface,content,{count=4,seed=String(surface)}={}){
 const answer=plainReading(surface),parts=String(surface).split(/(\{[^|{}]+\|[^{}]+\})/).filter(Boolean),table=content?.kanjiReadings||{};
 const known=new Map();for(const w of content?.vocabulary||[])for(const [k,r] of wordTokens(w)){if(!known.has(k))known.set(k,new Set());known.get(k).add(r);}
 const rand=seeded(seed),shuffle=list=>list.map(v=>[rand(),v]).sort((a,b)=>a[0]-b[0]).map(x=>x[1]);
 const swapped=(i,r)=>parts.map((p,j)=>j===i?r:plainReading(p)).join('');
 const tiers=[[],[],[],[],[]];
 parts.forEach((p,i)=>{
  const m=p.match(/^\{([^|{}]+)\|([^{}]+)\}$/);if(!m)return;
  const okurigana=/^[ぁ-ゖ]/.test(parts[i+1]||''),alt=tokenAlternatives(m[1],m[2],table,okurigana);
  for(const r of known.get(m[1])||[])if(r!==m[2])tiers[0].push(swapped(i,r));
  for(const r of alt.preferred)tiers[1].push(swapped(i,r));
  for(const r of slips(m[2],[...m[1]].length>1))tiers[2].push(swapped(i,r));
  for(const r of alt.fallback)tiers[3].push(swapped(i,r));
  // Last resort for one-character tokens: a same-type, same-length reading of another character (待ちました → うちました).
  if([...m[1]].length===1){
   const used=(table[m[1]]||[]).find(raw=>toHiragana(raw)===m[2]),on=used?isOn(used):!okurigana;
   for(const [k,list] of Object.entries(table))if(k!==m[1])for(const raw of list)if(isOn(raw)===on&&raw.length===m[2].length)tiers[4].push(swapped(i,toHiragana(raw)));
  }
 });
 const distractors=[...new Set(tiers.flatMap(shuffle))].filter(r=>r!==answer&&KANA.test(r)&&!/んん|っっ|っん|^[んっー]/.test(r)).slice(0,Math.max(0,count-1));
 return {answer,choices:shuffle([answer,...distractors])};
}
// Characters of referenced kanji words that have no entry in content.kanjiReadings.
export function missingKanjiReadings(content){
 const table=content?.kanjiReadings||{},missing=new Set(),index=indexWords(content?.vocabulary);
 for(const c of [...(content?.lessons||[]),...(content?.passages||[])])for(const o of c.occurrences||[])if(isKanjiWord(index.get(o.word)))for(const m of String(o.surface).matchAll(RUBY_PATTERN))for(const ch of m[1])if(KANJI.test(ch)&&!Array.isArray(table[ch]))missing.add(ch);
 return [...missing];
}
export function validateKanjiReadings(table){
 if(!table||typeof table!=='object'||Array.isArray(table))return ['kanjiReadings must be an object keyed by single kanji.'];
 const problems=[];
 for(const [k,list] of Object.entries(table)){
  if([...k].length!==1||!KANJI.test(k))problems.push(`kanjiReadings: key ${k} must be one kanji`);
  if(!Array.isArray(list)||!list.length||list.some(r=>typeof r!=='string'||!KANA.test(r))||new Set(list).size!==list.length)problems.push(`kanjiReadings ${k}: needs distinct kana readings`);
 }
 return problems;
}
// Why a chosen reading is wrong when it is a near miss of the right one: voicing (は/ば), small-kana (や/ゃ), small-tsu
// (っ added or missing) or length (a long vowel added or missing). Feedback names the sound; a slip is never correct.
const SMALL_KANA={ぁ:'あ',ぃ:'い',ぅ:'う',ぇ:'え',ぉ:'お',ゃ:'や',ゅ:'ゆ',ょ:'よ',ゎ:'わ'};
const unvoiced=s=>s.normalize('NFD').replace(/[゙゚]/g,'').normalize('NFC');
const fullSize=s=>[...s].map(c=>SMALL_KANA[c]||c).join('');
function extraChar(shorter,longer){
 if(longer.length!==shorter.length+1)return null;
 let i=0;while(i<shorter.length&&shorter[i]===longer[i])i++;
 return longer.slice(i+1)===shorter.slice(i)?{char:longer[i],at:i}:null;
}
export function readingSlip(expected,given){
 expected=toHiragana(expected);given=toHiragana(given);
 if(!expected||!given||expected===given)return null;
 if(expected.length===given.length&&unvoiced(expected)===unvoiced(given))return 'voicing';
 if(expected.length===given.length&&fullSize(expected)===fullSize(given))return 'small-kana';
 const x=extraChar(expected,given)||extraChar(given,expected);
 if(x?.char==='っ')return 'small-tsu';
 if(x&&x.at>0&&/[うおいー]/.test(x.char))return 'length';
 return null;
}

// Every reference to a kanji word must carry a kana reading for each kanji, and each {written|reading}
// token must match the word's citation form or one of its listed forms, so contextual readings stay consistent.
export function occurrenceReadingProblems(container,index,{label=container?.id||'content'}={}){
 const problems=[];
 (container?.occurrences||[]).forEach((o,i)=>{
  const w=index.get(o?.word);if(!isKanjiWord(w)||typeof o.surface!=='string')return;
  const at=`${label} occurrence ${i} (${o.word})`,tokens=wordTokens(w);
  if(KANJI.test(o.surface.replace(RUBY_PATTERN,'')))problems.push(`${at}: kanji in ${o.surface} without a kana reading`);
  if(hasKanji(o.surface)&&!KANA.test(plainReading(o.surface)))problems.push(`${at}: the reading of ${o.surface} must be kana only`);
  for(const m of o.surface.matchAll(RUBY_PATTERN))if(!tokens.some(([k,r])=>k===m[1]&&r===m[2]))problems.push(`${at}: {${m[1]}|${m[2]}} matches no reading in the ${o.word} record or its forms`);
 });
 return problems;
}

// Reads reading evidence from saved state or a backup. strict: throw on anything invalid (backup restore). A transfer
// record from before scheduler version 1 gains lapses and memory (seedTransfer) with its step, due time and evidence
// unchanged; malformed memory fails a strict read and is reseeded in a lenient one. Contextual checks in texts have no
// schedule, so their log is read as it is.
// `practices`: the practice IDs in the content, so a practice:<id> source must name a known practice.
export function readReadingEvidence(value,words,{strict=false,practices=null}={}){
 const ids=new Set((words||[]).map(w=>w.id)),fail=msg=>{if(strict)throw Error(msg);},out=emptyReadingEvidence(),raw=value?.readingEvidence;
 if(raw===undefined||raw===null)return {readingEvidence:out};
 if(typeof raw!=='object'||Array.isArray(raw)||raw.version!==READING_EVIDENCE_VERSION||!raw.words||typeof raw.words!=='object'||Array.isArray(raw.words)){fail('This backup contains invalid reading evidence.');return {readingEvidence:out};}
 for(const [id,e] of Object.entries(raw.words)){
  if(!ids.has(id)||!e||typeof e!=='object'||Array.isArray(e)||(e.met!==undefined&&!time(e.met))||!Array.isArray(e.log)||e.log.length>READING_LOG_MAX){fail('This backup contains invalid reading evidence for a word.');continue;}
  const log=[];
  for(const x of e.log){
   const ok=x&&typeof x==='object'&&!Array.isArray(x)&&time(x.at)&&typeof x.source==='string'&&READING_SOURCE.test(x.source)&&knownPractice(x.source,practices)&&x.source.length<=80&&(x.occurrence===undefined||(Number.isInteger(x.occurrence)&&x.occurrence>=0))&&((x.kind==='check'&&typeof x.correct==='boolean')||(x.kind==='reveal'&&x.correct===undefined));
   if(!ok){fail('This backup contains an invalid reading attempt.');continue;}
   log.push({at:x.at,kind:x.kind,source:x.source,...(x.occurrence!==undefined?{occurrence:x.occurrence}:{}),...(x.kind==='check'?{correct:x.correct}:{})});
  }
  let transfer;
  log.sort((a,b)=>a.at-b.at);
  if(e.transfer!==undefined){if(validTransfer(e.transfer)){
   const t=e.transfer,seed=seedTransfer(t,{log});
   if(t.memory!==undefined&&!validMemory(t.memory))fail('This backup contains invalid new-sentence scheduling data.');
   transfer={step:t.step,due:t.due,at:t.at,ok:t.ok,seen:t.seen.slice(),fresh:t.fresh,passed:t.passed,lapses:seed.lapses,memory:validMemory(t.memory)?cleanMemory(t.memory):seed.memory};
  }else fail('This backup contains an invalid new-sentence reading record.');}
  out.words[id]={...(e.met!==undefined?{met:e.met}:{}),log,...(transfer?{transfer}:{})};
 }
 return {readingEvidence:out};
}
