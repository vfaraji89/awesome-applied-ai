"use client";
import { useState } from "react";
import { track } from "@/lib/track";
import { useT } from "@/i18n/lang";
import Link from "next/link";
import { radar, rings, areas, type Area, type Ring } from "@/data/radar";

/* The emerging tech radar: four rings (use now at the centre, watch at the edge),
   four quarters, and one bead per technology. Tap a bead or a card to open it. */

const R = 300;                    // radius of the outer ring, in SVG units
const RING_R = [0.32, 0.56, 0.78, 1].map((f) => f * R);
const QUARTER: Record<Area, number> = { models: 0, agents: 1, serving: 2, evals: 3 };

function place() {
  const pos: Record<string, { x: number; y: number }> = {};
  for (const a of areas) for (const [ri, ring] of rings.entries()) {
    const here = radar.filter((r) => r.area === a.id && r.ring === ring.id);
    const inner = ri === 0 ? 0.12 * R : RING_R[ri - 1], outer = RING_R[ri];
    here.forEach((item, i) => {
      // spread evenly across the quarter, away from its edges
      const start = (QUARTER[a.id] * Math.PI) / 2 - Math.PI, span = Math.PI / 2;
      const t = (i + 1) / (here.length + 1);
      const ang = start + span * (0.12 + 0.76 * t);
      const rad = inner + (outer - inner) * (here.length > 1 && i % 2 ? 0.66 : 0.4);
      pos[item.id] = { x: Math.cos(ang) * rad, y: Math.sin(ang) * rad };
    });
  }
  return pos;
}
const POS = place();

