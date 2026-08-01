import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { layers, layerById } from "@/data/layers";
import { tools } from "@/data/tools";
import { ToolRow } from "@/components/tool-row";
import { Tex } from "@/components/tex";
import { Reveal, Stagger, StaggerItem } from "@/components/motion";
import { CacheEconomics } from "@/components/cache-economics";
import { ConceptFlow, PlainToggle } from "@/components/explain";
import { Glyph } from "@/lib/glyphs";
import { layerGlyph, layerInk, sortTools } from "@/lib/style";
import type { LayerId } from "@/lib/types";

export function generateStaticParams() {
  return layers.map((l) => ({ id: l.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const layer = layerById[id as LayerId];
  if (!layer) return {};
  return { title: layer.name, description: layer.question };
}

export default async function LayerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const layer = layerById[id as LayerId];
  if (!layer) notFound();

  const index = layers.findIndex((l) => l.id === layer.id);
  const prev = layers[index - 1];
  const next = layers[index + 1];
  const layerTools = tools.filter((t) => t.layer === layer.id);
  const color = layerInk[layer.id];

  return (
    <div className="mx-auto w-full max-w-6xl px-6">
      <header className="border-b border-line py-14">
        <Link href="/" className="label hover:text-ink">
          ← all layers
        </Link>
        <div className="mt-5 flex items-center gap-4">
          <span
            className="flex size-12 shrink-0 items-center justify-center rounded-lg border border-line bg-panel text-ink-dim"
            style={{ color }}
          >
            <Glyph name={layerGlyph[layer.id]} className="size-6" />
          </span>
          <div>
            <h1 className="font-serif text-h1 font-semibold tracking-tight text-ink">
              {layer.name}
            </h1>
            <p className="mt-1 text-ui text-ink-faint">{layer.tagline}</p>
          </div>
        </div>

        <div className="mt-9">
          {layer.plain ? (
            <PlainToggle technical={layer.question} plain={layer.plain} />
          ) : (
            <p className="max-w-3xl font-serif text-h3 font-medium leading-snug tracking-tight text-ink">
              {layer.question}
            </p>
          )}
        </div>

        <p className="mt-9 label">
          {layerTools.length} entries · {layer.categories.length} categories ·{" "}
          {layer.formulas.length} equations
        </p>
      </header>

      {layer.flow && (
        <section className="border-b border-line py-14">
          <div className="mb-6 flex items-baseline justify-between gap-4">
            <h2 className="label">How it actually works</h2>
            <span className="label">no jargon</span>
          </div>
          <ConceptFlow steps={layer.flow} />
        </section>
      )}

      <section className="border-b border-line py-14">
        <h2 className="mb-6 label">The arithmetic</h2>
        <Stagger className="grid gap-3 lg:grid-cols-2">
          {layer.formulas.map((f) => (
            <StaggerItem
              key={f.id}
              className="rounded-lg border border-line bg-panel p-5"
            >
              <div
                className="label border-l-2 pl-3 !text-ink-dim"
                style={{ borderColor: color }}
              >
                {f.label}
              </div>
              <div className="my-6 text-ink">
                <Tex block>{f.tex}</Tex>
              </div>
              <p className="text-meta leading-relaxed text-ink-dim">{f.note}</p>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      <div className="grid gap-12 py-12 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex flex-col gap-12">
          {layer.categories.map((category) => {
            const items = sortTools(
              layerTools.filter((t) => t.category === category.id),
              "maturity",
            );
            if (items.length === 0) return null;
            return (
              <section key={category.id} id={category.id} className="scroll-mt-24">
                <div className="mb-5 flex items-start justify-between gap-4 border-b border-line pb-4">
                  <div className="flex items-start gap-3">
                    <span
                      className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-sm border border-line bg-panel"
                      style={{ color }}
                    >
                      <Glyph name={category.id} className="size-4" />
                    </span>
                    <div>
                      <h2 className="font-serif text-h3 font-semibold tracking-tight text-ink">
                        {category.name}
                      </h2>
                      <p className="mt-1 text-meta text-ink-faint">
                        {category.blurb}
                      </p>
                    </div>
                  </div>
                  <span className="label shrink-0 pt-2">{items.length}</span>
                </div>
                <Stagger className="flex flex-col border-b border-line">
                  {items.map((tool, i) => (
                    <StaggerItem key={tool.id}>
                      <ToolRow tool={tool} n={i + 1} />
                    </StaggerItem>
                  ))}
                </Stagger>
              </section>
            );
          })}
        </div>

        <aside className="flex flex-col gap-3 lg:sticky lg:top-24 lg:self-start">
          {layer.id === "caching" && <CacheEconomics />}
          <Reveal className="rounded-lg border border-line bg-panel p-6">
            <h2 className="label">Field notes</h2>
            <ul className="mt-5 flex flex-col gap-4">
              {layer.notes.map((note, i) => (
                <li
                  key={i}
                  className="border-l-2 border-line-bright pl-3.5 text-meta leading-relaxed text-ink-dim"
                >
                  {note}
                </li>
              ))}
            </ul>
          </Reveal>
        </aside>
      </div>

      <nav className="flex items-center justify-between gap-4 border-t border-line py-10 text-ui">
        {prev ? (
          <Link
            href={`/layers/${prev.id}/`}
            className="text-ink-dim transition-colors hover:text-accent"
          >
            ← {prev.name}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            href={`/layers/${next.id}/`}
            className="text-ink-dim transition-colors hover:text-accent"
          >
            {next.name} →
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </div>
  );
}
