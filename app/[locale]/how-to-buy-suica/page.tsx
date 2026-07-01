import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ArrowRight, ArrowDown } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { SiteHeader } from "../components/SiteHeader";
import { SiteLegalLinks } from "@/components/content/SiteLegalLinks";
import { getAlternates } from "@/i18n/hreflang";
import { ShareThisPage } from "@/components/share/ShareThisPage";
import { buttonClassName } from "@/components/ui/Button";

type Props = { params: Promise<{ locale: string }> };

const PAGE_PATH = "/how-to-buy-suica";
const OFFICIAL_SUICA_URL = "https://www.jreast.co.jp/multi/en/pass/suica.html";

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

/**
 * SEO guide copy is authored in English. Only the `en` route is indexed
 * (see robots in generateMetadata), so this guide targets English search
 * intent; the simulator itself stays localized in ten languages.
 */
const SUICA_FAQ: Array<{ q: string; a: string }> = [
  {
    q: "Can tourists buy a Suica card in Japan?",
    a: "Yes. Foreign visitors can buy a Suica at ticket machines and staffed windows in major train stations and at the airport train stations. Availability of physical cards can vary by station and date, so if one station is out, try a nearby major station or ask staff. On supported phones you can also add a Suica in Apple Wallet instead of a physical card.",
  },
  {
    q: "Where can I buy a Suica at the airport?",
    a: "At the train-station area inside Narita and Haneda airports — look for the JR or Keisei ticket machines and staffed windows near the station gates after you clear arrivals. Buying before your first ride means you can tap straight through the gates.",
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
    a: "Choose the Welcome Suica for a short trip: it has no deposit and a red design, but it expires 28 days after purchase and is non-refundable. Choose a regular Suica if you visit Japan often or want the deposit back — it carries a 500 yen refundable deposit and does not expire. Where both are offered, pick by how long and how often you travel.",
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
    openGraph: { title, description, siteName: "fujiseat" },
    alternates: getAlternates(PAGE_PATH, locale),
  };
}

export default async function HowToBuySuicaPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "suicaGuide" });
  const gameLang = resolveGameLang(locale);
  const iframeSrc = `/games/suica-simulator.html?lang=${encodeURIComponent(gameLang)}`;

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

      <Container className="py-8 md:py-12">
        <section className="overflow-hidden rounded-[28px] border border-[#d9e5f2] bg-[linear-gradient(135deg,#f8fcff,#fff_48%,#edf7ff)] p-6 shadow-[0_18px_45px_rgba(9,35,70,0.08)] md:p-9">
          <p className="inline-flex rounded-full border border-sky-100 bg-white px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.1em] text-[#145aa0]">
            Suica
          </p>
          <h1 className="mt-4 max-w-3xl font-serif text-3xl font-bold leading-tight text-[#082653] md:text-4xl">
            {t("title")}
          </h1>
          <div className="mt-5">
            <a
              href="#simulator"
              className="inline-flex items-center gap-2 rounded-2xl border border-[#145aa0] bg-[#145aa0] px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#0f4a86]"
            >
              {t("startSimulator")}
              <ArrowDown className="h-4 w-4" />
            </a>
          </div>
          <p className="mt-6 max-w-3xl text-base leading-7 text-slate-600">
            {t("intro")}
          </p>
        </section>

        <section id="simulator" className="mt-8 scroll-mt-24 flex justify-center">
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
          {/*
            The simulator IS the primary tool on this page (the iframe
            above), so the only secondary CTA here is the Hotel Action
            link forward to the Tokyo Hotel Area Finder — sage filled,
            matching the rest of the site's "Compare hotels in X" /
            "Choose Tokyo hotel base" hierarchy.
          */}
          <Link
            href="/areas-to-stay/tokyo-stay-area-index"
            className={buttonClassName({ variant: "hotel", size: "lg" })}
          >
            {t("back")}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </section>

        <SuicaGuideBody />

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

