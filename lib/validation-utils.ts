import { STATIC_SOURCES, StaticSource } from "./constants";
import { notFound } from "next/navigation";

export function validateAndDecodeSource(source: string): StaticSource {
  const decodedSource = decodeURIComponent(source) as StaticSource;

  if (!STATIC_SOURCES.includes(decodedSource)) {
    notFound();
  }

  return decodedSource;
}

export function validateAndDecodeChapter(chapter: string): string {
  return decodeURIComponent(chapter);
}

// Sanitize source name for file paths
export function sanitizeSourceForPath(source: string): string {
  return source.replace(/\s+/g, "_");
}
