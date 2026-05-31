import type { ReactNode } from "react";
import type { Metadata } from "next";
import Script from "next/script";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";
import "../globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://fujiseat.com"),
  other: {
    "agd-partner-manual-verification": "",
  },
};

type Props = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

const travelpayoutsDriveScriptAttributes: Record<string, string> = {
  nowprocket: "",
  "data-noptimize": "1",
  "data-cfasync": "false",
  "data-wpfc-render": "false",
  "seraph-accel-crit": "1",
  "data-no-defer": "1",
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale}>
      <head>
        <meta name="agd-partner-manual-verification" />
      </head>
      <body>
        {/* Travelpayouts Drive verification script. Added temporarily for site ownership verification. */}
        <Script
          id="travelpayouts-drive-verification"
          strategy="afterInteractive"
          {...travelpayoutsDriveScriptAttributes}
        >
          {`
            (function () {
              var script = document.createElement("script");
              script.async = 1;
              script.src = 'https://emrldtp.com/NTM0OTgy.js?t=534982';
              document.head.appendChild(script);
            })();
          `}
        </Script>
        <GoogleAnalytics />
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
