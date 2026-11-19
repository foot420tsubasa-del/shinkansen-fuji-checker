"use client";

import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
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

/*
 * Redesigned 2026-11-15 after US travel sites (Hopper, The Points Guy): a thin
 * white bar with the one action that matters — checking a seat — always in
 * reach, and the rest behind a menu on a phone. It replaces a dark bar with a
 * second row of four links that took about 110px of every phone screen.
 */
export function SiteHeader() {
  const t = useTranslations("home");
  const locale = useLocale();
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  // The section you are in, so the bar shows where you are (2026-11-20 design pass).
  const isCurrent = (href: string) => {
    const base = href.split("#")[0];
    if (base === "/" || !base) return false;
    if (base === "/areas-to-stay") return pathname.startsWith("/areas-to-stay") || pathname.startsWith("/stays");
    return pathname === base || pathname.startsWith(base + "/");
  };

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  const navLinks = [
    { href: "/#seat-checker", label: t("nav.seat"), category: "seat_checker" },
    // Scenic routes lead the bar: the site is now about train-window views (2026-11-20).
    { href: "/scenic", label: t("nav.scenic"), category: "scenic" },
    { href: "/areas-to-stay", label: t("nav.stay"), category: "stay" },
    // Was /plan-your-trip#rail, a page retired from the index; the Shinkansen
    // guide is the rail content that ranks.
    { href: "/guide", label: t("nav.railGuide"), category: "rail" },
    // Was /plan-your-trip#arrival (retired); Suica is the arrival step readers search for.
    { href: "/how-to-buy-suica", label: t("nav.arrivalPrep"), category: "arrival" },
  ];
  const seatLink = navLinks[0];

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/85">
      <div className="mx-auto flex h-14 max-w-[1180px] items-center justify-between gap-4 px-4 md:h-16 md:px-7">
        <Link href="/" className="flex min-w-0 shrink-0 items-center gap-2.5" onClick={() => setMenuOpen(false)}>
          <BrandMark size="sm" className="!h-8 !w-8 !rounded-xl !shadow-none md:!h-9 md:!w-9" />
          <span className="min-w-0">
            <span className="block text-[15px] font-extrabold tracking-[-0.01em] text-ink md:text-base">fujiseat</span>
            <span className="hidden text-[11px] font-medium leading-4 text-slate-500 md:block">
              {t("nav.tagline")}
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-7 text-sm font-semibold text-slate-600 lg:flex">
          {navLinks.slice(1).map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() =>
                trackCtaClick({
                  placement: "header",
                  href: link.href,
                  label: link.label,
                  category: link.category,
                  locale,
                })
              }
              aria-current={isCurrent(link.href) ? "page" : undefined}
              className={[
                "relative py-1 transition-colors hover:text-ink",
                isCurrent(link.href) ? "text-ink after:absolute after:inset-x-0 after:-bottom-[19px] after:h-[2px] after:rounded-full after:bg-ink" : "",
              ].join(" ")}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href={seatLink.href}
            onClick={(event) => {
              setMenuOpen(false);
              trackCtaClick({
                placement: "header",
                href: seatLink.href,
                label: seatLink.label,
                category: seatLink.category,
                locale,
              });
              preferOnPageChecker(event, seatLink.category);
            }}
            className="inline-flex min-h-11 items-center whitespace-nowrap rounded-full bg-[#c4422c] px-3.5 text-xs font-bold text-white shadow-[0_4px_14px_rgba(217,74,50,0.28)] transition-colors hover:bg-fuji-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fuji-hover md:text-sm"
          >
            {seatLink.label}
          </Link>
          {/* On a phone the language switch moves into the menu: a long label
              such as Russian "Проверить место" pushed the bar past 375px. */}
          <div className="hidden sm:block">
            <LanguageSelector tone="light" />
          </div>
          <button
            type="button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="site-menu"
            onClick={() => setMenuOpen((open) => !open)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-ink transition-colors hover:bg-slate-100 lg:hidden"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {menuOpen ? (
        <nav id="site-menu" className="border-t border-slate-100 bg-white px-4 pb-4 pt-2 shadow-[0_18px_30px_rgba(11,18,32,0.08)] lg:hidden">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={(event) => {
                setMenuOpen(false);
                trackCtaClick({
                  placement: "mobile_header",
                  href: link.href,
                  label: link.label,
                  category: link.category,
                  locale,
                });
                preferOnPageChecker(event, link.category);
              }}
              aria-current={isCurrent(link.href) ? "page" : undefined}
              className={["flex min-h-12 items-center justify-between border-b border-slate-100 text-base font-semibold", isCurrent(link.href) ? "text-fuji" : "text-ink"].join(" ")}
            >
              {link.label}
            </Link>
          ))}
          <div className="flex min-h-12 items-center justify-between pt-2 sm:hidden">
            <span className="text-sm font-medium text-slate-500">Language</span>
            <LanguageSelector tone="light" />
          </div>
        </nav>
      ) : null}
    </header>
  );
}
