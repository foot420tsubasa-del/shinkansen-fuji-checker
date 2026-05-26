import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { SiteHeader } from "../components/SiteHeader";
import { Breadcrumb } from "@/components/content/Breadcrumb";
import { SiteFooter } from "@/components/content/SiteFooter";
import { FujiseatAreaLogic } from "@/components/content/FujiseatAreaLogic";
import { TrackedInternalLink } from "@/components/analytics/TrackedInternalLink";
import { getAlternates } from "@/i18n/hreflang";
import {
  getAllLocalHotelPicks,
  getHotelPicksByCity,
  LOCAL_HOTEL_PICK_CITIES,
  type LocalHotelPick,
} from "@/lib/content/local-hotel-picks";
import { HotelPickMatrix } from "./HotelPickMatrix";
import { LocalHotelPickCard } from "./LocalHotelPickCard";
import { getTranslations } from "next-intl/server";

type Props = {
  params: Promise<{ locale: string }>;
};

type TokyoPickGroup = {
  key: string;
  label: string;
  description: string;
  pickIds: string[];
  fallbackHref?: string;
  fallbackLabel?: string;
};

const TOKYO_PICK_GROUPS: TokyoPickGroup[] = [
  {
    key: "calmShinjuku",
    label: "Calm Shinjuku",
    description: "Shinjuku access without sleeping in the loudest nightlife blocks.",
    pickIds: ["yuenShinjuku"],
    fallbackHref: "/areas-to-stay/tokyo/shinjuku",
    fallbackLabel: "See Shinjuku area logic",
  },
  {
    key: "familyGroup",
    label: "Family / group",
    description: "Apartment-style rooms and practical layouts for families or friends.",
    pickIds: ["mimaruShinjukuWest"],
    fallbackHref: "/areas-to-stay/tokyo/shinjuku",
    fallbackLabel: "See Shinjuku area logic",
  },
  {
    key: "nishiShinjuku",
    label: "Practical Nishi-Shinjuku",
    description: "West-side Shinjuku examples for calmer logistics and first Tokyo stays.",
    pickIds: ["daiwaRoynetNishiShinjuku", "theKnotShinjuku"],
    fallbackHref: "/areas-to-stay/tokyo/shinjuku",
    fallbackLabel: "See Shinjuku area logic",
  },
  {
    key: "eastTokyo",
    label: "East Tokyo personality stay",
    description: "A more local-feeling base for travelers who care about cafes, streets, and atmosphere.",
    pickIds: ["citanHostel"],
    fallbackHref: "/local-tokyo",
    fallbackLabel: "See East Tokyo area logic",
  },
  {
    key: "tokyoStation",
    label: "Tokyo Station logistics",
    description: "Best when early Shinkansen, luggage, and transfers matter more than nightlife.",
    pickIds: [],
    fallbackHref: "/areas-to-stay/tokyo-station-vs-shinjuku",
    fallbackLabel: "See Tokyo Station area logic",
  },
];

const filledPlanningLinkClass =
  "flex flex-col rounded-2xl border border-[#168a56] bg-[#168a56] p-4 text-white transition-colors hover:bg-[#0f6f45]";

const cityPageCards: Record<string, { href: string; title: string; body: string }> = {
  Tokyo: {
    href: "/local-hotel-picks/tokyo",
    title: "Tokyo Local Hotel Picks",
    body: "Examples by Shinjuku calm, East Tokyo, Tokyo Station logistics, and family/group layout.",
  },
  Kyoto: {
    href: "/local-hotel-picks/kyoto",
    title: "Kyoto Local Hotel Picks",
    body: "Examples by Kyoto Station logistics, classic Kyoto atmosphere, and quieter practical bases.",
  },
  Osaka: {
    href: "/local-hotel-picks/osaka",
    title: "Osaka Local Hotel Picks",
    body: "Examples by Namba food/nightlife, Umeda transport, Shin-Osaka logic, and family/group layout.",
  },
};

