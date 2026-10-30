// Notices: small, calm popups that say what just opened and where it lives (2026-10-28). Text only: no links, no
// "Go to"; tapping a notice only dismisses it. The model (wording, queue) is pure so node tests can import it; the DOM is
// touched only inside createNotices.
export const NOTICE_KINDS=['stone','lesson','checkpoint','practice','book','kanji-round','kanji'];
export const NOTICE_GLYPHS={stone:'◈',lesson:'◈',checkpoint:'◈',practice:'▤',book:'▧','kanji-round':'字',kanji:'字'};
export const NOTICE_MS=7000;   // how long a notice stays
export const NOTICE_GAP=350;   // stagger between notices of one batch
export const NOTICE_MAX=3;     // visible at once; the rest wait

const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
const str=v=>typeof v==='string'&&v.trim()?v.trim():null;
const list=v=>Array.isArray(v)?v:[];
// A resolver that is missing, throws or returns nothing skips its item.
const ask=(names,k,arg)=>{const f=names?.[k];if(typeof f!=='function')return null;try{return f(arg)??null;}catch{return null;}};
// "In Learn · <topic>." with the topic when known, "In Learn." without.
const inLearn=topic=>str(topic)?`In Learn · ${str(topic)}.`:'In Learn.';

// The notices for one unlockedSince() result, in the order stones, lessons, checkpoint, practices, books, kanji round.
export function unlockNotices(u,names){
 if(!u)return [];
 const out=[];
 for(const id of list(u.stones)){const t=str(ask(names,'stone',id));if(t)out.push({id:`stone:${id}`,kind:'stone',title:'New stone',name:t,where:'In the garden.',ja:false});}
 for(const id of list(u.lessons)){const l=ask(names,'lesson',id),t=str(l?.title);if(t)out.push({id:`lesson:${id}`,kind:'lesson',title:'New lesson',name:t,where:inLearn(l.topic),ja:false});}
 if(u.checkpoint){const c=ask(names,'checkpoint',u.checkpoint),n=c?.n??u.checkpoint.n;if(c&&n!=null)out.push({id:`checkpoint:${n}`,kind:'checkpoint',title:`Checkpoint ${n}`,name:'A short closed-book check',where:inLearn(c.topic),ja:false});}
 for(const id of list(u.practices)){const t=str(ask(names,'practice',id));if(t)out.push({id:`practice:${id}`,kind:'practice',title:'New practice',name:t,where:'Visit the koi pond.',ja:false});}
 for(const id of list(u.books)){const t=str(ask(names,'book',id));if(t)out.push({id:`book:${id}`,kind:'book',title:'New book',name:t,where:'On the reading table.',ja:false});}
 if(u.kanji===true)out.push({id:'kanji-round:first',kind:'kanji-round',title:'Kanji cards open',name:'Your first round of nine',where:'In Kanji.',ja:false});
 return out;
}

// One notice for a batch of kanji words met: each as "written reading", joined by " · "; the id is the sorted word ids
// (a word's `id`, else its written form). No words → null.
export function kanjiNotice(words){
 const ws=list(words).filter(w=>str(w?.written));
 if(!ws.length)return null;
 const label=w=>{const a=str(w.written),r=str(w.reading);return r&&r!==a?`${a} ${r}`:a;};
 const ids=ws.map(w=>String(w.id??str(w.written))).sort();
 return {id:`kanji:${ids.join(',')}`,kind:'kanji',title:'New kanji',name:ws.map(label).join(' · '),where:'Added to your kanji words.',ja:true};
}

// A notice the renderer accepts: a known kind, an id and a title.
const valid=n=>!!n&&typeof n==='object'&&NOTICE_KINDS.includes(n.kind)&&str(n.id)!=null&&str(n.title)!=null;

// The pure queue: at most `max` visible, later ones wait in order; an id ever added is ignored after (dedupe for the
// queue's lifetime).
export function noticeQueue({max=NOTICE_MAX}={}){
 const shown=[],waits=[],ever=new Set();
 return {
  add(n){if(!n?.id||ever.has(n.id))return {shown:false,waiting:false,ignored:true};ever.add(n.id);if(shown.length<max){shown.push(n);return {shown:true,waiting:false,ignored:false};}waits.push(n);return {shown:false,waiting:true,ignored:false};},
  remove(id){let i=waits.findIndex(n=>n.id===id);if(i>=0){waits.splice(i,1);return null;}i=shown.findIndex(n=>n.id===id);if(i<0)return null;shown.splice(i,1);if(waits.length&&shown.length<max){const next=waits.shift();shown.push(next);return next;}return null;},
  visible:()=>shown.slice(),waiting:()=>waits.slice(),has:id=>ever.has(id)
 };
}

// The markup of one notice; every string escaped, the name marked lang="ja" when it is Japanese.
const noticeHTML=n=>{const g=NOTICE_GLYPHS[n.kind],jaGlyph=g==='字'?' lang="ja"':'';return `<span class="notice-glyph" aria-hidden="true"${jaGlyph}>${esc(g)}</span><div class="notice-body"><span class="notice-title">${esc(n.title)}</span>${str(n.name)?`<span class="notice-name"${n.ja?' lang="ja"':''}>${esc(n.name)}</span>`:''}${str(n.where)?`<span class="notice-where">${esc(n.where)}</span>`:''}</div><button type="button" class="notice-close" aria-label="Dismiss">×</button>`;};

