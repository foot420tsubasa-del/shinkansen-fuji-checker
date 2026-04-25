import { ArrowRight, ExternalLink, Luggage, MapPinned, Plane, Sparkles, Train, Building2 } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { getAffUrl } from "@/src/affiliateLinks";
import { AFFILIATE_REL } from "@/lib/link-rel";

type ExternalItem = {
  label: string;
  description: string;
  linkId?: string;
  href?: string;
};

type Category = {
  title: string;
  description: string;
  icon: typeof Train;
  items: ExternalItem[];
  comingSoon?: string[];
};

const categories: Category[] = [
  {
    title: "Shinkansen & Rail",
    description: "Compare the train decisions that matter after choosing the Fuji-side seat.",
    icon: Train,
    items: [
      { label: "Shinkansen tickets guide", description: "Check seat side, timing, and booking context before buying.", href: "/guide" },
      { label: "Compare JR Pass vs single tickets", description: "Usually worth it only for multiple long-distance rides.", linkId: "jrPass" },
      { label: "Tokyo to Kyoto route", description: "Use the golden route itinerary before booking.", href: "/itineraries/7-day-first-time-japan" },
      { label: "Tokyo to Osaka route", description: "Plan the Shinkansen day and onward stay.", href: "/itineraries/7-day-first-time-japan" },
    ],
    comingSoon: ["Direct Shinkansen ticket booking link"],
  },
  {
    title: "Arrival Essentials",
    description: "Set up the practical pieces that reduce arrival-day stress.",
    icon: Plane,
    items: [
      { label: "Japan eSIM", description: "Maps, translation, transit, and backup access from landing.", linkId: "esim" },
      { label: "Airport transfer", description: "Compare Narita and Haneda routes into Tokyo.", href: "/airport-transfers" },
      { label: "Narita Express (N'EX)", description: "Simple reserved train from Narita into central Tokyo.", linkId: "nex" },
      { label: "Skyliner", description: "Fast Narita access to Ueno and Nippori.", linkId: "skyliner" },
      { label: "Limousine bus", description: "Luggage-friendly airport bus options.", linkId: "limousineBus" },
      { label: "Travel insurance", description: "Medical and cancellation coverage before departure.", linkId: "insurance" },
    ],
  },
  {
    title: "Stay Near the Right Station",
    description: "Pick a base that makes Shinkansen days and luggage movement easier.",
    icon: Building2,
    items: [
      { label: "Tokyo Station hotels", description: "Most efficient for early Shinkansen departures.", linkId: "hotelTokyo" },
      { label: "Shinjuku hotels", description: "Better nightlife and still practical for Tokyo Station.", linkId: "hotelShinjuku" },
      { label: "Kyoto Station hotels", description: "Best logistics for first-time Kyoto stays.", linkId: "hotelKyotoStation" },
      { label: "Shin-Osaka / Osaka hotels", description: "Easy Kansai base for Osaka and onward rail.", linkId: "hotelOsaka" },
      { label: "Namba hotels", description: "Best for Dotonbori nightlife and food.", linkId: "hotelOsaka" },
    ],
    comingSoon: ["Shinagawa hotel picks"],
  },
  {
    title: "Luggage & Transfers",
    description: "Keep the heavy logistics away from your sightseeing time.",
    icon: Luggage,
    items: [
      { label: "Private car charter", description: "Useful for families, Fuji-area days, or heavy luggage.", linkId: "carRental" },
      { label: "Airport transfer guide", description: "Choose train, bus, or private transfer by arrival style.", href: "/airport-transfers" },
    ],
    comingSoon: ["Luggage delivery", "Private transfer"],
  },
  {
    title: "See Mt. Fuji Up Close",
    description: "Extend the Shinkansen view into a Fuji-area day or overnight stay.",
    icon: MapPinned,
    items: [
      { label: "Kawaguchiko hotels", description: "Stay overnight for the best morning Fuji chance.", linkId: "hotelKawaguchiko" },
      { label: "Hakone Free Pass", description: "A classic Fuji-area and onsen side trip.", linkId: "hakone" },
      { label: "Hakone hotels", description: "Onsen stays that pair well with the golden route.", linkId: "hotelHakone" },
    ],
    comingSoon: ["Private Mt. Fuji tour", "Group Mt. Fuji tour", "Kawaguchiko day trip"],
  },
  {
    title: "City Activities",
    description: "Book the city pieces that fit around your Shinkansen route.",
    icon: Sparkles,
    items: [
      { label: "Tokyo food tours", description: "Local food walks and guided city experiences.", linkId: "foodTourTokyo" },
      { label: "teamLab Borderless", description: "Popular Tokyo digital art museum.", linkId: "teamlabBorderless" },
      { label: "Tokyo Tower", description: "Classic Tokyo view after dark.", linkId: "tokyoTower" },
      { label: "Kyoto kimono rental", description: "Easy add-on for Gion and Higashiyama days.", linkId: "kimonoRentalKyoto" },
      { label: "Nara / Fushimi Inari", description: "Popular Kyoto-area day tour.", linkId: "fushimiInariNaraTour" },
      { label: "Osaka Amazing Pass", description: "Transport and attraction pass for Osaka.", linkId: "osakaAmazingPass" },
      { label: "Universal Studios Japan", description: "Reserve early for high-demand Osaka days.", linkId: "universalStudiosJapan" },
    ],
  },
];

