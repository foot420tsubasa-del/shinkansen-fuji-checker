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
import { TrackedInternalLink } from "@/components/analytics/TrackedInternalLink";
import { TrackedAffiliateLink } from "@/components/analytics/TrackedAffiliateLink";
import { getAllStaySlugs, getStayBySlug, type StayPage as StayContentPage } from "@/lib/content/stay";
import { getAlternates } from "@/i18n/hreflang";
import { getAffUrl } from "@/src/affiliateLinks";
import { AFFILIATE_REL } from "@/lib/link-rel";
import { getAgodaHotelAreaUrl, getHotelLink, getTripHotelConfig, type HotelAreaKey } from "@/lib/hotel-links";
import { buttonClassName } from "@/components/ui/Button";

type Props = {
  params: Promise<{ slug: string; locale: string }>;
};

const agodaMapIdsByStaySlug: Record<string, string[]> = {
  "where-to-stay-before-shinkansen": ["tokyoStation"],
  "kyoto-station-vs-gion": ["kyotoStation"],
  "namba-vs-umeda": ["namba"],
  "shin-osaka-vs-namba": ["shinOsaka", "namba"],
};

const stayComparisonHotelPickSlugs = new Set([
  "asakusa-vs-ueno",
  "tokyo-station-vs-shinjuku",
  "ueno-vs-shinjuku",
  "shinjuku-vs-ueno-vs-asakusa",
  "kyoto-station-vs-gion",
  "namba-vs-umeda",
  "shin-osaka-vs-namba",
]);

const filledNextStepClass =
  buttonClassName({ variant: "internal", fullWidth: true, className: "p-4 text-center" });
const filledCommercialNextStepClass =
  buttonClassName({ variant: "commercial", fullWidth: true, className: "p-4 text-center" });

type StayPageTranslation = Partial<Pick<StayContentPage, "title" | "description" | "proTip">> & {
  quickRec?: Partial<StayContentPage["quickRec"]>;
  mapDescription?: StayContentPage["mapDescription"];
  areas?: Array<Partial<StayContentPage["areas"][number]>>;
  comparisonColumns?: StayContentPage["comparisonColumns"];
  comparison?: StayContentPage["comparison"];
  hotelPicks?: Array<Partial<StayContentPage["hotelPicks"][number]>>;
  nextActions?: Array<Partial<StayContentPage["nextActions"][number]>>;
  faqs?: StayContentPage["faqs"];
};

type TokyoHotelBaseMatrixGroup = {
  title: string;
  categoryLabel: string;
  tone: "active" | "airport" | "rail" | "calm" | "traditional";
  mainBaseLabel: string;
  mainBase: string;
  nearbyLabel?: string;
  nearbyBases?: string;
  goodIf: string;
  watchOut: string;
  hotelAreaKey?: HotelAreaKey;
  hotelActionLabel?: string;
  internalLinks: Array<{
    label: string;
    href: string;
  }>;
};

