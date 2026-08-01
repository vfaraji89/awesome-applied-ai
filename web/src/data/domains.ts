import type { Domain } from "@/lib/types";

export const domains: Domain[] = [
  {
    id: "context-engineering",
    numeral: "I",
    name: "Context engineering",
    question:
      "What goes into the window, what it costs to put it there, and what you can prove about it afterwards.",
    scope: [
      "retrieval",
      "memory & state",
      "caching",
      "orchestration",
      "evaluation",
      "guardrails",
    ],
    status: "written",
    color: "var(--ramp-1)",
    href: "/layers/retrieval/",
    entries: 133,
    target: 133,
  },
  {
    id: "enterprise",
    numeral: "II",
    name: "Enterprise problems & solutions",
    question:
      "The problem as the business states it, the constraint that actually binds, and the thing that breaks six weeks after launch.",
    scope: [
      "problem catalogue",
      "reference architectures",
      "failure post-mortems",
      "build vs buy",
      "procurement traps",
    ],
    status: "drafting",
    color: "var(--ramp-2)",
    entries: 0,
    target: 40,
  },
  {
    id: "serving",
    numeral: "III",
    name: "Model & serving economics",
    question:
      "Which model, on whose hardware, at what tail latency, and what a thousand requests actually cost.",
    scope: [
      "routing & fallback",
      "quantisation",
      "batching & throughput",
      "fine-tune vs prompt",
      "unit economics",
    ],
    status: "planned",
    color: "var(--ramp-3)",
    entries: 0,
    target: 45,
  },
  {
    id: "data",
    numeral: "IV",
    name: "Data foundations",
    question:
      "What you are retrieving from, whether it is clean enough to retrieve from, and whether you are allowed to.",
    scope: [
      "ingestion & parsing",
      "chunking",
      "labelling",
      "synthetic data",
      "lineage & residency",
    ],
    status: "planned",
    color: "var(--ramp-4)",
    entries: 0,
    target: 50,
  },
  {
    id: "delivery",
    numeral: "V",
    name: "Delivery & operating model",
    question:
      "Who ships it, who gets paged at 3am, and who signs the risk acceptance before it reaches a customer.",
    scope: [
      "team shapes",
      "rollout & canarying",
      "incident response",
      "model risk sign-off",
      "vendor management",
    ],
    status: "planned",
    color: "var(--ramp-5)",
    entries: 0,
    target: 30,
  },
];
