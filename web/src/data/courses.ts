/** Animated courses. The outlines are set; lessons are being animated one at a time. */
export interface Course {
  id: string;
  name: string;
  oneLine: string;
  lessons: string[];
  status: "soon" | "live";
  /** Where the course lives, once it is live. */
  href?: string;
  /** How many lessons, from the start, are free. The rest are locked for the paid course. */
  free?: number;
}

export const courses: Course[] = [
  {
    id: "claude-api",
    name: "The Claude API, animated",
    oneLine: "How your app talks to Claude, in plain words and short animations. No jargon needed.",
    lessons: ["What it is: an order window", "The doors, and which to use", "The label on every request", "Let a helper do the paperwork", "Buy direct, or through your cloud", "Reading a long list, page by page", "Speed limits and spending caps", "The receipt that comes back"],
    status: "live",
    href: "/learn/claude-api/",
    free: 3,
  },
  {
    id: "applied-ai",
    name: "Applied AI, from zero",
    oneLine: "What a model reads, what it costs, and how it becomes a product.",
    lessons: ["What a token is, and what it costs", "The context window is a budget", "Retrieval before generation", "Agents: the loop, the tools, the memory", "Evals from real tasks"],
    status: "soon",
  },
  {
    id: "data-problems",
    name: "Data problems, solved",
    oneLine: "Messy data in, decisions out: the problems every AI project meets.",
    lessons: ["One job, many names: normalising messy text", "When filters kill recall", "Fresh data without re-embedding everything", "People data and salaries, done carefully", "Measure, then decide"],
    status: "soon",
  },
  {
    id: "the-stack",
    name: "The stack, layer by layer",
    oneLine: "Six layers, one request, animated from the guardrail down to the vector index.",
    lessons: ["Guardrails and governance", "Evaluation and observability", "Orchestration and protocols", "Caching and context", "Memory and state", "Retrieval"],
    status: "soon",
  },
];
