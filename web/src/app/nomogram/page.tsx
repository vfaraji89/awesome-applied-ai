import type { Metadata } from "next";
import Link from "next/link";
import { Nomogram } from "@/components/nomogram";
import { Tex } from "@/components/tex";
import { nomograms } from "@/lib/nomograms";

export const metadata: Metadata = {
  title: "The nomogram",
  description:
    "An alignment chart for the six governing relations of the context engineering stack. Drag two scales, read the third.",
};

export default function NomogramPage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-12">
      <p className="label">Instrument</p>
      <h1 className="mt-5 font-serif text-h1 font-semibold tracking-tight text-ink">
        The nomogram
      </h1>
      <p className="mt-4 max-w-2xl font-serif text-lead leading-relaxed text-ink-dim">
        Before calculators, engineers read answers off paper. Three scales, a
        straightedge laid across two of them, and the third scale tells you where
        you land. Each of the six layers has one relation that decides whether a
        system is affordable, and all six happen to be the kind a chart like this
        can hold.
      </p>
      <p className="mt-4 max-w-2xl text-body leading-relaxed text-ink-dim">
        Drag either outer handle. The red line pivots and the diamond on the
        middle scale is your answer. Arrow keys work too, and hold shift to move
        faster.
      </p>

      <div className="mt-10">
        <Nomogram
          formulas={nomograms.map((n) => (
            <Tex key={n.id} block>
              {n.tex}
            </Tex>
          ))}
        />
      </div>

      <p className="mt-12 border-t border-line pt-6 text-meta text-ink-faint">
        Every scale is logarithmic, which is what turns each relation into a sum
        two scales can carry.{" "}
        <Link href="/tools/" className="text-accent hover:underline">
          The full index
        </Link>{" "}
        has the entries these numbers come from.
      </p>
    </div>
  );
}