function pickMapById(picks: LocalHotelPick[]) {
  return new Map(picks.map((pick) => [pick.id, pick]));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "localHotelPicks.page.meta" });

  return {
    title: t("title"),
    description: t("description"),
    robots: locale === "en" ? undefined : { index: false, follow: true },
    openGraph: {
      title: t("ogTitle"),
      description: t("ogDescription"),
      siteName: "fujiseat",
    },
    alternates: getAlternates("/local-hotel-picks", locale),
  };
}

export default async function LocalHotelPicksPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "localHotelPicks" });
  const pagePath = "/local-hotel-picks";
  const allPicksById = pickMapById(getAllLocalHotelPicks());
  const cityLabels = t.raw("page.cityLabels") as Record<string, string>;
  const planningLinks = t.raw("page.continue.links") as Array<{ href: string; label: string; desc: string }>;

  function pickCopy(pick: LocalHotelPick) {
    return t.raw(`picks.${pick.id}`) as {
      bestFor: string;
      localReason: string;
      notIdealFor: string;
      tags: string[];
    };
  }

  return (
    <main className="page-shell min-h-screen text-slate-950">
      <SiteHeader />

      <Container className="py-8 md:py-12">
        <Breadcrumb
          items={[{ label: t("page.breadcrumb") }]}
        />

        <section className="mt-4 rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#106b43]">{t("page.hero.eyebrow")}</p>
          <h1 className="mt-3 text-3xl font-semibold leading-tight text-slate-950 md:text-5xl">
            {t("page.hero.title")}
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-600 md:text-base">
            {t("page.hero.subtitle")}
          </p>
          <nav className="mt-6 flex flex-wrap gap-2" aria-label="Hotel pick city tabs">
            {LOCAL_HOTEL_PICK_CITIES.map((city) => (
              <a key={city} href={`#${city.toLowerCase()}`} className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-700 transition-colors hover:border-emerald-200 hover:bg-emerald-50 hover:text-[#106b43]">
                {cityLabels[city] ?? city}
              </a>
            ))}
          </nav>
        </section>

        <section className="mt-6 rounded-[22px] border border-emerald-100 bg-emerald-50/70 p-5 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-950">How to use these hotel examples</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-700">
            These are not rankings. Use them as practical examples of area logic: quieter Shinjuku, easier Narita access, apartment-style family rooms, Kyoto station logistics, or Osaka food/nightlife bases. Always check the latest price, room size, and bed setup before booking.
          </p>
        </section>

        <FujiseatAreaLogic
          sourcePage={pagePath}
          placement="local_hotel_picks_area_logic"
          locale={locale}
          className="mt-6"
        />

        <section className="mt-6 rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="max-w-3xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#106b43]">City pages</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">Open hotel examples by city</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Use the city pages after choosing the broad city and station-area logic. They are still examples, not rankings.
            </p>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {LOCAL_HOTEL_PICK_CITIES.map((city) => {
              const card = cityPageCards[city];
              return (
                <TrackedInternalLink
                  key={city}
                  href={card.href}
                  sourcePage={pagePath}
                  placement="local_hotel_picks_city_pages"
                  label={card.title}
                  locale={locale}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition-colors hover:border-emerald-200 hover:bg-emerald-50"
                >
                  <span className="text-sm font-semibold text-slate-950">{card.title}</span>
                  <span className="mt-1 block text-xs leading-5 text-slate-600">{card.body}</span>
                  <span className="mt-3 block text-xs font-semibold text-[#106b43]">Open {city} examples →</span>
                </TrackedInternalLink>
              );
            })}
          </div>
        </section>

        <section id="hotel-examples-matrix" className="mt-6 rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="max-w-3xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#106b43]">Hotel examples</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">Hotel examples matrix</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              These are not rankings. Use this matrix to compare practical hotel examples by area logic, room style,
              and travel situation before checking live prices.
            </p>
          </div>
          <HotelPickMatrix picks={getAllLocalHotelPicks()} locale={locale} pagePath={pagePath} />
        </section>

        <div className="mt-8 space-y-12">
          <section id="tokyo" className="scroll-mt-24">
            <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">{cityLabels.Tokyo}</p>
                <h2 className="mt-1 text-2xl font-semibold text-slate-950">{t("page.tokyo.title")}</h2>
              </div>
              <Link href="/areas-to-stay/tokyo-first-time" className="text-sm font-semibold text-[#106b43] underline underline-offset-4">
                {t("page.tokyo.guideLink")}
              </Link>
            </div>

            <div className="mt-5 space-y-6">
              {TOKYO_PICK_GROUPS.map((group) => {
                const picks = group.pickIds
                  .map((id) => allPicksById.get(id))
                  .filter(Boolean) as LocalHotelPick[];

                return (
                  <section key={group.key} className="rounded-[22px] border border-slate-200 bg-slate-50/80 p-4 md:p-5">
                    <div className="flex flex-col justify-between gap-2 md:flex-row md:items-end">
                      <div>
                        <h3 className="text-base font-semibold text-slate-950">{t(`page.tokyo.groups.${group.key}.label`)}</h3>
                        <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-600">{t(`page.tokyo.groups.${group.key}.description`)}</p>
                      </div>
                      {group.fallbackHref && group.fallbackLabel ? (
                        <Link href={group.fallbackHref} className="text-xs font-semibold text-[#106b43] underline underline-offset-4">
                          {t(`page.tokyo.groups.${group.key}.fallbackLabel`)}
                        </Link>
                      ) : null}
                    </div>

                    {picks.length > 0 ? (
                      <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {picks.map((pick) => (
                          <LocalHotelPickCard
                            key={pick.id}
                            pick={pick}
                            locale={locale}
                            pagePath={pagePath}
                            groupLabel={t(`page.tokyo.groups.${group.key}.label`)}
                            copy={pickCopy(pick)}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="mt-4 rounded-[18px] border border-dashed border-slate-300 bg-white">
                        <div className="p-4">
                          <p className="text-sm font-semibold text-slate-900">{t("page.empty.title")}</p>
                          <p className="mt-1 text-xs leading-5 text-slate-600">
                            {t("page.empty.body")}
                          </p>
                        </div>
                      </div>
                    )}
                  </section>
                );
              })}
            </div>
          </section>

          {LOCAL_HOTEL_PICK_CITIES.filter((city) => city !== "Tokyo").map((city) => {
            const picks = getHotelPicksByCity(city);
            if (picks.length === 0) return null;

            return (
              <section key={city} id={city.toLowerCase()} className="scroll-mt-24">
                <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">{cityLabels[city] ?? city}</p>
                    <h2 className="mt-1 text-2xl font-semibold text-slate-950">{t("page.citySection.title", { city: cityLabels[city] ?? city })}</h2>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t(`page.citySection.intros.${city}`)}</p>
                  </div>
                  {city === "Kyoto" ? (
                    <Link href="/areas-to-stay/kyoto-station-vs-gion" className="text-sm font-semibold text-[#106b43] underline underline-offset-4">
                      {t("page.citySection.kyotoGuide")}
                    </Link>
                  ) : (
                    <Link href="/areas-to-stay/namba-vs-umeda" className="text-sm font-semibold text-[#106b43] underline underline-offset-4">
                      {t("page.citySection.osakaGuide")}
                    </Link>
                  )}
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {picks.map((pick) => (
                    <LocalHotelPickCard
                      key={pick.id}
                      pick={pick}
                      locale={locale}
                      pagePath={pagePath}
                      groupLabel={pick.area}
                      copy={pickCopy(pick)}
                    />
                  ))}
                </div>
              </section>
            );
          })}

          <section className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-500">
              {t("page.continue.eyebrow")}
            </p>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              {planningLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={filledPlanningLinkClass}
                >
                  <span className="text-sm font-semibold text-white">{item.label}</span>
                  <span className="mt-1 text-xs leading-5 text-white/80">{item.desc}</span>
                </Link>
              ))}
            </div>
          </section>
        </div>

      </Container>
      <SiteFooter />
    </main>
  );
}
