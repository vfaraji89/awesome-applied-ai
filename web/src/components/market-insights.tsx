/* The market page's insight layer: headline cards, a role-by-skill heatmap, skills that travel
   together, labs against everyone else, remote share by role, years by level, and a profile for
   every skill. All numbers come from pipeline/run.ts (market.json > insights); nothing is typed in.
   One hue (rust) carries magnitude everywhere; the lab comparison uses rust for labs and ink for the
   rest, with a legend. Every mark has a hover/focus tooltip with the exact number. */
import Link from "next/link";
import { fRoles, skills } from "@/data/framework";
import { T } from "@/i18n/lang";

type Grid = { rows: string[]; cols: string[]; n: number[]; cells: number[][] };
type Pair = { a: string; b: string; n: number; share: number; lift: number };
type SkillProfile = { id: string; n: number; share: number; topRole: { id: string; share: number } | null; with: { id: string; share: number; lift?: number }[]; tools: string[]; toolLift?: { name: string; share: number; lift: number }[] };
export type Insights = {
  perAd: { skills: number; wide: number };
  aiDev: { share: number; tools: string[] };
  junior: number;
  roleSkill: Grid;
  roleTask: Grid | null;
  pairs: Pair[];
  remoteByRole: { id: string; n: number; share: number }[];
  yearsByLevel: { id: string; n: number; median: number; low: number; high: number }[];
  labs: { n: number; rest: number; skills: { id: string; lab: number; rest: number }[] } | null;
  skills: SkillProfile[];
};

const roleName = (id: string) => fRoles.find((r) => r.id === id)?.name ?? id;
const skillName = (id: string) => skills.find((s) => s.id === id)?.name ?? id;
const skillWhat = (id: string) => skills.find((s) => s.id === id)?.what ?? "";
const Sk = ({ id }: { id: string }) => <T k={`skill.${id}`}>{skillName(id)}</T>;
const Lvl = ({ id }: { id: string }) => <T k={`lvl.${id.toLowerCase()}`}>{id}</T>;

/** Headline cards: one number, one plain sentence, the thing it is about. */
export function Aha({ ins, total, roles, skillsTop, tasks }: { ins: Insights; total: number; roles: { id?: string; n: number }[]; skillsTop: { id?: string; share?: number }[]; tasks?: { id?: string; name?: string; share?: number }[] }) {
  const pct = (n: number) => Math.round((n / (total || 1)) * 100);
  const topSkill = skillsTop.find((s) => s.id !== "software") ?? skillsTop[0];
  const topRole = roles.find((r) => r.id !== "other-ai") ?? roles[0];
  const cust = skillsTop.find((s) => s.id === "customer");
  const pair = ins.pairs[0];
  const gap = ins.labs ? [...ins.labs.skills].sort((a, b) => (b.lab - b.rest) - (a.lab - a.rest))[0] : null;
  const cards: { k: string; big: string; lead: React.ReactNode; what: React.ReactNode }[] = [];
  if (topSkill) cards.push({ k: "skill", big: `${topSkill.share}%`, lead: <T k="aha.skill">of AI job ads ask for</T>, what: <Sk id={topSkill.id!} /> });
  if (topRole) cards.push({ k: "role", big: `${pct(topRole.n)}%`, lead: <T k="aha.role">are for the most common AI role:</T>, what: roleName(topRole.id!) });
  if (gap && gap.lab - gap.rest >= 5) cards.push({ k: "labs", big: `+${gap.lab - gap.rest}`, lead: <T k="aha.labs">points more often at the AI labs than everywhere else:</T>, what: <Sk id={gap.id} /> });
  if (pair) cards.push({ k: "pair", big: `${pair.lift.toFixed(1)}×`, lead: <T k="aha.pair">as often together as chance would give:</T>, what: <><Sk id={pair.a} /> + <Sk id={pair.b} /></> });
  if (cust && (cust.share ?? 0) > 0) cards.push({ k: "cust", big: `${cust.share}%`, lead: <T k="aha.cust">want you to work with</T>, what: <T k="aha.cust_what">customers, not only code</T> });
  cards.push({ k: "wide", big: String(ins.perAd.skills), lead: <T k="aha.wide">skill areas in the average ad;</T>, what: <T k="aha.wide_what" vars={{ n: ins.perAd.wide }}>{"{n}% ask for five or more"}</T> });
  if (tasks?.length) cards.push({ k: "task", big: `${tasks[0].share}%`, lead: <T k="aha.task">ask you to</T>, what: <T k={`task.${tasks[0].id}`}>{tasks[0].name ?? ""}</T> });
  cards.push({ k: "junior", big: `${ins.junior}%`, lead: <T k="aha.junior">are junior or intern roles:</T>, what: <T k="aha.junior_what">most ask for experience</T> });
  if (ins.aiDev.share > 0) cards.push({ k: "dev", big: `${ins.aiDev.share}%`, lead: <T k="aha.dev">name an AI coding tool, such as</T>, what: ins.aiDev.tools.slice(0, 3).join(", ") });
  return (
    <div className="mi-aha">
      {cards.slice(0, 6).map((c, i) => (
        <div key={c.k} className="mi-card" style={{ ["--i" as string]: i }}>
          <b className="mi-big">{c.big}</b>
          <span className="mi-lead">{c.lead}</span>
          <span className="mi-what">{c.what}</span>
        </div>
      ))}
    </div>
  );
}

