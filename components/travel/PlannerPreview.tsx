import { ArrowRight, ExternalLink, MapPinned, Mountain, Route, Train } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Card } from "@/components/ui/Card";
import { JR_PASS_URL } from "@/src/affiliateLinks";

const routeStops = [
  { nameKey: "tokyo", detailKey: "start", x: 15, y: 70 },
  { nameKey: "fujiView", detailKey: "seatEWindow", x: 39, y: 48, featured: true },
  { nameKey: "kyoto", detailKey: "temples", x: 66, y: 62 },
  { nameKey: "osaka", detailKey: "food", x: 83, y: 47 },
];

export function PlannerPreview() {
  const t = useTranslations("planner.preview");

  const statLabels = [t("arrival"), t("cities"), t("tripLength"), t("style")];
  const statValues = [t("narita"), t("fourCities"), t("sevenDays"), t("firstTime")];

  const highlights = [
    [t("time"), t("tokyoToKyoto")],
    [t("seatE"), t("fujiWindow")],
    [t("threeNights"), t("kyotoBase")],
  ];

  return (
    <Card className="overflow-hidden">
      <div className="border-b border-slate-200 bg-white px-5 py-4 md:px-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase text-slate-500">
            {t("badge")}
          </p>
          <h2 className="mt-1 text-xl font-semibold leading-tight text-slate-950">
            {t("title")}
          </h2>
          <p className="mt-1 text-sm leading-5 text-slate-500">
            {t("subtitle")}
          </p>
        </div>
        <div className="hidden rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sky-700 sm:block">
          <MapPinned className="h-6 w-6" />
        </div>
      </div>
      </div>

      <div className="px-5 py-4 md:px-6">
      <div className="grid gap-2 sm:grid-cols-4">
        {statValues.map((item, index) => (
          <div key={item} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
            <p className="text-[10px] font-semibold text-slate-400">
              {statLabels[index]}
            </p>
            <p className="mt-1 truncate text-xs font-semibold text-slate-800">{item}</p>
          </div>
        ))}
      </div>

      <div className="mt-3 rounded-[24px] border border-slate-200 bg-[linear-gradient(180deg,#f8fbff,#eef6ff)] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase text-slate-500">
          <Route className="h-3.5 w-3.5" />
          {t("routeOverview")}
        </div>
        <div className="relative mt-5 min-h-[230px] overflow-hidden rounded-[22px] border border-sky-100 bg-[#eaf6ff] shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_24%,rgba(125,211,252,0.5),transparent_22%),radial-gradient(circle_at_76%_22%,rgba(187,247,208,0.5),transparent_18%),linear-gradient(135deg,#f8fcff_0%,#e7f4ff_54%,#f7fbff_100%)]" />
          <div className="absolute inset-0 opacity-35 [background-image:linear-gradient(rgba(14,116,144,0.09)_1px,transparent_1px),linear-gradient(90deg,rgba(14,116,144,0.09)_1px,transparent_1px)] [background-size:34px_34px]" />

          <svg
            aria-label={t("svgLabel")}
            className="absolute inset-0 h-full w-full"
            viewBox="0 0 760 300"
            preserveAspectRatio="xMidYMid meet"
          >
            <path
              d="M-30 198C94 165 173 184 263 147C361 106 438 118 538 83C634 50 704 68 795 28V340H-30Z"
              fill="#dff3fb"
            />
            <path
              d="M-20 225C95 201 178 214 270 178C369 139 444 150 548 116C639 86 706 101 785 70"
              fill="none"
              stroke="#b6dff2"
              strokeWidth="1.5"
              strokeDasharray="5 9"
            />
            <path
              d="M112 210C176 178 246 170 304 138C388 92 491 92 634 41"
              fill="none"
              stroke="#bfdbfe"
              strokeLinecap="round"
              strokeWidth="26"
              opacity="0.56"
            />
            <path
              d="M112 210C176 178 246 170 304 138C388 92 491 92 634 41"
              fill="none"
              stroke="#2563eb"
              strokeLinecap="round"
              strokeWidth="5"
            />
            <path
              d="M112 210C176 178 246 170 304 138"
              fill="none"
              stroke="#10b981"
              strokeLinecap="round"
              strokeWidth="5"
              strokeDasharray="9 10"
            />
            <circle cx="304" cy="138" r="44" fill="#bbf7d0" opacity="0.36" stroke="#34d399" strokeWidth="2" />
            <path d="M274 164L304 105L338 164H274Z" fill="#22c55e" opacity="0.95" />
            <path d="M292 164L304 124L324 164H292Z" fill="#f8fafc" opacity="0.92" />
          </svg>

          <div className="absolute left-[35%] top-[31%] flex -translate-x-1/2 items-center gap-1 rounded-full border border-emerald-200 bg-white/92 px-2 py-1 text-[10px] font-semibold text-emerald-700 shadow-sm">
            <Mountain className="h-3 w-3" />
            {t("fujiZone")}
          </div>

          {routeStops.map((node) => (
            <div
              key={`${node.nameKey}-marker`}
              className={[
                "absolute z-10 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_5px_rgba(29,78,216,0.12)]",
                node.featured ? "bg-emerald-500" : node.nameKey === "osaka" ? "bg-orange-500" : "bg-blue-600",
              ].join(" ")}
              style={{ left: `${node.x}%`, top: `${node.y}%` }}
            />
          ))}

          <div className="absolute inset-x-3 bottom-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {routeStops.map((node, index) => (
              <div key={node.nameKey} className="rounded-xl border border-white/90 bg-white/90 px-3 py-2 shadow-[0_12px_24px_rgba(15,23,42,0.10)] backdrop-blur">
                <div className="flex items-center gap-2">
                  <span
                    className={[
                      "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[10px] font-semibold",
                      node.featured
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : node.nameKey === "osaka"
                          ? "border-orange-200 bg-orange-50 text-orange-700"
                          : "border-blue-200 bg-blue-50 text-blue-700",
                    ].join(" ")}
                  >
                    {node.featured ? <Train className="h-3 w-3" /> : index + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-slate-800">{t(node.nameKey)}</p>
                    <p className="truncate text-[10px] text-slate-500">{t(node.detailKey)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        {highlights.map(([value, label]) => (
          <div key={label} className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3">
            <div className="text-base font-semibold text-slate-950">{value}</div>
            <div className="text-[10px] text-slate-500">{label}</div>
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        <Link
          href="/planner"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-[#07142f] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
        >
          {t("planTrip")}
          <ArrowRight className="h-4 w-4" />
        </Link>
        <a
          href={JR_PASS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm font-semibold text-amber-800 transition-all hover:bg-amber-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-200"
        >
          {t("checkJrPass")}
          <ExternalLink className="h-4 w-4" />
        </a>
        <Link
          href="/command-center"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-sky-200 bg-sky-50 px-4 py-2.5 text-sm font-semibold text-sky-700 transition-all hover:bg-sky-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-200"
        >
          {t("routeMap")}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      </div>
    </Card>
  );
}
