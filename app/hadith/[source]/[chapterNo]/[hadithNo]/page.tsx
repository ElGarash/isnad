import { ErrorBoundary } from "@/components/error-boundary";
import HadithExplanationCard from "@/components/hadith-explanation-card";
import HadithTextCard from "@/components/hadith-text-card";
import { LoadingSpinner } from "@/components/loading-spinner";
import HadithTransmissionChain from "@/components/transmission-chain";
import {
  getChainForHadith,
  getHadithById,
  getHadithsBySource,
} from "@/lib/sqlite";
import { Suspense } from "react";

interface PageProps {
  params: {
    source: string;
    chapterNo: number;
    hadithNo: string;
  };
}

export async function generateStaticParams() {
  const hadiths = getHadithsBySource("Sahih Bukhari", 1000);
  return hadiths.map((hadith) => ({
    source: hadith.source,
    chapterNo: hadith.chapter_no.toString(),
    hadithNo: hadith.hadith_no.toString(),
  }));
}

export default async function HadithPage({ params }: PageProps) {
  const hadith = getHadithById(
    decodeURIComponent(params.source),
    params.chapterNo,
    params.hadithNo,
  );
  if (!hadith) {
    // FIXME: make me pretty
    return <div>Hadith not found</div>;
  }

  const chainNarrators = getChainForHadith(
    decodeURIComponent(params.source),
    params.chapterNo,
    params.hadithNo,
  );
  const transformedData = {
    hadithNo: params.hadithNo,
    transmissionChains: [
      {
        sanadNo: 1,
        narrators: chainNarrators,
      },
    ],
  };

  return (
    <main className="flex items-center justify-center">
      <div className="container grid grid-cols-12 gap-6 h-full my-12 min-h-screen">
        {/* Hadith Content and Explanation */}
        <section className="col-span-3">
          <HadithTextCard text={hadith.text_ar} />
          <HadithExplanationCard explanation="..." />
        </section>
        {/* Network Visualization */}
        <section className="col-span-9 relative border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-1 h-full">
          <ErrorBoundary>
            <Suspense fallback={<LoadingSpinner />}>
              <HadithTransmissionChain hadithData={transformedData} />
            </Suspense>
          </ErrorBoundary>
        </section>
      </div>
    </main>
  );
}
