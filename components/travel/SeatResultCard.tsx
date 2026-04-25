"use client";

import { ArrowLeft, ArrowRight, Info, Mountain, Plane, Share2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { FujiVisibility, SeatRecommendation } from "@/lib/seat-checker";
import { Card } from "@/components/ui/Card";
import { KLOOK_URL } from "@/src/affiliateLinks";
import { AFFILIATE_REL } from "@/lib/link-rel";

type SeatResultCardProps = {
  recommendation: SeatRecommendation;
  directionLabel: string;
  visibility: FujiVisibility | null;
  visibilityLoading: boolean;
  visibilityError: boolean;
  highlighted?: boolean;
};

type SeatMapCardProps = {
  recommendation: SeatRecommendation;
  directionLabel: string;
  highlighted?: boolean;
  sourceUrl?: string;
  sourceLabel?: string;
  disclaimer?: string;
};

export function SeatResultCard({
  recommendation,
  directionLabel,
  visibility,
  visibilityLoading,
  visibilityError,
  highlighted = false,
}: SeatResultCardProps) {
  const t = useTranslations("home");
  const k = useTranslations("klook");
  const faqItems = t.raw("faq") as Array<{ q: string; a: string }>;
  const fujiOnRight = recommendation.sideLabel === "right";
  const seatRows = ["14", "15", "16"];
  const leftSeats = fujiOnRight ? ["A", "B", "C"] : ["E", "D"];
  const rightSeats = fujiOnRight ? ["D", "E"] : ["C", "B", "A"];

  return (
    <Card className="overflow-hidden">
      <div className="border-b border-slate-200 bg-white px-5 py-5 md:px-6">
      <div className="mb-4 flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1 rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1.5 text-[11px] font-semibold text-sky-700">
          <Mountain className="h-3.5 w-3.5" />
          {t("resultBadge")}
        </span>
        <span className="text-[11px] text-slate-500">
          {t("resultDirectionLabel")}{" "}
          <span className="font-medium text-slate-700">{directionLabel}</span>
        </span>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase text-slate-500">
            {t("resultBestSeat")}
          </p>
          <p className="mt-2 text-[44px] font-semibold leading-none text-slate-950 md:text-[56px]">
            Seat <span className="text-red-500">{recommendation.standardWindowSeat}</span>
          </p>
          <p className="mt-3 max-w-xl text-sm font-medium leading-6 text-slate-700">{t("resultSeatEMain")}</p>
          <p className="mt-1 text-xs text-slate-600">{t("resultSeatDFallback")}</p>
          {!visibilityLoading && visibility && !visibilityError && (
            <p className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs leading-5 text-slate-600">
              {t("resultVisToday")}{" "}
              <span className="font-semibold uppercase">{visibility.visibility}</span>{" "}
              ({visibility.cloudPercent}% clouds). {visibility.message}
            </p>
          )}
          {visibilityError && <p className="mt-2 text-[10px] text-slate-500">{t("resultVisError")}</p>}
        </div>

        <div className="relative hidden h-32 w-36 shrink-0 items-end justify-center overflow-hidden rounded-[28px] border border-sky-100 bg-sky-50 sm:flex">
          <div className="h-20 w-28 rounded-t-full bg-gradient-to-t from-sky-500 to-sky-200" />
          <div className="absolute bottom-5 h-12 w-24 rounded-b-2xl rounded-t-full bg-slate-900" />
          <div className="absolute bottom-9 h-5 w-14 rounded-b-md rounded-t-full bg-white" />
          <div className="absolute right-5 top-5 h-7 w-7 rounded-full bg-amber-300" />
        </div>
      </div>
      </div>

      <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="bg-slate-50/70 px-5 py-5 md:px-6">
        <div className="space-y-3 rounded-[24px] border border-red-100 bg-white px-4 py-4 shadow-sm shadow-red-100">
          <p className="text-[13px] font-semibold text-slate-800">{k("heading")}</p>
          <div className="flex gap-2">
            <a
              href={KLOOK_URL}
              target="_blank"
              rel={AFFILIATE_REL}
              className="flex-1 rounded-2xl bg-red-500 px-4 py-2.5 text-center text-sm font-semibold text-white shadow-md shadow-red-200 transition-all hover:brightness-110 active:brightness-95"
            >
              {k("book")}
            </a>
            <a
              href={KLOOK_URL}
              target="_blank"
              rel={AFFILIATE_REL}
              className="flex-1 rounded-2xl border-2 border-red-500 bg-red-50 px-4 py-2.5 text-center text-sm font-semibold text-red-600 shadow-sm transition-all hover:bg-red-100 active:brightness-95"
            >
              {k("jrPass")}
            </a>
          </div>
        </div>

      <div className="mt-5 rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-[11px] font-semibold uppercase text-slate-500">{t("exampleRow")}</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">Standard car 3+2 layout</p>
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-[11px] font-semibold text-blue-700">
            {recommendation.direction === "tokyo-osaka" ? <ArrowLeft className="h-3.5 w-3.5" /> : <ArrowRight className="h-3.5 w-3.5" />}
            Travel direction
          </div>
        </div>

        <div className="mt-4 grid grid-cols-[54px_minmax(0,1fr)_54px] items-center gap-2 sm:grid-cols-[86px_minmax(0,1fr)_86px] sm:gap-3">
          <div
            className={[
              "flex items-center justify-end gap-1.5 text-[11px] font-semibold",
              fujiOnRight ? "text-slate-400" : "text-sky-700",
            ].join(" ")}
          >
            {!fujiOnRight && <ArrowLeft className="h-4 w-4" />}
            <span>{fujiOnRight ? t("seaSide") : t("fujisideLabel")}</span>
          </div>

          <div className="relative rounded-[26px] border border-slate-200 bg-slate-50 px-3 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
            <div className="absolute inset-x-6 top-2 h-8 rounded-t-[22px] border border-slate-200 bg-white" />
            <div className="relative pt-8">
              <div className="mb-3 flex items-center justify-center gap-2 text-[10px] font-semibold uppercase text-slate-400">
                {recommendation.direction === "tokyo-osaka" ? <ArrowLeft className="h-3.5 w-3.5" /> : <ArrowRight className="h-3.5 w-3.5" />}
                {directionLabel}
              </div>

              <div className="space-y-2">
                {seatRows.map((row) => (
                  <div key={row} className="grid grid-cols-[minmax(0,1fr)_22px_minmax(0,1fr)] gap-1.5">
                    <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${leftSeats.length}, minmax(0, 1fr))` }}>
                    {leftSeats.map((seat) => (
                      <SeatCell
                        key={`${row}${seat}`}
                        label={seat}
                        active={highlighted && seat === recommendation.standardWindowSeat}
                        recommended={seat === recommendation.standardWindowSeat}
                        muted={seat === recommendation.fallbackSeat}
                      />
                    ))}
                    </div>
                    <div className="flex items-center justify-center text-[9px] text-slate-400">
                      {row === "15" ? t("aisle") : ""}
                    </div>
                    <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${rightSeats.length}, minmax(0, 1fr))` }}>
                    {rightSeats.map((seat) => (
                      <SeatCell
                        key={`${row}${seat}`}
                        label={seat}
                        active={highlighted && seat === recommendation.standardWindowSeat}
                        recommended={seat === recommendation.standardWindowSeat}
                        muted={seat === recommendation.fallbackSeat}
                      />
                    ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-3 grid grid-cols-[minmax(0,1fr)_22px_minmax(0,1fr)] gap-1.5 text-center text-[10px] font-semibold text-slate-500">
                <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${leftSeats.length}, minmax(0, 1fr))` }}>
                  {leftSeats.map((label) => (
                    <span key={label}>{label}</span>
                  ))}
                </div>
                <span />
                <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${rightSeats.length}, minmax(0, 1fr))` }}>
                  {rightSeats.map((label) => (
                    <span key={label}>{label}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div
            className={[
              "flex items-center gap-1.5 text-[11px] font-semibold",
              fujiOnRight ? "text-sky-700" : "text-slate-400",
            ].join(" ")}
          >
            <span>{fujiOnRight ? t("fujisideLabel") : t("seaSide")}</span>
            {fujiOnRight && <ArrowRight className="h-4 w-4" />}
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-sky-100 bg-sky-50 px-3 py-2 text-xs leading-5 text-sky-900">
          {highlighted
            ? "Seat E is highlighted as the best standard-car window seat for this direction."
            : "Choose your direction above, then press Check best seat to highlight the Fuji-side window seat."}
        </div>
      </div>

      <p className="mt-4 text-xs leading-6 text-slate-500">{t("timingNote")}</p>
      </div>

      <div className="border-t border-slate-200 bg-white px-5 py-5 lg:border-l lg:border-t-0">
      <div className="rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-4">
        <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-800">
          <Info className="h-3.5 w-3.5" />
          <span>{t("faqTitle")}</span>
        </div>
        <ul className="mt-3 space-y-2 text-xs leading-5 text-slate-600">
          {faqItems.map((item, i) => (
            <li key={i}>
              <span className="font-semibold">{item.q}</span> - {item.a}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-3 flex items-start gap-2 rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-4">
        <Share2 className="mt-[2px] h-3.5 w-3.5 text-slate-400" />
        <p className="text-xs leading-5 text-slate-600">
          {t("shareHeading")}
          <br />
          <span className="font-medium">
            - {t("shareTokyo")}
            <br />- {t("shareOsaka")}
          </span>
          <br />
          {t("shareBody")}
        </p>
      </div>
      </div>
      </div>
    </Card>
  );
}

export function SeatMapCard({
  recommendation,
  directionLabel,
  highlighted = false,
  sourceUrl,
  sourceLabel,
  disclaimer,
}: SeatMapCardProps) {
  return (
    <Card className="overflow-hidden">
      <SeatMapPanel
        recommendation={recommendation}
        directionLabel={directionLabel}
        highlighted={highlighted}
        sourceUrl={sourceUrl}
        sourceLabel={sourceLabel}
        disclaimer={disclaimer}
      />
    </Card>
  );
}

export function SeatMapPanel({
  recommendation,
  directionLabel,
  highlighted = false,
  sourceUrl,
  sourceLabel,
  disclaimer,
}: SeatMapCardProps) {
  const t = useTranslations("home");
  const seatRows = ["12", "13", "14", "15"];
  const topSeats = ["E", "D"];
  const bottomSeats = ["C", "B", "A"];
  const travelDirection = recommendation.direction === "tokyo-osaka" ? "left" : "right";

  return (
    <>
      <div className="border-b border-slate-200 bg-white px-4 py-4">
        <p className="text-[11px] font-semibold uppercase text-sky-700">Seat map</p>
        <h2 className="mt-1 text-lg font-semibold text-slate-950">
          Seat {recommendation.standardWindowSeat}
        </h2>
        <p className="mt-1 text-xs leading-5 text-slate-500">{directionLabel}</p>
      </div>

      <div className="bg-slate-50/80 px-4 py-4">
        <div className="grid grid-cols-[24px_minmax(0,1fr)_24px] items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-[11px] font-semibold text-blue-700">
          <span className="flex justify-start">
            {travelDirection === "left" && <ArrowLeft className="h-3.5 w-3.5" />}
          </span>
          <span className="text-center">Travel direction</span>
          <span className="flex justify-end">
            {travelDirection === "right" && <ArrowRight className="h-3.5 w-3.5" />}
          </span>
        </div>

        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-center gap-1.5 rounded-2xl border border-sky-100 bg-white px-3 py-2 text-[11px] font-semibold text-sky-700">
            <Mountain className="h-3.5 w-3.5" />
            <span>{t("fujisideLabel")} / window side</span>
          </div>

          <div className="relative rounded-[30px] border border-slate-200 bg-white px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
            <div className="relative">
              <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${seatRows.length}, minmax(0, 1fr))` }}>
                {seatRows.map((row) => (
                  <SeatPair
                    key={`top-${row}`}
                    seats={topSeats}
                    row={row}
                    recommendation={recommendation}
                    highlighted={highlighted}
                    windowSide
                  />
                ))}
              </div>

              <div className="my-2 flex items-center gap-2 text-[10px] font-semibold text-slate-400">
                <div className="h-px flex-1 bg-slate-200" />
                <span>
                {t("aisle")}
                </span>
                <div className="h-px flex-1 bg-slate-200" />
              </div>

              <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${seatRows.length}, minmax(0, 1fr))` }}>
                {seatRows.map((row) => (
                  <SeatPair
                    key={`bottom-${row}`}
                    seats={bottomSeats}
                    row={row}
                    recommendation={recommendation}
                    highlighted={highlighted}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-3 py-2 text-[11px] font-semibold text-slate-400">
            {t("seaSide")}
          </div>
        </div>

        <p className="mt-3 rounded-2xl border border-sky-100 bg-sky-50 px-3 py-2 text-xs leading-5 text-sky-900">
          {highlighted ? "Seat E is highlighted." : "Press Check best seat to highlight Seat E."}
        </p>

        {(sourceLabel || disclaimer) && (
          <div className="mt-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-[11px] leading-5 text-slate-500">
            {sourceLabel && (
              <p>
                {sourceLabel}{" "}
                {sourceUrl && (
                  <a
                    href={sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-sky-700 underline underline-offset-2"
                  >
                    [view source]
                  </a>
                )}
              </p>
            )}
            {disclaimer && <p className={sourceLabel ? "mt-1" : ""}>{disclaimer}</p>}
          </div>
        )}

        <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-3">
          <p className="text-[11px] font-semibold uppercase text-slate-500">Next actions</p>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            <Link
              href="/guide"
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-sky-200 bg-sky-50 px-3 py-2 text-xs font-semibold text-sky-700 transition-colors hover:bg-sky-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-200"
            >
              <Info className="h-3.5 w-3.5" />
              Read guide
            </Link>
            <Link
              href="/planner"
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#07142f] px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
            >
              <Plane className="h-3.5 w-3.5" />
              Plan trip
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

function SeatPair({
  seats,
  row,
  recommendation,
  highlighted,
  windowSide = false,
}: {
  seats: string[];
  row: string;
  recommendation: SeatRecommendation;
  highlighted: boolean;
  windowSide?: boolean;
}) {
  return (
    <div
      className={[
        "grid gap-1 rounded-xl border px-1 py-1",
        windowSide ? "border-sky-100 bg-sky-50/70" : "border-slate-100 bg-slate-50",
      ].join(" ")}
      style={{ gridTemplateRows: `repeat(${seats.length}, minmax(0, 1fr))` }}
    >
      {seats.map((seat) => (
        <SeatCell
          key={`${row}${seat}`}
          label={seat}
          active={highlighted && seat === recommendation.standardWindowSeat}
          recommended={seat === recommendation.standardWindowSeat}
          muted={seat === recommendation.fallbackSeat}
        />
      ))}
    </div>
  );
}

function SeatCell({
  label,
  active = false,
  recommended = false,
  muted = false,
}: {
  label: string;
  active?: boolean;
  recommended?: boolean;
  muted?: boolean;
}) {
  return (
    <div
      className={[
        "flex items-center justify-center rounded-xl border text-xs font-semibold transition-all duration-200",
        "h-8 min-w-0",
        active
          ? "border-red-400 bg-red-500 text-white shadow-[0_0_0_4px_rgba(248,113,113,0.20),0_14px_28px_rgba(239,68,68,0.28)]"
          : recommended
            ? "border-red-200 bg-red-50 text-red-600"
            : muted
              ? "border-amber-200 bg-amber-50 text-amber-700"
              : "border-slate-200 bg-white text-slate-700",
      ].join(" ")}
    >
      {label}
    </div>
  );
}
