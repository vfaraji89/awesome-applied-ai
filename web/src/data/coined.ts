/* Coined & decoded: the new words of applied AI, who coined or popularised each one, when, and
   what it plainly means. Every entry names its source; where the first use is disputed, it says so.
   "was" is the older, plainer idea the new word stands on, because most new words are old ideas
   with a better name. Kept in code, not the content sheet: each line was checked by hand. */
export interface Coined {
  id: string;
  term: string;
  how: "coined" | "popularised" | "named";
  by: string;
  when: string; // ISO date, or YYYY-MM, or YYYY
  label: string; // the date as people read it
  plain: string; // what it means, in one plain sentence
  was: string; // the older, plainer idea under it
  note?: string; // disputes, earlier uses
  source: { label: string; url: string };
  jargon?: string; // id on /jargon/
  skill?: string; // id on /skills/
}

export const coined: Coined[] = [
  { id: "rag", term: "Retrieval-augmented generation (RAG)", how: "named", by: "Patrick Lewis and colleagues at Facebook AI Research", when: "2020-05", label: "May 2020",
    plain: "Look things up first, then let the model answer with what it found in front of it.", was: "Search, then summarise.",
    source: { label: "Lewis et al., arXiv 2005.11401", url: "https://arxiv.org/abs/2005.11401" }, jargon: "rag", skill: "retrieval" },
  { id: "chain-of-thought", term: "Chain of thought", how: "named", by: "Jason Wei and colleagues at Google", when: "2022-01", label: "January 2022",
    plain: "Ask the model to show its working before the answer, and it gets more answers right.", was: "Show your working.",
    source: { label: "Wei et al., arXiv 2201.11903", url: "https://arxiv.org/abs/2201.11903" }, jargon: "chain-of-thought" },
  { id: "prompt-injection", term: "Prompt injection", how: "coined", by: "Simon Willison", when: "2022-09-12", label: "12 September 2022",
    plain: "Text hidden in the input that tells the model to ignore your instructions and follow someone else's.", was: "SQL injection, for language.",
    note: "He named it; he did not discover the attack.", source: { label: "simonwillison.net", url: "https://simonwillison.net/2022/Sep/12/prompt-injection/" }, jargon: "prompt-injection", skill: "security" },
  { id: "llm-as-a-judge", term: "LLM as a judge", how: "named", by: "Lianmin Zheng and colleagues", when: "2023-06", label: "June 2023",
    plain: "Use one model to grade another model's answers against a rubric, so you can test at scale.", was: "A marking scheme, applied by a machine.",
    source: { label: "Zheng et al., arXiv 2306.05685", url: "https://arxiv.org/abs/2306.05685" }, jargon: "llm-as-judge", skill: "evals" },
  { id: "ai-engineer", term: "AI engineer", how: "coined", by: "swyx (Shawn Wang)", when: "2023-06-30", label: "30 June 2023",
    plain: "A software engineer who builds products on top of models, rather than training the models.", was: "A software engineer with a new kind of API.",
    source: { label: "The Rise of the AI Engineer, Latent Space", url: "https://www.latent.space/p/ai-engineer" } },
  { id: "agentic", term: "Agentic", how: "popularised", by: "Andrew Ng", when: "2024-03", label: "March 2024",
    plain: "Software where the model plans, uses tools and checks its own work over several steps, not one reply.", was: "A loop with tools.",
    note: "Ng says he coined it; no primary source shows he was first.", source: { label: "Bain interview with Andrew Ng", url: "https://www.bain.com/es-ar/insights/winning-in-the-agentic-era-a-conversation-with-andrew-ng/" }, skill: "agents" },
  { id: "slop", term: "Slop (AI slop)", how: "popularised", by: "Simon Willison, after a post by @deepfates", when: "2024-05-08", label: "8 May 2024",
    plain: "AI-made content nobody asked for and nobody checked.", was: "Spam.",
    source: { label: "simonwillison.net", url: "https://simonwillison.net/2024/May/8/slop/" } },
  { id: "mcp", term: "Model Context Protocol (MCP)", how: "named", by: "Anthropic", when: "2024-11-25", label: "25 November 2024",
    plain: "One standard plug so any AI app can use any tool or data source.", was: "An API standard, like USB for tools.",
    source: { label: "Anthropic", url: "https://www.anthropic.com/news/model-context-protocol" }, jargon: "mcp", skill: "agents" },
  { id: "vibe-coding", term: "Vibe coding", how: "coined", by: "Andrej Karpathy", when: "2025-02-02", label: "2 February 2025",
    plain: "Building software by asking an AI for changes and accepting them without reading the code.", was: "Prototyping, without the review.",
    note: "He later called it a throwaway post.", source: { label: "American Dialect Society list, citing the post", url: "https://listserv.linguistlist.org/pipermail/ads-l/2025-March/166588.html" }, skill: "ai-dev" },
  { id: "context-engineering", term: "Context engineering", how: "popularised", by: "Tobi Lütke, then Andrej Karpathy", when: "2025-06-18", label: "June 2025",
    plain: "Deciding everything the model sees before it answers: instructions, documents, tools, history.", was: "Prompt engineering plus retrieval.",
    note: "Used earlier by Ankur Goyal (April 2025) and Walden Yan (June 2025).", source: { label: "simonwillison.net", url: "https://simonwillison.net/2025/Jun/27/context-engineering/" }, jargon: "context-engineering", skill: "context" },
  { id: "agent-skills", term: "Agent Skills", how: "named", by: "Anthropic", when: "2025-10-16", label: "16 October 2025",
    plain: "Folders of instructions and scripts an agent loads only when a task needs them.", was: "A runbook the agent can open.",
    source: { label: "Anthropic", url: "https://www.anthropic.com/news/skills" }, jargon: "agent-skills", skill: "agents" },
  { id: "harness-engineering", term: "Harness engineering", how: "popularised", by: "Ryan Lopopolo, OpenAI", when: "2026-02-11", label: "February 2026",
    plain: "Building the tests, docs and checks that keep coding agents on track, instead of writing the code yourself.", was: "CI, linting and good docs, aimed at agents.",
    note: "Mitchell Hashimoto used the phrase a few days earlier and disclaims inventing it.", source: { label: "His AI Engineer Europe 2026 talk", url: "https://ai.engineer/talks/am_oeAoUhew-harness-engineering" }, skill: "ai-dev" },
  { id: "forward-deployed-engineer", term: "Forward deployed engineer", how: "named", by: "Palantir", when: "2010", label: "early 2010s",
    plain: "An engineer who works inside the customer's team and ships what that customer needs.", was: "A solutions engineer who writes production code.",
    note: "The exact first year is disputed.", source: { label: "The Pragmatic Engineer", url: "https://newsletter.pragmaticengineer.com/p/forward-deployed-engineers" }, skill: "customer" },
];
