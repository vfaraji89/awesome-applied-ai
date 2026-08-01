import type { Metadata } from "next";
import { kit, shelves } from "@/data/kit";
import { KitBrowser } from "@/components/kit-browser";
import { Reveal } from "@/components/motion";

export const metadata: Metadata = {
  title: "Kit",
  description:
    "Coding agents, terminal tools, local runners, MCP servers and evaluation corpora, with when to reach for each one and when not to.",
};

const picks = kit.filter((k) => k.pick);

export default function KitPage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-12">
      <Reveal>
        <p className="label">Kit</p>
        <h1 className="mt-5 font-serif text-h1 font-semibold tracking-tight text-ink">
          What you install and run
        </h1>
        <p className="mt-4 max-w-2xl font-serif text-lead leading-relaxed text-ink-dim">
          The index next door is libraries you import. This is the other half:
          the binaries, apps, servers and datasets that sit around the work.
          Each entry says when to reach for it, because a link on its own is not
          information.
        </p>
        <p className="mono-data mt-6 text-meta text-ink-faint">
          {kit.length} entries · {shelves.length} shelves · {picks.length} worth
          installing today
        </p>
      </Reveal>

      <div className="mt-8">
        <KitBrowser />
      </div>
    </div>
  );
}
