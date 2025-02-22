import "./globals.css";
import Footer from "@/components/footer";
import Navbar from "@/components/navbar";
import { Noto_Naskh_Arabic } from "next/font/google";

const notoNaskhArabic = Noto_Naskh_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-naskh",
});

export const metadata = {
  title: "Isnad - Hadith Transmission Chain Visualizer",
  description: "Visualize and explore hadith transmission chains",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body className={notoNaskhArabic.className}>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-grow">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
