import type { Metadata } from "next";
import { notFound } from "next/navigation";
import fs from "node:fs";
import path from "node:path";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SiteHeader } from "../../../components/SiteHeader";
import { Breadcrumb } from "@/components/content/Breadcrumb";
import { StayAreaMap } from "@/components/content/StayAreaMap";
import { SiteFooter } from "@/components/content/SiteFooter";
import { ProviderChoiceCTA, type ProviderChoiceButton } from "@/components/affiliate/ProviderChoiceCTA";
import { ProviderButton } from "@/components/ui/ProviderButton";
import { TrackedCtaLink } from "@/components/analytics/TrackedCtaLink";
import { Link } from "@/i18n/navigation";
import { getAlternates } from "@/i18n/hreflang";
import { getTranslations } from "next-intl/server";
import { getHotelLink, getTripHotelConfig, type HotelAreaKey } from "@/lib/hotel-links";
import { getAllHotelPickLinkConfigs } from "@/lib/hotel-pick-links";
import type { StayAreaMapKey } from "@/lib/stay-area-maps";
import { buttonClassName } from "@/components/ui/Button";

type Props = {
  params: Promise<{ locale: string; area: string }>;
};

type AreaDetail = {
  slug: string;
  title: string;
  subtitle: string;
  areaLabel: string;
  hotelKey?: HotelAreaKey;
  image: string;
  mapId?: StayAreaMapKey;
  primaryAction: string;
  bestFor: string;
  avoid: string;
  bestMicroAreas: string;
  microAreas: Array<{ name: string; body: string }>;
  faqs: Array<{ question: string; answer: string }>;
  airportHref?: string;
  internalPrimaryHref?: string;
};

