/**
 * MassironMark — the three forged bars.
 * Three horizontal bars, top-to-bottom: cyan → indigo → amber.
 * Represents three tools fused into one intelligence layer.
 */
import React from "react";

interface MassironMarkProps {
  size?: number;
  className?: string;
}

export function MassironMark({ size = 16, className }: MassironMarkProps) {
  const s = size;
  // Bar dimensions scaled to the mark's natural 16×16 grid
  const barH = s * (2.5 / 16);
  const barW = s * (12 / 16);
  const x    = s * (2 / 16);
  const rx   = barH / 2;
  return (
    <svg
      width={s} height={s}
      viewBox="0 0 16 16"
      aria-hidden="true"
      className={className}
      style={{ flexShrink: 0 }}
    >
      <rect x={x} y={s * 3/16}    width={barW} height={barH} rx={rx} fill="#22d3ee" />
      <rect x={x} y={s * 6.75/16} width={barW} height={barH} rx={rx} fill="#6366f1" />
      <rect x={x} y={s * 10.5/16} width={barW} height={barH} rx={rx} fill="#f59e0b" />
    </svg>
  );
}
