---
name: retrieval-architecture
description: Use when designing or debugging a retrieval pipeline over a large corpus — choosing a vector engine, fixing irrelevant results, controlling token spend, or deciding between RAG and long context. Computes the constraints before naming a tool.
---

# Retrieval architecture

Most retrieval problems are presented as a quality complaint — "the results are
irrelevant" — and answered with a tool name. The tool is the last decision, not
the first. Two numbers decide almost everything, and neither is a vendor
comparison. Compute both before recommending anything.

## Step 1 — Compute the memory budget

```
index_bytes  = rows × dims × bytes_per_component
graph_bytes  ≈ rows × M × 8          # HNSW at connectivity M, M=16 typical
```

`bytes_per_component` is 4 for fp32, 1 for int8, 1/8 for binary. State which you
assumed — the same corpus spans 2 TB and 64 GB depending on that one choice.

Worked: 500M rows × 1024 dims → **2.0 TB** fp32, **512 GB** int8, **64 GB**
binary, plus ~64 GB of graph at M=16.

This single number eliminates most of the option space. It settles whether you
are buying RAM or buying object storage, and it rules out anything that assumes
the working set is resident. Below roughly 50 million vectors, pgvector inside
your existing Postgres is the answer and the rest of this skill is overkill.

Before accepting `rows`, check whether the corpus has collapsible structure.
Product catalogs, document versions, and localized variants routinely carry
10–50× redundancy — embed the shared parent, store variants as metadata. This is
the cheapest order-of-magnitude available and it is usually skipped.

## Step 2 — Pull the filter selectivity histogram

From the query log. Not an estimate. Selectivity is the fraction of the corpus
surviving the filter, and the regimes are sharp:

| Selectivity | Strategy | Why |
|---|---|---|
| > 10% | Filtered ANN | Enough survivors that graph traversal still converges |
| 1–10% | Inflated `ef_search`, or IVF probe widening | Traversal starts missing; pay for it explicitly |
| < 1% | Abandon ANN, exact scan over a materialized ID set | The graph is mostly dead ends; brute force is genuinely faster |

The failure this predicts: a filtered HNSW query that silently returns fewer
than `k` results, or garbage, because the traversal walked into a region where
every neighbour was filtered out. Post-filtering makes it worse — it retrieves
`k` then discards, so a 1%-selectivity filter on `k=100` returns roughly one row.

If the histogram has a long tail below 1%, you need an engine that can fall
back to exact scan, which means you need cardinality statistics, which means a
cost-based planner is in the picture. That is a real constraint on engine
choice, and it is where most vendor shortlists fall apart.

## Step 3 — Choose the engine

Only now. Columns that matter:

| Engine | Earns it when | What it costs you |
|---|---|---|
| pgvector | Below ~50M vectors, already on Postgres | Nothing. Stop here if you qualify |
| Qdrant + OpenSearch + Postgres | You want replaceable parts and best-in-class filtering | Three systems and a sync pipeline between them |
| Vespa | Ranking is the product; you need multi-phase ML ranking in-engine | Operational weight, small talent pool, its own query language |
| Turbopuffer / LanceDB | The storage bill is what hurts; object-storage-native | Higher cold-read latency, less filtering sophistication |
| Elasticsearch / OpenSearch alone | You already run it and lexical matters as much as dense | Filtered kNN is competent, not best in class |

Naming a vendor before completing steps 1 and 2 reads, in a design review, as
not having worked the problem.

## Step 4 — Fix relevance in the right stage

Hybrid search plus reciprocal rank fusion is correct and is the **recall** half
only. RRF fuses rank positions and discards score magnitude, so it cannot remove
a weak candidate and cannot express "nothing here is good enough." If the
complaint is precision or token spend, the fix lives downstream of fusion:

1. **Cross-encoder rerank** the fused top-100 down to top-10. This is the
   arbiter, and it also dissolves the fusion-weight tuning problem — stop
   tuning the RRF constant, let the reranker decide.
2. **Absolute score threshold** after reranking. This is the only stage that can
   return nothing, which is the correct answer more often than pipelines allow.
3. **Token ceiling** per request, enforced in code. Retrieve small, provide
   large: rank on chunks, then expand the winners to their parent section.

Chunk-level embeddings retrieved and chunk-level text provided is the most
common cause of "technically relevant but useless" context.

## Step 5 — Decide RAG vs long context honestly

The trade point is not "the corpus fits in the window." Two facts:

- Retrieval degrades with distance from the query even inside the window
  (NoLiMa, arXiv 2502.05167; Lost in the Middle, arXiv 2307.03172). A fact at
  position 200k is not equally available to a fact at position 2k.
- Prompt caching requires a **stable prefix**. A per-query corpus is not one.
  Long-context-instead-of-RAG pays the cache-write multiplier on every call,
  which inverts the cost argument that motivated it.

Long context wins when the corpus is small, shared across many queries, and
therefore cacheable. It loses when it is large and per-query.

## Step 6 — Prove it before cutting over

`recall@k` at the retrieval stage is the hard ceiling on everything downstream.
A generation quality metric cannot exceed it and cannot diagnose it. Measure
retrieval separately.

With no labelled set, bootstrap with inverse cloze: take a passage, use it as
the positive, generate a query from it. Weak labels, available today, and enough
to detect a regression. Then run shadow-and-diff — new pipeline alongside old,
same traffic, compare on the queries where they disagree. That is where the
signal is; agreement tells you nothing.

## Freshness

Key embeddings by content hash. Re-embed only on hash change — corpora churn far
less than ingest volume suggests, and full re-embedding runs are almost always
waste. For continuous updates, run a small hot delta index alongside the large
base index, query both, and compact when the tombstone ratio crosses a
threshold you set deliberately rather than on a schedule.

## Where answers fail

- Naming an engine before computing the memory budget.
- Treating RRF as a precision fix. It is recall.
- Estimating selectivity instead of reading it off the query log.
- Reporting end-to-end generation quality as evidence the retrieval improved.
- Assuming long context is cheaper because the corpus fits.
