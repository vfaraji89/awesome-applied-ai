# Applied AI System Design

Fifty design problems of the kind asked at Staff and Principal level, each with the constraint that actually decides the answer, an architecture, and the stack. Companion to `stack.md`, which lists the tools; this file says when to reach for them.

Every problem is stated with numbers, because the numbers are what separate a real answer from a diagram. Tool picks are drawn from `stack.md` so the two documents agree. MCP items track specification revision **2026-07-28**.

---

## The fifty

| # | Problem | Section |
|---|---|---|
| 1-4 | Catalog retrieval, filter selectivity, chunking, freshness | Context and retrieval |
| 5-7 | Multi-agent cost, topology, termination | Multi-agent |
| 8-10 | MCP stateless migration, tool namespace, cache contract | Protocol |
| 11-16 | Graph vs vector, query routing, long-context trade point, tenancy, fusion tuning, retrieval evaluation | Context and retrieval |
| 17-20 | Handoff contracts, compensation, human-in-the-loop, durable replay | Multi-agent |
| 21-26 | `server/discover` fleet negotiation, MRTR, tasks extension, supply chain, authorization, transport failure | Protocol |
| 27-33 | Cache-aware prompts, model cascades, budget enforcement, batch vs realtime, fine-tune break-even, self-host break-even, chargeback | Cost |
| 34-39 | p99 decomposition, streaming, backpressure, KV-aware routing, capacity planning, cold start | Latency and serving |
| 40-43 | Session vs long-term memory, temporal invalidation, erasure, state explosion | Memory |
| 44-46 | Bootstrapping evals, trajectory scoring, judge calibration | Evaluation |
| 47-50 | Injection through retrieved content, tenant PII and residency, regulatory classification, incident response | Governance |

Items 1-20 follow. The rest are pending review of these.

---

## 1. Catalog retrieval at 500 million rows

> "Our enterprise database holds 500 million product metadata rows. Standard top-k vector retrieval is returning irrelevant chunks, which causes hallucination and blows through our token budgets. How do you re-architect this context ingestion pipeline to improve accuracy and control cost?"

**The constraint that decides it.** Product metadata is structured. Brand, category, price, dimensions, compatibility, stock — these are columns, not prose. Embedding a row into a chunk and running cosine similarity discards precisely the signal that makes catalog retrieval exact. Most catalog queries are not semantic: "Bosch dishwashers under €700 with a third rack" is a `WHERE` clause with one fuzzy brand match. Vector search should handle the residual, not the primary path.

The stated symptom names the bug. "Irrelevant chunks" at 500M rows is almost always **post-filtering**: retrieve top-100 globally, then apply the tenant and category filter, and three candidates survive. The pipeline pads the context back to k with whatever ranked next, and the model dutifully grounds on garbage.

**Memory arithmetic, which sets the whole architecture.** At 1024 dimensions, fp32:

| Representation | Size | Note |
|---|---|---|
| fp32 | 2.0 TB | not a candidate |
| int8 scalar quantization | 512 GB | ~99% recall retained with rerank |
| binary + rescore | 64 GB | needs a rerank stage to be usable |
| HNSW graph overhead (M=16) | ~64 GB | on top of any of the above |

In-memory HNSW over the full corpus is off the table. This forces one of two choices: quantize hard and rescore, or move to an object-storage-native index. That decision precedes every other one.

**Architecture.**

1. **Collapse cardinality before indexing.** 500M rows are not 500M distinct products. Collapse SKU variants to product models — colour, size and packaging variants share one canonical record. A 10-50x reduction is typical. Retrieve at model level; expand to variants deterministically in SQL afterwards. This is the cheapest accuracy win available and it is usually skipped.
2. **Stop chunking rows.** A product row is not a document. Emit one vector per product from a templated canonical string, and separate vectors only for genuinely long fields — description, review digest, manual excerpt. Chunking structured records is what manufactures "irrelevant chunks."
3. **Query understanding before retrieval.** Extract structured constraints — attributes, numeric ranges, entities — with grammar-constrained decoding on a small model. Route: fully filterable queries go to SQL and never touch the vector index; ambiguous ones go to hybrid. This removes a large fraction of traffic from the expensive path entirely.
4. **Filter inside the ANN traversal, not after it.** The index must accept the predicate and apply it during graph traversal. Qdrant payload filtering, Vespa, and Elasticsearch filtered kNN do this. If your engine only post-filters, over-fetch by the inverse of selectivity or replace the engine.
5. **Two stages: recall, then precision.** BM25 and dense in parallel, fused with RRF, top-100 into a cross-encoder reranker, top-5 to 10 into context. Adding a reranker beats swapping vector databases, consistently.
6. **Budget by tokens, not by k.** Fixed k is what blows the budget. Fill the context to a token ceiling, ordered by rerank score, and stop.
7. **Threshold, then abstain.** If nothing clears the rerank score threshold, return "no confident match" rather than shipping ten weak candidates. This is the hallucination fix — the model hallucinates because you handed it irrelevant context and implied it was relevant.
8. **Pass rows, not prose.** Structured JSON with product IDs. Require citations by ID, then verify every cited ID appears in the retrieved set and reject the response otherwise. A deterministic check, not a judge.
9. **Re-embed on content hash, not on write.** Hash the embedding template output. A price change does not alter the template, so it triggers no re-embedding. Without this, catalog churn re-embeds the corpus continuously.

**Token effect.** Twenty chunks at ~400 tokens is 8,000 tokens of mostly noise. Five structured rows at ~150 tokens is 750. Better accuracy at a tenth of the context.

**Stack.**

| Layer | Pick | Why |
|---|---|---|
| System of record | Postgres | Variants, stock, pricing stay relational |
| Vector | Qdrant, Vespa, or Turbopuffer | Pre-filtered ANN, quantization, object-storage economics |
| Lexical | OpenSearch or Vespa native | RRF fusion partner |
| Embeddings | Qwen3-Embedding | Open weights, Matryoshka dims for cheap rescoring |
| Rerank | bge-reranker-v2-m3 self-host, or Cohere Rerank 4 | The accuracy lever |
| Constrained extraction | XGrammar or llguidance | Query understanding, no schema drift |
| Eval | RAGAS for components, custom ID-grounding check | Citation validity is deterministic; do not judge it |

**Choosing the engine.** Two inputs decide it, and neither is a vendor comparison table.

*Input one: the memory budget*, computed above. It eliminates anything that assumes the working set is resident, and it settles whether you are buying RAM or buying object storage.

