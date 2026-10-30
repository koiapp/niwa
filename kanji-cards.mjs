// The word-card Kanji page (#kanji in a profile with no kanji track; docs/data-contract.md "Kanji cards", learning-loop.md
// decision 18): today's grid of word cards, the trial behind each card, the done and replay rules, the collection, the
// unlock and the ledger entry of a trial. Pure: no DOM and no clock. Days are local calendar days as
// YYYY-MM-DD (kanji-words.mjs localDay), passed in by the caller.
//
// kw is state.kanjiWords ({version, words: {id: {met, points, pointDay, known, missed}}}, points being passed trials); kc is
// state.kanjiCards ({version, day, cards: [{word}], answers: {card index: [true|false per question answered]}, finished}).
// kanji-words.mjs draws the round's words (cardRound, called with size ROUND_SIZE), saves it (startRound) and changes it
// (answerCard, finishRound, replayRound), and records a closed trial for its word (recordTrial). This module builds each
// card's trial and says what the page shows and what an answer does.
//
// The round opens at ROUND_OPENS_AT met words. Each card is one trial a day of three questions, in order: the word's
// meaning, its reading, and which of three sentences it fits. The trial passes only when all three are right; the first
// wrong answer closes the card for today. On the first pass a closed trial scores (a pass is a point for the word, at most
// one a day; a fail costs nothing) and logs one `kanji` outcome per word a day. Once every card is closed the round is
// finished, and the day is done. A replay clears the answers and keeps the round finished, so it scores and logs nothing.
//
// Those are the rules of DEFAULT_POLICY (kanji-policy.mjs). Every rule here takes a policy as its last argument (or
// ctx.policy), DEFAULT_POLICY when not given, so an edition's content changes the round's size, its opening, the trial's
// questions and options, whether a miss closes the card and what passes it (readKanjiPolicy). The constants below are the
// default policy's, kept for the callers that name them. It imports only kanji-words.mjs and kanji-policy.mjs.
//
// Word cards only. A profile with a kanji track (kanji-characters.mjs; docs/data-contract.md "Kanji sets", 2026-10-29) has
// no round and no trial: its Kanji page is the sets, practised through kanji-practice.mjs.
import {resolveText,cardText,seeded,shuffled,cardAnswers,cardClosed,cardPassed} from './kanji-words.mjs?b=2bde53d';
import {DEFAULT_POLICY,rulesOf} from './kanji-policy.mjs?b=2bde53d';
export const ROUND_SIZE=DEFAULT_POLICY.roundSize;
export const ROUND_OPENS_AT=DEFAULT_POLICY.opensAt;
export const TRIAL_ASKS=DEFAULT_POLICY.questions;
export const TRIAL_OPTIONS=DEFAULT_POLICY.options;
export const BLANK='＿';

const plainObject=v=>!!v&&typeof v==='object'&&!Array.isArray(v);
const cardsOf=kc=>Array.isArray(kc?.cards)?kc.cards:[];
const text=v=>typeof v==='string'&&v.trim().length>0;

// ── The collection ─────────────────────────────────────────────────────────────────────────────────────────
// Every met word as {id, points, known, missed}, in the order met: by met day, then by `order` (the vocabulary's IDs, an
// array or a Map id → position), then by ID. points is the word's passed trials; known is the day the word became known,
// or null. keep(id) leaves out what the content no longer has.
export function collection(kw,{order=[],keep=()=>true}={}){
 const words=plainObject(kw?.words)?kw.words:{},rank=order instanceof Map?order:new Map([...order].map((id,k)=>[id,k]));
 const at=id=>rank.has(id)?rank.get(id):Number.MAX_SAFE_INTEGER;
 return Object.entries(words).filter(([id,e])=>keep(id)&&plainObject(e)&&typeof e.met==='string')
  .sort(([a,x],[b,y])=>x.met.localeCompare(y.met)||at(a)-at(b)||(a<b?-1:a>b?1:0))
  .map(([id,e])=>({id,points:Number.isInteger(e.points)?e.points:0,known:typeof e.known==='string'?e.known:null,missed:e.missed===true}));
}
// Whether the round is open with this many met words (policy.opensAt or more).
export const roundOpen=(met,policy=DEFAULT_POLICY)=>Number.isInteger(met)&&met>=policy.opensAt;
// Whether a finish took the met words from below policy.opensAt to it or beyond: the first round has just opened.
export const roundOpened=(before,after,policy=DEFAULT_POLICY)=>!roundOpen(before,policy)&&roundOpen(after,policy);

