"use client";

import { useEffect, useRef, useState } from "react";
import { makeScenicMapFrame } from "@/lib/scenic-map-frame";

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
  { lng: 127.5, lat: 29.5 },
  { lng: 146.5, lat: 46.6 },
], WIDTH, HEIGHT, 18);

function project([lng, lat]: [number, number]): [number, number] {
  const { x, y } = FRAME.project({ lng, lat });
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
              {data.routes.map((route) => (
                <a key={route.id} href={`${prefix}/scenic/${route.slug}`} aria-label={`${route.title}, ${route.line}`} className="group outline-none">
                  <title>{`${route.title} · ${route.line}`}</title>
                  <polyline points={pointString(route.points)} fill="none" stroke="transparent" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
                  <polyline points={pointString(route.points)} fill="none" stroke="white" strokeWidth="6.5" strokeLinecap="round" strokeLinejoin="round" pointerEvents="none" />
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
