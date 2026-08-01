import type { Metadata } from "next";
import Link from "next/link";
import { CacheEconomics } from "@/components/cache-economics";

export const metadata: Metadata = {
  title: "Cache economics",
  description:
    "A prompt cache charges a premium to write and a discount to read. Set the hit rate and find the point where it starts paying for itself.",
};

export default function CachePage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-12">
      <p className="label">Instrument</p>
      <h1 className="mt-5 font-serif text-h1 font-semibold tracking-tight text-ink">
        Cache economics
      </h1>
      <p className="mt-4 max-w-2xl font-serif text-lead leading-relaxed text-ink-dim">
        A prompt cache is a bet. You pay a premium to write the prefix down, and
        a fraction of the usual rate every time you read it back. If you read it
        often enough the bet pays; below that line you have simply bought a more
        expensive prompt. Where the line sits depends on the provider, and the
        four here do not price it the same way.
      </p>
      <p className="mt-4 max-w-2xl text-body leading-relaxed text-ink-dim">
        Pick a provider and move the hit rate. The break-even is the number of
        reads that repays the write premium.
      </p>

      <div className="mt-10">
        <CacheEconomics />
      </div>

      <p className="mt-12 border-t border-line pt-6 text-meta text-ink-faint">
        Caching decides what a window costs to refill.{" "}
        <Link href="/window/" className="text-accent hover:underline">
          The window
        </Link>{" "}
        decides how much of what you refilled the model actually reads — the two
        multiply, and only one of them appears on the invoice.
      </p>
    </div>
  );
}
