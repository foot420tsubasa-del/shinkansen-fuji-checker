"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  Luggage,
  Map,
  Plane,
  Shield,
  Train,
  Wifi,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Card } from "@/components/ui/Card";
import type { TripPick } from "@/lib/trip-picks";
import { trackAffiliateClick } from "@/lib/analytics";
import { AFFILIATE_REL } from "@/lib/link-rel";

const STORAGE_KEY = "fujiseat-trip-checks";

const iconByCategory: Record<string, typeof Train> = {
  train: Train,
  connectivity: Wifi,
  transfer: Plane,
  stay: Luggage,
  experience: Luggage,
  itinerary: Map,
  insurance: Shield,
};

type TripPicksProps = {
  picks: TripPick[];
  compact?: boolean;
};

export function TripPicks({ picks, compact = false }: TripPicksProps) {
  const t = useTranslations("home.tripPicks");
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- SSR requires effect-based localStorage hydration
      if (raw) setChecked(JSON.parse(raw));
    } catch {}
    setMounted(true);
  }, []);

  const toggle = useCallback((id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setChecked((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const doneCount = picks.filter((p) => checked[p.id]).length;

  return (
    <Card tone={compact ? "surface" : "accent"} className="overflow-hidden">
      <div className="border-b border-slate-200/80 bg-white px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase text-sky-700">
              {t("badge")}
            </p>
            <h2 className="mt-1 text-xl font-semibold text-slate-950">
              {t("title")}
            </h2>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              {t("hint")}
            </p>
          </div>
          <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-semibold text-slate-600">
            {mounted ? doneCount : 0}/{picks.length}
          </span>
        </div>

        {mounted && doneCount > 0 && (
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${(doneCount / picks.length) * 100}%` }}
            />
          </div>
        )}
      </div>

      <div className="space-y-2 px-4 py-4">
        {picks.map((pick) => {
          const Icon = iconByCategory[pick.category] ?? Luggage;
          const isDone = mounted && checked[pick.id];
          const isExternal = pick.href.startsWith("http");

          const inner = (
            <div className={[
              "group flex items-center gap-3 rounded-2xl border px-3 py-3 transition-all",
              isDone
                ? "border-emerald-200 bg-emerald-50/60"
                : "border-slate-200 bg-white hover:border-sky-300 hover:bg-sky-50/40 hover:shadow-sm",
            ].join(" ")}>
              <button
                type="button"
                onClick={(e) => toggle(pick.id, e)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-sky-100 bg-sky-50 text-sky-700 transition-colors hover:bg-sky-100"
                aria-label={isDone ? `${pick.title} を未完了にする` : `${pick.title} を完了にする`}
              >
                {isDone ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                ) : (
                  <Icon className="h-4 w-4" />
                )}
              </button>
              <div className="min-w-0 flex-1">
                <p className={["text-sm font-semibold", isDone ? "text-emerald-700 line-through decoration-emerald-300" : "text-slate-900"].join(" ")}>
                  {pick.title}
                </p>
                <p className="text-xs leading-5 text-slate-500">{pick.description}</p>
                <span className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-sky-700 sm:hidden">
                  {pick.cta}
                  {isExternal ? <ExternalLink className="h-3 w-3" /> : <ArrowRight className="h-3 w-3" />}
                </span>
              </div>
              <span className="hidden min-w-[104px] shrink-0 items-center justify-center gap-1 rounded-xl border border-sky-200 bg-sky-50 px-3 py-1.5 text-[11px] font-semibold text-sky-700 transition-colors group-hover:bg-sky-100 sm:inline-flex">
                {pick.cta}
                {isExternal ? (
                  <ExternalLink className="h-3 w-3" />
                ) : (
                  <ArrowRight className="h-3 w-3" />
                )}
              </span>
            </div>
          );

          if (isExternal) {
            return (
              <a key={pick.id} href={pick.href} target="_blank" rel={AFFILIATE_REL} className="block rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-sky-300" onClick={() => trackAffiliateClick("trip-picks", pick.title)}>
                {inner}
              </a>
            );
          }
          return (
            <Link key={pick.id} href={pick.href} className="block rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-sky-300">
              {inner}
            </Link>
          );
        })}
      </div>

      {mounted && doneCount === picks.length && (
        <div className="mx-4 mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-center">
          <p className="text-sm font-semibold text-emerald-800">{t("allSet")}</p>
        </div>
      )}

      <p className="px-5 pb-5 text-[11px] leading-5 text-slate-500">
        {t("note")}
      </p>
    </Card>
  );
}
