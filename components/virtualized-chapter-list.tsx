"use client";

import VirtualizedList from "./virtualized-list";
import { getArabicBook } from "@/lib/book-mapping";
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
        const fullText = `${getArabicBook(item.source)} — ${item.chapter} (${item.count})`;
        return (
          <Link
            href={`/hadith/${encodeURIComponent(item.source)}/${item.chapter}`}
            className="block p-2 border-2 border-black hover:bg-parchment hover:text-navy transition-colors"
            title={fullText}
          >
            <div className="truncate">{fullText}</div>
          </Link>
        );
      }}
    />
  );
}
