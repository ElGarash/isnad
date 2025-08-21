"use client";

import NarratorCard from "./narrator-card";
import NetworkWorkspace from "./network-workspace";
import { GraphLink, NarratorGraphNode } from "@/lib/types/graph";
import type {
  CustomGraphProps,
  GraphViewConfig,
} from "@/lib/types/graph-config";
import tailwindConfig from "@/tailwind.config";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef } from "react";
import { Graph } from "react-d3-graph";

const TypedGraph = Graph as unknown as React.ComponentType<
  CustomGraphProps<NarratorGraphNode, GraphLink>
>;

interface NetworkGraphProps {
  graphData:
    | {
        nodes: NarratorGraphNode[];
        links: GraphLink[];
      }
    | ((dimensions: { width: number; height: number }) => {
        nodes: NarratorGraphNode[];
        links: GraphLink[];
      });
  onLinkClick?: (source: string, target: string) => void;
  enableAnimations?: boolean;
  directed?: boolean;
}

type AnimatedPath = SVGPathElement & {
  _animationFrame?: number | null;
  _animationInterval?: number | null;
};
type AnimatedElement = Element & { _animationFrame: number | null };

// Define colors using tailwind config values
const COLORS = {
  // @ts-expect-error color is defined in tailwind config
  default: tailwindConfig.theme!.extend!.colors!.navy,
  // @ts-expect-error color is defined in tailwind config
  hover: tailwindConfig.theme!.extend!.colors!.parchment,
  // @ts-expect-error color is defined in tailwind config
  glow: tailwindConfig.theme!.extend!.colors!.gold,
};

// Increase thickness for better hover interaction
const STROKE_WIDTH = {
  default: 3,
  hover: 4.5,
};

// Enhanced glow effect settings - refined for reduced shadow artifacts
const GLOW = {
  dotSize: 3, // Core light dot size
  beamLength: 25, // Reduced beam length to minimize overlap
  blurAmount: 2, // Significantly reduced blur to prevent shadow artifacts
  outerGlowWidth: 2.5, // Reduced outer glow width
  speedMultiplier: 2.5, // Higher speed multiplier for faster animation
  opacity: 0.8, // Slightly reduced opacity to prevent overdraw
  animationDuration: 1.2, // Even faster animation (was 1.5)
};
function animatePathElements(pathElements: NodeListOf<Element>) {
  console.log("Animating path elements:", pathElements);

  // Keep track of whether we've already animated to prevent duplicate animations
  const animatedPaths = new Set<string>();

  // Animate each path with staggered delay
  pathElements.forEach((pathElement, index) => {
    // The link elements are the path elements
    const path = pathElement as SVGPathElement;
    const pathId = path.id || `path-${index}`;

    // Skip if we've already animated this path
    if (animatedPaths.has(pathId)) {
      console.log(`Path ${pathId} already animated, skipping`);
      return;
    }

    try {
      console.log("Animating path element:", path);

      // Mark this path as being animated
      animatedPaths.add(pathId);

      // Make sure the path is visible with solid stroke
      path.style.opacity = "1";
      path.style.stroke = COLORS.default;
      path.style.strokeWidth = `${STROKE_WIDTH.default}px`;
      path.style.strokeDasharray = "none"; // Solid line
      path.style.transition = "stroke 0.2s, stroke-width 0.2s";

      // Add hover effect
      path.addEventListener("mouseover", () => {
        path.style.stroke = COLORS.hover;
        path.style.strokeWidth = `${STROKE_WIDTH.hover}px`;
      });

      path.addEventListener("mouseout", () => {
        path.style.stroke = COLORS.default;
        path.style.strokeWidth = `${STROKE_WIDTH.default}px`;
      });

      // Get the path length to animate the glowing dot
      let pathLength;
      try {
        pathLength = path.getTotalLength();
        console.log("Path length:", pathLength);
      } catch (e) {
        console.error("Error getting path length:", e);
        console.warn("Skipping path animation");
        return;
      }

      // Create a glowing dot effect
      createGlowingDotEffect(path, pathLength, index);
    } catch (err) {
      console.error("Error animating path:", err);
      // Make sure the path is visible even if animation fails
      path.style.opacity = "1";
      path.style.stroke = COLORS.default;
      path.style.strokeWidth = `${STROKE_WIDTH.default}px`;
    }
  });
}

