import { createElement, type SVGProps } from "react";
import {
  AlignLeft,
  Boxes,
  Braces,
  Building2,
  Cable,
  ChartScatter,
  Circle,
  ClipboardList,
  Cloud,
  Coins,
  Cpu,
  Database,
  FileText,
  Gauge,
  GitBranch,
  HardDrive,
  Layers,
  LayoutGrid,
  Minimize2,
  Network,
  Ruler,
  Scale,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Target,
  Terminal,
  Zap,
  type LucideIcon,
} from "lucide-react";

export type GlyphName =
  | "vector-db"
  | "hybrid-search"
  | "embeddings-rerankers"
  | "parsing-ingestion"
  | "managed-retrieval"
  | "graph-retrieval"
  | "memory-systems"
  | "native-memory"
  | "provider-caching"
  | "kv-caching"
  | "compression"
  | "token-accounting"
  | "long-context"
  | "frameworks"
  | "prompt-optimization"
  | "protocols"
  | "structured-output"
  | "tracing"
  | "eval-frameworks"
  | "guardrails"
  | "governance-tooling"
  | "regulation"
  | "context-engineering"
  | "enterprise"
  | "serving"
  | "data"
  | "delivery"
  | "dot";

const glyphs: Record<GlyphName, LucideIcon> = {
  "vector-db": Database,
  "hybrid-search": Search,
  "embeddings-rerankers": ChartScatter,
  "parsing-ingestion": FileText,
  "managed-retrieval": Cloud,
  "graph-retrieval": Network,
  "memory-systems": HardDrive,
  "native-memory": Cpu,
  "provider-caching": Zap,
  "kv-caching": Layers,
  compression: Minimize2,
  "token-accounting": Coins,
  "long-context": Ruler,
  frameworks: LayoutGrid,
  "prompt-optimization": SlidersHorizontal,
  protocols: Cable,
  "structured-output": Braces,
  tracing: AlignLeft,
  "eval-frameworks": Target,
  guardrails: ShieldCheck,
  "governance-tooling": ClipboardList,
  regulation: Scale,
  "context-engineering": Terminal,
  enterprise: Building2,
  serving: Gauge,
  data: Boxes,
  delivery: GitBranch,
  dot: Circle,
};

export function Glyph({
  name,
  ...props
}: { name: GlyphName | string } & SVGProps<SVGSVGElement>) {
  const Icon = glyphs[name as GlyphName] ?? Circle;
  return createElement(Icon, { "aria-hidden": true, strokeWidth: 1.5, ...props });
}
