"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mountain,
  Train,
  ArrowLeftRight,
  Wifi,
  ArrowRight,
  Plane,
  Shield,
  Car,
  Globe,
  Share2,
  Camera,
  Info,
} from "lucide-react";

// ================== Affiliate URLs ==================
// JR Pass（Klook）
const JR_PASS_URL =
  "https://affiliate.klook.com/redirect?aid=104861&aff_adid=1165791&k_site=https%3A%2F%2Fwww.klook.com%2Fen-US%2Factivity%2F1420-7-day-whole-japan-rail-pass-jr-pass%2F";

// eSIM
const ESIM_URL =
  "https://affiliate.klook.com/redirect?aid=104861&aff_adid=1166001&k_site=https%3A%2F%2Fwww.klook.com%2Fen-US%2Factivity%2F109393-japan-esim-high-speed-internet-qr-code-voucher%2F%3Fspm%3DSearchResult.SearchResult_LIST%26clickId%3D60b4e2e817";

// Airport transfer
const AIRPORT_TRANSFER_URL =
  "https://affiliate.klook.com/redirect?aid=104861&aff_adid=1165996&k_site=https%3A%2F%2Fwww.klook.com%2Fen-US%2Factivity%2F173165-narita-express-n-ex-round-trip-train-ticket-narita-airport-tokyo%2F%3Fspm%3DSearchResult.SearchResult_LIST%26clickId%3D91ab54bcac";

// Travel insurance（Klook Protect）
const TRAVEL_INSURANCE_URL =
  "https://affiliate.klook.com/redirect?aid=104861&aff_adid=1166002&k_site=https%3A%2F%2Fwww.klook.com%2Fen-US%2Finsurance%2Fklook-protect%2F";

// Car rental with driver（Private charter）
const CAR_RENTAL_URL =
  "https://affiliate.klook.com/redirect?aid=104861&aff_adid=1166009&k_site=https%3A%2F%2Fwww.klook.com%2Fen-US%2Factivity%2F15420-tokyo-private-car-charter-karuizawa-hakuba-izu-englishspeakingdriver%2F%3Fspm%3DSearchResult.SearchResult_LIST%26clickId%3D84732e1e5b";
// =====================================================

