// Learn's view of the authored curriculum. Topic outlines are catalogue data, not access rules.
// Keep this independent of the DOM and saved state so the same decisions guard every entry point.
import {hasUnit} from './exercises.mjs?b=2bde53d';
import {lessonLock} from './progression.mjs?b=2bde53d';
import {pathOrder} from './checkpoints.mjs?b=2bde53d';

export function orderedTopicLessons(node, path, lessons) {
 const rank = new Map(pathOrder(path).map((id, i) => [id, i]));
 return lessons.filter(l => l.node === node && hasUnit(l) && Object.hasOwn(path.requires, l.id))
  .sort((a, b) => (rank.get(a.id) ?? Infinity) - (rank.get(b.id) ?? Infinity) || a.id.localeCompare(b.id));
}

// A lesson already opened or finished keeps its stone open. Otherwise, all direct prerequisites
// must have been started for an outline, and finished for entry (including the lesson's checkpoint). Sensei mode
// (`openAll`) opens every topic that has a lesson with a unit; one without keeps its normal result.
export function stoneState(node, path, lessons, opts = {}) {
 const units = orderedTopicLessons(node, path, lessons);
 if (opts.openAll && units.length) return 'open';
 if (units.some(l => lessonLock(path, l.id, opts).open)) return 'open';
 const started = id => (opts.completed || []).includes(id) || !!opts.started?.(id);
 return units.some(l => path.requires[l.id].every(started)) ? 'outline' : 'hidden';
}

// Preserve authored rows/entry levels and asset identity; remove empty rows and distant topics.
export function gardenRows(rows, path, lessons, opts = {}) {
 return rows.map(row => ({...row, nodes: row.nodes.filter(id => stoneState(id, path, lessons, opts) !== 'hidden')}))
  .filter(row => row.nodes.length);
}

// Group consecutive lessons by their catalogue stage AFTER ordering them by the teaching path.
// Stage titles and unbuilt titles must never put a prerequisite after a lesson that needs it.
export function topicLessonGroups(node, path, lessons) {
 const groups = [];
 for (const lesson of orderedTopicLessons(node.id, path, lessons)) {
  const title = node.stages.find(s => s.lessons.includes(lesson.title))?.title || 'Lessons';
  let group = groups.at(-1);
  if (!group || group.title !== title) groups.push(group = {title, lessons: []});
  group.lessons.push(lesson);
 }
 return groups;
}

// A topic page's planned lessons: per catalogue stage, the outline titles that are not written yet, as
// [{title, titles}] (stages with none left out). A title is written when a playable lesson of this topic has it, or when
// a practice has it: a lesson that became an optional practice keeps its catalogue title (data-contract.md "Node shape"),
// and it lives in Practice, so it is not a planned lesson either.
export function plannedTitles(node, lessons, practices = []) {
 const written = new Set([...lessons.filter(l => l.node === node.id && hasUnit(l)).map(l => l.title), ...practices.map(p => p?.title).filter(t => typeof t === 'string')]);
 return node.stages.map(stage => ({title: stage.title, titles: stage.lessons.filter(t => !written.has(t))})).filter(s => s.titles.length);
}

// Ordinarily the due checkpoint sits before the first lesson it holds. If that topic is itself
// still locked, keep the checkpoint on an accessible topic, after its completed boundary lesson.
// This also gives a final checkpoint a home when there is no following lesson.
export function checkpointLocation(path, lessons, checkpoint, opts = {}) {
 if (!checkpoint) return null;
 const access = {...opts, checkpoint};
 const after = path.core.slice(path.core.indexOf(checkpoint.after) + 1);
 const next = after.map(id => lessons.find(l => l.id === id)).find(l => l &&
  lessonLock(path, l.id, access).checkpoint === checkpoint.n && stoneState(l.node, path, lessons, access) === 'open');
 if (next) return {node: next.node, before: next.id, after: null};
 const boundary = lessons.find(l => l.id === checkpoint.after);
 return boundary && stoneState(boundary.node, path, lessons, access) === 'open'
  ? {node: boundary.node, before: null, after: boundary.id} : null;
}

// Resolve a bookmark before any content is rendered or marked as started. Unknown IDs still use
// the app's not-found page. Locked lessons return to their open topic, or Learn while it is hidden.
export function learnRoute(route, path, lessons, nodes, opts = {}) {
 const [kind, id] = route.split('/');
 if (kind === 'node' && nodes.some(n => n.id === id) && stoneState(id, path, lessons, opts) !== 'open') return 'field';
 if (kind === 'lesson') {
  const lesson = lessons.find(l => l.id === id);
  if (lesson && (!hasUnit(lesson) || !Object.hasOwn(path.requires, id) || !lessonLock(path, id, opts).open))
   return stoneState(lesson.node, path, lessons, opts) === 'open' ? `node/${lesson.node}` : 'field';
 }
 return route;
}

// The mark at the end of an open topic row: the arrow while nothing is solved, then a ring with the whole percent
// solved, then a check once the lesson is finished. A finished lesson keeps its check even after its exercises are
// reset. The percent is floored, so the ring never shows 0% and never reaches 100% before every item is solved;
// solved*100/total keeps exact percents exact (29 of 50 is 58%, where 29/50*100 floors to 57).
export function rowProgress({solved = 0, total = 0, done = false} = {}) {
 if (done) return {kind: 'done'};
 if (!(solved > 0) || !(total > 0)) return {kind: 'go'};
 const pct = solved >= total ? 100 : Math.min(99, Math.max(1, Math.floor(solved * 100 / total)));
 return {kind: 'ring', pct};
}
