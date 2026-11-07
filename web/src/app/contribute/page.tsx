import type { Metadata } from "next";
import { SectionIntro } from "@/components/section-intro";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "Contribute", description: "How to contribute to awesome-applied-ai: issues, pull requests and where each part of the site lives." };

/* Where each part of the site lives in the repository, so a contribution lands in the right file. */
const WHERE = [
  { what: "A company board for the market tracker", file: "pipeline/companies.json", how: "Add a public Greenhouse, Lever or Ashby board." },
  { what: "A role, a task or a skill level", file: "web/src/data/framework.ts", how: "Roles, tasks, skills and the levels each role needs." },
  { what: "A term for the jargon", file: "web/src/data/dictionary.ts", how: "One plain line, then the deeper answer." },
  { what: "A common problem and its fix", file: "web/src/data/problems.ts", how: "The symptom, the cause and the fix." },
  { what: "A tool for the map", file: "web/src/data/tools.ts", how: "What it is and which layer it sits in." },
  { what: "A certificate", file: "web/src/data/framework.ts", how: "Under education, grouped by provider." },
];

export default function Contribute() {
  return (
    <section className="section">
      <div className="wrap">
        <SectionIntro id="contribute" lead="This site is open source. Spot something wrong, missing or out of date? Open an issue, or send a pull request with the fix." />
        <div className="grid grid-2" style={{ marginTop: 34 }}>
          <a href={`${site.repo}/issues/new`} target="_blank" rel="noopener" className="frame" style={{ paddingBottom: 38 }}>
            <span className="count">Quick</span>
            <h3 style={{ fontSize: "1.5rem", fontWeight: 800, marginTop: 8 }}>Open an issue<span className="dot">.</span></h3>
            <p className="muted" style={{ marginTop: 8 }}>Tell us what is wrong or missing, with a link to a source.</p>
            <span className="rod" />
          </a>
          <a href={site.repo} target="_blank" rel="noopener" className="frame" style={{ paddingBottom: 38 }}>
            <span className="count">Hands-on</span>
            <h3 style={{ fontSize: "1.5rem", fontWeight: 800, marginTop: 8 }}>Send a pull request<span className="dot">.</span></h3>
            <p className="muted" style={{ marginTop: 8 }}>Fork the repository, edit the data file, and open a pull request.</p>
            <span className="rod" />
          </a>
        </div>
        <h2 style={{ marginTop: 56 }}>Where things live<span className="dot">.</span></h2>
        <div className="cw">
          {WHERE.map((w) => (
            <div key={w.what} className="cw-row">
              <b>{w.what}</b>
              <code className="mono">{w.file}</code>
              <span className="muted">{w.how}</span>
            </div>
          ))}
        </div>
      </div>
      <style>{`
        .cw { margin-top: 18px; border: 1px solid var(--line); border-radius: 14px; overflow: hidden; }
        .cw-row { display: grid; grid-template-columns: 1.1fr 1fr 1.3fr; gap: 16px; padding: 14px 18px; border-bottom: 1px solid var(--line); align-items: baseline; }
        .cw-row:last-child { border-bottom: none; }
        .cw-row code { font-size: .8rem; color: var(--rust-deep); }
        @media (max-width: 760px) { .cw-row { grid-template-columns: 1fr; gap: 4px; } }
      `}</style>
    </section>
  );
}
