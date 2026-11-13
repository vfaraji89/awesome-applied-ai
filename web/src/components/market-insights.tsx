/* The market page's insight layer: headline cards, a role-by-skill heatmap, skills that travel
   together, labs against everyone else, remote share by role, years by level, and a profile for
   every skill. All numbers come from pipeline/run.ts (market.json > insights); nothing is typed in.
   One hue (rust) carries magnitude everywhere; the lab comparison uses rust for labs and ink for the
   rest, with a legend. Every mark has a hover/focus tooltip with the exact number. */
import Link from "next/link";
import { fRoles, skills } from "@/data/framework";
import { T } from "@/i18n/lang";
import { InsightTicker } from "@/components/insight-ticker";

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
export function Aha({ ins, total, roles, skillsTop, tasks, affected, tech, years, only }: { only?: "ticker"; ins: Insights; total: number; roles: { id?: string; n: number }[]; skillsTop: { id?: string; share?: number }[]; tasks?: { id?: string; name?: string; share?: number }[];
  affected?: { any: number; ads: number; rows: { id: string; name: string; any: number; n: number }[] } | null; tech?: { cats: { id: string; items: { name: string; share: number; change?: number; isNew?: boolean }[] }[] } | null; years?: { asked: number; median: number } }) {
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
  // more for the ticker than fits the cards: AI beyond AI jobs, the stack, experience
  const extra: typeof cards = [];
  if (affected && affected.ads > 0) {
    extra.push({ k: "aff", big: `${affected.any}%`, lead: <T k="aha.aff">of non-AI tech job ads now ask for AI in the job itself, across</T>, what: <T k="aha.aff_what" vars={{ n: affected.ads.toLocaleString("en-US") }}>{"{n} ads"}</T> });
    const f = affected.rows[0];
    if (f) extra.push({ k: "aff1", big: `${f.any}%`, lead: <T k="aha.aff1">of ads in the job family most touched by AI:</T>, what: <T k={`fam.${f.id}`}>{f.name}</T> });
  }
  const rising = tech?.cats.flatMap((c) => c.items).filter((x) => (x.change ?? 0) > 0).sort((a, b) => (b.change ?? 0) - (a.change ?? 0))[0];
  if (rising) extra.push({ k: "rise", big: `+${rising.change}`, lead: <T k="aha.rise">points in 30 days, the fastest-rising name in the stack:</T>, what: rising.name });
  const lang2 = tech?.cats.find((c) => c.id === "lang")?.items[1];
  if (lang2) extra.push({ k: "lang2", big: `${lang2.share}%`, lead: <T k="aha.lang2">name the second language after Python:</T>, what: lang2.name });
  if (years && years.asked > 0) extra.push({ k: "yrs", big: String(years.median), lead: <T k="aha.yrs">years of experience is the median ask, in the</T>, what: <T k="aha.yrs_what" vars={{ p: years.asked }}>{"{p}% of ads that say"}</T> });
  const label = "Insights from the AI job ads";
  if (only === "ticker") return <InsightTicker items={[...cards, ...extra]} label={label} />;
  return (
    <>
    <InsightTicker items={[...cards, ...extra]} label={label} />
    <div className="mi-aha">
      {cards.slice(0, 6).map((c, i) => (
        <div key={c.k} className="frame mi-card" style={{ ["--i" as string]: i }}>
          <b className="mi-big">{c.big}</b>
          <span className="mi-lead">{c.lead}</span>
          <span className="mi-what">{c.what}</span>
          <span className="rod" />
        </div>
      ))}
    </div>
    </>
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
      <div className="mi-legend count"><span><i className="bead mi-b" /><T k="mi.labs" vars={{ n: labs.n }}>{"AI labs ({n} ads)"}</T></span><span><i className="bead ink mi-b" /><T k="mi.rest" vars={{ n: labs.rest }}>{"everyone else ({n} ads)"}</T></span></div>
      <ul className="mi-dumb">
        {rows.map((r) => (
          <li key={r.id} tabIndex={0}>
            <span className="mi-dumb-l"><Sk id={r.id} /></span>
            <span className="mi-dumb-t">
              <span className="mi-dumb-bar" style={{ left: `${Math.min(r.lab, r.rest)}%`, width: `${Math.abs(r.lab - r.rest)}%` }} />
              <i className="bead ink mi-b" style={{ left: `${r.rest}%` }} /><i className="bead mi-b" style={{ left: `${r.lab}%` }} />
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
            <i className="bead mi-b" style={{ left: `${(r.median / max) * 100}%` }} />
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
        <article key={s.id} className="frame mi-prof" style={{ ["--i" as string]: i }}>
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
            {(s.toolLift?.length ?? 0) > 0 && <><dt><T k="mi.tools2">tools that stand out</T></dt><dd className="mi-chips">{s.toolLift!.map((t) => <span key={t.name} className="chip" title={`${t.share}% of these ads, ${t.lift}× the usual rate`}>{t.name} <i className="mono">{t.lift}×</i></span>)}</dd></>}
          </dl>
          <span className="rod" />
        </article>
      ))}
    </div>
  );
}

