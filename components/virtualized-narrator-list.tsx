"use client";

import { useVirtualizer } from "@tanstack/react-virtual";
import { useRef } from "react";

interface VirtualizedNarratorListProps {
  items: Array<{ name: string; scholar_indx: number }>;
}

export default function VirtualizedNarratorList({
  items,
}: VirtualizedNarratorListProps) {
  const ROW_HEIGHT = 44;
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 5,
  });

  return (
    <div
      ref={parentRef}
      style={{
        maxHeight: "300px",
        minHeight: `calc(${Math.min(300, items.length * ROW_HEIGHT)}px + 1rem)`,
      }}
      className="overflow-auto"
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: "100%",
          position: "relative",
        }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const item = items[virtualRow.index];
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
              <a
                href={`/narrator/${encodeURIComponent(item.name)}`}
                className="block p-2 border-2 border-black hover:bg-parchment hover:text-navy transition-colors"
              >
                {item.name}
              </a>
            </div>
          );
        })}
      </div>
    </div>
  );
}
