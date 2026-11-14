"use client";
import { createContext, useContext } from "react";
import { Odometer, useInView } from "./odometer";

/* Bead count (brand/broadcast.html, C): a ranked list where each bead slides along its rod to the
   value and the number lands as the bead stops. Wrap the list; the rows read "on" from here. */
const On = createContext(false);

export function BeadCount({ className, children }: { className?: string; children: React.ReactNode }) {
  const [ref, on] = useInView<HTMLUListElement>(0.25);
  return <On.Provider value={on}><ul ref={ref} className={`${className ?? ""} bcount${on ? " on" : ""}`}>{children}</ul></On.Provider>;
}

export function CountIn({ value, i = 0 }: { value: string; i?: number }) {
  const on = useContext(On);
  return <Odometer value={value} run={on} delay={300 + i * 90} />;
}
