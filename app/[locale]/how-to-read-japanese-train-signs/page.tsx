import type { Metadata } from "next";
import type { ReactNode } from "react";
import Script from "next/script";
import { getTranslations } from "next-intl/server";
import { ArrowRight, CheckCircle2, DoorOpen, HelpCircle, MapPinned, Route, Signpost, Smartphone, Train, Waypoints } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { SiteHeader } from "../components/SiteHeader";
import { SiteLegalLinks } from "@/components/content/SiteLegalLinks";
import { getAlternates } from "@/i18n/hreflang";
import { EsimCta, InternalCta } from "./TrainSignsCtas";
import { ShareThisPage } from "@/components/share/ShareThisPage";
import { TrackedCtaLink } from "@/components/analytics/TrackedCtaLink";
import { AdSlot } from "@/components/ads/AdSlot";
import { buttonClassName } from "@/components/ui/Button";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "trainSigns" });
  const title = t("meta.title");
  const description = t("meta.description");
  return {
    title: `${title} | fujiseat`,
    description,
    robots: locale === "en" ? undefined : { index: false, follow: true },
    openGraph: { title, description, siteName: "fujiseat" },
    alternates: getAlternates("/how-to-read-japanese-train-signs", locale),
  };
}

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
  const t = await getTranslations({ locale, namespace: "trainSigns" });

  // Build the 5-step mental model from translation keys.
  const mentalSteps = [
    { key: "line", icon: Route },
    { key: "direction", icon: Signpost },
    { key: "type", icon: Train },
    { key: "platform", icon: Waypoints },
    { key: "exit", icon: DoorOpen },
  ] as const;

  // 8 confusing-case cards.
  const confusingCases = [
    "sameName",
    "types",
    "skip",
    "transfer",
    "exits",
    "shinkansenGate",
    "airport",
    "reserved",
  ] as const;

  // 7-item checklist.
  const checklist = [
    "line",
    "direction",
    "stops",
    "platform",
    "exit",
    "internet",
    "shinkansen",
  ] as const;

  // 7 FAQ entries (for both the visual list and the FAQPage schema).
  const faqKeys = ["hard", "maps", "types", "stops", "shinkansen", "exits", "internet"] as const;
  const faqItems = faqKeys.map((key) => ({
    q: t(`faq.items.${key}.q`),
    a: t(`faq.items.${key}.a`),
  }));
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  // Five generic next-step cards. The Suica simulator used to be the
  // sixth card here, but it is an interactive tool launch (not just
  // another article link), so it has been promoted to a dedicated
  // primaryTool CTA block rendered above this grid — see the
  // <section> with the navy "Open the Suica purchase simulator"
  // button just before Suggested next steps.
  const suggestedCards = [
    { href: "/#seat-checker", key: "seat", type: "seat_checker" as const },
    { href: "/jr-pass-vs-single-ticket", key: "jrPass", type: "rail" as const },
    { href: "/areas-to-stay/where-to-stay-before-shinkansen", key: "beforeShinkansen", type: "stay" as const },
    { href: "/airport-transfers", key: "airport", type: "transfer" as const },
    { href: "/itineraries/7-day-first-time-japan", key: "itinerary", type: "itinerary" as const },
  ];

  // The Suica simulator promotion uses the dedicated suicaGuide
  // namespace, which is already translated across every locale.
  const tSuica = await getTranslations({ locale, namespace: "suicaGuide" });

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
                {t("hero.pillLabel")}
              </p>
              <h1 className="mt-4 max-w-4xl font-serif text-4xl font-bold leading-tight text-[#082653] md:text-5xl">
                {t("hero.title")}
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
                {t("hero.body")}
              </p>
            </div>
            <div className="hidden bg-[#082653] p-7 text-white lg:flex lg:flex-col lg:justify-center">
              <p className="text-xs font-black uppercase tracking-[0.12em] text-sky-200">{t("hero.mentalEyebrow")}</p>
              <ol className="mt-4 space-y-3 text-sm font-semibold leading-6">
                <li>{t("hero.mentalSteps.line")}</li>
                <li>{t("hero.mentalSteps.direction")}</li>
                <li>{t("hero.mentalSteps.type")}</li>
                <li>{t("hero.mentalSteps.platform")}</li>
                <li>{t("hero.mentalSteps.exit")}</li>
              </ol>
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-[22px] border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
          <p className="text-[11px] font-black uppercase tracking-[0.1em] text-emerald-700">{t("quick.eyebrow")}</p>
          <h2 className="mt-2 text-xl font-bold text-[#082653]">{t("quick.title")}</h2>
          <p className="mt-3 text-sm leading-7 text-slate-700">
            {t.rich("quick.bodyRich", {
              s1: (chunks) => <strong>{chunks}</strong>,
              s2: (chunks) => <strong>{chunks}</strong>,
              s3: (chunks) => <strong>{chunks}</strong>,
              s4: (chunks) => <strong>{chunks}</strong>,
              s5: (chunks) => <strong>{chunks}</strong>,
            })}
          </p>
          <ul className="mt-4 grid gap-2 text-sm leading-6 text-slate-700 sm:grid-cols-2 lg:grid-cols-5">
            {(["lineName", "direction", "type", "platform", "exit"] as const).map((key) => (
              <li key={key} className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 font-bold shadow-sm">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                {t(`quick.list.${key}`)}
              </li>
            ))}
          </ul>
        </section>

        {/*
          Early interlink + practice CTA. Reading the signs is one half; moving
          through a station is the other. We link across to the navigation guide
          (different search intent, no cannibalisation) and offer an immediate
          Station Practice launch near the top of the page.
        */}
        <section className="mt-6 flex flex-col gap-3 rounded-[22px] border border-[#d9e5f2] bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm leading-6 text-slate-600">
            Want the bigger picture — exits, platforms, and transfers end to end?
            Read{" "}
            <Link
              href="/how-to-navigate-japanese-train-stations"
              className="font-bold text-[#145aa0] underline underline-offset-2"
            >
              how to navigate Japanese train stations
            </Link>
            , or practice reading the signs right now.
          </p>
          <TrackedCtaLink
            href="/station-practice"
            placement="train_signs_quickanswer"
            label="Practice reading station signs"
            pagePath="/how-to-read-japanese-train-signs"
            locale={locale}
            category="station_practice"
            ctaType="station_practice"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-[#2E7D5B] bg-[#2E7D5B] px-4 py-2.5 text-sm font-extrabold text-white shadow-sm transition-colors hover:bg-[#246449]"
          >
            Practice reading station signs
            <ArrowRight className="h-4 w-4" />
          </TrackedCtaLink>
        </section>

        <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
          <article className="space-y-12">
            <section>
              <SectionHeading eyebrow={t("why.eyebrow")} title={t("why.title")}>
                {t("why.intro")}
              </SectionHeading>
              <div className="mt-5 space-y-5 text-sm leading-7 text-slate-700 md:text-base">
                <p>{t("why.p1")}</p>
                <p>{t("why.p2")}</p>
                <p>{t("why.p3")}</p>
                <p>{t("why.p4")}</p>
              </div>
            </section>

            <section>
              <SectionHeading eyebrow={t("mental.eyebrow")} title={t("mental.title")}>
                {t("mental.intro")}
              </SectionHeading>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {mentalSteps.map((step) => {
                  const Icon = step.icon;
                  return (
                    <article key={step.key} className="rounded-[22px] border border-[#d9e5f2] bg-white p-5 shadow-sm">
                      <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f0fbf6] text-[#106b43]">
                          <Icon className="h-5 w-5" />
                        </span>
                        <h3 className="text-lg font-bold text-[#082653]">{t(`mental.steps.${step.key}.title`)}</h3>
                      </div>
                      <p className="mt-3 text-sm leading-7 text-slate-600">{t(`mental.steps.${step.key}.body`)}</p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {t(`mental.steps.${step.key}.examples`)
                          .split(" · ")
                          .map((example) => (
                            <span
                              key={example}
                              className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-bold text-slate-600"
                            >
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
              <SectionHeading eyebrow={t("maps.eyebrow")} title={t("maps.title")}>
                {t("maps.intro")}
              </SectionHeading>
              <div className="mt-5 space-y-5 text-sm leading-7 text-slate-700 md:text-base">
                <p>{t("maps.p1")}</p>
                <p>{t("maps.p2")}</p>
                <p>{t("maps.p3")}</p>
                <p>{t("maps.p4")}</p>
              </div>
              <p className="mt-5 rounded-[18px] border border-[#d9e5f2] bg-white p-4 text-sm font-semibold leading-6 text-[#082653] shadow-sm">
                {t("maps.footnote")}
              </p>
            </section>

            <section>
              <SectionHeading eyebrow={t("confusing.eyebrow")} title={t("confusing.title")}>
                {t("confusing.intro")}
              </SectionHeading>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {confusingCases.map((key) => (
                  <article key={key} className="rounded-[18px] border border-slate-200 bg-white p-5 shadow-sm">
                    <h3 className="text-base font-bold text-[#082653]">{t(`confusing.cases.${key}.title`)}</h3>
                    <p className="mt-2 text-sm leading-7 text-slate-600">{t(`confusing.cases.${key}.body`)}</p>
                  </article>
                ))}
              </div>
            </section>

            <section className="rounded-[24px] border border-[#d9e5f2] bg-[linear-gradient(135deg,#f8fcff,#fff)] p-5 shadow-sm">
              <SectionHeading eyebrow={t("shinkansen.eyebrow")} title={t("shinkansen.title")}>
                {t("shinkansen.intro")}
              </SectionHeading>
              <div className="mt-5 space-y-5 text-sm leading-7 text-slate-700 md:text-base">
                <p>
                  {t.rich("shinkansen.p1Rich", {
                    b1: (chunks) => <strong>{chunks}</strong>,
                    b2: (chunks) => <strong>{chunks}</strong>,
                    b3: (chunks) => <strong>{chunks}</strong>,
                    b4: (chunks) => <strong>{chunks}</strong>,
                    b5: (chunks) => <strong>{chunks}</strong>,
                    b6: (chunks) => <strong>{chunks}</strong>,
                    b7: (chunks) => <strong>{chunks}</strong>,
                  })}
                </p>
                <p>
                  {t.rich("shinkansen.p2Rich", {
                    link1: (chunks) => (
                      <Link href="/tokyo-to-kyoto-shinkansen-ticket" className="font-bold text-[#106b43] underline underline-offset-2">
                        {chunks}
                      </Link>
                    ),
                    link2: (chunks) => (
                      <Link href="/jr-pass-vs-single-ticket" className="font-bold text-[#106b43] underline underline-offset-2">
                        {chunks}
                      </Link>
                    ),
                    link3: (chunks) => (
                      <Link href="/guide" className="font-bold text-[#106b43] underline underline-offset-2">
                        {chunks}
                      </Link>
                    ),
                    link4: (chunks) => (
                      <Link href="/shinkansen-seat-guides" className="font-bold text-[#106b43] underline underline-offset-2">
                        {chunks}
                      </Link>
                    ),
                    link5: (chunks) => (
                      <Link href="/tokyo-to-kyoto-mt-fuji-seat" className="font-bold text-[#106b43] underline underline-offset-2">
                        {chunks}
                      </Link>
                    ),
                  })}
                </p>
              </div>
              <div className="mt-5 flex flex-wrap gap-3">
                <InternalCta
                  href="/#seat-checker"
                  label={t("shinkansen.ctas.seatChecker")}
                  placement="train_signs_shinkansen"
                  ctaType="seat_checker"
                  locale={locale}
                />
                <InternalCta
                  href="/guide"
                  label={t("shinkansen.ctas.fullGuide")}
                  placement="train_signs_shinkansen"
                  ctaType="guide"
                  locale={locale}
                  variant="secondary"
                />
              </div>
            </section>

            <section>
              <SectionHeading eyebrow={t("before.eyebrow")} title={t("before.title")}>
                {t("before.intro")}
              </SectionHeading>
              <ul className="mt-5 grid gap-3 md:grid-cols-2">
                {checklist.map((key) => (
                  <li
                    key={key}
                    className="flex gap-3 rounded-[16px] border border-slate-200 bg-white p-4 text-sm font-semibold leading-6 text-slate-700 shadow-sm"
                  >
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#2E7D5B]" />
                    {t(`before.checklist.${key}`)}
                  </li>
                ))}
              </ul>
              <AdSlot placement="train_signs_mid_article" format="horizontal" />
              <div className="mt-4 rounded-[22px] border border-emerald-100 bg-emerald-50/70 p-5 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.1em] text-[#106b43]">
                      {t("before.practical.eyebrow")}
                    </p>
                    <h3 className="mt-1 text-lg font-bold text-slate-950">
                      {t("before.practical.title")}
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      {t("before.practical.body")}
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
                      className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#2E7D5B] bg-[#2E7D5B] px-4 py-2.5 text-sm font-extrabold text-white shadow-sm transition-colors hover:bg-[#246449]"
                    >
                      {t("before.practical.start")}
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
                      {t("before.practical.chooseHotel")}
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
                      {t("before.practical.airport")}
                      <ArrowRight className="h-4 w-4" />
                    </TrackedCtaLink>
                    <div className="pt-1">
                      <EsimCta
                        label={t("before.practical.esim")}
                        placement="train_signs_checklist"
                        locale={locale}
                        variant="subtle"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section id="priority-seats">
              <SectionHeading eyebrow={t("priority.eyebrow")} title={t("priority.title")}>
                {t("priority.intro")}
              </SectionHeading>
              <div className="mt-5 space-y-5 text-sm leading-7 text-slate-700 md:text-base">
                <p>{t("priority.p1")}</p>
                <p>{t("priority.p2")}</p>
                <p>{t("priority.p3")}</p>
              </div>
            </section>

            <section>
              <SectionHeading eyebrow="FAQ" title={t("faq.title")} />
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

            {/*
              Suica simulator tool-launch block — promoted to its own
              section so the primaryTool (navy) CTA reads as a real
              interactive-tool entry point rather than just another
              article-end link card. This replaces the sixth grid card
              the simulator used to share with Seat Checker / JR Pass /
              etc.; no new CTA was added.
            */}
            <section className="rounded-[22px] border border-[#d9e5f2] bg-[linear-gradient(135deg,#f8fcff,#fff)] p-5 shadow-sm">
              <p className="text-[11px] font-black uppercase tracking-[0.1em] text-[#145aa0]">
                Practical next step
              </p>
              <h3 className="mt-1 text-lg font-bold text-slate-950 md:text-xl">
                {tSuica("ctaLabel")}
              </h3>
              <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">
                {tSuica("ctaDescription")}
              </p>
              <div className="mt-4">
                <Link
                  href="/how-to-buy-suica"
                  className={buttonClassName({ variant: "primaryTool", size: "lg" })}
                >
                  {tSuica("ctaLabel")}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </section>

            <section className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-[11px] font-black uppercase tracking-[0.1em] text-[#106b43]">{t("suggested.eyebrow")}</p>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {suggestedCards.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex h-full items-center gap-3 rounded-[18px] border border-[#d9e5f2] bg-white p-4 text-sm shadow-sm transition-colors hover:border-[#2E7D5B] hover:bg-[#f0fbf6]"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f0fbf6] text-[#106b43]">
                      <ArrowRight className="h-5 w-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-bold text-[#082653]">{t(`suggested.cards.${item.key}.title`)}</span>
                      <span className="mt-1 block text-xs leading-5 text-[#5f7190]">{t(`suggested.cards.${item.key}.desc`)}</span>
                    </span>
                  </Link>
                ))}
              </div>
            </section>

            <ShareThisPage
              title={t("share.title")}
              placement="train_signs_footer"
              description={t("share.description")}
              locale={locale}
            />
          </article>

          <aside className="space-y-3 lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-[11px] font-black uppercase tracking-[0.1em] text-[#145aa0]">{t("sidebar.remember.eyebrow")}</p>
              <p className="mt-2 text-sm leading-7 text-slate-600">
                {t("sidebar.remember.body")}
              </p>
            </div>
            <Link
              href="/plan-your-trip"
              className="flex items-center gap-3 rounded-[18px] border border-[#d9e5f2] bg-white p-4 shadow-sm transition-colors hover:bg-[#f8fbff]"
            >
              <Smartphone className="h-5 w-5 text-[#145aa0]" />
              <span>
                <span className="block text-sm font-bold text-[#082653]">{t("sidebar.plan.title")}</span>
                <span className="mt-1 block text-xs leading-5 text-[#5f7190]">{t("sidebar.plan.desc")}</span>
              </span>
            </Link>
            <Link
              href="/airport-transfers"
              className="flex items-center gap-3 rounded-[18px] border border-[#d9e5f2] bg-white p-4 shadow-sm transition-colors hover:bg-[#f8fbff]"
            >
              <MapPinned className="h-5 w-5 text-[#145aa0]" />
              <span>
                <span className="block text-sm font-bold text-[#082653]">{t("sidebar.airport.title")}</span>
                <span className="mt-1 block text-xs leading-5 text-[#5f7190]">{t("sidebar.airport.desc")}</span>
              </span>
            </Link>
          </aside>
        </div>

        <SiteLegalLinks className="mt-10 text-slate-500" />
      </Container>
    </main>
  );
}
