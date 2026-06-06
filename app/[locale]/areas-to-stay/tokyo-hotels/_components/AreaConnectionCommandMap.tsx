"use client";

import { useEffect, useState } from "react";
import { MapPin } from "lucide-react";
import {
  APIProvider,
  APILoadingStatus,
  AdvancedMarker,
  Map,
  Polyline,
  useApiLoadingStatus,
  useMap,
} from "@vis.gl/react-google-maps";

export type AreaConnectionCommandNode = {
  key: string;
  label: string;
  chip: string;
  note: string;
  position: "topLeft" | "topRight" | "bottomLeft" | "bottomRight";
};

/**
 * Per-area map configuration. The page assembles this from the area's
 * coordinates + a fixed set of Tokyo-side destinations (Narita, Haneda,
 * Tokyo Station, etc.) and passes it in as a prop so this component
 * stays slug-agnostic and works for all 36 area pages.
 */
export type AreaConnectionMapConfig = {
  centerKey: string;
  centerPosition: google.maps.LatLngLiteral;
  centerShortLabel?: string;
  /** Pre-computed midpoint between center and the cluster of destinations.
   *  When omitted, the component falls back to centerPosition. */
  initialMapCenter?: google.maps.LatLngLiteral;
  /** Initial zoom level when no destination is selected. */
  defaultZoom?: number;
  destinations: Array<{
    key: string;
    label: string;
    shortLabel: string;
    position: google.maps.LatLngLiteral;
    tone: "city" | "airport";
  }>;
};

type AreaConnectionCommandMapProps = {
  eyebrow: string;
  title: string;
  intro?: string;
  centerLabel: string;
  centerSubLabel: string;
  qualitativeNote: string;
  nodes: AreaConnectionCommandNode[];
  map: AreaConnectionMapConfig;
};

type MapPoint = {
  key: string;
  label: string;
  shortLabel: string;
  position: google.maps.LatLngLiteral;
  tone: "center" | "city" | "airport";
};

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
const MAP_ID = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID || "";

export function AreaConnectionCommandMap(props: AreaConnectionCommandMapProps) {
  const { eyebrow, title, intro } = props;
  const hasMapConfig = Boolean(API_KEY && MAP_ID);

  return (
    <section className="mt-6 rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#106b43]">
        {eyebrow}
      </p>
      <h2 className="mt-2 text-xl font-semibold text-slate-950">{title}</h2>
      {intro ? <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{intro}</p> : null}

      {hasMapConfig ? (
        <APIProvider apiKey={API_KEY} language="en" region="JP">
          <CommandMapPanel {...props} />
        </APIProvider>
      ) : (
        <FallbackSchematic
          centerLabel={props.centerLabel}
          centerSubLabel={props.centerSubLabel}
          qualitativeNote={props.qualitativeNote}
          nodes={props.nodes}
        />
      )}
    </section>
  );
}

