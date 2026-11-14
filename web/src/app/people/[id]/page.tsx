import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Crumb } from "@/components/section-intro";
import { T } from "@/i18n/lang";
import { share } from "@/lib/share";
import { Monogram, YearRod } from "@/components/people";
import { skills } from "@/data/framework";
import data from "@/data/people.json";

type P = { id: string; name: string; role: string | null; org: string | null; source: string; links: Record<string, string>; talks: { title: string; url: string; event: string | null; year: string | null }[]; talkCount: number; editions: string[]; years: string[]; topics: string[]; skills: string[]; products: { id: string; name: string; area: string }[]; initials: string };
const people = data.people as unknown as P[];
const skillName = (id: string) => skills.find((s) => s.id === id)?.name ?? id;
const LINKS: [string, string][] = [["website", "Website"], ["github", "GitHub"], ["linkedin", "LinkedIn"], ["x", "X"]];

export function generateStaticParams() { return people.map((p) => ({ id: p.id })); }
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const id = (await params).id;
  const p = people.find((x) => x.id === id);
  if (!p) return {};
  return { ...share("people"), title: p.name, description: `${p.name}${p.role ? `, ${p.role}` : ""}${p.org ? ` at ${p.org}` : ""}: ${p.talkCount} talks at AI Engineer, the topics, the skills and what they build.` };
}

