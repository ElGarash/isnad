import { ErrorBoundary } from "@/app/components/error-boundary";
import HadithExplanationCard from "@/app/components/hadith-explanation-card";
import HadithTextCard from "@/app/components/hadith-text-card";
import { LoadingSpinner } from "@/app/components/loading-spinner";
import HadithTransmissionChain from "@/app/components/transmission-chain";
import { getChainForHadith, getHadithById } from "@/lib/sqlite";
import { Suspense } from "react";

interface PageProps {
  params: {
    source: string;
    chapterNo: number;
    hadithNo: string;
  };
}

export default function HadithPage({ params }: PageProps) {
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
    <div className="flex items-center justify-center">
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
    </div>
  );
}
