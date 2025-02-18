import { NarratorCard } from "@/components/narrator-card";
import TeacherStudentChain from "@/components/teacher-student-chain";
import {
  getNarrator,
  getNarratorsInSource,
  getPredecessors,
  getSuccessors,
} from "@/lib/sqlite";
import { notFound } from "next/navigation";

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
    <main className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4 text-right">{narrator.name}</h1>
        <div className="flex justify-center mb-8">
          <TeacherStudentChain
            chainData={{
              narrator,
              predecessors,
              successors,
            }}
          />
        </div>
      </div>
    </main>
  );
}
