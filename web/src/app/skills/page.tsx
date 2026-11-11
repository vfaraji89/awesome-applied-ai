import type { Metadata } from "next";
import { Crumb } from "@/components/section-intro";
import { SkillMap } from "@/components/skill-map";

export const metadata: Metadata = { title: "Skill map", description: "Which applied AI skills employers ask for together, which pairs are rare, and which one skill would open the most job postings for you. Computed from real postings." };

export default function Skills() {
  return (
    <section className="section">
      <div className="wrap">
        <Crumb id="roles" page="Skill map" />
        <h1 style={{ marginTop: 12 }}>Skills are not a list. <mark>They are a map</mark><span className="dot">.</span></h1>
        <p className="lead" style={{ marginTop: 16 }}>Job postings ask for skills in packs. This page reads those packs from real postings: which skills come together, which pairs are rare in one person, and which single skill would open the most doors for you next.</p>
        <div style={{ marginTop: 34 }}><SkillMap /></div>
      </div>
    </section>
  );
}
