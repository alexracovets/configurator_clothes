"use client";

import { useMemo } from "react";
import * as THREE from "three";

interface GradientLayerProps {
  geometry: THREE.BufferGeometry;
  texture: THREE.Texture;
  opacity: number;
}

export function GradientLayer({ geometry, texture, opacity }: GradientLayerProps) {
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
  }, [texture, opacity]);

  return <mesh geometry={geometry} material={mat} renderOrder={1} />;
}
