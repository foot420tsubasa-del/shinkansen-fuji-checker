import { createOgImage, ogSize } from "@/lib/og";
import { getItineraryBySlug } from "@/lib/content/itineraries";

export const size = ogSize;
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = getItineraryBySlug(slug);
  return createOgImage({
    emoji: "🗺️",
    title: page?.title ?? "Japan Itinerary",
    subtitle: page ? `${page.duration} - ${page.bestFor}` : "Day-by-day trip plan",
    accent: "#0369a1",
  });
}
