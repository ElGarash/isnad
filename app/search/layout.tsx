import { Metadata } from "next";

export const metadata: Metadata = {
  title: "البحث في الأحاديث - إسناد",
  description:
    "ابحث في الأحاديث النبوية الشريفة والرواة والفصول من صحيح البخاري وصحيح مسلم",
  openGraph: {
    title: "البحث في الأحاديث - إسناد",
    description:
      "ابحث في الأحاديث النبوية الشريفة والرواة والفصول من صحيح البخاري وصحيح مسلم",
    images: [
      {
        url: "/images/og-images/og-search.png",
        width: 1200,
        height: 630,
        alt: "البحث في الأحاديث",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "البحث في الأحاديث - إسناد",
    description:
      "ابحث في الأحاديث النبوية الشريفة والرواة والفصول من صحيح البخاري وصحيح مسلم",
    images: ["/images/og-images/og-search.png"],
  },
};

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
