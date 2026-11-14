import { SectionIntro } from "@/components/section-intro";
import Link from "next/link";
import type { Metadata } from "next";
import { fRoles, skills, SOURCES } from "@/data/framework";
import { T } from "@/i18n/lang";
import { slug } from "@/i18n/slug";
import { JsonLd } from "@/components/json-ld";
import { rolesLd } from "@/lib/seo";
import { share } from "@/lib/share";
import { M } from "@/lib/market-data";
import { RoleBanner } from "@/components/role-banners";
import { ROLE_PAGES } from "@/data/roles-pages";

export const metadata: Metadata = { ...share("roles"), title: "Roles and skills", description: "A framework for AI-native developers, forward deployed engineers, applied AI and product engineering roles: role families, a skills matrix, a skill map and the tasks each role does." };

export default function Roles() {
  const fams = new Set(fRoles.map((r) => r.family)).size;
  const stat: Record<string, { n: string; l: React.ReactNode }> = {
    families: { n: String(fRoles.length), l: <T k="rh.s_fam" vars={{ f: fams }}>{"roles in {f} families"}</T> },
    matrix: { n: String(skills.length), l: <T k="rh.s_mx">skills scored for every role, aware to expert</T> },
    skills: { n: `${M.skills[0]?.share ?? 0}%`, l: <T k="rh.s_sk">of AI job ads ask for the top skill</T> },
    tasks: { n: String(M.tasks.length), l: <T k="rh.s_tk" vars={{ n: M.totals.processed.toLocaleString("en-US") }}>{"tasks read from {n} AI job ads"}</T> },
  };
  return (
    <>
      <JsonLd data={rolesLd()} />
      <section className="section">
        <div className="wrap">
          <SectionIntro id="roles" h1="Who builds it, and what they need" lead={"Eight role families across AI-native development, forward deployment, applied AI and product engineering. Four ways in: the roles, the matrix of skills, the map of what the ads ask for together, and the work itself."} />
          <div className="rh-grid">
            {ROLE_PAGES.map((p, i) => (
              <article key={p.kind} className="frame rh-card">
                <header className="rh-head">
                  <span className="rh-n">{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <h2><Link href={p.href}><T k={`page.${slug(p.label)}`}>{p.label}</T></Link><span className="dot">.</span></h2>
                    <p className="muted"><T k={`note.${slug(p.label)}`}>{p.note}</T></p>
                  </div>
                  <div className="rh-stat"><b>{stat[p.kind].n}</b><span className="count">{stat[p.kind].l}</span></div>
                </header>
                <RoleBanner kind={p.kind} />
                <Link href={p.href} className="btn rh-btn"><T k="rh.open" vars={{ p: p.label }}>{"Open {p}"}</T> →</Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <span className="kicker"><T k="rl.sources">Sources</T></span>
          <p className="muted" style={{ marginTop: 10, maxWidth: "70ch" }}><T k="rl.sources_p">Built from 2026 job postings and role guides. The skill levels are an editorial synthesis of them, not an industry standard.</T></p>
          <ul className="src">{SOURCES.map((s) => <li key={s.url}><a href={s.url} target="_blank" rel="noreferrer">{s.label} ↗</a></li>)}</ul>
        </div>
      </section>
      <style>{`
        .rh-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 520px), 1fr)); gap: 22px; margin-top: 34px; }
        .rh-card { display: flex; flex-direction: column; gap: 20px; padding: 24px 28px 26px; }
        .rh-head { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; gap: 14px; align-items: start; }
        .rh-n { display: inline-grid; place-items: center; min-width: 30px; height: 24px; padding: 0 6px; border-radius: 6px; background: var(--rust); color: #fff; font-family: var(--font-mono), monospace; font-size: .78rem; margin-top: 4px; }
        .rh-head h2 { font-size: 1.6rem; } .rh-head h2 a { color: inherit; text-decoration: none; } .rh-head h2 a:hover { color: var(--rust-deep); }
        .rh-head .muted { margin-top: 4px; font-size: .9rem; }
        .rh-stat { text-align: right; display: grid; max-width: 150px; } .rh-stat b { font-size: 1.8rem; font-weight: 800; color: var(--rust); line-height: 1; } .rh-stat .count { font-size: .7rem; margin-top: 4px; }
        .rh-btn { align-self: flex-start; margin-top: auto; }
        @media (max-width: 520px) { .rh-head { grid-template-columns: auto minmax(0, 1fr); } .rh-stat { grid-column: 1 / -1; text-align: left; } }
        .src { margin: 14px 0 0; padding-left: 18px; display: grid; gap: 6px; color: var(--sec); } .src a { text-decoration: none; } .src a:hover { color: var(--rust-deep); }
      `}</style>
    </>
  );
}
