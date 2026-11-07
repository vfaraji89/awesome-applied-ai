/** Animated courses. The outlines are set; lessons are being animated one at a time. */
export interface Course {
  id: string;
  name: string;
  oneLine: string;
  lessons: string[];
  status: "soon" | "live";
}

export const courses: Course[] = [
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
