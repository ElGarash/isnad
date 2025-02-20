"use client";

import { useVirtualizer } from "@tanstack/react-virtual";
import { useRef } from "react";

interface VirtualizedListProps<T> {
  items: T[];
  rowHeight?: number;
  maxHeight?: number;
  renderItem: (item: T) => React.ReactNode;
}

export default function VirtualizedList<T>({
  items,
  rowHeight = 44,
  maxHeight = 400,
  renderItem,
}: VirtualizedListProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => rowHeight,
    overscan: 5,
  });

  return (
    <div
      ref={parentRef}
      style={{
        maxHeight: `${maxHeight}px`,
        minHeight: `calc(${Math.min(maxHeight, items.length * rowHeight)}px + 1rem)`,
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
        {virtualizer.getVirtualItems().map((virtualRow) => (
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
            {renderItem(items[virtualRow.index])}
          </div>
        ))}
      </div>
    </div>
  );
}
