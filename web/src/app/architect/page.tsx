import type { Metadata } from "next";
import Link from "next/link";
import { SectionIntro } from "@/components/section-intro";
import { fRoles, skills, LEVELS } from "@/data/framework";
import { layers } from "@/data/layers";
import { structure } from "@/lib/structure";

export const metadata: Metadata = { title: "AI-native architect", description: "The AI-native architect: what the role does, the layers it designs, the stack and the problems it solves." };

export default function Architect() {
  const role = fRoles.find((r) => r.id === "ai-native-architect")!;
  const sec = structure.find((s) => s.id === "architect")!;
  const layerNames = Object.fromEntries(layers.map((l) => [l.id, l.name]));
  const top = skills.filter((s) => (role.levels[s.id] ?? 0) >= 3);
  return (
    <>
      <section className="section">
        <div className="wrap">
          <SectionIntro id="architect" lead={role.oneLine} />
        </div>
      </section>

      <section className="section" style={{ background: "var(--paper)" }}>
        <div className="wrap grid grid-2" style={{ alignItems: "start" }}>
          <div className="frame">
            <span className="kicker">What the job is called</span>
            <ul className="ar-list">{role.titles.map((t) => <li key={t}><span className="bead white" />{t}</li>)}</ul>
            <span className="kicker" style={{ display: "block", marginTop: 22 }}>What they do</span>
            <ul className="ar-list">{role.tasks.map((t) => <li key={t}><span className="bead" />{t}</li>)}</ul>
          </div>
          <div className="frame">
            <span className="kicker">Skills at fluent or expert</span>
            <ul className="ar-list">{top.map((s) => <li key={s.id}><span className="mx-beads">{[0, 1, 2, 3].map((b) => <i key={b} className={b < (role.levels[s.id] ?? 0) ? "on" : ""} />)}</span><b>{s.name}</b><span className="muted"> · {LEVELS[role.levels[s.id] ?? 0]}</span></li>)}</ul>
            <span className="kicker" style={{ display: "block", marginTop: 22 }}>Layers they own</span>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 }}>{role.layers.map((l) => <span key={l} className="chip">{layerNames[l]}</span>)}</div>
            <span className="kicker" style={{ display: "block", marginTop: 22 }}>How it grows</span>
            <ol className="ar-grow">{role.growth.map((g) => <li key={g.level}><b>{g.level}</b><span className="muted">{g.scope}</span></li>)}</ol>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <span className="kicker">The architect's toolkit</span>
          <h2 style={{ marginTop: 10 }}>Layers, stack, problems<span className="dot">.</span></h2>
          <div className="grid grid-3" style={{ marginTop: 26 }}>
            {sec.pages.slice(1).map((p, i) => (
              <Link key={p.href} href={p.href} className="frame rise" style={{ ["--i" as string]: i, paddingBottom: 38 }}>
                <span className="count">03.{i + 1}</span>
                <h3 style={{ fontSize: "1.6rem", fontWeight: 800, marginTop: 8 }}>{p.label}<span className="dot">.</span></h3>
                <p className="muted" style={{ marginTop: 8 }}>{p.note}</p>
                <span className="rod" />
              </Link>
            ))}
          </div>
        </div>
      </section>
      <style>{`
        .ar-list { list-style: none; margin: 10px 0 0; padding: 0; display: grid; gap: 8px; } .ar-list li { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
        .ar-list .bead { width: 10px; height: 10px; flex: none; }
        .mx-beads { display: inline-flex; gap: 3px; } .mx-beads i { width: 10px; height: 10px; border-radius: 50%; background: var(--line-strong); }
        .mx-beads i.on { background: radial-gradient(circle at 34% 30%, #ff9d8f, #e0301e 45%, #9e1a0c); }
        .ar-grow { list-style: none; margin: 10px 0 0; padding: 0; display: grid; gap: 8px; counter-reset: g; }
        .ar-grow li { display: grid; grid-template-columns: 110px 1fr; gap: 10px; font-size: .92rem; }
      `}</style>
    </>
  );
}
