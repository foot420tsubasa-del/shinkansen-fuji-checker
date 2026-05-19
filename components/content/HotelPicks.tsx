import { Star } from "lucide-react";
import { useTranslations } from "next-intl";
import { HotelCTA } from "@/components/affiliate/HotelCTA";
import { getHotelLink, type HotelAreaKey } from "@/lib/hotel-links";

type HotelPick = {
  id?: string;
  name: string;
  area: string;
  price: string;
  link: string;
  hotelKey?: HotelAreaKey;
  tag?: string;
  provider?: "trip" | "klook" | "agoda";
  trackingHref?: string;
  label?: string;
  providerLinks?: Array<{
    provider: "trip" | "agoda";
    href: string;
    trackingHref?: string;
    label: string;
    linkId: string;
  }>;
};

export function HotelPicks({
  picks,
  locale = "en",
  pagePath = "/areas-to-stay",
  placement = "hotel_pick",
}: {
  picks: HotelPick[];
  locale?: string;
  pagePath?: string;
  placement?: "hotel_pick" | "stay_comparison_hotel_pick";
}) {
  const t = useTranslations("hotelPicks");

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <p className="text-[11px] font-semibold uppercase text-sky-700">{t("heading")}</p>
        <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
          {t("compareRates")}
        </span>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {picks.map((h) => {
          const hotel = h.provider ? null : h.hotelKey ? getHotelLink(h.hotelKey) : null;
          const priceLabel =
            h.price.includes("¥") || h.price.toLowerCase() === "check latest price"
              ? t("compareRates")
              : h.price;
          return (
            <div
              key={h.id ?? h.name}
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
                  {priceLabel}
                </span>
              </div>
              {h.providerLinks?.length ? (
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {h.providerLinks.slice(0, 2).map((link) => (
                    <HotelCTA
                      key={`${h.id ?? h.name}-${link.provider}`}
                      areaName={hotel?.areaName ?? h.area}
                      city={hotel?.city ?? "Tokyo"}
                      provider={link.provider}
                      href={link.href}
                      placement={placement}
                      locale={locale}
                      pagePath={pagePath}
                      label={link.label}
                      trackingHref={link.trackingHref}
                      hotelName={h.name}
                      linkId={link.linkId}
                      className="w-full"
                    />
                  ))}
                </div>
              ) : (
                <HotelCTA
                  areaName={hotel?.areaName ?? h.area}
                  city={hotel?.city ?? "Tokyo"}
                  provider={h.provider ?? hotel?.provider}
                  href={hotel?.href ?? h.link}
                  placement={placement}
                  locale={locale}
                  pagePath={pagePath}
                  label={h.label ?? hotel?.label ?? t("fallbackCompareHotels", { areaName: h.area })}
                  trackingHref={h.trackingHref ?? hotel?.trackingHref}
                  hotelName={h.name}
                  className="mt-3 w-full"
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
