"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { BrandMark } from "@/components/ui/BrandMark";
import { LanguageSelector } from "./LanguageSelector";
import { ESIM_URL } from "@/src/affiliateLinks";
import { AFFILIATE_REL } from "@/lib/link-rel";
import { trackAffiliateClick } from "@/lib/analytics";

export function SiteHeader() {
  const t = useTranslations("home");
  const locale = useLocale();

  const navLinks = [
    { href: "/#seat-checker", label: t("nav.seat") },
    { href: "/areas-to-stay", label: t("nav.stay") },
    { href: "/guide", label: t("nav.tickets") },
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
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="transition-colors hover:text-white">
              {link.label}
            </Link>
          ))}
          <a
            href={ESIM_URL}
            target="_blank"
            rel={AFFILIATE_REL}
            onClick={() =>
              trackAffiliateClick({
                category: "esim",
                provider: "klook",
                placement: "top_nav",
                href: ESIM_URL,
                label: t("nav.esim"),
                link_id: "esim",
                product: "esim",
                adid: "1166001",
                locale,
              })
            }
            className="transition-colors hover:text-white"
          >
            {t("nav.esim")}
          </a>
        </nav>

        <div className="flex items-center gap-2">
          <LanguageSelector />
        </div>
      </div>
      <nav className="mx-auto grid max-w-[1180px] grid-cols-4 gap-1 border-t border-slate-800 px-3 pb-2 text-center text-[11px] font-bold text-slate-200 lg:hidden">
        {navLinks.map((link) => (
          <Link key={link.href} href={link.href} className="rounded-lg px-2 py-2 transition-colors hover:bg-slate-800 hover:text-white">
            {link.label}
          </Link>
        ))}
        <a
          href={ESIM_URL}
          target="_blank"
          rel={AFFILIATE_REL}
          onClick={() =>
            trackAffiliateClick({
              category: "esim",
              provider: "klook",
              placement: "mobile_top_nav",
              href: ESIM_URL,
              label: t("nav.esim"),
              link_id: "esim",
              product: "esim",
              adid: "1166001",
              locale,
            })
          }
          className="rounded-lg px-2 py-2 transition-colors hover:bg-slate-800 hover:text-white"
        >
          {t("nav.esim")}
        </a>
      </nav>
    </header>
  );
}
