import type { Metadata } from "next";
import { ArrowRight, BedDouble, ExternalLink, MapPin } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { getAlternates } from "@/i18n/hreflang";
import { SiteHeader } from "../../components/SiteHeader";
import { SiteFooter } from "@/components/content/SiteFooter";
import { TrackedAffiliateLink } from "@/components/analytics/TrackedAffiliateLink";
import { AFFILIATE_REL } from "@/lib/link-rel";
import { getBookingHotelLink } from "@/lib/booking-hotels";
import data from "@/data/tokyo-special-stays.json";
import { DEFAULT_OG_IMAGES } from "@/lib/seo/og";

type Props = { params: Promise<{ locale: string }> };
type Hotel = { id: string; name: string; area: string; note?: string };

const PATH = data.path;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: { absolute: data.title },
    description: data.description,
    robots: locale === "en" ? undefined : { index: false, follow: true },
    alternates: getAlternates(PATH, locale),
    openGraph: { images: DEFAULT_OG_IMAGES, title: data.title, description: data.description, siteName: "fujiseat — Japan Rail Seats, Stays & Routes" },
  };
}

function OfficialLink({ source }: { source: string[] }) {
  return (
    <a href={source[1]} rel="noopener noreferrer" className="inline-flex min-h-10 items-center gap-1 text-sm font-semibold text-slate-700 underline underline-offset-2 hover:text-ink">
      {source[0]} <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
    </a>
  );
}

export default async function TokyoSpecialStaysPage({ params }: Props) {
  const { locale } = await params;
  const pagePath = locale === "en" ? PATH : `/${locale}${PATH}`;

  return (
    <main className="page-shell min-h-screen text-ink">
      <SiteHeader />
      <article className="mx-auto max-w-[880px] px-5 pb-16 pt-8 md:pt-12">
        <header>
          <p className="text-xs font-bold uppercase tracking-[0.1em] text-fuji">Tokyo · Special stays</p>
          <h1 className="mt-3 text-[32px] font-extrabold leading-[1.1] tracking-[-0.03em] md:text-[44px]">{data.h1}</h1>
          <p className="mt-3 text-[16px] leading-7 text-slate-600">{data.lead}</p>
        </header>

        <section className="mt-6 rounded-[22px] bg-ink p-6 text-white md:p-7" aria-labelledby="rule-heading">
          <h2 id="rule-heading" className="text-lg font-extrabold">{data.rule.title}</h2>
          <p className="mt-2 text-[15px] leading-7 text-white/90">{data.rule.text}</p>
        </section>

        <nav aria-label="Sections" className="mt-4 flex flex-wrap gap-2">
          {data.sections.map((s) => (
            <a key={s.id} href={`#${s.id}`} className="inline-flex min-h-11 items-center rounded-full border border-slate-300 bg-white px-4 text-sm font-bold text-ink hover:border-ink">{s.title}</a>
          ))}
        </nav>

        {data.sections.map((section) => (
          <section key={section.id} id={section.id} tabIndex={-1} className="mt-12 scroll-mt-24" aria-labelledby={`${section.id}-heading`}>
            <h2 id={`${section.id}-heading`} className="text-[26px] font-extrabold tracking-[-0.02em]">{section.title}</h2>
            <p className="mt-2 text-[15px] leading-7 text-slate-600">{section.intro}</p>
            <dl className="mt-4 divide-y divide-slate-200 rounded-[22px] border border-slate-200 bg-white">
              {section.facts.map(([label, value]) => (
                <div key={label} className="grid gap-1 px-5 py-3.5 md:grid-cols-[170px_1fr] md:gap-6">
                  <dt className="text-sm font-bold text-ink">{label}</dt>
                  <dd className="text-[15px] leading-6 text-slate-700">{value}</dd>
                </div>
              ))}
            </dl>
            <OfficialLink source={section.official} />

            <ul className="mt-4 grid gap-3 md:grid-cols-2">
              {(section.hotels as Hotel[]).map((hotel) => {
                const link = getBookingHotelLink(hotel.id);
                // Only an issued affiliate link gets a booking button; a plain
                // Booking.com URL would be an unpaid ad with our name on it.
                const bookable = link?.affiliate ? link : null;
                return (
                  <li key={hotel.id} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-4">
                    <h3 className="flex items-start gap-2 text-[16px] font-extrabold text-ink">
                      <BedDouble className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" aria-hidden="true" />
                      {hotel.name}
                    </h3>
                    <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-600"><MapPin className="h-4 w-4 shrink-0" aria-hidden="true" />{hotel.area}</p>
                    {hotel.note ? <p className="mt-2 text-[14px] leading-6 text-slate-700">{hotel.note}</p> : null}
                    {bookable ? (
                      <div className="mt-auto pt-3">
                        <TrackedAffiliateLink
                          href={bookable.href}
                          rel={AFFILIATE_REL}
                          target="_blank"
                          category="hotel"
                          provider="booking_travelpayouts"
                          placement="tokyo_special_stay"
                          label={`Check ${hotel.name} on Booking.com`}
                          linkId={bookable.linkId}
                          hotelName={hotel.name}
                          area={hotel.area}
                          city="tokyo"
                          pagePath={pagePath}
                          locale={locale}
                          className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-ink px-4 py-2.5 text-[14.5px] font-bold text-white hover:bg-slate-800"
                        >
                          Check rooms on Booking.com <ExternalLink className="h-4 w-4" aria-hidden="true" />
                        </TrackedAffiliateLink>
                      </div>
                    ) : null}
                  </li>
                );
              })}
            </ul>
            <p className="mt-2 text-xs leading-5 text-slate-500">{data.disclosure}</p>
          </section>
        ))}

        <section className="mt-12" aria-labelledby="related-heading">
          <h2 id="related-heading" className="text-lg font-extrabold">Plan the rest of your stay</h2>
          <ul className="mt-2 grid gap-1 md:grid-cols-2">
            {data.related.map(([label, href]) => (
              <li key={href}>
                <Link href={href} className="inline-flex min-h-11 items-center gap-1.5 text-[15px] font-semibold text-ink underline underline-offset-4 hover:text-fuji">
                  {label} <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <p className="mt-10 text-xs leading-5 text-slate-500">
          Room types checked on Booking.com and the hotels&rsquo; official sites on {new Date(`${data.checked}T00:00:00Z`).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" })}. Room names and availability change; check the room type on the booking page before you pay.
        </p>
      </article>
      <SiteFooter />
    </main>
  );
}