/** Heatmap: rows are roles, columns skills (or tasks); the cell is the share of that role's ads. */
export function Heatmap({ g, col, colLabel }: { g: Grid; col: "skill" | "task"; colLabel?: (id: string) => React.ReactNode }) {
  const label = (id: string) => (col === "skill" ? <Sk id={id} /> : colLabel ? colLabel(id) : id);
  return (
    <div className="mi-heat-wrap" role="region" aria-label="Heatmap" tabIndex={0}>
      <table className="mi-heat">
        <thead>
          <tr><th /> {g.cols.map((c) => <th key={c} scope="col"><span>{label(c)}</span></th>)}</tr>
        </thead>
        <tbody>
          {g.rows.map((r, i) => (
            <tr key={r}>
              <th scope="row"><Link href="/roles/">{roleName(r)}</Link><i className="mono">{g.n[i]}</i></th>
              {g.cells[i].map((v, k) => (
                <td key={k} style={{ ["--v" as string]: v }} className={v >= 60 ? "hi" : ""} tabIndex={0} aria-label={`${roleName(r)}: ${v}%`}>
                  <span className="mi-v">{v >= 50 ? v : ""}</span>
                  <span className="mi-tip">{roleName(r)} · {label(g.cols[k])}: <b>{v}%</b></span>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mi-scale count"><span>0%</span><i /><span>100%</span><span className="mi-scale-note"><T k="mi.scale">share of that role&apos;s ads; numbers shown from 50%</T></span></div>
    </div>
  );
}

/** Skills that travel together: lift over chance, strongest first. */
export function Pairs({ pairs }: { pairs: Pair[] }) {
  const top = Math.max(2, ...pairs.map((p) => p.lift));
  return (
    <ul className="mi-pairs">
      {pairs.map((p, i) => (
        <li key={p.a + p.b} style={{ ["--i" as string]: i }} tabIndex={0}>
          <span className="mi-pair-l"><Sk id={p.a} /> <em>+</em> <Sk id={p.b} /></span>
          <span className="mi-pair-t"><span style={{ width: `${(p.lift / top) * 100}%` }} /><i style={{ left: `${(1 / top) * 100}%` }} /></span>
          <span className="mono mi-pair-n">{p.lift.toFixed(2)}×</span>
          <span className="mi-tip"><T k="mi.pair_tip" vars={{ n: p.n, s: p.share }}>{"{n} ads ({s}%) ask for both"}</T></span>
        </li>
      ))}
    </ul>
  );
}

/** Labs against everyone else: one row per skill, two dots on a 0 to 100 scale. */
export function LabsVsRest({ labs }: { labs: NonNullable<Insights["labs"]> }) {
  const rows = [...labs.skills].sort((a, b) => Math.abs(b.lab - b.rest) - Math.abs(a.lab - a.rest));
  return (
    <>
      <div className="mi-legend count"><span><i className="dot lab" /><T k="mi.labs" vars={{ n: labs.n }}>{"AI labs ({n} ads)"}</T></span><span><i className="dot rest" /><T k="mi.rest" vars={{ n: labs.rest }}>{"everyone else ({n} ads)"}</T></span></div>
      <ul className="mi-dumb">
        {rows.map((r) => (
          <li key={r.id} tabIndex={0}>
            <span className="mi-dumb-l"><Sk id={r.id} /></span>
            <span className="mi-dumb-t">
              <span className="mi-dumb-bar" style={{ left: `${Math.min(r.lab, r.rest)}%`, width: `${Math.abs(r.lab - r.rest)}%` }} />
              <i className="dot rest" style={{ left: `${r.rest}%` }} /><i className="dot lab" style={{ left: `${r.lab}%` }} />
            </span>
            <span className="mono mi-dumb-n">{r.lab - r.rest > 0 ? "+" : ""}{r.lab - r.rest}</span>
            <span className="mi-tip"><Sk id={r.id} />: <T k="mi.labs_tip" vars={{ a: r.lab, b: r.rest }}>{"labs {a}%, everyone else {b}%"}</T></span>
          </li>
        ))}
      </ul>
    </>
  );
}

/** Years asked by level: the middle half as a band, the median as a dot. */
export function YearsByLevel({ rows }: { rows: Insights["yearsByLevel"] }) {
  const max = Math.max(10, ...rows.map((r) => r.high));
  return (
    <ul className="mi-years">
      {rows.map((r) => (
        <li key={r.id} tabIndex={0}>
          <span><Lvl id={r.id} /></span>
          <span className="mi-years-t">
            <span className="mi-years-band" style={{ left: `${(r.low / max) * 100}%`, width: `${Math.max(1.5, ((r.high - r.low) / max) * 100)}%` }} />
            <i className="dot lab" style={{ left: `${(r.median / max) * 100}%` }} />
          </span>
          <span className="mono mi-dumb-n">{r.median}y</span>
          <span className="mi-tip"><T k="mi.years_tip" vars={{ m: r.median, a: r.low, b: r.high, n: r.n }}>{"median {m} years; half ask {a} to {b} ({n} ads)"}</T></span>
        </li>
      ))}
    </ul>
  );
}

/** Every skill, opened: what it is, how often it is asked, who asks most, what comes with it. */
export function SkillProfiles({ list }: { list: SkillProfile[] }) {
  return (
    <div className="mi-profiles">
      {list.map((s, i) => (
        <article key={s.id} className="mi-prof" style={{ ["--i" as string]: i }}>
          <header>
            <span className="mono mi-rank">{String(i + 1).padStart(2, "0")}</span>
            <b><Sk id={s.id} /></b>
            <span className="mi-prof-pct">{s.share}%</span>
          </header>
          <span className="mi-prof-bar"><span style={{ width: `${s.share}%` }} /></span>
          <p className="muted"><T k={`skillwhat.${s.id}`}>{skillWhat(s.id)}</T></p>
          <dl>
            {s.topRole && <><dt><T k="mi.most">asked most by</T></dt><dd>{roleName(s.topRole.id)} <i className="mono">{s.topRole.share}%</i></dd></>}
            {s.with.length > 0 && <><dt><T k="mi.with2">comes with, more than usual</T></dt><dd>{s.with.map((w, k) => <span key={w.id}>{k ? " · " : ""}<Sk id={w.id} /> <i className="mono">{w.lift ? `${w.lift}×` : `${w.share}%`}</i></span>)}</dd></>}
            {(s.toolLift?.length ?? 0) > 0 && <><dt><T k="mi.tools2">tools that stand out</T></dt><dd className="mi-chips">{s.toolLift!.map((t) => <span key={t.name} className="mi-chip" title={`${t.share}% of these ads, ${t.lift}× the usual rate`}>{t.name} <i className="mono">{t.lift}×</i></span>)}</dd></>}
          </dl>
        </article>
      ))}
    </div>
  );
}

export const insightCss = `
  .mi-aha { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 320px), 1fr)); gap: 14px; margin-top: 26px; }
  .mi-card { position: relative; display: flex; flex-direction: column; gap: 4px; padding: 20px 20px 18px; border: 1px solid var(--line); border-radius: var(--radius); background: var(--card); overflow: hidden; animation: rise .6s var(--ease) both; animation-delay: calc(var(--i) * 70ms); }
  .mi-card::before { content: ""; position: absolute; inset: 0 auto 0 0; width: 4px; background: var(--rust); transform-origin: top; animation: mi-grow .8s var(--ease) both; animation-delay: calc(var(--i) * 70ms + .2s); }
  @keyframes mi-grow { from { transform: scaleY(0); } to { transform: none; } }
  .mi-big { font-size: 2.6rem; font-weight: 800; letter-spacing: -.04em; line-height: 1; color: var(--rust); }
  .mi-lead { color: var(--sec); font-size: .92rem; margin-top: 6px; }
  .mi-what { font-weight: 700; font-size: 1.02rem; line-height: 1.3; }
  .mi-tip { position: absolute; z-index: 5; left: 50%; bottom: calc(100% + 8px); transform: translate(-50%, 4px); white-space: nowrap; padding: 6px 10px; border-radius: 8px; background: var(--ink); color: var(--bg); font-size: .78rem; font-weight: 500; pointer-events: none; opacity: 0; transition: opacity .15s, transform .15s; }
  .mi-tip b { font-weight: 800; }
  :is(td, li):is(:hover, :focus-visible) > .mi-tip { opacity: 1; transform: translate(-50%, 0); }
  .mi-heat-wrap { margin-top: 22px; overflow-x: auto; padding-top: 6px; }
  .mi-heat { border-collapse: separate; border-spacing: 3px; min-width: 760px; width: 100%; }
  .mi-heat tbody th { width: 1%; }
  .mi-heat thead th { height: 132px; vertical-align: bottom; font-weight: 500; font-size: .78rem; color: var(--sec); padding: 0 0 6px; }
  .mi-heat thead th span { display: inline-block; writing-mode: vertical-rl; transform: rotate(180deg); white-space: nowrap; }
  .mi-heat tbody th { text-align: left; font-weight: 500; font-size: .88rem; white-space: nowrap; padding-right: 12px; }
  .mi-heat tbody th a { text-decoration: none; } .mi-heat tbody th a:hover { color: var(--rust-deep); }
  .mi-heat tbody th i { font-style: normal; font-size: .7rem; color: var(--muted); margin-left: 8px; }
  .mi-heat td { position: relative; height: 34px; min-width: 40px; border-radius: 6px; text-align: center; font-size: .74rem; font-weight: 600; background: color-mix(in oklab, var(--rust) calc(var(--v) * 1%), var(--paper)); color: var(--ink); cursor: default; transition: transform .15s var(--ease), box-shadow .15s; }
  .mi-heat td.hi { color: #fff; }
  .mi-heat td:is(:hover, :focus-visible) { transform: scale(1.12); box-shadow: 0 0 0 2px var(--bg), 0 6px 18px rgba(0,0,0,.18); z-index: 4; outline: none; }
  .mi-scale { display: flex; align-items: center; gap: 8px; margin-top: 12px; flex-wrap: wrap; }
  .mi-scale i { width: 140px; height: 8px; border-radius: 4px; background: linear-gradient(90deg, var(--paper), var(--rust)); border: 1px solid var(--line); }
  .mi-scale-note { margin-left: 8px; }
  .mi-pairs, .mi-dumb, .mi-years { list-style: none; margin: 18px 0 0; padding: 0; display: grid; gap: 10px; }
  .mi-pairs li, .mi-dumb li, .mi-years li { position: relative; display: grid; grid-template-columns: minmax(0, 1.25fr) minmax(0, 1fr) 52px; gap: 12px; align-items: center; font-size: .9rem; outline: none; }
  .mi-pairs li { animation: rise .5s var(--ease) both; animation-delay: calc(var(--i) * 50ms); }
  .mi-pair-l em { font-style: normal; color: var(--rust); font-weight: 700; padding: 0 2px; }
  .mi-pair-t { position: relative; height: 10px; border-radius: 5px; background: var(--line); }
  .mi-pair-t > span { position: absolute; inset: 0 auto 0 0; border-radius: 5px; background: var(--rust); transform-origin: left; animation: mk-grow .9s var(--ease) both; }
  .mi-pair-t > i { position: absolute; top: -4px; bottom: -4px; width: 2px; background: var(--ink); opacity: .45; }
  .mi-pair-n, .mi-dumb-n { font-size: .78rem; color: var(--muted); text-align: right; }
  .mi-legend { display: flex; gap: 18px; flex-wrap: wrap; margin-top: 12px; }
  .mi-legend span { display: inline-flex; align-items: center; gap: 6px; }
  .mi-legend .dot, .mi-dumb .dot, .mi-years .dot { display: inline-block; width: 12px; height: 12px; border-radius: 50%; box-shadow: 0 0 0 2px var(--bg); }
  .dot.lab { background: var(--rust); } .dot.rest { background: var(--ink); }
  .mi-dumb-t, .mi-years-t { position: relative; height: 14px; border-radius: 7px; background: var(--line); }
  .mi-dumb-t .dot, .mi-years-t .dot { position: absolute; top: 1px; margin-left: -6px; transition: transform .15s; }
  .mi-dumb-bar, .mi-years-band { position: absolute; top: 4px; height: 6px; border-radius: 3px; background: color-mix(in oklab, var(--rust) 35%, var(--line)); }
  li:is(:hover, :focus-visible) .dot { transform: scale(1.25); }
  .mi-profiles { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 300px), 1fr)); gap: 14px; margin-top: 22px; }
  .mi-prof { border: 1px solid var(--line); border-radius: var(--radius); background: var(--card); padding: 16px 18px; display: grid; gap: 10px; align-content: start; animation: rise .5s var(--ease) both; animation-delay: calc(var(--i) * 40ms); transition: border-color .2s, transform .2s var(--ease); }
  .mi-prof:hover { border-color: var(--rust); transform: translateY(-2px); }
  .mi-prof header { display: flex; align-items: baseline; gap: 10px; }
  .mi-rank { font-size: .72rem; color: var(--rust); font-weight: 700; }
  .mi-prof-pct { margin-left: auto; font-weight: 800; font-size: 1.25rem; letter-spacing: -.02em; }
  .mi-prof-bar { display: block; height: 6px; border-radius: 3px; background: var(--line); overflow: hidden; }
  .mi-prof-bar span { display: block; height: 100%; border-radius: 3px; background: var(--rust); transform-origin: left; animation: mk-grow .9s var(--ease) both; }
  .mi-prof p { margin: 0; font-size: .86rem; }
  .mi-prof dl { margin: 2px 0 0; display: grid; gap: 3px; font-size: .86rem; }
  .mi-prof dt { color: var(--muted); font-family: var(--font-mono), monospace; font-size: .66rem; text-transform: uppercase; letter-spacing: .08em; margin-top: 6px; }
  .mi-prof dd { margin: 0; }
  .mi-chips { display: flex; flex-wrap: wrap; gap: 5px; }
  .mi-chip { font-size: .78rem; padding: 2px 8px; border-radius: 6px; background: var(--paper); border: 1px solid var(--line); } .mi-prof dd i { font-style: normal; color: var(--muted); font-size: .74rem; }
  @media (max-width: 640px) { .mi-pairs li, .mi-dumb li, .mi-years li { grid-template-columns: minmax(0, 1fr) 90px 44px; } .mi-tip { white-space: normal; width: max-content; max-width: 240px; } }
  @media (prefers-reduced-motion: reduce) { .mi-card, .mi-card::before, .mi-pairs li, .mi-prof, .mi-pair-t > span, .mi-prof-bar span { animation: none; } }
`;
