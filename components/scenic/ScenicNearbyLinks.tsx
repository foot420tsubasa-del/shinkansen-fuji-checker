"use client";

import { ArrowRight } from "lucide-react";
import { AFFILIATE_REL } from "@/lib/link-rel";
import { trackAffiliateClick } from "@/lib/analytics";

export type NearbyLink = { linkId: string; href: string; adid?: string; title: string; note: string };

/**
 * "Along the line": experiences on or at a station of this route, as quiet
 * text links after the ticket answer. Never a filled button: the route's own
 * ticket stays the one primary action on the page (docs/design-system.md).
 */
export function ScenicNearbyLinks({
  routeId,
  title,
  sub,
  links,
}: {
  routeId: string;
  title: string;
  sub: string;
  links: NearbyLink[];
}) {
  if (!links.length) return null;
  return (
    <section className="mt-10" aria-labelledby="nearby-heading">
      <h2 id="nearby-heading" className="text-xl font-extrabold tracking-[-0.02em]">{title}</h2>
      <p className="mt-1 text-[15px] leading-6 text-slate-600">{sub}</p>
      <ul className="mt-3 grid gap-3">
        {links.map((l) => (
          <li key={l.linkId}>
            <a
              href={l.href}
              target="_blank"
              rel={AFFILIATE_REL}
              onClick={() =>
                trackAffiliateClick({
                  category: "activity",
                  provider: "klook",
                  placement: "scenic_route_nearby",
                  href: l.href,
                  label: routeId,
                  link_id: l.linkId,
                  adid: l.adid,
                })
              }
              className="inline-flex min-h-11 items-center gap-1.5 text-[15px] font-bold text-ink underline underline-offset-4 hover:text-fuji"
            >
              {l.title} on Klook <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />
            </a>
            <p className="text-sm leading-6 text-slate-600">{l.note}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
