import { Suspense } from "react"
import HadithTransmissionChain from "./components/hadith-transmission-chain"
import { getPeopleAndLinks } from "@/lib/neo4j"
import { LoadingSpinner } from "./components/loading-spinner"
import { ErrorBoundary } from "./components/error-boundary"

export default function Home() {
  return (
    <ErrorBoundary>
      <div className="h-screen w-screen">
        <Suspense fallback={<LoadingSpinner />}>
          <ChainVisualization />
        </Suspense>
      </div>
    </ErrorBoundary>
  )
}

async function ChainVisualization() {
  const hadithData = await getPeopleAndLinks()
  return <HadithTransmissionChain hadithData={hadithData} />
}

