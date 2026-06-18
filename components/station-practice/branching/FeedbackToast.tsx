"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, XCircle } from "lucide-react";
import type { ChoiceResult } from "@/data/station-practice/branching/types";
import { cn } from "@/components/station-practice/lib/utils";
import { useTr } from "@/components/station-practice/lib/useTr";

type Props = {
  open: boolean;
  result: ChoiceResult | null;
  message: string | null;
  /** Visible on wrong; hidden on correct because correct auto-advances. */
  onDismiss?: () => void;
};

export function FeedbackToast({ open, result, message, onDismiss }: Props) {
  const t = useTr();
  return (
    <AnimatePresence>
      {open && result && message && (
        <motion.div
          key="feedback"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          role="status"
          className={cn(
            "pointer-events-auto mx-auto max-w-xl rounded-xl border px-4 py-3 text-sm backdrop-blur-sm",
            result === "correct"
              ? "border-emerald-400/40 bg-emerald-500/10 text-emerald-50"
              : result === "wrong"
                ? "border-red-400/40 bg-red-500/10 text-red-50"
                : "border-yellow-300/40 bg-yellow-300/10 text-yellow-50",
          )}
        >
          <div className="flex items-start gap-2">
            {result === "correct" ? (
              <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-300" />
            ) : result === "wrong" ? (
              <XCircle className="mt-0.5 h-4 w-4 text-red-300" />
            ) : null}
            <div className="flex-1">
              <div className="font-semibold">
                {result === "correct"
                  ? t("Right call")
                  : result === "wrong"
                    ? t("Not quite")
                    : t("Note")}
              </div>
              <p className="mt-1 leading-6">{message}</p>
            </div>
            {onDismiss && result !== "correct" && (
              <button
                type="button"
                onClick={onDismiss}
                className="ml-2 shrink-0 rounded border border-white/15 bg-white/5 px-2 py-1 text-[11px] font-medium text-neutral-200 hover:bg-white/10"
              >
                {t("Try again")}
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
