import type { LayerId } from "@/lib/types";

export type SkillStep = {
  label: string;
  detail: string;
};

export type Skill = {
  id: string;
  name: string;
  layer: LayerId;
  lede: string;
  /** The question this skill answers, phrased the way it gets asked. */
  asks: string;
  /** What it computes before it will name a tool. */
  computes: string;
  steps: SkillStep[];
  fails: string[];
};

export const skills: Skill[] = [
  {
    id: "retrieval-architecture",
    name: "Retrieval architecture",
    layer: "retrieval",
    lede: "Sizing, selectivity and engine choice for retrieval over a large corpus.",
    asks: "Our vector search returns irrelevant chunks and burns the token budget. What do we change?",
    computes: "Index memory budget, then the filter selectivity histogram.",
    steps: [
      {
        label: "Compute the memory budget",
        detail:
          "rows × dims × bytes_per_component, plus rows × M × 8 for the graph. 500M × 1024 spans 2 TB at fp32 and 64 GB at binary — the quantization choice decides more than the engine does.",
      },
      {
        label: "Pull the selectivity histogram",
        detail:
          "From the query log, not an estimate. Above 10% filtered ANN holds; 1–10% needs a wider search; below 1% the graph is dead ends and an exact scan is faster.",
      },
      {
        label: "Choose the engine",
        detail:
          "Only now, and against what each one costs you — operational weight, a sync pipeline, a query language, a data model you adopt wholesale.",
      },
      {
        label: "Fix relevance in the right stage",
        detail:
          "Fusion is recall. Precision and token spend close later: cross-encoder rerank, an absolute score threshold that can return nothing, then a hard token ceiling.",
      },
      {
        label: "Decide RAG vs long context honestly",
        detail:
          "Long context wins on small shared corpora that cache. It loses on large per-query ones, where there is no stable prefix and every call pays the cache-write multiplier.",
      },
      {
        label: "Prove it before cutting over",
        detail:
          "recall@k is the ceiling on everything downstream. Bootstrap labels with inverse cloze, then shadow-and-diff on the queries where old and new disagree.",
      },
    ],
    fails: [
      "Naming an engine before computing the memory budget.",
      "Treating reciprocal rank fusion as a precision fix. It is recall.",
      "Estimating selectivity instead of reading it off the query log.",
      "Reporting generation quality as evidence that retrieval improved.",
      "Assuming long context is cheaper because the corpus fits in the window.",
    ],
  },
];

export const skillById = new Map(skills.map((s) => [s.id, s]));
