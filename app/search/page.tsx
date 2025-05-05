"use client";

import Fuse from "fuse.js";
import { useEffect, useMemo, useState } from "react";

interface HadithSearchItem {
  source: string;
  chapter: string;
  chapter_no: number;
  hadith_no: string;
  text_ar: string;
  text_en: string;
  narrator_name?: string;
}

const PAGE_SIZE = 10;

export default function SearchPage() {
  const [data, setData] = useState<HadithSearchItem[]>([]);
  const [query, setQuery] = useState("");
  const [book, setBook] = useState("");
  const [chapter, setChapter] = useState("");
  const [narrator, setNarrator] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // Load data on mount
  useEffect(() => {
    setLoading(true);
    fetch("/data/hadiths_search_index.json")
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      });
  }, []);

  // Set up Fuse.js
  const fuse = useMemo(() => {
    if (!data.length) return null;
    return new Fuse(data, {
      keys: [
        { name: "source", weight: 0.3 },
        { name: "chapter", weight: 0.2 },
        { name: "hadith_no", weight: 0.2 },
        { name: "text_ar", weight: 0.5 },
        { name: "text_en", weight: 0.3 },
        { name: "narrator_name", weight: 0.3 },
      ],
      includeScore: true,
      threshold: 0.4,
      ignoreLocation: true,
      useExtendedSearch: true,
    });
  }, [data]);

  // Filter/search results
  const filteredResults = useMemo(() => {
    if (!fuse) return [];
    const searchQuery = query.trim();
    const results = fuse.search(searchQuery ? searchQuery : "");
    // Further filter by book, chapter, narrator if set
    const filtered = results
      .map((r) => r.item)
      .filter(
        (item) =>
          (!book || item.source === book) &&
          (!chapter || item.chapter === chapter) &&
          (!narrator ||
            (item.narrator_name && item.narrator_name.includes(narrator))),
      );
    return filtered;
  }, [fuse, query, book, chapter, narrator]);

  // Pagination
  const totalPages = Math.ceil(filteredResults.length / PAGE_SIZE);
  const paginatedResults = filteredResults.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

  // Unique books and chapters for dropdowns
  const books = useMemo(
    () => Array.from(new Set(data.map((d) => d.source))),
    [data],
  );
  const chapters = useMemo(
    () =>
      book
        ? Array.from(
            new Set(
              data.filter((d) => d.source === book).map((d) => d.chapter),
            ),
          )
        : [],
    [data, book],
  );

  // Reset page on filter change
  useEffect(() => {
    setPage(1);
  }, [query, book, chapter, narrator]);

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">بحث في الأحاديث</h1>
      <form className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <input
          className="rounded border p-2"
          type="text"
          placeholder="بحث نصي أو رقم الحديث..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select
          className="rounded border p-2"
          value={book}
          onChange={(e) => setBook(e.target.value)}
        >
          <option value="">كل الكتب</option>
          {books.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
        <select
          className="rounded border p-2"
          value={chapter}
          onChange={(e) => setChapter(e.target.value)}
          disabled={!book}
        >
          <option value="">كل الأبواب</option>
          {chapters.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <input
          className="rounded border p-2"
          type="text"
          placeholder="اسم الراوي..."
          value={narrator}
          onChange={(e) => setNarrator(e.target.value)}
        />
      </form>
      {loading ? (
        <div>جاري التحميل...</div>
      ) : (
        <>
          <div className="mb-4 text-sm text-gray-600">
            عدد النتائج: {filteredResults.length}
          </div>
          <ul className="space-y-4">
            {paginatedResults.map((item, idx) => (
              <li key={idx} className="rounded border bg-white p-4 shadow">
                <div className="mb-2 text-xs text-gray-500">
                  {item.source} | الباب: {item.chapter} | رقم: {item.hadith_no}
                </div>
                <div className="mb-2 text-right text-lg font-bold" dir="rtl">
                  {item.text_ar}
                </div>
                <div className="mb-2 text-sm text-gray-700">{item.text_en}</div>
                {item.narrator_name && (
                  <div className="text-xs text-gray-600">
                    الراوي: {item.narrator_name}
                  </div>
                )}
              </li>
            ))}
          </ul>
          {/* Pagination controls */}
          {totalPages > 1 && (
            <div className="mt-6 flex justify-center gap-2">
              <button
                className="rounded border px-3 py-1 disabled:opacity-50"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                السابق
              </button>
              <span className="px-2">
                صفحة {page} من {totalPages}
              </span>
              <button
                className="rounded border px-3 py-1 disabled:opacity-50"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                التالي
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
