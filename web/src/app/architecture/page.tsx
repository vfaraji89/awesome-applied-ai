import type { Metadata } from "next";
import Link from "next/link";
import { layers } from "@/data/layers";
import { tools } from "@/data/tools";
import { problems } from "@/data/problems";
import { RequestFlow } from "@/components/request-flow";

export const metadata: Metadata = { title: "AI-native architecture", description: "The six layers of an AI-native system, and the agent harness that runs on them." };

const HARNESS = [
  { t: "Loop", d: "Plan, act, observe, repeat, with a budget and a way to stop.", layer: "orchestration" },
  { t: "Tools", d: "Clear tool interfaces, often over MCP, and a plan for when calls fail.", layer: "orchestration" },
  { t: "Context", d: "What goes into the window, in what order, and what it costs.", layer: "caching" },
  { t: "Memory", d: "What survives the turn, and what is safe to forget.", layer: "memory" },
  { t: "Evals", d: "Scores from real tasks, traces and failure analysis.", layer: "evaluation" },
  { t: "Guardrails", d: "Limits on what the agent may do, and proof of what it did.", layer: "governance" },
];

export default function Architecture() {
  return (
    <>
      <section className="section">
        <div className="wrap">
          <span className="kicker">AI-native architecture</span>
          <h1 style={{ marginTop: 12 }}>Six layers, one system<span className="dot">.</span></h1>
          <p className="lead" style={{ marginTop: 16 }}>An AI-native system is designed around the model from day one. These are the six layers it is built from, top to bottom, and the agent harness that runs across them.</p>
          <div style={{ marginTop: 40 }}><RequestFlow /></div>
        </div>
      </section>
      <section className="section">
        <div className="wrap">
          <div className="grid" style={{ gap: 20 }}>
            {layers.map((l, i) => {
              const n = tools.filter((t) => t.layer === l.id).length;
              const pr = problems.filter((p) => p.layer === l.id);
              return (
                <article key={l.id} id={l.id} className="frame layer rise" style={{ ["--i" as string]: i }}>
                  <div className="layer-head">
                    <span className="mono count">{String(layers.length - i).padStart(2, "0")}</span>
                    <div>
                      <h2>{l.name}<span className="dot">.</span></h2>
                      <p className="muted" style={{ marginTop: 6 }}>{l.tagline}. <i>{l.question}</i></p>
                    </div>
                  </div>
                  <div className="chips" style={{ marginTop: 16 }}>
                    {l.categories.map((c) => <Link key={c.id} href={`/tools/?layer=${l.id}&q=`} className="chip">{c.name}</Link>)}
                  </div>
                  <div className="layer-foot">
                    <Link href={`/tools/?layer=${l.id}`} className="count">{n} tools →</Link>
                    {pr.length > 0 && <Link href={`/problems/#${l.id}`} className="count">{pr.length} problems →</Link>}
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>
      <section className="section" style={{ background: "var(--paper)" }}>
        <div className="wrap">
          <span className="kicker">The agent harness</span>
          <h2 style={{ marginTop: 10 }}>What runs on the layers<span className="dot">.</span></h2>
          <p className="lead" style={{ marginTop: 12 }}>An agent is a model inside a harness. Six parts make the difference between a demo and something that survives production.</p>
          <div className="harness">
            {HARNESS.map((h, i) => (
              <a key={h.t} href={`#${h.layer}`} className="h-node" style={{ ["--i" as string]: i }}>
                <span className="bead" />
                <b>{h.t}</b>
                <span className="muted">{h.d}</span>
              </a>
            ))}
          </div>
        </div>
      </section>
      <style>{`
        .layer-head { display: flex; gap: 16px; align-items: baseline; } .layer-head .count { font-size: 1rem; color: var(--rust-deep); }
        .layer-foot { display: flex; gap: 18px; margin-top: 16px; } .layer-foot a { text-decoration: none; } .layer-foot a:hover { color: var(--rust-deep); }
        .harness { margin-top: 36px; display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 170px), 1fr)); gap: 14px; position: relative; }
        .harness::before { content: ""; position: absolute; left: 0; right: 0; top: 27px; height: 4px; border-radius: 4px; background: var(--rod); }
        .h-node { position: relative; display: flex; flex-direction: column; gap: 6px; padding: 20px 4px 0; text-decoration: none; animation: rise .6s var(--ease) both; animation-delay: calc(var(--i) * 90ms); }
        .h-node .bead { width: 22px; height: 22px; margin-bottom: 10px; transition: transform .4s var(--spring); }
        .h-node:hover .bead { transform: translateX(10px); }
        .h-node b { font-size: 1.1rem; } .h-node .muted { font-size: .92rem; }
      `}</style>
    </>
  );
}
