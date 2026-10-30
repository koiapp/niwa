// The garden's watercolor grass: one painted band per row, each blended into the row above.
// Appearance never changes learning progress.
let observer;

export function bindGrass(field) {
 observer?.disconnect();
 const ground = document.createElement('div');
 ground.className = 'garden-grass';
 ground.setAttribute('aria-hidden', 'true');
 const zones = [...field.querySelectorAll('.garden-zone')];
 const positions = [15, 56, 86, 34, 73, 8, 48, 94];
 ground.innerHTML = zones.map((_, i) => `<div class="garden-grass-band" style="--grass-position:${positions[i % positions.length]}%"></div>`).join('');
 field.prepend(ground);
 const bands = [...ground.children];
 const blend = 72;
 let fieldObserver;
 const layout = () => {
  if (!field.isConnected) { fieldObserver?.disconnect(); return; }
  zones.forEach((zone, i) => {
   const top = i === 0 ? 0 : zone.offsetTop - blend;
   const bottom = i === zones.length - 1 ? field.clientHeight : zones[i + 1].offsetTop;
   bands[i].style.top = `${top}px`;
   bands[i].style.height = `${bottom - top}px`;
  });
 };
 layout();
 observer = fieldObserver = new ResizeObserver(layout);
 observer.observe(field);
}
