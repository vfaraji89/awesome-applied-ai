"use client";
import { useEffect, useState } from "react";
import { useT } from "@/i18n/lang";

/* Google Analytics 4, privacy first.
   - Same property as vfaraji89.github.io: both live on one domain, so a visit
     from the portfolio into this guide is one journey. content_group splits them.
   - Consent mode v2: storage denied until the visitor says yes. The choice is
     stored under the same key as the portfolio's, so it is asked once for both.
   - Page views on client-side navigation come from GA4's enhanced measurement
     (browser history events), so none are sent by hand here.
   - ?ga_debug=1 turns on DebugView for that visit. */
const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? "G-GTZW5NNEZ5";
const KEY = "vf-consent";
/** No personal data reaches Google: emails, phone numbers and mailto/tel links are
 *  redacted, values are capped at 100 characters. Free text (a pasted CV or job
 *  description) is never sent at all; only its length. */
export function clean(p: Record<string, unknown>) {
  const o: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(p)) {
    o[k] = typeof v !== "string" ? v : v
      .replace(/^(mailto|tel):.*/i, "$1:[redacted]")
      .replace(/[\w.+-]+@[\w-]+(\.[\w-]+)+/g, "[email]")
      .replace(/\+?\d[\d\s().-]{8,}\d/g, "[number]")
      .slice(0, 100);
  }
  return o;
}
const redactUrl = (u: string) => u.replace(/([?&])(q|email|name|jd|cv)=[^&#]*/g, "$1$2=redacted");
type W = Window & { dataLayer?: unknown[]; gtag?: (...a: unknown[]) => void };

export function Analytics() {
  const [ask, setAsk] = useState(false);
  const t = useT();

  useEffect(() => {
    if (!GA_ID || location.hostname === "localhost") return;
    const w = window as W;
    w.dataLayer = w.dataLayer || [];
    // Privacy guard: every event's values pass through clean() before they reach Google.
    w.gtag = function gtag() { // eslint-disable-line prefer-rest-params
      if (arguments[0] === "event" && arguments[2]) arguments[2] = clean(arguments[2] as Record<string, unknown>);
      w.dataLayer!.push(arguments);
    };
    let saved: string | null = null;
    try { saved = localStorage.getItem(KEY); } catch { /* private mode */ }
    w.gtag("consent", "default", { ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied", analytics_storage: saved === "yes" ? "granted" : "denied", wait_for_update: 500 });
    w.gtag("js", new Date());
    const debug = new URLSearchParams(location.search).has("ga_debug");
    const section = location.pathname.split("/").filter(Boolean).find((p) => p !== "awesome-applied-ai") ?? "home";
    w.dataLayer.push({ event: "vf_context", site: "awesome-applied-ai", page_group: section, consent_state: saved === "yes" ? "granted" : "denied" });
    w.gtag("config", GA_ID, { content_group: "awesome-applied-ai", page_location: redactUrl(location.href), site_section: section, ...(debug ? { debug_mode: true } : {}) });
    const s = document.createElement("script");
    s.async = true; s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
    document.head.appendChild(s);
    if (saved === null) { const t = setTimeout(() => setAsk(true), 1500); return () => clearTimeout(t); }
  }, []);

  // Clicks that matter: the repo, the portfolio, the CV, and sources behind the data.
  useEffect(() => {
    const on = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest?.("a");
      const g = (window as W).gtag;
      if (!a || !g) return;
      const href = a.getAttribute("href") ?? "";
      const name = /github\.com\/vfaraji89\/awesome-applied-ai/.test(href) ? "github_repo"
        : /vfaraji89\.github\.io\/?(#.*|index\.html)?$/.test(href) || /vfaraji89\.github\.io\/(fit|updates)/.test(href) ? "portfolio_click"
        : /vahid-faraji-cv\.pdf/.test(href) ? "cv_download"
        : /calendar\.app\.google/.test(href) ? "book_call" : null;
      if (name) g("event", name, { link_url: href, link_text: (a.textContent ?? "").trim().slice(0, 80) });
    };
    document.addEventListener("click", on, true);
    return () => document.removeEventListener("click", on, true);
  }, []);

  const choose = (v: "yes" | "no") => {
    try { localStorage.setItem(KEY, v); } catch { /* ignore */ }
    if (v === "yes") (window as W).gtag?.("consent", "update", { analytics_storage: "granted" });
    setAsk(false);
  };
  if (!ask) return null;
  return (
    <div className="consent" role="region" aria-label="Analytics consent">
      <span className="consent-bead" aria-hidden="true" />
      <span title={t("consent.title", "Google Analytics, only to count visits. No ads, no tracking across sites.")}>{t("consent.ask", "One cookie to count visits?")}</span>
      <button type="button" onClick={() => choose("no")} aria-label={t("consent.no_aria", "No, do not use an analytics cookie")}>{t("consent.no", "No")}</button>
      <button type="button" className="yes" onClick={() => choose("yes")} aria-label={t("consent.yes_aria", "Sure, use an analytics cookie")}>{t("consent.yes", "Sure")}</button>
      <style>{`
        .consent { position: fixed; left: 16px; bottom: 16px; z-index: 90; max-width: calc(100vw - 32px); display: flex; align-items: center; gap: 10px; padding: 7px 8px 7px 12px; border-radius: 999px; background: var(--paper); color: var(--ink); border: 1px solid rgba(180,138,92,.45); box-shadow: 0 12px 26px -16px rgba(60,30,10,.55); font-size: 12.5px; font-weight: 500; animation: consent-in .5s cubic-bezier(.34,1.56,.64,1) both; }
        .consent-bead { flex: none; width: 14px; height: 14px; border-radius: 50%; background: radial-gradient(circle at 34% 30%, #ff9d8f, #e0301e 45%, #9e1a0c); }
        .consent button { font: inherit; font-size: 12px; font-weight: 600; padding: 7px 12px; border-radius: 999px; cursor: pointer; background: transparent; color: var(--sec); border: 1px solid transparent; }
        .consent button.yes { background: var(--ink); color: var(--bg, #fff); border-color: var(--ink); }
        @keyframes consent-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
        @media (prefers-reduced-motion: reduce) { .consent { animation: none; } }
      `}</style>
    </div>
  );
}
