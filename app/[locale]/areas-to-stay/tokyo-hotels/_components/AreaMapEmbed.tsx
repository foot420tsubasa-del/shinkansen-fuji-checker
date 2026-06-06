/**
 * Lightweight live-map embed for an area's "How this area connects" section.
 *
 * Uses Google Maps' public embed endpoint with the area's lat/lng — no API
 * key required. Wraps the iframe in a rounded card with subtle border and
 * an aspect-video container so layout doesn't shift while the iframe loads.
 *
 * The map is purely an enhancement: surrounding text (titles, qualitative
 * level chips, notes) always renders so essential meaning is never trapped
 * inside the iframe.
 */

type AreaMapEmbedProps = {
  coordinates: { lat: number; lng: number } | null | undefined;
  areaName: string;
  /** Zoom level — defaults to 15 which gives a tight neighborhood view. */
  zoom?: number;
  /** Optional caption rendered below the map. */
  caption?: string;
  /** Localized alt/aria label for accessibility. */
  ariaLabel?: string;
};

export function AreaMapEmbed({
  coordinates,
  areaName,
  zoom = 15,
  caption,
  ariaLabel,
}: AreaMapEmbedProps) {
  if (!coordinates) return null;
  const { lat, lng } = coordinates;
  // Google Maps embed without API key. The `q=lat,lng` form drops a pin
  // exactly on the supplied coordinates; `z` controls the initial zoom.
  const src = `https://maps.google.com/maps?q=${lat},${lng}&z=${zoom}&hl=ja&output=embed`;
  const title = ariaLabel ?? `Map of ${areaName}`;

  return (
    <figure className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-sm">
      <div className="relative aspect-video w-full bg-slate-100">
        <iframe
          src={src}
          title={title}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
          className="absolute inset-0 h-full w-full border-0"
        />
      </div>
      {caption ? (
        <figcaption className="border-t border-slate-100 bg-white px-4 py-3 text-xs leading-5 text-slate-600">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
