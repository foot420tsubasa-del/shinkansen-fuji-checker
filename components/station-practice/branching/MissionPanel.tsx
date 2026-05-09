"use client";

import { MapPin, Target } from "lucide-react";
import type { Mission, StationScene } from "@/data/station-practice/branching/types";

type Props = {
  mission: Mission;
  scene: StationScene;
};

export function MissionPanel({ mission, scene }: Props) {
  return (
    <section className="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
      <div className="text-xs font-semibold uppercase tracking-[0.2em] text-yellow-300">
        {mission.subtitle}
      </div>
      <h1 className="mt-2 text-lg font-semibold leading-tight text-white sm:text-xl">
        {mission.title}
      </h1>
      <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-black/30 px-3 py-1 text-[11px] text-neutral-300">
        <MapPin className="h-3 w-3 text-yellow-300" />
        <span className="uppercase tracking-[0.15em] text-neutral-500">
          You are here
        </span>
        <span className="text-neutral-200">{scene.currentLocation}</span>
      </div>
      <p className="mt-4 text-sm leading-6 text-neutral-300">
        {scene.missionText}
      </p>
      <div className="mt-4 rounded-xl border border-white/5 bg-black/30 p-3">
        <div className="flex items-center gap-2">
          <Target className="h-3.5 w-3.5 text-yellow-300" />
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
            Goal
          </span>
        </div>
        <p className="mt-1 text-sm leading-6 text-neutral-200">
          {mission.missionCopy}
        </p>
      </div>
    </section>
  );
}
