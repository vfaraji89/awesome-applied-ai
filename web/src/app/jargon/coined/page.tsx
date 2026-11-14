import type { Metadata } from "next";
import Link from "next/link";
import { Crumb } from "@/components/section-intro";
import { T, TH } from "@/i18n/lang";
import { share } from "@/lib/share";
import { CoinedRod } from "@/components/coined-rod";
import { coined } from "@/data/coined";
import { skills } from "@/data/framework";

export const metadata: Metadata = { ...share("jargon/coined"), title: "Coined & decoded", description: "The new words of applied AI: who coined or popularised each one, when, and what it plainly means. Most are old ideas with a better name." };

const skillName = (id: string) => skills.find((s) => s.id === id)?.name ?? id;

export default function CoinedPage() {
  const items = [...coined].sort((a, b) => a.when.localeCompare(b.when));
  return (
    <>
      <section className="section">
        <div className="wrap">
          <Crumb id="docs" page="Coined & decoded" />
          <h1 style={{ marginTop: 12 }}><TH k="cd.h1">Coined <mark>&amp; decoded</mark></TH><span className="dot">.</span></h1>
          <p className="lead" style={{ marginTop: 16, maxWidth: "64ch" }}><T k="cd.lead">Applied AI is simpler than its vocabulary. Every few months someone coins a new word, and most are old ideas with a better name. Here is who said it first, when, and what it plainly means.</T></p>
          <div className="frame" style={{ marginTop: 30, padding: "30px 30px 26px" }}><CoinedRod items={items} /></div>
        </div>
      </section>

      <section className="section" style={{ background: "var(--paper)", paddingTop: 44 }}>
        <div className="wrap">
          <ul className="cd-list">
            {[...items].reverse().map((c) => (
              <li key={c.id} id={c.id} className="frame cd-card">
                <div className="cd-top">
                  <b className="cd-term">{c.term}</b>
                  <span className="count">{c.label}</span>
                </div>
                <span className="cd-by"><T k={`cd.how_${c.how}`}>{c.how}</T> <T k="cd.by">by</T> {c.by}</span>
                <p className="cd-plain">{c.plain}</p>
                <p className="cd-was"><span><T k="cd.was">Plainly</T></span> {c.was}</p>
                {c.note && <p className="cd-note">{c.note}</p>}
                <div className="cd-links">
                  <a href={c.source.url} target="_blank" rel="noreferrer" className="chip">{c.source.label} ↗</a>
                  {c.jargon && <Link href={`/jargon/#${c.jargon}`} className="chip"><T k="cd.in_jargon">In the jargon</T></Link>}
                  {c.skill && <Link href={`/skills/${c.skill}/`} className="chip"><T k="cd.skill">Skill</T>: <T k={`skill.${c.skill}`}>{skillName(c.skill)}</T></Link>}
                </div>
              </li>
            ))}
          </ul>
          <p className="muted" style={{ marginTop: 26, maxWidth: "75ch", fontSize: ".9rem" }}>
            <T k="cd.how">"Coined" means the first known use; "popularised" means someone made it stick after earlier uses; "named" means a paper or a company gave a practice its name. Where the first use is disputed, the card says so.</T>{" "}
            <Link href="/jargon/"><T k="cd.to_jargon">Every other term, in plain words</T> →</Link> · <Link href="/contribute/"><T k="cd.suggest">Suggest a word or a correction</T></Link>
          </p>
        </div>
      </section>
      <style>{`
        .cd-list { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 360px), 1fr)); gap: 14px; }
        .cd-card { display: grid; gap: 8px; align-content: start; scroll-margin-top: 90px; }
        .cd-top { display: flex; justify-content: space-between; gap: 12px; align-items: baseline; } .cd-term { font-size: 1.2rem; font-weight: 800; letter-spacing: -.01em; }
        .cd-by { font-size: .84rem; color: var(--sec); }
        .cd-plain { font-size: 1rem; color: var(--ink); margin-top: 4px; }
        .cd-was { color: var(--sec); font-size: .92rem; } .cd-was span { font: .66rem var(--font-mono), monospace; text-transform: uppercase; letter-spacing: .08em; color: var(--rust-deep); margin-right: 6px; }
        .cd-note { font-size: .8rem; color: var(--muted); }
        .cd-links { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 6px; } .cd-links .chip { font-size: .74rem; }
      `}</style>
    </>
  );
}
