'use client';

import { useMemo } from 'react';

import { useGLTF, useTexture } from '@react-three/drei';
import { ThreeElements } from '@react-three/fiber';
import * as THREE from 'three';

import { LayoutsModalStructure } from '@molecules';
import type { LayerConfig } from '@types';

import { crewneckStyle } from '@data';

const shirtConfig = crewneckStyle.garments.shirt!;
const { gltf, bakeNormal, bakeAoRoughness, fabricNormal, fabricRoughness, insideAo } = shirtConfig.modelPaths;

const INSIDE_FABRIC_REPEAT = 6;

interface CrewneckGLTF {
  nodes: Record<string, THREE.Mesh>;
  materials: {
    crewneck_inside: THREE.MeshStandardMaterial;
    sweatband: THREE.MeshStandardMaterial;
    label: THREE.MeshStandardMaterial;
  };
}

const CrewneckModel = (props: ThreeElements['group']) => {
  const { nodes, materials } = useGLTF(gltf) as unknown as CrewneckGLTF;
  const { insideAoTex } = useTexture({ insideAoTex: insideAo });

  const layerConfigs: LayerConfig[] = shirtConfig.parts.map(({ key }) => ({
    part: key as LayerConfig['part'],
    geometry: nodes[`crewneck_${key}`].geometry,
  }));

  const pbrTexturePaths = {
    bakeNormal,
    bakeAoRoughness,
    fabricNormal,
    fabricRoughness,
  };

  const neckMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: shirtConfig.neckColor,
        roughness: 0.9,
        metalness: 0,
      }),
    [],
  );

  const insideMat = useMemo(() => {
    const m = materials.crewneck_inside.clone();
    const aoTex = insideAoTex.clone() as THREE.Texture;
    aoTex.flipY = false;
    aoTex.colorSpace = THREE.NoColorSpace;
    aoTex.needsUpdate = true;
    m.aoMap = aoTex;
    m.aoMapIntensity = 1.0;
    m.roughnessMap = null;

    const fabricNormTex = new THREE.TextureLoader().load(fabricNormal);
    fabricNormTex.wrapS = THREE.RepeatWrapping;
    fabricNormTex.wrapT = THREE.RepeatWrapping;
    fabricNormTex.repeat.set(INSIDE_FABRIC_REPEAT, INSIDE_FABRIC_REPEAT);
    fabricNormTex.colorSpace = THREE.NoColorSpace;
    m.normalMap = fabricNormTex;
    m.normalMapType = THREE.TangentSpaceNormalMap;
    m.normalScale.set(0.4, 0.4);
    m.roughness = 0.95;
    m.metalness = 0.0;
    m.side = THREE.FrontSide;
    m.polygonOffset = true;
    m.polygonOffsetFactor = 1;
    m.polygonOffsetUnits = 2;
    m.needsUpdate = true;
    return m;
  }, [materials.crewneck_inside, insideAoTex]);

  return (
    <LayoutsModalStructure {...props} layerConfigs={layerConfigs} pbrTexturePaths={pbrTexturePaths}>
      <mesh geometry={nodes.Mesh002.geometry} material={insideMat} />
      <mesh geometry={nodes.crewneck_collar.geometry} material={neckMat} />
      <mesh geometry={nodes.Mesh002_1.geometry} material={materials.sweatband} />
      <mesh geometry={nodes.Mesh002_2.geometry} material={materials.label} />
    </LayoutsModalStructure>
  );
};

useGLTF.preload(gltf);

export { CrewneckModel };
