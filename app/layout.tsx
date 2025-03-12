import "./globals.css";
import Footer from "@/components/footer";
import Navbar from "@/components/navbar";
import { Metadata } from "next";
import { Noto_Naskh_Arabic } from "next/font/google";

const notoNaskhArabic = Noto_Naskh_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-naskh",
});

export const metadata: Metadata = {
  metadataBase: new URL(`https://open-graph.isnad-acg.pages.dev/`),
  title: {
    default: "Hadith Transmission Chain Visualizer",
    template: "%s | Hadith Transmission Chain Visualizer",
  },
  description: "Explore the chains of transmission for authentic hadiths",
  openGraph: {
    title: {
      default: "Hadith Transmission Chain Visualizer",
      template: "%s | Hadith Transmission Chain Visualizer",
    },
    description: "Explore the chains of transmission for authentic hadiths",
    images: [
      {
        url: "/og-default.jpg",
        width: 1200,
        height: 630,
        alt: "Hadith Transmission Chain Visualizer",
      },
    ],
    locale: "en_US",
    type: "website",
    siteName: "Hadith Transmission Chain Visualizer",
  },
  twitter: {
    card: "summary_large_image",
    title: {
      default: "Hadith Transmission Chain Visualizer",
      template: "%s | Hadith Transmission Chain Visualizer",
    },
    description: "Explore the chains of transmission for authentic hadiths",
    images: ["/og-default.jpg"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body className={notoNaskhArabic.className}>
        <div className="flex min-h-screen flex-col">
          <Navbar />
          <main className="flex-grow">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
