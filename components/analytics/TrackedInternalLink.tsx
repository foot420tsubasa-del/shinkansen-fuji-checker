"use client";

import type { ComponentProps, ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import { trackInternalLinkClick } from "@/lib/analytics";

type TrackedInternalLinkProps = Omit<ComponentProps<typeof Link>, "href" | "onClick"> & {
  href: string;
  children: ReactNode;
  sourcePage: string;
  placement: string;
  label: string;
  locale?: string;
};

export function TrackedInternalLink({
  href,
  children,
  sourcePage,
  placement,
  label,
  locale,
  ...linkProps
}: TrackedInternalLinkProps) {
  return (
    <Link
      href={href}
      onClick={() =>
        trackInternalLinkClick({
          source_page: sourcePage,
          placement,
          target_path: href,
          link_label: label,
          locale,
        })
      }
      {...linkProps}
    >
      {children}
    </Link>
  );
}
