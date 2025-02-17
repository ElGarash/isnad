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

export default function TeacherStudentChain({
  chainData,
}: TeacherStudentChainProps) {
  const graphData = React.useMemo(() => {
    const nodes: any[] = [];
    const links: any[] = [];
    const { central, teachers, students } = chainData;

    const nodeWidth = 120;
    const nodeHeight = 140;
    const verticalSpacing = nodeHeight * 1.5;
    const topMargin = nodeHeight / 2;
    const horizontalOffset = nodeWidth;

    const rootX = 800 / 2; // Default value; will be overridden by dimensions later

    teachers.forEach((teacher, index) => {
      const id = teacher.scholar_indx.toString();
      const xPosition = horizontalOffset + index * 200;
      nodes.push({ ...teacher, id, x: xPosition, y: topMargin });
      links.push({
        source: id,
        target: central.scholar_indx.toString(),
        type: "STRAIGHT",
      });
    });

    nodes.push({
      ...central,
      id: central.scholar_indx.toString(),
      x: rootX,
      y: topMargin + verticalSpacing,
    });

    students.forEach((student, index) => {
      const id = student.scholar_indx.toString();
      const xPosition = horizontalOffset + index * 200;
      nodes.push({
        ...student,
        id,
        x: xPosition,
        y: topMargin + 2 * verticalSpacing,
      });
      links.push({
        source: central.scholar_indx.toString(),
        target: id,
        type: "STRAIGHT",
      });
    });

    return { nodes, links };
  }, [chainData]);

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