const areaDetails: Record<string, AreaDetail> = {
  shinjuku: {
    slug: "shinjuku",
    title: "Where to Stay in Shinjuku",
    subtitle:
      "Best for first-time energy, food, nightlife, and train options — but choose the calmer side if you want quiet nights.",
    areaLabel: "Tokyo: Shinjuku",
    hotelKey: "shinjuku",
    image: "/images/stay/tokyo/stay-shinjuku.png",
    mapId: "shinjukuStayMap",
    primaryAction: "Compare Shinjuku hotels",
    bestFor: "First-timers who want food, nightlife, shopping, and flexible train access in one base.",
    avoid: "Light sleepers who book directly inside the loudest nightlife blocks without checking the micro-area.",
    bestMicroAreas: "Nishi-Shinjuku, Shinjuku-Gyoenmae / Shinjuku-sanchome, and Yoyogi / South Shinjuku.",
    microAreas: [
      { name: "Nishi-Shinjuku", body: "Business hotels, quieter nights, good for families and comfort." },
      { name: "Shinjuku-Gyoenmae / Shinjuku-sanchome", body: "Still central, calmer, good food access." },
      { name: "Yoyogi / South Shinjuku", body: "More residential, balanced, easier nights." },
      { name: "Kabukicho", body: "Bright, loud, convenient, but not ideal for quiet stays." },
    ],
    faqs: [
      { question: "Is Shinjuku too noisy?", answer: "Some blocks are. Stay west, south, or near Shinjuku-Gyoenmae if quiet matters." },
      { question: "Is Shinjuku good for families?", answer: "Yes, especially Nishi-Shinjuku or Yoyogi / South Shinjuku." },
      { question: "Is Kabukicho a bad place to stay?", answer: "Not automatically, but it is loud and nightlife-heavy. It is not the calmest first-night choice." },
      { question: "How far is Shinjuku from Tokyo Station?", answer: "Usually 10-15 minutes by JR Chuo Line, plus walking time inside stations." },
    ],
    airportHref: "/airport-transfers/narita-to-shinjuku",
  },
  ueno: {
    slug: "ueno",
    title: "Where to Stay in Ueno",
    subtitle: "Best for Narita access, museums, parks, and better-value hotels.",
    areaLabel: "Tokyo: Ueno",
    hotelKey: "ueno",
    image: "/images/stay/tokyo/stay-ueno.png",
    mapId: "eastTokyoMap",
    primaryAction: "Compare Ueno hotels",
    bestFor: "Travelers arriving at Narita, museum days, Ueno Park, and practical central Tokyo value.",
    avoid: "Travelers who want late-night nightlife at their hotel doorstep.",
    bestMicroAreas: "Ueno Station / Okachimachi, Ueno Park side, Inaricho / Taito side, and Ameyoko side.",
    microAreas: [
      { name: "Ueno Station / Okachimachi", body: "Easiest transport and food." },
      { name: "Ueno Park side", body: "Museums, park, calmer daytime feel." },
      { name: "Inaricho / Taito side", body: "Quieter, often better value." },
      { name: "Ameyoko side", body: "Lively, food, budget energy." },
    ],
    faqs: [
      { question: "Is Ueno good for first-time visitors?", answer: "Yes, especially if Narita access and value matter more than nightlife." },
      { question: "Is Ueno convenient for the Shinkansen?", answer: "Tokyo Station is about 7 minutes away by JR, and some northern Shinkansen services also stop at Ueno." },
      { question: "Is Ueno lively at night?", answer: "It has food and market energy, but it is much quieter than Shinjuku." },
      { question: "Where should I stay near Ueno?", answer: "Station / Okachimachi is easiest; Inaricho can feel calmer and better value." },
    ],
    airportHref: "/airport-transfers/narita-to-ueno",
  },
  asakusa: {
    slug: "asakusa",
    title: "Where to Stay in Asakusa",
    subtitle: "Best for old-town Tokyo, Senso-ji, riverside walks, and a traditional atmosphere.",
    areaLabel: "Tokyo: Asakusa",
    hotelKey: "asakusa",
    image: "/images/stay/tokyo/stay-asakusa.png",
    mapId: "eastTokyoMap",
    primaryAction: "Compare Asakusa hotels",
    bestFor: "Travelers who want temples, old-town atmosphere, Tokyo Skytree views, and calmer evenings.",
    avoid: "Travelers who want JR Yamanote access or late-night west-side nightlife every night.",
    bestMicroAreas: "Senso-ji / Kaminarimon side, Tawaramachi side, Sumida River side, and Kuramae edge.",
    microAreas: [
      { name: "Senso-ji / Kaminarimon side", body: "Most atmospheric, tourist-friendly." },
      { name: "Tawaramachi side", body: "Quieter, good Ginza Line access." },
      { name: "Sumida River side", body: "Calmer walks and skyline views." },
      { name: "Kuramae edge", body: "Cafes, design shops, east-side feel." },
    ],
    faqs: [
      { question: "Is Asakusa convenient without JR?", answer: "Yes for east Tokyo and old-town sights, but you will use subway transfers more often." },
      { question: "Is Asakusa good for families?", answer: "Yes. It is calmer than Shinjuku and has easy temple and river walks." },
      { question: "Is Asakusa too quiet at night?", answer: "It quiets down earlier than Shinjuku, which can be a benefit if you want calm nights." },
      { question: "Where is the best Asakusa micro-area?", answer: "Kaminarimon is easiest for first-timers; Tawaramachi and Kuramae edge are calmer." },
    ],
    airportHref: "/airport-transfers/narita-to-asakusa",
  },
  "tokyo-station": {
    slug: "tokyo-station",
    title: "Where to Stay near Tokyo Station",
    subtitle: "Best for early Shinkansen, luggage, business-like comfort, and easy Kyoto / Osaka transfers.",
    areaLabel: "Tokyo: Tokyo Station",
    hotelKey: "tokyoStation",
    image: "/images/stay/tokyo/stay-tokyo-station.png",
    mapId: "tokyoStationMap",
    primaryAction: "Compare hotels near Tokyo Station",
    bestFor: "Early Shinkansen departures, heavy luggage, Kyoto / Osaka transfers, and clean logistics.",
    avoid: "Travelers who want late-night local neighborhood energy right outside the hotel.",
    bestMicroAreas: "Marunouchi side, Yaesu side, Nihonbashi / Kyobashi side, and Ginza edge.",
    microAreas: [
      { name: "Marunouchi side", body: "Clean, premium, business-like." },
      { name: "Yaesu side", body: "Practical for Shinkansen and buses." },
      { name: "Nihonbashi / Kyobashi side", body: "Calmer, walkable, still convenient." },
      { name: "Ginza edge", body: "Shopping and restaurants, higher-end feel." },
    ],
    faqs: [
      { question: "Should I stay near Tokyo Station before Kyoto?", answer: "Yes if your train is early or luggage is heavy. It removes the morning transfer." },
      { question: "Is Tokyo Station too business-like?", answer: "It can feel less local at night, but it is excellent for logistics." },
      { question: "Which side is best for the Shinkansen?", answer: "Yaesu is usually the practical side for Shinkansen and bus access." },
      { question: "Is Ginza close enough?", answer: "Yes for many travelers, especially if shopping and restaurants matter." },
    ],
    airportHref: "/airport-transfers/narita-to-tokyo-station",
  },
  "east-tokyo": {
    slug: "east-tokyo",
    title: "Where to Stay in East Tokyo",
    subtitle: "Best for quieter local walks, coffee, riverside neighborhoods, and second-time Tokyo visitors.",
    areaLabel: "Tokyo: East Tokyo",
    image: "/images/stay/tokyo/stay-east-tokyo.png",
    mapId: "eastTokyoMap",
    primaryAction: "Explore Local Tokyo",
    internalPrimaryHref: "/local-tokyo",
    bestFor: "Travelers who want slower streets, coffee, museums, riverside walks, and a quieter base.",
    avoid: "First-timers who want the simplest default base for every major Tokyo sight.",
    bestMicroAreas: "Kiyosumi-Shirakawa, Kuramae, Ryogoku, and Monzen-Nakacho.",
    microAreas: [
      { name: "Kiyosumi-Shirakawa", body: "Coffee, museums, calm streets." },
      { name: "Kuramae", body: "Design shops, cafes, river walks." },
      { name: "Ryogoku", body: "Sumo, history, local food." },
      { name: "Monzen-Nakacho", body: "Local food, temples, slower pace." },
    ],
    faqs: [
      { question: "Is East Tokyo good for a first Tokyo hotel?", answer: "It can be, but it is better if you already know you want a quieter local base." },
      { question: "Which East Tokyo area is best for coffee?", answer: "Kiyosumi-Shirakawa is the strongest coffee and museum base." },
      { question: "Is Kuramae convenient?", answer: "It is good for Asakusa and riverside walks, but less direct for west-side nightlife." },
      { question: "Should I stay in Ryogoku?", answer: "It works for sumo, museums, and local food, but it is usually better as a focused local base than a default first stay." },
    ],
  },
};

