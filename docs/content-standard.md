# Teaching and content standard

## A complete lesson

A lesson teaches a small set of core ideas and checks whether the learner understands and can use them. Introduce the words, explain one point at a time, follow it with a few purposeful checks, then use a conversation and a short mixed review. Repetition for fluency and retention belongs mainly in Practice. There is no requirement for exercises to occupy a fixed share of a lesson. Every item is answered by tap or drag ([Input policy](#input-policy)). Use the unit brief in [lesson-template.md](lesson-template.md#unit-brief).

Each lesson contains, in this order:

1. **Scene.** A concrete situation, speakers, relationship, purpose, and outcome, set in a named venue.
2. **Focus.** One or two sentences, read before the words: what the unit covers and what to practise, naming its patterns ([Focus](#focus)).
3. **Words.** A table of 6–12 words: Japanese with readings, meaning, word type, and the particle frame the word is used in, Genki style (［N］を ください). Words the learner only needs to understand, such as staff honorifics, carry a small "recognize" tag.
4. **First Point and words checks.** Show the first useful pattern immediately after Words, before any question. Keep purposeful word checks and move the kanji drill after initial use of the Point, retaining distinct meaning and reading checks.
5. **Points, one at a time (usually 2–3).** A pattern box, an explanation of at most three sentences and 60 words, 2–4 contrasting examples and one caution line at most. New authoring should budget about 8–14 checks per Point across these purposes; existing checks remain after the 25 October reorder pending learner pacing evidence:
   - meaning or form: distinguish the important alternatives, rather than filling the same particle with several nouns;
   - building: keep useful sentence-building progression and fade support; trim only repeated builds with equivalent demands;
   - application: interpret a reply, diagnose an error, choose evidence, or adapt to a changed constraint.
6. **Conversation.** Speakers and per-line meanings, followed by a few questions about intention, implication or what changed, and a word-bank dialogue where it tests the exchange as a whole. Preserve both when they serve different purposes.
7. **まとめ Review.** Usually 4–10 mixed checks: cover the key distinction and a changed situation. Include a sentence-building or ★ item where it adds evidence. Do not replay every earlier drill.
8. **Kanji words:** the 1–3 words the lesson introduces in kanji, and any items whose spelling must stay fixed.
9. **Reading support, provenance, and editorial review state.**

The app shows one page at a time: opening/Focus, Words at eight rows per page (Next opens once every word on the page has been tapped, 2026-10-29), first Point, word/use checks and then kanji, remaining Points/checks, conversation, final and finish ([phone interaction](requirements.md#phone-interaction-requirements)). Lesson/practice page keys survive reloads, so a lesson can be left on any page. Write each item to stand alone under its instruction and keep a Point's explanation and examples readable on one screen.

Preserve the lesson’s established scope and structure. The owner requested a **slight cutdown**, not a compressed lesson: this audit removes about 10–15% of exercises, usually 5–7 obvious duplicates. Existing lessons generally sit in the **35–50 counted-item** band; use fewer if appropriate, without cutting distinct learning steps. The validator permits 1–50: its minimum only rejects empty content. Counts are a pacing guardrail, not a reason to add questions. Matching and sorting count per pair/card, and a word-bank dialogue per gap. Estimated minutes remain 3 + items ÷ 3; learners see Short, Medium or Long instead of minutes.

Explanations appear once, in the point's box. Instructions and feedback never restate them, and no panel repeats an earlier one.

Each lesson item is checked when answered; mistakes can be retried and first-try results remain. Completion requires eventually correcting every item. The optional delayed lesson reviews in Practice were removed on 2026-10-29 at the owner's direction; reviews stay parked ([Delayed review and transfer](#delayed-review-and-transfer)).

The 39 lessons present on 24 October 2026 were reviewed for repeated exercises ([dated lesson audit](lesson-audit.md)); tr03 was authored afterward. The [current inventory](content-inventory.md#pacing-measures) gives today’s lesson and practice counts, and the [curriculum audit](curriculum-audit.md) records the remaining pacing and teaching work. Their separate Practice sets supply further retrieval and variation. The six optional practices converted from former lessons retain their longer form. All teaching content remains draft until educator review.

### Lessons, practices and books

The three kinds of content form one loop, defined in [learning-loop.md](learning-loop.md) and decided on 22 October 2026.

- **Lessons** come first. They teach and check understanding of core material with limited repetition, and require only other lessons.
- **Practices** provide repeated retrieval and expand how that material is used: changed wording, more natural and casual forms, variety by context, grammar differences, more vocabulary and nicher situations.
- **Books** put lessons and practices into a situation the learner works through from memory.
- **Optional content** is welcome. Some activities are meant to be more optional than others, for niche, less general situations. Optional content is always an optional practice, which can unlock optional books. A lesson is never optional, and nothing general depends on optional content ([learning-loop.md](learning-loop.md#optional-content)).

A practice or a book can require any lessons, lesson parts, practices or books, and opens only once all of them are met. Practices and books are grouped under a home lesson, and every lesson needs at least one general practice and one general book. Optional ones come on top. A practice is finished when every item is right. A book is completed only by an attempt with no mistakes, during which the learner did not look at the text again.

The whole loop is built: the Learn garden, teaching-order lists and strict locks, Practice and Library → Reading on their own prerequisites, and, since Phase 4 (2026-10-23), a general practice and a general book for every lesson ([learning-loop.md](learning-loop.md#the-app-today)).

Lessons are the core course: each teaches its points and checks understanding with a varied set of exercises without excessive duplication. Additional repetitions and noun substitutions belong in the separate Practice sets. They are found on **Learn**: each topic's page, opened from its stone in the garden, lists playable lessons in teaching order, grouped by stage, each done, in progress, open, or locked with its reason. Unwritten titles are folded separately. A due checkpoint sits before the first held lesson in an open topic, or after its completed boundary lesson when the next topic is closed or the course has ended. Finishing a lesson unlocks the next ones in place, and nothing sends the learner elsewhere ([requirements.md](requirements.md#progressive-unlock-no-redirects)). There is no separate Lessons page. **Practice** holds separate practice sets: separate question sets that each build on one or more named lessons, practices or books and may widen them with new or larger word sets, such as *Everyday dishes* after the restaurant lessons. A practice set uses the same tap and drag formats, keeps its own results and never changes a lesson's completion or review schedule. A set that is not open yet is a nameless koi silhouette, or absent, with no requirement text (learning-loop.md decision 8). The optional due lesson and book reviews were removed on 2026-10-29 at the owner's direction; reviews, Today and review-debt gating stay parked ([requirements](requirements.md#reviews-are-parked)).

## Learning through constant testing

Testing is the main way the learner learns, not only the way they are measured. Every test gives feedback after the attempt. Re-reading or re-watching is never a step by itself; to review is to retrieve.

| When | Test | Purpose | Counts as evidence? |
|---|---|---|---|
| Start of each session | Due retrieval, interleaved across venues | Strengthen and check earlier learning | Retrieved / retained |
| After a right answer (about one in four pattern-tagged multiple-choice and fill-the-gap items: grammar and particle choices) | Reason check: *Why is that right?*, three existing feedback lines to tap | Separate an understood answer from a lucky tap | A wrong reason is a soft miss ([Reason checks](#reason-checks)) |
| Start of a lesson | Words checks after Words and the first Point | Retrieve the new words before the patterns use them | Practiced |
| Inside a lesson | A few checks after each point: meaning, building and application | Check the distinction and its use while support fades | Practiced / retrieved |
| End of a lesson | まとめ review mixing all the points, with a changed scenario | Catch points that were only recognized inside their own block | Retrieved |
| End of a session | One item from today, again without the model | Catch items that were only recognized | Retrieved |
| After a delay | Closed-book lesson review: about six items from the lesson's drills, rotating (*parked, not built*) | Measure retention | Retained |
| In a changed venue | Transfer task | Measure adaptation | Transferred |
| End of an arc | Unseen tasks and passages in the consolidation week | Measure independent performance | Independently demonstrated (with stated supports) |

Interleave review across nodes and venues rather than blocking it by topic, so the learner has to recognize which move a situation needs.

The optional due lesson reviews in Practice and the due list in Reading were removed on 2026-10-29 at the owner's direction; reviews stay parked. A due passage still opens on its delayed recall set on its own page. Automatic session-opening retrieval and the end-of-session item remain parked or unbuilt; reading checks continue in place.

### Focus

A unit and a reading open on a short Focus, not on questions: what is about to be covered and what to practise or remember. Nothing is tested before it is taught. The first Point follows the Words table before the first lesson check; the first test of a reading comes after the read.

- **Units.** One or two sentences in textbook style, authored as `focus` in the unit file and shown on the lesson's opening page under the scene, before the words table. Name the moves and the patterns in Japanese, with {kanji|reading} markup: "Ask for an item with ［N］をください, and check first whether they have it with ［N］はありますか. Practise choosing the one that fits what you can see, and notice what を and は mark." Add an example or a short grammatical note only when the unit cannot be oriented without it. Explanations stay in the points, and Focus never gives a drill's answer.
- **Readings.** The recall purpose is the Focus. It says what to follow and remember, "Follow the changes to the meeting plan. Remember the final time and place.", and never supplies the tested facts, a summary or a translation.
- **Placement.** Focus is a panel in the page, not a step: it asks for no tap, is not scored and never blocks the unit or the text. In a unit it sits on the lesson's opening page (lessons are paged), under the title, goal and scene and above any reading check, so it is read before the words; Start moves on to them. It belongs to the lesson, so a checkpoint never shows it. In a reading it sits above the text during the supported read and is hidden with the text for the questions and the delayed recall.

**Retired: the unit pretest and the passage prequestion.** Until 2026-10-21 a new unit opened on three guesses drawn from its own drills, and a reading opened on an unscored prequestion. Three right guesses offered a fast-track through the whole まとめ, closed book, that could finish the unit, and the guessed items returned at the end of the まとめ. The rationale was the pretesting effect: attempting answers before study, then seeing the correct answer, improved later recall over study alone ([Pan & Sana, 2021](https://pubmed.ncbi.nlm.nih.gov/33793291/)). In this product the guesses read as blind tests of untaught material, and the testing after each point already supplies retrieval, so Focus replaced both. Saved guesses, fast-track answers and prequestion picks load without them, and a unit finished by fast-track stays finished ([data-contract.md](data-contract.md#retired-pretest-and-prequestion)).

### Reason checks

After a right first answer on about one in four pattern-tagged multiple-choice and fill-the-gap items, the feedback area asks one line, *Why is that right?*, with three reasons to tap. The sample is seeded by the lesson, the mode (drill or review), the attempt or review round and the item, so a reload asks the same items with the same lines in the same order, and doing the exercises again draws a new sample. Nothing is authored for it: the right reason is the item's own feedback line for its correct option, and the other two are correct-option lines of two other items in the same drill. The usual feedback waits until a reason is picked, because it would give the reason away; a wrong pick shows the right line in a single line, with no panel. A check is never asked after a wrong first answer (its feedback has already explained the mistake), and never on tiles, ★, matching, sorting, true/false or word-bank items.

**Grammar choices only (2026-10-29).** A check is asked only where a grammar choice is the point: an item whose `patternId` is set, on the item or on its drill. Untagged items (vocabulary meaning, "what does the underlined word mean", "what is she asking", scene comprehension) never ask and never lend their lines to another item's check. A drill whose tagged items have fewer than three different correct-option lines asks nothing, so it needs no `reasons: false`. Checks saved earlier on items that no longer take part are dropped on load and on restore; a backup is never refused for them. Tagging an item for its pattern is therefore also what makes it ask, so tag only items whose answer turns on that pattern.

A right answer with a wrong reason is a soft miss. The drill is not failed, but:

- the item comes back at the end of the まとめ as its own occurrence, once (an item already there is not added again, and a wrong reason on a returned item adds nothing more), and the unit cannot finish until it is solved;
- it counts towards the pattern's re-test exactly like a first-try miss, and the pattern record keeps a tally of wrong reasons;
- in a lesson review it is recorded as a miss, so it uses the one-miss allowance.

The skill map shows nothing new beyond the existing miss counts.

**Fair pools.** A feedback line is now also an answer option, so within a drill that takes part no other item's correct-option line may also justify an item's answer. Lines that state the same general rule for the same answer (two は items both explained as "は sets up the topic"), or that fit a sibling's situation exactly, turn the check back into a guess. Mark the overlapping item `reasons: false` (it is then never asked and never offered), or the whole drill when fewer than three different lines would remain. A drill with fewer than three different correct-option lines among its tagged items simply asks nothing, but different strings can still state the same rule, so this is a reviewer's check. Every shipped drill was audited this way on 2026-10-21: 45 items or drills are marked out. Since 2026-10-29 only tagged items take part, about one in ten multiple-choice and fill-the-gap items in the personal content.

The rationale is self-explanation: prompting learners to explain why an answer is right improved learning across 69 effect sizes from 64 reports, g = .55 ([Bisra et al., 2018](https://doi.org/10.1007/s10648-018-9434-x)). Choosing an existing explanation is a recognition task, weaker than producing one, so that result supports the idea without establishing this feature's effect. Whether reason checks improve delayed review results is a product hypothesis to check.

## Repetition that changes something

The aim is retention through varied retrieval, not repeated exposure to the basics. Authors and the scheduler follow these rules:

1. **Every lesson check adds evidence.** A new noun, a new venue label or switching the same answer from choice to tiles is not sufficient on its own. Keep a return only when it checks a new distinction, reduces meaningful support, or requires a different decision. Across Practice and delayed review, vary: direction (recognize → build), venue or partner, format (choose → order tiles → ★ ordering), support (furigana → hidden reading; point in view → closed book), delay, or combination with newer language.
2. **One success, then space.** After a correct in-session retrieval, an item is not asked again that session. Only errors come back the same day: a missed item can be retried straight after its feedback, and the first try is what counts.
3. **Avoid duplicate checks.** A retry is part of the same attempt. Do not repeat the same decision across lesson drills. Delayed reviews rotate eligible unused questions and combine changed contexts with original drills; focused misses may repeat. Use separate Practice pools rather than inflating lessons for review.
4. **Retire what is retained.** An item retained at about a 30-day interval and transferred in a second venue leaves the active queue. A small sample of retired items comes back as maintenance checks inside new passages and scenarios.
5. **Basics grow by being used.** Foundation moves are tested again inside later tasks (a counter inside a recipe, a repair chunk inside a phone call), not through separate drill rounds.
6. **Count exposures, not to reward them.** Log exposures per item to find over-drilled content. A high exposure count with low retention is a content problem to fix.

## How to explain "why"

Address three levels:

- **Intention:** What is the speaker trying to accomplish? What information does the listener need?
- **Language:** Which parts mark roles, tense, possibility, quantity, connection, or stance? What does the sentence actually claim?
- **Interaction:** Why is this level of explicitness or politeness useful with this partner now? What reply does it invite?

Avoid explanations such as "Japanese people always say this," "this particle means this English word," or "this is the only correct order." State the scope of the explanation. Introduce terminology after the learner has a contrast it helps explain.

In a lesson, the point's box carries the job the pattern does here in at most three sentences. The rest of the "why" is spread across the drills: each option's one-line feedback names the intention, form, or interaction mistake it represents.

## Sentence structure without a grammar dump

Teach particles by the relationships they express in the current sentence. Explicitly note that a particle can serve other functions. Distinguish a topic from a grammatical subject without presenting a one-line universal rule for は (wa) and が (ga). In learner-facing Japanese examples, use kana or readings; the parenthetical romanization in this editorial explanation is only to identify particle pronunciation.

Make recoverable omission visible. Show what the listener already knows and what would become ambiguous if another item entered the conversation. Reuse a structure with a new intention, not just a different noun.

Useful grammatical chunks may appear early. Record "introduced as chunk" separately from "productive rule learned." Return later to derive verb classes, adjective patterns, plain forms, potential forms, and sentence connections. The named bridges A–F and their arcs are in [curriculum.md](curriculum.md#arc-overview).

## Exercise design

Every exercise uses one of eight tap or drag formats. A drill is a numbered set in one format, with one English instruction line under a short Japanese stem (グループに わけましょう。), and is lettered automatically: Practice A, B, C, and so on. Only the まとめ review mixes formats.

| Format | The learner | Where it sits | Counts as | Feedback |
|---|---|---|---|---|
| Multiple choice (`choice`) | Taps one of 2–4 options. A Japanese line can be shown large with one part underlined, or a menu, sign, or receipt as a small card | Words drill (meaning in context, choose the reading); recognition; applied; まとめ | 1 | One line per option |
| Fill the gap (`blank`) | Taps a chip that fills the sentence's one （　） gap: a particle, word, or form | Recognition | 1 | One line per option |
| Tiles in order (`order`) | Taps 2–7 tiles into a line (tap again to remove, drag to reorder), then checks | Controlled building | 1 | One or two sentences; alternative correct orders are accepted |
| ★ ordering (`star`) | JLPT sentence composition: a sentence with four blanks, one marked ★, and four tiles; the learner taps the tile that belongs in ★, and the full sentence is then shown | Controlled building; 1–2 in the まとめ | 1 | One or two sentences |
| Matching (`match`) | Taps a left item, then its partner: 3–8 pairs, Japanese ↔ English or question ↔ answer | Words checks (typically 6–8 pairs) | 1 per pair | Optional one or two sentences |
| Sorting (`sort`) | Taps a card, then one of 2–3 groups: 4–10 cards | Recognition | 1 per card | Optional one or two sentences |
| True/false (`truefalse`) | Taps ○ or × for a statement about the conversation | After the conversation (2–3) | 1 | One or two sentences |
| Word-bank dialogue (`cloze`) | Taps a numbered gap in a changed version of the dialogue, then a word from the bank (the answers plus 1–2 that do not fit) | After the conversation (3–5 gaps) | 1 per gap | One or two sentences |

**Item selection.** Plan the evidence first: the meaning/form distinction, one useful build, an application and a final transfer check. Budget about 8–14 checks per point and 4–10 in the mixed review. Retain the meaning and reading checks for each introduced kanji word. Trim redundant point drills, vocabulary repeats and duplicated finals before removing a distinct learning objective. A small set may have `reasons:false`; never add filler to reach the three-item reason pool.

**Applied items** put the pattern to work: intention match ("You want X. What do you say?"), reply choice ("The staff says X. Choose the best reply."), realia (a question about a menu, sign, or receipt card), prediction (which turn comes next), error diagnosis (which line breaks down, and why), and transfer to a changed partner, venue, constraint, or intention.

**Questions without worked examples.** A drill shows its instruction and the question to answer. Do not add a solved example question, an embedded model answer, or an Example toggle before or beside an item. Teaching examples belong in the separate Point pages. In a tiles drill the first items may place the opening tiles, and later items add one or two tiles that do not belong.

**Distractors.** Wrong options are plausible learner errors: wrong particle, wrong counter, wrong function (asking instead of requesting), wrong politeness, wrong word order. Never nonsense, and never two defensible answers. If a distractor is also acceptable Japanese here, it is not a distractor: reword the prompt to rule it out. Retrieval with plausible distractors is real learning, not only measurement ([Little et al., 2012](https://www.psychologicalscience.org/news/full-frontal-psychology/two-cheers-for-multiple-choice-tests.html)).

**Feedback.** One short sentence, at most 20 words. The correct option says why it is right, never just "Correct."; a wrong option names the mistake. The explanation for tiles, ★, matching, sorting, true/false, and word-bank items is one or two short sentences. Instructions are one imperative line and never restate the grammar. Ask why through a choice between explanations, or ask for evidence from the text.

**Coverage.** Test only words and patterns taught in this lesson or earlier ones. Cover each core distinction, including recognition-only replies, but do not impose a per-word repetition quota inside lessons. Use Practice and later contexts for repeated retrieval. Review the whole lesson for repeated decisions, not just identical strings. For example, ordering tea, water and coffee with the same request frame is usually one lesson check plus Practice material; choosing a request after a positive availability reply tests a different decision.

Passage questions (gist, idea-unit checks, detail, sequence reconstruction, inference, "what cannot we conclude?") and kanji reading checks use the multiple-choice format. An idea-unit check, for example, has three choices: "The passage said this", "The passage said the opposite", and "The passage didn't say". Each has its own feedback.

Tap and drag results show recognition and controlled sentence building. They do not establish spontaneous speech or writing, and the interface does not present them as if they did.

### Teach the assessed target first

For every new or changed lesson or practice question, declare the form, meaning or use needed to choose its answer in `tools/teaching-targets.mjs`. Link it to a Point that teaches it on an earlier page or in a required lesson or practice. Name the exact use: knowing a word is not the same as knowing a new form or a new function of it. A literal word-recall declaration may use the headword and meaning visibly taught in Words. A recognize-only row or chunk supports understanding, not producing a new form.

Declare what determines the answer. Do not require every word in the scene, every distractor, or all the grammar inside a chunk that is taught as a whole. A frame, dictionary form, pattern tag, correct-answer feedback or later explanation is not earlier teaching. Lesson-part prerequisites grant only their own teaching and the lesson's prerequisites, not the whole lesson. Review uses the original item's declaration. A reasoned `nonlanguage` exception is only for a task that needs no Japanese distinction; a known teaching gap is never an exception.

Run `node tools/validate.mjs` after seeding. New or changed undeclared questions and uncovered targets fail validation. Unchanged legacy questions are reported separately; their baseline entries are not approval. When repairing a legacy question, update its declaration and teaching witness, then remove its baseline entry. Never regenerate the baseline to silence a failure. Use `node tools/validate.mjs --teaching-report` for the full legacy inventory. The checker verifies references, modes and ordering; content reviewers still verify that the cited teaching actually explains the assessed use and that the declaration names every distinction needed to answer.

## Passage recall protocol

Reading passages are learning events: read, retain, then answer. They are not open-book scavenger hunts.

1. **Focus.** The purpose line, shown above the text: why the learner is reading and what to follow and remember, in one or two sentences. "Your friend sent this. Remember when and where to meet." It names what to attend to, never the answers ([Focus](#focus)). No question comes before the read.
2. **Supported read.** The learner reads with furigana, glossary, and tap-to-reveal readings. No time pressure. They choose when they're done.
3. **Hide.** The passage and its Focus close and cannot be reopened until the immediate questions are answered.
4. **Immediate closed-book questions** (at least four, three or more functions):
   - gist;
   - two or more idea-unit checks (said / contradicted / not mentioned);
   - detail or condition (when, where, how many, what exception);
   - sequence reconstruction, for texts with an order;
   - inference, and at least one "what cannot we conclude?" item.
5. **Reveal with evidence.** The passage returns with each answer's evidence span highlighted. The full translation is optional.
6. **Language harvest.** Two or three phrases from the passage become review items, each keeping its passage sentence as context. Each phrase also gets three short new sentences that use it in a different situation, built only from words and kanji the course already teaches. They are held back for recovery: a phrase or passage missed three times returns in them instead of its own sentence. At least one harvested phrase must come from a sentence that carries an idea unit's evidence.
7. **Delayed recall.** After 1 day, 3 days, and 7 days by default (30 days for Arc 7 onward), the learner answers new questions about the same passage without seeing it. Use different items from the immediate set.
8. **Transfer.** At the arc's consolidation week, an unseen passage of the same text type with changed details, or a scenario that requires acting on the information.

**Recall modes by stage.** Open book, then closed-book recognition, then closed-book cued recall, then idea-unit recall, then summary choice and synthesis across two texts. The current arc's mode is listed in [curriculum.md](curriculum.md#passage-recall-ladder). A learner can choose open-book mode at any time; those answers are recorded as supported and do not count as retained.

**Idea units.** Authors split each passage into short propositions ("The meeting moved to Thursday", "Bring a receipt"). Each idea unit has an ID, its evidence span, and whether it is critical to the reading purpose. Delayed questions sample critical idea units first.

## Longer reading

Use connected texts from the beginning, with realistic support. Grow length, unknown-word density, syntax, and inference demands separately. A short text can be difficult; character count is not a proficiency level.

Aim for about 95–98% known-word coverage before glossary support. Above about 2% unknown running words, comfortable comprehension drops, so add glossary entries or simplify. Glossed phrases are labeled as glossary items, not counted as taught.

Every substantial passage should have a communicative reason to read it and at least three different question functions. A strong set includes gist, detail, reference, inference, evidence, and response. At least one question should ask what cannot be concluded. Reveal explanations after an attempt; keep the full translation optional.

For each question, author the answer, evidence span, rationale, acceptable alternative interpretations, and any limits. When the passage is intentionally ambiguous, the rubric must reward supported alternatives.

## Kanji policy

Revised with the owner on 22 October 2026: kanji is taught as words, by meaning and then reading, and text switches to kanji word by word as the learner comes to know them. The model, and the six decisions behind it, are in [curriculum.md](curriculum.md#kanji-growth): kanji as a reading skill learned as words, paced by the lessons, shown by the text itself, mastered through the daily trial, never penalised, on a page that holds nothing but the round. Every rule below follows from those. The numbers here (9 cards, opening at 9 met words, three questions, three passed trials) are the personal profile's defaults; the course profile ([builds.md](builds.md)) takes its own from its kanji policy ([data-contract.md](data-contract.md#kanji-policy-and-course)).

- No prior kanji is required. Since 2026-10-29 staged text is kana. One *Show all kanji* switch, off by default, shows the words the learner has mastered in kanji, with the reading a tap away; every other word stays kana. What counts as mastered is provisional, to be revised with the Kanji section (for now: a known word, or in a track profile a met word whose kanji are all known on the track). Authors still write every kanji word in markup, as below.
- Introduce written words because the learner will encounter them: water, price, station, menu labels, dates, and common verbs. The per-arc word sets are in [curriculum.md](curriculum.md#arc-details).
- Teach meaning, reading and use at the word level, inside a sentence. Never split a kanji into parts or tell its history, and do not demand every reading of a character at its first encounter.
- Write every kanji word in `{written|reading}` markup wherever it appears, including questions, options, tiles and explanations. The app decides each word's stage for each learner, so never write a kanji word as bare kana or bare kanji.
- Knowing a word's meaning, choosing its reading, and choosing its written form for a reading are different skills. Lessons drill the first two; written forms can come later as reversed Kanji cards. Reading aloud, typing, and handwriting are not practised in the app.
- Romanization is off by default because kana is assumed. Explicitly teach the spelling distinctions that kana familiarity does not guarantee: vowel length, small っ, and mora timing, through written pairs the learner chooses between (おばさん／おばあさん, きて／きって).
- Introduce 1–3 kanji words per lesson, a few per practice and at most one or two per book. Tune the pace with learner experience, not a forced daily character count.

### Kanji learned through testing

| Step | Where | Test | Support |
|---|---|---|---|
| Meet | The lesson or practice that introduces the word | Shown in kanji in a sentence from the scene | Reading shown |
| Mean | Straight after | Choose what it means in that sentence | Reading shown |
| Read | Straight after | Choose its reading from kana options | Reading hidden |
| Check | The reading check before a lesson's conversation or a book, on a later day, once met | Choose its reading in a sentence from that text | Reading hidden |
| Trial | The Kanji page's daily round, once 9 words are met | Its meaning, its reading, then which of three sentences it fits | Reading hidden until answered |
| Known | After three passed trials, on three different days | Written in kanji in every lesson, practice and book | Reading on tap |

A word is met, and joins the learner's Kanji cards, once they have answered its introduction drill; opening the lesson does not count. From then until it is known it shows as kana with its kanji small above. Only the Kanji page's trials count towards knowing a word: a trial passes when its three answers are all right, at most once a day, and its first wrong answer closes the card for the day with nothing taken away. Answers in a reading check or a lesson, practice or book add nothing and take nothing. A reading check asks only words the learner has met. A wrong answer about a known word, anywhere, brings its reading back above it until it is answered right again or passes a trial. Similar-looking words the learner has met (for example 入口 and 人, 右 and 石) get a contrast item once both are known.

### Kanji words in lessons

- **Choose 1–3 per lesson.** Name the kanji words the lesson introduces. Pick words the learner will see written in the venue and whose meaning is plain: 水 and 茶 on a café menu come before お願いします. Every other word in the unit reads in kana for a learner who has not met its kanji.
- **Introduce in a sentence.** The kanji words drill opens with each word in kanji, with its reading, in a sentence from the lesson's scene. No explanation panel, no parts, no history of the character.
- **Then drill at once.** For each word, one item asks its meaning in a sentence and one asks its reading with the reading hidden. One まとめ item may then find a word on a menu, sign or receipt card.
- **Options from what the learner has met.** Wrong meanings are other words' meanings. Wrong readings are other met kanji words' readings and, where relevant, the same kanji's other readings. All options in one item are of one kind, and a kanji the learner has not met is never an option.
- **Trial sentences.** Each kanji words drill also gives every word one new sentence for its Kanji card trial (`sentences`, one per word, in the order of the drill's words): `{word, ja, answer, en, slot}`, where `ja` holds one blank ＿, `answer` is the word's markup that fills it, `en` is the whole sentence in English, and `slot` names what the blank takes (drink, food, thing, place, time, number, person, language, activity, state or expression). The trial shows it beside two other words' sentences of different slots, so write it so that the blank demands the word's meaning: only this word fits, and the sentence is not answered by grammar or by a word of the same kind. Use only words the unit and its prerequisites teach, in a natural register, with readings on every kanji. Keep the word itself and the drill's other kanji words out of the rest of the sentence, and do not copy a line of the unit or a kanjiChecks sentence.
- **Fixed spelling.** Mark the items whose spelling must not change for the learner: a reading question, a spelling pair, an answer that is the kana itself.
- **Practices and books** introduce kanji words the same way, a few per practice and at most one or two per book. Nothing assumes a word is known: text reads in kana until the learner's progress says otherwise.
- **Review.** A Japanese teacher checks each word's reading in context, the choice of words to introduce, and that no wrong option is also defensible.
- **Retired.** The kanji parts catalog (`tools/kanji-components.mjs`), the parts drills and their まとめ items, and the kanji meaning checks in unfamiliar words (`kanjiMeanings`, whose options came from the catalog) are gone from the app since kanji Phase 3c (2026-10-23; [data-contract.md](data-contract.md#kanji-words)). Do not author them.

## Input policy

Every exercise is answered by tapping or dragging, in one of the eight formats under [Exercise design](#exercise-design), and every drag has a tap equivalent. There is no typed answer, reading, or reply, and no speaking practice or voice roleplay. Audio is not implemented: there is no synthetic voice or dictation, and none is added unless the owner asks. The owner may later give a few selected exercises audio; such an exercise is still answered by tap or drag, and the app does not fill up with audio. Results therefore describe reading comprehension, recognition, and controlled sentence building in written Japanese; the interface never presents them as evidence of listening or speaking.

## Word card

Tapping a marked word in a lesson, conversation, or passage opens a compact card. It shows only:

- the headword with furigana;
- the sense used in this sentence;
- the word type and particle frame (［N］を ください);
- the dictionary form, when the text uses another form;
- at most one short note and one example;
- the word's authored forms on one line, when it has any;
- one small kanji line: a met kanji word's Kanji trial status (met today, n of 3 trials passed, mastered), or for a kanji word not met, its reading status when it has reading evidence;
- **Add to deck**.

No section appears empty or as a placeholder, and nothing is shown twice. Vocabulary records have no audio field. The card follows reader gloss pop-ups and the glossing research reviewed for this design ([Satori Reader](https://blog.satorireader.com/2024/07/29/how-satori-reader-improves-automated-dictionary-lookups/); [Yanagisawa, Webb & Uchihara, 2020](https://www.cambridge.org/core/product/38124150D59DF3039EE1FF5AE88FE922)).

## Delayed review and transfer

**The small review surface of 2026-10-25 (Practice's due lessons, Reading's due passages) was removed on 2026-10-29 at the owner's direction; reviews stay parked.** A due passage still opens on its delayed recall set on its own page. Today, general pattern re-tests and recovery rounds remain parked; their records are preserved. The rules below are the design for later.

- **Default intervals:** 1, 3, 7, 14, and 30 days, then retirement checks. A correct delayed answer moves to the next interval. A wrong one returns to the 1-day interval in a changed form. Same-day repeats never advance an item.
- **Lesson reviews:** six first-response items, preferring eligible changed-context checkpoint recipes and up to two focused original misses, then other original drills. The selection is frozen; changed questions require a new run. Feedback follows each answer. A due run advances only with zero misses and no source reopening; a due miss/support returns tomorrow. Early runs do not advance. This is evidence from a small set, not a mastery claim.
- **Why expanding gaps:** the best review gap grows with how long the learning must last. For retention over weeks it is roughly a fifth of that period ([Cepeda et al., 2008](https://pubmed.ncbi.nlm.nih.gov/19076480/)). The defaults approximate this; a production scheduler should fit them to the learner's actual success.
- **Delayed checks change the conditions.** Review removes the Point from view and mixes available changed-context recipes with original items. Extra prerequisite lessons must already be completed. Focused misses may repeat; entirely fresh questions are not guaranteed. Later arc gates remain a design proposal.
- **Transfer must be real.** A transfer changes the partner, venue, constraint, or intention. Changing only a noun is a variant, not a transfer.
- **Every lesson shares a pattern with another topic.** After misses in two lessons, a grammar-pattern re-test comes from a third drill of the same structure. It changes the venue only when the pattern is drilled in more than one topic. So every unit tags at least one drill with a catalog pattern that a lesson in another topic also drills. The structure must really be the same: ［N］が いいです in a noodle shop and ［N］が 好きです in small talk share one, but location で and payment で do not. Where a pattern lives in one topic, add one drill to a lesson in another topic that uses it naturally, rather than a new lesson.
- **Passages follow the same schedule** through their delayed recall questions.
- **Cumulative checkpoints.** Eight authored anchors partition the 41-lesson path into blocks of 5, 6, 5, 5, 5, 5, 5 and 5. Each run samples new lessons and a smaller share of earlier ones. Misses route to teaching and schedules without resetting completion. Paths without authored anchors retain the five-lesson fallback. Checkpoints are spaced by content, not elapsed days, and report that day’s retrieval ([data contract](data-contract.md#checkpoints)).

### Checkpoint recipes

Checkpoint items are authored beside the unit they test, as `export const checkpoint=[…]` in `tools/units/<id>.mjs` ([data-contract.md](data-contract.md#checkpoints), [lesson-template.md](lesson-template.md#unit-brief)). Each is a curated combination, not a substitution: write the whole item, with its answer and distractors, in a unit drill format (multiple choice, fill the gap or choose the particle, tiles, ★, matching, true/false, word-bank dialogue).

- **Recompose, never copy.** Use a frame this unit teaches with a different taught word in its slot than the example it comes from, set in a venue that frame was not taught in (a counter line asked in a shop, a Meeting people question asked at the office). The validator rejects a built sentence that is already a unit line, a slot word that is the example's own, and an item set where its frame was taught.
- **Target the teaching.** Each item names the words-table row or point it tests; a matching item names one per pair and a word-bank dialogue one per gap, so a miss routes to exactly that row or point. A point target needs `frame`, `example` and `slot`.
- **Only taught Japanese.** List every vocabulary ID the item shows, distractors and dialogue lines included. They must be in the words tables of the unit, its prerequisites on the path, or a lesson it `uses`, which must come no later than the unit's own checkpoint. Every kanji and katakana word must belong to a listed word, a listed person's name met in a unit, or a number. Particles and hiragana function words are not checked mechanically: keep them to what the pool teaches.
- **One defensible answer.** Distractors are plausible learner errors that are wrong in this venue and situation, as in the units. Feedback says why the right answer fits here and names each wrong option's mistake.
- **Enough of them.** Each unit needs items for at least two different rows or points so its checkpoint can ask nine different points from five lessons; the validator runs every checkpoint for a learner who finishes the lessons in path order (every lesson counts: the path has no electives since loop 2b), and fails on any shortfall rather than repeating an item, using later material or dropping a lesson.
- **Review.** A Japanese educator reviews every combination for natural language, a practical venue and a single defensible answer before release; the validator cannot.

## Assessment and progression evidence

Keep these evidence states separate:

| State | Evidence |
|---|---|
| Seen | Model or explanation opened |
| Practiced | Guided task attempted |
| Retrieved | Target meaning chosen or built without looking |
| Retained | Retrieved after a delay |
| Transferred | Used in a changed situation |
| Independently demonstrated | Unfamiliar task completed with stated supports and rubric |

A stage pass should depend on its critical can-dos. Evaluate comprehension, sentence building, interaction choices, repair, and appropriateness individually. Record the partner, support, input conditions, date, and task variation. A learner can pass an ordering task while still being unable to follow natural speech, which the app does not test; retain that distinction.

A lesson is complete when every item has been answered correctly; its first-try results are kept as the score. Reading and word questions provide immediate feedback too. No self-report checkbox is treated as evaluated performance. These familiar tap and drag results must not be called fluent, mastered, or certified.

### Evidence-based progression

These are product defaults to validate in the pilot, not research-derived cut-offs.

| Decision | Default rule |
|---|---|
| Item counts as retained | Correct after a gap of at least 3 days, without support |
| Lesson review passes | At most one miss in a closed-book set of about six items |
| Stage pass | Every critical can-do retained, plus one unfamiliar task meeting the rubric with no unresolved meaning breakdown |
| Passage counts as retained | All critical idea units correct at the 7-day check, and at least about 70% of all delayed items |
| Pace control | If fewer than about 80% of the current arc's due items are retained over the last week, pause new lessons and use review slots |
| Arc gate | All consolidation-week tasks attempted; delayed transfer and unseen passage meet their rubrics; gaps routed to named review lessons |
| Kanji word known | Three passed Kanji card trials (meaning, reading and sentence all right), on three different days; from then on the word is mastered and shows in kanji while *Show all kanji* is on (2026-10-29; [Kanji policy](#kanji-policy)) |

Show the learner which rule applied and the evidence behind it. A learner can override a pace pause; the override and the gap are both recorded.

## Editorial workflow

Draft → completeness check (unit order, item counts, questions without worked examples, feedback for every option, readings on every kanji) → Japanese educator review → pragmatic/cultural review → pilot with a learner → revision → release. Record author, reviewer, date, version, sources, and licensing status. Restriction/allergy, health, safety and emergency, and legal/administrative scenarios need relevant expertise in addition to linguistic review.

Review should ask: Is the Japanese natural here? Is the English explanation accurate and appropriately limited? Are all viable answers accepted, including alternative tile orders? Is any distractor also acceptable here? Is the politeness level consistent with the relationship? Is an unfamiliar form scaffolded? Could the feedback accidentally teach a false universal rule? Are reading supports complete? Do the passage's idea units and evidence spans match the text? Does each retained check add evidence of understanding? Could a noun swap or duplicate review question move to Practice? Are all core distinctions still assessed after trimming?

## Error log and personal vocabulary

Record the item, the option or order the learner chose, the mistake it represents (particle, counter, function, politeness, word order, meaning), feedback confidence, the successful retry, and the next retrieval prompt. Let the learner contest feedback. A vocabulary gap should create a useful personal entry with an example and reading; it should not automatically expand the required global course.

## Sources

The unit form follows textbook and workbook practice reviewed for this design: [Genki](https://genki3.japantimes.co.jp/en/intro/), [Minna no Nihongo](https://plus.3anet.co.jp/mnc/touser_en/) and its [Hyōjun Mondaishū](https://www.3anet.co.jp/np/books/2350/) workbook, [Irodori](https://www.irodori.jpf.go.jp/assets/data/pre-intermediate/pdf/ZZ_howto_en.pdf), and [Quartet](https://bookclub2.japantimes.co.jp/download/files/quartet/QUARTET1_about_en.pdf). The tap formats follow the JLPT [test sections](https://www.jlpt.jp/e/guideline/testsections.html) and [N5 item purposes](https://www.jlpt.jp/e/guideline/pdf/n5_e_revised.pdf). Learning research is cited where it is used above. All Niwa items are original.
