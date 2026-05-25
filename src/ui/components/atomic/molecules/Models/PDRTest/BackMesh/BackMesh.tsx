"use client";

import { useEffect } from "react";
import * as THREE from "three";

interface BackMeshProps {
  geometry: THREE.BufferGeometry;
  onMount: (mesh: THREE.Mesh) => void;
}

export const BackMesh = ({ geometry, onMount }: BackMeshProps) => {
  return (
    <mesh
      geometry={geometry}
      visible={false}
      ref={(mesh) => {
        if (mesh) {
          // Force matrix update so Decal can use it immediately
          mesh.updateMatrixWorld(true);
          onMount(mesh);
        }
      }}
    />
  );
};
