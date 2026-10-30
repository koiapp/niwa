// Progression: one shared answer to "what should I study next?", read from the authored Learn path (curriculum.json
// `path` version 2, checked by tools/curriculum-path.mjs), the learner's completions and started lessons. The path is
// one sequence, `core`, of every placed lesson: optional content is optional practices, never lessons
// (docs/learning-loop.md decision 14), so there are no electives to choose. Dependency-free and DOM-free. Lesson access
// is lessonLock below: a lesson opens in place once what it builds on is finished, and a due checkpoint (checkpoints.mjs)
// holds the lessons after it.
export const PROGRESSION_VERSION = 1;
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const plainObject = v => !!v && typeof v === 'object' && !Array.isArray(v);
const count = v => Number.isInteger(v) && v >= 0;
// The same rule the path validator uses: only a lesson with a unit is playable; outline titles are never recommended.
const unitPlayable = l => Array.isArray(l?.words) && Array.isArray(l?.sections) && l.sections.length > 0;

// `active` is the lesson in progress, resumable until finished or left. `left` is the lesson the learner chose to leave
// and how many core lessons were done then. Saves from before path version 2 also held `electives` and `acknowledged`
// (the elective choice); they are dropped when read.
export const emptyProgression = () => ({version: PROGRESSION_VERSION, active: null, left: null});
const base = p => p?.version === PROGRESSION_VERSION ? p : emptyProgression();

// ── Reading the path ─────────────────────────────────────────────────────────────────────────────────────
// Each placed lesson's position in `core`.
const rankOf = path => new Map((path?.core || []).map((id, i) => [id, i]));
// Prerequisites of a lesson not yet finished, in path order. Unplaced lessons have none.
export function missingPrerequisites(path, id, completed = []) {
  const done = new Set(completed), rank = rankOf(path);
  return (path?.requires?.[id] || []).filter(p => !done.has(p)).sort((a, b) => (rank.get(a) ?? 1e9) - (rank.get(b) ?? 1e9));
}

// The learner's view of the path. `lessons` are lessons.json lessons; `playable` says which have a unit; `started`
// says whether a lesson was started (session.mjs lessonStarted). Completions may be in any order, including a later
// lesson finished before an earlier one: nothing is rewound and each lesson is judged on its own prerequisites.
function context(path, {lessons = [], completed = [], started = () => false, progression, playable = unitPlayable} = {}) {
  const p = base(progression), byId = new Map(lessons.map(l => [l.id, l])), done = new Set(completed);
  const available = id => byId.has(id) && playable(byId.get(id));
  const ready = id => (path?.requires?.[id] || []).every(x => done.has(x));
  const coreDone = (path?.core || []).filter(id => done.has(id)).length;
  return {p, rank: rankOf(path), done, available, ready, coreDone, started};
}
// The first unfinished, playable lesson in path order whose prerequisites are all finished, or null.
const nextCore = (path, c) => (path?.core || []).find(id => !c.done.has(id) && c.available(id) && c.ready(id)) || null;

// The lesson that could be started next on the path, as a list of at most one: never a finished or unplayable lesson.
export function eligibleLessons(path, opts) {
  const c = context(path, opts), next = nextCore(path, c);
  return next ? [next] : [];
}

// The one next action: {kind, lesson, started, position}. `kind` is
//   resume   the active lesson;
//   core     the next lesson in path order;
//   review   nothing new is left on the path: the review destination.
// `position` is {coreDone, coreTotal, coreEnded}. The same inputs always give the same answer.
export function nextStep(path, opts = {}) {
  const c = context(path, opts), coreTotal = (path?.core || []).length, core = nextCore(path, c);
  const position = {coreDone: c.coreDone, coreTotal, coreEnded: !core};
  const step = (kind, lesson) => ({kind, lesson, started: !!lesson && !!c.started(lesson), position});
  const active = c.p.active;
  if (active && !c.done.has(active) && c.available(active)) return step('resume', active);
  return core ? step('core', core) : step('review', null);
}

// What a topic page suggests: the course's own next lesson when it is in this topic; otherwise this topic's earliest
// ready lesson on the path; otherwise its earliest unfinished one on the path with what it still needs ({lesson,
// needs}); otherwise its first lesson, all done. `topicLessons` are the topic's lessons.
export function topicStep(path, topicLessons, opts = {}) {
  const c = context(path, opts), next = nextStep(path, opts), ids = new Set(topicLessons.map(l => l.id));
  const ordered = topicLessons.map(l => l.id).filter(id => c.available(id)).sort((a, b) => (c.rank.get(a) ?? 1e9) - (c.rank.get(b) ?? 1e9));
  if (!ordered.length) return null;
  if (next.lesson && ids.has(next.lesson)) return {lesson: next.lesson, needs: [], course: true};
  const open = ordered.filter(id => !c.done.has(id) && c.rank.has(id));
  const ready = open.find(id => c.ready(id));
  if (ready) return {lesson: ready, needs: [], course: false};
  if (open.length) return {lesson: open[0], needs: missingPrerequisites(path, open[0], [...c.done]), course: false};
  return {lesson: ordered[0], needs: [], course: false, finished: true};
}

