import type { LayerId } from "@/lib/types";

/**
 * Three parallel scales at x = 0, x = t·W and x = W carry f(u), h(w) and g(v).
 * A straight line across them reads off f(u) + g(v) = h(w), so every relation
 * below is stated in that additive form even when the equation on the page is
 * a product or a power.
 */
export interface Scale {
  name: string;
  unit: string;
  f: (x: number) => number;
  inv: (y: number) => number;
  lo: number;
  hi: number;
  ticks: number[];
  format: (x: number) => string;
  step: number;
}

/** The middle scale's range falls out of the two outer ranges, so it is derived. */
export type MidScale = Omit<Scale, "lo" | "hi" | "step">;

export interface Nomogram {
  id: LayerId;
  numeral: string;
  layer: string;
  title: string;
  tex: string;
  left: Scale;
  right: Scale;
  middle: MidScale;
  defaults: [number, number];
  read: (u: number, v: number, w: number) => string;
  caveat: string;
}

const log = Math.log10;
const pow = (y: number) => 10 ** y;

function si(n: number, digits = 0): string {
  const abs = Math.abs(n);
  if (abs >= 1e12) return `${(n / 1e12).toFixed(digits)}T`;
  if (abs >= 1e9) return `${(n / 1e9).toFixed(digits)}B`;
  if (abs >= 1e6) return `${(n / 1e6).toFixed(digits)}M`;
  if (abs >= 1e3) return `${(n / 1e3).toFixed(digits)}k`;
  return n.toFixed(digits);
}

