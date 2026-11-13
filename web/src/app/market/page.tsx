import { Crumb } from "@/components/section-intro";
import type { Metadata } from "next";
import Link from "next/link";
import market from "@/data/market.json";
import sources from "@/data/sources.json";
import { fRoles, skills } from "@/data/framework";
import { More } from "@/components/more";
import { T, TH } from "@/i18n/lang";
import { JsonLd } from "@/components/json-ld";
import { marketLd } from "@/lib/seo";
import { share } from "@/lib/share";

export const metadata: Metadata = { ...share("market"), title: "Market pulse", description: "What applied AI job ads ask for since 1 October 2026: roles, levels, titles, skills, tasks and tools, read daily from public career pages and job boards." };

type Row = { id?: string; name?: string; title?: string; month?: string; n: number; share?: number; inStack?: boolean; preferred?: number };
const roleName = (id: string) => fRoles.find((r) => r.id === id)?.name ?? "";
const skillName = (id: string) => skills.find((s) => s.id === id)?.name ?? id;
const SINCE_EN = "1 Oct 2026";

function Bars({ rows, label, max }: { rows: Row[]; label: (r: Row) => React.ReactNode; max?: number }) {
  const top = max ?? Math.max(1, ...rows.map((r) => r.n));
  return (
    <ul className="mk-bars">
      {rows.map((r, i) => (
        <li key={i} style={{ ["--i" as string]: i }}>
          <span className="mk-label">{label(r)}</span>
          <span className="mk-track"><span className={`mk-fill${r.inStack ? " mine" : ""}`} style={{ width: `${Math.min(100, ((max !== undefined && r.share !== undefined ? r.share : r.n) / top) * 100)}%` }} /></span>
          <span className="mono mk-n">{r.share !== undefined ? `${r.share}%` : r.n}</span>
        </li>
      ))}
    </ul>
  );
}

