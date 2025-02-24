"use client";

import { Card } from "@/components/ui/card";
import { getArabicSource } from "@/lib/book-mapping";
import { HadithWithFirstNarrator } from "@/lib/sqlite";
import { cleanName } from "@/lib/utils";
import { useVirtualizer } from "@tanstack/react-virtual";
import Link from "next/link";
import { useRef } from "react";

interface HadithListProps {
  hadiths: HadithWithFirstNarrator[];
}

export default function HadithList({ hadiths }: HadithListProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  const ROW_HEIGHT = 300;

  const virtualizer = useVirtualizer({
    count: hadiths.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 5,
  });

  return (
    <div className="container mx-auto py-8">
      <div ref={parentRef} className="h-[800px] overflow-auto">
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
                className="absolute top-0 left-0 w-full pl-4"
                key={virtualRow.index}
                style={{
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                <Link
                  href={`/hadith/${encodeURIComponent(hadith.source)}/${hadith.chapter}/${hadith.hadith_no}`}
                  hrefLang="ar"
                >
                  <Card className="relative border-4 border-black overflow-hidden m-2">
                    <div className="absolute top-0 left-0 w-24 h-24 bg-parchment transform -rotate-45 -translate-x-12 -translate-y-12 z-10"></div>
                    <div className="absolute top-2 left-2 z-20 transform rotate-45">
                      <div className="bg-black text-parchment  text-xl font-bold px-2 py-1 transform -rotate-90">
                        {hadith.id}
                      </div>
                    </div>
                    <div className="p-6 pt-10 pl-16">
                      <div className="text-right mb-4">
                        <h3 className="font-bold text-xl mb-1 inline-block bg-black text-white px-2 py-1 transform -skew-x-12">
                          {hadith.narrator_name!}
                        </h3>
                        <div className="text-sm text-gray-600 mt-2">
                          <span className="inline-block bg-gray-200 px-2 py-1 ml-2 mb-2">
                            {getArabicSource(hadith.source)}
                          </span>
                          <span className="inline-block bg-gray-200 px-2 py-1">
                            {cleanName(hadith.chapter)}
                          </span>
                        </div>
                      </div>
                      <div className="relative">
                        <div className="absolute right-0 top-0 bottom-0 w-1 bg-black"></div>
                        <p
                          className="text-right leading-relaxed whitespace-pre-wrap break-words pr-4 overflow-hidden"
                          style={{
                            maxHeight: `${ROW_HEIGHT - 140}px`, // Account for padding and header
                            display: "-webkit-box",
                            WebkitLineClamp: "3",
                            WebkitBoxOrient: "vertical",
                          }}
                        >
                          {hadith.text_ar}
                        </p>
                      </div>
                    </div>
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-black"></div>
                    <div className="absolute bottom-0 right-0 w-1 h-full bg-black"></div>
                  </Card>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
