import Image from "next/image";
import type { ReactNode } from "react";
import { ArrowRight, CheckCircle2, Clock3, Hotel, MapPin, Sparkles, XCircle } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { AFFILIATE_REL } from "@/lib/link-rel";
import { trackCtaClick } from "@/lib/analytics";

const buttonPage =
  "inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#2E7D5B] bg-[#2E7D5B] font-extrabold text-white shadow-[0_8px_22px_rgba(22,138,86,0.14)] transition-colors hover:bg-[#246449]";
const buttonPageSecondary =
  "inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#2E7D5B] bg-[#2E7D5B] font-extrabold text-white shadow-[0_6px_16px_rgba(22,138,86,0.10)] transition-colors hover:bg-[#246449]";

export type AreaChoice = {
  name: string;
  bestFor: string;
  mood: string;
  weakness: string;
  compareHref: string;
  compareCta?: string;
  localHref?: string;
  localCta?: string;
  trackingPlacement?: string;
  trackingLocale?: string;
  trackingPagePath?: string;
};

type LocalLensSummaryLink = {
  text: string;
  href: string;
};

export type LocalLensPick = {
  name: string;
  summary: string;
  summaryLinks?: LocalLensSummaryLink[];
  bestFor: string;
  avoidIf: string;
  timing: string;
  href: string;
  image?: string;
};

function renderLinkedSummary(summary: string, links: LocalLensSummaryLink[] = []): ReactNode[] {
  const nodes: ReactNode[] = [];
  let cursor = 0;

  while (cursor < summary.length) {
    const next = links.reduce<{ link: LocalLensSummaryLink; index: number } | null>((match, link) => {
      const index = summary.indexOf(link.text, cursor);
      if (index === -1) return match;
      if (!match || index < match.index) return { link, index };
      return match;
    }, null);

    if (!next) {
      nodes.push(summary.slice(cursor));
      break;
    }

    if (next.index > cursor) {
      nodes.push(summary.slice(cursor, next.index));
    }

    nodes.push(
      <a
        key={`${next.link.text}-${next.index}`}
        href={next.link.href}
        target="_blank"
        rel="noopener noreferrer"
        className="font-bold text-[#106b43] underline underline-offset-2 transition-colors hover:text-[#246449]"
      >
        {next.link.text}
      </a>,
    );
    cursor = next.index + next.link.text.length;
  }

  return nodes.length ? nodes : [summary];
}

export function DecisionBadge({ children }: { children: ReactNode }) {
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
          onClick={() => {
            if (!area.trackingPlacement) return;
            trackCtaClick({
              placement: area.trackingPlacement,
              label: area.compareCta ?? area.name,
              href: area.compareHref,
              page_path: area.trackingPagePath,
              locale: area.trackingLocale,
            });
          }}
          className={`${buttonPage} h-10 px-3 text-xs`}
        >
          {area.compareCta ?? "View this area"}
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
        {area.localHref ? (
          <Link
            href={area.localHref}
            className={`${buttonPageSecondary} h-10 px-3 text-xs`}
          >
            {area.localCta ?? "Explore local Tokyo"}
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        ) : null}
      </div>
    </article>
  );
}

export function LocalLensCard({ pick }: { pick: LocalLensPick }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-[9px] border border-[#d5e5ef] bg-white shadow-[0_14px_34px_rgba(9,35,70,0.08)] transition-transform hover:-translate-y-1">
      {pick.image ? (
        <Link href={pick.href} className="relative block h-[118px] w-full">
          <Image src={pick.image} alt="" fill sizes="(min-width: 1280px) 20vw, (min-width: 768px) 50vw, 100vw" className="object-cover" aria-hidden="true" />
        </Link>
      ) : null}
      <div className="flex flex-1 flex-col p-5 pb-6">
        <DecisionBadge>Local Lens</DecisionBadge>
        <h3 className="mt-4 text-xl font-bold text-[#082653]">
          <Link href={pick.href} className="transition-colors hover:text-[#106b43]">
            {pick.name}
          </Link>
        </h3>
        <p className="mt-2 text-sm leading-6 text-[#5f7190]">
          {renderLinkedSummary(pick.summary, pick.summaryLinks)}
        </p>
        <div className="mt-4 grid gap-3 text-xs leading-5 text-slate-700">
          <p><span className="font-bold text-[#082653]">Best for:</span> {pick.bestFor}</p>
          <p><span className="font-bold text-[#082653]">Avoid if:</span> {pick.avoidIf}</p>
          <p className="flex items-center gap-1.5">
            <Clock3 className="h-3.5 w-3.5 text-[#145aa0]" />
            <span><span className="font-bold text-[#082653]">Timing:</span> {pick.timing}</span>
          </p>
        </div>
        <div className="mt-auto pt-5">
          <Link href={pick.href} className={`${buttonPage} h-9 px-4 text-xs`}>
            Open local pick
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </article>
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
