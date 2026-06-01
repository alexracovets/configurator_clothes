'use client';

import { useLayoutEffect, useRef } from 'react';

import * as THREE from 'three';

import { useShirtMaterial } from '@hooks';
import type { ConfiguratorPart, PartGradient, PBRMaps } from '@types';

interface ColorLayerProps {
  part: ConfiguratorPart;
  geometry: THREE.BufferGeometry;
  baseColorTexture: THREE.CanvasTexture;
  gradient: PartGradient;
  maps: PBRMaps;
  renderOrder?: number;
}

const meshRaycast = THREE.Mesh.prototype.raycast;

const ColorLayer = ({ part, geometry, baseColorTexture, gradient, maps, renderOrder = 0 }: ColorLayerProps) => {
  const material = useShirtMaterial(baseColorTexture, maps, gradient, part);
  const meshRef = useRef<THREE.Mesh>(null);

  useLayoutEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    mesh.raycast = meshRaycast;
  }, []);

  return <mesh ref={meshRef} name={part} geometry={geometry} material={material} renderOrder={renderOrder} />;
};

export { ColorLayer };
