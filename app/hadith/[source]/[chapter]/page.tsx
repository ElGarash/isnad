import HadithList from "@/components/hadith-list";
import { getHadithsByChapterSource, getSourceChapters } from "@/lib/sqlite";
import { notFound } from "next/navigation";

interface ChapterPageProps {
  params: Promise<{
    source: string;
    chapter: string;
  }>;
}

export async function generateStaticParams() {
  const chapters = getSourceChapters("Sahih Bukhari");
  return chapters.map((c) => ({
    source: c.source,
    chapter: c.chapter,
  }));
}

export default async function ChapterPage({ params }: ChapterPageProps) {
  const { source, chapter } = await params;
  const [decodedSource, decodedChapter] = [
    decodeURIComponent(source),
    decodeURIComponent(chapter),
  ];

  if (decodedSource !== "Sahih Bukhari") {
    notFound();
  }
  const hadiths = getHadithsByChapterSource(decodedSource, decodedChapter);

  if (hadiths.length === 0) {
    notFound();
  }
  return <HadithList hadiths={hadiths} />;
}
