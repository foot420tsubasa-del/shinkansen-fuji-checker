"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowRight, CloudRain } from "lucide-react";
import { AFFILIATE_REL } from "@/lib/link-rel";
import { trackAffiliateClick, trackAffiliateCtaView, trackCtaClick } from "@/lib/analytics";
import { getAffUrl } from "@/src/affiliateLinks";
import {
  findBetterDeparture,
  ORIGINS_BY_DIRECTION,
  resolveWindow,
  type HourlyForecast,
  type OriginId,
  type VisibilityLevel,
} from "@/lib/fuji-window";
import { clearMorningOdds, LOW_ODDS_THRESHOLD, ODDS_PERIOD } from "@/lib/fuji-odds";
import type { DirectionId } from "@/lib/seat-checker";

const LEVEL_STYLE: Record<VisibilityLevel, string> = {
  high: "border-[#2E7D5B] bg-[#e8f3ed] text-[#2E7D5B]",
  medium: "border-amber-400 bg-amber-50 text-amber-800",
  low: "border-slate-300 bg-slate-100 text-slate-600",
};

const ORIGIN_KEY: Record<OriginId, string> = {
  tokyo: "originTokyo",
  shinagawa: "originShinagawa",
  "shin-yokohama": "originShinYokohama",
  nagoya: "originNagoya",
  kyoto: "originKyoto",
  "shin-osaka": "originOsaka",
};

function tokyoDate(offsetDays = 0): string {
  // Keyed to Asia/Tokyo like the forecast: a reader in New York must not be
  // offered a "today" the line has already finished running.
  const d = new Date(Date.now() + offsetDays * 86_400_000);
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Tokyo" }).format(d);
}

/**
 * The second half of the seat answer: not which side, but what time.
 *
 * It used to be a separate card further down the page that asked for the
 * direction all over again and only knew the next ten days by the hour. Search
 * data put a number on what that cost — "when do you see Mt. Fuji" queries
 * drew 1,084 impressions in three months at position 8.5 for 6 clicks — and a
 * newer site answering nothing but that question, to the minute, made the gap
 * hard to ignore.
 *
 * So it lives inside the checker now, where the reader has just said which way
 * they are going: any departure to the minute, any date. Within ten days it
 * reads the forecast for the hour the train passes; beyond that it falls back
 * to how often that month's mornings are clear, and says which of the two it
 * is showing.
 */
