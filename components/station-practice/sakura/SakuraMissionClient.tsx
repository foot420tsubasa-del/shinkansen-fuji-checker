"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Check,
  Compass,
  Lightbulb,
  RotateCcw,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import {
  nextStepToward,
  optimalSteps,
  SAKURA_IMAGE_BASE,
  sakuraMissions,
  sakuraWalk,
  type ExitDir,
  type SakuraExit,
  type SakuraGoalKey,
} from "@/data/station-practice/sakura/nodes";
import { SakuraMiniMap } from "./SakuraMiniMap";

const DIR_ICON: Record<ExitDir, typeof ArrowUp> = {
  up: ArrowUp,
  down: ArrowDown,
  left: ArrowLeft,
  right: ArrowRight,
};

const DIR_POS: Record<ExitDir, string> = {
  up: "left-1/2 top-3 -translate-x-1/2",
  down: "left-1/2 bottom-3 -translate-x-1/2",
  left: "left-3 top-1/2 -translate-y-1/2",
  right: "right-3 top-1/2 -translate-y-1/2",
};

const KEY_TO_DIR: Record<string, ExitDir> = {
  ArrowUp: "up",
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
};

export function SakuraMissionClient({ goal }: { goal: SakuraGoalKey }) {
  const t = useTranslations("stationPractice");
  const mission = sakuraMissions[goal];
  const [nodeId, setNodeId] = useState(mission.startNodeId);
  const [steps, setSteps] = useState(0);
  const [showHint, setShowHint] = useState(false);

  const node = sakuraWalk.nodes[nodeId];
  const cleared = nodeId === mission.goalNodeId;
  const recommendedTo = showHint ? nextStepToward(nodeId, mission.goalNodeId) : null;
  const nodeName =
    t(`mission.nodes.names.${node.nameKey}` as never) +
    (node.view ? ` · ${node.view}` : "");

  const move = useCallback((exit: SakuraExit) => {
    setSteps((s) => s + 1);
    setShowHint(false);
    setNodeId(exit.to);
  }, []);

  const restart = useCallback(() => {
    setNodeId(mission.startNodeId);
    setSteps(0);
    setShowHint(false);
  }, [mission.startNodeId]);

  useEffect(() => {
    if (cleared) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key in KEY_TO_DIR) {
        const exit = node.exits.find((x) => x.dir === KEY_TO_DIR[e.key]);
        if (exit) {
          e.preventDefault();
          move(exit);
        }
        return;
      }
      const n = Number(e.key);
      if (n >= 1 && n <= node.exits.length) {
        e.preventDefault();
        move(node.exits[n - 1]);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [node, move, cleared]);

  if (cleared) {
    return (
      <CompletionScreen
        node={node}
        steps={steps}
        bestRoute={optimalSteps(goal)}
        clearTitle={t(goal === "west" ? "mission.clear.titleWest" : "mission.clear.titleJr")}
        t={t}
        onRestart={restart}
      />
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <TopBar t={t} />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-10 pt-4 sm:px-6">
        <div className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-2xl border border-yellow-300/20 bg-yellow-300/[0.04] px-4 py-3">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-yellow-300">
            <Compass className="h-3.5 w-3.5" />
            {t("ui.objective")}
          </span>
          <span className="text-sm text-neutral-200">
            {t(`mission.objectives.${goal}` as never)}
          </span>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
          <div className="flex flex-col gap-4">
            <figure className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/40">
              <div className="relative aspect-video">
                <Image
                  key={node.image}
                  src={`${SAKURA_IMAGE_BASE}/${node.image}.webp`}
                  alt={nodeName}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 760px"
                  className="object-cover"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/25" />
                <div className="absolute left-3 top-3 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-neutral-200 backdrop-blur">
                  {node.floor}
                </div>

                {node.exits.map((exit, i) => {
                  const Icon = DIR_ICON[exit.dir];
                  const highlight = exit.to === recommendedTo;
                  return (
                    <button
                      key={exit.to}
                      type="button"
                      onClick={() => move(exit)}
                      aria-label={`${i + 1}. ${t(`mission.exits.${exit.labelKey}` as never)}`}
                      className={[
                        "absolute flex max-w-[44%] items-center gap-2 rounded-full border px-3 py-2 text-left backdrop-blur transition-colors",
                        "focus:outline-none focus-visible:ring-2 focus-visible:ring-white",
                        DIR_POS[exit.dir],
                        highlight
                          ? "animate-pulse border-yellow-300 bg-yellow-300/90 text-black"
                          : "border-white/25 bg-black/60 text-white hover:border-yellow-300/70 hover:bg-black/75",
                      ].join(" ")}
                    >
                      <span
                        className={[
                          "flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
                          highlight ? "bg-black/15" : "bg-yellow-300/20 text-yellow-300",
                        ].join(" ")}
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="text-xs font-medium leading-4">
                        {t(`mission.exits.${exit.labelKey}` as never)}
                      </span>
                    </button>
                  );
                })}
              </div>

              <figcaption className="border-t border-white/10 px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
                    {t("ui.youAreHere")}
                  </span>
                  <span className="text-sm font-medium text-white">
                    {nodeName}
                  </span>
                </div>
                <p className="mt-1 text-sm leading-6 text-neutral-300">
                  {t(`mission.nodes.caps.${node.captionKey}` as never)}
                </p>
              </figcaption>
            </figure>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
                  {t("ui.whereTo")}
                </span>
                <button
                  type="button"
                  onClick={() => setShowHint((v) => !v)}
                  aria-expanded={showHint}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-yellow-300/90 hover:text-yellow-200"
                >
                  <Lightbulb className="h-3.5 w-3.5" />
                  {showHint ? t("ui.hintHide") : t("ui.hintShow")}
                </button>
              </div>
              <div className="grid gap-2.5">
                {node.exits.map((exit, i) => {
                  const Icon = DIR_ICON[exit.dir];
                  const highlight = exit.to === recommendedTo;
                  return (
                    <button
                      key={exit.to}
                      type="button"
                      onClick={() => move(exit)}
                      className={[
                        "flex min-h-[52px] w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors",
                        "focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-300/80",
                        highlight
                          ? "border-yellow-300/70 bg-yellow-300/[0.10]"
                          : "border-white/10 bg-white/[0.03] hover:border-yellow-300/40 hover:bg-white/[0.06]",
                      ].join(" ")}
                    >
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-yellow-300/15 text-yellow-300">
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="flex-1 text-sm leading-5 text-neutral-100">
                        {t(`mission.exits.${exit.labelKey}` as never)}
                      </span>
                      <span className="text-[11px] font-semibold text-neutral-600">
                        {i + 1}
                      </span>
                    </button>
                  );
                })}
              </div>
              {showHint && (
                <p className="mt-2 rounded-lg bg-yellow-300/[0.06] px-3 py-2 text-xs leading-5 text-yellow-100/90">
                  {t("ui.hintText")}
                </p>
              )}
            </div>
          </div>

          <aside className="flex flex-col gap-3">
            <SakuraMiniMap
              blueprint={node.blueprint}
              floor={node.floor}
              marker={node.marker}
              mapLabel={t("ui.stationMap")}
              youAreHereLabel={t("ui.youAreHere")}
            />
            <div className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] px-3 py-2 text-[11px] text-neutral-500">
              <span>{t("ui.moves", { n: steps })}</span>
            </div>
            <p className="hidden rounded-xl border border-white/5 bg-white/[0.02] px-3 py-2 text-[11px] leading-4 text-neutral-500 lg:block">
              {t("ui.keyboardHint")}
            </p>
          </aside>
        </div>
      </main>
    </div>
  );
}

function TopBar({ t }: { t: ReturnType<typeof useTranslations> }) {
  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-[#0a0e1a]/90 px-4 py-3 backdrop-blur sm:px-6">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
        <Link
          href="/station-practice"
          className="inline-flex items-center gap-1.5 text-sm text-neutral-400 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">{t("ui.back")}</span>
        </Link>
        <div className="min-w-0 text-center">
          <div className="truncate text-sm font-semibold text-white">
            {t("mission.title")}
          </div>
          <div className="truncate text-[11px] text-neutral-500">
            {t("mission.subtitle")}
          </div>
        </div>
        <span className="rounded-full border border-yellow-300/25 bg-yellow-300/5 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.14em] text-yellow-300">
          {t("ui.kicker")}
        </span>
      </div>
    </header>
  );
}

function CompletionScreen({
  node,
  steps,
  bestRoute,
  clearTitle,
  t,
  onRestart,
}: {
  node: { image: string; floor: string; nameKey: string };
  steps: number;
  bestRoute: number;
  clearTitle: string;
  t: ReturnType<typeof useTranslations>;
  onRestart: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col">
      <TopBar t={t} />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6">
        <figure className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/40">
          <div className="relative aspect-video">
            <Image
              src={`${SAKURA_IMAGE_BASE}/${node.image}.webp`}
              alt={t(`mission.nodes.names.${node.nameKey}` as never)}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 700px"
              className="object-cover"
            />
            <div className="absolute left-3 top-3 rounded-full bg-yellow-300 px-3 py-1 text-xs font-semibold text-black">
              {node.floor}
            </div>
          </div>
        </figure>

        <h1 className="mt-6 text-2xl font-semibold tracking-tight text-white">
          {clearTitle}
        </h1>
        <p className="mt-2 text-sm leading-6 text-neutral-300">
          {t("mission.clear.summary")}
        </p>
        <div className="mt-3 flex flex-wrap gap-2 text-xs text-neutral-400">
          <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1">
            {t("ui.moves", { n: steps })}
          </span>
          <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1">
            {t("ui.bestRoute", { n: bestRoute })}
          </span>
        </div>

        <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-yellow-300">
            {t("ui.lessons")}
          </div>
          <ul className="mt-3 space-y-2">
            {(["l1", "l2", "l3"] as const).map((l) => (
              <li key={l} className="flex gap-2.5 text-sm leading-6 text-neutral-200">
                <Check className="mt-1 h-4 w-4 shrink-0 text-emerald-400" />
                {t(`mission.clear.${l}` as never)}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onRestart}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-yellow-300 px-7 text-sm font-semibold text-black transition-colors hover:bg-yellow-200"
          >
            <RotateCcw className="h-4 w-4" />
            {t("ui.playAgain")}
          </button>
          <Link
            href="/station-practice"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-white/15 px-7 text-sm font-semibold text-white/90 transition-colors hover:bg-white/5"
          >
            {t("ui.back")}
          </Link>
        </div>
      </main>
    </div>
  );
}
