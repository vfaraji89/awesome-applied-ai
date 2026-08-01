import type { Field, Term } from "@/lib/types";

export const fields: Field[] = [
  {
    id: "llm",
    name: "Model internals",
    tagline: "What the weights are doing",
    intro:
      "The part most candidates can recite and few can compute. The useful depth is not knowing that attention exists, it is knowing which of these terms changes a number you have to budget for: cache size, context cost, or output variance.",
  },
  {
    id: "serving",
    name: "Serving and inference",
    tagline: "Where the money and the latency go",
    intro:
      "Two phases with opposite bottlenecks. Prefill is compute bound and sets time to first token, decode is memory bandwidth bound and sets the rest. Almost every serving decision follows from that split, and almost every vendor benchmark hides which one it measured.",
  },
  {
    id: "retrieval",
    name: "Retrieval and search",
    tagline: "What the model is allowed to know",
    intro:
      "Retrieval quality caps generation quality. If the passage is not in the context, no prompt recovers it. The arithmetic that matters here is index memory, filter selectivity and recall at k, none of which appear in a vector database quickstart.",
  },
  {
    id: "agents",
    name: "Agents and protocols",
    tagline: "Multi-step systems and how they fail",
    intro:
      "The hardest section in a senior loop, because the failure modes are new: compounding step error, runaway tool calls, silent retrieval drift, prompts that regress in ways a test suite never catches. Interviewers here want to hear that you have watched one break.",
  },
  {
    id: "training",
    name: "Training and adaptation",
    tagline: "Changing the weights, and when not to",
    intro:
      "Most production problems are context problems wearing a fine-tuning costume. The vocabulary still matters, because the useful answer is usually why you did not train, and you cannot say that credibly without knowing what LoRA rank or DPO would have cost.",
  },
  {
    id: "evaluation",
    name: "Evaluation",
    tagline: "The part that decides whether you ship",
    intro:
      "Retrieval and generation fail differently and have to be measured separately. Anything reported as one number is hiding which half broke. Classic classification metrics still appear, because a router, a guardrail and a reranker are all classifiers.",
  },
  {
    id: "data",
    name: "Data engineering",
    tagline: "Where the corpus comes from",
    intro:
      "Applied AI interviews assume this layer and rarely teach it. The terms below are the ones that come up when someone asks how the index gets rebuilt, what happens when a source row changes, and who notices when a pipeline silently drops half its rows.",
  },
  {
    id: "production",
    name: "Production and MLOps",
    tagline: "Deploy, observe, roll back",
    intro:
      "Ordinary distributed systems discipline, applied to a component that is non-deterministic, slow, and priced per token. The SRE vocabulary is unchanged. What is new is that a bad release degrades quality silently instead of throwing errors.",
  },
  {
    id: "governance",
    name: "Governance and security",
    tagline: "What you can prove about it",
    intro:
      "Increasingly a technical round rather than a legal one. The frameworks divide cleanly: ISO 42001 is a certifiable management system, NIST AI RMF is an operating model, the EU AI Act is law with dates, and OWASP is a threat taxonomy. Knowing which is which is most of the answer.",
  },
];

