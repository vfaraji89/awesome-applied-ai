// Builds out/sitemap.xml after the static export: one entry per exported page, so search and
// answer engines find every page (the problems and docs pages included). The domain's robots.txt,
// in the vfaraji89.github.io repository, points to it.
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const OUT = new URL("../out/", import.meta.url).pathname;
const SITE = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://vfaraji89.github.io/applied-ai-simplified").replace(/\/$/, "");
const today = new Date().toISOString().slice(0, 10);
const pages: string[] = [];
(function walk(dir: string, rel: string) {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) { if (!f.startsWith("_") && f !== "i18n") walk(p, `${rel}${f}/`); }
    else if (f === "index.html" && !/<meta name="robots" content="[^"]*noindex/.test(readFileSync(p, "utf8"))) pages.push(rel);
  }
})(OUT, "");
const pri = (p: string) => (p === "" ? "1.0" : p.split("/").length <= 2 ? "0.8" : "0.6");
const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${pages.sort()
  .map((p) => `  <url><loc>${SITE}/${p}</loc><lastmod>${today}</lastmod><priority>${pri(p)}</priority></url>`).join("\n")}\n</urlset>\n`;
writeFileSync(join(OUT, "sitemap.xml"), xml);
console.log(`sitemap.xml: ${pages.length} pages`);
