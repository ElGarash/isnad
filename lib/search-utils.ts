// Search utility functions for text processing and normalization

// Strip Arabic diacritics and bidirectional marks (same as backend)
export function stripDiacritics(text: string): string {
  if (!text) return text;
  return text.replace(
    /[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u200E\u200F\u202A-\u202E\u2066-\u2069]/g,
    "",
  );
}

// Normalize whitespace (collapse all whitespace to a single space)
export function normalizeWhitespace(str: string): string {
  return str.replace(/\s+/g, " ").trim();
}

// Normalize text for search (strip diacritics and normalize whitespace)
export function normalizeForSearch(text: string): string {
  return normalizeWhitespace(stripDiacritics(text));
}
