"use client";

import NetworkGraph from "./network-graph";
import type { HadithWithChain } from "@/lib/sqlite";
import { GraphLink, NarratorGraphNode } from "@/lib/types/graph";
import React from "react";

interface HadithChainProps {
  hadithData: {
    hadithNo: string;
    transmissionChains: {
      sanadNo: number;
      narrators: HadithWithChain[];
    }[];
  };
}

function calculateHadithGraphData(
  hadithData: HadithChainProps["hadithData"],
  dimensions: { width: number; height: number },
): { nodes: NarratorGraphNode[]; links: GraphLink[] } {
  const nodes: NarratorGraphNode[] = [];
  const links: GraphLink[] = [];
  const seenNodes = new Set();
  const levelNodes = new Map<number, string[]>();

  const nodeWidth = 120;
  const nodeHeight = 140;
  const verticalSpacing = nodeHeight * 1.5;
  const topMargin = nodeHeight / 2;
  const horizontalOffset = nodeWidth;

  const rootX = dimensions.width / 2;

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

  hadithData.transmissionChains.forEach((chain) => {
    let parentX: number | null = null;
    chain.narrators.forEach((narrator, index) => {
      if (!seenNodes.has(narrator.scholar_indx.toString())) {
        seenNodes.add(narrator.scholar_indx.toString());
        const yPosition = topMargin + index * verticalSpacing;
        const nodesAtLevel = levelNodes.get(index) || [];
        const position = nodesAtLevel.indexOf(narrator.scholar_indx.toString());
        const totalNodesAtLevel = nodesAtLevel.length;
        let xPosition;
        if (totalNodesAtLevel === 1) {
          xPosition = rootX;
        } else {
          xPosition =
            parentX ??
            horizontalOffset +
              (position * (dimensions.width - 2 * horizontalOffset)) /
                Math.max(totalNodesAtLevel - 1, 1);
        }

        xPosition = Math.max(
          horizontalOffset,
          Math.min(dimensions.width - horizontalOffset, xPosition),
        );
        parentX = xPosition;

        // Convert HadithWithChain to NarratorGraphNode
        nodes.push({
          ...narrator, // This includes all Narrator properties
          id: narrator.scholar_indx.toString(),
          x: xPosition,
          y: yPosition,
        });
      }

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
}

export default function HadithTransmissionChain({
  hadithData,
}: HadithChainProps) {
  return (
    <NetworkGraph
      graphData={(dimensions) =>
        calculateHadithGraphData(hadithData, dimensions)
      }
      enableAnimations={true}
    />
  );
}