*Input two: the selectivity distribution of real filters.* Pull the histogram from the query log rather than estimating it. If most traffic sits above 10% selectivity, filtered ANN carries you. If there is a long tail below 1%, you need an engine that can fall back to exact scan over a materialized ID set — which means you need cardinality statistics, which means a relational planner is in the picture.

| Engine | Earns it when | What it costs you |
|---|---|---|
| Vespa | The catalog *is* the product. Multi-phase ranking, filtering and lexical in one system — this architecture as one config | Operational weight, small talent pool, its own query language |
| Qdrant + OpenSearch + Postgres | You want replaceable parts and explicit control of each stage | Three systems and a sync pipeline between them |
| Turbopuffer or LanceDB | The 2 TB is the thing that hurts, and cheap per-tenant namespaces matter | Newer, higher cold-read latency, less filtering sophistication |
| Elasticsearch or OpenSearch alone | You already run it and the vector half is secondary | Filtered kNN is competent, not best in class |
| Astra DB (IBM) | **You are already on Cassandra.** Colocating vectors with operational rows removes the sync pipeline, and sync pipelines are where staleness bugs live | Cassandra is a partition-key store with no cost-based planner, so there are no cardinality statistics to route between filtered ANN and exact scan. `findAndRerank` does bundle lexical, vector, RRF and rerank into one call, but the lexical half is not Lucene-grade and you adopt the whole data model to get it |
| pgvector alone | Below roughly 50 million vectors | Not this problem |

Adopting Cassandra *for* a catalog search problem, rather than because you already run it, is choosing a data model that fights the query pattern. Note also that DataStax has been IBM since May 2025 and Astra is folding into watsonx.data — a procurement fact rather than a technical one, but it belongs in the decision.

**Where answers fail.** Saying "hybrid search plus a reranker" without addressing pre- versus post-filtering, without noticing the data is structured, and without ever computing how much memory 500M vectors need.

Hybrid retrieval with RRF is the *recall* half only. It reorders a fused candidate list; it does not remove weak candidates, and it has no way to express "nothing here is good enough." The two stated symptoms are precision and cost, and both are closed by what comes after fusion — the rerank stage, the abstain threshold, and the token ceiling. Naming a vendor before naming the memory budget and the selectivity distribution reads as not having worked the problem.

---

## 2. Filter selectivity collapse

> "The same catalog search works fine for broad queries but returns near-empty or nonsensical results whenever a user applies three or more filters. Recall drops off a cliff below roughly 1% selectivity. Diagnose and fix."

**The constraint.** HNSW is a graph. Filtering restricts which nodes are admissible, but the graph's edges were built over the unfiltered corpus. At low selectivity the traversal walks through a neighbourhood where almost nothing qualifies, exhausts its candidate budget, and terminates early with whatever it happened to touch. This is a property of the index, not a bug in your code.

**Three regimes, three answers.**

| Selectivity | Strategy |
|---|---|
| > 10% | Filtered traversal is fine. Push the predicate into the index. |
| 1-10% | Filtered traversal with an inflated `ef_search`, or IVF with partition pruning aligned to the filter. |
| < 1% | Stop using ANN. Fetch the filtered set exactly and brute-force the distances. |

The last row is the answer people miss. Below 1% of 500M is 5M rows — but a *specific* three-predicate filter usually resolves to hundreds or thousands of rows. Exact scan over 2,000 vectors is sub-millisecond. ANN is an optimisation for large candidate sets; when the candidate set is small, it is pure loss.

**Architecture.** Estimate selectivity before choosing a path. Postgres already keeps the statistics; a cardinality estimate from the filter predicate is enough to pick a regime. Route accordingly:

1. Cheap cardinality estimate on the structured predicate.
2. High selectivity → filtered ANN.
3. Low selectivity → materialize IDs from the relational store, fetch vectors by ID, exact distance, done.
4. Partition the index along the highest-cardinality filter you actually use — tenant, category, region — so pruning happens at partition level rather than inside traversal.

**Stack.** Qdrant exposes payload indexes and lets you tune `ef` per query. Vespa expresses this natively as ranking phases with a filter-first query plan. Elasticsearch and OpenSearch expose `num_candidates` for the same knob. pgvector with a partial index per tenant handles the small-partition case well and keeps everything in one system.

**Where answers fail.** Treating it as a tuning problem. No value of `ef_search` rescues a 0.1% filter; the fix is to not use the graph.

---

## 3. Chunking a mixed corpus

> "Our knowledge base is 40% PDFs with tables, 30% Confluence pages, 20% source code, 10% support tickets. One chunking configuration is used for all of it and quality is poor everywhere. What do you change?"

**The constraint.** Chunk size is not a hyperparameter to tune globally. It is a consequence of the document's structure, and these four corpora have nothing structurally in common. A fixed 512-token recursive splitter destroys tables, splits functions from their signatures, and merges unrelated tickets.

**Per-corpus treatment.**

| Corpus | Unit | Failure if you get it wrong |
|---|---|---|
| PDF with tables | Layout-detected block; tables kept whole, serialized to Markdown | A table split across chunks yields rows without headers — the single worst retrieval artifact |
| Confluence | Heading hierarchy, with the heading path prepended to each chunk | Orphaned sections that read as authoritative but lack scope |
| Source code | Syntactic unit: function, class, or module, from a parser | Half a function retrieved is worse than nothing |
| Tickets | Whole ticket, never split; embed a summary, retrieve the thread | Splitting a conversation destroys resolution context |

**The pattern underneath.** Retrieve small, provide large. Embed a precise unit for matching, then expand to its natural container before it reaches the model — the parent section, the full function, the entire ticket. This decouples matching granularity from grounding granularity, and it removes most of the chunk-size argument.

Also prepend context to every chunk: document title, heading path, and for tables the caption and column headers. A chunk that cannot identify itself cannot be reranked well.

**Stack.** Docling for PDFs when per-page cost matters and the documents are local; LlamaParse or Reducto when the documents are genuinely messy and the accuracy is worth the invoice. Chonkie for the chunking strategies themselves — token, semantic, recursive, late. Tree-sitter for code, not a text splitter. Unstructured if the format spread is wider than these four.

**Where answers fail.** Proposing "semantic chunking" as a universal answer. It is a reasonable default for prose and actively wrong for code and tables.

---

## 4. Freshness and incremental re-embedding

> "Our corpus changes 2% per day. Full re-indexing takes 14 hours and costs $8,000. Retrieval quality decays visibly between runs and finance wants the bill halved. Redesign the ingestion pipeline."

