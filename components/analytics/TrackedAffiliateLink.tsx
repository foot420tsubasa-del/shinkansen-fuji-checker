"use client";

import type { AnchorHTMLAttributes, ReactNode } from "react";
import { getProviderFromHref, trackAffiliateClick, type AffiliateClickParams } from "@/lib/analytics";

type TrackedAffiliateLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "onClick"> & {
  href: string;
  children: ReactNode;
  category: AffiliateClickParams["category"];
  provider?: AffiliateClickParams["provider"];
  placement: AffiliateClickParams["placement"];
  label: string;
  linkId?: string;
  product?: string;
  adid?: string;
  pagePath?: string;
  locale?: string;
  area?: string;
  city?: string;
  hotelName?: string;
  trackingHref?: string;
  route?: string;
  routeType?: string;
  transportType?: string;
  pageType?: AffiliateClickParams["page_type"];
};

export function TrackedAffiliateLink({
  href,
  children,
  category,
  provider,
  placement,
  label,
  linkId,
  product,
  adid,
  pagePath,
  locale,
  area,
  city,
  hotelName,
  trackingHref,
  route,
  routeType,
  transportType,
  pageType,
  ...anchorProps
}: TrackedAffiliateLinkProps) {
  const analyticsHref = trackingHref ?? href;

  return (
    <a
      href={href}
      onClick={() =>
        trackAffiliateClick({
          category,
          provider: provider ?? getProviderFromHref(analyticsHref),
          placement,
          page_path: pagePath,
          locale,
          href: analyticsHref,
          label,
          link_id: linkId,
          product,
          adid,
          area,
          city,
          hotel_name: hotelName,
          route,
          route_type: routeType,
          transport_type: transportType,
          page_type: pageType,
        })
      }
      {...anchorProps}
    >
      {children}
    </a>
  );
}
