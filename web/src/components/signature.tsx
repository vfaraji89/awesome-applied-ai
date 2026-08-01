import { Mark } from "@/components/mark";
import { site } from "@/lib/site";

export function Signature() {
  return (
    <div className="flex items-center gap-3.5">
      <Mark className="size-10 shrink-0" />
      <div>
        <p className="font-serif text-h3 font-semibold leading-none tracking-tight text-ink">
          {site.author.name}
        </p>
        <p className="mono-data mt-2 text-tag uppercase tracking-wide text-ink-faint">
          data <span className="text-accent">→</span> applied AI
        </p>
      </div>
    </div>
  );
}
