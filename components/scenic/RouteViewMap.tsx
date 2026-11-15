type Point = { lat: number; lng: number; tunnel: boolean; km: number; see: Record<string, { side: string }> };
type Station = { name: string; lat: number; lng: number };
type Target = { id: string; name: string; lat: number; lng: number };
export type RouteView = {
  id: string;
  name: string;
  targets: string[];
  sideToKanazawa: "left" | "right";
  from: string;
  to: string;
};

const W = 680;
const H = 460;
const PAD = 34;
const SIDE_COLOR = { right: "#d94a32", left: "#2f6fd6" } as const;

/**
 * A route coloured where its views are, from a viewshed file made by
 * scripts/compute-viewshed.mjs: red where the view is on the right of the
 * direction of travel, blue where it is on the left. Grey is open track with
 * no listed view; dashed is tunnel. Plain SVG, no map tiles.
 */
export function RouteViewMap({
  points,
  stations,
  targets,
  views,
  labelStations,
  direction,
}: {
  points: Point[];
  stations: Station[];
  targets: Target[];
  views: RouteView[];
  labelStations: string[];
  direction: [string, string];
}) {
  const all = [...points, ...targets];
  const minLat = Math.min(...all.map((p) => p.lat));
  const maxLat = Math.max(...all.map((p) => p.lat));
  const minLng = Math.min(...all.map((p) => p.lng));
  const maxLng = Math.max(...all.map((p) => p.lng));
  const k = Math.cos((((minLat + maxLat) / 2) * Math.PI) / 180);
  const s = Math.min((W - 2 * PAD) / ((maxLng - minLng) * k), (H - 2 * PAD) / (maxLat - minLat));
  const ox = (W - (maxLng - minLng) * k * s) / 2;
  const oy = (H - (maxLat - minLat) * s) / 2;
  const project = (p: { lat: number; lng: number }) => ({
    x: +(ox + (p.lng - minLng) * k * s).toFixed(1),
    y: +(oy + (maxLat - p.lat) * s).toFixed(1),
  });

  const colourAt = (p: Point): string | null => {
    for (const view of views) {
      if (view.targets.some((id) => p.see[id]?.side === view.sideToKanazawa)) return SIDE_COLOR[view.sideToKanazawa];
    }
    return null;
  };
  const pts = points.map((p) => ({ ...p, ...project(p), colour: colourAt(p) }));
  const alps = targets.filter((t) => ["tsurugi", "tateyama", "shirouma"].includes(t.id));
  const peakLabels = [
    ...targets.filter((t) => !alps.includes(t)).map((t) => ({ name: t.name, ...project(t) })),
    ...(alps.length
      ? [
          {
            name: "Northern Alps",
            ...project({
              lat: alps.reduce((a, t) => a + t.lat, 0) / alps.length,
              lng: alps.reduce((a, t) => a + t.lng, 0) / alps.length,
            }),
          },
        ]
      : []),
  ];

  return (
    <figure className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_12px_32px_rgba(11,18,32,0.06)]">
      <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full" role="img" aria-label={`Map of the line from ${direction[0]} to ${direction[1]}, coloured where mountains are in view: red on the right, blue on the left`}>
        <rect width={W} height={H} fill="#f3f6f2" />
        <polyline points={pts.map((p) => `${p.x},${p.y}`).join(" ")} fill="none" stroke="#c4cad4" strokeWidth="4" strokeLinejoin="round" strokeLinecap="round" />
        {pts.slice(1).map((p, i) => {
          const a = pts[i];
          if (a.tunnel && p.tunnel) {
            return <line key={`t${i}`} x1={a.x} y1={a.y} x2={p.x} y2={p.y} stroke="#f3f6f2" strokeWidth="2" strokeDasharray="3 4" />;
          }
          const colour = a.colour && p.colour ? p.colour : null;
          return colour ? (
            <line key={`c${i}`} x1={a.x} y1={a.y} x2={p.x} y2={p.y} stroke={colour} strokeWidth="7" strokeLinecap="round" />
          ) : null;
        })}

        {peakLabels.map((peak) => (
          <g key={peak.name} transform={`translate(${peak.x} ${peak.y})`}>
            <path d="M-13 9 L0 -11 L13 9 Z" fill="#5b6b86" />
            <path d="M-5 -3 L0 -11 L5 -3 L2 -1 L0 -4 L-2 -1 Z" fill="#fff" />
            <text y="-16" fill="#0b1220" fontSize="12" fontWeight="700" textAnchor="middle" stroke="#f3f6f2" strokeWidth="3" paintOrder="stroke">{peak.name}</text>
          </g>
        ))}

        {stations.map((st) => {
          const p = project(st);
          const labelled = labelStations.includes(st.name);
          return (
            <g key={st.name}>
              <circle cx={p.x} cy={p.y} r={labelled ? 4.5 : 3} fill="#fff" stroke="#0b1220" strokeWidth="2" />
              {labelled ? (
                <text
                  x={p.x > W - 110 ? p.x - 7 : p.x + 7}
                  y={p.y + 16}
                  textAnchor={p.x > W - 110 ? "end" : "start"}
                  fill="#3b4456"
                  fontSize="11.5"
                  fontWeight="600"
                  stroke="#f3f6f2"
                  strokeWidth="3"
                  paintOrder="stroke"
                >
                  {st.name}
                </text>
              ) : null}
            </g>
          );
        })}

        <g transform={`translate(${PAD} ${H - 22})`} fontSize="12" fontWeight="600">
          <rect x="0" y="-9" width="22" height="7" rx="3.5" fill={SIDE_COLOR.right} />
          <text x="28" y="-2" fill="#3b4456">Right side</text>
          <rect x="110" y="-9" width="22" height="7" rx="3.5" fill={SIDE_COLOR.left} />
          <text x="138" y="-2" fill="#3b4456">Left side</text>
          <text x="214" y="-2" fill="#7a8394">travelling {direction[0]} → {direction[1]}</text>
        </g>
      </svg>
      <figcaption className="px-5 pb-4 pt-2 text-[11.5px] leading-5 text-slate-500">
        Coloured where a terrain model says the summit clears the hills: sight lines over elevation data from the Geospatial Information Authority of Japan (国土地理院), with the curve of the earth. Trees, buildings, noise barriers and weather are not modelled. Dashed sections are tunnels. Track © OpenStreetMap contributors.
      </figcaption>
    </figure>
  );
}
