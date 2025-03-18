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
import { Metadata } from "next";
import { Suspense } from "react";

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { source, chapter, hadithNo } = await params;
  const hadith = await getHadithById(source, chapter, hadithNo);

  if (!hadith) {
    return {
      title: `Hadith ${hadithNo} - ${source}`,
      description: "Explore this hadith transmission chain",
      openGraph: {
        title: `Hadith ${hadithNo} - ${source}`,
        description: "Explore this hadith transmission chain",
        images: [
          {
            url: "/images/og-images/og-default.png",
            width: 1200,
            height: 630,
            alt: `Transmission chain for Hadith ${hadithNo}`,
          },
        ],
        type: "article",
      },
    };
  }

  const sanitizedSource = hadith.source.replace(" ", "_");
  const sanitizedHadithNo = hadith.hadith_no
    .toString()
    .replace("/", "-")
    .trim();

  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_METADATA_BASE || 'https://open-graph.isnad-acg.pages.dev/'),
    title: `Hadith ${hadith.hadith_no} - ${hadith.source}`,
    description:
      hadith.text_ar?.substring(0, 160) ||
      "Explore this hadith transmission chain",
    openGraph: {
      title: `Hadith ${hadith.hadith_no} - ${hadith.source}`,
      description:
        hadith.text_ar?.substring(0, 160) ||
        "Explore this hadith transmission chain",
      images: [
        {
          url: `/images/og-images/hadiths/${sanitizedSource}/${hadith.chapter_no}/${sanitizedHadithNo}.png`,
          width: 1200,
          height: 630,
          alt: `Transmission chain for Hadith ${hadithNo}`,
        },
      ],
      type: "article",
    },
  };
}

interface PageProps {
  params: Promise<{
    source: string;
    chapter: string;
    hadithNo: string;
  }>;
}

export async function generateStaticParams() {
  const hadiths = getHadithsBySource("Sahih Bukhari", 1000);
  return hadiths.map((hadith) => ({
    source: hadith.source,
    chapter: hadith.chapter,
    hadithNo: hadith.hadith_no.toString(),
  }));
}

export default async function HadithPage({ params }: PageProps) {
  const { source, chapter, hadithNo } = await params;
  const hadith = getHadithById(
    decodeURIComponent(source),
    decodeURIComponent(chapter),
    hadithNo,
  );
  if (!hadith) {
    // FIXME: make me pretty
    return <div>Hadith not found</div>;
  }

  const chainNarrators = getChainForHadith(
    decodeURIComponent(source),
    decodeURIComponent(chapter),
    hadithNo,
  );
  const transformedData = {
    hadithNo: hadithNo,
    transmissionChains: [
      {
        sanadNo: 1,
        narrators: chainNarrators,
      },
    ],
  };

  return (
    <main className="flex items-center justify-center">
      <div className="container my-12 grid h-full min-h-screen grid-cols-12 gap-6">
        {/* Hadith Content and Explanation */}
        <section className="col-span-3 grid h-screen grid-rows-2 gap-6">
          <HadithTextCard text={hadith.text_ar} />
          <HadithExplanationCard explanation={hadith.explanation} />
        </section>
        {/* Network Visualization */}
        <section className="relative col-span-9 h-screen border-4 border-black bg-white p-1 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
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
