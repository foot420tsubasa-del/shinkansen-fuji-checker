import { createOgImage, ogSize } from "@/lib/og";

export const runtime = "edge";
export const alt = "Japan Itineraries - fujiseat";
export const size = ogSize;
export const contentType = "image/png";

export default function Image() {
  return createOgImage({
    emoji: "🗺️",
    title: "Japan Itineraries",
    subtitle: "5 to 14 day plans - hotels, transport and activities included",
    accent: "#0369a1",
  });
}
