import Link from "next/link";
import katex from "katex";
import { layers } from "@/data/layers";
import { tools } from "@/data/tools";
import { problems } from "@/data/problems";
import { builds, stages } from "@/data/cycle";
import { shipped } from "@/data/shipped";
import { findings } from "@/data/findings";
import { kit } from "@/data/kit";
import { terms } from "@/data/dictionary";
import { commands } from "@/data/commands";
import { WordWheel } from "@/components/word-wheel";
import { SearchLauncher } from "@/components/search-launcher";
import { Reveal } from "@/components/motion";
import { tagCounts } from "@/lib/search";
import { instruments } from "@/lib/instruments";
import { skills } from "@/lib/skills";
import { site } from "@/lib/site";

const formulaCount = layers.reduce((n, l) => n + l.formulas.length, 0);

const counts = [
  { n: stages.length, label: "cycle stages" },
  { n: problems.length, label: "design problems" },
  { n: layers.length, label: "layers" },
  { n: formulaCount, label: "equations" },
  { n: tools.length, label: "index entries" },
  { n: terms.length, label: "defined terms" },
  { n: commands.length, label: "commands" },
  { n: kit.length, label: "kit entries" },
  { n: builds.length, label: "build projects" },
  { n: shipped.length, label: "case studies" },
];

/** Three equations that decide an architecture, one from each layer that usually gets argued instead of computed. */
const readings: Record<string, string> = {
  "hnsw-ram":
    "Ten million 1536-dimension vectors at m = 16 want roughly 63 GB resident. That figure picks your architecture. Query latency does not.",
  "effective-cost":
    "At a 90 percent hit rate on a five minute cache, input spend falls 78.5 percent. Hit rate is a larger lever than the model you chose.",
  compounding:
    "Twenty steps at 99 percent each succeed 81.8 percent of the time. At 95 percent each, 35.8 percent. No amount of prompting closes that.",
};

const equations = Object.keys(readings).map((id) => {
  const layer = layers.find((l) => l.formulas.some((f) => f.id === id))!;
  const formula = layer.formulas.find((f) => f.id === id)!;
  return {
    id,
    layer: layer.name,
    label: formula.label,
    reading: readings[id],
    html: katex.renderToString(formula.tex, {
      throwOnError: false,
      strict: false,
    }),
  };
});

const evidence = shipped.slice(0, 3);

const elsewhere = [
  { href: "/problems/", name: "Problems", n: problems.length },
  { href: "/dictionary/", name: "Dictionary", n: terms.length },
  { href: "/commands/", name: "Commands", n: commands.length },
  { href: "/research/", name: "Research", n: findings.length },
  { href: "/shipped/", name: "Shipped", n: shipped.length },
  { href: "/instruments/", name: "Instruments", n: instruments.length },
  { href: "/skills/", name: "Skills", n: skills.length },
  { href: "/kit/", name: "Kit", n: kit.length },
  { href: "/tools/", name: "Index", n: tools.length },
];

const stack = [...layers].reverse();

