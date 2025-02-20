"use client";

import NarratorCard from "./narrator-card";
import NetworkWorkspace from "./network-workspace";
import type { HadithWithChain } from "@/lib/sqlite";
import tailwindConfig from "@/tailwind.config";
import React from "react";
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

const viewGenerator = (nodeData: HadithWithChain) => {
  return <NarratorCard {...nodeData} />;
};

export default function HadithTransmissionChain({
  hadithData,
}: HadithChainProps) {
  const graphData = React.useMemo(() => {
    const nodes: any[] = [];
    const links: any[] = [];
    const seenNodes = new Set();
    const levelNodes = new Map<number, string[]>();

    const nodeWidth = 120;
    const nodeHeight = 140;
    const verticalSpacing = nodeHeight * 1.5;
    const topMargin = nodeHeight / 2;
    const horizontalOffset = nodeWidth;

    const rootX = 800 / 2; // Default value; will be overridden by dimensions later

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

    hadithData.transmissionChains.forEach((chain) => {
      let parentX: number | null = null;
      chain.narrators.forEach((narrator, index) => {
        if (!seenNodes.has(narrator.scholar_indx.toString())) {
          seenNodes.add(narrator.scholar_indx.toString());
          const yPosition = topMargin + index * verticalSpacing;
          const nodesAtLevel = levelNodes.get(index) || [];
          const position = nodesAtLevel.indexOf(
            narrator.scholar_indx.toString(),
          );
          const totalNodesAtLevel = nodesAtLevel.length;
          let xPosition;
          if (totalNodesAtLevel === 1) {
            xPosition = rootX;
          } else {
            xPosition =
              parentX ??
              horizontalOffset +
                (position * (800 - 2 * horizontalOffset)) /
                  Math.max(totalNodesAtLevel - 1, 1);
          }

          xPosition = Math.max(
            horizontalOffset,
            Math.min(800 - horizontalOffset, xPosition),
          );
          parentX = xPosition;
          nodes.push({
            ...narrator,
            id: narrator.scholar_indx.toString(),
            x: xPosition,
            y: yPosition,
            fx: xPosition,
            fy: yPosition,
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
  }, [hadithData]);

  return (
    <NetworkWorkspace>
      {(dimensions) => {
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
            linkLength: 15,
            linkStrength: 1,
            alphaTarget: 0,
          },
          width: dimensions.width,
          height: dimensions.height,
        };

        return (
          <>
            {graphData.nodes.length > 0 && (
              /* @ts-ignore */
              <Graph id="isnad" data={graphData} config={graphConfig} />
            )}
          </>
        );
      }}
    </NetworkWorkspace>
  );
}
