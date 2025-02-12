import HadithList from "@/components/hadith-list";
import { getHadiths } from "@/lib/sqlite";

export default function Home() {
  return <HadithList hadiths={getHadiths(10)} />;
}
