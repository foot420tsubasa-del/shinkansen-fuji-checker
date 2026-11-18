"use client";

import { useEffect, useState } from "react";
import { ArrowRight, CalendarPlus } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { trackCtaClick } from "@/lib/analytics";
import { icsEventsDataUri, type ViewEvent } from "@/lib/fuji-reminder";
import {
  addClock,
  fmtOffset,
  LIVE_ROUTES,
  referenceDeparture,
  seatedSide,
  timeline,
  trainsServing,
  type Direction,
  type ViewTag,
  type ViewshedPoint,
} from "@/lib/scenic";
import { RouteViewMap } from "./RouteViewMap";

type MapPoint = ViewshedPoint & { lat: number; lng: number };

/** Viewshed files, fetched only when a timeline for that route is shown. */
const VIEWSHED_LOADERS: Record<string, () => Promise<{ points: MapPoint[] }>> = {
  "hokuriku-alps": () => import("@/data/routes/hokuriku-alps-viewshed.json").then((m) => (m.default ?? m) as unknown as { points: MapPoint[] }),
  "tokaido-fuji": () => import("@/data/routes/tokaido-fuji-viewshed.json").then((m) => (m.default ?? m) as unknown as { points: MapPoint[] }),
  "enoden-coast": () => import("@/data/routes/enoden-coast-viewshed.json").then((m) => (m.default ?? m) as unknown as { points: MapPoint[] }),
  "fujikyu-fuji": () => import("@/data/routes/fujikyu-fuji-viewshed.json").then((m) => (m.default ?? m) as unknown as { points: MapPoint[] }),
  "hakone-tozan": () => import("@/data/routes/hakone-tozan-viewshed.json").then((m) => (m.default ?? m) as unknown as { points: MapPoint[] }),
  "yurikamome-night": () => import("@/data/routes/yurikamome-night-viewshed.json").then((m) => (m.default ?? m) as unknown as { points: MapPoint[] }),
  "gono-coast": () => import("@/data/routes/gono-coast-viewshed.json").then((m) => (m.default ?? m) as unknown as { points: MapPoint[] }),
  "furano-biei-flowers": () => import("@/data/routes/furano-biei-flowers-viewshed.json").then((m) => (m.default ?? m) as unknown as { points: MapPoint[] }),
  "kurobe-gorge": () => import("@/data/routes/kurobe-gorge-viewshed.json").then((m) => (m.default ?? m) as unknown as { points: MapPoint[] }),
  "joetsu-snow": () => import("@/data/routes/joetsu-snow-viewshed.json").then((m) => (m.default ?? m) as unknown as { points: MapPoint[] }),
  "tohoku-iwate": () => import("@/data/routes/tohoku-iwate-viewshed.json").then((m) => (m.default ?? m) as unknown as { points: MapPoint[] }),
  "sagano-gorge": () => import("@/data/routes/sagano-gorge-viewshed.json").then((m) => (m.default ?? m) as unknown as { points: MapPoint[] }),
};

function tokyoDate(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Tokyo" }).format(new Date());
}

/**
 * The window, minute by minute, for one journey on a mapped route: each view
 * in the order it comes, the clock time, the side, the seat where verified,
 * and how long it stays in sight — with the map highlighting the one tapped
 * and every view in one calendar file with an alert two minutes ahead.
 */
