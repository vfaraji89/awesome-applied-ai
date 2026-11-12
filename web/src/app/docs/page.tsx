import type { Metadata } from "next";
import Link from "next/link";
import { docs } from "@/data/docs";
import { DocCover } from "@/components/doc-cover";
import { SectionIntro } from "@/components/section-intro";
import { TH } from "@/i18n/lang";

export const metadata: Metadata = { title: "Docs", description: "Technical docs, in motion: Claude Platform, Vercel AI SDK, LangChain and Deep Agents, and MCP, as short animations, examples and code." };

export default function Docs() {
  return (
    <section className="section">
      <div className="wrap">
        <SectionIntro id="docs" h1={<TH k="h1.docs">Docs people actually <mark>finish</mark></TH>} lead="Nobody reads technical docs end to end. Here each idea is one short animation, one everyday comparison, a real example and the code you need, in plain words." />
        <div className="dcat">
          {docs.map((d, i) => {
            const body = (
              <>
                <DocCover course={d} index={i} />
                <div className="dcat-body">
                  <div className="dcat-top">
                    {d.status === "live" ? <span className="chip on">Live</span> : <span className="soon">Coming soon</span>}
                    {d.pages.length > 0 && <span className="count">{d.pages.length} pages</span>}
                  </div>
                  <p className="muted" style={{ marginTop: 10 }}>{d.oneLine}</p>
                  {d.href && <span className="btn" style={{ marginTop: 18, alignSelf: "flex-start" }}>Open the doc →</span>}
                </div>
              </>
            );
            return d.href
              ? <Link key={d.id} id={d.id} href={d.href} className="frame dcat-card rise" style={{ ["--i" as string]: i }}>{body}</Link>
              : <article key={d.id} id={d.id} className="frame dcat-card rise" style={{ ["--i" as string]: i }}>{body}</article>;
          })}
        </div>
      </div>
      <style>{`
        .dcat { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 460px), 1fr)); gap: 22px; margin-top: 36px; }
        .dcat-card { padding: 14px 18px 22px; display: flex; flex-direction: column; }
        .dcat-body { padding: 16px 8px 0; display: flex; flex-direction: column; }
        .dcat-top { display: flex; justify-content: space-between; align-items: center; gap: 10px; }
      `}</style>
    </section>
  );
}
