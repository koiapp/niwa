// The kanji set practice: once every kanji of a set (a book lesson of the track, kanji-characters.mjs) is read, the learner
// answers PER_KANJI questions a kanji, one of each kind, mixed. Pure: no DOM, no clock, no learner state; the same track,
// list and seed always give the same questions, so a run saved as {set, seed, answers} (state.kanjiChars.run) resumes at
// answers.length after a reload. It imports only kanji-words.mjs and kanji-characters.mjs. Spec: docs/data-contract.md
// "Kanji sets" (2026-10-29).
//
// The questions take a LIST of character entries (normally a set's ten), not a set id, so a later cumulative practice is a
// longer list under another run tag; that mode is not built. Mastery is undefined: nothing here scores a kanji.
//
// The kinds, each a tap on one of four options (never typing; no stroke order, no parts):
//  - meaning      What does this kanji mean? The kanji large; four meaning texts, never a kanji sharing a meaning.
//  - readingHere  How is the red word read here? A sentence in furigana with the mark's kanji bare and red; four readings.
//  - chooseKanji  Which kanji is the red word written with? The sentence with the mark as its kana in red; four forms.
//  - wordReading  How is this word read? One of the kanji's core words as bare kanji, its tokens holding the kanji red;
//                 four readings, the wrong ones the book's near misses: one token's reading changed (another reading of
//                 the kanji, of another kanji of the word, a voicing change, a long-vowel or small っ slip), never an
//                 impossible kana string (wordReadingTiers below), and never another right reading of the word (its
//                 alsoRead, or the reading of a same-written words[]/special[] entry: validReadings).
//  - soundMatch   Which kanji is read like this? The kanji's on and kun readings; four kanji.
// The app draws them (rubyHTML for every Japanese line) and composes its feedback from feedbackOf.
import {seeded,shuffled} from './kanji-words.mjs?b=2bde53d';
import {plainReading,plainWritten,wordTokens} from './kanji-characters.mjs?b=2bde53d';
export const PER_KANJI=5;
export const KINDS=Object.freeze(['meaning','readingHere','chooseKanji','wordReading','soundMatch']);
const PROMPTS=Object.freeze({
 meaning:['What does this kanji mean?','text'],
 readingHere:['How is the red word read here?','kana'],
 chooseKanji:['Which kanji is the red word written with?','kanji'],
 wordReading:['How is this word read?','kana'],
 soundMatch:['Which kanji is read like this?','kanji']
});
const OPTIONS=4;
const KANA=/^[ぁ-ゖァ-ヺー]+$/;
const SMALL=/[ゃゅょぁぃぅぇぉゎャュョァィゥェォヮ]/;
const frozen=v=>Array.isArray(v)?Object.freeze(v.map(frozen)):v&&typeof v==='object'?Object.freeze(Object.fromEntries(Object.entries(v).map(([k,x])=>[k,frozen(x)]))):v;
const toHira=s=>[...String(s)].map(ch=>{const c=ch.codePointAt(0);return c>=0x30a1&&c<=0x30f6?String.fromCodePoint(c-0x60):ch;}).join('');
const toKata=s=>[...String(s)].map(ch=>{const c=ch.codePointAt(0);return c>=0x3041&&c<=0x3096?String.fromCodePoint(c+0x60):ch;}).join('');
const isKata=ch=>/[ァ-ヺ]/.test(ch);
const meaningOf=e=>e.meanings.join(', ');
// Whether two kanji share a meaning string (trimmed, case-insensitive): 晩 and 夜 are both "night", so neither is offered
// as a wrong meaning for the other.
const meaningKey=m=>String(m).trim().toLowerCase();
const sameMeaning=(a,b)=>{const keys=new Set(a.meanings.map(meaningKey));return b.meanings.some(m=>keys.has(meaningKey(m)));};

