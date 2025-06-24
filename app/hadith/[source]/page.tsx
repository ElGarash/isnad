import ChapterList from "@/components/chapter-list";
import { formatArabicCount } from "@/lib/arabic-utils";
import { STATIC_SOURCES, StaticSource } from "@/lib/constants";
import { generateBaseMetadata } from "@/lib/metadata-utils";
import { getSourceChapters } from "@/lib/sqlite";
import {
  sanitizeSourceForPath,
  validateAndDecodeSource,
} from "@/lib/validation-utils";
import { Metadata } from "next";
import { notFound } from "next/navigation";

interface SourcePageProps {
  params: Promise<{
    source: StaticSource;
  }>;
}

export async function generateMetadata({
  params,
}: SourcePageProps): Promise<Metadata> {
  const { source } = await params;
  const decodedSource = validateAndDecodeSource(source);

  const chapters = getSourceChapters(decodedSource);
  const description = `تصفح ${formatArabicCount(chapters.length, "فصل", "فصول")} من ${decodedSource}`;

  return generateBaseMetadata({
    title: `${decodedSource} - فصول`,
    description,
    ogImagePath: `/images/og-images/sources/${sanitizeSourceForPath(decodedSource)}.png`,
  });
}

export async function generateStaticParams() {
  return STATIC_SOURCES.map((source) => ({
    source,
  }));
}

export default async function SourcePage({ params }: SourcePageProps) {
  const { source } = await params;
  const decodedSource = validateAndDecodeSource(source);
  const chapters = getSourceChapters(decodedSource);

  if (chapters.length === 0) {
    notFound();
  }

  return <ChapterList chapters={chapters} source={decodedSource} />;
}
