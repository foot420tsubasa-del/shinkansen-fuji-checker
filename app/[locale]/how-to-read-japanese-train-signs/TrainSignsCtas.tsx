"use client";

import { ArrowRight, Train, Wifi } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { ESIM_URL } from "@/src/affiliateLinks";
import { AFFILIATE_REL } from "@/lib/link-rel";
import { trackAffiliateClick, trackCtaClick } from "@/lib/analytics";

type EsimCtaProps = {
  label: string;
  placement: "train_signs_quick_answer" | "train_signs_google_maps" | "train_signs_checklist";
  locale: string;
  variant?: "primary" | "subtle";
};

const buttonBase =
  "inline-flex items-center justify-center gap-2 rounded-lg text-sm font-extrabold transition-colors";
const affiliateButton =
  "border border-[#ff7a00] bg-[#ff7a00] px-5 py-3 text-white shadow-[0_10px_24px_rgba(255,122,0,0.18)] hover:bg-[#e86d00]";
const subtleAffiliateButton =
  "border border-[#ffd1a3] bg-white px-4 py-2.5 text-[#b44b00] hover:bg-[#fff8f0]";
const pageButton =
  "border border-[#168a56] bg-[#168a56] px-5 py-3 text-white shadow-[0_10px_24px_rgba(22,138,86,0.14)] hover:bg-[#0f6f45]";
const secondaryButton =
  "border border-[#9fd7bd] bg-white px-5 py-3 text-[#106b43] hover:border-[#168a56] hover:bg-[#f0fbf6]";

export function EsimCta({ label, placement, locale, variant = "primary" }: EsimCtaProps) {
  return (
    <a
      href={ESIM_URL}
      target="_blank"
      rel={AFFILIATE_REL}
      onClick={() =>
        trackAffiliateClick({
          category: "esim",
          provider: "klook",
          placement,
          cta_type: "esim",
          href: ESIM_URL,
          label,
          locale,
        })
      }
      className={`${buttonBase} ${variant === "primary" ? affiliateButton : subtleAffiliateButton}`}
    >
      <Wifi className="h-4 w-4" />
      {label}
      <ArrowRight className="h-4 w-4" />
    </a>
  );
}

export function InternalCta({
  href,
  label,
  placement,
  ctaType,
  locale,
  variant = "primary",
}: {
  href: string;
  label: string;
  placement: string;
  ctaType: "rail" | "seat_checker" | "guide" | "stay" | "transfer" | "itinerary";
  locale: string;
  variant?: "primary" | "secondary";
}) {
  return (
    <Link
      href={href}
      onClick={() =>
        trackCtaClick({
          placement,
          cta_type: ctaType,
          label,
          href,
          locale,
        })
      }
      className={`${buttonBase} ${variant === "primary" ? pageButton : secondaryButton}`}
    >
      <Train className="h-4 w-4" />
      {label}
      <ArrowRight className="h-4 w-4" />
    </Link>
  );
}
