import BrutalistCard from "@/components/brutalist-card";
import { ErrorBoundary } from "@/components/error-boundary";
import { LoadingSpinner } from "@/components/loading-spinner";
import TeacherStudentChain from "@/components/predecessors-successors-chain";
import VirtualizedNarratorList from "@/components/virtualized-narrator-list";
import {
  InfoSource,
  Narrator,
  getNarrator,
  getNarratorInfo,
  getNarratorsInSource,
  getPredecessors,
  getSuccessors,
} from "@/lib/sqlite";
import { notFound } from "next/navigation";
import { Suspense } from "react";

function RelationshipsSection({
  narrator,
  predecessors,
  successors,
}: {
  narrator: Narrator;
  predecessors: Narrator[];
  successors: Narrator[];
}) {
  return (
    <div className="grid grid-cols-12 gap-6 h-full">
      <section className="col-span-3 flex flex-col gap-6">
        {predecessors.length !== 0 && (
          <BrutalistCard>
            <h2 className="text-xl font-bold mb-3">
              روى عن ({predecessors.length})
            </h2>
            <VirtualizedNarratorList items={predecessors} />
          </BrutalistCard>
        )}
        {successors.length !== 0 && (
          <BrutalistCard>
            <h2 className="text-xl font-bold mb-3">
              روى عنه ({successors.length})
            </h2>
            <VirtualizedNarratorList items={successors} />
          </BrutalistCard>
        )}
      </section>
      <BrutalistCard className="col-span-9 p-1 h-full">
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
    </div>
  );
}

function mapBookSourceToReadableName(bookSource: string) {
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
    return "ورد بهذه الأسماء فى كتب الحديث";
  } else {
    throw new Error(`Unknown book source: ${bookSource}`);
  }
}

function InfoSection({ info }: { info: InfoSource[] }) {
  if (!info || info.length === 0) return null;

  return (
    <>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t-4 border-black"></div>
        </div>
        <div className="relative flex justify-center">
          <span className="bg-parchment px-4 text-2xl font-bold">ذُكر عنه</span>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-6">
        {info.map((entry, index) => (
          <BrutalistCard
            key={index}
            className="group transition-all duration-500 ease-in-out hover:scale-105"
          >
            <h2 className="text-xl font-bold my-6 inline-block relative">
              {mapBookSourceToReadableName(entry.book_source)}
              <div className="absolute bottom-0 left-0 right-0 h-3 bg-parchment -z-10 translate-y-1"></div>
            </h2>
            <div
              className="max-h-0 group-hover:max-h-[30vh] overflow-hidden transition-[max-height] duration-500 ease-in-out"
            >
              <p className="overflow-y-auto text-lg whitespace-pre-wrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-200 max-h-[30vh] pl-5">
                {entry.content}
              </p>
            </div>
          </BrutalistCard>
        ))}
      </div>
    </>
  );
}

export async function generateStaticParams() {
  const names = getNarratorsInSource("Bukhari");
  return names.map((name) => ({
    name,
  }));
}

export default async function NarratorPage({
  params,
}: {
  params: { name: string };
}) {
  const narrator = getNarrator(decodeURIComponent(params.name));

  if (!narrator) {
    notFound();
  }

  const successors = getSuccessors(narrator.scholar_indx);
  const predecessors = getPredecessors(narrator.scholar_indx);
  const info = getNarratorInfo(narrator.scholar_indx);

  return (
    <main className="flex items-center justify-center">
      <div className="container flex flex-col gap-12 my-12 min-h-screen">
        <div className="w-fit">
          <h1 className="text-4xl font-bold inline-block relative">
            {narrator.name}
            <div className="absolute bottom-0 left-0 right-0 h-4 bg-parchment -z-10 translate-y-2"></div>
          </h1>
        </div>

        <RelationshipsSection
          narrator={narrator}
          predecessors={predecessors}
          successors={successors}
        />

        <InfoSection info={info} />
      </div>
    </main>
  );
}
