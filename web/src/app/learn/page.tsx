import type { Metadata } from "next";
import Link from "next/link";
import { courses } from "@/data/courses";
import { CourseCover } from "@/components/course-cover";

export const metadata: Metadata = { title: "Courses", description: "Animated courses on Claude Code, the Claude Platform, LangChain and Deep Agents, and the Vercel AI SDK." };

export default function Learn() {
  return (
    <section className="section">
      <div className="wrap">
        <span className="kicker">Courses</span>
        <h1 style={{ marginTop: 12 }}>Learn the tools, one animation at a time<span className="dot">.</span></h1>
        <p className="lead" style={{ marginTop: 16 }}>Four courses, in plain language, all free. Every lesson is one idea, one everyday comparison and one short animation.</p>
        <div className="catalogue">
          {courses.map((c, ci) => {
            const card = (
              <>
                <CourseCover course={c} index={ci} />
                <div className="cat-body">
                  <div className="cat-top">
                    {c.status === "live" ? <span className="chip on">Live</span> : <span className="soon">Coming soon</span>}
                    <span className="count">Free · {c.lessons.length} lessons</span>
                  </div>
                  <p className="muted" style={{ marginTop: 10 }}>{c.oneLine}</p>
                  <ol className="lessons">
                    {c.lessons.map((l, i) => {
                      const later = i >= c.ready;
                      return <li key={l}><span className={`bead${later ? " white" : ""}`} /><span className="mono count">{String(i + 1).padStart(2, "0")}</span><span className={later ? "muted" : ""}>{l}</span>{later && c.ready > 0 && <span className="count">· soon</span>}</li>;
                    })}
                  </ol>
                  {c.href && <span className="btn" style={{ marginTop: 18 }}>Start the course →</span>}
                </div>
              </>
            );
            return c.href
              ? <Link key={c.id} id={c.id} href={c.href} className="frame cat rise" style={{ ["--i" as string]: ci }}>{card}</Link>
              : <article key={c.id} id={c.id} className="frame cat rise" style={{ ["--i" as string]: ci }}>{card}</article>;
          })}
        </div>
      </div>
      <style>{`
        .catalogue { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 480px), 1fr)); gap: 22px; margin-top: 36px; }
        .cat { padding: 14px 18px 22px; display: flex; flex-direction: column; }
        .cat-body { padding: 16px 8px 0; display: flex; flex-direction: column; }
        .cat-top { display: flex; justify-content: space-between; align-items: center; gap: 10px; }
        .lessons { list-style: none; margin: 16px 0 0; padding: 0; position: relative; display: grid; gap: 8px; }
        .lessons::before { content: ""; position: absolute; left: 5px; top: 8px; bottom: 8px; width: 4px; border-radius: 4px; background: var(--rod); }
        .lessons li { position: relative; display: flex; align-items: center; gap: 12px; font-size: .95rem; }
        .cat .btn { align-self: flex-start; }
      `}</style>
    </section>
  );
}
