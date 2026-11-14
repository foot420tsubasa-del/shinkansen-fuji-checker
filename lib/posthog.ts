/**
 * PostHog, kept in code rather than environment variables for the same reason
 * as lib/ads.ts: the project key is public — it ships in every browser that
 * loads the site — and a NEXT_PUBLIC_ variable that fails silently in the
 * Vercel console is harder to debug than a line in this file.
 *
 * Empty key = PostHog is not loaded at all. Fill in the project key ("phc_…")
 * and the host for the project's region to turn it on.
 */
export const POSTHOG_KEY = "";

/** "https://us.i.posthog.com" for a US project, "https://eu.i.posthog.com" for EU. */
export const POSTHOG_HOST = "https://us.i.posthog.com";

export function isPosthogEnabled(): boolean {
  return POSTHOG_KEY.startsWith("phc_");
}
