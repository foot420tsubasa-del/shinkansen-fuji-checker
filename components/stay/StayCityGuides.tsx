import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { ProviderButton } from "@/components/ui/ProviderButton";
import { getBookingHotelLink } from "@/lib/booking-hotels";
import design from "@/data/stay-hub-design.json";

// English only, like the activity page they point to.
const ACTIVITY_LINKS: Record<string, string> = {
  kyoto: "teamLab Biovortex is a 7-minute walk from Kyoto Station",
  osaka: "Going to Universal Studios Japan? What to buy first",
};

/**
 * Kyoto and Osaka, drawn as stops on a line: every area here is named after
 * the station it sits on, so the list reads like the route map a traveler
 * will actually use. The hotel pick hangs off its stop.
 */
export async function StayCityGuides({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: "areasToStayHub" });
  const areaCopy = await getTranslations({ locale, namespace: "firstTimeStayHubs" });

  return design.cities.map((city) => {
    const photo = design.destinations.find((d) => d.id === city.id);
    return (
      <section key={city.id} id={city.id} tabIndex={-1} className="min-w-0 scroll-mt-24 overflow-hidden rounded-[22px] border border-slate-200 bg-white" aria-labelledby={`${city.id}-guides-heading`}>
        <div className="relative h-28 bg-slate-200 sm:h-32">
          {photo ? (
            <Image src={photo.image} alt="" fill sizes="(min-width: 1280px) 560px, (min-width: 640px) 90vw, 100vw" className="object-cover" style={{ objectPosition: "50% 62%" }} />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/30 to-transparent" aria-hidden="true" />
          <h3 id={`${city.id}-guides-heading`} className="absolute bottom-3 left-5 text-[24px] font-extrabold tracking-[-0.02em] text-white">
            {t(`discovery.${city.id}Guides`)}
          </h3>
        </div>

        <ol className="relative px-5 pb-2 pt-5">
          {/* The line itself. */}
          <span className="absolute bottom-6 left-[29px] top-7 w-[3px] rounded-full bg-ink/15" aria-hidden="true" />
          {city.areas.map((area) => {
            const hotel = locale === "en" && area.hotel ? getBookingHotelLink(area.hotel) : null;
            const name = locale === "en" ? area.name : areaCopy(`${city.id}-first-time.areas.${area.id}.name`);
            const reason = locale === "en" ? area.reason : areaCopy(`${city.id}-first-time.areas.${area.id}.bestFor`);
            return (
              <li key={area.id} className="relative grid grid-cols-[20px_1fr] gap-x-4 pb-6">
                <span className={`relative z-10 mt-1 h-5 w-5 rounded-full border-[3px] bg-white ${hotel ? "border-fuji" : "border-ink"}`} aria-hidden="true" />
                <div>
                  <h4 className="text-[17px] font-extrabold leading-6 text-ink">{name}</h4>
                  <p className="mt-0.5 text-[14.5px] leading-6 text-slate-700">{reason}</p>
                  {hotel ? (
                    <div className="mt-3 rounded-2xl bg-[#f7f9fc] p-3 ring-1 ring-slate-200">
                      <p className="text-[13px] leading-5 text-slate-600">
                        A hotel we&rsquo;d start with: <span className="font-bold text-ink">{hotel.name}</span>
                      </p>
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
                        className="mt-2"
                      >
                        {design.hotelLink}
                      </ProviderButton>
                    </div>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ol>

        <div className="border-t border-slate-100 px-5 py-3">
          {locale === "en" && ACTIVITY_LINKS[city.id] ? (
            <Link href={`/things-to-do#${city.id}`} className="flex min-h-11 items-center justify-between gap-3 text-[14.5px] font-semibold text-ink hover:underline">
              {ACTIVITY_LINKS[city.id]} <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />
            </Link>
          ) : null}
          {locale === "en" ? <p className="text-xs leading-5 text-slate-500">{t("finder.disclosure")}</p> : null}
          {city.id === "kyoto" ? (
            <a href="#stay-finder" className="mt-1 inline-flex min-h-11 items-center text-sm font-semibold text-slate-600 underline underline-offset-4 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2">
              {t("discovery.backToTokyoFinder")}
            </a>
          ) : null}
        </div>
      </section>
    );
  });
}
