import Link from "next/link";
import { Check, AlertTriangle, Circle } from "lucide-react";
import { Seo } from "../components/Seo";
import { MassironNav } from "../components/MassironNav";
import { MassironFooter } from "../components/MassironFooter";

const products = [
  {
    id: "deepstrain",
    name: "deepstrain",
    version: "1.0.1",
    status: "needs-fixes",
    statusLabel: "Needs Fixes",
    color: "#22c55e",
    metrics: [
      { label: "python files", value: "179" },
      { label: "tests", value: "416  (402 pass)" },
      { label: "turkish files", value: "24" },
      { label: "git commits", value: "265" },
    ],
    issues: ["14 failing tests (SQLite)", "24 files with Turkish text"],
    href: "/deepstrain",
  },
  {
    id: "atlas",
    name: "atlas",
    version: "0.13.0",
    status: "needs-fixes",
    statusLabel: "Needs Fixes",
    color: "#22d3ee",
    metrics: [
      { label: "python files", value: "387" },
      { label: "tests", value: "49" },
      { label: "turkish files", value: "228" },
      { label: "git commits", value: "152" },
    ],
    issues: ["228 files with Turkish text (largest debt)", "4 failing tests (signal_producer)"],
    href: "/atlas",
  },
  {
    id: "nodestone",
    name: "nodestone",
    version: "0.1.0",
    status: "ready",
    statusLabel: "Ready",
    color: "#0ea5e9",
    metrics: [
      { label: "python files", value: "129" },
      { label: "tests", value: "10" },
      { label: "turkish files", value: "0" },
      { label: "git commits", value: "12" },
    ],
    issues: [],
    href: "/nodestone",
  },
  {
    id: "massiron",
    name: "massiron",
    version: "0.1.2",
    status: "draft",
    statusLabel: "Draft",
    color: "#f59e0b",
    metrics: [
      { label: "python files", value: "9" },
      { label: "tests", value: "0" },
      { label: "turkish files", value: "0" },
      { label: "git commits", value: "5" },
    ],
    issues: ["No tests", "Early stage (5 commits)", "Console output uses Turkish chars"],
    href: "#",
  },
  {
    id: "adauto",
    name: "adauto",
    version: "—",
    status: "draft",
    statusLabel: "Info Pending",
    color: "#fb923c",
    metrics: [
      { label: "status", value: "not scanned" },
      { label: "turkish files", value: "?" },
      { label: "tests", value: "?" },
      { label: "git commits", value: "?" },
    ],
    issues: ["Full scan not yet performed"],
    href: "/adauto",
  },
  {
    id: "blueprint",
    name: "product-blueprint",
    version: "0.1.0",
    status: "needs-fixes",
    statusLabel: "Needs Fixes",
    color: "#8b5cf6",
    metrics: [
      { label: "source files", value: "83  (ts/tsx)" },
      { label: "tests", value: "0" },
      { label: "turkish files", value: "1" },
      { label: "pages", value: "33 ui + 38 api" },
    ],
    issues: ["Turkish comment in dashboard.tsx", "No tests", "Pages Router (not App Router)"],
    href: "/",
  },
];

const readyCount = products.filter((p) => p.status === "ready").length;
const needsFixesCount = products.filter((p) => p.status === "needs-fixes").length;
const draftCount = products.filter((p) => p.status === "draft").length;

function StatusBadge({ status, label, color }: { status: string; label: string; color: string }) {
  const dotColor =
    status === "ready" ? "#22c55e" : status === "needs-fixes" ? "#eab308" : "#6b7280";
  return (
    <span className="inline-flex items-center gap-1.5 font-mono text-xs">
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: dotColor }} />
      <span style={{ color: dotColor }}>{label}</span>
    </span>
  );
}

function DependencyArrow() {
  return (
    <svg className="w-5 h-5 flex-shrink-0 text-[#2a2a2a]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M5 12h14M13 5l7 7-7 7" />
    </svg>
  );
}

