import { Fragment, type ReactNode } from "react";

export type Inline =
  | { t: "text"; v: string }
  | { t: "b"; v: string }
  | { t: "i"; v: string }
  | { t: "c"; v: string };

export type Block =
  | { t: "p"; c: Inline[] }
  | { t: "quote"; c: Inline[] }
  | { t: "ol"; items: Inline[][] }
  | { t: "table"; head: string[]; rows: Inline[][][] };

function Line({ nodes }: { nodes: Inline[] }): ReactNode {
  return nodes.map((n, i) => {
    if (n.t === "b")
      return (
        <strong key={i} className="font-semibold text-ink">
          {n.v}
        </strong>
      );
    if (n.t === "i")
      return (
        <em key={i} className="italic">
          {n.v}
        </em>
      );
    if (n.t === "c")
      return (
        <code
          key={i}
          className="mono-data rounded-sm bg-panel-2 px-1 py-0.5 text-tag text-ink"
        >
          {n.v}
        </code>
      );
    return <Fragment key={i}>{n.v}</Fragment>;
  });
}

export function Prose({ blocks }: { blocks: Block[] }) {
  return (
    <div className="space-y-6">
      {blocks.map((block, i) => {
        if (block.t === "p")
          return (
            <p key={i} className="text-body leading-relaxed text-ink-dim">
              <Line nodes={block.c} />
            </p>
          );

        if (block.t === "quote")
          return (
            <blockquote
              key={i}
              className="border-l-2 border-accent pl-5 font-serif text-lead leading-relaxed text-ink"
            >
              <Line nodes={block.c} />
            </blockquote>
          );

        if (block.t === "ol")
          return (
            <ol key={i} className="space-y-4">
              {block.items.map((item, j) => (
                <li key={j} className="flex gap-4">
                  <span className="mono-data mt-1 w-6 shrink-0 text-tag tabular-nums text-ink-faint">
                    {String(j + 1).padStart(2, "0")}
                  </span>
                  <span className="text-body leading-relaxed text-ink-dim">
                    <Line nodes={item} />
                  </span>
                </li>
              ))}
            </ol>
          );

        return (
          <div
            key={i}
            className="overflow-x-auto rounded-lg border border-line bg-panel"
          >
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-line">
                  {block.head.map((h) => (
                    <th key={h} className="label px-4 py-3 align-bottom">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {block.rows.map((row, r) => (
                  <tr key={r} className="border-b border-line last:border-0">
                    {row.map((cell, c) => (
                      <td
                        key={c}
                        className="px-4 py-3 align-top text-meta leading-relaxed text-ink-dim"
                      >
                        <Line nodes={cell} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })}
    </div>
  );
}
