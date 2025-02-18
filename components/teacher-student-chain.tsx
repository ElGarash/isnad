"use client";

import NarratorCard from "./narrator-card";
import NetworkWorkspace from "./network-workspace";
import { Narrator } from "@/lib/sqlite";
import React from "react";
import { Graph } from "react-d3-graph";

interface TeacherStudentChainProps {
  chainData: {
    central: Narrator;
    teachers: Narrator[];
    students: Narrator[];
  };
}

function calculateGraphData(
  chainData: TeacherStudentChainProps["chainData"],
  width: number,
) {
  const nodes: any[] = [];
  const links: any[] = [];
  const { central, teachers, students } = chainData;

  const nodeWidth = 120;
  const nodeHeight = 140;
  const verticalSpacing = nodeHeight * 1.5;
  const topMargin = nodeHeight / 2;
  const horizontalSpacing = 200;

  const rootX = width / 2;

  // Position teachers
  teachers.forEach((teacher, index) => {
    const id = teacher.scholar_indx.toString();
    const offset =
      teachers.length % 2 === 0
        ? (index - teachers.length / 2 + 0.5) * horizontalSpacing
        : (index - Math.floor(teachers.length / 2)) * horizontalSpacing;
    nodes.push({ ...teacher, id, x: rootX + offset, y: topMargin });
    links.push({
      source: id,
      target: central.scholar_indx.toString(),
      type: "STRAIGHT",
    });
  });

  // Position central node
  nodes.push({
    ...central,
    id: central.scholar_indx.toString(),
    x: rootX,
    y: topMargin + verticalSpacing,
  });

  // Position students
  students.forEach((student, index) => {
    const id = student.scholar_indx.toString();
    const offset =
      students.length % 2 === 0
        ? (index - students.length / 2 + 0.5) * horizontalSpacing
        : (index - Math.floor(students.length / 2)) * horizontalSpacing;
    nodes.push({
      ...student,
      id,
      x: rootX + offset,
      y: topMargin + 2 * verticalSpacing,
    });
    links.push({
      source: central.scholar_indx.toString(),
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
