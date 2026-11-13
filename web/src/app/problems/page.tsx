import { Crumb } from "@/components/section-intro";
import type { Metadata } from "next";
import Link from "next/link";
import { problems } from "@/data/problems";
import { layers } from "@/data/layers";
import { More } from "@/components/more";
import { T, TH } from "@/i18n/lang";

export const metadata: Metadata = { title: "Problems", description: "Common applied AI problems, the way they are asked, and how to solve them." };

export default function Problems() {
  return (
    <section className="section">
      <div className="wrap">
        <Crumb id="architect" page="Problems" />
        <h1 style={{ marginTop: 12 }}><TH k="problems.h1">What breaks, and the fix</TH><span className="dot">.</span></h1>
        <p className="lead" style={{ marginTop: 16 }}><TH k="problems.p1" vars={{ v1: problems.length }}><b>{problems.length} problems</b> from real AI systems, each with <b>a worked answer</b>.</TH></p>
        <More><p className="lead" style={{ marginTop: 12 }}><TH k="problems.p2">Each one is asked <b>the way a team would ask it</b>, then answered with <b>the constraint that decides it</b> and a worked design.</TH></p></More>
        {layers.filter((l) => problems.some((p) => p.layer === l.id)).map((l) => (
          <div key={l.id} id={l.id} style={{ marginTop: 40 }}>
            <h2><T k={`layer.${l.id}`}>{l.name}</T><span className="dot">.</span></h2>
            <div className="grid grid-2" style={{ marginTop: 18 }}>
              {problems.filter((p) => p.layer === l.id).map((p, i) => (
                <Link key={p.id} href={`/problems/${p.id}/`} className="frame rise" style={{ ["--i" as string]: i, paddingBottom: 38 }}>
                  <span className="mono count">Problem {String(p.n).padStart(2, "0")}</span>
                  <h3 style={{ marginTop: 6 }}>{p.title}</h3>
                  <p className="muted" style={{ marginTop: 8, fontSize: ".95rem" }}>{p.asked}</p>
                  <span className="rod" />
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
