import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ArrowRight, Mountain, Info } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { SiteHeader } from "../components/SiteHeader";
import { SuggestedNextSteps } from "@/components/content/SuggestedNextSteps";
import { SiteFooter } from "@/components/content/SiteFooter";
import { getAlternates } from "@/i18n/hreflang";
import { GuideKlookCta } from "@/components/affiliate/GuideKlookCta";
import { KLOOK_URL } from "@/src/affiliateLinks";
import { SeatLayoutDiagram } from "@/components/content/SeatLayoutDiagram";
import { KlookProductRow } from "@/components/affiliate/KlookProductRow";
import { SeatMapTool } from "@/components/travel/SeatMapTool";

type Props = { params: Promise<{ locale: string }> };

const SEAT_LETTERS = ["A", "B", "C", "D", "E"] as const;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seatLetters" });
  const title = t("meta.title");
  const description = t("meta.description");
  return {
    title: `${title} | fujiseat`,
    description,
    // No locale gate: every language carries its own translated copy, so each
    // one is indexable on its own terms rather than duplicating the English.
    openGraph: { title, description, siteName: "fujiseat — Japan Rail Seats, Stays & Routes" },
    alternates: getAlternates("/shinkansen-seat-letters", locale),
  };
}

export default async function SeatLettersPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seatLetters" });
  const pagePath = locale === "en" ? "/shinkansen-seat-letters" : `/${locale}/shinkansen-seat-letters`;

  const faqItems = t.raw("faq.items") as Array<{ q: string; a: string }>;
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  const diagramLabels = {
    seaSide: t("diagram.seaSide"),
    fujiSide: t("diagram.fujiSide"),
    aisle: t("diagram.aisle"),
    legendFuji: t("diagram.legendFuji"),
    legendWindow: t("diagram.legendWindow"),
    legendOther: t("diagram.legendOther"),
  };

  const bold = { b: (chunks: React.ReactNode) => <strong>{chunks}</strong> };

  return (
    <main className="page-shell min-h-screen text-slate-950">
      {/* Plain script tag: next/script only reaches the RSC payload, so the
          crawler would never see this block. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <SiteHeader />

      <Container className="py-8 md:py-12">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-sky-700">
          {t("eyebrow")}
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 md:text-4xl">
          {t("h1")}
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 md:text-base">
          {t("meta.description")}
        </p>

        <section className="mt-8 rounded-[22px] border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-emerald-700">
            {t("quick.label")}
          </p>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-700">
            {(["a1", "a2", "a3", "a4", "a5"] as const).map((key) => (
              <li key={key} className="flex gap-2">
                {key === "a3" ? (
                  <Mountain className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                ) : (
                  <Info className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                )}
                <span>{t.rich(`quick.${key}`, bold)}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-6 rounded-[22px] border border-sky-100 bg-sky-50/70 p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-950">{t("checker.title")}</p>
          <p className="mt-1 text-xs leading-5 text-slate-600">{t("checker.note")}</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/#seat-checker"
              className="inline-flex items-center gap-2 rounded-lg border border-[#2E7D5B] bg-[#2E7D5B] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#246449]"
            >
              {t("checker.open")}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/guide"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50"
            >
              {t("checker.guide")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        {/* The page's top query is "shinkansen seat map" by a wide margin, so
            the map comes before the prose. Pick a car, see that car's rows. */}
        <SeatMapTool
          href={KLOOK_URL}
          locale={locale}
          pagePath={pagePath}
          copy={{
            eyebrow: t("map.eyebrow"),
            question: t("map.question"),
            carLabels: {
              "ordinary-nonreserved": t("map.carOrdinaryNonReserved"),
              "ordinary-reserved": t("map.carOrdinaryReserved"),
              green: t("map.carGreen"),
            },
            result: t("map.result"),
            seaNote: t("map.seaNote"),
            rowsNote: t("map.rowsNote"),
            directionNote: t("map.directionNote"),
            book: t("map.book"),
            legendFuji: t("map.legendFuji"),
            legendWindow: t("map.legendWindow"),
            legendOther: t("map.legendOther"),
            aisle: t("map.aisle"),
            seaSide: t("map.seaSide"),
            fujiSide: t("map.fujiSide"),
          }}
        />

        {/* Booking-intent slot: readers checking seat letters are usually about
            to book. Same direction-aware Klook CTA as the guide. */}
        <div className="mt-6">
          <GuideKlookCta
            href={KLOOK_URL}
            locale={locale}
            placement="seat_letters_booking"
            linkId="seat_letters_klook_booking"
            pagePath={pagePath}
            pageType="shinkansen_tool"
            copy={{
              title: t("cta.title"),
              note: t("cta.note"),
              button: t("cta.button"),
              dirToKyoto: t("cta.dirToKyoto"),
              dirToTokyo: t("cta.dirToTokyo"),
              dirSeatNote: t("cta.dirSeatNote"),
            }}
          />
        </div>

        <div className="mt-10 space-y-8">
          <section>
            <h2 className="text-xl font-bold text-slate-950">{t("ordinary.title")}</h2>
            <p className="mt-2 text-sm leading-7 text-slate-600">{t("ordinary.body")}</p>
            <SeatLayoutDiagram
              variant="ordinary"
              directionNote={t("ordinary.directionNote")}
              labels={{ ...diagramLabels, caption: t("diagram.ordinaryCaption") }}
            />
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left">
                    <th className="py-2 pr-4 font-semibold text-slate-900">{t("table.seat")}</th>
                    <th className="py-2 pr-4 font-semibold text-slate-900">{t("table.type")}</th>
                    <th className="py-2 pr-4 font-semibold text-slate-900">{t("table.side")}</th>
                    <th className="py-2 font-semibold text-slate-900">{t("table.note")}</th>
                  </tr>
                </thead>
                <tbody>
                  {SEAT_LETTERS.map((letter) => (
                    <tr
                      key={letter}
                      className={["border-b border-slate-100", letter === "E" ? "bg-emerald-50" : ""].join(" ")}
                    >
                      <td className="py-2.5 pr-4 font-bold text-slate-900">{letter}</td>
                      <td className="py-2.5 pr-4 text-slate-600">{t(`seats.${letter}.type`)}</td>
                      <td className="py-2.5 pr-4 text-slate-600">{t(`seats.${letter}.side`)}</td>
                      <td className="py-2.5 text-slate-600">{t(`seats.${letter}.note`)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-950">{t("green.title")}</h2>
            <div className="mt-3 space-y-3 text-sm leading-7 text-slate-600">
              <p>{t("green.body1")}</p>
              <p>{t.rich("green.body2", bold)}</p>
            </div>
            <SeatLayoutDiagram
              variant="green"
              directionNote={t("green.directionNote")}
              labels={{ ...diagramLabels, caption: t("diagram.greenCaption") }}
            />
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-950">{t("otherLines.title")}</h2>
            <div className="mt-3 text-sm leading-7 text-slate-600">
              <p>{t("otherLines.body")}</p>
            </div>
          </section>

          <section className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-slate-950">{t("faq.title")}</h2>
            <dl className="mt-4 space-y-4 text-sm">
              {faqItems.map((item) => (
                <div key={item.q}>
                  <dt className="font-semibold text-slate-900">{item.q}</dt>
                  <dd className="mt-1 leading-6 text-slate-600">{item.a}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-950">{t("related.title")}</h2>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              {(
                [
                  ["/guide#seat-e", "seatE"],
                  ["/tokyo-to-kyoto-mt-fuji-seat", "tokyoKyoto"],
                  ["/kyoto-to-tokyo-mt-fuji-seat", "kyotoTokyo"],
                  ["/areas-to-stay/asakusa-vs-ueno", "stay"],
                  ["/plan-your-trip", "planTrip"],
                ] as const
              ).map(([href, key]) => (
                <Link
                  key={key}
                  href={href}
                  className="rounded-[18px] border border-[#d9e5f2] bg-white p-4 text-sm shadow-sm transition-colors hover:bg-[#f8fbff]"
                >
                  <span className="font-bold text-[#082653]">{t(`related.${key}.title`)}</span>
                  <span className="mt-1 block text-xs text-[#5f7190]">{t(`related.${key}.desc`)}</span>
                </Link>
              ))}
            </div>
          </section>

          <KlookProductRow
            heading={t("products.heading")}
            intro={t("products.intro")}
            placement="shinkansen_route_row"
            pagePath={pagePath}
            locale={locale}
            className="mb-8"
            items={[
              { linkId: "shinkansenTokyoHiroshima", note: t("products.tokyoHiroshima"), product: "shinkansen_ticket" },
              { linkId: "shinkansenOsakaHiroshima", note: t("products.osakaHiroshima"), product: "shinkansen_ticket" },
              { linkId: "shinkansenTokyoKanazawa", note: t("products.tokyoKanazawa"), product: "shinkansen_ticket" },
              { linkId: "shinkansenTokyoSendai", note: t("products.tokyoSendai"), product: "shinkansen_ticket" },
            ]}
          />

          <SuggestedNextSteps currentPageType="seat" locale={locale} />
        </div>
      </Container>
      <SiteFooter />
    </main>
  );
}
