"use client";

import hadithsBukhari from "../../data/hadiths_search_bukhari.json";
import hadithsMuslim from "../../data/hadiths_search_muslim.json";
import Fuse from "fuse.js";
import Link from "next/link";
import {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from "react";

interface HadithSearchItem {
  source: string;
  chapter: string;
  chapter_no: number;
  hadith_no: string;
  text_ar: string;
  narrator_name?: string;
}

const PAGE_SIZE = 10;
const BOOK_DATA: Record<string, HadithSearchItem[]> = {
  "Sahih Bukhari": hadithsBukhari as HadithSearchItem[],
  "Sahih Muslim": hadithsMuslim as HadithSearchItem[],
};

// Worker-like function that runs search in a separate tick of the event loop
const runAsyncSearch = (
  fuse: Fuse<HadithSearchItem> | null,
  query: string,
  chapter: string,
  narrator: string,
  data: HadithSearchItem[],
) => {
  return new Promise<HadithSearchItem[]>((resolve) => {
    // Use setTimeout to move this work off the main thread's current tick
    setTimeout(() => {
      if (!fuse) {
        resolve(
          chapter || narrator
            ? data.filter(
                (item) =>
                  (!chapter || item.chapter === chapter) &&
                  (!narrator ||
                    (item.narrator_name &&
                      item.narrator_name.includes(narrator))),
              )
            : data,
        );
        return;
      }

      const searchQuery = query.trim();

      // Skip search if no query (just use filters)
      if (!searchQuery && !chapter && !narrator) {
        resolve(data);
        return;
      }

      // Skip expensive search if only using filters
      if (!searchQuery && (chapter || narrator)) {
        resolve(
          data.filter(
            (item) =>
              (!chapter || item.chapter === chapter) &&
              (!narrator ||
                (item.narrator_name && item.narrator_name.includes(narrator))),
          ),
        );
        return;
      }

      // Run the actual search
      const results = fuse.search(searchQuery);
      const filtered = results
        .map((r) => r.item)
        .filter(
          (item) =>
            (!chapter || item.chapter === chapter) &&
            (!narrator ||
              (item.narrator_name && item.narrator_name.includes(narrator))),
        );

      resolve(filtered);
    }, 0);
  });
};

export default function SearchPage() {
  const [book, setBook] = useState("");
  const [data, setData] = useState<HadithSearchItem[]>([]);
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query); // Defer the expensive work
  const [chapter, setChapter] = useState("");
  const [narrator, setNarrator] = useState("");
  const [page, setPage] = useState(1);
  const [loading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<HadithSearchItem[]>([]);

  // Lazy-load the selected book's JSON file
  useEffect(() => {
    if (!book) {
      setData([]);
      setResults([]);
      return;
    }
    setData(BOOK_DATA[book] || []);
  }, [book]);

  // Set up Fuse.js with optimized options
  const fuse = useMemo(() => {
    if (!data.length) return null;
    return new Fuse(data, {
      keys: [
        { name: "hadith_no", weight: 0.3 }, // Prioritize hadith numbers
        { name: "text_ar", weight: 0.5 },
        { name: "narrator_name", weight: 0.3 },
      ],
      includeScore: true,
      threshold: 0.4,
      ignoreLocation: true, // Important for Arabic text
      minMatchCharLength: 2, // Reduce false positives
      useExtendedSearch: true,
      // Avoid excessive processing for long texts
      getFn: (obj, path) => {
        const value = obj[path as keyof HadithSearchItem] as string;
        // Limit the search text length to improve performance
        return path === "text_ar" && value?.length > 300
          ? value.substring(0, 300)
          : value;
      },
    });
  }, [data]);

  // Debounce and run search asynchronously
  useEffect(() => {
    if (!book) return;

    // Skip if there's no data yet
    if (!data.length) return;

    // Show searching state
    setIsSearching(true);

    // For race condition prevention
    let isCurrent = true;

    // Run search in "background"
    runAsyncSearch(fuse, deferredQuery, chapter, narrator, data).then(
      (searchResults) => {
        if (isCurrent) {
          setResults(searchResults);
          setIsSearching(false);
        }
      },
    );

    return () => {
      isCurrent = false;
    };
  }, [fuse, deferredQuery, chapter, narrator, data, book]);

  // Pagination calculations - done after search is complete
  const totalPages = Math.ceil(results.length / PAGE_SIZE);
  const paginatedResults = useMemo(() => {
    return results.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  }, [results, page]);

  // Unique chapters for dropdown
  const chapters = useMemo(
    () => (book ? Array.from(new Set(data.map((d) => d.chapter))) : []),
    [data, book],
  );

  // Reset page on filter change
  useEffect(() => {
    setPage(1);
  }, [query, book, chapter, narrator]);

  // Event handlers with callbacks
  const handleQueryChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setQuery(e.target.value);
    },
    [],
  );

  const handleChapterChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setChapter(e.target.value);
    },
    [],
  );

  const handleNarratorChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setNarrator(e.target.value);
    },
    [],
  );

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">بحث في الأحاديث</h1>
      <form className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <select
          className="rounded border p-2"
          value={book}
          onChange={(e) => setBook(e.target.value)}
        >
          <option value="">اختر الكتاب</option>
          <option value="Sahih Bukhari">صحيح البخاري</option>
          <option value="Sahih Muslim">صحيح مسلم</option>
        </select>
        <input
          className="rounded border p-2"
          type="text"
          placeholder="بحث نصي أو رقم الحديث..."
          value={query}
          onChange={handleQueryChange}
          disabled={!book}
        />
        <select
          className="rounded border p-2"
          value={chapter}
          onChange={handleChapterChange}
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
          onChange={handleNarratorChange}
          disabled={!book}
        />
      </form>
      {loading ? (
        <div>جاري التحميل...</div>
      ) : (
        <>
          {book && (
            <div className="mb-4 text-sm text-gray-600">
              {isSearching ? (
                <span>جاري البحث...</span>
              ) : (
                <span>عدد النتائج: {results.length}</span>
              )}
            </div>
          )}
          <ul className="space-y-4">
            {paginatedResults.map((item) => (
              <li
                key={`${item.source}-${item.chapter}-${item.hadith_no}`}
                className="rounded border bg-white p-4 shadow"
              >
                <div className="mb-2 text-xs text-gray-500">
                  {item.source} | الباب: {item.chapter} | رقم: {item.hadith_no}
                </div>
                <Link
                  href={`/hadith/${encodeURIComponent(item.source)}/${encodeURIComponent(item.chapter)}/${encodeURIComponent(item.hadith_no)}`}
                  className="mb-2 block text-right text-lg font-bold text-blue-700 hover:underline"
                  dir="rtl"
                >
                  {item.text_ar}
                </Link>
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
