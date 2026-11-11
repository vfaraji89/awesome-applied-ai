import type { Metadata } from "next";
import Link from "next/link";
import { Crumb } from "@/components/section-intro";
import { TechRadar } from "@/components/tech-radar";
import { radar, checked } from "@/data/radar";

export const metadata: Metadata = { title: "Emerging tech radar", description: "What is new in applied AI and how far to trust it: tabular foundation models, JEPA world models, diffusion LMs, hybrid state-space models, agent skills and protocols, sandboxes, disaggregated serving, OpenTelemetry GenAI and more." };

export default function Radar() {
  return (
    <section className="section">
      <div className="wrap">
        <Crumb id="architect" page="Emerging tech radar" />
        <h1 style={{ marginTop: 12 }}>What&apos;s new, and <mark>how far to trust it</mark><span className="dot">.</span></h1>
        <p className="lead" style={{ marginTop: 16 }}>{radar.length} emerging technologies an applied AI architect should know, each placed on a ring: use now, pilot, evaluate or watch. Every entry says what it is, why it matters, when to use it and when not to, with its sources.</p>
        <p className="count" style={{ marginTop: 12 }}>Read on {checked} from papers, project pages and practitioner write-ups. Vendor figures are treated as claims, not results. Spot something out of date? <Link href="/contribute/">Send a fix</Link>.</p>
        <div style={{ marginTop: 34 }}><TechRadar /></div>
      </div>
    </section>
  );
}
