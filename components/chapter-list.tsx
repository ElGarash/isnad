"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  arabicTexts,
  formatArabicCount,
  formatChapterTitle,
} from "@/lib/arabic-utils";
import { getArabicSource } from "@/lib/book-mapping";
import { LAYOUT } from "@/lib/layout-constants";
import { Chapter } from "@/lib/sqlite";
import { cleanName } from "@/lib/utils";
import { BookOpen, Hash } from "lucide-react";
import Link from "next/link";

interface ChapterListProps {
  chapters: Chapter[];
  source: string;
}

export default function ChapterList({ chapters, source }: ChapterListProps) {
  return (
    <div className={LAYOUT.CONTAINER_CLASSES}>
      <div className="mb-8">
        <h1 className="mb-4 text-center text-4xl font-bold">
          {arabicTexts.chapters} {getArabicSource(source)}
        </h1>
        <p className="text-center text-gray-600">
          {arabicTexts.browseChapters} •{" "}
          {formatArabicCount(
            chapters.length,
            arabicTexts.chapter,
            arabicTexts.chapters,
          )}{" "}
          {arabicTexts.available}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {chapters.map((chapter) => (
          <Link
            key={`${chapter.source}-${chapter.chapter_no}`}
            href={`/hadith/${encodeURIComponent(chapter.source)}/${encodeURIComponent(chapter.chapter)}`}
          >
            <Card className="border-2 border-gray-200 p-6 transition-all duration-200 hover:-translate-y-1 hover:border-black hover:shadow-lg">
              <div className="mb-4 flex items-start justify-between">
                <div className="-skew-x-3 bg-black p-2 text-white">
                  <BookOpen className="h-5 w-5" />
                </div>
                <Badge variant="outline" className="text-xs">
                  {formatChapterTitle(chapter.chapter_no)}
                </Badge>
              </div>

              <h3 className="mb-3 text-right text-lg font-semibold leading-tight">
                {cleanName(chapter.chapter)}
              </h3>

              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Hash className="h-3 w-3" />
                  {formatArabicCount(
                    chapter.count,
                    arabicTexts.hadith,
                    arabicTexts.hadiths,
                  )}
                </Badge>
                <span className="text-sm font-medium text-blue-600">
                  {arabicTexts.browse} ←
                </span>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
