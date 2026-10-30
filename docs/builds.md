# Content profiles and builds

Niwa has one engine and two content loads, called profiles. Each profile builds into its own copy of the app.

- **personal** is the owner's own course of study: the content Niwa has always had, in `niwa/tools`, built into `niwa/dist`.
- **course** is a second app for the owner's students, adapted to the curriculum of the course the owner teaches. It lives under `niwa/course/` and builds into `niwa/course/dist`.

The course material was handed over on 28 October 2026 ([course-curriculum.md](course-curriculum.md)). The course content now holds the book's own course, not the personal lessons: the full つなぐにほんご 初級1 content, 15 stones and 44 app lessons with their practices, books and checkpoints (Phases A to D, done 29 October 2026); its layout and how to revise it are in [course/tools/README.md](../../course/tools/README.md). Since 29 October 2026 its 59 practices are multi-part, 240 parts with 1,886 Words-table words and 3,537 counted items, and the course vocabulary holds 1,522 records ([course-curriculum.md](course-curriculum.md#practice)). The personal build is never touched by course work.

The authoring documents apply to both profiles: [lesson-template.md](lesson-template.md), [content-standard.md](content-standard.md), [data-contract.md](data-contract.md) and [learning-loop.md](learning-loop.md).

## Layout

The course folder mirrors the personal layout, so every relative path inside the content files works unchanged: the generators import engine modules from `../dist/` and write to `../dist/` in both places.

| Path | What it is |
|---|---|
| `niwa/profiles/personal.json` | Identity of the personal build: id `personal`, name *Niwa*, title *Niwa — Japanese for everyday life*, storage key `niwa-v1`, backup tag `niwa`, backup file `niwa-progress.json`, root `.`, port 4173 |
| `niwa/profiles/course.json` | Identity of the course build: id `course`, name *Niwa Course*, title *Niwa Course — Japanese for everyday life*, storage key `niwa-course-v1`, backup tag `niwa-course`, backup file `niwa-course-progress.json`, root `course`, port 4174 |
| `niwa/tools/build.mjs` | The build command for either profile |
| `niwa/tools/` | Personal content and the shared tool scripts |
| `niwa/dist/` | The engine, and the personal build output. `dist/profile.mjs` is generated from `profiles/personal.json`; `app.js` reads the storage key, backup tag and backup file name from it |
| `niwa/course/tools/` | Course content, plus synced copies of the shared tool scripts (see `course/tools/README.md`) |
| `niwa/course/dist/` | Course build output: the engine synced from `niwa/dist`, the course content files and `course/dist/profile.mjs`. Git ignores it except the hand-kept files `checks.mjs`, `lesson-retirements.mjs` and the kanji brush font |

## The build command

Run from any folder; paths resolve from the script.

```
node tools/build.mjs                          # personal (the default)
node tools/build.mjs --profile course         # course
node tools/build.mjs --all                    # both, personal first
node tools/build.mjs --profile course --no-validate
```

For each profile the build runs four steps in that profile's `tools` folder:

1. `seed-curriculum.mjs` writes `dist/curriculum.json` (topics, the garden map, the Learn path, kanji checks).
2. `seed-lessons.mjs` reads every unit and practice file and writes `dist/lessons.json`.
3. `content-inventory.mjs --write` refreshes `dist/docs/content-inventory.md`.
4. `validate.mjs` checks the content, including the learning loop and the inventory. `--no-validate` skips this step, for a quick look while content is half written; never publish a build that has not validated.

Before the four steps, every build writes `dist/profile.mjs` from its profile JSON. A course build first syncs the engine and the shared tool scripts into `niwa/course/` (next section). It stops with a message if `course/tools` has no seed files or `course/dist` has no `checks.mjs` or `lesson-retirements.mjs` of its own. Files are only written when their bytes change, so a second build changes nothing. `--all` builds every profile in `niwa/profiles/`, personal first; `--help` prints the usage.

After a content change, review the affected rows in [curriculum-audit.md](curriculum-audit.md) and the explanatory docs as before.

## Shared and separate

**Engine-owned** files are copied from `niwa/dist` into `niwa/course/dist` on every course build, overwriting what is there (`ENGINE_OWNED` in `build.mjs`):

- every top-level `*.mjs` except `profile.mjs`, `checks.mjs` and `lesson-retirements.mjs`;
- `app.js` and every `*.css`;
- `index.html`, with its `<title>` rewritten to the profile title;
- `site.webmanifest`, with `name` rewritten to the profile title and `short_name` to the profile name;
- `field.jpg`;
- `assets/**`, except the kanji brush font (`assets/kanji/brush.woff2` and `brush-chars.json`);
- `docs/*.md`, except `docs/content-inventory.md`.

`demos/` and dotfiles are never synced. An engine file left in `course/dist` that no longer exists in `niwa/dist` (deleted or renamed) is removed. The shared tool scripts are copied from `niwa/tools` into `niwa/course/tools` the same way (`SHARED_TOOLS` in `build.mjs`; `build.mjs` itself is never copied): `validate.mjs`, `loop-check.mjs`, `coverage.mjs`, `curriculum-path.mjs`, `content-inventory.mjs`, `lesson-pacing.mjs` and `brush-font.py`.

