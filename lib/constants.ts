// Common constants and types for the application
export const STATIC_SOURCES = ["Sahih Bukhari"] as const;
export type StaticSource = (typeof STATIC_SOURCES)[number];

// Common metadata defaults
export const DEFAULT_OG_IMAGE = "/images/og-images/og-default.png";
export const DEFAULT_OG_DIMENSIONS = {
  width: 1200,
  height: 630,
} as const;

// Common error messages (in Arabic)
export const ERROR_MESSAGES = {
  chapterNotFound: {
    title: "الفصل غير موجود",
    description: "لم يتم العثور على الفصل المطلوب.",
  },
  sourceNotFound: {
    title: "المصدر غير موجود",
    description: "لم يتم العثور على المصدر المطلوب.",
  },
  hadithNotFound: {
    title: "الحديث غير موجود",
    description: "لم يتم العثور على الحديث المطلوب.",
  },
} as const;