export function RouteTimeline({
  routeId,
  direction,
  from,
  to,
  tags = [],
  showRouteLink = true,
}: {
  routeId: string;
  direction: Direction;
  from: string;
  to: string;
  tags?: ViewTag[];
  showRouteLink?: boolean;
}) {
  const t = useTranslations("home.search");
  const locale = useLocale();
  const route = LIVE_ROUTES.find((r) => r.id === routeId)!;
  const trains = trainsServing(route, direction, from, to);
  const [trainId, setTrainId] = useState(trains[0]?.id);
  const [points, setPoints] = useState<MapPoint[] | null>(null);
  const [highlight, setHighlight] = useState<string | null>(null);
  const [date, setDate] = useState(tokyoDate);
  const train = trains.find((x) => x.id === trainId) ?? trains[0] ?? null;
  const [departure, setDeparture] = useState(() => referenceDeparture(route, train, direction, from));

  useEffect(() => {
    let live = true;
    VIEWSHED_LOADERS[routeId]?.().then((data) => {
      if (live) setPoints(data.points);
    });
    return () => {
      live = false;
    };
  }, [routeId]);

  const { items } = points ? timeline(route, direction, from, to, points, train?.id) : { items: [] };
  const shown = tags.length ? items.filter((it) => it.view.tags.some((tag) => tags.includes(tag))) : items;

  const sizeLabel = (angle: number | null) =>
    angle === null ? null : angle >= 8 ? t("sizeBig") : angle >= 4 ? t("sizeClear") : t("sizeSmall");
  const tagLabel = (tag: ViewTag) => (tag === "snow" ? t("mountain") : t(tag));

  const events: ViewEvent[] = shown.map((it) => ({
    date,
    first: addClock(departure, it.start),
    peak: addClock(departure, it.start),
    last: addClock(departure, Math.max(it.end, it.start + it.visibleMinutes)),
    title: `${it.view.name} — ${it.side === "right" ? t("right") : t("left")}${it.view.seatByDirection ? ` (${it.view.seatByDirection[direction]})` : it.view.seat ? ` (${t("seat")} ${it.view.seat.split(" ")[0]})` : ""}`,
    details: `${from} → ${to}${train ? ` · ${train[direction].train}` : ""}. ${t("minutes", { n: it.visibleMinutes })}.`,
    url: `https://fujiseat.com${route.href ?? ""}`,
    alarmMinutes: 2,
  }));

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="min-w-0 rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_12px_32px_rgba(11,18,32,0.06)] md:p-6">
        <p className="text-xs font-bold uppercase tracking-[0.1em] text-fuji">{route.line}</p>
        <h2 className="mt-1 text-xl font-extrabold tracking-[-0.02em] text-ink md:text-2xl">{t("timelineTitle")}</h2>
        <p className="mt-1 text-sm font-semibold text-slate-600">
          {from} → {to}
        </p>

        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-[auto_1fr_1fr] sm:items-end">
          {trains.length > 1 ? (
            <div className="col-span-2 sm:col-span-1">
              <span className="text-[11px] font-semibold text-slate-500">{t("train")}</span>
              <div className="mt-1 flex gap-1.5">
                {trains.map((tr) => (
                  <button
                    key={tr.id}
                    type="button"
                    aria-pressed={tr.id === train?.id}
                    onClick={() => {
                      setTrainId(tr.id);
                      setDeparture(referenceDeparture(route, tr, direction, from));
                    }}
                    className={[
                      "min-h-10 rounded-full border px-3.5 text-sm font-semibold",
                      tr.id === train?.id ? "border-ink bg-ink text-white" : "border-slate-300 bg-white text-ink",
                    ].join(" ")}
                  >
                    {tr.label}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
          <label className="block">
            <span className="text-[11px] font-semibold text-slate-500">{t("departure")}</span>
            <input
              type="time"
              value={departure}
              onChange={(e) => e.target.value && setDeparture(e.target.value)}
              className="mt-1 min-h-10 w-full rounded-xl border border-slate-300 px-3 text-sm"
            />
          </label>
          <label className="block">
            <span className="text-[11px] font-semibold text-slate-500">{t("date")}</span>
            <input
              type="date"
              value={date}
              onChange={(e) => e.target.value && setDate(e.target.value)}
              className="mt-1 min-h-10 w-full rounded-xl border border-slate-300 px-3 text-sm"
            />
          </label>
        </div>

        <ol className="mt-5 grid gap-2">
          {points === null ? (
            <li className="h-20 animate-pulse rounded-2xl bg-slate-100" />
          ) : shown.length === 0 ? (
            <li className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
              {tags.length ? t("noTagOnRoute", { tag: tags.map(tagLabel).join(", ") }) : t("noViews")}
            </li>
          ) : (
            shown.map((it) => {
              const size = sizeLabel(it.view.maxAngle);
              const active = highlight === it.view.id;
              return (
                <li key={it.view.id}>
                  <button
                    type="button"
                    onClick={() => setHighlight(active ? null : it.view.id)}
                    aria-pressed={active}
                    className={[
                      "grid w-full grid-cols-[64px_minmax(0,1fr)_auto] items-start gap-3 rounded-2xl border px-3.5 py-3 text-left transition-colors",
                      active ? "border-ink bg-slate-50" : "border-slate-200 bg-white hover:bg-slate-50",
                    ].join(" ")}
                  >
                    <span>
                      <b className="block text-[17px] tabular-nums text-ink">{addClock(departure, it.start)}</b>
                      <span className="block text-[11px] tabular-nums text-slate-500">{fmtOffset(it.start)}</span>
                    </span>
                    <span className="min-w-0">
                      <b className="block text-[15px] leading-snug text-ink">{it.view.name}</b>
                      <span className="mt-0.5 block text-xs leading-5 text-slate-600">
                        {it.view.from} → {it.view.to} · {t("minutes", { n: it.visibleMinutes })}
                        {size ? ` · ${size}` : ""}
                      </span>
                      <span className="block text-[11px] leading-5 text-slate-500">
                        {t("season")}: {it.view.season}
                        {/only/.test(it.view.basis) ? ` · ${t("modelOnly")}` : ""}
                      </span>
                      {it.reversedAt.length ? (
                        <span className="mt-1 block rounded-lg bg-amber-50 px-2 py-1 text-[11px] font-semibold leading-4 text-amber-900">
                          {t("reversed", {
                            station: it.reversedAt[it.reversedAt.length - 1],
                            side: seatedSide(it.side, it.reversedAt) === "right" ? t("right") : t("left"),
                          })}
                        </span>
                      ) : null}
                    </span>
                    <span className="flex flex-col items-end gap-1">
                      <span className={["rounded-full px-2.5 py-0.5 text-[11px] font-extrabold uppercase text-white", it.side === "right" ? "bg-[#d94a32]" : "bg-[#2f6fd6]"].join(" ")}>
                        {it.side === "right" ? t("right") : t("left")}
                      </span>
                      {it.view.seatByDirection ? (
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10.5px] font-bold text-slate-700">{it.view.seatByDirection[direction]}</span>
                      ) : it.view.seat ? (
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10.5px] font-bold text-slate-700">
                          {t("seat")} {it.view.seat.split(" ")[0]}
                        </span>
                      ) : null}
                    </span>
                  </button>
                </li>
              );
            })
          )}
        </ol>

        {shown.length ? (
          <div className="mt-4">
            <a
              href={icsEventsDataUri(events)}
              download={`${route.id}-window-views.ics`}
              onClick={() =>
                trackCtaClick({
                  placement: "route_timeline_calendar",
                  href: route.href ?? "/",
                  label: `${route.id}|${from}|${to}|${train?.id ?? "model"}`,
                  category: "seat_checker",
                  locale,
                })
              }
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-ink px-4 text-sm font-bold text-white hover:bg-[#1c2740]"
            >
              <CalendarPlus className="h-4 w-4" aria-hidden="true" />
              {t("addAll")}
            </a>
            <p className="mt-1.5 text-center text-[11px] text-slate-500">{t("alertNote")}</p>
          </div>
        ) : null}

        <p className="mt-4 border-t border-slate-100 pt-3 text-[11px] leading-5 text-slate-500">
          {train ? t("basedOn", { train: train[direction].train }) : route.timing?.source}
        </p>
        {showRouteLink && route.href ? (
          <Link href={route.href} className="mt-2 inline-flex items-center gap-1.5 text-sm font-bold text-fuji">
            {t("details")} <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        ) : null}
      </div>

      <div className="min-w-0">
        {points && route.stations && route.targets && route.views && route.directions ? (
          <RouteViewMap
            points={points}
            stations={route.stations}
            targets={route.targets}
            views={route.views}
            labelStations={route.page?.labelStations ?? []}
            direction={direction}
            directionLabel={route.directions.forward}
            highlight={highlight}
          />
        ) : (
          <div className="aspect-[680/460] animate-pulse rounded-[24px] bg-slate-100" />
        )}
      </div>
    </div>
  );
}