**Profile-owned** files belong to one profile and are never overwritten by the sync: in `course/tools`, everything that is not a shared tool script; in `course/dist`, the files listed in `PROFILE_OWNED` in `build.mjs`:

- in `course/tools`: `units/`, `practices/`, `seed-lessons.mjs` (lesson entries, passages, vocabulary, references and support), `seed-curriculum.mjs` (topics, the garden map, the Learn path, kanji checks), `early-loop-content.mjs`, `transfer-passages.mjs`, `recovery-sentences.mjs`, `patterns.mjs`, `teaching-targets.mjs`, `teaching-reviewed/`, `teaching-baseline.json`, `kanji-drafts/` and `kanji/` (the Kanji page's character track, one file per Nihongo Challenge lesson);
- in `course/dist`: `lessons.json`, `curriculum.json` and `docs/content-inventory.md`, which the build regenerates; `checks.mjs` and `lesson-retirements.mjs`, which look like engine files but are hand-edited content keyed by lesson; the kanji brush font, which `brush-font.py` makes from the content's kanji (the course's is regenerated with `python -P tools/brush-font.py <ttf> --dist course/dist` whenever its kanji change, last on 29 October 2026: 1031 characters, 581 KB; it needs the original TTF, which is kept outside the repo); and `profile.mjs`, which the build writes.

The rule of thumb: **engine changes are made once, in `niwa/dist`, and reach the course on its next build. Content changes are made per profile.** One exception needs care: the generator part of `seed-lessons.mjs` (roughly its last 200 lines) is engine code inside a content file. A fix there must be copied by hand into `course/tools/seed-lessons.mjs`; the file is mostly content and is deliberately duplicated rather than synced.

Never edit a synced file inside `niwa/course/`: the next course build overwrites it. Make the change in `niwa/dist` or `niwa/tools`.

## Previewing

| Build | Launch config | Serves | Address |
|---|---|---|---|
| personal | `niwa` | `niwa/dist` | http://127.0.0.1:4173 |
| course | `niwa-course` (workspace), `course` (`niwa/.claude/launch.json`) | `niwa/course/dist` | http://127.0.0.1:4174 |

Build the course before previewing it; most of `course/dist` exists only after a course build. Test in a separate tab on `127.0.0.1` so the owner's own progress tab is left alone.

## Progress, storage and backups

Each build keeps its progress under its own localStorage key (`niwa-v1` and `niwa-course-v1`) and stamps its backups with its own tag (`niwa` and `niwa-course`). So the two builds never share or prune each other's progress, even when both are served from the same address, and a backup made in one build is refused by the other. Backups download as `niwa-progress.json` and `niwa-course-progress.json`.

## Adding the course content

The owner hands over the course material in any form: a syllabus, a unit list, vocabulary, dialogues, readings. A content builder (Claude, Codex or a Flow Note card) adapts it into `niwa/course/tools`. Work only there; the personal content stays as it is.

1. **Map the course.** List the course units in order and decide which become topics (garden stones) and which become lessons. Each lesson is a textbook unit that teaches core material only; extra variety goes into practices, and recall into books ([learning-loop.md](learning-loop.md)).
2. **Remove what the course does not want.** Delete the personal lessons, practices and books the course will not use from the course copy, with their entries in `seed-lessons.mjs`, their places in the Learn path and their transfer checks. For example, if the course has no dating unit, the *Dating and relationships* topic and its practices go.
3. **Keep or adapt what fits.** A personal lesson that matches a course unit, such as *A table for two* for a restaurant unit, can stay and be reworded to the course's vocabulary.
4. **Write the new lessons.** Each is `course/tools/units/<id>.mjs` ([lesson-template.md](lesson-template.md)) with a matching lesson entry in `course/tools/seed-lessons.mjs`, and a transfer question in `course/dist/checks.mjs`.
5. **Write the practices and books.** Practices go in `course/tools/practices/`; books (passages and unseen texts) in `seed-lessons.mjs`, `early-loop-content.mjs` or `transfer-passages.mjs`. Every lesson needs a general practice and a general book.
6. **Lay out the garden and the Learn path** in `course/tools/seed-curriculum.mjs`.
7. **Declare the teaching targets** in `course/tools/teaching-targets.mjs` so the teaching-coverage check knows what each lesson teaches.
8. **Build:** `node tools/build.mjs --profile course` must pass. Preview on port 4174 and work through the new lessons.
9. **Check the engine couplings** below, and regenerate the brush font if the course uses kanji the personal content does not: `python -P tools/brush-font.py <ttf> --dist course/dist`. The validator fails while a track kanji is missing from it.
10. **Checkpoint** after each batch.

Checklist before handing a course build to students:

- [ ] Every course unit is a lesson, practice or book, in the course's order
- [ ] No personal-only content is left in the course copy
- [ ] `node tools/build.mjs --profile course` passes with validation
- [ ] The couplings below are resolved
- [ ] The brush font covers the course's kanji
- [ ] The personal build still passes: `node tools/build.mjs`