export const insightCss = `
  /* every bar is an abacus rod: a wooden track, a rust fill, a bead where the value ends */
  .mi-rodtrack, .mi-pair-t, .mi-prof-bar, .mi-cat-t, .mi-aff-bars > span { position: relative; height: 6px; border-radius: 3px; background: var(--rod); overflow: visible; }
  .mi-fill, .mi-pair-t > span, .mi-prof-bar span, .mi-cat-t span, .mi-aff-bars > span > span { position: relative; display: block; height: 100%; border-radius: 3px; background: var(--rust); transform-origin: left; animation: mk-grow .9s var(--ease) both; }
  .mi-fill::after, .mi-pair-t > span::after, .mi-prof-bar span::after, .mi-cat-t span::after, .mi-aff-bars > span > span::after { content: ""; position: absolute; right: -6px; top: 50%; width: 12px; height: 12px; margin-top: -6px; border-radius: 50%; background: radial-gradient(circle at 34% 30%, #ff9d8f 0%, #e0301e 45%, #9e1a0c 100%); box-shadow: 0 1px 2px rgba(0,0,0,.25); }
  .mi-aff-bars .u > span { background: var(--ink); }
  .mi-aff-bars .u > span::after { background: radial-gradient(circle at 34% 30%, #6a6a70 0%, #1c1c1e 50%, #000 100%); }
  .mi-b { position: absolute; width: 14px; height: 14px; top: 50%; margin: -7px 0 0 -7px; box-shadow: 0 1px 2px rgba(0,0,0,.25); transition: transform .15s; }
  .mi-legend .mi-b { position: static; margin: 0; display: inline-block; }
  .mi-aha { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 320px), 1fr)); gap: 14px; margin-top: 26px; }
  .mi-card { display: flex; flex-direction: column; gap: 4px; padding: 22px 26px 30px; animation: mi-open .9s cubic-bezier(.77,0,.18,1) both; animation-delay: calc(var(--i) * 110ms + .2s); }
  .mi-card > * { animation: mi-in .5s var(--ease) both; animation-delay: calc(var(--i) * 110ms + .75s); }
  /* opens from the centre to the edges, like a score graphic */
  @keyframes mi-open { from { clip-path: inset(0 50% 0 50% round var(--radius)); } to { clip-path: inset(0 0 0 0 round var(--radius)); } }
  @keyframes mi-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
  .mi-card:hover, .mi-prof:hover, .mi-cat:hover { transform: translateY(-3px); box-shadow: 0 22px 36px -28px rgba(28, 28, 30, .55); }
  :is(.mi-card, .mi-prof):hover .rod::after { transform: scaleX(1); }
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
  .mi-heat td { position: relative; height: 34px; min-width: 40px; border-radius: 9px; text-align: center; font-size: .74rem; font-weight: 600; background: color-mix(in oklab, var(--rust) calc(var(--v) * 1%), var(--paper)); color: var(--ink); cursor: default; transition: transform .15s var(--ease), box-shadow .15s; }
  .mi-heat td.hi { color: #fff; }
  .mi-heat td:is(:hover, :focus-visible) { transform: scale(1.12); box-shadow: 0 0 0 2px var(--bg), 0 6px 18px rgba(0,0,0,.18); z-index: 4; outline: none; }
  .mi-scale { display: flex; align-items: center; gap: 8px; margin-top: 12px; flex-wrap: wrap; }
  .mi-scale i { width: 140px; height: 6px; border-radius: 3px; background: linear-gradient(90deg, var(--paper), var(--rust)); }
  .mi-scale-note { margin-left: 8px; }
  .mi-pairs, .mi-dumb, .mi-years { list-style: none; margin: 18px 0 0; padding: 0; display: grid; gap: 10px; }
  .mi-pairs li, .mi-dumb li, .mi-years li { position: relative; display: grid; grid-template-columns: minmax(0, 1.25fr) minmax(0, 1fr) 52px; gap: 12px; align-items: center; font-size: .9rem; outline: none; }
  .mi-pairs li { animation: rise .5s var(--ease) both; animation-delay: calc(var(--i) * 50ms); }
  .mi-pair-l em { font-style: normal; color: var(--rust); font-weight: 700; padding: 0 2px; }
  .mi-pair-t > i { position: absolute; top: -6px; bottom: -6px; width: 2px; border-radius: 1px; background: var(--ink); opacity: .35; }
  .mi-pair-n, .mi-dumb-n { font-size: .78rem; color: var(--muted); text-align: right; }
  .mi-legend { display: flex; gap: 18px; flex-wrap: wrap; margin-top: 12px; }
  .mi-legend span { display: inline-flex; align-items: center; gap: 6px; }
  .mi-dumb-t, .mi-years-t { position: relative; height: 6px; border-radius: 3px; background: var(--rod); }
  li:is(:hover, :focus-visible) .mi-b { transform: scale(1.2); }
  .mi-dumb-bar, .mi-years-band { position: absolute; top: 0; height: 6px; border-radius: 3px; background: color-mix(in oklab, var(--rust) 55%, transparent); }
  .mi-profiles { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 300px), 1fr)); gap: 14px; margin-top: 22px; }
  .mi-prof { padding: 20px 24px 30px; display: grid; gap: 10px; align-content: start; animation: rise .5s var(--ease) both; animation-delay: calc(var(--i) * 40ms); transition: border-color .2s, transform .2s var(--ease); }
  .mi-prof header { display: flex; align-items: baseline; gap: 10px; }
  .mi-rank { font-size: .72rem; color: var(--rust); font-weight: 700; }
  .mi-prof-pct { margin-left: auto; font-weight: 800; font-size: 1.25rem; letter-spacing: -.02em; }
  .mi-prof p { margin: 0; font-size: .86rem; }
  .mi-prof dl { margin: 2px 0 0; display: grid; gap: 3px; font-size: .86rem; }
  .mi-prof dt { color: var(--muted); font-family: var(--font-mono), monospace; font-size: .66rem; text-transform: uppercase; letter-spacing: .08em; margin-top: 6px; }
  .mi-prof dd { margin: 0; }
  .mi-chips { display: flex; flex-wrap: wrap; gap: 5px; }
  .mi-chips .chip, .mi-aff-terms .chip, .mi-rising .chip { padding: 2px 9px; font-size: .76rem; }
  .chip i.mono { font-style: normal; font-size: .68rem; color: var(--rust-deep); } .mi-prof dd i { font-style: normal; color: var(--muted); font-size: .74rem; }
  @media (max-width: 640px) { .mi-pairs li, .mi-dumb li, .mi-years li { grid-template-columns: minmax(0, 1fr) 90px 44px; } .mi-tip { white-space: normal; width: max-content; max-width: min(240px, 80vw); left: 0; transform: translate(0, 4px); } :is(td, li):is(:hover, :focus-visible) > .mi-tip, .mi-wk:is(:hover, :focus-visible) > .mi-tip { transform: none; } }
  @media (prefers-reduced-motion: reduce) { .mi-card, .mi-card > *, .mi-pairs li, .mi-prof, .mi-pair-t > span, .mi-prof-bar span { animation: none; } }
`;

