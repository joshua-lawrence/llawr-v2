"use client";
import { cn } from "@/lib/cn";
import useCube from "@/lib/cube";
import { Vertex } from "@/lib/vertex";
import React, { useEffect } from "react";

export default function CubeAnimation() {
  const PLANE = 100;
  const SCALE = 50;
  const { vertices, rotation, containerRef, faces, isDragging } = useCube();

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
        style={{
          position: "absolute",
          left: `${x * SCALE}px`,
          top: `${y * SCALE}px`,
          userSelect: "none",
        }}
      >
        #
      </div>
    );
  };

  const face = (f: number[], i: number) => {
    const pVs = f.map((v) => project(vertices[v]));
    const scaledPVs = pVs.map((v) => ({ x: v.x * SCALE, y: v.y * SCALE }));
    const triangle1 = [scaledPVs[0], scaledPVs[1], scaledPVs[2]];
    const triangle2 = [scaledPVs[2], scaledPVs[3], scaledPVs[0]];
  };

  return (
    <div
      className={cn(
        "absolute left-0 top-0 w-screen h-full z-0",
        isDragging ? "cursor-grabbing z-50" : "cursor-grab"
      )}
      ref={containerRef}
    >
      <div className="relative left-1/2 top-[150px] -translate-y-1/2 -translate-x-1/2 w-fit t-96">
        {/* {faces.map(face)} */}
        {vertices.map(vertex)}
      </div>
    </div>
  );
}
