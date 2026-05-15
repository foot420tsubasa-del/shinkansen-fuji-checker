import { Check, X } from "lucide-react";
import { HotelCTA } from "@/components/affiliate/HotelCTA";
import { getHotelLink, type HotelAreaKey } from "@/lib/hotel-links";

type AreaCardProps = {
  id?: string;
  name: string;
  vibe: string;
  pros: string[];
  cons: string[];
  bestFor: string;
  transport: string;
  hotelLink: string;
  locale?: string;
  city?: string;
  pagePath?: string;
  provider?: "agoda" | "trip" | "klook";
  hotelKey?: HotelAreaKey;
  showHotelCta?: boolean;
};

export function AreaCard({
  id,
  name,
  vibe,
  pros,
  cons,
  bestFor,
  transport,
  hotelLink,
  locale = "en",
  city = "Tokyo",
  pagePath = "/areas-to-stay",
  provider = "klook",
  hotelKey,
  showHotelCta = true,
}: AreaCardProps) {
  const hotel = hotelKey ? getHotelLink(hotelKey) : null;

  return (
    <div id={id} className="scroll-mt-24 rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-950">{name}</h3>
          <p className="mt-1 text-xs text-slate-500">{vibe}</p>
        </div>
        <span className="shrink-0 rounded-full border border-[#9fd7bd] bg-[#f0fbf6] px-2.5 py-1 text-[10px] font-semibold text-[#106b43]">
          {bestFor}
        </span>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <p className="mb-2 text-[10px] font-semibold uppercase text-emerald-600">Pros</p>
          <ul className="space-y-1.5">
            {pros.map((p) => (
              <li key={p} className="flex items-start gap-2 text-xs leading-5 text-slate-700">
                <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                {p}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="mb-2 text-[10px] font-semibold uppercase text-red-500">Cons</p>
          <ul className="space-y-1.5">
            {cons.map((c) => (
              <li key={c} className="flex items-start gap-2 text-xs leading-5 text-slate-700">
                <X className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-400" />
                {c}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5 text-xs leading-5 text-slate-600">
        <span className="font-semibold text-slate-700">Transport:</span> {transport}
      </div>

      {showHotelCta ? (
        <HotelCTA
          areaName={hotel?.areaName ?? name}
          city={hotel?.city ?? city}
          provider={hotel?.provider ?? provider}
          href={hotel?.href ?? hotelLink}
          placement="stay_area_hotel_card"
          locale={locale}
          pagePath={pagePath}
          label={hotel?.label ?? `Compare ${name} hotels`}
          trackingHref={hotel?.trackingHref}
          className="mt-4"
        />
      ) : null}
    </div>
  );
}
