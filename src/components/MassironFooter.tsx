/**
 * MassironFooter — shared footer for all pages.
 * See BRAND.md §8 for spec.
 */
import React from "react";
import Link from "next/link";
import { MassironMark } from "./MassironMark";
import { WORDMARK_STYLE } from "../lib/brand";

export function MassironFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="py-8 border-t border-white/5" style={{ background: "#010d1a" }}>
      <div className="max-w-7xl mx-auto px-5 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2 font-mono text-xs select-none">
          <MassironMark size={14} />
          <span className="font-bold" style={WORDMARK_STYLE}>massiron</span>
        </Link>

        {/* Links */}
        <div className="flex flex-wrap items-center gap-5 font-mono text-xs text-slate-700">
          <Link href="/deepstrain" className="hover:text-cyan-400 transition-colors">deepstrain</Link>
          <Link href="/atlas"      className="hover:text-indigo-400 transition-colors">atlas</Link>
          <Link href="/adauto"     className="hover:text-amber-400 transition-colors">adauto</Link>
          <Link href="/bundle"     className="hover:text-slate-400 transition-colors">bundle</Link>
          <Link href="/docs"       className="hover:text-slate-400 transition-colors">docs</Link>
          <Link href="/manifesto"  className="hover:text-slate-400 transition-colors">manifesto</Link>
          <Link href="/privacy"    className="hover:text-slate-400 transition-colors">privacy</Link>
          <Link href="/terms"      className="hover:text-slate-400 transition-colors">terms</Link>
        </div>

        {/* Copyright */}
        <div className="font-mono text-xs text-slate-800">
          © {year} massiron · forged on your machine
        </div>
      </div>
    </footer>
  );
}
