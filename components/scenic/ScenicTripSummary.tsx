import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { seatedSide, viewingSection, type Direction, type ScenicRoute, type TimelineItem } from "@/lib/scenic";

export function ScenicTripSummary({
  route,
  direction,
  from,
  to,
  item,
  train,
  showGuide = true,
  children,
}: {
  route: ScenicRoute;
  direction: Direction;
  from: string;
  to: string;
  item: TimelineItem;
  train?: string;
  showGuide?: boolean;
  children?: ReactNode;
}) {
  const t = useTranslations("home.search");
  const locale = useLocale();
  const { view } = item;
  const side = seatedSide(item.side, item.reversedAt);
  const seat = view.seatByDirection?.[direction] ?? view.seat;
  const [sectionStart, sectionEnd] = viewingSection(route, view, direction, from, to);
  const minutes = new Intl.NumberFormat(locale, { style: "unit", unit: "minute", unitDisplay: "short", maximumFractionDigits: 0 });
  const start = Math.max(0, Math.round(item.start));
  const end = Math.max(start, Math.round(item.end));
  const time = start === end ? minutes.format(end) : `${new Intl.NumberFormat(locale).format(start)}–${minutes.format(end)}`;

  return (
    <section aria-label={t("mainHighlight")} className="min-w-0 rounded-3xl border border-slate-200 bg-white p-5 text-ink shadow-sm sm:p-6">
      <p className="text-xs font-bold text-slate-600">{route.line} · {from} → {to}</p>
      <h2 className="mt-2 text-xl font-extrabold leading-tight md:text-2xl">{view.name}</h2>
      <p className="mt-2 text-base font-extrabold">
        <span className="text-sm font-semibold text-slate-600">{t("windowSide")}: </span>
        {t(side)}{seat ? ` · ${t("seat")} ${seat}` : ""}
      </p>
      {item.reversedAt.length ? (
        <p className="mt-1 text-xs leading-5 text-slate-600">{t("directionAtView")}: {t(item.side)} · {t("reversed", { station: item.reversedAt.at(-1)!, side: t(side) })}</p>
      ) : null}
      <dl className="mt-4 grid gap-3 border-t border-slate-100 pt-4 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-xs font-semibold text-slate-600">{t("viewingSection")}</dt>
          <dd className="mt-0.5 font-semibold">{sectionStart === sectionEnd ? sectionStart : `${sectionStart} → ${sectionEnd}`}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold text-slate-600">{t("afterDeparture")}</dt>
          <dd className="mt-0.5 font-semibold">≈ {time}</dd>
          {train ? <dd className="mt-0.5 text-xs text-slate-600">{t("referenceTrain")}: {train}</dd> : null}
        </div>
        <div className="sm:col-span-2">
          <dt className="text-xs font-semibold text-slate-600">{t("bestViewingSeason")}</dt>
          <dd className="mt-0.5">{view.season}</dd>
        </div>
      </dl>
      <p className="mt-3 text-xs leading-5 text-slate-600">{view.basis}</p>
      {route.id === "enoden-coast" && route.notes?.[0] ? <p className="mt-2 text-sm leading-6 text-slate-700">{route.notes[0]}</p> : null}
      {children}
      {showGuide && route.href ? (
        <Link href={route.href} className="mt-3 inline-flex min-h-10 items-center gap-2 text-sm font-bold text-fuji underline underline-offset-2">
          {t("details")} <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      ) : null}
    </section>
  );
}