const filledNextStepClass =
  buttonClassName({ variant: "internal", fullWidth: true, className: "p-4 text-center" });

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
  );
}

function hotelExamples(areaKey?: HotelAreaKey) {
  if (!areaKey) return [];
  return Object.entries(getAllHotelPickLinkConfigs())
    .filter(([, config]) => config.hotelKey === areaKey && config.tripUrl.trim())
    .slice(0, 4)
    .map(([id, config]) => ({ id, ...config }));
}

export function generateStaticParams() {
  return Object.keys(areaDetails).map((area) => ({ area }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { area, locale } = await params;
  const detail = areaDetails[area];
  if (!detail) return {};
  const t = await getTranslations({ locale, namespace: `tokyoAreaDetails.areas.${area}` });
  const pathName = `/areas-to-stay/tokyo/${detail.slug}`;
  return {
    title: `${t("title")} | fujiseat`,
    description: t("subtitle"),
    robots: locale === "en" ? undefined : { index: false, follow: true },
    alternates: getAlternates(pathName, locale),
    openGraph: {
      title: t("title"),
      description: t("subtitle"),
      siteName: "fujiseat",
    },
  };
}

export default async function TokyoAreaDetailPage({ params }: Props) {
  const { area, locale } = await params;
  const detail = areaDetails[area];
  if (!detail) notFound();
  const t = await getTranslations({ locale, namespace: "tokyoAreaDetails" });

  const pagePath = `/areas-to-stay/tokyo/${detail.slug}`;
  const image = publicImageIfExists(detail.image);
  const examples = hotelExamples(detail.hotelKey);
  const localized = {
    title: t(`areas.${area}.title`),
    subtitle: t(`areas.${area}.subtitle`),
    areaLabel: t(`areas.${area}.areaLabel`),
    breadcrumbLabel: t(`areas.${area}.breadcrumbLabel`),
    primaryAction: t(`areas.${area}.primaryAction`),
    bestFor: t(`areas.${area}.bestFor`),
    avoid: t(`areas.${area}.avoid`),
    bestMicroAreas: t(`areas.${area}.bestMicroAreas`),
    microAreas: t.raw(`areas.${area}.microAreas`) as Array<{ name: string; body: string }>,
    faqs: t.raw(`areas.${area}.faqs`) as Array<{ question: string; answer: string }>,
  };
  const primaryChoices = detail.hotelKey
    ? hotelProviderChoices(detail.hotelKey, "stay_area_detail_primary")
    : providerChoices({
        label: localized.primaryAction,
        internalLink: detail.internalPrimaryHref ?? "/local-tokyo",
        provider: "other",
        product: "hotel",
        placement: "stay_area_detail_primary",
        variant: "primary",
        category: "hotel",
      });

  return (
    <main className="page-shell min-h-screen text-slate-950">
      <SiteHeader />
      <Container className="py-8 md:py-12">
        <Breadcrumb items={[
          { label: t("breadcrumb.parent"), href: "/areas-to-stay" },
          { label: t("breadcrumb.hub"), href: "/areas-to-stay/tokyo-first-time" },
          { label: localized.breadcrumbLabel },
        ]} />

        <section className="mt-5 overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={image} alt={t("heroImageAlt", { area: localized.areaLabel })} className="aspect-[16/9] max-h-[380px] w-full object-cover" />
          ) : (
            <div className="h-64 border-b border-slate-100 bg-[linear-gradient(135deg,#eef6fb,#fff_50%,#f0fbf6)]" aria-hidden="true" />
          )}
          <div className="grid gap-5 p-6 md:grid-cols-[minmax(0,1fr)_340px] md:p-8">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#106b43]">{localized.areaLabel}</p>
              <h1 className="mt-3 text-3xl font-semibold leading-tight text-slate-950 md:text-5xl">{localized.title}</h1>
              <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-600 md:text-base">{localized.subtitle}</p>
            </div>
            <div>
              <ProviderChoiceCTA
                actionLabel={localized.primaryAction}
                providers={primaryChoices}
                pagePath={pagePath}
                locale={locale}
                area={localized.areaLabel}
              />
              <Link href="/areas-to-stay/tokyo-first-time" className="mt-3 inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl border border-[#2E7D5B] bg-[#2E7D5B] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#246449]">
                {t("backToHub")}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-[22px] border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-950">{t("quickAnswer.title")}</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl border border-emerald-100 bg-white p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-emerald-700">{t("quickAnswer.stayHereIf")}</p>
              <p className="mt-1 text-sm leading-6 text-slate-700">{localized.bestFor}</p>
            </div>
            <div className="rounded-2xl border border-amber-100 bg-white p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-amber-700">{t("quickAnswer.avoidIf")}</p>
              <p className="mt-1 text-sm leading-6 text-slate-700">{localized.avoid}</p>
            </div>
            <div className="rounded-2xl border border-sky-100 bg-white p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-sky-700">{t("quickAnswer.bestMicroAreas")}</p>
              <p className="mt-1 text-sm leading-6 text-slate-700">{localized.bestMicroAreas}</p>
            </div>
          </div>
        </section>

        {detail.mapId ? (
          <section className="mt-8">
            <StayAreaMap mapId={detail.mapId} priority />
          </section>
        ) : null}

        <section className="mt-10">
          <h2 className="text-2xl font-semibold text-slate-950">{t("microAreaTitle")}</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {localized.microAreas.map((microArea) => (
              <div key={microArea.name} className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-950">{microArea.name}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{microArea.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-10 rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-950">{t("hotelComparisonTitle")}</h2>
          <ProviderChoiceCTA
            actionLabel={localized.primaryAction}
            providers={primaryChoices}
            pagePath={pagePath}
            locale={locale}
            area={localized.areaLabel}
            className="mt-4"
          />
        </section>

        <section className="mt-10 rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-sky-700">{t("examples.eyebrow")}</p>
              <h2 className="mt-1 text-xl font-semibold text-slate-950">{t("examples.title")}</h2>
            </div>
            <Link href="/local-hotel-picks" className="text-sm font-semibold text-[#106b43] underline underline-offset-4">
              {t("examples.more")}
            </Link>
          </div>
          {examples.length > 0 ? (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {examples.map((hotel) => {
                const provider = "trip";
                const href = hotel.tripUrl;
                return (
                  <div key={hotel.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm font-semibold text-slate-950">{hotel.name}</p>
                    <p className="mt-1 text-xs leading-5 text-slate-600">{t("examples.cardNote")}</p>
                    <ProviderButton
                      provider={provider}
                      href={href}
                      trackingHref={href}
                      placement="stay_area_detail_hotel_example"
                      pagePath={pagePath}
                      locale={locale}
                      linkId={`hotelPick.${hotel.id}.${provider}`}
                      product="hotel"
                      area={localized.areaLabel}
                      hotelName={hotel.name}
                      fullWidth
                      className="mt-3"
                    >
                      {hotel.label}
                    </ProviderButton>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
              {t("examples.empty")}
            </p>
          )}
        </section>

        <section className="mt-10 rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-950">{t("faqTitle")}</h2>
          <dl className="mt-4 grid gap-3 md:grid-cols-2">
            {localized.faqs.map((faq) => (
              <div key={faq.question} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <dt className="font-semibold text-slate-950">{faq.question}</dt>
                <dd className="mt-1 text-sm leading-6 text-slate-600">{faq.answer}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="mt-10">
          <h2 className="text-lg font-semibold text-slate-950">{t("continue.title")}</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-4">
            <TrackedCtaLink href="/areas-to-stay/tokyo-first-time" placement="next_steps" label={t("continue.hub")} pagePath={pagePath} locale={locale} category="hotel" className={filledNextStepClass}>
              {t("continue.hub")}
            </TrackedCtaLink>
            <TrackedCtaLink href="/local-hotel-picks" placement="next_steps" label={t("continue.localPicks")} pagePath={pagePath} locale={locale} category="hotel" className={filledNextStepClass}>
              {t("continue.localPicks")}
            </TrackedCtaLink>
            <TrackedCtaLink href="/plan-your-trip" placement="next_steps" label={t("continue.plan")} pagePath={pagePath} locale={locale} className={filledNextStepClass}>
              {t("continue.plan")}
            </TrackedCtaLink>
            <TrackedCtaLink href={detail.airportHref ?? "/airport-transfers"} placement="next_steps" label={t("continue.airport")} pagePath={pagePath} locale={locale} category="transfer" className={filledNextStepClass}>
              {t("continue.airport")}
            </TrackedCtaLink>
          </div>
        </section>
      </Container>
      <SiteFooter />
    </main>
  );
}
