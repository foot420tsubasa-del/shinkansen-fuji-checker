"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { BrandMark } from "@/components/ui/BrandMark";
import { LanguageSelector } from "./LanguageSelector";

export function SiteHeader() {
  const t = useTranslations("home");

  return (
    <header className="sticky top-0 z-40 border-b border-slate-700/60 bg-slate-950 shadow-[0_16px_50px_rgba(15,23,42,0.28)]">
      <div className="mx-auto flex min-h-16 max-w-[1180px] items-center justify-between gap-5 px-5 py-3 md:px-7">
        <Link href="/" className="flex min-w-0 shrink-0 items-center gap-3">
          <BrandMark />
          <span className="min-w-0">
            <span className="block text-sm font-semibold text-white md:text-base">fujiseat.com</span>
            <span className="hidden text-xs font-semibold leading-5 text-sky-200 sm:block">
              Japan hotel-base planning
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-bold text-slate-200 lg:flex">
          <Link href="/#seat-checker" className="transition-colors hover:text-white">
            {t("nav.seat")}
          </Link>
          <Link href="/planner" className="transition-colors hover:text-white">
            {t("nav.planner")}
          </Link>
          <Link href="/areas-to-stay" className="transition-colors hover:text-white">
            {t("nav.stay")}
          </Link>
          <Link href="/plan-your-trip" className="transition-colors hover:text-white">
            {t("nav.essentials")}
          </Link>
          <Link href="/about" className="transition-colors hover:text-white">
            {t("nav.about")}
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <LanguageSelector />
        </div>
      </div>
    </header>
  );
}
