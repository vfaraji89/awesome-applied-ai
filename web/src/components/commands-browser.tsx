"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Search, X } from "lucide-react";
import { commands, toolboxes } from "@/data/commands";
import type { Command } from "@/lib/types";

const haystack = new Map(
  commands.map((c) => [
    c.id,
    `${c.cmd} ${c.what} ${c.when} ${c.tags.join(" ")} ${
      toolboxes.find((b) => b.id === c.box)?.name ?? ""
    }`.toLowerCase(),
  ]),
);

const tagCounts = Object.entries(
  commands.reduce<Record<string, number>>((acc, c) => {
    for (const t of c.tags) acc[t] = (acc[t] ?? 0) + 1;
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

function Entry({ entry }: { entry: Command }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(entry.cmd);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      setCopied(false);
    }
  }

  return (
    <li
      id={entry.id}
      className="scroll-mt-24 border-b border-line py-6 last:border-0"
    >
      <div className="group relative">
        <pre className="mono-data overflow-x-auto rounded-sm border border-line bg-panel py-2.5 pl-3 pr-12 text-tag leading-relaxed text-ink">
          <code>{entry.cmd}</code>
        </pre>
        <button
          type="button"
          onClick={copy}
          aria-label={copied ? "Copied" : "Copy command"}
          className="absolute right-2 top-2 rounded-sm border border-line bg-bg p-1.5 text-ink-faint transition-colors hover:border-line-bright hover:text-ink"
        >
          {copied ? (
            <Check className="size-3.5 text-accent" aria-hidden />
          ) : (
            <Copy className="size-3.5" aria-hidden />
          )}
        </button>
      </div>

      {entry.pick && (
        <span className="mono-data mt-3 inline-block rounded-sm bg-accent-bg px-1.5 py-0.5 text-tag text-accent">
          pick
        </span>
      )}

      <p className="mt-3 max-w-2xl text-meta leading-relaxed text-ink-dim">
        {entry.what}
      </p>
      <p className="mt-3 max-w-2xl border-l border-line pl-4 text-meta leading-relaxed text-ink">
        {entry.when}
      </p>

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

export function CommandsBrowser() {
  const [query, setQuery] = useState("");
  const [box, setBox] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [picksOnly, setPicksOnly] = useState(false);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    return commands.filter((c) => {
      if (box && c.box !== box) return false;
      if (picksOnly && !c.pick) return false;
      if (tags.length > 0 && !tags.every((t) => c.tags.includes(t)))
        return false;
      if (q && !(haystack.get(c.id) ?? "").includes(q)) return false;
      return true;
    });
  }, [query, box, tags, picksOnly]);

  const filtering =
    query.trim() !== "" || box !== null || tags.length > 0 || picksOnly;

  const groups = toolboxes
    .map((b) => ({ box: b, entries: matches.filter((c) => c.box === b.id) }))
    .filter((g) => g.entries.length > 0);

  function toggleTag(t: string) {
    setTags((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t],
    );
  }

  function reset() {
    setQuery("");
    setBox(null);
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
            placeholder={`Search ${commands.length} commands by flag, tool or task`}
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
          {toolboxes.map((b) => (
            <Chip
              key={b.id}
              on={box === b.id}
              onClick={() => setBox((v) => (v === b.id ? null : b.id))}
            >
              {b.name}
              <span className="ml-2 tabular-nums text-ink-faint">
                {commands.filter((c) => c.box === b.id).length}
              </span>
            </Chip>
          ))}
          <Chip on={picksOnly} onClick={() => setPicksOnly((v) => !v)}>
            picks
            <span className="ml-2 tabular-nums text-ink-faint">
              {commands.filter((c) => c.pick).length}
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
            {matches.length} of {commands.length}
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
        groups.map(({ box: b, entries }) => (
          <section key={b.id} id={b.id} className="mt-14 scroll-mt-24">
            <div className="flex items-baseline justify-between gap-4 border-b border-line pb-3">
              <h2 className="font-serif text-h3 font-semibold tracking-tight text-ink">
                {b.name}
              </h2>
              <span className="mono-data shrink-0 text-tag tabular-nums text-ink-faint">
                {entries.length}
              </span>
            </div>
            {!filtering && (
              <p className="mt-4 max-w-2xl text-meta leading-relaxed text-ink-dim">
                <span className="text-ink">{b.tagline}.</span> {b.intro}
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
