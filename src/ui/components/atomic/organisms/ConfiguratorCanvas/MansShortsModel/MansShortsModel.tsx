'use client';

import { useMemo } from 'react';

import { useGLTF } from '@react-three/drei';
import { ThreeElements } from '@react-three/fiber';
import * as THREE from 'three';

import { LayoutsModalStructure } from '@molecules';
import type { LayerConfig } from '@types';

import { getGarmentConfig } from '@data';

const shortsConfig = getGarmentConfig('crewneck', 'shorts');
const { gltf, bakeNormal, bakeAoRoughness, fabricNormal, fabricRoughness } = shortsConfig.modelPaths;

interface ShortsGLTF {
  nodes: Record<string, THREE.Mesh>;
  materials: {
    mans_shorts_inside: THREE.MeshStandardMaterial;
    laces_fabric: THREE.MeshStandardMaterial;
    laces_ends: THREE.MeshStandardMaterial;
  };
}

const MansShortsModel = (props: ThreeElements['group']) => {
  const { nodes, materials } = useGLTF(gltf) as unknown as ShortsGLTF;

  const layerConfigs: LayerConfig[] = useMemo(
    () =>
      shortsConfig.parts.map(({ key }) => ({
        part: key as LayerConfig['part'],
        geometry: nodes[`mans_shorts_${key}`].geometry,
      })),
    [nodes],
  );

  const pbrTexturePaths = {
    bakeNormal,
    bakeAoRoughness,
    fabricNormal,
    fabricRoughness,
  };

  return (
    <LayoutsModalStructure {...props} layerConfigs={layerConfigs} pbrTexturePaths={pbrTexturePaths}>
      <mesh geometry={nodes.mans_shorts_inside.geometry} material={materials.mans_shorts_inside} />
      <mesh geometry={nodes.mans_shorts_laces.geometry} material={[materials.laces_fabric, materials.laces_ends]} />
    </LayoutsModalStructure>
  );
};

useGLTF.preload(gltf);

export { MansShortsModel };
