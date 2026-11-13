/* Weekly snapshots. One small file per ISO week in market/weekly/, so the site can show
   how the market moves over time without re-reading the whole store.
   A week's file is rewritten on every run during that week and is final once the week ends.
   bun pipeline/weekly.ts    rebuild every week's file from the store */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import path from "node:path";
import type { Job } from "./types";

const root = path.resolve(import.meta.dir, "..");
const DIR = path.join(root, "market", "weekly");

/** ISO week of a YYYY-MM-DD date, as "2026-W46", with the Monday and Sunday that bound it. */
export function isoWeek(day: string): { id: string; from: string; to: string } {
  const d = new Date(day + "T00:00:00Z");
  const dow = (d.getUTCDay() + 6) % 7; // Monday = 0
  const monday = new Date(d.getTime() - dow * 864e5);
  const thursday = new Date(monday.getTime() + 3 * 864e5);
  const jan4 = new Date(Date.UTC(thursday.getUTCFullYear(), 0, 4));
  const week1 = new Date(jan4.getTime() - ((jan4.getUTCDay() + 6) % 7) * 864e5);
  const n = 1 + Math.round((monday.getTime() - week1.getTime()) / (7 * 864e5));
  const iso = (x: Date) => x.toISOString().slice(0, 10);
  return { id: `${thursday.getUTCFullYear()}-W${String(n).padStart(2, "0")}`, from: iso(monday), to: iso(new Date(monday.getTime() + 6 * 864e5)) };
}

const top = (xs: string[], n: number) => {
  const m = new Map<string, number>();
  for (const x of xs) if (x) m.set(x, (m.get(x) ?? 0) + 1);
  return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, n).map(([id, n]) => ({ id, n }));
};

/** Write the snapshot for each given week (default: every week in the store). Returns the ids written. */
export function writeWeekly(all: Job[], onlyWeekOf?: string): string[] {
  if (!all.length) return [];
  const firstDay = all.map((j) => j.firstSeen).sort()[0];
  const weeks = new Map<string, { from: string; to: string }>();
  const days = onlyWeekOf ? [onlyWeekOf] : [...new Set(all.flatMap((j) => [j.firstSeen, j.lastSeen]))];
  for (const d of days) { const w = isoWeek(d); weeks.set(w.id, { from: w.from, to: w.to }); }
  mkdirSync(DIR, { recursive: true });
  const written: string[] = [];
  for (const [id, { from, to }] of weeks) {
    // open during the week: seen at least once inside it
    const open = all.filter((j) => j.firstSeen <= to && j.lastSeen >= from);
    // new in the week; the first day of tracking is left out, because every open role looked new then
    const fresh = all.filter((j) => j.firstSeen >= from && j.firstSeen <= to && j.firstSeen !== firstDay);
    const pct = (n: number, of: number) => (of ? Math.round((n / of) * 100) : 0);
    const snap = {
      week: id, from, to,
      open: open.length,
      new: fresh.length,
      remoteShare: pct(open.filter((j) => j.remote).length, open.length),
      roles: top(open.map((j) => j.role), 10),
      newRoles: top(fresh.map((j) => j.role), 10),
      seniority: top(open.map((j) => j.seniority), 8),
      skills: top(open.flatMap((j) => j.skills), 12).map((s) => ({ ...s, share: pct(s.n, open.length) })),
      tasks: top(open.flatMap((j) => j.tasks ?? []), 12).map((t) => ({ ...t, share: pct(t.n, open.filter((j) => j.tasks).length) })),
      tools: top(open.flatMap((j) => j.tools), 25),
    };
    writeFileSync(path.join(DIR, `${id}.json`), JSON.stringify(snap, null, 1) + "\n");
    written.push(id);
  }
  return written.sort();
}

if (import.meta.main) {
  const store = path.join(root, "market", "jobs.json");
  const all: Job[] = existsSync(store) ? JSON.parse(readFileSync(store, "utf8")) : [];
  console.log("weekly snapshots:", writeWeekly(all).join(", ") || "none");
}
