import type { Metadata } from "next";
import { SkillsExplorer } from "@/components/skills-explorer";
import { fRoles, skills, LEVELS, education, SOURCES } from "@/data/framework";
import { stack } from "@/data/stack";
import { layers } from "@/data/layers";

export const metadata: Metadata = { title: "Roles and skills", description: "A framework for AI-native developers, forward deployed engineers, applied AI and product engineering roles: titles, tasks, skills, stacks, education." };

export default function Roles() {
  const layerNames = Object.fromEntries(layers.map((l) => [l.id, l.name]));
  return (
    <>
      <section className="section">
        <div className="wrap">
          <span className="kicker">Roles and skills framework</span>
          <h1 style={{ marginTop: 12 }}>Who builds it, and what they need<span className="dot">.</span></h1>
          <p className="lead" style={{ marginTop: 16 }}>Eight role families across AI-native development, forward deployment, applied AI and product engineering. For each: the job titles you will see, the tasks, the stack, and twelve skills scored from aware to expert by what you can actually do.</p>
          <div style={{ marginTop: 32 }}><SkillsExplorer roles={fRoles} stack={stack} layerNames={layerNames} /></div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <span className="kicker">The whole matrix</span>
          <h2 style={{ marginTop: 10 }}>Eight roles, twelve skills<span className="dot">.</span></h2>
          <p className="lead" style={{ marginTop: 12 }}>Red beads show the level each role needs: {LEVELS.slice(1).join(", ").toLowerCase()}.</p>
          <div className="mx-wrap">
            <table className="mx">
              <thead><tr><th>Skill</th>{fRoles.map((r) => <th key={r.id}><span>{r.name}</span></th>)}</tr></thead>
              <tbody>
                {skills.map((s) => (
                  <tr key={s.id}>
                    <th scope="row"><b>{s.name}</b><span className="muted">{s.what}</span></th>
                    {fRoles.map((r) => {
                      const lv = r.levels[s.id] ?? 0;
                      return <td key={r.id} title={`${r.name} · ${s.name}: ${LEVELS[lv]}`}><span className="mx-beads">{[0, 1, 2, 3].map((b) => <i key={b} className={b < lv ? "on" : ""} />)}</span></td>;
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="section" style={{ background: "var(--paper)" }}>
        <div className="wrap">
          <span className="kicker">Education and credentials</span>
          <h2 style={{ marginTop: 10 }}>What shows up in hiring<span className="dot">.</span></h2>
          <p className="lead" style={{ marginTop: 12 }}>Degrees open the door; certifications show you have used a specific stack. Exam names and tiers change often, so check each provider before you book.</p>
          <div className="grid grid-3" style={{ marginTop: 26 }}>
            {education.map((e) => (
              <div key={e.kind} className="frame">
                <span className="kicker">{e.kind}</span>
                <ul className="ed">{e.items.map((i) => <li key={i}><span className="bead white" />{i}</li>)}</ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <span className="kicker">Sources</span>
          <p className="muted" style={{ marginTop: 10, maxWidth: "70ch" }}>Built from 2026 job postings and role guides. The skill levels are an editorial synthesis of them, not an industry standard.</p>
          <ul className="src">{SOURCES.map((s) => <li key={s.url}><a href={s.url} target="_blank" rel="noreferrer">{s.label} ↗</a></li>)}</ul>
        </div>
      </section>
      <style>{`
        .mx-wrap { margin-top: 24px; overflow-x: auto; border: 1px solid var(--line); border-radius: 14px; }
        .mx { border-collapse: collapse; width: 100%; min-width: 980px; font-size: .88rem; }
        .mx th, .mx td { padding: 10px 12px; border-bottom: 1px solid var(--line); text-align: left; vertical-align: middle; }
        .mx thead th { font-family: var(--font-mono), monospace; font-size: .7rem; letter-spacing: .04em; color: var(--sec); font-weight: 400; vertical-align: bottom; }
        .mx tbody th { display: flex; flex-direction: column; gap: 2px; font-weight: 400; min-width: 220px; } .mx tbody th .muted { font-size: .78rem; }
        .mx-beads { display: inline-flex; gap: 3px; } .mx-beads i { width: 10px; height: 10px; border-radius: 50%; background: var(--line-strong); }
        .mx-beads i.on { background: radial-gradient(circle at 34% 30%, #ff9d8f, #e0301e 45%, #9e1a0c); }
        .ed { list-style: none; margin: 10px 0 0; padding: 0; display: grid; gap: 8px; } .ed li { display: flex; gap: 10px; align-items: baseline; } .ed .bead { width: 10px; height: 10px; flex: none; }
        .src { margin: 14px 0 0; padding-left: 18px; display: grid; gap: 6px; color: var(--sec); } .src a { text-decoration: none; } .src a:hover { color: var(--rust-deep); }
      `}</style>
    </>
  );
}
