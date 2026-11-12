import type { Metadata } from "next";
import { SectionIntro } from "@/components/section-intro";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "Feedback", description: "Spot something wrong, missing or out of date on awesome-applied-ai? Send a correction." };

const ASKS = [
  { what: "A wrong or outdated fact", how: "The page, what is wrong, and a source for the fix." },
  { what: "A company the tracker should watch", how: "Its careers page; public Greenhouse, Lever, Ashby or Workday boards work best." },
  { what: "A term, tool or radar entry that is missing", how: "What it is, and why a practitioner should know it." },
];

export default function Feedback() {
  const mail = `mailto:${site.author.email}?subject=${encodeURIComponent("awesome-applied-ai: a correction")}`;
  return (
    <section className="section">
      <div className="wrap">
        <SectionIntro id="contribute" lead={`This site is the companion to ${site.author.book}, a book in progress. Corrections make both better.`} />
        <div className="grid grid-2" style={{ marginTop: 34 }}>
          <a href={mail} className="frame" style={{ paddingBottom: 38 }}>
            <span className="count">Email</span>
            <h3 style={{ fontSize: "1.5rem", fontWeight: 800, marginTop: 8 }}>Send a correction<span className="dot">.</span></h3>
            <p className="muted" style={{ marginTop: 8 }}>The page, what is wrong, and a link to a source.</p>
            <span className="rod" />
          </a>
          <a href={site.author.linkedin} target="_blank" rel="noopener" className="frame" style={{ paddingBottom: 38 }}>
            <span className="count">LinkedIn</span>
            <h3 style={{ fontSize: "1.5rem", fontWeight: 800, marginTop: 8 }}>Message me<span className="dot">.</span></h3>
            <p className="muted" style={{ marginTop: 8 }}>For a longer conversation, or to suggest a topic for the book.</p>
            <span className="rod" />
          </a>
        </div>
        <h2 style={{ marginTop: 56 }}>Most useful<span className="dot">.</span></h2>
        <div className="cw">
          {ASKS.map((w) => (
            <div key={w.what} className="cw-row">
              <b>{w.what}</b>
              <span className="muted">{w.how}</span>
            </div>
          ))}
        </div>
      </div>
      <style>{`
        .cw { margin-top: 18px; border: 1px solid var(--line); border-radius: 14px; overflow: hidden; }
        .cw-row { display: grid; grid-template-columns: 1fr 1.6fr; gap: 16px; padding: 14px 18px; border-bottom: 1px solid var(--line); align-items: baseline; }
        .cw-row:last-child { border-bottom: none; }
        @media (max-width: 760px) { .cw-row { grid-template-columns: 1fr; gap: 4px; } }
      `}</style>
    </section>
  );
}
