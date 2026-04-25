"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Check,
  DollarSign,
  ExternalLink,
  MapPin,
  Phone,
  Plane,
  ShoppingBag,
  Sun,
  Train,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { SiteLegalLinks } from "@/components/content/SiteLegalLinks";
import { LastCheckedNote } from "@/components/content/LastCheckedNote";
import { requireAffUrl } from "@/src/affiliateLinks";
import { trackAffiliateClick, trackChecklistComplete, trackTemplateSelect } from "@/lib/analytics";
import { AFFILIATE_REL } from "@/lib/link-rel";

// ─── Constants ──────────────────────────────────────────────────────────────

const LS_PLANNER_TEMPLATE = "fujiseat_planner_template";
const LS_PLANNER_DATE = "fujiseat_planner_date";
const LS_PLANNER_CHECKS = "fujiseat_planner_checks";

type CityData = { key: string; daysKey: string; emoji: string };

type TemplateData = {
  id: string;
  days: number;
  cityKeys: CityData[];
  itinerarySlug: string;
  jrPassWorthIt: boolean;
};

const TEMPLATE_DATA: TemplateData[] = [
  {
    id: "classic-7",
    days: 7,
    cityKeys: [
      { key: "tokyo", daysKey: "day1_3", emoji: "🗼" },
      { key: "kyoto", daysKey: "day4_5", emoji: "⛩️" },
      { key: "osaka", daysKey: "day6_7", emoji: "🍣" },
    ],
    itinerarySlug: "7-day-first-time-japan",
    jrPassWorthIt: false,
  },
  {
    id: "express-5",
    days: 5,
    cityKeys: [
      { key: "tokyo", daysKey: "day1_2", emoji: "🗼" },
      { key: "kyoto", daysKey: "day3_4", emoji: "⛩️" },
      { key: "depart", daysKey: "day5", emoji: "✈️" },
    ],
    itinerarySlug: "5-day-express-japan",
    jrPassWorthIt: false,
  },
  {
    id: "full-10",
    days: 10,
    cityKeys: [
      { key: "tokyo", daysKey: "day1_3", emoji: "🗼" },
      { key: "kawaguchiko", daysKey: "day4", emoji: "🗻" },
      { key: "hakone", daysKey: "day5", emoji: "♨️" },
      { key: "kyoto", daysKey: "day6_8", emoji: "⛩️" },
      { key: "osaka", daysKey: "day9_10", emoji: "🍣" },
    ],
    itinerarySlug: "10-day-with-fuji",
    jrPassWorthIt: false,
  },
  {
    id: "deep-14",
    days: 14,
    cityKeys: [
      { key: "tokyo", daysKey: "day1_4", emoji: "🗼" },
      { key: "kawaguchiko", daysKey: "day5_6", emoji: "🗻" },
      { key: "kyoto", daysKey: "day7_10", emoji: "⛩️" },
      { key: "hiroshima", daysKey: "day11_12", emoji: "☮️" },
      { key: "osaka", daysKey: "day13_14", emoji: "🍣" },
    ],
    itinerarySlug: "14-day-deep-japan",
    jrPassWorthIt: true,
  },
];

type CheckData = {
  id: string;
  critical: boolean;
  href?: string;
  hasLink?: boolean;
};

const CHECKLIST_DATA: CheckData[] = [
  { id: "passport", critical: true },
  { id: "esim", critical: true, href: requireAffUrl("esim"), hasLink: true },
  { id: "train", critical: false, href: requireAffUrl("jrPass"), hasLink: true },
  { id: "transfer", critical: true, href: "/airport-transfers/narita-to-shinjuku", hasLink: true },
  { id: "hotel", critical: true, href: "/areas-to-stay/tokyo-first-time", hasLink: true },
  { id: "insurance", critical: false, href: requireAffUrl("insurance"), hasLink: true },
  { id: "cash", critical: false },
  { id: "maps", critical: false },
  { id: "translate", critical: false },
];

type BookingData = {
  key: string;
  href: string;
  external: boolean;
};

