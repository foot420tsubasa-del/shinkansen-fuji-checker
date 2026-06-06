import {
  Building2,
  Compass,
  DoorOpen,
  Luggage,
  Moon,
  MountainSnow,
  Plane,
  ShoppingBag,
  Sparkles,
  Train,
  Users,
  Utensils,
} from "lucide-react";
import type { ComponentType, SVGProps } from "react";
import { AreaOptionalImage } from "./AreaOptionalImage";

/**
 * "At a glance" — 4 compact feature cards.
 *
 * The page derives features from existing area data:
 *   - editorial.bestFor (top items)
 *   - high primary sub-scores
 *   - editorial.localFeelNote summary
 *
 * Each card renders an icon + short title + 1-line explanation.
 * Reusable across all 36 area pages; nothing is hardcoded per slug.
 */

export type FeatureHighlight = {
  key: string;
  iconKey: FeatureIconKey;
  title: string;
  body: string;
};

const ICONS = {
  airport: Plane,
  luggage: Luggage,
  station: DoorOpen,
  trains: Train,
  local: Sparkles,
  food: Utensils,
  sights: Compass,
  shopping: ShoppingBag,
  quiet: Moon,
  hotels: Building2,
  nature: MountainSnow,
  group: Users,
} as const;

export type FeatureIconKey = keyof typeof ICONS;

export function AreaFeatureHighlights({
  eyebrow,
  title,
  intro,
  features,
  image,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
  features: FeatureHighlight[];
  /** Optional generated "area vibe" image. Sits above the feature grid when
   *  present; the text cards always render below so meaning is never lost. */
  image?: { src: string | null | undefined; alt: string; caption?: string };
}) {
  return (
    <section className="mt-6 rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#106b43]">
        {eyebrow}
      </p>
      <h2 className="mt-2 text-xl font-semibold text-slate-950">{title}</h2>
      {intro ? <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{intro}</p> : null}

      {image?.src ? (
        <div className="mt-5">
          <AreaOptionalImage
            src={image.src}
            alt={image.alt}
            caption={image.caption}
            aspect="video"
          />
        </div>
      ) : null}

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((f) => (
          <HighlightCard key={f.key} feature={f} />
        ))}
      </div>
    </section>
  );
}

function HighlightCard({ feature }: { feature: FeatureHighlight }) {
  const Icon: ComponentType<SVGProps<SVGSVGElement>> = ICONS[feature.iconKey];
  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4">
      <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white text-[#106b43] shadow-sm">
        <Icon className="h-4 w-4" aria-hidden="true" />
      </span>
      <h3 className="text-sm font-semibold text-slate-950">{feature.title}</h3>
      <p className="text-xs leading-5 text-slate-700">{feature.body}</p>
    </div>
  );
}
