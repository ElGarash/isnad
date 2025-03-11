import { Metadata } from 'next';
import HadithList from "@/components/hadith-list";
import { getHadithsByChapterSource, getSourceChapters } from "@/lib/sqlite";
import { notFound } from "next/navigation";

const STATIC_SOURCES = ["Sahih Bukhari"] as const;
type StaticSource = (typeof STATIC_SOURCES)[number];

interface ChapterPageProps {
  params: Promise<{
    source: StaticSource;
    chapter: string;
  }>;
}

export async function generateMetadata({ params }: ChapterPageProps ): Promise<Metadata> {
  const { source, chapter } = await params;
  const decodedSource = decodeURIComponent(source) as StaticSource;
  const decodedChapter = decodeURIComponent(chapter);

  if (!STATIC_SOURCES.includes(decodedSource)) {
    return {
      title: 'Chapter Not Found',
      description: 'The requested hadith chapter could not be found.',
      openGraph: {
        title: 'Chapter Not Found',
        description: 'The requested hadith chapter could not be found.',
        images: [
          {
            url: '/images/og-images/og-default.png',
            width: 1200,
            height: 630,
            alt: 'Chapter Not Found',
          },
        ],
      },
    };
  }

  const hadiths = getHadithsByChapterSource(decodedSource, decodedChapter);

  if (hadiths.length === 0) {
    return {
      title: 'Chapter Not Found',
      description: 'The requested hadith chapter could not be found.',
      openGraph: {
        title: 'Chapter Not Found',
        description: 'The requested hadith chapter could not be found.',
        images: [
          {
            url: '/images/og-images/og-default.png',
            width: 1200,
            height: 630,
            alt: 'Chapter Not Found',
          },
        ],
      },
    };
  }

  // Get the chapter number from the first hadith
  const chapterNo = hadiths[0].chapter_no;
  const sanitizedSource = decodedSource.replace(' ', '_');
  const description = `Collection of ${hadiths.length} hadiths from chapter ${decodedChapter} in ${decodedSource}`;

  return {
    title: `${decodedChapter} - ${decodedSource}`,
    description,
    openGraph: {
      title: `${decodedChapter} - ${decodedSource}`,
      description,
      images: [
        {
          url: `/images/og-images/chapters/${sanitizedSource}/${chapterNo}.png`,
          width: 1200,
          height: 630,
          alt: `Hadiths from chapter ${decodedChapter} in ${decodedSource}`,
        },
      ],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${decodedChapter} - ${decodedSource}`,
      description,
      images: [`/images/og-images/chapters/${sanitizedSource}/${chapterNo}.png`],
    }
  };
}

export async function generateStaticParams() {
  const allChapters = STATIC_SOURCES.flatMap((source, i) =>
    getSourceChapters(source).map((c) => ({
      source: STATIC_SOURCES[i],
      chapter: c.chapter,
    })),
  );
  return allChapters;
}

export default async function ChapterPage({ params }: ChapterPageProps) {
  const { source, chapter } = await params;
  const [decodedSource, decodedChapter] = [
    decodeURIComponent(source) as StaticSource,
    decodeURIComponent(chapter),
  ];

  if (!STATIC_SOURCES.includes(decodedSource)) {
    notFound();
  }
  const hadiths = getHadithsByChapterSource(decodedSource, decodedChapter);

  if (hadiths.length === 0) {
    notFound();
  }
  return <HadithList hadiths={hadiths} />;
}