const directions = [
  { id: "tokyo-osaka", label: "Tokyo → Osaka / Kyoto" },
  { id: "osaka-tokyo", label: "Osaka / Kyoto → Tokyo" },
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
        <header className="mb-2 mt-2">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {/* Fuji logo */}
              <div className="relative h-11 w-11 rounded-2xl bg-gradient-to-b from-sky-300 to-sky-500 flex items-center justify-center shadow-sm">
                <Mountain className="h-6 w-6 text-white" />
                <div className="pointer-events-none absolute bottom-2 h-2.5 w-5 bg-white/95 rounded-t-[999px] rounded-b-[6px]" />
              </div>
              <div>
                <h1 className="text-lg font-semibold tracking-tight">
                  Shinkansen Mt. Fuji Seat Checker
                </h1>
                <p className="text-[11px] text-slate-500">
                  Find the Mt. Fuji side seat in just one tap.
                </p>
                <p className="mt-0.5 text-[10px] text-slate-500 flex items-center gap-1">
                  <Globe className="h-3 w-3 text-sky-600" />
                  <span>Built by a Japanese local for international travellers.</span>
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Description (SEO & UX) */}
        <p className="mb-1 text-[11px] text-slate-600 leading-relaxed">
          This free tool helps you find the best Shinkansen seat to see Mt. Fuji
          between Tokyo and Osaka/Kyoto. Choose your direction, tap “Check Best
          Seat”, and then book your Shinkansen tickets, eSIM and other travel
          essentials via Klook.
        </p>

        {/* Link to guide */}
        <p className="mb-3 text-[11px] text-slate-500">
          Want more details?{" "}
          <Link
            href="/guide"
            className="underline underline-offset-2 text-sky-700 hover:text-sky-800"
          >
            Read the Mt. Fuji &amp; Shinkansen guide
          </Link>
          .
        </p>

        {/* Steps */}
        <div className="mb-3 flex items-center justify-between text-[11px] text-slate-500">
          <span>1. Choose direction</span>
          <span>2. Tap “Check Best Seat”</span>
          <span>3. Book Seat E</span>
        </div>

        {/* Main card */}
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
                    onClick={() => {
                      setDirection(opt.id);
                      setHasChecked(false); // reset result when changing direction
                    }}
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

          {/* CTA */}
          <motion.button
            type="button"
            onClick={handleCheck}
            whileTap={{ scale: 0.97 }}
            className="mt-1 inline-flex items-center justify-center w-full rounded-2xl bg-gradient-to-r from-red-500 to-red-500 text-sm font-semibold tracking-tight py-3.5 text-white shadow-md shadow-red-200 hover:brightness-110 active:brightness-95 transition-all"
          >
            <span>Check Best Seat</span>
            <ArrowRight className="ml-2 h-4 w-4" />
          </motion.button>

          <p className="text-[11px] text-slate-500 leading-relaxed">
            Works for most Nozomi, Hikari and Kodama trains on the Tokaido
            Shinkansen line.
          </p>
        </section>

        {/* Result area */}
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
              {/* Result card */}
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

                <div className="flex items-center justify-between mb-4 gap-4">
                  <div>
                    <p className="text-xs font-medium tracking-[0.2em] uppercase text-slate-500">
                      Best seat
                    </p>
                    <p className="mt-1 text-[32px] leading-none font-semibold tracking-tight text-slate-900">
                      Seat <span className="text-red-500">E</span>
                    </p>
                    <p className="mt-1 text-sm text-slate-700 font-medium">
                      Best seat: <span className="font-semibold">Seat E</span>{" "}
                      (window, Mt. Fuji side)
                    </p>
                    <p className="text-[11px] text-slate-600 mt-1">
                      Most trains: choose window seat E on the Mt. Fuji side
                      for the best chance to{" "}
                      <span className="font-semibold">
                        see and photograph Mt. Fuji
                      </span>{" "}
                      from your seat.
                    </p>
                  </div>

                  {/* Fuji mini illustration */}
                  <div className="relative w-24 h-20 flex items-end justify-center">
                    <div className="w-16 h-12 bg-gradient-to-t from-sky-400 to-sky-200 rounded-t-full" />
                    <div className="absolute bottom-2 w-14 h-8 bg-slate-800 rounded-t-[999px] rounded-b-[10px]" />
                    <div className="absolute bottom-4 w-8 h-3 bg-white rounded-t-[999px] rounded-b-[6px]" />
                    <div className="absolute -top-1 w-6 h-6 bg-yellow-300 rounded-full opacity-80" />
                  </div>
                </div>

                {/* Seat diagram */}
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

                <p className="mt-3 text-[10px] text-slate-500 leading-relaxed">
                  Tip: Mt. Fuji is usually visible between Shin-Yokohama and
                  Shizuoka, especially around Shin-Fuji station, on clear days.
                  Have your camera or phone ready before this section.
                </p>

                {/* Mini FAQ with photo angle */}
                <div className="mt-4 bg-slate-50 border border-slate-200 rounded-2xl px-3 py-3 space-y-1.5">
                  <p className="text-[11px] font-medium text-slate-700 flex items-center gap-1">
                    <Info className="h-3.5 w-3.5 text-sky-600" />
                    <span>Quick FAQ for Mt. Fuji &amp; photos</span>
                  </p>
                  <p className="text-[10px] text-slate-600">
                    <span className="font-semibold">Q. Seat E is sold out?</span>{" "}
                    → Book seat <span className="font-semibold">D</span>. It&apos;s
                    on the same Mt. Fuji side, just one seat away from the
                    window.
                  </p>
                  <p className="text-[10px] text-slate-600">
                    <span className="font-semibold">
                      Q. What about Green Cars?
                    </span>{" "}
                    → Layouts can be different, but the same{" "}
                    <span className="font-semibold">left/right rule</span> still
                    applies for Mt. Fuji. Aim for the Mt. Fuji side window if
                    possible.
                  </p>
                  <p className="text-[10px] text-slate-600">
                    <span className="font-semibold">
                      Q. Is this seat good for photos?
                    </span>{" "}
                    → Yes. Window seat E gives you the best chance to take clear{" "}
                    <span className="font-semibold">
                      photos and videos of Mt. Fuji
                    </span>{" "}
                    without other passengers in front of you.
                  </p>
                  <p className="text-[10px] text-slate-600">
                    <span className="font-semibold">
                      Q. Is Mt. Fuji guaranteed?
                    </span>{" "}
                    → No. Cloudy or hazy weather can hide it even from the
                    correct seat.
                  </p>
                </div>

                <p className="mt-3 text-[10px] text-slate-500 leading-relaxed">
                  Ready to book? Check Shinkansen tickets on Klook below.
                </p>
              </div>

              {/* Main JR Pass button */}
              <motion.a
                href={JR_PASS_URL}
                target="_blank"
                rel="noopener noreferrer sponsored"
                whileTap={{ scale: 0.97 }}
                className="inline-flex flex-col items-center justify-center w-full rounded-2xl border border-red-500/80 bg-red-500 text-sm font-semibold tracking-tight py-3 text-white shadow-md shadow-red-200 hover:brightness-110 active:brightness-95 transition-all"
              >
                <span>Book Shinkansen tickets on Klook</span>
              </motion.a>

              {/* Travel essentials + Premium options */}
              <div className="mt-3 bg-white/90 border border-slate-200 rounded-2xl px-3 py-3 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-medium text-slate-700">
                    Travel essentials for your Japan trip
                  </p>
                  <span className="text-[10px] text-slate-400">
                    Powered by Klook
                  </span>
                </div>
                <p className="text-[10px] text-slate-500">
                  All links use Klook, a major travel booking platform popular
                  with visitors to Japan. We may earn a small commission at no
                  extra cost to you.
                </p>

                {/* Essentials */}
                <div className="mt-1.5 space-y-1.5 text-[11px]">
                  {/* 1. eSIM */}
                  <a
                    href={ESIM_URL}
                    target="_blank"
                    rel="noopener noreferrer sponsored"
                    className="flex items-center gap-1.5 text-sky-700 hover:underline underline-offset-2"
                  >
                    <Wifi className="h-3.5 w-3.5" />
                    <span>Japan eSIM – High-speed data in Japan</span>
                  </a>

                  {/* 2. JR Pass */}
                  <a
                    href={JR_PASS_URL}
                    target="_blank"
                    rel="noopener noreferrer sponsored"
                    className="flex items-center gap-1.5 text-sky-700 hover:underline underline-offset-2"
                  >
                    <Train className="h-3.5 w-3.5" />
                    <span>
                      JR Pass – Long-distance train pass across Japan
                    </span>
                  </a>

                  {/* 3. Airport transfer */}
                  <a
                    href={AIRPORT_TRANSFER_URL}
                    target="_blank"
                    rel="noopener noreferrer sponsored"
                    className="flex items-center gap-1.5 text-sky-700 hover:underline underline-offset-2"
                  >
                    <Plane className="h-3.5 w-3.5" />
                    <span>Airport transfer – Narita Express (N&apos;EX)</span>
                  </a>

                  {/* 4. Insurance */}
                  <a
                    href={TRAVEL_INSURANCE_URL}
                    target="_blank"
                    rel="noopener noreferrer sponsored"
                    className="flex items-center gap-1.5 text-sky-700 hover:underline underline-offset-2"
                  >
                    <Shield className="h-3.5 w-3.5" />
                    <span>
                      Klook Protect – Flexible travel insurance &amp; booking
                      upgrades
                    </span>
                  </a>
                </div>

                {/* Premium section */}
                <div className="pt-2 mt-2 border-t border-slate-100 space-y-1.5 text-[11px]">
                  <p className="text-[10px] font-medium text-slate-600">
                    Premium &amp; family-friendly option
                  </p>
                  <a
                    href={CAR_RENTAL_URL}
                    target="_blank"
                    rel="noopener noreferrer sponsored"
                    className="flex items-center gap-1.5 text-sky-700 hover:underline underline-offset-2"
                  >
                    <Car className="h-3.5 w-3.5" />
                    <span>
                      Private car charter – Tokyo to resorts (Karuizawa,
                      Hakuba, Izu)
                    </span>
                  </a>
                </div>

                {/* Share / screenshot hint */}
                <div className="pt-2 mt-2 border-t border-slate-100">
                  <p className="text-[10px] text-slate-600 flex items-center gap-1">
                    <Share2 className="h-3.5 w-3.5 text-slate-500" />
                    <span>
                      Take a screenshot and share this with friends visiting
                      Japan or planning Mt. Fuji photos.
                    </span>
                  </p>
                  <div className="mt-1.5 rounded-xl bg-slate-50 border border-dashed border-slate-200 px-3 py-2">
                    <p className="text-[10px] text-slate-700 flex items-start gap-1.5">
                      <Camera className="h-3 w-3 mt-[2px]" />
                      <span>
                        Tokyo → Osaka/Kyoto: right side, seat E (window). <br />
                        Osaka/Kyoto → Tokyo: left side, seat E (window). <br />
                        Perfect spot for Mt. Fuji shots from the train.
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        <div className="flex-1" />

        {/* Footer eSIM link */}
        <footer className="pt-6 pb-3">
          <a
            href={ESIM_URL}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 hover:text-sky-700 transition-colors"
          >
            <Wifi className="h-3.5 w-3.5" />
            <span>
              Need data in Japan?{" "}
              <span className="underline underline-offset-2">
                Get instant eSIM here
              </span>
            </span>
          </a>

          <p className="mt-2 text-[9px] text-center text-slate-400">
            Built by a Japanese AI &amp; travel enthusiast.
          </p>
        </footer>
      </div>
    </main>
  );
}
