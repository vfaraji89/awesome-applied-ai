import type { Build, Stage } from "@/lib/types";

export const stages: Stage[] = [
  {
    id: "frame",
    n: "01",
    name: "Frame",
    question: "What decision changes when this ships?",
    decides:
      "The baseline you have to beat and the unit you will be judged in. Cost per resolved case, minutes saved per reviewer, percent of queue handled without a human.",
    trap: "Starting from the model instead of the decision. A system with no named baseline cannot be shown to work, so it gets judged on demos.",
    problems: ["proving-the-pipeline-is-better"],
  },
  {
    id: "source",
    n: "02",
    name: "Source",
    question: "Where does the data actually live, and what may you do with it?",
    decides:
      "Freshness budget, update volume per day, tenancy boundaries, and which fields you are not allowed to send anywhere.",
    trap: "Discovering after the pipeline is built that the corpus changes 2% per day, which turns a one-off embedding job into a standing bill.",
    layer: "retrieval",
    problems: ["incremental-re-embedding", "multi-tenant-isolation"],
  },
  {
    id: "ground",
    n: "03",
    name: "Ground",
    question: "How does a query become evidence the model can use?",
    decides:
      "Index memory budget, chunk boundaries, filter selectivity, and whether you need a graph at all. Almost always the answer is no.",
    trap: "Naming a vector database before computing rows x dims x bytes. Quantization moves that number by 30x; the engine moves it by a little.",
    layer: "retrieval",
    problems: [
      "catalog-retrieval-at-scale",
      "filter-selectivity-collapse",
      "chunking-a-mixed-corpus",
      "the-query-routing-layer",
      "fusion-is-not-the-tuning-knob",
      "when-graphrag-earns-its-cost",
    ],
  },
  {
    id: "assemble",
    n: "04",
    name: "Assemble",
    question: "What goes in the window, in what order, at what price?",
    decides:
      "The stable prefix, the cache hit rate you can realistically hold, and the point where stuffing the window beats retrieving into it.",
    trap: "Rebuilding the prompt prefix on every call. One reordered block turns a cache hit into a cache write, and the write costs more than the read it replaced.",
    layer: "caching",
    problems: ["the-long-context-trade-point", "the-mcp-caching-contract"],
  },
  {
    id: "orchestrate",
    n: "05",
    name: "Orchestrate",
    question: "One call, a chain, or several agents?",
    decides:
      "Topology, tool surface, budget gates, and what happens when step four fails after step three already charged a customer.",
    trap: "Reaching for multiple agents on a task with a single dependency chain. Every handoff is a lossy serialization of context you already had.",
    layer: "orchestration",
    problems: [
      "when-multi-agent-is-wrong",
      "topology-and-context-isolation",
      "loop-termination-and-budget-gates",
      "tool-namespace-explosion",
      "handoff-contracts",
      "compensation-mid-flight",
    ],
  },
  {
    id: "prove",
    n: "06",
    name: "Prove",
    question: "Is the new thing better than the old thing on your data?",
    decides:
      "A labelled set drawn from real traffic, the metric that gates release, and the sample size that makes a 2 point difference mean something.",
    trap: "Reporting generation quality as evidence retrieval improved. recall@k is the ceiling on everything downstream, and it is measured separately.",
    layer: "evaluation",
    problems: ["proving-the-pipeline-is-better", "reproducing-a-failure"],
  },
  {
    id: "serve",
    n: "07",
    name: "Serve",
    question: "What does it cost at real concurrency, and how fast is P95?",
    decides:
      "Where the cheap path ends and the expensive one starts. Most production systems are a cascade, and the cascade is designed here or discovered in the incident.",
    trap: "Sizing on P50. The tail is where the timeouts, the retries and the duplicated spend live.",
    layer: "caching",
    problems: ["the-long-context-trade-point"],
  },
  {
    id: "govern",
    n: "08",
    name: "Govern",
    question: "Who signs off, what is logged, and how do you replay a bad answer?",
    decides:
      "Review queue design, audit trail, retention, and the approval that has to survive a three day pause without losing state.",
    trap: "Bolting on a human review step at the end. If a reviewer cannot see why the system answered that way, the queue becomes a rubber stamp.",
    layer: "governance",
    problems: ["approval-across-a-long-pause", "reproducing-a-failure"],
  },
];

