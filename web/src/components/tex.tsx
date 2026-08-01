import katex from "katex";

export function Tex({ children, block }: { children: string; block?: boolean }) {
  const html = katex.renderToString(children, {
    displayMode: block,
    throwOnError: false,
    strict: false,
    trust: false,
  });

  return (
    <span
      className={block ? "block overflow-x-auto py-1" : "inline-block"}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
