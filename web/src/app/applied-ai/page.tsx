import type { Metadata } from "next";
import Link from "next/link";
import market from "@/data/market.json";
import { fRoles, skills } from "@/data/framework";
import { T, TH } from "@/i18n/lang";
import { JsonLd } from "@/components/json-ld";
import { Crumb } from "@/components/section-intro";
import { share } from "@/lib/share";
import { abs, SITE_URL } from "@/lib/seo";

/* "What is applied AI?": the plain answer, first, then the questions people ask next, each answered
   from the site's own job-ad data. Written answer-first so a search engine or an AI assistant can
   quote any one answer on its own. The structured data below is built from the same sentences. */

type Row = { id: string; n: number; share?: number; name?: string };
const m = market as unknown as { totals: { processed: number }; since: string; generatedAt: string; roles: Row[]; skills: Row[]; tasks: Row[] };
const total = m.totals.processed;
const pct = (r: Row) => r.share ?? Math.round((100 * r.n) / total);
const skillName = (id: string) => skills.find((s) => s.id === id)?.name ?? id;
const roleName = (id: string) => fRoles.find((r) => r.id === id)?.name ?? id;
const topSkills = m.skills.slice(0, 5);
const topRoles = m.roles.filter((r) => r.id !== "other-ai").slice(0, 5);
const topTasks = m.tasks.slice(0, 4);
const updated = m.generatedAt.slice(0, 10);
const list = (xs: string[]) => xs.slice(0, -1).join(", ") + " and " + xs[xs.length - 1];

// the English answers, used for the page and, word for word, for the structured data
const QA = [
  { id: "what", q: "What is applied AI?",
    a: "Applied AI is the work of putting AI models to use inside real products and workflows: choosing the model, giving it the right context and tools, checking its answers, and running it in production. It is judged by whether the work gets done well and at a sensible cost, not by benchmark scores." },
  { id: "asks", q: "What do applied AI jobs ask for?",
    a: `Across ${total.toLocaleString("en")} AI job ads read since 1 October 2026, the most asked-for skills are ${list(topSkills.map((s) => `${skillName(s.id).toLowerCase()} (${pct(s)}%)`))}.` },
  { id: "roles", q: "Which roles does applied AI hire for?",
    a: `The roles with the most ads are ${list(topRoles.map((r) => `${roleName(r.id)} (${r.n.toLocaleString("en")} ads)`))}.` },
  { id: "tasks", q: "What does applied AI work look like day to day?",
    a: `The tasks job ads name most are to ${list(topTasks.map((t) => (t.name ?? t.id).charAt(0).toLowerCase() + (t.name ?? t.id).slice(1)))}.` },
  { id: "vs", q: "How is applied AI different from AI research?",
    a: "AI research makes new models and methods. Applied AI takes models that exist and makes them useful: the data they read, the tools they call, the checks on their answers, the cost of running them, and the people who use the result." },
  { id: "start", q: "How do I start in applied AI?",
    a: "Start from a role: see what the market asks for, check your CV or a job description against it, then learn the gaps in order. Software fundamentals come first; agents, retrieval, evals and context come next." },
];

export const metadata: Metadata = {
  ...share("docs"),
  title: "What is applied AI?",
  description: "Applied AI, defined plainly, and what applied AI jobs ask for right now: skills, roles and daily tasks from AI job ads read since 1 October 2026.",
  alternates: { canonical: "./" },
};

const ld = {
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "WebPage", "@id": `${abs("/applied-ai/")}#page`, url: abs("/applied-ai/"), name: "What is applied AI?", isPartOf: { "@id": `${SITE_URL}/#website` },
      dateModified: updated, about: { "@id": `${abs("/applied-ai/")}#term` }, inLanguage: "en" },
    { "@type": "DefinedTerm", "@id": `${abs("/applied-ai/")}#term`, name: "Applied AI", alternateName: ["Applied artificial intelligence", "Applied AI engineering"],
      description: QA[0].a, inDefinedTermSet: `${SITE_URL}/jargon/#terms`, url: abs("/applied-ai/") },
    { "@type": "FAQPage", "@id": `${abs("/applied-ai/")}#faq`, url: abs("/applied-ai/"),
      mainEntity: QA.map((x) => ({ "@type": "Question", name: x.q, acceptedAnswer: { "@type": "Answer", text: x.a } })) },
    { "@type": "BreadcrumbList", itemListElement: [
      { "@type": "ListItem", position: 1, name: "Applied AI, Simplified", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: "Learn", item: abs("/docs/") },
      { "@type": "ListItem", position: 3, name: "What is applied AI?", item: abs("/applied-ai/") } ] },
  ],
};

