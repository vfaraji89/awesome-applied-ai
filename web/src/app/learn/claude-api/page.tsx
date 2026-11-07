import type { Metadata } from "next";
import Link from "next/link";
import { ClaudeApiCourse } from "@/components/claude-api-course";

export const metadata: Metadata = { title: "The Claude API, animated", description: "A short animated course on the Claude API: endpoints, headers, SDKs, platforms, pagination and rate limits." };

export default function ClaudeApi() {
  return (
    <section className="section">
      <div className="wrap">
        <Link href="/learn/" className="count" style={{ textDecoration: "none" }}>← All courses</Link>
        <div className="kicker" style={{ marginTop: 16 }}>Course · 8 lessons</div>
        <h1 style={{ marginTop: 12 }}>The Claude API, animated<span className="dot">.</span></h1>
        <p className="lead" style={{ marginTop: 16 }}>How your app talks to Claude, explained with everyday comparisons and one short animation per lesson. No coding background needed. The first three lessons are free.</p>
        <div style={{ marginTop: 34 }}><ClaudeApiCourse /></div>
        <p className="count" style={{ marginTop: 34 }}>Written from the official <a href="https://platform.claude.com/docs/en/api/overview">Claude API overview</a>. Version strings and limits change, so check the docs before you build.</p>
      </div>
    </section>
  );
}
