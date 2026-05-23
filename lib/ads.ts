export type AdFormat = "horizontal" | "rectangle" | "fluid";

export type AdPlacement =
  | "train_signs_mid_article"
  | "luggage_guide_after_delivery"
  | "room_size_mid_article"
  | "asakusa_ueno_after_hotel_cta"
  | "ueno_shinjuku_after_hotel_cta";

const adSlots: Record<AdPlacement, string | undefined> = {
  train_signs_mid_article: process.env.NEXT_PUBLIC_ADSENSE_SLOT_TRAIN_SIGNS_MID_ARTICLE,
  luggage_guide_after_delivery: process.env.NEXT_PUBLIC_ADSENSE_SLOT_LUGGAGE_GUIDE_AFTER_DELIVERY,
  room_size_mid_article: process.env.NEXT_PUBLIC_ADSENSE_SLOT_ROOM_SIZE_MID_ARTICLE,
  asakusa_ueno_after_hotel_cta: process.env.NEXT_PUBLIC_ADSENSE_SLOT_ASAKUSA_UENO_AFTER_HOTEL_CTA,
  ueno_shinjuku_after_hotel_cta: process.env.NEXT_PUBLIC_ADSENSE_SLOT_UENO_SHINJUKU_AFTER_HOTEL_CTA,
};

export function isAdsenseEnabled() {
  return process.env.NEXT_PUBLIC_ADSENSE_ENABLED === "true";
}

export function getAdsenseClientId() {
  return process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID?.trim() ?? "";
}

export function getAdsenseSlot(placement: AdPlacement) {
  return adSlots[placement]?.trim() ?? "";
}
