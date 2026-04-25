import { createOgImage, ogSize } from "@/lib/og";

export const runtime = "edge";
export const alt = "Where to Stay in Japan - fujiseat";
export const size = ogSize;
export const contentType = "image/png";

export default function Image() {
  return createOgImage({
    emoji: "🏨",
    title: "Where to Stay in Japan",
    subtitle: "Compare Tokyo, Kyoto, Osaka and Mt Fuji neighborhoods",
    accent: "#4f46e5",
  });
}
