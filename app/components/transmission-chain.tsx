"use client";

import NarratorCard from "./narrator-card";
import React, { useEffect, useState } from "react";
import { Graph } from "react-d3-graph";

interface HadithChainProps {
  hadithData: {
    hadithNo: string;
    transmissionChains: {
      sanadNo: number;
      narrators: {
        narratorId: string;
        narratorName: string;
        narratorGen: number; // Changed from string to number to match SQLite position
      }[];
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

const viewGenerator = (nodeData: any) => {
  const person = {
    id: nodeData.id,
    name: nodeData.name,
    generation: nodeData.generation,
    rank: nodeData.rank,
    status: nodeData.status,
  };

  return <NarratorCard person={person} />;
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

    // Add root node (Prophet PBUH) centered
    const rootNodeId = "prophet-pbuh";
    nodes.push({
      id: rootNodeId,
      name: "The Prophet (PBUH)",
      color: "#FFD700",
      symbolType: "circle",
      labelPosition: "left",
      x: rootX,
      y: verticalSpacing / 2,
      fx: rootX,
      fy: verticalSpacing / 2,
    });
    seenNodes.add(rootNodeId);

    // Add author node at the bottom
    const authorNodeId = "author-node";
    nodes.push({
      id: authorNodeId,
      name: "Muslim",
      generation: "",
      rank: "",
      status: "",
      x: rootX,
      y: (maxChainLength + 1) * verticalSpacing,
      fx: rootX,
      fy: (maxChainLength + 1) * verticalSpacing,
    });
    seenNodes.add(authorNodeId);

    // Track leaf nodes to connect them to author

    // First pass: determine maximum chain length and group nodes by level
    // Group nodes by their level
    hadithData.transmissionChains.forEach((chain) => {
      chain.narrators.forEach((narrator, index) => {
        if (!levelNodes.has(index)) {
          levelNodes.set(index, []);
        }
        if (!levelNodes.get(index)?.includes(narrator.narratorId)) {
          levelNodes.get(index)?.push(narrator.narratorId);
        }
      });
    });

    // Create nodes with positions - modified to maintain vertical alignment
    hadithData.transmissionChains.forEach((chain) => {
      let parentX: number | null = null;

      chain.narrators.forEach((narrator, index) => {
        if (!seenNodes.has(narrator.narratorId)) {
          seenNodes.add(narrator.narratorId);
          const yPosition = (index + 1) * verticalSpacing;

          const nodesAtLevel = levelNodes.get(index) || [];
          const position = nodesAtLevel.indexOf(narrator.narratorId);
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
          nodePositions.set(narrator.narratorId, {
            x: xPosition,
            y: yPosition,
          });

          const centerPoint = dimensions.width / 2;
          const isRightSide = xPosition > centerPoint;

          nodes.push({
            id: narrator.narratorId,
            name: narrator.narratorName,
            color:
              generationColors[
              narrator.narratorGen as keyof typeof generationColors
              ] || generationColors.default,
            symbolType: "circle",
            labelPosition: isRightSide ? "right" : "left",
            x: xPosition,
            y: yPosition,
            fx: xPosition, // Fix x position
            fy: yPosition, // Fix y position
          });
        }

        // Connect first-level narrators to the Prophet's node
        if (index === 0) {
          links.push({
            source: rootNodeId,
            target: narrator.narratorId,
            type: "STRAIGHT",
          });
        }

        // Update links
        if (index < chain.narrators.length - 1) {
          const nextNarrator = chain.narrators[index + 1];
          links.push({
            source: narrator.narratorId,
            target: nextNarrator.narratorId,
            type: "STRAIGHT",
          });
        }

        // Connect last narrator to author
        if (index === chain.narrators.length - 1) {
          links.push({
            source: narrator.narratorId,
            target: authorNodeId,
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
        width: 1200, // Match actual card width
        height: 1400, // Match actual card height
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
