import type { Metadata } from "next";
import type { ReactNode } from "react";
import {
  AlertTriangle,
  ArrowLeftRight,
  ArrowRight,
  Compass,
  DoorOpen,
  Hotel,
  HelpCircle,
  MapPinned,
  Signpost,
  Ticket,
  Train,
  Waypoints,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { SiteHeader } from "../components/SiteHeader";
import { SiteLegalLinks } from "@/components/content/SiteLegalLinks";
import { getAlternates } from "@/i18n/hreflang";
import { ShareThisPage } from "@/components/share/ShareThisPage";
import { TrackedCtaLink } from "@/components/analytics/TrackedCtaLink";

type Props = { params: Promise<{ locale: string }> };

const PAGE_PATH = "/how-to-navigate-japanese-train-stations";
const META_TITLE =
  "How to Navigate Japanese Train Stations: Exits, Platforms, Transfers, and Signs";
const META_DESCRIPTION =
  "A calm, practical guide to navigating Japanese train stations before your trip: how to read exits, platforms, train lines, transfer gates, and fare gates, plus common mistakes in Shinjuku, Tokyo Station, Ueno, and Shibuya. Practice free with an interactive station simulator.";

/**
 * Navigation article — the search-intent entry point ("how to navigate
 * japanese train stations", "japan train station signs", "Shinjuku station
 * exits") that funnels readers into the interactive Station Practice tool.
 *
 * Role split to avoid cannibalisation:
 *   - /how-to-read-japanese-train-signs   → how to READ each sign in depth
 *   - this page                           → how to MOVE through a station
 *   - /station-practice                   → the interactive practice tool
 *
 * Authored in English and treated as English-only content (non-en routes are
 * noindex, matching the site's other English-only content pages).
 */
const NAV_FAQ: Array<{ q: string; a: string }> = [
  {
    q: "How do I navigate Japanese train stations as a tourist?",
    a: "Work in one order every time: find your train line, then the direction (the next major station shown), then the platform number, and finally the numbered exit once you arrive. Signs are colour-coded by line and almost always include English, so you rarely need to read Japanese. Following the same four steps at every station keeps even huge stations like Shinjuku manageable.",
  },
  {
    q: "Why are Japanese train stations so confusing for first-time visitors?",
    a: "Large stations such as Shinjuku, Tokyo, and Shibuya combine several rail companies, dozens of exits, and multiple underground levels, so the layout feels bigger than stations back home. The signage is actually very consistent once you know what to look for — line colours, direction names, platform numbers, and exit numbers — which is exactly what you can rehearse before your trip.",
  },
  {
    q: "How do I choose the right exit at a big station?",
    a: "Exits are numbered and named (for example 'East Exit / 東口' or exit 'A3'). Decide your exit by your destination, not the compass direction — hotels and landmarks usually publish the nearest exit number. Picking the wrong exit is the most common mistake and can add a long detour, so check the exit name before you leave the platform.",
  },
  {
    q: "How do transfers work between train lines in Japan?",
    a: "Inside a station you follow orange or colour-matched 'Transfer / のりかえ' signs to the next line, often without leaving the paid area. Between separate companies (for example JR and a private subway) you may pass through a transfer gate — tap your IC card through and follow the signs to the new platform. Allow extra minutes for transfers in large stations.",
  },
  {
    q: "What is the best way to practice before visiting Japan?",
    a: "Rehearse the decisions, not just the vocabulary. A free interactive station simulator lets you read realistic Japanese-first signage, choose exits, follow transfer gates, and recover from wrong turns in a low-stress setting, so the real station feels familiar on arrival.",
  },
];

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: `${META_TITLE} | fujiseat`,
    description: META_DESCRIPTION,
    robots: locale === "en" ? undefined : { index: false, follow: true },
    openGraph: { title: META_TITLE, description: META_DESCRIPTION, siteName: "fujiseat — Japan Rail Seats, Stays & Routes" },
    alternates: getAlternates(PAGE_PATH, locale),
  };
}

