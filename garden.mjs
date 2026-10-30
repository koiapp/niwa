import {bindGrass} from './grass-study.mjs?v=watercolor-grass-4&b=2bde53d';

// Learn is the title and this garden: a topline with no hint, row labels (the first row has none), topic stones and a
// footnote, with no progress, legend or next step (LEARN-01).
// The garden has one look, watercolor. Appearance stays separate from niwa-v1 and never changes lesson access or completions.
const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
// The old Watercolor/Original choice is gone; drop its saved preference.
try { localStorage.removeItem('niwa-garden-theme'); } catch {}

export function gardenStone(index, nodeId) {
 const asset = nodeId === 'dating' ? 'stone-heart' : `stone-${index % 8 + 1}`;
 return `<img class="garden-stone" src="assets/garden/${asset}.webp" width="256" height="256" alt="" aria-hidden="true" decoding="async">`;
}

export function gardenMarkup({rows, renderNode}) {
 return `<section class="field" data-garden="watercolor" aria-label="Topics">
  <div class="garden-topline"><span><span lang="ja">にわ</span><span>LEARN</span></span></div>
  ${rows.map(row=>`<div class="field-row garden-zone">
   ${row.label?`<div class="row-label"><span class="garden-level-name">${esc(row.label)}</span></div>`:''}
   <div class="nodes ${row.nodes.length===1?'single':''}">${row.nodes.map(renderNode).join('')}</div>
  </div>`).join('')}
  <p class="garden-footnote">Lessons grow here, one stone at a time.</p>
 </section>`;
}

export function bindGarden(root) {
 const field=root.querySelector('.field[data-garden]');
 if(field)bindGrass(field);
}
