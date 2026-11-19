"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Check, Hotel } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { AFFILIATE_REL } from "@/lib/link-rel";
import { trackAffiliateClick, trackCtaClick } from "@/lib/analytics";
import { ProviderButton } from "@/components/ui/ProviderButton";
import type { BookingHotelLink } from "@/lib/booking-hotels";
import design from "@/data/stay-hub-design.json";
import {
  isTradeOff,
  rankAreas,
  type FinderArea,
  type FinderDestination,
  type FinderOption,
  type LegResult,
} from "@/lib/stay-finder";

const OPTIONS: FinderOption[] = ["luggage", "shinkansen", "airport"];
const OPTION_KEY: Record<FinderOption, string> = {
  luggage: "optLuggage",
  shinkansen: "optShinkansen",
  airport: "optAirport",
};
const OPTION_ICON: Record<FinderOption, string> = { luggage: "🧳", shinkansen: "🚄", airport: "✈️" };
const focus = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink";

function legBadge(kind: LegResult["kind"]) {
  return kind === "transfer"
    ? "bg-amber-400/15 text-amber-200"
    : kind === "partial"
      ? "bg-sky-400/15 text-sky-200"
      : "bg-emerald-400/15 text-emerald-200";
}

function Meter({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-white/[0.07] px-3 py-2.5 text-xs text-white/70">
      {label}
      <b className="mt-0.5 block text-lg text-white">{Math.round(value)}</b>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full bg-emerald-300" style={{ width: `${Math.min(100, value)}%` }} />
      </div>
    </div>
  );
}

/**
 * The Where to Stay finder. Tap the places on the trip; the answer is the
 * station area that reaches them with the fewest changes of train, with the
 * lines that do it and a hotel search already set to that station.
 *
 * The selection lives in the URL (?go=shinjuku,asakusa) so an answer can be
 * shared or linked from an article; the page's canonical stays bare.
 */
