import { ArrowRight } from "lucide-react";
import { ProviderButton } from "@/components/ui/ProviderButton";
import { TrackedInternalLink } from "@/components/analytics/TrackedInternalLink";
import type { AreaProviderLink } from "./types";

/**
 * Strong repeat Booking + Trip CTA near the bottom of the page. Same affiliate
 * link assembly as the hero; the only difference is the placement string.
 * Booking-only pages collapse gracefully to a single-button row.
 */
export function AreaBottomCta({
  title,
  body,
  backLabel,
  providers,
  pagePath,
  locale,
  area,
  city,
}: {
  title: string;
  body: string;
  backLabel: string;
  providers: AreaProviderLink[];
  pagePath: string;
  locale: string;
  area: { displayName: string; areaId: string };
  city: string;
}) {
  return (
    <section className="mt-6 rounded-[22px] border border-emerald-100 bg-emerald-50/60 p-5 shadow-sm md:p-6">
      <h2 className="text-xl font-semibold text-slate-950">{title}</h2>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-700">{body}</p>

      {providers.length > 0 ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2 sm:max-w-xl">
          {providers.map((link) => (
            <ProviderButton
              key={`bottom-${link.linkId}`}
              provider={link.provider}
              href={link.href}
              trackingHref={link.trackingHref}
              placement="tokyo_hotels_bottom"
              pagePath={pagePath}
              locale={locale}
              linkId={link.linkId}
              subId={link.subId}
              category="hotel"
              product="hotel_area_search"
              area={area.displayName}
              areaId={area.areaId}
              city={city}
              fullWidth
            >
              {link.label}
            </ProviderButton>
          ))}
        </div>
      ) : null}

      <p className="mt-4">
        <TrackedInternalLink
          href="/areas-to-stay/tokyo-stay-area-index"
          sourcePage={pagePath}
          placement="tokyo_hotels_back_to_finder"
          label={backLabel}
          locale={locale}
          className="inline-flex items-center gap-1 text-sm font-semibold text-[#106b43] underline underline-offset-4 hover:no-underline"
        >
          {backLabel}
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </TrackedInternalLink>
      </p>
    </section>
  );
}
