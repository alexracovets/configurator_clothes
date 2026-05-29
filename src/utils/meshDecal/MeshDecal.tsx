"use client";

import * as React from "react";
import * as THREE from "three";
import type { DecalProps } from "@react-three/drei";

import { createConformingDecalGeometry } from "./createConformingDecalGeometry";

export type MeshDecalProps = Omit<DecalProps, "rotation"> & {
  rotation?: number | [number, number, number] | THREE.Euler;
  lowQuality?: boolean;
};

type VecInput =
  | THREE.Vector3
  | THREE.Euler
  | readonly [number, number, number]
  | number
  | undefined;

const toTriple = (vec: VecInput): [number, number, number] => {
  if (vec === undefined) return [0, 0, 0];
  if (typeof vec === "number") return [vec, vec, vec];
  if (Array.isArray(vec)) return [vec[0], vec[1], vec[2]];
  if (vec instanceof THREE.Vector3 || vec instanceof THREE.Euler) {
    return [vec.x, vec.y, vec.z];
  }
  return [0, 0, 0];
};

export const MeshDecal = React.forwardRef<THREE.Mesh, MeshDecalProps>(
  function MeshDecal(
    { rotation, position, scale, lowQuality = false, ...props },
    forwardRef,
  ) {
    const ref = React.useRef<THREE.Mesh>(null);

    const [posX, posY, posZ] = toTriple(position as VecInput);
    const [scaleX, scaleY, scaleZ] = toTriple(scale as VecInput);

    React.useImperativeHandle(forwardRef, () => ref.current!);

    React.useLayoutEffect(() => {
      const target = ref.current;
      if (!target) return;

      const parent = target.parent;
      if (!(parent instanceof THREE.Mesh)) {
        console.warn("MeshDecal: parent must be THREE.Mesh");
        return;
      }

      const pos: [number, number, number] = [posX, posY, posZ];
      const scl: [number, number, number] = [scaleX, scaleY, scaleZ];
      const rot: number | [number, number, number] =
        rotation === undefined
          ? 0
          : typeof rotation === "number"
            ? rotation
            : (toTriple(rotation as VecInput) as [number, number, number]);

      const geometry = createConformingDecalGeometry(
        parent,
        new THREE.Vector3(pos[0], pos[1], pos[2]),
        rot,
        new THREE.Vector3(scl[0], scl[1], scl[2]),
        lowQuality
          ? { segmentsX: 20, segmentsY: 8, surfaceOffset: 0.0035 }
          : { segmentsX: 52, segmentsY: 20, surfaceOffset: 0.0035 },
      );

      target.geometry = geometry;

      return () => {
        geometry.dispose();
      };
    }, [lowQuality, posX, posY, posZ, scaleX, scaleY, scaleZ, rotation]);

    return <mesh ref={ref} {...props} renderOrder={props.renderOrder ?? 50} />;
  },
);
