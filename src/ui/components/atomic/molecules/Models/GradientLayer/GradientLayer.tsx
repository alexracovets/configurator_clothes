"use client";

import { useMemo } from "react";
import * as THREE from "three";

interface GradientLayerProps {
  geometry: THREE.BufferGeometry;
  texture: THREE.Texture;
}

export function GradientLayer({ geometry, texture }: GradientLayerProps) {
  const mat = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      map: texture,
      transparent: true,
      opacity: 1,
      depthWrite: false,
      blending: THREE.NormalBlending,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    });
  }, [texture]);

  return <mesh geometry={geometry} material={mat} renderOrder={1} />;
}
