import { LAYOUT } from "@/lib/layout-constants";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useRef } from "react";

export function useHadithVirtualizer<T>(items: T[]) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => LAYOUT.HADITH_CARD_HEIGHT,
    overscan: LAYOUT.VIRTUALIZATION_OVERSCAN,
  });

  return { parentRef, virtualizer };
}
