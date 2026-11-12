import type { Metadata } from "next";
import Link from "next/link";
import { Crumb } from "@/components/section-intro";
import { TechRadar } from "@/components/tech-radar";
import { More } from "@/components/more";
import { radar, checked, quarter } from "@/data/radar";

export const metadata: Metadata = { title: "Emerging tech radar", description: "What is new in applied AI and how far to trust it: tabular foundation models, JEPA world models, diffusion LMs, hybrid state-space models, agent skills and protocols, sandboxes, disaggregated serving, OpenTelemetry GenAI and more." };

export default function Radar() {
  return (
    <section className="section">
      <div className="wrap">
        <Crumb id="architect" page="Emerging tech radar" />
        <h1 style={{ marginTop: 12 }}>What&apos;s new, and <mark>how far to trust it</mark><span className="dot">.</span></h1>
        <p className="lead" style={{ marginTop: 16 }}><b>{radar.length} emerging technologies</b>, each on a ring: <b>use now</b>, <b>pilot</b>, <b>evaluate</b> or <b>watch</b>.</p>
        <More>
          <p className="lead" style={{ marginTop: 12 }}>Every entry says <b>what it is</b>, <b>why it matters</b>, <b>when to use it</b> and <b>when not to</b>, with its sources. Tap a bead to open its card.</p>
          <p className="count" style={{ marginTop: 12 }}>Read on {checked} from papers, project pages and practitioner write-ups. Vendor figures are treated as claims, not results. Spot something out of date? <Link href="/contribute/">Send a fix</Link>.</p>
        </More>
        <div className="frame q-brief">
          <span className="kicker">{quarter.name} in brief</span>
          <ol>
            {quarter.points.map((p, i) => (
              <li key={p.title}><span className="q-n">{i + 1}</span><div><a href={p.href}><b>{p.title}</b></a></div></li>
            ))}
          </ol>
          <More label="Why each one matters">
            <ol className="q-why">{quarter.points.map((p, i) => <li key={p.title}><b>{i + 1}.</b> {p.line}</li>)}</ol>
          </More>
          <span className="rod" />
        </div>
        <div style={{ marginTop: 34 }}><TechRadar /></div>
        <style>{`
          .q-brief { margin-top: 28px; padding: 20px 22px 34px; }
          .q-brief ol { list-style: none; padding: 0; margin: 12px 0 0; display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px 22px; }
          .q-brief li { display: flex; gap: 12px; align-items: start; }
          .q-brief a { color: var(--ink); text-decoration: none; } .q-brief a:hover b { color: var(--rust-deep); }
          .q-brief p { margin-top: 4px; font-size: 0.88rem; }
          .q-brief ol.q-why { list-style: none; padding: 0; margin: 12px 0 0; display: grid; grid-template-columns: 1fr; gap: 6px; font-size: 0.9rem; color: var(--sec); }
          .q-why b { color: var(--rust-deep); }
          .q-n { flex: none; display: grid; place-items: center; width: 24px; height: 24px; border-radius: 50%; background: var(--rust); color: #fff; font-family: var(--font-mono), monospace; font-size: 0.72rem; }
        `}</style>
      </div>
    </section>
  );
}
