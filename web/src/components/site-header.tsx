"use client";

import dynamic from "next/dynamic";
import Link, { useLinkStatus } from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { ChevronDown, Menu, X } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { instruments } from "@/lib/instruments";
import { site } from "@/lib/site";

const CommandPalette = dynamic(
  () => import("@/components/command-palette").then((m) => m.CommandPalette),
  { ssr: false },
);

export type NavLayer = {
  id: string;
  numeral: string;
  name: string;
  count: number;
};

/** The five routes worth a permanent slot: the spine, the work, the two reference sets. */
const pages = [
  { href: "/cycle/", label: "Cycle" },
  { href: "/problems/", label: "Problems" },
  { href: "/research/", label: "Research" },
  { href: "/kit/", label: "Kit" },
  { href: "/tools/", label: "Index" },
];

/** Everything else lives behind one panel rather than crowding the bar. */
const morePages = [
  { href: "/shipped/", label: "Shipped", blurb: "Systems I put into production" },
  {
    href: "/dictionary/",
    label: "Dictionary",
    blurb: "The vocabulary, defined properly",
  },
  {
    href: "/commands/",
    label: "Commands",
    blurb: "What you type when it matters",
  },
  { href: "/skills/", label: "Skills", blurb: "Agent skills for applied AI" },
  {
    href: "/instruments/",
    label: "Instruments",
    blurb: "Charts you can move",
  },
];

/** The instruments sit on flat top-level routes, so Instruments stays lit on each. */
const instrumentPaths = new Set(instruments.map((n) => n.href));

function Underline({ on }: { on: boolean }) {
  const { pending } = useLinkStatus();
  return (
    <span
      aria-hidden
      className={`absolute -bottom-1 left-0 h-px w-full origin-left bg-accent transition-transform duration-200 ${
        on || pending ? "scale-x-100" : "scale-x-0"
      }`}
    />
  );
}

function NavLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`relative transition-colors ${active ? "text-ink" : "hover:text-ink"}`}
    >
      {children}
      <Underline on={active} />
    </Link>
  );
}

function LayerLink({ layer, active }: { layer: NavLayer; active: boolean }) {
  return (
    <Link
      href={`/layers/${layer.id}/`}
      aria-current={active ? "page" : undefined}
      className="flex items-baseline gap-3 rounded-sm px-3 py-2 transition-colors hover:bg-panel"
    >
      <span className="mono-data w-5 shrink-0 text-tag tabular-nums text-ink-faint">
        {layer.numeral}
      </span>
      <span className={`flex-1 text-ui ${active ? "text-accent" : "text-ink"}`}>
        {layer.name}
      </span>
      <span className="mono-data text-tag tabular-nums text-ink-faint">
        {layer.count}
      </span>
    </Link>
  );
}

