import Link from "next/link";
import { geometry, nomograms } from "@/lib/nomograms";

const H = 96;
const W = 120;

export function NomogramTeaser() {
  const n = nomograms[0];
  const g = geometry(n, H);
  const [u, v] = n.defaults;
  const w = g.solve(u, v);
  const x1 = g.tx * W;
  const yU = g.yLeft(u);
  const yV = g.yRight(v);
  const yW = g.yMiddle(w);

  return (
    <Link
      href="/nomogram/"
      className="group flex flex-col gap-6 rounded-lg border border-line bg-panel p-5 transition-colors hover:border-line-bright sm:flex-row sm:items-center"
    >
      <svg
        aria-hidden
        width={W}
        height={H}
        viewBox={`-0.5 0 ${W + 1} ${H}`}
        className="shrink-0"
      >
        {[0, x1, W].map((x) => (
          <line key={x} x1={x} y1={0} x2={x} y2={H} stroke="var(--line-bright)" />
        ))}
        {n.left.ticks.map((t) => (
          <line
            key={`l${t}`}
            x1={0}
            y1={g.yLeft(t)}
            x2={4}
            y2={g.yLeft(t)}
            stroke="var(--line)"
          />
        ))}
        {n.right.ticks.map((t) => (
          <line
            key={`r${t}`}
            x1={W - 4}
            y1={g.yRight(t)}
            x2={W}
            y2={g.yRight(t)}
            stroke="var(--line)"
          />
        ))}
        <line x1={0} y1={yU} x2={W} y2={yV} stroke="var(--accent)" />
        <path
          d={`M ${x1} ${yW - 4} L ${x1 + 4} ${yW} L ${x1} ${yW + 4} L ${x1 - 4} ${yW} Z`}
          fill="var(--accent)"
        />
      </svg>

      <div>
        <h3 className="font-serif text-h3 font-semibold tracking-tight text-ink">
          The nomogram
        </h3>
        <p className="mt-2 max-w-md text-meta leading-relaxed text-ink-dim">
          Six governing relations, one per layer, on an alignment chart. Drag two
          scales and the third reads out the answer — index size against
          dimensions against resident memory, step count against per-step
          reliability against whether the run finishes at all.
        </p>
        <span className="mono-data mt-3 inline-block text-tag text-ink-faint transition-colors group-hover:text-accent">
          Open the instrument →
        </span>
      </div>
    </Link>
  );
}