/** English SEO body: buying guide, tips, and FAQ rendered as real HTML. */
function SuicaGuideBody() {
  return (
    <div className="mx-auto mt-12 max-w-3xl space-y-6 text-[15px] leading-7 text-slate-700">
      <GuideSection title="Where to buy a Suica card">
        <p>
          You can buy a Suica at{" "}
          <strong>ticket machines and staffed ticket windows in major train stations</strong>{" "}
          — including the JR stations inside Narita and Haneda airports, so you can
          get one right after you land. Look for the multilingual touchscreen
          machines near the ticket gates, or a staffed window (Midori-no-madoguchi
          at JR East stations). Availability of physical cards can change, so{" "}
          <strong>availability may vary by station and date</strong>; if one machine
          is sold out, try a nearby larger station or ask staff. On a supported
          iPhone or Apple Watch you can also add a Suica in Apple Wallet instead of
          a physical card. For anything official, check the{" "}
          <a
            href={OFFICIAL_SUICA_URL}
            target="_blank"
            rel="noopener nofollow"
            className="font-semibold text-[#145aa0] underline underline-offset-2"
          >
            JR East Suica page
          </a>
          .
        </p>
      </GuideSection>

      <GuideSection title="How to buy Suica at a ticket machine">
        <ol className="list-decimal space-y-1.5 pl-5">
          <li>Tap the language button and switch the screen to English (or your language).</li>
          <li>Choose <strong>&ldquo;Purchase new Suica&rdquo;</strong> or the IC card option.</li>
          <li>Pick the card type — a regular Suica, or the tourist Welcome Suica where it is offered.</li>
          <li>Insert cash in yen. Many IC-card machines are <strong>cash-only</strong> and do not accept foreign cards.</li>
          <li>Select how much to load onto the card.</li>
          <li>Take your Suica and any change or receipt, and you are ready to tap through the gates.</li>
        </ol>
        <p className="mt-3 text-[13px] text-slate-500">
          A regular Suica usually includes a 500 yen refundable deposit; the
          Welcome Suica has no deposit but expires 28 days after purchase.
        </p>
      </GuideSection>

      <GuideSection title="What you need before using the machine">
        <ul className="list-disc space-y-1.5 pl-5">
          <li><strong>Cash in Japanese yen</strong> — 1,000 yen notes and coins are safest, since many IC machines reject foreign credit cards.</li>
          <li>A rough idea of how much to load (see below) so you are not deciding at the machine.</li>
          <li>No passport or registration is required for a normal Suica.</li>
        </ul>
        <p className="mt-3">
          It also helps to know how to read the gates and signs first — see{" "}
          <Link href="/how-to-read-japanese-train-signs" className="font-semibold text-[#145aa0] underline underline-offset-2">
            how to read Japanese train signs
          </Link>{" "}
          and{" "}
          <Link href="/station-practice" className="font-semibold text-[#145aa0] underline underline-offset-2">
            practice navigating a station
          </Link>
          .
        </p>
      </GuideSection>

      <GuideSection title="Suica vs Welcome Suica">
        <p>
          <strong>Regular Suica:</strong> 500 yen refundable deposit, no expiry,
          reloadable for years — best if you visit Japan often or want the deposit
          back when you leave.
        </p>
        <p className="mt-2">
          <strong>Welcome Suica:</strong> made for short-term visitors — no deposit,
          a distinctive red design, but it expires 28 days after purchase and cannot
          be refunded. Best for a single short trip, where it is offered.
        </p>
        <p className="mt-2 text-[13px] text-slate-500">
          Physical-card availability has fluctuated in recent years, so a mobile
          Suica in Apple Wallet is a reliable alternative on supported phones.
        </p>
      </GuideSection>

      <GuideSection title="How much money to add first">
        <p>
          A common first charge is <strong>2,000–3,000 yen</strong>. That covers
          several train, subway, and bus rides plus convenience-store purchases, and
          you can top up anytime. If you are leaving Japan within a day or two, load
          less — a regular Suica refund has a small handling fee, and a Welcome Suica
          cannot be refunded at all.
        </p>
      </GuideSection>

      <GuideSection title="How to charge (top up) Suica later">
        <p>
          Recharge at any ticket machine, fare-adjustment machine, or convenience-store
          register. Tap <strong>&ldquo;Charge&rdquo; (chāji)</strong>, place the card
          on the tray or reader, and add 1,000 yen or more in cash. Convenience stores
          can also top up the card at the counter.
        </p>
      </GuideSection>

      <GuideSection title="Common mistakes at the ticket machine">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>Trying a foreign credit card in a cash-only IC-card slot.</li>
          <li>Buying a single paper ticket instead of selecting the IC card / Suica option.</li>
          <li>Loading far too much right before leaving Japan.</li>
          <li>Tapping the wrong reader, or tapping too fast before the gate responds.</li>
          <li>Assuming every station has cards in stock — availability may vary by station and date.</li>
        </ul>
      </GuideSection>

      <GuideSection title="Practice with the interactive simulator">
        <p>
          The easiest way to feel ready is to run through the flow a couple of times
          on the{" "}
          <a href="#simulator" className="font-semibold text-[#145aa0] underline underline-offset-2">
            free Suica simulator above
          </a>
          . It mirrors a real ticket-machine screen — choosing the card, inserting
          cash, and selecting a charge amount — so the real machine at the airport
          feels familiar.
        </p>
      </GuideSection>

      <GuideSection title="Frequently asked questions">
        <dl className="space-y-4">
          {SUICA_FAQ.map((item) => (
            <div key={item.q} className="border-b border-slate-100 pb-4 last:border-0 last:pb-0">
              <dt className="font-semibold text-slate-900">{item.q}</dt>
              <dd className="mt-1 text-slate-600">{item.a}</dd>
            </div>
          ))}
        </dl>
      </GuideSection>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
          Plan the rest of your trip
        </p>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          <li>
            <Link href="/areas-to-stay/tokyo-first-time" className="font-semibold text-[#145aa0] underline underline-offset-2">
              Where to stay in Tokyo →
            </Link>
          </li>
          <li>
            <Link href="/areas-to-stay/tokyo-hotels" className="font-semibold text-[#145aa0] underline underline-offset-2">
              Compare Tokyo hotel areas →
            </Link>
          </li>
          <li>
            <Link href="/how-to-read-japanese-train-signs" className="font-semibold text-[#145aa0] underline underline-offset-2">
              Read Japanese train signs →
            </Link>
          </li>
          <li>
            <Link href="/station-practice" className="font-semibold text-[#145aa0] underline underline-offset-2">
              Practice station navigation →
            </Link>
          </li>
        </ul>
      </div>

      <p className="text-[12px] leading-5 text-slate-400">
        This is general travel information, not an official source and not a purchase
        or booking service. Suica card availability, deposits, and conditions can
        change and may vary by station and date — always confirm current details on
        the{" "}
        <a href={OFFICIAL_SUICA_URL} target="_blank" rel="noopener nofollow" className="underline underline-offset-2">
          official JR East Suica page
        </a>{" "}
        and at the station.
      </p>
    </div>
  );
}

function GuideSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/60">
      <h2 className="text-lg font-bold text-[#082653]">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}
