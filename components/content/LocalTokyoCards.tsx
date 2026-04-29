import Image from "next/image";
import { ArrowRight, CheckCircle2, Clock3, Hotel, MapPin, Sparkles, XCircle } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { AFFILIATE_REL } from "@/lib/link-rel";

const buttonPage =
  "inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#168a56] bg-[#168a56] font-extrabold text-white shadow-[0_8px_22px_rgba(22,138,86,0.14)] transition-colors hover:bg-[#0f6f45]";
const buttonPageSecondary =
  "inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#9fd7bd] bg-white font-extrabold text-[#106b43] shadow-[0_6px_16px_rgba(22,138,86,0.06)] transition-colors hover:border-[#168a56] hover:bg-[#f0fbf6]";

export type AreaChoice = {
  name: string;
  bestFor: string;
  mood: string;
  weakness: string;
  compareHref: string;
  localHref?: string;
};

export type LocalLensPick = {
  name: string;
  summary: string;
  bestFor: string;
  avoidIf: string;
  timing: string;
  href: string;
  image?: string;
};

export function DecisionBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-100 bg-sky-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.08em] text-[#145aa0]">
      <Sparkles className="h-3 w-3" />
      {children}
    </span>
  );
}

export function BestForList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-1.5">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2 text-xs leading-5 text-slate-700">
          <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
          {item}
        </li>
      ))}
    </ul>
  );
}

export function AvoidIfList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-1.5">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2 text-xs leading-5 text-slate-700">
          <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose-400" />
          {item}
        </li>
      ))}
    </ul>
  );
}

export function AreaChoiceCard({ area }: { area: AreaChoice }) {
  return (
    <article className="flex min-h-[230px] flex-col rounded-[18px] border border-[#d9e5f2] bg-white p-5 shadow-[0_14px_34px_rgba(9,35,70,0.08)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-[#082653]">{area.name}</h3>
          <p className="mt-1 text-xs font-semibold uppercase tracking-[0.08em] text-[#7890ad]">
            {area.mood}
          </p>
        </div>
        {area.localHref ? <DecisionBadge>Local alternative</DecisionBadge> : null}
      </div>

      <dl className="mt-4 space-y-3 text-sm leading-6">
        <div>
          <dt className="text-[10px] font-black uppercase tracking-[0.08em] text-[#145aa0]">Best for</dt>
          <dd className="text-slate-700">{area.bestFor}</dd>
        </div>
        <div>
          <dt className="text-[10px] font-black uppercase tracking-[0.08em] text-rose-500">Weakness</dt>
          <dd className="text-slate-600">{area.weakness}</dd>
        </div>
      </dl>

      <div className="mt-auto flex flex-wrap gap-2 pt-5">
        <Link
          href={area.compareHref}
          className={`${buttonPage} h-10 px-3 text-xs`}
        >
          Compare areas
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
        {area.localHref ? (
          <Link
            href={area.localHref}
            className={`${buttonPageSecondary} h-10 px-3 text-xs`}
          >
            Explore local Tokyo
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        ) : null}
      </div>
    </article>
  );
}

export function LocalLensCard({ pick }: { pick: LocalLensPick }) {
  return (
    <Link
      href={pick.href}
      className="group flex flex-col overflow-hidden rounded-[9px] border border-[#d5e5ef] bg-white shadow-[0_14px_34px_rgba(9,35,70,0.08)] transition-transform hover:-translate-y-1"
    >
      {pick.image ? (
        <div className="relative h-[118px] w-full">
          <Image src={pick.image} alt="" fill sizes="(min-width: 1280px) 20vw, (min-width: 768px) 50vw, 100vw" className="object-cover" aria-hidden="true" />
        </div>
      ) : null}
      <div className="flex flex-1 flex-col p-5 pb-6">
        <DecisionBadge>Local Lens</DecisionBadge>
        <h3 className="mt-4 text-xl font-bold text-[#082653]">{pick.name}</h3>
        <p className="mt-2 text-sm leading-6 text-[#5f7190]">{pick.summary}</p>
        <div className="mt-4 grid gap-3 text-xs leading-5 text-slate-700">
          <p><span className="font-bold text-[#082653]">Best for:</span> {pick.bestFor}</p>
          <p><span className="font-bold text-[#082653]">Avoid if:</span> {pick.avoidIf}</p>
          <p className="flex items-center gap-1.5">
            <Clock3 className="h-3.5 w-3.5 text-[#145aa0]" />
            <span><span className="font-bold text-[#082653]">Timing:</span> {pick.timing}</span>
          </p>
        </div>
        <div className="mt-auto pt-5">
          <span className={`${buttonPage} h-9 px-4 text-xs`}>
            Open local pick
            <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}

export function HalfDayRoute({ stops }: { stops: string[] }) {
  return (
    <ol className="space-y-3">
      {stops.map((stop, index) => (
        <li key={stop} className="grid grid-cols-[34px_1fr] gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#082653] text-xs font-black text-white">
            {index + 1}
          </span>
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-700 shadow-sm">
            {stop}
          </div>
        </li>
      ))}
    </ol>
  );
}

export function AffiliateDisclosure() {
  return (
    <p className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs leading-5 text-slate-500">
      Some links may be affiliate links. When external booking links are used, fujiseat.com may earn a small commission at no extra cost to you.
    </p>
  );
}

export function HotelAreaCTA({
  title,
  description,
  href,
  external = false,
}: {
  title: string;
  description: string;
  href: string;
  external?: boolean;
}) {
  const className =
    "flex items-center gap-3 rounded-[18px] border border-[#d9e5f2] bg-white p-4 shadow-sm transition-colors hover:bg-[#f8fbff]";
  const inner = (
    <>
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#eef6ff] text-[#145aa0]">
        {external ? <Hotel className="h-5 w-5" /> : <MapPin className="h-5 w-5" />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-bold text-[#082653]">{title}</span>
        <span className="mt-1 block text-xs leading-5 text-[#5f7190]">{description}</span>
      </span>
      <ArrowRight className="h-4 w-4 shrink-0 text-[#082653]" />
    </>
  );

  if (external) {
    return (
      <a href={href} target="_blank" rel={AFFILIATE_REL} className={className}>
        {inner}
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      {inner}
    </Link>
  );
}
