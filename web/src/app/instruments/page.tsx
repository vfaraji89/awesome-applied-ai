import type { Metadata } from "next";
import Link from "next/link";
import { NomogramTeaser } from "@/components/nomogram-teaser";
import { instruments } from "@/lib/instruments";

export const metadata: Metadata = {
  title: "Instruments",
  description:
    "Working charts for the arithmetic behind an applied AI stack: the nomogram, the context window, and cache economics.",
};

export default function InstrumentsPage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-12">
      <p className="label">Instruments</p>
      <h1 className="mt-5 font-serif text-h1 font-semibold tracking-tight text-ink">
        Read the answer off the chart
      </h1>
      <p className="mt-4 max-w-2xl font-serif text-lead leading-relaxed text-ink-dim">
        Most of what is written about applied AI is a list of things you could
        use. Very little of it tells you what any of them costs. These are the
        working parts of this site: charts you can move, each holding one
        relation that decides whether an architecture is affordable.
      </p>

      <div className="mt-10 grid gap-3 sm:grid-cols-2">
        {instruments.map((n) => (
          <Link
            key={n.id}
            href={n.href}
            className="group rounded-lg border border-line bg-panel p-5 transition-colors hover:border-line-bright"
          >
            <h2 className="font-serif text-h3 font-semibold tracking-tight text-ink group-hover:text-accent">
              {n.name}
            </h2>
            <p className="mt-2 text-body leading-relaxed text-ink-dim">
              {n.lede}
            </p>
            <p className="mono-data mt-4 text-tag text-ink-faint">{n.does}</p>
          </Link>
        ))}
      </div>

      <div className="mt-12">
        <NomogramTeaser />
      </div>

      <p className="mt-12 border-t border-line pt-6 text-meta text-ink-faint">
        Every number here is illustrative — the shapes are the claim, not the
        digits. Where a curve is a reading of published results rather than a
        measurement, the instrument says so.{" "}
        <Link
          href="/tools/"
          className="text-ink-dim underline-offset-4 hover:text-accent hover:underline"
        >
          The index
        </Link>{" "}
        is where the tools themselves live.
      </p>
    </div>
  );
}
