import type { Tool } from "@/lib/types";
import { layerById } from "@/data/layers";
import { Glyph } from "@/lib/glyphs";
import {
  layerInk,
  maturityLabel,
  modelLabel,
  statusLabel,
  statusTone,
} from "@/lib/style";

export function ToolRow({
  tool,
  n,
  showLayer,
  onTag,
  activeTags,
}: {
  tool: Tool;
  n: number;
  showLayer?: boolean;
  onTag?: (tag: string) => void;
  activeTags?: string[];
}) {
  const color = layerInk[tool.layer];

  return (
    <div className="group relative grid grid-cols-[2.5rem_minmax(0,1fr)] gap-x-4 border-t border-line py-6 pl-5 pr-2 md:grid-cols-[2.5rem_minmax(0,1fr)_11rem] md:gap-x-8">
      <span
        aria-hidden
        className="absolute inset-y-0 left-0 w-px transition-[width] duration-200 group-hover:w-[3px]"
        style={{ background: color }}
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-linear-to-r from-panel to-45% to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100"
      />

      <div className="relative flex flex-col items-center gap-2">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-line bg-panel text-ink-dim transition-colors duration-200 group-hover:border-line-bright group-hover:text-ink">
          <Glyph name={tool.category} className="size-[18px]" />
        </span>
        <span className="mono-data text-tag tabular-nums text-ink-faint">
          {String(n).padStart(2, "0")}
        </span>
      </div>

      <div className="relative min-w-0">
        <h3 className="text-body font-semibold leading-snug tracking-tight text-ink transition-colors group-hover:text-accent">
          <a
            href={tool.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-baseline gap-2 outline-none after:absolute after:inset-0 after:content-['']"
          >
            <span className="transition-transform duration-200 group-hover:translate-x-0.5">
              {tool.name}
            </span>
            <span
              aria-hidden
              className="mono-data text-meta text-accent opacity-0 transition-opacity duration-200 group-hover:opacity-100"
            >
              ↗
            </span>
          </a>
        </h3>

        <p className="mt-2 max-w-prose text-ui leading-relaxed text-ink-dim">
          {tool.summary}
        </p>

        {tool.note && (
          <p className="mt-3 max-w-prose border-l-2 border-line pl-3.5 text-ui leading-relaxed text-ink-faint">
            {tool.note}
          </p>
        )}

        {tool.tags.length > 0 && (
          <div className="relative z-10 mt-3.5 flex flex-wrap gap-1.5">
            {tool.tags.map((tag) => {
              const on = activeTags?.includes(tag) ?? false;
              return onTag ? (
                <button
                  key={tag}
                  type="button"
                  onClick={() => onTag(tag)}
                  className={`mono-data rounded-sm border px-1.5 py-0.5 text-tag leading-4 transition-colors ${
                    on
                      ? "border-accent bg-accent-bg text-accent"
                      : "border-line text-ink-faint hover:border-line-bright hover:text-ink-dim"
                  }`}
                >
                  {tag}
                </button>
              ) : (
                <span
                  key={tag}
                  className="mono-data rounded-sm border border-line px-1.5 py-0.5 text-tag leading-4 text-ink-faint"
                >
                  {tag}
                </span>
              );
            })}
          </div>
        )}

        <div className="mono-data mt-3.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-tag text-ink-faint md:hidden">
          <Meta tool={tool} showLayer={showLayer} />
        </div>
      </div>

      <div className="mono-data relative hidden flex-col items-end gap-1.5 pt-1.5 text-right text-tag leading-relaxed text-ink-faint md:flex">
        <Meta tool={tool} showLayer={showLayer} />
      </div>
    </div>
  );
}

function Meta({ tool, showLayer }: { tool: Tool; showLayer?: boolean }) {
  const color = layerInk[tool.layer];

  return (
    <>
      {tool.status && tool.status !== "active" && (
        <span className={`uppercase tracking-wide ${statusTone[tool.status]}`}>
          {statusLabel[tool.status]}
        </span>
      )}
      {showLayer && (
        <span className="flex items-center gap-1.5 text-ink-dim">
          <span
            aria-hidden
            className="size-1.5 rounded-full"
            style={{ background: color }}
          />
          {layerById[tool.layer].name.split(" ")[0].replace("&", "")}
        </span>
      )}
      <span>{tool.license}</span>
      <span>{modelLabel[tool.model]}</span>
      {tool.maturity && <span>{maturityLabel[tool.maturity]}</span>}
      {tool.deployment && <span>{tool.deployment}</span>}
    </>
  );
}
