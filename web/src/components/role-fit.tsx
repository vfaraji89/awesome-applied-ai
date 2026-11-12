"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { track } from "@/lib/track";
import data from "@/data/role-fit.json";
import { skills as skillDefs } from "@/data/framework";
import { learn } from "@/data/learn";
import { useT } from "@/i18n/lang";

/* Role fit, both ways round. "My experience" reads a CV and finds the closest role;
   "A job description" reads a posting and compares it with what similar postings ask.
   Both use the tracker's own patterns, both turn gaps into a learning path on this
   site, and both run in the browser. */

type Role = { id: string; name: string; family: string; n: number; skills: Record<string, number>; tools: { name: string; share: number }[]; avgSkills: number; avgTools: number };
type Pat = { source: string; flags: string };
const D = data as unknown as {
  postings: number; from: string; to: string; roles: Role[];
  skillPatterns: (Pat & { id: string })[]; toolPatterns: (Pat & { name: string })[]; rolePatterns: (Pat & { id: string })[];
};
const skillRe = D.skillPatterns.map((s) => ({ id: s.id, re: new RegExp(s.source, s.flags) }));
const toolRe = D.toolPatterns.map((t) => ({ name: t.name, re: new RegExp(t.source, t.flags) }));
const roleRe = D.rolePatterns.map((r) => ({ id: r.id, re: new RegExp(r.source, r.flags) }));
const skillName = (id: string) => skillDefs.find((s) => s.id === id)?.name ?? id;
/** "A", "A and B", "A, B and C": skill names keep their capitals (SQL, RAG). */
const list = (xs: string[], and = " and ", comma = ", ") => (xs.length < 2 ? xs.join("") : `${xs.slice(0, -1).join(comma)}${and}${xs[xs.length - 1]}`);
const read = (text: string) => ({
  skills: skillRe.filter((s) => s.re.test(text)).map((s) => s.id),
  tools: toolRe.filter((t) => t.re.test(text)).map((t) => t.name),
});

// ---------------------------------------------------------------- my experience
const CV_SAMPLES: Record<string, string> = {
  "Backend engineer": "Senior backend engineer, 6 years. Python and TypeScript, REST APIs, Postgres, Docker, Kubernetes, CI/CD. Built data pipelines in BigQuery. Some system design work on distributed systems.",
  "Data scientist": "Data scientist. Python, SQL, PyTorch, model training and fine-tuning, A/B tests, dashboards. Worked with stakeholders on churn models. Built a RAG prototype with embeddings.",
  "Agent builder": "Built agents with tool calling and MCP in LangGraph; evals and tracing with Langfuse; prompt caching and token budgets; worked directly with customers on discovery and ROI; Python, TypeScript, Claude Code.",
};

function scoreCv(text: string) {
  const got = read(text);
  const have = new Set(got.skills), tools = new Set(got.tools);
  const roles = D.roles.map((r) => {
    const total = Object.values(r.skills).reduce((a, b) => a + b, 0) || 1;
    const hit = Object.entries(r.skills).reduce((a, [id, w]) => a + (have.has(id) ? w : 0), 0);
    const toolTotal = r.tools.reduce((a, t) => a + t.share, 0) || 1;
    const toolHit = r.tools.reduce((a, t) => a + (tools.has(t.name) ? t.share : 0), 0);
    const fit = Math.round(100 * (0.8 * hit / total + 0.2 * toolHit / toolTotal));
    const missing = Object.entries(r.skills).filter(([id, w]) => !have.has(id) && w >= 25).sort((a, b) => b[1] - a[1]).slice(0, 3);
    const missingTools = r.tools.filter((t) => !tools.has(t.name)).slice(0, 3);
    return { r, fit, missing, missingTools };
  }).sort((a, b) => b.fit - a.fit);
  return { have: got.skills, tools: got.tools, roles };
}

// ------------------------------------------------------------ a job description
const JD_SAMPLES: Record<string, string> = {
  "Applied AI Engineer": "Applied AI Engineer\nBuild LLM agents with tool calling and MCP for enterprise customers. Python and TypeScript. Retrieval (RAG, vector databases). Work with stakeholders from discovery to production.",
  "Unicorn ML role": "Senior AI Engineer\nFine-tune and serve LLMs (PyTorch, CUDA, quantization), build RAG and agents with LangGraph, own data pipelines in Spark and dbt, design the system architecture, run customer workshops, red-team for prompt injection, and lead the product roadmap. Kubernetes, Terraform, React.",
  "Forward Deployed": "Forward Deployed Engineer\nEmbed with customers to ship generative AI into production. Full-stack: Python, TypeScript, SQL. Prototype fast, measure ROI, and own the deployment end to end.",
};

