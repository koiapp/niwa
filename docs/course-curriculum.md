# The course profile: the classroom curriculum and its textbooks

*Written 28 October 2026. This records the owner's intent and the breakdown of the sources. All 15 stones are built (29 October 2026): Lessons 1–15 are playable as 44 app lessons with their practices, books and checkpoints, with kanji from Lesson 6 in the book's furigana form. The Kanji page's Nihongo Challenge track is built too (29 October 2026): 310 kanji in 31 lessons, met one at a time, with their own trials and the plain-kanji reward. The Japanese is still pending a fluent educator's review, and the personal profile is untouched.*

## What the course profile is for

The course profile is the classroom version of Niwa ([builds.md](builds.md)). The owner teaches at a school, ALA, whose beginner course follows the textbook つなぐにほんご 初級1. The owner's students use the course build to practise what they do in class. The app recreates the course's learning path: the book's lessons in the book's order, with the book's words, patterns and script.

The owner's words (28 October 2026): "Store these ebooks as reference to our school curriculum. Our goal is to recreate this learning path with the app for practice. This is in reference to our classroom version of the app's curriculum."

The engine is shared. Everything that differs lives in the course content under `niwa/course/tools` and in the course's `lessons.json` `kanji` block. The course content now follows the book (all fifteen lessons); the layout is in `course/tools/README.md`.

This document records the owner's decisions, the role of each source book, the mapping of the textbook onto the app, the facts the builders need lesson by lesson, and the questions still open. It does not design new engine features: where the course needs something the engine lacks, it says so and leaves the design to the build.

### The owner's decisions (28 October 2026)

1. **The first task** is to look at the breakdown of each lesson: the exercises, the vocabulary list, the examples and the learning outcomes. The analysts' notes listed under [Sources](#sources) do this; this document summarises them.
2. **One stone per textbook lesson, holding all its parts.** "Each lesson has 3 parts. We should use that as our learning stones, each stone has the 3 parts." And more precisely: "each stone should contain all 3 parts to a Lesson. 1-1, 1-2, and 1-3." Lessons 8 and 15 have two parts and Lesson 12 has four, so the rule is one stone per textbook lesson, holding all of that lesson's parts.
3. **Practices are cumulative expansions of the parts.**
4. **The book's script.** "Make sure to use the versions shown in the book/pdfs and papers. i.e. don't use or introduce kanji if it's not warranted."
5. **Kanji runs in parallel and is a reward.** "Learning kanji will be a parallel process but as you learn kanji, the questions/exercises and sentences will swap to the correct kanji as a reward for reaching their mastery."
6. **Books build up** more complex examples and cumulative lessons. They are a later task.
7. **Kanji one character at a time.** "We should go through kanji characters one at a time. Nihongo Challenge N4 N5 has the kanji list order and the content of how to learn each kanji. We don't need stroke order but we need to be able to test/memorize, in context, which version of the kanji is being pronounced. Initially, a kanji lesson will walk you through the letter, and its basic forms and their English meanings. Romaji pronunciation as well etc. For kanji mastery, we would need to be able to identify the kanji and their pronunciations through sentences."
8. **The roles of the books** (next section).
9. **Order of work.** "Document this information of intent. Don't yet create the new curriculum. We will do it next." Then: "Once that is done, start building the curriculum and Learn sections based on the book."

## The sources and their roles

The PDFs are in `reference/textbooks/` (described in `reference/textbooks/README.md`; the scans are kept out of git). Six analysts read them and wrote eight notes files in `reference/notes/`. Everything this document says about the books comes from those notes.

| Book | File | Role in the app |
|---|---|---|
| つなぐにほんご 初級1 (Tsunagu Nihongo, Beginner 1) | `tsunagu-nihongo-shokyu-1.pdf` | **Learn.** "That's the book to use to develop content progression and break it into lessons." Its lessons become stones, its parts become app lessons, and its per-lesson kanji list governs the script in Learn. |
| Tsunagu Nihongo handout 1 (ALA) | `tsunagu-nihongo-handout-1-ala.pdf` | **Vocabulary per lesson part.** "Our vocab list per lesson breakdown." It also gives the can-dos in English, and the school's additional words and grammar. |
| にほんごチャレンジ N4・N5 かんじ (Nihongo Challenge) | `nihongo-challenge-n4-n5-kanji.pdf` | **The Kanji page.** The kanji order (310 kanji) and the content for learning each one. |
| みんなの日本語 初級 I, Translation & Grammar Notes (English) | `minna-no-nihongo-1-translation-grammar-notes.pdf` | **Grammar explanations, as a reference** for the app's own Point explanations (lessons 1–25). |
| みんなの日本語 初級 II, Translation & Grammar Notes (English) | `minna-no-nihongo-2-translation-grammar-notes.pdf` | The same, lessons 26–50, which Tsunagu 12–15 draw on. |
| An exercises book, not yet sent | — | **Practice.** The owner will send it later, to combine with Tsunagu to fill the Practice tab with more detailed and testing examples. |
| — | — | **Books** (Library → Reading) are a later task: books formed from cumulative lesson knowledge. |
| 1500 Essential Vocabulary for the JLPT N4; はじめての日本語能力試験 N5 単語1000 | not kept | **Ignored.** "Not core: ignore them." |

What each file is:

- **The Tsunagu textbook** is the 388-page scan of 初級1: lessons 1–15, the back matter (vocabulary index, master table of can-dos and patterns, kanji list) and the answer booklet.
- **The handout** is the school's own 73-page companion. It is the only PDF with a text layer. It holds, per lesson part, the can-do table (Japanese and English), optional additional words and grammar points, and the vocabulary list (kana, part of speech, English, Chinese). It names ALA once, in a telephone example.
- **Both Minna no Nihongo scans are the English Translation & Grammar Notes volumes**, not the Japanese main text (本冊). They explain grammar in English with translated examples. They contain no Japanese conversations, drills or exercises, so they can check explanations but cannot supply practice items.
- **Nihongo Challenge** is a 280-page kanji workbook: Part 1 is 110 N5 kanji, Part 2 is 200 N4 kanji.

