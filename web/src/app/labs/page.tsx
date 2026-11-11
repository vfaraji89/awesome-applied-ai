import type { Metadata } from "next";
import Link from "next/link";
import { Crumb } from "@/components/section-intro";
import { labs, shared, checked } from "@/data/labs";
import { skills } from "@/data/framework";
import fit from "@/data/role-fit.json";

export const metadata: Metadata = { title: "What the labs ask for", description: "What Anthropic, OpenAI and Google Cloud ask for in their own applied AI and forward deployed engineering roles, from their public postings." };

const skillName = (id: string) => skills.find((s) => s.id === id)?.name ?? id;

export default function Labs() {
  const ap = (fit as unknown as { roles: { id: string; skills: Record<string, number> }[] }).roles;
  const market = (id: string) => {
    const rows = ap.filter((r) => r.id === "applied-ai-engineer" || r.id === "forward-deployed-engineer");
    return Math.round(rows.reduce((a, r) => a + (r.skills[id] ?? 0), 0) / (rows.length || 1));
  };
  return (
    <>
      <section className="section">
        <div className="wrap">
          <Crumb id="market" page="What the labs ask for" />
          <h1 style={{ marginTop: 12 }}>What the model labs <mark>ask for</mark><span className="dot">.</span></h1>
          <p className="lead" style={{ marginTop: 16 }}>Anthropic, OpenAI and Google hire applied AI and forward deployed engineers to put their models into production with customers. This is what their own postings ask for, side by side, next to what the wider market asks for the same roles.</p>
          <p className="count" style={{ marginTop: 14 }}>Read from public postings on {checked}. Postings change; each card links to the provider&apos;s careers page and to the postings used.</p>

          <span className="kicker" style={{ display: "block", marginTop: 34 }}>What all three ask for</span>
          <ul className="lb-shared">
            {shared.map((s) => (
              <li key={s.id} className="frame">
                <b>{skillName(s.id)}</b>
                <span className="muted">{s.why}</span>
                <span className="lb-mk"><span className="mono">{market(s.id)}%</span> of applied AI and FDE postings across the market ask for it</span>
                <span className="rod" />
              </li>
            ))}
          </ul>
          <p style={{ marginTop: 16 }}><Link href="/fit/" className="btn">Check your fit against the market →</Link></p>
        </div>
      </section>

      <section className="section" style={{ background: "var(--paper)" }}>
        <div className="wrap">
          <div className="grid grid-3">
            {labs.map((l) => (
              <article key={l.id} className="frame lb-card">
                <span className="kicker">{l.name}</span>
                <h2 style={{ fontSize: "1.35rem", marginTop: 8 }}>{l.headline}<span className="dot">.</span></h2>
                <ul className="lb-titles">{l.titles.map((t) => <li key={t}>{t}</li>)}</ul>
                <p className="lb-exp"><b>Experience</b> {l.experience}</p>
                <dl className="lb-asks">
                  {l.asks.map((a) => <div key={a.skill}><dt>{a.skill}</dt><dd>{a.detail}</dd></div>)}
                </dl>
                <div className="lb-stack">{l.stack.map((s) => <span key={s} className="chip">{s}</span>)}</div>
                <ul className="lb-notes">{l.notes.map((n) => <li key={n}>{n}</li>)}</ul>
                <details className="lb-src">
                  <summary>Sources ({l.sources.length})</summary>
                  <ul>{l.sources.map((s) => <li key={s.url}><a href={s.url} target="_blank" rel="noopener noreferrer">{s.label}</a></li>)}</ul>
                </details>
                <a className="chip" href={l.careers} target="_blank" rel="noopener noreferrer" style={{ marginTop: 14 }}>{l.name} careers ↗</a>
                <span className="rod" />
              </article>
            ))}
          </div>
          <p className="count" style={{ marginTop: 22 }}>Pay is left out on purpose: the figures in mirrored postings did not agree. Spot an outdated line? <Link href="/contribute/">Send a fix</Link>.</p>
        </div>
      </section>
      <style>{`
        .lb-shared { list-style: none; padding: 0; margin: 14px 0 0; display: grid; gap: 12px; grid-template-columns: repeat(auto-fill, minmax(min(100%, 210px), 1fr)); }
        .lb-shared li { padding: 16px 20px 30px; display: flex; flex-direction: column; gap: 6px; }
        .lb-shared b { font-size: 1rem; }
        .lb-shared .muted { font-size: 0.85rem; }
        .lb-mk { margin-top: auto; padding-top: 8px; font-size: 0.78rem; color: var(--sec); }
        .lb-mk .mono { color: var(--rust-deep); font-weight: 600; }
        .lb-card { padding: 22px 24px 36px; display: flex; flex-direction: column; }
        .lb-titles { margin: 10px 0 0; padding-left: 18px; font-size: 0.85rem; color: var(--sec); }
        .lb-exp { margin-top: 12px; font-size: 0.88rem; }
        .lb-exp b { display: block; font-family: var(--font-mono), monospace; font-size: 0.68rem; letter-spacing: 0.1em; text-transform: uppercase; color: var(--rust-deep); font-weight: 500; margin-bottom: 2px; }
        .lb-asks { margin: 14px 0 0; display: flex; flex-direction: column; gap: 10px; }
        .lb-asks dt { font-weight: 700; font-size: 0.9rem; }
        .lb-asks dd { margin: 2px 0 0; font-size: 0.86rem; color: var(--sec); line-height: 1.5; }
        .lb-stack { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 14px; }
        .lb-notes { margin: 12px 0 0; padding-left: 18px; font-size: 0.82rem; color: var(--muted); }
        .lb-src { margin-top: 12px; font-size: 0.82rem; }
        .lb-src summary { cursor: pointer; color: var(--sec); }
        .lb-src ul { margin: 8px 0 0; padding-left: 18px; }
      `}</style>
    </>
  );
}