export const terms: Term[] = [
  // ------------------------------------------------------------ model internals
  {
    id: "token",
    term: "Token",
    field: "llm",
    short:
      "The unit a model actually reads and bills. Roughly 4 characters of English, far fewer for code, Turkish or any language the tokenizer was not fitted on.",
    detail:
      "Every cost, context and latency figure is denominated in tokens, so the character-to-token ratio for your corpus is a real input to a budget. Non-Latin scripts commonly cost two to three times more tokens per word than English, which quietly changes the economics of the same product in a different market.",
    asked: "How would you estimate the monthly cost of this feature?",
    tags: ["tokenization", "cost", "context"],
  },
  {
    id: "tokenizer",
    term: "Tokenizer",
    field: "llm",
    short:
      "The reversible mapping from text to integer ids, fitted once before pretraining. BPE and its byte-level variants dominate.",
    detail:
      "It is frozen with the model, which is why you cannot add a domain vocabulary without training. It is also why character-level tasks such as counting letters or reversing a string are hard: the model never sees the characters.",
    also: ["BPE", "byte pair encoding", "SentencePiece"],
    tags: ["tokenization", "preprocessing"],
  },
  {
    id: "embedding",
    term: "Embedding",
    field: "llm",
    short:
      "A dense float vector representing a token, a passage or an image, positioned so that semantic similarity becomes geometric proximity.",
    detail:
      "Two different things share the name. The input embedding table inside a model is not the same as the sentence embedding produced by a retrieval model, and they are not interchangeable. Retrieval embeddings are lossy by construction: a paragraph is compressed to one point, so anything the encoder did not weight is unrecoverable.",
    tags: ["vectors", "retrieval", "representation"],
  },
  {
    id: "context-window",
    term: "Context window",
    field: "llm",
    short:
      "The maximum number of tokens in a single forward pass, input plus output. The hard ceiling on what the model can attend to at once.",
    detail:
      "A large advertised window is not usable capacity. Attention quality degrades with position, cost grows with length, and the KV cache for a long prompt can dominate your memory budget. Treat the window as a resource to spend rather than a feature to fill.",
    also: ["context length"],
    tags: ["context", "limits"],
  },
  {
    id: "attention",
    term: "Attention",
    field: "llm",
    short:
      "The operation that lets each token weight every earlier token. Quadratic in sequence length for compute, which is why long prompts cost more than linearly.",
    detail:
      "The interview version is not the formula, it is the consequence: doubling prompt length roughly quadruples prefill compute while the KV cache grows linearly. That asymmetry is the whole reason prefix caching and chunked prefill exist.",
    tags: ["transformer", "compute"],
  },
  {
    id: "gqa",
    term: "Grouped-query attention",
    field: "llm",
    short:
      "Query heads are split into groups that share one key and value pair, cutting KV cache size by the group factor with little quality loss.",
    detail:
      "The default in modern open weights. Multi-head attention gives every head its own KV and is the memory-hungry extreme, multi-query collapses to one shared KV and is the cheap extreme, GQA sits between them. When you compute a KV cache budget, the number of KV heads is the term that matters, not the number of attention heads.",
    also: ["GQA", "MQA", "MHA", "multi-query attention"],
    asked: "Why is the KV cache smaller than the naive calculation suggests?",
    tags: ["transformer", "kv-cache", "memory"],
  },
  {
    id: "mla",
    term: "Multi-head latent attention",
    field: "llm",
    short:
      "Projects keys and values into a low-rank latent space and caches that instead, shrinking the KV cache further than GQA does.",
    detail:
      "Introduced at scale by DeepSeek. Worth knowing because it changes the KV arithmetic enough that memory estimates copied from a Llama-shaped model will be wrong.",
    also: ["MLA"],
    tags: ["transformer", "kv-cache", "memory"],
  },
  {
    id: "rope",
    term: "Rotary position embedding",
    field: "llm",
    short:
      "Encodes position by rotating query and key vectors, so relative distance falls out of the dot product.",
    detail:
      "The reason context extension is possible at all. Scaling the rotation frequencies, as in YaRN or NTK-aware interpolation, stretches a model trained at 4k to run at 128k with modest continued training. Extension does not come free: recall in the stretched region is usually worse than the number suggests.",
    also: ["RoPE", "YaRN", "position encoding"],
    tags: ["transformer", "long-context"],
  },
  {
    id: "flash-attention",
    term: "FlashAttention",
    field: "llm",
    short:
      "An exact attention kernel that tiles the computation to avoid materialising the full attention matrix in high bandwidth memory.",
    detail:
      "Same numbers out, less memory traffic in. It is an implementation detail until you are choosing a serving stack or debugging why a long-context request runs out of memory on hardware that should fit it.",
    tags: ["kernels", "memory", "performance"],
  },
  {
    id: "moe",
    term: "Mixture of experts",
    field: "llm",
    short:
      "Replaces the feed-forward block with many experts and a router that activates a few per token. Total parameters are large, active parameters per token are small.",
    detail:
      "The distinction interviewers probe is total versus active. A model with 400B total and 30B active has the compute cost of a small model and the memory footprint of a very large one, which changes your hardware answer completely. Routing also makes latency less predictable under uneven load.",
    also: ["MoE", "sparse model", "active parameters"],
    asked: "How much GPU memory does this open-weight model need?",
    tags: ["architecture", "memory", "cost"],
  },
  {
    id: "logits",
    term: "Logits",
    field: "llm",
    short:
      "The raw unnormalised scores over the vocabulary at each step, before softmax turns them into a distribution.",
    detail:
      "Everything you can control about output randomness is a transformation applied here. Logprobs, when the provider exposes them, are the only honest confidence signal you get from a generative model, and even then they measure token likelihood rather than truth.",
    also: ["logprobs"],
    tags: ["decoding", "confidence"],
  },
  {
    id: "temperature",
    term: "Temperature",
    field: "llm",
    short:
      "Divides the logits before softmax. Below 1 sharpens the distribution, above 1 flattens it, 0 is effectively greedy.",
    detail:
      "Temperature 0 is not deterministic in practice. Batched GPU kernels reorder floating point reductions depending on what else is in the batch, so identical requests can diverge. Any test that asserts on exact output text will eventually flake for this reason.",
    asked: "Why did the same prompt return a different answer with temperature 0?",
    tags: ["decoding", "determinism"],
  },
  {
    id: "top-p",
    term: "Top-p sampling",
    field: "llm",
    short:
      "Nucleus sampling. Keeps the smallest set of tokens whose cumulative probability reaches p, then samples within it.",
    detail:
      "Adaptive where top-k is fixed: a confident step keeps two candidates, an uncertain one keeps forty. Stacking top-p with a low temperature is common and mostly redundant, since both are narrowing the same distribution.",
    also: ["nucleus sampling", "top-k", "min-p"],
    tags: ["decoding"],
  },
  {
    id: "structured-output",
    term: "Structured output",
    field: "llm",
    short:
      "Constraining generation to a schema by masking invalid tokens at each step, so the output parses by construction.",
    detail:
      "Different from asking for JSON in the prompt, which fails a small percentage of the time and fails worst under load. Constrained decoding removes the parse failure entirely but does not make the content correct, and a tight schema can push the model into filling required fields with plausible nonsense.",
    also: ["constrained decoding", "JSON mode", "grammar", "function calling"],
    tags: ["reliability", "integration"],
  },
  {
    id: "hallucination",
    term: "Hallucination",
    field: "llm",
    short:
      "Fluent output unsupported by the source or by fact. Not a bug in the usual sense, since the objective never asked for truth.",
    detail:
      "In an applied setting the word is too coarse to act on. Split it: retrieval missed the passage, retrieval found it and the model ignored it, or the model answered from parametric memory when it should have declined. Those are three different fixes, and naming which one you saw is the answer an interviewer is listening for.",
    asked: "How would you reduce hallucination in this system?",
    tags: ["failure-modes", "grounding"],
  },
  {
    id: "chain-of-thought",
    term: "Chain of thought",
    field: "llm",
    short:
      "Generating intermediate reasoning tokens before the answer, which buys accuracy on multi-step problems by spending output tokens.",
    detail:
      "Now often built into the model as a reasoning mode rather than prompted. The trade is explicit: latency and cost scale with reasoning length, and the visible trace is a generated artefact rather than a faithful log of the computation, so it is weak evidence in an audit.",
    also: ["CoT", "reasoning tokens", "test-time compute"],
    tags: ["prompting", "cost", "latency"],
  },
  {
    id: "system-prompt",
    term: "System prompt",
    field: "llm",
    short:
      "The instruction block placed ahead of the conversation, given elevated weight by instruction tuning.",
    detail:
      "It is a stable prefix, which makes it the natural anchor for prompt caching and the first thing to keep byte-identical across requests. It is also not a security boundary: anything in it can be extracted, and anything it forbids can be argued with.",
    tags: ["prompting", "caching", "security"],
  },

  // -------------------------------------------------------- serving and inference
  {
    id: "prefill",
    term: "Prefill",
    field: "serving",
    short:
      "The forward pass over the whole input prompt, computed in parallel. Compute bound, and the dominant term in time to first token.",
    detail:
      "Because it is parallel, prefill saturates the GPU and a long prompt from one user delays every other user in the batch. That is the problem chunked prefill exists to solve, by slicing the prompt so decode steps can interleave.",
    asked: "Why did adding a long system prompt hurt latency for everyone?",
    tags: ["latency", "ttft", "compute"],
  },
  {
    id: "decode",
    term: "Decode",
    field: "serving",
    short:
      "Generating output one token at a time, each step reading the entire KV cache. Memory bandwidth bound, not compute bound.",
    detail:
      "This is why decode throughput scales with batch size almost for free: the weights and cache are already being read, so serving more sequences costs bandwidth you were spending anyway. It is also why a bigger GPU with the same bandwidth barely helps.",
    also: ["generation phase"],
    tags: ["latency", "throughput", "bandwidth"],
  },
  {
    id: "ttft",
    term: "Time to first token",
    field: "serving",
    short:
      "Queue wait plus prefill plus the first decode step. What the user experiences as responsiveness.",
    detail:
      "Under load the queueing term usually dominates the model term, which is why a p99 TTFT regression is far more often a capacity or admission problem than a model problem. Report it as a percentile at a stated concurrency or it means nothing.",
    also: ["TTFT"],
    tags: ["latency", "slo"],
  },
  {
    id: "tpot",
    term: "Time per output token",
    field: "serving",
    short:
      "The steady-state gap between streamed tokens. Its inverse is the perceived reading speed.",
    detail:
      "Roughly 40 to 50 milliseconds per token reads as comfortable. TTFT and TPOT trade against each other, since anything that improves batch efficiency for throughput tends to add queueing delay at the front. A serving SLO needs both numbers or it can be gamed.",
    also: ["TPOT", "ITL", "inter-token latency"],
    tags: ["latency", "slo"],
  },
  {
    id: "kv-cache",
    term: "KV cache",
    field: "serving",
    short:
      "Cached key and value tensors for every prior token, so each decode step avoids recomputing the whole sequence.",
    detail:
      "It grows linearly with sequence length and batch size, and it is the resource that actually limits concurrency on a serving box. Size it as 2 (K and V) times layers times KV heads times head dimension times bytes per element times tokens, then multiply by concurrent sequences. That number, not parameter count, tells you how many users fit.",
    asked: "How many concurrent requests will this GPU hold?",
    tags: ["memory", "concurrency", "capacity"],
  },
  {
    id: "paged-attention",
    term: "PagedAttention",
    field: "serving",
    short:
      "Stores the KV cache in fixed-size non-contiguous blocks, the way an operating system pages memory, instead of one contiguous reservation per sequence.",
    detail:
      "Introduced with vLLM at SOSP 2023. It removes the internal fragmentation caused by reserving for the maximum possible length, which is where most of the wasted memory used to go, and makes prefix sharing between requests cheap because blocks can be shared.",
    tags: ["memory", "vllm", "throughput"],
  },
  {
    id: "continuous-batching",
    term: "Continuous batching",
    field: "serving",
    short:
      "Admitting and retiring sequences at token granularity rather than waiting for a whole batch to finish.",
    detail:
      "From the Orca paper, OSDI 2022, and now table stakes in every serious engine. Static batching wastes the tail: a batch runs until its longest member is done. Continuous batching is the single largest throughput win available in serving, typically several times, and it costs nothing in quality.",
    also: ["in-flight batching", "iteration-level scheduling"],
    tags: ["throughput", "scheduling"],
  },
  {
    id: "chunked-prefill",
    term: "Chunked prefill",
    field: "serving",
    short:
      "Splits a long prompt into slices so decode steps for other requests interleave instead of waiting behind it.",
    detail:
      "Trades a little prefill throughput for a large improvement in TPOT stability under mixed traffic. Reach for it when the workload has both long documents and chatty short turns hitting the same replica.",
    tags: ["scheduling", "latency"],
  },
  {
    id: "prefix-caching",
    term: "Prefix caching",
    field: "serving",
    short:
      "Reusing the KV cache for an identical leading span across requests, so a shared system prompt is prefilled once.",
    detail:
      "The commercial version is prompt caching, billed at a large discount on cache hits, typically with a short time to live. It is usually the biggest cost lever available and it is order sensitive: put the stable content first, the variable content last, and never interpolate a timestamp into the prefix.",
    also: ["prompt caching", "automatic prefix caching", "APC"],
    asked: "Our token bill doubled after a refactor. Where would you look?",
    tags: ["cost", "caching", "latency"],
  },
  {
    id: "speculative-decoding",
    term: "Speculative decoding",
    field: "serving",
    short:
      "A small draft model proposes several tokens, the target model verifies them in one pass, and rejected tokens are discarded.",
    detail:
      "Output is distributionally identical to the target model, so quality is not the trade. The trade is acceptance rate: if the draft is poorly matched, you pay for verification and gain nothing. Self-speculative variants such as Medusa and EAGLE avoid running a second model.",
    also: ["draft model", "Medusa", "EAGLE", "acceptance rate"],
    tags: ["latency", "throughput"],
  },
  {
    id: "quantization",
    term: "Quantization",
    field: "serving",
    short:
      "Storing weights, activations or the KV cache at lower precision. FP8 and INT8 halve memory against BF16, INT4 quarters it.",
    detail:
      "Memory reduction is the point, and for decode the memory bandwidth saving is what actually converts into speed. Eight bit is close to free in quality on most models. Four bit is where you need your own evaluation, because the degradation is uneven: it shows up on long-tail and multilingual inputs long before it shows up on a benchmark average.",
    asked: "Would you quantize this model, and how would you decide?",
    tags: ["memory", "cost", "quality"],
  },
  {
    id: "gptq",
    term: "GPTQ",
    field: "serving",
    short:
      "Post-training weight quantization that processes weights in blocks and corrects the error against a calibration set.",
    detail:
      "GPU oriented and mature. Quality depends on the calibration data resembling your traffic, which is the step most people skip and then blame the method for.",
    tags: ["quantization", "gpu"],
  },
  {
    id: "awq",
    term: "AWQ",
    field: "serving",
    short:
      "Activation-aware weight quantization. Identifies the roughly one percent of channels that matter from activation statistics and protects them by scaling before uniform low-bit quantization.",
    detail:
      "Usually holds quality better than naive rounding at four bits and is well supported in vLLM. The premise is worth stating in an interview: not all weights carry equal signal, and the salient channels are identified from activations rather than from the weights themselves.",
    tags: ["quantization", "gpu"],
  },
  {
    id: "gguf",
    term: "GGUF",
    field: "serving",
    short:
      "The llama.cpp container format, with per-layer quantization levels from Q2_K up to Q8_0 and hybrid CPU plus GPU execution.",
    detail:
      "The format for laptops and Apple silicon, not for a multi-tenant server. Q4_K_M is the common default for a sensible quality and size balance. If you are choosing between GGUF and AWQ you are really choosing between single-user local and concurrent serving.",
    also: ["llama.cpp", "Q4_K_M"],
    tags: ["quantization", "local", "cpu"],
  },
  {
    id: "tensor-parallelism",
    term: "Tensor parallelism",
    field: "serving",
    short:
      "Splits individual weight matrices across GPUs, with a collective communication at every layer.",
    detail:
      "Use it when the model does not fit on one device, not to make a fitting model faster. It needs fast interconnect, so it works within a node over NVLink and degrades badly across nodes. Pipeline parallelism splits by layer instead and tolerates slower links at the cost of bubbles.",
    also: ["TP", "pipeline parallelism", "PP", "expert parallelism"],
    tags: ["distributed", "gpu", "scaling"],
  },
  {
    id: "memory-bandwidth-bound",
    term: "Memory bandwidth bound",
    field: "serving",
    short:
      "The regime where a kernel waits on reading weights and cache from HBM rather than on arithmetic. Decode lives here.",
    detail:
      "The practical test is arithmetic intensity, FLOPs performed per byte moved. Once you know a workload is bandwidth bound you stop shopping for FLOPs and start shopping for HBM bandwidth, and quantization becomes a speed optimization rather than only a capacity one.",
    also: ["roofline", "arithmetic intensity", "compute bound", "HBM"],
    tags: ["performance", "hardware"],
  },
  {
    id: "goodput",
    term: "Goodput",
    field: "serving",
    short:
      "Throughput counted only over requests that met their latency target. Raw tokens per second counted without an SLO is a vanity number.",
    detail:
      "The distinction matters because every batching knob raises throughput and eventually violates TTFT. Tuning to goodput gives you the largest batch that still meets the SLO, which is the actual capacity of the deployment.",
    tags: ["capacity", "slo", "throughput"],
  },
  {
    id: "vllm",
    term: "vLLM",
    field: "serving",
    short:
      "The default open serving engine. PagedAttention, continuous batching, prefix caching, tensor parallelism, and an OpenAI-compatible server.",
    detail:
      "Reach for it for throughput on standard architectures. SGLang competes on structured and multi-turn workloads with aggressive prefix reuse, TensorRT-LLM wins on raw NVIDIA latency at the cost of an ahead-of-time compilation step and much less flexibility.",
    also: ["SGLang", "TensorRT-LLM"],
    tags: ["serving", "oss"],
  },

  // ------------------------------------------------------------------- retrieval
  {
    id: "rag",
    term: "Retrieval-augmented generation",
    field: "retrieval",
    short:
      "Retrieve relevant passages at query time and put them in the context so the model answers from source rather than from memory.",
    detail:
      "Evaluate it as two systems. Retrieval is a search problem measured with recall at k and NDCG, generation is a grounding problem measured with faithfulness. A single end-to-end score tells you something broke and nothing about which half.",
    also: ["RAG"],
    tags: ["architecture", "grounding"],
  },
  {
    id: "chunking",
    term: "Chunking",
    field: "retrieval",
    short:
      "Splitting documents into retrievable units. The most consequential and least examined decision in a RAG pipeline.",
    detail:
      "Fixed-size splitting is fast and severs arguments mid-sentence. Recursive splitting respects structure. Semantic splitting cuts at topic shifts and costs an embedding pass. Contextual retrieval prepends a short model-written summary of the parent document to each chunk, which is expensive to build and reliably improves recall.",
    asked: "What chunk size would you use, and how would you know it was wrong?",
    tags: ["preprocessing", "recall"],
  },
  {
    id: "bi-encoder",
    term: "Bi-encoder",
    field: "retrieval",
    short:
      "Encodes query and document independently, so document vectors are precomputed and search is a nearest-neighbour lookup.",
    detail:
      "Fast because there is no interaction between query and document until the dot product. That independence is also the quality ceiling, and it is exactly what a cross-encoder reranker buys back on a shortlist.",
    tags: ["embeddings", "architecture"],
  },
  {
    id: "cross-encoder",
    term: "Cross-encoder",
    field: "retrieval",
    short:
      "Scores a query and document together in one forward pass. Far more accurate than embedding similarity and far too slow to run over a corpus.",
    detail:
      "The standard shape is retrieve fifty to a hundred candidates with a bi-encoder, then rerank to the top five with a cross-encoder. Reranking is usually the cheapest large quality win available in a RAG system, and it adds tens of milliseconds rather than hundreds.",
    also: ["reranker", "rerank"],
    tags: ["reranking", "precision"],
  },
  {
    id: "colbert",
    term: "Late interaction",
    field: "retrieval",
    short:
      "Stores per-token embeddings for each document and compares every query token against them at query time. ColBERT is the reference implementation.",
    detail:
      "Sits between the two extremes: close to cross-encoder precision at close to dense-retrieval latency. The cost is storage, since you are keeping a vector per token rather than per chunk, which can be an order of magnitude more index.",
    also: ["ColBERT"],
    tags: ["reranking", "index-size"],
  },
  {
    id: "hnsw",
    term: "HNSW",
    field: "retrieval",
    short:
      "A hierarchical navigable small world graph. The default approximate nearest neighbour index in Faiss, Qdrant, Weaviate and pgvector.",
    detail:
      "It is a graph held in memory, so the resident footprint is the vectors plus roughly m links per node per layer. Ten million 1536-dimension float32 vectors at m equal to 16 want on the order of 60 GB. That number decides your architecture. Query latency almost never does.",
    also: ["ANN", "efSearch", "efConstruction"],
    asked: "How much RAM does your vector index need?",
    tags: ["index", "memory", "ann"],
  },
  {
    id: "ivf-pq",
    term: "IVF and product quantization",
    field: "retrieval",
    short:
      "Clusters vectors into lists and searches only the nearest few, optionally compressing each vector into subspace codes.",
    detail:
      "The billion-scale option where HNSW memory stops being affordable. It trades recall for footprint and is slower to update, since new vectors land in existing clusters and eventually require retraining. DiskANN is the other answer, keeping most of the graph on SSD.",
    also: ["IVF", "PQ", "DiskANN"],
    tags: ["index", "scale", "memory"],
  },
  {
    id: "selectivity",
    term: "Filter selectivity",
    field: "retrieval",
    short:
      "The fraction of the corpus surviving a metadata filter. It decides whether filtered vector search stays fast or collapses.",
    detail:
      "Post-filtering searches the graph then discards, so at low selectivity you return almost nothing and have to over-fetch wildly. Pre-filtering restricts the candidate set but breaks graph connectivity, and below roughly one percent selectivity a brute-force scan of the filtered subset is genuinely faster than the index. Knowing that threshold exists is the answer.",
    asked: "A tenant-filtered search got slow. Why?",
    tags: ["filtering", "latency", "multi-tenancy"],
  },
  {
    id: "hybrid-search",
    term: "Hybrid search",
    field: "retrieval",
    short:
      "Runs sparse keyword retrieval and dense vector retrieval, then fuses the two ranked lists.",
    detail:
      "They fail on opposite queries. BM25 misses paraphrase and synonym, dense misses exact identifiers, error codes, part numbers and rare proper nouns. Any corpus containing codes or names needs both, and this is usually a larger win than upgrading the embedding model.",
    also: ["BM25", "sparse retrieval", "SPLADE"],
    tags: ["recall", "search"],
  },
  {
    id: "rrf",
    term: "Reciprocal rank fusion",
    field: "retrieval",
    short:
      "Combines ranked lists by summing 1 divided by (k plus rank), with k commonly 60. Uses only positions, never scores.",
    detail:
      "The reason it is the default fusion method is that it needs no score normalisation, and normalising a BM25 score against a cosine similarity is a fiddly, corpus-specific and drift-prone exercise. Documents ranked well by both methods get boosted, and a document strong in only one still surfaces.",
    also: ["RRF"],
    tags: ["fusion", "hybrid"],
  },
  {
    id: "recall-at-k",
    term: "Recall at k",
    field: "retrieval",
    short:
      "The fraction of relevant passages appearing in the top k. The ceiling on everything downstream.",
    detail:
      "Measure it before touching the prompt, because if the passage is not retrieved no amount of generation work recovers it. Report it at the k you actually pass to the model, not at the k your vector database returns.",
    tags: ["metrics", "evaluation"],
  },
  {
    id: "lost-in-the-middle",
    term: "Lost in the middle",
    field: "retrieval",
    short:
      "Models attend most reliably to the start and end of a long context and least reliably to the middle.",
    detail:
      "Directly changes how you order retrieved passages: put the strongest evidence first and last. It is also the empirical case against stuffing fifty chunks in because the window allows it, since added mediocre context measurably suppresses good context.",
    also: ["context rot", "needle in a haystack"],
    tags: ["context", "failure-modes"],
  },
  {
    id: "hyde",
    term: "Query transformation",
    field: "retrieval",
    short:
      "Rewriting the query before retrieval. Multi-query fans out into variants, HyDE embeds a hypothetical answer rather than the question.",
    detail:
      "The premise is that a question and its answer do not sit near each other in embedding space, since they are lexically and structurally different. All of these add a model call to the latency budget before search even starts, so they earn their place only when you have measured that retrieval is the failure.",
    also: ["HyDE", "multi-query", "query expansion"],
    tags: ["recall", "latency"],
  },
  {
    id: "graphrag",
    term: "GraphRAG",
    field: "retrieval",
    short:
      "Builds an entity and relation graph over the corpus, then retrieves subgraphs and community summaries rather than isolated passages.",
    detail:
      "It answers the questions flat retrieval cannot, the ones spanning many documents such as what themes run through this corpus. The cost is a heavy indexing pass over the whole corpus and an expensive rebuild policy, which is why most teams that pilot it do not keep it.",
    tags: ["knowledge-graph", "cost"],
  },
  {
    id: "incremental-indexing",
    term: "Incremental indexing",
    field: "retrieval",
    short:
      "Updating the index as sources change rather than rebuilding it. The operational question every RAG demo skips.",
    detail:
      "Deletes are the hard part. Graph indexes tombstone rather than remove, so quality degrades as churn accumulates and periodic rebuilds become mandatory. Decide the rebuild cadence and the freshness SLA before launch, because retrofitting them means reprocessing the corpus.",
    tags: ["operations", "freshness"],
  },

  // ------------------------------------------------------- agents and protocols
  {
    id: "tool-calling",
    term: "Tool calling",
    field: "agents",
    short:
      "The model emits a structured call against a schema you supplied, your code executes it, and the result goes back into the context.",
    detail:
      "The model never executes anything. That boundary is where every agent security control lives, since the model chooses the arguments and your code decides whether to honour them. Tool descriptions are prompt surface: vague ones produce wrong calls far more often than a weak model does.",
    also: ["function calling"],
    tags: ["integration", "security"],
  },
  {
    id: "react",
    term: "ReAct",
    field: "agents",
    short:
      "Interleaving reasoning and acting in a loop: think, call a tool, read the result, think again.",
    detail:
      "The base pattern under most agent frameworks. Its weakness is that it has no notion of a budget, so a confused loop will keep calling tools until something stops it. Step limits, cost ceilings and a no-progress detector are not optional extras, they are the pattern completed.",
    tags: ["patterns", "loops"],
  },
  {
    id: "compounding-error",
    term: "Compounding error",
    field: "agents",
    short:
      "Per-step reliability multiplied over the trajectory. Twenty steps at 99 percent each succeed 81.8 percent of the time.",
    detail:
      "The single most useful piece of arithmetic in agent design, because it explains why prompt improvements stop helping. At 95 percent per step, twenty steps succeed 35.8 percent of the time. The fixes are structural: fewer steps, verification at checkpoints, or a human in the loop, not a better prompt.",
    asked: "Why is your multi-step agent unreliable, and what would you change?",
    tags: ["reliability", "arithmetic"],
  },
  {
    id: "mcp",
    term: "Model Context Protocol",
    field: "agents",
    short:
      "An open protocol from Anthropic, late 2024, standardising how an LLM application connects to tools, data and prompts. One integration per system rather than one per pair.",
    detail:
      "A server exposes tools, resources and prompts, a client consumes them. Transport is stdio for local processes or streamable HTTP for remote. The trade is real: you get portability across hosts, and you get a supply chain, since an installed server runs with your credentials and its tool descriptions enter your context.",
    also: ["MCP", "MCP server", "MCP client"],
    tags: ["protocol", "integration", "security"],
  },
  {
    id: "a2a",
    term: "Agent-to-agent protocols",
    field: "agents",
    short:
      "A2A covers agents discovering and delegating to each other, advertising capability through an agent card. MCP is agent to tool, A2A is agent to agent.",
    detail:
      "Interviewers ask this exact distinction because it separates people who have read the spec from people who have read a headline. Cross-organisation delegation is still early, and the open questions are identity, authorisation and who is liable for the outcome, not message format.",
    also: ["A2A", "agent card"],
    asked: "What is the difference between MCP and A2A?",
    tags: ["protocol", "multi-agent"],
  },
  {
    id: "subagent",
    term: "Subagent",
    field: "agents",
    short:
      "Delegating a task to a separate agent with its own context window, so only the conclusion returns to the caller.",
    detail:
      "A context management device before it is an architecture. Research that would fill the main transcript with fifty pages of tool output comes back as three paragraphs. The cost is that the parent cannot see what was discarded, so anything the subagent silently dropped is unrecoverable.",
    tags: ["patterns", "context"],
  },
  {
    id: "supervisor",
    term: "Supervisor and swarm",
    field: "agents",
    short:
      "Two multi-agent topologies. A supervisor routes work to specialists and owns the state. A swarm lets peers hand off to each other directly.",
    detail:
      "Supervisor is easier to debug and observe because there is one place where decisions happen, and it becomes the bottleneck. Swarm is more flexible and much harder to trace. Default to supervisor, and before either, ask whether one agent with better tools would do, because most multi-agent designs are solving a prompt problem with an org chart.",
    tags: ["patterns", "multi-agent"],
  },
  {
    id: "context-engineering",
    term: "Context engineering",
    field: "agents",
    short:
      "Deciding what occupies the context window at each step. The discipline that replaced prompt engineering once systems got multi-turn.",
    detail:
      "The budget is finite and every token competes. Tool definitions, retrieved passages, history, scratchpad and system rules all fight for the same space, and adding more of one degrades the others. The skill is deletion: compaction, summarisation, and moving state out to files or a store the agent can read on demand.",
    tags: ["context", "design"],
  },
  {
    id: "agent-memory",
    term: "Agent memory",
    field: "agents",
    short:
      "State that survives past the context window. Working memory in-session, episodic memory of past runs, semantic memory of learned facts.",
    detail:
      "Most implementations are retrieval over a store of past turns, which means memory inherits every retrieval failure mode plus one of its own: stale memories that were true once. Without an expiry or update policy the store degrades into contradictory facts and the agent confidently uses the wrong one.",
    tags: ["state", "retrieval"],
  },
  {
    id: "compaction",
    term: "Compaction",
    field: "agents",
    short:
      "Summarising older turns to free context when a long session approaches the window limit.",
    detail:
      "Lossy by definition, so what you choose to preserve is a design decision: the objective, the decisions made and their reasons, open threads. What is safe to drop is verbose tool output already acted on and failed attempts that led somewhere. A compaction that keeps the transcript and loses the goal is worse than truncation.",
    tags: ["context", "long-running"],
  },
  {
    id: "human-in-the-loop",
    term: "Human in the loop",
    field: "agents",
    short:
      "Pausing for approval before an action that is irreversible, expensive or externally visible.",
    detail:
      "Place it by blast radius rather than by confidence, since the model's confidence is not calibrated. Reads run free, writes to shared state pause. The design failure is approval fatigue: ask ten times an hour and people click yes without reading, which is worse than no gate because it manufactures a record of consent.",
    also: ["HITL", "approval gate"],
    tags: ["safety", "operations"],
  },
  {
    id: "durable-execution",
    term: "Durable execution",
    field: "agents",
    short:
      "Persisting each step so a long agent run survives a crash, a deploy or a rate limit and resumes rather than restarting.",
    detail:
      "Borrowed from workflow engines such as Temporal and Restate. It matters once runs last minutes, because a restart is not just slow, it re-executes side effects. That forces tools to be idempotent, which is a bigger design constraint than the persistence itself.",
    also: ["checkpointing", "replay", "idempotent tools"],
    tags: ["reliability", "long-running"],
  },
  {
    id: "sandboxing",
    term: "Sandboxing",
    field: "agents",
    short:
      "Running agent-generated code and commands in an isolated environment with restricted filesystem, network and credentials.",
    detail:
      "The control that assumes the model will be wrong or manipulated rather than trying to prevent it. Network allowlisting matters as much as filesystem isolation, since exfiltration is the payload in most indirect prompt injection. Credentials should be scoped per run, never ambient.",
    tags: ["security", "isolation"],
  },
  {
    id: "trajectory",
    term: "Trajectory",
    field: "agents",
    short:
      "The full sequence of thoughts, tool calls, results and outputs in one agent run. The unit of agent evaluation.",
    detail:
      "Final-answer accuracy hides how the answer was reached, so a run that got lucky after twelve wasted calls scores the same as a clean one. Trajectory evaluation looks at whether the right tool was chosen, whether steps were redundant, and where the run first went wrong. Agent benchmarks worth naming: SWE-bench for code, Terminal-Bench for shell, tau-bench for tool use in conversation, OSWorld for computer use.",
    also: ["SWE-bench", "Terminal-Bench", "tau-bench", "OSWorld"],
    tags: ["evaluation", "debugging"],
  },

  // ---------------------------------------------------- training and adaptation
  {
    id: "sft",
    term: "Supervised fine-tuning",
    field: "training",
    short:
      "Continued training on labelled input and output pairs, teaching format, tone and domain behaviour.",
    detail:
      "It teaches behaviour reliably and teaches facts badly. If the goal is that the model knows something new, retrieval is almost always the cheaper and more auditable answer, because a fine-tune has no citation and no way to remove a fact later. Fine-tune for how to answer, retrieve for what to answer.",
    also: ["SFT", "instruction tuning"],
    asked: "Fine-tune or RAG?",
    tags: ["adaptation", "tradeoffs"],
  },
  {
    id: "lora",
    term: "LoRA",
    field: "training",
    short:
      "Freezes the base weights and trains a low-rank pair A and B so the update is W plus BA. Typically 0.1 to 1 percent of parameters, adapters of 50 to 500 MB.",
    detail:
      "Rank is the capacity knob: 8 to 16 for style and format, higher for genuinely new behaviour, and too high just relearns the overfitting you were avoiding. Alpha scales the update, commonly set to twice the rank. The operational win is that many adapters share one base model in memory, so a serving stack can host dozens of tenants on one GPU.",
    also: ["low-rank adaptation", "PEFT", "adapter", "rank", "alpha"],
    tags: ["peft", "efficiency", "serving"],
  },
  {
    id: "qlora",
    term: "QLoRA",
    field: "training",
    short:
      "LoRA over a base quantized to 4-bit NF4, with paged optimizers. Puts a 70B fine-tune within reach of a single 80 GB GPU.",
    detail:
      "The reason single-GPU fine-tuning became normal. Quality is close to LoRA on BF16 for most tasks, and the cost is slower steps plus a quantized base you must serve consistently, since training against a 4-bit base and serving at BF16 introduces a mismatch nobody looks for later.",
    also: ["NF4", "4-bit"],
    tags: ["peft", "memory"],
  },
  {
    id: "dpo",
    term: "Direct preference optimization",
    field: "training",
    short:
      "Trains directly on triples of prompt, chosen and rejected with a contrastive loss against a reference model. No separate reward model, no RL loop.",
    detail:
      "It replaced RLHF as the default because it is a supervised training run with far fewer moving parts. RLHF trains a reward model from pairwise preferences and then optimises with PPO, which is more powerful and much harder to keep stable. Variants worth naming: KTO needs only a binary good or bad signal, ORPO folds preference into SFT in one stage, GRPO is the group-relative method behind recent reasoning models.",
    also: ["DPO", "RLHF", "PPO", "KTO", "ORPO", "GRPO", "RLAIF"],
    asked: "How would you align a model to your team's answer style?",
    tags: ["alignment", "preference"],
  },
  {
    id: "catastrophic-forgetting",
    term: "Catastrophic forgetting",
    field: "training",
    short:
      "The model gets better at your task and worse at everything else, including capabilities you never evaluated.",
    detail:
      "The reason a fine-tune needs a regression suite covering general capability, not just the target metric. Mixing a slice of general instruction data into the training mix mitigates it, and PEFT suffers less than full fine-tuning because the base weights are untouched.",
    tags: ["risk", "evaluation"],
  },
  {
    id: "distillation",
    term: "Distillation",
    field: "training",
    short:
      "Training a small model on the outputs of a large one, so a cheap model inherits behaviour it could not learn from raw data alone.",
    detail:
      "The standard production path once a prompt works: prove it with a frontier model, harvest a few thousand traces, then train a small model on them and cut cost by an order of magnitude. Check the provider terms first, since training a competing model on outputs is restricted by several of them.",
    also: ["synthetic data", "teacher model"],
    tags: ["cost", "compression"],
  },
  {
    id: "bias-variance",
    term: "Bias and variance",
    field: "training",
    short:
      "Bias is error from a model too simple to capture the pattern, poor on both train and test. Variance is error from fitting noise, good on train and poor on test.",
    detail:
      "Still asked in almost every screen, and the diagnostic version is what earns marks: compare training error to validation error. Both high is underfitting, a wide gap is overfitting. The remedies differ, more capacity and better features against bias, more data and regularization against variance.",
    also: ["overfitting", "underfitting", "regularization", "L1", "L2", "dropout"],
    tags: ["fundamentals", "diagnosis"],
  },
  {
    id: "data-leakage",
    term: "Data leakage",
    field: "training",
    short:
      "Information from outside the training window reaching the model, producing offline scores that collapse in production.",
    detail:
      "The usual culprits are a random split on time-ordered data, features computed after the label event, and preprocessing fitted before the split. For LLMs there is a second form, benchmark contamination, where the test set was in pretraining. A held-out set built after the model's cutoff is the only clean answer.",
    also: ["contamination", "target leakage"],
    asked: "Your offline metric was excellent and production was not. Why?",
    tags: ["fundamentals", "evaluation"],
  },
  {
    id: "class-imbalance",
    term: "Class imbalance",
    field: "training",
    short:
      "One class dominates, so accuracy becomes meaningless. A classifier for a one percent event scores 99 percent by predicting nothing.",
    detail:
      "Handle it with class weights, threshold tuning against the cost of each error type, or resampling, and report precision and recall or PR-AUC rather than accuracy. It matters in applied AI because guardrails, routers and abuse detectors are all rare-event classifiers.",
    tags: ["fundamentals", "metrics"],
  },

  // ------------------------------------------------------------------ evaluation
  {
    id: "golden-set",
    term: "Golden set",
    field: "evaluation",
    short:
      "A human-labelled set of inputs and expected outputs, held fixed, that every change is measured against.",
    detail:
      "The first thing to build and the one most teams postpone. A hundred cases drawn from real traffic beats a thousand invented ones, and it must include the failures you have actually seen, since that is what stops a regression shipping twice. Version it with the code, because a metric that moved when the set changed tells you nothing.",
    also: ["eval set", "regression suite"],
    asked: "How do you know a prompt change made things better?",
    tags: ["method", "regression"],
  },
  {
    id: "llm-as-judge",
    term: "LLM as judge",
    field: "evaluation",
    short:
      "Using a model to score outputs against a rubric. The only way to evaluate open-ended generation at scale, and biased in known directions.",
    detail:
      "It prefers longer answers, is sensitive to option order in pairwise comparisons, and rates its own family's outputs higher. All three are manageable: swap positions and average, cap length, use a different family as judge. The non-negotiable step is calibrating the judge against human labels and reporting the agreement, typically Cohen's kappa, so the number has a known error bar.",
    also: ["judge model", "Cohen's kappa"],
    tags: ["method", "bias"],
  },
  {
    id: "faithfulness",
    term: "Faithfulness",
    field: "evaluation",
    short:
      "Whether every claim in the answer is supported by the retrieved context. Measured by extracting claims and checking each one.",
    detail:
      "Distinct from correctness. An answer can be true and unfaithful, taken from parametric memory rather than the source, and that is still a failure in a grounded system because it is unauditable and will be wrong the day the source changes. Faithfulness is reference-free, which is why it works on live traffic where no ground truth exists.",
    also: ["groundedness", "RAGAS"],
    tags: ["rag", "grounding"],
  },
  {
    id: "context-precision",
    term: "Context precision and recall",
    field: "evaluation",
    short:
      "Precision is how much of the retrieved context was relevant, recall is how much of the relevant material was retrieved.",
    detail:
      "The pair that localises a RAG failure. Low recall means retrieval never found it, so tune chunking, hybrid search or k. High recall with low precision means you are drowning the answer in noise, so rerank. Reporting one score for the whole pipeline hides which of these it was.",
    tags: ["rag", "diagnosis"],
  },
  {
    id: "ndcg",
    term: "NDCG",
    field: "evaluation",
    short:
      "Normalised discounted cumulative gain. Ranking quality with a logarithmic position discount, so a relevant document at rank 1 counts for more than at rank 10.",
    detail:
      "Use it when position matters and relevance is graded rather than binary. MRR is the simpler cousin, the average reciprocal rank of the first relevant hit, appropriate when there is one right answer. Recall at k ignores order entirely and is the right metric when a reranker sits downstream.",
    also: ["MRR", "MAP", "recall@k"],
    tags: ["ranking", "metrics"],
  },
  {
    id: "precision-recall",
    term: "Precision and recall",
    field: "evaluation",
    short:
      "Precision is how many flagged items were right, recall is how many right items were flagged. F1 is their harmonic mean.",
    detail:
      "Which one you optimise is a product decision, not a modelling one: a spam filter protects precision because false positives lose mail, a fraud screen protects recall because misses cost money. Saying which you would favour, and why, is the answer being tested.",
    also: ["F1", "confusion matrix", "ROC-AUC", "PR-AUC"],
    tags: ["fundamentals", "metrics"],
  },
  {
    id: "calibration",
    term: "Calibration",
    field: "evaluation",
    short:
      "Whether a stated confidence of 0.8 is right about 80 percent of the time. Measured with expected calibration error or a Brier score.",
    detail:
      "It matters wherever a threshold routes work, because an escalation rule built on uncalibrated scores fires at the wrong rate. Generative models are poorly calibrated by default, and a model asked to rate its own confidence in words is worse still, so prefer logprobs or a downstream verifier.",
    also: ["ECE", "Brier score"],
    tags: ["confidence", "routing"],
  },
  {
    id: "offline-online",
    term: "Offline and online evaluation",
    field: "evaluation",
    short:
      "Offline runs against a fixed set before release. Online measures live traffic through A/B tests, shadow runs and user signals.",
    detail:
      "Offline gates the release, online tells you whether it mattered. They disagree often, because the golden set does not match the traffic distribution, and that disagreement is the useful signal: it tells you the set needs new cases sampled from production.",
    tags: ["method", "release"],
  },
  {
    id: "red-teaming",
    term: "Red teaming",
    field: "evaluation",
    short:
      "Adversarial testing to find the inputs that break safety, policy or grounding, run as a structured exercise rather than an afterthought.",
    detail:
      "Automated suites cover the known jailbreak families cheaply and miss anything specific to your product, which is where the real damage is. The output that matters is not a pass rate, it is a set of concrete failures added to the regression suite so they stay fixed.",
    tags: ["safety", "adversarial"],
  },

  // ------------------------------------------------------------ data engineering
  {
    id: "oltp-olap",
    term: "OLTP and OLAP",
    field: "data",
    short:
      "Transactional stores handle many small reads and writes, row-oriented. Analytical stores scan and aggregate huge ranges, column-oriented.",
    detail:
      "The split explains most of the data stack. Postgres and MySQL serve the app, Snowflake, BigQuery, ClickHouse and DuckDB answer the questions. Running analytics on the production transactional database is the mistake this vocabulary exists to prevent.",
    also: ["row store", "column store"],
    tags: ["fundamentals", "storage"],
  },
  {
    id: "parquet",
    term: "Parquet",
    field: "data",
    short:
      "Columnar file format with per-column compression and statistics, so a query reads only the columns and row groups it needs.",
    detail:
      "The default at rest for analytical data and for embedding corpora. The practical wins are predicate pushdown and column pruning, which is why the same query over Parquet can touch a fraction of the bytes that CSV would. Arrow is the in-memory counterpart.",
    also: ["Arrow", "ORC"],
    tags: ["formats", "storage"],
  },
  {
    id: "lakehouse",
    term: "Lakehouse",
    field: "data",
    short:
      "Object storage holding open table formats that add ACID transactions, schema evolution and time travel over Parquet files.",
    detail:
      "Delta Lake, Apache Iceberg and Hudi are the three implementations, with Iceberg now the interoperability default. The point is that the storage layer stops being a dumb file dump: concurrent writes are safe, a bad backfill is revertible, and multiple engines read the same tables.",
    also: ["Iceberg", "Delta Lake", "Hudi", "time travel"],
    tags: ["architecture", "storage"],
  },
  {
    id: "medallion",
    term: "Medallion architecture",
    field: "data",
    short:
      "Bronze holds raw ingested data, silver holds cleaned and conformed data, gold holds curated tables for consumption.",
    detail:
      "The value is that bronze is immutable, so any transformation bug is repairable by reprocessing rather than by re-ingesting from a source that may have changed. For applied AI the same shape works for a corpus: raw documents, parsed and chunked, embedded and indexed.",
    also: ["bronze silver gold"],
    tags: ["architecture", "pipelines"],
  },
  {
    id: "etl-elt",
    term: "ETL and ELT",
    field: "data",
    short:
      "ETL transforms before loading, ELT loads raw then transforms in the warehouse. ELT won because warehouse compute got cheap.",
    detail:
      "ELT means the raw data is still there when the transformation turns out to be wrong, which it will be. dbt is the standard transformation layer, with materializations that decide the cost and freshness trade: view, table, incremental, ephemeral.",
    also: ["dbt", "materialization", "incremental model"],
    tags: ["pipelines", "tools"],
  },
  {
    id: "cdc",
    term: "Change data capture",
    field: "data",
    short:
      "Streaming inserts, updates and deletes off a database log rather than polling for changed rows.",
    detail:
      "The right answer when someone asks how the index stays fresh. Log-based capture, as Debezium does, catches deletes and hard updates that a timestamp poll silently misses, and missed deletes are how a RAG system keeps citing a document that was withdrawn.",
    also: ["Debezium", "binlog", "WAL"],
    asked: "How does your vector index stay in sync with the source system?",
    tags: ["streaming", "freshness"],
  },
  {
    id: "idempotency",
    term: "Idempotency",
    field: "data",
    short:
      "Running the same job twice produces the same result as running it once. The property that makes retries safe.",
    detail:
      "Achieved with deterministic partition keys, upserts keyed on a natural or hash key, and delete-then-write for a partition rather than append. Without it, every retry doubles rows and every backfill corrupts what it touches, and both failures are silent until someone counts.",
    also: ["upsert", "merge", "exactly-once"],
    tags: ["reliability", "pipelines"],
  },
  {
    id: "scd2",
    term: "Slowly changing dimension type 2",
    field: "data",
    short:
      "Keeps history by adding a new row with validity dates instead of overwriting, so you can reconstruct what a record looked like on any date.",
    detail:
      "Necessary whenever an audit or a model needs the state at decision time rather than now. It is also the honest answer to point-in-time correctness in feature engineering, where joining current attributes onto historical events is a classic leakage bug.",
    also: ["SCD", "point-in-time correctness"],
    tags: ["modelling", "history"],
  },
  {
    id: "partitioning",
    term: "Partitioning",
    field: "data",
    short:
      "Physically splitting a table by a column, usually date, so a query prunes whole partitions instead of scanning.",
    detail:
      "The most common scale mistake is the small files problem: partitioning too finely produces thousands of tiny files and metadata overhead swamps the saving. Compaction and clustering, or z-ordering in Delta, are the counterweight.",
    also: ["z-order", "clustering", "small files"],
    tags: ["performance", "storage"],
  },
  {
    id: "backfill",
    term: "Backfill",
    field: "data",
    short:
      "Reprocessing historical partitions after a logic change or a bug fix.",
    detail:
      "It is the operation that finds out whether your pipeline is really idempotent, and it competes with live traffic for the same warehouse or GPU capacity. For embedding corpora a backfill means re-embedding, which is a real budget line, so a model change should be costed as a reindex from the start.",
    tags: ["operations", "cost"],
  },
  {
    id: "data-contract",
    term: "Data contract",
    field: "data",
    short:
      "An enforced agreement on schema, semantics and freshness between a producing team and its consumers.",
    detail:
      "It moves breakage from silent downstream corruption to a loud failure at the boundary. Without one, an upstream column rename becomes a quality incident that surfaces weeks later as a model degradation nobody can attribute.",
    also: ["schema evolution", "data quality"],
    tags: ["governance", "reliability"],
  },
  {
    id: "kafka",
    term: "Kafka semantics",
    field: "data",
    short:
      "A partitioned append-only log. Consumer groups divide partitions, offsets track position, and ordering is guaranteed only within a partition.",
    detail:
      "The vocabulary interviewers probe is consumer lag, offset commit timing and rebalancing. Committing before processing gives at-most-once and drops messages on crash, committing after gives at-least-once and duplicates, which is why the consumer has to be idempotent regardless.",
    also: ["consumer group", "offset", "consumer lag", "watermark"],
    tags: ["streaming", "reliability"],
  },
  {
    id: "lineage",
    term: "Lineage",
    field: "data",
    short:
      "The recorded path from source columns through every transformation to the final artifact.",
    detail:
      "Answers the two questions asked in every incident: what breaks if I change this, and where did this number come from. For AI systems it extends to which corpus version and which model version produced a given answer, which is exactly what an audit under the EU AI Act will ask for.",
    also: ["provenance"],
    tags: ["governance", "operations"],
  },
  {
    id: "pii-handling",
    term: "PII handling",
    field: "data",
    short:
      "Detecting and masking, tokenising or redacting personal data before it reaches a model, a log or a third-party API.",
    detail:
      "The awkward part in AI systems is that prompts and traces are new copies of the data, so an observability stack can quietly become an unregistered personal data store. Deterministic tooling such as Presidio plus schema validation is more defensible here than asking a model to redact, because you can test it.",
    also: ["redaction", "tokenisation", "Presidio"],
    tags: ["privacy", "compliance"],
  },

  // -------------------------------------------------------- production and mlops
  {
    id: "model-registry",
    term: "Model registry",
    field: "production",
    short:
      "The system of record for model versions, their metrics, approvals and deployment state. What is live and how to roll back.",
    detail:
      "In an LLM system the artifact is rarely weights. It is the prompt, the tool schemas, the retrieval configuration and the model id, and all of it needs the same versioning discipline. Teams that version code but not prompts cannot answer why yesterday's answers were better.",
    tags: ["release", "versioning"],
  },
  {
    id: "feature-store",
    term: "Feature store",
    field: "production",
    short:
      "Centralises feature computation so training and serving read the same definitions, with an offline store for training and an online store for low-latency lookup.",
    detail:
      "Its reason for existing is training-serving skew: a feature computed one way in a notebook and another way in the service produces a model that scores well and behaves badly. The same failure appears in RAG when the query is embedded with different preprocessing than the corpus was.",
    also: ["training-serving skew"],
    tags: ["architecture", "consistency"],
  },
  {
    id: "drift",
    term: "Drift",
    field: "production",
    short:
      "Data drift is a change in the input distribution, concept drift is a change in the relationship between input and label. Both degrade a model that has not changed.",
    detail:
      "Population stability index and the Kolmogorov-Smirnov test are the usual detectors on tabular inputs. For LLM systems the equivalent is watching embedding distributions of incoming queries and retrieval score distributions, because a shift there shows up as quality loss long before anyone files a ticket.",
    also: ["PSI", "KS test", "concept drift"],
    tags: ["monitoring", "quality"],
  },
  {
    id: "tracing",
    term: "Tracing",
    field: "production",
    short:
      "Recording each retrieval, model call and tool call as a span in one trace, so a request can be reconstructed end to end.",
    detail:
      "The only practical way to debug a multi-step system, because the failure is usually three steps upstream of the bad output. OpenTelemetry's GenAI semantic conventions define a gen_ai namespace covering operation, provider, model, token counts and finish reason. Most of those conventions are still experimental, so pin versions and expect attribute names to move.",
    also: ["OpenTelemetry", "gen_ai", "span", "observability"],
    asked: "How would you debug a wrong answer in a production RAG system?",
    tags: ["observability", "debugging"],
  },
  {
    id: "slo",
    term: "SLI, SLO and error budget",
    field: "production",
    short:
      "An indicator is what you measure, an objective is the target, and the error budget is the allowed shortfall over a window.",
    detail:
      "The budget is what makes the target actionable: spent budget means stop shipping features and fix reliability. For LLM services the indicator set has to include a quality measure alongside latency and availability, because the system degrades by answering badly rather than by returning errors.",
    also: ["SLA", "p95", "p99"],
    tags: ["reliability", "process"],
  },
  {
    id: "canary",
    term: "Canary, blue-green and shadow",
    field: "production",
    short:
      "Canary sends a small traffic slice to the new version. Blue-green swaps whole environments. Shadow mirrors live traffic to the new version without serving its output.",
    detail:
      "Shadow is the one that fits LLM changes best, because it lets you compare answers at real traffic distribution with no user risk, at the cost of paying twice for inference during the comparison. Whichever you pick, define the automatic rollback trigger and the time it takes before you start, not after the incident.",
    also: ["champion challenger", "rollback"],
    tags: ["release", "risk"],
  },
  {
    id: "backpressure",
    term: "Backpressure and admission control",
    field: "production",
    short:
      "Rejecting or queueing work when the system is saturated, rather than accepting everything and degrading for everyone.",
    detail:
      "Critical in GPU serving, where an unbounded queue converts a throughput problem into a latency collapse and every request times out. A bounded queue with a fast rejection is better service than a slow yes. Token buckets, per-tenant quotas and a shed-load threshold are the usual mechanics.",
    also: ["rate limiting", "token bucket", "load shedding"],
    tags: ["reliability", "capacity"],
  },
  {
    id: "retry-backoff",
    term: "Retry with backoff and jitter",
    field: "production",
    short:
      "Retrying failed calls with exponentially growing delays plus randomness, so clients do not resynchronise into a thundering herd.",
    detail:
      "Jitter is the part people drop and the part that matters, since synchronised retries reproduce the outage that caused them. Retry only idempotent operations, cap total attempts, and respect the retry-after header providers send, because ignoring it extends the rate limit.",
    tags: ["reliability", "clients"],
  },
  {
    id: "circuit-breaker",
    term: "Circuit breaker",
    field: "production",
    short:
      "After a failure threshold, stop calling a dependency for a cooldown period and fail fast instead.",
    detail:
      "It protects both sides: the caller stops burning latency budget on calls that will fail, and the struggling dependency gets room to recover. Pair it with a defined degraded mode, such as falling back to keyword search when the vector store is down, so the product survives on reduced quality rather than stopping.",
    also: ["graceful degradation", "fallback"],
    tags: ["reliability", "patterns"],
  },
  {
    id: "cost-per-request",
    term: "Cost per request",
    field: "production",
    short:
      "Input tokens plus output tokens at their respective prices, adjusted for cache hits and retries, measured per user action rather than per API call.",
    detail:
      "Per-action is the only unit that survives contact with agents, where one user request becomes forty model calls. Track it as a percentile the same way you track latency: the mean hides the long-context outliers that produce the surprising invoice.",
    asked: "How do you keep unit economics stable as usage grows?",
    tags: ["cost", "economics"],
  },
  {
    id: "gpu-scheduling",
    term: "GPU scheduling",
    field: "production",
    short:
      "Placing model replicas on accelerators. GPUs are not fractionally shared by default, so one pod usually holds one device.",
    detail:
      "This is why autoscaling an LLM service is unlike autoscaling a web service: the unit is expensive, cold start includes loading tens of gigabytes of weights, and scale-up takes minutes. The usual answers are keeping warm capacity, scaling on queue depth rather than CPU, and multi-LoRA to serve many tenants from one loaded base.",
    also: ["cold start", "MIG", "autoscaling", "multi-LoRA"],
    tags: ["infrastructure", "capacity"],
  },
  {
    id: "prompt-versioning",
    term: "Prompt and config versioning",
    field: "production",
    short:
      "Treating prompts, tool schemas and retrieval settings as versioned artifacts tied to a release and recorded in every trace.",
    detail:
      "Without it there is no way to attribute a quality change to a cause, and prompts get edited in a console by whoever was on call. The version id belongs in the trace alongside the model id, so an incident review can compare two populations of answers instead of guessing.",
    tags: ["release", "observability"],
  },

  // ------------------------------------------------------ governance and security
  {
    id: "eu-ai-act",
    term: "EU AI Act",
    field: "governance",
    short:
      "Risk-tiered law: prohibited practices, high-risk systems with conformity obligations, transparency duties, and a separate track for general-purpose models. Obligations phase in through 2027.",
    detail:
      "The engineering-relevant part is Article 15, which requires appropriate accuracy, robustness and cybersecurity for high-risk systems, plus declared accuracy metrics and logging. In practice that turns evaluation and traceability from good practice into evidence you have to produce. Classification comes from the use case, not the model, so the same model is high risk in hiring and unregulated in a writing assistant.",
    also: ["Article 15", "high-risk", "GPAI", "conformity assessment"],
    asked: "Does this feature fall under the AI Act, and what would that require?",
    tags: ["regulation", "eu"],
  },
  {
    id: "nist-ai-rmf",
    term: "NIST AI RMF",
    field: "governance",
    short:
      "A voluntary risk framework organised as four functions: Govern, Map, Measure, Manage.",
    detail:
      "Not certifiable and not law, which is its advantage: it is an operating model you can adopt incrementally. Many programs run it as the internal working method inside an ISO 42001 management system, using Map for context, Measure for evaluation and Manage for controls.",
    also: ["Govern Map Measure Manage"],
    tags: ["framework", "risk"],
  },
  {
    id: "iso-42001",
    term: "ISO/IEC 42001",
    field: "governance",
    short:
      "A certifiable AI management system standard. Policies, roles, objectives, controls and audits, in the shape of ISO 27001.",
    detail:
      "Certification is a procurement signal more than a technical one, and it says the process exists rather than that the system is safe. The three-way distinction is what gets asked: 42001 is a management system, NIST AI RMF is an operating model, OWASP is a threat taxonomy.",
    also: ["AIMS"],
    tags: ["framework", "certification"],
  },
  {
    id: "prompt-injection",
    term: "Prompt injection",
    field: "governance",
    short:
      "Instructions smuggled into content the model reads, causing it to act against its operator's intent. Direct comes from the user, indirect from a retrieved document, web page, email or tool output.",
    detail:
      "OWASP ranks it LLM01 and there is no complete defence, because the model has no reliable channel separation between instruction and data. Layered mitigation is the honest answer: least-privilege tools, allowlisted network egress, output validation, human approval on consequential actions, and treating every retrieved token as untrusted input.",
    also: ["LLM01", "indirect injection", "jailbreak"],
    asked:
      "Your agent reads customer email and can send replies. What is the risk?",
    tags: ["security", "owasp"],
  },
  {
    id: "excessive-agency",
    term: "Excessive agency",
    field: "governance",
    short:
      "Granting an agent more permission, autonomy or functionality than the task needs, so a single manipulated step becomes a real-world consequence.",
    detail:
      "The control is scoping rather than detection: narrow tool surfaces, read-only credentials where possible, per-run scoped tokens, and approval gates on anything irreversible. It pairs with injection, since injection is the exploit and excessive agency is what makes the exploit matter.",
    tags: ["security", "agents"],
  },
  {
    id: "owasp-llm",
    term: "OWASP Top 10 for LLM",
    field: "governance",
    short:
      "The threat taxonomy for LLM applications: injection, sensitive information disclosure, supply chain, data and model poisoning, improper output handling, excessive agency, and the rest.",
    detail:
      "Useful because it gives shared names to failure modes teams otherwise describe ad hoc, and there is now a companion set for agentic systems. Improper output handling is the one most often missed: model output flowing into a shell, a query or a browser is an injection vector in the classic sense.",
    tags: ["security", "taxonomy"],
  },
  {
    id: "supply-chain",
    term: "AI supply chain risk",
    field: "governance",
    short:
      "Risk inherited from model weights, datasets, packages and MCP servers you did not build.",
    detail:
      "Weights from a public hub are executable artifacts in the sense that matters, and an MCP server runs with your credentials and injects text into your context. Pin versions, verify checksums, review what a server actually exposes, and keep an inventory, because you cannot patch what you did not record.",
    also: ["model poisoning", "dependency risk"],
    tags: ["security", "operations"],
  },
  {
    id: "model-card",
    term: "Model card and system card",
    field: "governance",
    short:
      "Structured documentation of intended use, training data characteristics, evaluation results and known limitations.",
    detail:
      "A model card describes the model, a system card describes the deployed system including retrieval, guardrails and human oversight. The system card is what a regulator or a customer security review actually needs, since the model alone is not the thing you shipped.",
    tags: ["documentation", "transparency"],
  },
  {
    id: "human-oversight",
    term: "Human oversight",
    field: "governance",
    short:
      "A named person able to understand, intervene in and override the system's output, with the authority to stop it.",
    detail:
      "A legal requirement for high-risk systems and an easy one to fake. Oversight that consists of approving what the model already decided is automation bias wearing a compliance label. Meaningful oversight needs the reviewer to see the evidence, have time, and face no penalty for disagreeing.",
    also: ["automation bias"],
    tags: ["compliance", "process"],
  },
  {
    id: "audit-log",
    term: "Audit logging",
    field: "governance",
    short:
      "An append-only record of inputs, retrieved sources, model and prompt versions, outputs and human decisions, retained for a defined period.",
    detail:
      "The artifact that makes every other claim checkable, and the one that collides with privacy, since a full prompt log is a copy of whatever users typed. The workable shape is redaction at write time, defined retention, and access controls tight enough that the log is not a second breach surface.",
    tags: ["compliance", "observability"],
  },
  {
    id: "explainability",
    term: "Explainability",
    field: "governance",
    short:
      "Making a decision inspectable. SHAP and LIME attribute tabular predictions to features, citations attribute a generated answer to sources.",
    detail:
      "For generative systems, citation with verified spans is the practical form, since a chain of thought is generated text rather than a record of computation and does not survive being treated as evidence. If a regulation demands an explanation, retrieval with source attribution is far easier to defend than any post-hoc interpretation of the weights.",
    also: ["SHAP", "LIME", "attribution", "citations"],
    tags: ["transparency", "methods"],
  },
  {
    id: "fairness",
    term: "Fairness testing",
    field: "governance",
    short:
      "Measuring outcome differences across protected groups, using metrics such as demographic parity, equal opportunity or disparate impact ratio.",
    detail:
      "The metrics are mathematically incompatible in general, so a system cannot satisfy all of them at once and the choice has to be stated and justified. For LLM features the practical test is a paired-prompt evaluation, identical inputs varying only a group attribute, since the disparity often shows up in tone and refusal rate rather than in a score.",
    tags: ["compliance", "evaluation"],
  },
  {
    id: "data-residency",
    term: "Data residency and processing",
    field: "governance",
    short:
      "Where data is stored, where it is processed, and which contracts cover a provider's use of it.",
    detail:
      "The practical questions for an AI feature are whether prompts leave the region, whether the provider trains on them, and what the retention period is. Zero-retention endpoints and regional deployments exist for exactly this, and they usually cost latency, availability of the newest models, or both.",
    also: ["GDPR", "DPIA", "zero retention"],
    tags: ["privacy", "procurement"],
  },
];
