"use client";

import NarratorCard from "./narrator-card";
import NetworkWorkspace from "./network-workspace";
import { Narrator } from "@/lib/sqlite";
import { GraphLink, NarratorGraphNode } from "@/lib/types/graph";
import type {
  CustomGraphProps,
  GraphViewConfig,
} from "@/lib/types/graph-config";
import tailwindConfig from "@/tailwind.config";
import React, { useEffect, useRef } from "react";
import { Graph } from "react-d3-graph";

const TypedGraph = Graph as unknown as React.ComponentType<
  CustomGraphProps<NarratorGraphNode, GraphLink>
>;

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

// Keep track of whether we've already animated to prevent duplicate animations
const animatedPaths = new Set<string>();

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

// Enhanced glow effect settings - refined for rocket thrust effect
const GLOW = {
  dotSize: 3,           // Core light dot size
  beamLength: 35,       // Longer beam for more prominent thrust (was 25)
  blurAmount: 5,        // Slightly increased blur for better glow effect
  outerGlowWidth: 4,    // Wider outer glow for more prominent thrust effect
  speedMultiplier: 2.5, // Higher speed multiplier for faster animation
  opacity: 0.95,        // High opacity for bright effect
  animationDuration: 1.2, // Even faster animation (was 1.5)
};

function animatePathElements(pathElements: NodeListOf<Element>) {
  console.log("Animating path elements:", pathElements);

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
      path.addEventListener('mouseover', () => {
        path.style.stroke = COLORS.hover;
        path.style.strokeWidth = `${STROKE_WIDTH.hover}px`;
      });

      path.addEventListener('mouseout', () => {
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
        pathLength = 1000; // Default fallback
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

function createGlowingDotEffect(path: SVGPathElement, pathLength: number, index: number) {
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

    stops.forEach(stopData => {
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
  const glowPath = path.cloneNode() as SVGPathElement;
  const pathId = path.id || `path-${index}`;
  glowPath.id = `glow-${pathId}`;
  glowPath.style.stroke = COLORS.glow;
  glowPath.style.strokeWidth = `${STROKE_WIDTH.default * GLOW.outerGlowWidth}px`;
  glowPath.style.strokeLinecap = "round";
  // Increase size of the glow portion for better thrust effect
  glowPath.style.strokeDasharray = `${GLOW.beamLength * 0.8}, ${pathLength - GLOW.beamLength * 0.8}`;
  glowPath.style.strokeDashoffset = `${pathLength}`;
  glowPath.style.opacity = `${GLOW.opacity * 0.8}`;
  glowPath.style.filter = `blur(${GLOW.blurAmount * 1.2}px)`;

  // Insert the base glow first (bottom layer)
  path.parentNode?.insertBefore(glowPath, path.nextSibling);

  // Now create a trailing beam effect with gradient - narrower but brighter
  const beamPath = path.cloneNode() as SVGPathElement;
  beamPath.id = `beam-${pathId}`;
  beamPath.style.stroke = `url(#${gradientId})`;
  beamPath.style.strokeWidth = `${STROKE_WIDTH.default * 1.5}px`; // Slightly narrower than before
  beamPath.style.strokeLinecap = "round";
  beamPath.style.strokeDasharray = `${GLOW.beamLength}, ${pathLength - GLOW.beamLength}`;
  beamPath.style.strokeDashoffset = `${pathLength}`;
  beamPath.style.opacity = "1";
  beamPath.style.filter = `blur(${GLOW.blurAmount * 0.3}px)`; // Less blur for sharper beam core

  // Insert the beam on top of the glow
  path.parentNode?.insertBefore(beamPath, glowPath.nextSibling);

  // Create a bright dot at the head of the beam
  const dotPath = path.cloneNode() as SVGPathElement;
  dotPath.id = `dot-${pathId}`;
  dotPath.style.stroke = "white";
  dotPath.style.strokeWidth = `${STROKE_WIDTH.default * 1.4}px`; // Slightly larger dot
  dotPath.style.strokeLinecap = "round";
  dotPath.style.strokeDasharray = `${GLOW.dotSize}, ${pathLength}`;
  dotPath.style.strokeDashoffset = `${pathLength}`;
  dotPath.style.opacity = "1";
  dotPath.style.filter = "none"; // No blur for sharp dot

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
    const currentOffset = pathLength - (progress * pathLength);

    // Apply the offset with variations to create rocket thrust effect
    // The glow should be slightly behind the beam for thrust effect
    glowPath.style.strokeDashoffset = `${currentOffset + 3}`; // Glow slightly behind
    beamPath.style.strokeDashoffset = `${currentOffset}`; // Main beam in middle
    dotPath.style.strokeDashoffset = `${currentOffset}`; // Dot at the front

    // Continue the animation
    (glowPath as any)._animationFrame = requestAnimationFrame(animateRocketThrust);
  };

  // Start the animation after a minimal delay
  setTimeout(() => {
    (glowPath as any)._animationFrame = requestAnimationFrame(animateRocketThrust);
  }, index * 0.03 * 1000); // Very small stagger for nearly simultaneous effect
}

// Helper function to get path start and end points for gradient orientation
function getPathEndpoints(path: SVGPathElement): { start: { x: number, y: number }, end: { x: number, y: number } } {
  try {
    // Default values in case calculation fails
    const defaultResult = {
      start: { x: 0, y: 0 },
      end: { x: 100, y: 0 }
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
            y: startPoint.y
          },
          end: {
            x: endPoint.x,
            y: endPoint.y
          }
        };
      }
    }
    return defaultResult;
  } catch (e) {
    console.error("Error getting path endpoints:", e);
    return {
      start: { x: 0, y: 0 },
      end: { x: 100, y: 0 }
    };
  }
}

// Add a helper function to create global CSS hover styles
function addGlobalHoverStyles() {
  // Check if we've already added styles
  if (document.getElementById('isnad-path-hover-styles')) return;

  // Create a style element for global hover effects
  const styleEl = document.createElement('style');
  styleEl.id = 'isnad-path-hover-styles';
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
  const glowPaths = document.querySelectorAll("[id^='glow-'], [id^='halo-'], [id^='trail-']");
  glowPaths.forEach(path => {
    if ((path as any)._animationFrame) {
      cancelAnimationFrame((path as any)._animationFrame);
      (path as any)._animationFrame = null;
    }
  });

  // Remove the added paths
  const addedPaths = document.querySelectorAll("[id^='glow-'], [id^='dot-'], [id^='halo-'], [id^='trail-']");
  addedPaths.forEach(path => path.parentNode?.removeChild(path));

  // Clear intervals from any original paths
  const paths = document.querySelectorAll("path");
  paths.forEach(path => {
    if ((path as any)._animationInterval) {
      clearInterval((path as any)._animationInterval);
      (path as any)._animationInterval = null;
    }
  });

  // Also remove any gradients we created
  const gradients = document.querySelectorAll("[id^='beam-gradient-']");
  gradients.forEach(gradient => {
    if (gradient.parentNode) {
      gradient.parentNode.removeChild(gradient);
    }
  });
}

// Add functionality to restart animations when paths come into view
function setupAnimationRestartOnScroll() {
  // Store whether animations are currently running
  const animationsActive = { value: true };

  // Function to check visibility and restart animations if needed
  const checkVisibilityAndRestart = () => {
    const isGraphVisible = () => {
      const container = document.getElementById('isnad-graph-container');
      if (!container) return false;

      const rect = container.getBoundingClientRect();
      const isVisible = (
        rect.top < window.innerHeight &&
        rect.bottom > 0
      );
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
  };

  // Set up scroll listener
  window.addEventListener('scroll', checkVisibilityAndRestart, { passive: true });

  // Clean up function
  return () => {
    window.removeEventListener('scroll', checkVisibilityAndRestart);
  };
}

function useAnimateLinks() {
  useEffect(() => {
    // Add global hover styles as a fallback approach
    addGlobalHoverStyles();

    // Set up scroll-based animation restart
    const cleanupScrollListener = setupAnimationRestartOnScroll();

    // We'll try to find and animate links once after a delay
    const timer = setTimeout(() => {
      console.log("Looking for links to animate");

      // Try multiple selector strategies to find the links
      let links: NodeListOf<Element> | Element[] = document.querySelectorAll(".link");

      if (links.length === 0) {
        console.log("No .link elements found, trying direct path selector");
        const svgs = document.querySelectorAll("svg");

        if (svgs.length > 0) {
          // Find all paths in all SVGs
          const allPaths: Element[] = [];
          svgs.forEach(svg => {
            const paths = svg.querySelectorAll("path");
            paths.forEach(path => allPaths.push(path));
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
      const styleEl = document.getElementById('isnad-path-hover-styles');
      if (styleEl) styleEl.remove();
    };
  }, []);
}

export default function TeacherStudentChain({
  chainData,
}: TeacherStudentChainProps) {
  const graphRef = useRef<HTMLDivElement>(null);

  // Use our simplified animation approach
  useAnimateLinks();

  return (
    <NetworkWorkspace>
      {(dimensions) => {
        const graphData = calculateGraphData(chainData, dimensions.width);
        const graphConfig: GraphViewConfig = {
          directed: false,
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
              />
            )}
          </div>
        );
      }}
    </NetworkWorkspace>
  );
}
