import type { Metadata } from "next";
import Image from "next/image";
import {
  ArrowRight,
  Compass,
  Hotel,
  MapPinned,
  Plane,
  ShieldCheck,
  Signpost,
  Wifi,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { branchingMissions } from "@/data/station-practice/branching/missions";
import { FaqAccordion } from "@/components/station-practice/landing/FaqAccordion";

export const metadata: Metadata = {
  title: "Station Practice — Japanese station navigation simulator",
  description:
    "Practice Japanese station navigation before your trip. Learn exits, transfer gates, platforms, and Japanese-first station signs with short guided missions.",
  robots: { index: false, follow: false },
};

const missionCards = [
  {
    id: "mission-1",
    title: "High-Speed Rail → West Central Gate",
    description:
      "Practice finding the correct station side, ticket gate, and exit number.",
    status: "Playable",
    cta: "Start Mission 1",
    href: "/station-practice/branching",
  },
  {
    id: "mission-2",
    title: branchingMissions[1].title,
    description:
      "Practice following subway transfer signs, line colors, and transfer gates.",
    status: "Playable",
    cta: "Start Mission 2",
    href: "/station-practice/branching?mission=2",
  },
  {
    id: "mission-3",
    title: "Airport Train → Hotel Area Exit",
    description:
      "Practice your first station arrival route after landing in Japan.",
    status: "Coming Soon",
    cta: "Coming Soon",
    href: null,
  },
] as const;

const supportCtas = [
  {
    title: "Compare hotels near convenient stations",
    body: "Placeholder guide link for choosing practical hotel areas later.",
    href: "/areas-to-stay/tokyo-first-time",
    icon: Hotel,
  },
  {
    title: "Prepare airport transfer",
    body: "Placeholder guide link for planning airport-to-hotel movement.",
    href: "/airport-transfers",
    icon: Plane,
  },
  {
    title: "Get eSIM / Wi-Fi before arrival",
    body: "Placeholder guide link for maps and translation readiness.",
    href: "/plan-your-trip",
    icon: Wifi,
  },
] as const;

export default function StationPracticeLandingPage() {
  return (
    <>
      <header className="absolute left-0 right-0 top-0 z-20 px-6 py-5 sm:px-10">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link href="/station-practice" className="flex items-center gap-2">
            <span className="inline-block h-2.5 w-6 rounded-sm bg-yellow-300" />
            <span className="text-sm font-semibold tracking-wide text-white">
              Tokyo Mega Station Practice
            </span>
          </Link>
          <nav className="hidden items-center gap-8 text-sm text-neutral-300 sm:flex">
            <a href="#missions" className="hover:text-white">
              Missions
            </a>
            <a href="#how-it-works" className="hover:text-white">
              How it works
            </a>
            <a href="#faq" className="hover:text-white">
              FAQ
            </a>
          </nav>
          <Link
            href="/station-practice/branching"
            className="hidden items-center gap-1.5 rounded-full bg-yellow-300 px-4 py-2 text-xs font-semibold text-black transition-colors hover:bg-yellow-200 sm:inline-flex"
          >
            Start Mission 1 <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </header>

      <main className="flex flex-1 flex-col">
        <section className="relative isolate flex min-h-[88vh] items-end overflow-hidden">
          <Image
            src="/images/station-practice/hero-station-bg.png"
            alt="A Japanese underground station corridor with overhead yellow signage"
            fill
            priority
            sizes="100vw"
            className="-z-10 object-cover"
          />
          <div
            aria-hidden
            className="absolute inset-0 -z-10 bg-gradient-to-r from-[#070a13]/95 via-[#070a13]/70 to-transparent"
          />
          <div
            aria-hidden
            className="absolute inset-x-0 bottom-0 -z-10 h-1/2 bg-gradient-to-t from-[#070a13] to-transparent"
          />

          <div className="mx-auto w-full max-w-7xl px-6 pb-20 pt-32 sm:px-10 sm:pb-28 sm:pt-40">
            <span className="inline-flex items-center gap-2 rounded-full border border-yellow-400/30 bg-yellow-400/5 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-yellow-300">
              <Signpost className="h-3.5 w-3.5" />
              Pre-travel simulation
            </span>
            <h1 className="mt-6 max-w-3xl text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl lg:text-[3.5rem]">
              Practice Japanese stations
              <span className="block text-yellow-300">
                before your trip.
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-neutral-300 sm:text-lg">
              A free navigation practice tool inspired by complex Tokyo-style
              stations. Learn how to read exits, transfers, gates, and platform
              signs before arriving in Japan.
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/station-practice/branching"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-yellow-300 px-7 text-sm font-semibold text-black transition-colors hover:bg-yellow-200"
              >
                Start Mission 1
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#missions"
                className="inline-flex h-12 items-center justify-center rounded-full border border-white/15 px-7 text-sm font-semibold text-white/90 transition-colors hover:bg-white/5"
              >
                See the missions
              </a>
            </div>
          </div>
        </section>

        <section className="border-t border-white/5 bg-[#080b14] px-6 py-14 sm:px-10">
          <div className="mx-auto max-w-7xl">
            <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              Why this helps
            </h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Feature
              icon={<MapPinned className="h-5 w-5" />}
              title="Read station signs"
              body="Read Japanese-first station signs with English support."
            />
            <Feature
              icon={<Signpost className="h-5 w-5" />}
              title="Tell routes apart"
              body="Tell exits, transfer gates, and platforms apart."
            />
            <Feature
              icon={<Compass className="h-5 w-5" />}
              title="Recover calmly"
              body="Learn what to do when you follow the wrong route."
            />
            <Feature
              icon={<ShieldCheck className="h-5 w-5" />}
              title="Practice first"
              body="Practice before your real trip."
            />
            </div>
          </div>
        </section>

        <section id="missions" className="px-6 py-20 sm:px-10">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                  Station Practice missions
                </h2>
                <p className="mt-2 max-w-xl text-sm leading-6 text-neutral-400">
                  Mission 1 and Mission 2 are playable through the branching
                  route. Mission 3 is staged as a future arrival scenario.
                </p>
              </div>
              <Link
                href="/station-practice/branching"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-yellow-300 hover:text-yellow-200"
              >
                Start Mission 1 <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <ul className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {missionCards.map((mission, idx) => (
                <li key={mission.id}>
                  <MissionCard mission={mission} index={idx} />
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="border-t border-white/5 bg-[#080b14] px-6 py-16 sm:px-10">
          <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_1.2fr] lg:items-start">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                Free tool, supported by travel planning links
              </h2>
              <p className="mt-3 text-sm leading-6 text-neutral-400">
                This tool is free to use. Some links on fujiseat may be
                affiliate links, which means we may earn a small commission if
                you book through them, at no extra cost to you. Your support
                helps us keep building free Japan travel tools.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {supportCtas.map((cta) => {
                const Icon = cta.icon;
                return (
                  <Link
                    key={cta.title}
                    href={cta.href}
                    className="group rounded-2xl border border-white/5 bg-white/[0.02] p-5 transition-colors hover:border-yellow-300/35 hover:bg-white/[0.04]"
                  >
                    <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-yellow-300/10 text-yellow-300">
                      <Icon className="h-4 w-4" />
                    </div>
                    <h3 className="mt-4 text-sm font-semibold text-white">
                      {cta.title}
                    </h3>
                    <p className="mt-2 text-xs leading-5 text-neutral-400">
                      {cta.body}
                    </p>
                    <span className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-yellow-300/80 group-hover:text-yellow-200">
                      Open guide <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        <section
          id="how-it-works"
          className="border-t border-white/5 bg-[#080b14] px-6 py-20 sm:px-10"
        >
          <div className="mx-auto max-w-7xl">
            <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              How it works
            </h2>
            <ol className="mt-10 grid gap-6 sm:grid-cols-3">
              <Step
                step="01"
                title="Choose a mission"
                body="Pick a realistic scenario such as finding an exit or transferring to a subway line."
              />
              <Step
                step="02"
                title="Read the signs"
                body="Use Japanese-first signs, English helper labels, route colors, and gate names to choose your next move."
              />
              <Step
                step="03"
                title="Recover from detours"
                body="Wrong routes teach why the path is wrong, then return you to the decision point so you can continue."
              />
            </ol>
          </div>
        </section>

        <section id="faq" className="px-6 py-20 sm:px-10">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              FAQ
            </h2>
            <p className="mt-2 text-sm leading-6 text-neutral-400">
              Quick answers about what this is and how it works.
            </p>
            <div className="mt-8">
              <FaqAccordion />
            </div>
          </div>
        </section>

        <section className="border-t border-white/5 bg-gradient-to-br from-[#0d1322] to-[#070a13] px-6 py-20 sm:px-10">
          <div className="mx-auto flex max-w-5xl flex-col items-start gap-8 rounded-3xl border border-white/5 bg-white/[0.02] p-10 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                Practice the first two routes.
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-neutral-400">
                Mission 1 covers station exits. Mission 2 covers subway
                transfers. More arrival scenarios can be added later.
              </p>
            </div>
            <Link
              href="/station-practice/branching"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-yellow-300 px-7 text-sm font-semibold text-black transition-colors hover:bg-yellow-200"
            >
              Start Mission 1 <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        <footer className="border-t border-white/5 bg-[#070a13] px-6 py-8 text-xs text-neutral-500 sm:px-10">
          <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
            <span>
              This is a practice simulator, not an official station map.
              Inspired by complex Tokyo-style stations. Layouts and signage
              are original.
            </span>
            <span>
              Station navigation practice &middot; free travel-prep simulator
            </span>
          </div>
        </footer>
      </main>
    </>
  );
}

function MissionCard({
  mission,
  index,
}: {
  mission: (typeof missionCards)[number];
  index: number;
}) {
  const content = (
    <>
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-yellow-300/0 via-yellow-300 to-yellow-300/0"
      />
      <div className="flex items-center justify-between text-xs uppercase tracking-[0.18em] text-neutral-500">
        <span>Mission {String(index + 1).padStart(2, "0")}</span>
        <span className={mission.href ? "text-yellow-300" : "text-neutral-400"}>
          {mission.status}
        </span>
      </div>
      <h3 className="mt-4 text-lg font-semibold text-white">{mission.title}</h3>
      <p className="mt-2 line-clamp-3 text-sm leading-6 text-neutral-400">
        {mission.description}
      </p>
      <div className="mt-6 flex items-center justify-between text-xs text-neutral-500">
        <span>{mission.href ? "Branching route" : "Future route"}</span>
        {mission.href ? (
          <span className="inline-flex items-center gap-1 text-yellow-300/80 transition-colors group-hover:text-yellow-200">
            {mission.cta} <ArrowRight className="h-3.5 w-3.5" />
          </span>
        ) : (
          <span className="rounded-full border border-white/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-400">
            {mission.cta}
          </span>
        )}
      </div>
    </>
  );

  if (mission.href) {
    return (
      <Link
        href={mission.href}
        className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-br from-[#0d1322] to-[#070a13] p-6 transition-colors hover:border-yellow-300/40"
      >
        {content}
      </Link>
    );
  }

  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-br from-[#0d1322]/80 to-[#070a13] p-6 opacity-80">
      {content}
    </div>
  );
}

function Feature({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
      <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-yellow-300/10 text-yellow-300">
        {icon}
      </div>
      <div className="mt-4 text-sm font-semibold text-white">{title}</div>
      <p className="mt-2 text-sm leading-6 text-neutral-400">{body}</p>
    </div>
  );
}

function Step({
  step,
  title,
  body,
}: {
  step: string;
  title: string;
  body: string;
}) {
  return (
    <li className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
      <div className="text-xs font-semibold uppercase tracking-[0.2em] text-yellow-300">
        Step {step}
      </div>
      <div className="mt-3 text-lg font-medium text-white">{title}</div>
      <p className="mt-2 text-sm leading-6 text-neutral-400">{body}</p>
    </li>
  );
}