// ── Today's round ──────────────────────────────────────────────────────────────────────────────────────────
// Whether today's round must be drawn: none is saved for `today`, or the saved one is empty, or it is longer than
// policy.roundSize (a round drawn before the page had nine cards, or under a larger round), which is redrawn.
export const needsRound=(kc,today,policy=DEFAULT_POLICY)=>!today||kc?.day!==today||!cardsOf(kc).length||cardsOf(kc).length>policy.roundSize;
// A card's state: open (no answer yet, or a trial under way), right (passed) or wrong (closed without passing). null for
// no such card.
export function cardState(kc,i,policy=DEFAULT_POLICY){
 if(!cardsOf(kc)[i])return null;
 const rules=rulesOf(policy);
 if(!cardClosed(kc,i,rules))return 'open';
 return cardPassed(kc,i,rules)?'right':'wrong';
}
// Whether answers score now: the first pass does; a replay (a round already finished) does not.
export const scoring=kc=>kc?.finished!==true;
// {total, answered, right, complete} for the round as it stands: answered counts closed cards, right the passed ones,
// complete once every card is closed.
export function roundTally(kc,policy=DEFAULT_POLICY){
 const cards=cardsOf(kc);let n=0,right=0;
 cards.forEach((c,i)=>{const s=cardState(kc,i,policy);if(s==='open')return;n++;if(s==='right')right++;});
 return {total:cards.length,answered:n,right,complete:cards.length>0&&n===cards.length};
}
// Today's grid: policy.roundSize cells (ROUND_SIZE by default). met: the met word IDs, in collection order.
//  - Before the round opens, the met words' cards are inert ({kind: 'inert', word}) and the other cells blank.
//  - Once it opens, each of today's cards is {kind: 'card', index, word, state}, and any cell past the round's cards (a
//    round can be short when two met words share a written form) is blank.
// phase: waiting (not open), none (open, with no cards), playing (first pass), replay (a replay under way) or done (every
// card closed). need: policy.opensAt.
export function todayGrid(kc,met=[],policy=DEFAULT_POLICY){
 const ids=[...met],size=policy.roundSize,pad=cells=>{while(cells.length<size)cells.push({kind:'blank'});return cells;};
 if(!roundOpen(ids.length,policy))return {open:false,met:ids.length,need:policy.opensAt,phase:'waiting',cells:pad(ids.slice(0,size).map(word=>({kind:'inert',word}))),total:0,answered:0,right:0,complete:false};
 const t=roundTally(kc,policy),cards=cardsOf(kc).slice(0,size);
 const phase=!t.total?'none':t.complete?'done':scoring(kc)?'playing':'replay';
 return {open:true,met:ids.length,need:policy.opensAt,phase,cells:pad(cards.map((c,index)=>({kind:'card',index,word:c.word,state:cardState(kc,index,policy)}))),...t};
}

