"use client";

import { Summary } from "@/components/narrator-summary";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useIsMobile } from "@/hooks/use-mobile";
import { getArabicGrade } from "@/lib/grade-mapping";
import type { Narrator } from "@/lib/sqlite";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Loader2, Search, Users } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

interface NarratorGridProps {
  narrators: Narrator[];
}

interface FilterState {
  search: string;
  grade: string;
  hasHadiths: boolean | null;
  century: string;
}

const GAP = 16;

function FilterPanel({
  filters,
  onFilterChange,
  narratorCount,
  totalCount,
}: {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  narratorCount: number;
  totalCount: number;
}) {
  const grades = [
    "Comp.(RA)",
    "Follower(Tabi')",
    "Succ. (Taba' Tabi')",
    "3rd Century AH",
    "4th Century AH",
  ];

  return (
    <div className="mb-6 space-y-3 md:mb-8 md:space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
        <Input
          type="text"
          placeholder="البحث في أسماء الرواة..."
          value={filters.search}
          onChange={(e) =>
            onFilterChange({ ...filters, search: e.target.value })
          }
          className="border-2 border-black pl-4 pr-10 text-right text-sm md:text-base"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={filters.grade === "" ? "default" : "outline"}
          onClick={() => onFilterChange({ ...filters, grade: "" })}
          className={`border-2 border-black text-xs transition-all hover:bg-parchment hover:shadow-[4px_4px_0px_0px_theme(colors.gray.900)] active:translate-x-1 active:translate-y-1 active:shadow-none md:text-sm ${
            filters.grade === ""
              ? "bg-black text-white hover:bg-gray-800"
              : "bg-white text-black hover:bg-parchment"
          }`}
        >
          <Users className="ml-2 h-3 w-3 md:h-4 md:w-4" />
          <span className="hidden sm:inline">جميع الدرجات</span>
          <span className="sm:hidden">الكل</span>
        </Button>
        {grades.map((grade) => (
          <Button
            key={grade}
            variant={filters.grade === grade ? "default" : "outline"}
            onClick={() => onFilterChange({ ...filters, grade })}
            className={`border-2 border-black text-xs transition-all hover:bg-parchment hover:shadow-[4px_4px_0px_0px_theme(colors.gray.900)] active:translate-x-1 active:translate-y-1 active:shadow-none md:text-sm ${
              filters.grade === grade
                ? "bg-black text-white hover:bg-gray-800"
                : "bg-white text-black hover:bg-parchment"
            }`}
          >
            {getArabicGrade(grade)}
          </Button>
        ))}
      </div>

      {/* Results count */}
      <div className="flex items-center gap-2 text-xs text-gray-600 md:text-sm">
        <Badge className="bg-parchment px-2 py-1 text-black">
          {narratorCount.toLocaleString()} راوي
        </Badge>
        <span>من أصل {totalCount.toLocaleString()} راوي</span>
      </div>
    </div>
  );
}

export default function NarratorGrid({ narrators }: NarratorGridProps) {
  const isMobile = useIsMobile();
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    grade: "",
    hasHadiths: null,
    century: "",
  });
  const [displayLimit, setDisplayLimit] = useState(200); // Start with 200 narrators
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const parentRef = useRef<HTMLDivElement>(null);

  // Responsive items per row and card height
  const [itemsPerRow, setItemsPerRow] = useState(4);
  const [cardHeight, setCardHeight] = useState(320);

  useEffect(() => {
    if (isMobile === undefined) return;

    if (isMobile) {
      setItemsPerRow(1);
      setCardHeight(280);
    } else if (window.innerWidth < 1024) {
      setItemsPerRow(2);
      setCardHeight(300);
    } else if (window.innerWidth < 1280) {
      setItemsPerRow(3);
      setCardHeight(320);
    } else {
      setItemsPerRow(4);
      setCardHeight(320);
    }
  }, [isMobile]);

  // Filter narrators based on current filters with optimized search
  const filteredNarrators = useMemo(() => {
    let filtered = narrators;

    // Apply grade filter first (more selective)
    if (filters.grade) {
      filtered = filtered.filter((narrator) =>
        narrator.grade.includes(filters.grade),
      );
    }

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase().trim();
      if (searchLower.length >= 2) {
        // Only search if at least 2 characters
        filtered = filtered.filter(
          (narrator) =>
            narrator.name.toLowerCase().includes(searchLower) ||
            narrator.grade.toLowerCase().includes(searchLower) ||
            (narrator.death_place &&
              narrator.death_place.toLowerCase().includes(searchLower)),
        );
      }
    }

    // Limit results for performance
    const isFiltered = filters.search || filters.grade;
    const limit = isFiltered ? Math.min(500, filtered.length) : displayLimit;

    return filtered.slice(0, limit);
  }, [narrators, filters, displayLimit]);

  // Group narrators into rows for virtualization
  const rows = useMemo(() => {
    const result = [];
    for (let i = 0; i < filteredNarrators.length; i += itemsPerRow) {
      result.push(filteredNarrators.slice(i, i + itemsPerRow));
    }
    return result;
  }, [filteredNarrators, itemsPerRow]);

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => cardHeight + GAP,
    overscan: 3,
  });

  // Check if we can load more narrators
  const canLoadMore =
    !filters.search && !filters.grade && displayLimit < narrators.length;
  const hasMoreResults =
    filters.search || filters.grade
      ? filteredNarrators.length >= 500
      : displayLimit < narrators.length;

  // Handle load more with loading state
  const handleLoadMore = async () => {
    setIsLoadingMore(true);
    // Simulate async loading for better UX
    await new Promise((resolve) => setTimeout(resolve, 500));
    setDisplayLimit((prev) => Math.min(prev + 200, narrators.length));
    setIsLoadingMore(false);
  };

  return (
    <div className="w-full">
      <FilterPanel
        filters={filters}
        onFilterChange={setFilters}
        narratorCount={filteredNarrators.length}
        totalCount={narrators.length}
      />
      <div ref={parentRef} className="h-[600px] overflow-auto md:h-[800px]">
        <div
          className="relative w-full"
          style={{ height: `${virtualizer.getTotalSize()}px` }}
        >
          {virtualizer.getVirtualItems().map((virtualRow) => {
            const row = rows[virtualRow.index];
            return (
              <div
                key={virtualRow.index}
                className="absolute left-0 top-0 w-full"
                style={{
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {row.map((narrator) => (
                    <Link
                      key={narrator.scholar_indx}
                      href={`/narrator/${encodeURIComponent(narrator.name)}`}
                      className="block h-full"
                    >
                      <Summary narrator={narrator} />
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Load More Button */}
      {canLoadMore && (
        <div className="mt-6 flex justify-center">
          <Button
            onClick={handleLoadMore}
            disabled={isLoadingMore}
            className="border-2 border-black bg-parchment text-black hover:bg-parchment-dark disabled:opacity-50"
          >
            {isLoadingMore ? (
              <>
                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                جاري التحميل...
              </>
            ) : (
              <>
                تحميل المزيد ({Math.min(200, narrators.length - displayLimit)}{" "}
                راوي إضافي)
              </>
            )}
          </Button>
        </div>
      )}

      {/* Search limit notice */}
      {hasMoreResults && (filters.search || filters.grade) && (
        <div className="mt-4 text-center text-sm text-gray-600">
          <p>
            يتم عرض أول 500 نتيجة. يرجى تخصيص البحث للحصول على نتائج أكثر دقة.
          </p>
        </div>
      )}
    </div>
  );
}
