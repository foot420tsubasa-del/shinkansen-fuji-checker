import { flipSide, type Direction, type ScenicView, type Side, type ViewshedPoint } from "@/lib/scenic";

type Point = ViewshedPoint & { lat: number; lng: number };
type Station = { name: string; lat: number; lng: number };
type Target = { id: string; name: string; lat: number; lng: number };

const W = 680;
const H = 460;
const PAD = 34;
const SIDE_COLOR: Record<Side, string> = { right: "#d94a32", left: "#2f6fd6" };

/**
 * A route coloured where its views are, from a viewshed file made by
 * scripts/compute-viewshed.mjs: red where the view is on the right of the
 * direction of travel, blue on the left. Grey is open track with no listed
 * view; dashed is tunnel. `highlight` dims every view but one, for the
 * timeline. Plain SVG, no map tiles, usable on the server or the client.
 */
export function RouteViewMap({
  points,
  stations,
  targets,
  views,
  labelStations,
  direction = "forward",
  directionLabel,
  highlight = null,
}: {
  points: Point[];
  stations: Station[];
  targets: Target[];
  views: ScenicView[];
  labelStations: string[];
  direction?: Direction;
  directionLabel: [string, string];
  highlight?: string | null;
}) {
  // Only summits a listed view uses, and only real points: the sea has no
  // single location, and a mountain 70 km off would shrink the line to a dot.
  const used = new Set(views.flatMap((v) => v.targets));
  targets = targets.filter((t) => used.has(t.id) && (t.lat !== 0 || t.lng !== 0));
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

  const colourAt = (p: Point): { colour: string; viewId: string } | null => {
    for (const view of views) {
      if (p.km < view.kmFrom || p.km > view.kmTo) continue;
      if (view.targets.some((id) => p.see[id]?.side === view.side.forward)) {
        const side = direction === "forward" ? view.side.forward : flipSide(view.side.forward);
        return { colour: SIDE_COLOR[side], viewId: view.id };
      }
    }
    return null;
  };
  const pts = points.map((p) => ({ ...p, ...project(p), hit: colourAt(p) }));
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
  const [from, to] = direction === "forward" ? directionLabel : [directionLabel[1], directionLabel[0]];

  return (
    <figure className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_12px_32px_rgba(11,18,32,0.06)]">
      <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full" role="img" aria-label={`Map of the line from ${from} to ${to}, coloured where views are: red on the right, blue on the left`}>
        <rect width={W} height={H} fill="#f3f6f2" />
        <polyline points={pts.map((p) => `${p.x},${p.y}`).join(" ")} fill="none" stroke="#c4cad4" strokeWidth="4" strokeLinejoin="round" strokeLinecap="round" />
        {pts.slice(1).map((p, i) => {
          const a = pts[i];
          if (a.tunnel && p.tunnel) {
            return <line key={`t${i}`} x1={a.x} y1={a.y} x2={p.x} y2={p.y} stroke="#f3f6f2" strokeWidth="2" strokeDasharray="3 4" />;
          }
          const hit = a.hit && p.hit && a.hit.viewId === p.hit.viewId ? a.hit : null;
          if (!hit) return null;
          const dim = highlight && hit.viewId !== highlight;
          return (
            <line
              key={`c${i}`}
              x1={a.x}
              y1={a.y}
              x2={p.x}
              y2={p.y}
              stroke={hit.colour}
              strokeOpacity={dim ? 0.25 : 1}
              strokeWidth={highlight && !dim ? 10 : 7}
              strokeLinecap="round"
            />
          );
        })}

        {peakLabels.map((peak) => (
          <g key={peak.name} transform={`translate(${peak.x} ${peak.y})`}>
            <path d="M-13 9 L0 -11 L13 9 Z" fill="#5b6b86" />
            <path d="M-5 -3 L0 -11 L5 -3 L2 -1 L0 -4 L-2 -1 Z" fill="#fff" />
            <text y="-16" fill="#0b1220" fontSize="12" fontWeight="700" textAnchor="middle" stroke="#f3f6f2" strokeWidth="3" paintOrder="stroke">
              {peak.name}
            </text>
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
          <text x="214" y="-2" fill="#7a8394">travelling {from} → {to}</text>
        </g>
      </svg>
      <figcaption className="px-5 pb-4 pt-2 text-[11.5px] leading-5 text-slate-500">
        Coloured where a terrain model finds the view — a summit clearing the hills, open water beside the line, or a valley falling away below it: sight lines over elevation data from the Geospatial Information Authority of Japan (国土地理院), with the curve of the earth. Trees, buildings, noise barriers and weather are not modelled. Dashed sections are tunnels. Track © OpenStreetMap contributors.
      </figcaption>
    </figure>
  );
}
