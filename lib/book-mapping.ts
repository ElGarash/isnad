export const bookMap: Record<string, string> = {
  "Jami' al-Tirmidhi": "جامع الترمذي",
  "Sahih Bukhari": "صحيح البخاري",
  "Sahih Muslim": "صحيح مسلم",
  "Sunan Abi Da'ud": "سنن أبي داود",
  "Sunan Ibn Majah": "سنن ابن ماجه",
  "Sunan an-Nasa'i": "سنن النسائي",
} as const;

export const getArabicSource = (book: string): string => {
  return bookMap[book];
};
