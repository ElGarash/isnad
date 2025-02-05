import HadithTransmissionChain from "./components/hadith-transmission-chain"
import { Navbar } from "./components/navbar"
import { Footer } from "./components/footer"

const people = [
  {
    id: "a",
    name: "Abdullah ibn Umar",
    rank: "Companion",
    info: "A prominent companion of the Prophet Muhammad.",
    layer: 0,
  },
  { id: "b", name: "Nafi", rank: "Follower", info: "A notable scholar and student of Abdullah ibn Umar.", layer: 1 },
  {
    id: "c",
    name: "Malik ibn Anas",
    rank: "Scholar",
    info: "Founder of the Maliki school of jurisprudence.",
    layer: 2,
  },
  { id: "d", name: "Al-Shafi'i", rank: "Scholar", info: "Founder of the Shafi'i school of jurisprudence.", layer: 3 },
  {
    id: "e",
    name: "Abdullah ibn al-Mubarak",
    rank: "Scholar",
    info: "A renowned scholar of hadith and asceticism.",
    layer: 2,
  },
  {
    id: "f",
    name: "Al-Bukhari",
    rank: "Collector",
    info: "Compiler of Sahih al-Bukhari, one of the most authentic hadith collections.",
    layer: 4,
  },
  {
    id: "h",
    name: "Ahmad ibn Hanbal",
    rank: "Scholar",
    info: "Founder of the Hanbali school of jurisprudence.",
    layer: 3,
  },
  {
    id: "k",
    name: "Muslim ibn al-Hajjaj",
    rank: "Collector",
    info: "Compiler of Sahih Muslim, one of the most authentic hadith collections.",
    layer: 4,
  },
  {
    id: "l",
    name: "Ibn Hajar al-Asqalani",
    rank: "Commentator",
    info: "Author of Fath al-Bari, a comprehensive commentary on Sahih al-Bukhari.",
    layer: 5,
  },
]

const links = [
  { source: "a", target: "b" },
  { source: "b", target: "c" },
  { source: "c", target: "d" },
  { source: "d", target: "f" },
  { source: "a", target: "b" },
  { source: "b", target: "e" },
  { source: "e", target: "h" },
  { source: "h", target: "k" },
  { source: "f", target: "l" },
  { source: "k", target: "l" },
]

const hadithText = "The Prophet (ﷺ) said, 'The best among you (Muslims) are those who learn the Qur'an and teach it.'"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-dot-pattern">
      <Navbar />
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Hadith Transmission Chain Visualizer</h1>
          <HadithTransmissionChain people={people} links={links} hadithText={hadithText} />
        </div>
      </main>
      <Footer />
    </div>
  )
}

