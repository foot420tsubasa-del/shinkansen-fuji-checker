import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

/**
 * Phase 2 design system — six CTA variants.
 *
 * Every visible CTA across fujiseat.com belongs to one of these roles:
 *
 *   primaryTool — Most-important tool launchers. Dark navy filled.
 *                 Examples: "Open free Seat Checker", "Start Hotel Area
 *                 Finder", "Open Trip Planner".
 *
 *   purchase    — External booking / high-intent purchase. Terracotta
 *                 filled. Examples: "Book Shinkansen ticket on Klook",
 *                 "Book JR Pass on Klook". (Was the legacy "commercial"
 *                 orange — kept as alias.)
 *
 *   compare     — Compare / search / consider. White background with
 *                 strong blue border. Used for Omio and other "compare"
 *                 affiliate actions, plus internal "compare all" CTAs
 *                 that are not yet a purchase.
 *
 *   hotel       — Hotel area decision and "Compare hotels in <area>"
 *                 actions. Sage green filled. The provider buttons
 *                 (Booking.com / Trip.com) live UNDER this CTA, never
 *                 in place of it.
 *
 *   hotelOutline— Outline counterpart to `hotel` for secondary hotel
 *                 actions (area details, related links). Sage green
 *                 border on white.
 *
 *   secondary   — Internal / supporting actions that should not compete
 *                 with the primary CTA on the page. White background
 *                 with a confident slate border. Use this for "View
 *                 details", "Back to Finder", "Read full guide", etc.
 *                 Text-link styling lives in `textLink`.
 *
 *   textLink    — Plain text + underline + arrow. For inline links and
 *                 tertiary actions where a button would be too much.
 *
 * Legacy variants (kept as aliases so old call-sites keep compiling and
 * the visual rules stay in lockstep):
 *   commercial / affiliate → purchase
 *   internal / primary     → hotel
 *   internalOutline        → hotelOutline
 *   navy                   → primaryTool
 *   ghost                  → secondary (text-link feel)
 */
export type ButtonVariant =
  | "primaryTool"
  | "purchase"
  | "compare"
  | "hotel"
  | "hotelOutline"
  | "secondary"
  | "textLink"
  // legacy aliases (do not remove without a sweep — see migration notes)
  | "commercial"
  | "internal"
  | "internalOutline"
  | "navy"
  | "ghost"
  | "primary"
  | "affiliate";

export type ButtonSize = "sm" | "md" | "lg";

type BaseProps = {
  children: ReactNode;
  className?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
};

type ButtonProps = BaseProps & ButtonHTMLAttributes<HTMLButtonElement>;
type AnchorButtonProps = BaseProps & AnchorHTMLAttributes<HTMLAnchorElement>;

// The legacy variants preserved the previous "no-min-height, rounded-2xl"
// shape when no explicit size was passed. Keep that exception so old
// call-sites are visually unchanged unless they opt into a size.
const LEGACY_VARIANTS = new Set<ButtonVariant>([
  "primary",
  "affiliate",
  "secondary",
  "navy",
  "ghost",
  "commercial",
  "internal",
  "internalOutline",
]);

