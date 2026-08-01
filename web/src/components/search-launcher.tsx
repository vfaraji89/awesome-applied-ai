"use client";

import { Search } from "lucide-react";
import { PALETTE_OPEN } from "@/components/command-palette";

function openPalette(seed?: string) {
  window.dispatchEvent(new CustomEvent(PALETTE_OPEN, { detail: seed }));
}

export function SearchLauncher({
  placeholder,
  seeds = [],
}: {
  placeholder: string;
  seeds?: string[];
}) {
  return (
    <div>
      <button
        type="button"
        onClick={() => openPalette()}
        className="group flex w-full items-center gap-3 rounded-lg border border-line bg-panel px-4 py-3.5 text-left transition-colors hover:border-line-bright"
      >
        <Search
          className="size-4 shrink-0 text-ink-faint transition-colors group-hover:text-accent"
          aria-hidden
        />
        <span className="min-w-0 flex-1 truncate text-ui text-ink-dim">
          {placeholder}
        </span>
        <kbd className="mono-data hidden shrink-0 rounded-sm border border-line px-1.5 py-0.5 text-tag text-ink-faint sm:block">
          ⌘K
        </kbd>
      </button>

      {seeds.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <span className="mono-data mr-1 text-tag text-ink-faint">Try</span>
          {seeds.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => openPalette(s)}
              className="mono-data rounded-sm border border-line px-2 py-1 text-tag text-ink-dim transition-colors hover:border-accent hover:text-accent"
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
