"use client";

import { useMemo } from "react";
import { ThreeElements } from "@react-three/fiber";
import { useGLTF, useTexture } from "@react-three/drei";
import * as THREE from "three";

import { useColorStore, usePatternStore, useGradientStore } from "@store";
import type { ShirtPart, PartGradient } from "@store";
import { PatternLayer } from "../PatternLayer";
import { useSvgTexture } from "@hooks";

interface CrewneckGLTF {
  nodes: Record<string, THREE.Mesh>;
  materials: {
    crewneck_front: THREE.MeshStandardMaterial;
    crewneck_inside: THREE.MeshStandardMaterial;
    sweatband: THREE.MeshStandardMaterial;
    label: THREE.MeshStandardMaterial;
  };
}

const MODEL_PATH = "/models/pbr/crewneck.gltf";

const PART_MESHES: { node: string; part: ShirtPart }[] = [
  { node: "crewneck_front", part: "front" },
  { node: "crewneck_back", part: "back" },
  { node: "crewneck_sleeve_left", part: "sleeve_left" },
  { node: "crewneck_sleeve_right", part: "sleeve_right" },
  { node: "crewneck_collar", part: "collar" },
];

function useColorGradientTexture(
  gradient: PartGradient,
  baseColor: string,
): THREE.CanvasTexture {
  return useMemo(() => {
    const size = 1024;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d")!;

    ctx.fillStyle = baseColor;
    ctx.fillRect(0, 0, size, size);

    if (gradient.enabled) {
      const cx = size / 2;
      const cy = size / 2;
      const rad = (gradient.rotation * Math.PI) / 180;
      const dx = Math.cos(rad) * size;
      const dy = Math.sin(rad) * size;

      const grad = ctx.createLinearGradient(
        cx - dx / 2,
        cy - dy / 2,
        cx + dx / 2,
        cy + dy / 2,
      );

      const mid = gradient.position / 100;
      const half = (gradient.softness / 100) * 0.5;
      const start = Math.max(0, mid - half);
      const end = Math.min(1, Math.max(mid + half, start + 0.001));
      const a = gradient.opacity / 100;

      const c2 = new THREE.Color(gradient.color2);
      const r = Math.round(c2.r * 255);
      const g = Math.round(c2.g * 255);
      const b = Math.round(c2.b * 255);

      grad.addColorStop(0, `rgba(${r},${g},${b},0)`);
      grad.addColorStop(start, `rgba(${r},${g},${b},0)`);
      grad.addColorStop(end, `rgba(${r},${g},${b},${a})`);
      grad.addColorStop(1, `rgba(${r},${g},${b},${a})`);

      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, size, size);
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  }, [gradient, baseColor]);
}

function ShirtMesh({
  geometry,
  baseMaterial,
  baseColor,
  texture,
  patternOpacity,
  patternColor,
  gradient,
  normalMap,
  roughnessMap,
}: {
  geometry: THREE.BufferGeometry;
  baseMaterial: THREE.MeshStandardMaterial;
  baseColor: string;
  texture: THREE.Texture | null;
  patternOpacity: number;
  patternColor: string;
  gradient: PartGradient;
  normalMap: THREE.Texture;
  roughnessMap: THREE.Texture;
}) {
  const colorGradientTexture = useColorGradientTexture(gradient, baseColor);

  const mat = useMemo(() => {
    const m = baseMaterial.clone();
    m.color.set("#ffffff");
    m.map = colorGradientTexture;
    m.map.colorSpace = THREE.SRGBColorSpace;
    m.transparent = false;
    m.opacity = 1;
    m.roughness = 0.85;
    m.metalness = 0.0;
    m.normalMap = normalMap;
    m.normalScale.set(0.8, 0.8);
    m.roughnessMap = roughnessMap;
    m.needsUpdate = true;
    return m;
  }, [baseMaterial, colorGradientTexture, normalMap, roughnessMap]);

  return (
    <>
      <mesh geometry={geometry} material={mat} renderOrder={0} />
      {texture && (
        <PatternLayer
          geometry={geometry}
          texture={texture}
          patternOpacity={patternOpacity}
          patternColor={patternColor}
        />
      )}
    </>
  );
}

export function PDRTest(props: ThreeElements["group"]) {
  const { nodes, materials } = useGLTF(MODEL_PATH) as unknown as CrewneckGLTF;
  const { partColors } = useColorStore();
  const { partPatterns, patternOpacity, patternColor } = usePatternStore();
  const { partGradients } = useGradientStore();

  const normalMap = useTexture("/models/pbr/cotton_jersey_nor_gl.jpg");
  const roughnessMap = useTexture("/models/pbr/cotton_jersey_rough.jpg");

  useMemo(() => {
    for (const tex of [normalMap, roughnessMap]) {
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(6, 6);
      tex.needsUpdate = true;
    }
  }, [normalMap, roughnessMap]);

  const patternUrl = (partPatterns as Record<string, string>)["front"] || "";
  const texture = useSvgTexture(patternUrl);

  return (
    <group {...props} dispose={null}>
      {PART_MESHES.map(({ node, part }) => (
        <ShirtMesh
          key={part}
          geometry={nodes[node].geometry}
          baseMaterial={materials.crewneck_front}
          baseColor={(partColors as Record<string, string>)[part]}
          texture={texture}
          patternOpacity={patternOpacity}
          patternColor={patternColor}
          gradient={partGradients[part]}
          normalMap={normalMap}
          roughnessMap={roughnessMap}
        />
      ))}
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
