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
    .trim();
};
