import type { Metadata } from "next";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { SiteHeader } from "../components/SiteHeader";
import { Breadcrumb } from "@/components/content/Breadcrumb";
import { SiteFooter } from "@/components/content/SiteFooter";
import { getAlternates } from "@/i18n/hreflang";
import {
  getAllLocalHotelPicks,
  getLocalHotelPicksByCity,
  LOCAL_HOTEL_PICK_CITIES,
  type LocalHotelPick,
} from "@/lib/content/local-hotel-picks";
import { LocalHotelPickCard } from "./LocalHotelPickCard";

type Props = {
  params: Promise<{ locale: string }>;
};

type TokyoPickGroup = {
  label: string;
  description: string;
  pickIds: string[];
  imagePath: string;
  fallbackHref?: string;
  fallbackLabel?: string;
};

const TOKYO_PICK_GROUPS: TokyoPickGroup[] = [
  {
    label: "Calm Shinjuku",
    description: "Shinjuku access without sleeping in the loudest nightlife blocks.",
    pickIds: ["yuenShinjuku"],
    imagePath: "/images/stay/tokyo/stay-shinjuku.png",
    fallbackHref: "/areas-to-stay/tokyo/shinjuku",
    fallbackLabel: "See Shinjuku area logic",
  },
  {
    label: "Family / group",
    description: "Apartment-style rooms and practical layouts for families or friends.",
    pickIds: ["mimaruShinjukuWest"],
    imagePath: "/images/stay/tokyo/stay-shinjuku.png",
    fallbackHref: "/areas-to-stay/tokyo/shinjuku",
    fallbackLabel: "See Shinjuku area logic",
  },
  {
    label: "Practical Nishi-Shinjuku",
    description: "West-side Shinjuku examples for calmer logistics and first Tokyo stays.",
    pickIds: ["daiwaRoynetNishiShinjuku", "theKnotShinjuku"],
    imagePath: "/images/stay/tokyo/stay-shinjuku.png",
    fallbackHref: "/areas-to-stay/tokyo/shinjuku",
    fallbackLabel: "See Shinjuku area logic",
  },
  {
    label: "East Tokyo personality stay",
    description: "A more local-feeling base for travelers who care about cafes, streets, and atmosphere.",
    pickIds: ["citanHostel"],
    imagePath: "/images/stay/tokyo/stay-east-tokyo.png",
    fallbackHref: "/areas-to-stay/tokyo/east-tokyo",
    fallbackLabel: "See East Tokyo area logic",
  },
  {
    label: "Tokyo Station logistics",
    description: "Best when early Shinkansen, luggage, and transfers matter more than nightlife.",
    pickIds: [],
    imagePath: "/images/stay/tokyo/stay-tokyo-station.png",
    fallbackHref: "/areas-to-stay/tokyo/tokyo-station",
    fallbackLabel: "See Tokyo Station area logic",
  },
];

const CITY_INTROS: Record<string, string> = {
  Kyoto: "Examples that map to station convenience, quieter Kyoto streets, and temple-side walking.",
  Osaka: "Examples that map to Namba food access, KIX convenience, group stays, and Kita-side logistics.",
};

function pickMapById(picks: LocalHotelPick[]) {
  return new Map(picks.map((pick) => [pick.id, pick]));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: "Japanese Local Hotel Picks for Tokyo, Kyoto and Osaka | fujiseat",
    description:
      "A curated set of hotel picks in Tokyo, Kyoto and Osaka based on Japanese local area logic, including calmer Shinjuku stays, Kyoto Station bases, family-friendly rooms and practical Osaka locations.",
    robots: locale === "en" ? undefined : { index: false, follow: true },
    openGraph: {
      title: "Japanese Local Hotel Picks for Tokyo, Kyoto and Osaka",
      description:
        "A curated set of hotel picks in Tokyo, Kyoto and Osaka based on Japanese local area logic, including calmer Shinjuku stays, Kyoto Station bases, family-friendly rooms and practical Osaka locations.",
      siteName: "fujiseat",
    },
    alternates: getAlternates("/local-hotel-picks", locale),
  };
}

