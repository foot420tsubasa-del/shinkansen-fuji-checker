import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { SiteHeader } from "../../components/SiteHeader";
import { Breadcrumb } from "@/components/content/Breadcrumb";
import { QuickRec } from "@/components/content/QuickRec";
import { AreaCard } from "@/components/content/AreaCard";
import { ComparisonTable } from "@/components/content/ComparisonTable";
import { ProTip } from "@/components/content/ProTip";
import { StayAreaMap } from "@/components/content/StayAreaMap";
import { HotelPicks } from "@/components/content/HotelPicks";
import { NextActions } from "@/components/content/NextActions";
import { SuggestedNextSteps } from "@/components/content/SuggestedNextSteps";
import { LastCheckedNote } from "@/components/content/LastCheckedNote";
import { SiteLegalLinks } from "@/components/content/SiteLegalLinks";
import { HotelAreaCTA } from "@/components/content/LocalTokyoCards";
import { AgodaHotelMap } from "@/components/affiliate/AgodaHotelMap";
import { TrackedCtaLink } from "@/components/analytics/TrackedCtaLink";
import { HotelCompareBlock } from "@/components/content/HotelCompareBlock";
import {
  PurposeChips,
  type PurposeChipItem,
} from "@/components/ui/PurposeChips";
import { getAllStaySlugs, getStayBySlug } from "@/lib/content/stay";
import { getTripHotelConfig } from "@/lib/hotel-links";
import { getAlternates } from "@/i18n/hreflang";

type Props = {
  params: Promise<{ slug: string; locale: string }>;
};

const agodaMapIdsByStaySlug: Record<string, string[]> = {
  "where-to-stay-before-shinkansen": ["tokyoStation"],
  "kyoto-station-vs-gion": ["kyotoStation"],
  "namba-vs-umeda": ["namba"],
  "shin-osaka-vs-namba": ["shinOsaka", "namba"],
};

export async function generateStaticParams() {
  return getAllStaySlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, locale } = await params;
  const page = getStayBySlug(slug);
  if (!page) return {};
  return {
    title: `${page.title} | fujiseat`,
    description: page.description,
    robots: locale === "en" ? undefined : { index: false, follow: true },
    openGraph: {
      title: page.title,
      description: page.description,
      siteName: "fujiseat",
    },
    alternates: getAlternates(`/areas-to-stay/${slug}`, locale),
  };
}

