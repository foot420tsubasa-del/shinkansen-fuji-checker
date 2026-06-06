import Image from "next/image";

/**
 * Reusable optional-image card. Renders nothing when `src` is null, so a
 * parent can wire it up with `getAreaVisualAsset(slug, slot)` and trust the
 * page won't show a broken placeholder when the asset is missing.
 *
 * Layout:
 *   - rounded card with subtle border on slate-50 background
 *   - fixed aspect-ratio container (choose `aspect` per slot)
 *   - lazy-loaded by default; responsive sizes hint
 *   - optional caption below the image
 *
 * Essential meaning (titles, levels, score numbers) lives in surrounding
 * text — images are enhancement, never the only source of information.
 */

type AreaOptionalImageProps = {
  src: string | null | undefined;
  alt: string;
  caption?: string;
  /** Aspect ratio shorthand for the image container. */
  aspect?: "video" | "wide" | "square" | "portrait";
  className?: string;
};

const ASPECT_CLASS: Record<NonNullable<AreaOptionalImageProps["aspect"]>, string> = {
  video: "aspect-video",        // 16:9 — default landscape
  wide: "aspect-[21/9]",        // wider landscape, e.g. comparison strip
  square: "aspect-square",      // 1:1 — vibe / portrait styles
  portrait: "aspect-[3/4]",     // taller layouts
};

export function AreaOptionalImage({
  src,
  alt,
  caption,
  aspect = "video",
  className = "",
}: AreaOptionalImageProps) {
  if (!src) return null;
  return (
    <figure
      className={[
        "overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-sm",
        className,
      ].join(" ")}
    >
      <div className={["relative w-full", ASPECT_CLASS[aspect]].join(" ")}>
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(min-width: 1024px) 720px, (min-width: 640px) 600px, 100vw"
          className="object-cover"
          loading="lazy"
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