export default function Market() {
  const m = market as unknown as { generatedAt: string | null; totals: { processed: number; listedNow: number; newToday: number; remoteShare: number }; sources: { id: string; boards: number; ai: number }[];
    roles: Row[]; seniority: Row[]; titles: Row[]; skills: Row[]; tasks: Row[]; tools: Row[]; byMonth: Row[];
    sinceQuarter?: string; years?: { asked: number; median: number; bands: Row[] } };
  const ready = !!m.generatedAt && m.totals.processed > 0;
  const read = sources.providers.reduce((a, p) => a + (p.boards.length ? p.boards.filter((b) => b.ok !== false).length : p.ok ? 1 : 0), 0);
  const updated = m.generatedAt ? new Date(m.generatedAt).toUTCString().replace(/:\d\d GMT/, " UTC") : "";
  return (
    <>
      <JsonLd data={marketLd()} />
      <section className="section">
        <div className="wrap">
          <Crumb id="market" page="Market pulse" />
          <h1 style={{ marginTop: 12 }}><TH k="market.h1">What the market asks for</TH><span className="dot">.</span></h1>
          <p className="lead" style={{ marginTop: 16 }}><TH k="market.p1b"><b>What AI job ads ask for</b>: every ad published since 1 October 2026 on the career pages and boards I read, <b>updated daily</b>.</TH></p>
          <More label="How it is collected"><p className="lead" style={{ marginTop: 12 }}><TH k="market.p2b">Only AI job ads are kept. Each ad is reduced to its <b>role, level, skills, tasks and tools</b>; no ad or its link is republished. <Link href="/market/sources/">Every site read</Link> is listed.</TH></p></More>
          {ready ? (
            <div className="mk-totals">
              {[["mk.processed", "AI job ads processed", m.totals.processed.toLocaleString("en-US"), <><span key="q" className="mk-q">{m.sinceQuarter ?? "2026 Q4"}</span> <T key="s" k="mk.since" vars={{ d: SINCE_EN }}>{"since {d}"}</T></>],
                ["mk.read", "Career pages and boards read", String(read), <Link key="s" href="/market/sources/"><T k="mk.see_sources">see the list</T></Link>],
                ["mk.new", "New since yesterday", m.totals.newToday.toLocaleString("en-US"), null],
                ["mk.remote", "Remote", `${m.totals.remoteShare}%`, null]].map(([k, en, v, sub]) => (
                <div key={k as string} className="frame"><span className="count"><T k={k as string}>{en as string}</T></span><b className="mk-big">{v as string}</b>{sub && <span className="count mk-sub">{sub}</span>}</div>
              ))}
            </div>
          ) : (
            <div className="frame" style={{ marginTop: 28 }}>
              <span className="soon"><T k="mk.pending">First collection pending</T></span>
              <p className="muted" style={{ marginTop: 10 }}><T k="mk.pending_p">The tracker runs once a day. The numbers appear here after its first run.</T></p>
            </div>
          )}
          {updated && <p className="count" style={{ marginTop: 14 }}><T k="mk.updated" vars={{ d: updated }}>{"Updated {d}"}</T></p>}
        </div>
      </section>

      {ready && (
        <>
          <section className="section">
            <div className="wrap grid grid-2" style={{ gap: 36 }}>
              <div>
                <span className="kicker"><T k="mk.k_roles">Roles</T></span>
                <h2 style={{ marginTop: 10 }}><T k="mk.h_roles2">Which roles they hire for</T><span className="dot">.</span></h2>
                <Bars rows={m.roles} label={(r) => <Link href="/roles/">{roleName(r.id!) || <T k="mk.other">Other AI roles</T>}</Link>} />
              </div>
              <div>
                <span className="kicker"><T k="mk.k_levels">Levels</T></span>
                <h2 style={{ marginTop: 10 }}><T k="mk.h_levels">At what level</T><span className="dot">.</span></h2>
                <Bars rows={m.seniority} label={(r) => <T k={`lvl.${(r.id ?? "").toLowerCase()}`}>{r.id ?? ""}</T>} />
                {m.years && m.years.asked > 0 && (
                  <>
                    <p className="muted" style={{ marginTop: 22 }}><T k="mk.years_p" vars={{ a: m.years.asked, y: m.years.median }}>{"Years of experience asked for, in the {a}% of ads that say: {y} is the median."}</T></p>
                    <Bars rows={m.years.bands} label={(r) => <T k="mk.years_band" vars={{ b: r.id ?? "" }}>{"{b} years"}</T>} />
                  </>
                )}
              </div>
            </div>
          </section>
          <section className="section" style={{ background: "var(--paper)" }}>
            <div className="wrap grid grid-2" style={{ gap: 36 }}>
              <div>
                <span className="kicker"><T k="mk.k_skills">Skills</T></span>
                <h2 style={{ marginTop: 10 }}><T k="mk.h_skills">What postings ask for</T><span className="dot">.</span></h2>
                <p className="muted" style={{ marginTop: 8 }}><T k="mk.skills_p2">Share of AI job ads that mention each skill area.</T></p>
                <Bars rows={m.skills} max={100} label={(r) => <T k={`skill.${r.id}`}>{skillName(r.id!)}</T>} />
              </div>
              <div>
                <span className="kicker"><T k="mk.k_tools">Tools</T></span>
                <h2 style={{ marginTop: 10 }}><T k="mk.h_tools">The tools named most</T><span className="dot">.</span></h2>
                <p className="muted" style={{ marginTop: 8 }}><span className="mk-key" /> <Link href="/tools/#stack"><T k="mk.mystack">in my daily stack</T></Link></p>
                <Bars rows={m.tools.slice(0, 20)} label={(r) => <>{r.name}{r.preferred ? <span className="count mk-pref"> · <T k="mk.pref" vars={{ n: r.preferred }}>{"{n} as nice-to-have"}</T></span> : null}</>} />
              </div>
            </div>
          </section>
          <section className="section" id="tasks">
            <div className="wrap">
              <span className="kicker"><T k="mk.k_tasks">Tasks</T></span>
              <h2 style={{ marginTop: 10 }}><T k="mk.h_tasks">What the job asks you to do</T><span className="dot">.</span></h2>
              {m.tasks?.length ? (
                <>
                  <p className="muted" style={{ marginTop: 8 }}><T k="mk.tasks_p">Share of AI job ads whose description asks for each kind of work.</T></p>
                  <div className="mk-tasks"><Bars rows={m.tasks} max={100} label={(r) => <T k={`task.${r.id}`}>{r.name ?? r.id ?? ""}</T>} /></div>
                </>
              ) : <p className="muted" style={{ marginTop: 8 }}><T k="mk.tasks_soon">Read from each ad's description from the next daily run on.</T></p>}
            </div>
          </section>
          <section className="section" style={{ background: "var(--paper)" }}>
            <div className="wrap grid grid-2" style={{ gap: 36 }}>
              <div>
                <span className="kicker"><T k="mk.k_titles">Titles</T></span>
                <h2 style={{ marginTop: 10 }}><T k="mk.h_titles">What they call it</T><span className="dot">.</span></h2>
                <Bars rows={m.titles.slice(0, 15)} label={(r) => r.title} />
              </div>
              <div>
                <span className="kicker"><T k="mk.k_time">Over time</T></span>
                <h2 style={{ marginTop: 10 }}><T k="mk.h_time2">AI job ads per month</T><span className="dot">.</span></h2>
                <div className="mk-months">
                  {m.byMonth.map((r) => {
                    const top = Math.max(1, ...m.byMonth.map((x) => x.n));
                    return <div key={r.month} className="mk-col"><span className="mono count">{r.n}</span><span className="mk-colbar" style={{ height: `${(r.n / top) * 100}%` }} /><span className="mono count">{r.month}</span></div>;
                  })}
                </div>
              </div>
            </div>
          </section>
        </>
      )}

      <section className="section">
        <div className="wrap">
          <span className="kicker"><T k="mk.k_method">Method</T></span>
          <ul className="muted mk-method">
            <li><TH k="mk.m1b" vars={{ n: read, p: sources.providers.length }}>{read} company career pages and job boards, across {sources.providers.length} hiring platforms, are read once a day. <Link href="/market/sources/">The full list</Link> says which, and why LinkedIn, Indeed and Glassdoor are not among them.</TH></li>
            <li><T k="mk.m2b">An ad counts when its title names an AI role. Role family and level come from the title; skills, tasks and tools from the whole description.</T></li>
            <li><T k="mk.m5">The count starts on 1 October 2026, by each board's own publish date. Tracking began on 7 November, so October ads count only if they were still listed then.</T></li>
            <li><T k="mk.m3b">Only the role, level, skills, tasks, tools, remote flag and dates are kept. No ad, link or description is stored or shown.</T></li>
            <li><T k="mk.m4">The data covers the boards watched, not the whole market, and grows every week.</T></li>
          </ul>
        </div>
      </section>
      <style>{`
        .mk-totals { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 210px), 1fr)); gap: 16px; margin-top: 30px; }
        .mk-q { display: inline-block; font-weight: 700; letter-spacing: .06em; padding: 1px 7px; border-radius: 5px; background: var(--rust); color: #fff; margin-right: 4px; }
        .mk-pref { font-size: .72rem; }
        .mk-sub { display: block; margin-top: 4px; } .mk-sub a { color: inherit; }
        .mk-tasks .mk-bars { grid-template-columns: repeat(auto-fit, minmax(min(100%, 420px), 1fr)); column-gap: 36px; }
        .mk-big { display: block; font-size: 2.6rem; font-weight: 800; letter-spacing: -.04em; margin-top: 6px; }
        .mk-totals .frame:first-child .mk-big { color: var(--rust); }
        .mk-bars { list-style: none; margin: 18px 0 0; padding: 0; display: grid; gap: 9px; }
        .mk-bars li { display: grid; grid-template-columns: minmax(0, 240px) minmax(0, 1fr) 46px; gap: 12px; align-items: center; font-size: .92rem; animation: rise .5s var(--ease) both; animation-delay: calc(var(--i) * 40ms); }
        .mk-label { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; } .mk-label a { text-decoration: none; } .mk-label a:hover { color: var(--rust-deep); }
        .mk-track { height: 10px; border-radius: 6px; background: var(--line); overflow: hidden; }
        .mk-fill { display: block; height: 100%; border-radius: 6px; background: var(--ink); opacity: .8; transform-origin: left; animation: mk-grow .9s var(--ease) both; }
        .mk-fill.mine { background: var(--rust); opacity: 1; }
        @keyframes mk-grow { from { transform: scaleX(0); } to { transform: none; } }
        .mk-n { font-size: .78rem; color: var(--muted); text-align: right; }
        .mk-key { display: inline-block; width: 14px; height: 10px; border-radius: 4px; background: var(--rust); vertical-align: 0; margin-right: 4px; }
        .mk-months { display: flex; align-items: end; gap: 10px; height: 220px; margin-top: 20px; overflow-x: auto; }
        .mk-col { flex: 1; min-width: 44px; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: end; gap: 6px; }
        .mk-colbar { width: 100%; border-radius: 6px 6px 2px 2px; background: var(--rust); animation: mk-up .9s var(--ease) both; transform-origin: bottom; }
        @keyframes mk-up { from { transform: scaleY(0); } to { transform: none; } }
        .mk-method { margin: 12px 0 0; padding-left: 18px; display: grid; gap: 6px; max-width: 80ch; }
      `}</style>
    </>
  );
}