export function TechRadar() {
  const [area, setArea] = useState<Area | "all">("all");
  const [ring, setRing] = useState<Ring | "all">("all");
  const [open, setOpen] = useState<string | null>(null);
  const t = useT();
  const rn = (g: { id: string; name: string }) => t(`ring.${g.id}`, g.name);
  const an = (a: { id: string; name: string }) => t(`area.${a.id}`, a.name);
  const [exp, setExp] = useState<Set<string>>(new Set());
  const flip = (id: string) => setExp((e) => { const n = new Set(e); if (n.has(id)) n.delete(id); else { n.add(id); track("radar_open", { item: id, via: "card" }); } return n; });
  const shown = radar.filter((r) => (area === "all" || r.area === area) && (ring === "all" || r.ring === ring));
  const pick = (id: string) => {
    setOpen(id); setExp((e) => new Set(e).add(id)); track("radar_open", { item: id, via: "bead" });
    requestAnimationFrame(() => document.getElementById(`r-${id}`)?.scrollIntoView({ behavior: "smooth", block: "center" }));
  };
  return (
    <div className="tr">
      <div className="tr-top">
        <svg className="tr-svg" viewBox={`${-R - 16} ${-R - 16} ${2 * R + 32} ${2 * R + 32}`} role="img" aria-label={`Radar of ${radar.length} emerging technologies`}>
          {RING_R.slice().reverse().map((r, i) => <circle key={r} r={r} className={`tr-ring tr-ring-${3 - i}`} />)}
          <line x1={-R} y1={0} x2={R} y2={0} className="tr-axis" />
          <line x1={0} y1={-R} x2={0} y2={R} className="tr-axis" />
          {rings.map((g, i) => <text key={g.id} x={4} y={-(i === 0 ? RING_R[0] - 14 : RING_R[i] - 14)} className="tr-ring-label">{rn(g)}</text>)}
          {areas.map((a) => {
            // each quarter's name sits in its own corner of the square, outside the circle
            const q = QUARTER[a.id], left = q === 0 || q === 3, top = q === 0 || q === 1;
            return <text key={a.id} x={left ? -R - 8 : R + 8} y={top ? -R + 4 : R + 4} className="tr-area-label" textAnchor={left ? "start" : "end"}>{an(a)}</text>;
          })}
          {radar.map((r, i) => {
            const p = POS[r.id]; const dim = !shown.includes(r);
            return (
              <g key={r.id} className={`tr-bead${open === r.id ? " on" : ""}${dim ? " dim" : ""}`} transform={`translate(${p.x} ${p.y})`}
                 onClick={() => pick(r.id)} role="button" tabIndex={0} aria-label={`${r.name}: ${rings.find((x) => x.id === r.ring)!.name}`}
                 onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick(r.id); } }}>
                <circle r={13} className={`tr-dot ring-${r.ring}`} />
                <text className="tr-n" dy="4">{i + 1}</text>
              </g>
            );
          })}
        </svg>
        <div className="tr-side">
          <span className="kicker">{t("radar.rings", "Rings")}</span>
          <ul className="tr-rings">
            {rings.map((g) => (
              <li key={g.id}><button className={ring === g.id ? "on" : ""} onClick={() => setRing(ring === g.id ? "all" : g.id)}>
                <i className={`tr-key ring-${g.id}`} /><b>{rn(g)}</b><span className="muted">{t(`ringline.${g.id}`, g.line)}</span>
              </button></li>
            ))}
          </ul>
          <span className="kicker" style={{ display: "block", marginTop: 18 }}>{t("radar.quarters", "Quarters")}</span>
          <div className="tr-chips">
            <button className={`chip${area === "all" ? " on" : ""}`} onClick={() => setArea("all")}>{t("radar.all", "All")}</button>
            {areas.map((a) => <button key={a.id} className={`chip${area === a.id ? " on" : ""}`} onClick={() => setArea(area === a.id ? "all" : a.id)}>{an(a)}</button>)}
          </div>
          <ol className="tr-index">
            {radar.map((r, i) => <li key={r.id} className={shown.includes(r) ? "" : "dim"}><button onClick={() => pick(r.id)}><span className="mono">{i + 1}</span> {r.name}</button></li>)}
          </ol>
        </div>
      </div>

      <div className="grid grid-2 tr-cards">
        {shown.map((r) => {
          const n = radar.indexOf(r) + 1, g = rings.find((x) => x.id === r.ring)!;
          return (
            <article key={r.id} id={`r-${r.id}`} className={`frame tr-card${open === r.id ? " open" : ""}${exp.has(r.id) ? " exp" : ""}`}>
              <div className="tr-card-top">
                <span className={`tr-num ring-${r.ring}`}>{n}</span>
                <span className="kicker">{an(areas.find((a) => a.id === r.area)!)} · <b className={`tr-ringname ring-${r.ring}`}>{rn(g)}</b></span>
              </div>
              <h3>{r.name}<span className="dot">.</span></h3>
              <p className="tr-short"><b>{r.short}</b></p>
              <p className="tr-use"><span className="kicker">{t("radar.use", "Use it for")}</span> {r.use}</p>
              <div className="more-body" aria-hidden={!exp.has(r.id)} inert={!exp.has(r.id) || undefined}><div>
              <p className="tr-what">{r.what}</p>
              <dl className="tr-dl">
                <div><dt>{t("radar.why", "Why it matters")}</dt><dd>{r.why}</dd></div>
                <div><dt>{t("radar.avoid", "Not for")}</dt><dd>{r.avoid}</dd></div>
              </dl>
              <div className="tr-ex">{r.examples.map((e) => <a key={e.url} className="chip" href={e.url} target="_blank" rel="noopener noreferrer">{e.name} ↗</a>)}</div>
              {r.more && <div className="tr-more"><span className="kicker">{t("radar.onsite", "On this site")}</span>{r.more.map((m) => <Link key={m.href} href={m.href}>{m.label} →</Link>)}</div>}
              <details className="tr-src"><summary>{t("radar.sources", "Sources ({n})", { n: r.sources.length })}</summary><ul>{r.sources.map((s) => <li key={s.url}><a href={s.url} target="_blank" rel="noopener noreferrer">{s.label}</a></li>)}</ul></details>
              </div></div>
              <button type="button" className="more-btn" aria-expanded={exp.has(r.id)} onClick={() => flip(r.id)}>{exp.has(r.id) ? t("more.show-less", "Show less") : t("radar.expand", "What, why, when not, sources")}<span aria-hidden="true">{exp.has(r.id) ? "↑" : "↓"}</span></button>
              <span className="rod" />
            </article>
          );
        })}
      </div>

      <style>{`
        .tr-top { display: grid; grid-template-columns: minmax(0, 1.25fr) minmax(0, 1fr); gap: 32px; align-items: start; }
        .tr-svg { width: 100%; height: auto; overflow: visible; }
        .tr-ring { fill: none; stroke: var(--line-strong); stroke-width: 1.2; }
        .tr-ring-0 { fill: color-mix(in srgb, var(--rust) 9%, transparent); }
        .tr-ring-1 { fill: color-mix(in srgb, var(--rust) 4%, transparent); }
        .tr-axis { stroke: var(--line); stroke-dasharray: 3 5; }
        .tr-ring-label { font-family: var(--font-mono), monospace; font-size: 11px; fill: var(--muted); letter-spacing: 0.06em; text-transform: uppercase; }
        .tr-area-label { font-size: 17px; font-weight: 700; fill: var(--ink); }
        .tr-bead { cursor: pointer; transition: opacity 0.25s; }
        .tr-bead.dim { opacity: 0.18; }
        .tr-dot { stroke: rgba(0,0,0,0.18); stroke-width: 1; transition: r 0.3s var(--spring); }
        .tr-bead:hover .tr-dot, .tr-bead.on .tr-dot, .tr-bead:focus-visible .tr-dot { r: 17; }
        .tr-bead:focus-visible { outline: none; }
        .tr-bead:focus-visible .tr-dot { stroke: var(--ink); stroke-width: 2.5; }
        .tr-n { font-family: var(--font-mono), monospace; font-size: 11px; text-anchor: middle; fill: #fff; pointer-events: none; font-weight: 600; }
        .ring-use { fill: var(--rust); background: var(--rust); color: #fff; }
        .ring-pilot { fill: var(--ink); background: var(--ink); color: #fff; }
        .ring-evaluate { fill: #8a8a90; background: #8a8a90; color: #fff; }
        .ring-watch { fill: #c9b79c; background: #c9b79c; color: #fff; }
        b.tr-ringname { background: none; font-weight: 600; }
        b.tr-ringname.ring-use { color: var(--rust-deep); } b.tr-ringname.ring-pilot { color: var(--ink); } b.tr-ringname.ring-evaluate { color: var(--sec); } b.tr-ringname.ring-watch { color: #9a7b4f; }
        .tr-rings { list-style: none; padding: 0; margin: 10px 0 0; display: flex; flex-direction: column; gap: 6px; }
        .tr-rings button { display: grid; grid-template-columns: 14px auto; column-gap: 10px; align-items: center; width: 100%; padding: 8px 12px; border-radius: 10px; border: 1px solid var(--line); background: var(--card); text-align: left; cursor: pointer; font: inherit; color: var(--ink); }
        .tr-rings button.on { border-color: var(--rust); background: var(--paper); }
        .tr-rings .muted { grid-column: 2; font-size: 0.8rem; }
        .tr-key { width: 12px; height: 12px; border-radius: 50%; grid-row: span 2; }
        .tr-chips { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px; }
        .tr-chips .chip { cursor: pointer; }
        .tr-index { list-style: none; padding: 0; margin: 18px 0 0; columns: 2; column-gap: 16px; font-size: 0.85rem; }
        .tr-index li { break-inside: avoid; }
        .tr-index li.dim { opacity: 0.35; }
        .tr-index button { border: 0; background: none; padding: 3px 0; cursor: pointer; font: inherit; color: var(--ink); text-align: left; }
        .tr-index button:hover { color: var(--rust-deep); }
        .tr-index .mono { display: inline-block; min-width: 1.6em; color: var(--muted); }
        .tr-cards { margin-top: 40px; }
        .tr-card { padding: 20px 24px 36px; scroll-margin-top: 90px; }
        .tr-card.open { outline: 2px solid var(--rust); outline-offset: 0; }
        .tr-card-top { display: flex; align-items: center; gap: 10px; }
        .tr-num { display: grid; place-items: center; width: 26px; height: 26px; border-radius: 50%; font-family: var(--font-mono), monospace; font-size: 0.75rem; font-weight: 600; }
        .tr-card h3 { font-size: 1.3rem; font-weight: 800; margin-top: 10px; }
        .tr-short { margin-top: 8px; font-size: 1.05rem; line-height: 1.4; }
        .tr-short b { font-weight: 700; color: var(--ink); background: linear-gradient(transparent 62%, color-mix(in srgb, var(--rust) 18%, transparent) 62%); }
        .tr-use { margin-top: 8px; font-size: 0.9rem; color: var(--sec); }
        .tr-use .kicker { margin-right: 4px; }
        .tr-what { margin-top: 12px; color: var(--sec); font-size: 0.95rem; }
        .tr-dl { margin: 14px 0 0; display: flex; flex-direction: column; gap: 10px; }
        .tr-dl dt { font-family: var(--font-mono), monospace; font-size: 0.66rem; letter-spacing: 0.1em; text-transform: uppercase; color: var(--rust-deep); }
        .tr-dl dd { margin: 2px 0 0; font-size: 0.9rem; line-height: 1.5; }
        .tr-ex { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 14px; }
        .tr-ex .chip { white-space: normal; }
        .tr-more { display: flex; flex-wrap: wrap; gap: 6px 14px; align-items: baseline; margin-top: 12px; font-size: 0.88rem; }
        .tr-src { margin-top: 12px; font-size: 0.82rem; }
        .tr-src summary { cursor: pointer; color: var(--sec); }
        .tr-src ul { margin: 8px 0 0; padding-left: 18px; }
        @media (max-width: 860px) { .tr-top { grid-template-columns: 1fr; } .tr-svg { max-width: 560px; margin: 0 auto; display: block; } }
        @media (max-width: 480px) { .tr-area-label { font-size: 24px; } .tr-ring-label { font-size: 15px; } .tr-index { columns: 1; } }
        @media (prefers-reduced-motion: reduce) { .tr-dot { transition: none; } }
      `}</style>
    </div>
  );
}
