'use strict';
(()=>{
const d=window.AXIS_PUBLIC;
if(!d||d.mode!=='OFFLINE_ONLY'){document.body.textContent='AXIS DEMO: MISSING VERIFIED OFFLINE DATA';return;}
const $=id=>document.getElementById(id);
const add=(el,tag,text,cls)=>{const v=document.createElement(tag);if(cls)v.className=cls;v.textContent=text;el.append(v);return v;};
const chapters=[['All','ALL'],['1 · Crypto','01'],['2 · Deception','02'],['3 · False Signals','03'],['4 · Evidence','04'],['5 · Survival','05'],['6 · Decision','06']];
let chapter='ALL',selected=d.cases[0]?.id;
for(const [name,id] of chapters){
 const b=add($('chapters'),'button',name);b.type='button';
 b.onclick=()=>{chapter=id;update();};b.dataset.chapter=id;
}
function select(id){selected=id;update();}
function update(){
 const panel=$('cases');panel.replaceChildren();
 document.querySelectorAll('#chapters button').forEach(b=>b.classList.toggle('on',b.dataset.chapter===chapter));
 const subset=d.cases.filter(c=>chapter==='ALL'||c.act===chapter);
 if(!subset.some(c=>c.id===selected))selected=subset[0]?.id;
 for(const c of subset){
  const b=document.createElement('button');b.type='button';b.className=c.id===selected?'selected':'';
  add(b,'small','ACT '+c.act+' • '+c.id);
  add(b,'span',c.title);
  b.onclick=()=>select(c.id);
  panel.append(b);
 }
 const c=d.cases.find(c=>c.id===selected);
 if(!c)return;
 $('act').textContent='ACT '+c.act+' / CASE '+String(c.sequence).padStart(2,'0');
 $('title').textContent=c.title;$('description').textContent=c.description;
 $('decision').textContent=c.decision;
 $('decision').className='decision '+(/HOLD|QUEUED/.test(c.decision)?'hold':/DENY/.test(c.decision)?'deny':'review');
 $('visibility').textContent=c.visibility;$('sequence').textContent=c.sequence+' / '+d.receipt_count;
 $('reason').textContent=c.reason;
}
const passed=d.suite_results.filter(x=>x.result==='PASS').length;
const stat=[['20','fictional incidents'],[String(d.capabilities.length),'workstreams mapped'],[String(passed)+'/'+String(d.suite_results.length),'local module suites passed'],['0','network/model calls']];
for(const [num,txt] of stat){const card=add($('stats'),'div','', 'stat');add(card,'b',num);add(card,'small',txt);}
const story=[
['01 / Theft','Stolen blockchain funds and stolen account credentials are recognized as separate evidence classes.'],
['02 / Ghost Maze','Misleading decoys and malware-like prompts appear; evidence is gathered, never treated as permission.'],
['03 / False Corridor','In the fictional Pacific theater, contradictory signals build pressure for an irreversible decision.'],
['04 / Evidence Held','Fea and FEACINTH independently review the case. RYAN holds protected actions without strong proof.'],
['05 / Grid Blackout','On-device policy continues while simulated 577 packets are queued without a delivery claim.'],
['06 / Verified Boundary','The demo closes with receipts, limitations and a human-controlled decision, not automatic retaliation.']
];
for(const [name,desc] of story){const el=add($('story'),'section','', 'step');add(el,'em',name);add(el,'p',desc);}
for(const t of d.suite_results){const card=add($('tests'),'div','', 'cap');add(card,'b',t.module);add(card,'small',t.result);}
for(const c of d.capabilities){const card=add($('capabilities'),'div','', 'cap');add(card,'b',c.name);add(card,'small',c.status);}
$('root').textContent=d.receipt_root;
update();
})();