**The constraint.** 2% daily change on a corpus that takes 14 hours to rebuild means you are always serving a stale index, and you are re-embedding 98% of documents that did not change. Both problems have the same root: the pipeline is batch-shaped when the data is stream-shaped.

**Architecture.**

1. **Content-addressed embedding.** Hash the exact text that feeds the embedding model. Store the hash alongside the vector. On ingest, recompute the hash; if unchanged, skip. This alone converts a 100% job into a 2% job — the stated $8,000 becomes roughly $160.
2. **Separate the change feed from the crawl.** Change data capture from the source of record — Postgres logical replication, or the platform's webhook — not a nightly re-crawl. The crawl becomes a weekly reconciliation job that catches what CDC missed, not the primary path.
3. **Two-tier index.** A large, rarely-rebuilt base index plus a small, continuously-updated delta index. Query both, fuse results. Merge the delta into the base on a schedule. This is how you get minute-level freshness without touching the expensive structure.
4. **Deletion is the hard part.** Vector indexes tombstone rather than delete; recall degrades and memory does not return until compaction. Track the tombstone ratio and trigger compaction on it, not on a calendar.
5. **Version the embedding model explicitly.** Model upgrades are the one case where you genuinely must re-embed everything. Store the model identifier per vector, run the new model into a shadow index, and cut over on an eval result rather than on completion.

**Stack.** Postgres logical replication or Debezium for CDC. LanceDB and Turbopuffer handle incremental writes against object storage without a rebuild, which is the structural fit here. Qdrant supports live upserts with background optimization. Airflow or Temporal for the reconciliation job — Temporal if the pipeline needs to survive partial failure and resume, which at this size it does.

**Where answers fail.** Optimising the batch job — more workers, bigger machines — rather than eliminating the 98% of it that is redundant.

---

## 5. When multi-agent is the wrong answer

> "A team proposes decomposing an existing single-agent workflow into seven specialized agents. Latency is currently 4 seconds and accuracy 88%. What do you ask before approving, and under what conditions do you reject it?"

**The constraint.** Every agent boundary is a serialization point and a context copy. Seven agents mean at minimum seven model calls in sequence, seven prompt preambles, and six lossy handoffs. If the current call is 4 seconds, the decomposed version is plausibly 15-25 seconds and 3-5x the token cost. That has to buy something.

**The three questions that settle it.**

1. **Is the decomposition parallel or serial?** Parallel fan-out over independent subtasks is the only topology that improves latency. A serial chain of seven specialists is a slower, more expensive prompt chain wearing a costume.
2. **Does each agent need a different tool scope or a different model?** This is the legitimate case. An agent that may only read, and one that may write, are genuinely different security principals. An expensive reasoner and a cheap extractor are genuinely different cost profiles. Splitting for "separation of concerns" alone is not a reason — that is a function, not an agent.
3. **What is lost at each handoff?** Agents communicate in natural language, which is lossy and unvalidated. Seven agents means six opportunities to silently drop a constraint. If the handoff can be a typed schema, the boundary is probably a function call, not an agent.

**When it is right.** Tool scope isolation for security. Context isolation, where a sub-agent burns 50k tokens searching and returns a 500-token summary, keeping the parent window clean — this is the strongest genuine case. Cost tiering. Independent parallel work with a deterministic merge. Different failure and retry semantics per stage.

**When it is wrong.** Latency-sensitive paths. Anything where the subtasks share mutable state. Anything where the "agents" are really steps in a fixed sequence — that is a workflow, and it should be a graph with deterministic edges and model calls at the nodes.

**The reframe.** The useful axis is not "one agent or many" but "how much of this is deterministic." Most production systems are a deterministic workflow with model calls at a few nodes. Push work out of the model, not into more models.

**Stack.** LangGraph if the topology is a state machine with checkpoints. Temporal if durability and replay matter more than agent ergonomics — and at seven stages they do. Reject CrewAI for this: LLM-driven routing makes cost and latency non-deterministic and failures non-reproducible, which is the opposite of what a seven-stage system needs.

**Where answers fail.** Accepting the premise. The interviewer is testing whether you will design the thing you were asked for or the thing that should exist.

---

## 6. Topology and context isolation

> "Approved: the workload genuinely needs multiple agents. Design the topology for a research task where a supervisor must dispatch 5-20 parallel searches, and explain how you stop the supervisor's context from exploding."

**The constraint.** Fan-out multiplies context. Twenty sub-agents each returning 10k tokens of findings puts 200k tokens into the supervisor, which is past the point where accuracy degrades measurably regardless of the advertised window — mid-context evidence loses over 30% accuracy, and tool-calling degrades faster than prose retrieval.

**Architecture.**

1. **Sub-agents get private windows and return summaries.** This is the whole point of the pattern. A sub-agent may consume 50k tokens internally; the parent sees a bounded, schema-validated result. Enforce the bound structurally — a `maxTokens` on the returned artifact, not an instruction in the prompt.
2. **Return structured artifacts, not prose.** A typed result with findings, source IDs, and a confidence field is mergeable and validatable. A paragraph is neither.
3. **Write to a shared store, pass references.** Sub-agents persist full findings to a blob or table and return handles. The supervisor reads a handle only if it needs the detail. This turns an O(n) context cost into O(1).
4. **Merge deterministically.** Deduplicate by source ID, sort by confidence, truncate to budget — in code. Using a model to merge twenty results is a second, avoidable, hallucination surface.
5. **Bound the fan-out dynamically.** Five to twenty is a wide range. Let the supervisor propose, then cap by remaining budget: if 18 searches would exceed the cost ceiling, run the 8 highest-value and say so.

**Failure semantics.** Decide explicitly what a partial fan-out means. If 3 of 20 sub-agents fail, does the task fail, retry those three, or proceed degraded with an annotation? This must be a policy in code. Left to the model, it will silently proceed and present partial results as complete.

**Stack.** LangGraph's `Send` API for dynamic fan-out with a reducer on the merge. Claude Agent SDK subagents if you are on Anthropic and want context isolation without building it. Temporal child workflows when each branch needs independent retry and durability. Object storage or Postgres for the artifact store — the handle-passing tier is the part people skip and then regret.

**Where answers fail.** Drawing a supervisor-worker diagram without ever saying what crosses the boundary. The topology is trivial; the payload contract is the design.

---

## 7. Loop termination and runtime budget gates

