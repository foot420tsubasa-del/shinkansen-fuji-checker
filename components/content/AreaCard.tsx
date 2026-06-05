import { Check, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { HotelCTA } from "@/components/affiliate/HotelCTA";
import { ProviderChoiceCTA, type ProviderChoiceButton } from "@/components/affiliate/ProviderChoiceCTA";
import { getHotelLink, getTripHotelConfig, type HotelAreaKey } from "@/lib/hotel-links";
import { getHotelProviderLinks } from "@/lib/hotel-affiliate-links";

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
  provider?: "trip" | "klook";
  hotelKey?: HotelAreaKey;
  showHotelCta?: boolean;
};

function providerChoices(...providers: Array<ProviderChoiceButton | null | undefined>) {
  return providers.filter((provider): provider is ProviderChoiceButton => Boolean(provider));
}

const bookingAreaIdByHotelAreaKey: Partial<Record<HotelAreaKey, string>> = {
  shinjuku: "shinjuku",
  ueno: "ueno",
  asakusa: "asakusa",
  tokyoStation: "tokyo-station",
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
  const t = useTranslations("stayShared.areaCard");
  const hotel = hotelKey ? getHotelLink(hotelKey) : null;
  const hotelConfig = hotelKey ? getTripHotelConfig(hotelKey) : null;
  const ctaProvider = hotel?.provider === "trip" || hotel?.provider === "klook" ? hotel.provider : provider;
  const hotelActionLabel =
    hotelKey === "tokyoStation"
      ? t("compareTokyoStation")
      : t("compareAreaHotels", { area: hotel?.areaName ?? name });
  const tripHref = hotel?.provider === "trip" ? hotel.href : hotelConfig?.tripUrl ?? (provider === "trip" ? hotelLink : undefined);
  const tripTrackingHref = hotel?.provider === "trip" ? hotel.trackingHref : hotelConfig?.tripUrl ?? (provider === "trip" ? hotelLink : undefined);
  const bookingAreaId = hotelKey ? bookingAreaIdByHotelAreaKey[hotelKey] : undefined;
  const bookingLinks = bookingAreaId
    ? getHotelProviderLinks({ areaId: bookingAreaId, locale, placement: "tokyo_first_time_card" })
    : [];
  const useProviderChoice = pagePath.endsWith("/tokyo-first-time");

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
          <p className="mb-2 text-[10px] font-semibold uppercase text-emerald-600">{t("pros")}</p>
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
          <p className="mb-2 text-[10px] font-semibold uppercase text-red-500">{t("cons")}</p>
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
        <span className="font-semibold text-slate-700">{t("transport")}:</span> {transport}
      </div>

      {showHotelCta && useProviderChoice ? (
        <ProviderChoiceCTA
          actionLabel={hotelActionLabel}
          pagePath={pagePath}
          locale={locale}
          area={`${hotel?.city ?? city}: ${hotel?.areaName ?? name}`}
          className="mt-4"
          providers={providerChoices(
            ...bookingLinks.map((link) => ({
              label: "Booking.com",
              href: link.href,
              trackingHref: link.trackingHref,
              provider: link.provider,
              product: "hotel",
              linkId: link.linkId,
              placement: "tokyo_first_time_card",
              variant: "primary",
              category: "hotel",
              areaId: bookingAreaId,
              subId: link.subId,
            }) satisfies ProviderChoiceButton),
            tripHref
              ? {
                  label: "Trip.com",
                  href: tripHref,
                  trackingHref: tripTrackingHref,
                  provider: "trip",
                  product: "hotel",
                  linkId: hotelKey ? `hotelArea.${hotelKey}.trip` : undefined,
                  placement: "tokyo_first_time_card",
                  variant: "primary",
                  category: "hotel",
              }
              : null,
          )}
          maxProviders={3}
        />
      ) : showHotelCta ? (
        <HotelCTA
          areaName={hotel?.areaName ?? name}
          city={hotel?.city ?? city}
          provider={ctaProvider}
          href={hotel?.href ?? hotelLink}
          placement="stay_area_hotel_card"
          locale={locale}
          pagePath={pagePath}
          label={hotel?.label ?? t("compareAreaHotels", { area: name })}
          trackingHref={hotel?.trackingHref}
          className="mt-4"
        />
      ) : null}
    </div>
  );
}
