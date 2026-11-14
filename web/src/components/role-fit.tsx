"use client";
import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
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
    <div className="rp">
      <span className="kicker">{title}</span>
      <ol className="rp-steps">
        {ids.map((id, i) => (
          <li key={id}>
            <span className="rp-n">{i + 1}</span>
            <div>
              <b>{t(`skill.${id}`, skillName(id))}</b>
              <span className="muted"> · {t(`skillwhat.${id}`, skillDefs.find((s) => s.id === id)?.what ?? "")}</span>
              <div className="rp-links">
                {(learn[id] ?? []).map((l) => <Link key={l.href + l.label} href={l.href} className="chip"><span className="rp-k">{t(`kind.${l.kind.toLowerCase()}`, l.kind)}</span>{l.label}</Link>)}
              </div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}


// ------------------------------------------------------------------------- the dial
/* One ring, one segment per skill the role (or posting) cares about. A segment's length is
   how often postings ask for that skill, so the big asks take the most of the ring. */
type Seg = { id: string; w: number; s: "have" | "gap" | "standard" | "common" | "rare" | "forgot" };
const CX = 130, R = 104;
function arc(a0: number, a1: number) {
  const p = (a: number) => [CX + R * Math.sin(a), CX - R * Math.cos(a)];
  const [x0, y0] = p(a0), [x1, y1] = p(a1);
  return `M${x0.toFixed(2)} ${y0.toFixed(2)}A${R} ${R} 0 ${a1 - a0 > Math.PI ? 1 : 0} 1 ${x1.toFixed(2)} ${y1.toFixed(2)}`;
}
function Dial({ segs, focus, setFocus, label }: { segs: Seg[]; focus: string | null; setFocus: (id: string | null) => void; label: string }) {
  const total = segs.reduce((a, s) => a + s.w, 0) || 1;
  const gap = segs.length > 1 ? 0.035 : 0;
  let a = 0;
  return (
    <svg className={`rf-dial${focus ? " has-focus" : ""}`} viewBox="0 0 260 260" role="group" aria-label={label}>
      <circle cx={CX} cy={CX} r={R} className="rf-track-ring" />
      {!segs.length && <g className="rf-orbit"><circle cx={CX} cy={CX - R} r="7" /><circle cx={CX} cy={CX + R} r="5" /></g>}
      {segs.map((s, i) => {
        const span = (2 * Math.PI * s.w) / total;
        const a0 = a + gap / 2, a1 = a + span - gap / 2; a += span;
        return <path key={s.id} d={arc(a0, Math.max(a1, a0 + 0.01))} pathLength={100} className={`seg s-${s.s}${focus === s.id ? " is-focus" : ""}`} style={{ animationDelay: `${i * 40}ms` }}
          tabIndex={0} role="button" aria-label={s.id} onMouseEnter={() => setFocus(s.id)} onMouseLeave={() => setFocus(null)} onFocus={() => setFocus(s.id)} onBlur={() => setFocus(null)} onClick={() => setFocus(focus === s.id ? null : s.id)} />;
      })}
    </svg>
  );
}
/** Ten beads on a rod: how close a role is, at a glance. */
function Rod({ pct, hot }: { pct: number; hot?: boolean }) {
  const on = Math.round(pct / 10);
  return <span className={`rf-rod${hot ? " hot" : ""}`} aria-hidden="true">{Array.from({ length: 10 }, (_, i) => <i key={i} className={i < on ? "on" : ""} style={{ animationDelay: `${i * 35}ms` }} />)}</span>;
}

// ------------------------------------------------------------------------ the page
export function RoleFit() {
  const t = useT();
  const sn = (id: string) => t(`skill.${id}`, skillName(id));
  const ls = (xs: string[]) => list(xs, t("rf.and", " and "), t("rf.comma", ", "));
  const band = (b: string) => t(`rf.band_${b.replace(" ", "_")}`, b);
  const [mode, setMode] = useState<"cv" | "jd">("cv");
  const [text, setText] = useState({ cv: "", jd: "" });
  const [focus, setFocus] = useState<string | null>(null);
  const [pick, setPick] = useState<string | null>(null);
  const live = useDeferredValue(text[mode]);
  const cv = useMemo(() => (mode === "cv" && live.trim().length >= 20 ? scoreCv(live) : null), [mode, live]);
  const jd = useMemo(() => (mode === "jd" && live.trim().length >= 40 ? auditJd(live) : null), [mode, live]);
  const samples = mode === "cv" ? CV_SAMPLES : JD_SAMPLES;
  const tracked = useRef("");
  useEffect(() => { setFocus(null); setPick(null); }, [mode]);
  useEffect(() => {
    const id = setTimeout(() => { const k = mode + live.length; if (live.trim().length >= 20 && tracked.current !== k) { tracked.current = k; track("role_fit_check", { mode, chars: Math.min(live.length, 5000) }); } }, 1500);
    return () => clearTimeout(id);
  }, [mode, live]);

  // the role on the dial: the closest one, or the one picked from the list
  const sel = cv ? (cv.roles.find((x) => x.r.id === pick) ?? cv.roles[0]) : null;
  const have = new Set(cv?.have ?? []);
  const segs: Seg[] = sel
    ? Object.entries(sel.r.skills).filter(([, w]) => w >= 10).sort((a, b) => b[1] - a[1]).map(([id, w]) => ({ id, w, s: have.has(id) ? "have" : "gap" }))
    : jd ? [...jd.askedRows.map((r) => ({ id: r.id, w: Math.max(r.share, 6), s: r.band } as Seg)), ...jd.forgot.map(([id, w]) => ({ id, w, s: "forgot" } as Seg))] : [];
  const fs = segs.find((s) => s.id === focus);
  const shareOf = (id: string) => (sel ? sel.r.skills[id] : jd?.role.skills[id]) ?? 0;
  const status: Record<Seg["s"], string> = { have: t("rf.s_have", "you show it"), gap: t("rf.s_gap", "to learn"), standard: band("standard"), common: band("common"), rare: band("rare"), forgot: band("not asked") };
  const nHave = segs.filter((s) => s.s === "have").length, nGap = segs.filter((s) => s.s === "gap").length;
  const found = mode === "cv" ? cv : jd;
  const chips = mode === "cv" ? (cv ? { skills: cv.have, tools: cv.tools } : null) : (jd ? { skills: jd.askedRows.map((r) => r.id), tools: jd.tools } : null);

  return (
    <div className="rf">
      <div className="rf-tabs" role="tablist" aria-label={t("rf.tabs", "Which way round")}>
        <button role="tab" aria-selected={mode === "cv"} onClick={() => setMode("cv")}><b>{t("rf.cv", "My experience")}</b><span>{t("rf.cv_q", "How ready am I?")}</span></button>
        <button role="tab" aria-selected={mode === "jd"} onClick={() => setMode("jd")}><b>{t("rf.jd", "A job description")}</b><span>{t("rf.jd_q", "How does it compare?")}</span></button>
      </div>

      <div className="rf-stage">
        <div>
          <div className="rf-in">
            <label htmlFor="rf-text" className="sr-only">{mode === "cv" ? t("rf.cv_label", "Your experience") : t("rf.jd_label", "The job description")}</label>
            <textarea id="rf-text" value={text[mode]} onChange={(e) => setText((x) => ({ ...x, [mode]: e.target.value }))} maxLength={20000} spellCheck={false}
              placeholder={mode === "cv" ? t("rf.cv_ph", "Paste your CV, your LinkedIn About, or just a list: Python, RAG, evals, customer workshops…") : t("rf.jd_ph", "Paste a job description. Put the job title on the first line.")} />
            <div className="rf-tray" data-empty={t("rf.tray", "Skills appear here as you paste")}>
              {chips?.skills.map((id) => <span key={id} className="rf-chip on"><i />{sn(id)}</span>)}
              {chips?.tools.map((x) => <span key={x} className="rf-chip"><i />{x}</span>)}
            </div>
          </div>
          <div className="rf-samples">
            {Object.keys(samples).map((k) => <button key={k} type="button" aria-pressed={text[mode] === samples[k]} onClick={() => setText((x) => ({ ...x, [mode]: samples[k] }))}>{k}</button>)}
          </div>
          <p className="rf-note">{t("rf.private", "Runs in your browser. Nothing you paste is sent or stored.")}{t("rf.sp", " ")}{t("rf.english", "")}</p>
        </div>

        <div className="rf-dialbox">
          <div className="rf-dialwrap">
            <Dial segs={segs} focus={focus} setFocus={setFocus} label={t("rf.dial", "Skill dial")} />
            <div className={`rf-center${fs ? " is-focus" : ""}`}>
              {fs ? (
                <div className="rf-focus"><b>{sn(fs.id)}</b><em className={`s-${fs.s}`}>{status[fs.s]}</em><small>{t("rf.asked_by", "asked in {n}% of these postings", { n: shareOf(fs.id) })}</small></div>
              ) : sel ? (
                <><div className="rf-score"><b>{sel.fit}</b><span>%</span></div><span className="rf-cap">{t("rf.cap_ready", "ready for")}</span><span className="rf-role">{sel.r.name}</span></>
              ) : jd ? (
                <><div className="rf-score"><b>{jd.count}</b><span>/{Math.round(jd.role.avgSkills)}</span></div><span className="rf-cap">{t("rf.cap_jd", "skill areas, vs. usual")}</span><span className="rf-role">{jd.role.name}</span></>
              ) : (
                <><div className="rf-score idle"><b>0</b><span>%</span></div><span className="rf-cap">{mode === "cv" ? t("rf.cap_idle", "paste to start") : t("rf.cap_idle_jd", "paste a posting")}</span></>
              )}
            </div>
          </div>
          {sel && <div className="rf-legend"><span className="s-have"><i /><b>{nHave}</b> {t("rf.l_have", "you show")}</span><span className="s-gap"><i /><b>{nGap}</b> {t("rf.l_gap", "to learn")}</span></div>}
          {jd && <div className="rf-legend"><span className="s-standard"><i />{band("standard")}</span><span className="s-common"><i />{band("common")}</span><span className="s-rare"><i />{band("rare")}</span>{jd.forgot.length > 0 && <span className="s-forgot"><i />{band("not asked")}</span>}</div>}
        </div>
      </div>

      {found && !chips?.skills.length && !chips?.tools.length && <p className="rf-none">{mode === "cv" ? t("rf.cv_none", "I could not find skills I can read in that text. Try pasting the skills part of your CV.") : t("rf.jd_none", "I could not find skills I can read in that text. Paste the requirements part of the posting.")}</p>}

      {mode === "cv" && cv && sel && (cv.have.length > 0 || cv.tools.length > 0) && (
        <div className="rf-out" aria-live="polite">
          <p className="rf-says">{t("rf.fit_line", "{fit}% of what {n} {role} postings ask for, weighted by how often they ask.", { fit: sel.fit, n: sel.r.n, role: sel.r.name })}</p>
          <h2 className="rf-h">{t("rf.roles_h", "How close you are to each role")}<span>{t("rf.roles_sub", "tap a role to put it on the dial")}</span></h2>
          <ol className="rf-roles">
            {cv.roles.map(({ r, fit, missing }, i) => (
              <li key={r.id}>
                <button type="button" className={sel.r.id === r.id ? "on" : ""} aria-pressed={sel.r.id === r.id} onClick={() => setPick(r.id)} style={{ animationDelay: `${i * 40}ms` }}>
                  <span className="rf-name"><b>{r.name}</b><small>{r.family} · {t("rf.postings", "{n} postings", { n: r.n })}</small></span>
                  <Rod pct={fit} hot={i === 0} />
                  <span className="rf-pct">{fit}%</span>
                </button>
                {sel.r.id === r.id && missing.length > 0 && (
                  <p className="rf-next"><span className="kicker">{t("rf.learn_next", "Learn next")}</span>{" "}
                    {missing.map(([id, w]) => <Link key={id} href={learn[id]?.[0]?.href ?? "/roles/matrix/"} className="rf-gap">{sn(id)} <span>{w}%</span></Link>)}
                  </p>
                )}
              </li>
            ))}
          </ol>
          <Path ids={sel.missing.map(([id]) => id)} title={t("rf.path_cv", "Your path to {role}: what its postings ask for that you don't show yet", { role: sel.r.name })} />
          <p className="rf-foot">{t("rf.cv_foot", "Percentages after a skill are the share of that role's postings that ask for it. From {n} technical AI postings tracked {from} to {to}.", { n: D.postings.toLocaleString("en"), from: D.from, to: D.to })}</p>
        </div>
      )}

      {mode === "jd" && jd && (jd.count > 0 || jd.tools.length > 0) && (
        <div className="rf-out" aria-live="polite">
          {/* role names come from our own data file, so this HTML is ours */}
          <p className="rf-says" dangerouslySetInnerHTML={{ __html: t("rf.says", "{how}: <b>{role}</b>. {compared}", { how: jd.how === "title" ? t("rf.by_title", "Reads as, from the title") : t("rf.by_skills", "Closest role family, by its skills"), role: jd.role.name, compared: t("rf.compared", "Compared with {n} {role} postings tracked {from} to {to}.", { n: jd.role.n, role: jd.role.name, from: D.from, to: D.to }) }) }} />
          <ul className="ja-verdict">
            <li className={jd.forgot.length ? "warn" : "ok"}><b>{jd.forgot.length ? (jd.forgot.length > 1 ? t("rf.forgot_n", "{n} common asks missing", { n: jd.forgot.length }) : t("rf.forgot_1", "1 common ask missing")) : t("rf.forgot_0", "Covers the common asks")}</b><span>{jd.forgot.length ? t("rf.forgot_line", "Most similar postings ask for these; this one doesn't.") : t("rf.forgot_ok", "Nothing most similar postings ask for is left out.")}</span></li>
            <li className={jd.rare.length ? "warn" : "ok"}><b>{jd.rare.length ? (jd.rare.length > 1 ? t("rf.rare_n", "{n} rare asks", { n: jd.rare.length }) : t("rf.rare_1", "1 rare ask")) : t("rf.rare_0", "No rare asks")}</b><span>{jd.rare.length ? t("rf.rare_line", "Under a quarter of similar postings ask for these: fewer people will match.") : t("rf.rare_ok", "Every skill it asks for is usual for this role.")}</span></li>
            <li className={jd.over ? "warn" : "ok"}><b>{t("rf.count", "{n} skill areas asked", { n: jd.count })}</b><span>{t("rf.avg", "Similar postings ask for {n} on average.", { n: jd.role.avgSkills })}{jd.over ? t("rf.sp", " ") + t("rf.over", "A long list narrows the pool to almost no one.") : ""}</span></li>
          </ul>
          {(jd.tools.length > 0 || jd.forgotTools.length > 0) && (
            <p className="rf-next" style={{ marginTop: 16 }}><span className="kicker">{t("rf.tools", "Tools")}</span>{" "}
              {jd.forgotTools.map((x) => <span key={x.name} className="rf-gap">{x.name} <span>{t("rf.share", "{n}% of similar postings", { n: x.share })}</span></span>)}
            </p>
          )}
          <div className="ja-two">
            <div className="ja-card">
              <span className="kicker">{t("rf.hiring", "If you are hiring")}</span>
              <ul>
                {jd.forgot.length > 0 && <li>{t("rf.h_forgot", "Say whether you need {skills}: most {role} postings ask, and strong candidates will look for it.", { skills: ls(jd.forgot.map(([id]) => sn(id))), role: jd.role.name })}</li>}
                {jd.rare.length > 0 && <li>{t("rf.h_rare", "Check you truly need {skills}. Rare asks shrink the pool; move them to “nice to have” if you can.", { skills: ls(jd.rare.map((r) => sn(r.id))) })}</li>}
                {jd.over && <li>{t("rf.h_over", "Cut the list toward {n} core areas. A posting that asks for everything reads as unclear about the job.", { n: Math.round(jd.role.avgSkills) })}</li>}
                {!jd.forgot.length && !jd.rare.length && !jd.over && <li>{t("rf.h_ok", "This posting reads like the market: clear, usual asks, a normal length.")}</li>}
              </ul>
            </div>
            <div className="ja-card">
              <span className="kicker">{t("rf.applying", "If you are applying")}</span>
              <ul>
                {jd.askedRows.filter((r) => r.band === "standard").length > 0 && <li>{t("rf.a_lead", "Lead with {skills}: the core of this role across the market.", { skills: ls(jd.askedRows.filter((r) => r.band === "standard").map((r) => sn(r.id)).slice(0, 3)) })}</li>}
                {jd.rare.length > 0 && <li>{jd.rare.length > 1 ? t("rf.a_rare_n", "{skills} are unusual here. If you have them, say so early: few applicants will.", { skills: ls(jd.rare.map((r) => sn(r.id))) }) : t("rf.a_rare_1", "{skills} is unusual here. If you have it, say so early: few applicants will.", { skills: sn(jd.rare[0].id) })}</li>}
                <li>{t("rf.a_other", "Check your own fit in the other tab, then follow the path below for anything you are missing.")}</li>
              </ul>
            </div>
          </div>
          <Path ids={jd.askedRows.map((r) => r.id).slice(0, 5)} title={t("rf.path_jd", "Learn what this role asks for, on this site")} />
        </div>
      )}

      <style>{`
        .rf { --rf-spring: cubic-bezier(0.22, 1, 0.36, 1); --rf-out: cubic-bezier(0.22, 1, 0.36, 1); }
        .sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
        .rf-tabs { display: inline-flex; gap: 4px; padding: 4px; border-radius: 16px; background: var(--paper); border: 1px solid var(--line); margin-bottom: 18px; flex-wrap: wrap; max-width: 100%; }
        .rf-tabs button { display: flex; flex-direction: column; align-items: flex-start; gap: 2px; padding: 9px 16px; border-radius: 12px; border: 0; background: transparent; cursor: pointer; font: inherit; color: var(--sec); text-align: left; transition: background .25s, transform .5s var(--rf-spring); }
        .rf-tabs button b { font-size: .95rem; color: inherit; }
        .rf-tabs button span { font-size: .75rem; color: var(--muted); }
        .rf-tabs button[aria-selected="true"] { background: var(--card); color: var(--ink); outline: 1px solid var(--line); outline-offset: 0; }
        .rf-tabs button:active { transform: scale(.97); }

        .rf-stage { display: grid; grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr); gap: 20px; align-items: stretch; }
        .rf-in { display: flex; flex-direction: column; border-radius: 20px; border: 1px solid var(--line-strong); background: var(--card);  overflow: hidden; transition: border-color .3s; }
        .rf-in:focus-within { border-color: color-mix(in srgb, var(--rust) 50%, transparent); outline: 4px solid color-mix(in srgb, var(--rust) 8%, transparent); outline-offset: 0; }
        .rf-in textarea { min-height: 190px; width: 100%; padding: 18px 20px 10px; border: 0; resize: vertical; background: transparent; color: var(--ink); font: inherit; font-size: .95rem; line-height: 1.55; }
        .rf-in textarea:focus { outline: none; }
        .rf-tray { display: flex; flex-wrap: wrap; gap: 6px; min-height: 44px; padding: 9px 16px 12px; border-top: 1px dashed var(--line-strong); align-content: flex-start; }
        .rf-tray:empty::before { content: attr(data-empty); font-family: var(--font-mono), monospace; font-size: .7rem; letter-spacing: .04em; color: var(--muted); align-self: center; }
        .rf-chip { display: inline-flex; align-items: center; gap: 6px; height: 27px; padding: 0 10px 0 7px; border-radius: 999px; font-size: .76rem; font-weight: 600; color: var(--ink); border: 1px solid var(--line); background: var(--bg); animation: rf-pop .5s var(--rf-spring) both; }
        .rf-chip i { width: 9px; height: 9px; border-radius: 50%; background: var(--muted); }
        .rf-chip.on { background: var(--paper); border-color: color-mix(in srgb, var(--rust) 30%, transparent); } .rf-chip.on i { background: var(--rust); }
        .rf-samples { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
        .rf-samples button { padding: 8px 14px; border-radius: 12px; border: 1px solid var(--line); background: var(--card); color: var(--ink); font: inherit; font-size: .82rem; font-weight: 600; cursor: pointer; transition: border-color .25s, transform .5s var(--rf-spring); }
        .rf-samples button:hover { border-color: var(--rust); transform: translateY(-2px);  }
        .rf-samples button[aria-pressed="true"] { border-color: var(--rust); background: var(--paper); }
        .rf-note { margin-top: 10px; font-size: .8rem; color: var(--muted); }

        .rf-dialbox { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14px; padding: 20px; border-radius: 20px; background: radial-gradient(120% 90% at 50% 0%, var(--paper) 0%, var(--bg) 70%); border: 1px solid color-mix(in srgb, var(--rust) 14%, transparent); }
        .rf-dialwrap { position: relative; width: min(100%, 300px); aspect-ratio: 1; }
        .rf-dial { width: 100%; height: 100%; overflow: visible; }
        .rf-track-ring { fill: none; stroke: var(--line); stroke-width: 20; }
        .rf-dial .seg { fill: none; cursor: pointer; stroke-dasharray: 100; animation: rf-draw .6s var(--rf-out) both; transition: stroke-width .35s var(--rf-spring), opacity .3s; }
        .seg.s-have, .seg.s-standard { stroke: var(--rust); stroke-width: 18; }
        .seg.s-common { stroke: var(--ink); stroke-width: 12; opacity: .55; }
        .seg.s-gap, .seg.s-rare { stroke: var(--muted); stroke-width: 6; opacity: .55; }
        .seg.s-forgot { stroke: var(--rust); stroke-width: 6; opacity: .5; }
        .rf-dial.has-focus .seg { opacity: .25; }
        .rf-dial.has-focus .seg.is-focus { opacity: 1; stroke-width: 24; }
        .seg:focus-visible { outline: none; stroke-width: 24; }
        .rf-orbit { transform-origin: 130px 130px; animation: rf-spin 7s linear infinite; }
        .rf-orbit circle { fill: var(--rust); } .rf-orbit circle + circle { fill: var(--ink); opacity: .6; }
        .rf-center { position: absolute; inset: 20%; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; pointer-events: none; }
        .rf-score { display: flex; align-items: baseline; gap: 2px; }
        .rf-score b { font-size: clamp(2.8rem, 11vw, 4rem); line-height: 1; font-weight: 800; letter-spacing: -.06em; color: var(--ink); font-variant-numeric: tabular-nums; }
        .rf-score.idle b { color: var(--line-strong); }
        .rf-score span { font-family: var(--font-mono), monospace; font-size: .8rem; color: var(--muted); }
        .rf-cap { margin-top: 6px; font-family: var(--font-mono), monospace; font-size: .64rem; letter-spacing: .1em; text-transform: uppercase; color: var(--rust-deep); }
        .rf-role { margin-top: 4px; font-size: .82rem; font-weight: 650; line-height: 1.2; color: var(--ink); }
        .rf-focus { animation: rf-pop .35s var(--rf-spring) both; }
        .rf-focus b { display: block; font-size: 1rem; line-height: 1.2; color: var(--ink); }
        .rf-focus em { display: inline-block; margin-top: 6px; padding: 2px 9px; border-radius: 999px; font-style: normal; font-family: var(--font-mono), monospace; font-size: .62rem; letter-spacing: .06em; text-transform: uppercase; background: var(--rust); color: #fff; }
        .rf-focus em.s-gap, .rf-focus em.s-rare, .rf-focus em.s-common { background: transparent; color: var(--sec); border: 1px dashed var(--line-strong); }
        .rf-focus em.s-forgot { background: transparent; color: var(--rust-deep); border: 1px dashed var(--rust); }
        .rf-focus small { display: block; margin-top: 6px; font-size: .74rem; line-height: 1.3; color: var(--sec); }
        .rf-legend { display: flex; flex-wrap: wrap; justify-content: center; gap: 6px; }
        .rf-legend span { display: inline-flex; align-items: center; gap: 6px; height: 30px; padding: 0 12px 0 9px; border-radius: 999px; border: 1px solid var(--line); background: var(--card); font-size: .78rem; font-weight: 600; color: var(--ink); }
        .rf-legend i { width: 10px; height: 10px; border-radius: 50%; }
        .rf-legend .s-have i, .rf-legend .s-standard i { background: var(--rust); }
        .rf-legend .s-common i { background: var(--ink); opacity: .55; }
        .rf-legend .s-gap i, .rf-legend .s-rare i { border: 1.5px dashed var(--muted); }
        .rf-legend .s-forgot i { border: 1.5px dashed var(--rust); }

        .rf-none { margin-top: 22px; padding: 16px 20px; border-radius: 14px; background: var(--paper); color: var(--sec); }
        .rf-out { margin-top: 26px; }
        .rf-says { padding: 16px 20px; border-radius: 16px; background: var(--paper); font-size: 1rem; font-weight: 600; color: var(--ink); }
        .rf-h { display: flex; flex-wrap: wrap; align-items: baseline; gap: 4px 12px; margin-top: 30px; font-size: 1.3rem; letter-spacing: -.03em; }
        .rf-h span { font-family: var(--font-mono), monospace; font-size: .7rem; font-weight: 400; letter-spacing: .04em; color: var(--muted); }
        .rf-roles { list-style: none; padding: 0; margin: 14px 0 0; display: flex; flex-direction: column; gap: 8px; }
        .rf-roles button { display: grid; grid-template-columns: minmax(0, 1fr) auto 3.2rem; gap: 14px; align-items: center; width: 100%; padding: 12px 16px; border-radius: 14px; border: 1px solid var(--line); background: var(--card); font: inherit; color: var(--ink); text-align: left; cursor: pointer; animation: rf-rise .5s var(--rf-spring) both; transition: border-color .25s, transform .5s var(--rf-spring); }
        .rf-roles button:hover { border-color: var(--line-strong); transform: translateY(-1px); }
        .rf-roles button.on { border-color: var(--rust); background: var(--paper); }
        .rf-name b { display: block; font-size: .95rem; } .rf-name small { font-size: .78rem; color: var(--muted); }
        .rf-pct { text-align: right; font-family: var(--font-mono), monospace; font-variant-numeric: tabular-nums; }
        .rf-rod { position: relative; display: flex; align-items: center; gap: 4px; padding: 0 2px; height: 18px; }
        .rf-rod::before { content: ""; position: absolute; left: 0; right: 0; top: 50%; height: 2px; margin-top: -1px; background: var(--rod); border-radius: 2px; }
        .rf-rod i { position: relative; width: 13px; height: 13px; border-radius: 50%; background: var(--card); border: 1.5px solid var(--line-strong); opacity: 0; transform: translateX(18px); animation: rf-slide .5s var(--rf-spring) forwards; }
        .rf-rod i.on { border: 0; background: var(--ink);  }
        .rf-rod.hot i.on { background: var(--rust); }
        .rf-next { display: flex; flex-wrap: wrap; gap: 6px 10px; align-items: baseline; margin: 10px 4px 4px; font-size: .85rem; }
        .rf-gap { padding: 3px 10px; border-radius: 999px; border: 1.5px dashed var(--line-strong); color: var(--ink); text-decoration: none; white-space: normal; animation: rf-pop .5s var(--rf-spring) both; }
        .rf-gap span { font-family: var(--font-mono), monospace; color: var(--muted); font-size: .76rem; }
        a.rf-gap:hover { border-color: var(--rust); color: var(--rust-deep); }
        .rf-foot { margin-top: 16px; font-size: .8rem; color: var(--muted); }

        .rp { margin-top: 26px; padding: 20px 22px; border-radius: 18px; background: var(--paper); border: 1px solid var(--line); }
        .rp-steps { list-style: none; padding: 0; margin: 14px 0 0; display: flex; flex-direction: column; gap: 14px; }
        .rp-steps li { display: grid; grid-template-columns: 28px minmax(0, 1fr); gap: 12px; align-items: start; animation: rf-rise .5s var(--rf-spring) both; }
        .rp-n { display: grid; place-items: center; width: 28px; height: 28px; border-radius: 50%; background: var(--rust); color: #fff; font-family: var(--font-mono), monospace; font-size: .8rem;  }
        .rp-steps b { font-size: .98rem; } .rp-steps .muted { font-size: .85rem; }
        .rp-links { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
        .rp-links .chip { white-space: normal; max-width: 100%; }
        .rp-k { font-family: var(--font-mono), monospace; font-size: .62rem; text-transform: uppercase; letter-spacing: .08em; color: var(--rust-deep); margin-right: 4px; }

        .ja-verdict { list-style: none; padding: 0; margin: 14px 0 0; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; }
        .ja-verdict li { display: flex; flex-direction: column; gap: 4px; padding: 14px 16px; border-radius: 14px; border: 1px solid var(--line); animation: rf-rise .5s var(--rf-spring) both; }
        .ja-verdict li.warn { border-color: color-mix(in srgb, var(--rust) 40%, transparent); background: var(--paper); }
        .ja-verdict li b { font-size: .95rem; } .ja-verdict li.warn b { color: var(--rust-deep); }
        .ja-verdict li span { font-size: .84rem; color: var(--sec); }
        .ja-two { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-top: 22px; }
        .ja-card { padding: 18px 22px; border-radius: 16px; border: 1px solid var(--line); background: var(--card); }
        .ja-card ul { margin: 10px 0 0; padding-left: 18px; font-size: .9rem; display: flex; flex-direction: column; gap: 6px; }

        @keyframes rf-pop { 0% { opacity: 0; transform: scale(.92); filter: blur(3px); } 100% { opacity: 1; transform: none; filter: none; } }
        @keyframes rf-rise { 0% { opacity: 0; transform: translateY(12px); filter: blur(4px); } 100% { opacity: 1; transform: none; filter: none; } }
        @keyframes rf-draw { from { stroke-dashoffset: 100; } to { stroke-dashoffset: 0; } }
        @keyframes rf-slide { to { opacity: 1; transform: none; } }
        @keyframes rf-spin { to { transform: rotate(360deg); } }
        @media (max-width: 860px) { .rf-stage, .ja-two, .ja-verdict { grid-template-columns: minmax(0, 1fr); } }
        @media (max-width: 560px) {
          .rf-roles button { grid-template-columns: minmax(0, 1fr) 3rem; } .rf-roles .rf-rod { grid-column: 1 / -1; grid-row: 2; }
          .rf-rod i { width: 11px; height: 11px; }
        }
        @media (prefers-reduced-motion: reduce) { .rf-chip, .rf-dial .seg, .rf-roles button, .rf-rod i, .rf-gap, .rp-steps li, .ja-verdict li, .rf-focus { animation: none; opacity: 1; transform: none; } .rf-orbit { animation: none; } }
      `}</style>
    </div>
  );
}
