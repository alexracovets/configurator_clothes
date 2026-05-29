import * as THREE from "three";
import type { DecalProps } from "@react-three/drei";

export type MeshDecalProps = Omit<DecalProps, "rotation"> & {
  rotation?: number | [number, number, number] | THREE.Euler;
  lowQuality?: boolean;
};
