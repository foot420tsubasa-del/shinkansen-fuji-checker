import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowRight, Check } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { SiteHeader } from "../../components/SiteHeader";
import { SiteFooter } from "@/components/content/SiteFooter";
import { BlogBookingCard } from "@/components/blog/BlogBookingCard";
import { RelatedScenicLinks } from "@/components/scenic/RelatedScenicLinks";
import { getAlternates } from "@/i18n/hreflang";
import { BLOG_POSTS, getBlogPost, type BlogBlock } from "@/data/blog/posts";
import { ORIGINS, type OriginId } from "@/lib/fuji-window";
import { getDirectionTicketLink, SHINKANSEN_TICKET_URL } from "@/src/affiliateLinks";
import { AffiliateDisclosure } from "@/components/affiliate/AffiliateDisclosure";

type Props = { params: Promise<{ locale: string; slug: string }> };

export function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return {};
  return {
    title: `${post.title} | fujiseat`,
    description: post.description,
    // English only for now, like the other long-form pages.
    robots: locale === "en" ? undefined : { index: false, follow: true },
    alternates: getAlternates(`/blog/${post.slug}`, locale),
    openGraph: {
      type: "article",
      title: post.title,
      description: post.description,
      siteName: "fujiseat — Japan Rail Seats, Stays & Routes",
      images: [{ url: `https://fujiseat.com${post.heroImage.src}` }],
    },
  };
}

const ORIGIN_LABEL: Record<OriginId, string> = {
  tokyo: "Tokyo",
  shinagawa: "Shinagawa",
  "shin-yokohama": "Shin-Yokohama",
  nagoya: "Nagoya",
  kyoto: "Kyoto",
  "shin-osaka": "Shin-Osaka",
};

