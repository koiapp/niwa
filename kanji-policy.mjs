// Kanji policy: the rules of the Kanji page as data. A policy says how many cards a day's round has, how many met words
// open it, which questions a card's trial asks and in what order, how many options each question has, whether the first
// wrong answer closes the card, how many right answers pass a trial, how many passed trials (on different days) make a
// word known, how the round ranks the met words, whether known words come back as review, and how a met word is printed
// (metStyle). kanji-words.mjs and
// kanji-cards.mjs read every rule from a policy, so an edition changes them by data, not by code. Pure: no imports, no DOM,
// no clock. Spec: docs/data-contract.md "Kanji cards"; design: docs/curriculum.md "Kanji growth".
//
// Content with no `kanji.policy` (lessons.json today) gets DEFAULT_POLICY, which is the personal edition's rules as of
// 2026-10-23: nine cards, opening at nine met words, a meaning, a reading and a sentence question, the first miss closing
// the card, all three right passing it, three passes making the word known. The classroom edition will set its own
// `kanji.policy` and `kanji.course` (its textbook's kanji order, N5 onwards) in its lessons.json. The two editions are
// content profiles, "personal" and "course" (the course profile builds under niwa/course/, its own seeds emitting its own
// lessons.json); the engine files are the same in both builds and never read the profile id, only the content.
// An edition's own names and places that stay in kana, content.kanji.properNouns = {names?, places?}, are read here
// (readProperNouns) and merged by the app over kanji-words.mjs PROPER_NOUNS when it builds the index.
//
// The course list, content.kanji.course = {version: 1, entries: [{word, kanji?, level?, unit?, requires?}]}, orders the
// kanji words as a textbook teaches them: with order 'course' the round draws them in that order (courseRank), and a word
// whose entry `requires` loop refs (lesson:f01, practice:<id>, book:<id>, lesson:<id>/<part>) that are not met yet gets no
// card (eligibleWords). A word with no entry is drawn as today.
//
// A new question kind: write its builder in kanji-cards.mjs QUESTION_KINDS and name it in QUESTION_KIND_NAMES here; a policy
// can then list it in `questions` and give its `options`.
//
// A profile with a kanji track (kanji-characters.mjs; docs/data-contract.md "Kanji sets", 2026-10-29) has no round: its
// Kanji page is the sets, which no policy field shapes. The character fields of the first course
// build (characterQuestions, their option counts, unmetDistractors) were removed with the set model; a policy naming one
// is rejected as an unknown field.
export const KANJI_POLICY_VERSION=1;
// How a met kanji word (introduced, not yet known) is printed: 'kanji-above' (the default) is the kana with the kanji
// small above; 'furigana' is the textbook's form, the kanji with its reading small above. Known and not-met words are
// unaffected. Since 2026-10-29 running text no longer draws the met stage (it is kana unless Show all kanji shows a
// mastered word), so metStyle is read and validated but unused by text display; kanji-words.mjs metDisplay is kept.
export const MET_STYLES=Object.freeze(['kanji-above','furigana']);
export const QUESTION_KIND_NAMES=Object.freeze(['meaning','reading','sentence']);
export const DEFAULT_POLICY=Object.freeze({
 version:1,
 roundSize:9,
 opensAt:9,
 questions:Object.freeze(['meaning','reading','sentence']),
 options:Object.freeze({meaning:4,reading:4,sentence:3}),
 closeOnMiss:true,
 passAt:3,
 knownAt:3,
 order:'met',
 reviewKnown:true,
 metStyle:'kanji-above'
});
const POLICY_KEYS=Object.keys(DEFAULT_POLICY);
const SLUG=/^[a-z][a-z0-9-]*$/;
const REF=/^(lesson|practice|book):[a-z0-9-]+(\/[a-z0-9-]+)?$/;
const COURSE_KEYS=['version','entries'];
const ENTRY_KEYS=['word','kanji','level','unit','requires'];
const plainObject=v=>!!v&&typeof v==='object'&&!Array.isArray(v);
const own=(o,k)=>plainObject(o)&&Object.prototype.hasOwnProperty.call(o,k);
const between=(v,lo,hi)=>Number.isInteger(v)&&v>=lo&&v<=hi;
const text=v=>typeof v==='string'&&v.trim().length>0;
const idSet=wordIds=>wordIds==null?null:typeof wordIds.has==='function'?wordIds:new Set(wordIds);

