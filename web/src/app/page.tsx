import Link from "next/link";
import { LearnPath } from "@/components/learn-path";
import { RequestFlow } from "@/components/request-flow";
import { DocCover } from "@/components/doc-cover";
import { structure, type Section } from "@/lib/structure";
import { fRoles, skills, education } from "@/data/framework";
import { docs } from "@/data/docs";
import { site } from "@/lib/site";
import market from "@/data/market.json";
import { FitIcon } from "@/components/fit-icon";
import { T, TH } from "@/i18n/lang";
import { slug } from "@/i18n/slug";
import { tools } from "@/data/tools";
import { areas } from "@/data/areas";

function Band({ s, alt, children }: { s: Section; alt?: boolean; children: React.ReactNode }) {
  return (
    <section id={s.id} className="section band" style={alt ? { background: "var(--paper)" } : undefined}>
      <div className="wrap band-grid">
        <div className="band-head">
          <span className="band-n">{s.n}</span>
          <h2><T k={`sec.${s.id}.title`}>{s.title}</T><span className="dot">.</span></h2>
          <p className="lead"><T k={`sec.${s.id}.line`}>{s.line}</T></p>
          <ul className="band-pages">
            {s.pages.map((p) => (
              <li key={p.href}><Link href={p.href}><b><T k={`page.${slug(p.label)}`}>{p.label}</T></b><span className="muted"><T k={`note.${slug(p.label)}`}>{p.note}</T></span>{p.soon ? <span className="soon"><T k="ui.soon">soon</T></span> : <span className="band-go">→</span>}</Link></li>
            ))}
          </ul>
        </div>
        <div className="band-show">{children}</div>
      </div>
    </section>
  );
}

