import { AgodaHotelMapClient } from "@/components/affiliate/AgodaHotelMapClient";
import { getAgodaHotelMap, isActiveAgodaHotelMap } from "@/lib/agoda-hotel-maps";

type AgodaHotelMapProps = {
  mapId: string;
  placement?: string;
  title?: string;
  description?: string;
  className?: string;
  locale?: string;
};

export function AgodaHotelMap({
  mapId,
  placement,
  title,
  description,
  className,
  locale,
}: AgodaHotelMapProps) {
  // Currently disabled / not used in normal page strategy.
  // Agoda Hotel Map embeds can include fixed dates, external scripts, limited UI control, and extra page weight.
  // Keep the component available for draft experiments, but do not use it as the primary hotel CTA path.
  const config = getAgodaHotelMap(mapId);
  if (!isActiveAgodaHotelMap(config)) return null;

  return (
    <AgodaHotelMapClient
      config={config}
      placement={placement ?? config.placementDefault}
      title={title ?? config.label}
      description={description ?? `Use this Agoda map to compare hotels around ${config.areaName}.`}
      className={className}
      locale={locale}
    />
  );
}
