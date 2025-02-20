export const bookMap: Record<string, string> = {
  "Sahih Bukhari": "صحيح البخاري",
  "Sahih Muslim": "صحيح مسلم",
} as const;

export const getArabicBook = (book: string): string => {
  return bookMap[book] || book;
};
