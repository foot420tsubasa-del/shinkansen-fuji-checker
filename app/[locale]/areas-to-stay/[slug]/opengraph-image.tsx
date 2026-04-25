import { createOgImage, ogSize } from "@/lib/og";
import { getStayBySlug } from "@/lib/content/stay";

export const size = ogSize;
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = getStayBySlug(slug);
  return createOgImage({
    emoji: "🏨",
    title: page?.title ?? "Where to Stay",
    subtitle: page ? `Best pick: ${page.quickRec.area}` : "Compare neighborhoods",
    accent: "#4f46e5",
  });
}
