import { getTranslations } from "next-intl/server";
import { ProviderButton } from "@/components/ui/ProviderButton";
import { getBookingHotelLink } from "@/lib/booking-hotels";
import design from "@/data/stay-hub-design.json";

export async function StayCityGuides({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: "areasToStayHub" });
  const areaCopy = await getTranslations({ locale, namespace: "firstTimeStayHubs" });

  return design.cities.map((city) => (
    <section key={city.id} id={city.id} tabIndex={-1} className="min-w-0 scroll-mt-24">
      <h3 className="text-xl font-extrabold tracking-[-0.02em] text-ink">{t(`discovery.${city.id}Guides`)}</h3>
      <ul className="mt-2 divide-y divide-slate-200 border-b border-slate-200">
        {city.areas.map((area) => {
          const hotel = locale === "en" && area.hotel ? getBookingHotelLink(area.hotel) : null;
          const name = locale === "en" ? area.name : areaCopy(`${city.id}-first-time.areas.${area.id}.name`);
          const reason = locale === "en" ? area.reason : areaCopy(`${city.id}-first-time.areas.${area.id}.bestFor`);
          return (
            <li key={area.id} className="grid gap-2 py-3.5 sm:grid-cols-[1fr_auto] sm:items-center">
              <div>
                <h4 className="text-base font-bold text-ink">{name}</h4>
                <p className="mt-1 text-sm leading-5 text-slate-700">{reason}</p>
              </div>
              {hotel ? (
                <div className="grid gap-1 sm:justify-items-end">
                  <p className="text-sm font-semibold text-slate-700">{hotel.name}</p>
                  <ProviderButton
                    href={hotel.href}
                    provider="booking_travelpayouts"
                    placement="stay_hub_city_hotel"
                    pagePath="/areas-to-stay"
                    locale={locale}
                    product="hotel"
                    linkId={hotel.linkId}
                    hotelName={hotel.name}
                    area={area.name}
                    city={city.id}
                    fullWidth={false}
                  >
                    {design.hotelLink}
                  </ProviderButton>
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
      {locale === "en" ? <p className="mt-3 text-xs leading-5 text-slate-600">{t("finder.disclosure")}</p> : null}
      {city.id === "kyoto" ? (
        <a href="#stay-finder" className="mt-2 inline-flex min-h-11 items-center text-sm font-semibold text-slate-700 underline underline-offset-4 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2">
          {t("discovery.backToTokyoFinder")}
        </a>
      ) : null}
    </section>
  ));
}
