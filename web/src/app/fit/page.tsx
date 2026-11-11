import type { Metadata } from "next";
import Link from "next/link";
import { Crumb } from "@/components/section-intro";
import { RoleFit } from "@/components/role-fit";

export const metadata: Metadata = { title: "Role fit", description: "Paste your CV or a list of skills and see which applied AI roles you fit, and what to learn next, measured against what real postings ask for." };

export default function Fit() {
  return (
    <section className="section">
      <div className="wrap">
        <Crumb id="market" page="Role fit" />
        <h1 style={{ marginTop: 12 }}>Which applied AI role <mark>fits you</mark><span className="dot">.</span></h1>
        <p className="lead" style={{ marginTop: 16 }}>Paste your experience. It is read with the same rules the tracker uses on job postings, then scored against what each role family&apos;s postings actually ask for. You get your closest role and what to learn next, ranked by demand.</p>
        <div style={{ marginTop: 30 }}><RoleFit /></div>
        <p className="muted" style={{ marginTop: 26, fontSize: "0.9rem" }}>Want the providers&apos; own bar? See <Link href="/labs/">what Anthropic, OpenAI and Google ask for</Link>. How the postings are collected: <Link href="/market/">Market pulse</Link>.</p>
      </div>
    </section>
  );
}
