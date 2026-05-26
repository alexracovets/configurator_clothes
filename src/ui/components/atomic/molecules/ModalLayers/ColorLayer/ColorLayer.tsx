"use client";

import { useLayoutEffect, useRef } from "react";
import * as THREE from "three";

import { type PartGradient, type ShirtPart } from "@store";
import { useShirtMaterial } from "@hooks";
import type { PBRMaps } from "@types";

interface ColorLayerProps {
  part: ShirtPart;
  geometry: THREE.BufferGeometry;
  baseColorTexture: THREE.CanvasTexture;
  gradient: PartGradient;
  maps: PBRMaps;
  renderOrder?: number;
}

const meshRaycast = THREE.Mesh.prototype.raycast;

export const ColorLayer = ({
  part,
  geometry,
  baseColorTexture,
  gradient,
  maps,
  renderOrder = 0,
}: ColorLayerProps) => {
  const material = useShirtMaterial(baseColorTexture, maps, gradient, part);

  const meshRef = useRef<THREE.Mesh>(null);

  useLayoutEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    mesh.raycast = meshRaycast;
  }, []);

  return (
    <mesh
      ref={meshRef}
      name={part}
      geometry={geometry}
      material={material}
      renderOrder={renderOrder}
    />
  );
};
