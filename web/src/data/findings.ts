export interface Finding {
  claim: string;
  because: string;
  href: string;
}

export const findings: Finding[] = [
  {
    claim: "Multiple agents are usually the wrong answer.",
    because:
      "On a task with a single dependency chain, every handoff is a lossy serialization of context one agent already held.",
    href: "/problems/when-multi-agent-is-wrong/",
  },
  {
    claim: "Reciprocal rank fusion is sold as a precision fix. It is a recall fix.",
    because:
      "It raises the chance the right chunk is somewhere in the candidate set. What it lands next to the query is decided later, by the reranker.",
    href: "/problems/fusion-is-not-the-tuning-knob/",
  },
  {
    claim: "Quantization moves the index budget more than the engine choice does.",
    because:
      "500 million vectors at 1024 dimensions spans two terabytes at fp32 and sixty four gigabytes at binary. No database closes a 30x gap.",
    href: "/problems/catalog-retrieval-at-scale/",
  },
  {
    claim: "Below one percent selectivity, the ANN graph is dead ends.",
    because:
      "Filtered traversal keeps rejecting neighbours until the search gives up early. An exact scan over the filtered set is both faster and correct.",
    href: "/problems/filter-selectivity-collapse/",
  },
  {
    claim: "Long context beats retrieval only on small, shared, cacheable corpora.",
    because:
      "Per query corpora have no stable prefix, so every call pays the cache write multiplier instead of the read discount.",
    href: "/problems/the-long-context-trade-point/",
  },
  {
    claim: "Most MCP server roundups still link to archived repositories.",
    because:
      "The GitHub, GitLab, Postgres, SQLite, Slack, Redis and Drive reference servers were moved to an archive. Several have first party replacements.",
    href: "/kit/#mcp",
  },
];
