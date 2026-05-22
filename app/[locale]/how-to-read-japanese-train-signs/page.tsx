import type { Metadata } from "next";
import type { ReactNode } from "react";
import Script from "next/script";
import { ArrowRight, CheckCircle2, DoorOpen, HelpCircle, MapPinned, Route, Signpost, Smartphone, Train, Waypoints } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { SiteHeader } from "../components/SiteHeader";
import { SiteLegalLinks } from "@/components/content/SiteLegalLinks";
import { getAlternates } from "@/i18n/hreflang";
import { EsimCta, InternalCta } from "./TrainSignsCtas";
import { ShareThisPage } from "@/components/share/ShareThisPage";
import { TrackedCtaLink } from "@/components/analytics/TrackedCtaLink";

type Props = { params: Promise<{ locale: string }> };

const title = "How to Read Japanese Train Signs: Line, Direction, Platform and Exit";
const description =
  "A practical guide for first-time visitors to Japan: how to read train signs, check the line, direction, platform, train type and station exit without getting confused.";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: `${title} | fujiseat`,
    description,
    robots: locale === "en" ? undefined : { index: false, follow: true },
    openGraph: { title, description, siteName: "fujiseat" },
    alternates: getAlternates("/how-to-read-japanese-train-signs", locale),
  };
}

const mentalSteps = [
  {
    title: "1. Find the line",
    icon: Route,
    examples: ["JR Yamanote Line", "Tokyo Metro Ginza Line", "Toei Asakusa Line", "Tokaido Shinkansen"],
    body: "Start with the line name before you think about the destination. Large stations may contain JR lines, subway lines, private railway lines, and Shinkansen gates in the same complex. If your app says Tokyo Metro Ginza Line, do not follow a JR sign just because the destination station looks familiar.",
  },
  {
    title: "2. Check the direction",
    icon: Signpost,
    examples: ["for Shibuya", "for Ueno", "for Oshiage", "for Kyoto", "for Shin-Osaka"],
    body: "Direction tells you which side of the line you need. Japanese signs often use major stations at the end of the route, not every small stop. If you are going only two stops, you still follow the direction shown by the larger destination printed on the platform sign.",
  },
  {
    title: "3. Check the train type",
    icon: Train,
    examples: ["Local", "Rapid", "Express", "Limited Express", "Airport Express", "Shinkansen"],
    body: "Train type matters because trains on the same line and in the same direction may not stop at the same stations. A Local may stop everywhere. A Rapid or Express may skip smaller stations. A Limited Express or Airport Express may require a ticket or follow a different stopping pattern.",
  },
  {
    title: "4. Check the platform",
    icon: Waypoints,
    examples: ["Platform 3", "Track 14", "Shinkansen tracks", "Same platform, different direction"],
    body: "Use the platform number as confirmation, not as the only clue. Platforms can change, and one platform can serve different trains at different times. Match the line, direction, departure time, and train type before boarding.",
  },
  {
    title: "5. Check the exit or transfer gate",
    icon: DoorOpen,
    examples: ["Yaesu South Exit", "Hachiko Exit", "A1 Exit", "Shinkansen transfer gate"],
    body: "In Japan, the exit is part of the trip. The wrong exit at Tokyo Station, Shinjuku Station, or Kyoto Station can put you ten to twenty minutes away from your hotel or meeting point. Follow exit names, exit numbers, and transfer gate signs after you get off.",
  },
];

