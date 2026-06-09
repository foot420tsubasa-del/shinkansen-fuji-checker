"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import { ArrowRight, Check, Clock, X } from "lucide-react";
import { AFFILIATE_REL } from "@/lib/link-rel";
import { TrackedAffiliateLink } from "@/components/analytics/TrackedAffiliateLink";
import { TrackedInternalLink } from "@/components/analytics/TrackedInternalLink";
import type { AffiliateClickParams } from "@/lib/analytics";

type AirportHeroBadge = {
  label: string;
  value: string;
};

type AirportHeroCardProps = {
  label: string;
  title: string;
  summary: string;
  image?: string;
  imageAlt: string;
  fallbackIcon: ReactNode;
  badges?: AirportHeroBadge[];
};

export function AirportHeroCard({
  label,
  title,
  summary,
  image,
  imageAlt,
  fallbackIcon,
  badges = [],
}: AirportHeroCardProps) {
  return (
    <section className="mt-6 overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
      {image ? (
        <div className="relative aspect-[21/9] max-h-[360px] min-h-[180px] w-full">
          <Image src={image} alt={imageAlt} fill priority sizes="(min-width: 768px) 1180px, 100vw" className="object-cover" />
        </div>
      ) : (
        <div className="flex aspect-[21/9] max-h-[360px] min-h-[180px] items-center justify-center bg-gradient-to-br from-sky-50 to-emerald-50 text-sky-300">
          {fallbackIcon}
        </div>
      )}
      <div className="p-5 md:p-7">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-sky-700">{label}</p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-950 md:text-3xl">{title}</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 md:text-base">{summary}</p>
        {badges.length > 0 ? (
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {badges.map((badge) => (
              <div key={badge.label} className="rounded-2xl border border-slate-200 bg-slate-50/80 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500">{badge.label}</p>
                <p className="mt-1 text-xs leading-5 text-slate-600">{badge.value}</p>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

type TransferOptionTag = {
  label: string;
  tone?: "green" | "amber" | "slate";
  icon?: ReactNode;
};

type TransferOptionCta = {
  label: string;
  href: string;
  category?: AffiliateClickParams["category"];
  provider?: AffiliateClickParams["provider"];
  pagePath?: string;
  locale?: string;
  linkId?: string;
  product?: string;
  transportType?: string;
};

type TransferOptionCardProps = {
  title: string;
  time: string;
  price: string;
  bestFor: string;
  pros: string[];
  cons: string[];
  tags: TransferOptionTag[];
  cta?: TransferOptionCta;
  ctas?: TransferOptionCta[];
  actionTitle?: string;
  helperText?: string;
  note?: string;
  provider?: AffiliateClickParams["provider"];
  placement: AffiliateClickParams["placement"];
  prosLabel?: string;
  consLabel?: string;
};

function ctaColor(title: string, provider?: AffiliateClickParams["provider"]) {
  const normalized = title.toLowerCase();
  if (provider === "omio") {
    return "border-[#2563eb] bg-[#2563eb] hover:bg-[#1d4ed8] focus-visible:ring-sky-200";
  }
  if (provider === "klook") {
    return "border-[#D94A32] bg-[#D94A32] hover:bg-[#bf3d28] focus-visible:ring-orange-200";
  }
  if (normalized.includes("private") || normalized.includes("taxi")) {
    return "border-[#082653] bg-[#082653] hover:bg-[#061d40] focus-visible:ring-slate-300";
  }
  if (normalized.includes("bus") || normalized.includes("limousine")) {
    return "border-[#145aa0] bg-[#145aa0] hover:bg-[#0f477f] focus-visible:ring-sky-200";
  }
  return "border-[#D94A32] bg-[#D94A32] hover:bg-[#bf3d28] focus-visible:ring-orange-200";
}

function tagClass(tone: TransferOptionTag["tone"]) {
  if (tone === "green") return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (tone === "amber") return "border-amber-200 bg-amber-50 text-amber-700";
  return "border-slate-200 bg-slate-50 text-slate-500";
}

export function TransferOptionCard({
  title,
  time,
  price,
  bestFor,
  pros,
  cons,
  tags,
  cta,
  ctas,
  actionTitle,
  helperText,
  note,
  provider,
  placement,
  prosLabel = "Pros",
  consLabel = "Cons",
}: TransferOptionCardProps) {
  const providerCtas = ctas ?? (cta ? [cta] : []);

  return (
    <div className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-950">{title}</h3>
          <p className="mt-1 text-xs leading-5 text-slate-500">{bestFor}</p>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
            <span className="flex items-center gap-1 font-semibold text-slate-900">
              <Clock className="h-3.5 w-3.5 text-slate-400" />
              {time}
            </span>
            <span className="font-semibold text-slate-900">{price}</span>
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <p className="mb-2 text-[10px] font-semibold uppercase text-emerald-600">{prosLabel}</p>
          <ul className="space-y-1.5">
            {pros.map((item) => (
              <li key={item} className="flex items-start gap-2 text-xs leading-5 text-slate-700">
                <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="mb-2 text-[10px] font-semibold uppercase text-red-500">{consLabel}</p>
          <ul className="space-y-1.5">
            {cons.map((item) => (
              <li key={item} className="flex items-start gap-2 text-xs leading-5 text-slate-700">
                <X className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-400" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        {tags.map((tag) => (
          <span key={tag.label} className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold ${tagClass(tag.tone)}`}>
            {tag.icon}
            {tag.label}
          </span>
        ))}
      </div>

      {providerCtas.length > 0 ? (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-3">
          <p className="text-sm font-semibold text-slate-950">{actionTitle ?? "Book or compare this route"}</p>
          {helperText ? <p className="mt-1 text-xs leading-5 text-slate-500">{helperText}</p> : null}
          <div className="mt-3 flex flex-wrap gap-2">
            {providerCtas.map((item) => (
              <TrackedAffiliateLink
                key={`${item.provider ?? provider}-${item.linkId ?? item.href}`}
                href={item.href}
                target="_blank"
                rel={AFFILIATE_REL}
                category={item.category ?? "transfer"}
                provider={provider ?? item.provider}
                placement={placement}
                pagePath={item.pagePath}
                locale={item.locale}
                label={item.label}
                linkId={item.linkId}
                product={item.product}
                transportType={item.transportType}
                className={`inline-flex min-h-10 items-center justify-center gap-1.5 rounded-2xl border px-4 py-2 text-sm font-semibold text-white transition-colors focus-visible:outline-none focus-visible:ring-2 ${ctaColor(title, item.provider ?? provider)}`}
              >
                {item.label}
                <ArrowRight className="h-3.5 w-3.5" />
              </TrackedAffiliateLink>
            ))}
          </div>
        </div>
      ) : (
        <span className="mt-4 inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-600">
          {note ?? "No booking needed"}
        </span>
      )}
    </div>
  );
}

type ArrivalSetupCardProps = {
  title: string;
  body: string;
  ctaLabel: string;
  href: string;
  placement: string;
  sourcePage: string;
  locale?: string;
  city?: string;
};

export function ArrivalSetupCard({
  title,
  body,
  ctaLabel,
  href,
  placement,
  sourcePage,
  locale,
}: ArrivalSetupCardProps) {
  return (
    <section className="rounded-[22px] border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
      <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-emerald-700">Arrival setup</p>
      <div className="mt-2 grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-700">{body}</p>
        </div>
        <TrackedInternalLink
          href={href}
          sourcePage={sourcePage}
          placement={placement}
          label={ctaLabel}
          locale={locale}
          className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-[#2E7D5B] bg-[#2E7D5B] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#246449]"
        >
          {ctaLabel}
        </TrackedInternalLink>
      </div>
    </section>
  );
}

type AirportRouteCompareCardProps = {
  href: string;
  pagePath: string;
  locale?: string;
  linkId?: string;
  title?: string;
  body?: string;
};

export function AirportRouteCompareCard({ href, pagePath, locale, linkId, title = "Not sure which transfer is best?", body = "Compare trains, buses, and route options before booking." }: AirportRouteCompareCardProps) {
  return (
    <section className="rounded-[22px] border border-sky-200 bg-sky-50 p-5 shadow-sm">
      <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-sky-700">Route comparison</p>
          <h2 className="mt-2 text-lg font-semibold text-slate-950">{title}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-700">{body}</p>
        </div>
        <TrackedAffiliateLink
          href={href}
          target="_blank"
          rel={AFFILIATE_REL}
          category="transfer"
          provider="omio"
          placement="airport_route_compare"
          pagePath={pagePath}
          locale={locale}
          label="Omio"
          linkId={linkId}
          product="airport_route_compare"
          transportType="route_compare"
          className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-[#2563eb] bg-[#2563eb] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#1d4ed8]"
        >
          Omio
        </TrackedAffiliateLink>
      </div>
    </section>
  );
}

type AirportNextStepCard = {
  title: string;
  body: string;
  label: string;
  href: string;
  icon: ReactNode;
  external?: boolean;
  category?: AffiliateClickParams["category"];
  provider?: AffiliateClickParams["provider"];
  placement?: AffiliateClickParams["placement"];
  linkId?: string;
  product?: string;
};

type AirportNextStepsProps = {
  cards: AirportNextStepCard[];
  sourcePage: string;
  placement: string;
  locale?: string;
};

export function AirportNextSteps({ cards, sourcePage, placement, locale }: AirportNextStepsProps) {
  return (
    <section className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-500">Suggested next steps</p>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {cards.map((card) => {
          const inner = (
            <>
              <span className="flex items-center gap-2 text-sm font-bold text-slate-950">
                {card.icon}
                {card.title}
              </span>
              <span className="mt-1 block text-xs leading-5 text-slate-500">{card.body}</span>
              <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-slate-700">
                {card.label} <ArrowRight className="h-3 w-3" />
              </span>
            </>
          );

          const className = "rounded-2xl border border-slate-200 bg-slate-50/70 p-4 transition-colors hover:bg-white";

          if (card.external) {
            return (
              <TrackedAffiliateLink
                key={card.title}
                href={card.href}
                target="_blank"
                rel={AFFILIATE_REL}
                category={card.category ?? "transfer"}
                provider={card.provider}
                placement={card.placement ?? "airport_transfer"}
                pagePath={sourcePage}
                locale={locale}
                label={card.title}
                linkId={card.linkId}
                product={card.product}
                className={className}
              >
                {inner}
              </TrackedAffiliateLink>
            );
          }

          return (
            <TrackedInternalLink
              key={card.title}
              href={card.href}
              sourcePage={sourcePage}
              placement={placement}
              label={card.title}
              locale={locale}
              className={className}
            >
              {inner}
            </TrackedInternalLink>
          );
        })}
      </div>
    </section>
  );
}
