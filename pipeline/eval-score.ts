/* Score the rules against the hand labels, month by month, and write web/src/data/eval.json for the
   method page. Every rate comes with its sample size and a 95% range (Wilson), so a small sample
   reads as what it is. Months with fewer than 20 labelled ads are listed but not scored.
   bun pipeline/eval-score.ts */
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dir, "..");
const EVAL = path.join(root, "eval");
type Pred = { ai: boolean; role: string; seniority: string; skills: string[]; tasks: string[] };
type Item = { key: string; source: string; pred: Pred };
type Label = { gone?: boolean; ai?: boolean; role?: string | null; seniority?: string | null; skills?: string[]; tasks?: string[] };

/** k of n, as a percentage with its 95% Wilson range. */
const rate = (k: number, n: number) => {
  if (!n) return { pct: null, low: null, high: null, k, n };
  const z = 1.96, p = k / n, d = 1 + (z * z) / n;
  const c = (p + (z * z) / (2 * n)) / d, h = (z * Math.sqrt((p * (1 - p)) / n + (z * z) / (4 * n * n))) / d;
  const r = (x: number) => Math.round(x * 1000) / 10;
  return { pct: r(p), low: r(Math.max(0, c - h)), high: r(Math.min(1, c + h)), k, n };
};

/** Precision and recall of a multi-label field, overall and per value. */
function multi(pairs: { p: string[]; l: string[] }[]) {
  const ids = [...new Set(pairs.flatMap((x) => [...x.p, ...x.l]))].sort();
  let tp = 0, fp = 0, fn = 0;
  const per = ids.map((id) => {
    let t = 0, f = 0, m = 0;
    for (const { p, l } of pairs) { const a = p.includes(id), b = l.includes(id); if (a && b) t++; else if (a) f++; else if (b) m++; }
    tp += t; fp += f; fn += m;
    return { id, precision: rate(t, t + f), recall: rate(t, t + m), asked: t + m };
  });
  return { precision: rate(tp, tp + fp), recall: rate(tp, tp + fn), per };
}

const months = readdirSync(EVAL).filter((f) => /^sample-\d{4}-\d{2}\.json$/.test(f)).sort().map((f) => f.slice(7, 14));
const out = months.map((month) => {
  const sample = JSON.parse(readFileSync(path.join(EVAL, `sample-${month}.json`), "utf8")) as { items: Item[] };
  const lp = path.join(EVAL, `labels-${month}.json`);
  const labels: Record<string, Label> = existsSync(lp) ? JSON.parse(readFileSync(lp, "utf8")) : {};
  const done = sample.items.filter((x) => labels[x.key] && !labels[x.key].gone);
  const base = { month, sampled: sample.items.length, labelled: done.length, gone: sample.items.filter((x) => labels[x.key]?.gone).length };
  if (done.length < 20) return { ...base, scored: false };
  const kept = done.filter((x) => x.pred.ai), left = done.filter((x) => !x.pred.ai);
  const both = kept.filter((x) => labels[x.key].ai);
  const conf = new Map<string, number>();
  for (const x of both) { const l = labels[x.key].role; if (l && l !== x.pred.role) conf.set(`${x.pred.role}>${l}`, (conf.get(`${x.pred.role}>${l}`) ?? 0) + 1); }
  const withRole = both.filter((x) => labels[x.key].role), withSen = both.filter((x) => labels[x.key].seniority);
  return {
    ...base, scored: true,
    // of the ads the rules kept as AI job ads, how many really are
    kept: rate(kept.filter((x) => labels[x.key].ai).length, kept.length),
    // of the tech ads the AI rule left out, how many were AI job ads after all
    missed: rate(left.filter((x) => labels[x.key].ai).length, left.length),
    role: { ...rate(withRole.filter((x) => labels[x.key].role === x.pred.role).length, withRole.length),
      confusions: [...conf.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([k, n]) => ({ said: k.split(">")[0], was: k.split(">")[1], n })) },
    seniority: rate(withSen.filter((x) => labels[x.key].seniority === x.pred.seniority).length, withSen.length),
    skills: multi(both.map((x) => ({ p: x.pred.skills, l: labels[x.key].skills ?? [] }))),
    tasks: multi(both.map((x) => ({ p: x.pred.tasks, l: labels[x.key].tasks ?? [] }))),
  };
});
writeFileSync(path.join(root, "web/src/data/eval.json"), JSON.stringify({ updated: new Date().toISOString().slice(0, 10), months: out }, null, 1) + "\n");
for (const m of out) console.log(m.month, m.scored ? `scored ${m.labelled} ads` : `${m.labelled} of ${m.sampled} labelled, not scored yet`);
if (!out.length) console.log("No samples yet.");
