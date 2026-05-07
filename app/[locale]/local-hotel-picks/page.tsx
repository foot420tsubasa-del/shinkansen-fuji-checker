import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { SiteHeader } from "../components/SiteHeader";
import { Breadcrumb } from "@/components/content/Breadcrumb";
import { SuggestedNextSteps } from "@/components/content/SuggestedNextSteps";
import { LastCheckedNote } from "@/components/content/LastCheckedNote";
import { SiteLegalLinks } from "@/components/content/SiteLegalLinks";
import { HotelCTA } from "@/components/affiliate/HotelCTA";
import { getHotelLink } from "@/lib/hotel-links";
import { getAlternates } from "@/i18n/hreflang";
import {
  getLocalHotelPicksByCity,
  LOCAL_HOTEL_PICK_CITIES,
} from "@/lib/content/local-hotel-picks";
import { LocalHotelPickCard } from "./LocalHotelPickCard";

type Props = {
  params: Promise<{ locale: string }>;
};

const TRIP_AREA_KEYS_BY_CITY: Record<string, { keys: string[]; text: string }> = {
  Tokyo: {
    keys: ["shinjuku", "ueno", "tokyoStation"],
    text: "Compare wider Tokyo / Shinjuku / Ueno hotels on Trip.com.",
  },
  Kyoto: {
    keys: ["kyotoStation", "gionKawaramachi"],
    text: "Compare wider Kyoto Station / Gion hotels on Trip.com.",
  },
  Osaka: {
    keys: ["namba", "umeda"],
    text: "Compare wider Namba / Umeda hotels on Trip.com.",
  },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: "Japanese Local Hotel Picks for Tokyo, Kyoto and Osaka | fujiseat",
    description:
      "A curated set of hotel picks in Tokyo, Kyoto and Osaka based on Japanese local area logic, including calmer Shinjuku stays, Kyoto Station bases, family-friendly rooms and practical Osaka locations.",
    robots: locale === "en" ? undefined : { index: false, follow: true },
    openGraph: {
      title: "Japanese Local Hotel Picks for Tokyo, Kyoto and Osaka",
      description:
        "A curated set of hotel picks in Tokyo, Kyoto and Osaka based on Japanese local area logic, including calmer Shinjuku stays, Kyoto Station bases, family-friendly rooms and practical Osaka locations.",
      siteName: "fujiseat",
    },
    alternates: getAlternates("/local-hotel-picks", locale),
  };
}

export default async function LocalHotelPicksPage({ params }: Props) {
  const { locale } = await params;
  const pagePath = "/local-hotel-picks";

  return (
    <main className="page-shell min-h-screen text-slate-950">
      <SiteHeader />

      <Container className="py-8 md:py-12">
        <Breadcrumb
          items={[{ label: "Local Hotel Picks" }]}
        />

        <h1 className="mt-4 text-2xl font-semibold text-slate-950 md:text-3xl">
          Japanese Local Hotel Picks
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 md:text-base">
          These are not full hotel rankings.
          They are selected examples that match specific local-area logic.
          Use them as a starting point, then compare exact location, price, and availability before booking.
        </p>
        <p className="mt-2 max-w-3xl text-xs leading-5 text-slate-400">
          These picks are selected examples, not a complete ranking.
        </p>

        <div className="mt-8 space-y-12">
          {LOCAL_HOTEL_PICK_CITIES.map((city) => {
            const picks = getLocalHotelPicksByCity(city);
            const tripConfig = TRIP_AREA_KEYS_BY_CITY[city];
            if (picks.length === 0) return null;

            return (
              <section key={city} id={city.toLowerCase()} className="scroll-mt-24">
                <h2 className="text-xl font-semibold text-slate-950">{city}</h2>

                <div className="mt-4 space-y-4">
                  {picks.map((pick) => (
                    <LocalHotelPickCard
                      key={pick.id}
                      pick={pick}
                      locale={locale}
                      pagePath={pagePath}
                    />
                  ))}
                </div>

                {tripConfig && (
                  <div className="mt-6 rounded-[18px] border border-slate-200 bg-slate-50 p-5">
                    <p className="text-sm font-semibold text-slate-900">Want more choices?</p>
                    <p className="mt-1 text-xs leading-5 text-slate-600">
                      {tripConfig.text}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {tripConfig.keys.map((areaKey) => {
                        const link = getHotelLink(areaKey as Parameters<typeof getHotelLink>[0]);
                        if (!link) return null;
                        return (
                          <HotelCTA
                            key={areaKey}
                            areaName={link.areaName}
                            city={link.city}
                            provider={link.provider}
                            href={link.href}
                            placement="local_hotel_pick_more_options"
                            locale={locale}
                            pagePath={pagePath}
                            label={link.label}
                            trackingHref={link.trackingHref}
                            className="text-xs"
                          />
                        );
                      })}
                    </div>
                  </div>
                )}
              </section>
            );
          })}

          <section className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-500">
              Related guides
            </p>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              {[
                { href: "/areas-to-stay/tokyo-first-time", label: "Where to stay in Tokyo", desc: "First-time area comparison with map." },
                { href: "/areas-to-stay/kyoto-station-vs-gion", label: "Kyoto Station vs Gion", desc: "Pick between convenience and atmosphere." },
                { href: "/areas-to-stay/namba-vs-umeda", label: "Namba vs Umeda", desc: "Compare Osaka's two main hotel zones." },
                { href: "/plan-your-trip", label: "Plan your trip", desc: "Hotels, transport, eSIM, and itineraries." },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex flex-col rounded-2xl border border-slate-200 bg-white p-4 transition-colors hover:border-slate-300 hover:bg-slate-50"
                >
                  <span className="text-sm font-semibold text-slate-900">{item.label}</span>
                  <span className="mt-1 text-xs leading-5 text-slate-500">{item.desc}</span>
                </Link>
              ))}
            </div>
          </section>

          <SuggestedNextSteps currentPageType="stay" locale={locale} />
        </div>

        <footer className="mt-12 border-t border-slate-200 pt-6 text-center text-[10px] text-slate-400">
          <p>fujiseat.com — Japan travel utility hub</p>
          <p className="mt-1">Partner links shown where they match the planning step.</p>
          <p className="mt-2 text-slate-400">
            Hotel availability, rates, and conditions change frequently.
            Always check the latest details on the booking site before making a reservation.
          </p>
          <LastCheckedNote className="mt-3" />
          <SiteLegalLinks className="mt-3 text-slate-400" />
        </footer>
      </Container>
    </main>
  );
}
