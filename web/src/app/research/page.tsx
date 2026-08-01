import type { Metadata } from "next";
import katex from "katex";
import Link from "next/link";
import { layers } from "@/data/layers";
import { tools } from "@/data/tools";
import { domains } from "@/data/domains";
import { findings } from "@/data/findings";
import { StackDiagram, type Band } from "@/components/stack-diagram";
import { DomainMap, type DomainNode } from "@/components/domain-map";
import { StatsBar } from "@/components/stats-bar";
import { Reveal } from "@/components/motion";
import { layerInk } from "@/lib/style";

export const metadata: Metadata = {
  title: "Research",
  description:
    "Findings that contradict the received wisdom, the six layer stack a request passes through, and the arithmetic that settles each design argument.",
};

const bands: Band[] = layers.map((layer, i) => {
  const layerTools = tools.filter((t) => t.layer === layer.id);
  const signature = layer.formulas[0];
  return {
    id: layer.id,
    index: String(layers.length - i).padStart(2, "0"),
    name: layer.name,
    tagline: layer.tagline,
    question: layer.question,
    color: layerInk[layer.id],
    count: layerTools.length,
    categories: layer.categories.map((c) => ({
      id: c.id,
      name: c.name,
      count: layerTools.filter((t) => t.category === c.id).length,
    })),
    formulaLabel: signature.label,
    formulaHtml: katex.renderToString(signature.tex, {
      throwOnError: false,
      strict: false,
    }),
  };
});

const nodes: DomainNode[] = domains.map((d) =>
  d.id === "context-engineering"
    ? {
        ...d,
        segments: layers.map((l) => ({
          id: l.id,
          label: l.name,
          count: tools.filter((t) => t.layer === l.id).length,
          color: layerInk[l.id],
        })),
      }
    : d,
);

const layerNumeral = Object.fromEntries(
  layers.map((l, i) => [l.id, String(layers.length - i).padStart(2, "0")]),
) as Record<string, string>;

const arithmetic = [...layers].reverse().map((layer) => ({
  id: layer.id,
  name: layer.name,
  numeral: layerNumeral[layer.id],
  formulas: layer.formulas.map((f) => ({
    id: f.id,
    label: f.label,
    note: f.note,
    html: katex.renderToString(f.tex, { throwOnError: false, strict: false }),
  })),
}));

const formulaCount = layers.reduce((n, l) => n + l.formulas.length, 0);
const written = domains.filter((d) => d.status === "written").length;

export default function ResearchPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-12">
      <Reveal>
        <p className="label">Research</p>
        <h1 className="mt-5 max-w-3xl font-serif text-h1 font-semibold tracking-tight text-ink">
          The arguments, and what settles them
        </h1>
        <p className="mt-4 max-w-2xl font-serif text-lead leading-relaxed text-ink-dim">
          Most applied AI disagreements are arithmetic wearing an opinion. This
          page collects the findings that contradict the received wisdom, the
          six layers every request passes through, and the {formulaCount}{" "}
          equations that decide the arguments one at a time.
        </p>
        <p className="mono-data mt-6 text-meta text-ink-faint">
          {findings.length} findings · {layers.length} layers ·{" "}
          {formulaCount} equations
        </p>
      </Reveal>

      <section id="findings" className="scroll-mt-24 pt-16">
        <Reveal>
          <div className="mb-5 flex items-baseline justify-between gap-4">
            <h2 className="label">Where the consensus is wrong</h2>
            <span className="label">{findings.length} findings</span>
          </div>
        </Reveal>
        <Reveal delay={0.06}>
          <ul className="grid gap-3 md:grid-cols-2">
            {findings.map((f) => (
              <li key={f.claim}>
                <Link
                  href={f.href}
                  className="group flex h-full flex-col rounded-lg border border-line p-5 transition-colors hover:border-line-bright"
                >
                  <h3 className="text-body font-semibold leading-snug text-ink group-hover:text-accent">
                    {f.claim}
                  </h3>
                  <p className="mt-2 text-meta leading-relaxed text-ink-dim">
                    {f.because}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </Reveal>
      </section>

      <section id="stack" className="scroll-mt-24 pt-20">
        <Reveal>
          <div className="mb-6 max-w-2xl">
            <h2 className="label">The stack</h2>
            <p className="mt-4 text-body leading-relaxed text-ink-dim">
              Stages 02 through 07 of{" "}
              <Link
                href="/cycle/"
                className="text-ink underline decoration-line underline-offset-4 transition-colors hover:text-accent hover:decoration-accent"
              >
                the cycle
              </Link>{" "}
              all pass through the same six layers, ordered the way a request
              flows: evidence in at the base, constraint and proof at the top.
            </p>
          </div>
        </Reveal>
      </section>

      <StackDiagram bands={bands} />

      <section id="arithmetic" className="scroll-mt-24 pt-20">
        <Reveal>
          <div className="mb-5 flex items-baseline justify-between gap-4">
            <h2 className="label">The arithmetic</h2>
            <span className="label">{formulaCount} equations</span>
          </div>
        </Reveal>
        <Reveal delay={0.06}>
          <div className="border-t border-line">
            {arithmetic.map((layer) => (
              <div
                key={layer.id}
                className="grid gap-4 border-b border-line py-6 md:grid-cols-[14rem_1fr] md:gap-8"
              >
                <h3 className="flex items-baseline gap-3">
                  <span className="mono-data text-tag tabular-nums text-ink-faint">
                    {layer.numeral}
                  </span>
                  <Link
                    href={`/layers/${layer.id}/`}
                    className="font-serif text-h3 font-semibold tracking-tight text-ink underline-offset-4 hover:text-accent hover:underline"
                  >
                    {layer.name}
                  </Link>
                </h3>
                <ul className="space-y-5">
                  {layer.formulas.map((f) => (
                    <li key={f.id}>
                      <p className="label">{f.label}</p>
                      <div
                        className="mt-2 overflow-x-auto text-ink"
                        dangerouslySetInnerHTML={{ __html: f.html }}
                      />
                      <p className="mt-2 text-meta leading-relaxed text-ink-dim">
                        {f.note}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      <section id="map" className="scroll-mt-24 pt-20">
        <Reveal>
          <div className="mb-5 flex items-baseline justify-between gap-4">
            <h2 className="label">The map</h2>
            <span className="label">
              {written} / {domains.length} written
            </span>
          </div>
        </Reveal>
        <DomainMap nodes={nodes} />
      </section>

      <section className="pt-16">
        <Reveal>
          <StatsBar />
        </Reveal>
      </section>
    </div>
  );
}
