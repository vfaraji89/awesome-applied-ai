import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { problems, problemById } from "@/data/problems";
import { problemBodies } from "@/data/problem-bodies";
import { layers } from "@/data/layers";
import { Prose } from "@/components/prose";

export function generateStaticParams() {
  return problems.map((p) => ({ id: p.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const problem = problemById.get((await params).id);
  if (!problem) return {};
  return { title: problem.title, description: problem.asked };
}

export default async function ProblemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const problem = problemById.get((await params).id);
  if (!problem) notFound();

  const layer = layers.find((l) => l.id === problem.layer);
  const index = problems.findIndex((p) => p.id === problem.id);
  const prev = problems[index - 1];
  const next = problems[index + 1];

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-12">
      <Link
        href="/problems/"
        className="mono-data text-tag text-ink-faint transition-colors hover:text-accent"
      >
        ← Design problems
      </Link>

      <p className="mono-data mt-5 flex items-baseline gap-3 text-tag text-ink-faint">
        <span className="tabular-nums">{String(problem.n).padStart(2, "0")}</span>
        {layer && (
          <Link
            href={`/layers/${layer.id}/`}
            className="underline-offset-4 transition-colors hover:text-accent hover:underline"
          >
            {layer.name}
          </Link>
        )}
      </p>

      <h1 className="mt-3 font-serif text-h1 font-semibold leading-tight tracking-tight text-ink">
        {problem.title}
      </h1>

      <blockquote className="mt-8 border-l-2 border-accent pl-5 font-serif text-lead leading-relaxed text-ink">
        {problem.asked}
      </blockquote>

      <div className="mt-10">
        <Prose blocks={problemBodies[problem.id]} />
      </div>

      <nav className="mt-16 grid gap-3 border-t border-line pt-6 sm:grid-cols-2">
        {prev ? (
          <Link
            href={`/problems/${prev.id}/`}
            className="group rounded-lg border border-line bg-panel p-4 transition-colors hover:border-line-bright"
          >
            <span className="mono-data text-tag text-ink-faint">← Previous</span>
            <span className="mt-1 block text-meta text-ink group-hover:text-accent">
              {prev.title}
            </span>
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link
            href={`/problems/${next.id}/`}
            className="group rounded-lg border border-line bg-panel p-4 transition-colors hover:border-line-bright sm:text-right"
          >
            <span className="mono-data text-tag text-ink-faint">Next →</span>
            <span className="mt-1 block text-meta text-ink group-hover:text-accent">
              {next.title}
            </span>
          </Link>
        )}
      </nav>
    </div>
  );
}
