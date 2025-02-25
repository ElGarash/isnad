import { Card } from "@/components/ui/card";
import { getArabicGrade } from "@/lib/grade-mapping";
import type { Narrator } from "@/lib/sqlite";
import {
  ArrowUpRightIcon,
  BabyIcon,
  CircleHelpIcon,
  MapPinIcon,
  SkullIcon,
} from "lucide-react";
import Link from "next/link";

const Date = ({ value }: { value: string | undefined }) => {
  return value ? (
    <span className="inline-block w-3 text-center text-[5px]/tight">
      {value}
    </span>
  ) : (
    <CircleHelpIcon className="inline-block h-[5px] w-3" />
  );
};

const DateDisplay = ({
  label,
  icon: Icon,
  hijri,
  gregorian,
}: {
  label: string;
  icon: React.ElementType;
  hijri: string | undefined;
  gregorian: string | undefined;
}) => (
  <div className="flex flex-col gap-0.5">
    <div className="flex items-center gap-0.5 text-[6px]/tight font-bold text-isnad-primary">
      <Icon className="h-2 w-3" />
      <span className="mt-0.5">{label}</span>
    </div>
    <div className="flex flex-col gap-0.5 text-[5px] text-isnad-primary">
      <div className="flex items-center gap-0.5">
        <Date value={hijri} />
        <span className="text-[5px]/tight">(هجريا)</span>
      </div>
      <div className="flex items-center gap-0.5">
        <Date value={gregorian} />
        <span className="text-[5px]/tight">(ميلاديا)</span>
      </div>
    </div>
  </div>
);

const LocationDisplay = ({ place }: { place: string }) => (
  <div className="flex flex-col gap-0.5">
    <div className="flex items-center gap-0.5 text-[6px]/tight font-bold text-isnad-primary">
      <MapPinIcon className="h-2 w-3" />
      <span>مكان الوفاة</span>
    </div>
    <div className="flex gap-0.5 truncate text-[5px] text-isnad-primary">
      <span className="w-3"></span>
      <span>{place}</span>
    </div>
  </div>
);

const GradeDisplay = ({ grade }: { grade: string }) => (
  <div className="font-arabic mt-2 inline-flex min-h-[16px] items-center justify-center border border-isnad-primary bg-isnad-secondary px-1 py-0.5 text-[6px] text-isnad-primary shadow-[1px_1px_0px_0px_theme(colors.isnad.primary)]">
    {getArabicGrade(grade)}
  </div>
);

const HeaderSection = ({ name, grade }: { name: string; grade: string }) => (
  <div className="mb-1">
    <h2 className="text-[10px] font-bold leading-tight text-isnad-primary">
      {name}
    </h2>
    <GradeDisplay grade={grade} />
  </div>
);

const InfoSection = ({
  birth_dates,
  death_dates,
  death_place,
}: {
  birth_dates: { hijri?: string; gregorian?: string };
  death_dates: { hijri?: string; gregorian?: string };
  death_place?: string;
}) => (
  <>
    <div className="mb-2 mt-2 grid grid-cols-2 gap-0.5">
      <DateDisplay
        label="الولادة"
        icon={BabyIcon}
        hijri={birth_dates.hijri}
        gregorian={birth_dates.gregorian}
      />
      <DateDisplay
        label="الوفاة"
        icon={SkullIcon}
        hijri={death_dates.hijri}
        gregorian={death_dates.gregorian}
      />
    </div>
    {death_place && <LocationDisplay place={death_place} />}
  </>
);

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
      <HeaderSection name={name} grade={grade} />
      <InfoSection
        birth_dates={{
          hijri: birth_date_hijri,
          gregorian: birth_date_gregorian,
        }}
        death_dates={{
          hijri: death_date_hijri,
          gregorian: death_date_gregorian,
        }}
        death_place={death_place}
      />
      <Link
        href={`/narrator/${name}`}
        className="absolute bottom-1 left-1 flex items-center bg-isnad-primary px-1 py-0.5 text-[6px] font-bold text-isnad-background transition-colors hover:bg-isnad-primary-hover"
      >
        المزيد
        <ArrowUpRightIcon className="mr-0.5 h-2 w-2" />
      </Link>
      <div className="absolute bottom-0 left-0 -z-10 h-4 w-4 -translate-x-2 translate-y-2 rotate-45 transform bg-isnad-secondary opacity-50" />
    </Card>
  );
};

export default NarratorCard;
