import type { Metadata } from "next";
import Image from "next/image";
import { ArrowRight, Bed, Building2, Landmark, Mountain, Plane, Train, Utensils, Wifi } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { buttonClassName } from "@/components/ui/Button";
import { SiteHeader } from "../components/SiteHeader";
import { Breadcrumb } from "@/components/content/Breadcrumb";
import { SiteFooter } from "@/components/content/SiteFooter";
import { TrackedAffiliateLink } from "@/components/analytics/TrackedAffiliateLink";
import { TrackedInternalLink } from "@/components/analytics/TrackedInternalLink";
import { AFFILIATE_REL } from "@/lib/link-rel";
import { stayPages, type StayPage } from "@/lib/content/stay";
import { getAlternates } from "@/i18n/hreflang";
import { getAffUrl } from "@/src/affiliateLinks";

type Props = {
  params: Promise<{ locale: string }>;
};

type CityCard = {
  title: string;
  subtitle: string;
  href: string;
  cta: string;
  secondaryHref: string;
  secondaryLabel: string;
  placementLabel: string;
  icon: typeof Building2;
  image?: string;
};

type ProblemCard = {
  title: string;
  href: string;
  cta: string;
  icon: typeof Building2;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: "Where to Stay in Japan — Tokyo, Kyoto, Osaka and Mt. Fuji Area Guides",
    description:
      "Choose where to stay in Japan by city, route, airport access, Shinkansen plans, and travel style. Compare Tokyo, Kyoto, Osaka, and Mt. Fuji hotel areas.",
    robots: locale === "en" ? undefined : { index: false, follow: true },
    alternates: getAlternates("/areas-to-stay", locale),
    openGraph: {
      title: "Where to Stay in Japan — Tokyo, Kyoto, Osaka and Mt. Fuji Area Guides",
      description:
        "Choose where to stay in Japan by city, route, airport access, Shinkansen plans, and travel style.",
      siteName: "fujiseat",
      images: [{ url: "https://fujiseat.com/og-areas-to-stay.png", width: 1200, height: 630 }],
    },
  };
}

const cityCards: CityCard[] = [
  {
    title: "Tokyo",
    subtitle: "Best for first-time Japan, nightlife, airport choices, and Shinkansen planning.",
    href: "/areas-to-stay/tokyo-first-time",
    cta: "Choose Tokyo area",
    secondaryHref: "/local-hotel-picks#tokyo",
    secondaryLabel: "Tokyo hotel examples",
    placementLabel: "Tokyo city card",
    icon: Building2,
    image: "/images/stay/tokyo/tokyo-stay-hero.png",
  },
  {
    title: "Kyoto",
    subtitle: "Best for temples, atmosphere, classic Japan stays, and day trips.",
    href: "/areas-to-stay/kyoto-first-time",
    cta: "Choose Kyoto area",
    secondaryHref: "/local-hotel-picks#kyoto",
    secondaryLabel: "Kyoto hotel examples",
    placementLabel: "Kyoto city card",
    icon: Landmark,
    image: "/images/Kyoto.png",
  },
  {
    title: "Osaka",
    subtitle: "Best for food, nightlife, Kansai airport access, and Kyoto / Nara day trips.",
    href: "/areas-to-stay/osaka-first-time",
    cta: "Choose Osaka area",
    secondaryHref: "/local-hotel-picks#osaka",
    secondaryLabel: "Osaka hotel examples",
    placementLabel: "Osaka city card",
    icon: Utensils,
    image: "/images/Osaka.png",
  },
  {
    title: "Mt. Fuji / Kawaguchiko",
    subtitle: "Best if you want to stay overnight near Mt. Fuji instead of only seeing it from the Shinkansen.",
    href: "/areas-to-stay/kawaguchiko",
    cta: "Find Fuji-view stays",
    secondaryHref: "/guide",
    secondaryLabel: "Check Fuji-side Shinkansen seat",
    placementLabel: "Kawaguchiko city card",
    icon: Mountain,
    image: "/images/Kawaguchiko.png",
  },
];

