import type { RawJob } from "./types";
import { isAI } from "./taxonomy";

const UA = { "User-Agent": "awesome-applied-ai job-market collector (+https://github.com/vfaraji89/awesome-applied-ai)" };

export const strip = (html: string) =>
  (html || "")
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;|&#x27;/g, "'").replace(/&amp;/g, "&")
    .replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();

const day = (d: string | number | undefined) => {
  if (d === undefined || d === null || d === "") return new Date().toISOString().slice(0, 10);
  const t = typeof d === "number" ? new Date(d < 1e12 ? d * 1000 : d) : new Date(d);
  return isNaN(t.getTime()) ? new Date().toISOString().slice(0, 10) : t.toISOString().slice(0, 10);
};

async function getJSON(url: string): Promise<any> {
  const r = await fetch(url, { headers: UA });
  if (!r.ok) throw new Error(`${r.status} ${url}`);
  return r.json();
}

export async function greenhouse(slug: string): Promise<RawJob[]> {
  const d = await getJSON(`https://boards-api.greenhouse.io/v1/boards/${slug}/jobs?content=true`);
  return (d.jobs ?? []).map((j: any) => ({
    source: "greenhouse", id: String(j.id), company: slug, title: j.title ?? "", location: j.location?.name ?? "",
    remote: /remote/i.test(j.location?.name ?? ""), posted: day(j.first_published ?? j.updated_at), url: j.absolute_url ?? "", text: strip(j.content ?? ""),
  }));
}

export async function lever(slug: string): Promise<RawJob[]> {
  const d = await getJSON(`https://api.lever.co/v0/postings/${slug}?mode=json`);
  return (Array.isArray(d) ? d : []).map((j: any) => ({
    source: "lever", id: String(j.id), company: slug, title: j.text ?? "", location: j.categories?.location ?? "",
    remote: j.workplaceType === "remote" || /remote/i.test(j.categories?.location ?? ""), posted: day(j.createdAt), url: j.hostedUrl ?? "",
    text: [j.descriptionPlain, ...(j.lists ?? []).map((l: any) => `${l.text} ${strip(l.content)}`), j.additionalPlain].join(" "),
  }));
}

export async function ashby(slug: string): Promise<RawJob[]> {
  const d = await getJSON(`https://api.ashbyhq.com/posting-api/job-board/${slug}`);
  return (d.jobs ?? []).map((j: any) => ({
    source: "ashby", id: String(j.id), company: slug, title: j.title ?? "", location: j.location ?? "",
    remote: !!j.isRemote, posted: day(j.publishedAt), url: j.jobUrl ?? "", text: j.descriptionPlain ?? strip(j.descriptionHtml ?? ""),
  }));
}

/** Remotive asks for a link back and at most a few calls a day; this makes one call per search term, once a day. */
export async function remotive(): Promise<RawJob[]> {
  const out: RawJob[] = [];
  for (const q of ["AI", "machine learning", "LLM"]) {
    const d = await getJSON(`https://remotive.com/api/remote-jobs?search=${encodeURIComponent(q)}`);
    for (const j of d.jobs ?? [])
      out.push({ source: "remotive", id: String(j.id), company: j.company_name ?? "", title: j.title ?? "", location: j.candidate_required_location ?? "Remote",
        remote: true, posted: day(j.publication_date), url: j.url ?? "", text: strip(j.description ?? "") + " " + (j.tags ?? []).join(" ") });
  }
  return out;
}

export async function arbeitnow(pages = 5): Promise<RawJob[]> {
  const out: RawJob[] = [];
  for (let p = 1; p <= pages; p++) {
    const d = await getJSON(`https://www.arbeitnow.com/api/job-board-api?page=${p}`);
    for (const j of d.data ?? [])
      out.push({ source: "arbeitnow", id: String(j.slug), company: j.company_name ?? "", title: j.title ?? "", location: j.location ?? "",
        remote: !!j.remote, posted: day(j.created_at), url: j.url ?? "", text: strip(j.description ?? "") + " " + (j.tags ?? []).join(" ") });
    if (!d.links?.next) break;
  }
  return out;
}

/** The latest Hacker News "Ask HN: Who is hiring?" thread. Each top-level comment is one posting: "Company | Role | Location | ...". */
export async function hackerNews(): Promise<RawJob[]> {
  const s = await getJSON("https://hn.algolia.com/api/v1/search_by_date?tags=story,author_whoishiring&query=hiring&hitsPerPage=5");
  const story = (s.hits ?? []).find((h: any) => /who is hiring/i.test(h.title ?? ""));
  if (!story) return [];
  const t = await getJSON(`https://hn.algolia.com/api/v1/items/${story.objectID}`);
  return (t.children ?? []).filter((c: any) => c.text).map((c: any) => {
    const text = strip(c.text);
    const head = text.split(/\s{2,}|\n/)[0].slice(0, 220);
    const parts = head.split("|").map((x: string) => x.trim());
    const company = parts[0]?.slice(0, 60) ?? "";
    const title = parts.find((x: string, i: number) => i > 0 && /engineer|developer|scientist|architect|lead|manager|research/i.test(x)) ?? parts[1] ?? head;
    return { source: "hackernews", id: String(c.id), company, title: title.slice(0, 120), location: parts.find((x: string) => /remote|onsite|hybrid|[A-Z][a-z]+, [A-Z]/.test(x)) ?? "",
      remote: /remote/i.test(head), posted: day(c.created_at), url: `https://news.ycombinator.com/item?id=${c.id}`, text };
  });
}

