import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { SiteLegalLinks } from "@/components/content/SiteLegalLinks";
import { SiteHeader } from "../components/SiteHeader";
import { QuestionForm } from "./QuestionForm";
import { getAlternates } from "@/i18n/hreflang";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: "Feedback and Japan travel tips — fujiseat",
    description: "Send feedback, trip reports, reviews, or Japan travel tips for future fujiseat improvements and articles.",
    openGraph: {
      title: "Feedback and Japan travel tips",
      description: "Send feedback, trip reports, or Japan travel tips for future fujiseat improvements.",
      siteName: "fujiseat — Japan Rail Seats, Stays & Routes",
    },
    alternates: getAlternates("/questions", locale),
  };
}

export default async function QuestionsPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "feedback" });

  return (
    <main className="page-shell min-h-screen text-slate-950">
      <SiteHeader />

      <Container className="py-8 md:py-12">
        <div className="mx-auto max-w-3xl">
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">{t("eyebrow")}</p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 md:text-4xl">
              {t("title")}
            </h1>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              {t("description")}
            </p>
            <p className="mt-3 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
              {t("playful")}
            </p>
          </div>

          <QuestionForm locale={locale} />

          <div className="mt-6 rounded-2xl border border-slate-200 bg-white/70 p-4 text-xs leading-6 text-slate-500">
            {t("privacyNote")}
          </div>

          <SiteLegalLinks className="mt-8 text-slate-500" />
        </div>
      </Container>
    </main>
  );
}
