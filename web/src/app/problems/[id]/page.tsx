import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { problems, problemById } from "@/data/problems";
import { JsonLd } from "@/components/json-ld";
import { problemLd } from "@/lib/seo";
import { problemBodies } from "@/data/problem-bodies";
import { layers } from "@/data/layers";
import { Prose } from "@/components/prose";

export function generateStaticParams() {
  return problems.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const p = problemById.get((await params).id);
  return p ? { title: p.title, description: p.asked } : {};
}

export default async function ProblemPage({ params }: { params: Promise<{ id: string }> }) {
  const p = problemById.get((await params).id);
  if (!p) notFound();
  const layer = layers.find((l) => l.id === p.layer);
  const i = problems.findIndex((x) => x.id === p.id);
  const prev = problems[i - 1], next = problems[i + 1];
  return (
    <section className="section">
      <JsonLd data={problemLd(p.id)} />
      <div className="wrap" style={{ maxWidth: 860 }}>
        <Link href="/problems/" className="count" style={{ textDecoration: "none" }}>← All problems</Link>
        <div className="kicker" style={{ marginTop: 18 }}>Problem {String(p.n).padStart(2, "0")} · <Link href={`/architecture/#${p.layer}`}>{layer?.name}</Link></div>
        <h1 style={{ marginTop: 12, fontSize: "clamp(2rem, 5vw, 3.2rem)" }}>{p.title}<span className="dot">.</span></h1>
        <blockquote className="frame" style={{ margin: "26px 0 34px", fontSize: "1.1rem", background: "var(--paper)" }}>
          <span className="kicker">The question</span>
          <p style={{ marginTop: 8 }}>{p.asked}</p>
        </blockquote>
        <Prose blocks={problemBodies[p.id] ?? []} />
        <nav style={{ display: "flex", justifyContent: "space-between", gap: 12, marginTop: 48, flexWrap: "wrap" }}>
          {prev ? <Link href={`/problems/${prev.id}/`} className="chip">← {prev.title}</Link> : <span />}
          {next ? <Link href={`/problems/${next.id}/`} className="chip">{next.title} →</Link> : <span />}
        </nav>
      </div>
    </section>
  );
}
