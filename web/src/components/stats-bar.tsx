import { layers } from "@/data/layers";
import { tools } from "@/data/tools";
import { maturityLabel, modelLabel, ramp } from "@/lib/style";
import type { Maturity, SourceModel } from "@/lib/types";

type Segment = { id: string; label: string; count: number; color: string };

function share(list: Segment[], match: (s: Segment) => boolean) {
  const total = list.reduce((n, s) => n + s.count, 0);
  const hit = list.filter(match).reduce((n, s) => n + s.count, 0);
  return total ? Math.round((hit / total) * 100) : 0;
}

const byLayer: Segment[] = layers.map((l, i) => ({
  id: l.id,
  label: l.name.split(" ")[0].replace("&", ""),
  count: tools.filter((t) => t.layer === l.id).length,
  color: ramp[i],
}));

const byModel: Segment[] = (
  ["oss", "hybrid", "source-available", "commercial"] as SourceModel[]
).map((m, i) => ({
  id: m,
  label: modelLabel[m],
  count: tools.filter((t) => t.model === m).length,
  color: ramp[i],
}));

const byMaturity: Segment[] = (
  ["production-common", "production-viable", "early", "research", "fragile"] as Maturity[]
).map((m, i) => ({
  id: m,
  label: maturityLabel[m],
  count: tools.filter((t) => t.maturity === m).length,
  color: ramp[i],
}));

const byStatus: Segment[] = (
  ["active", "slowing", "stalled", "deprecated"] as const
).map((s, i) => ({
  id: s,
  label: s,
  count: tools.filter((t) => (t.status ?? "active") === s).length,
  color: ramp[i],
}));

const stats = [
  {
    value: String(tools.length),
    caption: "indexed entries",
    note: `${byLayer.length} layers`,
    segments: byLayer,
  },
  {
    value: `${share(byModel, (s) => s.id === "oss" || s.id === "hybrid")}%`,
    caption: "open or hybrid licence",
    note: `${byModel[3].count} closed`,
    segments: byModel,
  },
  {
    value: `${share(byMaturity, (s) => s.id.startsWith("production"))}%`,
    caption: "production-grade",
    note: `${byMaturity[4].count} fragile`,
    segments: byMaturity,
  },
  {
    value: String(tools.filter((t) => (t.status ?? "active") !== "active").length),
    caption: "slowing or stalled",
    note: "verify before adopting",
    segments: byStatus,
  },
];

export function StatsBar() {
  return (
    <div className="grid grid-cols-1 border-y border-line min-[480px]:grid-cols-2 lg:grid-cols-4">
      {stats.map((s, i) => (
        <div
          key={s.caption}
          className={`px-5 py-6 ${i > 0 ? "border-t border-line min-[480px]:border-t-0" : ""} ${
            i % 2 === 1 ? "min-[480px]:border-l min-[480px]:border-line" : ""
          } ${i > 1 ? "min-[480px]:border-t min-[480px]:border-line lg:border-t-0" : ""} ${
            i === 2 ? "lg:border-l" : ""
          }`}
        >
          <div className="mono-data text-h2 leading-none tabular-nums tracking-tight text-ink">
            {s.value}
          </div>
          <div className="mt-2.5 text-meta text-ink-dim">{s.caption}</div>

          <div className="mt-4 flex h-1 w-full overflow-hidden rounded-full bg-line">
            {s.segments
              .filter((seg) => seg.count > 0)
              .map((seg) => (
                <span
                  key={seg.id}
                  className="h-full"
                  style={{ flex: seg.count, background: seg.color }}
                />
              ))}
          </div>

          <ul className="mono-data mt-3 flex flex-wrap gap-x-3 gap-y-1 text-tag text-ink-faint">
            {s.segments
              .filter((seg) => seg.count > 0)
              .map((seg) => (
                <li key={seg.id} className="flex items-center gap-1.5">
                  <span
                    aria-hidden
                    className="size-1.5 shrink-0 rounded-full"
                    style={{ background: seg.color }}
                  />
                  <span>{seg.label}</span>
                  <span className="tabular-nums text-ink-dim">{seg.count}</span>
                </li>
              ))}
          </ul>

          <div className="label mt-3">{s.note}</div>
        </div>
      ))}
    </div>
  );
}
