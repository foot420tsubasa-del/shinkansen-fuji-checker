"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mountain,
  Train,
  ArrowRightLeft,
  Wifi,
  ArrowRight,
} from "lucide-react";

const directions = [
  {
    id: "tokyo-osaka",
    label: "Tokyo → Osaka / Kyoto",
  },
  {
    id: "osaka-tokyo",
    label: "Osaka / Kyoto → Tokyo",
  },
] as const;

type DirectionId = (typeof directions)[number]["id"];

export default function HomePage() {
  const [direction, setDirection] = useState<DirectionId>("tokyo-osaka");
  const [hasChecked, setHasChecked] = useState(false);

  const handleCheck = () => {
    setHasChecked(true);
  };

  const currentDirectionLabel =
    direction === "tokyo-osaka"
      ? "Tokyo → Osaka / Kyoto"
      : "Osaka / Kyoto → Tokyo";

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-50 flex flex-col">
      <div className="flex-1 flex flex-col px-4 py-6 max-w-md mx-auto w-full">
        {/* Header / Branding */}
        <header className="mb-6 mt-2">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-9 w-9 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-900/50">
              <Mountain className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight">
                Shinkansen Mt. Fuji Side Checker
              </h1>
              <p className="text-xs text-indigo-100/80">
                Find the best seat to see Mt. Fuji on the bullet train.
              </p>
            </div>
          </div>
        </header>

        {/* Main Card */}
        <section className="bg-slate-950/70 border border-indigo-500/30 rounded-3xl px-4 py-5 shadow-xl shadow-black/40 backdrop-blur flex flex-col gap-4">
          {/* Direction selector */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-[0.18em] text-indigo-200/80">
                Direction
              </span>
              <ArrowRightLeft className="h-4 w-4 text-indigo-300/70" />
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-full p-1 flex text-xs">
              {directions.map((opt) => {
                const active = opt.id === direction;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setDirection(opt.id)}
                    className={[
                      "flex-1 px-3 py-2 rounded-full transition-all duration-150",
                      "flex items-center justify-center gap-1.5",
                      active
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-900/70"
                        : "text-slate-300 hover:text-white",
                    ].join(" ")}
                  >
                    {opt.id === "tokyo-osaka" ? (
                      <Train className="h-3.5 w-3.5" />
                    ) : (
                      <Train className="h-3.5 w-3.5" />
                    )}
                    <span className="truncate">{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* CTA Button */}
          <motion.button
            type="button"
            onClick={handleCheck}
            whileTap={{ scale: 0.97 }}
            className="mt-1 inline-flex items-center justify-center w-full rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-red-500 text-sm font-semibold tracking-tight py-3.5 shadow-lg shadow-indigo-900/60 hover:brightness-110 active:brightness-95 transition-all"
          >
            <span>Check Best Seat</span>
            <ArrowRight className="ml-2 h-4 w-4" />
          </motion.button>

          {/* Tiny helper text */}
          <p className="text-[11px] text-slate-300/90 leading-relaxed">
            Works for most Nozomi, Hikari, and Kodama trains on the Tokaido
            Shinkansen line.
          </p>
        </section>

        {/* Result area with animation */}
        <AnimatePresence mode="wait" initial={false}>
          {hasChecked && (
            <motion.section
              key={direction}
              initial={{ opacity: 0, y: 16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.98 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="mt-6 space-y-4"
            >
              {/* Result Card */}
              <div className="bg-slate-950/80 border border-indigo-500/30 rounded-3xl px-4 py-5 shadow-xl shadow-black/40 backdrop-blur">
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-full bg-indigo-600/20 border border-indigo-500/40 text-indigo-100">
                    <Mountain className="h-3.5 w-3.5" />
                    Mt. Fuji view side
                  </span>
                </div>

                <p className="text-xs text-slate-300/90 mb-3">
                  Direction:&nbsp;
                  <span className="font-medium text-slate-50">
                    {currentDirectionLabel}
                  </span>
                </p>

                {/* Seat Highlight */}
                <div className="flex items-baseline gap-3 mb-4">
                  <p className="text-xs font-medium tracking-[0.2em] uppercase text-indigo-200/80">
                    Best seat
                  </p>
                </div>

                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-[32px] leading-none font-semibold tracking-tight">
                      Seat{" "}
                      <span className="text-red-500 drop-shadow-[0_0_8px_rgba(248,113,113,0.6)]">
                        E
                      </span>
                    </p>
                    <p className="text-xs text-slate-300/95 mt-1">
                      <span className="font-medium">(Mountain Side)</span> —
                      window seat with Mt. Fuji view.
                    </p>
                  </div>
                  <div className="flex flex-col items-end text-[10px] text-slate-300/80">
                    <span className="flex items-center gap-1">
                      <Train className="h-3.5 w-3.5 text-indigo-300" /> Car
                      layout example
                    </span>
                    <span>Reserved or non-reserved cars</span>
                  </div>
                </div>

                {/* Simple seat diagram */}
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-slate-300/90">
                    <span>Sea side</span>
                    <span className="italic text-slate-400">Aisle</span>
                    <span className="font-medium text-red-400">
                      Mt. Fuji / Window side
                    </span>
                  </div>

                  <div className="bg-slate-900/80 rounded-2xl border border-slate-800 px-3 py-3">
                    <div className="flex items-center justify-between gap-2 mb-1.5 text-[11px] text-slate-300/80">
                      <span className="flex-1 text-center">Row</span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      {/* ABC block */}
                      <div className="flex flex-1 gap-1 justify-start">
                        {["A", "B", "C"].map((seat) => (
                          <div
                            key={seat}
                            className="flex-1 aspect-[3/3] min-w-[2.2rem] rounded-xl border border-slate-700 bg-slate-900/90 flex items-center justify-center text-xs text-slate-200"
                          >
                            {seat}
                          </div>
                        ))}
                      </div>

                      {/* Aisle */}
                      <div className="w-8 flex flex-col items-center justify-center">
                        <div className="h-full w-px bg-slate-700 rounded-full" />
                        <span className="mt-1 text-[10px] text-slate-400">
                          Aisle
                        </span>
                      </div>

                      {/* DE block */}
                      <div className="flex flex-1 gap-1 justify-end">
                        <div className="flex-1 aspect-[3/3] min-w-[2.2rem] rounded-xl border border-slate-700 bg-slate-900/90 flex items-center justify-center text-xs text-slate-200">
                          D
                        </div>
                        <div className="flex-1 aspect-[3/3] min-w-[2.2rem] rounded-xl border border-red-500 bg-red-500 text-white flex items-center justify-center text-xs font-semibold shadow-lg shadow-red-500/50">
                          E
                        </div>
                      </div>
                    </div>

                    <div className="mt-2 flex items-center justify-between text-[10px] text-slate-300/80">
                      <span>Train interior</span>
                      <span className="font-medium text-red-300">
                        Window / Mt. Fuji side →
                      </span>
                    </div>
                  </div>
                </div>

                {/* Small note */}
                <p className="mt-3 text-[10px] text-slate-400 leading-relaxed">
                  Tip: Mt. Fuji is usually visible between Shin-Yokohama and
                  Shizuoka, especially around Shin-Fuji station on clear days.
                </p>
              </div>

              {/* Monetization CTA: Book tickets */}
              <motion.a
                href="#"
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center justify-center w-full rounded-2xl border border-red-500/70 bg-gradient-to-r from-red-600 to-red-500 text-sm font-semibold tracking-tight py-3 text-white shadow-lg shadow-red-900/60 hover:brightness-110 active:brightness-95 transition-all"
              >
                Book Tickets Here
              </motion.a>
            </motion.section>
          )}
        </AnimatePresence>

        <div className="flex-1" />

        {/* Footer eSIM link */}
        <footer className="pt-6 pb-3">
          <a
            href="#"
            className="flex items-center justify-center gap-1.5 text-[11px] text-indigo-200/85 hover:text-red-400 transition-colors"
          >
            <Wifi className="h-3.5 w-3.5" />
            <span>
              Need WiFi? <span className="underline underline-offset-2">Get eSIM</span>
            </span>
          </a>
        </footer>
      </div>
    </main>
  );
}