export default function AppliedAIPage() {
  const vars = {
    total: total.toLocaleString("en"),
    skills: list(topSkills.map((s) => `${skillName(s.id).toLowerCase()} (${pct(s)}%)`)),
    roles: list(topRoles.map((r) => `${roleName(r.id)} (${r.n.toLocaleString("en")})`)),
  };
  return (
    <>
      <JsonLd data={ld} />
      <section className="section">
        <div className="wrap aa">
          <Crumb id="docs" page="What is applied AI?" />
          <h1 style={{ marginTop: 14 }}><T k="aa.h1">What is applied AI?</T></h1>
          <p className="aa-def"><T k="aa.what">{QA[0].a}</T></p>
          <p className="aa-meta mono"><T k="aa.meta" vars={{ date: updated }}>{`From the site's own data, updated ${updated}.`}</T></p>

          <div className="aa-grid">
            <article className="frame aa-q" id="asks">
              <h2><T k="aa.q_asks">{QA[1].q}</T></h2>
              <p><T k="aa.a_asks" vars={{ total: vars.total }}>{`Across ${vars.total} AI job ads read since 1 October 2026, these are the skills asked for most:`}</T></p>
              <ol className="aa-bars">
                {topSkills.map((s) => (
                  <li key={s.id}><span><T k={`skill.${s.id}`}>{skillName(s.id)}</T></span><i style={{ ["--w" as string]: pct(s) / 100 }} aria-hidden="true" /><b>{pct(s)}%</b></li>
                ))}
              </ol>
              <Link className="aa-go" href="/market/"><T k="aa.go_market">The full market pulse</T> →</Link>
            </article>

            <article className="frame aa-q" id="roles">
              <h2><T k="aa.q_roles">{QA[2].q}</T></h2>
              <p><T k="aa.a_roles">The roles with the most ads:</T></p>
              <ol className="aa-bars">
                {topRoles.map((r) => (
                  <li key={r.id}><span>{roleName(r.id)}</span><i style={{ ["--w" as string]: r.n / topRoles[0].n }} aria-hidden="true" /><b>{r.n.toLocaleString("en")}</b></li>
                ))}
              </ol>
              <Link className="aa-go" href="/roles/families/"><T k="aa.go_roles">What each role does</T> →</Link>
            </article>

            <article className="frame aa-q" id="tasks">
              <h2><T k="aa.q_tasks">{QA[3].q}</T></h2>
              <p><T k="aa.a_tasks">The tasks job ads name most:</T></p>
              <ul className="aa-list">{topTasks.map((t) => <li key={t.id}><T k={`task.${t.id}`}>{t.name ?? t.id}</T> <span className="muted">{pct(t)}%</span></li>)}</ul>
              <Link className="aa-go" href="/roles/tasks/"><T k="aa.go_tasks">Tasks, role by role</T> →</Link>
            </article>

            <article className="frame aa-q" id="vs">
              <h2><T k="aa.q_vs">{QA[4].q}</T></h2>
              <p><T k="aa.a_vs">{QA[4].a}</T></p>
              <Link className="aa-go" href="/architect/"><T k="aa.go_vs">The AI-native architect</T> →</Link>
            </article>

            <article className="frame aa-q aa-wide" id="start">
              <h2><T k="aa.q_start">{QA[5].q}</T></h2>
              <p><TH k="aa.a_start">{QA[5].a}</TH></p>
              <div className="aa-links">
                <Link className="btn" href="/fit/"><T k="aa.go_fit">Check your role fit</T> →</Link>
                <Link className="btn ghost" href="/docs/"><T k="aa.go_learn">Learn it plainly</T></Link>
                <Link className="btn ghost" href="/certificates/"><T k="aa.go_certs">Certificates</T></Link>
              </div>
            </article>
          </div>
        </div>
      </section>
      <style>{`
        .aa h1 { font-size: clamp(2.2rem, 5vw, 3.4rem); letter-spacing: -0.045em; line-height: 1.02; }
        .aa-def { margin: 18px 0 6px; max-width: 62ch; font-size: clamp(1.1rem, 1.6vw, 1.3rem); line-height: 1.55; color: var(--ink); }
        .aa-meta { margin: 0 0 34px; font-size: .74rem; color: var(--muted); }
        .aa-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 26px 22px; }
        @media (max-width: 860px) { .aa-grid { grid-template-columns: minmax(0, 1fr); } }
        .aa-q { display: flex; flex-direction: column; gap: 12px; padding: 24px 26px 20px; }
        .aa-wide { grid-column: 1 / -1; }
        .aa-q h2 { margin: 0; font-size: 1.2rem; letter-spacing: -0.03em; }
        .aa-q p { margin: 0; line-height: 1.6; color: var(--sec); }
        .aa-bars { list-style: none; margin: 0; padding: 0; display: grid; gap: 8px; }
        .aa-bars li { display: grid; grid-template-columns: minmax(0, 11rem) minmax(0, 1fr) 3.4rem; align-items: center; gap: 10px; font-size: .88rem; }
        .aa-bars i { display: block; height: 8px; border-radius: 4px; background: linear-gradient(90deg, var(--rust) calc(var(--w) * 100%), var(--line) calc(var(--w) * 100%)); }
        .aa-bars b { text-align: right; font-variant-numeric: tabular-nums; }
        .aa-list { margin: 0; padding-left: 18px; display: grid; gap: 6px; line-height: 1.5; }
        .aa-go { margin-top: auto; font-weight: 700; font-size: .88rem; color: var(--rust-deep); text-decoration: none; }
        .aa-go:hover { text-decoration: underline; }
        .aa-links { display: flex; flex-wrap: wrap; gap: 8px; }
      `}</style>
    </>
  );
}
