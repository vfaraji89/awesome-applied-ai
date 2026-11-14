import type { Metadata } from "next";
import Link from "next/link";
import { Crumb } from "@/components/section-intro";
import market from "@/data/market.json";
import sources from "@/data/sources.json";
import { skills } from "@/data/framework";
import { tools } from "@/data/tools";
import { T, TH } from "@/i18n/lang";
import { share } from "@/lib/share";

export const metadata: Metadata = { ...share("market/sources"), title: "Sources", description: "Every company career page and job board the applied AI job tracker reads, the hiring platform behind each, and what the ads ask for: skills, tasks and tools." };

type Board = { slug: string; url: string; ok: boolean | null; ai: number; name?: string; kind?: string; tool?: string };
type Provider = { id: string; name: string; kind: string; site: string; how: string; boards: Board[]; ok: boolean; ai: number; processed: number };
type Row = { id?: string; name?: string; n: number; share?: number };
const skillName = (id: string) => skills.find((s) => s.id === id)?.name ?? id;
const toolName = (id: string) => tools.find((t) => t.id === id)?.name ?? id;
/** Hiring tools worth knowing that are references, not sources: they search people, not job ads. */
const RECRUITING = [
  { name: "Juicebox", site: "https://juicebox.ai", what: "AI search across candidate profiles for recruiters (PeopleGPT). It finds people, not job ads, so it is a reference here, not a source." },
];

