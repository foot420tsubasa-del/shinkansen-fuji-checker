export type AdFormat = "horizontal" | "rectangle" | "fluid";

export type AdPlacement =
  | "train_signs_mid_article"
  | "room_size_mid_article"
  | "asakusa_ueno_after_hotel_cta"
  | "ueno_shinjuku_after_hotel_cta";

const adSlots: Record<AdPlacement, string | undefined> = {
  train_signs_mid_article: process.env.NEXT_PUBLIC_ADSENSE_SLOT_TRAIN_SIGNS_MID_ARTICLE,
  room_size_mid_article: process.env.NEXT_PUBLIC_ADSENSE_SLOT_ROOM_SIZE_MID_ARTICLE,
  asakusa_ueno_after_hotel_cta: process.env.NEXT_PUBLIC_ADSENSE_SLOT_ASAKUSA_UENO_AFTER_HOTEL_CTA,
  ueno_shinjuku_after_hotel_cta: process.env.NEXT_PUBLIC_ADSENSE_SLOT_UENO_SHINJUKU_AFTER_HOTEL_CTA,
};

/**
 * The publisher id, which is not a secret: it already ships in every page's
 * verification meta tag and in public/ads.txt, and it is inlined into the
 * client bundle wherever it is used. It was an environment variable, which
 * bought nothing and added a second thing to get wrong in the Vercel console —
 * the deploy that was meant to turn ads on arrived with the tag still absent.
 * One flag is left to set; the id travels with the code that must agree with it.
 */
export const ADSENSE_CLIENT_ID = "ca-pub-5844175658360101";

/**
 * Whether the AdSense tag loads at all.
 *
 * This was NEXT_PUBLIC_ADSENSE_ENABLED. Two deploys meant to turn the tag on
 * shipped without it, and a browser on production showed gtag and Travelpayouts
 * loading while adsbygoogle stayed undefined — a flag that fails silently and
 * leaves nothing in the repo to read. NEXT_PUBLIC_ values are inlined at build
 * time, so the console and the running site can disagree indefinitely.
 *
 * It lives in code now, like KLOOK_ONLY in src/affiliateLinks.ts: turning ads
 * on is a reviewable commit rather than a console toggle, and whether the tag
 * should be loading is answerable by reading this file.
 *
 * On does not mean ads appear. Each unit needs its slot id in the environment,
 * and with none set AdSlot renders nothing — which is the state the site wants
 * while the AdSense review is still running. What this buys now is the tag
 * itself, which the review looks for and which the EEA consent message
 * requires before it can be published.
 */
const ADSENSE_ENABLED = true;

export function isAdsenseEnabled() {
  return ADSENSE_ENABLED;
}

export function getAdsenseClientId() {
  return ADSENSE_CLIENT_ID;
}

export function getAdsenseSlot(placement: AdPlacement) {
  return adSlots[placement]?.trim() ?? "";
}
