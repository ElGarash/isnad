"use client";

import HadithList from "@/components/hadith-list";
import { LoadingSpinner } from "@/components/loading-spinner";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { HadithWithFirstNarrator } from "@/lib/sqlite";
import { useDeferredValue, useEffect, useRef, useState } from "react";

// Utility: Strip Arabic diacritics and bidirectional marks (same as backend)
function stripDiacritics(text: string) {
  if (!text) return text;
  return text.replace(
    /[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u200E\u200F\u202A-\u202E\u2066-\u2069]/g,
    "",
  );
}

// Utility: Normalize whitespace (collapse all whitespace to a single space)
function normalizeWhitespace(str: string) {
  return str.replace(/\s+/g, " ").trim();
}

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
      const normNarr = normalizeWhitespace(stripDiacritics(debouncedNarrator));
      filtered = filtered.filter(
        (h) =>
          h.narrator_name &&
          normalizeWhitespace(stripDiacritics(h.narrator_name)).includes(
            normNarr,
          ),
      );
    }
    if (debouncedText) {
      const normText = normalizeWhitespace(stripDiacritics(debouncedText));
      filtered = filtered.filter(
        (h) =>
          h.text_ar &&
          normalizeWhitespace(stripDiacritics(h.text_ar)).includes(normText),
      );
    }
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
          const normNarr = normalizeWhitespace(
            stripDiacritics(debouncedNarrator),
          );
          filtered = filtered.filter(
            (h) =>
              h.narrator_name &&
              normalizeWhitespace(stripDiacritics(h.narrator_name)).includes(
                normNarr,
              ),
          );
        }
        if (debouncedText) {
          const normText = normalizeWhitespace(stripDiacritics(debouncedText));
          filtered = filtered.filter(
            (h) =>
              h.text_ar &&
              normalizeWhitespace(stripDiacritics(h.text_ar)).includes(
                normText,
              ),
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
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">بحث</h1>
      <Card className="mb-6 p-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-end">
          <div className="flex-1">
            <label className="mb-1 block font-bold">نص الحديث (بالعربية)</label>
            <Input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="ابحث في نص الحديث..."
              className="w-full"
              dir="rtl"
            />
          </div>
          <div>
            <label className="mb-1 block font-bold">الكتاب</label>
            <select
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="w-full border px-2 py-1"
            >
              {SOURCES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block font-bold">الباب</label>
            <select
              value={chapter}
              onChange={(e) => setChapter(e.target.value)}
              className="w-full border px-2 py-1"
            >
              <option value="">كل الأبواب</option>
              {chapters.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="mb-1 block font-bold">الراوي</label>
            <Input
              value={narrator}
              onChange={(e) => setNarrator(e.target.value)}
              placeholder="اسم الراوي..."
              className="w-full"
              dir="rtl"
            />
          </div>
        </div>
      </Card>
      <HadithList hadiths={results} />
      <div ref={loaderRef} />
      {loading && <div className="py-4 text-center">جاري التحميل...</div>}
      {!loading && results.length === 0 && (
        <div className="py-4 text-center text-gray-500">لا توجد نتائج</div>
      )}
    </div>
  );
}
