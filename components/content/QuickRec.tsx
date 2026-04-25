import { ArrowRight, Zap } from "lucide-react";
import { AFFILIATE_REL } from "@/lib/link-rel";

type QuickRecProps = {
  area: string;
  why: string;
  link: string;
  cta?: string;
};

export function QuickRec({ area, why, link, cta = "See hotels" }: QuickRecProps) {
  return (
    <div className="rounded-[22px] border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-5 shadow-sm">
      <div className="flex items-center gap-2 text-[11px] font-semibold uppercase text-emerald-700">
        <Zap className="h-3.5 w-3.5" />
        Quick recommendation
      </div>
      <p className="mt-2 text-xl font-semibold text-slate-950">
        Stay in <span className="text-emerald-700">{area}</span>
      </p>
      <p className="mt-2 text-sm leading-6 text-slate-600">{why}</p>
      <a
        href={link}
        target="_blank"
        rel={AFFILIATE_REL}
        className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-emerald-200 transition-all hover:bg-emerald-700"
      >
        {cta}
        <ArrowRight className="h-4 w-4" />
      </a>
    </div>
  );
}
