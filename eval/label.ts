/* Label the month's eval sample by hand, in the browser. Blind: the page never shows what the rules
   decided, so the labels are not nudged toward them. Each answer is saved at once to
   eval/labels-YYYY-MM.json (keyed by the ad's id); close the page any time and come back.
   bun eval/label.ts            the newest sample, on http://localhost:4321
   bun eval/label.ts 2026-11    a given month */
import { readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import path from "node:path";
import { fRoles, skills } from "../web/src/data/framework";
import { TASKS } from "../pipeline/taxonomy";

const dir = import.meta.dir;
const month = process.argv[2] ?? readdirSync(dir).filter((f) => /^sample-\d{4}-\d{2}\.json$/.test(f)).sort().at(-1)?.slice(7, 14);
if (!month) { console.error("No eval/sample-YYYY-MM.json yet: run the eval sample workflow first."); process.exit(1); }
const sample = JSON.parse(readFileSync(path.join(dir, `sample-${month}.json`), "utf8")) as { items: { key: string; source: string; company: string; title: string; url: string }[] };
const LABELS = path.join(dir, `labels-${month}.json`);
const labels: Record<string, unknown> = existsSync(LABELS) ? JSON.parse(readFileSync(LABELS, "utf8")) : {};
const SENIORITY = ["Intern", "Junior", "Mid", "Senior", "Staff", "Principal", "Lead", "Head"];

// what the page needs, and nothing the rules decided
const items = sample.items.map(({ key, source, company, title, url }) => ({ key, source, company, title, url }));
const defs = {
  roles: [...fRoles.map((r) => ({ id: r.id, name: r.name, line: r.oneLine })), { id: "other-ai", name: "Other AI role", line: "An AI role that fits none of the eight." }],
  skills: skills.map((s) => ({ id: s.id, name: s.name, line: s.what })),
  tasks: TASKS.map((t) => ({ id: t.id, name: t.name })),
  seniority: SENIORITY,
};

const page = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Label ${month}</title><style>
:root{--rust:#e0301e;--ink:#1c1c1e;--sec:#55555b;--line:#e6e1da;--paper:#fbf4ef;font-family:system-ui,sans-serif;color:var(--ink)}
body{margin:0;background:#fff}main{max-width:860px;margin:0 auto;padding:22px 16px 80px}
.bar{height:6px;background:var(--line);border-radius:3px;margin:8px 0 18px}.bar i{display:block;height:100%;background:var(--rust);border-radius:3px}
h1{font-size:1.5rem;margin:6px 0}.co{color:var(--sec)}a.open{display:inline-block;margin:10px 0 18px;font-weight:700;color:#9e1a0c}
fieldset{border:1px solid var(--line);border-radius:12px;margin:0 0 14px;padding:12px 14px}legend{font-weight:700;padding:0 6px}
label{display:inline-flex;gap:6px;align-items:center;margin:4px 12px 4px 0;cursor:pointer}label small{color:var(--sec)}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:2px 12px}
.row{display:flex;gap:10px;flex-wrap:wrap;margin-top:14px}button{font:inherit;padding:10px 18px;border-radius:999px;border:1px solid var(--line);background:#fff;cursor:pointer}
button.go{background:var(--ink);color:#fff;border-color:var(--ink)}.muted{color:var(--sec);font-size:.85rem}.done{background:var(--paper);padding:3px 8px;border-radius:6px}
.off{opacity:.45;pointer-events:none}
</style></head><body><main>
<p class="muted">Eval ${month} · <span id="n"></span> · keys: <b>Y</b> AI ad · <b>N</b> not · <b>G</b> ad gone · <b>Enter</b> save and next · <b>←/→</b> move</p>
<div class="bar"><i id="bar"></i></div>
<div id="card"></div>
</main><script>
const ITEMS=${JSON.stringify(items)}, D=${JSON.stringify(defs)};
let L=${JSON.stringify(labels)}, i=Math.max(0,ITEMS.findIndex(x=>!L[x.key]));if(i<0)i=0;
const $=s=>document.querySelector(s);
function draw(){
  const it=ITEMS[i], l=L[it.key]||{};
  const done=Object.keys(L).length;
  $('#n').textContent=(i+1)+' of '+ITEMS.length+' · '+done+' labelled';
  $('#bar').style.width=(100*done/ITEMS.length)+'%';
  const radio=(name,opts,val)=>opts.map(o=>'<label><input type=radio name='+name+' value="'+o.id+'"'+(val===o.id?' checked':'')+'>'+o.name+(o.line?' <small>'+o.line+'</small>':'')+'</label>').join('');
  const box=(name,opts,vals)=>'<div class=grid>'+opts.map(o=>'<label title="'+(o.line||'')+'"><input type=checkbox name='+name+' value="'+o.id+'"'+((vals||[]).includes(o.id)?' checked':'')+'>'+o.name+'</label>').join('')+'</div>';
  $('#card').innerHTML='<span class=muted>'+it.source+(l.ai!==undefined?' · <span class=done>saved</span>':'')+'</span><h1>'+esc(it.title)+'</h1><div class=co>'+esc(it.company)+'</div>'+
   '<a class=open href="'+it.url+'" target=_blank rel=noreferrer>Open the ad ↗</a>'+
   '<fieldset><legend>Is this a job ad for an AI role?</legend>'+radio('ai',[{id:'yes',name:'Yes'},{id:'no',name:'No'},{id:'gone',name:'Ad gone or unreadable'}],l.ai===true?'yes':l.ai===false?'no':l.gone?'gone':'')+'</fieldset>'+
   '<div id=more class="'+(l.ai===true?'':'off')+'">'+
   '<fieldset><legend>Role</legend>'+radio('role',D.roles,l.role)+'</fieldset>'+
   '<fieldset><legend>Level</legend>'+radio('sen',D.seniority.map(s=>({id:s,name:s})),l.seniority)+'</fieldset>'+
   '<fieldset><legend>Skills the requirements ask for</legend>'+box('sk',D.skills,l.skills)+'</fieldset>'+
   '<fieldset><legend>What the ad asks you to do</legend>'+box('tk',D.tasks,l.tasks)+'</fieldset></div>'+
   '<div class=row><button onclick="move(-1)">← Back</button><button class=go onclick="save()">Save and next →</button></div>';
  document.querySelectorAll('input[name=ai]').forEach(r=>r.onchange=()=>$('#more').className=r.value==='yes'&&r.checked?'':'off');
}
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const val=n=>(document.querySelector('input[name='+n+']:checked')||{}).value;
const vals=n=>[...document.querySelectorAll('input[name='+n+']:checked')].map(x=>x.value);
async function save(){
  const it=ITEMS[i], a=val('ai'); if(!a){alert('Answer the first question');return}
  const l=a==='gone'?{gone:true}:a==='no'?{ai:false}:{ai:true,role:val('role')||null,seniority:val('sen')||null,skills:vals('sk'),tasks:vals('tk')};
  l.at=new Date().toISOString();
  L[it.key]=l; await fetch('/save',{method:'POST',body:JSON.stringify({key:it.key,label:l})}); move(1);
}
function move(d){i=Math.min(ITEMS.length-1,Math.max(0,i+d));draw();scrollTo(0,0)}
addEventListener('keydown',e=>{if(e.target.tagName==='INPUT'&&e.key!=='Enter')return;const k=e.key.toLowerCase();
  const pick=v=>{const r=document.querySelector('input[name=ai][value='+v+']');r.checked=true;r.onchange()};
  if(k==='y')pick('yes');else if(k==='n')pick('no');else if(k==='g')pick('gone');else if(k==='enter')save();else if(k==='arrowright')move(1);else if(k==='arrowleft')move(-1)});
draw();
</script></body></html>`;

Bun.serve({
  port: Number(process.env.PORT ?? 4321),
  async fetch(req) {
    const u = new URL(req.url);
    if (req.method === "POST" && u.pathname === "/save") {
      const { key, label } = await req.json();
      if (!items.some((x) => x.key === key)) return new Response("unknown ad", { status: 400 });
      labels[key] = label;
      writeFileSync(LABELS, JSON.stringify(labels, null, 1) + "\n");
      return new Response("ok");
    }
    return new Response(page, { headers: { "Content-Type": "text/html; charset=utf-8" } });
  },
});
console.log(`Labelling ${items.length} ads for ${month} on http://localhost:${process.env.PORT ?? 4321} (${Object.keys(labels).length} done)`);