/** AI job ads per week by publish date: one column per week, month names under each month's
 *  first week, the current week drawn lighter as it is still filling. */
export function Weekly({ weeks, months: byMonth }: { weeks: { week: string; n: number; partial?: boolean }[]; months?: { month?: string; n: number }[] }) {
  const top = Math.max(1, ...weeks.map((w) => w.n));
  const mon = (d: string) => new Date(d + "T00:00:00Z").toLocaleDateString("en-GB", { month: "short", timeZone: "UTC" });
  const day = (d: string) => new Date(d + "T00:00:00Z").toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });
  // month totals from the exact monthly counts (a week can straddle two months)
  const months = new Map<string, number>();
  if (byMonth?.length) for (const r of byMonth) months.set(mon(`${r.month}-01`), r.n);
  else for (const w of weeks) months.set(mon(w.week), (months.get(mon(w.week)) ?? 0) + w.n);
  return (
    <>
      <div className="mi-months count">{[...months.entries()].map(([m, n]) => <span key={m}><b>{n.toLocaleString("en-US")}</b> {m}</span>)}</div>
      <div className="mi-weeks" role="img" aria-label={weeks.map((w) => `${day(w.week)}: ${w.n}`).join(", ")}>
        {weeks.map((w, i) => (
          <div key={w.week} className={`mi-wk${w.partial ? " partial" : ""}`} tabIndex={0} style={{ ["--i" as string]: i }}>
            <span className="mi-wk-bar" style={{ height: `${Math.max(2, (w.n / top) * 100)}%` }} />
            <span className="mi-wk-x count">{i === 0 || mon(w.week) !== mon(weeks[i - 1].week) ? mon(w.week) : ""}</span>
            <span className="mi-tip"><T k="mi.week_tip" vars={{ d: day(w.week), n: w.n }}>{"week of {d}: {n} ads"}</T>{w.partial ? <> · <T k="mi.so_far">so far</T></> : null}</span>
          </div>
        ))}
      </div>
    </>
  );
}

