/** Send a GA4 event if analytics loaded. Never throws, never blocks the UI. */
type Params = Record<string, string | number | boolean>;
export function track(name: string, params: Params = {}) {
  try { (window as unknown as { gtag?: (...a: unknown[]) => void }).gtag?.("event", name, params); } catch { /* analytics is optional */ }
}
