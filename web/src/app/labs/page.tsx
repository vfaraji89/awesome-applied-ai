import type { Metadata } from "next";
import Link from "next/link";
import { Crumb } from "@/components/section-intro";
import { labs, shared, checked } from "@/data/labs";
import { skills } from "@/data/framework";
import fit from "@/data/role-fit.json";
import { More } from "@/components/more";
import { T, TH } from "@/i18n/lang";
import { share } from "@/lib/share";

export const metadata: Metadata = { ...share("labs"), title: "What the labs ask for", description: "What Anthropic, OpenAI and Google Cloud ask for in their own applied AI and forward deployed engineering roles, from their public postings." };

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
          <h1 style={{ marginTop: 12 }}><TH k="labs.h1">What the model labs <mark>ask for</mark></TH><span className="dot">.</span></h1>
          <p className="lead" style={{ marginTop: 16 }}><TH k="labs.p1"><b>Anthropic, OpenAI and Google</b>, side by side: what their applied AI roles ask for.</TH></p>
          <More>
            <p className="lead" style={{ marginTop: 12 }}><TH k="labs.p2">All three hire <b>applied AI and forward deployed engineers</b> to put their models into production with customers. Each card sets their own postings next to <b>what the wider market asks</b> for the same roles.</TH></p>
            <p className="count" style={{ marginTop: 14 }}><T k="lb.read" vars={{ d: checked }}>{"Read from public postings on {d}. Postings change; each card links to the provider’s careers page and to the postings used."}</T></p>
          </More>

          <span className="kicker" style={{ display: "block", marginTop: 34 }}><T k="lb.shared">What all three ask for</T></span>
          <ul className="lb-shared">
            {shared.map((s) => (
              <li key={s.id} className="frame">
                <b><T k={`skill.${s.id}`}>{skillName(s.id)}</T></b>
                <span className="muted"><T k={`lb.why.${s.id}`}>{s.why}</T></span>
                <span className="lb-mk"><span className="mono">{market(s.id)}%</span> <T k="lb.mk">of applied AI and FDE postings across the market ask for it</T></span>
                <span className="rod" />
              </li>
            ))}
          </ul>
          <p style={{ marginTop: 16 }}><Link href="/fit/" className="btn"><T k="lb.fit">Check your fit against the market</T> →</Link></p>
        </div>
      </section>

      <section className="section" style={{ background: "var(--paper)" }}>
        <div className="wrap">
          <div className="grid grid-3">
            {labs.map((l) => (
              <article key={l.id} className="frame lb-card">
                <span className="kicker">{l.name}</span>
                <h2 style={{ fontSize: "1.35rem", marginTop: 8 }}><T k={`lb.${l.id}.head`}>{l.headline}</T><span className="dot">.</span></h2>
                <ul className="lb-titles">{l.titles.map((t) => <li key={t}>{t}</li>)}</ul>
                <p className="lb-exp"><b><T k="lb.exp">Experience</T></b> <T k={`lb.${l.id}.exp`}>{l.experience}</T></p>
                <dl className="lb-asks">
                  {l.asks.map((a, i) => <div key={a.skill}><dt><T k={`lb.${l.id}.ask.${i}`}>{a.skill}</T></dt><dd><T k={`lb.${l.id}.ask.${i}.d`}>{a.detail}</T></dd></div>)}
                </dl>
                <div className="lb-stack">{l.stack.map((s) => <span key={s} className="chip">{s}</span>)}</div>
                <ul className="lb-notes">{l.notes.map((n, i) => <li key={n}><T k={`lb.${l.id}.note.${i}`}>{n}</T></li>)}</ul>
                <details className="lb-src">
                  <summary><T k="lb.sources" vars={{ n: l.sources.length }}>{"Sources ({n})"}</T></summary>
                  <ul>{l.sources.map((s) => <li key={s.url}><a href={s.url} target="_blank" rel="noopener noreferrer">{s.label}</a></li>)}</ul>
                </details>
                <a className="chip" href={l.careers} target="_blank" rel="noopener noreferrer" style={{ marginTop: 14 }}><T k="lb.careers" vars={{ n: l.name }}>{"{n} careers"}</T> ↗</a>
                <span className="rod" />
              </article>
            ))}
          </div>
          <p className="count" style={{ marginTop: 22 }}><T k="lb.pay">Pay is left out on purpose: the figures in mirrored postings did not agree. Spot an outdated line?</T> <Link href="/contribute/"><T k="ui.fix">Send a fix</T></Link>.</p>
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
