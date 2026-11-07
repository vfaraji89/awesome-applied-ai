import type { Metadata } from "next";
import Link from "next/link";
import { courses } from "@/data/courses";

export const metadata: Metadata = { title: "Learn", description: "Animated courses on applied AI, data problems and the AI stack." };

export default function Learn() {
  return (
    <section className="section">
      <div className="wrap">
        <span className="kicker">Learn</span>
        <h1 style={{ marginTop: 12 }}>Courses you watch<span className="dot">.</span></h1>
        <p className="lead" style={{ marginTop: 16 }}>Every lesson is a short animation with one idea in it. The outlines are set, and lessons go live one at a time. Until then, start with the <Link href="/jargon/">jargon</Link> and the <Link href="/architecture/">architecture</Link>.</p>
        <div className="grid" style={{ marginTop: 36, gap: 22 }}>
          {courses.map((c, ci) => (
            <article key={c.id} id={c.id} className="frame rise" style={{ ["--i" as string]: ci }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
                <span className="kicker">Course {String(ci + 1).padStart(2, "0")}</span>
                <span className="soon">Coming soon</span>
              </div>
              <h2 style={{ marginTop: 10 }}>{c.name}<span className="dot">.</span></h2>
              <p className="muted" style={{ marginTop: 8 }}>{c.oneLine}</p>
              <ol className="lessons">
                {c.lessons.map((l, i) => (
                  <li key={l}><span className="bead white" /><span className="mono count">{String(i + 1).padStart(2, "0")}</span><span>{l}</span></li>
                ))}
              </ol>
            </article>
          ))}
        </div>
      </div>
      <style>{`
        .lessons { list-style: none; margin: 18px 0 0; padding: 0; position: relative; display: grid; gap: 10px; }
        .lessons::before { content: ""; position: absolute; left: 5px; top: 8px; bottom: 8px; width: 4px; border-radius: 4px; background: var(--rod); }
        .lessons li { position: relative; display: flex; align-items: center; gap: 12px; }
      `}</style>
    </section>
  );
}