const problemCards: ProblemCard[] = [
  {
    title: "I am visiting Japan for the first time",
    href: "/areas-to-stay/tokyo-first-time",
    cta: "Start with Tokyo",
    icon: Bed,
  },
  {
    title: "I have an early Shinkansen",
    href: "/areas-to-stay/where-to-stay-before-shinkansen",
    cta: "Pick a rail-friendly base",
    icon: Train,
  },
  {
    title: "I arrive at Narita",
    href: "/areas-to-stay/tokyo-first-time",
    cta: "Compare Tokyo bases",
    icon: Plane,
  },
  {
    title: "I want temples and old-town atmosphere",
    href: "/areas-to-stay/kyoto-first-time",
    cta: "Compare Kyoto areas",
    icon: Landmark,
  },
  {
    title: "I want food and nightlife",
    href: "/areas-to-stay/osaka-first-time",
    cta: "Compare Osaka areas",
    icon: Utensils,
  },
  {
    title: "I want a Fuji-view overnight stay",
    href: "/areas-to-stay/kawaguchiko",
    cta: "See Kawaguchiko",
    icon: Mountain,
  },
];

const guideGroups = [
  {
    city: "Tokyo",
    slugs: [
      "tokyo-first-time",
      "where-to-stay-before-shinkansen",
      "tokyo-station-vs-shinjuku",
      "ueno-vs-shinjuku",
      "asakusa-vs-ueno",
    ],
  },
  {
    city: "Kyoto",
    slugs: ["kyoto-first-time", "kyoto-station-vs-gion"],
  },
  {
    city: "Osaka",
    slugs: ["osaka-first-time", "namba-vs-umeda", "shin-osaka-vs-namba"],
  },
  {
    city: "Mt. Fuji",
    slugs: ["kawaguchiko"],
  },
] as const;

const guideDescriptions: Record<string, string> = {
  "tokyo-first-time": "Start here to compare Shinjuku, Ueno, Asakusa, Tokyo Station, and quieter East Tokyo.",
  "where-to-stay-before-shinkansen": "Use this when luggage and an early Tokyo Station departure matter.",
  "tokyo-station-vs-shinjuku": "Compare rail logistics with food, nightlife, and first-time convenience.",
  "ueno-vs-shinjuku": "Choose between Narita access and west-side Tokyo energy.",
  "asakusa-vs-ueno": "Compare old-town atmosphere with practical rail access.",
  "kyoto-first-time": "Compare Kyoto Station, Kawaramachi / Shijo, Gion, Arashiyama, and quieter north Kyoto.",
  "kyoto-station-vs-gion": "Decide whether logistics or classic Kyoto atmosphere should lead.",
  "osaka-first-time": "Compare Namba, Umeda, Shin-Osaka, Tennoji, and quieter central Osaka.",
  "namba-vs-umeda": "Choose between food/nightlife and rail access.",
  "shin-osaka-vs-namba": "Decide whether Shinkansen logistics should drive your Osaka base.",
  kawaguchiko: "Use this for an overnight Mt. Fuji view stay around Kawaguchiko.",
};

const quickAnswers = [
  "First time in Tokyo -> Start with the Tokyo first-time area guide.",
  "First time in Kyoto -> Compare Kyoto Station, Gion, and Kawaramachi.",
  "First time in Osaka -> Compare Namba, Umeda, and Shin-Osaka.",
  "Early Shinkansen day -> Choose a hotel base that works for luggage and early trains.",
  "Staying near Mt. Fuji -> Use Kawaguchiko if you want an overnight Fuji-view stay.",
];

function pageBySlug(slug: string) {
  return stayPages.find((page) => page.slug === slug);
}

function trackedLinkClass(className = "") {
  return [
    "group rounded-[18px] border border-slate-200 bg-white p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#9fd7bd] hover:bg-[#f7fffb] hover:shadow-md",
    className,
  ].join(" ");
}

