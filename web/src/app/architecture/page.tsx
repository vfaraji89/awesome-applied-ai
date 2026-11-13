import { Crumb } from "@/components/section-intro";
import type { Metadata } from "next";
import Link from "next/link";
import { layers } from "@/data/layers";
import { tools } from "@/data/tools";
import { problems } from "@/data/problems";
import { RequestFlow } from "@/components/request-flow";
import { More } from "@/components/more";
import { T, TH } from "@/i18n/lang";

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
          <Crumb id="architect" page="Architecture" />
          <h1 style={{ marginTop: 12 }}><TH k="architecture.h1">Six layers, one system</TH><span className="dot">.</span></h1>
          <p className="lead" style={{ marginTop: 16 }}><TH k="architecture.p1"><b>Six layers</b>, top to bottom, and <b>the harness</b> that runs across them.</TH></p>
          <More><p className="lead" style={{ marginTop: 12 }}><TH k="architecture.p2">An AI-native system is <b>designed around the model from day one</b>. Each layer below links to its tools and to the design problems that break it.</TH></p></More>
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
                      <h2><T k={`layer.${l.id}`}>{l.name}</T><span className="dot">.</span></h2>
                      <p className="muted" style={{ marginTop: 6 }}><T k={`layer.${l.id}.tag`}>{l.tagline}</T>. <i><T k={`layer.${l.id}.q`}>{l.question}</T></i></p>
                    </div>
                  </div>
                  <div className="chips" style={{ marginTop: 16 }}>
                    {l.categories.map((c) => <Link key={c.id} href={`/tools/?layer=${l.id}&q=`} className="chip"><T k={`layer.${l.id}.cat.${c.id}`}>{c.name}</T></Link>)}
                  </div>
                  <div className="layer-foot">
                    <Link href={`/tools/?layer=${l.id}`} className="count"><T k="tools.n" vars={{ n }}>{"{n} tools"}</T> →</Link>
                    {pr.length > 0 && <Link href={`/problems/#${l.id}`} className="count"><T k="ac.problems" vars={{ n: pr.length }}>{"{n} problems"}</T> →</Link>}
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>
      <section className="section" style={{ background: "var(--paper)" }}>
        <div className="wrap">
          <span className="kicker"><T k="ac.harness">The agent harness</T></span>
          <h2 style={{ marginTop: 10 }}><T k="ac.harness_h">What runs on the layers</T><span className="dot">.</span></h2>
          <p className="lead" style={{ marginTop: 12 }}><TH k="architecture.p3">An agent is <b>a model inside a harness</b>.</TH></p>
          <More><p className="lead" style={{ marginTop: 12 }}><TH k="architecture.p4">Six parts make the difference between <b>a demo</b> and something that <b>survives production</b>.</TH></p></More>
          <div className="harness">
            {HARNESS.map((h, i) => (
              <a key={h.t} href={`#${h.layer}`} className="h-node" style={{ ["--i" as string]: i }}>
                <span className="bead" />
                <b><T k={`ac.h.${i}`}>{h.t}</T></b>
                <span className="muted"><T k={`ac.h.${i}.d`}>{h.d}</T></span>
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
