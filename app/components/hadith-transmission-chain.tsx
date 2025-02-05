"use client"

import React, { useEffect, useRef, useState } from "react"
import * as d3 from "d3"
import { motion, AnimatePresence } from "framer-motion"
import { X, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface Person {
  id: string
  name: string
  rank: "Companion" | "Follower" | "Scholar" | "Collector" | "Commentator" | "Contemporary"
  info: string
  layer: number
}

interface Link {
  source: string
  target: string
}

interface HadithChainProps {
  people: Person[]
  links: Link[]
  hadithText: string
}

const rankColors = {
  Companion: "#4CAF50",
  Follower: "#2196F3",
  Scholar: "#FFC107",
  Collector: "#FF5722",
  Commentator: "#9C27B0",
  Contemporary: "#607D8B",
}

export default function HadithTransmissionChain({ people, links, hadithText }: HadithChainProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null)

  useEffect(() => {
    if (!svgRef.current) return

    // Clear previous SVG content
    d3.select(svgRef.current).selectAll("*").remove()

    const container = d3.select(svgRef.current)
    const width = selectedPerson ? 500 : 800 // Adjust width based on panel state
    const height = 600

    // Create background pattern
    const svg = container.attr("width", width).attr("height", height).attr("viewBox", `0 0 ${width} ${height}`)

    // Add zoom behavior
    const zoom = d3
      .zoom()
      .scaleExtent([0.5, 2])
      .on("zoom", (event) => {
        g.attr("transform", event.transform)
      })

    container.call(zoom as any)

    // Create a group for the graph
    const g = svg.append("g")

    const simulation = d3
      .forceSimulation(people)
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
      .data(people)
      .enter()
      .append("g")
      .attr("class", "node-group cursor-pointer")
      .on("click", (event: MouseEvent, d: Person) => {
        setSelectedPerson(d)
      })

    // Add circles for nodes
    nodeGroup
      .append("circle")
      .attr("r", 10)
      .style("fill", (d: Person) => rankColors[d.rank])
      .on("mouseover", function (event, d) {
        d3.select(this).transition().duration(300).attr("r", 15)
      })
      .on("mouseout", function (event, d) {
        d3.select(this).transition().duration(300).attr("r", 10)
      })

    // Add labels
    nodeGroup
      .append("text")
      .attr("dy", -15)
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .style("fill", "#4b5563")
      .text((d: Person) => d.name)

    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y)

      nodeGroup.attr("transform", (d: any) => `translate(${d.x},${d.y})`)
    })

    // Cleanup
    return () => {
      simulation.stop()
    }
  }, [people, links, selectedPerson])

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex flex-1 overflow-hidden">
        {/* Hadith Text Panel */}
        <div className="w-1/4 p-6 bg-white/90 border-r shadow-lg overflow-y-auto">
          <h2 className="text-2xl font-bold mb-4">Hadith Text</h2>
          <p className="text-lg leading-relaxed">{hadithText}</p>
        </div>

        {/* Graph Panel */}
        <div className={`transition-all duration-300 ease-in-out ${selectedPerson ? "w-1/2" : "w-3/4"} relative`}>
          <svg ref={svgRef} className="w-full h-full" />
        </div>

        {/* Info Panel */}
        <AnimatePresence>
          {selectedPerson && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: "25%", opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white/90 shadow-lg overflow-hidden border-l"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-2xl font-bold">{selectedPerson.name}</h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedPerson(null)}
                    className="hover:bg-gray-100"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div
                  className="inline-block px-3 py-1 mb-4 rounded-full text-sm"
                  style={{ backgroundColor: rankColors[selectedPerson.rank], color: "white" }}
                >
                  {selectedPerson.rank}
                </div>

                <div className="prose prose-sm mb-4">
                  <p className="text-gray-700 leading-relaxed">{selectedPerson.info}</p>
                </div>

                <Link
                  href={`/transmissions/${selectedPerson.id}`}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  View All Chains for {selectedPerson.name}
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

