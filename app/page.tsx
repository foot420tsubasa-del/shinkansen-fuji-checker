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
  ExternalLink,
  Share2,
  Info,
  ShieldCheck,
  Car,
} from "lucide-react";

// ================== Affiliate URLs ==================

// JR Pass（Klook）
const JR_PASS_URL =
  "https://affiliate.klook.com/redirect?aid=104861&aff_adid=1165791&k_site=https%3A%2F%2Fwww.klook.com%2Fen-US%2Factivity%2F1420-7-day-whole-japan-rail-pass-jr-pass%2F";

// eSIM
const ESIM_URL =
  "https://affiliate.klook.com/redirect?aid=104861&aff_adid=1166001&k_site=https%3A%2F%2Fwww.klook.com%2Fen-US%2Factivity%2F109393-japan-esim-high-speed-internet-qr-code-voucher%2F%3Fspm%3DSearchResult.SearchResult_LIST%26clickId%3D60b4e2e817";

// Airport transfer / Narita Express
const AIRPORT_TRANSFER_URL =
  "https://affiliate.klook.com/redirect?aid=104861&aff_adid=1165996&k_site=https%3A%2F%2Fwww.klook.com%2Fen-US%2Factivity%2F173165-narita-express-n-ex-round-trip-train-ticket-narita-airport-tokyo%2F%3Fspm%3DSearchResult.SearchResult_LIST%26clickId%3D91ab54bcac";

// Travel insurance（Klook Protect）
const INSURANCE_URL =
  "https://affiliate.klook.com/redirect?aid=104861&aff_adid=1166002&k_site=https%3A%2F%2Fwww.klook.com%2Fen-US%2Finsurance%2Fklook-protect%2F";

// Private car charter
const CAR_RENTAL_URL =
  "https://affiliate.klook.com/redirect?aid=104861&aff_adid=1166009&k_site=https%3A%2F%2Fwww.klook.com%2Fen-US%2Factivity%2F15420-tokyo-private-car-charter-karuizawa-hakuba-izu-englishspeakingdriver%2F%3Fspm%3DSearchResult.SearchResult_LIST%26clickId%3D84732e1e5b";

