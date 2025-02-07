"use client"

import React, { useEffect, useState } from "react"
import { Graph, GraphNode, GraphLink } from "react-d3-graph"
import NarratorCard from "./narrator-card"

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

interface CustomNode extends GraphNode {
  id: string;
  name: string;
  color: string;
  symbolType: string;
  labelPosition: string;
  x: number;
  y: number;
  fx: number;
  fy: number;
}

interface CustomLink extends GraphLink {
  source: string;
  target: string;
  type: string;
}

const viewGenerator = (nodeData: any) => {
  const person = {
    id: nodeData.id,
    name: nodeData.name,
    generation: nodeData.generation || "Companion",
    grade: nodeData.grade || 1,
    description: nodeData.description || ""
  }

  return <NarratorCard person={person} />
}

export default function HadithTransmissionChain({ hadithData }: HadithChainProps) {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      })
    }

    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    return () => window.removeEventListener('resize', updateDimensions)
  }, [])

  // Transform data for react-d3-graph
  const graphData = React.useMemo(() => {
    if (!isMounted || dimensions.width === 0) return { nodes: [], links: [] }
    
    const nodes: any[] = []
    const links: any[] = []
    const seenNodes = new Set()
    const levelNodes = new Map<number, string[]>()
    const nodePositions = new Map<string, {x: number, y: number}>()

    // Calculate spacing values with fixed node size in mind
    const nodeWidth = 120
    const nodeHeight = 140
    const maxChainLength = Math.max(
      ...hadithData.map(h => Math.max(...h.transmissionChains.map(c => c.Narrators.length)))
    )
    const verticalSpacing = Math.max(dimensions.height / (maxChainLength + 1), nodeHeight * 1.5)
    const horizontalOffset = Math.max(dimensions.width * 0.005, nodeWidth) // Reduced from 0.1 to 0.05
    const rootX = dimensions.width / 2  // Store root X position for centering

    // Add root node (Prophet PBUH) centered
    const rootNodeId = "prophet-pbuh"
    nodes.push({
      id: rootNodeId,
      name: "The Prophet (PBUH)",
      generation: "",
      grade: 7,
      description: "The Prophet Muhammad, peace be upon him",
      color: "#FFD700",
      symbolType: "circle",
      labelPosition: "left",
      x: rootX,
      y: verticalSpacing / 2,
      fx: rootX,
      fy: verticalSpacing / 2,
    })
    seenNodes.add(rootNodeId)

    // Add author node at the bottom
    const authorNodeId = "author-node"
    nodes.push({
      id: authorNodeId,
      name: "Muslim",
      generation: "3rd century scholar",
      grade: 5,
      description: "Imam Muslim, compiler of Sahih Muslim",
      color: "#C71585", // Deep pink color for distinction
      symbolType: "circle",
      labelPosition: "bottom",
      x: rootX,
      y: (maxChainLength + 1) * verticalSpacing,
      fx: rootX,
      fy: (maxChainLength + 1) * verticalSpacing,
    })
    seenNodes.add(authorNodeId)

    // Track leaf nodes to connect them to author
    const leafNodes = new Set<string>()

    // First pass: determine maximum chain length and group nodes by level
    // Group nodes by their level
    hadithData.forEach(hadith => {
      hadith.transmissionChains.forEach(chain => {
        chain.Narrators.forEach((narrator, index) => {
          if (!levelNodes.has(index)) {
            levelNodes.set(index, [])
          }
          if (!levelNodes.get(index)?.includes(narrator.NarratorID)) {
            levelNodes.get(index)?.push(narrator.NarratorID)
          }
        })
      })
    })

    // Create nodes with positions - modified to maintain vertical alignment
    hadithData.forEach(hadith => {
      hadith.transmissionChains.forEach((chain, chainIndex) => {
        let parentX: number | null = null;
        
        chain.Narrators.forEach((narrator, index) => {
          if (!seenNodes.has(narrator.NarratorID)) {
            seenNodes.add(narrator.NarratorID)
            const yPosition = (index + 1) * verticalSpacing
            
            const nodesAtLevel = levelNodes.get(index) || []
            const position = nodesAtLevel.indexOf(narrator.NarratorID)
            const totalNodesAtLevel = nodesAtLevel.length
            
            // Calculate x position with special handling for single nodes
            let xPosition
            if (totalNodesAtLevel === 1) {
              // Center single nodes with root node
              xPosition = rootX
            } else {
              xPosition = parentX ?? (horizontalOffset + 
                (position * (dimensions.width - 2 * horizontalOffset) / (Math.max(totalNodesAtLevel - 1, 1))))
            }
            
            // Ensure xPosition stays within bounds
            xPosition = Math.max(horizontalOffset, Math.min(dimensions.width - horizontalOffset, xPosition))
            
            parentX = xPosition
            nodePositions.set(narrator.NarratorID, {x: xPosition, y: yPosition})

            const centerPoint = dimensions.width / 2
            const isRightSide = xPosition > centerPoint

            nodes.push({
              id: narrator.NarratorID,
              name: narrator.NarratorName,
              generation: narrator.NarratorGen,
              grade: 3, // You might want to get this from your data
              description: "", // Add description if available
              color: "red",
              symbolType: "circle",
              labelPosition: isRightSide ? "right" : "left",
              x: xPosition,
              y: yPosition,
              fx: xPosition, // Fix x position
              fy: yPosition, // Fix y position
            })
          }

          // Connect first-level narrators to the Prophet's node
          if (index === 0) {
            links.push({
              source: rootNodeId,
              target: narrator.NarratorID,
              type: "STRAIGHT"
            })
          }

          // Update links
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

    // After all nodes and links are created, connect leaf nodes to author
    hadithData.forEach(hadith => {
      hadith.transmissionChains.forEach(chain => {
        const lastNarrator = chain.Narrators[chain.Narrators.length - 1]
        if (lastNarrator) {
          leafNodes.add(lastNarrator.NarratorID)
        }
      })
    })

    // Add links from leaf nodes to author
    leafNodes.forEach(nodeId => {
      links.push({
        source: nodeId,
        target: authorNodeId,
        type: "STRAIGHT"
      })
    })

    return { nodes, links }
  }, [hadithData, dimensions, isMounted])

  const graphConfig = {
    directed: true,
    nodeHighlightBehavior: true,
    linkHighlightBehavior: true,
    highlightDegree: 1,
    highlightOpacity: 0.2,
    maxZoom: 8,
    minZoom: 0.1,

    node: {
      size: {
        width: 1200,  // Match actual card width
        height: 1400, // Match actual card height
      },
      viewGenerator,
      renderLabel: false,
    },
    link: {
      strokeWidth: 2,
      highlightColor: "lightblue",
      type: "STRAIGHT",
    },
    d3: {
      gravity: -100,
      linkLength: 250, // Increase link length for better spacing
      linkStrength: 0.8,
      alphaTarget: 0,
    },
    height: dimensions.height,
    width: dimensions.width,
  }

  if (!isMounted) return null

  return (
    <div className="fixed inset-0 bg-transparent">
      {dimensions.width > 0 && (
    /* @ts-ignore */
    <Graph<CustomNode, CustomLink>          
        id="hadith-graph"
          data={graphData}
          config={graphConfig}
        />
      )}
    </div>
  )
}

