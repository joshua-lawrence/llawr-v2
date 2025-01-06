"use client";
import { cn } from "@/lib/cn";
import useCube from "@/lib/cube";
import { Vertex } from "@/lib/vertex";
import React from "react";

export default function CubeAnimation() {
  const PLANE = 100;
  const SCALE = 50;
  const { vertices, containerRef, isDragging } = useCube();

  function project(v: Vertex) {
    return {
      x: (PLANE * v.x) / (v.z + PLANE),
      y: (PLANE * v.y) / (v.z + PLANE),
    };
  }

  const vertex = (v: Vertex, i: number) => {
    const { x, y } = project(v);
    return (
      <div
        key={i}
        className="select-none pointer-events-none"
        style={{
          position: "absolute",
          left: `${x * SCALE}px`,
          top: `${y * SCALE}px`,
          WebkitUserSelect: "none",
          WebkitTouchCallout: "none",
        }}
        aria-hidden="true"
      >
        #
      </div>
    );
  };

  return (
    <div
      className={cn(
        "absolute left-0 top-0 w-screen h-full",
        isDragging ? "cursor-grabbing z-50 touch-none" : "cursor-grab z-0",
        "select-none touch-none", // Prevents text selection and touch events
        "pointer-events-auto" // Ensures container can receive pointer events
      )}
      style={{
        WebkitUserSelect: "none",
        WebkitTouchCallout: "none",
      }}
      ref={containerRef}
    >
      <div
        className="relative left-1/2 top-[150px] -translate-y-1/2 -translate-x-1/2 w-fit"
        style={{ pointerEvents: isDragging ? "none" : "auto" }}
      >
        {vertices.map(vertex)}
      </div>
    </div>
  );
}
