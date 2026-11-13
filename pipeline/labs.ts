/* AI labs, model providers and hiring tools the tracker looks for by name (pipeline/boards.ts),
   and labels on the sources page. */
/** Labs, model providers and hiring tools to look for by name, with the slugs worth trying. */
export const LABS: { name: string; slugs: string[]; kind: "lab" | "recruiting" }[] = [
  { name: "OpenAI", slugs: ["openai"], kind: "lab" }, { name: "Anthropic", slugs: ["anthropic"], kind: "lab" },
  { name: "Google DeepMind", slugs: ["deepmind", "googledeepmind"], kind: "lab" }, { name: "Mistral AI", slugs: ["mistral", "mistralai"], kind: "lab" },
  { name: "Cohere", slugs: ["cohere"], kind: "lab" }, { name: "xAI", slugs: ["xai"], kind: "lab" }, { name: "Perplexity", slugs: ["perplexity", "perplexityai"], kind: "lab" },
  { name: "Hugging Face", slugs: ["huggingface"], kind: "lab" }, { name: "Together AI", slugs: ["togetherai"], kind: "lab" },
  { name: "Fireworks AI", slugs: ["fireworksai", "fireworks"], kind: "lab" }, { name: "Groq", slugs: ["groq", "groqinc"], kind: "lab" },
  { name: "Cerebras", slugs: ["cerebrassystems", "cerebras"], kind: "lab" }, { name: "AI21 Labs", slugs: ["ai21", "ai21labs"], kind: "lab" },
  { name: "Character.AI", slugs: ["character", "characterai"], kind: "lab" }, { name: "Reka", slugs: ["reka", "rekaai"], kind: "lab" },
  { name: "Stability AI", slugs: ["stabilityai", "stability"], kind: "lab" }, { name: "Black Forest Labs", slugs: ["blackforestlabs"], kind: "lab" },
  { name: "Thinking Machines Lab", slugs: ["thinkingmachines"], kind: "lab" }, { name: "Safe Superintelligence", slugs: ["ssi"], kind: "lab" },
  { name: "Reflection AI", slugs: ["reflectionai"], kind: "lab" }, { name: "Poolside", slugs: ["poolside"], kind: "lab" },
  { name: "Magic", slugs: ["magic"], kind: "lab" }, { name: "Weights & Biases", slugs: ["wandb", "weightsandbiases"], kind: "lab" },
  { name: "Juicebox", slugs: ["juicebox", "juiceboxai"], kind: "recruiting" },
];

/** The lab or tool a board slug belongs to, when it is one of these. */
export const labOf = (slug: string) => LABS.find((l) => l.slugs.includes(slug.toLowerCase()));
