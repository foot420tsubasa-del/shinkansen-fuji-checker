// A page that sets its own `openGraph` replaces the parent's whole object, so
// pages without a photo of their own must name the shared card image here or
// links to them show no preview (Instagram DMs, iMessage, X, Slack).
export const DEFAULT_OG_IMAGES = [{ url: "https://fujiseat.com/og-default.jpg", width: 1200, height: 630 }];
