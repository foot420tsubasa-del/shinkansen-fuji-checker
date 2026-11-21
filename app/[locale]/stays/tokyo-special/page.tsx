import type { Metadata } from "next";
import Image from "next/image";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, Building2, Check, ExternalLink, KeyRound, MapPin, Palette, Sparkles, TowerControl, Users } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { getAlternates } from "@/i18n/hreflang";
import { SiteHeader } from "../../components/SiteHeader";
import { SiteFooter } from "@/components/content/SiteFooter";
import { ProviderButton } from "@/components/ui/ProviderButton";
import { getBookingHotelLink } from "@/lib/booking-hotels";
import data from "@/data/tokyo-special-stays.json";
import photoCredits from "@/data/stay-special-photo-credits.json";
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
  guarantee: string;
  badge: string;
  feature?: string;
  photo?: string;
  note?: string;
  official?: string[];
  more?: string[];
  buttonLabel?: string;
};
type Credit = { caption: string; title: string; author: string; source: string; license: string; licenseUrl: string };

const PATH = data.path;
const credits = photoCredits as Record<string, Credit>;

// One look per theme, used for the tile, the section header and the
// photo-less cards, so a card without a photo still reads as its theme.
const THEME: Record<string, { icon: LucideIcon; panel: string; chip: string }> = {
  skytree: { icon: TowerControl, panel: "from-[#0b2345] to-[#1e3a8a]", chip: "bg-sky-50 text-sky-900 ring-sky-200" },
  "tokyo-tower": { icon: TowerControl, panel: "from-[#7c1d1d] to-[#c2410c]", chip: "bg-orange-50 text-orange-900 ring-orange-200" },
  themed: { icon: Sparkles, panel: "from-[#4c1d95] to-[#be185d]", chip: "bg-fuchsia-50 text-fuchsia-900 ring-fuchsia-200" },
  design: { icon: Palette, panel: "from-[#134e4a] to-[#0f766e]", chip: "bg-teal-50 text-teal-900 ring-teal-200" },
};

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

function Credit({ src }: { src: string }) {
  const c = credits[src];
  if (!c) return null;
  return (
    <p className="mt-1 text-[11px] leading-4 text-slate-500">
      {c.caption}. Photo: <a href={c.source} className="underline underline-offset-2">{c.author}</a>,{" "}
      {c.licenseUrl ? <a href={c.licenseUrl} className="underline underline-offset-2">{c.license}</a> : c.license}
    </p>
  );
}

function BookingButtons({ hotel, pagePath, locale }: { hotel: Hotel; pagePath: string; locale: string }) {
  const ids = [hotel.id, ...(hotel.more ?? [])];
  const links = ids.map((id) => ({ id, link: getBookingHotelLink(id) })).filter((x) => x.link?.affiliate);
  if (!links.length) return null;
  const many = links.length > 1;
  return (
    <div className={many ? "grid gap-2 sm:grid-cols-2" : "grid"}>
      {links.map(({ id, link }) => (
        <ProviderButton
          key={id}
          provider="booking_travelpayouts"
          href={link!.href}
          placement="tokyo_special_stay"
          pagePath={pagePath}
          locale={locale}
          linkId={link!.linkId}
          product="hotel"
          hotelName={link!.name}
          area={hotel.area}
          city="tokyo"
        >
          {many ? `${link!.name.replace("MIMARU Tokyo ", "")} on Booking.com` : "See this room on Booking.com"}
        </ProviderButton>
      ))}
    </div>
  );
}

