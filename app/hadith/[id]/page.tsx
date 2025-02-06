import { Suspense } from "react"
import HadithTransmissionChain from "../../components/hadith-transmission-chain"
import { getIsnadByHadithId } from "@/lib/neo4j"
import { LoadingSpinner } from "../../components/loading-spinner"
import { ErrorBoundary } from "../../components/error-boundary"

interface PageProps {
  params: {
    id: string
  }
}

export default function HadithPage({ params }: PageProps) {
  return (
    <ErrorBoundary>
      <div className="h-screen w-screen">
        <Suspense fallback={<LoadingSpinner />}>
          <ChainVisualization hadithId={params.id} />
        </Suspense>
      </div>
    </ErrorBoundary>
  )
}

async function ChainVisualization({ hadithId }: { hadithId: string }) {
  const hadithData = await getIsnadByHadithId(hadithId)
  return <HadithTransmissionChain hadithData={hadithData} />
}