export default function Sources() {
  const m = market as unknown as { generatedAt: string; totals: { processed: number }; skills: Row[]; tasks?: Row[]; tools: Row[] };
  const ps = sources.providers as Provider[];
  const ats = ps.filter((p) => p.kind === "ats" && p.boards.length > 0), boards = ps.filter((p) => p.kind === "board");
  const live = (p: Provider) => p.boards.filter((b) => b.ok !== false);
  const pages = ats.reduce((a, p) => a + live(p).length, 0);
  const updated = new Date(sources.generatedAt).toUTCString().slice(5, 16);
  const q = (market as unknown as { sinceQuarter?: string }).sinceQuarter ?? "2026 Q4";
  const flat = ats.flatMap((p) => p.boards.filter((b) => b.ok !== false).map((b) => ({ ...b, platform: p.name })));
  const labs = flat.filter((b) => b.kind === "lab").sort((a, b) => b.ai - a.ai);
  const onMap = flat.filter((b, i, a) => b.tool && a.findIndex((x) => x.tool === b.tool) === i);
  const col = (k: string, en: string, rows: { key: string; label: React.ReactNode; v: string }[]) => (
    <div className="frame src-col">
      <span className="kicker"><T k={k}>{en}</T></span>
      <ol>{rows.map((r) => <li key={r.key}><span>{r.label}</span><i className="mono">{r.v}</i></li>)}</ol>
    </div>
  );
  return (
    <>
      <section className="section">
        <div className="wrap">
          <Crumb id="market" page="Sources" />
          <h1 style={{ marginTop: 12 }}><TH k="src.h1">Every site the tracker <mark>reads</mark></TH><span className="dot">.</span></h1>
          <p style={{ marginTop: 14 }}><span className="src-tag"><T k="src.from" vars={{ q }}>{"from {q}"}</T></span> <span className="count"><T k="src.from_p">Counting starts on 1 October 2026, the first day of Q4.</T></span></p>
          <p className="lead" style={{ marginTop: 16 }}>
            <TH k="src.lead" vars={{ n: m.totals.processed.toLocaleString("en-US"), c: pages, p: ats.length, b: boards.length }}>
              <b>{m.totals.processed.toLocaleString("en-US")} AI job ads</b> since 1 October 2026, from <b>{pages} company career pages</b> on {ats.length} hiring platforms and {boards.length} public job boards. Each ad is reduced to what it asks for.
            </TH>
          </p>
          <div className="src-asks">
            {col("src.k_skills", "Skills", m.skills.map((r) => ({ key: r.id!, label: <T k={`skill.${r.id}`}>{skillName(r.id!)}</T>, v: `${r.share}%` })))}
            {m.tasks?.length
              ? col("src.k_tasks", "Tasks", m.tasks.slice(0, 8).map((r) => ({ key: r.id!, label: <T k={`task.${r.id}`}>{r.name ?? r.id ?? ""}</T>, v: `${r.share}%` })))
              : <div className="frame src-col"><span className="kicker"><T k="src.k_tasks">Tasks</T></span><p className="muted" style={{ marginTop: 10 }}><T k="mk.tasks_soon">Read from each ad's description from the next daily run on.</T></p></div>}
            {col("src.k_tools", "Tools", m.tools.slice(0, 8).map((r) => ({ key: r.name!, label: r.name, v: String(r.n) })))}
          </div>
          <p className="count" style={{ marginTop: 14 }}><Link href="/market/"><T k="src.more">Roles, levels and titles on the market pulse</T></Link> · <T k="mk.updated" vars={{ d: updated }}>{"Updated {d}"}</T></p>
        </div>
      </section>

      <section className="section">
        <div className="wrap grid grid-2" style={{ gap: 36 }}>
          <div>
            <span className="kicker"><T k="src.k_labs">AI labs and model providers</T></span>
            <h2 style={{ marginTop: 10 }}><T k="src.h_labs">Their own career pages</T><span className="dot">.</span></h2>
            <ul className="src-rows">
              {labs.map((b) => (
                <li key={b.platform + b.slug}><a href={b.url} rel="noopener nofollow" target="_blank">{b.name ?? b.slug}</a><span className="count">{b.platform}</span>{b.ok === true && <span className="mono src-n">{b.ai} <T k="src.ai_now">AI ads now</T></span>}</li>
              ))}
            </ul>
          </div>
          <div>
            <span className="kicker"><T k="src.k_map">On the tool map</T></span>
            <h2 style={{ marginTop: 10 }}><T k="src.h_map">The companies behind the tools</T><span className="dot">.</span></h2>
            <p className="muted" style={{ marginTop: 8 }}><T k="src.map_p" vars={{ n: onMap.length, t: tools.length }}>{"Each week the tracker looks for a career page behind every tool on the map, by its GitHub organisation and website, and reads the ones it finds: {n} so far, from {t} tools."}</T></p>
            {onMap.length > 0 && (
              <div className="src-chips">
                {onMap.map((b) => <Link key={b.platform + b.slug} href={`/tools/?q=${encodeURIComponent(toolName(b.tool!))}`} className="src-chip">{toolName(b.tool!)}</Link>)}
              </div>
            )}
            <span className="kicker" style={{ display: "block", marginTop: 26 }}><T k="src.k_recruit">Recruiting tools, for reference</T></span>
            <ul className="src-rows">
              {RECRUITING.map((r) => (
                <li key={r.name} className="col"><a href={r.site} rel="noopener" target="_blank">{r.name}</a><span className="muted"><T k={`src.rec.${r.name.toLowerCase()}`}>{r.what}</T></span></li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="section" style={{ background: "var(--paper)" }}>
        <div className="wrap">
          <span className="kicker"><T k="src.k_ats">Hiring platforms</T></span>
          <h2 style={{ marginTop: 10 }}><T k="src.h_ats">Company career pages</T><span className="dot">.</span></h2>
          <p className="muted" style={{ marginTop: 8, maxWidth: "70ch" }}><T k="src.ats_p">Most companies publish their jobs through a hiring platform. The tracker reads the same public feed their own career page shows.</T></p>
          <div className="src-list">
            {ats.map((p) => (
              <div key={p.id} className="frame src-p">
                <div className="src-head">
                  <a href={p.site} rel="noopener" target="_blank"><b>{p.name}</b></a>
                  <span className="count">{p.how}</span>
                  <span className="mono src-n">{p.processed.toLocaleString("en-US")} <T k="src.ads">ads</T></span>
                </div>
                {p.boards.length ? (
                  <div className="src-chips">
                    {p.boards.map((b) => (
                      <a key={b.slug} href={b.url} rel="noopener nofollow" target="_blank" className={`src-chip${b.ok === false ? " off" : ""}${b.kind === "lab" ? " lab" : ""}${b.tool ? " map" : ""}`} title={b.ok === false ? "Did not answer on the last run" : b.name}>{b.slug}</a>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
          <p className="count" style={{ marginTop: 12, display: "flex", flexWrap: "wrap", gap: "8px 18px" }}>
            <span><span className="src-chip lab" style={{ pointerEvents: "none" }}>lab</span> <T k="src.key_lab">AI lab or model provider</T></span>
            <span><span className="src-chip map" style={{ pointerEvents: "none" }}>tool</span> <T k="src.key_map">company behind a tool on the map</T></span>
            <span><span className="src-chip off" style={{ pointerEvents: "none" }}>slug</span> <T k="src.off">did not answer on the last run, so it is not counted</T></span>
          </p>
        </div>
      </section>

      <section className="section">
        <div className="wrap grid grid-2" style={{ gap: 36 }}>
          <div>
            <span className="kicker"><T k="src.k_boards">Job boards</T></span>
            <h2 style={{ marginTop: 10 }}><T k="src.h_boards">Public boards with an open feed</T><span className="dot">.</span></h2>
            <ul className="src-rows">
              {boards.map((p) => (
                <li key={p.id}><a href={p.site} rel="noopener" target="_blank">{p.name}</a><span className="count">{p.how}</span><span className="mono src-n">{p.processed.toLocaleString("en-US")} <T k="src.ads">ads</T></span></li>
              ))}
            </ul>
          </div>
          <div>
            <span className="kicker"><T k="src.k_not">Not read</T></span>
            <h2 style={{ marginTop: 10 }}><T k="src.h_not">Left out on purpose</T><span className="dot">.</span></h2>
            <ul className="src-rows">
              {sources.excluded.map((x) => (
                <li key={x.name} className="col"><a href={x.site} rel="noopener nofollow" target="_blank">{x.name}</a><span className="muted"><T k={`src.why.${x.name.toLowerCase()}`}>{x.why}</T></span></li>
              ))}
            </ul>
            <p className="muted" style={{ marginTop: 14 }}><Link href="/market/method/"><T k="src.method">How each ad is read, how often it is wrong, and the open dataset</T> →</Link></p>
            <p className="muted" style={{ marginTop: 8 }}><TH k="src.suggest">A company missing? <Link href="/contribute/">Suggest its career page</Link>.</TH></p>
          </div>
        </div>
      </section>
      <style>{`
        .src-asks { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 250px), 1fr)); gap: 16px; margin-top: 30px; }
        .src-col ol { list-style: none; margin: 12px 0 0; padding: 0; display: grid; gap: 7px; counter-reset: s; }
        .src-col li { display: grid; grid-template-columns: 22px 1fr auto; gap: 8px; align-items: baseline; font-size: .92rem; counter-increment: s; }
        .src-col li::before { content: counter(s, decimal-leading-zero); font: 600 .7rem var(--font-mono), monospace; color: var(--rust); }
        .src-col li i { font-style: normal; font-size: .78rem; color: var(--muted); }
        .src-list { display: grid; gap: 14px; margin-top: 22px; }
        .src-head { display: flex; flex-wrap: wrap; gap: 6px 14px; align-items: baseline; }
        .src-head a { text-decoration: none; } .src-head a:hover b { color: var(--rust-deep); }
        .src-n { margin-left: auto; font-size: .8rem; color: var(--muted); }
        .src-chips { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 12px; }
        .src-chip { font: .74rem var(--font-mono), monospace; padding: 3px 10px; border: 1px solid var(--line-strong); border-radius: 999px; background: var(--card); text-decoration: none; color: var(--sec); }
        .src-chip:hover { border-color: var(--rust); color: var(--rust-deep); }
        .src-tag { display: inline-block; font: .7rem var(--font-mono), monospace; letter-spacing: .1em; text-transform: uppercase; padding: 3px 10px; border-radius: 999px; border: 1px dashed var(--rust); color: var(--rust-deep); margin-right: 8px; }
        .src-chip.lab { border-color: var(--rust); color: var(--rust-deep); background: var(--paper); }
        .src-chip.map::before { content: ""; display: inline-block; width: 8px; height: 8px; border-radius: 50%; margin-right: 6px; vertical-align: 0; background: radial-gradient(circle at 34% 30%, #ff9d8f 0%, #e0301e 45%, #9e1a0c 100%); }
        .src-chip.off { color: var(--muted); text-decoration: line-through; opacity: .7; }
        .src-rows { list-style: none; margin: 18px 0 0; padding: 0; display: grid; gap: 10px; }
        .src-rows li { display: flex; flex-wrap: wrap; gap: 4px 12px; align-items: baseline; padding-bottom: 10px; border-bottom: 1px solid var(--line); }
        .src-rows li.col { flex-direction: column; gap: 2px; }
        .src-rows a { font-weight: 700; text-decoration: none; } .src-rows a:hover { color: var(--rust-deep); }
      `}</style>
    </>
  );
}
