import { Card } from "@/components/ui/card";
import { arabicTexts, toArabicNumerals } from "@/lib/arabic-utils";
import { getArabicSource } from "@/lib/book-mapping";
import { LAYOUT } from "@/lib/layout-constants";
import { HadithWithFirstNarrator } from "@/lib/sqlite";
import { cleanName } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface HadithCardProps {
  hadith: HadithWithFirstNarrator;
  className?: string;
}

export default function HadithCard({
  hadith,
  className = "",
}: HadithCardProps) {
  const router = useRouter();

  return (
    <Link
      href={`/hadith/${encodeURIComponent(hadith.source)}/${hadith.chapter}/${hadith.hadith_no}`}
      hrefLang="ar"
      className={className}
    >
      <Card className="relative m-2 overflow-hidden border-4 border-black">
        <div className="absolute left-0 top-0 z-10 h-24 w-24 -translate-x-12 -translate-y-12 -rotate-45 transform bg-parchment"></div>
        <div className="absolute left-2 top-2 z-20 rotate-45 transform">
          <div className="-rotate-90 transform bg-black px-2 py-1 text-xl font-bold text-parchment">
            {toArabicNumerals(hadith.id)}
          </div>
        </div>
        <div className="p-6 pl-16 pt-10">
          <div className="mb-4 text-right">
            <h3 className="mb-1 inline-block -skew-x-12 transform bg-black px-2 py-1 text-xl font-bold text-white">
              {hadith.narrator_name || arabicTexts.unknownNarrator}
            </h3>
            <div className="mt-2 text-sm text-gray-600">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/hadith/${encodeURIComponent(hadith.source)}`);
                }}
                className="mb-2 ml-2 inline-block cursor-pointer bg-gray-200 px-2 py-1 transition-colors hover:bg-gray-300"
              >
                {getArabicSource(hadith.source)}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(
                    `/hadith/${encodeURIComponent(hadith.source)}/${encodeURIComponent(hadith.chapter)}`,
                  );
                }}
                className="inline-block cursor-pointer bg-blue-100 px-2 py-1 transition-colors hover:bg-blue-200"
              >
                {cleanName(hadith.chapter)}
              </button>
            </div>
          </div>
          <div className="relative">
            <div className="absolute bottom-0 right-0 top-0 w-1 bg-black"></div>
            <p
              className="overflow-hidden whitespace-pre-wrap break-words pr-4 text-right leading-relaxed"
              style={{
                maxHeight: `${LAYOUT.HADITH_CARD_HEIGHT - 140}px`,
                display: "-webkit-box",
                WebkitLineClamp: "3",
                WebkitBoxOrient: "vertical",
              }}
            >
              {hadith.text_ar}
            </p>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 h-1 w-full bg-black"></div>
        <div className="absolute bottom-0 right-0 h-full w-1 bg-black"></div>
      </Card>
    </Link>
  );
}
