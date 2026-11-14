import type { Metadata } from "next";
import Link from "next/link";
import { McpCourse } from "@/components/mcp-doc";
import { docs } from "@/data/docs";
import { share } from "@/lib/share";
import { M } from "@/lib/market-data";
import { tools } from "@/data/tools";
import { certs, courses } from "@/data/certificates";
import jargon from "@/data/content/jargon.json";
import sources from "@/data/doc-sources.json";

export const metadata: Metadata = { ...share("docs/mcp"), title: "MCP: one plug for every tool", description: "The Model Context Protocol, an animated doc: hosts, clients and servers, tools, resources and prompts, the handshake, messages, transports, OAuth, safety and your first server." };

const isMcp = (s: string) => /\bMCP\b|model context protocol/i.test(s);

/** Where MCP shows up on the rest of the site: the end of the doc links into each place. */
function Wired() {
  const ad = M.tools.find((t) => t.name === "MCP");
  const agents = M.skills.find((s) => s.id === "agents");
  const mcpTools = tools.filter((t) => isMcp(`${t.name} ${t.summary} ${(t.tags ?? []).join(" ")}`)).length;
  const terms = (jargon as { terms: { term: string; short: string; tags?: string[] }[] }).terms.filter((t) => isMcp(`${t.term} ${t.short} ${(t.tags ?? []).join(" ")}`));
  const proofs = [...certs, ...courses].filter((c) => isMcp(c.what));
  const cards = [
    ad && { href: "/market/", n: `${ad.n}`, l: "AI job ads name MCP", s: `${Math.round((ad.n / M.totals.processed) * 100)}% of ${M.totals.processed.toLocaleString("en-US")} since 1 Oct 2026` },
    agents && { href: "/skills/agents/", n: `${agents.share}%`, l: "ask for agents and tool use", s: "the skill MCP belongs to" },
    { href: "/tools/?q=MCP", n: String(mcpTools), l: "MCP tools on the map", s: "servers, SDKs, gateways and registries" },
    { href: "/jargon/?field=agents", n: String(terms.length), l: "terms to know", s: terms.map((t) => t.term).join(", ") },
    proofs.length > 0 && { href: "/certificates/?track=build", n: String(proofs.length), l: proofs.length === 1 ? "certificate or course covers it" : "certificates and courses cover it", s: proofs.map((c) => c.name).join(", ") },
    { href: "/docs/claude-platform/", n: "08", l: "pages on the Claude Platform", s: "the API an MCP app usually talks to" },
  ].filter(Boolean) as { href: string; n: string; l: string; s: string }[];
  return (
    <div>
      <span className="kicker">Where MCP shows up on this site</span>
      <h2 style={{ marginTop: 10 }}>From the doc to the job<span className="dot">.</span></h2>
      <div className="frame wd-grid">
        {cards.map((c) => (
          <Link key={c.href} href={c.href} className="wd-card">
            <b>{c.n}</b><span className="wd-l">{c.l} <span aria-hidden="true">→</span></span><span className="count">{c.s}</span>
          </Link>
        ))}
      </div>
      <style>{`
        /* one abacus frame, cells split by hairlines; only the headline number is red */
        .wd-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); padding: 6px 8px; margin-top: 22px; }
        @media (max-width: 860px) { .wd-grid { grid-template-columns: minmax(0, 1fr); } }
        .wd-card { display: flex; flex-direction: column; gap: 4px; padding: 20px 22px; text-decoration: none; color: inherit; border-radius: 4px; transition: background .2s; }
        .wd-card:hover { background: var(--paper); } .wd-card:hover .wd-l { color: var(--rust-deep); }
        @media (min-width: 861px) { .wd-card:not(:nth-child(3n+1)) { border-left: 1px solid var(--line); } .wd-card:nth-child(n+4) { border-top: 1px solid var(--line); } }
        @media (max-width: 860px) { .wd-card + .wd-card { border-top: 1px solid var(--line); } }
        .wd-card b { font-size: 2.2rem; font-weight: 800; letter-spacing: -.04em; line-height: 1; color: var(--ink); }
        .wd-card:first-child b { color: var(--rust); }
        .wd-l { font-weight: 700; } .wd-l span { color: var(--rust); } .wd-card .count { font-size: .74rem; }
      `}</style>
    </div>
  );
}

export default function Mcp() {
  const d = docs.find((c) => c.id === "mcp")!;
  const src = sources.docs.find((x) => x.id === "mcp");
  return (
    <section className="section">
      <div className="wrap">
        <Link href="/docs/" className="count" style={{ textDecoration: "none" }}>← All docs</Link>
        <div className="kicker" style={{ marginTop: 26 }}>Doc · {d.pages.length} pages</div>
        <h1 style={{ marginTop: 12 }}>MCP: one plug for every tool<span className="dot">.</span></h1>
        <p className="lead" style={{ marginTop: 16, maxWidth: "60ch" }}>How AI apps reach tools and data, one animation at a time. Press play, or step through.</p>
        <div style={{ marginTop: 30 }}><McpCourse end={<Wired />} /></div>
        <p className="count" style={{ marginTop: 34 }}>
          From the <a href="https://modelcontextprotocol.io/specification">MCP specification</a>{src?.latest ? <>, latest version {src.latest}</> : null}. Checked against its sources every month{src?.checked ? <>, last on {src.checked}</> : null}.
        </p>
      </div>
    </section>
  );
}
