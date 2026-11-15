/**
 * Seasonal window photographs behind the homepage hero.
 *
 * Generated images (gpt-image-2), so the hero carries an "Illustrative image"
 * label: they set the mood, they are not evidence of what a given train shows.
 * Each season has a wide frame for tablets and desktops and a tall one for
 * phones, chosen with <picture> rather than cropped from a single file.
 */

export type HeroSeason = "spring" | "summer" | "winter";

type HeroFrame = { src: string; width: number; height: number };

export const HERO_IMAGES: Record<HeroSeason, { wide: HeroFrame; tall: HeroFrame; alt: string }> = {
  spring: {
    wide: { src: "/images/hero/window-fuji-spring-wide.webp", width: 1448, height: 1086 },
    tall: { src: "/images/hero/window-fuji-spring-tall.webp", width: 1086, height: 1448 },
    alt: "Snow-capped Mt. Fuji and cherry blossoms seen from a Shinkansen window",
  },
  summer: {
    wide: { src: "/images/hero/window-fuji-summer-wide.webp", width: 1536, height: 1024 },
    tall: { src: "/images/hero/window-fuji-summer-tall.webp", width: 1086, height: 1448 },
    alt: "Mt. Fuji above green rice fields seen from a Shinkansen window",
  },
  winter: {
    wide: { src: "/images/hero/window-fuji-winter-wide.webp", width: 1536, height: 1024 },
    tall: { src: "/images/hero/window-fuji-winter-tall.webp", width: 1086, height: 1448 },
    alt: "Mt. Fuji covered in snow seen from a Shinkansen window",
  },
};

/**
 * The season in Japan, by month: cherry blossom in March and April, green from
 * May to September, and a snow-capped Fuji from October to February, which is
 * also when the mountain is most often clear from the train.
 */
export function heroSeasonFor(date: Date = new Date()): HeroSeason {
  const month = Number(
    new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Tokyo", month: "numeric" }).format(date),
  );
  if (month === 3 || month === 4) return "spring";
  if (month >= 5 && month <= 9) return "summer";
  return "winter";
}
