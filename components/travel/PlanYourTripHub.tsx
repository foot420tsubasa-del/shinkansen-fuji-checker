"use client";

import { ArrowRight, Bed, CalendarDays, ExternalLink, Landmark, Luggage, MapPinned, Plane, ShieldCheck, Signpost, Train, Wifi } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { HotelBaseNextStep } from "@/components/content/HotelBaseNextStep";
import { TrackedAffiliateLink } from "@/components/analytics/TrackedAffiliateLink";
import { TrackedCtaLink } from "@/components/analytics/TrackedCtaLink";
import { ProviderChoiceCTA, type ProviderChoiceButton } from "@/components/affiliate/ProviderChoiceCTA";
import { getAffUrl } from "@/src/affiliateLinks";
import { getAgodaHotelAreaUrl, getHotelLink, getTripHotelConfig, type HotelAreaKey } from "@/lib/hotel-links";
import { AFFILIATE_REL } from "@/lib/link-rel";
import type { AffiliateClickParams } from "@/lib/analytics";

type AffiliateProduct = {
  label: string;
  description?: string;
  linkId: string;
  category: AffiliateClickParams["category"];
  provider?: AffiliateClickParams["provider"];
  product: string;
  adid?: string;
  routeType?: string;
};

type TokyoBaseCard = {
  key: TokyoBaseCardKey;
  title: string;
  area: string;
  reason: string;
  href: string;
  detailLabel: string;
  hotelKeys?: HotelAreaKey[];
  hotelActionLabel?: string;
  extraDetailHref?: string;
  extraDetailLabel?: string;
};

type CityCard = {
  key: CityCardKey;
  title: string;
  description: string;
  linkId: string;
  cta: string;
  imageSrc?: string;
  imageAlt?: string;
};

type TokyoBaseCardKey = "shinjuku" | "uenoAsakusa" | "tokyoStation" | "eastTokyo";
type CityCardKey = "tokyo" | "kyoto" | "osaka" | "fujiHakone";

const shinkansenTicket = getAffUrl("shinkansenTicket");
const jrPass = getAffUrl("jrPass");
const esim = getAffUrl("esim");
const airportTransfer = getAffUrl("airportTransfer");
const insurance = getAffUrl("insurance");
const omioJapanTrain = getAffUrl("omioJapanTrain");
const omioRouteCompare = omioJapanTrain ?? getAffUrl("omioShinkansen");
const omioRouteCompareLinkId = omioJapanTrain ? "omioJapanTrain" : "omioShinkansen";

function providerChoices(...providers: Array<ProviderChoiceButton | null | undefined>) {
  return providers.filter((provider): provider is ProviderChoiceButton => Boolean(provider));
}

const tokyoBaseCardConfigs: ReadonlyArray<
  Pick<TokyoBaseCard, "key" | "href"> &
    Partial<Pick<TokyoBaseCard, "extraDetailHref">> & {
      hotelKeys?: readonly HotelAreaKey[];
    }
> = [
  {
    key: "shinjuku",
    href: "/areas-to-stay/tokyo/shinjuku",
    hotelKeys: ["shinjuku"],
  },
  {
    key: "uenoAsakusa",
    href: "/areas-to-stay/tokyo/ueno",
    extraDetailHref: "/areas-to-stay/tokyo/asakusa",
    hotelKeys: ["ueno", "asakusa"],
  },
  {
    key: "tokyoStation",
    href: "/areas-to-stay/tokyo-station-vs-shinjuku",
    hotelKeys: ["tokyoStation"],
  },
  {
    key: "eastTokyo",
    href: "/local-tokyo",
  },
] as const;

const cityCardConfigs = [
  {
    key: "tokyo",
    linkId: "cityTokyo",
    imageSrc: "/images/stay/tokyo/tokyo-stay-hero.png",
  },
  {
    key: "kyoto",
    linkId: "cityKyoto",
    imageSrc: "/images/Kyoto.png",
  },
  {
    key: "osaka",
    linkId: "cityOsaka",
    imageSrc: "/images/Osaka.png",
  },
  {
    key: "fujiHakone",
    linkId: "hakone",
    imageSrc: "/images/Kawaguchiko.png",
  },
] as const satisfies ReadonlyArray<Omit<CityCard, "title" | "description" | "cta" | "imageAlt">>;

