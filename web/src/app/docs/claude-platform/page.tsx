import type { Metadata } from "next";
import sources from "@/data/doc-sources.json";
import Link from "next/link";
import { ClaudeApiCourse } from "@/components/claude-platform-doc";
import { docs } from "@/data/docs";
import { share } from "@/lib/share";

export const metadata: Metadata = { ...share("docs/claude-platform"), title: "How your app talks to Claude", description: "Claude Platform, an animated doc: requests, SDKs, cloud options, pages, limits and receipts, in plain words." };

export default function ClaudePlatform() {
  const ci = docs.findIndex((c) => c.id === "claude-platform");
  const src = sources.docs.find((x) => x.id === "claude-platform");
  return (
    <section className="section">
      <div className="wrap">
        <Link href="/docs/" className="count" style={{ textDecoration: "none" }}>← All docs</Link>
        <div className="kicker" style={{ marginTop: 26 }}>Doc · {docs[ci].pages.length} pages</div>
        <h1 style={{ marginTop: 12 }}>How your app talks to Claude<span className="dot">.</span></h1>
        <p className="lead" style={{ marginTop: 16 }}>From the first request to the receipt that comes back, one animation at a time. Press play, or step through.</p>
        <div style={{ marginTop: 34 }}><ClaudeApiCourse /></div>
        <p className="count" style={{ marginTop: 34 }}>Written from the official <a href="https://platform.claude.com/docs/en/api/overview">Claude API overview</a>. Checked against its sources every month{src?.checked ? <>, last on {src.checked}</> : null}. Next: <Link href="/docs/mcp/">MCP, how Claude reaches your tools</Link>.</p>
      </div>
    </section>
  );
}
