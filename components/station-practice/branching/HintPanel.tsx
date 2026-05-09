"use client";

import { Lightbulb } from "lucide-react";
import { cn } from "@/components/station-practice/lib/utils";

type Props = {
  hint?: string;
  revealed: boolean;
  onReveal: () => void;
};

export function HintPanel({ hint, revealed, onReveal }: Props) {
  return (
    <section className="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-3.5 w-3.5 text-yellow-300" />
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-yellow-300">
            Hint
          </span>
        </div>
        {hint && !revealed && (
          <button
            type="button"
            onClick={onReveal}
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
          revealed ? "text-neutral-200" : "text-neutral-600",
        )}
      >
        {!hint
          ? "No hint for this scene."
          : revealed
            ? hint
            : "Hint hidden — reveal if you're stuck."}
      </p>
    </section>
  );
}
