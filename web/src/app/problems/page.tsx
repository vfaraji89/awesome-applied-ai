import type { Metadata } from "next";
import Link from "next/link";
import { problems, roadmap, problemsPlanned } from "@/data/problems";
import { layers } from "@/data/layers";
import { Reveal } from "@/components/motion";

export const metadata: Metadata = {
  title: "Design problems",
  description:
    "Staff and principal level applied AI design problems, each stated with numbers, with the constraint that decides the answer, an architecture, and the stack.",
};

const ordered = [...layers].reverse();

const numeral = Object.fromEntries(
  layers.map((l, i) => [l.id, String(layers.length - i).padStart(2, "0")]),
) as Record<string, string>;

const written = problems.length;
const pending = roadmap.filter((r) => r.first > written);

export default function ProblemsPage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-12">
      <Reveal>
        <p className="label">Design problems</p>
        <h1 className="mt-5 font-serif text-h1 font-semibold tracking-tight text-ink">
          The constraint that decides it
        </h1>
        <p className="mt-4 max-w-2xl font-serif text-lead leading-relaxed text-ink-dim">
          Each problem is stated with numbers, because the numbers are what
          separate a real answer from a diagram. Every one names the constraint
          that settles it before it names a tool, and ends with where answers
          fail.
        </p>
        <p className="mono-data mt-6 text-meta text-ink-faint">
          {written} written · {problemsPlanned} planned
        </p>
      </Reveal>

      {ordered.map((layer) => {
        const inLayer = problems.filter((p) => p.layer === layer.id);
        return (
          <section key={layer.id} className="mt-14">
            <div className="flex items-baseline justify-between gap-4 border-b border-line pb-3">
              <h2 className="flex items-baseline gap-3">
                <span className="mono-data text-tag tabular-nums text-ink-faint">
                  {numeral[layer.id]}
                </span>
                <Link
                  href={`/layers/${layer.id}/`}
                  className="font-serif text-h3 font-semibold tracking-tight text-ink underline-offset-4 hover:text-accent hover:underline"
                >
                  {layer.name}
                </Link>
              </h2>
              <span className="mono-data shrink-0 text-tag tabular-nums text-ink-faint">
                {inLayer.length}
              </span>
            </div>

            {inLayer.length === 0 ? (
              <p className="mt-4 text-meta leading-relaxed text-ink-faint">
                No worked problem yet. {layer.question}
              </p>
            ) : (
              <ul className="mt-2">
                {inLayer.map((p) => (
                  <li key={p.id} className="border-b border-line last:border-0">
                    <Link
                      href={`/problems/${p.id}/`}
                      className="group flex gap-4 py-4 transition-colors"
                    >
                      <span className="mono-data mt-1 w-6 shrink-0 text-tag tabular-nums text-ink-faint">
                        {String(p.n).padStart(2, "0")}
                      </span>
                      <span className="min-w-0">
                        <span className="block text-body font-semibold text-ink group-hover:text-accent">
                          {p.title}
                        </span>
                        <span className="mt-1 block text-meta leading-relaxed text-ink-dim">
                          {p.asked}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        );
      })}

      {pending.length > 0 && (
        <section className="mt-16 border-t border-line pt-8">
          <h2 className="label">Still to write</h2>
          <ul className="mt-5 space-y-3">
            {pending.map((r) => (
              <li key={r.range} className="flex gap-4">
                <span className="mono-data mt-0.5 w-12 shrink-0 text-tag tabular-nums text-ink-faint">
                  {r.range}
                </span>
                <span className="text-meta leading-relaxed text-ink-dim">
                  <span className="text-ink">{r.section}.</span> {r.items}.
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
