"use client";

import { useEffect, useRef, useState } from "react";
import { makeScenicMapFrame } from "@/lib/scenic-map-frame";
import extras from "@/data/scenic-map-extras.json";

/** Journey extras (2026-11-21): verified West Japan items from /scenic/golden-route, drawn dashed so they are not read as seat-side route guides. */
type MapExtra = { id: string; label: string; title: string; href: string; points: [number, number][]; marker?: [number, number] };
const EXTRAS = extras.items as unknown as MapExtra[];
/** Orientation for the Tokyo → Kyoto → Osaka → Hiroshima journey. */
const CITIES: { name: string; at: [number, number]; dx: number; dy: number; anchor: "start" | "end" }[] = extras.cities as never;

type OverviewRoute = {
  id: string;
  slug: string;
  title: string;
  line: string;
  points: [number, number][];
};

type OverviewData = {
  outline: [number, number][][];
  routes: OverviewRoute[];
};

type MapCopy = {
  ariaTitle: string;
  ariaDescription: string;
  loading: string;
  navigationLabel: string;
  attributionPrefix: string;
  attributionLink: string;
  outlineCredit: string;
};

const WIDTH = 620;
const HEIGHT = 680;
const FRAME = makeScenicMapFrame([
  // Main islands only (2026-11-21): the old frame kept Okinawa and open sea, which left the west of the map empty.
  { lng: 129.6, lat: 31.0 },
  { lng: 146.0, lat: 45.6 },
], WIDTH, HEIGHT, 18);

function project([lng, lat]: [number, number]): [number, number] {
  const { x, y } = FRAME.project({ lng, lat });
  return [x, y];
}

function pointString(points: [number, number][]) {
  return points.map((point) => project(point).map((value) => value.toFixed(1)).join(",")).join(" ");
}

