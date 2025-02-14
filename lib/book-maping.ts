export const bookMap: Record<string, string> = {
  Bukhari: "صحيح البخاري",
} as const;

export const getArabicBook = (book: string): string => {
  return bookMap[book] || book;
};
