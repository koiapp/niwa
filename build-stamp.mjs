// The build stamp on Library → Progress & backup: one muted line so testers can tell which build they are on.
// tools/build.mjs writes <root>/dist/build.json ({profile, built, commit}); the app fetches it and shows
// stampLine(info): "Build 30 Oct 2026, 14:05 · 9fca65c" in the viewer's local time, without seconds, and the
// commit only when it is a string. Anything unusable (no file, not JSON, no or invalid `built`) gives ''.

const part = (parts, type) => parts.find(p => p.type === type)?.value || '';

export function stampLine(info, {locale = 'en-GB', timeZone} = {}) {
  if (!info || typeof info !== 'object' || typeof info.built !== 'string' || !info.built) return '';
  const when = new Date(info.built);
  if (Number.isNaN(when.getTime())) return '';
  const parts = new Intl.DateTimeFormat(locale, {day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hourCycle: 'h23', ...(timeZone ? {timeZone} : {})}).formatToParts(when);
  const date = `${part(parts, 'day')} ${part(parts, 'month').replace(/\.$/, '')} ${part(parts, 'year')}, ${part(parts, 'hour')}:${part(parts, 'minute')}`;
  const commit = typeof info.commit === 'string' && info.commit ? ` · ${info.commit}` : '';
  return `Build ${date}${commit}`;
}
