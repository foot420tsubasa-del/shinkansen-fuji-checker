"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { sceneFallbackChain, type Mission } from "@/data/station-practice/missions";
import type { GameStatus } from "@/components/station-practice/store/gameStore";

type Props = {
  mission: Mission;
  status: GameStatus;
};

export function SceneStage({ mission, status }: Props) {
  const cleared = status === "mission-cleared";
  return (
    <div className="absolute inset-0 overflow-hidden">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={mission.id}
          className="absolute inset-0"
          initial={{ opacity: 0, scale: 1.06 }}
          animate={{
            opacity: 1,
            scale: cleared ? 1.08 : 1.0,
          }}
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{
            opacity: { duration: 0.35, ease: "easeOut" },
            scale: { duration: cleared ? 1.2 : 0.5, ease: "easeOut" },
          }}
        >
          <SceneImage src={mission.sceneImage} alt={mission.sceneAlt} />
        </motion.div>
      </AnimatePresence>
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-b from-[#070a13]/55 via-[#070a13]/15 to-[#070a13]/95"
      />
    </div>
  );
}

function SceneImage({ src, alt }: { src: string; alt: string }) {
  const [chain, setChain] = useState<string[]>(() => sceneFallbackChain(src));
  const current = chain[0];

  useEffect(() => {
    setChain(sceneFallbackChain(src));
  }, [src]);

  return (
    <Image
      src={current}
      alt={alt}
      fill
      sizes="(min-width: 1024px) 60vw, 100vw"
      className="object-contain"
      priority
      onError={() => {
        setChain((prev) => (prev.length > 1 ? prev.slice(1) : prev));
      }}
    />
  );
}