function auditJd(text: string) {
  const title = (text.split("\n").map((l) => l.trim()).find((l) => l.length > 0) ?? "").slice(0, 120);
  const got = read(text);
  const asked = new Set(got.skills), tools = new Set(got.tools);
  // Role: the title decides, as in the tracker; failing that, the closest skill profile.
  let roleId = roleRe.find((r) => r.re.test(title))?.id ?? null;
  let how: "title" | "skills" = "title";
  if (!roleId || !D.roles.some((r) => r.id === roleId)) {
    how = "skills";
    const vec = (r: Role) => D.skillPatterns.map((s) => r.skills[s.id] ?? 0);
    const mine = D.skillPatterns.map((s) => (asked.has(s.id) ? 100 : 0));
    const cos = (a: number[], b: number[]) => { const d = a.reduce((x, v, i) => x + v * b[i], 0); const n = Math.hypot(...a) * Math.hypot(...b); return n ? d / n : 0; };
    roleId = D.roles.map((r) => ({ id: r.id, c: cos(mine, vec(r)) })).sort((a, b) => b.c - a.c)[0]?.id ?? D.roles[0].id;
  }
  const role = D.roles.find((r) => r.id === roleId)!;
  const askedRows = got.skills.map((id) => {
    const share = role.skills[id] ?? 0;
    return { id, share, band: share >= 50 ? "standard" : share >= 25 ? "common" : "rare" } as const;
  }).sort((a, b) => b.share - a.share);
  const forgot = Object.entries(role.skills).filter(([id, w]) => !asked.has(id) && w >= 50).sort((a, b) => b[1] - a[1]);
  const forgotTools = role.tools.filter((t) => !tools.has(t.name) && t.share >= 15).slice(0, 4);
  const rare = askedRows.filter((r) => r.band === "rare");
  const over = got.skills.length > role.avgSkills + 3;
  return { title, role, how, askedRows, tools: got.tools, forgot, forgotTools, rare, over, count: got.skills.length };
}

