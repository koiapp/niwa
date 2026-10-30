# Reusable authoring templates

Copy the relevant section into a new document, write the unit file in `tools/units/` (or the practice in `tools/practices/`), then run the seed and `node tools/validate.mjs`, which checks it with the unit rules. (The in-app lesson editor was removed on 2026-10-23, [data-contract.md](data-contract.md#lesson-editor).) Teaching rules behind these fields are in [content-standard.md](content-standard.md); the sequence and arc each lesson belongs to are in [curriculum.md](curriculum.md).

## Node brief

- Stable ID / name / entry level:
- Arc(s) in the sequence:
- Situation and boundaries:
- Venues used (from the venue catalogue, plus any new ones):
- Why the learner needs it:
- Entry skills; placement task (node level):
- Observable can-do outcomes:
- Core stage; deeper stages; exit task for each:
- Essential vocabulary categories:
- Shared grammar and discourse skills; bridges required (A–F):
- Reading and text types:
- Passage types and their recall mode:
- Recognition-only versus active targets (used in building and applied drills):
- Kanji words introduced in context:
- Vocabulary expansions and readiness:
- Cross-topic transfer, and the venue used for delayed transfer:
- Capstone variations and rubric:
- Source / license / author / reviewer / version:

## Venue brief

Use this to add a venue to the open catalogue without changing the curriculum's structure.

- Venue name and family:
- Host node(s), or "candidate node" with a reason:
- First reachable arc and the shared skills it reuses:
- Typical partners and relationship (staff, stranger, neighbor, friend):
- What the learner needs to do there (2–4 can-dos):
- Recognition-only service language used by staff there:
- Written language seen there (signs, forms, machines), with kanji words and readings:
- One complication that commonly happens:
- Delayed transfer use: which taught venue's skills it tests:
- Safety, legal, or health sensitivity, and the review it needs:
- Sources consulted / author / reviewer:

## Unit brief

Every lesson is a textbook unit ([content standard](content-standard.md#a-complete-lesson)). Complete the fields below, then check the displayed order: Focus, Words, first Point, word/use checks, kanji work, remaining Points/checks, conversation and final. tools/lesson-pacing.mjs applies this to lesson sources; practices retain authored order. Every item is tap or drag, with no typing, speaking or audio.

**ID / node / venue / stage / arc / title.** Estimated minutes follow from the item count (about 3 + items ÷ 3). They stay internal; learners see only the length label (Short, Medium or Long).

**Can-do:** I can [communicative task] with [partner] under [conditions/support].

**Scene:** Who is speaking, where, with what relationship, and what does each person want?

**Focus:** One or two sentences in textbook style, shown on the lesson's opening page, before the words: what the unit covers and what to practise, naming its patterns in Japanese with readings ([content-standard.md](content-standard.md#focus)). Authored as `focus` in `tools/units/<id>.mjs`; the validator requires it. Orient the learner without restating a point's explanation or giving a drill's answer, and ask nothing: no questions or guesses before teaching.

**Prerequisites:** Known words and patterns from earlier lessons, and chunks that will only be recognized. Drills may test only these and this unit's own words and patterns.

**Words (6–12, in display order):** for each, the vocabulary ID (reuse an existing one; a new word needs written form, kana reading, meaning, word type, a one-sentence definition, an example, and its pack), the particle frame if it takes one (［N］を ください), and "recognize" for words to understand but not use.

**Words checks:** normally 6–8 matching pairs (the validator accepts 3–8) and 3–5 meaning-in-context choices; trim only clear duplicates. Do not repeat the kanji meaning checks.

**Kanji words drill (after initial use of the first Point):** name the 1–3 kanji words this unit introduces, chosen because the learner will see them written in this venue and their meaning is plain. Open with each word in kanji, with its reading, in a sentence from the scene. Then, for each word, one multiple-choice item on its meaning in a sentence and one on its reading with the reading hidden; do not add a solved example question ([content-standard.md](content-standard.md#kanji-words-in-lessons)). Take wrong options from other met kanji words and this unit's words, all of one kind per item; never a kanji the learner has not met. Optionally add one まとめ item that finds a kanji word on a menu, sign or receipt card. Keep the distinct meaning and reading checks; trim repeated point drills or duplicate まとめ items to make room. Write every other kanji word in `{written|reading}` markup as usual: the app shows it in the learner's stage for it (kana, kana with the kanji above, or kanji). Mark items whose spelling must stay fixed (reading questions, spelling pairs, answers that are the kana itself). No parts, labels or character histories. Format, as built in f01: a `choice` set with `kanjiWords` (the 1–3 IDs), `intro` (one `{word, ja, en}` per word, in the same order) and `sentences` (one `{word, ja, answer, en, slot}` per word, in the same order: a new sentence for the word's Kanji card trial, `ja` with one blank ＿ that `answer` fills, `slot` what the blank takes, written so the blank demands the word's meaning; [content-standard.md](content-standard.md#kanji-words-in-lessons)), whose items each name a `kanjiWord` and an `ask` of `meaning` or `reading` and underline the word with `mark`. A reading item's choices are kana and its right one is the mark's plain reading. The まとめ item is `ask: 'find'` with a `card`. The app fixes the spelling of these items itself: the target shows in kanji, its reading hidden until the item is solved, and feedback shows kanji with readings. The full rules are in [data-contract.md](data-contract.md#kanji-words-drill-phase-3-unit-format).

**Points (2–3), each with:**

- Title, and the pattern with slots in ［ ］.
- Explanation: at most three sentences and 60 words, plain English, the job the pattern does here.
- 2–4 contrasting examples, Japanese with English.
- Optional caution: one line.
- About 8–14 checks straight after it, covering meaning/form, one useful sentence build, and application. For each set give its format, instruction and items, without worked examples or embedded model answers. Keep the existing progression and useful scaffolded builds; trim only obvious repetitions of the same particle or phrase.
- For each retained check, state what new evidence it adds. A format change alone does not justify repeating the same decision.

**Conversation:** original dialogue with speaker turns, Japanese with readings, and an English meaning for each line. Then 2–3 intention or implication questions and/or a word-bank completion of a changed version (3–5 gaps; the bank holds the answers plus one or two that do not fit).

**まとめ Review:** usually 4–10 mixed checks, each naming its format. Cover the central distinction and a changed constraint or intention; use a build or ★ item where useful. Do not repeat every earlier task.

**Reason checks:** nothing to author, but in each pattern-tagged multiple-choice and fill-the-gap item (a grammar or particle choice; untagged vocabulary and meaning items never ask, since 2026-10-29) the right option's feedback line becomes a reason the learner picks from, beside the right-option lines of two other items in the same drill ([content-standard.md](content-standard.md#reason-checks)). Write each right-option line about its own item (its word, number or situation) so it cannot also justify another item's answer in the drill. Where two lines would state the same general rule, give one of the items `reasons: false`; a drill left with fewer than three different lines among its tagged items asks nothing, and `reasons: false` on the drill says so plainly.

**Shared patterns:** when a point teaches a structure in the pattern catalog (`tools/patterns.mjs`, for example `request-wo` for ［N］を ください), give the point that `patternId`; give the same `patternId` to each drill set or item, in any lesson, that tests that structure, and to nothing that only contains it. A new shared structure gets a catalog entry with one contrast first. Every unit needs at least one tagged drill whose pattern a lesson in another topic also drills; `tools/validate.mjs` warns about a unit without one and a pattern drilled in one topic only. See [data-contract.md](data-contract.md#grammar-patterns).

**Every item:** an answer key; one line of feedback per option for multiple choice and fill the gap (the right option says why; each wrong option names the mistake); one or two sentences of explanation for tiles, ★, matching, sorting, true/false, and word-bank items; any alternative tile orders that are also correct. Distractors are plausible learner errors, never a second defensible answer.

**Item total:** preserve the established lesson scope, generally 35–50 counted checks, with a hard maximum of 50. When revising an existing lesson, trim lightly (about 10–15% in the current audit) and keep distinct learning steps. Matching/sorting count per pair/card and cloze per gap. No per-word repetition quota. Record which repeated substitutions belong in the home lesson’s Practice set.

**Reviews:** optional due runs are available in Practice. Supply changed-context checkpoint recipes with accurate prerequisite declarations; the review mixes eligible recipes, focused misses and original drills. Do not pad lessons to supply a fixed number of reviews. Reading has its own due recall surface.

**Checkpoint recipes (3–4):** items for the cumulative checkpoint, exported as `checkpoint` beside `unit`, covering at least two different words-table rows or points ([content-standard.md](content-standard.md#checkpoint-recipes)). Each recomposes one of this unit's frames with another taught word in a venue the frame was not taught in, and lists every word it shows. For example:

```js
export const checkpoint=[
  { id:'f01-X1', target:{point:'f01-p1'}, frame:'f01-p1', example:0, slot:'riceball', venue:'station', taught:'cafe', uses:['f03'],
    words:['sumimasen','riceball','kudasai'], format:'blank',
    ja:'すみません。おにぎり（　）ください。', en:'At a station kiosk: Excuse me, a rice ball, please.', choices:['を','は'], correct:0,
    feedback:['を marks the rice ball you are asking for.','は makes it a topic; a request with ください needs を.'] },
  { id:'f01-X4', target:{word:'douzo'}, venue:'station', taught:'cafe', words:['douzo'], format:'truefalse',
    statement:'At a ticket window, the clerk slides your ticket across and says どうぞ. Here it means “here you are”.', answer:true,
    explain:'どうぞ is said while handing something over.' },
];
```

A matching item or word-bank dialogue takes `targets`, one per pair or gap. `uses` names other lessons the item needs, never one after this unit's checkpoint.

**Kanji:** For each kanji word the unit introduces: written word, contextual reading, meaning, the sentence it is introduced in, and the sentences its meaning and reading items use. List the items whose spelling stays fixed.

**Reflection:** What can the learner not yet do after this unit? What is the smallest useful next lesson?

**Review state:** Draft / reviewed / piloted / released. Record reviewer and date.

## Passage brief

- ID, node, venue, arc, title, real-world text type, and reason to read:
- Home lesson, prerequisites, and optional (yes / no): an optional book is for a niche situation and may build on optional practices:
- Intended difficulty and prerequisite structures:
- Estimated known-word coverage before glossary (target 95–98%):
- Recall mode for this arc (open book / closed-book recognition / cued recall / idea-unit / summary and synthesis):
- Focus (the recall purpose): what to follow and remember, in one or two sentences, without the answers:
- Original Japanese paragraphs, with every kanji word supported:
- Glossary of phrases that are necessary but not yet taught:
- Optional translation:
- Idea units: ID / proposition / evidence span / critical (yes or no):
- Immediate closed-book questions (at least four, three or more functions):
  - Gist / accepted answers:
  - Idea-unit checks (said / contradicted / not mentioned) / evidence:
  - Detail or condition / exact evidence:
  - Sequence reconstruction, if the text has an order:
  - Reference / antecedent and explanation:
  - Inference / evidence and limits:
  - "What cannot we conclude?":
- Practical response question / answer choices / answer key / feedback for each option:
- Delayed recall questions for 1, 3, and 7 days (and 30 days from Arc 7), different from the immediate set and sampling critical idea units first:
- Language harvest: 2–3 phrases that become review items, each with its passage sentence:
- Recovery sentences: three new sentences per harvested phrase, in a new situation, using only taught words and kanji (tools/recovery-sentences.mjs):
- Unseen transfer passage or scenario for the consolidation week:
- Language and cultural review:

## Vocabulary expansion brief

- Node and + number:
- Optional (yes / no): optional for a niche, less general situation; only general content counts toward a lesson's minimum, and general content never depends on optional content:
- Theme and reason it is useful:
- Readiness and shared structures to reuse:
- Word categories and approximately 6–8 active chunks per session:
- Entries: ID, written form, reading, meaning, collocation, example, notes, source:
- Recognition-only words:
- Any new grammar bridge, explicitly labeled:
- Recombination scenario using several new entries:
- Delayed transfer into another node:
- Exit evidence and rubric:

## Arc consolidation brief

- Arc number, nodes and stages covered:
- Delayed retrieval set: items and the minimum gap since last practice (default 7 days):
- Unseen passages, using the passage brief and this arc's recall mode:
- Delayed transfer task in a venue not used in the arc's teaching:
- Capstones due this arc:
- Gate rubric and the default thresholds applied:
- Gap routing: which review or bridge lesson each failed can-do points to:

## Authoring request to reuse with an assistant

Create one original Japanese lesson as a textbook unit, using the unit brief above. The learner knows hiragana and katakana but no kanji beyond the words listed for earlier arcs. Focus on the chosen venue, situation, and observable outcome. List 6–12 words with their particle frames, marking recognition-only words. Choose 1–3 kanji words from the word table to introduce, and add a kanji words drill after the word drills: each word in kanji with its reading in a sentence from the scene, then one item on its meaning and one on its reading with the reading hidden, with wrong options taken only from kanji words the learner has met; never split a kanji into parts or tell its history. Teach two or three points one at a time: a pattern box, an explanation of at most three sentences, and 2–4 examples, each followed at once by a recognition drill, a controlled-building drill with fading support, and an applied drill, with only the instruction and questions, without solved examples. Then give a realistic polite dialogue with a few interpretation checks and/or a word-bank completion, and close with 4–10 mixed review checks, including transfer. Preserve the lesson’s structure and useful scaffolded practice; trim only clear duplicates. Use only the eight tap or drag formats: no typing or speaking prompts, and no audio unless the owner has asked for it. Keep the established scope (generally 35–50 counted items, with no padding quota and a maximum of 50). Further repetition and substitution drills belong in Practice. Every item needs an answer key and one-line feedback that says why the right option is right and names the mistake in each wrong one; distractors are plausible learner errors, never a second defensible answer. Support every kanji with a reading everywhere, including Japanese inside English prompts and feedback. Never repeat the explanation in instructions or feedback, and never use the same sentence as an item in two drills. Mark the material as a draft for educator review. Do not claim a universal politeness rule or certify fluency from a quiz. Identify prerequisite grammar and any language introduced only as a useful chunk.

For a passage, use the passage brief: list idea units with evidence spans, write closed-book immediate questions and a separate set of delayed questions, and keep every graded question in single-choice form with feedback for each option.
