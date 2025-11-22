"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mountain,
  Train,
  ArrowLeftRight,
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
    <main className="min-h-screen bg-gradient-to-b from-sky-100 via-sky-50 to-white text-slate-900 flex flex-col">
      <div className="flex-1 flex flex-col px-4 py-6 max-w-md mx-auto w-full">
        {/* Header / Branding */}
        <header className="mb-6 mt-2">
          <div className="flex items-center gap-3">
            {/* Fuji logo */}
            <div className="relative h-11 w-11 rounded-2xl bg-gradient-to-b from-sky-300 to-sky-500 flex items-center justify-center shadow-sm">
              <Mountain className="h-6 w-6 text-white" />
              {/* snow cap */}
              <div className="pointer-events-none absolute bottom-2 h-2.5 w-5 bg-white/95 rounded-t-[999px] rounded-b-[6px]" />
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight">
                Shinkansen Mt. Fuji Seat Checker
              </h1>
              <p className="text-xs text-slate-500">
                Find the Mt. Fuji side seat in just one tap.
              </p>
            </div>
          </div>
        </header>

        {/* Step hint */}
        <div className="mb-3 flex items-center justify-between text-[11px] text-slate-500">
          <span>1. Choose direction</span>
          <span>2. Tap “Check Best Seat”</span>
          <span>3. Book Seat E</span>
        </div>

        {/* Main Card */}
        <section className="bg-white/90 border border-slate-200 rounded-3xl px-4 py-5 shadow-md shadow-slate-200/70 backdrop-blur flex flex-col gap-4">
          {/* Direction selector */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                Direction
              </span>
              <ArrowLeftRight className="h-4 w-4 text-slate-400" />
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-full p-1 flex text-xs">
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
                        ? "bg-sky-500 text-white shadow-sm"
                        : "text-slate-600 hover:bg-slate-100",
                    ].join(" ")}
                  >
                    <Train className="h-3.5 w-3.5" />
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
            className="mt-1 inline-flex items-center justify-center w-full rounded-2xl bg-gradient-to-r from-red-500 to-red-500 text-sm font-semibold tracking-tight py-3.5 text-white shadow-md shadow-red-200 hover:brightness-110 active:brightness-95 transition-all"
          >
            <span>Check Best Seat</span>
            <ArrowRight className="ml-2 h-4 w-4" />
          </motion.button>

          {/* Tiny helper text */}
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Works for most Nozomi, Hikari and Kodama trains on the Tokaido
            Shinkansen line.
          </p>
        </section>

        {/* Result area with animation */}
        <AnimatePresence mode="wait" initial={false}>
          {hasChecked && (
            <motion.section
              key={direction}
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.28, ease: "easeOut" }}
              className="mt-6 space-y-4"
            >
              {/* Result Card */}
              <div className="bg-white border border-slate-200 rounded-3xl px-4 py-5 shadow-md shadow-slate-200/80">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-full bg-sky-50 border border-sky-200 text-sky-700">
                    <Mountain className="h-3.5 w-3.5" />
                    Mt. Fuji view side
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Direction:{" "}
                    <span className="font-medium text-slate-700">
                      {currentDirectionLabel}
                    </span>
                  </span>
                </div>

                {/* Seat Highlight */}
                <div className="flex items-center justify-between mb-4 gap-4">
                  <div>
                    <p className="text-xs font-medium tracking-[0.2em] uppercase text-slate-500">
                      Best seat
                    </p>

                    {/* big Seat E */}
                    <p className="mt-1 text-[32px] leading-none font-semibold tracking-tight text-slate-900">
                      Seat <span className="text-red-500">E</span>
                    </p>

                    {/* main explanation */}
                    <p className="mt-1 text-sm text-slate-700 font-medium">
                      Best seat: <span className="font-semibold">Seat E</span>{" "}
                      (window, Mt. Fuji side)
                    </p>

                    {/* small helper sentence */}
                    <p className="text-[11px] text-slate-600 mt-1">
                      Most trains: choose window seat E for the best Mt. Fuji
                      view.
                    </p>
                  </div>

                  {/* Simple Fuji sketch */}
                  <div className="relative w-24 h-20 flex items-end justify-center">
                    <div className="w-16 h-12 bg-gradient-to-t from-sky-400 to-sky-200 rounded-t-full" />
                    <div className="absolute bottom-2 w-14 h-8 bg-slate-800 rounded-t-[999px] rounded-b-[10px]" />
                    <div className="absolute bottom-4 w-8 h-3 bg-white rounded-t-[999px] rounded-b-[6px]" />
                    <div className="absolute -top-1 w-6 h-6 bg-yellow-300 rounded-full opacity-80" />
                  </div>
                </div>

                {/* Simple seat diagram */}
                <div className="mt-2 space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>Sea side</span>
                    <span className="italic text-slate-400">Aisle</span>
                    <span className="font-medium text-sky-700">
                      Mt. Fuji / Window side
                    </span>
                  </div>

                  <div className="bg-slate-50 rounded-2xl border border-slate-200 px-3 py-3">
                    <div className="flex items-center justify-between gap-2 mb-2 text-[11px] text-slate-500">
                      <span className="flex-1 text-center">
                        Example row (standard car)
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      {/* ABC block */}
                      <div className="flex flex-1 gap-1 justify-start">
                        {["A", "B", "C"].map((seat) => (
                          <div
                            key={seat}
                            className="flex-1 aspect-[3/3] min-w-[2.2rem] rounded-xl border border-slate-200 bg-white flex items-center justify-center text-xs text-slate-700"
                          >
                            {seat}
                          </div>
                        ))}
                      </div>

                      {/* Aisle */}
                      <div className="w-9 flex flex-col items-center justify-center">
                        <div className="h-full w-px bg-slate-200 rounded-full" />
                        <span className="mt-1 text-[10px] text-slate-400">
                          Aisle
                        </span>
                      </div>

                      {/* DE block */}
                      <div className="flex flex-1 gap-1 justify-end">
                        <div className="flex-1 aspect-[3/3] min-w-[2.2rem] rounded-xl border border-slate-200 bg-white flex items-center justify-center text-xs text-slate-700">
                          D
                        </div>
                        <div className="flex-1 aspect-[3/3] min-w-[2.2rem] rounded-xl border border-red-400 bg-red-500 text-white flex items-center justify-center text-xs font-semibold shadow-sm shadow-red-200">
                          E
                        </div>
                      </div>
                    </div>

                    <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500">
                      <span>Train interior</span>
                      <span className="font-medium text-sky-700">
                        Window / Mt. Fuji side →
                      </span>
                    </div>
                  </div>
                </div>

                {/* Small note */}
                <p className="mt-3 text-[10px] text-slate-500 leading-relaxed">
                  Tip: Mt. Fuji is usually visible between Shin-Yokohama and
                  Shizuoka, especially around Shin-Fuji station, on clear days.
                </p>
              </div>

              {/* Monetization CTA: Book tickets */}
              <motion.a
                href="#"
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center justify-center w-full rounded-2xl border border-red-500/80 bg-red-500 text-sm font-semibold tracking-tight py-3 text-white shadow-md shadow-red-200 hover:brightness-110 active:brightness-95 transition-all"
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
            className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 hover:text-sky-700 transition-colors"
          >
            <Wifi className="h-3.5 w-3.5" />
            <span>
              Need WiFi?{" "}
              <span className="underline underline-offset-2">Get eSIM</span>
            </span>
          </a>
        </footer>
      </div>
    </main>
  );
}
