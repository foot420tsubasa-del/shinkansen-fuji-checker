import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { SiteHeader } from "../../components/SiteHeader";
import { Breadcrumb } from "@/components/content/Breadcrumb";
import { QuickRec } from "@/components/content/QuickRec";
import { AreaCard } from "@/components/content/AreaCard";
import { ComparisonTable } from "@/components/content/ComparisonTable";
import { ProTip } from "@/components/content/ProTip";
import { HotelPicks } from "@/components/content/HotelPicks";
import { NextActions } from "@/components/content/NextActions";
import { SuggestedNextSteps } from "@/components/content/SuggestedNextSteps";
import { LastCheckedNote } from "@/components/content/LastCheckedNote";
import { SiteLegalLinks } from "@/components/content/SiteLegalLinks";
import { HotelAreaCTA } from "@/components/content/LocalTokyoCards";
import { HotelCTA } from "@/components/affiliate/HotelCTA";
import { getAllStaySlugs, getStayBySlug } from "@/lib/content/stay";
import { getHotelLink } from "@/lib/hotel-links";
import { getAlternates } from "@/i18n/hreflang";

type Props = {
  params: Promise<{ slug: string; locale: string }>;
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
  const page = getStayBySlug(slug);
  if (!page) notFound();
  const pagePath = `/areas-to-stay/${slug}`;

  return (
    <main className="page-shell min-h-screen text-slate-950">
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
                {page.areas.map((area) => {
                  const hotel = area.hotelKey ? getHotelLink(area.hotelKey) : null;
                  return (
                    <div key={area.name} className="rounded-2xl border border-emerald-100 bg-white p-4">
                    <p className="text-sm font-semibold text-slate-950">
                      {area.bestFor} → {area.name}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-slate-600">{area.vibe}</p>
                    <HotelCTA
                      areaName={hotel?.areaName ?? area.name}
                      city={hotel?.city ?? "Tokyo"}
                      provider={hotel?.provider}
                      href={hotel?.href ?? area.hotelLink}
                      placement="stay_area"
                      locale={locale}
                      pagePath={pagePath}
                      label={hotel?.label ?? `Compare ${area.name} hotels`}
                      className="mt-3 w-full text-xs"
                    />
                  </div>
                  );
                })}
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

          <QuickRec
            area={page.quickRec.area}
            why={page.quickRec.why}
            link={page.quickRec.link}
          />

          <section id="areas" className="scroll-mt-24">
            <h2 className="text-lg font-semibold text-slate-950">Area breakdown</h2>
            <p className="mt-1 text-sm text-slate-500">Tap an area to compare current hotel availability.</p>
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              {page.areas.map((area) => (
                <AreaCard key={area.name} {...area} locale={locale} pagePath={pagePath} />
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
          </section>

          <NextActions picks={page.nextActions} locale={locale} pagePath={pagePath} />
          <SuggestedNextSteps currentPageType="stay" locale={locale} />
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
