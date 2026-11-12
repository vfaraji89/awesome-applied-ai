"use client";
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";

/* Languages: English (the code itself), Türkçe, Español, Nederlands, 日本語.
   Translations live in public/i18n/<lang>/site.json and load in the browser; English is
   what the server renders, so a missing key always shows English, never a blank.
   The choice is stored under the same key as vfaraji89.github.io (same origin), so a
   language picked on the portfolio carries over here and back. See public/i18n/STYLE.md. */
export const LANGS = [
  { id: "en", glyph: "a", name: "English" },
  { id: "tr", glyph: "ğ", name: "Türkçe" },
  { id: "es", glyph: "ñ", name: "Español" },
  { id: "nl", glyph: "ĳ", name: "Nederlands" },
  { id: "ja", glyph: "あ", name: "日本語" },
] as const;
export type LangId = (typeof LANGS)[number]["id"];
const KEY = "vf-lang";
const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
type Dict = Record<string, string>;
const isLang = (x: unknown): x is LangId => LANGS.some((l) => l.id === x);

const Ctx = createContext<{ lang: LangId; dict: Dict; setLang: (l: LangId) => void }>({ lang: "en", dict: {}, setLang: () => {} });

function pick(): LangId {
  try {
    const q = new URLSearchParams(location.search).get("lang"); if (isLang(q)) return q;
    const s = localStorage.getItem(KEY); if (isLang(s)) return s;
  } catch { /* private mode */ }
  for (const n of navigator.languages ?? [navigator.language]) { const c = String(n).slice(0, 2).toLowerCase(); if (isLang(c)) return c; }
  return "en";
}
const fill = (s: string, vars?: Record<string, string | number>) => (vars ? s.replace(/\{(\w+)\}/g, (m, k) => (vars[k] != null ? String(vars[k]) : m)) : s);

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setL] = useState<LangId>("en");
  const [dict, setDict] = useState<Dict>({});
  const asked = useRef<LangId | null>(null);
  const load = useCallback(async (l: LangId, save: boolean) => {
    asked.current = l;
    let d: Dict = {};
    if (l !== "en") {
      try { const r = await fetch(`${base}/i18n/${l}/site.json`, { cache: "no-cache" }); if (r.ok) d = await r.json(); } catch { /* offline: English */ }
    }
    if (asked.current !== l) return; // a later choice won
    setDict(d); setL(l);
    document.documentElement.lang = l;
    if (save) {
      try { localStorage.setItem(KEY, l); } catch { /* ignore */ }
      (window as unknown as { gtag?: (...a: unknown[]) => void }).gtag?.("event", "language_change", { language: l });
    }
  }, []);
  useEffect(() => {
    load(pick(), false);
    const on = (e: StorageEvent) => { if (e.key === KEY && isLang(e.newValue)) load(e.newValue, false); };
    window.addEventListener("storage", on);
    return () => window.removeEventListener("storage", on);
  }, [load]);
  return <Ctx.Provider value={{ lang, dict, setLang: (l) => load(l, true) }}>{children}</Ctx.Provider>;
}

export const useLang = () => useContext(Ctx);
/** t("key", "English", { n: 3 }) for text built in client components. */
export function useT() {
  const { dict } = useContext(Ctx);
  return (k: string, en: string, vars?: Record<string, string | number>) => fill(dict[k] ?? en, vars);
}
/** <T k="key">English</T>: plain text, English as the fallback. */
export function T({ k, children, vars }: { k: string; children: string; vars?: Record<string, string | number> }) {
  const { dict } = useContext(Ctx);
  return <>{fill(dict[k] ?? children, vars)}</>;
}
/** <TH k="key">English <b>with markup</b></TH>: the translation may carry our own <b>, <mark>, <i>. */
export function TH({ k, children, vars }: { k: string; children: ReactNode; vars?: Record<string, string | number> }) {
  const { dict } = useContext(Ctx);
  const v = dict[k];
  // internal links in a translation get the site's base path, like next/link would add
  return v != null ? <span dangerouslySetInnerHTML={{ __html: fill(v, vars).replace(/href="\//g, `href="${base}/`) }} /> : <>{children}</>;
}

/** The language bead in the header: the current letter; opens the five language beads. */
export function LangPicker() {
  const { lang, setLang } = useContext(Ctx);
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const t = useT();
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent | KeyboardEvent) => { if (e instanceof KeyboardEvent ? e.key === "Escape" : !box.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", close); document.addEventListener("keydown", close);
    return () => { document.removeEventListener("mousedown", close); document.removeEventListener("keydown", close); };
  }, [open]);
  const cur = LANGS.find((l) => l.id === lang)!;
  return (
    <div className="lgp" ref={box}>
      <button type="button" className="lgp-btn" aria-haspopup="true" aria-expanded={open} aria-label={t("lang.label", "Language") + ": " + cur.name} onClick={() => setOpen((o) => !o)}>
        <b key={cur.id} className="lgp-glyph" lang={cur.id}>{cur.glyph}</b>
      </button>
      {open && (
        <div className="lgp-pop" role="group" aria-label={t("lang.label", "Language")}>
          <span className="lgp-k">{t("lang.label", "Language")}</span>
          {LANGS.map((l) => (
            <button key={l.id} type="button" lang={l.id} className="lgp-bead" aria-pressed={l.id === lang} onClick={() => { setLang(l.id); setOpen(false); }}>
              <i aria-hidden="true">{l.glyph}</i>{l.name}
            </button>
          ))}
          {lang !== "en" && <p className="lgp-note">{t("lang.note", "The radar entries, tools, jargon and problems stay in English for now.")}</p>}
        </div>
      )}
    </div>
  );
}
