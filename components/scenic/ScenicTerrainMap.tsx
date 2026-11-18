import type { ReactNode } from "react";
import type { makeScenicMapFrame } from "@/lib/scenic-map-frame";
import { JapanLand, SEA } from "./JapanMapContext";

const GSI_TILES = "https://cyberjapandata.gsi.go.jp/xyz";

export function ScenicTerrainMap({
  frame,
  children,
  label,
}: {
  frame: ReturnType<typeof makeScenicMapFrame>;
  children: ReactNode;
  label: string;
}) {
  const { width, height, project, tileSize, tiles } = frame;
  return (
    <div className="relative isolate overflow-hidden">
      <svg viewBox={`0 0 ${width} ${height}`} className="absolute inset-0 h-full w-full" aria-hidden="true">
        <rect width={width} height={height} fill={SEA} />
        <JapanLand project={project} />
      </svg>
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        {tiles.map((tile) => {
          const style = {
            left: `${100 * tile.left / width}%`,
            top: `${100 * tile.top / height}%`,
            width: `${100 * (tileSize + 0.15) / width}%`,
            height: `${100 * (tileSize + 0.15) / height}%`,
          };
          return (
            <div key={tile.path} className="absolute" style={style}>
              {/* Native images let the browser load GSI tiles directly with
                  its normal cache and defer offscreen maps. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`${GSI_TILES}/english/${tile.path}`} alt="" loading="lazy" decoding="async" className="absolute inset-0 h-full w-full [filter:saturate(0.55)_contrast(0.75)_brightness(1.14)]" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`${GSI_TILES}/hillshademap/${tile.path}`} alt="" loading="lazy" decoding="async" className="absolute inset-0 h-full w-full opacity-40 mix-blend-multiply" />
            </div>
          );
        })}
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="relative block h-auto w-full" role="img" aria-label={label}>
        {children}
      </svg>
    </div>
  );
}

export function ScenicMapCredits({ zoom }: { zoom: number }) {
  return (
    <p className="border-t border-slate-200 px-4 py-2 text-xs leading-5 text-slate-600">
      Map and shaded relief © <a href="https://maps.gsi.go.jp/" className="underline underline-offset-2">Geospatial Information Authority of Japan (GSI)</a>
      {" · Track © "}<a href="https://www.openstreetmap.org/copyright" className="underline underline-offset-2">OpenStreetMap contributors</a>
      {" · Japan outline: Natural Earth."}
      {zoom <= 8 ? (
        <span className="block">
          Bathymetry: GEBCO Digital Atlas, BODC for IOC and IHO (2003), Japan Coast Guard permission No. 292502.
          {" "}Shoreline: U.S. National Imagery and Mapping Agency, Vector Map Level 0 (VMAP0), USGS Information Services (1997).
        </span>
      ) : null}
    </p>
  );
}