// ── The policy ─────────────────────────────────────────────────────────────────────────────────────────────
// Resolves a raw policy over DEFAULT_POLICY field by field: {policy, problems}, problems naming every field that fails (and
// every unknown key), policy keeping the default for each failed field. passAt, when absent or failed, is the number of
// questions (all right), so a policy that only shortens `questions` stays valid. options keeps the default count of a kind
// it does not give.
function resolvePolicy(raw){
 const problems=[],out={...DEFAULT_POLICY};
 if(raw===undefined||raw===null)return {policy:DEFAULT_POLICY,problems};
 if(!plainObject(raw))return {policy:DEFAULT_POLICY,problems:['it must be an object']};
 for(const k of Object.keys(raw))if(!POLICY_KEYS.includes(k))problems.push(`${k} is not a policy field`);
 const field=(k,ok,why)=>{if(!own(raw,k))return;if(ok(raw[k]))out[k]=raw[k];else problems.push(`${k} ${why}`);};
 field('version',v=>v===KANJI_POLICY_VERSION,`must be ${KANJI_POLICY_VERSION}`);
 field('roundSize',v=>between(v,1,25),'must be an integer from 1 to 25');
 field('opensAt',v=>between(v,0,100),'must be an integer from 0 to 100');
 const kinds=names=>v=>Array.isArray(v)&&v.length>0&&v.every(x=>names.includes(x))&&new Set(v).size===v.length;
 field('questions',kinds(QUESTION_KIND_NAMES),`must be a list of distinct question kinds (${QUESTION_KIND_NAMES.join(', ')})`);
 const options={...DEFAULT_POLICY.options};
 if(own(raw,'options')){
  const o=raw.options;
  if(!plainObject(o))problems.push('options must be an object of option counts');
  else for(const [k,v] of Object.entries(o)){
   if(!QUESTION_KIND_NAMES.includes(k)){problems.push(`options.${k} is not a question kind`);continue;}
   if(between(v,2,6))options[k]=v;else problems.push(`options.${k} must be an integer from 2 to 6`);
  }
 }
 for(const k of out.questions)if(!between(options[k],2,6)){problems.push(`options.${k} must be given for the ${k} question`);options[k]=DEFAULT_POLICY.options[k];}
 field('closeOnMiss',v=>typeof v==='boolean','must be true or false');
 const n=out.questions.length;out.passAt=n;
 field('passAt',v=>between(v,1,n)&&(!out.closeOnMiss||v===n),out.closeOnMiss?`must be ${n} (every question right) while closeOnMiss is true`:`must be an integer from 1 to ${n}`);
 field('knownAt',v=>between(v,1,20),'must be an integer from 1 to 20');
 field('order',v=>v==='met'||v==='course',"must be 'met' or 'course'");
 field('reviewKnown',v=>typeof v==='boolean','must be true or false');
 field('metStyle',v=>MET_STYLES.includes(v),`must be one of ${MET_STYLES.map(x=>`'${x}'`).join(', ')}`);
 return {policy:Object.freeze({...out,questions:Object.freeze([...out.questions]),options:Object.freeze(options)}),problems};
}
// Every problem of a raw kanji.policy, for the validator: empty for an absent (undefined or null) policy or a valid one.
export const policyProblems=raw=>resolvePolicy(raw).problems;
// The content's kanji policy (content.kanji.policy over DEFAULT_POLICY), frozen with its questions and options. Strict
// (the validator, a content load that must be right) throws on the first problem; lenient ignores unknown keys and keeps
// the default for a field that fails, and the whole default when the policy is not an object.
export function readKanjiPolicy(content,{strict=false}={}){
 const {policy,problems}=resolvePolicy(content?.kanji?.policy);
 if(strict&&problems.length)throw Error(`This content has an invalid kanji policy: ${problems[0]}.`);
 return policy;
}
// The card-closing rules kanji-words.mjs needs (its DEFAULT_RULES for DEFAULT_POLICY): {questions (how many), closeOnMiss,
// passAt}, frozen, the same object for the same policy.
const RULES=new WeakMap();
export function rulesOf(policy=DEFAULT_POLICY){
 const p=plainObject(policy)?policy:DEFAULT_POLICY;
 if(RULES.has(p))return RULES.get(p);
 const r=Object.freeze({questions:p.questions.length,closeOnMiss:p.closeOnMiss,passAt:p.passAt});
 RULES.set(p,r);return r;
}

