import type { Metadata } from "next";
import {
  getLocalTokyoMetadata,
  LocalTokyoDetailPage,
  type LocalTokyoPageKey,
} from "../LocalTokyoDetailPage";

type Props = {
  params: Promise<{ locale: string }>;
};

const pageKey = "monzen-nakacho" satisfies LocalTokyoPageKey;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return getLocalTokyoMetadata(locale, pageKey);
}

export default async function MonzenNakachoPage({ params }: Props) {
  const { locale } = await params;
  return <LocalTokyoDetailPage locale={locale} pageKey={pageKey} />;
}