const tokyoHotelBaseMatrixGroups: TokyoHotelBaseMatrixGroup[] = [
  {
    title: "Shinjuku area",
    categoryLabel: "Active city",
    tone: "active",
    mainBaseLabel: "Main base",
    mainBase: "Shinjuku",
    nearbyLabel: "Nearby calmer bases",
    nearbyBases: "Nishi-Shinjuku / Yoyogi / Shinjuku-Gyoenmae",
    goodIf: "First-time energy, food, nightlife, and many hotel choices.",
    watchOut: "Crowds, a huge station, and a tiring arrival with luggage.",
    hotelAreaKey: "shinjuku",
    hotelActionLabel: "Search Shinjuku area hotels",
    internalLinks: [{ label: "Compare Shinjuku vs Ueno", href: "/areas-to-stay/ueno-vs-shinjuku" }],
  },
  {
    title: "Ueno area",
    categoryLabel: "Airport access",
    tone: "airport",
    mainBaseLabel: "Main base",
    mainBase: "Ueno",
    nearbyLabel: "Nearby / logistics bases",
    nearbyBases: "Nippori / Okachimachi",
    goodIf: "Narita access, museums, practical hotel search, and better-value stays.",
    watchOut: "Less polished than Ginza or Shinjuku.",
    hotelAreaKey: "ueno",
    hotelActionLabel: "Search Ueno area hotels",
    internalLinks: [
      { label: "Compare Ueno vs Shinjuku", href: "/areas-to-stay/ueno-vs-shinjuku" },
      { label: "Compare Asakusa vs Ueno", href: "/areas-to-stay/asakusa-vs-ueno" },
    ],
  },
  {
    title: "Asakusa area",
    categoryLabel: "Traditional",
    tone: "traditional",
    mainBaseLabel: "Main base",
    mainBase: "Asakusa",
    nearbyLabel: "Nearby calmer bases",
    nearbyBases: "Kuramae / Tawaramachi",
    goodIf: "Old Tokyo atmosphere, Senso-ji, river walks, and calmer nights.",
    watchOut: "Not JR-centered; check subway routing.",
    hotelAreaKey: "asakusa",
    hotelActionLabel: "Search Asakusa area hotels",
    internalLinks: [{ label: "Compare Asakusa vs Ueno", href: "/areas-to-stay/asakusa-vs-ueno" }],
  },
  {
    title: "Tokyo Station / Ginza area",
    categoryLabel: "Rail logistics",
    tone: "rail",
    mainBaseLabel: "Main base",
    mainBase: "Tokyo Station",
    nearbyLabel: "Nearby bases",
    nearbyBases: "Hatchobori / Kyobashi / Nihombashi / Yurakucho / Ginza / Hibiya",
    goodIf: "Early Shinkansen, luggage logistics, first/last night, and Ginza access.",
    watchOut: "Businesslike, large stations, and less local atmosphere.",
    hotelAreaKey: "tokyoStation",
    hotelActionLabel: "Search Tokyo Station area hotels",
    internalLinks: [{ label: "Where to stay before Shinkansen", href: "/areas-to-stay/where-to-stay-before-shinkansen" }],
  },
  {
    title: "Central balance area",
    categoryLabel: "Calm central",
    tone: "calm",
    mainBaseLabel: "Main bases",
    mainBase: "Akasaka / Akasaka-mitsuke / Suitengumae / Ningyocho",
    goodIf: "Central Tokyo balance, calmer nights, airport bus / T-CAT, and Nihombashi access.",
    watchOut: "Less famous for first-time visitors; routing depends on subway or bus.",
    internalLinks: [
      { label: "Use the Tokyo first-time guide", href: "/areas-to-stay/tokyo-first-time" },
      { label: "Choose by luggage / airport logic", href: "/areas-to-stay/where-to-stay-in-tokyo-with-luggage" },
    ],
  },
  {
    title: "Airport / logistics area",
    categoryLabel: "Airport + rail",
    tone: "airport",
    mainBaseLabel: "Main bases",
    mainBase: "Hamamatsucho / Daimon / Shinagawa / Takanawa Gateway",
    goodIf: "Haneda, Shinkansen, first/last night, and luggage-heavy travel.",
    watchOut: "Businesslike and less atmospheric.",
    internalLinks: [
      { label: "See Shinkansen-friendly stays", href: "/areas-to-stay/where-to-stay-before-shinkansen" },
      { label: "Check airport transfer", href: "/airport-transfers" },
    ],
  },
];

const hotelBaseMatrixToneClasses: Record<TokyoHotelBaseMatrixGroup["tone"], string> = {
  active: "border-orange-200 bg-orange-50 text-orange-700",
  airport: "border-sky-200 bg-sky-50 text-sky-700",
  rail: "border-indigo-200 bg-indigo-50 text-indigo-700",
  calm: "border-emerald-200 bg-emerald-50 text-emerald-700",
  traditional: "border-rose-200 bg-rose-50 text-rose-700",
};