const confusingCases = [
  {
    title: "Same station name, different railway company",
    body: "A station name can be shared by JR, Tokyo Metro, Toei Subway, Keisei, Keikyu, Odakyu, Tobu, Kintetsu, Hankyu, or another company. The stations may connect underground, but they can have separate ticket gates and different platforms. When an app says JR Ueno, Tokyo Metro Ueno, or Keisei Ueno, those details matter.",
  },
  {
    title: "Local vs Rapid vs Express",
    body: "Local trains usually stop at every station. Rapid and Express trains skip some stations. Limited Express trains may require a supplement, especially on private railways and airport routes. Do not assume faster is better. Faster is only better if the train stops where you need to get off.",
  },
  {
    title: "Trains that skip your station",
    body: "This is one of the most common mistakes for first-time visitors. You stand on the right platform, board a train going in the right direction, and still pass your station because the train type does not stop there. Check the stopping pattern on the platform screen or in your app before boarding.",
  },
  {
    title: "Transfer gates",
    body: "A transfer gate is not the same as a normal exit. At large stations, especially when moving between JR and Shinkansen or between railway companies, you may need to pass through a transfer gate that keeps you inside the paid area. If you accidentally exit the station, you may need to re-enter and possibly adjust your fare.",
  },
  {
    title: "Multiple exits",
    body: "Japanese stations can have many exits because they serve huge neighborhoods. Shinjuku has exits that feel like different towns. Tokyo Station has Marunouchi and Yaesu sides. Subway stations may use A1, A2, B3, or C exits. The exit can matter as much as the station.",
  },
  {
    title: "Shinkansen gates inside large stations",
    body: "Shinkansen gates are often inside or beside a larger JR station. At Tokyo Station, Kyoto Station, Shin-Osaka, and Ueno, do not stop after finding the station building. Continue following signs for Shinkansen, then check the correct transfer gate, ticket gate, platform, car number, and seat area.",
  },
  {
    title: "Airport trains and branching routes",
    body: "Airport trains can be confusing because one line may split, continue under another railway name, or have different services on the same tracks. Narita, Haneda, Asakusa, Oshiage, Shinagawa, Ueno, and Shinjuku can all appear in airport routes. Confirm the train name and destination before boarding.",
  },
  {
    title: "Reserved seat and non-reserved seat confusion",
    body: "On the Shinkansen and some Limited Express trains, reserved and non-reserved areas can be different cars. Your ticket may show a car number and seat, or it may allow non-reserved seating only. Before boarding, check the car number signs on the platform.",
  },
];

const faqItems = [
  {
    q: "Is it hard to use trains in Japan as a tourist?",
    a: "It is not hard if you follow the signs in order. The system is detailed, but the signs are usually consistent. Do not try to understand the whole station at once. Confirm the line, direction, train type, platform, and exit one step at a time.",
  },
  {
    q: "Should I follow Google Maps or station signs?",
    a: "Use both. Google Maps is useful for planning the route, platform, and departure time. Inside the station, match that information with the real signs because platforms, exits, and train types can still require confirmation.",
  },
  {
    q: "What is the difference between Local, Rapid and Express trains?",
    a: "Local trains usually stop at every station. Rapid and Express trains skip some stops. Limited Express trains may skip even more stops and may require an extra ticket. Always check whether the train stops at your destination.",
  },
  {
    q: "How do I know if a train stops at my station?",
    a: "Look at the stopping pattern in your transit app, the platform departure board, or the route map on the platform. If your station is not shown for that train type, wait for a Local or another service that does stop there.",
  },
  {
    q: "What should I check before boarding the Shinkansen?",
    a: "Check the train name, departure time, platform, car number, reserved or non-reserved seat area, and your seat. If you want to see Mt. Fuji on the Tokaido Shinkansen, also check the Fuji-side seat before booking.",
  },
  {
    q: "Why are there so many exits in Japanese stations?",
    a: "Large stations serve huge neighborhoods, department stores, underground malls, bus terminals, office towers, and railway companies. Exits are numbered or named so people can reach the correct side of the station without walking a long way above ground.",
  },
  {
    q: "Do I need internet to use trains in Japan?",
    a: "You can use trains without internet, but mobile data makes the first trip much easier. Maps, translation, platform updates, and exit guidance are much more comfortable when your phone works as soon as you land.",
  },
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqItems.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.a,
    },
  })),
};

const checklist = [
  "Am I on the right line?",
  "Am I going in the right direction?",
  "Does this train stop at my station?",
  "Is this the correct platform?",
  "Do I know which exit or transfer gate to follow?",
  "Do I have internet for maps and translation?",
  "If taking the Shinkansen, do I know my car number and seat?",
];

