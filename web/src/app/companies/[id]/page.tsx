import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Crumb } from "@/components/section-intro";
import { T } from "@/i18n/lang";
import { share } from "@/lib/share";
import { Badge } from "@/components/companies";
import { Monogram } from "@/components/people";
import { skills, fRoles } from "@/data/framework";
import data from "@/data/companies.json";
import ppl from "@/data/people.json";

type C = { id: string; name: string; lab: boolean; initials: string; hiring: { open: number; boards: { url: string; platform: string; open: number }[]; roles: { id: string; share: number }[]; skills: { id: string; share: number }[] } | null; products: { id: string; name: string; area: string }[]; stage: { speakers: number; talks: number; source: string } | null; people: string[] };
const companies = data.companies as unknown as C[];
const people = ppl.people as unknown as { id: string; name: string; role: string | null; org: string | null; initials: string; talkCount: number }[];
const skillName = (id: string) => skills.find((s) => s.id === id)?.name ?? id;
const roleName = (id: string) => fRoles.find((r) => r.id === id)?.name ?? "Other AI roles";

export function generateStaticParams() { return companies.map((c) => ({ id: c.id })); }
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const id = (await params).id;
  const c = companies.find((x) => x.id === id);
  if (!c) return {};
  return { ...share("companies"), title: c.name, description: `${c.name}${c.lab ? ", an AI lab" : ""}: ${c.hiring ? `${c.hiring.open} AI roles open on its career page, ` : ""}${c.products.length ? `${c.products.length} products on the tool map, ` : ""}${c.stage ? `${c.stage.talks} talks at AI Engineer` : ""}.` };
}

