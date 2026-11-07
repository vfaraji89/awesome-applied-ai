import { Crumb } from "@/components/section-intro";
import type { Metadata } from "next";
import Link from "next/link";
import { problems } from "@/data/problems";
import { layers } from "@/data/layers";

export const metadata: Metadata = { title: "Problems", description: "Common applied AI problems, the way they are asked, and how to solve them." };

export default function Problems() {
  return (
    <section className="section">
      <div className="wrap">
        <Crumb id="architect" page="Problems" />
        <h1 style={{ marginTop: 12 }}>What breaks, and the fix<span className="dot">.</span></h1>
        <p className="lead" style={{ marginTop: 16 }}>{problems.length} problems from real AI systems, each asked the way a team would ask it, with a worked answer.</p>
        {layers.filter((l) => problems.some((p) => p.layer === l.id)).map((l) => (
          <div key={l.id} id={l.id} style={{ marginTop: 40 }}>
            <h2>{l.name}<span className="dot">.</span></h2>
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