export default function Home() {
  return (
    <div className="mx-auto w-full max-w-5xl px-6">
      <section className="pt-16 pb-12 sm:pt-24">
        <Reveal>
          <p className="label">A taxonomy of applied AI</p>
        </Reveal>
        <Reveal delay={0.06}>
          <h1 className="mt-5 max-w-4xl font-serif text-h1 font-semibold leading-[1.08] tracking-tight text-ink sm:text-display">
            The applied AI cycle, filed by
            <WordWheel
              words={["stage", "layer", "problem", "equation", "tool"]}
            />
          </h1>
        </Reveal>
        <Reveal delay={0.12}>
          <p className="mt-7 max-w-2xl font-serif text-lead leading-relaxed text-ink-dim">
            What an enterprise system actually goes through between someone
            asking for it and someone signing off on it, in {stages.length}{" "}
            stages. Under each stage: the design problems it raises, the
            arithmetic that settles them, and the tools worth knowing.
          </p>
        </Reveal>
        <Reveal delay={0.18}>
          <div className="mt-9 max-w-2xl">
            <SearchLauncher
              placeholder="Search stages, problems, equations, tools, MCP servers"
              seeds={["rerank", "selectivity", "cache hit", "mcp", "eval"]}
            />
          </div>
        </Reveal>
        <Reveal delay={0.24}>
          <dl className="mono-data mt-10 flex flex-wrap gap-x-6 gap-y-2 border-t border-line pt-5 text-tag text-ink-faint">
            {counts.map((c) => (
              <div key={c.label} className="flex items-baseline gap-1.5">
                <dt className="sr-only">{c.label}</dt>
                <dd className="tabular-nums text-ink">{c.n}</dd>
                <span>{c.label}</span>
              </div>
            ))}
          </dl>
        </Reveal>
      </section>

      <section className="pt-12">
        <Reveal>
          <div className="relative overflow-hidden rounded-lg border border-line bg-panel p-8 sm:p-10">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(560px_160px_at_88%_0%,var(--accent-bg),transparent)]" />
            <div className="relative">
              <p className="text-tag font-medium uppercase tracking-[0.14em] text-accent">
                The author · July 2026
              </p>
              <h2 className="mt-4 max-w-2xl font-serif text-h3 font-semibold leading-snug tracking-tight text-ink">
                Built by an Applied AI Specialist shipping agent systems in
                production
              </h2>
              <p className="mt-3 max-w-2xl text-meta leading-relaxed text-ink-dim">
                Vahid Faraji is a Senior Applied AI Specialist at Kariyer.net
                (ilab group). The map above comes from the same notes as his
                context engineering toolkit and the multi-agent systems he runs
                at enterprise scale.
              </p>
              <div className="mt-6 flex flex-wrap gap-2.5">
                <a
                  href={site.author.site}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-md bg-ink px-5 py-2.5 text-meta font-medium text-bg transition-colors hover:opacity-85"
                >
                  Visit the portfolio →
                </a>
                <a
                  href={site.author.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-md border border-line-bright px-5 py-2.5 text-meta font-medium text-ink transition-colors hover:border-ink"
                >
                  LinkedIn
                </a>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      <section>
        <Reveal>
          <div className="mb-5 flex items-baseline justify-between gap-4">
            <h2 className="label">The cycle</h2>
            <Link
              href="/cycle/"
              className="label text-ink-faint underline-offset-4 hover:text-accent hover:underline"
            >
              all {stages.length} stages →
            </Link>
          </div>
        </Reveal>
        <Reveal delay={0.06}>
          <ol className="grid gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
            {stages.map((s) => (
              <li key={s.id} className="bg-bg">
                <Link
                  href={`/cycle/#${s.id}`}
                  className="group flex h-full flex-col p-5 transition-colors hover:bg-panel"
                >
                  <span className="mono-data text-tag tabular-nums text-ink-faint">
                    {s.n}
                  </span>
                  <span className="mt-2 font-serif text-h3 font-semibold tracking-tight text-ink group-hover:text-accent">
                    {s.name}
                  </span>
                  <span className="mt-2 text-meta leading-relaxed text-ink-dim">
                    {s.question}
                  </span>
                  <span className="mono-data mt-auto pt-4 text-tag text-ink-faint">
                    {s.layer ?? "no single layer"} ·{" "}
                    {s.problems.length === 1
                      ? "1 problem"
                      : `${s.problems.length} problems`}
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </Reveal>
      </section>

      <section className="pt-6">
        <Reveal>
          <div className="grid gap-3 md:grid-cols-2">
            <Link
              href="/cycle/"
              className="group rounded-lg border border-line bg-panel p-6 transition-colors hover:border-line-bright"
            >
              <p className="label">Start here if</p>
              <h2 className="mt-3 font-serif text-h3 font-semibold tracking-tight text-ink group-hover:text-accent">
                You are shipping this at work
              </h2>
              <p className="mt-3 text-meta leading-relaxed text-ink-dim">
                Walk the {stages.length} stages in order. Each one names the
                number you have to compute, the failure that shows up if you
                skip it, and the problems filed under it.
              </p>
              <p className="mono-data mt-5 text-tag text-ink-faint">
                The cycle →
              </p>
            </Link>
            <Link
              href="/cycle/#build"
              className="group rounded-lg border border-line bg-panel p-6 transition-colors hover:border-line-bright"
            >
              <p className="label">Start here if</p>
              <h2 className="mt-3 font-serif text-h3 font-semibold tracking-tight text-ink group-hover:text-accent">
                You are building toward the job
              </h2>
              <p className="mt-3 text-meta leading-relaxed text-ink-dim">
                {builds.length} projects, each small enough for a weekend and
                each ending in a number you measured yourself. They map onto the
                same {stages.length} stages.
              </p>
              <p className="mono-data mt-5 text-tag text-ink-faint">
                The build track →
              </p>
            </Link>
          </div>
        </Reveal>
      </section>

      <section className="pt-14">
        <Reveal>
          <div className="mb-5 flex items-baseline justify-between gap-4">
            <h2 className="label">What settles the argument</h2>
            <Link
              href="/research/#arithmetic"
              className="label text-ink-faint underline-offset-4 hover:text-accent hover:underline"
            >
              all {formulaCount} equations →
            </Link>
          </div>
        </Reveal>
        <Reveal delay={0.06}>
          <div className="grid gap-3 md:grid-cols-3">
            {equations.map((e) => (
              <div
                key={e.id}
                className="flex flex-col rounded-lg border border-line p-5"
              >
                <p className="mono-data text-tag text-ink-faint">{e.layer}</p>
                <p className="mt-1 text-ui font-semibold text-ink">{e.label}</p>
                <div
                  className="my-5 overflow-x-auto text-ink"
                  dangerouslySetInnerHTML={{ __html: e.html }}
                />
                <p className="mt-auto text-meta leading-relaxed text-ink-dim">
                  {e.reading}
                </p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      <section className="pt-14">
        <Reveal>
          <div className="mb-5 flex items-baseline justify-between gap-4">
            <h2 className="label">Measured in production</h2>
            <Link
              href="/shipped/"
              className="label text-ink-faint underline-offset-4 hover:text-accent hover:underline"
            >
              {shipped.length} case studies →
            </Link>
          </div>
        </Reveal>
        <Reveal delay={0.06}>
          <ul className="border-t border-line">
            {evidence.map((s) => (
              <li key={s.id} className="border-b border-line">
                <Link
                  href={`/shipped/#${s.id}`}
                  className="group grid gap-4 py-6 md:grid-cols-[1fr_20rem] md:gap-10"
                >
                  <div>
                    <p className="mono-data text-tag text-ink-faint">
                      {s.year} · {s.sector}
                    </p>
                    <p className="mt-2 font-serif text-h3 font-semibold leading-snug tracking-tight text-ink group-hover:text-accent">
                      {s.name}
                    </p>
                  </div>
                  <dl className="self-center space-y-2.5">
                    {s.numbers.slice(0, 3).map((m) => (
                      <div
                        key={m.label}
                        className="flex items-baseline justify-between gap-4"
                      >
                        <dt className="text-meta text-ink-dim">{m.label}</dt>
                        <dd className="mono-data text-meta tabular-nums text-right text-ink">
                          {m.value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </Link>
              </li>
            ))}
          </ul>
        </Reveal>
      </section>

      <section className="pt-14">
        <Reveal>
          <div className="mb-5 flex items-baseline justify-between gap-4">
            <h2 className="label">The stack under it</h2>
            <Link
              href="/research/#stack"
              className="label text-ink-faint underline-offset-4 hover:text-accent hover:underline"
            >
              why six →
            </Link>
          </div>
        </Reveal>
        <Reveal delay={0.06}>
          <div className="flex flex-wrap gap-1.5">
            {stack.map((l, i) => (
              <Link
                key={l.id}
                href={`/layers/${l.id}/`}
                className="mono-data group flex items-center gap-2 rounded-sm border border-line bg-panel px-2.5 py-1.5 text-tag text-ink-dim transition-colors hover:border-line-bright hover:text-ink"
              >
                <span className="tabular-nums text-ink-faint">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {l.name}
                <span className="tabular-nums text-ink-faint">
                  {tools.filter((t) => t.layer === l.id).length}
                </span>
              </Link>
            ))}
          </div>
        </Reveal>
      </section>

      <section className="pt-14">
        <Reveal>
          <h2 className="label mb-5">Everything else</h2>
        </Reveal>
        <Reveal delay={0.06}>
          <div className="flex flex-wrap gap-1.5">
            {elsewhere.map((e) => (
              <Link
                key={e.href}
                href={e.href}
                className="mono-data flex items-center gap-2 rounded-sm border border-line px-2.5 py-1.5 text-tag text-ink-dim transition-colors hover:border-line-bright hover:text-ink"
              >
                {e.name}
                <span className="tabular-nums text-ink-faint">{e.n}</span>
              </Link>
            ))}
          </div>
        </Reveal>
      </section>

      <section className="py-14">
        <Reveal>
          <p className="max-w-2xl text-ui leading-relaxed text-ink-faint">
            Every layer page carries its own arithmetic next to my notes on
            where the received wisdom is wrong: stalled projects still appearing
            in roundups, standards that are not standards yet, controls that are
            theatre. Read those before the tool lists.{" "}
            <Link
              href="/tools/"
              className="text-ink-dim underline-offset-4 hover:text-accent hover:underline"
            >
              Or search all {tools.length} entries across {tagCounts.length}{" "}
              topics.
            </Link>
          </p>
        </Reveal>
      </section>
    </div>
  );
}
