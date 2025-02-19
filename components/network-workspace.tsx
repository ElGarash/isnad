"use client";

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
    <div
      ref={containerRef}
      className="w-full"
      style={{
        backgroundImage: `
          radial-gradient(circle at 1px 1px, #cbd5e1 1px, transparent 0),
          radial-gradient(circle at 20px 20px, #94a3b8 0.5px, transparent 0)
        `,
        backgroundSize: "20px 20px, 40px 40px",
        height: "100%",
      }}
    >
      {children(dimensions)}
    </div>
  );
}