function CityDecisionCard({ card, locale, pagePath }: { card: CityCard; locale: string; pagePath: string }) {
  const Icon = card.icon;

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-sm">
      {card.image ? (
        <div className="relative h-40 bg-slate-100">
          <Image src={card.image} alt={`${card.title} stay area guide`} fill sizes="(min-width: 1024px) 25vw, (min-width: 768px) 50vw, 100vw" className="object-cover" />
        </div>
      ) : (
        <div className="flex h-40 items-center justify-center bg-[linear-gradient(135deg,#f8fafc,#ecfdf5)]">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[#9fd7bd] bg-white text-[#106b43] shadow-sm">
            <Icon className="h-8 w-8" aria-hidden="true" />
          </div>
        </div>
      )}
      <div className="flex flex-1 flex-col p-5">
        <div>
          <h3 className="text-xl font-semibold text-slate-950">{card.title}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">{card.subtitle}</p>
        </div>
        <div className="mt-auto grid gap-2 pt-5">
          <TrackedInternalLink
            href={card.href}
            sourcePage={pagePath}
            placement="stay_hub_city_card"
            label={card.placementLabel}
            locale={locale}
            className={buttonClassName({ variant: "internal", fullWidth: true })}
          >
            {card.cta}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </TrackedInternalLink>
          <TrackedInternalLink
            href={card.secondaryHref}
            sourcePage={pagePath}
            placement="stay_hub_city_card"
            label={`${card.title} secondary link`}
            locale={locale}
            className={buttonClassName({ variant: "internal", fullWidth: true })}
          >
            {card.secondaryLabel}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </TrackedInternalLink>
        </div>
      </div>
    </article>
  );
}

function ProblemCardLink({ item, locale, pagePath }: { item: ProblemCard; locale: string; pagePath: string }) {
  const Icon = item.icon;

  return (
    <TrackedInternalLink
      href={item.href}
      sourcePage={pagePath}
      placement="stay_hub_problem_card"
      label={item.title}
      locale={locale}
      className="group flex items-center gap-3 rounded-[18px] border border-slate-200 bg-white p-4 text-left shadow-sm transition-colors hover:border-[#9fd7bd] hover:bg-[#f7fffb]"
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#f0fbf6] text-[#106b43]">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold leading-5 text-slate-950">{item.title}</span>
        <span className="mt-1 block text-xs font-semibold text-[#106b43]">{item.cta}</span>
      </span>
      <ArrowRight className="h-4 w-4 shrink-0 text-slate-300 group-hover:text-[#106b43]" aria-hidden="true" />
    </TrackedInternalLink>
  );
}

