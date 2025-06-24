import ChapterPageComponent from "@/components/chapter-page";
import { formatArabicCount } from "@/lib/arabic-utils";
import { STATIC_SOURCES, StaticSource } from "@/lib/constants";
import {
  generateBaseMetadata,
  generateNotFoundMetadata,
} from "@/lib/metadata-utils";
import { getHadithsByChapterSource, getSourceChapters } from "@/lib/sqlite";
import {
  sanitizeSourceForPath,
  validateAndDecodeChapter,
  validateAndDecodeSource,
} from "@/lib/validation-utils";
import { Metadata } from "next";
import { notFound } from "next/navigation";

interface ChapterPageProps {
  params: Promise<{
    source: StaticSource;
    chapter: string;
  }>;
}

export async function generateMetadata({
  params,
}: ChapterPageProps): Promise<Metadata> {
  const { source, chapter } = await params;
  const decodedSource = validateAndDecodeSource(source);
  const decodedChapter = validateAndDecodeChapter(chapter);

  const hadiths = getHadithsByChapterSource(decodedSource, decodedChapter);

  if (hadiths.length === 0) {
    return generateNotFoundMetadata("chapterNotFound");
  }

  const chapterNo = hadiths[0].chapter_no;
  const sanitizedSource = sanitizeSourceForPath(decodedSource);
  const description = `مجموعة من ${formatArabicCount(hadiths.length, "حديث", "أحاديث")} من فصل ${decodedChapter} في ${decodedSource}`;

  return generateBaseMetadata({
    title: `${decodedChapter} - ${decodedSource}`,
    description,
    ogImagePath: `/images/og-images/chapters/${sanitizedSource}/${chapterNo}.png`,
    type: "article",
  });
}

export async function generateStaticParams() {
  const allChapters = STATIC_SOURCES.flatMap((source, i) =>
    getSourceChapters(source).map((c) => ({
      source: STATIC_SOURCES[i],
      chapter: c.chapter,
    })),
  );
  return allChapters;
}

export default async function ChapterPage({ params }: ChapterPageProps) {
  const { source, chapter } = await params;
  const decodedSource = validateAndDecodeSource(source);
  const decodedChapter = validateAndDecodeChapter(chapter);
  const hadiths = getHadithsByChapterSource(decodedSource, decodedChapter);

  if (hadiths.length === 0) {
    notFound();
  }

  return (
    <ChapterPageComponent
      hadiths={hadiths}
      source={decodedSource}
      chapter={decodedChapter}
    />
  );
}
