"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Eye, Lightbulb, Timer } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useTr } from "@/components/station-practice/lib/useTr";

type Props = {
  startedAt: number | null;
  hintsUsed: number;
  mistakes: number;
  progressIndex: number;
  totalGameplayScenes: number;
  isDetour?: boolean;
  onInspectSigns: () => void;
  signsAvailable: boolean;
};

export function TopBar({
  startedAt,
  hintsUsed,
  mistakes,
  progressIndex,
  totalGameplayScenes,
  isDetour = false,
  onInspectSigns,
  signsAvailable,
}: Props) {
  const elapsed = useElapsedSeconds(startedAt);
  const t = useTr();

  const sceneNumber =
    progressIndex >= totalGameplayScenes
      ? totalGameplayScenes
      : progressIndex + 1;

  return (
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 px-4 py-3 sm:px-6">
      <Link
        href="/station-practice"
        className="inline-flex items-center gap-2 text-sm text-neutral-300 hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="hidden sm:inline">Tokyo Mega Station Practice</span>
        <span className="sm:hidden">{t("Back")}</span>
      </Link>
      <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-400 sm:gap-4">
        <span className="rounded-full border border-white/10 px-3 py-1">
          {isDetour
            ? t("Wrong route")
            : `${t("Scene")} ${sceneNumber}/${totalGameplayScenes}`}
        </span>
        <span className="hidden items-center gap-1.5 sm:inline-flex">
          <Timer className="h-3.5 w-3.5" />
          {formatElapsed(elapsed)}
        </span>
        <span className="hidden items-center gap-1.5 sm:inline-flex">
          <Lightbulb className="h-3.5 w-3.5" />
          {hintsUsed}
        </span>
        <span className="hidden items-center gap-1.5 sm:inline-flex">
          {t("Detours")}&nbsp;
          <span className="font-medium text-neutral-200">{mistakes}</span>
        </span>
        <button
          type="button"
          onClick={onInspectSigns}
          disabled={!signsAvailable}
          className="inline-flex items-center gap-1.5 rounded-full border border-yellow-300/40 bg-yellow-300/10 px-3 py-1 text-xs font-medium text-yellow-200 hover:border-yellow-300/70 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Eye className="h-3.5 w-3.5" />
          {t("Inspect signs")}
        </button>
        <span className="text-[10px] uppercase tracking-[0.2em] text-yellow-300">
          {t("Branching · Preview")}
        </span>
      </div>
    </header>
  );
}

function useElapsedSeconds(startedAt: number | null) {
  const [now, setNow] = useState<number>(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  if (!startedAt) return 0;
  return Math.max(0, Math.floor((now - startedAt) / 1000));
}

function formatElapsed(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
