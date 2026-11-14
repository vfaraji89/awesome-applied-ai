import Link from "next/link";
import type { Metadata } from "next";
import { structure, type Section } from "@/lib/structure";
import { T, TH } from "@/i18n/lang";
import { slug } from "@/i18n/slug";
import { tools } from "@/data/tools";
import { share } from "@/lib/share";
import { M } from "@/lib/market-data";
import people from "@/data/people.json";
import events from "@/data/events.json";
import tok from "@/data/tokalator.json";
import gh from "@/data/github-stats.json";
import { TokalatorPanel } from "@/components/tokalator-panel";

export const metadata: Metadata = { ...share("") };

/* The first page, kept minimal: the name, the mission, four live numbers, then one card per
   section with the pages inside it. Everything else lives one click away. */
function Card({ s, wide }: { s: Section; wide?: boolean }) {
  return (
    <section id={s.id} className={`frame hc${wide ? " hc-wide" : ""}`}>
      <Link href={s.href} className="hc-head">
        <span className="hc-n mono">{s.n}</span>
        <h2><T k={`sec.${s.id}.title`}>{s.title}</T><span className="dot">.</span></h2>
      </Link>
      <p className="muted hc-line"><T k={`sec.${s.id}.line`}>{s.line}</T></p>
      <ul className="hc-pages">
        {s.pages.map((p) => (
          <li key={p.href}>
            <Link href={p.href}>
              <b><T k={`page.${slug(p.label)}`}>{p.label}</T></b>
              <span className="muted"><T k={`note.${slug(p.label)}`}>{p.note}</T></span>
              {p.soon ? <span className="soon"><T k="ui.soon">soon</T></span> : <span className="hc-go" aria-hidden="true">→</span>}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* Tokalator is the author's own tool, so the card says so first. Version from the extension's
   package.json and stars from GitHub, both refreshed weekly (pipeline/github-stats.ts). */
function Tokalator() {
  const stars = (gh as { repos: Record<string, { stars: number }> }).repos["vfaraji89/tokalator"]?.stars;
  const MARKET = "https://marketplace.visualstudio.com/items?itemName=vfaraji89.tokalator";
  return (
    <aside className="frame tok rise" style={{ ["--i" as string]: 3 }} aria-label="Tokalator">
      <span className="kicker"><T k="tok.k">From the author · open source</T></span>
      <TokalatorPanel />
      <b className="tok-what"><T k="tok.what">See every token your AI coding assistant spends.</T></b>
      <p className="muted tok-line"><T k="tok.line2">Context budget, usage and cost for Claude Code, Copilot and Codex, in VS Code, as an MCP server and a CLI.</T></p>
      <div className="tok-foot">
      <div className="chips tok-chips">
        {tok.version && <a className="chip" href={MARKET} target="_blank" rel="noreferrer"><T k="tok.vs">VS Code</T> v{tok.version}</a>}
        {stars !== undefined && <a className="chip" href="https://github.com/vfaraji89/tokalator" target="_blank" rel="noreferrer" aria-label={`${stars} GitHub stars`}>★ {stars} <T k="tok.stars">stars</T></a>}
        <span className="chip">AGPL-3.0</span>
      </div>
      <a className="btn tok-go" href="https://tokalator.ai" target="_blank" rel="noreferrer">tokalator.ai ↗</a>
      </div>
    </aside>
  );
}

export default function Home() {
  const today = new Date().toISOString().slice(0, 10);
  const upcoming = events.events.filter((e) => e.end >= today).length;
  const sections = structure.filter((s) => !s.footerOnly);
  const glance = [
    { k: "home.g_ads", en: "AI job ads read", n: M.totals.processed.toLocaleString("en"), sub: <T k="mk.since" vars={{ d: "1 Oct 2026" }}>{"since {d}"}</T>, href: "/market/" },
    { k: "home.g_people", en: "builders, not famous names", n: String(people.people.length), sub: <T k="home.g_people_sub" vars={{ n: people.people.filter((p) => p.group === "quiet").length }}>{"{n} quiet builders among them"}</T>, href: "/people/" },
    { k: "home.g_events", en: "events coming up", n: String(upcoming), sub: <T k="home.g_events_sub">official dates only</T>, href: "/events/" },
    { k: "home.g_tools", en: "tools on the map", n: String(tools.length), sub: <T k="home.g_tools_sub2">in eleven areas</T>, href: "/tools/" },
  ];
  return (
    <>
      <section className="section home-hero">
        <div className="wrap">
          <div className="home-top">
          <div>
          <span className="kicker rise">Applied AI, Simplified</span>
          <h1 className="rise" style={{ ["--i" as string]: 1, marginTop: 14 }}><TH k="home.h1s">Applied AI, <mark>simplified</mark></TH><span className="dot">.</span></h1>
          <p className="lead rise" style={{ ["--i" as string]: 2, marginTop: 18 }}>
            <T k="home.mission">Applied AI is made to sound harder than it is. This site reads the job ads, the tools, the people and the docs, and says each one plainly.</T>
          </p>
          <div className="rise home-cta" style={{ ["--i" as string]: 3 }}>
            <Link href="/market/" className="btn"><T k="home.cta_market">See what the market asks for</T> →</Link>
            <Link href="/fit/" className="btn ghost"><T k="home.cta_fit">Check your role fit</T></Link>
          </div>
          </div>
          <Tokalator />
          </div>
          <div className="home-glance">
            {glance.map((g, i) => (
              <Link key={g.k} href={g.href} className="frame home-g rise" style={{ ["--i" as string]: 4 + i }}>
                <b>{g.n}</b><span className="home-g-l"><T k={g.k}>{g.en}</T></span><span className="count">{g.sub}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section home-cats" style={{ background: "var(--paper)" }}>
        <div className="wrap">
          <span className="kicker"><T k="home.cats">Seven ways in</T></span>
          <div className="hc-grid">
            {sections.map((s, i) => <Card key={s.id} s={s} wide={i === 0} />)}
          </div>
        </div>
      </section>

      <style>{`
        .home-top { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 430px); gap: 44px; align-items: center; }
        @media (max-width: 960px) { .home-top { grid-template-columns: minmax(0, 1fr); gap: 32px; } }
        .tok { display: flex; flex-direction: column; gap: 12px; padding: 20px 22px; }
        .tok-what { font-weight: 700; font-size: 1.02rem; line-height: 1.35; color: var(--ink); margin-top: 4px; }
        .tok-line { margin: 0; font-size: .9rem; }
        .tok-chips { gap: 6px; } .tok-chips a.chip:hover { border-color: var(--rust); color: var(--rust-deep); }
        .tok-foot { display: flex; flex-wrap: wrap; gap: 12px; align-items: center; justify-content: space-between; }
        .tok-go { flex: none; }
        .home-cta { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 26px; }
        .home-glance { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 14px; margin-top: 40px; }
        @media (max-width: 900px) { .home-glance { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
        @media (max-width: 420px) { .home-glance { grid-template-columns: 1fr; } }
        .home-g { display: flex; flex-direction: column; gap: 2px; padding: 20px 24px 22px; }
        .home-g b { font-size: clamp(1.8rem, 3.4vw, 2.5rem); font-weight: 800; letter-spacing: -.04em; line-height: 1.05; color: var(--rust); }
        .home-g-l { font-weight: 700; } .home-g .count { font-size: .74rem; }
        .hc-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; margin-top: 18px; }
        @media (max-width: 860px) { .hc-grid { grid-template-columns: minmax(0, 1fr); } }
        .hc { display: flex; flex-direction: column; padding: 26px 30px 18px; }
        .hc-wide { grid-column: 1 / -1; }
        .hc-wide .hc-pages { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); column-gap: 28px; }
        @media (max-width: 860px) { .hc-wide .hc-pages { grid-template-columns: minmax(0, 1fr); } }
        .hc-head { display: flex; align-items: center; gap: 12px; text-decoration: none; color: var(--ink); }
        .hc-head h2 { margin: 0; font-size: clamp(1.25rem, 2.2vw, 1.6rem); }
        .hc-head:hover h2 { color: var(--rust-deep); }
        .hc-n { display: inline-grid; place-items: center; min-width: 30px; height: 24px; padding: 0 6px; border-radius: 6px; background: var(--rust); color: #fff; font-size: .78rem; }
        .hc-line { margin: 10px 0 14px; font-size: .95rem; }
        .hc-pages { list-style: none; margin: 0; padding: 0; }
        .hc-pages li { border-top: 1px solid var(--line); }
        .hc-pages a { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 2px 12px; align-items: baseline; padding: 10px 2px; text-decoration: none; color: var(--ink); transition: padding .3s var(--ease); }
        .hc-pages a:hover { padding-left: 8px; } .hc-pages a:hover b { color: var(--rust-deep); }
        .hc-pages b { font-size: .95rem; }
        .hc-pages .muted { grid-column: 1; font-size: .84rem; }
        .hc-pages .hc-go, .hc-pages .soon { grid-column: 2; grid-row: 1; color: var(--rust); }
      `}</style>
    </>
  );
}
