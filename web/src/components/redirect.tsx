"use client";
import { useEffect } from "react";
import Link from "next/link";

/* Old links: send them to where the page lives now. */
export function Redirect({ to }: { to: string }) {
  useEffect(() => { window.location.replace(`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${to}${window.location.hash}`); }, [to]);
  return <section className="section"><div className="wrap"><p className="lead">This page moved. <Link href={to}>Go to the new page →</Link></p></div></section>;
}
