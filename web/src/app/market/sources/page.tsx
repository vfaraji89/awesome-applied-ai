import type { Metadata } from "next";
import Link from "next/link";
import { Crumb } from "@/components/section-intro";
import market from "@/data/market.json";
import sources from "@/data/sources.json";
import { skills } from "@/data/framework";
import { T, TH } from "@/i18n/lang";
import { share } from "@/lib/share";

export const metadata: Metadata = { ...share("market/sources"), title: "Sources", description: "Every company career page and job board the applied AI job tracker reads, the hiring platform behind each, and what the ads ask for: skills, tasks and tools." };

type Board = { slug: string; url: string; ok: boolean | null; ai: number };
type Provider = { id: string; name: string; kind: string; site: string; how: string; boards: Board[]; ok: boolean; ai: number; processed: number };
type Row = { id?: string; name?: string; n: number; share?: number };
const skillName = (id: string) => skills.find((s) => s.id === id)?.name ?? id;

export default function Sources() {
  const m = market as unknown as { generatedAt: string; totals: { processed: number }; skills: Row[]; tasks?: Row[]; tools: Row[] };
  const ps = sources.providers as Provider[];
  const ats = ps.filter((p) => p.kind === "ats"), boards = ps.filter((p) => p.kind === "board");
  const live = (p: Provider) => p.boards.filter((b) => b.ok !== false);
  const pages = ats.reduce((a, p) => a + live(p).length, 0);
  const updated = new Date(sources.generatedAt).toUTCString().slice(5, 16);
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
          <p className="lead" style={{ marginTop: 16 }}>
            <TH k="src.lead" vars={{ n: m.totals.processed.toLocaleString("en-US"), c: pages, p: ats.length, b: boards.length }}>
              <b>{m.totals.processed.toLocaleString("en-US")} AI job ads</b> since 1 October 2026, from <b>{pages} company career pages</b> on {ats.length} hiring platforms and {boards.length} public job boards. Each ad is reduced to what it asks for.
            </TH>
          </p>
          <div className="src-asks">
            {col("src.k_skills", "Skills", m.skills.slice(0, 8).map((r) => ({ key: r.id!, label: <T k={`skill.${r.id}`}>{skillName(r.id!)}</T>, v: `${r.share}%` })))}
            {m.tasks?.length
              ? col("src.k_tasks", "Tasks", m.tasks.slice(0, 8).map((r) => ({ key: r.id!, label: <T k={`task.${r.id}`}>{r.name ?? r.id ?? ""}</T>, v: `${r.share}%` })))
              : <div className="frame src-col"><span className="kicker"><T k="src.k_tasks">Tasks</T></span><p className="muted" style={{ marginTop: 10 }}><T k="mk.tasks_soon">Read from each ad's description from the next daily run on.</T></p></div>}
            {col("src.k_tools", "Tools", m.tools.slice(0, 8).map((r) => ({ key: r.name!, label: r.name, v: String(r.n) })))}
          </div>
          <p className="count" style={{ marginTop: 14 }}><Link href="/market/"><T k="src.more">Roles, levels and titles on the market pulse</T></Link> · <T k="mk.updated" vars={{ d: updated }}>{"Updated {d}"}</T></p>
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
                      <a key={b.slug} href={b.url} rel="noopener nofollow" target="_blank" className={`src-chip${b.ok === false ? " off" : ""}`} title={b.ok === false ? "Did not answer on the last run" : undefined}>{b.slug}</a>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
          <p className="count" style={{ marginTop: 12 }}><span className="src-chip off" style={{ pointerEvents: "none" }}>slug</span> <T k="src.off">did not answer on the last run, so it is not counted</T></p>
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
            <p className="muted" style={{ marginTop: 14 }}><TH k="src.suggest">A company missing? <Link href="/contribute/">Suggest its career page</Link>.</TH></p>
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
        .src-chip { font: .74rem var(--font-mono), monospace; padding: 3px 8px; border: 1px solid var(--line); border-radius: 6px; text-decoration: none; color: var(--ink); }
        .src-chip:hover { border-color: var(--rust); color: var(--rust-deep); }
        .src-chip.off { color: var(--muted); text-decoration: line-through; opacity: .7; }
        .src-rows { list-style: none; margin: 18px 0 0; padding: 0; display: grid; gap: 10px; }
        .src-rows li { display: flex; flex-wrap: wrap; gap: 4px 12px; align-items: baseline; padding-bottom: 10px; border-bottom: 1px solid var(--line); }
        .src-rows li.col { flex-direction: column; gap: 2px; }
        .src-rows a { font-weight: 700; text-decoration: none; } .src-rows a:hover { color: var(--rust-deep); }
      `}</style>
    </>
  );
}
