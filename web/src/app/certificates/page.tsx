import type { Metadata } from "next";
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
                <span className="kicker">{e.kind}</span>
                <ul className="ce">{e.items.map((x) => <li key={x}><span className="bead" />{x}</li>)}</ul>
              </div>
            ))}
          </div>
          <p className="count" style={{ marginTop: 22 }}>Exam names and tiers change often. Check each provider before you book. More detail on each certificate is coming.</p>
        </div>
      </section>
      {degrees && (
        <section className="section" style={{ background: "var(--paper)" }}>
          <div className="wrap">
            <span className="kicker">Before certificates</span>
            <h2 style={{ marginTop: 10 }}>The degrees that show up<span className="dot">.</span></h2>
            <ul className="ce" style={{ marginTop: 18 }}>{degrees.items.map((x) => <li key={x}><span className="bead white" />{x}</li>)}</ul>
          </div>
        </section>
      )}
      <style>{`.ce { list-style: none; margin: 12px 0 0; padding: 0; display: grid; gap: 10px; } .ce li { display: flex; gap: 10px; align-items: baseline; } .ce .bead { width: 10px; height: 10px; flex: none; }`}</style>
    </>
  );
}
