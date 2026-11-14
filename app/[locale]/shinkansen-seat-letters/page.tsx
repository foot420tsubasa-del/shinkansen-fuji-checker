import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Mountain, Info } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { SiteHeader } from "../components/SiteHeader";
import { SuggestedNextSteps } from "@/components/content/SuggestedNextSteps";
import { SiteFooter } from "@/components/content/SiteFooter";
import { getAlternates } from "@/i18n/hreflang";
import { JR_PASS_URL, KLOOK_URL } from "@/src/affiliateLinks";
import { GuideSeatCheck } from "@/components/travel/GuideSeatCheck";
import { seatCheckCopy } from "@/lib/copy/seat-check";
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

        {/* Was a button to the homepage's checker: 94 readers in thirty days —
            about one in five here — left this page to use it. The checker now
            sits where they were looking, and an outbound answer books the
            Tokyo–Kyoto route link directly. */}
        <div className="mt-6">
          <GuideSeatCheck
            href={KLOOK_URL}
            jrPassHref={JR_PASS_URL}
            locale={locale}
            pagePath={pagePath}
            copy={seatCheckCopy(locale)}
          />
          <p className="-mt-2 text-xs">
            <Link href="/guide" className="font-semibold text-sky-700 underline underline-offset-2">
              {t("checker.guide")}
            </Link>
          </p>
        </div>

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

        {/* A booking CTA sat here until 2026-11-06, on the assumption that a
            reader checking seat letters is about to book. The numbers over
            10/01–11/05 say otherwise: 420 impressions, 2 clicks, 0.48%, against
            3.85% for the map's own result CTA directly above it. More readers
            scrolled past it (420) than finished the map (130), so it was
            collecting the attention of people leaving, not of people deciding.
            The map already carries the booking link at the moment it is worth
            something, which is why nothing replaces this. */}

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