function SectionHeading({ eyebrow, title, children }: { eyebrow: string; title: string; children?: ReactNode }) {
  return (
    <div>
      <p className="text-[11px] font-black uppercase tracking-[0.12em] text-[#145aa0]">{eyebrow}</p>
      <h2 className="mt-2 text-2xl font-bold tracking-tight text-[#082653] md:text-3xl">{title}</h2>
      {children ? <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 md:text-base">{children}</p> : null}
    </div>
  );
}

export default async function JapaneseTrainSignsPage({ params }: Props) {
  const { locale } = await params;

  return (
    <main className="page-shell min-h-screen text-slate-950">
      <Script
        id="faq-schema-japanese-train-signs"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <SiteHeader />

      <Container className="py-8 md:py-12">
        <section className="overflow-hidden rounded-[28px] border border-[#d9e5f2] bg-[linear-gradient(135deg,#f8fcff,#fff_48%,#edf7ff)] shadow-[0_18px_45px_rgba(9,35,70,0.08)]">
          <div className="grid gap-0 lg:grid-cols-[1fr_320px]">
            <div className="p-6 md:p-9">
              <p className="inline-flex rounded-full border border-sky-100 bg-white px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.1em] text-[#145aa0]">
                Japan train basics
              </p>
              <h1 className="mt-4 max-w-4xl font-serif text-4xl font-bold leading-tight text-[#082653] md:text-5xl">
                How to Read Japanese Train Signs
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
                First-time visitors often search for a destination station and then follow the first sign that looks close enough. In Japan, that is not enough. The calmer way to ride trains is to check the line, direction, train type, platform, and exit in order.
              </p>
            </div>
            <div className="hidden bg-[#082653] p-7 text-white lg:flex lg:flex-col lg:justify-center">
              <p className="text-xs font-black uppercase tracking-[0.12em] text-sky-200">Mental model</p>
              <ol className="mt-4 space-y-3 text-sm font-semibold leading-6">
                <li>1. Line name</li>
                <li>2. Direction</li>
                <li>3. Train type</li>
                <li>4. Platform number</li>
                <li>5. Exit or transfer gate</li>
              </ol>
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-[22px] border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
          <p className="text-[11px] font-black uppercase tracking-[0.1em] text-emerald-700">Quick answer</p>
          <h2 className="mt-2 text-xl font-bold text-[#082653]">Do not only check the station name.</h2>
          <p className="mt-3 text-sm leading-7 text-slate-700">
            To ride trains in Japan, first check the station name, but never stop there. Confirm these five things before you board: <strong>line name</strong>, <strong>direction</strong>, <strong>train type</strong>, <strong>platform number</strong>, and <strong>exit or transfer gate</strong>. Japanese commuters do this almost automatically. Visitors usually need to slow it down and read the signs in that order.
          </p>
          <ul className="mt-4 grid gap-2 text-sm leading-6 text-slate-700 sm:grid-cols-2 lg:grid-cols-5">
            {["Line name", "Direction", "Train type", "Platform number", "Exit or transfer gate"].map((item) => (
              <li key={item} className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 font-bold shadow-sm">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                {item}
              </li>
            ))}
          </ul>
        </section>

        <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
          <article className="space-y-12">
            <section>
              <SectionHeading eyebrow="Why it happens" title="Why station names are not enough">
                A Japanese train trip is not a single question: “Which station am I going to?” It is a sequence of smaller confirmations. Large stations can contain several railway companies, multiple ticket gate areas, Shinkansen platforms, subway passages, shopping floors, bus terminals, and exits that point toward completely different neighborhoods.
              </SectionHeading>
              <div className="mt-5 space-y-5 text-sm leading-7 text-slate-700 md:text-base">
                <p>
                  Tokyo Station is a good example. It is one station name, but it includes JR conventional lines, Tokaido Shinkansen, Tohoku and Joetsu Shinkansen, Marunouchi subway access, the Yaesu side, the Marunouchi side, underground shopping streets, bus terminals, and many exits. If your hotel is near the Yaesu South Exit, arriving at the Marunouchi side is not wrong, but it can add a long walk at the worst possible time: when you have luggage and are tired from a flight.
                </p>
                <p>
                  Shinjuku Station is even more dramatic. It has JR, Odakyu, Keio, Tokyo Metro, Toei Subway, and huge underground passages. People say “meet at Shinjuku Station” as if it were one point on a map, but in practice Shinjuku is a district-sized transport machine. The same is true in a gentler way at Ueno Station, where JR Ueno, Keisei Ueno, Tokyo Metro Ueno, and the park side are related but not identical. Shin-Osaka is another case: it is both a subway station and a Shinkansen station, and the signs you follow depend on what kind of train you need next.
                </p>
                <p>
                  Kyoto Station looks simpler on a map, but it still has Shinkansen gates, JR local and limited express platforms, subway access, bus terminals, and different hotel sides. Searching only for “Kyoto Station” is useful for reaching the station area. It is not enough for finding the right platform or the correct exit.
                </p>
                <p>
                  The practical habit is to match your app instructions with real station signs. If your route says “JR Yamanote Line for Ueno,” find signs for JR first, then Yamanote Line, then the direction for Ueno. If your route says “Toei Asakusa Line Airport Express,” do not follow a Tokyo Metro sign only because the station name appears nearby. The station name is the destination. The line and direction are the path.
                </p>
              </div>
            </section>

            <section>
              <SectionHeading eyebrow="Mental model" title="The 5-step mental model">
                You do not need to understand the whole railway system. You only need a repeatable checklist for the next decision in front of you.
              </SectionHeading>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {mentalSteps.map((step) => {
                  const Icon = step.icon;
                  return (
                    <article key={step.title} className="rounded-[22px] border border-[#d9e5f2] bg-white p-5 shadow-sm">
                      <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f0fbf6] text-[#106b43]">
                          <Icon className="h-5 w-5" />
                        </span>
                        <h3 className="text-lg font-bold text-[#082653]">{step.title}</h3>
                      </div>
                      <p className="mt-3 text-sm leading-7 text-slate-600">{step.body}</p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {step.examples.map((example) => (
                          <span key={example} className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-bold text-slate-600">
                            {example}
                          </span>
                        ))}
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>

            <section>
              <SectionHeading eyebrow="Maps plus signs" title="How to use Google Maps with station signs">
                Google Maps is useful in Japan. It is especially useful for choosing a route, estimating travel time, seeing a platform number, and confirming a departure time. But inside Japanese stations, you still need to match the app with the real signs around you.
              </SectionHeading>
              <div className="mt-5 space-y-5 text-sm leading-7 text-slate-700 md:text-base">
                <p>
                  The most common mistake is trusting only the platform number. Platform numbers are helpful, but they are not a complete instruction. A platform can serve different lines, directions, or train types at different times. If your app says Platform 3, use that as a clue, then read the departure board above the platform. Confirm the line name, the direction, the train type, and the departure time. If those four things match, you can board with much more confidence.
                </p>
                <p>
                  Another important habit is to compare train type carefully. Google Maps may show “Rapid” because it is the fastest option. If you miss that Rapid train and the next train from the same platform is an Express, it may not be the same route. If you are unsure, wait a moment and check the destination display on the side of the train or the screen above the platform. You are not trying to memorize Japanese railways. You are simply matching the next sign.
                </p>
                <p>
                  Exits are also where apps and real signs need to work together. Google Maps may tell you to use an exit such as A1, Hachiko Exit, Yaesu South Exit, or Central Gate. Inside the station, signs may repeat the exit name many times, but only after you choose the correct passage. If the exit number disappears, stop and look for a general exit board. Many stations have maps near the ticket gates that show every exit and the nearby streets.
                </p>
                <p>
                  If you have already passed through the ticket gates and still feel lost in a deep underground passage, it is often completely fine to go up to street level and reset. This can be easier than trying to solve a maze of underground corridors while tired or carrying luggage. Once you are outside, you can use landmarks, street signs, and your map app again. At stations such as Shinjuku, Tokyo, Ueno, and Kyoto, going above ground may add a few minutes, but it can reduce confusion and help you understand which side of the station you are actually on.
                </p>
              </div>
              <p className="mt-5 rounded-[18px] border border-[#d9e5f2] bg-white p-4 text-sm font-semibold leading-6 text-[#082653] shadow-sm">
                Maps and translation are much easier when your phone works before the first train ride. Keep your first route,
                hotel address, and station exit saved before you arrive.
              </p>
            </section>

            <section>
              <SectionHeading eyebrow="Confusing cases" title="Common confusing cases">
                These situations confuse visitors, but they are manageable. You do not need to understand everything. Just check the next sign.
              </SectionHeading>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {confusingCases.map((item) => (
                  <article key={item.title} className="rounded-[18px] border border-slate-200 bg-white p-5 shadow-sm">
                    <h3 className="text-base font-bold text-[#082653]">{item.title}</h3>
                    <p className="mt-2 text-sm leading-7 text-slate-600">{item.body}</p>
                  </article>
                ))}
              </div>
            </section>

            <section className="rounded-[24px] border border-[#d9e5f2] bg-[linear-gradient(135deg,#f8fcff,#fff)] p-5 shadow-sm">
              <SectionHeading eyebrow="Shinkansen" title="Shinkansen-specific note">
                The Shinkansen is easier than many local stations once you understand the sequence, because long-distance trains have clear departure times, platform numbers, car numbers, and seat assignments. But it still has its own signs.
              </SectionHeading>
              <div className="mt-5 space-y-5 text-sm leading-7 text-slate-700 md:text-base">
                <p>
                  For the Shinkansen, check the <strong>train name</strong>, <strong>departure time</strong>, <strong>platform</strong>, <strong>car number</strong>, <strong>reserved seat</strong>, <strong>non-reserved seat area</strong>, and, if you are riding the Tokaido Shinkansen, the <strong>Mt. Fuji-side seat</strong>. Train names such as Nozomi, Hikari, and Kodama matter because they stop at different stations. Departure time matters because several trains can leave for similar destinations within a few minutes.
                </p>
                <p>
                  If you are buying a Tokyo to Kyoto ticket, read the <Link href="/tokyo-to-kyoto-shinkansen-ticket" className="font-bold text-[#106b43] underline underline-offset-2">Tokyo to Kyoto Shinkansen ticket guide</Link> before you book. If you are deciding whether a rail pass is worth it, compare <Link href="/jr-pass-vs-single-ticket" className="font-bold text-[#106b43] underline underline-offset-2">JR Pass vs single tickets</Link>. For seat selection, start with the <Link href="/guide" className="font-bold text-[#106b43] underline underline-offset-2">Mt. Fuji seat guide</Link>, then use the <Link href="/shinkansen-seat-guides" className="font-bold text-[#106b43] underline underline-offset-2">Shinkansen seat guide hub</Link>. If you are specifically riding west from Tokyo, the <Link href="/tokyo-to-kyoto-mt-fuji-seat" className="font-bold text-[#106b43] underline underline-offset-2">Tokyo to Kyoto Mt. Fuji seat guide</Link> explains what to watch for.
                </p>
              </div>
              <div className="mt-5 flex flex-wrap gap-3">
                <InternalCta href="/#seat-checker" label="Check your Mt. Fuji-side Shinkansen seat" placement="train_signs_shinkansen" ctaType="seat_checker" locale={locale} />
                <InternalCta href="/guide" label="Read the full Shinkansen seat guide" placement="train_signs_shinkansen" ctaType="guide" locale={locale} variant="secondary" />
              </div>
            </section>

            <section>
              <SectionHeading eyebrow="Before boarding" title="Before boarding checklist">
                Run through this checklist before you step onto the train. It takes less than a minute and prevents most mistakes.
              </SectionHeading>
              <ul className="mt-5 grid gap-3 md:grid-cols-2">
                {checklist.map((item) => (
                  <li key={item} className="flex gap-3 rounded-[16px] border border-slate-200 bg-white p-4 text-sm font-semibold leading-6 text-slate-700 shadow-sm">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#168a56]" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-4 rounded-[22px] border border-emerald-100 bg-emerald-50/70 p-5 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.1em] text-[#106b43]">
                      Practical next step
                    </p>
                    <h3 className="mt-1 text-lg font-bold text-slate-950">
                      Try Station Practice before your first ride
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      After learning how signs work, practice exits, transfer gates, platforms, and wrong-route recovery
                      in a short station navigation mission.
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col gap-2">
                    <TrackedCtaLink
                      href="/station-practice"
                      placement="train_signs_station_practice"
                      label="Start Station Practice"
                      pagePath="/how-to-read-japanese-train-signs"
                      locale={locale}
                      category="station_practice"
                      className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#168a56] bg-[#168a56] px-4 py-2.5 text-sm font-extrabold text-white shadow-sm transition-colors hover:bg-[#0f6f45]"
                    >
                      Start Station Practice
                      <ArrowRight className="h-4 w-4" />
                    </TrackedCtaLink>
                    <TrackedCtaLink
                      href="/areas-to-stay/where-to-stay-in-tokyo-with-luggage"
                      placement="train_signs_station_practice"
                      label="Choose luggage-friendly hotel base"
                      pagePath="/how-to-read-japanese-train-signs"
                      locale={locale}
                      category="stay"
                      className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#145aa0] bg-[#145aa0] px-4 py-2.5 text-sm font-extrabold text-white shadow-sm transition-colors hover:bg-[#0d477f]"
                    >
                      Choose hotel base
                      <ArrowRight className="h-4 w-4" />
                    </TrackedCtaLink>
                    <TrackedCtaLink
                      href="/airport-transfers"
                      placement="train_signs_station_practice"
                      label="Check airport transfer to hotel area"
                      pagePath="/how-to-read-japanese-train-signs"
                      locale={locale}
                      category="transfer"
                      className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#0f766e] bg-[#0f766e] px-4 py-2.5 text-sm font-extrabold text-white shadow-sm transition-colors hover:bg-[#115e59]"
                    >
                      Check airport transfer
                      <ArrowRight className="h-4 w-4" />
                    </TrackedCtaLink>
                    <div className="pt-1">
                      <EsimCta label="Get eSIM before arrival" placement="train_signs_checklist" locale={locale} variant="subtle" />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <SectionHeading eyebrow="FAQ" title="Japanese train signs FAQ" />
              <div className="mt-5 divide-y divide-slate-200 rounded-[22px] border border-slate-200 bg-white shadow-sm">
                {faqItems.map((item) => (
                  <div key={item.q} className="p-5">
                    <dt className="flex items-start gap-2 text-sm font-bold text-[#082653]">
                      <HelpCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#145aa0]" />
                      {item.q}
                    </dt>
                    <dd className="mt-2 text-sm leading-7 text-slate-600">{item.a}</dd>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-[11px] font-black uppercase tracking-[0.1em] text-[#106b43]">Suggested next steps</p>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {[
                  { href: "/#seat-checker", title: "Check Shinkansen Mt. Fuji seat", desc: "Use the free checker before booking.", type: "seat_checker" as const },
                  { href: "/jr-pass-vs-single-ticket", title: "Compare JR Pass vs single tickets", desc: "Decide whether a pass fits your route.", type: "rail" as const },
                  { href: "/areas-to-stay/where-to-stay-before-shinkansen", title: "Choose where to stay before Shinkansen", desc: "Avoid difficult transfers with luggage.", type: "stay" as const },
                  { href: "/airport-transfers", title: "Compare airport transfer", desc: "Plan the first train or bus after landing.", type: "transfer" as const },
                  { href: "/itineraries/7-day-first-time-japan", title: "Open 7-day Japan itinerary", desc: "Put trains, hotels, and sightseeing in order.", type: "itinerary" as const },
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex h-full items-center gap-3 rounded-[18px] border border-[#d9e5f2] bg-white p-4 text-sm shadow-sm transition-colors hover:border-[#168a56] hover:bg-[#f0fbf6]"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f0fbf6] text-[#106b43]">
                      <ArrowRight className="h-5 w-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-bold text-[#082653]">{item.title}</span>
                      <span className="mt-1 block text-xs leading-5 text-[#5f7190]">{item.desc}</span>
                    </span>
                  </Link>
                ))}
              </div>
            </section>

            <ShareThisPage
              title="How to Read Japanese Train Signs"
              placement="train_signs_footer"
              description="Know someone visiting Japan for the first time? Share this train sign guide with them."
              locale={locale}
            />
          </article>

          <aside className="space-y-3 lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-[11px] font-black uppercase tracking-[0.1em] text-[#145aa0]">Remember</p>
              <p className="mt-2 text-sm leading-7 text-slate-600">
                Do not solve the whole station. Solve the next sign: line, direction, train type, platform, exit.
              </p>
            </div>
            <Link href="/plan-your-trip" className="flex items-center gap-3 rounded-[18px] border border-[#d9e5f2] bg-white p-4 shadow-sm transition-colors hover:bg-[#f8fbff]">
              <Smartphone className="h-5 w-5 text-[#145aa0]" />
              <span>
                <span className="block text-sm font-bold text-[#082653]">Plan trip essentials</span>
                <span className="mt-1 block text-xs leading-5 text-[#5f7190]">eSIM, transfer, rail, and stay decisions.</span>
              </span>
            </Link>
            <Link href="/airport-transfers" className="flex items-center gap-3 rounded-[18px] border border-[#d9e5f2] bg-white p-4 shadow-sm transition-colors hover:bg-[#f8fbff]">
              <MapPinned className="h-5 w-5 text-[#145aa0]" />
              <span>
                <span className="block text-sm font-bold text-[#082653]">Airport transfer guide</span>
                <span className="mt-1 block text-xs leading-5 text-[#5f7190]">Make the first station less stressful.</span>
              </span>
            </Link>
          </aside>
        </div>

        <SiteLegalLinks className="mt-10 text-slate-500" />
      </Container>
    </main>
  );
}
