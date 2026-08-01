import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..", "..");
const source = path.join(root, "system-design.md");
const outDir = path.resolve(import.meta.dirname, "..", "src", "data");

/**
 * Which of the six layers each problem belongs to, and its URL. Editorial —
 * the document groups by theme, the site groups by layer, and the two differ.
 */
const taxonomy = {
  1: ["catalog-retrieval-at-scale", "retrieval"],
  2: ["filter-selectivity-collapse", "retrieval"],
  3: ["chunking-a-mixed-corpus", "retrieval"],
  4: ["incremental-re-embedding", "retrieval"],
  5: ["when-multi-agent-is-wrong", "orchestration"],
  6: ["topology-and-context-isolation", "orchestration"],
  7: ["loop-termination-and-budget-gates", "orchestration"],
  8: ["stateless-mcp-migration", "orchestration"],
  9: ["tool-namespace-explosion", "orchestration"],
  10: ["the-mcp-caching-contract", "caching"],
  11: ["when-graphrag-earns-its-cost", "retrieval"],
  12: ["the-query-routing-layer", "retrieval"],
  13: ["the-long-context-trade-point", "caching"],
  14: ["multi-tenant-isolation", "retrieval"],
  15: ["fusion-is-not-the-tuning-knob", "retrieval"],
  16: ["proving-the-pipeline-is-better", "evaluation"],
  17: ["handoff-contracts", "orchestration"],
  18: ["compensation-mid-flight", "orchestration"],
  19: ["approval-across-a-long-pause", "orchestration"],
  20: ["reproducing-a-failure", "evaluation"],
};

const INLINE = /\*\*([^*]+)\*\*|\*([^*]+)\*|`([^`]+)`/g;

function inline(text) {
  const out = [];
  let last = 0;
  for (const m of text.matchAll(INLINE)) {
    if (m.index > last) out.push({ t: "text", v: text.slice(last, m.index) });
    if (m[1] !== undefined) out.push({ t: "b", v: m[1] });
    else if (m[2] !== undefined) out.push({ t: "i", v: m[2] });
    else out.push({ t: "c", v: m[3] });
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push({ t: "text", v: text.slice(last) });
  return out;
}

const cells = (row) =>
  row
    .trim()
    .replace(/^\||\|$/g, "")
    .split("|")
    .map((c) => c.trim());

function blocks(lines) {
  const out = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (!line.trim() || line.trim() === "---") {
      i += 1;
      continue;
    }

    if (line.startsWith("> ")) {
      const buf = [];
      while (i < lines.length && lines[i].startsWith("> ")) {
        buf.push(lines[i].slice(2).trim());
        i += 1;
      }
      out.push({ t: "quote", c: inline(buf.join(" ").replace(/^"|"$/g, "")) });
      continue;
    }

    if (line.startsWith("|") && lines[i + 1]?.startsWith("|-")) {
      const head = cells(line);
      i += 2;
      const rows = [];
      while (i < lines.length && lines[i].startsWith("|")) {
        rows.push(cells(lines[i]).map(inline));
        i += 1;
      }
      out.push({ t: "table", head, rows });
      continue;
    }

    if (/^\d+\.\s/.test(line)) {
      const items = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        const buf = [lines[i].replace(/^\d+\.\s+/, "")];
        i += 1;
        while (i < lines.length && lines[i].trim() && !/^\d+\.\s/.test(lines[i]) && !lines[i].startsWith("|")) {
          buf.push(lines[i].trim());
          i += 1;
        }
        items.push(inline(buf.join(" ")));
      }
      out.push({ t: "ol", items });
      continue;
    }

    const buf = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      lines[i].trim() !== "---" &&
      !lines[i].startsWith("|") &&
      !lines[i].startsWith("> ") &&
      !/^\d+\.\s/.test(lines[i])
    ) {
      buf.push(lines[i].trim());
      i += 1;
    }
    out.push({ t: "p", c: inline(buf.join(" ")) });
  }

  return out;
}

const plain = (nodes) => nodes.map((n) => n.v).join("");

const raw = readFileSync(source, "utf8").split("\n");

/** The document's own grouping table, which covers all fifty including the unwritten ones. */
const roadmap = raw
  .filter((l) => /^\| \d+-\d+ \|/.test(l))
  .map((l) => {
    const [range, items, section] = cells(l);
    const [first, last] = range.split("-").map(Number);
    return { range, first, last, items: items.replace(/`/g, ""), section };
  });

if (!roadmap.length) throw new Error("Roadmap table not found");

const heads = [];
raw.forEach((line, n) => {
  const m = /^## (\d+)\.\s+(.+)$/.exec(line);
  if (m) heads.push({ n: Number(m[1]), title: m[2].trim(), line: n });
});

const problems = heads.map((head, idx) => {
  const end = heads[idx + 1]?.line ?? raw.findIndex((l) => l.startsWith("*Items 21-50"));
  const body = blocks(raw.slice(head.line + 1, end));
  const entry = taxonomy[head.n];
  if (!entry) throw new Error(`No taxonomy entry for problem ${head.n}`);
  const quote = body.find((b) => b.t === "quote");
  if (!quote) throw new Error(`Problem ${head.n} has no question`);
  return {
    id: entry[0],
    n: head.n,
    title: head.title,
    layer: entry[1],
    asked: plain(quote.c),
    body: body.filter((b) => b.t !== "quote"),
  };
});

if (problems.length !== Object.keys(taxonomy).length) {
  throw new Error(`Parsed ${problems.length} problems, taxonomy has ${Object.keys(taxonomy).length}`);
}

const banner = `// Generated by scripts/build-problems.mjs from system-design.md. Do not edit.\n`;

writeFileSync(
  path.join(outDir, "problems.ts"),
  banner +
    `import type { LayerId } from "@/lib/types";\n\n` +
    `export type ProblemMeta = {\n  id: string;\n  n: number;\n  title: string;\n  layer: LayerId;\n  asked: string;\n};\n\n` +
    `export const problems: ProblemMeta[] = ${JSON.stringify(
      problems.map(({ body, ...meta }) => meta),
      null,
      2,
    )};\n\n` +
    `export const problemById = new Map(problems.map((p) => [p.id, p]));\n\n` +
    `export type RoadmapRow = {\n  range: string;\n  first: number;\n  last: number;\n  items: string;\n  section: string;\n};\n\n` +
    `export const roadmap: RoadmapRow[] = ${JSON.stringify(roadmap, null, 2)};\n\n` +
    `export const problemsPlanned = ${Math.max(...roadmap.map((r) => r.last))};\n`,
);

writeFileSync(
  path.join(outDir, "problem-bodies.ts"),
  banner +
    `import type { Block } from "@/components/prose";\n\n` +
    `export const problemBodies: Record<string, Block[]> = ${JSON.stringify(
      Object.fromEntries(problems.map((p) => [p.id, p.body])),
      null,
      2,
    )};\n`,
);

const counts = problems.reduce((a, p) => ({ ...a, [p.layer]: (a[p.layer] ?? 0) + 1 }), {});
console.log(
  `problems: ${problems.length} · blocks: ${problems.reduce((n, p) => n + p.body.length, 0)} · ` +
    Object.entries(counts)
      .map(([k, v]) => `${k} ${v}`)
      .join(", "),
);
