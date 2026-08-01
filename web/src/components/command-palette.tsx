"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  Boxes,
  BookMarked,
  ChevronRight,
  Globe,
  Hammer,
  Hash,
  Layers,
  LayoutGrid,
  Rocket,
  Sigma,
  Terminal,
  Waypoints,
  type LucideIcon,
} from "lucide-react";
import { Glyph } from "@/lib/glyphs";
import { kindLabel, search, type Hit, type HitKind } from "@/lib/search";

const ease = [0.22, 1, 0.36, 1] as const;

const kindGlyph: Record<HitKind, LucideIcon> = {
  stage: Waypoints,
  build: Hammer,
  shipped: Rocket,
  domain: Globe,
  layer: Layers,
  problem: Sigma,
  term: BookMarked,
  command: ChevronRight,
  kit: Terminal,
  category: LayoutGrid,
  topic: Hash,
  tool: Boxes,
};

export const PALETTE_OPEN = "palette:open";

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const reduced = useReducedMotion();

  const hits = useMemo(() => search(query), [query]);

  useEffect(() => setCursor(0), [query]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
        return;
      }
      if (e.key === "/" && !open) {
        const el = e.target as HTMLElement;
        if (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable)
          return;
        e.preventDefault();
        setOpen(true);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    const onOpen = (e: Event) => {
      const seed = (e as CustomEvent<string | undefined>).detail;
      setOpen(true);
      if (seed) setQuery(seed);
    };
    window.addEventListener(PALETTE_OPEN, onOpen);
    return () => window.removeEventListener(PALETTE_OPEN, onOpen);
  }, []);

  useEffect(() => {
    if (!open) {
      setQuery("");
      return;
    }
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const go = useCallback(
    (hit: Hit) => {
      setOpen(false);
      if (hit.external) window.open(hit.href, "_blank", "noreferrer");
      else router.push(hit.href);
    },
    [router],
  );

  function onInputKey(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      setOpen(false);
      return;
    }
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      setCursor((c) => {
        const next = e.key === "ArrowDown" ? c + 1 : c - 1;
        const bounded = (next + hits.length) % Math.max(hits.length, 1);
        listRef.current
          ?.querySelector(`[data-i="${bounded}"]`)
          ?.scrollIntoView({ block: "nearest" });
        return bounded;
      });
      return;
    }
    if (e.key === "Enter" && hits[cursor]) {
      e.preventDefault();
      go(hits[cursor]);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-sm border border-line bg-panel px-3 py-1.5 text-meta text-ink-faint transition-colors hover:border-line-bright hover:text-ink-dim"
      >
        <Glyph name="hybrid-search" className="size-3.5" />
        <span className="hidden sm:max-md:inline lg:inline">Find anything</span>
        <kbd className="mono-data hidden rounded-sm border border-line px-1 text-tag sm:inline">
          ⌘K
        </kbd>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 flex items-start justify-center sm:px-4 sm:pt-[12vh]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16 }}
          >
            <div
              className="absolute inset-0 bg-[rgba(0,0,0,0.4)] backdrop-blur-[3px]"
              onClick={() => setOpen(false)}
            />

            <motion.div
              role="dialog"
              aria-modal
              aria-label="Find anything"
              className="relative flex h-full w-full max-w-2xl flex-col overflow-hidden border border-line-bright bg-bg sm:h-auto sm:rounded-lg"
              initial={reduced ? false : { opacity: 0, y: -12, scale: 0.985 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reduced ? undefined : { opacity: 0, y: -8, scale: 0.99 }}
              transition={{ duration: 0.22, ease }}
            >
              <div className="flex shrink-0 items-center gap-3 border-b border-line px-5">
                <Glyph name="hybrid-search" className="size-4 shrink-0 text-ink-faint" />
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={onInputKey}
                  placeholder="Layers, categories, topics, entries…"
                  className="w-full bg-transparent py-4 text-body text-ink outline-none placeholder:text-ink-faint"
                />
                <kbd className="mono-data shrink-0 rounded-sm border border-line px-1.5 py-0.5 text-tag text-ink-faint">
                  esc
                </kbd>
              </div>

              <div
                ref={listRef}
                className="flex-1 overflow-y-auto p-2 sm:max-h-[52vh] sm:flex-none"
              >
                {hits.length === 0 ? (
                  <p className="px-3 py-8 text-center text-ui text-ink-faint">
                    Nothing for “{query}”.
                  </p>
                ) : (
                  hits.map((hit, i) => {
                    const first = i === 0 || hits[i - 1].kind !== hit.kind;
                    const KindIcon = kindGlyph[hit.kind];
                    return (
                      <div key={hit.id}>
                        {first && (
                          <div className="label px-3 pb-1.5 pt-3">{kindLabel[hit.kind]}</div>
                        )}
                        <button
                          type="button"
                          data-i={i}
                          onMouseMove={() => setCursor(i)}
                          onClick={() => go(hit)}
                          className={`flex w-full items-center gap-3 rounded-sm px-3 py-2.5 text-left transition-colors ${
                            i === cursor ? "bg-panel-2" : ""
                          }`}
                        >
                          <span
                            className={`flex size-7 shrink-0 items-center justify-center rounded-sm border border-line bg-panel ${
                              i === cursor ? "text-accent" : "text-ink-dim"
                            }`}
                          >
                            <KindIcon
                              aria-hidden
                              strokeWidth={1.5}
                              className="size-3.5"
                            />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-ui font-medium text-ink">
                              {hit.label}
                            </span>
                            <span className="block truncate text-meta text-ink-faint">
                              {hit.detail}
                            </span>
                          </span>
                          {hit.external ? (
                            <span className="mono-data shrink-0 text-tag text-ink-faint">
                              ↗
                            </span>
                          ) : (
                            hit.count !== undefined && (
                              <span className="mono-data shrink-0 text-tag tabular-nums text-ink-faint">
                                {hit.count}
                              </span>
                            )
                          )}
                        </button>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="mono-data flex shrink-0 items-center gap-4 border-t border-line px-5 py-2.5 text-tag text-ink-faint">
                <span>↑↓ move</span>
                <span>↵ open</span>
                <span className="ml-auto">{hits.length} results</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
