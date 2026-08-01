import type { Metadata } from "next";
import { fields, terms } from "@/data/dictionary";
import { DictionaryBrowser } from "@/components/dictionary-browser";
import { Reveal } from "@/components/motion";

export const metadata: Metadata = {
  title: "Dictionary",
  description:
    "The vocabulary of applied AI, from attention variants and KV cache arithmetic to reranking, evaluation and model governance, defined with the number or mechanism that makes each one concrete.",
};

const asked = terms.filter((t) => t.asked).length;

export default function DictionaryPage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-12">
      <Reveal>
        <p className="label">Dictionary</p>
        <h1 className="mt-5 font-serif text-h1 font-semibold tracking-tight text-ink">
          The vocabulary, defined properly
        </h1>
        <p className="mt-4 max-w-2xl font-serif text-lead leading-relaxed text-ink-dim">
          Every term carries two lines: what it is, with the number or mechanism
          that makes it concrete, and what a good answer adds once the
          definition is out of the way. The second line is the one that gets
          people hired.
        </p>
        <p className="mono-data mt-6 text-meta text-ink-faint">
          {terms.length} terms · {fields.length} fields · {asked} with the
          question they arrive as
        </p>
      </Reveal>

      <div className="mt-8">
        <DictionaryBrowser />
      </div>
    </div>
  );
}
