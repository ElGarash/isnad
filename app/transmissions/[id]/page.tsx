"use client";

import { Footer } from "../../components/footer";
import { Navbar } from "../../components/navbar";
import { TransmissionChain } from "../../components/transmission-chain";
import { useParams } from "next/navigation";

// Mock data for demonstration purposes
const mockChains = [
  [
    { id: "a1", name: "Abdullah ibn Umar", rank: "Companion" },
    { id: "b1", name: "Nafi", rank: "Follower" },
    { id: "c1", name: "Malik ibn Anas", rank: "Scholar" },
    { id: "d1", name: "Al-Shafi'i", rank: "Scholar" },
    { id: "e1", name: "Al-Bukhari", rank: "Collector" },
  ],
  [
    { id: "a1", name: "Abdullah ibn Umar", rank: "Companion" },
    { id: "b2", name: "Salim ibn Abdullah", rank: "Follower" },
    { id: "c2", name: "Ibn Shihab al-Zuhri", rank: "Scholar" },
    { id: "d2", name: "Sufyan ibn Uyaynah", rank: "Scholar" },
    { id: "e2", name: "Muslim ibn al-Hajjaj", rank: "Collector" },
  ],
  [
    { id: "a1", name: "Abdullah ibn Umar", rank: "Companion" },
    { id: "b3", name: "Abdullah ibn Dinar", rank: "Follower" },
    { id: "c3", name: "Shu'bah ibn al-Hajjaj", rank: "Scholar" },
    { id: "d3", name: "Yahya ibn Sa'id al-Qattan", rank: "Scholar" },
    { id: "e3", name: "Ahmad ibn Hanbal", rank: "Scholar" },
  ],
];

export default function TransmissionsPage() {
  const params = useParams();
  const { id } = params;

  // In a real application, you would fetch the data for the specific person here
  // For now, we'll use the mock data

  return (
    <div className="flex flex-col min-h-screen bg-dot-pattern">
      <Navbar />
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            All Transmission Chains
          </h1>
          <p className="text-lg text-gray-700 mb-8">
            Displaying all transmission chains for {mockChains[0][0].name}
          </p>
          <div className="space-y-6">
            {mockChains.map((chain, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded-lg">
                <h2 className="text-xl font-semibold mb-2">
                  Chain {index + 1}
                </h2>
                <TransmissionChain chain={chain} />
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
