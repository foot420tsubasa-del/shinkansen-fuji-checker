import { flipSide, type Direction, type ScenicView, type Side, type ViewshedPoint } from "@/lib/scenic";
import { makeScenicMapFrame } from "@/lib/scenic-map-frame";
import { JapanMapLocator } from "./JapanMapContext";
import { ScenicMapCredits, ScenicTerrainMap } from "./ScenicTerrainMap";

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
 * timeline. The railway overlay uses the same projection as the GSI map.
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
  const frame = makeScenicMapFrame([...points, ...targets], W, H, PAD);
  const { project } = frame;

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
  const locator = points[Math.floor(points.length / 2)];

  return (
    <figure className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_12px_32px_rgba(11,18,32,0.06)]">
      <JapanMapLocator lat={locator.lat} lng={locator.lng} />
      <ScenicTerrainMap frame={frame} label={`Map of the line from ${from} to ${to}, coloured where views are: red on the right, blue on the left`}>
        <polyline points={pts.map((p) => `${p.x},${p.y}`).join(" ")} fill="none" stroke="#fff" strokeWidth="9" strokeLinejoin="round" strokeLinecap="round" />
        <polyline points={pts.map((p) => `${p.x},${p.y}`).join(" ")} fill="none" stroke="#697788" strokeWidth="4.5" strokeLinejoin="round" strokeLinecap="round" />
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
            <text y="-17" fill="#0b1220" className="text-[18px] sm:text-[14px]" fontWeight="700" textAnchor="middle" stroke="white" strokeWidth="4" paintOrder="stroke">
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
                  y={p.y + 20}
                  textAnchor={p.x > W - 110 ? "end" : "start"}
                  fill="#3b4456"
                  className="text-[18px] sm:text-[14px]"
                  fontWeight="700"
                  stroke="white"
                  strokeWidth="4"
                  paintOrder="stroke"
                >
                  {st.name}
                </text>
              ) : null}
            </g>
          );
        })}

      </ScenicTerrainMap>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 border-y border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-700">
        <span className="inline-flex items-center gap-1.5"><span className="h-1.5 w-4 rounded-full bg-[#d94a32]" aria-hidden="true" />Right side</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-1.5 w-4 rounded-full bg-[#2f6fd6]" aria-hidden="true" />Left side</span>
        <span>Heading {from} → {to}</span>
      </div>
      <ScenicMapCredits zoom={frame.zoom} />
      <figcaption className="px-5 pb-4 pt-2 text-[11.5px] leading-5 text-slate-500">
        Coloured sections mark views modelled from GSI elevation data. Dashed sections are tunnels. Trees, buildings, noise barriers and weather are outside the model.
      </figcaption>
    </figure>
  );
}