> "An agent in production entered a tool-call loop and spent $4,000 in nine hours before anyone noticed. Design the controls so this cannot recur, without making the agent give up on legitimately long tasks."

**The constraint.** Observability is not control. Langfuse or LangSmith will show you the loop after the fact; neither stops it. The gate has to be in the execution path, and it has to be enforced by the runtime rather than requested in the prompt.

**Layered controls, cheapest first.**

| Layer | Control | Trips on |
|---|---|---|
| Per-step | Wall-clock and token cap per model call | Runaway single generation |
| Per-run | Cumulative token budget, iteration ceiling | The $4,000 case |
| Per-run | Repeated-state detector | Identical tool call with identical arguments twice |
| Per-tenant | Rolling spend limit over a time window | Many small runs, one abusive tenant |
| Global | Circuit breaker on aggregate spend rate | Provider pricing change, prompt regression |

**The repeated-state detector is the specific fix.** Hash each tool call — name plus normalized arguments. If the same hash appears twice in one run, the agent is not making progress. Second occurrence: inject an observation naming the repetition. Third: terminate. This catches the actual failure mode, which is rarely "too many steps" and almost always "the same step forever."

**Degrade, do not just kill.** A hard kill at the ceiling loses all work. Better: at 80% of budget, switch the system prompt to a summarization instruction and force a final answer with what has been gathered. At 100%, terminate and escalate with the partial state attached. The user gets something, and the state is inspectable.

**Where the gate lives.** In the gateway or the orchestrator, never in the agent. An agent asked to respect its own budget will exceed it — the instruction competes with the task, and the task wins. Enforce in middleware that counts tokens on every request and can refuse.

**Stack.** LiteLLM as the gateway for normalized token accounting and per-key budgets across providers. LangGraph's `recursion_limit` for the crude iteration ceiling, plus a custom reducer for the repeated-state hash. Temporal if you want the budget as workflow state that survives process death. Langfuse for the trace that tells you which prompt change caused it — after the gate has already stopped the bleeding.

**Where answers fail.** Answering "we monitor with Langfuse and set alerts." An alert at 3am is not a control.

---

## 8. Migrating an MCP fleet to the stateless specification

> "We run 40 internal MCP servers on the 2025-11-25 revision. The 2026-07-28 revision removes protocol sessions and the initialize handshake entirely. Plan the migration for a fleet where several servers hold per-connection state."

**What changed, precisely.** Revision 2026-07-28 removes protocol-level sessions and the `Mcp-Session-Id` header. It removes the `initialize` and `notifications/initialized` handshake; every request now carries its protocol version and client capabilities in `_meta` under `io.modelcontextprotocol/protocolVersion` and `io.modelcontextprotocol/clientCapabilities`. List endpoints no longer vary per connection. Servers needing cross-call state must mint explicit handles and accept them back as ordinary tool arguments.

It also removes SSE stream resumability — `Last-Event-ID` and event IDs are gone. A broken response stream loses the in-flight request, and the client must re-issue it with a new request ID.

**The constraint.** "Per-connection state" and "list endpoints vary per connection" are the two patterns the revision deliberately breaks. Any server whose `tools/list` depends on who is asking, or which accumulates state across calls on one connection, needs redesign rather than a version bump.

**Architecture.**

1. **Inventory by state dependency, not by server.** Three buckets: stateless already; state that can become an explicit handle; state that was really per-user authorization. The third bucket is the trap — servers that varied their tool list by caller were doing authorization through the protocol, and that now has to move into the authorization layer proper.
2. **Convert sessions to server-minted handles.** A handle is an opaque, signed, expiring token that the server issues from one tool call and accepts as an argument to the next. Sign it, scope it to a principal, and give it a TTL. It is now part of your tool schema and therefore visible to the model, so it must carry no secrets.
3. **Make list results genuinely uniform.** If the tool list must differ by caller, return the union and enforce permission at call time with a clear denial. Uniform lists are also what makes the caching contract in item 10 work.
4. **Handle the resumability loss explicitly.** Long-running work can no longer survive a dropped stream. Either make the operation idempotent and safe to re-issue, or move it to the tasks extension and poll. Idempotency keys on write-capable tools become mandatory rather than good practice.
5. **Dual-stack during the window.** Servers accept both revisions; clients negotiate via `server/discover`. The version now travels per request, so a server can support both without connection-scoped branching.

**Deprecations to plan around in the same pass.** Roots, Sampling, and Logging are deprecated with a twelve-month minimum window. Migrations: pass directories via tool parameters or resource URIs instead of Roots; call the LLM provider directly instead of Sampling; log to stderr or OpenTelemetry instead of Logging. Dynamic Client Registration is deprecated in favour of Client ID Metadata Documents. HTTP+SSE transport is now formally Deprecated rather than merely discouraged.

**Stack.** A private MCP registry is the precondition for a fleet migration of this shape — you cannot roll a version boundary across 40 servers you do not have an inventory of. Pin by digest. The official SDKs at 2.0 track the new revision. OpenTelemetry for the logging migration, using the newly documented `traceparent`, `tracestate` and `baggage` conventions in `_meta`.

**Where answers fail.** Treating it as a library upgrade. Removing sessions is an architectural change to any server that had them, and the servers that varied their tool list per caller have a security review to do, not a migration.

---

## 9. Tool namespace explosion

> "Our agent has access to 40 MCP servers exposing 400 tools. Tool selection accuracy has fallen below 60% and the tool definitions alone consume 60,000 tokens of every request. Fix both."

**The constraint.** These are two problems with one cause and different solutions. The token cost is fixed by caching (item 10). The selection accuracy is not — a model choosing among 400 near-synonymous tools is doing retrieval, badly, with no reranker.

**Architecture.**

1. **Retrieve tools, do not enumerate them.** Index tool descriptions. At request time, retrieve the 15-30 relevant tools and expose only those. This is ordinary retrieval and it responds to ordinary retrieval technique — hybrid search, reranking, a threshold.
2. **Tier by frequency.** A small always-present core of high-frequency tools, plus a retrieved tail. The core stays in the cached prefix; the tail varies. This preserves most of the cache benefit while keeping selection tractable.
3. **Namespace and deduplicate.** Forty servers will have four `search` tools and three `get_user`. Prefix by server and, more importantly, resolve the genuine duplicates — the accuracy loss is largely the model picking a plausible wrong one among identical-sounding options.
4. **Treat descriptions as the prompt they are.** Tool descriptions and parameter metadata are model-facing text that is rarely reviewed. Enforce a house style: what it does, when to use it, when *not* to use it, and one example. The negative case is what disambiguates siblings.
5. **Progressive disclosure for large surfaces.** A single `list_capabilities` tool that returns a compact menu, followed by a call that expands one area, beats 400 definitions in the preamble. Costs a round trip, buys the window back.

