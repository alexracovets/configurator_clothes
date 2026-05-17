"use client";

import type { ThreeElements } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import type * as THREE from "three";

type CrewneckGLTF = {
  nodes: Record<string, THREE.Mesh>;
  materials: {
    crewneck_front: THREE.MeshStandardMaterial;
    crewneck_inside: THREE.MeshStandardMaterial;
    sweatband: THREE.MeshStandardMaterial;
    label: THREE.MeshStandardMaterial;
  };
};

const MODEL_PATH = "./models/crewneck/crewneck-transformed.glb";

export function TSHIRTCrewneck(props: ThreeElements["group"]) {
  const { nodes, materials } = useGLTF(MODEL_PATH) as unknown as CrewneckGLTF;

  return (
    <group {...props} dispose={null}>
      <mesh
        geometry={nodes.crewneck_back.geometry}
        material={materials.crewneck_front}
      />
      <mesh
        geometry={nodes.Mesh002.geometry}
        material={materials.crewneck_inside}
      />
      <mesh
        geometry={nodes.Mesh002_1.geometry}
        material={materials.sweatband}
      />
      <mesh geometry={nodes.Mesh002_2.geometry} material={materials.label} />
    </group>
  );
}

useGLTF.preload(MODEL_PATH);
