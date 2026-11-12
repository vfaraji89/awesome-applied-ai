/** The emerging tech radar: what is new in applied AI, and how far to trust it.
 *  Read on 2026-11-11 from papers, project pages and practitioner write-ups. Each entry
 *  links its sources. Vendor and blog figures are treated as claims, not results, and
 *  version numbers are left out where sources disagreed. */

export type Ring = "use" | "pilot" | "evaluate" | "watch";
export type Area = "models" | "agents" | "serving" | "evals";

export interface RadarItem {
  id: string;
  name: string;
  area: Area;
  ring: Ring;
  /** One line, shown first in bold. */
  short: string;
  what: string;
  why: string;
  use: string;
  avoid: string;
  examples: { name: string; url: string }[];
  sources: { label: string; url: string }[];
  /** Links into this site, for depth. */
  more?: { label: string; href: string }[];
}

import content from "./content/radar.json";

// The entries, the date they were checked and the quarter brief are edited in the
// content Google Sheet and synced into content/radar.json (see CONTENT.md).
export const checked: string = content.checked;

/** The quarter in brief. Refresh each quarter in the sheet's radar_quarter tab. */
export const quarter: { name: string; points: { title: string; line: string; href: string }[] } = content.quarter;

export const rings: { id: Ring; name: string; line: string }[] = [
  { id: "use", name: "Use now", line: "Proven in production; a sensible default." },
  { id: "pilot", name: "Pilot", line: "Worth a real project with a fallback." },
  { id: "evaluate", name: "Evaluate", line: "Promising; test it against your baseline first." },
  { id: "watch", name: "Watch", line: "Important direction, not yet for most products." },
];

export const areas: { id: Area; name: string }[] = [
  { id: "models", name: "Models & architectures" },
  { id: "agents", name: "Agents & protocols" },
  { id: "serving", name: "Serving & context" },
  { id: "evals", name: "Evals, ops & safety" },
];

export const radar = content.items as RadarItem[];
