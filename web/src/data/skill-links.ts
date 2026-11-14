/* Where each skill leads on this site: the tool-map use cases that practise it, the jargon fields
   that explain it, the certificate track that proves it, and the architecture layers whose
   problems test it, and the doc on this site that teaches it. An editorial mapping of the site's own sections, used for the next steps on
   each skill's page. */
import type { LayerId } from "@/lib/types";

export const SKILL_LINKS: Record<string, { use: string[]; jargon: string[]; track: "start" | "build" | "ml" | "gov"; layers: LayerId[]; doc?: { href: string; name: string; pages: number } }> = {
  software:     { use: ["coding", "production"], jargon: ["production"], track: "build", layers: ["orchestration"] },
  data:         { use: ["data"], jargon: ["data"], track: "ml", layers: ["retrieval", "memory"] },
  retrieval:    { use: ["rag", "documents"], jargon: ["retrieval"], track: "build", layers: ["retrieval"] },
  agents:       { use: ["agents"], jargon: ["agents"], track: "build", layers: ["orchestration", "memory"], doc: { href: "/docs/mcp/", name: "Model Context Protocol", pages: 10 } },
  context:      { use: ["production", "coding"], jargon: ["serving", "llm"], track: "build", layers: ["caching", "memory"], doc: { href: "/docs/claude-platform/", name: "Claude Platform", pages: 8 } },
  evals:        { use: ["production"], jargon: ["evaluation"], track: "build", layers: ["evaluation"] },
  security:     { use: ["trust"], jargon: ["governance"], track: "gov", layers: ["governance"] },
  models:       { use: ["training", "production"], jargon: ["training", "serving", "llm"], track: "ml", layers: ["caching"] },
  "ai-dev":     { use: ["coding"], jargon: ["agents"], track: "build", layers: ["orchestration"], doc: { href: "/docs/mcp/", name: "Model Context Protocol", pages: 10 } },
  product:      { use: ["assistants", "agents"], jargon: ["evaluation"], track: "start", layers: ["evaluation"] },
  customer:     { use: ["assistants", "agents"], jargon: ["production"], track: "start", layers: ["governance"] },
  architecture: { use: ["production", "agents", "rag"], jargon: ["production", "agents"], track: "build", layers: ["orchestration", "retrieval", "caching", "memory", "evaluation", "governance"], doc: { href: "/docs/mcp/", name: "Model Context Protocol", pages: 10 } },
};
