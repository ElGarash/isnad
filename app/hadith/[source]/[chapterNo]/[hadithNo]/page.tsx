import { ErrorBoundary } from "@/app/components/error-boundary";
import HadithTransmissionChain from "@/app/components/hadith-transmission-chain";
import { LoadingSpinner } from "@/app/components/loading-spinner";
import { getChainForHadith, getHadithById } from "@/lib/sqlite";
import { Suspense } from "react";

interface PageProps {
  params: {
    source: string;
    chapterNo: string;
    hadithNo: string;
  };
}

export default function HadithPage({ params }: PageProps) {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <ErrorBoundary>
        <Suspense fallback={<LoadingSpinner />}>
          <ChainVisualization
            source={decodeURIComponent(params.source)}
            chapterNo={parseInt(params.chapterNo)}
            hadithNo={params.hadithNo}
          />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}

function ChainVisualization({
  source,
  chapterNo,
  hadithNo,
}: Omit<PageProps["params"], "chapterNo"> & { chapterNo: number }) {
  const hadith = getHadithById(source, chapterNo, hadithNo);
  if (!hadith) {
    return <div>Hadith not found</div>;
  }

  const chain = getChainForHadith(source, chapterNo, hadithNo);

  const transformedData = {
    hadithNo: hadith.hadith_no,
    transmissionChains: [
      {
        sanadNo: 1,
        narrators: chain.map((narrator) => ({
          narratorName: narrator.name,
          narratorId: narrator.scholar_indx.toString(),
          narratorGen: narrator.position,
        })),
      },
    ],
  };

  return <HadithTransmissionChain hadithData={transformedData} />;
}
