// Paged lessons and runs: the pages of a unit in order, its sections for the contents list, and where a fresh open
// resumes. Pure, no DOM: app.js unitPager() shows one page at a time and keeps everything else rendered but off the page.
// A unit is {sections} as in lessons.json (points, practice sets, the conversation, the final まとめ set). Its pages:
// the opening page (title, goal, scene, Focus and any reading check; labelled with the lesson's or practice's own title), the Words table at most WORDS_PER_PAGE rows a page,
// then in section order one page per point, one per practice item (returned items already joined to the まとめ's end),
// one for the conversation, and the finish page. A run that is not a lesson can leave out the opening, the words or the
// finish; one of its sections may carry its own label (a checkpoint's questions) or be a plain reading page (kind 'page').
import {setLabels,isFinal} from './exercises.mjs?b=2bde53d';

export const WORDS_PER_PAGE=8;
const RESERVED=['opening','words','finish','dialogue'];
// The key of each section, as its block is marked in the page (data-page-block): the section's own ID, else its kind and
// place, so two sections never share one.
export function sectionKeys(sections){
 const seen=new Set();
 return (Array.isArray(sections)?sections:[]).map((s,i)=>{const own=s?.kind==='dialogue'?'dialogue':typeof s?.id==='string'&&s.id&&!RESERVED.includes(s.id)?s.id:'',k=own&&!seen.has(own)?own:`section-${i}`;seen.add(k);return k;});
}
// {pages, sections}. A page is {kind, section} plus, for words, {from, to, part, parts} (rows from…to-1) and, for an
// item, {item, k, of} (its ID and place in the set). title labels the opening page (the lesson's or practice's name);
// its key stays 'opening', so saved places still resolve. A section is {key, kind, label, first, last} (its page range) and,
// for a practice set, {final, items} (item IDs in page order). words is the number of rows the Words table shows.
export function unitPages(unit,{words=0,opening=true,finish=true,chunk=WORDS_PER_PAGE,title=''}={}){
 const list=Array.isArray(unit?.sections)?unit.sections:[],labels=setLabels({sections:list}),keys=sectionKeys(list),pages=[],sections=[];
 const open=(key,kind,label,extra={})=>{const s={key,kind,label,first:pages.length,last:pages.length-1,...extra};sections.push(s);return s;};
 const add=(s,page)=>{pages.push({...page,section:s.key});s.last=pages.length-1;};
 if(opening)add(open('opening','opening',typeof title==='string'&&title.trim()?title:'Opening'),{kind:'opening'});
 const rows=Math.max(0,Math.floor(Number(words)||0)),size=Math.max(1,chunk|0);
 if(rows){const s=open('words','words','Words'),parts=Math.ceil(rows/size);for(let p=0;p<parts;p++)add(s,{kind:'words',from:p*size,to:Math.min(rows,(p+1)*size),part:p+1,parts});}
 let points=0;
 list.forEach((x,i)=>{
  const key=keys[i];
  if(x?.kind==='point'){points++;add(open(key,'point',x.label||`Point ${points}`),{kind:'point'});}
  else if(x?.kind==='dialogue')add(open(key,'dialogue',x.label||'Conversation'),{kind:'dialogue'});
  else if(x?.kind==='page')add(open(key,'page',x.label||'Page'),{kind:'page'});
  else if(x?.kind==='practice'){
   const items=(Array.isArray(x.items)?x.items:[]).map(it=>String(it?.id));if(!items.length)return;
   const final=isFinal(x),s=open(key,'practice',x.label||(final?'まとめ Review':`Practice ${labels.get(x.id)}`),{final,items});
   items.forEach((id,k)=>add(s,{kind:'item',item:id,k:k+1,of:items.length}));
  }
 });
 if(finish)add(open('finish','finish','Finish'),{kind:'finish'});
 return {pages,sections};
}
export const sectionOf=(model,i)=>model.sections.find(s=>s.key===model.pages[i]?.section)||null;
// "Practice B · 3 of 6", "Words · 1 of 2", "Point 1", "Finish"; a set of one item or a table of one page needs no counter.
export function pageLabel(model,i){
 const p=model.pages[i],s=sectionOf(model,i);if(!p||!s)return '';
 return p.kind==='item'&&p.of>1?`${s.label} · ${p.k} of ${p.of}`:p.kind==='words'&&p.parts>1?`${s.label} · ${p.part} of ${p.parts}`:s.label;
}
// A page's identity, kept while pages are added or the unit is reopened: item:<id>, words:<part>, or <kind>:<section>.
export const pageKey=p=>!p?'':p.kind==='item'?`item:${p.item}`:p.kind==='words'?`words:${p.part}`:`${p.kind}:${p.section}`;
export const findPage=(model,key)=>key?model.pages.findIndex(p=>pageKey(p)===key):-1;
// state(id) says where an item stands: 'solved' (right in a lesson, or answered in a closed run), 'answered' (a response,
// not solved yet) or null. Each section with, for a practice set, how many items are left and the page of the first.
export function sectionStatus(model,state){
 return model.sections.map(s=>{
  if(s.kind!=='practice')return {...s,total:0,left:0,next:-1};
  const open=s.items.map((id,k)=>state(id)==='solved'?-1:k).filter(k=>k>=0);
  return {...s,total:s.items.length,left:open.length,next:open.length?s.first+open[0]:-1};
 });
}
// The practice sets with items still unsolved, for the finish page.
export const setsLeft=(model,state)=>sectionStatus(model,state).filter(s=>s.kind==='practice'&&s.left>0);
// Where a fresh open starts: the first page while nothing is answered; the finish page (else the last) once every item is
// solved; otherwise the furthest answered item's page, or the page after it when that item is solved.
export function resumePage(model,state){
 const items=model.pages.map((p,i)=>({p,i})).filter(x=>x.p.kind==='item');if(!items.length)return 0;
 const st=items.map(x=>state(x.p.item)),end=model.pages.length-1;
 if(st.every(s=>s==='solved')){const f=model.pages.findIndex(p=>p.kind==='finish');return f>=0?f:end;}
 let k=-1;st.forEach((s,j)=>{if(s)k=j;});
 if(k<0)return 0;
 return st[k]==='solved'?Math.min(items[k].i+1,end):items[k].i;
}
