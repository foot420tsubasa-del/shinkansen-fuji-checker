import { Star } from "lucide-react";
import { HotelCTA } from "@/components/affiliate/HotelCTA";
import { getHotelLink, type HotelAreaKey } from "@/lib/hotel-links";

type HotelPick = {
  name: string;
  area: string;
  price: string;
  link: string;
  hotelKey?: HotelAreaKey;
  tag?: string;
};

export function HotelPicks({
  picks,
  locale = "en",
  pagePath = "/areas-to-stay",
}: {
  picks: HotelPick[];
  locale?: string;
  pagePath?: string;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <p className="text-[11px] font-semibold uppercase text-sky-700">Hotel picks</p>
        <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
          compare latest rates
        </span>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {picks.map((h) => {
          const hotel = h.hotelKey ? getHotelLink(h.hotelKey) : null;
          return (
            <div
              key={h.name}
              className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-4 transition-all hover:border-slate-300 hover:shadow-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900">{h.name}</p>
                  <p className="mt-0.5 text-[11px] text-slate-500">{h.area}</p>
                </div>
                {h.tag && (
                  <span className="shrink-0 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                    <Star className="mr-0.5 inline h-3 w-3" />
                    {h.tag}
                  </span>
                )}
              </div>
              <div className="mt-auto flex items-center justify-between pt-3">
                <span className="text-sm font-semibold text-slate-950">
                  {h.price.includes("¥") ? "Typical range - check latest price" : h.price}
                </span>
              </div>
              <HotelCTA
                areaName={hotel?.areaName ?? h.area}
                city={hotel?.city ?? "Tokyo"}
                provider={hotel?.provider}
                href={hotel?.href ?? h.link}
                placement="stay_area"
                locale={locale}
                pagePath={pagePath}
                label={hotel?.label ?? `Compare ${h.area} hotels`}
                trackingHref={hotel?.trackingHref}
                className="mt-3 w-full"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
