// The Kanji page's paper theme (docs/data-contract.md "Kanji paper"): the ink filters, and the two numbers each card's
// word is sized by. kanji-paper.css draws the rest: the aged paper, the fold creases, the brushed words, the vermilion
// circle on a right answer, faded ink on a miss and the 庭 seal.
// This presentation never changes access, points or the round: kanji-cards.mjs decides those, and the cards look the
// same to a screen reader with or without it.

// One hidden SVG with three filters, the first child of .kanji-board, so CSS can reach them as url(#id).
// - kp-ink: ink on paper. Ragged stroke edges, a faint bleed into the fibres, and dry-brush streaks.
// - kp-ink-fine: the same, gentler, for phones (kanji-paper.css at 560px and narrower), where the strong one looks
//   blotchy on small words.
// - kp-seal: the red 庭 seal's pressed, uneven ink.
export const KANJI_INK_DEFS = `<svg width="0" height="0" aria-hidden="true" focusable="false" style="position:absolute"><defs>
 <filter id="kp-ink" x="-15%" y="-15%" width="130%" height="130%" color-interpolation-filters="sRGB">
  <feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="2" seed="7" result="warp"/>
  <feDisplacementMap in="SourceGraphic" in2="warp" scale="3.2" xChannelSelector="R" yChannelSelector="G" result="rough"/>
  <feMorphology in="rough" operator="dilate" radius="0.6" result="thick"/>
  <feTurbulence type="fractalNoise" baseFrequency="0.22 0.6" numOctaves="3" seed="13" result="streak"/>
  <feColorMatrix in="streak" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -2.6 0 0 0 2.35" result="streakA"/>
  <feComposite in="thick" in2="streakA" operator="in" result="dry"/>
  <feGaussianBlur in="thick" stdDeviation="1.4" result="bleed"/>
  <feComponentTransfer in="bleed" result="bleedA"><feFuncA type="linear" slope=".3"/></feComponentTransfer>
  <feMerge><feMergeNode in="bleedA"/><feMergeNode in="dry"/></feMerge>
 </filter>
 <filter id="kp-ink-fine" x="-15%" y="-15%" width="130%" height="130%" color-interpolation-filters="sRGB">
  <feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="2" seed="7" result="warp"/>
  <feDisplacementMap in="SourceGraphic" in2="warp" scale="1.6" xChannelSelector="R" yChannelSelector="G" result="rough"/>
  <feMorphology in="rough" operator="dilate" radius="0.3" result="thick"/>
  <feTurbulence type="fractalNoise" baseFrequency="0.22 0.6" numOctaves="3" seed="13" result="streak"/>
  <feColorMatrix in="streak" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -1.6 0 0 0 1.95" result="streakA"/>
  <feComposite in="thick" in2="streakA" operator="in" result="dry"/>
  <feGaussianBlur in="thick" stdDeviation="0.8" result="bleed"/>
  <feComponentTransfer in="bleed" result="bleedA"><feFuncA type="linear" slope=".3"/></feComponentTransfer>
  <feMerge><feMergeNode in="bleedA"/><feMergeNode in="dry"/></feMerge>
 </filter>
 <filter id="kp-seal" x="-10%" y="-10%" width="120%" height="120%">
  <feTurbulence type="fractalNoise" baseFrequency="0.3" numOctaves="2" seed="5" result="n"/>
  <feDisplacementMap in="SourceGraphic" in2="n" scale="2.4" xChannelSelector="R" yChannelSelector="G" result="d"/>
  <feTurbulence type="fractalNoise" baseFrequency="0.5" numOctaves="1" seed="8" result="g"/>
  <feColorMatrix in="g" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -3 0 0 0 2.6" result="ga"/>
  <feComposite in="d" in2="ga" operator="in"/>
 </filter>
</defs></svg>`;

// A vocabulary word's {written|reading} markup, read as its written form.
const WRITTEN = /\{([^|}]*)\|[^}]*\}/g;

// How many characters the word shows in kanji display: お{水|みず} 2, {売|う}り{切|き}れ 4, お{願|ねが}いします 6.
export const brushLength = word => [...String(word ?? '').replace(WRITTEN, '$1')].length;

// The card word's inline style. --n is how many characters a column holds, which sets the font size; --cols is how many
// vertical columns the word takes. Up to four characters: one column, with --n at least 1.45 so a one-character word
// doesn't fill the whole square. Five or more: two columns of ceil(length / 2), right to left, like real writing.
export function brushStyle(word) {
 const length = brushLength(word);
 return length <= 4 ? `--n:${Math.max(length, 1.45)};--cols:1` : `--n:${Math.ceil(length / 2)};--cols:2`;
}
