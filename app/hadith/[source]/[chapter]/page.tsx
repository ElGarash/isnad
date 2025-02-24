import HadithList from "@/components/hadith-list";
import { getHadithsByChapterSource, getSourceChapters } from "@/lib/sqlite";
import { notFound } from "next/navigation";

const STATIC_SOURCES = ["Sahih Bukhari"] as const;
type StaticSource = (typeof STATIC_SOURCES)[number];

interface ChapterPageProps {
  params: Promise<{
    source: StaticSource;
    chapter: string;
  }>;
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
  const [decodedSource, decodedChapter] = [
    decodeURIComponent(source) as StaticSource,
    decodeURIComponent(chapter),
  ];

  if (!STATIC_SOURCES.includes(decodedSource)) {
    notFound();
  }
  const hadiths = getHadithsByChapterSource(decodedSource, decodedChapter);

  if (hadiths.length === 0) {
    notFound();
  }
  return <HadithList hadiths={hadiths} />;
}
