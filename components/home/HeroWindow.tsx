import { getImageProps } from "next/image";
import { HERO_IMAGES, type HeroSeason } from "@/lib/hero-images";

/**
 * The hero photograph: a tall frame on phones, a wide one from md up, both
 * through next/image's optimiser. Art direction needs <picture>, which
 * next/image does not render itself, so the two sets of props are built with
 * getImageProps and only the matching one is downloaded.
 */
export function HeroWindow({ season }: { season: HeroSeason }) {
  const image = HERO_IMAGES[season];
  const common = { alt: image.alt, priority: true, sizes: "100vw" } as const;
  const {
    props: { srcSet: wideSrcSet },
  } = getImageProps({ ...common, ...image.wide });
  const {
    props: { srcSet: tallSrcSet, ...tall },
  } = getImageProps({ ...common, ...image.tall });

  return (
    // On a phone the panel covers the lower part of the frame, so the photo is
    // drawn taller than the hero and pulled up: Fuji lands between the headline
    // and the panel instead of behind it.
    <picture className="absolute inset-x-0 -top-[150px] bottom-0 -z-20 md:top-0">
      <source media="(min-width: 768px)" srcSet={wideSrcSet} sizes="100vw" />
      <source srcSet={tallSrcSet} sizes="100vw" />
      {/* eslint-disable-next-line jsx-a11y/alt-text -- alt comes from the spread props */}
      <img
        {...tall}
        srcSet={tallSrcSet}
        className="h-full w-full object-cover object-[62%_center] md:object-[60%_45%]"
      />
    </picture>
  );
}
