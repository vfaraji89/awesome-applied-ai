import { Crumb } from "@/components/section-intro";
import type { Metadata } from "next";
import { JargonBrowser } from "@/components/jargon-browser";
import { fields, terms } from "@/data/dictionary";
import { More } from "@/components/more";
import { TH } from "@/i18n/lang";
import { JsonLd } from "@/components/json-ld";
import { jargonLd } from "@/lib/seo";

export const metadata: Metadata = { title: "Jargon", description: "Applied AI jargon in plain language: tap a card for the deeper answer." };

export default function Jargon() {
  return (
    <section className="section">
      <JsonLd data={jargonLd()} />
      <div className="wrap">
        <Crumb id="docs" page="Jargon" />
        <h1 style={{ marginTop: 12 }}><TH k="jargon.h1">The words, made easy</TH><span className="dot">.</span></h1>
        <p className="lead" style={{ marginTop: 16 }}><TH k="jargon.p1" vars={{ v1: terms.length }}><b>{terms.length} terms</b> you will hear in AI teams, <b>in plain language</b>.</TH></p>
        <More><p className="lead" style={{ marginTop: 12 }}><TH k="jargon.p2">The front of each card says it plainly; <b>turn it over</b> for what a good interview answer adds.</TH></p></More>
        <div style={{ marginTop: 28 }}><JargonBrowser terms={terms} fields={fields} /></div>
      </div>
    </section>
  );
}
