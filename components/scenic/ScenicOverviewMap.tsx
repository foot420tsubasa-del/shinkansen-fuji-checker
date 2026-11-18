"use client";

import { useEffect, useRef, useState } from "react";

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
const BOUNDS = { west: 128, east: 146.5, south: 30, north: 46.6 };

function project([lng, lat]: [number, number]): [number, number] {
  const x = 18 + ((lng - BOUNDS.west) / (BOUNDS.east - BOUNDS.west)) * (WIDTH - 36);
  const y = 18 + ((BOUNDS.north - lat) / (BOUNDS.north - BOUNDS.south)) * (HEIGHT - 36);
  return [x, y];
}

function pointString(points: [number, number][]) {
  return points.map((point) => project(point).map((value) => value.toFixed(1)).join(",")).join(" ");
}

export function ScenicOverviewMap({ locale, copy }: { locale: string; copy: MapCopy }) {
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

  return (
    <div ref={rootRef} className="overflow-hidden rounded-[22px] border border-slate-200 bg-white">
      <div className="relative min-h-[420px] bg-[#f5f7f3] sm:min-h-[560px]">
        {data ? (
          <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-labelledby="scenic-map-title scenic-map-desc" className="block h-auto w-full max-h-[680px]">
            <title id="scenic-map-title">{copy.ariaTitle}</title>
            <desc id="scenic-map-desc">{copy.ariaDescription}</desc>
            <rect width={WIDTH} height={HEIGHT} fill="#f5f7f3" />
            <g aria-hidden="true">
              {data.outline.map((ring, index) => (
                <polygon key={index} points={pointString(ring)} fill="#dfe8dc" stroke="#b8c7b3" strokeWidth="0.8" />
              ))}
            </g>
            <g>
              {data.routes.map((route) => (
                <a key={route.id} href={`${prefix}/scenic/${route.slug}`} aria-label={`${route.title}, ${route.line}`} className="group outline-none">
                  <title>{`${route.title} · ${route.line}`}</title>
                  <polyline points={pointString(route.points)} fill="none" stroke="transparent" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
                  <polyline
                    points={pointString(route.points)}
                    fill="none"
                    stroke="#d94a32"
                    strokeWidth="3.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="transition group-hover:stroke-[#16324f] group-focus:stroke-[#16324f]"
                  />
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
        <nav aria-label={copy.navigationLabel} className="flex flex-wrap gap-2 border-t border-slate-100 px-4 py-4">
          {data.routes.map((route) => (
            <a key={route.id} href={`${prefix}/scenic/${route.slug}`} className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-ink transition hover:bg-ink hover:text-white">
              {route.line}
            </a>
          ))}
        </nav>
      ) : null}
      <p className="border-t border-slate-100 px-4 py-2 text-[11px] text-slate-500">
        {copy.attributionPrefix} <a href="https://www.openstreetmap.org/copyright" className="underline">{copy.attributionLink}</a> · {copy.outlineCredit}
      </p>
    </div>
  );
}
