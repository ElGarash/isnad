"use client";

import NarratorCard from "./narrator-card";
import type { HadithWithChain } from "@/lib/sqlite";
import tailwindConfig from "@/tailwind.config";
import React, { useEffect, useRef, useState } from "react";
import { Graph } from "react-d3-graph";

interface HadithChainProps {
  hadithData: {
    hadithNo: string;
    transmissionChains: {
      sanadNo: number;
      narrators: HadithWithChain[];
    }[];
  };
}

const viewGenerator = (nodeData: HadithWithChain | any) => {
  // FIXME: the type of nodeData is not correct
  return <NarratorCard {...nodeData} />;
};

export default function HadithTransmissionChain({
  hadithData,
}: HadithChainProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions({
          width: width - 40, // Subtract padding
          height: height - 40, // Subtract padding
        });
      }
    };

    updateDimensions();
    const resizeObserver = new ResizeObserver(updateDimensions);

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, []);

  // Transform data for react-d3-graph
  const graphData = React.useMemo(() => {
    const nodes: any[] = [];
    const links: any[] = [];
    const seenNodes = new Set();
    const levelNodes = new Map<number, string[]>();
    const nodePositions = new Map<string, { x: number; y: number }>();

    const nodeWidth = 120;
    const nodeHeight = 140;
    // Calculate spacing values
    const maxChainLength = Math.max(
      ...hadithData.transmissionChains.map((c) => c.narrators.length),
    );
    const verticalSpacing = Math.max(
      dimensions.height / (maxChainLength + 1),
      nodeHeight * 1.5,
    );
    const topMargin = nodeHeight / 2; // Add top margin
    const horizontalOffset = Math.max(dimensions.width * 0.005, nodeWidth); // Reduced from 0.1 to 0.05

    const rootX = dimensions.width / 2; // Store root X position for centering

    // Track leaf nodes to connect them to author

    // First pass: determine maximum chain length and group nodes by level
    // Group nodes by their level
    hadithData.transmissionChains.forEach((chain) => {
      chain.narrators.forEach((narrator, index) => {
        if (!levelNodes.has(index)) {
          levelNodes.set(index, []);
        }
        if (
          !levelNodes.get(index)?.includes(narrator.scholar_indx.toString())
        ) {
          levelNodes.get(index)?.push(narrator.scholar_indx.toString());
        }
      });
    });

    // Create nodes with positions - modified to maintain vertical alignment
    hadithData.transmissionChains.forEach((chain) => {
      let parentX: number | null = null;

      chain.narrators.forEach((narrator, index) => {
        if (!seenNodes.has(narrator.scholar_indx.toString())) {
          seenNodes.add(narrator.scholar_indx.toString());
          // Invert the y-position calculation to start from top
          const yPosition = topMargin + index * verticalSpacing;

          const nodesAtLevel = levelNodes.get(index) || [];
          const position = nodesAtLevel.indexOf(
            narrator.scholar_indx.toString(),
          );
          const totalNodesAtLevel = nodesAtLevel.length;

          // Calculate x position with special handling for single nodes
          let xPosition;
          if (totalNodesAtLevel === 1) {
            // Center single nodes with root node
            xPosition = rootX;
          } else {
            xPosition =
              parentX ??
              horizontalOffset +
                (position * (dimensions.width - 2 * horizontalOffset)) /
                  Math.max(totalNodesAtLevel - 1, 1);
          }

          // Ensure xPosition stays within bounds
          xPosition = Math.max(
            horizontalOffset,
            Math.min(dimensions.width - horizontalOffset, xPosition),
          );

          parentX = xPosition;
          nodePositions.set(narrator.scholar_indx.toString(), {
            x: xPosition,
            y: yPosition,
          });

          const centerPoint = dimensions.width / 2;
          const isRightSide = xPosition > centerPoint;

          nodes.push({
            ...narrator, // Spread all narrator properties
            id: narrator.scholar_indx.toString(),
            x: xPosition,
            y: yPosition,
            fx: xPosition, // Fix x position
            fy: yPosition, // Fix y position
          });
        }

        // Update links
        if (index < chain.narrators.length - 1) {
          const nextNarrator = chain.narrators[index + 1];
          links.push({
            source: narrator.scholar_indx.toString(),
            target: nextNarrator.scholar_indx.toString(),
            type: "STRAIGHT",
          });
        }
      });
    });

    return { nodes, links };
  }, [hadithData, dimensions]);

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
        width: 1200,
        height: 1400,
      },
      viewGenerator,
      renderLabel: false,
    },
    link: {
      strokeWidth: 2,
      // @ts-ignore
      highlightColor: tailwindConfig.theme!.extend!.colors!.navy,
      type: "CURVE_SMOOTH",
      strokeLinecap: "round",
    },
    d3: {
      gravity: 0,
      linkLength: 15, // Reduced from 30
      linkStrength: 1,
      alphaTarget: 0,
    },
    height: dimensions.height,
    width: dimensions.width,
  };

  return (
    <div
      ref={containerRef}
      className="w-full h-full relative"
      style={{
        backgroundImage: `
        radial-gradient(circle at 1px 1px, #cbd5e1 1px, transparent 0),
        radial-gradient(circle at 20px 20px, #94a3b8 0.5px, transparent 0)`,
        backgroundSize: "20px 20px, 40px 40px",
      }}
    >
      {graphData.nodes.length > 0 && (
        /* @ts-ignore */
        <Graph id="hadith-graph" data={graphData} config={graphConfig} />
      )}
    </div>
  );
}
