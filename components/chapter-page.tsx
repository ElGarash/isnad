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
    <div
      className={`${LAYOUT.CONTAINER_CLASSES} ${LAYOUT.PADDING_X_RESPONSIVE}`}
    >
      {/* Chapter Header */}
      <div className="mb-6 md:mb-8">
        <div className="mb-3 md:mb-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-gray-600 transition-colors hover:text-gray-800 md:text-base"
          >
            <ArrowLeft className="h-4 w-4" />
            {arabicTexts.backToAllHadiths}
          </Link>
        </div>

        <div className="-skew-x-1 border-4 border-black bg-gradient-to-r from-amber-50 to-orange-50 p-4 md:p-8">
          <div className="skew-x-1">
            <div className="mb-3 flex items-center gap-3 md:mb-4 md:gap-4">
              <div className="-skew-x-6 bg-black p-2 text-white md:p-3">
                <BookOpen className="h-6 w-6 md:h-8 md:w-8" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 md:text-3xl">
                  {cleanName(chapter)}
                </h1>
                <p className="mt-1 text-base text-gray-600 md:text-lg">
                  {getArabicSource(source)}
                </p>
              </div>
            </div>

            {/* Chapter Stats */}
            <div className="mt-4 flex flex-wrap gap-2 md:mt-6 md:gap-4">
              <div className="flex items-center gap-2 border-2 border-black bg-white px-3 py-1.5 text-sm font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] md:border-4 md:px-4 md:py-2 md:text-base md:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <Hash className="h-3 w-3 md:h-4 md:w-4" />
                {formatArabicCount(
                  hadiths.length,
                  arabicTexts.hadith,
                  arabicTexts.hadiths,
                )}
              </div>
              <div className="flex items-center gap-2 border-2 border-black bg-white px-3 py-1.5 text-sm font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] md:border-4 md:px-4 md:py-2 md:text-base md:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <Users className="h-3 w-3 md:h-4 md:w-4" />
                {formatArabicCount(
                  uniqueNarrators.size,
                  arabicTexts.narrator,
                  arabicTexts.narrators,
                )}
              </div>
              {hadiths[0]?.chapter_no && (
                <div className="border-2 border-black bg-parchment px-3 py-1.5 text-sm font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] md:border-4 md:px-4 md:py-2 md:text-base md:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
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
