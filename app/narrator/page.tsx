import NarratorGrid from "@/components/narrator-grid";
import { getNarratorsWithHadithsOnly } from "@/lib/sqlite";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "الرواة - جميع رواة الأحاديث",
  description:
    "استعرض جميع رواة الأحاديث النبوية الشريفة مع معلومات مفصلة عن كل راوي",
  openGraph: {
    title: "الرواة - جميع رواة الأحاديث",
    description:
      "استعرض جميع رواة الأحاديث النبوية الشريفة مع معلومات مفصلة عن كل راوي",
    images: [
      {
        url: "/images/og-images/og-narrators.png",
        width: 1200,
        height: 630,
        alt: "جميع رواة الأحاديث",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "الرواة - جميع رواة الأحاديث",
    description:
      "استعرض جميع رواة الأحاديث النبوية الشريفة مع معلومات مفصلة عن كل راوي",
    images: ["/images/og-images/og-narrators.png"],
  },
};

export default async function NarratorsPage() {
  const narrators = getNarratorsWithHadithsOnly();

  return (
    <div className="container mx-auto px-2 py-4 md:px-4 md:py-8">
      <div className="mb-6 md:mb-8">
        <h1 className="mb-3 text-2xl font-bold md:mb-4 md:text-4xl">الرواة</h1>
        <div className="flex flex-col items-start gap-2 text-xs text-gray-600 sm:flex-row sm:items-center sm:gap-4 md:text-sm">
          <span className="inline-block -skew-x-12 transform bg-black px-2 py-1 text-white md:px-3">
            {narrators.length.toLocaleString()} راوي
          </span>
          <span>جميع الرواة في قاعدة البيانات</span>
        </div>
      </div>
      <NarratorGrid narrators={narrators} />
    </div>
  );
}
