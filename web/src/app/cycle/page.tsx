import type { Metadata } from "next";
import Link from "next/link";
import { builds, stages } from "@/data/cycle";
import { layers } from "@/data/layers";
import { problems } from "@/data/problems";
import { Reveal } from "@/components/motion";

export const metadata: Metadata = {
  title: "The cycle",
  description:
    "The eight stages an enterprise applied AI system passes through, what each one makes you compute, and where each one goes wrong.",
};

const layerNumeral = Object.fromEntries(
  layers.map((l, i) => [l.id, String(layers.length - i).padStart(2, "0")]),
) as Record<string, string>;

const layerName = Object.fromEntries(
  layers.map((l) => [l.id, l.name]),
) as Record<string, string>;

const problemTitle = new Map(problems.map((p) => [p.id, p.title]));

const buildsByStage = stages
  .map((s) => ({ stage: s, items: builds.filter((b) => b.stage === s.id) }))
  .filter((g) => g.items.length > 0);

export default function CyclePage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-12">
      <Reveal>
        <p className="label">The cycle</p>
        <h1 className="mt-5 font-serif text-h1 font-semibold tracking-tight text-ink">
          Eight stages, in order
        </h1>
        <p className="mt-4 max-w-2xl font-serif text-lead leading-relaxed text-ink-dim">
          What an enterprise system passes through between someone asking for it
          and someone signing off on it. It is a cycle rather than a pipeline
          because stage 08 sends you back to stage 01 with better information
          than you started with. Most systems that fail in production skipped a
          stage rather than executing one badly.
        </p>
        <p className="mono-data mt-6 text-meta text-ink-faint">
          {stages.length} stages · {builds.length} projects to build them
          yourself
        </p>
      </Reveal>

      <Reveal delay={0.06}>
        <nav className="mt-8 flex flex-wrap gap-2 border-y border-line py-4">
          {stages.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="rounded-sm border border-line px-2.5 py-1 text-tag text-ink-dim transition-colors hover:border-accent hover:text-accent"
            >
              <span className="mono-data mr-1.5 tabular-nums text-ink-faint">
                {s.n}
              </span>
              {s.name}
            </a>
          ))}
        </nav>
      </Reveal>

      <ol className="mt-4">
        {stages.map((s) => (
          <li
            key={s.id}
            id={s.id}
            className="scroll-mt-24 border-b border-line py-10"
          >
            <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
              <span className="mono-data text-tag tabular-nums text-ink-faint">
                {s.n}
              </span>
              <h2 className="font-serif text-h2 font-semibold tracking-tight text-ink">
                {s.name}
              </h2>
              {s.layer && (
                <Link
                  href={`/layers/${s.layer}/`}
                  className="mono-data text-tag text-ink-faint underline-offset-4 hover:text-accent hover:underline"
                >
                  {layerNumeral[s.layer]} {layerName[s.layer]}
                </Link>
              )}
            </div>

            <p className="mt-4 max-w-2xl font-serif text-lead leading-relaxed text-ink">
              {s.question}
            </p>

            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <div>
                <p className="label">What you compute</p>
                <p className="mt-2 text-meta leading-relaxed text-ink-dim">
                  {s.decides}
                </p>
              </div>
              <div>
                <p className="label">Where it goes wrong</p>
                <p className="mt-2 border-l border-line pl-4 text-meta leading-relaxed text-ink-dim">
                  {s.trap}
                </p>
              </div>
            </div>

            {s.problems.length > 0 && (
              <ul className="mt-6 flex flex-wrap gap-1.5">
                {s.problems.map((id) => (
                  <li key={id}>
                    <Link
                      href={`/problems/${id}/`}
                      className="mono-data rounded-sm border border-line px-2 py-1 text-tag text-ink-dim transition-colors hover:border-accent hover:text-accent"
                    >
                      {problemTitle.get(id) ?? id}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ol>

      <section id="build" className="scroll-mt-24 pt-16">
        <Reveal>
          <p className="label">Build it yourself</p>
          <h2 className="mt-4 font-serif text-h2 font-semibold tracking-tight text-ink">
            {builds.length} projects, one stage at a time
          </h2>
          <p className="mt-4 max-w-2xl text-body leading-relaxed text-ink-dim">
            None of these need a company, a budget or a cluster. Each one exists
            to produce a single number you measured on your own data, because
            that is the difference between having read about a stage and having
            done it.
          </p>
        </Reveal>

        <div className="mt-8 border-t border-line">
          {buildsByStage.map(({ stage, items }) => (
            <div
              key={stage.id}
              className="grid gap-4 border-b border-line py-6 md:grid-cols-[10rem_1fr] md:gap-8"
            >
              <h3 className="flex items-baseline gap-3">
                <span className="mono-data text-tag tabular-nums text-ink-faint">
                  {stage.n}
                </span>
                <a
                  href={`#${stage.id}`}
                  className="font-serif text-h3 font-semibold tracking-tight text-ink underline-offset-4 hover:text-accent hover:underline"
                >
                  {stage.name}
                </a>
              </h3>
              <ul className="space-y-6">
                {items.map((b) => (
                  <li key={b.id}>
                    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                      <h4 className="text-body font-semibold text-ink">
                        {b.name}
                      </h4>
                      <span className="mono-data shrink-0 text-tag text-ink-faint">
                        {b.effort}
                      </span>
                    </div>
                    <p className="mt-2 max-w-2xl text-meta leading-relaxed text-ink-dim">
                      {b.builds}
                    </p>
                    <p className="mt-2 max-w-2xl text-meta leading-relaxed text-ink-dim">
                      <span className="label mr-2">Teaches</span>
                      {b.teaches}
                    </p>
                    <p className="mt-2 max-w-2xl text-meta leading-relaxed text-ink">
                      <span className="label mr-2">Measure</span>
                      {b.measure}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
