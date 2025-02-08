import { getHadiths } from "../lib/sqlite";

const hadiths = getHadiths(1);
console.log("Example URL:", `/hadith/${hadiths[0].source}/${hadiths[0].chapter_no}/${hadiths[0].hadith_no}`);
console.log("\nFull hadith record:", hadiths[0]);
