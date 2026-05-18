"use client";

import { ThreeElements } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

interface CrewneckGLTF {
  nodes: Record<string, THREE.Mesh>;
  materials: {
    crewneck_front: THREE.MeshStandardMaterial;
    crewneck_inside: THREE.MeshStandardMaterial;
    sweatband: THREE.MeshStandardMaterial;
    label: THREE.MeshStandardMaterial;
  };
};
 
const MODEL_PATH = "./models/crewneck/crewneck.glb"; 

export function TSHIRTCrewneck(props: ThreeElements["group"]) {
  const { nodes, materials } = useGLTF(MODEL_PATH) as unknown as CrewneckGLTF;
  
  return (
    <group {...props} dispose={null}>
      <mesh geometry={nodes.crewneck_back.geometry} material={materials.crewneck_front} />
      <mesh geometry={nodes.crewneck_collar.geometry} material={materials.crewneck_front} />
      <mesh geometry={nodes.crewneck_front.geometry} material={materials.crewneck_front} />
      <mesh geometry={nodes.crewneck_sleeve_left.geometry} material={materials.crewneck_front} />
      <mesh geometry={nodes.crewneck_sleeve_right.geometry} material={materials.crewneck_front} />
      <mesh geometry={nodes.Mesh002.geometry} material={materials.crewneck_inside} />
      <mesh geometry={nodes.Mesh002_1.geometry} material={materials.sweatband} />
      <mesh geometry={nodes.Mesh002_2.geometry} material={materials.label} />
    </group>
  )
}

useGLTF.preload('/crewneck.glb')
