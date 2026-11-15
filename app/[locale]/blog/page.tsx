import type { Metadata } from "next";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { SiteHeader } from "../components/SiteHeader";
import { SiteFooter } from "@/components/content/SiteFooter";
import { getAlternates } from "@/i18n/hreflang";
import { BLOG_POSTS } from "@/data/blog/posts";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: "Blog — Japan by Train, From the Right Seat | fujiseat",
    description: "Practical answers for riding Japan's trains: seats, views, timing and where to stay, written by a Japan-based local.",
    robots: locale === "en" ? undefined : { index: false, follow: true },
    alternates: getAlternates("/blog", locale),
  };
}

export default function BlogIndex() {
  const posts = [...BLOG_POSTS].sort((a, b) => b.published.localeCompare(a.published));
  return (
    <main className="page-shell min-h-screen text-ink">
      <SiteHeader />
      <div className="mx-auto max-w-[1180px] px-5 pb-16 pt-8 md:px-7 md:pt-12">
        <p className="text-xs font-bold uppercase tracking-[0.1em] text-fuji">Blog</p>
        <h1 className="mt-3 text-[34px] font-extrabold leading-[1.08] tracking-[-0.03em] md:text-[48px]">
          Japan by train, from the right seat
        </h1>
        <p className="mt-3 max-w-[560px] text-base leading-7 text-slate-600">
          Practical answers for the trip itself — seats, views, timing and where to stay — written by a Japan-based local.
        </p>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-[0_8px_24px_rgba(11,18,32,0.05)] transition-shadow hover:shadow-[0_14px_34px_rgba(11,18,32,0.1)]"
            >
              <div className="relative aspect-[16/9] bg-ink">
                <Image src={post.heroImage.src} alt={post.heroImage.alt} fill sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw" className="object-cover" />
              </div>
              <div className="p-5">
                <p className="flex items-start justify-between gap-3 text-lg font-bold leading-snug">
                  {post.title}
                  <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-slate-400 group-hover:text-ink" aria-hidden="true" />
                </p>
                <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">{post.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
      <SiteFooter />
    </main>
  );
}
