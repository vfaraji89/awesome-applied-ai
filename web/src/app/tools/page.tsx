import { Crumb } from "@/components/section-intro";
import type { Metadata } from "next";
import { ToolIndex } from "@/components/tool-index";
import { tools } from "@/data/tools";
import { layers } from "@/data/layers";
import { stack } from "@/data/stack";
import { StackRows } from "@/components/stack-rows";
import { More } from "@/components/more";
import { TH } from "@/i18n/lang";

export const metadata: Metadata = { title: "Tools", description: "The main applied AI tools, per layer: licence, maturity and what each one is for." };

export default function Tools() {
  const ls = layers.map((l) => ({ id: l.id, name: l.name, categories: l.categories.map((c) => ({ id: c.id, name: c.name })) }));
  return (
    <section className="section">
      <div className="wrap">
        <Crumb id="architect" page="Tools" />
        <h1 style={{ marginTop: 12 }}><TH k="tools.h1">The stack I use, every day</TH><span className="dot">.</span></h1>
        <p className="lead" style={{ marginTop: 16 }}><TH k="tools.p1"><b>Thirty tools</b> I use daily. <b>Tap a bead</b> to see what each one is for.</TH></p>
        <More><p className="lead" style={{ marginTop: 12 }}><TH k="tools.p2">Three groups: <b>applied AI</b>, <b>data and retrieval</b>, and <b>product engineering</b>. Each bead says what the tool is and where I use it.</TH></p></More>
        <div style={{ marginTop: 30 }}><StackRows groups={stack} /></div>
        <div id="map" style={{ marginTop: 72 }}>
          <span className="kicker">The wider map</span>
          <h2 style={{ marginTop: 10 }}>{tools.length} tools, per layer<span className="dot">.</span></h2>
          <p className="lead" style={{ marginTop: 12 }}><TH k="tools.p3"><b>The wider map</b>: the main tools in each of the six layers.</TH></p>
          <More><p className="lead" style={{ marginTop: 12 }}><TH k="tools.p4">Beyond my own stack, each tool shows its <b>licence</b> and <b>how proven it is in production</b>. Filter by layer or search by name.</TH></p></More>
          <div style={{ marginTop: 20 }}><ToolIndex tools={tools} layers={ls} /></div>
        </div>
      </div>
    </section>
  );
}