export default async function TokyoSpecialStaysPage({ params }: Props) {
  const { locale } = await params;
  const pagePath = locale === "en" ? PATH : `/${locale}${PATH}`;
  const heroPhotos = [data.sections[0].photo, data.sections[1].photo].filter((p): p is string => Boolean(p));

  return (
    <main className="page-shell min-h-screen text-ink">
      <SiteHeader />
      <article className="mx-auto max-w-[960px] px-5 pb-16 pt-6 md:pt-10">
        <header>
          <p className="text-xs font-bold uppercase tracking-[0.1em] text-fuji">Tokyo · Special stays</p>
          <h1 className="mt-2 text-[30px] font-extrabold leading-[1.08] tracking-[-0.03em] md:text-[44px]">{data.h1}</h1>
        </header>

        {/* The two views most people come for, before any text. */}
        <div className="mt-4 grid grid-cols-2 gap-2 md:gap-3">
          {heroPhotos.map((src, i) => (
            <div key={src} className="relative aspect-[4/3] overflow-hidden rounded-[18px] bg-slate-200">
              <Image src={src} alt={credits[src]?.caption ?? ""} fill preload={i === 0} sizes="(min-width: 960px) 460px, 50vw" className="object-cover" />
              <span className="absolute bottom-2 left-2 rounded-full bg-black/60 px-2.5 py-1 text-xs font-bold text-white">{i === 0 ? "Skytree" : "Tokyo Tower"}</span>
            </div>
          ))}
        </div>
        <p className="mt-3 text-[15.5px] leading-7 text-slate-700">{data.lead}</p>

        {/* Theme tiles: the page's table of contents, sized for thumbs. */}
        <nav aria-label="Themes" className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-4">
          {data.sections.map((s) => {
            const T = THEME[s.id];
            return (
              <a key={s.id} href={`#${s.id}`} className={`flex min-h-14 items-center gap-2 rounded-2xl bg-gradient-to-br ${T.panel} px-3.5 py-3 text-[14.5px] font-bold text-white shadow-sm hover:brightness-110`}>
                <T.icon className="h-5 w-5 shrink-0 opacity-90" aria-hidden="true" />
                <span className="leading-5">{s.tile}</span>
              </a>
            );
          })}
        </nav>

        <aside className="mt-4 flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4" aria-labelledby="rule-heading">
          <KeyRound className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" aria-hidden="true" />
          <div>
            <h2 id="rule-heading" className="text-[15px] font-extrabold text-ink">{data.rule.title}</h2>
            <p className="mt-1 text-[14.5px] leading-6 text-slate-800">{data.rule.text}</p>
          </div>
        </aside>

        {data.sections.map((section) => {
          const T = THEME[section.id];
          return (
            <section key={section.id} id={section.id} tabIndex={-1} className="mt-12 scroll-mt-20" aria-labelledby={`${section.id}-heading`}>
              <div className={`flex items-center gap-3 rounded-[20px] bg-gradient-to-br ${T.panel} px-5 py-4 text-white`}>
                <T.icon className="h-7 w-7 shrink-0" aria-hidden="true" />
                <div>
                  <h2 id={`${section.id}-heading`} className="text-[22px] font-extrabold leading-tight tracking-[-0.02em] md:text-[26px]">{section.title}</h2>
                  <p className="mt-0.5 text-[14px] leading-5 text-white/85">{section.intro}</p>
                </div>
              </div>

              <div className="mt-4 grid gap-5 md:grid-cols-2">
                {(section.hotels as Hotel[]).map((hotel) => (
                  <div key={hotel.key ?? hotel.id} className="flex flex-col overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-[0_6px_24px_rgba(30,41,59,0.06)]">
                    {hotel.photo ? (
                      <div className="relative aspect-[16/10] bg-slate-200">
                        <Image src={hotel.photo} alt={credits[hotel.photo]?.caption ?? hotel.name} fill sizes="(min-width: 960px) 440px, calc(100vw - 40px)" className="object-cover object-[50%_30%]" />
                        <span className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${T.chip}`}>{hotel.badge}</span>
                      </div>
                    ) : (
                      // No licensed photo: a theme panel that says what's special,
                      // instead of an empty box or an unrelated city photo.
                      <div className={`relative flex aspect-[16/10] flex-col justify-end bg-gradient-to-br ${T.panel} p-5 text-white`}>
                        <span className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${T.chip}`}>{hotel.badge}</span>
                        <T.icon className="h-9 w-9 opacity-80" aria-hidden="true" />
                        <p className="mt-2 text-[20px] font-extrabold leading-tight">{hotel.feature}</p>
                      </div>
                    )}
                    <div className="flex flex-1 flex-col p-5">
                      {hotel.photo ? <Credit src={hotel.photo} /> : null}
                      <h3 className="mt-1 text-[19px] font-extrabold leading-tight tracking-[-0.01em] text-ink">{hotel.name}</h3>
                      <p className="mt-1 flex items-start gap-1.5 text-[13.5px] text-slate-600"><MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />{hotel.area}</p>
                      <p className="mt-3 text-[15px] font-semibold leading-6 text-slate-900">{hotel.what}</p>
                      <p className="mt-2 flex gap-2 text-[14px] leading-6 text-slate-700"><Users className="mt-1 h-4 w-4 shrink-0 text-slate-500" aria-hidden="true" />{hotel.suits}</p>

                      <div className="mt-4 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                        <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">Book this room type</p>
                        <p className="mt-1 text-[15px] font-bold leading-6 text-ink">{hotel.pick}</p>
                        <p className="mt-2 flex gap-1.5 text-[13.5px] leading-5 text-slate-700"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" aria-hidden="true" />{hotel.guarantee}</p>
                      </div>
                      {hotel.note ? <p className="mt-2 text-[13px] leading-5 text-slate-500">{hotel.note}</p> : null}

                      <div className="mt-auto pt-4">
                        <BookingButtons hotel={hotel} pagePath={pagePath} locale={locale} />
                        {hotel.official ? (
                          <a href={hotel.official[1]} rel="noopener noreferrer" className="mt-2 inline-flex min-h-10 items-center gap-1 text-[13.5px] font-semibold text-slate-600 underline underline-offset-2 hover:text-ink">
                            {hotel.official[0]} <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                          </a>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-2 text-xs leading-5 text-slate-500">{data.disclosure}</p>
            </section>
          );
        })}

        <section className="mt-12 rounded-[22px] border border-slate-200 bg-white p-5" aria-labelledby="related-heading">
          <h2 id="related-heading" className="flex items-center gap-2 text-lg font-extrabold"><Building2 className="h-5 w-5" aria-hidden="true" />Still choosing a neighborhood?</h2>
          <ul className="mt-2 grid gap-1 md:grid-cols-3">
            {data.related.map(([label, href]) => (
              <li key={href}>
                <Link href={href} className="inline-flex min-h-11 items-center gap-1.5 text-[15px] font-semibold text-ink underline underline-offset-4 hover:text-fuji">
                  {label} <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <p className="mt-8 text-xs leading-5 text-slate-500">
          Photos show the landmark or the hotel building, not a specific room. Room types checked on Booking.com and the hotels&rsquo; official sites on {new Date(`${data.checked}T00:00:00Z`).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" })}; names and availability change, so check the room type before you pay.
        </p>
      </article>
      <SiteFooter />
    </main>
  );
}