type TechItem = { name: string; n: number; share: number; first?: string; change?: number; isNew?: boolean };
type TechCat = { id: string; name: string; items: TechItem[] };
/** The stack around AI: every category with its items as share bars, new and rising flagged. */
export function TechStack({ tech }: { tech: { read: number; cats: TechCat[] } }) {
  const flagged = tech.cats.flatMap((c) => c.items.filter((x) => x.isNew || (x.change ?? 0) >= 1).map((x) => ({ ...x, cat: c.id })))
    .sort((a, b) => Number(!!b.isNew) - Number(!!a.isNew) || (b.change ?? 0) - (a.change ?? 0)).slice(0, 10);
  return (
    <>
      {flagged.length > 0 && (
        <div className="mi-rising">
          <span className="kicker"><T k="mi.rising">New and rising</T></span>
          {flagged.map((x) => <span key={x.cat + x.name} className="chip">{x.name} <i className="mono">{x.isNew ? <T k="mi.new">new</T> : `+${x.change} pts`}</i></span>)}
        </div>
      )}
      <div className="mi-stack">
        {tech.cats.filter((c) => c.items.length).map((c) => {
          const top = Math.max(1, ...c.items.map((x) => x.share));
          return (
            <div key={c.id} className="frame mi-cat">
              <span className="kicker"><T k={`tech.${c.id}`}>{c.name}</T></span>
              <ul>
                {c.items.slice(0, c.id === "lang" ? 40 : 10).map((x) => (
                  <li key={x.name} tabIndex={0}>
                    <span className="mi-cat-l">{x.name}{x.isNew ? <em className="mi-new"><T k="mi.new">new</T></em> : null}</span>
                    <span className="mi-cat-t"><span style={{ width: `${(x.share / top) * 100}%` }} /></span>
                    <span className="mono mi-cat-n">{x.share}%</span>
                    <span className="mi-tip"><T k="mi.tech_tip" vars={{ n: x.n, s: x.share }}>{"{n} ads, {s}% of those read"}</T>{x.change !== undefined ? ` · ${x.change > 0 ? "+" : ""}${x.change} pts / 30d` : ""}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </>
  );
}

type Affected = { since: string; ads: number; any: number; rows: { id: string; name: string; n: number; any: number; build: number; use: number; terms: string[] }[] };
/** How AI reaches other tech jobs: per family, the share asking to build with AI and to use AI tools. */
export function AffectedByAI({ a }: { a: Affected }) {
  return (
    <>
      <div className="mi-legend count">
        <span><i className="bead mi-b" /><T k="mi.aff_build">build AI into the product</T></span>
        <span><i className="bead ink mi-b" /><T k="mi.aff_use">work with AI coding tools</T></span>
      </div>
      <ul className="mi-aff">
        {a.rows.map((r, i) => (
          <li key={r.id} tabIndex={0} style={{ ["--i" as string]: i }}>
            <span className="mi-aff-l"><b><T k={`fam.${r.id}`}>{r.name}</T></b><i className="mono">{r.n.toLocaleString("en-US")} <T k="src.ads">ads</T></i></span>
            <span className="mi-aff-big">{r.any}%</span>
            <span className="mi-aff-bars">
              <span className="b"><span style={{ width: `${r.build}%` }} /></span>
              <span className="u"><span style={{ width: `${r.use}%` }} /></span>
            </span>
            <span className="mi-aff-terms">{r.terms.map((t) => <span key={t} className="chip">{t}</span>)}</span>
            <span className="mi-tip"><T k="mi.aff_tip" vars={{ b: r.build, u: r.use }}>{"{b}% ask to build with AI, {u}% to use AI tools"}</T></span>
          </li>
        ))}
      </ul>
    </>
  );
}

export const insightCss2 = `
  .mi-months { display: flex; gap: 18px; flex-wrap: wrap; margin-top: 14px; }
  .mi-months b { font-size: 1.3rem; color: var(--ink); font-family: var(--font-sans), sans-serif; letter-spacing: -.02em; }
  .mi-weeks { position: relative; display: flex; align-items: end; gap: 8px; height: 220px; margin-top: 22px; padding-bottom: 22px; }
  .mi-weeks::after { content: ""; position: absolute; left: 0; right: 0; bottom: 20px; height: 4px; border-radius: 2px; background: var(--rod); }
  .mi-wk { position: relative; flex: 1; height: 100%; display: flex; align-items: end; outline: none; }
  .mi-wk-bar { position: relative; display: block; width: 100%; max-width: 34px; margin: 0 auto; border-radius: 6px 6px 2px 2px; background: linear-gradient(180deg, var(--rust), var(--rust-deep)); transform-origin: bottom; animation: mk-up .8s var(--ease) both; animation-delay: calc(var(--i) * 45ms); }
  .mi-wk-bar::before { content: ""; position: absolute; left: 50%; top: -7px; width: 14px; height: 14px; margin-left: -7px; border-radius: 50%; background: radial-gradient(circle at 34% 30%, #ff9d8f 0%, #e0301e 45%, #9e1a0c 100%); box-shadow: 0 1px 2px rgba(0,0,0,.25); }
  .mi-wk.partial .mi-wk-bar { background: repeating-linear-gradient(135deg, var(--rust) 0 4px, color-mix(in oklab, var(--rust) 45%, var(--bg)) 4px 8px); }
  .mi-wk:is(:hover, :focus-visible) .mi-wk-bar { filter: brightness(1.12); }
  .mi-wk:is(:hover, :focus-visible) > .mi-tip { opacity: 1; transform: translate(-50%, 0); }
  .mi-wk-x { position: absolute; left: 0; bottom: -22px; white-space: nowrap; }
  .mi-rising { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; margin-top: 18px; }
  .mi-rising .kicker { margin-right: 6px; }
  .mi-stack { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 330px), 1fr)); gap: 16px; margin-top: 22px; align-items: start; }
  .mi-cat { padding: 20px 24px; }
  .mi-cat:first-child { grid-row: span 2; }
  .mi-cat ul { list-style: none; margin: 12px 0 0; padding: 0; display: grid; gap: 6px; }
  .mi-cat li { position: relative; display: grid; grid-template-columns: minmax(0, 120px) 1fr 44px; gap: 10px; align-items: center; font-size: .86rem; outline: none; }
  .mi-cat-l { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .mi-new { font-style: normal; font-family: var(--font-mono), monospace; font-size: .58rem; letter-spacing: .1em; text-transform: uppercase; color: var(--rust-deep); border: 1px dashed var(--rust); border-radius: 999px; padding: 1px 6px; margin-left: 6px; vertical-align: 1px; }
  .mi-cat-n { font-size: .74rem; color: var(--muted); text-align: right; }
  .mi-aff { list-style: none; margin: 18px 0 0; padding: 0; display: grid; gap: 12px; }
  .mi-aff li { position: relative; display: grid; grid-template-columns: minmax(0, 220px) 64px minmax(0, 1fr) minmax(0, 260px); gap: 14px; align-items: center; padding-bottom: 12px; border-bottom: 1px solid var(--line); outline: none; animation: rise .5s var(--ease) both; animation-delay: calc(var(--i) * 50ms); }
  .mi-aff-l { display: flex; flex-direction: column; } .mi-aff-l i { font-style: normal; font-size: .72rem; color: var(--muted); }
  .mi-aff-big { font-size: 1.6rem; font-weight: 800; letter-spacing: -.03em; color: var(--rust); }
  .mi-aff-bars { display: grid; gap: 5px; }
  .mi-aff-terms { display: flex; flex-wrap: wrap; gap: 4px; }
  @media (max-width: 760px) { .mi-aff li { grid-template-columns: 1fr 60px; } .mi-aff-bars, .mi-aff-terms { grid-column: 1 / -1; } .mi-cat:first-child { grid-row: auto; } }
`;
