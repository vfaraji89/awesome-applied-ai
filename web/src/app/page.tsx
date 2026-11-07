import Link from "next/link";
import { LearnPath } from "@/components/learn-path";
import { RequestFlow } from "@/components/request-flow";
import { WordCycler } from "@/components/word-cycler";
import { tools } from "@/data/tools";
import { terms } from "@/data/dictionary";
import { problems } from "@/data/problems";
import { layers } from "@/data/layers";
import { roles } from "@/data/roles";
import { courses } from "@/data/courses";

const START = [
  { href: "/learn/", t: "Learn", d: "Animated courses: applied AI, data problems, the stack.", n: `${courses.length} courses` },
  { href: "/jargon/", t: "Jargon", d: "The words people use in AI, in plain language.", n: `${terms.length} terms` },
  { href: "/architecture/", t: "Architecture", d: "Six layers every AI-native system is built from.", n: `${layers.length} layers` },
  { href: "/tools/", t: "Tools", d: "The main tools per layer, with licence and maturity.", n: `${tools.length} tools` },
  { href: "/roles/", t: "Roles", d: "Applied AI jobs: what each one owns and uses.", n: `${roles.length} roles` },
  { href: "/problems/", t: "Problems", d: "What breaks in real projects, and the fix.", n: `${problems.length} problems` },
];

export default function Home() {
  const picks = terms.filter((t) => ["token", "context-window", "embedding", "rag", "kv-cache", "mcp", "hallucination", "eval", "agent"].includes(t.id));
  const words = (picks.length >= 5 ? picks : terms.slice(0, 9)).map(({ id, term, short }) => ({ id, term, short }));
  return (
    <>
      <section className="section">
        <div className="wrap">
          <span className="kicker rise">awesome-applied-ai</span>
          <h1 className="rise" style={{ ["--i" as string]: 1, marginTop: 14 }}>Applied AI, <mark>mapped</mark><span className="dot">.</span></h1>
          <p className="lead rise" style={{ ["--i" as string]: 2, marginTop: 18 }}>
            Learn how AI systems really work, one animation at a time: the words, the layers, the tools, the jobs and the problems you will meet.
          </p>
          <div className="rise" style={{ ["--i" as string]: 3, display: "flex", gap: 10, flexWrap: "wrap", marginTop: 26 }}>
            <Link href="/learn/" className="btn">Start learning →</Link>
            <Link href="/tools/" className="btn ghost">Browse {tools.length} tools</Link>
          </div>
          <LearnPath />
        </div>
      </section>

      <section className="section" style={{ background: "var(--paper)" }}>
        <div className="wrap">
          <div className="section-head">
            <div>
              <span className="kicker">Watch it work</span>
              <h2 style={{ marginTop: 10 }}>One request, six layers<span className="dot">.</span></h2>
              <p className="lead">Follow a single question through an AI system and back. Tap any layer to stop on it.</p>
            </div>
            <Link href="/architecture/" className="chip">The architecture →</Link>
          </div>
          <RequestFlow />
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="section-head">
            <div>
              <span className="kicker">Where to start</span>
              <h2 style={{ marginTop: 10 }}>Pick a door<span className="dot">.</span></h2>
            </div>
          </div>
          <div className="grid grid-3">
            {START.map((s, i) => (
              <Link key={s.href} href={s.href} className="frame rise" style={{ ["--i" as string]: i, paddingBottom: 38 }}>
                <span className="count">{s.n}</span>
                <h3 style={{ fontSize: "1.6rem", fontWeight: 800, marginTop: 8 }}>{s.t}<span className="dot">.</span></h3>
                <p className="muted" style={{ marginTop: 8 }}>{s.d}</p>
                <span className="rod" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="section-head">
            <div>
              <span className="kicker">Courses</span>
              <h2 style={{ marginTop: 10 }}>Fully animated, coming one lesson at a time<span className="dot">.</span></h2>
            </div>
            <Link href="/learn/" className="chip">All courses →</Link>
          </div>
          <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 240px), 1fr))" }}>
            {courses.map((c) => (
              <Link key={c.id} href={`/learn/#${c.id}`} className="frame" style={{ paddingBottom: 38 }}>
                <span className="soon">Coming soon</span>
                <h3 style={{ marginTop: 12 }}>{c.name}</h3>
                <p className="muted" style={{ marginTop: 6 }}>{c.oneLine}</p>
                <span className="count" style={{ display: "block", marginTop: 12 }}>{c.lessons.length} lessons</span>
                <span className="rod" />
              </Link>
            ))}
            <WordCycler terms={words} />
          </div>
        </div>
      </section>
    </>
  );
}
