/* Monthly check of the sources each doc is written from (web/src/data/doc-sources.json).
   For every source it records a fingerprint in pipeline/doc-snapshots.json and compares it with
   last month's: a new spec version, new commits to the spec docs, a new SDK release, or a page
   whose text changed. It never rewrites a doc; it writes what changed into doc-sources.json and,
   when anything did, opens one issue listing which doc to review and why.
   bun pipeline/docs-watch.ts          check, write, open an issue when something changed
   bun pipeline/docs-watch.ts --dry    check and report only */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";

const root = path.resolve(import.meta.dir, "..");
const SRC = path.join(root, "web/src/data/doc-sources.json");
const SNAP = path.join(import.meta.dir, "doc-snapshots.json");
const dry = process.argv.includes("--dry");
const today = new Date().toISOString().slice(0, 10);
const TOKEN = process.env.GITHUB_TOKEN ?? "";
const REPO = process.env.GITHUB_REPOSITORY ?? "vfaraji89/applied-ai-simplified";
const UA = { "User-Agent": "applied-ai-simplified docs watch (+https://github.com/vfaraji89/applied-ai-simplified)" };
const gh = async (p: string) => {
  const r = await fetch(`https://api.github.com/${p}`, { headers: { ...UA, Accept: "application/vnd.github+json", ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}) } });
  if (!r.ok) throw new Error(`${r.status} github ${p}`);
  return r.json();
};
const text = (html: string) => html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").replace(/&[a-z#0-9]+;/gi, " ").replace(/\s+/g, " ").trim();
const sha = (s: string) => createHash("sha256").update(s).digest("hex").slice(0, 16);

type Source = { kind: "spec-versions" | "commits" | "release" | "page"; repo?: string; path?: string; url?: string };
type Doc = { id: string; states?: string; latest: string | null; checked: string | null; changes?: string[]; sources: Source[] };
const cfg = JSON.parse(readFileSync(SRC, "utf8")) as { _note: string; docs: Doc[] };
const snaps: Record<string, { value: string; at: string }> = existsSync(SNAP) ? JSON.parse(readFileSync(SNAP, "utf8")) : {};

const key = (s: Source) => `${s.kind}:${s.repo ?? s.url}${s.path ? `/${s.path}` : ""}`;
async function look(s: Source): Promise<{ value: string; note: string; latest?: string }> {
  if (s.kind === "spec-versions") {
    const items = (await gh(`repos/${s.repo}/contents/${s.path}`)) as { name: string; type: string }[];
    const dated = items.map((x) => x.name).filter((n) => /^\d{4}-\d{2}-\d{2}$/.test(n)).sort();
    const latest = dated.at(-1) ?? "";
    return { value: dated.join(","), note: `spec versions: ${dated.join(", ")}`, latest };
  }
  if (s.kind === "commits") {
    const items = (await gh(`repos/${s.repo}/commits?path=${encodeURIComponent(s.path ?? "")}&per_page=5`)) as { sha: string; commit: { message: string; committer: { date: string } } }[];
    const top = items[0];
    return { value: top?.sha ?? "", note: top ? `latest change ${top.commit.committer.date.slice(0, 10)}: ${top.commit.message.split("\n")[0].slice(0, 90)}` : "no commits found" };
  }
  if (s.kind === "release") {
    const r = (await gh(`repos/${s.repo}/releases/latest`)) as { tag_name: string; published_at: string };
    return { value: r.tag_name, note: `latest release ${r.tag_name} (${r.published_at.slice(0, 10)})` };
  }
  const r = await fetch(s.url!, { headers: UA, redirect: "follow" });
  if (!r.ok) throw new Error(`${r.status} ${s.url}`);
  const t = text(await r.text());
  return { value: sha(t), note: `page text ${t.length.toLocaleString("en-US")} characters` };
}

const report: string[] = [];
let changed = 0;
for (const d of cfg.docs) {
  const changes: string[] = [];
  for (const s of d.sources) {
    const k = key(s);
    try {
      const got = await look(s);
      const before = snaps[k];
      const isNew = before && before.value !== got.value;
      if (got.latest) d.latest = got.latest;
      if (isNew) changes.push(`${k}: ${got.note} (was ${before.value.slice(0, 40)})`);
      console.log(`${isNew ? "CHANGED" : before ? "same   " : "first  "} ${d.id.padEnd(16)} ${k}  ${got.note}`);
      snaps[k] = { value: got.value, at: today };
    } catch (e) {
      console.log(`FAIL    ${d.id.padEnd(16)} ${k}  ${String((e as Error).message).slice(0, 120)}`);
    }
  }
  if (d.states && d.latest && d.latest > d.states) changes.push(`the doc states spec version ${d.states}; the latest is ${d.latest}`);
  d.checked = today;
  d.changes = changes;
  if (changes.length) { changed++; report.push(`### ${d.id}\n${changes.map((c) => `- ${c}`).join("\n")}`); }
}

console.log(changed ? `\n${changed} doc(s) to review` : "\nNo source changed since the last check.");
if (dry) process.exit(0);
writeFileSync(SRC, JSON.stringify(cfg, null, 1) + "\n");
writeFileSync(SNAP, JSON.stringify(snaps, null, 1) + "\n");
if (changed && TOKEN) {
  const body = `The monthly docs watch found changes in the sources these docs are written from. Review each doc against its sources and update what is out of date.\n\n${report.join("\n\n")}\n\nChecked ${today} by pipeline/docs-watch.ts.`;
  const r = await fetch(`https://api.github.com/repos/${REPO}/issues`, { method: "POST", headers: { ...UA, Accept: "application/vnd.github+json", Authorization: `Bearer ${TOKEN}` },
    body: JSON.stringify({ title: `Docs to review: sources changed (${today})`, body, labels: ["docs"] }) });
  console.log(r.ok ? "opened an issue" : `could not open an issue: ${r.status}`);
}
