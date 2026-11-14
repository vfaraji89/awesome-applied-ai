"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { T } from "@/i18n/lang";
import { fRoles, skills, LEVELS } from "@/data/framework";
import { M } from "@/lib/market-data";
import { slug } from "@/i18n/slug";
import { ROLE_PAGES as BANNER_PAGES } from "@/data/roles-pages";

/* One interactive banner per page of the Roles & skills section, in the abacus language:
   rods, beads, one readout that changes with the bead you touch. They play on their own while
   on screen and stop the moment you pick something. "card" is the compact form for the hub and
   the home page; "hero" heads the page itself and tells the rest of the page which role you
   picked (role-pick event), so the explorer or the matrix below follows. */
import type { BannerKind } from "@/data/roles-pages";
export type { BannerKind };
const EV = "role-pick";
export const pickRole = (id: string) => window.dispatchEvent(new CustomEvent(EV, { detail: id }));
export function useRolePick(set: (id: string) => void) {
  useEffect(() => {
    const h = (e: Event) => set((e as CustomEvent<string>).detail);
    window.addEventListener(EV, h);
    return () => window.removeEventListener(EV, h);
  }, [set]);
}

function useCycle(n: number, ms = 2800) {
  const [i, setI] = useState(0);
  const [held, setHeld] = useState(false);
  const [vis, setVis] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVis(e.isIntersecting), { threshold: 0.2 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  useEffect(() => {
    if (held || !vis || n < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setI((x) => (x + 1) % n), ms);
    return () => clearInterval(t);
  }, [held, vis, n, ms]);
  const pick = useCallback((k: number) => { setHeld(true); setI(k); }, []);
  return { i, pick, ref, held };
}

const roleName = (id: string) => fRoles.find((r) => r.id === id)?.name ?? id;
const skillName = (id: string) => skills.find((s) => s.id === id)?.name ?? id;
const FAMS = Array.from(new Set(fRoles.map((r) => r.family)));

function Families({ size, sync }: { size: "card" | "hero"; sync?: boolean }) {
  const { i, pick, ref } = useCycle(fRoles.length);
  useRolePick(useCallback((id: string) => { const k = fRoles.findIndex((r) => r.id === id); if (k >= 0) pick(k); }, [pick]));
  const r = fRoles[i];
  const choose = (k: number) => { pick(k); if (sync) pickRole(fRoles[k].id); };
  return (
    <div ref={ref} className={`rb rb-${size}`}>
      <div className="rb-viz">
        {FAMS.map((f) => (
          <div key={f} className={`rb-fam${r.family === f ? " on" : ""}`}>
            <span className="rb-lab"><T k={`fam.${f.toLowerCase()}`}>{f}</T></span>
            <span className="rb-rod">
              {fRoles.map((x, k) => x.family === f && (
                <button key={x.id} type="button" className={`rb-bead${k === i ? " on" : ""}`} onClick={() => choose(k)} onMouseEnter={() => size === "hero" || pick(k)} aria-pressed={k === i} aria-label={x.name}><span className="rb-tip">{x.name}</span></button>
              ))}
            </span>
          </div>
        ))}
      </div>
      <div className="rb-read" key={r.id} aria-live="polite">
        <span className="count"><T k={`fam.${r.family.toLowerCase()}`}>{r.family}</T> · {String(i + 1).padStart(2, "0")}/{fRoles.length}</span>
        <b className="rb-big">{r.name}</b>
        <p className="rb-line"><T k={`role.${r.id}.line`}>{r.oneLine}</T></p>
        {size === "hero" && <p className="count rb-also"><T k="rb.titles">Also posted as</T>: {r.titles.slice(0, 3).join(" · ")}</p>}
      </div>
    </div>
  );
}

function Matrix({ size, sync }: { size: "card" | "hero"; sync?: boolean }) {
  const { i, pick, ref } = useCycle(fRoles.length);
  useRolePick(useCallback((id: string) => { const k = fRoles.findIndex((r) => r.id === id); if (k >= 0) pick(k); }, [pick]));
  const r = fRoles[i];
  const choose = (k: number) => { pick(k); if (sync) pickRole(fRoles[k].id); };
  const by = (lv: number) => skills.filter((s) => (r.levels[s.id] ?? 0) === lv);
  const top = [4, 3].map((lv) => ({ lv, list: by(lv) })).filter((x) => x.list.length);
  return (
    <div ref={ref} className={`rb rb-${size}`}>
      <div className="rb-viz rb-grid" style={{ ["--cols" as string]: fRoles.length }}>
        <span />
        {fRoles.map((x, k) => (
          <button key={x.id} type="button" className={`rb-col${k === i ? " on" : ""}`} onClick={() => choose(k)} onMouseEnter={() => size === "hero" || pick(k)} aria-pressed={k === i} aria-label={x.name}>
            <span className="rb-tip">{x.name}</span>
          </button>
        ))}
        {skills.map((s) => (
          <div key={s.id} className="rb-row">
            <span className="rb-lab"><T k={`skill.${s.id}`}>{s.name}</T></span>
            {fRoles.map((x, k) => { const lv = x.levels[s.id] ?? 0; return <i key={x.id} className={`rb-dot l${lv}${k === i ? " on" : ""}`} title={`${x.name} · ${s.name}: ${LEVELS[lv]}`} />; })}
          </div>
        ))}
      </div>
      <div className="rb-read" key={r.id} aria-live="polite">
        <span className="count"><T k="rb.m_role">Role</T> {String(i + 1).padStart(2, "0")}/{fRoles.length}</span>
        <b className="rb-big">{r.name}</b>
        {top.map(({ lv, list }) => (
          <p key={lv} className="rb-line"><span className="rb-lv"><T k={`lvl.${LEVELS[lv].toLowerCase()}`}>{LEVELS[lv]}</T></span> {list.map((s, j) => <span key={s.id}>{j ? ", " : ""}<T k={`skill.${s.id}`}>{s.name}</T></span>)}</p>
        ))}
      </div>
    </div>
  );
}

function Skills({ size }: { size: "card" | "hero" }) {
  const rows = M.skills.filter((s) => s.id).slice(0, size === "card" ? 6 : 12);
  const max = Math.max(...rows.map((s) => s.share ?? 0), 1);
  const { i, pick, ref } = useCycle(rows.length);
  const s = rows[i];
  const prof = M.insights?.skills.find((p) => p.id === s?.id);
  if (!s) return null;
  return (
    <div ref={ref} className={`rb rb-${size}`}>
      <ul className="rb-viz rb-bars">
        {rows.map((x, k) => (
          <li key={x.id}>
            <button type="button" className={k === i ? "on" : ""} onClick={() => pick(k)} onMouseEnter={() => pick(k)} aria-pressed={k === i}>
              <span className="rb-lab"><T k={`skill.${x.id}`}>{skillName(x.id!)}</T></span>
              <span className={`rodbar${k === i ? "" : " ink"}`}><i style={{ width: `${((x.share ?? 0) / max) * 100}%` }} /></span>
              <span className="count">{x.share}%</span>
            </button>
          </li>
        ))}
      </ul>
      <div className="rb-read" key={s.id} aria-live="polite">
        <span className="count"><T k="rb.s_rank" vars={{ r: i + 1 }}>{"number {r} in the ads"}</T></span>
        <b className="rb-big"><span className="rb-num">{s.share}%</span> <T k={`skill.${s.id}`}>{skillName(s.id!)}</T></b>
        <p className="rb-line"><T k="rb.s_line" vars={{ n: (s.n ?? 0).toLocaleString("en-US") }}>{"of AI job ads ask for it, {n} since 1 October."}</T>{prof?.topRole && <> <T k="rb.s_role" vars={{ r: roleName(prof.topRole.id), p: prof.topRole.share }}>{"Asked most by {r}, in {p}% of their ads."}</T></>}</p>
        <Link href={`/skills/${s.id}/`} className="rb-go"><T k="rb.s_open">Open the skill</T> →</Link>
      </div>
    </div>
  );
}

function Tasks({ size }: { size: "card" | "hero" }) {
  const rows = M.tasks.filter((t) => t.id).slice(0, size === "card" ? 6 : 12);
  const max = Math.max(...rows.map((t) => t.share ?? 0), 1);
  const { i, pick, ref } = useCycle(rows.length);
  const t = rows[i];
  const g = M.insights?.roleTask;
  if (!t) return null;
  const c = g ? g.cols.indexOf(t.id!) : -1;
  const best = g && c >= 0 ? g.rows.map((r, k) => ({ r, v: g.cells[k][c] })).sort((a, b) => b.v - a.v)[0] : null;
  return (
    <div ref={ref} className={`rb rb-${size}`}>
      <ul className="rb-viz rb-bars">
        {rows.map((x, k) => (
          <li key={x.id}>
            <button type="button" className={k === i ? "on" : ""} onClick={() => pick(k)} onMouseEnter={() => pick(k)} aria-pressed={k === i}>
              <span className="rb-lab"><T k={`task.${x.id}`}>{x.name ?? ""}</T></span>
              <span className={`rodbar${k === i ? "" : " ink"}`}><i style={{ width: `${((x.share ?? 0) / max) * 100}%` }} /></span>
              <span className="count">{x.share}%</span>
            </button>
          </li>
        ))}
      </ul>
      <div className="rb-read" key={t.id} aria-live="polite">
        <span className="count"><T k="rb.t_k">the ads ask you to</T></span>
        <b className="rb-big"><span className="rb-num">{t.share}%</span> <T k={`task.${t.id}`}>{t.name ?? ""}</T></b>
        {best && <p className="rb-line"><T k="rb.t_role" vars={{ r: roleName(best.r), p: best.v }}>{"Most of all {r}: {p}% of their ads."}</T></p>}
      </div>
    </div>
  );
}

export function RoleBanner({ kind, size = "card", sync }: { kind: BannerKind; size?: "card" | "hero"; sync?: boolean }) {
  return (
    <>
      {kind === "families" && <Families size={size} sync={sync} />}
      {kind === "matrix" && <Matrix size={size} sync={sync} />}
      {kind === "skills" && <Skills size={size} />}
      {kind === "tasks" && <Tasks size={size} />}
      <style>{rbCss}</style>
    </>
  );
}

/* The home page's roles band: the four banners behind four tabs, each with its own page. */

export function RoleBannerTabs() {
  const [k, setK] = useState(0);
  const p = BANNER_PAGES[k];
  return (
    <div className="frame rbt">
      <div className="rbt-tabs" role="tablist">
        {BANNER_PAGES.map((x, j) => (
          <button key={x.kind} type="button" role="tab" aria-selected={j === k} className={j === k ? "on" : ""} onClick={() => setK(j)}>
            <span className="count">{String(j + 1).padStart(2, "0")}</span> <T k={`page.${slug(x.label)}`}>{x.label}</T>
          </button>
        ))}
      </div>
      <div key={p.kind} className="rbt-body"><RoleBanner kind={p.kind} /></div>
      <Link href={p.href} className="rb-go"><T k="rb.open" vars={{ p: p.label }}>{"Open {p}"}</T> →</Link>
    </div>
  );
}

const rbCss = `
.rb { display: grid; gap: 22px; align-items: start; }
.rb-hero { grid-template-columns: minmax(0, 1.25fr) minmax(0, 1fr); gap: 34px; }
@media (max-width: 860px) { .rb-hero { grid-template-columns: 1fr; } }
.rb-lab { font-size: .8rem; color: var(--sec); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.rb-read { min-height: 150px; animation: rise .55s var(--ease) both; }
.rb-big { display: block; font-size: 1.45rem; font-weight: 800; letter-spacing: -.02em; line-height: 1.15; margin-top: 6px; }
.rb-hero .rb-big { font-size: clamp(1.6rem, 3vw, 2.3rem); }
.rb-num { color: var(--rust); }
.rb-line { margin-top: 8px; color: var(--sec); font-size: .95rem; max-width: 52ch; }
.rb-lv { font-family: var(--font-mono), monospace; font-size: .68rem; text-transform: uppercase; letter-spacing: .08em; color: var(--rust-deep); margin-right: 4px; }
.rb-also { margin-top: 10px; }
.rb-go { display: inline-block; margin-top: 12px; font-weight: 700; color: var(--rust-deep); text-decoration: none; }
.rb-go:hover { text-decoration: underline; }
.rb-tip { position: absolute; bottom: calc(100% + 8px); left: 50%; transform: translate(-50%, 4px); white-space: nowrap; font-size: .72rem; background: var(--ink); color: var(--bg); padding: 3px 8px; border-radius: 6px; opacity: 0; pointer-events: none; transition: opacity .2s, transform .2s; z-index: 3; }
button:hover > .rb-tip, button:focus-visible > .rb-tip { opacity: 1; transform: translate(-50%, 0); }

/* families: one rod per family, a bead per role */
.rb-fam { display: grid; grid-template-columns: 82px minmax(0, 1fr); align-items: center; gap: 12px; padding: 7px 0; }
.rb-fam.on .rb-lab { color: var(--ink); font-weight: 700; }
.rb-rod { position: relative; display: flex; gap: 14px; align-items: center; height: 26px; padding: 0 10px; }
.rb-rod::before { content: ""; position: absolute; left: 0; right: 0; top: 50%; height: 4px; margin-top: -2px; border-radius: 2px; background: var(--rod); }
.rb-bead { position: relative; width: 22px; height: 22px; border-radius: 50%; border: 0; padding: 0; cursor: pointer; background: radial-gradient(circle at 34% 30%, #fff 0%, #f1ede8 45%, #d6cfc7 100%); box-shadow: inset 0 0 0 1px rgba(0,0,0,.08), 0 2px 3px rgba(0,0,0,.12); transition: transform .45s var(--spring), background .3s; }
.rb-fam.on .rb-bead { background: radial-gradient(circle at 34% 30%, #6a6a70 0%, #1c1c1e 50%, #000 100%); }
.rb-bead.on, .rb-fam.on .rb-bead.on { background: radial-gradient(circle at 34% 30%, #ff9d8f 0%, #e0301e 45%, #9e1a0c 100%); transform: scale(1.3); box-shadow: 0 0 0 4px color-mix(in srgb, var(--rust) 18%, transparent), 0 2px 4px rgba(0,0,0,.2); }
.rb-hero .rb-bead { width: 28px; height: 28px; } .rb-hero .rb-rod { height: 34px; gap: 18px; }

/* matrix: a bead per role and skill, its size the level */
.rb-grid { display: grid; grid-template-columns: minmax(90px, 1.4fr) repeat(var(--cols), minmax(14px, 1fr)); gap: 3px 4px; align-items: center; }
.rb-row { display: contents; }
.rb-col { position: relative; height: 18px; border: 0; padding: 0; background: none; cursor: pointer; }
.rb-col::after { content: ""; position: absolute; left: 50%; top: 50%; width: 12px; height: 12px; margin: -6px; border-radius: 50%; background: radial-gradient(circle at 34% 30%, #6a6a70 0%, #1c1c1e 50%, #000 100%); transition: transform .3s var(--spring); }
.rb-col.on::after { background: radial-gradient(circle at 34% 30%, #ff9d8f 0%, #e0301e 45%, #9e1a0c 100%); transform: scale(1.3); }
.rb-dot { justify-self: center; display: block; border-radius: 50%; background: var(--line-strong); width: calc(3px + var(--s, 0) * 2.4px); height: calc(3px + var(--s, 0) * 2.4px); transition: background .3s, transform .3s var(--spring); }
.rb-dot.l0 { --s: 0; opacity: .5; } .rb-dot.l1 { --s: 1; } .rb-dot.l2 { --s: 2; } .rb-dot.l3 { --s: 3; } .rb-dot.l4 { --s: 4; }
.rb-dot.on { background: radial-gradient(circle at 34% 30%, #ff9d8f, #e0301e 45%, #9e1a0c); transform: scale(1.15); }
.rb-card .rb-grid .rb-lab { font-size: .7rem; }

/* skills and tasks: a rod per row */
.rb-bars { list-style: none; margin: 0; padding: 0; display: grid; gap: 2px; }
.rb-bars button { width: 100%; display: grid; grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr) 40px; gap: 12px; align-items: center; padding: 6px 4px; border: 0; background: none; text-align: left; cursor: pointer; border-radius: 8px; font: inherit; color: inherit; }
.rb-bars button.on .rb-lab { color: var(--ink); font-weight: 700; }
.rb-bars button:hover { background: var(--paper); }
.rb-bars .count { text-align: right; }

/* the home page's tabs */
.rbt { padding: 18px 22px 20px; }
.rbt-tabs { display: flex; flex-wrap: wrap; gap: 4px 14px; border-bottom: 1px solid var(--line); margin-bottom: 18px; }
.rbt-tabs button { border: 0; background: none; padding: 8px 0 10px; font: inherit; font-size: .9rem; color: var(--sec); cursor: pointer; border-bottom: 2px solid transparent; margin-bottom: -1px; }
.rbt-tabs button.on { color: var(--ink); font-weight: 700; border-bottom-color: var(--rust); }
.rbt-body { animation: rise .45s var(--ease) both; }
@media (prefers-reduced-motion: reduce) { .rb-read, .rbt-body { animation: none; } }
`;
