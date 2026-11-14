/* Publish the dataset folder to Zenodo, which gives every version a DOI and the dataset one DOI
   for all versions (the concept DOI, the one to cite). The first run creates the record; later
   runs add a new version to it. Records the ids and DOIs in dataset/meta.json.
   Needs ZENODO_TOKEN (a personal token with deposit:write and deposit:actions).
   ZENODO_URL=https://sandbox.zenodo.org to try it on the sandbox first.
   bun pipeline/zenodo.ts */
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dir, "..");
const DIR = path.join(root, "dataset");
const API = `${process.env.ZENODO_URL ?? "https://zenodo.org"}/api`;
const TOKEN = process.env.ZENODO_TOKEN;
if (!TOKEN) { console.log("No ZENODO_TOKEN: skipping Zenodo"); process.exit(0); }
const H = { Authorization: `Bearer ${TOKEN}` };
const call = async (method: string, url: string, body?: unknown) => {
  const r = await fetch(url.startsWith("http") ? url : `${API}${url}`, { method, headers: { ...H, ...(body ? { "Content-Type": "application/json" } : {}) }, body: body ? JSON.stringify(body) : undefined });
  if (!r.ok) throw new Error(`${method} ${url}: ${r.status} ${(await r.text()).slice(0, 300)}`);
  return r.status === 204 ? null : r.json();
};

const metaPath = path.join(DIR, "meta.json");
const meta = JSON.parse(readFileSync(metaPath, "utf8"));
const FILES = ["applied-ai-job-ads.csv", "applied-ai-job-ads.json", "monthly-totals.csv", "README.md", "LICENSE", "meta.json"];

// a new version of the existing record, or the first record
let draft: any;
if (meta.zenodoId) {
  const nv = await call("POST", `/deposit/depositions/${meta.zenodoId}/actions/newversion`);
  draft = await call("GET", nv.links.latest_draft);
  for (const f of (await call("GET", `/deposit/depositions/${draft.id}/files`)) as { id: string }[]) await call("DELETE", `/deposit/depositions/${draft.id}/files/${f.id}`);
} else {
  draft = await call("POST", "/deposit/depositions", {});
}
for (const f of FILES) {
  const r = await fetch(`${draft.links.bucket}/${f}`, { method: "PUT", headers: H, body: readFileSync(path.join(DIR, f)) });
  if (!r.ok) throw new Error(`upload ${f}: ${r.status}`);
}
await call("PUT", `/deposit/depositions/${draft.id}`, { metadata: {
  upload_type: "dataset", title: meta.title, version: meta.version, publication_date: new Date().toISOString().slice(0, 10),
  creators: [{ name: "Faraji, Vahid" }], license: "cc-by-4.0", access_right: "open",
  description: "One row per AI job ad read from public company career pages, with the role, level, skills, tasks, tools, stack and years of experience each ad asks for. Derived fields only: no title, company, link or ad text. Method and error rates: " + meta.site,
  keywords: ["applied AI", "job market", "skills", "AI engineering", "labour market data"],
  related_identifiers: [{ identifier: meta.site, relation: "isDocumentedBy", resource_type: "publication-other" }],
} });
const done = await call("POST", `/deposit/depositions/${draft.id}/actions/publish`);
meta.zenodoId = done.id;
meta.doi = done.doi;
meta.conceptDoi = done.conceptdoi ?? meta.conceptDoi;
writeFileSync(metaPath, JSON.stringify(meta, null, 1) + "\n");
writeFileSync(path.join(root, "web/src/data/dataset-meta.json"), JSON.stringify(meta, null, 1) + "\n");
console.log(`Zenodo: published ${meta.version} as ${meta.doi} (all versions: ${meta.conceptDoi})`);
