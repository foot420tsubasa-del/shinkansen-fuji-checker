import { ProviderButton } from "@/components/ui/ProviderButton";
import { getBookingHotelLink } from "@/lib/booking-hotels";
import design from "@/data/stay-hub-design.json";

export function StayCityGuides({ disclosure }: { disclosure: string }) {
  return design.cities.map((city) => (
    <section key={city.id} id={city.id} className="mt-14 scroll-mt-24">
      <h2 className="text-2xl font-extrabold tracking-[-0.02em] text-ink md:text-[32px]">{city.title}</h2>
      <p className="mt-2 text-[15px] leading-6 text-slate-600">{design.areaIntro}</p>
      <ul className="mt-5 divide-y divide-slate-200 border-y border-slate-200">
        {city.areas.map((area) => {
          const hotel = area.hotel ? getBookingHotelLink(area.hotel) : null;
          return (
            <li key={area.name} className="grid gap-3 py-4 sm:grid-cols-[1fr_auto] sm:items-center">
              <div>
                <h3 className="text-lg font-extrabold text-ink">{area.name}</h3>
                <p className="mt-1 text-[15px] leading-6 text-slate-700">{area.reason}</p>
              </div>
              {hotel ? (
                <div className="grid gap-1 sm:justify-items-end">
                  <p className="text-sm font-semibold text-slate-700">{hotel.name}</p>
                  <ProviderButton
                    href={hotel.href}
                    provider="booking_travelpayouts"
                    placement="stay_hub_city_hotel"
                    pagePath="/areas-to-stay"
                    locale="en"
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
      <p className="mt-3 text-xs leading-5 text-slate-600">{disclosure}</p>
    </section>
  ));
}
