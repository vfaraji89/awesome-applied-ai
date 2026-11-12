import { Crumb } from "@/components/section-intro";
import type { Metadata } from "next";
import Link from "next/link";
import market from "@/data/market.json";
import { fRoles, skills } from "@/data/framework";
import { More } from "@/components/more";

export const metadata: Metadata = { title: "Market pulse", description: "What the applied AI job market asks for: roles, levels, titles, skills and tools, tracked daily from public job boards." };

type Row = { id?: string; name?: string; title?: string; month?: string; n: number; share?: number; inStack?: boolean };
const roleName = (id: string) => fRoles.find((r) => r.id === id)?.name ?? "Other AI roles";
const skillName = (id: string) => skills.find((s) => s.id === id)?.name ?? id;
const SOURCE: Record<string, string> = { greenhouse: "Greenhouse boards", lever: "Lever boards", ashby: "Ashby boards", remotive: "Remotive", arbeitnow: "Arbeitnow", hackernews: "Hacker News: Who is hiring?" };

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
  const m = market as unknown as { generatedAt: string | null; totals: { allTime: number; openNow: number; newToday: number; remoteShare: number }; sources: { id: string; boards: number; ai: number }[];
    roles: Row[]; seniority: Row[]; titles: Row[]; skills: Row[]; tools: Row[]; byMonth: Row[] };
  const ready = !!m.generatedAt && m.totals.openNow > 0;
  const updated = m.generatedAt ? new Date(m.generatedAt).toUTCString().replace(/:\d\d GMT/, " UTC") : "";
  return (
    <>
      <section className="section">
        <div className="wrap">
          <Crumb id="market" page="Market pulse" />
          <h1 style={{ marginTop: 12 }}>What the market asks for<span className="dot">.</span></h1>
          <p className="lead" style={{ marginTop: 16 }}><b>What AI jobs ask for</b>, read from public job boards <b>every day</b>.</p>
          <More label="How it is collected"><p className="lead" style={{ marginTop: 12 }}>Only the AI roles are kept. Each posting is reduced to its <b>role, level, skills and tools</b>; no posting, link or company is republished. This page is the gist.</p></More>
          {ready ? (
            <div className="mk-totals">
              {[["Open AI roles now", m.totals.openNow.toLocaleString("en-US")], ["Tracked all time", m.totals.allTime.toLocaleString("en-US")], ["New since yesterday", m.totals.newToday.toLocaleString("en-US")], ["Remote", `${m.totals.remoteShare}%`]].map(([k, v]) => (
                <div key={k} className="frame"><span className="count">{k}</span><b className="mk-big">{v}</b></div>
              ))}
            </div>
          ) : (
            <div className="frame" style={{ marginTop: 28 }}>
              <span className="soon">First collection pending</span>
              <p className="muted" style={{ marginTop: 10 }}>The tracker runs once a day. The numbers appear here after its first run.</p>
            </div>
          )}
          {updated && <p className="count" style={{ marginTop: 14 }}>Updated {updated}</p>}
        </div>
      </section>

      {ready && (
        <>
          <section className="section">
            <div className="wrap grid grid-2" style={{ gap: 36 }}>
              <div>
                <span className="kicker">Roles</span>
                <h2 style={{ marginTop: 10 }}>Which jobs are open<span className="dot">.</span></h2>
                <Bars rows={m.roles} label={(r) => <Link href="/roles/">{roleName(r.id!)}</Link>} />
              </div>
              <div>
                <span className="kicker">Levels</span>
                <h2 style={{ marginTop: 10 }}>At what level<span className="dot">.</span></h2>
                <Bars rows={m.seniority} label={(r) => r.id} />
              </div>
            </div>
          </section>
          <section className="section" style={{ background: "var(--paper)" }}>
            <div className="wrap grid grid-2" style={{ gap: 36 }}>
              <div>
                <span className="kicker">Skills</span>
                <h2 style={{ marginTop: 10 }}>What postings ask for<span className="dot">.</span></h2>
                <p className="muted" style={{ marginTop: 8 }}>Share of open AI postings that mention each skill area.</p>
                <Bars rows={m.skills} max={100} label={(r) => skillName(r.id!)} />
              </div>
              <div>
                <span className="kicker">Tools</span>
                <h2 style={{ marginTop: 10 }}>The tools named most<span className="dot">.</span></h2>
                <p className="muted" style={{ marginTop: 8 }}><span className="mk-key" /> in <Link href="/tools/">my daily stack</Link></p>
                <Bars rows={m.tools.slice(0, 20)} label={(r) => r.name} />
              </div>
            </div>
          </section>
          <section className="section">
            <div className="wrap grid grid-2" style={{ gap: 36 }}>
              <div>
                <span className="kicker">Titles</span>
                <h2 style={{ marginTop: 10 }}>What they call it<span className="dot">.</span></h2>
                <Bars rows={m.titles.slice(0, 15)} label={(r) => r.title} />
              </div>
              <div>
                <span className="kicker">Over time</span>
                <h2 style={{ marginTop: 10 }}>New AI roles per month<span className="dot">.</span></h2>
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
          <span className="kicker">Method</span>
          <ul className="muted mk-method">
            <li>Sources: {m.sources.length ? m.sources.map((s) => `${SOURCE[s.id] ?? s.id} (${s.ai} AI roles)`).join(" · ") : "public company job boards (Greenhouse, Lever, Ashby), Remotive, Arbeitnow and Hacker News “Who is hiring?”"}. Big boards that forbid automated reading are not used.</li>
            <li>A posting counts as an AI role when its title says so. Role family and level come from the title; skills and tools from the whole description.</li>
            <li>Only the role, level, skills, tools, remote flag and dates are kept. No posting, link, description or company is stored or shown.</li>
            <li>The data covers the boards watched, not the whole market, and grows every day.</li>
          </ul>
        </div>
      </section>
      <style>{`
        .mk-totals { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 210px), 1fr)); gap: 16px; margin-top: 30px; }
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
