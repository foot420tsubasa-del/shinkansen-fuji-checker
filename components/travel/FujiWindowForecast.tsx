"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowRight, CloudRain, Loader2 } from "lucide-react";
import { AFFILIATE_REL } from "@/lib/link-rel";
import { trackAffiliateClick, trackAffiliateCtaView, trackCtaClick } from "@/lib/analytics";
import { getAffUrl, getDirectionTicketLink, SHINKANSEN_TICKET_URL } from "@/src/affiliateLinks";
import {
  findBetterDeparture,
  resolveWindow,
  type HourlyForecast,
  type OriginId,
  type VisibilityLevel,
} from "@/lib/fuji-window";

export type FujiWindowCopy = {
  eyebrow: string;
  title: string;
  intro: string;
  fromLabel: string;
  originTokyo: string;
  originKyoto: string;
  originOsaka: string;
  dateLabel: string;
  timeLabel: string;
  check: string;
  loading: string;
  error: string;
  /** "{time}" and "{side}" are substituted. */
  result: string;
  sideRight: string;
  sideLeft: string;
  /** "{percent}" is substituted. */
  cloud: string;
  rain: string;
  levelHigh: string;
  levelMedium: string;
  levelLow: string;
  /** "{time}" is substituted. */
  better: string;
  slowerTrains: string;
  book: string;
  /** Shown only when the chosen run is forecast to be clouded in. */
  cloudyAlt: string;
  tourCta: string;
  updated: string;
};

const LEVEL_STYLE: Record<VisibilityLevel, string> = {
  high: "border-[#2E7D5B] bg-[#e8f3ed] text-[#2E7D5B]",
  medium: "border-amber-400 bg-amber-50 text-amber-800",
  low: "border-slate-300 bg-slate-100 text-slate-600",
};

function todayInTokyo(): string {
  // The forecast is keyed to Asia/Tokyo, so the date list has to be too —
  // a reader in New York must not be offered a day the forecast has dropped.
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Tokyo" }).format(new Date());
}

/**
 * "Will I see Mt. Fuji from my train?" — answered for one specific departure.
 *
 * The site's other tools answer questions that resolve once: which side, which
 * seat letter. A reader gets the answer and never comes back. This one changes
 * every day the forecast updates, which gives the same reader a reason to open
 * the page again the week of the trip, and the morning of it.
 */
