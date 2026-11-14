import { isPosthogEnabled, POSTHOG_HOST, POSTHOG_KEY } from "@/lib/posthog";

// Next.js runs this once in the browser, before the app hydrates — PostHog's
// recommended place to initialise on Next 15.3+.
//
// Imported dynamically so the library is only downloaded once a key is set:
// a static import would put posthog-js in every page's bundle even while it
// is switched off.
if (isPosthogEnabled()) {
  import("posthog-js").then(({ default: posthog }) => {
    posthog.init(POSTHOG_KEY, {
      api_host: POSTHOG_HOST,
      defaults: "2026-08-30",
      // No cookies or local storage. A quarter of search clicks come from the
      // EEA, the UK and Switzerland, and the site has no consent banner since
      // AdSense (and Google's consent message with it) was switched off.
      // Requires "cookieless server hash mode" to be enabled in the PostHog
      // project settings, or PostHog drops these events.
      cookieless_mode: "always",
      // Anonymous visitors only; nobody signs in here.
      person_profiles: "identified_only",
    });
  });
}
