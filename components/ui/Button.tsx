import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

// New variants (Phase 1 design system):
//   commercial      — orange, used for booking/affiliate/commercial CTAs.
//   internal        — green filled, used for internal navigation / decision-support.
//   internalOutline — green outline, secondary internal CTA.
// Legacy variants (kept as backward-compatible aliases — visuals unchanged):
//   primary, affiliate, secondary, navy, ghost.
export type ButtonVariant =
  | "commercial"
  | "internal"
  | "internalOutline"
  | "navy"
  | "ghost"
  | "primary"
  | "affiliate"
  | "secondary";

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

const LEGACY_VARIANTS = new Set<ButtonVariant>(["primary", "affiliate", "secondary", "navy", "ghost"]);

function colorClass(variant: ButtonVariant) {
  switch (variant) {
    case "navy":
      return "border border-slate-700 bg-[#0b1a33] text-sky-200 hover:bg-[#132744] focus-visible:ring-slate-300";
    case "commercial":
    case "affiliate":
      return "border border-[#ff7a00] bg-[#ff7a00] text-white shadow-sm shadow-orange-200/60 hover:bg-[#e66700] focus-visible:ring-orange-200";
    case "internalOutline":
    case "secondary":
      return "border border-[#9fd7bd] bg-white text-[#106b43] hover:border-[#168a56] hover:bg-[#f0fbf6] focus-visible:ring-emerald-200";
    case "ghost":
      return "text-slate-600 hover:bg-slate-100 focus-visible:ring-slate-200";
    case "internal":
    case "primary":
    default:
      return "border border-[#168a56] bg-[#168a56] text-white shadow-sm shadow-emerald-100/60 hover:bg-[#0f6f45] focus-visible:ring-emerald-200";
  }
}

// Legacy callers (variant=primary/affiliate/secondary/navy/ghost without an
// explicit size) keep the previous look: rounded-2xl px-4 py-2.5 no min-height.
// New variants (commercial/internal/internalOutline) opt into the Phase 1
// design system sizes (~48px mobile / ~44px desktop, 12–14px radius).
function shapeClass(variant: ButtonVariant, size: ButtonSize | undefined) {
  if (!size && LEGACY_VARIANTS.has(variant)) {
    return "rounded-2xl px-4 py-2.5 text-sm";
  }
  switch (size ?? "md") {
    case "sm":
      return "min-h-9 px-3 py-1.5 text-xs rounded-[10px]";
    case "lg":
      return "min-h-[52px] md:min-h-12 px-5 py-3 text-sm md:text-[15px] rounded-[14px]";
    case "md":
    default:
      return "min-h-12 md:min-h-11 px-4 py-2.5 text-sm rounded-[12px]";
  }
}

function baseClass(fullWidth: boolean) {
  return [
    "inline-flex items-center justify-center gap-1.5 font-semibold no-underline transition-all",
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
  variant = "internal",
  size,
  fullWidth = false,
  className = "",
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  className?: string;
} = {}) {
  return [baseClass(fullWidth), shapeClass(variant, size), colorClass(variant), className]
    .filter(Boolean)
    .join(" ");
}

export function Button({
  children,
  className = "",
  variant = "internal",
  size,
  fullWidth = false,
  ...props
}: ButtonProps) {
  return (
    <button
      className={[baseClass(fullWidth), shapeClass(variant, size), colorClass(variant), className].join(" ")}
      {...props}
    >
      {children}
    </button>
  );
}

export function AnchorButton({
  children,
  className = "",
  variant = "internal",
  size,
  fullWidth = false,
  ...props
}: AnchorButtonProps) {
  return (
    <a
      className={[baseClass(fullWidth), shapeClass(variant, size), colorClass(variant), className].join(" ")}
      {...props}
    >
      {children}
    </a>
  );
}
