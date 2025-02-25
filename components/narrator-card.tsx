import { Card } from "@/components/ui/card";
import { getArabicGrade } from "@/lib/grade-mapping";
import type { Narrator } from "@/lib/sqlite";
import { ArrowUpRight, Calendar, MapPin } from "lucide-react";
import Link from "next/link";

const formatDate = (date: string, type: "hijri" | "gregorian") => {
  const calendar = type === "hijri" ? "هجريا" : "ميلاديا";
  return (date === null ? "غير معلوم" : `${date}`) + ` (${calendar})`;
};

export const NarratorCard = ({
  name,
  grade,
  birth_date_hijri,
  birth_date_gregorian,
  death_date_hijri,
  death_date_gregorian,
  death_place,
}: Narrator) => {
  return (
    <Card className="relative h-[140px] w-[120px] cursor-grab overflow-hidden border-2 border-isnad-primary bg-isnad-background p-2 text-[8px] shadow-[2px_2px_0px_0px_theme(colors.isnad.primary)] transition-all duration-300 hover:shadow-[4px_4px_0px_0px_theme(colors.isnad.primary)] active:cursor-grabbing">
      <div className="mb-1">
        <h2 className="text-[10px] font-bold leading-tight text-isnad-primary">
          {name}
        </h2>
        <div className="font-arabic mt-2 inline-flex min-h-[16px] items-center justify-center border border-isnad-primary bg-isnad-secondary px-1 py-0.5 text-[6px] text-isnad-primary shadow-[1px_1px_0px_0px_theme(colors.isnad.primary)]">
          {getArabicGrade(grade)}
        </div>
      </div>

      <div className="mb-2 mt-2 grid grid-cols-2 gap-1">
        <div>
          <div className="flex items-center justify-start text-[6px] font-bold text-isnad-primary">
            <Calendar className="h-2 w-2" />
            <span className="mr-0.5">الوفاة</span>
          </div>
          <div dir="rtl" className="text-[5px] text-isnad-primary">
            <div>{formatDate(death_date_hijri, "hijri")}</div>
            <div>{formatDate(death_date_gregorian, "gregorian")}</div>
          </div>
        </div>
        <div>
          <div className="flex items-center justify-start text-[6px] font-bold text-isnad-primary">
            <Calendar className="h-2 w-2" />
            <span className="mr-0.5">الولادة</span>
          </div>
          <div dir="rtl" className="text-[5px] text-isnad-primary">
            <div>{formatDate(birth_date_hijri, "hijri")}</div>
            <div>{formatDate(birth_date_gregorian, "gregorian")}</div>
          </div>
        </div>
      </div>
      {death_place && (
        <div>
          <div className="flex items-center justify-start text-[6px] font-bold text-isnad-primary">
            <MapPin className="h-2 w-2" />
            <span className="mr-0.5">مكان الوفاة</span>
          </div>
          <p className="truncate text-[6px] text-isnad-primary">
            {death_place}
          </p>
        </div>
      )}
      <Link
        href={`/narrator/${name}`}
        className="absolute bottom-1 left-1 flex items-center bg-isnad-primary px-1 py-0.5 text-[6px] font-bold text-isnad-background transition-colors hover:bg-isnad-primary-hover"
      >
        المزيد
        <ArrowUpRight className="mr-0.5 h-2 w-2" />
      </Link>
      <div className="absolute bottom-0 left-0 -z-10 h-4 w-4 -translate-x-2 translate-y-2 rotate-45 transform bg-isnad-secondary opacity-50" />
    </Card>
  );
};

export default NarratorCard;
