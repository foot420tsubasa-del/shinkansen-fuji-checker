import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { SiteHeader } from "../components/SiteHeader";
import { SiteLegalLinks } from "@/components/content/SiteLegalLinks";
import { getAlternates } from "@/i18n/hreflang";

type Props = { params: Promise<{ locale: string }> };

const PAGE_PATH = "/how-to-buy-suica";

/**
 * The simulator HTML now supports ten UI languages of its own:
 *   ja, en, zh-CN, zh-TW, ko, de, fr, es, pt-BR, ru
 *
 * fujiseat.com supports nine site locales:
 *   en, pt-BR, es, ko, zh-TW, zh-CN, fr, de, ru
 *
 * Every fujiseat locale maps 1:1 to a simulator translation; the
 * map is kept explicit so the fallback stays controllable from
 * the page side without having to edit the simulator HTML.
 */
const GAME_LANG_BY_LOCALE: Record<string, string> = {
  en: "en",
  "pt-BR": "pt-BR",
  es: "es",
  ko: "ko",
  "zh-TW": "zh-TW",
  "zh-CN": "zh-CN",
  fr: "fr",
  de: "de",
  ru: "ru",
};

function resolveGameLang(locale: string): string {
  return GAME_LANG_BY_LOCALE[locale] ?? "en";
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "suicaGuide" });
  const title = t("title");
  const description = t("metaDescription");
  return {
    title: `${title} | fujiseat`,
    description,
    robots: locale === "en" ? undefined : { index: false, follow: true },
    openGraph: { title, description, siteName: "fujiseat" },
    alternates: getAlternates(PAGE_PATH, locale),
  };
}

export default async function HowToBuySuicaPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "suicaGuide" });
  const gameLang = resolveGameLang(locale);
  const iframeSrc = `/games/suica-simulator.html?lang=${encodeURIComponent(gameLang)}`;

  return (
    <main className="page-shell min-h-screen text-slate-950">
      <SiteHeader />

      <Container className="py-8 md:py-12">
        <section className="overflow-hidden rounded-[28px] border border-[#d9e5f2] bg-[linear-gradient(135deg,#f8fcff,#fff_48%,#edf7ff)] p-6 shadow-[0_18px_45px_rgba(9,35,70,0.08)] md:p-9">
          <p className="inline-flex rounded-full border border-sky-100 bg-white px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.1em] text-[#145aa0]">
            Suica
          </p>
          <h1 className="mt-4 max-w-3xl font-serif text-3xl font-bold leading-tight text-[#082653] md:text-4xl">
            {t("title")}
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
            {t("intro")}
          </p>
        </section>

        <section className="mt-8 flex justify-center">
          {/*
            The simulator is a self-contained kiosk-style HTML page with
            its own scroll. We frame it with a thin shell so the
            embedded UI stays centered (max ~460px wide on desktop) and
            never breaks the page on mobile. Height is tuned to fit the
            tallest panel; the iframe still scrolls internally on
            shorter viewports.
          */}
          <iframe
            src={iframeSrc}
            title={t("iframeTitle")}
            loading="lazy"
            className="block w-full max-w-[460px] rounded-[24px] border border-slate-200 bg-white shadow-[0_18px_45px_rgba(9,35,70,0.10)]"
            style={{ height: "980px" }}
          />
        </section>

        <section className="mt-8 flex justify-center">
          <Link
            href="/areas-to-stay/tokyo-stay-area-index"
            className="inline-flex items-center gap-2 rounded-2xl border border-[#2E7D5B] bg-[#2E7D5B] px-5 py-3 text-sm font-extrabold text-white shadow-sm transition-colors hover:bg-[#246449]"
          >
            {t("back")}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </section>

        <SiteLegalLinks className="mt-10 text-slate-500" />
      </Container>
    </main>
  );
}
