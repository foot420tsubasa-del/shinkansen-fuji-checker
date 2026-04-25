import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Match all paths except: API routes, Next.js internals, static assets, and stub pages
  matcher: [
    "/((?!api|_next/static|_next/image|robots\\.txt|sitemap\\.xml|favicon\\.ico|icon\\.png|icon\\.ico|apple-icon\\.png|opengraph-image|.*\\.svg|.*\\.png|.*\\.ico|.*\\.jpg|.*\\.jpeg|.*\\.gif|.*\\.webp|google.*\\.html|guide/pricing|guide/success|guide/cancel).*)",
  ],
};