function createGlowingDotEffect(
  path: SVGPathElement,
  pathLength: number,
  index: number,
) {
  // Get the SVG parent
  const svg = path.ownerSVGElement;
  if (!svg) {
    console.error("Could not find parent SVG element");
    return;
  }

  // Create SVG gradient for the beam effect - unique ID for each path
  const gradientId = `beam-gradient-${index}`;
  let gradient = svg.querySelector(`#${gradientId}`) as SVGGradientElement;

  // Only create gradient if it doesn't exist yet
  if (!gradient) {
    const svgNS = "http://www.w3.org/2000/svg";
    gradient = document.createElementNS(svgNS, "linearGradient");
    gradient.id = gradientId;
    gradient.setAttribute("gradientUnits", "userSpaceOnUse");

    // Use the path to set gradient coordinates dynamically
    // This makes the gradient follow the path direction
    const pathPoints = getPathEndpoints(path);

    gradient.setAttribute("x1", pathPoints.start.x.toString());
    gradient.setAttribute("y1", pathPoints.start.y.toString());
    gradient.setAttribute("x2", pathPoints.end.x.toString());
    gradient.setAttribute("y2", pathPoints.end.y.toString());

    // Modify gradient stops for rocket thrust effect - more white at front
    const stops = [
      { offset: "0%", color: "white", opacity: "1" },
      { offset: "20%", color: "white", opacity: "0.9" }, // Extended white section
      { offset: "40%", color: COLORS.glow, opacity: "1" },
      { offset: "100%", color: COLORS.glow, opacity: "0" },
    ];

    stops.forEach((stopData) => {
      const stop = document.createElementNS(svgNS, "stop");
      stop.setAttribute("offset", stopData.offset);
      stop.setAttribute("stop-color", stopData.color);
      stop.setAttribute("stop-opacity", stopData.opacity);
      gradient.appendChild(stop);
    });

    // Add the gradient to the SVG defs
    let defs = svg.querySelector("defs");
    if (!defs) {
      defs = document.createElementNS(svgNS, "defs");
      svg.appendChild(defs);
    }
    defs.appendChild(gradient);
  }

  // First create a wider glowing effect for the thrust base
  const glowPath = path.cloneNode() as AnimatedPath;
  const pathId = path.id || `path-${index}`;
  glowPath.id = `glow-${pathId}`;
  glowPath.classList.add("animation-clone");
  glowPath.style.stroke = COLORS.glow;
  glowPath.style.strokeWidth = `${STROKE_WIDTH.default * GLOW.outerGlowWidth}px`;
  glowPath.style.strokeLinecap = "round";
  glowPath.style.strokeDasharray = `${GLOW.beamLength * 0.6}, ${pathLength - GLOW.beamLength * 0.6}`;
  glowPath.style.strokeDashoffset = `${pathLength}`;
  glowPath.style.opacity = `${GLOW.opacity * 0.6}`;
  glowPath.style.filter = `blur(${GLOW.blurAmount}px)`; // Reduced blur
  glowPath.style.mixBlendMode = "multiply"; // Prevent additive blending that causes artifacts

  // Insert the base glow first (bottom layer)
  path.parentNode?.insertBefore(glowPath, path.nextSibling); // Now create a trailing beam effect with gradient - narrower but brighter
  const beamPath = path.cloneNode() as SVGPathElement;
  beamPath.id = `beam-${pathId}`;
  beamPath.style.stroke = `url(#${gradientId})`;
  beamPath.style.strokeWidth = `${STROKE_WIDTH.default * 1.2}px`; // Reduced width
  beamPath.style.strokeLinecap = "round";
  beamPath.style.strokeDasharray = `${GLOW.beamLength * 0.8}, ${pathLength - GLOW.beamLength * 0.8}`;
  beamPath.style.strokeDashoffset = `${pathLength}`;
  beamPath.style.opacity = `${GLOW.opacity}`;
  beamPath.style.filter = `blur(${GLOW.blurAmount * 0.2}px)`; // Minimal blur for beam
  beamPath.style.mixBlendMode = "normal"; // Normal blending for the main beam

  // Insert the beam on top of the glow
  path.parentNode?.insertBefore(beamPath, glowPath.nextSibling);

  // Create a bright dot at the head of the beam
  const dotPath = path.cloneNode() as SVGPathElement;
  dotPath.id = `dot-${pathId}`;
  dotPath.style.stroke = "white";
  dotPath.style.strokeWidth = `${STROKE_WIDTH.default * 1.2}px`; // Slightly reduced dot size
  dotPath.style.strokeLinecap = "round";
  dotPath.style.strokeDasharray = `${GLOW.dotSize}, ${pathLength}`;
  dotPath.style.strokeDashoffset = `${pathLength}`;
  dotPath.style.opacity = `${GLOW.opacity}`;
  dotPath.style.filter = "none"; // No blur for sharp dot
  dotPath.style.mixBlendMode = "normal"; // Normal blending

  // Insert the dot on top of everything
  path.parentNode?.insertBefore(dotPath, null);

  // Animate the rocket thrust with consistent timing but faster
  let start: number | null = null;
  const animateRocketThrust = (timestamp: number) => {
    if (!start) start = timestamp;
    const elapsed = timestamp - start;
    const loopDuration = GLOW.animationDuration * 1000; // Convert to milliseconds

    // Calculate the current offset position
    const progress = (elapsed % loopDuration) / loopDuration;
    const currentOffset = pathLength - progress * pathLength;

    // Apply the offset with variations to create rocket thrust effect
    // The glow should be slightly behind the beam for thrust effect
    glowPath.style.strokeDashoffset = `${currentOffset + 3}`; // Glow slightly behind
    beamPath.style.strokeDashoffset = `${currentOffset}`; // Main beam in middle
    dotPath.style.strokeDashoffset = `${currentOffset}`; // Dot at the front

    // Continue the animation
    glowPath._animationFrame = requestAnimationFrame(animateRocketThrust);
  };

  // Start the animation after a minimal delay
  setTimeout(
    () => {
      glowPath._animationFrame = requestAnimationFrame(animateRocketThrust);
    },
    index * 0.03 * 1000,
  ); // Very small stagger for nearly simultaneous effect
}

