"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { BrandMark } from "@/components/ui/BrandMark";
import { trackCtaClick } from "@/lib/analytics";

const feedbackButton =
  "inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[#2E7D5B] bg-[#2E7D5B] px-4 text-sm font-extrabold text-white shadow-[0_8px_22px_rgba(22,138,86,0.18)] transition-colors hover:bg-[#246449]";

export function SiteFooter() {
  const t = useTranslations("home");
  const locale = useLocale();

  const footerLinkClass = "mb-2 block text-sm text-slate-300 transition-colors hover:text-white";
  const trackFooterLink = (href: string, label: string, category: string) =>
    trackCtaClick({
      placement: "footer",
      href,
      label,
      category,
      locale,
    });

  return (
    <footer className="mt-10 border-t border-slate-700/60 bg-[#07142f] py-10 text-slate-300 shadow-[0_-16px_50px_rgba(15,23,42,0.16)]">
      <div className="mx-auto max-w-[1180px] px-5 md:px-7">
        <div className="grid gap-8 lg:grid-cols-[2fr_1fr_1fr_1fr_1.7fr]">
          <div>
            <Link href="/" className="flex items-center gap-3">
              <BrandMark size="sm" />
              <span className="text-xl font-extrabold text-white">fujiseat<span className="block text-[11px] font-semibold tracking-wide text-slate-400">Japan Rail Seats, Stays &amp; Routes</span></span>
            </Link>
            <p className="mt-3 max-w-sm text-sm leading-6 text-slate-300">
              {t("footer.tagline")}
            </p>
          </div>

          <div>
            <h4 className="mb-3 text-xs font-black uppercase tracking-[0.06em] text-sky-200">{t("footer.plan")}</h4>
            <Link className={footerLinkClass} href="/#seat-checker" onClick={() => trackFooterLink("/#seat-checker", t("footer.seatChecker"), "seat_checker")}>{t("footer.seatChecker")}</Link>
            <Link className={footerLinkClass} href="/areas-to-stay/tokyo-stay-area-index" onClick={() => trackFooterLink("/areas-to-stay/tokyo-stay-area-index", t("nav.stay"), "stay")}>{t("nav.stay")}</Link>
            <Link className={footerLinkClass} href="/plan-your-trip#rail" onClick={() => trackFooterLink("/plan-your-trip#rail", t("nav.railGuide"), "rail")}>{t("nav.railGuide")}</Link>
            <Link className={footerLinkClass} href="/plan-your-trip#arrival" onClick={() => trackFooterLink("/plan-your-trip#arrival", t("nav.arrivalPrep"), "arrival")}>{t("nav.arrivalPrep")}</Link>
          </div>

          <div>
            <h4 className="mb-3 text-xs font-black uppercase tracking-[0.06em] text-sky-200">{t("footer.guides")}</h4>
            <Link className={footerLinkClass} href="/guide" onClick={() => trackFooterLink("/guide", t("footer.shinkansenGuide"), "rail")}>{t("footer.shinkansenGuide")}</Link>
            <Link className={footerLinkClass} href="/areas-to-stay" onClick={() => trackFooterLink("/areas-to-stay", t("footer.stayAreas"), "stay")}>{t("footer.stayAreas")}</Link>
            <Link className={footerLinkClass} href="/airport-transfers" onClick={() => trackFooterLink("/airport-transfers", t("footer.airportTransfers"), "transfer")}>{t("footer.airportTransfers")}</Link>
            <Link className={footerLinkClass} href="/command-center" onClick={() => trackFooterLink("/command-center", t("footer.commandCenter"), "navigation")}>{t("footer.commandCenter")}</Link>
          </div>

          <div>
            <h4 className="mb-3 text-xs font-black uppercase tracking-[0.06em] text-sky-200">{t("footer.support")}</h4>
            <Link className={footerLinkClass} href="/about" onClick={() => trackFooterLink("/about", t("footer.about"), "support")}>{t("footer.about")}</Link>
            <Link className={footerLinkClass} href="/local-tokyo" onClick={() => trackFooterLink("/local-tokyo", t("footer.localTokyo"), "local_tokyo")}>{t("footer.localTokyo")}</Link>
            <Link className={footerLinkClass} href="/privacy" onClick={() => trackFooterLink("/privacy", t("footer.privacy"), "support")}>{t("footer.privacy")}</Link>
            <Link className={footerLinkClass} href="/terms" onClick={() => trackFooterLink("/terms", t("footer.terms"), "support")}>{t("footer.terms")}</Link>
          </div>

          <div className="rounded-[14px] border border-white/10 bg-white/5 p-5">
            <h4 className="text-xs font-black uppercase tracking-[0.06em] text-sky-200">
              {t("footer.feedbackTitle")}
            </h4>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              {t("footer.feedbackDesc")}
            </p>
            <Link href="/questions" className={`${feedbackButton} mt-4`}>
              {t("footer.feedbackCta")}
            </Link>
          </div>
        </div>

        <div className="mt-7 border-t border-white/10 pt-4 text-xs leading-5 text-slate-400">
          <p>
            {t("footer.affiliateNote").split("Terms").map((part, index) =>
              index === 0 ? (
                <span key={index}>
                  {part}
                  <Link href="/terms" className="underline underline-offset-2 hover:text-white">
                    {t("footer.terms")}
                  </Link>
                </span>
              ) : (
                <span key={index}>{part}</span>
              ),
            )}
          </p>
        </div>
      </div>
    </footer>
  );
}
