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

    teachers.forEach((teacher) => {
      const id = teacher.scholar_indx.toString();
      nodes.push({ ...teacher, id });
      links.push({
        source: id,
        target: central.scholar_indx.toString(),
        type: "STRAIGHT",
      });
    });

    nodes.push({ ...central, id: central.scholar_indx.toString() });

    students.forEach((student) => {
      const id = student.scholar_indx.toString();
      nodes.push({ ...student, id });
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
