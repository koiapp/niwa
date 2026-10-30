# Build and content roadmap

The content is produced in the arc order set in [curriculum.md](curriculum.md#the-sequenced-curriculum). The restaurant node is the reference node: built first and most deeply, and copied by the others. It is not a boundary. Every phase ships more than one venue, because delayed transfer needs a second venue to transfer into.

## Current implementation and priorities

The [generated inventory](content-inventory.md) is the source for current lesson, practice, book and checkpoint counts. The [25 October curriculum audit](curriculum-audit.md) prioritizes legacy teaching verification, lesson pacing, immediate companion readings, earlier transport and new reading transfer. These are proposed work; only the audit and documentation synchronization were completed in that pass.

The phases below describe the intended full course. Historical arc allocations need reconciliation before supporting a production schedule. The lesson/practice/book loop, five unseen texts, Bridges A–C, cumulative checkpoints and small optional Practice/Reading reviews are implemented; full-course arc gates and retention-based pace control remain unbuilt.

## Phase 1: prove the learning loop (Arcs 0–1)

Finish Making meaning and the core stages of At the table, Everyday shopping, and Meeting people as one small course. Teach their shared requests, prices, counters, and repair once, and test them across all three venues. Author the passage recall protocol for at least three passages, with delayed questions. Review the Japanese, author the missing lessons as textbook units (words, points each followed by drills, the conversation, a まとめ review; usually 35–50 distinct tap or drag checks each, at most 50), and create two alternative versions of each core assessment. Keep other nodes in the curriculum catalogue; the garden hides topics without reachable playable lessons.

Definition of done: a learner can enter from kana knowledge, understand each prerequisite, and complete one real scenario in each of the three venues. They can explain their choices, recall a closed-book passage after a day, and handle a changed version later in a venue they were not taught in. A Japanese educator has reviewed the lessons and rubric. Mobile reading, tapping, and dragging work on actual phones.

## Phase 2: connect neighboring situations (Arcs 2–3)

Develop the rest of Meeting people, Time & plans, Life at home, and Getting around, with bridges A–C (verb family, adjective patterns, て-form). Build shared skill records so the learner can transfer request patterns, prices, quantities, and reasons. Add a small grammar reference reached from actual mistakes or curiosity. Add interleaved cross-venue review, furigana fading, and the delayed passage schedule.

Current draft coverage includes ba01–ba02 (Bridge A), pl01–pl06 (planning, changes and schedules), bc01–bc03 (Bridge C), h01–h02 and bb01–bb02 (Home life and Bridge B), and tr01–tr03 (transport). Every lesson has a general practice and book. Three Making plans titles remain unbuilt: Accept or suggest another time, Cancel and explain, and Confirm the revised plan. Check for overlap with existing teaching before authoring them; see [Playable coverage](curriculum.md#playable-coverage) and the [audit](curriculum-audit.md).

Definition of done: learning a structure in one node meaningfully changes the next node's recommended path. It does not create identical mandatory drills, and no item is shown with an identical prompt more than twice.

## Phase 3: deepen interaction (Arcs 4–6)

Develop restaurant "Changes & surprises" and "Conversation around food", Friends & small talk, Work & study, and Appointments & services, with bridges D and E (plain forms, comparison). Add longer written exchanges with realistic alternative replies, completed by choosing each reply and filling word-bank gaps, with clear assessment limits. Store attempts and supporting evidence separately from self-reported confidence.

Definition of done: in an unfamiliar exchange, the learner chooses a fitting response to an unannounced change, a relevant follow-up, and a repair move for a misunderstanding, without the model dialogue in view. This works in at least two venues.

## Phase 4: longer discourse and independent life (Arcs 7–8)

Develop Health conversations, Housing & neighbors, When plans go wrong, restaurant "Independent dining", and Ideas & opinions, with bridge F (conditionals). Expand connected readings into messages, notices with exceptions, accounts, reviews, and discussions, with 30-day delayed recall. Grow kanji recognition by useful words, with readings always recoverable. Write node briefs for the four candidate nodes and promote any that pass review.

Definition of done: the learner can summarize, cite evidence, distinguish inference from fact, and respond appropriately in more than one context.

## Phase 5: personal depth (Arcs 9–10)

Add Reading the world, Stories & experiences, Belonging locally, Food beyond the table, and interest-led media. Audio for passages or selected exercises is not implemented; it waits for the owner’s decision. Let personal packs grow with the learner's actual encounters. Add account sync if moving among devices is a demonstrated need.

## Balanced production rules

1. **Cores before depth.** No node gets a deeper stage authored until every node in the current and previous arcs has its core stage at "reviewed" or better.
2. **Budget cap.** No single node takes half or more of a phase's new lessons. The restaurant is the largest node at 48 lessons, so it is spread across Arcs 1, 4, 6, and 8. Its share is 12 of 33 lessons in Phase 1, 24 of 54 in Phase 3, and 12 of 48 in Phase 4.
3. **Venue spread.** Each phase introduces at least two venue families that the previous phase did not teach.
4. **Assessment and passages first.** A lesson set is not started until its arc's consolidation tasks and passages are drafted.
5. **Expansions follow cores.** + rounds are authored only after their node's core stage is piloted.

## Content production pipeline

1. Select an unmet can-do in the current arc and inspect its prerequisites.
2. Draft the scenario, the assessment, and the transfer question first.
3. Author the unit in order with the unit brief in [lesson-template.md](lesson-template.md#unit-brief): words, a drill on the words, each point followed by its drills, the conversation and its drills, and the まとめ review.
4. Add readings, kanji words and their test steps, glossary, metadata, and accepted alternatives (including alternative tile orders). For passages, add idea units and evidence spans.
5. Run the completeness checker and dependency audit, including the 50-item ceiling and the check for repeated decisions.
6. Get Japanese language and pragmatic review (acceptance criteria below).
7. Pilot with the learner; record confusion, overload, and delayed results.
8. Revise, version, and publish.

## Consistency audit

Run this audit when a document or data file in this kit changes, and at the end of every phase.

| Check | Where | Pass condition |
|---|---|---|
| Node count, levels, rows | `curriculum.json`, curriculum.md, start-here.md | 19 nodes, six levels, eight rows of 1–3 nodes everywhere |
| Lesson totals | Arc overview vs. `curriculum.json` | Generated inventory matches catalogue and playable content; full-course arc allocations are explicitly marked as an earlier planning model until reconciled |
| Prerequisite order | Arc sequence vs. node prerequisites | Each node's prerequisites have at least their core stage in an earlier or the same arc |
| First-release scope | requirements.md, this roadmap, curriculum.md | All say: foundations plus three level-1 venue cores; restaurant as reference node |
| Evidence states | content-standard.md, requirements.md, app copy | The same six states with the same meanings; no fluency or mastery claims |
| Review intervals | curriculum.md, content-standard.md, app | Same default intervals; same-day repeats never advance |
| Kanji policy | curriculum.md, content-standard.md, lesson-template.md, requirements.md, app | Word-level by meaning and reading, no parts; kana until a word is known, then kanji everywhere; same points rule |
| Input policy | requirements.md, content-standard.md, lesson-template.md, curriculum.md, app | Tap and drag only; no typed answers or speaking practice; audio not implemented, open for a few selected exercises at the owner’s call |
| Unit form | content-standard.md, lesson-template.md, requirements.md, validator | Same skeleton order, usually 35–50 distinct checks, at most 50, drills without worked examples, one-line feedback, review sets drawn from drills; extended repetition belongs in Practice |
| Passage protocol | content-standard.md, lesson-template.md | Brief fields cover every protocol step |
| Validator and documentation drift | `node tools/content-inventory.mjs --write`, then `node tools/validate.mjs` | Content passes, generated inventory matches the data, and affected prose/audit statuses are reviewed |

### Historical implementation snapshots

The following dated records preserve what existed at each milestone; their counts and feature descriptions are not current totals. See the inventory and audit linked above for the current state.

Original audit snapshot: node, level, row, and 212-title counts match `curriculum.json` and start-here.md. The arc order satisfies every prerequisite. The first-release scope is consistent across requirements.md, this roadmap, and curriculum.md. restaurant-node.md and start-here.md still describe the restaurant as the starting point and largest node, which matches the reference-node role. The prototype implements closed-book recall, delayed passage questions (nine passages) and furigana fading, as requirements.md records; it does not yet implement arcs, unseen transfer passages or pace control, which requirements.md marks as specified.

October 2026 revision: the input policy and unit form read the same in requirements.md, content-standard.md, lesson-template.md, curriculum.md, restaurant-node.md, start-here.md and data-contract.md, and match the code: all 24 lessons are units with 44–49 counted items, and the typed-answer and listening modules are gone.

21 October 2026: Making plans gained three units (pl01–pl03) and two passages (pp01, pp02), all drafts pending fluent Japanese review. Counts now read 27 lessons with 44–50 counted items, nine passages and 217 vocabulary entries in curriculum.md, content-standard.md, requirements.md, data-contract.md and start-here.md. The first-release scope is unchanged: these units sit outside it, ahead of Arc 2 and 3.

21 October 2026, later: Bridge A gained two units, ba01 and ba02, in a new section of Making plans and in the general sequence just before r08; r08 and s06 now require them and retrieve their endings in their まとめ. The pattern catalog grew from 14 to 18 entries. Counts now read 29 lessons with 46–50 counted items (ba01 49, ba02 50; r08 and s06 50), 203 planned titles, 218 vocabulary entries and 27 general lessons on the Learn path. All the new Japanese is a draft pending fluent review.

21 October 2026, Changing plans: pl04 Running late (50 counted items) follows pl03 in the general sequence and requires ba01 and ba02; pp03, a late message on the morning of the walk, joins the plans shelf. Six vocabulary entries are new (分, ぐらい, 電車, 映画館, 先に, もしもし), 遅れる, 買う and 入る gained forms, and the kanji catalog gained 遅, 分, 車, 館 and 先. No pattern was added. Counts now read 30 lessons with 47–50 counted items, ten passages, 224 vocabulary entries and 28 general lessons on the Learn path. Both are drafts pending fluent review.

21 October 2026, Dating and relationships: a new optional topic, node `dating` (entry level 2, after Meeting people and Making plans, in its own map row), with four units, d01 Find shared interests, d02 Ask someone on a date, d03 Confirm or change the date and d04 Say how you feel and set boundaries (48–49 counted items), offered as the `dating` elective after pl03, and two message-thread passages, pd01 and pd02, on their own shelf. Twenty vocabulary entries and the kanji 趣, 味, 楽, 返, 付, 合, 帰 and 酒 are new; no pattern was added, and suggest-wa-dou is now drilled in two topics. Counts now read 19 nodes, eight map rows, 212 planned titles, 34 lessons, twelve passages and 244 vocabulary entries in curriculum.md, content-standard.md, requirements.md, data-contract.md and start-here.md. All of it is a draft pending fluent Japanese review, and its delayed retention is unpiloted.

22 October 2026, progressive unlock: the Today page is gone and learner-facing reviews are parked (the Today run, lesson reviews before a lesson, the Retention page, recovery callouts and the review-debt gate). Lessons now unlock in place on their topic pages, a due checkpoint is a row above the first lesson it locks, and finish screens reveal what unlocked with one way back to the topic; no page sends the learner elsewhere. requirements.md (Progressive unlock, no redirects; Reviews are parked; LEARN-01, PATH-01, NAV-01, NAV-02, REV-01, TEST-01, KAN-02, PACE-01, RET-01), content-standard.md, curriculum.md, data-contract.md and start-here.md say the same. The review engine and its saved-state fields are unchanged.

22 October 2026, the learning loop: the owner defined how the three kinds of content relate, in the new [learning-loop.md](learning-loop.md). Lessons are the start point and introduce a topic's core. Practices expand on lessons, and books test retention. A practice or a book can require any lessons, practices or books, and the two build on each other until a branch needs a new lesson. The document separates the decisions from the rules that follow from them, compares the loop with the four access mechanisms the app has today, and lists eleven open questions, each with a recommended default, to answer before anything is built. start-here.md, requirements.md (the Practice row and the documented flow) and content-standard.md (Lessons, practices and books) now point to it. No code changed.

22 October 2026, the learning loop decided: the owner answered the eleven questions, and learning-loop.md now records the decisions:
- Lessons require only lessons, and they teach again anything a practice has shown.
- Starting a lesson reveals the practices and books that build on it. They stay locked, cannot be opened and show no requirements until every prerequisite is met.
- A practice is finished when every item is right. A book is completed only by an attempt with no mistakes and no second look at the text.
- Practices widen how a lesson is used, with natural, casual and context-based forms and more vocabulary. Books test lessons and practices from memory. Both are grouped by home lesson.
- Every lesson needs at least one practice and one book.
- Garden stones are revealed as outlines and open with their first lesson.
- Elective stones replace electives.
- Checkpoints stay on the lesson path.

The document adds rules that make the decisions checkable, a draft prerequisite map of the existing content, four remaining questions and a list of the changes the app needs. The map shows that most existing books need lessons far beyond their own topic and use words no lesson teaches. start-here.md, requirements.md (target language, the Practice row, the documented flow) and content-standard.md (Lessons, practices and books) now say the same, and curriculum.md marks its Electives section as superseded. No code changed.

22 October 2026, the last loop questions: the owner settled the remaining four.
- A revealed practice or book shows its shape only, with no name.
- A book may introduce a few new words along the way, fewer and easier than a practice, which teaches new words in bulk.
- r05 and s03 become practice sets under r03 and s02.
- A topic is an elective stone when it is optional and nicher than the core flow.

The owner also made locks strict: nothing locked can be opened by any route, so locked pages go. learning-loop.md has no open questions left. No code changed.

22 October 2026, optional content: optional lessons become optional practices, which can unlock optional books. There are no optional lessons and no elective stones.
- Some activities are meant to be more optional than others, and optional content for niche, less general situations is welcome. It is a light change, not an overhaul.
- r05 and s03, and Dating and relationships' four lessons (d01–d04), become optional practices. pd01 and pd02 become optional books.
- General content never depends on optional content.
- Only general practices and books count toward each lesson's minimum.

learning-loop.md (decision 14, rule 12), data-contract.md (the `optional` flag and its validator checks), start-here.md, requirements.md, content-standard.md, curriculum.md (Electives, Dating and relationships) and lesson-template.md (the passage and vocabulary-expansion briefs) say the same. No code changed.

22 October 2026, one frame for Learn, Practice and Reading: the owner rated Practice’s water garden the best-organised page, so Learn’s garden and Reading’s table now use its frame: a topline (にわ LEARN, ほん READING), small spaced-caps subheaders, a status pill under each book, and a footnote. The art, kanji and book titles are unchanged. Library opens on Reading; its overview page of section tiles is gone (requirements.md, data-contract.md).

22 October 2026, kanji by words: after trying *Ask for something*, the owner found the kanji parts drill taught nothing to a learner with no kanji. Kanji is now taught as words, by meaning and then reading in a sentence, 1–3 per lesson. Each word shows in kana until it is met, then as kana with its kanji small above, and once known (10 progress points, at most one a day, one lost per miss) in kanji in every lesson, practice and book. The four-mode reading toggle becomes one *Show all kanji* switch. Collected words form Kanji cards, a daily multiple-choice round in Practice that opens at 10 words. The parts catalog, parts drills and kanji meaning checks are retired. The model is specified, not built, in curriculum.md (Kanji growth; its three open questions were settled the same evening), content-standard.md, lesson-template.md, requirements.md (KAN-01 to KAN-03) and learning-loop.md (decision 18). data-contract.md still describes the shipped parts drills until the build. Later that evening, the build plan was recorded in data-contract.md (*Kanji words*, five phases), and Phase 1 was built: `dist/kanji-words.mjs` (the word index, the longest-match resolver, met, points and known, the staged display and the state reader) with 21 tests. Nothing in the app calls it yet. Phases 2–4 wait for learning-loop Phase 2.

23 October 2026, kanji Phase 3 built: lessons and practices teach 1–3 kanji words by meaning and reading. All 28 lessons and the 6 practices made from optional lessons have a kanji words drill, and every answer in it moves the word's progress. The parts catalog, parts drills and kanji meaning checks are retired, with their parked review types and saved records; old saves and backups still load (data-contract.md, *Kanji words*).

23 October 2026, kanji Phase 4 built: Kanji cards is a Practice set that appears as a silhouette at the first met kanji word and opens at 10. Each day it has a saved round of up to 10 meaning and reading cards, weakest words first, that gives points at most once a day per word, with a collection of every met word (data-contract.md, *Kanji cards*).

23 October 2026, Editor removed and the Kanji page: the owner authors content outside the app, so the lesson editor (AUTHOR-01) is gone, and Kanji cards left Practice to become its own sidebar page, Kanji, in the Editor's place. Its round is a 3×3 grid of 9 cards that opens at 9 met words; each card is one trial a day, a wrong answer closing it with no point taken away; each trial is a `kanji` outcome in the ledger, and a replay gives no points. Old editor links open Kanji (requirements.md AUTHOR-01, NAV-01 and KAN-03; data-contract.md, *Kanji cards*).

23 October 2026, the kanji trial (owner's decision): each Kanji card is a trial of three questions in one slip (its meaning, its reading, and which of three sentences it fits), passed only when all three are right; the first miss closes the card for the day with nothing taken away. A word is known after three passed trials on three different days, and lesson, practice and reading-check answers no longer add or take points. Every kanji words drill carries authored trial sentences with a slot each, checked by the validator ([data-contract.md](data-contract.md#the-trial)).

23 October 2026, the Kanji page trimmed (owner's decision): it holds only the daily round, with no pills or round line on the cards (a pass is the circle, a miss the faded ink); the kanji word collection moved to Library → Dictionary as a Kanji words filter with a trials pill per word, and the word card's kanji line shows the same status (requirements.md KAN-03 and WORD-01; data-contract.md, *Kanji cards*).

23 October 2026, kanji compounds and names: a kanji compound that is no vocabulary word yet (本屋, 十時) shows in the stage of the words its kanji belong to, and people's names and places stay in kana. The validator reports the 194 such tokens by kind and warns about the 48 that content work could add as words (data-contract.md, *Stages on screen*).

23 October 2026, word lists in the Dictionary (owner's decision): the Library's Word lists section is gone, and its two packs are Library → Dictionary filters beside Your words, *Core words · 12* and *Restaurant extra · 24*, listing every word of the pack as dictionary entries with the same meaning quiz. The filters and the entry layout now open as panels from two icon buttons beside the search, and the Dictionary is one column. An old `#library/words` link opens the Dictionary on Core words (requirements.md; data-contract.md, *Vocabulary*).

23 October 2026, the learning loop built: all four phases of [learning-loop.md](learning-loop.md) are in the app (niwa commits named).
- **Phase 1** (a5ee6af, e7c15ea; 22 October): `tools/loop-check.mjs` checks references, homes, cycles, optional content, unseen-text sources and reachability, and the validator prints the loop map. Every book has `home`, `requires` and `introduces`.
- **Phase 2.** 2a (landed through the concurrent checkpoints b503db3, 52f0050 and 3a8d139) made practices unit-shaped data in `tools/practices/`, with one run view, home-lesson groups in Practice and state version 3. 2b (761cfe8) turned r05, s03 and d01–d04 into optional practices, removed electives (path version 2) and migrated saved progress.
- **Phase 3** (52e4675): books open on their own `requires`. Library → Reading shelves them under their home lessons as blank covers until they open, and a clean attempt completes a book, with Try again always open.
- **Phase 4** (plan 04d3958; integrations 78f42fc, 6f4eba3, faf752b and 90711ce): 26 new general practices, the two earlier ones topped up, 20 new passages and the 12 earlier books refitted, in seven batches drafted and reviewed in the workspace's `content-staging/phase4/` ([content-plan-phase4.md](content-plan-phase4.md#7-what-shipped-23-october-2026)). Book coverage, the 5% share and the per-lesson minimum now fail the validator.

The app reveals and opens every practice and book on its own prerequisites, groups them under their home lessons in Practice and Library → Reading, names what each finish opened, and opens nothing locked by any route. The content is 28 lessons; 34 practice sets (28 general, one per lesson, and 6 optional); 32 passages (2 optional) and 5 unseen texts; 406 vocabulary entries; and 359 kanji check sentences with 39 look-alike pairs. Every lesson is the home of a general practice and a general book, and no book introduces more than 5% of its word occurrences. learning-loop.md, data-contract.md, content-plan-phase4.md, start-here.md, requirements.md, curriculum.md, content-standard.md, restaurant-node.md and the workspace README now give the same counts and build states.

Left for a human educator:
- The review records in the workspace's `content-staging/phase4/batch-*/REVIEW.md`: an AI review pass fixed 265 must-fix issues, and each file's *For a human educator* list holds the judgment calls it left open.
- Vocabulary forms that no text uses after the refit. 19 lost their last use in it, such as 食べたい, 食べたかった, 言われた and お選びいただけます, and 72 older ones were already unused: 91 of the 195 authored forms. Keep them for later units or drop them.
- The pattern warnings `de-option`, drilled in one lesson only, so no re-test can come from another lesson, and `suggest-wa-dou`, drilled only in Making plans, so its re-test cannot change venue.
- The rewordings that closed the lesson-side step of the Phase 4 plan (23 October 2026). No lesson's drill now uses a word that only practices or books teach (そば, four days of the week, 午後, 入って and 32 more), and the validator checks it. Most words joined a Words table; where a table was full, items in pl01, pl02, pl03 and i05 were reworded within taught words, and those are new draft Japanese (curriculum.md, *For educator review*).

23 October 2026, the intent behind the kanji update, recorded: curriculum.md (Kanji growth, *The intent*) now states the six decisions the model rests on, in the owner's terms: kanji as a reading skill learned as words; the course sets the pace at one to three words a lesson; the text itself shows what the learner knows; mastery is demonstrated through three passed trials on different days, never accumulated; a miss costs nothing; and the Kanji page holds the round and nothing else, with the collection in Library. start-here.md, content-standard.md and the Flow Note author rules point to it, and the author rules now require a trial sentence for every kanji word.

## Educator review acceptance criteria

A lesson or passage reaches "reviewed" only when a fluent Japanese educator confirms all of these, and records name, date, and version:

1. **Naturalness:** every Japanese line is natural for the stated venue, partner, and relationship. Any line a speaker would not say there is rewritten.
2. **Register:** politeness is consistent with the relationship. Recognition-only service language is not graded as production.
3. **Accepted answers:** every viable alternative a learner could choose or build (including another correct tile order) is accepted, or the prompt is changed to rule it out. No distractor is also acceptable Japanese in context.
4. **Explanations:** English explanations are accurate and state their scope. No false universal rule ("always", "never", "means X") remains.
5. **Readings:** every kanji word has the reading correct for its context, and the kanji words match the arc's list or are glossed.
6. **Passages:** idea units and evidence spans match the text. Each "cannot conclude" item really cannot be concluded. Delayed questions are answerable from memory of the critical idea units.
7. **Sequencing:** no structure is used productively before its bridge. Chunks are marked as chunks.
8. **Sensitive content:** allergy, health, safety, and administrative items have also had the relevant expert review.
9. **Focus:** each unit's Focus and each passage's purpose say accurately what is covered and what to practise or remember, in a concise textbook tone, and give away no tested answer.

## Learner pilot acceptance criteria

Pilot each phase with the target learner (kana known, no kanji assumed at the start) before release. These are defaults to adjust with evidence; record the actual numbers.

1. **Retention:** at least about 80% of the phase's items are retained at the 7-day check, and the critical idea units of each piloted passage are recalled at 7 days.
2. **Transfer:** the learner completes the delayed transfer task in an untaught venue, meeting its rubric with no unresolved meaning breakdown.
3. **Repetition load:** the learner reports little "same question again" fatigue. Logs show no item shown with an identical prompt more than twice.
4. **Pacing:** sessions fit in 20–30 minutes on a phone, including interruptions and resumes. The pace-control pause triggers when it should and is understood.
5. **Kanji:** words with faded readings are read correctly in a new context at least about 80% of the time. The learner can always reveal a reading.
6. **Clarity:** the learner can say, for any lock, recommendation, or gate, which evidence caused it.
7. **Honesty:** nothing in the interface presents answer-choice results as fluency, mastery, or certification.
8. **Logged problems:** every confusion or overload point is logged with a revision decision before release.

## Decisions deliberately left open

- Exact grammar framework and terminology, after testing the first lessons.
- Whether, and where, to add audio. It is not implemented; the owner may add it to a few selected exercises or passages, never across the app, and every exercise stays tap or drag.
- How strict readiness recommendations and pace control should become after learner trials.
- None for the learning loop: the owner answered its last four questions on 22 October 2026. The rules marked *(fills a gap)* in [learning-loop.md](learning-loop.md#rules) remain open to change.
- Evaluate the small Practice/Reading review surface implemented on 25 October: question variety, missed-item follow-up and actual delayed retrieval. Today, automatic pattern re-tests, recovery rounds and review-debt gating remain parked.
- Which candidate nodes (Staying somewhere, Offices & paperwork, Safety & emergencies, Leisure & culture) to promote, and where they sit in the map.
- Which personal interests deserve specialist vocabulary packs.
- A validated mapping to external proficiency descriptors, if useful later.

These are future design choices, not blockers for the present design kit.

## What to measure

Track delayed retrieval, lesson review pass rates, first-try scores by drill format, passage recall at each delay, successful transfer, repair success, kanji reading retention, and the learner's ability to explain choices (sampled reason checks record a right or wrong reason per item, and a wrong-reason tally per pattern: [content-standard.md](content-standard.md#reason-checks)). Whether reason checks improve delayed review results is still to be measured; their research base is self-explanation, and choosing a given reason is a weaker, recognition form of it. Log time, effort, and exposures per item to improve session design and find over-drilled content. Avoid treating time spent, taps, streak length, or words seen as direct measures of proficiency.

## Schema work needed

The current data contract stores lessons as textbook units with review sets drawn from their drills, passages with idea units, evidence spans and delayed question sets, and single-choice checks. The arc model still needs: arc and venue IDs on nodes and lessons; kanji test steps per word; and evidence-state records per item. Specify these in [data-contract.md](data-contract.md) before the next build and version any stored-state migration.

25 October 2026, High curriculum findings implemented: reviewed all 1,956 legacy assessment items, moved first Points earlier and kanji after initial use, persisted page bookmarks and pause places, added immediate r03/s04/i05 loops and early transport tr00, restored optional due review in Practice/Reading, and narrowed f02/pl02 wording. Current totals: 41 lessons, 48 practices, 53 books and 444 vocabulary records. All 446 non-browser tests pass; human pacing and fluent-language review remain pending. Medium and Low proposals stay queued in the [audit](curriculum-audit.md).

28 October 2026, kanji policy layer: the owner is splitting Niwa into two content profiles, `personal` and `course` (the classroom-support build, [builds.md](builds.md)), and the course profile will follow their textbook's kanji order (JLPT N5 onwards) with its own trial rules once the material arrives. So the Kanji page's rules became data: the round's size and opening, the trial's questions and options, its closing rule and the passed trials that make a word known are a kanji policy in `lessons.json` `kanji`, with an optional course list that ranks and gates the cards and a profile's own names and places kept in kana. The new `dist/kanji-policy.mjs` reads and checks them, `kanji-words.mjs` and `kanji-cards.mjs` take the policy, and the trial's question kinds are a registry a new kind can join. The default policy is the owner's rules of 23 October, and the personal profile carries no `kanji` block, so it plays exactly as before. data-contract.md (*Kanji policy and course*, with a checklist for when the course material arrives), curriculum.md (*Kanji growth*, *Two editions*), learning-loop.md (decision 18), requirements.md (KAN-03), content-standard.md and start-here.md say the same.
