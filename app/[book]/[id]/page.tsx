import { Suspense } from "react"
import HadithTransmissionChain from "@/app/components/hadith-transmission-chain"
import { getIsnadByHadithId, getAllHadithIds } from "@/lib/neo4j"
import { LoadingSpinner } from "@/app/components/loading-spinner"
import { ErrorBoundary } from "@/app/components/error-boundary"

interface PageProps {
  params: {
    id: string
    book: "muslim" | "bukhari"
  }
}

export async function generateStaticParams() {
  const hadithIds = await getAllHadithIds()
  return hadithIds.map((id) => ({
    book: 'muslim',
    id: id.toString()
  }))
}

export default async function HadithPage({ params: { id, book } }: PageProps) {
  if (book !== "muslim") {
    return <div>Book not found</div>
  }

  const hadithData = await getIsnadByHadithId(id)
  
  if (!hadithData) {
    return <div>Hadith not found</div>
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <ErrorBoundary>
        <Suspense fallback={<LoadingSpinner />}>
          <HadithTransmissionChain hadithData={hadithData} />
        </Suspense>
      </ErrorBoundary>
    </div>
  )
}