// ── Readings ───────────────────────────────────────────────────────────────────────────────────────────────
// What soundMatch shows: the on kana, then the kun kana with its okurigana dash as ・, joined by 、 (サン、やま).
const readingsText=e=>[...e.on.map(r=>r.kana),...e.kun.map(r=>r.kana.replace('-','・'))].join('、');
// A kanji's readings as hiragana keys (on in hiragana, kun with its dash dropped), for "shares a reading" and "reads the
// same" in soundMatch.
const readingKeys=e=>new Set([...e.on.map(r=>toHira(r.kana)),...e.kun.map(r=>r.kana.replace('-',''))]);
const sameReadings=(a,b)=>a.size===b.size&&[...a].every(x=>b.has(x));
// ── wordReading's distractors ─────────────────────────────────────────────────────────────────────────────────
// A kanji's readings as wordReading swaps them in: every on kana in hiragana, every kun kana's stem before its dash, every
// variant with its dash stripped (on variants in hiragana too).
function otherReadings(e){
 const out=[];
 for(const r of e.on){out.push(toHira(r.kana));for(const v of r.variants??[])out.push(toHira(v.kana.replace(/-/g,'')));}
 for(const r of e.kun){out.push(r.kana.split('-')[0]);for(const v of r.variants??[])out.push(v.kana.replace(/-/g,''));}
 return [...new Set(out.filter(x=>x&&KANA.test(x)))];
}
// What a digit token (1, 10, 100 …, ASCII or full width) can be read as. Other numbers (21, 25) have none.
const NUMERALS=Object.freeze({1:['いち','いっ','ひと'],2:['に','ふた'],3:['さん','みっ'],4:['し','よん','よ'],5:['ご','いつ'],6:['ろく','ろっ','むっ'],7:['しち','なな'],8:['はち','はっ','やっ'],9:['く','きゅう','ここの'],10:['じゅう','じゅっ','じっ','とお'],100:['ひゃく','びゃく','ぴゃく'],1000:['せん','ぜん'],10000:['まん']});
const asDigits=s=>String(s).replace(/[０-９]/g,c=>String.fromCharCode(c.charCodeAt(0)-0xfee0));
// The readings a token can be mistaken for: a digit token's numerals, a one-kanji token's track readings (otherReadings);
// a kanji outside the track, or a token of several characters, has none.
function tokenReadings(text,chars){
 const d=asDigits(text);if(/^[0-9]+$/.test(d))return NUMERALS[Number(d)]??[];
 const cs=[...text];return cs.length===1&&chars.has(cs[0])?otherReadings(chars.get(cs[0])):[];
}
// Voicing: the first kana voiced or unvoiced (か⇄が, さ⇄ざ, た⇄だ and their rows; は→ば→ぱ→は), each other form of its
// group, in that order. Rendaku is the voiced form alone (か→が, は→ば), for a token that is not the word's first.
const VOICE=new Map(),RENDAKU=new Map();
for(const g of ['かが','きぎ','くぐ','けげ','こご','さざ','しじ','すず','せぜ','そぞ','ただ','ちぢ','つづ','てで','とど','はばぱ','ひびぴ','ふぶぷ','へべぺ','ほぼぽ']){
 const cs=[...g];RENDAKU.set(cs[0],cs[1]);RENDAKU.set(toKata(cs[0]),toKata(cs[1]));
 cs.forEach((c,k)=>{const rest=[...cs.slice(k+1),...cs.slice(0,k)];VOICE.set(c,rest);VOICE.set(toKata(c),rest.map(toKata));});
}
const voiced=r=>(VOICE.get(r[0])??[]).map(c=>c+r.slice(1));
const withRendaku=(rs,first)=>rs.flatMap(r=>!first&&RENDAKU.has(r[0])?[r,RENDAKU.get(r[0])+r.slice(1)]:[r]);
// The kana of a reading in morae: a small ゃ, ゅ, ょ (and ぁ …) goes with the kana before it.
const moraeOf=r=>[...r].reduce((m,ch)=>{if(SMALL.test(ch)&&m.length)m[m.length-1]+=ch;else m.push(ch);return m;},[]);
const ROW_O=new Set([...'おこごそぞとどのほぼぽもよろをょ']),ROW_U=new Set([...'うくぐすずつづぬふぶぷむゆるゅ']),ROW_E=new Set([...'えけげせぜてでねへべぺめれ']);
// A small っ stands only before a か-, さ-, た- or ぱ-row kana.
const GEM_NEXT=/^[かきくけこさしすせそたちつてとぱぴぷぺぽ]/;
// Slips on a reading (hiragana), long-vowel and gemination ones interleaved: a long vowel dropped (う after an お- or
// う-row mora, い after an え-row one, or ー) or added (う after an お-row mora, い after an え-row one; never after a bare
// vowel, nor before ん, っ, ー or a vowel); a small っ removed, or put before a か/さ/た/ぱ-row mora (never first, never
// after ん, っ, ー or a long vowel).
function slips(reading){
 const r=toHira(reading),m=moraeOf(r),at=(k,x)=>[...m.slice(0,k),...x,...m.slice(k)].join(''),without=k=>[...m.slice(0,k),...m.slice(k+1)].join('');
 const last=k=>(m[k]??'').at(-1)??'',isLong=k=>{const p=last(k-1);return k>0&&(m[k]==='ー'||(m[k]==='う'&&(ROW_O.has(p)||ROW_U.has(p)))||(m[k]==='い'&&ROW_E.has(p)));};
 const long=[],gem=[];
 m.forEach((x,k)=>{if(isLong(k))long.push(without(k));});
 m.forEach((x,k)=>{
  if(/^[あいうえおんっー]$/.test(x)||/^[あいうえおんっー]/.test(m[k+1]??''))return;
  if(ROW_O.has(last(k)))long.push(at(k+1,['う']));else if(ROW_E.has(last(k)))long.push(at(k+1,['い']));
 });
 m.forEach((x,k)=>{if(x==='っ')gem.push(without(k));});
 m.forEach((x,k)=>{if(k>0&&GEM_NEXT.test(x)&&!/^[んっー]$/.test(m[k-1])&&!isLong(k-1))gem.push(at(k,['っ']));});
 const out=[];for(let k=0;k<Math.max(long.length,gem.length);k++){if(k<long.length)out.push(long[k]);if(k<gem.length)out.push(gem[k]);}
 return out;
}
// A reading a learner could meet: kana only, not opening with っ, ん, ー or a small kana, every small っ before a
// か/さ/た/ぱ-row kana (never before a vowel, a な/ま/や/ら/わ-row kana, a voiced one, ん, or at the end), no ん twice in a
// row and no ぢゃ, ぢゅ, ぢょ.
const possible=s=>KANA.test(s)&&!/^[っッんンーゃゅょぁぃぅぇぉゎャュョァィゥェォ]/.test(s)&&!/[んン]{2}|[ぢヂ][ゃゅょャュョ]/.test(s)&&[...s].every((c,i,a)=>!/[っッ]/.test(c)||GEM_NEXT.test(toHira(a[i+1]??'')));
// A later mora of a reading voiced or unvoiced (みず → みす), each mora in turn.
const voicedLater=r=>{const m=moraeOf(r);return m.slice(1).flatMap((x,k)=>voiced(x).map(v=>[...m.slice(0,k+1),v,...m.slice(k+2)].join('')));};
// How much two readings share: the kana they end on in common, then the kana they open with (さがる and あがる share がる).
const shared=(a,b)=>{let e=0;while(e<a.length&&e<b.length&&a.at(-1-e)===b.at(-1-e))e++;let s=0;while(s<a.length&&s<b.length&&a[s]===b[s])s++;return e*100+s;};
// The wrong readings for word w and kanji e, as tiers in priority order (each in seeded order); token t holds e.char.
//  1. t's reading replaced by each other reading of the kanji (otherReadings), each followed by its rendaku form when t is
//     not the word's first token. A token of several kanji (今年) takes every mix of its kanji's readings instead.
//  2. one other token's reading replaced by one of ITS readings (tokenReadings, rendaku as in 1), one token a candidate.
//  3. a voicing change on the first kana of t's reading, then of each other token's (はんぶん → ぱんぶん), then on a later
//     mora of t's reading (みず → みす).
//  4. slips on t's reading (slips), then on each other kanji token's (ちゅうい → ちゅいい).
//  5. the readings of the list's other words of the answer's mora count ±1; then the list's other words, then every
//     track word; each by closeness of mora count, then by the kana shared with the answer (shared), then seeded order.
// pickWrong keeps the first three that are possible, distinct and not the answer.
function wordReadingTiers(w,tokens,t,{e,list,any,chars,rand}){
 const read=tokens.map(x=>x.reading??x.text),own=read[t],swap=(k,r)=>read.map((x,i)=>i===k?r:x).join('');
 const cs=[...tokens[t].text];let mine;
 if(cs.length>1&&cs.every(c=>chars.has(c)))mine=shuffled(cs.reduce((acc,c)=>acc.flatMap(a=>otherReadings(chars.get(c)).map(r=>a+r)).slice(0,256),['']),rand('wordReading|readings'));
 else mine=withRendaku(shuffled(otherReadings(e),rand('wordReading|readings')),t===0);
 const kanji=tokens.map((x,k)=>x.reading!==null&&k!==t?k:-1).filter(k=>k>=0);
 const theirs=shuffled(kanji.flatMap(k=>withRendaku(tokenReadings(tokens[k].text,chars),k===0).map(r=>swap(k,r))),rand('wordReading|others'));
 const voicing=[...voiced(own).map(r=>swap(t,r)),...kanji.flatMap(k=>voiced(read[k]).map(r=>swap(k,r))),...voicedLater(own).map(r=>swap(t,r))];
 const morae=r=>moraeOf(r).length,n=morae(w.reading),far=r=>Math.abs(morae(r)-n);
 const byLength=rs=>rs.map((r,k)=>({r,k,s:shared(r,w.reading)})).sort((a,b)=>far(a.r)-far(b.r)||b.s-a.s||a.k-b.k).map(x=>x.r);
 const listed=shuffled([...new Set(others(list,e).flatMap(x=>x.words.map(y=>y.reading)))],rand('wordReading|words'));
 const everyWord=[...new Set(others(any,e).flatMap(x=>x.words.map(y=>y.reading)))];
 return [mine.filter(r=>r!==own).map(r=>swap(t,r)),theirs,voicing,slips(own).map(r=>swap(t,r)),kanji.flatMap(k=>slips(read[k]).map(r=>swap(k,r))),byLength(listed.filter(r=>far(r)<=1)),byLength(listed),byLength(everyWord)];
}

