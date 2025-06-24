"use client";

import HadithList from "@/components/hadith-list";
import { LoadingSpinner } from "@/components/loading-spinner";
import { arabicTexts, toArabicNumerals } from "@/lib/arabic-utils";
import { normalizeForSearch } from "@/lib/search-utils";
import type { HadithWithFirstNarrator } from "@/lib/sqlite";
import { useDeferredValue, useEffect, useRef, useState } from "react";

const SOURCES = ["Sahih Bukhari", "Sahih Muslim"];

function useDebouncedValue<T>(value: T, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function SearchPage() {
  const [allHadiths, setAllHadiths] = useState<HadithWithFirstNarrator[]>([]);
  const [text, setText] = useState("");
  const [source, setSource] = useState(SOURCES[0]);
  const [chapter, setChapter] = useState("");
  const [narrator, setNarrator] = useState("");
  const [results, setResults] = useState<HadithWithFirstNarrator[]>([]);
  const [totalCount, setTotalCount] = useState(0); // Track total filtered count
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const limit = 30;
  const [initializing, setInitializing] = useState(true);

  // For chapter dropdown
  const [chapters, setChapters] = useState<string[]>([]);
  useEffect(() => {
    // Extract chapters from allHadiths for the selected source
    const chs = Array.from(
      new Set(
        allHadiths.filter((h) => h.source === source).map((h) => h.chapter),
      ),
    );
    setChapters(chs);
  }, [source, allHadiths]);

  // Load hadiths.json once
  useEffect(() => {
    setLoading(true);
    setInitializing(true);
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
    fetch(`${basePath}/hadiths.json`)
      .then((res) => res.json())
      .then((data) => {
        setAllHadiths(data);
        setLoading(false);
        setInitializing(false);
      });
  }, []);

  // Debounced and deferred search
  const deferredText = useDeferredValue(text);
  const debouncedText = useDebouncedValue(deferredText, 500);
  const deferredNarrator = useDeferredValue(narrator);
  const debouncedNarrator = useDebouncedValue(deferredNarrator, 500);

  // Filter hadiths client-side (robust: normalize whitespace & strip diacritics)
  useEffect(() => {
    setLoading(true);
    setPage(0);
    setHasMore(true);
    let filtered = allHadiths;
    if (source) filtered = filtered.filter((h) => h.source === source);
    if (chapter) filtered = filtered.filter((h) => h.chapter === chapter);
    if (debouncedNarrator) {
      const normNarr = normalizeForSearch(debouncedNarrator);
      filtered = filtered.filter(
        (h) =>
          h.narrator_name &&
          normalizeForSearch(h.narrator_name).includes(normNarr),
      );
    }
    if (debouncedText) {
      const normText = normalizeForSearch(debouncedText);
      filtered = filtered.filter(
        (h) => h.text_ar && normalizeForSearch(h.text_ar).includes(normText),
      );
    }

    // Set the total count and initial results
    setTotalCount(filtered.length);
    setResults(filtered.slice(0, limit));
    setHasMore(filtered.length > limit);
    setLoading(false);
  }, [allHadiths, debouncedText, source, chapter, debouncedNarrator]);

  // Infinite scroll (with robust normalization)
  const loaderRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!hasMore || loading) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setLoading(true);
        let filtered = allHadiths;
        if (source) filtered = filtered.filter((h) => h.source === source);
        if (chapter) filtered = filtered.filter((h) => h.chapter === chapter);
        if (debouncedNarrator) {
          const normNarr = normalizeForSearch(debouncedNarrator);
          filtered = filtered.filter(
            (h) =>
              h.narrator_name &&
              normalizeForSearch(h.narrator_name).includes(normNarr),
          );
        }
        if (debouncedText) {
          const normText = normalizeForSearch(debouncedText);
          filtered = filtered.filter(
            (h) =>
              h.text_ar && normalizeForSearch(h.text_ar).includes(normText),
          );
        }
        const next = filtered.slice((page + 1) * limit, (page + 2) * limit);
        setResults((prev) => [...prev, ...next]);
        setHasMore(filtered.length > (page + 2) * limit);
        setPage((p) => p + 1);
        setLoading(false);
      }
    });
    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [
    hasMore,
    loading,
    allHadiths,
    debouncedText,
    source,
    chapter,
    debouncedNarrator,
    page,
  ]);

  if (initializing) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Search Form with brutalist card design */}
      <div className="relative mx-16 mb-4 overflow-hidden border-4 border-black bg-parchment">
        {/* Decorative corner */}
        <div className="absolute left-0 top-0 z-10 h-16 w-16 -translate-x-8 -translate-y-8 -rotate-45 transform bg-parchment"></div>
        <div className="absolute left-1 top-1 z-20 rotate-45 transform">
          <div className="-rotate-90 transform bg-black px-2 py-1 text-sm font-bold text-parchment">
            {arabicTexts.search}
          </div>
        </div>

        {/* Form content */}
        <form className="p-4 pl-12 pt-8">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Source Selection */}
            <div>
              <label className="mb-2 inline-block -skew-x-6 transform bg-black px-2 py-1 text-xs font-bold text-white">
                {arabicTexts.bookLabel}
              </label>
              <select
                className="w-full border-2 border-black bg-white p-2 text-right text-sm font-medium focus:bg-parchment focus:outline-none"
                value={source}
                onChange={(e) => setSource(e.target.value)}
              >
                <option value="Sahih Bukhari">صحيح البخاري</option>
                <option value="Sahih Muslim">صحيح مسلم</option>
              </select>
            </div>

            {/* Chapter Selection */}
            <div>
              <label className="mb-2 inline-block -skew-x-6 transform bg-black px-2 py-1 text-xs font-bold text-white">
                {arabicTexts.chapterLabel}
              </label>
              <select
                className="w-full border-2 border-black bg-white p-2 text-right text-sm font-medium focus:bg-parchment focus:outline-none"
                value={chapter}
                onChange={(e) => setChapter(e.target.value)}
              >
                <option value="">{arabicTexts.allChapters}</option>
                {chapters.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Text Search */}
            <div>
              <label className="mb-2 inline-block -skew-x-6 transform bg-black px-2 py-1 text-xs font-bold text-white">
                {arabicTexts.hadithTextLabel}
              </label>
              <input
                className="w-full border-2 border-black bg-white p-2 text-right text-sm font-medium focus:bg-parchment focus:outline-none"
                type="text"
                placeholder={arabicTexts.searchInText}
                value={text}
                onChange={(e) => setText(e.target.value)}
                dir="rtl"
              />
            </div>

            {/* Narrator Search */}
            <div>
              <label className="mb-2 inline-block -skew-x-6 transform bg-black px-2 py-1 text-xs font-bold text-white">
                {arabicTexts.narratorLabel}
              </label>
              <input
                className="w-full border-2 border-black bg-white p-2 text-right text-sm font-medium focus:bg-parchment focus:outline-none"
                type="text"
                placeholder={arabicTexts.narratorName}
                value={narrator}
                onChange={(e) => setNarrator(e.target.value)}
                dir="rtl"
              />
            </div>
          </div>{" "}
          {/* Results Info integrated into the search card */}
          <div className="mt-4 border-t-2 border-black bg-parchment px-4 py-2">
            <div className="text-right text-sm font-bold">
              {loading ? (
                <span>🔍 {arabicTexts.searching}</span>
              ) : (
                <span>
                  📊 {arabicTexts.resultsCount}: {toArabicNumerals(totalCount)}
                </span>
              )}
            </div>
          </div>
        </form>

        {/* Bottom border decorations */}
        <div className="absolute bottom-0 left-0 h-1 w-full bg-black"></div>
        <div className="absolute bottom-0 right-0 h-full w-1 bg-black"></div>
      </div>

      {/* Results List */}
      <HadithList hadiths={results} />

      <div ref={loaderRef} />

      {/* Loading state with brutalist styling */}
      {loading && (
        <div className="py-8 text-center">
          <div className="inline-block border-4 border-black bg-parchment px-6 py-4">
            <div className="animate-pulse text-xl font-bold">
              ⏳ {arabicTexts.loading}
            </div>
          </div>
        </div>
      )}

      {/* No results state with brutalist styling */}
      {!loading && totalCount === 0 && (
        <div className="py-8 text-center">
          <div className="inline-block border-4 border-black bg-white px-8 py-6">
            <div className="text-2xl font-bold text-gray-700">🔍</div>
            <div className="mt-2 text-lg font-bold text-gray-700">
              {arabicTexts.noResults}
            </div>
            <div className="mt-1 text-sm text-gray-500">
              {arabicTexts.tryDifferentSearch}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
