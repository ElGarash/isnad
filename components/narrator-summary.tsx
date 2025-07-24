import BrutalistCard from "@/components/brutalist-card";
import { getArabicGrade } from "@/lib/grade-mapping";
import { Narrator } from "@/lib/sqlite";
import { BabyIcon, MapPinIcon, SkullIcon } from "lucide-react";

export function Summary({ narrator }: { narrator: Narrator }) {
  return (
    <BrutalistCard className="flex h-80 flex-col gap-4 p-4">
      {/* Narrator Name */}
      <div className="flex flex-col gap-2">
        <h3 className="line-clamp-2 text-right text-lg font-bold leading-tight text-navy">
          {narrator.name}
        </h3>
        <div className="h-1 w-full bg-parchment"></div>
      </div>

      {/* Grade */}
      <div className="flex items-center justify-start gap-2">
        <span className="text-sm font-bold">الدرجة</span>
        <div className="inline-flex min-h-[24px] items-center justify-center border-2 border-navy bg-parchment px-2 py-1 text-sm font-bold shadow-[2px_2px_0px_0px_theme(colors.navy)]">
          {getArabicGrade(narrator.grade)}
        </div>
      </div>

      {/* Dates */}
      <div className="flex flex-1 flex-col gap-2">
        <h2 className="text-lg font-bold">تواريخ</h2>
        <div className="flex flex-col gap-1 text-sm">
          {(narrator.birth_date_hijri || narrator.birth_date_gregorian) && (
            <div className="flex items-center gap-2">
              <BabyIcon className="h-4 w-4" />
              <span className="font-bold">الولادة:</span>
              <span className="text-xs">
                {narrator.birth_date_hijri && `${narrator.birth_date_hijri} هـ`}
                {narrator.birth_date_hijri &&
                  narrator.birth_date_gregorian &&
                  " / "}
                {narrator.birth_date_gregorian &&
                  `${narrator.birth_date_gregorian} م`}
              </span>
            </div>
          )}

          {(narrator.death_date_hijri || narrator.death_date_gregorian) && (
            <div className="flex items-center gap-2">
              <SkullIcon className="h-4 w-4" />
              <span className="font-bold">الوفاة:</span>
              <span className="text-xs">
                {narrator.death_date_hijri && `${narrator.death_date_hijri} هـ`}
                {narrator.death_date_hijri &&
                  narrator.death_date_gregorian &&
                  " / "}
                {narrator.death_date_gregorian &&
                  `${narrator.death_date_gregorian} م`}
              </span>
            </div>
          )}

          {narrator.death_place && (
            <div className="flex items-center gap-2">
              <MapPinIcon className="h-4 w-4" />
              <span className="font-bold">المكان:</span>
              <span className="truncate text-xs">{narrator.death_place}</span>
            </div>
          )}
        </div>
      </div>
    </BrutalistCard>
  );
}
