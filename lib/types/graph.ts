import { HadithWithChain, Narrator } from "@/lib/sqlite";

export interface BaseGraphNode {
  id: string;
  x: number;
  y: number;
}

export interface GraphLink {
  source: string;
  target: string;
  type: "STRAIGHT";
}

export interface NarratorGraphNode extends Narrator, BaseGraphNode {}

export interface HadithGraphNode
  extends Omit<HadithWithChain, "id">,
    BaseGraphNode {
  fx: number;
  fy: number;
}

export type GraphNode = NarratorGraphNode | HadithGraphNode;