function applyStayPageTranslation(page: StayContentPage, translation?: StayPageTranslation): StayContentPage {
  if (!translation) return page;
  return {
    ...page,
    title: translation.title ?? page.title,
    description: translation.description ?? page.description,
    proTip: translation.proTip ?? page.proTip,
    mapDescription: translation.mapDescription ?? page.mapDescription,
    areas: translation.areas
      ? page.areas.map((area, index) => ({
          ...area,
          ...translation.areas?.[index],
          hotelLink: area.hotelLink,
          hotelKey: area.hotelKey,
        }))
      : page.areas,
    comparisonColumns: translation.comparisonColumns ?? page.comparisonColumns,
    comparison: translation.comparison ?? page.comparison,
    hotelPicks: translation.hotelPicks
      ? page.hotelPicks.map((pick, index) => ({
          ...pick,
          ...translation.hotelPicks?.[index],
          link: pick.link,
          trackingHref: pick.trackingHref,
          hotelKey: pick.hotelKey,
          provider: pick.provider,
        }))
      : page.hotelPicks,
    nextActions: translation.nextActions
      ? page.nextActions.map((action, index) => ({
          ...action,
          ...translation.nextActions?.[index],
          href: action.href,
        }))
      : page.nextActions,
    faqs: translation.faqs ?? page.faqs,
    quickRec: {
      ...page.quickRec,
      ...translation.quickRec,
    },
  };
}

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