/** `highlight`: route ids matching the page filters. Others stay on the map, greyed out. */
export function ScenicOverviewMap({ locale, copy, highlight }: { locale: string; copy: MapCopy; highlight?: string[] }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<OverviewData | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    let active = true;
    const load = () => {
      void import("@/data/scenic-overview.json").then((module) => {
        if (active) setData(module.default as unknown as OverviewData);
      });
    };
    if (!("IntersectionObserver" in window)) {
      load();
      return () => {
        active = false;
      };
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        load();
      },
      { rootMargin: "320px" },
    );
    observer.observe(root);
    return () => {
      active = false;
      observer.disconnect();
    };
  }, []);

  const prefix = locale === "en" ? "" : `/${locale}`;
  const isOn = (id: string) => !highlight || highlight.includes(id);
  // Matching routes are drawn last so they sit on top of the greyed-out ones.
  const ordered = data ? [...data.routes].sort((a, b) => Number(isOn(a.id)) - Number(isOn(b.id))) : [];

  return (
    <div ref={rootRef} className="overflow-hidden rounded-[22px] border border-slate-200 bg-white">
      <div className="relative mx-auto aspect-[620/680] max-w-[620px]">
        {data ? (
          <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-labelledby="scenic-map-title scenic-map-desc" className="block h-auto w-full max-h-[680px]">
            <title id="scenic-map-title">{copy.ariaTitle}</title>
            <desc id="scenic-map-desc">{copy.ariaDescription}</desc>
            <rect width={WIDTH} height={HEIGHT} fill="#d9ebf3" />
            <g aria-hidden="true">
              {data.outline.map((ring, index) => (
                <polygon key={index} points={pointString(ring)} fill="#e8eee2" stroke="#9aaf98" strokeWidth="1.2" />
              ))}
            </g>
            <g>
              {ordered.map((route) => (
                <a key={route.id} href={`${prefix}/scenic/${route.slug}`} aria-label={`${route.title}, ${route.line}`} className={["group outline-none", isOn(route.id) ? "" : "opacity-60"].join(" ")}>
                  <title>{`${route.title} · ${route.line}`}</title>
                  <polyline points={pointString(route.points)} fill="none" stroke="transparent" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
                  <polyline points={pointString(route.points)} fill="none" stroke="white" strokeWidth="6.5" strokeLinecap="round" strokeLinejoin="round" pointerEvents="none" />
                  <polyline
                    points={pointString(route.points)}
                    fill="none"
                    stroke={isOn(route.id) ? "#d94a32" : "#9aa6b2"}
                    strokeWidth={isOn(route.id) ? "3.4" : "2.4"}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="transition group-hover:stroke-[#16324f] group-focus:stroke-[#16324f]"
                  />
                </a>
              ))}
            </g>
            <g aria-hidden="true" className="pointer-events-none">
              {CITIES.map((city) => {
                const [x, y] = project(city.at);
                return (
                  <g key={city.name}>
                    <circle cx={x} cy={y} r="3" fill="#0b1220" stroke="white" strokeWidth="1.5" />
                    <text x={x + city.dx} y={y + city.dy} textAnchor={city.anchor} className="fill-[#0b1220] text-[13px] font-bold" stroke="white" strokeWidth="3.5" paintOrder="stroke">{city.name}</text>
                  </g>
                );
              })}
            </g>
            <g>
              {EXTRAS.map((extra) => (
                <a key={extra.id} href={`${prefix}${extra.href}`} aria-label={extra.title} className="group outline-none">
                  <title>{extra.title}</title>
                  <polyline points={pointString(extra.points)} fill="none" stroke="transparent" strokeWidth="12" strokeLinecap="round" />
                  <polyline points={pointString(extra.points)} fill="none" stroke="white" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" pointerEvents="none" />
                  <polyline points={pointString(extra.points)} fill="none" stroke="#16324f" strokeWidth="2.8" strokeDasharray="5 3.5" strokeLinecap="round" strokeLinejoin="round" className="transition group-hover:stroke-[#d94a32]" />
                  {extra.marker ? (() => {
                    const [x, y] = project(extra.marker);
                    return <circle cx={x} cy={y} r="6" fill="#16324f" stroke="white" strokeWidth="2" className="transition group-hover:fill-[#d94a32]" />;
                  })() : null}
                </a>
              ))}
            </g>
          </svg>
        ) : (
          <div className="absolute inset-0 grid place-items-center" aria-live="polite">
            <p className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-500 shadow-sm">{copy.loading}</p>
          </div>
        )}
      </div>
      {data ? (
        <nav aria-label={copy.navigationLabel} className="flex flex-wrap items-center gap-2 border-t border-slate-100 px-4 py-4">
          {EXTRAS.map((extra) => (
            <a key={extra.id} href={`${prefix}${extra.href}`} className="inline-flex min-h-11 items-center rounded-full border border-dashed border-[#16324f] bg-white px-3 py-1.5 text-xs font-bold text-ink transition hover:bg-ink hover:text-white sm:min-h-0">
              {extra.label}
            </a>
          ))}
          {[...ordered].reverse().map((route) => (
            <a key={route.id} href={`${prefix}/scenic/${route.slug}`} className={["rounded-full px-3 py-1.5 text-xs font-bold transition hover:bg-ink hover:text-white", isOn(route.id) ? "bg-[#fde7e2] text-ink" : "bg-slate-100 text-slate-500"].join(" ")}>
              {route.line}
            </a>
          ))}
        </nav>
      ) : null}
      <p className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-slate-100 px-4 py-2 text-xs text-slate-600">
        <span className="inline-flex items-center gap-1.5"><span aria-hidden="true" className="inline-block h-[3px] w-5 rounded bg-[#d94a32]" />{extras.legend.routes}</span>
        <span className="inline-flex items-center gap-1.5"><span aria-hidden="true" className="inline-block w-5 border-t-[3px] border-dashed border-[#16324f]" />{extras.legend.extras}</span>
      </p>
      <p className="border-t border-slate-100 px-4 py-2 text-[11px] text-slate-500">
        {copy.attributionPrefix} <a href="https://www.openstreetmap.org/copyright" className="underline">{copy.attributionLink}</a> · {copy.outlineCredit}
      </p>
    </div>
  );
}
