/* The repo is private, so the open dataset is served by the site itself: the CSV, the JSON, the
   monthly totals, the licence and the data card go to /dataset/ on every build. */
import { cpSync, existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const here = path.dirname(fileURLToPath(import.meta.url));
const from = path.resolve(here, "../../dataset");
const to = path.resolve(here, "../public/dataset");
mkdirSync(to, { recursive: true });
const files = ["applied-ai-job-ads.csv", "applied-ai-job-ads.json", "monthly-totals.csv", "LICENSE", "README.md", "meta.json"];
for (const f of files) if (existsSync(path.join(from, f))) cpSync(path.join(from, f), path.join(to, f === "README.md" ? "data-card.md" : f === "LICENSE" ? "LICENSE.txt" : f));
console.log(`dataset: ${files.length} files to public/dataset`);