**Measure selection, not schema conformance.** Grammar-constrained decoding has made JSON validity a non-issue; it tells you nothing about whether the right tool was chosen with the right arguments. Build a labelled set of query-to-correct-tool pairs and score selection directly. Sixty percent is only actionable once you know whether it is retrieval failure, description ambiguity, or argument construction.

**Security note that belongs in the same review.** Tool descriptions are an injection surface — tool poisoning, where instructions hidden in descriptions or parameter metadata reach the model but never the user, is an OWASP-catalogued class, with cross-tool poisoning and rug-pull server updates as variants. Forty servers is forty supply chains. Review tool metadata as code, pin by digest, and gate write-capable tools behind approval.

**Stack.** Any vector store for the tool index — this is a tiny corpus, so pgvector or an in-process index is sufficient. FlashRank for CPU-only reranking at negligible latency. A private registry for pinning. promptfoo for the selection eval matrix.

**Where answers fail.** Fixing the token cost with caching and declaring victory. Caching a 60,000-token preamble makes the wrong answer cheap.

---

## 10. The MCP caching contract

> "Under revision 2026-07-28, `tools/list` results carry `ttlMs` and `cacheScope`, and servers should return tools in deterministic order. Design a client-side caching layer for a fleet serving a million agent calls a day, and explain what deterministic ordering has to do with cost."

**What the specification now provides.** `tools/list`, `prompts/list`, `resources/list`, `resources/read`, and `resources/templates/list` return a `CacheableResult` with two required fields. `ttlMs` is a freshness hint in milliseconds. `cacheScope` is `"public"` or `"private"` and controls whether a shared intermediary may cache the response. These complement `listChanged` notifications rather than replacing them. Separately, servers SHOULD return tools in a deterministic order explicitly to improve LLM prompt cache hit rates.

**Why ordering is a cost question.** Provider prompt caches match on exact prefixes. One reordered tool definition changes a byte in the preamble and invalidates everything below it. Cached input reads cost roughly a tenth of fresh input across all three major providers; Anthropic additionally charges 1.25x to write a five-minute cache and 2.0x for an hour. So a nondeterministically-ordered tool list does not merely miss the cache — it pays the write multiplier repeatedly, which is worse than not caching at all.

At 30,000 tokens of tool definitions and a million calls a day, the gap between a stable and an unstable preamble is roughly an order of magnitude on the largest single line of the bill. This is the highest-leverage item on this list and it is a sorting function.

**Architecture.**

1. **Two distinct caches.** A protocol cache (client-side, honouring `ttlMs` and `cacheScope`) and the provider prompt cache (server-side, keyed on prefix bytes). They are unrelated mechanisms and both matter. Do not conflate them.
2. **Respect `cacheScope` strictly.** `"private"` must not enter a shared tier. In a multi-tenant gateway this is a data-isolation control, not a performance hint. Key private entries by principal.
3. **Canonicalize before hashing.** Sort tools by a stable key, canonicalize JSON — key order, whitespace, number formatting — then serialize. Never trust the server's ordering even though it SHOULD be deterministic; normalize on receipt.
4. **Layer the preamble by volatility.** Most static first: system prompt, then core tool definitions, then retrieved tools, then conversation. Cache breakpoints go at the boundaries. Anything that changes per request belongs below every breakpoint.
5. **Treat `ttlMs` as a hint, `listChanged` as truth.** Subscribe via `subscriptions/listen` for `toolsListChanged` where the server supports it, and fall back to TTL polling where it does not. TTL alone gives you a stale window equal to the TTL; the notification closes it.
6. **Instrument the hit rate as a first-class metric.** Cache hit ratio on the prompt cache belongs on the same dashboard as latency and error rate. A prompt change that drops it from 90% to 20% is a ten-fold cost regression that no functional test will catch.

**Stack.** LiteLLM to normalize cache headers and token accounting across providers. Langfuse to track hit rate per prompt version, which is what makes a regression attributable. Anthropic's `count_tokens` endpoint for billing-accurate measurement including tool definitions — it is free, and estimating tool-definition cost with a tokenizer library will be wrong.

**Where answers fail.** Describing an HTTP cache and stopping. The question is whether you know that provider prompt caching and protocol caching are different systems, and that a sort order is worth a large fraction of the inference bill.

---

## 11. When GraphRAG earns its indexing cost

> "A team wants to replace our RAG with GraphRAG after a proof of concept showed better multi-hop answers. Indexing 2 million documents with LLM-based entity extraction is quoted at $180,000 and three weeks. Approve or reject?"

**The constraint.** GraphRAG's cost sits almost entirely in construction, and construction scales with corpus size times extraction model price. Entity and relationship extraction runs per chunk, then community detection and summarization run over the result — several model calls per chunk, not one. The benefit only materialises on queries that actually traverse a relationship.

**The number that decides it is not in the question.** What fraction of the query log is genuinely multi-hop? Sample 500 real queries and classify them. In most enterprise corpora it lands between 5% and 15%. Paying $180,000 to improve 10% of traffic, when the other 90% gets no benefit and the index now has to be rebuilt on every corpus change, is a poor trade. Route the multi-hop slice to a graph and leave the rest on vector retrieval.

**Cheaper things that capture most of the benefit.**

1. **Check whether the graph already exists.** If entities are columns in a relational store, you have a graph and it is called a foreign key. LLM extraction to rediscover relationships you already model is the most expensive way to obtain data you own.
2. **Parent-child and document-hierarchy links.** A large share of "multi-hop" is really "this section refers to that section." Structural links are free at ingest time.
3. **Query-time extraction instead of index-time.** Retrieve broadly, extract entities over the retrieved set, expand once. Costs a round trip per query rather than $180,000 once, and it never goes stale.

**The recurring cost people omit.** Rebuild economics. At 2% daily churn a full graph reconstruction is not annual, it is continuous. Incremental graph update is the hard requirement, and the reference implementation does not do it.

**Decision rule.** Approve when multi-hop exceeds roughly a quarter of queries, the corpus is stable, and the relationships are genuinely implicit in prose — legal discovery, incident forensics, research synthesis. Reject when entities are already structured, when the corpus churns daily, or when the proof of concept compared GraphRAG against a naive vector baseline with no reranker, which is the usual reason the proof of concept looked good.

