"use client";

import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { fields, terms } from "@/data/dictionary";
import type { Term } from "@/lib/types";

const haystack = new Map(
  terms.map((t) => [
    t.id,
    `${t.term} ${(t.also ?? []).join(" ")} ${t.short} ${t.detail} ${
      t.asked ?? ""
    } ${t.tags.join(" ")} ${fields.find((f) => f.id === t.field)?.name ?? ""}`.toLowerCase(),
  ]),
);

const tagCounts = Object.entries(
  terms.reduce<Record<string, number>>((acc, t) => {
    for (const tag of t.tags) acc[tag] = (acc[tag] ?? 0) + 1;
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

function Entry({ entry }: { entry: Term }) {
  return (
    <li
      id={entry.id}
      className="scroll-mt-24 border-b border-line py-6 last:border-0"
    >
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h3 className="text-body font-semibold text-ink">{entry.term}</h3>
        {entry.also && entry.also.length > 0 && (
          <span className="mono-data text-tag text-ink-faint">
            {entry.also.join(" · ")}
          </span>
        )}
      </div>

      <p className="mt-2 max-w-2xl text-meta leading-relaxed text-ink-dim">
        {entry.short}
      </p>
      <p className="mt-3 max-w-2xl border-l border-line pl-4 text-meta leading-relaxed text-ink">
        {entry.detail}
      </p>

      {entry.asked && (
        <p className="mono-data mt-3 max-w-2xl text-tag leading-relaxed text-ink-faint">
          asked as: {entry.asked}
        </p>
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

export function DictionaryBrowser() {
  const [query, setQuery] = useState("");
  const [field, setField] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    return terms.filter((t) => {
      if (field && t.field !== field) return false;
      if (tags.length > 0 && !tags.every((tag) => t.tags.includes(tag)))
        return false;
      if (q && !(haystack.get(t.id) ?? "").includes(q)) return false;
      return true;
    });
  }, [query, field, tags]);

  const filtering = query.trim() !== "" || field !== null || tags.length > 0;

  const groups = fields
    .map((f) => ({ field: f, entries: matches.filter((t) => t.field === f.id) }))
    .filter((g) => g.entries.length > 0);

  function toggleTag(t: string) {
    setTags((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t],
    );
  }

  function reset() {
    setQuery("");
    setField(null);
    setTags([]);
  }

  return (
    <div>
      <div className="sticky top-[4.25rem] z-20 -mx-6 border-y border-line bg-bg/90 px-6 py-4 glass">
        <label className="flex items-center gap-3 rounded-lg border border-line bg-panel px-4 py-2.5 focus-within:border-line-bright">
          <Search className="size-4 shrink-0 text-ink-faint" aria-hidden />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search ${terms.length} terms by name, definition or acronym`}
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
          {fields.map((f) => (
            <Chip
              key={f.id}
              on={field === f.id}
              onClick={() => setField((v) => (v === f.id ? null : f.id))}
            >
              {f.name}
              <span className="ml-2 tabular-nums text-ink-faint">
                {terms.filter((t) => t.field === f.id).length}
              </span>
            </Chip>
          ))}
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
            {matches.length} of {terms.length}
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
        groups.map(({ field: f, entries }) => (
          <section key={f.id} id={f.id} className="mt-14 scroll-mt-24">
            <div className="flex items-baseline justify-between gap-4 border-b border-line pb-3">
              <h2 className="font-serif text-h3 font-semibold tracking-tight text-ink">
                {f.name}
              </h2>
              <span className="mono-data shrink-0 text-tag tabular-nums text-ink-faint">
                {entries.length}
              </span>
            </div>
            {!filtering && (
              <p className="mt-4 max-w-2xl text-meta leading-relaxed text-ink-dim">
                <span className="text-ink">{f.tagline}.</span> {f.intro}
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
