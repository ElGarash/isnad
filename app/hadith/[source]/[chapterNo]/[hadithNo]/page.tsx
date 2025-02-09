import { Suspense } from "react"
import HadithTransmissionChain from "@/app/components/hadith-transmission-chain"
import { getHadithById, getChainForHadith } from "@/lib/sqlite"
import { LoadingSpinner } from "@/app/components/loading-spinner"
import { ErrorBoundary } from "@/app/components/error-boundary"

interface PageProps {
  params: {
    source: string
    chapterNo: string
    hadithNo: string
  }
}

export default function HadithPage({ params }: PageProps) {
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingSpinner />}>
        <ChainVisualization 
          source={decodeURIComponent(params.source)}
          chapterNo={parseInt(params.chapterNo)}
          hadithNo={params.hadithNo}
        />
      </Suspense>
    </ErrorBoundary>
  )
}

function ChainVisualization({ 
  source, 
  chapterNo, 
  hadithNo 
}: { 
  source: string
  chapterNo: number
  hadithNo: string 
}) {

  const hadith = getHadithById(source, chapterNo, hadithNo);
  if (!hadith) {
    return <div>Hadith not found</div>;
  }

  const chain = getChainForHadith(source, chapterNo, hadithNo);
  
  const transformedData = {
    hadithNo: hadith.hadith_no,
    transmissionChains: [{
      sanadNo: 1,
      narrators: chain.map(narrator => ({
        narratorName: narrator.name,
        narratorId: narrator.scholar_indx.toString(),
        narratorGen: narrator.position
      }))
    }]
  };

  return <HadithTransmissionChain hadithData={transformedData} />;
}
