import { createOgImage, ogSize } from "@/lib/og";

export const runtime = "edge";
export const alt = "Airport Transfers in Japan — fujiseat";
export const size = ogSize;
export const contentType = "image/png";

export default function Image() {
  return createOgImage({
    emoji: "✈️",
    title: "Airport Transfers in Japan",
    subtitle: "Narita & Haneda → Tokyo — compare speed, cost, and ease",
    accent: "#0369a1",
  });
}
