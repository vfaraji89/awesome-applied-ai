/** The course catalogue: four tools, each taught in short animated lessons, in plain language.
 *  `logo` is a tool name from stack.ts; the cover shows its logo on a white bead. */
export interface Course {
  id: string;
  name: string;
  logo: string;
  oneLine: string;
  lessons: string[];
  status: "soon" | "live";
  href?: string;
  /** How many lessons, from the start, are written and ready. Every lesson is free. */
  ready: number;
}

export const courses: Course[] = [
  {
    id: "claude-code",
    name: "Claude Code",
    logo: "Claude Code",
    oneLine: "A coding partner that works in your terminal: what it does, and how to work with it well.",
    lessons: ["What it is: a pair programmer in your terminal", "Your first task, start to finish", "CLAUDE.md: the house rules", "Plan first, then build", "Skills and slash commands", "Hooks: checks that run by themselves", "Subagents: helpers for side jobs", "Connecting your tools with MCP"],
    status: "soon",
    ready: 0,
  },
  {
    id: "claude-platform",
    name: "Claude Platform",
    logo: "Claude Agent SDK",
    oneLine: "How your app talks to Claude, in plain words and short animations. No jargon needed.",
    lessons: ["What it is: an order window", "The doors, and which to use", "The label on every request", "Let a helper do the paperwork", "Buy direct, or through your cloud", "Reading a long list, page by page", "Speed limits and spending caps", "The receipt that comes back"],
    status: "live",
    href: "/learn/claude-platform/",
    ready: 3,
  },
  {
    id: "langchain-deep-agents",
    name: "LangChain & Deep Agents",
    logo: "Deep Agents",
    oneLine: "Building blocks for AI apps, and agents that plan, delegate and keep notes.",
    lessons: ["What LangChain is: a box of building blocks", "Models, prompts and tools", "LangGraph: a flowchart that remembers", "Deep Agents: plan, delegate, write things down", "Helpers and a shared notebook", "Watching it work, step by step"],
    status: "soon",
    ready: 0,
  },
  {
    id: "vercel-ai-sdk",
    name: "Vercel AI SDK",
    logo: "Vercel AI SDK",
    oneLine: "Add AI to a web app in TypeScript: one way to call any model, with answers that stream in.",
    lessons: ["What the AI SDK is", "One call, any model", "Answers that appear as they are written", "Tools: letting the model take a step", "Answers in a fixed shape", "A chat screen in minutes", "Agents with the SDK"],
    status: "soon",
    ready: 0,
  },
];
