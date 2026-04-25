import { ArrowRight, ExternalLink, Hotel, Map, Plane, ShieldCheck } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Card } from "@/components/ui/Card";
import { AFFILIATE_REL } from "@/lib/link-rel";

type DecisionCardProps = {
  label: string;
  title: string;
  description: string;
  tradeoff?: string;
  href: string;
  cta: string;
  external?: boolean;
  accent?: "sky" | "red" | "emerald" | "amber" | "indigo";
};

const accentClass = {
  sky: "bg-sky-50 text-sky-800 border-sky-100",
  red: "bg-red-50 text-red-800 border-red-100",
  emerald: "bg-emerald-50 text-emerald-800 border-emerald-100",
  amber: "bg-amber-50 text-amber-800 border-amber-100",
  indigo: "bg-indigo-50 text-indigo-800 border-indigo-100",
};

const iconClass = {
  sky: Hotel,
  red: ShieldCheck,
  emerald: ShieldCheck,
  amber: Plane,
  indigo: Map,
};

export function DecisionCard({
  label,
  title,
  description,
  tradeoff,
  href,
  cta,
  external = false,
  accent = "sky",
}: DecisionCardProps) {
  const Icon = iconClass[accent];
  const body = (
    <Card className="group flex h-full min-h-[260px] flex-col overflow-hidden border-slate-200 transition-all hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-[0_26px_70px_rgba(15,23,42,0.14)] focus-within:ring-2 focus-within:ring-sky-200">
      <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
        <div
          className={[
            "inline-flex w-fit rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase",
            accentClass[accent],
          ].join(" ")}
        >
          {label}
        </div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-700">
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div className="flex flex-1 flex-col px-5 py-5">
        <h3 className="text-lg font-semibold leading-tight text-slate-950">{title}</h3>
        <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>
        {tradeoff && (
          <p className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-xs leading-5 text-slate-600">
            {tradeoff}
          </p>
        )}
        <div className="mt-auto pt-5">
        <span className="inline-flex w-full items-center justify-center gap-1.5 rounded-2xl bg-[#07142f] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors group-hover:bg-slate-800">
          {cta}
          {external ? (
            <ExternalLink className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          ) : (
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          )}
        </span>
        </div>
      </div>
    </Card>
  );

  if (external) {
    return (
      <a href={href} target="_blank" rel={AFFILIATE_REL} className="block h-full rounded-[28px] no-underline outline-none focus-visible:ring-2 focus-visible:ring-sky-300">
        {body}
      </a>
    );
  }

  return (
    <Link href={href} className="block h-full rounded-[28px] no-underline outline-none focus-visible:ring-2 focus-visible:ring-sky-300">
      {body}
    </Link>
  );
}
