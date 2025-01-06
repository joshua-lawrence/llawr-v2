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
  timestamp: number;
};

type Velocity = {
  x: number;
  y: number;
};

export default function useCube() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [prevPointer, setPrevPointer] = useState<PointerPosition>({
    clientX: 0,
    clientY: 0,
    timestamp: 0,
  });
  const [velocity, setVelocity] = useState<Velocity>({ x: 0.01, y: 0.02 });
  const velocityRef = useRef<Velocity>({ x: 0.5, y: 0.2 });
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

  const targetRotation = useRef<Quaternion>(rotation);

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

      targetRotation.current = newRotation;
      const slerpT = Math.min(1, t);
      const interpolatedRotation = slerp(
        rotation,
        targetRotation.current,
        slerpT
      );

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
    if (isDragging) return;

    const baseSpeed = 0.1;
    const baseFriction = 0.95;
    const speed = Math.sqrt(
      velocityRef.current.x ** 2 + velocityRef.current.y ** 2
    );
    const friction = Math.max(baseFriction - (speed - baseSpeed) * 0.05, 0.8);
    const minVelocity = 0.005;
    let animationFrameId: number;

    const animate = () => {
      velocityRef.current = {
        x: velocityRef.current.x * friction,
        y: velocityRef.current.y * friction,
      };

      const speed = Math.sqrt(
        velocityRef.current.x ** 2 + velocityRef.current.y ** 2
      );

      if (speed > minVelocity) {
        rotate(-velocityRef.current.y * 0.5, velocityRef.current.x * 0.5, 0, 1);
        animationFrameId = requestAnimationFrame(animate);
      } else {
        velocityRef.current = { x: 0, y: 0 };
        setVelocity({ x: 0, y: 0 });
      }
    };

    if (!isDragging && (velocity.x !== 0 || velocity.y !== 0)) {
      velocityRef.current = velocity;
      animate();
    }

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isDragging, velocity, rotate]);

  const handlePointerDown = (event: PointerEvent) => {
    if (event.button === 0 || event.pointerType === "touch") {
      setIsDragging(true);
      setPrevPointer({
        clientX: event.clientX,
        clientY: event.clientY,
        timestamp: event.timeStamp,
      });
      setVelocity({ x: 0, y: 0 });

      if (containerRef.current) {
        containerRef.current.setPointerCapture(event.pointerId);
      }
    }
  };

  const handlePointerMove = (event: PointerEvent) => {
    if (!isDragging) return;

    const deltaX = event.clientX - prevPointer.clientX;
    const deltaY = event.clientY - prevPointer.clientY;
    const deltaTime = event.timeStamp - prevPointer.timestamp;

    if (deltaTime > 0) {
      const maxSpeed = 2;
      const rawVelocityX = deltaX / deltaTime;
      const rawVelocityY = deltaY / deltaTime;

      const magnitude = Math.sqrt(rawVelocityX ** 2 + rawVelocityY ** 2);
      const scale = magnitude > maxSpeed ? maxSpeed / magnitude : 1;

      const newVelocity = {
        x: rawVelocityX * scale,
        y: rawVelocityY * scale,
      };
      setVelocity(newVelocity);
    }

    const sensitivity = 0.5;
    const rotationX = -deltaY * sensitivity;
    const rotationY = deltaX * sensitivity;

    rotate(rotationX, rotationY, 0, 1);
    setPrevPointer({
      clientX: event.clientX,
      clientY: event.clientY,
      timestamp: event.timeStamp,
    });
  };

  const handlePointerUp = (event: PointerEvent) => {
    if (containerRef.current) {
      containerRef.current.releasePointerCapture(event.pointerId);
    }
    setIsDragging(false);
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
