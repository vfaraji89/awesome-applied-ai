import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { harnessCounts } from "@/lib/harness-counts";
import { JsonLd } from "@/components/json-ld";
import { websiteLd } from "@/lib/seo";
import { Analytics } from "@/components/analytics";
import { LangProvider } from "@/i18n/lang";
import { site } from "@/lib/site";
import "./globals.css";

const sans = localFont({
  src: [
    { path: "./fonts/VahidSora-Regular.woff2", weight: "400" },
    { path: "./fonts/VahidSora-SemiBold.woff2", weight: "600" },
    { path: "./fonts/VahidSora-Bold.woff2", weight: "700" },
    { path: "./fonts/VahidSora-ExtraBold.woff2", weight: "800" },
  ],
  variable: "--font-sans",
  display: "swap",
});
const mono = localFont({ src: "./fonts/GeistMono-Variable.woff2", weight: "100 900", variable: "--font-mono", display: "swap" });

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: { default: `${site.title} · awesome-applied-ai`, template: `%s · awesome-applied-ai` },
  description: "Learn applied AI with animations: the jargon, the architecture, the tools, the roles and the problems that come up in real projects. Curated by Vahid Faraji.",
  authors: [{ name: site.author.name, url: site.author.site }],
  icons: {
    icon: [{ url: `${basePath}/icon.svg`, type: "image/svg+xml" }, { url: `${basePath}/icon.png`, sizes: "64x64" }],
    apple: `${basePath}/apple-icon.png`,
  },
  alternates: { canonical: "./" },
  openGraph: { type: "website", url: "./", siteName: "awesome-applied-ai", locale: "en_US", images: [{ url: `${basePath}/og.png`, width: 1200, height: 630, alt: "Applied AI: learn applied AI, one animation at a time" }] },
  twitter: { card: "summary_large_image", images: [`${basePath}/og.png`] },
};

export const viewport: Viewport = {
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#141312" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`}>
      <head>
        <meta httpEquiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https://*.google-analytics.com https://*.googletagmanager.com; font-src 'self' data:; media-src 'self' blob: data:; connect-src 'self' https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com; worker-src 'self' blob:; object-src 'none'; base-uri 'self'; form-action 'self'; frame-src 'none'; upgrade-insecure-requests" />
        <meta name="referrer" content="strict-origin-when-cross-origin" />
        <link rel="alternate" type="text/plain" href={`${basePath}/llms.txt`} title="llms.txt" />
        <JsonLd data={websiteLd()} />
      </head>
      <body>
        <LangProvider>
          <SiteHeader />
          <main>{children}</main>
          <SiteFooter counts={harnessCounts()} />
          <Analytics />
        </LangProvider>
      </body>
    </html>
  );
}
