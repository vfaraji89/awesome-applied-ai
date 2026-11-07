import type { Metadata } from "next";
import { ToolIndex } from "@/components/tool-index";
import { tools } from "@/data/tools";
import { layers } from "@/data/layers";

export const metadata: Metadata = { title: "Tools", description: "The main applied AI tools, per layer: licence, maturity and what each one is for." };

export default function Tools() {
  const ls = layers.map((l) => ({ id: l.id, name: l.name, categories: l.categories.map((c) => ({ id: c.id, name: c.name })) }));
  return (
    <section className="section">
      <div className="wrap">
        <span className="kicker">Tools index</span>
        <h1 style={{ marginTop: 12 }}>The main tools, per layer<span className="dot">.</span></h1>
        <p className="lead" style={{ marginTop: 16 }}>{tools.length} tools across the six layers, each with its licence and how proven it is in production.</p>
        <div style={{ marginTop: 24 }}><ToolIndex tools={tools} layers={ls} /></div>
      </div>
    </section>
  );
}
