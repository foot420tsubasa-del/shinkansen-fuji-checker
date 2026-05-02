import createMiddleware from "next-intl/middleware";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);
const itineraryRedirects: Record<string, string> = {
  "10-day-with-fuji": "10-day-japan-with-fuji",
  "14-day-deep-japan": "14-day-japan-golden-route",
};

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const localePattern = routing.locales.join("|");
  const pattern = new RegExp(`^(/(?:${localePattern}))?/itineraries/([^/]+)/?$`);
  const match = pathname.match(pattern);
  const oldSlug = match?.[2];
  const newSlug = oldSlug ? itineraryRedirects[oldSlug] : undefined;

  if (newSlug) {
    const url = request.nextUrl.clone();
    url.pathname = `${match?.[1] ?? ""}/itineraries/${newSlug}`;
    return NextResponse.redirect(url, 301);
  }

  return intlMiddleware(request);
}

export const config = {
  // Match all paths except: API routes, Next.js internals, static assets, verification files, and stub pages
  matcher: [
    "/((?!api|_next/static|_next/image|robots\\.txt|sitemap\\.xml|favicon\\.ico|icon\\.png|icon\\.ico|apple-icon\\.png|opengraph-image|.*\\.svg|.*\\.png|.*\\.ico|.*\\.jpg|.*\\.jpeg|.*\\.gif|.*\\.webp|.*\\.html|.*\\.htm|guide/pricing|guide/success|guide/cancel).*)",
  ],
};
