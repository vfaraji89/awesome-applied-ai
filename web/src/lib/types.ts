export type LayerId =
  | "retrieval"
  | "memory"
  | "caching"
  | "orchestration"
  | "evaluation"
  | "governance";

export type Kind = "tool" | "spec" | "research" | "regulation";

export type SourceModel = "oss" | "source-available" | "commercial" | "hybrid";

export type Status = "active" | "slowing" | "stalled" | "deprecated";

export type Maturity =
  | "production-common"
  | "production-viable"
  | "early"
  | "research"
  | "fragile";

export type Deployment = "self-host" | "saas" | "both";

/** The eleven areas of the tool map: all of applied AI, not only the LLM app stack. */
export type ToolArea = "data" | "models" | "training" | "inference" | "retrieval" | "agents" | "evaluation" | "governance" | "modalities" | "builders" | "landscape";

export interface Tool {
  id: string;
  name: string;
  area: ToolArea;
  /** Set only for tools that belong to one of the six AI-native architecture layers. */
  layer?: LayerId;
  category: string;
  summary: string;
  license: string;
  model: SourceModel;
  url: string;
  /** The main public GitHub repository, "owner/repo"; its stars and dates come from pipeline/github-stats.ts. */
  github?: string;
  /** First public release or GA, "YYYY-MM"; when empty the repo's creation month stands in. */
  launched?: string;
  /** Simple Icons slug (simpleicons.org); empty when the brand has no icon there. */
  icon?: string;
  /** Launched or reached GA recently and gaining adoption; always with a dated reason and a source. */
  emerging?: boolean;
  emergingWhy?: string;
  emergingSource?: string;
  kind?: Kind;
  status?: Status;
  maturity?: Maturity;
  deployment?: Deployment;
  note?: string;
  tags: string[];
}

export interface Category {
  id: string;
  name: string;
  blurb: string;
}

export interface Formula {
  id: string;
  label: string;
  tex: string;
  note: string;
}

export interface Plain {
  headline: string;
  body: string;
}

export interface FlowStep {
  id: string;
  label: string;
  plain: string;
}

export interface Layer {
  id: LayerId;
  name: string;
  tagline: string;
  question: string;
  categories: Category[];
  formulas: Formula[];
  notes: string[];
  plain?: Plain;
  flow?: FlowStep[];
}

export type ShelfId = "agents" | "terminal" | "apps" | "mcp" | "corpora";

export interface Shelf {
  id: ShelfId;
  name: string;
  tagline: string;
  intro: string;
}

export interface KitEntry {
  id: string;
  name: string;
  shelf: ShelfId;
  summary: string;
  /** When to reach for it, or when not to. The part a list of links leaves out. */
  reach: string;
  install?: string;
  url: string;
  tags: string[];
  pick?: boolean;
}

export type FieldId =
  | "llm"
  | "serving"
  | "retrieval"
  | "agents"
  | "training"
  | "evaluation"
  | "data"
  | "production"
  | "governance";

export interface Field {
  id: FieldId;
  name: string;
  tagline: string;
  intro: string;
}

export interface Term {
  id: string;
  term: string;
  field: FieldId;
  /** One line. What it is, with the number or mechanism that makes it concrete. */
  short: string;
  /** The follow-up. What a good answer adds once the definition is out of the way. */
  detail: string;
  /** Abbreviations and alternate names, so search finds it either way. */
  also?: string[];
  /** The form it takes when someone asks about it. */
  asked?: string;
  /** Where to read more, such as a benchmark's own site. */
  link?: { label: string; href: string };
  tags: string[];
}

export type ToolboxId =
  | "shell"
  | "git"
  | "python"
  | "containers"
  | "kubernetes"
  | "cloud"
  | "data"
  | "models"
  | "gpu"
  | "net";

export interface Toolbox {
  id: ToolboxId;
  name: string;
  tagline: string;
  intro: string;
}

export interface Command {
  id: string;
  cmd: string;
  box: ToolboxId;
  /** What it does. */
  what: string;
  /** Why you reach for this rather than the obvious alternative. */
  when: string;
  tags: string[];
  pick?: boolean;
}

export interface Stage {
  id: string;
  n: string;
  name: string;
  question: string;
  decides: string;
  trap: string;
  layer?: LayerId;
  problems: string[];
}

export interface Build {
  id: string;
  name: string;
  stage: string;
  builds: string;
  teaches: string;
  measure: string;
  effort: string;
}

export interface Shipped {
  id: string;
  name: string;
  sector: string;
  year: string;
  problem: string;
  approach: string;
  numbers: { label: string; value: string }[];
  stages: string[];
  stack: string[];
}

export type DomainStatus = "written" | "drafting" | "planned";

export interface Domain {
  id: string;
  numeral: string;
  name: string;
  question: string;
  scope: string[];
  status: DomainStatus;
  color: string;
  href?: string;
  entries: number;
  target: number;
}
