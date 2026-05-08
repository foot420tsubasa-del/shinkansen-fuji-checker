"use client";

import { motion } from "framer-motion";
import type { Mission } from "@/data/station-practice/missions";
import type { GameStatus } from "@/components/station-practice/store/gameStore";

type Props = {
  missions: Mission[];
  currentIndex: number;
  status: GameStatus;
};

export function MiniMapRoute({ missions, currentIndex, status }: Props) {
  const linePoints = missions
    .map((m) => `${m.mapPosition.x},${m.mapPosition.y}`)
    .join(" ");

  const currentMission = missions[currentIndex];

  return (
    <div className="mt-3 rounded-xl border border-white/5 bg-black/40 p-4">
      <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-neutral-500">
        <span>Route</span>
        <span>
          {Math.min(currentIndex + 1, missions.length)}/{missions.length}
        </span>
      </div>

      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="mt-3 h-28 w-full"
        role="img"
        aria-label="Mission progress route"
      >
        <polyline
          points={linePoints}
          fill="none"
          stroke="rgba(255,255,255,0.12)"
          strokeWidth={1.2}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="2 2"
          vectorEffect="non-scaling-stroke"
        />

        {missions.map((m, i) => {
          const isCleared =
            status === "completed" ||
            i < currentIndex ||
            (i === currentIndex && status === "mission-cleared");
          const isCurrent =
            i === currentIndex && status !== "completed" && !isCleared;

          let fill = "rgba(255,255,255,0.18)";
          let stroke = "rgba(255,255,255,0.25)";
          let r = 2.4;
          if (isCleared) {
            fill = "rgba(74, 222, 128, 0.85)";
            stroke = "rgba(74, 222, 128, 0.4)";
            r = 2.6;
          }
          if (isCurrent) {
            fill = "#fde047";
            stroke = "rgba(253, 224, 71, 0.45)";
            r = 3.2;
          }

          return (
            <g key={m.id}>
              {isCurrent && (
                <motion.circle
                  cx={m.mapPosition.x}
                  cy={m.mapPosition.y}
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
                cx={m.mapPosition.x}
                cy={m.mapPosition.y}
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

      <p className="mt-2 truncate text-[11px] leading-5 text-neutral-400">
        {status === "completed"
          ? "All five missions cleared."
          : `Now: ${currentMission.shortTitle}`}
      </p>
    </div>
  );
}
