"use client";

import { useMemo } from "react";
import * as THREE from "three";

import { useSvgTexture } from "@hooks";

interface PatternLayerProps {
  geometry: THREE.BufferGeometry;
  patternUrl: string;
  patternOpacity: number;
}

export function PatternLayer({
  geometry,
  patternUrl,
  patternOpacity,
}: PatternLayerProps) {
  const texture = useSvgTexture(patternUrl);

  const mat = useMemo(() => {
    if (!texture) return null;
    return new THREE.MeshStandardMaterial({
      map: texture,
      transparent: true,
      opacity: patternOpacity,
      depthWrite: false,
      blending: THREE.NormalBlending,
    });
  }, [texture, patternOpacity]);

  if (!mat) return null;

  return <mesh geometry={geometry} material={mat} renderOrder={1} />;
}
