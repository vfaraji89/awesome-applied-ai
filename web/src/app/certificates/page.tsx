import type { Metadata } from "next";
import { T } from "@/i18n/lang";
import { SectionIntro } from "@/components/section-intro";
import { CertBoard } from "@/components/cert-board";
import { education } from "@/data/framework";
import { CHECKED, courses, changes } from "@/data/certificates";
import { JsonLd } from "@/components/json-ld";
import { certificatesLd } from "@/lib/seo";

export const metadata: Metadata = { title: "Certificates", description: "The industry certificates for applied AI, by track and level, each linked to the provider's official page." };

const TIPS = [
  { k: "ce.tip0", h: "Follow the stack in the job ad", p: "A certificate proves one provider's stack. Pick the cloud or platform the roles you want already use." },
  { k: "ce.tip1", h: "Pair it with a project", p: "An exam shows you know the services. A public repo with evals shows you can ship with them." },
  { k: "ce.tip2", h: "Check the date", p: "AI exams change every few months. Book from the provider's page, not from an old study guide." },
];

export default function Certificates() {
  const degrees = education.find((e) => e.kind === "Degree");
  return (
    <>
      <JsonLd data={certificatesLd()} />
      <section className="section">
        <div className="wrap">
          <SectionIntro id="certificates" lead="The certificates applied AI hiring asks for, by track and level. Each one links to the provider's official page." />
          <div className="grid grid-3 ce-tips">
            {TIPS.map((t, i) => (
              <div key={t.k} className="ce-tip"><span className="ce-n mono">0{i + 1}</span><b><T k={`${t.k}.h`}>{t.h}</T></b><span className="muted"><T k={`${t.k}.p`}>{t.p}</T></span></div>
            ))}
          </div>
          <div style={{ marginTop: 40 }}><CertBoard /></div>
          <p className="count" style={{ marginTop: 22 }}>
            <T k="ce.checked" vars={{ d: CHECKED }}>{"Checked against each provider's page on {d}. Fees are in US dollars before tax and appear only where the provider states them. No provider pays to be listed."}</T>
          </p>
        </div>
      </section>

      <section className="section" style={{ background: "var(--paper)" }}>
        <div className="wrap">
          <span className="kicker"><T k="ce.courses_k">Courses</T></span>
          <h2 style={{ marginTop: 10 }}><T k="ce.courses_h">Courses that end in a certificate</T><span className="dot">.</span></h2>
          <p className="muted" style={{ marginTop: 10, maxWidth: 640 }}><T k="ce.courses_p">Proof that you studied, not a proctored exam. Good for learning the patterns before you pick a provider.</T></p>
          <div className="grid grid-2" style={{ marginTop: 24 }}>
            {courses.map((c) => (
              <a key={c.id} href={c.url} target="_blank" rel="noreferrer" className="frame ce-course">
                <span className="kicker">{c.provider} · <T k={`ce.cost.${c.cost === "Free" ? "free" : "pro"}`}>{c.cost}</T></span>
                <b>{c.name} <span aria-hidden="true">↗</span></b>
                <span className="muted"><T k={`ce.${c.id}.what`}>{c.what}</T></span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <span className="kicker"><T k="ce.changes_k">Recently changed</T></span>
          <h2 style={{ marginTop: 10 }}><T k="ce.changes_h">If your study guide names these, it is out of date</T><span className="dot">.</span></h2>
          <ul className="ce-changes">
            {changes.map((c) => (
              <li key={c.id}><s>{c.was}</s><span className="ce-arrow" aria-hidden="true">→</span><b><T k={`ce.chnow.${c.id}`}>{c.now}</T></b><span className="mono muted"><T k={`ce.ch.${c.id}`}>{c.when}</T></span></li>
            ))}
          </ul>
        </div>
      </section>

      {degrees && (
        <section className="section" style={{ background: "var(--paper)" }}>
          <div className="wrap">
            <span className="kicker"><T k="ce.before">Before certificates</T></span>
            <h2 style={{ marginTop: 10 }}><T k="ce.degrees">The degrees that show up</T><span className="dot">.</span></h2>
            <ul className="ce" style={{ marginTop: 18 }}>{degrees.items.map((x, j) => <li key={x}><span className="bead white" /><T k={`ce.degree.${j}`}>{x}</T></li>)}</ul>
          </div>
        </section>
      )}
      <style>{`
        .ce { list-style: none; margin: 12px 0 0; padding: 0; display: grid; gap: 10px; } .ce li { display: flex; gap: 10px; align-items: baseline; } .ce .bead { width: 10px; height: 10px; flex: none; }
        .ce-tips { margin-top: 32px; }
        .ce-tip { display: grid; gap: 6px; padding-top: 14px; border-top: 2px solid var(--ink); font-size: .92rem; }
        .ce-tip b { font-size: 1rem; }
        .ce-n { color: var(--rust); font-size: .78rem; }
        .ce-course { display: grid; gap: 8px; }
        .ce-course b { font-size: 1.08rem; }
        .ce-course .muted { font-size: .92rem; }
        .ce-changes { list-style: none; margin: 22px 0 0; padding: 0; display: grid; }
        .ce-changes li { display: grid; grid-template-columns: minmax(0, 1fr) auto minmax(0, 1.2fr) auto; gap: 14px; align-items: baseline; padding: 14px 0; border-bottom: 1px solid var(--line); font-size: .95rem; }
        .ce-changes s { color: var(--muted); }
        .ce-arrow { color: var(--rust); }
        .ce-changes .mono { font-size: .76rem; white-space: nowrap; }
        @media (max-width: 720px) { .ce-changes li { grid-template-columns: 1fr; gap: 4px; } .ce-arrow { display: none; } }
      `}</style>
    </>
  );
}
