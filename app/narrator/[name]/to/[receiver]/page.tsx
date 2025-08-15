import HadithList from "@/components/hadith-list";
import {
  getHadithsFromNarratorToNarrator,
  getNarratorPairs,
} from "@/lib/sqlite";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-static";

export async function generateStaticParams() {
  return getNarratorPairs().map((pair) => ({
    name: pair.from_narrator,
    receiver: pair.to_narrator,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ name: string; receiver: string }>;
}): Promise<Metadata> {
  const { name, receiver } = await params;
  const fromNarrator = decodeURIComponent(name);
  const toNarrator = decodeURIComponent(receiver);

  return {
    title: `أحاديث من ${fromNarrator} إلى ${toNarrator} - إسناد`,
    description: `استكشف الأحاديث النبوية المروية من ${fromNarrator} إلى ${toNarrator} في سلسلة الإسناد`,
    openGraph: {
      title: `أحاديث من ${fromNarrator} إلى ${toNarrator} - إسناد`,
      description: `استكشف الأحاديث النبوية المروية من ${fromNarrator} إلى ${toNarrator} في سلسلة الإسناد`,
      type: "website",
    },
  };
}

export default async function NarratorToNarratorPage({
  params,
}: {
  params: Promise<{ name: string; receiver: string }>;
}) {
  const { name, receiver } = await params;
  const fromNarrator = decodeURIComponent(name);
  const toNarrator = decodeURIComponent(receiver);

  const hadiths = getHadithsFromNarratorToNarrator(
    fromNarrator,
    toNarrator,
    5000,
  );

  if (hadiths.length === 0) {
    notFound();
  }

  return (
    <div>
      <div className="container mx-auto px-4 py-6">
        {/* Breadcrumb Navigation */}
        <nav className="mb-4 text-sm text-gray-600" dir="rtl">
          <Link href="/" className="hover:text-blue-600">
            الرئيسية
          </Link>
          <span className="mx-2">←</span>
          <Link href="/narrator" className="hover:text-blue-600">
            الرواة
          </Link>
          <span className="mx-2">←</span>
          <Link
            href={`/narrator/${encodeURIComponent(fromNarrator)}`}
            className="hover:text-blue-600"
          >
            {fromNarrator}
          </Link>
          <span className="mx-2">←</span>
          <span className="font-medium text-gray-800">إلى {toNarrator}</span>
        </nav>

        <div className="mb-6 text-center">
          <h1 className="mb-2 text-right text-3xl font-bold">
            الأحاديث المروية من {fromNarrator} إلى {toNarrator}
          </h1>
          <p className="text-right text-gray-600">
            عدد الأحاديث: {hadiths.length}
          </p>
        </div>
      </div>
      <HadithList hadiths={hadiths} />
    </div>
  );
}
