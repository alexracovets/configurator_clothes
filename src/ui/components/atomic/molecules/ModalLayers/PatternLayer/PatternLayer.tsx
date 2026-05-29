'use client';

import { useMemo } from 'react';

import * as THREE from 'three';

interface PatternLayerProps {
  geometry: THREE.BufferGeometry;
  texture: THREE.Texture;
  patternOpacity: number;
  patternColor: string;
  renderOrder?: number;
}

const PatternLayer = ({ geometry, texture, patternOpacity, patternColor, renderOrder = 2 }: PatternLayerProps) => {
  const mat = useMemo(() => {
    const m = new THREE.MeshStandardMaterial({
      map: texture,
      transparent: true,
      opacity: patternOpacity,
      depthWrite: false,
      blending: THREE.NormalBlending,
      roughness: 0.85,
      metalness: 0.0,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    });
    m.color.set(patternColor);
    return m;
  }, [texture, patternOpacity, patternColor]);

  return <mesh geometry={geometry} material={mat} renderOrder={renderOrder} />;
};

export { PatternLayer };
