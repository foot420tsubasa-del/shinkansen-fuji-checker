import { MapPin } from "lucide-react";
import { AreaOptionalImage } from "./AreaOptionalImage";
import { AreaMapEmbed } from "./AreaMapEmbed";

/**
 * "How this area connects" section.
 *
 * Visual tier (priority order):
 *   1. hand-drawn image asset (image.src present)  — best for editorialised
 *      area maps with labelled destinations
 *   2. live Google Maps embed (coordinates present) — works for every area
 *      out of the box, no API key required
 *   3. in-code schematic ("you are here" pill + chip grid) — last-resort
 *      fallback that still communicates the area's position relative to
 *      Narita / Haneda / Shinkansen / Tokyo Station
 *
 * Whatever tier renders, the text labels (Narita Airport / Haneda Airport
 * etc. + qualitative level chips) always render below so essential meaning
 * is never trapped inside a visual element.
 */

export type AccessNode = {
  key: string;
  label: string;
  level: string;
  note?: string;
};

export function AreaAccessSnapshot({
  eyebrow,
  title,
  intro,
  centerLabel,
  centerSublabel,
  nodes,
  qualitativeNote,
  image,
  coordinates,
  mapCaption,
  mapAriaLabel,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
  centerLabel: string;
  centerSublabel?: string;
  nodes: AccessNode[];
  qualitativeNote: string;
  /** Optional generated image. Highest-priority visual tier. */
  image?: { src: string | null | undefined; alt: string; caption?: string };
  /** Area lat/lng. When present and no image is supplied, the section
   *  renders a live Google Maps embed. */
  coordinates?: { lat: number; lng: number } | null;
  /** Caption rendered below the live map embed. */
  mapCaption?: string;
  /** Aria-label for the map iframe. */
  mapAriaLabel?: string;
}) {
  const hasImage = Boolean(image?.src);
  const hasMap = !hasImage && Boolean(coordinates);
  return (
    <section className="mt-6 rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#106b43]">
        {eyebrow}
      </p>
      <h2 className="mt-2 text-xl font-semibold text-slate-950">{title}</h2>
      {intro ? <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{intro}</p> : null}

      {hasImage ? (
        <div className="mt-5">
          <AreaOptionalImage
            src={image?.src ?? null}
            alt={image?.alt ?? ""}
            caption={image?.caption}
            aspect="video"
          />
          <DestinationDl nodes={nodes} />
          <p className="mt-3 text-[11px] leading-4 text-slate-500">{qualitativeNote}</p>
        </div>
      ) : hasMap ? (
        <div className="mt-5">
          <AreaMapEmbed
            coordinates={coordinates ?? null}
            areaName={centerLabel}
            caption={mapCaption}
            ariaLabel={mapAriaLabel}
          />
          <DestinationDl nodes={nodes} />
          <p className="mt-3 text-[11px] leading-4 text-slate-500">{qualitativeNote}</p>
        </div>
      ) : (
        <div className="mt-5 rounded-2xl border border-slate-100 bg-slate-50 p-5">
          {/* Center "you are here" pill */}
          <div className="flex justify-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#0b1a33] bg-white px-4 py-2 shadow-sm">
              <MapPin className="h-4 w-4 text-[#0b1a33]" aria-hidden="true" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#0b1a33]">
                  {centerSublabel}
                </p>
                <p className="text-sm font-bold leading-none text-slate-950">{centerLabel}</p>
              </div>
            </div>
          </div>

          {/* Surrounding destination chips */}
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {nodes.map((node) => (
              <AccessNodeCard key={node.key} node={node} />
            ))}
          </div>

          <p className="mt-4 text-[11px] leading-4 text-slate-500">{qualitativeNote}</p>
        </div>
      )}
    </section>
  );
}

/** Compact destination list rendered below the image or map so qualitative
 *  level chips remain accessible regardless of which visual tier is active. */
function DestinationDl({ nodes }: { nodes: AccessNode[] }) {
  return (
    <dl className="mt-4 grid gap-2 sm:grid-cols-2">
      {nodes.map((node) => (
        <div
          key={node.key}
          className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2"
        >
          <dt className="text-xs font-semibold text-slate-700">{node.label}</dt>
          <dd
            className={[
              "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.06em]",
              levelTone(node.level),
            ].join(" ")}
          >
            {node.level}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function AccessNodeCard({ node }: { node: AccessNode }) {
  const tone = levelTone(node.level);
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-slate-950">{node.label}</p>
        <span
          className={[
            "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.06em]",
            tone,
          ].join(" ")}
        >
          {node.level}
        </span>
      </div>
      {node.note ? (
        <p className="mt-1.5 text-xs leading-5 text-slate-600">{node.note}</p>
      ) : null}
    </div>
  );
}

function levelTone(level: string): string {
  const norm = level.toLowerCase();
  if (norm.includes("excellent")) return "border-emerald-200 bg-emerald-50 text-[#106b43]";
  if (norm.includes("good")) return "border-emerald-100 bg-emerald-50/60 text-[#106b43]";
  if (norm.includes("fair")) return "border-amber-200 bg-amber-50 text-amber-800";
  return "border-slate-200 bg-slate-50 text-slate-700";
}