export default function StatusPage() {
  return (
    <>
      <Seo
        title="Status — massiron"
        description="Live status dashboard for all massiron products: DeepStrain, Atlas, Nodestone, Massiron, Adauto."
        path="/status"
      />
      <MassironNav />

      <section style={{ background: "#0a0a0a", minHeight: "100vh" }} className="pt-20 pb-24">
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: "linear-gradient(#1e1e1e 1px,transparent 1px),linear-gradient(90deg,#1e1e1e 1px,transparent 1px)", backgroundSize: "48px 48px", opacity: 0.5 }} />

        <div className="relative z-10 max-w-6xl mx-auto px-5">

          {/* HEADER */}
          <div className="flex items-baseline gap-4 mb-8">
            <h1 className="font-mono font-black text-white text-2xl tracking-tight">status</h1>
            <div className="flex-1 h-px bg-[#1e1e1e]" />
          </div>

          {/* SUMMARY BAR */}
          <div className="flex flex-wrap items-center gap-4 mb-10 font-mono text-xs text-[#4a4a4a] border border-[#1e1e1e] px-5 py-3"
            style={{ background: "#0d0d0d" }}>
            <span className="text-white font-bold">{products.length} products</span>
            <span className="w-px h-4 bg-[#1e1e1e]" />
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> {readyCount} ready
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" /> {needsFixesCount} needs fixes
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-500" /> {draftCount} draft
            </span>
            <span className="ml-auto text-[#2a2a2a]">last updated: 2026-06-12</span>
          </div>

          {/* PRODUCT CARDS */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-16">
            {products.map((p) => (
              <Link key={p.id} href={p.href}
                className="group block border border-[#1e1e1e] hover:border-[#3a3a3a] transition-colors"
                style={{ background: "#0d0d0d" }}>
                <div className="px-5 py-5">
                  {/* header row */}
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <span className="font-mono font-bold text-white text-sm">{p.name}</span>
                      <span className="font-mono text-[10px] text-[#4a4a4a] ml-2">v{p.version}</span>
                    </div>
                    <StatusBadge status={p.status} label={p.statusLabel} color={p.color} />
                  </div>

                  {/* metric rows */}
                  <div className="space-y-1 mb-3">
                    {p.metrics.map((m) => (
                      <div key={m.label} className="flex items-center justify-between font-mono text-xs">
                        <span className="text-[#4a4a4a]">{m.label}</span>
                        <span className="text-[#8896a8]">{m.value}</span>
                      </div>
                    ))}
                  </div>

                  {/* issues */}
                  {p.issues.length > 0 && (
                    <div className="border-t border-[#1e1e1e] pt-3 mt-3 space-y-1">
                      {p.issues.map((issue) => (
                        <div key={issue} className="flex items-start gap-1.5 font-mono text-[10px] text-yellow-600">
                          <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                          <span>{issue}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {p.issues.length === 0 && (
                    <div className="border-t border-[#1e1e1e] pt-3 mt-3">
                      <div className="flex items-center gap-1.5 font-mono text-[10px] text-green-700">
                        <Check className="w-3 h-3" />
                        <span>no known issues</span>
                      </div>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>

          {/* DEPENDENCY FLOW */}
          <div className="border border-[#1e1e1e] p-6" style={{ background: "#0d0d0d" }}>
            <div className="font-mono text-[10px] text-[#2a2a2a] uppercase tracking-[0.3em] mb-6">// product relationships</div>
            <div className="flex flex-wrap items-center gap-3 font-mono text-xs">
              <span className="text-strain-400 font-bold">DeepStrain</span>
              <span className="text-[#2a2a2a] text-[10px]">uses</span>
              <DependencyArrow />
              <span className="text-cyan-400 font-bold">Atlas</span>
              <span className="w-px h-6 bg-[#1e1e1e] mx-2" />
              <span className="text-strain-400 font-bold">DeepStrain</span>
              <span className="text-[#2a2a2a] text-[10px]">+</span>
              <span className="text-cyan-400 font-bold">Atlas</span>
              <span className="text-[#2a2a2a] text-[10px]">+</span>
              <span className="text-orange-400 font-bold">Adauto</span>
              <DependencyArrow />
              <span className="text-amber-400 font-bold">Massiron</span>
              <span className="text-[#2a2a2a] text-[10px]">(distribution)</span>
              <span className="w-px h-6 bg-[#1e1e1e] mx-2" />
              <span className="text-sky-400 font-bold">Nodestone</span>
              <DependencyArrow />
              <span className="text-[#4a4a4a]">all products</span>
              <span className="text-[#2a2a2a] text-[10px]">(context)</span>
              <span className="w-px h-6 bg-[#1e1e1e] mx-2" />
              <span className="text-violet-400 font-bold">massiron.com</span>
              <DependencyArrow />
              <span className="text-[#4a4a4a]">Product-Blueprint</span>
            </div>
          </div>

        </div>
      </section>

      <MassironFooter />
    </>
  );
}
