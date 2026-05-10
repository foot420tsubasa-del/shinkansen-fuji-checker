"use client";

import type { ComponentProps, ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import { trackCtaClick } from "@/lib/analytics";

type TrackedCtaLinkProps = Omit<ComponentProps<typeof Link>, "href" | "onClick"> & {
  href: string;
  children: ReactNode;
  placement: string;
  label: string;
  pagePath?: string;
  locale?: string;
  category?: string;
  ctaType?: string;
};

export function TrackedCtaLink({
  href,
  children,
  placement,
  label,
  pagePath,
  locale,
  category = "navigation",
  ctaType,
  ...linkProps
}: TrackedCtaLinkProps) {
  return (
    <Link
      href={href}
      onClick={() =>
        trackCtaClick({
          placement,
          href,
          label,
          category,
          page_path: pagePath,
          locale,
          cta_type: ctaType,
        })
      }
      {...linkProps}
    >
      {children}
    </Link>
  );
}
