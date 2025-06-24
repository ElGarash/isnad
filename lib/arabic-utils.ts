// Arabic translations and utilities
export const arabicTexts = {
  // Navigation
  backToAllHadiths: "الرجوع إلى جميع الأحاديث",
  browseChapters: "تصفح الفصول",
  readFullHadith: "اقرأ الحديث كاملاً",
  browse: "تصفح",

  // Stats and counts
  hadiths: "أحاديث",
  hadith: "حديث",
  narrators: "رواة",
  narrator: "راوي",
  chapters: "فصول",
  chapter: "فصل",
  available: "متاح",
  results: "النتائج",
  resultsCount: "عدد النتائج",

  // Search and loading states
  searching: "جاري البحث...",
  loading: "جاري التحميل...",
  noResults: "لا توجد نتائج",
  tryDifferentSearch: "جرب تعديل معايير البحث",
  search: "بحث",

  // Search form labels
  bookLabel: "الكتاب",
  chapterLabel: "الباب",
  allChapters: "كل الأبواب",
  hadithTextLabel: "نص الحديث",
  searchInText: "ابحث في نص الحديث...",
  narratorLabel: "الراوي",
  narratorName: "اسم الراوي...",

  // Chapter page
  chapterNumber: "الفصل",
  unknownNarrator: "راوي غير معروف",

  // Numbers and ordinals
  first: "الأول",
  second: "الثاني",
  third: "الثالث",

  // General
  of: "من",
  in: "في",
  and: "و",

  // Hadith specific
  isnad: "الإسناد",
  sanad: "السند",
  hadithText: "نص الحديث",
  explanation: "الشرح",
  grade: "الدرجة",
  book: "الكتاب",
};

// Convert English/Western Arabic numerals to Eastern Arabic numerals
export function toArabicNumerals(num: number | string): string {
  const arabicNumerals = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
  return num
    .toString()
    .replace(/[0-9]/g, (digit) => arabicNumerals[parseInt(digit)]);
}

// Convert Western numbers in text to Arabic numerals
export function convertNumbersInText(text: string): string {
  return text.replace(/\d+/g, (match) => toArabicNumerals(match));
}

// Format count with Arabic text (e.g., "٧ أحاديث")
export function formatArabicCount(
  count: number,
  singular: string,
  plural: string,
): string {
  const arabicCount = toArabicNumerals(count);
  return count === 1
    ? `${arabicCount} ${singular}`
    : `${arabicCount} ${plural}`;
}

// Format chapter title with Arabic number
export function formatChapterTitle(chapterNo: number): string {
  return `${arabicTexts.chapterNumber} ${toArabicNumerals(chapterNo)}`;
}
