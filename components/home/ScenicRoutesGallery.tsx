"use client";

import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import catalogue from "@/data/scenic-routes.json";

type GalleryRoute = {
  id: string;
  status: string;
  title: string;
  teaser?: string;
  href?: string;
  image?: { src: string; width: number; height: number; alt: string; illustrative: boolean };
};

/**
 * Japan's train-window views, from data/scenic-routes.json. Live routes link
 * to their seat answer; candidates are shown as "Coming soon" with no side or
 * seat, because none has been verified yet. A swipeable row on phones, a grid
 * from lg up.
 */
export function ScenicRoutesGallery() {
  const t = useTranslations("home.scenic");
  const routes = (catalogue.routes as GalleryRoute[])
    .filter((route) => route.image)
    .sort((a, b) => Number(b.status === "live") - Number(a.status === "live"));

  return (
    <section className="pt-12">
      <h2 className="text-2xl font-extrabold tracking-[-0.02em] text-ink md:text-[28px]">{t("title")}</h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t("sub")}</p>
      <div className="-mx-5 mt-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2 md:-mx-7 md:px-7 lg:mx-0 lg:grid lg:grid-cols-4 lg:overflow-visible lg:px-0">
        {routes.map((route) => {
          const live = route.status === "live" && route.href;
          const card = (
            <>
              <div className="relative aspect-[4/5] overflow-hidden bg-ink">
                <Image
                  src={route.image!.src}
                  alt={route.image!.alt}
                  fill
                  sizes="(min-width: 1024px) 280px, 72vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                />
                <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(180deg,rgba(11,18,32,0)_45%,rgba(11,18,32,0.82)_100%)]" />
                <span
                  className={[
                    "absolute left-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-bold",
                    live ? "bg-fuji text-white" : "bg-white/90 text-ink",
                  ].join(" ")}
                >
                  {live ? t("live") : t("soon")}
                </span>
                <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-white/75">{route.teaser}</p>
                  <p className="mt-1 flex items-start justify-between gap-2 text-[15px] font-bold leading-snug">
                    {route.title}
                    {live ? <ArrowRight className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" /> : null}
                  </p>
                </div>
                {route.image!.illustrative ? (
                  <span className="absolute right-2.5 top-3.5 text-[9.5px] font-medium text-white/70">Illustrative</span>
                ) : null}
              </div>
            </>
          );
          return live ? (
            <Link
              key={route.id}
              href={route.href!}
              className="group w-[72vw] max-w-[300px] shrink-0 snap-start overflow-hidden rounded-[20px] shadow-[0_10px_28px_rgba(11,18,32,0.12)] lg:w-auto lg:max-w-none"
            >
              {card}
            </Link>
          ) : (
            <div
              key={route.id}
              className="group w-[72vw] max-w-[300px] shrink-0 snap-start overflow-hidden rounded-[20px] shadow-[0_10px_28px_rgba(11,18,32,0.12)] lg:w-auto lg:max-w-none"
            >
              {card}
            </div>
          );
        })}
      </div>
    </section>
  );
}
