"use client";

import NarratorCard from "./narrator-card";
import NetworkWorkspace from "./network-workspace";
import { Narrator } from "@/lib/sqlite";
import React from "react";
import { Graph } from "react-d3-graph";

interface TeacherStudentChainProps {
  chainData: {
    narrator: Narrator;
    predecessors: Narrator[];
    successors: Narrator[];
  };
}

function calculateGraphData(
  chainData: TeacherStudentChainProps["chainData"],
  width: number,
) {
  const nodes: any[] = [];
  const links: any[] = [];
  const { narrator, predecessors, successors } = chainData;

  const nodeWidth = 200;
  const horizontalSpacing = nodeWidth * 1.5;
  const rightMargin = width - nodeWidth / 2;
  const verticalSpacing = 200;

  const rootY = width / 2;

  // Position predecessors on the right
  predecessors.forEach((teacher, index) => {
    const id = teacher.scholar_indx.toString();
    const offset =
      predecessors.length % 2 === 0
        ? (index - predecessors.length / 2 + 0.5) * verticalSpacing
        : (index - Math.floor(predecessors.length / 2)) * verticalSpacing;
    nodes.push({
      ...teacher,
      id,
      x: rightMargin,
      y: rootY + offset,
    });
    links.push({
      source: teacher.scholar_indx.toString(),
      target: narrator.scholar_indx.toString(),
      type: "STRAIGHT",
    });
  });

  // Position central node
  nodes.push({
    ...narrator,
    id: narrator.scholar_indx.toString(),
    x: rightMargin - horizontalSpacing,
    y: rootY,
  });

  // Position successors  on the left
  successors.forEach((student, index) => {
    const id = student.scholar_indx.toString();
    const offset =
      successors.length % 2 === 0
        ? (index - successors.length / 2 + 0.5) * verticalSpacing
        : (index - Math.floor(successors.length / 2)) * verticalSpacing;
    nodes.push({
      ...student,
      id,
      x: rightMargin - 2 * horizontalSpacing,
      y: rootY + offset,
    });
    links.push({
      source: narrator.scholar_indx.toString(),
      target: student.scholar_indx.toString(),
      type: "STRAIGHT",
    });
  });

  return { nodes, links };
}

export default function TeacherStudentChain({
  chainData,
}: TeacherStudentChainProps) {
  return (
    <NetworkWorkspace>
      {(dimensions) => {
        const graphData = React.useMemo(
          () => calculateGraphData(chainData, dimensions.width),
          [chainData, dimensions.width],
        );

        const graphConfig = {
          directed: true,
          nodeHighlightBehavior: true,
          linkHighlightBehavior: true,
          highlightDegree: 1,
          highlightOpacity: 0.2,
          maxZoom: 8,
          minZoom: 0.01,
          node: {
            size: {
              width: 1200,
              height: 1400,
            },
            viewGenerator: (nodeData: any) => <NarratorCard {...nodeData} />,
            renderLabel: false,
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