**Stack.** Graphiti for incremental, bitemporal graph construction — the property that makes it viable under churn. Kùzu embedded, or Neo4j when the graph is a shared asset. LightRAG and nano-graphrag as substantially cheaper implementations of the same idea. Microsoft GraphRAG as the reference paper, not the production system.

**Where answers fail.** Debating graph databases. The question is whether you will spend $180,000 without measuring the size of the population it helps.

---

## 12. The query routing layer

> "Every query runs the full pipeline: rewrite, hybrid retrieve, rerank, frontier model. p50 is 3.2 seconds and $0.04 per query. Inspection suggests 60% of queries are trivial and repetitive. Design the router."

**The constraint.** A router is a classifier, and a classifier that costs as much as the path it is protecting has negative value. The router must be at least two orders of magnitude cheaper than the expensive path or the arithmetic never closes. That rules out using a frontier model to route.

**Four tiers, cheapest first.**

| Tier | Mechanism | Cost | Typical share |
|---|---|---|---|
| Exact cache | Normalize, hash, look up | ~0 | 10-20% |
| Semantic cache | Embed, threshold on nearest neighbour | one embedding call | 10-25% |
| Rules | Regex and keyword for known intents | ~0 | more than teams expect |
| Small classifier | Fine-tuned encoder, ~150M params, 5-10 ms on CPU | negligible | the remainder |

Only what survives all four reaches the frontier model.

**The semantic cache is where this goes wrong.** Embeddings that are close are not the same intent. "How do I cancel my subscription" and "how do I cancel a cancellation" sit within a few hundredths of cosine distance and have opposite answers. Three controls: a threshold set from a labelled set rather than by intuition, never caching a personalised or stateful answer, and a per-entry TTL tied to how fast the underlying content changes.

**Escalation must exist and must be measured.** The cheap path needs a way to say "not confident" and hand up. Without it, routing converts a latency win into a silent quality regression. The metric that matters is not router accuracy — it is the **false-cheap rate**, the fraction of queries sent down the cheap path that should have gone up. Weight it heavily, because a query wrongly sent to the expensive path costs four cents while one wrongly sent to the cheap path costs a customer.

**Stack.** Redis or GPTCache for the semantic cache tier. A fine-tuned ModernBERT or DeBERTa encoder for the classifier — this is a classification problem with abundant training data sitting in your logs, not a generation problem. LiteLLM or RouteLLM for the routing layer itself. Langfuse to attribute quality regressions back to routing decisions, which requires recording the tier on every trace.

**Where answers fail.** Proposing an LLM as the router. It reintroduces most of the cost and all of the latency variance you were trying to remove.

---

## 13. The long-context trade point

> "A vendor argues we should drop retrieval entirely and use a 2 million token window. Our per-query corpus fits in about 800,000 tokens. Evaluate the proposal."

**The constraint.** Effective context is materially shorter than advertised context, and this is measured rather than folklore.

| Evidence | Finding |
|---|---|
| NoLiMa (arXiv 2502.05167) | Performance falls sharply past 32K even in models advertising 128K and beyond, once lexical overlap between question and answer is removed |
| Lost in the Middle (arXiv 2307.03172) | Accuracy degrades for evidence placed mid-context and recovers at the head and tail |
| LongFuncEval (arXiv 2505.10570) | Tool-calling degrades faster with context length than prose question answering — directly relevant to agents |
| Chroma Context Rot | Degradation is continuous with length, not a cliff at the documented limit |

**The arithmetic.** 800,000 tokens per query against 5,000 retrieved tokens is a 160x cost difference. Prompt caching does not rescue it: the cache discount applies to a *stable prefix*, and a per-query corpus is by definition not stable. You would be paying the cache write multiplier on every query, which is worse than not caching. Prefill is also roughly linear in tokens, so 800K puts time-to-first-token into whole seconds before the model has produced anything.

**Where long context genuinely wins.** A single document that cannot be chunked without destroying it — a contract, a long statute, one large source file. A stable prefix reused across many queries, where caching does apply. Low query volume where engineering time costs more than tokens. And cases where retrieval *recall* is the bottleneck and you would rather over-retrieve than tune.

**The synthesis, which is the answer.** Long context does not replace retrieval; it makes retrieval cheaper to get right. A larger window tolerates a larger k, less aggressive chunking, and fewer precision heroics. Retrieve into a focused 50,000 to 200,000 token window and place the strongest evidence at head and tail. That captures nearly all of the accuracy benefit at a fraction of the cost, and it degrades gracefully when the corpus grows past any window.

**Where answers fail.** Accepting or rejecting on principle. Ask for the vendor's evidence at 800K on *your* task, then reproduce it with the needle placed at 60% depth rather than at the end.

---

## 14. Multi-tenant isolation in a shared index

> "500 enterprise tenants share one vector index. Legal now requires provable isolation. The largest tenant has 40 million documents, the smallest has 200. Design it."

**The constraint.** The tenant size distribution decides the architecture, and it is a power law. Neither "one index per tenant" nor "one index for all" works — the first pays fixed per-index overhead 500 times for tenants with 200 documents, the second gives the 40-million-document tenant no isolation and lets it starve everyone else.

**Tiered by size.**

| Tier | Tenants | Pattern |
|---|---|---|
| Head | Top ~20 by volume | Dedicated collection or namespace, own resource limits |
| Tail | The remaining ~480 | Shared collection, mandatory partition key, pre-traversal filter |
| Regulated | Whoever contract requires | Dedicated cluster, own region |

**"Provable" is the operative word.** An application-layer convention is not provable. "We always pass `tenant_id`" fails the moment one code path does not, and that path will exist. Provable means the filter cannot be omitted:

1. Per-tenant credentials scoped at the database to a namespace, so an unfiltered query is rejected by the engine rather than by your code.
2. Or a proxy that injects the predicate and refuses any query arriving without one — fail closed, never fail open.
3. Or row-level security enforced by the database, if the scale permits Postgres.

Then test it adversarially. A test that issues a deliberately unfiltered query and asserts a rejection is the artifact legal actually wants.

**Two things that get missed.** *Noisy neighbours*: one tenant's bulk re-index starves the shared collection, so ingestion needs per-tenant rate limits, not just query limits. *Embedding leakage*: embeddings are invertible enough that inversion attacks recover meaningful source text. A shared index holding tenant A's vectors is holding tenant A's data whatever the filters say — which matters for residency and deletion obligations, not just access control.

