/** Technical docs, in motion: the docs people skip, turned into short animations, examples and code.
 *  `logo` is a tool name from stack.ts; the cover shows its logo on a white bead. */
export interface Doc {
  id: string;
  name: string;
  logo: string;
  oneLine: string;
  /** Page titles, once the doc is written. Empty while it is coming. */
  pages: string[];
  status: "soon" | "live";
  href?: string;
}

export const docs: Doc[] = [
  {
    id: "claude-platform",
    name: "Claude Platform",
    logo: "Claude Agent SDK",
    oneLine: "How your app talks to Claude, from the first request to the receipt that comes back.",
    pages: ["What it is: an order window", "The doors, and which to use", "The label on every request", "Let a helper do the paperwork", "Buy direct, or through your cloud", "Reading a long list, page by page", "Speed limits and spending caps", "The receipt that comes back"],
    status: "live",
    href: "/docs/claude-platform/",
  },
  { id: "vercel-ai-sdk", name: "Vercel AI SDK", logo: "Vercel AI SDK", oneLine: "Add AI to a TypeScript app: one way to call any model, streaming, tools and agents.", pages: [], status: "soon" },
  { id: "langchain", name: "LangChain & Deep Agents", logo: "LangChain", oneLine: "Agents from building blocks, and the harness that plans, delegates and keeps notes.", pages: [], status: "soon" },
  { id: "mcp", name: "MCP", logo: "MCP", oneLine: "One standard plug between AI apps and the tools and data they use.", pages: [], status: "soon" },
];
