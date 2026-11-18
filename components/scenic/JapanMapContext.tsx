import scenicOverview from "@/data/scenic-overview.json";

const LAND = "#e8eee2";
export const SEA = "#d9ebf3";

export function JapanLand({ project }: { project: (p: { lat: number; lng: number }) => { x: number; y: number } }) {
  return (
    <g aria-hidden="true">
      {scenicOverview.outline.map((ring, index) => (
        <polygon
          key={index}
          points={ring.map(([lng, lat]) => {
            const { x, y } = project({ lat, lng });
            return `${x},${y}`;
          }).join(" ")}
          fill={LAND}
          stroke="#aebfae"
          strokeWidth="1"
        />
      ))}
    </g>
  );
}

function japanLocator({ lat, lng }: { lat: number; lng: number }) {
  return { x: +((lng - 127) * 4.7).toFixed(1), y: +((46.5 - lat) * 5.7).toFixed(1) };
}

export function JapanMapLocator({ lat, lng }: { lat: number; lng: number }) {
  const locator = japanLocator({ lat, lng });
  return (
    <div className="flex items-center gap-3 border-b border-slate-200 px-4 py-2.5">
      <svg viewBox="0 0 100 100" className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-[#d9ebf3]" role="img" aria-label="Approximate location of the mapped section in Japan">
        <JapanLand project={japanLocator} />
        <circle cx={locator.x} cy={locator.y} r="5.5" fill="#d94a32" stroke="white" strokeWidth="2" />
      </svg>
      <div>
        <p className="text-sm font-bold text-slate-900">Where in Japan?</p>
        <p className="text-xs text-slate-600">The dot locates the section shown below.</p>
      </div>
    </div>
  );
}