export function FujiTiming({
  direction,
  locale,
  pagePath,
}: {
  direction: DirectionId;
  locale: string;
  pagePath: string;
}) {
  const t = useTranslations("fujiWindow");
  const origins = ORIGINS_BY_DIRECTION[direction];
  const [origin, setOrigin] = useState<OriginId>(origins[0]);
  const [today] = useState(() => tokyoDate());
  const [maxDate] = useState(() => tokyoDate(330));
  const [date, setDate] = useState(today);
  const [time, setTime] = useState("09:00");
  const [forecast, setForecast] = useState<HourlyForecast | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const engagedRef = useRef(false);
  const tourSeenRef = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/fuji-window")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("bad response"))))
      .then((j) => {
        if (cancelled) return;
        setForecast({ time: j.time, cloud: j.cloud, precip: j.precip });
        setState("ready");
      })
      .catch(() => {
        if (!cancelled) setState("error");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // A cleared field must not blank the answer; fall back to the defaults.
  const day = /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : today;
  const departure = /^\d{2}:\d{2}$/.test(time) ? time : "09:00";

  const result = useMemo(
    () => resolveWindow(origin, day, departure, forecast),
    [origin, day, departure, forecast],
  );
  const better = useMemo(
    () => findBetterDeparture(origin, day, departure, forecast, result.level),
    [origin, day, departure, forecast, result.level],
  );

  // Outside the forecast's reach — or with the forecast down — the season is
  // the honest thing left to report.
  const monthIndex = Number(result.fujiDate.slice(5, 7)) - 1;
  const odds = clearMorningOdds(monthIndex);
  const showOdds = state !== "loading" && result.level === null;
  const monthName = new Intl.DateTimeFormat(locale, { month: "long", timeZone: "UTC" }).format(
    new Date(Date.UTC(2026, monthIndex, 15)),
  );

  // The return leg already carries its own tour line in the checker, and a
  // clear outbound run should have nothing competing with the ticket — so this
  // one appears only when an outbound reader is looking at a poor sky.
  const tourHref = direction === "tokyo-osaka" ? getAffUrl("fujiDayTourTokyo") : null;
  const tourReason: "low" | "low_odds" | null =
    result.level === "low" ? "low" : showOdds && odds < LOW_ODDS_THRESHOLD ? "low_odds" : null;
  const tourLabel = tourReason ? `fuji_window_tour:${tourReason}` : null;
  const showTour = Boolean(tourHref && tourLabel);

  useEffect(() => {
    // One impression per distinct verdict, so the click rate stays divisible.
    if (!showTour || !tourLabel || tourSeenRef.current === tourLabel) return;
    tourSeenRef.current = tourLabel;
    trackAffiliateCtaView({
      provider: "klook",
      product: "fuji_day_tour",
      placement: "fuji_window_tour",
      page_path: pagePath,
      link_id: "fujiDayTourTokyo",
      locale,
      label: tourLabel,
    });
  }, [showTour, tourLabel, pagePath, locale]);

  const engaged = (nextOrigin: OriginId, nextDate: string, nextTime: string) => {
    // Counted once: the question is how many readers use the timing at all,
    // not how many keystrokes a time field takes.
    if (engagedRef.current) return;
    engagedRef.current = true;
    trackCtaClick({
      placement: "fuji_window_check",
      href: pagePath,
      label: `${nextOrigin}|${nextDate}|${nextTime}`,
      category: "seat_checker",
      page_path: pagePath,
      locale,
    });
  };

  const fieldClass =
    "mt-1 min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:border-[#1d4e89] focus:outline-none";

  return (
    <div className="mt-3.5 border-t border-slate-100 pt-3">
      <p className="text-sm font-bold text-slate-950">{t("whenTitle")}</p>

      <div className="mt-2">
        <span className="text-[11px] font-semibold text-slate-600">{t("fromLabel")}</span>
        <div className="mt-1 grid grid-cols-3 gap-1.5">
          {origins.map((id) => {
            const active = origin === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => {
                  setOrigin(id);
                  engaged(id, day, departure);
                }}
                aria-pressed={active}
                className={[
                  "min-h-10 rounded-xl border px-2 py-1.5 text-[12px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1d4e89]/40",
                  active
                    ? "border-[#0b214a] bg-[#0b214a] text-white"
                    : "border-slate-300 bg-white text-slate-800 hover:border-[#1d4e89]",
                ].join(" ")}
              >
                {t(ORIGIN_KEY[id])}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-2 grid grid-cols-2 gap-2">
        <label className="block">
          <span className="text-[11px] font-semibold text-slate-600">{t("timeLabel")}</span>
          <input
            type="time"
            value={time}
            onChange={(e) => {
              setTime(e.target.value);
              engaged(origin, day, e.target.value);
            }}
            className={fieldClass}
          />
        </label>
        <label className="block">
          <span className="text-[11px] font-semibold text-slate-600">{t("dateLabel")}</span>
          <input
            type="date"
            value={date}
            min={today}
            max={maxDate}
            onChange={(e) => {
              setDate(e.target.value);
              engaged(origin, e.target.value, departure);
            }}
            className={fieldClass}
          />
        </label>
      </div>

      <p className="mt-3 text-[15px] font-bold leading-6 text-slate-950" aria-live="polite">
        {t("window", { from: result.firstTime, to: result.lastTime, peak: result.fujiTime })}
      </p>

      {state === "loading" ? (
        <p className="mt-1.5 text-[12px] text-slate-500">{t("loading")}</p>
      ) : result.level ? (
        <>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[12px] font-bold ${LEVEL_STYLE[result.level]}`}
            >
              {result.level === "high"
                ? t("levelHigh")
                : result.level === "medium"
                  ? t("levelMedium")
                  : t("levelLow")}
            </span>
            <span className="text-[12px] text-slate-600">
              {t("cloud").replace("{percent}", String(Math.round(result.cloudPercent ?? 0)))}
            </span>
            {(result.precipMm ?? 0) >= 0.5 ? (
              <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-slate-700">
                <CloudRain className="h-3.5 w-3.5" aria-hidden="true" />
                {t("rain")}
              </span>
            ) : null}
          </div>
          {better ? (
            <p className="mt-2 rounded-lg border border-[#2E7D5B]/30 bg-[#e8f3ed] px-3 py-2 text-[12px] leading-5 text-[#1f5c43]">
              {t("better").replace("{time}", better.time)}
            </p>
          ) : null}
          <p className="mt-2 text-[11px] text-slate-400">{t("updated")}</p>
        </>
      ) : (
        <>
          <p className="mt-1.5 text-[12px] leading-5 text-slate-700">
            {t("oddsLine", { month: monthName, percent: odds })}
          </p>
          <p className="mt-1 text-[11px] leading-5 text-slate-500">
            {t("oddsNote", { start: ODDS_PERIOD.start, end: ODDS_PERIOD.end })}{" "}
            {state === "ready" ? t("forecastOpens") : null}
          </p>
        </>
      )}

      <p className="mt-2 text-[11px] leading-5 text-slate-500">{t("slowerTrains")}</p>

      {showTour && tourHref && tourLabel ? (
        <div className="mt-3 border-t border-slate-100 pt-3">
          <p className="text-[12px] leading-5 text-slate-600">
            {tourReason === "low" ? t("cloudyAlt") : t("lowOddsAlt")}
          </p>
          <a
            href={tourHref}
            target="_blank"
            rel={AFFILIATE_REL}
            onClick={() =>
              trackAffiliateClick({
                category: "tour",
                provider: "klook",
                product: "fuji_day_tour",
                placement: "fuji_window_tour",
                link_id: "fujiDayTourTokyo",
                adid: "1385366",
                page_path: pagePath,
                page_type: "shinkansen_guide",
                locale,
                href: tourHref,
                // Matches the impression's label, so the two divide.
                label: tourLabel,
              })
            }
            className="mt-2 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-[12px] border border-[#D94A32] bg-white px-4 py-2 text-sm font-semibold text-[#D94A32] transition-colors hover:bg-[#fdf3f1] sm:w-auto sm:min-w-[15rem] sm:max-w-[22rem]"
          >
            {t("tourCta")}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>
      ) : null}
    </div>
  );
}
