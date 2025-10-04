"use client";

import HadithCard from "@/components/hadith-card";
import { useHadithVirtualizer } from "@/hooks/use-hadith-virtualizer";
import { LAYOUT } from "@/lib/layout-constants";
import { HadithWithFirstNarrator } from "@/lib/sqlite";

interface HadithListProps {
  hadiths: HadithWithFirstNarrator[];
}

export default function HadithList({ hadiths }: HadithListProps) {
  const { parentRef, virtualizer } = useHadithVirtualizer(hadiths);

  return (
    <div className={`${LAYOUT.CONTAINER_CLASSES} px-2 md:px-4`}>
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
                className="absolute left-0 top-0 w-full pl-1 md:pl-4"
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
