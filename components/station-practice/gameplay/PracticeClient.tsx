"use client";

import { Link } from "@/i18n/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Eye,
  Footprints,
  GraduationCap,
  Lightbulb,
  MapPin,
  MapPinned,
  RotateCcw,
  Target,
  Timer,
  XCircle,
} from "lucide-react";
import { missions } from "@/data/station-practice/missions";
import { useGameStore } from "@/components/station-practice/store/gameStore";
import { cn } from "@/components/station-practice/lib/utils";
import { SceneStage } from "@/components/station-practice/gameplay/SceneStage";
import { MiniMapRoute } from "@/components/station-practice/gameplay/MiniMapRoute";

export function PracticeClient() {
  const start = useGameStore((s) => s.start);
  const status = useGameStore((s) => s.status);

  useEffect(() => {
    if (status === "idle") start();
  }, [status, start]);

  if (status === "idle") return null;
  if (status === "completed") return <CompletionScreen />;
  return <MissionScreen />;
}

function MissionScreen() {
  const mission = useGameStore((s) => s.currentMission());
  const status = useGameStore((s) => s.status);
  const lastChoiceId = useGameStore((s) => s.lastChoiceId);
  const lastResult = useGameStore((s) => s.lastResult);
  const lastExplanation = useGameStore((s) => s.lastExplanation);
  const hintRevealed = useGameStore((s) => s.hintRevealed);
  const hintsUsed = useGameStore((s) => s.hintsUsed);
  const currentIndex = useGameStore((s) => s.currentIndex);
  const total = useGameStore((s) => s.totalMissions());
  const cleared = useGameStore((s) => s.clearedCount());
  const selectChoice = useGameStore((s) => s.selectChoice);
  const revealHint = useGameStore((s) => s.revealHint);
  const next = useGameStore((s) => s.next);

  const elapsed = useElapsedSeconds();
  const cleared01 = status === "mission-cleared";

  // Re-trigger shake animation each time the user picks a wrong choice.
  const wrongShakeKey = useWrongShakeKey({ lastChoiceId, lastResult });

  return (
    <div className="flex flex-1 flex-col">
      <TopBar
        currentIndex={currentIndex}
        total={total}
        elapsed={elapsed}
        hintsUsed={hintsUsed}
      />

      <section className="grid flex-1 gap-5 px-4 py-5 sm:px-6 lg:grid-cols-[296px_1fr_296px]">
        {/* LEFT: mission */}
        <motion.aside
          key={`left-${mission.id}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="flex flex-col gap-4"
        >
          <Panel>
            <Eyebrow>
              Mission {currentIndex + 1} of {total}
            </Eyebrow>
            <h1 className="mt-2 text-xl font-semibold leading-tight text-white">
              {mission.title}
            </h1>
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-black/30 px-3 py-1 text-[11px] text-neutral-300">
              <MapPin className="h-3 w-3 text-yellow-300" />
              <span className="uppercase tracking-[0.15em] text-neutral-500">
                You are here
              </span>
              <span className="text-neutral-200">{mission.currentLocation}</span>
            </div>
            <p className="mt-4 text-sm leading-6 text-neutral-300">
              {mission.scenarioIntro}
            </p>
            <div className="mt-5 rounded-xl border border-white/5 bg-black/30 p-4">
              <div className="flex items-center gap-2">
                <Target className="h-3.5 w-3.5 text-yellow-300" />
                <Eyebrow muted>Goal</Eyebrow>
              </div>
              <div className="mt-1 text-sm text-white">{mission.goal}</div>
            </div>
            <div className="mt-3 rounded-xl border border-yellow-300/15 bg-yellow-300/[0.04] p-4">
              <div className="flex items-center gap-2">
                <Eye className="h-3.5 w-3.5 text-yellow-300" />
                <Eyebrow>Look for this</Eyebrow>
              </div>
              <p className="mt-1 text-sm leading-6 text-neutral-200">
                {mission.visualCue}
              </p>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-neutral-400">
              <div className="rounded-lg border border-white/5 bg-black/30 px-3 py-2">
                Difficulty
                <div className="mt-0.5 text-white">{mission.difficulty}</div>
              </div>
              <div className="rounded-lg border border-white/5 bg-black/30 px-3 py-2">
                Estimated
                <div className="mt-0.5 text-white">~{mission.estimatedMinutes}</div>
              </div>
            </div>
          </Panel>

          <Panel>
            <div className="flex items-center justify-between">
              <Eyebrow>Mini map</Eyebrow>
              <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.2em] text-neutral-500">
                <MapPinned className="h-3 w-3" />
                Route
              </span>
            </div>
            <MiniMapRoute
              missions={missions}
              currentIndex={currentIndex}
              status={status}
            />
          </Panel>
        </motion.aside>

        {/* CENTER: scene */}
        <motion.div
          animate={
            lastResult === "wrong"
              ? { x: [0, -6, 6, -4, 4, 0] }
              : { x: 0 }
          }
          transition={{ duration: 0.45 }}
          key={`shake-${wrongShakeKey}`}
          className="relative flex min-h-[520px] flex-col overflow-hidden rounded-2xl border border-white/5"
        >
          <SceneStage mission={mission} status={status} />

          <div className="relative flex flex-1 flex-col p-6">
            {/* Overhead sign + transition caption */}
            <div className="self-center text-center">
              <motion.div
                key={`sign-${mission.id}`}
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="rounded-md bg-yellow-300 px-5 py-2 text-sm font-semibold text-black shadow-[0_8px_30px_-8px_rgba(250,204,21,0.5)]"
              >
                {mission.signText}
              </motion.div>
              <div className="mt-2 text-[11px] uppercase tracking-[0.2em] text-yellow-200/80">
                {mission.directionLabel}
              </div>
            </div>

            {/* Walking-to-next overlay (correct) */}
            <AnimatePresence>
              {cleared01 && (
                <motion.div
                  key="transition"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="mt-6 self-center"
                >
                  <div className="inline-flex items-center gap-2 rounded-full border border-yellow-300/40 bg-black/50 px-4 py-1.5 text-xs font-medium text-yellow-200 backdrop-blur-sm">
                    <Footprints className="h-3.5 w-3.5" />
                    {mission.transitionText}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Wrong-direction badge */}
            <AnimatePresence>
              {lastResult === "wrong" && (
                <motion.div
                  key={`wrong-badge-${wrongShakeKey}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="mt-6 self-center"
                >
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-red-400/40 bg-red-400/15 px-3 py-1 text-xs font-semibold text-red-100">
                    <XCircle className="h-3.5 w-3.5" />
                    Wrong direction
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Feedback banner */}
            <AnimatePresence>
              {lastResult && (
                <motion.div
                  key={`fb-${lastResult}-${lastChoiceId}`}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <FeedbackBanner
                    result={lastResult}
                    title={
                      lastResult === "correct"
                        ? mission.clearMessage
                        : "Not quite"
                    }
                    body={
                      lastResult === "correct"
                        ? mission.correctReason
                        : (lastExplanation ?? "")
                    }
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Choices */}
            <div className="mt-auto grid w-full gap-3 sm:grid-cols-3">
              {mission.choices.map((choice) => {
                const isLast = lastChoiceId === choice.id;
                const isWrong = isLast && lastResult === "wrong";
                const isCorrect = isLast && lastResult === "correct";
                return (
                  <motion.button
                    key={choice.id}
                    type="button"
                    disabled={cleared01}
                    onClick={() => selectChoice(choice.id)}
                    animate={
                      isWrong ? { x: [0, -3, 3, -2, 2, 0] } : { x: 0 }
                    }
                    transition={{ duration: 0.4 }}
                    className={cn(
                      "group rounded-xl border px-4 py-4 text-left text-sm transition-colors",
                      "border-white/10 bg-white/[0.04] text-white",
                      "hover:border-yellow-300/50 hover:bg-yellow-300/5",
                      "disabled:cursor-not-allowed disabled:opacity-60",
                      isWrong &&
                        "border-red-400/60 bg-red-400/10 text-red-50 shadow-[0_0_0_1px_rgba(248,113,113,0.4)] hover:border-red-400/70",
                      isCorrect &&
                        "border-emerald-400/70 bg-emerald-400/10 text-emerald-50 shadow-[0_0_0_1px_rgba(52,211,153,0.45)] hover:border-emerald-400/70",
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">{choice.label}</span>
                      {isWrong && <XCircle className="h-4 w-4 text-red-300" />}
                      {isCorrect && (
                        <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                      )}
                    </div>
                    {choice.sublabel && (
                      <div className="mt-1 text-xs text-neutral-400 group-hover:text-neutral-300">
                        {choice.sublabel}
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </div>

            <div className="mt-4 flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-xs text-neutral-400">
                Pick the direction the overhead sign points to.
              </div>
              {cleared01 ? (
                <motion.button
                  type="button"
                  onClick={next}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-yellow-300 px-6 text-sm font-semibold text-black transition-colors hover:bg-yellow-200"
                >
                  {currentIndex + 1 >= total
                    ? "Finish practice"
                    : "Next mission"}
                  <ArrowRight className="h-4 w-4" />
                </motion.button>
              ) : (
                <span className="text-xs text-neutral-500">
                  Wrong choice? Read the explanation and try again.
                </span>
              )}
            </div>
          </div>
        </motion.div>

        {/* RIGHT: progress + hint */}
        <motion.aside
          key={`right-${mission.id}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut", delay: 0.05 }}
          className="flex flex-col gap-4"
        >
          <Panel>
            <Eyebrow>Progress</Eyebrow>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-3xl font-semibold text-white">
                {cleared}
                <span className="text-base font-normal text-neutral-500">
                  /{total}
                </span>
              </span>
              <span className="text-xs text-neutral-500">missions cleared</span>
            </div>
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
              <motion.div
                className="h-full rounded-full bg-yellow-300"
                animate={{ width: `${(cleared / total) * 100}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-neutral-400">
              <div className="rounded-lg border border-white/5 bg-black/30 px-3 py-2">
                <div className="inline-flex items-center gap-1.5 text-neutral-500">
                  <Timer className="h-3 w-3" /> Elapsed
                </div>
                <div className="mt-0.5 font-medium text-white">
                  {formatElapsed(elapsed)}
                </div>
              </div>
              <div className="rounded-lg border border-white/5 bg-black/30 px-3 py-2">
                <div className="inline-flex items-center gap-1.5 text-neutral-500">
                  <Lightbulb className="h-3 w-3" /> Hints used
                </div>
                <div className="mt-0.5 font-medium text-white">{hintsUsed}</div>
              </div>
            </div>
          </Panel>

          <Panel>
            <div className="flex items-center justify-between">
              <Eyebrow>Hint</Eyebrow>
              {!hintRevealed && (
                <button
                  type="button"
                  onClick={revealHint}
                  className="inline-flex items-center gap-1.5 rounded-full border border-yellow-300/40 bg-yellow-300/10 px-3 py-1 text-xs font-medium text-yellow-200 hover:border-yellow-300/70"
                >
                  <Lightbulb className="h-3.5 w-3.5" />
                  Reveal hint
                </button>
              )}
            </div>
            <p
              className={cn(
                "mt-3 text-sm leading-6 transition-opacity",
                hintRevealed ? "text-neutral-200" : "text-neutral-600",
              )}
            >
              {hintRevealed ? mission.hint : "Hint hidden — reveal if stuck."}
            </p>
          </Panel>

          <Panel>
            <div className="flex items-center gap-2">
              <GraduationCap className="h-3.5 w-3.5 text-yellow-300" />
              <Eyebrow>What you learned</Eyebrow>
            </div>
            <p
              className={cn(
                "mt-3 text-sm leading-6",
                cleared01 ? "text-neutral-200" : "text-neutral-500",
              )}
            >
              {cleared01
                ? mission.learningPoint
                : "The lesson appears after you clear this mission."}
            </p>
          </Panel>

          <Panel>
            <Eyebrow>Travel tip</Eyebrow>
            <p
              className={cn(
                "mt-3 text-sm leading-6",
                cleared01 ? "text-neutral-200" : "text-neutral-500",
              )}
            >
              {cleared01
                ? mission.travelTip
                : "Revealed after you clear this mission."}
            </p>
          </Panel>
        </motion.aside>
      </section>

      <footer className="border-t border-white/5 px-6 py-4 text-xs text-neutral-500">
        This is a practice simulator, not an official station map.
      </footer>
    </div>
  );
}

function CompletionScreen() {
  const restart = useGameStore((s) => s.restart);
  const total = useGameStore((s) => s.totalMissions());
  const hintsUsed = useGameStore((s) => s.hintsUsed);
  const elapsed = useElapsedSeconds();

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
          Practice complete
        </h1>
        <p className="mt-3 text-sm leading-6 text-neutral-400">
          You cleared all {total} missions. You now know the patterns: pick the
          city side first, follow transfer signs (not exit signs), trust posted
          walking times, and follow the airport icon for airport trains.
        </p>
        <div className="mt-8 grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-xl border border-white/5 bg-black/30 p-4">
            <div className="text-xs uppercase tracking-[0.2em] text-neutral-500">
              Time
            </div>
            <div className="mt-1 text-lg font-semibold text-white">
              {formatElapsed(elapsed)}
            </div>
          </div>
          <div className="rounded-xl border border-white/5 bg-black/30 p-4">
            <div className="text-xs uppercase tracking-[0.2em] text-neutral-500">
              Hints used
            </div>
            <div className="mt-1 text-lg font-semibold text-white">
              {hintsUsed}
            </div>
          </div>
        </div>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={restart}
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

function TopBar({
  currentIndex,
  total,
  elapsed,
  hintsUsed,
}: {
  currentIndex: number;
  total: number;
  elapsed: number;
  hintsUsed: number;
}) {
  return (
    <header className="flex items-center justify-between border-b border-white/5 px-4 py-3 sm:px-6">
      <Link
        href="/station-practice"
        className="inline-flex items-center gap-2 text-sm text-neutral-300 hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="hidden sm:inline">Tokyo Mega Station Practice</span>
        <span className="sm:hidden">Back</span>
      </Link>
      <div className="flex items-center gap-3 text-xs text-neutral-400 sm:gap-5">
        <span className="rounded-full border border-white/10 px-3 py-1">
          Mission {currentIndex + 1}/{total}
        </span>
        <span className="hidden items-center gap-1.5 sm:inline-flex">
          <Timer className="h-3.5 w-3.5" />
          {formatElapsed(elapsed)}
        </span>
        <span className="hidden items-center gap-1.5 sm:inline-flex">
          <Lightbulb className="h-3.5 w-3.5" />
          {hintsUsed}
        </span>
        <span className="text-[10px] uppercase tracking-[0.2em] text-yellow-300">
          Practice mode
        </span>
      </div>
    </header>
  );
}

function FeedbackBanner({
  result,
  title,
  body,
}: {
  result: "correct" | "wrong";
  title: string;
  body: string;
}) {
  const isCorrect = result === "correct";
  return (
    <div
      role="status"
      className={cn(
        "mx-auto mt-6 max-w-xl rounded-xl border px-4 py-3 text-sm backdrop-blur-sm",
        isCorrect
          ? "border-emerald-400/40 bg-emerald-500/10 text-emerald-50"
          : "border-red-400/40 bg-red-500/10 text-red-50",
      )}
    >
      <div className="flex items-start gap-2">
        {isCorrect ? (
          <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-300" />
        ) : (
          <XCircle className="mt-0.5 h-4 w-4 text-red-300" />
        )}
        <div>
          <div className="font-semibold">{title}</div>
          <p className="mt-1 leading-6">{body}</p>
        </div>
      </div>
    </div>
  );
}

function Panel({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
      {children}
    </div>
  );
}

function Eyebrow({
  children,
  muted,
}: {
  children: React.ReactNode;
  muted?: boolean;
}) {
  return (
    <div
      className={cn(
        "text-xs font-semibold uppercase tracking-[0.2em]",
        muted ? "text-neutral-500" : "text-yellow-300",
      )}
    >
      {children}
    </div>
  );
}

function useElapsedSeconds() {
  const startedAt = useGameStore((s) => s.startedAt);
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

function useWrongShakeKey({
  lastChoiceId,
  lastResult,
}: {
  lastChoiceId: string | null;
  lastResult: "correct" | "wrong" | null;
}) {
  const [key, setKey] = useState(0);
  const sigRef = useRef<string | null>(null);

  useEffect(() => {
    if (lastResult !== "wrong") return;
    const sig = `${lastChoiceId}-${Date.now()}`;
    if (sig !== sigRef.current) {
      sigRef.current = sig;
      const handle = window.setTimeout(() => setKey((k) => k + 1), 0);
      return () => window.clearTimeout(handle);
    }
  }, [lastChoiceId, lastResult]);

  return key;
}
