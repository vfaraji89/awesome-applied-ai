import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { SiteHeader, type NavLayer } from "@/components/site-header";
import { ScrollProgress } from "@/components/motion";
import { Signature } from "@/components/signature";
import { layers } from "@/data/layers";
import { tools } from "@/data/tools";
import { site } from "@/lib/site";
import "katex/dist/katex.min.css";
import "./globals.css";

const recursive = localFont({
  src: "./fonts/Recursive_VF.woff2",
  weight: "300 1000",
  variable: "--font-recursive",
  display: "swap",
});

const newsreader = localFont({
  src: "./fonts/Newsreader.woff2",
  weight: "200 800",
  variable: "--font-newsreader",
  display: "swap",
});

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: site.name,
    template: `%s · ${site.name}`,
  },
  description:
    "A working map of applied AI for the enterprise: the tools, protocols, benchmarks and regulation that decide what a system knows, what it costs, and what you can prove about it.",
  authors: [{ name: site.author.name, url: site.author.site }],
  icons: { icon: `${basePath}/icon.png` },
};

export const viewport: Viewport = {
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0d0d0d" },
  ],
};

const noFlash = `try{var t=localStorage.theme;if(t!=="light"&&t!=="dark"){t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}var e=document.documentElement;e.classList.toggle("dark",t==="dark");e.style.colorScheme=t}catch(n){}`;

/** Stack order runs top-down; the menu reads it as a numbered list, bottom-up. */
const navLayers: NavLayer[] = layers
  .map((l, i) => ({
    id: l.id,
    numeral: String(layers.length - i).padStart(2, "0"),
    name: l.name,
    count: tools.filter((t) => t.layer === l.id).length,
  }))
  .reverse();

const socials = [
  { label: "Website", href: site.author.site },
  { label: "LinkedIn", href: site.author.linkedin },
  { label: "GitHub", href: site.author.github },
];

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`h-full antialiased ${recursive.variable} ${newsreader.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: noFlash }} />
      </head>
      <body className="flex min-h-full flex-col">
        <ScrollProgress />

        <a
          href="#content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-sm focus:border focus:border-line focus:bg-bg focus:px-3 focus:py-2 focus:text-ui focus:text-ink"
        >
          Skip to content
        </a>

        <SiteHeader layers={navLayers} repo={site.repo} />

        <main id="content" className="flex-1">
          {children}
        </main>

        <footer className="mt-8 border-t border-line">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <Signature />
              <p className="mt-6 max-w-xl text-meta leading-relaxed text-ink-faint">
                Notes and research, indexed July 2026. Maturity and status labels
                are my own readings, not vendor claims — verify before you
                standardise on anything here.
              </p>
            </div>
            <nav className="flex items-center gap-5 text-meta">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  className="text-ink-dim underline-offset-4 hover:text-ink hover:underline"
                >
                  {s.label}
                </a>
              ))}
            </nav>
          </div>
        </footer>
      </body>
    </html>
  );
}
