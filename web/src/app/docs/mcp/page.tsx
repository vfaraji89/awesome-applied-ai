import type { Metadata } from "next";
import Link from "next/link";
import { McpCourse } from "@/components/mcp-doc";
import { CourseTrailerPlayer } from "@/components/remotion/players";
import { docs } from "@/data/docs";
import { share } from "@/lib/share";

export const metadata: Metadata = { ...share("docs/mcp"), title: "MCP: one plug for every tool", description: "The Model Context Protocol, an animated doc: hosts, clients and servers, tools, resources and prompts, the handshake, messages, transports, OAuth, safety and your first server, in plain words." };

export default function Mcp() {
  const d = docs.find((c) => c.id === "mcp")!;
  return (
    <section className="section">
      <div className="wrap">
        <Link href="/docs/" className="count" style={{ textDecoration: "none" }}>← All docs</Link>
        <div className="frame" style={{ marginTop: 18, padding: 12 }}><CourseTrailerPlayer title={d.name} lessons={d.pages} /></div>
        <div className="kicker" style={{ marginTop: 26 }}>Doc · {d.pages.length} pages</div>
        <h1 style={{ marginTop: 12 }}>MCP: one plug for every tool<span className="dot">.</span></h1>
        <p className="lead" style={{ marginTop: 16 }}>How AI apps connect to tools and data with the Model Context Protocol, from the idea to your first server. Each page is one idea, an everyday comparison, a short animation and a hint you can use today. No coding background needed for the first nine pages; free for everyone.</p>
        <div style={{ marginTop: 34 }}><McpCourse /></div>
        <p className="count" style={{ marginTop: 34 }}>Written from the <a href="https://modelcontextprotocol.io/specification">MCP specification</a> and its documentation. The specification is versioned by date and changes, so check the current version before you build.</p>
      </div>
    </section>
  );
}
