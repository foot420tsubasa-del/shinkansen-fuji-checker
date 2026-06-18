"use client";

import Image from "next/image";
import { SAKURA_FLOORS, SAKURA_IMAGE_BASE } from "@/data/station-practice/sakura/nodes";

/**
 * Blueprint minimap for the Sakura node-navigation mission.
 *
 * Shows the current floor's top-down plan with a pulsing "you are here" marker,
 * plus a compact vertical floor rail (B3 → 1F) so the player always knows how
 * far up they have climbed. Purely presentational — state comes from the parent.
 */
export function SakuraMiniMap({
  blueprint,
  floor,
  marker,
  mapLabel,
  youAreHereLabel,
}: {
  blueprint: string;
  floor: string;
  marker: { x: number; y: number };
  mapLabel: string;
  youAreHereLabel: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-neutral-400">
          {mapLabel}
        </span>
        <span className="rounded-full bg-yellow-300/15 px-2 py-0.5 text-[11px] font-semibold text-yellow-300">
          {floor}
        </span>
      </div>
      <div className="flex gap-3">
        {/* Floor rail */}
        <ol
          className="flex flex-col justify-between py-1 text-[11px] font-semibold"
          aria-hidden
        >
          {SAKURA_FLOORS.map((f) => (
            <li
              key={f}
              className={[
                "flex h-6 w-7 items-center justify-center rounded-md",
                f === floor
                  ? "bg-yellow-300 text-black"
                  : "bg-white/5 text-neutral-500",
              ].join(" ")}
            >
              {f}
            </li>
          ))}
        </ol>

        {/* Blueprint with marker */}
        <div className="relative aspect-[4/3] flex-1 overflow-hidden rounded-lg border border-white/10 bg-black/30">
          <Image
            src={`${SAKURA_IMAGE_BASE}/${blueprint}.webp`}
            alt={`${mapLabel} — ${floor}`}
            fill
            sizes="(max-width: 1024px) 100vw, 320px"
            className="object-contain"
          />
          <span
            className="absolute z-10 -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${marker.x}%`, top: `${marker.y}%` }}
          >
            <span className="relative flex h-3.5 w-3.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-yellow-300/70" />
              <span className="relative inline-flex h-3.5 w-3.5 rounded-full border-2 border-black bg-yellow-300" />
            </span>
            <span className="sr-only">{youAreHereLabel}</span>
          </span>
        </div>
      </div>
    </div>
  );
}
