"use client";

import type { ComponentType, ReactNode, SVGProps } from "react";
import {
  ArrowUpRight,
  Landmark,
  Leaf,
  Luggage,
  MoonStar,
  PlaneTakeoff,
  ShoppingBag,
  Sparkles,
  TrainFront,
  Users,
  Wallet,
  Wine,
} from "lucide-react";

// Purpose-based pictogram chips.
//
// The component is i18n-ready: callers pass already-translated labels via the
// `chips` prop (or via the `label` field of each chip). Default chip keys map
// to a stable icon registry so caller code only needs to choose keys + provide
// translated labels (typically via next-intl's useTranslations).
//
// This component intentionally does NOT call useTranslations itself, so it can
// be embedded under any locale namespace without forcing a particular key
// structure.

export type PurposeKey =
  // Default 5 — keep these together unless the page truly needs a different set.
  | "firstTime"
  | "airportAccess"
  | "shinkansen"
  | "quietLocal"
  | "family"
  // Optional, contextual additions.
  | "budget"
  | "nightlife"
  | "shopping"
  | "culture"
  | "luggage"
  | "lateArrival";

type LucideIcon = ComponentType<SVGProps<SVGSVGElement>>;

const ICON_REGISTRY: Record<PurposeKey, LucideIcon> = {
  firstTime: Sparkles,
  airportAccess: PlaneTakeoff,
  shinkansen: TrainFront,
  quietLocal: Leaf,
  family: Users,
  budget: Wallet,
  nightlife: Wine,
  shopping: ShoppingBag,
  culture: Landmark,
  luggage: Luggage,
  lateArrival: MoonStar,
};

export const DEFAULT_PURPOSE_KEYS: ReadonlyArray<PurposeKey> = [
  "firstTime",
  "airportAccess",
  "shinkansen",
  "quietLocal",
  "family",
];

export type PurposeChipItem = {
  /** Stable purpose key used to pick the default icon + analytics id. */
  key: PurposeKey;
  /** Already-translated label shown next to the icon. */
  label: ReactNode;
  /** Optional in-page anchor (e.g. "#shinjuku") or internal route. */
  href?: string;
  /** Optional click handler (filter behavior). When passed, renders as <button>. */
  onClick?: () => void;
  /** Marks the chip as currently selected (for filter UIs). */
  selected?: boolean;
  /** Override the default icon if needed. */
  icon?: LucideIcon;
  /** Optional accessible description for screen readers. */
  ariaLabel?: string;
  /**
   * When true, renders a subtle outbound-arrow glyph after the label to hint
   * that activating the chip leaves the current page (e.g. the Quiet local
   * chip routing to /local-tokyo, while sibling chips jump to in-page anchors).
   * Visually consistent with the green chip — same color, slightly muted size.
   */
  external?: boolean;
};

type PurposeChipsProps = {
  /** Section title — already translated by caller. Pass `null` to hide. */
  title?: ReactNode;
  /** Optional short helper line under the title. */
  subtitle?: ReactNode;
  chips: PurposeChipItem[];
  /** Layout: "wrap" lets chips wrap (default); "scroll" enables horizontal scroll on small screens. */
  layout?: "wrap" | "scroll";
  className?: string;
};

function chipClass(selected: boolean) {
  const base =
    "inline-flex min-h-10 items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-semibold transition-colors no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-offset-white focus-visible:ring-emerald-200";
  if (selected) {
    return [
      base,
      "border-[#168a56] bg-[#168a56] text-white hover:bg-[#0f6f45]",
    ].join(" ");
  }
  return [
    base,
    "border-[#9fd7bd] bg-[#f0fbf6] text-[#106b43] hover:border-[#168a56] hover:bg-[#e3f6ec]",
  ].join(" ");
}

function ChipInner({
  icon: Icon,
  label,
  external,
}: {
  icon: LucideIcon;
  label: ReactNode;
  external?: boolean;
}) {
  return (
    <>
      <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
      <span className="whitespace-nowrap">{label}</span>
      {external ? (
        <ArrowUpRight
          className="h-3.5 w-3.5 shrink-0 opacity-70"
          aria-hidden="true"
        />
      ) : null}
    </>
  );
}

export function PurposeChips({
  title,
  subtitle,
  chips,
  layout = "wrap",
  className = "",
}: PurposeChipsProps) {
  if (chips.length === 0) return null;

  const listClass =
    layout === "scroll"
      ? "mt-3 -mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      : "mt-3 flex flex-wrap gap-2";

  return (
    <section className={className}>
      {title !== undefined && title !== null ? (
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#106b43]">
          {title}
        </p>
      ) : null}
      {subtitle ? (
        <p className="mt-1 text-sm leading-5 text-slate-600">{subtitle}</p>
      ) : null}
      <div className={listClass} role={layout === "scroll" ? "list" : undefined}>
        {chips.map((chip) => {
          const Icon = chip.icon ?? ICON_REGISTRY[chip.key];
          const selected = Boolean(chip.selected);
          const cls = chipClass(selected);
          const inner = (
            <ChipInner icon={Icon} label={chip.label} external={chip.external} />
          );

          if (chip.onClick) {
            return (
              <button
                key={chip.key}
                type="button"
                onClick={chip.onClick}
                aria-pressed={selected}
                aria-label={chip.ariaLabel}
                className={cls}
              >
                {inner}
              </button>
            );
          }

          if (chip.href) {
            return (
              <a key={chip.key} href={chip.href} aria-label={chip.ariaLabel} className={cls}>
                {inner}
              </a>
            );
          }

          return (
            <span
              key={chip.key}
              role="presentation"
              aria-label={chip.ariaLabel}
              className={cls}
            >
              {inner}
            </span>
          );
        })}
      </div>
    </section>
  );
}

export { ICON_REGISTRY as PURPOSE_ICONS };
