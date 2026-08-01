"use client";

import { useMemo, useState } from "react";
import { ArrowUpRight, Search, X } from "lucide-react";
import { kit, shelves } from "@/data/kit";
import type { KitEntry } from "@/lib/types";

const haystack = new Map(
  kit.map((k) => [
    k.id,
    `${k.name} ${k.summary} ${k.reach} ${k.install ?? ""} ${k.tags.join(" ")} ${
      shelves.find((s) => s.id === k.shelf)?.name ?? ""
    }`.toLowerCase(),
  ]),
);

const tagCounts = Object.entries(
  kit.reduce<Record<string, number>>((acc, k) => {
    for (const t of k.tags) acc[t] = (acc[t] ?? 0) + 1;
    return acc;
  }, {}),
)
  .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
  .slice(0, 14);

function Chip({
  on,
  onClick,
  children,
}: {
  on: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className={`mono-data rounded-sm border px-2.5 py-1 text-tag transition-colors ${
        on
          ? "border-accent bg-accent-bg text-accent"
          : "border-line text-ink-dim hover:border-line-bright hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}

function Entry({ entry }: { entry: KitEntry }) {
  return (
    <li
      id={entry.id}
      className="scroll-mt-24 border-b border-line py-6 last:border-0"
    >
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <a
          href={entry.url}
          target="_blank"
          rel="noreferrer"
          className="group inline-flex items-baseline gap-1 text-body font-semibold text-ink hover:text-accent"
        >
          {entry.name}
          <ArrowUpRight
            className="size-3.5 shrink-0 self-center text-ink-faint transition-colors group-hover:text-accent"
            aria-hidden
          />
        </a>
        {entry.pick && (
          <span className="mono-data rounded-sm bg-accent-bg px-1.5 py-0.5 text-tag text-accent">
            pick
          </span>
        )}
      </div>

      <p className="mt-2 max-w-2xl text-meta leading-relaxed text-ink-dim">
        {entry.summary}
      </p>
      <p className="mt-3 max-w-2xl border-l border-line pl-4 text-meta leading-relaxed text-ink">
        {entry.reach}
      </p>

      {entry.install && (
        <pre className="mono-data mt-3 overflow-x-auto rounded-sm bg-panel px-3 py-2 text-tag text-ink-dim">
          <code>{entry.install}</code>
        </pre>
      )}

      <ul className="mt-3 flex flex-wrap gap-1.5">
        {entry.tags.map((t) => (
          <li
            key={t}
            className="mono-data rounded-sm border border-line px-1.5 py-0.5 text-tag text-ink-faint"
          >
            {t}
          </li>
        ))}
      </ul>
    </li>
  );
}

export function KitBrowser() {
  const [query, setQuery] = useState("");
  const [shelf, setShelf] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [picksOnly, setPicksOnly] = useState(false);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    return kit.filter((k) => {
      if (shelf && k.shelf !== shelf) return false;
      if (picksOnly && !k.pick) return false;
      if (tags.length > 0 && !tags.every((t) => k.tags.includes(t)))
        return false;
      if (q && !(haystack.get(k.id) ?? "").includes(q)) return false;
      return true;
    });
  }, [query, shelf, tags, picksOnly]);

  const filtering =
    query.trim() !== "" || shelf !== null || tags.length > 0 || picksOnly;

  const groups = shelves
    .map((s) => ({ shelf: s, entries: matches.filter((k) => k.shelf === s.id) }))
    .filter((g) => g.entries.length > 0);

  function toggleTag(t: string) {
    setTags((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t],
    );
  }

  function reset() {
    setQuery("");
    setShelf(null);
    setTags([]);
    setPicksOnly(false);
  }

  return (
    <div>
      <div className="sticky top-[4.25rem] z-20 -mx-6 border-y border-line bg-bg/90 px-6 py-4 glass">
        <label className="flex items-center gap-3 rounded-lg border border-line bg-panel px-4 py-2.5 focus-within:border-line-bright">
          <Search className="size-4 shrink-0 text-ink-faint" aria-hidden />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search ${kit.length} entries by name, use or tag`}
            className="w-full bg-transparent text-ui text-ink outline-none placeholder:text-ink-faint"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="shrink-0 text-ink-faint transition-colors hover:text-ink"
            >
              <X className="size-4" aria-hidden />
            </button>
          )}
        </label>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {shelves.map((s) => (
            <Chip
              key={s.id}
              on={shelf === s.id}
              onClick={() => setShelf((v) => (v === s.id ? null : s.id))}
            >
              {s.name}
              <span className="ml-2 tabular-nums text-ink-faint">
                {kit.filter((k) => k.shelf === s.id).length}
              </span>
            </Chip>
          ))}
          <Chip on={picksOnly} onClick={() => setPicksOnly((v) => !v)}>
            picks
            <span className="ml-2 tabular-nums text-ink-faint">
              {kit.filter((k) => k.pick).length}
            </span>
          </Chip>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          {tagCounts.map(([t, n]) => (
            <Chip key={t} on={tags.includes(t)} onClick={() => toggleTag(t)}>
              {t}
              <span className="ml-2 tabular-nums text-ink-faint">{n}</span>
            </Chip>
          ))}
        </div>

        <div className="mono-data mt-3 flex items-baseline gap-4 text-tag text-ink-faint">
          <span aria-live="polite">
            {matches.length} of {kit.length}
          </span>
          {filtering && (
            <button
              type="button"
              onClick={reset}
              className="underline-offset-4 transition-colors hover:text-accent hover:underline"
            >
              clear filters
            </button>
          )}
        </div>
      </div>

      {groups.length === 0 ? (
        <p className="py-20 text-center text-ui text-ink-faint">
          Nothing matches. Try one filter fewer.
        </p>
      ) : (
        groups.map(({ shelf: s, entries }) => (
          <section key={s.id} id={s.id} className="mt-14 scroll-mt-24">
            <div className="flex items-baseline justify-between gap-4 border-b border-line pb-3">
              <h2 className="font-serif text-h3 font-semibold tracking-tight text-ink">
                {s.name}
              </h2>
              <span className="mono-data shrink-0 text-tag tabular-nums text-ink-faint">
                {entries.length}
              </span>
            </div>
            {!filtering && (
              <p className="mt-4 max-w-2xl text-meta leading-relaxed text-ink-dim">
                <span className="text-ink">{s.tagline}.</span> {s.intro}
              </p>
            )}

            <ul className="mt-6">
              {entries.map((entry) => (
                <Entry key={entry.id} entry={entry} />
              ))}
            </ul>
          </section>
        ))
      )}
    </div>
  );
}
