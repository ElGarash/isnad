import HadithList from "@/components/hadith-list";
import { getHadithsBySource } from "@/lib/sqlite";
import { Metadata } from "next";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "إسناد - استكشف الأحاديث النبوية وسلاسل الرواة",
  description:
    "منصة شاملة لاستكشاف الأحاديث النبوية الشريفة وسلاسل الرواة من صحيح البخاري وصحيح مسلم",
  openGraph: {
    title: "إسناد - استكشف الأحاديث النبوية وسلاسل الرواة",
    description:
      "منصة شاملة لاستكشاف الأحاديث النبوية الشريفة وسلاسل الرواة من صحيح البخاري وصحيح مسلم",
    images: [
      {
        url: "/images/og-images/og-home.png",
        width: 1200,
        height: 630,
        alt: "إسناد - الصفحة الرئيسية",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "إسناد - استكشف الأحاديث النبوية وسلاسل الرواة",
    description:
      "منصة شاملة لاستكشاف الأحاديث النبوية الشريفة وسلاسل الرواة من صحيح البخاري وصحيح مسلم",
    images: ["/images/og-images/og-home.png"],
  },
};

async function getInitialHadiths() {
  return getHadithsBySource("Sahih Bukhari", 1000);
}

export default async function Home() {
  const hadiths = await getInitialHadiths();
  return <HadithList hadiths={hadiths} />;
}
