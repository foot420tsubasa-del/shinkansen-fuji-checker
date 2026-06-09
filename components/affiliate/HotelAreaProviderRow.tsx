import { ProviderButton } from "@/components/ui/ProviderButton";
import type { AffiliateClickParams } from "@/lib/analytics";

/**
 * Shared Booking.com / Trip.com button grid for the 36 Tokyo hotel-area
 * detail pages. Used by AreaHeroSummary (hero placement) and AreaBottomCta
 * (bottom placement), and reusable from future surfaces (e.g. the Finder
 * result cards) so the provider row stays visually + behaviourally
 * identical everywhere.
 *
 * This component renders ONLY the button grid. Affiliate-link assembly
 * (Booking via getHotelProviderLinks, Trip via getHotelLink) stays in the
 * page so analytics dimensions — provider, placement, link_id, sub_id,
 * area_id, city, product, rank — are unchanged. We pass the already-built
 * links straight through to ProviderButton.
 *
 * Booking-only areas (30 of 36 have no Trip.com short-link) collapse
 * gracefully: a single full-width Booking button. No Trip URL is ever
 * borrowed from a parent/nearby area. If no providers exist at all the
 * component renders nothing.
 */

export type HotelAreaProviderLink = {
  provider: "trip" | "booking_travelpayouts";
  href: string;
  trackingHref?: string;
  label: string;
  linkId: string;
  subId?: string;
};

type HotelAreaProviderRowProps = {
  providers: HotelAreaProviderLink[];
  /** Analytics placement — caller passes the existing per-surface value. */
  placement: AffiliateClickParams["placement"];
  pagePath: string;
  locale: string;
  area: { displayName: string; areaId: string };
  city: string;
  /** Stable key prefix so hero + bottom rows don't collide in React. */
  keyPrefix: string;
  /** Forwarded to affiliate analytics (e.g. Finder result rank). */
  rank?: number;
  /** product param for analytics; defaults to the existing value. */
  product?: string;
  className?: string;
};

export function HotelAreaProviderRow({
  providers,
  placement,
  pagePath,
  locale,
  area,
  city,
  keyPrefix,
  rank,
  product = "hotel_area_search",
  className = "",
}: HotelAreaProviderRowProps) {
  if (providers.length === 0) return null;

  // One provider → full-width single button (Booking-only areas). Two →
  // 2-col grid on sm+, stacked on mobile. Never more than two providers.
  const isSingle = providers.length === 1;

  return (
    <div
      className={[
        "grid gap-3",
        isSingle ? "sm:max-w-sm" : "sm:grid-cols-2 sm:max-w-xl",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {providers.map((link) => (
        <ProviderButton
          key={`${keyPrefix}-${link.linkId}`}
          provider={link.provider}
          href={link.href}
          trackingHref={link.trackingHref}
          placement={placement}
          pagePath={pagePath}
          locale={locale}
          linkId={link.linkId}
          subId={link.subId}
          category="hotel"
          product={product}
          area={area.displayName}
          areaId={area.areaId}
          city={city}
          rank={rank}
          fullWidth
        >
          {link.label}
        </ProviderButton>
      ))}
    </div>
  );
}
