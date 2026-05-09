"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useState, type ReactNode } from "react";
import type { StationScene } from "@/data/station-practice/branching/types";

/*
 * The fixed-aspect 16:9 stage on which a scene is rendered.
 *
 * - Background image fills the viewport with `object-cover`.
 * - The image source is a *chain*: the dedicated branching path is tried
 *   first, and on `onError` we advance through `scene.fallbackImages`
 *   so a missing /images/station-practice/branching/<id>.png never
 *   shows a broken-image icon.
 * - A dark gradient overlay keeps signs and choices readable on top.
 * - A `key={scene.id}` on the motion wrapper triggers a soft fade
 *   transition between scenes and naturally resets the fallback chain
 *   state for the next scene.
 * - Children are positioned absolutely (sign overlays, decision badges).
 */

type Props = {
  scene: StationScene;
  children?: ReactNode;
};

export function SceneViewport({ scene, children }: Props) {
  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-white/5 bg-black/40">
      <div className="relative aspect-[16/9] w-full">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={scene.id}
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="absolute inset-0"
          >
            <SceneImage scene={scene} />
            <div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-b from-[#070a13]/55 via-[#070a13]/15 to-[#070a13]/85"
            />
          </motion.div>
        </AnimatePresence>
        {children}
      </div>
    </div>
  );
}

/**
 * Renders the scene background image with a fallback chain. When the
 * underlying <img> errors (e.g. 404 because the dedicated branching PNG
 * has not been dropped in yet), advance to the next path in the chain.
 *
 * The chain is built once per mount: [scene.image, ...scene.fallbackImages].
 * Because the parent <motion.div> is keyed on `scene.id`, this component
 * remounts when the player advances scenes, so the chain naturally
 * resets — no useEffect dance needed.
 */
function SceneImage({ scene }: { scene: StationScene }) {
  const [chain, setChain] = useState<string[]>(() => [
    scene.image,
    ...(scene.fallbackImages ?? []),
  ]);
  const src = chain[0];

  return (
    <Image
      src={src}
      alt={scene.imageAlt}
      fill
      priority={scene.progressIndex === 0}
      sizes="(min-width: 1024px) 60vw, 100vw"
      className="object-cover"
      onError={() => {
        setChain((prev) => (prev.length > 1 ? prev.slice(1) : prev));
      }}
    />
  );
}
