// Content rules: the content minimums the validator enforces, as data. A profile's curriculum.json may carry a top-level
// `rules` object (written by that profile's seed-curriculum.mjs); every field it leaves out keeps the default, and a
// curriculum.json with no `rules` (the personal profile) gets DEFAULT_RULES, the limits the validator hard-coded before
// 2026-10-28. The course profile, which follows a classroom textbook, sets lower minimums: kana-only lessons with no kanji
// words drill, no unseen transfer texts, and stones that are textbook lessons with one stage of parts. Pure: no imports,
// no DOM, no clock; the engine reads the content, never the profile id. Spec: docs/data-contract.md "Content rules".
//
// Where each rule is enforced (tools/validate.mjs):
// - kanjiWordsPerLesson {min, max}: the kanji words a lesson's kanji words drill introduces. With min 0 a lesson may have
//   no kanji words drill; a lesson that has one still introduces at most max.
// - unseenTexts {min, max}: how many unseen transfer texts the content ships. With min 0 and no texts, the unseen-text
//   fixtures and round-trips are skipped.
// - stagesPerStone {min}: the stages (sections of planned lessons) every garden stone lists.
// - kanjiCheckSentences {required}: whether every kanji word whose reading can fade needs a curriculum.json kanjiChecks
//   sentence (validateKanjiChecks coverage). With false, a fadeable word may go without one; the sentences present are
//   still validated.
export const CONTENT_RULES_VERSION=1;
export const DEFAULT_RULES=Object.freeze({
 version:1,
 kanjiWordsPerLesson:Object.freeze({min:1,max:3}),
 unseenTexts:Object.freeze({min:4,max:6}),
 stagesPerStone:Object.freeze({min:3}),
 kanjiCheckSentences:Object.freeze({required:true})
});
// Each rule's fields and their bounds: min in [lo, hi]; max (when the rule has one) from the effective min to hi; a field
// given as 'boolean' takes true or false.
const RANGES={
 kanjiWordsPerLesson:{min:[0,3],max:10},
 unseenTexts:{min:[0,6],max:6},
 stagesPerStone:{min:[1,10]},
 kanjiCheckSentences:{required:'boolean'}
};
const RULE_KEYS=['version',...Object.keys(RANGES)];
const plainObject=v=>!!v&&typeof v==='object'&&!Array.isArray(v);
const own=(o,k)=>Object.prototype.hasOwnProperty.call(o,k);
const between=(v,lo,hi)=>Number.isInteger(v)&&v>=lo&&v<=hi;

// Resolves raw rules over DEFAULT_RULES field by field: {rules, problems}, problems naming every field that fails (and every
// unknown key), rules keeping the default for each failed field. A max below the effective min fails and keeps its
// default, which is never below the top of the min's range, so the resolved rules are always consistent.
function resolveRules(raw){
 const problems=[];
 if(raw===undefined||raw===null)return {rules:DEFAULT_RULES,problems};
 if(!plainObject(raw))return {rules:DEFAULT_RULES,problems:['rules must be an object']};
 for(const k of Object.keys(raw))if(!RULE_KEYS.includes(k))problems.push(`rules.${k} is not a content rule`);
 if(own(raw,'version')&&raw.version!==CONTENT_RULES_VERSION)problems.push(`rules.version must be ${CONTENT_RULES_VERSION}`);
 const out={version:CONTENT_RULES_VERSION};
 for(const [name,range] of Object.entries(RANGES)){
  const def=DEFAULT_RULES[name],rule={...def};
  if(own(raw,name)){
   const r=raw[name];
   if(!plainObject(r))problems.push(`rules.${name} must be an object`);
   else{
    for(const k of Object.keys(r))if(!own(def,k))problems.push(`rules.${name}.${k} is not a field of this rule`);
    for(const [k,kind] of Object.entries(range))if(kind==='boolean'&&own(r,k)){if(typeof r[k]==='boolean')rule[k]=r[k];else problems.push(`rules.${name}.${k} must be true or false`);}
    if(range.min){const [lo,hi]=range.min;
    if(own(r,'min')){if(between(r.min,lo,hi))rule.min=r.min;else problems.push(`rules.${name}.min must be an integer from ${lo} to ${hi}`);}
    if(range.max!==undefined&&own(r,'max')){if(between(r.max,rule.min,range.max))rule.max=r.max;else problems.push(`rules.${name}.max must be an integer from ${rule.min} (the min) to ${range.max}`);}}
   }
  }
  out[name]=Object.freeze(rule);
 }
 return {rules:Object.freeze(out),problems};
}
// Every problem in a raw rules object (curriculum.json `rules`); [] for undefined.
export const rulesProblems=raw=>resolveRules(raw).problems;
// The effective rules of a curriculum. Strict throws on the first problem (unknown keys included); lenient keeps the
// default for every field that fails.
export function readContentRules(curriculum,{strict=false}={}){
 const {rules,problems}=resolveRules(curriculum?.rules);
 if(strict&&problems.length)throw Error(`This curriculum has invalid content rules: ${problems[0]}.`);
 return rules;
}