The notes files are listed with a line each under [Sources](#sources).

## How the textbook is built

### The course and its level

初級1 is lessons 1–15 of a 30-lesson course; 初級2 holds lessons 16–30. The two volumes together aim at CEFR and JF Standard A1–A2, roughly JLPT N4: about 2,000 words, about 350 kanji, and 400–450 class hours.

### The parts and the fixed sequence

A lesson has two to four parts. In 初級1 the parts number 3, 3, 3, 3, 3 / 3, 3, 2, 3, 3 / 3, 4, 3, 3, 2: **44 parts**. Lesson 8 and Lesson 15 have two parts; Lesson 12 is the only four-part lesson. The handout also has 44 coded parts (1-1 to 15-2). One sentence in the appendix notes says the vocabulary index covers "all 39 parts"; no count in the notes gives 39, so it is a slip, and this document uses 44.

Every part has the same six blocks, in the same order:

1. **場面会話** (scene conversation): a 3–6 panel illustrated strip with the lines printed in red beside the pictures. The red sheet (赤シート) hides the lines so the learner can rebuild the conversation from the pictures. Part 1-1 has two.
2. **文型練習** (pattern practice): numbered boxes, usually one per pattern. Each opens with an illustrated model with audio, then picture-cued substitution items and illustrated A/B mini-dialogues with blanks. A hint in parentheses, `（いいです →）＿＿`, asks for a form. A dotted underline means "use your own information". Conjugation tables to complete appear where a new form arrives.
3. **はなしましょう** (let's speak): できますか？, a near-wordless picture strip close to the scene, then either これも できますか？ (a variant situation) or じゆうに はなしましょう (free talk about the learner's own life).
4. **Can-doチェック**: two can-do lines (three in 2-1 and 3-2, one in each part of Lesson 8) with a three-star self-rating. Learners are told to recheck later.
5. **ことば・ひょうげん**: the part's new words with English. A dashed line splits words from the scene (above) from words from the drills (below).
6. **ぶんけい**: the part's patterns as frames with pink slots, each with one or two example sentences, in the order they appeared in the scene. Part 1-2 has no ぶんけい box; it teaches greetings and set expressions only.

After the last part, each lesson has **アクティビティー** (tasks that combine the lesson's parts, often with earlier lessons: interviews, looking things up, short presentations), **よみましょう** (a reading with 【しつもん】 questions) and **かきましょう** (a short writing frame). Six lessons end with a **コラム**, a reference page with no task: counters after Lesson 6, occupations after 7, particles after 11, the body after 12, hobbies after 13, particles again after 14.

The book's teaching flow is 場面会話 → 文型の確認 → 文型練習 → 応用会話: the learner meets the scene first, and the patterns are pulled out and confirmed afterwards. **Grammar is never explained in prose.** The book teaches by frames, tables, diagrams (これ／それ／あれ, position words, clocks, timetables) and pictures. Some forms appear in a scene before they are taught: ～ませんか／～ましょう in 3-1 (taught in 5-1), the plain past in the Lesson 6 diary (taught in 8).

Audio covers every 場面会話, every 文型練習 model and every はなしましょう column (tracks 001–282). The end-of-lesson blocks have none.

### Register

Lessons 1–6 are polite. **Casual speech starts in Lesson 7**, which pairs every scene: the upper half with the teacher in です／ます, the lower half among friends in plain forms. Casual drill items carry a red C. Lesson 8 is casual throughout. From Lesson 9 the book returns to polite speech, with whole casual parts at 12-3, 13-3, 14-2 and 15-2 and casual items elsewhere.

The verb forms arrive as charts on the ぶんけい page: verb groups and the dictionary form in 7-1, the ない form in 7-2, the た form in 8-1 (by the sound before ます: い・ち・り → った and so on), the full plain-form chart in 8-2, and the て form in 9-1 with the same layout as the た chart. The volitional (13-3) and ば (14-2) forms come later with their own group tables.

### Kanji in the book

- **Kanji start in Lesson 6.** Lessons 1–5 are kana only, with spaces between phrases (わかちがき). The one exception is 円, used in Lessons 2, 3 and 5 with the furigana えん, while the dialogues keep writing えん in kana.
- **Every kanji carries furigana**, every time, in all of 初級1.
- **A word is written in kanji only once all its characters have been presented**, in that lesson or earlier. Otherwise it stays in kana. 曜 is never presented, so weekdays stay 日よう日 throughout. The rule has small exceptions in the notes: 外国人 in the Lesson 7 reading (外 is presented in Lesson 9), 二人 in Lesson 10 (二 is never presented), and dates such as 5月14日 in the Lesson 6 diary.
- **92 kanji** are presented in 初級1, listed per lesson on p. 347: Lesson 2: 1; Lesson 6: 9; Lesson 7: 11; Lesson 8: 6; Lesson 9: 16; Lesson 10: 13; Lesson 11: 6; Lesson 12: 19; Lesson 13: 6; Lesson 14: 5; Lessons 1, 3, 4, 5 and 15: none. The list is bare characters, with no readings; readings exist only as furigana in context.
- Can-do lines, コラム pages, form labels, maps and pictures use kanji outside the list. These are captions and realia, not taught words. The list's footnote names six such words (氏名, 性別, 年齢, 国籍, 受付, 漢字).

### The back matter

- **The master table** (pp. 340–346) lists, for every part, the can-dos and every pattern studied with an example sentence. It is Japanese only and uses standard kanji throughout, unlike the lessons.
- **The vocabulary index** (pp. 326–337, about 1,000 entries) gives each word in kana as the lessons print it, its standard kanji spelling and the part where it first appears. A further glossary (pp. 338–339, about 140 entries) covers words that occur only in the end-of-lesson blocks.
- **The answer booklet** gives answers to the drills and sample scripts for the はなしましょう strips.

### The handout

The handout lists **924 vocabulary rows over the 44 parts**: 518 nouns, 175 verbs (always in the ます form), 89 adjectives, 6 noun/adjective colour pairs, 25 adverbs, 14 position words (tagged Prep), 3 conjunctions and 94 phrases. The rows count entries, not unique words; some words recur. A shaded block at the head of most parts (243 rows) is probably the part's core words; the handout does not say.

It also gives:

- **88 can-do rows** with English (87 filled; the second row of 12-1 is blank);
- **Additional words** in 15 parts (143 items, with kanji form, kana, romaji and English) and reference tables for numbers, counters, clock times and time words;
- **39 additional grammar points** in 17 parts, each with kana examples and romaji. These are the school's own additions; some are taught later in the book (～ないで ください appears at 7-2 but the book teaches it in 9-1; ～た ことが あります at 8-1, in the book 14-3).

What it lacks: example sentences for list words, kanji spellings for most words (about 40 entries from Lesson 7 on are printed in kanji with inline readings), romaji in the vocabulary lists, verb groups and dictionary forms, and any grammar for Lessons 6, 9, 10, 12 and 15.

**Counts followed.** The lesson notes give the handout count one lower than the handout notes in a few parts (for example 1-1: 25 against 26; 6-1: 34 against 35). The handout notes counted the rows by machine and checked them against the page images, and their totals add to 924, so this document uses them.

### Lesson outcomes in brief

- **1–5** (polite, kana only): greet and introduce yourself; shop for things by price, quantity, colour and size; travel by train and bus; describe daily routines and the past; eat out, order and talk about taste.
- **6** adds adjectives in all tenses, reasons with から, and the first kanji.
- **7–8** add casual speech and the plain forms.
- **9–10** add the て form: instructions, rules and permission, actions in progress, clothing and states, linking adjectives, opinions.
- **11–15** cover giving and receiving, requests at three politeness levels, invitations with たら and なら, advice and experience, and apologies.

## The mapping to the app

### Learn

- **One stone per textbook lesson**: 15 stones in book order. The garden reveals them progressively, as it does now: starting a lesson can reveal the next stone in outline, and finishing it opens the stone ([learning-loop.md](learning-loop.md#the-garden)).
- **The stone's lessons are the textbook's parts, in order** (1-1, 1-2, 1-3), so the course has **44 app lessons**. Each app lesson is one textbook unit ([content-standard.md](content-standard.md#a-complete-lesson)).
- **Prerequisites.** Each part requires the previous part. Each stone's first part requires the previous stone's last part. The Learn path is one sequence, as the book is; the notes show each part reusing what came before (4-1 depends on the times taught in 3-2; 5-1's activity uses the past tense from 4-2). Checkpoints are an open question.

Each app lesson takes its pages from its part:

| App lesson page | Source in the part |
|---|---|
| Scene | The 場面会話: its setting, its speakers and what they want |
| Focus | The part's できること (can-dos) |
| Words | The handout's vocabulary list for that part, checked against the book's ことば・ひょうげん |
| Points | The ぶんけい patterns, in the book's order. The explanations are written for the app (the book has none) and checked against the Minna no Nihongo grammar notes through the cross-map in `minna-no-nihongo-reference.md` |
| Checks | The 文型練習, reworked into the app's tap and drag formats: substitution items become choice or tile builds, fill-in dialogues become choice or drag-the-ending items, conjugation tables become drag-the-form items |
| Conversation | The はなしましょう situations (できますか？ and これも できますか？), as a read-and-answer conversation |
| まとめ | The Can-doチェック: a short mixed review that tests each can-do |

The app writes its own dialogues, sentences and exercises, set in the book's scenes and built from the book's words and patterns. It does not reproduce the book's text, art or audio. The cast can mirror the book's: the school (あおき先生, タン, キム, ラマ, マリー), the apartment (たなか, the landlord にしかわ) and the office (サラ, リ, シン, アティ, なかむら, いのうえ).

Every app lesson also needs a transfer question in the course's `checks.mjs`; the これも できますか？ variant situation is the natural source.

**One tension to settle in the build.** The content standard asks for 6–12 words per lesson. The parts range from 3 handout words (13-2) to 52 (4-1). See [Open questions](#open-questions-for-the-owner).

### Naming

The owner's convention (28 October 2026): the learner never sees the book's numbering or its Japanese titles as names. Each stone has an original, app-like English name, which is the label under its garden stone and its page's heading (the kana or kanji on the stone itself stays), and each app lesson has an English name, which is its button on the stone page, its opening page's title and its entry in the contents. Above the lesson buttons the stone's single stage carries the English name and one short English line about what its lessons do. The book's titles are kept beside the names for reference (`bookTitle`, `bookPartTitles` in `course/tools/stones/<stone>/stone.mjs`), and no learner-facing text says "Lesson 1" or "1-1"; it names the stone or lesson instead. Lesson pages carry no pause note: the page and answers are saved, so a lesson can be left anywhere.

The fifteen stones, in book order: 1 First Greetings · 2 Out Shopping · 3 Trains and Buses · 4 Day to Day · 5 Eating Out · 6 Plans and Trips · 7 Among Friends · 8 Catching Up · 9 Rules and Instructions · 10 People and Places · 11 Saying Thanks · 12 Asking a Favour · 13 Invitations · 14 Good Advice · 15 Saying Sorry. The app lesson names of Lessons 1–5 are in the [lesson-by-lesson tables](#lesson-by-lesson-breakdown); each later lesson's builder names its parts the same way.

### What is not reproduced

- **Speaking.** はなしましょう and the アクティビティー are speaking tasks: pair work, interviews, presentations. Niwa has no speaking. They are used only as sources of situations, rebuilt as tap and drag items: put a strip's lines in order, choose the next line, build a short presentation from tiles. Items that ask for the learner's own information (the dotted underline) become a choice of plausible answers.
- **Writing.** かきましょう asks for free writing: forms, diaries, emails. Niwa has no typing. The frames become sentence assembly from tiles, following the book's model, or choices that complete the frame. Writing kana readings of prices and times (Lessons 2 and 3) becomes choosing the right reading.
- **Audio.** Not implemented; the owner may add it later to a few exercises. The book's tracks are not used.
- **The red sheet.** Its idea, hide the line and rebuild it from the picture, maps onto "cover the line and choose it from options". The app has no illustrations of its own for most drills, so picture cues are replaced by short captions or scene text.

### The per-lesson minimums

The validator fails a lesson that is not the home of at least one general practice and one general book ([learning-loop.md](learning-loop.md#rules), rule 11). The course needs both for all 44 app lessons before it validates, long before the exercises book arrives.

*Proposal for the build, not a decision:*

- **One general practice per part**, built from the variety in its 文型練習 (the items the lesson does not use) and the handout's additional words and grammar for that part, requiring that part.
- **The アクティビティー as a further practice** homed on the lesson's last part and requiring all the lesson's parts, since it combines them.
- **One general book per part**: a short passage in the part's scene that retells it with a change, using only the part's chain, requiring that part.
- **The よみましょう as the seed of a lesson-level book** homed on the last part. The よみましょう text type sets its kind: a flyer, a timetable, an email, a diary.

This meets the minimum with the least new structure. It is a placeholder until the exercises book and the Books task replace or extend it. Since 29 October 2026 each of those practices is written in parts, like a lesson, with far more words and usage (see [Practice](#practice)).

### Practice

Practices are cumulative expansions of the parts (decision 3). A practice can require several parts, across lessons, and widen them with more vocabulary, more variety and more of each pattern. Since 29 October 2026, at the owner's request, every course practice is written in **parts**, like a lesson, so that each one leaves the learner with a much larger vocabulary for its topic and the usage of those words. The engine side (the `parts` authoring shape, the seed's flattening, the rules, the helpers and the app) is in [data-contract.md](data-contract.md#practice-parts).

**What is built** (counted from `course/dist/lessons.json`, `practices.items`):

- **59 practices, all in parts: 240 parts**, 55 practices with four parts and 4 with five.
- **1,886 words in their Words tables** (the flat `words`), 25 to 43 per practice, 32 on average; 1,118 distinct vocabulary records across all the practices.
- **3,537 counted items** as `unitKeys` gives them (a match counts per pair, a sort per card, a cloze per gap; `practiceParts(p)` `keys` in `dist/loop.mjs`), 46 to 65 per practice, about 60 on average, in 1,984 item objects. The length estimate (`minutes`) is 18 to 25 minutes per practice, 1,355 in all.
- **The course vocabulary** is now 1,522 records, against 1,039 on the morning of 29 October 2026.

**The structure.**

- **Part 1 keeps the original practice:** its items and their IDs (saved progress and the teaching declarations name them), re-cut into the first part or two.
- **Each later part adds a set of topic words and their usage:** its own Words table, a Point that shows the new words with a pattern the chain already teaches (a usage or wording difference, never a pattern the book has not reached), and its drills: a meaning `match`, recognition, building and applied items.
- **The last part ends with the まとめ,** the one `final: true` set, 6–10 mixed items drawn from every part. A closing review part may have no new words or Point of its own.

**How a learner meets them.** `#practice/<id>` opens the practice's part list: its title, home topic, length and Focus, then one row per part. Parts open in order, each once every counted item of the part before is solved; `#practice/<id>/<part>` runs one part with its opening page, Words table, sections and finish page. Finishing a part other than the last only offers the next part; the last part's **Finish practice**, enabled once every item of the whole practice is solved, finishes the practice and names what it opened.

**How to revise a practice.**

1. Follow the author brief, `content-staging/practice-parts/AUTHOR-BRIEF.md` (in the workspace repo): sizes, Part 1's kept items, the ID scheme, word reuse, script policy and teaching coverage. `REVIEW-BRIEF.md` beside it is the Japanese review checklist.
2. Edit the practice file in `course/tools/practices/` and, when an item or Point changes what it teaches, the `teaching` block of its home part file in `course/tools/stones/lNN/`.
3. Check the file alone: `node tools/check-practice.mjs course/tools/practices/<id>.mjs` (0 problems).
4. Build the course, the final gate: `node tools/build.mjs --profile course` (`"status": "passed"`), then checkpoint.

The builders' doubts and the fifteen stone review records are in `content-staging/practice-parts/` (its README says what each file is); what they leave for a teacher is under [Questions for the Japanese educator](#from-the-practice-parts-reviews-29-october-2026).

- **Sources used:** the 文型練習 variety, the アクティビティー, the コラム pages (counters, occupations, particles, the body, hobbies), the handout's additional words and grammar, and the topic's natural N5 vocabulary beyond them.
- **Later:** the exercises book the owner will send, "to combine with Tsunagu to fill out the Practice tab and sections with more detailed and testing examples". Still pending.

### Books (later)

Books are build-ups of more complex examples and cumulative lessons (decision 6), and a later task. The よみましょう texts show the kind of text the book expects at each point:

- **Early lessons:** information-search texts: self-introductions, a sale flyer, a departure board, emails, a menu flyer.
- **Lessons 6–10:** a diary, survey charts, a casual email, rule lists, short job descriptions.
- **Lessons 11–15:** a travel story, a test notice, a recruitment poster, a newspaper article, an apology email.

The book says reading grows towards gist-reading of social texts of about 500 characters. A book follows the learning-loop rules unchanged: at least 95% of its words taught by its chain, and no new grammar.

### Script policy

**The app shows exactly the script the book shows at that point.** Nothing beyond the book's list is introduced in Learn.

- **Lessons 1–5:** kana with word spacing, as the book prints them. 円 is the one exception, with furigana, where the book uses it (the Lesson 2, 3 and 5 activities and readings); the dialogues keep えん in kana.
- **From Lesson 6:** the words the book writes in kanji at that point, with furigana; every other word in kana, even where it has a common kanji (しけん, べんきょう, しごと and てんき in Lesson 6, for example).
- **A word switches to kanji in the lesson where the book switches it**: なに → 何 in Lesson 8; にほんご → 日本語 in Lesson 9; かきます → 書きます and たべます → 食べます in the Lesson 9 drills; てんき → 天気 in Lesson 14; りょうり → 料理 in Lesson 14. The notes list each lesson's kanji words. The book's Lesson 9 table already prints 学校, but the course follows the p. 347 list, which presents 校 in Lesson 10, so がっこう switches to 学校 in Lesson 10.
- **People's names stay in kana**, as the lesson pages print them: あおき, いのうえ, なかむら, たなか. The book writes a name in kanji only occasionally from Lesson 12 (田中 in a 12-1 drill, 木田 in the Lesson 14 reading), once its characters are presented; the app follows the page. Names go into the course's `kanji.properNouns` so the engine treats them as names.
- **The authority is the per-lesson list on p. 347.** Where the book's own pages break the rule (外国人 in Lesson 7, 二人 in Lesson 10), the app keeps to the list and writes the word in kana. The verb charts, which the book keeps in kana even after the drills use kanji, follow the book.

**The three stages.** The engine shows each kanji word in one of three stages ([curriculum.md](curriculum.md#kanji-growth)). For the course:

| Stage | Course meaning | Shown as |
|---|---|---|
| Not met | The book has not yet written the word in kanji | Kana |
| Met | The book writes it in kanji from this lesson on | Kanji with its reading shown, as the book's furigana |
| Known | Mastered on the Kanji page | Kanji, with the reading a tap away |

Mastery on the Kanji page is what upgrades a word beyond the book's furigana. That is the reward of decision 5. A word shows in plain kanji only once **all its characters** are known, which is the book's own rule applied to mastery.

Two differences from the personal profile follow:

- The personal profile's met stage is kana with the kanji small above. The course's met stage is the book's form, kanji with the kana above.
- **The engine tracks kanji by word; the course wants mastery by character.** Today 水 known as みず says nothing about 水よう日. In the course, mastering 水 on the Kanji page should count for every word that contains it. The build must decide between per-character state in the engine, or a word-level approximation (for example, a word becomes known when every character in it has passed its trials). The data contract's course list (`kanji.course`) orders and gates words, and is a starting point but not the answer ([data-contract.md](data-contract.md#kanji-policy-and-course)).

### The Kanji page

The Kanji page follows Nihongo Challenge's order:

- **Part 1:** the 110 N5 kanji in 11 lessons;
- **Part 2:** the 200 N4 kanji in 20 lessons;
- **310 in all**, ten per lesson, numbered 1–310.

**One book lesson is one set of ten** (owner, 29 October 2026). The learner reads a set's kanji one at a time, then practises the set, and the practice opens the next set. Each kanji's reading pages walk through:

- the character, its meanings and its origin drawing or mnemonic (rewritten for the app; the book's drawings are not reproduced);
- its sounds: the on and kun readings. The book gives them in kana only; the app adds romaji, which the book never prints;
- its example words with their readings, and the special readings. The book shades the words to memorise (N5 vocabulary in Part 1, N4 in Part 2);
- its sentences.

Wherever a reading floats over a kanji, this kanji's reading is red and a neighbouring kanji's reading stays black, so the learner sees which sound belongs to which kanji (日よう日: にち red over 日, よう black over 曜). There is no stroke order and no writing.

**The practice** tests what the owner asked for: identify the kanji, and which reading applies in a sentence. The book supplies the model:

- **Readings in context.** Each chart's example words set readings side by side: 日 as ひ, にち and び in 日よう日, plus the special readings (ついたち, ようか). 練習1's sentence items put two readings of one kanji in one sentence. In the app these become "how is the red word read here".
- **練習1** (write the reading in hiragana) becomes a reading choice in a sentence.
- **練習2** (write the kanji in the boxes) becomes choose-the-kanji for a red kana word.
- **The test practices** need no change. もんだい1 (choose the reading of an underlined word, four options) and もんだい2 (choose the kanji for an underlined kana word, four options) are already tap items.
- **The comprehensive exercises** need no change either. They add realia: an advert, a survey, a memo, a notice, a sign.

The test practices fall after every three lessons. The もんだい1 distractors are near-miss readings: wrong voicing, a wrong long vowel, another reading of the same kanji. The もんだい2 distractors are look-alike, same-reading and deliberately malformed kanji.

**What was built** (29 October 2026; the first build of the same day, a daily round of character cards with three-pass mastery, was replaced). The contract is in [data-contract.md](data-contract.md#kanji-sets):

- **Content.** `lessons.json` `kanji.characters` holds the 31 lessons and 310 kanji, written one file per book lesson in `course/tools/kanji/` and reviewed. Each kanji has its meanings, on and kun readings with romaji in the handout's style, a story in the app's words, its example words with the ★ core words first, its special readings, two or more sentences with their distractor sets, and three or more look-alikes. Every word and special reading carries `markup`, one `{kanji|reading}` token a kanji wherever the reading splits, which is what lets the app colour this kanji's reading alone.
- **The set list** (`#kanji`). The 31 lessons under *PART 1 · N5* and *PART 2 · N4*, one row each: the book's number, its Japanese title in the brush font, its English title and a pill (*Ready*, *In progress*, *Done*, *Locked*). A locked lesson is shown in place, faded, with no link and no requirement text. The first lesson is open; each later one opens when the one before it has been practised.
- **The board** (`#kanji/<lesson>`). Ten squares of the folded paper, two rows of five. A read kanji is in ink, the next one in the seal's vermilion, the rest plain paper. Tapping the red kanji opens its reading pages in the board's place; Done on the last page marks it read and the next kanji appears. A read kanji reopens its pages at any time. Once all ten are read, *Practise the lesson* appears under the board.
- **The practice** (`#kanji/<lesson>/practice`). Five questions a kanji, fifty a lesson, one of each kind per kanji and mixed: its meaning; how the red word in a sentence is read here; which kanji writes the red kana word; how one of its core words is read (the wrong readings change only this kanji's sound: another of its readings, a voicing change, a long-vowel or small っ slip); and which kanji is read like these sounds. Each is a tap on one of four options, with the right answer shown after every answer. A reload resumes the practice where it was left. The finish shows the score, the kanji to read again and *Next lesson open*, with a notice. Practising again is always allowed.
- **Mastery is undefined for now** (owner). A practice finished with wrong answers still opens the next lesson; nothing records points or known kanji. The plain-kanji reward (a met word shown as plain kanji once every kanji in it is known on the Kanji page) stays wired and inert until mastery is defined; words with 番 or 由 would never go past furigana. The course draws no word cards.
- **Library.** The Dictionary's *Kanji* filter lists the read kanji, each with the pill *Read*.
- **Not built.** A cumulative test mode across lessons (the practice is built from a list of kanji, so it can come later), the test practices and the comprehensive exercises (their distractor sets are not stored).

**What the engine has:**

- the sets in `dist/kanji-characters.mjs`: the learner state `state.kanjiChars` version 2 (each kanji's read day, each lesson's practice day, the practice under way), the lesson's status and board, and the unlock of the next lesson; a version 1 store from the first build migrates, keeping its read days;
- the practice in `dist/kanji-practice.mjs`: the five question kinds, seeded so a run resumes, and `rubyHTML`, which draws every Japanese line of the page with this kanji's reading red;
- validator checks: the shape, numbering 1–310 with no gap, kana readings with romaji, the `markup` rules, no kanji ahead of the book's order in a sentence, distinct distractors none of which is the answer, every lesson's practice buildable, and brush-font coverage;
- `tools/brush-font.py --dist course/dist`. The course font was regenerated (1031 characters, 581 KB).

The practice logs nothing in the outcome ledger. The personal profile has no `characters` block, and its Kanji page keeps its daily round of word cards.

**The two orders.** The two kanji tracks run separately:

- the Learn text follows Tsunagu's per-lesson kanji (92);
- the Kanji page follows Nihongo Challenge (310).

Checked character by character against the notes' lists:

- **78 of Tsunagu's 92 are in Nihongo Challenge Part 1.**
- **12 are in Part 2:** 住 所 (Part 2 Lesson 1), 朝 方 夜 (Lesson 10), 回 (13), 料 理 (14), 作 (15), 号 (16), 帰 (17) and 思 (20).
- **2 are in neither:** 番 (Tsunagu Lesson 9, in 電話番号) and 由 (Tsunagu Lesson 12, in 理由). Nihongo Challenge prints them only with furigana inside example words (電話番号 and 交番 under 号 and 交; 理由 and 自由 under 理 and 自).
- **32 of Part 1's 110 are not in 初級1:** the numerals 一 to 十, 百, 千 and 万 (the textbook writes numbers as numerals), and 半 耳 手 足 力 後 西 牛 馬 魚 貝 門 午 安 古 立 道 駅 空.

So the two tracks overlap mostly but not in order. Tsunagu Lesson 6 already presents 行 見 国 先 生 日 本 大 人, which Nihongo Challenge spreads over its Part 1 Lessons 1, 4, 5, 8, 9 and 11. A student following the class will meet most kanji in Learn, with furigana, well before the Kanji page reaches them.

## Lesson-by-lesson breakdown

One table per textbook lesson. "Words" is the handout's row count for the part. Register is the part's scene: *polite*, *casual*, or *mixed* (both in the scene); "+C" marks casual drill items in a polite part. Kanji are those the book presents in the lesson (p. 347). Patterns are the part's ぶんけい frames in the book's script, separated by ・.

### Lesson 1 あいさつする (Giving greetings)

App stone: **First Greetings**.

Kanji: none.

| Part | Title | App lesson | Can-dos | ぶんけい | Words | Register |
|---|---|---|---|---|---|---|
| 1-1 | はじめまして／おしごとは？ | Nice to Meet You | Greet someone you meet for the first time and give your name; ask and say country and work | N1は N2です ・ こちらは ～さんです ・ ～は ～です。～も ～です ・ ～は ～ですか ― はい、～です／いいえ、～じゃ ありません ・ あの ひとは だれですか | 26 | polite |
| 1-2 | いい てんきですね | Nice Weather Today | Greet neighbours; make small talk about the weather | (no ぶんけい box) あいさつ ・ いい てんきですね ― そうですね ・ もう いちど おねがいします | 28 | polite |
| 1-3 | ベトナムから きました | New Next Door | Greet neighbours you will rely on; ask and say when and from where someone came | ～は ～から きました ・ おくには どちらですか ・ いつ ～へ きましたか ・ ～を ～ます／～ません／～ますか | 21 | polite |

*Lesson blocks.* アクティビティー: interview a classmate (name, country, job) and introduce them to the group. よみましょう: three short self-introductions in kana, with ○／× questions. かきましょう: a reception registration form, whose labels are kanji with furigana (realia only). No コラム.

### Lesson 2 かいものする (Going shopping)

App stone: **Out Shopping**.

Kanji: 円

| Part | Title | App lesson | Can-dos | ぶんけい | Words | Register |
|---|---|---|---|---|---|---|
| 2-1 | これ、ください | This One, Please | Tell the clerk what you want and how many; ask the price | いくらですか ― ～えんです ・ これ／それ／あれ／どれ ・ いくつですか ― ～つです ・ ～(を) ［数］ ください ・ ～と ～(を) ください | 37 | polite |
| 2-2 | くつうりばは どこですか | Which Floor? | Ask where a department is; ask where goods are | ～は どこですか ― ～は ～です ・ ～は どこに ありますか ― ～の となり／まえ／うしろです | 32 | polite |
| 2-3 | くろいの、ありますか | In Black, Please | Ask whether there are other items; leave without buying | この／その／あの／どの N ・ ～いの ・ ～いです ・ ～くないです | 35 | polite |

*Lesson blocks.* アクティビティー: look up the exchange rate, compare prices of three items across countries, present. よみましょう: a department-store sale flyer with four shoppers; find the floor and the price. かきましょう: write prices in hiragana. 円 first appears in these blocks. No コラム.

### Lesson 3 でんしゃや バスに のる (Taking the train or bus)

App stone: **Trains and Buses**.

Kanji: none.

| Part | Title | App lesson | Can-dos | ぶんけい | Words | Register |
|---|---|---|---|---|---|---|
| 3-1 | なんで いきますか | How Do You Get There? | Ask and say how to get somewhere; say what you want to do | ～は ～で ～へ いきます／きます ・ なんで いきますか ・ ～たいです／～たくないです | 23 | polite |
| 3-2 | バスは なんじに きますか | When's the Bus? | Ask where a bus stop or station is; ask bus times; confirm where a bus goes | ここ／そこ／あそこ／どこ ・ ～に ～が あります ・ なんじですか ・ ～は なんじに きますか ― ～に きます ・ なんばんの ～ですか ― ～ばんです | 23 | polite |
| 3-3 | なんばんせんですか | Which Platform? | Ask fare, travel time and platform; say where you are | ～から ～まで どれぐらい かかりますか ― ～ かかります ・ ～は どこに いますか ― ～に います | 11 | polite |

*Lesson blocks.* アクティビティー: plan a Tokyo route (where, how, how much) on a simplified rail map and present it. よみましょう: a shinkansen departure board; find the next train and platform for given times. かきましょう: three sentences on how you get to school. No コラム.

### Lesson 4 まいにち する ことを はなす (Talking about daily activities)

App stone: **Day to Day**.

Kanji: none.

| Part | Title | App lesson | Can-dos | ぶんけい | Words | Register |
|---|---|---|---|---|---|---|
| 4-1 | あさ がっこうで べんきょうします | A School Morning | Talk about your daily life; say when, and from when to when, you do things | ～ます ・ ～を ～ます ・ ～から ～まで ～ます ・ ～で ～ます | 52 | polite |
| 4-2 | まいにち りょうりを しますか | Do You Cook? | Say what you did; ask and say who did it or whose it is | ～ました／～ませんでした ・ だれが ～か ・ だれの ～ですか ― ～のです | 19 | polite |
| 4-3 | まいしゅう つくります | Every Week | Say what you will do when working with others; ask and say where a tool is | わたしは ～ます ・ ～は どこに ありますか ― ～の うえ／した／なか…に あります | 46 | polite |

*Lesson blocks.* アクティビティー: an illustrated daily timetable; narrate your own day and ask follow-up questions. よみましょう: two short emails arranging a meal, three questions (one needs inference). かきましょう: a three-sentence daily routine. No コラム.

### Lesson 5 しょくじする (Having a meal)

App stone: **Eating Out**.

Kanji: none.

| Part | Title | App lesson | Can-dos | ぶんけい | Words | Register |
|---|---|---|---|---|---|---|
| 5-1 | いらっしゃいませ | A Table for Three | Invite someone to eat or drink; tell the staff how many and what seat | ～ませんか ― ～ましょう ・ ～に いきます (purpose) ・ なにか／どこか／だれか | 14 | polite |
| 5-2 | ケーキに します | I'll Have the Cake | Talk about what to order from a menu; ask about something on it you don't understand | どれに しますか ― ～に します ・ ～は なんですか ― ～です | 20 | polite |
| 5-3 | おいしいですね | Delicious! | Say how food tastes; say what you want | N は ～いです (taste) ・ ～。でも、～ ・ わたしは ～が ほしいです | 20 | polite |

*Lesson blocks.* アクティビティー: where you eat dinner, the restaurants near your home, what you ate (combines Lessons 3–5). よみましょう: a burger-shop menu flyer and an ordering conversation; what they buy and the total. かきましょう: a four-sentence lunch account. No コラム.

### Lesson 6 よていや した ことを はなす (Talking about plans and what you did)

App stone: **Plans and Trips**.

Kanji: 行 見 国 先 生 日 本 大 人

| Part | Title | App lesson | Can-dos | ぶんけい | Words | Register |
|---|---|---|---|---|---|---|
| 6-1 | りょこうします | Going on a Trip | Ask and answer about holiday plans; give a simple reason | ～いですか ― はい、～いです／いいえ、～くないです ・ ～から、～ ・ どこも・なにも・だれも ～ません | 35 | polite |
| 6-2 | きょうとは どんな ところですか | What's Kyoto Like? | Ask and say what a travel spot is like; introduce its specialities | ～な N ・ どんな ～ですか ― ～い N です／～な N です ・ ～です／～じゃ ありません／～じゃ ないです ・ とても ～／ちょっと ～／あまり ～ません・～ないです | 41 | polite |
| 6-3 | りょこうは どうでしたか | How Was the Trip? | Ask and say what someone did on a trip; ask and give impressions | ～かったです／～くなかったです ・ ～でした／～じゃ ありませんでした／～じゃ なかったです ・ ～は どうですか／どうでしたか | 11 | polite |

*Lesson blocks.* アクティビティー: talk about sights you want to visit; a short talk about a place you went. よみましょう: a diary of a Hakone trip, in plain style (taught in Lessons 7–8), about 300 kana. かきましょう: a diary frame. コラム1 かぞえかた: a counter table with no task.

### Lesson 7 友だちと 話す① (Talking with friends 1)

App stone: **Among Friends**.

Kanji: 友 話 休 土 会 学 来 金 分 木 月

| Part | Title | App lesson | Can-dos | ぶんけい | Words | Register |
|---|---|---|---|---|---|---|
| 7-1 | しゅうまつ、なに する？ | Plans This Weekend? | Talk about weekend plans with a teacher; and with friends | どうしの グループ ・ じしょ形 (行きます → 行く) ・ ～に 行きます | 21 | mixed |
| 7-2 | わたしは 行かない | I'm Not Going | Tell a teacher whether you will join a weekend event; tell a friend | ない形 ・ ～ない？ ― うん、～／ううん、～ない ・ どうして？ ― ～から | 10 | mixed |
| 7-3 | これ、なに？ | What's This? | Ask a teacher or friend about something you don't know; say how you feel | ～い／～くない ・ ～(だ)／～じゃ ない (な-adjectives) ・ ～(だ)／～じゃ ない (nouns) ・ なに？／いつ？／どこ？ | 20 | mixed |

*Lesson blocks.* アクティビティー: polite question cards to ask casually (inviting a friend to a film; talking about holidays). よみましょう: survey charts on foreign friends, with ○／× statements. かきましょう: do you want foreign friends, and why. コラム2 しごと: occupations printed in kanji with furigana, beyond the taught set.

### Lesson 8 友だちと 話す② (Talking with friends 2)

App stone: **Catching Up**.

Kanji: 食 名 前 出 何 川

| Part | Title | App lesson | Can-dos | ぶんけい | Words | Register |
|---|---|---|---|---|---|---|
| 8-1 | 友だちと サッカーしたよ | We Played Football | Ask and tell friends what they did at the weekend | た形 (～た／～なかった) | 13 | casual |
| 8-2 | どうだった？ | How Was It? | Talk with friends about what you did on a day off and how it was | ～かった／～くなかった ・ ～だった／～じゃ なかった (な-adjectives) ・ ～だった／～じゃ なかった (nouns) ・ ふつう形 chart | 13 | casual |

*Lesson blocks.* アクティビティー: casual talk about a match and the holidays, then a short polite report to the group (いいましょう). よみましょう: a casual email about a first trip to Nara and Kyoto. かきましょう: a short travel report. No コラム.

### Lesson 9 ちゅういや しじを きく (Asking for advice or instructions)

App stone: **Rules and Instructions**.

Kanji: 火 時 中 外 書 水 入 車 電 語 住 所 年 番 号 間

| Part | Title | App lesson | Can-dos | ぶんけい | Words | Register |
|---|---|---|---|---|---|---|
| 9-1 | そこに すてないで ください | Not There, Please | Understand rubbish-disposal instructions and apologise for a mistake; ask the landlord about the rules | ～ないで ください ・ ～て ください (て形) ・ ～までに | 29 | polite |
| 9-2 | じしょを つかっては いけません | No Dictionaries | Understand test instructions; ask a teacher or person in charge what is allowed | ～ては いけません ・ ～ても いいです(か) ・ ～で ～ (means, language) | 18 | polite |
| 9-3 | きょうかしょを 見て います | Looking at the Textbook | Understand a teacher's instructions; say what others are doing | ～て います ・ もう ～／まだ ～ | 12 | polite |

*Lesson blocks.* アクティビティー: explain the meaning of signs and marks (しらべましょう); design your own sign and present it. よみましょう: five short rule lists to match to places. かきましょう: write a "where is it?" rule quiz. No コラム.

### Lesson 10 人や まちを しょうかいする (Introducing people and places)

App stone: **People and Places**.

Kanji: 白 子 男 女 父 母 高 校 小 南 口 長 目

| Part | Title | App lesson | Can-dos | ぶんけい | Words | Register |
|---|---|---|---|---|---|---|
| 10-1 | どの 人ですか | Which One Is She? | Ask and say who someone is from their clothes or actions; introduce someone | ～を ～て います ・ ～て いる N | 24 | polite +C |
| 10-2 | ペキンに 住んで います | My Sister Lives in Beijing | Introduce family and friends; ask and say where someone lives, their job and whether they are married | ～て います (state, occupation) ・ ～は ～くて、～です／～は ～で、～です | 28 | polite |
| 10-3 | ベトナムの 南に ある まちです | A Town in the South | Introduce your town simply; say how you feel about something | ～は ～が ～です ・ ～が、～ ・ (わたしは) ～と おもいます | 16 | polite |

*Lesson blocks.* アクティビティー: introduce a friend for a part-time job from a profile card. よみましょう: two first-person texts; guess the jobs. かきましょう: describe what you are wearing in a photo. No コラム.

### Lesson 11 おれいを 言う (Giving thanks)

App stone: **Saying Thanks**.

Kanji: 言 聞 思 山 社 雨

| Part | Title | App lesson | Can-dos | ぶんけい | Words | Register |
|---|---|---|---|---|---|---|
| 11-1 | ありがとうございます | Thank You | Discuss what to give as a present; thank someone for a present | ～は ～に ～を あげます／もらいます ・ ～ましょうか (deciding) ・ ～た とき、～ました ・ ～とか、～(とか) | 20 | polite |
| 11-2 | 母に つくって もらいました | My Mum Made It | Thank someone for a compliment on what you have or wear; explain who gave or made something for you, and when | ～は ～に ～て もらいます ・ (じしょ形) とき、～ | 14 | polite +C |
| 11-3 | てつだって いただいて、ありがとうございました | Thanks for Your Help | Offer help to someone in trouble; thank someone for their help | ～ましょうか (offer) ・ ～て あげて ください ・ ～て いただいて、ありがとうございました ・ ～て、～ (cause) | 10 | polite +C |

*Lesson blocks.* アクティビティー: a picture story about thanking a boss; what would you do in four situations. よみましょう: a student's story of being helped abroad. かきましょう: a thank-you email. コラム3 助詞①.

### Lesson 12 おねがいする (Making requests)

App stone: **Asking a Favour**.

Kanji: 帰 東 北 今 買 田 少 方 上 下 右 左 毎 朝 理 由 読 気 作

| Part | Title | App lesson | Can-dos | ぶんけい | Words | Register |
|---|---|---|---|---|---|---|
| 12-1 | おしえて ください | Could You Show Me? | Give a reason and make a simple request; ask about and follow a simple procedure | ～んですが、～て ください ・ (ます形) 方 ・ ～て、～て、～ | 38 | polite +C |
| 12-2 | 見て いただけませんか | Would You Take a Look? | Give a reason and make a polite request; explain a problem and ask for help | ～んですが、～て いただけませんか ・ (じしょ形) まえに／N の まえに ・ ～て みます | 21 | polite +C |
| 12-3 | けしゴム、かして | Lend Me an Eraser | Make a simple request to a friend; ask a friend for something awkward | ～て。 ・ ～て くれない？ ・ (ふつう形) N | 17 | casual |
| 12-4 | 帰っても いいですか | May I Go Home? | Say you feel unwell and leave early or take time off; give a reason and get permission | ～ので、～ても いいですか／～なくても いいですか ・ ～から、～ても いい？／～なくても いい？ ・ ～ので、～ ・ どうしたんですか ― ～んです | 20 | mixed |

*Lesson blocks.* アクティビティー: role-play asking for help in four situations. よみましょう: a university test notice, with a four-option question on the date. かきましょう: an email asking to change a meeting. コラム4 体・病気: a labelled body diagram and illness phrases.

### Lesson 13 さそう・ことわる (Making invitations, rejecting invitations)

App stone: **Invitations**.

Kanji: 飲 店 新 週 夜 多

| Part | Title | App lesson | Can-dos | ぶんけい | Words | Register |
|---|---|---|---|---|---|---|
| 13-1 | わしょくは どうですか | How About Japanese Food? | Invite a coworker for a meal; accept and discuss where to go | ～ませんか ・ ～たら、～ ・ ～なら、～ (taking up a topic) | 13 | polite +C |
| 13-2 | その 日は ちょっと | That Day's Tricky | Invite a coworker to go out; when invited, settle the date | N なら、～ (alternative) ・ ～たり、～たり ～ ・ ～の あとで／～た あとで、～ ・ ～か ～(か)、どちらが いいですか | 3 | polite |
| 13-3 | 行って みない？ | Want to Try It? | Invite a friend to an event; turn down a friend's invitation | ～て みない？ ・ ～(よ)う (いこう形) ・ ～(よ)うと 思って います | 7 | casual |

*Lesson blocks.* アクティビティー: university clubs; give a club recruiting pitch. よみましょう: a volunteer-recruitment poster with tick-box questions. かきましょう: what volunteer work you want to do and why. コラム5 しゅみ.

### Lesson 14 アドバイスする (Giving advice)

App stone: **Good Advice**.

Kanji: 早 花 天 料 回

| Part | Title | App lesson | Can-dos | ぶんけい | Words | Register |
|---|---|---|---|---|---|---|
| 14-1 | びょういんへ 行った ほうが いいですよ | See a Doctor | Speak to someone who looks unwell; give simple advice | ～ない ほうが いいです／～た ほうが いいです ・ ～く なります／～に なります | 10 | polite +C |
| 14-2 | ネットで さがせば、いろいろ あるよ | Try Searching Online | Pass on information that helps solve a problem; say what you can and cannot do | ～ば、～ (じょうけん形) ・ ～が できます | 14 | casual |
| 14-3 | 行って みたら どうですか | Why Not Give It a Go? | Ask whether someone has been somewhere; explain, advise and suggest about a destination | ～なら、～が いいです ・ ～たら、どうですか ・ ～た ことが あります | 19 | polite +C |

*Lesson blocks.* アクティビティー: advise a student struggling with kanji; share a problem and advise each other. よみましょう: a newspaper article on a new hospital, with ○／× statements. かきましょう: what hospitals are like in your country. コラム6 助詞②.

### Lesson 15 あやまる (Apologizing)

App stone: **Saying Sorry**.

Kanji: none.

| Part | Title | App lesson | Can-dos | ぶんけい | Words | Register |
|---|---|---|---|---|---|---|
| 15-1 | こわして しまって、すみません | Sorry I Broke It | Apologise politely for something you did; explain simply what happened | ～て しまいました／～て しまって、すみませんでした ・ ～ければ、～ ・ ～なら、～ | 16 | polite |
| 15-2 | ごめんなさい | Sorry! | Apologise to a friend; explain to a friend what happened | ～ちゃった ・ ～ながら ～ | 4 | casual |

*Lesson blocks.* アクティビティー: what would you do after a mistake (two picture strips, four situations). よみましょう: an apology email for a lost book. かきましょう: an apology email. No コラム.

**Totals:** 15 lessons, 44 parts, 88 can-dos, 924 handout vocabulary rows, 92 kanji.

## The kanji order

Nihongo Challenge's 31 lessons, ten kanji each. "In 初級1" counts how many of the lesson's kanji Tsunagu 初級1 presents.

| Part | Lesson | Theme | Kanji | In 初級1 | Test practice after |
|---|---|---|---|---|---|---|
| 1 | 1 | 絵からできた漢字1 (Pictographs 1) | 山 川 田 日 月 火 水 木 金 土 | 10 | |
| 1 | 2 | 数字 (Numbers) | 一 二 三 四 五 六 七 八 九 十 | 0 | |
| 1 | 3 | 数字と記号 (Numbers and signs) | 百 千 万 円 年 上 下 中 半 分 | 6 | Lessons 1–3 |
| 1 | 4 | 絵からできた漢字2 (Pictographs 2) | 人 子 女 男 目 口 耳 手 足 力 | 6 | |
| 1 | 5 | 絵からできた漢字3 (Pictographs 3) | 父 母 先 生 学 校 友 本 毎 何 | 10 | |
| 1 | 6 | 方角 (Directions) | 前 後 外 左 右 東 西 南 北 名 | 8 | Lessons 4–6 |
| 1 | 7 | 絵からできた漢字4 (Pictographs 4) | 牛 馬 魚 貝 雨 天 気 車 門 午 | 4 | |
| 1 | 8 | 形容詞 (Adjectives) | 大 小 高 安 新 古 長 多 少 早 | 8 | |
| 1 | 9 | 動詞 (Verbs) | 行 来 食 見 入 出 立 書 言 飲 | 9 | Lessons 7–9 |
| 1 | 10 | 組み合わせ漢字1 (Combinations 1) | 話 読 語 間 聞 買 休 時 週 道 | 9 | |
| 1 | 11 | 組み合わせ漢字2 (Combinations 2) | 今 会 社 店 駅 花 国 白 空 電 | 8 | Lessons 10–11; then the コラム and the comprehensive exercise |
| 2 | 1 | 住所 (Address) | 住 所 京 都 府 県 市 区 町 村 | 2 | |
| 2 | 2 | 形容詞1 (Adjectives 1) | 明 暗 遠 近 強 弱 重 軽 太 細 | 0 | |
| 2 | 3 | 形容詞2 (Adjectives 2) | 特 別 有 便 利 不 切 元 好 急 | 0 | Lessons 1–3 |
| 2 | 4 | 形容詞3 (Adjectives 3) | 低 広 短 良 悪 正 変 赤 青 黒 | 0 | |
| 2 | 5 | 趣味 (Hobby) | 映 画 音 楽 歌 写 真 旅 世 界 | 0 | |
| 2 | 6 | 仕事 (Profession) | 仕 事 銀 員 医 者 働 屋 産 業 | 0 | Lessons 4–6 |
| 2 | 7 | 自然 (Nature) | 林 森 地 池 海 洋 雪 光 台 風 | 0 | |
| 2 | 8 | 季節 (Seasons) | 季 節 春 夏 秋 冬 暑 寒 暖 涼 | 0 | |
| 2 | 9 | 体 (Body) | 体 頭 顔 首 心 声 病 薬 科 内 | 0 | Lessons 7–9 |
| 2 | 10 | 時 (Time) | 朝 昼 夜 夕 方 晩 計 曜 以 度 | 3 | |
| 2 | 11 | 動詞1 (Verbs 1) | 止 歩 走 起 持 待 借 貸 始 終 | 0 | |
| 2 | 12 | 家族 (Family) | 家 族 私 自 親 両 兄 弟 姉 妹 | 0 | Lessons 10–12 |
| 2 | 13 | 生活 (Everyday life) | 活 回 主 色 形 品 民 服 犬 同 | 1 | |
| 2 | 14 | 食べ物 (Food) | 米 料 理 肉 鳥 野 菜 茶 飯 味 | 2 | |
| 2 | 15 | 部首 (Radicals) | 代 使 作 化 信 進 送 返 洗 注 | 1 | Lessons 13–15 |
| 2 | 16 | 場所 (Place) | 場 建 物 院 館 堂 室 工 図 号 | 1 | |
| 2 | 17 | 交通 (Traffic) | 交 通 動 乗 降 運 転 帰 発 着 | 1 | |
| 2 | 18 | 学校1 (School 1) | 漢 字 文 教 勉 習 英 考 研 究 | 0 | Lessons 16–18 |
| 2 | 19 | 学校2 (School 2) | 問 題 試 験 質 合 答 用 紙 意 | 0 | |
| 2 | 20 | 動詞2 (Verbs 2) | 引 開 閉 去 死 集 知 売 説 思 | 1 | Lessons 19–20; then three コラム and the comprehensive exercise |

The order follows the book's account of how kanji are built. It starts with pictographs and numbers, moves to sets by theme and word class, and ends with combination kanji whose parts the learner already knows (日 + 寺 → 時, 門 + 日 → 間). Part 2 adds antonym pairs (明 ↔ 暗), verb pairs (借 ↔ 貸) and one lesson by radical.

**A kanji entry** (the チャート) gives:

- the serial number and the kanji;
- its meanings, as a Japanese gloss with English, Korean and Portuguese;
- the old form where one exists;
- stroke order and the stroke count;
- kun readings in hiragana (okurigana after a hyphen) and on readings in katakana;
- an origin drawing with a short story;
- two to four example words, each with its reading and meaning;
- special readings, marked with an asterisk.

The charts hold no example sentences.

**Each lesson** opens with a front page that guesses meanings from drawings, mostly matching tasks. Then come 練習1 (fifteen readings to write in hiragana; items 11–15 are sentences) and 練習2 (the kanji to write in boxes).

**Each test practice** has 28 four-option items: 14 readings (もんだい1) and 14 spellings (もんだい2). Part 1's comprehensive exercise has 71 items and Part 2's 113, ending with realia.

The book has no romaji anywhere. The readings, all example words, the readings tested in context and the distractor sets for every kanji are in `reference/notes/nihongo-challenge-kanji-part1.md` and `reference/notes/nihongo-challenge-kanji-part2.md`.

## Build plan

Each phase is built by Opus builders working only in `niwa/course/tools`, following the intake steps in [builds.md](builds.md#adding-the-course-content), and checkpointed. The personal profile is never touched.

- **Phase A: the course skeleton.** Done, 28 October 2026.
  - Lay out the 15 stones and the Learn path in `course/tools/seed-curriculum.mjs`.
  - Remove the personal lessons, practices and books from the course copy, with their seed entries, path places and transfer checks.
  - Pilot Lesson 1's three parts as app lessons, each with its minimum practice and book and its transfer question.
  - Build with `node tools/build.mjs --profile course`, validate, and preview on port 4174.
  - Resolve the engine couplings that bite once the copy diverges ([builds.md](builds.md#engine-couplings)). The first is `app.js`'s default selected node `'foundations'`, which the course will not have.
- **Phase B: Lessons 2–5.** Still all kana. Done, 28 October 2026.
- **Phase C: Lessons 6–10.** Kanji begins; the verb charts arrive; casual speech starts. The course's `kanji` block starts here: names in `kanji.properNouns`, and the met stage in the book's furigana form. Done, 29 October 2026.
- **Phase D: Lessons 11–15.** Giving and receiving, requests, invitations, advice and apologies, with Lesson 12's four parts and Lesson 15's two. Done, 29 October 2026.
- **The Kanji page track.** Done, 29 October 2026 ([data-contract.md](data-contract.md#kanji-sets)):
  - `kanji.characters`, 310 kanji in 31 lessons from `course/tools/kanji/`, every word and special reading with its `markup`;
  - rebuilt the same day as sets of ten (owner): the set list, each set's board and reading pages, and its practice of five questions a kanji, which opens the next set; the first build's daily character round and three-pass mastery are gone, and mastery is undefined for now;
  - the learner state `state.kanjiChars` version 2 (read kanji, practised sets, the practice under way), separate from word mastery;
  - the course's `kanji.policy` (`metStyle: 'furigana'`, `opensAt: 0`); the track's own numbering gives the Nihongo Challenge order, so no `kanji.course` list is needed;
  - the course brush font, regenerated with `--dist course/dist`.
- **Practices in parts.** Done, 29 October 2026: the one-set practices per part became multi-part practices, 59 practices in 240 parts ([Practice](#practice)).
- **Afterwards:** Practice from the exercises book, then Books.

## Open questions for the owner

Each has the default a builder would take without an answer.

1. **Where the アクティビティー goes.** As a practice, a checkpoint, or a book? *Default:* a general practice homed on the lesson's last part, requiring all its parts.
2. **What replaces かきましょう.** *Default:* sentence assembly from tiles on the book's model frame, inside that lesson-level practice; no separate item.
3. **Must a Nihongo Challenge kanji lesson come first?** That is, must it be done before a Tsunagu lesson that shows that kanji? *Default, taken and built (29 October 2026):* no gate. Learn shows the book's furigana whatever the Kanji page has reached; only the upgrade to plain kanji waits for mastery.
4. **New kanji per day on the Kanji page.** *Default, taken and built (29 October 2026):* no daily cap. Kanji open one at a time in book order, each after the previous kanji's walkthrough is finished: one new card at a time, while the round has room.
5. **Romaji style for kanji lessons.** *Default, taken and built (29 October 2026):* the handout's style (gakusee, kyoo, wa for は), so it matches what students see in class. A hyphen only between a numeral and its counter and at the okurigana; next to a small っ the doubled consonant follows the hyphen (ro-ppun, ju-ppun, mi-ttsu); a verb's final う is written ou (kayou, omou).
6. **The met stage's look.** *Default, taken and built (29 October 2026):* the book's furigana (kanji with kana above), not the personal profile's kana with kanji above.
7. **Large word lists.** Parts run up to 52 handout words against the content standard's 6–12. *Default:* all of the part's handout words go in its lesson, relaxing the 6–12 guideline for the course. The handout's additional words go to the part's practice.
8. **Stone names.** Stones carry a kanji in the garden, which for Lessons 1–5 would show kanji the book has not introduced. *Default:* the book's lesson title in its own script with an English line (あいさつする, Giving greetings), and no kanji on stones 1–5.
9. **Checkpoints.** *Default:* one per stone, after its last part, recipes drawn from the Can-doチェック of each part.
10. **Personal content in the course.** *Recommended:* none. The course holds only Tsunagu-based content, and every personal lesson, practice and book is removed from the course copy.

### Questions for the Japanese educator

Points of usage a teacher should settle. Each has the default the course uses now.

1. **3かい and 9じ8ぷん.** 3かい is taught as さんがい only, and さんかい is marked wrong. 9じ8ぷん treats はちぷん as wrong. Both alternatives are accepted in current usage. *Default: keep the book's readings.*
2. **12じぐらいに.** The 3-3 scene and its book say 12じぐらいに いきます. Is that fine at this level, or should it be 12じに, since ごろ is not taught yet? *Default: kept.*
3. **えん on the sale flyer.** The Lesson 2 flyer (fl02) prints えん in kana. The book's own Lesson 2 reading uses 円 with furigana. *Default: kana, since Learn stays kana-only through Lesson 5.*
4. **ひとつ…とお for things.** Notebooks and cups are counted with ひとつ…とお at this level. *Default: kept, as the book's 2-1 does.*
5. **Aランチ, Bランチ, Cランチ.** The menu labels use Latin letters in an otherwise kana-only course. *Default: kept, as the book's menus do.*
6. **どちらが いいですか in 5-1.** The staff line uses どちら, met in 1-1 as "which/where (polite)". *Default: kept.*
7. **Lama's pronoun.** The book's character page (p. 15) draws ラマ with short hair, in the same style as Tan and Tanaka. Nothing in the book states a gender. *Default: "he" everywhere, as the drawing suggests.*
8. **The hour counter じ.** It has no kanji form, although the book prints 8時 from 9-1 and stone 14 writes {時|じ}. Should じ get a kanji form, and in which lesson's drill? *Default: the kana record is kept, 8じ in text.* The month (がつ) and minute (ふん) counters are mixed the same way in stones 11–15.
9. **だいがくせい and たべもの.** They stay kana records although the book prints 大学生 and 食べもの in Lesson 10; switching them needs new drill items (there is room in l10p3). *Default: kana for now.*
10. **こちら、サラさんです.** The course keeps さん when introducing an in-company colleague, as the book does. Fine for this course? *Default: as the book.*
11. **聞きます for “listen”.** Only the “ask” record (`kikimasu-ask`) has the kanji form 聞きます; the “listen” record stays ききます. From Lesson 11 the lessons write 聞きます for both, as the book does, so a “listen” token is credited to “ask”, and two checkpoint recipes (l12p4-X1 かえっても, l13p3-X1 きいて) stay in kana because the recipe check needs a declared form. Should “listen” get its own kanji form? *Default: as now.*
12. **行かなくても or 来なくても.** In 12-4, asking the manager whether you can skip your shift now says アルバイトに {行|い}かなくても いいですか, since the speaker goes to where the listener is. *Default: 行かなくても.*
13. **The colleagues’ genders.** Stones 11–15 make いのうえ and なかむら men and たなか a woman, following stone 1 and the stone 4 notes; stones 1–10 still mix “Mr” and “Ms” for いのうえ and たなか. *Default: Mr Inoue, Mr Nakamura, Ms Tanaka; an English-only fix for stones 1–10.*
14. **なら in three frames.** 13-1 (［N］なら, taking up a topic), 14-3 (［V-dic］なら、～が いいです) and 15-1 (な-adjective and noun なら, a condition) are separate patterns, as the book’s ぶんけい are. Should 13-1 and 14-3 count as one pattern? *Default: separate.*

#### From the practice-parts reviews (29 October 2026)

What the fifteen stone review records (`content-staging/practice-parts/reviews/lNN.md`, section "Left for a human educator") could not settle. Nothing here is changed yet; each keeps what the content does now.

**Course-wide**

- **Mr/Ms Nakamura and Tanaka.** Question 13's default is Mr Nakamura and Ms Tanaka, but the l10 unit and fish say "Ms Nakamura" and "Mr Tanaka", and every l14 unit and practice says "Ms Nakamura", while the l12 review changed two l12 lines to "Mr Nakamura". One English-only sweep across stones 1–10 and 11–15 is needed, and question 13 then reconciled with it (l10, l12, l14).
- **Dates.** Dates are written as kana words (5がつ いつか, 11がつ 3か), never a numeral with 日, while the book prints 3月10日 in the Lesson 13 reading. Should dates switch to {日|か}／{日|にち} once 日 and 月 are presented? (l12, l13)
- **The ○／× instruction** ただしければ ○、ちがえば ×。 is course-wide (76 uses, from early stones) and uses the ～ば form taught in 14-2. It works as a set phrase; should an earlier wording replace it? (l08, l09)
- **Kana words the book writes in kanji.** でんしゃ (電車 in 10-3, both kanji presented by Lesson 9), だいがくせい and たべもの (Lesson 10, question 9), ほん (本 from 7-1), はなし (話 in Lesson 7's activity) and みます (見 is a Lesson 6 kanji, yet the units write みます／みて) all stay kana. Should each switch with its lesson and fish? (l07, l09, l10)
- **おかね vs お金 within Lesson 12.** The 12-3 unit and asking-for-help I2 write おかね; the `okane` record and the l12p1 fish write お{金|かね}. Pick one for the lesson. (l12)
- **Records written in kanji, used in earlier stones.** でんわばんごう, こんしゅう, らいげつ, がいこくじん and others are `{漢字|かな}` records that earlier stones reuse; the engine shows kana until the kanji is met (verified in the app: でんわばんごう shows as kana in First Greetings). Is that convention fine, or should earlier stones get kana records? (l01, l03, l04, l07)
- **Record ownership.** Several records are defined in a later fish than the first one that uses them (`tsumaranai`, `uketsuke`, `haikingu`, `doraibu`, udon and the other l05 dishes, `tebukuro`, `apuri`, the l14p1 symptom words). Moving them is structural, not a Japanese decision. (l02, l05, l06, l11, l12)
- **［activity］に 行きます** (スキーに 行きます) is taught in 6-1 (holiday-plans-and-reasons, part 3) as a usage of 5-1's purpose pattern, rather than from the book's 7-1 ぶんけい. Keep, or rebuild part 3 with しに 行きます? (l06)
- **おくります** is one verb (送る) in two records, `okurimasu-send` (11-1 handout) and `okurimasu-escort` (11-3). Merge them into one record with two senses? (l11)

**Per stone** (one line each; read the record for the detail)

- **Stone 1** (`reviews/l01.md`): あのう、しつもんです as classroom speech; ベトナム used untaught by l01p1 (belongs in the l01p1 or l01p3 Words); じゅうページ vs じゅっページ.
- **Stone 2** (`reviews/l02.md`): ひとつ…とお for からあげ where ～こ is more native; みどりの "the green one" relies on pronoun-の the fish does not require; うけつけ for a department-store desk.
- **Stone 3** (`reviews/l03.md`): the made-up rail map is not consistent across items (no map is drawn); a hotel clerk's あるいて いきます vs あるいて 5ふんです; くやくしょ glossed "city hall".
- **Stone 4** (`reviews/l04.md`): いつも sorted as "with ～ます"; the accepted order おさらが テーブルの うえに あります; きょうだい vs ごきょうだい for someone else's siblings.
- **Stone 5** (`reviews/l05.md`): べつべつに／いっしょに vs ～で at the register; ひる 11じから on the tonkatsu card.
- **Stone 6** (`reviews/l06.md`): ダイビングが ゆうめいです vs ～で ゆうめい; あめじゃ なかったです vs the book's あめは ふりませんでした; ［activity］に 行きます (above).
- **Stone 7** (`reviews/l07.md`): relaying what someone said as a plain statement, before ～そうです; ほん and はなし in kana (above).
- **Stone 8** (`reviews/l08.md`): びょうきを しました as bookish (the handout's wording); へ taught as the only place particle with 行く; まあまあ tagged as an adverb.
- **Stone 9** (`reviews/l09.md`): sign wording (たべもの・のみもの きんし vs いんしょく きんし); a section chief's telephone register to outside callers; みます in kana (above).
- **Stone 10** (`reviews/l10.md`): この しごとに いい vs むいて いる; しんせつ about one's own family vs やさしい; でんしゃ and the colleagues' genders (above).
- **Stone 11** (`reviews/l11.md`): たいせつに します the day after a gift; 先生に vs 先生には in a note to the teacher; おくります (above).
- **Stone 12** (`reviews/l12.md`): おかね (above); ぎんこうの まどぐち at a post office and こうじ vs こうじちゅう; びょういん used in one fish and avoided in another; the card title おとしものの とどけ.
- **Stone 13** (`reviews/l13.md`): dates (above); ええ、よろこんで to a section chief vs はい; また こんど used by the l13p3 lesson drills without a Words row.
- **Stone 14** (`reviews/l14.md`): Nakamura's gender (above); いい バイトを 聞いた ほうが いい vs an embedded question; この くすりは ねむく なりますから as label-style; 1回 vs 一度.
- **Stone 15** (`reviews/l15.md`): reading a friend's manga as a mild thing to apologise for; the もうしわけ ありません／すみません／ごめんなさい split as a simplification; わたしの しっぱいでした vs わたしの ミスでした.


## Sources

The PDFs, in `reference/textbooks/`, with their original download names:

- `tsunagu-nihongo-shokyu-1.pdf` ← "[音声DL] つなぐにほんご 初級1 Tsunagu Nihongo Beginner Level Series -- ヒューマンアカデミー日本語学校著 -- Tōkyō, 2017_4 -- アスク出版 -- 9784866390666.pdf"
- `tsunagu-nihongo-handout-1-ala.pdf` ← "tsunagu nihongo handout 1 ALA.pdf"
- `nihongo-challenge-n4-n5-kanji.pdf` ← "にほんごチャレンジ N4・N5 [かんじ]=Nihongo challenge N4 N5 [kanji] -- 唐澤和子; 渋谷幹子; 木上伴子 -- 2010 -- アスク出版 -- 9784872177572.pdf"
- `minna-no-nihongo-1-translation-grammar-notes.pdf` ← "Minna No Nihongo Second Edition; Elementary Japanese I; -- Tsuruo Yoshiko -- 2012 -- スリーエーネットワーク -- 9784883196043.pdf" (the scan is the English Translation & Grammar Notes, not the 本冊)
- `minna-no-nihongo-2-translation-grammar-notes.pdf` ← "Minna No Nihongo 2nd ver _Bk2 Translation & Grammar Note -- Yoshiko Tsuruo -- 2013 -- 3A network -- 9784883196647.pdf"
- Ignored, not kept: "1500 Essential Vocabulary for the JLPT N4" (アークアカデミー, ASK 2016, 9784872179828) and "はじめての日本語能力試験 N5 単語1000" (アークアカデミー, ASK 2017).

The analysts' notes, in `reference/notes/`:

- `tsunagu-lessons-01-05.md`: the book's own guide to how a lesson is built (pp. 7–15), then Lessons 1–5 part by part: scenes, can-dos, patterns, drills, はなしましょう, vocabulary, lesson blocks and the kana-only script.
- `tsunagu-lessons-06-10.md`: Lessons 6–10 in the same detail, with the kanji words of each lesson, the verb-form charts and the introduction of casual speech.
- `tsunagu-lessons-11-15.md`: Lessons 11–15 in the same detail, including the four-part Lesson 12 and the two-part Lesson 15, checked against the answer booklet.
- `tsunagu-appendix-cando-patterns-kanji.md`: the back matter: the vocabulary index, the activity glossary, the master table of can-dos and patterns (pp. 340–346) transcribed in full, and the per-lesson kanji list (p. 347).
- `tsunagu-handout-vocabulary.md`: the ALA handout: its layout and codes, per-part can-dos, additional words and grammar, part-of-speech counts (924 rows), and its script conventions.
- `minna-no-nihongo-reference.md`: what the two Minna scans are, the grammar points of all 50 lessons, and a cross-map from Tsunagu's lessons to the Minna lessons that explain them.
- `nihongo-challenge-kanji-part1.md`: the kanji book's method, the anatomy of an entry and a lesson, its exercise types, kanji 1–110 with readings and example words, the tests, readings in context, and notes for the app.
- `nihongo-challenge-kanji-part2.md`: kanji 111–310 with readings and example words, the exercise and test formats, the columns and comprehensive exercise, readings in context and look-alike sets.
