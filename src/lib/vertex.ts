import { Quaternion, conjugate, multiplyQuaternion } from "@/lib/quaternion";

export type Vertex = {
  x: number;
  y: number;
  z: number;
};

export function vertexToQuaternion(v: Vertex): Quaternion {
  return { w: 0, x: v.x, y: v.y, z: v.z };
}

export function rotateVertex(v: Vertex, r: Quaternion): Vertex {
  const qp = multiplyQuaternion(r, vertexToQuaternion(v));
  const result = multiplyQuaternion(qp, conjugate(r));
  return { x: result.x, y: result.y, z: result.z };
}