export function StayFinder({
  areas,
  destinations,
  lineNotes,
  hotelPicks,
}: {
  areas: FinderArea[];
  destinations: FinderDestination[];
  /** "areaId|line" → a caveat shown under that leg. */
  lineNotes: Record<string, string>;
  hotelPicks?: Record<string, BookingHotelLink | null>;
}) {
  const t = useTranslations("areasToStayHub.finder");
  const locale = useLocale();
  const [selected, setSelected] = useState<string[]>([]);
  const [options, setOptions] = useState<FinderOption[]>([]);
  // False until a shared ?go= selection has been read, so the URL is not
  // rewritten (and the selection lost) before it is.
  const [urlRead, setUrlRead] = useState(false);
  const loggedRef = useRef<string>("");

  // Read a shared selection once, after hydration, so the server HTML and the
  // first client render agree.
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const params = new URLSearchParams(window.location.search);
      const go = [...new Set((params.get("go") ?? "").split(","))].filter((id) => destinations.some((d) => d.id === id));
      const opt = (params.get("opt") ?? "")
        .split(",")
        .filter((o): o is FinderOption => OPTIONS.includes(o as FinderOption));
      if (go.length) {
        setSelected(go.slice(0, 4));
        if (!window.location.hash) document.getElementById("stay-finder")?.scrollIntoView();
      }
      setOptions([...new Set(opt)]);
      setUrlRead(true);
    });
    return () => cancelAnimationFrame(frame);
  }, [destinations]);

  useEffect(() => {
    if (!urlRead) return;
    const url = new URL(window.location.href);
    if (selected.length) url.searchParams.set("go", selected.join(","));
    else url.searchParams.delete("go");
    if (options.length) url.searchParams.set("opt", options.join(","));
    else url.searchParams.delete("opt");
    window.history.replaceState(null, "", url.toString());
  }, [selected, options, urlRead]);

  const chosen = useMemo(
    () => selected.map((id) => destinations.find((d) => d.id === id)).filter((d): d is FinderDestination => Boolean(d)),
    [selected, destinations],
  );
  const ranked = useMemo(
    () => (chosen.length >= 2 ? rankAreas(areas, chosen, options) : []),
    [areas, chosen, options],
  );
  const best = ranked[0];
  const hotel = best && hotelPicks?.[best.area.id];
  const alternatives = ranked.slice(1, 3);

  useEffect(() => {
    if (!best) return;
    const key = `${selected.join("+")}|${options.join("+")}`;
    if (loggedRef.current === key) return;
    loggedRef.current = key;
    trackCtaClick({
      placement: "stay_finder_answer",
      href: `/areas-to-stay?go=${selected.join(",")}`,
      label: `${selected.join("+")}→${best.area.id}`,
      category: "stay",
      locale,
    });
  }, [best, selected, options, locale]);

  const toggle = (id: string) => {
    setSelected((current) =>
      current.includes(id) ? current.filter((x) => x !== id) : current.length >= 4 ? current : [...current, id],
    );
  };
  const toggleOption = (option: FinderOption) =>
    setOptions((current) => (current.includes(option) ? current.filter((x) => x !== option) : [...current, option]));

  // The area name is styled on its own, and word order differs by language
  // ("Stay near Kanda", "住在神田附近"), so the message is split around it.
  const [stayNearBefore, stayNearAfter = ""] = (t.raw("stayNear") as string).split("{area}");

  const legText = (leg: LegResult) =>
    leg.kind === "walk" ? t("walk") : leg.kind === "direct" ? t("direct") : leg.kind === "partial" ? t("partial") : t("transfer");

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
      <div className="min-w-0">
        <p className="text-xs font-bold uppercase tracking-[0.1em] text-fuji">{t("eyebrow")}</p>
        <h2 id="stay-finder-title" className="mt-2 text-2xl font-extrabold leading-[1.1] tracking-[-0.025em] text-ink md:text-[32px]">
          {t("title")}
        </h2>
        <p className="mt-3 max-w-[480px] text-base leading-7 text-slate-600">{t("sub")}</p>

        <fieldset className="mt-6 min-w-0">
        <legend className="mb-2 text-sm font-bold text-ink">{t("visitLabel")}</legend>
        <div className="flex flex-wrap gap-2" aria-describedby="stay-finder-progress">
          {destinations.map((dest) => {
            const on = selected.includes(dest.id);
            return (
              <button
                key={dest.id}
                type="button"
                aria-pressed={on}
                onClick={() => toggle(dest.id)}
                className={[
                  `inline-flex min-h-11 items-center gap-1.5 rounded-full border-[1.5px] px-3.5 py-2 text-sm font-semibold ${focus} disabled:cursor-not-allowed disabled:text-slate-500`,
                  on ? "border-ink bg-ink text-white" : "border-slate-300 bg-white text-ink hover:bg-slate-50",
                ].join(" ")}
                disabled={selected.length >= 4 && !on}
              >
                {on ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : null}
                {dest.label}
              </button>
            );
          })}
        </div>
        </fieldset>

        <fieldset className="mt-5 min-w-0">
        <legend className="mb-2 text-sm font-bold text-ink">{t("alsoLabel")}</legend>
        <div className="flex flex-wrap gap-2">
          {OPTIONS.map((option) => {
            const on = options.includes(option);
            return (
              <button
                key={option}
                type="button"
                aria-pressed={on}
                onClick={() => toggleOption(option)}
                className={[
                  `inline-flex min-h-11 items-center gap-1.5 rounded-full border-[1.5px] px-3 py-2 text-sm font-semibold ${focus}`,
                  on
                    ? "border-emerald-700 bg-emerald-50 text-emerald-800"
                    : "border-dashed border-slate-300 bg-white text-slate-600 hover:bg-slate-50",
                ].join(" ")}
              >
                <span aria-hidden="true">{OPTION_ICON[option]}</span>
                {t(OPTION_KEY[option])}
              </button>
            );
          })}
          {(selected.length > 0 || options.length > 0) ? (
            <button
              type="button"
              onClick={() => {
                setSelected([]);
                setOptions([]);
              }}
              className={`min-h-11 px-2 text-sm font-semibold text-slate-600 underline underline-offset-2 ${focus}`}
            >
              {t("clear")}
            </button>
          ) : null}
        </div>
        </fieldset>
        <div id="stay-finder-progress" className="mt-3 text-sm text-slate-700" aria-live="polite">
          {best ? (
            <a href="#stay-finder-answer" className={`inline-flex min-h-11 items-center gap-2 font-bold text-ink underline underline-offset-4 lg:sr-only lg:focus:not-sr-only ${focus}`}>
              {t("stayNear", { area: best.area.name })}<ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />
            </a>
          ) : t("pickMore")}
        </div>
      </div>

      {best ? (
        <div id="stay-finder-answer" tabIndex={-1} className={`grid min-w-0 scroll-mt-24 grid-cols-1 gap-4 ${focus}`}>
            <div className="rounded-[22px] bg-ink p-5 text-white md:p-7">
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-white/60">
                {isTradeOff(best) ? t("tradeOff") : t("bestBase")}
              </p>
              <p className="mt-2 text-[34px] font-extrabold leading-[1.08] tracking-[-0.03em] md:text-[42px]">
                {stayNearBefore}
                <span className="text-[#ff7a5c]">{best.area.name}</span>
                {stayNearAfter}
              </p>
              <ul className="mt-4 border-t border-white/15">
                {best.legs.map((leg) => {
                  const note = leg.line ? lineNotes[`${best.area.id}|${leg.line}`] : undefined;
                  return (
                    <li key={leg.destinationId} className="flex items-start justify-between gap-3 border-b border-white/10 py-2.5 text-sm">
                      <span className="min-w-0">
                        {leg.label}
                        {leg.line ? <span className="mt-0.5 block text-xs text-white/60">{leg.line}</span> : null}
                        {note ? <span className="mt-0.5 block text-xs text-amber-200/90">{note}</span> : null}
                      </span>
                      <span className={["max-w-[46%] rounded-lg px-2 py-1 text-end text-xs font-bold", legBadge(leg.kind)].join(" ")}>
                        {legText(leg)}
                      </span>
                    </li>
                  );
                })}
              </ul>
              <p className="mt-3 text-xs leading-5 text-white/75">{t("note")}</p>
              <details className="group mt-2">
                <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 text-sm font-semibold underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
                  {t("stationEase")} · {t("luggage")}
                </summary>
                <div className="grid grid-cols-2 gap-2.5">
                  <Meter label={t("stationEase")} value={best.area.scores.stationSimplicity} />
                  <Meter label={t("luggage")} value={best.area.scores.luggageFriendly} />
                </div>
              </details>
            </div>

            {hotel || best.area.hotelUrl ? (
              <div className="rounded-[22px] border border-slate-200 bg-white p-5">
                {hotel ? (
                  <>
                    <p className="mb-2 text-base font-extrabold text-ink">{hotel.name}</p>
                    <ProviderButton
                      provider="booking_travelpayouts"
                      href={hotel.href}
                      placement="stay_finder_hotel"
                      pagePath="/areas-to-stay"
                      locale={locale}
                      linkId={hotel.linkId}
                      hotelName={hotel.name}
                      areaId={best.area.id}
                      area={best.area.name}
                      product="hotel"
                      city="tokyo"
                    >
                      {design.hotelLink}
                    </ProviderButton>
                  </>
                ) : null}
                {best.area.hotelUrl ? (
                <a
                  href={best.area.hotelUrl}
                  target="_blank"
                  rel={AFFILIATE_REL}
                  onClick={() =>
                    trackAffiliateClick({
                      category: "hotel",
                      provider: "booking_travelpayouts",
                      placement: "stay_finder_result",
                      href: best.area.hotelUrl ?? "",
                      label: `${selected.join("+")}→${best.area.id}`,
                      link_id: `booking_${best.area.id}`,
                      product: "hotel_search",
                      area_id: best.area.id,
                      locale,
                    })
                  }
                  className={`inline-flex min-h-11 items-center gap-2 py-2 text-[15px] font-semibold text-ink underline underline-offset-4 ${focus}`}
                >
                  <Hotel className="h-4 w-4 shrink-0" aria-hidden="true" />
                  {t("hotelsCta", { area: best.area.name })}
                  <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />
                </a>
                ) : null}
                {best.area.hotelUrl ? <p className="text-xs text-slate-600">{t("hotelsNote", { area: best.area.name })}</p> : null}
                <p className="mt-3 border-t border-slate-200 pt-3 text-xs leading-5 text-slate-600">
                  {t("disclosure")}
                </p>
              </div>
            ) : null}

            {alternatives.length ? (
              <details className="border-y border-slate-200">
                <summary className={`flex min-h-11 cursor-pointer items-center gap-2 text-sm font-bold text-ink underline underline-offset-4 ${focus}`}>
                  {t("alsoGood")} ({alternatives.length})
                </summary>
                <div className="grid gap-2">
                  {alternatives.map((alt) => (
                    <div key={alt.area.id} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
                      <div className="min-w-0">
                        <p className="font-bold text-ink">{alt.area.name}</p>
                        <p className="mt-0.5 text-xs leading-5 text-slate-500">
                          {alt.legs.map((leg) => `${leg.label}: ${legText(leg)}`).join(" · ")}
                        </p>
                      </div>
                      {alt.area.hotelUrl ? (
                        <a
                          href={alt.area.hotelUrl}
                          target="_blank"
                          rel={AFFILIATE_REL}
                          aria-label={t("hotelsCta", { area: alt.area.name })}
                          onClick={() =>
                            trackAffiliateClick({
                              category: "hotel",
                              provider: "booking_travelpayouts",
                              placement: "stay_finder_result",
                              href: alt.area.hotelUrl ?? "",
                              label: `${selected.join("+")}→${alt.area.id}:alt`,
                              link_id: `booking_${alt.area.id}`,
                              product: "hotel_search",
                              area_id: alt.area.id,
                              locale,
                            })
                          }
                          className={`inline-flex min-h-11 shrink-0 items-center gap-1 rounded-full border border-slate-300 px-3 text-sm font-semibold text-ink hover:bg-slate-50 ${focus}`}
                        >
                          <Hotel className="h-3.5 w-3.5" aria-hidden="true" />
                          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                        </a>
                      ) : null}
                    </div>
                  ))}
                </div>
                {alternatives.some((alt) => alt.area.hotelUrl) ? <p className="my-3 text-xs leading-5 text-slate-600">{t("disclosure")}</p> : null}
              </details>
            ) : null}
        </div>
      ) : null}
    </div>
  );
}
