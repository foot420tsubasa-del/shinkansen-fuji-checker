"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { BrandMark } from "@/components/ui/BrandMark";
import { LanguageSelector } from "./LanguageSelector";
import type { MouseEvent } from "react";
import { trackCtaClick } from "@/lib/analytics";

/**
 * "Check Seat" goes to the homepage's checker by default. On a page that
 * carries its own checker — the guide, the direction pages, the timing page —
 * that sent readers away from the copy in front of them, so there it scrolls
 * to the one on the page instead. The href stays, so the link still works
 * without JavaScript and still reads as a link to the checker.
 */
function preferOnPageChecker(event: MouseEvent<HTMLAnchorElement>, category: string) {
  if (category !== "seat_checker") return;
  const target = document.getElementById("fuji-seat-check");
  if (!target) return;
  event.preventDefault();
  // An instant jump, like any in-page anchor: smooth scrolling is not run in
  // every browser context, and a link that silently does nothing is worse.
  target.scrollIntoView({ block: "start" });
}

export function SiteHeader() {
  const t = useTranslations("home");
  const locale = useLocale();

  // The five core pages (2026-11-14). Together with the homepage they take
  // 90% of search clicks and 87% of booking clicks; everything else left the
  // navigation.
  const desktopNavLinks = [
    { href: "/#seat-checker", label: t("nav.seat"), category: "seat_checker" },
    { href: "/guide", label: t("nav.guide"), category: "rail" },
    { href: "/shinkansen-seat-letters", label: t("nav.seatMap"), category: "rail" },
    { href: "/when-to-see-mt-fuji-shinkansen", label: t("nav.when"), category: "rail" },
  ];
  const mobileNavLinks = [
    { href: "/#seat-checker", label: t("nav.seat"), category: "seat_checker" },
    { href: "/guide", label: t("nav.guideShort"), category: "rail" },
    { href: "/shinkansen-seat-letters", label: t("nav.seatMapShort"), category: "rail" },
    { href: "/when-to-see-mt-fuji-shinkansen", label: t("nav.whenShort"), category: "rail" },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-slate-700/60 bg-slate-950 shadow-[0_16px_50px_rgba(15,23,42,0.28)]">
      <div className="mx-auto flex min-h-16 max-w-[1180px] items-center justify-between gap-5 px-5 py-3 md:px-7">
        <Link href="/" className="flex min-w-0 shrink-0 items-center gap-3">
          <BrandMark />
          <span className="min-w-0">
            <span className="block text-sm font-semibold text-white md:text-base">fujiseat.com</span>
            <span className="hidden text-xs font-semibold leading-5 text-sky-200 sm:block">
              {t("nav.tagline")}
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-bold text-slate-200 lg:flex">
          {desktopNavLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={(event) => {
                trackCtaClick({
                  placement: "header",
                  href: link.href,
                  label: link.label,
                  category: link.category,
                  locale,
                });
                preferOnPageChecker(event, link.category);
              }}
              className="transition-colors hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <LanguageSelector />
        </div>
      </div>
      <nav className="mx-auto grid max-w-[1180px] grid-cols-4 gap-1 border-t border-slate-800 px-3 pb-2 text-center text-[11px] font-bold text-slate-200 lg:hidden">
        {mobileNavLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={(event) => {
              trackCtaClick({
                placement: "mobile_header",
                href: link.href,
                label: link.label,
                category: link.category,
                locale,
              });
              preferOnPageChecker(event, link.category);
            }}
            className="rounded-lg px-2 py-2 transition-colors hover:bg-slate-800 hover:text-white"
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
