import type { Metadata } from "next";
import Link from "next/link";
import { stages } from "@/data/cycle";
import { shipped } from "@/data/shipped";
import { Reveal } from "@/components/motion";

export const metadata: Metadata = {
  title: "Shipped",
  description:
    "Applied AI systems designed and put into production, with the numbers they were judged on and the cycle stages each one exercised.",
};

const stageN = new Map(stages.map((s) => [s.id, s.n]));
const stageName = new Map(stages.map((s) => [s.id, s.name]));

export default function ShippedPage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-12">
      <Reveal>
        <p className="label">Shipped</p>
        <h1 className="mt-5 font-serif text-h1 font-semibold tracking-tight text-ink">
          Systems, and what they were judged on
        </h1>
        <p className="mt-4 max-w-2xl font-serif text-lead leading-relaxed text-ink-dim">
          Work I designed and put into production. Client names are withheld.
          The architecture, the constraints and the measurements are as built,
          and each one is tagged with the cycle stages it actually exercised.
        </p>
        <p className="mono-data mt-6 text-meta text-ink-faint">
          {shipped.length} systems
        </p>
      </Reveal>

      <div className="mt-10 border-t border-line">
        {shipped.map((s) => (
          <article
            key={s.id}
            id={s.id}
            className="grid scroll-mt-24 gap-5 border-b border-line py-10 md:grid-cols-[1fr_15rem] md:gap-10"
          >
            <div>
              <div className="mono-data flex flex-wrap items-baseline gap-x-3 text-tag text-ink-faint">
                <span>{s.year}</span>
                <span>{s.sector}</span>
              </div>
              <h2 className="mt-3 max-w-xl font-serif text-h2 font-semibold leading-tight tracking-tight text-ink">
                {s.name}
              </h2>
              <p className="mt-5 max-w-2xl text-meta leading-relaxed text-ink-dim">
                <span className="label mr-2">Problem</span>
                {s.problem}
              </p>
              <p className="mt-3 max-w-2xl text-meta leading-relaxed text-ink">
                <span className="label mr-2">Approach</span>
                {s.approach}
              </p>
              <ul className="mt-6 flex flex-wrap gap-1.5">
                {s.stages.map((id) => (
                  <li key={id}>
                    <Link
                      href={`/cycle/#${id}`}
                      className="mono-data rounded-sm bg-panel px-2 py-1 text-tag text-ink-dim transition-colors hover:text-accent"
                    >
                      {stageN.get(id)} {stageName.get(id) ?? id}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <dl className="divide-y divide-line border-y border-line">
                {s.numbers.map((m) => (
                  <div
                    key={m.label}
                    className="flex items-baseline justify-between gap-4 py-2"
                  >
                    <dt className="text-meta text-ink-dim">{m.label}</dt>
                    <dd className="mono-data shrink-0 text-meta tabular-nums text-ink">
                      {m.value}
                    </dd>
                  </div>
                ))}
              </dl>
              <ul className="mono-data mt-4 flex flex-wrap gap-1.5 text-tag text-ink-faint">
                {s.stack.map((t) => (
                  <li
                    key={t}
                    className="rounded-sm border border-line px-1.5 py-0.5"
                  >
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
