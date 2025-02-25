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
          className="block border-2 border-black p-2 transition-colors hover:bg-parchment hover:text-navy"
          title={item.name}
        >
          <div className="truncate">{item.name}</div>
        </Link>
      )}
    />
  );
}
