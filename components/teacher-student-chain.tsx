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

  const nodeHeight = 140;
  const verticalSpacing = nodeHeight * 1.5;
  const topMargin = nodeHeight / 2;
  const horizontalSpacing = 200;

  const rootX = width / 2;

  // Position teachers
  predecessors.forEach((teacher, index) => {
    const id = teacher.scholar_indx.toString();
    const offset =
      predecessors.length % 2 === 0
        ? (index - predecessors.length / 2 + 0.5) * horizontalSpacing
        : (index - Math.floor(predecessors.length / 2)) * horizontalSpacing;
    nodes.push({ ...teacher, id, x: rootX + offset, y: topMargin });
    links.push({
      source: id,
      target: narrator.scholar_indx.toString(),
      type: "STRAIGHT",
    });
  });

  // Position central node
  nodes.push({
    ...narrator,
    id: narrator.scholar_indx.toString(),
    x: rootX,
    y: topMargin + verticalSpacing,
  });

  // Position students
  successors.forEach((student, index) => {
    const id = student.scholar_indx.toString();
    const offset =
      successors.length % 2 === 0
        ? (index - successors.length / 2 + 0.5) * horizontalSpacing
        : (index - Math.floor(successors.length / 2)) * horizontalSpacing;
    nodes.push({
      ...student,
      id,
      x: rootX + offset,
      y: topMargin + 2 * verticalSpacing,
    });
    links.push({
      source: narrator.scholar_indx.toString(),
      target: id,
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
          minZoom: 0.1,
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
              <Graph
                id="teacher-student-graph"
                data={graphData}
                config={graphConfig}
              />
            )}
          </>
        );
      }}
    </NetworkWorkspace>
  );
}
