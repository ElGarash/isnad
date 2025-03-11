import { Metadata } from 'next';
import BrutalistCard from "@/components/brutalist-card";
import { ErrorBoundary } from "@/components/error-boundary";
import { LoadingSpinner } from "@/components/loading-spinner";
import TeacherStudentChain from "@/components/predecessors-successors-chain";
import VirtualizedChapterList from "@/components/virtualized-chapter-list";
import VirtualizedNarratorList from "@/components/virtualized-narrator-list";
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
import { notFound } from "next/navigation";
import { Suspense } from "react";

export async function generateMetadata({ params }: {
  params: Promise<{ name: string }>;}): Promise<Metadata> {
    const { name } = await params;
  const decodedName = decodeURIComponent(name);
  const narrator = getNarrator(decodedName);

  if (!narrator) {
    return {
      title: 'Narrator Not Found',
      description: 'The requested narrator could not be found.',
      openGraph: {
        title: 'Narrator Not Found',
        description: 'The requested narrator could not be found.',
        images: [
          {
            url: '/images/og-images/og-default.png',
            width: 1200,
            height: 630,
            alt: 'Narrator Not Found',
          },
        ],
      },
    };
  }

  // Get a brief description from narrator info if available
  const info = getNarratorInfo(narrator.scholar_indx);
  let description = `Hadith narrator profile for ${narrator.name}`;
  if (info && info.length > 0 && info[0].content) {
    description = info[0].content.substring(0, 160) + '...';
  }

  // Sanitize the name for file path
  const sanitizedName = narrator.name.replace('/', '-').replace('\\', '-');

  return {
    title: `${narrator.name} - Hadith Narrator Profile`,
    description,
    openGraph: {
      title: `${narrator.name} - Hadith Narrator Profile`,
      description,
      images: [
        {
          url: `/images/og-images/narrators/${sanitizedName}.png`,
          width: 1200,
          height: 630,
          alt: `Profile of hadith narrator ${narrator.name}`,
        },
      ],
      type: 'profile',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${narrator.name} - Hadith Narrator Profile`,
      description,
      images: [`/images/og-images/narrators/${sanitizedName}.png`],
    }
  };
}

function RelationshipsSection({
  narrator,
  predecessors,
  successors,
  chapters,
}: {
  narrator: Narrator;
  predecessors: Narrator[];
  successors: Narrator[];
  chapters: ChapterCount[];
}) {
  return (
    <div className="grid h-full grid-cols-12 gap-6">
      <section className="col-span-3 flex flex-col gap-6">
        {predecessors.length !== 0 && (
          <BrutalistCard>
            <h2 className="mb-3 text-xl font-bold">
              روى عن ({predecessors.length})
            </h2>
            <VirtualizedNarratorList items={predecessors} />
          </BrutalistCard>
        )}
        {successors.length !== 0 && (
          <BrutalistCard>
            <h2 className="mb-3 text-xl font-bold">
              روى عنه ({successors.length})
            </h2>
            <VirtualizedNarratorList items={successors} />
          </BrutalistCard>
        )}
        {chapters.length !== 0 && (
          <BrutalistCard>
            <h2 className="mb-3 text-xl font-bold">
              روى في ({chapters.length} باب)
            </h2>
            <VirtualizedChapterList items={chapters} />
          </BrutalistCard>
        )}
      </section>
      <BrutalistCard className="col-span-9 h-full p-1">
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
    </>
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
            {narrator.name}
            <div className="absolute bottom-0 left-0 right-0 -z-10 h-4 translate-y-2 bg-parchment"></div>
          </h1>
        </div>

        <RelationshipsSection
          narrator={narrator}
          predecessors={predecessors}
          successors={successors}
          chapters={chapters}
        />

        <InfoSection info={info} />
      </div>
    </main>
  );
}
