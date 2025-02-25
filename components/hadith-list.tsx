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
                className="absolute left-0 top-0 w-full pl-4"
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
                  <Card className="relative m-2 overflow-hidden border-4 border-black">
                    <div className="absolute left-0 top-0 z-10 h-24 w-24 -translate-x-12 -translate-y-12 -rotate-45 transform bg-parchment"></div>
                    <div className="absolute left-2 top-2 z-20 rotate-45 transform">
                      <div className="-rotate-90 transform bg-black px-2 py-1 text-xl font-bold text-parchment">
                        {hadith.id}
                      </div>
                    </div>
                    <div className="p-6 pl-16 pt-10">
                      <div className="mb-4 text-right">
                        <h3 className="mb-1 inline-block -skew-x-12 transform bg-black px-2 py-1 text-xl font-bold text-white">
                          {hadith.narrator_name!}
                        </h3>
                        <div className="mt-2 text-sm text-gray-600">
                          <span className="mb-2 ml-2 inline-block bg-gray-200 px-2 py-1">
                            {getArabicSource(hadith.source)}
                          </span>
                          <span className="inline-block bg-gray-200 px-2 py-1">
                            {cleanName(hadith.chapter)}
                          </span>
                        </div>
                      </div>
                      <div className="relative">
                        <div className="absolute bottom-0 right-0 top-0 w-1 bg-black"></div>
                        <p
                          className="overflow-hidden whitespace-pre-wrap break-words pr-4 text-right leading-relaxed"
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
                    <div className="absolute bottom-0 left-0 h-1 w-full bg-black"></div>
                    <div className="absolute bottom-0 right-0 h-full w-1 bg-black"></div>
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
