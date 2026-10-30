import {validQuestion,assessChoice} from './assessment.mjs';
import {gardenMarkup,gardenStone,bindGarden} from './garden.mjs?v=watercolor-grass-5';
import {practiceWaterMarkup} from './river.mjs';
import {transferChecks} from './checks.mjs';
import {profile} from './profile.mjs';
import {stampLine} from './build-stamp.mjs';
import {STATE_VERSION,KIND_LABELS,STAGE_LABELS,passageKey,phraseKey,enterReview,scheduleReview,intervalOf,emptyRecall,attemptSummary,passageStage,migrateState,readRecallState,emptyLoop,readLoopState,completeBook,completesPassage,CONVERTED,isConverted,evidenceFor,markRuns,choiceOrder,delayedOrder,isDue,draftFor,startAttempt,answerDraft,openSupport,correctDraft,finishAttempt,fromMemory} from './recall.mjs';
import {DEFAULT_FIELDS,plainWritten,plainReading,toHiragana,indexWords,resolvePath,occurrencesAt,exerciseOccurrences,segmentText,senseFor,formFor,recordDiscovery,readDictionaryState,discoveredWords,wordMatches,entryFields,fieldCatalogue,fieldLabel,moveField,setFieldShown,emptyReadingEvidence,recordReadingMeetings,recordReadingEvent,readingProgress,readingCheckItems,kanjiWordsIn,readingChoices,sentenceRange,readReadingEvidence,stageLabel,transferSummary,readingCheckEvent} from './vocabulary.mjs';
import {DECK_PRESETS,FACE_FIELDS,RATINGS,NAME_MAX,createDeck,renameDeck,deleteDeck,restoreDeck,addToDeck,removeFromDeck,setDeckFaces,placeField,moveFaceField,fieldSide,cardFaces,rateCard,practiceQueue,decksWith,findDeck,presetFor,sampleWords,hasKanji,readDeckState,syncDeckDiscovery,queueCollection,dequeueCollection,isQueued,commitCollections,dragStep,DRAG_IDLE,HOLD_MS,SESSION_MIN,SESSION_MAX,RELEARN_MS,promptKey,reviewQueue,buildSession,startSession,endSession,currentIndex,revealItem,useSupport,itemSupported,submitRating,ratingPreview,setSessionLimit,reviewStatus,formatWait,hintFor,emptyReviewState,readReviewState,wordContext,dropRecovering} from './flashcards.mjs';
import {emptyDaily,markStarted,readDailyState,lessonStarted,migrateLeeches} from './session.mjs';
import {emptyProgression,enterLesson,finishLesson,readProgressionState,lessonLock,openLessons} from './progression.mjs';
import {stoneState,gardenRows,topicLessonGroups,plannedTitles,checkpointLocation,learnRoute,rowProgress} from './learn.mjs';
import {practicesOf,booksOf,itemState,isOpen,loopRoute,opened,partsOpened,refMet,practiceParts,partStates,currentPart,partRoute} from './loop.mjs';
import {STEMS,wordEntries,hasUnit,setLabels,lessonItems,unitItems,stemFor,clozeParts,unitKeys,splitGap,splitMark,gradeChoice,gradeTrueFalse,gradeOrder,gradeStar,gradeMatch,gradeSort,gradeGap,orderTiles,givenCount,tileBank,starOrder,pairOrder,cardOrder,bankOrder,choiceOrder as drillChoiceOrder,statusOf,isSolved,recordStatus,progress,resetItems,isFinal,REASON_FORMATS,RETURN_PREFIX,reasonCheck,reasonSeed,reasonAttempt,reasonState,pendReason,resolveReason,returnItems,readReasons,drillWords,unitKanjiWords,minutesFor} from './exercises.mjs';
import {emptyCheckpoints,checkpointStatus,dueCheckpoint,poolFor,checkpointSize,startCheckpoint,answerCheckpoint,finishCheckpoint,noteOpened,runOutcome,runOf,findItem,runItem,missRoutes,routeMisses,readCheckpointState,RESULT_LABELS as CHECKPOINT_RESULTS} from './checkpoints.mjs';
import {emptyPatterns,recordMiss,markSeen,patternIndex,patternEvidence,readPatternState} from './patterns.mjs';
import {emptyLedger,ensureLedger,logOutcome,readLedger,emptyRecovery,trackLapses,inRecovery,LEECH_LAPSES} from './schedule.mjs';
import {readRecoveryState} from './recovery.mjs';
import {kanjiWordIndex,resolveText,stagedText,tokenDisplay,emptyKanjiWords,readKanjiWords,markMet,recordAnswer,wordStage,localDay,cardRound,emptyKanjiCards,startRound,answerCard,cardAnswers,finishRound,replayRound,readKanjiCards,recordTrial,PROPER_NOUNS} from './kanji-words.mjs';
import {DEFAULT_POLICY,readKanjiPolicy,readKanjiCourse,readProperNouns,rulesOf,courseRank,eligibleWords} from './kanji-policy.mjs';
import {collection,roundOpen,roundOpened,needsRound,cardState,todayGrid,trialBank,trialQuestions,trialOf,trialOutcome,roundSummary,trialEvent} from './kanji-cards.mjs';
import {readKanjiCharacters,hasTrack,kanjiOf,emptyKanjiChars,readKanjiChars,charStage,markCharMet,knownChars,metChars,setStatus,setList,currentSet,boardCells,startRun,answerRun,finishRun,runOf as kanjiRunOf,setsOpened} from './kanji-characters.mjs';
import {practiceQuestions,practiceProgress,feedbackOf,rubyHTML} from './kanji-practice.mjs';
import {KANJI_INK_DEFS,brushStyle} from './kanji-paper.mjs';
import {unitPages,pageLabel,pageKey,findPage,sectionKeys,sectionStatus,resumePage} from './pages.mjs';
import {GENRE_LABELS,KIND_LABELS as TRANSFER_KINDS,STATUS_LABELS as TRANSFER_STATUS,findText,transferSource,inTransferText,recallItems,lineItems,lineQuestion,questionLines,completesText,emptyTransfer,entryOf,draftOf,firstAttempt,startReading,recordReread,phaseNow,startAttempt as startTransferAttempt,answerRecall,answerLine,openSupport as openTransferSupport,draftStage,finishAttempt as finishTransferAttempt,attemptScore,transferEvidence,evidenceLine,transferSummary as unseenSummary,readTransferState} from './transfer.mjs';
import {createNotices,unlockNotices,kanjiNotice} from './notices.mjs';
const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
// Activity length: the numeric minutes estimate stays internal; learners see Short (up to 5), Medium (up to 15) or Long.
const lengthLabel=m=>Number.isFinite(m)&&m>0?m<=5?'Short':m<=15?'Medium':'Long':'';
const lengthHtml=m=>{const t=lengthLabel(m);return t&&`<span class="sr-only">Length: </span>${t}`;};
const withLength=(lead,m)=>[lead,lengthHtml(m)].filter(Boolean).join(' · ');
const viewport=$('#main');
let main=$('#active-panel');
// Unlock notices (notices.mjs; docs/data-contract.md "Notices"): small text-only popups in #notices, outside #main.
const notices=createNotices($('#notices'));
// sourceReturn: the review route a source link was followed from, so returning focuses that link again.
// revealFocus: scroll the routeFocus element into view too (a row returned to, or one an unlock reveal just opened).
// justUnlocked: what the last unlock reveal opened ({lessons, checkpoint}), highlighted once on the next topic page.
let activeRoute='',navigationDirection=null,routeFocus=null,sourceReturn=null,revealFocus=false,justUnlocked=null;
const scrollPositions=new Map();
$('.skip-link').onclick=e=>{e.preventDefault();main.focus();};
let data,lessons={lessons:[],passages:[],vocabulary:[]},selected='foundations',view='field';
// A first visit's learner state. Startup and Sensei mode both run it through normalize() once the content loads.
const freshState=()=>({version:STATE_VERSION,showAllKanji:false,kanjiWords:emptyKanjiWords(),kanjiCards:emptyKanjiCards(),kanjiChars:emptyKanjiChars(),completed:[],answers:{},reviews:{},recall:emptyRecall(),loop:emptyLoop(),discovered:{},dictionary:{fields:DEFAULT_FIELDS.slice()},decks:[],readingEvidence:emptyReadingEvidence(),wordReviews:emptyReviewState(),daily:emptyDaily(),patterns:emptyPatterns(),outcomes:emptyLedger(),recovery:emptyRecovery(),transfer:emptyTransfer(),progression:emptyProgression(),checkpoints:emptyCheckpoints()});
let state=freshState();
let words=new Map(),wordReturn=null,deckUndo=null,panelRefresh=null;
// Collections chosen during an unanswered question wait here and apply with its feedback. Leaving the page discards them.
let collectQueue=[];const quizRefs=new Map();
const storageWorks=()=>{try{localStorage.setItem('niwa-probe','1');localStorage.removeItem('niwa-probe');return true;}catch{return false;}};
let storageReady=storageWorks();
// Show all kanji (showAllKanji) replaced the four reading modes (reading) with no version change: a save or backup without
// it takes it from reading, where Kanji + readings (ruby) and Kanji + all readings (full) showed every kanji, so they turn
// it on, and Kana first (kana), Kana + kanji above (kana-kanji) or no mode leave it off. reading is then dropped. Strict
// (restore) refuses a showAllKanji that is not true or false, or a reading that names no mode.
const LEGACY_READING=Object.freeze({kana:false,'kana-kanji':false,ruby:true,full:true});
function readShowAll(v,{strict=false}={}){
 const bad=()=>{if(strict)throw Error(`This file is not a compatible ${profile.name} backup.`);return false;};
 if(typeof v?.showAllKanji==='boolean')return v.showAllKanji;
 if(v?.showAllKanji!==undefined)return bad();
 if(v?.reading===undefined)return false;
 return typeof v.reading==='string'&&Object.hasOwn(LEGACY_READING,v.reading)?LEGACY_READING[v.reading]:bad();
}
// Kanji part exposure (kanjiParts), kanji meaning answers (kanjiMeanings) and their review records (kanjiReview), retired
// in kanji Phase 3c (2026-10-23), and the lesson editor's draft (draft), removed with the editor the same day: a save drops
// them at load and a backup at restore, and neither is refused for them.
const RETIRED_STATE=['kanjiParts','kanjiMeanings','kanjiReview','draft'];
// The storage key comes from profile.mjs (niwa-v1 for the personal build) and stays fixed; the state inside carries its own version. Version 1 saves migrate to version 2 on load.
// loadSaved: the saved state over a first visit's defaults, before normalize(); the defaults alone when nothing reads.
function loadSaved(){let s=freshState();try{const saved=migrateState(JSON.parse(localStorage.getItem(profile.storageKey)||'null'));if(saved){const {reading,...rest}=saved;s={...s,...rest,showAllKanji:readShowAll(saved)};}}catch{}return s;}
// Sensei mode (handoffs/2026-10-30-sensei-mode-brief.md): a top-bar switch that opens every lesson, checkpoint, practice,
// book and kanji set on a fresh learner state held in memory, so teachers can check the content without playing through
// it. It is per tab: sessionStorage `${profile.storageKey}:sensei` is '1' while on, so a reload stays on (on a fresh
// state again) and a new tab starts normal. While on, save() writes nothing and localStorage is never touched; the
// pure modules get `openAll: true` through lockOpts(), cpOpts(), loopProgress() and kanjiOpts(), and nothing else here
// knows about locks.
const SENSEI_KEY=`${profile.storageKey}:sensei`;
let sensei=(()=>{try{return sessionStorage.getItem(SENSEI_KEY)==='1';}catch{return false;}})();
state=sensei?freshState():loadSaved();
// Every source logs its applied answers in the outcome ledger, so the eligible lapses a commit adds there count towards
// recovery (schedule.mjs trackLapses) in the same commit.
function commit(next){if(next.outcomes!==state.outcomes){const t=trackLapses(next.recovery,state.outcomes,next.outcomes);if(t.store!==next.recovery)next={...next,recovery:t.store};}state=next;save();}
// The outcome ledger (schedule.mjs) with one more applied answer: {type, ref, venue, id?} plus a source's `event`.
// Answers a source refused (early, repeated) still log as practice; an id already logged adds nothing.
const logged=(ev,now=Date.now())=>ev?.grade?logOutcome(state.outcomes,{at:now,...ev},now).ledger:state.outcomes;
// Kanji words (kanji-words.mjs; docs/data-contract.md "Kanji words drill"): an answer to an item in a kanji words drill marks
// every word of the drill met (the first answer does; later ones change nothing), and every answer to an item with a
// kanjiWord, a retry after a miss included, records right or wrong for that word (recordAnswer): no points, which only the
// Kanji page's trials give; a wrong answer brings a known word's reading back. Returns the kanjiWords store to commit, the
// same object when nothing changed. The caller commits it and calls refreshKanji(), so the rest of the lesson restages at
// once.
function kanjiWordsAnswer(unit,it,correct,now=Date.now()){
 let kw=state.kanjiWords;
 for(const id of drillWords(unit,it.set))kw=markMet(kw,id,now);
 if(it.kanjiWord)kw=recordAnswer(kw,it.kanjiWord,correct===true,now);
 return kw;
}
// The app footer turns into a warning, and only then shows, while this browser is not saving. In Sensei mode it says
// that nothing is saved instead (shown on narrow screens, where the top bar has no room for the note).
let footerSaving=null;
function storageFooter(){const mode=sensei?'sensei':storageReady?'saving':'broken';if(footerSaving===mode)return;const f=document.querySelector('.app-shell>footer');if(!f)return;footerSaving=mode;f.classList.toggle('storage-footer',mode==='broken');f.classList.toggle('sensei-footer',mode==='sensei');f.innerHTML=mode==='sensei'?'Sensei mode: everything is open and nothing you do is saved.':mode==='saving'?'Progress is saved in this browser.':'<strong>This browser is not saving.</strong> Your progress, words and decks will be lost when you close this page. Export a backup from Library → Progress &amp; backup to keep them.';}
// Sensei mode saves nothing and leaves storageReady as it was: the real state stays in localStorage untouched.
function save(){if(sensei)return;try{localStorage.setItem(profile.storageKey,JSON.stringify(state));storageReady=true;}catch{storageReady=false;toast('Your browser could not save progress. Export a backup from the Library.');}storageFooter();}
function toast(msg){$('#toast').textContent=msg;$('#toast').classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>$('#toast').classList.remove('show'),4500);}
// Japanese text: jp() is the one place {written|reading} markup becomes HTML. Staged tokens (kanji-words.mjs stagedText;
// docs/data-contract.md "Stages on screen", 2026-10-29) are kana (plain reading) while Show all kanji is off. With it on,
// a token whose word is mastered (kanji-words.mjs isMastered, provisional) shows as kanji (the kanji alone, its reading
// visually hidden: screen readers read it, and a tap outside controls shows it above), or kanji-reading (ordinary ruby)
// when that word has a miss; every other token stays kana. Staged
// tokens carry their reading and words (data-kw, data-kw-words), so refreshKanji() restages rendered text in place.
// Fixed display: jp(s, {display}) shows every token in `display` (kana, kana-kanji, kanji or kanji-reading) whatever the
// stage or the switch, and refreshKanji() leaves it alone: written forms (headwords, word tables, card fields), and in
// Phase 3 a drill's meaning target and its feedback (kanji-reading) and a reading or find target (kanji, reveal:false).
// reveal:false leaves a kanji token's reading out of the markup altogether, so no tap, switch or screen reader shows it.
// words: the fixed display applies only to the tokens of these words (their word, or one of their candidates); the other
// tokens stay in their stages (a kanji words item's target in its line, a drill's words in its intro).
let kanjiIndex=kanjiWordIndex([]),kanjiBank=new Map();
// The Kanji page's rules and course list (kanji-policy.mjs; data-contract.md "Kanji policy and course"), read leniently
// from lessons.json's `kanji` block at start: DEFAULT_POLICY and no course for content without one (the personal build).
let kanjiPolicy=DEFAULT_POLICY,kanjiCourse=readKanjiCourse(null);
// The kanji sets (kanji-characters.mjs; data-contract.md "Kanji sets"), read leniently from lessons.json
// kanji.characters at start: the empty track for content without one (the personal build), so hasTrack(kanjiTrack) is
// false there and every track branch below stays inert. kanjiRules: the rules each word card closes by (kanji-policy.mjs
// rulesOf), set with the policy at start and passed wherever kanji-words.mjs takes rules.
let kanjiTrack=readKanjiCharacters(null),kanjiRules=rulesOf(DEFAULT_POLICY);
// The reward's Set of characters known on the track (kanji-words.mjs stagedText `known`), or null with no track. It is
// worked out again only when state.kanjiChars is a new object, not per token.
let knownMemo={store:null,set:null};
function knownSet(){
 if(!hasTrack(kanjiTrack))return null;
 if(knownMemo.store!==state.kanjiChars)knownMemo={store:state.kanjiChars,set:knownChars(state.kanjiChars)};
 return knownMemo.set;
}
const KW_DISPLAYS=['kana','kana-kanji','kanji','kanji-reading'];
// The policy's metStyle is passed for compatibility and no longer changes text (2026-10-29). In a track profile the
// track's known characters (knownSet) feed isMastered: with the switch on, a met word is mastered once every kanji in it is known.
const staged=s=>stagedText(s,kanjiIndex,state.kanjiWords,{showAll:state.showAllKanji,metStyle:kanjiPolicy.metStyle,known:knownSet()});
function kwToken({written,reading,display,ids,bare=false}){
 const data=ids?` data-kw="${esc(written)}|${esc(reading)}" data-kw-words="${esc(ids.join(' '))}"${bare?' data-kw-bare':''}`:'';
 if(display==='kana')return `<span class="kw kw-kana"${data}>${esc(reading)}</span>`;
 if(display==='kanji')return bare?`<span class="kw kw-bare"${data}>${esc(written)}</span>`:`<span class="kw kw-kanji"${data}>${esc(written)}<span class="kw-reading">${esc(reading)}</span></span>`;
 return `<ruby class="kw kw-${display}"${data}>${esc(written)}<rp>(</rp><rt>${esc(reading)}</rt><rp>)</rp></ruby>`;
}
function jp(s,{display=null,reveal=true,words=null}={}){
 const fixed=KW_DISPLAYS.includes(display)?display:null,bare=reveal===false,only=words?new Set(words):null;
 return staged(s).map(p=>{
  if(!p.token)return esc(p.text);
  const ids=p.word?[p.word]:p.candidates,fix=!!fixed&&(!only||ids.some(id=>only.has(id)));
  return kwToken({written:p.written,reading:p.reading,display:fix?fixed:p.display,ids:fix?null:ids,bare:bare&&(fix||!only)});
 }).join('');
}
// A text as plain characters in its stages: the reading of a kana or kana-kanji token, the written form of a kanji token.
const stagedPlain=s=>staged(s).map(p=>!p.token?p.text:p.display==='kana'||p.display==='kana-kanji'?p.reading:p.written).join('');
// Restages every rendered token after state.kanjiWords, state.kanjiChars (the track's known characters) or
// state.showAllKanji changes, in place: pages, answers, placed tiles
// and focus stay as they are, and nothing is recorded. Word references re-render, so their tap-to-reveal follows the stage.
// Phase 3 calls it after recording kanji word answers.
function refreshKanji(){
 const known=knownSet();
 for(const el of document.querySelectorAll('[data-kw]')){
  const [written,...rest]=el.dataset.kw.split('|'),ids=(el.dataset.kwWords||'').split(' ').filter(Boolean),bare='kwBare' in el.dataset;
  // A token of no word (no IDs) restages as a composite of the words its kanji belong to, as jp() first drew it.
  const display=tokenDisplay(state.kanjiWords,ids,{showAll:state.showAllKanji,written,index:kanjiIndex,metStyle:kanjiPolicy.metStyle,known});
  if(!el.classList.contains(`kw-${display==='kanji'&&bare?'bare':display}`))el.outerHTML=kwToken({written,reading:rest.join('|'),display,ids,bare});
 }
 refreshWordRefs();
}
// A known word's reading on tap: outside buttons, links and other controls, tapping a kanji token shows its reading and
// tapping again hides it. Inside a control a tap keeps its own meaning (choosing an answer, placing a tile), so the token
// stays plain kanji there, as it does in an answer or tile shown as text (a given tile, a solved 例); word references
// reveal through their own button (bindWordRefs). Nothing is recorded.
const TAP_CONTROLS='button,a,label,summary,input,select,textarea,[role="button"],[data-drag-word],.choice,.chip,.tile,.match-tile,.sort-card,.sort-target,.cloze-gap';
document.addEventListener('click',e=>{const t=e.target instanceof Element&&e.target.closest('.kw-kanji');if(t&&!t.closest(TAP_CONTROLS))t.classList.toggle('is-revealed');});
// Word references: authored occurrences become buttons; everything else renders exactly like jp().
const isDiscovered=id=>Object.prototype.hasOwnProperty.call(state.discovered,id);
function sourceContainer(source){const [kind,id]=String(source).split(':');return kind==='passage'?lessons.passages.find(p=>p.id===id):kind==='lesson'?lessons.lessons.find(l=>l.id===id):kind==='practice'?practiceOf(id):kind==='transfer'?findText(lessons,id):null;}
// A deck card's "Collected from": a link while its lesson or passage is open (guard: routeGuard()), else plain text.
function collectedFrom(source,guard){const t=source&&sourceContainer(source);if(!t)return '';const key=source.replace(':','/'),title=esc(t.title);return `<span class="small card-source">Collected from ${guard(key)===key?`<a href="#${esc(key)}">${title}</a>`:title}</span>`;}
// A word reference with a known word in kanji (display kanji) hides that reading on screen and shows a ring marker. Its
// first selection reveals the reading and logs a reveal, never a failure; the next opens details.
const progressFor=id=>readingProgress(words.get(id),state.readingEvidence?.words?.[id]);
let revealedHere=new Set();
function announce(msg){let el=document.getElementById('sr-announce');if(!el){el=document.createElement('p');el.id='sr-announce';el.className='sr-only';el.setAttribute('aria-live','polite');document.body.append(el);}el.textContent='';setTimeout(()=>{el.textContent=msg;},30);}
// opts: display, a fixed jp() display for the word (a kanji words item's shown target, kanji-reading); drag:false, a
// button that only opens its card (a unit section's, so the deck tray stays on the Words and conversation pages). Both
// are kept when it re-renders.
function wordRef(o,source,opts={}){const fixed=KW_DISPLAYS.includes(opts.display)?opts.display:'',drag=opts.drag!==false;if(!words.has(o.word))return jp(o.surface,opts);const known=isDiscovered(o.word),faded=fixed?fixed==='kanji':staged(o.surface).some(p=>p.display==='kanji');return `<button type="button" class="word-ref${known?'':' is-new'}${faded?' is-faded':''}" data-word="${esc(o.word)}" data-word-ref="${o.index}" data-source="${esc(source)}"${fixed?` data-word-display="${fixed}"`:''}${drag?' data-drag-word':''} aria-haspopup="dialog">${jp(o.surface,fixed?{display:fixed}:{})}${faded?'<span class="fade-mark" aria-hidden="true"></span><span class="sr-only fade-hint" lang="en"> (reading hidden on screen; select once to show it)</span>':''}<span class="sr-only ref-status" lang="en">${known?' (in your dictionary)':' (new word)'}</span></button>`;}
function jpRefs(container,path,source){const value=resolvePath(container,path);return typeof value==='string'?segmentText(value,occurrencesAt(container,path)).map(p=>p.occurrence?wordRef(p.occurrence,source):jp(p.text)).join(''):'';}
function revealReading(b,o){
 b.classList.add('is-revealed');
 const key=`${b.dataset.source}|${o.word}`;
 if(!revealedHere.has(key)){revealedHere.add(key);commit({...state,readingEvidence:recordReadingEvent(state.readingEvidence,o.word,{kind:'reveal',source:b.dataset.source,occurrence:Number(b.dataset.wordRef)})});}
 announce(`${plainWritten(o.surface)} reads ${plainReading(o.surface)}. Select it again for word details.`);
}
function bindWordRefs(){main.querySelectorAll('[data-word-ref]').forEach(b=>b.onclick=()=>{const o=sourceContainer(b.dataset.source)?.occurrences?.[Number(b.dataset.wordRef)];if(!o)return;if(b.classList.contains('is-faded')&&!b.classList.contains('is-revealed')){revealReading(b,o);return;}openWord(o.word,{source:b.dataset.source,occurrence:{...o,index:Number(b.dataset.wordRef)},trigger:b});});updateWordProgress();}
// Re-renders word references, so each shows its words' stages and discovery as they are now (refreshKanji).
function refreshWordRefs(){main.querySelectorAll('[data-word-ref]').forEach(b=>{const c=sourceContainer(b.dataset.source),o=c?.occurrences?.[Number(b.dataset.wordRef)];if(o)b.outerHTML=wordRef({...o,index:Number(b.dataset.wordRef)},b.dataset.source,{display:b.dataset.wordDisplay,drag:'dragWord' in b.dataset});});bindWordRefs();}
// Part [a,b) of a unit's referenced Japanese line (ref: {container, path, source}; unitRefs), in the jp() displays opts.
// A word whose reading those displays leave out of the markup (reveal:false, an unsolved reading target) stays plain text,
// so neither its button nor its card can give the reading away.
function refRun(ref,a,b,opts={}){
 const value=resolvePath(ref.container,ref.path),own=o=>!opts.words||opts.words.includes(o.word);
 const occ=occurrencesAt(ref.container,ref.path).filter(o=>o.start>=a&&o.end<=b&&!(opts.reveal===false&&own(o))).map(o=>({...o,start:o.start-a,end:o.end-a}));
 return segmentText(value.slice(a,b),occ).map(p=>p.occurrence?wordRef(p.occurrence,ref.source,{...(own(p.occurrence)?opts:{}),drag:false}):jp(p.text,opts)).join('');
}
// Where each item, worked example and point of a unit sits in its container (seed-lessons.mjs unitRefs): ref(id, tail)
// is the reference context of that text when the container references words in it, else null (plain jp()).
function unitRefs(c,source){
 const at=new Map();
 (c?.sections||[]).forEach((s,i)=>{if(s.id)at.set(s.id,`sections/${i}`);if(s.example?.id)at.set(s.example.id,`sections/${i}/example`);(s.items||[]).forEach((it,k)=>at.set(it.id,`sections/${i}/items/${k}`));});
 return (id,tail='ja')=>{const path=at.has(id)&&`${at.get(id)}/${tail}`;return path&&occurrencesAt(c,path).length?{container:c,path,source}:null;};
}
const refAttrs=ref=>ref?` data-ref-path="${esc(ref.path)}" data-ref-source="${esc(ref.source)}"`:'';
const refOn=el=>el?.dataset.refPath?{container:sourceContainer(el.dataset.refSource),path:el.dataset.refPath,source:el.dataset.refSource}:null;
function updateWordProgress(){const el=main.querySelector('#word-progress');if(!el)return;const ids=[...new Set([...main.querySelectorAll('.reading-text [data-word]')].map(b=>b.dataset.word))];el.textContent=`${ids.filter(isDiscovered).length} of ${ids.length} marked words are in your dictionary.`;}
function storageNotice(){return storageReady?'':'<div class="callout storage-warning" role="status"><strong>This browser is not saving</strong>Your words and decks will be lost when you close this page. Export a backup from the Library to keep them.</div>';}
function wordDialog(){
 let d=document.getElementById('word-dialog');if(d)return d;
 d=document.createElement('dialog');d.id='word-dialog';d.className='word-dialog';d.setAttribute('aria-labelledby','word-dialog-title');document.body.append(d);
 d.addEventListener('click',e=>{if(e.target===d||e.target.closest('[data-close-word]'))d.close();});
 bindDeckChoosers(d);
 // Return focus to the word that opened the dialog and keep the reader where they were.
 d.addEventListener('close',()=>{const r=wordReturn;wordReturn=null;if(!r||r.panel!==main)return;if(r.trigger?.isConnected)r.trigger.focus({preventScroll:true});r.panel.scrollTop=r.scroll;});
 return d;
}
// Honest reading status: what the evidence shows, never a mastery claim.
function readingStatus(id){
 const p=progressFor(id),t=state.readingEvidence?.words?.[id]?.transfer;if(!p.kanji)return null;
 const text={
  unseen:'Not met in a text yet.',
  seen:'Seen with its reading. A reading check on a later day comes next.',
  practiced:p.lastWrong!==null&&p.lastWrong===p.lastCheck?'Your last reading check missed. Read it correctly on a later day to count it.':'Practised, but not yet read correctly after a delay.',
  retrieved:`Read correctly after a delay in ${plural(p.sources.length,'text')}. One more correct reading in a different text, on a later day, makes it retained.`,
  retained:`Read correctly after a delay in ${p.sources.length} different texts.`
 }[p.stage];
 return {stage:p.stage,label:stageLabel(p.stage),text,active:p.checks+p.reveals>0,counts:`${plural(p.checks,'reading check')} · ${p.correct} correct · ${p.delayed} after a delay · ${plural(p.reveals,'reveal')}${t?` · ${t.passed} of ${t.fresh} correct in new sentences`:''}`};
}
const stageBadge=r=>`<span class="reading-stage is-${r.stage}">${esc(r.label)}</span>`;
// A met kanji word's trial status on the Kanji page (the policy's knownAt passed trials make it known), or null
// for a word not met. pill: the Dictionary's (“1 of 3 trials”, “Mastered”); line: the word card's (“Met today”,
// “1 of 3 trials passed”, “Mastered”, and for a known word missed since, that its reading shows again).
// In a track profile there are no trials: a met word is Mastered once every kanji of its written form is known on the
// track (the reward that shows it in plain kanji; its own known is never set there), and otherwise has no status (null),
// so no pill or line shows and its reading status applies as for any word.
function kanjiStatus(id){
 const e=state.kanjiWords?.words?.[id];if(!e||typeof e.met!=='string')return null;
 const track=knownSet(),chars=track&&words.has(id)?kanjiOf(plainWritten(words.get(id).word)):[];
 if(chars.length&&chars.every(ch=>track.has(ch)))return {known:true,pill:'Mastered',line:'Mastered'};
 if(track)return null;
 const points=Number.isInteger(e.points)?Math.min(e.points,kanjiPolicy.knownAt):0,known=typeof e.known==='string';
 const line=known?(e.missed?'Mastered · its reading shows again until you read it right':'Mastered'):!points&&e.met===localDay()?'Met today':`${kanjiTrials(points)} passed`;
 return {known,pill:known?'Mastered':kanjiTrials(points),line};
}
// A definition earns its line only when it says more than the meaning (“Coffee.” under “coffee” does not).
const bareGloss=s=>plainWritten(String(s??'')).toLowerCase().replace(/^(a|an|the)\s+/,'').replace(/[.。!?;:,'’“”"()]/g,'').trim();
const addsToMeaning=(definition,gloss)=>!!definition&&!String(gloss).split(/[;/]/).map(bareGloss).concat(bareGloss(gloss)).includes(bareGloss(definition));
// Compact word card: type, the word, what it means here, the form used here, the lesson's frame, one short note, one
// example, forms on one line, and one kanji line: a met kanji word's trial status (kanjiStatus), else the reading
// status of a kanji word with reading evidence. Nothing empty is shown.
function wordDetails(w,o,source,added){
 const sense=senseFor(w,o),form=formFor(w,o),kanji=kanjiStatus(w.id),reading=kanji?null:readingStatus(w.id),gloss=sense?.gloss||w.meaning,note=sense?.definition||w.definition;
 const surface=o?.surface,other=!!surface&&plainWritten(surface)!==plainWritten(w.word);
 const lesson=String(source).startsWith('lesson:')?lessons.lessons.find(l=>l.id===source.slice(7)):null,entry=wordEntries(lesson?.words).find(x=>x.id===w.id);
 const status=added?'Added to your dictionary.':'';
 return `<div class="word-dialog-inner word-card"><div class="word-dialog-head"><span class="eyebrow">${esc((w.pos||'word').toUpperCase())}${entry?.recognize?' · <span class="recognize-tag">recognize</span>':''}</span><button type="button" class="icon-button" data-close-word aria-label="Close word details">✕</button></div>`+
 `<h2 id="word-dialog-title" class="word-title written-form" lang="ja">${jp(w.word,{display:'kanji-reading'})}</h2>${other?'<p class="small word-dict">dictionary form</p>':''}${toHiragana(w.reading)!==toHiragana(plainReading(w.word))?`<p class="word-reading" lang="ja">${esc(w.reading)}</p>`:''}`+
 `<p class="word-meaning">${esc(gloss)}</p>`+
 (other||form?`<p class="word-here">here: <span class="jp" lang="ja">${jp(surface)}</span>${form?` <span class="small">(${esc(form.label)})</span>`:''}</p>`:'')+
 (entry?.frame?`<p class="word-line"><span class="word-label">Frame</span><span class="jp" lang="ja">${jp(entry.frame)}</span></p>`:'')+
 (addsToMeaning(note,gloss)?`<p class="word-note">${jp(note)}</p>`:'')+
 (w.example?`<p class="jp word-example" lang="ja">${jp(w.example)}</p>`:'')+
 (w.forms?.length?`<p class="word-line small"><span class="word-label">Forms</span><span>${w.forms.map(x=>`<span lang="ja">${jp(x.form)}</span> (${esc(x.label)})`).join(' · ')}</span></p>`:'')+
 (kanji?`<p class="small word-kanji-line"><span class="word-label">Kanji</span> ${esc(kanji.line)}</p>`:reading?.active?`<p class="small word-reading-line">${stageBadge(reading)} ${esc(reading.text)}</p>`:'')+unseenWordLine(w.id)+
 `<p class="small word-status" role="status">${esc(status)}${storageReady?'':' This browser is not saving right now; export a backup from the Library to keep this word.'}</p><div class="word-decks">${deckChooser(w.id,'dialog',{source,occurrence:o?.index})}</div></div>`;
}
function markDiscovered(id){main.querySelectorAll('[data-word]').forEach(b=>{if(b.dataset.word!==id)return;b.classList.remove('is-new');const sr=b.querySelector('.ref-status');if(sr)sr.textContent=' (in your dictionary)';});updateWordProgress();}
function openWord(id,{source='',occurrence=null,trigger=null}={}){
 const w=words.get(id);if(!w)return;
 let added=false;
 if(source){const r=recordDiscovery(state,id,source);if(r.added){state=r.state;added=true;save();markDiscovered(id);}}
 const d=wordDialog();d.innerHTML=wordDetails(w,occurrence,source,added);
 wordReturn={trigger,panel:main,scroll:main.scrollTop};
 if(!d.open)d.showModal();
}
// Show all kanji: one switch in the top bar, off by default. Off, running text is kana; on, the tokens of mastered words
// (kanji-words.mjs isMastered) show in kanji and the rest stay kana, names included. Switching restages the page in place (refreshKanji)
// and saves only the switch: no answer, evidence or place on the page changes.
const kanjiSwitch=()=>$('#kanji-switch').setAttribute('aria-pressed',String(state.showAllKanji));
$('#kanji-switch').onclick=()=>{state.showAllKanji=!state.showAllKanji;save();kanjiSwitch();refreshKanji();};
function heading(title,subtitle='',meta='',action=''){return `<div class="page-heading"><div><h1>${esc(title)}</h1>${subtitle?`<p>${esc(subtitle)}</p>`:''}</div>${meta||action?`<div class="heading-side">${meta?`<span class="heading-meta">${esc(meta)}</span>`:''}${action}</div>`:''}</div>`;}
// Cumulative checkpoints (checkpoints.mjs): the earliest unfinished one is due once its lessons are finished.
const cpOpts=()=>({completed:state.completed,progression:state.progression,checkpoints:state.checkpoints,openAll:sensei});
const dueNow=()=>dueCheckpoint(data.path,lessons,cpOpts());
// Lesson access (progression.mjs lessonLock): a lesson opens once what it builds on is finished, and a due checkpoint
// holds the general lessons after it. A lock is shown where the lesson sits, never as a link to what it waits for.
const lockOpts=(checkpoint=dueNow())=>({completed:state.completed,started:id=>lessonStarted(state,id)||state.progression.active===id,checkpoint,openAll:sensei});
const lockOf=(id,opts=lockOpts())=>lessonLock(data.path,id,opts);
const stoneOf=(id,opts=lockOpts())=>stoneState(id,data.path,lessons.lessons,opts);
const openTopics=(opts=lockOpts())=>data.rows.flatMap(row=>row.nodes).filter(id=>stoneOf(id,opts)==='open').map(id=>data.nodes.find(n=>n.id===id));
// The loop (loop.mjs) over the content: the practice sets of lessons.json `practices` that this app has a view for
// (kind 'unit', the default), and every book, each opening on its own `requires` (the passages and the unseen texts of
// lessons.json `transfer`; learning loop Phase 3). loopProgress is the saved state as the loop reads it: state version 3
// keeps each set's results under its practice ID in answers, and finishes and book completions in state.loop. Kanji
// cards is not a loop item: it is the Kanji page (#kanji), which opens on the met kanji words.
const practiceKind=p=>p?.kind??'unit';
const VIEW_KINDS=['unit'];
const practiceOf=id=>practicesOf(lessons).find(p=>p.id===id)||null;
// The practice IDs in the content: a practice:<id> source on a deck card or in reading evidence must name one.
const practiceIds=()=>practicesOf(lessons).map(p=>p.id);
const unitPractices=()=>practicesOf(lessons).filter(p=>practiceKind(p)==='unit');
function loopContent(){return {lessons:lessons.lessons,practices:{items:practicesOf(lessons).filter(p=>VIEW_KINDS.includes(practiceKind(p)))},passages:lessons.passages,transfer:lessons.transfer};}
function loopProgress(opts=lockOpts()){return {completed:state.completed,started:opts.started,answers:state.answers,loop:state.loop,recall:state.recall,transfer:state.transfer,stoneState:node=>stoneOf(node,opts),openAll:sensei};}
const setOpen=id=>isOpen(itemState(id,loopContent(),loopProgress()));
// A checkpoint opens once it is due (open, started or changed since it started) or finished, and one with a run is never
// shut out. Any other #checkpoint/<n> lands on the topic page where its row will sit, or Learn while that topic is closed.
function checkpointRoute(key,opts){
 const [kind,raw]=key.split('/');if(kind!=='checkpoint')return key;
 const cp=checkpointStatus(data.path,lessons,cpOpts()).find(c=>c.n===Number(raw));
 if(!cp||!['locked','waiting'].includes(cp.status)||cp.run)return key;
 const place=checkpointLocation(data.path,lessons.lessons,cp,opts);
 return place?`node/${place.node}`:'field';
}
// One guard for every route, before anything renders: the old addresses of the lessons that became practices, Learn's
// topics, lessons and checkpoints (learn.mjs), then practice sets and books (loop.mjs), then a practice's parts (loop.mjs
// partRoute: practice/<id>/<part> lands on the part list, practice/<id>, unless that part is open), then practice kinds
// without a view, then the Kanji page's sets (kanjiRoute). A link or source line is drawn only to a route the guard keeps
// (rule 9: no route into a locked item).
// A build without docs (profile.docs === false, the course build) has no Course guide: #guide opens the Library.
const docsShipped=profile.docs!==false;
function routeGuard(){const opts=lockOpts(),content=loopContent(),progress=loopProgress(opts);return key=>key.startsWith('review/')?'practice':!docsShipped&&key.split('/')[0]==='guide'?'library':kanjiRoute(practiceRoute(partRoute(loopRoute(checkpointRoute(learnRoute(convertedRoute(key),data.path,lessons.lessons,data.nodes,opts),opts),content,progress),content,progress)));}
// The Kanji page's sets (a track profile): #kanji the set list, #kanji/<set> its board, #kanji/<set>/practice its run.
// With no track every #kanji/… is #kanji; a locked or unknown set lands on the list; the practice of a set still being
// read (setStatus 'reading') lands on its board, as does any other address under a set. Sensei mode keeps every set and
// its practice.
const kanjiOpts=()=>({openAll:sensei});
function kanjiRoute(key){
 const [name,id,sub,...rest]=key.split('/');if(name!=='kanji'||id===undefined)return key;
 if(!hasTrack(kanjiTrack))return 'kanji';
 const s=setStatus(kanjiTrack,state.kanjiChars,id,kanjiOpts());if(!s||s==='locked')return 'kanji';
 if(sub===undefined)return key;
 return sub==='practice'&&!rest.length&&(s!=='reading'||sensei)?key:`kanji/${id}`;
}
// The six lessons that became optional practices in loop 2b (CONVERTED in recall.mjs): an old #lesson/r05 (s03, d01–d04)
// becomes its practice's route, which loopRoute then keeps while the set is open, started or finished, else Practice.
function convertedRoute(key){const [kind,id]=key.split('/');return kind==='lesson'&&isConverted(id)?`practice/${CONVERTED[id]}`:key;}
// A practice of a kind this app has no view for (anything but 'unit') is not listed and has no page: its
// route lands on Practice, as a locked set's does.
function practiceRoute(key){const [name,id]=key.split('/'),p=name==='practice'&&id?practiceOf(id):null;return p&&!VIEW_KINDS.includes(practiceKind(p))?'practice':key;}
const routeOpen=key=>routeGuard()(key)===key;
const lessonOf=id=>lessons.lessons.find(l=>l.id===id)||null;
const titleList=ids=>{const t=ids.map(id=>lessonOf(id)?.title).filter(Boolean).map(x=>`“${x}”`);return t.length>2?`${t.slice(0,2).join(', ')} and ${t.length-2} more`:t.join(' and ');};
// A due checkpoint is a row on the topic page of the first general lesson it locks (else the next unfinished one),
// directly above that lesson.
const checkpointPlace=(cp,opts=lockOpts(cp))=>checkpointLocation(data.path,lessons.lessons,cp,opts);
function checkpointAnchor(cp,opts=lockOpts(cp)){const place=checkpointPlace(cp,opts);return place?.before||place?.after||null;}
// What is open right now, for an unlock reveal: the open lessons in path order, the open stones, the due checkpoint, the
// loop progress as it stands and the met kanji words (kanji). unlockedSince(before) is what has opened since, with the practice sets and books that
// went from hidden or revealed to open (loop.mjs opened).
function openNow(){const cp=dueNow(),opts=lockOpts(cp);return {lessons:openLessons(data.path,lessons.lessons.filter(hasUnit).map(l=>l.id),opts),stones:openTopics(opts).map(n=>n.id),checkpoint:cp,loop:loopProgress(opts),kanji:Object.keys(state.kanjiWords.words).filter(id=>words.has(id))};}
// The Kanji page's round opens at ROUND_OPENS_AT met kanji words (kanji-cards.mjs). A lesson or practice meets its words in
// its kanji words drill, before it is finished, so its first finish compares against a snapshot without the words it
// introduces (those no unit finished earlier also introduces): the finish whose words took the met words to the opening
// count names the Kanji page's first round.
function withoutUnitWords(snap,unit){
 const earlier=[...state.completed.map(lessonOf),...Object.keys(state.loop.practices||{}).map(practiceOf)].filter(u=>u&&u!==unit),also=new Set(earlier.flatMap(unitKanjiWords));
 const drop=new Set(unitKanjiWords(unit).filter(id=>!also.has(id)&&Object.hasOwn(state.kanjiWords.words,id)));if(!drop.size)return snap;
 return {...snap,kanji:snap.kanji.filter(id=>!drop.has(id))};
}
// In Sensei mode everything is open already, so nothing is revealed: every checkpoint has its row, and none is new.
function unlockedSince(before){const now=openNow(),loop=opened(before.loop,now.loop,loopContent()),of=kind=>loop.filter(x=>x.kind===kind).map(x=>x.id);return {lessons:now.lessons.filter(id=>!before.lessons.includes(id)),stones:now.stones.filter(id=>!before.stones.includes(id)),checkpoint:!sensei&&now.checkpoint&&now.checkpoint.n!==before.checkpoint?.n?now.checkpoint:null,practices:of('practice'),books:of('book'),kanji:roundOpened(before.kanji.length,now.kanji.length,kanjiPolicy)};}
// What an unlock reveal names, as text (rule 10): each stone, lesson (a lesson or checkpoint in another topic than `home`
// names that topic), checkpoint, practice set (in Practice), book (in Library → Reading) and the Kanji page's first round.
function unlockItems(u,home=null){
 const where=id=>{const t=data.nodes.find(n=>n.id===lessonOf(id)?.node);return t&&t.id!==home?` · ${esc(t.title)}`:'';},anchor=u.checkpoint&&checkpointAnchor(u.checkpoint);
 return [...(u.stones||[]).map(id=>`In Learn: ${esc(data.nodes.find(n=>n.id===id)?.title||id)} stone`),...(u.lessons||[]).map(id=>`${esc(lessonOf(id)?.title||id)}${where(id)}`),...(u.checkpoint?[`Checkpoint ${u.checkpoint.n}${anchor?where(anchor):''}`]:[]),...(u.practices||[]).map(id=>`In Practice: ${esc(practiceOf(id)?.title||id)}`),...(u.books||[]).map(id=>`In Library → Reading: ${esc(loopTitle({id,kind:'book'}))}`),...(u.kanji?['In Kanji: your first round']:[])];
}
// The unlock reveal after a lesson, a checkpoint or a practice set: what it opened (unlockItems), or `none` when nothing
// did, and one way back. The next topic page highlights the lessons and checkpoint it names.
function unlockHTML(u,{home=null,none,href,label,level=2}){
 const items=unlockItems(u,home);
 justUnlocked={lessons:new Set(u.lessons),checkpoint:u.checkpoint?.n??null};
 return `<section class="unlock-reveal" aria-labelledby="unlock-title"><h${level} class="unlock-title" id="unlock-title" tabindex="-1">${items.length?'Unlocked':esc(none)}</h${level}>${items.length?`<ul class="unlock-list">${items.map(x=>`<li>${x}</li>`).join('')}</ul>`:''}<div class="actions"><a class="button" href="#${esc(href)}">Back to ${esc(label)}</a></div></section>`;
}
// The line at the end of a lesson part that opened practices or books (rule 10): each named with where it lives.
const loopTitle=({id,kind})=>kind==='practice'?practiceOf(id)?.title||id:lessons.passages.find(p=>p.id===id)?.title||findText(lessons,id)?.title||id;
const partNoteHTML=found=>{const items=found.flatMap(f=>f.items).map(x=>`${x.kind==='practice'?'In Practice':'In Library → Reading'}: ${esc(loopTitle(x))}`);return `<p class="part-unlock small" role="status"><strong>Unlocked</strong> · ${items.join(' · ')}</p>`;};
// Notices (rule 10): every unlock is also announced in a small popup, text only, saying what opened and where it lives
// (unlockNotices). The resolvers name an id, or give null and its notice is skipped; a lesson or checkpoint always names
// its topic.
const noticeNames={stone:id=>data.nodes.find(n=>n.id===id)?.title||null,
 lesson:id=>{const l=lessonOf(id);if(!l)return null;const t=data.nodes.find(n=>n.id===l.node);return {title:l.title,topic:t?.title||null};},
 checkpoint:cp=>{const a=checkpointAnchor(cp),t=a&&data.nodes.find(n=>n.id===lessonOf(a)?.node);return {n:cp.n,topic:t?.title||null};},
 practice:id=>practiceOf(id)?.title||null,
 book:id=>loopTitle({id,kind:'book'})||null};
const announceUnlocks=u=>{if(u)notices.show(unlockNotices(u,noticeNames));};
// New kanji words: an answer whose kanjiWords store (kanjiWordsAnswer) has vocabulary words the committed one lacks names
// them in one notice, written and reading. Called before the store commits.
const announceMet=kw=>{const had=state.kanjiWords.words||{},ids=Object.keys(kw?.words||{}).filter(id=>!Object.hasOwn(had,id)&&words.has(id));if(ids.length)notices.show(kanjiNotice(ids.map(id=>{const w=words.get(id).word;return {written:plainWritten(w),reading:plainReading(w)};})));};
// Topic rows: an open lesson is one large link (its length until it is finished, then its mark); a locked one is its grey
// title only, never a link (the order says what comes first); a planned title is plain grey text. fresh: a row the last unlock reveal opened, highlighted once.
const freshMark=fresh=>fresh?'<span class="sr-only"> (just unlocked)</span>':'';
// A lesson's counted items as its own page counts them (lessonView): the unit's items, then any まとめ returns.
const lessonItemSet=(l,rec)=>({items:lessonItems(l,transferChecks[l.id]),recap:hasUnit(l)?returnItems(l,rec):[]});
const lessonCount=l=>{const rec=state.answers[l.id],{items,recap}=lessonItemSet(l,rec);return progress([...items,...recap],rec);};
// A row's mark (learn.mjs rowProgress): the arrow, a ring with the whole percent, or a check. The mark is aria-hidden;
// hidden text in the link says the state instead (" (37% done)", " (done)").
const RING_C=2*Math.PI*16;
const rowMark=(m,word='done')=>m.kind==='ring'?`<span class="sr-only"> (${m.pct}% ${word})</span><span class="lesson-row-go is-ring" aria-hidden="true"><svg class="ring" viewBox="0 0 36 36" focusable="false"><circle class="ring-track" cx="18" cy="18" r="16"/><circle class="ring-fill" cx="18" cy="18" r="16" stroke-dasharray="${(RING_C*m.pct/100).toFixed(2)} ${RING_C.toFixed(2)}" transform="rotate(-90 18 18)"/></svg><span class="ring-pct">${m.pct}<span class="ring-unit">%</span></span></span>`
 :m.kind==='done'?'<span class="sr-only"> (done)</span><span class="lesson-row-go is-check" aria-hidden="true"><svg viewBox="0 0 24 24" focusable="false"><path d="M6 12.5l4 4 8-9"/></svg></span>'
 :'<span class="lesson-row-go" aria-hidden="true">→</span>';
function lessonRow(l,lock,fresh=false){
 const done=state.completed.includes(l.id);
 if(!lock.open)return lockedRow(l.title);
 return `<li><a class="lesson-row${done?' is-done':''}${fresh?' is-unlocked':''}" href="#lesson/${l.id}"><span class="lesson-row-title">${esc(l.title)}${freshMark(fresh)}</span>${done?'':`<span class="lesson-row-meta">${lengthHtml(l.minutes)}</span>`}${rowMark(rowProgress(done?{done}:lessonCount(l)))}</a></li>`;
}
const lockedRow=title=>`<li class="lesson-row is-planned is-locked"><span class="lesson-row-title">${esc(title)}<span class="sr-only"> (locked)</span></span></li>`;
const plannedRow=title=>`<li class="lesson-row is-planned"><span class="lesson-row-title">${esc(title)}</span><span class="sr-only"> (not available yet)</span></li>`;
// A due checkpoint's row: the thing to do here, now. Its mark is the share of the run's questions answered, as the run
// counts them (runOutcome); a stale run starts again, so it keeps the arrow. A finished checkpoint is not listed here,
// except in Sensei mode, where every checkpoint has its row and a finished one shows its check.
const checkpointRow=(cp,fresh=false)=>{const done=cp.status==='done',o=cp.status==='started'?runOutcome(lessons,cp.run):null;return `<li><a class="lesson-row is-checkpoint${done?' is-done':''}${fresh?' is-unlocked':''}" href="#checkpoint/${cp.n}"><span class="lesson-row-title">Checkpoint ${cp.n}${freshMark(fresh)}<span class="lesson-row-sub">A short closed-book check on the lessons you have finished</span></span>${done?'':`<span class="lesson-row-meta">${cp.status==='started'?'Resume':cp.status==='stale'?'Start again':'Start'}</span>`}${rowMark(rowProgress(done?{done}:{solved:o?.answered,total:o?.total}),done?'done':'answered')}</a></li>`;};
// Learn reveals only the next reachable stones. Outlines carry no title or kanji and are not controls.
function nodeCard(n,opts){const status=stoneOf(n.id,opts),art=gardenStone(data.nodes.indexOf(n),n.id);if(status==='hidden')return '';if(status==='outline')return `<span class="node outline" data-stone="${n.id}" data-state="outline" role="img" aria-label="Upcoming topic, locked"><span class="node-orb">${art}</span></span>`;return `<button type="button" class="node ${selected===n.id?'selected':''}" data-node="${n.id}" data-stone="${n.id}" data-state="open" aria-label="${esc(n.title)}" aria-pressed="${selected===n.id}"><span class="node-orb">${art}<span class="node-glyph" aria-hidden="true">${n.icon}</span></span><span class="node-name">${esc(n.title)}</span></button>`;}
function field(){
 const opts=lockOpts(),rows=gardenRows(data.rows,data.path,lessons.lessons,opts);
 if(stoneOf(selected,opts)!=='open')selected=openTopics(opts)[0]?.id||null;
 main.innerHTML=heading('Learn','Choose a stone to open its lessons.')+gardenMarkup({rows,renderNode:id=>nodeCard(data.nodes.find(n=>n.id===id),opts)});
 bindGarden(main);
 main.querySelectorAll('[data-node]').forEach(b=>b.onclick=()=>{selected=b.dataset.node;navigate(`node/${selected}`,'forward');});
}
function nodeView(id,from=''){
 const n=data.nodes.find(x=>x.id===id);if(!n)return missing();selected=id;
 const topics=openTopics(),index=topics.findIndex(x=>x.id===id),previous=topics[index-1],next=topics[index+1];
 // Each row says what its lesson is now: done, in progress, open, or locked (lessonLock), greyed with no reason. A due
 // checkpoint is a row above the first lesson it locks. Nothing here suggests where to go next. In Sensei mode every
 // checkpoint is a row where it sits (checkpointLocation: after its boundary lesson, once every stone is open), with its status.
 const cp=dueNow(),opts=lockOpts(cp),fresh=justUnlocked||{lessons:new Set(),checkpoint:null};justUnlocked=null;
 const cps=(sensei?checkpointStatus(data.path,lessons,cpOpts()):cp?[cp]:[]).map(c=>({cp:c,place:checkpointPlace(c,lockOpts(c))}));
 const cpRows=(id,side)=>cps.filter(x=>x.place?.[side]===id).map(x=>checkpointRow(x.cp,fresh.checkpoint===x.cp.n)).join('');
 const rows=group=>group.lessons.map(l=>`${cpRows(l.id,'before')}${lessonRow(l,lockOf(l.id,opts),fresh.lessons.has(l.id))}${cpRows(l.id,'after')}`).join('');
 const lessonList=topicLessonGroups(n,data.path,lessons.lessons).map(group=>`<h3 class="lesson-group">${esc(group.title)}</h3><ol class="lesson-rows">${rows(group)}</ol>`).join('');
 // Planned lessons: the outline titles not written yet (learn.mjs plannedTitles), never a lesson that became a practice.
 const planned=plannedTitles(n,lessons.lessons,practicesOf(lessons)).map(stage=>`<h3 class="lesson-group">${esc(stage.title)}</h3><ol class="lesson-rows">${stage.titles.map(plannedRow).join('')}</ol>`).join('');
 main.innerHTML=`<div class="node-page"><div class="panel-toolbar"><a class="back-link" href="#field">← Learn</a><span class="small">Topic ${index+1} of ${topics.length}</span><div class="panel-arrows"><button class="panel-arrow" data-neighbor="${previous?.id||''}" data-direction="backward" aria-label="Previous topic" ${previous?'':'disabled'}>←</button><button class="panel-arrow" data-neighbor="${next?.id||''}" data-direction="forward" aria-label="Next topic" ${next?'':'disabled'}>→</button></div></div><div class="node-heading"><span class="large-node-symbol" aria-hidden="true">${n.icon}</span><div><div class="eyebrow">${n.level?`LEVEL ${n.level}`:'START HERE'}</div><h1>${esc(n.title)}</h1></div></div>${n.outcomes?.length?`<section class="topic-outcomes" aria-labelledby="outcomes-title"><h2 class="topic-outcomes-head" id="outcomes-title">You will be able to</h2><ul class="check-list">${n.outcomes.map(o=>`<li>${esc(o)}</li>`).join('')}</ul></section>`:''}<section class="topic-section" aria-labelledby="lessons-title"><h2 id="lessons-title">Lessons</h2>${lessonList}</section>${planned?`<details class="topic-details topic-planned"><summary>Planned lessons</summary><div class="topic-details-body"><p class="small">These lessons are not written yet.</p>${planned}</div></details>`:''}</div>`;
 main.querySelectorAll('[data-neighbor]').forEach(b=>b.onclick=()=>{if(b.dataset.neighbor)navigate(`node/${b.dataset.neighbor}`,b.dataset.direction);});
 // After an unlock reveal the first row it opened takes focus. Otherwise, back from one of its rows (a lesson or the
 // checkpoint), that row does; it is scrolled to when the page has no saved position, as after
 // a lesson opened by a direct URL.
 if(main.querySelector('.topic-section a.lesson-row.is-unlocked')){routeFocus='.topic-section a.lesson-row.is-unlocked';revealFocus=true;}
 else if(from&&[...main.querySelectorAll('.topic-section a.lesson-row')].some(a=>a.getAttribute('href')===`#${from}`)){routeFocus=`.topic-section a.lesson-row[href="#${from}"]`;revealFocus=!scrollPositions.has(`node/${id}`);}
 let gesture=null;
 main.onpointerdown=e=>{if(e.pointerType==='touch'&&!e.target.closest('a,button,input,textarea,summary,select'))gesture={x:e.clientX,y:e.clientY,id:e.pointerId};};
 main.onpointercancel=()=>{gesture=null;};
 main.onpointerup=e=>{if(!gesture||gesture.id!==e.pointerId)return;const dx=e.clientX-gesture.x,dy=e.clientY-gesture.y;gesture=null;if(Math.abs(dx)>85&&Math.abs(dx)>Math.abs(dy)*1.7){const target=dx<0?next:previous;if(target)navigate(`node/${target.id}`,dx<0?'forward':'backward');}};
}
function missing(){main.innerHTML=heading('Page not found')+'<a class="button" href="#field">Go to Learn</a>';}
function navigate(path,direction){
 const key=path.replace(/^#/, '');if(key===activeRoute)return;
 navigationDirection=direction||null;history.pushState({from:activeRoute},'',`#${key}`);return route();
}
document.addEventListener('click',e=>{
 const link=e.target.closest('a[href^="#"]');if(!link||link.classList.contains('skip-link')||e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;
 e.preventDefault();navigate(link.getAttribute('href'));
});
const RETIRED_ROUTES=['lessons','today','retention','phrases','readings'];
// The lesson editor (#studio, or #editor) was removed on 2026-10-23, and Kanji cards left Practice for its own page that day.
const KANJI_ROUTES=['studio','editor','practice/kanji-cards'];
// Word lists (#library/words) became the Dictionary's Core words and Restaurant extra filters on 2026-10-23. An old link
// opens the Dictionary on Core words: a one-shot start that bindDictionary reads and clears.
let dictionaryStart='';
async function route(){
 // Retired pages (#lessons, and Today with its review pages #today, #retention, #phrases and #readings): an old link
 // (a bookmark or history entry) replaces itself with Learn, so Back never lands on a page that no longer exists.
 let key=location.hash.slice(1)||'field';if(RETIRED_ROUTES.includes(key.split('/')[0])){history.replaceState(history.state,'','#field');key='field';}
 // The editor's and the old Kanji cards practice's addresses replace themselves with Kanji, leaving no history entry.
 if(KANJI_ROUTES.includes(key)||['studio','editor'].includes(key.split('/')[0])){history.replaceState(history.state,'','#kanji');key='kanji';}
 // The Library opens on Reading: a bare #library (an old link or bookmark) replaces itself, leaving no history entry.
 if(key==='library'){history.replaceState(history.state,'','#library/reading');key='library/reading';}
 // The retired Word lists page (#library/words) replaces itself with the Dictionary, leaving no history entry, and the
 // Dictionary opens on Core words.
 if(key==='library/words'){history.replaceState(history.state,'','#library/dictionary');key='library/dictionary';dictionaryStart='core';}
 // Nothing locked renders: a topic, lesson, checkpoint, practice set or book that is not open (and the old #core-check
 // and #plus) replaces its address with where it lives, leaving no history entry (routeGuard).
 const allowed=routeGuard()(key);
 if(allowed!==key){history.replaceState(history.state,'',`#${allowed}`);key=allowed;routeFocus=null;revealFocus=false;}
 if(key!=='library/dictionary'||key===activeRoute)dictionaryStart='';
 if(key===activeRoute)return;
 const openDialog=document.getElementById('word-dialog');if(openDialog?.open){wordReturn=null;openDialog.close();}
 const [name,id,sub]=key.split('/');const previousKey=activeRoute,old=main;
 if(previousKey)scrollPositions.set(previousKey,old.scrollTop);
 for(const panel of viewport.querySelectorAll('.page-panel'))if(panel!==old)panel.remove();
 old.getAnimations().forEach(a=>a.cancel());old.inert=true;old.setAttribute('aria-hidden','true');old.removeAttribute('id');old.querySelectorAll('[id]').forEach(el=>el.removeAttribute('id'));
 main=document.createElement('section');main.className='page-panel';main.id='active-panel';main.tabIndex=-1;main.setAttribute('aria-label','Learning panel');viewport.append(main);
 cancelDrag('navigation');collectQueue=[];quizRefs.clear();
 activeRoute=key;view=name;panelRefresh=null;revealedHere=new Set();if(!['library','deck','recall'].includes(name))deckUndo=null;
 const section=librarySection(name,id);
 document.querySelectorAll('[data-view]').forEach(a=>{const active=a.dataset.view===name||(['node','lesson','checkpoint'].includes(name)&&a.dataset.view==='field')||(['passage','unseen','deck','recall'].includes(name)&&a.dataset.view==='library');a.classList.toggle('active',active);if(active)a.setAttribute('aria-current',a.dataset.view==='library'&&section?'true':'page');else a.removeAttribute('aria-current');});
 // The Library's sections open under it in the sidebar while you are anywhere in the Library.
 const subnav=document.getElementById('library-subnav');if(subnav){subnav.hidden=!['library','passage','unseen','deck','recall'].includes(name);subnav.querySelectorAll('[data-section]').forEach(a=>{const on=a.dataset.section===section;a.classList.toggle('active',on);if(on)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});}
 if(name!=='node')justUnlocked=null;
 if(name==='field')field();else if(name==='node')nodeView(id,previousKey);else if(name==='practice')id?practiceRun(id,sub,previousKey):practice(previousKey);else if(name==='lesson')lessonView(id);else if(name==='checkpoint')checkpointView(id);else if(name==='passage')passageView(id);else if(name==='unseen')unseenView(id);else if(name==='library')library(id,previousKey);else if(name==='deck')deckView(id);else if(name==='recall')recallView(id);else if(name==='kanji')kanjiPage(id,sub,previousKey);else if(name==='guide')guide();else missing();
 main.scrollTop=scrollPositions.get(key)||0;
 // A view can name the element that should take focus on arrival, e.g. the row or source link it was left from.
 const arrival=routeFocus&&main.querySelector(routeFocus);routeFocus=null;const routeReveal=revealFocus;revealFocus=false;
 if(arrival){arrival.focus({preventScroll:true});if(routeReveal)arrival.scrollIntoView({block:'center'});}else{const node=name==='field'&&previousKey.startsWith('node/')?main.querySelector(`[data-node="${selected}"]`):null;(node||main).focus({preventScroll:true});}
 // A practice or a kanji set is one deeper per segment: the list 0, its board or part list 1, its run 2.
 const depth=x=>/^(practice|kanji)\//.test(x)?x.split('/').length-1:({node:1,checkpoint:1,lesson:2,passage:1,unseen:1,deck:1,recall:2}[x.split('/')[0]]||0);
 // Library sections sit between the Library and Kanji, in sidebar order.
 const order=['field','practice','library',...LIBRARY_SECTIONS.map(s=>`library/${s.id}`),'kanji','guide'],rank=k=>order.includes(k)?order.indexOf(k):order.indexOf(k.split('/')[0]);
 const backward=navigationDirection==='backward'||(!navigationDirection&&(depth(key)<depth(previousKey)||(depth(key)===0&&depth(previousKey)===0&&rank(key)<rank(previousKey))));
 navigationDirection=null;
 if(!previousKey||matchMedia('(prefers-reduced-motion: reduce)').matches||!main.animate){old.remove();return;}
 const entering=main;
 const enter=entering.animate([{transform:`translateX(${backward?'-100%':'100%'})`},{transform:'translateX(0)'}],{duration:240,easing:'cubic-bezier(.2,.7,.2,1)'});
 old.animate([{transform:'translateX(0)'},{transform:`translateX(${backward?'100%':'-100%'})`}],{duration:240,easing:'cubic-bezier(.2,.7,.2,1)',fill:'forwards'});
 try{await enter.finished;}catch{}finally{old.remove();}
}
// Passage questions (refs in quizRefs, set by the passage view: {container, source, prefix(i)}) name the exercise texts,
// so the words they reference can be collected beside the question. The answer buttons stay plain.
// Before an answer: the words show as written in the question, with no details or readings beyond the question's own,
// and Add to deck queues. After the answer: the queue applies and the words open their details like any reference.
const deferKey=(key,i)=>`${key}|${i}`;
// Passage questions use `passage:<id>|<questionId>` and read their first response from the attempt in progress.
const answered=defer=>{if(!defer)return true;const [key,i]=defer.split('|');if(key.startsWith('passage:')){const d=draftFor(state.recall,key.slice(8));return !d||d.answers.some(a=>a.q===i);}return Number.isInteger(state.answers[key]?.[`q${i}`]);};
// A word's label for a deck chooser, as its text shows it: kana for a kana or kana-kanji token, kanji for a kanji one.
const surfaceLabel=stagedPlain;
function questionWords(key,i){
 const refs=quizRefs.get(key),list=refs?exerciseOccurrences(refs.container,refs.prefix(i)).filter(o=>words.has(o.word)):[];
 if(!list.length)return '';
 const defer=deferKey(key,i),open=answered(defer);
 return `<h4 class="eyebrow question-words-title">WORDS IN THIS QUESTION</h4><p class="small">${open?'Select a word for its details, or add it to a deck.':'You can add these words to a deck now. Details open after you answer.'}</p><ul class="collect-list">${list.map(o=>`<li class="collect-item">${open?`<span class="jp collect-word" lang="ja">${wordRef(o,refs.source)}</span>`:`<span class="jp collect-word is-held" lang="ja" data-drag-word data-word="${esc(o.word)}" data-source="${esc(refs.source)}" data-occurrence="${o.index}" data-defer="${esc(defer)}">${jp(o.surface)}</span>`}${deckChooser(o.word,`q-${key}-${i}`,{source:refs.source,occurrence:o.index,defer:open?'':defer,label:open?'':surfaceLabel(o.surface)})}</li>`).join('')}</ul><p class="small collect-status" role="status" aria-live="polite"></p>`;
}
// Applies a question's queued collections once its feedback is shown, then reopens its words.
function releaseCollections(key,i,card){
 const r=commitCollections(state,collectQueue,{card:deferKey(key,i)});collectQueue=r.queue;
 if(r.results.length)commit(r.state);
 const row=card.querySelector('[data-question-words]');if(!row)return;
 if(row.querySelector('.is-held')){row.innerHTML=questionWords(key,i);bindWordRefs();}
 if(!r.results.length)return;
 r.results.filter(x=>x.discovered).forEach(x=>markDiscovered(x.word));
 const by=f=>r.results.filter(f),name=x=>wordName(x.word),deck=x=>findDeck(state,x.deck)?.name||'a deleted deck';
 const msg=[...by(x=>x.added).map(x=>`Added ${name(x)} to ${deck(x)}.`),...by(x=>x.already).map(x=>`${name(x)} was already in ${deck(x)}.`),...by(x=>x.error).map(x=>`${name(x)} was not added: ${x.error}`)].join(' ');
 row.querySelector('.collect-status').textContent=msg;
 syncChoosers();deckChanged({discovered:r.results.some(x=>x.discovered)});renderTray();
}
// Reading check before a text: up to six due kanji words, each in its own sentence without its reading.
// Due words were met earlier and last seen on an earlier day, so every answer here can count as a delayed retrieval.
// Only words the learner has met in a kanji words drill (wordStage) are asked, or recorded as seen in the text: nothing is
// tested before it is taught, and an unmet word is skipped and stays unmet (docs/data-contract.md "Kanji words").
const TEXT_PATHS=/^(paragraphs|dialogue|contrast)\//,inText=path=>TEXT_PATHS.test(path);
const metWord=id=>wordStage(state.kanjiWords,id)!=='unmet';
function prepareReadingCheck(container,source){
 const now=Date.now(),items=readingCheckItems(container,words,state.readingEvidence,now,{source,body:inText,met:metWord});
 const met=recordReadingMeetings(state.readingEvidence,kanjiWordsIn(container,words,inText).filter(metWord),now);
 if(met.added)commit({...state,readingEvidence:met.store});
 return items;
}
function gateHTML(items){
 if(!items.length)return '';
 const one=items.length===1;
 return `<section class="reading-gate card" id="reading-gate" aria-labelledby="gate-title"><h2 id="gate-title" tabindex="-1">Reading check · ${plural(items.length,'word')}</h2><div id="gate-body"><p>You have seen ${one?'this word':'these words'} before. Read ${one?'it':'each one'} in its sentence and choose the reading from memory.</p><div class="actions"><button type="button" class="button" id="gate-start">Start the check</button><button type="button" class="button secondary" id="gate-skip">Skip to the text</button></div><p class="small">${lengthLabel(1)} check.</p></div></section>`;
}
// Words in this check appear in kanji with no reading in the markup anywhere in a check sentence (a fixed display that no
// stage or Show all kanji changes), so one item never gives away another.
function gateSentence(container,o,hidden){
 const value=resolvePath(container,o.path),[a,b]=sentenceRange(value,o.start,o.end),bare=x=>jp(x.surface,{display:'kanji',reveal:false});
 let html='',at=a;
 for(const x of occurrencesAt(container,o.path).filter(x=>hidden.has(x.word)&&x.start>=a&&x.end<=b).sort((p,q)=>p.start-q.start)){
  html+=jp(value.slice(at,x.start))+(x.start===o.start?`<mark class="reading-target">${bare(x)}</mark>`:bare(x));at=x.end;
 }
 return html+jp(value.slice(at,b));
}
function bindReadingGate(container,source,items,onOpen){
 const gate=$('#reading-gate');if(!gate)return;
 const body=$('#gate-body'),results=[],checkWords=new Set(items.map(x=>x.word));let i=0;
 const names=list=>list.map(r=>`<span lang="ja">${esc(plainWritten(words.get(r.word).word))}</span>`).join('、');
 function open(note){gate.classList.add('is-done');gate.innerHTML=`<p class="small gate-note"><strong>Reading check</strong> · ${esc(note)}</p>`;onOpen();}
 function summary(){
  const right=results.filter(r=>r.correct).length,newly=results.filter(r=>r.faded),missed=results.filter(r=>!r.correct);
  body.innerHTML=`<h3 id="gate-done" tabindex="-1">Check complete · ${right} of ${results.length} correct</h3>${newly.length?`<p>Now retained: ${names(newly)}.</p>`:''}${missed.length?`<p>Back in a later check: ${names(missed)}.</p>`:''}<div class="actions"><button type="button" class="button" id="gate-continue">Continue to the text</button></div>`;
  $('#gate-continue').onclick=()=>open(`${right} of ${results.length} correct.`);
  $('#gate-done').focus();
 }
 function step(){
  const item=items[i],o=item.occurrence,w=words.get(item.word),{answer,choices}=readingChoices(o.surface,lessons,{seed:`${item.word}|${source}|${new Date().toDateString()}`});
  let answered=false;
  body.innerHTML=`<p class="eyebrow gate-progress">WORD ${i+1} OF ${items.length}</p><h3 id="gate-q" tabindex="-1">How do you read the marked word?</h3><p class="jp gate-sentence" id="gate-sentence" lang="ja">${gateSentence(container,o,checkWords)}</p>`+
   `<div class="choices gate-choices" role="group" aria-labelledby="gate-q" aria-describedby="gate-sentence">${choices.map((c,j)=>`<button type="button" class="choice" data-reading="${esc(c)}" aria-pressed="false"><span class="choice-letter" aria-hidden="true">${String.fromCharCode(65+j)}</span><span lang="ja">${esc(c)}</span></button>`).join('')}</div>`+
   `<div class="answer-feedback" id="gate-feedback" role="status" aria-live="polite"></div><div class="actions hidden" id="gate-next-row"><button type="button" class="button" id="gate-next">${i+1<items.length?'Next word →':'See the result'}</button></div>`;
  const submit=given=>{
   if(answered)return;answered=true;
   const correct=given===answer,before=progressFor(item.word),now=Date.now(),event=readingCheckEvent(state.readingEvidence?.words?.[item.word],correct,now);
   // Also a kanji word answer, as in a drill (kanjiWordsAnswer): no points either way; a wrong answer brings back a known
   // word's reading, which the text after the check then shows (refreshKanji), and a right one clears it.
   const kw=kanjiWordsAnswer(null,{kanjiWord:item.word},correct,now),moved=kw!==state.kanjiWords;if(moved)announceMet(kw);
   commit({...state,readingEvidence:recordReadingEvent(state.readingEvidence,item.word,{kind:'check',source,occurrence:o.index,correct},now),outcomes:logged({type:'reading',ref:item.word,venue:'text',...event},now),...(moved?{kanjiWords:kw}:{})});
   if(moved)refreshKanji();
   const after=progressFor(item.word),counted=correct&&after.delayed>before.delayed;
   results.push({word:item.word,correct,faded:after.faded&&!before.faded});
   body.querySelectorAll('[data-reading]').forEach(b=>{b.disabled=true;b.classList.toggle('selected',b.dataset.reading===given);b.setAttribute('aria-pressed',String(b.dataset.reading===given));if(b.dataset.reading===answer)b.insertAdjacentHTML('beforeend','<span class="choice-note">✓ reading here</span>');});
   const note=!correct?'This word comes back in a later check.'
    :!counted?'You saw this word recently, so this one is practice only.'
    :after.faded&&!before.faded?`Right on separate days in ${after.sources.length} texts, so it is now retained.`
    :after.faded?'Still retained.'
    :`Counted. Get it right in a different text on a later day to retain it.`;
   const dictionaryForm=plainWritten(o.surface)!==plainWritten(w.word)?`Dictionary form <span class="written-form" lang="ja">${jp(w.word,{display:'kanji-reading'})}</span> · `:'';
   const feedback=$('#gate-feedback');feedback.className=`answer-feedback ${correct?'correct':'incorrect'}`;
   feedback.innerHTML=`<strong>${correct?'Correct':'Not quite'}</strong><p>In this sentence <span class="written-form gate-answer" lang="ja">${jp(o.surface,{display:'kanji-reading'})}</span> reads <strong lang="ja">${esc(answer)}</strong>.</p><p class="small">${dictionaryForm}${esc(w.meaning)}</p><p class="small">${esc(note)}</p>`;
   $('#gate-next-row').classList.remove('hidden');$('#gate-next').focus({preventScroll:true});revealFeedback(feedback);
  };
  body.querySelectorAll('[data-reading]').forEach(b=>b.onclick=()=>submit(b.dataset.reading));
  $('#gate-next').onclick=()=>{i++;if(i<items.length){step();$('#gate-q').focus();}else summary();};
 }
 $('#gate-start').onclick=()=>{step();$('#gate-q').focus();};
 $('#gate-skip').onclick=()=>open('Skipped.');
}
// Shows the text after the check, with fading recalculated from the answers just given.
function openText(columns){columns.classList.remove('hidden');$('#deck-tray')?.classList.remove('hidden');refreshWordRefs();columns.focus();}
// Paged lists (#0032): a long list shows six rows a page, so a page stays short however far the course grows. Pages last
// for the session; coming back from a row shows its page and focuses it.
const PAGE_SIZE=6,listPages=new Map();
const pagerHTML=(list,label,n)=>n>PAGE_SIZE?`<div class="list-pager" data-pager="${esc(list)}"><button type="button" class="button secondary small" data-step="-1" aria-label="Previous ${esc(label)}">← Previous</button><span class="small" aria-live="polite"></span><button type="button" class="button secondary small" data-step="1" aria-label="Next ${esc(label)}">Next →</button></div>`:'';
const pagedRows=(list,rows,label,cls='')=>`<ol class="lesson-rows${cls?` ${cls}`:''}" data-list="${esc(list)}">${rows.join('')}</ol>${pagerHTML(list,label,rows.length)}`;
function pageRows(ol,page,ui){
 const rows=[...ol.children],last=Math.max(0,Math.ceil(rows.length/PAGE_SIZE)-1),list=ol.dataset.list;page=Math.min(Math.max(0,page),last);
 ui.pages.set(list,page);rows.forEach((li,i)=>li.hidden=Math.floor(i/PAGE_SIZE)!==page);
 const pager=[...main.querySelectorAll('[data-pager]')].find(p=>p.dataset.pager===list);if(!pager)return;
 pager.querySelector('span').textContent=`${page*PAGE_SIZE+1}–${Math.min(rows.length,(page+1)*PAGE_SIZE)} of ${rows.length}`;
 pager.querySelectorAll('button').forEach(b=>b.setAttribute('aria-disabled',String(b.dataset.step==='-1'?page===0:page===last)));
}
// Wires the pagers of the page just drawn. `from` is the route just left: its row's page is shown and the row takes focus.
function wirePagedRows(key,{from=''}={}){
 let ui=listPages.get(key);const lists=[...main.querySelectorAll('ol[data-list]')],rowIn=(ol,href)=>[...ol.children].findIndex(li=>li.querySelector('a')?.getAttribute('href')===href);
 if(!ui)listPages.set(key,ui={pages:new Map()});
 const back=from&&lists.find(ol=>rowIn(ol,`#${from}`)>=0);
 if(back){ui.pages.set(back.dataset.list,Math.floor(rowIn(back,`#${from}`)/PAGE_SIZE));routeFocus=`ol[data-list="${back.dataset.list}"] a[href="#${from}"]`;}
 for(const ol of lists)pageRows(ol,ui.pages.get(ol.dataset.list)||0,ui);
 main.querySelectorAll('[data-pager]').forEach(p=>p.onclick=e=>{const b=e.target.closest('button[data-step]'),ol=lists.find(o=>o.dataset.list===p.dataset.pager);if(!b||!ol||b.getAttribute('aria-disabled')==='true')return;pageRows(ol,(ui.pages.get(ol.dataset.list)||0)+Number(b.dataset.step),ui);});
}
// Practice (learning-loop.md): the practice sets of lessons.json `practices`, each at #practice/<id>, grouped under their
// home lesson. Groups follow the garden's stone order, then the path order of their home lessons; within a group,
// general sets come before optional ones, which carry a small Optional label, and a set that builds on another set of
// the group follows it (chain depth), else content order. A hidden set is not in the pond; a revealed
// one is a koi silhouette with no name, no requirements and no way in; an open, started or finished one is a koi link
// with its name and a short status. A group's header names its home lesson and shows once one of its sets is open, so a
// silhouette never says what it needs. Sets keep their own results and never change a lesson's completion. Unit practices
// (kind 'unit') are grouped this way; any other kind has no view and is not listed. Kanji cards is its own page (#kanji).
// PRACTICE_LOOK: each set's koi (river.mjs) and, where it differs from its home lesson's topic, its category line.
// The Dating sets keep their topic's name: their home lesson, Invite someone, is in Making plans.
const DATING={category:'Dating and relationships'};
const PRACTICE_LOOK={'restaurant-review':{fish:'crown'},'everyday-dishes':{fish:'indigo',category:'Extra vocabulary'},'without-onions':{fish:'coral'},'sizes-colors':{fish:'tricolor'},
 'dating-interests':{fish:'butterfly',...DATING},'dating-ask':{fish:'red-white',...DATING},'dating-confirm':{fish:'moonlight',...DATING},'dating-feelings':{fish:'porcelain',...DATING}},DEFAULT_LOOK={fish:'silver'};
const SET_STATUS={open:'Ready',started:'In progress',finished:'Done'};
// Practice and Reading groups follow the garden's stone order, then the path order of their home lessons.
function homeOrder(a,b){
 const stones=data.rows.flatMap(row=>row.nodes),order=data.path.core,rank=(list,x)=>{const i=list.indexOf(x);return i<0?list.length:i;};
 return rank(stones,lessonOf(a)?.node)-rank(stones,lessonOf(b)?.node)||rank(order,a)-rank(order,b);
}
function practiceGroups(content,progress){
 const groups=new Map();
 for(const p of unitPractices()){const s=itemState(p.id,content,progress);if(s==='hidden')continue;if(!groups.has(p.home))groups.set(p.home,[]);groups.get(p.home).push({p,s});}
 // How many practice sets deep a set's chain is: 0 for one that needs lessons only.
 const depth=(p,seen=new Set())=>{if(seen.has(p.id))return 0;seen.add(p.id);let d=0;for(const r of p.requires||[]){const m=/^practice:([a-z0-9-]+)$/.exec(r),q=m&&practiceOf(m[1]);if(q)d=Math.max(d,1+depth(q,seen));}return d;};
 return [...groups].map(([home,sets])=>({home,sets:sets.sort((a,b)=>(a.p.optional===true)-(b.p.optional===true)||depth(a.p)-depth(b.p))}))
  .sort((a,b)=>homeOrder(a.home,b.home));
}
function practice(from=''){
 const content=loopContent(),progress=loopProgress();
 const koi=({p,s})=>{
  const look={...DEFAULT_LOOK,...PRACTICE_LOOK[p.id]};if(s==='revealed')return {silhouette:true,fish:look.fish};
  const category=look.category||data.nodes.find(n=>n.id===lessonOf(p.home)?.node)?.title||'';
  // A practice in parts says which part the learner is on while it is started (Part k of n); Ready and Done as any set.
  const parts=s==='started'?partStatesOf(p):[];
  return {id:`practice-${p.id}`,href:`#practice/${p.id}`,fish:look.fish,category:p.optional===true?['Optional',category].filter(Boolean).join(' · '):category,title:p.title,status:parts.length?`Part ${currentPart(parts)} of ${parts.length}`:SET_STATUS[s],done:s==='finished'};
 };
 const groups=practiceGroups(content,progress).map(g=>({title:g.sets.some(x=>x.s!=='revealed')?lessonOf(g.home)?.title||'':'',nodes:g.sets.map(koi)}));
 const nodes=groups.flatMap(g=>g.nodes),choose=nodes.some(n=>!n.silhouette);
 main.innerHTML=heading('Practice',choose?'Choose a koi to revisit what you’ve learned.':'Practice sets appear here as you work through lessons.')+practiceWaterMarkup(nodes,{choose});
 groupPond(groups);
 // Back from a set, its koi takes focus. Opened any other way (the sidebar, a link, a direct #practice), Practice starts at the top with the first open koi not done focused, scrolled into
 // view only when it is not already wholly on screen; with every open koi done, or none open, it stays at the top.
 const returning=nodes.find(node=>node.href===`#${from}`);
 if(returning){routeFocus=`#${returning.id}`;revealFocus=true;}
 else{
  scrollPositions.delete('practice');
  const next=nodes.find(n=>!n.silhouette&&!n.done),el=next&&main.querySelector(`#${next.id}`);
  if(el){const r=el.getBoundingClientRect(),m=main.getBoundingClientRect();routeFocus=`#${next.id}`;revealFocus=r.top<m.top||r.bottom>m.bottom;}
 }
}
// Splits the pond's koi (river.mjs draws them in one row of pools, in group order) into one block per home lesson under
// its header. A pond with no header yet (silhouettes only) stays as drawn.
function groupPond(groups){
 const pools=main.querySelector('.river-pools');if(!pools||!groups.some(g=>g.title))return;
 const koi=[...pools.children];let at=0;
 pools.classList.add('is-grouped');
 pools.replaceChildren(...groups.map((g,i)=>{
  const box=document.createElement('div'),list=document.createElement('div');box.className='river-group';list.className='river-group-pools';
  if(g.title){const h=document.createElement('h2');h.className='river-group-head';h.id=`practice-group-${i}`;h.textContent=g.title;box.setAttribute('role','group');box.setAttribute('aria-labelledby',h.id);box.append(h);}
  list.append(...koi.slice(at,at+=g.nodes.length));box.append(list);return box;
 }));
}
// ── Drills ───────────────────────────────────────────────────────────────────────────────────────────────
// Textbook drills (exercises.mjs). Every answer is a tap, or a drag of a tile in an order line. A context says how
// results are kept. learn: each counted unit (item, match pair, sort card or cloze gap) records right, wrong or fixed
// in state.answers[lessonId], and a wrong answer can be tried again. review: one result per item, first try only, then
// the answer shows. Locked controls use aria-disabled, so keyboard focus stays where it was.
const LETTERS='ABCD';
const isJa=s=>/[぀-ヿ㐀-鿿]/.test(plainWritten(s));
const langAttr=s=>isJa(s)?' lang="ja"':'';
const domId=id=>`drill-${String(id).replace(/[^A-Za-z0-9-]/g,'_')}`;
const off=b=>b.getAttribute('aria-disabled')==='true';
const lockButton=b=>b.setAttribute('aria-disabled','true');
const flashWrong=(...els)=>{for(const el of els){el.classList.remove('is-wrong');void el.offsetWidth;el.classList.add('is-wrong');setTimeout(()=>el.classList.remove('is-wrong'),700);}};
// Feedback a tap opens slides into view: on a phone it often opens below the screen or under the page dock, so its panel
// scrolls smoothly just far enough to show it through `end` (by default the Next row right after it, when there is one),
// but never past its top (kept below a sticky toolbar). Feedback already in view stays put.
function revealFeedback(fb,end){
 requestAnimationFrame(()=>{
  const panel=fb?.isConnected&&fb.closest('.page-panel');if(!panel||!fb.getClientRects().length)return;
  const after=fb.nextElementSibling;end||=after?.matches('.actions,button')&&after.getClientRects().length?after:fb;
  const view=panel.getBoundingClientRect(),bar=panel.querySelector('.panel-toolbar');
  const docks=[...panel.querySelectorAll('.page-dock,.deck-tray')].map(d=>d.getBoundingClientRect()).filter(r=>r.height&&r.bottom>=view.bottom-1);
  const floor=Math.min(view.bottom,...docks.map(r=>r.top))-12,ceiling=view.top+(bar&&getComputedStyle(bar).position==='sticky'?bar.offsetHeight:0)+12;
  const by=Math.min(end.getBoundingClientRect().bottom-floor,fb.getBoundingClientRect().top-ceiling);
  if(by>0)panel.scrollBy({top:by,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
 });
}
// A choice item's Japanese line with its marked part underlined. kw: a kanji words item's displays (kwDisplay), target
// for the marked part and rest for the line around it. ref: the line's reference context (unitRefs), whose referenced
// words become word buttons (refRun), the marked one still underlined as the mark.
function markHTML(ja,mark,kw=null,ref=null){
 const m=splitMark(ja,mark),rest=kw?.rest||{},line=ref&&resolvePath(ref.container,ref.path)===ja?ref:null;
 const run=(a,b,opts)=>line?refRun(line,a,b,opts):jp(ja.slice(a,b),opts);
 if(!m)return run(0,ja.length,rest);
 const i=m[0].length,j=i+m[1].length;
 return `${run(0,i,rest)}<span class="drill-mark">${run(i,j,kw?.target||{})}</span>${run(j,ja.length,rest)}`;
}
// Kanji words items (docs/data-contract.md "Kanji words drill"): what each part shows, by ask. A meaning item's target is
// kanji with its reading. A reading item's target (and its word anywhere else in the line), and a find item's choices and
// their words on the card, are bare kanji with no reading in the markup until the item is answered (solved), then kanji
// with the reading. Everything else stays in the learner's stages. Fixed displays are never restaged, so Show all kanji
// cannot reveal a target. null for an item that asks about no kanji word.
const SHOWN={display:'kanji-reading'};
function kwDisplay(it,answered=false){
 if(!it?.kanjiWord)return null;
 const hidden=answered?SHOWN:{display:'kanji',reveal:false};
 if(it.ask==='meaning')return {target:SHOWN,rest:{}};
 if(it.ask==='reading')return {target:hidden,rest:{...hidden,words:[it.kanjiWord]}};
 if(it.ask==='find'){const ids=[it.kanjiWord,...(it.choices||[]).flatMap(c=>resolveText(c,kanjiIndex).flatMap(p=>!p.token?[]:p.word?[p.word]:p.candidates))];return {card:{...hidden,words:ids},choice:hidden};}
 return null;
}
// Feedback on an item about a kanji word (every item in a kanji words drill names one) shows every token in kanji with its
// reading, whatever the stage, so a line that explains a misreading keeps its kanji.
const feedbackOpts=it=>it?.kanjiWord?SHOWN:{};
// A kanji words item once solved: its targets show their readings, in place.
function revealTargets(li,it){
 const kw=kwDisplay(it,true);if(!kw)return;
 // The line keeps its reference context, so a reading target becomes its word button only now, with its reading shown.
 const ja=li.querySelector('.drill-ja');if(ja&&it.ja){ja.innerHTML=markHTML(it.ja,it.mark,kw,refOn(ja));if(ja.querySelector('[data-word-ref]'))bindWordRefs();}
 const card=li.querySelector('.realia');if(card&&it.card)card.innerHTML=it.card.map(x=>`<p>${jp(x,kw.card||{})}</p>`).join('');
 if(kw.choice)li.querySelectorAll('[data-pick] [data-choice-text]').forEach(x=>{x.innerHTML=jp(it.choices[Number(x.closest('[data-pick]').dataset.pick)],kw.choice);});
}
const verdict=(ok,text,extra='',opts={})=>`<strong>${ok===null?'Missed in this review':ok?'Correct':'Not quite'}</strong>${text?`<p>${jp(String(text).replace(/^Correct[.!]\s*/,''),opts)}</p>`:''}${extra}`;
const starFull=it=>`${jp(it.before||'')}${it.tiles.map((t,k)=>k===it.star?`<mark class="star-mark">${jp(t)}</mark>`:jp(t)).join('')}${jp(it.after||'')}`;
function patternHTML(p){return String(p).split(/(［[^］]*］)/).map(x=>/^［.*］$/.test(x)?`<span class="slot">${jp(x.slice(1,-1))}</span>`:jp(x)).join('');}
function cardHTML(it,opts={}){return it.card?`<div class="realia" lang="ja">${it.card.map(x=>`<p>${jp(x,opts)}</p>`).join('')}</div>`:'';}
// One drill item. stem: show the format's Japanese line (mixed sets); instruction: also its drill's English line; ref: the
// reference context of a choice item's Japanese line in its unit (unitRefs).
function drillHTML(it,ctx,n,{stem=false,instruction=false,ref=null}={}){
 const id=domId(it.id),q=`${id}-q`,seed=ctx.seed,kw=kwDisplay(it);let body='';
 if(it.format==='choice')body=`<p class="drill-prompt" id="${q}">${jp(it.prompt)}</p>${cardHTML(it,kw?.card)}${it.ja?`<p class="jp drill-ja" lang="ja"${refAttrs(ref)}>${markHTML(it.ja,it.mark,kw,ref)}</p>`:''}<div class="choices drill-choices" role="group" aria-labelledby="${q}">${drillChoiceOrder(it,seed).map((j,k)=>`<button type="button" class="choice" data-pick="${j}" aria-pressed="false"><span class="choice-letter" aria-hidden="true">${LETTERS[k]}</span><span${langAttr(it.choices[j])} data-choice-text>${jp(it.choices[j],kw?.choice)}</span></button>`).join('')}</div>`;
 else if(it.format==='blank'){const [a,b]=splitGap(it.ja);body=`<p class="jp drill-sentence" lang="ja" id="${q}">${jp(a)}<span class="drill-gap" data-gap><span class="sr-only">blank</span></span>${jp(b)}</p>${it.en?`<p class="small drill-en">${jp(it.en)}</p>`:''}<div class="chip-row" role="group" aria-labelledby="${q}">${drillChoiceOrder(it,seed).map(j=>`<button type="button" class="chip" data-pick="${j}" aria-pressed="false" lang="ja">${jp(it.choices[j])}</button>`).join('')}</div>`;}
 else if(it.format==='star')body=`${it.en?`<p class="drill-prompt">${jp(it.en)}</p>`:''}<p class="jp star-line" lang="ja" id="${q}">${jp(it.before||'')}${[0,1,2,3].map(k=>`<span class="star-slot${k===it.star?' is-star':''}">${k===it.star?'★':''}</span>`).join('')}${jp(it.after||'')}<span class="sr-only" lang="en"> The star is slot ${it.star+1} of 4.</span></p><div class="choices star-choices" role="group" aria-labelledby="${q}">${starOrder(it,seed).map((j,k)=>`<button type="button" class="choice" data-pick="${j}" aria-pressed="false"><span class="choice-letter" aria-hidden="true">${k+1}</span><span lang="ja">${jp(it.tiles[j])}</span></button>`).join('')}</div><p class="jp star-full" lang="ja" data-full hidden></p>`;
 else if(it.format==='truefalse')body=`<p class="drill-statement" id="${q}"${langAttr(it.statement)}>${jp(it.statement)}</p><div class="tf-row" role="group" aria-labelledby="${q}"><button type="button" class="choice tf-choice" data-tf="true" aria-pressed="false"><span class="tf-mark" aria-hidden="true">○</span><span>True</span></button><button type="button" class="choice tf-choice" data-tf="false" aria-pressed="false"><span class="tf-mark" aria-hidden="true">×</span><span>False</span></button></div>`;
 else if(it.format==='order')body=`<p class="drill-prompt" id="${q}">${jp(it.en)}</p><div class="order-line" data-line role="group" aria-label="Your sentence"></div><div class="tile-bank" data-bank role="group" aria-label="Tiles"></div><div class="drill-actions"><button type="button" class="button small" data-check disabled>Check</button><button type="button" class="text-button" data-clear>Clear</button></div>`;
 else if(it.format==='match')body=`<div class="match-grid" role="group" aria-label="Match the pairs"><div class="match-col">${it.pairs.map((p,k)=>`<button type="button" class="match-tile" data-side="l" data-pair="${k}" aria-pressed="false"${langAttr(p[0])}>${jp(p[0])}</button>`).join('')}</div><div class="match-col">${pairOrder(it,seed).map(k=>`<button type="button" class="match-tile" data-side="r" data-pair="${k}" aria-pressed="false"${langAttr(it.pairs[k][1])}>${jp(it.pairs[k][1])}</button>`).join('')}</div></div>`;
 else if(it.format==='sort')body=`<div class="sort-cards" role="group" aria-label="Cards">${cardOrder(it,seed).map(k=>`<button type="button" class="sort-card" data-card="${k}" aria-pressed="false"${langAttr(it.cards[k][0])}>${jp(it.cards[k][0])}</button>`).join('')}</div><div class="sort-groups">${it.groups.map((g,j)=>`<div class="sort-group"><button type="button" class="sort-target" data-group="${j}"><span class="sr-only">Put in: </span>${jp(g)}</button><ul class="sort-placed" data-placed="${j}"></ul></div>`).join('')}</div>`;
 else if(it.format==='cloze')body=`<div class="dialogue cloze-lines">${it.lines.map((l,li)=>`<div class="line"><span class="speaker">${jp(l.speaker||'')}</span><p class="jp" lang="ja">${clozeParts(it,li).map(p=>p.text!==undefined?jp(p.text):`<button type="button" class="cloze-gap" data-slot="${p.gap}" aria-label="Gap ${p.n}"><span class="gap-fill">（${p.n}）</span></button>`).join('')}</p></div>`).join('')}</div>${it.en?`<details class="reveal"><summary>Meaning</summary><p>${jp(it.en)}</p></details>`:''}<div class="chip-row cloze-bank" role="group" aria-label="Word box">${bankOrder(it,seed).map(j=>`<button type="button" class="chip" data-bank="${j}" lang="ja">${jp(it.bank[j])}</button>`).join('')}</div>`;
 const head=`${it.returned?`<p class="eyebrow return-cue">BACK FROM PRACTICE ${esc(it.from||'')}</p>`:''}${instruction&&it.instruction?`<p class="small drill-instruction">${jp(it.instruction)}</p>`:''}${stem?`<p class="jp drill-stem" lang="ja">${jp(stemFor(it))}</p>`:''}`;
 return `<li class="drill" id="${id}" data-drill="${esc(it.id)}" data-page-item="${esc(it.id)}" data-format="${it.format}"><span class="drill-num" aria-hidden="true">${n}</span><div class="drill-body">${head}${body}<p class="small drill-note" data-note></p><div class="answer-feedback" data-feedback role="status" aria-live="polite"></div></div></li>`;
}
const bindDrill=(li,it,ctx)=>({choice:bindPick,blank:bindPick,star:bindPick,truefalse:bindPick,order:bindOrder,match:bindMatch,sort:bindSort,cloze:bindCloze})[it.format]?.(li,it,ctx);
function bindDrills(root,items,ctx){const by=new Map(items.map(it=>[it.id,it]));root.querySelectorAll('[data-drill]').forEach(li=>{const it=by.get(li.dataset.drill);if(it)bindDrill(li,it,ctx);});}
// choice, blank, star and true/false: one tap answers.
function bindPick(li,it,ctx){
 const learn=ctx.mode!=='review',fb=li.querySelector('[data-feedback]'),note=li.querySelector('[data-note]'),tf=it.format==='truefalse',star=it.format==='star';
 const buttons=[...li.querySelectorAll(tf?'[data-tf]':'[data-pick]')],value=b=>tf?b.dataset.tf==='true':Number(b.dataset.pick),key=tf?it.answer:star?it.star:it.correct;
 const grade=v=>tf?gradeTrueFalse(it,v):star?gradeStar(it,v):gradeChoice(it,v);
 const why=v=>tf||star?it.explain:it.feedback[v],gap=li.querySelector('[data-gap]'),full=li.querySelector('[data-full]');
 // Closed (a checkpoint): one tap is the answer, saved without any sign of right or wrong until the run ends.
 if(ctx.closed){
  const saved=v=>{for(const x of buttons){lockButton(x);x.setAttribute('aria-pressed',String(value(x)===v));x.classList.toggle('is-picked',value(x)===v);}if(gap){gap.innerHTML=jp(it.choices[v]);gap.className='drill-gap is-filled is-picked';}fb.className='answer-feedback is-saved';fb.innerHTML='<p>Answer saved.</p>';};
  buttons.forEach(b=>b.onclick=()=>{if(off(b))return;saved(ctx.save(it,it.id,value(b)));revealFeedback(fb);});
  const prev=ctx.value(it.id);if(prev!==undefined)saved(prev);
  return;
 }
 const fill=(v,ok)=>{if(gap){gap.innerHTML=jp(it.choices[v]);gap.className=`drill-gap is-filled ${ok?'is-right':'is-wrong'}`;}};
 function solve(picked){
  for(const b of buttons){lockButton(b);if(value(b)===key)b.classList.add('is-right');if(picked!==undefined&&value(b)===picked&&picked!==key)b.classList.add('is-wrong');}
  fill(key,true);if(full){full.innerHTML=starFull(it);full.hidden=false;}note.textContent='';revealTargets(li,it);
 }
 const fx=feedbackOpts(it),answerLine=()=>tf?'':`<p class="small">Answer: <span lang="ja">${jp(star?it.tiles[key]:it.choices[key],fx)}</span>${star?'':` · ${jp(it.feedback[key].replace(/^Correct[.!]\s*/,''),fx)}`}</p>`;
 // A reason check (exercises.mjs) after a right first answer: the answer locks and the feedback area asks why, with
 // three lines to tap, before the usual feedback (which would give the reason away). A wrong pick shows the right line.
 const rc=ctx.reason?.(it)||null,line=s=>jp(String(s).replace(/^Correct[.!]\s*/,''),fx);
 function showReason(s){
  if(s==='right'){fb.className='answer-feedback correct';fb.innerHTML=verdict(true,rc.options[rc.answer],'',fx);return;}
  const extra=ctx.whyNote?.(it)||'';
  fb.className='answer-feedback reason-miss';fb.innerHTML=`<p><strong>Right answer, other reason.</strong> ${line(rc.options[rc.answer])}${extra?` <span class="small">${esc(extra)}</span>`:''}</p>`;
 }
 function askReason(focus){
  const q=`${domId(it.id)}-why`;
  fb.className='answer-feedback reason-check';
  fb.innerHTML=`<p class="reason-q" id="${q}"><strong>Why is that right?</strong></p><div class="reason-options" role="group" aria-labelledby="${q}">${rc.options.map((o,k)=>`<button type="button" class="reason-option" data-reason="${k}">${line(o)}</button>`).join('')}</div>`;
  const opts=[...fb.querySelectorAll('[data-reason]')];
  opts.forEach(b=>b.onclick=()=>{
   if(off(b))return;opts.forEach(lockButton);
   const right=Number(b.dataset.reason)===rc.answer;showReason(right?'right':'wrong');revealFeedback(fb);
   buttons.find(x=>value(x)===key)?.focus({preventScroll:true});
   ctx.resolve(it,right);
  });
  if(focus)opts[0].focus({preventScroll:true});
 }
 buttons.forEach(b=>b.onclick=()=>{
  if(off(b))return;
  const v=value(b),r=grade(v);
  buttons.forEach(x=>x.setAttribute('aria-pressed',String(x===b)));
  if(learn&&!r.correct){b.classList.add('is-wrong');lockButton(b);fill(v,false);fb.className='answer-feedback incorrect';fb.innerHTML=verdict(false,star?'':why(v),`<p class="small">${tf?'Look again at the statement.':'Try another answer.'}</p>`,fx);revealFeedback(fb);ctx.unit(it,it.id,false);return;}
  // Asked only at the first try, so never after a corrected miss.
  const first=learn?ctx.status(it.id,it)===null:true;
  solve(v);
  if(r.correct&&first&&rc&&ctx.pend(it,v)){askReason(true);revealFeedback(fb);return;}
  fb.className=`answer-feedback ${r.correct?'correct':'incorrect'}`;fb.innerHTML=verdict(r.correct,why(v),r.correct?'':answerLine(),fx);revealFeedback(fb);
  if(learn)ctx.unit(it,it.id,true);else ctx.item(it,r.correct,v);
 });
 // Reopened: a solved item shows its answer (and its reason check); one missed at the first try waits for another try.
 const status=learn?ctx.status(it.id,it):null,answered=learn?null:ctx.answer(it);
 if(rc?.state==='pending'){solve();askReason(false);}
 else if(learn?isSolved(status):answered!==null){solve();if(rc?.state)showReason(rc.state);else{const ok=learn||answered;fb.className=`answer-feedback ${ok?'correct':'incorrect'}`;fb.innerHTML=verdict(ok?true:null,why(key),ok?'':answerLine(),fx);}}
 else if(status==='wrong')note.textContent='Missed at the first try. Try again.';
}
// order: tap tiles into the line (tap again to send one back, or drag it along the line), then Check.
function bindOrder(li,it,ctx){
 const learn=ctx.mode!=='review',all=orderTiles(it),n=it.tiles.length,g=givenCount(it),bankIds=tileBank(it,ctx.seed);
 const line=li.querySelector('[data-line]'),bank=li.querySelector('[data-bank]'),check=li.querySelector('[data-check]'),clear=li.querySelector('[data-clear]'),fb=li.querySelector('[data-feedback]'),note=li.querySelector('[data-note]');
 let placed=[],locked=false,state_='open',dragged=false;
 const tile=(i,where)=>`<button type="button" class="tile" data-tile="${i}" data-where="${where}" lang="ja"${locked?' aria-disabled="true"':''}>${jp(all[i])}</button>`;
 function render(){
  line.innerHTML=it.tiles.slice(0,g).map(t=>`<span class="tile is-given" lang="ja">${jp(t)}</span>`).join('')+placed.map(i=>tile(i,'line')).join('')+(placed.length||g?'':'<span class="order-hint">Tap the tiles in order.</span>');
  line.className=`order-line${state_==='right'?' is-right':state_==='wrong'?' is-wrong':''}`;
  bank.innerHTML=bankIds.map(i=>placed.includes(i)?`<span class="tile is-used" aria-hidden="true">${jp(all[i])}</span>`:tile(i,'bank')).join('');
  bank.hidden=locked;check.disabled=locked||state_==='wrong'||placed.length<n-g;check.hidden=locked;clear.hidden=locked;clear.textContent=state_==='wrong'?'Try again':'Clear';
 }
 const say=()=>announce(`${placed.length+g} of ${n} tiles in the sentence: ${placed.map(i=>plainWritten(all[i])).join(' ')}`);
 function settle(ok){locked=true;placed=[...Array(n).keys()].slice(g);state_='right';render();if(!ok)line.classList.add('was-wrong');}
 bank.onclick=e=>{const b=e.target.closest('[data-tile]');if(!b||locked||state_==='wrong')return;const at=[...bank.children].indexOf(b);placed.push(Number(b.dataset.tile));render();say();const next=[...bank.querySelectorAll('[data-tile]')];(next.find(x=>[...bank.children].indexOf(x)>=at)||next[0]||check).focus();};
 line.onclick=e=>{if(dragged){dragged=false;return;}const b=e.target.closest('[data-tile]');if(!b||locked||state_==='wrong')return;const i=Number(b.dataset.tile),at=placed.indexOf(i);placed=placed.filter(x=>x!==i);render();say();const rest=[...line.querySelectorAll('[data-tile]')];(rest[Math.min(at,rest.length-1)]||bank.querySelector('[data-tile]'))?.focus();};
 check.onclick=()=>{
  if(locked)return;
  if(ctx.closed){const v=ctx.save(it,it.id,[...Array(g).keys(),...placed]);placed=v.slice(g);locked=true;render();fb.className='answer-feedback is-saved';fb.innerHTML='<p>Answer saved.</p>';revealFeedback(fb);return;}
  const r=gradeOrder(it,[...Array(g).keys(),...placed]);
  if(r.correct||!learn){settle(r.correct);fb.className=`answer-feedback ${r.correct?'correct':'incorrect'}`;fb.innerHTML=verdict(r.correct,it.explain,r.correct?'':`<p class="small">Answer: <span class="jp" lang="ja">${jp(r.answer)}</span></p>`);revealFeedback(fb);if(learn)ctx.unit(it,it.id,true);else ctx.item(it,r.correct);return;}
  state_='wrong';render();fb.className='answer-feedback incorrect';fb.innerHTML=verdict(false,it.explain,`<p class="small">${r.extra?'One tile does not belong in this sentence. ':''}Answer: <span class="jp" lang="ja">${jp(r.answer)}</span></p>`);revealFeedback(fb);ctx.unit(it,it.id,false);clear.focus();
 };
 clear.onclick=()=>{if(locked)return;placed=[];state_='open';render();fb.className='answer-feedback';fb.innerHTML='';bank.querySelector('[data-tile]')?.focus();};
 // Drag a placed tile along the line to reorder it.
 line.onpointerdown=e=>{
  const b=e.target.closest('[data-where="line"]');if(!b||locked||state_==='wrong'||e.button>0)return;
  const start={x:e.clientX,y:e.clientY,i:Number(b.dataset.tile),id:e.pointerId,moving:false};
  const move=ev=>{if(ev.pointerId!==start.id)return;if(!start.moving&&Math.hypot(ev.clientX-start.x,ev.clientY-start.y)<8)return;start.moving=true;ev.preventDefault();const over=document.elementFromPoint(ev.clientX,ev.clientY)?.closest?.('[data-where="line"]');if(over&&line.contains(over)&&Number(over.dataset.tile)!==start.i){const to=placed.indexOf(Number(over.dataset.tile));placed=placed.filter(x=>x!==start.i);placed.splice(to,0,start.i);render();}line.querySelector(`[data-tile="${start.i}"]`)?.classList.add('is-dragging');};
  const up=ev=>{if(ev.pointerId!==start.id)return;document.removeEventListener('pointermove',move);document.removeEventListener('pointerup',up);document.removeEventListener('pointercancel',up);if(start.moving){dragged=true;render();say();setTimeout(()=>{dragged=false;},0);}};
  document.addEventListener('pointermove',move,{passive:false});document.addEventListener('pointerup',up);document.addEventListener('pointercancel',up);
 };
 if(ctx.closed){const prev=ctx.value(it.id);if(prev!==undefined){placed=prev.slice(g);locked=true;}render();if(locked){fb.className='answer-feedback is-saved';fb.innerHTML='<p>Answer saved.</p>';}return;}
 const status=learn?ctx.status(it.id,it):null,answered=learn?null:ctx.answer(it);
 if(learn?isSolved(status):answered!==null){const ok=learn||answered;settle(ok);fb.className=`answer-feedback ${ok?'correct':'incorrect'}`;fb.innerHTML=verdict(ok?true:null,it.explain);}
 else{render();if(status==='wrong')note.textContent='Missed at the first try. Try again.';}
}
// match: tap one side, then the other. Wrong pairs flash and reset; matched pairs lock with a shared number.
function bindMatch(li,it,ctx){
 const learn=ctx.mode!=='review',keys=unitKeys(it),tiles=[...li.querySelectorAll('.match-tile')],fb=li.querySelector('[data-feedback]'),note=li.querySelector('[data-note]');
 let sel=null,mistakes=0,count=0;
 const pair=k=>tiles.filter(t=>Number(t.dataset.pair)===k);
 // Closed: each left tile pairs with the right tile chosen, right or wrong, and both lock with a shared number.
 if(ctx.closed){
  let n=0;const side=(sd,k)=>tiles.find(t=>t.dataset.side===sd&&Number(t.dataset.pair)===k);
  const pairUp=(l,r)=>{n++;for(const t of [side('l',l),side('r',r)]){if(!t)continue;t.classList.add('is-paired');t.classList.remove('is-selected');lockButton(t);t.setAttribute('aria-pressed','false');t.insertAdjacentHTML('afterbegin',`<span class="pair-n" aria-hidden="true">${n}</span>`);}};
  const saved=()=>{if(n===it.pairs.length){fb.className='answer-feedback is-saved';fb.innerHTML='<p>Answers saved.</p>';}};
  keys.forEach((key,l)=>{const v=ctx.value(key);if(v!==undefined)pairUp(l,v);});saved();
  tiles.forEach(t=>t.onclick=()=>{
   if(off(t))return;
   if(!sel||sel.dataset.side===t.dataset.side){if(sel){sel.setAttribute('aria-pressed','false');sel.classList.remove('is-selected');}if(sel===t){sel=null;return;}sel=t;t.setAttribute('aria-pressed','true');t.classList.add('is-selected');return;}
   const l=Number((sel.dataset.side==='l'?sel:t).dataset.pair),r=Number((sel.dataset.side==='l'?t:sel).dataset.pair);sel=null;
   const v=ctx.save(it,keys[l],r);pairUp(l,v);announce(`Paired: ${plainWritten(it.pairs[l][0])}, ${plainWritten(it.pairs[v][1])}.`);saved();revealFeedback(fb);
  });
  return;
 }
 function match(k){count++;for(const t of pair(k)){t.classList.add('is-matched');t.classList.remove('is-selected');lockButton(t);t.setAttribute('aria-pressed','false');t.insertAdjacentHTML('afterbegin',`<span class="pair-n" aria-hidden="true">${count}</span>`);}}
 function complete(ok){for(const t of tiles)lockButton(t);fb.className=`answer-feedback ${ok?'correct':'incorrect'}`;fb.innerHTML=verdict(ok?true:learn?true:null,it.explain||'',ok||learn?'':'<p class="small">Every pair is shown matched above.</p>');note.textContent='';}
 tiles.forEach(t=>t.onclick=()=>{
  if(off(t))return;
  if(!sel||sel.dataset.side===t.dataset.side){if(sel){sel.setAttribute('aria-pressed','false');sel.classList.remove('is-selected');}if(sel===t){sel=null;return;}sel=t;t.setAttribute('aria-pressed','true');t.classList.add('is-selected');return;}
  const a=sel,l=a.dataset.side==='l'?a:t,r=a.dataset.side==='l'?t:a,anchor=Number(a.dataset.pair);sel=null;a.setAttribute('aria-pressed','false');a.classList.remove('is-selected');
  if(gradeMatch(it,Number(l.dataset.pair),Number(r.dataset.pair))){const k=Number(l.dataset.pair);match(k);announce(`Matched: ${plainWritten(it.pairs[k][0])}, ${plainWritten(it.pairs[k][1])}.`);if(learn)ctx.unit(it,keys[k],true);if(count<it.pairs.length){fb.className='answer-feedback';fb.innerHTML='';}}
  else{mistakes++;flashWrong(a,t);fb.className='answer-feedback incorrect';fb.innerHTML='<strong>Not a pair</strong><p>Try again.</p>';if(learn)ctx.unit(it,keys[anchor],false);}
  if(count===it.pairs.length){complete(learn||!mistakes);revealFeedback(fb);if(!learn)ctx.item(it,mistakes===0);}
 });
 if(learn){keys.forEach((key,k)=>{if(isSolved(ctx.status(key,it)))match(k);});if(count===it.pairs.length)complete(true);else if(keys.some(key=>ctx.status(key,it)==='wrong'))note.textContent='Some pairs were missed at the first try. Match them again.';}
 else if(ctx.answer(it)!==null){it.pairs.forEach((_,k)=>match(k));complete(ctx.answer(it));}
}
// sort: tap a card, then the group it belongs to.
function bindSort(li,it,ctx){
 const learn=ctx.mode!=='review',keys=unitKeys(it),cards=[...li.querySelectorAll('[data-card]')],groups=[...li.querySelectorAll('[data-group]')],fb=li.querySelector('[data-feedback]'),note=li.querySelector('[data-note]');
 let sel=null,mistakes=0,placed=0;
 function place(k){const c=cards.find(x=>Number(x.dataset.card)===k);c.hidden=true;lockButton(c);li.querySelector(`[data-placed="${it.cards[k][1]}"]`).insertAdjacentHTML('beforeend',`<li${langAttr(it.cards[k][0])}>${jp(it.cards[k][0])}</li>`);placed++;}
 function complete(ok){groups.forEach(lockButton);fb.className=`answer-feedback ${ok?'correct':'incorrect'}`;fb.innerHTML=verdict(ok||learn?true:null,it.explain||'');note.textContent='';}
 cards.forEach(c=>c.onclick=()=>{if(off(c))return;if(sel){sel.setAttribute('aria-pressed','false');sel.classList.remove('is-selected');}if(sel===c){sel=null;return;}sel=c;c.setAttribute('aria-pressed','true');c.classList.add('is-selected');});
 groups.forEach(gb=>gb.onclick=()=>{
  if(off(gb))return;
  if(!sel){fb.className='answer-feedback';fb.innerHTML='<p>Choose a card first, then its group.</p>';return;}
  const c=sel,k=Number(c.dataset.card),j=Number(gb.dataset.group);sel=null;c.classList.remove('is-selected');c.setAttribute('aria-pressed','false');
  if(gradeSort(it,k,j)){place(k);announce(`${plainWritten(it.cards[k][0])}: ${plainWritten(it.groups[j])}.`);if(learn)ctx.unit(it,keys[k],true);fb.className='answer-feedback';fb.innerHTML='';cards.find(x=>!x.hidden)?.focus();}
  else{mistakes++;flashWrong(c,gb);fb.className='answer-feedback incorrect';fb.innerHTML='<strong>Not that group</strong><p>Try again.</p>';if(learn)ctx.unit(it,keys[k],false);c.focus();}
  if(placed===it.cards.length){complete(learn||!mistakes);revealFeedback(fb);if(!learn)ctx.item(it,mistakes===0);}
 });
 if(learn){keys.forEach((key,k)=>{if(isSolved(ctx.status(key,it)))place(k);});if(placed===it.cards.length)complete(true);else if(keys.some(key=>ctx.status(key,it)==='wrong'))note.textContent='Some cards were missed at the first try. Sort them again.';}
 else if(ctx.answer(it)!==null){it.cards.forEach((_,k)=>place(k));complete(ctx.answer(it));}
}
// cloze: the next empty gap is active (tap another gap to choose it), then tap a word from the box.
function bindCloze(li,it,ctx){
 const learn=ctx.mode!=='review',keys=unitKeys(it),gaps=[...li.querySelectorAll('[data-slot]')],chips=[...li.querySelectorAll('[data-bank]')],fb=li.querySelector('[data-feedback]'),note=li.querySelector('[data-note]');
 let active=null,mistakes=0,filled=0;
 const open=()=>gaps.find(x=>!x.classList.contains('is-filled'));
 const activate=g=>{active=g||null;gaps.forEach(x=>{x.classList.toggle('is-active',x===active);x.setAttribute('aria-pressed',String(x===active));});};
 // Closed: a word put in a gap is that gap's answer, saved without any sign of right or wrong.
 if(ctx.closed){
  const put=(g,j)=>{const k=Number(g.dataset.slot);g.querySelector('.gap-fill').innerHTML=jp(it.bank[j]);g.classList.add('is-filled','is-picked');g.classList.remove('is-active');lockButton(g);g.setAttribute('aria-label',`Gap ${k+1}: ${plainWritten(it.bank[j])}`);};
  const saved=()=>{if(!open()){chips.forEach(lockButton);activate(null);fb.className='answer-feedback is-saved';fb.innerHTML='<p>Answers saved.</p>';}};
  gaps.forEach((g,k)=>{const v=ctx.value(keys[k]);if(v!==undefined)put(g,v);});
  gaps.forEach(g=>g.onclick=()=>{if(!off(g))activate(g);});
  chips.forEach(c=>c.onclick=()=>{if(off(c))return;const g=active||open();if(!g)return;put(g,ctx.save(it,keys[Number(g.dataset.slot)],Number(c.dataset.bank)));activate(open());saved();revealFeedback(fb);});
  activate(open());saved();
  return;
 }
 function fill(g){const k=Number(g.dataset.slot);g.querySelector('.gap-fill').innerHTML=jp(it.bank[it.answers[k]]);g.classList.add('is-filled');g.classList.remove('is-active');lockButton(g);g.setAttribute('aria-label',`Gap ${k+1}: ${plainWritten(it.bank[it.answers[k]])}`);filled++;}
 function complete(ok){chips.forEach(lockButton);activate(null);fb.className=`answer-feedback ${ok?'correct':'incorrect'}`;fb.innerHTML=verdict(ok||learn?true:null,it.explain||'');note.textContent='';}
 gaps.forEach(g=>g.onclick=()=>{if(!off(g))activate(g);});
 chips.forEach(c=>c.onclick=()=>{
  if(off(c))return;const g=active||open();if(!g)return;const k=Number(g.dataset.slot);
  if(gradeGap(it,k,Number(c.dataset.bank))){fill(g);if(learn)ctx.unit(it,keys[k],true);fb.className='answer-feedback';fb.innerHTML='';activate(open());}
  else{mistakes++;flashWrong(c,g);fb.className='answer-feedback incorrect';fb.innerHTML=`<strong>Not that word in gap ${k+1}</strong><p>Try again.</p>`;if(learn)ctx.unit(it,keys[k],false);}
  if(filled===gaps.length){complete(learn||!mistakes);revealFeedback(fb);if(!learn)ctx.item(it,mistakes===0);}
 });
 if(learn){keys.forEach((key,k)=>{if(isSolved(ctx.status(key,it)))fill(gaps[k]);});if(filled===gaps.length)complete(true);else{activate(open());if(keys.some(key=>ctx.status(key,it)==='wrong'))note.textContent='Some gaps were missed at the first try. Fill them again.';}}
 else if(ctx.answer(it)!==null){gaps.forEach(fill);complete(ctx.answer(it));}
 else activate(open());
}
// Drill contexts: a lesson's or practice's own progress, or a closed-book checkpoint and its answers shown read-only.
// Reason checks (exercises.mjs): the check an occurrence asks, with its saved state, or null. Only unit choice and blank
// items take part; checkpoints never ask.
function reasonFor(lessonId,it,key,mode,round){
 const l=lessons.lessons.find(x=>x.id===lessonId);if(!hasUnit(l)||!REASON_FORMATS.includes(it.format))return null;
 const plan=reasonCheck(l,it,reasonSeed(lessonId,mode,round,it.id));return plan&&{...plan,state:reasonState(state.answers[lessonId],key)};
}
// Saved reason checks that no longer fit their unit are dropped on load; a backup holding one is refused. Keys of the
// retired pretest go in both cases (exercises.mjs).
function cleanReasons(answers,strict=false){let out=answers;for(const l of lessons.lessons){const a=answers?.[l.id];if(!hasUnit(l)||!a||typeof a!=='object'||Array.isArray(a))continue;const r=readReasons(a,l,{strict});if(r.changed)out={...out,[l.id]:r.record};}return out;}
const putAnswers=(lessonId,record,extra={})=>commit({...state,answers:{...state.answers,[lessonId]:record},...extra});
// Drills: a sampled right first answer saves the result and the waiting check together, and the unit cannot finish
// until it is answered. A wrong reason keeps the result, counts as a drill miss for the item's pattern and brings a
// drill item back at the end of the まとめ (onReturn). Every answer also records kanji words (kanjiWordsAnswer), saved with
// the result, or on its own when the result stays as it was (a second miss).
const learnCtx=(lessonId,onChange,onReturn=()=>{})=>({mode:'learn',seed:lessonId,status:(key,it)=>statusOf(state.answers[lessonId],key,it),unit(it,key,ok){const r=recordStatus(state.answers[lessonId],key,it,ok),kw=kanjiWordsAnswer(lessonOf(lessonId),it,ok),moved=kw!==state.kanjiWords;if(moved)announceMet(kw);if(r.changed||moved){const miss=r.changed&&r.status==='wrong'?patternMiss(it,lessonId,'drill'):null;commit({...state,...(r.changed?{answers:{...state.answers,[lessonId]:r.record}}:{}),...(miss?{patterns:miss}:{}),...(moved?{kanjiWords:kw}:{})});}if(moved)refreshKanji();onChange();if(!ok)offerPatternNote(it);},
 reason:it=>reasonFor(lessonId,it,it.id,'learn',reasonAttempt(state.answers[lessonId])),
 pend(it){const r=recordStatus(state.answers[lessonId],it.id,it,true);if(r.status!=='right')return false;const p=pendReason(r.record,it.id),kw=kanjiWordsAnswer(lessonOf(lessonId),it,true),moved=kw!==state.kanjiWords;if(moved)announceMet(kw);if(r.changed||p.changed||moved)putAnswers(lessonId,p.record,moved?{kanjiWords:kw}:{});if(moved)refreshKanji();onChange();return reasonState(p.record,it.id)==='pending';},
 resolve(it,right){const r=resolveReason(state.answers[lessonId],it.id,right);if(!r.changed)return;const miss=right?null:patternMiss(it,lessonId,'drill',true);putAnswers(lessonId,r.record,miss?{patterns:miss}:{});onChange();if(!right)onReturn();},
 whyNote:it=>it.source||it.set===finalSetOf(lessonId)?'':'It comes back at the end of the まとめ.'});
const finalSetOf=lessonId=>lessons.lessons.find(x=>x.id===lessonId)?.sections?.find(isFinal)?.id||null;
// ── Grammar patterns (patterns.mjs) ──────────────────────────────────────────────────────────────────────
// A first-try miss on a tagged drill counts towards its pattern; the note is offered from that drill's feedback and
// nowhere else. Opening it is Seen evidence and is never scored.
// reason: a right answer with a wrong reason (a soft miss), which also adds to the pattern's wrong-reason tally.
function patternMiss(it,lessonId,source,reason=false){if(!it.patternId)return null;const r=recordMiss(state.patterns,it.patternId,{lesson:lessonId,item:it.source||it.id,source,reason},Date.now());return r.changed?r.store:null;}
let patternReturn=null;
function offerPatternNote(it){
 const p=it?.patternId&&patternIndex(lessons).get(it.patternId);if(!p)return;
 main.querySelectorAll(`[data-drill="${esc(it.id)}"] [data-feedback].incorrect`).forEach(fb=>{
  if(fb.querySelector('[data-pattern-note]'))return;
  fb.insertAdjacentHTML('beforeend',`<p class="pattern-link"><button type="button" class="text-button" data-pattern-note="${esc(p.id)}" aria-haspopup="dialog">Pattern note: ${jp(p.title)}</button></p>`);
  fb.querySelector('[data-pattern-note]').onclick=e=>openPatternNote(p.id,e.currentTarget);
 });
}
function patternDialog(){
 let d=document.getElementById('pattern-dialog');if(d)return d;
 d=document.createElement('dialog');d.id='pattern-dialog';d.className='word-dialog pattern-dialog';d.setAttribute('aria-labelledby','pattern-dialog-title');document.body.append(d);
 d.addEventListener('click',e=>{if(e.target===d||e.target.closest('[data-close-pattern]'))d.close();});
 // Focus goes back to the button that opened the note.
 d.addEventListener('close',()=>{const r=patternReturn;patternReturn=null;if(r?.isConnected&&main.contains(r))r.focus({preventScroll:true});});
 return d;
}
// One screen: the frame and explanation from the point that first teaches it, one contrast, and every lesson that teaches
// it with its topic, named in place (not links).
function openPatternNote(id,trigger=null){
 const p=patternIndex(lessons).get(id);if(!p)return;
 const first=p.teaching[0]?.point,taught=[...new Set(p.teaching.map(t=>t.lesson))].map(x=>lessons.lessons.find(l=>l.id===x)).filter(Boolean);
 commit({...state,patterns:markSeen(state.patterns,id,Date.now())});
 const d=patternDialog();
 d.innerHTML=`<div class="word-dialog-inner pattern-note"><div class="word-dialog-head"><span class="eyebrow">PATTERN NOTE</span><button type="button" class="icon-button" data-close-pattern aria-label="Close the pattern note">✕</button></div><h2 id="pattern-dialog-title">${jp(p.title)}</h2>${first?`<p class="pattern-box jp" lang="ja">${patternHTML(first.pattern)}</p><p class="point-explain">${jp(first.explain)}</p>`:''}<div class="pattern-contrast"><p class="eyebrow">COMPARE</p><p class="jp" lang="ja">${jp(p.contrast.ja)}</p><p class="small">${jp(p.contrast.en)}</p><p>${jp(p.contrast.why)}</p></div><p class="eyebrow pattern-taught">TAUGHT IN</p><ul class="pattern-lessons">${taught.map(l=>`<li><span class="pattern-lesson">“${esc(l.title)}”</span><span class="small">${esc(data.nodes.find(n=>n.id===l.node)?.title||l.track)}</span></li>`).join('')}</ul><p class="small">This note is not scored.</p></div>`;
 patternReturn=trigger;
 if(!d.open)d.showModal();
}
// Where a learn-mode item stands for the pager: solved once every counted unit is right or fixed and no reason check
// waits, answered after any response, else null.
function itemStanding(rec,it){
 if(!it)return null;const st=unitKeys(it).map(k=>statusOf(rec,k,it)),why=reasonState(rec,it.id);
 return st.every(isSolved)&&why!=='pending'?'solved':st.some(Boolean)||why?'answered':null;
}

// ── Unit pager ───────────────────────────────────────────────────────────────────────────────────────────
// Lessons and runs show one page at a time (pages.mjs builds the list; the Practice and Progress lists page their rows
// with pagedRows instead). Everything stays rendered: [data-page-block] marks each section, [data-page-item] one item
// in a set and [data-page-rows] a table paged by rows, and whatever is off the page carries .off-page, so drill
// bindings, update(), returned items and word refs work as before. The pager fills its slots: the track
// ([data-pager-progress]), the contents opened from the position ("15 / 47", [data-pager-contents]), a page's counter
// ([data-page-count]), what shows on a section's first page only ([data-page-first]), the finish page's sets with items
// left ([data-page-remaining]) and the dock's Back/Next row ([data-pager-dock]); Next waits on an item until it is solved. A page change scrolls
// to the top, focuses the page's heading and slides in from its side; a horizontal swipe on touch pages too, never from
// a control or a drill's drag area. Lesson/practice pages are saved beside their answers, including in backups;
// other routes keep a session position. Missing or retired page keys fall back to resumePage(). state(id): an item's
// 'solved', 'answered' or null. hold(): the dock and contents
// wait (a reading check still open); release() then opens the page the learner would resume on, else the one after the
// opening.
// Any unit-shaped set can use it: render its blocks, then unitPager(root,{model:unitPages(unit,opts),state}).
const unitPlaces=new Map();
const NO_SWIPE='a,button,input,textarea,select,summary,label,[data-drag-word],.order-line,.tile-bank,.match-grid,.sort-cards,.sort-groups,.cloze-lines,.cloze-bank,.page-dock';
const jaLabel=s=>esc(s).replace('まとめ','<span lang="ja">まとめ</span>');
// wordsSeen(wordId): whether the learner has tapped that word in this unit (a lesson's or practice's seen:<id> keys);
// with it, Next also waits on a Words page until every word on the page is tapped.
function unitPager(root,{model,state:itemState,place=activeRoute,hold=()=>false,wordsSeen=null}){
 const panel=main,stage=root.querySelector('.page-stage')||root,slot=s=>root.querySelector(`[data-pager-${s}]`),progress=slot('progress'),contents=slot('contents'),dock=slot('dock');
 const block=key=>[...root.querySelectorAll('[data-page-block]')].find(b=>b.dataset.pageBlock===key);
 if(progress)progress.innerHTML=`<div class="page-track" role="progressbar" aria-label="Progress" aria-valuemin="1"><span></span></div>`;
 if(contents)contents.innerHTML=`<summary><span class="page-pos"></span><span class="page-caret" aria-hidden="true"></span></summary><ol class="page-toc"></ol>`;
 if(dock)dock.insertAdjacentHTML('beforeend',`<div class="page-nav" role="group" aria-label="Pages"><button type="button" class="button secondary" data-page-step="-1"><span aria-hidden="true">← </span>Back</button><button type="button" class="button" data-page-step="1"></button></div>`);
 // The saved page is answers[<unit>]['unit-page'], or 'unit-page:<part>' for a part of a practice in parts (the place's third segment).
 const [placeKind,placeId,placePart]=place.split('/'),durable=['lesson','practice'].includes(placeKind)&&!!(lessonOf(placeId)||practiceOf(placeId)),field=placeKind==='practice'&&placePart?`unit-page:${placePart}`:'unit-page';
 const remember=()=>{const key=pageKey(model.pages[index]);unitPlaces.set(place,key);if(durable&&state.answers[placeId]?.[field]!==key)commit({...state,answers:{...state.answers,[placeId]:{...state.answers[placeId],[field]:key}}});};
 const remembered=()=>findPage(model,unitPlaces.get(place)||(durable?state.answers[placeId]?.[field]:null)),resume=()=>resumePage(model,itemState);
 let index=hold()?0:remembered()>=0?remembered():resume(),cache={};
 const once=(el,key,html)=>{if(el&&cache[key]!==html){cache[key]=html;el.innerHTML=html;}};
 // A Words page's word buttons (its rows from…to-1), and whether one is still to tap.
 const pageWords=p=>{const t=p?.kind==='words'?block(p.section)?.querySelector('[data-page-rows]'):null;return t?[...(t.rows||t.children)].slice(p.from,p.to).flatMap(r=>[...r.querySelectorAll('[data-unit-word]')]):[];};
 const untapped=p=>!!wordsSeen&&pageWords(p).some(b=>!wordsSeen(b.dataset.word));
 // The first Words page with a word still to tap: the contents cannot jump past it while the learner is on it or before.
 const gate=()=>{if(!wordsSeen)return -1;const g=model.pages.findIndex(p=>p.kind==='words'&&untapped(p));return g>=0&&index<=g?g:-1;};
 const waits=()=>{const p=model.pages[index];return p?.kind==='item'?itemState(p.item)!=='solved':p?.kind==='words'&&untapped(p);};
 function show(){
  const p=model.pages[index];if(!p)return;
  root.querySelectorAll('[data-page-block]').forEach(b=>b.classList.toggle('off-page',b.dataset.pageBlock!==p.section));
  const b=block(p.section);if(!b)return;
  b.querySelectorAll('[data-page-item]').forEach(el=>el.classList.toggle('off-page',p.kind!=='item'||el.dataset.pageItem!==p.item));
  b.querySelectorAll('[data-page-rows]').forEach(t=>[...(t.rows||t.children)].forEach((r,k)=>r.classList.toggle('off-page',p.kind==='words'&&(k<p.from||k>=p.to))));
  b.querySelectorAll('[data-page-count]').forEach(c=>c.textContent=p.kind==='item'&&p.of>1?`${p.k} of ${p.of}`:p.kind==='words'&&p.parts>1?`${p.part} of ${p.parts}`:'');
  // A run's intro shows on its first page only.
  const first=p.kind==='item'?p.k===1:p.kind==='words'?p.part===1:true;
  b.querySelectorAll('[data-page-first]').forEach(el=>el.classList.toggle('off-page',!first));
 }
 function paint(){
  const p=model.pages[index];if(!p)return;
  const n=model.pages.length,label=pageLabel(model,index),status=sectionStatus(model,itemState),held=hold(),track=progress?.querySelector('[role=progressbar]');
  if(track){track.setAttribute('aria-valuemax',n);track.setAttribute('aria-valuenow',index+1);track.setAttribute('aria-valuetext',`Page ${index+1} of ${n}: ${label}`);track.firstChild.style.width=`${n>1?Math.round(index/(n-1)*100):100}%`;}
  root.querySelectorAll('.page-pos').forEach(x=>x.textContent=`${index+1} / ${n}`);contents?.querySelector('summary').setAttribute('aria-label',`Contents, page ${index+1} of ${n}`);
  // Next waits, greyed out, on an item until it is solved (answered, in a checkpoint): the learner moves on only by
  // finishing it, and on a Words page until every word on it is tapped (wordsSeen). On reading pages it is always open.
  if(wordsSeen)root.querySelectorAll('[data-page-rows] [data-unit-word]').forEach(b=>b.classList.toggle('to-tap',!wordsSeen(b.dataset.word)));
  const g=gate();
  if(dock){const back=dock.querySelector('[data-page-step="-1"]'),next=dock.querySelector('[data-page-step="1"]');dock.classList.toggle('is-held',held);back.hidden=index===0;next.hidden=index>=n-1||p.kind==='finish';once(next,'next',`${p.kind==='opening'?'Start':'Next'}<span aria-hidden="true"> →</span>`);next.disabled=waits();root.style.setProperty('--dock-h',`${dock.offsetHeight}px`);}
  if(contents){contents.hidden=held;once(contents.querySelector('.page-toc'),'toc',status.map(s=>`<li><button type="button" class="page-toc-item" data-page-jump="${s.first}" data-page-section="${esc(s.key)}"${s.key===p.section?' aria-current="true"':''}${g>=0&&s.first>g?' disabled':''}><span>${jaLabel(s.label)}</span>${s.kind==='practice'?`<span class="page-toc-mark">${s.left?`${s.left} left`:'<span aria-hidden="true">✓</span><span class="sr-only">done</span>'}</span>`:''}</button></li>`).join(''));}
  const left=status.filter(s=>s.kind==='practice'&&s.left);
  once(root.querySelector('[data-page-remaining]'),'left',left.length?`<p class="eyebrow page-left-title">STILL TO DO</p><ul class="page-left">${left.map(s=>`<li><button type="button" class="button secondary small" data-page-jump="${s.next}">${jaLabel(s.label)} · ${s.left} left</button></li>`).join('')}</ul>`:'');
  // The deck tray shows only on pages with words to drag (the Words table, the conversation).
  const tray=root.querySelector('.deck-tray');if(tray)tray.classList.toggle('tray-away',![...stage.querySelectorAll('[data-drag-word]')].some(el=>!el.closest('.off-page,.hidden')));
 }
 const heading=()=>{const p=model.pages[index],b=p&&block(p.section);if(!b)return null;const it=p.kind==='item'?[...b.querySelectorAll('[data-page-item]')].find(el=>el.dataset.pageItem===p.item):null;return b.querySelector('[data-page-heading]')||it?.querySelector('h2,h3')||b.querySelector('h1,h2,h3');};
 function go(i,dir=Math.sign(i-index)||1,focus=true){
  if(!model.pages.length)return;i=Math.max(0,Math.min(model.pages.length-1,i));
  const moved=i!==index;index=i;cancelDrag('navigation');show();paint();remember();
  if(!focus)return;
  panel.scrollTop=0;
  const h=heading();if(h){if(!h.hasAttribute('tabindex'))h.tabIndex=-1;h.focus({preventScroll:true});}
  if(moved&&stage.animate&&!matchMedia('(prefers-reduced-motion: reduce)').matches)stage.animate([{opacity:0,transform:`translateX(${dir*24}px)`},{opacity:1,transform:'none'}],{duration:180,easing:'cubic-bezier(.2,.7,.2,1)'});
 }
 root.addEventListener('click',e=>{
  const j=e.target.closest('[data-page-jump]'),s=e.target.closest('[data-page-step]');
  if(j){if(j.disabled)return;const g=gate();if(g>=0&&Number(j.dataset.pageJump)>g)return;if(contents)contents.open=false;go(Number(j.dataset.pageJump));}
  else if(s)go(index+Number(s.dataset.pageStep),Number(s.dataset.pageStep));
 });
 // The contents opens on the section in view.
 contents?.addEventListener('toggle',()=>{if(contents.open)contents.querySelector('[aria-current]')?.scrollIntoView({block:'nearest'});});
 // A horizontal swipe on touch (the topic page's thresholds) is Back or Next, waiting with Next on an unsolved item; it
 // never starts on a control or a drag area.
 let gesture=null;
 stage.addEventListener('pointerdown',e=>{gesture=e.pointerType==='touch'&&e.isPrimary&&!hold()&&!e.target.closest(NO_SWIPE)?{x:e.clientX,y:e.clientY,id:e.pointerId}:null;});
 stage.addEventListener('pointercancel',()=>{gesture=null;});
 stage.addEventListener('pointerup',e=>{if(!gesture||gesture.id!==e.pointerId)return;const dx=e.clientX-gesture.x,dy=e.clientY-gesture.y,d=dx<0?1:-1;gesture=null;if(Math.abs(dx)<=85||Math.abs(dx)<=Math.abs(dy)*1.7)return;if(d>0&&(index>=model.pages.length-1||model.pages[index].kind==='finish'||waits()))return;if(d<0&&index===0)return;go(index+d,d);});
 if(model.pages.length){show();paint();if(!hold())remember();}
 return {go,refresh:paint,get model(){return model;},get index(){return index;},
  // Pages added (returned items): the page on screen stays.
  sync(next){const key=pageKey(model.pages[index]);model=next;const j=findPage(model,key);index=j>=0?j:Math.min(index,model.pages.length-1);show();paint();},
  release(){const r=remembered(),t=r>=0?r:resume();go(t>0?t:1);},
  // Opens the page holding an element (an arrival focused by route()), without moving focus.
  reveal(el){const b=el?.closest?.('[data-page-block]');if(!b||!root.contains(b))return;const it=el.closest('[data-page-item]'),row=el.closest('[data-page-rows]>*');let j=it?findPage(model,`item:${it.dataset.pageItem}`):-1;if(j<0&&row){const k=[...row.parentElement.children].indexOf(row);j=model.pages.findIndex(p=>p.section===b.dataset.pageBlock&&p.kind==='words'&&k>=p.from&&k<p.to);}if(j<0)j=model.pages.findIndex(p=>p.section===b.dataset.pageBlock);if(j>=0)go(j,1,false);}};
}

// ── The lesson page: a textbook unit ─────────────────────────────────────────────────────────────────────
// Title, goal and scene; the Words table; then the unit's sections in order: a point (pattern, short explanation,
// examples), its drills, the conversation, and the まとめ review. A lesson without a unit yet shows its words, its
// conversation and its two questions as one drill.
// The Words table's rows: the unit's words (or, without a unit, the words its texts reference) that are in the vocabulary.
const wordRows=l=>(hasUnit(l)?wordEntries(l.words):[...new Set((l.occurrences||[]).map(o=>o.word))].map(id=>({id}))).filter(e=>words.has(e.id));
// The Words table of a lesson, or of a unit-shaped practice set (source: practice:<id>, which word cards record as the place
// the word was met). The words its kanji words drill introduces (unitKanjiWords) show in kanji with their readings; the
// others show in the learner's stages, like the text, and restage with it.
function wordsTableHTML(l,source=`lesson:${l.id}`){
 const rows=wordRows(l);if(!rows.length)return '';
 const frames=rows.some(e=>e.frame),own=new Set(unitKanjiWords(l)),head=w=>own.has(w.id)?`<span class="jp written-form" lang="ja">${jp(w.word,{display:'kanji-reading'})}</span>`:`<span class="jp" lang="ja">${jp(w.word)}</span>`;
 return `<section class="lesson-panel unit-words" data-page-block="words" aria-labelledby="words-title"><h2 id="words-title" tabindex="-1">Words <span class="set-count" data-page-count></span></h2><p class="small">Tap each word to open its card; Next opens once you have tapped every word on the page.</p><table class="word-table"><thead><tr><th scope="col">Japanese</th><th scope="col">Meaning</th><th scope="col">Type</th>${frames?'<th scope="col">Frame</th>':''}</tr></thead><tbody data-page-rows>${rows.map(e=>{const w=words.get(e.id);return `<tr><td><button type="button" class="unit-word${isDiscovered(w.id)?'':' is-new'}" data-word="${esc(w.id)}" data-unit-word data-source="${esc(source)}" data-drag-word aria-haspopup="dialog">${head(w)}</button>${e.recognize?'<span class="recognize-tag" title="Understand it; you do not need to say it yet">recognize</span>':''}</td><td>${esc(w.meaning)}</td><td><span class="pos-tag">${esc(w.pos||'')}</span></td>${frames?`<td class="jp word-frame" lang="ja">${e.frame?jp(e.frame):''}</td>`:''}</tr>`;}).join('')}</tbody></table></section>`;
}
// unitId: the lesson or practice whose Words table this is; a tap records 'seen:<wordId>' in state.answers[unitId] before
// the card opens, and onSeen (the pager's refresh) then opens Next once the page's last word is tapped.
const SEEN_PREFIX='seen:';
const wordSeen=unitId=>w=>state.answers[unitId]?.[SEEN_PREFIX+w]===true;
const seenKeys=record=>Object.fromEntries(Object.entries(record||{}).filter(([k,v])=>k.startsWith(SEEN_PREFIX)&&v===true));
function bindUnitWords(unitId=null,onSeen=()=>{}){main.querySelectorAll('[data-unit-word]').forEach(b=>b.onclick=()=>{const w=b.dataset.word;if(unitId&&!wordSeen(unitId)(w)){commit({...state,answers:{...state.answers,[unitId]:{...state.answers[unitId],[SEEN_PREFIX+w]:true}}});onSeen();}openWord(w,{source:b.dataset.source,trigger:b});});}
// key: the section's page block (pages.mjs sectionKeys). ref: unitRefs, so an example's referenced words open their cards.
function pointHTML(s,n,key=s.id,ref=()=>null){const id=domId(s.id),ex=(e,k)=>{const r=ref(s.id,`examples/${k}/ja`);return r?refRun(r,0,e.ja.length):jp(e.ja);};return `<section class="unit-point" data-page-block="${esc(key)}" aria-labelledby="${id}"><p class="eyebrow">POINT ${n}</p><h2 id="${id}" tabindex="-1">${jp(s.title)}</h2><p class="pattern-box jp" lang="ja">${patternHTML(s.pattern)}</p><p class="point-explain">${jp(s.explain)}</p><ul class="example-list">${s.examples.map((e,k)=>`<li><p class="jp" lang="ja">${ex(e,k)}</p><p class="small">${jp(e.en)}</p></li>`).join('')}</ul>${s.note?`<p class="point-note">${jp(s.note)}</p>`:''}</section>`;}
// source: where a word tapped in the conversation was met, lesson:<id> or, in a practice set, practice:<id>.
function dialogueHTML(l,key='dialogue',source=`lesson:${l.id}`){return `<section class="lesson-panel unit-dialogue" data-page-block="${esc(key)}" aria-labelledby="dialogue-title"><h2 id="dialogue-title" tabindex="-1">Conversation</h2><div class="dialogue">${(l.dialogue||[]).map((d,i)=>`<div class="line"><span class="speaker">${esc(d.speaker)}</span><div><p class="jp" lang="ja">${jpRefs(l,`dialogue/${i}/ja`,source)}</p><details class="reveal"><summary>Meaning</summary><p>${esc(d.en)}</p></details></div></div>`).join('')}</div></section>`;}
// A kanji words drill's introduction (docs/data-contract.md "Kanji words drill"): each new word in a line from the scene,
// the drill's words in kanji with their readings and the other words in the learner's stages, then the English line. It
// shows with the drill's first item only (data-page-first), so a later reading item never has the reading in view.
function wordsIntroHTML(s){
 if(!Array.isArray(s.kanjiWords)||!Array.isArray(s.intro)||!s.intro.length)return '';
 return `<div class="kanji-intro" role="group" aria-label="New kanji words" data-page-first><ul>${s.intro.map(x=>`<li><p class="jp" lang="ja">${jp(x.ja,{display:'kanji-reading',words:s.kanjiWords})}</p><p class="small">${jp(x.en)}</p></li>`).join('')}</ul></div>`;
}
// Paged, each question stands alone under the set header and instruction, without worked examples.
// ref: unitRefs, the reference context of each item's Japanese line (a returned item has none).
function practiceHTML(s,label,ctx,key=s.id,ref=()=>null){
 const final=s.final===true,items=(s.items||[]).map(it=>({...it,format:it.format||s.format})),id=domId(s.id);
 return `<section class="unit-practice${final?' is-final':''}" data-page-block="${esc(key)}" aria-labelledby="${id}"><h2 id="${id}" class="practice-title" data-page-heading tabindex="-1">${final?'<span lang="ja">まとめ</span> Review':`Practice ${esc(label)}`} <span class="set-count" data-page-count></span></h2>${final||!(s.stem||STEMS[s.format])?'':`<p class="jp drill-set-stem" lang="ja">${jp(s.stem||STEMS[s.format])}</p>`}<p class="drill-instruction">${jp(s.instruction)}</p>${wordsIntroHTML(s)}<ol class="drill-list">${items.map((it,k)=>drillHTML(it,ctx,k+1,{stem:final,ref:it.returned?null:ref(it.id)})).join('')}</ol></section>`;
}
function unitHTML(l,sections,ctx,source=`lesson:${l.id}`){const labels=setLabels({sections}),keys=sectionKeys(sections),ref=unitRefs(l,source);let n=0;return sections.map((s,i)=>s.kind==='point'?pointHTML(s,++n,keys[i],ref):s.kind==='dialogue'?dialogueHTML(l,keys[i],source):s.kind==='practice'?practiceHTML(s,labels.get(s.id),ctx,keys[i],ref):'').join('');}
const unitSections=(l,items)=>hasUnit(l)?l.sections:[{kind:'dialogue'},{kind:'practice',id:`${l.id}-check`,format:'choice',instruction:'Choose the best answer.',items}];
// Where a lesson was opened from, so its back link returns there: a topic, Learn or a flashcard's source link. Anything
// else, a direct URL included, returns to the lesson's own topic page (Learn if it has none).
const lessonFrom=l=>{const f=history.state?.from||'';return /^(node|recall)\//.test(f)||f==='field'?f:data.nodes.some(n=>n.id===l.node)?`node/${l.node}`:'field';};
const fromLabel=(l,from)=>from==='field'?'Learn':from.startsWith('recall/')?'Back to your review':esc(data.nodes.find(n=>n.id===from.slice(5))?.title||data.nodes.find(n=>n.id===l.node)?.title||'Topic');
const backTo=(l,from)=>`<a class="back-link" href="#${from}">← ${fromLabel(l,from)}</a>`;
// Focus (docs/content-standard.md): what the unit covers and what to practise, read before the words.
const focusHTML=l=>l.focus?`<section class="focus-panel lesson-focus" aria-labelledby="focus-title"><h2 class="eyebrow" id="focus-title">FOCUS</h2><p>${jp(l.focus)}</p></section>`:'';
// A paged view (unitPager): the toolbar (back link, track, and the position that opens the contents), the stage that
// holds every page, and the dock (the deck tray, if any, above Back and Next).
const pagedHTML=({cls,back,stage,dock='',stageId=''})=>`<div class="${cls} paged"><div class="panel-toolbar">${back}<div class="page-progress" data-pager-progress></div><details class="page-contents" data-pager-contents></details></div><div class="page-stage"${stageId?` id="${stageId}"`:''}>${stage}</div><div class="page-dock" data-pager-dock>${dock}</div></div>`;
// A run's question pages share one compact heading, the page's heading for focus and screen readers: the run's name as
// its eyebrow, then "Question 3 of 9" (the pager's counter).
const runTitle=(name,id='')=>`<h2 class="run-title"${id?` id="${id}"`:''} data-page-heading tabindex="-1"><span class="eyebrow">${esc(name)}</span> Question <span data-page-count></span></h2>`;
// The opening page: title, goal, scene, track and length, then the Focus and any reading check.
const lessonHead=l=>`<h1 tabindex="-1">${esc(l.title)}</h1><p class="lesson-goal">${esc(l.goal)}</p><p class="lesson-scene"><span class="eyebrow">SCENE</span> ${esc(l.context)}</p><p class="small lesson-meta">${withLength(esc(l.track),l.minutes)}</p>`;
function lessonView(id){
 const l=lessons.lessons.find(x=>x.id===id);if(!l)return missing();
 if(!lessonStarted(state,id))commit({...state,daily:markStarted(state.daily,id,Date.now())});
 const reopened=noteOpened(state.checkpoints,lessons,id,Date.now());if(reopened.changed)commit({...state,checkpoints:reopened.store});
 // An unfinished lesson opened to learn becomes the lesson in progress (progression.mjs); its topic row says so.
 const entered=enterLesson(state.progression,id,{completed:state.completed});
 if(entered!==state.progression)commit({...state,progression:entered});
 const from=lessonFrom(l);
 // Drill items whose reason was wrong join the end of the まとめ as their own occurrences and count towards finishing
 // the unit.
 const {items,recap}=lessonItemSet(l,state.answers[id]),all=[...items,...recap];
 const sectionsNow=()=>unitSections(l,items).map(s=>recap.length&&isFinal(s)?{...s,items:[...s.items,...recap]}:s),sections=sectionsNow();
 const modelNow=()=>unitPages({sections:sectionsNow()},{words:wordRows(l).length,title:l.title});
 const source=`lesson:${l.id}`,checkItems=prepareReadingCheck(l,source);
 // Rule 10: when an answer completes a lesson part, the practices and books that part opened (loop.mjs partsOpened)
 // are named in one line under that item, with where they live, as text with no links.
 // Only when some practice or book names a part of this lesson; until content does, nothing is compared.
 const watched=loopContent(),partWatch=[...practicesOf(watched),...(watched.items||[])].some(x=>(x.requires||[]).some(r=>String(r).startsWith(`lesson:${id}/`)));
 let partSnap=partWatch?loopProgress():null;
 const partNote=it=>{if(!partWatch)return;const now=loopProgress(),found=partsOpened(partSnap,now,loopContent(),id);partSnap=now;if(!found.length)return;const box=main.querySelector(`[data-drill="${CSS.escape(it.id)}"] .drill-body`);if(box)box.insertAdjacentHTML('beforeend',partNoteHTML(found));const items=found.flatMap(f=>f.items),of=k=>items.filter(x=>x.kind===k).map(x=>x.id);announceUnlocks({practices:of('practice'),books:of('book')});};
 const learn=learnCtx(id,()=>update(),()=>addReturns());
 const ctx={...learn,unit(it,key,ok){learn.unit(it,key,ok);partNote(it);},pend(it){const r=learn.pend(it);partNote(it);return r;},resolve(it,right){learn.resolve(it,right);partNote(it);}};
 let pager=null;
 // A wrong reason during the drills adds its item to the end of the まとめ at once, as a page of its own.
 function addReturns(){
  const list=main.querySelector('#text-columns .is-final .drill-list');if(!list)return;
  for(const it of returnItems(l,state.answers[id]))if(!all.some(x=>x.id===it.id)){all.push(it);recap.push(it);list.insertAdjacentHTML('beforeend',drillHTML(it,ctx,list.children.length+1,{stem:true}));bindDrill(list.lastElementChild,it,ctx);}
  pager?.sync(modelNow());update();
 }
 // Paged: the opening page (with the reading check, if any), the words, each point, each drill item, the conversation,
 // each まとめ item and the finish, which also lists the sets with items left.
 const finishCard=`<section class="completion-card unit-finish" data-page-block="finish" aria-labelledby="unit-finish-title"><h2 class="unit-finish-title" id="unit-finish-title" data-page-heading tabindex="-1">Finish</h2><p class="unit-progress"><strong id="unit-count"></strong> <span class="small" id="unit-first"></span></p><div class="progress-track" aria-hidden="true"><span id="unit-bar"></span></div><button class="button full" id="mark-practiced" disabled>Finish lesson</button><p id="practice-status" class="small" role="status"></p><div class="page-left-slot" data-page-remaining></div><div class="unit-next hidden" id="unit-next"></div><button type="button" class="text-button hidden" id="unit-again">Do the exercises again</button></section>`;
 main.innerHTML=pagedHTML({cls:'lesson-page unit-page',back:backTo(l,from),stageId:'lesson-body',dock:trayHTML(checkItems.length),
  stage:`<section class="unit-opening" data-page-block="opening">${lessonHead(l)}${focusHTML(l)}${gateHTML(checkItems)}</section><div class="lesson-unit${checkItems.length?' hidden':''}" id="text-columns" tabindex="-1" aria-label="Lesson">${wordsTableHTML(l)}${unitHTML(l,sections,ctx)}${finishCard}</div>`});
 function update(){
  const rec=state.answers[id],p=progress(all,rec),done=state.completed.includes(id);
  $('#unit-count').textContent=`${p.solved} of ${p.total} correct`;$('#unit-first').textContent=p.answered?`· first try ${p.right} of ${p.answered}`:'';$('#unit-bar').style.width=`${p.total?Math.round(p.solved/p.total*100):0}%`;
  // A finished lesson never shows Finish again (2026-10-29): only its status and, once every item is solved, Do the exercises again.
  $('#mark-practiced').disabled=!p.complete;$('#mark-practiced').classList.toggle('hidden',done);$('#unit-again').classList.toggle('hidden',!p.complete);
  $('#practice-status').textContent=p.complete?(done?'Lesson finished. Every item is correct.':'Every item is correct. You can finish the lesson.'):done?`Lesson finished. The drills stay open for practice · ${p.total-p.solved} to go.`:`Answer every item correctly to finish · ${p.total-p.solved} to go.`;
  pager?.refresh();
 }
 bindDrills($('#text-columns'),all,ctx);bindWordRefs();bindUnitWords(id,()=>pager?.refresh());bindDeckChoosers(main.querySelector('.lesson-page'));renderTray();
 // The dock waits while a reading check is open; opening the text moves on to where the learner would resume.
 pager=unitPager(main.querySelector('.lesson-page'),{model:modelNow(),state:x=>itemStanding(state.answers[id],all.find(it=>it.id===x)),hold:()=>!!main.querySelector('#reading-gate:not(.is-done)'),wordsSeen:wordSeen(id)});
 bindReadingGate(l,source,checkItems,()=>{openText($('#text-columns'));pager.release();});update();
 const arrival=routeFocus&&main.querySelector(routeFocus);if(arrival)pager.reveal(arrival);
 // The first finish reveals what it unlocked, with one way back to the lesson's topic, where the rows it opened are
 // highlighted; a finished lesson has no Finish button any more (update()). Finishing still enters the lesson in the review schedule
 // (recall.mjs), kept for a later review in Practice; nothing shows it yet.
 const topic=data.nodes.find(x=>x.id===l.node);
 $('#mark-practiced').onclick=()=>{
  const p=progress(all,state.answers[id]);if(!p.complete||state.completed.includes(id))return;
  const before=withoutUnitWords(openNow(),l);
  commit({...state,completed:[...state.completed,id],reviews:enterReview(state.reviews,id,Date.now()).reviews,progression:finishLesson(state.progression,id)});
  $('#mark-practiced').classList.add('hidden');
  $('#practice-status').textContent=`Lesson finished · first try ${p.right} of ${p.total}.`;
  {const box=$('#unit-next'),u=unlockedSince(before);box.innerHTML=unlockHTML(u,{home:l.node,none:'Lesson finished.',href:topic?`node/${topic.id}`:'field',label:topic?.title||'Learn'});box.classList.remove('hidden');pager.reveal(box);$('#unlock-title').focus();announceUnlocks(u);}
  toast('Lesson progress saved.');
 };
 // Again: the drills restart on the first practice page.
 $('#unit-again').onclick=()=>{const first=pager.model.pages.find(p=>p.kind==='item');commit({...state,answers:{...state.answers,[id]:resetItems(state.answers[id],all)}});if(first)unitPlaces.set(activeRoute,pageKey(first));lessonView(id);main.querySelector('.page-stage [data-page-block]:not(.off-page)')?.querySelector('[data-page-heading],h1,h2')?.focus({preventScroll:true});main.scrollTop=0;};
}
// ── Checkpoints (checkpoints.mjs) ────────────────────────────────────────────────────────────────────────
// A closed-book check every five general lessons. While it runs, the page holds only its questions: no words table,
// examples, pattern notes or answers. A tap is the first and only response and is saved at once, so leaving or reloading
// resumes the same questions. Results come at the end, one row per sampled point with where it is taught. Missed points
// still enter the review records as the run finishes, kept for a later review in Practice; nothing shows them yet.
// Finishing reveals the lessons the checkpoint was holding, with one way back. One not open yet has no page: its route
// lands where its row will sit (checkpointRoute).
// Where a checkpoint was opened from, so its back link returns there: its row on a topic page, or Library → Progress.
// Anything else, a direct URL included, returns to the topic page of the general lesson after it (Learn if none).
function checkpointFrom(cp){
 const f=history.state?.from||'';if(f==='library/progress'||f.startsWith('node/')&&stoneOf(f.slice(5))==='open')return f;
 const place=checkpointPlace(cp);
 return place?`node/${place.node}`:'field';
}
const cpFromName=f=>f==='field'?'Learn':f==='library/progress'?LIBRARY_SECTIONS.find(s=>s.id==='progress').label:data.nodes.find(n=>n.id===f.slice(5))?.title||'Topic';
const cpCtx=(n,onChange)=>({mode:'review',closed:true,seed:runOf(state.checkpoints,n)?.seed||`checkpoint-${n}`,value:key=>runOf(state.checkpoints,n)?.answers?.[key]?.v,
 save(it,key,v){const r=answerCheckpoint(state.checkpoints,lessons,{n,key,value:v},Date.now());if(r.changed)commit({...state,checkpoints:r.store});onChange();const a=runOf(state.checkpoints,n)?.answers?.[key];return a?a.v:v;},answer:()=>null,item(){}});
// A sampled point as the results show it: what it is, where it is taught, and its pattern note, if any.
function targetHTML(row){
 const l=lessonOf(row.lesson),title=esc(l?.title||row.lesson);
 if(row.word){const w=words.get(row.word);return {label:`<span class="jp" lang="ja">${jp(w?.word||row.word)}</span> · ${esc(w?.meaning||'')}`,where:`Words table, “${title}”`,pattern:null};}
 const points=(l?.sections||[]).filter(s=>s.kind==='point'),p=points.find(s=>s.id===row.point);
 return {label:`${jp(p?.title||row.point)} <span class="jp cp-pattern" lang="ja">${patternHTML(p?.pattern||'')}</span>`,where:`Point ${points.indexOf(p)+1}, “${title}”`,pattern:p?.patternId||null};
}
// unlocked: what finishing this run just opened (unlockedSince), shown once on its results.
function checkpointView(raw,unlocked=null){
 const n=Number(raw),list=checkpointStatus(data.path,lessons,cpOpts()),cp=list.find(c=>c.n===n);if(!cp)return missing();
 const run=runOf(state.checkpoints,n),from=checkpointFrom(cp),head=`<div class="checkpoint-page"><div class="panel-toolbar"><a class="back-link" href="#${esc(from)}">← ${esc(cpFromName(from))}</a><span class="small">Checkpoint ${n} of ${list.length}</span></div><h1>Checkpoint ${n}</h1>`;
 if(cp.status==='done')return checkpointResults(cp,head,from,unlocked);
 const begin=restart=>{const r=startCheckpoint(state.checkpoints,lessons,data.path,{n,completed:state.completed,progression:state.progression,now:Date.now(),restart,openAll:sensei});commit({...state,checkpoints:r.store});unitPlaces.delete(activeRoute);checkpointView(n);main.querySelector('#cp-run-title')?.focus();};
 if(cp.status==='stale'){
  main.innerHTML=head+`<section class="card checkpoint-intro" aria-labelledby="cp-stale-title"><h2 id="cp-stale-title">This checkpoint has changed</h2><p>Its questions were updated after you started, so this run cannot continue as it was. The answers you gave in it are not scored. Start again for a new set of questions.</p><div class="actions"><button type="button" class="button" id="checkpoint-restart">Start again</button></div></section></div>`;
  main.querySelector('#checkpoint-restart').onclick=()=>begin(true);
  return;
 }
 if(!run){
  const pool=poolFor(data.path,n,{completed:state.completed,checkpoints:state.checkpoints,openAll:sensei}),size=checkpointSize(pool);
  main.innerHTML=head+`<section class="card checkpoint-intro" aria-labelledby="cp-intro-title"><span class="eyebrow">BEFORE YOUR NEXT LESSON</span><h2 id="cp-intro-title">A closed-book check on what you have learned</h2><p>${size.earlier?`${plural(size.total,'question')}: ${size.recent} on the lessons below and ${size.earlier} on earlier ones`:`${plural(size.total,'question')} on the lessons below`}, set in places those lessons did not use. Answer from memory: the words, examples and answers stay hidden until you finish, and each question takes one answer.</p><ul class="check-list checkpoint-lessons">${pool.recent.map(id=>`<li>${esc(lessonOf(id)?.title||id)}</li>`).join('')}</ul><p class="small">Nothing you have finished is reset, and the result shows what you could recall today, not a grade. You can leave and come back; your answers are kept.</p><div class="actions"><button type="button" class="button" id="checkpoint-start">Start checkpoint ${n}</button></div></section></div>`;
  main.querySelector('#checkpoint-start').onclick=()=>begin(false);
  return;
 }
 const items=run.items.map(id=>findItem(lessons,id)).filter(Boolean).map(runItem),ctx=cpCtx(n,()=>update());
 // Paged: one question a page under the run's header, then the finish page. An item is done once every part is answered.
 main.innerHTML=pagedHTML({cls:'checkpoint-page',back:`<a class="back-link" href="#${esc(from)}">← ${esc(cpFromName(from))}</a>`,
  stage:`<section class="card checkpoint-run unit-review" data-page-block="run" aria-labelledby="cp-run-title">${runTitle(`CHECKPOINT ${n} · FROM MEMORY`,'cp-run-title')}<p class="small run-intro" data-page-first>One answer each, saved as you go. The answers and explanations come when you finish.</p><ol class="drill-list review-list">${items.map((it,k)=>drillHTML(it,ctx,k+1,{stem:true,instruction:true})).join('')}</ol></section><section class="completion-card cp-finish" data-page-block="finish" aria-labelledby="cp-finish-title"><h2 class="unit-finish-title" id="cp-finish-title" data-page-heading tabindex="-1"><span class="eyebrow">CHECKPOINT ${n}</span> Finish</h2><p class="unit-progress"><strong id="cp-count"></strong></p><div class="progress-track" aria-hidden="true"><span id="cp-bar"></span></div><button type="button" class="button full" id="checkpoint-finish" disabled>Finish checkpoint</button><p id="cp-status" class="small" role="status"></p><div class="page-left-slot" data-page-remaining></div></section>`});
 const page=main,finish=page.querySelector('#checkpoint-finish');
 const answeredParts=it=>{const a=runOf(state.checkpoints,n)?.answers||{},keys=unitKeys(it),k=keys.filter(key=>a[key]!==undefined).length;return k===keys.length?'solved':k?'answered':null;};
 const pager=unitPager(page.querySelector('.checkpoint-page'),{model:unitPages({sections:[{kind:'practice',id:'run',label:'Questions',items}]},{opening:false}),state:x=>{const it=items.find(i=>i.id===x);return it?answeredParts(it):null;}});
 function update(){const o=runOutcome(lessons,runOf(state.checkpoints,n));page.querySelector('#cp-count').textContent=`${o.answered} of ${o.total} answered`;page.querySelector('#cp-bar').style.width=`${o.total?Math.round(o.answered/o.total*100):0}%`;finish.disabled=!o.complete;page.querySelector('#cp-status').textContent=o.complete?'Every question is answered. Finish to see your results.':`${o.total-o.answered} to go.`;pager.refresh();}
 bindDrills(page.querySelector('.checkpoint-run'),items,ctx);update();
 // Finishing records the run once and routes its misses in the same save, so a repeated tap or a reload adds nothing.
 finish.onclick=()=>{
  const now=Date.now(),before=openNow(),f=finishCheckpoint(state.checkpoints,lessons,{n},now);if(!f.finished)return;
  const routed=routeMisses({patterns:state.patterns,reviews:state.reviews,answers:state.answers},lessons,f.run,missRoutes(lessons,f.misses,{started:l=>lessonStarted(state,l)}),now);
  let outcomes=state.outcomes;for(const e of routed.events)outcomes=logOutcome(outcomes,{at:now,...e},now).ledger;
  commit({...state,checkpoints:f.store,patterns:routed.patterns,reviews:routed.reviews,answers:routed.answers,outcomes});
  const u=unlockedSince(before);checkpointView(n,u);main.querySelector('#cp-result-title')?.focus();announceUnlocks(u);
 };
}
function checkpointResults(cp,head,from,unlocked=null){
 const run=cp.run,o=runOutcome(lessons,run),items=run.items.map(id=>findItem(lessons,id)).filter(Boolean).map(runItem);
 const asked=new Set(o.rows.map(r=>r.lesson)).size;
 const row=r=>{const t=targetHTML(r);return `<li class="cp-row is-${r.result}"><div class="cp-row-main"><span class="cp-target">${t.label}</span><span class="small">${t.where}</span></div><div class="cp-row-side"><span class="cp-result">${esc(CHECKPOINT_RESULTS[r.result])}</span>${r.result==='missed'&&t.pattern?`<button type="button" class="text-button" data-pattern-note="${esc(t.pattern)}" aria-haspopup="dialog">Pattern note</button>`:''}</div></li>`;};
 const section=(rows,title)=>rows.length?`<h2 class="section-label">${title} · ${rows.length}</h2><ul class="cp-rows">${rows.map(row).join('')}</ul>`:'';
 const reveal=unlocked?unlockHTML(unlocked,{home:from.startsWith('node/')?from.slice(5):null,none:'Checkpoint finished.',href:from,label:cpFromName(from),level:3}):'';
 main.innerHTML=head+`<section class="card checkpoint-summary" aria-labelledby="cp-result-title"><span class="eyebrow">FINISHED · ${esc(shortDate(run.done))}</span><h2 id="cp-result-title" tabindex="-1">${o.retrieved.length} of ${o.total} retrieved from memory</h2><p>This checkpoint asked about ${plural(o.total,'point')} from ${plural(asked,'lesson')}; points it did not ask are not judged here.${o.missed.length?' Your finished lessons stay finished.':''}</p>${reveal}</section>`+
  `<section class="checkpoint-results" aria-label="Results by point">${section(o.missed,'Not yet retrieved')}${section(o.supported,'Answered after reopening the lesson')}${section(o.retrieved,'Retrieved')}</section>`+
  `<details class="topic-details checkpoint-answers"><summary>Every question with its answer</summary><div class="topic-details-body"><ol class="drill-list review-list">${items.map((it,k)=>drillHTML(it,{mode:'review',seed:run.seed},k+1,{stem:true,instruction:true})).join('')}</ol></div></details></div>`;
 bindDrills(main.querySelector('.checkpoint-answers'),items,{mode:'review',seed:run.seed,answer:it=>unitKeys(it).every(k=>run.answers[k]?.ok),item(){}});
 main.querySelectorAll('[data-pattern-note]').forEach(b=>b.onclick=()=>openPatternNote(b.dataset.patternNote,b));
}
// Passage recall (docs/content-standard.md): a supported read under its Focus (the recall purpose: what to follow and
// remember, never the answers), then the text and its Focus are hidden for the immediate questions. The attempt in progress is saved at every step (draftFor in recall.mjs), so a reload
// or a visit elsewhere resumes it. Opening the text marks the attempt supported for good; answers already given stay
// counted as from memory. After a miss the learner may look back and choose once more: that second try is a correction,
// kept apart from the first response and never scored. The reveal brings the text back with each answer's evidence
// highlighted. A due passage opens on its delayed set, answered before the text returns.
const shortDate=t=>new Date(t).toLocaleDateString();
// One slice of a text with its word references. Slices start and end on evidence boundaries, which never split a reference.
function runHTML(container,path,source,a,b){const value=resolvePath(container,path),occ=occurrencesAt(container,path).filter(o=>o.start>=a&&o.end<=b).map(o=>({...o,start:o.start-a,end:o.end-a}));return segmentText(value.slice(a,b),occ).map(x=>x.occurrence?wordRef(x.occurrence,source):jp(x.text)).join('');}
const choiceButton=(label,value,attr,k)=>`<button type="button" class="choice" ${attr}="${value}" aria-pressed="false"><span class="choice-letter" aria-hidden="true">${String.fromCharCode(65+k)}</span><span>${jp(label)}</span></button>`;
function harvestSentence(h){const ctx=h.context.surface,at=ctx.indexOf(h.phrase);return `${jp(ctx.slice(0,at))}<mark class="harvest-phrase">${jp(h.phrase)}</mark>${jp(ctx.slice(at+h.phrase.length))}`;}
// The end of a book attempt's result, under its score (learning loop rules 7, 10 and 11). The first completion says so
// and names what it opened (unlockItems), as text with no links. A book not completed yet says what completes it and that
// another try needs no wait. A book completed before adds nothing: a replay changes nothing.
function bookFinishHTML(unlocked,done,kind='passage'){
 if(unlocked){const items=unlockItems(unlocked);return `<section class="unlock-reveal book-finish" style="margin-top:14px" aria-labelledby="book-finish-title"><h3 class="unlock-title" id="book-finish-title">${kind==='unseen'?'Text completed':'Book completed'}</h3><p class="small">Every answer was right from memory${kind==='unseen'?', and every evidence line too':''}.</p>${items.length?`<p class="small"><strong>Unlocked</strong></p><ul class="unlock-list">${items.map(x=>`<li>${x}</li>`).join('')}</ul>`:''}</section>`;}
 if(done)return '';
 return `<p class="small book-retry-note">${kind==='unseen'?'This text is completed by one try with every answer and evidence line right and the text kept hidden. Try again whenever you like: read it once more, then answer with the choices in a new order. Only your first reading counts as evidence.':'This book is completed by answering every question right from memory, right after reading, without looking back. Try again whenever you like: read it once more, then answer with the choices in a new order.'}</p>`;
}
// A passage (#passage/<id>): read on its Focus, answered from memory, then its evidence. An immediate attempt from memory
// with every first response right completes the book (completesPassage), once, in state.loop.books, and its result names
// what that opened, as text. Until then the result offers Try again, in place, with no limit and no wait: a fresh read
// (again: true), then a new immediate attempt whose choices come in a new seeded order. A delayed recall never completes
// a book.
function passageView(id,{again=false}={}){
 const p=lessons.passages.find(x=>x.id===id);if(!p)return missing();
 const r=p.recall,source=`passage:${p.id}`,key=passageKey(p.id),review=state.reviews[key],resumed=draftFor(state.recall,p.id);
 const set=resumed?resumed.set:!again&&isDue(review)?'delayed':'immediate',delayed=set==='delayed';
 const completed=()=>!!state.loop.books?.[p.id]?.done;
 // Opening records first meetings either way. A delayed recall or an attempt in progress skips the kanji check, whose
 // sentences would show the text.
 const items=prepareReadingCheck(p,source),checkItems=delayed||resumed?[]:items;
 const from=/^recall\//.test(history.state?.from||'')?history.state.from:'';
 main.innerHTML=`<div class="reading-page"><div class="panel-toolbar"><a class="back-link" href="#${esc(from||'library/reading')}">← ${from?'Back to your review':'Reading'}</a><span class="small">${withLength(esc(p.level),p.minutes)}</span></div><h1>${esc(p.title)}</h1><p class="node-summary">${esc(p.context)}</p>${gateHTML(checkItems)}<div class="passage-flow${checkItems.length?' hidden':''}" id="text-columns" tabindex="-1" aria-label="Reading"></div>${trayHTML(checkItems.length)}</div>`;
 // Each attempt's choices come in their own seeded order: the attempt's start time, kept with its draft.
 const flow=$('#text-columns'),shown=new Set();
 let retrying=null;
 const draft=()=>draftFor(state.recall,p.id);
 const bankFor=s=>s==='delayed'?delayedOrder(p,review?.lapses||0):r.immediate;
 // Words in a question can be queued for a deck before the answer and are added with its feedback (releaseCollections).
 quizRefs.set(source,{container:p,source,prefix:qid=>{const k=r.immediate.findIndex(x=>x.id===qid);return k>=0?`recall/immediate/${k}/`:`recall/delayed/${r.delayed.findIndex(x=>x.id===qid)}/`;}});
 function begin(mode,then){
  const s=startAttempt(state.recall,p,{set,mode,interval:delayed?intervalOf(review):undefined},Date.now());
  if(!s.resumed)commit({...state,recall:s.store});
  then();
 }
 const legend=()=>`<div class="word-legend"><p class="small">Tap a marked word for its reading and meaning. <span class="legend-sample is-new">Dotted</span> new word · <span class="legend-sample">Solid</span> in your dictionary · <span class="legend-fade"><span class="fade-mark" aria-hidden="true"></span> Ring</span> reading hidden because you know it; tap once to show it.</p><p class="small" id="word-progress" role="status"></p>${storageNotice()}</div>`;
 const glossary=()=>`<details class="reveal"><summary>Useful phrases</summary>${p.glossary.map(([w,m])=>`<p><strong>${jp(w)}</strong> · ${esc(m)}</p>`).join('')}</details>`;
 const text=()=>`<section class="lesson-panel reading-text">${legend()}${p.paragraphs.map((_,i)=>`<p class="jp" lang="ja">${jpRefs(p,`paragraphs/${i}`,source)}</p>`).join('')}${glossary()}</section>`;
 // reveal: an answer's feedback just opened, so it slides into view (revealFeedback) instead of the focus jumping there.
 function show(html,focus,reveal=false){flow.innerHTML=html;bindWordRefs();if(focus)$(focus)?.focus({preventScroll:reveal});if(reveal)revealFeedback($('#passage-feedback'));}
 function intro(){
  if(delayed){
   show(`<section class="card passage-step" aria-labelledby="passage-title"><span class="eyebrow">${intervalOf(review)}-DAY RECALL</span><h2 id="passage-title" tabindex="-1">Answer from memory</h2><p>${esc(r.purpose)}</p><p class="small">Last practised ${review.lastPractice?shortDate(review.lastPractice):'earlier'}. The text returns after the last question.</p><div class="actions"><button type="button" class="button" id="passage-start">Start</button><button type="button" class="button secondary" id="passage-reread">Reread first</button></div><p class="small">Rereading first counts as supported, so its next recall opens here tomorrow.</p></section>`);
   $('#passage-start').onclick=()=>begin('closed',()=>ask(0));
   // The attempt starts supported before the text appears, so a reload cannot turn a reread into a closed recall.
   $('#passage-reread').onclick=()=>begin('supported',()=>read(true));
   return;
  }
  read(false,false);
 }
 // The read opens straight away, its Focus above the text. A reread before a delayed recall (forced) is supported.
 function read(forced,focus=true){
  const status=review&&!forced?`<p class="small passage-status">${esc(STAGE_LABELS[passageStage(p,state.recall)])} · next recall ${shortDate(review.due)}. ${completed()?'Reading again now is practice.':'Answer every question right from memory, without looking back, to complete this book.'}</p>`:'';
  show(`<section class="focus-panel passage-focus" id="passage-focus" tabindex="-1" aria-labelledby="focus-title"><h2 class="eyebrow" id="focus-title">FOCUS</h2><p>${esc(r.purpose)}</p>${status}</section>${text()}<div class="card passage-done"><div class="actions">${forced?'<button type="button" class="button" id="passage-open">Start the questions</button>':'<button type="button" class="button" id="passage-hide">Done reading · hide the text</button><button type="button" class="button secondary" id="passage-open">Answer with the text open</button>'}</div><p class="small">${forced?'The text stays open, so these answers count as supported.':'The questions are answered from memory. Answers with the text open count as supported, not retained.'}</p></div>`,focus?'#passage-focus':null);
  const hide=$('#passage-hide');if(hide)hide.onclick=()=>begin('closed',()=>ask(0));
  $('#passage-open').onclick=()=>forced?ask(0):begin('supported',()=>ask(0));
 }
 const feedbackText=(q,j)=>jp(q.feedback[j].replace(/^Correct[.!]\s*/,''));
 // One question of the attempt in progress, drawn from the saved draft: unanswered; missed and deciding whether to look
 // back; a second try with the text open; or settled, with the full feedback and the answer marked.
 function ask(i,{focus='#passage-q',note='',reveal=false}={}){
  const d=draft();if(!d)return intro();
  const list=bankFor(d.set);if(i>=list.length)return finish();
  const q=list[i],open=d.mode==='supported',order=choiceOrder(q,d.started),first=d.answers.find(a=>a.q===q.id),fix=d.corrections.find(c=>c.q===q.id);
  const retry=!!first&&!first.correct&&!fix&&open&&retrying===q.id,settled=!!first&&(first.correct||!!fix||shown.has(q.id)),deciding=!!first&&!settled&&!retry;
  const choice=(j,k)=>{
   const picked=j===first?.choice||j===fix?.choice,locked=settled||deciding||(retry&&j===first.choice);
   const notes=[j===first?.choice&&(fix||retry)?'First answer':'',j===fix?.choice?'Second try':'',settled&&j===q.correct?'✓ answer':''].filter(Boolean);
   return `<button type="button" class="choice${picked?' selected':''}" data-recall-answer="${j}" aria-pressed="${picked}"${locked?' disabled':''}><span class="choice-letter" aria-hidden="true">${String.fromCharCode(65+k)}</span><span>${jp(q.choices[j])}</span>${notes.map(n=>`<span class="choice-note">${esc(n)}</span>`).join('')}</button>`;
  };
  let verdict='',body='',tone='';
  if(settled&&first.correct){verdict='Correct';tone='correct';body=`<p>${feedbackText(q,first.choice)}</p>`;}
  else if(settled){
   verdict=fix?.correct?'Correct on the second try':'Not quite';tone=fix?.correct?'corrected':'incorrect';
   body=`<p><span class="feedback-label">${fix?'First answer':'Your answer'}</span> ${feedbackText(q,first.choice)}</p>${fix?`<p><span class="feedback-label">Second try</span> ${feedbackText(q,fix.choice)}</p>`:''}${fix?.correct?'':`<p><span class="feedback-label">Answer</span> ${jp(q.choices[q.correct])}. ${feedbackText(q,q.correct)}</p>`}${fix?'<p class="small">Your first answer is the one that counts. The second try is kept separately.</p>':''}`;
  }else if(deciding){
   verdict='Not quite';tone='incorrect';
   body=`<p>${open?'Find the place in the text and choose once more, or see the answer now.':'Look back in the text and choose once more, or see the answer now. Looking back marks this attempt as supported; the answers you have given so far stay counted as from memory.'}</p><div class="actions"><button type="button" class="button secondary" id="passage-lookback">${open?'Try again':'Look back and try again'}</button><button type="button" class="button secondary" id="passage-show">Show the answer</button></div>`;
  }else if(retry)body='<p class="small">Choose once more with the text open. Your first answer stays recorded as it was.</p>';
  const card=`<section class="question-card passage-question" aria-labelledby="passage-q"><div class="eyebrow">QUESTION ${i+1} OF ${list.length} · ${KIND_LABELS[q.kind].toUpperCase()}</div>${q.kind==='idea'?'<p class="small passage-cue">Did the passage say this?</p>':''}<h2 id="passage-q" tabindex="-1"${q.kind==='idea'?' class="passage-statement"':''}>${jp(q.question)}</h2><div class="choices" role="group" aria-labelledby="passage-q">${order.map((j,k)=>choice(j,k)).join('')}</div><div class="answer-feedback ${tone}" id="passage-feedback">${verdict?`<strong id="passage-verdict" tabindex="-1">${verdict}</strong>`:''}${body}</div><div class="actions${settled?'':' hidden'}" id="passage-next-row"><button type="button" class="button" id="passage-next">${i+1<list.length?'Next question':'Show the evidence'}</button></div><div class="question-words" data-question-words="${esc(q.id)}">${questionWords(source,q.id)}</div></section>`;
  const peek=!open&&!first?`<button type="button" class="text-button" id="passage-peek" aria-expanded="false" aria-controls="peek-confirm">Look back at the text</button>`:'';
  const head=`<div class="passage-mode${open?' is-open':''}"><p><span class="eyebrow">${open?'TEXT OPEN · SUPPORTED':'TEXT HIDDEN · FROM MEMORY'}</span>${open&&d.supportFrom?`<span class="small passage-mode-note">First ${plural(d.supportFrom,'answer')} given from memory</span>`:''}${peek}</p>${peek?`<div class="callout peek-confirm" id="peek-confirm" hidden><p>Opening the text marks this attempt as supported, and it stays supported. ${d.answers.length?`The ${plural(d.answers.length,'answer')} you have given stay counted as from memory.`:'Answer from memory first if you can.'}</p><div class="actions"><button type="button" class="button secondary small" id="peek-open">Open the text</button><button type="button" class="button secondary small" id="peek-cancel">Keep answering from memory</button></div></div>`:''}${note?`<p class="small passage-resume">${esc(note)}</p>`:''}</div>`;
  show(open?`${head}<div class="learning-columns">${text()}<div>${card}</div></div>`:`${head}${card}`,focus,reveal);
  if(peek){
   const box=$('#peek-confirm'),toggle=$('#passage-peek');
   toggle.onclick=()=>{box.hidden=false;toggle.setAttribute('aria-expanded','true');$('#peek-open').focus();};
   $('#peek-cancel').onclick=()=>{box.hidden=true;toggle.setAttribute('aria-expanded','false');toggle.focus();};
   $('#peek-open').onclick=()=>{commit({...state,recall:openSupport(state.recall,p).store});ask(i);announce('The text is open. This attempt now counts as supported.');};
  }
  main.querySelectorAll('[data-recall-answer]:not(:disabled)').forEach(b=>b.onclick=()=>{
   const j=Number(b.dataset.recallAnswer);
   if(retry){const c=correctDraft(state.recall,p,{q:q.id,choice:j});if(!c.added)return;retrying=null;commit({...state,recall:c.store});ask(i,{focus:'#passage-next',reveal:true});announce(c.correction.correct?'Correct on the second try.':'Not quite. The answer is now marked.');return;}
   const a=answerDraft(state.recall,p,{q:q.id,choice:j});if(!a.added)return;
   commit({...state,recall:a.store});
   ask(i,{focus:a.item.correct?'#passage-next':'#passage-lookback',reveal:true});
   announce(a.item.correct?'Correct.':'Not quite. Look back and try again, or show the answer.');
   releaseCollections(source,q.id,flow.querySelector('.passage-question'));
  });
  const lookback=$('#passage-lookback');
  if(lookback)lookback.onclick=()=>{const o=openSupport(state.recall,p);if(o.changed)commit({...state,recall:o.store});retrying=q.id;ask(i);if(o.changed)announce('The text is open. This attempt now counts as supported.');};
  const showAnswer=$('#passage-show');if(showAnswer)showAnswer.onclick=()=>{shown.add(q.id);ask(i,{focus:'#passage-verdict',reveal:true});};
  $('#passage-next').onclick=()=>ask(i+1);
 }
 function finish(){
  const now=Date.now(),{store,attempt}=finishAttempt(state.recall,p,now),s=attemptSummary(p,attempt),memory=fromMemory(attempt);
  let reviews=state.reviews,note,outcomes=state.outcomes;
  if(attempt.set==='delayed'){
   // Only first responses count, so a correction never earns the next interval.
   const res=scheduleReview(reviews,key,{correct:memory&&s.allCorrect,assisted:!memory,now});reviews=res.reviews;outcomes=logged({type:'passage',ref:p.id,venue:'passage',...res.event},now);
   note=res.early?`Practice only. Your next recall is on ${shortDate(res.record.due)}.`:!memory?'Some answers were given with the text open, so this counts as supported. Its next recall opens here tomorrow.':res.advanced?`Recalled after ${plural(attempt.interval,'day')}. Next recall in ${plural(res.days,'day')}.`:'A missed answer sends the passage back to 1 day. The questions return in a different order.';
  }else{
   const res=enterReview(reviews,key,now);reviews=res.reviews;
   note=res.entered?'Your first recall of this passage, with new questions, opens here tomorrow.':`Practice only. Your next recall is on ${shortDate(res.record.due)}.`;
  }
  // Its phrases still enter the review records, kept for a later review in Practice; nothing shows them yet.
  for(const h of r.harvest)reviews=enterReview(reviews,phraseKey(h.id),now).reviews;
  // A clean immediate attempt from memory completes the book once; the first completion names what it opened.
  const done=completesPassage(attempt)?completeBook(state.loop,p.id,now):{loop:state.loop,first:false},before=done.first?openNow():null;
  commit({...state,recall:store,reviews,outcomes,loop:done.loop});
  const u=done.first?unlockedSince(before):null;reveal(attempt,s,note,u);announceUnlocks(u);
 }
 function reveal(attempt,s,note,unlocked=null){
  const list=bankFor(attempt.set),marks=new Map(),first=new Set(),memory=fromMemory(attempt);
  list.forEach((q,i)=>{const item=attempt.items.find(x=>x.q===q.id);for(const span of evidenceFor(p,q)){if(!marks.has(span.path))marks.set(span.path,[]);marks.get(span.path).push({start:span.start,end:span.end,n:i+1,correct:!!item?.correct});}});
  const paragraph=i=>{const path=`paragraphs/${i}`;return markRuns(p.paragraphs[i],marks.get(path)||[]).map(run=>{
   const inner=runHTML(p,path,source,run.start,run.end);if(!run.marks.length)return inner;
   const tags=run.marks.filter(m=>m.start===run.start).map(m=>{const anchor=first.has(m.n)?'':` id="evidence-${m.n}"`;first.add(m.n);return `<button type="button" class="evidence-tag${m.correct?'':' is-missed'}"${anchor} data-result-jump="${m.n}" aria-label="Evidence for answer ${m.n}">${m.n}</button>`;}).join('');
   return `<mark class="evidence${run.marks.every(m=>m.correct)?'':' is-missed'}">${tags}${inner}</mark>`;}).join('');};
  const unaided=new Set(attempt.items.slice(0,memory?attempt.items.length:s.unaided.total).map(x=>x.q));
  const results=list.map((q,i)=>{const item=attempt.items.find(x=>x.q===q.id),fix=attempt.corrections?.find(x=>x.q===q.id);return `<li class="passage-result ${item.correct?'is-correct':'is-missed'}" id="passage-result-${i+1}" tabindex="-1"><div class="passage-result-head"><span class="eyebrow">${i+1} · ${KIND_LABELS[q.kind].toUpperCase()}${unaided.has(q.id)?'':' · TEXT OPEN'}</span><span class="passage-result-mark">${item.correct?'Correct':'Missed'}</span></div><p>${jp(q.question)}</p><p class="small">${item.correct?'':`You chose: ${jp(q.choices[item.choice])}<br>`}${fix?`Second try: ${jp(q.choices[fix.choice])} · ${fix.correct?'correct':'not correct'}<br>`:''}Answer: ${jp(q.choices[q.correct])}</p><button type="button" class="text-button" data-evidence-jump="${i+1}">Show the evidence</button></li>`;}).join('');
  const split=[!memory&&s.unaided.total?`From memory, before you opened the text: ${s.unaided.correct} of ${s.unaided.total} correct.`:'',attempt.corrections?.length?`Second tries with the text open: ${s.corrected} of ${attempt.corrections.length} correct. They are kept apart and do not change the score.`:''].filter(Boolean).map(x=>`<p class="small">${esc(x)}</p>`).join('');
  const further=p.questions?.length?`<details class="stage"><summary>Take it further</summary><div class="stage-content">${p.questions.map(x=>`<p><strong>${esc(x.type)}</strong> · ${jp(x.prompt)}</p><details class="reveal"><summary>Model answer</summary><p>${jp(x.answer)}</p></details>`).join('')}</div></details>`:'';
  show(`<section class="card passage-summary" aria-labelledby="passage-done"><span class="eyebrow">${memory?'FROM MEMORY':s.unaided.total?'PARTLY FROM MEMORY':'WITH THE TEXT OPEN'} · ${attempt.set==='delayed'?`${attempt.interval}-DAY RECALL`:'RIGHT AFTER READING'}</span><h2 id="passage-done" tabindex="-1">${s.correct} of ${s.total} correct</h2><p>${esc(note)}</p>${split}<p class="small">Status: ${esc(STAGE_LABELS[passageStage(p,state.recall)])}</p>${bookFinishHTML(unlocked,completed())}</section><div class="learning-columns"><section class="lesson-panel reading-text"><p class="small">Highlights mark the evidence for each answer. Select a number to see the question.</p>${legend()}${p.paragraphs.map((_,i)=>`<p class="jp" lang="ja">${paragraph(i)}</p>`).join('')}${glossary()}<details class="reveal"><summary>English meaning</summary><p>${esc(p.translation)}</p></details></section><section class="passage-review" aria-labelledby="passage-answers"><h2 id="passage-answers">Your answers</h2><ol class="passage-results">${results}</ol><h2>Phrases to keep</h2><ul class="harvest-list">${r.harvest.map(h=>`<li><p class="jp" lang="ja">${harvestSentence(h)}</p><p class="small"><span lang="ja">${jp(h.phrase)}</span> · ${esc(h.meaning)}</p></li>`).join('')}</ul>${further}<div class="actions"><button type="button" class="button${completed()?' secondary':''}" id="passage-again">${completed()?'Read again':'Try again'}</button><a class="button secondary" href="#library/reading">All readings</a></div></section></div>`,'#passage-done');
  main.querySelectorAll('[data-evidence-jump]').forEach(b=>b.onclick=()=>{const m=$(`#evidence-${b.dataset.evidenceJump}`);m?.scrollIntoView({block:'center'});m?.focus({preventScroll:true});});
  main.querySelectorAll('[data-result-jump]').forEach(b=>b.onclick=()=>{const li=$(`#passage-result-${b.dataset.resultJump}`);li?.scrollIntoView({block:'center'});li?.focus({preventScroll:true});});
  // Try again (or Read again, once completed): a fresh read, then a new attempt right after reading, in place.
  $('#passage-again').onclick=()=>{passageView(p.id,{again:true});($('#gate-title')||$('#passage-title')||$('#passage-focus'))?.focus();};
 }
 // An attempt in progress resumes at its first unanswered question with its first responses and support marking kept.
 if(resumed){ask(resumed.answers.length,{note:`Resumed where you left off. ${resumed.answers.length?`Your ${plural(resumed.answers.length,'answer')} so far ${resumed.answers.length===1?'is':'are'} kept.`:''}`.trim()});routeFocus='#passage-q, #passage-done';}
 else intro();
 bindDeckChoosers(main.querySelector('.reading-page'));renderTray();bindReadingGate(p,source,checkItems,()=>openText(flow));
}
// Unseen texts (transfer.mjs): books in Library → Reading, under their home lesson. A text opens on its own `requires`
// (loop.mjs; no delayed recall gates it); until then the route guard keeps its page closed. It is read once, then hidden
// for the questions, which give no feedback until the last one. The evidence lines come after, with the lines in view,
// and count apart from the answers from memory. One delayed check follows on the text's own page, which opens on it once
// it is due. A closed try with every answer and evidence line right completes the text (completesText); until then its
// result offers Try again: a fresh read, then the first-reading questions again (phase retry, choices in a new order),
// which can complete it but are never transfer evidence. The delayed check never completes it.
// Every step is saved, so a reload resumes where it was and never makes a second first reading.
const unseenLegend='<div class="word-legend"><p class="small">Tap a marked word for its reading and meaning. <span class="legend-sample is-new">Dotted</span> new word · <span class="legend-sample">Solid</span> in your dictionary · <span class="legend-fade"><span class="fade-mark" aria-hidden="true"></span> Ring</span> reading hidden because you know it; tap once to show it.</p></div>';
function unseenTextHTML(t,tags=null,extra=''){const source=transferSource(t.id);return `<section class="lesson-panel reading-text unseen-text" aria-label="The text">${extra?'':unseenLegend}<div class="unseen-sheet is-${esc(t.genre)}"><p class="unseen-sheet-label" aria-hidden="true">${esc(GENRE_LABELS[t.genre])}</p>${t.lines.map((_,i)=>`<p class="jp unseen-line" lang="ja">${tags?.get(i)||''}${jpRefs(t,`lines/${i}`,source)}</p>`).join('')}</div>${extra}</section>`;}
function unseenNote(t,a){
 const e=entryOf(state.transfer,t.id),pending=e?.delayed&&e.delayed.done===undefined?`Your delayed check opens here on ${shortDate(e.delayed.due)}, with new questions and the text hidden. It comes once.`:'';
 if(a.phase==='initial')return pending;
 if(a.phase==='retry')return `Another try, after reading the text again. It is kept apart from your first reading, which alone counts as evidence for the words and patterns its questions test.${pending?` ${pending}`:''}`;
 return a.qualified?'This was the text’s one delayed check, answered from memory at least a day after you last saw the text. Your answers are kept as evidence for the words and patterns each question tests.':'This was the text’s one delayed check. You saw the text less than a day before it, or opened it during the check, so these answers count as practice rather than delayed recall.';
}
// The text with each answer's evidence lines numbered, and every answer with its feedback.
// finish: the end of the result (bookFinishHTML), under the score.
const UNSEEN_PHASE_LABELS={initial:'FIRST READING',delayed:'DELAYED CHECK',retry:'ANOTHER TRY'};
function unseenResultHTML(t,a,note,idp='unseen',finish=''){
 const s=attemptScore(t,a),bank=recallItems(t,a.phase),lines=lineItems(t,a.phase),cut=a.mode==='closed'?a.items.length:Math.min(a.supportFrom??0,a.items.length),tags=new Map();
 bank.forEach((q,n)=>{const ok=!!a.items.find(x=>x.q===q.id)?.correct;for(const i of questionLines(t,q))tags.set(i,(tags.get(i)||'')+`<button type="button" class="evidence-tag${ok?'':' is-missed'}" data-unseen-jump="${idp}-result-${n+1}" aria-label="Evidence for answer ${n+1}">${n+1}</button>`);});
 const fb=(q,j)=>jp(String(q.feedback[j]).replace(/^Correct[.!]\s*/,''));
 const rows=bank.map((q,n)=>{const it=a.items.find(x=>x.q===q.id);return `<li class="passage-result ${it.correct?'is-correct':'is-missed'}" id="${idp}-result-${n+1}" tabindex="-1"><div class="passage-result-head"><span class="eyebrow">${n+1} · ${esc(TRANSFER_KINDS[q.kind].toUpperCase())}${n<cut?'':' · TEXT OPEN'}</span><span class="passage-result-mark">${it.correct?'Correct':'Missed'}</span></div><p>${jp(q.question)}</p><p class="small">${it.correct?'':`You chose: ${jp(q.choices[it.choice])}<br>`}Answer: ${jp(q.choices[q.correct])}</p><p class="small">${it.correct?fb(q,it.choice):`${fb(q,it.choice)} ${fb(q,q.correct)}`}</p></li>`;}).join('');
 const picks=lines.map((q,n)=>{const it=(a.lines||[]).find(x=>x.q===q.id),lq=lineQuestion(t,q);return it?`<li class="passage-result ${it.correct?'is-correct':'is-missed'}"><div class="passage-result-head"><span class="eyebrow">EVIDENCE LINE ${n+1} · LINES SHOWN</span><span class="passage-result-mark">${it.correct?'Correct':'Missed'}</span></div><p>${jp(q.question)}</p><p class="small">${it.correct?'':`You chose: <span lang="ja">${jp(lq.choices[it.choice])}</span><br>`}Answer: <span lang="ja">${jp(lq.choices[q.correct])}</span></p><p class="small">${fb(q,it.choice)}</p></li>`:'';}).join('');
 const how=s.fromMemory?'FROM MEMORY':s.unaided.total?'PARTLY FROM MEMORY':'WITH THE TEXT OPEN';
 return `<section class="card passage-summary" aria-labelledby="${idp}-done"><span class="eyebrow">${UNSEEN_PHASE_LABELS[a.phase]} · ${how}</span><h2 id="${idp}-done" tabindex="-1">${s.recall.correct} of ${s.recall.total} correct</h2>${note?`<p>${esc(note)}</p>`:''}${!s.fromMemory&&s.unaided.total?`<p class="small">From memory, before you opened the text: ${s.unaided.correct} of ${s.unaided.total} correct.</p>`:''}${s.lines.total?`<p class="small">Evidence lines: ${s.lines.correct} of ${s.lines.total}, picked with the lines shown, so they count apart from your answers.</p>`:''}${finish}</section><div class="learning-columns">${unseenTextHTML(t,tags,`<p class="small">Numbers mark the lines each answer rests on. Select one to see the question.</p><details class="reveal"><summary>English meaning</summary><p>${esc(t.translation)}</p></details>`)}<section class="passage-review" aria-labelledby="${idp}-answers"><h2 id="${idp}-answers">Your answers</h2><ol class="passage-results">${rows}${picks}</ol><div id="${idp}-after"></div></section></div>`;
}
function bindUnseenResult(root){root.querySelectorAll('[data-unseen-jump]').forEach(b=>b.onclick=()=>{const li=root.querySelector(`#${b.dataset.unseenJump}`);li?.scrollIntoView({block:'center'});li?.focus({preventScroll:true});});}
// One attempt, drawn from the saved draft and rendered into `root`: the first reading (initial phase), the start card
// (delayed phase) or the fresh read of another try (retry phase), each recall item, then each evidence line. A retry's
// choices come in their own order (seeded with its start). onFinish(store, attempt) commits the finished attempt.
function transferRun(t,root,{phase,onFinish}){
 const seed=`${t.id}|${phase}`;let held=null;
 const show=(html,focus)=>{root.innerHTML=html;bindWordRefs();if(focus)root.querySelector(focus)?.focus();};
 const put=store=>commit({...state,transfer:store});
 function reading(focus){
  const now=Date.now(),r=startReading(state.transfer,t,now);
  if(r.first){const met=recordReadingMeetings(state.readingEvidence,kanjiWordsIn(t,words,inTransferText),now);commit({...state,transfer:r.store,readingEvidence:met.store});}
  show(`<section class="focus-panel passage-focus" id="unseen-focus" tabindex="-1" aria-labelledby="unseen-focus-title"><h2 class="eyebrow" id="unseen-focus-title">FOCUS</h2><p>${esc(t.focus)}</p>${r.first?'':'<p class="small passage-status">Still your first reading: the questions have not started.</p>'}</section>${unseenTextHTML(t)}<div class="card passage-done"><div class="actions"><button type="button" class="button" id="unseen-hide">Done reading · hide the text</button></div><p class="small">You read this text once. The questions are answered from memory, with no feedback until the last one. You can look back during the questions, but from then on the attempt counts as supported.</p></div>`,focus);
  root.querySelector('#unseen-hide').onclick=()=>{const s=startTransferAttempt(state.transfer,t,{phase:'initial'},Date.now());if(s.draft&&!s.resumed)put(s.store);render('#unseen-q');};
 }
 function intro(focus){
  const first=firstAttempt(state.transfer,t.id);
  show(`<section class="card passage-step" aria-labelledby="unseen-intro-title"><span class="eyebrow">DELAYED CHECK · ${esc(t.title.toUpperCase())}</span><h2 id="unseen-intro-title" tabindex="-1">Answer from memory</h2><p>${esc(t.focus)}</p><p class="small">You first read this text on ${first?shortDate(first.at):'an earlier day'}. These questions are new, and the text stays hidden; it returns with the evidence after the last one. This check comes once.</p><div class="actions"><button type="button" class="button" id="unseen-start">Start</button></div><p class="small">You can look back at the text during the questions. From then on the check counts as practice.</p></section>`,focus);
  root.querySelector('#unseen-start').onclick=()=>{const s=startTransferAttempt(state.transfer,t,{phase:'delayed'},Date.now());if(s.draft&&!s.resumed)put(s.store);render('#unseen-q');};
 }
 // Another try: the text again (its read is recorded as a reread when Try again is chosen), then the first-reading
 // questions from memory.
 function again(focus){
  show(`<section class="focus-panel passage-focus" id="unseen-focus" tabindex="-1" aria-labelledby="unseen-focus-title"><h2 class="eyebrow" id="unseen-focus-title">ANOTHER TRY · FOCUS</h2><p>${esc(t.focus)}</p><p class="small passage-status">Read the text again, then answer from memory, with the choices in a new order. This try can complete the text; only your first reading counts as evidence.</p></section>${unseenTextHTML(t)}<div class="card passage-done"><div class="actions"><button type="button" class="button" id="unseen-hide">Done reading · hide the text</button></div><p class="small">The questions are answered from memory, with no feedback until the last one. You can look back during the questions, but from then on the try counts as supported.</p></div>`,focus);
  root.querySelector('#unseen-hide').onclick=()=>{const s=startTransferAttempt(state.transfer,t,{phase:'retry'},Date.now());if(s.draft&&!s.resumed)put(s.store);render('#unseen-q');};
 }
 const head=d=>{const open=d.mode==='supported';return `<div class="passage-mode${open?' is-open':''}"><p><span class="eyebrow">${open?'TEXT OPEN · SUPPORTED':'TEXT HIDDEN · FROM MEMORY'}</span>${open&&d.supportFrom?`<span class="small passage-mode-note">First ${plural(d.supportFrom,'answer')} given from memory</span>`:''}${open?'':'<button type="button" class="text-button" id="unseen-peek" aria-expanded="false" aria-controls="unseen-peek-confirm">Look back at the text</button>'}</p>${open?'':`<div class="callout peek-confirm" id="unseen-peek-confirm" hidden><p>Opening the text marks this attempt as supported, and it stays supported. ${d.answers.length?`The ${plural(d.answers.length,'answer')} you have given stay counted as from memory.`:'Answer from memory first if you can.'}</p><div class="actions"><button type="button" class="button secondary small" id="unseen-peek-open">Open the text</button><button type="button" class="button secondary small" id="unseen-peek-cancel">Keep answering from memory</button></div></div>`}</div>`;};
 function bindPeek(){
  const toggle=root.querySelector('#unseen-peek');if(!toggle)return;const box=root.querySelector('#unseen-peek-confirm');
  toggle.onclick=()=>{box.hidden=false;toggle.setAttribute('aria-expanded','true');root.querySelector('#unseen-peek-open').focus();};
  root.querySelector('#unseen-peek-cancel').onclick=()=>{box.hidden=true;toggle.setAttribute('aria-expanded','false');toggle.focus();};
  root.querySelector('#unseen-peek-open').onclick=()=>{const o=openTransferSupport(state.transfer,t);if(o.changed)put(o.store);render('#unseen-q');announce('The text is open. This attempt now counts as supported.');};
 }
 const choiceHTML=(label,j,k,given,attr)=>`<button type="button" class="choice${given?.choice===j?' selected':''}" ${attr}="${j}" aria-pressed="${given?.choice===j}"${given?' disabled':''}><span class="choice-letter" aria-hidden="true">${LETTERS[k]||k+1}</span><span${isJa(label)?' lang="ja"':''}>${jp(label)}</span>${given?.choice===j?'<span class="choice-note">Your answer</span>':''}</button>`;
 function recall(d,focus){
  const bank=recallItems(t,d.phase),q=bank.find(x=>x.id===held)||bank.find(x=>!d.answers.some(a=>a.q===x.id)),k=bank.indexOf(q),given=d.answers.find(a=>a.q===q.id),open=d.mode==='supported',last=k===bank.length-1;
  const card=`<section class="question-card passage-question unseen-question" aria-labelledby="unseen-q"><div class="eyebrow">QUESTION ${k+1} OF ${bank.length} · ${esc(TRANSFER_KINDS[q.kind].toUpperCase())}</div>${q.kind==='idea'?'<p class="small passage-cue">True, false, or can’t you tell from the text?</p>':''}<h2 id="unseen-q" tabindex="-1"${q.kind==='idea'?' class="passage-statement"':''}>${jp(q.question)}</h2><div class="choices" role="group" aria-labelledby="unseen-q">${choiceOrder(q,d.phase==='retry'?`${t.id}|retry|${d.started}`:seed).map((j,n)=>choiceHTML(q.choices[j],j,n,given,'data-unseen-answer')).join('')}</div>${given?`<p class="small unseen-saved">Answer saved. Feedback comes after the last question.</p><div class="actions"><button type="button" class="button" id="unseen-next">${last?'Go to the evidence lines':'Next question'}</button></div>`:'<p class="small unseen-saved">No feedback until the last question.</p>'}</section>`;
  show(open?`${head(d)}<div class="learning-columns">${unseenTextHTML(t)}<div>${card}</div></div>`:`${head(d)}${card}`,focus);bindPeek();
  root.querySelectorAll('[data-unseen-answer]:not(:disabled)').forEach(b=>b.onclick=()=>{const a=answerRecall(state.transfer,t,{q:q.id,choice:Number(b.dataset.unseenAnswer)});if(!a.added)return;put(a.store);held=q.id;render('#unseen-next');announce('Answer saved.');});
  const next=root.querySelector('#unseen-next');if(next)next.onclick=()=>{held=null;render('#unseen-q');};
 }
 function lines(d,focus){
  const bank=lineItems(t,d.phase),q=bank.find(x=>x.id===held)||bank.find(x=>!d.lines.some(a=>a.q===x.id)),k=bank.indexOf(q),given=d.lines.find(a=>a.q===q.id),lq=lineQuestion(t,q),last=k===bank.length-1;
  show(`<div class="passage-mode is-open"><p><span class="eyebrow">EVIDENCE LINES · THE LINES ARE SHOWN</span></p><p class="small">Your answers from memory are saved. Now pick the line that shows each point. The lines are in view, so these picks count apart from your answers.</p></div><section class="question-card passage-question unseen-question" aria-labelledby="unseen-q"><div class="eyebrow">EVIDENCE LINE ${k+1} OF ${bank.length}</div><h2 id="unseen-q" tabindex="-1">${jp(q.question)}</h2><div class="choices unseen-line-choices" role="group" aria-labelledby="unseen-q">${lq.choices.map((c,j)=>choiceHTML(c,j,j,given,'data-unseen-line')).join('')}</div>${given?`<div class="actions"><button type="button" class="button" id="unseen-next">${last?'See your results':'Next'}</button></div>`:''}</section>`,focus);
  root.querySelectorAll('[data-unseen-line]:not(:disabled)').forEach(b=>b.onclick=()=>{const a=answerLine(state.transfer,t,{q:q.id,choice:Number(b.dataset.unseenLine)});if(!a.added)return;put(a.store);held=q.id;render('#unseen-next');announce('Line saved.');});
  const next=root.querySelector('#unseen-next');if(next)next.onclick=()=>{held=null;render('#unseen-q');};
 }
 function complete(){const r=finishTransferAttempt(state.transfer,t,Date.now());if(!r.attempt){put(r.store);return;}onFinish(r.store,r.attempt);}
 function render(focus){
  const d=draftOf(state.transfer,t.id);
  if(!d)return phase==='initial'?reading(focus):phase==='retry'?again(focus):intro(focus);
  if(held&&recallItems(t,d.phase).some(x=>x.id===held))return recall(d,focus);
  if(held&&lineItems(t,d.phase).some(x=>x.id===held))return lines(d,focus);
  const stage=draftStage(t,d);
  return stage==='recall'?recall(d,focus):stage==='lines'?lines(d,focus):complete();
 }
 return {render};
}
function unseenView(id){
 const t=findText(lessons,id);if(!t)return missing();
 main.innerHTML=`<div class="reading-page unseen-page"><div class="panel-toolbar"><a class="back-link" href="#library/reading">← Reading</a><span class="small">${withLength(esc(GENRE_LABELS[t.genre]),t.minutes)}</span></div><p class="eyebrow unseen-venue">UNSEEN TEXT · ${esc(t.venue.toUpperCase())}</p><h1>${esc(t.title)}</h1><p class="node-summary">${esc(t.context)}</p><div class="passage-flow" id="unseen-flow" tabindex="-1" aria-label="Reading"></div></div>`;
 const root=$('#unseen-flow');
 const pending=()=>{const e=entryOf(state.transfer,t.id);return !!e?.delayed&&e.delayed.done===undefined;};
 // The latest attempt's results. unlocked: what a first completion just opened (unlockedSince), named under the score.
 function results(focus,unlocked=null){
  const list=entryOf(state.transfer,t.id)?.attempts||[],shown=list.at(-1),done=!!state.loop.books?.[t.id]?.done;
  root.innerHTML=unseenResultHTML(t,shown,unseenNote(t,shown),'unseen',bookFinishHTML(unlocked,done,'unseen'));
  root.querySelector('#unseen-after').innerHTML=`<div class="actions">${done?'':'<button type="button" class="button" id="unseen-retry">Try again</button>'}<button type="button" class="button secondary" id="unseen-revisit">Read it again</button><a class="button secondary" href="#library/reading">All readings</a></div><p class="small">Reading it again is a revisit, not an unseen reading.${pending()?' Before your delayed check, a reread means that check counts as practice unless a full day passes.':''}</p>`;
  bindWordRefs();bindUnseenResult(root);
  $('#unseen-revisit').onclick=()=>{const r=recordReread(state.transfer,t,Date.now());if(r.changed)commit({...state,transfer:r.store});revisit();};
  // Try again: a fresh read (kept as a reread, so a delayed check soon after counts as practice), then a retry.
  const retry=$('#unseen-retry');if(retry)retry.onclick=()=>{const r=recordReread(state.transfer,t,Date.now());if(r.changed)commit({...state,transfer:r.store});start('retry','#unseen-focus');};
  if(focus)root.querySelector(focus)?.focus();
 }
 function revisit(){
  root.innerHTML=`<section class="focus-panel passage-focus" id="unseen-focus" tabindex="-1" aria-labelledby="unseen-revisit-title"><h2 class="eyebrow" id="unseen-revisit-title">REVISIT</h2><p>You have read this text before, so this reading is a revisit. It is not counted as an unseen reading.</p></section>${unseenTextHTML(t)}<div class="actions"><button type="button" class="button secondary" id="unseen-back">Back to your results</button></div>`;
  bindWordRefs();$('#unseen-focus').focus();
  $('#unseen-back').onclick=()=>results('#unseen-done');
 }
 // A closed try with every answer and evidence line right completes the text, once (state.loop.books); the delayed check
 // never does. The first completion names what it opened.
 function finished(store,attempt){
  const done=completesText(attempt)?completeBook(state.loop,t.id,attempt.at):{loop:state.loop,first:false},before=done.first?openNow():null;
  commit({...state,transfer:store,loop:done.loop});
  const u=done.first?unlockedSince(before):null;results('#unseen-done',u);announceUnlocks(u);
 }
 function start(phase,focus){transferRun(t,root,{phase,onFinish:finished}).render(focus);}
 const phase=draftOf(state.transfer,t.id)?.phase||phaseNow(state.transfer,t.id,Date.now());
 if(!phase)return results();
 start(phase);
 if(draftOf(state.transfer,t.id))routeFocus='#unseen-q';
}
function unseenWordLine(id){const line=evidenceLine(transferEvidence(lessons,state.transfer).words[id]);return line?`<p class="small word-unseen-line"><span class="word-label">Unseen texts</span> ${esc(line)}. This is understanding in context, not a reading check.</p>`:'';}
function unseenEvidenceRow(){const s=unseenSummary(lessons,state.transfer);if(!s.texts)return '';return `<div><dt>Unseen texts</dt><dd>${s.read?`${s.first.correct} of ${s.first.total} right from memory on a first reading${s.later.total?` · ${s.later.correct} of ${s.later.total} right at a delayed check`:''}`:'No unseen texts read yet'}</dd></div>`;}
// Evidence kinds stay apart: passage recall, kanji readings, kanji words and kanji sets are never pooled into one score.
// Kanji readings come from new-sentence reading checks, a review now parked: the row shows only for a store (an older
// backup) that has some. A kanji word is met once its drill is answered; without a track it is known after the policy's
// passed trials on the Kanji page (kanji-words.mjs), and in a track profile, which has no trials, known is named only once
// a word has it. Kanji sets (a track profile only): the sets done and the track kanji read.
function evidenceSection(){
 const read=lessons.passages.filter(p=>!['new','supported'].includes(passageStage(p,state.recall))).length;
 const t=transferSummary(state.readingEvidence),kw=Object.values(state.kanjiWords?.words||{}),known=kw.filter(x=>x.known).length,track=hasTrack(kanjiTrack);
 const sets=track?setList(kanjiTrack,state.kanjiChars):[],charsRead=sets.reduce((n,x)=>n+x.read,0),charsAll=sets.reduce((n,x)=>n+x.total,0);
 const setsRow=track?`<div><dt>Kanji sets</dt><dd>${charsRead?`${sets.filter(x=>x.status==='done').length} of ${plural(sets.length,'set')} done · ${charsRead} of ${charsAll} kanji read`:'No kanji read yet'}</dd></div>`:'';
 return `<section aria-labelledby="evidence-title"><h2 class="section-label" id="evidence-title">Evidence by kind</h2><div class="card evidence-kinds"><dl class="evidence-list"><div><dt>Reading</dt><dd>${read} of ${plural(lessons.passages.length,'passage')} answered from memory</dd></div>${unseenEvidenceRow()}${t.attempts>0?`<div><dt>Kanji readings</dt><dd>${t.passed} of ${t.attempts} correct in sentences you had not read</dd></div>`:''}<div><dt>Kanji words</dt><dd>${kw.length?`${kw.length} met${known||!track?`, ${known} known`:''}`:'No kanji words met yet'}</dd></div>${setsRow}</dl><p class="small">Each kind is recorded separately. None of them is a mastery score.</p></div></section>${patternSection()}`;
}
// Checkpoints finished or under way, in order, six to a page: the way back to a finished one's results. A due one is
// also a row on the topic page of the first lesson it locks; one not yet started is not listed here.
const CHECKPOINT_META={done:'<span aria-hidden="true">✓ </span>Done',started:'In progress',stale:'Changed'};
function checkpointList(){
 const rows=checkpointStatus(data.path,lessons,cpOpts()).filter(c=>CHECKPOINT_META[c.status]).map(c=>`<li><a class="lesson-row${c.status==='done'?' is-done':''}" href="#checkpoint/${c.n}"><span class="lesson-row-title">Checkpoint ${c.n}<span class="lesson-row-sub">After ${esc(titleList(c.core))}</span></span><span class="lesson-row-meta">${CHECKPOINT_META[c.status]}</span><span class="lesson-row-go" aria-hidden="true">→</span></a></li>`);
 return rows.length?`<section aria-labelledby="checkpoints-title"><h2 class="section-label" id="checkpoints-title">Checkpoints</h2>${pagedRows('checkpoints',rows,'checkpoints','progress-checkpoints')}</section>`:'';
}
// Grammar patterns: the strongest evidence each one has, and, apart from it, any misses still open. The notes themselves
// open only from a mistake.
function patternSection(){
 const index=patternIndex(lessons);if(!index.size)return '';
 const unseen=transferEvidence(lessons,state.transfer).patterns,started=id=>lessonStarted(state,id),title=id=>esc(lessons.lessons.find(l=>l.id===id)?.title||id),now=Date.now();
 // Rows follow the Learn path: by the path index of the earliest lesson teaching each pattern, those taught by no lesson
 // last, ties in content order.
 const at=new Map(data.path.core.map((id,k)=>[id,k])),first=p=>Math.min(...p.teaching.filter(t=>at.has(t.lesson)).map(t=>at.get(t.lesson)));
 const rows=[...index.values()].map((p,k)=>({p,k,o:first(p)})).sort((a,b)=>a.o-b.o||a.k-b.k).map(({p})=>{
  const e=patternEvidence(lessons,state,p.id,{started,index,now,unseen:unseen[p.id]||null}),where=e.missedIn.map(title).join(' and ');
  const open=!e.open?(e.transferred?`Correct in a drill from another lesson on ${shortDate(e.transferred)}.`:''):where?`Missed in ${where}.`:'Missed in a drill.';
  return `<div><dt>${jp(p.title)}</dt><dd><span class="reading-stage is-${e.stage}">${esc(e.label)}</span>${open?` <span class="pattern-open${e.open?' is-open':''}">${open}</span>`:''}${evidenceLine(e.unseen)?` <span class="pattern-unseen">Unseen texts: ${esc(evidenceLine(e.unseen))}.</span>`:''}</dd></div>`;
 }).join('');
 return `<section aria-labelledby="pattern-evidence-title"><h2 class="section-label" id="pattern-evidence-title">Grammar patterns</h2><div class="card evidence-kinds pattern-evidence"><dl class="evidence-list">${rows}</dl><p class="small">Seen: its note or lesson opened. Practised: a drill answered. Retrieved: right at the first try. Retained: right in a closed-book review. Transferred: right in a drill from another lesson${lessons.transfer?.texts?.length>0?', or in an unseen text answered from memory':''}. Independently demonstrated needs an unfamiliar task with a rubric, which these drills are not. None of this is a mastery score.</p></div></section>`;
}
// Library: the learner's collection, one page per section. The sections open under Library in the sidebar and as tabs
// at the top of each section on small screens, where the sidebar is a bottom bar.
const LIBRARY_SECTIONS=[
 {id:'reading',label:'Reading',intro:'Short books on everyday topics.'},
 {id:'dictionary',label:'Dictionary',intro:'Words you have tapped in lessons and readings.'},
 {id:'decks',label:'Flashcard decks',intro:'Group words from your dictionary and practice them from memory.'},
 {id:'progress',label:'Progress & backup',intro:'What you have shown so far, by kind, and a copy of this browser’s progress.'}];
function librarySection(name,id){if(name==='library')return LIBRARY_SECTIONS.some(s=>s.id===id)?id:'';return name==='passage'||name==='unseen'?'reading':name==='deck'||name==='recall'?'decks':'';}
// Library → Reading (learning-loop.md rules 1, 5, 8 and 12): every passage and unseen text is a book that opens on its
// own `requires` (loop.mjs itemState), shelved under its home lesson. Shelves follow the garden's stone order, then the
// path order of their home lessons, as in Practice; on a shelf, general books come before optional ones, which carry a
// small Optional label, and a home lesson's passages and unseen texts sit together (an unseen text keeps its own cover
// print). A hidden book is absent. A revealed book is a blank cover: no title, link, button or requirements text. An open
// book shows its title and Ready, In progress or Done. A shelf's subheader, its home lesson's title, shows only once one
// of its books is open, so a blank cover never names the lesson it waits on.
const BOOK_COVERS=['sage','indigo','coral','ochre','plum','teal','ivory','umber','slate'];
// Keep each book recognizable as the collection grows, with distinct covers within each topic.
const BOOK_COVER_ASSIGNMENTS={p01:'coral',p02:'sage',p03:'indigo',ps01:'ochre',ps02:'teal',pi01:'ivory',pi02:'plum',pp01:'slate',pp02:'umber',pp03:'teal',pd01:'plum',pd02:'ivory',t01:'umber',t02:'ochre',t03:'slate',t04:'sage',t05:'coral'};
const coverOf=id=>BOOK_COVER_ASSIGNMENTS[id]||BOOK_COVERS[[...id].reduce((sum,char)=>sum+char.charCodeAt(0),0)%BOOK_COVERS.length];
const coverArt=cover=>`<img class="book-art" src="assets/reading/book-${cover}.png" alt="" loading="lazy" decoding="async">`;
function bookCover(title,id,href,kicker=''){
 const cover=coverOf(id);
 return `<h3 class="book-cover" data-cover="${cover}"><a class="book-cover-link" href="${href}" aria-describedby="book-status-${esc(id)}">${coverArt(cover)}<span class="book-cover-print">${kicker?`<span class="book-kind">${esc(kicker)}</span>`:''}<span class="book-title">${esc(title)}</span></span></a></h3>`;
}
// Under each open cover, a status like a koi's (Ready, In progress, Done), never a review prompt.
const BOOK_STATUS={open:'Ready',started:'In progress',finished:'Done'};
const bookStatus=(id,label,done=false)=>`<span class="book-status${done?' is-done':''}" id="book-status-${esc(id)}">${done?'<span aria-hidden="true">✓ </span>':''}${esc(label)}</span>`;
function bookHTML({b,text,s}){
 const cover=coverOf(b.id),optional=b.optional===true,cls=`book${text==='unseen'?' is-unseen':''}${optional?' is-optional':''}`;
 if(s==='revealed')return `<li class="${cls} is-blank"><div class="book-cover is-blank" data-cover="${cover}" role="img" aria-label="A book not open yet">${coverArt(cover)}</div></li>`;
 const kicker=[optional?'Optional':'',text==='unseen'?'Unseen text':''].filter(Boolean).join(' · ');
 return `<li class="${cls}">${bookCover(b.title,b.id,`#${text}/${esc(b.id)}`,kicker)}${bookStatus(b.id,BOOK_STATUS[s],s==='finished')}</li>`;
}
function bookGroups(content=loopContent(),progress=loopProgress()){
 const groups=new Map();
 for(const {text,item:b} of booksOf(content)){const s=itemState(b.id,content,progress);if(s==='hidden')continue;if(!groups.has(b.home))groups.set(b.home,[]);groups.get(b.home).push({b,text,s});}
 return [...groups].map(([home,books])=>({home,books:books.sort((x,y)=>(x.b.optional===true)-(y.b.optional===true))})).sort((a,b)=>homeOrder(a.home,b.home));
}
function readingShelves(){
 const groups=bookGroups(),open=groups.some(g=>g.books.some(x=>x.s!=='revealed'));
 const contents=groups.map((g,i)=>{const head=g.books.some(x=>x.s!=='revealed')?lessonOf(g.home)?.title||'':'';return `<section class="shelf${head?'':' is-unnamed'}"${head?` aria-labelledby="shelf-${i}"`:''}>${head?`<div class="shelf-head"><h2 class="section-label" id="shelf-${i}">${esc(head)}</h2></div>`:''}<ul class="book-grid">${g.books.map(bookHTML).join('')}</ul></section>`;}).join('');
 // The same frame as Practice's water garden: a topline, the shelves, a footnote.
 return `<div class="reading-table"><div class="reading-topline"><span><span lang="ja">ほん</span><span>READING</span></span>${open?'<span>Choose a book</span>':''}</div><div class="reading-shelves">${contents||'<p class="reading-table-empty">Books will find their way here as you explore <a href="#field">Learn</a>.</p>'}</div><p class="reading-footnote">New books arrive as you learn.</p></div>`;
}
function libraryTabs(current){return `<nav class="library-tabs" aria-label="Library sections">${LIBRARY_SECTIONS.map(s=>`<a href="#library/${s.id}"${s.id===current?' class="active" aria-current="page"':''}>${esc(s.label)}</a>`).join('')}</nav>`;}
function library(section='',from=''){
 const s=LIBRARY_SECTIONS.find(x=>x.id===section);if(!s)return missing();
 const found=discoveredWords(lessons.vocabulary,state.discovered).length;
 const meta={dictionary:sensei?plural(lessons.vocabulary.length,'word'):found?plural(found,'word'):'',decks:state.decks.length?plural(state.decks.length,'deck'):''}[section]||'';
 const body={
  reading:readingShelves,
  dictionary:dictionarySection,
  decks:decksSection,
  // Sensei mode has nothing saved to back up: the note takes the place of Export and Restore.
  progress:()=>`${evidenceSection()}${checkpointList()}<h2 class="section-label">Backup</h2><div class="card">${sensei?'<p class="small" id="sensei-backup-note">Sensei mode: nothing is saved, so there is no backup to export or restore.</p>':'<p>Your progress, words and decks are saved in this browser only. Export a backup to keep a copy or to move to another device. Restoring a backup replaces your current progress.</p><div class="actions"><button class="button secondary" id="export-progress">Export progress</button><label class="button secondary" for="import-progress">Restore a backup</label><input class="sr-only" type="file" id="import-progress" accept="application/json,.json"></div><p class="small" id="restore-status" aria-live="polite"></p>'}${docsShipped?'<p class="small"><a href="#guide">Course guide and documents</a></p>':''}</div>`}[section]();
 // The Dictionary's intro names the course word lists only when one shows.
 const intro=section==='dictionary'&&shownPacks().length?'Words you have tapped in lessons and readings, and the course word lists.':s.intro;
 main.innerHTML=libraryTabs(section)+heading(s.label,intro,meta)+`<div class="library-page is-${section}">${body}</div>`;
 bindDeckChoosers(main.querySelector('.library-page'));
 if(section==='dictionary')panelRefresh={panel:main,dictionary:bindDictionary().renderList};
 else if(section==='decks'){bindDecks();panelRefresh={panel:main,decks:renderDeckList};}
 else if(section==='progress'){if(!sensei)bindBackup();showBuildStamp(main.querySelector('.library-page'));wirePagedRows('progress',{from});if(routeFocus)revealFocus=!scrollPositions.has('library/progress');}
}
// The build stamp (build-stamp.mjs): one muted line at the end of Progress & backup, added only when build.json loads.
function showBuildStamp(page){fetch('build.json').then(r=>r.ok?r.json():null).then(info=>{const line=stampLine(info);if(!line||!page.isConnected)return;const p=document.createElement('p');p.className='small build-stamp';p.textContent=line;page.append(p);}).catch(()=>{});}
function bindBackup(){
 $('#export-progress').onclick=()=>download(profile.backupFile,{app:profile.appTag,...state});
 $('#import-progress').onchange=async e=>{const file=e.target.files[0];if(!file)return;try{if(file.size>2_000_000)throw Error('This backup is too large.');const value=JSON.parse(await file.text());const restored=validateBackup(value);deckUndo=null;state=syncDeckDiscovery(restored);state={...state,recovery:migrateLeeches(state,lessons,Date.now())};save();library('progress');kanjiSwitch();$('#restore-status').textContent='Backup restored. Your previous browser state was replaced.';}catch(err){$('#restore-status').textContent=err.message||`This file is not a valid ${profile.name} backup.`;}e.target.value='';};
}
// Personal dictionary: discovered words (Your words), with learner-chosen fields in learner-chosen order. Once a kanji
// word is met, a Kanji words filter lists the met kanji words (kanjiCollection, in the order met), each with its written
// form, meaning and trial status pill (none in a track profile until Mastered), whether tapped or not. The course word
// lists (wordPacks, lessons.vocabulary
// `pack`) are filters too: every word of the pack, met or not, with the pack's meaning quiz. The search applies to each.
// In a track profile, once a character is met, a Kanji filter follows Kanji words: the met track characters in the order
// met (by met day, then track order), each with its meanings, its readings (On and Kun, kana only) and the pill Read (its
// reading pages finished; mastery is undefined, so there is no other state). The search applies to it (the character, a
// meaning, a reading in either kana).
const KANJI_ENTRY_FIELDS=['written','gloss'];
const kanjiCharList=()=>{
 if(!hasTrack(kanjiTrack))return [];
 const chars=state.kanjiChars?.chars||{},rank=new Map(kanjiTrack.order.map((e,k)=>[e.char,k]));
 return [...metChars(state.kanjiChars)].filter(ch=>rank.has(ch)).sort((a,b)=>String(chars[a].met).localeCompare(String(chars[b].met))||rank.get(a)-rank.get(b)).map(ch=>({entry:kanjiTrack.chars.get(ch),record:chars[ch]}));
};
const kunKana=k=>k.replace('-','・');
const charMatches=(e,query)=>{
 const q=toHiragana(String(query??'').trim().toLowerCase());if(!q)return true;
 return e.char===q||e.meanings.some(m=>m.toLowerCase().includes(q))||[...e.on,...e.kun].some(r=>toHiragana(r.kana.replace('-','')).includes(q.replace('・','')));
};
function charEntry({entry:e}){
 const kana=list=>list.map(x=>`<span lang="ja">${esc(x)}</span>`).join('、');
 const field=(label,value,cls='')=>value?`<div class="dict-field${cls}"><dt>${label}</dt><dd>${value}</dd></div>`:'';
 return `<article class="dict-entry dict-char" aria-label="${esc(e.char)}, ${esc(e.meanings.join(', '))}"><dl>${field('Kanji',`<span class="written-form" lang="ja">${esc(e.char)}</span>`,' dict-lead')}${field('Meaning',esc(e.meanings.join(', ')))}${field('On',kana(e.on.map(x=>x.kana)))}${field('Kun',kana(e.kun.map(x=>kunKana(x.kana))))}</dl><p class="small dict-kanji"><span class="kanji-pill"><span class="sr-only">Kanji: </span>Read</span></p></article>`;
}
// The course word lists, declared by the content (lessons.json vocabularyPacks: [{id, label, note?, noteUntil?}]) and read
// leniently at start: an entry without a non-empty id and label, or with a note or noteUntil that is not a string, is
// dropped; none for content without them. A pack shows only when it has a word. Its note shows above its Practice button
// while the set noteUntil names is not open (always, without noteUntil).
let wordPacks=[];
function readWordPacks(content){
 const str=v=>typeof v==='string'&&v.trim()!=='',opt=v=>v===undefined||typeof v==='string';
 return (Array.isArray(content?.vocabularyPacks)?content.vocabularyPacks:[]).filter(p=>p&&typeof p==='object'&&str(p.id)&&str(p.label)&&opt(p.note)&&opt(p.noteUntil)).map(({id,label,note,noteUntil})=>({id,label,note,noteUntil}));
}
const packWords=pack=>lessons.vocabulary.filter(w=>w.pack===pack);
const shownPacks=()=>wordPacks.filter(p=>packWords(p.id).length>0);
// One column: the search label, a toolbar (the search, then two icon buttons, Filter and the entry layout, each opening its
// own panel under the toolbar, one at a time), the count line and the list.
const TOOL_ICONS={
 filter:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M3 5h18l-7 8.5V19l-4 2v-7.5z"/></svg>',
 layout:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12"/><circle cx="16" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="18" cy="18" r="2"/></svg>'};
function dictionarySection(){
 const button=(id,label,on=false)=>`<button type="button"${on?' class="active"':''} data-dict-filter="${id}" aria-pressed="${on}">${esc(label)}</button>`;
 const filter=`<div class="tabs dictionary-filter" role="group" aria-label="Words shown">${button('all',sensei?'All words':'Your words',true)}${kanjiCollection().length?button('kanji','Kanji words'):''}${kanjiCharList().length?button('chars','Kanji'):''}${shownPacks().map(p=>button(p.id,`${p.label} · ${packWords(p.id).length}`)).join('')}</div>`;
 const tool=(id,label,icon)=>`<button type="button" class="icon-button dictionary-tool" id="dictionary-${id}-button" aria-label="${label}" aria-expanded="false" aria-controls="dictionary-${id}-panel">${icon}${id==='filter'?'<span class="dictionary-tool-dot" aria-hidden="true"></span>':''}</button>`;
 return `<section class="dictionary" aria-label="Your dictionary">${storageNotice()}<div class="dictionary-main"><label class="form-label" for="dictionary-search">Search by kanji, kana, or English</label><div class="dictionary-toolbar"><input type="search" id="dictionary-search" autocomplete="off" spellcheck="false">${tool('filter','Filter words',TOOL_ICONS.filter)}${tool('layout','Change what entries show',TOOL_ICONS.layout)}</div><div class="card dictionary-panel" id="dictionary-filter-panel" hidden>${filter}</div><div class="card dictionary-panel" id="dictionary-layout-panel" role="group" aria-label="Change what entries show" hidden><p class="small">Tick the fields to show. Use the arrows to reorder them; the first is shown largest.</p><ol class="config-list" id="field-config"></ol><p class="sr-only" id="field-status" aria-live="polite"></p><h4 class="preview-label" id="preview-label">Preview</h4><div id="dictionary-preview" role="group" aria-labelledby="preview-label"></div></div><p class="small" id="dictionary-count" role="status" aria-live="polite"></p><div id="dictionary-list"></div></div></section>`;
}
function fieldValue(f){
 if(f.id==='forms')return `<ul class="plain-list">${f.value.map(x=>`<li><span lang="ja">${jp(x.form)}</span> <span class="small">${esc(x.label)}</span></li>`).join('')}</ul>`;
 if(f.id==='gloss')return esc(f.value);
 // A written form keeps its kanji with the reading above, whatever the stage (a prompt face shows it bare instead).
 return jp(f.value,f.id==='written'?{display:'kanji-reading'}:{});
}
function dictionaryEntry(w,fields,preview=false){
 const parts=entryFields(w,fields),ja=['reading','written','example'];
 const kanji=preview?null:kanjiStatus(w.id),reading=preview||kanji?null:readingStatus(w.id);
 return `<article class="dict-entry" aria-label="${esc(plainWritten(w.word))}, ${esc(w.reading)}"><dl>${parts.map((f,i)=>`<div class="dict-field${i===0?' dict-lead':''}"><dt>${esc(f.label)}</dt><dd class="${f.id==='written'?'written-form':''}${f.id==='example'?'jp':''}"${ja.includes(f.id)?' lang="ja"':''}>${fieldValue(f)}</dd></div>`).join('')}</dl>${kanji?`<p class="small dict-kanji"><span class="kanji-pill${kanji.known?' is-known':''}"><span class="sr-only">Kanji: </span>${esc(kanji.pill)}</span></p>`:reading?`<p class="small dict-reading"><span class="sr-only">Reading status: </span>${stageBadge(reading)}${reading.active?` ${esc(reading.counts)}`:''}</p>`:''}${preview?'':`<div class="dict-actions"><button type="button" class="button secondary small dict-open" data-dict-word="${esc(w.id)}" aria-haspopup="dialog">Details<span class="sr-only"> for ${esc(plainWritten(w.word))}</span></button>${deckChooser(w.id,'dict')}</div>`}</article>`;
}
function bindDictionary(){
 const search=$('#dictionary-search'),cfg=$('#field-config'),searchRow=[main.querySelector('label[for="dictionary-search"]'),main.querySelector('.dictionary-toolbar'),$('#dictionary-count')];
 const total=()=>discoveredWords(lessons.vocabulary,state.discovered).length;
 let filter='all',quiz=false;
 // The toolbar's two panels, Filter and the entry layout: a button opens its own and closes the other; it, or Escape inside
 // the open panel, closes it, Escape returning focus to the button.
 const tools=['filter','layout'].map(id=>({button:$(`#dictionary-${id}-button`),panel:$(`#dictionary-${id}-panel`)}));
 const showPanel=open=>tools.forEach(t=>{const on=t===open;t.panel.hidden=!on;t.button.setAttribute('aria-expanded',String(on));});
 tools.forEach(t=>{t.button.onclick=()=>showPanel(t.panel.hidden?t:null);t.panel.onkeydown=e=>{if(e.key!=='Escape')return;e.preventDefault();e.stopPropagation();showPanel(null);t.button.focus();};});
 function renderList(){
  quiz=false;searchRow.forEach(el=>el.hidden=false);
  if(filter==='kanji')return renderKanji();
  if(filter==='chars')return renderChars();
  if(shownPacks().some(p=>p.id===filter))return renderPack(filter);
  if(sensei)return renderAll();
  const query=search.value.trim(),list=discoveredWords(lessons.vocabulary,state.discovered,query),count=total();
  $('#dictionary-count').textContent=!count?'':query?`${list.length} of ${count} words match “${query}”.`:`${count} word${count>1?'s':''} discovered.`;
  $('#dictionary-list').innerHTML=!count?`<div class="empty">No words yet. Select a marked word in a lesson or one of your <a href="#library/reading">readings</a>. It will appear here with its reading and meaning.</div>`:!list.length?`<div class="empty">No discovered word matches “${esc(query)}”. Try kana, kanji, or an English word.</div>`:`<div class="dictionary-list">${list.map(w=>dictionaryEntry(w,state.dictionary.fields)).join('')}</div>`;
 }
 // Sensei mode's first filter, All words: every word in the content, in lessons.vocabulary order, met or not.
 function renderAll(){
  const query=search.value.trim(),all=lessons.vocabulary,list=all.filter(w=>wordMatches(w,query));
  $('#dictionary-count').textContent=query?`${list.length} of ${all.length} words match “${query}”.`:`${plural(all.length,'word')} in the course.`;
  $('#dictionary-list').innerHTML=list.length?`<div class="dictionary-list">${list.map(w=>dictionaryEntry(w,state.dictionary.fields)).join('')}</div>`:`<div class="empty">No word matches “${esc(query)}”. Try kana, kanji, or an English word.</div>`;
 }
 function renderKanji(){
  const query=search.value.trim(),met=kanjiCollection(),list=met.filter(x=>wordMatches(words.get(x.id),query));
  $('#dictionary-count').textContent=query?`${list.length} of ${met.length} kanji words match “${query}”.`:(m=>`${plural(met.length,'kanji word')} met${m||!hasTrack(kanjiTrack)?` · ${m} mastered`:''}.`)(met.filter(x=>kanjiStatus(x.id)?.known).length);
  $('#dictionary-list').innerHTML=list.length?`<div class="dictionary-list">${list.map(x=>dictionaryEntry(words.get(x.id),KANJI_ENTRY_FIELDS)).join('')}</div>`:`<div class="empty">No kanji word matches “${esc(query)}”. Try kana, kanji, or an English word.</div>`;
 }
 // The met track characters (kanjiCharList), with their count line: 12 kanji read.
 function renderChars(){
  const query=search.value.trim(),met=kanjiCharList(),list=met.filter(x=>charMatches(x.entry,query));
  $('#dictionary-count').textContent=query?`${list.length} of ${met.length} kanji match “${query}”.`:`${met.length} kanji read.`;
  $('#dictionary-list').innerHTML=list.length?`<div class="dictionary-list">${list.map(charEntry).join('')}</div>`:`<div class="empty">No kanji matches “${esc(query)}”. Try a kanji, a reading, or an English word.</div>`;
 }
 // A course word list: every word of the pack, in lessons.vocabulary order, as entries in the learner's layout; Details
 // opens a word without adding it to the dictionary (openWord with no source). With no query, the pack's Practice button
 // sits above the entries, after the pack's note while it applies (readWordPacks).
 function renderPack(pack){
  const query=search.value.trim(),all=packWords(pack),list=all.filter(w=>wordMatches(w,query)),p=wordPacks.find(x=>x.id===pack),name=p.label;
  $('#dictionary-count').textContent=query?`${list.length} of ${all.length} words in ${name} match “${query}”.`:`${all.length} words in ${name}.`;
  const start=query?'':`${p.note&&(!p.noteUntil||!setOpen(p.noteUntil))?`<p class="callout dictionary-callout">${esc(p.note)}</p>`:''}<div class="actions dictionary-practice"><button type="button" class="button" id="start-retrieval">Practice these ${all.length} words</button></div>`;
  $('#dictionary-list').innerHTML=start+(list.length?`<div class="dictionary-list">${list.map(w=>dictionaryEntry(w,state.dictionary.fields)).join('')}</div>`:`<div class="empty">No word in ${esc(name)} matches “${esc(query)}”. Try kana, kanji, or an English word.</div>`);
  if(!query)$('#start-retrieval').onclick=()=>retrieve(pack);
 }
 // The pack's meaning quiz (once the Word lists page), one word at a time in place of the list: which word means “…”,
 // from three choices, with Next word once right. The label, toolbar, panels and count line hide while it runs; Back,
 // or the finished card's button, returns to the list.
 function retrieve(pack){
  const pool=packWords(pack),queue=[...pool].sort(()=>Math.random()-.5),n=pool.length;
  quiz=true;showPanel(null);searchRow.forEach(el=>el.hidden=true);
  const back=()=>{renderList();$('#start-retrieval')?.focus();};
  $('#dictionary-list').innerHTML='<button class="button secondary small" id="retrieval-back">← Back to the list</button><div class="eyebrow" id="retrieval-progress" aria-live="polite"></div><div id="retrieval-step"></div>';
  $('#retrieval-back').onclick=back;
  function step(){
   const w=queue[0];$('#retrieval-progress').textContent=w?`WORD ${n-queue.length+1} OF ${n}`:'FINISHED';
   if(!w){$('#retrieval-step').innerHTML=`<div class="card"><h3>All ${n} words done</h3><p>You matched every word with its meaning.</p><button class="button" id="retrieval-list">Back to the word list</button></div>`;$('#retrieval-list').onclick=back;return;}
   const alternatives=pool.filter(x=>x.id!==w.id&&x.word!==w.word&&x.meaning!==w.meaning).sort(()=>Math.random()-.5).slice(0,2);
   const options=[w,...alternatives].sort(()=>Math.random()-.5);
   const question={question:`Which word means “${w.meaning}”?`,choices:options.map(x=>x.word),correct:options.findIndex(x=>x.id===w.id),feedback:options.map(x=>x.id===w.id?`${w.word} means ${w.meaning}. In context: ${w.example}`:`${x.word} means ${x.meaning}. You need the word for “${w.meaning}”.`)};
   $('#retrieval-step').innerHTML=`<section class="question-card"><h3>${jp(question.question)}</h3><div class="choices">${question.choices.map((c,i)=>`<button class="choice" data-word-answer="${i}" aria-pressed="false"><span class="choice-letter" aria-hidden="true">${String.fromCharCode(65+i)}</span><span>${jp(c)}</span></button>`).join('')}</div><div class="answer-feedback" id="word-feedback" role="status"></div><button class="button" id="next-word" style="margin-top:16px" disabled>Next word →</button></section>`;
   main.querySelectorAll('[data-word-answer]').forEach(button=>button.onclick=()=>{
    const result=assessChoice(question,Number(button.dataset.wordAnswer));
    main.querySelectorAll('[data-word-answer]').forEach(el=>{el.classList.toggle('selected',el===button);el.setAttribute('aria-pressed',String(el===button));});
    const feedback=$('#word-feedback');feedback.className=`answer-feedback ${result.correct?'correct':'incorrect'}`;feedback.innerHTML=`<strong>${result.correct?'Correct':'Not quite'}</strong><p>${jp(result.feedback)}</p>`;$('#next-word').disabled=!result.correct;revealFeedback(feedback);
   });
   $('#next-word').onclick=()=>{queue.shift();step();};
  }
  step();
 }
 const filters=[...main.querySelectorAll('[data-dict-filter]')];
 // Choosing a filter applies it, closes the panel and returns focus to the Filter button, which shows a filter other than
 // Your words by its dot and its label.
 const choose=id=>{
  filter=filters.some(x=>x.dataset.dictFilter===id)?id:'all';filters.forEach(x=>{const on=x.dataset.dictFilter===filter;x.classList.toggle('active',on);x.setAttribute('aria-pressed',String(on));});
  const name=filter==='kanji'?'Kanji words':filter==='chars'?'Kanji':wordPacks.find(p=>p.id===filter)?.label,button=tools[0].button;
  button.classList.toggle('is-filtered',!!name);button.setAttribute('aria-label',name?`Filter words, showing ${name}`:'Filter words');
 };
 filters.forEach(b=>b.onclick=()=>{choose(b.dataset.dictFilter);renderList();showPanel(null);tools[0].button.focus();});
 // An old #library/words address opens on Core words (route); the start is read once, so a later visit opens on Your words.
 choose(dictionaryStart||'all');dictionaryStart='';
 function renderConfig(){
  const fields=state.dictionary.fields;
  cfg.innerHTML=fieldCatalogue(fields).map(f=>{const i=fields.indexOf(f.id);return `<li class="config-row${f.shown?'':' off'}"><label><input type="checkbox" data-field-toggle="${f.id}" ${f.shown?'checked':''} ${f.shown&&fields.length===1?'disabled':''}><span>${esc(f.label)}</span></label>${f.shown?`<span class="config-pos" aria-hidden="true">${i+1}</span><span class="config-moves"><button type="button" class="icon-button" data-field-move="${f.id}" data-delta="-1" aria-label="Move ${esc(f.label)} up" ${i===0?'disabled':''}>↑</button><button type="button" class="icon-button" data-field-move="${f.id}" data-delta="1" aria-label="Move ${esc(f.label)} down" ${i===fields.length-1?'disabled':''}>↓</button></span>`:''}</li>`;}).join('');
  const sample=discoveredWords(lessons.vocabulary,state.discovered)[0]||words.get(sampleWords(lessons.vocabulary)[0])||lessons.vocabulary[0];
  $('#dictionary-preview').innerHTML=dictionaryEntry(sample,fields,true)+(isDiscovered(sample.id)?'':'<p class="small">Sample entry. Your own words will use this layout.</p>');
 }
 // A layout change redraws the list shown; a running quiz, which shows no fields, keeps its place.
 function setFields(fields,message,focus){state.dictionary={...state.dictionary,fields};save();renderConfig();if(!quiz)renderList();$('#field-status').textContent=message;focus()?.focus();}
 cfg.onclick=e=>{
  const b=e.target.closest('[data-field-move]');if(!b)return;const id=b.dataset.fieldMove,delta=Number(b.dataset.delta),next=moveField(state.dictionary.fields,id,delta);
  setFields(next,`${fieldLabel(id)} moved to position ${next.indexOf(id)+1} of ${next.length}.`,()=>{const same=cfg.querySelector(`[data-field-move="${id}"][data-delta="${delta}"]`);return same&&!same.disabled?same:cfg.querySelector(`[data-field-move="${id}"]:not(:disabled)`);});
 };
 cfg.onchange=e=>{
  const box=e.target.closest('[data-field-toggle]');if(!box)return;const id=box.dataset.fieldToggle,next=setFieldShown(state.dictionary.fields,id,box.checked);
  setFields(next,box.checked?`${fieldLabel(id)} shown as field ${next.indexOf(id)+1} of ${next.length}.`:`${fieldLabel(id)} hidden.`,()=>cfg.querySelector(`[data-field-toggle="${id}"]`));
 };
 search.oninput=renderList;
 $('#dictionary-list').onclick=e=>{const b=e.target.closest('[data-dict-word]');if(b)openWord(b.dataset.dictWord,{trigger:b});};
 renderConfig();renderList();
 return {renderList};
}
// Flashcard decks: membership is explicit, cards reference vocabulary IDs, and each deck owns its card format.
const JA_FIELDS=['reading','written','example'];
const SHORT_FIELDS=['reading','written','gloss'];
const wordName=id=>plainWritten(words.get(id)?.word||id);
// The note under a deck preview shown with sample words (sampleWords: a kanji word, then a kana-only one).
function sampleNote(ids){
 const said=ids.map(id=>`${wordName(id)} ${hasKanji(words.get(id))?'has kanji':'is written in kana'}`);
 return said.length>1?`Sample words: ${said.join(' and ')}.`:`Sample word: ${said[0]}.`;
}
const plural=(n,word)=>`${n} ${word}${n===1?'':'s'}`;
function deckChanged({discovered=false}={}){if(panelRefresh?.panel!==main)return;panelRefresh.decks?.();if(discovered)panelRefresh.dictionary?.();}
// A chooser opened from a text carries its source and occurrence, so a card records where it was collected.
// In an unanswered question it also carries `defer`, and ticking a deck queues the word instead of adding it.
const chooserDefer=c=>answered(c.dataset.defer)?'':c.dataset.defer;
const chooserFrom=c=>({source:c.dataset.source||'',occurrence:c.dataset.occurrence===undefined?undefined:Number(c.dataset.occurrence),defer:chooserDefer(c)});
const inDeckOrQueued=(deck,wordId,defer)=>deck.cards.some(c=>c.word===wordId)||(!!defer&&isQueued(collectQueue,deck.id,wordId));
function chooserBody(wordId,scope,{defer='',label=''}={}){
 const name=esc(label||wordName(wordId)),key=`${scope}-${wordId}`,queuedHint=d=>defer&&isQueued(collectQueue,d.id,wordId)?'<span class="chooser-queued"> · after feedback</span>':'';
 return (state.decks.length?`<fieldset class="chooser-decks"><legend class="sr-only">Decks for ${name}</legend>${state.decks.map(d=>`<label class="chooser-row"><input type="checkbox" data-deck-toggle="${esc(d.id)}" ${inDeckOrQueued(d,wordId,defer)?'checked':''}><span>${esc(d.name)}${queuedHint(d)}</span></label>`).join('')}</fieldset>`:'<p class="small">No decks yet. Name one to start it with this word.</p>')+
 `<label class="form-label" for="new-deck-${esc(key)}">New deck with this word</label><div class="inline-form"><input id="new-deck-${esc(key)}" data-new-deck-name maxlength="${NAME_MAX}" autocomplete="off" spellcheck="false"><button type="button" class="button secondary small" data-new-deck>Create<span class="sr-only"> deck with ${name}</span></button></div>${defer?'<p class="small chooser-note">Added when you see the feedback for this question.</p>':''}<p class="small chooser-status" role="status" aria-live="polite"></p>`;
}
function deckChooser(wordId,scope,{source='',occurrence,defer='',label=''}={}){const n=decksWith(state,wordId).length,from=source?` data-source="${esc(source)}"${Number.isInteger(occurrence)?` data-occurrence="${occurrence}"`:''}`:'';return `<details class="deck-chooser" data-chooser="${esc(wordId)}" data-scope="${esc(scope)}"${from}${defer?` data-defer="${esc(defer)}"`:''}${label?` data-label="${esc(label)}"`:''}><summary>Add to deck<span class="chooser-count">${n?` · in ${n}`:''}</span><span class="sr-only"> for ${esc(label||wordName(wordId))}</span></summary><div class="chooser-body">${chooserBody(wordId,scope,{defer,label})}</div></details>`;}
function eachChooser(fn){for(const root of [main,document.getElementById('word-dialog')])root?.querySelectorAll('[data-chooser]').forEach(fn);}
function syncChoosers(wordId){eachChooser(c=>{const id=c.dataset.chooser;if(wordId&&id!==wordId)return;const defer=chooserDefer(c);c.querySelectorAll('[data-deck-toggle]').forEach(b=>{const d=findDeck(state,b.dataset.deckToggle);b.checked=!!d&&inDeckOrQueued(d,id,defer);const row=b.closest('.chooser-row');row.querySelector('.chooser-queued')?.remove();if(d&&defer&&isQueued(collectQueue,d.id,id))row.lastElementChild.insertAdjacentHTML('beforeend','<span class="chooser-queued"> · after feedback</span>');});const n=decksWith(state,id).length;c.querySelector('.chooser-count').textContent=n?` · in ${n}`:'';});}
function rebuildChoosers(){eachChooser(c=>{c.querySelector('.chooser-body').innerHTML=chooserBody(c.dataset.chooser,c.dataset.scope,{defer:chooserDefer(c),label:c.dataset.label||''});});syncChoosers();renderTray();}
// The one collection operation behind the chooser, the tray and drag-and-drop. In an unanswered question it queues;
// otherwise it adds through addToDeck, which keeps membership idempotent and records the source.
function collect({wordId,deckId,source='',occurrence,defer=''}){
 const deck=findDeck(state,deckId),name=wordName(wordId);
 if(!deck)return {changed:false,message:'This deck no longer exists. Nothing was added.'};
 if(defer&&!answered(defer)){
  if(deck.cards.some(c=>c.word===wordId))return {changed:false,message:`Already in ${deck.name}. Nothing changed.`};
  if(isQueued(collectQueue,deck.id,wordId))return {changed:false,message:`Already queued for ${deck.name}. It is added when you see the feedback.`};
  collectQueue=queueCollection(collectQueue,{deck:deck.id,word:wordId,source,occurrence,card:defer});syncChoosers(wordId);
  return {changed:true,queued:true,message:`Queued for ${deck.name}. It is added when you see the feedback.`};
 }
 const r=addToDeck(state,deck.id,wordId,{source,occurrence});
 if(r.already)return {changed:false,message:`${name} is already in ${deck.name}. Nothing changed.`};
 if(!r.added)return {changed:false,message:r.error};
 commit(r.state);if(r.discovered)markDiscovered(wordId);syncChoosers(wordId);deckChanged({discovered:r.discovered});renderTray();
 return {changed:true,message:`Added ${name} to ${deck.name}.${r.discovered?' It is now in your dictionary too.':''}`};
}
function bindDeckChoosers(root){
 if(!root)return;
 root.addEventListener('change',e=>{
  const box=e.target.closest('[data-deck-toggle]');if(!box)return;
  const chooser=box.closest('[data-chooser]'),wordId=chooser.dataset.chooser,deck=findDeck(state,box.dataset.deckToggle),from=chooserFrom(chooser);
  let message='This deck no longer exists. Nothing was added.';
  if(deck&&box.checked)message=collect({wordId,deckId:deck.id,...from}).message;
  else if(deck&&from.defer&&isQueued(collectQueue,deck.id,wordId)){collectQueue=dequeueCollection(collectQueue,deck.id,wordId);message=`No longer queued for ${deck.name}.`;}
  else if(deck){const r=removeFromDeck(state,deck.id,wordId);if(r.removed)commit(r.state);message=`Removed from ${deck.name}. The word stays in your dictionary.`;deckChanged();renderTray();}
  syncChoosers(wordId);chooser.querySelector('.chooser-status').textContent=message;
 });
 const create=input=>{
  const chooser=input.closest('[data-chooser]'),wordId=chooser.dataset.chooser,r=createDeck(state,input.value);
  if(r.error){chooser.querySelector('.chooser-status').textContent=r.error;input.focus();return;}
  commit(r.state);deckUndo=null;const c=collect({wordId,deckId:r.deck.id,...chooserFrom(chooser)});rebuildChoosers();deckChanged();
  [...chooser.querySelectorAll('[data-deck-toggle]')].find(b=>b.dataset.deckToggle===r.deck.id)?.focus();
  chooser.querySelector('.chooser-status').textContent=`Created ${r.deck.name}. ${c.message}`;
 };
 root.addEventListener('click',e=>{const b=e.target.closest('[data-new-deck]');if(b)create(b.closest('.chooser-body').querySelector('[data-new-deck-name]'));});
 root.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.matches?.('[data-new-deck-name]')){e.preventDefault();create(e.target);}});
}
// Deck tray: a visible drop target on lessons and readings. It lists decks only, never word content.
function trayHTML(hidden){return `<aside class="deck-tray${hidden?' hidden':''}" id="deck-tray" aria-labelledby="deck-tray-title"><div class="deck-tray-head"><h2 class="eyebrow" id="deck-tray-title">DECKS</h2><p class="small" id="deck-tray-hint"></p></div><ul class="deck-tray-list" id="deck-tray-list"></ul><p class="small deck-tray-status" id="deck-tray-status"></p></aside>`;}
function renderTray(){
 const list=main.querySelector('#deck-tray-list');if(!list)return;
 // In a paged lesson's dock the tray stays out of the way until there is a deck to drag to (trayReady is false then too).
 main.querySelector('#deck-tray').classList.toggle('is-empty',!state.decks.length);
 main.querySelector('#deck-tray-hint').textContent=state.decks.length?'Hold a word and drag it onto a deck to add it.':'No decks yet. Use Add to deck on a word to create one.';
 list.innerHTML=state.decks.map(d=>`<li class="tray-deck" data-tray-deck="${esc(d.id)}"><span class="tray-deck-name">${esc(d.name)}</span><span class="tray-deck-count">${plural(d.cards.length,'card')}</span></li>`).join('');
}
// Hold-and-drag to the tray, driven by dragStep. Until the hold completes the browser keeps the gesture, so a touch
// that moves scrolls the page. Only a release over a deck collects; every other ending changes nothing.
let drag=DRAG_IDLE,dragTimer=0,dragGhost=null,dragFrom=null,suppressClickUntil=0;
// The tray takes drags only while it shows: not behind a reading check (hidden) nor on a page without words (tray-away).
const trayReady=()=>{const t=main.querySelector('#deck-tray');return !!t&&!t.classList.contains('hidden')&&!t.classList.contains('tray-away')&&state.decks.length>0;};
const dropTarget=(x,y)=>document.elementFromPoint(x,y)?.closest?.('#active-panel [data-tray-deck]')?.dataset.trayDeck||null;
const highlightTray=id=>main.querySelectorAll('[data-tray-deck]').forEach(li=>li.classList.toggle('is-over',li.dataset.trayDeck===id));
function dragItem(el){
 const raw=el.dataset.occurrence??el.dataset.wordRef,occurrence=raw===undefined?undefined:Number(raw),o=sourceContainer(el.dataset.source)?.occurrences?.[occurrence];
 return {word:el.dataset.word,source:el.dataset.source||'',occurrence,defer:el.dataset.defer&&!answered(el.dataset.defer)?el.dataset.defer:'',label:o?surfaceLabel(o.surface):wordName(el.dataset.word)};
}
function moveGhost(x,y){if(dragGhost)dragGhost.style.transform=`translate(${x+12}px,${y-28}px)`;}
function startDrag(x,y){
 const next=dragStep(drag,{type:'hold'});
 if(next.phase!=='dragging'||!dragFrom?.isConnected||!trayReady()){cancelDrag('lost');return;}
 drag=next;try{dragFrom.setPointerCapture(drag.pointer);}catch{}
 dragGhost=document.createElement('div');dragGhost.className='drag-ghost';dragGhost.lang='ja';dragGhost.setAttribute('aria-hidden','true');dragGhost.textContent=drag.item.label;document.body.append(dragGhost);moveGhost(x,y);
 document.body.classList.add('is-word-dragging');main.querySelector('#deck-tray').classList.add('is-active');
 announce(`Dragging ${drag.item.label}. Release over a deck in the tray to add it, or press Escape to cancel.`);
}
function finishDrag(next){
 const prev=drag,el=dragFrom;
 clearTimeout(dragTimer);drag=DRAG_IDLE;dragFrom=null;dragGhost?.remove();dragGhost=null;
 document.body.classList.remove('is-word-dragging');main.querySelector('#deck-tray')?.classList.remove('is-active');highlightTray(null);
 try{if(el?.hasPointerCapture?.(prev.pointer))el.releasePointerCapture(prev.pointer);}catch{}
 if(prev.phase!=='dragging')return;
 suppressClickUntil=Date.now()+600;
 const message=next.phase==='dropped'?collect({wordId:next.item.word,deckId:next.deck,source:next.item.source,occurrence:next.item.occurrence,defer:next.item.defer}).message:next.reason==='navigation'?'':'Drag cancelled. No deck changed.';
 if(!message)return;
 const status=main.querySelector('#deck-tray-status');if(status)status.textContent=message;announce(message);
 const focus=el?.matches('button')?el:el?.closest('.collect-item')?.querySelector('summary');if(focus?.isConnected)focus.focus({preventScroll:true});
}
function cancelDrag(reason){if(drag.phase==='pending'||drag.phase==='dragging')finishDrag(dragStep(drag,{type:'cancel',reason}));}
document.addEventListener('pointerdown',e=>{
 const el=e.target.closest?.('[data-drag-word]');suppressClickUntil=0;
 if(!el||!main.contains(el)||!e.isPrimary||(e.pointerType==='mouse'&&e.button!==0)||!words.has(el.dataset.word)||!trayReady())return;
 cancelDrag('restart');
 drag=dragStep(drag,{type:'down',pointer:e.pointerId,x:e.clientX,y:e.clientY,item:dragItem(el)});dragFrom=el;
 dragTimer=setTimeout(()=>startDrag(drag.cx??drag.x,drag.cy??drag.y),HOLD_MS);
});
document.addEventListener('pointermove',e=>{
 if(drag.phase==='idle'||e.pointerId!==drag.pointer)return;
 const over=drag.phase==='dragging'?dropTarget(e.clientX,e.clientY):null,next=dragStep(drag,{type:'move',pointer:e.pointerId,x:e.clientX,y:e.clientY,over});
 if(next.phase==='cancelled'){finishDrag(next);return;}
 drag=next;if(drag.phase==='dragging'){e.preventDefault();moveGhost(e.clientX,e.clientY);highlightTray(over);}
},{passive:false});
document.addEventListener('pointerup',e=>{
 if(drag.phase==='idle'||e.pointerId!==drag.pointer)return;
 const next=dragStep(drag,{type:'up',pointer:e.pointerId,over:drag.phase==='dragging'?dropTarget(e.clientX,e.clientY):null});
 if(next.phase==='idle'){clearTimeout(dragTimer);drag=DRAG_IDLE;dragFrom=null;return;}
 finishDrag(next);
});
document.addEventListener('pointercancel',e=>{if(e.pointerId===drag.pointer)cancelDrag('pointer');});
document.addEventListener('lostpointercapture',e=>{if(drag.phase==='dragging'&&e.pointerId===drag.pointer&&e.target===dragFrom)cancelDrag('capture');});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&drag.phase!=='idle'){e.preventDefault();e.stopPropagation();cancelDrag('escape');}},true);
document.addEventListener('touchmove',e=>{if(drag.phase==='dragging'&&e.cancelable)e.preventDefault();},{passive:false});
document.addEventListener('contextmenu',e=>{if(drag.phase!=='idle')e.preventDefault();});
document.addEventListener('dragstart',e=>{if(e.target?.closest?.('[data-drag-word]'))e.preventDefault();});
// A completed drag is not also a click, so releasing never opens word details.
document.addEventListener('click',e=>{if(Date.now()<suppressClickUntil&&e.target.closest?.('[data-drag-word]')){suppressClickUntil=0;e.preventDefault();e.stopPropagation();}},true);
window.addEventListener('blur',()=>cancelDrag('blur'));
document.addEventListener('visibilitychange',()=>{if(document.hidden)cancelDrag('hidden');});
const formatSummary=d=>`${d.front.map(fieldLabel).join(', ')} → ${d.back.map(fieldLabel).join(', ')}`;
function decksSection(){
 return `<section class="decks" aria-label="Your decks">${storageNotice()}<div id="deck-undo"></div><form class="deck-create" id="deck-create" novalidate><label class="form-label" for="new-deck-name">New deck name</label><div class="inline-form"><input id="new-deck-name" maxlength="${NAME_MAX}" autocomplete="off" spellcheck="false"><button class="button" type="submit">Create deck</button></div><p class="small" id="deck-create-status" role="status" aria-live="polite"></p></form><div id="deck-list"></div></section>`;
}
function renderDeckList(){
 const el=main.querySelector('#deck-list');if(!el)return;
 el.innerHTML=!state.decks.length?`<div class="empty">No decks yet. Name one above, then use <strong>Add to deck</strong> on any word.</div>`:`${(c=>c.due+c.fresh+c.later?`<div class="review-due"><p><strong>${c.due} due · ${c.fresh} new</strong> across your decks${!c.due&&!c.fresh&&c.nextDue?` · next ${esc(formatWait(c.nextDue-Date.now()))}`:''}</p><a class="button small" href="#recall/all">Review all decks</a></div>`:'')(reviewCounts('all'))}<ul class="deck-grid">${state.decks.map(d=>{const c=reviewCounts(d.id);return `<li class="deck-card"><h3><a href="#deck/${esc(d.id)}">${esc(d.name)}</a></h3><p class="small">${plural(d.cards.length,'card')} · ${esc(presetFor(d)?.label||formatSummary(d))}</p>${d.cards.length?`<p class="small">${c.due} due · ${c.fresh} new</p>`:''}<div class="actions">${d.cards.length?`<a class="button small" href="#recall/${esc(d.id)}">Practice<span class="sr-only"> ${esc(d.name)}</span></a>`:''}<a class="button secondary small" href="#deck/${esc(d.id)}">Manage<span class="sr-only"> ${esc(d.name)}</span></a></div></li>`;}).join('')}</ul>`;
 const undo=main.querySelector('#deck-undo');
 undo.innerHTML=deckUndo?`<div class="callout undo-notice"><span id="undo-text">Deleted “${esc(deckUndo.deck.name)}” with ${plural(deckUndo.deck.cards.length,'card')}. Its words stay in your dictionary.</span><button type="button" class="button secondary small" id="undo-delete" aria-describedby="undo-text">Undo delete</button></div>`:'';
 const b=undo.querySelector('#undo-delete');
 if(b)b.onclick=()=>{const {deck}=deckUndo;commit(restoreDeck(state,deckUndo));deckUndo=null;renderDeckList();rebuildChoosers();$('#deck-create-status').textContent=`Restored “${deck.name}”.`;[...main.querySelectorAll('#deck-list a')].find(a=>a.getAttribute('href')===`#deck/${deck.id}`)?.focus();};
}
function bindDecks(){
 const form=$('#deck-create'),input=$('#new-deck-name');
 form.onsubmit=e=>{
  e.preventDefault();const r=createDeck(state,input.value);
  if(r.error){$('#deck-create-status').textContent=r.error;input.focus();return;}
  commit(r.state);deckUndo=null;input.value='';renderDeckList();rebuildChoosers();
  $('#deck-create-status').textContent=`Created “${r.deck.name}”. Tap a word in a lesson, practice or reading, or use Add to deck in the Dictionary, to fill it.`;
 };
 renderDeckList();
}
function missingDeck(){main.innerHTML=heading('This deck isn’t here','It may have been deleted. Your decks are listed in the Library.')+'<a class="button" href="#library/decks">Open your decks</a>';}
// Prompt faces show written forms without readings, so the reading can be recalled; answers show them with readings.
function faceHTML(parts,side){
 return `<dl class="face-fields">${parts.map((f,i)=>`<div class="face-field${i===0&&SHORT_FIELDS.includes(f.id)?' face-lead':''}${f.fallback?' is-fallback':''}"><dt>${esc(f.label)}</dt><dd class="${f.id==='written'&&side==='back'?'written-form':''}${f.id==='example'?' jp':''}"${JA_FIELDS.includes(f.id)?' lang="ja"':''}>${f.id==='written'&&side==='front'?esc(plainWritten(f.value)):fieldValue(f)}</dd></div>`).join('')}</dl>`;
}
function faceConfig(deck){
 const faces={front:deck.front,back:deck.back},sides=[['front','Front'],['back','Back'],['off','Not shown']];
 return [['front','Front'],['back','Back'],['off','Not shown']].map(([side,title])=>{
  const list=side==='off'?FACE_FIELDS.filter(f=>fieldSide(faces,f)==='off'):faces[side];
  return `<div class="face-group"><h4 class="face-group-title" id="face-group-${side}">${title}</h4>${list.length?`<ol class="config-list" aria-labelledby="face-group-${side}">${list.map((id,i)=>`<li class="config-row${side==='off'?' off':''}"><span class="config-name">${esc(fieldLabel(id))}</span>${side==='off'?'':`<span class="config-pos" aria-hidden="true">${i+1}</span>`}<select class="face-select" data-face-side="${id}" aria-label="Place ${esc(fieldLabel(id))}">${sides.map(([v,l])=>`<option value="${v}"${v===side?' selected':''}>${l}</option>`).join('')}</select>${side==='off'?'':`<span class="config-moves"><button type="button" class="icon-button" data-face-move="${id}" data-delta="-1" aria-label="Move ${esc(fieldLabel(id))} up" ${i===0?'disabled':''}>↑</button><button type="button" class="icon-button" data-face-move="${id}" data-delta="1" aria-label="Move ${esc(fieldLabel(id))} down" ${i===list.length-1?'disabled':''}>↓</button></span>`}</li>`).join('')}</ol>`:'<p class="small">Every field is on a card.</p>'}</div>`;
 }).join('');
}
function deckView(id){
 const deck=findDeck(state,id);if(!deck)return missingDeck();
 main.innerHTML=`<div class="deck-page"><div class="panel-toolbar"><a class="back-link" href="#library/decks">← Flashcard decks</a><span class="small">Flashcard deck</span></div><div class="page-heading"><div><h1 id="deck-title">${esc(deck.name)}</h1><p id="deck-count"></p></div><div id="deck-practice-slot"></div></div>${storageNotice()}<div class="deck-layout"><section class="card deck-cards-card" aria-labelledby="deck-cards-title"><h2 id="deck-cards-title" tabindex="-1">Cards</h2><p class="small">Removing a card keeps the word in your dictionary.</p><p class="small" id="deck-cards-status" role="status" aria-live="polite"></p><div id="deck-cards"></div></section><div class="deck-side"><section class="card" aria-labelledby="deck-format-title"><h2 id="deck-format-title">Card format</h2><p class="small">Choose what each side of the card shows. This applies to every card in the deck.</p><fieldset class="preset-group"><legend class="form-label">Presets</legend>${DECK_PRESETS.map(p=>`<label class="preset-option"><input type="radio" name="deck-preset" value="${p.id}"><span>${esc(p.label)}</span></label>`).join('')}<label class="preset-option"><input type="radio" name="deck-preset" value="custom" disabled><span>Custom · set below</span></label></fieldset><p class="small">A field can be on one side only, and each side needs at least one. Reordering keeps each word’s review schedule; moving, adding or removing a field starts a new one.</p><div id="face-config"></div><p class="small form-error" id="face-error" role="alert"></p><p class="sr-only" id="face-status" aria-live="polite"></p><h3 class="preview-label" id="card-preview-label">Preview</h3><label class="form-label" for="preview-word">Preview with</label><select id="preview-word"></select><div id="card-preview" role="group" aria-labelledby="card-preview-label"></div></section><section class="card" aria-labelledby="deck-settings-title"><h2 id="deck-settings-title">Deck settings</h2><form id="deck-rename" novalidate><label class="form-label" for="deck-name">Deck name</label><div class="inline-form"><input id="deck-name" maxlength="${NAME_MAX}" value="${esc(deck.name)}" autocomplete="off" spellcheck="false"><button class="button secondary" type="submit">Rename</button></div><p class="small" id="deck-rename-status" role="status" aria-live="polite"></p></form><h3 class="preview-label">Delete deck</h3><p class="small">Deletes this deck only. The words, their review schedules and your lesson progress are kept. You can undo this in the Library.</p><button type="button" class="button secondary danger" id="delete-deck">Delete deck</button></section></div></div></div>`;
 const current=()=>findDeck(state,id),cfg=$('#face-config'),pick=$('#preview-word');
 function renderPreview(){
  const d=current(),own=d.cards.map(c=>c.word).filter(w=>words.has(w)),samples=own.length?[]:sampleWords(lessons.vocabulary).filter(w=>words.has(w));
  const options=own.length?own:samples,keep=options.includes(pick.value)?pick.value:options[0];
  [pick,main.querySelector('label[for="preview-word"]'),$('#card-preview-label')].forEach(el=>{if(el)el.hidden=!options.length;});
  pick.innerHTML=options.map(w=>`<option value="${esc(w)}"${w===keep?' selected':''}>${esc(wordName(w))} · ${esc(words.get(w).reading)}</option>`).join('');
  if(!keep){$('#card-preview').innerHTML='';return;}
  const faces=cardFaces(words.get(keep),d);
  $('#card-preview').innerHTML=`<div class="card-preview"><div class="flashcard-face"><span class="eyebrow">FRONT</span>${faceHTML(faces.front,'front')}</div><div class="flashcard-face is-back"><span class="eyebrow">BACK</span>${faceHTML(faces.back,'back')}</div></div>${samples.length?`<p class="small">${esc(sampleNote(samples))} Your cards will use this format.</p>`:''}`;
 }
 function renderFormat(){
  const d=current(),preset=presetFor(d)?.id||'custom';
  main.querySelectorAll('[name="deck-preset"]').forEach(r=>{r.checked=r.value===preset;});
  cfg.innerHTML=faceConfig(d);renderPreview();
 }
 function renderCards(){
  const d=current();if(!d)return;const cards=d.cards.filter(c=>words.has(c.word)),guard=routeGuard();
  $('#deck-count').textContent=`${plural(cards.length,'card')} · ${presetFor(d)?.label||'Custom format'}`;
  $('#deck-practice-slot').innerHTML=cards.length?`<a class="button" href="#recall/${esc(id)}">Practice this deck</a>`:'';
  $('#deck-cards').innerHTML=cards.length?`<ul class="deck-card-list">${cards.map(c=>{const w=words.get(c.word),review=reviewStatus(state.wordReviews,promptKey(c.word,d.front,d.back),Date.now());return `<li data-card="${esc(w.id)}"><div class="deck-card-word"><span class="jp written-form" lang="ja">${jp(w.word,{display:'kanji-reading'})}</span><span class="small"><span lang="ja">${esc(w.reading)}</span> · ${esc(w.meaning)}</span>${collectedFrom(c.source,guard)}<span class="badge">${review.state==='new'?'New':review.state==='due'?'Due now':`Next review ${esc(formatWait(review.due-Date.now()))}`}</span></div><div class="deck-card-actions"><button type="button" class="button secondary small" data-card-details="${esc(w.id)}" aria-haspopup="dialog">Details<span class="sr-only"> for ${esc(wordName(w.id))}</span></button><button type="button" class="button secondary small" data-card-remove="${esc(w.id)}">Remove<span class="sr-only"> ${esc(wordName(w.id))} from this deck</span></button></div></li>`;}).join('')}</ul>`:`<div class="empty">This deck is empty. Tap a word in a lesson, practice or reading and choose <strong>Add to deck</strong>, or use <strong>Add to deck</strong> in the Dictionary.</div>`;
  renderPreview();
 }
 function setFaces(front,back,message,focus){
  const r=setDeckFaces(state,id,front,back);
  if(r.error){$('#face-error').textContent=r.error;renderFormat();focus()?.focus();return;}
  commit(r.state);$('#face-error').textContent='';renderFormat();renderCards();$('#face-status').textContent=`${message} ${plural(current().cards.length,'card')} updated.`;focus()?.focus();
 }
 main.querySelector('.preset-group').onchange=e=>{const p=DECK_PRESETS.find(x=>x.id===e.target.value);if(p)setFaces(p.front,p.back,`Format set to ${p.label}.`,()=>e.target);};
 cfg.onchange=e=>{
  const sel=e.target.closest('[data-face-side]');if(!sel)return;const fid=sel.dataset.faceSide,d=current(),next=placeField(d,fid,sel.value);
  if(next.error){$('#face-error').textContent=next.error;sel.value=fieldSide(d,fid);return;}
  const side=fieldSide(next,fid);
  setFaces(next.front,next.back,side==='off'?`${fieldLabel(fid)} removed from cards.`:`${fieldLabel(fid)} moved to the ${side} as field ${next[side].indexOf(fid)+1} of ${next[side].length}.`,()=>cfg.querySelector(`[data-face-side="${fid}"]`));
 };
 cfg.onclick=e=>{
  const b=e.target.closest('[data-face-move]');if(!b)return;const fid=b.dataset.faceMove,delta=Number(b.dataset.delta),next=moveFaceField(current(),fid,delta),side=fieldSide(next,fid);
  setFaces(next.front,next.back,`${fieldLabel(fid)} moved to position ${next[side].indexOf(fid)+1} of ${next[side].length} on the ${side}.`,()=>{const same=cfg.querySelector(`[data-face-move="${fid}"][data-delta="${delta}"]`);return same&&!same.disabled?same:cfg.querySelector(`[data-face-move="${fid}"]:not(:disabled)`);});
 };
 pick.onchange=renderPreview;
 $('#deck-cards').onclick=e=>{
  const open=e.target.closest('[data-card-details]');if(open){openWord(open.dataset.cardDetails,{trigger:open});return;}
  const b=e.target.closest('[data-card-remove]');if(!b)return;const wid=b.dataset.cardRemove,item=b.closest('li'),sibling=item.nextElementSibling||item.previousElementSibling;
  const r=removeFromDeck(state,id,wid);if(r.removed)commit(r.state);renderCards();
  $('#deck-cards-status').textContent=`Removed ${wordName(wid)}. It stays in your dictionary.`;
  const target=sibling&&[...main.querySelectorAll('[data-card-remove]')].find(x=>x.dataset.cardRemove===sibling.dataset.card);(target||$('#deck-cards-title')).focus();
 };
 $('#deck-rename').onsubmit=e=>{
  e.preventDefault();const r=renameDeck(state,id,$('#deck-name').value);
  if(r.error){$('#deck-rename-status').textContent=r.error;$('#deck-name').focus();return;}
  commit(r.state);deckUndo=null;const name=current().name;$('#deck-name').value=name;$('#deck-title').textContent=name;$('#deck-rename-status').textContent=`Deck renamed to “${name}”.`;
 };
 $('#delete-deck').onclick=async()=>{
  const r=deleteDeck(state,id);if(!r.removed)return;commit(r.state);deckUndo=r.removed;
  await navigate('library/decks','backward');$('#undo-delete')?.focus();
 };
 panelRefresh={panel:main,decks:renderCards};
 renderFormat();renderCards();
}
// Recall → reveal → self-rating on a saved session, so a reload resumes exactly where the learner was.
// Schedules belong to the word and card format, not the deck: #recall/all reviews every deck's prompts once.
// The answer face is not in the document until the learner reveals it.
const RATING_GUIDE={again:'Not recalled, or recalled wrongly',hard:'Recalled, with real effort',good:'Recalled correctly, unaided'};
const reviewCounts=scope=>{const q=reviewQueue(state,scope,Date.now());return {due:q.due.length,fresh:q.unseen.length,later:q.later.length,recovering:q.recovering.length,nextDue:q.nextDue};};
const dueWhen=at=>`${formatWait(at-Date.now())} · ${new Date(at).toLocaleString([], {weekday:'short',hour:'numeric',minute:'2-digit'})}`;
function recallView(id){
 const all=id==='all',deck=all?null:findDeck(state,id);if(!all&&!deck)return missingDeck();
 const title=all?'All decks':deck.name,backHref=all?'#library/decks':`#deck/${esc(id)}`;
 main.innerHTML=`<div class="recall-page"><div class="panel-toolbar"><a class="back-link" href="${backHref}">← ${esc(all?'Flashcard decks':deck.name)}</a><span class="small" id="recall-progress" aria-live="polite"></span></div><h1>Recall · ${esc(title)}</h1><p class="node-summary">Recall the answer before you reveal it, then rate yourself honestly. Only unaided recall on the due day lengthens the interval.</p>${storageNotice()}<div id="recall-stage"></div><p class="sr-only" id="recall-status" role="status" aria-live="polite"></p></div>`;
 const stage=$('#recall-stage'),progress=$('#recall-progress'),status=$('#recall-status');
 const session=()=>state.wordReviews.session?.scope===id?state.wordReviews.session:null;
 const put=store=>commit({...state,wordReviews:store});
 const announce=msg=>{status.textContent=msg;};
 // Show fields in the order of a deck that uses this format, so the card looks as the learner configured it.
 const facesFor=it=>{const d=[deck,...state.decks].find(x=>x&&promptKey(it.word,x.front,x.back)===it.key)||it;return cardFaces(words.get(it.word),d);};
 // Where the word was met (wordContext), shown with the answer only. A passage with a from-memory recall due or under way
 // keeps its sentence back, so a flashcard never previews it. A lesson or book that is not open is its title in plain
 // text, without its sentence. The link reads “Read it in” a lesson or passage whose sentence is shown, else “Open”.
 // The session is saved at every step, so the learner can visit an open source and rate the
 // card on return; the link takes focus again when they come back.
 const sourceHTML=wordId=>{
  const c=wordContext(state,lessons,wordId,{deck:deck?.id});if(!c)return '';
  if(!routeOpen(`${c.kind}/${c.id}`))return `<div class="answer-source"><h3 class="preview-label">${c.recorded?'Where you collected it':'Where it appears'}</h3><p class="small">${esc(c.title)}</p></div>`;
  const held=c.kind==='passage'&&(isDue(state.reviews[passageKey(c.id)])||!!draftFor(state.recall,c.id));
  const line=c.line&&!held?`<p class="jp source-line" lang="ja">${jp(c.line.before)}<mark class="source-word">${jp(c.line.surface)}</mark>${jp(c.line.after)}</p>`:'';
  return `<div class="answer-source"><h3 class="preview-label">${c.recorded?'Where you collected it':'Where it appears'}</h3>${line}${held?'<p class="small">This passage has a recall due or in progress, so its text stays hidden here until you answer it from memory.</p>':''}<p class="small"><a href="#${c.kind}/${esc(c.id)}" id="source-link">${esc(held||!line||c.kind==='practice'?`Open ${c.title}`:`Read it in ${c.title}`)}</a> · Your session is kept; come back here to rate this card.</p></div>`;
 };
 function render(focus){
  // A card whose word entered recovery leaves a session in progress, repeats included (flashcards.mjs dropRecovering).
  const kept=dropRecovering(state.wordReviews,k=>inRecovery(state.recovery,`word:${k}`));if(kept!==state.wordReviews)put(kept);
  const s=session();
  if(s&&currentIndex(s)>=0)prompt(s);else if(s)summary(s);else overview();
  if(focus)main.querySelector(focus)?.focus();
 }
 function overview(){
  progress.textContent='';
  const c=reviewCounts(id),total=c.due+c.fresh+c.later,limit=state.wordReviews.limit;
  if(!total&&!c.recovering){stage.innerHTML=`<div class="empty">${all?'No cards yet. Create a deck in <a href="#library/decks">Flashcard decks</a> and add words to it.':`This deck has no cards yet. Open <a href="#deck/${esc(id)}">the deck</a> to see how to add words.`}</div>`;return;}
  const ready=c.due+c.fresh,empty=!ready?`<p id="queue-empty"><strong>Nothing is due.</strong> ${c.nextDue?`The next review is ${esc(dueWhen(c.nextDue))}.`:''} Early practice is available; it never lengthens an interval.</p>`:'';
  stage.innerHTML=`<section class="card review-overview" aria-labelledby="overview-title"><h2 id="overview-title" tabindex="-1">Cards to review</h2><dl class="review-stats"><div><dt>Due</dt><dd>${c.due}</dd></div><div><dt>New</dt><dd>${c.fresh}</dd></div><div><dt>Scheduled</dt><dd>${c.later}</dd></div></dl>${empty}${c.recovering?`<p class="small recovery-note">${plural(c.recovering,'card')} missed ${LEECH_LAPSES} times ${c.recovering===1?'is':'are'} set aside and not in these sessions.</p>`:''}<form id="session-form" novalidate><label class="form-label" for="session-limit">Prompts per session</label><div class="inline-form"><input id="session-limit" type="number" inputmode="numeric" min="${SESSION_MIN}" max="${SESSION_MAX}" step="1" value="${limit}" aria-describedby="session-limit-note"><button class="button${ready?'':' secondary'}" type="submit" id="start-session">${ready?'Start session':'Practise early'}</button></div><p class="small" id="session-limit-note">Due prompts come first, then new ones.</p><p class="small form-error" id="session-error" role="alert"></p></form></section>`;
  $('#session-form').onsubmit=e=>{
   e.preventDefault();const r=setSessionLimit(state.wordReviews,Number($('#session-limit').value));
   if(r.error){$('#session-error').textContent=r.error;$('#session-limit').focus();return;}
   const now=Date.now(),s=buildSession({...state,wordReviews:r.store},words,{scope:id,now,early:!ready});
   if(!s){put(r.store);announce('Nothing to practise.');return;}
   put(startSession(r.store,s));announce(s.early?'Early practice started. Schedules stay as they are unless you choose Again.':`Session started with ${plural(s.items.length,'prompt')}.`);render('#prompt-title');
  };
 }
 function prompt(s){
  const i=currentIndex(s),it=s.items[i],w=words.get(it.word),faces=facesFor(it),unique=s.items.filter(x=>!x.retry).length,done=s.items.filter(x=>!x.retry&&x.outcome).length;
  const practiceOnly=s.early||it.retry||reviewStatus(state.wordReviews,it.key,Date.now()).state==='scheduled';
  progress.textContent=`${it.retry?'REPEAT':`PROMPT ${done+1} OF ${unique}`}${s.early?' · EARLY PRACTICE':''}`;
  const notes=[it.exposed?'For this word the prompt already shows part of the answer, so this attempt is practice only.':'',practiceOnly&&!it.exposed?'Not due yet, so this is practice: Good and Hard leave the schedule unchanged.':''].filter(Boolean);
  const hint=it.support.includes('hint')?hintFor(w,faces.back.map(f=>f.id)):'';
  stage.innerHTML=`${notes.map(n=>`<p class="callout recall-note">${esc(n)}</p>`).join('')}<section class="flashcard" aria-labelledby="prompt-title"><h2 class="eyebrow" id="prompt-title" tabindex="-1">PROMPT</h2>${faceHTML(faces.front,'front')}</section><div id="answer-slot" class="recall-actions"></div>`;
  const slot=$('#answer-slot');
  if(!it.revealed){
   slot.innerHTML=`<div class="actions"><button type="button" class="button" id="reveal-answer">Reveal answer</button>${hint?'':`<button type="button" class="button secondary" id="use-hint" aria-describedby="hint-note">Show a hint</button>`}</div>${hint?`<p class="recall-hint" id="hint-text"><span class="eyebrow">HINT</span> <span lang="${/[぀-ヿ㐀-鿿]/.test(hint)?'ja':'en'}">${esc(hint)}</span></p><p class="small">Hint used: this attempt cannot lengthen the interval.</p>`:`<p class="small" id="hint-note">Recall: ${esc(faces.back.map(f=>fieldLabel(f.id)).join(', ').toLowerCase())}. A hint keeps the current interval.</p>`}`;
   $('#reveal-answer').onclick=()=>{put(revealItem(state.wordReviews,s.id,i));render('#answer-title');};
   const h=$('#use-hint');if(h)h.onclick=()=>{put(useSupport(state.wordReviews,s.id,i,'hint'));render('#hint-text');};
   return;
  }
  const now=Date.now(),preview=ratingPreview(state.wordReviews,it,now),backIds=faces.back.map(f=>f.id),frontIds=faces.front.map(f=>f.id);
  const effect=p=>p.outcome==='early'?'Schedule unchanged':`${p.outcome==='reset'?'Back':'Next'} ${formatWait(p.due-now)}`;
  const context=[!backIds.includes('written')&&!frontIds.includes('written')?`<p class="jp written-form" lang="ja">${jp(w.word,{display:'kanji-reading'})}</p>`:'',!backIds.includes('example')&&!frontIds.includes('example')&&w.example?`<p class="jp" lang="ja">${jp(w.example)}</p>`:''].join('');
  slot.innerHTML=`<section class="flashcard is-answer" aria-labelledby="answer-title"><h2 class="eyebrow" id="answer-title" tabindex="-1">ANSWER</h2>${faceHTML(faces.back,'back')}${context?`<div class="answer-context"><h3 class="preview-label">In use</h3>${context}</div>`:''}${sourceHTML(it.word)}</section><div class="rating-group" role="group" aria-labelledby="rating-title"><h3 id="rating-title">Compare with what you recalled. How did it go?</h3><div class="rating-buttons">${RATINGS.map(r=>`<button type="button" class="choice" data-rate="${r.id}" aria-describedby="effect-${r.id}"><strong>${esc(r.label)}</strong><span class="small">${esc(RATING_GUIDE[r.id])}</span><span class="small rating-effect" id="effect-${r.id}">${esc(effect(preview[r.id]))}</span></button>`).join('')}</div>${itemSupported(it)?'<p class="small">Hint or visible answer: Good keeps the current interval.</p>':''}</div>`;
  const sourceLink=$('#source-link');if(sourceLink)sourceLink.onclick=()=>{sourceReturn=activeRoute;};
  main.querySelectorAll('[data-rate]').forEach(b=>b.onclick=()=>{
   const now=Date.now(),rating=b.dataset.rate,r=submitRating(state.wordReviews,{session:s.id,index:i,rating},now);
   if(r.applied)commit({...state,wordReviews:r.store,outcomes:logged({id:`cards:${s.id}:${i}`,type:'word',ref:it.key,venue:'cards',...r.event},now)});
   else if(r.store!==state.wordReviews)put(r.store);
   if(r.outcome==='stale'){announce('This prompt was already rated elsewhere, so this rating was not counted.');render('#prompt-title, #summary-title');return;}
   if(!r.applied){render('#prompt-title, #summary-title');return;}
   if(rating==='again')return corrective(r);
   announce(`Saved. ${r.outcome==='early'?'Schedule unchanged.':`Next review ${formatWait(r.record.due-Date.now())}.`}`);render('#prompt-title, #summary-title');
  });
 }
 // After Again, the answer stays in view with a short study step before the session moves on.
 function corrective(r){
  const s=session(),retry=s?.items.at(-1)?.retry&&s.items.at(-1).base===r.record.count;
  main.querySelector('.rating-group').outerHTML=`<div class="callout corrective" role="group" aria-labelledby="corrective-title"><h3 id="corrective-title" tabindex="-1">Study it now</h3><p>Read the answer aloud and connect it to the prompt. It is due again in ${Math.round(RELEARN_MS/60000)} minutes${retry?' and returns once more later in this session':''}.</p><button type="button" class="button" id="corrective-next">Continue</button></div>`;
  $('#corrective-next').onclick=()=>render('#prompt-title, #summary-title');$('#corrective-title').focus();
 }
 function summary(s){
  progress.textContent='SESSION COMPLETE';
  const firsts=s.items.filter(x=>!x.retry),tally=Object.fromEntries(RATINGS.map(r=>[r.id,firsts.filter(x=>x.rating===r.id).length])),now=Date.now();
  const rows=firsts.map(x=>{const st=reviewStatus(state.wordReviews,x.key,now),label=RATINGS.find(r=>r.id===x.rating)?.label||'';return `<li><span class="jp" lang="ja">${jp(words.get(x.word)?.word||x.word)}</span><span class="small">${esc(x.outcome==='stale'?'Not counted':label)} · ${esc(st.state==='new'?'New':st.state==='due'?'Due now':`Next ${formatWait(st.due-now)}`)}</span></li>`;}).join('');
  stage.innerHTML=`<section class="card recall-summary" aria-labelledby="summary-title"><h2 id="summary-title" tabindex="-1">Session complete</h2><p>Good ${tally.good} · Hard ${tally.hard} · Again ${tally.again}</p><ul class="review-results">${rows}</ul><p class="small">Ratings are your own judgement and set when each word returns. They are not a mastery score.</p><div class="actions"><button type="button" class="button" id="recall-finish">Finish</button><a class="button secondary" href="${backHref}">${all?'Back to your decks':'Back to the deck'}</a></div></section>`;
  $('#recall-finish').onclick=()=>{put(endSession(state.wordReviews));render('#overview-title');};
 }
 if(session()&&currentIndex(session())>=0)announce('Resumed your session.');
 render();
 if(sourceReturn===activeRoute){sourceReturn=null;if(main.querySelector('#source-link'))routeFocus='#source-link';}
}
function download(name,value,type='application/json'){const blob=new Blob([typeof value==='string'?value:JSON.stringify(value,null,2)],{type:`${type};charset=utf-8`});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
// Restores a backup. A version 1 or 2 backup migrates first, as browser storage does (recall.mjs migrateState). Lesson
// and practice answers (exercise results, review progress and the review-shown list) are plain values in answers; older
// backups' typed-answer, listening and reply data are accepted and left out, and so are the kanji parts and kanji meaning
// records retired in kanji Phase 3c and the removed lesson editor's draft (RETIRED_STATE). The learning loop's record
// (loop), kanji word stages (kanjiWords), the Kanji page's round (kanjiCards, whose {char} cards, left from the first
// course build, must be track characters) and the kanji set records (kanjiChars, every character and set a track one; a
// version 1 store migrates) are read strictly; a backup from before them
// starts with none. A backup carries kanjiChars because it exports the whole state. The switch (showAllKanji) comes from the backup's
// reading mode when it has none (readShowAll).
function validateBackup(raw){if(raw?.app!==profile.appTag||![1,2,STATE_VERSION].includes(raw.version))throw Error(`This file is not a compatible ${profile.name} backup.`);const v=migrateState(raw);if(!v||!Array.isArray(v.completed)||!v.completed.every(id=>lessons.lessons.some(l=>l.id===id))||typeof v.answers!=='object'||!v.answers||Array.isArray(v.answers)||typeof v.reviews!=='object'||!v.reviews||Array.isArray(v.reviews))throw Error(`This file is not a compatible ${profile.name} backup.`);for(const [id,a] of Object.entries(v.answers)){if(!(lessons.lessons.some(l=>l.id===id)||lessons.passages.some(p=>`passage-${p.id}`===id)||!!practiceOf(id))||typeof a!=='object'||!a||Array.isArray(a))throw Error('This backup contains invalid responses.');for(const val of Object.values(a)){if(!['string','number','boolean'].includes(typeof val)&&val!==null)throw Error('This backup contains invalid response fields.');}}const complete=[...new Set(v.completed)];const answers=cleanReasons(v.answers,true);return {version:STATE_VERSION,showAllKanji:readShowAll(v,{strict:true}),...readKanjiWords(v,{strict:true,wordIds:kanjiIndex.words}),...readKanjiCards(v,{strict:true,wordIds:kanjiIndex.words,rules:kanjiRules}),...readKanjiChars(v,{strict:true,chars:kanjiTrack.chars,sets:kanjiSetIds()}),completed:complete,answers,...readRecallState(v,lessons,{strict:true}),...readLoopState(v,lessons,{strict:true}),...readDictionaryState(v,lessons.vocabulary,{strict:true}),...readDeckState(v,lessons.vocabulary,{strict:true,practices:practiceIds()}),...readReadingEvidence(v,lessons.vocabulary,{strict:true,practices:practiceIds()}),...readReviewState(v,lessons.vocabulary,{strict:true}),...readDailyState(v,lessons,{strict:true}),...readPatternState(v,lessons,{strict:true}),...readTransferState(v,lessons,{strict:true}),...readProgressionState({...v,completed:complete},data.path,lessons.lessons,{strict:true}),...readCheckpointState(v,lessons,data.path,{strict:true}),outcomes:ensureLedger(readLedger(v,{strict:true}).outcomes,Date.now()),...readRecoveryState(v,lessons,{strict:true})};}
// A practice set (#practice/<id>): a unit-shaped set from lessons.json `practices`, shown one page at a time with the
// unit machinery (pages.mjs, unitPager): the opening (title, its home lesson's topic and length, Focus), the Words table,
// its points and drills, and the finish page. Results live in state.answers[<id>] under unit keys; a wrong answer is
// tried again until it is right, as in a lesson, with no reason checks. Finish is enabled once every counted item is
// solved. The first finish writes state.loop.practices[<id>] = {done} and names what it opened (loop.mjs opened), as
// text with one way back to Practice; a finished set shows no Finish button again. Do the exercises again clears the set's
// results (not its seen:<word> taps) and never its finish. The route guard renders it only while it is open, started or finished, so it has no locked page.
const practiceCtx=(id,onChange)=>({mode:'learn',seed:id,status:(key,it)=>statusOf(state.answers[id],key,it),unit(it,key,ok){const r=recordStatus(state.answers[id],key,it,ok),kw=kanjiWordsAnswer(practiceOf(id),it,ok),moved=kw!==state.kanjiWords;if(moved)announceMet(kw);if(r.changed||moved)commit({...state,...(r.changed?{answers:{...state.answers,[id]:r.record}}:{}),...(moved?{kanjiWords:kw}:{})});if(moved)refreshKanji();onChange();}});
function practiceRun(id,partId,from=''){
 const p=practiceOf(id);
 if(!p||practiceKind(p)!=='unit')return missing();
 if(practiceParts(p).length)return partId===undefined?partList(p,from):partRun(p,partId);
 const items=unitItems(p),topic=data.nodes.find(n=>n.id===lessonOf(p.home)?.node),ctx=practiceCtx(id,()=>update());
 let pager=null;
 const finishCard=`<section class="completion-card unit-finish" data-page-block="finish" aria-labelledby="unit-finish-title"><h2 class="unit-finish-title" id="unit-finish-title" data-page-heading tabindex="-1">Finish</h2><p class="unit-progress"><strong id="unit-count"></strong> <span class="small" id="unit-first"></span></p><div class="progress-track" aria-hidden="true"><span id="unit-bar"></span></div><button class="button full" id="finish-practice" disabled>Finish practice</button><p id="practice-status" class="small" role="status"></p><div class="page-left-slot" data-page-remaining></div><div class="unit-next hidden" id="practice-next"></div><button type="button" class="text-button hidden" id="practice-again">Do the exercises again</button></section>`;
 main.innerHTML=pagedHTML({cls:'lesson-page unit-page practice-run',back:'<a class="back-link" href="#practice">← Practice</a>',stageId:'practice-body',dock:trayHTML(false),
  stage:`<section class="unit-opening" data-page-block="opening"><p class="eyebrow">PRACTICE</p><h1 tabindex="-1">${esc(p.title)}</h1><p class="small lesson-meta">${withLength(esc(topic?.title||''),p.minutes)}</p>${focusHTML(p)}</section><div class="lesson-unit" id="text-columns" tabindex="-1" aria-label="Practice set">${wordsTableHTML(p,`practice:${id}`)}${unitHTML(p,p.sections,ctx,`practice:${id}`)}${finishCard}</div>`});
 function update(){
  const rec=state.answers[id],pr=progress(items,rec),done=!!state.loop.practices[id];
  $('#unit-count').textContent=`${pr.solved} of ${pr.total} correct`;$('#unit-first').textContent=pr.answered?`· first try ${pr.right} of ${pr.answered}`:'';$('#unit-bar').style.width=`${pr.total?Math.round(pr.solved/pr.total*100):0}%`;
  // A finished practice never shows Finish again (2026-10-29): only its status and, once every item is solved, Do the exercises again.
  $('#finish-practice').disabled=!pr.complete;$('#finish-practice').classList.toggle('hidden',done);$('#practice-again').classList.toggle('hidden',!pr.complete);
  $('#practice-status').textContent=pr.complete?(done?'Practice finished. Every item is correct.':'Every item is correct. You can finish the practice.'):done?`Practice finished. The exercises stay open · ${pr.total-pr.solved} to go.`:`Answer every item correctly to finish · ${pr.total-pr.solved} to go.`;
  pager?.refresh();
 }
 bindDrills($('#text-columns'),items,ctx);bindWordRefs();bindUnitWords(id,()=>pager?.refresh());bindDeckChoosers(main.querySelector('.practice-run'));renderTray();
 pager=unitPager(main.querySelector('.practice-run'),{model:unitPages({sections:p.sections},{words:wordRows(p).length,title:p.title}),state:x=>itemStanding(state.answers[id],items.find(it=>it.id===x)),wordsSeen:wordSeen(id)});
 update();
 const arrival=routeFocus&&main.querySelector(routeFocus);if(arrival)pager.reveal(arrival);
 $('#finish-practice').onclick=()=>{
  const pr=progress(items,state.answers[id]);if(!pr.complete||state.loop.practices[id])return;
  const before=withoutUnitWords(openNow(),p);
  commit({...state,loop:{...state.loop,practices:{...state.loop.practices,[id]:{done:Date.now()}}}});
  $('#finish-practice').classList.add('hidden');
  $('#practice-status').textContent=`Practice finished · first try ${pr.right} of ${pr.total}.`;
  {const box=$('#practice-next'),u=unlockedSince(before);box.innerHTML=unlockHTML(u,{none:'Practice finished.',href:'practice',label:'Practice'});box.classList.remove('hidden');pager.reveal(box);$('#unlock-title').focus();announceUnlocks(u);}
  toast('Practice progress saved.');
 };
 // Again: the set's results go (its finish and the words tapped stay) and the drills restart on the first item page.
 $('#practice-again').onclick=()=>{const first=pager.model.pages.find(x=>x.kind==='item'),{[id]:_,...answers}=state.answers,seen=seenKeys(state.answers[id]);if(Object.keys(seen).length)answers[id]=seen;commit({...state,answers});if(first)unitPlaces.set(activeRoute,pageKey(first));practiceRun(id);main.querySelector('.page-stage [data-page-block]:not(.off-page)')?.querySelector('[data-page-heading],h1,h2')?.focus({preventScroll:true});main.scrollTop=0;};
}
// A practice in parts (data-contract.md "Practice parts"). #practice/<id> is its part list: the opening (PRACTICE, the
// title, its home topic and whole length, Focus), then one row per part in the topic page's lesson-row style, its title,
// length and mark (done, a progress ring, an arrow), or its title greyed (lockedRow) while it is not open (loop.mjs
// partStates: part k opens once part k−1 is solved, and every part once the practice is finished). Back from a part, its
// row takes focus. #practice/<id>/<part> plays one part with the unit machinery (partRun).
// Sensei mode opens every part, as a finished practice does (loop.mjs partRoute follows).
const partStatesOf=p=>partStates(p,state.answers[p.id],sensei||!!state.loop.practices[p.id]);
function partList(p,from=''){
 const topic=data.nodes.find(n=>n.id===lessonOf(p.home)?.node),parts=practiceParts(p),href=x=>`#practice/${p.id}/${x.id}`;
 const row=(s,k)=>s.open?`<li><a class="lesson-row${s.done?' is-done':''}" href="${esc(href(s))}"><span class="lesson-row-title">${esc(s.title)}</span>${s.done?'':`<span class="lesson-row-meta">${lengthHtml(minutesFor(parts[k].keys.length))}</span>`}${rowMark(rowProgress(s.done?{done:true}:s))}</a></li>`:lockedRow(s.title);
 main.innerHTML=`<div class="node-page practice-parts"><div class="panel-toolbar"><a class="back-link" href="#practice">← Practice</a></div><section class="unit-opening"><p class="eyebrow">PRACTICE</p><h1 tabindex="-1">${esc(p.title)}</h1><p class="small lesson-meta">${withLength(esc(topic?.title||''),p.minutes)}</p>${focusHTML(p)}</section><section class="topic-section" aria-labelledby="parts-title"><h2 id="parts-title">Parts</h2><ol class="lesson-rows">${partStatesOf(p).map(row).join('')}</ol></section></div>`;
 if(from&&[...main.querySelectorAll('.topic-section a.lesson-row')].some(a=>a.getAttribute('href')===`#${from}`)){routeFocus=`.topic-section a.lesson-row[href="#${from}"]`;revealFocus=!scrollPositions.has(`practice/${p.id}`);}
}
// A part's unit: its words and sections, with the practice's word occurrences re-pathed into the part's sections (an
// occurrence keeps its index, which word cards read from the practice itself; one outside the part gets no path).
function partUnit(p,part){
 const occurrences=(p.occurrences||[]).map(o=>{const m=/^sections\/(\d+)(\/.*)?$/.exec(o?.path||''),i=m?Number(m[1]):-1;return {...o,path:i>=part.from&&i<part.to?`sections/${i-part.from}${m[2]||''}`:null};});
 return {id:p.id,title:part.title,focus:part.focus,words:part.words,sections:part.sections,occurrences};
}
// One part (#practice/<id>/<part>): the opening (PRACTICE, the part's title, the practice · topic · the part's length, its
// Focus), its Words table, its sections and a finish page, paged as a practice set is. Results go to state.answers[<id>]
// (item IDs are unique across the practice) and its page to 'unit-page:<part>'. A part before the last finishes with
// Finish part, once every item of the part is solved: "Part finished." and a link to the next part, with no loop state.
// The last part's Finish practice is the practice's finish, enabled once every counted item of the whole practice is
// solved: the first one writes state.loop.practices[<id>] = {done} and names what it opened, as a practice set's does.
// Do the exercises again clears this part's results only (resetItems), never the finish, and reopens its first item.
function partRun(p,partId){
 const id=p.id,parts=practiceParts(p),k=parts.findIndex(x=>x.id===partId);if(k<0)return missing();
 const part=parts[k],last=k===parts.length-1,after=parts[k+1]||null,unit=partUnit(p,part),items=unitItems(unit),all=unitItems(p);
 const topic=data.nodes.find(n=>n.id===lessonOf(p.home)?.node),ctx=practiceCtx(id,()=>update());
 let pager=null,partDone=false;
 const finishCard=`<section class="completion-card unit-finish" data-page-block="finish" aria-labelledby="unit-finish-title"><h2 class="unit-finish-title" id="unit-finish-title" data-page-heading tabindex="-1">Finish</h2><p class="unit-progress"><strong id="unit-count"></strong> <span class="small" id="unit-first"></span></p><div class="progress-track" aria-hidden="true"><span id="unit-bar"></span></div><button class="button full" id="finish-practice" disabled>${last?'Finish practice':'Finish part'}</button><p id="practice-status" class="small" role="status"></p><div class="page-left-slot" data-page-remaining></div><div class="unit-next hidden" id="practice-next"></div><button type="button" class="text-button hidden" id="practice-again">Do the exercises again</button></section>`;
 main.innerHTML=pagedHTML({cls:'lesson-page unit-page practice-run practice-part',back:`<a class="back-link" href="#practice/${esc(id)}">← ${esc(p.title)}</a>`,stageId:'practice-body',dock:trayHTML(false),
  stage:`<section class="unit-opening" data-page-block="opening"><p class="eyebrow">PRACTICE</p><h1 tabindex="-1">${esc(part.title)}</h1><p class="small lesson-meta">${withLength([p.title,topic?.title].filter(Boolean).map(esc).join(' · '),minutesFor(part.keys.length))}</p>${focusHTML(part)}</section><div class="lesson-unit" id="text-columns" tabindex="-1" aria-label="Practice part">${wordsTableHTML(unit,`practice:${id}`)}${unitHTML(unit,unit.sections,ctx,`practice:${id}`)}${finishCard}</div>`});
 function update(){
  const rec=state.answers[id],pr=progress(items,rec),whole=progress(all,rec).complete,done=!!state.loop.practices[id],left=pr.total-pr.solved;
  $('#unit-count').textContent=`${pr.solved} of ${pr.total} correct`;$('#unit-first').textContent=pr.answered?`· first try ${pr.right} of ${pr.answered}`:'';$('#unit-bar').style.width=`${pr.total?Math.round(pr.solved/pr.total*100):0}%`;
  $('#practice-again').classList.toggle('hidden',!pr.complete);
  if(last){
   $('#finish-practice').disabled=!whole;$('#finish-practice').classList.toggle('hidden',done);
   $('#practice-status').textContent=pr.complete?(done?'Practice finished. Every item is correct.':whole?'Every item is correct. You can finish the practice.':'Every item in this part is correct. Finish the earlier parts to finish the practice.'):done?`Practice finished. The exercises stay open · ${left} to go.`:`Answer every item correctly to finish · ${left} to go.`;
  }else{
   $('#finish-practice').disabled=!pr.complete;$('#finish-practice').classList.toggle('hidden',partDone);
   if(!partDone)$('#practice-status').textContent=pr.complete?'Every item in this part is correct. You can finish the part.':`Answer every item correctly to finish the part · ${left} to go.`;
  }
  pager?.refresh();
 }
 bindDrills($('#text-columns'),items,ctx);bindWordRefs();bindUnitWords(id,()=>pager?.refresh());bindDeckChoosers(main.querySelector('.practice-run'));renderTray();
 pager=unitPager(main.querySelector('.practice-run'),{model:unitPages({sections:unit.sections},{words:wordRows(unit).length,title:part.title}),state:x=>itemStanding(state.answers[id],items.find(it=>it.id===x)),wordsSeen:wordSeen(id)});
 update();
 const arrival=routeFocus&&main.querySelector(routeFocus);if(arrival)pager.reveal(arrival);
 $('#finish-practice').onclick=()=>{
  const box=$('#practice-next');
  if(!last){
   if(!progress(items,state.answers[id]).complete)return;
   partDone=true;$('#finish-practice').classList.add('hidden');$('#practice-status').textContent='';
   box.innerHTML=`<section class="unlock-reveal" aria-labelledby="part-done-title"><h2 class="unlock-title" id="part-done-title" tabindex="-1">Part finished.</h2><div class="actions"><a class="button" href="#practice/${esc(id)}/${esc(after.id)}">Next: ${esc(after.title)} <span aria-hidden="true">→</span></a></div></section>`;
   box.classList.remove('hidden');pager.reveal(box);$('#part-done-title').focus();return;
  }
  const pr=progress(all,state.answers[id]);if(!pr.complete||state.loop.practices[id])return;
  const before=withoutUnitWords(openNow(),p);
  commit({...state,loop:{...state.loop,practices:{...state.loop.practices,[id]:{done:Date.now()}}}});
  $('#finish-practice').classList.add('hidden');
  $('#practice-status').textContent=`Practice finished · first try ${pr.right} of ${pr.total}.`;
  {const u=unlockedSince(before);box.innerHTML=unlockHTML(u,{none:'Practice finished.',href:'practice',label:'Practice'});box.classList.remove('hidden');pager.reveal(box);$('#unlock-title').focus();announceUnlocks(u);}
  toast('Practice progress saved.');
 };
 // Again: this part's results go (the other parts', the finish and the words tapped stay) and it restarts on its first item page.
 $('#practice-again').onclick=()=>{const first=pager.model.pages.find(x=>x.kind==='item');commit({...state,answers:{...state.answers,[id]:resetItems(state.answers[id],items)}});if(first)unitPlaces.set(activeRoute,pageKey(first));practiceRun(id,partId);main.querySelector('.page-stage [data-page-block]:not(.off-page)')?.querySelector('[data-page-heading],h1,h2')?.focus({preventScroll:true});main.scrollTop=0;};
}
// ── Kanji (#kanji; docs/data-contract.md "Kanji cards" and "Kanji sets", learning-loop.md decision 18) ─────────────────
// Its own sidebar page, in the frame Learn, Practice and Reading share: a topline (かんじ KANJI), the body and one
// footnote; no captions, subheaders or counters beyond what each page below names. Its look is kanji-paper.css and
// kanji-washi.css (data-contract.md "Kanji paper"); the paper art is --kanji-art. kanjiPage picks the page: a profile with
// a kanji track (hasTrack(kanjiTrack), the course's にほんごチャレンジ kanji) gets the sets (kanjiSets, kanjiBoard,
// kanjiRead and kanjiPractice, after the round below); one without (the personal build) the daily round of word cards.
function kanjiPage(id,sub,from=''){
 if(!hasTrack(kanjiTrack))return kanjiRoundPage();
 if(id===undefined)return kanjiSets();
 return sub==='practice'?kanjiPractice(id):kanjiBoard(id,{from});
}
// The daily round of word cards (no track). The met words' collection is in Library → Dictionary (its Kanji words
// filter) and on the word card, not here. The rules are in kanji-cards.mjs.
// - The rules are the content's kanji policy (kanjiPolicy; kanji-policy.mjs, DEFAULT_POLICY for the personal build), the
//   numbers below being the default's. The round opens at opensAt met words. Before that the grid shows the met
//   words' cards, inert, with no caption and no link elsewhere.
// - Once open, the day's round of roundSize cards (kanji-words.mjs cardRound: words not yet known first, the fewest
//   passed trials first, then known words as review; the course list's words first under order 'course', and a word
//   whose course entry requires what is not met yet left out) is drawn once and saved in state.kanjiCards, so a reload
//   resumes it.
//   A card shows its word in kanji with no reading in the markup, and no text under it: a pass is the theme's circle, a
//   miss its faded ink, and the card's aria-label carries the word and its state ("お水, passed today").
// - Tapping an open card opens its trial in place of the grid (no new route; kanjiTrial): three questions, one after
//   another in one slip, each a block that stays as the next is added: the meaning, the reading, and which of three
//   sentences (in the learner's stages, with a blank) the word fits. The first wrong answer closes the card for today;
//   three right answers pass it. Each answer is saved with the round, so a reload resumes a trial part-way. On the first
//   pass a closed trial records the word (recordTrial: a pass is a point, one a day; a fail costs nothing) and logs a
//   kanji outcome. Back to the round returns to the grid, the card marked right or wrong once closed.
// - Once every card is closed the round is finished: Done today with the score, any word that became known today, and
//   a replay that reopens the cards with no points and no ledger entries.
const KANJI_ASKS={meaning:'What does this word mean?',reading:'How is this word read?',sentence:'Which sentence does it fit?'};
const KANJI_CARD_STATES={right:'passed today',wrong:'missed today'};
const kanjiTrials=points=>`${Math.min(points,kanjiPolicy.knownAt)} of ${kanjiPolicy.knownAt} trials`;
// The met kanji words in the order met, as kanji-cards.mjs collection gives them: the Kanji page counts them, and the
// Dictionary's Kanji words filter lists them.
const kanjiCollection=()=>collection(state.kanjiWords,{order:lessons.vocabulary.map(w=>w.id),keep:id=>words.has(id)});
// What a word card's trial is built from today (kanji-cards.mjs trialQuestions).
const kanjiTrialCtx=()=>({bank:kanjiBank,kw:state.kanjiWords,day:localDay(),index:kanjiIndex,policy:kanjiPolicy});
const kanjiTrialReady=id=>words.has(id)&&!!trialQuestions(id,kanjiTrialCtx());
// Today's round: the saved one when it was drawn today and still fits the content (every word still there and eligible,
// and every open card's trial still buildable), else a new one, saved at once. A round with every card closed is finished.
// Nothing is drawn before the round opens. met: the met word IDs in collection order; the opening counts them all, and
// the cards come from the eligible ones (eligibleWords: a word whose course entry requires loop refs gets a card once they
// are all met, against the loop progress as it stands), ranked by the course list under order 'course'.
function kanjiRound(met){
 let kc=state.kanjiCards;
 if(!roundOpen(met.length,kanjiPolicy))return kc;
 const progress=loopProgress(lockOpts(dueNow())),content=loopContent();
 const eligible=new Set(eligibleWords(met,{course:kanjiCourse,refMet:ref=>refMet(ref,progress,content)}));
 if(needsRound(kc,localDay(),kanjiPolicy)||!kc.cards.every((c,i)=>words.has(c.word)&&kanjiBank.has(c.word)&&eligible.has(c.word)&&(cardState(kc,i,kanjiPolicy)!=='open'||kanjiTrialReady(c.word)))){
  const next=startRound(cardRound(state.kanjiWords,kanjiIndex,words,{now:Date.now(),size:kanjiPolicy.roundSize,usable:id=>eligible.has(id)&&kanjiTrialReady(id),rank:kanjiPolicy.order==='course'?courseRank(kanjiCourse,met):null,reviewKnown:kanjiPolicy.reviewKnown}));
  if(!next.cards.length)return next;
  commit({...state,kanjiCards:next});kc=next;
 }
 const done=finishRound(kc,kanjiRules);if(done!==kc)commit({...state,kanjiCards:done});
 return state.kanjiCards;
}
// focus: {after: i} moves focus to the next open card after card i (the first from -1), or else to the done line.
function kanjiRoundPage(focus=null){
 const list=kanjiCollection(),met=list.map(x=>x.id),kc=kanjiRound(met),today=localDay();
 const g=todayGrid(kc,met,kanjiPolicy),sum=roundSummary(kc,state.kanjiWords,today,kanjiPolicy);
 // A cell's face: its word in kanji with no reading, brushed; and its name for the label.
 const face=c=>`<span class="kanji-card-word jp" lang="ja" style="${brushStyle(words.get(c.word).word)}">${jp(words.get(c.word).word,{display:'kanji',reveal:false})}</span>`;
 const name=c=>plainWritten(words.get(c.word).word);
 // An open card is a button; a closed one an image of its state.
 const cell=c=>c.kind==='blank'?'<li class="kanji-cell is-blank" aria-hidden="true"></li>'
  :c.kind==='inert'?`<li class="kanji-cell"><span class="kanji-card is-inert">${face(c)}</span></li>`
  :c.state==='open'?`<li class="kanji-cell"><button type="button" class="kanji-card" data-card="${c.index}" aria-label="${esc(name(c))}">${face(c)}</button></li>`
  :`<li class="kanji-cell"><span class="kanji-card is-${c.state}${focus&&focus.after===c.index?' is-fresh':''}" data-card-done="${c.index}" tabindex="-1" role="img" aria-label="${esc(name(c))}, ${KANJI_CARD_STATES[c.state]}">${face(c)}</span></li>`;
 // Nothing is written around the grid while it waits or plays: the cards themselves show the state. The done block's
 // known line names the round's words that became known today.
 const shown=sum?sum.known.map(id=>jp(words.get(id).word,{display:'kanji'})):[];
 const after=['waiting','none','playing','replay'].includes(g.phase)?''
  :`<div class="kanji-done"><p class="kanji-done-line" id="kanji-done-line" tabindex="-1"><strong>Done today</strong> · ${sum.right} of ${sum.total} right</p>${shown.length?`<p class="kanji-known"><strong>Shown in kanji with Show all kanji on:</strong> <span class="jp" lang="ja">${shown.join('、')}</span></p>`:''}<button type="button" class="button secondary" id="kanji-replay">Play the cards again</button><p class="small kanji-replay-note">A replay gives no points. A new round comes tomorrow.</p></div>`;
 const hint=g.phase==='playing'||g.phase==='replay'?'<span>Choose a card</span>':'';
 main.innerHTML=heading('Kanji','A round of cards a day from the kanji words you’ve met.')+`<section class="kanji-board" aria-label="Kanji cards">${KANJI_INK_DEFS}<div class="kanji-topline"><span><span lang="ja">かんじ</span><span>KANJI</span></span>${hint}</div><div class="kanji-body"><section class="kanji-round" aria-label="Today’s round"><div class="kanji-round-body" data-kanji-round><ul class="kanji-grid${g.open?'':' is-waiting'}" data-round-size="${kanjiPolicy.roundSize}" aria-label="Today’s round">${g.cells.map(cell).join('')}</ul>${after}</div></section></div><p class="kanji-footnote">One round a day, at your own pace.</p></section>`;
 main.querySelectorAll('[data-card]').forEach(b=>b.onclick=()=>kanjiTrial(Number(b.dataset.card)));
 const again=main.querySelector('#kanji-replay');
 if(again)again.onclick=()=>{commit({...state,kanjiCards:replayRound(state.kanjiCards)});kanjiRoundPage({after:-1});};
 if(focus){
  const open=[...main.querySelectorAll('[data-card]')],next=open.find(b=>Number(b.dataset.card)>focus.after)||open[0];
  (next||main.querySelector('#kanji-done-line')||main.querySelector(`[data-card-done="${focus.after}"]`))?.focus();
 }
}
// Card i's trial, in place of the grid: one .kanji-trial slip holding its questions as a list, each block (an <li>) kept
// as the next is added below it: the question, the word (.kanji-trial-word: kanji with no reading in the markup until the
// reading question is answered or the trial closes, then kanji with its reading), the options (.choices of .choice) and
// the feedback (.answer-feedback correct or incorrect). The questions are the policy's (kanjiTrialCtx), each headed by its
// prompt and its options drawn by its render (text, kana, or sentences in the learner's stages with their blank; once
// answered, the right sentence shows filled, the word with its reading). By the default policy the first miss closes the
// card (its feedback, then Back to the round) and the third right answer passes it (the pass line); with closeOnMiss
// false a miss shows its feedback and the next question follows, and the last answer closes the card. A trial left
// part-way reopens at its next question, the answered blocks shown right above it (a wrong one with no pick marked).
function kanjiTrial(i){
 const box=main.querySelector('[data-kanji-round]');let t=trialOf(state.kanjiCards,i,kanjiTrialCtx());
 const w=t?words.get(t.word):null;if(!box||!w)return;
 const total=state.kanjiCards.cards.length,n=t.questions.length;
 box.innerHTML=`<div class="kanji-trial" role="group" aria-labelledby="kanji-trial-count"><p class="eyebrow kanji-trial-count" id="kanji-trial-count"></p><ol class="kanji-trial-steps"></ol><div class="actions kanji-trial-back"><button type="button" class="text-button" id="kanji-back">Back to the round</button></div></div>`;
 const list=box.querySelector('.kanji-trial-steps'),count=box.querySelector('.kanji-trial-count'),back=box.querySelector('#kanji-back');
 back.onclick=()=>kanjiRoundPage({after:i});
 // The word's reading shows once its reading question is answered (or the trial closes), so no block gives it away; a
 // policy with no reading question shows it only at the close.
 const readAt=t.questions.findIndex(q=>q.ask==='reading');
 let shown=readAt>=0&&t.step>readAt;
 const face=()=>shown?jp(w.word,{display:'kanji-reading'}):jp(w.word,{display:'kanji',reveal:false});
 const reveal=()=>{shown=true;for(const p of box.querySelectorAll('.kanji-trial-word'))p.innerHTML=face();};
 const label=k=>{count.textContent=`CARD ${i+1} OF ${total} · QUESTION ${k+1} OF ${n}${t.scoring?'':' · REPLAY'}`;};
 const optionHTML=(q,o)=>q.render==='sentence'?`<span class="jp" lang="ja">${jp(o.ja)}</span>`:`<span${q.render==='kana'?' lang="ja"':''}>${esc(o.text)}</span>`;
 const meaningLine=extra=>`<p><span class="jp written-form" lang="ja">${face()}</span>${extra} · ${esc(w.meaning)}</p>`;
 function block(k){
  const q=t.questions[k];
  list.insertAdjacentHTML('beforeend',`<li data-trial-step="${k}"><h3 class="kanji-trial-q" id="kanji-trial-q-${k}" tabindex="-1">${esc(q.prompt||KANJI_ASKS[q.ask])}</h3><p class="jp kanji-trial-word" lang="ja" id="kanji-trial-word-${k}">${face()}</p><div class="choices drill-choices" role="group" aria-labelledby="kanji-trial-q-${k} kanji-trial-word-${k}">${q.options.map((o,j)=>`<button type="button" class="choice" data-pick="${j}" aria-pressed="false"><span class="choice-letter" aria-hidden="true">${LETTERS[j]??String.fromCharCode(65+j)}</span>${optionHTML(q,o)}</button>`).join('')}</div><div class="answer-feedback" data-trial-feedback role="status" aria-live="polite"></div></li>`);
  return list.lastElementChild;
 }
 // A block answered with `pick` (-1 for a wrong answer replayed: no option picked): its options locked, the right one
 // and a wrong pick marked, the right sentence filled in,
 // and its feedback, with `note` (the pass or close line) when the trial closes there.
 function settle(li,q,pick,note=''){
  for(const b of li.querySelectorAll('[data-pick]')){const j=Number(b.dataset.pick);lockButton(b);b.setAttribute('aria-pressed',String(j===pick));if(j===q.answer)b.classList.add('is-right');else if(j===pick)b.classList.add('is-wrong');}
  const right=q.options[q.answer],correct=pick===q.answer,fb=li.querySelector('[data-trial-feedback]');
  if(q.ask==='sentence')li.querySelector(`[data-pick="${q.answer}"] .jp`).outerHTML=`<span class="jp" lang="ja">${jp(right.filled,{display:'kanji-reading',words:[t.word]})}</span>`;
  const body=q.ask==='meaning'?meaningLine('')
   :q.ask==='reading'?meaningLine(` is read <strong lang="ja">${esc(right.text)}</strong>`)
   :`${correct?'':meaningLine('')}${right.en?`<p class="small">${esc(right.en)}</p>`:''}`;
  fb.className=`answer-feedback ${correct?'correct':'incorrect'}`;
  fb.innerHTML=`<strong>${correct?'Correct':'Not quite'}</strong>${body}${note?`<p class="small">${note}</p>`:''}`;
 }
 // The line under a closed trial: its pass (Passed · 2 of 3 trials), or that the card is closed with nothing taken away.
 // before and after: the word's record before and after the answer.
 function closeNote(out,before,after){
  const points=after?.points??0;
  if(!out.scoring)return 'A replay gives no points.';
  if(!out.passed)return before?.known?'Closed for today, with nothing taken away · its reading shows again until you read it right':`Closed for today, with nothing taken away · ${kanjiTrials(points)} passed`;
  if(before?.known)return 'Passed · a review of a known word';
  if(after?.known&&!before?.known)return `Passed · ${kanjiTrials(points)}. Known: shown in kanji when Show all kanji is on`;
  return points>(before?.points??0)?`Passed · ${kanjiTrials(points)}`:`Passed · today’s pass is already in · ${kanjiTrials(points)}`;
 }
 function bind(li,k){
  const q=t.questions[k];let done=false;
  for(const b of li.querySelectorAll('[data-pick]'))b.onclick=()=>{
   if(done||off(b))return;
   const pick=Number(b.dataset.pick),out=trialOutcome(t,pick);if(!out)return;
   done=true;
   const now=Date.now(),before=state.kanjiWords.words[out.word]||null;
   let kc=answerCard(state.kanjiCards,i,out.correct,kanjiRules),kw=state.kanjiWords,outcomes=state.outcomes;
   if(out.closes){
    kc=finishRound(kc,kanjiRules);
    if(out.scoring){kw=recordTrial(kw,out.word,out.passed,now,{knownAt:kanjiPolicy.knownAt});outcomes=logged(trialEvent(out.word,out.passed,{today:localDay(now),met:before?.met??null}),now);}
   }
   const moved=kw!==state.kanjiWords;
   commit({...state,kanjiCards:kc,kanjiWords:kw,outcomes});
   if(moved)refreshKanji();
   if(q.ask==='reading'||out.closes)reveal();
   settle(li,q,pick,out.closes?closeNote(out,before,kw.words[out.word]):'');
   const fb=li.querySelector('[data-trial-feedback]');
   if(out.closes){back.className='button';back.focus({preventScroll:true});revealFeedback(fb,back);return;}
   t={...t,step:k+1,misses:t.misses+(out.correct?0:1)};label(k+1);
   const next=block(k+1);bind(next,k+1);next.querySelector('.kanji-trial-q').focus({preventScroll:true});revealFeedback(fb,next);
  };
 }
 const answered=cardAnswers(state.kanjiCards,i);
 for(let k=0;k<t.step;k++)settle(block(k),t.questions[k],answered[k]===false?-1:t.questions[k].answer);
 label(t.step);
 const current=block(t.step);bind(current,t.step);current.querySelector('.kanji-trial-q').focus();
}

// ── The kanji sets (a track profile; data-contract.md "Kanji sets", "The sets in the app") ──────────────────────────
// The book's lessons as sets of ten (kanji-characters.mjs): the set list (#kanji), a set's board (#kanji/<set>), its
// reading pages in the board's place (kanjiRead, no route) and its practice (#kanji/<set>/practice, kanji-practice.mjs).
// kanjiRoute keeps a locked set out. Every Japanese line here is drawn by kanji-practice.mjs rubyHTML, never jp(): the
// book's words and the track's sentences are not vocabulary tokens, so Show all kanji never restages them. Red
// (.kanji-hot, the seal's vermilion) marks the kanji being learned: its reading over its own token in furigana, while a
// neighbouring kanji's reading stays black; in a question, the asked word. Mastery is undefined (owner, 2026-10-29): a
// finished practice opens the next set whatever its score, and nothing here records more than met, done and the run.
// Nothing about stroke order or writing, and nothing counts on these pages but the run's QUESTION n OF m.
const kanjiSetIds=()=>kanjiTrack.lessons.map(l=>l.id);
const kanjiSetOf=id=>kanjiTrack.lessons.find(l=>l.id===id)||null;
const KANJI_FOOT='Read each kanji, then practise the lesson to open the next.';
const KANJI_LEVELS={1:'N5',2:'N4'};
// The paper board: the topline (かんじ KANJI, and the hint when there is one), the body and the footnote.
const kanjiFrame=(label,hint,body)=>`<section class="kanji-board" aria-label="${esc(label)}">${KANJI_INK_DEFS}<div class="kanji-topline"><span><span lang="ja">かんじ</span><span>KANJI</span></span>${hint?`<span data-kanji-hint>${esc(hint)}</span>`:''}</div><div class="kanji-body">${body}</div><p class="kanji-footnote">${KANJI_FOOT}</p></section>`;
// A set's pill, in Practice's words: Locked; Ready (open, no kanji read and no practice under way); In progress (some
// kanji read, or all read and the practice not finished); Done (its practice finished once).
const kanjiPill=s=>s.status==='done'?'Done':s.status==='locked'?'Locked':s.read>0||kanjiRunOf(state.kanjiChars)?.set===s.id?'In progress':'Ready';
// The set list (#kanji): the sets under a small-caps subheader per part (PART 1 · N5, PART 2 · N4), each one row: the
// book's number within its part, its Japanese title in the brush font, its English title and its pill. An open set is a
// link to its board; a locked one the same row, faded and not a control (locks shown in place: no requirement, no link).
// On arrival the current set (the first not done) takes focus, scrolled into view.
function kanjiSets(){
 const list=setList(kanjiTrack,state.kanjiChars,kanjiOpts()),current=currentSet(kanjiTrack,state.kanjiChars);
 const row=s=>{
  const done=s.status==='done',inner=`<span class="kanji-set-no">${s.number}</span><span class="kanji-set-names"><span class="kanji-set-title" lang="ja">${esc(s.title)}</span><span class="kanji-set-en">${esc(s.en)}</span></span><span class="kanji-set-pill${done?' is-done':s.status==='locked'?' is-locked':''}">${done?'<span aria-hidden="true">✓ </span>':''}${kanjiPill(s)}</span>`;
  return s.status==='locked'?`<li class="kanji-set is-locked"><span class="kanji-set-row">${inner}</span></li>`:`<li class="kanji-set${done?' is-done':''}"><a class="kanji-set-row kanji-set-button" href="#kanji/${esc(s.id)}" data-set="${esc(s.id)}">${inner}</a></li>`;
 };
 const parts=[...new Set(list.map(s=>s.part))];
 const body=parts.map(p=>`<section class="kanji-part" aria-labelledby="kanji-part-${p}"><h2 class="kanji-subhead" id="kanji-part-${p}">PART ${p}${KANJI_LEVELS[p]?` · ${KANJI_LEVELS[p]}`:''}</h2><ol class="kanji-set-list">${list.filter(s=>s.part===p).map(row).join('')}</ol></section>`).join('');
 main.innerHTML=heading('Kanji','The book’s kanji, ten a lesson.')+kanjiFrame('Kanji lessons','Choose a lesson',body);
 if(current&&main.querySelector(`[data-set="${current}"]`)){routeFocus=`[data-set="${current}"]`;revealFocus=true;}
}
// A set's board (#kanji/<set>): its kanji in two rows of five on the folded paper (boardCells), each alone in the brush
// font: a read one in ink, a button that reopens its reading pages; the next one in the seal's vermilion, a button that
// opens them; every later one plain paper. The topline's hint: Tap the red kanji while one is next, Practise the lesson
// once all are read until the practice is done, then none. Under the grid, once every kanji is read, one button to the
// practice (Practise again, secondary, once the set is done). focus: a kanji whose cell takes focus (one returned from),
// or 'next' (the next cell, else the practice button); back from the practice its button takes focus.
function kanjiBoard(id,{focus=null,from=''}={}){
 const set=kanjiSetOf(id);if(!set)return missing();
 const kc=state.kanjiChars,cells=boardCells(kanjiTrack,kc,id,kanjiOpts()),status=setStatus(kanjiTrack,kc,id,kanjiOpts()),all=cells.every(c=>c.state==='read');
 const hint=cells.some(c=>c.state==='next')?'Tap the red kanji':status==='done'?'':'Practise the lesson';
 // In Sensei mode a later kanji is plain paper too, but a button that opens its reading pages (any order).
 const cell=c=>c.state==='hidden'?'<li class="kanji-cell is-blank" aria-hidden="true"></li>':c.state==='later'?`<li class="kanji-cell"><button type="button" class="kanji-card is-later" data-char="${esc(c.char)}" aria-label="${esc(c.char)}, not yet read"></button></li>`:`<li class="kanji-cell"><button type="button" class="kanji-card is-${c.state==='next'?'new':'read'}" data-char="${esc(c.char)}" aria-label="${esc(c.char)}${c.state==='next'?', read next':''}"><span class="kanji-card-word jp" lang="ja" style="${brushStyle(c.char)}">${esc(c.char)}</span></button></li>`;
 const practice=all||sensei?`<div class="kanji-done"><a class="button${status==='done'?' secondary':''}" id="kanji-practice" href="#kanji/${esc(id)}/practice">${status==='done'?'Practise again':'Practise the lesson'}</a></div>`:'';
 main.innerHTML=`<div class="panel-toolbar"><a class="back-link" href="#kanji">← Kanji</a></div>${heading(set.en,set.title)}${kanjiFrame(`${set.en}: kanji`,hint,`<div class="kanji-set-board" data-kanji-set><ul class="kanji-grid" data-cols="5" aria-label="${esc(set.en)}">${cells.map(cell).join('')}</ul>${practice}</div>`)}`;
 main.querySelector('.page-heading p')?.setAttribute('lang','ja');
 main.querySelectorAll('[data-char]').forEach(b=>b.onclick=()=>kanjiRead(id,b.dataset.char));
 if(from===`kanji/${id}/practice`&&main.querySelector('#kanji-practice'))routeFocus='#kanji-practice';
 if(focus)(main.querySelector(focus==='next'?'.kanji-card.is-new':`[data-char="${CSS.escape(focus)}"]`)||main.querySelector('#kanji-practice'))?.focus();
}
// A kanji's reading pages (kanjiRead), one screen each, each headed by an element marked data-lesson-heading that takes
// focus when it shows: (1) the kanji large in the brush font, its meanings and its story; (2) Sounds: On (katakana) and
// Kun (hiragana, the okurigana after a middle dot where the content has its hyphen: まな-ぶ → まな・ぶ), each with its
// romaji and the book's sound-changed variants small beside it (kana as printed, with its dash; romaji when given), an
// empty list left out; (3) Words, KANJI_WORDS_PAGE a page, core ones first as the content lists them and marked ★ as in
// the book: each its markup in furigana with this kanji's reading red (rubyHTML hot), its romaji and English; (4) Special
// readings, only when there are any, in the same form without the star; (5) In sentences: every sentence of the kanji in
// furigana (this kanji's reading red) with its English, on one page.
const KANJI_WORDS_PAGE=5;
function kanjiReadPages(e){
 const romaji=r=>r?` <span class="kanji-lesson-romaji">${esc(r)}</span>`:'';
 const variant=v=>` <span class="kanji-lesson-variant"><span lang="ja">${esc(v.kana)}</span>${romaji(v.romaji)}</span>`;
 const reading=(r,kun)=>`<li><span class="kanji-lesson-kana" lang="ja">${esc(kun?r.kana.replace('-','・'):r.kana)}</span>${romaji(r.romaji)}${(r.variants||[]).map(variant).join('')}</li>`;
 const group=(label,list,kun)=>list?.length?`<div><dt>${label}</dt><dd><ul class="kanji-lesson-list">${list.map(r=>reading(r,kun)).join('')}</ul></dd></div>`:'';
 const ja=markup=>rubyHTML(markup,{hot:e.char,show:'furigana'});
 const word=(x,core)=>`<li class="kanji-lesson-word${core?' is-core':''}"><span class="kanji-lesson-written" lang="ja">${ja(x.markup)}</span>${core?'<span class="kanji-lesson-star" aria-hidden="true">★</span><span class="sr-only"> (core word)</span>':''}${romaji(x.romaji)} <span class="kanji-lesson-en">${esc(x.en)}</span></li>`;
 const titled=(title,body)=>`<h3 class="kanji-lesson-h" data-lesson-heading tabindex="-1">${title}</h3>${body}`;
 const pages=[
  `<h3 class="kanji-lesson-char" lang="ja" data-lesson-heading tabindex="-1">${esc(e.char)}</h3><p class="kanji-lesson-meanings">${esc(e.meanings.join(', '))}</p><p class="kanji-lesson-story">${esc(e.story)}</p>`,
  titled('Sounds',`<dl class="kanji-lesson-readings">${group('On',e.on,false)}${group('Kun',e.kun,true)}</dl>`)
 ];
 const paged=(title,list,core)=>{for(let k=0;k<list.length;k+=KANJI_WORDS_PAGE)pages.push(titled(title,`<ul class="kanji-lesson-list kanji-lesson-words">${list.slice(k,k+KANJI_WORDS_PAGE).map(x=>word(x,core&&x.core)).join('')}</ul>`));};
 paged('Words',e.words,true);
 paged('Special readings',Array.isArray(e.special)?e.special:[],false);
 pages.push(titled('In sentences',`<ul class="kanji-lesson-list kanji-lesson-sentences">${e.sentences.map(s=>`<li class="kanji-lesson-sentence"><p class="kanji-lesson-ja" lang="ja">${ja(s.ja)}</p><p class="kanji-lesson-en">${esc(s.en)}</p></li>`).join('')}</ul>`));
 return pages;
}
// A kanji's reading pages in the board's place (no route): one .kanji-trial.kanji-lesson slip, its eyebrow the set's
// English title (nothing counting), one page at a time (kanjiReadPages) with Back (disabled on the first) and Next (Done
// on the last), and Back to the board; the topline's hint goes while it shows. Done marks an unmet kanji met (markCharMet,
// committed) and returns to the board with focus on the next cell (or the practice button once all are read); on a read
// kanji it only returns, to its own cell. Back to the board before that leaves an unmet kanji unmet: its pages start
// again from the first.
function kanjiRead(id,ch){
 const box=main.querySelector('[data-kanji-set]'),set=kanjiSetOf(id),e=kanjiTrack.chars.get(ch);
 if(!box||!set||!e||e.lesson!==id)return;
 const pages=kanjiReadPages(e);let at=0;
 main.querySelector('[data-kanji-hint]')?.remove();
 box.innerHTML=`<div class="kanji-trial kanji-lesson" role="group" aria-labelledby="kanji-lesson-eyebrow"><p class="eyebrow kanji-trial-count" id="kanji-lesson-eyebrow">${esc(set.en)}</p><div class="kanji-lesson-page" data-lesson-page></div><div class="kanji-lesson-nav"><button type="button" class="button secondary" id="kanji-lesson-back">Back</button><button type="button" class="button" id="kanji-lesson-next">Next</button></div><div class="actions kanji-trial-back"><button type="button" class="text-button" id="kanji-back">Back to the board</button></div></div>`;
 const page=box.querySelector('[data-lesson-page]'),prev=box.querySelector('#kanji-lesson-back'),next=box.querySelector('#kanji-lesson-next');
 const show=k=>{at=k;page.innerHTML=pages[k];page.dataset.lessonPage=String(k);prev.disabled=k===0;next.textContent=k===pages.length-1?'Done':'Next';page.querySelector('[data-lesson-heading]').focus();};
 prev.onclick=()=>{if(at>0)show(at-1);};
 next.onclick=()=>{
  if(at<pages.length-1){show(at+1);return;}
  const was=charStage(state.kanjiChars,ch)==='met',met=markCharMet(state.kanjiChars,ch,Date.now());
  if(met!==state.kanjiChars)commit({...state,kanjiChars:met});
  kanjiBoard(id,{focus:was?ch:'next'});
 };
 box.querySelector('#kanji-back').onclick=()=>kanjiBoard(id,{focus:ch});
 show(0);
}
// A question's slot, by kind: meaning the kanji (large); soundMatch its readings; wordReading the word as bare kanji, the
// tokens holding this kanji red; readingHere and chooseKanji the sentence, the rest in furigana and the asked word (the
// whole mark) red, as bare kanji (readingHere) or as its kana (chooseKanji).
const KANJI_SLOT_CLASS={meaning:' kanji-trial-char',soundMatch:' kanji-trial-readings',readingHere:' kanji-trial-sentence',chooseKanji:' kanji-trial-sentence',wordReading:''};
function kanjiSlot(q){
 if(q.kind==='meaning')return esc(q.char);
 if(q.kind==='soundMatch')return esc(q.readings);
 if(q.kind==='wordReading')return rubyHTML(q.word.markup,{hot:q.char,show:'kanji'});
 const {ja,mark}=q.sentence,at=ja.indexOf(mark);
 return `${rubyHTML(ja.slice(0,at))}<span class="kanji-hot">${rubyHTML(mark,{show:q.kind==='readingHere'?'kanji':'kana'})}</span>${rubyHTML(ja.slice(at+mark.length))}`;
}
// The feedback, the right answer whatever was picked (kanji-practice.mjs feedbackOf): Correct or Not quite, then its
// Japanese (markup, in furigana with this kanji's reading red) and its line, then the English when there is one.
function kanjiFeedback(q,correct){
 const f=feedbackOf(q);
 return `<strong>${correct?'Correct':'Not quite'}</strong><p>${f.ja?`<span class="jp" lang="ja">${rubyHTML(f.ja,{hot:q.char})}</span> `:''}${esc(f.right)}</p>${f.en?`<p class="small">${esc(f.en)}</p>`:''}`;
}
// A set's practice (#kanji/<set>/practice; kanji-practice.mjs, five questions a kanji): the store's run when it is this
// set's, else a new one (startRun with the time as its seed, committed; another set's run is replaced). Its questions are
// rebuilt from the run's seed, so a reload resumes at answers.length; when they cannot be built (a content fault) no run
// starts and the slip says so. heading(set, Practice) and the board holding one .kanji-trial slip: the eyebrow QUESTION n
// OF m, a thin <progress> of the answers given, then the current question: its prompt, its slot (kanjiSlot), four
// options A–D (render kanji in .kanji-choice-kanji) and the feedback. An answer is committed (answerRun); the options
// lock and are marked, the feedback shows, and Next takes focus. The last answer also finishes the run (finishRun,
// committed in the same step: the set is done, its first finish keeping its day), and its Next shows the finish: Done · n
// of m right; To read again: the missed kanji with their meanings, 、-joined (left out when none); Next lesson open:
// <the set this finish opened> (setsOpened) with a notice saying so (text only); Back to the lesson and Practise again (a
// new run). Back to the lesson part-way, or any navigation, keeps the run. Wrong answers count too: no pass mark.
function kanjiPractice(id){
 const set=kanjiSetOf(id);if(!set)return missing();
 let run=kanjiRunOf(state.kanjiChars);
 const seed=run?.set===id?run.seed:String(Date.now()),qs=practiceQuestions(kanjiTrack,set.kanji,seed);
 const page=body=>{main.innerHTML=heading(set.en,'Practice')+kanjiFrame(`${set.en}: practice`,'',`<div class="kanji-run-box" data-kanji-run>${body}</div>`);};
 if(!qs){page(`<div class="kanji-trial kanji-run"><p class="kanji-run-line">This lesson’s practice cannot be built from the content.</p><div class="actions"><a class="button" href="#kanji/${esc(id)}">Back to the lesson</a></div></div>`);return;}
 if(run?.set!==id){commit({...state,kanjiChars:startRun(state.kanjiChars,id,seed)});run=kanjiRunOf(state.kanjiChars);}
 page(`<div class="kanji-trial kanji-run" role="group" aria-labelledby="kanji-run-count"><p class="eyebrow kanji-trial-count" id="kanji-run-count"></p><progress class="kanji-run-progress" max="${qs.length}" value="0" aria-label="Questions answered"></progress><div class="kanji-run-step" data-run-step></div><div class="actions kanji-trial-back"><button type="button" class="text-button" id="kanji-back">Back to the lesson</button></div></div>`);
 const slip=main.querySelector('.kanji-run'),step=slip.querySelector('[data-run-step]'),count=slip.querySelector('#kanji-run-count'),bar=slip.querySelector('progress'),back=slip.querySelector('#kanji-back');
 back.onclick=()=>navigate(`kanji/${id}`,'backward');
 const optionHTML=(q,o)=>q.render==='kanji'?`<span class="kanji-choice-kanji" lang="ja">${esc(o.text)}</span>`:`<span${q.render==='kana'?' lang="ja"':''}>${esc(o.text)}</span>`;
 function ask(k){
  const q=qs[k];
  count.textContent=`QUESTION ${k+1} OF ${qs.length}`;bar.value=k;
  step.innerHTML=`<h3 class="kanji-trial-q" id="kanji-q" tabindex="-1">${esc(q.prompt)}</h3><p class="jp kanji-trial-word${KANJI_SLOT_CLASS[q.kind]??''}" lang="ja" id="kanji-q-slot" data-kind="${esc(q.kind)}">${kanjiSlot(q)}</p><div class="choices drill-choices" role="group" aria-labelledby="kanji-q kanji-q-slot">${q.options.map((o,j)=>`<button type="button" class="choice" data-pick="${j}" aria-pressed="false"><span class="choice-letter" aria-hidden="true">${LETTERS[j]??String.fromCharCode(65+j)}</span>${optionHTML(q,o)}</button>`).join('')}</div><div class="answer-feedback" data-run-feedback role="status" aria-live="polite"></div><div class="actions kanji-run-next" hidden><button type="button" class="button" id="kanji-next">Next</button></div>`;
  let done=false;
  for(const b of step.querySelectorAll('[data-pick]'))b.onclick=()=>{
   if(done||off(b))return;done=true;
   const pick=Number(b.dataset.pick),correct=pick===q.answer,last=k+1>=qs.length,answered=answerRun(state.kanjiChars,correct),after=last?finishRun(answered,Date.now()):answered;
   commit({...state,kanjiChars:after});
   for(const x of step.querySelectorAll('[data-pick]')){const j=Number(x.dataset.pick);lockButton(x);x.setAttribute('aria-pressed',String(j===pick));if(j===q.answer)x.classList.add('is-right');else if(j===pick)x.classList.add('is-wrong');}
   const fb=step.querySelector('[data-run-feedback]');fb.className=`answer-feedback ${correct?'correct':'incorrect'}`;fb.innerHTML=kanjiFeedback(q,correct);
   bar.value=k+1;
   const row=step.querySelector('.kanji-run-next'),next=row.querySelector('#kanji-next');row.hidden=false;
   next.onclick=()=>{if(last)finish(answered,after);else{ask(k+1);step.querySelector('#kanji-q').focus();}};
   next.focus({preventScroll:true});revealFeedback(fb,row);
  };
 }
 // before: the store with every answer and the run still open; after: the store once finished.
 function finish(before,after){
  const pr=practiceProgress(qs,before.run),missed=pr.missed.map(ch=>kanjiTrack.chars.get(ch)).filter(Boolean),opened=setsOpened(kanjiTrack,before,after,kanjiOpts()).map(kanjiSetOf).filter(Boolean);
  count.remove();bar.remove();back.closest('.actions').remove();slip.setAttribute('aria-labelledby','kanji-finish-line');
  step.innerHTML=`<div class="kanji-finish"><h3 class="kanji-finish-line" id="kanji-finish-line" tabindex="-1"><strong>Done</strong> · ${pr.right} of ${pr.total} right</h3>${missed.length?`<p class="kanji-finish-missed"><strong>To read again:</strong> ${missed.map(e=>`<span lang="ja">${esc(e.char)}</span> ${esc(e.meanings.join(', '))}`).join('、')}</p>`:''}${opened.length?`<p class="kanji-unlock"><strong>Next lesson open:</strong> ${opened.map(s=>esc(s.en)).join(', ')}</p>`:''}<div class="actions"><a class="button" href="#kanji/${esc(id)}">Back to the lesson</a><button type="button" class="button secondary" id="kanji-again">Practise again</button></div></div>`;
  step.querySelector('#kanji-again').onclick=()=>{commit({...state,kanjiChars:startRun(state.kanjiChars,id,String(Date.now()))});kanjiPractice(id);routeFocus=null;main.querySelector('#kanji-q')?.focus();};
  step.querySelector('#kanji-finish-line').focus();
  for(const s of opened)notices.show({id:`kanji-set:${s.id}`,kind:'kanji-round',title:`Kanji: ${s.en} is open`,ja:false});
 }
 const at=practiceProgress(qs,run).at;
 if(at<qs.length){ask(at);routeFocus='#kanji-q';return;}
 // A run with every answer in (cut short before its finish was saved) finishes now.
 const before=state.kanjiChars,after=finishRun(before,Date.now());commit({...state,kanjiChars:after});finish(before,after);routeFocus='#kanji-finish-line';
}
function guide(){
 // Read from the content: the topic of the first lesson on the Learn path, the lessons placed on it and its authored checkpoints.
 const core=data.path?.core||[],first=data.nodes.find(n=>n.id===lessons.lessons.find(l=>l.id===core[0])?.node)||data.nodes[0],cps=Array.isArray(data.path?.checkpoints)?data.path.checkpoints.length:0;
 main.innerHTML=heading('Course guide','How the course is organized, and the documents behind it.')+`<div class="two-col"><div class="card"><h2>How it works</h2><p>Each topic is a short course: a basic situation first, then changes and problems, then longer conversations. Extra vocabulary lessons reuse the same skills with new words.</p><p>Begin with ${esc(first?.title||'the first topic')}. As you start lessons, the next topics appear as blank stones; their names appear once a lesson inside opens. Topic pages put lessons in teaching order${cps?`, and ${plural(cps,'checkpoint')} along the way review what came before`:''}.</p><div class="stats"><span><strong>${data.nodes.length}</strong>topics</span><span><strong>${data.levels.length}</strong>levels</span><span><strong>${core.length}</strong>lessons on the path</span></div><p class="small">These levels are Niwa’s own. They are not JLPT or CEFR levels.</p></div><div class="card"><h2>Documents</h2><div class="doc-links"><a href="docs/start-here.md" download>Design decisions</a><a href="docs/learning-loop.md" download>The learning loop</a><a href="docs/requirements.md" download>Requirements</a><a href="docs/curriculum.md" download>Levels and topics</a><a href="docs/content-standard.md" download>Teaching and testing standards</a><a href="docs/lesson-template.md" download>Lesson and reading templates</a><a href="docs/roadmap.md" download>Roadmap</a><a href="docs/data-contract.md" download>Data format and tools</a></div></div></div><h2 class="section-label">What works today</h2><div class="card"><p>${data.nodes.length} topic outlines, ${lessons.lessons.length} lessons (${plural(lessons.lessons.filter(hasUnit).length,'textbook unit')} with words, patterns and drills), ${lessons.passages.length} reading passages, ${lessons.vocabulary.length} vocabulary entries, ${plural(unitPractices().length,'Practice set')}, flashcard decks and the Kanji page.</p><p>Every exercise is answered by tapping or dragging: there is no typing and no audio. Not available yet: speaking feedback, conversation practice and accounts that sync between devices. Locked lessons explain what opens them; unwritten titles are kept under Planned lessons.</p><div class="actions"><a class="button secondary" href="curriculum.json" download>Download curriculum data</a><a class="button secondary" href="lessons.json" download>Download lesson content</a></div></div><h2 class="section-label">References</h2><div class="card">${data.sources.map(s=>`<p><a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.title)} ↗</a><br><span class="small">${esc(s.use)}</span></p>`).join('')}<p class="small">Niwa’s lessons and texts are original. Reference materials stay on their owners’ sites.</p></div>`;
}

function registerTools(){
 const ctx=document.modelContext;if(!ctx?.registerTool)return;
 const lifecycle=new AbortController();
 const definitions=[{name:'get_curriculum_outline',title:'Read the curriculum',description:'Read the topic nodes, personal levels, and available lesson IDs. Does not change progress.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true,untrustedContentHint:false},execute(input){if(input&&Object.keys(input).length)throw Error('No parameters accepted.');return {levels:data.levels,nodes:data.nodes.map(n=>({id:n.id,title:n.title,level:n.level,status:n.status})),lessons:lessons.lessons.map(l=>({id:l.id,title:l.title}))};}},
 {name:'open_curriculum_lesson',title:'Open a lesson',description:'Navigate to an existing teaching sample. Does not complete it or grade a response.',inputSchema:{type:'object',properties:{lessonId:{type:'string'}},required:['lessonId'],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},async execute(input){if(!input||Object.keys(input).some(k=>k!=='lessonId')||!lessons.lessons.some(l=>l.id===input.lessonId))throw Error('Unknown lesson ID.');const target=`lesson/${input.lessonId}`;if(learnRoute(target,data.path,lessons.lessons,data.nodes,lockOpts())!==target)throw Error('This lesson is locked. Open Learn to see your available lessons.');await navigate(target,'forward');return {opened:input.lessonId,progressChanged:false};}}];
 for(const tool of definitions){try{Promise.resolve(ctx.registerTool(tool,{signal:lifecycle.signal})).catch(()=>{});}catch{}}
 window.addEventListener('pagehide',()=>lifecycle.abort(),{once:true});
}
// normalize: a learner state as the app runs it, read against the loaded content (every store's reader, the retired
// keys dropped). Startup runs it on the saved state; Sensei mode on a fresh one, and on the saved one again when it ends.
function normalize(s){if(!Array.isArray(s.completed)||!s.answers||!s.reviews)throw Error();s.completed=s.completed.filter(id=>lessons.lessons.some(l=>l.id===id));Object.assign(s,readKanjiWords(s,{wordIds:kanjiIndex.words}),readKanjiCards(s,{wordIds:kanjiIndex.words,rules:kanjiRules}),readKanjiChars(s,{chars:kanjiTrack.chars,sets:kanjiSetIds()}),readRecallState(s,lessons),readDictionaryState(s,lessons.vocabulary),readLoopState(s,lessons),readDeckState(s,lessons.vocabulary,{practices:practiceIds()}),readReadingEvidence(s,lessons.vocabulary,{practices:practiceIds()}),readReviewState(s,lessons.vocabulary),readDailyState(s,lessons),readPatternState(s,lessons),readTransferState(s,lessons),readProgressionState(s,data.path,lessons.lessons),readCheckpointState(s,lessons,data.path),{outcomes:ensureLedger(readLedger(s).outcomes,Date.now())},readRecoveryState(s,lessons));s.answers=cleanReasons(s.answers);for(const k of ['production','listening','replies','conversations',...RETIRED_STATE])delete s[k];s=syncDeckDiscovery(s);s.recovery=migrateLeeches(s,lessons,Date.now());return s;}
// Switching Sensei mode re-renders the current page on the other state: on, a fresh one; off, the saved one re-read
// from localStorage (never written meanwhile). The route goes through the guard again, so a page locked for real lands
// where it lives. The switch keeps focus and the page its scroll.
const SENSEI_NOTE='<span class="sensei-note" id="sensei-note">Everything is open. Nothing is saved.</span>';
function senseiSwitch(){const b=$('#sensei-switch');b.setAttribute('aria-pressed',String(sensei));document.body.classList.toggle('is-sensei',sensei);const note=$('#sensei-note');if(sensei&&!note)b.insertAdjacentHTML('beforebegin',SENSEI_NOTE);else if(!sensei&&note)note.remove();}
function setSensei(on){
 sensei=on;try{if(on)sessionStorage.setItem(SENSEI_KEY,'1');else sessionStorage.removeItem(SENSEI_KEY);}catch{}
 state=normalize(on?freshState():loadSaved());deckUndo=null;justUnlocked=null;collectQueue=[];unitPlaces.clear();
 senseiSwitch();storageFooter();kanjiSwitch();
 const top=main.scrollTop;activeRoute='';route();main.scrollTop=top;$('#sensei-switch').focus({preventScroll:true});
}
$('#sensei-switch').onclick=()=>{if(data)setSensei(!sensei);};
async function start(){try{[data,lessons]=await Promise.all(['curriculum.json','lessons.json'].map(f=>fetch(f).then(r=>{if(!r.ok)throw Error();return r.json();})));kanjiPolicy=readKanjiPolicy(lessons);kanjiRules=rulesOf(kanjiPolicy);kanjiTrack=readKanjiCharacters(lessons);wordPacks=readWordPacks(lessons);const nouns=readProperNouns(lessons);kanjiIndex=kanjiWordIndex(lessons.vocabulary,{proper:[...PROPER_NOUNS.names,...PROPER_NOUNS.places,...nouns.names,...nouns.places]});kanjiCourse=readKanjiCourse(lessons,{wordIds:kanjiIndex.words});kanjiBank=trialBank(lessons,kanjiIndex);state=normalize(state);words=indexWords(lessons.vocabulary);senseiSwitch();storageFooter();kanjiSwitch();route();registerTools();window.addEventListener('hashchange',route);window.addEventListener('popstate',route);}catch{main.innerHTML='<div class="empty">The curriculum could not load. Please reload this page. If you opened the files directly, use the preview link instead.</div>';}}
start();
