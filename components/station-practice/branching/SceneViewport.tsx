"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import type { ReactNode } from "react";
import type { StationScene } from "@/data/station-practice/branching/types";

/*
 * The fixed-aspect 16:9 stage on which a scene is rendered.
 *
 * - Background image fills the viewport with `object-cover`.
 * - A dark gradient overlay keeps signs and choices readable on top.
 * - A `key={scene.id}` triggers a soft fade transition between scenes.
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
            <Image
              src={scene.image}
              alt={scene.imageAlt}
              fill
              priority={scene.progressIndex === 0}
              sizes="(min-width: 1024px) 60vw, 100vw"
              className="object-cover"
            />
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
