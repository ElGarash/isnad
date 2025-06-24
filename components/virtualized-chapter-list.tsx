"use client";

import VirtualizedList from "./virtualized-list";
import { toArabicNumerals } from "@/lib/arabic-utils";
import { getArabicSource } from "@/lib/book-mapping";
import { ChapterCount } from "@/lib/sqlite";
import Link from "next/link";

export default function VirtualizedChapterList({
  items,
}: {
  items: ChapterCount[];
}) {
  return (
    <VirtualizedList
      items={items}
      maxHeight={300}
      renderItem={(item) => {
        const fullText = `${getArabicSource(item.source)} — ${item.chapter} (${toArabicNumerals(item.count)})`;
        return (
          <Link
            href={`/hadith/${encodeURIComponent(item.source)}/${item.chapter}`}
            className="block border-2 border-black p-2 transition-colors hover:bg-parchment hover:text-navy"
            title={fullText}
          >
            <div className="truncate">{fullText}</div>
          </Link>
        );
      }}
    />
  );
}
