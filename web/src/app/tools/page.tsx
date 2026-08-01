import type { Metadata } from "next";
import Link from "next/link";
import { ToolBrowser } from "@/components/tool-browser";

export const metadata: Metadata = {
  title: "Index",
  description:
    "The full context engineering index, filterable by layer, topic, license, maturity, deployment and project health.",
};

export default function ToolsPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-12">
      <p className="label">Inside I · Context engineering</p>
      <h1 className="mt-5 font-serif text-h1 font-semibold tracking-tight text-ink">
        The full index
      </h1>
      <p className="mt-4 max-w-2xl font-serif text-lead leading-relaxed text-ink-dim">
        Every entry across the six layers in one place. Narrow by topic, layer,
        licence model, maturity, deployment or project health — topics stack, so
        picking two shows only the entries carrying both. Maturity and status are
        my readings of the evidence; every row links to the source.
      </p>
      <p className="mt-4 max-w-2xl text-meta leading-relaxed text-ink-dim">
        Everything here is a library you import. For the binaries, apps, MCP
        servers and corpora that sit around the work, see{" "}
        <Link
          href="/kit/"
          className="text-ink underline decoration-line underline-offset-4 transition-colors hover:text-accent hover:decoration-accent"
        >
          the kit
        </Link>
        .
      </p>
      <div className="mt-10">
        <ToolBrowser />
      </div>
    </div>
  );
}