const BOOKING_DATA: BookingData[] = [
  { key: "esim", href: requireAffUrl("esim"), external: true },
  { key: "transfer", href: "/airport-transfers/narita-to-shinjuku", external: false },
  { key: "stay", href: "/areas-to-stay/tokyo-first-time", external: false },
  { key: "jrPass", href: requireAffUrl("jrPass"), external: true },
  { key: "insurance", href: requireAffUrl("insurance"), external: true },
];

const EMERGENCY_DATA = [
  { key: "police", number: "110", emoji: "🚨" },
  { key: "ambulance", number: "119", emoji: "🚑" },
  { key: "tourist", number: "050-3816-2787", emoji: "📞" },
  { key: "translation", number: "03-5285-8185", emoji: "🌐" },
];

type WeatherData = {
  cityKey: string;
  temp: number;
  high: number;
  low: number;
  code: number;
  precip: number;
};

const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  tokyo: { lat: 35.6812, lng: 139.7671 },
  kyoto: { lat: 35.0116, lng: 135.7681 },
  osaka: { lat: 34.6937, lng: 135.5023 },
  hiroshima: { lat: 34.3853, lng: 132.4553 },
  kawaguchiko: { lat: 35.5109, lng: 138.7558 },
  hakone: { lat: 35.2323, lng: 139.1069 },
};

function weatherIcon(code: number) {
  if (code <= 0) return "☀️";
  if (code <= 2) return "🌤️";
  if (code <= 3) return "☁️";
  if (code <= 48) return "🌫️";
  if (code <= 67) return "🌧️";
  if (code <= 77) return "🌨️";
  return "⛈️";
}

// ─── Component ──────────────────────────────────────────────────────────────

