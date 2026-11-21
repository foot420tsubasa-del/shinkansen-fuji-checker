import type { Metadata } from "next";
import { ArrowRight, ExternalLink, MapPin, Users, KeyRound } from "lucide-react";
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
type Hotel = {
  id: string;
  key?: string;
  name: string;
  area: string;
  what: string;
  suits: string;
  pick: string;
  note?: string;
  official?: string[];
  more?: string[];
};

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

function BookingButton({ id, label, pagePath, locale, area }: { id: string; label: string; pagePath: string; locale: string; area: string }) {
  const link = getBookingHotelLink(id);
  // Only an issued affiliate link gets a button; a plain Booking.com URL would
  // be an unpaid ad with our name on it.
  if (!link?.affiliate) return null;
  return (
    <TrackedAffiliateLink
      href={link.href}
      rel={AFFILIATE_REL}
      target="_blank"
      category="hotel"
      provider="booking_travelpayouts"
      placement="tokyo_special_stay"
      label={`Check ${link.name} on Booking.com`}
      linkId={link.linkId}
      hotelName={link.name}
      area={area}
      city="tokyo"
      pagePath={pagePath}
      locale={locale}
      className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-ink px-4 py-2.5 text-[14.5px] font-bold text-white hover:bg-slate-800 md:w-auto"
    >
      {label} <ExternalLink className="h-4 w-4" aria-hidden="true" />
    </TrackedAffiliateLink>
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

        <nav aria-label="Sections" className="sticky top-14 z-10 -mx-5 mt-4 flex gap-2 overflow-x-auto bg-[var(--page-bg,#f7f8fb)]/95 px-5 py-2 backdrop-blur md:static md:mx-0 md:flex-wrap md:px-0">
          {data.sections.map((s) => (
            <a key={s.id} href={`#${s.id}`} className="inline-flex min-h-11 shrink-0 items-center whitespace-nowrap rounded-full border border-slate-300 bg-white px-4 text-sm font-bold text-ink hover:border-ink">{s.title}</a>
          ))}
        </nav>

        {data.sections.map((section) => (
          <section key={section.id} id={section.id} tabIndex={-1} className="mt-12 scroll-mt-28" aria-labelledby={`${section.id}-heading`}>
            <h2 id={`${section.id}-heading`} className="text-[26px] font-extrabold tracking-[-0.02em]">{section.title}</h2>
            <p className="mt-2 text-[15px] leading-7 text-slate-600">{section.intro}</p>
            <div className="mt-4 grid gap-4">
              {(section.hotels as Hotel[]).map((hotel) => (
                <div key={hotel.key ?? hotel.id} className="rounded-[22px] border border-slate-200 bg-white p-5">
                  <h3 className="text-[19px] font-extrabold tracking-[-0.01em] text-ink">{hotel.name}</h3>
                  <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-600"><MapPin className="h-4 w-4 shrink-0" aria-hidden="true" />{hotel.area}</p>
                  <p className="mt-3 text-[15px] leading-6 text-slate-800">{hotel.what}</p>
                  <p className="mt-2 flex gap-2 text-[14.5px] leading-6 text-slate-700"><Users className="mt-1 h-4 w-4 shrink-0 text-slate-500" aria-hidden="true" />{hotel.suits}</p>
                  <div className="mt-3 rounded-2xl bg-amber-50 p-3.5">
                    <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.08em] text-amber-900"><KeyRound className="h-3.5 w-3.5" aria-hidden="true" />Room type to pick</p>
                    <p className="mt-1 text-[14.5px] font-semibold leading-6 text-slate-900">{hotel.pick}</p>
                  </div>
                  {hotel.note ? <p className="mt-2 text-[13.5px] leading-5 text-slate-500">{hotel.note}</p> : null}
                  <div className="mt-3 flex flex-col gap-2 md:flex-row md:flex-wrap md:items-center">
                    <BookingButton id={hotel.id} label="Check rooms on Booking.com" pagePath={pagePath} locale={locale} area={hotel.area} />
                    {(hotel.more ?? []).map((id) => {
                      const link = getBookingHotelLink(id);
                      return link?.affiliate ? (
                        <BookingButton key={id} id={id} label={link.name.replace("MIMARU Tokyo ", "")} pagePath={pagePath} locale={locale} area={link.name} />
                      ) : null;
                    })}
                    {hotel.official ? (
                      <a href={hotel.official[1]} rel="noopener noreferrer" className="inline-flex min-h-10 items-center gap-1 text-sm font-semibold text-slate-700 underline underline-offset-2 hover:text-ink">
                        {hotel.official[0]} <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                      </a>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
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
