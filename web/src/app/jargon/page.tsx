import { Crumb } from "@/components/section-intro";
import type { Metadata } from "next";
import { JargonBrowser } from "@/components/jargon-browser";
import { fields, terms } from "@/data/dictionary";

export const metadata: Metadata = { title: "Jargon", description: "Applied AI jargon in plain language: tap a card for the deeper answer." };

export default function Jargon() {
  return (
    <section className="section">
      <div className="wrap">
        <Crumb id="docs" page="Jargon" />
        <h1 style={{ marginTop: 12 }}>The words, made easy<span className="dot">.</span></h1>
        <p className="lead" style={{ marginTop: 16 }}>{terms.length} terms you will hear in AI teams. The front of each card says it plainly; turn it over for what a good answer adds.</p>
        <div style={{ marginTop: 28 }}><JargonBrowser terms={terms} fields={fields} /></div>
      </div>
    </section>
  );
}