function AffiliateButton({
  item,
  href,
  placement,
  locale,
  className,
  children,
}: {
  item: AffiliateProduct;
  href: string;
  placement: AffiliateClickParams["placement"];
  locale: string;
  className: string;
  children?: React.ReactNode;
}) {
  return (
    <TrackedAffiliateLink
      href={href}
      target="_blank"
      rel={AFFILIATE_REL}
      category={item.category}
      provider={item.provider}
      placement={placement}
      pagePath="/plan-your-trip"
      locale={locale}
      label={item.label}
      linkId={item.linkId}
      product={item.product}
      adid={item.adid}
      routeType={item.routeType}
      className={className}
    >
      {children ?? item.label}
    </TrackedAffiliateLink>
  );
}

function hotelProviderChoicesForKey(hotelKey: HotelAreaKey) {
  const hotel = getHotelLink(hotelKey);
  const config = getTripHotelConfig(hotelKey);
  const tripHref = hotel.provider === "trip" ? hotel.href : config.tripUrl;
  const tripTrackingHref = hotel.provider === "trip" ? hotel.trackingHref : config.tripUrl;
  const agodaLink = getAgodaHotelAreaUrl(hotelKey);

  return providerChoices(
    tripHref
      ? {
          label: "Trip.com",
          href: tripHref,
          trackingHref: tripTrackingHref,
          provider: "trip",
          product: "hotel",
          linkId: `hotelArea.${hotelKey}.trip`,
          placement: "plan_trip_hotel_cards",
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
          placement: "plan_trip_hotel_cards",
          variant: "secondary",
          category: "hotel",
        }
      : null,
  );
}

function HotelProviderChoice({
  hotelKeys,
  actionLabel,
  areaLabel,
  locale,
}: {
  hotelKeys: HotelAreaKey[];
  actionLabel: string;
  areaLabel: string;
  locale: string;
}) {
  const providers =
    hotelKeys.length === 1
      ? hotelProviderChoicesForKey(hotelKeys[0])
      : hotelKeys.flatMap((hotelKey) => hotelProviderChoicesForKey(hotelKey)).slice(0, 2);

  if (providers.length === 0) return null;

  return (
    <ProviderChoiceCTA
      actionLabel={actionLabel}
      pagePath="/plan-your-trip"
      locale={locale}
      area={areaLabel}
      className="mt-auto"
      providers={providers}
    />
  );
}

