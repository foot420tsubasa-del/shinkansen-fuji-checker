import type { Metadata } from "next";
import { notFound } from "next/navigation";
import fs from "node:fs";
import path from "node:path";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { SiteHeader } from "../../components/SiteHeader";
import { Breadcrumb } from "@/components/content/Breadcrumb";
import { QuickRec } from "@/components/content/QuickRec";
import { AreaCard } from "@/components/content/AreaCard";
import { ComparisonTable } from "@/components/content/ComparisonTable";
import { ProTip } from "@/components/content/ProTip";
import { StayAreaMap } from "@/components/content/StayAreaMap";
import { HotelPicks } from "@/components/content/HotelPicks";
import { NextActions } from "@/components/content/NextActions";
import { SuggestedNextSteps } from "@/components/content/SuggestedNextSteps";
import { SiteFooter } from "@/components/content/SiteFooter";
import { AgodaHotelMap } from "@/components/affiliate/AgodaHotelMap";
import { ProviderChoiceCTA, type ProviderChoiceButton } from "@/components/affiliate/ProviderChoiceCTA";
import { StayBaseCard } from "@/components/affiliate/StayBaseCard";
import { TrackedCtaLink } from "@/components/analytics/TrackedCtaLink";
import { TrackedAffiliateLink } from "@/components/analytics/TrackedAffiliateLink";
import { getAllStaySlugs, getStayBySlug } from "@/lib/content/stay";
import { getAlternates } from "@/i18n/hreflang";
import { getAffUrl } from "@/src/affiliateLinks";
import { AFFILIATE_REL } from "@/lib/link-rel";
import { getAgodaHotelAreaUrl, getHotelLink, getTripHotelConfig, type HotelAreaKey } from "@/lib/hotel-links";

type Props = {
  params: Promise<{ slug: string; locale: string }>;
};

const agodaMapIdsByStaySlug: Record<string, string[]> = {
  "where-to-stay-before-shinkansen": ["tokyoStation"],
  "kyoto-station-vs-gion": ["kyotoStation"],
  "namba-vs-umeda": ["namba"],
  "shin-osaka-vs-namba": ["shinOsaka", "namba"],
};

const filledNextStepClass =
  "rounded-2xl border border-[#168a56] bg-[#168a56] p-4 text-sm font-semibold text-white transition-colors hover:bg-[#0f6f45]";

const tokyoStayImages = {
  hero: "/images/stay/tokyo/tokyo-stay-hero.png",
  shinjuku: "/images/stay/tokyo/stay-shinjuku.png",
  ueno: "/images/stay/tokyo/stay-ueno.png",
  asakusa: "/images/stay/tokyo/stay-asakusa.png",
  tokyoStation: "/images/stay/tokyo/stay-tokyo-station.png",
  eastTokyo: "/images/stay/tokyo/stay-east-tokyo.png",
};

