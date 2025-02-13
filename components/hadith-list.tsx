"use client";

import { Card } from "@/components/ui/card";
import { Hadith } from "@/lib/sqlite";
import { useVirtualizer } from "@tanstack/react-virtual";
import Link from "next/link";
import { useRef } from "react";

interface HadithListProps {
  hadiths: Hadith[];
}

export default function HadithList({ hadiths }: HadithListProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: hadiths.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 300,
    overscan: 5,
  });

  return (
    <div className="container mx-auto py-8">
      <div ref={parentRef} className="h-[800px] overflow-auto">
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: "100%",
            position: "relative",
          }}
        >
          {virtualizer.getVirtualItems().map((virtualRow) => {
            const hadith = hadiths[virtualRow.index];
            return (
              <div
                key={virtualRow.index}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                <Link
                  href={`/hadith/${encodeURIComponent(hadith.source)}/${hadith.chapter_no}/${hadith.hadith_no}`}
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
                          {}
                        </h3>
                        <div className="text-sm text-gray-600 mt-2">
                          <span className="inline-block bg-gray-200 px-2 py-1 ml-2 mb-2">
                            {hadith.source}
                          </span>
                          <span className="inline-block bg-gray-200 px-2 py-1">
                            {hadith.chapter}
                          </span>
                        </div>
                      </div>
                      <div className="relative">
                        <div className="absolute right-0 top-0 bottom-0 w-1 bg-black"></div>
                        <p className="text-right leading-relaxed whitespace-pre-wrap break-words pr-4">
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
