/* Structured data (schema.org JSON-LD) for search and AI answer engines. Every page says what it
   is in machine-readable form, built from the same data the page renders, so the two never drift.
   Kept to facts the site already shows: names, links, dates, counts. */
import { site } from "@/lib/site";
import market from "@/data/market.json";
import { tools } from "@/data/tools";
import { areas, catName } from "@/data/areas";
import { certs, courses, CHECKED } from "@/data/certificates";
import { fRoles } from "@/data/framework";
import { problems } from "@/data/problems";
import jargon from "@/data/content/jargon.json";
import { statsDate } from "@/lib/tool-signals";

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://vfaraji89.github.io/awesome-applied-ai").replace(/\/$/, "");
export const abs = (path: string) => SITE_URL + (path.startsWith("/") ? path : "/" + path);
const LANGS = ["en", "tr", "es", "nl", "ja"];

const author = { "@type": "Person", "@id": "https://vfaraji89.github.io/#person", name: site.author.name, url: site.author.site };
const isPartOf = { "@id": `${SITE_URL}/#website` };

export const websiteLd = () => ({
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite", "@id": `${SITE_URL}/#website`, url: `${SITE_URL}/`, name: "awesome-applied-ai",
      alternateName: "Applied AI, mapped",
      description: "A plain-language map of applied AI in seven steps: the job market, roles and skills, the AI-native architect, a tool map, industry certificates, technical docs in motion, and feedback.",
      inLanguage: LANGS, author, publisher: author, isAccessibleForFree: true,
      about: ["Applied artificial intelligence", "AI engineering", "AI agents", "Large language models", "AI careers"],
    },
    author,
  ],
});

export const toolsLd = () => ({
  "@context": "https://schema.org",
  "@type": "Dataset", "@id": `${SITE_URL}/tools/#dataset`, url: abs("/tools/"), isPartOf,
  name: "Applied AI tool map",
  description: `${tools.length} tools across applied AI in ${areas.length} areas (${areas.map((a) => a.name.toLowerCase()).join(", ")}), each with category, licence, maturity and deployment, and GitHub stars where open source.`,
  creator: author, dateModified: statsDate, inLanguage: "en", isAccessibleForFree: true,
  keywords: ["AI tools", "LLM tools", "AI agents", "RAG", "MLOps", "AI evaluation", "AI governance"],
  variableMeasured: ["area", "category", "licence", "maturity", "deployment", "GitHub stars", "launch month"],
  hasPart: {
    "@type": "ItemList", numberOfItems: tools.length,
    itemListElement: tools.map((t, i) => ({
      "@type": "ListItem", position: i + 1,
      item: { "@type": "SoftwareApplication", name: t.name, url: t.url, applicationCategory: catName(t.category), description: t.summary, ...(t.license ? { license: t.license } : {}) },
    })),
  },
});

export const certificatesLd = () => ({
  "@context": "https://schema.org",
  "@type": "ItemList", "@id": `${SITE_URL}/certificates/#list`, url: abs("/certificates/"), isPartOf,
  name: "Industry certificates for applied AI", dateModified: CHECKED, numberOfItems: certs.length + courses.length,
  itemListElement: [
    ...certs.map((c) => ({ "@type": "EducationalOccupationalCredential", name: c.name, url: c.url, description: c.what, credentialCategory: "certificate",
      educationalLevel: ["", "Foundational", "Associate", "Professional", "Expert"][c.level], recognizedBy: { "@type": "Organization", name: c.provider } })),
    ...courses.map((c) => ({ "@type": "Course", name: c.name, url: c.url, description: c.what, provider: { "@type": "Organization", name: c.provider }, isAccessibleForFree: c.cost === "Free" })),
  ].map((item, i) => ({ "@type": "ListItem", position: i + 1, item })),
});

type Term = { id: string; term: string; short: string };
export const jargonLd = () => ({
  "@context": "https://schema.org",
  "@type": "DefinedTermSet", "@id": `${SITE_URL}/jargon/#terms`, url: abs("/jargon/"), isPartOf,
  name: "Applied AI jargon, in plain language",
  hasDefinedTerm: (jargon.terms as Term[]).map((t) => ({ "@type": "DefinedTerm", "@id": `${SITE_URL}/jargon/#${t.id}`, name: t.term, description: t.short, inDefinedTermSet: `${SITE_URL}/jargon/#terms` })),
});

export const rolesLd = () => ({
  "@context": "https://schema.org",
  "@type": "ItemList", "@id": `${SITE_URL}/roles/#list`, url: abs("/roles/"), isPartOf,
  name: "Applied AI roles, skills and tasks", numberOfItems: fRoles.length,
  itemListElement: fRoles.map((r, i) => ({ "@type": "ListItem", position: i + 1,
    item: { "@type": "Occupation", name: r.name, description: r.oneLine, alternateName: r.titles, responsibilities: r.tasks, skills: r.stack.join(", ") } })),
});

export const problemsLd = () => ({
  "@context": "https://schema.org",
  "@type": "ItemList", "@id": `${SITE_URL}/problems/#list`, url: abs("/problems/"), isPartOf,
  name: "Common problems in applied AI systems, with worked answers", numberOfItems: problems.length,
  itemListElement: problems.map((p, i) => ({ "@type": "ListItem", position: i + 1, url: abs(`/problems/${p.id}/`), name: p.title })),
});

export const marketLd = () => ({
  "@context": "https://schema.org",
  "@type": "Dataset", "@id": `${SITE_URL}/market/#dataset`, url: abs("/market/"), isPartOf,
  name: "Applied AI job market tracker",
  description: `What applied AI job ads ask for: roles, levels, titles, skills, tasks and tools, read from public company career pages and job boards. ${market.totals.processed} AI job ads processed since ${market.since}. Only aggregate counts are kept; no ad, link or description is stored.`,
  temporalCoverage: `${market.since}/..`,
  creator: author, dateModified: String(market.generatedAt).slice(0, 10), inLanguage: "en", isAccessibleForFree: true,
  variableMeasured: ["role family", "seniority", "job title", "skills", "tasks", "tools", "remote share", "job ads per month"],
  measurementTechnique: "Daily read of public hiring-platform and job-board APIs (Greenhouse, Lever, Ashby, Workday, SmartRecruiters, Workable, Recruitee, Personio and open boards); titles classified into role families; skills, tasks and tools matched in the description.",
});

export const problemLd = (id: string) => {
  const p = problems.find((x) => x.id === id)!;
  return {
    "@context": "https://schema.org",
    "@type": "TechArticle", "@id": `${SITE_URL}/problems/${p.id}/#article`, url: abs(`/problems/${p.id}/`), isPartOf,
    headline: p.title, description: p.asked, author, publisher: author, inLanguage: "en",
    about: "Applied AI system design", position: p.n,
  };
};