export const stageById = new Map(stages.map((s) => [s.id, s]));

export const builds: Build[] = [
  {
    id: "count-your-own-repo",
    name: "Count your own repository",
    stage: "frame",
    builds:
      "A script that tokenizes every file in a repo you know well and reports the distribution, the ten biggest files, and what a full read would cost at current prices.",
    teaches:
      "Token accounting as a habit. After this you stop guessing whether something fits and start knowing.",
    measure: "Total tokens, and the dollar cost of one full pass.",
    effort: "An evening",
  },
  {
    id: "search-your-notes",
    name: "Search your own notes two ways",
    stage: "ground",
    builds:
      "BM25 over your markdown notes, then embeddings over the same corpus, then both fused. Ten queries you already know the right answer to.",
    teaches:
      "Why lexical search keeps winning on rare terms, and why fusion raises recall without touching precision.",
    measure: "recall@10 for each of the three, on your own ten queries.",
    effort: "A weekend",
  },
  {
    id: "chunk-a-messy-pdf",
    name: "Chunk one genuinely messy PDF",
    stage: "ground",
    builds:
      "A parser for a document with tables, footnotes and multi column layout. Compare fixed size splits against structure aware splits.",
    teaches:
      "That chunking is where most retrieval quality is won or lost, and that it is unglamorous parsing work.",
    measure:
      "How many of the tables survive intact, counted by hand. This number is usually worse than you expect.",
    effort: "A weekend",
  },
  {
    id: "watch-a-cache",
    name: "Watch a prompt cache pay or fail",
    stage: "assemble",
    builds:
      "The same task run twice, once with a stable prefix and once with the blocks shuffled. Log the cached and uncached token counts from the API response.",
    teaches:
      "That caching is a property of prompt construction, not a setting you enable.",
    measure: "Hit rate and cost delta across fifty calls.",
    effort: "An evening",
  },
  {
    id: "one-agent-three-tools",
    name: "One agent, three tools",
    stage: "orchestrate",
    builds:
      "An MCP server exposing three tools over data you own, then a single agent that uses them. Resist adding a fourth.",
    teaches:
      "How much a tool description costs in the prefix, and how quickly a wide tool surface degrades selection.",
    measure:
      "Tokens spent on tool definitions per turn, and selection accuracy over twenty tasks.",
    effort: "A weekend",
  },
  {
    id: "golden-set",
    name: "Build a golden set from your own traffic",
    stage: "prove",
    builds:
      "Fifty real queries, labelled by you, split into an easy half and a hard half. Then a script that runs any change against them.",
    teaches:
      "That the labelling is the work, and that fifty honest examples beat a thousand synthetic ones.",
    measure: "Pass rate on the hard half. Track it across every change you make.",
    effort: "Two weekends, and it never really finishes",
  },
  {
    id: "local-model-measured",
    name: "Run a local model and measure it properly",
    stage: "serve",
    builds:
      "A small model on your own machine, benchmarked at batch size 1 and at concurrency 8, with memory and tokens per second recorded.",
    teaches:
      "Where the latency actually goes, and how far a 7B model gets you on a task you care about.",
    measure: "Tokens per second at both concurrencies, and peak resident memory.",
    effort: "An evening",
  },
  {
    id: "redact-before-you-send",
    name: "Redact before you send",
    stage: "govern",
    builds:
      "A pre flight pass that strips identifiers from a request, plus a log that records what was stripped without recording the values.",
    teaches:
      "The shape of every data protection conversation you will have in an enterprise.",
    measure:
      "False negatives on a hundred hand checked samples. One miss is the whole story.",
    effort: "A weekend",
  },
];
