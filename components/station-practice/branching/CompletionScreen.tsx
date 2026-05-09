"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import {
  ArrowLeft,
  CheckCircle2,
  GraduationCap,
  RotateCcw,
  Timer,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { Mission, StationScene } from "@/data/station-practice/branching/types";

type Props = {
  mission: Mission;
  clearScene: StationScene;
  elapsedSeconds: number;
  hintsUsed: number;
  mistakes: number;
  onRestart: () => void;
};

export function CompletionScreen({
  mission,
  clearScene,
  elapsedSeconds,
  hintsUsed,
  mistakes,
  onRestart,
}: Props) {
  const m = Math.floor(elapsedSeconds / 60);
  const s = elapsedSeconds % 60;
  const time = `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  const cleanRun = mistakes === 0;

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-16">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="w-full max-w-xl rounded-3xl border border-white/5 bg-white/[0.02] p-10 text-center"
      >
        <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-yellow-300/10 text-yellow-300">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        <h1 className="mt-6 text-3xl font-semibold tracking-tight text-white">
          Mission cleared
        </h1>
        <p className="mt-1 text-sm text-yellow-300">
          {mission.title}
        </p>
        <div className="relative mt-6 aspect-[16/9] overflow-hidden rounded-2xl border border-white/10 bg-black/40">
          <Image
            src={clearScene.image}
            alt={clearScene.imageAlt}
            fill
            sizes="(min-width: 640px) 560px, 90vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/10" />
        </div>
        {clearScene.clearSummary && (
          <p className="mt-4 text-sm leading-6 text-neutral-300">
            {clearScene.clearSummary}
          </p>
        )}
        <div className="mt-8 grid grid-cols-3 gap-3 text-sm">
          <Stat label="Time" value={time} icon={<Timer className="h-3 w-3" />} />
          <Stat label="Hints" value={String(hintsUsed)} />
          <Stat
            label="Detours"
            value={String(mistakes)}
            highlight={cleanRun ? "Clean exit" : undefined}
          />
        </div>
        {clearScene.clearLessons && clearScene.clearLessons.length > 0 && (
          <div className="mt-8 rounded-2xl border border-white/5 bg-black/30 p-5 text-left">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-3.5 w-3.5 text-yellow-300" />
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-yellow-300">
                What you learned
              </span>
            </div>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-neutral-200">
              {clearScene.clearLessons.map((lesson, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-yellow-300">·</span>
                  <span>{lesson}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={onRestart}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-yellow-300 px-6 text-sm font-semibold text-black transition-colors hover:bg-yellow-200"
          >
            <RotateCcw className="h-4 w-4" />
            Practice again
          </button>
          <Link
            href="/station-practice"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-white/15 px-6 text-sm font-semibold text-white/90 transition-colors hover:bg-white/5"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to landing
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

function Stat({
  label,
  value,
  icon,
  highlight,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
  highlight?: string;
}) {
  return (
    <div className="rounded-xl border border-white/5 bg-black/30 p-4">
      <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.2em] text-neutral-500">
        {icon}
        {label}
      </div>
      <div className="mt-1 text-lg font-semibold text-white">{value}</div>
      {highlight && (
        <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-yellow-300">
          {highlight}
        </div>
      )}
    </div>
  );
}
