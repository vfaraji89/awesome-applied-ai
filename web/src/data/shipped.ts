import type { Shipped } from "@/lib/types";

export const shipped: Shipped[] = [
  {
    id: "classification-cascade",
    name: "A three tier classification cascade for job taxonomy",
    sector: "Labour market data platform",
    year: "2026",
    problem:
      "Free text job titles in five languages had to resolve to a controlled taxonomy. A single LLM call per title was accurate enough and far too expensive to run at catalogue scale.",
    approach:
      "Three tiers, cheapest first. A cache fronted by a Bloom filter answers anything seen before. A keyword engine covering eight domains handles the long tail of predictable titles. Only what survives both reaches the model. A review queue catches low confidence output before it enters the taxonomy, and a separate agent path runs a three phase plan of database lookup, then trend and URL enrichment in parallel, then search, then synthesis.",
    numbers: [
      { label: "Tier 1 cache, P50", value: "48 ms" },
      { label: "Tier 2 keyword, P50", value: "180 ms" },
      { label: "Tier 2 accuracy", value: "81.6%" },
      { label: "Tier 3 model, P50", value: "1.2 s" },
      { label: "Tier 3 accuracy", value: "95.0%" },
      { label: "Languages", value: "5" },
      { label: "Bulk import ceiling", value: "10k rows" },
    ],
    stages: ["ground", "assemble", "orchestrate", "prove", "serve", "govern"],
    stack: [
      "Next.js",
      "TypeScript",
      "PostgreSQL",
      "Gemini 2.5 Flash",
      "Zod",
      "Vitest",
    ],
  },
  {
    id: "contract-risk-agents",
    name: "Contract risk and renewal agents inside the office suite",
    sector: "Procurement and finance",
    year: "2025",
    problem:
      "Procurement contracts sat in a document library nobody read end to end. Penalty clauses, unilateral termination rights and price escalation terms were discovered after they bit.",
    approach:
      "Two declarative agents grounded on the existing document library and list, so nothing left the tenancy and no new system had to be adopted. The first reads a contract and scores each clause across delay and performance penalties, indemnity, termination notice, payment maturity and currency exposure. The second tracks end dates for services, licences and rentals and issues reminders on a fixed schedule.",
    numbers: [
      { label: "Agents", value: "2" },
      { label: "Risk tiers", value: "3" },
      { label: "Clause categories scored", value: "5" },
      { label: "New systems introduced", value: "0" },
    ],
    stages: ["frame", "source", "ground", "govern"],
    stack: [
      "Microsoft 365 Copilot",
      "Declarative agents",
      "SharePoint",
      "Teams Toolkit",
    ],
  },
  {
    id: "gsm-speech",
    name: "Speech recognition on telephone grade audio",
    sector: "Voice channel operations",
    year: "2025",
    problem:
      "Call audio arrived narrowband and heavily compressed. Off the shelf transcription was tuned for clean wideband speech and degraded badly on it.",
    approach:
      "A pipeline that treats the codec as the primary variable. Raw captures are held alongside every transcript so a regression can be replayed against the original bytes rather than against a re encoded copy, and a smoke set runs on each change.",
    numbers: [
      { label: "Audio path", value: "GSM narrowband" },
      { label: "Artefacts kept per call", value: "raw, wav, transcript" },
    ],
    stages: ["source", "prove", "serve"],
    stack: ["Azure Speech", "Python", "Shell"],
  },
  {
    id: "schema-compaction",
    name: "Schema compaction for text to SQL",
    sector: "Internal data tooling",
    year: "2025",
    problem:
      "The full database schema did not fit usefully in the prompt. Sending all of it crowded out the question; sending a guess at the relevant part broke joins.",
    approach:
      "A compaction step that rewrites the schema into a compact representation carrying only the tables, keys and relationships a query can reach, with a test suite of known queries to catch the compaction dropping something a join needed.",
    numbers: [
      { label: "Prompt component", value: "schema, compacted" },
      { label: "Regression suite", value: "SQL tests" },
    ],
    stages: ["assemble", "prove"],
    stack: ["Python", "YAML", "SQL"],
  },
  {
    id: "token-economics",
    name: "Token accounting for agent systems",
    sector: "Research instrument",
    year: "2026",
    problem:
      "Agent setups are quoted in capabilities and paid for in tokens. The fixed prefix cost of a harness, per turn, was invisible to the people choosing between harnesses.",
    approach:
      "A measurement instrument rather than a product. Formalise the occupancy of a context window, name the symbols, and compute what a given configuration costs before it does any work.",
    numbers: [
      { label: "Symbols catalogued", value: "150" },
      { label: "Source files indexed", value: "56" },
    ],
    stages: ["frame", "assemble", "serve"],
    stack: ["TypeScript", "LaTeX", "Python"],
  },
];