export function SiteHeader({
  layers,
  repo,
}: {
  layers: NavLayer[];
  repo: string;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState<"more" | "menu" | null>(null);
  const [openedAt, setOpenedAt] = useState(pathname);

  if (openedAt !== pathname) {
    setOpenedAt(pathname);
    setOpen(null);
  }

  useEffect(() => {
    if (!open) return;
    const esc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
    };
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [open]);

  const isActive = (href: string) =>
    pathname === href ||
    (href === "/instruments/" && instrumentPaths.has(pathname));

  const onMore =
    pathname.startsWith("/layers") || morePages.some((p) => isActive(p.href));

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/80 glass">
      <div className="mx-auto flex w-full max-w-6xl items-center gap-6 px-6 py-4">
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <span aria-hidden className="size-2.5 rounded-sm bg-accent" />
          <span className="text-ui font-semibold tracking-tight text-ink">
            {site.name}
          </span>
        </Link>

        <nav
          aria-label="Primary"
          className="ml-auto hidden items-center gap-5 text-ui text-ink-dim md:flex"
        >
          {pages.map((p) => (
            <NavLink key={p.href} href={p.href} active={isActive(p.href)}>
              {p.label}
            </NavLink>
          ))}

          <button
            type="button"
            onClick={() => setOpen((o) => (o === "more" ? null : "more"))}
            aria-expanded={open === "more"}
            aria-controls="more-menu"
            className={`relative flex items-center gap-1 transition-colors ${
              onMore ? "text-ink" : "hover:text-ink"
            }`}
          >
            More
            <ChevronDown
              aria-hidden
              className={`size-3.5 transition-transform duration-200 ${
                open === "more" ? "rotate-180" : ""
              }`}
            />
            <span
              aria-hidden
              className={`absolute -bottom-1 left-0 h-px w-[calc(100%-1.125rem)] origin-left bg-accent transition-transform duration-200 ${
                onMore ? "scale-x-100" : "scale-x-0"
              }`}
            />
          </button>
        </nav>

        <div className="ml-auto flex items-center gap-3 md:ml-4">
          <CommandPalette />
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setOpen((o) => (o === "menu" ? null : "menu"))}
            aria-expanded={open === "menu"}
            aria-controls="mobile-menu"
            aria-label={open === "menu" ? "Close menu" : "Open menu"}
            className="text-ink-dim transition-colors hover:text-ink md:hidden"
          >
            {open === "menu" ? (
              <X aria-hidden className="size-5" />
            ) : (
              <Menu aria-hidden className="size-5" />
            )}
          </button>
        </div>
      </div>

      {open && (
        <button
          type="button"
          tabIndex={-1}
          aria-hidden
          onPointerDown={() => setOpen(null)}
          className="fixed inset-0 -z-10 cursor-default"
        />
      )}

      {open === "more" && (
        <div
          id="more-menu"
          className="absolute inset-x-0 top-full hidden md:block"
        >
          <div className="mx-auto w-full max-w-6xl px-6">
            <div className="ml-auto mt-2 grid w-[40rem] grid-cols-2 gap-x-4 rounded-lg border border-line bg-bg p-2">
              <div>
                <p className="label px-3 pb-1 pt-2">Context engineering</p>
                {layers.map((l) => (
                  <LayerLink
                    key={l.id}
                    layer={l}
                    active={pathname === `/layers/${l.id}/`}
                  />
                ))}
              </div>

              <div className="flex flex-col">
                <p className="label px-3 pb-1 pt-2">Also here</p>
                {morePages.map((p) => (
                  <Link
                    key={p.href}
                    href={p.href}
                    aria-current={isActive(p.href) ? "page" : undefined}
                    className="rounded-sm px-3 py-2 transition-colors hover:bg-panel"
                  >
                    <span
                      className={`block text-ui ${
                        isActive(p.href) ? "text-accent" : "text-ink"
                      }`}
                    >
                      {p.label}
                    </span>
                    <span className="mono-data block text-tag text-ink-faint">
                      {p.blurb}
                    </span>
                  </Link>
                ))}
                <a
                  href={repo}
                  target="_blank"
                  rel="noreferrer"
                  className="mono-data mt-auto px-3 pb-2 pt-3 text-tag text-ink-faint transition-colors hover:text-accent"
                >
                  Source ↗
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {open === "menu" && (
        <nav
          id="mobile-menu"
          aria-label="Primary"
          className="absolute inset-x-0 top-full max-h-[calc(100dvh-4rem)] overflow-y-auto border-b border-line bg-bg px-4 pb-4 pt-2 md:hidden"
        >
          {[...pages, ...morePages].map((p) => (
            <Link
              key={p.href}
              href={p.href}
              aria-current={isActive(p.href) ? "page" : undefined}
              className={`block rounded-sm px-3 py-2.5 text-ui transition-colors hover:bg-panel ${
                isActive(p.href) ? "text-accent" : "text-ink"
              }`}
            >
              {p.label}
            </Link>
          ))}

          <p className="label px-3 pb-1 pt-4">Layers</p>
          {layers.map((l) => (
            <LayerLink
              key={l.id}
              layer={l}
              active={pathname === `/layers/${l.id}/`}
            />
          ))}

          <a
            href={repo}
            target="_blank"
            rel="noreferrer"
            className="mt-3 block border-t border-line px-3 pb-1 pt-3 text-ui text-ink-dim transition-colors hover:text-ink"
          >
            Source ↗
          </a>
        </nav>
      )}
    </header>
  );
}