**Stack.** Qdrant multitenancy with a payload-indexed partition key plus tenant-scoped API keys. Turbopuffer where per-namespace cost is near zero, which is exactly the 480-tenant tail. Postgres row-level security with pgvector if the whole thing fits under about 50 million vectors, in which case the database enforces isolation for you and the argument is over.

**Where answers fail.** Answering with a filter. The question is who enforces the filter, and how you demonstrate that no path bypasses it.

---

## 15. Fusion is not the tuning knob

> "We fused BM25 and dense retrieval with reciprocal rank fusion. Aggregate metrics improved but a set of queries got noticeably worse. The team wants to tune the RRF constant. What do you tell them?"

**The constraint.** RRF discards scores and uses ranks alone. That is its virtue — it needs no score normalization between two incomparable scales — and it is exactly the source of the regression. A document ranked first on overwhelming lexical evidence and one ranked first on marginal semantic similarity contribute identically.

**What actually regressed.** Queries where one retriever is authoritative. An exact SKU, part number or error code is a solved problem for BM25; fusion then drags in semantically plausible, factually wrong neighbours and dilutes a confident result. Tuning the constant trades one query class against another. It cannot fix this, because the information needed to fix it — how confident each retriever was — has already been thrown away.

**Two real fixes.**

1. **Weight per query class**, using the classifier from item 12. Queries containing identifiers weight lexical heavily; natural-language queries weight dense. This is a small, interpretable change.
2. **Stop fusing for ranking at all.** Use both retrievers purely as recall generators, union the candidates, and let a cross-encoder decide the order. The reranker reads the text and does not care which retriever proposed a candidate, so the entire score-comparability problem disappears. This is the cleaner architecture and it is where the accuracy is anyway.

**The measurement error underneath.** An aggregate nDCG improved while a query class broke, and nobody noticed until users did. Stratify every retrieval metric by query class — identifier lookup, attribute filter, natural language, multi-hop — and report per class. An aggregate over a mixed workload hides exactly the regression you need to see.

**Stack.** RRF ships natively in Elasticsearch, OpenSearch and Qdrant, so the fusion itself is not the work. Vespa's multi-phase ranking subsumes the whole pattern. bge-reranker-v2-m3 as the arbiter. Ranx for offline fusion comparison with proper significance testing before anything ships.

**Where answers fail.** Treating fusion as a hyperparameter search. The constant is not where the loss is.

---

## 16. Proving the new pipeline is better

> "Cutover to the redesigned retrieval pipeline is in two weeks. We have no labelled relevance data. How do you show it is an improvement rather than a different set of failures?"

**The constraint.** End-to-end answer quality is the wrong first metric. It conflates retrieval failure with generation failure, and when it drops you cannot tell which half to fix. Decompose before measuring.

**Three metrics, in dependency order.**

| Stage | Metric | Why it comes first |
|---|---|---|
| Retrieval | recall@k, where k is what you actually feed the model | A hard ceiling on everything downstream |
| Reranking | nDCG@10, MRR | Whether the right document reaches the window |
| Generation | Groundedness given the retrieved set | Only meaningful once the set is right |

If recall@20 is 60%, no prompt work reaches 61%. Most teams that believe they have a hallucination problem have a recall problem, and this ordering surfaces that in an afternoon.

**Getting labels in two weeks without annotators.**

1. **Mine the logs.** Clicks, purchases, ticket resolutions and copy events are implicit relevance judgements, and you already have millions. Noisy, free, and large enough for recall measurement.
2. **Generate questions from documents.** Inverse cloze: take a passage, generate a question it answers, and the source passage is the label. Produces a large set cheaply. Biased toward extractive questions, so it supplements a real set rather than replacing one.
3. **Hand-label 200 stratified examples** drawn from real queries, spread across query classes. One day of work, and it is the set that catches regressions the other two miss.

**The cutover mechanism.** Shadow the new pipeline on live traffic, retrieve with both, log both candidate sets, ship neither. Where the sets agree, no risk. Where they disagree, sample and review — that population is small and it is the only part that carries information. This produces a defensible decision in days without a labelled corpus, and it doubles as the regression harness afterwards.

**Stack.** Ranx or trec_eval for IR metrics with significance testing. RAGAS for the generation-stage measures. promptfoo for the comparison matrix in CI. Langfuse for the shadow traces and the disagreement sampling.

**Where answers fail.** Reaching for an LLM judge before measuring recall. The judge will confirm the answers are bad without telling you that the right document was never retrieved.

---

## 17. Handoff contracts between agents

> "Agent A extracts requirements, hands to B which produces a plan, hands to C which executes. Post-mortems keep tracing failures to information silently lost at a handoff. Fix it."

**The constraint.** A natural-language handoff is unvalidated serialization. Each boundary is a lossy encoder with no checksum, and the failure mode is silent omission rather than a visible error — the downstream agent proceeds confidently on incomplete input.

**Treat the handoff as an API.**

1. **The contract is a schema, not a prompt instruction.** JSON Schema or Pydantic, validated by the producer on emit and again by the consumer on receipt. An instruction to "include all constraints" is a wish; a required field is a contract.
2. **Required fields have no defaults.** If A cannot determine `budget_constraint`, it must emit an explicit unknown with a reason. Omission is what goes silent; an explicit unknown is a fact the next agent can act on.
3. **Carry provenance per field.** Record whether a value came from the user's words, a tool result, or the model's inference. C should treat an inferred budget differently from a stated one. This is the highest-value addition on this list and it is almost never done.
4. **Pass a reference to upstream context, not a copy.** B rarely needs A's full transcript, but when it does it should fetch it rather than rely on A having guessed what to include. A handle costs nothing; a guess costs the failure you are debugging.
5. **Version the contract.** Agents deploy independently, so the schema is the compatibility boundary. Treat a field change like a breaking API change.

**How you pin down non-determinism.** Contract tests at each boundary, exactly as with microservices: fixed inputs, assertions on the structured output, run in CI. You cannot assert on prose, which is why the schema matters — it converts an untestable boundary into a testable one.

**Stack.** Grammar-constrained decoding via XGrammar or llguidance so the schema is enforced during generation rather than validated afterwards — a retry loop on validation failure is a worse version of the same thing. Pydantic with instructor for the type layer. LangGraph typed state where the boundary is in-process. Pact-style contract tests where the agents deploy separately.

**Where answers fail.** Proposing a better prompt. The boundary needs a type system, not more adjectives.

