export type Quaternion = {
  w: number;
  x: number;
  y: number;
  z: number;
};

export function multiplyQuaternion(q1: Quaternion, q2: Quaternion) {
  const w = q1.w * q2.w - q1.x * q2.x - q1.y * q2.y - q1.z * q2.z;
  const x = q1.w * q2.x + q1.x * q2.w + q1.y * q2.z - q1.z * q2.y;
  const y = q1.w * q2.y - q1.x * q2.z + q1.y * q2.w + q1.z * q2.x;
  const z = q1.w * q2.z + q1.x * q2.y - q1.y * q2.x + q1.z * q2.w;
  return { w, x, y, z };
}

export function conjugate(q: Quaternion) {
  return { w: q.w, x: -q.x, y: -q.y, z: -q.z };
}

export function slerp(q1: Quaternion, q2: Quaternion, t: number) {
  const cosHalfTheta = q1.w * q2.w + q1.x * q2.x + q1.y * q2.y + q1.z * q2.z;
  if (Math.abs(cosHalfTheta) >= 1.0) {
    return q1;
  }
  const halfTheta = Math.acos(cosHalfTheta);
  const sinHalfTheta = Math.sqrt(1.0 - cosHalfTheta * cosHalfTheta);
  if (Math.abs(sinHalfTheta) < 0.001) {
    return {
      w: q1.w * 0.5 + q2.w * 0.5,
      x: q1.x * 0.5 + q2.x * 0.5,
      y: q1.y * 0.5 + q2.y * 0.5,
      z: q1.z * 0.5 + q2.z * 0.5,
    };
  }
  const ratioA = Math.sin((1 - t) * halfTheta) / sinHalfTheta;
  const ratioB = Math.sin(t * halfTheta) / sinHalfTheta;
  return {
    w: q1.w * ratioA + q2.w * ratioB,
    x: q1.x * ratioA + q2.x * ratioB,
    y: q1.y * ratioA + q2.y * ratioB,
    z: q1.z * ratioA + q2.z * ratioB,
  };
}