/** Computed from lib/fuji-window.ts, so the article cannot drift from the tool. */
function TimingTable() {
  const rows: OriginId[] = ["tokyo", "shinagawa", "shin-yokohama", "kyoto", "shin-osaka", "nagoya"];
  return (
    <div className="my-5 overflow-hidden rounded-2xl border border-slate-200">
      <table className="w-full text-left text-[15px]">
        <thead className="bg-slate-50 text-xs uppercase tracking-[0.06em] text-slate-500">
          <tr>
            <th className="px-4 py-2.5 font-semibold">Leaving from</th>
            <th className="px-4 py-2.5 font-semibold">In view</th>
            <th className="px-4 py-2.5 font-semibold">Best</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((id) => {
            const o = ORIGINS[id];
            return (
              <tr key={id} className="border-t border-slate-100">
                <td className="px-4 py-2.5 font-semibold text-ink">
                  {ORIGIN_LABEL[id]} <span className="text-xs font-normal text-slate-500">({o.westbound ? "right side" : "left side"})</span>
                </td>
                <td className="px-4 py-2.5 tabular-nums text-slate-700">
                  {o.first}–{o.last} min
                </td>
                <td className="px-4 py-2.5 tabular-nums font-semibold text-fuji">{o.peak} min</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function Block({ block, slug }: { block: BlogBlock; slug: string }) {
  switch (block.type) {
    case "p":
      return <p className="my-4 text-[17px] leading-8 text-slate-700">{block.text}</p>;
    case "note":
      return (
        <p className="my-4 rounded-2xl bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600">
          {block.text}{" "}
          <Link href="/#seat-checker" className="font-semibold text-fuji underline underline-offset-2">
            Set a reminder
          </Link>
        </p>
      );
    case "list":
      return (
        <ul className="my-4 grid gap-2.5">
          {block.items.map((item) => (
            <li key={item} className="flex gap-3 text-[17px] leading-7 text-slate-700">
              <Check className="mt-1.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      );
    case "steps":
      return (
        <ol className="my-5 grid gap-4">
          {block.items.map((step, i) => (
            <li key={step.title} className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink text-sm font-bold text-white">
                {i + 1}
              </span>
              <div>
                <p className="text-[17px] font-bold text-ink">{step.title}</p>
                <p className="mt-1 text-[16px] leading-7 text-slate-700">{step.text}</p>
              </div>
            </li>
          ))}
        </ol>
      );
    case "timing":
      return <TimingTable />;
    case "booking": {
      const route = getDirectionTicketLink("tokyo-osaka");
      return (
        <div className="my-5">
          <BlogBookingCard
            href={route?.href ?? SHINKANSEN_TICKET_URL}
            linkId={route?.linkId ?? "shinkansenTicket"}
            adid={route?.adid ?? "1265303"}
            slug={slug}
          />
        </div>
      );
    }
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { locale, slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  const schema = [
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: post.title,
      description: post.description,
      datePublished: post.published,
      dateModified: post.updated,
      image: `https://fujiseat.com${post.heroImage.src}`,
      author: { "@type": "Person", name: "fujiseat (Japan-based local)" },
      publisher: { "@type": "Organization", name: "fujiseat", url: "https://fujiseat.com" },
      mainEntityOfPage: `https://fujiseat.com/blog/${post.slug}`,
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: post.faq.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
      })),
    },
  ];

  const updated = new Date(`${post.updated}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });

  return (
    <main className="page-shell min-h-screen text-ink">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <SiteHeader />
      <article className="mx-auto max-w-[760px] px-5 pb-16 pt-8 md:pt-12">
        <Link href="/blog" className="text-xs font-bold uppercase tracking-[0.1em] text-fuji">
          Blog
        </Link>
        <h1 className="mt-3 text-[32px] font-extrabold leading-[1.1] tracking-[-0.03em] md:text-[44px]">{post.title}</h1>
        <p className="mt-3 text-sm text-slate-500">By a Japan-based local · Updated {updated}</p>
        <AffiliateDisclosure locale={locale} className="mt-1" />

        <div className="relative mt-6 aspect-[16/10] overflow-hidden rounded-[22px] bg-ink">
          <Image src={post.heroImage.src} alt={post.heroImage.alt} fill priority sizes="(min-width: 800px) 760px, 100vw" className="object-cover" />
          {post.heroImage.illustrative ? (
            <span className="absolute bottom-2 right-3 text-[10px] font-medium text-white/70">Illustrative image</span>
          ) : null}
        </div>

        <section className="mt-8 rounded-[22px] bg-ink p-6 text-white">
          <p className="text-xs font-bold uppercase tracking-[0.1em] text-white/60">The short answer</p>
          <ul className="mt-3 grid gap-2.5">
            {post.tldr.map((line) => (
              <li key={line} className="flex gap-3 text-[16px] leading-7 text-white/90">
                <Check className="mt-1.5 h-4 w-4 shrink-0 text-emerald-300" aria-hidden="true" />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </section>

        {post.sections.map((section) => (
          <section key={section.heading} className="mt-10">
            <h2 className="text-2xl font-extrabold tracking-[-0.02em]">{section.heading}</h2>
            {section.blocks.map((block, i) => (
              <Block key={i} block={block} slug={post.slug} />
            ))}
          </section>
        ))}

        <RelatedScenicLinks pagePath={`/blog/${post.slug}`} locale={locale} className="mt-8" />

        <section className="mt-12">
          <h2 className="text-2xl font-extrabold tracking-[-0.02em]">Questions</h2>
          <div className="mt-4 grid gap-3">
            {post.faq.map((item) => (
              <details key={item.q} className="group rounded-2xl border border-slate-200 bg-white px-4 py-3">
                <summary className="cursor-pointer list-none text-[16px] font-bold text-ink">{item.q}</summary>
                <p className="mt-2 text-[15px] leading-7 text-slate-700">{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="mt-12 grid gap-3 sm:grid-cols-2">
          <Link href="/guide" className="group rounded-2xl border border-slate-200 bg-white p-4 hover:shadow-md">
            <p className="flex items-center justify-between font-bold text-ink">
              The full Mt. Fuji seat guide <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-ink" />
            </p>
            <p className="mt-1 text-sm text-slate-600">Which side, which car, and the seat map.</p>
          </Link>
          <Link href="/when-to-see-mt-fuji-shinkansen" className="group rounded-2xl border border-slate-200 bg-white p-4 hover:shadow-md">
            <p className="flex items-center justify-between font-bold text-ink">
              When you will see it <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-ink" />
            </p>
            <p className="mt-1 text-sm text-slate-600">The minutes from every station, and the clearest months.</p>
          </Link>
        </section>
      </article>
      <SiteFooter />
    </main>
  );
}
