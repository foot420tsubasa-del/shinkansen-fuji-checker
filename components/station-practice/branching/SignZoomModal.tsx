"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import type { SignOverlay } from "@/data/station-practice/branching/types";
import { SignBadge } from "./SignBadge";

/*
 * Fullscreen "inspect signs" modal.
 *
 * Triggered by clicking any sign in the scene, or by the "Inspect signs"
 * button in the top bar. Renders ALL signs from the current scene at
 * large readable size so the player can study Japanese-first wayfinding
 * without squinting.
 */

type Props = {
  open: boolean;
  signs: SignOverlay[];
  onClose: () => void;
};

export function SignZoomModal({ open, signs, onClose }: Props) {
  useEffect(() => {
    if (!open) return;
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="zoom-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex flex-col bg-black/85 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Inspect signs"
        >
          <header className="flex items-center justify-between border-b border-white/10 px-5 py-4">
            <div className="text-xs uppercase tracking-[0.2em] text-yellow-300">
              Inspect signs
            </div>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-neutral-200 hover:bg-white/10"
            >
              <X className="h-3.5 w-3.5" />
              Close
            </button>
          </header>
          <div className="flex-1 overflow-y-auto px-5 py-8">
            <div className="mx-auto flex max-w-3xl flex-col gap-4">
              {signs.length === 0 ? (
                <p className="text-sm text-neutral-400">
                  No signs visible in this scene.
                </p>
              ) : (
                signs.map((sign) => (
                  <motion.div
                    key={sign.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                    className="h-24 sm:h-32"
                  >
                    <SignBadge sign={sign} zoom />
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
