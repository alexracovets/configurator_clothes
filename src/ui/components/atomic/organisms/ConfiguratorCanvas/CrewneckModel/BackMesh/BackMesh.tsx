"use client";

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
          mesh.updateMatrixWorld(true);
          onMount(mesh);
        }
      }}
    />
  );
};
