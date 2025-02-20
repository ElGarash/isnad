"use client";

import VirtualizedList from "./virtualized-list";
import { Narrator } from "@/lib/sqlite";
import Link from "next/link";

export default function VirtualizedNarratorList({
  items,
}: {
  items: Narrator[];
}) {
  return (
    <VirtualizedList
      items={items}
      renderItem={(item) => (
        <Link
          href={`/narrator/${encodeURIComponent(item.name)}`}
          className="block p-2 border-2 border-black hover:bg-parchment hover:text-navy transition-colors"
          title={item.name}
        >
          <div className="truncate">{item.name}</div>
        </Link>
      )}
    />
  );
}
