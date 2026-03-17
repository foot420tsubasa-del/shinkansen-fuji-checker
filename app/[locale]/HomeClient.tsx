"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
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
  Cloud,
  CloudSun,
  Sun,
} from "lucide-react";
import { KlookCTA } from "./components/KlookCTA";
import { LanguageSelector } from "./components/LanguageSelector";
import { Link } from "@/i18n/navigation";

// ================== Affiliate URLs ==================
const JR_PASS_URL =
  "https://affiliate.klook.com/redirect?aid=104861&aff_adid=1165791&k_site=https%3A%2F%2Fwww.klook.com%2Fen-US%2Factivity%2F1420-7-day-whole-japan-rail-pass-jr-pass%2F";
const ESIM_URL =
  "https://affiliate.klook.com/redirect?aid=104861&aff_adid=1166001&k_site=https%3A%2F%2Fwww.klook.com%2Fen-US%2Factivity%2F109393-japan-esim-high-speed-internet-qr-code-voucher%2F%3Fspm%3DSearchResult.SearchResult_LIST%26clickId%3D60b4e2e817";
const AIRPORT_TRANSFER_URL =
  "https://affiliate.klook.com/redirect?aid=104861&aff_adid=1165996&k_site=https%3A%2F%2Fwww.klook.com%2Fen-US%2Factivity%2F173165-narita-express-n-ex-round-trip-train-ticket-narita-airport-tokyo%2F%3Fspm%3DSearchResult.SearchResult_LIST%26clickId%3D91ab54bcac";
const INSURANCE_URL =
  "https://affiliate.klook.com/redirect?aid=104861&aff_adid=1166002&k_site=https%3A%2F%2Fwww.klook.com%2Fen-US%2Finsurance%2Fklook-protect%2F";
const CAR_RENTAL_URL =
  "https://affiliate.klook.com/redirect?aid=104861&aff_adid=1166009&k_site=https%3A%2F%2Fwww.klook.com%2Fen-US%2Factivity%2F15420-tokyo-private-car-charter-karuizawa-hakuba-izu-englishspeakingdriver%2F%3Fspm%3DSearchResult.SearchResult_LIST%26clickId%3D84732e1e5b";
const JR_CENTRAL_SOURCE_URL =
  "https://recommend.jr-central.co.jp/shizuoka-tabi/articles/01/";
// =====================================================

type DirectionId = "tokyo-osaka" | "osaka-tokyo";
type VisibilityLevel = "high" | "medium" | "low";
type FujiVisibility = {
  visibility: VisibilityLevel;
  cloudPercent: number;
  message: string;
};