function CommandMapPanel({
  centerLabel,
  centerSubLabel,
  qualitativeNote,
  nodes,
  map,
}: AreaConnectionCommandMapProps) {
  const loadingStatus = useApiLoadingStatus();
  const [activeKey, setActiveKey] = useState<string | null>(null);

  const selectConnection = (key: string) => {
    setActiveKey((current) => (current === key ? null : key));
  };

  if (loadingStatus === APILoadingStatus.FAILED) {
    return (
      <FallbackSchematic
        centerLabel={centerLabel}
        centerSubLabel={centerSubLabel}
        qualitativeNote={qualitativeNote}
        nodes={nodes}
        activeKey={activeKey}
        onSelect={selectConnection}
      />
    );
  }

  const initialMapCenter = map.initialMapCenter ?? map.centerPosition;
  const defaultZoom = map.defaultZoom ?? 13;
  const allPoints: MapPoint[] = [
    {
      key: map.centerKey,
      label: centerLabel,
      shortLabel: map.centerShortLabel ?? centerLabel.charAt(0).toUpperCase(),
      position: map.centerPosition,
      tone: "center",
    },
    ...map.destinations.map<MapPoint>((d) => ({ ...d })),
  ];
  const destinationByKey = new globalThis.Map(map.destinations.map((d) => [d.key, d]));

  function visibleDestinations(): MapPoint[] {
    if (!activeKey) return allPoints.filter((p) => p.key !== map.centerKey);
    const active = destinationByKey.get(activeKey);
    if (!active) return allPoints.filter((p) => p.key !== map.centerKey);
    if (active.tone === "airport") return [active];
    return allPoints.filter((p) => p.key !== map.centerKey);
  }

  function visibleMarkers(): MapPoint[] {
    if (!activeKey) return allPoints;
    const active = destinationByKey.get(activeKey);
    if (!active) return allPoints;
    if (active.tone === "airport") {
      // Keep center marker visible alongside the airport marker
      return [allPoints[0], { ...active }];
    }
    return allPoints;
  }

  return (
    <>
      <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
        <div className="relative h-[360px] min-h-[360px] w-full md:h-[430px]">
          <Map
            defaultCenter={initialMapCenter}
            defaultZoom={defaultZoom}
            mapId={MAP_ID}
            colorScheme="LIGHT"
            disableDefaultUI={true}
            gestureHandling="cooperative"
            backgroundColor="#f8fafc"
            style={{ width: "100%", height: "100%" }}
          >
            <MapViewportController
              activeKey={activeKey}
              centerPosition={map.centerPosition}
              initialMapCenter={initialMapCenter}
              defaultZoom={defaultZoom}
              destinationByKey={destinationByKey}
            />
            {visibleDestinations().map((point) => (
              <Polyline
                key={`line-${point.key}`}
                path={[map.centerPosition, point.position]}
                strokeColor="#dc2626"
                strokeOpacity={activeKey === point.key ? 0.92 : 0.62}
                strokeWeight={activeKey === point.key ? 7 : 4}
                zIndex={activeKey === point.key ? 3 : 1}
              />
            ))}
            {visibleMarkers().map((point) => (
              <AdvancedMarker
                key={point.key}
                position={point.position}
                title={point.label}
                onClick={() => {
                  if (point.key === map.centerKey) {
                    setActiveKey(null);
                    return;
                  }
                  selectConnection(point.key);
                }}
              >
                <MapMarker point={point} isActive={activeKey === point.key} />
              </AdvancedMarker>
            ))}
          </Map>

          <button
            type="button"
            onClick={() => setActiveKey(null)}
            className="absolute left-3 top-3 max-w-[calc(100%-1.5rem)] rounded-2xl border border-white/90 bg-white/95 px-3 py-2 text-left shadow-sm backdrop-blur-sm transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300 md:left-4 md:top-4"
            aria-label={`Reset map to ${centerLabel}`}
          >
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#106b43]">
              {centerSubLabel}
            </p>
            <p className="mt-1 text-sm font-black text-[#0b214a] md:text-base">
              {centerLabel}
            </p>
            <p className="mt-1 text-[11px] leading-4 text-slate-600">
              Simplified map — not a route map.
            </p>
          </button>
        </div>
      </div>
      <ConnectionNotes
        qualitativeNote={qualitativeNote}
        nodes={nodes}
        activeKey={activeKey}
        onSelect={selectConnection}
      />
    </>
  );
}

function MapViewportController({
  activeKey,
  centerPosition,
  initialMapCenter,
  defaultZoom,
  destinationByKey,
}: {
  activeKey: string | null;
  centerPosition: google.maps.LatLngLiteral;
  initialMapCenter: google.maps.LatLngLiteral;
  defaultZoom: number;
  destinationByKey: globalThis.Map<string, { position: google.maps.LatLngLiteral; tone: "city" | "airport" }>;
}) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    if (!activeKey) {
      map.panTo(initialMapCenter);
      map.setZoom(defaultZoom);
      return;
    }

    const active = destinationByKey.get(activeKey);
    if (!active) {
      map.panTo(initialMapCenter);
      map.setZoom(defaultZoom);
      return;
    }

    if (active.tone === "airport") {
      const bounds = new google.maps.LatLngBounds();
      bounds.extend(centerPosition);
      bounds.extend(active.position);
      map.fitBounds(bounds, 72);
      return;
    }

    // City destination — pan + zoom in slightly
    map.panTo(active.position);
    map.setZoom(13.2);
  }, [activeKey, map, centerPosition, initialMapCenter, defaultZoom, destinationByKey]);

  return null;
}