// Helper function to get path start and end points for gradient orientation
function getPathEndpoints(path: SVGPathElement): {
  start: { x: number; y: number };
  end: { x: number; y: number };
} {
  try {
    // Default values in case calculation fails
    const defaultResult = {
      start: { x: 0, y: 0 },
      end: { x: 100, y: 0 },
    };

    // Try to get the actual path points
    if (path && path.getPointAtLength) {
      const pathLength = path.getTotalLength();
      if (pathLength > 0) {
        const startPoint = path.getPointAtLength(0);
        const endPoint = path.getPointAtLength(pathLength);
        return {
          start: {
            x: startPoint.x,
            y: startPoint.y,
          },
          end: {
            x: endPoint.x,
            y: endPoint.y,
          },
        };
      }
    }
    return defaultResult;
  } catch (e) {
    console.error("Error getting path endpoints:", e);
    return {
      start: { x: 0, y: 0 },
      end: { x: 100, y: 0 },
    };
  }
}

// Add a helper function to create global CSS hover styles
function addGlobalHoverStyles() {
  // Check if we've already added styles
  if (document.getElementById("isnad-path-hover-styles")) return;

  // Create a style element for global hover effects
  const styleEl = document.createElement("style");
  styleEl.id = "isnad-path-hover-styles";
  styleEl.innerHTML = `
    .link:hover {
      stroke: ${COLORS.hover} !important;
      stroke-width: ${STROKE_WIDTH.hover}px !important;
      cursor: pointer;
    }
    path:hover {
      stroke: ${COLORS.hover} !important;
      stroke-width: ${STROKE_WIDTH.hover}px !important;
      cursor: pointer;
    }
  `;
  document.head.appendChild(styleEl);
}

// Add a cleanup function for when component unmounts
function cleanupAnimations() {
  // Find all glow paths and cancel their animation frames
  const glowPaths: NodeListOf<AnimatedElement> = document.querySelectorAll(
    "[id^='glow-'], [id^='halo-'], [id^='trail-'], [id^='light-dot-']",
  );
  glowPaths.forEach((path) => {
    if (path._animationFrame) {
      cancelAnimationFrame(path._animationFrame);
      path._animationFrame = null;
    }
  });

  // Remove the added paths
  const addedPaths = document.querySelectorAll(
    ".animation-clone, [id^='glow-'], [id^='dot-'], [id^='halo-'], [id^='trail-'], [id^='light-dot-']",
  );
  addedPaths.forEach((path) => path.parentNode?.removeChild(path));

  // Clear intervals from any original paths
  const paths: NodeListOf<AnimatedPath> = document.querySelectorAll("path");
  paths.forEach((path) => {
    if (path._animationInterval) {
      clearInterval(path._animationInterval);
      path._animationInterval = null;
    }
  });

  // Also remove any gradients we created
  const gradients = document.querySelectorAll("[id^='beam-gradient-']");
  gradients.forEach((gradient) => {
    if (gradient.parentNode) {
      gradient.parentNode.removeChild(gradient);
    }
  });
} // Add functionality to restart animations when paths come into view
function setupAnimationRestartOnScroll() {
  // Store whether animations are currently running
  const animationsActive = { value: true };
  let scrollTimeout: Timer | null = null;

  // Function to check visibility and restart animations if needed
  const checkVisibilityAndRestart = () => {
    if (scrollTimeout) clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      const isGraphVisible = () => {
        const container = document.getElementById("isnad-graph-container");
        if (!container) return false;

        const rect = container.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
        return isVisible;
      };

      if (isGraphVisible()) {
        if (!animationsActive.value) {
          // Restart animations by refreshing all paths
          const paths = document.querySelectorAll(".link, path");
          if (paths.length) {
            console.log("Graph is visible, restarting animations");
            cleanupAnimations();
            animatePathElements(paths as NodeListOf<Element>);
            animationsActive.value = true;
          }
        }
      } else {
        // Graph is not visible, mark animations as inactive
        animationsActive.value = false;
      }
    }, 100);
  };

  // Set up scroll listener
  window.addEventListener("scroll", checkVisibilityAndRestart, {
    passive: true,
  });

  // Clean up function
  return () => {
    window.removeEventListener("scroll", checkVisibilityAndRestart);
    if (scrollTimeout) {
      clearTimeout(scrollTimeout);
    }
  };
}