const internalLinks = [
  { label: "Use the trip planner", href: "/planner" },
  { label: "Read the Fuji seat guide", href: "/guide" },
  { label: "Browse itineraries", href: "/itineraries" },
  { label: "Compare stay areas", href: "/areas-to-stay" },
  { label: "Airport transfer guides", href: "/airport-transfers" },
  { label: "Explore route map", href: "/command-center" },
];

function resolveItem(item: ExternalItem) {
  if (item.href) return { ...item, url: item.href, external: item.href.startsWith("http") };
  if (!item.linkId) return null;
  const url = getAffUrl(item.linkId);
  if (!url) return null;
  return { ...item, url, external: true };
}

export function PlanYourTripHub() {
  return (
    <main className="page-shell min-h-screen text-slate-950">
      <Container className="py-8 md:py-12">
        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <Card className="p-6 md:p-8" tone="navy">
            <p className="text-[11px] font-semibold uppercase text-sky-200">Japan trip essentials</p>
            <h1 className="mt-3 max-w-4xl text-3xl font-semibold leading-tight text-white md:text-5xl">
              Japan Trip Essentials After Choosing Your Shinkansen Seat
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300 md:text-base">
              You checked your Fuji-side Shinkansen seat. Now prepare the rest of your Japan trip.
            </p>
          </Card>

          <Card className="p-5" tone="accent">
            <p className="text-[11px] font-semibold uppercase text-sky-700">Keep planning</p>
            <div className="mt-3 grid gap-2">
              {internalLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-sky-100 bg-white px-3 py-2.5 text-sm font-semibold text-slate-800 transition-colors hover:border-sky-200 hover:bg-sky-50"
                >
                  {link.label}
                  <ArrowRight className="h-4 w-4 text-sky-600" />
                </Link>
              ))}
            </div>
          </Card>
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {categories.map((category) => {
            const Icon = category.icon;
            const resolved = category.items.map(resolveItem).filter(Boolean) as Array<ExternalItem & { url: string; external: boolean }>;
            return (
              <Card key={category.title} className="flex flex-col p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-sky-100 bg-sky-50 text-sky-700">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-slate-950">{category.title}</h2>
                    <p className="mt-1 text-xs leading-5 text-slate-500">{category.description}</p>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  {resolved.map((item) => {
                    const content = (
                      <>
                        <span>
                          <span className="block text-sm font-semibold text-slate-900">{item.label}</span>
                          <span className="mt-0.5 block text-xs leading-5 text-slate-500">{item.description}</span>
                        </span>
                        {item.external ? (
                          <ExternalLink className="h-4 w-4 shrink-0 text-sky-600" />
                        ) : (
                          <ArrowRight className="h-4 w-4 shrink-0 text-sky-600" />
                        )}
                      </>
                    );
                    if (item.external) {
                      return (
                        <a
                          key={`${category.title}-${item.label}`}
                          href={item.url}
                          target="_blank"
                          rel={AFFILIATE_REL}
                          className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-3 transition-colors hover:border-sky-200 hover:bg-sky-50"
                        >
                          {content}
                        </a>
                      );
                    }
                    return (
                      <Link
                        key={`${category.title}-${item.label}`}
                        href={item.url}
                        className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-3 transition-colors hover:border-sky-200 hover:bg-sky-50"
                      >
                        {content}
                      </Link>
                    );
                  })}
                </div>

                {category.comingSoon && category.comingSoon.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {category.comingSoon.map((label) => (
                      <span key={label} className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-semibold text-slate-500">
                        {label} · coming soon
                      </span>
                    ))}
                  </div>
                )}
              </Card>
            );
          })}
        </section>

        <p className="mt-8 text-center text-[10px] leading-5 text-slate-400">
          Partner links are shown only when a valid URL is configured. Some links may earn fujiseat a commission at no extra cost to you.
        </p>
      </Container>
    </main>
  );
}
