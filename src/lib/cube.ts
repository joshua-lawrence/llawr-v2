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

type PointerPosition = {
  clientX: number;
  clientY: number;
};

export default function useCube() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [prevPointer, setPrevPointer] = useState<PointerPosition>({
    clientX: 0,
    clientY: 0,
  });
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

  const handlePointerDown = (event: PointerEvent) => {
    if (event.button === 0 || event.pointerType === "touch") {
      setIsDragging(true);
      setPrevPointer({ clientX: event.clientX, clientY: event.clientY });

      // Capture the pointer to ensure we get all events
      if (containerRef.current) {
        containerRef.current.setPointerCapture(event.pointerId);
      }
    }
  };

  const handlePointerMove = (event: PointerEvent) => {
    if (!isDragging) return;

    const deltaX = event.clientX - prevPointer.clientX;
    const deltaY = event.clientY - prevPointer.clientY;

    const sensitivity = 0.5;
    const rotationX = -deltaY * sensitivity;
    const rotationY = deltaX * sensitivity;

    rotate(rotationX, rotationY, 0, 1);
    setPrevPointer({ clientX: event.clientX, clientY: event.clientY });
  };

  const handlePointerUp = (event: PointerEvent) => {
    if (containerRef.current) {
      containerRef.current.releasePointerCapture(event.pointerId);
    }
    setIsDragging(false);
    setRotation(rotation);
  };

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener("pointerdown", handlePointerDown);
      container.addEventListener("pointermove", handlePointerMove);
      container.addEventListener("pointerup", handlePointerUp);
      container.addEventListener("pointerleave", handlePointerUp);
      container.addEventListener("pointercancel", handlePointerUp);
    }

    return () => {
      if (container) {
        container.removeEventListener("pointerdown", handlePointerDown);
        container.removeEventListener("pointermove", handlePointerMove);
        container.removeEventListener("pointerup", handlePointerUp);
        container.removeEventListener("pointerleave", handlePointerUp);
        container.removeEventListener("pointercancel", handlePointerUp);
      }
    };
  }, [isDragging]);

  return { faces, vertices, rotate, containerRef, rotation, isDragging };
}
