import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const cleanName = (text: string) => {
  if (!text) return "";

  return text
    .replace(/[a-zA-Z\-',()]/g, "") // remove English letters and specific punctuation
    .replace(/رضي الله عنه/g, "") // remove the phrase
    .replace(/\s+/g, " ") // replace multiple spaces with single space
    .replace(/\s.\s|\s.$/g, " ") // remove single chars between spaces OR at the end
    .trim();
};

// Convert English numerals to Arabic numerals
export function toArabicNumerals(num: number): string {
  const arabicNumerals = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
  return num
    .toString()
    .replace(/[0-9]/g, (digit) => arabicNumerals[parseInt(digit)]);
}