// ── The course list ────────────────────────────────────────────────────────────────────────────────────────
// An entry's problems: a plain object of known keys, a slug word (in wordIds when given), kanji, level and unit non-empty
// strings when present, requires a list of loop refs when present.
function entryProblems(e,k,ids){
 if(!plainObject(e))return [`entry ${k} must be an object`];
 const out=[],name=typeof e.word==='string'?e.word:`entry ${k}`;
 for(const key of Object.keys(e))if(!ENTRY_KEYS.includes(key))out.push(`${name}: ${key} is not a course field`);
 if(typeof e.word!=='string'||!SLUG.test(e.word))out.push(`entry ${k} must name a kanji word ID`);
 else if(ids&&!ids.has(e.word))out.push(`${e.word} is not a kanji word`);
 for(const key of ['kanji','level','unit'])if(own(e,key)&&!text(e[key]))out.push(`${name}: ${key} must be a non-empty string`);
 if(own(e,'requires')&&!(Array.isArray(e.requires)&&e.requires.every(r=>typeof r==='string'&&REF.test(r))))out.push(`${name}: requires must be a list of lesson:, practice: or book: refs`);
 return out;
}
function resolveCourse(raw,ids){
 const problems=[],entries=[];
 if(raw===undefined||raw===null)return {entries,problems};
 if(!plainObject(raw))return {entries,problems:['it must be an object']};
 for(const k of Object.keys(raw))if(!COURSE_KEYS.includes(k))problems.push(`${k} is not a course field`);
 if(raw.version!==KANJI_POLICY_VERSION)problems.push(`version must be ${KANJI_POLICY_VERSION}`);
 if(!Array.isArray(raw.entries))return {entries,problems:[...problems,'entries must be a list']};
 const seen=new Set();
 raw.entries.forEach((e,k)=>{
  const p=entryProblems(e,k,ids);
  if(!p.length&&seen.has(e.word))p.push(`${e.word} is listed twice`);
  if(p.length){problems.push(...p);return;}
  seen.add(e.word);
  entries.push(Object.freeze({word:e.word,...Object.fromEntries(['kanji','level','unit'].filter(key=>own(e,key)).map(key=>[key,e[key]])),...(own(e,'requires')?{requires:Object.freeze([...e.requires])}:{})}));
 });
 return {entries,problems};
}
// Every problem of a raw kanji.course, for the validator: empty for an absent one. wordIds: the kanji word IDs (an array, a
// Set, or index.words); without it any slug is accepted.
export const courseProblems=(raw,{wordIds}={})=>resolveCourse(raw,idSet(wordIds)).problems;
// The content's course list as {entries (frozen, in course order), rank: Map word → position}; empty for none. Strict
// throws on the first problem; lenient drops each bad or repeated entry (and every entry when the list itself is unusable).
export function readKanjiCourse(content,{strict=false,wordIds}={}){
 const raw=content?.kanji?.course,{entries,problems}=resolveCourse(raw,idSet(wordIds));
 if(strict&&problems.length)throw Error(`This content has an invalid kanji course: ${problems[0]}.`);
 const usable=plainObject(raw)&&raw.version===KANJI_POLICY_VERSION?entries:[];
 return Object.freeze({entries:Object.freeze(usable),rank:new Map(usable.map((e,k)=>[e.word,k]))});
}
// The met word IDs (order kept) that may have a card: a word whose course entry has requires gets one once refMet(ref) is
// true for every ref; a word with no entry, or none of requires, always may.
export function eligibleWords(met,{course=null,refMet=()=>false}={}){
 const byWord=new Map((Array.isArray(course?.entries)?course.entries:[]).map(e=>[e.word,e]));
 return [...(met??[])].filter(id=>(byWord.get(id)?.requires??[]).every(r=>refMet(r)));
}
// The positions of the ids that are in the course, in course order (0, 1, …), for cardRound's rank; ids not in the course
// are absent, and cardRound draws them after the ranked ones.
export function courseRank(course,ids){
 const want=new Set(ids??[]),out=new Map();
 for(const e of Array.isArray(course?.entries)?course.entries:[])if(want.has(e.word)&&!out.has(e.word))out.set(e.word,out.size);
 return out;
}

// ── Proper nouns ───────────────────────────────────────────────────────────────────────────────────────────
// content.kanji.properNouns = {names?, places?}: the edition's own people's names and places (written forms) that stay in
// kana, each list distinct non-empty strings. The app merges them over kanji-words.mjs PROPER_NOUNS for kanjiWordIndex.
const NOUN_KEYS=['names','places'];
function resolveProperNouns(raw){
 const problems=[],out={names:[],places:[]};
 if(raw===undefined||raw===null)return {lists:out,problems};
 if(!plainObject(raw))return {lists:out,problems:['it must be an object']};
 for(const k of Object.keys(raw))if(!NOUN_KEYS.includes(k))problems.push(`${k} is not a proper-noun list`);
 for(const k of NOUN_KEYS){
  if(!own(raw,k))continue;
  if(!Array.isArray(raw[k])){problems.push(`${k} must be a list`);continue;}
  for(const v of raw[k]){
   if(!text(v))problems.push(`${k} must hold non-empty strings`);
   else if(out[k].includes(v))problems.push(`${k} lists ${v} twice`);
   else out[k].push(v);
  }
 }
 return {lists:out,problems};
}
// Every problem of a raw kanji.properNouns, for the validator: empty for an absent one.
export const properNounProblems=raw=>resolveProperNouns(raw).problems;
// The content's proper nouns as frozen {names, places} (empty lists for none). Strict throws on the first problem; lenient
// drops each bad or repeated value (and a list that is not a list).
export function readProperNouns(content,{strict=false}={}){
 const {lists,problems}=resolveProperNouns(content?.kanji?.properNouns);
 if(strict&&problems.length)throw Error(`This content has an invalid kanji proper-noun list: ${problems[0]}.`);
 return Object.freeze({names:Object.freeze(lists.names),places:Object.freeze(lists.places)});
}
