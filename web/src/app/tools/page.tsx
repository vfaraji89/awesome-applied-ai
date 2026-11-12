import { Crumb } from "@/components/section-intro";
import type { Metadata } from "next";
import { ToolIndex } from "@/components/tool-index";
import { tools } from "@/data/tools";
import { stack } from "@/data/stack";
import { StackRows } from "@/components/stack-rows";
import { More } from "@/components/more";
import { T, TH } from "@/i18n/lang";

export const metadata: Metadata = { title: "Tool map", description: "The applied AI tool map: eleven areas from data to the apps built on it, with licence, maturity and what is emerging." };

export default function Tools() {
  return (
    <section className="section">
      <div className="wrap">
        <Crumb id="tools" page="Every tool" />
        <div id="map">
          <h1 style={{ marginTop: 12 }}><T k="tools.map_h" vars={{ n: tools.length }}>{"{n} tools across applied AI"}</T><span className="dot">.</span></h1>
          <p className="lead" style={{ marginTop: 16 }}><TH k="tools.p3b"><b>Eleven areas</b>, from the data a model learns from to the apps built on it and the landscape around them.</TH></p>
          <More><p className="lead" style={{ marginTop: 12 }}><TH k="tools.p4b">Each tool shows its <b>licence</b> and <b>how proven it is</b>. <b>Emerging</b> tools say why, with a dated source. Filter by area, or press <b>/</b> to search.</TH></p></More>
          <div style={{ marginTop: 20 }}><ToolIndex tools={tools} /></div>
        </div>
        <div id="stack" style={{ marginTop: 88, scrollMarginTop: 96 }}>
          <span className="kicker"><T k="tools.stack_k">My daily stack</T></span>
          <h2 style={{ marginTop: 10 }}><TH k="tools.h1">The stack I use, every day</TH><span className="dot">.</span></h2>
          <p className="lead" style={{ marginTop: 12 }}><TH k="tools.p1"><b>Thirty tools</b> I use daily. <b>Tap a bead</b> to see what each one is for.</TH></p>
          <More><p className="lead" style={{ marginTop: 12 }}><TH k="tools.p2">Three groups: <b>applied AI</b>, <b>data and retrieval</b>, and <b>product engineering</b>. Each bead says what the tool is and where I use it.</TH></p></More>
          <div style={{ marginTop: 30 }}><StackRows groups={stack} /></div>
        </div>
      </div>
    </section>
  );
}