function useAnimateLinks(enableAnimations: boolean) {
  useEffect(() => {
    if (!enableAnimations) return;

    // Add global hover styles as a fallback approach
    addGlobalHoverStyles();

    // Set up scroll-based animation restart
    const cleanupScrollListener = setupAnimationRestartOnScroll();

    // We'll try to find and animate links once after a delay
    const timer = setTimeout(() => {
      console.log("Looking for links to animate");

      // Try multiple selector strategies to find the links
      let links: NodeListOf<Element> | Element[] =
        document.querySelectorAll(".link");

      if (links.length === 0) {
        console.log("No .link elements found, trying direct path selector");
        const svgs = document.querySelectorAll("svg");

        if (svgs.length > 0) {
          // Find all paths in all SVGs
          const allPaths: Element[] = [];
          svgs.forEach((svg) => {
            const paths = svg.querySelectorAll("path");
            paths.forEach((path) => allPaths.push(path));
          });

          console.log(`Found ${allPaths.length} paths in SVGs`);

          if (allPaths.length > 0) {
            // Use all paths if we can't find specific link paths
            links = allPaths;
          }
        }
      }

      console.log(`Found ${links.length} elements to animate`);

      // If we found any links, animate them
      if (links.length > 0) {
        animatePathElements(links as NodeListOf<Element>);
      } else {
        console.warn("Could not find any links or paths to animate");
      }
    }, 1000); // Give the graph time to render

    // Clean up animations when component unmounts
    return () => {
      clearTimeout(timer);
      cleanupAnimations();
      cleanupScrollListener(); // Clean up scroll listener

      // Clean up the style element
      const styleEl = document.getElementById("isnad-path-hover-styles");
      if (styleEl) styleEl.remove();
    };
  }, [enableAnimations]);
}
export default function NetworkGraph({
  graphData: graphDataOrFunction,
  onLinkClick,
  enableAnimations = true,
  directed = false,
}: NetworkGraphProps) {
  const graphRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Use our simplified animation approach
  useAnimateLinks(enableAnimations);

  const defaultOnLinkClick = (
    source: string,
    target: string,
    nodeMap: Map<string, NarratorGraphNode>,
  ) => {
    const sourceNode = nodeMap.get(source);
    const targetNode = nodeMap.get(target);

    if (sourceNode && targetNode) {
      router.push(
        `/narrator/${encodeURIComponent(sourceNode.name)}/to/${encodeURIComponent(targetNode.name)}`,
      );
    }
  };

  return (
    <NetworkWorkspace>
      {(dimensions) => {
        // Calculate graph data based on dimensions
        const graphData =
          typeof graphDataOrFunction === "function"
            ? graphDataOrFunction(dimensions)
            : graphDataOrFunction;

        // Create a Map for O(1) node lookups
        const nodeMap = new Map(graphData.nodes.map((node) => [node.id, node]));

        const graphConfig: GraphViewConfig = {
          directed,
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
            viewGenerator: (nodeData: NarratorGraphNode) => (
              <NarratorCard {...nodeData} />
            ),
            renderLabel: false,
          },
          width: dimensions.width,
          height: dimensions.height,
          link: {
            strokeWidth: STROKE_WIDTH.default,
            color: COLORS.default,
            highlightColor: COLORS.hover,
            opacity: 1,
            strokeLinecap: "round", // Rounded edges for smoother appearance
            type: "STRAIGHT",
          },
        };

        return (
          <div id="isnad-graph-container" ref={graphRef}>
            {graphData.nodes.length > 0 && (
              <TypedGraph
                id="isnad"
                data={graphData}
                config={graphConfig}
                onClickLink={
                  onLinkClick ||
                  ((source, target) =>
                    defaultOnLinkClick(source, target, nodeMap))
                }
              />
            )}
          </div>
        );
      }}
    </NetworkWorkspace>
  );
}