// The readings that are also right for word w, never offered as wrong: its alsoRead, and the reading and alsoRead of every
// other words[] or special[] entry of the kanji with the same written form (私 わたし beside 私 わたくし).
const validReadings=(e,w)=>new Set([...(e.words??[]),...(e.special??[])].filter(x=>x===w||x.written===w.written).flatMap(x=>[x.reading,...(x.alsoRead??[])]));

// ── Building ───────────────────────────────────────────────────────────────────────────────────────────────
// Picks up to `n` wrong options from the tiers in order: each tier's items (already in seeded order) mapped to an option
// by `make` (null to skip), distinct by text and never `right`'s text.
function pickWrong(tiers,make,right,n=OPTIONS-1){
 const seen=new Set([right.text]),out=[];
 for(const tier of tiers)for(const x of tier){if(out.length===n)return out;const o=make(x);if(!o||seen.has(o.text))continue;seen.add(o.text);out.push(o);}
 return out;
}
// The question from its right and wrong options ([right, …wrong] shuffled by rand(`${kind}|order`)), or null when short.
function asked(kind,e,rand,right,wrong,fields={}){
 if(wrong.length<OPTIONS-1)return null;
 const options=shuffled([right,...wrong.slice(0,OPTIONS-1)],rand(`${kind}|order`));
 const [prompt,render]=PROMPTS[kind];
 return {kind,char:e.char,prompt,render,options,answer:options.indexOf(right),meaning:meaningOf(e),...fields};
}
// ctx: {e (the entry), list (the entries asked about), before (the track's entries up to the list's last, in track
// order: the kanji the learner has met by now), any (every track entry), rand(part), pick (the readingHere sentence)}.
const others=(list,e)=>list.filter(x=>x.char!==e.char);
const BUILD={
 meaning({e,list,before,any,rand}){
  const tiers=[shuffled(others(list,e),rand('meaning|list')),shuffled(others(before,e),rand('meaning|met')),shuffled(others(any,e),rand('meaning|any'))];
  const right={char:e.char,text:meaningOf(e)};
  return asked('meaning',e,rand,right,pickWrong(tiers,x=>sameMeaning(e,x)?null:{char:x.char,text:meaningOf(x)},right));
 },
 readingHere({e,rand,pick}){
  const s=e.sentences[pick],right={text:plainReading(s.mark)};
  const wrong=pickWrong([shuffled(s.distractors,rand('readingHere'))],text=>({text}),right);
  return asked('readingHere',e,rand,right,wrong,{sentence:{ja:s.ja,mark:s.mark,en:s.en}});
 },
 chooseKanji({e,list,any,rand,pick}){
  const n=e.sentences.length,s=e.sentences[n>1?(pick+1)%n:pick],written=plainWritten(s.mark),right={text:written};
  const tiers=[shuffled(e.lookAlikes,rand('chooseKanji|lookAlikes')),shuffled(others(list,e).map(x=>x.char),rand('chooseKanji|list')),shuffled(others(any,e).map(x=>x.char),rand('chooseKanji|any'))];
  const wrong=pickWrong(tiers,c=>c===e.char?null:{text:written.replaceAll(e.char,c)},right);
  return asked('chooseKanji',e,rand,right,wrong,{sentence:{ja:s.ja,mark:s.mark,en:s.en}});
 },
 wordReading(ctx){
  const {e,rand,pick}=ctx;
  const marked=plainWritten(e.sentences[pick].mark),core=e.words.filter(w=>w.core);
  const pool=[core.filter(w=>w.written!==marked),core,e.words].find(p=>p.length);
  const w=pool[Math.floor(rand('word')()*pool.length)],tokens=wordTokens(w.markup);
  const t=tokens.findIndex(x=>x.reading!==null&&x.text.includes(e.char));if(t<0)return null;
  const valid=validReadings(e,w),right={text:w.reading};
  const wrong=pickWrong(wordReadingTiers(w,tokens,t,ctx),text=>possible(text)&&!valid.has(text)?{text}:null,right);
  return asked('wordReading',e,rand,right,wrong,{word:{written:w.written,reading:w.reading,markup:w.markup,romaji:w.romaji,en:w.en}});
 },
 soundMatch({e,list,before,any,rand,chars}){
  const keys=readingKeys(e),rankOf=c=>{const x=chars.get(c);if(!x)return 1;const k=readingKeys(x);return [...k].some(r=>keys.has(r))?2:0;};
  const later=any.filter(x=>!before.includes(x));
  const tiers=[shuffled(others(list,e).map(x=>x.char),rand('soundMatch|list')),shuffled(e.lookAlikes,rand('soundMatch|lookAlikes')),shuffled(others(before,e).map(x=>x.char),rand('soundMatch|met')),shuffled(others(later,e).map(x=>x.char),rand('soundMatch|any'))];
  const order=[...new Set(tiers.flat())].filter(c=>c!==e.char&&!(chars.has(c)&&sameReadings(readingKeys(chars.get(c)),keys))).map((c,k)=>({c,k,r:rankOf(c)})).sort((a,b)=>a.r-b.r||a.k-b.k);
  const right={char:e.char,text:e.char},wrong=pickWrong([order.map(x=>x.c)],c=>({char:c,text:c}),right);
  return asked('soundMatch',e,rand,right,wrong,{readings:readingsText(e)});
 }
};
// Every question of every kanji of the list, by kanji then kind: {byChar: Map char → {kind: question|null}, gaps:
// [{char, kind}] for each one that cannot be built}.
function buildAll(track,list,seed){
 const any=track?.order??[],chars=track?.chars instanceof Map?track.chars:new Map(any.map(x=>[x.char,x]));
 const last=Math.max(-1,...list.map(e=>any.findIndex(x=>x.char===e.char))),before=any.slice(0,last+1);
 const byChar=new Map(),gaps=[];
 for(const e of list){
  const rand=part=>seeded(`kanji-practice|${seed}|${e.char}|${part}`);
  const n=Array.isArray(e.sentences)?e.sentences.length:0,pick=n?Math.floor(rand('sentence')()*n):0;
  const ctx={e,list,before,any,rand,pick,chars},qs={};
  for(const kind of KINDS){let q=null;try{q=n?BUILD[kind](ctx):null;}catch{q=null;}qs[kind]=q;if(!q)gaps.push({char:e.char,kind});}
  byChar.set(e.char,qs);
 }
 return {byChar,gaps};
}
const listOf=chars=>Array.isArray(chars)?chars.filter(e=>e&&typeof e.char==='string'):[];
// The questions that cannot be built for the list ([{char, kind}], empty when every one can): the validator names them.
export const practiceGaps=(track,chars,seed)=>buildAll(track,listOf(chars),String(seed)).gaps;
// The ordered practice for `chars` (track character entries, normally a set's ten), or null when the list is empty or any
// question cannot be built. Five rounds; round r asks every kanji once, in a seeded order, kanji k (its index in chars)
// getting KINDS[(r + k) % 5], so each kanji meets each kind once and a round mixes kinds. When a round would open with the
// kanji the round before ended on, its first two questions swap, so one kanji is never asked twice in a row (unless the
// list has one kanji). Every draw is seeded by kanji-practice|seed|char|part (the rounds' order by char '').
export function practiceQuestions(track,chars,seed){
 const list=listOf(chars);if(!list.length)return null;
 const {byChar,gaps}=buildAll(track,list,String(seed));if(gaps.length)return null;
 const out=[];
 for(let r=0;r<PER_KANJI;r++){
  const round=shuffled(list.map((e,k)=>({e,k})),seeded(`kanji-practice|${seed}||round${r}`)).map(({e,k})=>byChar.get(e.char)[KINDS[(r+k)%KINDS.length]]);
  if(out.length&&round.length>1&&round[0].char===out.at(-1).char)[round[0],round[1]]=[round[1],round[0]];
  out.push(...round);
 }
 return frozen(out);
}
// Where a run stands against its questions: {at (answers given), total, right, done (at >= total), missed (the kanji of
// the questions answered wrong, in question order, each once)}.
export function practiceProgress(questions,run){
 const qs=Array.isArray(questions)?questions:[],answers=Array.isArray(run?.answers)?run.answers.slice(0,qs.length):[];
 const missed=[];answers.forEach((a,i)=>{if(a===false&&!missed.includes(qs[i].char))missed.push(qs[i].char);});
 return {at:answers.length,total:qs.length,right:answers.filter(a=>a===true).length,done:answers.length>=qs.length,missed};
}
// The feedback line's facts, the right answer whatever was picked: {right, ja, en}. ja (markup or null) comes first, drawn
// by the app in furigana, then right (plain text), then en (or null):
//  meaning 山 · mountain; readingHere [ふじ山 in furigana] is read ふじさん here + en; chooseKanji ふじさん is written ふじ山 +
//  en; wordReading [the word in furigana] fujisan + en; soundMatch サン、やま is 山 · mountain.
export function feedbackOf(q){
 const right=q?.options?.[q.answer]?.text??'';
 switch(q?.kind){
  case 'meaning':return {right:`${q.char} · ${right}`,ja:null,en:null};
  case 'readingHere':return {right:`is read ${right} here`,ja:q.sentence.mark,en:q.sentence.en};
  case 'chooseKanji':return {right:`${plainReading(q.sentence.mark)} is written ${right}`,ja:null,en:q.sentence.en};
  case 'wordReading':return {right:q.word.romaji,ja:q.word.markup,en:q.word.en};
  case 'soundMatch':return {right:`${q.readings} is ${q.char} · ${q.meaning}`,ja:null,en:null};
  default:return {right,ja:null,en:null};
 }
}

// ── Display ────────────────────────────────────────────────────────────────────────────────────────────────
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
// Markup as HTML (text escaped here). show 'furigana': each token as ruby, the reading in <rt>; 'kanji': the written
// forms only; 'kana': the readings only. A token whose written form holds `hot` is marked kanji-hot (red): its <rt> in
// furigana, a <span> round its kanji or its reading otherwise. Plain text between tokens is escaped as it is. A sentence
// with a red mark is composed by the app: ja split at mark, rubyHTML(before) + rubyHTML(mark, {hot, show}) +
// rubyHTML(after).
export function rubyHTML(markup,{hot=null,show='furigana'}={}){
 return wordTokens(markup).map(({text,reading})=>{
  if(reading===null)return esc(text);
  const isHot=!!hot&&text.includes(hot);
  if(show==='kanji')return isHot?`<span class="kanji-hot">${esc(text)}</span>`:esc(text);
  if(show==='kana')return isHot?`<span class="kanji-hot">${esc(reading)}</span>`:esc(reading);
  return `<ruby>${esc(text)}<rp>(</rp><rt${isHot?' class="kanji-hot"':''}>${esc(reading)}</rt><rp>)</rp></ruby>`;
 }).join('');
}
