"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Lightbulb,
  RotateCcw,
  X,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import {
  SAKURA_IMAGE_BASE,
  sakuraMission,
  type SakuraChoiceKey,
} from "@/data/station-practice/sakura/nodes";
import { SakuraMiniMap } from "./SakuraMiniMap";

const BADGES = ["A", "B", "C"] as const;

type Feedback = { key: SakuraChoiceKey; correct: boolean } | null;

export function SakuraMissionClient() {
  const t = useTranslations("stationPractice");
  const [nodeId, setNodeId] = useState(sakuraMission.startNodeId);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [showHint, setShowHint] = useState(false);
  const [cleared, setCleared] = useState(false);

  const continueRef = useRef<HTMLButtonElement>(null);
  const firstChoiceRef = useRef<HTMLButtonElement>(null);

  const node = sakuraMission.nodes[nodeId];
  const stopNumber = Number(nodeId.replace("n", ""));

  const advance = useCallback(() => {
    const correctKey = node.order.find((k) => node.choices[k].correct)!;
    const next = node.choices[correctKey].next;
    setFeedback(null);
    setShowHint(false);
    if (next === "clear") {
      setCleared(true);
    } else if (next) {
      setNodeId(next);
    }
  }, [node]);

  const select = useCallback(
    (key: SakuraChoiceKey) => {
      if (feedback?.correct) return; // already solved this node
      setFeedback({ key, correct: !!node.choices[key].correct });
    },
    [feedback, node],
  );

  // Keyboard: 1–3 / A–C choose; Enter continues a solved node.
  useEffect(() => {
    if (cleared) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" && feedback?.correct) {
        e.preventDefault();
        advance();
        return;
      }
      const k = e.key.toLowerCase();
      const posMap: Record<string, number> = {
        "1": 0, a: 0, "2": 1, b: 1, "3": 2, c: 2,
      };
      if (k in posMap && node.order[posMap[k]]) {
        e.preventDefault();
        select(node.order[posMap[k]]);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [advance, select, feedback, node, cleared]);

  // Focus management: jump to Continue when solved, else first choice per node.
  useEffect(() => {
    if (feedback?.correct) continueRef.current?.focus();
  }, [feedback]);
  useEffect(() => {
    firstChoiceRef.current?.focus();
  }, [nodeId]);

  const restart = () => {
    setNodeId(sakuraMission.startNodeId);
    setFeedback(null);
    setShowHint(false);
    setCleared(false);
  };

  if (cleared) {
    return (
      <CompletionScreen
        image={sakuraMission.clear.image}
        floor={sakuraMission.clear.floor}
        t={t}
        onRestart={restart}
      />
    );
  }

  const feedbackBody =
    feedback && !feedback.correct
      ? t(`mission.${nodeId}.f${feedback.key}` as never)
      : "";

  return (
    <div className="flex flex-1 flex-col">
      <TopBar t={t} />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-28 pt-4 sm:px-6 lg:pb-10">
        {/* Goal banner */}
        <div className="mb-4 rounded-2xl border border-yellow-300/20 bg-yellow-300/[0.04] px-4 py-3">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-yellow-300">
              {t("ui.goal")}
            </span>
            <span className="text-sm text-neutral-200">{t("mission.goal")}</span>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
          {/* Scene + controls */}
          <div className="flex flex-col gap-4">
            <figure className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/40">
              <div className="relative aspect-video">
                <Image
                  key={node.image}
                  src={`${SAKURA_IMAGE_BASE}/${node.image}.webp`}
                  alt={t(`mission.${nodeId}.loc` as never)}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 760px"
                  className="object-cover"
                />
                <div className="absolute left-3 top-3 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-neutral-200 backdrop-blur">
                  {t("ui.stopOf", { current: stopNumber, total: sakuraMission.totalStops })}
                </div>
              </div>
              <figcaption className="flex items-center gap-2 border-t border-white/10 px-4 py-2.5 text-sm text-neutral-300">
                <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
                  {t("ui.location")}
                </span>
                {t(`mission.${nodeId}.loc` as never)}
              </figcaption>
            </figure>

            {/* Next-step prompt */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
              <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
                {t("ui.mission")}
              </div>
              <p className="mt-1 text-sm leading-6 text-neutral-100">
                {t(`mission.${nodeId}.step` as never)}
              </p>
              <button
                type="button"
                onClick={() => setShowHint((v) => !v)}
                className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-yellow-300/90 hover:text-yellow-200"
                aria-expanded={showHint}
              >
                <Lightbulb className="h-3.5 w-3.5" />
                {showHint ? t("ui.hintHide") : t("ui.hintShow")}
              </button>
              {showHint && (
                <p className="mt-2 rounded-lg bg-yellow-300/[0.06] px-3 py-2 text-xs leading-5 text-yellow-100/90">
                  {t(`mission.${nodeId}.hint` as never)}
                </p>
              )}
            </div>

            {/* Choices */}
            <div>
              <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
                {t("ui.choices")}
              </div>
              <div className="grid gap-2.5" role="group" aria-label={t("ui.choices")}>
                {node.order.map((key, i) => {
                  const isSelected = feedback?.key === key;
                  const isWrong = isSelected && !feedback?.correct;
                  const isRight = isSelected && feedback?.correct;
                  const locked = feedback?.correct;
                  return (
                    <button
                      key={key}
                      ref={i === 0 ? firstChoiceRef : undefined}
                      type="button"
                      onClick={() => select(key)}
                      disabled={locked && !isRight}
                      aria-label={`${BADGES[i]}: ${t(`mission.${nodeId}.${key}` as never)}`}
                      className={[
                        "flex min-h-[56px] w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors",
                        "focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-300/80",
                        isRight
                          ? "border-emerald-400/60 bg-emerald-400/10"
                          : isWrong
                            ? "border-rose-400/60 bg-rose-400/10"
                            : "border-white/10 bg-white/[0.03] hover:border-yellow-300/40 hover:bg-white/[0.06]",
                        locked && !isRight ? "opacity-50" : "",
                      ].join(" ")}
                    >
                      <span
                        className={[
                          "flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-sm font-bold",
                          isRight
                            ? "bg-emerald-400 text-black"
                            : isWrong
                              ? "bg-rose-400 text-black"
                              : "bg-yellow-300/15 text-yellow-300",
                        ].join(" ")}
                      >
                        {BADGES[i]}
                      </span>
                      <span className="text-sm leading-5 text-neutral-100">
                        {t(`mission.${nodeId}.${key}` as never)}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Feedback */}
              <div aria-live="polite" className="mt-3">
                {feedback && (
                  <div
                    className={[
                      "rounded-xl border px-4 py-3",
                      feedback.correct
                        ? "border-emerald-400/40 bg-emerald-400/[0.08]"
                        : "border-rose-400/40 bg-rose-400/[0.08]",
                    ].join(" ")}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={[
                          "flex h-5 w-5 items-center justify-center rounded-full",
                          feedback.correct ? "bg-emerald-400" : "bg-rose-400",
                        ].join(" ")}
                      >
                        {feedback.correct ? (
                          <Check className="h-3.5 w-3.5 text-black" />
                        ) : (
                          <X className="h-3.5 w-3.5 text-black" />
                        )}
                      </span>
                      <span className="text-sm font-semibold text-white">
                        {feedback.correct ? t("ui.correct") : t("ui.wrong")}
                      </span>
                    </div>
                    {!feedback.correct && (
                      <p className="mt-1.5 pl-7 text-sm leading-5 text-neutral-200">
                        {feedbackBody}
                      </p>
                    )}
                    {feedback.correct && (
                      <div className="mt-2.5 pl-7">
                        <button
                          ref={continueRef}
                          type="button"
                          onClick={advance}
                          className="inline-flex h-10 items-center gap-2 rounded-full bg-yellow-300 px-5 text-sm font-semibold text-black transition-colors hover:bg-yellow-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                        >
                          {t("ui.continue")} <ArrowRight className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Side rail: minimap + keyboard hint */}
          <aside className="flex flex-col gap-3">
            <SakuraMiniMap
              blueprint={node.blueprint}
              floor={node.floor}
              marker={node.marker}
              mapLabel={t("ui.stationMap")}
              youAreHereLabel={t("ui.youAreHere")}
            />
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
  image,
  floor,
  t,
  onRestart,
}: {
  image: string;
  floor: string;
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
              src={`${SAKURA_IMAGE_BASE}/${image}.webp`}
              alt={t("mission.clear.loc")}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 700px"
              className="object-cover"
            />
            <div className="absolute left-3 top-3 rounded-full bg-yellow-300 px-3 py-1 text-xs font-semibold text-black">
              {floor}
            </div>
          </div>
        </figure>

        <h1 className="mt-6 text-2xl font-semibold tracking-tight text-white">
          {t("ui.clearTitle")}
        </h1>
        <p className="mt-2 text-sm leading-6 text-neutral-300">
          {t("mission.clear.summary")}
        </p>

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
