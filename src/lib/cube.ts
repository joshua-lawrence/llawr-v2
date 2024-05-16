import { degreesToRadians } from "@/lib/geometry";
import { Quaternion, multiplyQuaternion, slerp } from "@/lib/quaternion";
import { Vertex, rotateVertex } from "@/lib/vertex";

import { useCallback, useEffect, useRef, useState } from "react";

export type RectangularPrism = [
  Vertex,
  Vertex,
  Vertex,
  Vertex,
  Vertex,
  Vertex,
  Vertex,
  Vertex
];

export default function useCube() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [prevMouseX, setPrevMouseX] = useState(0);
  const [prevMouseY, setPrevMouseY] = useState(0);
  const [vertices, setVertices] = useState<RectangularPrism>([
    { x: -1, y: -1, z: -1 },
    { x: 1, y: -1, z: -1 },
    { x: 1, y: 1, z: -1 },
    { x: -1, y: 1, z: -1 },
    { x: -1, y: -1, z: 1 },
    { x: 1, y: -1, z: 1 },
    { x: 1, y: 1, z: 1 },
    { x: -1, y: 1, z: 1 },
  ]);
  const faces = [
    [0, 1, 2, 3],
    [1, 5, 6, 2],
    [5, 4, 7, 6],
    [4, 0, 3, 7],
    [3, 2, 6, 7],
    [0, 4, 5, 1],
  ];
  const [rotation, setRotation] = useState<Quaternion>({
    w: 1,
    x: 0,
    y: 0,
    z: 0,
  });

  const rotate = useCallback(
    (x: number, y: number, z: number, t: number) => {
      const xR = degreesToRadians(x);
      const yR = degreesToRadians(y);
      const zR = degreesToRadians(z);

      const xRotation: Quaternion = {
        w: Math.cos(xR / 2),
        x: Math.sin(xR / 2),
        y: 0,
        z: 0,
      };

      const yRotation: Quaternion = {
        w: Math.cos(yR / 2),
        x: 0,
        y: Math.sin(yR / 2),
        z: 0,
      };

      const zRotation: Quaternion = {
        w: Math.cos(zR / 2),
        x: 0,
        y: 0,
        z: Math.sin(zR / 2),
      };

      const newRotation: Quaternion = multiplyQuaternion(
        zRotation,
        multiplyQuaternion(yRotation, xRotation)
      );

      const interpolatedRotation = slerp(rotation, newRotation, t);

      setRotation(interpolatedRotation);

      setVertices(
        vertices.map((v) =>
          rotateVertex(v, interpolatedRotation)
        ) as RectangularPrism
      );
    },
    [rotation, vertices]
  );

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isDragging) {
        rotate(0, Math.random(), 0.5, 0.01);
      }
    }, 8);
    return () => clearInterval(interval);
  }, [rotate, isDragging]);

  const handleMouseDown = (event: MouseEvent) => {
    setIsDragging(true);
    setPrevMouseX(event.clientX);
    setPrevMouseY(event.clientY);
  };

  const handleMouseMove = (event: MouseEvent) => {
    if (!isDragging) return;
    const deltaX = event.clientX - prevMouseX;
    const deltaY = event.clientY - prevMouseY;

    const sensitivity = 0.5;
    const rotationX = -deltaY * sensitivity;
    const rotationY = deltaX * sensitivity;

    rotate(rotationX, rotationY, 0, 1);

    setPrevMouseX(event.clientX);
    setPrevMouseY(event.clientY);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setRotation(rotation);
  };

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener("mousedown", handleMouseDown);
      container.addEventListener("mousemove", handleMouseMove);
      container.addEventListener("mouseup", handleMouseUp);
      container.addEventListener("mouseleave", handleMouseUp);
    }

    return () => {
      if (container) {
        container.removeEventListener("mousedown", handleMouseDown);
        container.removeEventListener("mousemove", handleMouseMove);
        container.removeEventListener("mouseup", handleMouseUp);
        container.removeEventListener("mouseleave", handleMouseUp);
      }
    };
  }, [isDragging]);

  return { faces, vertices, rotate, containerRef, rotation, isDragging };
}
