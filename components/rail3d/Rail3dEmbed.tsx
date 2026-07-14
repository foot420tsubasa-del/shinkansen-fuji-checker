"use client";

import { ExternalLink } from "lucide-react";
import { trackCtaClick } from "@/lib/analytics";

/** Maps site locales to the Rail 3D pages' supported UI languages (all 9 site locales + ja). */
const RAIL3D_LANG: Record<string, string> = {
  en: "en",
  ko: "ko",
  "zh-TW": "zh-Hant",
  "zh-CN": "zh-Hans",
  fr: "fr",
  es: "es",
  "pt-BR": "pt-BR",
  de: "de",
  ru: "ru",
};

/**
 * Lazy iframe embed for the Rail 3D single-file tools
 * (/tokyo-rail-3d.html, /kansai-rail-3d.html). Uses the tools' embed mode
 * (simplified header, panel closed) with a light theme to match articles,
 * plus a tracked "open fullscreen" link.
 *
 * Plain <a> on purpose: the tools are static files served outside the
 * locale prefix, so the i18n-aware Link must not rewrite the href.
 */
export function Rail3dEmbed({
  city,
  locale,
  pagePath,
  title,
  caption,
}: {
  city: "tokyo" | "kansai";
  locale: string;
  pagePath: string;
  title: string;
  caption: string;
}) {
  const lang = RAIL3D_LANG[locale] ?? "en";
  const pageUrl = `/${city}-rail-3d.html`;
  const fullUrl = `${pageUrl}?lang=${lang}`;
  const src = `${pageUrl}?embed=1&theme=light&lang=${lang}`;

  return (
    <section className="rounded-[22px] border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-bold text-slate-950">{title}</p>
        <a
          href={fullUrl}
          onClick={() =>
            trackCtaClick({
              placement: `rail3d_embed_fullscreen_${city}`,
              href: fullUrl,
              label: `Open ${city} rail 3d fullscreen`,
              category: "navigation",
              page_path: pagePath,
              locale,
            })
          }
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-700 hover:text-sky-900"
        >
          Open fullscreen
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
      <iframe
        src={src}
        title={title}
        loading="lazy"
        allow="fullscreen"
        className="mt-3 block aspect-[16/10] w-full rounded-[14px] border border-slate-200 bg-slate-50"
      />
      <p className="mt-2 text-xs leading-5 text-slate-500">{caption}</p>
    </section>
  );
}
