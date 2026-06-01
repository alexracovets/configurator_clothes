'use client';

import { useLayoutEffect, useRef } from 'react';

import * as THREE from 'three';

import { useGarmentPartMaterial, usePartAtlas } from '@hooks';
import { getPartRenderOrder } from '@utils';
import type { ConfiguratorPart, PBRMaps } from '@types';

interface GarmentPartMeshProps {
  part: ConfiguratorPart;
  geometry: THREE.BufferGeometry;
  maps: PBRMaps;
}

const meshRaycast = THREE.Mesh.prototype.raycast;

const GarmentPartMesh = ({ part, geometry, maps }: GarmentPartMeshProps) => {
  const partAtlas = usePartAtlas(part);
  const material = useGarmentPartMaterial(partAtlas, maps, part);
  const meshRef = useRef<THREE.Mesh>(null);
  const renderOrder = getPartRenderOrder(part);

  useLayoutEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    mesh.raycast = meshRaycast;
  }, []);

  return <mesh ref={meshRef} name={part} geometry={geometry} material={material} renderOrder={renderOrder} />;
};

export { GarmentPartMesh };
