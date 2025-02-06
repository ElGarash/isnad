"use client"

import React, { useEffect, useRef } from "react"
import * as d3 from "d3"

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
  const svgRef = useRef<SVGSVGElement>(null)

  // Transform data for D3
  const { nodes, links } = React.useMemo(() => {
    const nodesMap = new Map()
    const linksSet = new Set()

    hadithData.forEach(hadith => {
      hadith.transmissionChains.forEach(chain => {
        chain.Narrators.forEach((narrator, index) => {
          if (!nodesMap.has(narrator.NarratorID)) {
            nodesMap.set(narrator.NarratorID, {
              id: narrator.NarratorID,
              name: narrator.NarratorName,
              rank: narrator.NarratorGen,
              layer: parseInt(narrator.NarratorID) % 5
            })
          }

          if (index < chain.Narrators.length - 1) {
            const nextNarrator = chain.Narrators[index + 1]
            linksSet.add(JSON.stringify({
              source: narrator.NarratorID,
              target: nextNarrator.NarratorID
            }))
          }
        })
      })
    })

    return {
      nodes: Array.from(nodesMap.values()),
      links: Array.from(linksSet).map(l => JSON.parse(l))
    }
  }, [hadithData])

  useEffect(() => {
    if (!svgRef.current) return

    d3.select(svgRef.current).selectAll("*").remove()

    const container = d3.select(svgRef.current)
    const width = window.innerWidth
    const height = window.innerHeight

    const svg = container
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .style("background", "white")

    const zoom = d3
      .zoom()
      .scaleExtent([0.5, 2])
      .on("zoom", (event) => {
        g.attr("transform", event.transform)
      })

    container.call(zoom as any)

    const g = svg.append("g")

    const simulation = d3
      .forceSimulation(nodes)
      .force(
        "link",
        d3.forceLink(links).id((d: any) => d.id),
      )
      .force("charge", d3.forceManyBody().strength(-100))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force(
        "y",
        d3.forceY().y((d: any) => (d.layer * height) / 7),
      )

    const link = g
      .selectAll(".link")
      .data(links)
      .enter()
      .append("line")
      .attr("class", "link")
      .style("stroke", "#999")
      .style("stroke-opacity", 0.6)
      .style("stroke-width", 2)

    const nodeGroup = g
      .selectAll(".node-group")
      .data(nodes)
      .enter()
      .append("g")
      .attr("class", "node-group")

    nodeGroup
      .append("circle")
      .attr("r", 10)
      .style("fill", (d: any) => generationColors[d.rank])

    nodeGroup
      .append("text")
      .attr("dy", -15)
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .style("fill", "#4b5563")
      .text((d: any) => d.name)

    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y)

      nodeGroup.attr("transform", (d: any) => `translate(${d.x},${d.y})`)
    })

    return () => {
      simulation.stop()
    }
  }, [nodes, links])

  return (
    <div className="fixed inset-0">
      <svg ref={svgRef} className="w-full h-full" />
    </div>
  )
}