export default async function StayPage({ params }: Props) {
  const { slug, locale } = await params;
  const localHotelT = await getTranslations("localHotelPicks");
  const stayAreaT = await getTranslations("stayArea");
  const page = getStayBySlug(slug);
  if (!page) notFound();
  const pagePath = `/areas-to-stay/${slug}`;

  // Phase 2: Purpose chips + Trip/Agoda compare block on tokyo-first-time only.
  // Other stay-area slugs are intentionally untouched in this phase.
  const isTokyoFirstTime = page.slug === "tokyo-first-time";

  const purposeChips: PurposeChipItem[] = isTokyoFirstTime
    ? [
        { key: "firstTime", label: stayAreaT("purpose.firstTime"), href: "#shinjuku" },
        { key: "airportAccess", label: stayAreaT("purpose.airportAccess"), href: "#ueno" },
        { key: "shinkansen", label: stayAreaT("purpose.shinkansen"), href: "#tokyo-station" },
        { key: "quietLocal", label: stayAreaT("purpose.quietLocal"), href: `/${locale}/local-tokyo`, external: true },
        { key: "family", label: stayAreaT("purpose.family"), href: "#ueno" },
      ]
    : [];

  // Compare block reads its URLs from the central hotel-links config so we
  // never invent Agoda links: if agodaUrl is empty the block falls back to
  // a Trip.com-only render automatically.
  const compareCfg = isTokyoFirstTime ? getTripHotelConfig("shinjuku") : null;
  const compareTripHref = compareCfg
    ? `/api/trip-hotel-redirect?area=${encodeURIComponent("shinjuku")}`
    : "";
  const compareTripTrackingHref = compareCfg?.tripUrl ?? "";
  const compareAgodaHref = compareCfg?.agodaUrl?.trim() ?? "";

  return (
    <main className="page-shell min-h-screen text-slate-950">
      {page.faqs && page.faqs.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: page.faqs.map((f) => ({
                "@type": "Question",
                name: f.question,
                acceptedAnswer: { "@type": "Answer", text: f.answer },
              })),
            }),
          }}
        />
      )}
      <SiteHeader />

      <Container className="py-8 md:py-12">
        <Breadcrumb items={[
          { label: "Areas to stay", href: "/" },
          { label: page.title.split("—")[0].trim() },
        ]} />

        <h1 className="mt-4 text-2xl font-semibold text-slate-950 md:text-3xl">
          {page.title}
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 md:text-base">
          {page.description}
        </p>

        {isTokyoFirstTime ? (
          <PurposeChips
            className="mt-6"
            title={stayAreaT("purpose.title")}
            subtitle={stayAreaT("purpose.subtitle")}
            chips={purposeChips}
          />
        ) : null}

        <div className="mt-8 space-y-8">
          {page.slug === "tokyo-first-time" ? (
            <section className="rounded-[22px] border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
              <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-emerald-700">
                Quick Recommendation
              </p>
              <h2 className="mt-2 text-lg font-semibold text-slate-950">
                Not sure where to stay?
              </h2>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {page.areas.map((area) => (
                  <div key={area.name} className="rounded-2xl border border-emerald-100 bg-white p-4">
                    <p className="text-sm font-semibold text-slate-950">
                      {area.bestFor} → {area.name}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-slate-600">{area.vibe}</p>
                  </div>
                ))}
                <div className="rounded-2xl border border-emerald-100 bg-white p-4">
                  <p className="text-sm font-semibold text-slate-950">
                    Calmer local day → East Tokyo
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-600">
                    Use Local Tokyo as a day-plan layer after choosing a practical base.
                  </p>
                  <HotelAreaCTA
                    title="Explore Local Tokyo"
                    description="Kiyosumi-Shirakawa, Kuramae, Oshiage, Monzen-Nakacho, and Ryogoku."
                    href="/local-tokyo"
                  />
                </div>
              </div>
            </section>
          ) : null}

          {page.mapId ? (
            <section className="space-y-4">
              <StayAreaMap
                mapId={page.mapId}
                priority={page.slug === "tokyo-first-time"}
              />
              {page.mapDescription && page.mapDescription.length > 0 ? (
                <div className="rounded-[18px] border border-slate-200 bg-white p-5 text-sm leading-6 text-slate-600 shadow-sm">
                  {page.mapDescription.map((paragraph) => (
                    <p key={paragraph} className="mt-3 first:mt-0">
                      {paragraph}
                    </p>
                  ))}
                </div>
              ) : null}
            </section>
          ) : null}

          <QuickRec
            area={page.quickRec.area}
            why={page.quickRec.why}
            link={page.quickRec.link}
            locale={locale}
            pagePath={pagePath}
          />

          {isTokyoFirstTime && compareCfg ? (
            <HotelCompareBlock
              title={stayAreaT("compare.title", { areaName: compareCfg.areaName })}
              singleProviderTitle={stayAreaT("compare.singleTitle", { areaName: compareCfg.areaName })}
              note={stayAreaT("compare.note")}
              tripLabel={stayAreaT("compare.tripLabel")}
              agodaLabel={stayAreaT("compare.agodaLabel")}
              tripHref={compareTripHref}
              tripTrackingHref={compareTripTrackingHref}
              agodaHref={compareAgodaHref}
              placement="stay_area"
              pagePath={pagePath}
              locale={locale}
              area={compareCfg.areaName}
              city={compareCfg.city}
            />
          ) : null}

          <section id="areas" className="scroll-mt-24">
            <h2 className="text-lg font-semibold text-slate-950">Area breakdown</h2>
            <p className="mt-1 text-sm text-slate-500">Compare the practical fit of each area before choosing where to search.</p>
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              {page.areas.map((area) => (
                <AreaCard key={area.name} {...area} locale={locale} pagePath={pagePath} showHotelCta={false} />
              ))}
            </div>
          </section>

          <section id="comparison" className="scroll-mt-24">
            <h2 className="mb-4 text-lg font-semibold text-slate-950">Side-by-side comparison</h2>
            <ComparisonTable
              columns={page.comparisonColumns}
              rows={page.comparison}
              highlight={page.quickRec.area}
            />
          </section>

          <ProTip>{page.proTip}</ProTip>

          {page.slug === "tokyo-first-time" ? (
            <section className="rounded-[22px] border border-sky-100 bg-[linear-gradient(180deg,#f8fcff,#fff)] p-5 shadow-sm">
              <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-sky-700">
                Local alternative: East Tokyo
              </p>
              <h2 className="mt-2 text-lg font-semibold text-slate-950">
                If Shinjuku feels too intense, look east.
              </h2>
              <div className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
                <p>
                  First-time visitors usually do better with Shinjuku, Ueno, Asakusa, or Tokyo Station because the transport and late-arrival logistics are simpler.
                </p>
                <p>
                  But if Shinjuku feels too intense, East Tokyo can be a calmer alternative. Kiyosumi-Shirakawa works especially well as a quiet local detour or second-time Tokyo base, rather than the default first-night base.
                </p>
              </div>
              <div className="mt-5 grid gap-3 md:grid-cols-2">
                <HotelAreaCTA
                  title="Kiyosumi-Shirakawa local guide"
                  description="Coffee, gardens, museums, and quiet East Tokyo."
                  href="/local-tokyo/kiyosumi-shirakawa"
                />
                <HotelAreaCTA
                  title="All Local Tokyo picks"
                  description="Kiyosumi-Shirakawa, Kuramae, Monzen-Nakacho, and Ryogoku."
                  href="/local-tokyo"
                />
              </div>
            </section>
          ) : null}

          <section>
            <HotelPicks picks={page.hotelPicks} locale={locale} pagePath={pagePath} />
            <div className="mt-4 rounded-[18px] border border-emerald-100 bg-emerald-50/70 p-4">
              <p className="text-sm font-semibold text-slate-950">
                Want more specific hotel examples?
              </p>
              <p className="mt-1 text-xs leading-5 text-slate-600">
                See curated Japanese local hotel picks for Tokyo, Kyoto, and Osaka.
              </p>
              <TrackedCtaLink
                href="/local-hotel-picks"
                placement="stay_detail_local_hotel_picks"
                label="Japanese local hotel picks"
                pagePath={pagePath}
                locale={locale}
                category="hotel"
                className="mt-3 inline-flex rounded-xl border border-[#168a56] bg-[#168a56] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#0f6f45]"
              >
                {localHotelT("seeLocalHotelPicks")}
              </TrackedCtaLink>
            </div>
          </section>

          <NextActions
            picks={page.nextActions}
            title="Related stay planning"
            subtitle="Use these only after you have chosen the hotel area."
            maxItems={3}
            locale={locale}
            pagePath={pagePath}
          />

          {page.faqs && page.faqs.length > 0 && (
            <section className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-950">FAQ</h2>
              <dl className="mt-4 space-y-4 text-sm">
                {page.faqs.map((item) => (
                  <div key={item.question}>
                    <dt className="font-semibold text-slate-900">{item.question}</dt>
                    <dd className="mt-1 leading-6 text-slate-600">{item.answer}</dd>
                  </div>
                ))}
              </dl>
            </section>
          )}

          {(agodaMapIdsByStaySlug[page.slug] ?? []).map((mapId) => (
            <AgodaHotelMap
              key={mapId}
              mapId={mapId}
              placement="stay_area_map"
              locale={locale}
            />
          ))}

          <SuggestedNextSteps currentPageType="stay" locale={locale} excludeTypes={["esim"]} />
        </div>

        <footer className="mt-12 border-t border-slate-200 pt-6 text-center text-[10px] text-slate-400">
          <p>fujiseat.com — Japan travel utility hub</p>
          <p className="mt-1">Partner links shown where they match the planning step.</p>
          <LastCheckedNote className="mt-3" />
          <SiteLegalLinks className="mt-3 text-slate-400" />
        </footer>
      </Container>
    </main>
  );
}
