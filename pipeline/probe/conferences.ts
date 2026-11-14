/* One-off probe, run on a GitHub runner: what do conference sites publish in machine-readable form?
   Prints status, size and structure (keys, counts, a short sample) to the job log. Saves nothing. */
const URLS = (process.env.PROBE_URLS ?? "").split(/\s+/).filter(Boolean);
const UA = { "User-Agent": "awesome-applied-ai conference tracker (+https://github.com/vfaraji89/awesome-applied-ai)" };
const shape = (v: unknown, depth = 0): string => {
  if (Array.isArray(v)) return `array[${v.length}] of ${v.length ? shape(v[0], depth + 1) : "?"}`;
  if (v && typeof v === "object") return depth > 2 ? "{…}" : `{ ${Object.entries(v).slice(0, 25).map(([k, x]) => `${k}: ${shape(x, depth + 1)}`).join(", ")} }`;
  return typeof v;
};
for (const url of URLS) {
  try {
    const r = await fetch(url, { headers: UA, redirect: "follow" });
    const body = await r.text();
    console.log(`\n=== ${url}\nstatus ${r.status} · ${r.headers.get("content-type")} · ${body.length} chars · final ${r.url}`);
    if (!r.ok) continue;
    if (/json/.test(r.headers.get("content-type") ?? "") || /^\s*[\[{]/.test(body)) {
      const j = JSON.parse(body);
      console.log("shape:", shape(j));
      const arr = Array.isArray(j) ? j : (Object.values(j).find(Array.isArray) as unknown[] | undefined);
      if (arr) for (const x of arr.slice(0, 2)) console.log("sample:", JSON.stringify(x).slice(0, 900));
      if (arr) console.log("count:", arr.length);
    } else {
      const lines = body.split("\n");
      console.log("headings:", lines.filter((l) => /^#{1,3} /.test(l)).slice(0, 40).join(" | ").slice(0, 2500));
      const full = /data\.md|terms|licen/i.test(url);
      console.log("first lines:\n" + lines.slice(0, full ? 400 : 60).join("\n").slice(0, full ? 12000 : 3500));
      const links = [...body.matchAll(/https?:\/\/[^\s)"'<>]+/g)].map((m) => m[0]).filter((u) => /json|llms|schedule|sessions|speakers|talks|agenda|\.md\b|\.ics/i.test(u));
      console.log("data-looking links:", [...new Set(links)].slice(0, 40).join("\n"));
    }
  } catch (e) {
    console.log(`\n=== ${url}\nFAILED ${String((e as Error).message).slice(0, 200)}`);
  }
}
