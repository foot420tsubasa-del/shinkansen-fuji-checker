"use client";

import { Cloud, CloudSun, Sun } from "lucide-react";
import { useTranslations } from "next-intl";
import type { FujiVisibility } from "@/lib/seat-checker";

type WeatherVisibilityChipProps = {
  data: FujiVisibility | null;
  loading: boolean;
  error: boolean;
};

export function WeatherVisibilityChip({ data, loading, error }: WeatherVisibilityChipProps) {
  const t = useTranslations("home");

  if (loading) {
    return (
      <span className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50 px-3 py-1.5 text-[11px] font-semibold text-sky-700">
        <CloudSun className="h-3.5 w-3.5 shrink-0" />
        <span className="truncate">{t("visChecking")}</span>
      </span>
    );
  }

  if (error || !data) {
    return (
      <span className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] font-semibold text-slate-500">
        <Cloud className="h-3.5 w-3.5 shrink-0" />
        <span className="truncate">{t("visUnavailable")}</span>
      </span>
    );
  }

  const config = {
    high: {
      label: t("visHigh"),
      icon: <Sun className="h-3.5 w-3.5 shrink-0" />,
      className: "border-emerald-200 bg-emerald-50 text-emerald-700",
    },
    medium: {
      label: t("visMedium"),
      icon: <CloudSun className="h-3.5 w-3.5 shrink-0" />,
      className: "border-amber-200 bg-amber-50 text-amber-700",
    },
    low: {
      label: t("visLow"),
      icon: <Cloud className="h-3.5 w-3.5 shrink-0" />,
      className: "border-slate-200 bg-slate-100 text-slate-700",
    },
  }[data.visibility];

  return (
    <span
      className={[
        "inline-flex max-w-full items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-semibold",
        config.className,
      ].join(" ")}
    >
      {config.icon}
      <span className="truncate">
        {config.label} · {data.cloudPercent}%
      </span>
    </span>
  );
}
