import React from "react"
import { ArrowRight } from "lucide-react"

interface Transmitter {
  id: string
  name: string
  rank: string
}

interface TransmissionChainProps {
  chain: Transmitter[]
}

export function TransmissionChain({ chain }: TransmissionChainProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 p-4 bg-white rounded-lg shadow-md">
      {chain.map((transmitter, index) => (
        <React.Fragment key={transmitter.id}>
          <div className="flex flex-col items-center">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
              style={{ backgroundColor: getColorForRank(transmitter.rank) }}
            >
              {transmitter.name.charAt(0)}
            </div>
            <span className="text-xs mt-1 text-center">{transmitter.name}</span>
            <span className="text-xs text-gray-500">{transmitter.rank}</span>
          </div>
          {index < chain.length - 1 && <ArrowRight className="text-gray-400" />}
        </React.Fragment>
      ))}
    </div>
  )
}

function getColorForRank(rank: string): string {
  const rankColors: { [key: string]: string } = {
    Companion: "#4CAF50",
    Follower: "#2196F3",
    Scholar: "#FFC107",
    Collector: "#FF5722",
    Commentator: "#9C27B0",
    Contemporary: "#607D8B",
  }
  return rankColors[rank] || "#9E9E9E"
}