export default async function CompanyPage({ params }: { params: Promise<{ id: string }> }) {
  const id = (await params).id;
  const c = companies.find((x) => x.id === id);
  if (!c) notFound();
  const team = people.filter((p) => c.people.includes(p.id));
  return (
    <>
      <section className="section">
        <div className="wrap">
          <Crumb id="roles" page="Companies" />
          <div className="cs-hero">
            <Badge c={c} size={104} />
            <div>
              <h1>{c.name}<span className="dot">.</span></h1>
              {c.lab && <span className="cs-tag"><T k="cp.lab">AI lab</T></span>}
            </div>
          </div>
          <div className="cs-stats">
            <div className="frame"><b>{c.hiring?.open ?? "–"}</b><span className="count"><T k="cp.s_open">open AI roles</T></span></div>
            <div className="frame"><b>{c.products.length || "–"}</b><span className="count"><T k="cs.products">products on the map</T></span></div>
            <div className="frame"><b>{c.stage?.talks ?? "–"}</b><span className="count"><T k="cs.talks" vars={{ n: c.stage?.speakers ?? 0 }}>{"talks at AI Engineer, by {n} speakers"}</T></span></div>
          </div>
        </div>
      </section>

      <section className="section" style={{ background: "var(--paper)", paddingTop: 40 }}>
        <div className="wrap cs-grid">
          {c.hiring && (
            <div className="frame">
              <span className="kicker"><T k="cs.k_hiring">Hiring now</T></span>
              {c.hiring.roles.length > 0 && (<>
                <p className="cs-sub"><T k="cs.roles">The roles</T></p>
                <ul className="cs-rods">{c.hiring.roles.map((r) => <li key={r.id}><span>{roleName(r.id)}</span><span className="rodbar ink"><i style={{ width: `${r.share}%` }} /></span><span className="count">{r.share}%</span></li>)}</ul>
              </>)}
              {c.hiring.skills.length > 0 && (<>
                <p className="cs-sub"><T k="cs.skills">What the ads ask for</T></p>
                <ul className="cs-rods">{c.hiring.skills.map((s) => <li key={s.id}><Link href={`/skills/${s.id}/`}><T k={`skill.${s.id}`}>{skillName(s.id)}</T></Link><span className="rodbar"><i style={{ width: `${s.share}%` }} /></span><span className="count">{s.share}%</span></li>)}</ul>
              </>)}
              <div className="cs-chips">{c.hiring.boards.map((b) => <a key={b.url} href={b.url} target="_blank" rel="noreferrer" className="chip"><T k="cs.board" vars={{ p: b.platform }}>{"Career page ({p})"}</T> ↗</a>)}</div>
            </div>
          )}
          <div className="cs-side">
            {c.products.length > 0 && (
              <div className="frame">
                <span className="kicker"><T k="ps.k_builds">Builds</T></span>
                <div className="cs-chips">{c.products.map((t) => <Link key={t.id} href={`/tools/?q=${encodeURIComponent(t.name)}`} className="chip">{t.name}</Link>)}</div>
              </div>
            )}
            {c.stage && (
              <div className="frame">
                <span className="kicker"><T k="cs.k_stage">On stage</T></span>
                <p className="muted" style={{ marginTop: 6 }}><T k="cs.stage_p" vars={{ t: c.stage.talks, s: c.stage.speakers }}>{"{t} talks by {s} speakers at AI Engineer."}</T> <a href={c.stage.source} target="_blank" rel="noreferrer"><T k="cs.see_talks">See them</T> ↗</a></p>
              </div>
            )}
            {team.length > 0 && (
              <div className="frame">
                <span className="kicker"><T k="cs.k_people">People here</T></span>
                <div className="cs-team">{team.map((p) => <Link key={p.id} href={`/people/${p.id}/`} className="cs-person"><Monogram p={p} size={36} /><span><b>{p.name}</b><span className="muted">{p.role}</span></span></Link>)}</div>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <p className="muted" style={{ maxWidth: "78ch", fontSize: ".9rem" }}><T k="cs.src" vars={{ d: data.updated ?? "" }}>{"Open roles and what they ask for: the AI job ads on the career page above, at the tracker's last read ({d}), counted, never stored with the company. Products: the tool map. Stage: AI Engineer's public data."}</T> <Link href="/contribute/"><T k="cs.fix">Something wrong?</T></Link></p>
          <p style={{ marginTop: 14 }}><Link href="/companies/" className="btn"><T k="cs.all">All companies</T> →</Link></p>
        </div>
      </section>
      <style>{`
        .cs-hero { display: flex; gap: 26px; align-items: center; margin-top: 22px; flex-wrap: wrap; }
        .cs-tag { display: inline-block; margin-top: 8px; font: .72rem var(--font-mono), monospace; text-transform: uppercase; letter-spacing: .1em; color: var(--rust-deep); border: 1px dashed var(--rust); border-radius: 999px; padding: 3px 10px; }
        .cs-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 200px), 1fr)); gap: 14px; margin-top: 30px; max-width: 820px; }
        .cs-stats .frame { display: grid; gap: 6px; } .cs-stats b { font-size: 2rem; font-weight: 800; color: var(--rust); line-height: 1; }
        .cs-grid { display: grid; grid-template-columns: minmax(0, 1.3fr) minmax(0, 1fr); gap: 24px; align-items: start; }
        @media (max-width: 860px) { .cs-grid { grid-template-columns: 1fr; } }
        .cs-sub { margin: 16px 0 8px; font-weight: 700; }
        .cs-rods { list-style: none; margin: 0; padding: 0; display: grid; gap: 9px; }
        .cs-rods li { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) 44px; gap: 12px; align-items: center; font-size: .9rem; } .cs-rods a { text-decoration: none; } .cs-rods .count { text-align: right; }
        .cs-side { display: grid; gap: 14px; }
        .cs-chips { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 14px; } .cs-chips .chip { font-size: .78rem; }
        .cs-team { display: grid; gap: 10px; margin-top: 12px; } .cs-person { display: flex; gap: 10px; align-items: center; text-decoration: none; color: inherit; } .cs-person span { display: grid; } .cs-person .muted { font-size: .8rem; } .cs-person:hover b { color: var(--rust-deep); }
      `}</style>
    </>
  );
}