function GuideCard({ page, locale, pagePath }: { page: StayPage; locale: string; pagePath: string }) {
  return (
    <TrackedInternalLink
      href={`/areas-to-stay/${page.slug}`}
      sourcePage={pagePath}
      placement="stay_hub_featured_guide"
      label={page.title}
      locale={locale}
      className={trackedLinkClass()}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold leading-5 text-slate-950 group-hover:text-[#106b43]">{page.title}</h3>
          <p className="mt-1.5 text-xs leading-5 text-slate-600">
            {guideDescriptions[page.slug] ?? page.description}
          </p>
        </div>
        <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-slate-300 group-hover:text-[#106b43]" aria-hidden="true" />
      </div>
    </TrackedInternalLink>
  );
}

export default async function AreasToStayIndex({ params }: Props) {
  const { locale } = await params;
  const pagePath = "/areas-to-stay";
  const esimHref = getAffUrl("esim");

  return (
    <main className="page-shell min-h-screen text-slate-950">
      <SiteHeader />
      <Container className="py-8 md:py-12">
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Where to Stay" },
          ]}
        />

        <section className="mt-6 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#106b43]">
            <Bed className="h-4 w-4" aria-hidden="true" />
            Stay area hub
          </p>
          <div className="mt-4 grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
            <div>
              <h1 className="text-4xl font-semibold leading-tight text-slate-950 md:text-5xl">
                Where to Stay in Japan
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
                Choose the right city and hotel area before booking. Start with Tokyo, Kyoto, Osaka, or Mt. Fuji based on your route, airport, Shinkansen plans, and travel style.
              </p>
            </div>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
              <TrackedInternalLink
                href="/areas-to-stay/tokyo-first-time"
                sourcePage={pagePath}
                placement="stay_hub_hero"
                label="Start with Tokyo stay guide"
                locale={locale}
                className={buttonClassName({ variant: "internal", fullWidth: true, size: "lg" })}
              >
                Start with Tokyo stay guide
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </TrackedInternalLink>
              <TrackedInternalLink
                href="/local-hotel-picks"
                sourcePage={pagePath}
                placement="stay_hub_hero"
                label="See local hotel examples"
                locale={locale}
                className={buttonClassName({ variant: "internal", fullWidth: true, size: "lg" })}
              >
                See local hotel examples
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </TrackedInternalLink>
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-950">Quick Answer</h2>
          <ul className="mt-4 grid gap-2 md:grid-cols-2">
            {quickAnswers.map((answer) => (
              <li key={answer} className="rounded-2xl bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700">
                {answer}
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-10">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#106b43]">City first</p>
              <h2 className="mt-1 text-2xl font-semibold text-slate-950">Choose your city</h2>
            </div>
          </div>
          <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {cityCards.map((card) => (
              <CityDecisionCard key={card.title} card={card} locale={locale} pagePath={pagePath} />
            ))}
          </div>
        </section>

        <section className="mt-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#106b43]">Route logic</p>
          <h2 className="mt-1 text-2xl font-semibold text-slate-950">Choose by travel problem</h2>
          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {problemCards.map((item) => (
              <ProblemCardLink key={item.title} item={item} locale={locale} pagePath={pagePath} />
            ))}
          </div>
        </section>

        <section className="mt-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#106b43]">Existing guides</p>
          <h2 className="mt-1 text-2xl font-semibold text-slate-950">Featured stay guides</h2>
          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            {guideGroups.map((group) => {
              const pages = group.slugs.map(pageBySlug).filter((page): page is StayPage => Boolean(page));
              return (
                <section key={group.city} className="rounded-[22px] border border-slate-200 bg-slate-50/80 p-4">
                  <h3 className="text-base font-semibold text-slate-950">{group.city}</h3>
                  <div className="mt-3 grid gap-3">
                    {pages.map((page) => (
                      <GuideCard key={page.slug} page={page} locale={locale} pagePath={pagePath} />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        </section>

        <section className="mt-10 rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#106b43]">Hotel examples</p>
          <h2 className="mt-1 text-2xl font-semibold text-slate-950">Need actual hotel examples?</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            See practical hotel examples for Tokyo, Kyoto, and Osaka. These are not rankings — they are starting points by area logic.
          </p>
          <TrackedInternalLink
            href="/local-hotel-picks"
            sourcePage={pagePath}
            placement="stay_hub_local_picks"
            label="See local hotel picks"
            locale={locale}
            className={buttonClassName({ variant: "internal", className: "mt-4" })}
          >
            See local hotel picks
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </TrackedInternalLink>
        </section>

        <section className="mt-10">
          <h2 className="text-lg font-semibold text-slate-950">Continue planning</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-4">
            <TrackedInternalLink href="/plan-your-trip" sourcePage={pagePath} placement="stay_hub_continue_planning" label="Plan Your Trip" locale={locale} className={buttonClassName({ variant: "internal", fullWidth: true, className: "text-center" })}>
              Plan Your Trip
            </TrackedInternalLink>
            <TrackedInternalLink href="/guide" sourcePage={pagePath} placement="stay_hub_continue_planning" label="Seat Checker" locale={locale} className={buttonClassName({ variant: "internal", fullWidth: true, className: "text-center" })}>
              Seat Checker
            </TrackedInternalLink>
            <TrackedInternalLink href="/airport-transfers" sourcePage={pagePath} placement="stay_hub_continue_planning" label="Airport Transfers" locale={locale} className={buttonClassName({ variant: "internal", fullWidth: true, className: "text-center" })}>
              Airport Transfers
            </TrackedInternalLink>
            {esimHref ? (
              <TrackedAffiliateLink
                href={esimHref}
                target="_blank"
                rel={AFFILIATE_REL}
                category="esim"
                provider="klook"
                placement="stay_hub_continue_planning"
                pagePath={pagePath}
                locale={locale}
                label="Japan eSIM"
                linkId="esim"
                product="esim"
                adid="1166001"
                className={buttonClassName({ variant: "commercial", fullWidth: true, className: "text-center" })}
              >
                Japan eSIM
                <Wifi className="h-4 w-4" aria-hidden="true" />
              </TrackedAffiliateLink>
            ) : (
              <TrackedInternalLink href="/plan-your-trip" sourcePage={pagePath} placement="stay_hub_continue_planning" label="Japan eSIM" locale={locale} className={buttonClassName({ variant: "internal", fullWidth: true, className: "text-center" })}>
                Japan eSIM
              </TrackedInternalLink>
            )}
          </div>
        </section>
      </Container>
      <SiteFooter />
    </main>
  );
}