export function FujiWindowForecast({
  locale,
  pagePath,
  copy,
}: {
  locale: string;
  pagePath: string;
  copy: FujiWindowCopy;
}) {
  const [origin, setOrigin] = useState<OriginId>("tokyo");
  const [date, setDate] = useState(todayInTokyo());
  const [time, setTime] = useState("09:00");
  const [forecast, setForecast] = useState<HourlyForecast | null>(null);
  // Starts as "loading" rather than flipping to it inside the effect: the
  // fetch begins on mount either way, and setting it here avoids a cascading
  // render before the request has even left.
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [checked, setChecked] = useState(false);

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

  const days = useMemo(() => {
    if (!forecast?.time.length) return [] as string[];
    return [...new Set(forecast.time.map((t) => t.slice(0, 10)))];
  }, [forecast]);

  // Derived, not stored: the default date is picked before the forecast
  // arrives, and the forecast may not cover it (a reader whose clock is
  // already on tomorrow, or a window that has rolled forward). Clamping during
  // render keeps the lookup honest without a state round-trip.
  const day = days.length && !days.includes(date) ? days[0] : date;

  const result = useMemo(
    () => resolveWindow(origin, day, time, forecast),
    [origin, day, time, forecast],
  );
  const better = useMemo(
    () => (checked ? findBetterDeparture(origin, day, time, forecast, result.level) : null),
    [checked, origin, day, time, forecast, result.level],
  );

  // Offered only on a clouded-in run: a day tour is what you do instead of
  // looking out of the window, not a competitor to the ticket above it.
  const tourHref = getAffUrl("fujiDayTourTokyo");

  const ticket =
    getDirectionTicketLink(origin === "tokyo" ? "tokyo-osaka" : "osaka-tokyo") ?? {
      href: SHINKANSEN_TICKET_URL,
      linkId: "shinkansenTicket",
      adid: "1265303" as string | undefined,
    };

  const runCheck = () => {
    setChecked(true);
    trackCtaClick({
      placement: "fuji_window_check",
      href: pagePath,
      label: `${origin}|${day}|${time}`,
      category: "seat_checker",
      page_path: pagePath,
      locale,
    });
    trackAffiliateCtaView({
      provider: "klook",
      product: "shinkansen",
      placement: "fuji_window_result",
      page_path: pagePath,
      link_id: ticket.linkId,
      locale,
    });
  };

  const levelText =
    result.level === "high"
      ? copy.levelHigh
      : result.level === "medium"
        ? copy.levelMedium
        : copy.levelLow;

  const fieldClass =
    "min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:border-[#1d4e89] focus:outline-none";

  return (
    <section className="mt-6 overflow-hidden rounded-2xl border border-[#0b214a]/15 bg-[#f4f8fd] shadow-sm">
      <div className="px-4 py-4 sm:px-5">
        <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#1d4e89]">
          {copy.eyebrow}
        </p>
        <p className="mt-1 text-sm font-semibold text-slate-950">{copy.title}</p>
        <p className="mt-1 text-[12px] leading-5 text-slate-600">{copy.intro}</p>

        <div className="mt-3">
          <span className="text-[11px] font-semibold text-slate-600">{copy.fromLabel}</span>
          <div className="mt-1.5 grid gap-2 sm:grid-cols-3">
            {(
              [
                ["tokyo", copy.originTokyo],
                ["kyoto", copy.originKyoto],
                ["shin-osaka", copy.originOsaka],
              ] as Array<[OriginId, string]>
            ).map(([id, label]) => {
              const active = origin === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setOrigin(id)}
                  aria-pressed={active}
                  className={[
                    "min-h-11 rounded-xl border px-3 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1d4e89]/40",
                    active
                      ? "border-[#0b214a] bg-[#0b214a] text-white"
                      : "border-slate-300 bg-white text-slate-800 hover:border-[#1d4e89]",
                  ].join(" ")}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <label className="block">
            <span className="text-[11px] font-semibold text-slate-600">{copy.dateLabel}</span>
            <select
              value={day}
              onChange={(e) => setDate(e.target.value)}
              className={`mt-1.5 ${fieldClass}`}
            >
              {days.map((d) => (
                <option key={d} value={d}>
                  {new Intl.DateTimeFormat(locale, {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    timeZone: "Asia/Tokyo",
                  }).format(new Date(`${d}T12:00:00+09:00`))}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-[11px] font-semibold text-slate-600">{copy.timeLabel}</span>
            <select
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className={`mt-1.5 ${fieldClass}`}
            >
              {Array.from({ length: 16 }, (_, i) => `${String(i + 6).padStart(2, "0")}:00`).map(
                (t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ),
              )}
            </select>
          </label>
        </div>

        <button
          type="button"
          onClick={runCheck}
          disabled={state !== "ready"}
          className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#0b214a] bg-[#0b214a] px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#123163] disabled:opacity-50 sm:w-auto sm:min-w-[13rem]"
        >
          {state === "loading" ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              {copy.loading}
            </>
          ) : (
            copy.check
          )}
        </button>

        {state === "error" ? (
          <p className="mt-3 text-[12px] leading-5 text-slate-600">{copy.error}</p>
        ) : null}

        {checked && state === "ready" && result.level ? (
          <div className="mt-3.5 rounded-xl border border-[#0b214a]/15 bg-white p-3.5">
            <p className="text-base font-bold text-slate-950">
              {copy.result
                .replace("{time}", result.fujiTime)
                .replace("{side}", result.side === "right" ? copy.sideRight : copy.sideLeft)}
            </p>

            <div className="mt-2.5 flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[12px] font-bold ${LEVEL_STYLE[result.level]}`}
              >
                {levelText}
              </span>
              <span className="text-[12px] text-slate-600">
                {copy.cloud.replace("{percent}", String(Math.round(result.cloudPercent ?? 0)))}
              </span>
              {(result.precipMm ?? 0) >= 0.5 ? (
                <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-slate-700">
                  <CloudRain className="h-3.5 w-3.5" aria-hidden="true" />
                  {copy.rain}
                </span>
              ) : null}
            </div>

            {better ? (
              <p className="mt-2.5 rounded-lg border border-[#2E7D5B]/30 bg-[#e8f3ed] px-3 py-2 text-[12px] leading-5 text-[#1f5c43]">
                {copy.better.replace("{time}", better.time)}
              </p>
            ) : null}

            <p className="mt-2.5 text-[11px] leading-5 text-slate-500">{copy.slowerTrains}</p>

            <a
              href={ticket.href}
              target="_blank"
              rel={AFFILIATE_REL}
              onClick={() =>
                trackAffiliateClick({
                  category: "train",
                  provider: "klook",
                  product: "shinkansen",
                  placement: "fuji_window_result",
                  link_id: ticket.linkId,
                  adid: ticket.adid,
                  page_path: pagePath,
                  page_type: "shinkansen_guide",
                  locale,
                  href: ticket.href,
                  label: copy.book,
                  direction: origin === "tokyo" ? "tokyo-osaka" : "osaka-tokyo",
                })
              }
              className="mt-3 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-[12px] border border-[#D94A32] bg-[#D94A32] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#bf3d28] sm:w-auto sm:min-w-[15rem] sm:max-w-[22rem] md:min-h-11"
            >
              {copy.book}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>

            {result.level === "low" && tourHref ? (
              <div className="mt-3.5 border-t border-slate-100 pt-3">
                <p className="text-[12px] leading-5 text-slate-600">{copy.cloudyAlt}</p>
                <a
                  href={tourHref}
                  target="_blank"
                  rel={AFFILIATE_REL}
                  onClick={() =>
                    trackAffiliateClick({
                      category: "tour",
                      provider: "klook",
                      product: "fuji_day_tour",
                      placement: "fuji_window_cloudy_tour",
                      link_id: "fujiDayTourTokyo",
                      adid: "1385366",
                      page_path: pagePath,
                      page_type: "shinkansen_guide",
                      locale,
                      href: tourHref,
                      label: copy.tourCta,
                    })
                  }
                  className="mt-2 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-[12px] border border-[#D94A32] bg-white px-4 py-2 text-sm font-semibold text-[#D94A32] transition-colors hover:bg-[#fdf3f1] sm:w-auto sm:min-w-[15rem] sm:max-w-[22rem]"
                >
                  {copy.tourCta}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </a>
              </div>
            ) : null}

            <p className="mt-2.5 text-[11px] text-slate-400">{copy.updated}</p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
