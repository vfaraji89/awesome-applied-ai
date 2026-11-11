"use client";
import { useMemo, useState } from "react";
import data from "@/data/role-fit.json";
import { skills as skillDefs } from "@/data/framework";

/* Role fit: paste a CV, a LinkedIn "About" or a list of skills. It is read with the same
   patterns the tracker uses on postings, then compared with what each role family's
   postings actually ask for. Everything runs in the browser. */

type Role = { id: string; name: string; family: string; n: number; skills: Record<string, number>; tools: { name: string; share: number }[] };
const D = data as unknown as { postings: number; from: string; to: string; roles: Role[]; skillPatterns: { id: string; source: string; flags: string }[]; toolPatterns: { name: string; source: string; flags: string }[] };
const skillRe = D.skillPatterns.map((s) => ({ id: s.id, re: new RegExp(s.source, s.flags) }));
const toolRe = D.toolPatterns.map((t) => ({ name: t.name, re: new RegExp(t.source, t.flags) }));
const skillName = (id: string) => skillDefs.find((s) => s.id === id)?.name ?? id;

const SAMPLES: Record<string, string> = {
  "Backend engineer": "Senior backend engineer, 6 years. Python and TypeScript, REST APIs, Postgres, Docker, Kubernetes, CI/CD. Built data pipelines in BigQuery. Some system design work on distributed systems.",
  "Data scientist": "Data scientist. Python, SQL, PyTorch, model training and fine-tuning, A/B tests, dashboards. Worked with stakeholders on churn models. Built a RAG prototype with embeddings.",
  "Agent builder": "Built agents with tool calling and MCP in LangGraph; evals and tracing with Langfuse; prompt caching and token budgets; worked directly with customers on discovery and ROI; Python, TypeScript, Claude Code.",
};

function score(text: string) {
  const have = new Set(skillRe.filter((s) => s.re.test(text)).map((s) => s.id));
  const tools = new Set(toolRe.filter((t) => t.re.test(text)).map((t) => t.name));
  const roles = D.roles.map((r) => {
    const total = Object.values(r.skills).reduce((a, b) => a + b, 0) || 1;
    const got = Object.entries(r.skills).reduce((a, [id, w]) => a + (have.has(id) ? w : 0), 0);
    const toolTotal = r.tools.reduce((a, t) => a + t.share, 0) || 1;
    const toolGot = r.tools.reduce((a, t) => a + (tools.has(t.name) ? t.share : 0), 0);
    const fit = Math.round(100 * (0.8 * got / total + 0.2 * toolGot / toolTotal));
    const missing = Object.entries(r.skills).filter(([id, w]) => !have.has(id) && w >= 25).sort((a, b) => b[1] - a[1]).slice(0, 3);
    const missingTools = r.tools.filter((t) => !tools.has(t.name)).slice(0, 3);
    return { r, fit, missing, missingTools };
  }).sort((a, b) => b.fit - a.fit);
  return { have: [...have], tools: [...tools], roles };
}

export function RoleFit() {
  const [text, setText] = useState("");
  const [ran, setRan] = useState("");
  const res = useMemo(() => (ran.trim().length >= 20 ? score(ran) : null), [ran]);
  const best = res?.roles[0];
  return (
    <div className="rf">
      <div className="frame rf-in">
        <label htmlFor="rf-text" className="kicker">Your experience</label>
        <textarea id="rf-text" value={text} onChange={(e) => setText(e.target.value)} maxLength={20000}
          placeholder="Paste your CV, your LinkedIn About, or just a list: Python, RAG, evals, customer workshops…" />
        <div className="rf-bar">
          <button className="btn" onClick={() => setRan(text)}>Check my fit →</button>
          {Object.keys(SAMPLES).map((k) => <button key={k} className="chip" onClick={() => { setText(SAMPLES[k]); setRan(SAMPLES[k]); }}>{k}</button>)}
          <span className="muted rf-note">Runs in your browser. Nothing you paste is sent or stored.</span>
        </div>
        <span className="rod" />
      </div>

      {res && (
        <div className="rf-out" aria-live="polite">
          {!res.have.length && !res.tools.length ? (
            <p className="lead">I could not find skills I can read in that text. Try pasting the skills part of your CV.</p>
          ) : (
            <>
              <div className="rf-head">
                <div>
                  <span className="kicker">Closest fit</span>
                  <h2 style={{ marginTop: 6 }}>{best!.r.name}<span className="dot">.</span></h2>
                  <p className="muted" style={{ marginTop: 6 }}>{best!.fit}% of what {best!.r.n} {best!.r.name} postings ask for, weighted by how often they ask.</p>
                </div>
                <div className="rf-found">
                  <span className="kicker">Read from your text</span>
                  <div className="rf-chips">
                    {res.have.map((id) => <span key={id} className="chip on">{skillName(id)}</span>)}
                    {res.tools.map((t) => <span key={t} className="chip">{t}</span>)}
                  </div>
                </div>
              </div>

              <ol className="rf-roles">
                {res.roles.map(({ r, fit, missing, missingTools }, i) => (
                  <li key={r.id} className={i === 0 ? "top" : ""}>
                    <div className="rf-row">
                      <span className="rf-name"><b>{r.name}</b><span className="muted"> · {r.family} · {r.n} postings</span></span>
                      <span className="rf-track"><span style={{ width: `${fit}%` }} /></span>
                      <span className="mono rf-pct">{fit}%</span>
                    </div>
                    {(missing.length > 0 || missingTools.length > 0) && (
                      <p className="rf-next">
                        <span className="kicker">Learn next</span>{" "}
                        {missing.map(([id, w]) => <span key={id} className="rf-gap">{skillName(id)} <span className="mono muted">{w}%</span></span>)}
                        {missingTools.map((t) => <span key={t.name} className="rf-gap tool">{t.name} <span className="mono muted">{t.share}%</span></span>)}
                      </p>
                    )}
                  </li>
                ))}
              </ol>
              <p className="count" style={{ marginTop: 14 }}>Percentages after a skill are the share of that role&apos;s postings that ask for it. From {D.postings.toLocaleString("en")} technical AI postings tracked {D.from} to {D.to}.</p>
            </>
          )}
        </div>
      )}
      <style>{`
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
        .rf-gap { padding: 2px 9px; border-radius: 999px; border: 1px dashed var(--line-strong); }
        .rf-gap.tool { border-style: solid; }
        @media (max-width: 760px) { .rf-head { grid-template-columns: 1fr; } .rf-row { grid-template-columns: 1fr 3rem; } .rf-track { grid-column: 1 / -1; grid-row: 2; } .rf-note { margin-left: 0; } }
      `}</style>
    </div>
  );
}