---

## 18. Compensation when an agent fails mid-flight

> "An agent with write access to CRM, billing and email failed after step 3 of 5. It had already issued a refund and sent a customer notification. What should the architecture have been?"

**The constraint.** Agents perform side effects in external systems that share no transaction boundary. There is no rollback. You cannot unsend an email, and a refund reverses only as a new business decision.

**Classify every tool at registration time, not at failure time.**

| Class | Example | Compensation |
|---|---|---|
| Reversible | CRM field update | Restore the prior value, captured before the write |
| Compensable | Refund | A counter-transaction, which is a business decision with its own approval |
| Irreversible | Email sent, payment settled, message posted | None. Only prevention and escalation |

**The main design lever is ordering, and it is free.** Do all reversible work first, checkpoint, and commit the irreversible tail last. Most agent workflows can be reordered this way and most are not, purely because nobody classified the tools. In the stated failure, sending the email before the workflow completed was the error, not the failure itself.

**Then, in order of cost.**

1. **Two-phase the irreversible actions.** Prepare, then commit. A failure between phases leaves a draft rather than a sent message and a pre-authorization rather than a settlement.
2. **Idempotency keys on every write.** Retry is the default recovery, and without keys retry means a second refund. This is now sharper under MCP revision 2026-07-28, which removed SSE resumability — a broken stream means re-issuing the request with a new request ID, so the server side must deduplicate or you will double-execute.
3. **Capture prior state before every reversible write.** Compensation for a field update requires the old value, and it is unavailable after the fact.
4. **Human escalation is a legitimate compensation.** For the irreversible-and-failed case, open a ticket carrying full workflow state. Attempting automated repair on an irreversible action is how one incident becomes two.

**Never let the model author the compensation.** Asked to fix its own failure, it will invent a plausible remedy and execute it. Compensations are code, registered alongside the tool, reviewed like any other write path.

**Stack.** Temporal — sagas, compensation handlers, durable state and deterministic replay are precisely its purpose, and this problem is the canonical case for it. Restate as the lighter alternative. Building this on a queue and a state table means reimplementing Temporal without its testing story.

**Where answers fail.** Proposing a try/except around the agent loop. The failure is not the exception; it is the three completed side effects in three systems that do not know about each other.

---

## 19. Human approval across a three-day pause

> "Any transaction above $10,000 requires human approval. Approvers respond in anywhere from four hours to three days. The agent currently holds an open connection and times out. Redesign."

**The constraint.** A multi-day pause cannot live in process memory. The run must suspend to durable storage, release every resource, and resume in a different process — quite possibly a different build, since three days spans at least one deploy.

1. **Interrupt is a state, not an exception.** The run persists its full state, emits the approval request, and exits. Nothing stays resident, nothing holds a connection, and cost during the pause is storage only.
2. **Resumption is an event.** The approval webhook rehydrates state from the checkpoint and continues. Polling for approvals across 10,000 suspended runs is a design you will regret.
3. **State must survive schema change.** Version the persisted state. On resume, either migrate it or fail explicitly with an explanation — never deserialize optimistically into a changed shape.
4. **Re-validate preconditions on resume.** The world moved for three days. The invoice may be paid, the customer may have churned, the price may have changed. Resume means re-check then continue, not continue.
5. **The approval payload is a product surface.** The approver needs a readable diff of what will happen and why, not a JSON dump of agent state. Get this wrong and approvers rubber-stamp, at which point the control is theatre and you have added three days of latency for nothing.
6. **Expiry is a policy decision.** Decide explicitly what happens at day seven — escalate, expire, auto-reject. Auto-approve is never the answer, and leaving it undefined means runs accumulate silently forever.

**Protocol note.** MCP revision 2026-07-28 replaced server-initiated requests with Multi Round-Trip Requests: the server returns an `InputRequiredResult` and the client re-issues the original request carrying `inputResponses`. That is a request-response shape for gathering input, not a suspension mechanism. A three-day approval still needs the tasks extension or your own durable layer underneath — and with SSE resumability removed, holding a stream open is no longer even a bad option, it is not an option.

**Stack.** Temporal signals, which is the textbook fit — a workflow can wait days at no compute cost and receive the approval as a signal. LangGraph `interrupt()` with a Postgres checkpointer if you are already on LangGraph. An in-memory queue is disqualified by the three-day requirement alone.

**Where answers fail.** Designing the happy path and omitting expiry, deploy survival, and precondition revalidation. Those three are the entire difference between a demo and a system.

---

## 20. Reproducing a failure in a non-deterministic system

> "A customer reported an agent failure six days ago. We have traces but cannot re-run it. Design for reproducibility."

**The constraint.** You cannot make the model deterministic. Temperature zero still varies with batch composition, hardware and silent provider-side updates. So do not try to replay the model — replay everything around it.

1. **Record every non-deterministic boundary.** Model responses, tool results, timestamps, random values, retrieved document IDs. Replay feeds the recorded values back instead of re-calling. The orchestration becomes fully deterministic while the model remains whatever it was on the day. This is the central trick and it is what durable execution engines already implement.
2. **Pin model versions explicitly.** `claude-opus-4-7`, never a floating alias. Aliases move, and a six-day-old failure becomes unreproducible for a reason that has nothing to do with your code.
3. **Record resolved inputs, not templates.** The exact bytes sent after templating, retrieval and tool-definition assembly. A trace showing the template and the variables separately is not enough — the bug is often in the join.
4. **Two distinct replay modes, and people conflate them.** *Exact replay* feeds all recorded values and verifies your orchestration logic. *Re-execution* feeds recorded inputs to a live model and tells you whether a model or prompt change fixed the behaviour. You need both and they answer different questions.
5. **Version the retrieval index alongside the code.** "Same code, same model, different answer" is most often a silently updated index. Without an index version in the record the investigation dead-ends.
6. **Sample, because full-fidelity capture is expensive.** 100% of errors, 100% of user-flagged runs, 1-5% of successes. The success sample is what gives you a baseline to compare the failures against.

**Stack.** Temporal for the record-and-replay substrate — deterministic replay is its defining property, not a feature. Langfuse or LangSmith for traces, with the caveat that a trace is an observation and not a replay; they are complementary. Resolved prompts to object storage keyed by trace ID, since tracing backends truncate large payloads exactly when you need them.

**Where answers fail.** Claiming determinism via temperature zero. It is not true, and the architecture that assumes it has no recovery path when it turns out not to be.

---

*Items 21-50 pending review.*