export default async function PersonPage({ params }: { params: Promise<{ id: string }> }) {
  const id = (await params).id;
  const p = people.find((x) => x.id === id);
  if (!p) notFound();
  const span = [...new Set(people.flatMap((x) => x.years))].sort();
  const related = people.filter((x) => x.id !== p.id).map((x) => ({ x, s: (x.org && x.org === p.org ? 3 : 0) + x.skills.filter((s) => p.skills.includes(s)).length + x.topics.filter((t) => p.topics.includes(t)).length * 0.5 }))
    .sort((a, b) => b.s - a.s).slice(0, 3).map((r) => r.x);
  return (
    <>
      <section className="section">
        <div className="wrap">
          <Crumb id="roles" page="People" />
          <div className="ps-hero">
            <Monogram p={p} size={112} />
            <div>
              <h1>{p.name}<span className="dot">.</span></h1>
              <p className="lead" style={{ marginTop: 8 }}>{[p.role, p.org].filter(Boolean).join(" · ")}</p>
              <div className="ps-links">{LINKS.filter(([k]) => p.links[k]).map(([k, label]) => <a key={k} className="chip" href={p.links[k]} target="_blank" rel="noreferrer me">{label} ↗</a>)}</div>
            </div>
          </div>
          <div className="ps-stats">
            <div className="frame"><b>{p.talkCount}</b><span className="count"><T k="ps.talks">talks at AI Engineer</T></span></div>
            <div className="frame"><b>{p.editions.length}</b><span className="count"><T k="ps.eds">editions</T></span></div>
            <div className="frame"><YearRod years={p.years} span={span} /><span className="count">{p.years[0]}{p.years.length > 1 ? `–${p.years.at(-1)}` : ""}</span></div>
          </div>
        </div>
      </section>

      <section className="section" style={{ background: "var(--paper)", paddingTop: 40 }}>
        <div className="wrap ps-grid">
          <div>
            <span className="kicker"><T k="ps.k_talks">Talks</T></span>
            <ol className="ps-talks">
              {p.talks.map((t) => <li key={t.url}><a href={t.url} target="_blank" rel="noreferrer"><b>{t.title}</b> ↗</a><span className="count">{t.event ?? ""}{t.year && !t.event?.includes(t.year) ? ` · ${t.year}` : ""}</span></li>)}
            </ol>
          </div>
          <div className="ps-side">
            {p.products.length > 0 && (
              <div className="frame">
                <span className="kicker"><T k="ps.k_builds">Builds</T></span>
                <p className="muted" style={{ fontSize: ".86rem", marginTop: 6 }}><T k="ps.builds_p" vars={{ o: p.org ?? "" }}>{"What {o} makes, on the tool map."}</T></p>
                <div className="ps-chips">{p.products.map((t) => <Link key={t.id} href={`/tools/?q=${encodeURIComponent(t.name)}`} className="chip">{t.name}</Link>)}</div>
              </div>
            )}
            {p.skills.length > 0 && (
              <div className="frame">
                <span className="kicker"><T k="ps.k_skills">Skills their talks name</T></span>
                <div className="ps-chips">{p.skills.map((s) => <Link key={s} href={`/skills/${s}/`} className="chip"><T k={`skill.${s}`}>{skillName(s)}</T></Link>)}</div>
              </div>
            )}
            {p.topics.length > 0 && (
              <div className="frame">
                <span className="kicker"><T k="ps.k_topics">Topics, as AI Engineer tags them</T></span>
                <div className="ps-chips">{p.topics.map((t) => <span key={t} className="chip">{t}</span>)}</div>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <span className="kicker"><T k="ps.k_rel">Close to their work</T></span>
          <div className="ps-rel">
            {related.map((r) => (
              <Link key={r.id} href={`/people/${r.id}/`} className="frame ps-rcard"><Monogram p={r} size={44} /><span><b>{r.name}</b><span className="muted">{[r.role, r.org].filter(Boolean).join(" · ")}</span></span></Link>
            ))}
          </div>
          <p className="muted" style={{ marginTop: 26, fontSize: ".88rem", maxWidth: "75ch" }}>
            <T k="ps.src">Role, company, links, talks and topics from their AI Engineer speaker page:</T> <a href={p.source} target="_blank" rel="noreferrer">{p.source.replace("https://", "")}</a>. <T k="ps.src2" vars={{ d: data.updated }}>{"Read on {d}."}</T>{" "}
            <Link href="/contribute/"><T k="pp.fix">Something wrong, or want a profile removed?</T></Link>
          </p>
          <p style={{ marginTop: 14 }}><Link href="/people/" className="btn"><T k="ps.all">All people</T> →</Link></p>
        </div>
      </section>
      <style>{`
        .ps-hero { display: flex; gap: 28px; align-items: center; margin-top: 22px; flex-wrap: wrap; }
        .ps-links { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 14px; } .ps-links .chip { font-size: .8rem; }
        .ps-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 200px), 1fr)); gap: 14px; margin-top: 30px; max-width: 780px; }
        .ps-stats .frame { display: grid; gap: 6px; align-content: center; } .ps-stats b { font-size: 2rem; font-weight: 800; color: var(--rust); line-height: 1; }
        .ps-grid { display: grid; grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr); gap: 30px; }
        @media (max-width: 860px) { .ps-grid { grid-template-columns: 1fr; } }
        .ps-talks { list-style: none; margin: 14px 0 0; padding: 0; display: grid; gap: 12px; counter-reset: t; }
        .ps-talks li { display: grid; gap: 3px; padding-left: 34px; position: relative; counter-increment: t; border-bottom: 1px solid var(--line); padding-bottom: 12px; }
        .ps-talks li::before { content: counter(t, decimal-leading-zero); position: absolute; left: 0; top: 2px; font: 700 .72rem var(--font-mono), monospace; color: var(--rust); }
        .ps-talks a { text-decoration: none; color: var(--ink); } .ps-talks a:hover b { color: var(--rust-deep); }
        .ps-side { display: grid; gap: 14px; align-content: start; }
        .ps-chips { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px; } .ps-chips .chip { font-size: .76rem; }
        .ps-rel { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 280px), 1fr)); gap: 12px; margin-top: 14px; }
        .ps-rcard { display: flex; gap: 12px; align-items: center; } .ps-rcard span { display: grid; } .ps-rcard .muted { font-size: .82rem; } .ps-rcard:hover b { color: var(--rust-deep); }
      `}</style>
    </>
  );
}