function publicImageIfExists(src: string) {
  const filePath = path.join(process.cwd(), "public", src.replace(/^\//, ""));
  return fs.existsSync(filePath) ? src : undefined;
}

function providerChoices(...providers: Array<ProviderChoiceButton | null | undefined>) {
  return providers.filter((provider): provider is ProviderChoiceButton => Boolean(provider));
}

function hotelProviderChoices(areaKey: HotelAreaKey, placement: ProviderChoiceButton["placement"]) {
  const hotel = getHotelLink(areaKey);
  const config = getTripHotelConfig(areaKey);
  const tripHref = hotel.provider === "trip" ? hotel.href : config.tripUrl;
  const tripTrackingHref = hotel.provider === "trip" ? hotel.trackingHref : config.tripUrl;
  const agodaLink = getAgodaHotelAreaUrl(areaKey);

  return providerChoices(
    tripHref
      ? {
          label: "Trip.com",
          href: tripHref,
          trackingHref: tripTrackingHref,
          provider: "trip",
          product: "hotel",
          linkId: `hotelArea.${areaKey}.trip`,
          placement,
          variant: "primary",
          category: "hotel",
        }
      : null,
    agodaLink
      ? {
          label: "Agoda",
          href: agodaLink.href,
          trackingHref: agodaLink.trackingHref,
          provider: "agoda",
          product: "hotel",
          linkId: agodaLink.linkId,
          placement,
          variant: "secondary",
          category: "hotel",
        }
      : null,
  );
}

function TokyoFirstTimeHub({ locale }: { locale: string }) {
  const pagePath = "/areas-to-stay/tokyo-first-time";
  const esimHref = getAffUrl("esim");
  const heroImage = publicImageIfExists(tokyoStayImages.hero);
  const cards = [
    {
      title: "Shinjuku",
      subtitle: "Best for first-time energy, food, nightlife, and flexible trains.",
      bestFor: "First-time convenience, food, nightlife, and train options.",
      weakness: "Can feel intense around Kabukicho.",
      area: "Tokyo: Shinjuku",
      image: publicImageIfExists(tokyoStayImages.shinjuku),
      primaryAction: "Compare Shinjuku hotels",
      providerChoices: hotelProviderChoices("shinjuku", "stay_area_glance_card"),
      detailHref: "/areas-to-stay/tokyo/shinjuku",
    },
    {
      title: "Ueno",
      subtitle: "Best for Narita access, museums, and better-value hotels.",
      bestFor: "Narita access, museums, and better-value hotels.",
      weakness: "Quieter nightlife than Shinjuku.",
      area: "Tokyo: Ueno",
      image: publicImageIfExists(tokyoStayImages.ueno),
      primaryAction: "Compare Ueno hotels",
      providerChoices: hotelProviderChoices("ueno", "stay_area_glance_card"),
      detailHref: "/areas-to-stay/tokyo/ueno",
    },
    {
      title: "Asakusa",
      subtitle: "Best for old-town Tokyo, Senso-ji, and riverside walks.",
      bestFor: "Old-town Tokyo, Senso-ji, and riverside walks.",
      weakness: "Not on the JR Yamanote Line.",
      area: "Tokyo: Asakusa",
      image: publicImageIfExists(tokyoStayImages.asakusa),
      primaryAction: "Compare Asakusa hotels",
      providerChoices: hotelProviderChoices("asakusa", "stay_area_glance_card"),
      detailHref: "/areas-to-stay/tokyo/asakusa",
    },
    {
      title: "Tokyo Station",
      subtitle: "Best for early Shinkansen, luggage, and clean logistics.",
      bestFor: "Early Shinkansen, luggage, and smooth transfer to Kyoto / Osaka.",
      weakness: "Usually more business-like and less local at night.",
      area: "Tokyo: Tokyo Station",
      image: publicImageIfExists(tokyoStayImages.tokyoStation),
      primaryAction: "Compare hotels near Tokyo Station",
      providerChoices: hotelProviderChoices("tokyoStation", "stay_area_glance_card"),
      detailHref: "/areas-to-stay/tokyo/tokyo-station",
    },
    {
      title: "East Tokyo",
      subtitle: "Best for calmer walks, coffee, riverside neighborhoods, and second-time Tokyo.",
      bestFor: "Quiet local walks, coffee, and riverside neighborhoods.",
      weakness: "Better as a second base than the default first-night stay.",
      area: "Tokyo: East Tokyo",
      image: publicImageIfExists(tokyoStayImages.eastTokyo),
      primaryAction: "Explore Local Tokyo",
      providerChoices: providerChoices({
        label: "Explore Local Tokyo",
        internalLink: "/local-tokyo",
        provider: "other",
        product: "hotel",
        placement: "stay_area_glance_card",
        variant: "primary",
        category: "hotel",
      }),
      detailHref: "/areas-to-stay/tokyo/east-tokyo",
    },
  ];

  const comparisonRows = [
    ["Shinjuku", "N'EX direct, slower from Narita", "10-15 min to Tokyo Station", "Strongest", "Wide range, weekend spikes", "Energetic"],
    ["Ueno", "Best Narita access", "7 min to Tokyo Station", "Moderate", "Often better value", "Practical, cultural"],
    ["Asakusa", "Good via Access Express", "Transfer needed", "Quiet evenings", "Good value", "Old-town"],
    ["Tokyo Station", "N'EX direct", "Best", "Business dining", "Usually higher", "Clean logistics"],
    ["East Tokyo", "Varies by neighborhood", "Usually transfer needed", "Local and calm", "Mixed", "Quiet, slower"],
  ];

  const faqs = [
    ["Is Shinjuku too noisy for families?", "It can be around Kabukicho. Families usually do better around Nishi-Shinjuku, Yoyogi, or Shinjuku-Gyoenmae."],
    ["Is Ueno good for first-time visitors?", "Yes, especially if you arrive at Narita or want better-value hotels with museums and markets nearby."],
    ["Should I stay near Tokyo Station before Kyoto or Osaka?", "Yes if your Shinkansen is early or you have heavy luggage. Otherwise Shinjuku or Ueno can still work well."],
    ["Is Asakusa convenient without the JR Yamanote Line?", "It is convenient for old-town sightseeing, but you will use subway transfers more often than in Ueno or Shinjuku."],
    ["Where should I stay if I arrive late at Narita?", "Ueno is usually the simplest because the Skyliner is fast and the area is calmer on arrival night."],
    ["Is East Tokyo good for a first Tokyo hotel?", "It can be, but it is better for travelers who already know they want a quieter local base."],
  ];

  return (
    <main className="page-shell min-h-screen text-slate-950">
      <SiteHeader />
      <Container className="py-8 md:py-12">
        <Breadcrumb items={[
          { label: "Areas to stay", href: "/" },
          { label: "Tokyo first-time hotel areas" },
        ]} />

        <section className="mt-5 overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
          {heroImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={heroImage} alt="Tokyo hotel area skyline and neighborhood view" className="aspect-[16/9] max-h-[420px] w-full object-cover" />
          ) : (
            <div className="h-64 bg-[linear-gradient(135deg,#eef6fb,#fff_50%,#f0fbf6)]" aria-hidden="true" />
          )}
          <div className="p-6 md:p-9">
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#106b43]">Tokyo hotel area guide</p>
            <h1 className="mt-3 max-w-4xl text-3xl font-semibold leading-tight text-slate-950 md:text-5xl">
              Where to Stay in Tokyo for First-Time Visitors
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-600 md:text-base">
              Pick the right hotel area before you book. Compare Shinjuku, Ueno, Asakusa, Tokyo Station, and quieter East Tokyo based on airport access, Shinkansen plans, nightlife, and luggage.
            </p>
          </div>
        </section>

        <section className="mt-8 grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="rounded-[22px] border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-950">Quick Answer</h2>
            <div className="mt-4 space-y-2 text-sm leading-6 text-slate-700">
              <p>Most first-time visitors should start with Shinjuku.</p>
              <p>Choose Ueno if you want Narita access and better-value hotels.</p>
              <p>Choose Asakusa if you want old-town Tokyo and temples.</p>
              <p>Choose Tokyo Station if you have an early Shinkansen.</p>
              <p>Choose East Tokyo if you want a calmer local base.</p>
            </div>
          </div>
          <div className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
            <ProviderChoiceCTA
              actionLabel="Compare hotels in Shinjuku"
              providers={hotelProviderChoices("shinjuku", "stay_quick_answer")}
              pagePath={pagePath}
              locale={locale}
              area="Tokyo: Shinjuku"
            />
            <TrackedCtaLink
              href="/local-hotel-picks"
              placement="stay_quick_answer"
              label="See local hotel examples"
              pagePath={pagePath}
              locale={locale}
              category="hotel"
              className="mt-3 inline-flex min-h-10 items-center justify-center rounded-xl border border-[#168a56] bg-[#168a56] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#0f6f45]"
            >
              See local hotel examples
            </TrackedCtaLink>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-semibold text-slate-950">Choose by Your Travel Plan</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-5">
            {[
              ["I want the easiest first Tokyo base", "Shinjuku", "#shinjuku"],
              ["I arrive at Narita Airport", "Ueno / Asakusa", "#ueno"],
              ["I take an early Shinkansen", "Tokyo Station", "#tokyo-station"],
              ["I want temples and old-town vibe", "Asakusa", "#asakusa"],
              ["I want a quiet, local neighborhood", "East Tokyo", "#east-tokyo"],
            ].map(([label, area, href]) => (
              <a key={label} href={href} className="rounded-2xl border border-slate-200 bg-white p-4 text-sm shadow-sm transition-colors hover:bg-slate-50">
                <span className="block text-slate-600">{label}</span>
                <span className="mt-2 block font-semibold text-slate-950">→ {area}</span>
              </a>
            ))}
          </div>
        </section>

        <section className="mt-12">
          <div className="max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#106b43]">Tokyo Stay Areas at a Glance</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">Compare the hotel base before the hotel</h2>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            {cards.map((card) => (
              <StayBaseCard
                key={card.title}
                title={card.title}
                subtitle={card.subtitle}
                bestFor={card.bestFor}
                weakness={card.weakness}
                image={card.image ? { src: card.image, alt: `${card.title} hotel area in Tokyo` } : undefined}
                area={card.area}
                primaryAction={card.primaryAction}
                providerChoices={card.providerChoices}
                secondaryInternalLink={{ href: card.detailHref, label: "See details" }}
                placement="stay_area_glance_card"
                pagePath={pagePath}
                locale={locale}
              />
            ))}
          </div>
        </section>

        <section className="mt-10 rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-950">Why pick your area before booking?</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-4">
            {[
              ["Time saved", "Better access to your airport and trains."],
              ["Less stress", "Shorter transfers with luggage."],
              ["Better value", "Each area has different price and vibe."],
              ["Better experience", "Your base shapes your whole Tokyo trip."],
            ].map(([title, body]) => (
              <div key={title} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <p className="font-semibold text-slate-950">{title}</p>
                <p className="mt-1 text-sm leading-5 text-slate-600">{body}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="comparison" className="mt-10 rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-950">Quick Area Comparison</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase tracking-[0.08em] text-slate-500">
                  {["Area", "Airport access", "Shinkansen access", "Nightlife / food", "Hotel cost feel", "Vibe"].map((heading) => (
                    <th key={heading} className="px-3 py-2 font-semibold">{heading}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row) => (
                  <tr key={row[0]} className="border-b border-slate-100 last:border-0">
                    {row.map((cell, index) => (
                      <td key={`${row[0]}-${index}`} className={["px-3 py-3 align-top", index === 0 ? "font-semibold text-slate-950" : "text-slate-600"].join(" ")}>
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-10 rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-950">FAQ</h2>
          <dl className="mt-4 grid gap-3 md:grid-cols-2">
            {faqs.map(([question, answer]) => (
              <div key={question} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <dt className="font-semibold text-slate-950">{question}</dt>
                <dd className="mt-1 text-sm leading-6 text-slate-600">{answer}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="mt-10">
          <h2 className="text-lg font-semibold text-slate-950">Continue Planning</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-5">
            <TrackedCtaLink href="/plan-your-trip" placement="next_steps" label="Plan Your Trip" pagePath={pagePath} locale={locale} className={filledNextStepClass}>
              Plan Your Trip
            </TrackedCtaLink>
            <TrackedCtaLink href="/jr-pass-vs-single-ticket" placement="next_steps" label="JR Pass vs Single Ticket" pagePath={pagePath} locale={locale} category="rail" className={filledNextStepClass}>
              JR Pass vs Single Ticket
            </TrackedCtaLink>
            {esimHref ? (
              <TrackedAffiliateLink href={esimHref} target="_blank" rel={AFFILIATE_REL} category="esim" provider="klook" placement="next_steps" pagePath={pagePath} locale={locale} label="Japan eSIM" linkId="esim" product="esim" adid="1166001" className={filledNextStepClass}>
                Japan eSIM
              </TrackedAffiliateLink>
            ) : (
              <TrackedCtaLink href="/plan-your-trip" placement="next_steps" label="Japan eSIM" pagePath={pagePath} locale={locale} className={filledNextStepClass}>
                Japan eSIM
              </TrackedCtaLink>
            )}
            <TrackedCtaLink href="/airport-transfers" placement="next_steps" label="Airport Transfer" pagePath={pagePath} locale={locale} category="transfer" className={filledNextStepClass}>
              Airport Transfer
            </TrackedCtaLink>
            <TrackedCtaLink href="/local-hotel-picks" placement="next_steps" label="Local Hotel Picks" pagePath={pagePath} locale={locale} category="hotel" className={filledNextStepClass}>
              Local Hotel Picks
            </TrackedCtaLink>
          </div>
        </section>
      </Container>
      <SiteFooter />
    </main>
  );
}

type FirstTimeStayArea = {
  id: string;
  name: string;
  bestFor: string;
  watchOut: string;
  transportNote: string;
  hotelKey?: HotelAreaKey;
  actionLabel?: string;
  detailHref?: string;
  detailLabel?: string;
};

type FirstTimeStayHubConfig = {
  slug: string;
  city: string;
  title: string;
  subtitle: string;
  quickAnswer: string[];
  areas: FirstTimeStayArea[];
  comparisonRows: string[][];
};

const firstTimeStayHubs: Record<string, FirstTimeStayHubConfig> = {
  "kyoto-first-time": {
    slug: "kyoto-first-time",
    city: "Kyoto",
    title: "Where to Stay in Kyoto for First-Time Visitors",
    subtitle: "Pick the right Kyoto base before you book. Kyoto Station solves luggage and day trips; Gion and Higashiyama solve atmosphere; Kawaramachi / Shijo keeps food and shopping central.",
    quickAnswer: [
      "Choose Kyoto Station if transport, luggage, and day trips matter most.",
      "Choose Kawaramachi / Shijo if you want food, shopping, and central convenience.",
      "Choose Gion / Higashiyama if temples and traditional Kyoto atmosphere matter most.",
      "Choose Arashiyama for a scenic stay, but expect a less central base.",
      "Choose Kyoto Imperial Palace / quieter north if you want calmer streets on a repeat visit.",
    ],
    areas: [
      {
        id: "kyoto-station",
        name: "Kyoto Station",
        bestFor: "Transport, luggage, day trips.",
        watchOut: "Modern and practical rather than atmospheric.",
        transportNote: "Direct Shinkansen, JR, subway, buses, and Haruka airport train.",
        hotelKey: "kyotoStation",
        actionLabel: "Compare Kyoto Station hotels",
        detailHref: "/areas-to-stay/kyoto-station-vs-gion",
        detailLabel: "See Kyoto Station vs Gion",
      },
      {
        id: "kawaramachi-shijo",
        name: "Kawaramachi / Shijo",
        bestFor: "Food, shopping, central convenience.",
        watchOut: "Less direct for Shinkansen luggage days.",
        transportNote: "Good Hankyu, subway, bus, and taxi access across central Kyoto.",
        hotelKey: "gionKawaramachi",
        actionLabel: "Compare Kawaramachi / Shijo hotels",
        detailHref: "/areas-to-stay/kyoto-station-vs-gion",
        detailLabel: "See Kyoto Station vs Gion",
      },
      {
        id: "gion-higashiyama",
        name: "Gion / Higashiyama",
        bestFor: "Temples, atmosphere, traditional Kyoto.",
        watchOut: "Narrow streets and luggage are less convenient.",
        transportNote: "Best on foot and by taxi; Kyoto Station is usually a bus or taxi ride away.",
        hotelKey: "gionKawaramachi",
        actionLabel: "Compare Gion / Higashiyama hotels",
        detailHref: "/areas-to-stay/kyoto-station-vs-gion",
        detailLabel: "See Kyoto Station vs Gion",
      },
      {
        id: "arashiyama",
        name: "Arashiyama",
        bestFor: "Scenic stays, bamboo grove, riverside walks.",
        watchOut: "Less central for first-time city sightseeing.",
        transportNote: "Useful JR and Hankyu access, but most central Kyoto plans require extra travel.",
      },
      {
        id: "imperial-palace-north",
        name: "Kyoto Imperial Palace / quieter north",
        bestFor: "Calmer repeat visitors.",
        watchOut: "Not the default first-night base for temple-heavy trips.",
        transportNote: "Subway and buses work, but taxis may be useful at night.",
      },
    ],
    comparisonRows: [
      ["Kyoto Station", "Best", "Best", "Practical", "Modern logistics"],
      ["Kawaramachi / Shijo", "Good", "Transfer needed", "Strongest", "Central city"],
      ["Gion / Higashiyama", "Atmospheric", "Taxi/bus needed", "Good but touristy", "Traditional"],
      ["Arashiyama", "Scenic", "Less central", "Limited at night", "Riverside"],
      ["Imperial Palace / north", "Calm", "Moderate", "Quiet", "Residential"],
    ],
  },
  "osaka-first-time": {
    slug: "osaka-first-time",
    city: "Osaka",
    title: "Where to Stay in Osaka for First-Time Visitors",
    subtitle: "Pick the Osaka base by how you will use the city. Namba is easiest for food and nightlife; Umeda is stronger for rail; Shin-Osaka is a logistics choice.",
    quickAnswer: [
      "Choose Namba if food, nightlife, and first-time Osaka energy matter most.",
      "Choose Umeda if rail access, Kyoto / Kobe trips, and airport connections matter most.",
      "Choose Shin-Osaka if Shinkansen logistics are the main priority.",
      "Choose Tennoji if you want value and south Osaka access.",
      "Choose Osaka Castle / quieter central if you want a calmer base.",
    ],
    areas: [
      {
        id: "namba",
        name: "Namba",
        bestFor: "Food, nightlife, first-time Osaka.",
        watchOut: "Can feel busy and loud at night.",
        transportNote: "Strong subway and Nankai access; practical for KIX and Dotonbori.",
        hotelKey: "namba",
        actionLabel: "Compare Namba hotels",
        detailHref: "/areas-to-stay/namba-vs-umeda",
        detailLabel: "See Namba vs Umeda",
      },
      {
        id: "umeda",
        name: "Umeda",
        bestFor: "Rail access, Kyoto / Kobe / airport connections.",
        watchOut: "Less classic Osaka nightlife than Namba.",
        transportNote: "Best for JR, Hankyu, Hanshin, subway, and Kansai rail day trips.",
        hotelKey: "umeda",
        actionLabel: "Compare Umeda hotels",
        detailHref: "/areas-to-stay/namba-vs-umeda",
        detailLabel: "See Namba vs Umeda",
      },
      {
        id: "shin-osaka",
        name: "Shin-Osaka",
        bestFor: "Shinkansen logistics.",
        watchOut: "Not a lively neighborhood base.",
        transportNote: "Direct Shinkansen and subway to central Osaka; useful for early rail days.",
        hotelKey: "shinOsaka",
        actionLabel: "Compare Shin-Osaka hotels",
        detailHref: "/areas-to-stay/shin-osaka-vs-namba",
        detailLabel: "See Shin-Osaka vs Namba",
      },
      {
        id: "tennoji",
        name: "Tennoji",
        bestFor: "Value and south Osaka access.",
        watchOut: "Less central for Kyoto or Kobe day trips.",
        transportNote: "JR and subway access works well for south Osaka, Nara, and KIX routes.",
      },
      {
        id: "osaka-castle",
        name: "Osaka Castle / quieter central",
        bestFor: "Calmer stays.",
        watchOut: "Less food-and-nightlife density than Namba or Umeda.",
        transportNote: "Good if your plans cluster around central Osaka, but check station distance carefully.",
      },
    ],
    comparisonRows: [
      ["Namba", "Good via Nankai", "Transfer to Shin-Osaka", "Strongest", "Food-first"],
      ["Umeda", "Good rail links", "Good via JR/subway", "Strong but polished", "Transport hub"],
      ["Shin-Osaka", "Transfer needed", "Best", "Limited", "Logistics"],
      ["Tennoji", "Good for KIX", "Transfer needed", "Moderate", "Value"],
      ["Osaka Castle / quieter central", "Varies", "Transfer needed", "Calmer", "Central quiet"],
    ],
  },
};

function FirstTimeStayDecisionHub({ config, locale }: { config: FirstTimeStayHubConfig; locale: string }) {
  const pagePath = `/areas-to-stay/${config.slug}`;

  return (
    <main className="page-shell min-h-screen text-slate-950">
      <SiteHeader />
      <Container className="py-8 md:py-12">
        <Breadcrumb items={[
          { label: "Areas to stay", href: "/" },
          { label: `${config.city} first-time hotel areas` },
        ]} />

        <section className="mt-5 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm md:p-9">
          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#106b43]">{config.city} hotel area guide</p>
          <h1 className="mt-3 max-w-4xl text-3xl font-semibold leading-tight text-slate-950 md:text-5xl">
            {config.title}
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-600 md:text-base">
            {config.subtitle}
          </p>
        </section>

        <section className="mt-8 rounded-[22px] border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-950">Quick Answer</h2>
          <div className="mt-4 grid gap-2 text-sm leading-6 text-slate-700 md:grid-cols-2">
            {config.quickAnswer.map((answer) => (
              <p key={answer}>{answer}</p>
            ))}
          </div>
        </section>

        <section className="mt-10">
          <div className="max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#106b43]">{config.city} Stay Areas at a Glance</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">Choose the area before the hotel</h2>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            {config.areas.map((area) => {
              const choices = area.hotelKey ? hotelProviderChoices(area.hotelKey, "stay_area_glance_card") : [];

              return (
                <article key={area.id} id={area.id} className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#106b43]">{config.city}</p>
                  <h3 className="mt-2 text-xl font-semibold text-slate-950">{area.name}</h3>
                  <div className="mt-4 grid gap-3 text-sm">
                    <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-3">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-emerald-700">Best for</p>
                      <p className="mt-1 leading-5 text-slate-700">{area.bestFor}</p>
                    </div>
                    <div className="rounded-2xl border border-amber-100 bg-amber-50/70 p-3">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-amber-700">Watch out</p>
                      <p className="mt-1 leading-5 text-slate-700">{area.watchOut}</p>
                    </div>
                    <div className="rounded-2xl border border-sky-100 bg-sky-50/70 p-3">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-sky-700">Transport note</p>
                      <p className="mt-1 leading-5 text-slate-700">{area.transportNote}</p>
                    </div>
                  </div>
                  {choices.length > 0 && area.actionLabel ? (
                    <ProviderChoiceCTA
                      actionLabel={area.actionLabel}
                      providers={choices}
                      pagePath={pagePath}
                      locale={locale}
                      area={`${config.city}: ${area.name}`}
                      city={config.city}
                      className="mt-4"
                    />
                  ) : null}
                  {area.detailHref && area.detailLabel ? (
                    <Link href={area.detailHref} className="mt-4 inline-flex text-sm font-semibold text-[#106b43] underline underline-offset-4">
                      {area.detailLabel}
                    </Link>
                  ) : (
                    <p className="mt-4 text-xs font-semibold text-slate-500">Detail guide planned</p>
                  )}
                </article>
              );
            })}
          </div>
        </section>

        <section id="comparison" className="mt-10 rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-950">Quick Area Comparison</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[680px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase tracking-[0.08em] text-slate-500">
                  {["Area", "Airport access", "Shinkansen access", "Food / nightlife", "Vibe"].map((heading) => (
                    <th key={heading} className="px-3 py-2 font-semibold">{heading}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {config.comparisonRows.map((row) => (
                  <tr key={row[0]} className="border-b border-slate-100 last:border-0">
                    {row.map((cell, index) => (
                      <td key={`${row[0]}-${index}`} className={["px-3 py-3 align-top", index === 0 ? "font-semibold text-slate-950" : "text-slate-600"].join(" ")}>
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-lg font-semibold text-slate-950">Continue Planning</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-4">
            <TrackedCtaLink href="/areas-to-stay" placement="next_steps" label="Areas to Stay" pagePath={pagePath} locale={locale} category="hotel" className={filledNextStepClass}>
              Areas to Stay
            </TrackedCtaLink>
            <TrackedCtaLink href="/local-hotel-picks" placement="next_steps" label="Local Hotel Picks" pagePath={pagePath} locale={locale} category="hotel" className={filledNextStepClass}>
              Local Hotel Picks
            </TrackedCtaLink>
            <TrackedCtaLink href="/plan-your-trip" placement="next_steps" label="Plan Your Trip" pagePath={pagePath} locale={locale} className={filledNextStepClass}>
              Plan Your Trip
            </TrackedCtaLink>
            <TrackedCtaLink href="/airport-transfers" placement="next_steps" label="Airport Transfer" pagePath={pagePath} locale={locale} category="transfer" className={filledNextStepClass}>
              Airport Transfer
            </TrackedCtaLink>
          </div>
        </section>
      </Container>
      <SiteFooter />
    </main>
  );
}

export async function generateStaticParams() {
  return getAllStaySlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, locale } = await params;
  const page = getStayBySlug(slug);
  if (!page) return {};
  return {
    title: `${page.title} | fujiseat`,
    description: page.description,
    robots: locale === "en" ? undefined : { index: false, follow: true },
    openGraph: {
      title: page.title,
      description: page.description,
      siteName: "fujiseat",
    },
    alternates: getAlternates(`/areas-to-stay/${slug}`, locale),
  };
}

export default async function StayPage({ params }: Props) {
  const { slug, locale } = await params;
  const localHotelT = await getTranslations("localHotelPicks");
  const page = getStayBySlug(slug);
  if (!page) notFound();
  const pagePath = `/areas-to-stay/${slug}`;

  const isTokyoFirstTime = page.slug === "tokyo-first-time";
  const firstTimeStayHub = firstTimeStayHubs[page.slug];

  if (isTokyoFirstTime) {
    return <TokyoFirstTimeHub locale={locale} />;
  }

  if (firstTimeStayHub) {
    return <FirstTimeStayDecisionHub config={firstTimeStayHub} locale={locale} />;
  }

  return (
    <main className="page-shell min-h-screen text-slate-950">
      {page.faqs && page.faqs.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: page.faqs.map((f) => ({
                "@type": "Question",
                name: f.question,
                acceptedAnswer: { "@type": "Answer", text: f.answer },
              })),
            }),
          }}
        />
      )}
      <SiteHeader />

      <Container className="py-8 md:py-12">
        <Breadcrumb items={[
          { label: "Areas to stay", href: "/" },
          { label: page.title.split("—")[0].trim() },
        ]} />

        <h1 className="mt-4 text-2xl font-semibold text-slate-950 md:text-3xl">
          {page.title}
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 md:text-base">
          {page.description}
        </p>

        <div className="mt-8 space-y-8">
          {page.mapId ? (
            <section className="space-y-4">
              <StayAreaMap
                mapId={page.mapId}
                priority={page.slug === "tokyo-first-time"}
              />
              {page.mapDescription && page.mapDescription.length > 0 ? (
                <div className="rounded-[18px] border border-slate-200 bg-white p-5 text-sm leading-6 text-slate-600 shadow-sm">
                  {page.mapDescription.map((paragraph) => (
                    <p key={paragraph} className="mt-3 first:mt-0">
                      {paragraph}
                    </p>
                  ))}
                </div>
              ) : null}
            </section>
          ) : null}

          <QuickRec
            area={page.quickRec.area}
            why={page.quickRec.why}
            link={page.quickRec.link}
            locale={locale}
            pagePath={pagePath}
            showCta={!isTokyoFirstTime}
          />

          <section id="areas" className="scroll-mt-24">
            <h2 className="text-lg font-semibold text-slate-950">Area breakdown</h2>
            <p className="mt-1 text-sm text-slate-500">Compare the practical fit of each area before choosing where to search.</p>
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              {page.areas.map((area) => (
                <AreaCard key={area.name} {...area} locale={locale} pagePath={pagePath} showHotelCta={isTokyoFirstTime} />
              ))}
            </div>
          </section>

          <section id="comparison" className="scroll-mt-24">
            <h2 className="mb-4 text-lg font-semibold text-slate-950">Side-by-side comparison</h2>
            <ComparisonTable
              columns={page.comparisonColumns}
              rows={page.comparison}
              highlight={page.quickRec.area}
            />
          </section>

          <ProTip>{page.proTip}</ProTip>

          <section>
            <HotelPicks picks={page.hotelPicks} locale={locale} pagePath={pagePath} />
            <div className="mt-4 rounded-[18px] border border-emerald-100 bg-emerald-50/70 p-4">
              <p className="text-sm font-semibold text-slate-950">
                Want more specific hotel examples?
              </p>
              <p className="mt-1 text-xs leading-5 text-slate-600">
                See curated Japanese local hotel picks for Tokyo, Kyoto, and Osaka.
              </p>
              <TrackedCtaLink
                href="/local-hotel-picks"
                placement="stay_detail_local_hotel_picks"
                label="Japanese local hotel picks"
                pagePath={pagePath}
                locale={locale}
                category="hotel"
                className="mt-3 inline-flex rounded-xl border border-[#168a56] bg-[#168a56] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#0f6f45]"
              >
                {localHotelT("seeLocalHotelPicks")}
              </TrackedCtaLink>
            </div>
          </section>

          <NextActions
            picks={page.nextActions}
            title="Related stay planning"
            subtitle="Use these only after you have chosen the hotel area."
            maxItems={3}
            locale={locale}
            pagePath={pagePath}
          />

          {page.faqs && page.faqs.length > 0 && (
            <section className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-950">FAQ</h2>
              <dl className="mt-4 space-y-4 text-sm">
                {page.faqs.map((item) => (
                  <div key={item.question}>
                    <dt className="font-semibold text-slate-900">{item.question}</dt>
                    <dd className="mt-1 leading-6 text-slate-600">{item.answer}</dd>
                  </div>
                ))}
              </dl>
            </section>
          )}

          {(agodaMapIdsByStaySlug[page.slug] ?? []).map((mapId) => (
            <AgodaHotelMap
              key={mapId}
              mapId={mapId}
              placement="stay_area_map"
              locale={locale}
            />
          ))}

          <SuggestedNextSteps currentPageType="stay" locale={locale} excludeTypes={["esim"]} />
        </div>

      </Container>
      <SiteFooter />
    </main>
  );
}
