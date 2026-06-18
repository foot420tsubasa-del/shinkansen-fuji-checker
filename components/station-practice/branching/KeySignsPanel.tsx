"use client";

import type { SignOverlay } from "@/data/station-practice/branching/types";
import { DirectionIcon } from "./SignBadge";
import { useTr } from "@/components/station-practice/lib/useTr";

type Props = {
  signs: SignOverlay[];
  onInspectSigns: () => void;
};

export function KeySignsPanel({ signs, onInspectSigns }: Props) {
  const t = useTr();
  if (signs.length === 0) return null;

  return (
    <section className="rounded-2xl border border-white/5 bg-white/[0.025] p-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-yellow-300">
            {t("Key signs in this scene")}
          </div>
          <p className="mt-1 text-[11px] leading-4 text-neutral-500">
            {t(
              "Use these as reading targets; the station image stays unobstructed.",
            )}
          </p>
        </div>
        <button
          type="button"
          onClick={onInspectSigns}
          className="shrink-0 rounded-full border border-yellow-300/25 px-3 py-1.5 text-[11px] font-semibold text-yellow-200 transition-colors hover:bg-yellow-300/10"
        >
          {t("Inspect signs")}
        </button>
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {signs.map((sign) => {
          const isYellow = sign.tone !== "navy";
          return (
            <button
              key={sign.id}
              type="button"
              onClick={onInspectSigns}
              className={[
                "flex items-center gap-2 rounded-xl border px-3 py-2 text-left transition-colors",
                isYellow
                  ? "border-yellow-300/25 bg-yellow-300/10 text-yellow-50 hover:bg-yellow-300/15"
                  : "border-sky-300/15 bg-sky-300/10 text-sky-50 hover:bg-sky-300/15",
              ].join(" ")}
            >
              {sign.direction && (
                <DirectionIcon
                  direction={sign.direction}
                  className="h-4 w-4 shrink-0"
                />
              )}
              <span className="min-w-0">
                <span className="block truncate text-xs font-semibold">
                  {sign.textJa}
                </span>
                <span className="mt-0.5 block truncate text-[11px] text-neutral-300">
                  {sign.textEn}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
