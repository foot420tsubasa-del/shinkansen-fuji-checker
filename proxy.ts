import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Match all paths except: API routes, Next.js internals, static assets, and stub pages
  matcher: [
    "/((?!api|_next/static|_next/image|favicon\\.ico|opengraph-image|appstore-badge\\.svg|google.*\\.html|guide/pricing|guide/success|guide/cancel).*)",
  ],
};