export default async function LocalHotelPicksPage({ params }: Props) {
  const { locale } = await params;
  const pagePath = "/local-hotel-picks";
  const allPicksById = pickMapById(getAllLocalHotelPicks());

  return (
    <main className="page-shell min-h-screen text-slate-950">
      <SiteHeader />

      <Container className="py-8 md:py-12">
        <Breadcrumb
          items={[{ label: "Local Hotel Picks" }]}
        />

        <section className="mt-4 rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#106b43]">Hotel examples</p>
          <h1 className="mt-3 text-3xl font-semibold leading-tight text-slate-950 md:text-5xl">
            Local Hotel Picks in Japan
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-600 md:text-base">
            Not rankings. Practical hotel examples by area logic for Tokyo, Kyoto, and Osaka.
          </p>
          <nav className="mt-6 flex flex-wrap gap-2" aria-label="Hotel pick city tabs">
            {LOCAL_HOTEL_PICK_CITIES.map((city) => (
              <a key={city} href={`#${city.toLowerCase()}`} className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-700 transition-colors hover:border-emerald-200 hover:bg-emerald-50 hover:text-[#106b43]">
                {city}
              </a>
            ))}
          </nav>
        </section>

        <div className="mt-8 space-y-12">
          <section id="tokyo" className="scroll-mt-24">
            <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Tokyo</p>
                <h2 className="mt-1 text-2xl font-semibold text-slate-950">Tokyo examples by area logic</h2>
              </div>
              <Link href="/areas-to-stay/tokyo-first-time" className="text-sm font-semibold text-[#106b43] underline underline-offset-4">
                Tokyo stay area guide
              </Link>
            </div>

            <div className="mt-5 space-y-6">
              {TOKYO_PICK_GROUPS.map((group) => {
                const picks = group.pickIds
                  .map((id) => allPicksById.get(id))
                  .filter(Boolean) as LocalHotelPick[];

                return (
                  <section key={group.label} className="rounded-[22px] border border-slate-200 bg-slate-50/80 p-4 md:p-5">
                    <div className="flex flex-col justify-between gap-2 md:flex-row md:items-end">
                      <div>
                        <h3 className="text-base font-semibold text-slate-950">{group.label}</h3>
                        <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-600">{group.description}</p>
                      </div>
                      {group.fallbackHref && group.fallbackLabel ? (
                        <Link href={group.fallbackHref} className="text-xs font-semibold text-[#106b43] underline underline-offset-4">
                          {group.fallbackLabel}
                        </Link>
                      ) : null}
                    </div>

                    {picks.length > 0 ? (
                      <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {picks.map((pick) => (
                          <LocalHotelPickCard
                            key={pick.id}
                            pick={pick}
                            locale={locale}
                            pagePath={pagePath}
                            groupLabel={group.label}
                            imagePath={group.imagePath}
                            imageAlt={`${group.label} hotel area atmosphere in Tokyo`}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="mt-4 overflow-hidden rounded-[18px] border border-dashed border-slate-300 bg-white">
                        <div className="relative h-36 bg-slate-100">
                          <Image src={group.imagePath} alt={`${group.label} hotel area atmosphere in Tokyo`} fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
                        </div>
                        <div className="p-4">
                          <p className="text-sm font-semibold text-slate-900">No individual hotel example here yet.</p>
                          <p className="mt-1 text-xs leading-5 text-slate-600">
                            Use the area guide first, then compare hotels once this base fits your route.
                          </p>
                        </div>
                      </div>
                    )}
                  </section>
                );
              })}
            </div>
          </section>

          {LOCAL_HOTEL_PICK_CITIES.filter((city) => city !== "Tokyo").map((city) => {
            const picks = getLocalHotelPicksByCity(city);
            if (picks.length === 0) return null;

            return (
              <section key={city} id={city.toLowerCase()} className="scroll-mt-24">
                <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">{city}</p>
                    <h2 className="mt-1 text-2xl font-semibold text-slate-950">{city} examples by area logic</h2>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{CITY_INTROS[city]}</p>
                  </div>
                  {city === "Kyoto" ? (
                    <Link href="/areas-to-stay/kyoto-station-vs-gion" className="text-sm font-semibold text-[#106b43] underline underline-offset-4">
                      Kyoto stay area guide
                    </Link>
                  ) : (
                    <Link href="/areas-to-stay/namba-vs-umeda" className="text-sm font-semibold text-[#106b43] underline underline-offset-4">
                      Osaka stay area guide
                    </Link>
                  )}
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {picks.map((pick) => (
                    <LocalHotelPickCard
                      key={pick.id}
                      pick={pick}
                      locale={locale}
                      pagePath={pagePath}
                      groupLabel={pick.area}
                    />
                  ))}
                </div>
              </section>
            );
          })}

          <section className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-500">
              Continue planning
            </p>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              {[
                { href: "/areas-to-stay/tokyo-first-time", label: "Tokyo stay area guide", desc: "Choose Shinjuku, Ueno, Asakusa, Tokyo Station, or East Tokyo." },
                { href: "/areas-to-stay/kyoto-station-vs-gion", label: "Kyoto stay area guide", desc: "Pick between station convenience and Kyoto atmosphere." },
                { href: "/areas-to-stay/namba-vs-umeda", label: "Osaka stay area guide", desc: "Compare Osaka's two main hotel zones." },
                { href: "/plan-your-trip", label: "Plan Your Trip", desc: "Rail, hotels, arrival setup, and route order." },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex flex-col rounded-2xl border border-slate-200 bg-white p-4 transition-colors hover:border-slate-300 hover:bg-slate-50"
                >
                  <span className="text-sm font-semibold text-slate-900">{item.label}</span>
                  <span className="mt-1 text-xs leading-5 text-slate-500">{item.desc}</span>
                </Link>
              ))}
            </div>
          </section>
        </div>

      </Container>
      <SiteFooter />
    </main>
  );
}