// JR Central official article (Mt. Fuji from Shinkansen)
const JR_CENTRAL_SOURCE_URL =
  "https://recommend.jr-central.co.jp/shizuoka-tabi/articles/01/";

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
        <header className="mb-6 mt-2">
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
              <p className="text-xs text-slate-500">
                Get the Mt. Fuji side window seat in two taps on the Tokaido
                Shinkansen (Tokyo ⇄ Osaka/Kyoto).
              </p>
              <p className="mt-1 text-[11px] text-slate-500">
                Built by a Japanese AI &amp; travel enthusiast for international
                travellers who don&apos;t want to miss the Mt. Fuji view.
              </p>
              {/* 公開データ＋非公式ツールの明記 */}
              <p className="mt-1 text-[10px] text-slate-500">
                Based on publicly available information from JR Central{" "}
                <a
                  href={JR_CENTRAL_SOURCE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2 text-sky-700"
                >
                  [view source]
                </a>
                . This is an independent, unofficial tool and not endorsed by
                any JR company. Seat info is provided as-is; always follow
                official guidance at stations and on trains.
              </p>
            </div>
          </div>
        </header>

        {/* Steps */}
        <div className="mb-3 flex items-center justify-between text-[11px] text-slate-500">
          <span>1. Choose direction</span>
          <span>2. Tap “Check Best Seat”</span>
          <span>3. Book Seat E</span>
        </div>

        {/* Main card */}
        <section className="bg-white/90 border border-slate-200 rounded-3xl px-4 py-5 shadow-md shadow-slate-200/70 backdrop-blur flex flex-col gap-4">
          {/* Tagline */}
          <div className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-700">
              Stop staring at walls.
            </p>
            <p className="text-sm font-semibold text-slate-900">
              We tell you exactly which window seat to book for the Mt. Fuji
              view.
            </p>
          </div>

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
                      setHasChecked(false); // reset result when direction changes
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
            <span>Check best seat</span>
            <ArrowRight className="ml-2 h-4 w-4" />
          </motion.button>

          <p className="text-[11px] text-slate-500 leading-relaxed">
            Works for most Nozomi, Hikari and Kodama trains on the Tokaido
            Shinkansen line between Tokyo, Nagoya and Osaka/Kyoto.
          </p>

          {/* Link to guide */}
          <Link
            href="/guide"
            className="inline-flex items-center gap-1.5 text-[11px] text-sky-700 hover:underline underline-offset-2"
          >
            <Info className="h-3.5 w-3.5" />
            <span>Read the full Mt. Fuji view guide</span>
            <ExternalLink className="h-3 w-3" />
          </Link>
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
                      <span className="font-semibold">Seat E</span> is the
                      window seat on the Mt. Fuji side in most standard 3+2
                      cars.
                    </p>
                    <p className="text-[11px] text-slate-600 mt-1">
                      If Seat E is sold out, Seat D is on the same side and
                      still gives you a good chance to see Mt. Fuji.
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
                      Mt. Fuji / window side
                    </span>
                  </div>

                  <div className="bg-slate-50 rounded-2xl border border-slate-200 px-3 py-3">
                    <div className="flex items-center justify-between gap-2 mb-2 text-[11px] text-slate-500">
                      <span className="flex-1 text-center">
                        Example row (standard 3+2 car)
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

                {/* Tip & FAQ */}
                <p className="mt-3 text-[10px] text-slate-500 leading-relaxed">
                  Mt. Fuji is usually visible between Shin-Yokohama and
                  Shizuoka, especially around Shin-Fuji station on clear days.
                  You won&apos;t see it for the whole ride, so have your camera
                  ready a bit before this section.
                </p>

                <div className="mt-3 rounded-2xl bg-slate-50 border border-slate-200 px-3 py-3 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-700">
                    <Info className="h-3.5 w-3.5" />
                    <span>Quick FAQ about Mt. Fuji &amp; seats</span>
                  </div>
                  <ul className="mt-1 space-y-1.5 text-[10px] text-slate-600">
                    <li>
                      <span className="font-semibold">Seat E is sold out?</span>{" "}
                      → Book seat D. It&apos;s on the same Mt. Fuji side, just
                      one seat away from the window.
                    </li>
                    <li>
                      <span className="font-semibold">
                        What about Green Cars?
                      </span>{" "}
                      → Layouts can be different, but the same left/right rule
                      still applies for Mt. Fuji. Aim for a window seat on the
                      Mt. Fuji side if possible.
                    </li>
                    <li>
                      <span className="font-semibold">
                        Is this seat good for photos?
                      </span>{" "}
                      → Yes. Window seat E gives you one of the best chances to
                      take clear photos and videos of Mt. Fuji from the train,
                      without other passengers directly in front of you.
                    </li>
                    <li>
                      <span className="font-semibold">
                        Is Mt. Fuji guaranteed?
                      </span>{" "}
                      → No. Cloudy or hazy weather can hide it even from the
                      correct seat.
                    </li>
                  </ul>
                </div>

                {/* Share hint */}
                <div className="mt-3 flex items-start gap-2 rounded-2xl bg-slate-50 border border-slate-200 px-3 py-2.5">
                  <Share2 className="h-3.5 w-3.5 mt-[2px] text-slate-400" />
                  <p className="text-[10px] text-slate-600 leading-relaxed">
                    Planning a trip with friends? Take a screenshot and share it
                    with them so they remember:
                    <br />
                    <span className="font-medium">
                      • Tokyo → Osaka/Kyoto: right side, Seat E
                      <br />• Osaka/Kyoto → Tokyo: left side, Seat E
                    </span>
                    <br />
                    It&apos;s one of the easiest ways to get that Mt. Fuji ×
                    Shinkansen shot.
                  </p>
                </div>
              </div>

              {/* Main JR Pass button */}
              <motion.a
                href={JR_PASS_URL}
                target="_blank"
                rel="noopener noreferrer"
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center justify-center w-full rounded-2xl border border-red-500/80 bg-red-500 text-sm font-semibold tracking-tight py-3 text-white shadow-md shadow-red-200 hover:brightness-110 active:brightness-95 transition-all"
              >
                Book Shinkansen tickets / JR Pass on Klook
              </motion.a>

              {/* Travel essentials block */}
              <div className="mt-3 bg-white/90 border border-slate-200 rounded-2xl px-3 py-3 space-y-2">
                <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-700">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>Travel essentials for your Japan trip</span>
                </div>
                <p className="text-[10px] text-slate-500">
                  Links below are Klook affiliate links. We may earn a small
                  commission at no extra cost to you. Klook supports multiple
                  languages and currencies — you can change them from the menu
                  on each Klook page.
                </p>
                <div className="space-y-1.5 text-[11px]">
                  <a
                    href={JR_PASS_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sky-700 hover:underline underline-offset-2"
                  >
                    <Train className="h-3.5 w-3.5" />
                    <span>JR Pass &amp; Shinkansen tickets (long distance)</span>
                  </a>
                  <a
                    href={ESIM_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sky-700 hover:underline underline-offset-2"
                  >
                    <Wifi className="h-3.5 w-3.5" />
                    <span>Japan eSIM – stay online during your trip</span>
                  </a>
                  <a
                    href={AIRPORT_TRANSFER_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sky-700 hover:underline underline-offset-2"
                  >
                    <Train className="h-3.5 w-3.5" />
                    <span>Narita Express / airport transfer to Tokyo</span>
                  </a>
                  <a
                    href={INSURANCE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sky-700 hover:underline underline-offset-2"
                  >
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span>
                      Klook Protect – travel insurance for peace of mind
                    </span>
                  </a>
                  <a
                    href={CAR_RENTAL_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sky-700 hover:underline underline-offset-2"
                  >
                    <Car className="h-3.5 w-3.5" />
                    <span>
                      Private car charter – for families &amp; premium trips
                    </span>
                  </a>
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        <div className="flex-1" />

        {/* Footer eSIM link + disclaimer */}
        <footer className="pt-6 pb-3 space-y-2">
          <a
            href={ESIM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 hover:text-sky-700 transition-colors"
          >
            <Wifi className="h-3.5 w-3.5" />
            <span>
              Need WiFi?{" "}
              <span className="underline underline-offset-2">Get eSIM</span>
            </span>
          </a>
          <p className="text-[10px] text-center text-slate-400 leading-relaxed">
            Based on publicly available information from JR Central. This is an
            independent, unofficial tool and not endorsed by any JR company.
            Seat info is provided as-is; always follow official guidance at
            stations and on trains.
          </p>
          <p className="text-[9px] text-center text-slate-400">
            Built by a Japanese AI &amp; travel enthusiast. Powered by Klook
            affiliate links.
          </p>
        </footer>
      </div>
    </main>
  );
}