export function PlannerClient() {
  const t = useTranslations("planner");

  const [plannerState, setPlannerState] = useState<{
    templateId: string;
    departureDate: string;
    checks: Record<string, boolean>;
    now: number;
  } | null>(null);

  const [weather, setWeather] = useState<{ forTemplate: string; data: WeatherData[] } | null>(null);
  const [jpyInput, setJpyInput] = useState("");
  const [usdResult, setUsdResult] = useState("");
  const [rate, setRate] = useState(155);

  const mounted = plannerState !== null;
  const templateId = plannerState?.templateId ?? "classic-7";
  const departureDate = plannerState?.departureDate ?? "";
  const checks = plannerState?.checks ?? {};

  const setTemplateId = useCallback((id: string) => {
    trackTemplateSelect(id);
    setPlannerState((prev) => {
      if (!prev) return prev;
      localStorage.setItem(LS_PLANNER_TEMPLATE, id);
      return { ...prev, templateId: id };
    });
  }, []);

  const setDepartureDate = useCallback((d: string) => {
    setPlannerState((prev) => {
      if (!prev) return prev;
      localStorage.setItem(LS_PLANNER_DATE, d);
      return { ...prev, departureDate: d };
    });
  }, []);

  const setChecks = useCallback((updater: (prev: Record<string, boolean>) => Record<string, boolean>) => {
    setPlannerState((prev) => {
      if (!prev) return prev;
      const next = updater(prev.checks);
      localStorage.setItem(LS_PLANNER_CHECKS, JSON.stringify(next));
      return { ...prev, checks: next };
    });
  }, []);

  // Hydrate from localStorage + set client time
  useEffect(() => {
    let tid = "classic-7";
    let dd = "";
    let ch: Record<string, boolean> = {};
    try {
      const stored = localStorage.getItem(LS_PLANNER_TEMPLATE);
      if (stored && TEMPLATE_DATA.find((x) => x.id === stored)) tid = stored;
      const d = localStorage.getItem(LS_PLANNER_DATE);
      if (d) dd = d;
      const c = localStorage.getItem(LS_PLANNER_CHECKS);
      if (c) ch = JSON.parse(c);
    } catch {}
    // eslint-disable-next-line react-hooks/set-state-in-effect -- SSR requires effect-based localStorage hydration
    setPlannerState({ templateId: tid, departureDate: dd, checks: ch, now: Date.now() });
  }, []);

  const templateData = TEMPLATE_DATA.find((td) => td.id === templateId) ?? TEMPLATE_DATA[0];

  const templateName = t(`routes.${templateData.id}.name`);
  const templateDesc = t(`routes.${templateData.id}.desc`);
  const templateJrNote = t(`routes.${templateData.id}.jrNote`);

  const templateCities = useMemo(
    () =>
      templateData.cityKeys.map((c) => ({
        key: c.key,
        name: t(`cities.${c.key}`),
        days: t(`dayRanges.${c.daysKey}`),
        emoji: c.emoji,
      })),
    [templateData, t],
  );

  // Countdown
  const daysUntil = useMemo(() => {
    if (!departureDate || !plannerState) return null;
    const diff = new Date(departureDate + "T00:00:00").getTime() - plannerState.now;
    if (diff <= 0) return 0;
    return Math.ceil(diff / 86400000);
  }, [departureDate, plannerState]);

  const weatherLoading = weather === null || weather.forTemplate !== templateId;

  // Fetch weather for route cities
  useEffect(() => {
    const uniqueKeys = [...new Set(
      templateData.cityKeys.map((c) => c.key).filter((key) => CITY_COORDS[key]),
    )];
    if (uniqueKeys.length === 0) return;

    const lats = uniqueKeys.map((k) => CITY_COORDS[k].lat).join(",");
    const lngs = uniqueKeys.map((k) => CITY_COORDS[k].lng).join(",");
    const tid = templateData.id;

    fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lats}&longitude=${lngs}&current=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=Asia/Tokyo&forecast_days=1`
    )
      .then((r) => r.json())
      .then((data) => {
        const items = Array.isArray(data) ? data : [data];
        const results: WeatherData[] = [];
        items.forEach((d, i) => {
          if (d.current && uniqueKeys[i]) {
            results.push({
              cityKey: uniqueKeys[i],
              temp: d.current.temperature_2m,
              code: d.current.weather_code,
              high: d.daily?.temperature_2m_max?.[0] ?? d.current.temperature_2m,
              low: d.daily?.temperature_2m_min?.[0] ?? d.current.temperature_2m,
              precip: d.daily?.precipitation_probability_max?.[0] ?? 0,
            });
          }
        });
        setWeather({ forTemplate: tid, data: results });
      })
      .catch(() => setWeather({ forTemplate: tid, data: [] }));
  }, [templateData]);

  // Fetch exchange rate
  useEffect(() => {
    fetch("https://open.er-api.com/v6/latest/USD")
      .then((r) => r.json())
      .then((data) => {
        if (data.rates?.JPY) setRate(data.rates.JPY);
      })
      .catch(() => {});
  }, []);

  const handleJpy = (v: string) => {
    setJpyInput(v);
    const n = parseFloat(v);
    setUsdResult(isNaN(n) ? "" : `$${(n / rate).toFixed(2)}`);
  };

  const toggleCheck = useCallback((id: string) => {
    setChecks((prev) => {
      if (!prev[id]) trackChecklistComplete(id);
      return { ...prev, [id]: !prev[id] };
    });
  }, [setChecks]);

  const checkedCount = CHECKLIST_DATA.filter((c) => checks[c.id]).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase text-sky-700">{t("badge")}</p>
          <h1 className="mt-1 text-2xl font-semibold text-slate-950 md:text-3xl">
            {t("title")}
          </h1>
        </div>
        <Link
          href="/"
          className="text-sm font-medium text-slate-600 hover:text-slate-950"
        >
          <ArrowLeft className="mr-1 inline h-4 w-4" />
          {t("home")}
        </Link>
      </div>

      {/* Countdown banner */}
      {mounted && departureDate && daysUntil !== null && (
        <div className="rounded-[18px] border border-sky-200 bg-sky-50 px-5 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Plane className="h-5 w-5 text-sky-600" />
              <div>
                <p className="text-sm font-semibold text-sky-900">
                  {daysUntil === 0
                    ? t("departureDay")
                    : t("daysUntil", { count: daysUntil })}
                </p>
                <p className="text-xs text-sky-700">{departureDate}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-sky-700">
                {checkedCount}/{CHECKLIST_DATA.length}
              </p>
              <p className="text-[10px] text-sky-600">{t("tasksDone")}</p>
            </div>
          </div>
          {checkedCount > 0 && (
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-sky-200">
              <div
                className="h-full rounded-full bg-sky-600 transition-all duration-500"
                style={{ width: `${(checkedCount / CHECKLIST_DATA.length) * 100}%` }}
              />
            </div>
          )}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        {/* Left column */}
        <div className="space-y-6">
          {/* Route selector */}
          <section className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-[11px] font-semibold uppercase text-slate-500">{t("step1")}</p>
            <h2 className="mt-1 text-lg font-semibold text-slate-950">{t("chooseRoute")}</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {TEMPLATE_DATA.map((td) => (
                <button
                  key={td.id}
                  type="button"
                  onClick={() => setTemplateId(td.id)}
                  className={[
                    "rounded-2xl border px-4 py-3 text-left transition-all",
                    templateId === td.id
                      ? "border-sky-300 bg-sky-50 shadow-sm"
                      : "border-slate-200 bg-white hover:border-slate-300",
                  ].join(" ")}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-900">{t(`routes.${td.id}.name`)}</p>
                    <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
                      {t(`routes.${td.id}.duration`)}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{t(`routes.${td.id}.desc`)}</p>
                </button>
              ))}
            </div>
          </section>

          {/* Route timeline */}
          <section className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-slate-950">
                  {t("routeLabel", { name: templateName })}
                </h2>
                <p className="mt-0.5 text-xs text-slate-500">{templateDesc}</p>
              </div>
              <Link
                href={`/itineraries/${templateData.itinerarySlug}`}
                className="inline-flex items-center gap-1 text-xs font-semibold text-sky-700 hover:text-sky-900"
              >
                {t("fullItinerary")}
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="mt-5">
              {templateCities.map((city, i) => (
                <div key={`${city.key}-${i}`} className="relative flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-sky-200 bg-sky-50 text-sm">
                      {city.emoji}
                    </div>
                    {i < templateCities.length - 1 && (
                      <div className="w-px flex-1 bg-slate-200" />
                    )}
                  </div>
                  <div className="flex-1 pb-5">
                    <p className="text-sm font-semibold text-slate-900">{city.name}</p>
                    <p className="text-xs text-slate-500">{city.days}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* JR Pass route-specific note */}
            <div className={[
              "rounded-xl border px-3 py-2.5 text-xs",
              templateData.jrPassWorthIt
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-amber-200 bg-amber-50 text-amber-800",
            ].join(" ")}>
              <span className="font-semibold">
                {templateData.jrPassWorthIt ? t("jrRecommended") : t("jrMayNotPayOff")}
              </span>
              <span className="ml-1">{templateJrNote}</span>
            </div>
          </section>

          {/* Departure date */}
          <section className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-[11px] font-semibold uppercase text-slate-500">{t("step2")}</p>
            <h2 className="mt-1 text-lg font-semibold text-slate-950">{t("setDate")}</h2>
            <input
              type="date"
              value={departureDate}
              onChange={(e) => setDepartureDate(e.target.value)}
              className="mt-3 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-100 sm:w-64"
            />
          </section>

          {/* Pre-departure checklist */}
          <section className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-[11px] font-semibold uppercase text-slate-500">{t("step3")}</p>
            <div className="flex items-center justify-between">
              <h2 className="mt-1 text-lg font-semibold text-slate-950">{t("checklist")}</h2>
              {mounted && (
                <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-semibold text-slate-600">
                  {checkedCount}/{CHECKLIST_DATA.length}
                </span>
              )}
            </div>
            <div className="mt-4 space-y-2">
              {CHECKLIST_DATA.map((item) => {
                const isDone = mounted && checks[item.id];
                const isExternal = item.href?.startsWith("http");
                return (
                  <div
                    key={item.id}
                    className={[
                      "flex items-center gap-3 rounded-2xl border px-3 py-2.5 transition-all",
                      isDone
                        ? "border-emerald-200 bg-emerald-50/60"
                        : "border-slate-200 bg-white",
                    ].join(" ")}
                  >
                    <button
                      type="button"
                      onClick={() => toggleCheck(item.id)}
                      className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-slate-300 transition-colors hover:border-sky-400"
                    >
                      {isDone && <Check className="h-3.5 w-3.5 text-emerald-600" />}
                    </button>
                    <span
                      className={[
                        "flex-1 text-sm",
                        isDone
                          ? "text-emerald-700 line-through decoration-emerald-300"
                          : "text-slate-800",
                      ].join(" ")}
                    >
                      {item.critical && !isDone && (
                        <span className="mr-1 text-amber-500">!</span>
                      )}
                      {t(`checks.${item.id}`)}
                    </span>
                    {item.hasLink && item.href && !isDone && (
                      isExternal ? (
                        <a
                          href={item.href}
                          target="_blank"
                          rel={AFFILIATE_REL}
                          onClick={() => trackAffiliateClick("checklist", item.id)}
                          className="inline-flex items-center gap-1 rounded-lg border border-sky-200 bg-sky-50 px-2.5 py-1 text-[11px] font-semibold text-sky-700 transition-colors hover:bg-sky-100"
                        >
                          {t(`checkLinks.${item.id}`)}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : (
                        <Link
                          href={item.href}
                          className="inline-flex items-center gap-1 rounded-lg border border-sky-200 bg-sky-50 px-2.5 py-1 text-[11px] font-semibold text-sky-700 transition-colors hover:bg-sky-100"
                        >
                          {t(`checkLinks.${item.id}`)}
                          <ArrowRight className="h-3 w-3" />
                        </Link>
                      )
                    )}
                  </div>
                );
              })}
            </div>
            <p className="mt-3 text-[10px] text-slate-400">
              {t("partnerNote")}
            </p>
            {mounted && checkedCount === CHECKLIST_DATA.length && (
              <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-center text-sm font-semibold text-emerald-800">
                {t("allSet")}
              </div>
            )}
          </section>
        </div>

        {/* Right sidebar */}
        <div className="lg:sticky lg:top-6 space-y-6 self-start">
          {/* Recommended bookings */}
          <section className="rounded-[22px] border border-sky-200 bg-sky-50/70 p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-4 w-4 text-sky-700" />
              <h3 className="text-sm font-semibold text-slate-950">{t("bookEssentials")}</h3>
            </div>
            <p className="mt-1 text-[10px] text-slate-500">{t("recommendedFor", { name: templateName })}</p>
            <div className="mt-3 space-y-2">
              {BOOKING_DATA.map((booking) => (
                <div key={booking.key} className="rounded-xl border border-white bg-white p-3 shadow-sm">
                  <p className="text-xs font-semibold text-slate-900">{t(`bookings.${booking.key}.label`)}</p>
                  <p className="mt-0.5 text-[10px] leading-4 text-slate-500">{t(`bookings.${booking.key}.desc`)}</p>
                  {booking.external ? (
                    <a
                      href={booking.href}
                      target="_blank"
                      rel={AFFILIATE_REL}
                      onClick={() => trackAffiliateClick("bookings-sidebar", booking.key)}
                      className="mt-2 inline-flex items-center gap-1 rounded-lg bg-[#07142f] px-3 py-1.5 text-[11px] font-semibold text-white transition-colors hover:bg-slate-800"
                    >
                      {t(`bookings.${booking.key}.cta`)}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : (
                    <Link
                      href={booking.href}
                      className="mt-2 inline-flex items-center gap-1 rounded-lg bg-[#07142f] px-3 py-1.5 text-[11px] font-semibold text-white transition-colors hover:bg-slate-800"
                    >
                      {t(`bookings.${booking.key}.cta`)}
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  )}
                </div>
              ))}
            </div>
            <p className="mt-3 text-[10px] text-slate-400">
              {t("bookingsPartnerNote")}
            </p>
          </section>

          {/* Weather */}
          <section className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <Sun className="h-4 w-4 text-amber-500" />
              <h3 className="text-sm font-semibold text-slate-950">{t("weather.title")}</h3>
            </div>
            <div className="mt-3 space-y-2">
              {weatherLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-14 animate-pulse rounded-xl bg-slate-100" />
                  ))}
                </div>
              ) : weather && weather.data.length > 0 ? (
                weather.data.map((w) => (
                  <div
                    key={w.cityKey}
                    className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl">{weatherIcon(w.code)}</span>
                      <div>
                        <p className="text-xs font-semibold text-slate-800">{t(`cities.${w.cityKey}`)}</p>
                        <p className="text-[10px] text-slate-500">
                          H {Math.round(w.high)}° / L {Math.round(w.low)}°
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-slate-800">{Math.round(w.temp)}°</p>
                      {w.precip > 0 && (
                        <p className="text-[10px] text-sky-600">💧 {w.precip}%</p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400">{t("weather.unavailable")}</p>
              )}
            </div>
          </section>

          {/* Currency */}
          <section className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-emerald-600" />
              <h3 className="text-sm font-semibold text-slate-950">{t("currency.title")}</h3>
            </div>
            <p className="mt-1 text-[10px] text-slate-500">
              $1 = ¥{rate.toFixed(0)}
            </p>
            <div className="mt-3 flex items-center gap-2">
              <div className="flex-1">
                <label className="text-[10px] font-semibold text-slate-400">JPY</label>
                <input
                  type="number"
                  value={jpyInput}
                  onChange={(e) => handleJpy(e.target.value)}
                  placeholder="10000"
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-sky-300"
                />
              </div>
              <span className="mt-4 text-slate-400">→</span>
              <div className="flex-1">
                <label className="text-[10px] font-semibold text-slate-400">USD</label>
                <div className="mt-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                  {usdResult || "—"}
                </div>
              </div>
            </div>
          </section>

          {/* Emergency contacts */}
          <section className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-red-500" />
              <h3 className="text-sm font-semibold text-slate-950">{t("emergency.title")}</h3>
            </div>
            <p className="mt-1 text-[10px] text-amber-600">{t("emergency.save")}</p>
            <div className="mt-3 space-y-2">
              {EMERGENCY_DATA.map((e) => (
                <div
                  key={e.number}
                  className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-3 py-2"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{e.emoji}</span>
                    <span className="text-xs font-medium text-slate-700">{t(`emergency.${e.key}`)}</span>
                  </div>
                  <a
                    href={`tel:${e.number}`}
                    className="text-xs font-bold text-sky-700"
                  >
                    {e.number}
                  </a>
                </div>
              ))}
            </div>
          </section>

          {/* Quick links */}
          <section className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-950">{t("quickLinks.title")}</h3>
            <div className="mt-3 space-y-1.5">
              {([
                { key: "airport", href: "/airport-transfers/narita-to-shinjuku", icon: Plane },
                { key: "stay", href: "/areas-to-stay/tokyo-first-time", icon: MapPin },
                { key: "seat", href: "/", icon: Train },
                { key: "itinerary", href: `/itineraries/${templateData.itinerarySlug}`, icon: Calendar },
                { key: "map", href: "/command-center", icon: MapPin },
              ] as const).map((link) => (
                <Link
                  key={link.key}
                  href={link.href}
                  className="flex items-center gap-2.5 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 transition-colors hover:border-slate-200 hover:bg-white"
                >
                  <link.icon className="h-3.5 w-3.5 text-slate-400" />
                  {t(`quickLinks.${link.key}`)}
                  <ArrowRight className="ml-auto h-3 w-3 text-slate-300" />
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-200 pt-6 text-center text-[10px] text-slate-400">
        <p>{t("footer.brand")}</p>
        <p className="mt-1">
          {t("footer.ready")}{" "}
          <a
            href={requireAffUrl("jrPass")}
            target="_blank"
            rel={AFFILIATE_REL}
            onClick={() => trackAffiliateClick("planner-footer", "JR Pass")}
            className="text-sky-600 underline underline-offset-2"
          >
            {t("footer.jrPass")}
          </a>
          {" "}{t("footer.or")}{" "}
          <a
            href={requireAffUrl("esim")}
            target="_blank"
            rel={AFFILIATE_REL}
            onClick={() => trackAffiliateClick("planner-footer", "Japan eSIM")}
            className="text-sky-600 underline underline-offset-2"
          >
            {t("footer.esim")}
          </a>
          {" "}{t("footer.mapQuestion")}{" "}
          <Link href="/command-center" className="text-sky-600 underline underline-offset-2">
            {t("footer.commandCenter")}
          </Link>
          .
        </p>
        <LastCheckedNote className="mt-2" />
        <SiteLegalLinks className="mt-3 text-slate-400" />
      </footer>
    </div>
  );
}
