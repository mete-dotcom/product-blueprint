/**
 * MassironNav — shared top nav for all pages.
 * See BRAND.md §7 for spec.
 */
import React from "react";
import Link from "next/link";
import { MassironMark } from "./MassironMark";
import { WORDMARK_STYLE } from "../lib/brand";

type Product = "deepstrain" | "atlas" | "adauto" | "nodestone" | null;

interface MassironNavProps {
  /** Highlight the active product link. */
  activeProduct?: Product;
}

export function MassironNav({ activeProduct = null }: MassironNavProps) {
  const link = (label: string, href: string, p: Product) => {
    const isActive = activeProduct === p;
    const colors: Record<NonNullable<Product>, string> = {
      deepstrain: "text-green-400",
      atlas:      "text-cyan-400",
      adauto:     "text-amber-400",
      nodestone:  "text-sky-400",
    };
    const base = "text-xs font-mono transition-colors";
    const color = isActive && p ? colors[p] : "text-slate-500 hover:text-slate-300";
    return (
      <Link key={href} href={href} className={`${base} ${color}`}>
        {label}
      </Link>
    );
  };

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50"
      style={{ background: "rgba(8,8,8,0.97)", backdropFilter: "blur(10px)", borderBottom: "1px solid #1e1e1e" }}
    >
      <div className="max-w-7xl mx-auto px-5 h-14 flex items-center justify-between">
        {/* Wordmark */}
        <Link href="/" className="flex items-center gap-2 select-none group">
          <MassironMark size={16} />
          <span
            className="font-mono text-sm font-bold tracking-tight"
            style={WORDMARK_STYLE}
          >
            massiron
          </span>
        </Link>

        {/* Links */}
        <div className="flex items-center gap-5">
          {link("deepstrain", "/deepstrain", "deepstrain")}
          {link("atlas", "/atlas", "atlas")}
          {link("adauto", "/adauto", "adauto")}
          {link("nodestone", "/nodestone", "nodestone")}
          <Link href="/docs"
            className={`text-xs font-mono transition-colors ${activeProduct === null ? "text-slate-500 hover:text-slate-300" : "text-slate-600 hover:text-slate-400"}`}>
            docs
          </Link>
          <Link href="/bundle"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 border border-white/10 hover:border-white/20 text-slate-300 hover:text-white text-xs font-mono rounded-md transition-colors">
            bundle <span className="text-amber-500/80">—20%</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
