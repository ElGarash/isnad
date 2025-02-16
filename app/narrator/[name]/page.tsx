import { NarratorCard } from "@/components/narrator-card";
import { getNarratorsInSource, getNarrator, getSuccessors } from "@/lib/sqlite";
import { notFound } from "next/navigation";

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

  return (
    <main className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4 text-right">{narrator.name}</h1>
        <div className="flex justify-center mb-8">
          <NarratorCard {...narrator} />
        </div>

        <h2 className="text-xl font-semibold mb-4 text-right">أخذ عنه</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {successors.map((student) => (
            <NarratorCard key={student.scholar_indx} {...student} />
          ))}
        </div>
      </div>
    </main>
  );
}

export async function generateStaticParams() {
  const names = getNarratorsInSource("Bukhari");
  return names.map((name) => ({
    name: encodeURIComponent(name),
  }));
}
