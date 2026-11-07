import { Fragment, type ReactNode } from "react";

export type Inline = { t: "text"; v: string } | { t: "b"; v: string } | { t: "i"; v: string } | { t: "c"; v: string };
export type Block =
  | { t: "p"; c: Inline[] }
  | { t: "quote"; c: Inline[] }
  | { t: "ol"; items: Inline[][] }
  | { t: "table"; head: string[]; rows: Inline[][][] };

function Line({ nodes }: { nodes: Inline[] }): ReactNode {
  return nodes.map((n, i) => {
    if (n.t === "b") return <strong key={i}>{n.v}</strong>;
    if (n.t === "i") return <em key={i}>{n.v}</em>;
    if (n.t === "c") return <code key={i} className="mono">{n.v}</code>;
    return <Fragment key={i}>{n.v}</Fragment>;
  });
}

export function Prose({ blocks }: { blocks: Block[] }) {
  return (
    <div className="prose">
      {blocks.map((b, i) => {
        if (b.t === "p") return <p key={i}><Line nodes={b.c} /></p>;
        if (b.t === "quote") return <blockquote key={i}><Line nodes={b.c} /></blockquote>;
        if (b.t === "ol")
          return (
            <ol key={i}>
              {b.items.map((it, j) => <li key={j}><span className="mono n">{String(j + 1).padStart(2, "0")}</span><span><Line nodes={it} /></span></li>)}
            </ol>
          );
        return (
          <div key={i} className="table-wrap">
            <table>
              <thead><tr>{b.head.map((h) => <th key={h}>{h}</th>)}</tr></thead>
              <tbody>{b.rows.map((r, j) => <tr key={j}>{r.map((c, k) => <td key={k}><Line nodes={c} /></td>)}</tr>)}</tbody>
            </table>
          </div>
        );
      })}
      <style>{`
        .prose { display: flex; flex-direction: column; gap: 20px; font-size: 1.05rem; color: var(--sec); max-width: 72ch; }
        .prose strong { color: var(--ink); }
        .prose code { font-size: .88em; background: var(--paper); padding: 1px 6px; border-radius: 5px; color: var(--ink); }
        .prose blockquote { margin: 0; padding-left: 18px; border-left: 3px solid var(--rust); color: var(--ink); font-size: 1.15rem; }
        .prose ol { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 12px; }
        .prose li { display: flex; gap: 14px; } .prose li .n { color: var(--rust-deep); font-size: .8rem; padding-top: 4px; }
        .table-wrap { overflow-x: auto; border: 1px solid var(--line); border-radius: 12px; }
        .prose table { border-collapse: collapse; width: 100%; font-size: .92rem; }
        .prose th, .prose td { padding: 10px 14px; text-align: left; border-bottom: 1px solid var(--line); vertical-align: top; }
        .prose th { font-family: var(--font-mono), monospace; font-size: .74rem; letter-spacing: .08em; text-transform: uppercase; color: var(--muted); font-weight: 400; }
      `}</style>
    </div>
  );
}
