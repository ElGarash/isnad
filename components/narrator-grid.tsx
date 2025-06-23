"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getArabicGrade } from "@/lib/grade-mapping";
import { Narrator } from "@/lib/sqlite";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Clock, MapPin, Search, Users } from "lucide-react";
import Link from "next/link";
import { useMemo, useRef, useState } from "react";

interface NarratorGridProps {
  narrators: Narrator[];
}

interface FilterState {
  search: string;
  grade: string;
  hasHadiths: boolean | null;
  century: string;
}

const ITEMS_PER_ROW = 4;
const CARD_HEIGHT = 280;
const GAP = 16;

function NarratorCard({ narrator }: { narrator: Narrator }) {
  return (
    <Link href={`/narrator/${encodeURIComponent(narrator.name)}`}>
      <Card className="relative h-64 cursor-pointer overflow-hidden border-4 border-black bg-white p-4 transition-all hover:shadow-[8px_8px_0px_0px_theme(colors.gray.900)]">
        {/* Corner decoration */}
        <div className="absolute left-0 top-0 z-10 h-16 w-16 -translate-x-8 -translate-y-8 -rotate-45 transform bg-parchment"></div>
        <div className="absolute left-1 top-1 z-20 rotate-45 transform">
          <div className="-rotate-90 transform bg-black px-2 py-1 text-xs font-bold text-parchment">
            {narrator.scholar_indx}
          </div>
        </div>

        {/* Content */}
        <div className="pt-8">
          {/* Name */}
          <h3
            className="mb-3 overflow-hidden text-right text-lg font-bold leading-tight"
            style={{
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}
          >
            {narrator.name}
          </h3>

          {/* Grade */}
          <div className="mb-3 flex justify-end">
            <Badge className="inline-block -skew-x-12 transform bg-black px-2 py-1 text-xs text-white">
              {getArabicGrade(narrator.grade)}
            </Badge>
          </div>

          {/* Birth/Death dates */}
          <div className="mb-3 space-y-1 text-right text-xs text-gray-600">
            {(narrator.birth_date_hijri || narrator.birth_date_gregorian) && (
              <div className="flex items-center justify-end gap-1">
                <span>
                  {narrator.birth_date_hijri &&
                    `${narrator.birth_date_hijri} هـ`}
                  {narrator.birth_date_hijri &&
                    narrator.birth_date_gregorian &&
                    " / "}
                  {narrator.birth_date_gregorian &&
                    `${narrator.birth_date_gregorian} م`}
                </span>
                <Clock className="h-3 w-3" />
              </div>
            )}
            {(narrator.death_date_hijri || narrator.death_date_gregorian) && (
              <div className="flex items-center justify-end gap-1">
                <span>
                  {narrator.death_date_hijri &&
                    `${narrator.death_date_hijri} هـ`}
                  {narrator.death_date_hijri &&
                    narrator.death_date_gregorian &&
                    " / "}
                  {narrator.death_date_gregorian &&
                    `${narrator.death_date_gregorian} م`}
                </span>
                <span>وفاة:</span>
              </div>
            )}
          </div>

          {/* Death place */}
          {narrator.death_place && (
            <div className="mb-3 flex items-center justify-end gap-1 text-xs text-gray-600">
              <span className="truncate">{narrator.death_place}</span>
              <MapPin className="h-3 w-3 flex-shrink-0" />
            </div>
          )}
        </div>

        {/* Bottom border */}
        <div className="absolute bottom-0 left-0 h-1 w-full bg-black"></div>
        <div className="absolute bottom-0 right-0 h-full w-1 bg-black"></div>
      </Card>
    </Link>
  );
}

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
    <div className="mb-8 space-y-4">
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
          className="border-2 border-black pl-4 pr-10 text-right"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={filters.grade === "" ? "default" : "outline"}
          onClick={() => onFilterChange({ ...filters, grade: "" })}
          className="border-2 border-black"
        >
          <Users className="ml-2 h-4 w-4" />
          جميع الدرجات
        </Button>
        {grades.map((grade) => (
          <Button
            key={grade}
            variant={filters.grade === grade ? "default" : "outline"}
            onClick={() => onFilterChange({ ...filters, grade })}
            className="border-2 border-black text-xs"
          >
            {getArabicGrade(grade)}
          </Button>
        ))}
      </div>

      {/* Results count */}
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <Badge className="bg-parchment px-2 py-1 text-black">
          {narratorCount.toLocaleString()} راوي
        </Badge>
        <span>من أصل {totalCount.toLocaleString()} راوي</span>
      </div>
    </div>
  );
}

export default function NarratorGrid({ narrators }: NarratorGridProps) {
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    grade: "",
    hasHadiths: null,
    century: "",
  });
  const [displayLimit, setDisplayLimit] = useState(200); // Start with 200 narrators

  const parentRef = useRef<HTMLDivElement>(null);

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
    for (let i = 0; i < filteredNarrators.length; i += ITEMS_PER_ROW) {
      result.push(filteredNarrators.slice(i, i + ITEMS_PER_ROW));
    }
    return result;
  }, [filteredNarrators]);

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => CARD_HEIGHT + GAP,
    overscan: 3,
  });

  // Check if we can load more narrators
  const canLoadMore =
    !filters.search && !filters.grade && displayLimit < narrators.length;
  const hasMoreResults =
    filters.search || filters.grade
      ? filteredNarrators.length >= 500
      : displayLimit < narrators.length;

  return (
    <div className="w-full">
      <FilterPanel
        filters={filters}
        onFilterChange={setFilters}
        narratorCount={filteredNarrators.length}
        totalCount={narrators.length}
      />

      <div ref={parentRef} className="h-[800px] overflow-auto">
        <div
          className="relative w-full"
          style={{
            height: `${virtualizer.getTotalSize()}px`,
          }}
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
                    <NarratorCard
                      key={narrator.scholar_indx}
                      narrator={narrator}
                    />
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
            onClick={() =>
              setDisplayLimit((prev) => Math.min(prev + 200, narrators.length))
            }
            className="border-2 border-black bg-parchment text-black hover:bg-parchment-dark"
          >
            تحميل المزيد ({Math.min(200, narrators.length - displayLimit)} راوي
            إضافي)
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
