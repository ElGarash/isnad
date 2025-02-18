import BrutalistCard from "@/components/brutalist-card";
import { ErrorBoundary } from "@/components/error-boundary";
import { LoadingSpinner } from "@/components/loading-spinner";
import TeacherStudentChain from "@/components/teacher-student-chain";
import VirtualizedNarratorList from "@/components/virtualized-narrator-list";
import {
  getNarrator,
  getNarratorsInSource,
  getPredecessors,
  getSuccessors,
} from "@/lib/sqlite";
import { notFound } from "next/navigation";
import { Suspense } from "react";

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

  return (
    <div className="flex items-center justify-center">
      <div className="container flex flex-col gap-12 my-12 min-h-screen">
        <div className="w-fit">
          <h1 className="text-4xl font-bold inline-block relative">
            {narrator.name}
            <div className="absolute bottom-0 left-0 right-0 h-4 bg-parchment -z-10 translate-y-2"></div>
          </h1>
        </div>
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
          {/* Network Visualization */}
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
      </div>
    </div>
  );
}
