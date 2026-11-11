import type { Metadata } from "next";
import Link from "next/link";
import { Crumb } from "@/components/section-intro";
import { RoleFit } from "@/components/role-fit";

export const metadata: Metadata = { title: "Role fit", description: "Paste your CV to see which applied AI role you fit, or paste a job description to see how it compares with the market. Both measured against real postings, with a learning path for every gap." };

export default function Fit() {
  return (
    <section className="section">
      <div className="wrap">
        <Crumb id="market" page="Role fit" />
        <h1 style={{ marginTop: 12 }}>Fit, <mark>both ways round</mark><span className="dot">.</span></h1>
        <p className="lead" style={{ marginTop: 16 }}>Paste your experience to find the role you fit, or paste a job description to see how it compares with every similar posting. Both are read with the same rules the tracker uses on real postings, and every gap links to where you can learn it on this site.</p>
        <div style={{ marginTop: 30 }}><RoleFit /></div>
        <p className="muted" style={{ marginTop: 26, fontSize: "0.9rem" }}>Want the providers&apos; own bar? See <Link href="/labs/">what Anthropic, OpenAI and Google ask for</Link>. How the postings are collected: <Link href="/market/">Market pulse</Link>.</p>
      </div>
    </section>
  );
}
