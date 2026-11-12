// Builds src/data/tool-icons.json: the brand icon for every tool whose `icon` names a
// Simple Icons slug (simpleicons.org, CC0). Runs before every build (data step); not
// committed. A slug that is not in the package is reported and the tool falls back to
// its monogram bead, so a typo in the content sheet never breaks the build.
import { readFileSync, writeFileSync } from "node:fs";
import * as si from "simple-icons";

type T = { id: string; icon?: string };
const tools: T[] = JSON.parse(readFileSync(new URL("../src/data/content/tools.json", import.meta.url), "utf8"));
const bySlug = new Map<string, { title: string; hex: string; path: string }>();
for (const v of Object.values(si) as { slug?: string; title: string; hex: string; path: string }[]) if (v && v.slug) bySlug.set(v.slug, v);

const out: Record<string, { hex: string; path: string }> = {};
const missing: string[] = [];
for (const t of tools) {
  if (!t.icon) continue;
  const i = bySlug.get(t.icon);
  if (i) out[t.icon] = { hex: i.hex, path: i.path };
  else missing.push(`${t.id} (${t.icon})`);
}
writeFileSync(new URL("../src/data/tool-icons.json", import.meta.url), JSON.stringify(out) + "\n");
console.log(`tool-icons.json: ${Object.keys(out).length} icons` + (missing.length ? `; not in Simple Icons, monogram used: ${missing.join(", ")}` : ""));