function bytes(n: number): string {
  if (n >= 1e12) return `${(n / 1e12).toFixed(n < 1e13 ? 1 : 0)} TB`;
  if (n >= 1e9) return `${(n / 1e9).toFixed(n < 1e10 ? 1 : 0)} GB`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(0)} MB`;
  return `${(n / 1e3).toFixed(0)} kB`;
}

function pct(n: number, digits = 1): string {
  return `${(n * 100).toFixed(digits)}%`;
}

function tiny(n: number): string {
  if (n >= 0.01) return n.toFixed(n >= 0.1 ? 2 : 3);
  return n.toExponential(0).replace("e-", "e−");
}

export const nomograms: Nomogram[] = [
  {
    id: "retrieval",
    numeral: "01",
    layer: "Retrieval",
    title: "HNSW resident memory",
    tex: "M \\;\\approx\\; N\\,(4d + 8m), \\quad m = 16",
    defaults: [1e7, 1536],
    left: {
      name: "vectors",
      unit: "N",
      f: log,
      inv: pow,
      lo: 1e5,
      hi: 1e9,
      ticks: [1e5, 3e5, 1e6, 3e6, 1e7, 3e7, 1e8, 3e8, 1e9],
      format: (n) => si(n),
      step: 0.02,
    },
    right: {
      name: "dimensions",
      unit: "d",
      f: (d) => log(4 * d + 128),
      inv: (y) => (pow(y) - 128) / 4,
      lo: 128,
      hi: 4096,
      ticks: [128, 256, 384, 512, 768, 1024, 1536, 2048, 3072, 4096],
      format: (d) => String(Math.round(d)),
      step: 0.02,
    },
    middle: {
      name: "resident memory",
      unit: "M",
      f: log,
      inv: pow,
      ticks: [1e8, 1e9, 1e10, 1e11, 1e12, 1e13],
      format: bytes,
    },
    read: (n, d, m) =>
      `${si(n)} vectors at ${Math.round(d)} dimensions need ${bytes(m)} of RAM, resident, before quantization.`,
    caveat:
      "That figure — not query latency — is what pushes teams to quantization or to object-storage-native engines.",
  },
  {
    id: "memory",
    numeral: "02",
    layer: "Memory",
    title: "Exponential recency decay",
    tex: "\\mathrm{rec} \\;=\\; e^{-\\Delta t / \\tau}",
    defaults: [30, 14],
    left: {
      name: "age of the fact",
      unit: "Δt · days",
      f: log,
      inv: pow,
      lo: 0.5,
      hi: 365,
      ticks: [0.5, 1, 2, 5, 10, 30, 60, 90, 180, 365],
      format: (d) => (d < 1 ? `${d * 24}h` : `${Math.round(d)}d`),
      step: 0.02,
    },
    right: {
      name: "decay constant",
      unit: "τ · days",
      f: (t) => -log(t),
      inv: (y) => pow(-y),
      lo: 180,
      hi: 0.5,
      ticks: [180, 90, 60, 30, 14, 7, 3, 1, 0.5],
      format: (d) => (d < 1 ? `${d * 24}h` : `${d}d`),
      step: 0.02,
    },
    middle: {
      name: "recency weight",
      unit: "rec",
      f: (r) => log(-Math.log(r)),
      inv: (y) => Math.exp(-pow(y)),
      ticks: [0.99, 0.95, 0.9, 0.8, 0.6, 0.37, 0.2, 0.1, 0.03, 0.01, 1e-3, 1e-6],
      format: tiny,
    },
    read: (dt, tau, rec) =>
      `A fact ${Math.round(dt)} days old under a ${tau < 1 ? `${tau * 24}-hour` : `${Math.round(tau)}-day`} decay constant carries weight ${tiny(rec)}.`,
    caveat:
      "Decay discounts age. It never marks the old fact false — a stale fact with high similarity still outranks a fresh correction.",
  },
  {
    id: "caching",
    numeral: "03",
    layer: "Caching",
    title: "Cache break-even, in reads",
    tex: "n^{*} \\;=\\; \\frac{w - 1}{1 - r}",
    defaults: [1.25, 0.1],
    left: {
      name: "write multiplier",
      unit: "w",
      f: (w) => log(w - 1),
      inv: (y) => pow(y) + 1,
      lo: 1.05,
      hi: 3,
      ticks: [1.05, 1.1, 1.25, 1.5, 2, 2.5, 3],
      format: (w) => `${w.toFixed(2)}×`,
      step: 0.02,
    },
    right: {
      name: "read multiplier",
      unit: "r",
      f: (r) => -log(1 - r),
      inv: (y) => 1 - pow(-y),
      lo: 0,
      hi: 0.9,
      ticks: [0, 0.1, 0.25, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9],
      format: (r) => `${r.toFixed(2)}×`,
      step: 0.015,
    },
    middle: {
      name: "break-even",
      unit: "n*",
      f: log,
      inv: pow,
      ticks: [0.05, 0.1, 0.25, 0.5, 1, 2, 5, 10, 20],
      format: (n) => (n < 1 ? n.toFixed(2) : n.toFixed(n < 10 ? 1 : 0)),
    },
    read: (w, r, n) =>
      `At a ${w.toFixed(2)}× write premium and a ${r.toFixed(2)}× read rate the cache pays for itself after ${n.toFixed(2)} reads.`,
    caveat:
      "Every published provider cache sits below one read, so caching pays from the first reuse. The lever is hit rate, not whether to cache.",
  },
  {
    id: "orchestration",
    numeral: "04",
    layer: "Orchestration",
    title: "Reliability compounds multiplicatively",
    tex: "P_{\\text{success}} \\;=\\; p^{\\,n}",
    defaults: [20, 0.99],
    left: {
      name: "steps",
      unit: "n",
      f: log,
      inv: pow,
      lo: 2,
      hi: 100,
      ticks: [2, 3, 5, 8, 12, 20, 30, 50, 75, 100],
      format: (n) => String(Math.round(n)),
      step: 0.02,
    },
    right: {
      name: "per-step reliability",
      unit: "p",
      f: (p) => log(-Math.log(p)),
      inv: (y) => Math.exp(-pow(y)),
      lo: 0.999,
      hi: 0.9,
      ticks: [0.999, 0.998, 0.995, 0.99, 0.98, 0.97, 0.95, 0.93, 0.9],
      format: (p) => pct(p, p >= 0.995 ? 1 : 0),
      step: 0.015,
    },
    middle: {
      name: "end-to-end success",
      unit: "P",
      f: (P) => log(-Math.log(P)),
      inv: (y) => Math.exp(-pow(y)),
      ticks: [0.99, 0.95, 0.9, 0.8, 0.6, 0.4, 0.2, 0.1, 0.03, 0.01, 3e-3, 1e-3, 1e-4],
      format: (P) => (P >= 0.001 ? pct(P, P >= 0.1 ? 1 : 2) : P.toExponential(0)),
    },
    read: (n, p, P) =>
      `A ${Math.round(n)}-step run at ${pct(p, p >= 0.995 ? 1 : 0)} per step finishes clean ${pct(P, P >= 0.1 ? 1 : 2)} of the time.`,
    caveat:
      "This is the entire argument for durable execution. You cannot reach acceptable end-to-end reliability by improving prompts.",
  },
  {
    id: "evaluation",
    numeral: "05",
    layer: "Evaluation",
    title: "Judge agreement — Cohen's κ",
    tex: "\\kappa \\;=\\; \\frac{p_o - p_e}{1 - p_e}",
    defaults: [0.8, 0.5],
    left: {
      name: "observed agreement",
      unit: "p₀",
      f: (p) => -log(1 - p),
      inv: (y) => 1 - pow(-y),
      lo: 0.5,
      hi: 0.99,
      ticks: [0.5, 0.6, 0.7, 0.8, 0.85, 0.9, 0.95, 0.97, 0.99],
      format: (p) => pct(p, 0),
      step: 0.015,
    },
    right: {
      name: "chance agreement",
      unit: "pₑ",
      f: (p) => log(1 - p),
      inv: (y) => 1 - pow(y),
      lo: 0.9,
      hi: 0.1,
      ticks: [0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1],
      format: (p) => pct(p, 0),
      step: 0.015,
    },
    middle: {
      name: "Cohen's κ",
      unit: "κ",
      f: (k) => -log(1 - k),
      inv: (y) => 1 - pow(-y),
      ticks: [-4, -2, -1, -0.5, 0, 0.2, 0.4, 0.6, 0.75, 0.85, 0.9, 0.95],
      format: (k) => k.toFixed(2),
    },
    read: (po, pe, k) =>
      `Agreeing ${pct(po, 0)} of the time against ${pct(pe, 0)} chance agreement scores κ = ${k.toFixed(2)}.`,
    caveat:
      "Below κ = 0.6 the judge is close to noise however confident it sounds. Never ship an LLM judge without this number.",
  },
  {
    id: "governance",
    numeral: "06",
    layer: "Governance",
    title: "False blocks per day",
    tex: "B_{\\text{false}} \\;=\\; \\mathrm{FPR} \\times Q_{\\text{day}}",
    defaults: [0.01, 1e6],
    left: {
      name: "false positive rate",
      unit: "FPR",
      f: log,
      inv: pow,
      lo: 1e-4,
      hi: 0.1,
      ticks: [1e-4, 3e-4, 1e-3, 3e-3, 0.01, 0.03, 0.05, 0.1],
      format: (r) => `${(r * 100).toFixed(r < 0.01 ? 2 : 1)}%`,
      step: 0.02,
    },
    right: {
      name: "requests per day",
      unit: "Q",
      f: log,
      inv: pow,
      lo: 1e3,
      hi: 1e8,
      ticks: [1e3, 1e4, 1e5, 1e6, 1e7, 1e8],
      format: (q) => si(q),
      step: 0.02,
    },
    middle: {
      name: "legitimate requests blocked",
      unit: "B",
      f: log,
      inv: pow,
      ticks: [0.1, 1, 10, 100, 1e3, 1e4, 1e5, 1e6, 1e7],
      format: (b) => (b < 10 ? b.toFixed(1) : si(b)),
    },
    read: (fpr, q, b) =>
      `A filter at ${(fpr * 100).toFixed(fpr < 0.01 ? 2 : 1)}% FPR on ${si(q)} requests a day blocks ${si(b)} legitimate ones.`,
    caveat:
      "Vendors quote recall. The number that decides whether you can ship is false positive rate at your own traffic volume.",
  },
];

export interface Geometry {
  tx: number;
  yLeft: (u: number) => number;
  yRight: (v: number) => number;
  yMiddle: (w: number) => number;
  fromYLeft: (y: number) => number;
  fromYRight: (y: number) => number;
  solve: (u: number, v: number) => number;
  /** Middle-scale values at the bottom and top of the frame. */
  midLo: number;
  midHi: number;
}

export function geometry(n: Nomogram, height: number): Geometry {
  const { left: L, right: R, middle: M } = n;

  const df = L.f(L.hi) - L.f(L.lo);
  const dg = R.f(R.hi) - R.f(R.lo);
  const m1 = height / df;
  const m2 = height / dg;
  const m3 = (m1 * m2) / (m1 + m2);
  const tx = m1 / (m1 + m2);
  const base = L.f(L.lo) + R.f(R.lo);

  const up = (y: number) => height - y;

  return {
    tx,
    yLeft: (u) => up(m1 * (L.f(u) - L.f(L.lo))),
    yRight: (v) => up(m2 * (R.f(v) - R.f(R.lo))),
    yMiddle: (w) => up(m3 * (M.f(w) - base)),
    fromYLeft: (y) => L.inv(up(y) / m1 + L.f(L.lo)),
    fromYRight: (y) => R.inv(up(y) / m2 + R.f(R.lo)),
    solve: (u, v) => M.inv(L.f(u) + R.f(v)),
    midLo: M.inv(L.f(L.lo) + R.f(R.lo)),
    midHi: M.inv(L.f(L.hi) + R.f(R.hi)),
  };
}

export const clamp = (x: number, a: number, b: number) =>
  Math.min(Math.max(x, Math.min(a, b)), Math.max(a, b));