/** Workday career sites (NVIDIA and other large employers). The public CXS endpoint lists 20 postings a page with
 *  titles only, so we page through the list, keep AI titles, and fetch the description for those alone. */
export interface WorkdayBoard { tenant: string; host: string; site: string }
export async function workday(b: WorkdayBoard, maxPages = 150): Promise<RawJob[]> {
  const base = `https://${b.tenant}.${b.host}.myworkdayjobs.com/wday/cxs/${b.tenant}/${b.site}`;
  const post = async (offset: number) => {
    const r = await fetch(`${base}/jobs`, { method: "POST", headers: { ...UA, "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ appliedFacets: {}, limit: 20, offset, searchText: "" }) });
    if (!r.ok) throw new Error(`${r.status} ${base}/jobs`);
    return r.json();
  };
  const listed: any[] = [];
  let total = Infinity;
  for (let p = 0; p < maxPages && p * 20 < total; p++) {
    const d = await post(p * 20);
    if (p === 0) total = d.total ?? 0;
    const page = d.jobPostings ?? [];
    if (!page.length) break;
    listed.push(...page);
  }
  const ai = listed.filter((j) => isAI(j.title ?? ""));
  const out: RawJob[] = [];
  for (let i = 0; i < ai.length; i += 8) {
    const batch = await Promise.all(ai.slice(i, i + 8).map(async (j) => {
      try { const d = await getJSON(`${base}${j.externalPath}`); return { j, info: d.jobPostingInfo ?? {} }; } catch { return { j, info: {} as any }; }
    }));
    for (const { j, info } of batch)
      out.push({ source: "workday", id: String(info.jobReqId ?? info.id ?? j.externalPath), company: b.tenant, title: j.title ?? "", location: j.locationsText ?? "",
        remote: /remote/i.test(`${j.locationsText ?? ""} ${info.remoteType ?? ""}`), posted: day(info.startDate), url: info.externalUrl ?? "", text: strip(info.jobDescription ?? "") });
  }
  // Non-AI postings still count towards the board's size in the run log.
  return [...out, ...listed.filter((j) => !isAI(j.title ?? "")).map((j) => ({ source: "workday", id: String(j.externalPath), company: b.tenant, title: j.title ?? "",
    location: j.locationsText ?? "", remote: false, posted: day(undefined), url: "", text: "" }))];
}

/* More applicant-tracking systems. Each reads the public job-board API a company's own career page
   embeds; descriptions are fetched for AI titles only, to keep the number of requests low. */

/** SmartRecruiters: the public posting API, 100 a page; the description is per posting. */
export async function smartrecruiters(company: string, maxPages = 20): Promise<RawJob[]> {
  const listed: any[] = [];
  for (let p = 0; p < maxPages; p++) {
    const d = await getJSON(`https://api.smartrecruiters.com/v1/companies/${company}/postings?limit=100&offset=${p * 100}`);
    const page = d.content ?? [];
    listed.push(...page);
    if (page.length < 100 || listed.length >= (d.totalFound ?? 0)) break;
  }
  const out: RawJob[] = [];
  for (const j of listed) {
    const loc = [j.location?.city, j.location?.country].filter(Boolean).join(", ");
    let text = "";
    if (isAI(j.name ?? "")) {
      try { const d = await getJSON(`https://api.smartrecruiters.com/v1/companies/${company}/postings/${j.id}`);
        text = strip(Object.values(d.jobAd?.sections ?? {}).map((x: any) => x?.text ?? "").join(" ")); } catch { /* title only */ }
    }
    out.push({ source: "smartrecruiters", id: String(j.id), company, title: j.name ?? "", location: loc, remote: !!j.location?.remote,
      posted: day(j.releasedDate), url: `https://jobs.smartrecruiters.com/${company}/${j.id}`, text });
  }
  return out;
}

/** Workable: the account widget lists every published job with its description in one call. */
export async function workable(slug: string): Promise<RawJob[]> {
  const d = await getJSON(`https://apply.workable.com/api/v1/widget/accounts/${slug}?details=true`);
  return (d.jobs ?? []).map((j: any) => ({
    source: "workable", id: String(j.shortcode ?? j.id), company: slug, title: j.title ?? "",
    location: [j.city, j.country].filter(Boolean).join(", "), remote: !!j.telecommuting || /remote/i.test(`${j.city ?? ""} ${j.workplace ?? ""}`),
    posted: day(j.published_on ?? j.created_at), url: j.url ?? j.application_url ?? "", text: strip(`${j.description ?? ""} ${j.requirements ?? ""} ${j.benefits ?? ""}`),
  }));
}

/** Recruitee: the offers API of a company's career site. */
export async function recruitee(slug: string): Promise<RawJob[]> {
  const d = await getJSON(`https://${slug}.recruitee.com/api/offers/`);
  return (d.offers ?? []).map((j: any) => ({
    source: "recruitee", id: String(j.id), company: slug, title: j.title ?? "", location: j.location ?? [j.city, j.country].filter(Boolean).join(", "),
    remote: !!j.remote, posted: day(j.published_at ?? j.created_at), url: j.careers_url ?? "", text: strip(`${j.description ?? ""} ${j.requirements ?? ""}`),
  }));
}

/** Personio: the XML feed every Personio career page publishes. */
export async function personio(slug: string): Promise<RawJob[]> {
  // career pages live on .de or .com depending on the account's region
  let r = await fetch(`https://${slug}.jobs.personio.com/xml?language=en`, { headers: UA });
  if (!r.ok) r = await fetch(`https://${slug}.jobs.personio.de/xml?language=en`, { headers: UA });
  if (!r.ok) throw new Error(`${r.status} personio:${slug}`);
  const xml = await r.text();
  const tag = (s: string, t: string) => (s.match(new RegExp(`<${t}>([\\s\\S]*?)</${t}>`)) ?? [])[1]?.replace(/<!\[CDATA\[|\]\]>/g, "").trim() ?? "";
  return [...xml.matchAll(/<position>([\s\S]*?)<\/position>/g)].map(([, p]) => {
    const office = tag(p, "office");
    return { source: "personio", id: tag(p, "id"), company: slug, title: tag(p, "name"), location: office, remote: /remote/i.test(office),
      posted: day(tag(p, "createdAt")), url: `https://${slug}.jobs.personio.com/job/${tag(p, "id")}`,
      text: strip([...p.matchAll(/<value>([\s\S]*?)<\/value>/g)].map((m) => m[1].replace(/<!\[CDATA\[|\]\]>/g, "")).join(" ")) };
  });
}

/** Himalayas: a remote-jobs board with an open API (it asks for a link back, given on the sources page). */
export async function himalayas(pages = 25): Promise<RawJob[]> {
  const out: RawJob[] = [];
  for (let p = 0; p < pages; p++) { // the API returns at most 20 a page
    const d = await getJSON(`https://himalayas.app/jobs/api?limit=20&offset=${p * 20}`);
    const jobs = d.jobs ?? [];
    for (const j of jobs)
      out.push({ source: "himalayas", id: String(j.guid ?? j.applicationLink ?? j.title), company: j.companyName ?? "", title: j.title ?? "",
        location: (j.locationRestrictions ?? []).join(", ") || "Remote", remote: true, posted: day(j.pubDate), url: j.applicationLink ?? j.guid ?? "",
        text: strip(`${j.description ?? ""} ${j.excerpt ?? ""} ${(j.categories ?? []).join(" ")}`) });
    if (jobs.length < 20) break;
  }
  return out;
}

/** Jobicy: a remote-jobs board with an open API (attribution on the sources page). One call for the AI tags. */
export async function jobicy(): Promise<RawJob[]> {
  const out: RawJob[] = [];
  const seen = new Set<string>();
  for (const tag of ["ai", "machine-learning", "llm"]) {
    const d = await getJSON(`https://jobicy.com/api/v2/remote-jobs?count=50&tag=${tag}`);
    for (const j of d.jobs ?? [])
      if (!seen.has(String(j.id)) && seen.add(String(j.id))) out.push({ source: "jobicy", id: String(j.id), company: j.companyName ?? "", title: strip(j.jobTitle ?? ""), location: j.jobGeo ?? "Remote",
        remote: true, posted: day(j.pubDate), url: j.url ?? "", text: strip(`${j.jobDescription ?? ""} ${j.jobExcerpt ?? ""}`) });
  }
  return out;
}

/** Where a board's public career page lives, for the sources page. */
export const boardUrl = (provider: string, slug: string, wd?: { tenant: string; host: string; site: string }): string => ({
  greenhouse: `https://job-boards.greenhouse.io/${slug}`,
  lever: `https://jobs.lever.co/${slug}`,
  ashby: `https://jobs.ashbyhq.com/${slug}`,
  workday: wd ? `https://${wd.tenant}.${wd.host}.myworkdayjobs.com/${wd.site}` : "",
  smartrecruiters: `https://careers.smartrecruiters.com/${slug}`,
  workable: `https://apply.workable.com/${slug}/`,
  recruitee: `https://${slug}.recruitee.com/`,
  personio: `https://${slug}.jobs.personio.com/`,
} as Record<string, string>)[provider] ?? "";
