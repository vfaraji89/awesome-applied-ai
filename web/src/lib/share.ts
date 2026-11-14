import type { Metadata } from "next";
import alts from "@/data/og-alts.json";

/* The share card for a page: its own 1200x630 image (built by scripts/og/build.ts) with alt text,
   for Open Graph (LinkedIn, Slack, WhatsApp, Facebook) and the X card. A page passes its route,
   e.g. share("tools"); "" is the home page. */
// paths are relative to metadataBase, which already carries the base path
export function share(route: string): Pick<Metadata, "openGraph" | "twitter"> {
  const img = { url: `/og/pages/${route.replace(/\//g, "__") || "home"}.png`, width: 1200, height: 630, alt: (alts as Record<string, string>)[route] ?? "Applied AI, Simplified" };
  return {
    openGraph: { type: "website", url: "./", siteName: "Applied AI, Simplified", locale: "en_US", images: [img] },
    twitter: { card: "summary_large_image", creator: "@vfaraji89", images: [img] },
  };
}