// ── Access ───────────────────────────────────────────────────────────────────────────────────────────────
// Lessons open progressively, shown in place. A lesson is open when it is finished, started (session.mjs
// lessonStarted), or every prerequisite is finished and no due checkpoint stands in front of it. `checkpoint` is the due
// checkpoint ({n, after}, checkpoints.mjs dueCheckpoint) or null: while it is due, every lesson after its boundary that
// is neither started nor finished waits for it. {open, needs, checkpoint}: `needs` the unfinished prerequisites in path
// order, `checkpoint` the n a lesson waits for. Sensei mode (`openAll`) opens every lesson, whatever the state.
export function lessonLock(path, id, {completed = [], started = () => false, checkpoint = null, openAll = false} = {}) {
  if (openAll || completed.includes(id) || started(id)) return {open: true, needs: [], checkpoint: null};
  const core = path?.core || [], at = core.indexOf(id), boundary = checkpoint ? core.indexOf(checkpoint.after) : -1;
  if (at >= 0 && boundary >= 0 && at > boundary) return {open: false, needs: [], checkpoint: checkpoint.n};
  const needs = missingPrerequisites(path, id, completed);
  return {open: !needs.length, needs, checkpoint: null};
}
// The open lessons among `ids`, in path order (unplaced lessons last), for comparing before and after a finish.
export function openLessons(path, ids, opts = {}) {
  const rank = rankOf(path);
  return ids.filter(id => lessonLock(path, id, opts).open).sort((a, b) => (rank.get(a) ?? 1e9) - (rank.get(b) ?? 1e9));
}

// ── Changes ──────────────────────────────────────────────────────────────────────────────────────────────
// Opening a lesson to learn it (not a closed-book review) makes it the active lesson.
export function enterLesson(progression, id, {completed = []} = {}) {
  const p = base(progression);
  if (completed.includes(id) || p.active === id) return p;
  return {...p, active: id, left: p.left?.lesson === id ? null : p.left};
}
export function finishLesson(progression, id) {
  const p = base(progression);
  return {...p, active: p.active === id ? null : p.active, left: p.left?.lesson === id ? null : p.left};
}
// Leaving the active lesson keeps its answers and records it as left, with how many core lessons were done then.
export function leaveLesson(progression, path, {completed = []} = {}) {
  const p = base(progression);
  if (!p.active) return p;
  const done = new Set(completed);
  return {...p, active: null, left: {lesson: p.active, core: (path?.core || []).filter(id => done.has(id)).length}};
}

// ── Saved state and backups ──────────────────────────────────────────────────────────────────────────────
// Reads `progression` from saved state or a backup. `electives` and `acknowledged`, the elective choice of path version
// 1, are dropped in both modes, whatever they hold, so saves and backups from before version 2 stay valid. Strict reads
// (restore) reject other malformed values; lenient reads (local state) fall back to defaults. An active or left lesson
// that is unknown (or, for active, already finished) is cleared.
export function readProgressionState(value, path, lessons = [], {strict = false} = {}) {
  const fail = msg => { if (strict) throw Error(msg); }, out = emptyProgression(), raw = value?.progression;
  if (raw === undefined || raw === null) return {progression: out};
  if (!plainObject(raw) || raw.version !== PROGRESSION_VERSION) { fail('This backup contains invalid course choices.'); return {progression: out}; }
  const known = id => lessons.some(l => l.id === id), completed = Array.isArray(value?.completed) ? value.completed : [];
  if (raw.active !== undefined && raw.active !== null) {
    if (typeof raw.active !== 'string' || !SLUG.test(raw.active)) fail('This backup contains an invalid lesson in progress.');
    else if (known(raw.active) && !completed.includes(raw.active)) out.active = raw.active;
  }
  if (raw.left !== undefined && raw.left !== null) {
    if (!plainObject(raw.left) || typeof raw.left.lesson !== 'string' || !SLUG.test(raw.left.lesson) || !count(raw.left.core)) fail('This backup contains an invalid left lesson.');
    else if (known(raw.left.lesson)) out.left = {lesson: raw.left.lesson, core: raw.left.core};
  }
  return {progression: out};
}