function MapMarker({ point, isActive }: { point: MapPoint; isActive: boolean }) {
  const className =
    point.tone === "center"
      ? "border-red-700 bg-red-600 text-white shadow-[0_10px_26px_rgba(220,38,38,0.34)]"
      : point.tone === "airport" && isActive
        ? "border-red-800 bg-red-700 text-white shadow-[0_9px_24px_rgba(220,38,38,0.34)]"
        : isActive
        ? "border-red-700 bg-red-600 text-white shadow-[0_9px_24px_rgba(220,38,38,0.34)]"
        : "border-red-600 bg-white text-red-700 shadow-[0_6px_18px_rgba(220,38,38,0.22)]";

  return (
    <div className="relative flex -translate-x-1/2 -translate-y-1/2 flex-col items-center">
      <span
        className={[
          "flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-black transition-transform",
          point.tone === "center" ? "h-10 w-10 text-sm" : "",
          isActive ? "scale-125" : "",
          className,
        ].join(" ")}
      >
        {point.shortLabel}
      </span>
      <span
        className={[
          "mt-1 rounded-full border px-2 py-0.5 text-[10px] font-bold shadow-sm",
          isActive ? "border-red-200 bg-red-50 text-red-800" : "border-slate-200 bg-white text-slate-800",
        ].join(" ")}
      >
        {point.label}
      </span>
    </div>
  );
}

function FallbackSchematic({
  centerLabel,
  centerSubLabel,
  qualitativeNote,
  nodes,
  activeKey,
  onSelect,
}: Pick<AreaConnectionCommandMapProps, "centerLabel" | "centerSubLabel" | "qualitativeNote" | "nodes"> & {
  activeKey?: string | null;
  onSelect?: (key: string) => void;
}) {
  return (
    <>
      <div className="mt-5 rounded-2xl border border-slate-100 bg-slate-50 p-5">
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#0b1a33] bg-white px-4 py-2 shadow-sm">
            <MapPin className="h-4 w-4 text-[#0b1a33]" aria-hidden="true" />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#0b1a33]">
                {centerSubLabel}
              </p>
              <p className="text-sm font-bold leading-none text-slate-950">{centerLabel}</p>
            </div>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {nodes.map((node) => (
            <DestinationCard
              key={node.key}
              node={node}
              isActive={activeKey === node.key}
              onSelect={onSelect}
            />
          ))}
        </div>
      </div>
      <p className="mt-3 text-[11px] leading-4 text-slate-500">{qualitativeNote}</p>
    </>
  );
}

function ConnectionNotes({
  qualitativeNote,
  nodes,
  activeKey,
  onSelect,
}: Pick<AreaConnectionCommandMapProps, "qualitativeNote" | "nodes"> & {
  activeKey: string | null;
  onSelect: (key: string) => void;
}) {
  return (
    <>
      <p className="mt-3 text-[11px] leading-4 text-slate-500">{qualitativeNote}</p>
      <div className="mt-4 grid gap-3 md:grid-cols-4">
        {nodes.map((node) => (
          <DestinationCard
            key={node.key}
            node={node}
            isActive={activeKey === node.key}
            onSelect={onSelect}
          />
        ))}
      </div>
    </>
  );
}

function DestinationCard({
  node,
  isActive = false,
  onSelect,
}: {
  node: AreaConnectionCommandNode;
  isActive?: boolean;
  onSelect?: (key: string) => void;
}) {
  const isInteractive = Boolean(onSelect);

  return (
    <button
      type="button"
      onClick={() => onSelect?.(node.key)}
      disabled={!isInteractive}
      aria-pressed={isInteractive ? isActive : undefined}
      className={[
        "w-full rounded-2xl border p-4 text-left shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300",
        isActive
          ? "border-red-300 bg-red-50"
          : "border-slate-200 bg-white hover:border-red-200 hover:bg-red-50/40",
        !isInteractive ? "cursor-default hover:border-slate-200 hover:bg-white" : "",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-sm font-bold leading-5 text-[#0b214a]">{node.label}</h3>
        <span
          className={[
            "shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.06em]",
            isActive ? "border-red-300 bg-red-600 text-white" : "border-sky-200 bg-sky-50 text-sky-800",
          ].join(" ")}
        >
          {node.chip}
        </span>
      </div>
      <p className="mt-2 text-xs leading-5 text-slate-600">{node.note}</p>
    </button>
  );
}