export default function HomeClient() {
  const t = useTranslations("home");

  const directions: { id: DirectionId; label: string }[] = [
    { id: "tokyo-osaka", label: t("dirToOsaka") },
    { id: "osaka-tokyo", label: t("dirToTokyo") },
  ];

  const [direction, setDirection] = useState<DirectionId>("tokyo-osaka");
  const [hasChecked, setHasChecked] = useState(false);
  const [visData, setVisData] = useState<FujiVisibility | null>(null);
  const [visLoading, setVisLoading] = useState(true);
  const [visError, setVisError] = useState(false);

  const handleCheck = () => setHasChecked(true);

  const currentDirectionLabel =
    direction === "tokyo-osaka" ? t("dirToOsaka") : t("dirToTokyo");

  useEffect(() => {
    const fetchVisibility = async () => {
      try {
        setVisLoading(true);
        setVisError(false);
        const res = await fetch("/api/fuji-visibility");
        if (!res.ok) throw new Error("Failed to fetch visibility");
        const json = await res.json();
        setVisData({
          visibility: json.visibility,
          cloudPercent: json.cloudPercent,
          message: json.message,
        });
      } catch (e) {
        console.error("fuji-visibility fetch error:", e);
        setVisError(true);
      } finally {
        setVisLoading(false);
      }
    };
    fetchVisibility();
  }, []);

  const visibilityUi = (() => {
    if (visLoading) {
      return {
        label: t("visChecking"),
        icon: <CloudSun className="h-3.5 w-3.5" />,
        badgeClass: "bg-sky-50 border-sky-200 text-sky-700",
      };
    }
    if (visError || !visData) {
      return {
        label: t("visUnavailable"),
        icon: <Cloud className="h-3.5 w-3.5" />,
        badgeClass: "bg-slate-50 border-slate-200 text-slate-500",
      };
    }
    const extra = ` · ${visData.cloudPercent}%`;
    switch (visData.visibility) {
      case "high":
        return {
          label: t("visHigh") + extra,
          icon: <Sun className="h-3.5 w-3.5" />,
          badgeClass: "bg-emerald-50 border-emerald-200 text-emerald-700",
        };
      case "medium":
        return {
          label: t("visMedium") + extra,
          icon: <CloudSun className="h-3.5 w-3.5" />,
          badgeClass: "bg-amber-50 border-amber-200 text-amber-700",
        };
      case "low":
      default:
        return {
          label: t("visLow") + extra,
          icon: <Cloud className="h-3.5 w-3.5" />,
          badgeClass: "bg-slate-100 border-slate-200 text-slate-700",
        };
    }
  })();

  const faqItems = t.raw("faq") as Array<{ q: string; a: string }>;

  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-100 via-sky-50 to-white text-slate-900 flex flex-col">
      <div className="flex-1 flex flex-col px-4 py-6 max-w-md mx-auto w-full">
        {/* Header / Branding */}
        <header className="mb-6 mt-2">
          <div className="flex items-start gap-3">
            {/* Fuji logo */}
            <div className="shrink-0 relative h-11 w-11 rounded-2xl bg-gradient-to-b from-sky-300 to-sky-500 flex items-center justify-center shadow-sm">
              <Mountain className="h-6 w-6 text-white" />
              <div className="pointer-events-none absolute bottom-2 h-2.5 w-5 bg-white/95 rounded-t-[999px] rounded-b-[6px]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <h1 className="text-lg font-semibold tracking-tight">
                  {t("brandTitle")}
                </h1>
                <LanguageSelector />
              </div>
              <p className="text-xs text-slate-500">{t("brandSubtitle")}</p>
              <p className="mt-1 text-[11px] text-slate-500">
                {t("brandBuiltBy")}
              </p>
              <p className="mt-1 text-[10px] text-slate-500">
                {t("brandSource")}{" "}
                <a
                  href={JR_CENTRAL_SOURCE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2 text-sky-700"
                >
                  [{t("brandSourceLink")}]
                </a>
                . {t("brandDisclaimer")}
              </p>
            </div>
          </div>
        </header>

        {/* Today's Mt. Fuji visibility */}
        <div className="mb-3 flex items-center justify-between gap-3 text-[11px]">
          <span className="text-slate-500">{t("weatherLabel")}</span>
          <div
            className={[
              "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border",
              "max-w-[70%] text-right",
              visibilityUi.badgeClass,
            ].join(" ")}
          >
            {visibilityUi.icon}
            <span className="truncate">{visibilityUi.label}</span>
          </div>
        </div>

        {/* Steps */}
        <div className="mb-3 flex items-center justify-between text-[11px] text-slate-500">
          <span>{t("step1")}</span>
          <span>{t("step2")}</span>
          <span>{t("step3")}</span>
        </div>

        {/* Main card */}
        <section className="bg-white/90 border border-slate-200 rounded-3xl px-4 py-5 shadow-md shadow-slate-200/70 backdrop-blur flex flex-col gap-4">
          <div className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-700">
              {t("tagline")}
            </p>
            <p className="text-sm font-semibold text-slate-900">
              {t("taglineBody")}
            </p>
          </div>

          {/* Direction selector */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                {t("directionLabel")}
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
                      setHasChecked(false);
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
            <span>{t("checkBtn")}</span>
            <ArrowRight className="ml-2 h-4 w-4" />
          </motion.button>

          <p className="text-[11px] text-slate-500 leading-relaxed">
            {t("trainNote")}
          </p>

          <Link
            href="/guide"
            className="inline-flex items-center gap-1.5 text-[11px] text-sky-700 hover:underline underline-offset-2"
          >
            <Info className="h-3.5 w-3.5" />
            <span>{t("readGuide")}</span>
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
                    {t("resultBadge")}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {t("resultDirectionLabel")}{" "}
                    <span className="font-medium text-slate-700">
                      {currentDirectionLabel}
                    </span>
                  </span>
                </div>

                <div className="flex items-center justify-between mb-4 gap-4">
                  <div>
                    <p className="text-xs font-medium tracking-[0.2em] uppercase text-slate-500">
                      {t("resultBestSeat")}
                    </p>
                    <p className="mt-1 text-[32px] leading-none font-semibold tracking-tight text-slate-900">
                      Seat <span className="text-red-500">E</span>
                    </p>
                    <p className="mt-1 text-sm text-slate-700 font-medium">
                      {t("resultSeatEMain")}
                    </p>
                    <p className="text-[11px] text-slate-600 mt-1">
                      {t("resultSeatDFallback")}
                    </p>
                    {visData && !visLoading && !visError && (
                      <p className="mt-2 text-[10px] text-slate-500">
                        {t("resultVisToday")}{" "}
                        <span className="font-semibold uppercase">
                          {visData.visibility}
                        </span>{" "}
                        ({visData.cloudPercent}% clouds). {visData.message}
                      </p>
                    )}
                    {visError && (
                      <p className="mt-2 text-[10px] text-slate-500">
                        {t("resultVisError")}
                      </p>
                    )}
                  </div>

                  {/* Fuji mini illustration */}
                  <div className="relative w-24 h-20 flex items-end justify-center">
                    <div className="w-16 h-12 bg-gradient-to-t from-sky-400 to-sky-200 rounded-t-full" />
                    <div className="absolute bottom-2 w-14 h-8 bg-slate-800 rounded-t-[999px] rounded-b-[10px]" />
                    <div className="absolute bottom-4 w-8 h-3 bg-white rounded-t-[999px] rounded-b-[6px]" />
                    <div className="absolute -top-1 w-6 h-6 bg-yellow-300 rounded-full opacity-80" />
                  </div>
                </div>

                <div className="mt-3">
                  <KlookCTA />
                </div>

                {/* Seat diagram */}
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>{t("seaSide")}</span>
                    <span className="italic text-slate-400">{t("aisle")}</span>
                    <span className="font-medium text-sky-700">
                      {t("fujisideLabel")}
                    </span>
                  </div>

                  <div className="bg-slate-50 rounded-2xl border border-slate-200 px-3 py-3">
                    <div className="flex items-center justify-between gap-2 mb-2 text-[11px] text-slate-500">
                      <span className="flex-1 text-center">
                        {t("exampleRow")}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
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
                      <div className="w-9 flex flex-col items-center justify-center">
                        <div className="h-full w-px bg-slate-200 rounded-full" />
                        <span className="mt-1 text-[10px] text-slate-400">
                          {t("aisle")}
                        </span>
                      </div>
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
                      <span>{t("trainInterior")}</span>
                      <span className="font-medium text-sky-700">
                        {t("fujisideArrow")}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="mt-3 text-[10px] text-slate-500 leading-relaxed">
                  {t("timingNote")}
                </p>

                {/* Quick FAQ */}
                <div className="mt-3 rounded-2xl bg-slate-50 border border-slate-200 px-3 py-3 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-700">
                    <Info className="h-3.5 w-3.5" />
                    <span>{t("faqTitle")}</span>
                  </div>
                  <ul className="mt-1 space-y-1.5 text-[10px] text-slate-600">
                    {faqItems.map((item, i) => (
                      <li key={i}>
                        <span className="font-semibold">{item.q}</span> →{" "}
                        {item.a}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Share hint */}
                <div className="mt-3 flex items-start gap-2 rounded-2xl bg-slate-50 border border-slate-200 px-3 py-2.5">
                  <Share2 className="h-3.5 w-3.5 mt-[2px] text-slate-400" />
                  <p className="text-[10px] text-slate-600 leading-relaxed">
                    {t("shareHeading")}
                    <br />
                    <span className="font-medium">
                      • {t("shareTokyo")}
                      <br />• {t("shareOsaka")}
                    </span>
                    <br />
                    {t("shareBody")}
                  </p>
                </div>

                {/* Travel essentials */}
                <div className="mt-3 bg-red-50/50 border border-red-100 rounded-2xl px-3 py-3 space-y-2">
                  <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-700">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span>{t("essentialsTitle")}</span>
                  </div>
                  <p className="text-[10px] text-slate-500">
                    {t("essentialsNote")}
                  </p>
                  <div className="space-y-1.5">
                    <a
                      href={JR_PASS_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2.5 rounded-xl border border-red-100 bg-white px-3 py-2 hover:bg-red-50 active:brightness-95 transition-colors"
                    >
                      <div className="shrink-0 w-7 h-7 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center">
                        <Train className="h-3.5 w-3.5 text-red-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-semibold text-slate-800">
                          {t("jrPassTitle")}
                        </p>
                        <p className="text-[10px] text-slate-500">
                          {t("jrPassDesc")}
                        </p>
                      </div>
                      <ExternalLink className="shrink-0 h-3 w-3 text-slate-400" />
                    </a>
                    <a
                      href={ESIM_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2.5 rounded-xl border border-red-100 bg-white px-3 py-2 hover:bg-red-50 active:brightness-95 transition-colors"
                    >
                      <div className="shrink-0 w-7 h-7 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center">
                        <Wifi className="h-3.5 w-3.5 text-red-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-semibold text-slate-800">
                          {t("esimTitle")}
                        </p>
                        <p className="text-[10px] text-slate-500">
                          {t("esimDesc")}
                        </p>
                      </div>
                      <ExternalLink className="shrink-0 h-3 w-3 text-slate-400" />
                    </a>
                    <a
                      href={AIRPORT_TRANSFER_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2.5 rounded-xl border border-red-100 bg-white px-3 py-2 hover:bg-red-50 active:brightness-95 transition-colors"
                    >
                      <div className="shrink-0 w-7 h-7 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center">
                        <Train className="h-3.5 w-3.5 text-red-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-semibold text-slate-800">
                          {t("nexTitle")}
                        </p>
                        <p className="text-[10px] text-slate-500">
                          {t("nexDesc")}
                        </p>
                      </div>
                      <ExternalLink className="shrink-0 h-3 w-3 text-slate-400" />
                    </a>
                    <a
                      href={INSURANCE_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2.5 rounded-xl border border-red-100 bg-white px-3 py-2 hover:bg-red-50 active:brightness-95 transition-colors"
                    >
                      <div className="shrink-0 w-7 h-7 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center">
                        <ShieldCheck className="h-3.5 w-3.5 text-red-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-semibold text-slate-800">
                          {t("insuranceTitle")}
                        </p>
                        <p className="text-[10px] text-slate-500">
                          {t("insuranceDesc")}
                        </p>
                      </div>
                      <ExternalLink className="shrink-0 h-3 w-3 text-slate-400" />
                    </a>
                    <a
                      href={CAR_RENTAL_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2.5 rounded-xl border border-red-100 bg-white px-3 py-2 hover:bg-red-50 active:brightness-95 transition-colors"
                    >
                      <div className="shrink-0 w-7 h-7 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center">
                        <Car className="h-3.5 w-3.5 text-red-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-semibold text-slate-800">
                          {t("carTitle")}
                        </p>
                        <p className="text-[10px] text-slate-500">
                          {t("carDesc")}
                        </p>
                      </div>
                      <ExternalLink className="shrink-0 h-3 w-3 text-slate-400" />
                    </a>
                  </div>
                </div>
              </div>

              <KlookCTA />
            </motion.section>
          )}
        </AnimatePresence>

        <div className="flex-1" />

        {/* Footer */}
        <footer className="pt-6 pb-3 space-y-2">
          <a
            href={ESIM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 hover:text-sky-700 transition-colors"
          >
            <Wifi className="h-3.5 w-3.5" />
            <span className="underline underline-offset-2">
              {t("footerEsim")}
            </span>
          </a>
          <p className="text-[10px] text-center text-slate-400 leading-relaxed">
            {t("footerDisclaimer")}
          </p>
          <p className="text-[9px] text-center text-slate-400">
            {t("footerBuiltBy")}
          </p>
        </footer>
      </div>
    </main>
  );
}
