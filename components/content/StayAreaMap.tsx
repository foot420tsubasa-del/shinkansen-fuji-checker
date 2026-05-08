import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { DEFAULT_STAY_AREA_MAP_DISCLAIMER } from "@/lib/stay-area-map-constants";
import { getRenderableStayAreaMap } from "@/lib/stay-area-maps";

type StayAreaMapProps = {
  mapId?: string;
  src?: string;
  alt?: string;
  title?: string;
  caption?: string;
  disclaimer?: string;
  className?: string;
  priority?: boolean;
  width?: number;
  height?: number;
};

export async function StayAreaMap({
  mapId,
  src,
  alt,
  title,
  caption,
  disclaimer,
  className = "",
  priority = false,
  width = 1448,
  height = 1086,
}: StayAreaMapProps) {
  const t = await getTranslations("stayAreaMap");
  const config = mapId ? getRenderableStayAreaMap(mapId) : null;
  const resolvedSrc = config?.src ?? src;
  const resolvedAlt = config?.alt ?? alt;
  const resolvedTitle = config?.title ?? title;
  const resolvedCaption = config?.caption ?? caption;
  const resolvedDisclaimer = config?.disclaimer?.trim() || disclaimer || t("defaultDisclaimer") || DEFAULT_STAY_AREA_MAP_DISCLAIMER;

  if (mapId && !config) return null;
  if (!resolvedSrc || !resolvedAlt) return null;

  return (
    <figure
      className={`overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-[0_18px_42px_rgba(15,23,42,0.08)] ${className}`}
    >
      {resolvedTitle ? (
        <div className="border-b border-slate-100 px-5 py-4">
          <h2 className="text-base font-semibold text-slate-950">{resolvedTitle}</h2>
        </div>
      ) : null}
      <div className="bg-slate-50 p-3 sm:p-4">
        <Image
          src={resolvedSrc}
          alt={resolvedAlt}
          width={width}
          height={height}
          priority={priority}
          loading={priority ? undefined : "lazy"}
          decoding="async"
          className="mx-auto aspect-[4/3] w-full max-w-4xl rounded-2xl border border-slate-200 bg-white object-contain"
        />
      </div>
      {resolvedCaption || resolvedDisclaimer ? (
        <figcaption className="space-y-2 border-t border-slate-100 px-5 py-4 text-xs leading-5 text-slate-500">
          {resolvedCaption ? <p>{resolvedCaption}</p> : null}
          {resolvedDisclaimer ? (
            <p className="text-[11px] leading-5 text-slate-400">{resolvedDisclaimer}</p>
          ) : null}
        </figcaption>
      ) : null}
    </figure>
  );
}