// ------------------------------------------------------------------- learning path
function Path({ ids, title }: { ids: string[]; title: string }) {
  const t = useT();
  if (!ids.length) return null;
  return (
    <div className="lp">
      <span className="kicker">{title}</span>
      <ol className="lp-steps">
        {ids.map((id, i) => (
          <li key={id}>
            <span className="lp-n">{i + 1}</span>
            <div>
              <b>{t(`skill.${id}`, skillName(id))}</b>
              <span className="muted"> · {t(`skillwhat.${id}`, skillDefs.find((s) => s.id === id)?.what ?? "")}</span>
              <div className="lp-links">
                {(learn[id] ?? []).map((l) => <Link key={l.href + l.label} href={l.href} className="chip"><span className="lp-k">{t(`kind.${l.kind.toLowerCase()}`, l.kind)}</span>{l.label}</Link>)}
              </div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

// ------------------------------------------------------------------------ the page
export function RoleFit() {
  const [mode, setMode] = useState<"cv" | "jd">("cv");
  const [text, setText] = useState({ cv: "", jd: "" });
  const [ran, setRan] = useState({ cv: "", jd: "" });
  const cv = useMemo(() => (ran.cv.trim().length >= 20 ? scoreCv(ran.cv) : null), [ran.cv]);
  const jd = useMemo(() => (ran.jd.trim().length >= 40 ? auditJd(ran.jd) : null), [ran.jd]);
  const samples = mode === "cv" ? CV_SAMPLES : JD_SAMPLES;
  const run = (t: string) => { setRan((r) => ({ ...r, [mode]: t })); track("role_fit_check", { mode, chars: Math.min(t.length, 5000) }); };
  const best = cv?.roles[0];
  const t = useT();
  const sn = (id: string) => t(`skill.${id}`, skillName(id));
  const ls = (xs: string[]) => list(xs, t("rf.and", " and "), t("rf.comma", ", "));
  const band = (b: string) => t(`rf.band_${b.replace(" ", "_")}`, b);

  return (
    <div className="rf">
      <div className="rf-tabs" role="tablist" aria-label={t("rf.tabs", "Which way round")}>
        <button role="tab" aria-selected={mode === "cv"} onClick={() => setMode("cv")}><b>{t("rf.cv", "My experience")}</b><span>{t("rf.cv_q", "Which role fits me?")}</span></button>
        <button role="tab" aria-selected={mode === "jd"} onClick={() => setMode("jd")}><b>{t("rf.jd", "A job description")}</b><span>{t("rf.jd_q", "How does this role compare?")}</span></button>
      </div>

      <div className="frame rf-in">
        <label htmlFor="rf-text" className="kicker">{mode === "cv" ? t("rf.cv_label", "Your experience") : t("rf.jd_label", "The job description")}</label>
        <textarea id="rf-text" value={text[mode]} onChange={(e) => setText((x) => ({ ...x, [mode]: e.target.value }))} maxLength={20000}
          placeholder={mode === "cv" ? t("rf.cv_ph", "Paste your CV, your LinkedIn About, or just a list: Python, RAG, evals, customer workshops…") : t("rf.jd_ph", "Paste a job description. Put the job title on the first line.")} />
        <div className="rf-bar">
          <button className="btn" onClick={() => run(text[mode])}>{mode === "cv" ? t("rf.cv_go", "Check my fit →") : t("rf.jd_go", "Audit this role →")}</button>
          {Object.keys(samples).map((k) => <button key={k} className="chip" onClick={() => { setText((x) => ({ ...x, [mode]: samples[k] })); run(samples[k]); }}>{k}</button>)}
          <span className="muted rf-note">{t("rf.private", "Runs in your browser. Nothing you paste is sent or stored.")} {t("rf.english", "")}</span>
        </div>
        <span className="rod" />
      </div>

      {mode === "cv" && cv && (
        <div className="rf-out" aria-live="polite">
          {!cv.have.length && !cv.tools.length ? <p className="lead">{t("rf.cv_none", "I could not find skills I can read in that text. Try pasting the skills part of your CV.")}</p> : (
            <>
              <div className="rf-head">
                <div>
                  <span className="kicker">{t("rf.closest", "Closest fit")}</span>
                  <h2 style={{ marginTop: 6 }}>{best!.r.name}<span className="dot">.</span></h2>
                  <p className="muted" style={{ marginTop: 6 }}>{t("rf.fit_line", "{fit}% of what {n} {role} postings ask for, weighted by how often they ask.", { fit: best!.fit, n: best!.r.n, role: best!.r.name })}</p>
                </div>
                <div>
                  <span className="kicker">{t("rf.read", "Read from your text")}</span>
                  <div className="rf-chips">
                    {cv.have.map((id) => <span key={id} className="chip on">{sn(id)}</span>)}
                    {cv.tools.map((t) => <span key={t} className="chip">{t}</span>)}
                  </div>
                </div>
              </div>
              <Path ids={best!.missing.map(([id]) => id)} title={t("rf.path_cv", "Your path to {role}: what its postings ask for that you don't show yet", { role: best!.r.name })} />
              <ol className="rf-roles">
                {cv.roles.map(({ r, fit, missing, missingTools }, i) => (
                  <li key={r.id} className={i === 0 ? "top" : ""}>
                    <div className="rf-row">
                      <span className="rf-name"><b>{r.name}</b><span className="muted"> · {r.family} · {t("rf.postings", "{n} postings", { n: r.n })}</span></span>
                      <span className="rf-track"><span style={{ width: `${fit}%` }} /></span>
                      <span className="mono rf-pct">{fit}%</span>
                    </div>
                    {(missing.length > 0 || missingTools.length > 0) && (
                      <p className="rf-next">
                        <span className="kicker">{t("rf.learn_next", "Learn next")}</span>{" "}
                        {missing.map(([id, w]) => <Link key={id} href={learn[id]?.[0]?.href ?? "/roles/#matrix"} className="rf-gap">{sn(id)} <span className="mono muted">{w}%</span></Link>)}
                        {missingTools.map((t) => <span key={t.name} className="rf-gap tool">{t.name} <span className="mono muted">{t.share}%</span></span>)}
                      </p>
                    )}
                  </li>
                ))}
              </ol>
              <p className="count" style={{ marginTop: 14 }}>{t("rf.cv_foot", "Percentages after a skill are the share of that role's postings that ask for it. From {n} technical AI postings tracked {from} to {to}.", { n: D.postings.toLocaleString("en"), from: D.from, to: D.to })}</p>
            </>
          )}
        </div>
      )}

      {mode === "jd" && jd && (
        <div className="rf-out" aria-live="polite">
          {!jd.count && !jd.tools.length ? <p className="lead">{t("rf.jd_none", "I could not find skills I can read in that text. Paste the requirements part of the posting.")}</p> : (
            <>
              <div className="rf-head">
                <div>
                  <span className="kicker">{jd.how === "title" ? t("rf.by_title", "Reads as, from the title") : t("rf.by_skills", "Closest role family, by its skills")}</span>
                  <h2 style={{ marginTop: 6 }}>{jd.role.name}<span className="dot">.</span></h2>
                  <p className="muted" style={{ marginTop: 6 }}>{t("rf.compared", "Compared with {n} {role} postings tracked {from} to {to}.", { n: jd.role.n, role: jd.role.name, from: D.from, to: D.to })}</p>
                </div>
                <ul className="ja-verdict">
                  <li className={jd.forgot.length ? "warn" : "ok"}><b>{jd.forgot.length ? (jd.forgot.length > 1 ? t("rf.forgot_n", "{n} common asks missing", { n: jd.forgot.length }) : t("rf.forgot_1", "1 common ask missing")) : t("rf.forgot_0", "Covers the common asks")}</b><span className="muted">{jd.forgot.length ? t("rf.forgot_line", "Most similar postings ask for these; this one doesn't.") : t("rf.forgot_ok", "Nothing most similar postings ask for is left out.")}</span></li>
                  <li className={jd.rare.length ? "warn" : "ok"}><b>{jd.rare.length ? (jd.rare.length > 1 ? t("rf.rare_n", "{n} rare asks", { n: jd.rare.length }) : t("rf.rare_1", "1 rare ask")) : t("rf.rare_0", "No rare asks")}</b><span className="muted">{jd.rare.length ? t("rf.rare_line", "Under a quarter of similar postings ask for these: fewer people will match.") : t("rf.rare_ok", "Every skill it asks for is usual for this role.")}</span></li>
                  <li className={jd.over ? "warn" : "ok"}><b>{t("rf.count", "{n} skill areas asked", { n: jd.count })}</b><span className="muted">{t("rf.avg", "Similar postings ask for {n} on average.", { n: jd.role.avgSkills })}{jd.over ? " " + t("rf.over", "A long list narrows the pool to almost no one.") : ""}</span></li>
                </ul>
              </div>

              <span className="kicker" style={{ display: "block", marginTop: 26 }}>{t("rf.against", "What it asks for, against the market")}</span>
              <ul className="ja-rows">
                {jd.askedRows.map((r) => (
                  <li key={r.id} className={`ja-${r.band}`}>
                    <span className="ja-name">{sn(r.id)}</span>
                    <span className="rf-track"><span style={{ width: `${r.share}%` }} /></span>
                    <span className="mono rf-pct">{r.share}%</span>
                    <span className="ja-band">{band(r.band)}</span>
                  </li>
                ))}
                {jd.forgot.map(([id, w]) => (
                  <li key={id} className="ja-forgot">
                    <span className="ja-name">{sn(id)}</span>
                    <span className="rf-track"><span style={{ width: `${w}%` }} /></span>
                    <span className="mono rf-pct">{w}%</span>
                    <span className="ja-band">{band("not asked")}</span>
                  </li>
                ))}
              </ul>
              {(jd.tools.length > 0 || jd.forgotTools.length > 0) && (
                <p className="rf-next" style={{ marginTop: 14 }}>
                  <span className="kicker">{t("rf.tools", "Tools")}</span>{" "}
                  {jd.tools.map((t) => <span key={t} className="chip on">{t}</span>)}
                  {jd.forgotTools.map((t2) => <span key={t2.name} className="rf-gap">{t2.name} <span className="mono muted">{t("rf.share", "{n}% of similar postings", { n: t2.share })}</span></span>)}
                </p>
              )}

              <div className="ja-two">
                <div className="frame ja-card">
                  <span className="kicker">{t("rf.hiring", "If you are hiring")}</span>
                  <ul className="ed">
                    {jd.forgot.length > 0 && <li>{t("rf.h_forgot", "Say whether you need {skills}: most {role} postings ask, and strong candidates will look for it.", { skills: ls(jd.forgot.map(([id]) => sn(id))), role: jd.role.name })}</li>}
                    {jd.rare.length > 0 && <li>{t("rf.h_rare", "Check you truly need {skills}. Rare asks shrink the pool; move them to “nice to have” if you can.", { skills: ls(jd.rare.map((r) => sn(r.id))) })}</li>}
                    {jd.over && <li>{t("rf.h_over", "Cut the list toward {n} core areas. A posting that asks for everything reads as unclear about the job.", { n: Math.round(jd.role.avgSkills) })}</li>}
                    {!jd.forgot.length && !jd.rare.length && !jd.over && <li>{t("rf.h_ok", "This posting reads like the market: clear, usual asks, a normal length.")}</li>}
                  </ul>
                  <span className="rod" />
                </div>
                <div className="frame ja-card">
                  <span className="kicker">{t("rf.applying", "If you are applying")}</span>
                  <ul className="ed">
                    {jd.askedRows.filter((r) => r.band === "standard").length > 0 && <li>{t("rf.a_lead", "Lead with {skills}: the core of this role across the market.", { skills: ls(jd.askedRows.filter((r) => r.band === "standard").map((r) => sn(r.id)).slice(0, 3)) })}</li>}
                    {jd.rare.length > 0 && <li>{jd.rare.length > 1 ? t("rf.a_rare_n", "{skills} are unusual here. If you have them, say so early: few applicants will.", { skills: ls(jd.rare.map((r) => sn(r.id))) }) : t("rf.a_rare_1", "{skills} is unusual here. If you have it, say so early: few applicants will.", { skills: sn(jd.rare[0].id) })}</li>}
                    <li>{t("rf.a_other", "Check your own fit in the other tab, then follow the path below for anything you are missing.")}</li>
                  </ul>
                  <span className="rod" />
                </div>
              </div>
              <Path ids={jd.askedRows.map((r) => r.id).slice(0, 5)} title={t("rf.path_jd", "Learn what this role asks for, on this site")} />
            </>
          )}
        </div>
      )}

      <style>{`
        .rf-tabs { display: inline-flex; gap: 4px; padding: 4px; border-radius: 14px; background: var(--paper); border: 1px solid var(--line); margin-bottom: 16px; flex-wrap: wrap; }
        .rf-tabs button { display: flex; flex-direction: column; align-items: flex-start; gap: 2px; padding: 9px 16px; border-radius: 10px; border: 0; background: transparent; cursor: pointer; font: inherit; color: var(--sec); text-align: left; }
        .rf-tabs button b { font-size: 0.95rem; color: inherit; }
        .rf-tabs button span { font-size: 0.75rem; color: var(--muted); }
        .rf-tabs button[aria-selected="true"] { background: var(--card); color: var(--ink); box-shadow: 0 1px 2px rgba(28,28,30,0.12), 0 0 0 1px var(--line); }
        .rf-in { padding: 22px 26px 34px; }
        .rf-in textarea { display: block; width: 100%; min-height: 150px; margin-top: 10px; padding: 14px 16px; border-radius: 12px; border: 1px solid var(--line-strong); background: var(--bg); color: var(--ink); font: inherit; font-size: 0.95rem; line-height: 1.5; resize: vertical; }
        .rf-in textarea:focus { outline: 2px solid var(--rust); outline-offset: 1px; border-color: transparent; }
        .rf-bar { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; margin-top: 14px; }
        .rf-bar button.chip { cursor: pointer; font: inherit; font-size: 0.8rem; }
        .rf-note { font-size: 0.8rem; margin-left: auto; }
        .rf-out { margin-top: 28px; }
        .rf-head { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 24px; align-items: start; }
        .rf-chips { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px; }
        .rf-roles { list-style: none; padding: 0; margin: 24px 0 0; border-top: 1px solid var(--line); }
        .rf-roles li { padding: 14px 0; border-bottom: 1px solid var(--line); }
        .rf-row { display: grid; grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr) 3.2rem; gap: 14px; align-items: center; }
        .rf-name { font-size: 0.95rem; }
        .rf-track { height: 8px; border-radius: 8px; background: var(--paper); border: 1px solid var(--line); overflow: hidden; }
        .rf-track span { display: block; height: 100%; background: var(--ink); border-radius: 8px; transition: width 0.6s var(--ease); }
        .rf-roles li.top .rf-track span { background: var(--rust); }
        .rf-pct { text-align: right; }
        .rf-next { display: flex; flex-wrap: wrap; gap: 6px 10px; align-items: baseline; margin-top: 8px; font-size: 0.85rem; }
        .rf-gap { padding: 2px 9px; border-radius: 999px; border: 1px dashed var(--line-strong); color: var(--ink); text-decoration: none; }
        a.rf-gap:hover { border-color: var(--rust); color: var(--rust-deep); }
        .rf-gap.tool { border-style: solid; }
        .lp { margin-top: 26px; padding: 20px 22px; border-radius: var(--radius); background: var(--paper); border: 1px solid var(--line); }
        .lp-steps { list-style: none; padding: 0; margin: 14px 0 0; display: flex; flex-direction: column; gap: 14px; }
        .lp-steps li { display: grid; grid-template-columns: 28px minmax(0, 1fr); gap: 12px; align-items: start; }
        .lp-n { display: grid; place-items: center; width: 28px; height: 28px; border-radius: 50%; background: var(--rust); color: #fff; font-family: var(--font-mono), monospace; font-size: 0.8rem; }
        .lp-steps b { font-size: 0.98rem; }
        .lp-steps .muted { font-size: 0.85rem; }
        .lp-links { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
        .lp-links .chip, .rf-next .rf-gap { white-space: normal; max-width: 100%; }
        .lp-k { font-family: var(--font-mono), monospace; font-size: 0.62rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--rust-deep); margin-right: 2px; }
        .ja-verdict { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 10px; }
        .ja-verdict li { display: flex; flex-direction: column; gap: 2px; padding: 10px 14px; border-radius: 10px; border: 1px solid var(--line); }
        .ja-verdict li.warn { border-color: color-mix(in srgb, var(--rust) 40%, transparent); background: var(--paper); }
        .ja-verdict li b { font-size: 0.92rem; }
        .ja-verdict li.warn b { color: var(--rust-deep); }
        .ja-verdict li .muted { font-size: 0.82rem; }
        .ja-rows { list-style: none; padding: 0; margin: 12px 0 0; border-top: 1px solid var(--line); }
        .ja-rows li { display: grid; grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr) 3.2rem 5.5rem; gap: 14px; align-items: center; padding: 10px 0; border-bottom: 1px solid var(--line); font-size: 0.92rem; }
        .ja-band { font-family: var(--font-mono), monospace; font-size: 0.68rem; text-transform: uppercase; letter-spacing: 0.06em; color: var(--muted); text-align: right; }
        .ja-standard .rf-track span { background: var(--ink); }
        .ja-rare .rf-track span { background: var(--muted); }
        .ja-rare .ja-band { color: var(--rust-deep); }
        .ja-forgot { opacity: 0.85; }
        .ja-forgot .ja-name { color: var(--rust-deep); }
        .ja-forgot .rf-track span { background: repeating-linear-gradient(90deg, var(--rust) 0 6px, transparent 6px 10px); }
        .ja-forgot .ja-band { color: var(--rust-deep); }
        .ja-two { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 26px; }
        .ja-card { padding: 18px 22px 32px; }
        .ja-card .ed { margin-top: 10px; font-size: 0.9rem; }
        @media (max-width: 760px) {
          .rf-head, .ja-two { grid-template-columns: 1fr; }
          .rf-row { grid-template-columns: 1fr 3rem; } .rf-row .rf-track { grid-column: 1 / -1; grid-row: 2; }
          .ja-rows li { grid-template-columns: 1fr 3rem; } .ja-rows .rf-track { grid-column: 1 / -1; grid-row: 2; } .ja-band { grid-column: 1 / -1; text-align: left; }
          .rf-note { margin-left: 0; }
        }
      `}</style>
    </div>
  );
}
