import { getSourceChapters } from "@/lib/sqlite";
import type { Metadata } from "next";
import Link from "next/link";

interface ChapterListPageProps {
  params: { source: string };
}

export const dynamic = "force-static";

export async function generateMetadata({
  params,
}: ChapterListPageProps): Promise<Metadata> {
  const source = decodeURIComponent(params.source);
  return {
    title: `Chapters of ${source}`,
    description: `Browse all chapters in ${source}`,
  };
}

export default async function ChapterListPage({
  params,
}: ChapterListPageProps) {
  const source = decodeURIComponent(params.source);
  const chapters = getSourceChapters(source);

  if (!chapters || chapters.length === 0) {
    return <div className="p-4">No chapters found for this source.</div>;
  }

  return (
    <div className="mx-auto max-w-2xl p-4">
      <h1 className="mb-4 text-2xl font-bold">Chapters of {source}</h1>
      <ul className="divide-y divide-gray-200">
        {chapters.map((chapter) => (
          <li key={chapter.chapter_no} className="py-3">
            <Link
              href={`/hadith/${encodeURIComponent(source)}/${encodeURIComponent(chapter.chapter)}`}
              className="text-lg text-blue-700 hover:underline"
            >
              {chapter.chapter}
            </Link>
            <span className="ml-2 text-gray-500">
              ({chapter.count} hadiths)
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
