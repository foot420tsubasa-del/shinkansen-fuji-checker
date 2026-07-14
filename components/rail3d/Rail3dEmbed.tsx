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
 * Cross-link so readers discover the other city's model (keyed by the
 * LINK TARGET city). The articles embed only one city, so without this
 * the Kansai/Tokyo counterpart is invisible from the article.
 */
const ALT_CITY_LABELS: Record<string, { tokyo: string; kansai: string }> = {
  en: { kansai: "Kansai version (Osaka · Kyoto · Kobe) is also available →", tokyo: "Tokyo version is also available →" },
  "pt-BR": { kansai: "Também há a versão de Kansai (Osaka · Quioto · Kobe) →", tokyo: "Também há a versão de Tóquio →" },
  es: { kansai: "También hay una versión de Kansai (Osaka · Kioto · Kobe) →", tokyo: "También hay una versión de Tokio →" },
  ko: { kansai: "간사이판(오사카·교토·고베)도 있습니다 →", tokyo: "도쿄판도 있습니다 →" },
  "zh-TW": { kansai: "也有關西版（大阪・京都・神戶）→", tokyo: "也有東京版 →" },
  "zh-CN": { kansai: "也有关西版（大阪・京都・神户）→", tokyo: "也有东京版 →" },
  fr: { kansai: "Une version Kansai (Osaka · Kyoto · Kobe) est aussi disponible →", tokyo: "Une version Tokyo est aussi disponible →" },
  de: { kansai: "Auch als Kansai-Version (Osaka · Kyoto · Kobe) verfügbar →", tokyo: "Auch als Tokio-Version verfügbar →" },
  ru: { kansai: "Есть также версия для Кансая (Осака · Киото · Кобэ) →", tokyo: "Есть также версия для Токио →" },
};

/**
 * Lazy iframe embed for the Rail 3D single-file tools
 * (/tokyo-rail-3d.html, /kansai-rail-3d.html). Uses the tools' embed mode
 * (simplified header, panel closed) with a light theme to match articles,
 * plus a tracked "open fullscreen" link and a cross-link to the other
 * city's model.
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
  const otherCity = city === "tokyo" ? "kansai" : "tokyo";
  const altUrl = `/${otherCity}-rail-3d.html?lang=${lang}`;
  const altLabel = (ALT_CITY_LABELS[locale] ?? ALT_CITY_LABELS.en)[otherCity];

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
      <a
        href={altUrl}
        onClick={() =>
          trackCtaClick({
            placement: `rail3d_embed_alt_${otherCity}`,
            href: altUrl,
            label: `Open ${otherCity} rail 3d from ${city} embed`,
            category: "navigation",
            page_path: pagePath,
            locale,
          })
        }
        className="mt-1.5 inline-block text-xs font-semibold text-sky-700 hover:text-sky-900"
      >
        {altLabel}
      </a>
    </section>
  );
}
