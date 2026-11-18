import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ArrowRight, Rabbit } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { SiteHeader } from "../components/SiteHeader";
import { SiteLegalLinks } from "@/components/content/SiteLegalLinks";
import { getAlternates } from "@/i18n/hreflang";
import { ShareThisPage } from "@/components/share/ShareThisPage";
import { buttonClassName } from "@/components/ui/Button";
import { TicketMachineSim } from "@/components/ticket-machine/TicketMachineSim";
import { SuicaGuideGrid } from "@/components/suica/SuicaGuideGrid";

type Props = { params: Promise<{ locale: string }> };

const PAGE_PATH = "/how-to-buy-suica";
const OFFICIAL_SUICA_URL = "https://www.jreast.co.jp/multi/en/pass/suica.html";

/**
 * SEO guide copy is authored in English. Only the `en` route is indexed
 * (see robots in generateMetadata), so this guide targets English search
 * intent; the practice machine offers the five languages of the real screen.
 */
const SUICA_FAQ: Array<{ q: string; a: string }> = [
  {
    q: "Can tourists buy a Suica card in Japan?",
    a: "Yes. Foreign visitors can buy a regular Suica at designated JR East ticket machines and staffed counters in the Suica area. At Narita, use the JR East station facilities. Haneda has no JR railway station; Welcome Suica is sold at designated facilities at Haneda Airport Terminal 3 Station on the Tokyo Monorail. Availability can change, so check JR East before travel. On supported phones you can also add Suica in Apple Wallet.",
  },
  {
    q: "Where can I buy a Suica at the airport?",
    a: "At Narita Airport, use the JR East Travel Service Center or designated JR ticket machines by the JR station. Haneda Airport has no JR station: JR East currently sells Welcome Suica at the Welcome Suica machine and JR East Travel Service Center at Haneda Airport Terminal 3 Station on the Tokyo Monorail. Terminals 1 and 2 are not listed as Welcome Suica sales locations.",
  },
  {
    q: "Do I need a passport to buy a Suica?",
    a: "No. A normal Suica does not require a passport or any registration. Some staffed windows may ask to see a passport for the tourist Welcome Suica, but the standard machine purchase does not.",
  },
  {
    q: "How much money should I put on my Suica first?",
    a: "A common first charge is 2,000–3,000 yen. That covers several train, subway, and bus rides plus convenience-store stops, and you can top up at any machine anytime. If you are leaving Japan soon, avoid overloading — a regular Suica refund has a small fee, and a Welcome Suica cannot be refunded.",
  },
  {
    q: "Welcome Suica vs Suica — which should a tourist get?",
    a: "Choose Welcome Suica for a short trip: it has no deposit and a red design, but it is valid for 28 days from purchase and the remaining balance is not refunded. A regular Suica has a 500 yen refundable deposit and no short tourist validity period, but JR East says a card becomes unusable after 10 years with no qualifying use. Where both are offered, choose based on your trip length and likely return visits.",
  },
  {
    q: "Can I use one Suica for trains and buses?",
    a: "Yes. A Suica works on most trains, subways, and buses across Japan, and pays at many convenience stores, vending machines, and shops. You tap the same card at the gate reader or the bus reader — no need to know the exact fare in advance.",
  },
];

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "suicaGuide" });
  const title = t("title");
  const description = t("metaDescription");
  return {
    title: `${title} | fujiseat`,
    description,
    robots: locale === "en" ? undefined : { index: false, follow: true },
    openGraph: { title, description, siteName: "fujiseat — Japan Rail Seats, Stays & Routes" },
    alternates: getAlternates(PAGE_PATH, locale),
  };
}

export default async function HowToBuySuicaPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "suicaGuide" });
  // The real screen offers these five; every other locale starts in English.
  const simLang = locale === "ko" || locale === "zh-CN" || locale === "zh-TW" ? locale : "en";

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    inLanguage: "en",
    mainEntity: SUICA_FAQ.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  return (
    <main className="page-shell min-h-screen text-slate-950">
      {locale === "en" && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}

      <SiteHeader />

      <Container className="py-6 md:py-10">
        {/* Tool first (2026-11-15): one line of title, then the practice
            machine; the long guide is now short picture guides below, each
            with its own page under /how-to-buy-suica/<slug>. */}
        <header className="max-w-3xl">
          <h1 className="font-serif text-[26px] font-bold leading-tight text-[#082653] md:text-[34px]">{t("title")}</h1>
          <p className="mt-2 text-[15px] leading-6 text-slate-600">{t("lead")}</p>
        </header>

        {/* The practice machine is a photograph of a real-style JR machine with
            a live screen laid over its own (the illustrated kiosk in
            /games/suica-simulator.html is kept, unlinked). */}
        <section id="simulator" className="mt-5 scroll-mt-24">
          <TicketMachineSim initialLang={simLang} />
        </section>

        {locale === "en" ? (
          <section className="mx-auto mt-8 max-w-3xl rounded-[22px] border border-[#cfe0f3] bg-[#eef6ff] p-5" aria-labelledby="suica-character-news">
            <div className="flex gap-4">
              <Rabbit className="mt-0.5 h-6 w-6 shrink-0 text-[#145aa0]" aria-hidden="true" />
              <div>
                <p className="text-xs font-black uppercase tracking-[0.08em] text-[#2E7D5B]">Suica news · November 2026</p>
                <h2 id="suica-character-news" className="mt-1 text-lg font-extrabold text-[#082653]">Suica’s next mascot has been chosen</h2>
                <p className="mt-1 text-[14px] leading-6 text-slate-600">The purple rabbit candidate won the public vote. Its name is still open for suggestions, and the handover is planned for April 2027.</p>
                <Link href="/how-to-buy-suica/suica-new-character-2027" className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-[#145aa0] underline underline-offset-2">
                  Read the verified announcement
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </section>
        ) : null}

        <section className="mt-12" aria-labelledby="suica-guides">
          <h2 id="suica-guides" className="text-2xl font-extrabold tracking-[-0.02em] text-[#082653]">
            {t("guidesTitle")}
          </h2>
          <div className="mt-4">
            <SuicaGuideGrid />
          </div>
        </section>

        <section className="mx-auto mt-12 max-w-3xl" aria-labelledby="suica-faq">
          <h2 id="suica-faq" className="text-2xl font-extrabold tracking-[-0.02em] text-[#082653]">
            {t("faqTitle")}
          </h2>
          <div className="mt-4 grid gap-2.5">
            {SUICA_FAQ.map((item) => (
              <details key={item.q} className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                <summary className="cursor-pointer text-[15.5px] font-bold text-slate-900">{item.q}</summary>
                <p className="mt-2 text-[15px] leading-7 text-slate-600">{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="mt-10 flex justify-center">
          <Link href="/areas-to-stay" className={buttonClassName({ variant: "hotel", size: "lg" })}>
            {t("back")}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </section>

        <p className="mx-auto mt-8 max-w-3xl text-center text-[12px] leading-5 text-slate-400">
          General travel information, not an official source. Suica availability, deposits and conditions can change and may vary by station and date — check the{" "}
          <a href={OFFICIAL_SUICA_URL} target="_blank" rel="noopener nofollow" className="underline underline-offset-2">
            official JR East Suica page
          </a>{" "}
          and ask at the station.
        </p>

        <ShareThisPage
          title={t("share.title")}
          placement="suica_guide_footer"
          description={t("share.description")}
          locale={locale}
          className="mt-10"
        />

        <SiteLegalLinks className="mt-10 text-slate-500" />
      </Container>
    </main>
  );
}
