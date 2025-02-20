import HadithList from "@/components/hadith-list";
import { getHadithsBySource } from "@/lib/sqlite";

export const dynamic = "force-static";

async function getInitialHadiths() {
  return getHadithsBySource("Sahih Bukhari", 1000);
}

export default async function Home() {
  const hadiths = await getInitialHadiths();
  return <HadithList hadiths={hadiths} />;
}
