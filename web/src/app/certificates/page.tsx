import type { Metadata } from "next";
import { T } from "@/i18n/lang";
import { SectionIntro } from "@/components/section-intro";
import { education } from "@/data/framework";

export const metadata: Metadata = { title: "Certificates", description: "The industry certificates that show up most in applied AI hiring, by provider." };

export default function Certificates() {
  const certs = education.filter((e) => e.kind !== "Degree");
  const degrees = education.find((e) => e.kind === "Degree");
  return (
    <>
      <section className="section">
        <div className="wrap">
          <SectionIntro id="certificates" lead="The certificates that show up most in applied AI hiring, by provider. Degrees open the door; a certificate shows you have used a specific stack." />
          <div className="grid grid-3" style={{ marginTop: 36 }}>
            {certs.map((e, i) => (
              <div key={e.kind} className="frame rise" style={{ ["--i" as string]: i }}>
                <span className="kicker">{e.kind === "Frameworks" ? <T k="ce.frameworks">Frameworks</T> : e.kind}</span>
                <ul className="ce">{e.items.map((x, j) => <li key={x}><span className="bead" /><T k={`ce.${e.kind.toLowerCase().replace(/[^a-z]+/g, "-")}.${j}`}>{x}</T></li>)}</ul>
              </div>
            ))}
          </div>
          <p className="count" style={{ marginTop: 22 }}><T k="ce.note">Exam names and tiers change often. Check each provider before you book. More detail on each certificate is coming.</T></p>
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
      <style>{`.ce { list-style: none; margin: 12px 0 0; padding: 0; display: grid; gap: 10px; } .ce li { display: flex; gap: 10px; align-items: baseline; } .ce .bead { width: 10px; height: 10px; flex: none; }`}</style>
    </>
  );
}