export default function Home() {
  // by id, never by position: adding a section must not shift the others
  const sec = (id: string) => structure.find((x) => x.id === id)!;
  const [mk, rs, ar, tl, ce, dc, co] = ["market", "roles", "architect", "tools", "certificates", "docs", "contribute"].map(sec);
  const areaCount = (id: string) => tools.filter((t) => t.area === id).length;
  const roleName = Object.fromEntries(fRoles.map((r) => [r.id, r.name]));
  const topRoles = market.roles.slice(0, 4);
  const max = topRoles[0]?.n ?? 1;
  const providers = education.filter((e) => e.kind !== "Degree");
  return (
    <>
      <section className="section">
        <div className="wrap">
          <span className="kicker rise">awesome-applied-ai</span>
          <h1 className="rise" style={{ ["--i" as string]: 1, marginTop: 14 }}><TH k="home.h1">Applied AI, <mark>mapped</mark></TH><span className="dot">.</span></h1>
          <p className="lead rise" style={{ ["--i" as string]: 2, marginTop: 18 }}>
            <T k="home.lead">From what the market asks for to the docs you need to build it: seven steps, in order.</T>
          </p>
          <div className="rise" style={{ ["--i" as string]: 3, display: "flex", gap: 10, flexWrap: "wrap", marginTop: 26 }}>
            <Link href="#market" className="btn"><T k="home.start">Start with the market</T> →</Link>
            <Link href="/docs/" className="btn ghost"><T k="home.docs">Read the docs</T></Link>
          </div>
          <Link href="/fit/" className="frame home-fit rise" style={{ ["--i" as string]: 4 }}>
            <span className="hf-ic"><FitIcon size={28} /></span>
            <span><span className="kicker"><T k="page.role-fit">Role fit</T></span><b><T k="home.fit_b">How ready are you for applied AI roles?</T></b><span className="muted"><T k="home.fit_em" vars={{ n: market.totals.allTime.toLocaleString("en") }}>{"Paste your CV. Scored against {n} real postings, with what to learn next."}</T></span></span>
            <span className="hf-go" aria-hidden="true">→</span>
            <span className="rod" />
          </Link>
          <LearnPath />
        </div>
      </section>

      <Band s={mk} alt>
        <div className="frame show-market">
          <div className="sm-stats">
            <div><b>{market.totals.allTime.toLocaleString("en")}</b><span className="muted"><T k="home.st_tracked">technical AI roles tracked</T></span></div>
            <div><b>{market.totals.remoteShare}%</b><span className="muted"><T k="home.st_remote">remote</T></span></div>
            <div><b>{market.sources.reduce((a, x) => a + x.boards, 0)}</b><span className="muted"><T k="home.st_boards">public boards</T></span></div>
          </div>
          <span className="kicker" style={{ display: "block", marginTop: 20 }}><T k="home.top_roles">Most asked-for roles</T></span>
          <ul className="sm-bars">
            {topRoles.map((r) => <li key={r.id}><span>{roleName[r.id] ?? r.id}</span><i style={{ width: `${(r.n / max) * 100}%` }} /><span className="count">{r.n}</span></li>)}
          </ul>
        </div>
      </Band>

      <Band s={rs}>
        <div className="frame">
          <span className="kicker"><T k="home.rs_count" vars={{ r: fRoles.length, s: skills.length }}>{"{r} role families · {s} skills"}</T></span>
          <div className="chips-wrap">{fRoles.map((r) => <Link key={r.id} href="/roles/" className={`chip${r.id === "ai-native-architect" ? " on" : ""}`}>{r.name}</Link>)}</div>
          <span className="kicker" style={{ display: "block", marginTop: 20 }}><T k="ui.skills">Skills</T></span>
          <div className="chips-wrap">{skills.map((k) => <span key={k.id} className="chip"><T k={`skill.${k.id}`}>{k.name}</T></span>)}</div>
        </div>
      </Band>

      <Band s={ar} alt>
        <RequestFlow />
      </Band>

      <Band s={tl}>
        <ul className="home-areas">
          {areas.map((a) => { const n = areaCount(a.id); return (
            <li key={a.id}><Link href={`/tools/?area=${a.id}`}><b><T k={`tarea.${a.id}`}>{a.name}</T></b><span className="home-rod" aria-hidden="true"><i style={{ width: `${Math.min(100, (n / Math.max(...areas.map((x) => areaCount(x.id)))) * 100)}%` }} /></span><span className="mono count">{n}</span></Link></li>
          ); })}
        </ul>
      </Band>

      <Band s={ce}>
        <div className="grid grid-2">
          {providers.map((e) => (
            <div key={e.kind} className="frame">
              <span className="kicker">{e.kind === "Frameworks" ? <T k="ce.frameworks">Frameworks</T> : e.kind}</span>
              <p className="muted" style={{ marginTop: 6, fontSize: ".92rem" }}><T k={`ce.${e.kind.toLowerCase().replace(/[^a-z]+/g, "-")}.0`}>{e.items[0]}</T></p>
            </div>
          ))}
        </div>
      </Band>

      <Band s={dc} alt>
        <div className="grid grid-2">
          {docs.map((d, i) => (
            <Link key={d.id} href={d.href ?? `/docs/#${d.id}`} className="frame" style={{ padding: 10 }}>
              <DocCover course={d} index={i} />
            </Link>
          ))}
        </div>
      </Band>

      <Band s={co}>
        <div className="frame show-co">
          <p className="lead" style={{ color: "var(--ink)" }}><T k="home.co_q">Found a mistake, a missing tool or a company worth tracking?</T></p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 18 }}>
            <a href={`mailto:${site.author.email}?subject=${encodeURIComponent("awesome-applied-ai: a correction")}`} className="btn"><T k="page.send-a-correction">Send a correction</T></a>
            <Link href="/contribute/" className="btn ghost"><T k="sec.contribute.label">Feedback</T></Link>
          </div>
        </div>
      </Band>

      <style>{`
        .band-grid { display: grid; grid-template-columns: minmax(0, 5fr) minmax(0, 7fr); gap: 48px; align-items: start; }
        @media (max-width: 960px) { .band-grid { grid-template-columns: minmax(0, 1fr); gap: 28px; } }
        .band-n { display: inline-grid; place-items: center; width: 44px; height: 44px; border-radius: 12px; background: var(--ink); color: #fff; font-family: var(--font-mono), monospace; font-size: .95rem; }
        .band-head h2 { margin-top: 16px; }
        .band-head .lead { margin-top: 12px; }
        .band-pages { list-style: none; margin: 22px 0 0; padding: 0; border-top: 1px solid var(--line); }
        .band-pages a { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; gap: 12px; align-items: baseline; padding: 12px 2px; border-bottom: 1px solid var(--line); text-decoration: none; color: var(--ink); transition: padding .3s var(--ease); }
        .band-pages a:hover { padding-left: 10px; } .band-pages a:hover b { color: var(--rust-deep); }
        .band-pages .muted { font-size: .88rem; min-width: 0; }
        @media (max-width: 480px) { .band-pages a { grid-template-columns: minmax(0, 1fr) auto; } .band-pages a .muted { grid-column: 1; grid-row: 2; } }
        .band-go { color: var(--rust); }
        .sm-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
        .sm-stats div { display: flex; flex-direction: column; } .sm-stats b { font-size: clamp(1.6rem, 3.4vw, 2.4rem); font-weight: 800; letter-spacing: -.04em; }
        .sm-stats .muted { font-size: .82rem; }
        .sm-bars { list-style: none; margin: 12px 0 0; padding: 0; display: grid; gap: 10px; }
        .sm-bars li { display: grid; grid-template-columns: 190px 1fr 44px; gap: 12px; align-items: center; font-size: .9rem; }
        .sm-bars i { height: 10px; border-radius: 6px; background: linear-gradient(90deg, #e0301e, #ff8f80); }
        @media (max-width: 560px) { .sm-bars li { grid-template-columns: 1fr 44px; } .sm-bars i { grid-column: 1 / -1; grid-row: 2; } }
        .chips-wrap { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; }
              .home-areas { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 6px 22px; }
        .home-areas a { display: grid; grid-template-columns: 110px minmax(0, 1fr) 34px; gap: 10px; align-items: center; padding: 8px 0; border-bottom: 1px solid var(--line); text-decoration: none; color: var(--ink); }
        .home-areas a:hover b { color: var(--rust-deep); }
        .home-rod { position: relative; height: 4px; border-radius: 4px; background: var(--line); } .home-rod i { position: absolute; left: 0; top: 0; bottom: 0; border-radius: 4px; background: linear-gradient(90deg, #e0301e, #ff9d8f); }
        @media (max-width: 560px) { .home-areas { grid-template-columns: 1fr; } }
`}</style>
    </>
  );
}