// The renderer over the #notices container. Batches stagger by `gap`; each visible notice leaves after `duration`
// (paused while hovered or focused); a tap anywhere on it, or Escape inside it, dismisses it. A null root makes every
// method a no-op, so app.js can call it unconditionally.
export function createNotices(root,{duration=NOTICE_MS,gap=NOTICE_GAP,max=NOTICE_MAX,setTimeout=globalThis.setTimeout,clearTimeout=globalThis.clearTimeout,reducedMotion=null}={}){
 if(!root)return {show:()=>0,dismiss:()=>false,clear(){},visible:()=>[]};
 const later=(fn,ms)=>setTimeout.call(globalThis,fn,ms),cancel=t=>{if(t!=null)clearTimeout.call(globalThis,t);};
 const now=()=>globalThis.performance?.now?.()??Date.now();
 // The next frame, or 50ms if frames are throttled (a hidden tab): the class flip never waits on a frame alone.
 const frame=fn=>{let done=false;const go=()=>{if(done)return;done=true;fn();};if(typeof globalThis.requestAnimationFrame==='function')globalThis.requestAnimationFrame(go);later(go,50);};
 const reduced=()=>reducedMotion??!!globalThis.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
 let queue=noticeQueue({max}),seen=new Set();
 const live=new Map(),pending=new Map(),leaving=new Set();
 // The auto-dismiss timer: runs only while the notice is neither hovered nor focused, for the time it has left.
 const run=s=>{cancel(s.timer);s.timer=null;if(s.hover||s.focus)return;s.started=now();s.timer=later(()=>dismiss(s.n.id),Math.max(0,s.left));};
 const pause=s=>{if(s.timer==null)return;cancel(s.timer);s.timer=null;s.left-=now()-s.started;};
 // Enter: appended with is-entering, swapped to is-shown on the next frame so the CSS transition runs.
 const enter=n=>{
  const el=document.createElement('article');
  el.className=`notice notice-${n.kind} is-entering${reduced()?' is-reduced':''}`;el.dataset.noticeId=n.id;el.innerHTML=noticeHTML(n);
  const s={n,el,left:duration,started:0,timer:null,hover:false,focus:false};live.set(n.id,s);
  el.addEventListener('click',()=>dismiss(n.id));
  el.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();dismiss(n.id);}});
  el.addEventListener('mouseenter',()=>{s.hover=true;pause(s);});
  el.addEventListener('mouseleave',()=>{s.hover=false;run(s);});
  el.addEventListener('focusin',()=>{s.focus=true;pause(s);});
  el.addEventListener('focusout',e=>{if(el.contains(e.relatedTarget))return;s.focus=false;run(s);});
  root.appendChild(el);
  frame(()=>{if(!live.has(n.id))return;void el.offsetWidth;el.classList.remove('is-entering');el.classList.add('is-shown');});
  run(s);
 };
 // Leave: is-leaving, then the element goes after its transition (or 400ms); the next waiting notice enters.
 const leave=s=>{
  cancel(s.timer);live.delete(s.n.id);
  const el=s.el;el.classList.remove('is-entering','is-shown');el.classList.add('is-leaving');leaving.add(el);
  let gone=false;const drop=()=>{if(gone)return;gone=true;cancel(t);leaving.delete(el);el.remove();};
  el.addEventListener('transitionend',e=>{if(e.target===el)drop();});const t=later(drop,400);
  const next=queue.remove(s.n.id);if(next)enter(next);
 };
 const place=n=>{pending.delete(n.id);if(queue.add(n).shown)enter(n);};
 // A notice or a list (one batch, `gap` ms apart); returns how many were accepted.
 function show(x){
  let k=0;
  for(const n of Array.isArray(x)?x:[x]){
   if(!valid(n)||seen.has(n.id))continue;seen.add(n.id);
   if(k===0||!(gap>0))place(n);else pending.set(n.id,later(()=>place(n),k*gap));
   k++;
  }
  return k;
 }
 // Dismisses a visible, waiting or not-yet-placed notice; false when there is no such notice.
 function dismiss(id){
  if(pending.has(id)){cancel(pending.get(id));pending.delete(id);return true;}
  const s=live.get(id);if(s){leave(s);return true;}
  if(queue.waiting().some(n=>n.id===id)){queue.remove(id);return true;}
  return false;
 }
 // Removes everything at once, cancels every timer, and starts a fresh queue (ids may be shown again).
 function clear(){
  for(const t of pending.values())cancel(t);pending.clear();
  for(const s of live.values()){cancel(s.timer);s.el.remove();}live.clear();
  for(const el of leaving)el.remove();leaving.clear();
  queue=noticeQueue({max});seen=new Set();
 }
 return {show,dismiss,clear,visible:()=>queue.visible()};
}
