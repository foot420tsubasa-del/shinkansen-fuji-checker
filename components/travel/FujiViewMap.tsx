import route from "@/data/routes/tokaido-fuji.json";
import type { DirectionId } from "@/lib/seat-checker";

type Pt = { lat: number; lng: number; tunnel?: boolean };

const W = 640;
const H = 360;
const PAD = 28;
const BOUNDS = { minLng: 138.36, maxLng: 139.22, minLat: 34.94, maxLat: 35.42 };
const K = Math.cos((35.15 * Math.PI) / 180);

function project({ lat, lng }: { lat: number; lng: number }) {
  const sx = (W - 2 * PAD) / ((BOUNDS.maxLng - BOUNDS.minLng) * K);
  const sy = (H - 2 * PAD) / (BOUNDS.maxLat - BOUNDS.minLat);
  const s = Math.min(sx, sy);
  const x = PAD + (lng - BOUNDS.minLng) * K * s;
  const y = PAD + (BOUNDS.maxLat - lat) * s;
  return { x: +x.toFixed(1), y: +y.toFixed(1) };
}

/** 0 outside the viewing window, rising to 1 at Shin-Fuji, falling after the Fuji River. */
export function viewHeat(lng: number): number {
  const { opensLng, peakLng, closesLng } = route.view;
  if (lng > opensLng || lng < closesLng) return 0;
  if (lng >= peakLng) return (opensLng - lng) / (opensLng - peakLng);
  return (lng - closesLng) / (peakLng - closesLng);
}

function heatColor(h: number): string {
  // pale yellow → coral → Fuji red
  const stops = [
    [255, 214, 120],
    [255, 122, 92],
    [217, 74, 50],
  ];
  const t = Math.max(0, Math.min(1, h)) * 2;
  const i = Math.min(1, Math.floor(t));
  const f = t - i;
  const c = stops[i].map((v, k) => Math.round(v + (stops[i + 1][k] - v) * f));
  return `rgb(${c[0]},${c[1]},${c[2]})`;
}

/**
 * Where on the line Mt. Fuji is in view: the Tokaido Shinkansen from Odawara
 * to Shizuoka, drawn from OpenStreetMap geometry and coloured by the same
 * timing model as the seat checker and the calendar reminder. A plain SVG with
 * no map tiles, so it costs nothing to load and nothing to serve.
 */
export function FujiViewMap({ direction = "tokyo-osaka" }: { direction?: DirectionId }) {
  const line = route.line as Pt[];
  const pts = line.map((p) => ({ ...p, ...project(p) }));
  const fuji = project(route.fuji);
  const westbound = direction === "tokyo-osaka";
  const segments = pts.slice(1).map((p, i) => {
    const a = pts[i];
    const heat = viewHeat((a.lng + p.lng) / 2);
    return { a, b: p, heat, tunnel: Boolean(a.tunnel && p.tunnel) };
  });
  const peak = project(route.stations.find((s) => s.id === "shin-fuji")!);

  return (
    <figure className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_12px_32px_rgba(11,18,32,0.06)]">
      <div className="flex items-start justify-between gap-3 px-5 pt-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.1em] text-fuji">Where you&apos;ll see it</p>
          <p className="mt-1 text-lg font-bold text-ink">
            Mt. Fuji is on your {westbound ? "right" : "left"} — best at Shin-Fuji
          </p>
        </div>
        <span className="mt-1 shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
          {westbound ? "Tokyo → Kyoto" : "Kyoto → Tokyo"}
        </span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="mt-2 block h-auto w-full" role="img" aria-label="Map of the Tokaido Shinkansen from Odawara to Shizuoka, coloured where Mt. Fuji is in view, brightest at Shin-Fuji Station">
        <defs>
          <linearGradient id="fvm-land" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#eef4ec" />
            <stop offset="1" stopColor="#f7f8f4" />
          </linearGradient>
          <radialGradient id="fvm-glow" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#ff7a5c" stopOpacity="0.28" />
            <stop offset="1" stopColor="#ff7a5c" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width={W} height={H} fill="url(#fvm-land)" />
        <text x={project({ lat: 34.985, lng: 138.62 }).x} y={project({ lat: 34.985, lng: 138.62 }).y} fill="#8fb3c9" fontSize="13" fontStyle="italic" textAnchor="middle">
          Suruga Bay
        </text>

        {/* sight lines from the mountain to the stretch where it is largest */}
        {segments
          .filter((s, i) => s.heat > 0.55 && i % 3 === 0)
          .map((s, i) => (
            <line key={i} x1={fuji.x} y1={fuji.y + 14} x2={s.a.x} y2={s.a.y} stroke="#ff7a5c" strokeOpacity="0.16" strokeWidth="1.2" />
          ))}
        <circle cx={peak.x} cy={peak.y} r="46" fill="url(#fvm-glow)" />

        {/* the line: grey everywhere, coloured where Fuji is in view, dashed in tunnels */}
        <polyline points={pts.map((p) => `${p.x},${p.y}`).join(" ")} fill="none" stroke="#c4cad4" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        {segments.map((s, i) =>
          s.tunnel ? (
            <line key={`t${i}`} x1={s.a.x} y1={s.a.y} x2={s.b.x} y2={s.b.y} stroke="#f7f8f4" strokeWidth="2" strokeDasharray="3 4" />
          ) : null,
        )}
        {segments.map((s, i) =>
          s.heat > 0 ? (
            <line key={`h${i}`} x1={s.a.x} y1={s.a.y} x2={s.b.x} y2={s.b.y} stroke={heatColor(s.heat)} strokeWidth={4 + 5 * s.heat} strokeLinecap="round" />
          ) : null,
        )}

        {/* Mt. Fuji */}
        <g transform={`translate(${fuji.x} ${fuji.y})`}>
          <path d="M-34 22 L-9 -16 Q0 -24 9 -16 L34 22 Z" fill="#5b6b86" />
          <path d="M-14 -8 L-9 -16 Q0 -24 9 -16 L14 -8 L7 -4 L2 -9 L-4 -3 L-9 -7 Z" fill="#ffffff" />
          <text y="40" fill="#0b1220" fontSize="13" fontWeight="700" textAnchor="middle">Mt. Fuji</text>
        </g>

        {route.stations.map((s) => {
          const p = project(s);
          const isPeak = s.id === "shin-fuji";
          return (
            <g key={s.id}>
              <circle cx={p.x} cy={p.y} r={isPeak ? 6 : 4.5} fill="#ffffff" stroke={isPeak ? "#d94a32" : "#0b1220"} strokeWidth="2.5" />
              <text x={p.x} y={p.y + 22} fill={isPeak ? "#d94a32" : "#3b4456"} fontSize="12.5" fontWeight={isPeak ? 800 : 600} textAnchor="middle">
                {s.name}
              </text>
            </g>
          );
        })}

        {/* direction of travel */}
        <g transform={`translate(${W - 150} ${H - 30})`}>
          <text x="0" y="0" fill="#5b6577" fontSize="12" fontWeight="600">
            {westbound ? "← towards Kyoto" : "towards Tokyo →"}
          </text>
        </g>
      </svg>
      <figcaption className="px-5 pb-4 pt-1 text-[11.5px] leading-5 text-slate-500">
        Colour follows the same timing model as the seat checker: the view opens past Mishima, is largest passing Shin-Fuji and closes after the Fuji River. Clouds decide the rest. Dashed sections are tunnels. Track © OpenStreetMap contributors.
      </figcaption>
    </figure>
  );
}
