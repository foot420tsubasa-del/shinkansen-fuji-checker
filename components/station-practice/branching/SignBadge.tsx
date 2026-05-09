"use client";

import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Undo2,
} from "lucide-react";
import type { ChoiceDirection, SignOverlay } from "@/data/station-practice/branching/types";
import { cn } from "@/components/station-practice/lib/utils";

/*
 * One yellow-and-black (or navy) station sign rendered as HTML/CSS.
 *
 * Why HTML and not baked into the image:
 *   - AI / photo-generated background imagery cannot be relied on for
 *     accurate, legal, or readable Japanese signage.
 *   - HTML overlays let us update copy + spacing without re-generating
 *     images, and the same component is used in the optional fullscreen
 *     "inspect signs" zoom view.
 *
 * The sign is positioned by `SignOverlayLayer` using percentages of a
 * fixed-aspect (16:9) viewport, so positions are stable across
 * breakpoints.
 */

type Props = {
  sign: SignOverlay;
  /** Render at full sign size (used inside SignZoomModal). */
  zoom?: boolean;
  /** Click handler — used to open the zoom modal from the inline sign. */
  onClick?: () => void;
};

export function SignBadge({ sign, zoom = false, onClick }: Props) {
  const isYellow = sign.tone !== "navy";
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "block h-full w-full overflow-hidden rounded-md text-left",
        "border-2 shadow-[0_8px_24px_-12px_rgba(0,0,0,0.6)]",
        isYellow
          ? "border-black/30 bg-yellow-300/95 text-black"
          : "border-yellow-300/15 bg-[#0e1933]/95 text-neutral-100",
        sign.important && !zoom && "ring-1 ring-yellow-200/25",
        zoom ? "cursor-default" : "cursor-zoom-in transition-transform hover:scale-[1.04]",
      )}
      aria-label={`Sign: ${sign.textJa} / ${sign.textEn}`}
    >
      <span
        className={cn(
          "flex h-full w-full items-center gap-2 px-2 py-1",
          zoom ? "text-2xl sm:text-4xl" : "text-[10px] sm:text-xs",
        )}
      >
        {sign.direction && (
          <DirectionIcon
            direction={sign.direction}
            className={cn(
              "shrink-0",
              zoom ? "h-8 w-8 sm:h-12 sm:w-12" : "h-3 w-3 sm:h-4 sm:w-4",
            )}
          />
        )}
        <span className="flex min-w-0 flex-1 flex-col leading-tight">
          <span
            className={cn(
              "truncate font-semibold",
              zoom ? "text-2xl sm:text-4xl" : "text-[11px] sm:text-sm",
            )}
          >
            {sign.textJa}
          </span>
          <span
            className={cn(
              "truncate font-medium",
              isYellow ? "text-black/70" : "text-neutral-300",
              zoom ? "text-base sm:text-2xl" : "text-[9px] sm:text-[11px]",
            )}
          >
            {sign.textEn}
          </span>
        </span>
      </span>
    </button>
  );
}

export function DirectionIcon({
  direction,
  className,
}: {
  direction: ChoiceDirection;
  className?: string;
}) {
  const props = { className, "aria-hidden": true };
  switch (direction) {
    case "up":
      return <ArrowUp {...props} />;
    case "down":
      return <ArrowDown {...props} />;
    case "left":
      return <ArrowLeft {...props} />;
    case "right":
      return <ArrowRight {...props} />;
    case "back":
      return <Undo2 {...props} />;
    case "straight":
    default:
      return <ArrowUp {...props} />;
  }
}