## Engine couplings

Some engine files still name personal content by id. While the course content is a copy, nothing breaks; once it diverges, these need attention. Content minimums that differ per profile (kanji words per lesson, unseen texts, stages per stone) are not couplings: a profile sets them in its `curriculum.json` `rules` ([data-contract.md](data-contract.md#content-rules)).

| Where | What | When ids are unknown |
|---|---|---|
| `checks.mjs` `transferChecks` | One transfer question per lesson (profile-owned copy) | The validator expects one per lesson: **write the course's own** |
| `lesson-retirements.mjs` | Retired lesson ids (profile-owned copy) | Clear or rewrite for the course |
| `kanji-words.mjs` `PROPER_NOUNS` | Names treated as proper nouns | **Watch**: course names stay unrecognised until the course adds them in its `lessons.json` `kanji.properNouns` ([data-contract.md](data-contract.md#kanji-policy-and-course)) |
| `app.js` default selected node `'foundations'` | The topic selected first | **Watch**: must exist in the course, or be made profile-driven |
| `recall.mjs` `CONVERTED`, `OLD_PRACTICES` | Migration of old personal ids | Harmless; unknown ids are ignored |
| `loop.mjs` `LEGACY_ROUTES` | Old personal addresses | Harmless |
| `checkpoints.mjs` `VENUES` | Checkpoint scenes | **Not a fallback**: a recipe whose `venue` or `taught` is not a `VENUES` key is a validator failure. Use the existing venues, or add generic ones to `VENUES` (engine) |
| `app.js` `PRACTICE_LOOK`, `BOOK_COVER_ASSIGNMENTS` | Koi per practice, cover per book | Falls back to defaults |
| `app.js` Course guide | Described the personal course | **Resolved (2026-10-28)**: content-derived. It opens on the topic of the first lesson on the Learn path, counts the lessons on the path, names the authored checkpoints (`path.checkpoints`) and no longer links the restaurant topic document |
| `validate.mjs` state-migration check | Expected practices `restaurant-review` and `everyday-dishes` | **Resolved (2026-10-28)**: the personal assertion runs only when both exist; otherwise the v2→v3 loop record round-trips with the content's first practice, and the rejections still run |
| `validate.mjs` unseen-text mutant | Picked a source lesson in the `restaurant` topic | **Resolved (2026-10-28)**: uses the first source with passages, mapped to a passage of another topic |
| `content-inventory.mjs` | Looked up lesson `f01`; Dating prose | **Resolved (2026-10-28)**: uses the first lesson on the Learn path; the optional-practice topics and where their practices appear are derived from the content |
| `garden.mjs` `'dating'` stone style | Style for one topic | Falls back |

The engine files are shared, so a coupling is resolved in `niwa/dist` (for example by reading a value from `profile.mjs`), never by editing the synced copy in `course/dist`.

## Publishing and packaging

Codex Sites publishes the personal build, GitHub Pages the course build, and the Android shell packages both:

- Codex Sites publishes `niwa/dist` (`niwa/.openai/hosting.json`).
- The course website is published to GitHub Pages with `node web/deploy-course.mjs` from the workspace folder (`--no-build` publishes the last build as is). It builds the course, mirrors `niwa/course/dist` into `web/site/`, a separate public git repository that the workspace repo ignores, and pushes it to the branch `gh-pages`; the site is served at `https://<owner>.github.io/<repo>/` (setup in the workspace `web/README.md`).
- The Android shell in the workspace `android/` folder has two Gradle product flavors (dimension `profile`): `personal` packs `niwa/dist` (application id `app.niwa`, app name Niwa) and `course` packs `niwa/course/dist` (application id `app.niwa.course`, app name Niwa Course), so the course APK installs beside the personal one.

Build the course before packaging it, then run `.\gradlew.bat assembleCourseDebug` in `android/` (`assemblePersonalDebug` for the personal APK). The course website is published by `web/deploy-course.mjs`, which builds the course first, since most of `course/dist` is not in git.

## Tests

`node --test` from `niwa` runs the test suite against the personal content only; the tests name hundreds of personal lesson and book ids. The course build runs the validator and the learning-loop check, but has no test suite of its own yet. A course test set comes later, once the course content exists. `tests/kanji-characters.test.mjs` and `tests/kanji-characters.browser.test.mjs` cover the Kanji page's character track on a fixture, so the personal suite exercises it although the personal content has no track.

## Rollback

Both repositories are checkpointed, so course content rolls back like anything else (`niwa/AGENTS.md`, Rolling back). Most of `course/dist` is a build output: after rolling back `course/tools` (or the tracked `course/dist/checks.mjs`), run `node tools/build.mjs --profile course` to rebuild it.

The profile switch itself landed on 2026-10-28 without a commit of its own, because concurrent checkpoints swept its files in: `1277344` (profiles, `app.js`, `validate.mjs`, `course/tools`, the tracked `course/dist` files), `7ab38ee` and `2169d28` (`.gitignore`, `tools/build.mjs`, `dist/profile.mjs`, launch configs, docs) and `93ef364` (verification fixes). Use those when picking a rollback point for the two builds.