export default async function NavigateJapaneseStationsPage({ params }: Props) {
  const { locale } = await params;

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    inLanguage: "en",
    mainEntity: NAV_FAQ.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  return (
    <main className="page-shell min-h-screen text-slate-950">
      {locale === "en" && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
      <SiteHeader />

      <Container className="py-8 md:py-12">
        {/* Hero — meaningful copy is in the initial HTML, no JS needed. */}
        <section className="overflow-hidden rounded-[28px] border border-[#d9e5f2] bg-[linear-gradient(135deg,#f8fcff,#fff_48%,#edf7ff)] p-6 shadow-[0_18px_45px_rgba(9,35,70,0.08)] md:p-9">
          <p className="inline-flex rounded-full border border-sky-100 bg-white px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.1em] text-[#145aa0]">
            Japan station navigation
          </p>
          <h1 className="mt-4 max-w-3xl font-serif text-3xl font-bold leading-tight text-[#082653] md:text-4xl">
            How to Navigate Japanese Train Stations Before Your Trip
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
            Big Japanese stations look overwhelming at first — several rail
            companies, dozens of numbered exits, and platforms spread across
            underground levels. The good news: the signage is remarkably
            consistent, and you can learn the whole system before you land. This
            guide walks through the five signs that matter, how to choose the
            right exit, how to read platform and direction signs, and how
            transfers work in stations like Shinjuku, Tokyo Station, Ueno, and
            Shibuya. Then you can rehearse it all — reading signs, choosing
            exits, and following transfers — in a free interactive station
            simulator, so your first real station feels familiar instead of
            stressful.
          </p>
          {/* Top CTA — small, sits directly under the intro. */}
          <div className="mt-6">
            <TrackedCtaLink
              href="/station-practice"
              placement="navigate_hero"
              label="Practice reading station signs"
              pagePath={PAGE_PATH}
              locale={locale}
              category="station_practice"
              ctaType="station_practice"
              className="inline-flex items-center gap-2 rounded-2xl border border-[#2E7D5B] bg-[#2E7D5B] px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#246449]"
            >
              Practice reading station signs
              <ArrowRight className="h-4 w-4" />
            </TrackedCtaLink>
          </div>
        </section>

        <div className="mx-auto mt-10 max-w-3xl space-y-10 text-[15px] leading-7 text-slate-700">
          {/* 1 — Why stations feel confusing */}
          <ArticleSection
            icon={HelpCircle}
            title="Why Japanese train stations feel confusing for first-time visitors"
          >
            <p>
              Stations like Shinjuku (the busiest in the world) or Tokyo Station
              are really several stations stacked together: JR lines, private
              railways, and subways, each with their own gates and platforms.
              That means more exits, more corridors, and more underground levels
              than most visitors are used to. On top of that, the first thing you
              see is often a wall of Japanese place names.
            </p>
            <p className="mt-3">
              Here is the reassuring part: the <strong>signage follows the same
              rules everywhere in Japan</strong>. Every line has a colour and a
              letter, directions are shown by the next big station, platforms are
              numbered, and exits are numbered and named — usually with English
              underneath. Once you can spot those four or five elements, a giant
              station becomes a series of small, calm decisions instead of one
              overwhelming maze.
            </p>
          </ArticleSection>

          {/* 2 — The 5 signs */}
          <ArticleSection icon={Signpost} title="The 5 signs you should understand first">
            <p>
              Almost all station navigation comes down to reading five things.
              Learn to recognise these and you can find your way through any
              station in Japan.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <SignCard icon={DoorOpen} title="Exits (出口)">
                Numbered and named (East Exit / 東口, or A3). You choose an exit
                by your destination, not by compass direction.
              </SignCard>
              <SignCard icon={Waypoints} title="Platforms (のりば)">
                Each platform has a number. Signs tell you which platform your
                train departs from and which cars stop where.
              </SignCard>
              <SignCard icon={Train} title="Train lines (路線)">
                Every line has a colour and a letter (for example JY for the
                Yamanote Line). Follow the matching colour through the station.
              </SignCard>
              <SignCard icon={ArrowLeftRight} title="Transfer gates (のりかえ)">
                Orange or colour-matched signs lead you to a connecting line,
                sometimes through a gate between companies.
              </SignCard>
              <SignCard icon={Ticket} title="Fare gates (改札)">
                The ticket gates where you tap your IC card in and out. Look for
                改札 / Gate signs to enter or leave the paid area.
              </SignCard>
            </div>
            <p className="mt-5 rounded-2xl border border-[#d9e5f2] bg-white p-4 text-sm font-semibold leading-6 text-[#082653] shadow-sm">
              Want the deeper version of reading each sign? See our full guide to{" "}
              <Link href="/how-to-read-japanese-train-signs" className="text-[#145aa0] underline underline-offset-2">
                how to read Japanese train signs
              </Link>
              .
            </p>
          </ArticleSection>

          {/* Mid CTA — card style */}
          <TrackedCtaLink
            href="/station-practice"
            placement="navigate_mid_card"
            label="Try the interactive station simulator"
            pagePath={PAGE_PATH}
            locale={locale}
            category="station_practice"
            ctaType="station_practice"
            className="group flex flex-col gap-4 rounded-[22px] border border-[#d9e5f2] bg-[linear-gradient(135deg,#f8fcff,#fff)] p-6 shadow-sm transition-colors hover:border-[#2E7D5B] sm:flex-row sm:items-center sm:justify-between"
          >
            <span className="block">
              <span className="block text-[11px] font-black uppercase tracking-[0.1em] text-[#145aa0]">
                Practice tool
              </span>
              <span className="mt-1 block text-lg font-bold text-[#082653]">
                Try the interactive station simulator
              </span>
              <span className="mt-1 block text-sm leading-6 text-slate-600">
                Read realistic Japanese-first signs, choose exits, and follow
                transfer gates — free, in your browser.
              </span>
            </span>
            <span className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#2E7D5B] px-5 py-3 text-sm font-semibold text-white transition-colors group-hover:bg-[#246449]">
              Open Station Practice
              <ArrowRight className="h-4 w-4" />
            </span>
          </TrackedCtaLink>

          {/* 3 — Choosing the right exit */}
          <ArticleSection icon={DoorOpen} title="How to choose the right exit">
            <p>
              Choosing the exit is where most visitors lose time. In a big
              station the wrong exit can leave you a 10-minute walk (and one more
              gate) from where you meant to be.
            </p>
            <ul className="mt-3 list-disc space-y-1.5 pl-5">
              <li>
                <strong>Decide by destination, not direction.</strong> Hotels,
                museums, and shops almost always publish their nearest exit — for
                example &ldquo;3 minutes from West Exit&rdquo; or &ldquo;Exit
                A3&rdquo;. Note that exit before you arrive.
              </li>
              <li>
                <strong>Read the exit name early.</strong> Exit signs appear on
                the platform and again before the gates. Follow the number, not
                just &ldquo;Exit&rdquo;.
              </li>
              <li>
                <strong>Stay inside the gates until you are sure.</strong> Once
                you tap out at the wrong gate, getting to the right exit can mean
                walking around the outside of the station.
              </li>
            </ul>
          </ArticleSection>

          {/* 4 — Platform and direction signs */}
          <ArticleSection icon={Compass} title="How to read platform and direction signs">
            <p>
              Direction in Japan is shown by <strong>the next major station on
              the line</strong>, not by &ldquo;northbound&rdquo; or
              &ldquo;southbound&rdquo;. On the Yamanote loop, for instance, you
              choose between platforms labelled &ldquo;for Shinjuku &amp;
              Ikebukuro&rdquo; or &ldquo;for Tokyo &amp; Shinagawa&rdquo;.
            </p>
            <ul className="mt-3 list-disc space-y-1.5 pl-5">
              <li>Match your <strong>line colour and letter</strong> first, then the platform number.</li>
              <li>Check the <strong>direction (next big station)</strong> so you board the correct side.</li>
              <li>Confirm the <strong>train type</strong> (Local, Rapid, Express) — some skip the stop you want.</li>
            </ul>
            <p className="mt-3">
              Train types trip up a lot of first-timers. For a fuller breakdown
              of local vs rapid vs express and how to avoid boarding a train that
              skips your stop, our{" "}
              <Link href="/how-to-read-japanese-train-signs" className="font-semibold text-[#145aa0] underline underline-offset-2">
                station signs guide
              </Link>{" "}
              goes deeper.
            </p>
          </ArticleSection>

          {/* 5 — Transfers */}
          <ArticleSection icon={ArrowLeftRight} title="How transfers work in large stations">
            <p>
              A transfer just means following signs from one line to another
              inside (or between) stations. In practice:
            </p>
            <ul className="mt-3 list-disc space-y-1.5 pl-5">
              <li>
                <strong>Same company:</strong> follow the orange or colour-matched
                <span> </span>&ldquo;Transfer / のりかえ&rdquo; signs — you usually
                stay inside the paid area.
              </li>
              <li>
                <strong>Different companies</strong> (e.g. JR to a private
                subway): you may pass through a <strong>transfer gate</strong> —
                tap your IC card through and keep following the coloured signs.
              </li>
              <li>
                <strong>Give yourself time.</strong> A transfer in Shinjuku or
                Tokyo Station can be a 5–10 minute walk, so don&rsquo;t plan
                tight connections on your first days.
              </li>
            </ul>
            <p className="mt-3">
              A prepaid <Link href="/how-to-buy-suica" className="font-semibold text-[#145aa0] underline underline-offset-2">Suica IC card</Link>{" "}
              makes transfers painless — you tap through every gate without buying
              a new ticket.
            </p>
          </ArticleSection>

          {/* 6 — Common mistakes */}
          <ArticleSection
            icon={AlertTriangle}
            title="Common mistakes in Shinjuku, Tokyo Station, Ueno, and Shibuya"
          >
            <div className="space-y-3">
              <MistakeRow station="Shinjuku">
                With 200+ exits, leaving by the wrong one is the classic error.
                Note your exit name (e.g. New South Gate) before you move, and
                stay inside until you find it.
              </MistakeRow>
              <MistakeRow station="Tokyo Station">
                Two very different sides — Marunouchi and Yaesu — plus the
                Shinkansen gates. Confirm which side (and whether you need the
                Shinkansen transfer gate) before choosing an exit.
              </MistakeRow>
              <MistakeRow station="Ueno">
                JR Ueno and Keisei Ueno are separate stations a short walk apart.
                Check which one your train or airport service uses so you
                don&rsquo;t arrive at the wrong building.
              </MistakeRow>
              <MistakeRow station="Shibuya">
                Multiple underground levels and a recent redesign mean lots of
                stairs and connecting passages. Follow your line colour patiently
                rather than guessing toward the Hachiko exit.
              </MistakeRow>
            </div>
          </ArticleSection>

          {/* 7 — Practice with Station Practice (the funnel) */}
          <ArticleSection icon={MapPinned} title="Practice before your trip with Station Practice">
            <p>
              Reading about signs helps, but the confidence comes from{" "}
              <strong>making the decisions yourself</strong>. Station Practice is
              a free, browser-based tool that recreates the feel of a complex
              Tokyo-style station — Japanese-first signage with English support —
              and asks you to find exits, follow transfer gates, and read
              platform signs. Take a wrong turn and it explains why, then returns
              you to the decision so you can try again. It is a practice tool for
              learning to read and move, not a live map of any real station.
            </p>
            <div className="mt-5 rounded-[22px] border border-[#d9e5f2] bg-[linear-gradient(135deg,#f8fcff,#fff)] p-6 shadow-sm">
              <p className="text-lg font-bold text-[#082653]">
                Learn exits, platforms, and transfers before you arrive
              </p>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                Short guided missions plus a free-walk mode through a full
                7-floor station, available in nine languages.
              </p>
              <div className="mt-4">
                <TrackedCtaLink
                  href="/station-practice"
                  placement="navigate_section_practice"
                  label="Try the interactive station simulator"
                  pagePath={PAGE_PATH}
                  locale={locale}
                  category="station_practice"
                  ctaType="station_practice"
                  className="inline-flex items-center gap-2 rounded-2xl border border-[#2E7D5B] bg-[#2E7D5B] px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#246449]"
                >
                  Try the interactive station simulator
                  <ArrowRight className="h-4 w-4" />
                </TrackedCtaLink>
              </div>
            </div>
          </ArticleSection>

          {/* 8 — Related stay-area advice */}
          <ArticleSection icon={Hotel} title="Related Tokyo stay-area advice">
            <p>
              Where you stay decides how often you deal with big stations. A hotel
              near a well-connected, easier station makes your first days far
              smoother — especially with luggage.
            </p>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              <RelatedLink href="/areas-to-stay/tokyo-first-time">
                Where to stay in Tokyo for first-timers
              </RelatedLink>
              <RelatedLink href="/areas-to-stay/where-to-stay-before-shinkansen">
                Where to stay before a Shinkansen trip
              </RelatedLink>
              <RelatedLink href="/areas-to-stay/tokyo/shinjuku">
                Staying near Shinjuku Station
              </RelatedLink>
              <RelatedLink href="/areas-to-stay/tokyo/tokyo-station">
                Staying near Tokyo Station
              </RelatedLink>
              <RelatedLink href="/areas-to-stay/tokyo/ueno">
                Staying near Ueno Station
              </RelatedLink>
              <RelatedLink href="/areas-to-stay/tokyo/asakusa">
                Staying in Asakusa
              </RelatedLink>
              <RelatedLink href="/areas-to-stay/tokyo-hotels">
                Compare all Tokyo hotel areas
              </RelatedLink>
              <RelatedLink href="/how-to-buy-suica">
                How to buy a Suica IC card
              </RelatedLink>
            </ul>
          </ArticleSection>

          {/* FAQ */}
          <ArticleSection icon={HelpCircle} title="Frequently asked questions">
            <dl className="space-y-4">
              {NAV_FAQ.map((item) => (
                <div key={item.q} className="border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                  <dt className="font-semibold text-slate-900">{item.q}</dt>
                  <dd className="mt-1 text-slate-600">{item.a}</dd>
                </div>
              ))}
            </dl>
          </ArticleSection>

          {/* Bottom CTA — large */}
          <section className="rounded-[24px] border border-[#0f2f5c] bg-[linear-gradient(135deg,#0d2447,#082653)] p-8 text-white shadow-[0_18px_45px_rgba(9,35,70,0.18)]">
            <h2 className="text-2xl font-bold">Ready to feel confident at the station?</h2>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-sky-100">
              Rehearse the exits, platforms, and transfers before you fly. A few
              minutes in the simulator makes Shinjuku, Tokyo Station, and the rest
              feel familiar on day one.
            </p>
            <div className="mt-5">
              <TrackedCtaLink
                href="/station-practice"
                placement="navigate_footer"
                label="Learn exits, platforms, and transfers before you arrive"
                pagePath={PAGE_PATH}
                locale={locale}
                category="station_practice"
                ctaType="station_practice"
                className="inline-flex items-center gap-2 rounded-2xl bg-yellow-300 px-6 py-3.5 text-sm font-extrabold text-[#082653] shadow-sm transition-colors hover:bg-yellow-200"
              >
                Learn exits, platforms, and transfers before you arrive
                <ArrowRight className="h-4 w-4" />
              </TrackedCtaLink>
            </div>
          </section>

          <ShareThisPage
            title="How to Navigate Japanese Train Stations"
            placement="navigate_footer_share"
            description="Heading to Japan? Share this practical guide to reading exits, platforms, and transfers — plus a free station simulator to practice before the trip."
            locale={locale}
          />
        </div>

        <SiteLegalLinks className="mt-10 text-slate-500" />
      </Container>
    </main>
  );
}

function ArticleSection({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof Signpost;
  title: string;
  children: ReactNode;
}) {
  return (
    <section>
      <h2 className="flex items-center gap-3 text-xl font-bold text-[#082653] md:text-2xl">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f0fbf6] text-[#106b43]">
          <Icon className="h-5 w-5" />
        </span>
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function SignCard({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof Signpost;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-[18px] border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#eef6ff] text-[#145aa0]">
          <Icon className="h-4 w-4" />
        </span>
        <h3 className="text-sm font-bold text-[#082653]">{title}</h3>
      </div>
      <p className="mt-2 text-sm leading-6 text-slate-600">{children}</p>
    </div>
  );
}

function MistakeRow({ station, children }: { station: string; children: ReactNode }) {
  return (
    <div className="rounded-[16px] border border-amber-200 bg-amber-50/60 p-4">
      <p className="text-sm font-bold text-[#7c4a03]">{station}</p>
      <p className="mt-1 text-sm leading-6 text-slate-700">{children}</p>
    </div>
  );
}

function RelatedLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <li>
      <Link
        href={href}
        className="flex items-center gap-2 rounded-[14px] border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-[#082653] shadow-sm transition-colors hover:border-[#2E7D5B] hover:bg-[#f0fbf6]"
      >
        <ArrowRight className="h-4 w-4 shrink-0 text-[#106b43]" />
        {children}
      </Link>
    </li>
  );
}
