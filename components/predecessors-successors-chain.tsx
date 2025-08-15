"use client";

import NetworkGraph from "./network-graph";
import { Narrator } from "@/lib/sqlite";
import { GraphLink, NarratorGraphNode } from "@/lib/types/graph";
import React from "react";

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
): { nodes: NarratorGraphNode[]; links: GraphLink[] } {
  const nodes: NarratorGraphNode[] = [];
  const links: GraphLink[] = [];
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

  // Position successors on the left
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
    <NetworkGraph
      graphData={(dimensions) =>
        calculateGraphData(chainData, dimensions.width)
      }
      enableAnimations={true}
      directed={false}
    />
  );
}
