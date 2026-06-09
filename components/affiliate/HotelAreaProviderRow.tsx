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
  /**
   * Optional per-link placement override. When set it wins over the
   * row-level `placement`. Used by the Finder result cards, where each
   * provider link already carries its own placement; the hotel-detail
   * hero/bottom rows leave this unset and rely on the row-level value.
   */
  placement?: AffiliateClickParams["placement"];
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
  /**
   * Compact mode for narrow surfaces (e.g. the Finder Top-3 result cards):
   * always single-column stack with a tighter gap, sitting visually BELOW
   * the primary "Open hotel page" CTA as a secondary affiliate row.
   */
  compact?: boolean;
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
  compact = false,
  className = "",
}: HotelAreaProviderRowProps) {
  if (providers.length === 0) return null;

  // One provider → full-width single button (Booking-only areas). Two →
  // 2-col grid on sm+, stacked on mobile. Never more than two providers.
  // Compact surfaces always stack so two buttons fit a narrow card column.
  const isSingle = providers.length === 1;
  const layout = compact
    ? "gap-2"
    : isSingle
      ? "gap-3 sm:max-w-sm"
      : "gap-3 sm:grid-cols-2 sm:max-w-xl";

  return (
    <div className={["grid", layout, className].filter(Boolean).join(" ")}>
      {providers.map((link) => (
        <ProviderButton
          key={`${keyPrefix}-${link.linkId}`}
          provider={link.provider}
          href={link.href}
          trackingHref={link.trackingHref}
          placement={link.placement ?? placement}
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
          className={compact ? "min-h-11 text-[13px]" : undefined}
        >
          {link.label}
        </ProviderButton>
      ))}
    </div>
  );
}
