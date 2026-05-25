"use client";

import { useMemo, useRef, useEffect } from "react";
import { ThreeElements } from "@react-three/fiber";
import { useGLTF, useTexture } from "@react-three/drei";
import * as THREE from "three";

import { LayoutsModalStructure, NameLayer } from "@molecules";
import type { LayerConfig } from "@types";

const MODEL_PATH = "/models/pbr/crewneck.gltf";
const FABRIC_REPEAT = 6;

const PBR_TEXTURE_PATHS = {
  bakeNormal: "/models/pbr/bake_normal.jpg",
  bakeAoRoughness: "/models/pbr/bake_ao-bake_roughness.jpg",
  fabricNormal: "/models/pbr/cotton_jersey_nor_gl.jpg",
  fabricRoughness: "/models/pbr/cotton_jersey_rough.jpg",
};

interface CrewneckGLTF {
  nodes: Record<string, THREE.Mesh>;
  materials: {
    crewneck_inside: THREE.MeshStandardMaterial;
    sweatband: THREE.MeshStandardMaterial;
    label: THREE.MeshStandardMaterial;
  };
}

export const PDRTest = (props: ThreeElements["group"]) => {
  const { nodes, materials } = useGLTF(MODEL_PATH) as unknown as CrewneckGLTF;
  const { insideAo } = useTexture({ insideAo: "/models/pbr/inside_ao.jpg" });

  // Ref to the hidden back mesh for Decal projection
  const backMeshRef = useRef<THREE.Mesh>(null);

  // Copy matrixWorld from the GLTF node so Decal projects correctly
  useEffect(() => {
    const mesh = backMeshRef.current;
    if (!mesh) return;
    // The GLTF back node has identity matrix (geometry already in world space after Center)
    // We just need to force matrixWorld update
    mesh.updateMatrixWorld(true);
  });

  const layerConfigs: LayerConfig[] = [
    { part: "front", geometry: nodes.crewneck_front.geometry },
    { part: "back", geometry: nodes.crewneck_back.geometry },
    { part: "sleeve_left", geometry: nodes.crewneck_sleeve_left.geometry },
    { part: "sleeve_right", geometry: nodes.crewneck_sleeve_right.geometry },
    { part: "collar", geometry: nodes.crewneck_collar.geometry },
  ];

  const insideMat = useMemo(() => {
    const m = materials.crewneck_inside.clone();
    const aoTex = insideAo.clone() as THREE.Texture;
    aoTex.colorSpace = THREE.NoColorSpace;
    aoTex.needsUpdate = true;
    m.aoMap = aoTex;
    m.aoMapIntensity = 1.0;

    const fabricNorm = new THREE.TextureLoader().load(PBR_TEXTURE_PATHS.fabricNormal);
    fabricNorm.wrapS = THREE.RepeatWrapping;
    fabricNorm.wrapT = THREE.RepeatWrapping;
    fabricNorm.repeat.set(FABRIC_REPEAT, FABRIC_REPEAT);
    fabricNorm.colorSpace = THREE.NoColorSpace;
    m.normalMap = fabricNorm;
    m.normalMapType = THREE.TangentSpaceNormalMap;
    m.normalScale.set(0.4, 0.4);
    m.roughness = 0.95;
    m.metalness = 0.0;
    m.needsUpdate = true;
    return m;
  }, [materials.crewneck_inside, insideAo]);

  return (
    <LayoutsModalStructure
      {...props}
      layerConfigs={layerConfigs}
      pbrTexturePaths={PBR_TEXTURE_PATHS}
    >
      <mesh geometry={nodes.Mesh002.geometry} material={insideMat} />
      <mesh geometry={nodes.Mesh002_1.geometry} material={materials.sweatband} />
      <mesh geometry={nodes.Mesh002_2.geometry} material={materials.label} />

      {/* Hidden back mesh — used by Decal for projection surface */}
      <mesh
        ref={backMeshRef}
        geometry={nodes.crewneck_back.geometry}
        visible={false}
        matrixAutoUpdate={false}
      />

      <NameLayer meshRef={backMeshRef} />
    </LayoutsModalStructure>
  );
};

useGLTF.preload(MODEL_PATH);
