"use client";

import "./network-workspace.css";
import React, { ReactNode, useEffect, useRef, useState } from "react";

interface NetworkWorkspaceProps {
  children: (dimensions: { width: number; height: number }) => ReactNode;
}

export default function NetworkWorkspace({ children }: NetworkWorkspaceProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions({ width, height });
      }
    };

    updateDimensions();
    const resizeObserver = new ResizeObserver(updateDimensions);
    if (containerRef.current) resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full bg-grid-pattern">
      {children(dimensions)}
    </div>
  );
}
