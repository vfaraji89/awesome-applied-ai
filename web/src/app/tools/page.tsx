import { Crumb } from "@/components/section-intro";
import type { Metadata } from "next";
import { ToolIndex } from "@/components/tool-index";
import { tools } from "@/data/tools";
import { layers } from "@/data/layers";
import { stack } from "@/data/stack";
import { StackRows } from "@/components/stack-rows";

export const metadata: Metadata = { title: "Tools", description: "The main applied AI tools, per layer: licence, maturity and what each one is for." };

export default function Tools() {
  const ls = layers.map((l) => ({ id: l.id, name: l.name, categories: l.categories.map((c) => ({ id: c.id, name: c.name })) }));
  return (
    <section className="section">
      <div className="wrap">
        <Crumb id="architect" page="Tools" />
        <h1 style={{ marginTop: 12 }}>The stack I use, every day<span className="dot">.</span></h1>
        <p className="lead" style={{ marginTop: 16 }}>Thirty tools in three groups: applied AI, data and retrieval, product engineering. Tap a bead to see what it is and where I use it.</p>
        <div style={{ marginTop: 30 }}><StackRows groups={stack} /></div>
        <div id="map" style={{ marginTop: 72 }}>
          <span className="kicker">The wider map</span>
          <h2 style={{ marginTop: 10 }}>{tools.length} tools, per layer<span className="dot">.</span></h2>
          <p className="lead" style={{ marginTop: 12 }}>Beyond my own stack: the main tools in each of the six layers, with licence and how proven each is in production.</p>
          <div style={{ marginTop: 20 }}><ToolIndex tools={tools} layers={ls} /></div>
        </div>
      </div>
    </section>
  );
}
