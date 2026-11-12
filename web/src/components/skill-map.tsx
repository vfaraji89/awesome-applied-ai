"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import g from "@/data/skill-graph.json";
import { skills as skillDefs, fRoles } from "@/data/framework";
import { learn } from "@/data/learn";
import { More } from "./more";

/* The skill map, from real postings:
   1. Constellation: which skills employers ask for together (lift over chance).
   2. Doors: tick what you have; see the share of postings whose every skill ask you
      meet, and which one skill would open the most more. Plus the shortest path to 50%.
   3. Power pairs and unicorn combos.
   All computed in the browser from each posting's skill set. */

type Pair = { a: string; b: string; n: number; lift: number };
const G = g as unknown as {
  postings: number; from: string; to: string; skills: string[]; n: number[]; pairs: Pair[];
  masks: number[]; roleOf: number[]; roleIds: string[];
  toolsBySkill: Record<string, { name: string; share: number; lift: number }[]>;
  rolesBySkill: Record<string, { id: string; share: number }[]>;
};
const IDS = G.skills;
const BIT = Object.fromEntries(IDS.map((id, i) => [id, 1 << i])) as Record<string, number>;
const SHARE = Object.fromEntries(IDS.map((id, i) => [id, Math.round((100 * G.n[i]) / G.postings)])) as Record<string, number>;
const name = (id: string) => skillDefs.find((s) => s.id === id)?.name ?? id;
const short = (id: string) => name(id).replace(/ and .*/, "").replace("AI-assisted development", "AI-assisted dev").replace("Software fundamentals", "Software").replace("Product judgement", "Product");
const roleName = (id: string) => fRoles.find((r) => r.id === id)?.name ?? id;
const lift = (a: string, b: string) => G.pairs.find((p) => (p.a === a && p.b === b) || (p.a === b && p.b === a))?.lift ?? 1;

// Order skills round the circle so that skills asked together sit side by side.
const ORDER = (() => {
  const left = new Set(IDS); const out: string[] = [];
  let cur = IDS.slice().sort((a, b) => SHARE[b] - SHARE[a])[0];
  while (cur) { out.push(cur); left.delete(cur); cur = [...left].sort((a, b) => lift(cur, b) - lift(cur, a))[0]; }
  return out;
})();
const RAD = 210;
const POS = Object.fromEntries(ORDER.map((id, i) => {
  const a = (i / ORDER.length) * Math.PI * 2 - Math.PI / 2;
  return [id, { x: Math.cos(a) * RAD, y: Math.sin(a) * RAD, a }];
})) as Record<string, { x: number; y: number; a: number }>;

function coverage(have: number, role: number) {
  let total = 0, met = 0;
  for (let k = 0; k < G.masks.length; k++) {
    const m = G.masks[k];
    if (!m || (role >= 0 && G.roleOf[k] !== role)) continue;
    total++; if ((m & have) === m) met++;
  }
  return { total, met, pct: total ? (100 * met) / total : 0 };
}

