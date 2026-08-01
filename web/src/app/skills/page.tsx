import type { Metadata } from "next";
import Link from "next/link";
import { skills } from "@/lib/skills";

export const metadata: Metadata = {
  title: "Skills",
  description:
    "Decision procedures for applied AI work, packaged as skill files a coding agent can load: retrieval architecture, and more to follow.",
};

export default function SkillsPage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-12">
      <p className="label">Skills</p>
      <h1 className="mt-5 font-serif text-h1 font-semibold tracking-tight text-ink">
        Procedures, not prose
      </h1>
      <p className="mt-4 max-w-2xl font-serif text-lead leading-relaxed text-ink-dim">
        An article about retrieval tells you what exists. A skill tells your
        agent what to compute first, and refuses to name a tool until it has.
        Each of these is a plain markdown file you drop in your agent&rsquo;s
        skills directory — no install, no runtime, no dependency.
      </p>

      <div className="mt-10 grid gap-3">
        {skills.map((s) => (
          <Link
            key={s.id}
            href={`/skills/${s.id}/`}
            className="group rounded-lg border border-line bg-panel p-5 transition-colors hover:border-line-bright"
          >
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="font-serif text-h3 font-semibold tracking-tight text-ink group-hover:text-accent">
                {s.name}
              </h2>
              <span className="mono-data shrink-0 text-tag text-ink-faint">
                {s.steps.length} steps
              </span>
            </div>
            <p className="mt-2 text-body leading-relaxed text-ink-dim">
              {s.lede}
            </p>
            <p className="mono-data mt-4 text-tag text-ink-faint">
              Computes: {s.computes}
            </p>
          </Link>
        ))}
      </div>

      <p className="mt-12 border-t border-line pt-6 text-meta text-ink-faint">
        These encode the design problems worked out in the repository, not
        general advice. Where a claim rests on published work the skill cites it
        inline, so you can disagree with the source rather than with the file.{" "}
        <Link
          href="/instruments/"
          className="text-ink-dim underline-offset-4 hover:text-accent hover:underline"
        >
          The instruments
        </Link>{" "}
        are where the same arithmetic becomes something you can drag.
      </p>
    </div>
  );
}
