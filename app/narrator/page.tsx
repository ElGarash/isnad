import NarratorGrid from "@/components/narrator-grid";
import { getNarrators } from "@/lib/sqlite";
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
        url: "/images/og-images/og-default.png",
        width: 1200,
        height: 630,
        alt: "جميع رواة الأحاديث",
      },
    ],
  },
};

export default async function NarratorsPage() {
  const narrators = getNarrators();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-4 text-4xl font-bold">الرواة</h1>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span className="inline-block -skew-x-12 transform bg-black px-3 py-1 text-white">
            {narrators.length.toLocaleString()} راوي
          </span>
          <span>جميع رواة الأحاديث النبوية الشريفة</span>
        </div>
        <div className="mt-2 rounded-md bg-parchment p-3 text-sm">
          <p>
            🔍 استخدم البحث والفلاتر للعثور على الرواة. يتم عرض 200 راوي في
            البداية مع إمكانية تحميل المزيد.
          </p>
        </div>
      </div>
      <NarratorGrid narrators={narrators} />
    </div>
  );
}
