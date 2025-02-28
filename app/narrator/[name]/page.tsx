import BrutalistCard from "@/components/brutalist-card";
import { ErrorBoundary } from "@/components/error-boundary";
import { LoadingSpinner } from "@/components/loading-spinner";
import TeacherStudentChain from "@/components/predecessors-successors-chain";
import VirtualizedChapterList from "@/components/virtualized-chapter-list";
import VirtualizedNarratorList from "@/components/virtualized-narrator-list";
import { getArabicGrade, getBlessings } from "@/lib/grade-mapping";
import {
  ChapterCount,
  InfoSource,
  Narrator,
  getNarrator,
  getNarratorInfo,
  getNarratorsInSource,
  getPredecessors,
  getSuccessors,
  narratedAbout,
} from "@/lib/sqlite";
import { BabyIcon, MapPinIcon, SkullIcon } from "lucide-react";
import { notFound } from "next/navigation";
import { Suspense } from "react";

function Summary({ narrator }: { narrator: Narrator }) {
  return (
    <BrutalistCard className="flex flex-col gap-6 p-4">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-start gap-2">
            <span className="font-bold">الدرجة</span>
            <div className="inline-flex min-h-[28px] items-center justify-center border-2 border-navy bg-parchment px-3 py-1 text-base font-bold shadow-[3px_3px_0px_0px_theme(colors.navy)]">
              {getArabicGrade(narrator.grade)}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-xl font-bold">تواريخ</h2>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <BabyIcon className="h-5 w-5" />
            <span className="font-bold">الولادة:</span>
            {narrator.birth_date_hijri || narrator.birth_date_gregorian ? (
              <span>
                {`${narrator.birth_date_hijri ?? "غير معروف"} هـ`} /{" "}
                {`${narrator.birth_date_gregorian ?? "غير معروف"} مـ`}
              </span>
            ) : (
              <span>غير معروف</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <SkullIcon className="h-5 w-5" />
            <span className="font-bold">الوفاة:</span>
            {narrator.death_date_hijri || narrator.death_date_gregorian ? (
              <span>
                {`${narrator.death_date_hijri ?? "غير معروف"} هـ`} /{" "}
                {`${narrator.death_date_gregorian ?? "غير معروف"} مـ`}
              </span>
            ) : (
              <span>غير معروف</span>
            )}
          </div>
        </div>
      </div>

      {narrator.death_place && (
        <div className="flex flex-col gap-3">
          <h2 className="text-xl font-bold">أماكن</h2>
          <div className="flex items-center gap-2">
            <MapPinIcon className="h-5 w-5" />
            <span className="font-bold">الوفاة: </span>
            <span>{narrator.death_place}</span>
          </div>
        </div>
      )}
    </BrutalistCard>
  );
}

function RelationsSection({
  predecessors,
  successors,
  chapters,
}: {
  predecessors: Narrator[];
  successors: Narrator[];
  chapters: ChapterCount[];
}) {
  return (
    <div className="flex flex-col gap-6">
      {predecessors.length !== 0 && (
        <BrutalistCard>
          <h2 className="mb-3 inline-block border-2 border-navy/70 bg-parchment-dark px-2 py-1 text-xl font-bold">
            رَوى عن ({predecessors.length})
          </h2>
          <VirtualizedNarratorList items={predecessors} />
        </BrutalistCard>
      )}
      {successors.length !== 0 && (
        <BrutalistCard>
          <h2 className="mb-3 inline-block border-2 border-navy/70 bg-parchment-dark px-2 py-1 text-xl font-bold">
            رَوى عنه ({successors.length})
          </h2>
          <VirtualizedNarratorList items={successors} />
        </BrutalistCard>
      )}
      {chapters.length !== 0 && (
        <BrutalistCard>
          <h2 className="mb-3 inline-block border-2 border-navy/70 bg-parchment-dark px-2 py-1 text-xl font-bold">
            روى في ({chapters.length} باب)
          </h2>
          <VirtualizedChapterList items={chapters} />
        </BrutalistCard>
      )}
    </div>
  );
}

function mapBookSourceToReadableName(bookSource: string) {
  /*
  FIXME
  The values are based on the results from the query at @scripts/get_book_titles.sql
  */
  if (bookSource.includes("ميزان الاعتدال")) {
    return "ميزان الاعتدال للذهبى";
  } else if (bookSource.includes("التاريخ الكبير")) {
    return "التاريخ الكبير للبخارى";
  } else if (bookSource.includes("سير أعلام النبلاء")) {
    return "سير أعلام النبلاء للذهبى";
  } else if (bookSource.includes("الإصابة")) {
    return "الإصابة في تمييز الصحابة لابن حجر";
  } else if (bookSource.includes("لسان الميزان")) {
    return "لسان الميزان لابن حجر";
  } else if (bookSource.includes("تقريب التهذيب")) {
    return "تقريب التهذيب لابن حجر العسقلانى";
  } else if (bookSource.includes("تهذيب التهذيب")) {
    return "تهذيب التهذيب لابن حجر العسقلانى";
  } else if (bookSource.includes("الطبقات الكبرى")) {
    return "الطبقات الكبرى لابن سعد";
  } else if (bookSource.includes("ثقات ابن حبان")) {
    return "ثقات ابن حبان";
  } else if (bookSource.includes("Names used in Hadith Literature")) {
    return "ورد في هذه السياقات فى كتب الحديث";
  } else {
    throw new Error(`Unknown book source: ${bookSource}`);
  }
}

function InfoSection({ info }: { info: InfoSource[] }) {
  if (!info || info.length === 0) return null;

  return (
    <div className="flex flex-col gap-6">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t-4 border-black"></div>
        </div>
        <div className="relative flex justify-center">
          <span className="bg-parchment-dark px-4 text-2xl font-bold">
            ذُكر عنه
          </span>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-6">
        {info.map((entry, index) => (
          <BrutalistCard
            key={index}
            className="group transition-all duration-500 ease-in-out hover:scale-105"
          >
            <h2 className="relative my-6 inline-block text-xl font-bold">
              {mapBookSourceToReadableName(entry.book_source)}
              <div className="absolute bottom-0 left-0 right-0 -z-10 h-3 translate-y-1 bg-parchment"></div>
            </h2>
            <div className="max-h-0 overflow-hidden transition-[max-height] duration-500 ease-in-out group-hover:max-h-[30vh]">
              <p className="max-h-[30vh] overflow-y-auto whitespace-pre-wrap pl-5 text-lg opacity-0 transition-opacity delay-200 duration-300 group-hover:opacity-100">
                {entry.content}
              </p>
            </div>
          </BrutalistCard>
        ))}
      </div>
    </div>
  );
}

export async function generateStaticParams() {
  const names = getNarratorsInSource("Sahih Bukhari");
  return names.map((name) => ({
    name,
  }));
}

export default async function NarratorPage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name } = await params;
  const narrator = getNarrator(decodeURIComponent(name));

  if (!narrator) {
    notFound();
  }

  // FIXME: This is hardcoded for now until we decide on hosting
  const BOOK = "Sahih Bukhari";
  const successors = getSuccessors(narrator.scholar_indx, BOOK);
  const predecessors = getPredecessors(narrator.scholar_indx, BOOK);
  const chapters = narratedAbout(narrator.scholar_indx, BOOK);
  const info = getNarratorInfo(narrator.scholar_indx);

  return (
    <main className="flex items-center justify-center">
      <div className="container my-12 flex min-h-screen flex-col gap-12">
        <div className="w-fit">
          <h1 className="relative inline-block text-4xl font-bold">
            {narrator.name} ({getBlessings(getArabicGrade(narrator.grade))})
            <div className="absolute bottom-0 left-0 right-0 -z-10 h-4 translate-y-2 bg-parchment"></div>
          </h1>
        </div>

        <div className="grid grid-cols-12 gap-6">
          <div className="order-1 col-span-3 flex flex-col gap-6">
            <Summary narrator={narrator} />
            <RelationsSection
              predecessors={predecessors}
              successors={successors}
              chapters={chapters}
            />
          </div>

          <div className="order-2 col-span-9 flex flex-col gap-6">
            <BrutalistCard className="min-h-screen p-1">
              <ErrorBoundary>
                <Suspense fallback={<LoadingSpinner />}>
                  <TeacherStudentChain
                    chainData={{
                      narrator,
                      predecessors,
                      successors,
                    }}
                  />
                </Suspense>
              </ErrorBoundary>
            </BrutalistCard>

            {info && info.length > 0 && (
              <div className="mt-6">
                <InfoSection info={info} />
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
