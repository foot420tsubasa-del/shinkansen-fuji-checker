"use client";

import { motion } from "framer-motion";
import type { StationScene } from "@/data/station-practice/branching/types";

type Props = {
  scenes: StationScene[];
  currentSceneId: string;
  cleared: boolean;
};

/*
 * Horizontal stylised route showing one node per gameplay scene plus a
 * terminal flag. Current node pulses yellow; cleared nodes are
 * green-muted; upcoming nodes are neutral. Wrong attempts do NOT
 * advance the marker — staying-in-place is part of the visual language.
 */

export function MiniMap({ scenes, currentSceneId, cleared }: Props) {
  const gameplay = scenes.filter((s) => !s.clearOnEnter);
  const currentIndex = gameplay.findIndex((s) => s.id === currentSceneId);
  const reachedTerminal =
    cleared || (currentIndex < 0 && scenes.find((s) => s.id === currentSceneId)?.clearOnEnter);

  // Place each gameplay node at evenly-spaced x positions, alternating y
  // slightly so the polyline reads as a station route, not a flat line.
  const nodes = gameplay.map((scene, i) => ({
    id: scene.id,
    label: scene.currentLocation,
    x: 8 + (i / Math.max(1, gameplay.length - 1)) * 84,
    y: 50 + (i % 2 === 0 ? -8 : 8),
  }));
  const polyline = nodes.map((n) => `${n.x},${n.y}`).join(" ");

  return (
    <section className="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
      <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-neutral-500">
        <span>Route</span>
        <span>
          {Math.min(currentIndex + 1, gameplay.length)}/{gameplay.length}
        </span>
      </div>
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="mt-3 h-24 w-full"
        role="img"
        aria-label="Mission route progression"
      >
        <polyline
          points={polyline}
          fill="none"
          stroke="rgba(255,255,255,0.12)"
          strokeWidth={1.2}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="2 2"
          vectorEffect="non-scaling-stroke"
        />
        {nodes.map((n, i) => {
          const isCleared =
            reachedTerminal ||
            i < currentIndex ||
            (i === currentIndex && cleared);
          const isCurrent =
            !reachedTerminal && i === currentIndex && !isCleared;
          const fill = isCleared
            ? "rgba(74, 222, 128, 0.85)"
            : isCurrent
              ? "#fde047"
              : "rgba(255,255,255,0.18)";
          const stroke = isCleared
            ? "rgba(74, 222, 128, 0.4)"
            : isCurrent
              ? "rgba(253, 224, 71, 0.45)"
              : "rgba(255,255,255,0.25)";
          const r = isCurrent ? 3.2 : 2.4;
          return (
            <g key={n.id}>
              {isCurrent && (
                <motion.circle
                  cx={n.x}
                  cy={n.y}
                  r={r}
                  fill="none"
                  stroke="#fde047"
                  strokeOpacity={0.55}
                  initial={{ r, opacity: 0.9 }}
                  animate={{
                    r: [r, r + 4, r],
                    opacity: [0.9, 0.1, 0.9],
                  }}
                  transition={{ duration: 1.8, repeat: Infinity }}
                  vectorEffect="non-scaling-stroke"
                />
              )}
              <circle
                cx={n.x}
                cy={n.y}
                r={r}
                fill={fill}
                stroke={stroke}
                strokeWidth={0.8}
                vectorEffect="non-scaling-stroke"
              />
            </g>
          );
        })}
      </svg>
    </section>
  );
}