// ── The trial ──────────────────────────────────────────────────────────────────────────────────────────────
// trialBank(content, index): what a trial needs about each kanji word of `index`, from lessons.json content (vocabulary,
// lessons, practices): Map id → {id, gloss, reading, written, pos, home, node, slot, intro, sentence}.
//  - gloss and reading: cardText's meaning and whole kana reading (null when there is none).
//  - written: the word's vocabulary markup, so two words of one written form (出口) never meet in a trial. pos: its
//    vocabulary part of speech.
//  - home: the lesson or practice whose kanji words drill introduces the word (the first in content order: lessons, then
//    practices), and node: that lesson's topic (a practice's, through its home lesson). Both null for a word no drill has.
//  - intro: the drill's intro line for the word as {ja, filled, en}: ja is the line with the word's span (the longest of
//    its patterns there whose tokens resolve to it) replaced by BLANK, filled the line itself. null when no pattern of the
//    word resolves there, or the line still holds the word after the blank.
//  - sentence: the drill's authored trial sentence ({word, ja, answer, en, slot}) as {ja, filled, en}, filled being ja with
//    BLANK replaced by answer; slot: what its blank accepts (drink, food, place …). null (slot null) when the drill has
//    none, until the practice sentences land (docs/data-contract.md "Kanji words drill").
// Build it once per content load.
const owns=(t,id)=>!!t.token&&(t.word===id||t.candidates.includes(id));
// Whether a markup text holds the word: a token that resolves to it, or lists it among its candidates.
export const mentions=(markup,id,index)=>resolveText(markup,index).some(t=>owns(t,id));
// The text with the word's span replaced by BLANK, or null (above, intro).
export function blankWord(markup,id,index){
 const s=String(markup??''),entry=index?.words?.get(id);if(!entry)return null;
 const spans=[];let pos=0;for(const t of resolveText(s,index)){if(t.token)spans.push({at:pos,end:pos+t.text.length,t});pos+=t.text.length;}
 for(const pat of entry.patterns)for(let at=s.indexOf(pat);at>=0;at=s.indexOf(pat,at+1)){
  const end=at+pat.length,inside=spans.filter(x=>x.at>=at&&x.end<=end);
  if(!inside.length||!inside.every(x=>owns(x.t,id))||spans.some(x=>(x.at<at&&x.end>at)||(x.at<end&&x.end>end)))continue;
  const out=s.slice(0,at)+BLANK+s.slice(end);
  return mentions(out,id,index)?null:out;
 }
 return null;
}
export function trialBank(content,index){
 const vocab=Array.isArray(content?.vocabulary)?content.vocabulary:[],records=new Map(vocab.filter(w=>w&&typeof w.id==='string').map(w=>[w.id,w]));
 const lessons=Array.isArray(content?.lessons)?content.lessons:[],practices=Array.isArray(content?.practices?.items)?content.practices.items:[];
 const nodeOf=new Map(lessons.map(l=>[l.id,l.node??null])),drills=new Map();
 const units=[...lessons.map(l=>({id:l.id,node:l.node??null,sections:l.sections})),...practices.map(p=>({id:p.id,node:nodeOf.get(p.home)??null,sections:p.sections}))];
 for(const u of units)for(const s of Array.isArray(u.sections)?u.sections:[]){
  if(!plainObject(s)||!Array.isArray(s.kanjiWords))continue;
  for(const id of s.kanjiWords)if(!drills.has(id))drills.set(id,{home:u.id,node:u.node,intro:(Array.isArray(s.intro)?s.intro:[]).find(x=>x?.word===id),sentence:(Array.isArray(s.sentences)?s.sentences:[]).find(x=>x?.word===id)});
 }
 const bank=new Map();
 for(const id of index?.words?.keys?.()||[]){
  const w=records.get(id);if(!w)continue;
  const d=drills.get(id)||{},x=d.intro,y=d.sentence;
  const blanked=x&&text(x.ja)?blankWord(x.ja,id,index):null;
  const intro=blanked?Object.freeze({ja:blanked,filled:x.ja,en:text(x.en)?x.en:''}):null;
  const usable=y&&text(y.ja)&&text(y.answer)&&y.ja.split(BLANK).length===2;
  const filled=usable?y.ja.replace(BLANK,y.answer):null;
  const sentence=usable&&!mentions(y.ja,id,index)&&mentions(filled,id,index)?Object.freeze({ja:y.ja,filled,en:text(y.en)?y.en:''}):null;
  bank.set(id,Object.freeze({id,gloss:cardText(id,'meaning',records),reading:cardText(id,'reading',records),written:w.word,pos:w.pos??null,home:d.home??null,node:d.node??null,slot:sentence&&text(y.slot)?y.slot:null,intro,sentence}));
 }
 return bank;
}
// The kana shape of a reading: its runs of hiragana (H) and katakana (K), so パンや is KH and おみず H.
const shapeOf=r=>[...r].map(ch=>/[ァ-ヺー]/.test(ch)?'K':'H').join('').replace(/(.)\1+/g,'$1');
// How close another reading's shape is to the word's: 0 the same runs and length, 1 the same runs and a kana longer or
// shorter, 2 the same runs, 3 anything else.
const shapeRank=(a,b)=>shapeOf(a)!==shapeOf(b)?3:a.length===b.length?0:Math.abs(a.length-b.length)===1?1:2;
// The tiers of the sentence question's wrong sentences, by the word's passes: 0 words of another part of speech; 1 the
// same part of speech from another home lesson; 2 as 1, from the same topic (node). A trial tries its own tier, then each
// lower one, then any met word.
const TIERS=[(c,t)=>c.pos!==t.pos,(c,t)=>c.pos===t.pos&&c.home!==t.home,(c,t)=>c.pos===t.pos&&c.home!==t.home&&c.node===t.node];
// QUESTION_KINDS: the question kinds a trial can ask, by name (kanji-policy.mjs QUESTION_KIND_NAMES), each {prompt, render,
// build}. prompt is the question the page shows; render how its options show: text (a gloss), kana (a reading, lang ja) or
// sentence (options {word, ja, filled, en, slot}, ja holding BLANK). build(id, ctx) gives the question {ask, prompt, render,
// options, answer}, answer being the index of the right option, or null when it cannot be built. ctx: {t (the word's bank
// entry), pool (the other met words' bank entries, by ID), rand(part) (a generator seeded by the day, the word and part),
// count (policy.options for the kind), passes (the word's points), index, kw, bank}. A new kind is a new entry here and
// its name in QUESTION_KIND_NAMES.
//  - meaning: count options {word, text}, the word's gloss and the glosses of other met words, distinct as text.
//  - reading: the same with whole kana readings, the readings closest in kana shape first (shapeRank).
//  - sentence: count options {word, ja, filled, en, slot}. The right one is the word's intro line on its first trial (no
//    passes) and its authored sentence once it has passed one, each falling back to the other. The wrong ones are other
//    met words' authored sentences (a word with none has no slot and is never one), from the tier of the word's passes
//    (TIERS; two passes or more use tier 2), relaxed tier by tier; their slots differ from the word's and from each
//    other's, their texts differ, and none holds the word.
// "Other met words" are the store's words in the bank, except the word and any word of its written form. Every draw and
// every option order is seeded by the word, the day and the question (kanji-trial|day|id|part), so a day always gives the
// same trial.
function choose(id,{t,pool,rand,count},ask,textOf,rankOf=()=>0){
 const seen=new Set([textOf(t)]),others=[];
 const order=shuffled(pool,rand(ask)).map((c,k)=>({c,k,r:rankOf(c)})).sort((a,b)=>a.r-b.r||a.k-b.k);
 for(const {c} of order){const x=textOf(c);if(!x||seen.has(x))continue;seen.add(x);others.push(c);if(others.length===count-1)break;}
 if(others.length<count-1)return null;
 const options=shuffled([t,...others],rand(`${ask}|order`)).map(c=>({word:c.id,text:textOf(c)}));
 return {ask,options,answer:options.findIndex(o=>o.word===id)};
}
const asked=(kind,q)=>q&&{ask:q.ask,prompt:QUESTION_KINDS[kind].prompt,render:QUESTION_KINDS[kind].render,options:q.options,answer:q.answer};
export const QUESTION_KINDS=Object.freeze({
 meaning:Object.freeze({prompt:'What does this word mean?',render:'text',build:(id,ctx)=>ctx.t.gloss?asked('meaning',choose(id,ctx,'meaning',c=>c.gloss)):null}),
 reading:Object.freeze({prompt:'How is this word read?',render:'kana',build:(id,ctx)=>ctx.t.reading?asked('reading',choose(id,ctx,'reading',c=>c.reading,c=>c.reading?shapeRank(ctx.t.reading,c.reading):3)):null}),
 sentence:Object.freeze({prompt:'Which sentence does it fit?',render:'sentence',build(id,{t,pool,rand,count,passes,index}){
  const right=passes<1?(t.intro||t.sentence):(t.sentence||t.intro);if(!right)return null;
  const tier=Math.min(passes,TIERS.length-1),steps=[...TIERS.slice(0,tier+1).reverse(),()=>true];
  const order=shuffled(pool,rand('sentence')),slots=new Set(t.slot?[t.slot]:[]),texts=new Set([right.ja]),wrong=[];
  for(const fits of steps)for(const c of order){
   if(wrong.length===count-1)break;
   const s=c.sentence||c.intro;
   if(!s||!c.slot||slots.has(c.slot)||texts.has(s.ja)||wrong.some(x=>x.word===c.id)||!fits(c,t)||mentions(s.ja,id,index))continue;
   wrong.push({word:c.id,ja:s.ja,filled:s.filled,en:s.en,slot:c.slot});slots.add(c.slot);texts.add(s.ja);
  }
  if(wrong.length<count-1)return null;
  const options=shuffled([{word:id,ja:right.ja,filled:right.filled,en:right.en,slot:t.slot},...wrong],rand('sentence|order'));
  return asked('sentence',{ask:'sentence',options,answer:options.findIndex(o=>o.word===id)});
 }})
});
// trialQuestions(id, {bank, kw, day, index, policy}): the word's trial on `day`, one question per policy.questions kind, in
// that order (DEFAULT_POLICY: meaning, reading, sentence, as TRIAL_ASKS), or null when one of them cannot be built.
export function trialQuestions(id,{bank,kw,day,index,policy=DEFAULT_POLICY}={}){
 const rand=part=>seeded(`kanji-trial|${day}|${id}|${part}`);
 const t=bank?.get?.(id),words=plainObject(kw?.words)?kw.words:{};
 if(!t||!day)return null;
 const pool=Object.keys(words).filter(x=>x!==id&&bank.has(x)&&bank.get(x).written!==t.written).sort().map(x=>bank.get(x));
 const passes=Number.isInteger(words[id]?.points)?words[id].points:0,out=[];
 for(const kind of policy.questions){
  const q=QUESTION_KINDS[kind]?QUESTION_KINDS[kind].build(id,{t,pool,rand,count:policy.options[kind],passes,index,kw,bank}):null;
  if(!q)return null;out.push(q);
 }
 return out;
}
// The trial behind card i, or null when the card is closed, does not exist or has no trial: {index, word, questions,
// step, scoring, rules, misses}. step is the question to answer next (the number of the card's answers so far), so a
// trial left part-way resumes there; misses counts the wrong ones among them (always 0 while closeOnMiss is true); rules is
// rulesOf(ctx.policy). ctx as for trialQuestions.
export function trialOf(kc,i,ctx={}){
 const policy=ctx.policy??DEFAULT_POLICY,c=cardsOf(kc)[i];if(!c)return null;
 const rules=rulesOf(policy);if(cardClosed(kc,i,rules))return null;
 const questions=trialQuestions(c.word,{...ctx,policy});if(!questions||questions.length!==rules.questions)return null;
 const a=cardAnswers(kc,i);
 return {index:i,word:c.word,questions,step:a.length,scoring:scoring(kc),rules,misses:a.filter(x=>x===false).length};
}
// What answering the trial's current question with option `pick` does, or null for a pick outside its options or a trial
// with no question left: {index, word, step, ask, pick, correct, closes, passed, scoring}. closes: a wrong answer when
// trial.rules.closeOnMiss (the default), or the last question; passed: it closes with at least rules.passAt right answers
// (the right ones so far, step - misses, and this one when correct). The caller saves answerCard(kc, i, correct, rules) for
// every answer (for closeOnMiss false too, a wrong one included), finishes the round once it is complete (finishRound),
// and, when it closes and scores, records the word (recordTrial with passed and the policy's knownAt) and logs trialEvent.
// The next question is step + 1 of the same trial.
export function trialOutcome(trial,pick){
 const q=trial?.questions?.[trial.step];
 if(!q||!Number.isInteger(pick)||pick<0||pick>=q.options.length)return null;
 const rules=trial.rules??rulesOf(DEFAULT_POLICY),correct=pick===q.answer;
 const closes=(!correct&&rules.closeOnMiss)||trial.step===trial.questions.length-1;
 const right=trial.step-(Number.isInteger(trial.misses)?trial.misses:0)+(correct?1:0);
 return {index:trial.index,word:trial.word,step:trial.step,ask:q.ask,pick,correct,closes,passed:closes&&right>=rules.passAt,scoring:trial.scoring};
}
// The done line's facts once every card is closed: {right, total, known}, known being the round's words that became known
// on `today` (their known day), in card order, each once. null while cards are open.
export function roundSummary(kc,kw,today,policy=DEFAULT_POLICY){
 const t=roundTally(kc,policy);if(!t.complete)return null;
 const words=plainObject(kw?.words)?kw.words:{},known=[];
 for(const c of cardsOf(kc))if(today&&words[c.word]?.known===today&&!known.includes(c.word))known.push(c.word);
 return {right:t.right,total:t.total,known};
}

// ── The ledger ─────────────────────────────────────────────────────────────────────────────────────────────
// The outcome ledger entry (schedule.mjs, type kanji, venue kanji) for a closed, scored trial on `today`: one per word a day
// (its id), graded good for a pass and again for a fail, evidence only (effect recorded: nothing is scheduled), and
// eligible as a delayed answer only when the word was met before today (met: its met day before the answer, or null). The
// caller adds `at`.
export function trialEvent(word,correct,{today,met=null}={}){
 const eligible=typeof met==='string'&&!!today&&met<today;
 return {id:`kanji:${word}:${today}`,type:'kanji',ref:word,venue:'kanji',grade:correct===true?'good':'again',assisted:false,self:false,eligible,effect:'recorded',...(eligible?{}:{reason:'not-delayed'})};
}
