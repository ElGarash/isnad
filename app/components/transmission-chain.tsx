"use client";

import NarratorCard from "./narrator-card";
import React, { useEffect, useState } from "react";
import { Graph } from "react-d3-graph";
import type { Narrator, Chain } from "@/lib/sqlite";

type TransmissionChainNarrator = Narrator & Chain;

interface HadithChainProps {
  hadithData: {
    hadithNo: string;
    transmissionChains: {
      sanadNo: number;
      narrators: TransmissionChainNarrator[];
    }[];
  };
}

const generationColors = {
  1: "#4CAF50", // First generation
  2: "#2196F3", // Second generation
  3: "#FFC107", // Third generation
  4: "#9C27B0", // Fourth generation
  5: "#FF5722", // Fifth generation
  default: "#757575", // Default color for other generations
};

const viewGenerator = (nodeData: TransmissionChainNarrator | any) => {

  return <NarratorCard {...nodeData} />;
};

export default function HadithTransmissionChain({
  hadithData,
}: HadithChainProps) {
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  useEffect(() => {
    setDimensions({
      width: window.innerWidth,
      height: window.innerHeight,
    });

    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
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
        if (!levelNodes.get(index)?.includes(narrator.scholar_indx.toString())) {
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
          const yPosition = (index + 1) * verticalSpacing;

          const nodesAtLevel = levelNodes.get(index) || [];
          const position = nodesAtLevel.indexOf(narrator.scholar_indx.toString());
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
            id: narrator.scholar_indx.toString(),
            ...narrator, // Spread all narrator properties
            color:
              generationColors[
              narrator.position as keyof typeof generationColors
              ] || generationColors.default,
            symbolType: "circle",
            labelPosition: isRightSide ? "right" : "left",
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
        // Match actual card size
        width: 1200,
        height: 1600,
      },
      viewGenerator,
      renderLabel: false,
    },
    link: {
      strokeWidth: 2,
      highlightColor: "lightblue",
    },
    d3: {
      gravity: 0, // Disable gravity
      linkLength: 30,
      linkStrength: 1,
      alphaTarget: 0,
    },
    height: dimensions.height,
    width: dimensions.width,
  };

  return (
    <div className="fixed inset-0 bg-transparent">
      {/* @ts-ignore */}
      <Graph id="hadith-graph" data={graphData} config={graphConfig} />
    </div>
  );
}
