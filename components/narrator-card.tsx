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
  death_date_hijri === null ? "غير معلوم" : `${death_date_hijri} `;
  return (
    <Card className="w-[120px] h-[140px] border-2 border-isnad-primary shadow-[2px_2px_0px_0px_theme(colors.isnad.primary)] hover:shadow-[4px_4px_0px_0px_theme(colors.isnad.primary)] transition-all duration-300 overflow-hidden bg-isnad-background relative p-2 text-[8px] cursor-grab active:cursor-grabbing">
      <div className=" mb-1">
        <h2 className="text-[10px] font-bold text-isnad-primary leading-tight">
          {name}
        </h2>
        <div className="inline-block text-[6px] text-isnad-primary font-arabic border border-isnad-primary shadow-[1px_1px_0px_0px_theme(colors.isnad.primary)] bg-isnad-secondary px-1 py-0.5 mt-2">
          {getArabicGrade(grade)}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-1 mb-2 mt-2">
        <div>
          <div className="text-[6px] font-bold text-isnad-primary flex items-center justify-start">
            <Calendar className="w-2 h-2" />
            <span className="mr-0.5">الوفاة</span>
          </div>
          <div dir="rtl" className="text-[5px] text-isnad-primary">
            <div>{formatDate(death_date_hijri, "hijri")}</div>
            <div>{formatDate(death_date_gregorian, "gregorian")}</div>
          </div>
        </div>
        <div>
          <div className="text-[6px] font-bold text-isnad-primary flex items-center justify-start">
            <Calendar className="w-2 h-2" />
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
          <div className="text-[6px] font-bold text-isnad-primary flex items-center justify-start">
            <MapPin className="w-2 h-2" />
            <span className="mr-0.5">مكان الوفاة</span>
          </div>
          <p className="text-[6px] text-isnad-primary truncate">
            {death_place}
          </p>
        </div>
      )}
      <Link
        href={`/narrator/${name}`}
        className="absolute bottom-1 left-1 bg-isnad-primary text-isnad-background px-1 py-0.5 text-[6px] font-bold flex items-center hover:bg-isnad-primary-hover transition-colors"
      >
        المزيد
        <ArrowUpRight className="w-2 h-2 mr-0.5" />
      </Link>
      <div className="absolute bottom-0 left-0 w-4 h-4 bg-isnad-secondary transform rotate-45 -translate-x-2 translate-y-2 opacity-50 -z-10" />
    </Card>
  );
};

export default NarratorCard;
