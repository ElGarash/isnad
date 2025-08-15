import { GraphLink, GraphNode } from "./graph";
import { GraphConfiguration, GraphProps } from "react-d3-graph";

export interface GraphViewConfig<TNode extends GraphNode = GraphNode>
  extends Partial<GraphConfiguration<TNode, GraphLink>> {
  directed: boolean;
  nodeHighlightBehavior: boolean;
  linkHighlightBehavior: boolean;
  highlightDegree: number;
  highlightOpacity: number;
  maxZoom: number;
  minZoom: number;
  node: {
    size: {
      width: number;
      height: number;
    };
    viewGenerator: (nodeData: TNode) => JSX.Element;
    renderLabel: boolean;
  };
  link?: {
    strokeWidth?: number;
    highlightColor?: string;
    type?: "STRAIGHT" | "CURVE_SMOOTH" | "CURVE_FULL";
    strokeLinecap?: "round" | "butt" | "square";
    color?: string;
    opacity?: number;
  };
  d3?: {
    gravity?: number;
    linkLength?: number;
    linkStrength?: number;
    alphaTarget?: number;
  };
  width: number;
  height: number;
}

export interface CustomGraphProps<
  TNode extends GraphNode,
  TLink extends GraphLink,
> extends Partial<GraphProps<TNode, TLink>> {
  id: string;
  data: {
    nodes: TNode[];
    links: TLink[];
  };
  config: GraphViewConfig<TNode>;
}
