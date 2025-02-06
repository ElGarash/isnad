"use client"

import React, { useEffect, useState } from "react"
import { Graph } from "react-d3-graph"

interface HadithChainProps {
  hadithData: {
    hadithNo: string;
    transmissionChains: {
      SanadNo: string;
      Narrators: {
        NarratorID: string;
        NarratorName: string;
        NarratorGen: string;
      }[];
    }[];
  }[];
}

const generationColors = {
  'Comp_RA': "#4CAF50",
  'Follower_Tabi': "#2196F3",
  'Succ_TabaTabi': "#FFC107",
}

export default function HadithTransmissionChain({ hadithData }: HadithChainProps) {
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 })

  useEffect(() => {
    setDimensions({
      width: window.innerWidth,
      height: window.innerHeight
    })

    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      })
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Transform data for react-d3-graph
  const graphData = React.useMemo(() => {
    const nodes: any[] = []
    const links: any[] = []
    const seenNodes = new Set()

    hadithData.forEach(hadith => {
      hadith.transmissionChains.forEach(chain => {
        chain.Narrators.forEach((narrator, index) => {
          if (!seenNodes.has(narrator.NarratorID)) {
            seenNodes.add(narrator.NarratorID)
            nodes.push({
              id: narrator.NarratorID,
              name: narrator.NarratorName,
              color: "red",
              symbolType: "circle",
              labelPosition: "top"
            })
          }

          if (index < chain.Narrators.length - 1) {
            const nextNarrator = chain.Narrators[index + 1]
            links.push({
              source: narrator.NarratorID,
              target: nextNarrator.NarratorID,
              type: "STRAIGHT"
            })
          }
        })
      })
    })

    return { nodes, links }
  }, [hadithData])

  // Updated configuration for better compatibility
  const graphConfig = {
    directed: true,
    nodeHighlightBehavior: true,
    linkHighlightBehavior: true,
    highlightDegree: 1,
    highlightOpacity: 0.2,
    maxZoom: 8,
    minZoom: 0.1,
    node: {
      color: "lightgreen",
      size: 250,
      highlightStrokeColor: "blue",
      labelProperty: "name",
      fontSize: 12,
      highlightFontSize: 14,
      renderLabel: true,
    },
    link: {
      strokeWidth: 1.5,
      highlightColor: "lightblue",
    },
    d3: {
      alphaTarget: 0.05,
      gravity: -250,
      linkLength: 100,
      linkStrength: 1,
    },
    height: dimensions.height,
    width: dimensions.width,
  }

  return (
    <div style={{ 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      right: 0, 
      bottom: 0, 
      backgroundColor: 'transparent' 
    }}>
      <Graph
        id="hadith-graph"
        data={graphData}
        config={graphConfig}
      />
    </div>
  )
}

