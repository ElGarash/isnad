import { ErrorBoundary } from "@/app/components/error-boundary";
import { LoadingSpinner } from "@/app/components/loading-spinner";
import HadithTransmissionChain from "@/app/components/transmission-chain";
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
    <div className="flex min-h-screen items-center justify-center" style={{
      backgroundImage: `
      radial-gradient(circle at 1px 1px, #cbd5e1 1px, transparent 0),
      radial-gradient(circle at 20px 20px, #94a3b8 0.5px, transparent 0)
    `,
      backgroundSize: "20px 20px, 40px 40px",
    }}>
      <ErrorBoundary>
        <Suspense fallback={<LoadingSpinner />}>
          <ChainVisualization
            source={decodeURIComponent(params.source)}
            chapterNo={parseInt(params.chapterNo)}
            hadithNo={params.hadithNo}
          />
        </Suspense>
      </ErrorBoundary>
    </div >
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

  const chainNarrators = getChainForHadith(source, chapterNo, hadithNo);

  const transformedData = {
    hadithNo: hadith.hadith_no,
    transmissionChains: [
      {
        sanadNo: 1,
        narrators: chainNarrators,
      },
    ],
  };

  return <HadithTransmissionChain hadithData={transformedData} />;
}
