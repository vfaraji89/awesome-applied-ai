import type { Metadata } from "next";
import Link from "next/link";
import { ContextWindow } from "@/components/context-window";

export const metadata: Metadata = {
  title: "The window",
  description:
    "A context window is two numbers: the one you are billed for and the one the model reads. Partition the window and watch them come apart.",
};

export default function WindowPage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-12">
      <p className="label">Instrument</p>
      <h1 className="mt-5 font-serif text-h1 font-semibold tracking-tight text-ink">
        The window
      </h1>
      <p className="mt-4 max-w-2xl font-serif text-lead leading-relaxed text-ink-dim">
        A context window is quoted as one number and behaves as two. You are
        billed for every token you put in. The model reaches the ends of the
        prompt reliably and the middle much less so, and the wider the window,
        the deeper that sag goes. Everything on this site sits downstream of that
        gap: retrieval exists to keep the window small, caching to make it cheap,
        memory to decide what earns a place in it.
      </p>
      <p className="mt-4 max-w-2xl text-body leading-relaxed text-ink-dim">
        Drag the diamonds to repartition the prompt. The top bar is what you pay
        for, the bar under it is what the model gets to. Arrow keys work, and
        shift moves in fives.
      </p>

      <div className="mt-10">
        <ContextWindow />
      </div>

      <p className="mt-12 border-t border-line pt-6 text-meta text-ink-faint">
        Position is one term; there are others this chart does not carry.{" "}
        <Link href="/nomogram/" className="text-accent hover:underline">
          The nomogram
        </Link>{" "}
        holds the cost and memory relations that decide how much you can afford
        to put in the window in the first place.
      </p>
    </div>
  );
}
