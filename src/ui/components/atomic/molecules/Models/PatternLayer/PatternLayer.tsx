"use client";

import { useMemo } from "react";
import * as THREE from "three";

interface PatternLayerProps {
  geometry: THREE.BufferGeometry;
  texture: THREE.Texture;
  patternOpacity: number;
}

export function PatternLayer({
  geometry,
  texture,
  patternOpacity,
}: PatternLayerProps) {
  const mat = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      map: texture,
      transparent: true,
      opacity: patternOpacity,
      depthWrite: false,
      blending: THREE.NormalBlending,
    });
  }, [texture, patternOpacity]);

  return <mesh geometry={geometry} material={mat} renderOrder={1} />;
}