export function SkillMap() {
  const [sel, setSel] = useState<string>("evals");
  const [mode, setMode] = useState<"together" | "apart">("together");
  const [have, setHave] = useState<number>(BIT.software | BIT.agents);
  const [role, setRole] = useState<number>(-1);

  const edges = G.pairs.filter((p) => (mode === "together" ? p.lift >= 1.2 && p.n >= 40 : p.lift <= 0.8 && p.n >= 25));
  const near = G.pairs.filter((p) => p.a === sel || p.b === sel).map((p) => ({ id: p.a === sel ? p.b : p.a, lift: p.lift, n: p.n })).sort((a, b) => b.lift - a.lift);

  const cov = useMemo(() => coverage(have, role), [have, role]);
  const gains = useMemo(() => IDS.filter((id) => !(have & BIT[id])).map((id) => ({ id, pct: coverage(have | BIT[id], role).pct - cov.pct })).sort((a, b) => b.pct - a.pct), [have, role, cov.pct]);
  const path = useMemo(() => {
    let m = have; const steps: { id: string; pct: number }[] = [];
    while (coverage(m, role).pct < 50 && steps.length < IDS.length) {
      const next = IDS.filter((id) => !(m & BIT[id])).map((id) => ({ id, pct: coverage(m | BIT[id], role).pct })).sort((a, b) => b.pct - a.pct)[0];
      if (!next) break; m |= BIT[next.id]; steps.push(next);
    }
    return steps;
  }, [have, role]);
  const toggle = (id: string) => setHave((h) => h ^ BIT[id]);

  const power = G.pairs.filter((p) => p.n >= 60).sort((a, b) => b.lift - a.lift).slice(0, 4);
  const unicorn = G.pairs.filter((p) => p.n >= 25).sort((a, b) => a.lift - b.lift).slice(0, 4);

  return (
    <div className="sm">
      {/* ------------------------------------------------ 1. constellation */}
      <section className="sm-block">
        <div className="sm-head">
          <div>
            <span className="kicker">1 · The constellation</span>
            <h2>Skills travel in packs<span className="dot">.</span></h2>
            <p className="lead"><b>Tap a skill</b> to see what it is asked with.</p>
            <More label="How to read it"><p className="lead" style={{ marginTop: 10 }}>Each bead is a skill, <b>sized by how many postings ask for it</b>. A line joins two skills when postings ask for them <b>together more often than chance</b>; the thicker the line, the stronger the pull.</p></More>
          </div>
          <div className="sm-toggle" role="tablist" aria-label="Show">
            <button role="tab" aria-selected={mode === "together"} onClick={() => setMode("together")}>Asked together</button>
            <button role="tab" aria-selected={mode === "apart"} onClick={() => setMode("apart")}>Rarely together</button>
          </div>
        </div>
        <div className="sm-con">
          <svg viewBox="-425 -290 850 580" className="sm-svg" role="img" aria-label="Skill constellation">
            <circle r={RAD} className="sm-orbit" />
            {edges.map((p) => {
              const A = POS[p.a], B = POS[p.b]; const on = p.a === sel || p.b === sel;
              const w = mode === "together" ? 1 + (p.lift - 1) * 9 : 1 + (1 - p.lift) * 8;
              return <path key={p.a + p.b} d={`M${A.x},${A.y} Q${(A.x + B.x) * 0.2},${(A.y + B.y) * 0.2} ${B.x},${B.y}`} className={`sm-edge ${mode}${on ? " on" : ""}`} strokeWidth={w} />;
            })}
            {ORDER.map((id) => {
              const P = POS[id]; const r = 9 + Math.sqrt(SHARE[id]) * 2.4; const on = id === sel;
              const nb = near.find((x) => x.id === id); const dim = !on && mode === "together" && nb && nb.lift < 1.2;
              const lx = Math.cos(P.a) * (RAD + r + 14), ly = Math.sin(P.a) * (RAD + r + 14);
              return (
                <g key={id} className={`sm-node${on ? " on" : ""}${dim ? " dim" : ""}${have & BIT[id] ? " mine" : ""}`} onClick={() => setSel(id)} role="button" tabIndex={0}
                   aria-label={`${name(id)}: asked by ${SHARE[id]}% of postings`} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSel(id); } }}>
                  <circle cx={P.x} cy={P.y} r={r} />
                  <text x={P.x} y={P.y + 4} className="sm-pct">{SHARE[id]}</text>
                  <text x={lx} y={ly + 4} className="sm-lbl" textAnchor={Math.abs(Math.cos(P.a)) < 0.2 ? "middle" : Math.cos(P.a) > 0 ? "start" : "end"}>{short(id)}</text>
                </g>
              );
            })}
          </svg>
          <aside className="frame sm-side" aria-live="polite">
            <span className="kicker">Asked by {SHARE[sel]}% of postings</span>
            <h3>{name(sel)}<span className="dot">.</span></h3>
            <p className="muted">{skillDefs.find((s) => s.id === sel)?.what}</p>
            <span className="sm-sub">Most often asked with</span>
            <ul className="sm-near">
              {near.slice(0, 3).map((x) => <li key={x.id}><button onClick={() => setSel(x.id)}>{name(x.id)}</button><span className="mono">{x.lift.toFixed(2)}×</span></li>)}
            </ul>
            <span className="sm-sub">Tools that signal it</span>
            <div className="sm-chips">{G.toolsBySkill[sel].map((t) => <span key={t.name} className="chip" title={`${t.share}% of these postings; ${t.lift}× the usual rate`}>{t.name} <span className="mono muted">{t.lift}×</span></span>)}</div>
            <More label="Roles, rare pairs and where to learn it">
            <span className="sm-sub">Roles that ask most</span>
            <ul className="sm-roles">{G.rolesBySkill[sel].map((r) => <li key={r.id}><span>{roleName(r.id)}</span><span className="mono">{r.share}%</span></li>)}</ul>
            <span className="sm-sub">Learn it here</span>
            <div className="sm-chips">{(learn[sel] ?? []).slice(0, 3).map((l) => <Link key={l.href + l.label} href={l.href} className="chip">{l.label}</Link>)}</div>
            {near.some((x) => x.lift < 0.95) && <span className="sm-sub">Rarely asked with</span>}
            <ul className="sm-near far">
              {near.filter((x) => x.lift < 0.95).slice(-2).reverse().map((x) => <li key={x.id}><button onClick={() => setSel(x.id)}>{name(x.id)}</button><span className="mono">{x.lift.toFixed(2)}×</span></li>)}
            </ul>
            </More>
            <span className="rod" />
          </aside>
        </div>
      </section>

      {/* ------------------------------------------------ 2. doors */}
      <section className="sm-block">
        <span className="kicker">2 · Doors</span>
        <h2>Which skill opens the most doors<span className="dot">?</span></h2>
        <p className="lead"><b>Tick what you can do.</b> See which next skill opens the most postings.</p>
        <More label="How it counts"><p className="lead" style={{ marginTop: 10 }}>You meet a posting when you have <b>every skill it asks for</b>. Each missing skill is ranked by <b>how many more postings it would open</b>, and the path shows the fewest skills to reach half the market.</p></More>
        <div className="sm-doors">
          <div>
            <div className="sm-picks">
              {IDS.map((id) => <button key={id} className={`sm-pick${have & BIT[id] ? " on" : ""}`} aria-pressed={!!(have & BIT[id])} onClick={() => toggle(id)}><i />{name(id)}</button>)}
            </div>
            <label className="sm-role">Postings for
              <select value={role} onChange={(e) => setRole(Number(e.target.value))}>
                <option value={-1}>all AI roles</option>
                {G.roleIds.map((r, i) => <option key={r} value={i}>{roleName(r)}</option>)}
              </select>
            </label>
          </div>
          <div className="frame sm-result">
            <div className="sm-big"><b>{Math.round(cov.pct)}%</b><span>of {cov.total.toLocaleString("en")} postings: you meet every skill ask in {cov.met.toLocaleString("en")}.</span></div>
            <div className="sm-meter" aria-hidden="true"><span style={{ width: `${cov.pct}%` }} /></div>
            <span className="sm-sub">Add next</span>
            <ol className="sm-gains">
              {gains.slice(0, 5).map((x, i) => (
                <li key={x.id} className={i === 0 ? "best" : ""}>
                  <button onClick={() => toggle(x.id)} title="Add it">{name(x.id)}</button>
                  <span className="sm-gbar"><span style={{ width: `${Math.min(100, (x.pct / Math.max(1, gains[0].pct)) * 100)}%` }} /></span>
                  <span className="mono">+{x.pct.toFixed(1)} pts</span>
                </li>
              ))}
            </ol>
            {path.length > 0 && (
              <>
                <span className="sm-sub">Shortest path to half the market</span>
                <ol className="sm-path">
                  {path.map((s, i) => <li key={s.id}><span className="sm-bead">{i + 1}</span><b>{short(s.id)}</b><span className="mono muted">{Math.round(s.pct)}%</span></li>)}
                </ol>
              </>
            )}
            {!path.length && cov.total > 0 && <p className="sm-done">You already meet half of these postings or more.</p>}
            <span className="rod" />
          </div>
        </div>
      </section>

      {/* ------------------------------------------------ 3. pairs */}
      <section className="sm-block">
        <span className="kicker">3 · Pairs</span>
        <h2>Power pairs and unicorn combos<span className="dot">.</span></h2>
        <p className="lead"><b>Power pairs</b> come together; <b>unicorn combos</b> are rare in one person.</p>
        <More label="What lift means"><p className="lead" style={{ marginTop: 10 }}>Lift is how many times more often two skills are asked for together than if they were unrelated. <b>Above 1</b>, they come as a pair: learn them together. <b>Below 1</b>, a posting that asks for both is hunting a rare profile: if you have both, lead with them.</p></More>
        <div className="grid grid-2" style={{ marginTop: 22 }}>
          <div className="frame sm-pairs">
            <span className="kicker">Power pairs: learn them together</span>
            <ul>{power.map((p) => <li key={p.a + p.b}><b>{name(p.a)} + {name(p.b)}</b><span className="mono">{p.lift.toFixed(2)}×</span><span className="muted">{p.n} postings ask for both</span></li>)}</ul>
            <span className="rod" />
          </div>
          <div className="frame sm-pairs uni">
            <span className="kicker">Unicorn combos: rare in one person</span>
            <ul>{unicorn.map((p) => <li key={p.a + p.b}><b>{name(p.a)} + {name(p.b)}</b><span className="mono">{p.lift.toFixed(2)}×</span><span className="muted">only {p.n} postings ask for both</span></li>)}</ul>
            <span className="rod" />
          </div>
        </div>
        <p className="count" style={{ marginTop: 16 }}>From {G.postings.toLocaleString("en")} technical AI postings tracked {G.from} to {G.to}. Skills are read from each posting with the same rules as the <Link href="/market/">market pulse</Link>.</p>
      </section>

      <style>{`
        .sm-block { padding: 8px 0 48px; }
        .sm-block + .sm-block { border-top: 1px solid var(--line); padding-top: 44px; }
        .sm-block h2 { margin-top: 8px; }
        .sm-block .lead { margin-top: 10px; }
        .sm-head { display: flex; flex-wrap: wrap; gap: 16px; align-items: end; justify-content: space-between; }
        .sm-toggle { display: inline-flex; padding: 4px; gap: 4px; border-radius: 12px; background: var(--paper); border: 1px solid var(--line); }
        .sm-toggle button { padding: 8px 14px; border: 0; border-radius: 9px; background: none; cursor: pointer; font: inherit; font-size: 0.86rem; color: var(--sec); }
        .sm-toggle button[aria-selected="true"] { background: var(--card); color: var(--ink); box-shadow: 0 0 0 1px var(--line); }
        .sm-con { display: grid; grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr); gap: 28px; align-items: start; margin-top: 24px; }
        .sm-svg { width: 100%; height: auto; overflow: visible; }
        .sm-orbit { fill: none; stroke: var(--line); stroke-dasharray: 2 6; }
        .sm-edge { fill: none; stroke-linecap: round; transition: opacity 0.3s, stroke 0.3s; }
        .sm-edge.together { stroke: color-mix(in srgb, var(--rust) 30%, transparent); }
        .sm-edge.apart { stroke: var(--line-strong); stroke-dasharray: 5 6; }
        .sm-edge.on.together { stroke: var(--rust); }
        .sm-edge.on.apart { stroke: var(--ink); }
        .sm-node { cursor: pointer; }
        .sm-node circle { fill: var(--card); stroke: var(--ink); stroke-width: 1.5; transition: fill 0.25s, stroke-width 0.25s; }
        .sm-node.mine circle { fill: var(--mark); }
        .sm-node.on circle { fill: var(--rust); stroke: var(--rust-deep); stroke-width: 3; }
        .sm-node.on .sm-pct { fill: #fff; }
        .sm-node.dim { opacity: 0.45; }
        .sm-node:focus-visible { outline: none; } .sm-node:focus-visible circle { stroke-width: 4; }
        .sm-pct { font-family: var(--font-mono), monospace; font-size: 12px; text-anchor: middle; fill: var(--ink); pointer-events: none; font-weight: 600; }
        .sm-lbl { font-size: 15px; font-weight: 650; fill: var(--ink); }
        .sm-side { padding: 20px 22px 34px; }
        .sm-side h3 { font-size: 1.35rem; font-weight: 800; margin-top: 6px; }
        .sm-side .muted { margin-top: 4px; font-size: 0.9rem; }
        .sm-sub { display: block; margin-top: 16px; font-family: var(--font-mono), monospace; font-size: 0.66rem; letter-spacing: 0.1em; text-transform: uppercase; color: var(--rust-deep); }
        .sm-near, .sm-roles { list-style: none; padding: 0; margin: 6px 0 0; }
        .sm-near li, .sm-roles li { display: flex; justify-content: space-between; gap: 10px; padding: 5px 0; border-bottom: 1px solid var(--line); font-size: 0.9rem; }
        .sm-near button { border: 0; background: none; padding: 0; cursor: pointer; font: inherit; color: var(--ink); text-align: left; text-decoration: underline; text-decoration-color: var(--line-strong); text-underline-offset: 3px; }
        .sm-near button:hover { color: var(--rust-deep); }
        .sm-near .mono { color: var(--rust-deep); font-weight: 600; }
        .sm-near.far .mono { color: var(--muted); }
        .sm-chips { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
        .sm-chips .chip { white-space: normal; }
        .sm-doors { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 28px; margin-top: 24px; align-items: start; }
        .sm-picks { display: flex; flex-wrap: wrap; gap: 8px; }
        .sm-pick { display: inline-flex; align-items: center; gap: 8px; padding: 8px 14px 8px 10px; border-radius: 999px; border: 1px solid var(--line-strong); background: var(--card); cursor: pointer; font: inherit; font-size: 0.88rem; color: var(--sec); transition: border-color 0.2s, background 0.2s; }
        .sm-pick i { width: 12px; height: 12px; border-radius: 50%; border: 1.5px solid var(--line-strong); transition: background 0.2s, transform 0.3s var(--spring); }
        .sm-pick.on { border-color: var(--rust); background: var(--paper); color: var(--ink); }
        .sm-pick.on i { background: var(--rust); border-color: var(--rust); transform: translateX(2px); }
        .sm-role { display: flex; align-items: center; gap: 10px; margin-top: 18px; font-size: 0.9rem; color: var(--sec); flex-wrap: wrap; }
        .sm-role select { font: inherit; padding: 8px 12px; border-radius: 10px; border: 1px solid var(--line-strong); background: var(--card); color: var(--ink); }
        .sm-result { padding: 22px 24px 36px; }
        .sm-big { display: flex; align-items: baseline; gap: 14px; flex-wrap: wrap; }
        .sm-big b { font-size: 3.2rem; line-height: 1; font-weight: 800; letter-spacing: -0.04em; color: var(--rust); }
        .sm-big span { font-size: 0.9rem; color: var(--sec); max-width: 22ch; }
        .sm-meter { height: 10px; margin-top: 14px; border-radius: 10px; background: var(--paper); border: 1px solid var(--line); overflow: hidden; }
        .sm-meter span { display: block; height: 100%; background: var(--rust); transition: width 0.6s var(--ease); }
        .sm-gains { list-style: none; padding: 0; margin: 8px 0 0; }
        .sm-gains li { display: grid; grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr) 4.8rem; gap: 10px; align-items: center; padding: 7px 0; border-bottom: 1px solid var(--line); font-size: 0.9rem; }
        .sm-gains button { border: 0; background: none; padding: 0; cursor: pointer; font: inherit; text-align: left; color: var(--ink); }
        .sm-gains li.best button { font-weight: 700; color: var(--rust-deep); }
        .sm-gains .mono { text-align: right; }
        .sm-gbar { height: 6px; border-radius: 6px; background: var(--paper); overflow: hidden; }
        .sm-gbar span { display: block; height: 100%; background: var(--ink); transition: width 0.5s var(--ease); }
        .sm-gains li.best .sm-gbar span { background: var(--rust); }
        .sm-path { list-style: none; padding: 0; margin: 10px 0 0; display: flex; flex-wrap: wrap; gap: 8px 6px; align-items: center; }
        .sm-path li { display: inline-flex; align-items: center; gap: 6px; padding: 5px 12px 5px 5px; border-radius: 999px; background: var(--paper); border: 1px solid var(--line); font-size: 0.85rem; }
        .sm-bead { display: grid; place-items: center; width: 22px; height: 22px; border-radius: 50%; background: var(--rust); color: #fff; font-family: var(--font-mono), monospace; font-size: 0.7rem; }
        .sm-done { margin-top: 14px; font-weight: 600; color: var(--rust-deep); }
        .sm-pairs { padding: 18px 22px 32px; }
        .sm-pairs ul { list-style: none; padding: 0; margin: 10px 0 0; }
        .sm-pairs li { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 2px 12px; padding: 9px 0; border-bottom: 1px solid var(--line); }
        .sm-pairs li b { font-size: 0.95rem; }
        .sm-pairs li .mono { font-weight: 700; color: var(--rust-deep); }
        .sm-pairs.uni li .mono { color: var(--sec); }
        .sm-pairs li .muted { grid-column: 1 / -1; font-size: 0.82rem; }
        @media (max-width: 900px) { .sm-con, .sm-doors { grid-template-columns: 1fr; } .sm-svg { max-width: 560px; margin: 0 auto; display: block; } }
        @media (max-width: 480px) { .sm-lbl { font-size: 24px; } .sm-pct { font-size: 17px; } }
        @media (prefers-reduced-motion: reduce) { .sm-meter span, .sm-gbar span, .sm-pick i { transition: none; } }
      `}</style>
    </div>
  );
}
