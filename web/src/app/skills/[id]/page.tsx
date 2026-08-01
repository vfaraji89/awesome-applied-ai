import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { skillById, skills } from "@/lib/skills";
import { layers } from "@/data/layers";
import { site } from "@/lib/site";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function generateStaticParams() {
  return skills.map((s) => ({ id: s.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const skill = skillById.get((await params).id);
  if (!skill) return {};
  return { title: skill.name, description: skill.lede };
}

export default async function SkillPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const skill = skillById.get((await params).id);
  if (!skill) notFound();

  const layer = layers.find((l) => l.id === skill.layer);
  const file = `${basePath}/skills/${skill.id}.md`;

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-12">
      <Link
        href="/skills/"
        className="mono-data text-tag text-ink-faint transition-colors hover:text-accent"
      >
        ← Skills
      </Link>

      <h1 className="mt-5 font-serif text-h1 font-semibold tracking-tight text-ink">
        {skill.name}
      </h1>
      <p className="mt-4 max-w-2xl font-serif text-lead leading-relaxed text-ink-dim">
        {skill.lede}
      </p>

      <blockquote className="mt-8 border-l-2 border-accent pl-5 font-serif text-lead leading-relaxed text-ink">
        {skill.asks}
      </blockquote>

      <div className="mt-8 rounded-lg border border-line bg-panel p-5">
        <p className="label">Before it names a tool</p>
        <p className="mt-2 text-body leading-relaxed text-ink">
          {skill.computes}
        </p>
      </div>

      <h2 className="mt-12 font-serif text-h2 font-semibold tracking-tight text-ink">
        The procedure
      </h2>
      <ol className="mt-6 space-y-5">
        {skill.steps.map((step, i) => (
          <li key={step.label} className="flex gap-4">
            <span className="mono-data mt-1 w-6 shrink-0 text-tag tabular-nums text-ink-faint">
              {String(i + 1).padStart(2, "0")}
            </span>
            <div>
              <p className="text-body font-semibold text-ink">{step.label}</p>
              <p className="mt-1 text-body leading-relaxed text-ink-dim">
                {step.detail}
              </p>
            </div>
          </li>
        ))}
      </ol>

      <h2 className="mt-12 font-serif text-h2 font-semibold tracking-tight text-ink">
        Where answers fail
      </h2>
      <ul className="mt-6 space-y-2">
        {skill.fails.map((f) => (
          <li key={f} className="flex gap-3 text-body leading-relaxed text-ink-dim">
            <span aria-hidden className="mt-2.5 size-1 shrink-0 rounded-full bg-accent" />
            {f}
          </li>
        ))}
      </ul>

      <h2 className="mt-12 font-serif text-h2 font-semibold tracking-tight text-ink">
        Install
      </h2>
      <p className="mt-4 text-body leading-relaxed text-ink-dim">
        One markdown file. Drop it in your agent&rsquo;s skills directory and it
        loads when the description matches what you are doing.
      </p>
      <pre className="mono-data mt-4 overflow-x-auto rounded-lg border border-line bg-panel p-4 text-meta leading-relaxed text-ink">
        <code>{`mkdir -p ~/.claude/skills/${skill.id}
curl -o ~/.claude/skills/${skill.id}/SKILL.md \\
  ${site.url}/skills/${skill.id}.md`}</code>
      </pre>
      <p className="mt-4 text-meta text-ink-faint">
        <a
          href={file}
          download={`${skill.id}.md`}
          className="text-ink-dim underline-offset-4 hover:text-accent hover:underline"
        >
          Download the file
        </a>
        {layer ? (
          <>
            {" · "}
            <Link
              href={`/layers/${layer.id}/`}
              className="text-ink-dim underline-offset-4 hover:text-accent hover:underline"
            >
              {layer.name}
            </Link>
          </>
        ) : null}
      </p>
    </div>
  );
}
