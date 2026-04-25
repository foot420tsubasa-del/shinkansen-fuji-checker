"use client";

import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { directions, type DirectionId, type FujiVisibility } from "@/lib/seat-checker";

const FUJI_VIS_CONFIG = {
  high: { emoji: "☀️", bg: "rgba(16,185,129,0.12)", border: "rgba(16,185,129,0.3)", color: "#6ee7b7" },
  medium: { emoji: "🌤️", bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.3)", color: "#fcd34d" },
  low: { emoji: "☁️", bg: "rgba(148,163,184,0.12)", border: "rgba(148,163,184,0.3)", color: "#94a3b8" },
} as const;

function FujiWeatherStrip({ data, loading, error }: { data: FujiVisibility | null; loading: boolean; error: boolean }) {
  const t = useTranslations("home");

  if (loading) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 backdrop-blur-sm">
        <span className="text-xl leading-none">🌤️</span>
        <div>
          <p className="text-[11px] font-semibold text-slate-300">{t("visChecking")}</p>
          <p className="text-[10px] text-slate-500">Mt. Fuji visibility</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 backdrop-blur-sm">
        <span className="text-xl leading-none">🌫️</span>
        <div>
          <p className="text-[11px] font-semibold text-slate-400">{t("visUnavailable")}</p>
          <p className="text-[10px] text-slate-500">Mt. Fuji visibility</p>
        </div>
      </div>
    );
  }

  const cfg = FUJI_VIS_CONFIG[data.visibility];

  return (
    <div
      className="flex items-center gap-3 rounded-2xl px-4 py-2.5 backdrop-blur-sm"
      style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}
    >
      <span className="text-2xl leading-none">{cfg.emoji}</span>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className="text-xs font-bold uppercase" style={{ color: cfg.color }}>
            {t(`vis${data.visibility.charAt(0).toUpperCase() + data.visibility.slice(1)}`)}
          </span>
          <span className="text-[10px] text-slate-400">
            {data.cloudPercent}% clouds
          </span>
        </div>
        <p className="mt-0.5 truncate text-[10px] leading-4 text-slate-400">
          {data.message}
        </p>
      </div>
    </div>
  );
}

type SeatCheckerPanelProps = {
  direction: DirectionId;
  onDirectionChange: (direction: DirectionId) => void;
  onCheck: () => void;
  visibility: FujiVisibility | null;
  visibilityLoading: boolean;
  visibilityError: boolean;
};

export function SeatCheckerPanel({
  direction,
  onDirectionChange,
  onCheck,
  visibility,
  visibilityLoading,
  visibilityError,
}: SeatCheckerPanelProps) {
  const t = useTranslations("home");

  return (
    <section className="relative min-h-[360px] overflow-hidden rounded-[22px] bg-[#061a3c] text-white shadow-[0_24px_70px_rgba(6,26,60,0.28)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_22%,rgba(56,189,248,0.22),transparent_34%),linear-gradient(115deg,#061a3c_0%,#08224f_50%,#0b1d39_100%)]" />
      <div className="relative grid min-h-[360px] lg:grid-cols-[minmax(0,0.98fr)_minmax(260px,0.78fr)]">
        <div className="flex flex-col px-5 py-5 sm:px-6 sm:py-6">
          <div className="mb-4">
            <span className="inline-flex rounded-full bg-sky-400/15 px-2.5 py-1 text-[10px] font-bold uppercase text-sky-200 ring-1 ring-sky-300/20">
              Free tool
            </span>
          </div>

          <div>
            <h1 className="max-w-[460px] text-[32px] font-semibold leading-[0.98] text-white sm:text-[40px] lg:text-[44px]">
              Shinkansen Mt. Fuji Seat Checker
            </h1>
            <p className="mt-4 max-w-[380px] text-sm leading-6 text-slate-300">
              Find the best side of the Shinkansen to get a clear view of Mt. Fuji.
            </p>
          </div>

          <div className="mt-6 space-y-3">
            <div className="grid gap-2 rounded-2xl bg-white p-1.5 text-xs shadow-[0_14px_35px_rgba(0,0,0,0.18)]">
              {directions.map((opt) => {
                const active = opt.id === direction;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => onDirectionChange(opt.id)}
                    className={[
                      "flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 font-semibold transition-all duration-150",
                      active
                        ? "bg-[#1557e6] text-white shadow-md shadow-blue-300/40"
                        : "text-slate-700 hover:bg-slate-50",
                    ].join(" ")}
                  >
                    <span
                      className={[
                        "h-3.5 w-3.5 shrink-0 rounded-full border",
                        active ? "border-white bg-white/20 ring-2 ring-white/40" : "border-slate-300",
                      ].join(" ")}
                    />
                    <span>{t(opt.labelKey)}</span>
                  </button>
                );
              })}
            </div>

            <motion.button
              type="button"
              onClick={onCheck}
              whileTap={{ scale: 0.98 }}
              className="inline-flex w-full items-center justify-center rounded-xl bg-[#1557e6] px-4 py-3.5 text-sm font-semibold text-white shadow-[0_16px_35px_rgba(21,87,230,0.35)] transition-all hover:bg-[#0f49cf] active:brightness-95"
            >
              <span>{t("checkBtn")}</span>
              <ArrowRight className="ml-2 h-4 w-4" />
            </motion.button>
          </div>

          <div className="mt-auto pt-5">
            <FujiWeatherStrip data={visibility} loading={visibilityLoading} error={visibilityError} />
          </div>
        </div>

        <div className="relative hidden min-h-[360px] overflow-hidden lg:block">
          <div className="absolute -left-14 inset-y-0 z-20 w-32 bg-[linear-gradient(90deg,#061a3c_0%,rgba(6,26,60,0.72)_42%,rgba(6,26,60,0)_100%)]" />
          <div className="absolute inset-y-6 right-5 w-[92%] overflow-hidden rounded-[34px] border border-white/15 bg-[#07111f] shadow-[inset_0_0_0_7px_rgba(255,255,255,0.045),0_30px_80px_rgba(0,0,0,0.38)]">
            <Image
              src="/seat-checker-fuji-window-20260423.png"
              alt="Mt. Fuji seen from a Shinkansen train window"
              fill
              priority
              sizes="(min-width: 1280px) 34vw, 0vw"
              className="object-cover object-[70%_center]"
            />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(3,10,24,0.38)_0%,rgba(3,10,24,0.05)_42%,rgba(3,10,24,0.18)_100%)]" />
            <div className="absolute inset-x-0 bottom-0 h-24 bg-[linear-gradient(180deg,rgba(6,26,60,0),rgba(6,26,60,0.58))]" />
          </div>
          <div className="absolute bottom-4 left-[12%] z-30 rounded-full border border-white/15 bg-white/12 px-3 py-1 text-[10px] font-semibold text-sky-100 backdrop-blur-md">
            Window view
          </div>
          <div className="absolute right-8 top-8 z-30 rounded-full bg-white/90 px-3 py-1 text-[10px] font-semibold text-slate-700 shadow-sm">
            Fuji side
          </div>
        </div>
      </div>
    </section>
  );
}
