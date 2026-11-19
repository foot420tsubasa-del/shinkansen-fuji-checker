"use client";

import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import catalogue from "@/data/scenic-routes.json";
import discovery from "@/data/scenic-discovery.json";
import { trackCtaClick } from "@/lib/analytics";
import { PhotoCredit } from "@/components/scenic/PhotoCredit";
import type { ScenicRoute } from "@/lib/scenic";

type GalleryRoute = {
  id: string;
  status: string;
  title: string;
  teaser?: string;
  href?: string;
  image?: ScenicRoute["image"];
};

/**
 * Japan's train-window views on the homepage. Since the 2026-11-20 design pass
 * it shows six featured routes (data/scenic-discovery.json homeFeatured) and
 * sends the rest to /scenic, which has the filters, map and month table: all
 * fourteen as equal cards made the homepage a long catalogue. A swipeable row
 * on phones, three across from lg up.
 */
export function ScenicRoutesGallery() {
  const t = useTranslations("home.scenic");
  const locale = useLocale();
  const byId = new Map((catalogue.routes as GalleryRoute[]).map((route) => [route.id, route]));
  const routes = (discovery.homeFeatured as string[])
    .map((id) => byId.get(id))
    .filter((route): route is GalleryRoute => Boolean(route?.image && route.status === "live" && route.href));
  const total = (catalogue.routes as GalleryRoute[]).filter((route) => route.status === "live").length;

  return (
    <section className="pt-14 md:pt-16" aria-labelledby="home-scenic-heading">
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
        <div className="max-w-2xl">
          <h2 id="home-scenic-heading" className="text-2xl font-extrabold tracking-[-0.02em] text-ink md:text-[32px]">{t("title")}</h2>
          <p className="mt-2 text-[15px] leading-6 text-slate-600">{t("sub")}</p>
        </div>
        <Link
          href="/scenic"
          onClick={() => trackCtaClick({ placement: "home_scenic_gallery_all", href: "/scenic", label: "all-routes", category: "train", locale })}
          className="hidden h-11 items-center gap-2 rounded-full border border-slate-300 bg-white px-5 text-sm font-bold text-ink transition-colors hover:border-ink md:inline-flex"
        >
          {t("all", { count: total })} <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
      <div className="-mx-5 mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2 md:-mx-7 md:px-7 lg:mx-0 lg:grid lg:grid-cols-3 lg:gap-5 lg:overflow-visible lg:px-0">
        {routes.map((route) => (
          <article
            key={route.id}
            className="w-[76vw] max-w-[320px] shrink-0 snap-start lg:w-auto lg:max-w-none"
          >
            <Link
              href={route.href!}
              className="group block overflow-hidden rounded-[22px] bg-ink shadow-[0_10px_28px_rgba(11,18,32,0.12)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
            >
            <div className="relative aspect-[4/5] overflow-hidden lg:aspect-[4/3]">
              <Image
                src={route.image!.src}
                alt={route.image!.alt}
                fill
                sizes="(min-width: 1024px) 380px, 76vw"
                className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                style={{ objectPosition: route.image!.position }}
              />
              <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(180deg,rgba(11,18,32,0)_40%,rgba(11,18,32,0.85)_100%)]" />
              {route.image!.illustrative ? (
                <span className="absolute right-3 top-3 rounded bg-black/40 px-1.5 py-0.5 text-[10px] font-medium text-white/85">Illustrative</span>
              ) : null}
              <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-white/75">{route.teaser}</p>
                <p className="mt-1.5 flex items-start justify-between gap-3 text-[17px] font-bold leading-snug">
                  {route.title}
                  <ArrowRight className="mt-1 h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                </p>
              </div>
            </div>
            </Link>
            <PhotoCredit src={route.image!.src} className="mt-2 px-1" />
          </article>
        ))}
      </div>
      <Link
        href="/scenic"
        onClick={() => trackCtaClick({ placement: "home_scenic_gallery_all", href: "/scenic", label: "all-routes", category: "train", locale })}
        className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-5 text-[15px] font-bold text-ink md:hidden"
      >
        {t("all", { count: total })} <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </section>
  );
}