function colorClass(variant: ButtonVariant) {
  switch (variant) {
    // ------------- Phase 2 variants -------------
    case "primaryTool":
    case "navy":
      // Dark navy filled — top-of-funnel tool launch.
      return "border border-[#081D3A] bg-[#081D3A] text-white shadow-sm hover:bg-[#102a52] focus-visible:ring-[#1e3a8a]";
    case "purchase":
    case "commercial":
    case "affiliate":
      // Terracotta filled — external booking / purchase intent.
      return "border border-[#D94A32] bg-[#D94A32] text-white shadow-sm hover:bg-[#bf3d28] focus-visible:ring-orange-200";
    case "compare":
      // White + strong blue border — Omio / compare actions. Shadow is
      // intentional: white CTAs on the cream site background look weak
      // without it.
      return "border border-[#2563EB] bg-white text-[#0B3A75] shadow-sm shadow-blue-100/70 hover:bg-[#F0F6FF] hover:border-[#1D4ED8] focus-visible:ring-blue-200";
    case "hotel":
    case "internal":
    case "primary":
      // Sage green filled — hotel area decision / compare hotels.
      return "border border-[#2E7D5B] bg-[#2E7D5B] text-white shadow-sm shadow-emerald-100/60 hover:bg-[#246449] focus-visible:ring-emerald-200";
    case "hotelOutline":
    case "internalOutline":
      // Sage green outline — secondary hotel action.
      return "border border-[#2E7D5B] bg-white text-[#246449] shadow-sm shadow-emerald-100/40 hover:bg-[#EFF7F1] focus-visible:ring-emerald-200";
    case "secondary":
      // Slate-bordered white — supporting internal actions. Border is
      // deliberately darker than slate-200; slate-300 looks washed-out
      // on cream backgrounds.
      return "border border-slate-300 bg-white text-slate-800 shadow-sm hover:bg-slate-50 hover:border-slate-400 focus-visible:ring-slate-300";
    case "textLink":
      return "text-[#0B3A75] underline underline-offset-4 hover:text-[#081D3A] focus-visible:ring-slate-300";
    case "ghost":
    default:
      return "text-slate-600 hover:bg-slate-100 focus-visible:ring-slate-200";
  }
}

function shapeClass(variant: ButtonVariant, size: ButtonSize | undefined) {
  if (variant === "textLink") {
    return "px-0 py-0.5 text-sm";
  }
  if (!size && LEGACY_VARIANTS.has(variant)) {
    return "rounded-2xl px-4 py-2.5 text-sm";
  }
  switch (size ?? "md") {
    case "sm":
      return "min-h-10 px-3 py-1.5 text-xs rounded-[10px]";
    case "lg":
      return "min-h-[52px] md:min-h-12 px-5 py-3 text-sm md:text-[15px] rounded-[14px]";
    case "md":
    default:
      return "min-h-12 md:min-h-11 px-4 py-2.5 text-sm rounded-[12px]";
  }
}

function baseClass(fullWidth: boolean, variant: ButtonVariant) {
  const align =
    variant === "textLink"
      ? "inline-flex items-center gap-1.5"
      : "inline-flex items-center justify-center gap-1.5";
  return [
    align,
    variant === "textLink" ? "font-semibold no-underline" : "font-semibold no-underline transition-all",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-offset-white",
    "disabled:cursor-not-allowed disabled:opacity-60",
    fullWidth ? "w-full" : "",
  ].join(" ");
}

// Public helper: build the same className string a Button would render with,
// for cases where we can't render <Button> itself (e.g. wrapping a Next.js
// <Link> via TrackedCtaLink, or extending an existing affiliate wrapper).
// Keep the visual rules in lockstep with Button / AnchorButton.
export function buttonClassName({
  variant = "hotel",
  size,
  fullWidth = false,
  className = "",
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  className?: string;
} = {}) {
  return [baseClass(fullWidth, variant), shapeClass(variant, size), colorClass(variant), className]
    .filter(Boolean)
    .join(" ");
}

export function Button({
  children,
  className = "",
  variant = "hotel",
  size,
  fullWidth = false,
  ...props
}: ButtonProps) {
  return (
    <button
      className={[baseClass(fullWidth, variant), shapeClass(variant, size), colorClass(variant), className].join(" ")}
      {...props}
    >
      {children}
    </button>
  );
}

export function AnchorButton({
  children,
  className = "",
  variant = "hotel",
  size,
  fullWidth = false,
  ...props
}: AnchorButtonProps) {
  return (
    <a
      className={[baseClass(fullWidth, variant), shapeClass(variant, size), colorClass(variant), className].join(" ")}
      {...props}
    >
      {children}
    </a>
  );
}