export function PlanYourTripHub() {
  const locale = useLocale();
  const t = useTranslations("planYourTrip");
  const bookingOrderItems = t.raw("bookingOrder.items") as string[];
  const singleTicketBullets = t.raw("rail.singleTicket.bullets") as string[];
  const jrPassBullets = t.raw("rail.jrPass.bullets") as string[];
  const tokyoBaseCards: TokyoBaseCard[] = tokyoBaseCardConfigs.map((base) => ({
    ...base,
    hotelKeys: base.hotelKeys ? [...base.hotelKeys] : undefined,
    title: t(`hotel.cards.${base.key}.title`),
    area: t(`hotel.cards.${base.key}.area`),
    reason: t(`hotel.cards.${base.key}.reason`),
    detailLabel: t(`hotel.cards.${base.key}.detailLabel`),
    extraDetailLabel: base.extraDetailHref ? t(`hotel.cards.${base.key}.extraDetailLabel`) : undefined,
    hotelActionLabel: base.hotelKeys ? t(`hotel.cards.${base.key}.hotelActionLabel`) : undefined,
  }));
  const cityCards: CityCard[] = cityCardConfigs.map((city) => ({
    ...city,
    title: t(`activities.cards.${city.key}.title`),
    description: t(`activities.cards.${city.key}.description`),
    cta: t(`activities.cards.${city.key}.cta`),
    imageAlt: t(`activities.cards.${city.key}.imageAlt`),
  }));

  return (
    <main className="page-shell min-h-screen text-slate-950">
      <Container className="py-8 md:py-12">
        <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-stretch">
          <Card className="p-6 md:p-9" tone="navy">
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-sky-200">{t("hero.eyebrow")}</p>
            <h1 className="mt-3 max-w-4xl text-3xl font-semibold leading-tight text-white md:text-5xl">
              {t("hero.title")}
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300 md:text-base">
              {t("hero.subtitle")}
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              {shinkansenTicket ? (
                <AffiliateButton
                  href={shinkansenTicket}
                  placement="plan_trip_hero"
                  item={{
                    label: t("hero.shinkansenCta"),
                    linkId: "shinkansenTicket",
                    category: "train",
                    provider: "klook",
                    product: "shinkansen_ticket",
                    adid: "1265303",
                    routeType: "simple-shinkansen",
                  }}
                  locale={locale}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[14px] border border-[#ff7a00] bg-[#ff7a00] px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#e66700]"
                >
                  {t("hero.shinkansenCta")}
                  <ExternalLink className="h-4 w-4" />
                </AffiliateButton>
              ) : null}
              <TrackedCtaLink
                href="/planner"
                placement="plan_trip_hero"
                label={t("hero.plannerCta")}
                category="navigation"
                pagePath="/plan-your-trip"
                locale={locale}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[14px] border border-slate-500 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/15"
              >
                {t("hero.plannerCta")}
                <ArrowRight className="h-4 w-4" />
              </TrackedCtaLink>
            </div>
          </Card>

          <Card className="flex flex-col justify-between p-5" tone="accent">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#106b43]">{t("bookingOrder.eyebrow")}</p>
              <ol className="mt-4 space-y-3 text-sm text-slate-700">
                {bookingOrderItems.map((item, index) => (
                  <li key={item} className="flex gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-xs font-bold text-[#106b43]">{index + 1}</span>
                    <span className="leading-6">{item}</span>
                  </li>
                ))}
              </ol>
            </div>
            <Link href="/guide" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#106b43] underline underline-offset-4">
              {t("bookingOrder.guideCta")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Card>
        </section>

        <section className="mt-8 rounded-[22px] border border-emerald-100 bg-emerald-50/70 p-5 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-950">{t("bookingOrder.routeDecisionTitle")}</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-700">{t("bookingOrder.routeDecisionBody")}</p>
        </section>

        <HotelBaseNextStep
          sourcePage="/plan-your-trip"
          locale={locale}
          placement="plan_trip_hotel_base_next_step"
          title="Do not book hotels before the route shape is clear"
          body="Before choosing hotel names, decide your arrival airport, first-night area, Shinkansen day, luggage plan, and whether Kyoto, Osaka, Mt. Fuji, or Disney affects your base."
          primaryLabel="Compare Tokyo station areas"
          secondaryLabel="See local hotel examples"
          className="mt-6"
        />

        <section className="mt-10">
          <div className="max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#106b43]">{t("rail.eyebrow")}</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">{t("rail.title")}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{t("rail.subtitle")}</p>
          </div>
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <Card className="p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-orange-100 bg-[#fff3e7] text-[#b44b00]">
                  <Train className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-950">{t("rail.singleTicket.title")}</h3>
                  <p className="mt-1 text-sm text-slate-500">{t("rail.singleTicket.summary")}</p>
                </div>
              </div>
              <ul className="mt-4 space-y-2 text-sm leading-6 text-slate-600">
                {singleTicketBullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
              <div className="mt-5">
                <ProviderChoiceCTA
                  actionLabel={t("rail.singleTicket.action")}
                  description={t("rail.singleTicket.description")}
                  pagePath="/plan-your-trip"
                  locale={locale}
                  routeType="simple-shinkansen"
                  providers={providerChoices(
                    shinkansenTicket
                      ? { label: "Klook", href: shinkansenTicket, provider: "klook", product: "shinkansen_ticket", adid: "1265303", linkId: "shinkansenTicket", placement: "plan_trip_rail_showdown", variant: "primary", category: "train" }
                      : null,
                    omioRouteCompare
                      ? { label: "Omio", href: omioRouteCompare, provider: "omio", product: "route_compare", linkId: omioRouteCompareLinkId, placement: "plan_trip_rail_showdown", variant: "secondary", category: "train" }
                      : null,
                  )}
                />
              </div>
            </Card>

            <Card className="p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#9fd7bd] bg-[#f0fbf6] text-[#106b43]">
                  <Landmark className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-950">{t("rail.jrPass.title")}</h3>
                  <p className="mt-1 text-sm text-slate-500">{t("rail.jrPass.summary")}</p>
                </div>
              </div>
              <ul className="mt-4 space-y-2 text-sm leading-6 text-slate-600">
                {jrPassBullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
              <ProviderChoiceCTA
                actionLabel={t("rail.jrPass.action")}
                description={t("rail.jrPass.description")}
                pagePath="/plan-your-trip"
                locale={locale}
                routeType="multi-city-jr"
                className="mt-5"
                providers={providerChoices(
                  jrPass
                    ? { label: "Klook", href: jrPass, provider: "klook", product: "jr_pass", adid: "1165791", linkId: "jrPass", placement: "plan_trip_rail_showdown", variant: "primary", category: "train" }
                    : null,
                )}
              />
            </Card>
          </div>
        </section>

        <section className="mt-12">
          <div className="max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#106b43]">{t("hotel.eyebrow")}</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">{t("hotel.title")}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {t("hotel.subtitle")}
            </p>
          </div>
          <TrackedCtaLink
            href="/areas-to-stay/tokyo-first-time"
            placement="plan_trip_stay_hub"
            label={t("hotel.hubCta")}
            category="hotel"
            pagePath="/plan-your-trip"
            locale={locale}
            className="mt-5 inline-flex min-h-12 items-center justify-center gap-2 rounded-[14px] border border-[#168a56] bg-[#168a56] px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#0f6f45]"
          >
            {t("hotel.hubCta")}
            <ArrowRight className="h-4 w-4" />
          </TrackedCtaLink>
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {tokyoBaseCards.map((base) => (
              <Card key={base.title} className="flex flex-col p-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#d5e5ef] bg-[#eef6fb] text-[#082653]">
                  <Bed className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-slate-950">{base.title}</h3>
                <p className="mt-1 text-sm font-semibold text-slate-800">→ {base.area}</p>
                <p className="mt-2 min-h-[96px] text-sm leading-6 text-slate-600">{base.reason}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <TrackedCtaLink
                    href={base.href}
                    placement="plan_trip_stay_hub"
                    label={base.detailLabel}
                    category="hotel"
                    pagePath="/plan-your-trip"
                    locale={locale}
                    className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-xl border border-[#168a56] bg-[#168a56] px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#0f6f45]"
                  >
                    {base.detailLabel}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </TrackedCtaLink>
                  {base.extraDetailHref && base.extraDetailLabel ? (
                    <TrackedCtaLink
                      href={base.extraDetailHref}
                      placement="plan_trip_stay_hub"
                      label={base.extraDetailLabel}
                      category="hotel"
                      pagePath="/plan-your-trip"
                      locale={locale}
                      className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-xl border border-[#168a56] bg-[#168a56] px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#0f6f45]"
                    >
                      {base.extraDetailLabel}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </TrackedCtaLink>
                  ) : null}
                </div>
                {base.hotelKeys && base.hotelActionLabel ? (
                  <HotelProviderChoice
                    hotelKeys={base.hotelKeys}
                    actionLabel={base.hotelActionLabel}
                    areaLabel={`Tokyo: ${base.area}`}
                    locale={locale}
                  />
                ) : null}
              </Card>
            ))}
          </div>
        </section>

        <section className="mt-12">
          <div className="max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#106b43]">{t("arrival.eyebrow")}</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">{t("arrival.title")}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{t("arrival.subtitle")}</p>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {esim ? (
              <Card className="p-5">
                <Wifi className="h-6 w-6 text-[#106b43]" />
                <h3 className="mt-4 text-lg font-semibold text-slate-950">{t("arrival.esim.title")}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{t("arrival.esim.description")}</p>
                <AffiliateButton
                  href={esim}
                  placement="plan_trip_arrival_cards"
                  item={{ label: t("arrival.esim.cta"), linkId: "esim", category: "esim", provider: "klook", product: "esim", adid: "1166001" }}
                  locale={locale}
                  className="mt-5 inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-[#ff7a00] bg-[#ff7a00] px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#e66700]"
                >
                  {t("arrival.esim.cta")}
                  <ExternalLink className="h-4 w-4" />
                </AffiliateButton>
              </Card>
            ) : null}
            {airportTransfer ? (
              <Card className="p-5">
                <Plane className="h-6 w-6 text-[#106b43]" />
                <h3 className="mt-4 text-lg font-semibold text-slate-950">{t("arrival.airport.title")}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{t("arrival.airport.description")}</p>
                <AffiliateButton
                  href={airportTransfer}
                  placement="plan_trip_arrival_cards"
                  item={{ label: t("arrival.airport.cta"), linkId: "airportTransfer", category: "transfer", provider: "klook", product: "airport_transfer", adid: "1165996" }}
                  locale={locale}
                  className="mt-5 inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-[#ff7a00] bg-[#ff7a00] px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#e66700]"
                >
                  {t("arrival.airport.cta")}
                  <ExternalLink className="h-4 w-4" />
                </AffiliateButton>
              </Card>
            ) : null}
            <Card className="p-5">
              <Luggage className="h-6 w-6 text-[#106b43]" />
              <h3 className="mt-4 text-lg font-semibold text-slate-950">{t("arrival.station.title")}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{t("arrival.station.description")}</p>
              <TrackedCtaLink
                href="/station-practice"
                placement="plan_trip_arrival_cards"
                label={t("arrival.station.cta")}
                category="station_practice"
                pagePath="/plan-your-trip"
                locale={locale}
                className="mt-5 inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-[#168a56] bg-[#168a56] px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#0f6f45]"
              >
                {t("arrival.station.cta")}
                <ArrowRight className="h-4 w-4" />
              </TrackedCtaLink>
            </Card>
          </div>
        </section>

        <section className="mt-12">
          <div className="max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#106b43]">{t("activities.eyebrow")}</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">{t("activities.title")}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{t("activities.subtitle")}</p>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {cityCards.map((city) => {
              const url = getAffUrl(city.linkId);
              if (!url) return null;
              return (
                <Card key={city.title} className="overflow-hidden p-0">
                  {city.imageSrc ? (
                    // Future city images can be added through cityCards without changing the card layout.
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={city.imageSrc} alt={city.imageAlt ?? city.title} className="aspect-[16/9] w-full object-cover" loading="lazy" />
                  ) : (
                    <div className="aspect-[16/9] border-b border-slate-100 bg-[linear-gradient(135deg,#eef6fb,#f8fbff_48%,#f0fbf6)]" aria-hidden="true" />
                  )}
                  <div className="p-5">
                  <h3 className="text-lg font-semibold text-slate-950">{city.title}</h3>
                  <p className="mt-2 min-h-[72px] text-sm leading-6 text-slate-600">{city.description}</p>
                  <AffiliateButton
                    href={url}
                    placement="plan_trip_activity_cards"
                    item={{ label: city.cta, linkId: city.linkId, category: "activity", provider: "klook", product: "activity" }}
                  locale={locale}
                    className="mt-5 inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-[#ff7a00] bg-[#ff7a00] px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#e66700]"
                  >
                    {city.cta}
                    <ExternalLink className="h-4 w-4" />
                  </AffiliateButton>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>

        <section className="mt-12">
          <div className="max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">{t("optional.eyebrow")}</p>
            <h2 className="mt-2 text-xl font-semibold text-slate-950">{t("optional.title")}</h2>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-4">
            {insurance ? (
              <AffiliateButton
                href={insurance}
                placement="plan_trip_activity_cards"
                item={{ label: t("optional.insurance"), linkId: "insurance", category: "insurance", provider: "klook", product: "travel_insurance", adid: "1166002" }}
                locale={locale}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#475569] bg-[#475569] px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#334155]"
              >
                <ShieldCheck className="h-4 w-4" />
                {t("optional.insurance")}
              </AffiliateButton>
            ) : null}
            <TrackedCtaLink href="/station-practice" placement="plan_trip_arrival_cards" label={t("optional.station")} category="station_practice" pagePath="/plan-your-trip" locale={locale} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#111827] bg-[#111827] px-3 py-2 text-sm font-semibold text-[#f6c343] transition-colors hover:bg-[#020617]">
              <Signpost className="h-4 w-4" />
              {t("optional.station")}
            </TrackedCtaLink>
            <TrackedCtaLink href="/command-center" placement="plan_trip_hero" label={t("optional.commandCenter")} category="navigation" pagePath="/plan-your-trip" locale={locale} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#082653] bg-[#082653] px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#061d40]">
              <MapPinned className="h-4 w-4" />
              {t("optional.commandCenter")}
            </TrackedCtaLink>
            <TrackedCtaLink href="/local-tokyo" placement="plan_trip_hotel_cards" label={t("optional.localTokyo")} category="navigation" pagePath="/plan-your-trip" locale={locale} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#106b43] bg-[#106b43] px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#0f6f45]">
              <CalendarDays className="h-4 w-4" />
              {t("optional.localTokyo")}
            </TrackedCtaLink>
          </div>
        </section>
      </Container>
    </main>
  );
}
