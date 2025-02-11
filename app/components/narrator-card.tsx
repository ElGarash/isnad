import { Card } from "@/components/ui/card";
import type { Narrator } from "@/lib/sqlite";
import { Calendar, Hash, MapPin, Users } from "lucide-react";

const formatDate = (date: string, type: "hijri" | "gregorian") => {
  const calendar = type === "hijri" ? "هجريا" : "ميلاديا";
  return (date === "NA" ? "غير معلوم" : `${date}`) + ` (${calendar})`;
};

const cleanName = (text: string) => {
  return text
    .replace(/[a-zA-Z\-',()]/g, "") // remove English letters and specific punctuation
    .replace(/رضي الله عنه/g, "") // remove the phrase
    .replace(/\s+/g, " ") // replace multiple spaces with single space
    .trim();
};

export const NarratorCard = ({
  scholar_indx,
  name,
  grade,
  parents,
  birth_date_hijri,
  birth_date_gregorian,
  death_date_hijri,
  death_date_gregorian,
  death_place,
}: Narrator) => {
  death_date_hijri === "NA" ? "غير معلوم" : `${death_date_hijri} `;
  return (
    <Card className="w-[120px] h-[100px] border-2 border-[#1B2B3B] shadow-[2px_2px_0px_0px_rgba(27,43,59,1)] hover:shadow-[4px_4px_0px_0px_rgba(27,43,59,1)] transition-all duration-300 overflow-hidden bg-[#E6DED1] relative p-2 text-[8px]">
      <div className="absolute top-1 left-1 bg-[#1B2B3B] text-[#E6DED1] px-1 text-[6px] font-bold">
        {scholar_indx}
        <Hash className="inline-block w-2 h-2 mr-0.5" />
      </div>
      <div className=" mb-1 mt-3">
        <h2 className="text-[10px] font-bold text-[#1B2B3B] leading-tight">
          {cleanName(name)}
        </h2>
        <div className="text-[6px] text-[#C49B66] font-arabic">{grade}</div>
      </div>
      {parents !== "NA" && (
        <div className="mb-1">
          <div className="text-[6px] font-bold text-[#1B2B3B] flex items-center justify-start">
            <Users className="w-2 h-2" />
            <span className="mr-0.5">النسب</span>
          </div>
          <p className="text-[6px] text-[#1B2B3B] truncate">{parents}</p>
        </div>
      )}
      <div className="grid grid-cols-2 gap-1 mb-1">
        <div>
          <div className="text-[6px] font-bold text-[#1B2B3B] flex items-center justify-start">
            <Calendar className="w-2 h-2" />
            <span className="mr-0.5">الوفاة</span>
          </div>
          <div dir="rtl" className="text-[5px] text-[#1B2B3B]">
            <div>{formatDate(death_date_hijri, "hijri")}</div>
            <div>{formatDate(death_date_gregorian, "gregorian")}</div>
          </div>
        </div>
        <div>
          <div className="text-[6px] font-bold text-[#1B2B3B] flex items-center justify-start">
            <Calendar className="w-2 h-2" />
            <span className="mr-0.5">الولادة</span>
          </div>
          <div dir="rtl" className="text-[5px] text-[#1B2B3B]">
            <div>{formatDate(birth_date_hijri, "hijri")}</div>
            <div>{formatDate(birth_date_gregorian, "gregorian")}</div>
          </div>
        </div>
      </div>
      {death_place && (
        <div>
          <div className="text-[6px] font-bold text-[#1B2B3B] flex items-center justify-start">
            <MapPin className="w-2 h-2" />
            <span className="mr-0.5">مكان الوفاة</span>
          </div>
          <p className="text-[6px] text-[#1B2B3B] truncate">{death_place}</p>
        </div>
      )}
      {/* Decorative Element */}
      <div className="absolute bottom-0 left-0 w-4 h-4 bg-[#C49B66] transform rotate-45 -translate-x-2 translate-y-2 opacity-50" />
    </Card>
  );
};

export default NarratorCard;
