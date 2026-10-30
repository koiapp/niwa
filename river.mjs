// One stacking context: bed (0), koi (1), water (2), labels (3). Bed and water are tiled backgrounds (river.css), so a
// tall pond repeats its art at a fixed scale instead of stretching it.
// This presentation never changes access, completions or review schedules.
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const koiImage = fish => `<span class="river-koi" aria-hidden="true"><img src="assets/river/koi-${esc(fish)}.webp" alt="" width="384" height="384" decoding="async"></span>`;

// Each koi's place in the pond, from its index across the whole pond (not within its home lesson's group): lanes
// alternate left and right, and the drop below the lane's top (lift) and the koi's angle (turn) cycle through short lists.
const LIFTS=[0,56,18,72,36],TURNS=[-8,6,-3,9,-6];
export const pondPlaces=count=>Array.from({length:Math.max(0,count|0)},(_,i)=>({lane:i%2+1,lift:LIFTS[i%LIFTS.length],turn:TURNS[i%TURNS.length]}));
const placeStyle=({lane,lift,turn})=>` style="--koi-lane:${lane};--koi-lift:${lift}px;--koi-turn:${turn}deg"`;

// nodes: an open set {id, href, fish, category, title, status, done}, or a revealed one {silhouette: true, fish}: the
// koi's shape only, with no name, label, link or requirements. `choose` says whether any koi can be chosen yet.
export function practiceWaterMarkup(nodes, {choose = true} = {}) {
 const places = pondPlaces(nodes.length);
 return `<section class="practice-river" aria-label="Practice water garden">
  <div class="river-bed" aria-hidden="true"></div>
  <div class="river-topline"><span><span lang="ja">みず</span><span>PRACTICE</span></span>${choose ? '<span>Choose a koi</span>' : ''}</div>
  <div class="river-pools">${nodes.map((node, i) => node.silhouette ? `<div class="river-node is-silhouette"${placeStyle(places[i])} role="img" aria-label="A practice set not open yet">${koiImage(node.fish)}</div>` : `<a class="river-node${node.done?' is-done':''}"${placeStyle(places[i])} id="${esc(node.id)}" href="${esc(node.href)}" aria-labelledby="${esc(node.id)}-title ${esc(node.id)}-status">
   ${koiImage(node.fish)}
   <span class="river-node-label">
    <span class="river-node-kind">${esc(node.category)}</span>
    <span class="river-node-title" id="${esc(node.id)}-title">${esc(node.title)}</span>
    <span class="river-node-status" id="${esc(node.id)}-status">${node.done?'<span aria-hidden="true">✓ </span>':''}${esc(node.status)}</span>
   </span>
  </a>`).join('')}</div>
  <div class="river-water" aria-hidden="true"></div>
  <p class="river-footnote">A little practice, at your own pace.</p>
 </section>`;
}