async function TokyoFirstTimeHub({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: "tokyoStayHub" });
  const pagePath = "/areas-to-stay/tokyo-first-time";
  const esimHref = getAffUrl("esim");
  const heroImage = publicImageIfExists(tokyoStayImages.hero);
  const cardConfigs = [
    {
      key: "shinjuku",
      area: "Tokyo: Shinjuku",
      image: publicImageIfExists(tokyoStayImages.shinjuku),
      providerChoices: hotelProviderChoices("shinjuku", "stay_area_glance_card"),
      detailHref: "/areas-to-stay/tokyo/shinjuku",
    },
    {
      key: "ueno",
      area: "Tokyo: Ueno",
      image: publicImageIfExists(tokyoStayImages.ueno),
      providerChoices: hotelProviderChoices("ueno", "stay_area_glance_card"),
      detailHref: "/areas-to-stay/tokyo/ueno",
    },
    {
      key: "asakusa",
      area: "Tokyo: Asakusa",
      image: publicImageIfExists(tokyoStayImages.asakusa),
      providerChoices: hotelProviderChoices("asakusa", "stay_area_glance_card"),
      detailHref: "/areas-to-stay/tokyo/asakusa",
    },
    {
      key: "tokyoStation",
      area: "Tokyo: Tokyo Station",
      image: publicImageIfExists(tokyoStayImages.tokyoStation),
      providerChoices: hotelProviderChoices("tokyoStation", "stay_area_glance_card"),
      detailHref: "/areas-to-stay/tokyo/tokyo-station",
    },
    {
      key: "eastTokyo",
      area: "Tokyo: East Tokyo",
      image: publicImageIfExists(tokyoStayImages.eastTokyo),
      providerChoices: providerChoices({
        label: t("cards.eastTokyo.primaryAction"),
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
  const cards = cardConfigs.map((card) => ({
    ...card,
    title: t(`cards.${card.key}.title`),
    subtitle: t(`cards.${card.key}.subtitle`),
    bestFor: t(`cards.${card.key}.bestFor`),
    weakness: t(`cards.${card.key}.weakness`),
    primaryAction: t(`cards.${card.key}.primaryAction`),
  }));

  const quickAnswers = t.raw("quickAnswer.items") as string[];
  const planCards = t.raw("travelPlan.cards") as Array<{ label: string; area: string; href: string }>;
  const benefits = t.raw("benefits.items") as Array<{ title: string; body: string }>;
  const comparisonHeadings = t.raw("comparison.headings") as string[];
  const comparisonRows = t.raw("comparison.rows") as string[][];
  const faqs = t.raw("faq.items") as Array<{ question: string; answer: string }>;
  const nearbyBases = [
    {
      name: "Suitengumae / Ningyocho",
      broadBase: "East Tokyo / Tokyo Station side",
      bestFor: "Calmer nights, Haneda or Narita logistics, and travelers who want easier streets than the biggest hubs.",
      watchOut: "Less nightlife than Shinjuku and fewer obvious first-time landmarks outside the hotel.",
      href: "/areas-to-stay/tokyo/east-tokyo",
    },
    {
      name: "Akasaka / Akasaka-mitsuke",
      broadBase: "Central Tokyo",
      bestFor: "Food, subway access, and a more controlled night base than the busiest station areas.",
      watchOut: "Not as direct for Shinkansen mornings as staying near Tokyo Station.",
      href: "/areas-to-stay/tokyo-first-time",
    },
    {
      name: "Kuramae / Tawaramachi",
      broadBase: "Asakusa / East Tokyo",
      bestFor: "Cafes, design shops, calmer streets, and old-town access without sleeping in the most tourist-heavy blocks.",
      watchOut: "Some airport or Shinkansen routes may need one extra transfer.",
      href: "/areas-to-stay/tokyo/asakusa",
    },
    {
      name: "Hatchobori / Kyobashi / Nihombashi",
      broadBase: "Tokyo Station side",
      bestFor: "Early Shinkansen, luggage logistics, and a quieter businesslike base near central rail routes.",
      watchOut: "Less local-night energy than Shinjuku, Ueno, or Asakusa.",
      href: "/areas-to-stay/tokyo/tokyo-station",
    },
    {
      name: "Nippori / Okachimachi",
      broadBase: "Ueno side",
      bestFor: "Narita access, better-value hotel searches, and practical food options around the Ueno corridor.",
      watchOut: "Pick carefully if you want nightlife or a polished first-night feel.",
      href: "/areas-to-stay/tokyo/ueno",
    },
    {
      name: "Nishi-Shinjuku / Yoyogi / Shinjuku-Gyoenmae",
      broadBase: "Shinjuku side",
      bestFor: "Shinjuku convenience with a better chance of calmer nights than the loudest east-side blocks.",
      watchOut: "Walking distance and station exits matter because Shinjuku scale can still be tiring.",
      href: "/areas-to-stay/tokyo/shinjuku",
    },
  ];

  return (
    <main className="page-shell min-h-screen text-slate-950">
      <SiteHeader />
      <Container className="py-8 md:py-12">
        <Breadcrumb items={[
          { label: t("breadcrumb.parent"), href: "/" },
          { label: t("breadcrumb.current") },
        ]} />

        <section className="mt-5 overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
          {heroImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={heroImage} alt={t("hero.imageAlt")} className="aspect-[16/9] max-h-[420px] w-full object-cover" />
          ) : (
            <div className="h-64 bg-[linear-gradient(135deg,#eef6fb,#fff_50%,#f0fbf6)]" aria-hidden="true" />
          )}
          <div className="p-6 md:p-9">
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#106b43]">{t("hero.eyebrow")}</p>
            <h1 className="mt-3 max-w-4xl text-3xl font-semibold leading-tight text-slate-950 md:text-5xl">
              {t("hero.title")}
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-600 md:text-base">
              {t("hero.subtitle")}
            </p>
          </div>
        </section>

        <section className="mt-8 grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="rounded-[22px] border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-950">{t("quickAnswer.title")}</h2>
            <div className="mt-4 space-y-2 text-sm leading-6 text-slate-700">
              {quickAnswers.map((answer) => <p key={answer}>{answer}</p>)}
            </div>
          </div>
          <div className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
            <ProviderChoiceCTA
              actionLabel={t("quickAnswer.cta")}
              providers={hotelProviderChoices("shinjuku", "stay_quick_answer")}
              pagePath={pagePath}
              locale={locale}
              area="Tokyo: Shinjuku"
            />
            <TrackedCtaLink
              href="/local-hotel-picks"
              placement="stay_quick_answer"
              label={t("quickAnswer.secondaryCta")}
              pagePath={pagePath}
              locale={locale}
              category="hotel"
              className="mt-3 inline-flex min-h-10 items-center justify-center rounded-xl border border-[#168a56] bg-[#168a56] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#0f6f45]"
            >
              {t("quickAnswer.secondaryCta")}
            </TrackedCtaLink>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-semibold text-slate-950">{t("travelPlan.title")}</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-5">
            {planCards.map(({ label, area, href }) => (
              <a key={label} href={href} className="rounded-2xl border border-slate-200 bg-white p-4 text-sm shadow-sm transition-colors hover:bg-slate-50">
                <span className="block text-slate-600">{label}</span>
                <span className="mt-2 block font-semibold text-slate-950">→ {area}</span>
              </a>
            ))}
          </div>
        </section>

        <section id="hotel-base-matrix" className="mt-10 rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="max-w-3xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#106b43]">Hotel base decision</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">Tokyo hotel base matrix</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Compare famous stations, calmer nearby bases, and logistics-friendly hotel areas before you search hotels.
              This is a general starting point, not traveler-specific advice.
            </p>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {tokyoHotelBaseMatrixGroups.map((group) => {
              const hotelProviders = group.hotelAreaKey
                ? hotelProviderChoices(group.hotelAreaKey, "tokyo_first_time_hotel_base_matrix")
                : [];

              return (
                <article key={group.title} className="flex h-full flex-col rounded-[22px] border border-slate-200 bg-slate-50 p-4 shadow-sm">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${hotelBaseMatrixToneClasses[group.tone]}`}>
                      {group.categoryLabel}
                    </span>
                    <h3 className="text-lg font-semibold text-slate-950">{group.title}</h3>
                  </div>

                  <dl className="mt-4 grid gap-3 text-sm leading-6 text-slate-600">
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">{group.mainBaseLabel}</dt>
                      <dd className="mt-1 font-semibold text-slate-950">{group.mainBase}</dd>
                    </div>
                    {group.nearbyBases ? (
                      <div>
                        <dt className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">{group.nearbyLabel}</dt>
                        <dd className="mt-1 text-slate-700">{group.nearbyBases}</dd>
                      </div>
                    ) : null}
                    <div>
                      <dt className="font-semibold text-slate-900">Good if</dt>
                      <dd>{group.goodIf}</dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-slate-900">Watch out</dt>
                      <dd>{group.watchOut}</dd>
                    </div>
                  </dl>

                  <div className="mt-auto pt-4">
                    {hotelProviders.length > 0 && group.hotelActionLabel ? (
                      <ProviderChoiceCTA
                        actionLabel={group.hotelActionLabel}
                        description="Broad area search only. Smaller nearby bases do not have separate provider buttons here."
                        providers={hotelProviders}
                        pagePath={pagePath}
                        locale={locale}
                        area={group.title}
                        city="Tokyo"
                      />
                    ) : null}

                    <div className="mt-3 flex flex-wrap gap-2">
                      {group.internalLinks.map((link) => (
                        <TrackedInternalLink
                          key={link.href}
                          href={link.href}
                          sourcePage={pagePath}
                          placement="tokyo_first_time_hotel_base_matrix"
                          label={link.label}
                          locale={locale}
                          className="inline-flex min-h-9 items-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-[#106b43] transition-colors hover:border-emerald-200 hover:bg-emerald-50"
                        >
                          {link.label} →
                        </TrackedInternalLink>
                      ))}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="mt-12">
          <div className="max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#106b43]">{t("glance.eyebrow")}</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">{t("glance.title")}</h2>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            {cards.map((card) => (
              <StayBaseCard
                key={card.title}
                title={card.title}
                subtitle={card.subtitle}
                bestFor={card.bestFor}
                weakness={card.weakness}
                image={card.image ? { src: card.image, alt: t("glance.cardImageAlt", { area: card.title }) } : undefined}
                area={card.area}
                primaryAction={card.primaryAction}
                providerChoices={card.providerChoices}
                secondaryInternalLink={{ href: card.detailHref, label: t("glance.detailLabel") }}
                placement="stay_area_glance_card"
                pagePath={pagePath}
                locale={locale}
              />
            ))}
          </div>
        </section>

        <section className="mt-10 grid gap-4 lg:grid-cols-2">
          <div className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-950">Common mistakes when choosing a Tokyo hotel area</h2>
            <div className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
              <p>Do not choose Shinjuku only because everyone recommends it.</p>
              <p>Do not choose Asakusa only because it looks traditional.</p>
              <p>Do not choose Tokyo Station only because it is convenient for Shinkansen.</p>
              <p>A famous station is not always the easiest place to sleep.</p>
              <p>Your best base depends on airport access, luggage, Shinkansen day, station complexity, quiet nights, and room size.</p>
            </div>
          </div>
          <div className="rounded-[22px] border border-emerald-100 bg-emerald-50/70 p-5 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-950">Room size note for Tokyo hotels</h2>
            <div className="mt-3 space-y-2 text-sm leading-6 text-slate-700">
              <p>Tokyo hotel rooms can feel compact compared with hotels or apartments in some countries. For two travelers, rooms under 18㎡ can feel tight with large suitcases. Around 22–26㎡ is usually workable, and 30㎡+ is generally comfortable for two by Tokyo hotel standards.</p>
              <p>Before booking, check room size, bed setup, and reviews mentioning luggage or small rooms.</p>
            </div>
          </div>
        </section>

        <section className="mt-10 rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="max-w-3xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#106b43]">Hotel-base refinement</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">Smarter nearby hotel bases</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              The famous area name is only the starting point. A nearby hotel base can sometimes make arrival, luggage,
              room size, or quiet nights easier while still keeping the same broad Tokyo logic. Use these as general
              search directions, not station-by-station instructions.
            </p>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {nearbyBases.map((base) => (
              <article key={base.name} className="flex h-full flex-col rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <h3 className="text-base font-semibold text-slate-950">{base.name}</h3>
                <p className="mt-1 text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">{base.broadBase}</p>
                <div className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
                  <p><span className="font-semibold text-slate-900">Good if:</span> {base.bestFor}</p>
                  <p><span className="font-semibold text-slate-900">Watch out:</span> {base.watchOut}</p>
                </div>
                <Link
                  href={base.href}
                  className="mt-4 inline-flex text-sm font-semibold text-[#106b43] underline underline-offset-4"
                >
                  Compare the broader area →
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-6 rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-950">Need a clearer Tokyo hotel-base framework?</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            Use the free guides for general area logic. Room size, luggage, airport arrival, and Shinkansen timing can
            change the easiest hotel base, so keep those constraints visible before comparing hotels.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <TrackedInternalLink
              href="/areas-to-stay/tokyo-hotel-room-size-guide"
              sourcePage={pagePath}
              placement="tokyo_first_time_tokyo_pack"
              label="Tokyo hotel room size guide"
              locale={locale}
              className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-white"
            >
              Room size guide →
            </TrackedInternalLink>
            <TrackedInternalLink
              href="/areas-to-stay/where-to-stay-in-tokyo-with-luggage"
              sourcePage={pagePath}
              placement="tokyo_first_time_tokyo_pack"
              label="Tokyo with luggage guide"
              locale={locale}
              className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-white"
            >
              Tokyo with luggage →
            </TrackedInternalLink>
            <TrackedInternalLink
              href="/areas-to-stay"
              sourcePage={pagePath}
              placement="tokyo_first_time_tokyo_pack"
              label="Japan stay area hub"
              locale={locale}
              className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-semibold text-[#106b43] transition-colors hover:bg-white"
            >
              Compare stay area guides →
            </TrackedInternalLink>
          </div>
        </section>

        <section className="mt-10 rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-950">{t("benefits.title")}</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-4">
            {benefits.map(({ title, body }) => (
              <div key={title} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <p className="font-semibold text-slate-950">{title}</p>
                <p className="mt-1 text-sm leading-5 text-slate-600">{body}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="comparison" className="mt-10 rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-950">{t("comparison.title")}</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase tracking-[0.08em] text-slate-500">
                  {comparisonHeadings.map((heading) => (
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
          <h2 className="text-xl font-semibold text-slate-950">{t("faq.title")}</h2>
          <dl className="mt-4 grid gap-3 md:grid-cols-2">
            {faqs.map(({ question, answer }) => (
              <div key={question} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <dt className="font-semibold text-slate-950">{question}</dt>
                <dd className="mt-1 text-sm leading-6 text-slate-600">{answer}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="mt-10">
          <h2 className="text-lg font-semibold text-slate-950">{t("continue.title")}</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-5">
            <TrackedCtaLink href="/plan-your-trip" placement="next_steps" label={t("continue.plan")} pagePath={pagePath} locale={locale} className={filledNextStepClass}>
              {t("continue.plan")}
            </TrackedCtaLink>
            <TrackedCtaLink href="/jr-pass-vs-single-ticket" placement="next_steps" label={t("continue.jrPass")} pagePath={pagePath} locale={locale} category="rail" className={filledNextStepClass}>
              {t("continue.jrPass")}
            </TrackedCtaLink>
            {esimHref ? (
              <TrackedAffiliateLink href={esimHref} target="_blank" rel={AFFILIATE_REL} category="esim" provider="klook" placement="next_steps" pagePath={pagePath} locale={locale} label={t("continue.esim")} linkId="esim" product="esim" adid="1166001" className={filledCommercialNextStepClass}>
                {t("continue.esim")}
              </TrackedAffiliateLink>
            ) : (
              <TrackedCtaLink href="/plan-your-trip" placement="next_steps" label={t("continue.esim")} pagePath={pagePath} locale={locale} className={filledNextStepClass}>
                {t("continue.esim")}
              </TrackedCtaLink>
            )}
            <TrackedCtaLink href="/airport-transfers" placement="next_steps" label={t("continue.airport")} pagePath={pagePath} locale={locale} category="transfer" className={filledNextStepClass}>
              {t("continue.airport")}
            </TrackedCtaLink>
            <TrackedCtaLink href="/local-hotel-picks" placement="next_steps" label={t("continue.localPicks")} pagePath={pagePath} locale={locale} category="hotel" className={filledNextStepClass}>
              {t("continue.localPicks")}
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

async function FirstTimeStayDecisionHub({ config, locale }: { config: FirstTimeStayHubConfig; locale: string }) {
  const t = await getTranslations({ locale, namespace: `firstTimeStayHubs.${config.slug}` });
  const pagePath = `/areas-to-stay/${config.slug}`;
  const quickAnswer = t.raw("quickAnswer") as string[];
  const comparisonHeadings = t.raw("comparisonHeadings") as string[];
  const comparisonRows = t.raw("comparisonRows") as string[][];
  const localizedAreas = config.areas.map((area) => ({
    ...area,
    ...(t.raw(`areas.${area.id}`) as {
      name: string;
      bestFor: string;
      watchOut: string;
      transportNote: string;
      actionLabel?: string;
      detailLabel?: string;
    }),
  }));

  return (
    <main className="page-shell min-h-screen text-slate-950">
      <SiteHeader />
      <Container className="py-8 md:py-12">
        <Breadcrumb items={[
          { label: t("breadcrumb.parent"), href: "/" },
          { label: t("breadcrumb.current") },
        ]} />

        <section className="mt-5 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm md:p-9">
          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#106b43]">{t("hero.eyebrow")}</p>
          <h1 className="mt-3 max-w-4xl text-3xl font-semibold leading-tight text-slate-950 md:text-5xl">
            {t("hero.title")}
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-600 md:text-base">
            {t("hero.subtitle")}
          </p>
        </section>

        <section className="mt-8 rounded-[22px] border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-950">{t("quickAnswerTitle")}</h2>
          <div className="mt-4 grid gap-2 text-sm leading-6 text-slate-700 md:grid-cols-2">
            {quickAnswer.map((answer) => (
              <p key={answer}>{answer}</p>
            ))}
          </div>
        </section>

        <section className="mt-10">
          <div className="max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#106b43]">{t("glance.eyebrow")}</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">{t("glance.title")}</h2>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            {localizedAreas.map((area) => {
              const choices = area.hotelKey ? hotelProviderChoices(area.hotelKey, "stay_area_glance_card") : [];

              return (
                <article key={area.id} id={area.id} className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#106b43]">{t("city")}</p>
                  <h3 className="mt-2 text-xl font-semibold text-slate-950">{area.name}</h3>
                  <div className="mt-4 grid gap-3 text-sm">
                    <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-3">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-emerald-700">{t("labels.bestFor")}</p>
                      <p className="mt-1 leading-5 text-slate-700">{area.bestFor}</p>
                    </div>
                    <div className="rounded-2xl border border-amber-100 bg-amber-50/70 p-3">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-amber-700">{t("labels.watchOut")}</p>
                      <p className="mt-1 leading-5 text-slate-700">{area.watchOut}</p>
                    </div>
                    <div className="rounded-2xl border border-sky-100 bg-sky-50/70 p-3">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-sky-700">{t("labels.transportNote")}</p>
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
                    <p className="mt-4 text-xs font-semibold text-slate-500">{t("labels.detailGuidePlanned")}</p>
                  )}
                </article>
              );
            })}
          </div>
        </section>

        <section id="comparison" className="mt-10 rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-950">{t("comparisonTitle")}</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[680px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase tracking-[0.08em] text-slate-500">
                  {comparisonHeadings.map((heading) => (
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

        <section className="mt-10">
          <h2 className="text-lg font-semibold text-slate-950">{t("continue.title")}</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-4">
            <TrackedCtaLink href="/areas-to-stay" placement="next_steps" label={t("continue.areas")} pagePath={pagePath} locale={locale} category="hotel" className={filledNextStepClass}>
              {t("continue.areas")}
            </TrackedCtaLink>
            <TrackedCtaLink href="/local-hotel-picks" placement="next_steps" label={t("continue.localPicks")} pagePath={pagePath} locale={locale} category="hotel" className={filledNextStepClass}>
              {t("continue.localPicks")}
            </TrackedCtaLink>
            <TrackedCtaLink href="/plan-your-trip" placement="next_steps" label={t("continue.plan")} pagePath={pagePath} locale={locale} className={filledNextStepClass}>
              {t("continue.plan")}
            </TrackedCtaLink>
            <TrackedCtaLink href="/airport-transfers" placement="next_steps" label={t("continue.airport")} pagePath={pagePath} locale={locale} category="transfer" className={filledNextStepClass}>
              {t("continue.airport")}
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
  const rawPage = getStayBySlug(slug);
  if (!rawPage) return {};
  const firstTimeStayHub = firstTimeStayHubs[slug];

  if (firstTimeStayHub) {
    const t = await getTranslations({ locale, namespace: `firstTimeStayHubs.${slug}.meta` });
    return {
      title: `${t("title")} | fujiseat`,
      description: t("description"),
      robots: locale === "en" ? undefined : { index: false, follow: true },
      openGraph: {
        title: t("title"),
        description: t("description"),
        siteName: "fujiseat",
      },
      alternates: getAlternates(`/areas-to-stay/${slug}`, locale),
    };
  }

  const stayPagesT = await getTranslations({ locale, namespace: "stayPages" });
  const pageTranslations = stayPagesT.raw("pages") as Record<string, StayPageTranslation>;
  const page = applyStayPageTranslation(rawPage, pageTranslations[slug]);

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
  const stayPagesT = await getTranslations({ locale, namespace: "stayPages" });
  const stayPagesCommon = stayPagesT.raw("common") as Record<string, string>;
  const pageTranslations = stayPagesT.raw("pages") as Record<string, StayPageTranslation>;
  const rawPage = getStayBySlug(slug);
  if (!rawPage) notFound();
  const page = applyStayPageTranslation(rawPage, pageTranslations[slug]);
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
          { label: stayPagesCommon.breadcrumbParent, href: "/" },
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
            <h2 className="text-lg font-semibold text-slate-950">{stayPagesCommon.areaBreakdownTitle}</h2>
            <p className="mt-1 text-sm text-slate-500">{stayPagesCommon.areaBreakdownSubtitle}</p>
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              {page.areas.map((area) => (
                <AreaCard key={area.name} {...area} locale={locale} pagePath={pagePath} showHotelCta={isTokyoFirstTime} />
              ))}
            </div>
          </section>

          <section id="comparison" className="scroll-mt-24">
            <h2 className="mb-4 text-lg font-semibold text-slate-950">{stayPagesCommon.comparisonTitle}</h2>
            <ComparisonTable
              columns={page.comparisonColumns}
              rows={page.comparison}
              highlight={page.quickRec.area}
            />
          </section>

          <ProTip>{page.proTip}</ProTip>

          <section>
            <HotelPicks
              picks={page.hotelPicks}
              locale={locale}
              pagePath={pagePath}
              placement={stayComparisonHotelPickSlugs.has(page.slug) ? "stay_comparison_hotel_pick" : "hotel_pick"}
            />
            <div className="mt-4 rounded-[18px] border border-emerald-100 bg-emerald-50/70 p-4">
              <p className="text-sm font-semibold text-slate-950">
                {stayPagesCommon.localHotelBoxTitle}
              </p>
              <p className="mt-1 text-xs leading-5 text-slate-600">
                {stayPagesCommon.localHotelBoxBody}
              </p>
              <TrackedCtaLink
                href="/local-hotel-picks"
                placement="stay_detail_local_hotel_picks"
                label={stayPagesCommon.localHotelCtaLabel}
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
            title={stayPagesCommon.nextActionsTitle}
            subtitle={stayPagesCommon.nextActionsSubtitle}
            maxItems={3}
            locale={locale}
            pagePath={pagePath}
          />

          {page.faqs && page.faqs.length > 0 && (
            <section className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-950">{stayPagesCommon.faqTitle}</h2>
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
