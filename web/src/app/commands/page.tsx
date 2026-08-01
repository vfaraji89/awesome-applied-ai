import type { Metadata } from "next";
import { commands, toolboxes } from "@/data/commands";
import { CommandsBrowser } from "@/components/commands-browser";
import { Reveal } from "@/components/motion";

export const metadata: Metadata = {
  title: "Commands",
  description:
    "The commands an applied AI engineer actually types: shell, git, uv, containers, Kubernetes, cloud, DuckDB, vLLM, Ollama, llama.cpp, GPU profiling and network diagnosis, each with the reason to reach for it.",
};

const picks = commands.filter((c) => c.pick);

export default function CommandsPage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-12">
      <Reveal>
        <p className="label">Commands</p>
        <h1 className="mt-5 font-serif text-h1 font-semibold tracking-tight text-ink">
          What you type when it matters
        </h1>
        <p className="mt-4 max-w-2xl font-serif text-lead leading-relaxed text-ink-dim">
          A cheat sheet lists flags. This one gives the reason: why this command
          rather than the obvious alternative, and what the output actually
          tells you. Most of them exist because something was broken and nobody
          knew where to look.
        </p>
        <p className="mono-data mt-6 text-meta text-ink-faint">
          {commands.length} commands · {toolboxes.length} toolboxes ·{" "}
          {picks.length} worth committing to memory
        </p>
      </Reveal>

      <div className="mt-8">
        <CommandsBrowser />
      </div>
    </div>
  );
}
