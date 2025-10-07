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
      <Card className="relative overflow-hidden border-4 border-black">
        {/* Decorative corner - hidden on very small screens */}
        <div className="absolute left-0 top-0 z-10 hidden h-16 w-16 -translate-x-8 -translate-y-8 -rotate-45 transform bg-parchment sm:block md:h-24 md:w-24 md:-translate-x-12 md:-translate-y-12"></div>
        <div className="absolute left-1 top-1 z-20 hidden rotate-45 transform sm:block md:left-2 md:top-2">
          <div className="-rotate-90 transform bg-black px-1.5 py-0.5 text-base font-bold text-parchment md:px-2 md:py-1 md:text-xl">
            {toArabicNumerals(hadith.id)}
          </div>
        </div>
        <div className="p-4 sm:p-6 sm:pl-12 sm:pt-8 md:pl-16 md:pt-10">
          {/* Mobile ID badge - only visible on small screens */}
          <div className="mb-3 text-right sm:hidden">
            <span className="inline-block bg-black px-2 py-1 text-sm font-bold text-parchment">
              {toArabicNumerals(hadith.id)}
            </span>
          </div>

          <div className="mb-4 text-right">
            <h3 className="mb-1 inline-block -skew-x-12 transform bg-black px-2 py-1 text-lg font-bold text-white md:text-xl">
              {hadith.narrator_name || arabicTexts.unknownNarrator}
            </h3>
            <div className="mt-2 flex flex-wrap items-start justify-start gap-2 text-xs text-gray-600 md:text-sm">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/hadith/${encodeURIComponent(hadith.source)}`);
                }}
                className="inline-block cursor-pointer bg-gray-200 px-2 py-1 text-right transition-colors hover:bg-gray-300"
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
                className="inline-block cursor-pointer bg-blue-100 px-2 py-1 text-right transition-colors hover:bg-blue-200"
              >
                {cleanName(hadith.chapter)}
              </button>
            </div>
          </div>
          <div className="relative">
            <div className="absolute bottom-0 right-0 top-0 w-1 bg-black"></div>
            <p
              className="overflow-hidden whitespace-pre-wrap break-words pr-4 text-right text-sm leading-relaxed md:text-base"
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
