import type { Metadata } from "next";
import Link from "next/link";
import { SectionIntro } from "@/components/section-intro";
import { fRoles, skills, LEVELS } from "@/data/framework";
import { layers } from "@/data/layers";
import { structure } from "@/lib/structure";
import { T } from "@/i18n/lang";
import { slug } from "@/i18n/slug";
import { share } from "@/lib/share";

export const metadata: Metadata = { ...share("architect"), title: "AI-native architect", description: "The AI-native architect: what the role does, the layers it designs, the stack and the problems it solves." };

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
            <span className="kicker"><T k="ar.called">What the job is called</T></span>
            <ul className="ar-list">{role.titles.map((t) => <li key={t}><span className="bead white" />{t}</li>)}</ul>
            <span className="kicker" style={{ display: "block", marginTop: 22 }}><T k="ar.do">What they do</T></span>
            <ul className="ar-list">{role.tasks.map((t, i) => <li key={t}><span className="bead" /><T k={`role.${role.id}.task.${i}`}>{t}</T></li>)}</ul>
          </div>
          <div className="frame">
            <span className="kicker"><T k="ar.skills">Skills at fluent or expert</T></span>
            <ul className="ar-list">{top.map((s) => <li key={s.id}><span className="mx-beads">{[0, 1, 2, 3].map((b) => <i key={b} className={b < (role.levels[s.id] ?? 0) ? "on" : ""} />)}</span><b><T k={`skill.${s.id}`}>{s.name}</T></b><span className="muted"> · <T k={`lv.${role.levels[s.id] ?? 0}`}>{LEVELS[role.levels[s.id] ?? 0]}</T></span></li>)}</ul>
            <span className="kicker" style={{ display: "block", marginTop: 22 }}><T k="ar.layers">Layers they own</T></span>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 }}>{role.layers.map((l) => <span key={l} className="chip"><T k={`layer.${l}`}>{layerNames[l]}</T></span>)}</div>
            <span className="kicker" style={{ display: "block", marginTop: 22 }}><T k="ar.grows">How it grows</T></span>
            <ol className="ar-grow">{role.growth.map((g, i) => <li key={g.level}><b><T k={`lvl.${g.level.toLowerCase()}`}>{g.level}</T></b><span className="muted"><T k={`role.${role.id}.grow.${i}`}>{g.scope}</T></span></li>)}</ol>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <span className="kicker"><T k="ar.toolkit">The architect’s toolkit</T></span>
          <h2 style={{ marginTop: 10 }}><T k="ar.toolkit_h">Layers, stack, problems</T><span className="dot">.</span></h2>
          <div className="grid grid-3" style={{ marginTop: 26 }}>
            {sec.pages.slice(1).map((p, i) => (
              <Link key={p.href} href={p.href} className="frame rise" style={{ ["--i" as string]: i, paddingBottom: 38 }}>
                <span className="count">03.{i + 1}</span>
                <h3 style={{ fontSize: "1.6rem", fontWeight: 800, marginTop: 8 }}><T k={`page.${slug(p.label)}`}>{p.label}</T><span className="dot">.</span></h3>
                <p className="muted" style={{ marginTop: 8 }}><T k={`note.${slug(p.label)}`}>{p.note}</T></p>
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
