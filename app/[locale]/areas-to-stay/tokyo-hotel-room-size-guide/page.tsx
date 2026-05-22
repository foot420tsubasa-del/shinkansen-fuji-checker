import type { Metadata } from "next";
import { Ruler, SearchCheck } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Breadcrumb } from "@/components/content/Breadcrumb";
import { SiteFooter } from "@/components/content/SiteFooter";
import { TrackedInternalLink } from "@/components/analytics/TrackedInternalLink";
import { getAlternates } from "@/i18n/hreflang";
import { SiteHeader } from "../../components/SiteHeader";

type Props = {
  params: Promise<{ locale: string }>;
};

const pagePath = "/areas-to-stay/tokyo-hotel-room-size-guide";

const roomRanges = [
  ["Under 18㎡", "Very compact for two travelers with large luggage."],
  ["19–22㎡", "Workable for short stays, but still compact if you have two large suitcases."],
  ["23–26㎡", "Safer for two travelers who want to open luggage more comfortably."],
  ["27–30㎡", "Comfortable by Tokyo hotel standards for two travelers."],
  ["30㎡+", "Generally comfortable for two by Tokyo hotel standards, but not necessarily “large” by every country’s standards."],
  ["35㎡+", "Better for families, groups, long stays, or apartment-style layouts."],
];

const bookingChecks = [
  "Room size in square meters",
  "Bed type: double, twin, triple, family room",
  "Number of beds, sofa beds, or futons",
  "Whether large suitcases can be opened",
  "Reviews mentioning “small room” or “luggage”",
  "Bathroom layout",
  "Elevator access from station to hotel",
  "Luggage storage before check-in or after check-out",
  "Late check-in availability",
  "Cancellation policy",
  "Street noise or nightlife noise in reviews",
];

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: "Tokyo Hotel Room Size Guide: How Small Is Too Small?",
    description:
      "Tokyo hotel rooms can feel compact with luggage. Learn what room sizes mean for two travelers, families, large suitcases, and Tokyo hotel-base planning.",
    robots: locale === "en" ? undefined : { index: false, follow: true },
    alternates: getAlternates(pagePath, locale),
  };
}

export default async function TokyoHotelRoomSizeGuidePage({ params }: Props) {
  const { locale } = await params;

  return (
    <main className="min-h-screen bg-[#f7f4ec]">
      <SiteHeader />
      <Container className="py-10 md:py-14">
        <Breadcrumb
          items={[
            { href: "/", label: "Home" },
            { href: "/areas-to-stay", label: "Where to stay" },
            { href: "/areas-to-stay/tokyo-first-time", label: "Tokyo" },
            { label: "Room size guide" },
          ]}
        />

        <section className="mt-6 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm md:p-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#106b43]">Tokyo hotel planning</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-tight text-slate-950 md:text-5xl">
            Tokyo Hotel Room Size Guide: How Small Is Too Small?
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-slate-600">
            Tokyo hotel rooms can feel compact compared with hotels or apartments in some countries. Photos can make
            rooms look easier than they feel once you add suitcases, beds, and a compact bathroom.
          </p>
          <div className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-5">
            <h2 className="text-xl font-semibold text-slate-950">Quick answer</h2>
            <p className="mt-2 text-sm leading-6 text-slate-700">
              For two travelers, rooms under 18㎡ can feel tight with large suitcases. Around 22–26㎡ is usually
              workable, and 30㎡+ is generally comfortable for two by Tokyo hotel standards. For families or 3–4
              travelers, room type and bed setup matter more than area name alone.
            </p>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-semibold text-slate-950">Room size ranges for Tokyo hotels</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {roomRanges.map(([title, body]) => (
              <article key={title} className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
                <Ruler className="h-5 w-5 text-[#106b43]" aria-hidden="true" />
                <h3 className="mt-4 text-lg font-semibold text-slate-950">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{body}</p>
              </article>
            ))}
          </div>
          <p className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
            30㎡+ is comfortable for two by Tokyo hotel standards. It is not universally large, especially if you are
            comparing it with apartments or hotels in roomier destinations.
          </p>
        </section>

        <section className="mt-10 rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-slate-950">What to check before booking</h2>
          <ul className="mt-5 grid gap-2 text-sm leading-6 text-slate-700 md:grid-cols-2">
            {bookingChecks.map((item) => (
              <li key={item} className="flex gap-2 rounded-2xl bg-slate-50 px-4 py-3">
                <SearchCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#168a56]" aria-hidden="true" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-10 grid gap-5 lg:grid-cols-2">
          <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-semibold text-slate-950">Why room size changes the best Tokyo area</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              The best area is not only about attractions. If you have large suitcases, children, older family members,
              or a long stay, the best hotel area may change because some areas make larger rooms, calmer streets, or
              easier station access more practical.
            </p>
          </div>
          <div className="rounded-[24px] border border-emerald-100 bg-emerald-50/70 p-6 shadow-sm">
            <h2 className="text-2xl font-semibold text-slate-950">How to use this with area planning</h2>
            <p className="mt-3 text-sm leading-6 text-slate-700">
              Room size is only one part of the hotel-base decision. Compare it with airport access, Shinkansen plans,
              luggage, and neighborhood noise before you choose where to book.
            </p>
            <TrackedInternalLink
              href="/areas-to-stay/tokyo-first-time"
              sourcePage={pagePath}
              placement="room_size_pack_cta"
              label="Tokyo stay area guide"
              locale={locale}
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[#106b43] underline underline-offset-4"
            >
              Open Tokyo stay area guide →
            </TrackedInternalLink>
          </div>
        </section>

        <section className="mt-10 rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-950">Continue planning</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-4">
            {[
              ["/areas-to-stay/tokyo-first-time", "Tokyo stay area guide"],
              ["/local-hotel-picks", "Local hotel examples"],
              ["/airport-transfers", "Airport transfers"],
              ["/guide", "Shinkansen Seat E guide"],
            ].map(([href, label]) => (
              <TrackedInternalLink
                key={href}
                href={href}
                sourcePage={pagePath}
                placement="room_size_pack_cta"
                label={label}
                locale={locale}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-semibold text-slate-900 transition-colors hover:bg-white"
              >
                {label} →
              </TrackedInternalLink>
            ))}
          </div>
        </section>
      </Container>
      <SiteFooter />
    </main>
  );
}
