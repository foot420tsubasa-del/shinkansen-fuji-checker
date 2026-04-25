import { createOgImage, ogSize } from "@/lib/og";
import { getTransferBySlug } from "@/lib/content/transfers";

export const size = ogSize;
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = getTransferBySlug(slug);
  return createOgImage({
    emoji: "✈️",
    title: page?.title ?? "Airport Transfer",
    subtitle: page ? `${page.from} → ${page.to} — compare options` : "Compare transfer options",
    accent: "#0369a1",
  });
}
