import { createOgImage, ogSize } from "@/lib/og";

export const runtime = "edge";
export const alt = "Japan Trip Planner - fujiseat";
export const size = ogSize;
export const contentType = "image/png";

export default function Image() {
  return createOgImage({
    emoji: "📋",
    title: "Japan Trip Planner",
    subtitle: "Route templates, checklist, weather, currency",
    accent: "#7c3aed",
  });
}
