import type { Metadata } from "next";
import Link from "next/link";
import { Crumb } from "@/components/section-intro";
import { RoleFit } from "@/components/role-fit";
import { More } from "@/components/more";
import { TH } from "@/i18n/lang";

export const metadata: Metadata = { title: "Role fit", description: "Paste your CV to see how ready you are for applied AI roles and what to learn next, or paste a job description to see how it compares with the market. Measured against real postings." };

export default function Fit() {
  return (
    <section className="section">
      <div className="wrap">
        <Crumb id="market" page="Role fit" />
        <h1 style={{ marginTop: 12 }}><TH k="fit.h1">How ready are you <mark>for the market</mark></TH><span className="dot">.</span></h1>
        <p className="lead" style={{ marginTop: 16 }}><TH k="fit.p1">Paste <b>your experience</b> to see which applied AI role you are closest to and what to learn next. Or paste <b>a job description</b> to see how it compares with the market.</TH></p>
        <More label="How it works"><p className="lead" style={{ marginTop: 12 }}><TH k="fit.p2">Both are read with <b>the same rules the tracker uses on real postings</b>, and every gap links to <b>where you can learn it</b> on this site. Nothing you paste leaves your browser.</TH></p></More>
        <div style={{ marginTop: 30 }}><RoleFit /></div>
        <p className="muted" style={{ marginTop: 26, fontSize: "0.9rem" }}><TH k="fit.p3">For the model labs&apos; own bar, see <Link href="/labs/">what Anthropic, OpenAI and Google ask for</Link>. For the one skill that opens the most postings next, see the <Link href="/skills/">skill map</Link>. For how the postings are collected, see <Link href="/market/">Market pulse</Link>.</TH></p>
      </div>
    </section>
  );
}
