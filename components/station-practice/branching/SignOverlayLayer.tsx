"use client";

import type { SignOverlay } from "@/data/station-practice/branching/types";
import { SignBadge } from "./SignBadge";

/*
 * Positions one or more `SignBadge` overlays on top of the scene image.
 *
 * Layout strategy: the parent `SceneViewport` keeps a fixed 16:9 aspect
 * ratio. We position each sign's centre at (sign.x%, sign.y%) and size
 * the sign as (sign.width%, sign.height%) of the viewport box. Because
 * positions and sizes are percentages of the same parent, signs scale
 * cleanly from mobile to desktop without recalculation.
 */

type Props = {
  signs: SignOverlay[];
  onSignClick?: (sign: SignOverlay) => void;
};

export function SignOverlayLayer({ signs, onSignClick }: Props) {
  return (
    <div className="pointer-events-none absolute inset-0">
      {signs.map((sign) => (
        <div
          key={sign.id}
          className="pointer-events-auto absolute"
          style={{
            left: `${sign.x - sign.width / 2}%`,
            top: `${sign.y - sign.height / 2}%`,
            width: `${sign.width}%`,
            height: `${sign.height}%`,
          }}
        >
          <SignBadge sign={sign} onClick={() => onSignClick?.(sign)} />
        </div>
      ))}
    </div>
  );
}
