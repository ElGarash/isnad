"use client";

import HadithCard from "@/components/hadith-card";
import { useHadithVirtualizer } from "@/hooks/use-hadith-virtualizer";
import {
  arabicTexts,
  formatArabicCount,
  formatChapterTitle,
} from "@/lib/arabic-utils";
import { getArabicSource } from "@/lib/book-mapping";
import { LAYOUT } from "@/lib/layout-constants";
import { HadithWithFirstNarrator } from "@/lib/sqlite";
import { cleanName } from "@/lib/utils";
import { ArrowLeft, BookOpen, Hash, Users } from "lucide-react";
import Link from "next/link";

interface ChapterPageProps {
  hadiths: HadithWithFirstNarrator[];
  source: string;
  chapter: string;
}

export default function ChapterPage({
  hadiths,
  source,
  chapter,
}: ChapterPageProps) {
  const { parentRef, virtualizer } = useHadithVirtualizer(hadiths);

  // Get unique narrators for stats
  const uniqueNarrators = new Set(
    hadiths.map((h) => h.narrator_name).filter(Boolean),
  );

  return (
    <div className={LAYOUT.CONTAINER_CLASSES}>
      {/* Chapter Header */}
      <div className="mb-8">
        <div className="mb-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-600 transition-colors hover:text-gray-800"
          >
            <ArrowLeft className="h-4 w-4" />
            {arabicTexts.backToAllHadiths}
          </Link>
        </div>

        <div className="-skew-x-1 border-4 border-black bg-gradient-to-r from-amber-50 to-orange-50 p-8">
          <div className="skew-x-1">
            <div className="mb-4 flex items-center gap-4">
              <div className="-skew-x-6 bg-black p-3 text-white">
                <BookOpen className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {cleanName(chapter)}
                </h1>
                <p className="mt-1 text-lg text-gray-600">
                  {getArabicSource(source)}
                </p>
              </div>
            </div>

            {/* Chapter Stats */}
            <div className="mt-6 flex flex-wrap gap-4">
              <div className="flex items-center gap-2 border-4 border-black bg-white px-4 py-2 text-base font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <Hash className="h-4 w-4" />
                {formatArabicCount(
                  hadiths.length,
                  arabicTexts.hadith,
                  arabicTexts.hadiths,
                )}
              </div>
              <div className="flex items-center gap-2 border-4 border-black bg-white px-4 py-2 text-base font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <Users className="h-4 w-4" />
                {formatArabicCount(
                  uniqueNarrators.size,
                  arabicTexts.narrator,
                  arabicTexts.narrators,
                )}
              </div>
              {hadiths[0]?.chapter_no && (
                <div className="border-4 border-black bg-parchment px-4 py-2 text-base font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  {formatChapterTitle(hadiths[0].chapter_no)}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Hadiths List */}
      <div
        ref={parentRef}
        style={{ height: `${LAYOUT.VIRTUALIZED_CONTAINER_HEIGHT}px` }}
        className="overflow-auto"
      >
        <div
          className="relative w-full"
          style={{
            height: `${virtualizer.getTotalSize()}px`,
          }}
        >
          {virtualizer.getVirtualItems().map((virtualRow) => {
            const hadith = hadiths[virtualRow.index];
            return (
              <div
                className="absolute left-0 top-0 w-full pl-4"
                key={virtualRow.index}
                style={{
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                <HadithCard hadith={hadith} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
