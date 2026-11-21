import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

/**
 * The page's one affiliate disclosure (2026-11-21). Placed once, above the
 * first affiliate link on the page, instead of a line under every button:
 * that keeps the FTC-style "before the link, easy to see" disclosure while
 * the buttons stay clean. The full wording lives in Terms §3.
 */
export async function AffiliateDisclosure({ locale, className = "" }: { locale: string; className?: string }) {
  const t = await getTranslations({ locale, namespace: "home" });
  return (
    <p className={`flex items-start gap-1.5 text-[11px] leading-4 text-slate-500 ${className}`}>
      <span className="shrink-0 rounded bg-slate-100 px-1 py-px text-[10px] font-bold text-slate-600">PR</span>
      <span>
        {t("hero.affiliateNote")}{" "}
        <Link href="/terms" className="underline underline-offset-2 hover:text-ink">Terms</Link>
      </span>
    </p>
  );
}
