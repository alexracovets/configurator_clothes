"use client";

import { useMemo } from "react";
import { ThreeElements } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

import { useColorStore, usePatternStore } from "@store";
import type { ShirtPart } from "@store";
import { PatternLayer } from "../PatternLayer";

interface CrewneckGLTF {
  nodes: Record<string, THREE.Mesh>;
  materials: {
    crewneck_front: THREE.MeshStandardMaterial;
    crewneck_inside: THREE.MeshStandardMaterial;
    sweatband: THREE.MeshStandardMaterial;
    label: THREE.MeshStandardMaterial;
  };
}

const MODEL_PATH = "/models/crewneck/crewneck.glb";

const PART_MESHES: { node: string; part: ShirtPart }[] = [
  { node: "crewneck_front",        part: "front" },
  { node: "crewneck_back",         part: "back" },
  { node: "crewneck_sleeve_left",  part: "sleeve_left" },
  { node: "crewneck_sleeve_right", part: "sleeve_right" },
  { node: "crewneck_collar",       part: "collar" },
];

function ShirtMesh({
  geometry,
  baseMaterial,
  baseColor,
  patternUrl,
  patternOpacity,
}: {
  geometry: THREE.BufferGeometry;
  baseMaterial: THREE.MeshStandardMaterial;
  baseColor: string;
  patternUrl: string;
  patternOpacity: number;
}) {
  const mat = useMemo(() => {
    const m = baseMaterial.clone();
    m.color.set(baseColor);
    return m;
  }, [baseMaterial, baseColor]);

  return (
    <>
      <mesh geometry={geometry} material={mat} />
      {patternUrl && (
        <PatternLayer
          geometry={geometry}
          patternUrl={patternUrl}
          patternOpacity={patternOpacity}
        />
      )}
    </>
  );
}

export function TSHIRTCrewneck(props: ThreeElements["group"]) {
  const { nodes, materials } = useGLTF(MODEL_PATH) as unknown as CrewneckGLTF;
  const { partColors } = useColorStore();
  const { partPatterns, patternOpacity } = usePatternStore();

  return (
    <group {...props} dispose={null}>
      {PART_MESHES.map(({ node, part }) => (
        <ShirtMesh
          key={part}
          geometry={nodes[node].geometry}
          baseMaterial={materials.crewneck_front}
          baseColor={(partColors as Record<string, string>)[part]}
          patternUrl={(partPatterns as Record<string, string>)[part]}
          patternOpacity={patternOpacity}
        />
      ))}
      <mesh geometry={nodes.Mesh002.geometry}   material={materials.crewneck_inside} />
      <mesh geometry={nodes.Mesh002_1.geometry} material={materials.sweatband} />
      <mesh geometry={nodes.Mesh002_2.geometry} material={materials.label} />
    </group>
  );
}

useGLTF.preload(MODEL_PATH);
