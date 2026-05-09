"use client";

import { motion } from "framer-motion";
import { CheckCircle2, XCircle } from "lucide-react";
import type { Choice } from "@/data/station-practice/branching/types";
import { cn } from "@/components/station-practice/lib/utils";
import { DirectionIcon } from "./SignBadge";

/*
 * Three compact A/B/C choice buttons. The component is "dumb" — it gets
 * the current scene's choices, the last clicked id, and the last
 * result, and emits an `onSelect` callback. Wrong-clicked buttons get
 * a brief shake + red highlight; correct stays green.
 */

type Props = {
  choices: Choice[];
  lastChoiceId: string | null;
  lastResult: "correct" | "wrong" | "neutral" | null;
  disabled: boolean;
  onSelect: (choice: Choice) => void;
};

export function ChoicePanel({
  choices,
  lastChoiceId,
  lastResult,
  disabled,
  onSelect,
}: Props) {
  return (
    <div className="grid w-full gap-2.5 sm:grid-cols-3">
      {choices.map((choice) => {
        const isLast = lastChoiceId === choice.id;
        const isWrong = isLast && lastResult === "wrong";
        const isCorrect = isLast && lastResult === "correct";
        return (
          <motion.button
            key={choice.id}
            type="button"
            disabled={disabled || isCorrect}
            onClick={() => onSelect(choice)}
            animate={isWrong ? { x: [0, -4, 4, -3, 3, 0] } : { x: 0 }}
            transition={{ duration: 0.45 }}
            className={cn(
              "group relative flex min-h-[76px] flex-col items-start gap-1 rounded-lg border px-3.5 py-2.5 text-left transition-colors",
              "border-white/10 bg-white/[0.035] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]",
              "hover:border-yellow-300/50 hover:bg-yellow-300/5",
              "disabled:cursor-not-allowed disabled:opacity-60",
              isWrong &&
                "border-red-400/60 bg-red-400/10 text-red-50 shadow-[0_0_0_1px_rgba(248,113,113,0.4)] hover:border-red-400/70",
              isCorrect &&
                "border-emerald-400/70 bg-emerald-400/10 text-emerald-50 shadow-[0_0_0_1px_rgba(52,211,153,0.45)] hover:border-emerald-400/70",
            )}
          >
            <span className="flex w-full items-center justify-between">
              <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full border border-yellow-300/50 bg-yellow-300/10 px-1.5 text-[11px] font-semibold text-yellow-200">
                {choice.badge}
              </span>
              <span className="flex items-center gap-1.5 text-yellow-300/70 group-hover:text-yellow-200">
                {choice.direction && (
                  <DirectionIcon direction={choice.direction} className="h-3 w-3" />
                )}
                {isWrong && <XCircle className="h-3.5 w-3.5 text-red-300" />}
                {isCorrect && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" />}
              </span>
            </span>
            <span className="mt-1 flex w-full flex-col gap-0.5">
              <span className="text-[13px] font-semibold leading-5 text-white">
                {choice.labelJa}
              </span>
              <span className="text-[11px] leading-4 text-neutral-300">{choice.labelEn}</span>
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}
